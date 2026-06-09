# Phase 03 Handoff Prompt

## Instructions for Executing Agent
1. **Scope Boundary**: Read all files in `plan/phases/phase-03-quote-flow/` before commencing work. Execute only the scope defined for Phase 03. Do not implement admin login screens, session controls, product CRUD forms, or Gemini generation widgets.
2. **Context Alignment**: Wire form submissions to the custom `/api/contact` API endpoint. Use the `submit_quote_request(payload jsonb)` database RPC for database persistence.
3. **Execution Instructions**:
   - Embed the honeypot field inside `components/showroom/quote-form.tsx`.
   - Update the `/api/contact` Route Handler to execute rate-limits, honeypots, Zod schemas, and database RPC triggers.
   - Configure the Resend client helper and template dispatches.
   - Write transaction details inside the `quote_notifications` table.
4. **Verifications**:
   - Run the full verification checklist:
     ```bash
     pnpm lint
     pnpm typecheck
     pnpm test
     pnpm build
     ```
   - Run Browser MCP journey checks for quote form validation, safe success/failure messages, rate-limit UX, and admin lead visibility where in scope.
   - Use `pnpm test:e2e` only as Playwright backup for CI/headless quote-flow regression or unsupported Browser MCP scenarios.
5. **Marking Complete**: Ensure all tasks in `checklist.md` are marked complete, and record changes inside `docs/specs/traceability-matrix.md`. Do not start Phase 04 until public lead submissions successfully persist.

## Key Rules
- **No Private Data Leaks**: Database UUIDs, system stack logs, and notifications delivery error fields must never be returned in client-facing API responses.
- **Fail-Safe Email Dispatch**: Outgoing email dispatch failures must not cancel or roll back database persistence transactions.
- **Strict Rate Limiting**: Ensure rate-limiting rules are enabled on server routes to prevent malicious query runs.
