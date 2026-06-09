# Plan Orchestration: Pending Approval Scope

This file acts as the state bridge between Mode 1 (REVIEW) and Mode 2 (EXECUTION). The agent must write to this file during the review phase, and read from it during execution.

---

## 1. Scope Metadata

- **Timestamp**: 2026-06-08T23:05:00+07:00
- **Selected Phase**: Phase 05: Admin Read Integration
- **Selected Tasks**:
- Task 2.1: Implement `getAdminDashboardStats` inside `lib/supabase/admin-queries.ts` to retrieve count statistics.
- Task 2.2: Connect dashboard widgets inside `app/admin/page.tsx` and related dashboard components to live stats.
- Task 2.3: Ensure `editor` views hide sensitive quote stats and user count cards, displaying only publishable content counters.
- Task 3.1: Connect the products list inside `app/admin/products/page.tsx` to display a table of all items.
- Task 3.2: Connect categories list inside `app/admin/categories/page.tsx`.
- Task 3.3: Connect showrooms list inside `app/admin/showrooms/page.tsx`.
- Task 3.4: Connect blog directory listing inside `app/admin/blog/page.tsx`.
- Task 4.1: Setup `getAdminQuotesList` inside `lib/supabase/admin-queries.ts`.
- Task 4.2: Bind quote records inside `app/admin/quotes/page.tsx` to the query.
- Task 4.3: Integrate a detail dialog modal `components/admin/QuoteDetailDialog.tsx`.
- Task 4.4: Double-check authorization: throw a server error if the session user is not an `admin`.
- Task 5.1: Confirm no prototype data files are imported inside admin pages.
- Task 5.2: Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
- Task 5.3: Run Browser MCP admin-read journey checks.
- Task 5.4: Update `docs/specs/traceability-matrix.md` with Phase 05 verification.
- **Requirement IDs**:
- FR-03
- FR-06
- FR-07-ADM
- FR-08-ADM
- FR-10
- FR-11
- FR-12-ADM
- NFR-05
- NFR-07
- **Scope Boundaries**:
- Complete the remaining scope of Phase 05 only.
- Do not start Phase 06 write flows, media upload, Gemini settings writes, or later phases.
- Keep Role Model Option A restrictions intact, especially admin-only quotes and sensitive metrics.
- **Files Likely Affected**:
- `[CREATE] lib/supabase/admin-queries.ts`
- `[CREATE] components/admin/QuoteDetailDialog.tsx`
- `[MODIFY] app/admin/page.tsx`
- `[MODIFY] app/admin/[section]/page.tsx`
- `[MODIFY] components/showroom/admin-pages.tsx`
- `[MODIFY] components/showroom/admin-dashboard-widgets.tsx`
- `[MODIFY] components/admin/DataTable.tsx`
- `[MODIFY] components/admin/TableSkeleton.tsx`
- `[MODIFY] docs/specs/traceability-matrix.md`
- `[MODIFY] tests/unit/**`
- `[MODIFY] plan/phases/phase-05-admin-read-integration/checklist.md` (after execution)
- `[MODIFY] plan/execution-status.md` (after execution)
- `[MODIFY] plan/execution-log.md` (after execution)
- `[MODIFY] plan/99-next-action.md` (after execution)
- `[MODIFY] plan/pending-approval.md` (status updates during execution)
- **Tests & Checks Planned**:
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- Browser MCP journey checks for `/admin` dashboard, products, categories, blog, showrooms, and quotes with role-aware visibility.

---

## 2. Approval Status

- **Status**: confirmed
- *Values allowed*: `pending` (prohibits execution) | `confirmed` (permits execution) | `cancelled` (aborts execution) | `completed` (execution finished)
- **Approval Notes**: User requested completing 100% of Phase 05 in one execution scope; awaiting explicit confirmation under the updated proposal.
