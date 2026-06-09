# Project Status Plan

Generated: 2026-06-06 07:27 +07:00

## Scope And Rule For Done

This status is based on:

- `docs/srs/Tai_lieu_SRS_Web_do_go_noi_that.xlsx`
- `docs/specs/product-brief.md`
- `docs/specs/requirements.md`
- `docs/specs/design.md`
- `docs/specs/data-model.md`
- `docs/specs/api-contract.md`
- `docs/specs/test-plan.md`
- `docs/specs/tasks.md`
- `docs/specs/traceability-matrix.md`
- `docs/specs/checklist.md`
- `docs/architecture/*`
- `docs/decisions/*`
- `specs/001-showroom-site-cms/plan.md`
- Current implementation under `app/`, `components/`, `lib/`, `i18n/`, `messages/`, and `tests/`

Legend:

- `[x] DONE`: acceptance criteria are satisfied for the current scope with evidence.
- `[ ] PARTIAL`: visible prototype or partial implementation exists, but at least one acceptance, backend, security, SEO, test, or launch condition is missing.
- `[ ] TODO`: not implemented or not evidenced.

Important status summary:

- The project currently has a strong bilingual public/admin frontend prototype, mock data, Vercel frontend deployment setup, screenshot automation, Vitest coverage, and historical Playwright backup evidence. Current browser-visible QA should be performed Browser MCP-first.
- The project is not yet a complete CMS-backed production system. Payload CMS, managed PostgreSQL persistence, Cloudinary upload governance, Resend notification, OpenAI server action, and server-side Admin/Editor authorization are still pending.
- There is architecture drift: docs target Next.js 15, Payload CMS 3.x, and `src/`; current `package.json` uses Next.js 16.2.6, has no Payload/Cloudinary/Resend/OpenAI dependencies, includes `@supabase/supabase-js`, and current app code is root-level `app/` rather than `src/app/`.

## Requirement Status Checklist

### Functional Requirements

- [ ] PARTIAL `FR-01` Homepage: public route `/[locale]` renders company signal and product groups from `lib/showroom-data.ts`; Payload `HomePage` global and CMS-managed launch content are pending.
- [ ] PARTIAL `FR-02` About: `/[locale]/about` exists and is bilingual visually; CMS-managed `AboutPage` content is pending and some public copy is hardcoded in the page.
- [ ] PARTIAL `FR-03` Product management: product list/detail UI and admin product prototype exist; Payload `Products` and `ProductCategories` CRUD/access rules are pending.
- [ ] PARTIAL `FR-04` Product filters: mock filters exist for category/material/room/style/collection/tone/availability; CMS indexed queries, price-range filter contract, and production data timing evidence are pending.
- [ ] PARTIAL `FR-05` Product search: mock keyword search exists; accent-insensitive Vietnamese search, ranking, query validation, and production indexed search are pending.
- [ ] PARTIAL `FR-06` Blog management: public blog list/detail and admin editor prototype exist; Payload blog collections, publish state validation, and CMS CRUD tests are pending.
- [ ] PARTIAL `FR-07-PUB` Public quote/contact: `QuoteForm`, Zod schema, honeypot validation, and demo `POST /api/contact` response exist; persistence, rate limiting, Resend notification, and failure state storage are pending.
- [ ] PARTIAL `FR-07-ADM` Quote management: admin quote UI exists; real `QuoteRequests` collection, search/filter by status/date/source, and Admin-only server authorization are pending.
- [ ] PARTIAL `FR-08-PUB` Showroom list: public showroom cards, hotline, fallback map link, and iframe exist; content is mock data and iframe embed is hardcoded instead of per-showroom validated embed URL.
- [ ] PARTIAL `FR-08-ADM` Showroom management: admin showroom prototype exists; Payload `Showrooms` collection, validation, and CRUD tests are pending.
- [ ] PARTIAL `FR-09` Social integration: footer links and share buttons exist; official links are placeholders and are not backed by `SiteSettings`.
- [ ] PARTIAL `FR-10` CMS system management: admin dashboard/users/settings prototype exists; Payload auth, Admin/Editor access control, settings governance, and server-side authorization are pending.
- [ ] PARTIAL `FR-11` AI assistance: admin AI draft workflow is mocked; OpenAI server client, prompt builder, draft persistence, moderation/spend policy, and integration tests are pending.
- [x] DONE `FR-12-PUB` Public bilingual switching: `next-intl` routing with `vi`/`en` exists and the locale switch keeps equivalent paths in current route set.
- [ ] PARTIAL `FR-12-ADM` Admin bilingual content: locale tabs/missing-locale states are mocked; Payload localized fields and publication validation are pending.

### Non-Functional Requirements

- [ ] PARTIAL `NFR-01` Performance: build/test evidence and bounded mock filters exist; no PageSpeed Mobile score, production-like data benchmark, Payload query timing, or Cloudinary optimization evidence yet.
- [ ] TODO `NFR-02` Availability: Vercel frontend deployment docs exist, but production monitoring tool, alert owner, Payload health monitoring, and uptime evidence are missing.
- [x] DONE for current frontend prototype `NFR-03` Responsive UI: screenshot and historical Playwright backup evidence cover public/admin prototype routes across browser projects and breakpoints. Re-run changed UI with Browser MCP first after backend/CMS slices change UI.
- [ ] PARTIAL `NFR-04` Browser compatibility: Browser MCP is the primary release smoke path. Playwright backup can cover Chromium, Firefox, and WebKit when CI/headless matrix evidence is required; Edge and Coc Coc manual smoke evidence is still missing.
- [ ] PARTIAL `NFR-05` Security: quote Zod validation and robots exclusion exist; Payload RBAC, server-side CMS authorization, rate limiting, upload validation, secret-boundary tests, rich-text sanitization, and AI safety are pending.
- [ ] PARTIAL `NFR-06` SEO: localized metadata, sitemap, and robots exist; schema.org JSON-LD, CMS-backed SEO fields, canonical/alternate coverage per dynamic content, final OG image, and SEO tests are pending.
- [ ] PARTIAL `NFR-07` Extensibility: architecture docs and component primitives exist; actual approved `src/` feature-slice/Payload boundaries are not implemented.

## Artifact Checklist

- [x] SRS workbook exists and was readable: `docs/srs/Tai_lieu_SRS_Web_do_go_noi_that.xlsx`.
- [x] Requirement docs exist: product brief, requirements, open questions, design, data model, API contract, test plan, tasks, traceability, checklist.
- [x] Architecture docs exist: overview, security, deployment, performance budget, content workflow.
- [x] ADR docs exist for tech stack, content modeling, Cloudinary media, and role access control.
- [x] Spec Kit feature plan exists under `specs/001-showroom-site-cms/`.
- [x] Public localized routes exist for home, about, products, product detail, blog, blog detail, showrooms, contact, success, error, loading, and not-found states.
- [x] Admin prototype routes exist for dashboard, products, categories, blog, showrooms, media, quotes, users, settings, AI assistant, login, and access denied.
- [x] Unit tests exist for quote schema and product filtering/pagination over mock data.
- [x] Backup E2E tests exist for public homepage, locale switch, product listing/detail quote path, blog reading structure, and admin prototype routes.
- [x] Vercel frontend config/docs exist: `vercel.json`, `docs/deploy/vercel.md`.
- [x] Screenshot automation exists: `scripts/capture-screenshots.mjs`.
- [ ] PARTIAL CI exists: `.github/workflows/playwright.yml` runs Playwright as backup, but there is no CI workflow for lint, typecheck, unit tests, and build.
- [ ] TODO Payload service code is absent: no `src/payload`, no Payload dependency, no Payload config, collections, globals, access rules, or hooks.
- [ ] TODO Persistence is absent: no managed PostgreSQL integration and no quote/content writes.
- [ ] TODO Media governance is absent: no Cloudinary dependency, signed uploads, media collection, or upload validation.
- [ ] TODO Email integration is absent: no Resend client and no notification hook.
- [ ] TODO AI integration is absent: no OpenAI client, prompt builder, or server-side CMS action.
- [ ] TODO Monitoring docs/config are absent: no `docs/ops/monitoring.md`.

## Implementation Slice Status

- [ ] PARTIAL `S-00 Foundation Alignment` (`NFR-05`, `NFR-07`): app builds and env docs exist, but approved dependencies, `src/` structure, env validation, Payload skeleton, and server-only helpers are pending.
- [ ] TODO `S-01 CMS Access And Media` (`FR-10`, `NFR-05`): Payload users/access/media/Cloudinary not implemented.
- [ ] TODO `S-02 Homepage And About CMS` (`FR-01`, `FR-02`, `FR-12-ADM`, `NFR-06`): public mock pages exist, but CMS globals and publish validation are pending.
- [ ] PARTIAL `S-03 Public Shell And i18n` (`FR-12-PUB`, `NFR-03`, `NFR-06`): `next-intl`, shell, switcher, sitemap, and robots exist; hardcoded public text and CMS-backed SEO defaults remain.
- [ ] PARTIAL `S-04 Homepage Public Route` (`FR-01`, `FR-12-PUB`, `NFR-01`, `NFR-03`, `NFR-06`): frontend route is implemented over mock data; CMS query and production SEO/performance evidence pending.
- [ ] TODO `S-05 Product Catalog CMS` (`FR-03`, `FR-12-ADM`, `NFR-05`): Payload collections pending.
- [ ] PARTIAL `S-06 Product Listing/Search` (`FR-04`, `FR-05`, `NFR-01`, `NFR-06`): frontend filters/search/detail exist over mock data; server query validation, indexes, localized slugs, price filtering, and schema pending.
- [ ] PARTIAL `S-07 Quote Flow` (`FR-07-PUB`, `FR-07-ADM`, `NFR-05`): public form validation exists; persistence, notification, rate limit, and Admin-only lead management pending.
- [ ] PARTIAL `S-08 Blog` (`FR-06`, `FR-12-ADM`, `NFR-06`): public/editor prototype exists; CMS collections and publication workflow pending.
- [ ] PARTIAL `S-09 Showrooms And Maps` (`FR-08-PUB`, `FR-08-ADM`, `NFR-03`): public/admin UI exists; CMS collection and validated per-showroom map URLs pending.
- [ ] PARTIAL `S-10 Social And Settings` (`FR-09`, `FR-10`, `NFR-06`): share UI exists; `SiteSettings` global and official configured links pending.
- [ ] PARTIAL `S-11 AI Draft Assistant` (`FR-11`, `FR-12-ADM`, `NFR-05`): UI mock exists; server implementation pending.
- [ ] PARTIAL `S-12 SEO, Performance, Ops Hardening` (`NFR-01` to `NFR-07`): sitemap/robots and responsive evidence exist; schema, PageSpeed, monitoring, security hardening, browser matrix, and production evidence pending.

## Current Test Evidence

- [x] Existing docs record successful runs for `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and historical Playwright backup runs via `pnpm test:e2e` after previous frontend/refactor passes.
- [x] Verification for this status-plan update on 2026-06-06:
  - `pnpm lint` passed on rerun. First parallel run timed out while starting ESLint.
  - `pnpm typecheck` passed.
  - `pnpm test` passed: 2 test files, 8 tests.
  - `pnpm build` passed.
- [x] Current test files present:
  - `tests/unit/quote-schema.test.ts`
  - `tests/unit/product-filter.test.ts`
  - `tests/e2e/public-admin.spec.ts`
- [ ] PARTIAL The tests validate prototype behavior, not Payload-backed CMS behavior.
- [ ] TODO Missing integration/security tests:
  - Payload Admin/Editor access rules.
  - Quote persistence and Resend notification state.
  - Product/blog/showroom CMS CRUD and publication validation.
  - Cloudinary media validation.
  - Rate limiting and unsafe input hardening.
  - SEO metadata/schema/sitemap tests.
  - OpenAI draft-only server action tests.

## Key Blockers Before Claiming Launch Ready

- [ ] Resolve stack drift: either align implementation to approved Next.js 15 + Payload CMS 3.x + `src/`, or update architecture/Spec Kit docs before coding affected slices.
- [ ] Remove obsolete or unused Supabase dependency if Payload/PostgreSQL/Cloudinary remains binding.
- [ ] Implement Payload service and collections/globals: Users, Media, ProductCategories, Products, BlogCategories, BlogPosts, Showrooms, QuoteRequests, HomePage, AboutPage, SiteSettings.
- [ ] Enforce Role Model Option A server-side: Editor cannot access quote requests, users, privileged settings, or integration secrets.
- [ ] Replace production-facing mock data with CMS reads or explicitly mark it as seed/demo only.
- [ ] Implement quote persistence, lead search/status management, and Resend notification status.
- [ ] Implement Cloudinary signed upload/delete policy, allowed media validation, ownership context, and bilingual alt text checks.
- [ ] Implement OpenAI draft-only assistant with server-side prompts, limits, and human-review workflow.
- [ ] Add schema.org JSON-LD for Organization, Product, Article/BlogPosting, LocalBusiness/Store, and BreadcrumbList where appropriate.
- [ ] Finalize operational decisions from `docs/specs/open-questions.md`: taxonomy, quote recipients/retention, showroom map URLs, admin bootstrap, AI model/spend, monitoring owner, SEO copy/OG image, media limits, launch content.
- [ ] Add CI for lint, typecheck, unit tests, and build.
- [ ] Add production monitoring and alert ownership before claiming `NFR-02`.

## Recommended Next Vertical Slice

Next phase: `architect` then `cms-crud` for `S-00 Foundation Alignment`.

Requirement IDs:

- `NFR-05`
- `NFR-07`
- Supporting blockers for all CMS requirements: `FR-01`, `FR-02`, `FR-03`, `FR-06`, `FR-07-ADM`, `FR-08-ADM`, `FR-10`, `FR-11`, `FR-12-ADM`

Problem statement:

The current project is a frontend prototype with mock data. Before implementing CMS features, the repo must resolve architecture drift and establish the approved backend boundary.

In scope:

- Decide and document whether the implementation will align to Next.js 15 + `src/` or amend docs to the current Next.js 16/root `app/` structure.
- Add Payload CMS 3.x service skeleton if the approved docs remain binding.
- Add server-only environment validation.
- Add Payload/PostgreSQL connection boundary and health helper.
- Add initial access-role helpers for Admin/Editor.
- Update traceability with the final decision and evidence.

Out of scope:

- Product CRUD, quote persistence, media upload, email notification, and AI generation. Those should be separate slices after foundation.

Expected files/modules for the next slice:

- `package.json`
- `pnpm-lock.yaml`
- `tsconfig.json`
- `.env.example`
- `next.config.ts`
- `src/lib/env/*` or approved equivalent if `src/` is amended
- `src/payload/payload.config.ts` or approved Payload service location
- `src/payload/access/roles.ts`
- `docs/specs/traceability-matrix.md`
- `specs/001-showroom-site-cms/plan.md` if the architecture decision changes

Expected tests/verification:

- Unit tests for env validation and role helpers.
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

Traceability update needed:

- Update `docs/specs/traceability-matrix.md` after the next implementation slice with concrete files changed, tests added, command results, and residual risks.
