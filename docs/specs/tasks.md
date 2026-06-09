# Task Breakdown

## Rules

- Implement one vertical slice at a time.
- Each task must state requirement IDs, files to edit, tests, verification commands, and traceability updates.
- Do not start broad full-project coding.
- Do not add cart, payment, order management, or mobile app behavior.

## Recommended Coding Order

| Slice | Requirements | Scope | Primary Files/Areas | Tests |
| --- | --- | --- | --- | --- |
| S-00 Foundation Alignment | NFR-05, NFR-07 | Align dependencies, `src/` structure, env validation, Payload/PostgreSQL/Cloudinary/Resend/OpenAI config placeholders. | `package.json`, `src/lib/env`, `src/payload/payload.config.ts`, `.env.example` | Unit env tests, build. |
| S-01 CMS Access And Media | FR-10, NFR-05 | Payload Users, Admin/Editor access helpers, Media collection backed by Cloudinary. | `src/payload/collections/Users.ts`, `Media.ts`, `src/payload/access`, `src/lib/cloudinary` | RBAC and media validation tests. |
| S-02 Homepage And About CMS | FR-01, FR-02, FR-12-ADM, NFR-06 | HomePage and AboutPage globals with expanded homepage sections and SEO fields. | `src/payload/globals/HomePage.ts`, `AboutPage.ts`, publish validation hooks | Publication validation tests. |
| S-03 Public Shell And i18n | FR-12-PUB, NFR-03, NFR-06 | next-intl routing, layout, header/footer, locale switcher, SEO defaults. | `src/i18n`, `src/app/[locale]/layout.tsx`, messages | Locale route unit tests, Browser MCP locale-switch journey; Playwright backup only for CI route regression. |
| S-04 Homepage Public Route | FR-01, FR-12-PUB, NFR-01, NFR-03, NFR-06 | Render CMS homepage with two product groups above fold. | `src/app/[locale]/(public)/page.tsx`, `src/features/homepage` | Browser MCP first-viewport journey, metadata tests; Playwright backup only for CI viewport regression. |
| S-05 Product Catalog CMS | FR-03, FR-12-ADM, NFR-05 | ProductCategories and Products collections, structured quote-first model, publish validation. | `src/payload/collections/ProductCategories.ts`, `Products.ts` | CRUD/access/publish validation tests. |
| S-06 Product Listing/Search | FR-04, FR-05, NFR-01, NFR-06 | Public product list, filters, search, detail routes, Product schema. | `src/features/products`, product routes | Filter/search integration, performance, Browser MCP catalog journey; Playwright backup only for CI route matrix. |
| S-07 Quote Flow | FR-07-PUB, FR-07-ADM, NFR-05 | Public form, QuoteRequests collection, Admin-only access, Resend notification. | `src/features/contact`, `src/app/api/contact`, `QuoteRequests.ts`, Resend hook | Zod unit, integration, Browser MCP quote/admin journey, RBAC security; Playwright backup only for CI quote regression. |
| S-08 Blog | FR-06, FR-12-ADM, NFR-06 | Blog categories/posts, localized slugs, public list/detail. | `src/payload/collections/Blog*`, `src/features/blog` | CRUD, slug route, SEO tests. |
| S-09 Showrooms And Maps | FR-08-PUB, FR-08-ADM, NFR-03 | Showroom CMS and public map/list with Google Maps fallback. | `src/payload/collections/Showrooms.ts`, `src/features/showrooms` | CRUD, URL validation, Browser MCP responsive/map journey; Playwright backup only for CI map fallback regression. |
| S-10 Social And Settings | FR-09, FR-10, NFR-06 | SiteSettings global, social links/share, SEO defaults. | `src/payload/globals/SiteSettings.ts`, layout/footer/share components | Link validation and SEO tests. |
| S-11 AI Draft Assistant | FR-11, FR-12-ADM, NFR-05 | OpenAI prompt builders and draft-only Payload actions. | `src/lib/openai`, `src/payload/hooks/aiDrafts.ts`, CMS components | Prompt unit, integration, security review. |
| S-12 SEO, Performance, Ops Hardening | NFR-01 to NFR-07 | Sitemap, robots, schema, performance budget, monitoring docs, browser matrix. | `src/app/sitemap.ts`, `robots.ts`, `src/lib/seo`, ops docs | SEO, Browser MCP launch journeys, performance, ops review; Playwright backup only for CI/headless regression. |

## MVP Recommendation

Start with S-00 through S-04. That proves the approved architecture, Payload access foundation, Cloudinary media path, bilingual public shell, CMS-managed homepage/about content, first-viewport product groups, and SEO baseline.

## Done Criteria Per Slice

- Acceptance criteria satisfied for the requirement IDs.
- Tests cover important behavior.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` pass.
- Browser MCP journey checks run when browser-visible behavior is affected.
- `pnpm test:e2e` runs only as Playwright backup when Browser MCP cannot cover the scenario or CI/headless/deterministic regression is required.
- `docs/specs/traceability-matrix.md` is updated with files, tests, verification, and residual risks.
