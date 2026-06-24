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
  v_tiles_category_id uuid;
  v_product_id uuid;
  v_showroom_id uuid;
  v_author_id uuid;
  v_blog_cat_id uuid;
  v_product_2_id uuid;
  v_product_3_id uuid;
  v_product_4_id uuid;
  v_product_5_id uuid;
  v_blog_post_1_id uuid;
  v_blog_post_2_id uuid;
  v_blog_post_3_id uuid;
  v_showroom_2_id uuid;
  v_showroom_3_id uuid;
  v_admin_id uuid;

  -- Fixed UUIDs for Media Assets
  v_hero_media_id uuid := '00000000-0000-0000-0000-000000000101';
  v_showroom_media_id uuid := '00000000-0000-0000-0000-000000000102';
  v_woodwall_media_id uuid := '00000000-0000-0000-0000-000000000103';
  v_sofa_media_id uuid := '00000000-0000-0000-0000-000000000104';
  v_texture_media_id uuid := '00000000-0000-0000-0000-000000000105';
  v_room_media_id uuid := '00000000-0000-0000-0000-000000000106';
  v_table_media_id uuid := '00000000-0000-0000-0000-000000000107';
  v_chair_media_id uuid := '00000000-0000-0000-0000-000000000108';
  v_cabinet_media_id uuid := '00000000-0000-0000-0000-000000000109';
  v_abouthero_media_id uuid := '00000000-0000-0000-0000-000000000110';
  v_factory_media_id uuid := '00000000-0000-0000-0000-000000000111';
  v_blog1_media_id uuid := '00000000-0000-0000-0000-000000000112';
  v_blog2_media_id uuid := '00000000-0000-0000-0000-000000000113';
  v_showroom2_media_id uuid := '00000000-0000-0000-0000-000000000114';
  v_logo_media_id uuid := '00000000-0000-0000-0000-000000000115';
begin
  -- Seed local data unconditionally in local development environment
  -- if coalesce(current_setting('app.seed_local', true), 'false') <> 'true' then
  --   return;
  -- end if;

  -- 1. SEED MEDIA ASSETS
  insert into public.media_assets (id, storage_provider, cloudinary_public_id, public_url, resource_type, mime_type, format, size_bytes)
  values
    (v_logo_media_id, 'cloudinary', 'showroom/logo', 'http://local-assets/logo-final.svg', 'image', 'image/svg+xml', 'svg', 29612),
    (v_hero_media_id, 'cloudinary', 'showroom/hero', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1234567890/showroom/hero.jpg', 'image', 'image/jpeg', 'jpg', 102400),
    (v_showroom_media_id, 'cloudinary', 'showroom/showroom', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424086/showroom/showroom.jpg', 'image', 'image/jpeg', 'jpg', 102400),
    (v_woodwall_media_id, 'cloudinary', 'showroom/woodWall', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424088/showroom/woodWall.png', 'image', 'image/png', 'png', 102400),
    (v_sofa_media_id, 'cloudinary', 'showroom/sofa', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424089/showroom/sofa.jpg', 'image', 'image/jpeg', 'jpg', 102400),
    (v_texture_media_id, 'cloudinary', 'showroom/texture', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424090/showroom/texture.jpg', 'image', 'image/jpeg', 'jpg', 102400),
    (v_room_media_id, 'cloudinary', 'showroom/room', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424091/showroom/room.jpg', 'image', 'image/jpeg', 'jpg', 102400),
    (v_table_media_id, 'cloudinary', 'showroom/table', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424092/showroom/table.png', 'image', 'image/png', 'png', 102400),
    (v_chair_media_id, 'cloudinary', 'showroom/chair', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424093/showroom/chair.png', 'image', 'image/png', 'png', 102400),
    (v_cabinet_media_id, 'cloudinary', 'showroom/cabinet', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424095/showroom/cabinet.png', 'image', 'image/png', 'png', 102400),
    (v_abouthero_media_id, 'cloudinary', 'showroom/aboutHero', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424096/showroom/aboutHero.png', 'image', 'image/png', 'png', 102400),
    (v_factory_media_id, 'cloudinary', 'showroom/factory', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424097/showroom/factory.png', 'image', 'image/png', 'png', 102400),
    (v_blog1_media_id, 'cloudinary', 'showroom/blog1', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424098/showroom/blog1.png', 'image', 'image/png', 'png', 102400),
    (v_blog2_media_id, 'cloudinary', 'showroom/blog2', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424100/showroom/blog2.png', 'image', 'image/png', 'png', 102400),
    (v_showroom2_media_id, 'cloudinary', 'showroom/showroom2', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424101/showroom/showroom2.png', 'image', 'image/png', 'png', 102400)
  on conflict (id) do update
  set
    public_url = excluded.public_url,
    updated_at = now();

  -- 2. SEED SITE SETTINGS
  insert into public.site_settings (
    singleton_key,
    contact_phone,
    contact_email,
    quote_sender_email,
    logo_media_id,
    favicon_media_id,
    default_og_image_media_id
  )
  values (
    'default',
    '+84 000 000 000',
    'hello@example.test',
    'quotes@example.test',
    v_logo_media_id,
    v_logo_media_id,
    v_hero_media_id
  )
  on conflict (singleton_key) do update
  set
    contact_phone = excluded.contact_phone,
    contact_email = excluded.contact_email,
    quote_sender_email = excluded.quote_sender_email,
    logo_media_id = excluded.logo_media_id,
    favicon_media_id = excluded.favicon_media_id,
    default_og_image_media_id = excluded.default_og_image_media_id,
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
      'Showroom Nội Thất Phương Đông',
      'Địa chỉ demo cho phát triển local',
      'Showroom Nội Thất Phương Đông',
      'Nội thất gỗ và thiết bị vệ sinh cho không gian sống.'
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
      'Showroom Nội Thất Phương Đông',
      'Nội thất gỗ và thiết bị vệ sinh cho nhà ở và công trình.',
      '{}'::jsonb,
      'Showroom Nội Thất Phương Đông',
      'Trang demo local cho showroom nội thất và thiết bị vệ sinh.'
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
      'Giới thiệu',
      'Nội dung demo về tầm nhìn, sứ mệnh và năng lực.',
      '{}'::jsonb,
      'Giới thiệu',
      'Thông tin demo về showroom.'
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

  -- 3. SEED PRODUCT CATEGORIES
  select id into v_wood_category_id
  from public.product_categories
  where parent_id is null and group_key = 'wooden_furniture'
  order by created_at
  limit 1;

  if v_wood_category_id is null then
    insert into public.product_categories (group_key, status, sort_order, image_media_id)
    values ('wooden_furniture', 'draft', 10, v_woodwall_media_id)
    returning id into v_wood_category_id;
  else
    update public.product_categories
    set image_media_id = v_woodwall_media_id
    where id = v_wood_category_id;
  end if;

  select id into v_sanitary_category_id
  from public.product_categories
  where parent_id is null and group_key = 'sanitary_equipment'
  order by created_at
  limit 1;

  if v_sanitary_category_id is null then
    insert into public.product_categories (group_key, status, sort_order, image_media_id)
    values ('sanitary_equipment', 'draft', 20, v_room_media_id)
    returning id into v_sanitary_category_id;
  else
    update public.product_categories
    set image_media_id = v_room_media_id
    where id = v_sanitary_category_id;
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
      'Đồ gỗ nội thất',
      'Nhóm sản phẩm đồ gỗ nội thất chất lượng cao.',
      'Đồ gỗ nội thất',
      'Danh mục đồ gỗ nội thất cao cấp Phương Đông.'
    ),
    (
      v_wood_category_id,
      'en',
      'wooden-furniture',
      'Wooden furniture',
      'Premium wooden furniture collection.',
      'Wooden furniture',
      'Premium wooden furniture category by Phuong Dong.'
    ),
    (
      v_sanitary_category_id,
      'vi',
      'thiet-bi-ve-sinh',
      'Thiết bị vệ sinh',
      'Nhóm sản phẩm thiết bị vệ sinh nhập khẩu cao cấp.',
      'Thiết bị vệ sinh',
      'Danh mục thiết bị vệ sinh showroom Phương Đông.'
    ),
    (
      v_sanitary_category_id,
      'en',
      'sanitary-equipment',
      'Sanitary equipment',
      'Imported sanitary equipment collection.',
      'Sanitary equipment',
      'Premium sanitary equipment category by Phuong Dong.'
    )
  on conflict (category_id, locale) do update
  set
    slug = excluded.slug,
    name = excluded.name,
    description = excluded.description,
    seo_title = excluded.seo_title,
    seo_description = excluded.seo_description,
    updated_at = now();

  -- Seed tiles category
  select id into v_tiles_category_id
  from public.product_categories
  where group_key = 'tiles'
  order by created_at
  limit 1;

  if v_tiles_category_id is null then
    v_tiles_category_id := 'a1111111-1111-1111-1111-111111111111';
    insert into public.product_categories (id, group_key, status, sort_order)
    values (v_tiles_category_id, 'tiles', 'draft', 30)
    on conflict (id) do nothing;
  end if;

  insert into public.product_category_translations (category_id, locale, slug, name, description, seo_title, seo_description)
  values
    (v_tiles_category_id, 'vi', 'gach-op-lat', 'Gạch ốp lát', 'Gạch ốp lát chất lượng cao', 'Gạch ốp lát', 'Gạch ốp lát cao cấp Phương Đông'),
    (v_tiles_category_id, 'en', 'tiles', 'Tiles', 'Premium floor and wall tiles', 'Tiles', 'Premium floor and wall tiles')
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
  where id in (v_wood_category_id, v_sanitary_category_id, v_tiles_category_id);

  -- Insert demo author profile
  v_author_id := '00000000-0000-0000-0000-000000000001';
  
  insert into auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, aud, role,
    confirmation_token, recovery_token, email_change_token_new, 
    email_change, phone_change, phone_change_token, 
    email_change_token_current, reauthentication_token, email_change_confirm_status,
    created_at, updated_at
  )
  values (
    v_author_id,
    '00000000-0000-0000-0000-000000000000',
    'author@phuongdong.vn',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Tác Giả Demo"}'::jsonb,
    'authenticated',
    'authenticated',
    '', '', '', 
    '', '', '', 
    '', '', 0,
    now(), now()
  )
  on conflict (id) do nothing;

  insert into public.profiles (id, email, full_name, role, is_active)
  values (
    v_author_id,
    'author@phuongdong.vn',
    'Tác Giả Demo',
    'editor',
    true
  )
  on conflict (id) do nothing;

  -- Insert admin profile
  v_admin_id := '00000000-0000-0000-0000-000000000002';
  
  insert into auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, aud, role,
    confirmation_token, recovery_token, email_change_token_new, 
    email_change, phone_change, phone_change_token, 
    email_change_token_current, reauthentication_token, email_change_confirm_status,
    created_at, updated_at
  )
  values (
    v_admin_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@furniture.com',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Admin Phuong Dong"}'::jsonb,
    'authenticated',
    'authenticated',
    '', '', '', 
    '', '', '', 
    '', '', 0,
    now(), now()
  )
  on conflict (id) do nothing;

  insert into public.profiles (id, email, full_name, role, is_active)
  values (
    v_admin_id,
    'admin@furniture.com',
    'Admin Phuong Dong',
    'admin',
    true
  )
  on conflict (id) do nothing;

  -- 4. SEED PRODUCTS
  -- Product 1: Sofa Curve Velour
  select id into v_product_id
  from public.products
  where lower(reference_code) = 'pd-s2401'
    and deleted_at is null
  limit 1;

  if v_product_id is null then
    insert into public.products (category_id, reference_code, status, price_min, price_max, currency, brand_series, featured, sort_order)
    values (v_wood_category_id, 'PD-S2401', 'draft', 45000000, 52000000, 'VND', 'Heritage Collection', true, 10)
    returning id into v_product_id;
  end if;

  insert into public.product_translations (product_id, locale, slug, name, summary, description_json, material, price_display_text, dimension_display_text, seo_title, seo_description)
  values
    (v_product_id, 'vi', 'sofa-curve-velour', 'Sofa Curve Velour', 'Sofa cao cấp bọc vải Velour với đường cong tinh tế.', '{"type":"doc","content":[]}'::jsonb, 'Gỗ sồi tự nhiên', '45,000,000 VND', '2400 x 950 x 850 mm', 'Sofa Curve Velour', 'Sofa cao cấp bọc vải Velour'),
    (v_product_id, 'en', 'sofa-curve-velour', 'Sofa Curve Velour', 'Premium velour sofa with a soft curved silhouette.', '{"type":"doc","content":[]}'::jsonb, 'Natural oak', '45,000,000 VND', '2400 x 950 x 850 mm', 'Sofa Curve Velour', 'Premium velour sofa')
  on conflict (product_id, locale) do update set slug = excluded.slug, name = excluded.name, summary = excluded.summary, updated_at = now();

  update public.products set status = 'published' where id = v_product_id;

  -- Seed product media for Sofa Curve Velour
  delete from public.product_media where product_id = v_product_id;
  insert into public.product_media (product_id, media_id, context, is_primary, sort_order)
  values
    (v_product_id, v_sofa_media_id, 'gallery', true, 1),
    (v_product_id, v_texture_media_id, 'gallery', false, 2),
    (v_product_id, v_room_media_id, 'gallery', false, 3)
  on conflict (product_id, media_id) do nothing;

  -- Product 2: Bàn Trà Marble Round
  select id into v_product_2_id
  from public.products
  where lower(reference_code) = 'pd-t2402'
    and deleted_at is null
  limit 1;

  if v_product_2_id is null then
    insert into public.products (category_id, reference_code, status, price_min, price_max, currency, brand_series, featured, sort_order)
    values (v_wood_category_id, 'PD-T2402', 'draft', 12500000, 12500000, 'VND', 'Atelier Series', true, 20)
    returning id into v_product_2_id;
  end if;

  insert into public.product_translations (product_id, locale, slug, name, summary, description_json, material, price_display_text, dimension_display_text, seo_title, seo_description)
  values
    (v_product_2_id, 'vi', 'ban-tra-marble-round', 'Bàn Trà Marble Round', 'Mặt đá marble Calacatta, chân gỗ walnut.', '{"type":"doc","content":[]}'::jsonb, 'Đá marble', '12,500,000 VND', 'Đường kính 900 mm', 'Bàn Trà Marble Round', 'Bàn Trà Marble Round'),
    (v_product_2_id, 'en', 'ban-tra-marble-round', 'Marble Round Coffee Table', 'Calacatta marble top and walnut base.', '{"type":"doc","content":[]}'::jsonb, 'Marble', '12,500,000 VND', 'Diameter 900 mm', 'Marble Round Coffee Table', 'Marble Round Coffee Table')
  on conflict (product_id, locale) do update set slug = excluded.slug, name = excluded.name, summary = excluded.summary, updated_at = now();

  update public.products set status = 'published' where id = v_product_2_id;

  -- Seed product media for Bàn Trà Marble Round
  delete from public.product_media where product_id = v_product_2_id;
  insert into public.product_media (product_id, media_id, context, is_primary, sort_order)
  values
    (v_product_2_id, v_table_media_id, 'gallery', true, 1),
    (v_product_2_id, v_room_media_id, 'gallery', false, 2)
  on conflict (product_id, media_id) do nothing;

  -- Product 3: Kệ Tivi Minimalist Wood
  select id into v_product_3_id
  from public.products
  where lower(reference_code) = 'pd-k2404'
    and deleted_at is null
  limit 1;

  if v_product_3_id is null then
    insert into public.products (category_id, reference_code, status, price_min, price_max, currency, brand_series, featured, sort_order)
    values (v_wood_category_id, 'PD-K2404', 'draft', 22000000, 22000000, 'VND', 'Atelier Series', false, 30)
    returning id into v_product_3_id;
  end if;

  insert into public.product_translations (product_id, locale, slug, name, summary, description_json, material, price_display_text, dimension_display_text, seo_title, seo_description)
  values
    (v_product_3_id, 'vi', 'ke-tivi-minimalist-wood', 'Kệ Tivi Minimalist Wood', 'Kệ tivi gỗ veneer tối màu với ngăn kéo giảm chấn.', '{"type":"doc","content":[]}'::jsonb, 'Veneer', '22,000,000 VND', '2200 mm', 'Kệ Tivi Minimalist Wood', 'Kệ Tivi Minimalist Wood'),
    (v_product_3_id, 'en', 'ke-tivi-minimalist-wood', 'Minimalist Wood TV Cabinet', 'Dark veneer TV cabinet with soft-close drawers.', '{"type":"doc","content":[]}'::jsonb, 'Veneer', '22,000,000 VND', '2200 mm', 'Minimalist Wood TV Cabinet', 'Minimalist Wood TV Cabinet')
  on conflict (product_id, locale) do update set slug = excluded.slug, name = excluded.name, summary = excluded.summary, updated_at = now();

  update public.products set status = 'published' where id = v_product_3_id;

  -- Seed product media for Kệ Tivi Minimalist Wood
  delete from public.product_media where product_id = v_product_3_id;
  insert into public.product_media (product_id, media_id, context, is_primary, sort_order)
  values
    (v_product_3_id, v_cabinet_media_id, 'gallery', true, 1)
  on conflict (product_id, media_id) do nothing;

  -- Product 4: Sen Tắm Mạ Vàng 24K
  select id into v_product_4_id
  from public.products
  where lower(reference_code) = 'pd-b2405'
    and deleted_at is null
  limit 1;

  if v_product_4_id is null then
    insert into public.products (category_id, reference_code, status, price_min, price_max, currency, brand_series, featured, sort_order)
    values (v_sanitary_category_id, 'PD-B2405', 'draft', 12500000, 12500000, 'VND', 'Wellness Collection', true, 40)
    returning id into v_product_4_id;
  end if;

  insert into public.product_translations (product_id, locale, slug, name, summary, description_json, material, price_display_text, dimension_display_text, seo_title, seo_description)
  values
    (v_product_4_id, 'vi', 'sen-tam-ma-vang-24k', 'Sen Tắm Mạ Vàng 24K', 'Bộ sen tắm mạ vàng với van điều nhiệt.', '{"type":"doc","content":[]}'::jsonb, 'Đồng thau', '12,500,000 VND', 'Tiêu chuẩn', 'Sen Tắm Mạ Vàng 24K', 'Sen Tắm Mạ Vàng 24K'),
    (v_product_4_id, 'en', 'sen-tam-ma-vang-24k', '24K Gold Plated Shower Set', 'Gold plated shower set with thermostatic valve.', '{"type":"doc","content":[]}'::jsonb, 'Brass', '12,500,000 VND', 'Standard', '24K Gold Plated Shower Set', '24K Gold Plated Shower Set')
  on conflict (product_id, locale) do update set slug = excluded.slug, name = excluded.name, summary = excluded.summary, updated_at = now();

  update public.products set status = 'published' where id = v_product_4_id;

  -- Seed product media for Sen Tắm Mạ Vàng 24K
  delete from public.product_media where product_id = v_product_4_id;
  insert into public.product_media (product_id, media_id, context, is_primary, sort_order)
  values
    (v_product_4_id, v_room_media_id, 'gallery', true, 1)
  on conflict (product_id, media_id) do nothing;

  -- Product 5: Gạch Eurotile Hoàng Gia (c3e1ae4d-b971-4668-b8f9-4bbfd4bf5a29)
  -- This product is used by tests/integration/slugResolver.test.ts
  select id into v_product_5_id
  from public.products
  where id = 'c3e1ae4d-b971-4668-b8f9-4bbfd4bf5a29'
    and deleted_at is null
  limit 1;

  if v_product_5_id is null then
    insert into public.products (id, category_id, reference_code, status, price_min, price_max, currency, brand_series, featured, sort_order)
    values ('c3e1ae4d-b971-4668-b8f9-4bbfd4bf5a29', v_tiles_category_id, 'PD-T-ROYAL', 'draft', 15000000, 15000000, 'VND', 'Royal Collection', true, 50)
    returning id into v_product_5_id;
  end if;

  insert into public.product_translations (product_id, locale, slug, name, summary, description_json, material, price_display_text, dimension_display_text, seo_title, seo_description)
  values
    (v_product_5_id, 'vi', 'gach-eurotile-hoang-gia', 'Gạch Eurotile Hoàng Gia', 'Gạch Eurotile cao cấp vân đá Hoàng Gia.', '{"type":"doc","content":[]}'::jsonb, 'Porcelain', '15,000,000 VND', '800 x 800 mm', 'Gạch Eurotile Hoàng Gia', 'Gạch Eurotile Hoàng Gia'),
    (v_product_5_id, 'en', 'eurotile-royal-tile', 'Eurotile Royal Tile', 'Premium Eurotile Royal marble look porcelain tile.', '{"type":"doc","content":[]}'::jsonb, 'Porcelain', '$600', '800 x 800 mm', 'Eurotile Royal Tile', 'Eurotile Royal Tile')
  on conflict (product_id, locale) do update set slug = excluded.slug, name = excluded.name, summary = excluded.summary, updated_at = now();

  update public.products set status = 'published' where id = v_product_5_id;

  -- Seed product media for Gạch Eurotile Hoàng Gia
  delete from public.product_media where product_id = v_product_5_id;
  insert into public.product_media (product_id, media_id, context, is_primary, sort_order)
  values
    (v_product_5_id, v_texture_media_id, 'gallery', true, 1)
  on conflict (product_id, media_id) do nothing;


  -- 5. SEED SHOWROOMS
  -- Showroom 1: Hà Nội - Flagship Store
  select id into v_showroom_id
  from public.showrooms
  where lower(code) = 'hn'
    and deleted_at is null
  limit 1;

  if v_showroom_id is null then
    insert into public.showrooms (code, hotline, google_maps_embed_url, google_maps_fallback_url, status, sort_order)
    values ('HN', '1900 1234', 'https://www.google.com/maps/embed?pb=hanoi', 'https://www.google.com/maps', 'draft', 10)
    returning id into v_showroom_id;
  end if;

  insert into public.showroom_translations (showroom_id, locale, name, address, opening_hours)
  values
    (v_showroom_id, 'vi', 'Hà Nội - Flagship Store', '123 Trần Duy Hưng, Cầu Giấy, Hà Nội', '08:00 - 20:00 hằng ngày'),
    (v_showroom_id, 'en', 'Hanoi Flagship Store', '123 Tran Duy Hung, Cau Giay, Hanoi', '08:00 - 20:00 daily')
  on conflict (showroom_id, locale) do update set name = excluded.name, address = excluded.address, updated_at = now();

  update public.showrooms set status = 'published' where id = v_showroom_id;

  -- Seed showroom media for HN Showroom
  delete from public.showroom_media where showroom_id = v_showroom_id;
  insert into public.showroom_media (showroom_id, media_id, is_primary, sort_order)
  values
    (v_showroom_id, v_showroom_media_id, true, 1)
  on conflict (showroom_id, media_id) do nothing;

  -- Showroom 2: TP. Hồ Chí Minh
  select id into v_showroom_2_id
  from public.showrooms
  where lower(code) = 'hcm'
    and deleted_at is null
  limit 1;

  if v_showroom_2_id is null then
    insert into public.showrooms (code, hotline, google_maps_embed_url, google_maps_fallback_url, status, sort_order)
    values ('HCM', '1900 5678', 'https://www.google.com/maps/embed?pb=hcm', 'https://www.google.com/maps', 'draft', 20)
    returning id into v_showroom_2_id;
  end if;

  insert into public.showroom_translations (showroom_id, locale, name, address, opening_hours)
  values
    (v_showroom_2_id, 'vi', 'TP. Hồ Chí Minh', '456 Nguyễn Thị Minh Khai, Quận 1, TP. HCM', '08:30 - 19:30 hằng ngày'),
    (v_showroom_2_id, 'en', 'Ho Chi Minh City', '456 Nguyen Thi Minh Khai, District 1, HCMC', '08:30 - 19:30 daily')
  on conflict (showroom_id, locale) do update set name = excluded.name, address = excluded.address, updated_at = now();

  update public.showrooms set status = 'published' where id = v_showroom_2_id;

  -- Seed showroom media for HCM Showroom
  delete from public.showroom_media where showroom_id = v_showroom_2_id;
  insert into public.showroom_media (showroom_id, media_id, is_primary, sort_order)
  values
    (v_showroom_2_id, v_showroom2_media_id, true, 1)
  on conflict (showroom_id, media_id) do nothing;

  -- Showroom 3: Đà Nẵng Experience Studio
  select id into v_showroom_3_id
  from public.showrooms
  where lower(code) = 'dn'
    and deleted_at is null
  limit 1;

  if v_showroom_3_id is null then
    insert into public.showrooms (code, hotline, google_maps_embed_url, google_maps_fallback_url, status, sort_order)
    values ('DN', '1900 8888', 'https://www.google.com/maps/embed?pb=danang', 'https://www.google.com/maps', 'draft', 30)
    returning id into v_showroom_3_id;
  end if;

  insert into public.showroom_translations (showroom_id, locale, name, address, opening_hours)
  values
    (v_showroom_3_id, 'vi', 'Đà Nẵng Experience Studio', '88 Nguyễn Văn Linh, Hải Châu, Đà Nẵng', '09:00 - 18:00'),
    (v_showroom_3_id, 'en', 'Da Nang Experience Studio', '88 Nguyen Van Linh, Hai Chau, Da Nang', '09:00 - 18:00')
  on conflict (showroom_id, locale) do update set name = excluded.name, address = excluded.address, updated_at = now();

  update public.showrooms set status = 'published' where id = v_showroom_3_id;

  -- Seed showroom media for DN Experience Studio
  delete from public.showroom_media where showroom_id = v_showroom_3_id;
  insert into public.showroom_media (showroom_id, media_id, is_primary, sort_order)
  values
    (v_showroom_3_id, v_room_media_id, true, 1)
  on conflict (showroom_id, media_id) do nothing;


  -- 6. SEED BLOG CATEGORIES & BLOG POSTS
  -- Blog Category 1: Wood Knowledge
  select id into v_blog_cat_id
  from public.blog_categories
  order by created_at
  limit 1;

  if v_blog_cat_id is null then
    insert into public.blog_categories (status, sort_order)
    values ('draft', 10)
    returning id into v_blog_cat_id;
  end if;

  insert into public.blog_category_translations (category_id, locale, slug, name, description)
  values
    (v_blog_cat_id, 'vi', 'kien-thuc-do-go', 'Kiến thức đồ gỗ', 'Các bài viết tư vấn kỹ thuật chọn gỗ.'),
    (v_blog_cat_id, 'en', 'wood-knowledge', 'Wood knowledge', 'Articles on wood material selection and tips.')
  on conflict (category_id, locale) do update set name = excluded.name, slug = excluded.slug;

  update public.blog_categories set status = 'published' where id = v_blog_cat_id;

  -- Blog Post 1: Walnut Wood selection
  select id into v_blog_post_1_id
  from public.blog_posts
  where deleted_at is null
  order by created_at
  limit 1;

  if v_blog_post_1_id is null then
    insert into public.blog_posts (category_id, author_id, status, featured, published_at, cover_media_id)
    values (v_blog_cat_id, v_author_id, 'draft', true, now(), v_blog1_media_id)
    returning id into v_blog_post_1_id;
  else
    update public.blog_posts
    set cover_media_id = v_blog1_media_id
    where id = v_blog_post_1_id;
  end if;

  insert into public.blog_post_translations (post_id, locale, slug, title, excerpt, body_json, seo_title, seo_description)
  values
    (v_blog_post_1_id, 'vi', 'bi-quyet-chon-go-oc-cho', 'Bí quyết chọn gỗ óc chó cho nội thất bền vững', 'Nhận biết vân gỗ, độ ẩm và quy trình xử lý bề mặt trước khi đầu tư.', '{"takeaways":["Ưu tiên nguồn gỗ rõ ràng, độ ẩm ổn định và quy trình sấy phù hợp khí hậu Việt Nam.","Quan sát vân gỗ, màu sắc và độ hoàn thiện dưới ánh sáng tự nhiên lẫn ánh sáng showroom.","Yêu cầu tư vấn bảo hành, chăm sóc bề mặt và điều kiện lắp đặt trước khi chốt vật liệu."],"quote":{"vi":"Một món đồ gỗ tốt không chỉ đẹp ở ngày bàn giao; nó phải giữ được nhịp sống của gia đình trong nhiều năm.","en":"A good wooden piece is not only beautiful on handover day; it should keep pace with family life for years."},"sections":[{"id":"nguon-goc","title":{"vi":"Bắt đầu từ nguồn gốc và độ ổn định","en":"Start with sourcing and stability"},"body":{"vi":"Gỗ óc chó cao cấp cần có hồ sơ nguồn gốc, thông tin sấy và kiểm soát độ ẩm rõ ràng. Khi khí hậu thay đổi theo mùa, vật liệu chưa ổn định dễ cong vênh, nứt chân chim hoặc lệch màu sau một thời gian sử dụng.","en":"Premium walnut should come with clear sourcing, drying and moisture control information. When seasonal humidity changes, unstable material can warp, crack or shift color after use."}},{"id":"van-go","title":{"vi":"Đọc vân gỗ như một lớp thiết kế","en":"Read the grain as a design layer"},"body":{"vi":"Vân gỗ đẹp phải có nhịp điệu tự nhiên, không bị ghép vá thiếu chủ đích. Với các bề mặt lớn như bàn, tủ hoặc vách, cách đảo vân và nối tấm quyết định cảm giác cao cấp của toàn bộ không gian.","en":"Beautiful grain has a natural rhythm, not a patched look. On large tables, cabinets or wall panels, grain matching and board joining define the premium feel of the entire space."},"image":"https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424088/showroom/woodWall.png"},{"id":"hoan-thien","title":{"vi":"Bề mặt hoàn thiện phải phục vụ đời sống thật","en":"Finishing must serve real living"},"body":{"vi":"Một lớp hoàn thiện tốt cân bằng giữa cảm giác chạm, độ bền và khả năng bảo trì. Hãy kiểm tra cạnh, góc, mặt sau, ray trượt và những chi tiết ít thấy, vì đó là nơi thể hiện tay nghề và tiêu chuẩn sản xuất.","en":"A good finish balances touch, durability and maintainability. Inspect edges, corners, backs, runners and hidden details because they reveal craft and production standards."}},{"id":"showroom","title":{"vi":"So sánh trực tiếp tại showroom","en":"Compare directly in the showroom"},"body":{"vi":"Mẫu vật liệu cần được xem cạnh đá, gạch, ánh sáng và thiết bị đi kèm. Tại showroom, đội ngũ tư vấn có thể đặt các mẫu cạnh nhau để kiểm tra tông màu, tỷ lệ và ngân sách trước khi lên phương án.","en":"Material samples should be viewed beside stone, tile, lighting and accompanying fixtures. In the showroom, consultants can compare samples for tone, proportion and budget before planning."},"image":"https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424086/showroom/showroom.jpg"}]}'::jsonb, 'Bí quyết chọn gỗ óc chó', 'Bí quyết chọn gỗ óc chó cho nội thất'),
    (v_blog_post_1_id, 'en', 'bi-quyet-chon-go-oc-cho', 'How to choose walnut wood for lasting interiors', 'Understand grain, moisture and finishing process before investing.', '{"takeaways":["Prioritize clear sourcing, stable moisture and drying suitable for Vietnamese climate.","Check grain, color and finishing under both daylight and showroom lighting.","Confirm warranty, surface care and installation conditions before finalizing materials."],"quote":{"vi":"Một món đồ gỗ tốt không chỉ đẹp ở ngày bàn giao; nó phải giữ được nhịp sống của gia đình trong nhiều năm.","en":"A good wooden piece is not only beautiful on handover day; it should keep pace with family life for years."},"sections":[{"id":"nguon-goc","title":{"vi":"Bắt đầu từ nguồn gốc và độ ổn định","en":"Start with sourcing and stability"},"body":{"vi":"Gỗ óc chó cao cấp cần có hồ sơ nguồn gốc, thông tin sấy và kiểm soát độ ẩm rõ ràng. Khi khí hậu thay đổi theo mùa, vật liệu chưa ổn định dễ cong vênh, nứt chân chim hoặc lệch màu sau một thời gian sử dụng.","en":"Premium walnut should come with clear sourcing, drying and moisture control information. When seasonal humidity changes, unstable material can warp, crack or shift color after use."}},{"id":"van-go","title":{"vi":"Đọc vân gỗ như một lớp thiết kế","en":"Read the grain as a design layer"},"body":{"vi":"Vân gỗ đẹp phải có nhịp điệu tự nhiên, không bị ghép vá thiếu chủ đích. Với các bề mặt lớn như bàn, tủ hoặc vách, cách đảo vân và nối tấm quyết định cảm giác cao cấp của toàn bộ không gian.","en":"Beautiful grain has a natural rhythm, not a patched look. On large tables, cabinets or wall panels, grain matching and board joining define the premium feel of the entire space."},"image":"https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424088/showroom/woodWall.png"},{"id":"hoan-thien","title":{"vi":"Bề mặt hoàn thiện phải phục vụ đời sống thật","en":"Finishing must serve real living"},"body":{"vi":"Một lớp hoàn thiện tốt cân bằng giữa cảm giác chạm, độ bền và khả năng bảo trì. Hãy kiểm tra cạnh, góc, mặt sau, ray trượt và những chi tiết ít thấy, vì đó là nơi thể hiện tay nghề và tiêu chuẩn sản xuất.","en":"A good finish balances touch, durability and maintainability. Inspect edges, corners, backs, runners and hidden details because they reveal craft and production standards."}},{"id":"showroom","title":{"vi":"So sánh trực tiếp tại showroom","en":"Compare directly in the showroom"},"body":{"vi":"Mẫu vật liệu cần được xem cạnh đá, gạch, ánh sáng và thiết bị đi kèm. Tại showroom, đội ngũ tư vấn có thể đặt các mẫu cạnh nhau để kiểm tra tông màu, tỷ lệ và ngân sách trước khi lên phương án.","en":"Material samples should be viewed beside stone, tile, lighting and accompanying fixtures. In the showroom, consultants can compare samples for tone, proportion and budget before planning."},"image":"https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424086/showroom/showroom.jpg"}]}'::jsonb, 'How to choose walnut wood', 'How to choose walnut wood for interiors')
  on conflict (post_id, locale) do update set title = excluded.title, slug = excluded.slug, excerpt = excluded.excerpt, body_json = excluded.body_json;

  update public.blog_posts set status = 'published' where id = v_blog_post_1_id;

  -- Blog Post 2: Bathroom Trends
  select id into v_blog_post_2_id
  from public.blog_posts
  where id <> v_blog_post_1_id and deleted_at is null
  order by created_at
  limit 1;

  if v_blog_post_2_id is null then
    insert into public.blog_posts (category_id, author_id, status, featured, published_at, cover_media_id)
    values (v_blog_cat_id, v_author_id, 'draft', false, now() - interval '1 day', v_blog2_media_id)
    returning id into v_blog_post_2_id;
  else
    update public.blog_posts
    set cover_media_id = v_blog2_media_id
    where id = v_blog_post_2_id;
  end if;

  insert into public.blog_post_translations (post_id, locale, slug, title, excerpt, body_json, seo_title, seo_description)
  values
    (v_blog_post_2_id, 'vi', 'xu-huong-phong-tam-2026', 'Xu hướng phòng tắm khách sạn trong nhà ở hiện đại', 'Các lớp vật liệu, ánh sáng và phụ kiện giúp phòng tắm trở thành nghỉ dưỡng.', '{"takeaways":["Phòng tắm cao cấp đang chuyển từ chức năng thuần túy sang trải nghiệm wellness tại nhà.","Ánh sáng, lớp vật liệu và thiết bị tiết kiệm nước quyết định cảm giác sử dụng hằng ngày.","Nên chốt thiết bị chính trước khi hoàn thiện đường nước, điện và bề mặt ốp lát."],"quote":{"vi":"Phòng tắm tốt giống một suite nhỏ: yên tĩnh, dễ chăm sóc và tạo cảm giác nghỉ ngơi mỗi ngày.","en":"A good bathroom feels like a small suite: quiet, easy to maintain and restorative every day."},"sections":[{"id":"wellness","title":{"vi":"Wellness trở thành tiêu chuẩn mới","en":"Wellness becomes the new standard"},"body":{"vi":"Sen tắm nhiệt, bồn tắm độc lập, bề mặt chống bám cặn và ánh sáng dịu đang giúp phòng tắm trở thành không gian hồi phục năng lượng sau ngày dài.","en":"Thermostatic showers, freestanding tubs, anti-scale surfaces and soft lighting are turning bathrooms into places to recover after long days."}},{"id":"vat-lieu","title":{"vi":"Lớp vật liệu tạo chiều sâu","en":"Material layers create depth"},"body":{"vi":"Đá, gạch khổ lớn, gỗ chịu ẩm và kim loại ấm có thể phối cùng nhau nếu kiểm soát đúng tông màu và độ phản chiếu.","en":"Stone, large-format tile, moisture-resistant wood and warm metal can work together when tone and reflectivity are controlled."},"image":"https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424091/showroom/room.jpg"},{"id":"lap-dat","title":{"vi":"Thiết kế kỹ thuật phải đi trước","en":"Technical planning comes first"},"body":{"vi":"Vị trí thoát sàn, chiều cao vòi, áp lực nước và khe co giãn cần được kiểm tra sớm để tránh phát sinh khi lắp đặt.","en":"Floor drains, tap height, water pressure and expansion joints should be checked early to prevent installation issues."}}]}'::jsonb, 'Xu hướng phòng tắm khách sạn', 'Xu hướng phòng tắm khách sạn 2026'),
    (v_blog_post_2_id, 'en', 'xu-huong-phong-tam-2026', 'Hotel-inspired bathroom trends for modern homes', 'Material layers, lighting and accessories that turn bathrooms into wellness spaces.', '{"takeaways":["Premium bathrooms are moving from pure function toward at-home wellness experiences.","Lighting, material layers and water-efficient fixtures define daily comfort.","Confirm key fixtures before finalizing plumbing, electrical and tile surfaces."],"quote":{"vi":"Phòng tắm tốt giống một suite nhỏ: yên tĩnh, dễ chăm sóc và tạo cảm giác nghỉ ngơi mỗi ngày.","en":"A good bathroom feels like a small suite: quiet, easy to maintain and restorative every day."},"sections":[{"id":"wellness","title":{"vi":"Wellness trở thành tiêu chuẩn mới","en":"Wellness becomes the new standard"},"body":{"vi":"Sen tắm nhiệt, bồn tắm độc lập, bề mặt chống bám cặn và ánh sáng dịu đang giúp phòng tắm trở thành không gian hồi phục năng lượng sau ngày dài.","en":"Thermostatic showers, freestanding tubs, anti-scale surfaces and soft lighting are turning bathrooms into places to recover after long days."}},{"id":"vat-lieu","title":{"vi":"Lớp vật liệu tạo chiều sâu","en":"Material layers create depth"},"body":{"vi":"Đá, gạch khổ lớn, gỗ chịu ẩm và kim loại ấm có thể phối cùng nhau nếu kiểm soát đúng tông màu và độ phản chiếu.","en":"Stone, large-format tile, moisture-resistant wood and warm metal can work together when tone and reflectivity are controlled."},"image":"https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424091/showroom/room.jpg"},{"id":"lap-dat","title":{"vi":"Thiết kế kỹ thuật phải đi trước","en":"Technical planning comes first"},"body":{"vi":"Vị trí thoát sàn, chiều cao vòi, áp lực nước và khe co giãn cần được kiểm tra sớm để tránh phát sinh khi lắp đặt.","en":"Floor drains, tap height, water pressure and expansion joints should be checked early to prevent installation issues."}}]}'::jsonb, 'Hotel-inspired bathroom trends', 'Hotel-inspired bathroom trends')
  on conflict (post_id, locale) do update set title = excluded.title, slug = excluded.slug, excerpt = excluded.excerpt, body_json = excluded.body_json;

  update public.blog_posts set status = 'published' where id = v_blog_post_2_id;

  -- Blog Post 3: Tile Wood Stone layout
  select id into v_blog_post_3_id
  from public.blog_posts
  where id not in (v_blog_post_1_id, v_blog_post_2_id) and deleted_at is null
  order by created_at
  limit 1;

  if v_blog_post_3_id is null then
    insert into public.blog_posts (category_id, author_id, status, featured, published_at, cover_media_id)
    values (v_blog_cat_id, v_author_id, 'draft', false, now() - interval '2 days', v_texture_media_id)
    returning id into v_blog_post_3_id;
  else
    update public.blog_posts
    set cover_media_id = v_texture_media_id
    where id = v_blog_post_3_id;
  end if;

  insert into public.blog_post_translations (post_id, locale, slug, title, excerpt, body_json, seo_title, seo_description)
  values
    (v_blog_post_3_id, 'vi', 'phoi-gach-go-va-da', 'Phối gạch, gỗ và đá để không gian có chiều sâu', 'Cách cân bằng bề mặt lạnh và ấm để không gian sang trọng nhưng vẫn gần gũi.', '{"takeaways":["Một bảng vật liệu tốt cần có điểm ấm, điểm lạnh và bề mặt trung hòa để tạo chiều sâu.","Không nên phối quá nhiều vân mạnh trong cùng một trường nhìn.","Ánh sáng quyết định cách gạch, gỗ và đá đọc màu trong không gian thật."],"quote":{"vi":"Sang trọng không đến từ vật liệu đắt nhất, mà từ cách các bề mặt lắng nghe nhau.","en":"Luxury does not come from the most expensive material, but from surfaces that listen to each other."},"sections":[{"id":"bang-vat-lieu","title":{"vi":"Xây bảng vật liệu theo lớp","en":"Build the palette in layers"},"body":{"vi":"Hãy chọn một bề mặt chính, một bề mặt nhấn và một bề mặt nền. Cách phân vai này giúp không gian có chiều sâu mà không bị rối.","en":"Choose one primary surface, one accent surface and one background surface. This hierarchy adds depth without visual noise."}},{"id":"ti-le","title":{"vi":"Tỷ lệ quan trọng hơn số lượng","en":"Proportion matters more than quantity"},"body":{"vi":"Gỗ có thể làm ấm đá, còn gạch sáng giúp cân bằng mảng tối. Điều quan trọng là kiểm soát diện tích từng vật liệu trong trường nhìn chính.","en":"Wood can warm stone, while light tile balances darker planes. The key is controlling how much of each material appears in the main view."},"image":"https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424090/showroom/texture.jpg"},{"id":"anh-sang","title":{"vi":"Kiểm tra dưới ánh sáng thật","en":"Test under real lighting"},"body":{"vi":"Cùng một mẫu đá hoặc gạch có thể đổi sắc dưới ánh sáng vàng, trắng hoặc ánh sáng tự nhiên. Mẫu nên được xem tại nhiều thời điểm trước khi chốt.","en":"The same stone or tile can shift under warm, cool or daylight conditions. Samples should be reviewed at multiple times before approval."}}]}'::jsonb, 'Phối gạch gỗ và đá', 'Phối gạch gỗ và đá'),
    (v_blog_post_3_id, 'en', 'phoi-gach-go-va-da', 'Combining tile, wood and stone for visual depth', 'Balance cool and warm surfaces to keep spaces premium yet welcoming.', '{"takeaways":["A strong material palette needs warmth, coolness and neutral surfaces for depth.","Avoid combining too many strong grains or veins in the same sightline.","Lighting determines how tile, wood and stone read in the real space."],"quote":{"vi":"Sang trọng không đến từ vật liệu đắt nhất, mà từ cách các bề mặt lắng nghe nhau.","en":"Luxury does not come from the most expensive material, but from surfaces that listen to each other."},"sections":[{"id":"bang-vat-lieu","title":{"vi":"Xây bảng vật liệu theo lớp","en":"Build the palette in layers"},"body":{"vi":"Hãy chọn một bề mặt chính, một bề mặt nhấn và một bề mặt nền. Cách phân vai này giúp không gian có chiều sâu mà không bị rối.","en":"Choose one primary surface, one accent surface and one background surface. This hierarchy adds depth without visual noise."}},{"id":"ti-le","title":{"vi":"Tỷ lệ quan trọng hơn số lượng","en":"Proportion matters more than quantity"},"body":{"vi":"Gỗ có thể làm ấm đá, còn gạch sáng giúp cân bằng mảng tối. Điều quan trọng là kiểm soát diện tích từng vật liệu trong trường nhìn chính.","en":"Wood can warm stone, while light tile balances darker planes. The key is controlling how much of each material appears in the main view."},"image":"https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424090/showroom/texture.jpg"},{"id":"anh-sang","title":{"vi":"Kiểm tra dưới ánh sáng thật","en":"Test under real lighting"},"body":{"vi":"Cùng một mẫu đá hoặc gạch có thể đổi sắc dưới ánh sáng vàng, trắng hoặc ánh sáng tự nhiên. Mẫu nên được xem tại nhiều thời điểm trước khi chốt.","en":"The same stone or tile can shift under warm, cool or daylight conditions. Samples should be reviewed at multiple times before approval."}}]}'::jsonb, 'Combining tile wood and stone', 'Combining tile wood and stone')
  on conflict (post_id, locale) do update set title = excluded.title, slug = excluded.slug, excerpt = excluded.excerpt, body_json = excluded.body_json;

  update public.blog_posts set status = 'published' where id = v_blog_post_3_id;

end
$$;

commit;
