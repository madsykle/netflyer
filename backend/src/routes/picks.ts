import { Router, type Request, type Response, type NextFunction } from 'express';
import { tmdbService } from '../services/tmdb.js';
import { movieCache, tvCache } from '../cache/index.js';
import type { DeveloperPick, MovieDetails, TVShowDetails } from '../types/index.js';

const router = Router();

const developerPicks: DeveloperPick[] = [
  { id: 503919, type: 'movie' },
  { id: 244786, type: 'movie' },
  { id: 670, type: 'movie' },
  { id: 46648, type: 'tv' },
  { id: 62560, type: 'tv' },
];

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'developer-picks';
    const movieCached = movieCache.get(cacheKey);
    const tvCached = tvCache.get(cacheKey);

    if (movieCached && tvCached) {
      const picks = [...(Array.isArray(movieCached) ? movieCached : [movieCached]), ...(Array.isArray(tvCached) ? tvCached : [tvCached])];
      res.setHeader('X-Cache', 'HIT');
      res.json({ picks: picks.filter(Boolean) });
      return;
    }

    const results = await Promise.all(
      developerPicks.map(async (pick) => {
        try {
          const cache = pick.type === 'movie' ? movieCache : tvCache;
          const pickCacheKey = `${pick.type}:${pick.id}`;
          const cached = cache.get(pickCacheKey);

          if (cached) {
            return cached;
          }

          const data = await tmdbService.getContentDetails(pick.type, pick.id);
          if (pick.type === 'movie') {
            movieCache.set(pickCacheKey, data as MovieDetails);
          } else {
            tvCache.set(pickCacheKey, data as TVShowDetails);
          }
          return data;
        } catch {
          return null;
        }
      })
    );

    const validResults = results.filter((r): r is MovieDetails | TVShowDetails => r !== null);
    res.setHeader('X-Cache', 'MISS');
    res.json({ picks: validResults });
  } catch (error) {
    next(error);
  }
});

export default router;
