# Phase 02 Checklist – Public Data Integration

## 1. Database Queries Setup
- [x] Create `lib/supabase/queries.ts` containing type-safe queries for products, categories, blog posts, and showrooms. (Completed)
- [x] Ensure queries filter only active/published items (e.g., `is_active = true` for products, `status = 'published'` for blogs). (Completed)
- [x] Connect database content to the homepage (`app/[locale]/page.tsx`), fetching and displaying featured products and dynamic banners. (Completed)
- [x] Connect company values and history items on the About page (`app/[locale]/about/page.tsx`). (Completed)

## 2. Product Catalog Data Integration
- [x] Implement filter parameters parser in `lib/validations/filters.ts` utilizing Zod. (Completed)
- [x] Connect `app/[locale]/products/page.tsx` to read filters (category slug, search keywords, price range, sorting) from URL search parameters. (Completed)
- [x] Implement paginated database reads for product lists (fetching 12 products per page). (Completed)
- [x] Render fallback skeleton loading UI (`app/[locale]/products/loading.tsx`) during search executions. (Completed)

## 3. Product & Blog Detail Views
- [x] Create detailed query in `lib/supabase/queries.ts` to fetch a single product by slug, including joined category details and specifications JSON. (Completed)
- [x] Map specifications JSON into a clean key-value table inside `app/[locale]/products/[slug]/page.tsx`. (Completed)
- [x] Fetch dynamic related products from the same category and display them at the bottom of the page. (Completed)
- [x] Update `app/[locale]/blog/[slug]/page.tsx` to fetch the complete blog content, and format markdown or HTML content safely. (Completed)

## 4. Showroom & Static Components
- [x] Connect `app/[locale]/showrooms/page.tsx` to fetch active location records from the `showrooms` table. (Completed)
- [x] Map database values (address, working hours, phone) for both Vietnamese and English locales. (Completed)
- [x] Replace mock images on all public pages with Cloudinary remote URLs. (Completed)

## 5. SEO & Crawl Configurations
- [x] Create `lib/seo.ts` to generate dynamic page metadata for alternate locales (`vi`, `en`). (Completed)
- [x] Apply `lib/seo.ts` to generate dynamic metadata on product detail and blog detail routes using slug lookups. (Completed)
- [x] Write dynamic `app/sitemap.ts` fetching all active products and blogs to render a structured sitemap. (Completed)
- [x] Set up `app/robots.ts` to allow search crawling of all public routes while explicitly blocking `/admin/*` and `/api/*`. (Completed)

## 6. Verification & Quarantine
- [x] Verify that no production public routes import `lib/showroom-data.ts`. (Completed)
- [x] Run `pnpm lint` and `pnpm typecheck` inside Docker to confirm type safety. (Completed)
- [x] Run Browser MCP journey checks for basic public journeys, locale switching, filters, and responsive states; use `pnpm test:e2e` only as Playwright backup when deterministic CI/headless regression is required. (Completed)
- [x] Update `docs/specs/traceability-matrix.md` with verification checks for Phase 02. (Completed)

