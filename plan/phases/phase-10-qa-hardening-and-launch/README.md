# Phase 10 QA Hardening And Launch

## Objective

Run final verification and fix launch blockers across functionality, security, SEO, performance, Docker runtime, Supabase/RLS, Gemini settings, deployment, monitoring, backup, and support handoff.

## Why This Phase Exists

Earlier phases integrate features. This phase proves the system is safe and ready to operate.

## Requirement IDs

- All FR IDs
- All NFR IDs

## Real Scope

- Full command suite.
- Full E2E.
- Docker Compose smoke.
- Supabase migration/RLS/RPC verification.
- Security review.
- Gemini settings/secret review.
- SEO and sitemap/robots review.
- Performance and responsive checks.
- Browser matrix.
- Monitoring, backup, deployment documentation.

## Out Of Scope

- New feature scope.
- Ecommerce/mobile additions.
- Large redesigns unless required to fix critical bugs.

## Dependencies

- Phases 01-09 complete.
- Production/preview env configured.
- Launch content and Admin user bootstrap ready.

## Files/Folders Likely Impacted

- Bug-fix files discovered during QA.
- test files.
- deployment/operations docs.
- `docs/specs/traceability-matrix.md`.

## Implementation Tasks

1. Run and record the full verification matrix.
2. Fix high/critical defects found by lint, typecheck, tests, build, E2E, Docker smoke, security, SEO, performance, and responsive checks.
3. Verify Supabase migrations/RLS/RPCs in the selected launch environment.
4. Verify Gemini settings masking, rotation, fallback, and audit logging.
5. Document launch readiness, monitoring, backups, and rollback paths.

## Backend/Database Impacts

- Verify migrations current.
- Verify RLS policies protect private/admin data.
- Verify `audit_logs` and `ai_drafts` behavior.
- Verify quote notifications and media metadata.

## Frontend Impacts

- Public and admin pages must pass responsive, accessibility, browser, SEO, and performance checks.
- Placeholder states are allowed only when a feature is intentionally disabled and documented.
- Launch-critical user journeys must work in Docker/local and preview/production-like environments.

## Route/Page Mapping

- All public localized routes.
- All admin routes.
- API routes including quote, admin, settings, media, Gemini AI.

## Env/Config Needs

- Production/preview Supabase.
- Cloudinary.
- Resend.
- Gemini settings/secret storage.
- Docker local env for reproducibility.
- Monitoring/backup credentials where applicable.

## Security/RLS Considerations

- No raw Gemini key exposure.
- No service role key in client bundle.
- Editor denial for quotes/users/settings/Gemini secrets.
- Public pages expose published/public-safe data only.
- Robots excludes private/admin/draft routes.

## Testing Checklist

- `pnpm lint`, `typecheck`, `test`, `build`, `test:e2e`.
- Docker app smoke.
- Supabase RLS/security tests.
- Gemini settings masking/rotation/fallback tests.
- SEO metadata/sitemap/robots.
- Performance on launch-critical routes.
- Responsive/browser smoke.

## Acceptance Criteria / Definition Of Done

- All high/critical findings closed.
- Verification results documented.
- Monitoring owner/tool/channel documented.
- Backup/restore expectations documented.
- Launch readiness decision recorded.

## Rollback/Fallback Notes

- If Gemini fails at launch, disable AI generation while leaving manual content workflows operational.
- If Resend fails, quote persistence must continue and notifications can be retried.
- If Docker smoke fails, fix before handoff because Docker is a requirement.

## Risks/Unknowns

- Browser compatibility outside Playwright may require manual checks.
- Performance depends on production-like data and media sizes.
