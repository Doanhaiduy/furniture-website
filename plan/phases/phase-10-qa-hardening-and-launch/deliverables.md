# Phase 10 Deliverables – QA Hardening & Launch Preparation

## Concrete Expected Outputs
- **Browser MCP Launch Evidence**: Behavior-first validation notes for visitor flows, admin flows, responsive states, role access, quote submission, i18n, SEO-visible routes, and screenshots/snapshots where useful.
- **Playwright Backup Specs**: Optional `tests/e2e/**/*.spec.ts` scripts only for CI/headless deterministic regression gaps discovered during Browser MCP validation.
- **docs/operations-runbook.md**: Operational guide containing:
  - Database backup cron-job configurations and restore script verification instructions.
  - Sentry/monitoring integrations and alert thresholds.
  - Docker production build and container deployment steps.
- **Launch Readiness Report**: Summary report verifying that all functional and non-functional requirements are met.

## Affected Routes, Components, APIs, Tables, and Configurations
- **Routes**:
  - Exposing no new routes. Bug fixes are applied to existing routes based on QA outcomes.
- **Configurations**:
  - `playwright.config.ts` [MODIFY IF NEEDED] (Only for Playwright backup base URLs and test match parameters)
  - `Dockerfile` [MODIFY] (Add multi-stage build optimizations for production)
  - `supabase/config.toml` [MODIFY] (Check staging configurations)

## Future Touchpoints
- None. This is the final phase. Subsequent modifications are post-launch maintenance items.

## Verification Evidence Required
1. **Browser MCP launch evidence**: Notes, screenshots/snapshots, console/network findings, and pass/fail summaries for critical visitor/admin journeys.
2. **Playwright backup outputs**: HTML reports only when CI/headless deterministic regression is required.
3. **Lighthouse metrics reports**: Output confirming that performance, accessibility, SEO, and best practices scores are above 90.
4. **Docker compilation logs**: Run `docker build -t showroom-prod .` and verify the compile exits with code 0.
5. **Final Traceability Matrix**: Complete requirement mapping details in `docs/specs/traceability-matrix.md` with verification checks.
