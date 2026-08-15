import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit, isOriginAllowed } from "../../../../lib/api-guard";
import { safeFetchUrl } from "../../../../lib/ssrf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The vidsrc CDN gates content with two independent checks:
//   1. Playlists (master/index .m3u8) require a short-lived JWT minted at
//      {origin}/generate.php. The JWT is IP-bound (ip_cidr = the minting
//      host's /64) AND rate-limited to ~1 mint/min/IP. Serverless invocations
//      egress from rotating IPs, so a token is only valid from the IP that
//      minted it — it must be minted and consumed in the SAME invocation and
//      can never be cached across requests.
//   2. Media segments are Origin-locked (403 unless Origin is absent or the
//      CDN's own player host). A server-side fetch sends no Origin, so
//      segments pass with NO token at all.
//
// Strategy: fetch a URL bare (no Origin/Referer); if the CDN rejects it
// (401/403), mint a fresh token and retry once; rewrite playlist URIs back
// through this proxy so every child fetch follows the same path.

const RATE_LIMIT = 300;
const RATE_LIMIT_WINDOW = 60;
const MAX_URL_LENGTH = 2048;
const MAX_BODY_BYTES = 32 * 1024 * 1024;
const MINT_ATTEMPTS = 3;
const MAX_REDIRECTS = 3;

const BROWSER_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Mint a fresh IP-bound play token. Must be consumed by the same invocation. */
async function mintToken(host: string): Promise<string | null> {
  for (let attempt = 0; attempt < MINT_ATTEMPTS; attempt++) {
    try {
      const { response: res } = await fetchUpstream(new URL(`${host}/generate.php`));
      if (res.ok) {
        const token = (await res.text()).trim();
        if (token && token.length <= 4096) return token;
      }
      if (res.status === 429) {
        // Rate-limited: brief backoff. The window is ~1min, but a short wait
        // still helps when the limiter is per-second rather than the hard cap.
        await sleep(500 * (attempt + 1));
        continue;
      }
      return null;
    } catch (err) {
      console.error("Proxy token mint error:", err);
      return null;
    }
  }
  return null;
}

/** Strip the token param (playlists stamp child URLs with a token that is
 *  IP-bound to a different host and unusable; segments need none). */
function withoutToken(target: URL): URL {
  const u = new URL(target.toString());
  u.searchParams.delete("token");
  return u;
}

function withToken(target: URL, token: string): URL {
  const u = withoutToken(target);
  u.searchParams.set("token", token);
  return u;
}

/** Limit this public relay to HLS playlists and media-like child resources. */
function isProxyableMediaUrl(target: URL): boolean {
  const path = target.pathname.toLowerCase();
  return path.endsWith(".m3u8") || path.includes("/content/") ||
    /\\.(?:ts|m4s|mp4|aac|mp3|html|key)$/.test(path);
}

/** A response plus the URL reached after validated redirects. */
interface UpstreamResult {
  response: Response;
  finalUrl: URL;
}

/**
 * Fetch upstream with manually validated redirects. Native `redirect: follow`
 * would allow an upstream redirect to bypass the initial SSRF validation.
 */
async function fetchUpstream(url: URL, range?: string | null): Promise<UpstreamResult> {
  const headers: Record<string, string> = { "user-agent": BROWSER_UA };
  if (range) headers.range = range;
  let current = url;

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect++) {
    try {
      const response = await fetch(current.toString(), {
        headers,
        redirect: "manual",
        cache: "no-store",
      });
      const isRedirect = response.status >= 300 && response.status < 400;
      if (!isRedirect) return { response, finalUrl: current };

      const location = response.headers.get("location");
      if (!location || redirect === MAX_REDIRECTS) {
        return { response: new Response("Upstream redirect limit exceeded", { status: 502 }), finalUrl: current };
      }
      const next = await safeFetchUrl(new URL(location, current).toString());
      if (!next || !isProxyableMediaUrl(next)) {
        return { response: new Response("Disallowed upstream redirect", { status: 502 }), finalUrl: current };
      }
      current = next;
    } catch (err) {
      console.error("Proxy upstream fetch error:", err);
      return { response: new Response(null, { status: 502 }), finalUrl: current };
    }
  }

  return { response: new Response(null, { status: 502 }), finalUrl: current };
}

/** Rewrite a playlist body so every URI routes back through this proxy. */
function rewritePlaylist(body: string, base: string, proxyBase: string): string {
  const baseUrl = new URL(base);
  const lines = body.split("\n");
  const out: string[] = [];

  const proxyify = (raw: string): string => {
    const abs = new URL(raw, baseUrl);
    // Drop the IP-bound token the CDN stamped onto child URLs — the proxy
    // re-mints (or omits) it itself, and this keeps cache keys stable.
    abs.searchParams.delete("token");
    const enc = encodeURIComponent(abs.toString());
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
      const mapMatch = trimmed.match(/^(#EXT-X-MAP:URI=")([^"]+)(\".*)$/);
      const keyMatch = trimmed.match(/^(#EXT-X-KEY:[^"]*URI=")([^"]+)(\".*)$/);
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
  if (!target || !isProxyableMediaUrl(target)) {
    return NextResponse.json({ error: "Disallowed media url" }, { status: 400 });
  }

  const bare = withoutToken(target);
  const range = request.headers.get("range");

  // Fetch bare first: segments need no token, and playlists reject us (401)
  // so we only mint when actually required — sparing the 1/min rate limit.
  let upstreamResult = await fetchUpstream(bare, range);
  let upstream = upstreamResult.response;
  if (upstream.status === 401 || upstream.status === 403) {
    const token = await mintToken(bare.origin);
    if (!token) {
      return NextResponse.json({ error: "Could not mint stream token" }, { status: 502 });
    }
    upstreamResult = await fetchUpstream(withToken(bare, token), range);
    upstream = upstreamResult.response;
  }

  if (!upstream.ok) {
    // Relay the real failure rather than masking it as a 200 with an error body.
    return new NextResponse(await upstream.text(), { status: upstream.status });
  }

  const contentLength = Number(upstream.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Upstream media response is too large" }, { status: 413 });
  }

  const body = await upstream.arrayBuffer();
  const text = new TextDecoder().decode(body);

  // Playlists start with #EXTM3U — rewrite their URIs; everything else is a
  // binary media segment, relayed as-is.
  if (text.startsWith("#EXTM3U")) {
    // Use same-origin relative URLs. Never trust forwarded host headers when
    // generating links, otherwise an attacker could turn this into a redirect
    // or cache-poisoning primitive.
    const rewritten = rewritePlaylist(text, upstreamResult.finalUrl.toString(), "");
    return new NextResponse(rewritten, {
      status: 200,
      headers: {
        "content-type": "application/vnd.apple.mpegurl",
        "cache-control": "no-store",
      },
    });
  }

  const isPartial = upstream.status === 206;
  const headers: Record<string, string> = {
    "content-type":
      upstream.headers.get("content-type") || "application/octet-stream",
    "accept-ranges": "bytes",
  };

  if (isPartial) {
    // Range responses are request-specific — never CDN-cache them.
    headers["cache-control"] = "no-store";
    const contentRange = upstream.headers.get("content-range");
    if (contentRange) headers["content-range"] = contentRange;
  } else {
    // Segments are content-addressed (the path embeds a content hash), so they
    // are immutable. Cache hard at the CDN edge so repeat viewers hit Vercel's
    // cache instead of our server + the upstream CDN.
    headers["cache-control"] = "public, max-age=31536000, s-maxage=31536000, immutable";
    headers["CDN-Cache-Control"] = "public, max-age=31536000, immutable";
  }

  return new NextResponse(body, { status: upstream.status, headers });
}
