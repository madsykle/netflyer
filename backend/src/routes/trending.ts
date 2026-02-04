import { Router, type Request, type Response, type NextFunction } from 'express';
import { tmdbService } from '../services/tmdb.js';
import { trendingCache } from '../cache/index.js';

const router = Router();

router.get('/trending', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'trending-all';
    const cached = trendingCache.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }

    const data = await tmdbService.getTrending('all', 'week', 1);
    trendingCache.set(cacheKey, data);
    res.setHeader('X-Cache', 'MISS');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/trending_movies', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'trending-movies';
    const cached = trendingCache.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }

    const data = await tmdbService.getTrendingMovies('week', 1);
    trendingCache.set(cacheKey, data);
    res.setHeader('X-Cache', 'MISS');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/trending_tv', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'trending-tv';
    const cached = trendingCache.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }

    const data = await tmdbService.getTrendingTV('week', 1);
    trendingCache.set(cacheKey, data);
    res.setHeader('X-Cache', 'MISS');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/airing_today', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'airing-today';
    const cached = trendingCache.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }

    const data = await tmdbService.getAiringToday(1);
    trendingCache.set(cacheKey, data);
    res.setHeader('X-Cache', 'MISS');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/popular', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'popular-movies';
    const cached = trendingCache.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }

    const data = await tmdbService.getPopularMovies(1);
    trendingCache.set(cacheKey, data);
    res.setHeader('X-Cache', 'MISS');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/anime', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'anime';
    const cached = trendingCache.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }

    const data = await tmdbService.getAnime(1);
    trendingCache.set(cacheKey, data);
    res.setHeader('X-Cache', 'MISS');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/weekly_trending', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'weekly-trending';
    const cached = trendingCache.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }

    const data = await tmdbService.getTrending('all', 'week', 1);
    trendingCache.set(cacheKey, data);
    res.setHeader('X-Cache', 'MISS');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
