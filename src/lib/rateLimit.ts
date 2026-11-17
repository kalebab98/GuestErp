// Rate Limiting Protection
// Sliding window rate limiter for security-sensitive guest operations

interface RateLimitRecord {
  timestamps: number[];
}

class RateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();

  /**
   * Check and record an attempt within a sliding time window
   * @param key Unique key (e.g. IP address or session token)
   * @param maxAttempts Maximum attempts permitted within the window
   * @param windowMs Window duration in milliseconds
   * @returns true if allowed, false if limit exceeded
   */
  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.records.get(key) || { timestamps: [] };

    // Filter out timestamps outside the sliding window
    const recent = record.timestamps.filter(t => now - t < windowMs);

    if (recent.length >= maxAttempts) {
      return false;
    }

    recent.push(now);
    this.records.set(key, { timestamps: recent });
    return true;
  }

  /**
   * Remaining time in seconds before rate limit resets
   */
  getResetSeconds(key: string, windowMs: number): number {
    const record = this.records.get(key);
    if (!record || record.timestamps.length === 0) return 0;

    const oldest = Math.min(...record.timestamps);
    const elapsed = Date.now() - oldest;
    return Math.max(0, Math.ceil((windowMs - elapsed) / 1000));
  }

  /**
   * Reset rate limit for a key (e.g. on successful auth or administrative unblock)
   */
  reset(key: string): void {
    this.records.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

