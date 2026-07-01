-- Migration: Add custom attributes and specifications columns to products and update public_products RPC
-- Date: 20260630

BEGIN;

-- 1. Add JSONB columns to public.products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS custom_attributes jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS specifications jsonb DEFAULT '{}'::jsonb;

-- 2. Drop all known signatures of public_products to recreate it with the two new columns
DROP FUNCTION IF EXISTS public_products(text, text, text, text, numeric, numeric, jsonb, boolean, int, int, text, boolean);

CREATE OR REPLACE FUNCTION public_products(
  p_locale          text      DEFAULT 'vi',
  p_category_slug   text      DEFAULT NULL,
  p_group_key       text      DEFAULT NULL,
  p_q               text      DEFAULT NULL,
  p_price_min       numeric   DEFAULT NULL,
  p_price_max       numeric   DEFAULT NULL,
  p_attribute_filters jsonb   DEFAULT '{}',
  p_featured        boolean   DEFAULT NULL,
  p_limit           int       DEFAULT 24,
  p_offset          int       DEFAULT 0,
  p_brand_slug      text      DEFAULT NULL,
  p_has_discount    boolean   DEFAULT NULL
)
RETURNS TABLE (
  id                  uuid,
  reference_code      text,
  slug                text,
  name                text,
  summary             text,
  description_json    jsonb,
  material            text,
  price_display_text  text,
  dimension_display_text text,
  category_id         uuid,
  category_slug       text,
  category_name       text,
  group_key           text,
  price_min           numeric,
  price_max           numeric,
  currency            text,
  brand_id            uuid,
  brand_name          text,
  brand_series        text,
  featured            boolean,
  published_at        timestamptz,
  primary_media       jsonb,
  media               jsonb,
  specs               jsonb,
  attributes          jsonb,
  promo_price_min     numeric,
  promo_price_max     numeric,
  specifications      jsonb,
  custom_attributes   jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_locale text := COALESCE(p_locale, 'vi');
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.reference_code,
    COALESCE(pt.slug, p.id::text)            AS slug,
    COALESCE(pt.name, '')                    AS name,
    COALESCE(pt.summary, '')                 AS summary,
    COALESCE(pt.description_json, '{}'::jsonb) AS description_json,
    COALESCE(pt.material, '')                AS material,
    COALESCE(pt.price_display_text, '')      AS price_display_text,
    COALESCE(pt.dimension_display_text, '')  AS dimension_display_text,
    pc.id                                    AS category_id,
    COALESCE(pct.slug, '')                   AS category_slug,
    COALESCE(pct.name, pct.slug)             AS category_name,
    pc.group_key::text,
    p.price_min,
    p.price_max,
    p.currency::text,
    b.id                                     AS brand_id,
    COALESCE(bt.name, b.slug)                AS brand_name,
    COALESCE(p.brand_series, '')             AS brand_series,
    p.featured,
    p.published_at,
    -- Primary media with safe alt_text translation join
    (
      SELECT jsonb_build_object('url', ma.public_url, 'altText', COALESCE(mat.alt_text, ''))
      FROM product_media pm_a
      JOIN media_assets ma ON ma.id = pm_a.media_id
      LEFT JOIN media_asset_translations mat
        ON mat.media_id = ma.id
        AND mat.locale = v_locale::public.locale_code
      WHERE pm_a.product_id = p.id AND pm_a.is_primary = true
      LIMIT 1
    )                                        AS primary_media,
    -- All media with safe alt_text translation join
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object('url', ma2.public_url, 'altText', COALESCE(mat2.alt_text, ''))
        ORDER BY pm2.sort_order
      )
      FROM product_media pm2
      JOIN media_assets ma2 ON ma2.id = pm2.media_id
      LEFT JOIN media_asset_translations mat2
        ON mat2.media_id = ma2.id
        AND mat2.locale = v_locale::public.locale_code
      WHERE pm2.product_id = p.id
    ), '[]'::jsonb)                          AS media,
    -- Specs from description_json (used by product cards)
    COALESCE(pt.description_json, '[]'::jsonb)  AS specs,
    -- Attributes from product_attribute_values (correct table name)
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'key',   pad.key,
        'label', COALESCE(padt.label, pad.key),
        'value', COALESCE(
          paot.label,
          pav.value_text_vi,
          pav.value_text_en,
          pav.value_number::text,
          pav.value_boolean::text
        )
      ))
      FROM product_attribute_values pav
      JOIN product_attribute_definitions pad
        ON pad.id = pav.attribute_definition_id
        AND pad.deleted_at IS NULL
      LEFT JOIN product_attribute_definition_translations padt
        ON padt.definition_id = pad.id
        AND padt.locale = v_locale::public.locale_code
      LEFT JOIN product_attribute_options pao
        ON pao.id = pav.attribute_option_id
        AND pao.deleted_at IS NULL
      LEFT JOIN product_attribute_option_translations paot
        ON paot.option_id = pao.id
        AND paot.locale = v_locale::public.locale_code
      WHERE pav.product_id = p.id
    ), '[]'::jsonb)                          AS attributes,
    -- Promo prices
    p.promo_price_min,
    p.promo_price_max,
    COALESCE(p.specifications, '{}'::jsonb)  AS specifications,
    COALESCE(p.custom_attributes, '[]'::jsonb) AS custom_attributes
  FROM products p
  JOIN product_translations pt
    ON pt.product_id = p.id
    AND pt.locale = v_locale::public.locale_code
  JOIN product_categories pc
    ON pc.id = p.category_id
  LEFT JOIN product_category_translations pct
    ON pct.category_id = pc.id
    AND pct.locale = v_locale::public.locale_code
  LEFT JOIN brands b
    ON b.id = p.brand_id
  LEFT JOIN brand_translations bt
    ON bt.brand_id = b.id
    AND bt.locale = v_locale::public.locale_code
  WHERE
    p.status = 'published'
    AND p.deleted_at IS NULL
    AND pc.deleted_at IS NULL
    -- Category filter
    AND (p_category_slug IS NULL OR pct.slug = p_category_slug)
    -- Group key filter
    AND (p_group_key IS NULL OR pc.group_key::text = p_group_key)
    -- Brand filter
    AND (p_brand_slug IS NULL OR b.slug = p_brand_slug)
    -- Full-text search
    AND (
      p_q IS NULL
      OR pt.name ILIKE '%' || p_q || '%'
      OR pt.summary ILIKE '%' || p_q || '%'
      OR p.reference_code ILIKE '%' || p_q || '%'
    )
    -- Price range
    AND (p_price_min IS NULL OR p.price_min >= p_price_min)
    AND (p_price_max IS NULL OR p.price_max <= p_price_max)
    -- Featured filter
    AND (p_featured IS NULL OR p.featured = p_featured)
    -- Has discount filter: product has at least one active promotion
    AND (
      p_has_discount IS NULL
      OR (
        p_has_discount = true
        AND EXISTS (
          SELECT 1
          FROM product_promotions pp2
          JOIN promotions promo ON promo.id = pp2.promotion_id
          WHERE pp2.product_id = p.id
            AND promo.status = 'published'
            AND (promo.start_at IS NULL OR promo.start_at <= now())
            AND (promo.end_at IS NULL OR promo.end_at >= now())
        )
      )
    )
    -- Attribute filters (JSONB key-value matching)
    AND (
      p_attribute_filters IS NULL
      OR p_attribute_filters = '{}'::jsonb
      OR (
        SELECT bool_and(
          EXISTS (
            SELECT 1
            FROM product_attribute_values pav2
            JOIN product_attribute_definitions pad2
              ON pad2.id = pav2.attribute_definition_id
              AND pad2.deleted_at IS NULL
            WHERE pav2.product_id = p.id
              AND pad2.key = kv.key
              AND (
                kv.value = COALESCE(pav2.value_text_vi, pav2.value_text_en, pav2.value_number::text, pav2.value_boolean::text)
              )
          )
        )
        FROM jsonb_each_text(p_attribute_filters) kv
      )
    )
  ORDER BY p.featured DESC, p.published_at DESC NULLS LAST
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public_products(text, text, text, text, numeric, numeric, jsonb, boolean, int, int, text, boolean) TO anon, authenticated;

COMMIT;
