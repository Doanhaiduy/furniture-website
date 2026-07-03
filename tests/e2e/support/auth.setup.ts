import { test as setup, expect } from "@playwright/test";
import fs from "fs";
import { AUTH_DIR, ADMIN_STATE, EDITOR_STATE, CREDENTIALS } from "./paths";
import { loginViaUI } from "./login";

setup.beforeAll(() => {
  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });
});

// Tagged @smoke so `--grep @smoke` still runs the login setup that smoke specs depend on.
setup("authenticate as admin @smoke", async ({ page }) => {
  await loginViaUI(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  // Sanity: admin sees privileged nav that editors do not.
  await expect(
    page.getByRole("link", { name: "Người dùng" }).first(),
  ).toBeVisible({ timeout: 15000 });
  await page.context().storageState({ path: ADMIN_STATE });
});

setup("authenticate as editor @smoke", async ({ page }) => {
  await loginViaUI(page, CREDENTIALS.editor.email, CREDENTIALS.editor.password);
  // Sanity: editor must NOT see the admin-only "Người dùng" link.
  await expect(
    page.getByRole("link", { name: "Người dùng" }).first(),
  ).toHaveCount(0);
  await page.context().storageState({ path: EDITOR_STATE });
});
