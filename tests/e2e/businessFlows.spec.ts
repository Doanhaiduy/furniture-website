import { test, expect } from "@playwright/test";

test.describe("Business Flows E2E Tests", () => {
  test("should submit quote request from contact page and verify in admin quotes management", async ({ page }) => {
    // 1. Visit public contact page
    await page.goto("/vi/contact");

    // Check if the form elements are visible
    const fullNameInput = page.locator('input[name="fullName"]');
    const phoneInput = page.locator('input[name="phone"]');
    const emailInput = page.locator('input[name="email"]');
    const messageInput = page.locator('textarea[name="message"]');
    const submitButton = page.locator('form button.button-pd[type="submit"]');

    await expect(fullNameInput).toBeVisible();
    await expect(phoneInput).toBeVisible();
    await expect(messageInput).toBeVisible();

    // 2. Fill the form
    const uniqueTestName = `E2E User ${Date.now()}`;
    await fullNameInput.fill(uniqueTestName);
    await phoneInput.fill("0912345678");
    await emailInput.fill("e2e-user@example.com");
    await messageInput.fill("Tôi muốn nhận báo giá sản phẩm vệ sinh mới nhất cho chung cư.");

    // 3. Submit form
    await submitButton.click();

    // 4. Verify successful redirection or message
    await expect(page).toHaveURL(/\/contact\/success/, { timeout: 20000 });
    await expect(page.locator("h1")).toContainText(/Gửi yêu cầu thành công|Thành công|Success|Yêu cầu đã được ghi nhận/i);

    // 5. Navigate to Admin Login
    await page.goto("/admin/login");

    // Login as Admin
    await page.fill('input[type="email"]', "admin@furniture.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 15000 });

    // 6. Go to Quotes management page
    await page.goto("/admin/quotes");

    // Verify the new quote exists in the list
    const quoteRow = page.locator(`text=${uniqueTestName}`).first();
    await expect(quoteRow).toBeVisible();

    // 7. Click on the quote or update its status (if UI supports status transitions)
    // Find the row's dropdown for status or action button
    // Let's verify status dropdown trigger
    const rowContainer = page.locator("tr", { hasText: uniqueTestName });
    const selectTrigger = rowContainer.locator('button[role="combobox"]');
    if (await selectTrigger.count() > 0) {
      await selectTrigger.click();
      // Select the "Đã liên hệ" or contacted status option from Radix-UI select portal
      // Let's click status option
      const option = page.locator('div[role="option"]', { hasText: /Đã liên hệ|Contacted/i }).first();
      await option.click();
      
      // Look for a Save button if status needs explicit save, or wait for auto-save toast
      // Usually Radix Select will trigger onValueChange directly which triggers server update
      // Let's assert that status is updated on the UI
      await expect(rowContainer).toContainText(/Đã liên hệ|Contacted/i);
    }
  });

  test("should perform public product listing filter search", async ({ page }) => {
    // Visit products page
    await page.goto("/vi/products");

    // Fill search input
    const searchInput = page.locator('input[placeholder*="Tìm kiếm|Search"i], input[type="text"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill("Sofa");
      // Wait for debounce or click search/submit
      await page.waitForTimeout(500); // Debounce delay
      
      // Verify that URL query string contains search parameter
      expect(page.url()).toContain("q=Sofa");
    }
  });
});
