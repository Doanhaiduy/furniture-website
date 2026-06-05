# Public REST API Contract

This contract covers public-facing Next.js Route Handlers only. It does not describe
Payload Admin UI, Payload REST, or Payload GraphQL APIs.

## Common Rules

- Public API responses must include only published public content.
- `lang` accepts `vi` or `en`; default is `vi` when absent.
- Pagination uses one-based `page`; default `page = 1`.
- Default `limit = 12`; maximum `limit = 48` unless noted otherwise.
- `attributes` query value is a URL-encoded JSON object of string keys to string values.
- Public errors must not expose stack traces, secrets, SQL details, Payload internals,
  private lead data, or unpublished content.
- Prices are display/filter values only and must not create cart, checkout, payment,
  order, or inventory behavior.

## Common TypeScript Interfaces

```ts
type Locale = 'vi' | 'en';
type PublishStatus = 'draft' | 'published';
type QuoteStatus = 'new' | 'in-progress' | 'done';

interface ApiError {
  error: {
    code:
      | 'BAD_REQUEST'
      | 'VALIDATION_ERROR'
      | 'NOT_FOUND'
      | 'METHOD_NOT_ALLOWED'
      | 'RATE_LIMITED'
      | 'INTERNAL_ERROR'
      | 'SERVICE_UNAVAILABLE';
    message: string;
    fields?: Record<string, string[]>;
    requestId?: string;
  };
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

interface LocalizedText {
  vi: string;
  en: string;
}

interface SeoPayload {
  title: string;
  description: string;
}

interface ProductCategorySummary {
  id: string;
  slug: string;
  name: string;
  image?: string;
}

interface ProductAttribute {
  key: string;
  value: string;
}

interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ProductCategorySummary;
  priceMin?: number;
  priceMax?: number;
  attributes: ProductAttribute[];
  images: string[];
  featured: boolean;
  seo: SeoPayload;
}

interface ProductDetail extends ProductListItem {
  nameVi: string;
  nameEn: string;
  descriptionVi: string;
  descriptionEn: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryNode {
  id: string;
  slug: string;
  name: string;
  nameVi: string;
  nameEn: string;
  image?: string;
  order?: number;
  children: CategoryNode[];
}

interface BlogCategorySummary {
  id: string;
  slug: string;
  name: string;
}

interface BlogPostListItem {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  category: BlogCategorySummary;
  coverImage?: string;
  publishedAt?: string;
  seo: SeoPayload;
}

interface BlogPostDetail extends BlogPostListItem {
  titleVi: string;
  titleEn: string;
  content: unknown;
  contentVi: unknown;
  contentEn: unknown;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface ShowroomItem {
  id: string;
  name: string;
  address: string;
  addressVi: string;
  addressEn: string;
  hotline: string;
  mapEmbedUrl: string;
  images: string[];
  order?: number;
}

interface ContactRequestBody {
  fullName: string;
  phone: string;
  email?: string;
  productInterest?: string;
  message: string;
}

interface ContactSubmitResponse {
  success: true;
  requestId: string;
  status: QuoteStatus;
  message: string;
}
```

## Error Codes

| HTTP Status | Error Code | Applies To | Meaning |
| --- | --- | --- | --- |
| 400 | `BAD_REQUEST` | All endpoints | Invalid query syntax, malformed JSON, or unsupported parameter shape. |
| 400 | `VALIDATION_ERROR` | POST `/api/contact` and filter/search endpoints | Request body or query fields failed validation. |
| 404 | `NOT_FOUND` | Detail endpoints | No published localized resource exists for the requested slug. |
| 405 | `METHOD_NOT_ALLOWED` | All endpoints | HTTP method is not supported for the route. |
| 429 | `RATE_LIMITED` | Search and contact endpoints | Client exceeded accepted public request rate. |
| 500 | `INTERNAL_ERROR` | All endpoints | Unexpected server error. |
| 503 | `SERVICE_UNAVAILABLE` | All endpoints | CMS/database/email dependency temporarily unavailable. |

## GET `/api/products`

List published products with filters.

### Query Parameters

| Name | Type | Required | Default | Validation |
| --- | --- | --- | --- | --- |
| `category` | string | No | None | Product category slug. |
| `priceMin` | number | No | None | Must be >= 0. |
| `priceMax` | number | No | None | Must be >= `priceMin` when both are supplied. |
| `attributes` | JSON object string | No | `{}` | URL-encoded JSON object, e.g. `{"material":"oak"}`. |
| `page` | number | No | `1` | Integer >= 1. |
| `limit` | number | No | `12` | Integer 1-48. |
| `lang` | Locale | No | `vi` | `vi` or `en`. |

### Response Schema

```ts
type ProductsListResponse = PaginatedResponse<ProductListItem>;
```

### Error Codes

- `400 BAD_REQUEST`
- `400 VALIDATION_ERROR`
- `429 RATE_LIMITED`
- `500 INTERNAL_ERROR`
- `503 SERVICE_UNAVAILABLE`

### Performance SLA

Returns a successful response or validation error in <= 3 seconds for representative
launch catalog data.

## GET `/api/products/[slug]`

Return one published product detail by slug.

### Query Parameters

| Name | Type | Required | Default | Validation |
| --- | --- | --- | --- | --- |
| `lang` | Locale | No | `vi` | `vi` or `en`. |

### Response Schema

```ts
interface ProductDetailResponse {
  data: ProductDetail;
}
```

### Error Codes

- `400 BAD_REQUEST`
- `404 NOT_FOUND`
- `500 INTERNAL_ERROR`
- `503 SERVICE_UNAVAILABLE`

### Performance SLA

Returns product detail or not-found response in <= 1.5 seconds under normal CMS/database
conditions.

## GET `/api/products/search`

Search published products by keyword.

### Query Parameters

| Name | Type | Required | Default | Validation |
| --- | --- | --- | --- | --- |
| `q` | string | Yes | None | Trimmed keyword, 2-100 characters. |
| `lang` | Locale | No | `vi` | `vi` or `en`. |
| `limit` | number | No | `12` | Integer 1-24. |

### Response Schema

```ts
interface ProductSearchResponse {
  data: ProductListItem[];
  meta: {
    query: string;
    limit: number;
    count: number;
  };
}
```

### Error Codes

- `400 BAD_REQUEST`
- `400 VALIDATION_ERROR`
- `429 RATE_LIMITED`
- `500 INTERNAL_ERROR`
- `503 SERVICE_UNAVAILABLE`

### Performance SLA

Returns search results or empty result set in <= 3 seconds for representative launch
catalog data.

## GET `/api/categories`

Return product categories as a tree.

### Query Parameters

| Name | Type | Required | Default | Validation |
| --- | --- | --- | --- | --- |
| `lang` | Locale | No | `vi` | `vi` or `en`. |

### Response Schema

```ts
interface CategoriesResponse {
  data: CategoryNode[];
}
```

### Error Codes

- `400 BAD_REQUEST`
- `500 INTERNAL_ERROR`
- `503 SERVICE_UNAVAILABLE`

### Performance SLA

Returns the category tree in <= 1.5 seconds under normal CMS/database conditions.

## GET `/api/blog`

List published blog posts.

### Query Parameters

| Name | Type | Required | Default | Validation |
| --- | --- | --- | --- | --- |
| `category` | string | No | None | Blog category slug. |
| `page` | number | No | `1` | Integer >= 1. |
| `limit` | number | No | `12` | Integer 1-48. |
| `lang` | Locale | No | `vi` | `vi` or `en`. |

### Response Schema

```ts
type BlogListResponse = PaginatedResponse<BlogPostListItem>;
```

### Error Codes

- `400 BAD_REQUEST`
- `400 VALIDATION_ERROR`
- `429 RATE_LIMITED`
- `500 INTERNAL_ERROR`
- `503 SERVICE_UNAVAILABLE`

### Performance SLA

Returns the blog list or validation error in <= 2 seconds under normal CMS/database
conditions.

## GET `/api/blog/[slug]`

Return one published blog post by slug.

### Query Parameters

| Name | Type | Required | Default | Validation |
| --- | --- | --- | --- | --- |
| `lang` | Locale | No | `vi` | `vi` or `en`. |

### Response Schema

```ts
interface BlogDetailResponse {
  data: BlogPostDetail;
}
```

### Error Codes

- `400 BAD_REQUEST`
- `404 NOT_FOUND`
- `500 INTERNAL_ERROR`
- `503 SERVICE_UNAVAILABLE`

### Performance SLA

Returns blog detail or not-found response in <= 1.5 seconds under normal CMS/database
conditions.

## GET `/api/showrooms`

Return all published showroom entries.

### Query Parameters

| Name | Type | Required | Default | Validation |
| --- | --- | --- | --- | --- |
| `lang` | Locale | No | `vi` | `vi` or `en`. |

### Response Schema

```ts
interface ShowroomsResponse {
  data: ShowroomItem[];
}
```

### Error Codes

- `400 BAD_REQUEST`
- `500 INTERNAL_ERROR`
- `503 SERVICE_UNAVAILABLE`

### Performance SLA

Returns all published showrooms in <= 1.5 seconds under normal CMS/database conditions.

## POST `/api/contact`

Submit a consultation or quote request.

### Query Parameters

None.

### Request Body

```ts
interface ContactRequestBody {
  fullName: string;
  phone: string;
  email?: string;
  productInterest?: string;
  message: string;
}
```

### Field Validation

| Field | Validation |
| --- | --- |
| `fullName` | Required, trimmed, 2-120 characters. |
| `phone` | Required, phone-like, 8-20 characters. |
| `email` | Optional valid email, max 160 characters. |
| `productInterest` | Optional, max 200 characters. |
| `message` | Required, trimmed, 10-2000 characters. |

### Response Schema

```ts
type ContactResponse = ContactSubmitResponse;
```

### Success Behavior

- Persist the quote request before attempting notification.
- Trigger Resend email notification to configured business recipients.
- Return only confirmation data and `requestId`; never return private lead internals.
- If notification fails after persistence, keep the request saved and record failure for
  CMS review. Public response may still be success if the request is stored.

### Error Codes

- `400 BAD_REQUEST`
- `400 VALIDATION_ERROR`
- `405 METHOD_NOT_ALLOWED`
- `429 RATE_LIMITED`
- `500 INTERNAL_ERROR`
- `503 SERVICE_UNAVAILABLE`

### Performance SLA

Returns validation failure or persisted-submission confirmation in <= 3 seconds under
normal CMS/database/email-provider conditions. Notification provider failure must not
cause loss of the persisted quote request.
