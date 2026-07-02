import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// Mock server-only
vi.mock("server-only", () => ({}));

// Mock createAdminClient from supabase/server
vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: vi.fn(),
}));

import { rateLimitCheck } from "../../lib/quotes/rate-limit";

describe("rateLimitCheck", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should allow up to 5 requests, then block", () => {
    const key = "test-ip-1";

    // 1st request
    let result = rateLimitCheck(key);
    expect(result.allowed).toBe(true);
    expect(result.retryAfterMs).toBe(0);

    // 2nd, 3rd, 4th, 5th
    for (let i = 0; i < 4; i++) {
      result = rateLimitCheck(key);
      expect(result.allowed).toBe(true);
    }

    // 6th request: should be blocked and return WINDOW_MS (60000)
    result = rateLimitCheck(key);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBe(60000);

    // 7th request: should hit the blockedUntil check (line 31)
    result = rateLimitCheck(key);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
    expect(result.retryAfterMs).toBeLessThanOrEqual(60000);

    // Fast-forward time by 61 seconds (past WINDOW_MS)
    vi.advanceTimersByTime(61000);

    // 8th request: should be allowed again and prune old empty blocked entries (line 14)
    result = rateLimitCheck(key);
    expect(result.allowed).toBe(true);
  });

  it("should enforce MAX_ENTRIES limit", () => {
    for (let i = 0; i < 5005; i++) {
      rateLimitCheck(`ip-${i}`);
    }
    const result = rateLimitCheck("ip-5004");
    expect(result.allowed).toBe(true);
  });
});
