# Phase 03 Goals – Quote Request Flow

## Measurable Goals
- **Lead Capture Persistence**: Wire the `/api/contact` API endpoint to persist contact form submissions directly into the Supabase database using the `submit_quote_request` RPC.
- **Email Notifications**: Dispatch HTML email notifications to registered recipients via Resend within 10 seconds of a successful submission.
- **Spam Protection**: Block bot submissions using a honeypot field and throttle requests using a rate-limiting mechanism (maximum 3 requests per 5-minute window per IP).
- **Leaked Secret Mitigation**: Hide internal database identifiers, error trace blocks, and notification status properties from the client-side API response.

## Phase Success Conditions
- Submitting the public contact form writes record nodes to the `quote_requests`, `quote_request_events`, and `quote_notifications` database tables.
- A confirmation modal is shown to the visitor upon successful submission.
- Valid submissions trigger an email notification to showroom managers containing the client details (Name, Phone, Email, Interest, Message) and a client confirmation auto-response.
- Bot requests filling out hidden honeypot inputs trigger a silent failure (returning a mock success response but writing nothing to the database).
- Subsequent request attempts exceeding the rate limit return a `429 Too Many Requests` HTTP error code.

## Concrete Results
- Updated `/api/contact` Route Handler executing honeypot verification and rate-limit middleware checks.
- Configuration settings for Resend (`lib/resend/client.ts` and notification email dispatch models).
- Database triggers writing status parameters to `quote_notifications` for observability.
- Fully functional validation schema (`lib/validations/quote.ts`) executing Zod constraints on both client and server boundaries.
