# ADR-004: Structured Product Catalog Model

## Status

Accepted

## Date

2026-05-31

## Context

The catalog must support product discovery, category/price/attribute filtering, search,
SEO, bilingual content, and quote generation. Ecommerce workflows are out of scope.

## Decision

Model products as structured showcase items with category, price range, dimensions,
material, color variants, brand or series, additional attributes, images, localized
content, localized SEO fields, and publish state.

## Rationale

- Structured fields support filters and search.
- Price ranges satisfy catalog browsing without enabling checkout.
- Color variants remain descriptive catalog data, not inventory/SKU variants.
- SEO fields and localized slugs support public product detail pages.

## Alternatives Considered

- **Basic unstructured product pages**: rejected because filter/search acceptance
  criteria require structured data.
- **Full ecommerce variant model**: rejected because cart, payment, inventory, and
  orders are out of scope.
- **Quote-only catalog with no prices**: rejected because price-range filtering is
  required.

## Consequences

- Product fields must be validated in CMS before publication.
- Attribute taxonomy can expand without changing the route architecture.
- Tests must verify filters across category, price range, and representative
  attributes.
