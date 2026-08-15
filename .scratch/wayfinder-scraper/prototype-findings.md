# Wayfinder prototype findings: end-to-end vidsrc direct-link extraction (#7)

Prototype date: 2026-08-15 (live). Code: `prototype.mjs` (throwaway, single file).
Verdict: **YES — a direct, playable `.m3u8` is extractable over plain HTTP, no headless
browser, for both movie and TV.** The one step the research flagged as unsolved (the "CDN
token from the obfuscated player JS") turned out to be a simple per-host `/generate.php`
JWT endpoint — no challenge, no header/cookie spoofing required.

---

## The minimal chain (verified live, both movie + TV)

The research's 7-step vsembed → cloudorchestranova → player hop is **unnecessary**.
`data.vidsrcme.ru` serves everything with just a browser User-Agent:

```
1. GET data.vidsrcme.ru/api.php?type={movie|tv}&imdb={id}[&season={s}&episode={e}]&stream_urls
     → { data: { title, file_name, stream_urls: <b64 ChaCha20 nonce||ciphertext> },
         vs:  { w: <window>, wasm_url: "https://data.vidsrcme.ru/wasm.php?w=<w>&_=<ts>" } }

2. GET {wasm_url} → WebAssembly (~7 KB) exporting alloc(len) + decrypt(ptr,len)
     (plus unrelated exports: movie → stat/hash, tv → sync/info/meta — only alloc/decrypt matter)

3. Decrypt in Node (reproduces browser vsdec.js exactly):
     ptr = alloc(n); copy b64decoded bytes to memory[ptr..ptr+n]; outLen = decrypt(ptr, n);
     plaintext = utf8(memory[ptr+12 .. ptr+12+outLen])   // 12 = ChaCha20 nonce
     → newline-separated master.m3u8 URLs

4. GET {stream-origin}/generate.php → JWT (HS256), payload:
     { iss:"my-auth", iat, nbf, exp: iat+14400, ip_cidr: "<caller /64 IPv6 prefix>" }
     → IP-bound to the CALLER, ~4h TTL.

5. GET {master.m3u8}?token={JWT} → 200 (401 "no token" without it).
     The master playlist's variant URLs are already server-stamped with the same ?token=,
     so the whole HLS chain (variants + segments) is covered by one token.
```

## Verified results

| title | type | stream host | variants | master.m3u8 (with token) |
|---|---|---|---|---|
| The Shawshank Redemption (tt0111161) | movie | veldtvolition.website | 3 (640x358 / 1280x714 / 1920x1072) | **200** |
| Breaking Bad S01E01 (tt0903747) | tv | antilogarithm-atlas.site | 3 | **200** (after 429 cool-down) |

## Findings that reshape the map

1. **No "token reversal" needed.** The CDN auth is `{origin}/generate.php` returning a
   plain JWT, appended as `?token=`. No obfuscated-JS reversing, no cookie jar, no
   Cloudflare challenge. The 624 KB `bundle.js` is a static (cache-busted) player bundle
   and is irrelevant to extraction.
2. **The whole embed hop is skippable.** `api.php` + `wasm.php` are open (no referer, no
   cookie, no `vs=` token). The scraper needs only an **IMDb id** — but note the app keys
   providers by TMDB id today (`embed.ts` uses numeric ids), so a TMDB→IMDB mapping is
   required (already flagged as "not yet specified" on the map).
3. **Token is IP-bound AND rate-limited — so it must be resolved CLIENT-side.**
   - `ip_cidr` binds the JWT to the caller's `/64`. A token minted by the Vercel function
     is rejected when the browser (different IP) fetches the m3u8 → server-side minting is
     useless unless we proxy every segment (bandwidth-prohibitive on serverless).
   - `/generate.php` returns **429 on a second call within ~1 min** (per IP). The player
     itself fetches it once per host and caches it.
   - `access-control-allow-origin: *` means the browser can call `/generate.php` directly.
   ⇒ **Server resolves the master.m3u8 URL (IP-agnostic, ~24h expiry); the client fetches
   `{origin}/generate.php` and appends `?token=` before handing to hls.js.**
4. **Stream host rotates per title** (veldtvolition.website vs antilogarithm-atlas.site),
   and the CDN domain is not stable — never hardcode. The 3 variant URLs per title share
   one host, so one token fetch covers all qualities.
5. **Quality selection**: 3 `stream_urls` entries per title = 3 master playlists (same
   host). Each master lists its own renditions. We can offer all 3 as `StreamInfo`
   entries, or pick one and let the client's hls.js ABR choose.

## Implications per ticket

- **#6 scaffold**: route takes `{ type, tmdbId|imdbId, season?, episode? }`; engine core
  = normalize → fetch api.php → decrypt (wasm) → return `StreamInfo[]` with
  `behaviorHints: { notWebReady: true }` + a `tokenHost` field the client uses to mint the
  token. Redis cache the *resolved URLs* for 10–30 min (they expire ~24h); never cache or
  persist tokens (IP-bound, 4h).
- **#8 integration**: the player needs a new "resolve token client-side" step before
  loading a direct source — analogous to `loadStream` in the captured `player.js`
  (`fetchToken(origin+'/generate.php')` → `applyToken(url, token)` → `initHLS`). CSP
  `connect-src`/`media-src` must allow the rotating CDN domains (or a wildcard policy for
  the stream hosts).
- **#5 anti-bot**: nothing challenge-walled. In-scope surface shrinks to just a browser
  User-Agent on api.php/wasm.php. Cookie jar + header spoofing are NOT needed for the
  lineage. Keep them in the engine only as a generic fallback for future providers.

## Reproduce

```bash
cd .scratch/wayfinder-scraper
node prototype.mjs movie tt0111161
node prototype.mjs tv tt0903747 1 1
```

Live probe captures (ephemeral) are under `live/` (html/js/wasm + `decrypt.mjs`).
