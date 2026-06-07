# Phase 10 Handoff Prompt

## Instructions for Executing Agent
1. **Scope Boundary**: Read all files in `plan/phases/phase-10-qa-hardening-and-launch/` before commencing work. Execute only the scope defined for Phase 10. Do not implement new features, change database schemas, or add new page components.
2. **Context Alignment**: Focus entirely on quality assurance, security hardening, performance tuning, and launch preparation.
3. **Execution Instructions**:
   - Write and configure Playwright E2E tests files (`tests/e2e/**/*.spec.ts`).
   - Run Lighthouse audits on public routes and apply asset optimizations.
   - Run security and accessibility audits.
   - Document operations runbook `docs/operations-runbook.md` and verify database restore routines.
4. **Verifications**:
   - Run the full launch check command suite:
     ```bash
     pnpm lint
     pnpm typecheck
     pnpm test
     pnpm build
     pnpm test:e2e
     ```
5. **Marking Complete**: Ensure all tasks in `checklist.md` are marked complete, and record changes inside `docs/specs/traceability-matrix.md`.

## Key Rules
- **No Feature Creep**: Do not introduce any new visual layouts or features. Triage all QA findings and fix only critical launch regressions.
- **Strict Security Verification**: Confirm that all RLS policies are active, and no credentials or secrets are exposed in browser bundles.
- **Production Build Validation**: Ensure that the optimized production Docker build compiles successfully and serves the app locally.
