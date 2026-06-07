# Phase 02 Goals – Public Data Integration

## Measurable Goals
- **Eliminate Static Mocks**: Replace all references to mock data (`lib/showroom-data.ts`) in public pages, sitemaps, and search filters with real database queries.
- **Dynamic Routing**: Fetch products, categories, showrooms, and blog posts dynamically via Supabase Server Components or the RPC helper functions (`public_products`, `public_blog_posts`, `public_showrooms`).
- **Validated Filters**: Ensure all client query parameters (filters like category, price, sorting) on `/[locale]/products` are parsed and validated server-side.
- **Localised SEO**: Serve correct dynamic meta tags (title, description, canonical links, alternates) based on the current locale (`vi` or `en`) for all public pages.

## Phase Success Conditions
- The following public pages render real database content with no mock fallbacks:
  - Homepage (`app/[locale]/page.tsx`)
  - About (`app/[locale]/about/page.tsx`)
  - Products catalog (`app/[locale]/products/page.tsx`)
  - Product detail (`app/[locale]/products/[slug]/page.tsx`)
  - Blog directory (`app/[locale]/blog/page.tsx`)
  - Blog article (`app/[locale]/blog/[slug]/page.tsx`)
  - Showrooms location page (`app/[locale]/showrooms/page.tsx`)
- Clicking the language toggle switches all text (menu, titles, rich content, metadata) between Vietnamese and English.
- Navigating to a non-existent slug returns a proper `404 Not Found` response.
- `sitemap.xml` successfully generates list nodes dynamically and contains only active, published products/posts.

## Concrete Results
- Core data-fetching functions implemented inside `lib/supabase/queries.ts` or server components.
- Removal of static constant files from public page code imports.
- Production-ready dynamic SEO utility (`lib/seo.ts`) generating local alternate meta tags.
- Dynamic `app/sitemap.ts` and refined `app/robots.ts` configured to handle Vietnamese/English route variants.
