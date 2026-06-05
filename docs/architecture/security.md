# Security Architecture

## Trust Boundaries

- Browser: public pages and client-side form UX only.
- Next.js server: validation, BFF route handlers, SEO/sitemap generation, public form submission.
- Payload server: admin auth, access control, CMS APIs, hooks, media metadata, quote management.
- External services: Cloudinary, Resend, OpenAI, Google Maps Embed.

## Required Controls

| Risk | Control |
| --- | --- |
| Unauthorized CMS access | Payload auth and access controls on every collection/global. |
| Editor accessing quote requests/users/settings | Option A permission matrix enforced server-side and covered by tests. |
| XSS from CMS rich text or AI output | Restrict rich text features, sanitize rendering, validate AI drafts before publishing. |
| SQL injection | Use Payload APIs/parameterized database access; validate filters/search with Zod. |
| Unsafe uploads | Validate MIME type, extension, size, dimensions/resource type, and owner context before Cloudinary upload/reference. |
| Secret exposure | Keep database, Payload, Cloudinary, Resend, OpenAI, and revalidation secrets server-only. |
| Lead data leakage | QuoteRequests are Admin-only; public submit returns no internal ID or details. |
| Spam/abuse | Honeypot and rate limiting for public quote/search endpoints. |
| Private indexing | Robots and metadata exclude admin, preview, drafts, and private APIs. |

## Server-Side Validation

Use Zod or equivalent server-side schemas for:

- Public quote form input.
- Product filter/search query params.
- CMS custom actions.
- Media upload metadata.
- AI prompt/action input.
- Safe URL fields for CTA, social links, maps, and redirects.

## Security Test Requirements

- Admin vs Editor permission tests.
- Unauthorized CMS/API access tests.
- Quote request privacy tests.
- Upload validation tests.
- Rich text/unsafe input tests.
- Server-only environment import tests where feasible.
