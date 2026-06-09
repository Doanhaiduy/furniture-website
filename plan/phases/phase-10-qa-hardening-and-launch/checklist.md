# Phase 10 Checklist – QA Hardening & Launch Preparation

## 1. Browser MCP Launch Journey Suite
- [ ] Complete Browser MCP visitor-flow validation (homepage renders, language switching, product searches, contact form submissions) with screenshot/snapshot evidence where useful.
- [ ] Complete Browser MCP admin-flow validation (Admin login actions, Editor page blocks, and settings access control) with role/session evidence.
- [ ] Add or update Playwright backup specs (`tests/e2e/**/*.spec.ts`) only for CI/headless deterministic regression gaps discovered during Browser MCP validation.
- [ ] If release policy requires CI backup, execute `docker compose exec app pnpm test:e2e` and record that it was used as Playwright backup.

## 2. Performance & Accessibility Optimizations
- [ ] Run Lighthouse audits on critical public routes (Homepage, Products listing, Blog listing).
- [ ] Apply Cloudinary transform rules to optimize image formats (converting images to modern WebP or AVIF formats and defining responsive sizes).
- [ ] Analyze bundles: run Next.js build bundle analyzer to identify and optimize large packages.
- [ ] Run axe-core scanners on all public pages, resolving contrast errors, missing ALT tags, or incorrect ARIA properties.

## 3. Security Audits & RLS checks
- [ ] Verify that all tables in Supabase have Row Level Security (RLS) enabled.
- [ ] Run security test scripts using database roles, verifying:
  - Anonymous users are blocked from reading `profiles`, `quote_requests`, and `settings`.
  - Editor users are blocked from reading `settings` containing API keys.
- [ ] Run secret leak checks on all build packages, verifying that no keys (Resend keys, Gemini keys, database credentials) are exposed.

## 4. Operational Documentation
- [ ] Create `docs/operations-runbook.md` detailing deployment, backup, and restore routines.
- [ ] Write a script to automate database backups (`scripts/backup.ts`) and verify that a database restore completes successfully on a clean local instance.
- [ ] Set up error logging and alert channels (e.g. Sentry dashboard or Slack notifications) to capture production crash events.

## 5. Launch Readiness & Handoff
- [ ] Confirm all prior phase checklists are marked complete.
- [ ] Verify that all commands pass inside the production Docker build:
  ```bash
  pnpm lint
  pnpm typecheck
  pnpm test
  pnpm build
  ```
- [ ] Update `docs/specs/traceability-matrix.md` with final verification hashes.
- [ ] Complete and save the Launch Readiness Report.
