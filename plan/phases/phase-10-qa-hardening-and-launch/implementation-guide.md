# Phase 10 Implementation Guide – QA Hardening & Launch Preparation

## Implementation Order
1. **E2E Test Suites Setup**: Write Playwright test files.
2. **Performance Improvements**: Apply bundle checks, image compression parameters, and lazy loading.
3. **Accessibility Audit fixes**: Correct markup errors and contrast levels.
4. **Security Verification**: Inspect RLS rules, verify credential leaks, and review API authorization checks.
5. **Operational Guide Setup**: Write `docs/operations-runbook.md` and verify database restore routines.
6. **Launch Verification**: Run the final test commands to certify launch readiness.

---

## Route & Page Mapping
- This phase focuses on verification and hardening across all routes. No new route patterns are introduced.

---

## Backend, Frontend, and Database Impacts
- **Database**: All migrations are verified, indexes are optimized, and RLS rules are validated.
- **Backend (Next.js server)**: Runs inside optimized production Docker containers.
- **Frontend**: The user interface is polished, responsive on all devices, and WCAG compliant.

---

## Docker & Local Runtime Implications
- Confirm that the production `Dockerfile` uses multi-stage caching to optimize image sizes (e.g. keeping built image size under 300MB).
- Verify container networking starts and binds to ports cleanly under production compose profiles.

---

## Gemini Settings & API Secret Implications
- Confirm that Gemini API key rotation functions correctly and that log events are written to `audit_logs`.
- Verify the AI draft generator falls back gracefully if Gemini services fail during testing.

---

## Security & RLS Details
- RLS database policies must be strictly active on all tables.
- API route authorization handlers must reject requests if user sessions are invalid, returning `401 Unauthorized` or `403 Forbidden` codes.
- Check headers configuration to block clickjacking and cross-origin resource sharing (CORS) attacks.

---

## Edge Cases & Rollback/Fallback Considerations
- **Build Failures**: If Next.js static generation fails due to query timeouts, configure database connection settings or adjust Next.js fetch cache settings to prevent build halts.
- **Failed Deployments**: The deployment runbook must contain clear rollback instructions (e.g., reverting Vercel configurations or swapping back Docker containers to the previous version) to restore service immediately if issues arise.
- **Backup Verification**: Verify that a database backup file can be restored to a local Postgres container in less than 15 minutes, with no data corruption.

---

## Open Questions & Assumptions
- **Assumption**: Developers have credentials to configure staging/preview deployments to execute remote E2E tests.
- **Open Question**: Will we configure a Content Security Policy (CSP) header? We assume setting standard secure headers inside `next.config.ts` is sufficient for this launch phase.
