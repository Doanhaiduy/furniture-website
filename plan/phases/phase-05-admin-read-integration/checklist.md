# Phase 05 Checklist – Admin Read Integration (Data Display)

## 1. Reusable Data Table Component
- [x] Create `components/admin/DataTable.tsx` supporting:
  - Column cell formatting.
  - Paginated database page controls (Next / Previous buttons).
  - Search query strings parser.
  - Column sorting keys.
- [x] Implement skeletal loaders inside `components/admin/TableSkeleton.tsx` to display during data loads.
- [x] Implement error fallback views handling query execution errors.

## 2. Dashboard Statistics Integration
- [x] Implement `getAdminDashboardStats` inside `lib/supabase/admin-queries.ts` to retrieve count statistics.
- [x] Connect dashboard widgets inside `app/admin/page.tsx` (real route instead of dashboard) to read stats.
- [x] Ensure `editor` views hide sensitive quote stats and user count cards, displaying only publishable content counters.

## 3. Product, Category, & Showroom Listings
- [x] Connect the products list inside `app/admin/[section]/page.tsx` to display a table of all items (displaying Image, Name, Category, Price, Status) using DataTable.
- [x] Connect categories list inside `app/admin/[section]/page.tsx` (displaying Name, Slug, Parent Category, Product Count) using DataTable.
- [x] Connect showrooms list inside `app/admin/[section]/page.tsx` (displaying Name, Address, Phone, Active status) using DataTable.
- [x] Connect blog directory listing inside `app/admin/[section]/page.tsx` (displaying Title, Status, Author, Publish Date) using DataTable.

## 4. Quote Request Details (Admin Only)
- [x] Setup `getAdminQuotesList` inside `lib/supabase/admin-queries.ts`.
- [x] Bind table records inside `app/admin/[section]/page.tsx` (quotes section) to the query.
- [x] Integrate a detail dialog modal (`components/admin/QuoteDetailDialog.tsx`) triggered by clicking a table row to display the full customer message.
- [x] Double-check authorization: throw a server error if the session user is not an `admin`.

## 5. Verification & Linting
- [x] Confirm no prototype data files are imported inside admin pages.
- [x] Run `pnpm lint` and `pnpm typecheck` to confirm compilation.
- [x] Run Browser MCP admin-read journey checks to verify dashboard display rules.
- [x] Update `docs/specs/traceability-matrix.md` with verification checks for Phase 05.
