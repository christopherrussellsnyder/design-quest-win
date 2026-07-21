// Simple in-memory sliding-window rate limiter for Deno edge functions.
// NOTE: Each isolate has its own memory, so limits are per-instance. This is
// intentional: it gives cheap DDoS/abuse protection without a Redis dependency
// while keeping real user traffic completely unaffected under normal load.
//
// Usage:
//   const rl = checkRateLimit(`support-chat:${ip}`, { limit: 30, windowMs: 60_000 });
//   if (!rl.ok) return jsonResponse({ error: "Too many requests" }, 429);

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Opportunistic cleanup so the map cannot grow without bound.
const MAX_ENTRIES = 10_000;

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    b = { count: 0, resetAt: now + opts.windowMs };
    buckets.set(key, b);
  }
  b.count += 1;

  if (buckets.size > MAX_ENTRIES) {
    for (const [k, v] of buckets) {
      if (v.resetAt <= now) buckets.delete(k);
      if (buckets.size <= MAX_ENTRIES / 2) break;
    }
  }

  return {
    ok: b.count <= opts.limit,
    remaining: Math.max(0, opts.limit - b.count),
    resetAt: b.resetAt,
  };
}

export function clientKey(req: Request, prefix: string): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0]?.trim() || req.headers.get("cf-connecting-ip") || "unknown";
  return `${prefix}:${ip}`;
}
