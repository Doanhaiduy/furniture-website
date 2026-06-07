# Phase 02 Implementation Guide – Public Data Integration

## Implementation Order
1. **Query Definitions**: Code database selectors in `lib/supabase/queries.ts`.
2. **Catalog Filters Validation**: Implement parameter parsing inside `lib/validations/filters.ts`.
3. **Core Pages Integration**: Bind page components (Homepage, Products listing, Blog listing, Showrooms listing) to Supabase queries.
4. **Detail Route Integrations**: Bind product detail (`/[slug]`) and blog article routes to dynamic selectors.
5. **SEO & Indexing Setup**: Implement `lib/seo.ts`, `app/sitemap.ts`, and `app/robots.ts`.
6. **Code Cleanup**: Remove all prototype imports from public components.

---

## Route & Page Mapping
- `/[locale]` -> Displays featured products and banners.
- `/[locale]/products` -> Catalog list with search, sorting, and pagination.
- `/[locale]/products/[slug]` -> Dynamic details based on product unique slug.
- `/[locale]/blog` -> Blog article directory.
- `/[locale]/blog/[slug]` -> Dynamic blog content by slug.
- `/[locale]/showrooms` -> Dynamic address details and operational listings.
- `/[locale]/about` -> Dynamic company values.
- `/sitemap.xml` -> XML dynamic sitemap.
- `/robots.txt` -> Crawl control directives.

---

## Backend, Frontend, and Database Impacts
- **Database**: Reads `products`, `categories`, `blog_posts`, `showrooms`, `settings`, `site_setting_translations`.
- **Backend (Next.js server)**: Data fetching is performed server-side via Next.js Server Components.
- **Frontend**: Elements shift from hardcoded constants to database properties. Skeletal loaders present loading states.

---

## Docker & Local Runtime Implications
- Set `NEXT_PUBLIC_SITE_URL` to `http://localhost:3000` inside local development configuration profiles.
- Image optimization domain lists in `next.config.ts` must allow remote assets (e.g., `res.cloudinary.com` or placeholder domains).

---

## Gemini Settings & API Secret Implications
- Not applicable. No AI features or secret modifications are implemented in this phase.

---

## Security & RLS Details
- Public reads are governed by strict RLS policies on the database level:
  - Products must satisfy `is_active = true`.
  - Blog posts must satisfy `status = 'published'`.
  - Showrooms must satisfy `is_active = true`.
- Public routes must execute queries using the public Supabase client boundary (`lib/supabase/server.ts` initialized with anonymous credentials) to guarantee that drafts, internal profiles, and integration secrets are inaccessible.

---

## Edge Cases & Rollback/Fallback Considerations
- **Non-Existent Slugs**: If a user accesses `/products/invalid-slug`, database query returns null. The Route must trigger the Next.js `notFound()` handler to return a proper `404` status, rather than crashing the thread.
- **Empty Database Fallback**: If catalog tables are empty, display a localized empty state message (e.g. `"Không tìm thấy sản phẩm nào" / "No products found"`).
- **SQL Injection Prevention**: Zod schemas must validate that sorting columns match expected keys (`sort_order`, `price`, `created_at`) and that category IDs are valid UUID structures.

---

## Open Questions & Assumptions
- **Assumption**: The `app/[locale]/` locale dynamic route wrapper handles language switching correctly, and `next-intl` request configuration resolves translations without layout collisions.
- **Open Question**: Do specification tables require structured HTML rendering, or can the frontend parse specifications JSON into standard key-value listings? We assume key-value list parsing is sufficient for launch.
