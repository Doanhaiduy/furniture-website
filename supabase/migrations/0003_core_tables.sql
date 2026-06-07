-- 0003_core_tables.sql
-- Core table definitions. Foreign keys, unique indexes, checks, RLS and RPCs
-- are intentionally split into later migrations for reviewability.

begin;

create table if not exists public.profiles (
  id uuid primary key,
  email text not null,
  full_name text not null,
  role public.cms_role not null default 'editor',
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table public.profiles is
  'Admin/Editor CMS profile. id references auth.users(id). profiles.email is duplicated for admin display/search; auth.users.email remains the identity source of truth.';

create table if not exists public.media_assets (
  id uuid primary key default extensions.gen_random_uuid(),
  storage_provider public.storage_provider not null default 'supabase_storage',
  bucket text,
  object_path text,
  cloudinary_public_id text,
  public_url text not null,
  resource_type public.media_resource_type not null,
  mime_type text not null,
  format text not null,
  size_bytes bigint not null,
  width int,
  height int,
  duration_seconds numeric(10,2),
  owner_context text,
  status public.media_status not null default 'active',
  uploaded_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table public.media_assets is
  'Reusable media metadata for Supabase Storage or Cloudinary. Upload validation for type, size, dimensions, and ownership context remains server-side.';

create table if not exists public.media_asset_translations (
  id uuid primary key default extensions.gen_random_uuid(),
  media_id uuid not null,
  locale public.locale_code not null,
  alt_text text,
  caption text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default extensions.gen_random_uuid(),
  singleton_key text not null default 'default',
  logo_media_id uuid,
  favicon_media_id uuid,
  default_og_image_media_id uuid,
  contact_phone text,
  contact_email text,
  quote_sender_email text,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.site_settings is
  'Singleton site settings row. Privileged settings and integration secrets must remain admin/service-only and should not be stored in public client code.';

create table if not exists public.site_setting_translations (
  id uuid primary key default extensions.gen_random_uuid(),
  site_settings_id uuid not null,
  locale public.locale_code not null,
  brand_name text not null,
  contact_address text,
  seo_default_title text not null,
  seo_default_description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_links (
  id uuid primary key default extensions.gen_random_uuid(),
  site_settings_id uuid not null,
  platform public.social_platform not null,
  label text,
  url text not null,
  is_enabled boolean not null default true,
  share_enabled boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_recipients (
  id uuid primary key default extensions.gen_random_uuid(),
  site_settings_id uuid not null,
  email text not null,
  label text,
  is_active boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.quote_recipients is
  'Private notification recipients for quote leads. Admin/service only.';

create table if not exists public.content_pages (
  id uuid primary key default extensions.gen_random_uuid(),
  key text not null,
  status public.publish_status not null default 'draft',
  published_at timestamptz,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.content_page_translations (
  id uuid primary key default extensions.gen_random_uuid(),
  page_id uuid not null,
  locale public.locale_code not null,
  slug text not null,
  title text not null,
  lead text,
  body_json jsonb,
  seo_title text,
  seo_description text,
  og_image_media_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.page_sections (
  id uuid primary key default extensions.gen_random_uuid(),
  page_id uuid not null,
  section_key text not null,
  section_type text not null,
  sort_order int not null default 0,
  is_enabled boolean not null default true,
  media_id uuid,
  settings_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.page_sections.media_id is
  'Single section hero/inline media reference. page_media stores reusable page galleries or multiple contextual assets.';

create table if not exists public.page_section_translations (
  id uuid primary key default extensions.gen_random_uuid(),
  section_id uuid not null,
  locale public.locale_code not null,
  title text,
  subtitle text,
  body_json jsonb,
  cta_label text,
  cta_href text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.page_media (
  id uuid primary key default extensions.gen_random_uuid(),
  page_id uuid not null,
  media_id uuid not null,
  context text not null default 'content',
  is_primary boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.page_media is
  'Page-to-media association for galleries and reusable contextual page assets. page_sections.media_id remains for a single section-level asset.';

create table if not exists public.product_categories (
  id uuid primary key default extensions.gen_random_uuid(),
  parent_id uuid,
  group_key public.product_group_key,
  image_media_id uuid,
  status public.publish_status not null default 'draft',
  sort_order int not null default 0,
  created_by uuid,
  updated_by uuid,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.product_category_translations (
  id uuid primary key default extensions.gen_random_uuid(),
  category_id uuid not null,
  locale public.locale_code not null,
  slug text not null,
  name text not null,
  description text,
  seo_title text,
  seo_description text,
  og_image_media_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default extensions.gen_random_uuid(),
  category_id uuid not null,
  reference_code text,
  status public.publish_status not null default 'draft',
  price_min numeric(12,2),
  price_max numeric(12,2),
  currency char(3) not null default 'VND',
  width numeric(10,2),
  depth numeric(10,2),
  height numeric(10,2),
  dimension_unit text default 'mm',
  brand_series text,
  featured boolean not null default false,
  sort_order int not null default 0,
  created_by uuid,
  updated_by uuid,
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.product_translations (
  id uuid primary key default extensions.gen_random_uuid(),
  product_id uuid not null,
  locale public.locale_code not null,
  slug text not null,
  name text not null,
  summary text not null,
  description_json jsonb not null,
  material text,
  price_display_text text,
  dimension_display_text text,
  seo_title text,
  seo_description text,
  og_image_media_id uuid,
  search_text tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_media (
  id uuid primary key default extensions.gen_random_uuid(),
  product_id uuid not null,
  media_id uuid not null,
  context text not null default 'gallery',
  is_primary boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_attribute_definitions (
  id uuid primary key default extensions.gen_random_uuid(),
  key text not null,
  data_type text not null default 'text',
  filterable boolean not null default true,
  status public.publish_status not null default 'published',
  sort_order int not null default 0,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.product_attribute_definition_translations (
  id uuid primary key default extensions.gen_random_uuid(),
  definition_id uuid not null,
  locale public.locale_code not null,
  label text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_attribute_options (
  id uuid primary key default extensions.gen_random_uuid(),
  definition_id uuid not null,
  key text not null,
  swatch_hex text,
  status public.publish_status not null default 'published',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.product_attribute_option_translations (
  id uuid primary key default extensions.gen_random_uuid(),
  option_id uuid not null,
  locale public.locale_code not null,
  label text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_attribute_values (
  id uuid primary key default extensions.gen_random_uuid(),
  product_id uuid not null,
  attribute_definition_id uuid not null,
  attribute_option_id uuid,
  value_text_vi text,
  value_text_en text,
  value_number numeric(12,2),
  value_boolean boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.product_attribute_values is
  'Product attribute value table supports either option-based values or one scalar value shape. SQL checks in 0005 reject mixed states where possible.';

create table if not exists public.blog_categories (
  id uuid primary key default extensions.gen_random_uuid(),
  status public.publish_status not null default 'draft',
  sort_order int not null default 0,
  created_by uuid,
  updated_by uuid,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.blog_category_translations (
  id uuid primary key default extensions.gen_random_uuid(),
  category_id uuid not null,
  locale public.locale_code not null,
  slug text not null,
  name text not null,
  description text,
  seo_title text,
  seo_description text,
  og_image_media_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default extensions.gen_random_uuid(),
  category_id uuid not null,
  author_id uuid not null,
  cover_media_id uuid,
  status public.publish_status not null default 'draft',
  featured boolean not null default false,
  published_at timestamptz,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.blog_post_translations (
  id uuid primary key default extensions.gen_random_uuid(),
  post_id uuid not null,
  locale public.locale_code not null,
  slug text not null,
  title text not null,
  excerpt text not null,
  body_json jsonb not null,
  seo_title text,
  seo_description text,
  og_image_media_id uuid,
  search_text tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.showrooms (
  id uuid primary key default extensions.gen_random_uuid(),
  code text,
  hotline text not null,
  google_maps_embed_url text not null,
  google_maps_fallback_url text not null,
  latitude numeric(10,7),
  longitude numeric(10,7),
  status public.publish_status not null default 'draft',
  sort_order int not null default 0,
  created_by uuid,
  updated_by uuid,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.showroom_translations (
  id uuid primary key default extensions.gen_random_uuid(),
  showroom_id uuid not null,
  locale public.locale_code not null,
  name text not null,
  address text not null,
  opening_hours text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.showroom_media (
  id uuid primary key default extensions.gen_random_uuid(),
  showroom_id uuid not null,
  media_id uuid not null,
  is_primary boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_requests (
  id uuid primary key default extensions.gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  company text,
  service text,
  message text not null,
  preferred_locale public.locale_code not null,
  product_id uuid,
  category_id uuid,
  source_path text not null,
  source_url text,
  ip_hash text,
  user_agent text,
  status public.quote_status not null default 'new',
  assigned_to uuid,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table public.quote_requests is
  'Private lead data. Public visitors must use submit_quote_request(payload jsonb) or a service-role Edge Function, and must not select this table.';

create table if not exists public.quote_request_events (
  id uuid primary key default extensions.gen_random_uuid(),
  quote_request_id uuid not null,
  actor_id uuid,
  old_status public.quote_status,
  new_status public.quote_status,
  note text,
  created_at timestamptz not null default now()
);

comment on table public.quote_request_events is
  'Append-only quote lead workflow history.';

create table if not exists public.quote_notifications (
  id uuid primary key default extensions.gen_random_uuid(),
  quote_request_id uuid not null,
  recipient_email text not null,
  provider text not null default 'resend',
  provider_message_id text,
  status public.notification_status not null default 'pending',
  attempt_count int not null default 0,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_drafts (
  id uuid primary key default extensions.gen_random_uuid(),
  target_type public.ai_target_type not null,
  target_id uuid,
  locale public.locale_code,
  prompt_type text not null,
  prompt_input_hash text,
  output_json jsonb not null,
  status public.ai_draft_status not null default 'draft',
  requested_by uuid not null,
  reviewed_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.ai_drafts is
  'Draft-only AI output. target_id is polymorphic by target_type, so PostgreSQL cannot enforce a single FK. Enforce target-specific permissions in server code/RLS-aware RPCs.';

create table if not exists public.audit_logs (
  id uuid primary key default extensions.gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

comment on table public.audit_logs is
  'Trusted mutation audit trail. Prefer service-role writes from server code; admin reads only.';

commit;
