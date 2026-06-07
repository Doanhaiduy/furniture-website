# Phase 01 Deliverables – Foundation & Infrastructure Setup

## Concrete Expected Outputs
- **Dockerfile**: Production-ready and development-friendly Next.js container configuration using a multi-stage build.
- **docker-compose.yml**: Compose setup defining the `app` service and local volume mounts for hot-reloading.
- **lib/env/schema.ts**: Zod-based environment variable schema for strict server-side validation.
- **lib/supabase/client.ts**: Client-side Supabase client using `@supabase/ssr` with browser cookies.
- **lib/supabase/server.ts**: Server-side Supabase client (Server Components, Route Handlers) using service/anon credentials.
- **supabase/migrations/0010_gemini_settings.sql**: Migration script creating a secure settings table `integration_secrets` with RLS policies restricting read/write access to `service_role` and `admin` profiles.
- **app/api/health/route.ts**: A server-side API health check route verifying system uptime and Supabase connectivity.

## Affected Routes, Components, APIs, Tables, and Configurations
- **Routes**:
  - `/api/health` [NEW]
- **Tables**:
  - `integration_secrets` [NEW]
- **Configurations**:
  - `.env.example` [MODIFY] (Add `AI_SECRET_ENCRYPTION_KEY` and define Docker-specific settings)
  - `tsconfig.json` [MODIFY] (Ensure aliases like `@/*` are correctly resolved for Docker)

## Future Touchpoints
- **lib/supabase/server.ts** will be modified in Phase 04 to inject server session context.
- **supabase/migrations/** will receive further migrations as additional settings parameters are defined.
- **app/api/health/route.ts** will be extended in Phase 07 to include health checks for Cloudinary, Resend, and Gemini.

## Verification Evidence Required
1. **Docker logs**: Terminal output showing compilation success inside Docker.
2. **Curl output**: Response from `curl http://localhost:3000/api/health` displaying:
   ```json
   { "status": "ok", "database": "connected" }
   ```
3. **Vitest results**: 100% pass rate for client/server connection tests.
4. **SQL Verification**: Output showing successful execution of `0010_gemini_settings.sql` on the local/remote instance.
