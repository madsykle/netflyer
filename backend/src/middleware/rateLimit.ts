import { config } from '../config/index.js';
import { TooManyRequestsError } from '../errors/index.js';
import type { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry>;
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.store = new Map();
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(key: string): { allowed: boolean; retryAfter: number; count: number } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      this.store.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return { allowed: true, retryAfter: 0, count: 1 };
    }

    if (entry.count >= this.maxRequests) {
      return { 
        allowed: false, 
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
        count: entry.count
      };
    }

    entry.count++;
    return { allowed: true, retryAfter: 0, count: entry.count };
  }

  getCount(key: string): number {
    const entry = this.store.get(key);
    return entry?.count || 0;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

const apiLimiter = new RateLimiter(
  config.RATE_LIMIT_WINDOW_MS,
  config.RATE_LIMIT_MAX
);

const searchLimiter = new RateLimiter(
  config.SEARCH_RATE_LIMIT_WINDOW_MS,
  config.SEARCH_RATE_LIMIT_MAX
);

export function apiRateLimit(req: Request, res: Response, next: NextFunction): void {
  const key = req.ip || 'unknown';
  const result = apiLimiter.check(key);

  res.setHeader('X-RateLimit-Limit', config.RATE_LIMIT_MAX);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, config.RATE_LIMIT_MAX - result.count));

  if (!result.allowed) {
    res.setHeader('Retry-After', result.retryAfter);
    next(new TooManyRequestsError(result.retryAfter));
    return;
  }

  next();
}

export function searchRateLimit(req: Request, res: Response, next: NextFunction): void {
  const key = req.ip || 'unknown';
  const result = searchLimiter.check(key);

  res.setHeader('X-RateLimit-Limit', config.SEARCH_RATE_LIMIT_MAX);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, config.SEARCH_RATE_LIMIT_MAX - result.count));

  if (!result.allowed) {
    res.setHeader('Retry-After', result.retryAfter);
    next(new TooManyRequestsError(result.retryAfter));
    return;
  }

  next();
}

setInterval(() => {
  apiLimiter.cleanup();
  searchLimiter.cleanup();
}, 60000);
