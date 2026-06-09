# Test Strategy

This execution plan follows the Browser MCP-first QA framework in `docs/qa/browser-mcp-first-testing.md`.

Browser MCP is the default for browser-visible validation, automation, debugging, exploratory testing, responsive checks, admin journeys, quote forms, locale switching, SEO-visible state, and user-flow evidence.

Playwright is backup only when Browser MCP cannot cover a scenario, or when a CI/headless/deterministic script is explicitly required.

## Required Commands

Run for implementation phases:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

When browser-visible behavior, admin access, i18n, SEO, quote capture, settings, Gemini AI, Docker runtime, or responsive behavior changes:

1. Start the app or use the approved environment URL.
2. Open the affected route with Browser MCP.
3. Inspect the current visible state.
4. Perform the affected user journey using natural language steps.
5. Verify the expected result using visible state, URL changes, persisted data, role-specific access, or safe error states.
6. Capture screenshot/snapshot evidence when useful.
7. Inspect console/network logs only when they help explain a failure.
8. Record whether Playwright backup was needed.

Use `pnpm test:e2e` only for Playwright backup when deterministic CI/headless coverage is needed.

Docker phases should additionally run or document:

```bash
docker compose up app
docker compose run --rm app pnpm test
```

## Current Test Baseline

- `tests/unit/quote-schema.test.ts`
- `tests/unit/product-filter.test.ts`
- `tests/e2e/public-admin.spec.ts`

The existing Playwright suite is retained as regression backup. It should not be the first-choice local UI validation path. As Supabase integration replaces mock data, Browser MCP journey checks should validate real user behavior first; Playwright scripts should be updated only for repeatable CI regression needs.

## Phase Matrix

| Phase | Unit | Integration | Browser MCP primary journey | Additional evidence | Playwright backup trigger |
| --- | --- | --- | --- | --- | --- |
| 01 | Env validation, Supabase helper config, Gemini settings validation | Migration/RPC existence check where possible | Open app/health route if UI starts; verify runtime visibly where relevant | Docker commands, Supabase local/remote connection note | CI container smoke script needed |
| 02 | Query validation and mappers | Public RPC/server helper tests | Public route smoke, locale switch, filters, sitemap-visible checks | Sitemap/robots review | Deterministic route matrix needed |
| 03 | Quote schema, rate limit, honeypot | `submit_quote_request`, notification tracking | Submit quote form, validation states, success/failure messages | Privacy/security response checks | Headless quote regression needed |
| 04 | Session/role helper tests | Supabase Auth/profile guard tests | Login/logout/editor denial/admin access using visible browser session | RLS policy verification | Full role matrix in CI needed |
| 05 | Admin mappers | Admin read query tests | Admin list/detail pages, pagination, role visibility | No mock-data assertions | Deterministic seeded admin regression needed |
| 06 | Mutation schema tests | CRUD/archive/audit write tests | Representative admin write/archive validation flows | Audit log evidence | CI CRUD script needed |
| 07 | Cloudinary/Resend/Maps/Gemini validators | Service-boundary tests with mocks | Upload UI, map fallback, email state visibility, AI draft visible fallback | Secret exposure review | File upload/mocked service CI script needed |
| 08 | Seed conversion helpers | Seed/migration checks | Public/admin smoke on seeded data | Mock import scan | Seeded full-route regression needed |
| 09 | Settings/users/media/AI helpers | Gemini settings RBAC, masking, rotation | Admin Settings, Users, Media, AI assistant, Editor denial | Masking and fallback evidence | Admin settings CI script needed |
| 10 | Regression tests | Full integration suite | Full Browser MCP exploratory/regression pass across launch journeys | Security, SEO, performance, Docker, launch readiness | Full Playwright suite for CI/headless release backup |

## Required Security Tests

- Anonymous users cannot access admin APIs.
- Editors cannot access quote requests, users, privileged settings, integration secrets, or Gemini settings.
- Supabase service role key is never imported into client code.
- Gemini key is never returned raw after save.
- Secret changes write `audit_logs`.
- Public quote responses contain no internal IDs, admin notes, notification errors, stack traces, or provider details.

Security UI and role behavior should be checked with Browser MCP first. Use Playwright backup only for a repeatable role matrix or CI enforcement.

## Required Gemini Tests

- Admin can save/update Gemini settings.
- Saved key is masked in UI/API responses.
- Invalid key/config returns safe validation error.
- Editor cannot read/update Gemini settings.
- AI draft endpoint works with mocked Gemini client.
- Missing/disabled Gemini config returns `AI_UNAVAILABLE` or equivalent safe state.

For CMS AI UI workflows, validate with Browser MCP first: open the admin page, inspect current state, trigger draft generation, verify loading/success/fallback states, capture screenshot/snapshot if useful, and note console/network errors only when relevant.

## Required Docker Tests

- `docker compose up app` starts the app.
- App container can reach the configured Supabase local or remote URL.
- Document whether migrations were applied through Supabase CLI, remote project, or Postgres-only smoke.
- Browser MCP can reach the containerized app at `http://127.0.0.1:3000` for UI validation.
- Playwright may reach the same URL only as backup for CI/headless regression.

## Browser MCP Evidence Format

For every UI-affecting phase completion, record:

- Route or URL opened.
- User role/session used.
- Viewport or device context.
- Natural-language steps performed.
- Expected result and actual result.
- Screenshot/snapshot reference when useful.
- Console/network notes for unexpected behavior.
- Playwright backup decision and reason, if used.
