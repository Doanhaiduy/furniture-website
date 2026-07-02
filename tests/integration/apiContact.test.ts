import { describe, it, expect, vi } from "vitest";

// Mock server-only
vi.mock("server-only", () => ({}));

// Mock env from schema and load env variables inside the factory to prevent hoisting issues
vi.mock("@/lib/env/schema", () => {
  const fs = require("fs");
  const path = require("path");
  const localEnv: Record<string, string> = {};
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line: string) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        localEnv[key] = value.trim();
        process.env[key] = value.trim();
      }
    });
  }
  return {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: localEnv.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: localEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: localEnv.SUPABASE_SERVICE_ROLE_KEY,
    },
    validateEnv: () => ({}),
  };
});

import { POST } from "@/app/api/contact/route";
import { createAdminClient } from "@/lib/supabase/server";

// Mock rate limiter so tests don't fail due to rate limiting
vi.mock("@/lib/quotes/rate-limit", () => ({
  rateLimitCheck: () => ({ allowed: true, retryAfterMs: 0 }),
}));

// Mock Resend client so we don't make real email requests
vi.mock("@/lib/resend/client", () => ({
  resend: {
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: "test-email-id" }, error: null }),
    },
  },
}));

describe("API /api/contact Integration Tests", () => {
  it("should successfully receive request, insert to DB and write quote_request_events", async () => {
    const payload = {
      locale: "vi",
      fullName: "Integration Test User",
      phone: "0999999999",
      email: "integration@test.com",
      company: "Test Corp",
      service: "Consulting",
      message: "This is a message from integration test, longer than 10 characters.",
      sourcePath: "/contact",
    };

    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ ok: true, submitted: true });

    // Validate actual DB records
    const supabase = createAdminClient();
    const { data: quotes, error: qError } = await supabase
      .from("quote_requests")
      .select("*")
      .eq("full_name", "Integration Test User")
      .order("created_at", { ascending: false });

    expect(qError).toBeNull();
    expect(quotes).toBeDefined();
    expect(quotes!.length).toBeGreaterThan(0);

    const insertedQuote = quotes![0];
    expect(insertedQuote.phone).toBe("0999999999");
    expect(insertedQuote.email).toBe("integration@test.com");

    // Verify audit log event
    const { data: events, error: eError } = await supabase
      .from("quote_request_events")
      .select("*")
      .eq("quote_request_id", insertedQuote.id);

    expect(eError).toBeNull();
    expect(events).toBeDefined();
    expect(events!.length).toBeGreaterThan(0);
    expect(events![0].new_status).toBe("new");

    // Clean up inserted test records
    await supabase.from("quote_notifications").delete().eq("quote_request_id", insertedQuote.id);
    await supabase.from("quote_request_events").delete().eq("quote_request_id", insertedQuote.id);
    await supabase.from("quote_requests").delete().eq("id", insertedQuote.id);
  });

  it("should return 400 validation error for invalid phone", async () => {
    const payload = {
      locale: "vi",
      fullName: "Integration Test User",
      phone: "invalid-phone-number-abc", // Invalid format
      email: "integration@test.com",
      message: "This is a message from integration test, longer than 10 characters.",
      sourcePath: "/contact",
    };

    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.code).toBe("VALIDATION_ERROR");
    expect(json.fieldErrors.phone).toBeDefined();
  });
});
