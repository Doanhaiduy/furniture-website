# Phase 05 Checklist – Admin Read Integration (Data Display)

## 1. Reusable Data Table Component
- [ ] Create `components/admin/DataTable.tsx` supporting:
  - Column cell formatting.
  - Paginated database page controls (Next / Previous buttons).
  - Search query strings parser.
  - Column sorting keys.
- [ ] Implement skeletal loaders inside `components/admin/TableSkeleton.tsx` to display during data loads.
- [ ] Implement error fallback views handling query execution errors.

## 2. Dashboard Statistics Integration
- [ ] Implement `getAdminDashboardStats` inside `lib/supabase/admin-queries.ts` to retrieve count statistics.
- [ ] Connect dashboard widgets inside `app/admin/dashboard/page.tsx` to read stats.
- [ ] Ensure `editor` views hide sensitive quote stats and user count cards, displaying only publishable content counters.

## 3. Product, Category, & Showroom Listings
- [ ] Connect the products list inside `app/admin/products/page.tsx` to display a table of all items (displaying Image, Name, Category, Price, Status).
- [ ] Connect categories list inside `app/admin/categories/page.tsx` (displaying Name, Slug, Parent Category, Product Count).
- [ ] Connect showrooms list inside `app/admin/showrooms/page.tsx` (displaying Name, Address, Phone, Active status).
- [ ] Connect blog directory listing inside `app/admin/blog/page.tsx` (displaying Title, Status, Author, Publish Date).

## 4. Quote Request Details (Admin Only)
- [ ] Setup `getAdminQuotesList` inside `lib/supabase/admin-queries.ts`.
- [ ] Bind table records inside `app/admin/quotes/page.tsx` to the query.
- [ ] Integrate a detail dialog modal (`components/admin/QuoteDetailDialog.tsx`) triggered by clicking a table row to display the full customer message.
- [ ] Double-check authorization: throw a server error if the session user is not an `admin`.

## 5. Verification & Linting
- [ ] Confirm no prototype data files are imported inside admin pages.
- [ ] Run `pnpm lint` and `pnpm typecheck` inside Docker to confirm compilation.
- [ ] Run Playwright tests `pnpm test:e2e` to verify dashboard display rules.
- [ ] Update `docs/specs/traceability-matrix.md` with verification checks for Phase 05.
