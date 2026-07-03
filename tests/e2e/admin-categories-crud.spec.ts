import { test, expect, type Page } from "@playwright/test";
import type { Client } from "pg";
import { ADMIN_STATE } from "./support/paths";
import { connect, cleanupE2EData, firstRow } from "./support/db";

/**
 * Full admin CRUD journey for categories: create (child under a seeded parent group) ->
 * appears in list -> edit name -> delete (soft). Asserts real DB post-conditions.
 *
 * Notes on the real UI:
 *  - The slug field is auto-generated (disabled), so we assert on the derived e2e- slug
 *    rather than typing it.
 *  - A parent group is required (PremiumSelect -> shadcn combobox/option roles).
 *  - The list is hierarchical by default and hides children; we sort by updated_at to get
 *    a deterministic flat, newest-first listing.
 */

test.use({ storageState: ADMIN_STATE });

// A seeded top-level group that always exists (see migration 0009).
const PARENT_GROUP_LABEL = "Đồ gỗ nội thất";
const flatListUrl = "/admin/categories?sort=updated_at&dir=desc&limit=100";

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
  await page.goto("/admin/categories?create=1");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const discard = page.getByRole("button", { name: "Xóa bản nháp" });
  if (await discard.isVisible().catch(() => false)) await discard.click();
  return dialog;
}

test("create → list → edit → delete a category end-to-end", async ({ page }) => {
  const token = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`;
  const name = `E2E Cat ${token}`;
  const editedName = `${name} sua`;

  // ---------- CREATE ----------
  const dialog = await openCreateDialog(page);
  await dialog.locator('input[name="category-name-vi"]').fill(name);
  await dialog.getByRole("combobox", { name: "Thuộc Nhóm danh mục" }).click();
  await page.getByRole("option", { name: PARENT_GROUP_LABEL }).click();
  await dialog.getByRole("button", { name: "Lưu nháp" }).click();

  // Real post-condition: the category translation is persisted with an e2e- slug.
  await expect
    .poll(
      async () =>
        (
          await firstRow(
            db,
            `SELECT 1 FROM public.product_category_translations
              WHERE name = $1 AND locale = 'vi' AND slug LIKE 'e2e-%'`,
            [name],
          )
        )
          ? "exists"
          : "missing",
      { timeout: 30_000 },
    )
    .toBe("exists");

  const created = await firstRow<{ category_id: string; slug: string }>(
    db,
    `SELECT category_id, slug FROM public.product_category_translations
       WHERE name = $1 AND locale = 'vi'`,
    [name],
  );
  const categoryId = created!.category_id;

  // ---------- LIST (flat, newest first) ----------
  await page.goto(flatListUrl);
  await expect(page.getByTestId("admin-list")).toBeVisible();
  // The name cell also renders an inline "Danh mục" badge, so match by substring.
  await expect(page.getByTestId("admin-list").getByText(name)).toBeVisible();

  // ---------- SEARCH (?q=) — exercises the embedded-search fix through the app ----------
  await page.goto(`/admin/categories?q=${token}&limit=100`);
  await expect(page.getByTestId("admin-list").getByText(name)).toBeVisible();

  // ---------- EDIT (rename) ----------
  await page.goto(`/admin/categories?edit=${created!.slug}`);
  await expect(page.getByRole("dialog")).toBeVisible();
  const nameInput = page.locator('input[name="category-name-vi"]');
  await expect(nameInput).toHaveValue(name);
  // The edit form loads async and (under React dev strict-mode) a late second load can
  // revert our typed value; re-apply it as the final change right before saving.
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
            `SELECT name FROM public.product_category_translations WHERE category_id = $1 AND locale = 'vi'`,
            [categoryId],
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
  await expect(confirm).toContainText("Xác nhận xóa danh mục");
  await confirm.getByRole("button", { name: "Xóa", exact: true }).click();

  await expect
    .poll(
      async () =>
        (
          await firstRow<{ deleted_at: string | null }>(
            db,
            `SELECT deleted_at FROM public.product_categories WHERE id = $1`,
            [categoryId],
          )
        )?.deleted_at !== null,
      { timeout: 30_000 },
    )
    .toBe(true);

  // Disappears from the active listing.
  await page.goto(flatListUrl);
  await expect(page.getByText(editedName)).toHaveCount(0);
});
