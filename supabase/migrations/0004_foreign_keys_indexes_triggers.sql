-- 0004_foreign_keys_indexes_triggers.sql
-- Foreign keys, non-unique indexes, and table trigger attachments.

begin;

-- Auth/RBAC
alter table public.profiles
  add constraint fk_profiles_auth_users
  foreign key (id) references auth.users(id)
  on delete cascade;

-- Media
alter table public.media_assets
  add constraint fk_media_assets_uploaded_by
  foreign key (uploaded_by) references public.profiles(id)
  on delete set null;

alter table public.media_asset_translations
  add constraint fk_media_asset_translations_media
  foreign key (media_id) references public.media_assets(id)
  on delete cascade;

-- Site settings
alter table public.site_settings
  add constraint fk_site_settings_logo_media
  foreign key (logo_media_id) references public.media_assets(id)
  on delete set null,
  add constraint fk_site_settings_favicon_media
  foreign key (favicon_media_id) references public.media_assets(id)
  on delete set null,
  add constraint fk_site_settings_default_og_media
  foreign key (default_og_image_media_id) references public.media_assets(id)
  on delete set null,
  add constraint fk_site_settings_updated_by
  foreign key (updated_by) references public.profiles(id)
  on delete set null;

alter table public.site_setting_translations
  add constraint fk_site_setting_translations_settings
  foreign key (site_settings_id) references public.site_settings(id)
  on delete cascade;

alter table public.social_links
  add constraint fk_social_links_settings
  foreign key (site_settings_id) references public.site_settings(id)
  on delete cascade;

alter table public.quote_recipients
  add constraint fk_quote_recipients_settings
  foreign key (site_settings_id) references public.site_settings(id)
  on delete cascade,
  add constraint fk_quote_recipients_created_by
  foreign key (created_by) references public.profiles(id)
  on delete set null;

-- CMS pages
alter table public.content_pages
  add constraint fk_content_pages_created_by
  foreign key (created_by) references public.profiles(id)
  on delete set null,
  add constraint fk_content_pages_updated_by
  foreign key (updated_by) references public.profiles(id)
  on delete set null;

alter table public.content_page_translations
  add constraint fk_content_page_translations_page
  foreign key (page_id) references public.content_pages(id)
  on delete cascade,
  add constraint fk_content_page_translations_og_media
  foreign key (og_image_media_id) references public.media_assets(id)
  on delete set null;

alter table public.page_sections
  add constraint fk_page_sections_page
  foreign key (page_id) references public.content_pages(id)
  on delete cascade,
  add constraint fk_page_sections_media
  foreign key (media_id) references public.media_assets(id)
  on delete set null;

alter table public.page_section_translations
  add constraint fk_page_section_translations_section
  foreign key (section_id) references public.page_sections(id)
  on delete cascade;

alter table public.page_media
  add constraint fk_page_media_page
  foreign key (page_id) references public.content_pages(id)
  on delete cascade,
  add constraint fk_page_media_media
  foreign key (media_id) references public.media_assets(id)
  on delete cascade;

-- Product catalog
alter table public.product_categories
  add constraint fk_product_categories_parent
  foreign key (parent_id) references public.product_categories(id)
  on delete set null,
  add constraint fk_product_categories_image_media
  foreign key (image_media_id) references public.media_assets(id)
  on delete set null,
  add constraint fk_product_categories_created_by
  foreign key (created_by) references public.profiles(id)
  on delete set null,
  add constraint fk_product_categories_updated_by
  foreign key (updated_by) references public.profiles(id)
  on delete set null;

alter table public.product_category_translations
  add constraint fk_product_category_translations_category
  foreign key (category_id) references public.product_categories(id)
  on delete cascade,
  add constraint fk_product_category_translations_og_media
  foreign key (og_image_media_id) references public.media_assets(id)
  on delete set null;

alter table public.products
  add constraint fk_products_category
  foreign key (category_id) references public.product_categories(id)
  on delete restrict,
  add constraint fk_products_created_by
  foreign key (created_by) references public.profiles(id)
  on delete set null,
  add constraint fk_products_updated_by
  foreign key (updated_by) references public.profiles(id)
  on delete set null;

alter table public.product_translations
  add constraint fk_product_translations_product
  foreign key (product_id) references public.products(id)
  on delete cascade,
  add constraint fk_product_translations_og_media
  foreign key (og_image_media_id) references public.media_assets(id)
  on delete set null;

alter table public.product_media
  add constraint fk_product_media_product
  foreign key (product_id) references public.products(id)
  on delete cascade,
  add constraint fk_product_media_media
  foreign key (media_id) references public.media_assets(id)
  on delete cascade;

alter table public.product_attribute_definitions
  add constraint fk_product_attribute_definitions_created_by
  foreign key (created_by) references public.profiles(id)
  on delete set null,
  add constraint fk_product_attribute_definitions_updated_by
  foreign key (updated_by) references public.profiles(id)
  on delete set null;

alter table public.product_attribute_definition_translations
  add constraint fk_product_attribute_definition_translations_definition
  foreign key (definition_id) references public.product_attribute_definitions(id)
  on delete cascade;

alter table public.product_attribute_options
  add constraint fk_product_attribute_options_definition
  foreign key (definition_id) references public.product_attribute_definitions(id)
  on delete cascade,
  add constraint uq_product_attribute_options_id_definition
  unique (id, definition_id);

alter table public.product_attribute_option_translations
  add constraint fk_product_attribute_option_translations_option
  foreign key (option_id) references public.product_attribute_options(id)
  on delete cascade;

alter table public.product_attribute_values
  add constraint fk_product_attribute_values_product
  foreign key (product_id) references public.products(id)
  on delete cascade,
  add constraint fk_product_attribute_values_definition
  foreign key (attribute_definition_id) references public.product_attribute_definitions(id)
  on delete restrict,
  add constraint fk_product_attribute_values_option
  foreign key (attribute_option_id) references public.product_attribute_options(id)
  on delete restrict,
  add constraint fk_product_attribute_values_option_matches_definition
  foreign key (attribute_option_id, attribute_definition_id)
  references public.product_attribute_options(id, definition_id)
  on delete restrict;

-- Blog
alter table public.blog_categories
  add constraint fk_blog_categories_created_by
  foreign key (created_by) references public.profiles(id)
  on delete set null,
  add constraint fk_blog_categories_updated_by
  foreign key (updated_by) references public.profiles(id)
  on delete set null;

alter table public.blog_category_translations
  add constraint fk_blog_category_translations_category
  foreign key (category_id) references public.blog_categories(id)
  on delete cascade,
  add constraint fk_blog_category_translations_og_media
  foreign key (og_image_media_id) references public.media_assets(id)
  on delete set null;

alter table public.blog_posts
  add constraint fk_blog_posts_category
  foreign key (category_id) references public.blog_categories(id)
  on delete restrict,
  add constraint fk_blog_posts_author
  foreign key (author_id) references public.profiles(id)
  on delete restrict,
  add constraint fk_blog_posts_cover_media
  foreign key (cover_media_id) references public.media_assets(id)
  on delete set null,
  add constraint fk_blog_posts_created_by
  foreign key (created_by) references public.profiles(id)
  on delete set null,
  add constraint fk_blog_posts_updated_by
  foreign key (updated_by) references public.profiles(id)
  on delete set null;

alter table public.blog_post_translations
  add constraint fk_blog_post_translations_post
  foreign key (post_id) references public.blog_posts(id)
  on delete cascade,
  add constraint fk_blog_post_translations_og_media
  foreign key (og_image_media_id) references public.media_assets(id)
  on delete set null;

-- Showrooms
alter table public.showrooms
  add constraint fk_showrooms_created_by
  foreign key (created_by) references public.profiles(id)
  on delete set null,
  add constraint fk_showrooms_updated_by
  foreign key (updated_by) references public.profiles(id)
  on delete set null;

alter table public.showroom_translations
  add constraint fk_showroom_translations_showroom
  foreign key (showroom_id) references public.showrooms(id)
  on delete cascade;

alter table public.showroom_media
  add constraint fk_showroom_media_showroom
  foreign key (showroom_id) references public.showrooms(id)
  on delete cascade,
  add constraint fk_showroom_media_media
  foreign key (media_id) references public.media_assets(id)
  on delete cascade;

-- Quote leads
alter table public.quote_requests
  add constraint fk_quote_requests_product
  foreign key (product_id) references public.products(id)
  on delete set null,
  add constraint fk_quote_requests_category
  foreign key (category_id) references public.product_categories(id)
  on delete set null,
  add constraint fk_quote_requests_assigned_to
  foreign key (assigned_to) references public.profiles(id)
  on delete set null;

alter table public.quote_request_events
  add constraint fk_quote_request_events_quote_request
  foreign key (quote_request_id) references public.quote_requests(id)
  on delete cascade,
  add constraint fk_quote_request_events_actor
  foreign key (actor_id) references public.profiles(id)
  on delete set null;

alter table public.quote_notifications
  add constraint fk_quote_notifications_quote_request
  foreign key (quote_request_id) references public.quote_requests(id)
  on delete cascade;

-- AI and audit
alter table public.ai_drafts
  add constraint fk_ai_drafts_requested_by
  foreign key (requested_by) references public.profiles(id)
  on delete restrict,
  add constraint fk_ai_drafts_reviewed_by
  foreign key (reviewed_by) references public.profiles(id)
  on delete set null;

alter table public.audit_logs
  add constraint fk_audit_logs_actor
  foreign key (actor_id) references public.profiles(id)
  on delete set null;

-- Non-unique indexes for common joins, public filters, admin filters, and search.
create index idx_profiles_role on public.profiles (role);
create index idx_profiles_is_active on public.profiles (is_active);
create index idx_profiles_deleted_at on public.profiles (deleted_at);
create index idx_profiles_email_trgm on public.profiles using gin (public.immutable_unaccent(lower(email)) gin_trgm_ops);

create index idx_media_assets_cloudinary_public_id on public.media_assets (cloudinary_public_id);
create index idx_media_assets_resource_status on public.media_assets (resource_type, status);
create index idx_media_assets_owner_context on public.media_assets (owner_context);
create index idx_media_assets_uploaded_by on public.media_assets (uploaded_by);
create index idx_media_assets_deleted_at on public.media_assets (deleted_at);
create index idx_media_asset_translations_media_locale on public.media_asset_translations (media_id, locale);

create index idx_site_setting_translations_locale on public.site_setting_translations (locale);
create index idx_social_links_enabled_sort on public.social_links (is_enabled, sort_order);
create index idx_quote_recipients_active on public.quote_recipients (is_active);

create index idx_content_pages_key_status on public.content_pages (key, status);
create index idx_content_pages_public on public.content_pages (key, published_at desc)
  where status = 'published'::public.publish_status and deleted_at is null;
create index idx_content_pages_deleted_at on public.content_pages (deleted_at);
create index idx_content_page_translations_page_locale on public.content_page_translations (page_id, locale);
create index idx_content_page_translations_locale_slug on public.content_page_translations (locale, slug);
create index idx_page_sections_page_sort on public.page_sections (page_id, sort_order);
create index idx_page_sections_enabled on public.page_sections (is_enabled);
create index idx_page_section_translations_section_locale on public.page_section_translations (section_id, locale);
create index idx_page_media_page_sort on public.page_media (page_id, sort_order);
create index idx_page_media_media on public.page_media (media_id);

create index idx_product_categories_parent on public.product_categories (parent_id);
create index idx_product_categories_group_key on public.product_categories (group_key);
create index idx_product_categories_status_sort on public.product_categories (status, sort_order);
create index idx_product_categories_public on public.product_categories (group_key, sort_order)
  where status = 'published'::public.publish_status and deleted_at is null;
create index idx_product_categories_deleted_at on public.product_categories (deleted_at);
create index idx_product_category_translations_category_locale on public.product_category_translations (category_id, locale);
create index idx_product_category_translations_locale_slug on public.product_category_translations (locale, slug);
create index idx_product_category_translations_name_trgm
  on public.product_category_translations using gin (public.immutable_unaccent(lower(name)) gin_trgm_ops);

create index idx_products_category_status on public.products (category_id, status);
create index idx_products_featured_status on public.products (featured, status);
create index idx_products_price_range on public.products (price_min, price_max);
create index idx_products_created_at on public.products (created_at);
create index idx_products_deleted_at on public.products (deleted_at);
create index idx_products_public_sort on public.products (category_id, featured desc, sort_order, published_at desc)
  where status = 'published'::public.publish_status and deleted_at is null;
create index idx_products_brand_series_trgm
  on public.products using gin (public.immutable_unaccent(lower(coalesce(brand_series, ''))) gin_trgm_ops);
create index idx_product_translations_product_locale on public.product_translations (product_id, locale);
create index idx_product_translations_locale_slug on public.product_translations (locale, slug);
create index idx_product_translations_search_text on public.product_translations using gin (search_text);
create index idx_product_translations_name_summary_trgm
  on public.product_translations using gin (public.immutable_unaccent(lower(concat_ws(' ', name, summary, material))) gin_trgm_ops);
create index idx_product_media_product_sort on public.product_media (product_id, sort_order);
create index idx_product_media_media on public.product_media (media_id);

create index idx_product_attribute_definitions_filterable_status on public.product_attribute_definitions (filterable, status);
create index idx_product_attribute_definitions_deleted_at on public.product_attribute_definitions (deleted_at);
create index idx_product_attribute_definition_translations_definition_locale on public.product_attribute_definition_translations (definition_id, locale);
create index idx_product_attribute_options_definition_status_sort on public.product_attribute_options (definition_id, status, sort_order);
create index idx_product_attribute_options_deleted_at on public.product_attribute_options (deleted_at);
create index idx_product_attribute_option_translations_option_locale on public.product_attribute_option_translations (option_id, locale);
create index idx_product_attribute_values_definition_option on public.product_attribute_values (attribute_definition_id, attribute_option_id);
create index idx_product_attribute_values_product_definition on public.product_attribute_values (product_id, attribute_definition_id);
create index idx_product_attribute_values_value_number on public.product_attribute_values (value_number);

create index idx_blog_categories_status_sort on public.blog_categories (status, sort_order);
create index idx_blog_categories_deleted_at on public.blog_categories (deleted_at);
create index idx_blog_category_translations_category_locale on public.blog_category_translations (category_id, locale);
create index idx_blog_category_translations_locale_slug on public.blog_category_translations (locale, slug);
create index idx_blog_category_translations_name_trgm
  on public.blog_category_translations using gin (public.immutable_unaccent(lower(name)) gin_trgm_ops);
create index idx_blog_posts_category_status_published on public.blog_posts (category_id, status, published_at desc);
create index idx_blog_posts_author on public.blog_posts (author_id);
create index idx_blog_posts_featured_status on public.blog_posts (featured, status);
create index idx_blog_posts_deleted_at on public.blog_posts (deleted_at);
create index idx_blog_posts_public on public.blog_posts (published_at desc, featured desc)
  where status = 'published'::public.publish_status and deleted_at is null;
create index idx_blog_post_translations_post_locale on public.blog_post_translations (post_id, locale);
create index idx_blog_post_translations_locale_slug on public.blog_post_translations (locale, slug);
create index idx_blog_post_translations_search_text on public.blog_post_translations using gin (search_text);
create index idx_blog_post_translations_title_excerpt_trgm
  on public.blog_post_translations using gin (public.immutable_unaccent(lower(concat_ws(' ', title, excerpt))) gin_trgm_ops);

create index idx_showrooms_status_sort on public.showrooms (status, sort_order);
create index idx_showrooms_deleted_at on public.showrooms (deleted_at);
create index idx_showrooms_public on public.showrooms (sort_order)
  where status = 'published'::public.publish_status and deleted_at is null;
create index idx_showroom_translations_showroom_locale on public.showroom_translations (showroom_id, locale);
create index idx_showroom_translations_name_address_trgm
  on public.showroom_translations using gin (public.immutable_unaccent(lower(concat_ws(' ', name, address))) gin_trgm_ops);
create index idx_showroom_media_showroom_sort on public.showroom_media (showroom_id, sort_order);
create index idx_showroom_media_media on public.showroom_media (media_id);

create index idx_quote_requests_status_created on public.quote_requests (status, created_at desc);
create index idx_quote_requests_product on public.quote_requests (product_id);
create index idx_quote_requests_category on public.quote_requests (category_id);
create index idx_quote_requests_assigned_to on public.quote_requests (assigned_to);
create index idx_quote_requests_source_path on public.quote_requests (source_path);
create index idx_quote_requests_deleted_at on public.quote_requests (deleted_at);
create index idx_quote_requests_keyword_trgm
  on public.quote_requests using gin (
    public.immutable_unaccent(lower(concat_ws(' ', full_name, phone, email, company, service, message, admin_notes))) gin_trgm_ops
  );
create index idx_quote_request_events_quote_created on public.quote_request_events (quote_request_id, created_at);
create index idx_quote_request_events_actor on public.quote_request_events (actor_id);
create index idx_quote_notifications_quote_request on public.quote_notifications (quote_request_id);
create index idx_quote_notifications_status_created on public.quote_notifications (status, created_at);
create index idx_quote_notifications_provider_message_id on public.quote_notifications (provider_message_id);

create index idx_ai_drafts_target on public.ai_drafts (target_type, target_id);
create index idx_ai_drafts_requested_created on public.ai_drafts (requested_by, created_at);
create index idx_ai_drafts_status on public.ai_drafts (status);
create index idx_audit_logs_actor_created on public.audit_logs (actor_id, created_at);
create index idx_audit_logs_entity on public.audit_logs (entity_type, entity_id);
create index idx_audit_logs_action on public.audit_logs (action);

-- updated_at triggers.
create trigger trg_profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger trg_media_assets_set_updated_at before update on public.media_assets for each row execute function public.set_updated_at();
create trigger trg_media_asset_translations_set_updated_at before update on public.media_asset_translations for each row execute function public.set_updated_at();
create trigger trg_site_settings_set_updated_at before update on public.site_settings for each row execute function public.set_updated_at();
create trigger trg_site_setting_translations_set_updated_at before update on public.site_setting_translations for each row execute function public.set_updated_at();
create trigger trg_social_links_set_updated_at before update on public.social_links for each row execute function public.set_updated_at();
create trigger trg_quote_recipients_set_updated_at before update on public.quote_recipients for each row execute function public.set_updated_at();
create trigger trg_content_pages_set_updated_at before update on public.content_pages for each row execute function public.set_updated_at();
create trigger trg_content_page_translations_set_updated_at before update on public.content_page_translations for each row execute function public.set_updated_at();
create trigger trg_page_sections_set_updated_at before update on public.page_sections for each row execute function public.set_updated_at();
create trigger trg_page_section_translations_set_updated_at before update on public.page_section_translations for each row execute function public.set_updated_at();
create trigger trg_page_media_set_updated_at before update on public.page_media for each row execute function public.set_updated_at();
create trigger trg_product_categories_set_updated_at before update on public.product_categories for each row execute function public.set_updated_at();
create trigger trg_product_category_translations_set_updated_at before update on public.product_category_translations for each row execute function public.set_updated_at();
create trigger trg_products_set_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger trg_product_translations_set_updated_at before update on public.product_translations for each row execute function public.set_updated_at();
create trigger trg_product_media_set_updated_at before update on public.product_media for each row execute function public.set_updated_at();
create trigger trg_product_attribute_definitions_set_updated_at before update on public.product_attribute_definitions for each row execute function public.set_updated_at();
create trigger trg_product_attribute_definition_translations_set_updated_at before update on public.product_attribute_definition_translations for each row execute function public.set_updated_at();
create trigger trg_product_attribute_options_set_updated_at before update on public.product_attribute_options for each row execute function public.set_updated_at();
create trigger trg_product_attribute_option_translations_set_updated_at before update on public.product_attribute_option_translations for each row execute function public.set_updated_at();
create trigger trg_product_attribute_values_set_updated_at before update on public.product_attribute_values for each row execute function public.set_updated_at();
create trigger trg_blog_categories_set_updated_at before update on public.blog_categories for each row execute function public.set_updated_at();
create trigger trg_blog_category_translations_set_updated_at before update on public.blog_category_translations for each row execute function public.set_updated_at();
create trigger trg_blog_posts_set_updated_at before update on public.blog_posts for each row execute function public.set_updated_at();
create trigger trg_blog_post_translations_set_updated_at before update on public.blog_post_translations for each row execute function public.set_updated_at();
create trigger trg_showrooms_set_updated_at before update on public.showrooms for each row execute function public.set_updated_at();
create trigger trg_showroom_translations_set_updated_at before update on public.showroom_translations for each row execute function public.set_updated_at();
create trigger trg_showroom_media_set_updated_at before update on public.showroom_media for each row execute function public.set_updated_at();
create trigger trg_quote_requests_set_updated_at before update on public.quote_requests for each row execute function public.set_updated_at();
create trigger trg_quote_notifications_set_updated_at before update on public.quote_notifications for each row execute function public.set_updated_at();
create trigger trg_ai_drafts_set_updated_at before update on public.ai_drafts for each row execute function public.set_updated_at();

-- Publish lifecycle triggers.
create trigger trg_content_pages_set_publish_timestamps before insert or update on public.content_pages for each row execute function public.set_publish_timestamps();
create trigger trg_product_categories_set_publish_timestamps before insert or update on public.product_categories for each row execute function public.set_publish_timestamps();
create trigger trg_products_set_publish_timestamps before insert or update on public.products for each row execute function public.set_publish_timestamps();
create trigger trg_products_set_archive_timestamp before insert or update on public.products for each row execute function public.set_product_archive_timestamp();
create trigger trg_blog_categories_set_publish_timestamps before insert or update on public.blog_categories for each row execute function public.set_publish_timestamps();
create trigger trg_blog_posts_set_publish_timestamps before insert or update on public.blog_posts for each row execute function public.set_publish_timestamps();
create trigger trg_showrooms_set_publish_timestamps before insert or update on public.showrooms for each row execute function public.set_publish_timestamps();

-- Localized search-vector maintenance.
create trigger trg_product_translations_search_text before insert or update
  on public.product_translations
  for each row execute function public.set_product_translation_search_text();

create trigger trg_blog_post_translations_search_text before insert or update
  on public.blog_post_translations
  for each row execute function public.set_blog_post_translation_search_text();

-- Append-only operational records.
create trigger trg_quote_request_events_append_only before update or delete
  on public.quote_request_events
  for each row execute function public.prevent_update_delete();

create trigger trg_audit_logs_append_only before update or delete
  on public.audit_logs
  for each row execute function public.prevent_update_delete();

commit;
