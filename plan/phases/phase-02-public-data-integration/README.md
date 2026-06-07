# Phase 02 Public Data Integration

## Objective

Replace production public mock reads with Supabase-backed server reads for public pages, sitemap, robots, and localized SEO.

## Why This Phase Exists

The frontend audit confirms public UI is substantially implemented, but it reads `lib/showroom-data.ts`. The database audit confirms the schema and public RPCs can cover product, blog, showroom, settings, and content reads.

## Requirement IDs

- FR-01
- FR-02
- FR-03
- FR-04
- FR-05
- FR-06
- FR-08-PUB
- FR-12-PUB
- NFR-01
- NFR-06
- NFR-07

## Real Scope

- Replace mock reads in:
  - `app/[locale]/page.tsx`
  - `app/[locale]/about/page.tsx`
  - `app/[locale]/products/page.tsx`
  - `app/[locale]/products/[slug]/page.tsx`
  - `app/[locale]/blog/page.tsx`
  - `app/[locale]/blog/[slug]/page.tsx`
  - `app/[locale]/showrooms/page.tsx`
  - `app/sitemap.ts`
  - `app/robots.ts` if exclusions need refinement
- Use `public_products`, `public_blog_posts`, `public_showrooms`, settings/page tables, or equivalent Supabase server queries.
- Keep public pages published-only.
- Keep UI text in messages unless content is database-managed.

## Out Of Scope

- Quote persistence.
- Admin auth/CRUD.
- Media upload.
- Gemini draft generation.

## Dependencies

- Phase 01 complete.
- Supabase helpers and env validation exist.
- Migrations applied or a seeded Supabase dev project available.

## Files/Folders Likely Impacted

- `app/[locale]/**`
- `app/sitemap.ts`
- `app/robots.ts`
- `lib/supabase/**`
- public mapper/query helper files
- `tests/unit/**`
- `tests/integration/**`
- `tests/e2e/public-admin.spec.ts`

## Implementation Tasks

1. Inventory every production public import from `lib/showroom-data.ts`.
2. Create typed public read helpers/mappers that preserve the current component data shape.
3. Replace page, metadata, sitemap, and robots reads with Supabase/RPC-backed reads.
4. Add empty/loading/error states for missing seeded content.
5. Update tests to use mocked Supabase results or seeded data instead of fixed mock arrays.

## Backend/Database Impacts

- No schema changes expected.
- Public reads must respect published status, locale, soft deletes, and RLS.
- Product filters/search should use indexed fields/RPCs, not in-memory filtering.

## Frontend Impacts

- Existing visual layout should remain stable.
- Public filters/search, localized links, SEO metadata, and static route generation must use database-backed data.
- Production public components should no longer depend on prototype mock records.

## Route/Page Mapping

| Route | Supabase source |
| --- | --- |
| `/[locale]` | page sections/settings plus products/blog/showrooms RPCs |
| `/[locale]/about` | `content_pages` and sections |
| `/[locale]/products` | `public_products` |
| `/[locale]/products/[slug]` | published product detail query |
| `/[locale]/blog` | `public_blog_posts` |
| `/[locale]/blog/[slug]` | published blog detail query |
| `/[locale]/showrooms` | `public_showrooms` |
| `/sitemap.xml` | published product/blog/static route records |

## Env/Config Needs

- Supabase public URL and anon key.
- Server-side Supabase access path from Phase 01.
- `NEXT_PUBLIC_SITE_URL` for metadata/sitemap.

## Security/RLS Considerations

- Public pages must not use service-role data to expose drafts/private settings.
- Public responses must not include quote data, user data, integration secrets, or Gemini settings.

## Testing Checklist

- Product query validation.
- Published-only public reads.
- Empty states.
- Localized route data.
- Sitemap contains only published localized content.
- No production public route imports `lib/showroom-data.ts`.

## Acceptance Criteria / Definition Of Done

- Public routes render from Supabase or documented seed data.
- Product filter/search still works.
- Metadata/sitemap are database-backed.
- Tests updated away from fixed mock counts.

## Rollback/Fallback Notes

- If one public area lacks seeded data, use a real empty state, not production mock data.
- Mock data may remain in tests or explicitly marked demo helpers only.

## Risks/Unknowns

- Homepage/about page sections may need mapping decisions from generic `content_pages`.
- Trust badges are not directly represented in the schema and need a settings/section mapping or documented static treatment.
