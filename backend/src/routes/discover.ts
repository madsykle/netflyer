import { Router, type Request, type Response, type NextFunction } from 'express';
import { tmdbService } from '../services/tmdb.js';
import { discoverCache } from '../cache/index.js';
import { ValidationError } from '../errors/index.js';
import { sanitizeString, validatePage, validateYear, validateRating } from '../middleware/validation.js';
import { searchRateLimit } from '../middleware/rateLimit.js';

const router = Router();

router.get('/', searchRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      type = 'all',
      genre,
      year,
      rating_min,
      rating_max,
      sort_by = 'popularity.desc',
      page = '1',
    } = req.query;

    if (!['all', 'movie', 'tv'].includes(type as string)) {
      next(new ValidationError('Invalid type parameter'));
      return;
    }

    const pageNum = parseInt(page as string) || 1;
    if (!validatePage(pageNum)) {
      next(new ValidationError('Invalid page parameter'));
      return;
    }

    const sanitizedGenre = genre ? sanitizeString(genre as string) : undefined;
    const sanitizedYear = year ? parseInt(year as string) : undefined;
    const sanitizedRatingMin = rating_min ? parseFloat(rating_min as string) : undefined;
    const sanitizedRatingMax = rating_max ? parseFloat(rating_max as string) : undefined;
    const sanitizedSortBy = sanitizeString(sort_by as string);

    if (sanitizedYear !== undefined && !validateYear(sanitizedYear)) {
      next(new ValidationError('Invalid year'));
      return;
    }

    if (
      (sanitizedRatingMin !== undefined && !validateRating(sanitizedRatingMin)) ||
      (sanitizedRatingMax !== undefined && !validateRating(sanitizedRatingMax))
    ) {
      next(new ValidationError('Invalid rating range'));
      return;
    }

    const cacheKey = `discover:${type}:${sanitizedGenre || 'none'}:${sanitizedYear || 'none'}:${sanitizedRatingMin || 'none'}:${sanitizedRatingMax || 'none'}:${sanitizedSortBy}:${pageNum}`;
    const cached = discoverCache.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }

    const data = await tmdbService.discover({
      type: type as 'all' | 'movie' | 'tv',
      genre: sanitizedGenre,
      year: sanitizedYear,
      rating_min: sanitizedRatingMin,
      rating_max: sanitizedRatingMax,
      sort_by: sanitizedSortBy,
      page: pageNum,
    });

    discoverCache.set(cacheKey, data);
    res.setHeader('X-Cache', 'MISS');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
