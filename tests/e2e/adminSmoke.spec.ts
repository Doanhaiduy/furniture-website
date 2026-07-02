import { test, expect } from "@playwright/test";

test.describe("Admin App Smoke Test Suite", () => {
  
  test.beforeEach(async ({ context }) => {
    // Xóa cookies để đảm bảo trạng thái đăng nhập sạch sẽ giữa các test cases
    await context.clearCookies();
  });

  // 1. Anonymous user bị redirect về login
  test("1. Anonymous user should be redirected to login page when accessing admin routes", async ({ page }) => {
    // Thử truy cập Dashboard trực tiếp
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
    
    // Thử truy cập trực tiếp danh sách sản phẩm
    await page.goto("/admin/products");
    await expect(page).toHaveURL(/\/admin\/login\?redirectTo=%2Fadmin%2Fproducts/);
  });

  // 2. Login admin thành công & 4. Admin vào dashboard được
  test("2. Admin should login successfully and access dashboard with full navigation", async ({ page }) => {
    await page.goto("/admin/login");

    // Điền thông tin đăng nhập của Admin
    await page.fill('input[type="email"]', "admin@furniture.com");
    await page.fill('input[type="password"]', "password123");
    
    // Click submit và kiểm tra chuyển hướng
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 15000 });

    // Assert tiêu đề hoặc text đặc trưng hiển thị
    await expect(page.locator("text=Tổng quan").first()).toBeVisible({ timeout: 10000 });
    
    // Admin phải nhìn thấy đầy đủ các menu đặc quyền trên sidebar
    await expect(page.getByRole("link", { name: "Cài đặt" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Người dùng" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Yêu cầu báo giá" }).first()).toBeVisible();
  });

  // 3. Login editor thành công
  test("3. Editor should login successfully and view dashboard with restricted navigation", async ({ page }) => {
    await page.goto("/admin/login");

    // Điền thông tin đăng nhập của Editor
    await page.fill('input[type="email"]', "editor@furniture.com");
    await page.fill('input[type="password"]', "password123");
    
    // Click submit và kiểm tra chuyển hướng
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 15000 });

    // Editor phải BỊ ẨN các menu đặc quyền trên sidebar
    await expect(page.getByRole("link", { name: "Cài đặt" }).first()).not.toBeVisible();
    await expect(page.getByRole("link", { name: "Người dùng" }).first()).not.toBeVisible();
    await expect(page.getByRole("link", { name: "Yêu cầu báo giá" }).first()).not.toBeVisible();
  });

  // 5. Editor bị chặn ở các route admin-only quan trọng qua direct URL
  test("5. Editor should be blocked from accessing admin-only pages via direct URL", async ({ page }) => {
    // Login với tài khoản Editor trước
    await page.goto("/admin/login");
    await page.fill('input[type="email"]', "editor@furniture.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 15000 });

    // Thử truy cập trực tiếp URL trang Cài đặt -> access-denied
    await page.goto("/admin/settings");
    await expect(page).toHaveURL(/\/admin\/access-denied/);

    // Thử truy cập trực tiếp URL trang Người dùng -> access-denied
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/admin\/access-denied/);

    // Thử truy cập trực tiếp URL trang Báo giá -> access-denied
    await page.goto("/admin/quotes");
    await expect(page).toHaveURL(/\/admin\/access-denied/);
  });

  // 6. Product list load được (Sử dụng selector Div Grid thay vì table HTML)
  test("6. Product list should load successfully and display database products", async ({ page }) => {
    // Đăng nhập với quyền Admin
    await page.goto("/admin/login");
    await page.fill('input[type="email"]', "admin@furniture.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 15000 });

    // Đi tới trang danh sách sản phẩm
    await page.goto("/admin/products");
    await expect(page).toHaveURL(/\/admin\/products/);

    // Xác nhận container danh sách sản phẩm hiển thị
    const productsContainer = page.locator(".surface-soft.overflow-hidden").first();
    await expect(productsContainer).toBeVisible({ timeout: 10000 });
    
    // Kiểm tra tiêu đề header cột hiển thị
    await expect(page.locator("text=Sản phẩm").first()).toBeVisible();
    
    // Assert có ít nhất một dòng sản phẩm (dòng đầu tiên có thẻ h3 chứa tên sản phẩm)
    const productItem = page.locator("h3").first();
    await expect(productItem).toBeVisible({ timeout: 10000 });
  });

  // 7a. Admin truy cập Settings và Quotes thành công
  test("7a. Admin should access Settings and Quotes successfully", async ({ page }) => {
    // Đăng nhập quyền Admin
    await page.goto("/admin/login");
    await page.fill('input[type="email"]', "admin@furniture.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 15000 });

    // Đi đến trang báo giá thành công
    await page.goto("/admin/quotes");
    await expect(page).toHaveURL(/\/admin\/quotes/);
    
    // Xác nhận container danh sách quotes hiển thị
    const quotesContainer = page.locator(".surface-soft.overflow-hidden.rounded-xl").first();
    await expect(quotesContainer).toBeVisible({ timeout: 10000 });

    // Đi đến trang cấu hình thành công
    await page.goto("/admin/settings");
    await expect(page).toHaveURL(/\/admin\/settings/);
  });

  // 7b. Editor bị chặn truy cập trang báo giá
  test("7b. Editor should be blocked from accessing Quotes page", async ({ page }) => {
    // Đăng nhập quyền Editor
    await page.goto("/admin/login");
    await page.fill('input[type="email"]', "editor@furniture.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 15000 });
    
    // Cố truy cập trang báo giá -> Bị chặn sang access-denied
    await page.goto("/admin/quotes");
    await expect(page).toHaveURL(/\/admin\/access-denied/);
  });

  // 8. Logout hoạt động
  test("8. Logout functionality should invalidate session and redirect to login", async ({ page }) => {
    // Đăng nhập Admin
    await page.goto("/admin/login");
    await page.fill('input[type="email"]', "admin@furniture.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 15000 });

    // Click nút "Đăng xuất" ở sidebar
    const logoutBtn = page.getByRole("button", { name: /Đăng xuất/i }).first();
    await expect(logoutBtn).toBeVisible({ timeout: 10000 });
    await logoutBtn.click();

    // Verify chuyển hướng về login page
    await expect(page).toHaveURL(/\/admin\/login/);

    // Thử truy cập lại dashboard -> Phải bị redirect ngược về login
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

});
