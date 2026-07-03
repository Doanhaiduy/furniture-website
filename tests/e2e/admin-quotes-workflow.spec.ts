import { test, expect } from "@playwright/test";
import type { Client } from "pg";
import { ADMIN_STATE } from "./support/paths";
import { connect, cleanupE2EData, firstRow } from "./support/db";

/**
 * Admin quote workflow. Quotes are not created from the admin (they arrive from the public
 * quote form), so we seed a lead directly into quote_requests (as a public submission would),
 * then drive the real admin actions through the UI and assert DB post-conditions:
 *  - status transition (new -> contacted) via the update_quote_status RPC, incl. the event log
 *  - admin notes save
 *  - assignee change
 * RBAC (editor blocked, anon 401) is covered in auth.spec.
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

test("quote workflow: status transition + admin notes + assignee", async ({ page }) => {
  test.setTimeout(180_000);
  const token = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`;
  const fullName = `E2E Khach ${token}`; // "E2E " prefix so cleanup picks it up
  const phone = `09${Math.floor(Math.random() * 1e8)}`;

  // ---------- SEED a lead (as the public form would) ----------
  const seeded = await firstRow<{ id: string }>(
    db,
    `INSERT INTO public.quote_requests (full_name, phone, email, message, preferred_locale, source_path, status)
       VALUES ($1, $2, $3, $4, 'vi', '/vi/e2e', 'new')
     RETURNING id`,
    [fullName, phone, `${token}@example.com`, "Yêu cầu tư vấn E2E"],
  );
  const quoteId = seeded!.id;

  // ---------- OPEN + select the seeded quote ----------
  await page.goto("/admin/quotes?sort=created_at&dir=desc&limit=50");
  const row = page.getByRole("button").filter({ hasText: fullName }).first();
  await expect(row).toBeVisible();
  await row.click();
  // Detail panel now shows this quote's id (exactly once — a QuotesPage nested-<button>
  // hydration bug used to duplicate the whole detail column into <body>; these unscoped
  // strict locators would fail again if that regressed).
  await expect(page.getByText(quoteId, { exact: false })).toBeVisible();

  // ---------- STATUS transition: new -> contacted ----------
  // exact:true so this matches only the workflow-action button, not list-row rows whose
  // accessible name happens to contain the "Đã liên hệ" status-pill text.
  await page.getByRole("button", { name: "Đã liên hệ", exact: true }).click();
  await expect
    .poll(
      async () =>
        (await firstRow<{ status: string }>(db, `SELECT status FROM public.quote_requests WHERE id = $1`, [quoteId]))?.status,
      { timeout: 30_000 },
    )
    .toBe("contacted");
  // The transition is logged to the canonical event table.
  const event = await firstRow(
    db,
    `SELECT 1 FROM public.quote_request_events WHERE quote_request_id = $1 AND new_status = 'contacted'`,
    [quoteId],
  );
  expect(event).toBeDefined();

  // ---------- ADMIN NOTES ----------
  const note = `E2E admin note ${token}`;
  await page.locator(`#admin-notes-${quoteId}`).fill(note);
  await page.getByRole("button", { name: "Lưu ghi chú Admin" }).click();
  await expect
    .poll(
      async () =>
        (await firstRow<{ admin_notes: string }>(db, `SELECT admin_notes FROM public.quote_requests WHERE id = $1`, [quoteId]))
          ?.admin_notes,
      { timeout: 30_000 },
    )
    .toBe(note);

  // ---------- SALES NOTES ----------
  const salesNote = `E2E sales note ${token}`;
  await page.locator(`#sales-notes-${quoteId}`).fill(salesNote);
  await page.getByRole("button", { name: "Lưu ghi chú Bán hàng" }).click();
  await expect
    .poll(
      async () =>
        (await firstRow<{ sales_notes: string }>(db, `SELECT sales_notes FROM public.quote_requests WHERE id = $1`, [quoteId]))
          ?.sales_notes,
      { timeout: 30_000 },
    )
    .toBe(salesNote);

  // ---------- ASSIGNEE ----------
  const assignee = page
    .locator("select")
    .filter({ has: page.locator("option", { hasText: "Chưa phân công" }) });
  // Staff options load async (fetch /api/admin/filter-options); wait until populated.
  await expect
    .poll(async () => await assignee.locator("option").count(), { timeout: 15_000 })
    .toBeGreaterThan(1);
  // The select is controlled with an async onChange, so it snaps back to "" until the DB
  // round-trip lands — read the target staff id from the option, select it, then assert DB.
  const targetStaffId = await assignee.locator("option").nth(1).getAttribute("value");
  expect(targetStaffId).toBeTruthy();
  await assignee.selectOption(targetStaffId!);
  await expect
    .poll(
      async () =>
        (await firstRow<{ assigned_to: string | null }>(db, `SELECT assigned_to FROM public.quote_requests WHERE id = $1`, [quoteId]))
          ?.assigned_to,
      { timeout: 30_000 },
    )
    .toBe(targetStaffId);

  // ---------- SECOND TRANSITION: contacted -> qualified ----------
  // After the first transition the workflow offers the next step; exercise a second hop and
  // confirm both the status and a second logged event.
  await page.getByRole("button", { name: "Đủ điều kiện", exact: true }).click();
  await expect
    .poll(
      async () =>
        (await firstRow<{ status: string }>(db, `SELECT status FROM public.quote_requests WHERE id = $1`, [quoteId]))?.status,
      { timeout: 30_000 },
    )
    .toBe("qualified");
  const qualifiedEvent = await firstRow(
    db,
    `SELECT 1 FROM public.quote_request_events WHERE quote_request_id = $1 AND new_status = 'qualified'`,
    [quoteId],
  );
  expect(qualifiedEvent).toBeDefined();
});
