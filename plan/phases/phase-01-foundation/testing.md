# Phase 01 Testing - Foundation & Infrastructure Setup

Browser MCP is the primary browser validation tool for any runtime behavior that is visible through the app. Playwright is backup only for CI/headless container smoke scripts or when Browser MCP cannot access the environment.

## Test Levels

- **Unit**: Vitest checks Zod environment schema validation and encryption helpers.
- **Integration**: Vitest checks Supabase server/browser client boundaries and health handler behavior.
- **Browser MCP smoke**: Open the running app or health route and verify the visible/runtime outcome.
- **CLI/Ops**: Docker and database connectivity commands validate container state.

## Scenario 1: Docker Runtime And Health Smoke

- **Goal**: Confirm the app starts in Docker and the runtime is reachable.
- **Preconditions**: Docker is running; `.env` contains required Supabase variables.
- **Browser MCP steps**:
  1. Start the app with `docker compose up app -d`.
  2. Open `http://localhost:3000/api/health`.
  3. Inspect the visible response.
  4. Capture the response or screenshot if needed for evidence.
- **Expected result**: Health response shows `status: ok` and database connectivity state.
- **Pass/fail**:
  - Pass: route is reachable and reports healthy runtime state.
  - Fail: route is unreachable, returns server error, or reports unexpected database failure.
- **Playwright backup**: Use only for CI/headless Docker smoke automation.

## Scenario 2: Environment Variable Failure Check

- **Goal**: Confirm missing required environment variables fail fast.
- **Preconditions**: Local `.env` can be safely modified and restored.
- **Steps**:
  1. Temporarily remove or rename `NEXT_PUBLIC_SUPABASE_URL`.
  2. Start the app/container.
  3. Inspect CLI logs for the validation error.
  4. Restore the variable and restart.
- **Expected result**: Runtime fails with a descriptive validation error, then starts successfully after restoration.
- **Pass/fail**:
  - Pass: failure and recovery are both explicit.
  - Fail: app starts with missing required config or crashes without useful error.
- **Playwright backup**: Not needed.

## Scenario 3: Secret Encryption Verification

- **Goal**: Confirm AES-GCM-256 encryption/decryption behavior.
- **Steps**:
  1. Run `pnpm test tests/unit/secret-encryption.test.ts`.
  2. Verify plaintext test keys encrypt and decrypt correctly.
  3. Verify invalid keys throw explicit errors.
- **Expected result**: Unit test passes.
- **Playwright backup**: Not applicable.

## Scenario 4: Browser MCP Runtime Reachability

- **Goal**: Confirm Browser MCP can reach the local runtime after foundation setup.
- **Preconditions**: App is running at `http://localhost:3000`.
- **Browser MCP steps**:
  1. Open `http://localhost:3000/vi` or `/api/health`.
  2. Inspect current visible state.
  3. Check console logs only if the route does not load.
- **Expected result**: Browser MCP can access the local app or health route.
- **Pass/fail**:
  - Pass: route opens and visible state is coherent.
  - Fail: local app is inaccessible from Browser MCP.
- **Playwright backup**: Use only when Browser MCP cannot connect but CI must still validate the runtime.
