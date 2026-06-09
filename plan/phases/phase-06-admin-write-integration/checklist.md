# Phase 06 Checklist – Admin Write Integration & Audit Logging

## 1. Zod Validation & Audit Helper
- [ ] Create `lib/validations/admin.ts` defining Zod schemas for products, categories, blog posts, and showrooms.
- [ ] Ensure the schemas enforce:
  - Required Vietnamese fields (`name_vi`, `title_vi`).
  - Unique, URL-safe slug formats (e.g. `^[a-z0-9-]+$`).
  - Correct enum fields matching database configurations (e.g. `status` is either `draft` or `published`).
- [ ] Create `lib/supabase/audit.ts` executing database insertions into the `audit_logs` table.

## 2. Product & Category CRUD Forms
- [ ] Build the Product Create form at `app/admin/products/new/page.tsx` and Edit form at `app/admin/products/[id]/edit/page.tsx`.
- [ ] Implement form state handling using `react-hook-form` and `@hookform/resolvers/zod`.
- [ ] Integrate database mutations inside `lib/supabase/mutations.ts` for product creation and updating.
- [ ] Implement Category Create/Edit forms mapping parent category relations.
- [ ] Create a soft-deletion handler: replace hard deletes with an archive function setting `is_active = false`.

## 3. Blog & Showroom Write Integration
- [ ] Integrate Blog post forms supporting title, slug, status, excerpt, and body content inputs.
- [ ] Implement Showroom Create/Edit pages mapping name, address, working hours, and coordinates (latitude/longitude).
- [ ] Embed the `DeleteConfirmDialog` component in all entity listing screens.

## 4. Revalidation & Toast Alerts
- [ ] Create Next.js API route or Server Action helper triggering `revalidatePath` or `revalidateTag` for updated routes (e.g., revalidating `/vi/products` and `/en/products` when a product is modified).
- [ ] Connect form submission hooks to render toast notifications (`useToast`) displaying success messages or validation errors.

## 5. Security & Verification Checks
- [ ] Verify Editor constraints: confirm Editor users can successfully edit products and blog posts but receive authorization blocks when attempting to write settings.
- [ ] Run verification tests:
  ```bash
  pnpm lint
  pnpm typecheck
  pnpm test
  pnpm build
  ```
- [ ] Run Browser MCP admin-write journey checks for create/edit/archive, validation errors, toast states, and role-denied mutations; use `pnpm test:e2e` only as Playwright backup for deterministic CI CRUD regression.
- [ ] Update `docs/specs/traceability-matrix.md` with verification checks for Phase 06.
