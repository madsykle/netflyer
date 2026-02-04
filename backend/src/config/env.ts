import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  TMDB_API_KEY: z.string().min(1, 'TMDB_API_KEY is required'),
  FRONTEND_URL: z.string().url().optional(),
  CACHE_TTL: z.string().transform(Number).default('300'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
  SEARCH_RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('60000'),
  SEARCH_RATE_LIMIT_MAX: z.string().transform(Number).default('30'),
});

export type Env = z.infer<typeof envSchema>;
