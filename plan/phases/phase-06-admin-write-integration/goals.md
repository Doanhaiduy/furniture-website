# Phase 06 Goals – Admin Write Integration & Audit Logging

## Measurable Goals
- **Wire CRUD Actions**: Implement database insertions, updates, and soft deletions (archiving) for products, categories, blog posts, and showrooms.
- **Server Validation**: Validate all form payloads server-side using Zod validation schemas.
- **Audit Logging**: Write audit records to the `audit_logs` database table for all mutations executed by Admin or Editor users.
- **Cache Revalidation**: Trigger Next.js route revalidation using a revalidation token to ensure modifications are reflected immediately on public pages.

## Phase Success Conditions
- Creating or editing an entity (Product, Category, Blog post, Showroom) via the admin panel persists changes directly in Supabase.
- Attempting to delete an entity displays a confirmation dialog. Destructive actions are replaced by soft-deleting (setting `is_active = false`) to maintain data integrity.
- Form submissions with invalid inputs (e.g. invalid slugs, empty Vietnamese fields) are rejected, rendering error feedback.
- Every successful write operation writes a new log entry to `audit_logs` storing:
  - User ID and actor email.
  - Action types (INSERT, UPDATE, DELETE).
  - Target table and row ID.
  - JSON metadata (old values vs. new values).
- Public routes refresh instantly upon saving changes in the admin panel.

## Concrete Results
- Unified validation schemas (`lib/validations/admin.ts`) covering all manage models.
- Database mutation helpers (`lib/supabase/mutations.ts`) executing with RLS validation.
- Audit logging helper function (`lib/supabase/audit.ts`) capturing system transactions.
- Active create, edit, and archive screens.
