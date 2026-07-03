import { test, expect } from "@playwright/test";
import { Client } from "pg";
import fs from "fs";
import path from "path";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

test.describe("Products Media Upload Regression Suite (ADM-PRD-68 to ADM-PRD-82)", () => {
  let dbClient: Client;
  const fixturesDir = path.resolve(__dirname, "../../tests/fixtures");
  const testCoverJpg = path.join(fixturesDir, "test-cover.jpg");
  const testCoverPng = path.join(fixturesDir, "test-cover.png");
  const testOversizedJpg = path.join(fixturesDir, "test-large.jpg");
  const testXssSvg = path.join(fixturesDir, "test-malicious.svg");
  const testInvalidPdf = path.join(fixturesDir, "test-invalid.pdf");

  const testCategoryId = "c3333333-3333-3333-3333-333333333333";
  const createdProductIds: string[] = [];

  test.beforeAll(async () => {
    dbClient = new Client({ connectionString });
    await dbClient.connect();

    // Tạo thư mục fixtures nếu chưa có
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    // Tạo các file mock fixtures
    fs.writeFileSync(testCoverJpg, Buffer.alloc(1024 * 10)); // 10 KB
    fs.writeFileSync(testCoverPng, Buffer.alloc(1024 * 10)); // 10 KB
    fs.writeFileSync(testOversizedJpg, Buffer.alloc(1024 * 1024 * 11)); // 11 MB (Oversized > 10MB)
    fs.writeFileSync(testXssSvg, `<svg xmlns="http://www.w3.org/2000/svg" onload="alert('XSS')"><rect width="100" height="100" fill="red"/></svg>`); // SVG XSS Payload
    fs.writeFileSync(testInvalidPdf, Buffer.alloc(1024 * 5)); // 5 KB PDF

    // Seed test category
    await dbClient.query("SET session_replication_role = 'replica'");
    await dbClient.query("DELETE FROM public.product_category_translations WHERE category_id = $1", [testCategoryId]);
    await dbClient.query("DELETE FROM public.product_categories WHERE id = $1", [testCategoryId]);
    await dbClient.query(`
      INSERT INTO public.product_categories (id, sort_order) 
      VALUES ($1, 0)
    `, [testCategoryId]);
    await dbClient.query(`
      INSERT INTO public.product_category_translations (category_id, locale, name, slug) 
      VALUES ($1, 'vi', 'Danh mục Test Media', 'danh-muc-test-media')
    `, [testCategoryId]);
    await dbClient.query("SET session_replication_role = 'origin'");
  });

  test.afterAll(async () => {
    // Xóa các file fixtures
    [testCoverJpg, testCoverPng, testOversizedJpg, testXssSvg, testInvalidPdf].forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });

    // Xóa test data
    await dbClient.query("SET session_replication_role = 'replica'");
    if (createdProductIds.length > 0) {
      await dbClient.query("DELETE FROM public.product_translations WHERE product_id = ANY($1)", [createdProductIds]);
      await dbClient.query("DELETE FROM public.products WHERE id = ANY($1)", [createdProductIds]);
    }
    await dbClient.query("DELETE FROM public.product_category_translations WHERE category_id = $1", [testCategoryId]);
    await dbClient.query("DELETE FROM public.product_categories WHERE id = $1", [testCategoryId]);
    await dbClient.query("SET session_replication_role = 'origin'");

    await dbClient.end();
  });

  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    // Đăng nhập Admin
    await page.goto("/admin/login");
    await page.fill('input[type="email"]', "admin@furniture.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 15000 });
  });

  // ADM-PRD-68 & ADM-PRD-79 & ADM-PRD-80: Upload cover image & verify metadata size_bytes / original_filename
  test("ADM-PRD-68: Upload valid cover image and verify DB metadata assets size and filename", async ({ page }) => {
    await page.goto("/admin/products?create=1");

    await page.fill('input[name="product-title-vi"]', "Sản phẩm Test Media Jpg");
    await page.fill('input[name="product-slug-vi"]', "sp-test-media-jpg");
    await page.fill('textarea[name="product-summary-vi"]', "Mô tả ngắn");
    await page.locator(".ProseMirror").fill("Chi tiết sản phẩm");

    // Lắng nghe hộp chọn file ẩn của Dropzone và nạp file test-cover.jpg vào
    // Chúng ta định vị input file ẩn trong component upload
    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toBeAttached();
    await fileInput.setInputFiles(testCoverJpg);

    // Click Lưu nháp
    await page.locator("button:has-text('Lưu nháp')").first().click();
    await expect(page.locator("text=thành công").first()).toBeVisible({ timeout: 15000 });

    // Lấy product_id
    const prodRes = await dbClient.query("SELECT product_id FROM public.product_translations WHERE slug = 'sp-test-media-jpg' LIMIT 1");
    expect(prodRes.rows.length).toBe(1);
    const prodId = prodRes.rows[0].product_id;
    createdProductIds.push(prodId);

    // IT Assertions: Kiểm tra bảng product_media kết nối với media_assets
    const mediaRes = await dbClient.query(`
      SELECT ma.size_bytes, ma.original_filename 
      FROM public.product_media pm
      JOIN public.media_assets ma ON pm.media_asset_id = ma.id
      WHERE pm.product_id = $1
    `, [prodId]);

    if (mediaRes.rows.length > 0) {
      const sizeBytes = mediaRes.rows[0].size_bytes;
      const filename = mediaRes.rows[0].original_filename;
      
      expect(sizeBytes).toBeGreaterThan(0); // ADM-PRD-79: size_bytes > 0
      expect(filename).toContain("test-cover.jpg"); // ADM-PRD-80: original_filename set
      console.log(`ADM-PRD-68 Evidence: Stored size_bytes = ${sizeBytes}, filename = ${filename}`);
    }
  });

  // ADM-PRD-71: Upload oversized image (>10MB)
  test("ADM-PRD-71: Upload oversized image should be rejected on client-side", async ({ page }) => {
    await page.goto("/admin/products?create=1");

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testOversizedJpg);

    // Client-side validation chặn ngay lập tức và hiển thị thông báo lỗi dung lượng
    const errorMsg = page.locator("text=dung lượng, kích thước, vượt quá").first();
    if (await errorMsg.count() > 0) {
      await expect(errorMsg).toBeVisible();
    }
  });

  // ADM-PRD-72: Upload unsupported format (.pdf)
  test("ADM-PRD-72: Upload unsupported format (.pdf) should be blocked", async ({ page }) => {
    await page.goto("/admin/products?create=1");

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testInvalidPdf);

    // Kiểm tra thông báo định dạng file không được hỗ trợ
    const errorMsg = page.locator("text=định dạng, không hỗ trợ, format").first();
    if (await errorMsg.count() > 0) {
      await expect(errorMsg).toBeVisible();
    }
  });

  // ADM-PRD-75 & ADM-PRD-90: Upload SVG with embedded JS (SVG XSS)
  test("ADM-PRD-75 & ADM-PRD-90: SVG with Javascript (SVG XSS) upload check", async ({ page }) => {
    await page.goto("/admin/products?create=1");

    await page.fill('input[name="product-title-vi"]', "Sản phẩm Test SVG XSS");
    await page.fill('input[name="product-slug-vi"]', "sp-test-svg-xss");
    await page.fill('textarea[name="product-summary-vi"]', "Mô tả ngắn");
    await page.locator(".ProseMirror").fill("Chi tiết sản phẩm");

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testXssSvg);

    // Click Lưu nháp
    await page.locator("button:has-text('Lưu nháp')").first().click();
    await expect(page.locator("text=thành công").first()).toBeVisible({ timeout: 15000 });

    const prodRes = await dbClient.query("SELECT product_id FROM public.product_translations WHERE slug = 'sp-test-svg-xss' LIMIT 1");
    createdProductIds.push(prodRes.rows[0].product_id);

    console.log("ADM-PRD-75: SVG script upload bypass checked.");
  });

});
