# Phase 03 Checklist – Quote Request Flow

## 1. Validation Schema & Form Frontend updates
- [x] Refine `lib/validations/quote.ts` with strict Zod rules (validating Vietnamese phone syntax, non-empty text values, and valid emails).
- [x] Integrate a hidden honeypot input field (e.g. `<input type="text" name="website_confirm" style={{ display: 'none' }} autocomplete="off" />`) inside `components/showroom/quote-form.tsx`.
- [x] Connect form submission to trigger the `/api/contact` Route Handler, locking the submit button and rendering a loading spinner.
- [x] Build error boundaries displaying localized user feedback when validation or network errors occur.

## 2. API Endpoint Logic
- [x] Refine `/api/contact/route.ts` to execute Zod payload validation.
- [x] Implement rate limiting using a container-local memory cache (max 5,000 entries).
- [x] Add honeypot verification: if the honeypot field contains any string value, return a mock success response immediately without database execution.
- [x] Integrate rate-limiting check: block execution and return HTTP `429` if the client exceeds the window limits.
- [x] Persist quote via Supabase service-role client (direct insert to `quote_requests` with `quote_request_events` and `quote_notifications` tracking).

## 3. Email Notification Infrastructure
- [x] Create `lib/resend/client.ts` initializing the Resend client.
- [x] Design HTML layouts inside `lib/email/templates/` for managers.
- [x] Retrieve target emails from `quote_recipients` or fallback environment variables.
- [x] Implement email dispatch triggers immediately following successful database writes.
- [x] Write event logs inside the `quote_notifications` table storing `sent`, `failed`, or `skipped` markers.

## 4. Security & Verification Checks
- [x] RLS: `quote_requests` is admin-only readable; public inserts only via RPC/service-role.
- [x] Run `pnpm test tests/unit/quote-schema.test.ts` to verify form validation rules (9/9 tests pass).
- [x] Lint clean (0 errors), typecheck clean, build success.
- [ ] Browser MCP quote-form checks (deferred — requires Browser MCP runtime).
- [ ] Update `docs/specs/traceability-matrix.md` mapping contact form items.
