import { test, expect, type APIResponse } from "@playwright/test";
import type { Client } from "pg";
import ExcelJS from "exceljs";
import { ADMIN_STATE } from "./support/paths";
import { connect, cleanupE2EData, firstRow } from "./support/db";

/**
 * Excel import/export for products, categories, showrooms (API-level).
 *
 * Covers the full flow:
 *  - export: DB query -> real .xlsx (parsed back and asserted; incl. the row-2 sample row that
 *    aligns the export with the import template — see the round-trip test).
 *  - import mode=validate: header + per-row validation (no DB writes).
 *  - import mode=commit: real DB upsert (asserted on the DB). Commit also calls Gemini to
 *    translate EN fields (GEMINI_API_KEY is set); that call has a fallback and never blocks the
 *    write, so we assert only the deterministic project-controlled fields (name/slug/group/status).
 *  - round-trip: exporting then re-importing the same file processes every data row (regression
 *    guard for the fixed off-by-one where the exporter omitted the template's sample row).
 *  - malformed template -> 400; anonymous -> 403.
 */

test.use({ storageState: ADMIN_STATE });

let db: Client;
let existingCategorySlug: string;

test.beforeAll(async () => {
  db = await connect();
  await cleanupE2EData(db);
  const cat = await firstRow<{ slug: string }>(
    db,
    `SELECT slug FROM public.product_category_translations
      WHERE locale = 'vi' AND slug NOT LIKE 'e2e-%'
      ORDER BY char_length(slug) LIMIT 1`,
  );
  existingCategorySlug = cat!.slug;
});

test.afterAll(async () => {
  await cleanupE2EData(db);
  await db.end();
});

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/** Build an import workbook: row1 = headers, row2 = sample (skipped by importers), row3+ = data. */
async function buildImportXlsx(headers: string[], rows: Record<string, string>[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Sheet1");
  ws.addRow(headers);
  ws.addRow(headers.map(() => "(sample)"));
  for (const r of rows) ws.addRow(headers.map((h) => r[h] ?? ""));
  return Buffer.from(await wb.xlsx.writeBuffer());
}

/** Parse an exported workbook: header row + count of real data rows (excludes header + sample). */
async function parseExport(body: Buffer): Promise<{ headers: string[]; dataRows: number }> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(body as unknown as ArrayBuffer);
  const ws = wb.worksheets[0];
  const headers: string[] = [];
  ws.getRow(1).eachCell((c, i) => { headers[i - 1] = c.text.trim(); });
  return { headers, dataRows: Math.max(0, ws.rowCount - 2) }; // minus header + sample rows
}

function fileField(name: string, buffer: Buffer) {
  return { file: { name, mimeType: XLSX_MIME, buffer } };
}

const CATEGORY_HEADERS = [
  "Tên danh mục (Tiếng Việt)*", "Tên danh mục (Tiếng Anh)", "Mô tả (Tiếng Việt)", "Mô tả (Tiếng Anh)",
  "Mã nhóm hàng (wood/sanitary/tiles/other)*", "Slug danh mục cha (để trống nếu là nhóm gốc)",
  "Ảnh chính (URL)", "Thứ tự hiển thị", "Trạng thái (draft/published/archived)", "ID danh mục (để trống nếu tạo mới)",
];

const SHOWROOM_HEADERS = [
  "Tên Showroom (Tiếng Việt)*", "Tên Showroom (Tiếng Anh)", "Địa chỉ (Tiếng Việt)*", "Địa chỉ (Tiếng Anh)",
  "Tỉnh/Thành phố*", "Giờ mở cửa (Tiếng Việt)", "Giờ mở cửa (Tiếng Anh)", "Hotline*", "Email",
  "URL bản đồ nhúng Google Maps*", "URL bản đồ dự phòng Google Maps*", "Ảnh chính (URL)", "Latitude", "Longitude",
  "Thứ tự hiển thị", "Trạng thái (draft/published/archived)", "ID showroom (để trống nếu tạo mới)",
];

const P = {
  ref: "Mã sản phẩm (Reference Code)",
  name: "Tên sản phẩm (Tiếng Việt)*",
  summary: "Mô tả ngắn (Tiếng Việt)*",
  catSlug: "Slug danh mục*",
  cover: "Ảnh chính (URL)*",
  status: "Trạng thái (draft/published/archived)",
};

test("categories: export → validate → round-trip → commit end-to-end", async ({ page }) => {
  test.setTimeout(180_000);
  const token = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`;

  // EXPORT (real sheet)
  const exp = await page.request.get("/api/admin/categories/export");
  expect(exp.ok()).toBeTruthy();
  expect(exp.headers()["content-type"]).toContain("spreadsheetml");
  const expBody = Buffer.from(await exp.body());
  const parsed = await parseExport(expBody);
  expect(parsed.headers).toContain("Tên danh mục (Tiếng Việt)*");
  expect(parsed.dataRows).toBeGreaterThan(0);

  // ROUND-TRIP: re-import the exact export (validate). Every real data row must be processed —
  // none dropped as the sample row. (Regression guard for the export row-2 sample-row fix.)
  const rt = await page.request.post("/api/admin/categories/import?mode=validate", { multipart: fileField("rt.xlsx", expBody), timeout: 120_000 });
  expect(rt.ok()).toBeTruthy();
  expect((await rt.json()).total_rows).toBe(parsed.dataRows);

  // VALIDATE (1 valid + 1 invalid group key)
  const vXlsx = await buildImportXlsx(CATEGORY_HEADERS, [
    { "Tên danh mục (Tiếng Việt)*": `E2E ImpCat ${token}`, "Mã nhóm hàng (wood/sanitary/tiles/other)*": "wood", "Trạng thái (draft/published/archived)": "draft" },
    { "Tên danh mục (Tiếng Việt)*": `E2E BadCat ${token}`, "Mã nhóm hàng (wood/sanitary/tiles/other)*": "khong-hop-le", "Trạng thái (draft/published/archived)": "draft" },
  ]);
  const v = await (await page.request.post("/api/admin/categories/import?mode=validate", { multipart: fileField("v.xlsx", vXlsx), timeout: 120_000 })).json();
  expect(v.success_count).toBe(1);
  expect(v.error_count).toBe(1);
  expect(JSON.stringify(v.errors)).toContain("Mã nhóm hàng");
  expect(v.created_ids ?? []).toHaveLength(0); // validate never writes

  // COMMIT (creates a real category)
  const name = `E2E ImpCat commit ${token}`;
  const cXlsx = await buildImportXlsx(CATEGORY_HEADERS, [
    { "Tên danh mục (Tiếng Việt)*": name, "Mã nhóm hàng (wood/sanitary/tiles/other)*": "wood", "Trạng thái (draft/published/archived)": "draft" },
  ]);
  const c = await (await page.request.post("/api/admin/categories/import?mode=commit", { multipart: fileField("c.xlsx", cXlsx), timeout: 120_000 })).json();
  expect(c.success_count).toBe(1);
  expect(c.created_ids).toHaveLength(1);

  const created = await firstRow<{ group_key: string; status: string; slug: string }>(
    db,
    `SELECT pc.group_key, pc.status, t.slug
       FROM public.product_category_translations t
       JOIN public.product_categories pc ON pc.id = t.category_id
      WHERE t.name = $1 AND t.locale = 'vi' AND pc.deleted_at IS NULL`,
    [name],
  );
  expect(created).toBeDefined();
  expect(created!.group_key).toBe("wooden_furniture"); // "wood" is mapped to the DB enum
  expect(created!.status).toBe("draft");
  expect(created!.slug.startsWith("e2e-")).toBe(true);
});

test("showrooms: export → validate → commit end-to-end", async ({ page }) => {
  test.setTimeout(180_000);
  const token = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`;

  const exp = await page.request.get("/api/admin/showrooms/export");
  expect(exp.ok()).toBeTruthy();
  const parsed = await parseExport(Buffer.from(await exp.body()));
  expect(parsed.headers).toContain("Tên Showroom (Tiếng Việt)*");
  expect(parsed.dataRows).toBeGreaterThan(0);

  const validRow = {
    "Tên Showroom (Tiếng Việt)*": "", "Địa chỉ (Tiếng Việt)*": "Số 1 Đường E2E", "Tỉnh/Thành phố*": "Hà Nội",
    "Hotline*": "0900000000", "URL bản đồ nhúng Google Maps*": "https://maps.google.com/embed",
    "URL bản đồ dự phòng Google Maps*": "https://maps.google.com/q", "Trạng thái (draft/published/archived)": "draft",
  };

  // VALIDATE (valid + invalid province)
  const vXlsx = await buildImportXlsx(SHOWROOM_HEADERS, [
    { ...validRow, "Tên Showroom (Tiếng Việt)*": `E2E ImpSR ${token}` },
    { ...validRow, "Tên Showroom (Tiếng Việt)*": `E2E BadSR ${token}`, "Tỉnh/Thành phố*": "Atlantis" },
  ]);
  const v = await (await page.request.post("/api/admin/showrooms/import?mode=validate", { multipart: fileField("v.xlsx", vXlsx), timeout: 120_000 })).json();
  expect(v.success_count).toBe(1);
  expect(v.error_count).toBe(1);
  expect(JSON.stringify(v.errors)).toContain("Tỉnh/Thành phố");

  // COMMIT
  const name = `E2E ImpSR commit ${token}`;
  const cXlsx = await buildImportXlsx(SHOWROOM_HEADERS, [{ ...validRow, "Tên Showroom (Tiếng Việt)*": name }]);
  const c = await (await page.request.post("/api/admin/showrooms/import?mode=commit", { multipart: fileField("c.xlsx", cXlsx), timeout: 120_000 })).json();
  expect(c.success_count).toBe(1);
  expect(c.created_ids).toHaveLength(1);

  const created = await firstRow<{ status: string; code: string }>(
    db,
    `SELECT s.status, s.code FROM public.showroom_translations t
       JOIN public.showrooms s ON s.id = t.showroom_id
      WHERE t.name = $1 AND s.deleted_at IS NULL`,
    [name],
  );
  expect(created).toBeDefined();
  expect(created!.code.startsWith("e2e-")).toBe(true);
});

test("products: export → validate → commit end-to-end", async ({ page }) => {
  test.setTimeout(180_000);
  const token = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`;

  const exp = await page.request.get("/api/admin/products/export");
  expect(exp.ok()).toBeTruthy();
  const parsed = await parseExport(Buffer.from(await exp.body()));
  expect(parsed.headers).toContain(P.name);
  expect(parsed.dataRows).toBeGreaterThan(0);

  // VALIDATE (valid vs non-existent category)
  const vXlsx = await buildImportXlsx(parsed.headers, [
    { [P.name]: `E2E ImpProd ${token}`, [P.summary]: "Mô tả E2E", [P.catSlug]: existingCategorySlug, [P.cover]: "https://res.cloudinary.com/demo/p.jpg", [P.status]: "draft" },
    { [P.name]: `E2E BadProd ${token}`, [P.summary]: "Mô tả E2E", [P.catSlug]: `khong-ton-tai-${token}`, [P.cover]: "https://res.cloudinary.com/demo/p.jpg", [P.status]: "draft" },
  ]);
  const v = await (await page.request.post("/api/admin/products/import?mode=validate", { multipart: fileField("v.xlsx", vXlsx), timeout: 120_000 })).json();
  expect(v.success_count).toBe(1);
  expect(v.error_count).toBe(1);
  expect(JSON.stringify(v.errors)).toContain("không tồn tại");

  // COMMIT (reference_code carries the E2E prefix so cleanup removes the product row)
  const ref = `E2E-REF-${token}`;
  const name = `E2E ImpProd commit ${token}`;
  const cXlsx = await buildImportXlsx(parsed.headers, [
    { [P.ref]: ref, [P.name]: name, [P.summary]: "Mô tả E2E commit", [P.catSlug]: existingCategorySlug, [P.cover]: "https://res.cloudinary.com/demo/p.jpg", [P.status]: "draft" },
  ]);
  const c = await (await page.request.post("/api/admin/products/import?mode=commit", { multipart: fileField("c.xlsx", cXlsx), timeout: 120_000 })).json();
  expect(c.success_count).toBe(1);
  expect(c.created_ids).toHaveLength(1);

  const created = await firstRow<{ status: string; reference_code: string }>(
    db,
    `SELECT status, reference_code FROM public.products WHERE reference_code = $1 AND deleted_at IS NULL`,
    [ref],
  );
  expect(created).toBeDefined();
  expect(created!.status).toBe("draft");
});

test("malformed template (missing required header) is rejected with 400", async ({ page }) => {
  const token = `${Date.now().toString(36)}`;
  const badXlsx = await buildImportXlsx(
    CATEGORY_HEADERS.filter((h) => h !== "Mã nhóm hàng (wood/sanitary/tiles/other)*"),
    [{ "Tên danh mục (Tiếng Việt)*": `E2E ${token}` }],
  );
  const res = await page.request.post("/api/admin/categories/import?mode=validate", { multipart: fileField("bad.xlsx", badXlsx), timeout: 120_000 });
  expect(res.status()).toBe(400);
  expect((await res.json()).error).toContain("Thiếu cột bắt buộc");
});

test("import-template returns a valid, correctly-headered template for each module", async ({ page }) => {
  const cases: [string, string][] = [
    ["categories", "Tên danh mục (Tiếng Việt)*"],
    ["showrooms", "Tên Showroom (Tiếng Việt)*"],
    ["products", "Tên sản phẩm (Tiếng Việt)*"],
  ];
  for (const [m, requiredHeader] of cases) {
    const res = await page.request.get(`/api/admin/${m}/import-template`);
    expect(res.ok(), `${m} template must be served`).toBeTruthy();
    expect(res.headers()["content-type"]).toContain("spreadsheetml");
    const { headers } = await parseExport(Buffer.from(await res.body()));
    expect(headers, `${m} template headers`).toContain(requiredHeader);
  }
});

test("Excel modal (UI): upload → validate → commit imports a category", async ({ page }) => {
  test.setTimeout(180_000);
  const token = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`;
  const name = `E2E ModalCat commit ${token}`;
  const xlsx = await buildImportXlsx(CATEGORY_HEADERS, [
    { "Tên danh mục (Tiếng Việt)*": name, "Mã nhóm hàng (wood/sanitary/tiles/other)*": "wood", "Trạng thái (draft/published/archived)": "draft" },
  ]);

  await page.goto("/admin/categories");
  await page.getByRole("button", { name: /Nhập & Xuất Excel/ }).click();

  // Step 1: upload the file -> auto-validates -> step 2.
  await page.locator('input[type="file"]').setInputFiles({ name: "modal.xlsx", mimeType: XLSX_MIME, buffer: xlsx });

  // Step 2: the commit button appears once validation found the 1 valid row.
  const commitBtn = page.getByRole("button", { name: /Import 1 dòng hợp lệ/ });
  await expect(commitBtn).toBeVisible({ timeout: 60_000 });
  await commitBtn.click();

  // Step 3: completion.
  await expect(page.getByRole("button", { name: /Hoàn tất & Đóng/ })).toBeVisible({ timeout: 120_000 });

  // Real DB post-condition: the category was created via the modal.
  await expect
    .poll(
      async () =>
        (await firstRow(
          db,
          `SELECT 1 FROM public.product_category_translations t
             JOIN public.product_categories pc ON pc.id = t.category_id
            WHERE t.name = $1 AND t.locale = 'vi' AND pc.deleted_at IS NULL`,
          [name],
        )) ? "exists" : "missing",
      { timeout: 30_000 },
    )
    .toBe("exists");
});

test.describe("unauthenticated", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("export + template endpoints reject anonymous access", async ({ request }) => {
    for (const m of ["products", "categories", "showrooms"]) {
      expect((await request.get(`/api/admin/${m}/export`)).status(), `${m} export`).toBe(403);
      expect((await request.get(`/api/admin/${m}/import-template`)).status(), `${m} template`).toBe(403);
    }
  });
});
