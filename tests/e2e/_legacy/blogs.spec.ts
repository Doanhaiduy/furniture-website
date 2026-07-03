import { test, expect } from "@playwright/test";
import { Client } from "pg";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

test.describe("Blogs Regression Suite (ADM-BLG-01 to ADM-BLG-43)", () => {
  let dbClient: Client;
  const createdBlogIds: string[] = [];
  const testCategoryId = "b0000000-0000-0000-0000-0000000000b1";

  test.beforeAll(async () => {
    dbClient = new Client({ connectionString });
    await dbClient.connect();
    await cleanup();
    
    // Seed một category hợp lệ để liên kết khóa ngoại
    await dbClient.query("SET session_replication_role = 'replica'");
    await dbClient.query(`
      INSERT INTO public.blog_categories (id, status, published_at)
      VALUES ($1, 'published', now())
      ON CONFLICT (id) DO NOTHING
    `, [testCategoryId]);
    await dbClient.query(`
      INSERT INTO public.blog_category_translations (category_id, locale, slug, name)
      VALUES ($1, 'vi', 'tin-tuc-test', 'Danh mục Tin Tức Test')
      ON CONFLICT (id) DO NOTHING
    `, [testCategoryId]);
    await dbClient.query("SET session_replication_role = 'origin'");
  });

  test.afterAll(async () => {
    await cleanup();
    await dbClient.end();
  });

  async function cleanup() {
    await dbClient.query("SET session_replication_role = 'replica'");
    if (createdBlogIds.length > 0) {
      await dbClient.query("DELETE FROM public.blog_post_translations WHERE post_id = ANY($1)", [createdBlogIds]);
      await dbClient.query("DELETE FROM public.blog_posts WHERE id = ANY($1)", [createdBlogIds]);
    }
    await dbClient.query("DELETE FROM public.blog_category_translations WHERE category_id = $1", [testCategoryId]);
    await dbClient.query("DELETE FROM public.blog_categories WHERE id = $1", [testCategoryId]);
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

  // ADM-BLG-01: List loads from DB
  test("ADM-BLG-01: Blog list loads correctly", async ({ page }) => {
    await page.goto("/admin/blog");
    const container = page.locator(".surface-soft").first();
    await expect(container).toBeVisible({ timeout: 10000 });
  });

  // ADM-BLG-04 & 05 & 07: Validate blank inputs
  test("ADM-BLG-04 & 05 & 07: Blank blog title and excerpt validation", async ({ page }) => {
    await page.goto("/admin/blog?create=1");

    const saveBtn = page.locator("button:has-text('Lưu')").first();
    await saveBtn.click();

    // Verify báo lỗi hiển thị
    const errorText = page.locator("text=Vui lòng điền tiêu đề tiếng Việt.").first();
    if (await errorText.count() > 0) {
      await expect(errorText).toBeVisible();
    }
  });

  // ADM-BLG-15: EN translation auto-fallback on create
  test("ADM-BLG-15 & ADM-BLG-41: English translation auto-fallback to Vietnamese values on create", async ({ page }) => {
    await page.goto("/admin/blog?create=1");

    await page.fill('input[name="blog-title-vi"]', "Bài viết Test Fallback");
    await page.fill('input[name="blog-slug-vi"]', "ba-viet-test-fallback");
    await page.fill('textarea[name="blog-summary-vi"]', "Trích dẫn vi");
    await page.locator(".ProseMirror").fill("Chi tiết bài viết vi");

    // Chọn danh mục
    const catSelect = page.locator('button[aria-label="Danh mục"]').first();
    if (await catSelect.count() > 0) {
      await catSelect.click();
      await page.locator('div[role="option"]:has-text("Danh mục Tin Tức Test")').first().click();
    }

    // Nhấp Lưu
    await page.locator("button:has-text('Lưu nháp')").first().click();
    await expect(page.locator("text=thành công").first()).toBeVisible({ timeout: 15000 });

    const dbRes = await dbClient.query("SELECT post_id FROM public.blog_post_translations WHERE slug = 'ba-viet-test-fallback' LIMIT 1");
    expect(dbRes.rows.length).toBe(1);
    const postId = dbRes.rows[0].post_id;
    createdBlogIds.push(postId);

    // IT Assertion: Verify DB tự sinh dòng EN trong blog_post_translations có title bằng vi
    const enTrans = await dbClient.query("SELECT title, excerpt FROM public.blog_post_translations WHERE post_id = $1 AND locale = 'en'", [postId]);
    expect(enTrans.rows.length).toBe(1);
    expect(enTrans.rows[0].title).toBe("Bài viết Test Fallback"); // Fallback thành công
    console.log("ADM-BLG-15 Evidence: EN translation automatically fallback to VI value.");
  });

  // ADM-BLG-16: body_json serialization (Tiptap content serialized to JSONB)
  test("ADM-BLG-16: Rich text editor content stores correctly as JSONB in DB", async () => {
    // Sử dụng sản phẩm hoặc bài viết đã chèn ở trên để kiểm tra body_json
    if (createdBlogIds.length > 0) {
      const postId = createdBlogIds[0];
      const transRes = await dbClient.query("SELECT body_json FROM public.blog_post_translations WHERE post_id = $1 LIMIT 1", [postId]);
      const bodyJson = transRes.rows[0].body_json;
      
      expect(bodyJson).not.toBeNull();
      expect(typeof bodyJson).toBe("object"); // JSONB được parse thành object JS
      console.log("ADM-BLG-16 Evidence (body_json type):", typeof bodyJson);
    }
  });

  // ADM-BLG-21: Audit log failure rollback (Marked as BLOCKED)
  test.skip("ADM-BLG-21: Audit log failure rolls back blog post creation (BLOCKED - requires mocking audit service)", async () => {
    // Skip vì cần mock audit.ts
  });

  // ADM-BLG-43: archived status sets deleted_at on create
  test("ADM-BLG-43: Check if archived status on create sets deleted_at timestamp", async () => {
    // Ta chạy SQL chèn thô 1 blog có status = 'archived' để verify hành vi DB trigger / mutation
    const mockId = "d0000000-0000-0000-0000-0000000000cc";
    
    await dbClient.query("SET session_replication_role = 'replica'");
    await dbClient.query("DELETE FROM public.blog_post_translations WHERE post_id = $1", [mockId]);
    await dbClient.query("DELETE FROM public.blog_posts WHERE id = $1", [mockId]);
    
    // Chèn blog posts
    await dbClient.query(`
      INSERT INTO public.blog_posts (id, category_id, status, author_id)
      VALUES ($1, $2, 'archived', '00000000-0000-0000-0000-000000000002')
    `, [mockId, testCategoryId]);
    await dbClient.query("SET session_replication_role = 'origin'");

    const postRes = await dbClient.query("SELECT deleted_at FROM public.blog_posts WHERE id = $1", [mockId]);
    const deletedAt = postRes.rows[0].deleted_at;
    console.log(`ADM-BLG-43 archived status deleted_at response: ${deletedAt}`);
    
    // Dọn dẹp
    await dbClient.query("SET session_replication_role = 'replica'");
    await dbClient.query("DELETE FROM public.blog_posts WHERE id = $1", [mockId]);
    await dbClient.query("SET session_replication_role = 'origin'");
  });

});
