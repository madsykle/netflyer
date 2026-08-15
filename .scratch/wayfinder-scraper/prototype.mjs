#!/usr/bin/env node
/**
 * PROTOTYPE — throwaway. Proves the vidsrc lineage can be scraped end-to-end
 * over plain HTTP (no headless browser) into a playable direct .m3u8.
 *
 * Ref: wayfinder map netflyer#4, ticket #7.
 *
 * Usage:
 *   node prototype.mjs movie tt0111161
 *   node prototype.mjs tv tt0903747 1 1
 *
 * Output: StreamInfo-shaped result (url, quality list, provider, behaviorHints).
 *
 * Chain discovered 2026-08-15 (live):
 *   1. data.vidsrcme.ru/api.php?type={movie|tv}&imdb={id}[&season&episode]&stream_urls
 *        -> JSON { data.stream_urls: <b64 ChaCha20 nonce||ciphertext>, vs: { w, wasm_url } }
 *   2. data.vidsrcme.ru/wasm.php?w={window} -> wasm exporting alloc(len)+decrypt(ptr,len)
 *   3. decrypt stream_urls -> newline-separated master.m3u8 URLs
 *   4. {stream-origin}/generate.php -> JWT (IP-bound, ~4h TTL)
 *   5. {master.m3u8}?token={JWT} -> 200; variants already token-stamped
 */

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const API = 'https://data.vidsrcme.ru/api.php';

function die(msg) {
  console.error(msg);
  process.exit(1);
}

async function fetchJson(url, referer) {
  const res = await fetch(url, {
    headers: { 'user-agent': UA, accept: 'application/json', ...(referer ? { referer } : {}) },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

function b64(s) {
  return new Uint8Array(Buffer.from(s, 'base64'));
}

// Reproduces the browser vsdec.js wasm decrypt in Node.
async function decryptStreamUrls(encB64, wasmBytes) {
  const mod = await WebAssembly.compile(wasmBytes);
  const inst = await WebAssembly.instantiate(mod, {});
  const ex = inst.exports;
  const enc = b64(encB64);
  const ptr = ex.alloc(enc.length);
  new Uint8Array(ex.memory.buffer, ptr, enc.length).set(enc);
  const outLen = ex.decrypt(ptr, enc.length);
  const plain = new TextDecoder().decode(new Uint8Array(ex.memory.buffer, ptr + 12, outLen));
  return plain.split('\n').filter(Boolean);
}

async function getToken(origin) {
  const res = await fetch(origin + '/generate.php', { headers: { 'user-agent': UA } });
  if (!res.ok) return '';
  return (await res.text()).trim();
}

async function main() {
  const [, , type, id, season, episode] = process.argv;
  if (!type || !id) die('usage: node prototype.mjs <movie|tv> <imdbId> [season episode]');

  // 1. stream_urls
  const q = new URLSearchParams({ type, imdb: id, ...(type === 'tv' ? { season, episode } : {}), stream_urls: '' });
  const j = await fetchJson(`${API}?${q}`, 'https://cloudorchestranova.com/');
  if (!j?.vs?.wasm_url || typeof j?.data?.stream_urls !== 'string') {
    die('unexpected api.php shape (stream_urls not encrypted-string) — see: ' + JSON.stringify(j).slice(0, 300));
  }

  // 2. wasm
  const wasmRes = await fetch(j.vs.wasm_url, { headers: { 'user-agent': UA } });
  if (!wasmRes.ok) throw new Error(`wasm fetch ${wasmRes.status}`);
  const wasmBytes = new Uint8Array(await wasmRes.arrayBuffer());

  // 3. decrypt
  const urls = await decryptStreamUrls(j.data.stream_urls, wasmBytes);

  // 4. token per ORIGIN (player fetches once per host; /generate.php 429s on repeat).
  // NOTE: the JWT is IP-bound (ip_cidr) — resolved here from THIS process's IP only
  // to prove the chain; in production the browser must fetch it itself.
  const tokenCache = {};
  const tokenFor = async (origin) => {
    if (!(origin in tokenCache)) tokenCache[origin] = await getToken(origin);
    return tokenCache[origin];
  };

  // 5. validate each host (token + master.m3u8 -> 200)
  const out = [];
  for (const url of urls) {
    const u = new URL(url);
    const origin = u.protocol + '//' + u.host;
    const token = await tokenFor(origin);
    const playable = token ? `${url}?token=${token}` : url;
    const check = await fetch(playable, { headers: { 'user-agent': UA, referer: 'https://cloudorchestranova.com/' } });
    out.push({
      url,
      origin,
      token: token ? token.slice(0, 30) + '…' : '(none)',
      httpStatus: check.status,
      playable: check.ok,
      behaviorHints: {
        notWebReady: true,
        headers: { Referer: 'https://cloudorchestranova.com/' },
        // The ?token= JWT is IP-bound AND /generate.php rate-limits (1/window),
        // so the CLIENT must call {origin}/generate.php itself (CORS: *).
        tokenHost: origin + '/generate.php',
      },
    });
  }

  console.log(JSON.stringify(
    {
      title: j.data.title,
      type,
      imdbId: id,
      season: type === 'tv' ? season : undefined,
      episode: type === 'tv' ? episode : undefined,
      provider: 'vidsrc-embed.ru (vidsrc lineage)',
      window: j.vs.w,
      streams: out,
    },
    null,
    2
  ));
}

main().catch((e) => die(e.message));
