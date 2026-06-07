# Test Strategy

## Required Commands

Run for implementation phases:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run E2E when browser-visible behavior, admin access, i18n, SEO, quote capture, settings, Gemini AI, Docker runtime, or responsive behavior changes:

```bash
pnpm test:e2e
```

Docker phases should additionally run or document:

```bash
docker compose up app
docker compose run --rm app pnpm test
```

## Current Test Baseline

- `tests/unit/quote-schema.test.ts`
- `tests/unit/product-filter.test.ts`
- `tests/e2e/public-admin.spec.ts`

These currently cover prototype behavior and must be updated as Supabase integration replaces mock data.

## Phase Matrix

| Phase | Unit | Integration | E2E | Additional evidence |
| --- | --- | --- | --- | --- |
| 01 | Env validation, Supabase helper config, Gemini settings validation | Migration/RPC existence check where possible | Docker app smoke if UI starts | Docker commands, Supabase local/remote connection note |
| 02 | Query validation and mappers | Public RPC/server helper tests | Public route smoke | Sitemap/robots review |
| 03 | Quote schema, rate limit, honeypot | `submit_quote_request`, notification tracking | Submit quote flow | Privacy/security response checks |
| 04 | Session/role helper tests | Supabase Auth/profile guard tests | Login/logout/editor denial | RLS policy verification |
| 05 | Admin mappers | Admin read query tests | Admin list/detail smoke | No mock-data assertions |
| 06 | Mutation schema tests | CRUD/archive/audit write tests | Representative admin write flows | Audit log evidence |
| 07 | Cloudinary/Resend/Maps/Gemini validators | Service-boundary tests with mocks | Media or AI smoke where visible | Secret exposure review |
| 08 | Seed conversion helpers | Seed/migration checks | Public/admin smoke on seeded data | Mock import scan |
| 09 | Settings/users/media/AI helpers | Gemini settings RBAC, masking, rotation | Admin Settings and AI assistant flows | Editor denial and fallback behavior |
| 10 | Regression tests | Full integration suite | Full Playwright suite | Security, SEO, performance, Docker, launch readiness |

## Required Security Tests

- Anonymous users cannot access admin APIs.
- Editors cannot access quote requests, users, privileged settings, integration secrets, or Gemini settings.
- Supabase service role key is never imported into client code.
- Gemini key is never returned raw after save.
- Secret changes write `audit_logs`.
- Public quote responses contain no internal IDs, admin notes, notification errors, stack traces, or provider details.

## Required Gemini Tests

- Admin can save/update Gemini settings.
- Saved key is masked in UI/API responses.
- Invalid key/config returns safe validation error.
- Editor cannot read/update Gemini settings.
- AI draft endpoint works with mocked Gemini client.
- Missing/disabled Gemini config returns `AI_UNAVAILABLE` or equivalent safe state.

## Required Docker Tests

- `docker compose up app` starts the app.
- App container can reach the configured Supabase local or remote URL.
- Document whether migrations were applied through Supabase CLI, remote project, or Postgres-only smoke.
- Host Playwright can reach the containerized app at `http://127.0.0.1:3000` when E2E is run outside the container.
