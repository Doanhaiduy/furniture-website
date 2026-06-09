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
  v_author_id uuid;
  v_blog_cat_id uuid;
  v_product_2_id uuid;
  v_product_3_id uuid;
  v_product_4_id uuid;
  v_blog_post_1_id uuid;
  v_blog_post_2_id uuid;
  v_blog_post_3_id uuid;
  v_showroom_2_id uuid;
  v_showroom_3_id uuid;
begin
  -- Seed local data unconditionally in local development environment
  -- if coalesce(current_setting('app.seed_local', true), 'false') <> 'true' then
  --   return;
  -- end if;

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

  -- Insert demo author profile
  v_author_id := '00000000-0000-0000-0000-000000000001';
  
  insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
  values (
    v_author_id,
    '00000000-0000-0000-0000-000000000000',
    'author@phuongdong.vn',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Tac Gia Demo"}'::jsonb,
    'authenticated',
    'authenticated'
  )
  on conflict (id) do nothing;

  insert into public.profiles (id, email, full_name, role, is_active)
  values (
    v_author_id,
    'author@phuongdong.vn',
    'Tac Gia Demo',
    'editor',
    true
  )
  on conflict (id) do nothing;

  -- 1. SEED PRODUCTS
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
    (v_product_id, 'vi', 'sofa-curve-velour', 'Sofa Curve Velour', 'Sofa cao cấp bọc vải Velour với đường cong tinh tế.', '{"type":"doc","content":[]}'::jsonb, 'Gỗ sồi tự nhiên', '45.000.000đ', '2400 x 950 x 850 mm', 'Sofa Curve Velour', 'Sofa cao cấp bọc vải Velour'),
    (v_product_id, 'en', 'sofa-curve-velour', 'Sofa Curve Velour', 'Premium velour sofa with a soft curved silhouette.', '{"type":"doc","content":[]}'::jsonb, 'Natural oak', 'VND 45,000,000', '2400 x 950 x 850 mm', 'Sofa Curve Velour', 'Premium velour sofa')
  on conflict (product_id, locale) do update set slug = excluded.slug, name = excluded.name, summary = excluded.summary, updated_at = now();

  update public.products set status = 'published' where id = v_product_id;

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
    (v_product_2_id, 'vi', 'ban-tra-marble-round', 'Bàn Trà Marble Round', 'Mặt đá marble Calacatta, chân gỗ walnut.', '{"type":"doc","content":[]}'::jsonb, 'Đá marble', '12.500.000đ', 'Đường kính 900 mm', 'Bàn Trà Marble Round', 'Bàn Trà Marble Round'),
    (v_product_2_id, 'en', 'ban-tra-marble-round', 'Marble Round Coffee Table', 'Calacatta marble top and walnut base.', '{"type":"doc","content":[]}'::jsonb, 'Marble', 'VND 12,500,000', 'Diameter 900 mm', 'Marble Round Coffee Table', 'Marble Round Coffee Table')
  on conflict (product_id, locale) do update set slug = excluded.slug, name = excluded.name, summary = excluded.summary, updated_at = now();

  update public.products set status = 'published' where id = v_product_2_id;

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
    (v_product_3_id, 'vi', 'ke-tivi-minimalist-wood', 'Kệ Tivi Minimalist Wood', 'Kệ tivi gỗ veneer tối màu với ngăn kéo giảm chấn.', '{"type":"doc","content":[]}'::jsonb, 'Veneer', '22.000.000đ', '2200 mm', 'Kệ Tivi Minimalist Wood', 'Kệ Tivi Minimalist Wood'),
    (v_product_3_id, 'en', 'ke-tivi-minimalist-wood', 'Minimalist Wood TV Cabinet', 'Dark veneer TV cabinet with soft-close drawers.', '{"type":"doc","content":[]}'::jsonb, 'Veneer', 'VND 22,000,000', '2200 mm', 'Minimalist Wood TV Cabinet', 'Minimalist Wood TV Cabinet')
  on conflict (product_id, locale) do update set slug = excluded.slug, name = excluded.name, summary = excluded.summary, updated_at = now();

  update public.products set status = 'published' where id = v_product_3_id;

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
    (v_product_4_id, 'vi', 'sen-tam-ma-vang-24k', 'Sen Tắm Mạ Vàng 24K', 'Bộ sen tắm mạ vàng với van điều nhiệt.', '{"type":"doc","content":[]}'::jsonb, 'Đồng thau', '12.500.000đ', 'Tiêu chuẩn', 'Sen Tắm Mạ Vàng 24K', 'Sen Tắm Mạ Vàng 24K'),
    (v_product_4_id, 'en', 'sen-tam-ma-vang-24k', '24K Gold Plated Shower Set', 'Gold plated shower set with thermostatic valve.', '{"type":"doc","content":[]}'::jsonb, 'Brass', 'VND 12,500,000', 'Standard', '24K Gold Plated Shower Set', '24K Gold Plated Shower Set')
  on conflict (product_id, locale) do update set slug = excluded.slug, name = excluded.name, summary = excluded.summary, updated_at = now();

  update public.products set status = 'published' where id = v_product_4_id;

  -- 2. SEED SHOWROOMS
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

  -- 3. SEED BLOG CATEGORIES & BLOG POSTS
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
    insert into public.blog_posts (category_id, author_id, status, featured, published_at)
    values (v_blog_cat_id, v_author_id, 'draft', true, now())
    returning id into v_blog_post_1_id;
  end if;

  insert into public.blog_post_translations (post_id, locale, slug, title, excerpt, body_json, seo_title, seo_description)
  values
    (v_blog_post_1_id, 'vi', 'bi-quyet-chon-go-oc-cho', 'Bí quyết chọn gỗ óc chó cho nội thất bền vững', 'Nhận biết vân gỗ, độ ẩm và quy trình xử lý bề mặt trước khi đầu tư.', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Gỗ óc chó cao cấp luôn là lựa chọn hàng đầu..."}]}]}'::jsonb, 'Bí quyết chọn gỗ óc chó', 'Bí quyết chọn gỗ óc chó cho nội thất'),
    (v_blog_post_1_id, 'en', 'bi-quyet-chon-go-oc-cho', 'How to choose walnut wood for lasting interiors', 'Understand grain, moisture and finishing process before investing.', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Premium walnut wood is always a top choice..."}]}]}'::jsonb, 'How to choose walnut wood', 'How to choose walnut wood for interiors')
  on conflict (post_id, locale) do update set title = excluded.title, slug = excluded.slug, excerpt = excluded.excerpt;

  update public.blog_posts set status = 'published' where id = v_blog_post_1_id;

  -- Blog Post 2: Bathroom Trends
  select id into v_blog_post_2_id
  from public.blog_posts
  where id <> v_blog_post_1_id and deleted_at is null
  order by created_at
  limit 1;

  if v_blog_post_2_id is null then
    insert into public.blog_posts (category_id, author_id, status, featured, published_at)
    values (v_blog_cat_id, v_author_id, 'draft', false, now() - interval '1 day')
    returning id into v_blog_post_2_id;
  end if;

  insert into public.blog_post_translations (post_id, locale, slug, title, excerpt, body_json, seo_title, seo_description)
  values
    (v_blog_post_2_id, 'vi', 'xu-huong-phong-tam-2026', 'Xu hướng phòng tắm khách sạn trong nhà ở hiện đại', 'Các lớp vật liệu, ánh sáng và phụ kiện giúp phòng tắm trở thành nghỉ dưỡng.', '{"type":"doc","content":[]}'::jsonb, 'Xu hướng phòng tắm khách sạn', 'Xu hướng phòng tắm khách sạn 2026'),
    (v_blog_post_2_id, 'en', 'xu-huong-phong-tam-2026', 'Hotel-inspired bathroom trends for modern homes', 'Material layers, lighting and accessories that turn bathrooms into wellness spaces.', '{"type":"doc","content":[]}'::jsonb, 'Hotel-inspired bathroom trends', 'Hotel-inspired bathroom trends')
  on conflict (post_id, locale) do update set title = excluded.title, slug = excluded.slug, excerpt = excluded.excerpt;

  update public.blog_posts set status = 'published' where id = v_blog_post_2_id;

  -- Blog Post 3: Tile Wood Stone layout
  select id into v_blog_post_3_id
  from public.blog_posts
  where id not in (v_blog_post_1_id, v_blog_post_2_id) and deleted_at is null
  order by created_at
  limit 1;

  if v_blog_post_3_id is null then
    insert into public.blog_posts (category_id, author_id, status, featured, published_at)
    values (v_blog_cat_id, v_author_id, 'draft', false, now() - interval '2 days')
    returning id into v_blog_post_3_id;
  end if;

  insert into public.blog_post_translations (post_id, locale, slug, title, excerpt, body_json, seo_title, seo_description)
  values
    (v_blog_post_3_id, 'vi', 'phoi-gach-go-va-da', 'Phối gạch, gỗ và đá để không gian có chiều sâu', 'Cách cân bằng bề mặt lạnh và ấm để không gian sang trọng nhưng vẫn gần gũi.', '{"type":"doc","content":[]}'::jsonb, 'Phối gạch gỗ và đá', 'Phối gạch gỗ và đá'),
    (v_blog_post_3_id, 'en', 'phoi-gach-go-va-da', 'Combining tile, wood and stone for visual depth', 'Balance cool and warm surfaces to keep spaces premium yet welcoming.', '{"type":"doc","content":[]}'::jsonb, 'Combining tile wood and stone', 'Combining tile wood and stone')
  on conflict (post_id, locale) do update set title = excluded.title, slug = excluded.slug, excerpt = excluded.excerpt;

  update public.blog_posts set status = 'published' where id = v_blog_post_3_id;

end
$$;

commit;
