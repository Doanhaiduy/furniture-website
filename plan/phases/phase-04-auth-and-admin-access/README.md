# Phase 04 Supabase Auth And Admin Access

## Objective

Replace demo admin login/access with Supabase Auth sessions and server-side Role Model A enforcement.

## Why This Phase Exists

The admin UI exists, but `/admin/login` is a demo and protected routes are not server-authenticated. RLS policies depend on active `profiles` roles.

## Requirement IDs

- FR-07-ADM
- FR-10
- FR-12-ADM
- NFR-05

## Real Scope

- Supabase Auth login/logout/session handling.
- `profiles` role lookup and active-user checks.
- Server guards for `/admin` and section routes.
- Editor denial for quotes, users, privileged settings, integration secrets, and Gemini settings.
- Admin shell current-user state.
- First Admin bootstrap documentation.

## Out Of Scope

- Admin CRUD implementation.
- Public data rewrites.
- Gemini draft generation.

## Dependencies

- Phase 01 Supabase helper boundary.
- Active admin/editor profile records in Supabase.
- Supabase Auth local/remote environment.

## Files/Folders Likely Impacted

- `app/admin/**`
- auth helper files
- route guard/middleware helpers
- `components/showroom/admin-shell.tsx`
- `tests/integration/**`
- `tests/e2e/public-admin.spec.ts`

## Implementation Tasks

1. Replace demo login/session behavior with Supabase Auth.
2. Add server helpers for current user, active profile, and role checks.
3. Protect `/admin` routes and APIs with server-side guards.
4. Enforce Editor denial for quotes, users, privileged settings, integrations, and Gemini settings.
5. Document Admin bootstrap and update auth/RBAC tests.

## Backend/Database Impacts

- Reads `profiles`.
- Uses Supabase Auth session.
- Must align with RLS helpers: `is_admin`, `is_editor`, `can_manage_publishable_content`, `can_manage_private_admin_data`.

## Frontend Impacts

- Admin shell displays real current user/role state.
- Login/logout/denied states replace demo behavior.
- Admin navigation must hide disallowed sections while server guards remain authoritative.

## Route/Page Mapping

| Route | Access |
| --- | --- |
| `/admin` | Admin or Editor, with role-scoped dashboard data |
| `/admin/products`, `/admin/categories`, `/admin/blog`, `/admin/showrooms` | Admin or Editor |
| `/admin/media` | Admin full, Editor scoped |
| `/admin/quotes`, `/admin/users`, privileged `/admin/settings` | Admin only |
| `/admin/ai-assistant` | Admin or Editor for drafts; Gemini settings hidden |

## Env/Config Needs

- Supabase URL/anon key.
- Server-side Supabase session support.
- Service role only where needed for admin server operations.

## Security/RLS Considerations

- UI hiding is not enough.
- Direct URL access must be blocked server-side.
- Service role usage must be centralized.
- Inactive profiles cannot access admin.

## Testing Checklist

- Anonymous denied.
- Admin allowed everywhere.
- Editor allowed only publishable-content areas.
- Editor denied quotes/users/privileged settings/Gemini settings.
- Inactive user denied.

## Acceptance Criteria / Definition Of Done

- Demo login is replaced or clearly bypassed only in local test mode.
- Admin session survives refresh.
- Role-based access works in E2E and integration tests.

## Rollback/Fallback Notes

- If Supabase Auth local is blocked, use remote dev project and document account setup.
- Do not ship a demo auth bypass to production.

## Risks/Unknowns

- First Admin bootstrap process must be finalized before production.
