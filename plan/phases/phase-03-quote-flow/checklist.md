# Phase 03 Checklist – Quote Request Flow

## 1. Validation Schema & Form Frontend updates
- [ ] Refine `lib/validations/quote.ts` with strict Zod rules (validating Vietnamese phone syntax, non-empty text values, and valid emails).
- [ ] Integrate a hidden honeypot input field (e.g. `<input type="text" name="website_confirm" style={{ display: 'none' }} autocomplete="off" />`) inside `components/showroom/quote-form.tsx`.
- [ ] Connect form submission to trigger the `/api/contact` Route Handler, locking the submit button and rendering a loading spinner.
- [ ] Build error boundaries displaying localized user feedback when validation or network errors occur.

## 2. API Endpoint Logic
- [ ] Refine `/api/contact/route.ts` to execute Zod payload validation.
- [ ] Implement rate limiting using a container-local memory cache (max 5,000 entries).
- [ ] Add honeypot verification: if the honeypot field contains any string value, return a mock success response immediately without database execution.
- [ ] Integrate rate-limiting check: block execution and return HTTP `429` if the client exceeds the window limits.
- [ ] Call the Supabase service-role client to execute the database RPC: `rpc('submit_quote_request', { payload: validatedPayload })`.

## 3. Email Notification Infrastructure
- [ ] Create `lib/resend/client.ts` initializing the Resend client.
- [ ] Design HTML layouts inside `lib/email/templates/` for managers and customers using React components.
- [ ] Retrieve target emails from `quote_recipients` or fallback environment variables.
- [ ] Implement email dispatch triggers immediately following successful database writes.
- [ ] Write event logs inside the `quote_notifications` table storing `sent`, `failed`, or `skipped` markers.

## 4. Security & Verification Checks
- [ ] Confirm RLS: execute select statements as an anonymous role and verify that select requests to `quote_requests` return `401 Unauthorized` or empty outputs.
- [ ] Run `pnpm test tests/unit/quote-schema.test.ts` to verify form validation rules.
- [ ] Execute Playwright test suite `pnpm test:e2e` confirming validation errors render.
- [ ] Update `docs/specs/traceability-matrix.md` mapping contact form items.
