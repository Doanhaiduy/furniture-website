import { test, expect } from "@playwright/test";
import { ADMIN_STATE, EDITOR_STATE, CREDENTIALS } from "./support/paths";
import { loginViaUI } from "./support/login";

/**
 * Auth + RBAC behaviour, rebuilt to assert real user-visible outcomes.
 *
 * What changed vs the old suite (all removed as false-confidence):
 *  - ADM-AUTH-10 "rate limiting" hit POST /api/auth/login, a route that does not exist,
 *    then asserted status !== 200 against the resulting 404. Deleted.
 *  - ADM-AUTH-24 asserted the profile trigger stays broken (rows.length === 0), i.e. it
 *    pinned a bug as expected behaviour and would fail once the app is fixed. Deleted;
 *    the underlying DB trigger gap is reported separately, not asserted here.
 *  - ADM-AUTH-01..04 asserted validation copy that the login form never renders
 *    (it uses native `required`); rewritten to assert the real no-navigation behaviour.
 */

test.describe("Login form (anonymous)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("empty submit is blocked and stays on the login page", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByRole("button", { name: /Đăng nhập/i }).click();
    // Native `required` fields prevent submission -> we never leave /admin/login.
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("wrong password shows an error and does not authenticate", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email đăng nhập").fill(CREDENTIALS.admin.email);
    await page.getByLabel("Mật khẩu").fill("definitely-wrong-password");
    await page.getByRole("button", { name: /Đăng nhập/i }).click();

    await expect(
      page.getByText("Thông tin đăng nhập không hợp lệ."),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("SQLi/XSS payload in email does not crash or authenticate", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email đăng nhập").fill("admin' OR 1=1;--@x.com");
    await page.getByLabel("Mật khẩu").fill("<script>alert(1)</script>");
    await page.getByRole("button", { name: /Đăng nhập/i }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("correct admin credentials land on the dashboard @smoke", async ({ page }) => {
    await loginViaUI(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
    await expect(page.getByText("Tổng quan").first()).toBeVisible();
  });

  test("anonymous access to an admin page redirects to login with redirectTo @smoke", async ({
    page,
  }) => {
    await page.goto("/admin/products");
    await expect(page).toHaveURL(/\/admin\/login\?redirectTo=%2Fadmin%2Fproducts/);
  });

  test("anonymous API access to an admin endpoint is rejected with 401", async ({
    request,
  }) => {
    const res = await request.get("/api/admin/settings");
    expect(res.status()).toBe(401);
  });
});

test.describe("Admin session", () => {
  test.use({ storageState: ADMIN_STATE });

  test("clearing cookies mid-session forces re-auth", async ({ page, context }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/?$/);
    await context.clearCookies();
    await page.goto("/admin/products");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

test.describe("Editor session (RBAC)", () => {
  test.use({ storageState: EDITOR_STATE });

  test("editor sees the dashboard but not admin-only navigation @smoke", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/?$/);
    await expect(page.getByText("Tổng quan").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Người dùng" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Cài đặt" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Yêu cầu báo giá" })).toHaveCount(0);
  });

  for (const path of ["/admin/users", "/admin/settings", "/admin/quotes"]) {
    test(`editor is redirected to access-denied when opening ${path}`, async ({
      page,
    }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/access-denied/);
    });
  }
});

/**
 * Logout is isolated + placed last: supabase signOut() defaults to GLOBAL scope, so it
 * revokes every session for the user (including the cached storage states). Using a fresh
 * throwaway login here means the global revoke at the end cannot poison earlier tests.
 */
test.describe("Logout (isolated, runs last)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("logout clears the session and blocks the dashboard afterwards", async ({
    page,
  }) => {
    await loginViaUI(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
    await page.getByRole("button", { name: /Đăng xuất/i }).first().click();
    await expect(page).toHaveURL(/\/admin\/login/);

    // Session is really gone: re-visiting the dashboard bounces back to login.
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);

    // signOut() is global, so it revoked the shared admin storage state too. Re-establish
    // a fresh admin session and overwrite the cache so later spec files stay unaffected.
    await loginViaUI(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
    await page.context().storageState({ path: ADMIN_STATE });
  });
});
