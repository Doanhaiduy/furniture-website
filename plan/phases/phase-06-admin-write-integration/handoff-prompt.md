# Phase 06 Handoff Prompt

## Instructions for Executing Agent
1. **Scope Boundary**: Read all files in `plan/phases/phase-06-admin-write-integration/` before commencing work. Execute only the scope defined for Phase 06. Do not integrate Cloudinary binary upload widgets, Resend email triggers, Google maps API calls, or Gemini generators.
2. **Context Alignment**: Connect form page submits to Supabase database update operations. Validate all inputs server-side using Zod validation schemas.
3. **Execution Instructions**:
   - Create Zod validation schema file `lib/validations/admin.ts`.
   - Setup database audit writer helper `lib/supabase/audit.ts` writing transactions to the `audit_logs` table.
   - Setup CRUD mutation helpers inside `lib/supabase/mutations.ts`.
   - Build Create, Edit, and Archive interfaces for products, categories, blog posts, and showrooms.
   - Configure route revalidation mechanisms refreshing public pages.
4. **Verifications**:
   - Run the full verification checklist:
     ```bash
     pnpm lint
     pnpm typecheck
     pnpm test
     pnpm build
     ```
   - Run Browser MCP journey checks for create/edit/archive flows, visible validation errors, confirmation dialogs, toast states, and role-denied mutations.
   - Use `pnpm test:e2e` only as Playwright backup for deterministic CI CRUD regression or unsupported Browser MCP scenarios.
5. **Marking Complete**: Ensure all tasks in `checklist.md` are marked complete, and record changes inside `docs/specs/traceability-matrix.md`. Do not start Phase 07 until database mutations are verified.

## Key Rules
- **No Direct DB Writes without Audit**: Every single database update must be associated with an insert event written to the `audit_logs` table.
- **Fail-Safe Mutations**: If audit log creation fails, the mutation transaction must roll back completely.
- **Strict Role Boundaries**: Enforce Editor constraints on configurations, blocking unauthorized writers.
