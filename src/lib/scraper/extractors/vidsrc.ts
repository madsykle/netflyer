import type { StreamInfo } from "../../embed";
import type { ExtractorContext, ProviderExtractor, ScrapeRequest } from "../types";

const API_BASE = "https://data.vidsrcme.ru/api.php";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const REFERER = "https://cloudorchestranova.com/";

function b64decode(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/**
 * Run the provider's per-window ChaCha20 wasm decryptor to turn the encrypted
 * `stream_urls` string into a list of master.m3u8 URLs. Mirrors the browser
 * `vsdec.js`: alloc(n) → copy bytes → decrypt(ptr, n) → plaintext at ptr+12
 * (after the 12-byte ChaCha20 nonce).
 */
async function decryptStreamUrls(encB64: string, wasmBytes: Uint8Array<ArrayBuffer>): Promise<string[]> {
  const mod = await WebAssembly.compile(wasmBytes);
  const inst = await WebAssembly.instantiate(mod, {});
  const ex = inst.exports as unknown as {
    memory: WebAssembly.Memory;
    alloc(len: number): number;
    decrypt(ptr: number, len: number): number;
  };
  const enc = b64decode(encB64);
  const ptr = ex.alloc(enc.length);
  new Uint8Array(ex.memory.buffer, ptr, enc.length).set(enc);
  const outLen = ex.decrypt(ptr, enc.length);
  const plain = new TextDecoder().decode(new Uint8Array(ex.memory.buffer, ptr + 12, outLen));
  return plain.split("\n").filter(Boolean);
}

/**
 * vidsrc lineage extractor — one module covers every live variant (vidsrc.to /
 * .in / .io / .me → vsembed.ru → cloudorchestranova.com → data.vidsrcme.ru).
 *
 * Chain (proved in .scratch/wayfinder-scraper/prototype-findings.md):
 *   api.php?type&imdb[&season&episode]&stream_urls → ChaCha20-encrypted
 *   stream_urls + vs.wasm_url → wasm decrypt → master.m3u8 URL(s).
 *
 * The CDN `?token=` JWT is IP-bound and rate-limited, so it is NOT minted here;
 * the returned `behaviorHints.tokenHost` tells the client to fetch
 * `{origin}/generate.php` itself and append `?token=` before playback (#8).
 */
export class VidsrcExtractor implements ProviderExtractor {
  key = "vidsrc";
  label = "Vidsrc (direct)";
  accepts = "imdb" as const;

  async extract(req: ScrapeRequest, ctx: ExtractorContext): Promise<StreamInfo[]> {
    let imdbId: string | null | undefined = req.imdbId;
    if (!imdbId && req.tmdbId) {
      imdbId = await ctx.resolveId("imdb", req.type, req.tmdbId);
    }
    if (!imdbId) return [];

    const q = new URLSearchParams({ type: req.type, imdb: imdbId });
    if (req.type === "tv") {
      q.set("season", String(req.season ?? 1));
      q.set("episode", String(req.episode ?? 1));
    }
    q.set("stream_urls", "");

    const res = await fetch(`${API_BASE}?${q.toString()}`, {
      headers: { "user-agent": UA, accept: "application/json", referer: REFERER },
    });
    if (!res.ok) return [];

    const j = (await res.json()) as {
      data?: { title?: string; stream_urls?: string | string[] };
      vs?: { wasm_url?: string };
    };
    if (!j?.data) return [];

    let urls: string[];
    if (typeof j.data.stream_urls === "string") {
      // protection enabled: decrypt via the per-window wasm
      if (!j.vs?.wasm_url) return [];
      const wasmRes = await fetch(j.vs.wasm_url, { headers: { "user-agent": UA } });
      if (!wasmRes.ok) return [];
      urls = await decryptStreamUrls(j.data.stream_urls, new Uint8Array(await wasmRes.arrayBuffer()));
    } else if (Array.isArray(j.data.stream_urls)) {
      // plain response — pass through unchanged
      urls = j.data.stream_urls;
    } else {
      return [];
    }

    const streams: StreamInfo[] = [];
    for (const url of urls) {
      let origin: string;
      try {
        origin = new URL(url).origin;
      } catch {
        continue; // malformed URL — skip
      }
      streams.push({
        title: j.data.title || "",
        url,
        quality: "auto",
        language: "en",
        provider: this.key,
        behaviorHints: {
          notWebReady: true,
          headers: { Referer: REFERER },
          tokenHost: `${origin}/generate.php`,
        },
      });
    }
    return streams;
  }
}
