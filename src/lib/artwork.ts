import { env } from "./env";
import { redis } from "./redis";
import type { ContentType } from "../types/tmdb";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const CACHE_TTL = 60 * 60 * 24;

export interface ArtworkResult {
  poster: string | null;
  backdrop: string | null;
}

interface FanartBackground {
  url?: string;
  likes?: string | number;
}

interface FanartResponse {
  backgrounds?: FanartBackground[];
}

function cacheKey(type: ContentType, id: number) {
  return `artwork:${type}:${id}`;
}

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: CACHE_TTL },
    });
    if (!response.ok) return null;
    return await response.json() as T;
  } catch {
    return null;
  }
}

function bestBackgrounds(backgrounds: FanartBackground[] = []) {
  return [...backgrounds]
    .filter((background) => background.url)
    .sort((a, b) => Number(b.likes ?? 0) - Number(a.likes ?? 0))
    .map((background) => background.url as string);
}

export async function resolveArtwork(type: ContentType, id: number): Promise<ArtworkResult> {
  const key = cacheKey(type, id);

  try {
    const cached = await redis.get<ArtworkResult>(key);
    if (cached) return cached;
  } catch {
    // Artwork remains best-effort when Redis is unavailable.
  }

  const details = await getJson<{
    imdb_id?: string | null;
    external_ids?: { imdb_id?: string | null; tvdb_id?: number | null };
    backdrop_path?: string | null;
  }>(
    `${TMDB_BASE_URL}/${type}/${id}?api_key=${encodeURIComponent(env.TMDB_API_KEY)}&append_to_response=external_ids`,
  );

  const imdbId = details?.imdb_id ?? details?.external_ids?.imdb_id ?? null;
  const tvdbId = details?.external_ids?.tvdb_id ?? null;
  const poster = imdbId
    ? `https://btttr.cc/poster-a/imdb/poster-default/${encodeURIComponent(imdbId)}.jpg`
    : null;

  let backdrop: string | null = null;
  if (env.FANART_API_KEY) {
    const fanartId = type === "tv" ? tvdbId : id;
    if (fanartId) {
      const fanart = await getJson<FanartResponse>(
        `https://webservice.fanart.tv/v3/${type === "tv" ? "tv" : "movies"}/${fanartId}?api_key=${encodeURIComponent(env.FANART_API_KEY)}`,
      );
      backdrop = bestBackgrounds(fanart?.backgrounds)[0] ?? null;
    }
  }

  const result = { poster, backdrop } satisfies ArtworkResult;
  try {
    await redis.set(key, result, { ex: CACHE_TTL });
  } catch {
    // Caching is an optimization, not a requirement for rendering.
  }
  return result;
}
