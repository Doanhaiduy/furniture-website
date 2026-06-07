# Phase 02 Testing – Public Data Integration

## Test Levels & Frameworks
- **Unit Testing**: Vitest testing for Zod filter schemas and SEO canonical generators.
- **Integration Testing**: Vitest tests simulating Supabase query responses for locale translation mappers.
- **E2E Testing**: Playwright checks for language switching, filter persistence, and sitemap generation.
- **Manual Verification**: Inspector verification of meta header tags and sitemap schema structure.

---

## Concrete Scenarios & Verification Steps

### Scenario 1: Filter Validation and Edge Case Behavior
1. Run `pnpm test tests/unit/product-filter.test.ts`.
2. Verify that:
   - Valid query parameters (`?category=living-room&sort=price_asc&page=2`) are successfully parsed and yield correct SQL clauses.
   - Malicious sorting keys (`?sort=price;DROP TABLE products;--`) are rejected by Zod validation, falling back to default sorting.
   - Out-of-bounds page requests (`?page=-5` or `?page=99999`) fall back to page 1 or display a safe empty state.

### Scenario 2: Dynamic Page Language Toggle (Bilingual Renders)
1. Run Playwright: `pnpm test:e2e -g "should switch locales"`.
2. Verify that:
   - Accessing `/vi/products` displays product cards with Vietnamese description texts.
   - Clicking the header Language Switcher redirects to `/en/products`, swapping card content to English.
   - Alternative locale tags (`<link rel="alternate" hreflang="en" ...>`) are present in the HTML header.

### Scenario 3: XML Sitemap Generation Check
1. Fetch the sitemap XML: `curl -s http://localhost:3000/sitemap.xml`.
2. Confirm the document structure:
   - Starts with `<?xml version="1.0" encoding="UTF-8"?>` and contains a `<urlset>` wrapper.
   - Excludes draft blog posts (`status = 'draft'`).
   - Excludes inactive product pages (`is_active = false`).
   - Contains unique, absolute URLs for both language prefixes (e.g. `/vi/products/slug` and `/en/products/slug`).

### Scenario 4: 404 Route Resolution Test
1. Attempt to load a fake slug: `curl -I http://localhost:3000/vi/products/non-existent-product-slug`.
2. Verify the HTTP response code is exactly `404 Not Found`.
3. Check the body contains the custom localized layout (`app/[locale]/not-found.tsx`).
