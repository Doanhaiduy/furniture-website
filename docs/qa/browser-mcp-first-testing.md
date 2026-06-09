# Browser MCP-First QA Framework

## 1. Executive Summary

Browser MCP is the default tool for web application testing, browser automation, debugging, validation, exploratory testing, and user journey verification in this project.

The default QA workflow is no longer "write an E2E script first." The default workflow is:

1. Open the real application in the Browser MCP-controlled browser.
2. Inspect the current visible state.
3. Perform user actions in natural language order.
4. Verify visible results, URL changes, form states, network/console signals, and screenshots when useful.
5. Record evidence and defects in behavior-oriented language.

Playwright remains available only as a backup or supporting tool when:

- Browser MCP cannot support the scenario.
- A code-level automation script is required.
- CI, headless, deterministic repeatability, traces, or cross-browser matrix automation is explicitly required.

## 2. Mindset Shift

| Old habit | Browser MCP-first replacement |
| --- | --- |
| Generate Playwright scripts by default. | Drive the real browser through Browser MCP first. |
| Start from selectors and DOM structure. | Start from user intent, visible UI, and expected behavior. |
| Treat CI/headless runs as the main validation path. | Treat visible/browser-session validation as the main local QA path; use CI scripts for regression backup. |
| Debug by writing reproduction scripts first. | Reproduce directly in the browser, inspect state, then decide whether a script is needed. |
| Verify implementation details first. | Verify user-visible results, security outcomes, role access, and persisted effects first. |

## 3. Browser MCP-First Test Plan

### Default Test Levels

- **Unit tests**: Use Vitest for pure functions, schemas, mappers, security helpers, and service boundaries.
- **Integration tests**: Use Vitest or direct local service checks for Supabase/PostgreSQL/RPC/API behavior.
- **Browser MCP journey checks**: Use Browser MCP for UI behavior, flows, forms, auth redirects, i18n, responsive inspection, SEO/browser-visible metadata, and exploratory QA.
- **Playwright backup**: Use Playwright only for CI/headless regression, deterministic code-level automation, or scenarios Browser MCP cannot cover.

### Required Commands Per Implementation Slice

Run for every implementation slice:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

When browser-visible behavior changes, run a Browser MCP journey check first. Record:

- Route or URL opened.
- User journey performed.
- Current visible state before and after actions.
- Expected result and actual result.
- Screenshot/snapshot evidence when useful.
- Console or network errors when relevant.
- Whether Playwright backup was needed, and why.

### Core Test Matrix

| Test ID | Requirements | Primary method | User scenario | Expected result | Playwright backup trigger |
| --- | --- | --- | --- | --- | --- |
| TC-BROWSER-HOME-001 | FR-01, NFR-03 | Browser MCP | Open `/vi` and `/en` on desktop/mobile viewports. | Brand signal, hero content, and product group entry points are visible without overlap. | Need CI viewport regression or pixel-stable script. |
| TC-INT-ABOUT-001 | FR-02, FR-12-ADM | Integration + Browser MCP | Render About content in both locales. | Vision, mission, and capabilities come from CMS/Supabase-backed content. | Need scripted seeded-data assertions. |
| TC-INT-CMS-PROD-001 | FR-03, FR-12-ADM, NFR-05 | Integration + Browser MCP | Create/update/archive product/category as permitted roles. | Allowed actions pass; unauthorized actions fail visibly and server-side. | Need repeatable CI CRUD flow. |
| TC-INT-FILTER-001 | FR-04, NFR-01 | Integration + Browser MCP | Apply product category, price, search, and sorting filters. | Results update, URL state persists, empty states are safe. | Need deterministic performance thresholds in CI. |
| TC-INT-SEARCH-001 | FR-05 | Integration + Browser MCP | Search by localized keyword, category, brand/series, or reference code. | Relevant matches appear ahead of weak matches. | Need seeded relevance regression. |
| TC-INT-BLOG-001 | FR-06, NFR-06 | Integration + Browser MCP | Open blog list/detail in both locales. | Localized slug, excerpt, body, image, SEO, and publish state work. | Need CI route regression. |
| TC-UNIT-QUOTE-001 | FR-07-PUB, NFR-05 | Vitest | Validate quote request schema. | Invalid input rejected; valid input accepted. | Not applicable unless UI regression is required. |
| TC-BROWSER-QUOTE-001 | FR-07-PUB, FR-07-ADM | Browser MCP | Submit quote form and verify admin lead visibility as Admin. | Submission persists and Admin can find it; user sees safe success state. | Need CI headless quote regression. |
| TC-SEC-QUOTE-001 | FR-07-ADM, FR-10, NFR-05 | Security + Browser MCP | Editor attempts to view quote requests. | Access is denied in UI and server response. | Need scripted role matrix. |
| TC-BROWSER-SHOWROOM-001 | FR-08-PUB, NFR-03 | Browser MCP | Open showroom page and inspect address, hotline, map embed, fallback link. | Active showrooms render responsively with safe map behavior. | Need deterministic map fallback script. |
| TC-INT-SHOWROOM-001 | FR-08-ADM | Integration + Browser MCP | Manage showroom records as authorized role. | Publishable showroom content can be managed; inactive records are hidden publicly. | Need CI CRUD regression. |
| TC-BROWSER-SOCIAL-001 | FR-09 | Browser MCP | Use social links/share buttons. | URLs target correct official platform/page/locale. | Need link audit script across many routes. |
| TC-SEC-RBAC-001 | FR-10, NFR-05 | Security + Browser MCP | Verify Admin vs Editor permissions. | Role Model Option A is enforced server-side and visibly. | Need full role matrix in CI. |
| TC-INT-AI-001 | FR-11, NFR-05 | Integration + Browser MCP | Generate an AI draft for eligible CMS content. | Draft is editable, not auto-published, and uses no private lead data. | Need mocked AI deterministic automation. |
| TC-BROWSER-I18N-001 | FR-12-PUB | Browser MCP | Switch language from an equivalent public page. | Locale changes in one clear action and keeps equivalent route when available. | Need CI route-switch regression. |
| TC-INT-I18N-CMS-001 | FR-12-ADM | Integration + Browser MCP | Save different `vi` and `en` fields. | Each locale persists and renders independently. | Need deterministic seeded content script. |
| TC-PERF-001 | NFR-01 | Browser MCP + performance tooling | Inspect launch-critical routes. | User-visible load remains acceptable; formal PageSpeed target is documented. | Need Lighthouse/CI performance budget. |
| TC-OPS-001 | NFR-02 | Ops review | Review monitoring and health routes. | Uptime checks, alert owner, and health endpoints are documented. | Not browser automation unless dashboard UI is validated. |
| TC-BROWSER-RESP-001 | NFR-03 | Browser MCP | Inspect mobile/tablet/desktop primary flows. | No broken layout, overlap, unreadable text, or horizontal overflow. | Need viewport matrix script. |
| TC-BROWSER-COMPAT-001 | NFR-04 | Browser MCP | Smoke supported browsers and device-like viewports where available. | No critical browser-specific defect remains. | Need automated Chromium/Firefox/WebKit matrix. |
| TC-SEC-001 | NFR-05 | Security + Browser MCP | Check validation, auth, uploads, XSS, SQL injection, and secret exposure surfaces. | No critical issue remains. | Need repeatable security regression. |
| TC-SEO-001 | NFR-06 | Browser MCP + integration | Validate metadata, canonical, alternates, sitemap, robots, schema. | SEO checklist passes for implemented routes. | Need sitemap/schema CI parser. |
| TC-ARCH-001 | NFR-07 | Review | Review slice against module boundaries. | Slice fits governed Next.js/Supabase/PostgreSQL/Cloudinary architecture. | Not browser automation. |

## 4. Browser MCP-First Test Strategy

### Default Browser MCP Workflow

For every UI-affecting task, the agent or QA engineer should:

1. Start the local app or use the provided environment URL.
2. Open the target route in Browser MCP.
3. Capture the initial visible state with a DOM snapshot or screenshot.
4. Perform the journey like a real user:
   - click visible controls,
   - type into labeled fields,
   - navigate using links/buttons,
   - switch locale or roles where required.
5. Validate the result through authoritative signals:
   - visible success/error state,
   - URL/path/query state,
   - enabled/disabled controls,
   - role-specific navigation,
   - persisted data visible after reload,
   - safe API error behavior if inspected.
6. Capture a screenshot/snapshot when layout, visual state, or evidence matters.
7. Check browser console logs or network failures if the UI behaves unexpectedly.
8. Document pass/fail and whether a Playwright backup is needed.

### Evidence Standard

Each Browser MCP check should produce enough evidence for another person to understand what happened:

- Environment URL and viewport/device context.
- Login role used, if any.
- Data preconditions.
- Natural-language journey steps.
- Expected result.
- Actual result.
- Screenshot/snapshot path or note.
- Console/network notes if relevant.
- Fallback decision.

## 5. Skill / Agent Instructions

Use a Browser MCP QA skill whenever the user asks to test a web app, validate UI, inspect a login flow, check a form, validate checkout-like journeys, perform light scraping, debug browser behavior, or verify a user journey.

Agent behavior:

1. Prefer Browser MCP before Playwright.
2. Use the existing browser session when useful, especially for authenticated flows.
3. Keep the browser visible only when the user wants to watch or interact.
4. Before acting, inspect the current page state.
5. Use natural-language user actions and visible labels as the guide.
6. After every meaningful action, verify the new state.
7. Capture screenshots/snapshots for defects, responsive checks, visual regressions, or final evidence.
8. Inspect console/network logs only when they help explain behavior.
9. Escalate to Playwright only when Browser MCP is insufficient or a repeatable CI/headless script is required.

Avoid these old defaults:

- "Generate Playwright scripts by default."
- "Use the test runner first."
- "Start with selectors."
- "Verify the DOM implementation before the user outcome."

## 6. QA Checklist And Test Case Template

### QA Checklist

- [ ] Requirement ID is identified.
- [ ] Target environment and URL are known.
- [ ] Test data and user role are known.
- [ ] Browser MCP is used as the primary UI validation method.
- [ ] Initial visible state is inspected.
- [ ] User journey is performed in natural language order.
- [ ] Expected result is verified against visible/authoritative signals.
- [ ] Screenshot or snapshot is captured when useful.
- [ ] Console/network errors are noted when relevant.
- [ ] Pass/fail decision is recorded.
- [ ] Playwright fallback is documented only if needed.

### Test Case Template

```markdown
## Test Case: <name>

- Requirement ID:
- Primary method: Browser MCP
- Playwright backup: <No / Yes, reason>

### Goal
<What user behavior or quality signal this validates.>

### Preconditions
- <Environment URL>
- <User role/session>
- <Seeded data or setup>
- <Viewport/device if relevant>

### Browser MCP Steps
1. Open `<route>`.
2. Inspect the current visible state.
3. Perform `<user action>`.
4. Verify `<expected visible result>`.
5. Capture screenshot/snapshot if evidence is needed.
6. Check console/network logs only if behavior is unexpected.

### Expected Result
<What should be visible, persisted, blocked, redirected, or returned.>

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

## 7. Decision Tree: Browser MCP Or Playwright Backup?

```text
Need to test web UI, form, login, route, responsive layout, admin workflow, SEO-visible state, or exploratory behavior?
  -> Use Browser MCP first.

Need to understand what the user sees right now?
  -> Use Browser MCP.

Need an authenticated existing browser session?
  -> Use Browser MCP.

Need visible debugging, screenshots, console logs, or quick reproduction?
  -> Use Browser MCP.

Does Browser MCP lack a required capability for the scenario?
  -> Use Playwright backup and document the limitation.

Need deterministic CI/headless regression, cross-browser matrix, traces, or repeated seeded assertions?
  -> Use Playwright backup.

Need code-level automation for many permutations or exact network mocking?
  -> Use Playwright backup.

Need pure function/schema/security helper validation?
  -> Use Vitest/integration tests, not Browser MCP or Playwright.
```

## 8. Troubleshooting

- **Page looks stale after code changes**: reload the Browser MCP tab and re-check the visible state.
- **Click does nothing**: inspect current state, verify the control is enabled/visible, then check console logs.
- **Hydration/client handlers fail**: compare dev server vs production build behavior and record console errors.
- **Login state is confusing**: inspect current URL, visible role badge/menu, and session-sensitive navigation before retrying.
- **Form submits but no visible result appears**: check validation messages, disabled state, network failures, and persisted data if applicable.
- **Layout issue is suspected**: capture screenshots at the relevant desktop/mobile viewport and check horizontal overflow visually.
- **Browser MCP cannot automate a required file upload, repeat matrix, or CI-only case**: use Playwright backup and explain why.

## 9. Best Practices

- Start from user intent, not selectors.
- Prefer visible labels, roles, and actual page copy for orientation.
- Use the cheapest evidence that proves the result; do not collect screenshots and snapshots repeatedly without purpose.
- Verify one authoritative signal first: success toast, redirect URL, saved value, role-specific menu, disabled button, or persisted row.
- Keep exploratory notes separate from regression requirements.
- Convert Browser MCP discoveries into Playwright scripts only when repeatability is valuable.
- Keep Playwright scripts behavior-focused when they are needed; avoid brittle implementation selectors.
- Do not use production customer data or secrets in browser testing.
- Record role, locale, and viewport for every meaningful Browser MCP check.

## 10. Daily Prompt Templates

### QA Smoke

```text
Use Browser MCP as the primary tool. Open <url>, inspect the current visible state, run the <journey> like a real user, verify the expected result, capture screenshots only where useful, and report pass/fail with console/network notes if relevant. Use Playwright only if Browser MCP cannot cover the scenario or a CI script is explicitly needed.
```

### Developer Validation

```text
Validate this UI change with Browser MCP first. Check the affected route, perform the user journey in natural language steps, verify visible behavior and route/state changes, and record evidence. Do not create Playwright scripts unless Browser MCP hits a limitation or this must become a CI regression.
```

### Defect Reproduction

```text
Reproduce the bug with Browser MCP in the real browser. Start from the provided URL, inspect the page, follow the user's steps, capture the actual failure state, check console/network logs if helpful, and summarize the shortest reliable reproduction. Only fall back to Playwright if a deterministic script is required.
```

### Regression Backup Request

```text
Create a Playwright backup only for the scenario already validated with Browser MCP: <scenario>. Keep the script behavior-focused, avoid brittle selectors, make it deterministic for CI, and document why Browser MCP evidence alone is not enough for this case.
```

## 11. Onboarding For New QA And Developers

1. Read this document first.
2. Learn the product flows: public catalog, product detail, blog, showroom, contact quote, admin dashboard, CMS content, settings, users, and AI assistant.
3. For UI work, validate with Browser MCP before writing or running Playwright.
4. Use Vitest for code-level logic and security helpers.
5. Use Playwright only as backup for CI/headless/deterministic automation.
6. Record evidence in behavior-first language: goal, preconditions, Browser MCP steps, expected result, pass/fail, fallback decision.
