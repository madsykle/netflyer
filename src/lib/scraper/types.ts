import type { ContentType } from "../../types/tmdb";
import type { StreamInfo } from "../embed";

/** What a client asks the scraper to resolve into direct streams. */
export interface ScrapeRequest {
  type: ContentType;
  /** TMDB numeric id — what the app keys providers by today. */
  tmdbId?: string;
  /** IMDb id (e.g. "tt0111161") — what the vidsrc lineage keys on. */
  imdbId?: string;
  /** TV only. */
  season?: number;
  episode?: number;
  /** Preferred quality hint; "auto" (or unset) means provider decides. */
  quality?: string;
}

/** Facilities the engine exposes to an extractor while it runs. */
export interface ExtractorContext {
  /**
   * Resolve an identifier kind the extractor lacks (e.g. IMDb id from a TMDB
   * id). The TMDB→IMDB mapping is a follow-on on the map; until wired this
   * resolves to null and extractors should be passed their required id up front.
   */
  resolveId(kind: "imdb", type: ContentType, tmdbId: string): Promise<string | null>;
}

/**
 * A single provider's extraction module. Stateless — one instance per provider
 * lineage, keyed by a stable string. The engine calls extractors in registry
 * order and stops at the first that returns streams ("best-source first").
 */
export interface ProviderExtractor {
  /** Stable key, e.g. "vidsrc". */
  key: string;
  /** Human label for logging / responses, e.g. "Vidsrc (direct)". */
  label: string;
  /**
   * Which id kind this extractor consumes. The vidsrc lineage keys on IMDb id,
   * so its extractor declares "imdb".
   */
  accepts: "imdb" | "tmdb";
  /**
   * Resolve direct streams for the request. Return [] when the provider is
   * dead, geo-blocked, challenge-walled, or has no source — the engine treats
   * an empty array as "try the next provider".
   *
   * Output must use the `StreamInfo` shape from `src/lib/embed.ts`. Direct
   * sources set `behaviorHints.notWebReady = true`. Note (see #8): the vidsrc
   * lineage mints its CDN token client-side via `{origin}/generate.php` — the
   * JWT is IP-bound and rate-limited, so it must NOT be resolved here.
   */
  extract(req: ScrapeRequest, ctx: ExtractorContext): Promise<StreamInfo[]>;
}

/** Result of a multi-provider scrape, including per-provider diagnostics. */
export interface ScrapeResult {
  streams: StreamInfo[];
  attempts: { provider: string; count: number; ok: boolean }[];
}
