# Phase 10 Goals – QA Hardening & Launch Preparation

## Measurable Goals
- **Full Verification Suite**: Run the complete test suite (lint, typecheck, unit tests, build, and Playwright E2E) with a 100% pass rate.
- **Core Web Vitals**: Optimize public pages to meet Core Web Vitals targets:
  - Largest Contentful Paint (LCP) < 2.5s
  - Cumulative Layout Shift (CLS) < 0.1
  - First Input Delay (FID) < 100ms
- **WCAG 2.1 AA Compliance**: Pass accessibility audits for all public routes with zero critical violations.
- **Docker Production Ready**: Confirm that the production Docker build compiles successfully and serves the app locally on port `3000`.

## Phase Success Conditions
- Playwright E2E tests cover all visitor and admin user flows, including quote form submissions, localization toggles, sitemap crawls, and role access controls.
- Lighthouse performance audits yield scores above 90/100 on critical public routes (Homepage, Products listing, Blog directory).
- All RLS database policies are verified using test roles, ensuring that private data is not exposed to unauthorized users.
- Production environment configurations do not leak any secrets in browser bundles or public API responses.
- Active logging, monitoring, backup, and restore routines are fully documented and operational.

## Concrete Results
- Playwright E2E tests files (`tests/e2e/**/*.spec.ts`) covering all key user flows.
- Optimizations in Next.js bundle sizes and Cloudinary transformation formats.
- Verified Dockerfile production builds.
- Operations runbook (`docs/operations-runbook.md`) detailing monitoring, backups, and restore operations.
