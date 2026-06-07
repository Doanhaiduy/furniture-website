# Phase 02 Checklist – Public Data Integration

## 1. Database Queries Setup
- [ ] Create `lib/supabase/queries.ts` containing type-safe queries for products, categories, blog posts, and showrooms.
- [ ] Ensure queries filter only active/published items (e.g., `is_active = true` for products, `status = 'published'` for blogs).
- [ ] Connect database content to the homepage (`app/[locale]/page.tsx`), fetching and displaying featured products and dynamic banners.
- [ ] Connect company values and history items on the About page (`app/[locale]/about/page.tsx`).

## 2. Product Catalog Data Integration
- [ ] Implement filter parameters parser in `lib/validations/filters.ts` utilizing Zod.
- [ ] Connect `app/[locale]/products/page.tsx` to read filters (category slug, search keywords, price range, sorting) from URL search parameters.
- [ ] Implement paginated database reads for product lists (fetching 12 products per page).
- [ ] Render fallback skeleton loading UI (`app/[locale]/products/loading.tsx`) during search executions.

## 3. Product & Blog Detail Views
- [ ] Create detailed query in `lib/supabase/queries.ts` to fetch a single product by slug, including joined category details and specifications JSON.
- [ ] Map specifications JSON into a clean key-value table inside `app/[locale]/products/[slug]/page.tsx`.
- [ ] Fetch dynamic related products from the same category and display them at the bottom of the page.
- [ ] Update `app/[locale]/blog/[slug]/page.tsx` to fetch the complete blog content, and format markdown or HTML content safely.

## 4. Showroom & Static Components
- [ ] Connect `app/[locale]/showrooms/page.tsx` to fetch active location records from the `showrooms` table.
- [ ] Map database values (address, working hours, phone) for both Vietnamese and English locales.
- [ ] Replace mock images on all public pages with Cloudinary remote URLs.

## 5. SEO & Crawl Configurations
- [ ] Create `lib/seo.ts` to generate dynamic page metadata for alternate locales (`vi`, `en`).
- [ ] Apply `lib/seo.ts` to generate dynamic metadata on product detail and blog detail routes using slug lookups.
- [ ] Write dynamic `app/sitemap.ts` fetching all active products and blogs to render a structured sitemap.
- [ ] Set up `app/robots.ts` to allow search crawling of all public routes while explicitly blocking `/admin/*` and `/api/*`.

## 6. Verification & Quarantine
- [ ] Verify that no production public routes import `lib/showroom-data.ts`.
- [ ] Run `pnpm lint` and `pnpm typecheck` inside Docker to confirm type safety.
- [ ] Run Playwright tests `pnpm test:e2e` and verify that basic public journeys compile.
- [ ] Update `docs/specs/traceability-matrix.md` with verification checks for Phase 02.
