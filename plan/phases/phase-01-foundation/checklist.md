# Phase 01 Checklist – Foundation & Infrastructure Setup

## 1. Local Development Containerization
- [ ] Create `Dockerfile` in the project root targeting Node 22 and pnpm 11.5.0 with multi-stage build.
- [ ] Create `.dockerignore` to exclude `node_modules/`, `.next/`, `dist/`, `.git/`, and local env files.
- [ ] Create `docker-compose.yml` mapping port `3000:3000` with volumes configured for hot-reloading (`./:/app` and `/app/node_modules`).
- [ ] Verify container compilation: run `docker compose build app` and confirm it exits with code 0.
- [ ] Verify hot-reload: run `docker compose up app`, make a small layout adjustment in `app/[locale]/page.tsx`, and confirm the change is reflected in the browser.

## 2. Environment Validation Schema
- [ ] Create `lib/env/schema.ts` defining a Zod validation schema for all required environment variables.
- [ ] Inject environment validation in the root layout (`app/[locale]/layout.tsx`) or a runtime entrypoint to trigger validation on boot.
- [ ] Test validation failure: rename `NEXT_PUBLIC_SUPABASE_URL` in `.env` to a dummy variable and verify the server crashes on boot with a descriptive error.
- [ ] Restore variables and verify server boots cleanly.

## 3. Supabase Integration & Boundaries
- [ ] Install `@supabase/ssr` (already in package dependencies) and create the browser-side helper `lib/supabase/client.ts`.
- [ ] Create the server-side helper `lib/supabase/server.ts` utilizing cookies from Next.js server context.
- [ ] Enforce strict boundaries: write a Vitest script to verify importing `lib/supabase/server.ts` from a client-side mock file triggers a bundler or test error.

## 4. Secure Gemini Settings Storage
- [ ] Create a local SQL migration file `supabase/migrations/20260607_gemini_settings.sql` defining an `integration_secrets` table.
- [ ] Add the following columns: `id` (UUID), `key_name` (text, unique), `encrypted_value` (text), `masked_hint` (text), `is_active` (boolean), `created_at`, `updated_at`, `updated_by` (UUID REFERENCES profiles(id)).
- [ ] Enable RLS on `integration_secrets` and define policies allowing only the `service_role` and `admin` profiles to perform SELECT, UPDATE, or INSERT actions.
- [ ] Apply migration to the database using Supabase CLI: run `supabase db reset` and verify the table exists in the schema.

## 5. System Health Check API
- [ ] Implement Route Handler in `app/api/health/route.ts` checking environment validation and database ping status.
- [ ] Return JSON payload `{"status": "ok", "database": "connected"}` under successful connection.
- [ ] Verify health status: execute `curl -i http://localhost:3000/api/health` and verify HTTP response is `200 OK`.
- [ ] Update `docs/specs/traceability-matrix.md` with requirement mappings for Phase 01.
