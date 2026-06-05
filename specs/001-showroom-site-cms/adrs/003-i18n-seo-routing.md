# ADR-003: Bilingual Routing And SEO

## Status

Accepted

## Date

2026-05-31

## Context

The public site must support Vietnamese and English in one click. Public pages must be
SEO-first with metadata, Open Graph, canonical and alternate links, sitemap, robots, and
schema.org structured data.

## Decision

Use next-intl route prefixes `/vi/...` and `/en/...`. Store public CMS content with
separate Vietnamese and English fields and localized slugs for products, blog posts,
categories, showrooms when exposed publicly, and CMS pages where useful.

## Rationale

- Locale-prefixed paths are clear for users and search engines.
- Localized slugs improve SEO and shareability.
- Public rendering can require locale completeness before publication.
- Metadata, Open Graph, schema, sitemap, and alternate links can be generated per
  locale.

## Alternatives Considered

- **Query-param locales**: weaker for SEO and canonical URL handling.
- **Single shared slug for both locales**: simpler, but less useful for localized SEO.
- **Auto-translation without editorial fields**: rejected because CMS users must manage
  both languages explicitly.

## Consequences

- Publishing validation must check required fields for each launch locale.
- Locale switching must map users to equivalent localized pages where possible.
- Search and filters must respect current locale while remaining accent tolerant.
