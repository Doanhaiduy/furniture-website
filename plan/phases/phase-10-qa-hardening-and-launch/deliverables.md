# Phase 10 Deliverables – QA Hardening & Launch Preparation

## Concrete Expected Outputs
- **tests/e2e/auth.spec.ts**: Playwright scripts verifying login redirection and access restrictions.
- **tests/e2e/public-pages.spec.ts**: Playwright scripts verifying language switches, products filters, and quote form submits.
- **docs/operations-runbook.md**: Operational guide containing:
  - Database backup cron-job configurations and restore script verification instructions.
  - Sentry/monitoring integrations and alert thresholds.
  - Docker production build and container deployment steps.
- **Launch Readiness Report**: Summary report verifying that all functional and non-functional requirements are met.

## Affected Routes, Components, APIs, Tables, and Configurations
- **Routes**:
  - Exposing no new routes. Bug fixes are applied to existing routes based on QA outcomes.
- **Configurations**:
  - `playwright.config.ts` [MODIFY] (Verify base URLs and test match parameters)
  - `Dockerfile` [MODIFY] (Add multi-stage build optimizations for production)
  - `supabase/config.toml` [MODIFY] (Check staging configurations)

## Future Touchpoints
- None. This is the final phase. Subsequent modifications are post-launch maintenance items.

## Verification Evidence Required
1. **Playwright test outputs**: HTML reports showing 100% of test cases passing.
2. **Lighthouse metrics reports**: Output confirming that performance, accessibility, SEO, and best practices scores are above 90.
3. **Docker compilation logs**: Run `docker build -t showroom-prod .` and verify the compile exits with code 0.
4. **Final Traceability Matrix**: Complete requirement mapping details in `docs/specs/traceability-matrix.md` with verification checks.
