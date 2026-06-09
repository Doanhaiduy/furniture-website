# Phase 08 Testing - Data Migration & Seeding

Browser MCP is the primary tool for validating seeded content as users see it on public/admin pages. Playwright is backup only for CI/headless seeded-route regression.

## Test Levels

- **Unit**: Vitest checks media asset mapping and seed transformation helpers.
- **Integration**: Database checks validate seed idempotency, counts, constraints, and transaction logs.
- **Browser MCP journey checks**: Public/admin pages render seeded data correctly.
- **Code audit**: Search confirms production routes do not import prototype mocks.

## Scenario 1: Seed Script Idempotency

- **Goal**: Confirm seed runs are repeatable and do not duplicate records.
- **Steps**:
  1. Run database reset or approved seed command.
  2. Query product/category/blog/showroom counts.
  3. Re-run seed.
  4. Query counts again.
  5. Verify no duplicate rows or unique constraint errors.
- **Expected result**: Counts remain stable after repeated runs.
- **Playwright backup**: Not applicable.

## Scenario 2: Vietnamese Diacritics Integrity

- **Goal**: Confirm seeded Vietnamese content is not corrupted.
- **Steps**:
  1. Query representative Vietnamese fields.
  2. Confirm expected diacritics render correctly in database output.
  3. Open the relevant public route with Browser MCP.
  4. Inspect visible product/blog/showroom text.
- **Expected result**: Vietnamese text is readable in both database and browser.
- **Playwright backup**: Use only for CI seeded text regression.

## Scenario 3: Production Code Quarantine Audit

- **Goal**: Confirm production public/admin routes no longer rely on prototype mock data.
- **Steps**:
  1. Search for `lib/showroom-data.ts` imports.
  2. Confirm production `app/[locale]/` and `app/admin/` routes do not import it.
  3. Allow references only in tests or explicitly deprecated/demo files.
- **Expected result**: Production routes are database-backed or use documented empty states.
- **Playwright backup**: Not applicable.

## Scenario 4: Public Site Render Smoke

- **Goal**: Confirm seeded content appears in real user journeys.
- **Browser MCP steps**:
  1. Open `/vi`.
  2. Inspect featured products and page content.
  3. Click a product card.
  4. Verify detail content matches seeded specs/media.
  5. Check images render from seeded Cloudinary URL formats.
- **Expected result**: Seeded content is visible and navigable.
- **Playwright backup**: Use for CI seeded public route regression.
