# API Contract

## Scope

The public site should not expose a broad CMS API to browsers. Next.js pages and thin BFF route handlers read Payload from server-side code. Payload REST/GraphQL and Admin UI remain the CMS/admin boundary.

No API may introduce cart, payment, order, or mobile-app behavior.

## Common Types

```ts
type Locale = "vi" | "en";

type MutationResult<T = unknown> =
  | { ok: true; data?: T }
  | {
      ok: false;
      code:
        | "VALIDATION_ERROR"
        | "UNAUTHORIZED"
        | "FORBIDDEN"
        | "NOT_FOUND"
        | "CONFLICT"
        | "RATE_LIMITED"
        | "SERVER_ERROR";
      message: string;
      fieldErrors?: Record<string, string[]>;
    };
```

Public responses must not expose stack traces, database errors, Payload internals, lead data, or secrets.

## Public Page Contracts

| Route | Inputs | Server Data Contract | Requirements |
| --- | --- | --- | --- |
| `GET /{locale}` | `locale` | Published HomePage, two primary product groups, settings, featured content, homepage SEO. | FR-01, FR-12-PUB, NFR-06 |
| `GET /{locale}/about` | `locale` | Published AboutPage localized fields and SEO. | FR-02, FR-12-PUB, NFR-06 |
| `GET /{locale}/products` | `locale`, query params | Published products, categories, active filter state, pagination, SEO. | FR-03, FR-04, FR-05, NFR-01 |
| `GET /{locale}/products/{slug}` | `locale`, localized slug | Published product detail, gallery, attributes, quote CTA, Product schema. | FR-03, FR-12-PUB, NFR-06 |
| `GET /{locale}/blog` | `locale`, optional category/page | Published blog posts and categories. | FR-06, NFR-06 |
| `GET /{locale}/blog/{slug}` | `locale`, localized slug | Published blog detail and Article schema. | FR-06, NFR-06 |
| `GET /{locale}/showrooms` | `locale` | Published showrooms, hotlines, map embed/fallback links. | FR-08-PUB |
| `GET /{locale}/contact` | `locale`, optional product/category/source | Quote form defaults and safe public settings. | FR-07-PUB |

## Product Query Contract

```ts
type ProductListQuery = {
  category?: string;
  q?: string;
  priceMin?: number;
  priceMax?: number;
  attributes?: Record<string, string | string[]>;
  page?: number;
  pageSize?: number;
};
```

Validation:

- `page >= 1`.
- `pageSize` capped by server config.
- `priceMin` and `priceMax` are non-negative and ordered.
- Attribute keys must be allowlisted or ignored according to the catalog slice decision.
- Query execution must support the 3-second launch target.

## Public Mutation Contract

### Submit Quote Request

Preferred route:

```http
POST /api/contact
Content-Type: application/json
```

```ts
type SubmitQuoteRequest = {
  locale: Locale;
  fullName: string;
  phone: string;
  email?: string;
  company?: string;
  message: string;
  productId?: string;
  categoryId?: string;
  sourcePath: string;
  honeypot?: string;
};

type SubmitQuoteResponse = MutationResult<{ submitted: true }>;
```

Rules:

- Validate with Zod on the server.
- Rate-limit and reject obvious bot/honeypot submissions.
- Create a Payload `QuoteRequests` record with default status `new`.
- Trigger Resend notification after persistence.
- Do not return internal lead ID, notification error details, or admin-only fields.
- Public users cannot read, list, update, or delete quote requests.

## Admin And Payload Contracts

Payload Admin UI is the main CMS. Collection access rules are mandatory and are treated as API contracts.

| Area | Editor | Admin | Requirements |
| --- | --- | --- | --- |
| Products/categories | Create/edit/publish/archive publishable content. | Full. | FR-03, FR-12-ADM |
| Blog/categories | Create/edit/publish/archive publishable content. | Full. | FR-06, FR-12-ADM |
| HomePage/AboutPage | Edit publishable content fields. | Full. | FR-01, FR-02, FR-10 |
| Showrooms | Create/edit/publish/archive publishable content. | Full. | FR-08-ADM |
| Media | Upload/use media for publishable content. | Full Cloudinary media admin. | NFR-05 |
| QuoteRequests | No access. | Full review/search/status/notes. | FR-07-ADM |
| Users/roles | No access. | Full. | FR-10 |
| SiteSettings privileged fields | No access. | Full. | FR-10 |
| AI drafts | For editable publishable content only. | For all eligible publishable content. | FR-11 |

## Payload Hooks

| Hook | Contract |
| --- | --- |
| `publishValidation` | Blocks publication when required localized fields, media, slug, or SEO minimums are missing. |
| `cloudinaryMediaValidation` | Validates type, size, resource type, and ownership context before upload/reference. |
| `quoteNotification` | Sends Resend email after quote request persistence and stores notification status. |
| `revalidatePublicRoutes` | Revalidates affected public routes/tags after publish/archive/update. |
| `aiDrafts` | Generates editable draft fields only; never publishes or bypasses validation. |

## External Integrations

| Service | Server Boundary | Public Boundary |
| --- | --- | --- |
| Cloudinary | Signed upload/delete, folder/preset policy, transformations. | Delivery URLs only. |
| Resend | Server-only API key and recipient settings. | No provider details returned. |
| Google Maps Embed | Validate map embed/fallback URLs in CMS. | Embed iframe/link rendered publicly. |
| OpenAI | Server-only key and prompt builder in Payload runtime. | No direct browser calls. |

## Cache And Revalidation

Suggested tags:

- `home:{locale}`
- `about:{locale}`
- `products:{locale}`
- `product:{id}`
- `product-slug:{locale}:{slug}`
- `blog:{locale}`
- `blog-post:{id}`
- `showrooms:{locale}`
- `site-settings`

Payload publish/archive/update hooks must revalidate only affected tags and routes.

## Error Handling

- `VALIDATION_ERROR`: invalid input with field errors.
- `UNAUTHORIZED`: no authenticated CMS user.
- `FORBIDDEN`: authenticated user lacks role.
- `NOT_FOUND`: missing or unpublished content.
- `CONFLICT`: slug uniqueness, stale update, or dependency conflict.
- `RATE_LIMITED`: spam/abuse protection.
- `SERVER_ERROR`: generic public error with internal logging.
