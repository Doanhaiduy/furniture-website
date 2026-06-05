# Data Model

## Scope

This model defines Payload CMS collections and globals for the public showroom website, bilingual CMS content, quote lead capture, media, and admin governance.

Out of scope: cart, checkout, online payment, order management, inventory, fulfillment, and mobile app data.

## Conventions

- Payload manages `id`, `createdAt`, and `updatedAt`.
- Locale values are `vi` and `en`.
- Publishable content uses `draft`, `published`, and `archived`.
- Detail routes use localized slugs where SEO matters.
- Images/video are stored in Cloudinary and referenced through the Payload `Media` collection.
- Publication validation blocks incomplete required localized content.

## Roles

| Role | Capabilities |
| --- | --- |
| Admin | Manage users, roles, settings, quote requests, media, integrations, and all publishable content. |
| Editor | Manage publishable content only: homepage content, about content, products, categories, blog, showrooms, and media used by those records. |

No Viewer role is required for launch.

## Collections

### Users

Payload auth collection for CMS users.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `email` | email | Yes | Unique login email. |
| `name` | text | Yes | Admin display name. |
| `role` | select | Yes | `admin` or `editor`. |
| `isActive` | checkbox | Yes | Disabled users cannot access CMS. |
| `lastLoginAt` | date | No | Operational audit. |

### Media

Payload upload collection backed by Cloudinary.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `cloudinaryPublicId` | text | Yes | Stable Cloudinary asset ID. |
| `resourceType` | select | Yes | `image` or `video`. |
| `format` | text | Yes | Validated extension/format. |
| `mimeType` | text | Yes | Allowed media MIME type. |
| `sizeBytes` | number | Yes | Enforced against max size. |
| `width`, `height` | number | No | Required when available for images/video. |
| `durationSeconds` | number | No | Video only. |
| `alt_vi`, `alt_en` | text | Conditional | Required for meaningful public images. |
| `caption_vi`, `caption_en` | text | No | Optional public caption. |
| `ownerContext` | select | No | `product`, `blog`, `showroom`, `homepage`, `about`, `settings`. |

Allowed baseline: JPEG, PNG, WebP, AVIF for images; MP4/WebM only where a video field exists.

### ProductCategories

Hierarchical categories including the two fixed top-level product groups.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `groupKey` | select | Conditional | `wooden-furniture` or `sanitary-equipment` for top-level groups. |
| `parent` | relationship | No | Self relation for category tree. |
| `slug_vi`, `slug_en` | text | Yes | Unique per locale. |
| `name_vi`, `name_en` | text | Yes | Localized category name. |
| `description_vi`, `description_en` | textarea | No | Public category intro. |
| `image` | upload | No | Relation to `Media`. |
| `order` | number | Yes | Manual ordering. |
| `status` | select | Yes | `draft`, `published`, `archived`. |
| `seo_vi`, `seo_en` | group | No | Title, description, OG image. |

### Products

Quote-first product showcase records.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `referenceCode` | text | No | Optional internal reference, not ecommerce SKU. |
| `category` | relationship | Yes | ProductCategories. |
| `slug_vi`, `slug_en` | text | Yes | Unique per locale. |
| `name_vi`, `name_en` | text | Yes | Localized product name. |
| `summary_vi`, `summary_en` | textarea | Yes | Listing/card copy. |
| `description_vi`, `description_en` | richText | Yes | Sanitized detail content. |
| `priceRange` | group | No | `min`, `max`, `currency`, `displayText_vi`, `displayText_en`. |
| `dimensions` | group | No | Width, depth, height, unit, display text. |
| `material_vi`, `material_en` | text | No | Main material. |
| `colors` | array | No | Color name per locale and optional swatch value. |
| `brandSeries` | text | No | Brand or series. |
| `attributes` | array | No | Filterable key/value attributes, localized when needed. |
| `images` | upload array | Yes for publish | Media gallery. |
| `featured` | checkbox | Yes | Homepage/listing highlight. |
| `status` | select | Yes | `draft`, `published`, `archived`. |
| `seo_vi`, `seo_en` | group | No | Title, description, OG image. |

### BlogCategories

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `slug_vi`, `slug_en` | text | Yes | Unique per locale. |
| `name_vi`, `name_en` | text | Yes | Localized category name. |
| `description_vi`, `description_en` | textarea | No | Optional. |
| `order` | number | Yes | Manual ordering. |
| `status` | select | Yes | `draft`, `published`, `archived`. |
| `seo_vi`, `seo_en` | group | No | Localized SEO fields. |

### BlogPosts

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `category` | relationship | Yes | BlogCategories. |
| `slug_vi`, `slug_en` | text | Yes | Unique per locale. |
| `title_vi`, `title_en` | text | Yes | Localized title. |
| `excerpt_vi`, `excerpt_en` | textarea | Yes | Listing and metadata fallback. |
| `body_vi`, `body_en` | richText | Yes | Sanitized editorial body. |
| `coverImage` | upload | Yes for publish | Media. |
| `author` | relationship | Yes | Users. |
| `status` | select | Yes | `draft`, `published`, `archived`. |
| `publishedAt` | date | Conditional | Required when published. |
| `seo_vi`, `seo_en` | group | No | Localized SEO fields. |

### Showrooms

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `code` | text | No | Stable internal key. |
| `name_vi`, `name_en` | text | Yes | Localized display name. |
| `address_vi`, `address_en` | textarea | Yes | Localized address. |
| `hotline` | text | Yes | Public phone/hotline. |
| `openingHours_vi`, `openingHours_en` | text | No | Optional. |
| `googleMapsEmbedUrl` | text | Yes | Valid Google Maps embed URL. |
| `googleMapsFallbackUrl` | text | Yes | Safe public fallback URL. |
| `latitude`, `longitude` | number | No | Optional. |
| `images` | upload array | No | Media gallery. |
| `order` | number | Yes | Manual ordering. |
| `status` | select | Yes | `draft`, `published`, `archived`. |

### QuoteRequests

Admin-only lead records created by public quote/contact forms.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `fullName` | text | Yes | Customer name. |
| `phone` | text | Yes | Phone-like validation. |
| `email` | email | No | Optional. |
| `company` | text | No | Optional. |
| `message` | textarea | Yes | Request details. |
| `preferredLocale` | select | Yes | `vi` or `en`. |
| `product` | relationship | No | Optional Products relation. |
| `category` | relationship | No | Optional ProductCategories relation. |
| `sourcePath` | text | Yes | Page where form was submitted. |
| `status` | select | Yes | `new`, `contacted`, `qualified`, `closed`, `spam`. |
| `adminNotes` | textarea | No | Admin-only notes. |
| `notificationStatus` | select | Yes | `pending`, `sent`, `failed`, `skipped`. |
| `notificationError` | text | No | Internal error summary only. |

Admin only. Editors have no access under Role Model Option A.

## Globals

### HomePage

CMS-managed homepage composition.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `hero.title_vi`, `hero.title_en` | text | Yes | Hero title per locale. |
| `hero.subtitle_vi`, `hero.subtitle_en` | textarea | Yes | Hero subtitle per locale. |
| `hero.media` | upload | Yes | Image or video from Media. |
| `hero.primaryCta`, `hero.secondaryCta` | group | Yes | Localized label plus safe URL. |
| `productGroupCards` | array | Yes | Exactly two fixed cards for furniture and sanitary equipment above fold. |
| `trustBadges` | array | No | Localized label/value/icon. |
| `introBlock` | group | Yes | Company summary title/body/media per locale. |
| `featuredCategories` | relationship array | No | ProductCategories. |
| `featuredProducts` | relationship array | No | Products. |
| `showroomTeaser` | group | No | Localized copy and selected showrooms. |
| `quoteCtaStrip` | group | Yes | Localized CTA copy and link. |
| `testimonialOrLogoStrip` | group | No | Testimonials or partner logos. |
| `sections` | array | Yes | Visibility/order toggles for optional sections. |
| `seo_vi`, `seo_en` | group | Yes | Homepage SEO fields. |

### AboutPage

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `title_vi`, `title_en` | text | Yes | Page title. |
| `vision_vi`, `vision_en` | richText | Yes | CMS-managed vision. |
| `mission_vi`, `mission_en` | richText | Yes | CMS-managed mission. |
| `capabilities` | array | Yes | Localized capability cards. |
| `companyTimeline` | array | No | Optional localized milestones. |
| `media` | upload array | No | Company/showroom imagery. |
| `seo_vi`, `seo_en` | group | Yes | About SEO fields. |

### SiteSettings

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `brandName_vi`, `brandName_en` | text | Yes | Public brand name. |
| `logo`, `favicon`, `defaultOgImage` | upload | Yes | Media references. |
| `contact` | group | Yes | Phone, email, address per locale. |
| `socialLinks` | array | No | Platform, URL, enabled, share enabled. |
| `quoteRecipients` | array | Yes | Admin-only Resend recipients. |
| `seoDefaults_vi`, `seoDefaults_en` | group | Yes | Default title/description. |
| `integrations` | group | No | Server-only config references, never public secrets. |

## Access Summary

| Model | Public | Editor | Admin |
| --- | --- | --- | --- |
| Users | None | None | Full |
| SiteSettings | Public safe fields only | No privileged settings | Full |
| HomePage/AboutPage | Published reads | Manage publishable fields | Full |
| Products/Categories | Published reads | Manage publishable content | Full |
| Blog/Categories | Published reads | Manage publishable content | Full |
| Showrooms | Published reads | Manage publishable content | Full |
| Media | Public delivery only | Upload/use for content | Full |
| QuoteRequests | Create only through validated form | None | Full |

## Index And Query Needs

- Localized slug indexes for products, categories, and blog.
- Product category/status, featured/status, price range, and attribute indexes.
- Product search indexes for localized name, summary, reference code, brand/series, and category.
- Blog status/date/category indexes.
- Showroom status/order indexes.
- Quote request status/date/source/keyword indexes.

## Publication Rules

- Published public records must have required `vi` and `en` fields unless a slice explicitly supports locale-specific draft state.
- Public pages never render drafts, archived records, private lead data, or privileged settings.
- AI output is draft content and must pass the same validation as human-authored content.
- Cloudinary media used as meaningful public content must have alt text in both locales.
