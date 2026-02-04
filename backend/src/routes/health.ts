import { Router, type Request, type Response } from 'express';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'netflyer API',
    version: '2.0.0',
    message: 'API is running securely with TypeScript',
    features: [
      'TypeScript',
      'In-memory caching',
      'Rate limiting',
      'Input validation',
      'Security headers',
    ],
    endpoints: [
      '/api/trending_tv',
      '/api/trending_movies',
      '/api/trending',
      '/api/airing_today',
      '/api/popular',
      '/api/anime',
      '/api/developer_picks',
      '/api/discover',
      '/api/search',
      '/api/movie/:id',
      '/api/tv/:id',
      '/api/person/:id',
      '/api/embed/:type/:id',
      '/api/weekly_trending',
      '/api/info/:type/:id',
      '/api/info/:type/:id/credits',
      '/api/info/:type/:id/recommendations',
      '/api/info/:type/:id/similar',
      '/api/info/tv/:id/season/:seasonNum',
      '/api/person/:id/credits',
    ],
  });
});

export default router;
