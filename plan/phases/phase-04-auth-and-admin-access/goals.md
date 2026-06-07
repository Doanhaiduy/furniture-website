# Phase 04 Goals – Authentication & Admin Access Control

## Measurable Goals
- **Real Session Persistence**: Replace the demo admin login flow with real Supabase Auth session management, ensuring tokens refresh securely and persist across browser reloads.
- **Server Guard Enforcement**: Protect all routes under `/admin/*` (except `/admin/login` and `/admin/access-denied`) using Next.js middleware and server-side guards.
- **Role Model Option A Enforcement**: Enforce role-based access control (RBAC) at the server routing layer to distinguish between `admin` and `editor` roles from the `profiles` table.
- **Strict Data Segregation**: Deny the `editor` role access to quote requests, user listings, and privileged integration settings (including Gemini configuration).

## Phase Success Conditions
- Accessing any `/admin/*` route without a valid session redirects the user to `/admin/login` immediately.
- Logging in with a profile having the `editor` role grants access only to publishable content sections (`/admin/products`, `/admin/categories`, `/admin/blog`, `/admin/showrooms`, `/admin/media`).
- An authenticated `editor` attempting to access `/admin/quotes`, `/admin/users`, or `/admin/settings` (or the corresponding API endpoints) is blocked on the server, redirecting to `/admin/access-denied` or returning a `403 Forbidden` response.
- The Admin Sidebar (`components/showroom/admin-shell.tsx`) dynamically adapts navigation elements based on the authenticated profile role, while relying on server-side checks for absolute security.
- Admin sessions survive page reloads and refresh tokens automatically using secure middleware cookies.

## Concrete Results
- Secure Next.js `middleware.ts` routing guards.
- Protected Server Component wrappers (`requireAdmin` and `requireEditorOrAdmin`).
- Integrated `components/providers/AuthProvider.tsx` tracking current user profiles.
- Automated Playwright and integration test suites validating unauthorized redirects and role boundaries.
