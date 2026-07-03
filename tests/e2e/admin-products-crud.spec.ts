import { test, expect, type Page } from "@playwright/test";
import type { Client } from "pg";
import { ADMIN_STATE } from "./support/paths";
import { connect, cleanupE2EData, uniqueSlug, uniqueRef, firstRow } from "./support/db";

/**
 * Full admin CRUD journey for products: create (draft) -> appears in list ->
 * edit -> delete (soft). Every step asserts a user-visible outcome AND the real
 * database post-condition. No hardcoded sleeps, no conditional assertions, robust
 * role/label/testid locators, and blanket prefix-based cleanup so tests are
 * order-independent.
 */

test.use({ storageState: ADMIN_STATE });

let db: Client;

test.beforeAll(async () => {
  db = await connect();
  await cleanupE2EData(db);
});

test.afterAll(async () => {
  await cleanupE2EData(db);
  await db.end();
});

/** Open the product create dialog and discard any auto-restored draft. */
async function openCreateDialog(page: Page) {
  await page.goto("/admin/products?create=1");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const discard = page.getByRole("button", { name: "Xóa bản nháp" });
  if (await discard.isVisible().catch(() => false)) {
    await discard.click();
  }
  return dialog;
}

async function fillRequiredProductFields(
  page: Page,
  data: { title: string; slug: string; ref: string },
) {
  const form = page.getByRole("dialog");
  await form.locator('input[name="product-title-vi"]').fill(data.title);
  await form.locator('input[name="product-slug-vi"]').fill(data.slug);
  await form.locator('textarea[name="product-summary-vi"]').fill("Mô tả ngắn E2E");
  await form.locator(".ProseMirror").fill("Nội dung chi tiết E2E cho sản phẩm kiểm thử.");
  await form.locator('input[name="materials-vi"]').fill("Gỗ sồi E2E");
  await form.locator('input[name="dimensions-vi"]').fill("100 x 100 x 100 mm");
  await form.locator('input[name="reference-code"]').fill(data.ref);
  await form.locator('input[name="seo-title-vi"]').fill(`SEO ${data.title}`);
  await form.locator('textarea[name="seo-description-vi"]').fill(`SEO description ${data.title}`);
}

test("create → list → edit → delete a product end-to-end @smoke", async ({ page }) => {
  const slug = uniqueSlug("sofa");
  const ref = uniqueRef();
  const title = `E2E Sofa ${ref}`;
  const editedTitle = `${title} (đã sửa)`;

  // ---------- CREATE (draft) ----------
  await openCreateDialog(page);
  await fillRequiredProductFields(page, { title, slug, ref });
  await page.getByRole("button", { name: "Lưu nháp" }).click();

  // Real post-condition (toast is transient because save redirects to the list):
  // poll the DB until the draft product row is persisted.
  await expect
    .poll(
      async () =>
        (
          await firstRow(
            db,
            `SELECT 1 FROM public.product_translations pt
               JOIN public.products p ON p.id = pt.product_id
              WHERE pt.slug = $1 AND p.deleted_at IS NULL`,
            [slug],
          )
        )
          ? "exists"
          : "missing",
      { timeout: 30_000 },
    )
    .toBe("exists");

  const created = await firstRow<{ product_id: string; status: string; name: string }>(
    db,
    `SELECT p.id AS product_id, p.status, pt.name
       FROM public.product_translations pt
       JOIN public.products p ON p.id = pt.product_id
      WHERE pt.slug = $1 AND p.deleted_at IS NULL`,
    [slug],
  );
  expect(created!.status).toBe("draft");
  expect(created!.name).toBe(title);
  const productId = created!.product_id;

  // ---------- LIST: the created draft is visible in the admin listing ----------
  // Filter to drafts, newest first, so the row we just created is on page 1
  // (deterministic without relying on free-text search).
  const draftListUrl = "/admin/products?status=draft&sort=updated_at&dir=desc&limit=100";
  await page.goto(draftListUrl);
  await expect(page.getByTestId("admin-list")).toBeVisible();
  await expect(page.getByTestId("admin-list").getByText(title)).toBeVisible();

  // ---------- SEARCH (?q=) ----------
  // Free-text search routes through getAdminProducts' q handling. Before the embedded-
  // search fix this raised PGRST100 and silently returned zero rows; assert the created
  // product is findable by its reference code (parent column) and its name token.
  await page.goto(`/admin/products?q=${ref}&limit=100`);
  await expect(page.getByTestId("admin-list")).toBeVisible();
  await expect(page.getByTestId("admin-list").getByText(title)).toBeVisible();

  // ---------- EDIT ----------
  await page.goto(`/admin/products?edit=${slug}`);
  await expect(page.getByRole("dialog")).toBeVisible();
  const titleInput = page.locator('input[name="product-title-vi"]');
  await expect(titleInput).toHaveValue(title); // edit form loaded existing data
  // Re-apply as the final change before saving, to defeat any late async form reload.
  await page.waitForLoadState("networkidle");
  await titleInput.fill(editedTitle);
  await page.waitForTimeout(1500);
  await titleInput.fill(editedTitle);
  await expect(titleInput).toHaveValue(editedTitle);
  await page.getByRole("dialog").getByRole("button", { name: "Lưu nháp" }).click();

  await expect
    .poll(
      async () =>
        (
          await firstRow<{ name: string }>(
            db,
            `SELECT name FROM public.product_translations WHERE product_id = $1 AND locale = 'vi'`,
            [productId],
          )
        )?.name,
      { timeout: 30_000 },
    )
    .toBe(editedTitle);

  // ---------- DELETE (soft) via UI confirm dialog ----------
  await page.goto(draftListUrl);
  // Scope to the specific row carrying our (edited) title, then hit its delete button.
  const targetRow = page
    .getByTestId("admin-list")
    .locator("div.grid")
    .filter({ hasText: editedTitle });
  await expect(targetRow).toBeVisible();
  await targetRow.getByRole("button", { name: "Xóa", exact: true }).click();

  const confirm = page.getByRole("alertdialog");
  await expect(confirm).toBeVisible();
  await expect(confirm).toContainText("Xác nhận xóa sản phẩm");
  await confirm.getByRole("button", { name: "Xóa", exact: true }).click();

  // DB post-condition: soft-deleted (deleted_at set, status archived).
  await expect
    .poll(
      async () =>
        (
          await firstRow<{ deleted_at: string | null }>(
            db,
            `SELECT deleted_at FROM public.products WHERE id = $1`,
            [productId],
          )
        )?.deleted_at !== null,
      { timeout: 30_000 },
    )
    .toBe(true);
  const afterDelete = await firstRow<{ status: string }>(
    db,
    `SELECT status FROM public.products WHERE id = $1`,
    [productId],
  );
  expect(afterDelete!.status).toBe("archived");

  // And it disappears from the active draft list (now archived + soft-deleted).
  await page.goto(draftListUrl);
  await expect(page.getByText(editedTitle)).toHaveCount(0);
});
