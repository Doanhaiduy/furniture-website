# Phase 07 Testing - Media & Third-Party Service Integration

Browser MCP is the primary validation tool for media upload UI, Google Maps rendering/fallbacks, quote email visible states, and Gemini draft UI behavior. Playwright is backup only for file-upload automation, mocked service CI scripts, or unsupported Browser MCP interactions.

## Test Levels

- **Unit**: Vitest checks MIME rules, Google Maps URL formats, email templates, and service validators.
- **Integration**: Vitest checks Gemini decryption helpers and Cloudinary signed token generation.
- **Browser MCP journey checks**: Upload controls, map iframe/fallback, AI draft loading/success/failure states.
- **Service checks**: Mock or provider logs validate Cloudinary/Resend/Gemini boundaries.

## Scenario 1: Upload Validation Constraints

- **Goal**: Confirm unsupported media is blocked safely.
- **Browser MCP steps**:
  1. Log in as Editor.
  2. Open `/admin/media`.
  3. Inspect accepted media guidance and upload control state.
  4. Attempt an invalid upload if Browser MCP supports the required file interaction.
  5. Verify visible error message and no persisted invalid media.
  6. Run backend bypass check against `/api/admin/media/upload` if required.
- **Expected result**: Invalid files are blocked client-side and server-side.
- **Playwright backup**: Use when file upload interaction must be scripted or run in CI.

## Scenario 2: Google Maps Embed Rendering And Fallback

- **Goal**: Confirm showroom maps render safely and degrade to a fallback link.
- **Browser MCP steps**:
  1. Open `/vi/showrooms`.
  2. Inspect showroom cards, map iframe, and fallback directions link.
  3. Verify the map area renders or presents safe fallback behavior.
  4. If invalid map data is configured, reload and verify fallback link remains usable.
- **Expected result**: Map content does not crash the page and fallback link is safe.
- **Playwright backup**: Use only for deterministic map fallback CI script.

## Scenario 3: HTML Email Compilation

- **Goal**: Confirm quote notifications compile with expected customer and admin context.
- **Browser MCP steps**:
  1. Submit a quote request through the contact form.
  2. Verify user-visible success state.
  3. Inspect Resend mock/provider logs separately.
  4. Confirm HTML body, dynamic fields, and admin link are present.
- **Expected result**: Email compiles and quote UX is unaffected.
- **Playwright backup**: Use only for CI quote/email regression with mocks.

## Scenario 4: Gemini Draft Generation And Fallback

- **Goal**: Confirm AI draft UI is human-reviewed and safe when Gemini fails.
- **Browser MCP steps**:
  1. Log in as Editor or Admin with permitted AI access.
  2. Open the blog/product creation page.
  3. Enter enough context for a draft.
  4. Click the visible AI generate action.
  5. Verify loading state, draft preview, accept/discard controls, and no auto-publish.
  6. Simulate invalid/disabled Gemini config and verify safe unavailable message.
  7. Check console/network logs only if UI state is unclear.
- **Expected result**: AI output remains draft-only; failure is safe and manual editing remains possible.
- **Playwright backup**: Use for deterministic mocked Gemini CI flow.
