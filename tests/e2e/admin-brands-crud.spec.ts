import { test, expect, type Page } from "@playwright/test";
import type { Client } from "pg";
import { ADMIN_STATE } from "./support/paths";
import { connect, cleanupE2EData, firstRow } from "./support/db";

/**
 * Full admin CRUD journey for brands: create -> appears in list -> edit name ->
 * delete (soft). Asserts real DB post-conditions.
 *
 * Real-UI notes:
 *  - Brand slug lives on the brands table and is auto-generated (disabled) from the VI name.
 *  - Delete is a single confirm ("Xóa") for a brand with no products (our case).
 */

test.use({ storageState: ADMIN_STATE });

const flatListUrl = "/admin/brands?sort=updated_at&dir=desc&limit=100";

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
  await page.goto("/admin/brands?create=1");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const discard = page.getByRole("button", { name: "Xóa bản nháp" });
  if (await discard.isVisible().catch(() => false)) await discard.click();
  return dialog;
}

test("create → list → edit → delete a brand end-to-end", async ({ page }) => {
  const token = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`;
  const name = `E2E Brand ${token}`;
  const editedName = `${name} sua`;

  // ---------- CREATE ----------
  const dialog = await openCreateDialog(page);
  await dialog.locator('input[name="name_vi"]').fill(name);
  await dialog.getByRole("button", { name: "Lưu nháp" }).click();

  await expect
    .poll(
      async () =>
        (
          await firstRow(
            db,
            `SELECT 1 FROM public.brand_translations bt
               JOIN public.brands b ON b.id = bt.brand_id
              WHERE bt.name = $1 AND bt.locale = 'vi' AND b.slug LIKE 'e2e-%'
                AND b.deleted_at IS NULL`,
            [name],
          )
        )
          ? "exists"
          : "missing",
      { timeout: 30_000 },
    )
    .toBe("exists");

  const created = await firstRow<{ brand_id: string; slug: string }>(
    db,
    `SELECT b.id AS brand_id, b.slug
       FROM public.brand_translations bt
       JOIN public.brands b ON b.id = bt.brand_id
      WHERE bt.name = $1 AND bt.locale = 'vi'`,
    [name],
  );
  const brandId = created!.brand_id;

  // ---------- LIST ----------
  await page.goto(flatListUrl);
  await expect(page.getByTestId("admin-list")).toBeVisible();
  await expect(page.getByTestId("admin-list").getByText(name)).toBeVisible();

  // ---------- SEARCH (?q=) — exercises the embedded-search fix through the app ----------
  await page.goto(`/admin/brands?q=${token}&limit=100`);
  await expect(page.getByTestId("admin-list").getByText(name)).toBeVisible();

  // ---------- EDIT (rename) ----------
  await page.goto(`/admin/brands?edit=${created!.slug}`);
  await expect(page.getByRole("dialog")).toBeVisible();
  const nameInput = page.locator('input[name="name_vi"]');
  await expect(nameInput).toHaveValue(name);
  // The edit form loads the brand asynchronously and, under React dev strict-mode, a second
  // late load can revert our typed value. Let loads settle, then re-apply the value as the
  // final state change immediately before saving so it cannot be reverted underneath us.
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
            `SELECT name FROM public.brand_translations WHERE brand_id = $1 AND locale = 'vi'`,
            [brandId],
          )
        )?.name,
      { timeout: 30_000 },
    )
    .toBe(editedName);

  // ---------- DELETE (soft) ----------
  await page.goto(flatListUrl);
  const row = page
    .getByTestId("admin-list")
    .locator("div.grid")
    .filter({ hasText: editedName });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Xóa", exact: true }).click();

  const confirm = page.getByRole("alertdialog");
  await expect(confirm).toContainText("Xác nhận xóa thương hiệu");
  await confirm.getByRole("button", { name: "Xóa", exact: true }).click();

  await expect
    .poll(
      async () =>
        (
          await firstRow<{ deleted_at: string | null }>(
            db,
            `SELECT deleted_at FROM public.brands WHERE id = $1`,
            [brandId],
          )
        )?.deleted_at !== null,
      { timeout: 30_000 },
    )
    .toBe(true);

  await page.goto(flatListUrl);
  await expect(page.getByText(editedName)).toHaveCount(0);
});
