import type { MovieDetails, TVShowDetails } from "../../types/tmdb";
import { tmdbService } from "../tmdb";
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
      // Resolve an IMDb id from a TMDB id via the existing server-side TMDB
      // service (movie.imdb_id / tv.external_ids.imdb_id). This settles the
      // map's open TMDB→IMDB question: providers keyed on IMDb are handed the
      // id up front, and the route's Redis cache + tmdbService memory cache
      // absorb repeat lookups.
      resolveId: async (kind, type, tmdbId) => {
        if (kind !== "imdb") return null;
        try {
          const details = await tmdbService.getContentDetails(type, parseInt(tmdbId, 10));
          if (type === "movie") {
            return (details as MovieDetails).imdb_id ?? null;
          }
          return (details as TVShowDetails).external_ids?.imdb_id ?? null;
        } catch (err) {
          console.error("[scraper] resolveId(imdb) failed:", err);
          return null;
        }
      },
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
