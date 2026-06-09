# Phase 04 Deliverables – Authentication & Admin Access Control

## Concrete Expected Outputs
- **middleware.ts**: Root middleware intercepting all `/admin/*` routes (except `/admin/login` and `/admin/access-denied`) to validate sessions and profile roles on the server.
- **components/providers/AuthProvider.tsx**: Context provider wrapping the layout to expose the current authenticated user and profile state.
- **lib/supabase/auth.ts**: Server-side utility helpers (such as `getCurrentUser`, `requireAdmin`, `requireEditorOrAdmin`) enforcing session constraints.
- **Admin Bootstrap Documentation**: Markdown guide (`docs/admin-bootstrap.md`) explaining how to set up the first administrator account in local development.

## Affected Routes, Components, APIs, Tables, and Configurations
- **Routes**:
  - `middleware.ts` [NEW/MODIFY]
  - `/admin/login` [MODIFY] (Link form submit actions to Supabase Auth client methods)
  - `/admin/access-denied` [NEW/MODIFY] (Error feedback page)
  - `/admin/*` [MODIFY] (All layouts protected by server-side role verifications)
- **Components**:
  - `components/showroom/admin-shell.tsx` [MODIFY] (Update sidebar menu bindings to hide Admin-only links for Editors)
- **Tables**:
  - `profiles` [READ] (Fetch role metadata)

## Future Touchpoints
- **Admin Layout** (`app/admin/layout.tsx`) will be updated in Phase 05 to display the logged-in administrator's profile name and avatar.
- **Settings page** (`app/admin/settings/page.tsx`) will be secured in Phase 09 using the dynamic role verification helpers.
- **User management** (`app/admin/users/page.tsx`) will be integrated with Auth API hooks in Phase 09.

## Verification Evidence Required
1. **Browser MCP role-access evidence**: Behavior-first notes and screenshots/snapshots where useful verifying:
   - Anonymous redirection to `/admin/login`.
   - Successful Editor login and dashboard access.
   - Editor block when attempting to access `/admin/quotes`.
2. **Playwright backup outputs**: Optional E2E reports only when CI/headless role regression is required.
3. **Session Persistence checks**: Visual logs confirming the user session survives browser tab closures.
4. **Database RLS validation**: CLI outputs proving queries on `profiles` fail if executed as a different user without permissions.
