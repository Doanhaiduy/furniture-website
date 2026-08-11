-- ============================================================================
-- seed.data.sql — DỮ LIỆU KHỞI TẠO CHO PRODUCTION
-- ============================================================================
-- Nội dung:
--   1) Danh mục sản phẩm (product_categories + product_category_translations)
--      Với 4 danh mục cha chính:
--         - Đồ gỗ nội thất (wooden_furniture)
--         - Thiết bị vệ sinh (sanitary_equipment)
--         - Gạch ốp lát (tiles)
--         - Thiết bị khác (project_solutions)
--   2) Thương hiệu      (brands + brand_translations)
--   3) Danh mục blog    (blog_categories + blog_category_translations)
--   4) Bài viết mẫu     (blog_posts + blog_post_translations) — status DRAFT
--   5) Showroom         (showrooms + showroom_translations)
--
-- ⚠️  TRƯỚC KHI CHẠY:
--   - Đã apply migration 0001 + 0002
--   - Đã chạy seed.production.sql (tạo admin user + site_settings)
--
-- CÁCH CHẠY:
--   docker exec -i supabase-db psql -U postgres -d postgres < supabase/seed.data.sql
--
-- Idempotent: chạy nhiều lần an toàn (ON CONFLICT DO NOTHING).
-- ============================================================================

BEGIN;
SET session_replication_role = replica;

-- ============================================================================
-- 1. DANH MỤC SẢN PHẨM
-- ============================================================================

-- ─── NHÓM 1: ĐỒ GỖ NỘI THẤT (wooden_furniture) ─────────────────────────────

-- Danh mục gốc: Đồ gỗ nội thất
INSERT INTO public.product_categories (id, group_key, status, sort_order, published_at, created_by, updated_by, created_at, updated_at)
VALUES ('ca000001-0000-4000-8000-000000000001', 'wooden_furniture', 'published', 0, now(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_category_translations (id, category_id, locale, slug, name, description, seo_title, seo_description, created_at, updated_at) VALUES
('ca000001-0000-4000-8000-000000000101', 'ca000001-0000-4000-8000-000000000001', 'vi', 'do-go-noi-that', 'Đồ gỗ nội thất', 'Bộ sưu tập đồ gỗ nội thất tự nhiên cao cấp cho không gian sống hiện đại và sang trọng.', 'Đồ gỗ nội thất cao cấp – Phương Đông', 'Cung cấp đồ gỗ nội thất tự nhiên: bàn ghế, sofa, tủ bếp, giường ngủ chất lượng cao.', now(), now()),
('ca000001-0000-4000-8000-000000000102', 'ca000001-0000-4000-8000-000000000001', 'en', 'wooden-furniture', 'Wooden Furniture', 'Premium natural wooden furniture collection for modern and luxurious living spaces.', 'Premium Wooden Furniture – Phuong Dong', 'Providing high quality natural wooden furniture: tables, chairs, sofas, kitchen cabinets, beds.', now(), now())
ON CONFLICT (category_id, locale) DO NOTHING;

-- Danh mục con: Sofa & Ghế
INSERT INTO public.product_categories (id, parent_id, group_key, status, sort_order, published_at, created_by, updated_by, created_at, updated_at)
VALUES ('ca000002-0000-4000-8000-000000000001', 'ca000001-0000-4000-8000-000000000001', 'wooden_furniture', 'published', 0, now(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_category_translations (id, category_id, locale, slug, name, description, created_at, updated_at) VALUES
('ca000002-0000-4000-8000-000000000101', 'ca000002-0000-4000-8000-000000000001', 'vi', 'sofa-va-ghe', 'Sofa & Ghế', 'Sofa gỗ óc chó, sofa da cao cấp, ghế đơn thư giãn.', now(), now()),
('ca000002-0000-4000-8000-000000000102', 'ca000002-0000-4000-8000-000000000001', 'en', 'sofas-chairs', 'Sofas & Chairs', 'Walnut sofas, premium leather sofas, accent chairs.', now(), now())
ON CONFLICT (category_id, locale) DO NOTHING;

-- Danh mục con: Bàn ăn & Ghế ăn
INSERT INTO public.product_categories (id, parent_id, group_key, status, sort_order, published_at, created_by, updated_by, created_at, updated_at)
VALUES ('ca000003-0000-4000-8000-000000000001', 'ca000001-0000-4000-8000-000000000001', 'wooden_furniture', 'published', 1, now(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_category_translations (id, category_id, locale, slug, name, description, created_at, updated_at) VALUES
('ca000003-0000-4000-8000-000000000101', 'ca000003-0000-4000-8000-000000000001', 'vi', 'ban-an-va-ghe-an', 'Bàn ăn & Ghế ăn', 'Bàn ăn gỗ cao cấp, thiết kế hiện đại đa dạng kích thước.', now(), now()),
('ca000003-0000-4000-8000-000000000102', 'ca000003-0000-4000-8000-000000000001', 'en', 'dining-tables-chairs', 'Dining Tables & Chairs', 'Premium wooden dining tables, modern designs in various sizes.', now(), now())
ON CONFLICT (category_id, locale) DO NOTHING;

-- Danh mục con: Giường ngủ
INSERT INTO public.product_categories (id, parent_id, group_key, status, sort_order, published_at, created_by, updated_by, created_at, updated_at)
VALUES ('ca000004-0000-4000-8000-000000000001', 'ca000001-0000-4000-8000-000000000001', 'wooden_furniture', 'published', 2, now(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_category_translations (id, category_id, locale, slug, name, description, created_at, updated_at) VALUES
('ca000004-0000-4000-8000-000000000101', 'ca000004-0000-4000-8000-000000000001', 'vi', 'giuong-ngu', 'Giường ngủ', 'Giường ngủ gỗ tự nhiên chắc chắn, mang lại giấc ngủ ngon.', now(), now()),
('ca000004-0000-4000-8000-000000000102', 'ca000004-0000-4000-8000-000000000001', 'en', 'beds', 'Beds', 'Sturdy natural wood beds, ensuring a good night''s sleep.', now(), now())
ON CONFLICT (category_id, locale) DO NOTHING;

-- Danh mục con: Tủ kệ tivi
INSERT INTO public.product_categories (id, parent_id, group_key, status, sort_order, published_at, created_by, updated_by, created_at, updated_at)
VALUES ('ca000005-0000-4000-8000-000000000001', 'ca000001-0000-4000-8000-000000000001', 'wooden_furniture', 'published', 3, now(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_category_translations (id, category_id, locale, slug, name, description, created_at, updated_at) VALUES
('ca000005-0000-4000-8000-000000000101', 'ca000005-0000-4000-8000-000000000001', 'vi', 'tu-ke-tivi', 'Tủ kệ tivi', 'Kệ tivi phòng khách sang trọng, đa năng làm bằng gỗ tự nhiên.', now(), now()),
('ca000005-0000-4000-8000-000000000102', 'ca000005-0000-4000-8000-000000000001', 'en', 'tv-stands-cabinets', 'TV Stands & Cabinets', 'Elegant and multifunctional natural wood TV stands for the living room.', now(), now())
ON CONFLICT (category_id, locale) DO NOTHING;


-- ─── NHÓM 2: THIẾT BỊ VỆ SINH (sanitary_equipment) ──────────────────────────

-- Danh mục gốc: Thiết bị vệ sinh
INSERT INTO public.product_categories (id, group_key, status, sort_order, published_at, created_by, updated_by, created_at, updated_at)
VALUES ('ca000010-0000-4000-8000-000000000001', 'sanitary_equipment', 'published', 1, now(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_category_translations (id, category_id, locale, slug, name, description, seo_title, seo_description, created_at, updated_at) VALUES
('ca000010-0000-4000-8000-000000000101', 'ca000010-0000-4000-8000-000000000001', 'vi', 'thiet-bi-ve-sinh', 'Thiết bị vệ sinh', 'Thiết bị vệ sinh nhập khẩu chính hãng từ các thương hiệu lớn Kohler, TOTO, Inax.', 'Thiết bị vệ sinh nhập khẩu chính hãng – Phương Đông', 'Thiết bị vệ sinh cao cấp: bồn cầu, lavabo, sen vòi, bồn tắm nhập khẩu chính hãng.', now(), now()),
('ca000010-0000-4000-8000-000000000102', 'ca000010-0000-4000-8000-000000000001', 'en', 'sanitary-equipment', 'Sanitary Equipment', 'Genuine imported sanitary equipment from top brands Kohler, TOTO, Inax.', 'Genuine Sanitary Equipment – Phuong Dong', 'Premium sanitary ware: toilets, basins, faucets, showers, imported bathtubs.', now(), now())
ON CONFLICT (category_id, locale) DO NOTHING;

-- Danh mục con: Bồn cầu
INSERT INTO public.product_categories (id, parent_id, group_key, status, sort_order, published_at, created_by, updated_by, created_at, updated_at)
VALUES ('ca000011-0000-4000-8000-000000000001', 'ca000010-0000-4000-8000-000000000001', 'sanitary_equipment', 'published', 0, now(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_category_translations (id, category_id, locale, slug, name, description, created_at, updated_at) VALUES
('ca000011-0000-4000-8000-000000000101', 'ca000011-0000-4000-8000-000000000001', 'vi', 'bon-cau', 'Bồn cầu', 'Bồn cầu thông minh, bồn cầu một khối và treo tường.', now(), now()),
('ca000011-0000-4000-8000-000000000102', 'ca000011-0000-4000-8000-000000000001', 'en', 'toilets', 'Toilets', 'Smart toilets, one-piece toilets, and wall-hung toilets.', now(), now())
ON CONFLICT (category_id, locale) DO NOTHING;

-- Danh mục con: Lavabo & Chậu rửa
INSERT INTO public.product_categories (id, parent_id, group_key, status, sort_order, published_at, created_by, updated_by, created_at, updated_at)
VALUES ('ca000012-0000-4000-8000-000000000001', 'ca000010-0000-4000-8000-000000000001', 'sanitary_equipment', 'published', 1, now(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_category_translations (id, category_id, locale, slug, name, description, created_at, updated_at) VALUES
('ca000012-0000-4000-8000-000000000101', 'ca000012-0000-4000-8000-000000000001', 'vi', 'lavabo-chau-rua', 'Lavabo & Chậu rửa', 'Chậu rửa đặt bàn, âm bàn sang trọng đa dạng mẫu mã.', now(), now()),
('ca000012-0000-4000-8000-000000000102', 'ca000012-0000-4000-8000-000000000001', 'en', 'basins-sinks', 'Basins & Sinks', 'Premium countertop and under-counter basins in various styles.', now(), now())
ON CONFLICT (category_id, locale) DO NOTHING;

-- Danh mục con: Sen vòi & Bồn tắm
INSERT INTO public.product_categories (id, parent_id, group_key, status, sort_order, published_at, created_by, updated_by, created_at, updated_at)
VALUES ('ca000013-0000-4000-8000-000000000001', 'ca000010-0000-4000-8000-000000000001', 'sanitary_equipment', 'published', 2, now(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_category_translations (id, category_id, locale, slug, name, description, created_at, updated_at) VALUES
('ca000013-0000-4000-8000-000000000101', 'ca000013-0000-4000-8000-000000000001', 'vi', 'sen-voi-va-bon-tam', 'Sen vòi & Bồn tắm', 'Sen cây nhiệt độ, sen tắm đặt sàn, bồn tắm massage cao cấp.', now(), now()),
('ca000013-0000-4000-8000-000000000102', 'ca000013-0000-4000-8000-000000000001', 'en', 'showers-bathtubs', 'Showers & Bathtubs', 'Thermostatic shower systems, freestanding bathtubs, premium massage tubs.', now(), now())
ON CONFLICT (category_id, locale) DO NOTHING;


-- ─── NHÓM 3: GẠCH ỐP LÁT (tiles) ──────────────────────────────────────────

-- Danh mục gốc: Gạch ốp lát
INSERT INTO public.product_categories (id, group_key, status, sort_order, published_at, created_by, updated_by, created_at, updated_at)
VALUES ('ca000020-0000-4000-8000-000000000001', 'tiles', 'published', 2, now(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_category_translations (id, category_id, locale, slug, name, description, seo_title, seo_description, created_at, updated_at) VALUES
('ca000020-0000-4000-8000-000000000101', 'ca000020-0000-4000-8000-000000000001', 'vi', 'gach-op-lat', 'Gạch ốp lát', 'Các sản phẩm gạch men, gạch bóng kiếng, gạch mosaic và gạch sân vườn cao cấp.', 'Gạch ốp lát cao cấp nhập khẩu – Phương Đông', 'Chuyên cung cấp các loại gạch ốp lát tường, lát nền sang trọng nhập khẩu chính hãng.', now(), now()),
('ca000020-0000-4000-8000-000000000102', 'ca000020-0000-4000-8000-000000000001', 'en', 'tiles-cladding', 'Tiles & Cladding', 'Premium ceramic tiles, polished tiles, mosaic, and garden tiles.', 'Premium Tiles & Cladding – Phuong Dong', 'Specializing in luxurious imported and domestic wall and floor tiles.', now(), now())
ON CONFLICT (category_id, locale) DO NOTHING;

-- Danh mục con: Gạch lát nền
INSERT INTO public.product_categories (id, parent_id, group_key, status, sort_order, published_at, created_by, updated_by, created_at, updated_at)
VALUES ('ca000021-0000-4000-8000-000000000001', 'ca000020-0000-4000-8000-000000000001', 'tiles', 'published', 0, now(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_category_translations (id, category_id, locale, slug, name, description, created_at, updated_at) VALUES
('ca000021-0000-4000-8000-000000000101', 'ca000021-0000-4000-8000-000000000001', 'vi', 'gach-lat-nen', 'Gạch lát nền', 'Gạch lát sàn nhà phòng khách, phòng ngủ, nhà bếp đa dạng kích cỡ (60x60, 80x80, 60x120).', now(), now()),
('ca000021-0000-4000-8000-000000000102', 'ca000021-0000-4000-8000-000000000001', 'en', 'floor-tiles', 'Floor Tiles', 'Floor tiles for living rooms, bedrooms, kitchens in various sizes.', now(), now())
ON CONFLICT (category_id, locale) DO NOTHING;

-- Danh mục con: Gạch ốp tường
INSERT INTO public.product_categories (id, parent_id, group_key, status, sort_order, published_at, created_by, updated_by, created_at, updated_at)
VALUES ('ca000022-0000-4000-8000-000000000001', 'ca000020-0000-4000-8000-000000000001', 'tiles', 'published', 1, now(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_category_translations (id, category_id, locale, slug, name, description, created_at, updated_at) VALUES
('ca000022-0000-4000-8000-000000000101', 'ca000022-0000-4000-8000-000000000001', 'vi', 'gach-op-tuong', 'Gạch ốp tường', 'Gạch ốp tường nhà tắm, nhà bếp trang trí tinh tế.', now(), now()),
('ca000022-0000-4000-8000-000000000102', 'ca000022-0000-4000-8000-000000000001', 'en', 'wall-tiles', 'Wall Tiles', 'Decorative wall tiles for bathrooms and kitchens.', now(), now())
ON CONFLICT (category_id, locale) DO NOTHING;


-- ─── NHÓM 4: THIẾT BỊ KHÁC (project_solutions) ─────────────────────────────

-- Danh mục gốc: Thiết bị khác
INSERT INTO public.product_categories (id, group_key, status, sort_order, published_at, created_by, updated_by, created_at, updated_at)
VALUES ('ca000030-0000-4000-8000-000000000001', 'project_solutions', 'published', 3, now(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_category_translations (id, category_id, locale, slug, name, description, seo_title, seo_description, created_at, updated_at) VALUES
('ca000030-0000-4000-8000-000000000101', 'ca000030-0000-4000-8000-000000000001', 'vi', 'thiet-bi-khac', 'Thiết bị khác', 'Các thiết bị nhà bếp, khóa cửa điện tử thông minh và phụ kiện hoàn thiện công trình khác.', 'Thiết bị gia dụng & phụ kiện thông minh – Phương Đông', 'Cung cấp bếp từ, hút mùi, khóa cửa vân tay, đèn trang trí cao cấp.', now(), now()),
('ca000030-0000-4000-8000-000000000102', 'ca000030-0000-4000-8000-000000000001', 'en', 'other-equipment', 'Other Equipment', 'Kitchen appliances, smart digital door locks, and other finishing accessories.', 'Smart Appliances & Accessories – Phuong Dong', 'Providing induction hobs, range hoods, fingerprint smart locks, decorative lighting.', now(), now())
ON CONFLICT (category_id, locale) DO NOTHING;

-- Danh mục con: Thiết bị nhà bếp
INSERT INTO public.product_categories (id, parent_id, group_key, status, sort_order, published_at, created_by, updated_by, created_at, updated_at)
VALUES ('ca000031-0000-4000-8000-000000000001', 'ca000030-0000-4000-8000-000000000001', 'project_solutions', 'published', 0, now(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_category_translations (id, category_id, locale, slug, name, description, created_at, updated_at) VALUES
('ca000031-0000-4000-8000-000000000101', 'ca000031-0000-4000-8000-000000000001', 'vi', 'thiet-bi-nha-bep', 'Thiết bị nhà bếp', 'Bếp từ, máy hút mùi, lò nướng, lò vi sóng nhập khẩu chính hãng.', now(), now()),
('ca000031-0000-4000-8000-000000000102', 'ca000031-0000-4000-8000-000000000001', 'en', 'kitchen-appliances', 'Kitchen Appliances', 'Imported induction hobs, range hoods, ovens, and microwaves.', now(), now())
ON CONFLICT (category_id, locale) DO NOTHING;

-- Danh mục con: Khóa cửa thông minh
INSERT INTO public.product_categories (id, parent_id, group_key, status, sort_order, published_at, created_by, updated_by, created_at, updated_at)
VALUES ('ca000032-0000-4000-8000-000000000001', 'ca000030-0000-4000-8000-000000000001', 'project_solutions', 'published', 1, now(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_category_translations (id, category_id, locale, slug, name, description, created_at, updated_at) VALUES
('ca000032-0000-4000-8000-000000000101', 'ca000032-0000-4000-8000-000000000001', 'vi', 'khoa-cua-thong-minh', 'Khóa cửa thông minh', 'Khóa vân tay, khóa điện tử thông minh cao cấp từ Bosch, Philips, Kaadas.', now(), now()),
('ca000032-0000-4000-8000-000000000102', 'ca000032-0000-4000-8000-000000000001', 'en', 'smart-locks', 'Smart Locks', 'Premium fingerprint and digital smart locks from Bosch, Philips, Kaadas.', now(), now())
ON CONFLICT (category_id, locale) DO NOTHING;


-- ============================================================================
-- 2. THƯƠNG HIỆU (BRANDS)
-- ============================================================================

-- Kohler
INSERT INTO public.brands (id, slug, origin, status, sort_order, published_at, created_by, updated_by, created_at, updated_at)
VALUES ('br000001-0000-4000-8000-000000000001', 'kohler', 'Mỹ', 'published', 0, now(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.brand_translations (id, brand_id, locale, name, description, created_at, updated_at) VALUES
('br000001-0000-4000-8000-000000000101', 'br000001-0000-4000-8000-000000000001', 'vi', 'Kohler', 'Thương hiệu thiết bị vệ sinh hàng đầu thế giới từ Mỹ, thành lập năm 1873. Nổi tiếng với thiết kế tinh tế và công nghệ tiên tiến.', now(), now()),
('br000001-0000-4000-8000-000000000102', 'br000001-0000-4000-8000-000000000001', 'en', 'Kohler', 'The world''s leading sanitary ware brand from the USA, founded in 1873. Renowned for exquisite design and advanced technology.', now(), now())
ON CONFLICT (brand_id, locale) DO NOTHING;

-- TOTO
INSERT INTO public.brands (id, slug, origin, status, sort_order, published_at, created_by, updated_by, created_at, updated_at)
VALUES ('br000002-0000-4000-8000-000000000001', 'toto', 'Nhật Bản', 'published', 1, now(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.brand_translations (id, brand_id, locale, name, description, created_at, updated_at) VALUES
('br000002-0000-4000-8000-000000000101', 'br000002-0000-4000-8000-000000000001', 'vi', 'TOTO', 'Tập đoàn thiết bị vệ sinh Nhật Bản thành lập năm 1917. Tiên phong công nghệ Washlet và tiết kiệm nước.', now(), now()),
('br000002-0000-4000-8000-000000000102', 'br000002-0000-4000-8000-000000000001', 'en', 'TOTO', 'Japanese sanitary ware corporation founded in 1917. Pioneer of Washlet technology and water conservation.', now(), now())
ON CONFLICT (brand_id, locale) DO NOTHING;

-- American Standard
INSERT INTO public.brands (id, slug, origin, status, sort_order, published_at, created_by, updated_by, created_at, updated_at)
VALUES ('br000003-0000-4000-8000-000000000001', 'american-standard', 'Mỹ', 'published', 2, now(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.brand_translations (id, brand_id, locale, name, description, created_at, updated_at) VALUES
('br000003-0000-4000-8000-000000000101', 'br000003-0000-4000-8000-000000000001', 'vi', 'American Standard', 'Thương hiệu thiết bị vệ sinh Mỹ với hơn 150 năm lịch sử. Bền bỉ, đáng tin cậy, giá trị tốt.', now(), now()),
('br000003-0000-4000-8000-000000000102', 'br000003-0000-4000-8000-000000000001', 'en', 'American Standard', 'American sanitary ware brand with over 150 years of history. Durable, reliable and great value.', now(), now())
ON CONFLICT (brand_id, locale) DO NOTHING;

-- Inax
INSERT INTO public.brands (id, slug, origin, status, sort_order, published_at, created_by, updated_by, created_at, updated_at)
VALUES ('br000004-0000-4000-8000-000000000001', 'inax', 'Nhật Bản', 'published', 3, now(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.brand_translations (id, brand_id, locale, name, description, created_at, updated_at) VALUES
('br000004-0000-4000-8000-000000000101', 'br000004-0000-4000-8000-000000000001', 'vi', 'INAX', 'Thương hiệu sứ vệ sinh và gạch lát Nhật Bản. Chất lượng Nhật, phù hợp thị trường Đông Nam Á.', now(), now()),
('br000004-0000-4000-8000-000000000102', 'br000004-0000-4000-8000-000000000001', 'en', 'INAX', 'Japanese ceramic sanitaryware and tile brand. Japanese quality suited to the Southeast Asian market.', now(), now())
ON CONFLICT (brand_id, locale) DO NOTHING;

-- Hafele
INSERT INTO public.brands (id, slug, origin, status, sort_order, published_at, created_by, updated_by, created_at, updated_at)
VALUES ('br000005-0000-4000-8000-000000000001', 'hafele', 'Đức', 'published', 4, now(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.brand_translations (id, brand_id, locale, name, description, created_at, updated_at) VALUES
('br000005-0000-4000-8000-000000000101', 'br000005-0000-4000-8000-000000000001', 'vi', 'Häfele', 'Thương hiệu phụ kiện nội thất Đức. Bản lề, ray trượt, tay nắm, khóa tủ chất lượng cao cho đồ gỗ.', now(), now()),
('br000005-0000-4000-8000-000000000102', 'br000005-0000-4000-8000-000000000001', 'en', 'Häfele', 'German furniture hardware brand. Premium hinges, drawer runners, handles and locks for wood furniture.', now(), now())
ON CONFLICT (brand_id, locale) DO NOTHING;

-- ============================================================================
-- 3. DANH MỤC BLOG
-- ============================================================================

-- Danh mục: Kiến thức nội thất
INSERT INTO public.blog_categories (id, status, sort_order, published_at, created_by, updated_by, created_at, updated_at)
VALUES ('bc000001-0000-4000-8000-000000000001', 'published', 0, now(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.blog_category_translations (id, category_id, locale, slug, name, description, created_at, updated_at) VALUES
('bc000001-0000-4000-8000-000000000101', 'bc000001-0000-4000-8000-000000000001', 'vi', 'kien-thuc-noi-that', 'Kiến thức nội thất', 'Tổng hợp kiến thức hữu ích về nội thất, vật liệu và thiết bị vệ sinh.', now(), now()),
('bc000001-0000-4000-8000-000000000102', 'bc000001-0000-4000-8000-000000000001', 'en', 'furniture-knowledge', 'Furniture Knowledge', 'Useful knowledge about furniture, materials and sanitary ware.', now(), now())
ON CONFLICT (category_id, locale) DO NOTHING;

-- Danh mục: Xu hướng thiết kế
INSERT INTO public.blog_categories (id, status, sort_order, published_at, created_by, updated_by, created_at, updated_at)
VALUES ('bc000002-0000-4000-8000-000000000001', 'published', 1, now(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.blog_category_translations (id, category_id, locale, slug, name, description, created_at, updated_at) VALUES
('bc000002-0000-4000-8000-000000000101', 'bc000002-0000-4000-8000-000000000001', 'vi', 'xu-huong-thiet-ke', 'Xu hướng thiết kế', 'Cập nhật xu hướng thiết kế nội thất mới nhất trong nước và quốc tế.', now(), now()),
('bc000002-0000-4000-8000-000000000102', 'bc000002-0000-4000-8000-000000000001', 'en', 'design-trends', 'Design Trends', 'Latest interior design trends from Vietnam and around the world.', now(), now())
ON CONFLICT (category_id, locale) DO NOTHING;

-- Hướng dẫn chọn mua
INSERT INTO public.blog_categories (id, status, sort_order, published_at, created_by, updated_by, created_at, updated_at)
VALUES ('bc000003-0000-4000-8000-000000000001', 'published', 2, now(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.blog_category_translations (id, category_id, locale, slug, name, description, created_at, updated_at) VALUES
('bc000003-0000-4000-8000-000000000101', 'bc000003-0000-4000-8000-000000000001', 'vi', 'huong-dan-chon-mua', 'Hướng dẫn chọn mua', 'Tư vấn và hướng dẫn chọn mua sản phẩm nội thất phù hợp với không gian và ngân sách.', now(), now()),
('bc000003-0000-4000-8000-000000000102', 'bc000003-0000-4000-8000-000000000001', 'en', 'buying-guides', 'Buying Guides', 'Advice and guides for choosing the right furniture for your space and budget.', now(), now())
ON CONFLICT (category_id, locale) DO NOTHING;

-- Dự án & Thi công
INSERT INTO public.blog_categories (id, status, sort_order, published_at, created_by, updated_by, created_at, updated_at)
VALUES ('bc000004-0000-4000-8000-000000000001', 'published', 3, now(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.blog_category_translations (id, category_id, locale, slug, name, description, created_at, updated_at) VALUES
('bc000004-0000-4000-8000-000000000101', 'bc000004-0000-4000-8000-000000000001', 'vi', 'du-an-thi-cong', 'Dự án & Thi công', 'Các dự án nội thất đã hoàn thiện: nhà ở, căn hộ, khách sạn, văn phòng.', now(), now()),
('bc000004-0000-4000-8000-000000000001', 'bc000004-0000-4000-8000-000000000001', 'en', 'projects', 'Projects', 'Completed interior projects: houses, apartments, hotels, offices.', now(), now())
ON CONFLICT (category_id, locale) DO NOTHING;

-- ============================================================================
-- 4. BÀI VIẾT BLOG — STATUS DRAFT
-- ============================================================================

-- Bài viết 1: Sofa gỗ óc chó
INSERT INTO public.blog_posts (id, category_id, author_id, status, featured, created_by, updated_by, created_at, updated_at)
VALUES (
  'bp000001-0000-4000-8000-000000000001',
  'bc000001-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  'draft', true,
  'a0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  now(), now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.blog_post_translations (id, post_id, locale, slug, title, excerpt, body_json, created_at, updated_at) VALUES
('bp000001-0000-4000-8000-000000000101', 'bp000001-0000-4000-8000-000000000001', 'vi',
  'sofa-go-oc-cho-lua-chon-sang-trong-cho-phong-khach',
  'Sofa gỗ óc chó – Lựa chọn sang trọng cho phòng khách hiện đại',
  'Gỗ óc chó Bắc Mỹ được mệnh danh là "vua của các loại gỗ" nhờ vân gỗ đẹp và độ bền vượt trội. Cùng khám phá tại sao sofa gỗ óc chó là đầu tư thông minh cho không gian phòng khách của bạn.',
  '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Gỗ óc chó (Walnut) là một trong những loại gỗ cao cấp nhất thế giới, được ưa chuộng trong sản xuất đồ nội thất cao cấp nhờ vân gỗ tự nhiên đẹp mắt và độ bền bỉ theo thời gian.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"Đặc điểm nổi bật của gỗ óc chó","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"heading","tag":"h2","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Gỗ óc chó có màu nâu chocolate ấm áp, vân gỗ thẳng hoặc xoắn đặc trưng, rất cứng và ổn định theo thời gian. Đặc biệt, gỗ óc chó ít co ngót hơn nhiều loại gỗ khác, phù hợp với khí hậu nhiệt đới như Việt Nam.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}'::jsonb,
  now(), now()),
('bp000001-0000-4000-8000-000000000102', 'bp000001-0000-4000-8000-000000000001', 'en',
  'walnut-sofa-elegant-choice-for-modern-living-room',
  'Walnut Sofa – The Elegant Choice for a Modern Living Room',
  'North American walnut is dubbed the "king of woods" for its beautiful grain and outstanding durability. Discover why a walnut sofa is a smart investment for your living space.',
  '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Walnut wood is one of the most premium woods in the world, prized in high-end furniture production for its naturally beautiful grain and timeless durability.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}'::jsonb,
  now(), now())
ON CONFLICT (post_id, locale) DO NOTHING;

-- Bài viết 2: Hướng dẫn chọn bồn cầu
INSERT INTO public.blog_posts (id, category_id, author_id, status, featured, created_by, updated_by, created_at, updated_at)
VALUES (
  'bp000002-0000-4000-8000-000000000001',
  'bc000003-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  'draft', false,
  'a0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  now(), now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.blog_post_translations (id, post_id, locale, slug, title, excerpt, body_json, created_at, updated_at) VALUES
('bp000002-0000-4000-8000-000000000101', 'bp000002-0000-4000-8000-000000000001', 'vi',
  'huong-dan-chon-bon-cau-phu-hop-cho-nha-viet',
  'Hướng dẫn chọn bồn cầu phù hợp cho nhà người Việt',
  'Bồn cầu 1 khối hay 2 khối? Treo tường hay đặt sàn? Công nghệ xả nào tiết kiệm nhất? Bài viết này giúp bạn chọn đúng bồn cầu cho phòng tắm nhà mình.',
  '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Chọn bồn cầu không chỉ là vấn đề thẩm mỹ mà còn ảnh hưởng đến trải nghiệm sử dụng hàng ngày và chi phí nước lâu dài.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"Các loại bồn cầu phổ biến","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"heading","tag":"h2","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Bồn cầu 1 khối (one-piece): thân và bể chứa nước liền khối, dễ vệ sinh, thiết kế hiện đại. Bồn cầu 2 khối (two-piece): thân và bể chứa rời, dễ vận chuyển, giá thường mềm hơn. Bồn cầu treo tường: không có chân, treo lên tường, không gian sàn thông thoáng hơn.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}'::jsonb,
  now(), now()),
('bp000002-0000-4000-8000-000000000102', 'bp000002-0000-4000-8000-000000000001', 'en',
  'how-to-choose-the-right-toilet-for-your-home',
  'How to Choose the Right Toilet for Your Home',
  'One-piece or two-piece? Wall-hung or floor-standing? Which flush technology saves the most water? This guide helps you choose the right toilet for your bathroom.',
  '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Choosing a toilet is not just about aesthetics — it also affects your daily comfort and long-term water costs.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}'::jsonb,
  now(), now())
ON CONFLICT (post_id, locale) DO NOTHING;

-- Bài viết 3: Xu hướng nội thất 2026
INSERT INTO public.blog_posts (id, category_id, author_id, status, featured, created_by, updated_by, created_at, updated_at)
VALUES (
  'bp000003-0000-4000-8000-000000000001',
  'bc000002-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  'draft', true,
  'a0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  now(), now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.blog_post_translations (id, post_id, locale, slug, title, excerpt, body_json, created_at, updated_at) VALUES
('bp000003-0000-4000-8000-000000000101', 'bp000003-0000-4000-8000-000000000001', 'vi',
  'xu-huong-noi-that-2026-toi-gian-am-ap-thien-nhien',
  'Xu hướng nội thất 2026: Tối giản, ấm áp và gần gũi thiên nhiên',
  'Năm 2026, xu hướng nội thất toàn cầu tiếp tục hướng đến sự tối giản, sử dụng vật liệu tự nhiên và màu sắc đất. Biophilic design – thiết kế gắn kết với thiên nhiên – đang trở thành ngôn ngữ thiết kế chủ đạo.',
  '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Xu hướng nội thất 2026 tập trung vào 3 giá trị cốt lõi: tối giản (minimalism), ấm áp (warmth) và kết nối thiên nhiên (biophilic design).","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"1. Màu sắc đất – Earthy Tones","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"heading","tag":"h2","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Các tông màu nâu đất, kem, xanh rêu, terracotta và be đang thống trị bảng màu nội thất 2026. Những màu sắc này tạo cảm giác ấm cúng, gần gũi và bền với thời gian.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}'::jsonb,
  now(), now()),
('bp000003-0000-4000-8000-000000000102', 'bp000003-0000-4000-8000-000000000001', 'en',
  'interior-design-trends-2026-minimal-warm-natural',
  'Interior Design Trends 2026: Minimal, Warm and Close to Nature',
  'In 2026, global interior design trends continue to embrace minimalism, natural materials and earthy colors. Biophilic design — connecting spaces with nature — is becoming the dominant design language.',
  '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Interior design trends in 2026 focus on three core values: minimalism, warmth and biophilic design.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}'::jsonb,
  now(), now())
ON CONFLICT (post_id, locale) DO NOTHING;

-- ============================================================================
-- 5. SHOWROOM
-- ============================================================================

INSERT INTO public.showrooms (
  id, code, hotline,
  google_maps_embed_url, google_maps_fallback_url,
  latitude, longitude,
  province_code, province_name, ward_code, ward_name, street_address,
  status, sort_order, published_at,
  created_by, updated_by, created_at, updated_at
) VALUES (
  'sr000001-0000-4000-8000-000000000001',
  'HN-01',
  '1900 1234',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0!2d105.8!3d21.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDAw!5e0!3m2!1svi!2svn!4v1234567890',
  'https://maps.google.com/?q=21.0,105.8',
  21.0273390, 105.8341598,
  '01', 'Hà Nội', NULL, 'Phường Thanh Xuân Trung',
  '123 Nguyễn Trãi',
  'published', 0, now(),
  'a0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  now(), now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.showroom_translations (id, showroom_id, locale, name, address, opening_hours, created_at, updated_at) VALUES
('sr000001-0000-4000-8000-000000000101', 'sr000001-0000-4000-8000-000000000001', 'vi',
  'Showroom Nội Thất Phương Đông – Hà Nội',
  '123 Nguyễn Trãi, Phường Thanh Xuân Trung, Quận Thanh Xuân, Hà Nội',
  'Thứ 2 – Thứ 7: 8:00 – 20:00 | Chủ nhật: 9:00 – 18:00',
  now(), now()),
('sr000001-0000-4000-8000-000000000102', 'sr000001-0000-4000-8000-000000000001', 'en',
  'Phuong Dong Furniture Showroom – Hanoi',
  '123 Nguyen Trai, Thanh Xuan Trung Ward, Thanh Xuan District, Hanoi',
  'Mon – Sat: 8:00 AM – 8:00 PM | Sun: 9:00 AM – 6:00 PM',
  now(), now())
ON CONFLICT (showroom_id, locale) DO NOTHING;

-- ============================================================================

SET session_replication_role = DEFAULT;
COMMIT;
