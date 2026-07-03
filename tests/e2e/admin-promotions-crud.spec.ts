import { test, expect, type Page } from "@playwright/test";
import type { Client } from "pg";
import { ADMIN_STATE } from "./support/paths";
import { connect, cleanupE2EData, firstRow } from "./support/db";

/**
 * Full admin CRUD journey for promotions: create (draft, with discount + date range) ->
 * appears in list -> found via free-text search -> edit title -> delete (soft).
 * Every step asserts a real DB post-condition.
 *
 * Real-UI notes:
 *  - The promotion `code` is auto-derived (UPPER_SNAKE) from the VI title and is disabled,
 *    so we type only the title and read the generated code/id back from the DB.
 *  - The Edit link passes the *code* (not the UUID); this spec's edit step therefore
 *    exercises the code->UUID resolution in updateAdminPromotion (previously a silent
 *    save failure, same class as the brand/showroom edit bugs).
 *  - The list search box maps to ?q=, which routes through getAdminPromotions — this
 *    exercises the PostgREST embedded-search fix (see lib/supabase/search-helpers.ts).
 *  - Delete is a soft delete (deleted_at set).
 */

test.use({ storageState: ADMIN_STATE });

const listUrl = "/admin/promotions?status=draft&sort=created_at&dir=desc&limit=100";

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
  await page.goto("/admin/promotions?create=1");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const discard = page.getByRole("button", { name: "Xóa bản nháp" });
  if (await discard.isVisible().catch(() => false)) await discard.click();
  return dialog;
}

test("create → list → search → edit → delete a promotion end-to-end", async ({ page }) => {
  // Dev-mode Turbopack compiles each distinct server action on first use (create/update/
  // delete each pay a one-off ~30-40s compile, slower in Docker). Give the whole journey
  // room so those cold compiles don't masquerade as failures.
  test.setTimeout(300_000);
  const token = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`;
  const title = `E2E Promo ${token}`;
  const editedTitle = `${title} sua`;

  // ---------- CREATE (draft) ----------
  const dialog = await openCreateDialog(page);
  await dialog.locator('input[name="title_vi"]').fill(title);
  await dialog.locator('input[name="discount_percentage"]').fill("25");
  // Optional date range (start < end) — exercises the datetime fields + persistence.
  const dates = dialog.locator('input[type="datetime-local"]');
  await dates.nth(0).fill("2026-08-01T09:00");
  await dates.nth(1).fill("2026-08-31T18:00");
  await dialog.getByRole("button", { name: "Lưu nháp" }).click();

  // Real post-condition: the promotion + VI translation are persisted.
  await expect
    .poll(
      async () =>
        (
          await firstRow(
            db,
            `SELECT 1 FROM public.promotion_translations pt
               JOIN public.promotions p ON p.id = pt.promotion_id
              WHERE pt.title = $1 AND pt.locale = 'vi' AND p.deleted_at IS NULL`,
            [title],
          )
        )
          ? "exists"
          : "missing",
      { timeout: 60_000 },
    )
    .toBe("exists");

  const created = await firstRow<{
    id: string;
    code: string;
    status: string;
    discount_percentage: string | null;
    start_at: string | null;
    end_at: string | null;
  }>(
    db,
    `SELECT p.id, p.code, p.status, p.discount_percentage, p.start_at, p.end_at
       FROM public.promotions p
       JOIN public.promotion_translations pt ON pt.promotion_id = p.id
      WHERE pt.title = $1 AND pt.locale = 'vi'`,
    [title],
  );
  expect(created!.status).toBe("draft");
  expect(Number(created!.discount_percentage)).toBe(25);
  expect(created!.start_at).not.toBeNull();
  expect(created!.end_at).not.toBeNull();
  const promotionId = created!.id;
  const code = created!.code;

  // ---------- LIST (drafts, newest first) ----------
  await page.goto(listUrl);
  await expect(page.getByTestId("admin-list")).toBeVisible();
  await expect(page.getByTestId("admin-list").getByText(title)).toBeVisible();

  // ---------- SEARCH (?q=) — validates the embedded-search fix through the real app ----------
  await page.goto(`/admin/promotions?q=${token}&limit=100`);
  await expect(page.getByTestId("admin-list")).toBeVisible();
  await expect(page.getByTestId("admin-list").getByText(title)).toBeVisible();

  // ---------- EDIT (rename) — via the code, exercising code->UUID resolution ----------
  await page.goto(`/admin/promotions?edit=${code}`);
  await expect(page.getByRole("dialog")).toBeVisible();
  const titleInput = page.locator('input[name="title_vi"]');
  await expect(titleInput).toHaveValue(title); // edit form loaded existing data
  // The edit form loads async and, under React dev strict-mode, a late second load can
  // revert the typed value; re-apply as the final change right before saving.
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
            `SELECT title FROM public.promotion_translations WHERE promotion_id = $1 AND locale = 'vi'`,
            [promotionId],
          )
        )?.title,
      { timeout: 60_000 },
    )
    .toBe(editedTitle);
  // The code must be unchanged by the edit (i.e. we updated the right row, not created one).
  const afterEdit = await firstRow<{ code: string }>(
    db,
    `SELECT code FROM public.promotions WHERE id = $1`,
    [promotionId],
  );
  expect(afterEdit!.code).toBe(code);

  // ---------- DELETE (soft) ----------
  await page.goto(listUrl);
  const row = page
    .getByTestId("admin-list")
    .locator("div.grid")
    .filter({ hasText: editedTitle });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Xóa", exact: true }).click();

  const confirm = page.getByRole("alertdialog");
  await expect(confirm).toContainText("Xác nhận xóa khuyến mãi");
  await confirm.getByRole("button", { name: "Xóa", exact: true }).click();

  await expect
    .poll(
      async () =>
        (
          await firstRow<{ deleted_at: string | null }>(
            db,
            `SELECT deleted_at FROM public.promotions WHERE id = $1`,
            [promotionId],
          )
        )?.deleted_at !== null,
      { timeout: 60_000 },
    )
    .toBe(true);

  // Disappears from the active draft listing.
  await page.goto(listUrl);
  await expect(page.getByText(editedTitle)).toHaveCount(0);
});

test("promotion date range is validated (start must be before end)", async ({ page }) => {
  const token = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`;
  const title = `E2E Promo bad ${token}`;

  const dialog = await openCreateDialog(page);
  await dialog.locator('input[name="title_vi"]').fill(title);
  // start AFTER end -> should be rejected client-side by promotionSchema.
  const dates = dialog.locator('input[type="datetime-local"]');
  await dates.nth(0).fill("2026-09-30T09:00");
  await dates.nth(1).fill("2026-09-01T09:00");
  await dialog.getByRole("button", { name: "Lưu nháp" }).click();

  // User-visible validation error.
  await expect(
    dialog.getByText("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc"),
  ).toBeVisible();

  // And nothing was persisted.
  await page.waitForTimeout(1000);
  const leaked = await firstRow(
    db,
    `SELECT 1 FROM public.promotion_translations WHERE title = $1`,
    [title],
  );
  expect(leaked).toBeUndefined();
});
