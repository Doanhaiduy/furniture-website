import { expect, type Page } from "@playwright/test";

/**
 * Perform a real UI login and wait until the dashboard is reached.
 * Shared by auth.setup.ts (to cache storage state) and by anonymous specs that
 * exercise the login flow itself.
 */
export async function loginViaUI(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto("/admin/login");
  await page.getByLabel("Email đăng nhập").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: /Đăng nhập/i }).click();
  await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 30000 });
}
