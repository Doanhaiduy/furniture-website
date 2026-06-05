# Architecture Overview

## System Shape

Showroom Nội Thất Phương Đông uses a split public frontend and CMS backend:

- Next.js 15 renders the bilingual public website and thin server-side BFF endpoints.
- Payload CMS owns admin UI, auth, RBAC, collections, globals, hooks, and CMS APIs.
- Managed PostgreSQL stores Payload content and quote requests.
- Cloudinary stores and delivers media.
- Resend sends quote notifications.
- Google Maps Embed displays showroom maps.
- OpenAI powers draft-only CMS content/SEO assistance.

## Data Flow

1. Admin or Editor edits publishable content in Payload.
2. Payload validates role, localized fields, media, and publish rules.
3. Published changes trigger frontend revalidation.
4. Next.js server routes fetch published content from Payload and render localized pages.
5. Visitors submit quote forms through Next.js `POST /api/contact`.
6. The server validates input, writes `QuoteRequests` through Payload, and triggers Resend.

## Public Rendering Rules

- Public routes render only published content.
- Public pages use `vi` and `en` routes through next-intl.
- Product and blog detail routes use localized slugs.
- Private lead data and admin settings never leave server/admin boundaries.

## Admin Rules

- Payload Admin is the primary CMS interface.
- Admin owns users, settings, quote requests, and all content.
- Editor owns publishable content only.
- AI drafts never publish automatically.

## Integration Boundaries

| Integration | Boundary |
| --- | --- |
| Payload | Server-side from Next.js; Admin UI for CMS users. |
| PostgreSQL | Payload adapter and migrations only, no browser access. |
| Cloudinary | Server-signed upload/delete; public delivery URLs. |
| Resend | Server-only notification hook. |
| Google Maps | Public embed/fallback URLs validated in CMS. |
| OpenAI | Server-only Payload action/hook. |
