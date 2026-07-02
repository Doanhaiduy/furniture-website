-- =============================================================================
-- Migration: Unify all product & category slugs to Vietnamese
-- Date: 2026-07-01
-- Purpose:
--   - Both 'vi' and 'en' locales now share a single Vietnamese slug
--   - This eliminates 404 errors from locale-specific slug mismatches
--   - Canonical URL pattern: /{locale}/products/{vi-slug}
-- =============================================================================

-- ---- PRODUCT TRANSLATIONS: Unify slugs to Vietnamese ----

-- P01: Sofa Curve Velour Heritage → slug already good, keep as-is
UPDATE public.product_translations
SET slug = 'sofa-curve-velour-heritage'
WHERE product_id = '00000001-0000-0000-0000-000000000011'
  AND locale = 'en'
  AND slug != 'sofa-curve-velour-heritage';

-- P02: Sofa Da Bò Ý → slug already good, keep as-is
UPDATE public.product_translations
SET slug = 'sofa-da-bo-y-3-cho'
WHERE product_id = '00000001-0000-0000-0000-000000000012'
  AND locale = 'en'
  AND slug != 'sofa-da-bo-y-3-cho';

-- P03: Bàn Trà Marble → slug already good
UPDATE public.product_translations
SET slug = 'ban-tra-da-marble-calacatta'
WHERE product_id = '00000001-0000-0000-0000-000000000013'
  AND locale = 'en'
  AND slug != 'ban-tra-da-marble-calacatta';

-- P04: Kệ Tivi Nordic → slug already good
UPDATE public.product_translations
SET slug = 'ke-tivi-go-soi-nordic'
WHERE product_id = '00000001-0000-0000-0000-000000000014'
  AND locale = 'en'
  AND slug != 'ke-tivi-go-soi-nordic';

-- P05: Bàn Ăn Walnut Live Edge → slug already good
UPDATE public.product_translations
SET slug = 'ban-an-walnut-live-edge'
WHERE product_id = '00000001-0000-0000-0000-000000000015'
  AND locale = 'en'
  AND slug != 'ban-an-walnut-live-edge';

-- P06: Ghế Ăn Da Bò Ý → slug already good
UPDATE public.product_translations
SET slug = 'ghe-an-boc-da-bo-y'
WHERE product_id = '00000001-0000-0000-0000-000000000016'
  AND locale = 'en'
  AND slug != 'ghe-an-boc-da-bo-y';

-- P07: Giường Ngủ Luxury Velvet → slug already good
UPDATE public.product_translations
SET slug = 'giuong-ngu-luxury-velvet'
WHERE product_id = '00000001-0000-0000-0000-000000000017'
  AND locale = 'en'
  AND slug != 'giuong-ngu-luxury-velvet';

-- P08: Tủ Quần Áo Kịch Trần Walnut → slug already good
UPDATE public.product_translations
SET slug = 'tu-quan-ao-kich-tran-walnut'
WHERE product_id = '00000001-0000-0000-0000-000000000018'
  AND locale = 'en'
  AND slug != 'tu-quan-ao-kich-tran-walnut';

-- P09: Bồn Tắm Bravat Wellness → slug already good
UPDATE public.product_translations
SET slug = 'bon-tam-doc-lap-bravat-wellness'
WHERE product_id = '00000001-0000-0000-0000-000000000021'
  AND locale = 'en'
  AND slug != 'bon-tam-doc-lap-bravat-wellness';

-- P10: Bồn Cầu Kohler Veil → slug already good
UPDATE public.product_translations
SET slug = 'bon-cau-kohler-veil-intelligent'
WHERE product_id = '00000001-0000-0000-0000-000000000022'
  AND locale = 'en'
  AND slug != 'bon-cau-kohler-veil-intelligent';

-- P11: Lavabo Kohler PD-54 → CRITICAL FIX: change from 'basin-modern-pd-54' to Vietnamese slug
-- Both vi and en get the same Vietnamese slug
UPDATE public.product_translations
SET slug = 'lavabo-hien-dai-pd-54-kohler'
WHERE product_id = '00000001-0000-0000-0000-000000000054';

-- P12: Sen Tắm Grohe 24K → slug already good
UPDATE public.product_translations
SET slug = 'sen-tam-grohe-24k-gold'
WHERE product_id = '00000001-0000-0000-0000-000000000024'
  AND locale = 'en'
  AND slug != 'sen-tam-grohe-24k-gold';

-- P13: Vòi Lavabo Kohler Purist → slug already good
UPDATE public.product_translations
SET slug = 'voi-lavabo-kohler-purist'
WHERE product_id = '00000001-0000-0000-0000-000000000025'
  AND locale = 'en'
  AND slug != 'voi-lavabo-kohler-purist';

-- P14: Bồn Tắm American Standard Acrylic → slug already good
UPDATE public.product_translations
SET slug = 'bon-tam-american-standard-acrylic'
WHERE product_id = '00000001-0000-0000-0000-000000000035'
  AND locale = 'en'
  AND slug != 'bon-tam-american-standard-acrylic';

-- P15: Bồn Cầu TOTO Washlet → slug already good
UPDATE public.product_translations
SET slug = 'bon-cau-toto-washlet'
WHERE product_id = '00000001-0000-0000-0000-000000000033'
  AND locale = 'en'
  AND slug != 'bon-cau-toto-washlet';

-- P16: Gạch Porcelain Calacatta Gold → slug already good
UPDATE public.product_translations
SET slug = 'gach-porcelain-calacatta-gold-80x160'
WHERE product_id = '00000001-0000-0000-0000-000000000031'
  AND locale = 'en'
  AND slug != 'gach-porcelain-calacatta-gold-80x160';

-- P17: Gạch Mosaic Nghệ Thuật → slug already good
UPDATE public.product_translations
SET slug = 'gach-mosaic-nghe-thuat'
WHERE product_id = '00000001-0000-0000-0000-000000000032'
  AND locale = 'en'
  AND slug != 'gach-mosaic-nghe-thuat';

-- ---- CATEGORY TRANSLATIONS: Unify root category slugs to Vietnamese ----
-- Root categories: only 'en' translations need updating to match 'vi' slug

-- Đồ gỗ nội thất: en 'wooden-furniture' → 'do-go-noi-that'
UPDATE public.product_category_translations
SET slug = 'do-go-noi-that'
WHERE category_id = 'a4fa9181-2c31-4f76-bd60-fb5a195075bf'
  AND locale = 'en'
  AND slug != 'do-go-noi-that';

-- Thiết bị vệ sinh: en 'sanitary-equipment' → 'thiet-bi-ve-sinh'
UPDATE public.product_category_translations
SET slug = 'thiet-bi-ve-sinh'
WHERE category_id = 'a0c8312c-f869-4317-807c-af42d32c2239'
  AND locale = 'en'
  AND slug != 'thiet-bi-ve-sinh';

-- Gạch ốp lát: en 'tiles' → 'gach-op-lat'
UPDATE public.product_category_translations
SET slug = 'gach-op-lat'
WHERE category_id = 'a1111111-1111-1111-1111-111111111111'
  AND locale = 'en'
  AND slug != 'gach-op-lat';

-- Subcategories: Wooden Furniture
-- sofa: both already 'sofa', keep as-is
-- coffee-table: both already 'coffee-table', keep as-is
-- tv-cabinet: both already 'tv-cabinet', keep as-is
-- dining-table: both already 'dining-table', keep as-is
-- chair: both already 'chair', keep as-is
-- bed: both already 'bed', keep as-is
-- wardrobe: en 'smart-wardrobes' → 'wardrobe'
UPDATE public.product_category_translations
SET slug = 'wardrobe'
WHERE category_id = 'c0000000-0000-0000-0000-000000000017'
  AND locale = 'en'
  AND slug != 'wardrobe';

-- Subcategories: Sanitary Equipment
-- bathtub: both already 'bathtub', keep as-is
-- toilet: both already 'toilet', keep as-is
-- basin: both already 'basin', keep as-is
-- shower: both already 'shower', keep as-is
-- faucet: both already 'faucet', keep as-is

-- Subcategories: Tiles
-- floor: both already 'floor', keep as-is
-- wall: both already 'wall', keep as-is

-- ---- VERIFICATION ----
SELECT 
  pt.product_id,
  pt.locale,
  pt.slug,
  pt.name
FROM public.product_translations pt
ORDER BY pt.product_id, pt.locale;
