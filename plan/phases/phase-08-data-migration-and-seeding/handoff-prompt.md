# Phase 08 Handoff Prompt

## Instructions for Executing Agent
1. **Scope Boundary**: Read all files in `plan/phases/phase-08-data-migration-and-seeding/` before commencing work. Execute only the scope defined for Phase 08. Do not build users editing triggers, configure settings UI components, or write AI prompts libraries.
2. **Context Alignment**: Migrate the prototype data from `lib/showroom-data.ts` into database seed script configuration tables. Exclude mock imports from production paths completely.
3. **Execution Instructions**:
   - Write media asset upload helper `scripts/seed-cloudinary.ts` mapping values to Cloudinary paths.
   - Setup idempotent SQL seeds inside `supabase/migrations/0009_optional_local_seed.sql` or equivalent scripts.
   - Enforce seed gates restricting executions to local/staging environments (`app.seed_local = 'true'`).
   - Move `lib/showroom-data.ts` into test folders, cleaning up all production components import commands.
4. **Verifications**:
   - Run the full verification checklist:
     ```bash
     pnpm lint
     pnpm typecheck
     pnpm test
     pnpm build
     ```
   - Run Browser MCP journey checks to verify seeded content appears on public/admin routes and media renders correctly.
   - Use `pnpm test:e2e` only as Playwright backup for deterministic seeded-route CI regression or unsupported Browser MCP scenarios.
5. **Marking Complete**: Ensure all tasks in `checklist.md` are marked complete, and record changes inside `docs/specs/traceability-matrix.md`. Do not start Phase 09 until database seeds are verified.

## Key Rules
- **No Production Mock Dependencies**: Production code must fetch data exclusively from Supabase after this phase.
- **Idempotency is Mandatory**: Re-running database seed scripts must not result in duplicate entries or primary key violations.
- **Bilingual Content Integrity**: Confirm that both Vietnamese and English strings are parsed without encoding errors.
