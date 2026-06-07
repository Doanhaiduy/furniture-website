# Phase 03 Dependencies – Quote Request Flow

## Upstream Prerequisites
- **Phase 01 Complete**: Environment variable schema validation must support `RESEND_API_KEY` and rate-limiting properties.
- **RPC Availability**: The Supabase database schema must contain the `submit_quote_request(payload jsonb)` RPC from migration file `0008_public_admin_rpcs.sql`.

## Required Services / Configuration / Auth State
- **Resend Service API Key**: A verified account and API key from Resend (`RESEND_API_KEY`) must be configured in environment definitions.
- **Notification Recipients**: The database table `quote_recipients` or the environment fallback list (`QUOTE_NOTIFICATION_RECIPIENTS`) must contain valid target email addresses.
- **Database RLS State**: The RLS policy allowing public `INSERT` operations on the `quote_requests` table must be active (SELECT, UPDATE, and DELETE must be blocked for anonymous users).
- **Rate Limiting**: Memory-based rate limiting is confirmed and active for all quote request endpoints.

## Blockers
- **Resend Authentication Block**: If the Resend API key is unverified or lacks a registered sender domain, outgoing emails will fail.
- **Database Write Failures**: If the `submit_quote_request` RPC contains structural validation issues that do not match the frontend model, API endpoints will fail.

## Parallelization and Constraints
- **Parallel Work**:
  - Designing the HTML layout styles for email templates (Manager notification and Customer auto-reply) can proceed in parallel with the rate-limiting setup.
  - Setting up the honeypot form element on the contact page is independent of database connectivity and can be mocked locally.
- **Sequential Constraints**:
  - Rate limiting and honeypot validation checks must execute before writing the payload to Supabase to prevent spam write floods.
  - The Resend email dispatch must execute only after database persistence has completed successfully, ensuring database record logs are maintained even if mail delivery fails.
