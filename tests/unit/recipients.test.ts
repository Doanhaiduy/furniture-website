import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock server-only
vi.mock("server-only", () => ({}));

import { createAdminClient } from "../../lib/supabase/server";
import { getQuoteRecipients } from "../../lib/quotes/recipients";

// Mock supabase/server
vi.mock("../../lib/supabase/server", () => {
  const mockSupabase = {
    from: vi.fn(),
  };
  return {
    createAdminClient: vi.fn(() => mockSupabase),
  };
});

describe("getQuoteRecipients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.QUOTE_NOTIFICATION_RECIPIENTS = "env1@test.com,env2@test.com";
  });

  it("should return active recipients from database on success", async () => {
    const mockData = [
      { email: "db1@test.com", label: "DB Admin 1" },
      { email: "db2@test.com", label: "DB Admin 2" },
    ];

    const mockSupabase = createAdminClient() as any;
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    });

    const result = await getQuoteRecipients();
    expect(result).toEqual(mockData);
  });

  it("should fallback to environment variables when database query fails", async () => {
    const mockSupabase = createAdminClient() as any;
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: null, error: new Error("DB Error") }),
    });

    const result = await getQuoteRecipients();
    expect(result).toEqual([
      { email: "env1@test.com", label: "env1@test.com" },
      { email: "env2@test.com", label: "env2@test.com" },
    ]);
  });

  it("should return empty array if both database fails and env variable is missing", async () => {
    delete process.env.QUOTE_NOTIFICATION_RECIPIENTS;

    const mockSupabase = createAdminClient() as any;
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: null, error: new Error("DB Error") }),
    });

    const result = await getQuoteRecipients();
    expect(result).toEqual([]);
  });
});
