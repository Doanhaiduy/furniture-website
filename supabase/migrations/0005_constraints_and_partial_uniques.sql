-- 0005_constraints_and_partial_uniques.sql
-- Check constraints, unique/partial unique indexes, and publish validation.

begin;

-- Unique and partial unique indexes.
create unique index uq_profiles_email_lower on public.profiles (lower(email));

create unique index uq_media_assets_storage_identity
  on public.media_assets (storage_provider, bucket, object_path)
  where storage_provider = 'supabase_storage'::public.storage_provider
    and bucket is not null
    and object_path is not null
    and deleted_at is null;

create unique index uq_media_assets_cloudinary_public_id
  on public.media_assets (cloudinary_public_id)
  where storage_provider = 'cloudinary'::public.storage_provider
    and cloudinary_public_id is not null
    and deleted_at is null;

create unique index uq_media_asset_translations_media_locale
  on public.media_asset_translations (media_id, locale);

create unique index uq_site_settings_singleton_key on public.site_settings (singleton_key);
create unique index uq_site_setting_translations_settings_locale
  on public.site_setting_translations (site_settings_id, locale);
create unique index uq_social_links_settings_platform
  on public.social_links (site_settings_id, platform);

-- Active recipient uniqueness allows inactive historical duplicates.
create unique index uq_quote_recipients_active_email
  on public.quote_recipients (site_settings_id, lower(email))
  where is_active;

create unique index uq_content_pages_key on public.content_pages (key);
create unique index uq_content_page_translations_page_locale
  on public.content_page_translations (page_id, locale);
create unique index uq_content_page_translations_locale_slug
  on public.content_page_translations (locale, slug);
create unique index uq_page_sections_page_section_key
  on public.page_sections (page_id, section_key);
create unique index uq_page_section_translations_section_locale
  on public.page_section_translations (section_id, locale);
create unique index uq_page_media_page_media
  on public.page_media (page_id, media_id);
create unique index uq_page_media_one_primary_per_page
  on public.page_media (page_id)
  where is_primary;

create unique index uq_product_category_translations_category_locale
  on public.product_category_translations (category_id, locale);
create unique index uq_product_category_translations_locale_slug
  on public.product_category_translations (locale, slug);
create unique index uq_products_reference_code_active
  on public.products (lower(reference_code))
  where reference_code is not null and deleted_at is null;
create unique index uq_product_translations_product_locale
  on public.product_translations (product_id, locale);
create unique index uq_product_translations_locale_slug
  on public.product_translations (locale, slug);
create unique index uq_product_media_product_media
  on public.product_media (product_id, media_id);
create unique index uq_product_media_one_primary_per_product
  on public.product_media (product_id)
  where is_primary;

create unique index uq_product_attribute_definitions_key_active
  on public.product_attribute_definitions (lower(key))
  where deleted_at is null;
create unique index uq_product_attribute_definition_translations_definition_locale
  on public.product_attribute_definition_translations (definition_id, locale);
create unique index uq_product_attribute_options_definition_key_active
  on public.product_attribute_options (definition_id, lower(key))
  where deleted_at is null;
create unique index uq_product_attribute_option_translations_option_locale
  on public.product_attribute_option_translations (option_id, locale);
create unique index uq_product_attribute_values_option
  on public.product_attribute_values (product_id, attribute_definition_id, attribute_option_id)
  where attribute_option_id is not null;
create unique index uq_product_attribute_values_scalar
  on public.product_attribute_values (product_id, attribute_definition_id)
  where attribute_option_id is null;

create unique index uq_blog_category_translations_category_locale
  on public.blog_category_translations (category_id, locale);
create unique index uq_blog_category_translations_locale_slug
  on public.blog_category_translations (locale, slug);
create unique index uq_blog_post_translations_post_locale
  on public.blog_post_translations (post_id, locale);
create unique index uq_blog_post_translations_locale_slug
  on public.blog_post_translations (locale, slug);

create unique index uq_showrooms_code_active
  on public.showrooms (lower(code))
  where code is not null and deleted_at is null;
create unique index uq_showroom_translations_showroom_locale
  on public.showroom_translations (showroom_id, locale);
create unique index uq_showroom_media_showroom_media
  on public.showroom_media (showroom_id, media_id);
create unique index uq_showroom_media_one_primary_per_showroom
  on public.showroom_media (showroom_id)
  where is_primary;

-- Basic domain checks.
alter table public.profiles
  add constraint chk_profiles_email_shape
  check (email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'),
  add constraint chk_profiles_full_name_not_blank
  check (public.compact_text(full_name) is not null);

alter table public.media_assets
  add constraint chk_media_assets_positive_size
  check (size_bytes > 0),
  add constraint chk_media_assets_dimensions
  check (
    (width is null or width > 0)
    and (height is null or height > 0)
    and (duration_seconds is null or duration_seconds >= 0)
  ),
  add constraint chk_media_assets_provider_identity
  check (
    (
      storage_provider = 'supabase_storage'::public.storage_provider
      and public.compact_text(bucket) is not null
      and public.compact_text(object_path) is not null
    )
    or (
      storage_provider = 'cloudinary'::public.storage_provider
      and public.compact_text(cloudinary_public_id) is not null
    )
  ),
  add constraint chk_media_assets_public_url_http
  check (public_url ~* '^https?://');

alter table public.site_settings
  add constraint chk_site_settings_singleton_default
  check (singleton_key = 'default'),
  add constraint chk_site_settings_contact_email
  check (contact_email is null or contact_email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'),
  add constraint chk_site_settings_quote_sender_email
  check (quote_sender_email is null or quote_sender_email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$');

alter table public.social_links
  add constraint chk_social_links_url_http
  check (url ~* '^https?://');

alter table public.quote_recipients
  add constraint chk_quote_recipients_email
  check (email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$');

alter table public.content_pages
  add constraint chk_content_pages_key_not_blank
  check (public.compact_text(key) is not null),
  add constraint chk_content_pages_published_at
  check (status <> 'published'::public.publish_status or published_at is not null);

alter table public.content_page_translations
  add constraint chk_content_page_translations_slug_not_blank
  check (public.compact_text(slug) is not null),
  add constraint chk_content_page_translations_title_not_blank
  check (public.compact_text(title) is not null);

alter table public.page_sections
  add constraint chk_page_sections_keys_not_blank
  check (
    public.compact_text(section_key) is not null
    and public.compact_text(section_type) is not null
  );

alter table public.page_section_translations
  add constraint chk_page_section_translations_cta_href
  check (
    cta_href is null
    or cta_href ~* '^(https?://|/|mailto:|tel:)'
  );

alter table public.product_categories
  add constraint chk_product_categories_published_at
  check (status <> 'published'::public.publish_status or published_at is not null);

alter table public.product_category_translations
  add constraint chk_product_category_translations_slug_not_blank
  check (public.compact_text(slug) is not null),
  add constraint chk_product_category_translations_name_not_blank
  check (public.compact_text(name) is not null);

alter table public.products
  add constraint chk_products_price_range
  check (
    (price_min is null or price_min >= 0)
    and (price_max is null or price_max >= 0)
    and (price_min is null or price_max is null or price_max >= price_min)
  ),
  add constraint chk_products_dimensions_non_negative
  check (
    (width is null or width >= 0)
    and (depth is null or depth >= 0)
    and (height is null or height >= 0)
  ),
  add constraint chk_products_currency_iso_like
  check (currency ~ '^[A-Z]{3}$'),
  add constraint chk_products_published_at
  check (status <> 'published'::public.publish_status or published_at is not null);

alter table public.product_translations
  add constraint chk_product_translations_slug_not_blank
  check (public.compact_text(slug) is not null),
  add constraint chk_product_translations_required_text
  check (
    public.compact_text(name) is not null
    and public.compact_text(summary) is not null
  );

alter table public.product_attribute_definitions
  add constraint chk_product_attribute_definitions_key_not_blank
  check (public.compact_text(key) is not null),
  add constraint chk_product_attribute_definitions_data_type
  check (data_type in ('text', 'number', 'boolean', 'option'));

alter table public.product_attribute_options
  add constraint chk_product_attribute_options_key_not_blank
  check (public.compact_text(key) is not null),
  add constraint chk_product_attribute_options_swatch_hex
  check (swatch_hex is null or swatch_hex ~* '^#[0-9a-f]{6}$');

alter table public.product_attribute_values
  add constraint chk_product_attribute_values_shape
  check (
    (
      attribute_option_id is not null
      and value_text_vi is null
      and value_text_en is null
      and value_number is null
      and value_boolean is null
    )
    or (
      attribute_option_id is null
      and (
        (
          (value_text_vi is not null or value_text_en is not null)
          and value_number is null
          and value_boolean is null
        )
        or (
          value_number is not null
          and value_text_vi is null
          and value_text_en is null
          and value_boolean is null
        )
        or (
          value_boolean is not null
          and value_text_vi is null
          and value_text_en is null
          and value_number is null
        )
      )
    )
  );

alter table public.blog_categories
  add constraint chk_blog_categories_published_at
  check (status <> 'published'::public.publish_status or published_at is not null);

alter table public.blog_category_translations
  add constraint chk_blog_category_translations_slug_not_blank
  check (public.compact_text(slug) is not null),
  add constraint chk_blog_category_translations_name_not_blank
  check (public.compact_text(name) is not null);

alter table public.blog_posts
  add constraint chk_blog_posts_published_at
  check (status <> 'published'::public.publish_status or published_at is not null);

alter table public.blog_post_translations
  add constraint chk_blog_post_translations_slug_not_blank
  check (public.compact_text(slug) is not null),
  add constraint chk_blog_post_translations_required_text
  check (
    public.compact_text(title) is not null
    and public.compact_text(excerpt) is not null
  );

alter table public.showrooms
  add constraint chk_showrooms_map_urls_https
  check (
    google_maps_embed_url ~* '^https://'
    and google_maps_fallback_url ~* '^https://'
  ),
  add constraint chk_showrooms_coordinates
  check (
    (latitude is null or latitude between -90 and 90)
    and (longitude is null or longitude between -180 and 180)
  ),
  add constraint chk_showrooms_published_at
  check (status <> 'published'::public.publish_status or published_at is not null);

alter table public.showroom_translations
  add constraint chk_showroom_translations_required_text
  check (
    public.compact_text(name) is not null
    and public.compact_text(address) is not null
  );

alter table public.quote_requests
  add constraint chk_quote_requests_required_text
  check (
    public.compact_text(full_name) is not null
    and public.compact_text(phone) is not null
    and public.compact_text(message) is not null
    and public.compact_text(source_path) is not null
  ),
  add constraint chk_quote_requests_phone_shape
  check (phone ~ '^[0-9+().\-\s]{7,32}$'),
  add constraint chk_quote_requests_email_shape
  check (email is null or email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'),
  add constraint chk_quote_requests_source_path_shape
  check (source_path like '/%'),
  add constraint chk_quote_requests_source_url_http
  check (source_url is null or source_url ~* '^https?://');

alter table public.quote_notifications
  add constraint chk_quote_notifications_recipient_email
  check (recipient_email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'),
  add constraint chk_quote_notifications_attempt_count
  check (attempt_count >= 0);

alter table public.ai_drafts
  add constraint chk_ai_drafts_prompt_type_not_blank
  check (public.compact_text(prompt_type) is not null),
  add constraint chk_ai_drafts_reviewed_when_final
  check (status = 'draft'::public.ai_draft_status or reviewed_by is not null);

alter table public.audit_logs
  add constraint chk_audit_logs_required_text
  check (
    public.compact_text(action) is not null
    and public.compact_text(entity_type) is not null
  );

-- Publish validation requiring both vi and en translations before publishing.
create or replace function public.require_publish_translations()
returns trigger
language plpgsql
as $$
declare
  translation_count int;
begin
  if new.status <> 'published'::public.publish_status then
    return new;
  end if;

  case tg_table_name
    when 'content_pages' then
      select count(distinct locale)
      into translation_count
      from public.content_page_translations
      where page_id = new.id
        and locale in ('vi'::public.locale_code, 'en'::public.locale_code)
        and public.compact_text(slug) is not null
        and public.compact_text(title) is not null;

    when 'product_categories' then
      select count(distinct locale)
      into translation_count
      from public.product_category_translations
      where category_id = new.id
        and locale in ('vi'::public.locale_code, 'en'::public.locale_code)
        and public.compact_text(slug) is not null
        and public.compact_text(name) is not null;

    when 'products' then
      select count(distinct locale)
      into translation_count
      from public.product_translations
      where product_id = new.id
        and locale in ('vi'::public.locale_code, 'en'::public.locale_code)
        and public.compact_text(slug) is not null
        and public.compact_text(name) is not null
        and public.compact_text(summary) is not null
        and description_json is not null;

    when 'product_attribute_definitions' then
      select count(distinct locale)
      into translation_count
      from public.product_attribute_definition_translations
      where definition_id = new.id
        and locale in ('vi'::public.locale_code, 'en'::public.locale_code)
        and public.compact_text(label) is not null;

    when 'product_attribute_options' then
      select count(distinct locale)
      into translation_count
      from public.product_attribute_option_translations
      where option_id = new.id
        and locale in ('vi'::public.locale_code, 'en'::public.locale_code)
        and public.compact_text(label) is not null;

    when 'blog_categories' then
      select count(distinct locale)
      into translation_count
      from public.blog_category_translations
      where category_id = new.id
        and locale in ('vi'::public.locale_code, 'en'::public.locale_code)
        and public.compact_text(slug) is not null
        and public.compact_text(name) is not null;

    when 'blog_posts' then
      select count(distinct locale)
      into translation_count
      from public.blog_post_translations
      where post_id = new.id
        and locale in ('vi'::public.locale_code, 'en'::public.locale_code)
        and public.compact_text(slug) is not null
        and public.compact_text(title) is not null
        and public.compact_text(excerpt) is not null
        and body_json is not null;

    when 'showrooms' then
      select count(distinct locale)
      into translation_count
      from public.showroom_translations
      where showroom_id = new.id
        and locale in ('vi'::public.locale_code, 'en'::public.locale_code)
        and public.compact_text(name) is not null
        and public.compact_text(address) is not null;

    else
      translation_count := 2;
  end case;

  if translation_count < 2 then
    raise exception 'Cannot publish %.% without required vi and en translations', tg_table_schema, tg_table_name
      using errcode = '23514';
  end if;

  return new;
end;
$$;

comment on function public.require_publish_translations() is
  'Blocks publishing public content unless required vi and en translation rows exist. Also keep server-side publish validation in the CMS/API layer.';

create trigger trg_content_pages_require_publish_translations
  before insert or update of status on public.content_pages
  for each row execute function public.require_publish_translations();

create trigger trg_product_categories_require_publish_translations
  before insert or update of status on public.product_categories
  for each row execute function public.require_publish_translations();

create trigger trg_products_require_publish_translations
  before insert or update of status on public.products
  for each row execute function public.require_publish_translations();

create trigger trg_blog_categories_require_publish_translations
  before insert or update of status on public.blog_categories
  for each row execute function public.require_publish_translations();

create trigger trg_blog_posts_require_publish_translations
  before insert or update of status on public.blog_posts
  for each row execute function public.require_publish_translations();

create trigger trg_showrooms_require_publish_translations
  before insert or update of status on public.showrooms
  for each row execute function public.require_publish_translations();

commit;
