import { Redis } from '@upstash/redis'
import { env } from './env'

if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn('Upstash Redis environment variables are missing. Caching will be disabled.')
}

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
})
