# ADR-005: Quote Request Persistence And Notification

## Status

Accepted

## Date

2026-05-31

## Context

Lead generation is a primary business goal. The quote/contact form must send email
notification and support admin review, filtering, and management.

## Decision

Validate and persist every valid quote request in the CMS-backed database, then send a
Resend email notification to configured showroom recipients. If notification fails, the
quote request remains saved and the failure is visible for operational follow-up.

## Rationale

- Persistence protects against lost leads.
- Email notification supports fast sales response.
- Admin review and filtering are required by the CMS feature set.
- Failure handling avoids discarding valid customer requests.

## Alternatives Considered

- **Email-only form**: rejected because delivery failure can lose customer data.
- **Database-only without email**: rejected because sales follow-up would be slower.
- **Customer account workflow**: rejected as outside the showroom lead-capture scope.

## Consequences

- Public response must not expose private lead records.
- Duplicate/spam-like submissions need validation and review status handling.
- Resend configuration and recipient settings must be server-only.
