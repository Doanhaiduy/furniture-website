-- 0008_public_admin_rpcs.sql
-- Public reader RPCs, public quote submission RPC, and admin quote search RPC.

begin;

create or replace function public.submit_quote_request(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_locale_text text;
  v_full_name text;
  v_phone text;
  v_email text;
  v_company text;
  v_service text;
  v_message text;
  v_source_path text;
  v_source_url text;
  v_product_id_text text;
  v_category_id_text text;
  v_product_id uuid;
  v_category_id uuid;
  v_quote_id uuid;
  v_headers jsonb;
  v_user_agent text;
  v_ip_hash text;
begin
  if payload is null or jsonb_typeof(payload) <> 'object' then
    raise exception 'payload must be a JSON object' using errcode = '22023';
  end if;

  -- Honeypot submissions are treated as successful but are not persisted.
  if public.compact_text(payload->>'honeypot') is not null then
    return jsonb_build_object('submitted', true);
  end if;

  v_locale_text := coalesce(
    public.compact_text(payload->>'preferred_locale'),
    public.compact_text(payload->>'preferredLocale'),
    public.compact_text(payload->>'locale'),
    'vi'
  );

  if v_locale_text not in ('vi', 'en') then
    raise exception 'preferred locale must be vi or en' using errcode = '22023';
  end if;

  v_full_name := left(public.compact_text(coalesce(payload->>'full_name', payload->>'fullName')), 160);
  v_phone := left(public.compact_text(payload->>'phone'), 32);
  v_email := lower(left(public.compact_text(payload->>'email'), 320));
  v_company := left(public.compact_text(payload->>'company'), 180);
  v_service := left(public.compact_text(payload->>'service'), 120);
  v_message := left(public.compact_text(payload->>'message'), 5000);
  v_source_path := left(public.compact_text(coalesce(payload->>'source_path', payload->>'sourcePath')), 2048);
  v_source_url := left(public.compact_text(coalesce(payload->>'source_url', payload->>'sourceUrl')), 2048);
  v_product_id_text := public.compact_text(coalesce(payload->>'product_id', payload->>'productId'));
  v_category_id_text := public.compact_text(coalesce(payload->>'category_id', payload->>'categoryId'));

  begin
    v_headers := nullif(current_setting('request.headers', true), '')::jsonb;
  exception
    when others then
      v_headers := '{}'::jsonb;
  end;

  v_user_agent := left(coalesce(
    public.compact_text(v_headers->>'user-agent'),
    public.compact_text(payload->>'user_agent'),
    public.compact_text(payload->>'userAgent')
  ), 1024);

  -- Only trusted service-role callers should pass pre-hashed IP metadata.
  if public.is_service_role() then
    v_ip_hash := left(public.compact_text(coalesce(payload->>'ip_hash', payload->>'ipHash')), 128);
  end if;

  if v_full_name is null then
    raise exception 'full_name is required' using errcode = '22023';
  end if;

  if v_phone is null or v_phone !~ '^[0-9+().\-\s]{7,32}$' then
    raise exception 'valid phone is required' using errcode = '22023';
  end if;

  if v_email is not null and v_email !~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$' then
    raise exception 'email is invalid' using errcode = '22023';
  end if;

  if v_message is null then
    raise exception 'message is required' using errcode = '22023';
  end if;

  if v_source_path is null or v_source_path not like '/%' then
    raise exception 'source_path is required and must start with /' using errcode = '22023';
  end if;

  if v_source_url is not null and v_source_url !~* '^https?://' then
    raise exception 'source_url must be http or https' using errcode = '22023';
  end if;

  if v_product_id_text is not null then
    if v_product_id_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'product_id must be a UUID' using errcode = '22023';
    end if;
    v_product_id := v_product_id_text::uuid;

    if not exists (
      select 1
      from public.products p
      where p.id = v_product_id
        and p.status = 'published'::public.publish_status
        and p.deleted_at is null
    ) then
      raise exception 'product_id is not available for public quote submission' using errcode = '22023';
    end if;
  end if;

  if v_category_id_text is not null then
    if v_category_id_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'category_id must be a UUID' using errcode = '22023';
    end if;
    v_category_id := v_category_id_text::uuid;

    if not exists (
      select 1
      from public.product_categories c
      where c.id = v_category_id
        and c.status = 'published'::public.publish_status
        and c.deleted_at is null
    ) then
      raise exception 'category_id is not available for public quote submission' using errcode = '22023';
    end if;
  end if;

  insert into public.quote_requests (
    full_name,
    phone,
    email,
    company,
    service,
    message,
    preferred_locale,
    product_id,
    category_id,
    source_path,
    source_url,
    ip_hash,
    user_agent,
    status
  )
  values (
    v_full_name,
    v_phone,
    v_email,
    v_company,
    v_service,
    v_message,
    v_locale_text::public.locale_code,
    v_product_id,
    v_category_id,
    v_source_path,
    v_source_url,
    v_ip_hash,
    v_user_agent,
    'new'::public.quote_status
  )
  returning id into v_quote_id;

  insert into public.quote_request_events (
    quote_request_id,
    actor_id,
    old_status,
    new_status,
    note
  )
  values (
    v_quote_id,
    null,
    null,
    'new'::public.quote_status,
    'Created by public quote submission RPC'
  );

  insert into public.quote_notifications (
    quote_request_id,
    recipient_email,
    provider,
    status
  )
  select
    v_quote_id,
    lower(qr.email),
    'resend',
    'pending'::public.notification_status
  from public.quote_recipients qr
  join public.site_settings ss on ss.id = qr.site_settings_id
  where qr.is_active;

  return jsonb_build_object('submitted', true);
end;
$$;

comment on function public.submit_quote_request(jsonb) is
  'Public-safe quote submission RPC. Validates/sanitizes input, inserts private quote_requests, queues pending notifications, and returns no lead id.';

create or replace function public.admin_quote_search(
  p_status public.quote_status default null,
  p_keyword text default null,
  p_date_from timestamptz default null,
  p_date_to timestamptz default null,
  p_source_path text default null,
  p_assigned_to uuid default null,
  p_limit int default 50,
  p_offset int default 0
)
returns table (
  id uuid,
  full_name text,
  phone text,
  email text,
  company text,
  service text,
  message text,
  preferred_locale public.locale_code,
  product_id uuid,
  category_id uuid,
  source_path text,
  source_url text,
  status public.quote_status,
  assigned_to uuid,
  admin_notes text,
  created_at timestamptz,
  updated_at timestamptz,
  deleted_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_keyword text := public.compact_text(p_keyword);
  v_limit int := least(greatest(coalesce(p_limit, 50), 1), 200);
  v_offset int := greatest(coalesce(p_offset, 0), 0);
begin
  if not public.can_manage_private_admin_data() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  return query
  select
    qr.id,
    qr.full_name,
    qr.phone,
    qr.email,
    qr.company,
    qr.service,
    qr.message,
    qr.preferred_locale,
    qr.product_id,
    qr.category_id,
    qr.source_path,
    qr.source_url,
    qr.status,
    qr.assigned_to,
    qr.admin_notes,
    qr.created_at,
    qr.updated_at,
    qr.deleted_at
  from public.quote_requests qr
  where qr.deleted_at is null
    and (p_status is null or qr.status = p_status)
    and (p_date_from is null or qr.created_at >= p_date_from)
    and (p_date_to is null or qr.created_at < p_date_to)
    and (p_source_path is null or qr.source_path = p_source_path)
    and (p_assigned_to is null or qr.assigned_to = p_assigned_to)
    and (
      v_keyword is null
      or public.immutable_unaccent(lower(concat_ws(
        ' ',
        qr.full_name,
        qr.phone,
        qr.email,
        qr.company,
        qr.service,
        qr.message,
        qr.admin_notes,
        qr.source_path
      ))) like '%' || public.immutable_unaccent(lower(v_keyword)) || '%'
    )
  order by qr.created_at desc
  limit v_limit
  offset v_offset;
end;
$$;

comment on function public.admin_quote_search(public.quote_status, text, timestamptz, timestamptz, text, uuid, int, int) is
  'Admin-only quote lead search by status, keyword, date range, source path, and assignee.';

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
        or public.immutable_unaccent(lower(concat_ws(' ', p.reference_code, p.brand_series, pt.name, pt.summary, pct.name)))
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
    b.id,
    b.reference_code,
    b.slug,
    b.name,
    b.summary,
    b.description_json,
    b.material,
    b.price_display_text,
    b.dimension_display_text,
    b.category_id,
    b.category_slug,
    b.category_name,
    b.group_key,
    b.price_min,
    b.price_max,
    b.currency,
    b.width,
    b.depth,
    b.height,
    b.dimension_unit,
    b.brand_series,
    b.featured,
    b.published_at,
    (
      select jsonb_build_object(
        'id', ma.id,
        'url', ma.public_url,
        'resourceType', ma.resource_type,
        'mimeType', ma.mime_type,
        'width', ma.width,
        'height', ma.height,
        'altText', mat.alt_text,
        'caption', mat.caption
      )
      from public.product_media pm
      join public.media_assets ma
        on ma.id = pm.media_id
        and ma.status = 'active'::public.media_status
        and ma.deleted_at is null
      left join public.media_asset_translations mat
        on mat.media_id = ma.id
        and mat.locale = p_locale
      where pm.product_id = b.id
      order by pm.is_primary desc, pm.sort_order, pm.created_at
      limit 1
    ) as primary_media,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', ma.id,
          'url', ma.public_url,
          'resourceType', ma.resource_type,
          'mimeType', ma.mime_type,
          'width', ma.width,
          'height', ma.height,
          'isPrimary', pm.is_primary,
          'context', pm.context,
          'altText', mat.alt_text,
          'caption', mat.caption
        )
        order by pm.is_primary desc, pm.sort_order, pm.created_at
      )
      from public.product_media pm
      join public.media_assets ma
        on ma.id = pm.media_id
        and ma.status = 'active'::public.media_status
        and ma.deleted_at is null
      left join public.media_asset_translations mat
        on mat.media_id = ma.id
        and mat.locale = p_locale
      where pm.product_id = b.id
    ), '[]'::jsonb) as media,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'key', pad.key,
          'label', padt.label,
          'dataType', pad.data_type,
          'optionKey', pao.key,
          'optionLabel', paot.label,
          'swatchHex', pao.swatch_hex,
          'valueText', case when p_locale = 'vi' then pav.value_text_vi else pav.value_text_en end,
          'valueNumber', pav.value_number,
          'valueBoolean', pav.value_boolean
        )
        order by pad.sort_order, pao.sort_order
      )
      from public.product_attribute_values pav
      join public.product_attribute_definitions pad
        on pad.id = pav.attribute_definition_id
        and pad.deleted_at is null
        and pad.status = 'published'::public.publish_status
      left join public.product_attribute_definition_translations padt
        on padt.definition_id = pad.id
        and padt.locale = p_locale
      left join public.product_attribute_options pao
        on pao.id = pav.attribute_option_id
        and pao.deleted_at is null
        and pao.status = 'published'::public.publish_status
      left join public.product_attribute_option_translations paot
        on paot.option_id = pao.id
        and paot.locale = p_locale
      where pav.product_id = b.id
    ), '[]'::jsonb) as attributes
  from base b
  cross join params params
  order by b.featured desc, b.sort_order, b.published_at desc, b.id
  limit least(greatest(coalesce(p_limit, 24), 1), 100)
  offset greatest(coalesce(p_offset, 0), 0);
$$;

comment on function public.public_products(public.locale_code, text, public.product_group_key, text, numeric, numeric, jsonb, boolean, int, int) is
  'Public product reader. Returns only published, non-deleted products with localized fields, category, media, and attributes.';

create or replace function public.public_blog_posts(
  p_locale public.locale_code default 'vi',
  p_category_slug text default null,
  p_q text default null,
  p_featured boolean default null,
  p_limit int default 12,
  p_offset int default 0
)
returns table (
  id uuid,
  slug text,
  title text,
  excerpt text,
  body_json jsonb,
  seo_title text,
  seo_description text,
  category_id uuid,
  category_slug text,
  category_name text,
  author_id uuid,
  author_name text,
  featured boolean,
  published_at timestamptz,
  cover_media jsonb
)
language sql
stable
security definer
set search_path = public, extensions, pg_temp
as $$
  with params as (
    select
      public.compact_text(p_category_slug) as category_slug,
      public.compact_text(p_q) as q
  )
  select
    bp.id,
    bpt.slug,
    bpt.title,
    bpt.excerpt,
    bpt.body_json,
    bpt.seo_title,
    bpt.seo_description,
    bc.id as category_id,
    bct.slug as category_slug,
    bct.name as category_name,
    bp.author_id,
    prof.full_name as author_name,
    bp.featured,
    bp.published_at,
    case
      when ma.id is null then null
      else jsonb_build_object(
        'id', ma.id,
        'url', ma.public_url,
        'resourceType', ma.resource_type,
        'mimeType', ma.mime_type,
        'width', ma.width,
        'height', ma.height,
        'altText', mat.alt_text,
        'caption', mat.caption
      )
    end as cover_media
  from public.blog_posts bp
  join public.blog_post_translations bpt
    on bpt.post_id = bp.id
    and bpt.locale = p_locale
  join public.blog_categories bc
    on bc.id = bp.category_id
    and bc.status = 'published'::public.publish_status
    and bc.deleted_at is null
  join public.blog_category_translations bct
    on bct.category_id = bc.id
    and bct.locale = p_locale
  join public.profiles prof
    on prof.id = bp.author_id
    and prof.is_active
    and prof.deleted_at is null
  left join public.media_assets ma
    on ma.id = bp.cover_media_id
    and ma.status = 'active'::public.media_status
    and ma.deleted_at is null
  left join public.media_asset_translations mat
    on mat.media_id = ma.id
    and mat.locale = p_locale
  cross join params params
  where bp.status = 'published'::public.publish_status
    and bp.deleted_at is null
    and (params.category_slug is null or bct.slug = params.category_slug)
    and (p_featured is null or bp.featured = p_featured)
    and (
      params.q is null
      or bpt.search_text @@ plainto_tsquery('simple', public.immutable_unaccent(lower(params.q)))
      or public.immutable_unaccent(lower(concat_ws(' ', bpt.title, bpt.excerpt, bct.name, prof.full_name)))
        like '%' || public.immutable_unaccent(lower(params.q)) || '%'
    )
  order by bp.featured desc, bp.published_at desc, bp.id
  limit least(greatest(coalesce(p_limit, 12), 1), 50)
  offset greatest(coalesce(p_offset, 0), 0);
$$;

comment on function public.public_blog_posts(public.locale_code, text, text, boolean, int, int) is
  'Public blog reader. Returns only published, non-deleted posts with localized fields and safe media metadata.';

create or replace function public.public_showrooms(
  p_locale public.locale_code default 'vi'
)
returns table (
  id uuid,
  code text,
  name text,
  address text,
  opening_hours text,
  hotline text,
  google_maps_embed_url text,
  google_maps_fallback_url text,
  latitude numeric,
  longitude numeric,
  primary_media jsonb,
  media jsonb
)
language sql
stable
security definer
set search_path = public, extensions, pg_temp
as $$
  select
    s.id,
    s.code,
    st.name,
    st.address,
    st.opening_hours,
    s.hotline,
    s.google_maps_embed_url,
    s.google_maps_fallback_url,
    s.latitude,
    s.longitude,
    (
      select jsonb_build_object(
        'id', ma.id,
        'url', ma.public_url,
        'resourceType', ma.resource_type,
        'mimeType', ma.mime_type,
        'width', ma.width,
        'height', ma.height,
        'altText', mat.alt_text,
        'caption', mat.caption
      )
      from public.showroom_media sm
      join public.media_assets ma
        on ma.id = sm.media_id
        and ma.status = 'active'::public.media_status
        and ma.deleted_at is null
      left join public.media_asset_translations mat
        on mat.media_id = ma.id
        and mat.locale = p_locale
      where sm.showroom_id = s.id
      order by sm.is_primary desc, sm.sort_order, sm.created_at
      limit 1
    ) as primary_media,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', ma.id,
          'url', ma.public_url,
          'resourceType', ma.resource_type,
          'mimeType', ma.mime_type,
          'width', ma.width,
          'height', ma.height,
          'isPrimary', sm.is_primary,
          'altText', mat.alt_text,
          'caption', mat.caption
        )
        order by sm.is_primary desc, sm.sort_order, sm.created_at
      )
      from public.showroom_media sm
      join public.media_assets ma
        on ma.id = sm.media_id
        and ma.status = 'active'::public.media_status
        and ma.deleted_at is null
      left join public.media_asset_translations mat
        on mat.media_id = ma.id
        and mat.locale = p_locale
      where sm.showroom_id = s.id
    ), '[]'::jsonb) as media
  from public.showrooms s
  join public.showroom_translations st
    on st.showroom_id = s.id
    and st.locale = p_locale
  where s.status = 'published'::public.publish_status
    and s.deleted_at is null
  order by s.sort_order, s.created_at, s.id;
$$;

comment on function public.public_showrooms(public.locale_code) is
  'Public showroom reader. Returns only published, non-deleted showrooms with localized address and safe map/media fields.';

revoke all on function public.submit_quote_request(jsonb) from public;
revoke all on function public.admin_quote_search(public.quote_status, text, timestamptz, timestamptz, text, uuid, int, int) from public;
revoke all on function public.public_products(public.locale_code, text, public.product_group_key, text, numeric, numeric, jsonb, boolean, int, int) from public;
revoke all on function public.public_blog_posts(public.locale_code, text, text, boolean, int, int) from public;
revoke all on function public.public_showrooms(public.locale_code) from public;

grant execute on function public.submit_quote_request(jsonb) to anon, authenticated, service_role;
grant execute on function public.admin_quote_search(public.quote_status, text, timestamptz, timestamptz, text, uuid, int, int) to authenticated, service_role;
grant execute on function public.public_products(public.locale_code, text, public.product_group_key, text, numeric, numeric, jsonb, boolean, int, int) to anon, authenticated, service_role;
grant execute on function public.public_blog_posts(public.locale_code, text, text, boolean, int, int) to anon, authenticated, service_role;
grant execute on function public.public_showrooms(public.locale_code) to anon, authenticated, service_role;

commit;
