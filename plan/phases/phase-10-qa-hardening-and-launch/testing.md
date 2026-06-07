# Phase 10 Testing – QA Hardening & Launch Preparation

## Test Levels & Frameworks
- **Unit Testing**: Vitest verification for optimization hooks.
- **Integration Testing**: Vitest testing for security rules and database RLS.
- **E2E Testing**: Complete Playwright tests covering all visitor and admin user flows.
- **Manual Verification**: Cross-browser validation (Chrome, Safari, Firefox, Edge) and mobile testing.

---

## Concrete Scenarios & Verification Steps

### Scenario 1: Playwright E2E User Flows Verification
1. Run Playwright E2E test scripts:
   ```bash
   pnpm test:e2e
   ```
2. Verify that:
   - All tests execute and pass without timing out.
   - Public pages load, categories can be filtered, and search inputs function.
   - Submitting a quote request creates a database record, triggers an email, and displays a success modal.
   - The admin panel restricts Editor access to Settings while allowing Admin access.

### Scenario 2: Accessibility WCAG Audit (axe-core Check)
1. Run axe-core tests on public routes: `pnpm test:e2e --project=accessibility`.
2. Verify that:
   - The test run returns zero critical violations.
   - All interactive elements (e.g. form inputs, buttons, sliders) contain accessible labels.
   - Color contrast ratios on text blocks satisfy WCAG 2.1 AA standards (minimum 4.5:1 ratio).

### Scenario 3: Database Restore Verification (Backup Fallback)
1. Execute database backup:
   ```bash
   pg_dump -U postgres -d furniture_showroom > backup_test.sql
   ```
2. Start a clean local Postgres container on port `5433`.
3. Execute database restore:
   ```bash
   psql -U postgres -h localhost -p 5433 -d postgres -f backup_test.sql
   ```
4. Verify that:
   - The restore exits with code 0.
   - A query on the new database instance returns the correct seeded counts.
   - All Vietnamese character sets are restored correctly.

### Scenario 4: Production Docker Build & Run
1. Run the production Docker build:
   ```bash
   docker build -t showroom-prod .
   ```
2. Start the container mapping port `3000:3000`:
   ```bash
   docker run -d -p 3000:3000 --env-file .env.production showroom-prod
   ```
3. Run container logs to confirm the Next.js production server starts successfully.
4. Execute `curl -i http://localhost:3000/api/health` and verify the response is `200 OK`.
5. Terminate the container.
