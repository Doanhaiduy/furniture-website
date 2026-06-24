-- Migration for Phase 2: RPCs Clean and Alignment

BEGIN;

-- 1. Drop all known overloaded versions of public_products function to prevent PostgREST PGRST203 conflict
DROP FUNCTION IF EXISTS public.public_products(public.locale_code, text, public.product_group_key, text, numeric, numeric, jsonb, boolean, integer, integer);
DROP FUNCTION IF EXISTS public.public_products(public.locale_code, text, public.product_group_key, text, numeric, numeric, jsonb, boolean, integer);
DROP FUNCTION IF EXISTS public.public_products(text, text, text, text, numeric, numeric, jsonb, boolean, integer, integer);

-- 2. Drop and redefine public_promotions to use text parameter for p_locale
-- This resolves PostgREST enum type cast errors and aligns with p_locale used in public_products.
DROP FUNCTION IF EXISTS public.public_promotions(public.locale_code);
DROP FUNCTION IF EXISTS public.public_promotions();
DROP FUNCTION IF EXISTS public.public_promotions(text);

CREATE OR REPLACE FUNCTION public.public_promotions(
  p_locale text DEFAULT 'vi'
)
RETURNS TABLE (
  id uuid,
  code text,
  discount_percentage numeric,
  start_at timestamptz,
  end_at timestamptz,
  title text,
  description text,
  combo_price numeric,
  original_price numeric,
  cover_image_url text,
  metadata_jsonb jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.code,
    p.discount_percentage,
    p.start_at,
    p.end_at,
    pt.title,
    pt.description,
    p.combo_price,
    p.original_price,
    m.public_url AS cover_image_url,
    p.metadata_jsonb
  FROM public.promotions p
  JOIN public.promotion_translations pt
    ON pt.promotion_id = p.id
    AND pt.locale = p_locale::public.locale_code
  LEFT JOIN public.media_assets m
    ON m.id = p.cover_media_id
  WHERE p.status = 'published'::public.publish_status
    AND p.deleted_at IS NULL
    AND (p.start_at IS NULL OR p.start_at <= now())
    AND (p.end_at IS NULL OR p.end_at >= now())
  ORDER BY p.created_at DESC;
END;
$$;

-- Grant execute permissions to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.public_promotions(text) TO anon, authenticated;

COMMIT;
