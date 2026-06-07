# Phase 01 Testing – Foundation & Infrastructure Setup

## Test Levels & Frameworks
- **Unit Testing**: Vitest will test the Zod environment schema validation and encryption helpers.
- **Integration Testing**: Vitest will verify Supabase server/browser client connectivity.
- **E2E Testing / Smoke Testing**: Playwright checks container health status.
- **Manual Verification**: CLI verification for Docker container states and database connection status.

---

## Concrete Scenarios & Verification Steps

### Scenario 1: Docker Compilation and Hot Reload
1. Execute `docker compose up app -d` on the host machine.
2. Run `docker compose ps` to verify the `app` container status is `running`.
3. Modify `app/[locale]/page.tsx` (e.g., add a temporary class to the main tag) and check that hot-reload succeeds in the Docker logs.
4. Execute `docker compose down`.

### Scenario 2: Environment Variable Failure Check
1. Open `.env` and temporarily comment out `NEXT_PUBLIC_SUPABASE_URL`.
2. Run `docker compose up app` and verify that the container exits immediately with a validation error containing:
   ```
   ❌ Invalid environment variables: { NEXT_PUBLIC_SUPABASE_URL: [ 'Required' ] }
   ```
3. Re-enable the environment variable and verify the container restarts successfully.

### Scenario 3: Secret Encryption Verification
1. Run `pnpm test tests/unit/secret-encryption.test.ts`.
2. Verify that:
   - Plaintext keys (e.g., `"test-gemini-api-key"`) are correctly encrypted using AES-GCM-256 with the mock 32-byte key.
   - Decrypting the ciphertext returns the exact plaintext key.
   - An invalid key throws an explicit decryption error.

### Scenario 4: Health Route Verification
1. Access the health endpoint: `curl -i http://localhost:3000/api/health`.
2. Verify that the response header returns `HTTP/1.1 200 OK` and the body contains:
   ```json
   { "status": "ok", "database": "connected" }
   ```
3. Check the logs inside the docker container to confirm that the health route executed a select query on the database.
