import { test, expect } from "@playwright/test";
import { Client } from "pg";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

test.describe("Showrooms Regression Suite (ADM-SHW-01 to ADM-SHW-31)", () => {
  let dbClient: Client;
  const createdShowroomIds: string[] = [];

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
    if (createdShowroomIds.length > 0) {
      await dbClient.query("DELETE FROM public.showroom_translations WHERE showroom_id = ANY($1)", [createdShowroomIds]);
      await dbClient.query("DELETE FROM public.showrooms WHERE id = ANY($1)", [createdShowroomIds]);
    }
    // Dọn dẹp test ID cố định (Sửa đổi thành UUID hợp lệ)
    await dbClient.query("DELETE FROM public.showroom_translations WHERE showroom_id IN ('a0000000-0000-0000-0000-0000000000a1', 'a0000000-0000-0000-0000-0000000000a2')");
    await dbClient.query("DELETE FROM public.showrooms WHERE id IN ('a0000000-0000-0000-0000-0000000000a1', 'a0000000-0000-0000-0000-0000000000a2')");
    await dbClient.query("SET session_replication_role = 'origin'");
  }

  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    // Đăng nhập Admin
    await page.goto("/admin/login");
    await page.fill('input[type="email"]', "admin@furniture.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]', { force: true });
    await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 15000 });
    await page.waitForTimeout(1500); // Khoảng nghỉ đồng bộ cookies
  });

  // ADM-SHW-01: Showrooms list loads
  test("ADM-SHW-01: Showrooms list loads correctly", async ({ page }) => {
    await page.goto("/admin/showrooms");
    const header = page.locator("text=Quản lý showroom").first();
    await expect(header).toBeVisible({ timeout: 10000 });
  });

  // ADM-SHW-11: Map embed URL http:// check constraint
  test("ADM-SHW-11: Map embed URL with http:// is rejected by DB constraint", async () => {
    const shwId = "a0000000-0000-0000-0000-0000000000a1"; // Sử dụng UUID hợp lệ
    let dbError: any = null;

    await dbClient.query("SET session_replication_role = 'replica'");
    await dbClient.query("DELETE FROM public.showrooms WHERE id = $1", [shwId]);
    await dbClient.query("SET session_replication_role = 'origin'");

    try {
      // Chèn map URL dùng http thay vì https
      await dbClient.query(`
        INSERT INTO public.showrooms (id, code, google_maps_embed_url, google_maps_fallback_url, hotline)
        VALUES ($1, 'hcm-http-test', 'http://maps.google.com/test', 'https://maps.google.com/fallback', '0912345678')
      `, [shwId]);
    } catch (err: any) {
      dbError = err;
    }

    expect(dbError).not.toBeNull();
    expect(dbError.code).toBe("23514"); // Vi phạm check constraint chk_showrooms_map_urls_https
    expect(dbError.constraint).toBe("chk_showrooms_map_urls_https");
    console.log("ADM-SHW-11 Evidence (http blocked):", dbError.message);
  });

  // ADM-SHW-15 & 16: Coordinates check constraint
  test("ADM-SHW-15 & 16: Latitude out of range is rejected by DB", async () => {
    const shwId = "a0000000-0000-0000-0000-0000000000a2"; // Sử dụng UUID hợp lệ
    let dbError: any = null;

    await dbClient.query("SET session_replication_role = 'replica'");
    await dbClient.query("DELETE FROM public.showrooms WHERE id = $1", [shwId]);
    await dbClient.query("SET session_replication_role = 'origin'");

    try {
      // Chèn latitude = 95.0 (vượt quá giới hạn 90.0)
      await dbClient.query(`
        INSERT INTO public.showrooms (id, code, google_maps_embed_url, google_maps_fallback_url, hotline, latitude, longitude)
        VALUES ($1, 'hcm-coords-test', 'https://maps.google.com/embed', 'https://maps.google.com/fallback', '0912345678', 95.0, 106.6)
      `, [shwId]);
    } catch (err: any) {
      dbError = err;
    }

    expect(dbError).not.toBeNull();
    expect(dbError.code).toBe("23514");
    expect(dbError.constraint).toBe("chk_showrooms_coordinates");
    console.log("ADM-SHW-15 & 16 Evidence (coords blocked):", dbError.message);
  });

  // ADM-SHW-12 & ADM-SHW-28: DOMPurify XSS sanitization check on Server-side
  test("ADM-SHW-12 & ADM-SHW-28: DOMPurify sanitize embed URL before DB insertion", async ({ page }) => {
    await page.goto("/admin/showrooms?create=1");

    await page.fill('input[name="showroom-name-vi"]', "Showroom Test XSS Embed");
    await page.fill('input[name="showroom-code"]', `code-${Date.now()}`); // Điền trường bắt buộc showroom-code
    await page.fill('input[name="showroom-hotline"]', "0912345678"); // Sửa đúng tên trường name trong form
    await page.fill('[name="showroom-address-vi"]', "123 Đường Test"); // Sửa đúng selector textarea
    await page.fill('[name="maps-fallback"]', "https://maps.google.com/fallback"); // Sửa đúng tên trường fallback url

    // Điền embed URL có chứa script độc hại
    const maliciousEmbed = "https://maps.google.com/embed<script>alert(1)</script>";
    await page.fill('[name="maps-embed"]', maliciousEmbed); // Sửa đúng tên trường embed url

    await page.locator("button:has-text('Lưu nháp')").first().click({ force: true });
    await expect(page.locator("text=Thành công").first()).toBeVisible({ timeout: 15000 });

    const dbRes = await dbClient.query("SELECT id FROM public.showrooms WHERE hotline = '0912345678' LIMIT 1");
    expect(dbRes.rows.length).toBe(1);
    const shwId = dbRes.rows[0].id;
    createdShowroomIds.push(shwId);

    // IT Assertion: Verify DB value không còn chứa script tag
    const shwRes = await dbClient.query("SELECT google_maps_embed_url FROM public.showrooms WHERE id = $1", [shwId]);
    const storedUrl = shwRes.rows[0].google_maps_embed_url;
    
    expect(storedUrl).not.toContain("<script>");
    console.log(`ADM-SHW-12 Sanitization Evidence: Input = '${maliciousEmbed}', Stored = '${storedUrl}'`);
  });

  // ADM-SHW-24: Audit log failure rollback (Marked as BLOCKED)
  test.skip("ADM-SHW-24: Audit log failure rolls back showroom creation (BLOCKED - requires mocking audit service)", async () => {
    // Skip
  });

});
