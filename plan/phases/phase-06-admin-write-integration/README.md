# Phase 06 Admin Write Integration And Audit Logging

## Objective

Add validated Supabase-backed admin mutations and audit logging for content, quotes, users, settings, and archive workflows.

## Why This Phase Exists

The admin UI includes create/edit/status workflows, but persistence is not wired. The schema includes `audit_logs` and event tables that should be used for privileged operations.

## Requirement IDs

- FR-03
- FR-06
- FR-07-ADM
- FR-08-ADM
- FR-10
- FR-12-ADM
- NFR-05
- NFR-07

## Real Scope

- Product/category create/update/archive.
- Blog/category create/update/archive.
- Showroom create/update/archive.
- Quote status/assignment/notes/email updates.
- User/profile role and active-state mutations.
- Settings/social/quote recipient mutations, excluding final Gemini UI if deferred to Phase 09.
- Audit logging for privileged changes.

## Out Of Scope

- Cloudinary binary upload runtime.
- Gemini draft generation.
- Broad visual redesign.

## Dependencies

- Phase 05 admin reads.
- Phase 04 auth/RBAC.
- Stable validation schemas.

## Files/Folders Likely Impacted

- `app/admin/**`
- `components/showroom/admin-*.tsx`
- admin API/route handlers or server actions
- validation schemas
- Supabase mutation helpers
- tests

## Implementation Tasks

1. Define server-side validation contracts for each mutation group.
2. Implement content create/update/archive flows with role-aware authorization.
3. Implement Admin-only quote, user, and settings mutations.
4. Write audit/event rows for content and privileged changes.
5. Add tests for allowed writes, denied writes, validation failures, and audit logging.

## Backend/Database Impacts

- Writes content/product/blog/showroom tables and translations.
- Writes quote updates plus `quote_request_events`.
- Writes `profiles` through Admin-only flows.
- Writes settings/social/recipients.
- Writes `audit_logs` for privileged and content mutations.

## Frontend Impacts

- Admin forms/dialogs must submit to real server mutations.
- Mutating UI should show real pending, success, error, and stale-data states.
- Public pages should refresh/revalidate when publish/archive changes affect public content.

## Route/Page Mapping

- Admin create/edit dialogs in `/admin/products`, `/admin/categories`, `/admin/blog`, `/admin/showrooms`.
- Quote workflow in `/admin/quotes`.
- User/settings writes for Admin-only routes as scoped.

## Env/Config Needs

- Supabase service role for server-side privileged operations where needed.
- Revalidation secret for affected public routes.

## Security/RLS Considerations

- All mutation inputs validated server-side.
- Editors can mutate publishable content only.
- Editors cannot mutate quote requests, users, privileged settings, integration secrets, or Gemini settings.
- Audit logs are append-only.

## Testing Checklist

- Allowed Admin/Editor mutations succeed.
- Forbidden Editor mutations fail.
- Invalid localized fields/slugs/statuses fail.
- Audit log rows are created.
- Public pages revalidate or refresh after publish/archive.

## Acceptance Criteria / Definition Of Done

- Representative CRUD flows persist.
- Archive/soft delete works.
- Audit logging is verified.
- E2E covers at least one content mutation and one denied privileged mutation.

## Rollback/Fallback Notes

- Prefer archive over destructive delete.
- If audit logging fails, fail privileged mutation rather than silently losing audit trail.

## Risks/Unknowns

- Complex admin forms may need staged integration by entity.
