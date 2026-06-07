# Phase 06 Dependencies – Admin Write Integration & Audit Logging

## Upstream Prerequisites
- **Phase 05 Complete**: Admin listing tables and read helpers must be verified.
- **Database Write Policies**: RLS policies permitting `INSERT`, `UPDATE`, and `DELETE` transactions for authenticated users must be applied.

## Required Services / Configuration / Auth State
- **Revalidation Secret**: `REVALIDATION_SECRET` must be set in environment variables to allow route refresh triggers.
- **Admin/Editor Test Accounts**: Active credentials must exist to verify different write permissions.
- **Zod Schema Engine**: Zod validator hooks must be configured within forms.

## Blockers
- **Strict Check Constraints**: If database constraints (e.g. `require_publish_translations` check constraints) are violated by form formatting, writes will fail.
- **RLS Access Blocks**: If RLS policies fail to distinguish between Admin and Editor profiles, security checks will fail.

## Parallelization and Constraints
- **Parallel Work**:
  - The implementation of form UI layouts for products and blog posts can proceed in parallel once the validation schemas are finalized.
  - Setting up route revalidation helpers is independent of form layout components.
- **Sequential Constraints**:
  - The audit logger helper (`lib/supabase/audit.ts`) must be completed before writing database mutations, as each mutation must record audit rows.
  - File validation schemas must be finalized before building the form submission hooks.
