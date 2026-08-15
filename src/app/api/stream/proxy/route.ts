import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit, isOriginAllowed } from "../../../../lib/api-guard";
import { redis } from "../../../../lib/redis";
import { safeFetchUrl } from "../../../../lib/ssrf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The vidsrc CDN serves media segments with an Origin allowlist (only the
// player's own host, or a request with no Origin header at all). Browsers
// always send our app's Origin on cross-origin fetches, so segments 403 and
// the stream stalls. This proxy fetches playlists + segments server-side
// (no Origin), rewrites playlist URIs to route back through here, and relays
// bytes to the client.

// Token cache TTL. The JWT from generate.php is short-lived (exp-iat ≈ 4h)
// and rate-limited to ~1 mint/min, so cache it per host and reuse.
const TOKEN_TTL = 3.5 * 60 * 60; // 3.5h, with margin under the ~4h expiry
const RATE_LIMIT = 300;
const RATE_LIMIT_WINDOW = 60;
const MAX_URL_LENGTH = 2048;

const BROWSER_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";

/** Fetch (and cache) the play token for a given stream host. */
async function getToken(host: string): Promise<string | null> {
  const key = `streamtoken:${host}`;
  try {
    const cached = await redis.get<string>(key);
    if (cached) return cached;
  } catch (err) {
    console.error("Proxy token cache get error:", err);
  }

  try {
    const res = await fetch(`${host}/generate.php`, {
      headers: { "user-agent": BROWSER_UA },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const token = (await res.text()).trim();
    if (!token) return null;
    await redis.set(key, token, { ex: TOKEN_TTL }).catch(() => {});
    return token;
  } catch (err) {
    console.error("Proxy token mint error:", err);
    return null;
  }
}

/** Strip an existing token query param and append a fresh one. */
function withToken(target: URL, token: string): URL {
  const u = new URL(target.toString());
  u.searchParams.delete("token");
  u.searchParams.set("token", token);
  return u;
}

/** Rewrite a playlist body so every URI routes back through this proxy. */
function rewritePlaylist(body: string, base: string, proxyBase: string): string {
  const baseUrl = new URL(base);
  const lines = body.split("\n");
  const out: string[] = [];

  const proxyify = (raw: string): string => {
    const abs = new URL(raw, baseUrl).toString();
    const enc = encodeURIComponent(abs);
    return `${proxyBase}/api/stream/proxy?url=${enc}`;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") {
      out.push(line);
      continue;
    }
    if (trimmed.startsWith("#")) {
      // Rewrite URIs embedded in MAP/KEY directives when present.
      const mapMatch = trimmed.match(/^(#EXT-X-MAP:URI=")([^"]+)(".*)$/);
      const keyMatch = trimmed.match(/^(#EXT-X-KEY:[^"]*URI=")([^"]+)(".*)$/);
      if (mapMatch) {
        out.push(`${mapMatch[1]}${proxyify(mapMatch[2])}${mapMatch[3]}`);
      } else if (keyMatch) {
        out.push(`${keyMatch[1]}${proxyify(keyMatch[2])}${keyMatch[3]}`);
      } else {
        out.push(line);
      }
      continue;
    }
    // Plain URI line (variant or segment reference).
    out.push(proxyify(trimmed));
  }

  return out.join("\n");
}

function decodeBody(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf);
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!isOriginAllowed(origin, host)) {
    return NextResponse.json({ error: "Unauthorized origin" }, { status: 403 });
  }

  const limited = await enforceRateLimit(request, {
    prefix: "stream-proxy",
    limit: RATE_LIMIT,
    window: RATE_LIMIT_WINDOW,
  });
  if (limited) return limited;

  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl || rawUrl.length > MAX_URL_LENGTH) {
    return NextResponse.json({ error: "Missing or oversized url param" }, { status: 400 });
  }

  const target = await safeFetchUrl(rawUrl);
  if (!target) {
    return NextResponse.json({ error: "Disallowed url" }, { status: 400 });
  }

  // Mint (or reuse) the IP-bound play token for this stream host.
  const tokenHost = target.origin;
  const token = await getToken(tokenHost);
  if (!token) {
    return NextResponse.json({ error: "Could not mint stream token" }, { status: 502 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(withToken(target, token).toString(), {
      headers: { "user-agent": BROWSER_UA },
      redirect: "follow",
      cache: "no-store",
    });
  } catch (err) {
    console.error("Proxy upstream fetch error:", err);
    return NextResponse.json({ error: "Upstream fetch failed" }, { status: 502 });
  }

  const body = await upstream.arrayBuffer();
  const text = decodeBody(body);

  // Playlists start with #EXTM3U — rewrite their URIs; everything else is a
  // binary media segment, relayed as-is.
  if (text.startsWith("#EXTM3U")) {
    const proxyBase = `https://${request.headers.get("x-forwarded-host") || host}`;
    const rewritten = rewritePlaylist(text, target.toString(), proxyBase);
    return new NextResponse(rewritten, {
      status: 200,
      headers: {
        "content-type": "application/vnd.apple.mpegurl",
        "cache-control": "no-store",
        "access-control-allow-origin": "*",
      },
    });
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type":
        upstream.headers.get("content-type") || "application/octet-stream",
      "cache-control": "public, max-age=14400",
      "access-control-allow-origin": "*",
    },
  });
}
