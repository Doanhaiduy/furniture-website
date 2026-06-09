# Phase 02 Handoff Prompt

## Instructions for Executing Agent
1. **Scope Boundary**: Read all files in `plan/phases/phase-02-public-data-integration/` before commencing work. Execute only the scope defined for Phase 02. Do not implement lead contact submissions, admin login screens, media upload forms, or AI description generations.
2. **Context Alignment**: Ensure all database reads utilize the anonymous Supabase client (`lib/supabase/server.ts` initialized without the service role key) to respect Row Level Security (RLS) constraints for public visitors.
3. **Execution Instructions**:
   - Write typed queries in `lib/supabase/queries.ts`.
   - Update Homepage, About, Products (List & Details), Blog (List & Details), and Showrooms to fetch data from Supabase.
   - Implement parameter parsing schema using Zod.
   - Build alternate locale tag helpers and dynamic `app/sitemap.ts`.
4. **Verifications**:
   - Run the full verification checklist:
     ```bash
     pnpm lint
     pnpm typecheck
     pnpm test
     pnpm build
     ```
   - Run Browser MCP journey checks for affected public routes, locale switching, filters, sitemap/robots visibility, and responsive states. Capture screenshot/snapshot evidence when useful.
   - Use `pnpm test:e2e` only as Playwright backup when a deterministic CI/headless route regression is required or Browser MCP cannot cover the scenario.
5. **Marking Complete**: Confirm all tasks in `checklist.md` are marked complete, and record changes inside `docs/specs/traceability-matrix.md`. Do not start Phase 03 or Phase 04 until all public pages display dynamic database content.

## Key Rules
- **No Mock Imports**: Imports from `lib/showroom-data.ts` are strictly prohibited in production components.
- **Published Items Only**: Queries on public pages must explicitly filter by active states (`is_active = true` or `status = 'published'`) to prevent leaking drafts.
- **Strict Locale Validation**: Route slugs and request headers must validate language contexts (`vi`, `en`) and fallback gracefully.
