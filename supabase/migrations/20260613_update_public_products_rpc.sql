-- migration file: supabase/migrations/20260613_update_public_products_rpc.sql
begin;

create or replace function public.public_products(
  p_locale public.locale_code default 'vi',
  p_category_slug text default null,
  p_group_key public.product_group_key default null,
  p_q text default null,
  p_price_min numeric default null,
  p_price_max numeric default null,
  p_attribute_filters jsonb default '{}'::jsonb,
  p_featured boolean default null,
  p_limit int default 24,
  p_offset int default 0
)
returns table (
  id uuid,
  reference_code text,
  slug text,
  name text,
  summary text,
  description_json jsonb,
  material text,
  price_display_text text,
  dimension_display_text text,
  category_id uuid,
  category_slug text,
  category_name text,
  group_key public.product_group_key,
  price_min numeric,
  price_max numeric,
  currency char(3),
  width numeric,
  depth numeric,
  height numeric,
  dimension_unit text,
  brand_id uuid,
  brand_name text,
  brand_series text,
  featured boolean,
  published_at timestamptz,
  primary_media jsonb,
  media jsonb,
  attributes jsonb
)
language sql
stable
security definer
set search_path = public, extensions, pg_temp
as $$
  with params as (
    select
      public.compact_text(p_category_slug) as category_slug,
      public.compact_text(p_q) as q,
      coalesce(p_attribute_filters, '{}'::jsonb) as attribute_filters
  ),
  base as (
    select
      p.id,
      p.reference_code,
      pt.slug,
      pt.name,
      pt.summary,
      pt.description_json,
      pt.material,
      pt.price_display_text,
      pt.dimension_display_text,
      pc.id as category_id,
      pct.slug as category_slug,
      pct.name as category_name,
      coalesce(pc.group_key, parent_pc.group_key) as group_key,
      p.price_min,
      p.price_max,
      p.currency,
      p.width,
      p.depth,
      p.height,
      p.dimension_unit,
      p.brand_id,
      bt.name as brand_name,
      p.brand_series,
      p.featured,
      p.published_at,
      p.sort_order,
      pt.search_text
    from public.products p
    join public.product_translations pt
      on pt.product_id = p.id
      and pt.locale = p_locale
    join public.product_categories pc
      on pc.id = p.category_id
      and pc.status = 'published'::public.publish_status
      and pc.deleted_at is null
    left join public.product_categories parent_pc
      on parent_pc.id = pc.parent_id
      and parent_pc.status = 'published'::public.publish_status
      and parent_pc.deleted_at is null
    join public.product_category_translations pct
      on pct.category_id = pc.id
      and pct.locale = p_locale
    left join public.brands b
      on b.id = p.brand_id
      and b.deleted_at is null
    left join public.brand_translations bt
      on bt.brand_id = b.id
      and bt.locale = p_locale
    cross join params params
    where p.status = 'published'::public.publish_status
      and p.deleted_at is null
      and (params.category_slug is null or pct.slug = params.category_slug)
      and (p_group_key is null or pc.group_key = p_group_key or parent_pc.group_key = p_group_key)
      and (p_featured is null or p.featured = p_featured)
      and (p_price_min is null or p.price_max is null or p.price_max >= p_price_min)
      and (p_price_max is null or p.price_min is null or p.price_min <= p_price_max)
      and (
        params.q is null
        or pt.search_text @@ plainto_tsquery('simple', public.immutable_unaccent(lower(params.q)))
        or public.immutable_unaccent(lower(concat_ws(' ', p.reference_code, p.brand_series, pt.name, pt.summary, pct.name, bt.name)))
          like '%' || public.immutable_unaccent(lower(params.q)) || '%'
      )
      and (
        params.attribute_filters = '{}'::jsonb
        or not exists (
          select 1
          from jsonb_each(params.attribute_filters) filter_item(filter_key, filter_value)
          where not exists (
            select 1
            from public.product_attribute_values pav
            join public.product_attribute_definitions pad
              on pad.id = pav.attribute_definition_id
              and pad.deleted_at is null
              and pad.status = 'published'::public.publish_status
            left join public.product_attribute_options pao
              on pao.id = pav.attribute_option_id
              and pao.deleted_at is null
              and pao.status = 'published'::public.publish_status
            where pav.product_id = p.id
              and pad.key = filter_item.filter_key
              and (
                (
                  jsonb_typeof(filter_item.filter_value) = 'array'
                  and exists (
                    select 1
                    from jsonb_array_elements_text(filter_item.filter_value) wanted(value)
                    where wanted.value = coalesce(
                      pao.key,
                      pav.value_text_vi,
                      pav.value_text_en,
                      pav.value_number::text,
                      pav.value_boolean::text
                    )
                  )
                )
                or (
                  jsonb_typeof(filter_item.filter_value) <> 'array'
                  and trim(both '"' from filter_item.filter_value::text) = coalesce(
                    pao.key,
                    pav.value_text_vi,
                    pav.value_text_en,
                    pav.value_number::text,
                    pav.value_boolean::text
                  )
                )
              )
          )
        )
      )
  )
  select
    id,
    reference_code,
    slug,
    name,
    summary,
    description_json,
    material,
    price_display_text,
    dimension_display_text,
    category_id,
    category_slug,
    category_name,
    group_key,
    price_min,
    price_max,
    currency,
    width,
    depth,
    height,
    dimension_unit,
    brand_id,
    brand_name,
    brand_series,
    featured,
    published_at,
    (
      select jsonb_build_object('url', ma.public_url)
      from public.product_media pm
      join public.media_assets ma on ma.id = pm.media_asset_id
      where pm.product_id = base.id
        and pm.is_primary = true
      limit 1
    ) as primary_media,
    (
      select jsonb_agg(jsonb_build_object('url', ma.public_url))
      from public.product_media pm
      join public.media_assets ma on ma.id = pm.media_asset_id
      where pm.product_id = base.id
    ) as media,
    (
      select jsonb_agg(
        jsonb_build_object(
          'key', pad.key,
          'name', padt.name,
          'value', coalesce(paot.value, pav.value_text_vi, pav.value_text_en, pav.value_number::text, pav.value_boolean::text)
        )
      )
      from public.product_attribute_values pav
      join public.product_attribute_definitions pad on pad.id = pav.attribute_definition_id
      join public.product_attribute_definition_translations padt
        on padt.attribute_definition_id = pad.id
        and padt.locale = p_locale
      left join public.product_attribute_options pao on pao.id = pav.attribute_option_id
      left join public.product_attribute_option_translations paot
        on paot.attribute_option_id = pao.id
        and paot.locale = p_locale
      where pav.product_id = base.id
    ) as attributes
  from base
  order by base.sort_order asc, base.published_at desc;
$$;

commit;
