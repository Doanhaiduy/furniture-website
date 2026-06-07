# Phase 06 Implementation Guide – Admin Write Integration & Audit Logging

## Implementation Order
1. **Validation Schemas Setup**: Define Zod constraints inside `lib/validations/admin.ts`.
2. **Audit Logging Framework**: Implement the audit database writer in `lib/supabase/audit.ts`.
3. **Database Mutations**: Write mutation helpers inside `lib/supabase/mutations.ts`.
4. **Content Forms Setup**: Integrate Product, Category, Blog, and Showroom forms.
5. **Revalidation Triggers**: Code path refresh actions.
6. **Destructive Flow Protection**: Connect deletion confirmation dialogs.

---

## Route & Page Mapping
- `/admin/products/new`, `/admin/products/[id]/edit` -> Product management interfaces.
- `/admin/categories/new`, `/admin/categories/[id]/edit` -> Category management interfaces.
- `/admin/blog/new`, `/admin/blog/[id]/edit` -> Blog article management interfaces.
- `/admin/showrooms/new`, `/admin/showrooms/[id]/edit` -> Showroom management interfaces.

---

## Backend, Frontend, and Database Impacts
- **Database**: Executes INSERT, UPDATE, and DELETE (soft delete) statements on target tables and writes records to `audit_logs`.
- **Backend (Next.js server)**: Processes validation, sanitizes inputs, handles transaction commits, and executes API revalidation.
- **Frontend**: Form controls transition from static stubs to fully interactive submission flows with toast alerts.

---

## Docker & Local Runtime Implications
- Add `REVALIDATION_SECRET` to environment files.
- Revalidation calls will trigger local Docker routing caches. Ensure internal container DNS resolves host headers correctly.

---

## Gemini Settings & API Secret Implications
- Editor users are blocked from setting modifications. If an Editor attempts to modify configuration endpoints, the server must reject the mutation and log the attempt in `audit_logs`.

---

## Security & RLS Details
- Mutations are executed under the authenticated user's session context. RLS database policies require checking roles from `profiles` before executing write queries:
  ```sql
  CREATE POLICY "Editor modify products" ON products FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );
  ```
- All form inputs (specifically markdown text areas and URLs) must be sanitized to prevent XSS injections.

---

## Edge Cases & Rollback/Fallback Considerations
- **Audit Logging Failures**: If writing to `audit_logs` fails (e.g. database constraint issues), the parent transaction must be rolled back. Do not allow content modifications to succeed without recording audit records.
- **Unique Slugs**: Zod validations must verify slugs are unique by running checking queries. If a slug is already taken (e.g. `ban-tra-go-soi` already exists), reject the submit and display a descriptive error warning.

---

## Open Questions & Assumptions
- **Assumption**: Soft-deleted items (e.g., product where `is_active = false`) are automatically filtered out from public pages by database RLS rules.
- **Open Question**: Will the admin settings management form allow modifying quote recipients list? We assume settings mutations will be fully handled in Phase 09.
