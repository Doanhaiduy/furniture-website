# ADR-002: Content Modeling

## Status

Accepted

## Date

2026-06-01

## Context

The project needs CMS-managed public pages, structured products, blog content, showrooms, quote requests, media, bilingual content, SEO, and AI-assisted drafts.

The homepage requirement was previously too narrow when treated as banner editing only.

## Decision

Use Payload collections and globals:

- Collections: `Users`, `Media`, `ProductCategories`, `Products`, `BlogCategories`, `BlogPosts`, `Showrooms`, `QuoteRequests`.
- Globals: `HomePage`, `AboutPage`, `SiteSettings`.
- Use Payload localized fields or explicit `vi`/`en` field groups for public content.
- Product model is structured and quote-first: category, optional price range, dimensions, material, colors, brand/series, attributes, images, and SEO fields.
- Blog model is full editorial: categories, localized slugs, excerpt, body, cover image, SEO fields, and publish state.
- Homepage model includes hero, CTAs, two fixed product-group cards above fold, trust badges, intro, featured categories/products, showroom teaser, quote CTA, testimonial/logo strip, SEO, and section visibility/order toggles.

## Rationale

- Payload globals fit singleton marketing pages and site settings.
- Payload collections fit repeatable catalog, editorial, showroom, media, user, and lead records.
- Localized fields keep Vietnamese and English content editable in one CMS workflow.
- Structured product attributes support filters/search without adding ecommerce complexity.

## Consequences

- Publication validation must check required localized fields and media before `published`.
- Editors manage publishable content only. Admins manage quote requests, settings, users, and all content.
- Quote requests are not publishable content and are Admin-only.
- AI-generated output is stored as draft/editable content and follows normal publish validation.
