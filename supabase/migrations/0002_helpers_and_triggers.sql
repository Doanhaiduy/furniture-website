-- 0002_helpers_and_triggers.sql
-- Generic helper functions and trigger functions.
-- Table-specific trigger attachments are added after table creation.

begin;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'BEFORE UPDATE trigger function that keeps updated_at current.';

create or replace function public.set_publish_timestamps()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published'::public.publish_status
     and (tg_op = 'INSERT' or old.status is distinct from 'published'::public.publish_status)
  then
    new.published_at = coalesce(new.published_at, now());
  end if;

  return new;
end;
$$;

comment on function public.set_publish_timestamps() is
  'Sets published_at when a publishable row first transitions to published.';

create or replace function public.set_product_archive_timestamp()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'archived'::public.publish_status
     and (tg_op = 'INSERT' or old.status is distinct from 'archived'::public.publish_status)
  then
    new.archived_at = coalesce(new.archived_at, now());
  end if;

  return new;
end;
$$;

comment on function public.set_product_archive_timestamp() is
  'Sets products.archived_at when a product first transitions to archived.';

-- PostgreSQL marks unaccent as stable because dictionaries may change.
-- For application search indexes, this immutable wrapper is a common pragmatic
-- Supabase pattern. Reindex if the unaccent dictionary is changed.
create or replace function public.immutable_unaccent(input text)
returns text
language sql
immutable
parallel safe
as $$
  select extensions.unaccent(coalesce(input, ''));
$$;

comment on function public.immutable_unaccent(text) is
  'Immutable wrapper for unaccent, used by trigram/search indexes. Reindex if dictionary config changes.';

create or replace function public.to_simple_tsvector(variadic parts text[])
returns tsvector
language sql
immutable
parallel safe
as $$
  select to_tsvector(
    'simple',
    public.immutable_unaccent(lower(coalesce(array_to_string(parts, ' '), '')))
  );
$$;

comment on function public.to_simple_tsvector(text[]) is
  'Builds an accent-insensitive simple-language tsvector from text fragments.';

create or replace function public.set_product_translation_search_text()
returns trigger
language plpgsql
as $$
begin
  new.search_text = public.to_simple_tsvector(
    new.name,
    new.summary,
    new.material,
    new.price_display_text,
    new.dimension_display_text
  );
  return new;
end;
$$;

comment on function public.set_product_translation_search_text() is
  'Maintains product_translations.search_text for localized product search.';

create or replace function public.set_blog_post_translation_search_text()
returns trigger
language plpgsql
as $$
begin
  new.search_text = public.to_simple_tsvector(
    new.title,
    new.excerpt,
    new.seo_title,
    new.seo_description
  );
  return new;
end;
$$;

comment on function public.set_blog_post_translation_search_text() is
  'Maintains blog_post_translations.search_text for localized blog search.';

create or replace function public.compact_text(input text)
returns text
language sql
immutable
parallel safe
as $$
  select nullif(regexp_replace(btrim(coalesce(input, '')), '\s+', ' ', 'g'), '');
$$;

comment on function public.compact_text(text) is
  'Trims text, collapses repeated whitespace, and returns null for blank values.';

create or replace function public.prevent_update_delete()
returns trigger
language plpgsql
as $$
begin
  raise exception '% rows are append-only', tg_table_name
    using errcode = '42501';
end;
$$;

comment on function public.prevent_update_delete() is
  'Blocks UPDATE/DELETE on append-only operational tables when attached as a trigger.';

commit;
