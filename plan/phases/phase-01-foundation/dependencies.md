# Phase 01 Dependencies – Foundation & Infrastructure Setup

## Upstream Prerequisites
- **Workspace Context**: Verified clean environment running Node 22.x, pnpm 11.5.0, Next.js 16.2.6, and React 19.2.4.
- **Database Schema**: Existing migrations (`supabase/migrations/0001_extensions_and_enums.sql` through `0009_optional_local_seed.sql`) must be present in the repository and validated.

## Required Services / Configuration / Auth State
- **Supabase Stack**: A running Supabase instance (either via local Supabase CLI or a remote development project) is required to test connectivity.
- **Docker Engine**: Docker Desktop or an active Docker daemon supporting Linux containers must be installed on the host machine.
- **Credential Handshake**: Client access needs the following environment variables configured in a `.env` file (copied from `.env.example`):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `DATABASE_URL` (for migration execution)
  - `AI_SECRET_ENCRYPTION_KEY` (32-byte hexadecimal key for setting encryption)
- **Auth State**: Not applicable yet. Local test authentication is bypassed or stubbed in this phase.

## Blockers
- **Port Conflicts**: Port `3000` (Next.js) and port `5432` / `54322` (PostgreSQL) must not be bound by host processes before running `docker compose up`.
- **Database Connectivity**: Docker containers cannot communicate with host network services (like local Postgres) on Windows/macOS unless configured with `host.docker.internal` or explicit network bridges.
- **Missing Secrets**: Failure to define a secure 32-byte `AI_SECRET_ENCRYPTION_KEY` will block the initialization of our secure Settings storage helper.

## Parallelization and Constraints
- **Parallel Work**:
  - The creation of the `Dockerfile` and `docker-compose.yml` can proceed in parallel with the database client setup and env validation schema implementation.
  - The implementation of the Gemini settings SQL migration and schema structure is independent of the Docker containerization.
- **Sequential Constraints**:
  - Environment variable validation (`lib/env/schema.ts`) must be completed before configuring the Supabase server/browser clients, as the clients import validation schemas to ensure runtime safety.
  - Supabase client configurations must be verified before writing the `/api/health` connectivity test endpoint.
