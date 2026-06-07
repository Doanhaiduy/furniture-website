-- 0009_optional_local_seed.sql
-- Optional local-development seed data.
-- This migration is a no-op unless the session sets:
--   set app.seed_local = 'true';
-- before running migrations locally.

begin;

do $$
declare
  v_settings_id uuid;
  v_home_page_id uuid;
  v_about_page_id uuid;
  v_wood_category_id uuid;
  v_sanitary_category_id uuid;
  v_product_id uuid;
  v_showroom_id uuid;
begin
  if coalesce(current_setting('app.seed_local', true), 'false') <> 'true' then
    return;
  end if;

  insert into public.site_settings (
    singleton_key,
    contact_phone,
    contact_email,
    quote_sender_email
  )
  values (
    'default',
    '+84 000 000 000',
    'hello@example.test',
    'quotes@example.test'
  )
  on conflict (singleton_key) do update
  set
    contact_phone = excluded.contact_phone,
    contact_email = excluded.contact_email,
    quote_sender_email = excluded.quote_sender_email,
    updated_at = now()
  returning id into v_settings_id;

  insert into public.site_setting_translations (
    site_settings_id,
    locale,
    brand_name,
    contact_address,
    seo_default_title,
    seo_default_description
  )
  values
    (
      v_settings_id,
      'vi',
      'Showroom Noi That Phuong Dong',
      'Dia chi demo cho phat trien local',
      'Showroom Noi That Phuong Dong',
      'Noi that go va thiet bi ve sinh cho khong gian song.'
    ),
    (
      v_settings_id,
      'en',
      'Phuong Dong Interior Showroom',
      'Local development demo address',
      'Phuong Dong Interior Showroom',
      'Wooden furniture and sanitary equipment for homes and projects.'
    )
  on conflict (site_settings_id, locale) do update
  set
    brand_name = excluded.brand_name,
    contact_address = excluded.contact_address,
    seo_default_title = excluded.seo_default_title,
    seo_default_description = excluded.seo_default_description,
    updated_at = now();

  insert into public.social_links (
    site_settings_id,
    platform,
    label,
    url,
    is_enabled,
    share_enabled,
    sort_order
  )
  values (
    v_settings_id,
    'facebook',
    'Facebook',
    'https://example.test/facebook',
    true,
    true,
    10
  )
  on conflict (site_settings_id, platform) do update
  set
    label = excluded.label,
    url = excluded.url,
    is_enabled = excluded.is_enabled,
    share_enabled = excluded.share_enabled,
    sort_order = excluded.sort_order,
    updated_at = now();

  insert into public.quote_recipients (
    site_settings_id,
    email,
    label,
    is_active
  )
  select
    v_settings_id,
    'quotes@example.test',
    'Local quote inbox',
    true
  where not exists (
    select 1
    from public.quote_recipients
    where site_settings_id = v_settings_id
      and lower(email) = 'quotes@example.test'
      and is_active
  );

  insert into public.content_pages (key, status)
  values ('home', 'draft')
  on conflict (key) do update set updated_at = now()
  returning id into v_home_page_id;

  insert into public.content_pages (key, status)
  values ('about', 'draft')
  on conflict (key) do update set updated_at = now()
  returning id into v_about_page_id;

  insert into public.content_page_translations (
    page_id,
    locale,
    slug,
    title,
    lead,
    body_json,
    seo_title,
    seo_description
  )
  values
    (
      v_home_page_id,
      'vi',
      'trang-chu',
      'Showroom Noi That Phuong Dong',
      'Noi that go va thiet bi ve sinh cho nha o va cong trinh.',
      '{}'::jsonb,
      'Showroom Noi That Phuong Dong',
      'Trang demo local cho showroom noi that va thiet bi ve sinh.'
    ),
    (
      v_home_page_id,
      'en',
      'home',
      'Phuong Dong Interior Showroom',
      'Wooden furniture and sanitary equipment for homes and projects.',
      '{}'::jsonb,
      'Phuong Dong Interior Showroom',
      'Local demo homepage for furniture and sanitary equipment.'
    ),
    (
      v_about_page_id,
      'vi',
      'gioi-thieu',
      'Gioi thieu',
      'Noi dung demo ve tam nhin, su menh va nang luc.',
      '{}'::jsonb,
      'Gioi thieu',
      'Thong tin demo ve showroom.'
    ),
    (
      v_about_page_id,
      'en',
      'about',
      'About',
      'Demo content for vision, mission and capabilities.',
      '{}'::jsonb,
      'About',
      'Demo showroom information.'
    )
  on conflict (page_id, locale) do update
  set
    slug = excluded.slug,
    title = excluded.title,
    lead = excluded.lead,
    body_json = excluded.body_json,
    seo_title = excluded.seo_title,
    seo_description = excluded.seo_description,
    updated_at = now();

  update public.content_pages
  set status = 'published'
  where id in (v_home_page_id, v_about_page_id);

  select id into v_wood_category_id
  from public.product_categories
  where parent_id is null and group_key = 'wooden_furniture'
  order by created_at
  limit 1;

  if v_wood_category_id is null then
    insert into public.product_categories (group_key, status, sort_order)
    values ('wooden_furniture', 'draft', 10)
    returning id into v_wood_category_id;
  end if;

  select id into v_sanitary_category_id
  from public.product_categories
  where parent_id is null and group_key = 'sanitary_equipment'
  order by created_at
  limit 1;

  if v_sanitary_category_id is null then
    insert into public.product_categories (group_key, status, sort_order)
    values ('sanitary_equipment', 'draft', 20)
    returning id into v_sanitary_category_id;
  end if;

  insert into public.product_category_translations (
    category_id,
    locale,
    slug,
    name,
    description,
    seo_title,
    seo_description
  )
  values
    (
      v_wood_category_id,
      'vi',
      'do-go-noi-that',
      'Do go noi that',
      'Nhom san pham do go noi that demo.',
      'Do go noi that',
      'Danh muc do go noi that demo.'
    ),
    (
      v_wood_category_id,
      'en',
      'wooden-furniture',
      'Wooden furniture',
      'Demo wooden furniture product group.',
      'Wooden furniture',
      'Demo wooden furniture category.'
    ),
    (
      v_sanitary_category_id,
      'vi',
      'thiet-bi-ve-sinh',
      'Thiet bi ve sinh',
      'Nhom san pham thiet bi ve sinh demo.',
      'Thiet bi ve sinh',
      'Danh muc thiet bi ve sinh demo.'
    ),
    (
      v_sanitary_category_id,
      'en',
      'sanitary-equipment',
      'Sanitary equipment',
      'Demo sanitary equipment product group.',
      'Sanitary equipment',
      'Demo sanitary equipment category.'
    )
  on conflict (category_id, locale) do update
  set
    slug = excluded.slug,
    name = excluded.name,
    description = excluded.description,
    seo_title = excluded.seo_title,
    seo_description = excluded.seo_description,
    updated_at = now();

  update public.product_categories
  set status = 'published'
  where id in (v_wood_category_id, v_sanitary_category_id);

  select id into v_product_id
  from public.products
  where lower(reference_code) = 'local-demo-001'
    and deleted_at is null
  limit 1;

  if v_product_id is null then
    insert into public.products (
      category_id,
      reference_code,
      status,
      price_min,
      price_max,
      currency,
      brand_series,
      featured,
      sort_order
    )
    values (
      v_wood_category_id,
      'LOCAL-DEMO-001',
      'draft',
      1000000,
      2500000,
      'VND',
      'Local demo',
      true,
      10
    )
    returning id into v_product_id;
  end if;

  insert into public.product_translations (
    product_id,
    locale,
    slug,
    name,
    summary,
    description_json,
    material,
    price_display_text,
    dimension_display_text,
    seo_title,
    seo_description
  )
  values
    (
      v_product_id,
      'vi',
      'san-pham-demo-local',
      'San pham demo local',
      'San pham mau dung de kiem thu danh sach va tim kiem.',
      '{"type":"doc","content":[]}'::jsonb,
      'Go tu nhien',
      'Lien he bao gia',
      'Tuy chon theo cong trinh',
      'San pham demo local',
      'San pham demo cho moi truong phat trien.'
    ),
    (
      v_product_id,
      'en',
      'local-demo-product',
      'Local demo product',
      'Sample product for listing and search tests.',
      '{"type":"doc","content":[]}'::jsonb,
      'Natural wood',
      'Contact for quote',
      'Custom by project',
      'Local demo product',
      'Demo product for local development.'
    )
  on conflict (product_id, locale) do update
  set
    slug = excluded.slug,
    name = excluded.name,
    summary = excluded.summary,
    description_json = excluded.description_json,
    material = excluded.material,
    price_display_text = excluded.price_display_text,
    dimension_display_text = excluded.dimension_display_text,
    seo_title = excluded.seo_title,
    seo_description = excluded.seo_description,
    updated_at = now();

  update public.products
  set status = 'published'
  where id = v_product_id;

  select id into v_showroom_id
  from public.showrooms
  where lower(code) = 'local-showroom'
    and deleted_at is null
  limit 1;

  if v_showroom_id is null then
    insert into public.showrooms (
      code,
      hotline,
      google_maps_embed_url,
      google_maps_fallback_url,
      status,
      sort_order
    )
    values (
      'LOCAL-SHOWROOM',
      '+84 000 000 000',
      'https://www.google.com/maps/embed?pb=local-demo',
      'https://www.google.com/maps',
      'draft',
      10
    )
    returning id into v_showroom_id;
  end if;

  insert into public.showroom_translations (
    showroom_id,
    locale,
    name,
    address,
    opening_hours
  )
  values
    (
      v_showroom_id,
      'vi',
      'Showroom demo local',
      'Dia chi showroom demo',
      '08:00 - 18:00'
    ),
    (
      v_showroom_id,
      'en',
      'Local demo showroom',
      'Demo showroom address',
      '08:00 - 18:00'
    )
  on conflict (showroom_id, locale) do update
  set
    name = excluded.name,
    address = excluded.address,
    opening_hours = excluded.opening_hours,
    updated_at = now();

  update public.showrooms
  set status = 'published'
  where id = v_showroom_id;
end
$$;

commit;
