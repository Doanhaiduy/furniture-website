// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

describe("Client-side Environment Variables Validation", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("passes client validation with public variables", async () => {
    expect(typeof window).not.toBe("undefined");
    const { validateEnv } = await import("../../lib/env/schema");
    const parsed = validateEnv();
    expect(parsed.NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
    expect(parsed.NEXT_PUBLIC_SUPABASE_URL).toBe("https://example.supabase.co");
  });

  it("fails client validation when public keys are missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    await expect(import("../../lib/env/schema")).rejects.toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });
});
