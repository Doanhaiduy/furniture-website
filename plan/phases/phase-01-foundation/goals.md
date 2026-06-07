# Phase 01 Goals – Foundation & Infrastructure Setup

## Measurable Goals
- **Dockerization**: The Next.js 16.2.6 application starts inside a Node 22-alpine Docker container in development mode (`docker compose up app`) in less than 60 seconds.
- **Supabase Integration**: The app connects successfully to the database using both server-only (`lib/supabase/server.ts`) and browser-safe (`lib/supabase/client.ts`) boundaries.
- **Environment Variable Validation**: A strict runtime validator checks all required variables on server boot and throws explicit, readable errors for any missing configs.
- **Gemini Settings Schema**: A secure table structure or configuration storage pattern for Gemini API configurations is defined and integrated with Role Model A (accessible only via service-role / full Admin).

## Phase Success Conditions
- Running `docker compose up app` starts the Next.js application, binds to port `3000`, and hot-reloads on file changes in the local workspace.
- The `/api/health` health-check route returns `{"status": "ok", "database": "connected"}`.
- Linting (`pnpm lint`), typechecking (`pnpm typecheck`), unit tests (`pnpm test`), and compilation (`pnpm build`) pass inside the Docker environment with zero errors or warnings.
- The environment configuration strictly separates client-safe keys from server-only secrets (preventing leak risks).

## Concrete Results
- Operational `Dockerfile`, `.dockerignore`, and `docker-compose.yml` configured for Node 22.x / pnpm 11.5.0.
- Executable server and client boundaries for Supabase interactions.
- A functional environment validation module (`lib/env/schema.ts`) built using Zod.
- Clear SQL migration file for Admin-only settings (`supabase/migrations/0010_gemini_settings.sql`) protecting API credentials with RLS and masking.
