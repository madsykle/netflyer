import { NextRequest, NextResponse } from "next/server";
import { redis } from "../../../lib/redis";

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;

// Cache TTL in seconds (1 hour)
const CACHE_TTL = 3600;
// Rate limit: 60 requests per minute
const RATE_LIMIT = 60;
const RATE_LIMIT_WINDOW = 60;

export async function GET(request: NextRequest) {
  // 1. Basic security: prevent direct hotlinking from other domains
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');
  
  const isAllowedOrigin = !origin || origin.includes(host || '') || (referer && referer.includes(host || ''));
  
  if (!isAllowedOrigin) {
    return NextResponse.json({ error: 'Unauthorized origin' }, { status: 403 });
  }

  // 2. Rate Limiting using Redis
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const rateLimitKey = `ratelimit:${ip}`;
  
  try {
    const requests = await redis.incr(rateLimitKey);
    if (requests === 1) {
      await redis.expire(rateLimitKey, RATE_LIMIT_WINDOW);
    }
    
    if (requests > RATE_LIMIT) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' }, 
        { status: 429, headers: { 'Retry-After': RATE_LIMIT_WINDOW.toString() } }
      );
    }
  } catch (err) {
    console.error('Redis Rate Limit Error:', err);
    // Continue if Redis fails to avoid blocking users
  }

  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');
  
  if (!path) {
    return NextResponse.json({ error: 'Path is required' }, { status: 400 });
  }

  // 3. Global Caching using Redis
  // Sort params to ensure consistent cache keys
  const sortedParams = Array.from(searchParams.entries())
    .filter(([key]) => key !== 'path')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
    
  const cacheKey = `tmdb:${path}:${sortedParams}`;

  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData, { 
        status: 200,
        headers: { 'X-Cache': 'HIT' }
      });
    }
  } catch (err) {
    console.error('Redis Cache Get Error:', err);
  }

  // 4. Fetch from TMDB if not in cache
  const tmdbParams = new URLSearchParams(searchParams.toString());
  tmdbParams.delete('path');
  tmdbParams.append('api_key', TMDB_API_KEY || '');

  const url = `${TMDB_BASE_URL}${path}?${tmdbParams.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      // Keep Next.js revalidation as a fallback
      next: { revalidate: CACHE_TTL } 
    });
    
    if (!response.ok) {
       return NextResponse.json({ error: `TMDB API error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();

    // 5. Store in Redis cache
    try {
      await redis.set(cacheKey, data, { ex: CACHE_TTL });
    } catch (err) {
      console.error('Redis Cache Set Error:', err);
    }

    return NextResponse.json(data, { 
      status: 200,
      headers: { 'X-Cache': 'MISS' }
    });
  } catch (error) {
    console.error('TMDB Proxy Error:', error);
    return NextResponse.json({ error: 'Failed to fetch from TMDB' }, { status: 500 });
  }
}
