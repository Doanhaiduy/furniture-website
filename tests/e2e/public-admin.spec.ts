import { Buffer } from "node:buffer";
import { expect, test } from "@playwright/test";

test("public homepage shows company signal and two product groups", async ({ page }) => {
  await page.goto("/vi");
  await expect(page.locator("h1")).toContainText(/Kiến tạo không gian sống/i);
  await expect(page.locator(".public-hero-product-link")).toHaveCount(0);

  const heroGroupLinks = page.locator(".public-hero-group-link");
  await expect(heroGroupLinks).toHaveCount(2);
  await expect(heroGroupLinks.nth(0)).toHaveAttribute("href", /\/vi\/products\?category=wood/);
  await expect(heroGroupLinks.nth(1)).toHaveAttribute("href", /\/vi\/products\?category=sanitary/);

  const heroLinksInViewport = await heroGroupLinks.evaluateAll((links) =>
    links.every((link) => {
      const rect = link.getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= window.innerHeight;
    })
  );
  expect(heroLinksInViewport).toBe(true);

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

test("admin AI assistant exposes business-specific draft workflow", async ({ page }) => {
  await page.goto("/admin/ai-assistant");
  await expect(page.locator("main").getByRole("heading", { name: "Trợ lý AI", exact: true })).toBeVisible();
  await expect(page.getByText("Hỗ trợ bản nháp cho dịch nội dung")).toBeVisible();
  await page.getByRole("button", { name: /Tạo bản nháp/i }).click();
  await expect(page.getByText("Đang tạo đề xuất bản nháp...")).toBeVisible();
  await expect(page.getByText("Kết quả bản nháp")).toBeVisible();
  await page.getByRole("button", { name: /Chèn vào bản nháp của trình soạn thảo/i }).click();
  await expect(page.getByRole("button", { name: /Đã chèn bản nháp để kiểm duyệt/i })).toBeVisible();
});

test("admin dashboard controls navigate or update state", async ({ page }) => {
  await page.goto("/admin");
  await page.getByRole("button", { name: /04\/06: 9 yêu cầu báo giá/i }).click();
  await expect(page.getByRole("link", { name: /Mở việc ngày 04\/06/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /04\/06: 9 yêu cầu báo giá/i })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Thu gọn thanh trên" }).click();
  await expect(page.getByRole("button", { name: "Mở rộng thanh trên" })).toBeVisible();
  await page.getByRole("button", { name: "Thu gọn thanh bên" }).click();
  await expect(page.getByRole("button", { name: "Mở rộng thanh bên" })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 900));
  const sticky = await page.evaluate(() => ({
    headerTop: document.querySelector("header")?.getBoundingClientRect().top ?? -1,
    sidebarTop: document.querySelector("aside")?.getBoundingClientRect().top ?? -1,
  }));
  expect(sticky.headerTop).toBeLessThan(24);
  expect(sticky.sidebarTop).toBeLessThan(24);

  await page.getByRole("link", { name: /Quản lý danh mục/i }).click();
  await expect(page).toHaveURL(/\/admin\/categories/);

  await page.goto("/admin/categories?create=1");
  await expect(page.getByRole("dialog", { name: "Thêm danh mục" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/admin\/categories$/);
});

test("admin create dialogs and bilingual fields use overlay workflows", async ({ page }) => {
  await page.goto("/admin/products?create=1");
  const productDialog = page.getByRole("dialog", { name: "Thêm sản phẩm" });
  await expect(productDialog).toBeVisible();
  await expect(page.getByText("Trình soạn thảo sản phẩm ưu tiên tiếng Việt")).toBeVisible();
  const dialogBox = await productDialog.boundingBox();
  expect(dialogBox?.width ?? 0).toBeGreaterThan(700);

  await page.getByLabel("Bật trường tiếng Anh").check();
  await expect(page.getByLabel("Tiêu đề sản phẩm - Tiếng Anh")).toBeVisible();
  await page.getByRole("button", { name: /Dịch bằng AI/i }).click();
  await expect(page.getByLabel("Tiêu đề sản phẩm - Tiếng Anh")).toHaveValue(/English draft/);
  await expect(page.getByText("AI đã điền các trường tiếng Anh")).toBeVisible();

  await page.goto("/admin/categories");
  await page.getByRole("button", { name: "Xuất bản" }).click();
  const confirmDialog = page.getByRole("dialog", { name: "Xác nhận xuất bản" });
  await expect(confirmDialog).toBeVisible();
  const position = await confirmDialog.evaluate((element) => getComputedStyle(element).position);
  expect(position).toBe("fixed");
  await page.keyboard.press("Escape");
  await expect(confirmDialog).toBeHidden();
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

test("admin settings site sections keep hero editing and toggles only", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.removeItem("pd-cms-settings"));
  await page.goto("/admin/settings?tab=sections");
  await expect(page.getByTestId("settings-client-ready")).toHaveAttribute("data-ready", "true");
  await expect(page.getByRole("tab", { name: /Khu vực trang chủ/i })).toHaveAttribute("aria-selected", "true");

  await expect(page.getByText("Hero và slide banner")).toBeVisible();
  await expect(page.getByLabel("Tiêu đề slide 1 (Tiếng Việt) *")).toBeVisible();
  await expect(page.getByLabel("Tiêu đề slide 2 (Tiếng Việt) *")).toBeVisible();
  await expect(page.getByLabel("Tiêu đề slide 3 (Tiếng Việt) *")).toBeVisible();

  await expect(page.getByText("Hiển thị khu vực")).toBeVisible();
  const visibilityToggles = [
    "Khu vực giới thiệu / câu chuyện thương hiệu hiển thị",
    "Khu vực sản phẩm nổi bật hiển thị",
    "Khu vực bài viết / tin tức hiển thị",
    "Khu vực showroom hiển thị",
    "Khu vực yêu cầu báo giá hiển thị",
    "Khu vực huy hiệu tin cậy / đối tác hiển thị",
  ];

  for (const toggle of visibilityToggles) {
    await expect(page.getByLabel(toggle)).toBeChecked();
  }

  await page.getByLabel("Khu vực bài viết / tin tức hiển thị").uncheck();
  await expect(page.getByLabel("Khu vực bài viết / tin tức hiển thị")).not.toBeChecked();
  await expect(page.getByText("Nội dung chi tiết của các khu vực trang chủ lấy từ dữ liệu API.")).toBeVisible();

  await expect(page.getByLabel("Max featured items")).toHaveCount(0);
  await expect(page.getByLabel("Max blog posts")).toHaveCount(0);
  await expect(page.getByLabel("Story Heading (VI) *")).toHaveCount(0);
  await expect(page.getByLabel("Section Heading (VI) *")).toHaveCount(0);
  await expect(page.getByText("Live Preview")).toHaveCount(0);
  await expect(page.getByTestId("settings-homepage-preview-desktop")).toHaveCount(0);
  await expect(page.getByTestId("settings-homepage-preview-mobile")).toHaveCount(0);

  await page.getByLabel("Tải ảnh slide 1 hero").setInputFiles({
    name: "hero-preview.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
      "base64"
    ),
  });
  await expect(page.getByAltText("Tải ảnh slide 1 hero xem trước")).toHaveAttribute("src", /^data:image\/png/);
});
