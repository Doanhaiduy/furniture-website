# Traceability Matrix

Status values: `Planned`, `In Progress`, `Implemented`, `Blocked`, `Deferred`.

| Requirement | Design Element | Implementation Area | Planned Test(s) | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| FR-01 | CMS-managed HomePage global with full homepage sections and two fixed product-group cards. | `app/[locale]/page.tsx`, `components/showroom/public-shell.tsx`, `lib/showroom-data.ts` | TC-E2E-HOME-001 | In Progress | Frontend mock renders first-viewport company signal and product groups; Payload global pending. |
| FR-02 | AboutPage global with vision, mission, capabilities, bilingual fields. | `app/[locale]/about/page.tsx`, `lib/showroom-data.ts` | TC-INT-ABOUT-001 | In Progress | Public bilingual page implemented from mock CMS data; Payload global pending. |
| FR-03 | Products and ProductCategories collections with quote-first structured catalog. | `app/[locale]/products/**`, `app/admin/[section]/page.tsx`, `components/showroom/admin-pages.tsx`, `lib/showroom-data.ts` | TC-INT-CMS-PROD-001 | In Progress | Public/admin frontend prototype implemented; Payload collections pending. |
| FR-04 | URL-driven filters over category, price range, attributes. | `app/[locale]/products/page.tsx`, `lib/showroom-data.ts`, `tests/unit/product-filter.test.ts` | TC-INT-FILTER-001 | In Progress | Mock category/material/search filters implemented; production indexing pending. |
| FR-05 | Keyword search over localized product fields and reference/category data. | `app/[locale]/products/page.tsx`, `lib/showroom-data.ts`, `tests/unit/product-filter.test.ts` | TC-INT-SEARCH-001 | In Progress | Localized mock search implemented; accent-insensitive tuning pending. |
| FR-06 | BlogPosts and BlogCategories with localized slugs and SEO. | `app/[locale]/blog/**`, `components/showroom/admin-pages.tsx`, `lib/showroom-data.ts` | TC-INT-BLOG-001 | In Progress | Public blog list/detail and admin editor prototype implemented; Payload collections pending. |
| FR-07-PUB | Public quote/contact form with Zod, rate limit, persistence. | `app/[locale]/contact/**`, `app/api/contact/route.ts`, `components/showroom/quote-form.tsx`, `lib/validations/quote.ts`, `tests/unit/quote-schema.test.ts` | TC-UNIT-QUOTE-001, TC-E2E-QUOTE-001 | In Progress | Zod validation and mock submit route implemented; persistence/rate limit/Resend pending. |
| FR-07-ADM | Admin-only quote request management in Payload. | `app/admin/[section]/page.tsx`, `components/showroom/admin-pages.tsx`, `components/showroom/admin-interactions.tsx` | TC-E2E-QUOTE-001, TC-SEC-QUOTE-001 | In Progress | Admin quote UI and status interaction implemented; Payload Admin-only access pending. |
| FR-08-PUB | Public showroom page with Google Maps embed and fallback. | `app/[locale]/showrooms/page.tsx`, `lib/showroom-data.ts` | TC-E2E-SHOWROOM-001 | In Progress | Public showroom cards, call and map embed implemented with mock content. |
| FR-08-ADM | Showrooms collection with localized address and map fields. | `components/showroom/admin-pages.tsx`, `app/admin/[section]/page.tsx` | TC-INT-SHOWROOM-001 | In Progress | Admin showroom frontend prototype implemented; Payload collection pending. |
| FR-09 | SiteSettings social links and share components. | `components/showroom/public-shell.tsx`, `components/showroom/social-share.tsx`, `app/[locale]/blog/[slug]/page.tsx`, `app/[locale]/products/[slug]/page.tsx` | TC-E2E-SOCIAL-001 | In Progress | Footer links and social share buttons implemented; SiteSettings-backed URLs pending. |
| FR-10 | Payload Users, role access rules, SiteSettings governance. | `app/admin/**`, `components/showroom/admin-shell.tsx`, `components/showroom/admin-pages.tsx` | TC-SEC-RBAC-001 | In Progress | Admin users/settings/access-denied UI implemented; server-side Payload RBAC pending. |
| FR-11 | OpenAI draft-only CMS assistant. | `components/showroom/admin-interactions.tsx`, `components/showroom/admin-pages.tsx`, `app/admin/[section]/page.tsx` | TC-INT-AI-001 | In Progress | AI loading/error/result draft workflow mocked; OpenAI server action pending. |
| FR-12-PUB | next-intl locale routing and one-click switcher. | `i18n/**`, `proxy.ts`, `messages/**`, `app/[locale]/layout.tsx`, `components/showroom/public-shell.tsx` | TC-E2E-I18N-001 | In Progress | next-intl locale routing and switcher implemented. |
| FR-12-ADM | Payload localized fields and publication validation. | `components/showroom/admin-pages.tsx`, `components/showroom/admin-interactions.tsx` | TC-INT-I18N-CMS-001 | In Progress | Bilingual admin tabs and missing-locale states mocked; Payload localized validation pending. |
| NFR-01 | Performance budget, cached public reads, Cloudinary optimization, indexed queries. | `app/[locale]/**`, `app/sitemap.ts`, `app/robots.ts`, `lib/showroom-data.ts` | TC-PERF-001, TC-INT-FILTER-001 | In Progress | Static/mock FE keeps queries bounded; production CMS performance evidence pending. |
| NFR-02 | Deployment health checks and uptime monitoring. | `docs/architecture/deployment.md`, monitoring config later | TC-OPS-001 | Planned | Release blocker, not coding blocker. |
| NFR-03 | Responsive public/admin UI requirements. | `components/showroom/**`, `app/[locale]/**`, `app/admin/**`, `tests/e2e/public-admin.spec.ts` | TC-E2E-HOME-001, TC-E2E-RESP-001 | In Progress | Responsive public/admin layouts implemented; browser screenshot review pending. |
| NFR-04 | Browser compatibility matrix. | Playwright config and manual smoke plan | TC-E2E-BROWSER-001 | Planned | Coc Coc likely manual smoke. |
| NFR-05 | Payload RBAC, Zod validation, Cloudinary upload safety, secret handling, XSS/SQL mitigation. | `lib/validations/quote.ts`, `app/api/contact/route.ts`, `app/admin/access-denied/page.tsx`, `components/showroom/admin-pages.tsx` | TC-SEC-001, TC-SEC-RBAC-001 | In Progress | Public quote server validation and access-denied UI implemented; Payload RBAC/upload validation pending. |
| NFR-06 | Metadata, sitemap, robots, schema, canonical, hreflang. | `app/[locale]/**`, `app/sitemap.ts`, `app/robots.ts` | TC-SEO-001 | In Progress | Metadata, sitemap and robots implemented; schema.org objects still pending. |
| NFR-07 | Governed Next.js/Payload/PostgreSQL/Cloudinary boundaries. | `app/**`, `components/showroom/**`, `lib/showroom-data.ts`, `docs/specs/traceability-matrix.md` | TC-ARCH-001 | In Progress | FE mock keeps backend-connectable boundaries; Payload implementation pending. |

## Audit Resolution

| Previous Artifact Issue | Resolution |
| --- | --- |
| Supabase Auth/Storage/RLS references conflicted with requested Payload/PostgreSQL/Cloudinary architecture. | Replaced with Payload auth/access control, managed PostgreSQL, and Cloudinary media model. |
| Homepage was sometimes described as hero/banner-only. | Expanded to full CMS-managed homepage model with required marketing sections and section toggles. |
| Editor role previously included quote request access in some planning docs. | Corrected to Role Model Option A: Editor manages publishable content only; Admin owns quote requests/users/settings. |
| Missing architecture, deployment, security, performance, AI, and audit docs. | Added under `docs/architecture/`, `docs/decisions/`, and `docs/ai/`. |

## Update Rule

For every implementation task, update the row status and add concrete changed files, test files, verification results, and residual risks.

## Frontend UI Prototype Update - 2026-06-01

Implemented a production-demo frontend from `03_Modern_Showroom` art direction: Heritage Modernism tokens, public localized routes, admin dashboard prototype, CMS states, quote form, mock data/state, loading/error/success/empty pages, sitemap and robots.

Tests added:

- `tests/unit/quote-schema.test.ts`
- `tests/unit/product-filter.test.ts`
- `tests/e2e/public-admin.spec.ts`

Residual risks:

- Payload collections, server-side RBAC, persistence, Resend, Cloudinary upload validation, OpenAI server action, schema.org JSON-LD, and production performance evidence remain pending backend slices.

## Frontend UI Refinement Update - 2026-06-01

Polished the existing frontend without changing routes, IA, localization contracts, or mock data. Updated shared motion/design-system utilities, public shell/navigation, quote form feedback, product/blog/showroom cards, page/state transitions, admin shell, tables, forms, CMS state panels, AI workflow, loading skeletons, success/error/404 states, and social sharing affordances.

Requirement coverage:

- Public UI polish: `FR-01`, `FR-02`, `FR-03`, `FR-04`, `FR-05`, `FR-06`, `FR-07-PUB`, `FR-08-PUB`, `FR-09`, `FR-12-PUB`, `NFR-01`, `NFR-03`, `NFR-06`.
- Admin/CMS polish: `FR-07-ADM`, `FR-08-ADM`, `FR-10`, `FR-11`, `FR-12-ADM`, `NFR-03`, `NFR-07`.

Verification target remains unchanged: run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm test:e2e` after the refinement pass.

## Major Public/Admin Redesign Update - 2026-06-01

Extended the frontend redesign pass after visual audit. Public site now includes a rotating hero showcase with controls, first-viewport category links, desktop/mobile product mega menu, richer product cards, stronger homepage editorial sections, enhanced product browsing with Radix/shadcn select controls, additional non-price filters, selected filter chips, and more immersive category/product presentation. Admin prototype was restyled into a modern dashboard system with dark navigation anchor, elevated topbar, summary widgets, chart-style insight panel, redesigned login, softer cards/tables/forms, and Radix/shadcn select controls across admin workflows.

Files touched include:

- `components/showroom/hero-showcase.tsx`
- `components/showroom/premium-select.tsx`
- `components/showroom/product-card.tsx`
- `components/showroom/public-shell.tsx`
- `components/showroom/admin-shell.tsx`
- `components/showroom/admin-pages.tsx`
- `components/showroom/admin-interactions.tsx`
- `components/showroom/quote-form.tsx`
- `app/[locale]/page.tsx`
- `app/[locale]/products/page.tsx`
- `app/[locale]/products/[slug]/page.tsx`
- `lib/showroom-data.ts`
- `messages/vi.json`
- `messages/en.json`

Requirement coverage:

- Public: `FR-01`, `FR-03`, `FR-04`, `FR-05`, `FR-07-PUB`, `FR-08-PUB`, `FR-09`, `FR-12-PUB`, `NFR-01`, `NFR-03`, `NFR-06`.
- Admin/CMS prototype: `FR-03`, `FR-06`, `FR-07-ADM`, `FR-08-ADM`, `FR-10`, `FR-11`, `FR-12-ADM`, `NFR-03`, `NFR-07`.

Backend residual risks remain unchanged: Payload collections, RBAC enforcement, persistence, Resend, Cloudinary upload validation, OpenAI server action, and production analytics are pending backend slices.

## Targeted UX/UI Completion Update - 2026-06-01

Completed the follow-up refinement pass without changing routes, localization contracts, quote flow, or admin section URLs.

Files touched include:

- `components/showroom/public-shell.tsx`
- `app/[locale]/page.tsx`
- `app/[locale]/products/[slug]/page.tsx`
- `components/showroom/product-detail-experience.tsx`
- `app/[locale]/blog/[slug]/page.tsx`
- `components/showroom/article-toc.tsx`
- `components/showroom/admin-shell.tsx`
- `components/showroom/admin-pages.tsx`
- `app/globals.css`
- `lib/showroom-data.ts`
- `messages/vi.json`
- `messages/en.json`

Implemented updates:

- Mega menu now has delayed close behavior, a pointer bridge/hit area, Escape handling, and focus/blur stability.
- Homepage rhythm now moves the story/narrative section near the bottom, adds missing section intros, adds editorial/trust middle sections, and uses a sticky showroom background reveal with reduced-motion fallback.
- Product detail now has clickable gallery thumbnails, active thumbnail state, enlarged image dialog, and premium tabbed content for overview, specifications, materials/craft, dimensions/care, and delivery/warranty.
- Article detail now uses structured mock CMS body content, a sticky side table of contents with active heading tracking, key takeaways, image blocks, pull quote, separators, and related reading.
- Admin shell was rebuilt around the reference direction with dark left sidebar, compact topbar, light content canvas, elevated KPI/cards, chart-style dashboard panel, right utility rail, and mobile admin tabs across all admin sections.

Requirement coverage:

- Public UX: `FR-01`, `FR-03`, `FR-06`, `FR-09`, `FR-12-PUB`, `NFR-01`, `NFR-03`, `NFR-06`, `NFR-07`.
- Admin prototype UX: `FR-03`, `FR-06`, `FR-07-ADM`, `FR-08-ADM`, `FR-10`, `FR-11`, `FR-12-ADM`, `NFR-03`, `NFR-07`.

Verification completed:

- `pnpm lint` passed.
- `pnpm typecheck` passed.
- `pnpm test` passed: 2 files, 6 tests.
- `pnpm build` passed.
- `pnpm test:e2e` passed on rerun: 12 tests across Chromium, Firefox, and WebKit. One initial Firefox locale-switch run missed the products heading during dev-server timing, then passed on targeted rerun and full rerun.
- Playwright visual smoke checked `/vi`, `/vi/products/sofa-curve-velour`, `/vi/blog/bi-quyet-chon-go-oc-cho`, `/admin`, and `/admin/products` mobile. No horizontal overflow was reported; mega menu bridge, product tabs, admin right rail, and mobile admin shell rendered.

Residual risks remain backend-related: Payload collections, server-side RBAC, persistence, Resend, Cloudinary upload validation, OpenAI server action, production analytics, and final launch content are still pending backend/content slices.

## Post-Migration UI/UX Audit Fix Update - 2026-06-02

Completed a targeted audit-and-fix pass on the migrated public/admin frontend without changing route structure, localization contracts, or the current art direction.

Files touched include:

- `app/globals.css`
- `app/layout.tsx`
- `app/[locale]/layout.tsx`
- `app/[locale]/products/page.tsx`
- `app/[locale]/products/[slug]/page.tsx`
- `app/[locale]/blog/[slug]/page.tsx`
- `app/admin/[section]/page.tsx`
- `components/showroom/public-shell.tsx`
- `components/showroom/product-filter-panel.tsx`
- `components/showroom/product-sort-select.tsx`
- `components/showroom/product-detail-experience.tsx`
- `components/showroom/article-toc.tsx`
- `components/showroom/social-share.tsx`
- `components/showroom/admin-shell.tsx`
- `components/showroom/admin-pages.tsx`
- `components/showroom/admin-dashboard-widgets.tsx`
- `components/showroom/admin-interactions.tsx`
- `lib/showroom-data.ts`
- `messages/vi.json`
- `messages/en.json`
- `tests/unit/product-filter.test.ts`
- `tests/e2e/public-admin.spec.ts`

Implemented updates:

- Public/admin background surfaces now use consistent layered system backgrounds with corrected page-level layering and no clipped flat blocks.
- Product listing now has collapsed default filters, advanced filter expansion, URL-backed sorting, real pagination over mock catalog data, active page styling, disabled previous/next states, and a cleaned secondary category taxonomy section.
- Article detail now keeps table of contents and related articles in one sticky reading side column on desktop, with mobile reflow through a collapsed details block.
- Admin dashboard now uses real interactive chart/calendar/utility widgets with stateful buttons, links, and visual feedback instead of decorative controls.
- Admin product/category create flows now live at top-level `?new=1` screens with correctly placed header actions, including the missing category create flow.
- Admin and shared layout density was reduced through smaller typography, narrower sidebar, tighter main padding, and lower-radius surfaces while preserving readability.
- Clickable public/admin controls now trigger navigation, state updates, form submission, copy feedback, upload selection, or draft/publish feedback.

Requirement coverage:

- Public UX: `FR-03`, `FR-04`, `FR-05`, `FR-06`, `FR-09`, `FR-12-PUB`, `NFR-03`, `NFR-07`.
- Admin/CMS UX: `FR-03`, `FR-06`, `FR-10`, `FR-11`, `FR-12-ADM`, `NFR-03`, `NFR-07`.

Verification target:

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm test:e2e`.
- Playwright smoke checks should cover `/vi/products`, `/vi/products?page=2`, `/vi/blog/bi-quyet-chon-go-oc-cho`, `/admin`, `/admin/products?new=1`, and `/admin/categories?new=1` on desktop/mobile.

Residual risks remain backend-related: Payload collections, server-side RBAC, persistence, Cloudinary upload governance, OpenAI server action wiring, and production CMS pagination/search remain pending backend slices.

## Admin Calendar and Fixed Background Fix Update - 2026-06-02

Completed a focused admin UI correction pass without changing admin routes, section contracts, or the current visual direction.

Files touched include:

- `components/showroom/admin-dashboard-widgets.tsx`
- `components/showroom/admin-shell.tsx`
- `components/showroom/premium-select.tsx`
- `app/globals.css`
- `tests/e2e/public-admin.spec.ts`

Implemented updates:

- Replaced partial date/day controls with a real Radix popover calendar for the dashboard chart date, right-rail date label, and calendar icon trigger.
- Calendar selection updates visible dashboard state, closes after selection, supports Escape/outside close, renders in a portal above shell overflow, and exposes open/selected state through `aria-expanded`, `aria-pressed`, and `aria-selected`.
- Right-rail Today and weekday controls now have clearer selected states and real state changes.
- Admin notification and select triggers now expose clearer open/active styling.
- Admin background is now a fixed non-interactive viewport layer behind the existing shell, with absolute fallback on mobile/reduced-motion contexts.

Requirement coverage:

- Admin UX/accessibility: `FR-10`, `FR-12-ADM`, `NFR-03`, `NFR-07`.

Verification completed:

- `pnpm lint` passed.
- `pnpm typecheck` passed.
- `pnpm test` passed: 2 files, 8 tests.
- `pnpm build` passed.
- `pnpm test:e2e --project=chromium -g "admin dashboard controls navigate or update state"` passed.
- Playwright smoke verified `/admin` desktop/mobile calendar open, date selection, Escape close, no horizontal overflow, and fixed/absolute background fallback behavior.

## Admin Sticky Shell and Typography Refinement Update - 2026-06-02

Completed a focused admin layout correction pass after migration polish.

Files touched include:

- `components/showroom/admin-shell.tsx`
- `components/showroom/admin-pages.tsx`
- `components/showroom/admin-interactions.tsx`
- `components/showroom/admin-dashboard-widgets.tsx`
- `app/globals.css`
- `tests/e2e/public-admin.spec.ts`

Implemented updates:

- Admin sidebar is now sticky to the left/top on desktop and remains visible during long-page scroll.
- Admin header/mobile admin nav are now sticky at the top instead of scrolling away with page content.
- Added working collapse controls for the desktop sidebar and top header, with `aria-pressed`, accessible labels, hover/focus states, and reduced-motion-safe transitions.
- Reduced admin typography scale, card padding, table density, heading weight, and page spacing to make the UI feel less bulky while preserving readability.
- Removed the shell overflow constraint that prevented reliable sticky behavior; popovers remain portaled above the shell.

Requirement coverage:

- Admin UX/responsive behavior: `FR-10`, `FR-12-ADM`, `NFR-03`, `NFR-07`.

Verification completed:

- `pnpm lint` passed.
- `pnpm typecheck` passed.
- `pnpm test` passed: 2 files, 8 tests.
- `pnpm build` passed.
- `pnpm test:e2e --project=chromium` passed: 6 tests.
- Playwright smoke verified `/admin` desktop/mobile sticky positions, collapse states, no horizontal overflow, and reduced header/sidebar dimensions.

## Public Hero and Catalog Header Refinement Update - 2026-06-02

Completed a focused public homepage/header correction pass without changing public routes, localization contracts, quote-first product behavior, or the existing visual direction.

Files touched include:

- `components/showroom/hero-showcase.tsx`
- `components/showroom/public-shell.tsx`
- `lib/showroom-data.ts`
- `messages/vi.json`
- `messages/en.json`
- `tests/e2e/public-admin.spec.ts`

Implemented updates:

- Homepage hero is now a real image-first carousel with auto slide, previous/next controls, pause/resume state, side image peeks on desktop, compact caption content, and reduced-motion-safe transitions.
- Secondary public header now separates brand taxonomy from product-type taxonomy: `Danh mục hãng` opens a brand mega menu, while the right-aligned category items open type-specific dropdowns.
- Brand menu now exposes representative brand products/groups on hover/focus/click instead of reusing product category data.
- Product-type dropdowns now show type items such as `Bồn tắm`, `Bồn cầu`, `Lavabo`, `Sen tắm`, furniture groups, tile groups, and project-service links from structured mock taxonomy data.
- Mobile public menu now includes separate brand and featured-type sections.

Requirement coverage:

- Public homepage/header UX: `FR-01`, `FR-03`, `FR-04`, `FR-12-PUB`, `NFR-03`, `NFR-07`.

Verification target:

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm test:e2e --project=chromium`.
- Playwright smoke should verify `/vi` desktop/mobile hero rendering, no horizontal overflow, brand mega menu hover, and type dropdown hover.

## Hero Cleanup and Admin Full-Bleed Shell Update - 2026-06-02

Completed a targeted cleanup after visual review without changing routes, product taxonomy, localization contracts, or admin section URLs.

Files touched include:

- `components/showroom/hero-showcase.tsx`
- `app/[locale]/page.tsx`
- `components/showroom/admin-shell.tsx`
- `components/showroom/admin-dashboard-widgets.tsx`
- `tests/e2e/public-admin.spec.ts`

Implemented updates:

- Removed the visible hero caption/card content so the homepage hero is now an image-first carousel with only minimal slide controls.
- Removed the immediate category boxes under the hero that were visually colliding with the carousel area.
- Preserved the homepage H1 as screen-reader/SEO content while removing it from the visual hero layer.
- Converted the admin shell to a full-bleed layout by removing the outer wrapper padding, max-width, border, rounded container, and offset sticky positions.
- Admin sidebar now starts at viewport `x=0/y=0`; admin header starts at top edge and fills the remaining width with no outer whitespace.
- Adjusted the admin utility rail sticky offset so it remains below the sticky header during scroll.

Requirement coverage:

- Public homepage UX: `FR-01`, `FR-12-PUB`, `NFR-03`.
- Admin layout UX: `FR-10`, `FR-12-ADM`, `NFR-03`, `NFR-07`.

Verification target:

- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm test:e2e --project=chromium`.
- Playwright smoke should verify `/vi` hero has no visible text/category overlay, `/admin` desktop shell is flush to viewport edges, and `/admin` mobile has no horizontal overflow.

## Admin UI Audit and Modernization Polish Update - 2026-06-02

Completed a focused admin visual and interaction polish pass after route-level migration fixes.

Files touched include:

- `app/globals.css`
- `components/showroom/admin-shell.tsx`
- `components/showroom/admin-pages.tsx`
- `components/showroom/admin-interactions.tsx`
- `components/showroom/admin-dashboard-widgets.tsx`
- `components/showroom/premium-select.tsx`

Root causes identified:

- Admin surfaces were still inheriting public-site color tokens and oversized shadow/radius treatments, making controls feel rough and inconsistent.
- Select/dropdown panels rendered through portals could bypass admin background overrides and keep public styling.
- Quote status cells used a full block treatment instead of compact status pills.
- AI assistant, editor toolbar, unsaved-change banner, and quick action cards mixed placeholder-like surfaces with real controls.
- Admin clickable controls lacked a consistent pointer/hover/focus/pressed baseline.

Implemented updates:

- Normalized admin surface, card, input, outline button, primary button, and interactive-card styling to a cleaner admin visual system.
- Added global admin pointer, hover, active, focus, and transition baselines while respecting reduced-motion rules already in the app.
- Added an admin tone to `PremiumSelect` so admin dropdown triggers and portaled content use neutral admin surfaces without changing public product filters/forms.
- Refined AI draft workflow, unsaved-change banner, locale tabs, rich text toolbar, quote status pills, warning panel, and quick actions so they look like production controls rather than migrated placeholders.
- Kept existing admin routes, labels, mock data behavior, date/calendar interactions, and component contracts intact.

Requirement coverage:

- Admin CMS usability and interaction quality: `FR-10`, `FR-11`, `FR-12-ADM`, `NFR-03`, `NFR-07`.

Verification completed:

- `pnpm lint` passed.
- `pnpm typecheck` passed.
- `pnpm test` passed: 2 files, 8 tests.
- `pnpm build` passed.
- `pnpm test:e2e --project=chromium` passed: 6 tests.
- Playwright smoke verified `/admin` desktop and `/admin/products` mobile have no horizontal overflow, desktop fixed admin background, mobile fallback background, sidebar/header flush to the viewport, pointer cursor on clickable controls, working calendar selection, and working admin select dropdown.

## Blog UI Optimization Update - 2026-06-02

Completed a focused public blog UI polish pass without changing localized blog routes, sitemap behavior, social sharing, or mock CMS data shape.

Files touched include:

- `app/[locale]/blog/page.tsx`
- `app/[locale]/blog/[slug]/page.tsx`
- `components/showroom/article-toc.tsx`
- `tests/e2e/public-admin.spec.ts`

Root causes identified:

- Blog list used a landing-style centered hero and a heavy dark featured card, making the editorial page feel oversized and visually blunt.
- Blog cards were not semantic `<article>` elements and metadata/date/read-time hierarchy was weak.
- Blog detail hero image had text overlay and very large typography, which hurt mobile readability and made the article feel cramped.
- Related articles in the sticky side column were text-only, so the reading aid felt unfinished.

Implemented updates:

- Reworked the blog list into a cleaner editorial layout with balanced header, topic summary, semantic article cards, clearer metadata, image alt text, and responsive card sizing.
- Refined the featured blog card from a heavy dark block into a lighter editorial card aligned with the current visual system.
- Reworked blog detail typography, hero image treatment, key takeaways, quote callout, section rhythm, and image spacing for better reading flow on desktop and mobile.
- Improved the sticky table of contents active state and related article cards with thumbnails while preserving TOC behavior and localized routes.
- Added E2E coverage for blog list/detail editorial structure.

Requirement coverage:

- Blog/public content UX: `FR-06`, `FR-09`, `FR-12-PUB`, `NFR-03`, `NFR-06`, `NFR-07`.

Verification completed:

- `pnpm lint` passed.
- `pnpm typecheck` passed.
- `pnpm test` passed: 2 files, 8 tests.
- `pnpm build` passed.
- `pnpm test:e2e --project=chromium` passed: 7 tests.
- Playwright smoke verified `/vi/blog` and `/vi/blog/bi-quyet-chon-go-oc-cho` on desktop and mobile, semantic article count, loaded images, table-of-contents presence, and no horizontal overflow.

## Vercel Frontend Deployment Setup - 2026-06-02

Completed the first frontend deployment setup slice for Vercel.

Files touched include:

- `vercel.json`
- `package.json`
- `.gitignore`
- `.env.example`
- `docs/deploy/vercel.md`
- `specs/001-showroom-site-cms/tasks.md`

Implemented updates:

- Added explicit Vercel project configuration for Next.js, pnpm install, build, and dev commands.
- Pinned package manager metadata and Node.js 22.x runtime expectation for Vercel builds.
- Added a commit-safe `.env.example` and `.gitignore` exception so deployment variables can be documented without exposing secrets.
- Documented Vercel dashboard and CLI deployment steps, required `NEXT_PUBLIC_SITE_URL`, pre-deploy checks, and current backend limitations.
- Marked the Vercel config and Vercel docs tasks complete in the Spec Kit task list.

Requirement coverage:

- Frontend deployment readiness: `NFR-01`, `NFR-02`, `NFR-06`, `NFR-07`.

Verification completed:

- `pnpm lint` passed.
- `pnpm typecheck` passed.
- `pnpm test` passed: 2 files, 8 tests.
- `pnpm build` passed.
- Actual Vercel deployment still requires access to the user's Vercel account/team and production domain value.

## Vercel pnpm Install Failure Fix - 2026-06-02

Completed a targeted deployment fix after Vercel production deployment failed during
`pnpm install --frozen-lockfile`.

Root cause:

- Vercel used pnpm 11 with strict dependency build-script approval.
- `pnpm-workspace.yaml` still used the removed pnpm 10-era `ignoredBuiltDependencies`
  setting, so Vercel treated `@parcel/watcher`, `@swc/core`, `msw`, `sharp`, and
  `unrs-resolver` as unreviewed build scripts and failed with
  `ERR_PNPM_IGNORED_BUILDS`.

Files touched include:

- `pnpm-workspace.yaml`
- `docs/deploy/vercel.md`
- `docs/specs/traceability-matrix.md`

Implemented updates:

- Replaced removed `ignoredBuiltDependencies` config with pnpm 11 `allowBuilds`.
- Explicitly allowed build scripts for `@parcel/watcher`, `@swc/core`, `sharp`, and
  `unrs-resolver`.
- Explicitly disallowed the unused `msw` install script.
- Documented the deployment failure mode and future review process.

Requirement coverage:

- Deployment readiness and supply-chain install policy: `NFR-01`, `NFR-02`,
  `NFR-05`, `NFR-07`.

Verification completed:

- `pnpm install --frozen-lockfile` passed with pnpm 11.5.0.
- `pnpm lint` passed.
- `pnpm typecheck` passed.
- `pnpm test` passed: 2 files, 8 tests.
- `pnpm build` passed.
- `vercel deploy --prod --yes` completed successfully.
- Vercel deployment `dpl_4TRfKhCcut4Faa6o4CGLKD92nALu` is `Ready`.
- Production URL: `https://furniture-website-lrs13djk4-doanhaiduys-projects.vercel.app`.
- Production aliases include `https://furniture-website-sable-phi.vercel.app` and
  `https://furniture-website-doanhaiduys-projects.vercel.app`.

Operational note:

- Direct unauthenticated HTTP smoke from this automation session was blocked by
  Vercel Deployment Protection. Vercel CLI inspection and build logs confirm deploy
  readiness; public access policy should be reviewed in Vercel project settings before
  launch sharing.

## Admin UI Stabilization And Handoff Export - 2026-06-02

Completed a targeted admin UI polish and export pass without redesigning the admin
structure, changing public routes, or adding ecommerce/mobile scope.

Files touched include:

- `app/admin/[section]/page.tsx`
- `components/showroom/admin-dashboard-widgets.tsx`
- `components/showroom/admin-shell.tsx`
- `components/showroom/admin-interactions.tsx`
- `app/globals.css`
- `tests/e2e/public-admin.spec.ts`
- `docs/specs/traceability-matrix.md`

Implemented updates:

- Restored dynamic `/admin/[section]` routes so products, blog, showrooms, media,
  quotes, users, settings, and AI assistant render inside the admin shell.
- Reworked dashboard/right-rail date selection through shared admin date state.
- Calendar triggers now expose real open state, render a Radix portal dialog, close
  reliably, and update selected date state across chart and utility rail.
- Fixed selected/open/focus styling for calendar controls, admin selects, tabs, and
  toolbar controls.
- Reworked the admin fixed background layer so it is visible behind the full shell
  and keeps mobile/reduced-motion fallback behavior.
- Added small accessibility polish for the publish confirmation dialog and editor
  toolbar buttons.
- Generated `output/admin-handoff/` with screenshots, JSON design exports,
  Figma-ready PNG/SVG/JSON package, static review board, and PDF summary.

Requirement coverage:

- Admin/CMS UX: `FR-03`, `FR-06`, `FR-07-ADM`, `FR-08-ADM`, `FR-10`, `FR-11`,
  `FR-12-ADM`, `NFR-03`, `NFR-07`.

Verification completed:

- `pnpm lint` passed.
- `pnpm typecheck` passed.
- `pnpm test` passed: 2 files, 8 tests.
- `pnpm build` passed; build output lists `/admin/[section]` as a dynamic route.
- `pnpm test:e2e --project=chromium` passed: 8 tests.
- `pnpm test:e2e` passed: 24 tests across Chromium, Firefox, and WebKit.

Export package:

- `output/admin-handoff/handoff.md`
- `output/admin-handoff/review-board.html`
- `output/admin-handoff/admin-handoff-summary.pdf`
- `output/admin-handoff/design-tokens.json`
- `output/admin-handoff/component-inventory.json`
- `output/admin-handoff/admin-screen-map.json`
- `output/admin-handoff/interaction-state-map.json`
- `output/admin-handoff/figma-ready/**`
- `output/admin-handoff/screenshots/**`

Residual risks:

- Payload collections, server-side RBAC, persistence, Cloudinary upload governance,
  OpenAI server action wiring, production CMS pagination/search, and final launch
  content remain pending backend/content slices.

## Full Project Figma Handoff Export - 2026-06-02

Completed a full-project handoff export after scope was expanded from admin-only
to the complete public/client and admin experience across desktop, tablet, and
mobile breakpoints.

Files touched include:

- `app/[locale]/page.tsx`
- `output/project-handoff/**`
- `docs/specs/traceability-matrix.md`

Implemented updates:

- Replaced the public homepage default hero slide image with an existing valid
  project image asset so the first client-facing hero frame no longer renders an
  empty fallback block.
- Generated `output/project-handoff/` with public and admin route screenshots,
  interaction state screenshots, design tokens, component inventory, route maps,
  responsive frame maps, Figma-ready PNG/SVG/JSON exports, static review board,
  and PDF summary.
- Captured 32 route screens at desktop, tablet, and mobile sizes.
- Captured 23 real interaction states, including public catalog menu, mobile nav,
  product image modal, selected thumbnail, product tabs, expanded filters, open
  selects, contact validation, admin calendar, admin notifications, publish modal,
  editor active controls, AI accepted state, media selected state, and fixed
  background visible states.
- Documented that a true `.fig` file was not generated; the deliverable is a
  Figma-import-friendly package with frame/spec JSON and reconstruction guidance.

Requirement coverage:

- Public company/product/content/lead UX: `FR-01`, `FR-02`, `FR-03`, `FR-04`,
  `FR-05`, `FR-06`, `FR-07-PUB`, `FR-08-PUB`, `FR-09`, `FR-14`.
- Admin/CMS UX and governance: `FR-07-ADM`, `FR-08-ADM`, `FR-10`, `FR-11`,
  `FR-12-ADM`.
- Non-functional design, responsiveness, accessibility, SEO/i18n, deployment
  readiness: `NFR-01`, `NFR-03`, `NFR-04`, `NFR-05`, `NFR-07`.

Verification completed:

- Export validation passed: JSON parse, referenced screenshot/PDF/SVG files exist,
  no route/state action warnings, and no captured route horizontal overflow.
- `pnpm lint` passed.
- `pnpm typecheck` passed.
- `pnpm test` passed: 2 files, 8 tests.
- `pnpm build` passed.
- `pnpm test:e2e` passed: 24 tests across Chromium, Firefox, and WebKit.

Export package:

- `output/project-handoff/handoff.md`
- `output/project-handoff/review-board.html`
- `output/project-handoff/project-handoff-summary.pdf`
- `output/project-handoff/design-tokens.json`
- `output/project-handoff/component-inventory.json`
- `output/project-handoff/screen-map.json`
- `output/project-handoff/public-screen-map.json`
- `output/project-handoff/admin-screen-map.json`
- `output/project-handoff/responsive-frame-map.json`
- `output/project-handoff/interaction-state-map.json`
- `output/project-handoff/screen-manifest.json`
- `output/project-handoff/figma-ready/**`
- `output/project-handoff/screenshots/**`

Residual risks:

- The package is Figma-ready, not a proprietary `.fig` file. A true Figma file
  still requires a Figma plugin/API import workflow with authenticated access.
- Backend CMS persistence, Payload access rules, production media governance, AI
  server actions, and final production content remain separate implementation
  slices.

## Full-Page Screenshot Automation Update - 2026-06-04

Added reusable Playwright screenshot automation for visual review evidence without
changing public/admin business logic.

Files touched include:

- `scripts/capture-screenshots.mjs`
- `package.json`
- `artifacts/screenshots/**`

Implemented updates:

- Detects package manager/scripts, App Router vs Pages Router, Playwright config,
  locales, product/blog dynamic slugs, admin dynamic sections, admin create-state
  links, and Storybook presence.
- Starts a local Next dev server on `127.0.0.1:3100` when no target server is
  available, with `SCREENSHOT_BASE_URL`, `SCREENSHOT_PORT`,
  `SCREENSHOT_ARTIFACT_DIR`, and `SCREENSHOT_ROUTE_LIMIT` overrides for reuse or
  smoke/debug runs.
- Captures every discovered important route with `fullPage: true` in desktop
  Chrome (`1440x1000`) and real Playwright iPhone 13 device emulation.
- Before each screenshot, waits for page load/network settling, injects reduced
  animation CSS, waits for images, auto-scrolls to trigger lazy content, returns
  to the top, and records metrics/errors in the manifest.
- Detects that Storybook is not configured in this repo and records that explicit
  reason in the manifest instead of silently skipping components.

Requirement coverage:

- Visual/responsive evidence: `NFR-03`.
- Browser/device smoke evidence: `NFR-04`.
- Supporting public/admin route review evidence for the currently implemented
  public/admin prototype routes.

Verification completed:

- `pnpm screenshots` passed: 51 routes captured across 2 profiles, 102/102 page
  screenshots succeeded, 0 failures.
- Screenshot files generated under `artifacts/screenshots/pages/desktop` and
  `artifacts/screenshots/pages/mobile`; manifest generated at
  `artifacts/screenshots/manifest.json`.
- Smoke run with `SCREENSHOT_ROUTE_LIMIT=1` on port `3199` confirmed the script
  can start and stop the local Next dev server itself.
- Sample full-page dimensions confirmed: `/vi` desktop `1440x6528`, `/vi` mobile
  `1170x37149`, `/vi/products` desktop `1440x2920`, `/vi/products` mobile
  `1170x18762`.
- `pnpm lint` passed.
- `pnpm typecheck` passed.
- `pnpm test` passed: 2 files, 8 tests.
- `pnpm build` passed.
- `pnpm test:e2e` passed: 24 tests across Chromium, Firefox, and WebKit.

Residual risks:

- Storybook component screenshots are not generated because the repo has no
  `.storybook` directory, Storybook script/dependency, or `*.stories.*` files.
- Visual review findings remain human-reviewed from generated screenshots; this
  slice does not add image-diff assertions or fix UI issues found in screenshots.
