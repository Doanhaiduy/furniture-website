# Execution Planning System

This folder is the execution-ready handoff system for finishing the current showroom website. It is grounded in the existing Next.js frontend/admin prototype, the completed frontend audit, the completed Supabase database audit, and the Supabase migrations in this repo.

This folder is editable planning documentation. It does not itself implement product code.

## Binding Architecture For This Plan

- Next.js App Router app in the existing root `app/` tree.
- Custom admin prototype under `app/admin`.
- Supabase Auth, Supabase/PostgreSQL, RLS, and RPCs as the backend/data layer.
- Cloudinary for media upload/delivery metadata.
- Resend for quote notification delivery.
- Google Maps embed/fallback URLs for showrooms.
- Gemini API for draft-only AI assistance.
- Gemini API key/config managed from Admin Settings by full Admin users only.
- Docker/Docker Compose support required for local development.

Do not re-plan this as a replacement backend implementation unless a later explicit architecture decision supersedes this folder.

## Current Baseline

- Public localized routes exist under `app/[locale]`.
- Admin prototype routes exist under `app/admin`.
- Public/admin UI still rely on `lib/showroom-data.ts`.
- `POST /api/contact` validates quote data and honeypot input but does not persist.
- Supabase migrations exist through `supabase/migrations/0009_optional_local_seed.sql`.
- Migration `0008_public_admin_rpcs.sql` includes public product/blog/showroom RPCs, quote submission RPC, and admin quote search RPC.
- Admin auth/session/RBAC is not wired.
- Docker files are not present.
- Gemini settings/secret storage is not implemented.

## Start Here

1. Read `99-next-action.md`.
2. Read `architecture-decisions.md`.
3. Read `docker-runtime-plan.md`.
4. Read `ai-gemini-integration-plan.md`.
5. Open the active phase folder and execute only that phase.

## Plan Orchestrator Agent System

To automate the implementation phase-by-phase without context drift or scope creep, we use the Plan Orchestrator Agent workflow.

### How to Start the First Run
1. Copy the contents of the bootstrap prompt file: [run-orchestrator-prompt.md](file:///d:/THCode/AI/furniture-website/plan/run-orchestrator-prompt.md).
2. Paste it as the initial instruction for a new AI coding agent in a clean workspace context.
3. The agent will automatically initialize itself in REVIEW mode, read the current status, write a proposal to `pending-approval.md`, output the Vietnamese review layout, and stop.

### How to Resume Execution / Confirm Proposal
- **To Confirm Proposal**: Copy the prompt from [run-orchestrator-prompt.md](file:///d:/THCode/AI/furniture-website/plan/run-orchestrator-prompt.md) and write `confirm` (or paste the prompt containing confirm) in the chat. The agent will enter EXECUTION mode, carry out the proposed task, run tests, sync progress to disk, and output the Vietnamese summary.
- **To Resume Interrupted Session**: If a session is interrupted, copy the bootstrap prompt from [run-orchestrator-prompt.md](file:///d:/THCode/AI/furniture-website/plan/run-orchestrator-prompt.md) and run it again. It will automatically detect state from `plan/pending-approval.md` and resume.

### How to Inspect Status
- **Current Phase and Status Matrix**: View [execution-status.md](file:///d:/THCode/AI/furniture-website/plan/execution-status.md).
- **Chronological History**: View the append-only [execution-log.md](file:///d:/THCode/AI/furniture-website/plan/execution-log.md).
- **Dynamic Pointer**: View [99-next-action.md](file:///d:/THCode/AI/furniture-website/plan/99-next-action.md).

### How to Handle Blocked Phases
- If the agent is unable to progress (due to missing API credentials, schema conflicts, or database RLS policy blocks):
  1. It will write detailed notes about the blocker to [blockers.md](file:///d:/THCode/AI/furniture-website/plan/blockers.md).
  2. It will set the phase status to `blocked` in [execution-status.md](file:///d:/THCode/AI/furniture-website/plan/execution-status.md).
  3. It will stop execution immediately to await human clarification. Do not resume or run other tasks while a blocking issue remains unresolved.

## Phase Folders

| Phase | Folder | Purpose |
| --- | --- | --- |
| 01 | `phases/phase-01-foundation` | Runtime, Docker, Supabase helpers, migrations, env, Gemini settings foundation |
| 02 | `phases/phase-02-public-data-integration` | Public Supabase-backed reads |
| 03 | `phases/phase-03-quote-flow` | Quote persistence and notification tracking |
| 04 | `phases/phase-04-auth-and-admin-access` | Supabase Auth and Role Model A guards |
| 05 | `phases/phase-05-admin-read-integration` | Admin reads from Supabase |
| 06 | `phases/phase-06-admin-write-integration` | Admin writes, validation, archive, audit logs |
| 07 | `phases/phase-07-media-and-third-party-services` | Cloudinary, Resend, Maps, Gemini service layer |
| 08 | `phases/phase-08-data-migration-and-seeding` | Mock data migration and seed workflow |
| 09 | `phases/phase-09-missing-admin-sections` | Media, users, settings, Gemini settings UI, AI assistant |
| 10 | `phases/phase-10-qa-hardening-and-launch` | Full QA, Docker, launch, monitoring, backup |

## Handoff Rules For Future Agents

- Execute one phase at a time.
- Read the phase README and handoff prompt first.
- State requirement IDs and affected files before editing implementation code.
- Do not jump ahead to later phases.
- Do not introduce cart, payment, order management, order tracking, inventory, or mobile app behavior.
- Enforce Role Model A in server code and RLS-aware API access.
- Never expose Supabase service role keys, Cloudinary secrets, Resend keys, Gemini keys, encryption keys, or revalidation secrets to the browser.
- Update the phase checklist and `docs/specs/traceability-matrix.md` after implementation.

## New Audit And Decision Artifacts

- `plan-audit-report.md`
- `plan-gap-matrix.md`
- `architecture-decisions.md`
- `docker-runtime-plan.md`
- `ai-gemini-integration-plan.md`

## Appendices

- `appendices/route-inventory.md`
- `appendices/use-case-catalog.md`
- `appendices/db-coverage-summary.md`
- `appendices/api-endpoint-backlog.md`
- `appendices/env-and-secrets-matrix.md`
- `appendices/test-strategy.md`
- `appendices/risks-and-assumptions.md`

## Default Verification

Run for implementation phases:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run Browser MCP journey checks when browser-visible behavior, admin access, i18n, SEO, quote capture, settings, Gemini AI, Docker runtime, or responsive behavior changes. Open the affected route, inspect the current visible state, perform the user journey, verify the expected result, capture screenshot/snapshot evidence when useful, and note console/network errors when relevant.

Use Playwright backup only when Browser MCP cannot cover the scenario or a deterministic CI/headless script is required:

```bash
pnpm test:e2e
```

Docker-oriented phases must additionally document or run the relevant command, for example:

```bash
docker compose up app
docker compose run --rm app pnpm test
```
