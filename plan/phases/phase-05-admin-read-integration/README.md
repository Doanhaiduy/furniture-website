# Phase 05 Admin Read Integration

## Objective

Replace admin dashboard and section read screens with Supabase-backed, role-aware data.

## Why This Phase Exists

Admin screens are visually implemented but rely on mock stats, mock quote requests, and mock content from `lib/showroom-data.ts`.

## Requirement IDs

- FR-03
- FR-06
- FR-07-ADM
- FR-08-ADM
- FR-10
- FR-11
- FR-12-ADM
- NFR-05
- NFR-07

## Real Scope

- Dashboard counts and warnings.
- Products/categories lists.
- Blog lists.
- Showroom lists.
- Quote lists/details through admin-only path.
- Users/media/settings/AI draft read state where backend data exists.
- Role-scoped empty/loading/error states.

## Out Of Scope

- Mutations.
- Gemini key settings writes.
- Media upload.

## Dependencies

- Phase 04 auth guards.
- Supabase data available through seed or existing records.

## Files/Folders Likely Impacted

- `app/admin/**`
- `components/showroom/admin-pages.tsx`
- `components/showroom/admin-dashboard-widgets.tsx`
- `components/showroom/admin-workflows.tsx`
- admin read helper files
- tests

## Implementation Tasks

1. Inventory admin read paths still using `lib/showroom-data.ts`.
2. Add role-aware Supabase read helpers or route handlers for each admin section.
3. Replace dashboard, list, detail, and settings read models with real records or empty states.
4. Ensure Editor responses omit private/admin-only data.
5. Update admin read tests and E2E smoke coverage.

## Backend/Database Impacts

- Reads content/product/blog/showroom/media/settings/profile tables.
- Reads quotes only for Admin.
- Reads `ai_drafts` only for allowed users; does not expose Gemini config.

## Frontend Impacts

- Admin tables, cards, counters, warnings, and detail panels use real or seeded data.
- Loading, error, and empty states must be production-safe.
- Mock-only labels or fake persistence indicators should be removed from read screens.

## Route/Page Mapping

- `/admin` dashboard.
- `/admin/products`, `/admin/categories`, `/admin/blog`, `/admin/showrooms`.
- `/admin/quotes` Admin-only.
- `/admin/users`, `/admin/media`, `/admin/settings`, `/admin/ai-assistant` read states.

## Env/Config Needs

- Supabase session and helper env from Phase 01.

## Security/RLS Considerations

- Editor cannot receive quote/user/privileged settings/Gemini settings data in page props or API JSON.
- Admin-only quote reads should use `admin_quote_search` or equivalent server query.

## Testing Checklist

- Admin dashboard uses real or seeded data.
- Editor dashboard omits private quote metrics.
- Quote list denied to Editor.
- No production admin read imports mock data.

## Acceptance Criteria / Definition Of Done

- Admin read screens use Supabase or real empty states.
- Role differences are visible and enforced.
- Tests updated away from mock assumptions.

## Rollback/Fallback Notes

- If a section has no data yet, show a real empty state, not mock records.

## Risks/Unknowns

- Large admin components may need careful refactoring to separate data from UI.
