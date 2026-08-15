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
    if (originUrl.protocol !== "http:" && originUrl.protocol !== "https:") return false;

    // Parse Host as an authority instead of splitting on ':' (which breaks
    // IPv6 and lets ports be ignored). Browser origins must match host and
    // effective port exactly.
    const expected = host ? new URL(`https://${host}`) : null;
    if (!expected || expected.username || expected.password || expected.pathname !== "/") return false;
    const expectedPort = expected.port || "443";
    const originPort = originUrl.port || (originUrl.protocol === "https:" ? "443" : "80");

    return originUrl.hostname === expected.hostname && originPort === expectedPort;
  } catch {
    // Malformed origin/host — reject
    return false;
  }
}

/**
 * Build a stable rate-limit fingerprint from the platform-provided client IP.
 * Do not include user-controlled UA/language values: callers could vary those
 * headers on every request and bypass a composite fingerprint.
 */
export function getRateLimitFingerprint(request: NextRequest): string {
  const requestWithIp = request as NextRequest & { ip?: string };
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = requestWithIp.ip || request.headers.get("x-real-ip") || forwarded || "unknown";
  // djb2 hash for a compact, stable fingerprint
  let hash = 5381;
  for (let i = 0; i < ip.length; i++) {
    hash = ((hash << 5) + hash + ip.charCodeAt(i)) & 0xffffffff;
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
