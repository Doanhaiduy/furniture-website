# Phase 09 Handoff Prompt

## Instructions for Executing Agent
1. **Scope Boundary**: Read all files in `plan/phases/phase-09-missing-admin-sections/` before commencing work. Execute only the scope defined for Phase 09. Do not modify public sitemaps, write deploy configurations, or execute final performance optimization.
2. **Context Alignment**: Complete the admin user manager, settings configurations tabs, and blog/product form AI drafting assistants.
3. **Execution Instructions**:
   - Write crypto helper `lib/security/encrypt.ts` and masking utility `lib/security/mask.ts`.
   - Build Admin Settings interface at `app/admin/settings/page.tsx` and secure backend route handlers.
   - Build User management list and role toggles at `app/admin/users/page.tsx`.
   - Connect the AI draft triggers inside blog and product edit screens saving outputs inside `ai_drafts` table.
4. **Verifications**:
   - Run the full verification checklist:
     ```bash
     pnpm lint
     pnpm typecheck
     pnpm test
     pnpm build
     ```
   - Run Browser MCP journey checks for Settings, Users, Media, Gemini masking/rotation, Editor denial, and AI assistant fallback flows.
   - Use `pnpm test:e2e` only as Playwright backup for deterministic CI admin matrix scripts or unsupported Browser MCP scenarios.
5. **Marking Complete**: Ensure all tasks in `checklist.md` are marked complete, and record changes inside `docs/specs/traceability-matrix.md`. Do not start Phase 10 until all admin sections are functional.

## Key Rules
- **Enforce Masking on GET**: Raw credentials must be encrypted at rest and never returned in settings queries.
- **Strict Role Boundaries**: Enforce Editor constraints server-side, blocking unauthorized users from access to settings and user manager dashboards.
- **Audit Settings Mutations**: Every single modification to user metadata or configurations must write logs to the `audit_logs` table.
