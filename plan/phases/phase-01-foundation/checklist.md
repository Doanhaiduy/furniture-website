# Phase 01 Checklist – Foundation & Infrastructure Setup

## 1. Local Development Containerization
- [x] Create `Dockerfile` in the project root targeting Node 22 and pnpm 11.5.0 with multi-stage build.
- [x] Create `.dockerignore` to exclude `node_modules/`, `.next/`, `dist/`, `.git/`, and local env files.
- [x] Create `docker-compose.yml` mapping port `3000:3000` with volumes configured for hot-reloading (`./:/app` and `/app/node_modules`).
- [x] Verify container compilation: run `docker compose build app` and confirm it exits with code 0. (Verified successfully)
- [x] Verify hot-reload: run `docker compose up app` with container name mapping, make layout adjustment and confirm reflected in browser. (Verified successfully)

## 2. Environment Validation Schema
- [x] Create `lib/env/schema.ts` defining a Zod validation schema for all required environment variables.
- [x] Inject environment validation in the root layout (`app/layout.tsx`) to trigger validation on boot.
- [x] Test validation failure: rename `NEXT_PUBLIC_SUPABASE_URL` in `.env` to a dummy variable and verify the server crashes on boot with a descriptive error. (Verified via unit test `env-validation.test.ts`)
- [x] Restore variables and verify server boots cleanly.

## 3. Supabase Integration & Boundaries
- [x] Install `@supabase/ssr` (already in package dependencies) and create the browser-side helper `lib/supabase/client.ts`.
- [x] Create the server-side helper `lib/supabase/server.ts` utilizing cookies from Next.js server context.
- [x] Enforce strict boundaries: write a Vitest script to verify importing `lib/supabase/server.ts` from a client-side mock file triggers a bundler or test error. (Verified via unit test `supabase-boundaries.test.ts`)

## 4. Secure Gemini Settings Storage
- [x] Create a local SQL migration file `supabase/migrations/20260607_gemini_settings.sql` defining an `integration_secrets` table.
- [x] Add the following columns: `id` (UUID), `key_name` (text, unique), `encrypted_value` (text), `masked_hint` (text), `is_active` (boolean), `created_at`, `updated_at`, `updated_by` (UUID REFERENCES profiles(id)).
- [x] Enable RLS on `integration_secrets` and define policies allowing only the `service_role` and `admin` profiles to perform SELECT, UPDATE, or INSERT actions.
- [x] Apply migration to the database using Supabase CLI: run `pnpm supabase db reset` and verify the table exists in the schema. (Applied successfully)

## 5. System Health Check API
- [x] Implement Route Handler in `app/api/health/route.ts` checking environment validation and database ping status.
- [x] Return JSON payload `{"status": "ok", "database": "connected"}` under successful connection.
- [x] Verify health status: execute `curl.exe -i http://localhost:3000/api/health` and verify HTTP response is `200 OK` with `connected` database status. (Verified successfully)
- [x] Update `docs/specs/traceability-matrix.md` with requirement mappings for Phase 01.
