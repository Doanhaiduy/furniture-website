# Test Plan

## Required Commands

Run for every implementation slice:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run when browser-visible behavior, admin access, i18n, SEO, responsive behavior, or quote capture changes:

```bash
pnpm test:e2e
```

## Test Matrix

| Test ID | Requirements | Level | Scenario | Expected Result |
| --- | --- | --- | --- | --- |
| TC-E2E-HOME-001 | FR-01, NFR-03 | E2E | Visit `/vi` and `/en` on desktop/mobile. | Company signal and both product groups are visible in first viewport. |
| TC-INT-ABOUT-001 | FR-02, FR-12-ADM | Integration | Render About page from Payload content in both locales. | Vision, mission, and capabilities come from CMS. |
| TC-INT-CMS-PROD-001 | FR-03, FR-12-ADM, NFR-05 | Integration | Create/update/archive product and category as Editor/Admin. | Allowed actions pass; unauthorized actions fail. |
| TC-INT-FILTER-001 | FR-04, NFR-01 | Integration/Performance | Apply category, price, and attribute filters to representative data. | Relevant results or empty state returns within 3 seconds. |
| TC-INT-SEARCH-001 | FR-05 | Integration | Search by localized keyword, brand/series, category, and reference code. | Relevant matches rank ahead of weak matches. |
| TC-INT-BLOG-001 | FR-06, NFR-06 | Integration | Manage blog categories/posts and render public slug route. | Localized slug, excerpt, body, cover image, SEO, and publish state work. |
| TC-UNIT-QUOTE-001 | FR-07-PUB, NFR-05 | Unit | Validate quote request schema. | Invalid/unsafe input rejected; valid input accepted. |
| TC-E2E-QUOTE-001 | FR-07-PUB, FR-07-ADM | E2E | Submit quote form and review in CMS as Admin. | Submission persists and Admin can find it. |
| TC-SEC-QUOTE-001 | FR-07-ADM, FR-10, NFR-05 | Security | Editor attempts to access quote requests. | Access is denied. |
| TC-E2E-SHOWROOM-001 | FR-08-PUB, NFR-03 | E2E | Visit showroom page. | Address, hotline, map embed, and fallback link render responsively. |
| TC-INT-SHOWROOM-001 | FR-08-ADM | Integration | Manage showroom records in Payload. | Authorized content users can manage publishable showroom content. |
| TC-E2E-SOCIAL-001 | FR-09 | E2E/Link | Use configured social links/share buttons. | URLs target correct platform/page/locale. |
| TC-SEC-RBAC-001 | FR-10, NFR-05 | Security/Integration | Verify Admin vs Editor collection permissions. | Option A permissions are enforced server-side. |
| TC-INT-AI-001 | FR-11, NFR-05 | Integration | Generate AI draft for eligible CMS content. | Draft is editable, not auto-published, and no private lead data is used. |
| TC-E2E-I18N-001 | FR-12-PUB | E2E | Switch language from equivalent public page. | Locale switches in one click and keeps equivalent route when available. |
| TC-INT-I18N-CMS-001 | FR-12-ADM | Integration | Save different `vi` and `en` fields. | Each locale persists and renders independently. |
| TC-PERF-001 | NFR-01 | Performance | Run Lighthouse/PageSpeed and route timing on launch-critical pages. | PageSpeed Mobile >= 80 and load target <= 3 seconds. |
| TC-OPS-001 | NFR-02 | Ops Review | Review monitoring setup for frontend and Payload health. | Uptime checks, alerts, and owner are documented. |
| TC-E2E-RESP-001 | NFR-03 | E2E | Test mobile/tablet/desktop primary flows. | No broken layout or content overlap. |
| TC-E2E-BROWSER-001 | NFR-04 | E2E/Manual | Browser smoke on Chrome, Edge, Firefox, Safari, Coc Coc. | No critical browser-specific defect. |
| TC-SEC-001 | NFR-05 | Security | Check validation, auth, upload safety, XSS, SQL injection, and secret exposure. | No critical issue remains. |
| TC-SEO-001 | NFR-06 | Unit/Integration/E2E | Validate metadata, canonical, alternates, sitemap, robots, and schema. | SEO checklist passes for implemented routes. |
| TC-ARCH-001 | NFR-07 | Review | Review each slice against module boundaries. | Slice fits Next.js/Payload/PostgreSQL/Cloudinary architecture. |

## Coverage Check

Every FR/NFR has at least one planned test in the matrix above. The traceability matrix maps each requirement to design and implementation areas.

## Evidence Required Per Slice

- Requirement IDs covered.
- Files changed.
- Tests added or updated.
- Verification commands and outcomes.
- E2E result or reason not run.
- Residual security, SEO, i18n, performance, or operations risks.
