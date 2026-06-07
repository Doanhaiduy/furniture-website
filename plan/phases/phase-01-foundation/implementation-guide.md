# Phase 01 Implementation Guide – Foundation & Infrastructure Setup

## Implementation Order
1. **Docker Runtime Configuration**: Construct the `Dockerfile`, `.dockerignore`, and `docker-compose.yml`. Set up basic container bindings.
2. **Environment Configuration**: Define the Zod environment schema in `lib/env/schema.ts` and document variables in `.env.example`.
3. **Database Client Setup**: Implement server and browser boundaries in `lib/supabase/` using `@supabase/ssr`.
4. **Settings Schema Migrations**: Create and run the SQL migration for the secure settings table (`integration_secrets`) with RLS.
5. **API Verification Endpoint**: Code the `/api/health` Route Handler.
6. **Execution Test Suite**: Write basic integration tests to verify connectivity inside the Docker environment.

---

## Route & Page Mapping
- `/api/health` -> Route Handler executing database connectivity check. Requires no authentication.
- Other existing routes (public and admin) are unaffected in terms of user experience, but their dev mode runs in Docker.

---

## Backend, Frontend, and Database Impacts
- **Database**: Adds the `integration_secrets` table. RLS is enforced at the database level.
- **Backend (Next.js server)**: Starts validating env configurations at boot, causing it to fail immediately if keys are missing.
- **Frontend**: Negligible impact. The static layout is unchanged.

---

## Docker & Local Runtime Implications
- Hot-reloading requires mounting the local directory into the container. `node_modules` should be excluded from volume synchronization to prevent operating system conflicts between host and container.
- Container DNS lookup for host services (local Supabase/PostgreSQL) requires using `host.docker.internal` instead of `localhost` on Windows/macOS.

---

## Gemini Settings & API Secret Implications
- Raw Gemini API keys must never be committed to repository code or exposed via `NEXT_PUBLIC_` variables.
- Raw keys are encrypted using AES-GCM-256 with a 32-byte `AI_SECRET_ENCRYPTION_KEY` before being saved to the database. The decryption helper will live strictly in server-side modules.

---

## Security & RLS Details
- The `integration_secrets` table is protected by a strict RLS policy:
  ```sql
  ALTER TABLE integration_secrets ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Admin only select secrets" ON integration_secrets
    FOR SELECT TO authenticated USING (
      auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    );
  
  CREATE POLICY "Admin only modify secrets" ON integration_secrets
    FOR ALL TO authenticated USING (
      auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    );
  ```
- Any server endpoint utilizing `integration_secrets` must verify that the requesting user's profile role is `admin` or use the server-side `service_role` client.

---

## Edge Cases & Rollback/Fallback Considerations
- **Fallback Database Connection**: If the Supabase CLI local stack fails to initialize, default the connection target to the remote development project by swapping env files.
- **Key Decryption Failures**: If `AI_SECRET_ENCRYPTION_KEY` is rotated or lost, existing stored secrets will fail to decrypt. The system must degrade gracefully, fallback to `AI_UNAVAILABLE`, and allow the Admin to re-enter credentials.

---

## Open Questions & Assumptions
- **Assumption**: Developers have Docker Desktop or docker-ce installed. If local Docker is unavailable, the fallback is to execute `pnpm dev` directly on the host machine.
- **Open Question**: Will Supabase Vault be enabled? If remote environments support it, we can utilize `vault.secrets` instead of our custom `integration_secrets` table. If not, the custom table pattern is our fallback.
