# Phase 03 Deliverables – Quote Request Flow

## Concrete Expected Outputs
- **app/api/contact/route.ts**: Route Handler executing rate limit validation, honeypot inspection, Zod payload verification, database RPC triggers, and notification calls.
- **lib/resend/client.ts**: Standardized wrapper client utilizing the Resend SDK or raw HTTP dispatch scripts.
- **lib/email/templates/**: HTML layouts containing:
  - `manager-notification.tsx`: Styled message for showroom staff with client properties.
  - `customer-acknowledgement.tsx`: Localized auto-reply message for the visitor.
- **lib/security/rate-limit.ts**: Lightweight rate-limiter check using a sliding-window algorithm, utilizing either Upstash Redis, database-backed counters, or in-memory caches.

## Affected Routes, Components, APIs, Tables, and Configurations
- **Routes**:
  - `/api/contact` [MODIFY]
- **Components**:
  - `components/showroom/quote-form.tsx` [MODIFY] (Implement hidden honeypot component, loading state locks, localized validation text)
  - `app/[locale]/contact/page.tsx` [MODIFY] (Contact: form rendering, error state redirection)
- **Tables**:
  - `quote_requests` [WRITE]
  - `quote_request_events` [WRITE]
  - `quote_notifications` [WRITE]
- **Configurations**:
  - `.env.example` [MODIFY] (Add `RESEND_API_KEY` and `QUOTE_NOTIFICATION_RECIPIENTS` variables)

## Future Touchpoints
- **Quote requests list** will be mapped to the Admin quotes overview (`/admin/quotes`) in Phase 05.
- **Quote status update actions** (changing statuses from `new` to `responded` or `completed`) will be implemented in Phase 06.
- **Notification fallback metrics** will be reviewed during QA testing in Phase 10.

## Verification Evidence Required
1. **Database Persistence logs**: Output showing database writes inside SQL inspector:
   ```sql
   SELECT id, customer_name, status FROM quote_requests ORDER BY created_at DESC LIMIT 1;
   ```
2. **Resend Log Entries**: Verification of dynamic email delivery in the Resend dashboard or local test mail logs.
3. **Spam Rejection**: Logs showing a `200 OK` return with zero database updates when the hidden honeypot is submitted.
4. **429 Response Logs**: Command execution showing `HTTP/1.1 429 Too Many Requests` when executing rapid multiple queries from the same source IP.
