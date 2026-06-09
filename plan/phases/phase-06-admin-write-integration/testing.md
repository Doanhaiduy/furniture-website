# Phase 06 Testing - Admin Write Integration & Audit Logging

Browser MCP is the primary tool for validating admin create/update/archive flows, form validation, confirmation dialogs, success states, and visible revalidation. Playwright is backup only for deterministic CI CRUD scripts.

## Test Levels

- **Unit**: Vitest checks slug validation and payload normalization helpers.
- **Integration**: Vitest checks database write helpers with transaction rollbacks.
- **Browser MCP journey checks**: Content creation, validation errors, archive confirmation, role-denied mutation attempts.
- **Database checks**: SQL/RPC checks verify table state and `audit_logs`.

## Scenario 1: Valid Content Creation And Audit Log

- **Goal**: Confirm authorized users can create publishable content and audit logs are written.
- **Browser MCP steps**:
  1. Log in as Editor.
  2. Open `/admin/products/new`.
  3. Fill required product fields using visible labels.
  4. Submit the form.
  5. Verify success toast or success state.
  6. Verify redirect/list update shows the new item.
  7. Check `audit_logs` for the insert entry.
- **Expected result**: Product is created, visible in admin list, and audit log records the action.
- **Pass/fail**:
  - Pass: UI success, persisted record, and audit entry all exist.
  - Fail: form submits incorrectly, record missing, or audit log absent.
- **Playwright backup**: Use for CI CRUD regression.

## Scenario 2: Form Validation Error Handling

- **Goal**: Confirm invalid admin input is blocked with useful visible errors.
- **Browser MCP steps**:
  1. Open `/admin/products/new`.
  2. Enter an invalid slug with uppercase letters and spaces.
  3. Submit or blur the field.
  4. Verify the field shows validation styling and localized error text.
- **Expected result**: Form is not submitted and the user sees clear guidance.
- **Playwright backup**: Use only for CI validation regression.

## Scenario 3: Soft-Deletion / Archive Action

- **Goal**: Confirm archive behavior is safe, confirmable, and not a hard delete.
- **Browser MCP steps**:
  1. Open `/admin/products`.
  2. Locate a product row/card.
  3. Use the visible Archive action.
  4. Verify the confirmation modal.
  5. Confirm archive.
  6. Verify the row disappears from active list or shows archived state.
  7. Verify database `is_active = false` and public listing excludes the product.
- **Expected result**: Archive updates state safely and writes audit evidence.
- **Playwright backup**: Use for deterministic archive regression.

## Scenario 4: Unauthorized Writer Block

- **Goal**: Confirm Editor cannot mutate privileged settings.
- **Browser MCP steps**:
  1. Log in as Editor.
  2. Attempt to open a privileged settings route or trigger a privileged action.
  3. Verify access-denied UI or redirect.
  4. Use direct API check only if needed to confirm `403 Forbidden`.
  5. Verify settings are unchanged and audit logs record the denied attempt if required.
- **Expected result**: Unauthorized mutation is blocked in UI and server-side.
- **Playwright backup**: Use for CI role mutation matrix.
