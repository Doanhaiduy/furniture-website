-- 0001_extensions_and_enums.sql
-- Supabase/PostgreSQL foundation for the showroom CMS database.
-- Scope: required extensions and domain enums only.

begin;

create schema if not exists extensions;

create extension if not exists pgcrypto with schema extensions;
create extension if not exists unaccent with schema extensions;
create extension if not exists pg_trgm with schema extensions;

grant usage on schema public to anon, authenticated, service_role;
grant usage on schema extensions to anon, authenticated, service_role;

do $$
begin
  create type public.locale_code as enum ('vi', 'en');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.cms_role as enum ('admin', 'editor');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.publish_status as enum ('draft', 'published', 'archived');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.media_resource_type as enum ('image', 'video');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.media_status as enum ('active', 'archived');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.storage_provider as enum ('supabase_storage', 'cloudinary');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.product_group_key as enum (
    'wooden_furniture',
    'sanitary_equipment',
    'tiles',
    'project_solutions'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.quote_status as enum ('new', 'contacted', 'qualified', 'closed', 'spam');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.notification_status as enum ('pending', 'sent', 'failed', 'skipped');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.social_platform as enum (
    'facebook',
    'zalo',
    'youtube',
    'tiktok',
    'instagram',
    'other'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.ai_target_type as enum (
    'product',
    'blog_post',
    'content_page',
    'seo',
    'translation'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.ai_draft_status as enum ('draft', 'accepted', 'discarded');
exception
  when duplicate_object then null;
end
$$;

comment on type public.locale_code is 'Supported public content locales.';
comment on type public.cms_role is 'CMS roles. Role Model Option A: editor manages publishable content only; admin manages privileged data.';
comment on type public.publish_status is 'Publish lifecycle for public content.';
comment on type public.media_resource_type is 'Media types allowed by the launch design.';
comment on type public.media_status is 'Reusable media lifecycle status.';
comment on type public.storage_provider is 'Media metadata provider. Supports Supabase Storage and Cloudinary.';
comment on type public.product_group_key is 'Top-level public product group identifiers.';
comment on type public.quote_status is 'Private quote lead workflow status.';
comment on type public.notification_status is 'Quote notification delivery status.';
comment on type public.social_platform is 'Configured public social link platform.';
comment on type public.ai_target_type is 'AI draft target category. target_id is polymorphic and cannot be enforced by a single FK.';
comment on type public.ai_draft_status is 'Human review status for draft-only AI output.';

commit;
