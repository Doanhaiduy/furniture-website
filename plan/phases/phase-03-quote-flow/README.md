# Phase 03 Quote Flow And Notifications

## Objective

Persist public quote/contact submissions through Supabase, protect the endpoint from abuse, and track notification attempts.

## Why This Phase Exists

The business requires lead capture. The current `/api/contact` validates input but returns demo success without writing. Migration `0008_public_admin_rpcs.sql` already includes `submit_quote_request`.

## Requirement IDs

- FR-07-PUB
- FR-07-ADM
- NFR-05

## Real Scope

- Update `app/api/contact/route.ts`.
- Validate and normalize `quoteRequestSchema`.
- Add rate limiting and honeypot behavior.
- Call `submit_quote_request(payload jsonb)` or a server helper around it.
- Track notification status in `quote_notifications`.
- Queue/send Resend notification only after persistence.
- Return public-safe response only.

## Out Of Scope

- Full admin quote CRM integration.
- Admin auth implementation beyond what is needed to protect verification helpers.
- Media or Gemini.

## Dependencies

- Phase 01 Supabase helpers.
- Phase 02 public mapping patterns.
- Quote recipients from `quote_recipients` or env fallback.

## Files/Folders Likely Impacted

- `app/api/contact/route.ts`
- `lib/validations/quote.ts`
- quote helper/notification helper files
- `tests/unit/quote-schema.test.ts`
- `tests/integration/**`
- `tests/e2e/public-admin.spec.ts`

## Implementation Tasks

1. Confirm the contact/quote payload expected by current public forms.
2. Add server-side normalization, honeypot, and rate-limit handling.
3. Call `submit_quote_request` with validated payload and safe metadata.
4. Add notification queue/send behavior after persistence.
5. Update public form tests and API integration coverage.

## Backend/Database Impacts

- Writes to `quote_requests`.
- Creates initial `quote_request_events`.
- Creates `quote_notifications` rows for active recipients.
- Must preserve admin-only RLS for quote tables.

## Frontend Impacts

- Public forms keep the current UX but reflect real success/failure states.
- User-facing errors remain localized and do not reveal internal persistence or email details.
- Product-detail quote context should be passed safely if present.

## Route/Page Mapping

- Forms on `/[locale]`, `/[locale]/contact`, and product detail quote flows submit to the contact API.
- Success/error pages remain UI destinations but must reflect real API result.

## Env/Config Needs

- Supabase server helper.
- `RESEND_API_KEY` if sending immediately.
- `QUOTE_NOTIFICATION_RECIPIENTS` only as bootstrap fallback.

## Security/RLS Considerations

- Public users can create only through validated server endpoint/RPC.
- Public users cannot read quote records.
- Do not return internal quote IDs, admin notes, notification errors, IP/user-agent hashes, or stack traces.
- Rate limiting must account for deployment environment.

## Testing Checklist

- Valid submission persists.
- Invalid fields fail.
- Honeypot fails.
- Rate limit fails.
- Notification rows created or skipped intentionally.
- Public response is safe.

## Acceptance Criteria / Definition Of Done

- `/api/contact` no longer returns demo success.
- Quote appears in admin-only query path.
- Notification tracking exists.
- Tests cover validation, persistence, and privacy.

## Rollback/Fallback Notes

- If Resend credentials are unavailable, persist quote and mark notification `skipped` or `failed` with safe internal detail.
- Never block quote persistence solely because email fails.

## Risks/Unknowns

- Final quote recipient emails may still require business approval.
- Rate limit storage strategy may vary between Vercel and Docker/local.
