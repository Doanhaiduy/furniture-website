CREATE OR REPLACE FUNCTION "public"."public_products"("p_locale" "text" DEFAULT 'vi'::"text", "p_category_slug" "text" DEFAULT NULL::"text", "p_group_key" "text" DEFAULT NULL::"text", "p_q" "text" DEFAULT NULL::"text", "p_price_min" numeric DEFAULT NULL::numeric, "p_price_max" numeric DEFAULT NULL::numeric, "p_attribute_filters" "jsonb" DEFAULT '{}'::"jsonb", "p_featured" boolean DEFAULT NULL::boolean, "p_limit" integer DEFAULT 24, "p_offset" integer DEFAULT 0, "p_brand_slug" "text" DEFAULT NULL::"text", "p_has_discount" boolean DEFAULT NULL::boolean) RETURNS TABLE("id" "uuid", "reference_code" "text", "slug" "text", "name" "text", "summary" "text", "description_json" "jsonb", "material" "text", "price_display_text" "text", "dimension_display_text" "text", "category_id" "uuid", "category_slug" "text", "category_name" "text", "group_key" "text", "price_min" numeric, "price_max" numeric, "currency" "text", "brand_id" "uuid", "brand_name" "text", "brand_series" "text", "featured" boolean, "published_at" timestamp with time zone, "primary_media" "jsonb", "media" "jsonb", "specs" "jsonb", "attributes" "jsonb", "promo_price_min" numeric, "promo_price_max" numeric, "specifications" "jsonb", "custom_attributes" "jsonb", "showroom_code" "text", "price_unit" "text")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
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
    COALESCE(pt.description_json, '[]'::jsonb)  AS specs,
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
    -- Promo pricing (item 1): derived from the active promotion, not a stored column.
    CASE WHEN disc.discount IS NOT NULL AND p.price_min IS NOT NULL
      THEN ROUND(p.price_min * (1 - disc.discount / 100.0), 2) ELSE NULL END AS promo_price_min,
    CASE WHEN disc.discount IS NOT NULL AND p.price_max IS NOT NULL
      THEN ROUND(p.price_max * (1 - disc.discount / 100.0), 2) ELSE NULL END AS promo_price_max,
    COALESCE(p.specifications, '{}'::jsonb)  AS specifications,
    COALESCE(p.custom_attributes, '[]'::jsonb) AS custom_attributes,
    p.showroom_code::text,
    p.price_unit::text
  FROM products p
  JOIN LATERAL (
    SELECT t.*
    FROM product_translations t
    WHERE t.product_id = p.id
    ORDER BY (t.locale = v_locale::public.locale_code) DESC,
             (t.locale = 'vi'::public.locale_code) DESC,
             t.created_at
    LIMIT 1
  ) pt ON TRUE
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
  LEFT JOIN LATERAL (
    SELECT public.get_active_discount_percentage(p.id) AS discount
  ) disc ON TRUE
  WHERE
    p.status = 'published'
    AND p.deleted_at IS NULL
    AND pc.deleted_at IS NULL
    AND pc.status = 'published'::public.publish_status
    AND (p_category_slug IS NULL OR pct.slug = p_category_slug)
    AND (p_group_key IS NULL OR pc.group_key::text = p_group_key)
    AND (p_brand_slug IS NULL OR b.slug = p_brand_slug)
    AND (
      p_q IS NULL
      OR pt.name ILIKE '%' || p_q || '%'
      OR pt.summary ILIKE '%' || p_q || '%'
      OR p.reference_code ILIKE '%' || p_q || '%'
    )
    AND (p_price_min IS NULL OR p.price_min >= p_price_min)
    AND (p_price_max IS NULL OR p.price_min IS NULL OR p.price_min <= p_price_max)
    AND (p_featured IS NULL OR p.featured = p_featured)
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

ALTER FUNCTION "public"."public_products"("p_locale" "text", "p_category_slug" "text", "p_group_key" "text", "p_q" "text", "p_price_min" numeric, "p_price_max" numeric, "p_attribute_filters" "jsonb", "p_featured" boolean, "p_limit" integer, "p_offset" integer, "p_brand_slug" "text", "p_has_discount" boolean) OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."public_products"("p_locale" "text", "p_category_slug" "text", "p_group_key" "text", "p_q" "text", "p_price_min" numeric, "p_price_max" numeric, "p_attribute_filters" "jsonb", "p_featured" boolean, "p_limit" integer, "p_offset" integer, "p_brand_slug" "text", "p_has_discount" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."public_products"("p_locale" "text", "p_category_slug" "text", "p_group_key" "text", "p_q" "text", "p_price_min" numeric, "p_price_max" numeric, "p_attribute_filters" "jsonb", "p_featured" boolean, "p_limit" integer, "p_offset" integer, "p_brand_slug" "text", "p_has_discount" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."public_products"("p_locale" "text", "p_category_slug" "text", "p_group_key" "text", "p_q" "text", "p_price_min" numeric, "p_price_max" numeric, "p_attribute_filters" "jsonb", "p_featured" boolean, "p_limit" integer, "p_offset" integer, "p_brand_slug" "text", "p_has_discount" boolean) TO "service_role";
