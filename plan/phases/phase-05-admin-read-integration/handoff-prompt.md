# Phase 05 Handoff Prompt

## Instructions for Executing Agent
1. **Scope Boundary**: Read all files in `plan/phases/phase-05-admin-read-integration/` before commencing work. Execute only the scope defined for Phase 05. Do not implement product edit forms, update categories, add status updates, or setup Cloudinary hooks.
2. **Context Alignment**: Ensure all admin read list components fetch data from Supabase. Use server-side data loaders where possible.
3. **Execution Instructions**:
   - Create generic data table component `components/admin/DataTable.tsx` with loading skeletons.
   - Code server-side read helpers inside `lib/supabase/admin-queries.ts`.
   - Update admin dashboard widgets to retrieve counts dynamically.
   - Restrict Quote requests to the Admin role only.
4. **Verifications**:
   - Run the full verification checklist:
     ```bash
     pnpm lint
     pnpm typecheck
     pnpm test
     pnpm build
     ```
   - Run Browser MCP journey checks for admin dashboard reads, pagination, empty states, and role-specific visibility.
   - Use `pnpm test:e2e` only as Playwright backup for deterministic CI seeded-data regression or unsupported Browser MCP scenarios.
5. **Marking Complete**: Ensure all tasks in `checklist.md` are marked complete, and record changes inside `docs/specs/traceability-matrix.md`. Do not start Phase 06 until all admin tables show real database content.

## Key Rules
- **No Mock Imports**: Ensure all imports of `lib/showroom-data.ts` are removed from admin listing pages.
- **Enforce Data Segregation**: Restrict quote and user stats in the dashboard to the Admin role.
- **Graceful Error Handling**: Database failures must render clean error layouts without crashing the page layout.
