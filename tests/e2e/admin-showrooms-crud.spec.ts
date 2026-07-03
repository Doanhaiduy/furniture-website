import { test, expect, type Page } from "@playwright/test";
import type { Client } from "pg";
import { ADMIN_STATE } from "./support/paths";
import { connect, cleanupE2EData, firstRow } from "./support/db";

/**
 * Full admin CRUD journey for showrooms: create -> appears in list -> edit name ->
 * delete (soft). Asserts real DB post-conditions.
 * The showroom code is auto-generated (disabled) from the VI name, so we assert on the
 * derived e2e- code and edit via that code (matching the admin Edit link).
 */

test.use({ storageState: ADMIN_STATE });

const listUrl = "/admin/showrooms?status=draft&sort=updated_at&dir=desc&limit=100";

let db: Client;

test.beforeAll(async () => {
  db = await connect();
  await cleanupE2EData(db);
});

test.afterAll(async () => {
  await cleanupE2EData(db);
  await db.end();
});

async function openCreateDialog(page: Page) {
  await page.goto("/admin/showrooms?create=1");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const discard = page.getByRole("button", { name: "Xóa bản nháp" });
  if (await discard.isVisible().catch(() => false)) await discard.click();
  return dialog;
}

test("create → list → edit → delete a showroom end-to-end", async ({ page }) => {
  const token = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`;
  const name = `E2E Showroom ${token}`;
  const editedName = `${name} sua`;

  // ---------- CREATE ----------
  const dialog = await openCreateDialog(page);
  await dialog.locator('input[name="showroom-name-vi"]').fill(name);
  await dialog.locator('textarea[name="showroom-address-vi"]').fill("123 Đường E2E, Quận Test");
  await dialog.locator('input[name="showroom-hotline"]').fill("1900 0000");
  await dialog.locator('input[name="maps-embed"]').fill("https://www.google.com/maps/embed?pb=e2e");
  await dialog.locator('input[name="maps-fallback"]').fill("https://www.google.com/maps");
  await dialog.getByRole("button", { name: "Lưu nháp" }).click();

  await expect
    .poll(
      async () =>
        (
          await firstRow(
            db,
            `SELECT 1 FROM public.showroom_translations st
               JOIN public.showrooms s ON s.id = st.showroom_id
              WHERE st.name = $1 AND st.locale = 'vi' AND s.code LIKE 'e2e-%'
                AND s.deleted_at IS NULL`,
            [name],
          )
        )
          ? "exists"
          : "missing",
      { timeout: 30_000 },
    )
    .toBe("exists");

  const created = await firstRow<{ showroom_id: string; code: string }>(
    db,
    `SELECT s.id AS showroom_id, s.code
       FROM public.showroom_translations st
       JOIN public.showrooms s ON s.id = st.showroom_id
      WHERE st.name = $1 AND st.locale = 'vi'`,
    [name],
  );
  const showroomId = created!.showroom_id;

  // ---------- LIST ----------
  await page.goto(listUrl);
  await expect(page.getByTestId("admin-list")).toBeVisible();
  await expect(page.getByTestId("admin-list").getByText(name)).toBeVisible();

  // ---------- SEARCH (?q=) — exercises the embedded-search fix through the app ----------
  await page.goto(`/admin/showrooms?q=${token}&limit=100`);
  await expect(page.getByTestId("admin-list").getByText(name)).toBeVisible();

  // ---------- EDIT (rename) ----------
  await page.goto(`/admin/showrooms?edit=${created!.code}`);
  await expect(page.getByRole("dialog")).toBeVisible();
  const nameInput = page.locator('input[name="showroom-name-vi"]');
  await expect(nameInput).toHaveValue(name);
  await page.waitForLoadState("networkidle");
  await nameInput.fill(editedName);
  await page.waitForTimeout(1500);
  await nameInput.fill(editedName);
  await expect(nameInput).toHaveValue(editedName);
  await page.getByRole("dialog").getByRole("button", { name: "Lưu nháp" }).click();

  await expect
    .poll(
      async () =>
        (
          await firstRow<{ name: string }>(
            db,
            `SELECT name FROM public.showroom_translations WHERE showroom_id = $1 AND locale = 'vi'`,
            [showroomId],
          )
        )?.name,
      { timeout: 30_000 },
    )
    .toBe(editedName);

  // ---------- DELETE (soft) ----------
  await page.goto(listUrl);
  const row = page
    .getByTestId("admin-list")
    .locator("div.grid")
    .filter({ hasText: editedName });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Xóa", exact: true }).click();

  const confirm = page.getByRole("alertdialog");
  await expect(confirm).toContainText("Xác nhận xóa showroom");
  await confirm.getByRole("button", { name: "Xóa", exact: true }).click();

  await expect
    .poll(
      async () =>
        (
          await firstRow<{ deleted_at: string | null }>(
            db,
            `SELECT deleted_at FROM public.showrooms WHERE id = $1`,
            [showroomId],
          )
        )?.deleted_at !== null,
      { timeout: 30_000 },
    )
    .toBe(true);

  await page.goto(listUrl);
  await expect(page.getByText(editedName)).toHaveCount(0);
});
