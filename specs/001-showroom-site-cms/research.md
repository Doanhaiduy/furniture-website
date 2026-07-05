# Research And ADR Consolidation: Showroom Site CMS

## Decision: Split Public Frontend And Payload CMS Service

Use Next.js 15 App Router on Vercel for public customer-facing routes and a self-hosted
Payload CMS 3.x service on Railway or Render for admin UI, CMS APIs, collection hooks,
and AI/content workflows.

**Rationale**: The public site and CMS have different runtime concerns. The public site
needs fast localized pages, metadata, and cache behavior. Payload needs long-running
admin/API capabilities, collection hooks, upload integration, and CMS permissions.

**Alternatives considered**:

- Single Next.js process with custom admin: rejected because it duplicates Payload CMS.
- Third-party hosted CMS: rejected because the approved stack is self-hosted Payload.
- Static-only site: rejected because CMS, leads, search/filter, and AI drafting are
  required.

**ADR**: [001-application-topology.md](./adrs/001-application-topology.md)

## Decision: Payload CMS With Managed PostgreSQL And Cloudinary

Use Payload CMS 3.x with the PostgreSQL adapter pointed at managed PostgreSQL. Use
Cloudinary for CMS-managed images and store validated Cloudinary media reference fields directly
on the relevant Payload documents for launch.

**Rationale**: Payload supplies admin UI, collection modeling, role-based access hooks,
REST/GraphQL APIs, and editorial workflows. Managed PostgreSQL supplies relational
persistence, and Cloudinary supplies media storage, transformations, and delivery.

**Alternatives considered**:

- Custom CMS-only admin: rejected by constitution and prior ADR amendment.
- Payload local filesystem uploads: rejected because production needs managed storage.
- Separate object storage/CDN for launch: rejected to keep the stack smaller.

**ADR**: [002-payload-cms-supabase.md](./adrs/002-payload-cms-supabase.md),
[007-media-storage.md](./adrs/007-media-storage.md)

## Decision: next-intl Locale Routing And Payload Localized Content

Use `/vi/...` and `/en/...` public routes through next-intl. Store CMS-managed content
with explicit localized fields and localized slugs where public SEO value matters.

**Rationale**: The spec requires one-click language switching and all launch content in
Vietnamese and English. Localized route paths, slugs, metadata, Open Graph, sitemap,
and schema output are required for SEO-first public pages.

**Alternatives considered**:

- Single-language launch: rejected by spec and constitution.
- Query-param locale switching: rejected because it is weaker for SEO and sharing.
- Auto-translation-only content: rejected because CMS users must review and manage
  bilingual content.

**ADR**: [003-i18n-seo-routing.md](./adrs/003-i18n-seo-routing.md)

## Decision: Structured Showcase Product Catalog

Model products as a structured showcase catalog with category, price range, dimensions,
material, color variants, brand or series, extra attributes, images, localized content,
localized SEO, and publish state.

**Rationale**: This supports filtering/search and SEO while keeping ecommerce, exact
per-variant price, inventory, checkout, and orders out of scope.

**Alternatives considered**:

- Basic showcase without structured attributes: rejected because catalog filters need
  searchable/filterable data.
- Variant-heavy ecommerce model: rejected because cart, checkout, inventory, and orders
  are explicitly out of scope.
- Quote-only no-price catalog: rejected because the spec requires price-range filtering.

**ADR**: [004-product-catalog-model.md](./adrs/004-product-catalog-model.md)

## Decision: Quote Requests Are Persisted And Email-Notified

Persist every valid quote request for CMS review and send a Resend email notification
to configured business recipients. Notification failure must not discard the saved lead.

**Rationale**: Lead capture is a primary business goal. Persistence gives admin review,
filtering, and follow-up even when email delivery fails.

**Alternatives considered**:

- Email-only submission: rejected because lost emails would lose leads.
- Admin-only persistence with no email: rejected because fast operational follow-up is
  required.
- Customer account workflow: rejected because customer accounts are outside scope.

**ADR**: [005-lead-notification-flow.md](./adrs/005-lead-notification-flow.md)

## Decision: OpenAI Draft-Only CMS Assistant

Call OpenAI from Payload CMS custom field hooks or admin actions to generate
editable drafts for product descriptions, SEO metadata, and Vietnamese/English
translations. AI output never auto-publishes.

**Rationale**: The resolved clarification requires human approval. Draft-only behavior
reduces publishing, privacy, and brand-risk exposure.

**Alternatives considered**:

- Auto-save and auto-publish: rejected because it bypasses editorial approval.
- Public-facing chatbot: rejected because the requirement is CMS content assistance.
- No AI in launch scope: rejected because AI assistance is explicitly requested.

**ADR**: [006-ai-assistant-drafts.md](./adrs/006-ai-assistant-drafts.md)

## Decision: Feature-Sliced `/src` Structure

Use `src/app`, `src/components`, `src/features`, `src/lib`, `src/payload`, and
`src/messages`. Keep product, showroom, blog, contact, homepage, i18n, SEO, media, and
auth concerns isolated in feature slices.

**Rationale**: The project must be extensible, bilingual, SEO-first, and testable by
vertical slice. A feature-sliced layout reduces cross-module coupling.

**Alternatives considered**:

- Root-level App Router only: rejected because the user requested `/src` and Payload
  service code needs a clear home.
- Flat components-only structure: rejected because it mixes route, domain, CMS, and API
  concerns.
- Separate repositories: rejected for now because one repo improves traceability and
  shared type/contracts ownership.

**ADR**: [008-feature-slice-structure.md](./adrs/008-feature-slice-structure.md)

## Resolved Open Questions

| Area | Decision |
| --- | --- |
| Product data model | Structured catalog with price range, dimensions, material, colors, brand/series, attributes, images, SEO. |
| Quote form flow | Save to database-backed CMS collection and send Resend notification. |
| User roles | Editor manages publishable content only; Admin manages users, settings, quote requests, and all content. |
| AI assistant scope | OpenAI draft suggestions only; no auto-publish. |
| Blog/news | Full editorial section with categories, localized slugs, excerpt, body, cover image, SEO, publish state. |
| Showroom map | Google Maps Embed API with fallback link. |
| Image storage | Cloudinary for product/content images. |
| Homepage | CMS-managed homepage with hero, CTAs, two visible product-group cards, trust badges, intro, featured content, showroom teaser, quote CTA, testimonial/logo strip, SEO, and section toggles. |

## Implementation Research Notes

- Payload collection access rules must enforce Admin and Editor permissions in the CMS
  service, not only in UI navigation.
- Public frontend reads should use published, locale-complete content only.
- Quote submission must validate input before persistence and must not expose saved lead
  data to the public response.
- Resend, OpenAI, Google Maps, database, and Cloudinary secrets must be server-only environment
  variables.
- Google Maps embed failures need a visible fallback link.
- AI prompts and outputs should be logged minimally for operations without exposing
  private lead data or secrets.

