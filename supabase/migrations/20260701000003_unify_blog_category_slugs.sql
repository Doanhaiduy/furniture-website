-- =============================================================================
-- Migration: Unify blog category slugs to Vietnamese
-- Date: 2026-07-01
-- Purpose:
--   - blog_category_translations: en slug = vi slug (vi is source of truth)
--   - Has UNIQUE(locale, slug) constraint so we handle safely
-- =============================================================================

-- Step 1: For each blog category, set en slug = vi slug
-- Safe approach: direct UPDATE (same locale row, not creating new rows)
UPDATE public.blog_category_translations bct_en
SET slug = bct_vi.slug
FROM public.blog_category_translations bct_vi
WHERE bct_vi.category_id = bct_en.category_id
  AND bct_vi.locale = 'vi'
  AND bct_en.locale = 'en'
  AND bct_en.slug != bct_vi.slug;

-- Verification
DO $$
DECLARE
  mismatch_count INT;
BEGIN
  SELECT COUNT(*)
  INTO mismatch_count
  FROM public.blog_category_translations vi_t
  JOIN public.blog_category_translations en_t
    ON vi_t.category_id = en_t.category_id
    AND vi_t.locale = 'vi'
    AND en_t.locale = 'en'
  WHERE vi_t.slug != en_t.slug;

  IF mismatch_count > 0 THEN
    RAISE WARNING 'Still % blog categories have mismatched vi/en slugs', mismatch_count;
  ELSE
    RAISE NOTICE 'SUCCESS: All blog category vi/en slugs are now unified';
  END IF;
END $$;
