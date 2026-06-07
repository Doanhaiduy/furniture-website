# Use Case Catalog

## Visitor Workflows

| Use case | Requirement IDs | Current state | Target state |
| --- | --- | --- | --- |
| Browse homepage | FR-01, FR-12-PUB, NFR-03, NFR-06 | Implemented from mock data and messages. | Supabase-backed content sections, product groups, featured products, blog teaser, showrooms, settings, SEO. |
| Browse product catalog | FR-03, FR-04, FR-05, NFR-01 | URL filters/search over mock products. | Server-validated filters over `public_products`/product tables with pagination. |
| View product detail | FR-03, FR-12-PUB, NFR-06 | Mock slug lookup. | Published localized slug lookup with gallery, specs, quote CTA, schema. |
| Submit quote request | FR-07-PUB, NFR-05 | Zod validation only. | Persist through `submit_quote_request`, create notification records, safe public response. |
| Read blog | FR-06, NFR-06 | Mock blog posts/body sections. | Published localized blog records with SEO and article schema. |
| View showrooms | FR-08-PUB, NFR-03 | Mock showrooms and hardcoded iframe query. | `public_showrooms` data with validated map embed/fallback URLs. |
| Use social links/share | FR-09 | Prototype social/share UI. | Settings-backed social links and current-page share URLs. |
| Switch language | FR-12-PUB | Locale switch exists. | Equivalent localized routes/slugs where available. |

## Editor Workflows

| Use case | Requirement IDs | Current state | Target state |
| --- | --- | --- | --- |
| Manage products/categories | FR-03, FR-12-ADM | Prototype dialogs/tables. | Supabase-backed create/update/archive for publishable content. |
| Manage blog/categories | FR-06, FR-12-ADM | Prototype dialogs/tables. | Supabase-backed editorial CRUD with localized slugs and SEO. |
| Manage showrooms | FR-08-ADM | Prototype cards/dialogs. | Supabase-backed publishable showroom CRUD. |
| Use media for content | NFR-05 | Placeholder/prototype upload controls. | Authenticated media upload/use within allowed content context. |
| Use Gemini draft assistance | FR-11 | Prototype AI UI. | Server-side Gemini draft generation if Admin enabled; no secret access. |

## Admin Workflows

| Use case | Requirement IDs | Current state | Target state |
| --- | --- | --- | --- |
| Review quote requests | FR-07-ADM, FR-10, NFR-05 | Prototype CRM. | Admin-only search/detail/status/assignment/notes/events/notifications. |
| Manage users and roles | FR-10 | Placeholder/prototype. | Admin-only Supabase Auth + `profiles` management. |
| Manage public settings | FR-09, FR-10, NFR-06 | Prototype settings. | Admin-only writes, public-safe reads. |
| Manage Gemini settings | FR-10, FR-11, NFR-05 | Missing. | Admin-only masked key/config UI, validation, rotation, audit logs. |
| Govern media | NFR-05 | Placeholder/prototype. | Admin media governance with validation and reference checks. |

## Negative Workflows

- Editor accesses `/admin/quotes`, `/admin/users`, privileged settings, integration secrets, or Gemini settings: server-side denial.
- Anonymous visitor reads quote/admin data: denial.
- Public bot submits honeypot/rate-limited quote: rejection.
- Draft/archived content requested publicly: not rendered and not in sitemap.
- Gemini unavailable/disabled: AI assistant shows fallback and manual editing remains available.
