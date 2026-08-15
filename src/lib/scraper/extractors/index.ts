import type { ProviderExtractor } from "../types";

/**
 * Provider extractor registry.
 *
 * Empty for now — the engine core + route shell land first (#6), and the
 * vidsrc lineage extractor plugs in next using the prototype findings (#7).
 * To wire a provider, instantiate it here:
 *
 *   return [new VidsrcExtractor(), ...];
 *
 * The vidsrc extractor implements the chain proved in
 * `.scratch/wayfinder-scraper/prototype-findings.md`:
 *   api.php?type&imdb[&season&episode]&stream_urls → wasm ChaCha20 decrypt →
 *   master.m3u8 URL(s). The CDN `?token=` JWT is minted client-side (#8).
 */
export function createExtractors(): ProviderExtractor[] {
  return [];
}
