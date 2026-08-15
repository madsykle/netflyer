import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit, isOriginAllowed } from "../../../lib/api-guard";
import { redis } from "../../../lib/redis";
import { ScrapeEngine } from "../../../lib/scraper/engine";
import { createExtractors } from "../../../lib/scraper/extractors";
import type { ScrapeRequest } from "../../../lib/scraper/types";
import type { ContentType } from "../../../types/tmdb";

// Cache TTLs (seconds). Fresh window sits inside the map's 10–30 min range;
// the stale window is the grace period for stale-if-error fallback.
const FRESH_TTL = 20 * 60; // 20 min
const STALE_TTL = 24 * 60 * 60; // 24 h
const RATE_LIMIT = 30;
const RATE_LIMIT_WINDOW = 60;

const engine = new ScrapeEngine();
for (const ex of createExtractors()) engine.register(ex);

interface CacheEntry {
  t: number;
  v: object;
}

function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

/** Build a stable cache key from validated inputs. */
function cacheKey(req: ScrapeRequest): string {
  return [
    "stream",
    req.type,
    req.tmdbId || req.imdbId || "",
    req.season ?? "",
    req.episode ?? "",
    req.quality ?? "",
  ].join(":");
}

async function readCache(key: string): Promise<CacheEntry | null> {
  try {
    const raw = await redis.get<string>(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.t === "number" && "v" in parsed) return parsed as CacheEntry;
  } catch (err) {
    console.error("Redis Cache Get Error:", err);
  }
  return null;
}

async function writeCache(key: string, value: object): Promise<void> {
  try {
    await redis.set(key, JSON.stringify({ t: Date.now(), v: value }), { ex: STALE_TTL });
  } catch (err) {
    console.error("Redis Cache Set Error:", err);
  }
}

export async function GET(request: NextRequest) {
  // 1. Origin validation (exact hostname match, prevents substring bypass)
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!isOriginAllowed(origin, host)) {
    return NextResponse.json({ error: "Unauthorized origin" }, { status: 403 });
  }

  // 2. Composite-fingerprint rate limiting
  const limited = await enforceRateLimit(request, {
    prefix: "stream",
    limit: RATE_LIMIT,
    window: RATE_LIMIT_WINDOW,
  });
  if (limited) return limited;

  // 3. Validate inputs (also constrains the cache key against abuse)
  const sp = request.nextUrl.searchParams;
  const type = sp.get("type");
  const tmdbId = sp.get("id");
  const imdbId = sp.get("imdbId") ?? undefined;
  const season = sp.get("season");
  const episode = sp.get("episode");
  const quality = sp.get("quality") ?? undefined;

  if (type !== "movie" && type !== "tv") {
    return badRequest("type must be 'movie' or 'tv'");
  }
  if (!tmdbId && !imdbId) {
    return badRequest("id (TMDB) or imdbId is required");
  }
  if (tmdbId && !/^\d{1,9}$/.test(tmdbId)) {
    return badRequest("id must be a numeric TMDB id");
  }
  if (imdbId && !/^tt\d{6,9}$/i.test(imdbId)) {
    return badRequest("imdbId must look like tt1234567");
  }
  let seasonNum: number | undefined;
  let episodeNum: number | undefined;
  if (type === "tv") {
    seasonNum = season ? Number(season) : 1;
    episodeNum = episode ? Number(episode) : 1;
    if (!Number.isInteger(seasonNum) || !Number.isInteger(episodeNum) || seasonNum < 1 || episodeNum < 1) {
      return badRequest("season and episode must be positive integers");
    }
  }

  const req: ScrapeRequest = {
    type: type as ContentType,
    tmdbId: tmdbId ?? undefined,
    imdbId: imdbId ? imdbId.toUpperCase() : undefined,
    season: seasonNum,
    episode: episodeNum,
    quality,
  };

  const key = cacheKey(req);

  // 4. Cache: serve fresh, else resolve and fall back to stale on failure
  const cached = await readCache(key);
  if (cached && Date.now() - cached.t < FRESH_TTL * 1000) {
    return NextResponse.json(cached.v, { status: 200, headers: { "X-Cache": "HIT" } });
  }

  try {
    const result = await engine.extract(req);
    const body = {
      success: result.streams.length > 0,
      type: req.type,
      tmdbId: req.tmdbId ?? null,
      imdbId: req.imdbId ?? null,
      count: result.streams.length,
      streams: result.streams,
      attempts: result.attempts,
    };
    await writeCache(key, body);
    return NextResponse.json(body, { status: 200, headers: { "X-Cache": "MISS" } });
  } catch (err) {
    console.error("Scraper Error:", err);
    // stale-if-error: serve the last known-good (now-expired) value if present
    if (cached) {
      return NextResponse.json(cached.v, { status: 200, headers: { "X-Cache": "STALE" } });
    }
    return NextResponse.json({ error: "Failed to resolve stream" }, { status: 502 });
  }
}
