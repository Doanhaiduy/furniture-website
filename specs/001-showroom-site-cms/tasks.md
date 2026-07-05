# Tasks: Showroom Site CMS

**Input**: Design documents from `specs/001-showroom-site-cms/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/`, `adrs/`, `.specify/memory/constitution.md`

**Tests**: Required for important behavior, including unit, integration, E2E, i18n, SEO, security, accessibility, performance, and admin authorization coverage.

**Organization**: Tasks are grouped by requested epic. Story-scoped tasks include `[US1]` through `[US6]` labels for traceability and independent implementation.

## Story Map

| Story | Priority | Scope | Independent Test |
| --- | --- | --- | --- |
| US1 | P1 | Homepage, about, brand discovery, product groups, locale switching basics | Open `/vi` and `/en` on desktop/mobile and verify hero plus both product groups are visible in the first viewport; open About in both locales. |
| US2 | P1 | Product catalog, filters, search, product detail, no ecommerce behavior | Seed products, apply category/price/attribute filters and keyword search, verify relevant results or empty state within 3 seconds. |
| US3 | P1 | Contact and quote submission | Submit valid and invalid quote forms, verify field errors, persistence, notification attempt, and public confirmation. |
| US4 | P2 | Showrooms, maps, social links, share actions | Open showroom and public pages, verify addresses, hotlines, map fallback, social links, and share URLs. |
| US5 | P1 | CMS content management for products, categories, blog, showrooms, bilingual publishing | As Admin/Editor, create/edit/publish content and verify public visibility only when bilingual requirements pass. |
| US6 | P2 | Leads, roles, settings, AI draft assistant | As Admin, manage leads/users/settings; as Editor, manage publishable content but not leads/users/settings; verify AI drafts never auto-publish. |

---

## Epic 1: Project Setup & Infrastructure

**Coverage**: NFR-01, NFR-02, NFR-05, NFR-07, architecture precondition from `plan.md`.

- [ ] T001 Align approved dependencies in `package.json` for Next.js 15, Payload CMS 3.x, Tailwind CSS v4, next-intl, Resend, OpenAI, Vitest, and Playwright for NFR-07.
- [ ] T002 Regenerate dependency lockfile in `pnpm-lock.yaml` after approved dependency alignment for NFR-07.
- [ ] T003 Configure the TypeScript alias to resolve app code from `src/` in `tsconfig.json` for NFR-07.
- [ ] T004 Migrate the root App Router shell from `app/layout.tsx` to `src/app/layout.tsx` for NFR-07.
- [ ] T005 Migrate global styles from `app/globals.css` to `src/app/globals.css` for NFR-03.
- [ ] T006 Configure Next.js runtime options and baseline security headers in `next.config.ts` for NFR-01 and NFR-05.
- [ ] T007 [P] Create required environment variable documentation in `.env.example` for NFR-05.
- [ ] T008 [P] Create server-only environment validation in `src/lib/env/server.ts` for NFR-05.
- [ ] T009 [P] Create public environment validation in `src/lib/env/public.ts` for NFR-05.
- [ ] T010 [P] Create Payload database health helper in `src/lib/payload/database.ts` for NFR-05.
- [ ] T011 [P] Create Payload server client wrapper in `src/lib/payload/client.ts` for NFR-07.
- [ ] T012 [P] Create normalized public API error helpers in `src/lib/api/errors.ts` for NFR-05.
- [ ] T013 Update setup and infrastructure coverage in `docs/specs/traceability-matrix.md` for NFR-05 and NFR-07.

---

## Epic 2: Database & CMS Collections (Payload)

**Coverage**: SPEC-FR-001, SPEC-FR-002, SPEC-FR-007 to SPEC-FR-023, SPEC-FR-028 to SPEC-FR-030.

- [ ] T014 [P] [US5] Create role matrix unit tests in `tests/unit/payload/accessRoles.test.ts` for SPEC-FR-020 and SPEC-FR-021.
- [ ] T015 [P] [US5] Create publication validation unit tests in `tests/unit/payload/publishValidation.test.ts` for SPEC-FR-013, SPEC-FR-015, and SPEC-FR-017.
- [ ] T016 [P] [US6] Create quote notification state unit tests in `tests/unit/payload/quoteNotifications.test.ts` for SPEC-FR-009 and SPEC-FR-018.
- [ ] T017 [P] [US5] Create media URL validation unit tests in `tests/unit/payload/mediaValidation.test.ts` for SPEC-FR-029.
- [ ] T018 [US5] Configure Payload CMS service in `src/payload/payload.config.ts` for SPEC-FR-014 to SPEC-FR-019.
- [ ] T019 [P] [US6] Implement Admin and Editor access helpers in `src/payload/access/roles.ts` for SPEC-FR-020, SPEC-FR-021, and SPEC-FR-028.
- [ ] T020 [P] [US6] Implement the Users collection in `src/payload/collections/Users.ts` for SPEC-FR-020 and SPEC-FR-021.
- [ ] T021 [P] [US5] Implement the ProductCategories collection in `src/payload/collections/ProductCategories.ts` for SPEC-FR-014 and SPEC-FR-015.
- [ ] T022 [P] [US5] Implement the Products collection in `src/payload/collections/Products.ts` for SPEC-FR-014 and SPEC-FR-015.
- [ ] T023 [P] [US5] Implement the BlogCategories collection in `src/payload/collections/BlogCategories.ts` for SPEC-FR-016 and SPEC-FR-017.
- [ ] T024 [P] [US5] Implement the BlogPosts collection in `src/payload/collections/BlogPosts.ts` for SPEC-FR-016 and SPEC-FR-017.
- [ ] T025 [P] [US5] Implement the Showrooms collection in `src/payload/collections/Showrooms.ts` for SPEC-FR-019.
- [ ] T026 [P] [US6] Implement the QuoteRequests collection in `src/payload/collections/QuoteRequests.ts` for SPEC-FR-009 and SPEC-FR-018.
- [ ] T027 [P] [US6] Implement the SiteSettings global in `src/payload/globals/SiteSettings.ts` for SPEC-FR-009, SPEC-FR-011, SPEC-FR-024, and SPEC-FR-025.
- [ ] T028 [P] [US1] Implement the HomePage global in `src/payload/globals/HomePage.ts` for SPEC-FR-001.
- [ ] T029 [P] [US1] Implement the AboutPage global in `src/payload/globals/AboutPage.ts` for SPEC-FR-002.
- [ ] T030 [P] [US5] Implement publish validation hooks in `src/payload/hooks/publishValidation.ts` for SPEC-FR-013, SPEC-FR-015, SPEC-FR-017, and SPEC-FR-023.
- [ ] T031 [P] [US5] Implement media validation hooks in `src/payload/hooks/mediaValidation.ts` for SPEC-FR-029.
- [ ] T032 [P] [US5] Implement public route revalidation hooks in `src/payload/hooks/revalidation.ts` for SPEC-FR-024 and SPEC-FR-025.
- [ ] T033 [P] [US5] Create launch seed data for bilingual categories, homepage, about, and settings in `src/payload/seed/launchSeed.ts` for SPEC-FR-001, SPEC-FR-002, and SPEC-FR-013.
- [ ] T034 [US5] Register all Payload collections, globals, hooks, access rules, and seed tooling in `src/payload/payload.config.ts` for SPEC-FR-014 to SPEC-FR-023.
- [ ] T035 [US5] Update CMS collection coverage in `docs/specs/traceability-matrix.md` for SPEC-FR-014 to SPEC-FR-023.

---

## Epic 3: Public Site - Layout & i18n

**Coverage**: SPEC-FR-011 to SPEC-FR-013, SPEC-FR-026, SPEC-FR-027.

- [ ] T036 [P] [US1] Create next-intl locale routing config in `src/i18n/routing.ts` for SPEC-FR-012.
- [ ] T037 [P] [US1] Create next-intl request config in `src/i18n/request.ts` for SPEC-FR-012 and SPEC-FR-013.
- [ ] T038 [US1] Implement locale middleware in `src/middleware.ts` for SPEC-FR-012.
- [ ] T039 [P] [US1] Create initial Vietnamese messages in `src/messages/vi.json` for SPEC-FR-013.
- [ ] T040 [P] [US1] Create initial English messages in `src/messages/en.json` for SPEC-FR-013.
- [ ] T041 [US1] Implement locale root layout in `src/app/[locale]/layout.tsx` for SPEC-FR-012, SPEC-FR-026, and SPEC-FR-027.
- [ ] T042 [P] [US1] Implement the public site header in `src/components/layout/site-header.tsx` for SPEC-FR-012 and SPEC-FR-026.
- [ ] T043 [P] [US1] Implement the public site footer in `src/components/layout/site-footer.tsx` for SPEC-FR-011 and SPEC-FR-026.
- [ ] T044 [P] [US1] Implement the one-click locale switcher in `src/components/layout/locale-switcher.tsx` for SPEC-FR-012.
- [ ] T045 [P] [US4] Implement shared social link rendering in `src/components/public/social-links.tsx` for SPEC-FR-011.
- [ ] T046 [P] [US1] Add locale route mapping tests in `tests/unit/i18n/localeRoutes.test.ts` for SPEC-FR-012.
- [ ] T047 [P] [US1] Add language switching E2E tests in `tests/e2e/i18n-switching.spec.ts` for SPEC-FR-012 and SPEC-FR-013.
- [ ] T048 [US1] Update i18n and layout coverage in `docs/specs/traceability-matrix.md` for SPEC-FR-012, SPEC-FR-013, and SPEC-FR-026.

---

## Epic 4: Public Site - Homepage

**Coverage**: SPEC-FR-001, SPEC-FR-002, SPEC-FR-012, SPEC-FR-013, SPEC-FR-024, SPEC-FR-026.

- [ ] T049 [P] [US1] Create homepage hero selection unit tests in `tests/unit/homepage/heroBanners.test.ts` for SPEC-FR-001.
- [ ] T050 [P] [US1] Create homepage data query integration tests in `tests/integration/homepage/homepageQuery.test.ts` for SPEC-FR-001 and SPEC-FR-013.
- [ ] T051 [P] [US1] Create homepage first-viewport E2E tests in `tests/e2e/homepage.spec.ts` for SPEC-FR-001 and SPEC-FR-026.
- [ ] T052 [P] [US1] Create homepage domain types in `src/features/homepage/types.ts` for SPEC-FR-001.
- [ ] T053 [US1] Implement homepage CMS query in `src/features/homepage/queries/getHomepage.ts` for SPEC-FR-001 and SPEC-FR-013.
- [ ] T054 [P] [US1] Implement hero banner component in `src/features/homepage/components/hero-banners.tsx` for SPEC-FR-001.
- [ ] T055 [P] [US1] Implement two product group cards in `src/features/homepage/components/product-group-cards.tsx` for SPEC-FR-001.
- [ ] T056 [P] [US1] Implement company intro block in `src/features/homepage/components/company-intro.tsx` for SPEC-FR-001.
- [ ] T057 [US1] Implement localized homepage route in `src/app/[locale]/(public)/page.tsx` for SPEC-FR-001, SPEC-FR-012, and SPEC-FR-024.
- [ ] T058 [US1] Implement About CMS query in `src/features/homepage/queries/getAboutPage.ts` for SPEC-FR-002 and SPEC-FR-013.
- [ ] T059 [P] [US1] Implement About content components in `src/features/homepage/components/about-content.tsx` for SPEC-FR-002.
- [ ] T060 [US1] Implement localized About route in `src/app/[locale]/(public)/about/page.tsx` for SPEC-FR-002, SPEC-FR-012, and SPEC-FR-024.
- [ ] T061 [US1] Add homepage and about translations in `src/messages/vi.json` and `src/messages/en.json` for SPEC-FR-001 and SPEC-FR-002.
- [ ] T062 [US1] Update homepage and about coverage in `docs/specs/traceability-matrix.md` for SPEC-FR-001 and SPEC-FR-002.

---

## Epic 5: Public Site - Product Catalog

**Coverage**: SPEC-FR-003 to SPEC-FR-006, SPEC-FR-012, SPEC-FR-013, SPEC-FR-024, SPEC-FR-026.

- [ ] T063 [P] [US2] Create product filter schema unit tests in `tests/unit/products/productFilters.test.ts` for SPEC-FR-003 and SPEC-FR-004.
- [ ] T064 [P] [US2] Create Vietnamese keyword normalization unit tests in `tests/unit/products/searchNormalization.test.ts` for SPEC-FR-005.
- [ ] T065 [P] [US2] Create product list API integration tests in `tests/integration/api/products.test.ts` for SPEC-FR-003 and SPEC-FR-004.
- [ ] T066 [P] [US2] Create product search API integration tests in `tests/integration/api/productSearch.test.ts` for SPEC-FR-005.
- [ ] T067 [P] [US2] Create product catalog E2E tests in `tests/e2e/product-catalog.spec.ts` for SPEC-FR-003 to SPEC-FR-005.
- [ ] T068 [P] [US2] Create product detail no-commerce E2E tests in `tests/e2e/product-detail.spec.ts` for SPEC-FR-006.
- [ ] T069 [P] [US2] Create product domain types in `src/features/products/types.ts` for SPEC-FR-003 to SPEC-FR-005.
- [ ] T070 [P] [US2] Implement product filter query validation in `src/features/products/schemas/productFilters.ts` for SPEC-FR-003 and SPEC-FR-004.
- [ ] T071 [P] [US2] Implement Vietnamese search normalization in `src/lib/search/vietnamese.ts` for SPEC-FR-005.
- [ ] T072 [US2] Implement published product list query in `src/features/products/queries/getProducts.ts` for SPEC-FR-003 and SPEC-FR-004.
- [ ] T073 [US2] Implement published product search query in `src/features/products/queries/searchProducts.ts` for SPEC-FR-005.
- [ ] T074 [US2] Implement published product detail query in `src/features/products/queries/getProductBySlug.ts` for SPEC-FR-006 and SPEC-FR-024.
- [ ] T075 [US2] Implement product category tree query in `src/features/products/queries/getCategories.ts` for SPEC-FR-003.
- [ ] T076 [US2] Implement `GET /api/products` in `src/app/api/products/route.ts` for SPEC-FR-003 and SPEC-FR-004.
- [ ] T077 [US2] Implement `GET /api/products/[slug]` in `src/app/api/products/[slug]/route.ts` for SPEC-FR-006.
- [ ] T078 [US2] Implement `GET /api/products/search` in `src/app/api/products/search/route.ts` for SPEC-FR-005.
- [ ] T079 [US2] Implement `GET /api/categories` in `src/app/api/categories/route.ts` for SPEC-FR-003.
- [ ] T080 [P] [US2] Implement catalog filter controls in `src/features/products/components/catalog-filters.tsx` for SPEC-FR-003 and SPEC-FR-026.
- [ ] T081 [P] [US2] Implement product search input in `src/features/products/components/product-search.tsx` for SPEC-FR-005 and SPEC-FR-026.
- [ ] T082 [P] [US2] Implement product card and grid components in `src/features/products/components/product-grid.tsx` for SPEC-FR-003 and SPEC-FR-026.
- [ ] T083 [P] [US2] Implement product detail gallery and attributes in `src/features/products/components/product-detail.tsx` for SPEC-FR-006.
- [ ] T084 [US2] Implement localized product listing route in `src/app/[locale]/(public)/products/page.tsx` for SPEC-FR-003 to SPEC-FR-005.
- [ ] T085 [US2] Implement localized product detail route in `src/app/[locale]/(public)/products/[slug]/page.tsx` for SPEC-FR-006 and SPEC-FR-024.
- [ ] T086 [US2] Add product catalog translations in `src/messages/vi.json` and `src/messages/en.json` for SPEC-FR-003 to SPEC-FR-006.
- [ ] T087 [US2] Update product catalog coverage in `docs/specs/traceability-matrix.md` for SPEC-FR-003 to SPEC-FR-006.

---

## Epic 6: Public Site - Blog

**Coverage**: SPEC-FR-016, SPEC-FR-017, SPEC-FR-024, SPEC-FR-025, SPEC-FR-026.

- [ ] T088 [P] [US5] Create blog query validation unit tests in `tests/unit/blog/blogFilters.test.ts` for SPEC-FR-016 and SPEC-FR-017.
- [ ] T089 [P] [US5] Create blog API integration tests in `tests/integration/api/blog.test.ts` for SPEC-FR-016 and SPEC-FR-017.
- [ ] T090 [P] [US5] Create localized blog E2E tests in `tests/e2e/blog.spec.ts` for SPEC-FR-017 and SPEC-FR-024.
- [ ] T091 [P] [US5] Create blog domain types in `src/features/blog/types.ts` for SPEC-FR-016 and SPEC-FR-017.
- [ ] T092 [P] [US5] Implement blog query validation in `src/features/blog/schemas/blogFilters.ts` for SPEC-FR-016 and SPEC-FR-017.
- [ ] T093 [US5] Implement published blog list query in `src/features/blog/queries/getBlogPosts.ts` for SPEC-FR-016 and SPEC-FR-017.
- [ ] T094 [US5] Implement published blog detail query in `src/features/blog/queries/getBlogPostBySlug.ts` for SPEC-FR-017 and SPEC-FR-024.
- [ ] T095 [US5] Implement `GET /api/blog` in `src/app/api/blog/route.ts` for SPEC-FR-016 and SPEC-FR-017.
- [ ] T096 [US5] Implement `GET /api/blog/[slug]` in `src/app/api/blog/[slug]/route.ts` for SPEC-FR-017.
- [ ] T097 [P] [US5] Implement blog list components in `src/features/blog/components/blog-list.tsx` for SPEC-FR-016 and SPEC-FR-026.
- [ ] T098 [P] [US5] Implement rich text article renderer in `src/features/blog/components/article-body.tsx` for SPEC-FR-017 and SPEC-FR-029.
- [ ] T099 [US5] Implement localized blog listing route in `src/app/[locale]/(public)/blog/page.tsx` for SPEC-FR-016 and SPEC-FR-024.
- [ ] T100 [US5] Implement localized blog detail route in `src/app/[locale]/(public)/blog/[slug]/page.tsx` for SPEC-FR-017 and SPEC-FR-024.
- [ ] T101 [US5] Add blog translations in `src/messages/vi.json` and `src/messages/en.json` for SPEC-FR-016 and SPEC-FR-017.
- [ ] T102 [US5] Update blog coverage in `docs/specs/traceability-matrix.md` for SPEC-FR-016 and SPEC-FR-017.

---

## Epic 7: Public Site - Showrooms

**Coverage**: SPEC-FR-010, SPEC-FR-011, SPEC-FR-019, SPEC-FR-024, SPEC-FR-026.

- [ ] T103 [P] [US4] Create Google Maps URL validation unit tests in `tests/unit/showrooms/mapEmbed.test.ts` for SPEC-FR-010.
- [ ] T104 [P] [US4] Create showrooms API integration tests in `tests/integration/api/showrooms.test.ts` for SPEC-FR-010.
- [ ] T105 [P] [US4] Create showroom map fallback E2E tests in `tests/e2e/showrooms.spec.ts` for SPEC-FR-010 and SPEC-FR-011.
- [ ] T106 [P] [US4] Create showroom domain types in `src/features/showrooms/types.ts` for SPEC-FR-010 and SPEC-FR-019.
- [ ] T107 [P] [US4] Implement showroom validation schema in `src/features/showrooms/schemas/showroom.ts` for SPEC-FR-010.
- [ ] T108 [US4] Implement published showroom query in `src/features/showrooms/queries/getShowrooms.ts` for SPEC-FR-010.
- [ ] T109 [US4] Implement `GET /api/showrooms` in `src/app/api/showrooms/route.ts` for SPEC-FR-010.
- [ ] T110 [P] [US4] Implement showroom card component in `src/features/showrooms/components/showroom-card.tsx` for SPEC-FR-010 and SPEC-FR-026.
- [ ] T111 [P] [US4] Implement Google Maps embed with fallback link in `src/features/showrooms/components/map-embed.tsx` for SPEC-FR-010.
- [ ] T112 [US4] Implement localized showroom route in `src/app/[locale]/(public)/showrooms/page.tsx` for SPEC-FR-010 and SPEC-FR-024.
- [ ] T113 [US4] Add showroom translations in `src/messages/vi.json` and `src/messages/en.json` for SPEC-FR-010 and SPEC-FR-011.
- [ ] T114 [US4] Update showroom coverage in `docs/specs/traceability-matrix.md` for SPEC-FR-010 and SPEC-FR-011.

---

## Epic 8: Public Site - Contact/Quote Form

**Coverage**: SPEC-FR-007 to SPEC-FR-009, SPEC-FR-012, SPEC-FR-018, SPEC-FR-024, SPEC-FR-026, SPEC-FR-029.

- [ ] T115 [P] [US3] Create contact request schema unit tests in `tests/unit/contact/contactRequest.test.ts` for SPEC-FR-007 and SPEC-FR-008.
- [ ] T116 [P] [US3] Create contact API integration tests in `tests/integration/api/contact.test.ts` for SPEC-FR-007 to SPEC-FR-009.
- [ ] T117 [P] [US3] Create quote form E2E tests in `tests/e2e/contact-quote.spec.ts` for SPEC-FR-007 and SPEC-FR-008.
- [ ] T118 [P] [US3] Implement contact request Zod schema in `src/features/contact/schemas/contactRequest.ts` for SPEC-FR-007, SPEC-FR-008, and SPEC-FR-029.
- [ ] T119 [P] [US3] Implement contact feature types in `src/features/contact/types.ts` for SPEC-FR-007.
- [ ] T120 [P] [US3] Implement Resend email client in `src/lib/resend/client.ts` for SPEC-FR-009.
- [ ] T121 [US3] Implement quote notification hook in `src/payload/hooks/quoteNotifications.ts` for SPEC-FR-009 and SPEC-FR-018.
- [ ] T122 [US3] Implement `POST /api/contact` in `src/app/api/contact/route.ts` for SPEC-FR-007 to SPEC-FR-009.
- [ ] T123 [P] [US3] Implement quote form component in `src/features/contact/components/quote-form.tsx` for SPEC-FR-007, SPEC-FR-008, and SPEC-FR-026.
- [ ] T124 [US3] Implement localized contact route in `src/app/[locale]/(public)/contact/page.tsx` for SPEC-FR-007 and SPEC-FR-024.
- [ ] T125 [US3] Add contact form translations and validation messages in `src/messages/vi.json` and `src/messages/en.json` for SPEC-FR-007 and SPEC-FR-008.
- [ ] T126 [US3] Update contact and quote coverage in `docs/specs/traceability-matrix.md` for SPEC-FR-007 to SPEC-FR-009.

---

## Epic 9: Admin CMS - Customizations & AI Assistant

**Coverage**: SPEC-FR-018, SPEC-FR-020 to SPEC-FR-023, SPEC-FR-028, SPEC-FR-029.

- [ ] T127 [P] [US6] Create AI draft prompt unit tests in `tests/unit/ai/aiDrafts.test.ts` for SPEC-FR-022 and SPEC-FR-023.
- [ ] T128 [P] [US6] Create Admin/Editor authorization integration tests in `tests/integration/admin/roleAccess.test.ts` for SPEC-FR-020, SPEC-FR-021, and SPEC-FR-028.
- [ ] T129 [P] [US6] Create AI draft CMS integration tests in `tests/integration/admin/aiDrafts.test.ts` for SPEC-FR-022 and SPEC-FR-023.
- [ ] T130 [P] [US6] Create CMS role workflow E2E tests in `tests/e2e/admin-roles.spec.ts` for SPEC-FR-020, SPEC-FR-021, and SPEC-FR-028.
- [ ] T131 [US6] Implement locale admin redirect page in `src/app/[locale]/(admin)/admin/page.tsx` for SPEC-FR-028.
- [ ] T132 [P] [US6] Implement OpenAI server client in `src/lib/openai/client.ts` for SPEC-FR-022 and SPEC-FR-029.
- [ ] T133 [P] [US6] Implement AI prompt builders in `src/payload/hooks/aiPromptBuilder.ts` for SPEC-FR-022 and SPEC-FR-029.
- [ ] T134 [US6] Implement draft-only AI hook in `src/payload/hooks/aiDrafts.ts` for SPEC-FR-022 and SPEC-FR-023.
- [ ] T135 [P] [US6] Implement AI draft admin action component in `src/components/cms/ai-draft-action.tsx` for SPEC-FR-022 and SPEC-FR-023.
- [ ] T136 [P] [US6] Implement quote status filter admin component in `src/components/cms/quote-status-filter.tsx` for SPEC-FR-018.
- [ ] T137 [US6] Register AI and quote custom admin components in `src/payload/payload.config.ts` for SPEC-FR-018, SPEC-FR-022, and SPEC-FR-023.
- [ ] T138 [US6] Enforce Admin-only settings and user-management access in `src/payload/globals/SiteSettings.ts` for SPEC-FR-020 and SPEC-FR-021.
- [ ] T139 [US6] Update admin, roles, and AI coverage in `docs/specs/traceability-matrix.md` for SPEC-FR-018 and SPEC-FR-020 to SPEC-FR-023.

---

## Epic 10: SEO - Metadata, Sitemap, Schema.org

**Coverage**: SPEC-FR-024, SPEC-FR-025, SPEC-FR-011, NFR-06.

- [ ] T140 [P] Create metadata helper unit tests in `tests/unit/seo/metadata.test.ts` for SPEC-FR-024.
- [ ] T141 [P] Create schema.org helper unit tests in `tests/unit/seo/schema.test.ts` for SPEC-FR-024.
- [ ] T142 [P] Create sitemap and robots integration tests in `tests/integration/seo/sitemapRobots.test.ts` for SPEC-FR-025.
- [ ] T143 [P] Implement localized metadata helpers in `src/lib/seo/metadata.ts` for SPEC-FR-024.
- [ ] T144 [P] Implement schema.org builders in `src/lib/seo/schema.ts` for SPEC-FR-024.
- [ ] T145 [P] Implement sitemap data aggregation in `src/lib/seo/sitemapData.ts` for SPEC-FR-025.
- [ ] T146 Implement dynamic sitemap output in `src/app/sitemap.ts` for SPEC-FR-025.
- [ ] T147 Implement robots output excluding admin/private routes in `src/app/robots.ts` for SPEC-FR-025.
- [ ] T148 [US1] Add Organization schema to homepage and About routes in `src/features/homepage/seo/homepageSeo.ts` for SPEC-FR-024.
- [ ] T149 [US2] Add Product schema to product detail routes in `src/features/products/seo/productSeo.ts` for SPEC-FR-024.
- [ ] T150 [US5] Add Article schema to blog detail routes in `src/features/blog/seo/blogSeo.ts` for SPEC-FR-024.
- [ ] T151 [US4] Add LocalBusiness schema to showroom routes in `src/features/showrooms/seo/showroomSeo.ts` for SPEC-FR-024.
- [ ] T152 Update SEO coverage in `docs/specs/traceability-matrix.md` for SPEC-FR-024 and SPEC-FR-025.

---

## Epic 11: Performance & Security Hardening

**Coverage**: SPEC-FR-004, SPEC-FR-008, SPEC-FR-028, SPEC-FR-029, SPEC-FR-031, NFR-01, NFR-02, NFR-05.

- [ ] T153 [P] Create public rate-limit unit tests in `tests/unit/security/rateLimit.test.ts` for SPEC-FR-008 and SPEC-FR-029.
- [ ] T154 [P] Create unsafe input hardening unit tests in `tests/unit/security/inputHardening.test.ts` for SPEC-FR-008 and SPEC-FR-029.
- [ ] T155 [P] Create product filter SLA integration tests in `tests/integration/performance/productFilterSla.test.ts` for SPEC-FR-004.
- [ ] T156 [P] Implement rate limiting helper in `src/lib/security/rateLimit.ts` for SPEC-FR-008 and SPEC-FR-029.
- [ ] T157 [P] Implement safe URL validation helper in `src/lib/security/safeUrl.ts` for SPEC-FR-010 and SPEC-FR-029.
- [ ] T158 [P] Implement rich-text sanitization helper in `src/lib/security/sanitize.ts` for SPEC-FR-017 and SPEC-FR-029.
- [ ] T159 [P] Implement media upload validation schema in `src/features/media/schemas/imageUpload.ts` for SPEC-FR-029.
- [ ] T160 Apply rate limiting to public search and contact routes in `src/app/api/products/search/route.ts` and `src/app/api/contact/route.ts` for SPEC-FR-008 and SPEC-FR-029.
- [ ] T161 Apply cache and revalidation strategy to public content queries in `src/lib/payload/client.ts` for NFR-01.
- [ ] T162 Add server-only secret exposure tests in `tests/unit/env/serverOnly.test.ts` for SPEC-FR-028 and SPEC-FR-029.
- [ ] T163 Document uptime monitoring and operational readiness in `docs/ops/monitoring.md` for SPEC-FR-031.
- [ ] T164 Update performance and security coverage in `docs/specs/traceability-matrix.md` for SPEC-FR-004, SPEC-FR-028, SPEC-FR-029, and SPEC-FR-031.

---

## Epic 12: Testing - Unit (Vitest) + E2E (Playwright)

**Coverage**: All stories, NFR-01, NFR-03, NFR-04, NFR-05, NFR-06.

- [ ] T165 Configure Vitest setup and DOM matchers in `vitest.config.ts` and `tests/setup/vitest.setup.ts` for cross-feature unit tests.
- [ ] T166 Configure Playwright desktop, mobile, and browser projects in `playwright.config.ts` for NFR-03 and NFR-04.
- [ ] T167 [P] Create reusable launch content fixtures in `tests/fixtures/launch-content.ts` for US1 to US6.
- [ ] T168 [P] Create public site Playwright page objects in `tests/e2e/pages/publicSite.ts` for US1 to US4.
- [ ] T169 [P] Create CMS Playwright page objects in `tests/e2e/pages/adminCms.ts` for US5 and US6.
- [ ] T170 Create responsive and browser smoke E2E tests in `tests/e2e/responsive-browser.spec.ts` for SPEC-FR-026 and SPEC-FR-027.
- [ ] T171 Create SEO smoke E2E tests in `tests/e2e/seo-smoke.spec.ts` for SPEC-FR-024 and SPEC-FR-025.
- [ ] T172 Create accessibility smoke E2E tests in `tests/e2e/accessibility-smoke.spec.ts` for SPEC-FR-026.
- [ ] T173 Update implementation test plan in `docs/specs/test-plan.md` for US1 to US6 and NFR-01 to NFR-06.
- [ ] T174 Run `pnpm lint` and record results in `docs/specs/traceability-matrix.md` for the completed implementation slice.
- [ ] T175 Run `pnpm typecheck` and record results in `docs/specs/traceability-matrix.md` for the completed implementation slice.
- [ ] T176 Run `pnpm test` and record results in `docs/specs/traceability-matrix.md` for the completed implementation slice.
- [ ] T177 Run `pnpm build` and record results in `docs/specs/traceability-matrix.md` for the completed implementation slice.
- [ ] T178 Run `pnpm test:e2e` and record results in `docs/specs/traceability-matrix.md` when public routes, admin auth, i18n, SEO, or quote flow are affected.

---

## Epic 13: CI/CD - GitHub Actions + Vercel Deploy

**Coverage**: SPEC-FR-031, NFR-01, NFR-02, NFR-05, NFR-07.

- [ ] T179 Create CI workflow for lint, typecheck, unit tests, and build in `.github/workflows/ci.yml` for NFR-07.
- [ ] T180 [P] Create Playwright E2E workflow in `.github/workflows/e2e.yml` for NFR-03 and NFR-04.
- [X] T181 [P] Create Vercel deployment configuration in `vercel.json` for NFR-01 and NFR-02.
- [ ] T182 [P] Create Payload service deployment blueprint in `render.yaml` for NFR-02.
- [X] T183 [P] Document Vercel frontend deployment in `docs/deploy/vercel.md` for NFR-02.
- [ ] T184 [P] Document Payload service deployment and environment variables in `docs/deploy/payload-service.md` for NFR-02 and NFR-05.
- [ ] T185 [P] Document managed PostgreSQL and Cloudinary setup in `docs/deploy/database-cloudinary.md` for NFR-05.
- [ ] T186 Update CI/CD and deployment coverage in `docs/specs/traceability-matrix.md` for SPEC-FR-031 and NFR-02.

---

## Dependencies & Execution Order

### Epic Dependencies

- **Epic 1** has no dependencies and must complete before coding feature slices.
- **Epic 2** depends on Epic 1 and blocks CMS-backed public stories.
- **Epic 3** depends on Epic 1 and blocks public page implementation.
- **Epics 4, 5, 6, 7, and 8** depend on Epics 2 and 3, then can proceed in priority order or in parallel by separate developers.
- **Epic 9** depends on Epics 1 and 2, and can proceed in parallel with public page epics after Payload access rules exist.
- **Epic 10** depends on the relevant public route or query for each schema/metadata task.
- **Epic 11** can begin after Epic 1, but route-specific hardening depends on the affected route.
- **Epic 12** starts with test configuration after Epic 1 and continues throughout every story.
- **Epic 13** should land after the first passing foundation build, then be extended as Payload and E2E coverage mature.

### User Story Dependencies

- **US1 (P1)**: Requires Epics 1, 2, and 3. No dependency on US2 to US6.
- **US2 (P1)**: Requires Epics 1, 2, and 3. Can ship after catalog collections and queries are ready.
- **US3 (P1)**: Requires Epics 1, 2, and 3 plus Resend environment configuration.
- **US5 (P1)**: Requires Epics 1 and 2. Public blog work also requires Epic 3.
- **US4 (P2)**: Requires Epics 1, 2, and 3. Can ship after showrooms and site settings are ready.
- **US6 (P2)**: Requires Epics 1 and 2. AI work additionally requires OpenAI environment configuration.

### MVP Scope

1. Complete Epic 1.
2. Complete the subset of Epic 2 needed for `HomePage`, `AboutPage`, `ProductCategories`, `SiteSettings`, access rules, and publish validation.
3. Complete Epic 3.
4. Complete Epic 4 for US1.
5. Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and the homepage/i18n Playwright tests.

This MVP proves the bilingual public shell, CMS-managed homepage/about content, first-viewport product groups, SEO baseline, and responsive behavior.

---

## Parallel Opportunities

- In Epic 1, T007 to T012 can run in parallel after dependency alignment.
- In Epic 2, collection/global files T019 to T029 can run in parallel after T018 defines the Payload config pattern.
- In Epic 3, message files and layout components T039 to T045 can run in parallel after locale routing conventions are decided.
- In Epic 5, test tasks T063 to T068 and UI component tasks T080 to T083 can run in parallel because they touch separate files.
- In Epics 6, 7, and 8, route-handler tests can be written in parallel with feature type/schema files.
- In Epic 9, OpenAI client, prompt builder, and admin UI action tasks can run in parallel before final Payload registration.
- In Epic 10, schema builders and SEO tests can run in parallel with sitemap implementation.
- In Epic 13, deployment documentation tasks T183 to T185 can run in parallel with workflow creation.

## Parallel Example: US2 Product Catalog

```text
Task: T063 Create product filter schema unit tests in tests/unit/products/productFilters.test.ts
Task: T064 Create Vietnamese keyword normalization unit tests in tests/unit/products/searchNormalization.test.ts
Task: T069 Create product domain types in src/features/products/types.ts
Task: T070 Implement product filter query validation in src/features/products/schemas/productFilters.ts
Task: T080 Implement catalog filter controls in src/features/products/components/catalog-filters.tsx
Task: T081 Implement product search input in src/features/products/components/product-search.tsx
```

## Implementation Strategy

### MVP First

Complete the US1 path first: setup, CMS foundation for homepage/about/settings, i18n layout, homepage, about page, metadata, and responsive tests. Stop and validate that `/vi` and `/en` satisfy the first-viewport requirement before adding product catalog depth.

### Incremental Delivery

1. US1 brand discovery and bilingual shell.
2. US2 product catalog list, filters, search, and detail.
3. US3 quote form persistence and notification.
4. US5 CMS content management and blog.
5. US4 showrooms, maps, social links, and sharing.
6. US6 lead management, roles, settings, and AI drafts.
7. Cross-cutting SEO, performance, security, E2E, and CI/CD hardening.

### Completion Criteria Per Slice

- Relevant acceptance scenarios pass.
- Tests are added or updated before implementation where practical.
- `docs/specs/traceability-matrix.md` is updated with requirement IDs, files, tests, verification commands, and residual risks.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` pass, or any blocker is documented.
- `pnpm test:e2e` runs when public routes, CMS auth, responsive behavior, i18n, SEO, or quote flow are affected.


