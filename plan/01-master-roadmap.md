# Master Roadmap

## Execution Principle

The frontend and database schema already exist. The remaining work is integration, security, operations, and launch readiness. The roadmap must not restart the project or replace the current admin prototype with a new unrelated backend. It should wire the existing Next.js app to Supabase, harden access control, add Docker runtime support, complete integrations, and verify launch readiness.

## Critical Path

1. Phase 01 Runtime, Supabase, Docker, and Gemini Settings Foundation
2. Phase 02 Public Data Integration
3. Phase 03 Quote Flow and Notifications
4. Phase 04 Supabase Auth and Admin Access
5. Phase 05 Admin Read Integration
6. Phase 06 Admin Write Integration and Audit Logging
7. Phase 07 Media, Email, Maps, and Gemini Service Layer
8. Phase 08 Data Migration and Seeding
9. Phase 09 Admin Settings, Users, Media, and AI Assistant Completion
10. Phase 10 QA, Hardening, Deployment, and Launch

## Milestones

| Milestone | Phases | Outcome |
| --- | --- | --- |
| Runtime and backend foundation | 01 | Docker Compose dev path, Supabase helpers, env strategy, migrations validated, Gemini settings schema planned/added. |
| Public site integration | 02-03 | Public routes read Supabase data and quote submissions persist with notification tracking. |
| Admin governance | 04-06 | Supabase Auth, RLS-aware server guards, admin reads, admin writes, and audit logs are wired. |
| Services and admin completion | 07-09 | Cloudinary, Resend, Google Maps, Gemini, Admin Settings, users, media, and AI assistant are functional. |
| Launch readiness | 10 | Full verification, security, SEO, performance, Docker, deployment, monitoring, and backup checks pass. |

## Phase Dependencies

| Phase | Depends on | Blocks |
| --- | --- | --- |
| 01 Runtime/Supabase/Docker/Gemini foundation | Repo audits, migrations, current env/package state | All later phases |
| 02 Public data integration | Phase 01 Supabase helpers and data shape | Phase 03 |
| 03 Quote flow and notifications | Phase 01 helpers and Phase 02 mapping patterns | Phase 04 |
| 04 Auth and admin access | Phase 01 Supabase Auth strategy | Phase 05 and all protected admin work |
| 05 Admin read integration | Phase 04 server-side guards | Phase 06 |
| 06 Admin write integration and audit logging | Phase 05 read contracts and Phase 04 RBAC | Phase 07-09 |
| 07 Media/email/maps/Gemini service layer | Phase 06 mutation and audit patterns | Phase 08-09 |
| 08 Data migration and seeding | Phase 02-07 contracts | Phase 09 |
| 09 Admin section completion | Phase 04-08 | Phase 10 |
| 10 QA and launch | All prior phases | Production launch |

## Parallelizable Work

Only after Phase 01 is complete:

- Content/media mapping for Phase 08 can begin once public/admin data contracts are stable.
- Cloudinary and Resend service helpers can be developed in parallel with admin writes if the audit logging contract is already clear.
- Admin media, users, settings, and AI assistant sections can be split after auth and mutation patterns are proven.

## Definition Of Done Per Phase

Every implementation phase must report:

- Requirement IDs covered.
- Files changed.
- Supabase tables/RPCs/RLS policies touched or depended on.
- Docker/runtime impact.
- Env/config impact.
- Security and RLS checks.
- Tests added or updated.
- Verification commands and outcomes.
- Browser MCP journey evidence for browser-visible changes, or reason not applicable.
- Playwright backup result only when Browser MCP cannot cover the scenario or CI/headless/deterministic regression is required.
- Traceability update in `docs/specs/traceability-matrix.md`.

Default commands:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run Browser MCP journey checks for browser-visible, admin access, i18n, SEO, quote, settings, Gemini, Docker-smoke, or responsive behavior changes.

Use Playwright backup only when Browser MCP cannot cover the scenario or CI/headless/deterministic regression is required:

```bash
pnpm test:e2e
```

## Exit Checkpoints

| Checkpoint | Required evidence |
| --- | --- |
| After Phase 01 | Docker Compose plan implemented or blocker documented; Supabase env and migration path validated; server-only helper boundary exists; Gemini settings storage decision is implemented or migration-ready. |
| After Phase 02 | Public home/products/blog/showrooms/sitemap/robots no longer use production mock reads. |
| After Phase 03 | `/api/contact` persists through `submit_quote_request` or equivalent, queues/tracks notifications, and leaks no private lead data. |
| After Phase 04 | Supabase session and Role Model A are enforced server-side for `/admin`. |
| After Phase 06 | Admin CRUD/mutations persist and write `audit_logs` for privileged operations. |
| After Phase 07 | Cloudinary, Resend, Maps validation, and Gemini service boundaries exist with server-only secrets. |
| After Phase 09 | Admin Settings includes Admin-only masked Gemini configuration and AI assistant fallback behavior. |
| After Phase 10 | Launch checks pass with Docker/local runtime, monitoring, backup, deployment, and residual risk evidence. |
