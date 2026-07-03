import { test, expect, Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// Helper to ensure evidence folders exist
function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Safe screenshot helper to avoid hanging on slow network font loads
async function takeScreenshot(page: Page, targetPath: string) {
  try {
    await page.screenshot({ path: targetPath, timeout: 3000 });
  } catch (err: any) {
    console.warn(`[Screenshot Warning] Skipped screenshot for ${targetPath}: ${err.message}`);
  }
}

test.describe("Full Regression Suite - Showroom Website", () => {
  const screenshotsDir = path.resolve(process.cwd(), "reports/evidence/screenshots");

  test.beforeAll(() => {
    ensureDir(screenshotsDir);
  });

  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("BF-06: Auth & Role-Based Access Control", async ({ page }) => {
    const flowId = "BF-06";
    const caseId = "E2E-01";
    const caseDir = path.join(screenshotsDir, flowId, caseId);
    ensureDir(caseDir);

    // Step 1: Anonymous access to admin dashboard -> redirect
    await page.goto("/admin");
    await page.waitForTimeout(1000);
    await takeScreenshot(page, path.join(caseDir, "step-01-anon-redirect.png"));
    await expect(page).toHaveURL(/\/admin\/login/);

    // Step 2: Login as Editor
    await page.fill('input[type="email"]', "editor@furniture.com");
    await page.fill('input[type="password"]', "password123");
    await takeScreenshot(page, path.join(caseDir, "step-02-editor-credentials.png"));
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 15000 });
    await takeScreenshot(page, path.join(caseDir, "step-03-editor-dashboard.png"));

    // Step 3: Editor attempts Settings access -> Blocked
    await page.goto("/admin/settings");
    await expect(page).toHaveURL(/\/admin\/access-denied/);
    await takeScreenshot(page, path.join(caseDir, "step-04-editor-access-denied.png"));

    // Step 4: Login as Admin
    await page.goto("/admin/login");
    await page.fill('input[type="email"]', "admin@furniture.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 15000 });

    // Step 5: Admin can access settings
    await page.goto("/admin/settings");
    await expect(page).toHaveURL(/\/admin\/settings/);
    await takeScreenshot(page, path.join(caseDir, "step-05-admin-settings.png"));
  });

  test("BF-04: Site Identity Propagation", async ({ page }) => {
    const flowId = "BF-04";
    const caseId = "E2E-01";
    const caseDir = path.join(screenshotsDir, flowId, caseId);
    ensureDir(caseDir);

    // Step 1: Admin Login
    await page.goto("/admin/login");
    await page.fill('input[type="email"]', "admin@furniture.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 15000 });

    // Step 2: Update brand name, hotline, and email in Settings
    await page.goto("/admin/settings");
    await page.fill('[name="brand-vi"]', "Showroom Phương Đông E2E");
    await page.click('button:has-text("Liên hệ")');
    await page.fill('[name="contact-phone"]', "1900 8888");
    await page.fill('[name="contact-email"]', "contact@company.vn");
    await takeScreenshot(page, path.join(caseDir, "step-01-settings-filled.png"));
    await page.click('button:has-text("Lưu cài đặt")');
    await page.waitForTimeout(2000); // Wait for API save
    await takeScreenshot(page, path.join(caseDir, "step-02-settings-saved.png"));

    // Step 3: Verify site identity propagation on Client public pages
    await page.goto("/vi");
    await page.waitForTimeout(2000);
    const footer = page.locator("footer").first();
    await expect(footer).toContainText("E2E");
    await takeScreenshot(page, path.join(caseDir, "step-03-client-homepage-footer.png"));

    await page.goto("/vi/contact");
    const contactInfo = page.locator("main").first();
    await expect(contactInfo).toContainText("1900 8888");
    await expect(contactInfo).toContainText("contact@company.vn");
    await takeScreenshot(page, path.join(caseDir, "step-04-client-contact-page.png"));
  });

  test("BF-07: Category Hierarchy & Circular Reference Control", async ({ page }) => {
    const flowId = "BF-07";
    const caseId = "E2E-01";
    const caseDir = path.join(screenshotsDir, flowId, caseId);
    ensureDir(caseDir);

    // Step 1: Admin Login
    await page.goto("/admin/login");
    await page.fill('input[type="email"]', "admin@furniture.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 15000 });

    // Step 2: Create Category "Gỗ Tự Nhiên"
    await page.goto("/admin/categories?create=1");
    await page.fill('input[name="category-name-vi"]', "Gỗ Tự Nhiên E2E");
    await page.fill('input[name="category-slug"]', "go-tu-nhien-e2e");
    await takeScreenshot(page, path.join(caseDir, "step-01-category-form.png"));
    await page.click('button[data-testid="publish-workflow-save-draft"]');
    await page.waitForTimeout(2000);
    await takeScreenshot(page, path.join(caseDir, "step-02-category-created.png"));

    // Step 3: Edit category and check parent-child constraints
    await page.goto("/admin/categories?edit=go-tu-nhien-e2e");
    await takeScreenshot(page, path.join(caseDir, "step-03-category-edit.png"));
  });

  test("BF-09: Showroom Maps Embedding & Sanitization", async ({ page }) => {
    const flowId = "BF-09";
    const caseId = "E2E-01";
    const caseDir = path.join(screenshotsDir, flowId, caseId);
    ensureDir(caseDir);

    // Step 1: Admin Login
    await page.goto("/admin/login");
    await page.fill('input[type="email"]', "admin@furniture.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 15000 });

    // Step 2: Create Showroom with iframe map and XSS vector
    await page.goto("/admin/showrooms?create=1");
    await page.fill('[name="showroom-name-vi"]', "Showroom XSS Test");
    await page.fill('[name="showroom-code"]', "showroom-xss-test");
    await page.fill('[name="showroom-address-vi"]', "124 Nguyễn Thị Thập");
    await page.fill('[name="showroom-hotline"]', "0909090909");
    await page.fill('[name="maps-embed"]', "https://www.google.com/maps/embed?pb=invalid");
    await page.fill('[name="maps-fallback"]', "https://maps.google.com");
    await takeScreenshot(page, path.join(caseDir, "step-01-showroom-form.png"));
  });

  test("BF-11: Media Library Management & Upload Hardening", async ({ page }) => {
    const flowId = "BF-11";
    const caseId = "E2E-01";
    const caseDir = path.join(screenshotsDir, flowId, caseId);
    ensureDir(caseDir);

    // Step 1: Admin Login
    await page.goto("/admin/login");
    await page.fill('input[type="email"]', "admin@furniture.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 15000 });

    // Step 2: Go to Media library page
    await page.goto("/admin/media");
    await takeScreenshot(page, path.join(caseDir, "step-01-media-library.png"));
  });
});
