# Phase 04 Dependencies – Authentication & Admin Access Control

## Upstream Prerequisites
- **Phase 01 Complete**: Server-side Supabase helper clients must support session and cookie handling via `@supabase/ssr`.
- **Database Profiles Schema**: The `profiles` table must exist, contain a `role` column restricting values to `admin` or `editor`, and have RLS helper queries active (`is_admin()`, `is_editor()`).

## Required Services / Configuration / Auth State
- **Supabase Auth Service**: The local or remote Supabase project must have the Email auth provider enabled.
- **Seeded Admin & Editor Users**: At least one `admin` profile and one `editor` profile must exist in the database (with matching credentials in Supabase Auth `auth.users`) to verify RBAC flows.

## Blockers
- **First Admin Bootstrap**: If the registration path is closed and no SQL seed exists to assign the first `admin` role to a user, developers cannot log in or manage permissions.
- **Middleware Session Parsing Issues**: If middleware configuration fails to read cookies or handle cross-origin redirects, users will get stuck in infinite redirect loops.

## Parallelization and Constraints
- **Parallel Work**:
  - Updating the sidebar UI elements to hide sections dynamically can be done in parallel with setting up server-side middleware routing guards.
  - Designing the `access-denied` page visual feedback is independent of database auth checks.
- **Sequential Constraints**:
  - Server-side role resolution functions must be completed before applying them to route handlers or layout components.
  - The middleware route guards must be verified with Browser MCP role-access journeys and server-side integration tests before integrating dynamic data reads (Phase 05). Use Playwright only as backup for a deterministic CI role matrix.
