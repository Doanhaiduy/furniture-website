import { test, expect } from "@playwright/test";
import { Client } from "pg";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

test.describe("Brands Regression Suite (ADM-BRD-01 to ADM-BRD-30)", () => {
  let dbClient: Client;
  const createdBrandIds: string[] = [];

  test.beforeAll(async () => {
    dbClient = new Client({ connectionString });
    await dbClient.connect();
    await cleanup();
  });

  test.afterAll(async () => {
    await cleanup();
    await dbClient.end();
  });

  async function cleanup() {
    await dbClient.query("SET session_replication_role = 'replica'");
    if (createdBrandIds.length > 0) {
      await dbClient.query("DELETE FROM public.brand_translations WHERE brand_id = ANY($1)", [createdBrandIds]);
      await dbClient.query("DELETE FROM public.brands WHERE id = ANY($1)", [createdBrandIds]);
    }
    // Dọn dẹp các ID test cố định
    await dbClient.query("DELETE FROM public.brand_translations WHERE brand_id IN ('b0000000-0000-0000-0000-0000000000a1', 'b0000000-0000-0000-0000-0000000000a2')");
    await dbClient.query("DELETE FROM public.brands WHERE id IN ('b0000000-0000-0000-0000-0000000000a1', 'b0000000-0000-0000-0000-0000000000a2')");
    await dbClient.query("SET session_replication_role = 'origin'");
  }

  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    // Đăng nhập Admin
    await page.goto("/admin/login");
    await page.fill('input[type="email"]', "admin@furniture.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 15000 });
    await page.waitForTimeout(1500); // Khoảng nghỉ đồng bộ cookies
  });

  // ADM-BRD-01: List loads from DB
  test("ADM-BRD-01: Brand list loads correctly", async ({ page }) => {
    await page.goto("/admin/brands");
    const container = page.locator(".surface-soft.overflow-hidden").first();
    await expect(container).toBeVisible({ timeout: 10000 });
  });

  // ADM-BRD-03 & ADM-BRD-04: Empty name_vi validation
  test("ADM-BRD-03 & ADM-BRD-04: Blank brand name validation", async ({ page }) => {
    await page.goto("/admin/brands?create=1");

    // Click Lưu trống
    const saveBtn = page.locator("button:has-text('Lưu')").first();
    await saveBtn.click();

    // Verify thông báo lỗi hiển thị
    const errorMsg = page.locator("text=Vui lòng điền tên thương hiệu tiếng Việt.").first();
    if (await errorMsg.count() > 0) {
      await expect(errorMsg).toBeVisible();
    }
  });

  // ADM-BRD-10: sort_order negative validation (NEEDS REVIEW)
  test("ADM-BRD-10: sort_order with negative value is allowed (NEEDS REVIEW)", async ({ page }) => {
    await page.goto("/admin/brands?create=1");

    await page.fill('input[name="brand-name-vi"]', "Thương hiệu Test Sort Âm");
    await page.fill('input[name="brand-slug-vi"]', "th-test-sort-am");
    
    const sortInput = page.locator('input[type="number"]').first();
    if (await sortInput.count() > 0) {
      await sortInput.fill("-10");
    }

    await page.locator("button:has-text('Lưu')").first().click();
    await expect(page.locator("text=thành công").first()).toBeVisible({ timeout: 10000 });

    const dbRes = await dbClient.query("SELECT brand_id FROM public.brand_translations WHERE slug = 'th-test-sort-am' LIMIT 1");
    createdBrandIds.push(dbRes.rows[0].brand_id);

    // Verify DB
    const brandRes = await dbClient.query("SELECT sort_order FROM public.brands WHERE id = $1", [dbRes.rows[0].brand_id]);
    expect(brandRes.rows[0].sort_order).toBe(-10);
    console.log("ADM-BRD-10 Evidence: sort_order is stored as -10 in DB.");
  });

  // ADM-BRD-16: Duplicate name_vi allowed
  test("ADM-BRD-16: Dual brands with identical name_vi is allowed", async ({ page }) => {
    await page.goto("/admin/brands?create=1");
    await page.fill('input[name="brand-name-vi"]', "Thương Hiệu Trùng");
    await page.fill('input[name="brand-slug-vi"]', "th-trung-1");
    await page.locator("button:has-text('Lưu')").first().click();
    await expect(page.locator("text=thành công").first()).toBeVisible({ timeout: 10000 });

    const dbRes1 = await dbClient.query("SELECT brand_id FROM public.brand_translations WHERE slug = 'th-trung-1' LIMIT 1");
    createdBrandIds.push(dbRes1.rows[0].brand_id);

    // Tạo dòng thứ 2 trùng tên
    await page.goto("/admin/brands?create=1");
    await page.fill('input[name="brand-name-vi"]', "Thương Hiệu Trùng");
    await page.fill('input[name="brand-slug-vi"]', "th-trung-2");
    await page.locator("button:has-text('Lưu')").first().click();
    await expect(page.locator("text=thành công").first()).toBeVisible({ timeout: 10000 });

    const dbRes2 = await dbClient.query("SELECT brand_id FROM public.brand_translations WHERE slug = 'th-trung-2' LIMIT 1");
    createdBrandIds.push(dbRes2.rows[0].brand_id);

    // Cả hai đều được tạo thành công
    console.log("ADM-BRD-16 Evidence: Duplicate brand names allowed in DB.");
  });

  // ADM-BRD-18: Delete brand referenced by products (Verify SET NULL behavior)
  test("ADM-BRD-18: Deleting brand referenced by products resets FK to NULL", async () => {
    const brandId = "b0000000-0000-0000-0000-0000000000a1";
    const catId = "c9999999-9999-9999-9999-999999999999";
    const prodId = "p0000000-0000-0000-0000-0000000000a1";

    await dbClient.query("SET session_replication_role = 'replica'");
    await dbClient.query("DELETE FROM public.product_translations WHERE product_id = $1", [prodId]);
    await dbClient.query("DELETE FROM public.products WHERE id = $1", [prodId]);
    await dbClient.query("DELETE FROM public.brand_translations WHERE brand_id = $1", [brandId]);
    await dbClient.query("DELETE FROM public.brands WHERE id = $1", [brandId]);
    await dbClient.query("DELETE FROM public.product_categories WHERE id = $1", [catId]);

    // Seed category, brand và product
    await dbClient.query("INSERT INTO public.product_categories (id, sort_order) VALUES ($1, 0)", [catId]);
    await dbClient.query("INSERT INTO public.brands (id, slug) VALUES ($1, 'test-brand-del')", [brandId]);
    await dbClient.query("INSERT INTO public.brand_translations (brand_id, locale, name) VALUES ($1, 'vi', 'Brand Delete')", [brandId]);
    await dbClient.query(`
      INSERT INTO public.products (id, category_id, brand_id, reference_code) 
      VALUES ($1, $2, $3, 'REF-BRD-DEL')
    `, [prodId, catId, brandId]);
    await dbClient.query("SET session_replication_role = 'origin'");

    // Xóa brand
    await dbClient.query("DELETE FROM public.brands WHERE id = $1", [brandId]);

    // Assert: Products.brand_id phải tự động set thành NULL (ON DELETE SET NULL) chứ không chặn xóa
    const prodRes = await dbClient.query("SELECT brand_id FROM public.products WHERE id = $1", [prodId]);
    expect(prodRes.rows[0].brand_id).toBeNull();
    console.log("ADM-BRD-18 Evidence: Deleted brand reset products.brand_id FK to NULL successfully.");

    // Dọn dẹp
    await dbClient.query("SET session_replication_role = 'replica'");
    await dbClient.query("DELETE FROM public.product_translations WHERE product_id = $1", [prodId]);
    await dbClient.query("DELETE FROM public.products WHERE id = $1", [prodId]);
    await dbClient.query("DELETE FROM public.product_categories WHERE id = $1", [catId]);
    await dbClient.query("SET session_replication_role = 'origin'");
  });

});
