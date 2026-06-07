# Supabase / PostgreSQL Database Design

Generated: 2026-06-06

## Notes

This design converts the current business documentation and frontend/admin handoff into a Supabase/PostgreSQL-first schema. Existing project docs mention Payload CMS, but this file intentionally designs the database boundary for Supabase Auth, PostgreSQL, RLS, and server-side API/Edge Function usage.

Out of scope remains unchanged: no cart, no online payment, no order management, no order tracking, no inventory/fulfillment, and no mobile-app specific data.

Design goals:

- Normalize core entities while keeping CMS content practical to edit.
- Use UUID public IDs.
- Use `status`, `created_at`, `updated_at`, and `deleted_at` consistently.
- Separate localized content into translation tables for Vietnamese and English.
- Keep private lead/admin data behind RLS and service-role APIs.
- Keep media provider flexible enough for Supabase Storage or Cloudinary metadata.

## Main Modules

| Module | Purpose | Main entities |
| --- | --- | --- |
| Auth and RBAC | Supabase Auth identity plus Admin/Editor profile data. | `auth.users`, `profiles` |
| Site Settings | Brand, contacts, SEO defaults, social links, quote recipients. | `site_settings`, `site_setting_translations`, `social_links`, `quote_recipients` |
| CMS Pages | Homepage and About page content with sections and bilingual content. | `content_pages`, `content_page_translations`, `page_sections`, `page_section_translations`, `page_media` |
| Media | Reusable media metadata and localized alt/caption text. | `media_assets`, `media_asset_translations` |
| Product Catalog | Quote-first catalog, categories, filters, attributes, media gallery. | `product_categories`, `product_category_translations`, `products`, `product_translations`, `product_media`, `product_attribute_*` |
| Blog | Editorial posts, categories, localized slugs, rich content, SEO. | `blog_categories`, `blog_category_translations`, `blog_posts`, `blog_post_translations` |
| Showrooms | Physical locations, localized addresses, maps, galleries. | `showrooms`, `showroom_translations`, `showroom_media` |
| Quote Leads | Public consultation/quote requests and private admin workflow. | `quote_requests`, `quote_request_events`, `quote_notifications` |
| AI Drafts | Draft-only AI content/SEO/translation suggestions. | `ai_drafts` |
| Audit | Admin/service mutation audit trail. | `audit_logs` |

## A. Domain Model

| Entity | Module | Important fields | Constraints |
| --- | --- | --- | --- |
| `profiles` | Auth/RBAC | `id`, `email`, `full_name`, `role`, `is_active`, `last_login_at`, `created_at`, `updated_at`, `deleted_at` | `id` references `auth.users`; `email` unique; `role` enum `admin/editor`; soft delete. |
| `media_assets` | Media | `id`, `storage_provider`, `bucket`, `object_path`, `public_url`, `resource_type`, `mime_type`, `size_bytes`, `owner_context`, `uploaded_by`, `created_at`, `updated_at`, `deleted_at` | Provider/path unique; resource and size validated server-side; soft delete. |
| `media_asset_translations` | Media | `media_id`, `locale`, `alt_text`, `caption` | Unique `(media_id, locale)`; alt text required before publishing meaningful public media. |
| `site_settings` | Settings | `id`, media FKs, public contact fields, `updated_by`, timestamps | Singleton row, only Admin/service can mutate. |
| `site_setting_translations` | Settings | `site_settings_id`, `locale`, `brand_name`, address, SEO defaults | Unique `(site_settings_id, locale)`. |
| `social_links` | Settings | `site_settings_id`, `platform`, `url`, `is_enabled`, `share_enabled`, `sort_order` | Unique `(site_settings_id, platform)`; URL validated server-side. |
| `quote_recipients` | Settings | `site_settings_id`, `email`, `is_active`, `created_by` | Unique active recipient email; Admin/service only. |
| `content_pages` | CMS pages | `id`, `key`, `status`, `published_at`, `created_by`, `updated_by`, timestamps, `deleted_at` | `key` unique; status enum; soft delete. |
| `content_page_translations` | CMS pages | `page_id`, `locale`, `slug`, `title`, `lead`, `body_json`, SEO fields | Unique `(page_id, locale)` and `(locale, slug)`. |
| `page_sections` | CMS pages | `page_id`, `section_key`, `section_type`, `sort_order`, `is_enabled`, `settings_json`, `media_id` | Unique `(page_id, section_key)`; used for homepage/about editable sections. |
| `page_section_translations` | CMS pages | `section_id`, `locale`, `title`, `subtitle`, `body_json`, `cta_label`, `cta_href` | Unique `(section_id, locale)`; CTA URL validated server-side. |
| `product_categories` | Catalog | `id`, `parent_id`, `group_key`, `status`, `sort_order`, `image_media_id`, `created_by`, `updated_by`, timestamps, `deleted_at` | Self-relation; top-level groups can use `group_key`; soft delete. |
| `product_category_translations` | Catalog | `category_id`, `locale`, `slug`, `name`, `description`, SEO fields | Unique `(category_id, locale)` and `(locale, slug)`. |
| `products` | Catalog | `id`, `category_id`, `reference_code`, `status`, price range, dimensions, `brand_series`, `featured`, `sort_order`, audit fields, timestamps, `deleted_at` | `reference_code` unique when present; price min/max non-negative; soft delete. |
| `product_translations` | Catalog | `product_id`, `locale`, `slug`, `name`, `summary`, `description_json`, material and display text, SEO fields | Unique `(product_id, locale)` and `(locale, slug)`. |
| `product_media` | Catalog/media | `product_id`, `media_id`, `is_primary`, `sort_order`, `context` | Unique `(product_id, media_id)`; one primary image per product should be enforced by partial index. |
| `product_attribute_definitions` | Catalog filters | `key`, `data_type`, `filterable`, `status`, `sort_order` | `key` unique; soft delete. |
| `product_attribute_definition_translations` | Catalog filters | `definition_id`, `locale`, `label` | Unique `(definition_id, locale)`. |
| `product_attribute_options` | Catalog filters | `definition_id`, `key`, `swatch_hex`, `sort_order`, `status` | Unique `(definition_id, key)`; useful for filterable controlled values. |
| `product_attribute_option_translations` | Catalog filters | `option_id`, `locale`, `label` | Unique `(option_id, locale)`. |
| `product_attribute_values` | Catalog filters | `product_id`, `attribute_definition_id`, `attribute_option_id`, text/number/bool values | Unique `(product_id, attribute_definition_id, attribute_option_id)`; option or scalar value required. |
| `blog_categories` | Blog | `id`, `status`, `sort_order`, `created_by`, `updated_by`, timestamps, `deleted_at` | Soft delete. |
| `blog_category_translations` | Blog | `category_id`, `locale`, `slug`, `name`, `description`, SEO fields | Unique `(category_id, locale)` and `(locale, slug)`. |
| `blog_posts` | Blog | `id`, `category_id`, `author_id`, `cover_media_id`, `status`, `featured`, `published_at`, audit fields, timestamps, `deleted_at` | Public reads only published rows; soft delete. |
| `blog_post_translations` | Blog | `post_id`, `locale`, `slug`, `title`, `excerpt`, `body_json`, SEO fields | Unique `(post_id, locale)` and `(locale, slug)`. |
| `showrooms` | Showrooms | `id`, `code`, `hotline`, map URLs, coordinates, `status`, `sort_order`, audit fields, timestamps, `deleted_at` | `code` unique; map URLs validated server-side; soft delete. |
| `showroom_translations` | Showrooms | `showroom_id`, `locale`, `name`, `address`, `opening_hours` | Unique `(showroom_id, locale)`. |
| `showroom_media` | Showrooms/media | `showroom_id`, `media_id`, `is_primary`, `sort_order` | Unique `(showroom_id, media_id)`. |
| `quote_requests` | Leads | `id`, public contact fields, locale, product/category FKs, `source_path`, `status`, `assigned_to`, `admin_notes`, timestamps, `deleted_at` | Public insert only; Admin/service read/update; soft delete/retention policy. |
| `quote_request_events` | Leads | `quote_request_id`, `actor_id`, old/new status, `note`, `created_at` | Admin/service only; append-only preferred. |
| `quote_notifications` | Leads/email | `quote_request_id`, `recipient_email`, provider message id, `status`, error summary, attempts, sent/created timestamps | Service/admin only; supports resend/retry evidence. |
| `ai_drafts` | AI | `target_type`, `target_id`, `locale`, `prompt_type`, `output_json`, `status`, `requested_by`, `reviewed_by`, timestamps | Draft-only; never public; no private quote data context. |
| `audit_logs` | Audit | `actor_id`, `action`, `entity_type`, `entity_id`, `metadata`, `created_at` | Admin/service read; service writes from trusted code. |

## B. ERD Text

Relationships:

- `auth.users` 1-1 `profiles`.
- `profiles` 1-n authored/updated content rows via `created_by`, `updated_by`, `author_id`, `uploaded_by`.
- `site_settings` 1-n `site_setting_translations`.
- `site_settings` 1-n `social_links`.
- `site_settings` 1-n `quote_recipients`.
- `content_pages` 1-n `content_page_translations`.
- `content_pages` 1-n `page_sections`.
- `page_sections` 1-n `page_section_translations`.
- `media_assets` 1-n `media_asset_translations`.
- `content_pages` n-n `media_assets` through `page_media`.
- `product_categories` 1-n `product_categories` through `parent_id`.
- `product_categories` 1-n `product_category_translations`.
- `product_categories` 1-n `products`.
- `products` 1-n `product_translations`.
- `products` n-n `media_assets` through `product_media`.
- `product_attribute_definitions` 1-n `product_attribute_definition_translations`.
- `product_attribute_definitions` 1-n `product_attribute_options`.
- `product_attribute_options` 1-n `product_attribute_option_translations`.
- `products` n-n `product_attribute_definitions` through `product_attribute_values`.
- `blog_categories` 1-n `blog_category_translations`.
- `blog_categories` 1-n `blog_posts`.
- `blog_posts` 1-n `blog_post_translations`.
- `profiles` 1-n `blog_posts` through `author_id`.
- `showrooms` 1-n `showroom_translations`.
- `showrooms` n-n `media_assets` through `showroom_media`.
- `quote_requests` n-1 optional `products`.
- `quote_requests` n-1 optional `product_categories`.
- `quote_requests` n-1 optional `profiles` through `assigned_to`.
- `quote_requests` 1-n `quote_request_events`.
- `quote_requests` 1-n `quote_notifications`.
- `ai_drafts` n-1 `profiles` through `requested_by` and optional `reviewed_by`; `target_id` is polymorphic by `target_type`.
- `audit_logs` n-1 optional `profiles` through `actor_id`.

## Business Constraints

### Unique

- `profiles.email`
- `content_pages.key`
- `(content_page_translations.locale, content_page_translations.slug)`
- `(product_category_translations.locale, product_category_translations.slug)`
- `products.reference_code` when not null.
- `(product_translations.locale, product_translations.slug)`
- `(blog_category_translations.locale, blog_category_translations.slug)`
- `(blog_post_translations.locale, blog_post_translations.slug)`
- `showrooms.code`
- `(social_links.site_settings_id, social_links.platform)`
- `(quote_recipients.site_settings_id, quote_recipients.email)`
- Provider media identity: `(media_assets.storage_provider, media_assets.bucket, media_assets.object_path)` when storage-backed.

### Nullable / Not Null

- Translation `title/name/slug` fields are not null for publishable records.
- Optional fields: product price range, dimensions, brand/series, quote email/company, maps coordinates, media duration.
- `published_at` nullable until status is `published`.
- `deleted_at` nullable and set only for soft delete.
- `assigned_to`, `reviewed_by`, and AI target review fields are nullable.

### Soft Delete

Use `deleted_at` on business-critical content and private data:

- `profiles`
- `media_assets`
- `content_pages`
- `product_categories`
- `products`
- `blog_categories`
- `blog_posts`
- `showrooms`
- `quote_requests`

Public queries must always filter `status = 'published'` and `deleted_at is null`.

### Enums / Status

- `cms_role`: `admin`, `editor`
- `publish_status`: `draft`, `published`, `archived`
- `locale_code`: `vi`, `en`
- `media_resource_type`: `image`, `video`
- `media_status`: `active`, `archived`
- `storage_provider`: `supabase_storage`, `cloudinary`
- `product_group_key`: `wooden_furniture`, `sanitary_equipment`, `tiles`, `project_solutions`
- `quote_status`: `new`, `contacted`, `qualified`, `closed`, `spam`
- `notification_status`: `pending`, `sent`, `failed`, `skipped`
- `social_platform`: `facebook`, `zalo`, `youtube`, `tiktok`, `instagram`, `other`
- `ai_target_type`: `product`, `blog_post`, `content_page`, `seo`, `translation`
- `ai_draft_status`: `draft`, `accepted`, `discarded`

### Recommended DB Checks / Triggers

- Reject `price_min < 0`, `price_max < 0`, and `price_max < price_min`.
- Reject invalid public URLs for CTA/social/map fields in server validation; optional DB check can enforce `https://`.
- Use a trigger to update `updated_at`.
- Use a trigger or application publish validation to require both `vi` and `en` translations before setting content to `published`.
- Use partial unique indexes for one primary media per entity:
  - `product_media(product_id) where is_primary`
  - `showroom_media(showroom_id) where is_primary`
  - `page_media(page_id) where is_primary`
- Consider `unaccent` + `pg_trgm` indexes for Vietnamese product/blog search.

## Supabase RLS Boundary

Recommended helper functions:

- `is_admin()`: current `auth.uid()` has active `profiles.role = 'admin'`.
- `is_editor()`: current `auth.uid()` has active `profiles.role in ('admin', 'editor')`.

| Table group | Anonymous visitor | Authenticated Editor | Authenticated Admin | Service role |
| --- | --- | --- | --- | --- |
| `profiles` | No access. | Read own profile only. | Read/update all profiles except direct auth credentials. | Full. |
| Public published content: pages, sections, product categories, products, blog, showrooms, translations | Select published and not deleted only. | Select/insert/update publishable content. Delete should be soft delete only. | Full content management. | Full. |
| `media_assets`, `media_asset_translations` | Select active public media referenced by published content. | Upload/manage media for publishable content. | Full media governance. | Full. |
| `site_settings`, `site_setting_translations`, `social_links` | Select safe public fields only. Prefer views such as `public_site_settings`. | No privileged settings writes. Read safe settings. | Full. | Full. |
| `quote_recipients` | No access. | No access. | Full. | Full. |
| `quote_requests` | Preferred: no direct table access; insert through Edge Function/service role. If direct insert is used, allow insert only and no select/update/delete. | No access under Role Model Option A. | Select/update/search all. Soft delete only. | Full. |
| `quote_request_events`, `quote_notifications` | No access. | No access. | Read; update where operationally needed. | Full. |
| `ai_drafts` | No access. | Create/read/update own drafts for publishable content only. | Full eligible draft management. | Full. |
| `audit_logs` | No access. | No access or own activity read only. | Read all. | Insert/read full. |

Recommended Supabase views/RPC:

- `public_products(locale, filters...)`: expose only published rows and localized fields.
- `public_blog_posts(locale, filters...)`: expose published editorial data.
- `public_showrooms(locale)`: expose active showrooms and safe map URLs.
- `submit_quote_request(payload jsonb)`: validates, inserts lead, and queues notification using service role.
- `admin_quote_search(...)`: Admin-only search by status, keyword, date, source.

## Verification

Commands run after creating this design document:

- `pnpm lint` passed on rerun. The first parallel run failed before linting code because `test-results` did not exist at scan time.
- `pnpm typecheck` passed.
- `pnpm test` passed: 2 test files, 8 tests.
- `pnpm build` passed.

## C. DBML For dbdiagram

```dbml
Enum locale_code {
  vi
  en
}

Enum cms_role {
  admin
  editor
}

Enum publish_status {
  draft
  published
  archived
}

Enum media_resource_type {
  image
  video
}

Enum media_status {
  active
  archived
}

Enum storage_provider {
  supabase_storage
  cloudinary
}

Enum product_group_key {
  wooden_furniture
  sanitary_equipment
  tiles
  project_solutions
}

Enum quote_status {
  new
  contacted
  qualified
  closed
  spam
}

Enum notification_status {
  pending
  sent
  failed
  skipped
}

Enum social_platform {
  facebook
  zalo
  youtube
  tiktok
  instagram
  other
}

Enum ai_target_type {
  product
  blog_post
  content_page
  seo
  translation
}

Enum ai_draft_status {
  draft
  accepted
  discarded
}

Table auth_users {
  id uuid [pk]
  email text [unique]
  created_at timestamptz

  Note: 'External placeholder for Supabase auth.users. In SQL, profiles.id references auth.users(id).'
}

Table profiles {
  id uuid [pk]
  email text [not null, unique]
  full_name text [not null]
  role cms_role [not null, default: 'editor']
  is_active boolean [not null, default: true]
  last_login_at timestamptz
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  deleted_at timestamptz

  indexes {
    (role)
    (is_active)
    (deleted_at)
  }

  Note: 'Admin/Editor CMS profile. id should match auth.users.id.'
}

Table media_assets {
  id uuid [pk, default: `gen_random_uuid()`]
  storage_provider storage_provider [not null, default: 'supabase_storage']
  bucket text
  object_path text
  cloudinary_public_id text
  public_url text [not null]
  resource_type media_resource_type [not null]
  mime_type text [not null]
  format text [not null]
  size_bytes bigint [not null]
  width int
  height int
  duration_seconds numeric(10,2)
  owner_context text
  status media_status [not null, default: 'active']
  uploaded_by uuid
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  deleted_at timestamptz

  indexes {
    (storage_provider, bucket, object_path) [unique]
    (cloudinary_public_id)
    (resource_type, status)
    (owner_context)
    (uploaded_by)
    (deleted_at)
  }

  Note: 'Media metadata for Supabase Storage or Cloudinary. Validate MIME, size, dimensions and ownership server-side.'
}

Table media_asset_translations {
  id uuid [pk, default: `gen_random_uuid()`]
  media_id uuid [not null]
  locale locale_code [not null]
  alt_text text
  caption text
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    (media_id, locale) [unique]
  }
}

Table site_settings {
  id uuid [pk, default: `gen_random_uuid()`]
  singleton_key text [not null, unique, default: 'default']
  logo_media_id uuid
  favicon_media_id uuid
  default_og_image_media_id uuid
  contact_phone text
  contact_email text
  quote_sender_email text
  updated_by uuid
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  Note: 'Singleton settings row. Privileged fields must be Admin/service only.'
}

Table site_setting_translations {
  id uuid [pk, default: `gen_random_uuid()`]
  site_settings_id uuid [not null]
  locale locale_code [not null]
  brand_name text [not null]
  contact_address text
  seo_default_title text [not null]
  seo_default_description text [not null]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    (site_settings_id, locale) [unique]
  }
}

Table social_links {
  id uuid [pk, default: `gen_random_uuid()`]
  site_settings_id uuid [not null]
  platform social_platform [not null]
  label text
  url text [not null]
  is_enabled boolean [not null, default: true]
  share_enabled boolean [not null, default: false]
  sort_order int [not null, default: 0]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    (site_settings_id, platform) [unique]
    (is_enabled, sort_order)
  }
}

Table quote_recipients {
  id uuid [pk, default: `gen_random_uuid()`]
  site_settings_id uuid [not null]
  email text [not null]
  label text
  is_active boolean [not null, default: true]
  created_by uuid
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    (site_settings_id, email) [unique]
    (is_active)
  }
}

Table content_pages {
  id uuid [pk, default: `gen_random_uuid()`]
  key text [not null, unique]
  status publish_status [not null, default: 'draft']
  published_at timestamptz
  created_by uuid
  updated_by uuid
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  deleted_at timestamptz

  indexes {
    (key, status)
    (deleted_at)
  }

  Note: 'Use keys like home and about.'
}

Table content_page_translations {
  id uuid [pk, default: `gen_random_uuid()`]
  page_id uuid [not null]
  locale locale_code [not null]
  slug text [not null]
  title text [not null]
  lead text
  body_json jsonb
  seo_title text
  seo_description text
  og_image_media_id uuid
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    (page_id, locale) [unique]
    (locale, slug) [unique]
  }
}

Table page_sections {
  id uuid [pk, default: `gen_random_uuid()`]
  page_id uuid [not null]
  section_key text [not null]
  section_type text [not null]
  sort_order int [not null, default: 0]
  is_enabled boolean [not null, default: true]
  media_id uuid
  settings_json jsonb
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    (page_id, section_key) [unique]
    (page_id, sort_order)
    (is_enabled)
  }
}

Table page_section_translations {
  id uuid [pk, default: `gen_random_uuid()`]
  section_id uuid [not null]
  locale locale_code [not null]
  title text
  subtitle text
  body_json jsonb
  cta_label text
  cta_href text
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    (section_id, locale) [unique]
  }
}

Table page_media {
  id uuid [pk, default: `gen_random_uuid()`]
  page_id uuid [not null]
  media_id uuid [not null]
  context text [not null, default: 'content']
  is_primary boolean [not null, default: false]
  sort_order int [not null, default: 0]
  created_at timestamptz [not null, default: `now()`]

  indexes {
    (page_id, media_id) [unique]
    (page_id, sort_order)
  }
}

Table product_categories {
  id uuid [pk, default: `gen_random_uuid()`]
  parent_id uuid
  group_key product_group_key
  image_media_id uuid
  status publish_status [not null, default: 'draft']
  sort_order int [not null, default: 0]
  created_by uuid
  updated_by uuid
  published_at timestamptz
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  deleted_at timestamptz

  indexes {
    (parent_id)
    (group_key)
    (status, sort_order)
    (deleted_at)
  }
}

Table product_category_translations {
  id uuid [pk, default: `gen_random_uuid()`]
  category_id uuid [not null]
  locale locale_code [not null]
  slug text [not null]
  name text [not null]
  description text
  seo_title text
  seo_description text
  og_image_media_id uuid
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    (category_id, locale) [unique]
    (locale, slug) [unique]
  }
}

Table products {
  id uuid [pk, default: `gen_random_uuid()`]
  category_id uuid [not null]
  reference_code text
  status publish_status [not null, default: 'draft']
  price_min numeric(12,2)
  price_max numeric(12,2)
  currency char(3) [not null, default: 'VND']
  width numeric(10,2)
  depth numeric(10,2)
  height numeric(10,2)
  dimension_unit text [default: 'mm']
  brand_series text
  featured boolean [not null, default: false]
  sort_order int [not null, default: 0]
  created_by uuid
  updated_by uuid
  published_at timestamptz
  archived_at timestamptz
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  deleted_at timestamptz

  indexes {
    (reference_code) [unique]
    (category_id, status)
    (featured, status)
    (price_min, price_max)
    (created_at)
    (deleted_at)
  }

  Note: 'Check price_min/price_max >= 0 and price_max >= price_min when both are present.'
}

Table product_translations {
  id uuid [pk, default: `gen_random_uuid()`]
  product_id uuid [not null]
  locale locale_code [not null]
  slug text [not null]
  name text [not null]
  summary text [not null]
  description_json jsonb [not null]
  material text
  price_display_text text
  dimension_display_text text
  seo_title text
  seo_description text
  og_image_media_id uuid
  search_text tsvector
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    (product_id, locale) [unique]
    (locale, slug) [unique]
    (locale, search_text)
  }
}

Table product_media {
  id uuid [pk, default: `gen_random_uuid()`]
  product_id uuid [not null]
  media_id uuid [not null]
  context text [not null, default: 'gallery']
  is_primary boolean [not null, default: false]
  sort_order int [not null, default: 0]
  created_at timestamptz [not null, default: `now()`]

  indexes {
    (product_id, media_id) [unique]
    (product_id, sort_order)
  }
}

Table product_attribute_definitions {
  id uuid [pk, default: `gen_random_uuid()`]
  key text [not null, unique]
  data_type text [not null, default: 'text']
  filterable boolean [not null, default: true]
  status publish_status [not null, default: 'published']
  sort_order int [not null, default: 0]
  created_by uuid
  updated_by uuid
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  deleted_at timestamptz

  indexes {
    (filterable, status)
    (deleted_at)
  }
}

Table product_attribute_definition_translations {
  id uuid [pk, default: `gen_random_uuid()`]
  definition_id uuid [not null]
  locale locale_code [not null]
  label text [not null]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    (definition_id, locale) [unique]
  }
}

Table product_attribute_options {
  id uuid [pk, default: `gen_random_uuid()`]
  definition_id uuid [not null]
  key text [not null]
  swatch_hex text
  status publish_status [not null, default: 'published']
  sort_order int [not null, default: 0]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  deleted_at timestamptz

  indexes {
    (definition_id, key) [unique]
    (definition_id, status, sort_order)
    (deleted_at)
  }
}

Table product_attribute_option_translations {
  id uuid [pk, default: `gen_random_uuid()`]
  option_id uuid [not null]
  locale locale_code [not null]
  label text [not null]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    (option_id, locale) [unique]
  }
}

Table product_attribute_values {
  id uuid [pk, default: `gen_random_uuid()`]
  product_id uuid [not null]
  attribute_definition_id uuid [not null]
  attribute_option_id uuid
  value_text_vi text
  value_text_en text
  value_number numeric(12,2)
  value_boolean boolean
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    (product_id, attribute_definition_id, attribute_option_id) [unique]
    (attribute_definition_id, attribute_option_id)
    (value_number)
  }
}

Table blog_categories {
  id uuid [pk, default: `gen_random_uuid()`]
  status publish_status [not null, default: 'draft']
  sort_order int [not null, default: 0]
  created_by uuid
  updated_by uuid
  published_at timestamptz
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  deleted_at timestamptz

  indexes {
    (status, sort_order)
    (deleted_at)
  }
}

Table blog_category_translations {
  id uuid [pk, default: `gen_random_uuid()`]
  category_id uuid [not null]
  locale locale_code [not null]
  slug text [not null]
  name text [not null]
  description text
  seo_title text
  seo_description text
  og_image_media_id uuid
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    (category_id, locale) [unique]
    (locale, slug) [unique]
  }
}

Table blog_posts {
  id uuid [pk, default: `gen_random_uuid()`]
  category_id uuid [not null]
  author_id uuid [not null]
  cover_media_id uuid
  status publish_status [not null, default: 'draft']
  featured boolean [not null, default: false]
  published_at timestamptz
  created_by uuid
  updated_by uuid
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  deleted_at timestamptz

  indexes {
    (category_id, status, published_at)
    (author_id)
    (featured, status)
    (deleted_at)
  }
}

Table blog_post_translations {
  id uuid [pk, default: `gen_random_uuid()`]
  post_id uuid [not null]
  locale locale_code [not null]
  slug text [not null]
  title text [not null]
  excerpt text [not null]
  body_json jsonb [not null]
  seo_title text
  seo_description text
  og_image_media_id uuid
  search_text tsvector
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    (post_id, locale) [unique]
    (locale, slug) [unique]
    (locale, search_text)
  }
}

Table showrooms {
  id uuid [pk, default: `gen_random_uuid()`]
  code text [unique]
  hotline text [not null]
  google_maps_embed_url text [not null]
  google_maps_fallback_url text [not null]
  latitude numeric(10,7)
  longitude numeric(10,7)
  status publish_status [not null, default: 'draft']
  sort_order int [not null, default: 0]
  created_by uuid
  updated_by uuid
  published_at timestamptz
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  deleted_at timestamptz

  indexes {
    (status, sort_order)
    (deleted_at)
  }
}

Table showroom_translations {
  id uuid [pk, default: `gen_random_uuid()`]
  showroom_id uuid [not null]
  locale locale_code [not null]
  name text [not null]
  address text [not null]
  opening_hours text
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    (showroom_id, locale) [unique]
  }
}

Table showroom_media {
  id uuid [pk, default: `gen_random_uuid()`]
  showroom_id uuid [not null]
  media_id uuid [not null]
  is_primary boolean [not null, default: false]
  sort_order int [not null, default: 0]
  created_at timestamptz [not null, default: `now()`]

  indexes {
    (showroom_id, media_id) [unique]
    (showroom_id, sort_order)
  }
}

Table quote_requests {
  id uuid [pk, default: `gen_random_uuid()`]
  full_name text [not null]
  phone text [not null]
  email text
  company text
  service text
  message text [not null]
  preferred_locale locale_code [not null]
  product_id uuid
  category_id uuid
  source_path text [not null]
  source_url text
  ip_hash text
  user_agent text
  status quote_status [not null, default: 'new']
  assigned_to uuid
  admin_notes text
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  deleted_at timestamptz

  indexes {
    (status, created_at)
    (product_id)
    (category_id)
    (assigned_to)
    (source_path)
    (deleted_at)
  }

  Note: 'Private lead data. Public should not select this table.'
}

Table quote_request_events {
  id uuid [pk, default: `gen_random_uuid()`]
  quote_request_id uuid [not null]
  actor_id uuid
  old_status quote_status
  new_status quote_status
  note text
  created_at timestamptz [not null, default: `now()`]

  indexes {
    (quote_request_id, created_at)
    (actor_id)
  }
}

Table quote_notifications {
  id uuid [pk, default: `gen_random_uuid()`]
  quote_request_id uuid [not null]
  recipient_email text [not null]
  provider text [not null, default: 'resend']
  provider_message_id text
  status notification_status [not null, default: 'pending']
  attempt_count int [not null, default: 0]
  last_error text
  sent_at timestamptz
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    (quote_request_id)
    (status, created_at)
    (provider_message_id)
  }
}

Table ai_drafts {
  id uuid [pk, default: `gen_random_uuid()`]
  target_type ai_target_type [not null]
  target_id uuid
  locale locale_code
  prompt_type text [not null]
  prompt_input_hash text
  output_json jsonb [not null]
  status ai_draft_status [not null, default: 'draft']
  requested_by uuid [not null]
  reviewed_by uuid
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    (target_type, target_id)
    (requested_by, created_at)
    (status)
  }

  Note: 'Polymorphic target. Enforce target-specific permissions in server code/RLS helper.'
}

Table audit_logs {
  id uuid [pk, default: `gen_random_uuid()`]
  actor_id uuid
  action text [not null]
  entity_type text [not null]
  entity_id uuid
  metadata jsonb
  created_at timestamptz [not null, default: `now()`]

  indexes {
    (actor_id, created_at)
    (entity_type, entity_id)
    (action)
  }
}

Ref: profiles.id > auth_users.id

Ref: media_assets.uploaded_by > profiles.id
Ref: media_asset_translations.media_id > media_assets.id

Ref: site_settings.logo_media_id > media_assets.id
Ref: site_settings.favicon_media_id > media_assets.id
Ref: site_settings.default_og_image_media_id > media_assets.id
Ref: site_settings.updated_by > profiles.id
Ref: site_setting_translations.site_settings_id > site_settings.id
Ref: social_links.site_settings_id > site_settings.id
Ref: quote_recipients.site_settings_id > site_settings.id
Ref: quote_recipients.created_by > profiles.id

Ref: content_pages.created_by > profiles.id
Ref: content_pages.updated_by > profiles.id
Ref: content_page_translations.page_id > content_pages.id
Ref: content_page_translations.og_image_media_id > media_assets.id
Ref: page_sections.page_id > content_pages.id
Ref: page_sections.media_id > media_assets.id
Ref: page_section_translations.section_id > page_sections.id
Ref: page_media.page_id > content_pages.id
Ref: page_media.media_id > media_assets.id

Ref: product_categories.parent_id > product_categories.id
Ref: product_categories.image_media_id > media_assets.id
Ref: product_categories.created_by > profiles.id
Ref: product_categories.updated_by > profiles.id
Ref: product_category_translations.category_id > product_categories.id
Ref: product_category_translations.og_image_media_id > media_assets.id

Ref: products.category_id > product_categories.id
Ref: products.created_by > profiles.id
Ref: products.updated_by > profiles.id
Ref: product_translations.product_id > products.id
Ref: product_translations.og_image_media_id > media_assets.id
Ref: product_media.product_id > products.id
Ref: product_media.media_id > media_assets.id

Ref: product_attribute_definitions.created_by > profiles.id
Ref: product_attribute_definitions.updated_by > profiles.id
Ref: product_attribute_definition_translations.definition_id > product_attribute_definitions.id
Ref: product_attribute_options.definition_id > product_attribute_definitions.id
Ref: product_attribute_option_translations.option_id > product_attribute_options.id
Ref: product_attribute_values.product_id > products.id
Ref: product_attribute_values.attribute_definition_id > product_attribute_definitions.id
Ref: product_attribute_values.attribute_option_id > product_attribute_options.id

Ref: blog_categories.created_by > profiles.id
Ref: blog_categories.updated_by > profiles.id
Ref: blog_category_translations.category_id > blog_categories.id
Ref: blog_category_translations.og_image_media_id > media_assets.id
Ref: blog_posts.category_id > blog_categories.id
Ref: blog_posts.author_id > profiles.id
Ref: blog_posts.cover_media_id > media_assets.id
Ref: blog_posts.created_by > profiles.id
Ref: blog_posts.updated_by > profiles.id
Ref: blog_post_translations.post_id > blog_posts.id
Ref: blog_post_translations.og_image_media_id > media_assets.id

Ref: showrooms.created_by > profiles.id
Ref: showrooms.updated_by > profiles.id
Ref: showroom_translations.showroom_id > showrooms.id
Ref: showroom_media.showroom_id > showrooms.id
Ref: showroom_media.media_id > media_assets.id

Ref: quote_requests.product_id > products.id
Ref: quote_requests.category_id > product_categories.id
Ref: quote_requests.assigned_to > profiles.id
Ref: quote_request_events.quote_request_id > quote_requests.id
Ref: quote_request_events.actor_id > profiles.id
Ref: quote_notifications.quote_request_id > quote_requests.id

Ref: ai_drafts.requested_by > profiles.id
Ref: ai_drafts.reviewed_by > profiles.id
Ref: audit_logs.actor_id > profiles.id
```
