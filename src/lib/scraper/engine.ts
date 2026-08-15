import type { StreamInfo } from "../embed";
import type { ExtractorContext, ProviderExtractor, ScrapeRequest, ScrapeResult } from "./types";

/**
 * Pluggable multi-provider engine core (fetch → parse → extract pipeline).
 *
 * The engine owns orchestration only: it runs registered extractors in order,
 * aggregates their `StreamInfo` output, and records per-provider diagnostics.
 * Each provider's actual network/parse/decrypt work lives in its own extractor
 * module behind the `ProviderExtractor` interface (see ./types.ts), so the
 * vidsrc lineage (and future providers) plug in without touching this core.
 */
export class ScrapeEngine {
  private extractors: ProviderExtractor[] = [];

  register(extractor: ProviderExtractor): this {
    this.extractors.push(extractor);
    return this;
  }

  private createContext(): ExtractorContext {
    return {
      // TMDB→IMDB mapping is a follow-on (map "not yet specified"). Until it
      // lands, extractors must be handed the id they need (imdbId) up front.
      resolveId: async (_kind, _type, _tmdbId) => null,
    };
  }

  async extract(req: ScrapeRequest): Promise<ScrapeResult> {
    const ctx = this.createContext();
    const attempts: ScrapeResult["attempts"] = [];
    const streams: StreamInfo[] = [];

    for (const ex of this.extractors) {
      try {
        const found = await ex.extract(req, ctx);
        attempts.push({ provider: ex.key, count: found.length, ok: true });
        streams.push(...found);
        // Best-source first: stop at the first provider that yields a stream.
        // (resolve-all vs resolve-on-demand is the #8 integration decision; this
        // default keeps a single provider's results as the automatic best source.)
        if (found.length > 0) break;
      } catch (err) {
        console.error(`[scraper] ${ex.key} failed:`, err);
        attempts.push({ provider: ex.key, count: 0, ok: false });
      }
    }

    return { streams, attempts };
  }
}
