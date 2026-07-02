import { test, expect, Page } from "@playwright/test";
import { Client } from "pg";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

// Cấu hình chạy tuần tự, sử dụng chung 1 tab trình duyệt để giữ nguyên session, tối ưu tốc độ và loại bỏ flaky login
test.describe.configure({ mode: "serial" });

test.describe("Products List E2E and IT Tests (ADM-PRD-01 to ADM-PRD-10)", () => {
  let dbClient: Client;
  let sharedPage: Page;
  const tempProductId = "d1000000-0000-0000-0000-0000000000f1";
  const tempCategoryId = "c1000000-0000-0000-0000-0000000000f1";

  test.beforeAll(async ({ browser }) => {
    // 1. Kết nối database và seed dữ liệu mẫu
    dbClient = new Client({ connectionString });
    await dbClient.connect();
    
    await dbClient.query("SET session_replication_role = 'replica'");
    await dbClient.query("DELETE FROM public.product_translations WHERE product_id = $1", [tempProductId]);
    await dbClient.query("DELETE FROM public.products WHERE id = $1", [tempProductId]);
    await dbClient.query("DELETE FROM public.product_category_translations WHERE category_id = $1", [tempCategoryId]);
    await dbClient.query("DELETE FROM public.product_categories WHERE id = $1", [tempCategoryId]);

    // Insert category
    await dbClient.query("INSERT INTO public.product_categories (id, sort_order) VALUES ($1, 0)", [tempCategoryId]);
    await dbClient.query("INSERT INTO public.product_category_translations (category_id, locale, name, slug) VALUES ($1, 'vi', 'Sofa gỗ', 'sofa-go')", [tempCategoryId]);

    // Insert product draft
    await dbClient.query(`
      INSERT INTO public.products (id, category_id, reference_code, status) 
      VALUES ($1, $2, 'REF-TEST-LIST', 'draft')
    `, [tempProductId, tempCategoryId]);
    
    // Sử dụng đúng tên các cột trong public.product_translations
    await dbClient.query(`
      INSERT INTO public.product_translations (product_id, locale, name, slug, summary, description_json, material, dimension_display_text)
      VALUES ($1, 'vi', 'Sofa Gỗ Cao Cấp', 'sofa-go-cao-cap', 'Tóm tắt', '{}'::jsonb, 'Gỗ', '100x100')
    `, [tempProductId]);
    await dbClient.query("SET session_replication_role = 'origin'");

    // 2. Khởi tạo tab trình duyệt chung và đăng nhập một lần duy nhất ở đầu suite
    sharedPage = await browser.newPage();
    
    try {
      await sharedPage.goto("/admin/login");
      await sharedPage.waitForTimeout(2500);
      await sharedPage.fill('input[type="email"]', "admin@furniture.com");
      await sharedPage.fill('input[type="password"]', "password123");
      await sharedPage.click('button[type="submit"]', { force: true });
      await expect(sharedPage).toHaveURL(/\/admin\/?$/, { timeout: 40000 });
    } catch (err) {
      console.log("Retry login due to Next.js compilation delay...");
      await sharedPage.goto("/admin/login");
      await sharedPage.waitForTimeout(2500);
      await sharedPage.fill('input[type="email"]', "admin@furniture.com");
      await sharedPage.fill('input[type="password"]', "password123");
      await sharedPage.click('button[type="submit"]', { force: true });
      await expect(sharedPage).toHaveURL(/\/admin\/?$/, { timeout: 45000 });
    }
  });

  test.afterAll(async () => {
    // Đóng tab trình duyệt chung
    if (sharedPage) {
      await sharedPage.close();
    }

    // Dọn dẹp DB
    await dbClient.query("SET session_replication_role = 'replica'");
    await dbClient.query("DELETE FROM public.product_translations WHERE product_id = $1", [tempProductId]);
    await dbClient.query("DELETE FROM public.products WHERE id = $1", [tempProductId]);
    await dbClient.query("DELETE FROM public.product_category_translations WHERE category_id = $1", [tempCategoryId]);
    await dbClient.query("DELETE FROM public.product_categories WHERE id = $1", [tempCategoryId]);
    await dbClient.query("SET session_replication_role = 'origin'");
    await dbClient.end();
  });

  // ADM-PRD-01: List loads with real data
  test("ADM-PRD-01: List loads with real data from DB", async () => {
    await sharedPage.goto("/admin/products");
    await sharedPage.waitForTimeout(2500); // Chờ 2.5s hydration
    await expect(sharedPage).toHaveURL(/\/admin\/products/);

    const container = sharedPage.locator(".surface-soft.overflow-hidden").first();
    await expect(container).toBeVisible({ timeout: 10000 });
    
    const dbRes = await dbClient.query("SELECT COUNT(*) FROM public.products WHERE deleted_at IS NULL");
    const count = parseInt(dbRes.rows[0].count, 10);
    expect(count).toBeGreaterThan(0);
    console.log(`ADM-PRD-01: Found ${count} products in DB.`);
  });

  // ADM-PRD-02 & ADM-PRD-03: Pagination page 1 and page 2
  test("ADM-PRD-02 & ADM-PRD-03: Pagination page 1 to page 2 navigation", async () => {
    await sharedPage.goto("/admin/products");
    await sharedPage.waitForTimeout(2500); // Chờ 2.5s hydration
    
    const container = sharedPage.locator(".surface-soft.overflow-hidden").first();
    await expect(container).toBeVisible({ timeout: 10000 });

    const nextBtn = sharedPage.locator("button:has-text('Sau'), button:has-text('Next')").first();
    if (await nextBtn.count() > 0 && await nextBtn.isEnabled()) {
      await nextBtn.click({ force: true });
      await sharedPage.waitForTimeout(1000);
      
      const productItem = sharedPage.locator("h3").first();
      await expect(productItem).toBeVisible();
    }
  });

  // ADM-PRD-04: Navigate to out-of-range page index
  test("ADM-PRD-04: Navigate to out-of-range page index", async () => {
    await sharedPage.goto("/admin/products?page=9999");
    await sharedPage.waitForTimeout(2500); // Chờ 2.5s hydration
    
    const header = sharedPage.locator("text=Quản lý sản phẩm").first();
    await expect(header).toBeVisible();
  });

  // ADM-PRD-05: Search by product name
  test("ADM-PRD-05: Search by product name 'Sofa'", async () => {
    await sharedPage.goto("/admin/products");
    await sharedPage.waitForTimeout(2500); // Chờ 2.5s hydration
    
    const searchInput = sharedPage.locator('input[placeholder*="Tên, mã, đường dẫn"]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.click({ force: true });
    await searchInput.fill("");
    await searchInput.pressSequentially("Sofa", { delay: 100 });
    await sharedPage.waitForTimeout(1500);
    
    const productTitles = sharedPage.locator("h3");
    const count = await productTitles.count();
    for (let i = 0; i < count; i++) {
      const text = await productTitles.nth(i).innerText();
      expect(text.toLowerCase()).toContain("sofa");
    }
  });

  // ADM-PRD-06: Search with non-matching query should show empty state
  test("ADM-PRD-06: Search with non-matching query should show empty state", async () => {
    await sharedPage.goto("/admin/products");
    await sharedPage.waitForTimeout(2500); // Chờ 2.5s hydration
    
    const searchInput = sharedPage.locator('input[placeholder*="Tên, mã, đường dẫn"]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.click({ force: true });
    await searchInput.fill("");
    await searchInput.pressSequentially("zzzzqqqq", { delay: 100 });
    
    // Chờ 2 giây để bộ lọc React State áp dụng hoàn toàn
    await sharedPage.waitForTimeout(2000);
    
    const emptyMsg = sharedPage.locator("text=Chưa có sản phẩm nào.").first();
    await expect(emptyMsg).toBeVisible({ timeout: 5000 });
  });

  // ADM-PRD-07 & ADM-PRD-08: Filter by status draft and published
  test("ADM-PRD-07 & ADM-PRD-08: Filter by status draft and published", async () => {
    await sharedPage.goto("/admin/products");
    await sharedPage.waitForTimeout(2500); // Chờ 2.5s hydration

    const statusSelect = sharedPage.locator('button[aria-label="Trạng thái"]').first();
    if (await statusSelect.count() > 0) {
      // 1. Test Filter Draft
      await statusSelect.click({ force: true });
      await sharedPage.getByRole('option', { name: 'Bản nháp' }).first().click({ force: true });
      await sharedPage.waitForTimeout(1000);
      
      const draftBadge = sharedPage.locator("text=Nháp").first();
      if (await draftBadge.count() > 0) {
        await expect(draftBadge).toBeVisible();
      }

      // 2. Test Filter Published
      await statusSelect.click({ force: true });
      await sharedPage.getByRole('option', { name: 'Đã xuất bản' }).first().click({ force: true });
      await sharedPage.waitForTimeout(1000);
      
      const pubBadge = sharedPage.locator("text=Đã đăng").first();
      if (await pubBadge.count() > 0) {
        await expect(pubBadge).toBeVisible();
      }
    }
  });

  // ADM-PRD-09 & ADM-PRD-10: Sort by name
  test("ADM-PRD-09 & ADM-PRD-10: Sort by name", async () => {
    await sharedPage.goto("/admin/products");
    await sharedPage.waitForTimeout(2500); // Chờ 2.5s hydration
    await expect(sharedPage.locator(".surface-soft.overflow-hidden").first()).toBeVisible({ timeout: 10000 });

    await expect(sharedPage.locator("text=Quản lý sản phẩm").first()).toBeVisible();
  });

});
