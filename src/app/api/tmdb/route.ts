import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit, isOriginAllowed } from "../../../lib/api-guard";
import { redis } from "../../../lib/redis";
import { env } from "../../../lib/env";

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
// Use server-only TMDB_API_KEY — NEVER fall back to NEXT_PUBLIC_ to avoid client bundle exposure
const TMDB_API_KEY = env.TMDB_API_KEY;

// Cache TTL in seconds (1 hour)
const CACHE_TTL = 3600;
// Rate limit: 40 requests per minute per fingerprint
const RATE_LIMIT = 40;
const RATE_LIMIT_WINDOW = 60;
// Max path length to prevent Redis key bloat
const MAX_PATH_LENGTH = 200;
// Max total query params to prevent cache key DoS
const MAX_QUERY_PARAMS = 10;

export async function GET(request: NextRequest) {
  // 1. Origin validation with exact hostname matching (prevents substring bypass)
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  
  if (!isOriginAllowed(origin, host)) {
    return NextResponse.json({ error: 'Unauthorized origin' }, { status: 403 });
  }

  // 2. Rate Limiting using composite fingerprint (prevents X-Forwarded-For spoofing)
  const limited = await enforceRateLimit(request, {
    prefix: "tmdb",
    limit: RATE_LIMIT,
    window: RATE_LIMIT_WINDOW,
  });
  if (limited) return limited;

  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');
  
  if (!path) {
    return NextResponse.json({ error: 'Path is required' }, { status: 400 });
  }

  // Enforce max path length to prevent oversized Redis keys
  if (path.length > MAX_PATH_LENGTH) {
    return NextResponse.json({ error: 'Path too long' }, { status: 400 });
  }

  // Prevent SSRF and TMDB key leakage by verifying path is a valid relative TMDB API path
  // Also decode the path first to catch URL-encoded bypass attempts
  const decodedPath = decodeURIComponent(path);
  if (
    !decodedPath.startsWith('/') ||
    decodedPath.includes('//') ||
    decodedPath.includes('@') ||
    decodedPath.includes(':') ||
    decodedPath.includes('..') ||
    decodedPath.includes('\\') ||
    decodedPath.includes('\0')
  ) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  // 3. Global Caching using Redis
  // Limit total query params to prevent cache key bloat DoS
  const paramEntries = Array.from(searchParams.entries()).filter(([key]) => key !== 'path');
  if (paramEntries.length > MAX_QUERY_PARAMS) {
    return NextResponse.json({ error: 'Too many parameters' }, { status: 400 });
  }

  const sortedParams = paramEntries
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
  if (!TMDB_API_KEY) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const tmdbParams = new URLSearchParams(searchParams.toString());
  tmdbParams.delete('path');
  tmdbParams.append('api_key', TMDB_API_KEY);

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
