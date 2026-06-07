-- 0007_rls_policies.sql
-- Row Level Security grants and policies.
-- Anonymous visitors do not receive direct table access. Public reads use the
-- SECURITY DEFINER reader RPCs in 0008, and quote submission uses
-- submit_quote_request(payload jsonb).

begin;

-- Enable RLS on every application table.
alter table public.profiles enable row level security;
alter table public.media_assets enable row level security;
alter table public.media_asset_translations enable row level security;
alter table public.site_settings enable row level security;
alter table public.site_setting_translations enable row level security;
alter table public.social_links enable row level security;
alter table public.quote_recipients enable row level security;
alter table public.content_pages enable row level security;
alter table public.content_page_translations enable row level security;
alter table public.page_sections enable row level security;
alter table public.page_section_translations enable row level security;
alter table public.page_media enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_category_translations enable row level security;
alter table public.products enable row level security;
alter table public.product_translations enable row level security;
alter table public.product_media enable row level security;
alter table public.product_attribute_definitions enable row level security;
alter table public.product_attribute_definition_translations enable row level security;
alter table public.product_attribute_options enable row level security;
alter table public.product_attribute_option_translations enable row level security;
alter table public.product_attribute_values enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_category_translations enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_post_translations enable row level security;
alter table public.showrooms enable row level security;
alter table public.showroom_translations enable row level security;
alter table public.showroom_media enable row level security;
alter table public.quote_requests enable row level security;
alter table public.quote_request_events enable row level security;
alter table public.quote_notifications enable row level security;
alter table public.ai_drafts enable row level security;
alter table public.audit_logs enable row level security;

-- Baseline grants. RLS policies below still decide which rows are visible or mutable.
revoke all on table
  public.profiles,
  public.media_assets,
  public.media_asset_translations,
  public.site_settings,
  public.site_setting_translations,
  public.social_links,
  public.quote_recipients,
  public.content_pages,
  public.content_page_translations,
  public.page_sections,
  public.page_section_translations,
  public.page_media,
  public.product_categories,
  public.product_category_translations,
  public.products,
  public.product_translations,
  public.product_media,
  public.product_attribute_definitions,
  public.product_attribute_definition_translations,
  public.product_attribute_options,
  public.product_attribute_option_translations,
  public.product_attribute_values,
  public.blog_categories,
  public.blog_category_translations,
  public.blog_posts,
  public.blog_post_translations,
  public.showrooms,
  public.showroom_translations,
  public.showroom_media,
  public.quote_requests,
  public.quote_request_events,
  public.quote_notifications,
  public.ai_drafts,
  public.audit_logs
from anon, authenticated;

grant all on table
  public.profiles,
  public.media_assets,
  public.media_asset_translations,
  public.site_settings,
  public.site_setting_translations,
  public.social_links,
  public.quote_recipients,
  public.content_pages,
  public.content_page_translations,
  public.page_sections,
  public.page_section_translations,
  public.page_media,
  public.product_categories,
  public.product_category_translations,
  public.products,
  public.product_translations,
  public.product_media,
  public.product_attribute_definitions,
  public.product_attribute_definition_translations,
  public.product_attribute_options,
  public.product_attribute_option_translations,
  public.product_attribute_values,
  public.blog_categories,
  public.blog_category_translations,
  public.blog_posts,
  public.blog_post_translations,
  public.showrooms,
  public.showroom_translations,
  public.showroom_media,
  public.quote_requests,
  public.quote_request_events,
  public.quote_notifications,
  public.ai_drafts,
  public.audit_logs
to service_role;

grant select, insert, update on table public.profiles to authenticated;

grant select, insert, update on table
  public.media_assets,
  public.content_pages,
  public.product_categories,
  public.products,
  public.product_attribute_definitions,
  public.product_attribute_options,
  public.blog_categories,
  public.blog_posts,
  public.showrooms
to authenticated;

grant select, insert, update, delete on table
  public.media_asset_translations,
  public.content_page_translations,
  public.page_sections,
  public.page_section_translations,
  public.page_media,
  public.product_category_translations,
  public.product_translations,
  public.product_media,
  public.product_attribute_definition_translations,
  public.product_attribute_option_translations,
  public.product_attribute_values,
  public.blog_category_translations,
  public.blog_post_translations,
  public.showroom_translations,
  public.showroom_media
to authenticated;

grant select, insert, update, delete on table
  public.site_settings,
  public.site_setting_translations,
  public.social_links,
  public.quote_recipients
to authenticated;

grant select, insert, update on table
  public.quote_requests,
  public.quote_notifications
to authenticated;

grant select, insert on table public.quote_request_events to authenticated;
grant select, insert, update, delete on table public.ai_drafts to authenticated;
grant select on table public.audit_logs to authenticated;

-- Explicit service-role policies. Supabase service_role normally bypasses RLS,
-- but these make intent clear if BYPASSRLS behavior is constrained later.
create policy service_role_all on public.profiles for all to service_role using (true) with check (true);
create policy service_role_all on public.media_assets for all to service_role using (true) with check (true);
create policy service_role_all on public.media_asset_translations for all to service_role using (true) with check (true);
create policy service_role_all on public.site_settings for all to service_role using (true) with check (true);
create policy service_role_all on public.site_setting_translations for all to service_role using (true) with check (true);
create policy service_role_all on public.social_links for all to service_role using (true) with check (true);
create policy service_role_all on public.quote_recipients for all to service_role using (true) with check (true);
create policy service_role_all on public.content_pages for all to service_role using (true) with check (true);
create policy service_role_all on public.content_page_translations for all to service_role using (true) with check (true);
create policy service_role_all on public.page_sections for all to service_role using (true) with check (true);
create policy service_role_all on public.page_section_translations for all to service_role using (true) with check (true);
create policy service_role_all on public.page_media for all to service_role using (true) with check (true);
create policy service_role_all on public.product_categories for all to service_role using (true) with check (true);
create policy service_role_all on public.product_category_translations for all to service_role using (true) with check (true);
create policy service_role_all on public.products for all to service_role using (true) with check (true);
create policy service_role_all on public.product_translations for all to service_role using (true) with check (true);
create policy service_role_all on public.product_media for all to service_role using (true) with check (true);
create policy service_role_all on public.product_attribute_definitions for all to service_role using (true) with check (true);
create policy service_role_all on public.product_attribute_definition_translations for all to service_role using (true) with check (true);
create policy service_role_all on public.product_attribute_options for all to service_role using (true) with check (true);
create policy service_role_all on public.product_attribute_option_translations for all to service_role using (true) with check (true);
create policy service_role_all on public.product_attribute_values for all to service_role using (true) with check (true);
create policy service_role_all on public.blog_categories for all to service_role using (true) with check (true);
create policy service_role_all on public.blog_category_translations for all to service_role using (true) with check (true);
create policy service_role_all on public.blog_posts for all to service_role using (true) with check (true);
create policy service_role_all on public.blog_post_translations for all to service_role using (true) with check (true);
create policy service_role_all on public.showrooms for all to service_role using (true) with check (true);
create policy service_role_all on public.showroom_translations for all to service_role using (true) with check (true);
create policy service_role_all on public.showroom_media for all to service_role using (true) with check (true);
create policy service_role_all on public.quote_requests for all to service_role using (true) with check (true);
create policy service_role_all on public.quote_request_events for all to service_role using (true) with check (true);
create policy service_role_all on public.quote_notifications for all to service_role using (true) with check (true);
create policy service_role_all on public.ai_drafts for all to service_role using (true) with check (true);
create policy service_role_all on public.audit_logs for all to service_role using (true) with check (true);

-- Profiles: editor reads only self; admin manages all profile rows.
create policy profiles_select_own_or_admin
  on public.profiles for select to authenticated
  using (public.is_own_profile(id) or public.is_admin());

create policy profiles_insert_admin
  on public.profiles for insert to authenticated
  with check (public.is_admin());

create policy profiles_update_admin
  on public.profiles for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Publishable/content/media tables: editors and admins manage publishable content.
create policy media_assets_editor_select on public.media_assets for select to authenticated using (public.is_editor());
create policy media_assets_editor_insert on public.media_assets for insert to authenticated with check (public.is_editor());
create policy media_assets_editor_update on public.media_assets for update to authenticated using (public.is_editor()) with check (public.is_editor());

create policy media_asset_translations_editor_all on public.media_asset_translations for all to authenticated using (public.is_editor()) with check (public.is_editor());

create policy content_pages_editor_select on public.content_pages for select to authenticated using (public.is_editor());
create policy content_pages_editor_insert on public.content_pages for insert to authenticated with check (public.is_editor());
create policy content_pages_editor_update on public.content_pages for update to authenticated using (public.is_editor()) with check (public.is_editor());

create policy content_page_translations_editor_all on public.content_page_translations for all to authenticated using (public.is_editor()) with check (public.is_editor());
create policy page_sections_editor_all on public.page_sections for all to authenticated using (public.is_editor()) with check (public.is_editor());
create policy page_section_translations_editor_all on public.page_section_translations for all to authenticated using (public.is_editor()) with check (public.is_editor());
create policy page_media_editor_all on public.page_media for all to authenticated using (public.is_editor()) with check (public.is_editor());

create policy product_categories_editor_select on public.product_categories for select to authenticated using (public.is_editor());
create policy product_categories_editor_insert on public.product_categories for insert to authenticated with check (public.is_editor());
create policy product_categories_editor_update on public.product_categories for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy product_category_translations_editor_all on public.product_category_translations for all to authenticated using (public.is_editor()) with check (public.is_editor());

create policy products_editor_select on public.products for select to authenticated using (public.is_editor());
create policy products_editor_insert on public.products for insert to authenticated with check (public.is_editor());
create policy products_editor_update on public.products for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy product_translations_editor_all on public.product_translations for all to authenticated using (public.is_editor()) with check (public.is_editor());
create policy product_media_editor_all on public.product_media for all to authenticated using (public.is_editor()) with check (public.is_editor());

create policy product_attribute_definitions_editor_select on public.product_attribute_definitions for select to authenticated using (public.is_editor());
create policy product_attribute_definitions_editor_insert on public.product_attribute_definitions for insert to authenticated with check (public.is_editor());
create policy product_attribute_definitions_editor_update on public.product_attribute_definitions for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy product_attribute_definition_translations_editor_all on public.product_attribute_definition_translations for all to authenticated using (public.is_editor()) with check (public.is_editor());
create policy product_attribute_options_editor_select on public.product_attribute_options for select to authenticated using (public.is_editor());
create policy product_attribute_options_editor_insert on public.product_attribute_options for insert to authenticated with check (public.is_editor());
create policy product_attribute_options_editor_update on public.product_attribute_options for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy product_attribute_option_translations_editor_all on public.product_attribute_option_translations for all to authenticated using (public.is_editor()) with check (public.is_editor());
create policy product_attribute_values_editor_all on public.product_attribute_values for all to authenticated using (public.is_editor()) with check (public.is_editor());

create policy blog_categories_editor_select on public.blog_categories for select to authenticated using (public.is_editor());
create policy blog_categories_editor_insert on public.blog_categories for insert to authenticated with check (public.is_editor());
create policy blog_categories_editor_update on public.blog_categories for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy blog_category_translations_editor_all on public.blog_category_translations for all to authenticated using (public.is_editor()) with check (public.is_editor());

create policy blog_posts_editor_select on public.blog_posts for select to authenticated using (public.is_editor());
create policy blog_posts_editor_insert on public.blog_posts for insert to authenticated with check (public.is_editor());
create policy blog_posts_editor_update on public.blog_posts for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy blog_post_translations_editor_all on public.blog_post_translations for all to authenticated using (public.is_editor()) with check (public.is_editor());

create policy showrooms_editor_select on public.showrooms for select to authenticated using (public.is_editor());
create policy showrooms_editor_insert on public.showrooms for insert to authenticated with check (public.is_editor());
create policy showrooms_editor_update on public.showrooms for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy showroom_translations_editor_all on public.showroom_translations for all to authenticated using (public.is_editor()) with check (public.is_editor());
create policy showroom_media_editor_all on public.showroom_media for all to authenticated using (public.is_editor()) with check (public.is_editor());

-- Settings: editors can read safe/admin UI settings but cannot mutate privileged rows.
create policy site_settings_editor_read
  on public.site_settings for select to authenticated
  using (public.is_editor());
create policy site_settings_admin_insert
  on public.site_settings for insert to authenticated
  with check (public.is_admin());
create policy site_settings_admin_update
  on public.site_settings for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
create policy site_settings_admin_delete
  on public.site_settings for delete to authenticated
  using (public.is_admin());

create policy site_setting_translations_editor_read
  on public.site_setting_translations for select to authenticated
  using (public.is_editor());
create policy site_setting_translations_admin_insert
  on public.site_setting_translations for insert to authenticated
  with check (public.is_admin());
create policy site_setting_translations_admin_update
  on public.site_setting_translations for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
create policy site_setting_translations_admin_delete
  on public.site_setting_translations for delete to authenticated
  using (public.is_admin());

create policy social_links_editor_read
  on public.social_links for select to authenticated
  using (public.is_editor());
create policy social_links_admin_insert
  on public.social_links for insert to authenticated
  with check (public.is_admin());
create policy social_links_admin_update
  on public.social_links for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
create policy social_links_admin_delete
  on public.social_links for delete to authenticated
  using (public.is_admin());

create policy quote_recipients_admin_all
  on public.quote_recipients for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Private quote lead workflow: editors have no direct access under Option A.
create policy quote_requests_admin_select
  on public.quote_requests for select to authenticated
  using (public.is_admin());
create policy quote_requests_admin_insert
  on public.quote_requests for insert to authenticated
  with check (public.is_admin());
create policy quote_requests_admin_update
  on public.quote_requests for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy quote_request_events_admin_select
  on public.quote_request_events for select to authenticated
  using (public.is_admin());
create policy quote_request_events_admin_insert
  on public.quote_request_events for insert to authenticated
  with check (public.is_admin());

create policy quote_notifications_admin_select
  on public.quote_notifications for select to authenticated
  using (public.is_admin());
create policy quote_notifications_admin_insert
  on public.quote_notifications for insert to authenticated
  with check (public.is_admin());
create policy quote_notifications_admin_update
  on public.quote_notifications for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- AI drafts: editors manage their own draft-only suggestions; admins manage all.
create policy ai_drafts_select_admin_or_own
  on public.ai_drafts for select to authenticated
  using (public.is_admin() or requested_by = public.current_profile_id());

create policy ai_drafts_insert_own_editor
  on public.ai_drafts for insert to authenticated
  with check (
    public.is_editor()
    and requested_by = public.current_profile_id()
  );

create policy ai_drafts_update_admin_or_own
  on public.ai_drafts for update to authenticated
  using (public.is_admin() or requested_by = public.current_profile_id())
  with check (
    public.is_admin()
    or (
      requested_by = public.current_profile_id()
      and (reviewed_by is null or reviewed_by = public.current_profile_id())
    )
  );

create policy ai_drafts_delete_admin
  on public.ai_drafts for delete to authenticated
  using (public.is_admin());

-- Audit logs: admin can read. Writes should come from service-role trusted code.
create policy audit_logs_admin_select
  on public.audit_logs for select to authenticated
  using (public.is_admin());

commit;
