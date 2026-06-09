# Phase 04 Testing - Authentication & Admin Access Control

Browser MCP is the primary tool for login flows, redirects, role-specific navigation, access-denied pages, session refresh visibility, and browser-cookie debugging. Playwright is backup only for deterministic CI role matrices.

## Test Levels

- **Unit**: Vitest tests role matching and access helper logic.
- **Integration**: Vitest tests server route helpers such as `requireAdmin` and `requireEditorOrAdmin`.
- **Browser MCP journey checks**: Anonymous redirects, Editor denial, Admin access, session behavior.
- **Security checks**: Server/API/RLS verification for protected resources.

## Scenario 1: Anonymous Access Block

- **Goal**: Confirm unauthenticated users cannot access admin routes.
- **Browser MCP steps**:
  1. Open `/admin/dashboard` in a clean or logged-out browser state.
  2. Inspect the current visible state and URL.
  3. Verify redirect to `/admin/login` with redirect intent preserved.
- **Expected result**: Anonymous access is blocked and redirected safely.
- **Pass/fail**:
  - Pass: login page appears and redirect target is preserved.
  - Fail: dashboard is visible or redirect target is lost.
- **Playwright backup**: Use for CI auth redirect regression.

## Scenario 2: Editor Access Restrictions

- **Goal**: Confirm Editor can manage publishable content only.
- **Browser MCP steps**:
  1. Log in as an Editor profile.
  2. Inspect the dashboard and sidebar.
  3. Verify Quotes, Users, and Settings links are hidden or inaccessible.
  4. Open `/admin/quotes` directly.
  5. Verify redirect or access-denied page appears.
- **Expected result**: Editor is denied privileged surfaces in UI and route handling.
- **Pass/fail**:
  - Pass: privileged areas are unavailable and direct navigation is blocked.
  - Fail: Editor can view quotes/users/settings or privileged data.
- **Playwright backup**: Use for automated role matrix in CI.

## Scenario 3: Admin Global Access

- **Goal**: Confirm Admin can access all admin sections.
- **Browser MCP steps**:
  1. Log in as an Admin profile.
  2. Inspect the dashboard and sidebar.
  3. Verify all expected navigation links are visible.
  4. Open `/admin/quotes`.
  5. Verify the page loads without redirect.
- **Expected result**: Admin has full access.
- **Playwright backup**: Use only for CI role regression.

## Scenario 4: Session Refresh Check

- **Goal**: Confirm active refresh session keeps Admin authenticated.
- **Browser MCP steps**:
  1. Log in as Admin.
  2. Inspect current URL and visible role/session state.
  3. Refresh the page after token refresh conditions are simulated.
  4. Verify the user remains authenticated.
  5. Check console/network logs if refresh fails.
- **Expected result**: Session refresh is seamless and secure.
- **Playwright backup**: Use only if deterministic token-expiry automation is required.
