# Phase 05 Testing - Admin Read Integration

Browser MCP is the primary validation tool for admin read pages, pagination, filters, empty states, role visibility, and loading states. Playwright is backup only for deterministic CI seeded-data regression.

## Test Levels

- **Unit**: Vitest tests data mappers.
- **Integration**: Vitest tests server-side read queries.
- **Browser MCP journey checks**: Dashboard KPIs, admin lists, pagination, role-specific visibility, empty table layouts.
- **Data checks**: SQL/RPC checks validate the underlying counts where needed.

## Scenario 1: Dashboard KPI Rendering

- **Goal**: Confirm admin dashboard metrics read real database values and respect role visibility.
- **Browser MCP steps**:
  1. Log in as Admin.
  2. Open `/admin/dashboard`.
  3. Inspect KPI cards and widgets.
  4. Compare visible counts against the database query when needed.
  5. Log in as Editor and verify quote-related metrics are hidden.
- **Expected result**: Dashboard shows real allowed data for each role.
- **Pass/fail**:
  - Pass: counts and visibility match role permissions.
  - Fail: mock counts remain, private metrics leak to Editor, or widgets crash.
- **Playwright backup**: Use for CI seeded admin dashboard regression.

## Scenario 2: Paginated Table Navigation

- **Goal**: Confirm admin lists paginate through real data.
- **Browser MCP steps**:
  1. Open `/admin/products` as Admin with more than one page of data.
  2. Inspect row count and pagination controls.
  3. Click the visible Next control.
  4. Verify URL/page state and table rows update.
  5. Click Previous and verify return state.
- **Expected result**: Pagination changes data and URL state without layout breakage.
- **Playwright backup**: Use for deterministic CI pagination script.

## Scenario 3: Quote Request Access Block

- **Goal**: Confirm Editor cannot read quote requests through UI or API.
- **Browser MCP steps**:
  1. Log in as Editor.
  2. Open `/admin/quotes`.
  3. Verify access-denied UI or redirect.
  4. Check API response with Editor token separately if required.
- **Expected result**: Editor receives `403` or access-denied behavior and no quote data.
- **Playwright backup**: Use for full CI role/API matrix.

## Scenario 4: Empty Table Layout

- **Goal**: Confirm empty admin tables render safely.
- **Preconditions**: Test database has zero products or a filtered state returns zero rows.
- **Browser MCP steps**:
  1. Open `/admin/products`.
  2. Inspect table header and empty body.
  3. Verify localized empty-state text.
  4. Capture a screenshot if layout evidence is needed.
- **Expected result**: Page does not crash and empty state is clear.
- **Playwright backup**: Use only for CI empty-state regression.
