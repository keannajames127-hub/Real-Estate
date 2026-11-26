import "server-only";

/**
 * A deliberately tiny in-memory rate limiter for the public enquiry endpoint.
 *
 * It stops a single client from hammering the form and the mail provider. It is
 * per-process, so a multi-instance deployment gets a per-instance budget —
 * which is the right trade-off for keeping the lead form dependency-free. If you
 * need a global limit, back this with Upstash Redis or a Supabase table.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_ENTRIES = 5000;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(
  key: string,
  options: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();

  // Opportunistic cleanup keeps the map from growing without bound.
  if (buckets.size > MAX_ENTRIES) {
    for (const [existingKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(existingKey);
    }
  }

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.limit - 1, retryAfterSeconds: 0 };
  }

  if (bucket.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { allowed: true, remaining: options.limit - bucket.count, retryAfterSeconds: 0 };
}
