# Phase 01 Runtime, Supabase, Docker, And Gemini Settings Foundation

## Objective

Make the real project architecture executable and safe for integration: Docker local runtime, Supabase connection/migration strategy, server-only Supabase helpers, env validation, and secure Gemini settings storage.

## Why This Phase Exists

The audits show the UI and database schema are strong, but the application is not wired to the backend. Starting with route data wiring before runtime, env, migrations, and secret handling would create fragile follow-up work.

## Requirement IDs

- FR-10
- FR-11
- FR-12-ADM
- NFR-05
- NFR-07

## Real Scope

- Add Docker/Docker Compose local development support.
- Define Supabase local vs remote development mode.
- Validate migrations/RPC existence for Supabase.
- Create server-only Supabase admin/service helper boundary and browser-safe client boundary.
- Update env expectations for Supabase, Cloudinary, Resend, Gemini, encryption, and revalidation.
- Add or design the Gemini settings storage mechanism:
  - Admin-only.
  - encrypted or secret-manager backed.
  - masked in UI/API.
  - audit logged.
- Document Docker startup and verification commands.

## Out Of Scope

- Replacing public route mock data.
- Quote persistence wiring.
- Admin CRUD.
- Media upload implementation.
- Gemini draft generation UI.

## Dependencies

- Current `package.json` and Node 22/pnpm 11.5.0.
- `supabase/migrations/0001` through `0009`.
- `plan/docker-runtime-plan.md`.
- `plan/ai-gemini-integration-plan.md`.
- Supabase local CLI or remote dev credentials.
- Docker Desktop or compatible Docker engine.

## Files/Folders Likely Impacted

- `Dockerfile`
- `.dockerignore`
- `docker-compose.yml`
- optional `docker-compose.dev.yml`
- `.env.example`
- `lib/supabase/**` or equivalent
- `lib/env/**` or equivalent
- `lib/ai/**` or settings validation helpers if introduced
- `supabase/migrations/0010_*` if Gemini settings/secret storage requires schema changes
- `plan/**`
- `docs/specs/traceability-matrix.md`

## Implementation Tasks

1. Add Docker files for the Next.js app.
2. Document and verify one Supabase development mode:
   - Supabase CLI local stack, or
   - remote Supabase dev project, or
   - Postgres-only migration smoke with clear limitations.
3. Create env validation for required public/server-only variables.
4. Create Supabase server client and browser client boundaries.
5. Confirm required RPCs exist or document migration blocker.
6. Add secure Gemini settings storage plan or migration.
7. Add tests for env validation and helper import boundaries where code is added.
8. Update checklist and traceability.

## Backend/Database Impacts

- No existing data should be altered except optional schema migration for Gemini settings/secret storage.
- If adding a migration, enforce:
  - Admin-only RLS for secret/config tables.
  - service-role access for server-side Gemini calls.
  - `audit_logs` writes for settings changes.

## Frontend Impacts

- Dockerized app should run the existing UI unchanged.
- No public/admin UI behavior should change except any environment error handling needed for startup.

## Route/Page Mapping

- All routes remain in place.
- `/admin/settings` and `/admin/ai-assistant` are not completed in this phase, but their Gemini settings requirements are defined.

## Env/Config Needs

- Supabase URL and anon key.
- Supabase service role key.
- database URL for migrations/smoke.
- `AI_SECRET_ENCRYPTION_KEY` if encrypted DB secret storage is implemented.
- optional bootstrap `GEMINI_API_KEY` and `GEMINI_DEFAULT_MODEL`.

## Security/RLS Considerations

- Service role key must never be imported into client components.
- Gemini raw key must never be returned to browser responses.
- Editors cannot read or mutate Gemini settings.
- RLS must protect any new settings/secret table.

## Testing Checklist

- Docker app starts.
- Supabase connection mode is verified or blocker documented.
- Required RPCs are present or migration blocker documented.
- Env validation tests pass if implemented.
- Secret masking/encryption helper tests pass if implemented.

## Acceptance Criteria / Definition Of Done

- `docker compose up app` or documented equivalent starts the app.
- Supabase local/remote strategy is explicit.
- Server-only Supabase helpers exist or are specified with exact file paths.
- Gemini settings storage is implemented or a migration-ready plan is documented.
- No active plan reference points agents to a non-Supabase backend or non-Gemini AI provider.

## Rollback/Fallback Notes

- Docker changes can be bypassed by host `pnpm dev` during debugging, but Phase 01 is not complete until Docker path is restored.
- If Supabase local is blocked, use remote dev Supabase and document credentials/config requirements.
- If DB secret storage is blocked, use server-only `GEMINI_API_KEY` as temporary local fallback and block production Gemini Settings completion.

## Risks/Unknowns

- Supabase CLI may not be installed on developer machines.
- Windows Docker host networking requires explicit `host.docker.internal` handling.
- Current schema lacks Gemini secret storage, so a secure migration decision is required.
