export type RateLimitResult = Readonly<{
  limited: boolean;
  retryAfterSeconds: number;
}>;

export function createFixedWindowLimiter(options: Readonly<{
  maxKeys: number;
  maxRequests: number;
  now?: () => number;
  windowMs: number;
}>) {
  type Bucket = { count: number; resetAt: number };

  const buckets = new Map<string, Bucket>();
  const now = options.now ?? Date.now;
  let nextSweepAt = 0;

  function retryAfter(resetAt: number, currentTime: number) {
    return Math.max(1, Math.ceil((resetAt - currentTime) / 1000));
  }

  function sweep(currentTime: number) {
    if (currentTime < nextSweepAt) return;

    for (const [key, bucket] of buckets) {
      if (currentTime >= bucket.resetAt) buckets.delete(key);
    }
    nextSweepAt = currentTime + options.windowMs;
  }

  return {
    check(key: string): RateLimitResult {
      const currentTime = now();
      sweep(currentTime);

      const bucket = buckets.get(key);
      if (bucket && currentTime < bucket.resetAt) {
        if (bucket.count >= options.maxRequests) {
          return {
            limited: true,
            retryAfterSeconds: retryAfter(bucket.resetAt, currentTime),
          };
        }

        bucket.count += 1;
        return { limited: false, retryAfterSeconds: 0 };
      }

      // Never evict an active bucket to admit a new key: doing so lets a spray
      // of rotating addresses reset the quotas of legitimate or abusive keys.
      if (buckets.size >= options.maxKeys) {
        return {
          limited: true,
          retryAfterSeconds: Math.max(1, Math.ceil(options.windowMs / 1000)),
        };
      }

      buckets.set(key, {
        count: 1,
        resetAt: currentTime + options.windowMs,
      });
      return { limited: false, retryAfterSeconds: 0 };
    },
  };
}
