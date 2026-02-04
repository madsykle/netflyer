import { Router, type Request, type Response, type NextFunction } from 'express';
import { tmdbService } from '../services/tmdb.js';
import { searchCache } from '../cache/index.js';
import { ValidationError } from '../errors/index.js';
import { sanitizeString, validatePage } from '../middleware/validation.js';
import { searchRateLimit } from '../middleware/rateLimit.js';

const router = Router();

router.get('/:query', searchRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.params;
    const { type, page = '1' } = req.query;

    if (!query || typeof query !== 'string') {
      next(new ValidationError('Search query is required'));
      return;
    }

    const sanitizedQuery = sanitizeString(query);
    if (sanitizedQuery.length === 0 || sanitizedQuery.length > 100) {
      next(new ValidationError('Invalid search query length'));
      return;
    }

    const pageNum = parseInt(page as string) || 1;
    if (!validatePage(pageNum)) {
      next(new ValidationError('Invalid page parameter'));
      return;
    }

    const searchType = type === 'movie' || type === 'tv' ? type : 'multi';
    const cacheKey = `${searchType}:${sanitizedQuery}:${pageNum}`;
    const cached = searchCache.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }

    const data = await tmdbService.search(sanitizedQuery, searchType, pageNum);
    searchCache.set(cacheKey, data);
    res.setHeader('X-Cache', 'MISS');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
