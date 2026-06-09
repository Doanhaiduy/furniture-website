# Phase 10 Testing - QA Hardening & Launch Preparation

Phase 10 uses Browser MCP as the primary launch QA tool for end-to-end user journeys, exploratory testing, responsive validation, visible debugging, screenshots, and defect confirmation.

Playwright is retained as release backup for CI/headless deterministic regression, cross-browser automation, traces, and accessibility scripts that Browser MCP cannot cover directly.

## Test Levels

- **Unit**: Vitest verifies optimization hooks, validators, and helper logic.
- **Integration**: Tests cover security rules, database RLS/RPCs, service boundaries, and backups.
- **Browser MCP launch pass**: Full visitor and admin journey validation in a real browser session.
- **Playwright backup**: CI/headless suite for repeatable release gates only.
- **Manual/device checks**: Physical browsers/devices where Browser MCP or Playwright cannot represent the target.

## Scenario 1: Browser MCP Launch User Flows

- **Goal**: Validate core launch journeys through the real browser.
- **Preconditions**: Production-like build/server and seeded data are available.
- **Browser MCP steps**:
  1. Open `/vi` and inspect first viewport.
  2. Navigate product catalog, apply filters/search, and open a product detail page.
  3. Submit a quote request and verify success state.
  4. Log in as Editor and verify privileged areas are denied.
  5. Log in as Admin and verify quote/settings/users access.
  6. Switch locale on public routes and verify equivalent route behavior.
  7. Capture screenshots for critical journeys and responsive breakpoints.
  8. Check console/network logs for unexplained UI failures.
- **Expected result**: Public and admin journeys pass without critical defects.
- **Pass/fail**:
  - Pass: launch-critical flows complete and evidence is recorded.
  - Fail: critical route, role, form, or layout defect remains.
- **Playwright backup**: Run `pnpm test:e2e` only as CI/headless regression backup after Browser MCP evidence or when release policy requires a deterministic suite.

## Scenario 2: Accessibility And Interaction Audit

- **Goal**: Confirm critical interactions are accessible and visible states are understandable.
- **Browser MCP steps**:
  1. Inspect public and admin forms with visible labels and keyboard-reachable controls.
  2. Verify buttons, inputs, tabs, menus, dialogs, and upload controls have clear names/states.
  3. Capture screenshots for contrast/layout concerns.
  4. Use automated accessibility tooling only where available and needed.
- **Expected result**: No critical accessibility blocker remains.
- **Playwright backup**: Use axe/Playwright accessibility scripts only when deterministic automated reports are required.

## Scenario 3: Database Restore Verification

- **Goal**: Confirm backup and restore path works.
- **Steps**:
  1. Execute database backup with the approved command.
  2. Restore to a clean local database/container.
  3. Query seeded counts and representative Vietnamese content.
  4. Open restored app routes with Browser MCP if connected to the restored database.
- **Expected result**: Restore exits cleanly and data is intact.
- **Playwright backup**: Not needed unless a restored-route CI smoke is required.

## Scenario 4: Production Docker Build And Run

- **Goal**: Confirm production container can run and serve health/public routes.
- **Steps**:
  1. Build the production Docker image.
  2. Run the container with the production-like env file.
  3. Check logs for successful Next.js start.
  4. Open `/api/health` and `/vi` with Browser MCP.
  5. Verify visible health/public route state.
  6. Stop the container.
- **Expected result**: Production container serves health and public routes without critical errors.
- **Playwright backup**: Use only for CI container smoke regression.
