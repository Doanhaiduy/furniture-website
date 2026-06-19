-- Seed script: Real Production Seed Data
-- Date: 20260618 (Revised)
-- Author: Antigravity
-- Strategy: Bypass triggers by using session_replication_role=replica
--   to allow bulk insertion without translation-first ordering issues.

-- Temporarily disable triggers to allow flexible insert ordering
SET session_replication_role = 'replica';

-- ============================================================================
-- 1. CLEAN EXISTING DATA (in correct order to satisfy foreign keys)
-- ============================================================================
DELETE FROM public.product_promotions;
DELETE FROM public.product_attribute_values;
DELETE FROM public.product_media;
DELETE FROM public.product_translations;
DELETE FROM public.products;
DELETE FROM public.product_category_translations;
DELETE FROM public.product_categories;
DELETE FROM public.brand_translations;
DELETE FROM public.brands;
DELETE FROM public.media_asset_translations;
DELETE FROM public.media_assets WHERE cloudinary_public_id LIKE 'seed/%';

-- ============================================================================
-- 2. SEED MEDIA ASSETS (valid Unsplash URLs, using cloudinary provider for FK bypass)
-- ============================================================================
INSERT INTO public.media_assets (id, storage_provider, cloudinary_public_id, public_url, resource_type, mime_type, format, size_bytes) VALUES
  -- Brand logos (local SVG assets for bulletproof loading)
  ('00000000-0000-0000-0000-000000001001', 'cloudinary', 'seed/logo_kohler',   'http://local-assets/brands/kohler.svg',            'image', 'image/svg+xml', 'svg', 12340),
  ('00000000-0000-0000-0000-000000001002', 'cloudinary', 'seed/logo_grohe',    'http://local-assets/brands/grohe.svg',             'image', 'image/svg+xml', 'svg', 12340),
  ('00000000-0000-0000-0000-000000001003', 'cloudinary', 'seed/logo_toto',     'http://local-assets/brands/toto.svg',              'image', 'image/svg+xml', 'svg', 12340),
  ('00000000-0000-0000-0000-000000001004', 'cloudinary', 'seed/logo_inax',     'http://local-assets/brands/inax.svg',              'image', 'image/svg+xml', 'svg', 12340),
  ('00000000-0000-0000-0000-000000001005', 'cloudinary', 'seed/logo_american', 'http://local-assets/brands/american-standard.svg', 'image', 'image/svg+xml', 'svg', 12340),
  ('00000000-0000-0000-0000-000000001006', 'cloudinary', 'seed/logo_bravat',   'http://local-assets/brands/bravat.svg',            'image', 'image/svg+xml', 'svg', 12340),
  ('00000000-0000-0000-0000-000000001007', 'cloudinary', 'seed/logo_hafele',   'http://local-assets/brands/hafele.svg',            'image', 'image/svg+xml', 'svg', 12340),
  ('00000000-0000-0000-0000-000000001000', 'cloudinary', 'seed/logo_site',     'http://local-assets/logo-final.svg',               'image', 'image/svg+xml', 'svg', 29612),

  -- Wooden furniture product images
  ('00000000-0000-0000-0000-000000000011', 'cloudinary', 'seed/prod_sofa1',    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80', 'image', 'image/jpeg', 'jpg', 123450),
  ('00000000-0000-0000-0000-000000000012', 'cloudinary', 'seed/prod_sofa2',    'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=800&q=80', 'image', 'image/jpeg', 'jpg', 123450),
  ('00000000-0000-0000-0000-000000000013', 'cloudinary', 'seed/prod_table',    'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80', 'image', 'image/jpeg', 'jpg', 123450),
  ('00000000-0000-0000-0000-000000000014', 'cloudinary', 'seed/prod_cabinet',  'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80', 'image', 'image/jpeg', 'jpg', 123450),
  ('00000000-0000-0000-0000-000000000015', 'cloudinary', 'seed/prod_dining',   'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80', 'image', 'image/jpeg', 'jpg', 123450),
  ('00000000-0000-0000-0000-000000000016', 'cloudinary', 'seed/prod_chair',    'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=800&q=80', 'image', 'image/jpeg', 'jpg', 123450),
  ('00000000-0000-0000-0000-000000000017', 'cloudinary', 'seed/prod_bed',      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80', 'image', 'image/jpeg', 'jpg', 123450),
  ('00000000-0000-0000-0000-000000000018', 'cloudinary', 'seed/prod_wardrobe', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80', 'image', 'image/jpeg', 'jpg', 123450),

  -- Sanitary equipment product images
  ('00000000-0000-0000-0000-000000000021', 'cloudinary', 'seed/prod_bathtub',  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', 'image', 'image/jpeg', 'jpg', 123450),
  ('00000000-0000-0000-0000-000000000022', 'cloudinary', 'seed/prod_toilet',   'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80', 'image', 'image/jpeg', 'jpg', 123450),
  ('00000000-0000-0000-0000-000000000023', 'cloudinary', 'seed/prod_basin',    'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=800&q=80', 'image', 'image/jpeg', 'jpg', 123450),
  ('00000000-0000-0000-0000-000000000024', 'cloudinary', 'seed/prod_shower',   'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80', 'image', 'image/jpeg', 'jpg', 123450),
  ('00000000-0000-0000-0000-000000000025', 'cloudinary', 'seed/prod_faucet',   'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=800&q=80', 'image', 'image/jpeg', 'jpg', 123450),

  -- Tile product images
  ('00000000-0000-0000-0000-000000000031', 'cloudinary', 'seed/prod_floor',    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', 'image', 'image/jpeg', 'jpg', 123450),
  ('00000000-0000-0000-0000-000000000032', 'cloudinary', 'seed/prod_wall',     'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=800&q=80', 'image', 'image/jpeg', 'jpg', 123450);

-- Media translations (alt texts for accessibility & SEO)
INSERT INTO public.media_asset_translations (media_id, locale, alt_text, caption) VALUES
  ('00000000-0000-0000-0000-000000000011', 'vi', 'Sofa cao cấp phòng khách hiện đại', 'Sofa bọc nỉ óc chó'),
  ('00000000-0000-0000-0000-000000000011', 'en', 'Premium living room sofa', 'Velour upholstered sofa'),
  ('00000000-0000-0000-0000-000000000023', 'vi', 'Lavabo chậu rửa hiện đại Kohler', 'Chậu rửa đặt bàn sứ nano'),
  ('00000000-0000-0000-0000-000000000023', 'en', 'Modern Kohler vessel sink', 'Countertop nano ceramic washbasin');

-- ============================================================================
-- 3. SEED BRANDS
-- ============================================================================
INSERT INTO public.brands (id, slug, logo_media_id, origin, status, sort_order) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'kohler',           '00000000-0000-0000-0000-000000001001', 'USA',     'published', 1),
  ('b0000000-0000-0000-0000-000000000002', 'grohe',            '00000000-0000-0000-0000-000000001002', 'Germany', 'published', 2),
  ('b0000000-0000-0000-0000-000000000003', 'toto',             '00000000-0000-0000-0000-000000001003', 'Japan',   'published', 3),
  ('b0000000-0000-0000-0000-000000000004', 'inax',             '00000000-0000-0000-0000-000000001004', 'Japan',   'published', 4),
  ('b0000000-0000-0000-0000-000000000005', 'american-standard','00000000-0000-0000-0000-000000001005', 'USA',     'published', 5),
  ('b0000000-0000-0000-0000-000000000006', 'bravat',           '00000000-0000-0000-0000-000000001006', 'Germany', 'published', 6),
  ('b0000000-0000-0000-0000-000000000007', 'hafele',           '00000000-0000-0000-0000-000000001007', 'Germany', 'published', 7);

INSERT INTO public.brand_translations (brand_id, locale, name, description) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'vi', 'KOHLER',           'Thương hiệu thiết bị vệ sinh cao cấp Mỹ, hơn 145 năm kinh nghiệm.'),
  ('b0000000-0000-0000-0000-000000000001', 'en', 'KOHLER',           'Premium American sanitary ware brand with over 145 years of experience.'),
  ('b0000000-0000-0000-0000-000000000002', 'vi', 'GROHE',            'Sen vòi và thiết bị phòng tắm cao cấp Đức. Kỹ thuật Đức - Chất lượng vượt trội.'),
  ('b0000000-0000-0000-0000-000000000002', 'en', 'GROHE',            'Premium German sanitary fittings. German engineering - superior quality.'),
  ('b0000000-0000-0000-0000-000000000003', 'vi', 'TOTO',             'Thương hiệu thiết bị phòng tắm hàng đầu Nhật Bản với công nghệ tiên tiến.'),
  ('b0000000-0000-0000-0000-000000000003', 'en', 'TOTO',             'Japan''s leading bathroom equipment brand with advanced technology.'),
  ('b0000000-0000-0000-0000-000000000004', 'vi', 'INAX',             'Giải pháp phòng tắm thông minh và gạch kiến trúc Nhật Bản chất lượng cao.'),
  ('b0000000-0000-0000-0000-000000000004', 'en', 'INAX',             'Japanese smart bathroom solutions and high-quality architectural tiles.'),
  ('b0000000-0000-0000-0000-000000000005', 'vi', 'AMERICAN STANDARD','Thiết bị vệ sinh mang phong cách sống hiện đại Mỹ, bền đẹp tinh tế.'),
  ('b0000000-0000-0000-0000-000000000005', 'en', 'AMERICAN STANDARD','American-style sanitary fixtures representing modern, elegant living.'),
  ('b0000000-0000-0000-0000-000000000006', 'vi', 'BRAVAT',           'Thiết bị phòng tắm cao cấp phong cách Đức, thiết kế sang trọng hiện đại.'),
  ('b0000000-0000-0000-0000-000000000006', 'en', 'BRAVAT',           'German luxury bathroom collections, elegant modern design.'),
  ('b0000000-0000-0000-0000-000000000007', 'vi', 'HÄFELE',           'Phụ kiện bếp, tay nắm và phần cứng nội thất cao cấp đến từ Đức.'),
  ('b0000000-0000-0000-0000-000000000007', 'en', 'HÄFELE',           'Premium German kitchen fittings, handles, and interior hardware.');

-- ============================================================================
-- 3.5 SEED SITE SETTINGS
-- ============================================================================
DELETE FROM public.site_setting_translations;
DELETE FROM public.site_settings;

INSERT INTO public.site_settings (
  id,
  singleton_key,
  contact_phone,
  contact_email,
  quote_sender_email,
  logo_media_id,
  favicon_media_id,
  default_og_image_media_id
) VALUES (
  '90b08a64-69e3-4d7c-ab12-cd6690b542ca',
  'default',
  '08172 357 587',
  'contact@phuongdong.vn',
  'quotes@phuongdong.vn',
  '00000000-0000-0000-0000-000000001000', -- site logo
  '00000000-0000-0000-0000-000000001000', -- favicon
  '00000000-0000-0000-0000-000000000011'  -- default og image (Sofa)
) ON CONFLICT (singleton_key) DO UPDATE SET
  contact_phone = EXCLUDED.contact_phone,
  contact_email = EXCLUDED.contact_email,
  logo_media_id = EXCLUDED.logo_media_id,
  favicon_media_id = EXCLUDED.favicon_media_id,
  default_og_image_media_id = EXCLUDED.default_og_image_media_id;

INSERT INTO public.site_setting_translations (
  site_settings_id,
  locale,
  brand_name,
  contact_address,
  seo_default_title,
  seo_default_description
) VALUES
  (
    '90b08a64-69e3-4d7c-ab12-cd6690b542ca',
    'vi',
    'Showroom Nội Thất Phương Đông',
    '124 Nguyễn Thị Thập, Quận 7, TP. Hồ Chí Minh',
    'Đồ Gỗ Nội Thất & Thiết Bị Vệ Sinh Phương Đông',
    'Showroom Phương Đông chuyên cung cấp đồ gỗ nội thất tự nhiên cao cấp và thiết bị vệ sinh nhập khẩu chính hãng.'
  ),
  (
    '90b08a64-69e3-4d7c-ab12-cd6690b542ca',
    'en',
    'Phuong Dong Interior Showroom',
    '124 Nguyen Thi Thap, District 7, Ho Chi Minh City',
    'Phuong Dong - Premium Furniture & Sanitary Ware',
    'Phuong Dong Showroom specializes in premium solid natural wood furniture and genuine imported sanitary ware.'
  )
ON CONFLICT (site_settings_id, locale) DO UPDATE SET
  brand_name = EXCLUDED.brand_name,
  contact_address = EXCLUDED.contact_address,
  seo_default_title = EXCLUDED.seo_default_title,
  seo_default_description = EXCLUDED.seo_default_description;

-- ============================================================================
-- 4. SEED PRODUCT CATEGORIES (as draft first, then add translations, then publish)
-- ============================================================================

-- ---- ROOT CATEGORIES ----
INSERT INTO public.product_categories (id, parent_id, group_key, status, sort_order, image_media_id) VALUES
  ('a4fa9181-2c31-4f76-bd60-fb5a195075bf', NULL, 'wooden_furniture',  'draft', 1, '00000000-0000-0000-0000-000000000011'),
  ('a0c8312c-f869-4317-807c-af42d32c2239', NULL, 'sanitary_equipment','draft', 2, '00000000-0000-0000-0000-000000000021'),
  ('a1111111-1111-1111-1111-111111111111', NULL, 'tiles',             'draft', 3, '00000000-0000-0000-0000-000000000031');

-- Subcategories for Wooden Furniture
INSERT INTO public.product_categories (id, parent_id, group_key, status, sort_order, image_media_id) VALUES
  ('c0000000-0000-0000-0000-000000000011', 'a4fa9181-2c31-4f76-bd60-fb5a195075bf', 'wooden_furniture', 'draft', 1, '00000000-0000-0000-0000-000000000011'),
  ('c0000000-0000-0000-0000-000000000012', 'a4fa9181-2c31-4f76-bd60-fb5a195075bf', 'wooden_furniture', 'draft', 2, '00000000-0000-0000-0000-000000000013'),
  ('c0000000-0000-0000-0000-000000000013', 'a4fa9181-2c31-4f76-bd60-fb5a195075bf', 'wooden_furniture', 'draft', 3, '00000000-0000-0000-0000-000000000014'),
  ('c0000000-0000-0000-0000-000000000014', 'a4fa9181-2c31-4f76-bd60-fb5a195075bf', 'wooden_furniture', 'draft', 4, '00000000-0000-0000-0000-000000000015'),
  ('c0000000-0000-0000-0000-000000000015', 'a4fa9181-2c31-4f76-bd60-fb5a195075bf', 'wooden_furniture', 'draft', 5, '00000000-0000-0000-0000-000000000016'),
  ('c0000000-0000-0000-0000-000000000016', 'a4fa9181-2c31-4f76-bd60-fb5a195075bf', 'wooden_furniture', 'draft', 6, '00000000-0000-0000-0000-000000000017'),
  ('c0000000-0000-0000-0000-000000000017', 'a4fa9181-2c31-4f76-bd60-fb5a195075bf', 'wooden_furniture', 'draft', 7, '00000000-0000-0000-0000-000000000018');

-- Subcategories for Sanitary Equipment
INSERT INTO public.product_categories (id, parent_id, group_key, status, sort_order, image_media_id) VALUES
  ('c0000000-0000-0000-0000-000000000021', 'a0c8312c-f869-4317-807c-af42d32c2239', 'sanitary_equipment', 'draft', 1, '00000000-0000-0000-0000-000000000021'),
  ('c0000000-0000-0000-0000-000000000022', 'a0c8312c-f869-4317-807c-af42d32c2239', 'sanitary_equipment', 'draft', 2, '00000000-0000-0000-0000-000000000022'),
  ('c0000000-0000-0000-0000-000000000023', 'a0c8312c-f869-4317-807c-af42d32c2239', 'sanitary_equipment', 'draft', 3, '00000000-0000-0000-0000-000000000023'),
  ('c0000000-0000-0000-0000-000000000024', 'a0c8312c-f869-4317-807c-af42d32c2239', 'sanitary_equipment', 'draft', 4, '00000000-0000-0000-0000-000000000024'),
  ('c0000000-0000-0000-0000-000000000025', 'a0c8312c-f869-4317-807c-af42d32c2239', 'sanitary_equipment', 'draft', 5, '00000000-0000-0000-0000-000000000025');

-- Subcategories for Tiles
INSERT INTO public.product_categories (id, parent_id, group_key, status, sort_order, image_media_id) VALUES
  ('c0000000-0000-0000-0000-000000000031', 'a1111111-1111-1111-1111-111111111111', 'tiles', 'draft', 1, '00000000-0000-0000-0000-000000000031'),
  ('c0000000-0000-0000-0000-000000000032', 'a1111111-1111-1111-1111-111111111111', 'tiles', 'draft', 2, '00000000-0000-0000-0000-000000000032');

-- ---- CATEGORY TRANSLATIONS ----
INSERT INTO public.product_category_translations (category_id, locale, slug, name, description) VALUES
  -- Root: Wooden Furniture
  ('a4fa9181-2c31-4f76-bd60-fb5a195075bf', 'vi', 'do-go-noi-that',  'Đồ gỗ nội thất',   'Đồ gỗ óc chó Bắc Mỹ FAS cao cấp, thủ công tinh xảo.'),
  ('a4fa9181-2c31-4f76-bd60-fb5a195075bf', 'en', 'wooden-furniture','Wooden Furniture',  'FAS North American Walnut luxury handcrafted furniture.'),
  -- Root: Sanitary Equipment
  ('a0c8312c-f869-4317-807c-af42d32c2239', 'vi', 'thiet-bi-ve-sinh',  'Thiết bị vệ sinh',   'Thiết bị phòng tắm nhập khẩu Châu Âu và Nhật Bản chính hãng.'),
  ('a0c8312c-f869-4317-807c-af42d32c2239', 'en', 'sanitary-equipment','Sanitary Equipment', 'Authentic imported luxury bathroom sanitary ware from Europe & Japan.'),
  -- Root: Tiles
  ('a1111111-1111-1111-1111-111111111111', 'vi', 'gach-op-lat','Gạch ốp lát', 'Gạch porcelain vân đá nhập khẩu Tây Ban Nha và Ý.'),
  ('a1111111-1111-1111-1111-111111111111', 'en', 'tiles',      'Tiles',       'Imported Spanish and Italian stone-look porcelain tiles.'),

  -- Wooden Furniture subcategories
  ('c0000000-0000-0000-0000-000000000011', 'vi', 'sofa',         'Sofa cao cấp',          'Các dòng sofa da bò Ý, sofa nỉ cao cấp với khung gỗ tự nhiên.'),
  ('c0000000-0000-0000-0000-000000000011', 'en', 'sofa',         'Premium Sofas',          'Italian leather and premium fabric sofas with natural wood frames.'),
  ('c0000000-0000-0000-0000-000000000012', 'vi', 'coffee-table', 'Bàn trà nghệ thuật',     'Bàn trà mặt đá cẩm thạch, chân gỗ óc chó thủ công.'),
  ('c0000000-0000-0000-0000-000000000012', 'en', 'coffee-table', 'Artistic Coffee Tables', 'Marble-top or walnut coffee tables, handcrafted.'),
  ('c0000000-0000-0000-0000-000000000013', 'vi', 'tv-cabinet',   'Kệ tivi & Tủ trang trí','Kệ tivi thiết kế tối giản, ngăn kéo giảm chấn Blum.'),
  ('c0000000-0000-0000-0000-000000000013', 'en', 'tv-cabinet',   'TV Cabinets & Sideboards','Minimalist TV stands with Blum soft-close cabinetry.'),
  ('c0000000-0000-0000-0000-000000000014', 'vi', 'dining-table', 'Bàn ăn gia đình',        'Bàn ăn gỗ tự nhiên nguyên tấm live edge sang trọng.'),
  ('c0000000-0000-0000-0000-000000000014', 'en', 'dining-table', 'Dining Tables',           'Luxury solid wood live edge dining tables.'),
  ('c0000000-0000-0000-0000-000000000015', 'vi', 'chair',        'Ghế ăn & Ghế thư giãn', 'Ghế gỗ tự nhiên bọc da bò thật hoặc vải cao cấp.'),
  ('c0000000-0000-0000-0000-000000000015', 'en', 'chair',        'Chairs & Armchairs',     'Natural wood chairs upholstered in genuine leather or premium fabric.'),
  ('c0000000-0000-0000-0000-000000000016', 'vi', 'bed',          'Giường ngủ sang trọng', 'Giường ngủ bọc vải nỉ nhung êm ái, khung gỗ chắc chắn.'),
  ('c0000000-0000-0000-0000-000000000016', 'en', 'bed',          'Luxury Beds',            'Solid wood beds with premium velvet fabric upholstery.'),
  ('c0000000-0000-0000-0000-000000000017', 'vi', 'wardrobe',     'Tủ quần áo thông minh', 'Tủ quần áo gỗ kịch trần, thiết kế âm tường sang trọng.'),
  ('c0000000-0000-0000-0000-000000000017', 'en', 'wardrobe',     'Smart Wardrobes',        'Walnut floor-to-ceiling built-in wardrobes.'),

  -- Sanitary Equipment subcategories
  ('c0000000-0000-0000-0000-000000000021', 'vi', 'bathtub', 'Bồn tắm độc lập',    'Bồn tắm acrylic và Solid Surface giữ nhiệt cao cấp.'),
  ('c0000000-0000-0000-0000-000000000021', 'en', 'bathtub', 'Freestanding Bathtubs','Premium acrylic and Solid Surface heat-retaining bathtubs.'),
  ('c0000000-0000-0000-0000-000000000022', 'vi', 'toilet',  'Bồn cầu thông minh',  'Bồn cầu điện tử tích hợp sấy sưởi, xịt rửa tự động.'),
  ('c0000000-0000-0000-0000-000000000022', 'en', 'toilet',  'Smart Toilets',        'Intelligent electronic toilets with auto flush and warm seat.'),
  ('c0000000-0000-0000-0000-000000000023', 'vi', 'basin',   'Lavabo & Chậu rửa mặt','Lavabo sứ tráng men nano chống bám bẩn, thiết kế hiện đại.'),
  ('c0000000-0000-0000-0000-000000000023', 'en', 'basin',   'Basins & Sinks',        'Nano-glazed ceramic washbasins with modern minimalist design.'),
  ('c0000000-0000-0000-0000-000000000024', 'vi', 'shower',  'Sen tắm nhiệt độ',    'Sen tắm khóa nhiệt độ chống bỏng, mạ vàng 24K hoặc chrome.'),
  ('c0000000-0000-0000-0000-000000000024', 'en', 'shower',  'Thermostatic Showers', 'Concealed thermostatic shower sets in 24K gold or chrome.'),
  ('c0000000-0000-0000-0000-000000000025', 'vi', 'faucet',  'Vòi chậu lavabo',      'Vòi lavabo đồng thau mạ chrome hoặc đen mờ phong cách Châu Âu.'),
  ('c0000000-0000-0000-0000-000000000025', 'en', 'faucet',  'Basin Faucets',         'Brass basin faucets in chrome or matte black finish.'),

  -- Tiles subcategories
  ('c0000000-0000-0000-0000-000000000031', 'vi', 'floor', 'Gạch lát nền',  'Gạch porcelain vân đá cẩm thạch khổ lớn 80x160cm đến 120x240cm.'),
  ('c0000000-0000-0000-0000-000000000031', 'en', 'floor', 'Floor Tiles',   'Large format stone-look porcelain floor tiles 80x160 to 120x240cm.'),
  ('c0000000-0000-0000-0000-000000000032', 'vi', 'wall',  'Gạch ốp tường', 'Gạch mosaic trang trí nghệ thuật và gạch giả cổ ốp tường.'),
  ('c0000000-0000-0000-0000-000000000032', 'en', 'wall',  'Wall Tiles',    'Decorative mosaic and vintage-style wall tiles.');

-- ---- NOW PUBLISH ALL CATEGORIES ----
UPDATE public.product_categories SET status = 'published', published_at = NOW()
WHERE id IN (
  'a4fa9181-2c31-4f76-bd60-fb5a195075bf',
  'a0c8312c-f869-4317-807c-af42d32c2239',
  'a1111111-1111-1111-1111-111111111111',
  'c0000000-0000-0000-0000-000000000011',
  'c0000000-0000-0000-0000-000000000012',
  'c0000000-0000-0000-0000-000000000013',
  'c0000000-0000-0000-0000-000000000014',
  'c0000000-0000-0000-0000-000000000015',
  'c0000000-0000-0000-0000-000000000016',
  'c0000000-0000-0000-0000-000000000017',
  'c0000000-0000-0000-0000-000000000021',
  'c0000000-0000-0000-0000-000000000022',
  'c0000000-0000-0000-0000-000000000023',
  'c0000000-0000-0000-0000-000000000024',
  'c0000000-0000-0000-0000-000000000025',
  'c0000000-0000-0000-0000-000000000031',
  'c0000000-0000-0000-0000-000000000032'
);

-- ============================================================================
-- 5. SEED PROMOTIONS (before products, as products reference them)
-- ============================================================================
DELETE FROM public.product_promotions WHERE promotion_id IN ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333');
DELETE FROM public.promotion_translations WHERE promotion_id IN ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333');
DELETE FROM public.promotions WHERE id IN ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333');
DELETE FROM public.promotions WHERE code IN ('SUMMER-SALE-2026', 'WELLNESS-BATH-SET', 'FINISHING-TILES-DEAL');

INSERT INTO public.promotions (id, code, discount_percentage, status, start_at, end_at, cover_media_id, combo_price, original_price, metadata_jsonb) VALUES
  (
    '11111111-1111-1111-1111-111111111111', 
    'SUMMER-SALE-2026', 
    20.00, 
    'published', 
    '2026-06-01 00:00:00+07', 
    '2026-08-31 23:59:59+07',
    '00000000-0000-0000-0000-000000000011', -- Sofa Curve Velour
    63600000.00,
    79500000.00,
    '{
      "tag_vi": "Chương Trình Ưu Đãi",
      "tag_en": "Special Offer",
      "color": "from-amber-500/20 to-orange-500/5",
      "badgeColor": "bg-amber-500 text-black",
      "period_vi": "Áp dụng đến 31/08/2026",
      "period_en": "Valid until August 31, 2026",
      "items_vi": [
        "Sofa Curve Velour bọc nỉ cao cấp",
        "Bàn trà Marble Calacatta Gold nghệ thuật",
        "Kệ Tivi Nordic gỗ sồi tự nhiên thanh lịch"
      ],
      "items_en": [
        "Premium Velour Sofa Curve",
        "Artistic Marble Calacatta Gold Coffee Table",
        "Elegant Nordic Natural Oak TV Console"
      ]
    }'::jsonb
  ),
  (
    '22222222-2222-2222-2222-222222222222', 
    'WELLNESS-BATH-SET', 
    15.00, 
    'published', 
    '2026-06-01 00:00:00+07', 
    '2026-09-30 23:59:59+07',
    '00000000-0000-0000-0000-000000000021', -- Bathtub
    35700000.00,
    42000000.00,
    '{
      "tag_vi": "Chương Trình Sức Khỏe",
      "tag_en": "Wellness Offer",
      "color": "from-emerald-500/20 to-teal-500/5",
      "badgeColor": "bg-emerald-500 text-white",
      "period_vi": "Áp dụng đến 30/09/2026",
      "period_en": "Valid until September 30, 2026",
      "items_vi": [
        "Bồn tắm độc lập acrylic giữ nhiệt cao cấp",
        "Sen tắm khóa nhiệt độ chống bỏng an toàn",
        "Lavabo chậu rửa sứ tráng men nano sáng bóng"
      ],
      "items_en": [
        "Premium Freestanding Acrylic Bathtub",
        "Safe Thermostatic Anti-scald Shower Column",
        "Nano-glazed Ceramic Washbasin Bowl"
      ]
    }'::jsonb
  ),
  (
    '33333333-3333-3333-3333-333333333333', 
    'FINISHING-TILES-DEAL', 
    10.00, 
    'published', 
    '2026-06-01 00:00:00+07', 
    '2026-12-31 23:59:59+07',
    '00000000-0000-0000-0000-000000000031', -- Tiles
    1350000.00,
    1500000.00,
    '{
      "tag_vi": "Ưu Đãi Hoàn Thiện",
      "tag_en": "Finishing Deal",
      "color": "from-blue-500/20 to-indigo-500/5",
      "badgeColor": "bg-blue-600 text-white",
      "period_vi": "Áp dụng đến 31/12/2026",
      "period_en": "Valid until December 31, 2026",
      "items_vi": [
        "Gạch Calacatta Marble khổ lớn 80x160cm đến 120x240cm",
        "Xương gạch Porcelain siêu bền, chống trầy xước",
        "Tặng thiết kế bản vẽ phối cảnh 3D phòng tắm miễn phí"
      ],
      "items_en": [
        "Large format Calacatta Marble tiles 80x160 to 120x240cm",
        "Heavy-duty scratch-resistant full-body porcelain",
        "Complimentary 3D bathroom visualization design"
      ]
    }'::jsonb
  );

INSERT INTO public.promotion_translations (promotion_id, locale, title, description) VALUES
  (
    '11111111-1111-1111-1111-111111111111', 
    'vi', 
    'Không Gian Phòng Khách Walnut Heritage', 
    'Tinh tuyển gỗ óc chó tự nhiên cho căn hộ cao cấp'
  ),
  (
    '11111111-1111-1111-1111-111111111111', 
    'en', 
    'Heritage Walnut Living Room Package', 
    'Curated natural walnut for premium apartments'
  ),
  (
    '22222222-2222-2222-2222-222222222222', 
    'vi', 
    'Bộ Thiết Bị Phòng Tắm Wellness Luxury', 
    'Nâng tầm phong cách sống với bồn tắm độc lập và sen khóa nhiệt'
  ),
  (
    '22222222-2222-2222-2222-222222222222', 
    'en', 
    'Wellness Luxury Bathroom Suite', 
    'Elevate your lifestyle with freestanding tub and thermostatic shower'
  ),
  (
    '33333333-3333-3333-3333-333333333333', 
    'vi', 
    'Gói Gạch Ốp Lát Luxury Calacatta', 
    'Gạch porcelain vân đá cẩm thạch nhập khẩu cao cấp'
  ),
  (
    '33333333-3333-3333-3333-333333333333', 
    'en', 
    'Luxury Calacatta Tile Deal', 
    'Premium imported stone-look porcelain tiles'
  );

-- ============================================================================
-- 6. SEED PRODUCTS (as draft, then publish)
-- ============================================================================

-- WOODEN FURNITURE PRODUCTS --

-- P01: Sofa Curve Velour (Sofa category)
INSERT INTO public.products (id, category_id, brand_id, reference_code, status, price_min, price_max, currency, brand_series, featured, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000007',
   'PD-S2401', 'draft', 45000000, 45000000, 'VND', 'Heritage Collection', true, 1);
INSERT INTO public.product_translations (product_id, locale, slug, name, summary, description_json, material, price_display_text, dimension_display_text) VALUES
  ('00000001-0000-0000-0000-000000000011', 'vi', 'sofa-curve-velour-heritage',
   'Sofa Curve Velour Heritage', 'Sofa gỗ óc chó khung nguyên tấm, bọc nỉ velour nhập khẩu Bỉ cao cấp với đường chỉ thủ công tinh tế.',
   '{"vi":"Sofa Heritage Curve Velour được thiết kế theo phong cách Bắc Âu hiện đại. Khung gỗ óc chó tự nhiên nguyên tấm vững chắc. Mặt nỉ velour nhập khẩu Bỉ mềm mịn, chống nhàu vượt trội.","en":"Heritage Curve Velour sofa in modern Scandinavian style. Solid walnut wood frame. Premium Belgian velour fabric, wrinkle-resistant."}'::jsonb,
   'Khung gỗ óc chó Bắc Mỹ, Nỉ Velour Bỉ', '45,000,000 VND', '2400 x 950 x 830 mm'),
  ('00000001-0000-0000-0000-000000000011', 'en', 'sofa-curve-velour-heritage',
   'Heritage Curve Velour Sofa', 'Solid walnut frame sofa upholstered in premium imported Belgian velour with handcrafted stitching.',
   '{"vi":"Sofa Heritage Curve Velour được thiết kế theo phong cách Bắc Âu hiện đại. Khung gỗ óc chó tự nhiên nguyên tấm vững chắc. Mặt nỉ velour nhập khẩu Bỉ mềm mịn, chống nhàu vượt trội.","en":"Heritage Curve Velour sofa in modern Scandinavian style. Solid walnut wood frame. Premium Belgian velour fabric, wrinkle-resistant."}'::jsonb,
   'North American Walnut Frame, Belgian Velour', '45,000,000 VND', '2400 x 950 x 830 mm');
INSERT INTO public.product_media (product_id, media_id, context, is_primary, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000011', 'gallery', true, 1),
  ('00000001-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000012', 'gallery', false, 2);

-- P02: Sofa da bò Ý 3 chỗ (Sofa category)
INSERT INTO public.products (id, category_id, brand_id, reference_code, status, price_min, price_max, currency, brand_series, featured, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000011', NULL,
   'PD-S2402', 'draft', 62000000, 62000000, 'VND', 'Atelier Leather', false, 2);
INSERT INTO public.product_translations (product_id, locale, slug, name, summary, description_json, material, price_display_text, dimension_display_text) VALUES
  ('00000001-0000-0000-0000-000000000012', 'vi', 'sofa-da-bo-y-3-cho',
   'Sofa Da Bò Ý 3 Chỗ Ngồi', 'Sofa 3 chỗ bọc da bò Ý full aniline màu cognac ấm áp, chân inox mờ tinh tế.',
   '{"vi":"Bọc toàn bộ bằng da bò ý full aniline mềm mịn và thấm hút tự nhiên. Lõi mút Polyurethane 35kg/m³ chuẩn cao cấp. Chân kim loại chrome.","en":"Fully upholstered in soft Italian full-aniline leather. High-density polyurethane foam cushioning. Chrome metal legs."}'::jsonb,
   'Da bò Ý full aniline, Khung gỗ sồi', '62,000,000 VND', '2200 x 900 x 790 mm'),
  ('00000001-0000-0000-0000-000000000012', 'en', 'sofa-da-bo-y-3-cho',
   'Italian Aniline Leather 3-Seater Sofa', '3-seater sofa fully upholstered in warm cognac Italian full-aniline leather with matte chrome legs.',
   '{"vi":"Bọc toàn bộ bằng da bò ý full aniline mềm mịn và thấm hút tự nhiên. Lõi mút Polyurethane 35kg/m³ chuẩn cao cấp. Chân kim loại chrome.","en":"Fully upholstered in soft Italian full-aniline leather. High-density polyurethane foam cushioning. Chrome metal legs."}'::jsonb,
   'Italian Full-aniline Leather, Oak Frame', '62,000,000 VND', '2200 x 900 x 790 mm');
INSERT INTO public.product_media (product_id, media_id, context, is_primary, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000012', 'gallery', true, 1);

-- P03: Bàn trà Marble (Coffee Table)
INSERT INTO public.products (id, category_id, brand_id, reference_code, status, price_min, price_max, currency, brand_series, featured, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000012', NULL,
   'PD-CT2401', 'draft', 18500000, 18500000, 'VND', 'Marble Atelier', false, 3);
INSERT INTO public.product_translations (product_id, locale, slug, name, summary, description_json, material, price_display_text, dimension_display_text) VALUES
  ('00000001-0000-0000-0000-000000000013', 'vi', 'ban-tra-da-marble-calacatta',
   'Bàn Trà Đá Marble Calacatta Gold', 'Bàn trà mặt đá Calacatta Gold nhập khẩu Ý, chân gỗ óc chó tự nhiên hình chữ Y nghệ thuật.',
   '{"vi":"Mặt bàn đá marble Calacatta Gold nguyên tấm nhập khẩu từ Ý, vân đá vàng tự nhiên độc nhất. Chân gỗ óc chó tự nhiên tạo hình thủ công.","en":"Full Calacatta Gold marble tabletop imported from Italy, unique natural golden veins. Hand-shaped solid walnut legs."}'::jsonb,
   'Đá Calacatta Gold Ý, Gỗ óc chó Bắc Mỹ', '18,500,000 VND', '1200 x 600 x 420 mm'),
  ('00000001-0000-0000-0000-000000000013', 'en', 'ban-tra-da-marble-calacatta',
   'Calacatta Gold Marble Coffee Table', 'Italian Calacatta Gold marble-top coffee table with artistic Y-shaped solid walnut legs.',
   '{"vi":"Mặt bàn đá marble Calacatta Gold nguyên tấm nhập khẩu từ Ý, vân đá vàng tự nhiên độc nhất. Chân gỗ óc chó tự nhiên tạo hình thủ công.","en":"Full Calacatta Gold marble tabletop imported from Italy, unique natural golden veins. Hand-shaped solid walnut legs."}'::jsonb,
   'Italian Calacatta Gold Marble, Walnut', '18,500,000 VND', '1200 x 600 x 420 mm');
INSERT INTO public.product_media (product_id, media_id, context, is_primary, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000013', 'gallery', true, 1);

-- P04: Kệ Tivi (TV Cabinet)
INSERT INTO public.products (id, category_id, brand_id, reference_code, status, price_min, price_max, currency, brand_series, featured, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000007',
   'PD-TV2401', 'draft', 24000000, 24000000, 'VND', 'Nordic Living', false, 4);
INSERT INTO public.product_translations (product_id, locale, slug, name, summary, description_json, material, price_display_text, dimension_display_text) VALUES
  ('00000001-0000-0000-0000-000000000014', 'vi', 'ke-tivi-go-soi-nordic',
   'Kệ Tivi Gỗ Sồi Tự Nhiên Nordic', 'Kệ tivi tối giản phong cách Bắc Âu gỗ sồi tự nhiên, ngăn kéo giảm chấn Blum, chân gỗ côn thanh lịch.',
   '{"vi":"Thiết kế tối giản tinh tế mang phong cách Nordic. Gỗ sồi tự nhiên xử lý dầu tự nhiên bền màu. Ngăn kéo giảm chấn Blum êm ái.","en":"Elegant minimalist Nordic design. Natural oak treated with natural oil for durability. Blum soft-close drawer system."}'::jsonb,
   'Gỗ sồi tự nhiên, Phụ kiện Blum (Đức)', '24,000,000 VND', '1600 x 450 x 500 mm'),
  ('00000001-0000-0000-0000-000000000014', 'en', 'ke-tivi-go-soi-nordic',
   'Nordic Natural Oak TV Console', 'Minimalist Scandinavian-style TV console in natural oak with Blum soft-close drawers and tapered legs.',
   '{"vi":"Thiết kế tối giản tinh tế mang phong cách Nordic. Gỗ sồi tự nhiên xử lý dầu tự nhiên bền màu. Ngăn kéo giảm chấn Blum êm ái.","en":"Elegant minimalist Nordic design. Natural oak treated with natural oil for durability. Blum soft-close drawer system."}'::jsonb,
   'Natural Oak, Blum (Germany) Hardware', '24,000,000 VND', '1600 x 450 x 500 mm');
INSERT INTO public.product_media (product_id, media_id, context, is_primary, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000014', 'gallery', true, 1);

-- P05: Bàn Ăn Live Edge Walnut (Dining Table)
INSERT INTO public.products (id, category_id, brand_id, reference_code, status, price_min, price_max, currency, brand_series, featured, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000015', 'c0000000-0000-0000-0000-000000000014', NULL,
   'PD-DT2401', 'draft', 54000000, 54000000, 'VND', 'Atelier Select', true, 5);
INSERT INTO public.product_translations (product_id, locale, slug, name, summary, description_json, material, price_display_text, dimension_display_text) VALUES
  ('00000001-0000-0000-0000-000000000015', 'vi', 'ban-an-walnut-live-edge',
   'Bàn Ăn Walnut Live Edge Nguyên Tấm', 'Bàn ăn nguyên tấm gỗ óc chó Bắc Mỹ live edge, vân gỗ tự nhiên nghệ thuật, chân thép đen sơn tĩnh điện.',
   '{"vi":"Mặt bàn live edge tự nhiên nguyên tấm từ rừng óc chó Bắc Mỹ được kiểm định chất lượng. Chân thép chữ H sơn tĩnh điện đen mờ.","en":"Single slab live edge walnut from certified North American walnut forests. H-frame powder-coated matte black steel legs."}'::jsonb,
   'Gỗ óc chó Bắc Mỹ nguyên tấm, Thép đen sơn tĩnh điện', '54,000,000 VND', '2400 x 950 x 750 mm'),
  ('00000001-0000-0000-0000-000000000015', 'en', 'ban-an-walnut-live-edge',
   'Atelier Walnut Live Edge Dining Table', 'Premium solid North American walnut live edge dining slab table with matte black steel H-frame legs.',
   '{"vi":"Mặt bàn live edge tự nhiên nguyên tấm từ rừng óc chó Bắc Mỹ được kiểm định chất lượng. Chân thép chữ H sơn tĩnh điện đen mờ.","en":"Single slab live edge walnut from certified North American walnut forests. H-frame powder-coated matte black steel legs."}'::jsonb,
   'Solid North American Walnut, Powder-coated Steel', '54,000,000 VND', '2400 x 950 x 750 mm');
INSERT INTO public.product_media (product_id, media_id, context, is_primary, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000015', 'gallery', true, 1);

-- P06: Ghế Ăn Bọc Da (Chair)
INSERT INTO public.products (id, category_id, brand_id, reference_code, status, price_min, price_max, currency, brand_series, featured, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000016', 'c0000000-0000-0000-0000-000000000015', NULL,
   'PD-C2416', 'draft', 6200000, 6200000, 'VND', 'Atelier Select', false, 6);
INSERT INTO public.product_translations (product_id, locale, slug, name, summary, description_json, material, price_display_text, dimension_display_text) VALUES
  ('00000001-0000-0000-0000-000000000016', 'vi', 'ghe-an-boc-da-bo-y',
   'Ghế Ăn Gỗ Óc Chó Bọc Da Bò Ý', 'Ghế ăn gỗ óc chó tự nhiên kết hợp da bò Ý aniline thượng hạng, thiết kế công thái học nâng đỡ lưng hoàn hảo.',
   '{"vi":"Khung ghế gỗ óc chó tự nhiên được gia công thủ công tinh xảo. Mặt đệm và lưng tựa bọc da aniline mềm mịn nhập khẩu Ý.","en":"Handcrafted solid walnut wood frame. Seat and backrest upholstered in soft Italian aniline leather."}'::jsonb,
   'Gỗ óc chó, Da bò Ý aniline', '6,200,000 VND', '480 x 520 x 820 mm'),
  ('00000001-0000-0000-0000-000000000016', 'en', 'ghe-an-boc-da-bo-y',
   'Walnut Italian Aniline Leather Dining Chair', 'Solid walnut dining chair upholstered in genuine Italian aniline leather with ergonomic back support.',
   '{"vi":"Khung ghế gỗ óc chó tự nhiên được gia công thủ công tinh xảo. Mặt đệm và lưng tựa bọc da aniline mềm mịn nhập khẩu Ý.","en":"Handcrafted solid walnut wood frame. Seat and backrest upholstered in soft Italian aniline leather."}'::jsonb,
   'Walnut, Italian Aniline Leather', '6,200,000 VND', '480 x 520 x 820 mm');
INSERT INTO public.product_media (product_id, media_id, context, is_primary, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000016', 'gallery', true, 1);

-- P07: Giường Ngủ Luxury Velvet (Bed)
INSERT INTO public.products (id, category_id, brand_id, reference_code, status, price_min, price_max, currency, brand_series, featured, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000017', 'c0000000-0000-0000-0000-000000000016', NULL,
   'PD-B2418', 'draft', 35000000, 35000000, 'VND', 'Luxury Sleep', false, 7);
INSERT INTO public.product_translations (product_id, locale, slug, name, summary, description_json, material, price_display_text, dimension_display_text) VALUES
  ('00000001-0000-0000-0000-000000000017', 'vi', 'giuong-ngu-luxury-velvet',
   'Giường Ngủ Luxury Velvet King-size', 'Giường ngủ bọc nỉ nhung velvet cao cấp màu xanh đêm huyền bí, đầu giường tạo hình sóng nghệ thuật, chân gỗ cao su sơn đen.',
   '{"vi":"Đầu giường bọc nhung velvet tạo hình làn sóng sang trọng. Khung chắc chắn từ gỗ thông và gỗ công nghiệp chống ẩm. Hệ nan gỗ êm ái.","en":"Wave-shaped velvet headboard for elegant appeal. Robust frame from pine and moisture-proof board. Comfortable wooden slat system."}'::jsonb,
   'Khung gỗ thông, Vải nhung velvet', '35,000,000 VND', '1800 x 2000 mm'),
  ('00000001-0000-0000-0000-000000000017', 'en', 'giuong-ngu-luxury-velvet',
   'Luxury Velvet King-size Bed', 'Upholstered king-size bed in deep midnight blue velvet with wave-shaped headboard and lacquered rubber wood legs.',
   '{"vi":"Đầu giường bọc nhung velvet tạo hình làn sóng sang trọng. Khung chắc chắn từ gỗ thông và gỗ công nghiệp chống ẩm. Hệ nan gỗ êm ái.","en":"Wave-shaped velvet headboard for elegant appeal. Robust frame from pine and moisture-proof board. Comfortable wooden slat system."}'::jsonb,
   'Pine Wood Frame, Velvet Upholstery', '35,000,000 VND', '1800 x 2000 mm');
INSERT INTO public.product_media (product_id, media_id, context, is_primary, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000017', 'gallery', true, 1);

-- P08: Tủ Quần Áo Kịch Trần (Wardrobe)
INSERT INTO public.products (id, category_id, brand_id, reference_code, status, price_min, price_max, currency, brand_series, featured, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000018', 'c0000000-0000-0000-0000-000000000017', 'b0000000-0000-0000-0000-000000000007',
   'PD-W2419', 'draft', 48000000, 72000000, 'VND', 'Storage Pro', false, 8);
INSERT INTO public.product_translations (product_id, locale, slug, name, summary, description_json, material, price_display_text, dimension_display_text) VALUES
  ('00000001-0000-0000-0000-000000000018', 'vi', 'tu-quan-ao-kich-tran-walnut',
   'Tủ Quần Áo Kịch Trần Walnut', 'Tủ quần áo kịch trần vân gỗ walnut, thanh trượt Häfele Đức êm ái, ốp kiếng sang trọng, thiết kế theo yêu cầu.',
   '{"vi":"Gỗ MDF phủ veneer walnut Bắc Mỹ cao cấp. Thanh trượt Häfele Đức êm ái bền bỉ. Tùy chỉnh kích thước theo không gian.","en":"MDF board covered in premium North American walnut veneer. Häfele German soft-close slides. Custom sizing available."}'::jsonb,
   'MDF phủ veneer Walnut, Phụ kiện Häfele Đức', '48,000,000 - 72,000,000 VND', 'Tuỳ chỉnh theo yêu cầu'),
  ('00000001-0000-0000-0000-000000000018', 'en', 'tu-quan-ao-kich-tran-walnut',
   'Floor-to-Ceiling Walnut Wardrobe', 'Floor-to-ceiling walnut veneer wardrobe with Häfele German soft-close rails, glass panels, custom sizing.',
   '{"vi":"Gỗ MDF phủ veneer walnut Bắc Mỹ cao cấp. Thanh trượt Häfele Đức êm ái bền bỉ. Tùy chỉnh kích thước theo không gian.","en":"MDF board covered in premium North American walnut veneer. Häfele German soft-close slides. Custom sizing available."}'::jsonb,
   'MDF Walnut Veneer, Häfele Hardware', '48,000,000 - 72,000,000 VND', 'Custom sizing available');
INSERT INTO public.product_media (product_id, media_id, context, is_primary, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000018', 'gallery', true, 1);

-- SANITARY EQUIPMENT PRODUCTS --

-- P09: Bồn Tắm Bravat (Bathtub - promo: SUMMER SALE)
INSERT INTO public.products (id, category_id, brand_id, reference_code, status, price_min, price_max, currency, brand_series, featured, sort_order, promo_price_min, promo_price_max) VALUES
  ('00000001-0000-0000-0000-000000000021', 'c0000000-0000-0000-0000-000000000021', 'b0000000-0000-0000-0000-000000000006',
   'PD-BT2501', 'draft', 65000000, 65000000, 'VND', 'Wellness Series', true, 9, 52000000, 52000000);
INSERT INTO public.product_translations (product_id, locale, slug, name, summary, description_json, material, price_display_text, dimension_display_text) VALUES
  ('00000001-0000-0000-0000-000000000021', 'vi', 'bon-tam-doc-lap-bravat-wellness',
   'Bồn Tắm Độc Lập Bravat Wellness', 'Bồn tắm thân đứng Bravat Wellness Series chất liệu Solid Surface nguyên khối, giữ nhiệt suốt 2 giờ, thiết kế tối giản Đức.',
   '{"vi":"Solid Surface không thấm nước, không bám cặn, kháng khuẩn tự nhiên. Chân inox điều chỉnh được.","en":"Non-porous Solid Surface, stain-resistant, naturally antibacterial. Adjustable stainless steel feet."}'::jsonb,
   'Solid Surface, Chân inox', '65,000,000 VND', '1800 x 800 x 620 mm'),
  ('00000001-0000-0000-0000-000000000021', 'en', 'bon-tam-doc-lap-bravat-wellness',
   'Bravat Wellness Freestanding Bathtub', 'Bravat Wellness Series freestanding solid surface bathtub with 2-hour heat retention, minimalist German design.',
   '{"vi":"Solid Surface không thấm nước, không bám cặn, kháng khuẩn tự nhiên. Chân inox điều chỉnh được.","en":"Non-porous Solid Surface, stain-resistant, naturally antibacterial. Adjustable stainless steel feet."}'::jsonb,
   'Solid Surface, Stainless Steel Legs', '65,000,000 VND', '1800 x 800 x 620 mm');
INSERT INTO public.product_media (product_id, media_id, context, is_primary, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000021', 'gallery', true, 1);

-- P10: Bồn Cầu Kohler Veil (Toilet)
INSERT INTO public.products (id, category_id, brand_id, reference_code, status, price_min, price_max, currency, brand_series, featured, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000022', 'c0000000-0000-0000-0000-000000000022', 'b0000000-0000-0000-0000-000000000001',
   'PD-KV2401', 'draft', 85000000, 85000000, 'VND', 'Veil Intelligent', true, 10);
INSERT INTO public.product_translations (product_id, locale, slug, name, summary, description_json, material, price_display_text, dimension_display_text) VALUES
  ('00000001-0000-0000-0000-000000000022', 'vi', 'bon-cau-kohler-veil-intelligent',
   'Bồn Cầu Thông Minh Kohler Veil', 'Bồn cầu Kohler Veil với nắp rửa điện tử tích hợp nhiều chức năng, điều khiển bằng ứng dụng Kohler Konnect.',
   '{"vi":"Công nghệ khử mùi UV, sưởi ấm nắp và mặt ngồi, xịt rửa nhiều chế độ. Điều khiển từ xa qua app Konnect.","en":"UV deodorization, heated seat and lid, multiple wash modes. Remote control via Konnect app."}'::jsonb,
   'Sứ tráng men Kohler CleanCoat', '85,000,000 VND', '740 x 420 x 720 mm'),
  ('00000001-0000-0000-0000-000000000022', 'en', 'bon-cau-kohler-veil-intelligent',
   'Kohler Veil Intelligent Toilet', 'Kohler Veil intelligent toilet with integrated bidet lid, UV deodorization, and Konnect app control.',
   '{"vi":"Công nghệ khử mùi UV, sưởi ấm nắp và mặt ngồi, xịt rửa nhiều chế độ. Điều khiển từ xa qua app Konnect.","en":"UV deodorization, heated seat and lid, multiple wash modes. Remote control via Konnect app."}'::jsonb,
   'Kohler CleanCoat Glazed Ceramic', '85,000,000 VND', '740 x 420 x 720 mm');
INSERT INTO public.product_media (product_id, media_id, context, is_primary, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000022', 'gallery', true, 1);

-- P11: Lavabo Kohler PD-54 (Basin - promo: WELLNESS BATH SET)
INSERT INTO public.products (id, category_id, brand_id, reference_code, status, price_min, price_max, currency, brand_series, featured, sort_order, promo_price_min, promo_price_max) VALUES
  ('00000001-0000-0000-0000-000000000054', 'c0000000-0000-0000-0000-000000000023', 'b0000000-0000-0000-0000-000000000001',
   'PD-54', 'draft', 15000000, 15000000, 'VND', 'CleanCoat Series', true, 11, 12750000, 12750000);
INSERT INTO public.product_translations (product_id, locale, slug, name, summary, description_json, material, price_display_text, dimension_display_text) VALUES
  ('00000001-0000-0000-0000-000000000054', 'vi', 'basin-modern-pd-54',
   'Lavabo Hiện Đại PD-54 Kohler', 'Chậu rửa đặt bàn cao cấp Kohler với lớp men CleanCoat nano chống bám bẩn vượt trội, thiết kế tối giản tinh tế.',
   '{"vi":"Thiết kế hiện đại, tinh gọn với lòng chậu sâu chống bắn nước tối đa. Men CleanCoat nano siêu kỵ nước và kỵ dầu. Dễ vệ sinh, giữ trắng bền.","en":"Modern minimalist design with deep bowl for maximum splash prevention. CleanCoat nano glaze is super hydrophobic and oleophobic. Easy to clean, stays white longer."}'::jsonb,
   'Sứ tráng men nano CleanCoat cao cấp', '15,000,000 VND', '540 x 380 x 150 mm'),
  ('00000001-0000-0000-0000-000000000054', 'en', 'basin-modern-pd-54',
   'Kohler Modern Basin PD-54', 'Kohler premium countertop vessel sink featuring CleanCoat nano glaze technology for superior stain resistance.',
   '{"vi":"Thiết kế hiện đại, tinh gọn với lòng chậu sâu chống bắn nước tối đa. Men CleanCoat nano siêu kỵ nước và kỵ dầu. Dễ vệ sinh, giữ trắng bền.","en":"Modern minimalist design with deep bowl for maximum splash prevention. CleanCoat nano glaze is super hydrophobic and oleophobic. Easy to clean, stays white longer."}'::jsonb,
   'Premium nano-glazed ceramic CleanCoat', '15,000,000 VND', '540 x 380 x 150 mm');
INSERT INTO public.product_media (product_id, media_id, context, is_primary, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000054', '00000000-0000-0000-0000-000000000023', 'gallery', true, 1),
  ('00000001-0000-0000-0000-000000000054', '00000000-0000-0000-0000-000000000024', 'gallery', false, 2);

-- P12: Sen Tắm Grohe 24K Gold (Shower - promo: SUMMER SALE)
INSERT INTO public.products (id, category_id, brand_id, reference_code, status, price_min, price_max, currency, brand_series, featured, sort_order, promo_price_min, promo_price_max) VALUES
  ('00000001-0000-0000-0000-000000000024', 'c0000000-0000-0000-0000-000000000024', 'b0000000-0000-0000-0000-000000000002',
   'PD-GR2401', 'draft', 125000000, 125000000, 'VND', 'Atelier Gold', true, 12, 100000000, 100000000);
INSERT INTO public.product_translations (product_id, locale, slug, name, summary, description_json, material, price_display_text, dimension_display_text) VALUES
  ('00000001-0000-0000-0000-000000000024', 'vi', 'sen-tam-grohe-24k-gold',
   'Sen Tắm Âm Tường Grohe Mạ Vàng 24K', 'Hệ thống sen tắm âm tường Grohe Atelier với khóa nhiệt độ an toàn, mạ vàng 24K bền bỉ, đầu sen đa chế độ.',
   '{"vi":"Hệ khóa nhiệt độ Grohtherm 3000 Cosmopolitan an toàn tuyệt đối. Mạ vàng 24K theo quy trình PVD không phai màu. Đầu sen Rainshower 310mm mưa nhẹ nhàng.","en":"Grohtherm 3000 Cosmopolitan safety thermostatic valve. PVD 24K gold plating will never fade. Rainshower 310mm head for gentle rain experience."}'::jsonb,
   'Đồng thau mạ vàng 24K (PVD)', '125,000,000 VND', 'Bộ hoàn chỉnh âm tường'),
  ('00000001-0000-0000-0000-000000000024', 'en', 'sen-tam-grohe-24k-gold',
   'Grohe 24K Gold Plated Built-in Shower', 'Grohe Atelier concealed shower system with thermostatic valve, PVD 24K gold plating, multi-function shower head.',
   '{"vi":"Hệ khóa nhiệt độ Grohtherm 3000 Cosmopolitan an toàn tuyệt đối. Mạ vàng 24K theo quy trình PVD không phai màu. Đầu sen Rainshower 310mm mưa nhẹ nhàng.","en":"Grohtherm 3000 Cosmopolitan safety thermostatic valve. PVD 24K gold plating will never fade. Rainshower 310mm head for gentle rain experience."}'::jsonb,
   'Brass with PVD 24K Gold Plating', '125,000,000 VND', 'Complete concealed system');
INSERT INTO public.product_media (product_id, media_id, context, is_primary, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000024', 'gallery', true, 1);

-- P13: Vòi Lavabo Kohler Purist (Faucet)
INSERT INTO public.products (id, category_id, brand_id, reference_code, status, price_min, price_max, currency, brand_series, featured, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000025', 'c0000000-0000-0000-0000-000000000025', 'b0000000-0000-0000-0000-000000000001',
   'PD-KP2401', 'draft', 8500000, 8500000, 'VND', 'Purist Series', false, 13);
INSERT INTO public.product_translations (product_id, locale, slug, name, summary, description_json, material, price_display_text, dimension_display_text) VALUES
  ('00000001-0000-0000-0000-000000000025', 'vi', 'voi-lavabo-kohler-purist',
   'Vòi Lavabo Kohler Purist Chrome', 'Vòi chậu rửa Kohler Purist tay gạt đơn, mạ chrome bóng cao cấp, tay vặn hình học tối giản, tiết kiệm nước WaterSense.',
   '{"vi":"Chứng nhận WaterSense tiết kiệm 20% nước. Vỏ đồng thau đặc nguyên khối bền bỉ. Mạ chrome bền sáng bóng lâu năm.","en":"WaterSense certified 20% water saving. Solid brass construction. Long-lasting chrome finish."}'::jsonb,
   'Đồng thau đặc nguyên khối, mạ chrome', '8,500,000 VND', '210 x 175 x 155 mm'),
  ('00000001-0000-0000-0000-000000000025', 'en', 'voi-lavabo-kohler-purist',
   'Kohler Purist Chrome Basin Faucet', 'Kohler Purist single-lever basin faucet in polished chrome, geometric minimalist handle, WaterSense certified.',
   '{"vi":"Chứng nhận WaterSense tiết kiệm 20% nước. Vỏ đồng thau đặc nguyên khối bền bỉ. Mạ chrome bền sáng bóng lâu năm.","en":"WaterSense certified 20% water saving. Solid brass construction. Long-lasting chrome finish."}'::jsonb,
   'Solid Brass, Chrome Finish', '8,500,000 VND', '210 x 175 x 155 mm');
INSERT INTO public.product_media (product_id, media_id, context, is_primary, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000025', 'gallery', true, 1);

-- P14: Bồn Tắm American Standard (Bathtub)
INSERT INTO public.products (id, category_id, brand_id, reference_code, status, price_min, price_max, currency, brand_series, featured, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000035', 'c0000000-0000-0000-0000-000000000021', 'b0000000-0000-0000-0000-000000000005',
   'PD-AM-01', 'draft', 28000000, 28000000, 'VND', 'American Luxury', false, 14);
INSERT INTO public.product_translations (product_id, locale, slug, name, summary, description_json, material, price_display_text, dimension_display_text) VALUES
  ('00000001-0000-0000-0000-000000000035', 'vi', 'bon-tam-american-standard-acrylic',
   'Bồn Tắm American Standard Acrylic', 'Bồn tắm độc lập cao cấp American Standard thiết kế tối giản hiện đại, chất liệu acrylic nhập khẩu chống trầy vĩnh cửu.',
   '{"vi":"Acrylic cao cấp nhập khẩu giữ nhiệt tốt, chống trầy và ố vàng. Thân bồn nhẹ, dễ vệ sinh và lắp đặt. Thiết kế oval thanh lịch.","en":"Premium acrylic with heat retention, scratch and discoloration resistance. Lightweight body, easy to clean and install. Elegant oval design."}'::jsonb,
   'Acrylic cao cấp nhập khẩu', '28,000,000 VND', '1600 x 750 x 560 mm'),
  ('00000001-0000-0000-0000-000000000035', 'en', 'bon-tam-american-standard-acrylic',
   'American Standard Premium Acrylic Bathtub', 'American Standard premium acrylic freestanding bathtub with modern minimalist design and overflow protection.',
   '{"vi":"Acrylic cao cấp nhập khẩu giữ nhiệt tốt, chống trầy và ố vàng. Thân bồn nhẹ, dễ vệ sinh và lắp đặt. Thiết kế oval thanh lịch.","en":"Premium acrylic with heat retention, scratch and discoloration resistance. Lightweight body, easy to clean and install. Elegant oval design."}'::jsonb,
   'High-grade Acrylic', '28,000,000 VND', '1600 x 750 x 560 mm');
INSERT INTO public.product_media (product_id, media_id, context, is_primary, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000035', '00000000-0000-0000-0000-000000000021', 'gallery', true, 1);

-- P15: Bồn Cầu TOTO Washlet
INSERT INTO public.products (id, category_id, brand_id, reference_code, status, price_min, price_max, currency, brand_series, featured, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000033', 'c0000000-0000-0000-0000-000000000022', 'b0000000-0000-0000-0000-000000000003',
   'PD-TOTO-01', 'draft', 45000000, 45000000, 'VND', 'Washlet Series', true, 15);
INSERT INTO public.product_translations (product_id, locale, slug, name, summary, description_json, material, price_display_text, dimension_display_text) VALUES
  ('00000001-0000-0000-0000-000000000033', 'vi', 'bon-cau-toto-washlet',
   'Bồn Cầu TOTO Washlet Tích Hợp', 'Bồn cầu nguyên khối TOTO kết hợp nắp rửa điện tử Washlet, hệ xả Tornado siêu mạnh, men CeFiONtect kháng bẩn 100 năm.',
   '{"vi":"Hệ xả xoáy Tornado hiệu suất cao, tiết kiệm nước vượt trội. Men CeFiONtect siêu bóng chống bám bẩn vĩnh cửu. Nắp Washlet sưởi ấm, sấy khô.","en":"High-efficiency Tornado flush, superior water saving. CeFiONtect ultra-smooth glaze resists dirt permanently. Washlet seat with heating and drying."}'::jsonb,
   'Sứ tráng men CeFiONtect', '45,000,000 VND', '720 x 420 x 730 mm'),
  ('00000001-0000-0000-0000-000000000033', 'en', 'bon-cau-toto-washlet',
   'TOTO Washlet Integrated Toilet', 'TOTO close-coupled toilet with integrated Washlet bidet lid, Tornado flush system, and CeFiONtect antimicrobial glaze.',
   '{"vi":"Hệ xả xoáy Tornado hiệu suất cao, tiết kiệm nước vượt trội. Men CeFiONtect siêu bóng chống bám bẩn vĩnh cửu. Nắp Washlet sưởi ấm, sấy khô.","en":"High-efficiency Tornado flush, superior water saving. CeFiONtect ultra-smooth glaze resists dirt permanently. Washlet seat with heating and drying."}'::jsonb,
   'CeFiONtect Glazed Ceramic', '45,000,000 VND', '720 x 420 x 730 mm');
INSERT INTO public.product_media (product_id, media_id, context, is_primary, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000033', '00000000-0000-0000-0000-000000000022', 'gallery', true, 1);

-- TILE PRODUCTS --

-- P16: Gạch Porcelain Calacatta Gold (Floor)
INSERT INTO public.products (id, category_id, brand_id, reference_code, status, price_min, price_max, currency, brand_series, featured, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000031', 'c0000000-0000-0000-0000-000000000031', NULL,
   'PD-T2401', 'draft', 890000, 890000, 'VND', 'Calacatta Collection', true, 16);
INSERT INTO public.product_translations (product_id, locale, slug, name, summary, description_json, material, price_display_text, dimension_display_text) VALUES
  ('00000001-0000-0000-0000-000000000031', 'vi', 'gach-porcelain-calacatta-gold-80x160',
   'Gạch Vân Đá Calacatta Gold 80x160cm', 'Gạch porcelain vân đá Calacatta Gold khổ lớn 80x160cm nhập khẩu Tây Ban Nha, bề mặt bóng gương siêu sáng.',
   '{"vi":"Vân đá Calacatta Gold tự nhiên trông đẹp mắt và sang trọng. Độ hút nước <0.05%, phù hợp sàn và tường. Bề mặt bóng gương siêu sáng.","en":"Beautiful natural Calacatta Gold veins, elegant and luxurious. Water absorption <0.05%, suitable for floor and wall. Ultra-bright mirror polished surface."}'::jsonb,
   'Porcelain nhập khẩu Tây Ban Nha', '890,000 VND/m²', '800 x 1600 mm'),
  ('00000001-0000-0000-0000-000000000031', 'en', 'gach-porcelain-calacatta-gold-80x160',
   'Calacatta Gold Porcelain Tile 80x160cm', 'Large format 80x160cm imported Spanish Calacatta Gold stone-look porcelain tile with ultra-bright mirror polish.',
   '{"vi":"Vân đá Calacatta Gold tự nhiên trông đẹp mắt và sang trọng. Độ hút nước <0.05%, phù hợp sàn và tường. Bề mặt bóng gương siêu sáng.","en":"Beautiful natural Calacatta Gold veins, elegant and luxurious. Water absorption <0.05%, suitable for floor and wall. Ultra-bright mirror polished surface."}'::jsonb,
   'Imported Spanish Porcelain', '890,000 VND/m²', '800 x 1600 mm');
INSERT INTO public.product_media (product_id, media_id, context, is_primary, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000031', 'gallery', true, 1);

-- P17: Gạch Mosaic Nghệ Thuật (Wall)
INSERT INTO public.products (id, category_id, brand_id, reference_code, status, price_min, price_max, currency, brand_series, featured, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000032', 'c0000000-0000-0000-0000-000000000032', NULL,
   'PD-T2402', 'draft', 2450000, 2450000, 'VND', 'Artistic Mosaic', false, 17);
INSERT INTO public.product_translations (product_id, locale, slug, name, summary, description_json, material, price_display_text, dimension_display_text) VALUES
  ('00000001-0000-0000-0000-000000000032', 'vi', 'gach-mosaic-nghe-thuat',
   'Gạch Mosaic Nghệ Thuật Thủy Tinh', 'Gạch mosaic thủy tinh màu sắc cao cấp tạo điểm nhấn kiến trúc độc bản, phù hợp ốp tường phòng tắm và bếp.',
   '{"vi":"Thủy tinh màu lung linh tương tác ánh sáng tuyệt đẹp. Mỗi viên được làm thủ công. Chống ẩm và hoá chất bền bỉ.","en":"Glimmering colored glass with beautiful light reflections. Each piece handcrafted. Moisture and chemical resistant."}'::jsonb,
   'Thủy tinh màu cao cấp, Gốm nung', '2,450,000 VND/vỉ', 'Vỉ 300 x 300 mm'),
  ('00000001-0000-0000-0000-000000000032', 'en', 'gach-mosaic-nghe-thuat',
   'Artistic Glass Mosaic Wall Tile', 'Premium glass mosaic sheets for luxury backsplash and wall accents in bathrooms and kitchens.',
   '{"vi":"Thủy tinh màu lung linh tương tác ánh sáng tuyệt đẹp. Mỗi viên được làm thủ công. Chống ẩm và hoá chất bền bỉ.","en":"Glimmering colored glass with beautiful light reflections. Each piece handcrafted. Moisture and chemical resistant."}'::jsonb,
   'Colored Glass, Fired Ceramic', '2,450,000 VND/sheet', 'Sheet 300 x 300 mm');
INSERT INTO public.product_media (product_id, media_id, context, is_primary, sort_order) VALUES
  ('00000001-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000032', 'gallery', true, 1);

-- ============================================================================
-- 7. PUBLISH ALL PRODUCTS
-- ============================================================================
UPDATE public.products SET status = 'published', published_at = NOW()
WHERE id IN (
  '00000001-0000-0000-0000-000000000011',
  '00000001-0000-0000-0000-000000000012',
  '00000001-0000-0000-0000-000000000013',
  '00000001-0000-0000-0000-000000000014',
  '00000001-0000-0000-0000-000000000015',
  '00000001-0000-0000-0000-000000000016',
  '00000001-0000-0000-0000-000000000017',
  '00000001-0000-0000-0000-000000000018',
  '00000001-0000-0000-0000-000000000021',
  '00000001-0000-0000-0000-000000000022',
  '00000001-0000-0000-0000-000000000054',
  '00000001-0000-0000-0000-000000000024',
  '00000001-0000-0000-0000-000000000025',
  '00000001-0000-0000-0000-000000000035',
  '00000001-0000-0000-0000-000000000033',
  '00000001-0000-0000-0000-000000000031',
  '00000001-0000-0000-0000-000000000032'
);

-- ============================================================================
-- 8. LINK PRODUCTS TO PROMOTIONS
-- ============================================================================
-- Summer Sale / Walnut Heritage: Sofa Curve Velour + Coffee Table + TV Cabinet
INSERT INTO public.product_promotions (product_id, promotion_id) VALUES
  ('00000001-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111'), -- Sofa Curve Velour
  ('00000001-0000-0000-0000-000000000013', '11111111-1111-1111-1111-111111111111'), -- Coffee Table Round Calacatta
  ('00000001-0000-0000-0000-000000000014', '11111111-1111-1111-1111-111111111111'); -- TV Console Nordic Oak

-- Wellness Bath Set: Bravat Bathtub + Grohe Shower + Kohler Basin
INSERT INTO public.product_promotions (product_id, promotion_id) VALUES
  ('00000001-0000-0000-0000-000000000021', '22222222-2222-2222-2222-222222222222'), -- Bravat Bathtub
  ('00000001-0000-0000-0000-000000000024', '22222222-2222-2222-2222-222222222222'), -- Grohe Shower
  ('00000001-0000-0000-0000-000000000054', '22222222-2222-2222-2222-222222222222'); -- Kohler Basin

-- Luxury Calacatta Tile Deal: Floor Tiles + Wall Tiles
INSERT INTO public.product_promotions (product_id, promotion_id) VALUES
  ('00000001-0000-0000-0000-000000000031', '33333333-3333-3333-3333-333333333333'), -- Floor Tiles Calacatta
  ('00000001-0000-0000-0000-000000000032', '33333333-3333-3333-3333-333333333333'); -- Wall Tiles Calacatta

-- ============================================================================
-- 9. RE-ENABLE TRIGGERS
-- ============================================================================
SET session_replication_role = 'origin';

-- Final verification
SELECT 'Categories published:' AS info, COUNT(*) AS count FROM public.product_categories WHERE status = 'published'
UNION ALL
SELECT 'Products published:', COUNT(*) FROM public.products WHERE status = 'published'
UNION ALL
SELECT 'Brands seeded:', COUNT(*) FROM public.brands
UNION ALL
SELECT 'Promotions active:', COUNT(*) FROM public.promotions WHERE status = 'published';
