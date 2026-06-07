# Phase 02 Dependencies – Public Data Integration

## Upstream Prerequisites
- **Phase 01 Complete**: The Supabase client connection helpers (`lib/supabase/client.ts` and `lib/supabase/server.ts`) must be fully functional.
- **Applied Database Migrations**: Database tables (`products`, `categories`, `blog_posts`, `showrooms`, `settings`) and the public RPC functions (`public_products`, `public_blog_posts`, `public_showrooms`) must be applied in the targeted database schema.

## Required Services / Configuration / Auth State
- **Database Seed Data**: The database must have representative seed data (e.g., loaded via Phase 01 / Phase 08 migration scripts) to test page renders.
- **Configured Domain**: `NEXT_PUBLIC_SITE_URL` must be set in the local environment and Docker compose files to construct valid absolute URLs for canonical links and sitemap generators.

## Blockers
- **Empty Catalog/Showrooms Tables**: If the database contains no active records, pages will load empty, blocking validation of dynamic rendering, filter logic, and locale fallback mechanisms.
- **Mismatched Schema Types**: Differences between the typescript types and database schema layouts will block static Next.js compilation.

## Parallelization and Constraints
- **Parallel Work**:
  - Showrooms location page (`app/[locale]/showrooms/page.tsx`) and About page (`app/[locale]/about/page.tsx`) data integrations can be built independently of product catalog features.
  - SEO utility helper setup (`lib/seo.ts`) can proceed in parallel with page data-fetching work.
- **Sequential Constraints**:
  - The dynamic product detail page (`app/[locale]/products/[slug]/page.tsx`) depends on the basic product queries completed for the product listing catalog.
  - Sitemap compilation (`app/sitemap.ts`) requires the category, product, and blog query helpers to be completed first.
