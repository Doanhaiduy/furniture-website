# Phase 04 Handoff Prompt

## Instructions for Executing Agent
1. **Scope Boundary**: Read all files in `plan/phases/phase-04-auth-and-admin-access/` before commencing work. Execute only the scope defined for Phase 04. Do not integrate dynamic database reads in admin list views, write database mutations, or setup Cloudinary uploading helpers.
2. **Context Alignment**: Connect `/admin/login` forms to Supabase Auth. Enforce Role Model Option A (Admin vs Editor) at the middleware layer.
3. **Execution Instructions**:
   - Write authentication guards in `middleware.ts`.
   - Setup context provider `AuthProvider.tsx` tracking current user profiles.
   - Code server-side helper library `lib/supabase/auth.ts` with `requireAdmin` and `requireEditorOrAdmin`.
   - Hide Admin-only links dynamically inside `components/showroom/admin-shell.tsx`.
4. **Verifications**:
   - Run the full verification checklist:
     ```bash
     pnpm lint
     pnpm typecheck
     pnpm test
     pnpm build
     ```
   - Run Browser MCP journey checks for anonymous redirects, Editor denial, Admin access, and session refresh behavior.
   - Use `pnpm test:e2e` only as Playwright backup for deterministic CI role matrices or unsupported Browser MCP scenarios.
5. **Marking Complete**: Confirm all tasks in `checklist.md` are marked complete, and record changes inside `docs/specs/traceability-matrix.md`. Do not start Phase 05 until authorization rules are verified on the server.

## Key Rules
- **No Client Security Bypass**: Client-side UI hiding is not sufficient. All Admin-only routes and APIs must execute server-side verification checks.
- **Strict Role Mapping**: Fetch role parameters directly from the `profiles` table inside the database, rejecting access if the role is not explicitly `admin` or `editor`.
- **First Admin Seeding**: Document how to promote the first created profile to the `admin` role in development and production environments.
