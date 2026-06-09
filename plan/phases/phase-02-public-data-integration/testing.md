# Phase 02 Testing - Public Data Integration

Browser MCP is the primary validation tool for public route behavior, locale switching, filters, sitemap-visible outcomes, and responsive inspection. Playwright is backup only for deterministic CI/headless route regression.

## Test Levels

- **Unit**: Vitest tests Zod filter schemas, mappers, and SEO helper logic.
- **Integration**: Vitest tests Supabase query helpers and localized mapper behavior.
- **Browser MCP journey checks**: Public pages, filters, language switching, detail routes, empty states, and sitemap/robots visibility.
- **Playwright backup**: Use only when a repeatable route matrix is required in CI.

## Scenario 1: Filter Validation And Edge Cases

- **Goal**: Confirm product query parameters are safe and predictable.
- **Steps**:
  1. Run `pnpm test tests/unit/product-filter.test.ts`.
  2. Verify valid filters parse correctly.
  3. Verify malicious sorting keys fall back safely.
  4. Verify invalid pages produce page 1 or a safe empty state.
- **Expected result**: Unit tests pass and unsafe inputs are rejected.
- **Playwright backup**: Not applicable unless browser filter behavior needs CI regression.

## Scenario 2: Dynamic Page Language Toggle

- **Goal**: Validate bilingual public content and equivalent route switching.
- **Preconditions**: App is running; public product data exists or empty states are expected.
- **Browser MCP steps**:
  1. Open `/vi/products`.
  2. Inspect the current product list or empty state.
  3. Use the visible language switcher to switch to English.
  4. Verify the URL changes to `/en/products`.
  5. Verify visible content and navigation language change coherently.
  6. Capture screenshot/snapshot if locale evidence is needed.
- **Expected result**: Locale switches in one user action and route/content remain coherent.
- **Pass/fail**:
  - Pass: route changes, content/localized shell updates, and no broken layout appears.
  - Fail: switcher loses route context, content remains in wrong locale, or route errors.
- **Playwright backup**: Use `pnpm test:e2e` only for CI route-switch regression.

## Scenario 3: XML Sitemap And Robots Visibility

- **Goal**: Confirm crawl outputs include public routes and exclude unpublished/private areas.
- **Browser MCP steps**:
  1. Open `/sitemap.xml`.
  2. Inspect visible XML content.
  3. Confirm localized public URLs appear.
  4. Open `/robots.txt`.
  5. Confirm `/admin/*` and `/api/*` are blocked where required.
- **Expected result**: Sitemap and robots are well formed and safe.
- **Pass/fail**:
  - Pass: active/published public URLs are present; private routes are excluded/blocked.
  - Fail: draft/inactive/admin/API routes are exposed incorrectly.
- **Playwright backup**: Use only for a CI XML parser/regression script.

## Scenario 4: 404 Route Resolution

- **Goal**: Confirm invalid product/blog slugs return a safe localized not-found state.
- **Browser MCP steps**:
  1. Open `/vi/products/non-existent-product-slug`.
  2. Inspect visible page state and URL.
  3. Verify the custom not-found layout appears and no stack trace is shown.
- **Expected result**: A proper not-found response renders safely.
- **Pass/fail**:
  - Pass: localized not-found page appears without crash.
  - Fail: route crashes, leaks error details, or returns unrelated content.
- **Playwright backup**: Use only for deterministic CI route status regression.
