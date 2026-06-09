import { describe, expect, it, vi } from "vitest";
import { GET } from "../../app/api/health/route";
import { createAdminClient } from "../../lib/supabase/server";

// Mock the Supabase server module
vi.mock("../../lib/supabase/server", () => ({
  createAdminClient: vi.fn(),
}));

describe("Health Check API Route", () => {
  it("returns 200 OK and connected status when database query succeeds", async () => {
    const mockSelect = vi.fn().mockResolvedValue({ error: null });
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: mockSelect,
      }),
    });
    
    vi.mocked(createAdminClient).mockReturnValue({
      from: mockFrom,
    } as unknown as ReturnType<typeof createAdminClient>);

    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual({
      status: "ok",
      database: "connected",
    });
  });

  it("returns 500 and disconnected status when database query fails", async () => {
    const mockSelect = vi.fn().mockResolvedValue({ error: { message: "Connection refused" } });
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: mockSelect,
      }),
    });
    
    vi.mocked(createAdminClient).mockReturnValue({
      from: mockFrom,
    } as unknown as ReturnType<typeof createAdminClient>);

    const response = await GET();
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.status).toBe("error");
    expect(data.database).toBe("disconnected");
    expect(data.error).toBe("Connection refused");
  });
});
