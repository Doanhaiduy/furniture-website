# Phase 04 Checklist – Authentication & Admin Access Control

## 1. Supabase Auth Integration
- [ ] Connect the login form inside `app/admin/login/page.tsx` to call `supabase.auth.signInWithPassword`.
- [ ] Integrate loading states and handle authentication error messages (e.g. `"Invalid login credentials"`).
- [ ] Configure `components/providers/AuthProvider.tsx` to listen to auth state changes using `supabase.auth.onAuthStateChange`.
- [ ] Implement logout triggers in the admin sidebar navigation calling `supabase.auth.signOut`.

## 2. Server-side Route Protection (Middleware)
- [ ] Create or update `middleware.ts` in the project root to intercept all `/admin` routes.
- [ ] Utilize `@supabase/ssr` middleware methods to retrieve the current session and refresh tokens.
- [ ] Extract the user's role from the `profiles` table inside the middleware boundary.
- [ ] If no session exists, redirect `/admin/*` requests to `/admin/login`.
- [ ] If the user role is `editor` and the requested route is Admin-only (`/admin/quotes`, `/admin/users`, `/admin/settings`), redirect to `/admin/access-denied`.

## 3. Server Component Helpers
- [ ] Create authentication helper library `lib/supabase/auth.ts`.
- [ ] Implement `getCurrentUser()` to retrieve and validate the authenticated session on the server.
- [ ] Implement `requireAdmin()` throwing a `403 Forbidden` error or redirecting if the profile role is not `admin`.
- [ ] Implement `requireEditorOrAdmin()` verifying that the profile role matches one of the two valid roles.

## 4. UI adaptation & Verification
- [ ] Modify `components/showroom/admin-shell.tsx` to read the active profile role from the context.
- [ ] Hide `/admin/quotes`, `/admin/users`, and `/admin/settings` links in the sidebar if the role is `editor`.
- [ ] Run Browser MCP auth and role-access journey checks to verify:
  - Redirection of anonymous requests.
  - Editor access blocks.
  - Session persistence across hot-reloads.
  - Use `pnpm test:e2e` only as Playwright backup for a deterministic CI role matrix.
- [ ] Update `docs/specs/traceability-matrix.md` with requirement mapping details for Phase 04.
