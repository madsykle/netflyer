import type { MovieDetails, TVShowDetails, TMDBResponse, Movie, TVShow } from '../types/index.js';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class Cache<T> {
  private store: Map<string, CacheEntry<T>>;
  private ttl: number;

  constructor(ttlSeconds: number = 300) {
    this.store = new Map();
    this.ttl = ttlSeconds * 1000;
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: T): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.store.delete(key);
      }
    }
  }
}

export const movieCache = new Cache<MovieDetails>(300);
export const tvCache = new Cache<TVShowDetails>(300);
export const contentCache = new Cache<MovieDetails | TVShowDetails>(300);
export const trendingCache = new Cache<TMDBResponse<Movie | TVShow>>(180);
export const searchCache = new Cache<TMDBResponse<Movie | TVShow>>(120);
export const discoverCache = new Cache<unknown>(180);
export const personCache = new Cache<unknown>(300);
export const seasonCache = new Cache<unknown>(300);
export const creditsCache = new Cache<unknown>(300);
export const recommendationsCache = new Cache<TMDBResponse<Movie | TVShow>>(180);
export const similarCache = new Cache<TMDBResponse<Movie | TVShow>>(180);

setInterval(() => {
  movieCache.cleanup();
  tvCache.cleanup();
  contentCache.cleanup();
  trendingCache.cleanup();
  searchCache.cleanup();
  discoverCache.cleanup();
  personCache.cleanup();
  seasonCache.cleanup();
  creditsCache.cleanup();
  recommendationsCache.cleanup();
  similarCache.cleanup();
}, 60000);
