# Phase 09 Testing – Admin Settings, Users, Media, & AI Completion

## Test Levels & Frameworks
- **Unit Testing**: Vitest testing for `lib/security/encrypt.ts` and `lib/security/mask.ts`.
- **Integration Testing**: Vitest testing for settings mutation helpers and Auth Admin API integrations.
- **E2E Testing**: Playwright checks for key masking, user deactivations, and AI drafting fallbacks.
- **Manual Verification**: SQL checks on `settings` table value hashes and `audit_logs` entries.

---

## Concrete Scenarios & Verification Steps

### Scenario 1: Gemini API Key Encryption & Masking
1. Log in to the admin panel as an Admin.
2. Navigate to `/admin/settings`.
3. Open the "AI Configuration" tab, input the key: `"AI_TEST_KEY_VALUE_123456"`, and click "Save".
4. Verify that:
   - A success toast is displayed.
   - The input field refreshes and displays exactly: `************3456` (the raw key is hidden).
5. Inspect the database table `settings`:
   - `SELECT value FROM settings WHERE key = 'gemini_api_key';`
6. Verify the stored string is a complex ciphertext hash (representing GCM encrypted parameters) and does not contain the plaintext key.

### Scenario 2: Gemini API Key Rotation & Auditing
1. Log in as an Admin.
2. Navigate to `/admin/settings` and update the Gemini API key.
3. Check the database `audit_logs` table:
   ```sql
   SELECT action_type, target_table, metadata FROM audit_logs WHERE target_table = 'settings' ORDER BY created_at DESC LIMIT 1;
   ```
4. Verify the log displays `action_type = 'UPDATE'`, the target row is registered, and metadata contains the masked key suffix.

### Scenario 3: User Role Modification (Admin Only)
1. Navigate to `/admin/users` as an Admin.
2. Locate a test Editor user row and change their role to "Admin" using the dropdown select.
3. Verify that:
   - The change is saved and a success toast is displayed.
   - The table reflects the new role.
   - An audit record is written to `audit_logs` registering the change.
4. Try to click "Deactivate" on your own Admin account. Verify the action is blocked with an alert warning: `"Không thể tự vô hiệu hóa tài khoản của chính mình" / "Cannot deactivate your own account"`.

### Scenario 4: AI Generation Offline Fallback
1. Log in as an Admin.
2. Navigate to `/admin/settings`, toggle the AI Enabled setting to "Off", and click "Save".
3. Navigate to `/admin/blog/new` as an Editor.
4. Verify that:
   - The "Generate outline with AI" button is disabled or hidden.
   - An alert banner displays: `"Dịch vụ AI đang tắt" / "AI service is offline"`.
