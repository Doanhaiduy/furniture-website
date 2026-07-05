/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "../../app/api/admin/settings/route";
import { getCurrentUser } from "../../lib/supabase/auth";
import { createAdminClient } from "../../lib/supabase/server";

// Mock auth & server modules
vi.mock("../../lib/supabase/auth", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("../../lib/supabase/server", () => ({
  createAdminClient: vi.fn(),
  createClient: vi.fn(),
}));

describe("Settings Admin API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AI_SECRET_ENCRYPTION_KEY = "12345678901234567890123456789012";
  });

  it("returns 401 Unauthorized if user is not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns 401 Unauthorized if user is not an admin", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-id", role: "editor" } as any);
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns site settings and masked secrets for admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "admin-id", role: "admin" } as any);

    // Mock DB queries
    const mockSupabase = {
      from: vi.fn().mockImplementation((table) => {
        if (table === "site_settings") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                id: "settings-id",
                contact_phone: "08172 357 587",
                contact_email: "contact@phuongdong.vn",
                logo_media: { public_url: "/logo-final.svg" },
                favicon_media: { public_url: "/favicon.ico" },
                site_setting_translations: [
                  { locale: "vi", brand_name: "Thương hiệu Việt", contact_address: "Địa chỉ Việt" },
                  { locale: "en", brand_name: "Brand English", contact_address: "Address English" },
                ]
              },
              error: null
            })
          };
        }
        if (table === "integration_secrets") {
          return {
            select: vi.fn().mockResolvedValue({
              data: [
                { key_name: "resend_api_key", masked_hint: "****5678" },
                { key_name: "gemini_api_key", masked_hint: "****1234" }
              ]
            })
          };
        }
        if (table === "content_pages") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                id: "home-page-id",
                content_page_translations: []
              }
            })
          };
        }
        return {};
      })
    };

    vi.mocked(createAdminClient).mockReturnValue(mockSupabase as any);

    const response = await GET();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.brandNameVi).toBe("Thương hiệu Việt");
    expect(data.resendKey).toBe("****5678");
  });
});
