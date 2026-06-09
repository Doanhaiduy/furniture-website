# Test Plan

This project uses a Browser MCP-first testing model. Browser MCP is the default method for web UI validation, user journey testing, browser debugging, responsive checks, form validation, login/admin flows, SEO-visible route checks, and exploratory QA.

Playwright is retained only as backup for scenarios that Browser MCP cannot cover, or when a deterministic CI/headless/code-level automation script is explicitly required.

Canonical reference: `docs/qa/browser-mcp-first-testing.md`.

## Required Commands

Run for every implementation slice:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

When browser-visible behavior, admin access, i18n, SEO, responsive behavior, or quote capture changes, run a Browser MCP journey check first:

1. Open the affected route in Browser MCP.
2. Inspect the current visible state.
3. Perform the user journey in natural language steps.
4. Verify the expected result through visible state, URL changes, persisted data, role-specific access, or safe error states.
5. Capture screenshot/snapshot evidence when useful.
6. Note console/network errors when they help explain a failure.

Use `pnpm test:e2e` only as a Playwright backup when a CI/headless/deterministic regression script is needed or Browser MCP cannot support the scenario.

## Test Matrix

| Test ID | Requirements | Primary Method | Scenario | Expected Result | Playwright Backup Trigger |
| --- | --- | --- | --- | --- | --- |
| TC-BROWSER-HOME-001 | FR-01, NFR-03 | Browser MCP | Visit `/vi` and `/en` on desktop/mobile. | Company signal and both product groups are visible without layout overlap. | CI viewport regression or pixel-stable script needed. |
| TC-INT-ABOUT-001 | FR-02, FR-12-ADM | Integration + Browser MCP | Render About page from CMS/Supabase content in both locales. | Vision, mission, and capabilities come from managed content. | Seeded content assertions must run in CI. |
| TC-INT-CMS-PROD-001 | FR-03, FR-12-ADM, NFR-05 | Integration + Browser MCP | Create/update/archive product and category as Editor/Admin. | Allowed actions pass; unauthorized actions fail. | Repeatable CRUD regression is required. |
| TC-INT-FILTER-001 | FR-04, NFR-01 | Integration + Browser MCP | Apply category, price, attribute, search, and sorting filters. | Relevant results or safe empty state render within target timing. | Deterministic performance/filter matrix required. |
| TC-INT-SEARCH-001 | FR-05 | Integration + Browser MCP | Search by localized keyword, brand/series, category, and reference code. | Relevant matches rank ahead of weak matches. | Seeded relevance regression required. |
| TC-INT-BLOG-001 | FR-06, NFR-06 | Integration + Browser MCP | Manage blog categories/posts and render public slug route. | Localized slug, excerpt, body, cover image, SEO, and publish state work. | CI route regression required. |
| TC-UNIT-QUOTE-001 | FR-07-PUB, NFR-05 | Vitest | Validate quote request schema. | Invalid/unsafe input rejected; valid input accepted. | Not applicable unless UI behavior is added. |
| TC-BROWSER-QUOTE-001 | FR-07-PUB, FR-07-ADM | Browser MCP | Submit quote form and review in CMS as Admin. | Submission persists and Admin can find it; user sees safe success state. | CI/headless quote regression required. |
| TC-SEC-QUOTE-001 | FR-07-ADM, FR-10, NFR-05 | Security + Browser MCP | Editor attempts to access quote requests. | Access is denied in UI and server-side. | Full scripted role matrix required. |
| TC-BROWSER-SHOWROOM-001 | FR-08-PUB, NFR-03 | Browser MCP | Visit showroom page. | Address, hotline, map embed, and fallback link render responsively. | Deterministic map fallback script required. |
| TC-INT-SHOWROOM-001 | FR-08-ADM | Integration + Browser MCP | Manage showroom records. | Authorized content users can manage publishable showroom content. | CI CRUD regression required. |
| TC-BROWSER-SOCIAL-001 | FR-09 | Browser MCP | Use configured social links/share buttons. | URLs target correct platform/page/locale. | Link audit across many routes required. |
| TC-SEC-RBAC-001 | FR-10, NFR-05 | Security + Browser MCP | Verify Admin vs Editor permissions. | Option A permissions are enforced server-side and visible in UI. | Full role matrix script required. |
| TC-INT-AI-001 | FR-11, NFR-05 | Integration + Browser MCP | Generate AI draft for eligible CMS content. | Draft is editable, not auto-published, and no private lead data is used. | Mocked AI deterministic script required. |
| TC-BROWSER-I18N-001 | FR-12-PUB | Browser MCP | Switch language from equivalent public page. | Locale switches in one click and keeps equivalent route when available. | CI route-switch regression required. |
| TC-INT-I18N-CMS-001 | FR-12-ADM | Integration + Browser MCP | Save different `vi` and `en` fields. | Each locale persists and renders independently. | Seeded locale regression required. |
| TC-PERF-001 | NFR-01 | Browser MCP + performance tooling | Check launch-critical pages. | PageSpeed Mobile target and local route timing evidence are recorded. | Lighthouse/CI performance budget required. |
| TC-OPS-001 | NFR-02 | Ops Review | Review monitoring setup for frontend and backend health. | Uptime checks, alerts, and owner are documented. | Not browser automation unless monitoring UI is validated. |
| TC-BROWSER-RESP-001 | NFR-03 | Browser MCP | Test mobile/tablet/desktop primary flows. | No broken layout, content overlap, or horizontal overflow. | Viewport matrix script required. |
| TC-BROWSER-COMPAT-001 | NFR-04 | Browser MCP | Browser smoke on Chrome, Edge, Firefox, Safari, and Coc Coc where available. | No critical browser-specific defect. | Automated Chromium/Firefox/WebKit matrix required. |
| TC-SEC-001 | NFR-05 | Security + Browser MCP | Check validation, auth, upload safety, XSS, SQL injection, and secret exposure. | No critical issue remains. | Repeatable security regression required. |
| TC-SEO-001 | NFR-06 | Browser MCP + Unit/Integration | Validate metadata, canonical, alternates, sitemap, robots, and schema. | SEO checklist passes for implemented routes. | Sitemap/schema parser needed in CI. |
| TC-ARCH-001 | NFR-07 | Review | Review each slice against module boundaries. | Slice fits Next.js/Supabase/PostgreSQL/Cloudinary architecture. | Not applicable. |

## Browser MCP Test Case Template

```markdown
## Test Case: <name>

- Requirement ID:
- Primary method: Browser MCP
- Playwright backup: <No / Yes, reason>

### Goal
<User behavior or quality signal being validated.>

### Preconditions
- Environment URL:
- User role/session:
- Seeded data:
- Viewport/device:

### Browser MCP Steps
1. Open `<route>`.
2. Inspect the current visible state.
3. Perform `<natural user action>`.
4. Verify `<expected visible result>`.
5. Capture screenshot/snapshot if useful.
6. Check console/network logs only if behavior is unexpected.

### Expected Result
<Visible, persisted, blocked, redirected, or returned outcome.>

### Pass/Fail Criteria
- Pass:
- Fail:

### Evidence
- Screenshot/snapshot:
- Console/network notes:
- Data/API notes:

### Fallback Policy
Use Playwright only if <specific limitation or CI need>.
```

## Coverage Check

Every FR/NFR has at least one planned validation path in the matrix above. Browser MCP is the primary path for UI/user journey evidence. Unit and integration tests cover code-level logic. Playwright backup covers CI/headless/deterministic gaps only.

## Evidence Required Per Slice

- Requirement IDs covered.
- Files changed.
- Unit/integration tests added or updated.
- Browser MCP journey evidence or reason not applicable.
- Screenshot/snapshot evidence when useful.
- Console/network notes for browser issues.
- Playwright backup result only when used, including the reason it was needed.
- Residual security, SEO, i18n, performance, or operations risks.
