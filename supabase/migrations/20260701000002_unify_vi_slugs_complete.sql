-- =============================================================================
-- Migration: Unify all product & category slugs to Vietnamese (v2 - complete)
-- Date: 2026-07-01
-- Purpose:
--   - Both 'vi' and 'en' locales share the SAME Vietnamese slug
--   - Source of truth: vi translation slug
--   - This eliminates 404 errors and slug mismatches across all locales
-- =============================================================================

-- Step 1: For each product, set en slug = vi slug (vi is source of truth)
-- We do this with a single UPDATE joining product_translations to itself

UPDATE public.product_translations pt_en
SET slug = pt_vi.slug
FROM public.product_translations pt_vi
WHERE pt_vi.product_id = pt_en.product_id
  AND pt_vi.locale = 'vi'
  AND pt_en.locale = 'en'
  AND pt_en.slug != pt_vi.slug;

-- Step 2: For each category, set en slug = vi slug
UPDATE public.product_category_translations pct_en
SET slug = pct_vi.slug
FROM public.product_category_translations pct_vi
WHERE pct_vi.category_id = pct_en.category_id
  AND pct_vi.locale = 'vi'
  AND pct_en.locale = 'en'
  AND pct_en.slug != pct_vi.slug;

-- Step 3: Special fix - PD-54 vi slug also needs update (from basin-modern-pd-54 → lavabo-hien-dai-pd-54-kohler)
-- Already handled in migration 20260701000001 and seed update, but just in case:
UPDATE public.product_translations
SET slug = 'lavabo-hien-dai-pd-54-kohler'
WHERE product_id = '00000001-0000-0000-0000-000000000054'
  AND slug = 'basin-modern-pd-54';

-- Verification: Show all products where vi slug != en slug (should be 0 rows)
DO $$
DECLARE
  mismatch_count INT;
BEGIN
  SELECT COUNT(*)
  INTO mismatch_count
  FROM public.product_translations pt_vi
  JOIN public.product_translations pt_en
    ON pt_vi.product_id = pt_en.product_id
    AND pt_vi.locale = 'vi'
    AND pt_en.locale = 'en'
  WHERE pt_vi.slug != pt_en.slug;

  IF mismatch_count > 0 THEN
    RAISE WARNING 'Still % products have mismatched vi/en slugs', mismatch_count;
  ELSE
    RAISE NOTICE 'SUCCESS: All product vi/en slugs are now unified';
  END IF;
END $$;
