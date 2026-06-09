import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { envSchema, validateEnv } from "../../lib/env/schema";

describe("Environment Variables Validation Schema", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-key");
    vi.stubEnv("AI_SECRET_ENCRYPTION_KEY", "12345678901234567890123456789012");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("passes when all required variables are valid", () => {
    const parsed = validateEnv();
    expect(parsed.NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
    expect(parsed.NEXT_PUBLIC_SUPABASE_URL).toBe("https://example.supabase.co");
    expect(parsed.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe("anon-key");
    expect(parsed.SUPABASE_SERVICE_ROLE_KEY).toBe("service-key");
    expect(parsed.AI_SECRET_ENCRYPTION_KEY).toBe("12345678901234567890123456789012");
  });

  it("fails when NEXT_PUBLIC_SUPABASE_URL is missing or empty", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    expect(() => validateEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_URL.*Required/);
  });

  it("fails when AI_SECRET_ENCRYPTION_KEY is not 32 characters long", () => {
    vi.stubEnv("AI_SECRET_ENCRYPTION_KEY", "too-short");
    expect(() => validateEnv()).toThrow(/AI_SECRET_ENCRYPTION_KEY.*Must be exactly 32 characters long/);
  });
});
