# Public Interface Contracts

Detailed public Next.js API route-handler contracts are defined in
[public-rest-api.md](./public-rest-api.md). This file summarizes public page/interface
behavior and must stay aligned with the REST contract.

## Locale Routes

Supported locales:

- `vi`
- `en`

All public routes are locale-prefixed:

```text
/{locale}
/{locale}/about
/{locale}/products
/{locale}/products/{slug}
/{locale}/blog
/{locale}/blog/{slug}
/{locale}/showrooms
/{locale}/contact
```

Unsupported locales must resolve to a safe not-found or locale fallback behavior defined
during implementation. Admin/private routes must not appear in sitemap output.

## Homepage Contract

Route: `GET /{locale}`

Public data:

- Enabled CMS-managed hero banner title, summary, image, and CTA in requested locale.
- Two product group cards: wooden furniture and sanitary equipment.
- Company introduction summary.
- Localized metadata, Open Graph, canonical URL, alternate locale links, and
  Organization schema.

Acceptance:

- At least one enabled hero banner and both product groups are visible in the first
  screen on tested desktop and mobile viewports.

## Product Listing Contract

Route: `GET /{locale}/products`

Query parameters:

| Parameter | Type | Notes |
| --- | --- | --- |
| category | localized slug | Optional category filter. |
| minPrice | number | Optional minimum price-range bound. |
| maxPrice | number | Optional maximum price-range bound. |
| attributes | key/value list | Optional filterable attributes. |
| q | string | Optional keyword search. |
| page | number | Optional pagination page. |

Public response behavior:

- Returns published products complete for requested locale.
- Shows empty state when no products match.
- Filtering result target is <= 3 seconds for representative launch data.
- Search matches localized name, category, reference, summary, and selected attributes.

## Product Detail Contract

Route: `GET /{locale}/products/{slug}`

Public data:

- Localized product name, slug, summary, description, SEO fields.
- Category and product group.
- Price range, dimensions, material, color variants, brand/series, attributes.
- Image gallery and primary image with alt text.
- Product schema.org structured data.
- Quote CTA, no cart/checkout/payment behavior.

## Blog Listing And Detail Contract

Routes:

```text
GET /{locale}/blog
GET /{locale}/blog/{slug}
```

Public data:

- Published localized blog posts only.
- Category, localized slug, title, excerpt, cover image, body on detail page, SEO
  fields, publish date.
- Article or BlogPosting schema for detail pages.

## Showroom Contract

Route: `GET /{locale}/showrooms`

Public data:

- Active showrooms only.
- Localized name/address, hotline, Google Maps embed URL, fallback map link, optional
  hours and image.
- LocalBusiness or Store schema where sufficient data exists.

Failure behavior:

- If embed fails or is blocked, show the fallback map link.

## Contact And Quote Contract

Route: `GET /{locale}/contact`

Public data:

- Localized form labels and validation messages.
- Optional source product/category context.
- Contact settings and public business information.

Submission endpoint:

```text
POST /api/contact
```

Request body:

| Field | Required | Notes |
| --- | --- | --- |
| fullName | Yes | Customer full name. |
| phone | Yes | Phone-like format. |
| email | No | Must be valid when provided. |
| productInterest | No | Optional product/category interest. |
| message | Yes | Consultation or quote details. |

Response:

- Success: confirmation only, no private lead data.
- Validation failure: field-level errors.
- Notification failure after persistence: success confirmation plus internal failure
  recorded for CMS review; no operational stack details shown publicly.

Security:

- Reject unsafe, incomplete, or spam-like input.
- Public users cannot list, read, update, or delete quote requests.

## SEO System Contracts

Generated outputs:

- `/{locale}` and public route metadata.
- `/sitemap.xml` containing published public localized pages only.
- `/robots.txt` excluding admin/private routes.
- Canonical and alternate locale links per public page.
- schema.org structured data for Organization, Product, Article/BlogPosting, and
  LocalBusiness/Store where applicable.
