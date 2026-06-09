# Phase 09 Testing - Admin Settings, Users, Media, & AI Completion

Browser MCP is the primary validation tool for Admin Settings, Users, Media, Gemini settings, masking, role-denied states, and AI assistant workflows. Playwright is backup only for deterministic CI admin matrix scripts.

## Test Levels

- **Unit**: Vitest checks encryption, masking, validators, and settings helpers.
- **Integration**: Tests cover settings mutation helpers, Auth Admin API integrations, and audit logs.
- **Browser MCP journey checks**: Settings save/mask, key rotation UI, user role change, self-deactivation block, AI offline fallback.
- **Database checks**: SQL/RPC verifies ciphertext and audit rows.

## Scenario 1: Gemini API Key Encryption And Masking

- **Goal**: Confirm Admin can save a Gemini key and the UI never reveals raw value.
- **Browser MCP steps**:
  1. Log in as Admin.
  2. Open `/admin/settings`.
  3. Open AI Configuration.
  4. Enter a test key and save.
  5. Verify success state.
  6. Verify refreshed UI shows only masked key suffix.
  7. Check database value separately for ciphertext.
- **Expected result**: Raw key is never visible after save and is encrypted at rest.
- **Playwright backup**: Use for CI settings masking regression.

## Scenario 2: Gemini API Key Rotation And Auditing

- **Goal**: Confirm key rotation writes audit evidence without exposing the key.
- **Browser MCP steps**:
  1. Log in as Admin.
  2. Update the Gemini key in Settings.
  3. Verify success state and masked suffix.
  4. Check `audit_logs` for masked metadata.
- **Expected result**: Rotation is saved, masked, and audited.
- **Playwright backup**: Use for deterministic CI settings flow.

## Scenario 3: User Role Modification

- **Goal**: Confirm only Admin can manage roles and cannot deactivate their own account.
- **Browser MCP steps**:
  1. Log in as Admin.
  2. Open `/admin/users`.
  3. Change a test Editor role using visible controls.
  4. Verify success state and table update.
  5. Attempt to deactivate the current Admin account.
  6. Verify the action is blocked with safe visible warning.
- **Expected result**: Authorized role change works; unsafe self-deactivation is blocked.
- **Playwright backup**: Use for CI role management matrix.

## Scenario 4: AI Generation Offline Fallback

- **Goal**: Confirm disabled AI does not block manual authoring.
- **Browser MCP steps**:
  1. Log in as Admin.
  2. Disable AI in Settings.
  3. Open `/admin/blog/new` as Editor.
  4. Verify AI generation controls are disabled/hidden.
  5. Verify an offline banner or safe guidance appears.
  6. Confirm manual editing controls remain usable.
- **Expected result**: AI offline state is clear and non-blocking.
- **Playwright backup**: Use for CI AI fallback regression.
