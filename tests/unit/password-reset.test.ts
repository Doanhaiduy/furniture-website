import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/email/password-reset", () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/lib/supabase/audit", () => ({
  writeAuditLog: vi.fn().mockResolvedValue(undefined),
}));

import { createAdminClient } from "@/lib/supabase/server";
import { sendPasswordResetEmail } from "@/lib/email/password-reset";
import { POST as forgotPasswordHandler } from "@/app/api/admin/auth/forgot-password/route";
import { POST as resetPasswordHandler } from "@/app/api/admin/auth/reset-password/route";

describe("Password Reset Flow Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/admin/auth/forgot-password", () => {
    it("rejects invalid email address", async () => {
      const req = new Request("http://localhost/api/admin/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: "not-an-email" }),
      });
      const res = await forgotPasswordHandler(req);
      const json = await res.json();
      expect(res.status).toBe(400);
      expect(json.error).toBeDefined();
    });

    it("sends email and creates token when profile exists and is active", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: "user-123", email: "admin@example.com", full_name: "Admin User", is_active: true },
                error: null,
              }),
            }),
          }),
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
          insert: vi.fn().mockResolvedValue({ error: null }),
        }),
      };

      (createAdminClient as any).mockReturnValue(mockSupabase);

      const req = new Request("http://localhost/api/admin/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: "admin@example.com" }),
      });
      const res = await forgotPasswordHandler(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(sendPasswordResetEmail).toHaveBeenCalled();
    });
  });

  describe("POST /api/admin/auth/reset-password", () => {
    it("validates minimum password length of 8 characters", async () => {
      const req = new Request("http://localhost/api/admin/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email: "admin@example.com", token: "valid-token", password: "123" }),
      });
      const res = await resetPasswordHandler(req);
      const json = await res.json();
      expect(res.status).toBe(400);
      expect(json.error).toMatch(/tối thiểu 8 ký tự/i);
    });

    it("updates password when token is valid and not expired", async () => {
      const mockUpdateUserById = vi.fn().mockResolvedValue({ error: null });
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  gt: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                      limit: vi.fn().mockReturnValue({
                        maybeSingle: vi.fn().mockResolvedValue({
                          data: { id: "tok-1", user_id: "user-123", email: "admin@example.com" },
                          error: null,
                        }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
        auth: {
          admin: {
            updateUserById: mockUpdateUserById,
          },
        },
      };

      (createAdminClient as any).mockReturnValue(mockSupabase);

      const req = new Request("http://localhost/api/admin/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email: "admin@example.com", token: "valid-token", password: "NewPassword123!" }),
      });
      const res = await resetPasswordHandler(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(mockUpdateUserById).toHaveBeenCalledWith("user-123", { password: "NewPassword123!" });
    });
  });
});
