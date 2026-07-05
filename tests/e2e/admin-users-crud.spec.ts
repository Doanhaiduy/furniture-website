import { test, expect } from "@playwright/test";
import type { Client } from "pg";
import { ADMIN_STATE } from "./support/paths";
import { connect, cleanupE2EData, firstRow } from "./support/db";

/**
 * Admin user management. Users are NOT created via the EntityCreateForm DB path — they are
 * created through /api/admin/users which provisions a real Supabase Auth (GoTrue) user plus a
 * `profiles` row. RBAC is admin-only (editor redirect is covered in auth.spec).
 *
 * Coverage:
 *  - Create via the UI form -> asserts both the profile row AND the auth.users row.
 *  - Edit role + active via the UI modal -> asserts the profile update.
 *  - Delete + the "cannot delete yourself" guard via the API (the list UI exposes no delete).
 */

test.use({ storageState: ADMIN_STATE });

// admin@furniture.com — the account behind ADMIN_STATE (see the seed migration).
const SELF_ADMIN_ID = "00000000-0000-0000-0000-000000000002";
const listUrl = "/admin/users?sort=created_at&dir=desc&limit=100";

let db: Client;

test.beforeAll(async () => {
  db = await connect();
  await cleanupE2EData(db);
});

test.afterAll(async () => {
  await cleanupE2EData(db);
  await db.end();
});

test("create (UI) → list → edit role/active (UI) a CMS user end-to-end", async ({ page }) => {
  test.setTimeout(180_000);
  const token = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`;
  const email = `e2e-user-${token}@example.com`;
  const fullName = `E2E User ${token}`;

  // ---------- CREATE (as editor, active) ----------
  await page.goto("/admin/users?create=1");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Tên hiển thị").fill(fullName);
  await dialog.getByLabel("Email đăng nhập").fill(email);
  await dialog.getByLabel("Mật khẩu ban đầu").fill("password123");
  await dialog.getByRole("button", { name: "Tạo tài khoản" }).click();

  // Real post-conditions: profile row + GoTrue auth user both exist.
  await expect
    .poll(
      async () =>
        (
          await firstRow<{ role: string; is_active: boolean; full_name: string }>(
            db,
            `SELECT role, is_active, full_name FROM public.profiles WHERE email = $1 AND deleted_at IS NULL`,
            [email],
          )
        )?.role,
      { timeout: 60_000 },
    )
    .toBe("editor");

  const profile = await firstRow<{ id: string; is_active: boolean; full_name: string }>(
    db,
    `SELECT id, is_active, full_name FROM public.profiles WHERE email = $1`,
    [email],
  );
  expect(profile!.is_active).toBe(true);
  expect(profile!.full_name).toBe(fullName);
  const authUser = await firstRow(db, `SELECT 1 FROM auth.users WHERE email = $1`, [email]);
  expect(authUser).toBeDefined(); // a real Supabase Auth user was provisioned
  const userId = profile!.id;

  // ---------- LIST ----------
  await page.goto(listUrl);
  await expect(page.getByTestId("admin-list")).toBeVisible();
  await expect(page.getByTestId("admin-list").getByText(email)).toBeVisible();

  // ---------- SEARCH (?q= over email/full_name) ----------
  await page.goto(`/admin/users?q=${token}&limit=100`);
  await expect(page.getByTestId("admin-list").getByText(email)).toBeVisible();

  // ---------- EDIT (editor→admin, active→inactive) ----------
  const row = page.getByTestId("admin-list").locator("div.grid").filter({ hasText: email });
  await row.getByRole("button", { name: "Sửa" }).click();

  const form = page.locator("form").filter({ hasText: "Tài khoản đang hoạt động" });
  await expect(form).toBeVisible();
  await form.getByRole("combobox").click();
  await page.getByRole("option", { name: /Quản trị viên/ }).click();
  await form.locator('input[type="checkbox"]').uncheck();
  await form.getByRole("button", { name: "Lưu thay đổi" }).click();

  await expect
    .poll(
      async () =>
        (
          await firstRow<{ role: string; is_active: boolean }>(
            db,
            `SELECT role, is_active FROM public.profiles WHERE id = $1`,
            [userId],
          )
        ),
      { timeout: 60_000 },
    )
    .toMatchObject({ role: "admin", is_active: false });
});

test("DELETE /api/admin/users/[id] removes a user, and cannot delete self", async ({ page }) => {
  const token = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`;
  const email = `e2e-user-del-${token}@example.com`;

  // Create a throwaway user via the API.
  const createRes = await page.request.post("/api/admin/users", {
    data: { email, password: "password123", fullName: `E2E User del ${token}`, role: "editor", isActive: true },
  });
  expect(createRes.ok()).toBeTruthy();
  const created = await createRes.json();
  const id = created.data.id as string;

  // Guard: an admin cannot delete their own account.
  const selfRes = await page.request.delete(`/api/admin/users/${SELF_ADMIN_ID}`);
  expect(selfRes.status()).toBe(400);
  // Self profile is untouched.
  const selfStill = await firstRow(db, `SELECT 1 FROM public.profiles WHERE id = $1`, [SELF_ADMIN_ID]);
  expect(selfStill).toBeDefined();

  // Delete the throwaway user.
  const delRes = await page.request.delete(`/api/admin/users/${id}`);
  expect(delRes.ok()).toBeTruthy();

  await expect
    .poll(
      async () => (await firstRow(db, `SELECT 1 FROM public.profiles WHERE id = $1`, [id])) ? "exists" : "gone",
      { timeout: 30_000 },
    )
    .toBe("gone");
});
