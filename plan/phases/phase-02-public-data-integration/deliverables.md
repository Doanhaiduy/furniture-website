# Phase 02 Deliverables – Public Data Integration

## Concrete Expected Outputs
- **lib/supabase/queries.ts**: Collection of server-side data fetching queries and mappings (e.g., `getFeaturedProducts`, `getPublishedBlogPosts`, `getShowrooms`).
- **lib/validations/filters.ts**: Zod schema definitions validating catalog parameters (search terms, category UUIDs, sorting selections).
- **lib/seo.ts**: SEO metadata generation helper yielding title, description, keywords, Open Graph metadata, alternates, and schema.org JSON-LD tags.
- **app/sitemap.ts**: Dynamic sitemap generator returning all active localized products, categories, blogs, and static pages.
- **app/robots.ts**: Production-grade robots configuration file defining crawl instructions.

## Affected Routes, Components, APIs, Tables, and Configurations
- **Routes**:
  - `app/[locale]/page.tsx` [MODIFY] (Homepage: featured product lists, banners)
  - `app/[locale]/about/page.tsx` [MODIFY] (About: company values, team sections)
  - `app/[locale]/products/page.tsx` [MODIFY] (Product Listing: filters, grid pagination)
  - `app/[locale]/products/[slug]/page.tsx` [MODIFY] (Product Details: technical specs, related products)
  - `app/[locale]/blog/page.tsx` [MODIFY] (Blog Listing: grid layout, translation keys)
  - `app/[locale]/blog/[slug]/page.tsx` [MODIFY] (Blog Article: body formatting, tags)
  - `app/[locale]/showrooms/page.tsx` [MODIFY] (Showrooms: addresses, working hours, maps fallback)
  - `app/sitemap.ts` [NEW/MODIFY] (Dynamic XML compilation)
  - `app/robots.txt` [NEW/MODIFY] (Rules configuration)

## Future Touchpoints
- **Product detail page** (`app/[locale]/products/[slug]/page.tsx`) will be modified in Phase 03 to load the quote modal context.
- **Showrooms page** (`app/[locale]/showrooms/page.tsx`) will be updated in Phase 07 to render Google Maps embeds.
- **Blog article page** (`app/[locale]/blog/[slug]/page.tsx`) will be linked with draft previews in Phase 09.

## Verification Evidence Required
1. **Dynamic Renders**: Screenshots showing products and blog posts correctly rendered from seeded database content.
2. **SEO Output Verification**: Page source inspection confirming alternate tags (`hreflang="vi"` and `hreflang="en"`) and meta tags.
3. **Crawl Validation**: Run `curl -i http://localhost:3000/sitemap.xml` and verify correct, well-formed XML listing all database products and blog posts.
4. **Integration Test Suite**: Vitest outputs confirming query parameters parser handles SQL injection inputs and empty strings gracefully.
