import { Router, type Request, type Response, type NextFunction } from 'express';
import { tmdbService } from '../services/tmdb.js';
import { movieCache, tvCache, contentCache, personCache, seasonCache, creditsCache, recommendationsCache, similarCache } from '../cache/index.js';
import { ValidationError } from '../errors/index.js';
import { validateId, validateContentType } from '../middleware/validation.js';

const router = Router();

router.get('/movie/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!validateId(id)) {
      next(new ValidationError('Invalid movie ID'));
      return;
    }

    const movieId = parseInt(id);
    const cacheKey = `movie:${movieId}`;
    const cached = movieCache.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }

    const data = await tmdbService.getMovieDetails(movieId);
    movieCache.set(cacheKey, data);
    res.setHeader('X-Cache', 'MISS');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/tv/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!validateId(id)) {
      next(new ValidationError('Invalid TV show ID'));
      return;
    }

    const tvId = parseInt(id);
    const cacheKey = `tv:${tvId}`;
    const cached = tvCache.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }

    const data = await tmdbService.getTVDetails(tvId);
    tvCache.set(cacheKey, data);
    res.setHeader('X-Cache', 'MISS');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/person/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!validateId(id)) {
      next(new ValidationError('Invalid person ID'));
      return;
    }

    const personId = parseInt(id);
    const cacheKey = `person:${personId}`;
    const cached = personCache.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }

    const data = await tmdbService.getPersonDetails(personId);
    personCache.set(cacheKey, data);
    res.setHeader('X-Cache', 'MISS');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/person/:id/credits', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!validateId(id)) {
      next(new ValidationError('Invalid person ID'));
      return;
    }

    const personId = parseInt(id);
    const cacheKey = `person:${personId}:credits`;
    const cached = personCache.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }

    const data = await tmdbService.getPersonCredits(personId);
    personCache.set(cacheKey, data);
    res.setHeader('X-Cache', 'MISS');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/info/:type/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, id } = req.params;

    if (!validateContentType(type) || !validateId(id)) {
      next(new ValidationError('Invalid type or ID'));
      return;
    }

    const contentId = parseInt(id);
    const contentType = type as 'movie' | 'tv';
    const cacheKey = `info:${contentType}:${contentId}`;
    const cached = contentCache.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }

    const data = await tmdbService.getContentDetails(contentType, contentId);
    contentCache.set(cacheKey, data);
    res.setHeader('X-Cache', 'MISS');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/info/:type/:id/credits', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, id } = req.params;

    if (!validateContentType(type) || !validateId(id)) {
      next(new ValidationError('Invalid type or ID'));
      return;
    }

    const contentId = parseInt(id);
    const contentType = type as 'movie' | 'tv';
    const cacheKey = `credits:${contentType}:${contentId}`;
    const cached = creditsCache.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }

    const data = await tmdbService.getContentCredits(contentType, contentId);
    creditsCache.set(cacheKey, data);
    res.setHeader('X-Cache', 'MISS');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/info/:type/:id/recommendations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, id } = req.params;

    if (!validateContentType(type) || !validateId(id)) {
      next(new ValidationError('Invalid type or ID'));
      return;
    }

    const contentId = parseInt(id);
    const contentType = type as 'movie' | 'tv';
    const cacheKey = `recommendations:${contentType}:${contentId}`;
    const cached = recommendationsCache.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }

    const data = await tmdbService.getRecommendations(contentType, contentId);
    recommendationsCache.set(cacheKey, data);
    res.setHeader('X-Cache', 'MISS');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/info/:type/:id/similar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, id } = req.params;

    if (!validateContentType(type) || !validateId(id)) {
      next(new ValidationError('Invalid type or ID'));
      return;
    }

    const contentId = parseInt(id);
    const contentType = type as 'movie' | 'tv';
    const cacheKey = `similar:${contentType}:${contentId}`;
    const cached = similarCache.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }

    const data = await tmdbService.getSimilar(contentType, contentId);
    similarCache.set(cacheKey, data);
    res.setHeader('X-Cache', 'MISS');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/backdrop/:type/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, id } = req.params;

    if (!validateContentType(type) || !validateId(id)) {
      next(new ValidationError('Invalid type or ID'));
      return;
    }

    const contentId = parseInt(id);
    const contentType = type as 'movie' | 'tv';
    const cacheKey = `info:${contentType}:${contentId}`;
    let data = contentCache.get(cacheKey);

    if (!data) {
      data = await tmdbService.getContentDetails(contentType, contentId);
      contentCache.set(cacheKey, data);
    }

    if (data && data.backdrop_path) {
      res.redirect(`https://image.tmdb.org/t/p/original${data.backdrop_path}`);
    } else {
      res.status(404).send('Backdrop not found');
    }
  } catch (error) {
    next(error);
  }
});

router.get('/info/tv/:id/season/:seasonNum', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, seasonNum } = req.params;

    if (!validateId(id)) {
      next(new ValidationError('Invalid TV show ID'));
      return;
    }

    const tvId = parseInt(id);
    const season = typeof seasonNum === 'string' ? parseInt(seasonNum) : NaN;

    if (isNaN(season) || season < 1 || season > 100) {
      next(new ValidationError('Invalid season number'));
      return;
    }

    const cacheKey = `season:${tvId}:${season}`;
    const cached = seasonCache.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }

    const data = await tmdbService.getSeasonDetails(tvId, season);
    seasonCache.set(cacheKey, data);
    res.setHeader('X-Cache', 'MISS');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
