import { test, expect, type Page } from "@playwright/test";
import type { Client } from "pg";
import { ADMIN_STATE } from "./support/paths";
import { connect, cleanupE2EData, uniqueSlug, firstRow } from "./support/db";

/**
 * Full admin CRUD journey for blog posts: create (draft) -> appears in list ->
 * edit title -> delete (soft). Asserts real DB post-conditions.
 * Blog uses the shared ContentEditorForm (kind="blog"), so fields mirror products.
 */

test.use({ storageState: ADMIN_STATE });

const draftListUrl = "/admin/blog?status=draft&sort=updated_at&dir=desc&limit=100";

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
  await page.goto("/admin/blog?create=1");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const discard = page.getByRole("button", { name: "Xóa bản nháp" });
  if (await discard.isVisible().catch(() => false)) await discard.click();
  return dialog;
}

test("create → list → edit → delete a blog post end-to-end", async ({ page }) => {
  const slug = uniqueSlug("bai-viet");
  const title = `E2E Blog ${slug}`;
  const editedTitle = `${title} sua`;

  // ---------- CREATE (draft) ----------
  const dialog = await openCreateDialog(page);
  await dialog.locator('input[name="blog-title-vi"]').fill(title);
  await dialog.locator('input[name="blog-slug-vi"]').fill(slug);
  await dialog.locator('textarea[name="blog-summary-vi"]').fill("Trích đoạn E2E cho bài viết kiểm thử.");
  await dialog.locator(".ProseMirror").fill("Nội dung chi tiết E2E cho bài viết kiểm thử.");
  await dialog.locator('input[name="seo-title-vi"]').fill(`SEO ${title}`);
  await dialog.locator('textarea[name="seo-description-vi"]').fill(`SEO description ${title}`);
  await dialog.getByRole("button", { name: "Lưu nháp" }).click();

  await expect
    .poll(
      async () =>
        (await firstRow(db, `SELECT 1 FROM public.blog_post_translations WHERE slug = $1`, [slug]))
          ? "exists"
          : "missing",
      { timeout: 30_000 },
    )
    .toBe("exists");

  const created = await firstRow<{ post_id: string; title: string }>(
    db,
    `SELECT bp.id AS post_id, bt.title
       FROM public.blog_post_translations bt
       JOIN public.blog_posts bp ON bp.id = bt.post_id
      WHERE bt.slug = $1 AND bp.deleted_at IS NULL`,
    [slug],
  );
  expect(created!.title).toBe(title);
  const postId = created!.post_id;

  // ---------- LIST ----------
  await page.goto(draftListUrl);
  await expect(page.getByTestId("admin-list")).toBeVisible();
  await expect(page.getByTestId("admin-list").getByText(title)).toBeVisible();

  // ---------- SEARCH (?q=) — exercises the embedded-search fix through the app ----------
  await page.goto(`/admin/blog?q=${slug}&limit=100`);
  await expect(page.getByTestId("admin-list").getByText(title)).toBeVisible();

  // ---------- EDIT (rename) ----------
  await page.goto(`/admin/blog?edit=${slug}`);
  await expect(page.getByRole("dialog")).toBeVisible();
  const titleInput = page.locator('input[name="blog-title-vi"]');
  await expect(titleInput).toHaveValue(title);
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
          await firstRow<{ title: string }>(
            db,
            `SELECT title FROM public.blog_post_translations WHERE post_id = $1 AND locale = 'vi'`,
            [postId],
          )
        )?.title,
      { timeout: 30_000 },
    )
    .toBe(editedTitle);

  // ---------- DELETE (soft) ----------
  await page.goto(draftListUrl);
  const row = page
    .getByTestId("admin-list")
    .locator("div.grid")
    .filter({ hasText: editedTitle });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Xóa", exact: true }).click();

  const confirm = page.getByRole("alertdialog");
  await expect(confirm).toContainText("Xác nhận xóa bài viết");
  await confirm.getByRole("button", { name: "Xóa", exact: true }).click();

  await expect
    .poll(
      async () =>
        (
          await firstRow<{ deleted_at: string | null }>(
            db,
            `SELECT deleted_at FROM public.blog_posts WHERE id = $1`,
            [postId],
          )
        )?.deleted_at !== null,
      { timeout: 30_000 },
    )
    .toBe(true);

  await page.goto(draftListUrl);
  await expect(page.getByText(editedTitle)).toHaveCount(0);
});
