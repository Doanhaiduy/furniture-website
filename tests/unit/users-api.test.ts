import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/auth", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/audit", () => ({
  writeAuditLog: vi.fn().mockResolvedValue(undefined),
}));

import { getCurrentUser } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { PUT as putUserHandler } from "@/app/api/admin/users/route";
import { DELETE as deleteUserHandler } from "@/app/api/admin/users/[id]/route";

describe("Admin User Management API Enhancement Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("PUT /api/admin/users (Update Profile & Email)", () => {
    it("prevents self-deactivation or self-demotion", async () => {
      (getCurrentUser as any).mockResolvedValue({ id: "actor-1", role: "admin" });

      const req = new Request("http://localhost/api/admin/users", {
        method: "PUT",
        body: JSON.stringify({ id: "actor-1", role: "editor", isActive: true }),
      });
      const res = await putUserHandler(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toMatch(/Không thể tự hạ quyền/i);
    });

    it("updates profile email and Auth record when email changes", async () => {
      (getCurrentUser as any).mockResolvedValue({ id: "actor-admin", role: "admin" });

      const mockUpdateUserById = vi.fn().mockResolvedValue({ error: null });
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: "user-2", email: "old@example.com", full_name: "Old Name", role: "editor", is_active: true },
                error: null,
              }),
              neq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
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

      const req = new Request("http://localhost/api/admin/users", {
        method: "PUT",
        body: JSON.stringify({
          id: "user-2",
          email: "new@example.com",
          fullName: "New Name",
          role: "editor",
          isActive: true,
        }),
      });

      const res = await putUserHandler(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(mockUpdateUserById).toHaveBeenCalledWith("user-2", {
        email: "new@example.com",
        email_confirm: true,
        user_metadata: { full_name: "New Name" },
      });
    });
  });

  describe("DELETE /api/admin/users/[id]", () => {
    it("blocks deleting self", async () => {
      (getCurrentUser as any).mockResolvedValue({ id: "actor-admin", role: "admin" });

      const req = new Request("http://localhost/api/admin/users/actor-admin", {
        method: "DELETE",
      });
      const res = await deleteUserHandler(req, { params: Promise.resolve({ id: "actor-admin" }) });
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toMatch(/Cannot delete yourself/i);
    });

    it("blocks deleting last admin", async () => {
      (getCurrentUser as any).mockResolvedValue({ id: "actor-admin", role: "admin" });

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockImplementation((fields, opts) => {
            if (opts?.count === "exact") {
              return {
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    is: vi.fn().mockReturnValue({
                      neq: vi.fn().mockResolvedValue({ count: 0, error: null }),
                    }),
                  }),
                }),
              };
            }
            return {
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: "target-admin", email: "target@example.com", role: "admin", is_active: true },
                  error: null,
                }),
              }),
            };
          }),
        }),
      };

      (createAdminClient as any).mockReturnValue(mockSupabase);

      const req = new Request("http://localhost/api/admin/users/target-admin", {
        method: "DELETE",
      });
      const res = await deleteUserHandler(req, { params: Promise.resolve({ id: "target-admin" }) });
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toMatch(/Không thể xóa quản trị viên cuối cùng/i);
    });
  });
});
