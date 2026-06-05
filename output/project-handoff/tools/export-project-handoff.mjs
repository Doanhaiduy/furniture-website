import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.HANDOFF_BASE_URL || "http://127.0.0.1:3000";
const generatedAt = new Date().toISOString();
const root = path.resolve("output/project-handoff");

const dirs = {
  screenshots: path.join(root, "screenshots"),
  desktop: path.join(root, "screenshots", "desktop"),
  tablet: path.join(root, "screenshots", "tablet"),
  mobile: path.join(root, "screenshots", "mobile"),
  states: path.join(root, "screenshots", "states"),
  figma: path.join(root, "figma-ready"),
  figmaAssets: path.join(root, "figma-ready", "assets"),
  figmaScreens: path.join(root, "figma-ready", "screens"),
  figmaDesktop: path.join(root, "figma-ready", "screens", "desktop"),
  figmaTablet: path.join(root, "figma-ready", "screens", "tablet"),
  figmaMobile: path.join(root, "figma-ready", "screens", "mobile"),
  figmaStates: path.join(root, "figma-ready", "screens", "states"),
};

const breakpoints = [
  {
    key: "desktop",
    label: "Desktop",
    width: 1440,
    height: 1000,
    deviceScaleFactor: 2,
    media: "screen",
    note: "Primary stakeholder review canvas.",
  },
  {
    key: "tablet",
    label: "Tablet",
    width: 834,
    height: 1112,
    deviceScaleFactor: 2,
    media: "screen",
    note: "Mid-size layout check for navigation, grids, forms, and admin tables.",
  },
  {
    key: "mobile",
    label: "Mobile",
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    media: "screen",
    isMobile: true,
    note: "Phone viewport for stacked content, mobile menu, forms, and admin mobile nav.",
  },
];

const screens = [
  {
    id: "public-home-vi",
    name: "Public Home VI",
    route: "/vi",
    area: "public",
    locale: "vi",
    template: "home",
    components: ["PublicShell", "HeroShowcase", "ProductCard", "RemoteImage", "Newsletter"],
    notes: ["Hero carousel, sticky header, catalog bar, homepage content bands, footer newsletter."],
  },
  {
    id: "public-home-en",
    name: "Public Home EN",
    route: "/en",
    area: "public",
    locale: "en",
    template: "home",
    components: ["PublicShell", "HeroShowcase", "ProductCard", "RemoteImage", "Newsletter"],
    notes: ["English locale parity for homepage route and language switch behavior."],
  },
  {
    id: "public-about-vi",
    name: "About VI",
    route: "/vi/about",
    area: "public",
    locale: "vi",
    template: "content",
    components: ["PublicShell", "RemoteImage", "ValueCard", "Timeline"],
    notes: ["Company story, trust statements, visual background treatment."],
  },
  {
    id: "public-products-vi",
    name: "Products VI",
    route: "/vi/products",
    area: "public",
    locale: "vi",
    template: "listing",
    components: ["PublicShell", "ProductFilterPanel", "ProductSortSelect", "ProductCard", "PremiumSelect"],
    notes: ["Product listing, filters, sort control, cards, pagination."],
  },
  {
    id: "public-products-filtered-vi",
    name: "Products Filtered VI",
    route: "/vi/products?category=wood&material=walnut&room=living",
    area: "public",
    locale: "vi",
    template: "listing-filtered",
    components: ["ProductFilterPanel", "ProductSortSelect", "ProductCard", "PremiumSelect"],
    notes: ["Query-driven filtered list state for client review."],
  },
  {
    id: "public-products-en",
    name: "Products EN",
    route: "/en/products",
    area: "public",
    locale: "en",
    template: "listing",
    components: ["PublicShell", "ProductFilterPanel", "ProductSortSelect", "ProductCard", "PremiumSelect"],
    notes: ["English listing route and filter labels."],
  },
  {
    id: "public-product-detail-vi",
    name: "Product Detail VI",
    route: "/vi/products/sofa-curve-velour",
    area: "public",
    locale: "vi",
    template: "product-detail",
    components: ["ProductGallery", "Dialog", "Tabs", "SaveSelectionButton", "QuoteForm"],
    notes: ["Gallery, modal trigger, detail tabs, selected thumbnail, quote CTA/form."],
  },
  {
    id: "public-product-detail-en",
    name: "Product Detail EN",
    route: "/en/products/sofa-curve-velour",
    area: "public",
    locale: "en",
    template: "product-detail",
    components: ["ProductGallery", "Dialog", "Tabs", "SaveSelectionButton", "QuoteForm"],
    notes: ["English product detail parity."],
  },
  {
    id: "public-blog-vi",
    name: "Blog Listing VI",
    route: "/vi/blog",
    area: "public",
    locale: "vi",
    template: "listing-editorial",
    components: ["PublicShell", "ArticleCard", "RemoteImage"],
    notes: ["Blog index with editorial cards and localized metadata."],
  },
  {
    id: "public-blog-en",
    name: "Blog Listing EN",
    route: "/en/blog",
    area: "public",
    locale: "en",
    template: "listing-editorial",
    components: ["PublicShell", "ArticleCard", "RemoteImage"],
    notes: ["English blog listing route."],
  },
  {
    id: "public-blog-detail-vi",
    name: "Blog Detail VI",
    route: "/vi/blog/bi-quyet-chon-go-oc-cho",
    area: "public",
    locale: "vi",
    template: "article",
    components: ["ArticleToc", "SocialShare", "RemoteImage"],
    notes: ["Long-form article, table of contents, share controls, related content."],
  },
  {
    id: "public-blog-detail-en",
    name: "Blog Detail EN",
    route: "/en/blog/bi-quyet-chon-go-oc-cho",
    area: "public",
    locale: "en",
    template: "article",
    components: ["ArticleToc", "SocialShare", "RemoteImage"],
    notes: ["English article detail route."],
  },
  {
    id: "public-showrooms-vi",
    name: "Showrooms VI",
    route: "/vi/showrooms",
    area: "public",
    locale: "vi",
    template: "showrooms",
    components: ["PublicShell", "ShowroomCard", "RemoteImage", "GoogleMapEmbed"],
    notes: ["Showroom cards, address/hotline content, map embed area."],
  },
  {
    id: "public-contact-vi",
    name: "Contact VI",
    route: "/vi/contact",
    area: "public",
    locale: "vi",
    template: "contact",
    components: ["QuoteForm", "PremiumSelect", "PublicShell"],
    notes: ["Lead capture form, service select, validation, response-time note."],
  },
  {
    id: "public-contact-en",
    name: "Contact EN",
    route: "/en/contact",
    area: "public",
    locale: "en",
    template: "contact",
    components: ["QuoteForm", "PremiumSelect", "PublicShell"],
    notes: ["English contact and quote route."],
  },
  {
    id: "public-contact-success-vi",
    name: "Contact Success VI",
    route: "/vi/contact/success",
    area: "public",
    locale: "vi",
    template: "feedback",
    components: ["PublicShell", "FeedbackState"],
    notes: ["Successful quote submission confirmation state."],
  },
  {
    id: "public-contact-error-vi",
    name: "Contact Error VI",
    route: "/vi/contact/error",
    area: "public",
    locale: "vi",
    template: "feedback",
    components: ["PublicShell", "FeedbackState"],
    notes: ["Server-side quote submission error route."],
  },
  {
    id: "public-not-found-vi",
    name: "Not Found VI",
    route: "/vi/not-found-demo",
    area: "public",
    locale: "vi",
    template: "feedback",
    components: ["PublicShell", "NotFoundState"],
    notes: ["Localized 404 fallback for unknown public routes."],
  },
  {
    id: "admin-dashboard",
    name: "Admin Dashboard",
    route: "/admin",
    area: "admin",
    locale: "vi",
    template: "admin-dashboard",
    components: ["AdminShell", "AdminDatePicker", "DashboardInsightChart", "QuoteTable", "WarningPanel"],
    notes: ["KPI cards, shared date selection, utility rail, fixed admin background."],
  },
  {
    id: "admin-products",
    name: "Admin Products",
    route: "/admin/products",
    area: "admin",
    locale: "vi",
    template: "admin-table",
    components: ["AdminShell", "FilterCard", "PremiumSelect", "StatusPill", "ProductTable"],
    notes: ["Admin filters, table rows, status pills, active selected nav state."],
  },
  {
    id: "admin-product-create",
    name: "Admin Product Create",
    route: "/admin/products?new=1",
    area: "admin",
    locale: "vi",
    template: "admin-editor",
    components: ["AdminShell", "EditorLocaleTabs", "RichTextEditorMock", "AiDraftWorkflow", "PublishWorkflow"],
    notes: ["Product editor state with unsaved changes, AI draft, publish workflow."],
  },
  {
    id: "admin-categories",
    name: "Admin Categories",
    route: "/admin/categories",
    area: "admin",
    locale: "vi",
    template: "admin-cards",
    components: ["AdminShell", "StatusPill", "PublishWorkflow"],
    notes: ["Category cards and publish controls."],
  },
  {
    id: "admin-category-create",
    name: "Admin Category Create",
    route: "/admin/categories?new=1",
    area: "admin",
    locale: "vi",
    template: "admin-editor",
    components: ["AdminShell", "EditorLocaleTabs", "PremiumSelect", "PublishWorkflow"],
    notes: ["Category create/edit fields, parent category select, warnings."],
  },
  {
    id: "admin-blog-editor",
    name: "Admin Blog Editor",
    route: "/admin/blog",
    area: "admin",
    locale: "vi",
    template: "admin-editor",
    components: ["AdminShell", "EditorLocaleTabs", "RichTextEditorMock", "AiDraftWorkflow", "PublishWorkflow"],
    notes: ["Bilingual editor, slug conflict, AI draft, publish modal trigger."],
  },
  {
    id: "admin-showrooms",
    name: "Admin Showrooms",
    route: "/admin/showrooms",
    area: "admin",
    locale: "vi",
    template: "admin-cards",
    components: ["AdminShell", "ShowroomCard", "PublishWorkflow"],
    notes: ["Showroom cards with image lift and publish controls."],
  },
  {
    id: "admin-media",
    name: "Admin Media",
    route: "/admin/media",
    area: "admin",
    locale: "vi",
    template: "admin-media",
    components: ["AdminShell", "MediaUploadPanel", "FeedbackState"],
    notes: ["Media upload panel, error state, owner/context governance note."],
  },
  {
    id: "admin-quotes",
    name: "Admin Quotes",
    route: "/admin/quotes",
    area: "admin",
    locale: "vi",
    template: "admin-table",
    components: ["AdminShell", "QuoteTable", "QuoteStatusUpdater", "PremiumSelect"],
    notes: ["Admin-only quote table and status updater."],
  },
  {
    id: "admin-users",
    name: "Admin Users",
    route: "/admin/users",
    area: "admin",
    locale: "vi",
    template: "admin-table",
    components: ["AdminShell", "StatusPill", "RoleList"],
    notes: ["Admin-only user list and role model display."],
  },
  {
    id: "admin-settings",
    name: "Admin Settings",
    route: "/admin/settings",
    area: "admin",
    locale: "vi",
    template: "admin-settings",
    components: ["AdminShell", "SettingsCard", "WarningPanel"],
    notes: ["Brand, SEO, social, integration settings cards."],
  },
  {
    id: "admin-ai-assistant",
    name: "Admin AI Assistant",
    route: "/admin/ai-assistant",
    area: "admin",
    locale: "vi",
    template: "admin-ai",
    components: ["AdminShell", "AiDraftWorkflow", "AdminUtilityRail"],
    notes: ["Draft-only AI workflow with human review queue."],
  },
  {
    id: "admin-login",
    name: "Admin Login",
    route: "/admin/login",
    area: "admin",
    locale: "vi",
    template: "auth",
    components: ["AdminLoginPage", "RemoteImage", "LoginForm"],
    notes: ["Demo admin login route."],
  },
  {
    id: "admin-access-denied",
    name: "Admin Access Denied",
    route: "/admin/access-denied",
    area: "admin",
    locale: "vi",
    template: "feedback",
    components: ["AccessDeniedPage", "AdminShell"],
    notes: ["Role Model Option A restricted-access state."],
  },
];

const interactionStates = [
  {
    id: "public-catalog-brands-open",
    name: "Public Catalog Brands Open",
    route: "/vi",
    area: "public",
    breakpoint: "desktop",
    state: "open",
    components: ["PublicShell", "CatalogMegaMenu"],
    notes: ["Catalog trigger exposes aria-expanded and renders the brand mega menu."],
    action: async (page) => {
      await page.locator('button[aria-controls="catalog-mega-menu"]').first().click();
      await shortWait(page);
    },
  },
  {
    id: "public-catalog-type-hover",
    name: "Public Catalog Type Hover",
    route: "/vi",
    area: "public",
    breakpoint: "desktop",
    state: "hover-open",
    components: ["PublicShell", "CatalogMegaMenu"],
    notes: ["Type catalog opens from hover/focus and shows category columns."],
    action: async (page) => {
      await page.locator('nav[aria-label="Catalog"] a[aria-controls="catalog-mega-menu"]').first().hover();
      await shortWait(page);
    },
  },
  {
    id: "public-mobile-menu-open",
    name: "Public Mobile Menu Open",
    route: "/vi",
    area: "public",
    breakpoint: "mobile",
    state: "open",
    components: ["PublicShell", "MobileNav"],
    notes: ["Mobile menu expands below the sticky header with nav, catalog, locale, and quote CTA."],
    action: async (page) => {
      await page.locator("header button[aria-label]").first().click();
      await shortWait(page);
    },
  },
  {
    id: "public-product-image-modal-open",
    name: "Product Image Modal Open",
    route: "/vi/products/sofa-curve-velour",
    area: "public",
    breakpoint: "desktop",
    state: "modal-open",
    components: ["ProductGallery", "Dialog", "RemoteImage"],
    notes: ["Image dialog opens from a real gallery trigger and is portaled above the page."],
    action: async (page) => {
      await page.locator('main button[aria-label]').first().click();
      await shortWait(page);
    },
  },
  {
    id: "public-product-selected-thumbnail",
    name: "Product Selected Thumbnail",
    route: "/vi/products/sofa-curve-velour",
    area: "public",
    breakpoint: "desktop",
    state: "selected",
    components: ["ProductGallery"],
    notes: ["Thumbnail button aria-pressed and visual selected bar update with active image."],
    action: async (page) => {
      const thumbs = page.locator('[aria-label^="Thu"], [aria-label^="Gallery"], button[aria-pressed]');
      if ((await thumbs.count()) > 2) {
        await thumbs.nth(2).click();
      }
      await shortWait(page);
    },
  },
  {
    id: "public-product-tabs-specifications",
    name: "Product Specifications Tab",
    route: "/vi/products/sofa-curve-velour",
    area: "public",
    breakpoint: "desktop",
    state: "selected-tab",
    components: ["ProductInformationTabs", "Tabs"],
    notes: ["Radix tab selected state changes content and tab treatment."],
    action: async (page) => {
      await page.locator('[role="tab"]').nth(1).click();
      await shortWait(page);
    },
  },
  {
    id: "public-products-filters-expanded",
    name: "Products Filters Expanded",
    route: "/vi/products",
    area: "public",
    breakpoint: "desktop",
    state: "expanded",
    components: ["ProductFilterPanel", "PremiumSelect"],
    notes: ["Advanced filter region expands from the filter trigger."],
    action: async (page) => {
      await page.locator("form button[aria-controls]").first().click();
      await shortWait(page);
    },
  },
  {
    id: "public-products-filter-select-open",
    name: "Products Filter Select Open",
    route: "/vi/products",
    area: "public",
    breakpoint: "desktop",
    state: "select-open",
    components: ["ProductFilterPanel", "PremiumSelect", "SelectContent"],
    notes: ["Radix select content renders above the filter panel without clipping."],
    action: async (page) => {
      await page.locator('form [role="combobox"]').first().click();
      await shortWait(page);
    },
  },
  {
    id: "public-contact-service-select-open",
    name: "Contact Service Select Open",
    route: "/vi/contact",
    area: "public",
    breakpoint: "desktop",
    state: "select-open",
    components: ["QuoteForm", "PremiumSelect", "SelectContent"],
    notes: ["Service select popover opens in the quote form."],
    action: async (page) => {
      await page.locator('form [role="combobox"]').first().click();
      await shortWait(page);
    },
  },
  {
    id: "public-contact-validation-errors",
    name: "Contact Validation Errors",
    route: "/vi/contact",
    area: "public",
    breakpoint: "desktop",
    state: "error",
    components: ["QuoteForm", "ReactHookForm", "Zod"],
    notes: ["Client validation errors display without submitting invalid lead data."],
    action: async (page) => {
      await page.locator('form button[type="submit"]').first().click();
      await shortWait(page);
    },
  },
  {
    id: "public-product-card-hover",
    name: "Product Card Hover",
    route: "/vi/products",
    area: "public",
    breakpoint: "desktop",
    state: "hover",
    components: ["ProductCard", "InteractiveCard"],
    notes: ["Card hover uses lift, border, shadow, and image motion treatment."],
    action: async (page) => {
      await page.locator('main a[href*="/products/"]').first().hover();
      await shortWait(page);
    },
  },
  {
    id: "public-fixed-background-visible",
    name: "Public Fixed Background Visible",
    route: "/vi/about",
    area: "public",
    breakpoint: "desktop",
    state: "scrolled",
    components: ["PublicShell", "FixedBackground"],
    notes: ["Public fixed background layer remains stable behind scrolled content."],
    action: async (page) => {
      await page.evaluate(() => window.scrollTo(0, 520));
      await shortWait(page);
    },
  },
  {
    id: "admin-calendar-open",
    name: "Admin Calendar Open",
    route: "/admin",
    area: "admin",
    breakpoint: "desktop",
    state: "calendar-open",
    components: ["AdminDatePicker", "Popover", "DashboardInsightChart"],
    notes: ["Calendar trigger opens a real dialog popover with selected date and scheduled cells."],
    action: async (page) => {
      await page.locator('[data-admin-calendar-trigger="chart"]').click();
      await shortWait(page);
    },
  },
  {
    id: "admin-calendar-selected-date",
    name: "Admin Calendar Selected Date",
    route: "/admin",
    area: "admin",
    breakpoint: "desktop",
    state: "selected-date",
    components: ["AdminDateProvider", "AdminDatePicker", "DashboardInsightChart", "AdminUtilityRail"],
    notes: ["Selecting 04 Jun updates chart, calendar state, rail metrics, and work link context."],
    action: async (page) => {
      await page.locator('[data-admin-calendar-trigger="chart"]').click();
      await shortWait(page);
      await page.locator('button[aria-label*="04 Jun"]').first().click();
      await shortWait(page);
    },
  },
  {
    id: "admin-products-select-open",
    name: "Admin Products Select Open",
    route: "/admin/products",
    area: "admin",
    breakpoint: "desktop",
    state: "select-open",
    components: ["FilterCard", "PremiumSelect", "SelectContent"],
    notes: ["Admin select trigger uses visible open state and portal layering."],
    action: async (page) => {
      await page.locator('form [role="combobox"]').first().click();
      await shortWait(page);
    },
  },
  {
    id: "admin-notifications-open",
    name: "Admin Notifications Open",
    route: "/admin",
    area: "admin",
    breakpoint: "desktop",
    state: "popover-open",
    components: ["NotificationButton", "Popover"],
    notes: ["Notification popover opens above the sticky header without clipping."],
    action: async (page) => {
      await page.locator('button[aria-label="Notifications"]').click();
      await shortWait(page);
    },
  },
  {
    id: "admin-publish-confirmation-modal",
    name: "Admin Publish Confirmation Modal",
    route: "/admin/blog",
    area: "admin",
    breakpoint: "desktop",
    state: "modal-open",
    components: ["PublishWorkflow", "DialogState"],
    notes: ["Publish action opens real confirmation modal with backdrop and dialog semantics."],
    action: async (page) => {
      await page.locator(".card-pd button.button-pd").first().click();
      await shortWait(page);
    },
  },
  {
    id: "admin-rich-text-active-controls",
    name: "Admin Rich Text Active Controls",
    route: "/admin/blog",
    area: "admin",
    breakpoint: "desktop",
    state: "active",
    components: ["RichTextEditorMock"],
    notes: ["Bold, italic, and image buttons expose aria-pressed and active treatment."],
    action: async (page) => {
      await page.locator('button[aria-label="Bold"]').click();
      await page.locator('button[aria-label="Italic"]').click();
      await page.locator('button[aria-label]').filter({ has: page.locator("svg") }).last().click();
      await shortWait(page);
    },
  },
  {
    id: "admin-locale-tab-selected",
    name: "Admin Locale Tab Selected",
    route: "/admin/blog",
    area: "admin",
    breakpoint: "desktop",
    state: "selected-tab",
    components: ["EditorLocaleTabs"],
    notes: ["Editor locale tab changes selected visual state and context text."],
    action: async (page) => {
      await page.locator('[role="tab"]').filter({ hasText: "EN" }).click();
      await shortWait(page);
    },
  },
  {
    id: "admin-ai-draft-accepted",
    name: "Admin AI Draft Accepted",
    route: "/admin/ai-assistant",
    area: "admin",
    breakpoint: "desktop",
    state: "result-accepted",
    components: ["AiDraftWorkflow"],
    notes: ["AI creates draft-only result; accepted state is explicit and still human-reviewed."],
    action: async (page) => {
      await page.locator("main .relative.overflow-hidden button").first().click();
      await page.waitForTimeout(900);
      await page.locator("main .relative.overflow-hidden button").last().click();
      await shortWait(page);
    },
  },
  {
    id: "admin-media-selected-file",
    name: "Admin Media Selected File",
    route: "/admin/media",
    area: "admin",
    breakpoint: "desktop",
    state: "selected",
    components: ["MediaUploadPanel"],
    notes: ["Media panel selected-file state updates visible feedback."],
    action: async (page) => {
      await page.locator("main .surface-soft button.button-pd").first().click();
      await shortWait(page);
    },
  },
  {
    id: "admin-fixed-background-visible",
    name: "Admin Fixed Background Visible",
    route: "/admin/settings",
    area: "admin",
    breakpoint: "desktop",
    state: "scrolled",
    components: ["AdminShell", "FixedBackground"],
    notes: ["Admin fixed background layer stays behind panels and sticky shell while scrolled."],
    action: async (page) => {
      await page.evaluate(() => window.scrollTo(0, 420));
      await shortWait(page);
    },
  },
  {
    id: "admin-sidebar-collapsed",
    name: "Admin Sidebar Collapsed",
    route: "/admin",
    area: "admin",
    breakpoint: "desktop",
    state: "collapsed",
    components: ["AdminShell", "SidebarNav"],
    notes: ["Sidebar collapse uses aria-pressed and stable width transition."],
    action: async (page) => {
      await page.locator('aside button[aria-pressed]').first().click();
      await shortWait(page);
    },
  },
];

const componentInventory = [
  {
    name: "PublicShell",
    file: "components/showroom/public-shell.tsx",
    area: "public",
    purpose: "Localized site shell with sticky header, desktop catalog mega menu, mobile navigation, footer, newsletter.",
    states: ["active route", "catalog open", "catalog hover", "mobile menu open", "newsletter submitted", "focus"],
    responsive: "Desktop has primary nav + catalog bar; tablet/phone collapse to mobile menu.",
  },
  {
    name: "HeroShowcase",
    file: "components/showroom/hero-showcase.tsx",
    area: "public",
    purpose: "Homepage carousel with active, adjacent, paused, and reduced-motion behavior.",
    states: ["active slide", "previous/next", "paused", "dot selected", "hover/focus controls"],
    responsive: "Center crop full-bleed experience with constrained carousel height.",
  },
  {
    name: "ProductFilterPanel",
    file: "components/showroom/product-filter-panel.tsx",
    area: "public",
    purpose: "Query-driven product filtering with expandable advanced fields.",
    states: ["collapsed", "expanded", "select open", "query applied", "reset"],
    responsive: "Four-column desktop; stacked controls on mobile.",
  },
  {
    name: "PremiumSelect",
    file: "components/showroom/premium-select.tsx",
    area: "shared",
    purpose: "Radix select wrapper with public/admin tones and portal content.",
    states: ["default", "hover", "focus", "open", "selected"],
    responsive: "Popover width follows trigger/content and uses collision handling.",
  },
  {
    name: "ProductCard",
    file: "components/showroom/product-card.tsx",
    area: "public",
    purpose: "Product list card with image, category, tags, price/quote copy, hover lift.",
    states: ["default", "hover", "focus"],
    responsive: "Grid item; image ratio and text hierarchy remain stable across columns.",
  },
  {
    name: "ProductGallery",
    file: "components/showroom/product-detail-experience.tsx",
    area: "public",
    purpose: "Product detail media gallery with selected thumbnails and image modal.",
    states: ["selected thumbnail", "image modal open", "hover image", "focus"],
    responsive: "Large image stacks with thumbnails; modal uses viewport max sizing.",
  },
  {
    name: "ProductInformationTabs",
    file: "components/showroom/product-detail-experience.tsx",
    area: "public",
    purpose: "Tabbed product content for overview, specs, materials, care, delivery.",
    states: ["selected tab", "focus", "content transition"],
    responsive: "Five-column desktop tab list; two-column tab list on smaller screens.",
  },
  {
    name: "QuoteForm",
    file: "components/showroom/quote-form.tsx",
    area: "public",
    purpose: "Lead capture form with Zod/RHF validation and service select.",
    states: ["default", "select open", "validation errors", "submitting", "server error", "success route"],
    responsive: "Two-column fields on desktop; single-column stacked mobile.",
  },
  {
    name: "ArticleToc",
    file: "components/showroom/article-toc.tsx",
    area: "public",
    purpose: "Article navigation and scan support for blog detail.",
    states: ["default", "link hover/focus"],
    responsive: "Inline/stacked behavior follows article layout.",
  },
  {
    name: "SocialShare",
    file: "components/showroom/social-share.tsx",
    area: "public",
    purpose: "Share actions for article pages.",
    states: ["default", "hover", "focus"],
    responsive: "Compact button group.",
  },
  {
    name: "AdminShell",
    file: "components/showroom/admin-shell.tsx",
    area: "admin",
    purpose: "Admin layout with sidebar, sticky header, mobile admin nav, utility rail, locale toggle.",
    states: ["active nav", "sidebar collapsed", "header collapsed", "notification open", "mobile nav"],
    responsive: "Desktop has sidebar + utility rail; tablet/mobile uses horizontal admin nav and stacked content.",
  },
  {
    name: "AdminDatePicker",
    file: "components/showroom/admin-dashboard-widgets.tsx",
    area: "admin",
    purpose: "Shared admin date picker using real popover/calendar state.",
    states: ["default", "open", "selected date", "today selected", "work link"],
    responsive: "Portaled content with collision padding and fixed z-index.",
  },
  {
    name: "DashboardInsightChart",
    file: "components/showroom/admin-dashboard-widgets.tsx",
    area: "admin",
    purpose: "Admin performance chart linked to shared date selection.",
    states: ["metric selected", "date selected", "bar selected"],
    responsive: "Chart + KPI side rail collapse into stacked layout.",
  },
  {
    name: "NotificationButton",
    file: "components/showroom/admin-dashboard-widgets.tsx",
    area: "admin",
    purpose: "Header notification popover and unread indicator.",
    states: ["unread", "open", "read", "hover/focus"],
    responsive: "Hidden below md where admin mobile nav takes priority.",
  },
  {
    name: "PublishWorkflow",
    file: "components/showroom/admin-interactions.tsx",
    area: "admin",
    purpose: "Draft/publish/archive status controls with confirmation modal.",
    states: ["draft", "publish modal", "published", "archive modal", "archived", "feedback"],
    responsive: "Modal is fixed viewport overlay with compact confirmation panel.",
  },
  {
    name: "AiDraftWorkflow",
    file: "components/showroom/admin-interactions.tsx",
    area: "admin",
    purpose: "Draft-only AI assistance with loading, result, accept, and error states.",
    states: ["idle", "loading", "result", "accepted", "error"],
    responsive: "Panel stacks inside editor sidebar or AI assistant layout.",
  },
  {
    name: "RichTextEditorMock",
    file: "components/showroom/admin-interactions.tsx",
    area: "admin",
    purpose: "Editor toolbar demo with active formatting and image placeholder feedback.",
    states: ["bold active", "italic active", "image inserted", "focus"],
    responsive: "Toolbar remains compact; textarea fills editor card.",
  },
  {
    name: "MediaUploadPanel",
    file: "components/showroom/admin-interactions.tsx",
    area: "admin",
    purpose: "Cloudinary-ready upload state mock with selected-file feedback.",
    states: ["idle", "selected", "error companion state"],
    responsive: "Centered drop area within admin content grid.",
  },
  {
    name: "AdminSectionPage",
    file: "app/admin/[section]/page.tsx",
    area: "admin",
    purpose: "Validated admin dynamic section router for all supported admin sections.",
    states: ["valid section", "create mode", "not found"],
    responsive: "Delegates responsive behavior to AdminShell and child sections.",
  },
];

const designTokensBase = {
  meta: {
    name: "Showroom Noi That Phuong Dong Project Design Tokens",
    generatedAt,
    sourceFiles: ["app/globals.css", "components/showroom/*", "messages/*.json"],
    trueFigmaFileCreated: false,
  },
  color: {
    public: {
      surface: "#f3faff",
      surfaceDim: "#c7dde9",
      surfaceContainerLowest: "#ffffff",
      surfaceContainerLow: "#e6f6ff",
      surfaceContainer: "#dbf1fe",
      surfaceContainerHigh: "#d5ecf8",
      surfaceContainerHighest: "#cfe6f2",
      onSurface: "#071e27",
      onSurfaceVariant: "#504441",
      primary: "#442a22",
      primaryContainer: "#5d4037",
      onPrimaryContainer: "#ffdbd0",
      secondary: "#546067",
      outline: "#827470",
      outlineVariant: "#d4c3be",
      error: "#ba1a1a",
      errorContainer: "#ffdad6",
    },
    admin: {
      canvas: "#f7f9fc",
      ink: "#15172b",
      mutedInk: "#686d82",
      outline: "#8a8ea3",
      border: "#dfe6f1",
      panel: "#ffffff",
      sidebarTop: "#0c0d27",
      sidebarBottom: "#070819",
      accent: "#8b5cf6",
      accentSoft: "#f5f2ff",
      warning: "#fff8e6",
      warningInk: "#7a4a00",
      success: "#047857",
      notification: "#ff8a00",
      highlight: "#ffe45e",
    },
    status: {
      draftBg: "#fffbeb",
      draftInk: "#b45309",
      publishedBg: "#ecfdf5",
      publishedInk: "#047857",
      archivedBg: "#f1f5f9",
      archivedInk: "#475569",
      quoteNewBg: "#f5f3ff",
      quoteNewInk: "#6d28d9",
      quoteContactedBg: "#f0f9ff",
      quoteContactedInk: "#0369a1",
    },
  },
  typography: {
    body: {
      family: "Inter, ui-sans-serif, system-ui, Segoe UI, sans-serif",
      defaultSize: "16px",
      adminSize: "15px",
      lineHeight: "1.55",
    },
    heading: {
      family: "Montserrat, Inter, ui-sans-serif, system-ui",
      letterSpacing: "0",
      weights: [600, 700],
    },
    labels: {
      size: "11.5px",
      weight: 700,
      transform: "uppercase",
      tracking: "0.14em",
    },
  },
  spacing: {
    container: {
      maxWidth: "1280px",
      publicPaddingMobile: "20px",
      publicPaddingTablet: "32px",
      publicPaddingDesktop: "40px",
      adminPaddingMobile: "16px",
      adminPaddingDesktop: "24px",
    },
    density: {
      publicSectionY: "64-96px",
      adminPanelGap: "20px",
      formGap: "16-20px",
      toolbarGap: "8-12px",
    },
  },
  radius: {
    base: "8px",
    md: "6.4px",
    lg: "8px",
    xl: "11.2px",
    adminPanel: "15.2px",
    pill: "999px",
  },
  shadow: {
    card: "0 18px 48px rgb(68 42 34 / 0.07)",
    cardHover: "0 26px 70px rgb(68 42 34 / 0.12)",
    panel: "0 18px 42px rgb(7 30 39 / 0.08)",
    adminPanel: "0 12px 32px rgb(21 23 43 / 0.045)",
    adminPopover: "0 20px 60px rgb(21 23 43 / 0.16)",
  },
  motion: {
    fast: "160ms",
    normal: "260ms",
    slow: "560ms",
    premiumEase: "cubic-bezier(0.22, 1, 0.36, 1)",
    standardEase: "cubic-bezier(0.2, 0, 0, 1)",
    reducedMotion: "All major transforms/animations collapse to near-zero duration.",
  },
  breakpoints,
};

const sectionsByTemplate = {
  home: ["Sticky public header", "Hero carousel", "Featured product/category bands", "Marketing content", "Footer newsletter"],
  content: ["Sticky public header", "Hero/content intro", "Image-led content bands", "Trust/value cards", "Footer"],
  listing: ["Sticky public header", "Listing hero", "Filter/sort toolbar", "Product grid", "Pagination", "Footer"],
  "listing-filtered": ["Sticky public header", "Applied filters", "Product grid", "Pagination", "Footer"],
  "product-detail": ["Sticky public header", "Gallery", "Product summary", "Tabs", "Quote form/CTA", "Footer"],
  "listing-editorial": ["Sticky public header", "Editorial listing header", "Article cards", "Footer"],
  article: ["Sticky public header", "Article hero", "Table of contents", "Article body", "Share/related content", "Footer"],
  showrooms: ["Sticky public header", "Showroom intro", "Showroom cards", "Map/contact content", "Footer"],
  contact: ["Sticky public header", "Contact intro", "Quote form", "Contact/support panels", "Footer"],
  feedback: ["Shell/header if applicable", "Feedback state", "Primary return action"],
  "admin-dashboard": ["Admin shell", "KPI cards", "Dashboard chart", "Warnings/actions", "Quote table", "Utility rail"],
  "admin-table": ["Admin shell", "Page header", "Filters/status updater", "Table/list", "Utility rail"],
  "admin-editor": ["Admin shell", "Page header", "Unsaved changes", "Editor form", "AI/publish side panels", "Utility rail"],
  "admin-cards": ["Admin shell", "Page header", "Card grid", "Publish controls", "Utility rail"],
  "admin-media": ["Admin shell", "Page header", "Upload panel", "Error/validation panel", "Utility rail"],
  "admin-settings": ["Admin shell", "Page header", "Settings card grid", "Utility rail"],
  "admin-ai": ["Admin shell", "AI assistant workspace", "Human review queue", "Utility rail"],
  auth: ["Auth hero", "Login panel", "Demo route CTA"],
};

async function shortWait(page) {
  await page.waitForTimeout(260);
}

async function ensureDirs() {
  await Promise.all(Object.values(dirs).map((dir) => fs.mkdir(dir, { recursive: true })));
}

function rel(filePath) {
  return path.relative(root, filePath).replace(/\\/g, "/");
}

function urlFor(route) {
  return `${baseUrl}${route}`;
}

async function preparePage(page, route, options = {}) {
  const response = await page.goto(urlFor(route), { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {});
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        scroll-behavior: auto !important;
        caret-color: transparent !important;
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      html { background: #f7f9fc; }
    `,
  }).catch(() => {});
  if (!options.keepScroll) {
    await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
  }
  await shortWait(page);
  return response;
}

async function pageSnapshotMetadata(page, response) {
  return page.evaluate((status) => {
    const firstHeading = document.querySelector("h1, h2")?.textContent?.trim() || "";
    const dialogs = Array.from(document.querySelectorAll('[role="dialog"]')).map((node) => node.textContent?.trim().slice(0, 120) || "");
    const openComboboxes = document.querySelectorAll('[role="combobox"][data-state="open"], button[aria-expanded="true"]').length;
    const selected = document.querySelectorAll('[aria-selected="true"], [aria-pressed="true"], [data-selected="true"]').length;
    return {
      status,
      title: document.title,
      firstHeading,
      appClass: document.querySelector(".admin-app") ? "admin-app" : document.querySelector(".public-app") ? "public-app" : "standalone",
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      loadedImages: Array.from(document.images).filter((img) => img.complete && img.naturalWidth > 0).length,
      dialogCount: dialogs.length,
      dialogPreview: dialogs,
      openControls: openComboboxes,
      selectedControls: selected,
    };
  }, response?.status() || null);
}

async function capture(browser, item, breakpoint, outputDir, action) {
  const context = await browser.newContext({
    viewport: { width: breakpoint.width, height: breakpoint.height },
    deviceScaleFactor: breakpoint.deviceScaleFactor,
    isMobile: Boolean(breakpoint.isMobile),
    colorScheme: "light",
  });
  const page = await context.newPage();
  const response = await preparePage(page, item.route);
  const warnings = [];
  if (action) {
    try {
      await action(page);
    } catch (error) {
      warnings.push(`State action failed: ${error.message}`);
    }
  }
  const filePath = path.join(outputDir, `${item.id}.png`);
  await page.screenshot({ path: filePath, fullPage: false, animations: "disabled" });
  const metadata = await pageSnapshotMetadata(page, response);
  await context.close();
  return {
    path: filePath,
    relativePath: rel(filePath),
    warnings,
    metadata,
  };
}

async function collectComputedTokens(browser) {
  const bp = breakpoints[0];
  const context = await browser.newContext({
    viewport: { width: bp.width, height: bp.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await preparePage(page, "/vi");
  const publicVars = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    const keys = [
      "--surface",
      "--surface-dim",
      "--surface-container-lowest",
      "--surface-container-low",
      "--surface-container",
      "--surface-container-high",
      "--surface-container-highest",
      "--on-surface",
      "--on-surface-variant",
      "--primary",
      "--primary-container",
      "--on-primary-container",
      "--secondary",
      "--outline",
      "--outline-variant",
      "--error",
      "--error-container",
      "--radius",
      "--motion-fast",
      "--motion-normal",
      "--motion-slow",
      "--ease-premium",
      "--ease-standard",
    ];
    return Object.fromEntries(keys.map((key) => [key, style.getPropertyValue(key).trim()]));
  });
  await preparePage(page, "/admin");
  const adminComputed = await page.evaluate(() => {
    const app = document.querySelector(".admin-app");
    const panel = document.querySelector(".admin-panel, .card-pd, .surface-soft");
    const button = document.querySelector(".admin-app .button-pd");
    const style = app ? getComputedStyle(app) : null;
    const panelStyle = panel ? getComputedStyle(panel) : null;
    const buttonStyle = button ? getComputedStyle(button) : null;
    return {
      appBackground: style?.background || "",
      appColor: style?.color || "",
      panelBackground: panelStyle?.background || "",
      panelBorder: panelStyle?.borderColor || "",
      panelRadius: panelStyle?.borderRadius || "",
      primaryButtonBackground: buttonStyle?.background || "",
      primaryButtonRadius: buttonStyle?.borderRadius || "",
    };
  });
  await context.close();
  return { publicCssVariables: publicVars, adminComputed };
}

async function copyToFigmaScreen(relativePath) {
  const source = path.join(root, relativePath);
  const target = path.join(dirs.figmaScreens, relativePath.replace(/^screenshots\//, ""));
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(source, target);
  return rel(target);
}

function getBreakpoint(key) {
  const bp = breakpoints.find((item) => item.key === key);
  if (!bp) throw new Error(`Unknown breakpoint ${key}`);
  return bp;
}

function createFrames(captures, stateCaptures) {
  const routeFrames = captures.flatMap((screen) =>
    breakpoints.map((bp) => ({
      id: `${screen.id}-${bp.key}`,
      name: `${bp.label} / ${screen.name}`,
      route: screen.route,
      area: screen.area,
      locale: screen.locale,
      breakpoint: bp.key,
      width: bp.width,
      height: bp.height,
      screenshot: screen.screenshots[bp.key],
      figmaScreen: screen.figmaScreens[bp.key],
      layout: {
        template: screen.template,
        sections: sectionsByTemplate[screen.template] || [],
        container: screen.area === "admin" ? "admin content area" : "container-pd max 1280px",
        spacingToken: screen.area === "admin" ? "spacing.density.adminPanelGap" : "spacing.density.publicSectionY",
      },
      typography: screen.area === "admin" ? "typography.body.adminSize + typography.heading" : "typography.body + typography.heading",
      colorTokens: screen.area === "admin" ? ["color.admin", "color.status"] : ["color.public", "color.status"],
      components: screen.components,
      notes: screen.notes,
    }))
  );

  const stateFrames = stateCaptures.map((state) => {
    const bp = getBreakpoint(state.breakpoint);
    return {
      id: state.id,
      name: `State / ${state.name}`,
      route: state.route,
      area: state.area,
      state: state.state,
      breakpoint: state.breakpoint,
      width: bp.width,
      height: bp.height,
      screenshot: state.screenshot,
      figmaScreen: state.figmaScreen,
      interactionNotes: state.notes,
      components: state.components,
    };
  });

  return {
    meta: {
      name: "Project Figma-ready Frames",
      generatedAt,
      source: "Live Next.js app rendered with Playwright",
      trueFigFileCreated: false,
      importRecommendation: "Use screenshots as image fills, then rebuild components using tokens and component inventory.",
    },
    breakpoints,
    frames: [...routeFrames, ...stateFrames],
    components: componentInventory.map((component) => ({
      name: component.name,
      file: component.file,
      area: component.area,
      states: component.states,
    })),
  };
}

function createScreenMaps(captures, stateCaptures) {
  const screenMap = {
    meta: {
      name: "Full Project Screen Map",
      generatedAt,
      baseUrl,
      breakpoints: breakpoints.map(({ key, label, width, height }) => ({ key, label, width, height })),
    },
    screens: captures.map((screen) => ({
      id: screen.id,
      name: screen.name,
      route: screen.route,
      area: screen.area,
      locale: screen.locale,
      template: screen.template,
      components: screen.components,
      notes: screen.notes,
      screenshots: screen.screenshots,
      metadata: screen.metadata,
      warnings: screen.warnings,
    })),
  };

  const responsiveFrameMap = {
    meta: {
      name: "Responsive Frame Map",
      generatedAt,
      breakpoints,
    },
    framesByScreen: captures.map((screen) => ({
      screenId: screen.id,
      name: screen.name,
      route: screen.route,
      area: screen.area,
      frames: breakpoints.map((bp) => ({
        breakpoint: bp.key,
        label: bp.label,
        size: { width: bp.width, height: bp.height },
        screenshot: screen.screenshots[bp.key],
        figmaScreen: screen.figmaScreens[bp.key],
        horizontalOverflow: screen.metadata[bp.key]?.horizontalOverflow ?? false,
      })),
    })),
  };

  const interactionStateMap = {
    meta: {
      name: "Interaction State Map",
      generatedAt,
      note: "State screenshots were captured after performing the real UI action in the running Next.js app.",
    },
    states: stateCaptures.map((state) => ({
      id: state.id,
      name: state.name,
      route: state.route,
      area: state.area,
      breakpoint: state.breakpoint,
      state: state.state,
      components: state.components,
      notes: state.notes,
      screenshot: state.screenshot,
      figmaScreen: state.figmaScreen,
      metadata: state.metadata,
      warnings: state.warnings,
    })),
  };

  const publicScreenMap = {
    meta: { name: "Public Screen Map", generatedAt },
    screens: screenMap.screens.filter((screen) => screen.area === "public"),
  };

  const adminScreenMap = {
    meta: { name: "Admin Screen Map", generatedAt },
    screens: screenMap.screens.filter((screen) => screen.area === "admin"),
  };

  const manifest = {
    meta: {
      name: "Project Handoff Screen Manifest",
      generatedAt,
      baseUrl,
      screenshotCount: captures.length * breakpoints.length + stateCaptures.length,
      routeScreenCount: captures.length,
      interactionStateCount: stateCaptures.length,
      trueFigFileCreated: false,
    },
    files: {
      handoff: "handoff.md",
      reviewBoard: "review-board.html",
      pdfSummary: "project-handoff-summary.pdf",
      designTokens: "design-tokens.json",
      componentInventory: "component-inventory.json",
      screenMap: "screen-map.json",
      publicScreenMap: "public-screen-map.json",
      adminScreenMap: "admin-screen-map.json",
      responsiveFrameMap: "responsive-frame-map.json",
      interactionStateMap: "interaction-state-map.json",
      figmaFrames: "figma-ready/frames.json",
      figmaReadme: "figma-ready/README.md",
    },
    screenshots: [
      ...captures.flatMap((screen) => breakpoints.map((bp) => screen.screenshots[bp.key])),
      ...stateCaptures.map((state) => state.screenshot),
    ],
    figmaScreens: [
      ...captures.flatMap((screen) => breakpoints.map((bp) => screen.figmaScreens[bp.key])),
      ...stateCaptures.map((state) => state.figmaScreen),
    ],
  };

  return {
    screenMap,
    publicScreenMap,
    adminScreenMap,
    responsiveFrameMap,
    interactionStateMap,
    manifest,
  };
}

function htmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function imageCard({ title, subtitle, route, image, tags }) {
  return `
    <article class="shot-card">
      <a href="${htmlEscape(image)}" target="_blank" rel="noreferrer">
        <img src="${htmlEscape(image)}" alt="${htmlEscape(title)}" loading="lazy">
      </a>
      <div class="shot-meta">
        <div>
          <h3>${htmlEscape(title)}</h3>
          <p>${htmlEscape(subtitle)}</p>
          <code>${htmlEscape(route)}</code>
        </div>
        <div class="tags">${tags.map((tag) => `<span>${htmlEscape(tag)}</span>`).join("")}</div>
      </div>
    </article>
  `;
}

function createReviewBoard(captures, stateCaptures) {
  const groups = breakpoints.map((bp) => ({
    title: `${bp.label} Screens`,
    subtitle: `${bp.width} x ${bp.height}`,
    cards: captures.map((screen) =>
      imageCard({
        title: screen.name,
        subtitle: `${screen.area} / ${screen.locale || "n/a"}`,
        route: screen.route,
        image: screen.screenshots[bp.key],
        tags: [bp.key, screen.template, screen.area],
      })
    ),
  }));

  const stateCards = stateCaptures.map((state) =>
    imageCard({
      title: state.name,
      subtitle: `${state.area} / ${state.state}`,
      route: state.route,
      image: state.screenshot,
      tags: [state.breakpoint, state.state, ...state.components.slice(0, 1)],
    })
  );

  const colorSwatches = [
    ["Public Primary", designTokensBase.color.public.primary],
    ["Public Surface", designTokensBase.color.public.surface],
    ["Public Container", designTokensBase.color.public.surfaceContainer],
    ["Admin Ink", designTokensBase.color.admin.ink],
    ["Admin Canvas", designTokensBase.color.admin.canvas],
    ["Admin Accent", designTokensBase.color.admin.accent],
    ["Warning", designTokensBase.color.admin.warning],
    ["Success", designTokensBase.color.status.publishedInk],
  ]
    .map(
      ([name, color]) => `
        <div class="swatch">
          <span style="background:${color}"></span>
          <strong>${name}</strong>
          <code>${color}</code>
        </div>
      `
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Full Project Handoff Review Board</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #15172b;
      --muted: #686d82;
      --line: #dfe6f1;
      --paper: #ffffff;
      --canvas: #f5f7fb;
      --accent: #8b5cf6;
      --public: #5d4037;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--ink);
      background: linear-gradient(180deg, #f7f9fc, #edf3f9);
    }
    header {
      position: sticky;
      top: 0;
      z-index: 5;
      border-bottom: 1px solid var(--line);
      background: rgba(255,255,255,.92);
      backdrop-filter: blur(16px);
    }
    .wrap { width: min(1480px, calc(100vw - 40px)); margin: 0 auto; }
    .top { display: grid; gap: 8px; padding: 22px 0; }
    h1 { margin: 0; font-size: clamp(24px, 3vw, 42px); letter-spacing: 0; }
    .summary { display: flex; flex-wrap: wrap; gap: 10px; color: var(--muted); font-size: 14px; }
    .pill {
      display: inline-flex;
      align-items: center;
      min-height: 30px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: #fff;
      padding: 5px 10px;
      font-weight: 700;
    }
    main { padding: 28px 0 60px; }
    section { margin-top: 34px; }
    .section-head { display: flex; align-items: end; justify-content: space-between; gap: 18px; margin-bottom: 14px; }
    h2 { margin: 0; font-size: 22px; }
    .section-head p { margin: 4px 0 0; color: var(--muted); }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
      gap: 16px;
    }
    .shot-card {
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--paper);
      box-shadow: 0 16px 42px rgba(21, 23, 43, .06);
    }
    .shot-card img {
      display: block;
      width: 100%;
      aspect-ratio: 16 / 10;
      object-fit: cover;
      object-position: top center;
      border-bottom: 1px solid var(--line);
      background: #edf0f7;
    }
    .shot-meta { display: grid; gap: 12px; padding: 12px; }
    .shot-meta h3 { margin: 0; font-size: 15px; }
    .shot-meta p { margin: 3px 0 7px; color: var(--muted); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
    code {
      display: inline-block;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #3b3f55;
      background: #f4f6fb;
      border: 1px solid #e5e9f1;
      border-radius: 6px;
      padding: 3px 6px;
      font-size: 12px;
    }
    .tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .tags span {
      border: 1px solid #e2e7f0;
      border-radius: 999px;
      color: #51576e;
      background: #f8fafc;
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 700;
    }
    .swatches {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 10px;
      margin-top: 14px;
    }
    .swatch {
      display: grid;
      grid-template-columns: 38px 1fr;
      gap: 10px;
      align-items: center;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
      padding: 10px;
    }
    .swatch span { width: 38px; height: 38px; border-radius: 7px; border: 1px solid rgba(0,0,0,.08); }
    .swatch strong { display:block; font-size:13px; }
    .swatch code { margin-top: 4px; }
    .toc {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 14px 0 0;
    }
    .toc a {
      color: var(--ink);
      text-decoration: none;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: #fff;
      padding: 8px 11px;
      font-size: 13px;
      font-weight: 700;
    }
    @media (max-width: 640px) {
      .wrap { width: min(100% - 24px, 1480px); }
      .grid { grid-template-columns: 1fr; }
      .section-head { display: block; }
    }
  </style>
</head>
<body>
  <header>
    <div class="wrap top">
      <h1>Full Project Handoff Review Board</h1>
      <div class="summary">
        <span class="pill">${captures.length} route screens</span>
        <span class="pill">${breakpoints.length} breakpoints</span>
        <span class="pill">${stateCaptures.length} interaction states</span>
        <span class="pill">Generated ${generatedAt}</span>
        <span class="pill">Figma-ready package, no .fig file</span>
      </div>
      <nav class="toc">
        <a href="#tokens">Color Tokens</a>
        ${groups.map((group) => `<a href="#${group.title.toLowerCase().replaceAll(" ", "-")}">${group.title}</a>`).join("")}
        <a href="#states">Interaction States</a>
      </nav>
    </div>
  </header>
  <main class="wrap">
    <section id="tokens">
      <div class="section-head">
        <div>
          <h2>Color Tokens</h2>
          <p>Primary public/admin palette exported to design-tokens.json.</p>
        </div>
      </div>
      <div class="swatches">${colorSwatches}</div>
    </section>
    ${groups
      .map(
        (group) => `
        <section id="${group.title.toLowerCase().replaceAll(" ", "-")}">
          <div class="section-head">
            <div>
              <h2>${group.title}</h2>
              <p>${group.subtitle}</p>
            </div>
          </div>
          <div class="grid">${group.cards.join("")}</div>
        </section>
      `
      )
      .join("")}
    <section id="states">
      <div class="section-head">
        <div>
          <h2>Interaction States</h2>
          <p>Real opened/selected/hover/validation/modal states captured from the running app.</p>
        </div>
      </div>
      <div class="grid">${stateCards.join("")}</div>
    </section>
  </main>
</body>
</html>`;
}

function createHandoffMarkdown(captures, stateCaptures) {
  const publicScreens = captures.filter((screen) => screen.area === "public");
  const adminScreens = captures.filter((screen) => screen.area === "admin");
  const routeRows = captures
    .map((screen) => `| ${screen.name} | \`${screen.route}\` | ${screen.area} | ${screen.template} | desktop/tablet/mobile |`)
    .join("\n");
  const stateRows = stateCaptures
    .map((state) => `| ${state.name} | \`${state.route}\` | ${state.area} | ${state.state} | \`${state.screenshot}\` |`)
    .join("\n");
  const fileMap = componentInventory
    .map((item) => `- \`${item.file}\` - ${item.name}: ${item.purpose}`)
    .join("\n");

  return `# Full Project Figma Handoff

Generated: ${generatedAt}

## Overview

This package expands the previous admin-only handoff into a full-project handoff covering public/client screens, admin/CMS screens, key modals and interaction states, color tokens, component inventory, responsive frame specs, and a static review board.

The screenshots were captured from the running Next.js app at \`${baseUrl}\` using real browser interactions. No fake \`.fig\` file was generated.

## What Was Fixed Before Export

- Admin date/calendar triggers now open real calendar popovers and expose open/selected state.
- Admin shared date selection updates dashboard chart, utility rail, and selected work link.
- Admin active/open/selected/focus states were polished for buttons, tabs, selects, popovers, and editor controls.
- Admin fixed background behavior was replaced with a robust fixed pseudo-layer behind the shell.
- Admin dynamic section routes render correctly for supported sections instead of falling through.
- Admin popover/modal layering uses visible z-index/portal behavior and stable overflow handling.

## Export Scope

- Public route screens: ${publicScreens.length} routes.
- Admin route screens: ${adminScreens.length} routes.
- Responsive breakpoints: ${breakpoints.map((bp) => `${bp.label} ${bp.width}x${bp.height}`).join(", ")}.
- Interaction state screenshots: ${stateCaptures.length} states.
- Design system exports: tokens, components, screen maps, responsive frame map, interaction state map.
- Figma-ready exports: PNG screens, SVG assets, frames JSON, reconstruction README.

## Updated Interaction Notes

- Public catalog menu opens from the real catalog trigger and also opens type mega-menu content on hover/focus.
- Mobile public navigation expands below the sticky header and includes navigation, catalog links, locale switch, and quote CTA.
- Product detail gallery supports selected thumbnail state and a real image dialog.
- Product detail tabs expose selected tab state and update content.
- Product filters expose expanded state and select-open portal state.
- Quote form exposes validation errors without submitting invalid lead data.
- Admin calendar, notifications, selects, publish confirmation, editor active controls, AI accepted state, and media selected state are captured as real interactions.

## Admin-Specific Behavior Notes

- Admin pages keep the current visual language: light operational canvas, dark sidebar, violet accent, compact panels, utility rail.
- Role Model Option A remains reflected in users/settings/quotes/access-denied states.
- AI workflow remains draft-only with explicit human review/acceptance state.
- Upload/media UI remains governance-oriented and does not bypass validation requirements.
- Fixed background is applied behind the admin shell and does not cover foreground content.

## Route Screen Map

| Screen | Route | Area | Template | Captures |
| --- | --- | --- | --- | --- |
${routeRows}

## Interaction State Map

| State | Route | Area | State | Screenshot |
| --- | --- | --- | --- | --- |
${stateRows}

## File / Component Map

${fileMap}

## Deliverable Map

- \`review-board.html\` - static stakeholder review board with all route and state screenshots.
- \`project-handoff-summary.pdf\` - concise PDF summary for client review.
- \`design-tokens.json\` - color, typography, spacing, radius, shadow, motion, breakpoints.
- \`component-inventory.json\` - component purpose, file, states, and responsive notes.
- \`screen-map.json\` - complete route screen map with screenshot references.
- \`public-screen-map.json\` - public/client subset.
- \`admin-screen-map.json\` - admin subset.
- \`responsive-frame-map.json\` - desktop/tablet/mobile frame references per screen.
- \`interaction-state-map.json\` - modal/open/selected/hover/error/active state references.
- \`figma-ready/frames.json\` - Figma-import-friendly frame/spec JSON.
- \`figma-ready/assets/\` - reusable SVG visual assets.
- \`figma-ready/screens/\` - PNG copies organized by breakpoint/state.
- \`screenshots/\` - source PNG screenshots organized by breakpoint/state.

## Figma File Status

A true \`.fig\` file was not created because Figma's proprietary file format is not realistically exportable in this local environment without a Figma plugin/API workflow and authenticated import. Instead, this package provides a Figma-ready structured handoff: PNG frames, SVG assets, tokens, component inventory, screen maps, and reconstruction instructions.
`;
}

function createFigmaReadme(captures, stateCaptures) {
  return `# Figma-Ready Import Package

Generated: ${generatedAt}

This folder is designed for quick Figma reconstruction. It does not contain a real \`.fig\` file.

## Recommended Import Flow

1. In Figma, create pages named:
   - 00 Tokens
   - 01 Public Screens
   - 02 Admin Screens
   - 03 Interaction States
   - 04 Components
2. Import \`frames.json\` as the frame/spec source of truth.
3. Drag PNGs from \`screens/\` into matching frames:
   - \`screens/desktop/\`
   - \`screens/tablet/\`
   - \`screens/mobile/\`
   - \`screens/states/\`
4. Add color styles from \`../design-tokens.json\`.
5. Add typography styles:
   - Body: Inter
   - Heading: Montserrat
   - Label: uppercase, 0.14em tracking
6. Rebuild reusable components from \`../component-inventory.json\` and the SVGs in \`assets/\`.
7. Use route names and frame names exactly as provided in \`frames.json\` to preserve handoff traceability.

## Included

- Route frame specs: ${captures.length * breakpoints.length}
- Interaction state frames: ${stateCaptures.length}
- SVG assets: brand mark, public/admin background layers, color swatches, calendar/status references.
- PNG screen exports for desktop, tablet, mobile, and state captures.

## Naming Convention

- Route frames: \`<Breakpoint> / <Screen Name>\`
- State frames: \`State / <State Name>\`
- PNG names match screen IDs from \`../screen-map.json\` and \`../interaction-state-map.json\`.

## True .fig Status

No true Figma file was generated. This is a Figma-import-friendly package intended for manual or plugin-assisted reconstruction.
`;
}

function createSummaryHtml(captures, stateCaptures) {
  const byArea = {
    public: captures.filter((screen) => screen.area === "public").length,
    admin: captures.filter((screen) => screen.area === "admin").length,
  };
  const representative = [
    captures.find((screen) => screen.id === "public-home-vi"),
    captures.find((screen) => screen.id === "public-products-vi"),
    captures.find((screen) => screen.id === "public-product-detail-vi"),
    captures.find((screen) => screen.id === "public-contact-vi"),
    captures.find((screen) => screen.id === "admin-dashboard"),
    captures.find((screen) => screen.id === "admin-blog-editor"),
  ].filter(Boolean);
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; font-family: Inter, Arial, sans-serif; color: #15172b; background: #f7f9fc; }
    .page { padding: 34px; }
    h1 { font-size: 34px; margin: 0 0 8px; }
    h2 { margin: 28px 0 10px; font-size: 18px; }
    p { color: #686d82; line-height: 1.55; }
    .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 22px 0; }
    .metric { background: white; border: 1px solid #dfe6f1; border-radius: 8px; padding: 14px; }
    .metric strong { display:block; font-size: 26px; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .card { background: white; border: 1px solid #dfe6f1; border-radius: 8px; overflow: hidden; break-inside: avoid; }
    img { width: 100%; aspect-ratio: 16/10; object-fit: cover; object-position: top center; display: block; border-bottom: 1px solid #dfe6f1; }
    .meta { padding: 10px; }
    .meta h3 { margin: 0; font-size: 13px; }
    .meta code { color: #686d82; font-size: 10px; }
    ul { color: #3a3f55; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="page">
    <h1>Full Project Handoff Summary</h1>
    <p>Generated ${generatedAt}. This PDF summarizes the full project Figma-ready export for public and admin screens.</p>
    <div class="metrics">
      <div class="metric"><strong>${captures.length}</strong><span>route screens</span></div>
      <div class="metric"><strong>${byArea.public}</strong><span>public screens</span></div>
      <div class="metric"><strong>${byArea.admin}</strong><span>admin screens</span></div>
      <div class="metric"><strong>${stateCaptures.length}</strong><span>state captures</span></div>
    </div>
    <h2>Scope</h2>
    <ul>
      <li>Desktop, tablet, and mobile screenshots for every mapped public/admin route.</li>
      <li>Interaction states for catalog menu, mobile nav, product modal, tabs, filters, form validation, admin calendar, popovers, publish modal, AI and media states.</li>
      <li>Tokens, component inventory, screen map, responsive frame map, and Figma-ready frames JSON.</li>
      <li>No true .fig file was generated; this is a structured Figma-import-friendly package.</li>
    </ul>
    <h2>Representative Frames</h2>
    <div class="grid">
      ${representative
        .map(
          (screen) => `
        <div class="card">
          <img src="${screen.screenshots.desktop}" alt="${htmlEscape(screen.name)}">
          <div class="meta"><h3>${htmlEscape(screen.name)}</h3><code>${htmlEscape(screen.route)}</code></div>
        </div>
      `
        )
        .join("")}
    </div>
  </div>
</body>
</html>`;
}

async function writeJson(fileName, data) {
  await fs.writeFile(path.join(root, fileName), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function writeAssets() {
  const assets = {
    "brand-mark.svg": `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160" viewBox="0 0 320 160" role="img" aria-label="Phuong Dong brand mark"><rect width="320" height="160" rx="8" fill="#f3faff"/><rect x="32" y="28" width="74" height="74" rx="18" fill="#5d4037"/><path d="M48 78h42M69 48v64M50 102h40" stroke="#ffdbd0" stroke-width="8" stroke-linecap="round"/><text x="124" y="72" font-family="Montserrat,Arial" font-size="28" font-weight="700" fill="#442a22">Phuong Dong</text><text x="124" y="100" font-family="Inter,Arial" font-size="13" font-weight="700" letter-spacing="4" fill="#546067">SHOWROOM</text></svg>`,
    "public-background-layer.svg": `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900"><defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#edf8ff"/><stop offset=".45" stop-color="#f8fcff"/><stop offset="1" stop-color="#eaf6fc"/></linearGradient><pattern id="p" width="88" height="24" patternUnits="userSpaceOnUse"><path d="M0 0h1v24" stroke="#442a22" stroke-opacity=".025"/><path d="M0 0h88" stroke="#071e27" stroke-opacity=".018"/></pattern></defs><rect width="1440" height="900" fill="url(#g)"/><rect width="1440" height="900" fill="url(#p)"/><path d="M0 0h250L0 640zM770 0h16L265 900h-16z" fill="#fff" opacity=".45"/></svg>`,
    "admin-background-layer.svg": `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900"><defs><linearGradient id="a" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#f6f8fc"/><stop offset=".46" stop-color="#e9eef5"/><stop offset="1" stop-color="#f2f4fa"/></linearGradient><pattern id="grid" width="72" height="28" patternUnits="userSpaceOnUse"><path d="M0 0h1v28" stroke="#15172b" stroke-opacity=".028"/><path d="M0 0h72" stroke="#15172b" stroke-opacity=".018"/></pattern></defs><rect width="1440" height="900" fill="url(#a)"/><rect width="1440" height="900" fill="url(#grid)"/><path d="M0 0h260L0 650zM780 0h18L285 900h-18z" fill="#fff" opacity=".35"/></svg>`,
    "color-swatches.svg": `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="220" viewBox="0 0 720 220"><rect width="720" height="220" rx="8" fill="#ffffff"/><g font-family="Inter,Arial" font-size="12" font-weight="700" fill="#15172b">${[
      ["#442a22", "public primary"],
      ["#5d4037", "primary container"],
      ["#f3faff", "public surface"],
      ["#dbf1fe", "public container"],
      ["#15172b", "admin ink"],
      ["#8b5cf6", "admin accent"],
      ["#f7f9fc", "admin canvas"],
      ["#ffe45e", "highlight"],
    ]
      .map((item, index) => {
        const x = 24 + (index % 4) * 172;
        const y = 28 + Math.floor(index / 4) * 92;
        return `<rect x="${x}" y="${y}" width="54" height="54" rx="8" fill="${item[0]}" stroke="#dfe6f1"/><text x="${x + 66}" y="${y + 22}">${item[1]}</text><text x="${x + 66}" y="${y + 42}" fill="#686d82">${item[0]}</text>`;
      })
      .join("")}</g></svg>`,
    "calendar-state.svg": `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><rect width="240" height="240" rx="8" fill="#fff"/><rect x="38" y="42" width="164" height="156" rx="18" fill="#f4f6fb" stroke="#dfe6f1"/><rect x="38" y="42" width="164" height="44" rx="18" fill="#8b5cf6"/><g fill="#fff"><rect x="72" y="28" width="12" height="34" rx="6"/><rect x="156" y="28" width="12" height="34" rx="6"/></g><g fill="#8a8ea3">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<circle cx="${62 + i * 20}" cy="114" r="5"/>`).join("")}</g><circle cx="122" cy="148" r="16" fill="#090a23"/><text x="122" y="153" text-anchor="middle" font-family="Inter,Arial" font-size="14" font-weight="800" fill="#fff">4</text></svg>`,
    "status-pill.svg": `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="120" viewBox="0 0 420 120"><rect width="420" height="120" rx="8" fill="#fff"/><g font-family="Inter,Arial" font-size="13" font-weight="800"><rect x="28" y="28" width="110" height="36" rx="18" fill="#ecfdf5" stroke="#a7f3d0"/><circle cx="48" cy="46" r="5" fill="#047857"/><text x="62" y="51" fill="#047857">Published</text><rect x="158" y="28" width="88" height="36" rx="18" fill="#fffbeb" stroke="#fde68a"/><circle cx="178" cy="46" r="5" fill="#b45309"/><text x="192" y="51" fill="#b45309">Draft</text><rect x="266" y="28" width="100" height="36" rx="18" fill="#f1f5f9" stroke="#cbd5e1"/><circle cx="286" cy="46" r="5" fill="#475569"/><text x="300" y="51" fill="#475569">Archived</text></g></svg>`,
  };

  await Promise.all(
    Object.entries(assets).map(([name, svg]) => fs.writeFile(path.join(dirs.figmaAssets, name), svg, "utf8"))
  );
}

async function renderPdf(browser, html) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.setContent(html, { waitUntil: "load" });
  await page.pdf({
    path: path.join(root, "project-handoff-summary.pdf"),
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", right: "10mm", bottom: "12mm", left: "10mm" },
  });
  await context.close();
}

async function validateExports(manifest) {
  const missing = [];
  const allRefs = [
    ...Object.values(manifest.files),
    ...manifest.screenshots,
    ...manifest.figmaScreens,
    "figma-ready/assets/brand-mark.svg",
    "figma-ready/assets/public-background-layer.svg",
    "figma-ready/assets/admin-background-layer.svg",
    "figma-ready/assets/color-swatches.svg",
    "figma-ready/assets/calendar-state.svg",
    "figma-ready/assets/status-pill.svg",
  ];
  for (const refPath of allRefs) {
    try {
      await fs.access(path.join(root, refPath));
    } catch {
      missing.push(refPath);
    }
  }
  const jsonFiles = [
    "design-tokens.json",
    "component-inventory.json",
    "screen-map.json",
    "public-screen-map.json",
    "admin-screen-map.json",
    "responsive-frame-map.json",
    "interaction-state-map.json",
    "screen-manifest.json",
    "figma-ready/frames.json",
  ];
  for (const jsonFile of jsonFiles) {
    JSON.parse(await fs.readFile(path.join(root, jsonFile), "utf8"));
  }
  if (missing.length) {
    throw new Error(`Missing export files:\n${missing.join("\n")}`);
  }
}

async function main() {
  await ensureDirs();
  const browser = await chromium.launch();
  const computedTokens = await collectComputedTokens(browser);
  const captures = [];

  for (const screen of screens) {
    const captureEntry = {
      ...screen,
      screenshots: {},
      figmaScreens: {},
      metadata: {},
      warnings: {},
    };
    for (const breakpoint of breakpoints) {
      const result = await capture(browser, screen, breakpoint, dirs[breakpoint.key]);
      captureEntry.screenshots[breakpoint.key] = result.relativePath;
      captureEntry.figmaScreens[breakpoint.key] = await copyToFigmaScreen(result.relativePath);
      captureEntry.metadata[breakpoint.key] = result.metadata;
      captureEntry.warnings[breakpoint.key] = result.warnings;
    }
    captures.push(captureEntry);
    console.log(`captured route ${screen.id}`);
  }

  const stateCaptures = [];
  for (const state of interactionStates) {
    const breakpoint = getBreakpoint(state.breakpoint);
    const result = await capture(browser, state, breakpoint, dirs.states, state.action);
    const figmaScreen = await copyToFigmaScreen(result.relativePath);
    stateCaptures.push({
      id: state.id,
      name: state.name,
      route: state.route,
      area: state.area,
      breakpoint: state.breakpoint,
      state: state.state,
      components: state.components,
      notes: state.notes,
      screenshot: result.relativePath,
      figmaScreen,
      metadata: result.metadata,
      warnings: result.warnings,
    });
    console.log(`captured state ${state.id}`);
  }

  const designTokens = {
    ...designTokensBase,
    extractedFromBrowser: computedTokens,
  };
  const { screenMap, publicScreenMap, adminScreenMap, responsiveFrameMap, interactionStateMap, manifest } =
    createScreenMaps(captures, stateCaptures);
  const frames = createFrames(captures, stateCaptures);

  await writeJson("design-tokens.json", designTokens);
  await writeJson("component-inventory.json", { meta: { generatedAt, count: componentInventory.length }, components: componentInventory });
  await writeJson("screen-map.json", screenMap);
  await writeJson("public-screen-map.json", publicScreenMap);
  await writeJson("admin-screen-map.json", adminScreenMap);
  await writeJson("responsive-frame-map.json", responsiveFrameMap);
  await writeJson("interaction-state-map.json", interactionStateMap);
  await writeJson("screen-manifest.json", manifest);
  await writeJson(path.join("figma-ready", "frames.json"), frames);

  await writeAssets();
  await fs.writeFile(path.join(root, "handoff.md"), createHandoffMarkdown(captures, stateCaptures), "utf8");
  await fs.writeFile(path.join(dirs.figma, "README.md"), createFigmaReadme(captures, stateCaptures), "utf8");
  await fs.writeFile(path.join(root, "review-board.html"), createReviewBoard(captures, stateCaptures), "utf8");
  await renderPdf(browser, createSummaryHtml(captures, stateCaptures));
  await browser.close();

  await validateExports(manifest);
  console.log(
    JSON.stringify(
      {
        ok: true,
        output: rel(root),
        routeScreens: captures.length,
        breakpoints: breakpoints.length,
        interactionStates: stateCaptures.length,
        screenshots: manifest.screenshotCount,
        trueFigFileCreated: false,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
