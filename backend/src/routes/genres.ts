import { Router, type Request, type Response, type NextFunction } from 'express';
import { tmdbService } from '../services/tmdb.js';
import { discoverCache } from '../cache/index.js';

const router = Router();

router.get('/genres', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'genres';
    const cached = discoverCache.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }

    const data = await tmdbService.getGenres();

    discoverCache.set(cacheKey, data);
    res.setHeader('X-Cache', 'MISS');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
