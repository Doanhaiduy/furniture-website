# Phase 03 Implementation Guide – Quote Request Flow

## Implementation Order
1. **Zod Validation Schema**: Update parameters inside `lib/validations/quote.ts`.
2. **Form UI upgrades**: Embed honeypot field and form state handlers inside `components/showroom/quote-form.tsx`.
3. **Service Clients Setup**: Create `lib/resend/client.ts` and template layouts.
4. **Rate Limit Setup**: Integrate rate limit logic in the `/api/contact` API.
5. **API Route Handler**: Complete `/api/contact/route.ts` executing verification pipelines and Supabase RPC calls.
6. **Integration Verification**: Run local tests confirming email delivery and SQL persistence.

---

## Route & Page Mapping
- `/api/contact` -> API endpoint processing public lead captures. Allows public requests but enforces rate-limiting.
- `/[locale]/contact` -> Public contact page rendering the lead form.
- `/[locale]/products/[slug]` -> Dynamic details page rendering quote request modals.

---

## Backend, Frontend, and Database Impacts
- **Database**: Performs insertions to `quote_requests`, `quote_request_events`, and `quote_notifications`.
- **Backend (Next.js server)**: Processes honeypots, rate-limits, validation schemas, and email dispatches.
- **Frontend**: Form displays real submission success dialogs or descriptive error states.

---

## Docker & Local Runtime Implications
- Add `RESEND_API_KEY` to Docker compose environment files.
- Rate-limiting uses an in-memory cache mapped inside the container. Verify memory usage is scoped to prevent leaks.

---

## Gemini Settings & API Secret Implications
- Not applicable. No AI features or secret modifications are implemented in this phase.

---

## Security & RLS Details
- Public users must only possess `INSERT` permissions on the `quote_requests` table.
- Select queries on the database tables are blocked for anonymous roles:
  ```sql
  CREATE POLICY "Public insert only" ON quote_requests FOR INSERT TO public WITH CHECK (true);
  -- Ensure no select policies exist for authenticated/anonymous users unless they match Admin roles.
  ```
- The contact API route must execute calls using a privileged database client wrapper while filtering out internal transaction IDs from the client-facing JSON output.

---

## Edge Cases & Rollback/Fallback Considerations
- **Email Delivery Failure**: If Resend is unavailable, the server must still persist the record to Supabase, log the notification status as `failed`, and return a success response to the visitor. Do not block lead captures solely due to SMTP failures.
- **Spam honeypots**: Ensure honeypot fields are styled off-screen using absolute position styling (e.g. `position: absolute, left: -9999px`) instead of `display: none` to bypass smart bot parsing, while keeping accessibility fields labeled.

---

## Open Questions & Assumptions
- **Assumption**: The target business email domain is verified in the Resend dashboard. If not, sandbox limitations allow sending only to the registered developer email address during testing.
- **Open Question**: Do we need to capture product-specific details? We assume capturing a generic interest string is sufficient.
