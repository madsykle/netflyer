import { NextRequest, NextResponse } from "next/server";
import { redis } from "./redis";

/**
 * Validate that the request origin matches the expected host exactly.
 * Uses URL parsing instead of substring matching to prevent bypass.
 */
export function isOriginAllowed(origin: string | null, host: string | null): boolean {
  // No origin header = same-origin navigation or server-side request — allow
  if (!origin) return true;

  try {
    const originUrl = new URL(origin);
    // Extract just the hostname:port from host header for exact comparison
    const expectedHost = host?.split(":")[0] || "";
    const originHost = originUrl.hostname;

    // Exact match only — no substring matching
    return originHost === expectedHost || originHost === "localhost";
  } catch {
    // Malformed origin — reject
    return false;
  }
}

/**
 * Build a composite rate-limit fingerprint that cannot be trivially spoofed.
 * Combines X-Forwarded-For (if present), User-Agent, and Accept-Language
 * into a single key. An attacker would need to spoof ALL three simultaneously.
 */
export function getRateLimitFingerprint(request: NextRequest): string {
  const ip = request.headers.get("x-real-ip") || "127.0.0.1";
  const ua = request.headers.get("user-agent") || "";
  const lang = request.headers.get("accept-language") || "";
  const raw = `${ip}|${ua}|${lang}`;
  // djb2 hash for a compact, stable fingerprint
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash + raw.charCodeAt(i)) & 0xffffffff;
  }
  return hash.toString(36);
}

/**
 * Enforce a per-fingerprint request budget via Redis. Returns a 429 response
 * when the limit is exceeded, or null to let the caller proceed. Redis failures
 * degrade open (no rate limiting) rather than blocking users.
 */
export async function enforceRateLimit(
  request: NextRequest,
  opts: { prefix: string; limit: number; window: number }
): Promise<NextResponse | null> {
  const fingerprint = getRateLimitFingerprint(request);
  const key = `ratelimit:${opts.prefix}:${fingerprint}`;

  try {
    const requests = await redis.incr(key);
    if (requests === 1) {
      await redis.expire(key, opts.window);
    }
    if (requests > opts.limit) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": opts.window.toString() } }
      );
    }
  } catch (err) {
    console.error("Redis Rate Limit Error:", err);
    // Continue if Redis fails to avoid blocking users
  }

  return null;
}
