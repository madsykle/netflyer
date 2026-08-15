import type { ProviderExtractor } from "../types";
import { VidsrcExtractor } from "./vidsrc";

/**
 * Provider extractor registry, in best-source-first order. The engine runs
 * these in order and stops at the first that yields streams.
 *
 * The vidsrc lineage extractor implements the chain proved in
 * `.scratch/wayfinder-scraper/prototype-findings.md` (#7). Add future providers
 * here as they land (e.g. `new SomeOtherExtractor()`).
 */
export function createExtractors(): ProviderExtractor[] {
  return [new VidsrcExtractor()];
}
