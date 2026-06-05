# Data Model: Payload CMS Collections And Globals

## Scope

This model defines the Payload CMS collections and globals for Showroom Nội Thất
Phương Đông. It covers public catalog content, bilingual editorial content, showroom
locations, quote requests, CMS users, site settings, and homepage composition.

Out of scope: cart, checkout, online payment, inventory/order management, order
tracking, and mobile app data.

## Conventions

- Field names use the requested Payload schema names.
- `id`, `createdAt`, and `updatedAt` are Payload-managed fields unless otherwise noted.
- Public bilingual fields use `_vi` and `_en` suffixes.
- Status values are intentionally simple for launch.
- Images are stored in Cloudinary and represented here as URL strings unless a
  future implementation chooses a dedicated Payload Media upload collection.
- Slugs are unique URL identifiers and should be lower-case, trimmed, and URL-safe.
- Admin-only fields must not be exposed through public read contracts.

## Collection: Products

Structured showcase catalog items for wooden furniture and sanitary equipment.

### Fields

| Field | Payload Type | Required | Relation / Shape | Validation And Notes |
| --- | --- | --- | --- | --- |
| `id` | text | System | Payload document ID | Stable unique identifier. |
| `slug` | text | Yes | None | Unique; used for public product detail route. |
| `name_vi` | text | Yes | None | Vietnamese product name. |
| `name_en` | text | Yes | None | English product name. |
| `description_vi` | richText or textarea | Yes | None | Vietnamese product description; unsafe markup must be blocked. |
| `description_en` | richText or textarea | Yes | None | English product description; unsafe markup must be blocked. |
| `category` | relationship | Yes | `ProductCategories` | Product belongs to one primary category. |
| `price_min` | number | No | None | Minimum display/filter price; must be `<= price_max` when both exist. |
| `price_max` | number | No | None | Maximum display/filter price; must be `>= price_min` when both exist. |
| `attributes` | array | No | `{ key: text, value: text }[]` | Filterable structured attributes such as material, dimensions, color, brand/series, style, finish, or installation type. |
| `images` | array | No | Cloudinary media references | Public product images; at least one image required before publishing. |
| `featured` | checkbox | Yes | None | Default `false`; used for homepage and catalog highlights. |
| `status` | select | Yes | `draft`, `published` | Default `draft`; only `published` records appear publicly. |
| `seo_title_vi` | text | No | None | Vietnamese SEO title; fallback can derive from `name_vi`. |
| `seo_title_en` | text | No | None | English SEO title; fallback can derive from `name_en`. |
| `seo_desc_vi` | textarea | No | None | Vietnamese SEO description. |
| `seo_desc_en` | textarea | No | None | English SEO description. |
| `createdAt` | datetime | System | Payload timestamp | Created timestamp. |
| `updatedAt` | datetime | System | Payload timestamp | Updated timestamp. |

### Relationships

- `Products.category -> ProductCategories.id`
- `QuoteRequests.productInterest` may reference a product name, slug, or product
  interest text from this collection.
- `HomePage.featured_products -> Products[]`

### Indexes

| Index | Fields | Type | Purpose |
| --- | --- | --- | --- |
| `products_slug_unique` | `slug` | Unique | Product detail route lookup. |
| `products_status_idx` | `status` | Normal | Public published filtering. |
| `products_category_status_idx` | `category`, `status` | Composite | Catalog category filter. |
| `products_featured_status_idx` | `featured`, `status` | Composite | Homepage featured products. |
| `products_price_idx` | `price_min`, `price_max` | Composite | Price range filtering. |
| `products_name_vi_idx` | `name_vi` | Search/Text | Vietnamese keyword search. |
| `products_name_en_idx` | `name_en` | Search/Text | English keyword search. |
| `products_updated_at_idx` | `updatedAt` | Normal | Admin sorting and revalidation. |

### Publication Rules

- `name_vi`, `name_en`, `description_vi`, `description_en`, `category`, `slug`, and at
  least one `images` URL are required before `status = published`.
- Product price is display/filter data only and must not create cart, checkout,
  payment, inventory, or order behavior.

## Collection: ProductCategories

Hierarchical catalog categories including the two main product groups.

### Fields

| Field | Payload Type | Required | Relation / Shape | Validation And Notes |
| --- | --- | --- | --- | --- |
| `id` | text | System | Payload document ID | Stable unique identifier. |
| `slug` | text | Yes | None | Unique public/category identifier. |
| `name_vi` | text | Yes | None | Vietnamese category name. |
| `name_en` | text | Yes | None | English category name. |
| `parent` | relationship | No | `ProductCategories` self-relation | Supports category tree; top-level categories have no parent. |
| `image` | text | No | Cloudinary media reference | Optional category image. |
| `order` | number | No | None | Default `0`; lower values appear first. |

### Relationships

- `ProductCategories.parent -> ProductCategories.id`
- `Products.category -> ProductCategories.id`
- `HomePage.featured_categories -> ProductCategories[]`

### Indexes

| Index | Fields | Type | Purpose |
| --- | --- | --- | --- |
| `product_categories_slug_unique` | `slug` | Unique | Category route/filter lookup. |
| `product_categories_parent_idx` | `parent` | Normal | Category tree loading. |
| `product_categories_order_idx` | `order` | Normal | Manual ordering. |
| `product_categories_name_vi_idx` | `name_vi` | Search/Text | Vietnamese category search/admin lookup. |
| `product_categories_name_en_idx` | `name_en` | Search/Text | English category search/admin lookup. |

## Collection: BlogPosts

Full editorial news/blog content.

### Fields

| Field | Payload Type | Required | Relation / Shape | Validation And Notes |
| --- | --- | --- | --- | --- |
| `id` | text | System | Payload document ID | Stable unique identifier. |
| `slug` | text | Yes | None | Unique public blog detail route identifier. |
| `title_vi` | text | Yes | None | Vietnamese title. |
| `title_en` | text | Yes | None | English title. |
| `content_vi` | richText | Yes | None | Vietnamese article body; unsafe embeds/scripts blocked. |
| `content_en` | richText | Yes | None | English article body; unsafe embeds/scripts blocked. |
| `category` | relationship | Yes | `BlogCategories` | Blog category. |
| `coverImage` | text | No | Cloudinary media reference | Required before publishing. |
| `author` | relationship | Yes | `Users` | Author or editor attribution. |
| `status` | select | Yes | `draft`, `published` | Default `draft`; public only when `published`. |
| `publishedAt` | datetime | No | None | Required when status is `published`. |
| `seo_title_vi` | text | No | None | Vietnamese SEO title; fallback can derive from `title_vi`. |
| `seo_title_en` | text | No | None | English SEO title; fallback can derive from `title_en`. |
| `seo_desc_vi` | textarea | No | None | Vietnamese SEO description. |
| `seo_desc_en` | textarea | No | None | English SEO description. |
| `createdAt` | datetime | System | Payload timestamp | Created timestamp. |
| `updatedAt` | datetime | System | Payload timestamp | Updated timestamp. |

### Relationships

- `BlogPosts.category -> BlogCategories.id`
- `BlogPosts.author -> Users.id`

### Indexes

| Index | Fields | Type | Purpose |
| --- | --- | --- | --- |
| `blog_posts_slug_unique` | `slug` | Unique | Blog detail route lookup. |
| `blog_posts_status_published_idx` | `status`, `publishedAt` | Composite | Public listing order. |
| `blog_posts_category_status_idx` | `category`, `status` | Composite | Category listing. |
| `blog_posts_author_idx` | `author` | Normal | Admin author filtering. |
| `blog_posts_title_vi_idx` | `title_vi` | Search/Text | Vietnamese article search/admin lookup. |
| `blog_posts_title_en_idx` | `title_en` | Search/Text | English article search/admin lookup. |

### Publication Rules

- `title_vi`, `title_en`, `content_vi`, `content_en`, `category`, `author`, `slug`,
  `coverImage`, and `publishedAt` are required before `status = published`.

## Collection: BlogCategories

Editorial categories for blog/news.

### Fields

| Field | Payload Type | Required | Relation / Shape | Validation And Notes |
| --- | --- | --- | --- | --- |
| `id` | text | System | Payload document ID | Stable unique identifier. |
| `slug` | text | Yes | None | Unique category identifier. |
| `name_vi` | text | Yes | None | Vietnamese category name. |
| `name_en` | text | Yes | None | English category name. |

### Relationships

- `BlogPosts.category -> BlogCategories.id`

### Indexes

| Index | Fields | Type | Purpose |
| --- | --- | --- | --- |
| `blog_categories_slug_unique` | `slug` | Unique | Blog category lookup. |
| `blog_categories_name_vi_idx` | `name_vi` | Search/Text | Vietnamese admin lookup. |
| `blog_categories_name_en_idx` | `name_en` | Search/Text | English admin lookup. |

## Collection: Showrooms

Physical showroom location entries.

### Fields

| Field | Payload Type | Required | Relation / Shape | Validation And Notes |
| --- | --- | --- | --- | --- |
| `id` | text | System | Payload document ID | Stable unique identifier. |
| `name` | text | Yes | None | Internal/display showroom name. |
| `address_vi` | textarea | Yes | None | Vietnamese address. |
| `address_en` | textarea | Yes | None | English address. |
| `hotline` | text | Yes | None | Phone-like format. |
| `mapEmbedUrl` | text/url | Yes | Google Maps Embed URL | Must be embeddable and domain-safe. |
| `images` | array | No | Cloudinary media references | Optional showroom images. |
| `order` | number | No | None | Default `0`; lower values appear first. |
| `status` | select | Yes | `draft`, `published` | Default `draft`; public only when `published`. |
| `createdAt` | datetime | System | Payload timestamp | Created timestamp. |
| `updatedAt` | datetime | System | Payload timestamp | Updated timestamp. |

### Relationships

- No required relationships.
- Optional future relation to regional grouping can be added without changing public
  route structure.

### Indexes

| Index | Fields | Type | Purpose |
| --- | --- | --- | --- |
| `showrooms_status_order_idx` | `status`, `order` | Composite | Public showroom list ordering. |
| `showrooms_name_idx` | `name` | Search/Text | Admin lookup. |
| `showrooms_hotline_idx` | `hotline` | Normal | Admin lookup and duplicate checks. |

### Publication Rules

- `name`, `address_vi`, `address_en`, `hotline`, and `mapEmbedUrl` are required before
  `status = published`.

## Collection: QuoteRequests

Customer consultation and quote leads submitted from the public site.

### Fields

| Field | Payload Type | Required | Relation / Shape | Validation And Notes |
| --- | --- | --- | --- | --- |
| `id` | text | System | Payload document ID | Stable unique identifier. |
| `fullName` | text | Yes | None | Customer full name. |
| `phone` | text | Yes | None | Phone-like format. |
| `email` | email | No | None | Optional; must be valid if present. |
| `productInterest` | text | No | Optional free text or product reference | Captures requested product/category interest. |
| `message` | textarea | Yes | None | Customer request details. |
| `status` | select | Yes | `new`, `in-progress`, `done` | Default `new`. |
| `createdAt` | datetime | System | Payload timestamp | Used for admin sorting and SLA review. |

### Relationships

- `productInterest` remains text for flexible quote requests. A future relation to
  `Products` can be added if lead triage requires strict product linking.

### Indexes

| Index | Fields | Type | Purpose |
| --- | --- | --- | --- |
| `quote_requests_status_created_idx` | `status`, `createdAt` | Composite | Admin lead queue filtering. |
| `quote_requests_phone_idx` | `phone` | Normal | Duplicate/contact lookup. |
| `quote_requests_email_idx` | `email` | Normal | Duplicate/contact lookup when email exists. |
| `quote_requests_name_idx` | `fullName` | Search/Text | Admin keyword search. |
| `quote_requests_interest_idx` | `productInterest` | Search/Text | Product-interest filtering/search. |

### Workflow

- `new -> in-progress -> done`
- Admin and Editor can view, filter, and update quote status.
- Public users can create quote requests but cannot read, list, update, or delete them.
- Resend email notification is sent after successful persistence; email failure must not
  delete the saved request.

## Collection: Users

Payload CMS users.

### Fields

| Field | Payload Type | Required | Relation / Shape | Validation And Notes |
| --- | --- | --- | --- | --- |
| `id` | text | System | Payload user ID | Stable unique identifier. |
| `email` | email | Yes | None | Unique login email. |
| `name` | text | Yes | None | Display name. |
| `role` | select | Yes | `admin`, `editor` | Admin manages users, settings, quote requests, and all content; Editor manages publishable content only. |
| `avatar` | text | No | Cloudinary media reference | Optional profile image. |
| `createdAt` | datetime | System | Payload timestamp | Created timestamp. |
| `updatedAt` | datetime | System | Payload timestamp | Updated timestamp. |

### Relationships

- `BlogPosts.author -> Users.id`

### Indexes

| Index | Fields | Type | Purpose |
| --- | --- | --- | --- |
| `users_email_unique` | `email` | Unique | Login and duplicate prevention. |
| `users_role_idx` | `role` | Normal | Admin filtering and access review. |
| `users_name_idx` | `name` | Search/Text | Admin user search. |

## Global: SiteSettings

Global business, brand, social, and SEO defaults.

### Fields

| Field | Payload Type | Required | Relation / Shape | Validation And Notes |
| --- | --- | --- | --- | --- |
| `logo` | text | Yes | Cloudinary media reference | Public logo image. |
| `favicon` | text | Yes | Cloudinary media reference | Browser/site icon. |
| `contact_info` | group | Yes | `{ phone, email, address_vi, address_en }` | Public company contact details. |
| `social_links` | array | No | `{ platform, url, enabled }[]` | Official social links and share destinations. |
| `seo_defaults` | group | Yes | `{ title_vi, title_en, desc_vi, desc_en, og_image }` | Fallback SEO and Open Graph values. |

### Relationships

- `seo_defaults.og_image` may point to a Cloudinary media reference for the default image.

### Indexes

Globals do not require normal document indexes because there is only one settings
document. Validate `social_links.platform` uniqueness inside the array.

## Global: HomePage

Homepage composition, hero media, CTAs, fixed product-group cards, marketing sections,
SEO, and featured catalog links.

### Fields

| Field | Payload Type | Required | Relation / Shape | Validation And Notes |
| --- | --- | --- | --- | --- |
| `hero_banners` | array | Yes | Banner objects | At least one active banner required for launch. |
| `hero_banners.title_vi` | text | Yes | Nested banner field | Vietnamese hero title. |
| `hero_banners.title_en` | text | Yes | Nested banner field | English hero title. |
| `hero_banners.description_vi` | textarea | No | Nested banner field | Vietnamese hero description. |
| `hero_banners.description_en` | textarea | No | Nested banner field | English hero description. |
| `hero_banners.image` | text | Yes | Cloudinary media reference | Hero/banner image. |
| `hero_banners.cta_label_vi` | text | No | Nested banner field | Vietnamese CTA label. |
| `hero_banners.cta_label_en` | text | No | Nested banner field | English CTA label. |
| `hero_banners.cta_url` | text | No | Nested banner field | Internal public path or safe external URL. |
| `hero_banners.order` | number | No | Nested banner field | Default `0`; lower values appear first. |
| `hero_banners.enabled` | checkbox | Yes | Nested banner field | Default `true`. |
| `featured_products` | relationship | No | `Products[]` | Products highlighted on homepage; must be published for public display. |
| `featured_categories` | relationship | Yes | `ProductCategories[]` | Must include wooden furniture and sanitary equipment categories for first-screen visibility. |
| `trust_badges` | array | No | Localized badges/highlights | Optional quick proof points. |
| `intro_block` | group | Yes | Localized title/body/media | Company summary section. |
| `showroom_teaser` | group | No | Localized copy and showroom links | Optional showroom preview. |
| `quote_cta_strip` | group | Yes | Localized copy and CTA link | Lead-generation CTA. |
| `testimonial_or_logo_strip` | group | No | Testimonials or partner logos | Optional trust section. |
| `section_visibility` | array | Yes | `{ key, enabled, order }[]` | Visibility and order toggles for optional sections. |
| `seo_title_vi`, `seo_title_en` | text | Yes | None | Homepage SEO title per locale. |
| `seo_desc_vi`, `seo_desc_en` | textarea | Yes | None | Homepage SEO description per locale. |

### Relationships

- `HomePage.featured_products -> Products[]`
- `HomePage.featured_categories -> ProductCategories[]`

### Indexes

Globals do not require normal document indexes because there is only one homepage
document. Implementation should sort `hero_banners` by `order` and filter by `enabled`.

### Publication Rules

- At least one enabled hero banner with Vietnamese and English title plus image is
  required for launch.
- Featured categories must include the two main product groups and remain visible in
  the first screen with the hero area.

## Cross-Collection Public Read Rules

- Public reads include only `status = published` records where a `status` field exists.
- Public reads must only expose fields needed by the public route.
- Quote request records are never publicly readable after submission.
- Admin screens must enforce role checks for all collection reads/mutations.
- Bilingual public pages must have complete Vietnamese and English required fields.

## Cross-Collection Index Summary

| Query Need | Indexes |
| --- | --- |
| Product detail by slug | `products_slug_unique` |
| Product category pages/filtering | `products_category_status_idx`, `product_categories_slug_unique` |
| Product price filters | `products_price_idx` |
| Featured homepage products | `products_featured_status_idx` |
| Product search | `products_name_vi_idx`, `products_name_en_idx`, optional attribute text index |
| Blog detail by slug | `blog_posts_slug_unique` |
| Blog listing/category | `blog_posts_status_published_idx`, `blog_posts_category_status_idx` |
| Showroom listing | `showrooms_status_order_idx` |
| Quote admin queue | `quote_requests_status_created_idx` |
| Quote duplicate/contact lookup | `quote_requests_phone_idx`, `quote_requests_email_idx` |
| User access review | `users_email_unique`, `users_role_idx` |

## Traceability

| Model Area | Requirements |
| --- | --- |
| Products, ProductCategories | SPEC-FR-003 to SPEC-FR-006, SPEC-FR-014, SPEC-FR-015 |
| BlogPosts, BlogCategories | SPEC-FR-016, SPEC-FR-017, NFR-06 |
| Showrooms | SPEC-FR-010, SPEC-FR-019 |
| QuoteRequests | SPEC-FR-007 to SPEC-FR-009, SPEC-FR-018, NFR-05 |
| Users | SPEC-FR-020, SPEC-FR-021, SPEC-FR-028 |
| SiteSettings | SPEC-FR-009, SPEC-FR-011, SPEC-FR-024, SPEC-FR-025 |
| HomePage | SPEC-FR-001, CUST-FR-01, CUST-FR-08, NFR-06 |

