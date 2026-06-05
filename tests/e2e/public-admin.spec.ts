import { expect, test } from "@playwright/test";

test("public homepage shows company signal and two product groups", async ({ page }) => {
  await page.goto("/vi");
  await expect(page.locator("h1")).toContainText(/Kiến tạo không gian sống/i);
  await expect(page.getByRole("link", { name: /Nội thất & đồ gỗ/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Thiết bị vệ sinh/i }).first()).toBeVisible();

  await page.getByRole("button", { name: /Danh mục hãng/i }).hover();
  await expect(page.getByText("Tất cả hãng")).toBeVisible();
  await page.getByRole("button", { name: "Grohe" }).hover();
  await expect(page.getByRole("link", { name: /Sen tắm Grohe/i })).toBeVisible();

  await page.getByRole("navigation", { name: "Catalog" }).getByRole("link", { name: "Thiết bị vệ sinh" }).hover({ force: true });
  await expect(page.getByRole("link", { name: "Bồn tắm" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Bồn cầu" })).toBeVisible();
});

test("locale switch keeps the equivalent public page", async ({ page }) => {
  await page.goto("/vi/products");
  await page.locator('a[href="/en/products"]').filter({ hasText: "EN" }).click();
  await expect(page).toHaveURL(/\/en\/products/);
  await expect(page.getByRole("heading", { name: /Living room wooden furniture/i })).toBeVisible();
});

test("product listing supports collapsed filters and compact catalog density", async ({ page }) => {
  await page.goto("/vi/products");
  await expect(page.getByRole("button", { name: /Xem thêm bộ lọc/i })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Không gian" })).toBeHidden();

  const productCards = page.getByTestId("product-card");
  await expect(productCards.first()).toBeVisible();
  const productCardCount = await productCards.count();
  expect(productCardCount).toBeGreaterThan(3);
  expect(productCardCount).toBeLessThanOrEqual(9);
  const firstCardBox = await productCards.first().boundingBox();
  expect(firstCardBox?.height ?? 999).toBeLessThan(430);

  await page.getByRole("button", { name: /Xem thêm bộ lọc/i }).click();
  await expect(page.getByRole("combobox", { name: "Không gian" })).toBeVisible();
});

test("product to quote flow preloads contact form", async ({ page }) => {
  await page.goto("/vi/products/sofa-curve-velour");
  await page.getByRole("link", { name: /Nhận báo giá ngay/i }).first().click();
  await expect(page).toHaveURL(/\/vi\/contact\?product=sofa-curve-velour/);
  await expect(page.getByRole("heading", { name: "Thông tin yêu cầu" })).toBeVisible();
});

test("blog list and detail expose editorial reading structure", async ({ page }) => {
  await page.goto("/en/blog");
  await expect(page.getByRole("heading", { name: /Explore spaces and design inspiration/i })).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(3);

  await page.getByRole("link", { name: /How to choose walnut wood/i }).first().click();
  await expect(page).toHaveURL(/\/en\/blog\/bi-quyet-chon-go-oc-cho/);
  await expect(page.getByRole("heading", { name: /How to choose walnut wood/i })).toBeVisible();
  await expect(page.getByRole("navigation", { name: /Contents/i }).first()).toBeVisible();
  await expect(page.getByText("Key takeaways")).toBeVisible();
});

test("admin prototype exposes CMS states and AI draft workflow", async ({ page }) => {
  await page.goto("/admin/ai-assistant");
  await expect(page.getByRole("heading", { name: "AI draft workflow" })).toBeVisible();
  await page.getByRole("button", { name: /Viết nháp/i }).click();
  await expect(page.getByText("Đang tạo đề xuất...")).toBeVisible();
  await expect(page.getByText("Đề xuất Meta Description")).toBeVisible();
});

test("admin dashboard controls navigate or update state", async ({ page }) => {
  await page.goto("/admin");
  await page.getByRole("button", { name: /Open calendar for 02 Jun/i }).first().click();
  await expect(page.getByRole("grid", { name: /June 2026 admin schedule calendar/i })).toBeVisible();
  await page.getByRole("gridcell", { name: /04 Jun/i }).click();
  await expect(page.getByRole("grid", { name: /June 2026 admin schedule calendar/i })).toBeHidden();
  await expect(page.getByRole("button", { name: /Open calendar for 04 Jun/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Open 04 Jun work/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /04 Jun 9 quote leads/i })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Thu gon header" }).click();
  await expect(page.getByRole("button", { name: "Mo rong header" })).toBeVisible();
  await page.getByRole("button", { name: "Thu gon sidebar" }).click();
  await expect(page.getByRole("button", { name: "Mo rong sidebar" })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 900));
  const sticky = await page.evaluate(() => ({
    headerTop: document.querySelector("header")?.getBoundingClientRect().top ?? -1,
    sidebarTop: document.querySelector("aside")?.getBoundingClientRect().top ?? -1,
  }));
  expect(sticky.headerTop).toBeLessThan(24);
  expect(sticky.sidebarTop).toBeLessThan(24);

  await page.getByRole("link", { name: /Quản lý danh mục/i }).click();
  await expect(page).toHaveURL(/\/admin\/categories/);

  await page.goto("/admin/categories?new=1");
  await expect(page.getByRole("heading", { name: "Thêm danh mục" })).toBeVisible();
});

test("admin section routes render inside the admin shell", async ({ page }) => {
  const routes = [
    "/admin/products",
    "/admin/blog",
    "/admin/showrooms",
    "/admin/media",
    "/admin/quotes",
    "/admin/users",
    "/admin/settings",
    "/admin/ai-assistant",
  ];

  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator(".admin-app")).toBeVisible();
  }
});
