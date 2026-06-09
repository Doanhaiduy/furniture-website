# Phase 03 Testing - Quote Request Flow

Browser MCP is the primary tool for quote form UI validation, validation messages, honeypot-safe behavior, rate-limit user experience, and success/failure states. Playwright is backup only for CI/headless quote-flow regression or repeatable rate-limit scripting.

## Test Levels

- **Unit**: Vitest checks phone/email/empty input validation.
- **Integration**: Vitest mocks Resend and validates quote persistence/notification state.
- **Browser MCP journey checks**: Contact form validation, safe success state, user-visible rate-limit behavior, admin visibility where in scope.
- **CLI/API checks**: Curl or database checks verify honeypot/rate-limit internals when needed.

## Scenario 1: Form Validation Verification

- **Goal**: Confirm quote form validates unsafe or incomplete input before submission.
- **Browser MCP steps**:
  1. Open `/vi/contact`.
  2. Inspect the visible form.
  3. Submit with missing required fields.
  4. Verify inline validation messages and disabled/error states.
  5. Enter valid Vietnamese phone and required fields.
  6. Verify the form becomes submittable.
- **Expected result**: Invalid input is blocked; valid input can proceed.
- **Pass/fail**:
  - Pass: visible validation matches schema expectations.
  - Fail: invalid input submits or error messages are missing/confusing.
- **Playwright backup**: Use only for CI form regression.

## Scenario 2: Honeypot Validation Checks

- **Goal**: Confirm bot-like honeypot submissions do not create leads while preserving safe client behavior.
- **Steps**:
  1. Use an API/curl request with the honeypot field filled.
  2. Confirm the client-safe response does not expose spam detection details.
  3. Verify no new `quote_requests` row is inserted.
- **Expected result**: Honeypot submission is safely ignored.
- **Playwright backup**: Not needed unless a browser-visible honeypot regression is required.

## Scenario 3: Rate Limiting Verification

- **Goal**: Confirm rapid submissions are throttled safely.
- **Browser MCP steps**:
  1. Submit a valid quote request through the visible form until the limit is reached.
  2. Verify the first allowed attempts show safe success behavior.
  3. Verify later attempts show a user-safe rate-limit message.
  4. Check network/API details only if the visible behavior is unclear.
- **Expected result**: Excessive submissions are rejected without leaking internals.
- **Pass/fail**:
  - Pass: user sees safe guidance and API returns the expected throttle behavior.
  - Fail: spam attempts bypass limit or expose internal details.
- **Playwright backup**: Use for deterministic rate-limit CI script if needed.

## Scenario 4: Email Delivery Fallback

- **Goal**: Confirm notification failure does not break the quote user experience.
- **Preconditions**: Resend mock or failure mode is configured.
- **Browser MCP steps**:
  1. Open the quote/contact form.
  2. Submit a valid quote request.
  3. Verify the user sees a success state.
  4. Check database/notification records for `failed` notification state.
- **Expected result**: Lead persists, notification failure is tracked, and user experience remains successful.
- **Playwright backup**: Use only for CI flow with mocked Resend failure.
