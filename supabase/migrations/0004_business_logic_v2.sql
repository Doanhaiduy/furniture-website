-- 0004_business_logic_v2.sql
-- Follow-up business-logic decisions (owner-approved) after the 0003 audit:
--
--   1. Promo pricing is consolidated on the campaign (Promotions) mechanism. The
--      per-product manual promo_price_min/max override is removed: list
--      (public_products) and detail (getProductBySlug) both now derive the
--      discounted price from the product's active, published Promotion via the
--      same DB function, so the two views can never disagree again.
--
--   2. promotion_targets (category/brand-wide promotions) is dropped. It was never
--      wired to any app code, and had it been used it would have bypassed the
--      overlap-prevention trigger (which only inspects product_promotions).
--
--   3. Deactivating a blog author's profile no longer hides their published posts.
--      Posts are editorial assets, independent of the author's employment status.
--
--   4. New publish-time guards:
--      4.1 blog posts require a cover image,
--      4.2 at most 8 blog posts can be featured + published at once,
--      4.3 promotions require a start date,
--      4.4 a quote marked "spam" cannot jump straight to closed/qualified — it must
--          be reopened to new/contacted first,
--      4.6 product/blog publish requires translations to have real content, not
--          just non-null JSON (mirrors the existing client-side isBodyEmpty check).

-- ════════════════════════════════════════════════════════════════════════════
-- 1. PROMO PRICING: SINGLE SOURCE OF TRUTH = ACTIVE PROMOTIONS
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION "public"."get_active_discount_percentage"("p_product_id" "uuid") RETURNS numeric
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  SELECT MAX(promo.discount_percentage)
  FROM public.product_promotions pp
  JOIN public.promotions promo ON promo.id = pp.promotion_id
  WHERE pp.product_id = p_product_id
    AND promo.status = 'published'
    AND promo.deleted_at IS NULL
    AND promo.discount_percentage IS NOT NULL
    AND (promo.start_at IS NULL OR promo.start_at <= now())
    AND (promo.end_at IS NULL OR promo.end_at >= now());
$$;

COMMENT ON FUNCTION "public"."get_active_discount_percentage"("uuid") IS 'Best (max) discount_percentage among a products currently-active published promotions. Single source of truth for promo pricing, used by both public_products (list) and the product detail reader so list/detail never disagree.';

-- ── public_products ─────────────────────────────────────────────────────────
-- Same signature as 0003; only the promo_price_min/max computation changes from
-- reading the (now-removed) stored column to deriving it from the active promotion.
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

-- The manual per-product override is decommissioned. Drop the CHECK constraint first
-- (it references these columns), then the columns themselves.
ALTER TABLE "public"."products" DROP CONSTRAINT IF EXISTS "chk_products_promo_price";
ALTER TABLE "public"."products" DROP COLUMN IF EXISTS "promo_price_min";
ALTER TABLE "public"."products" DROP COLUMN IF EXISTS "promo_price_max";

-- ════════════════════════════════════════════════════════════════════════════
-- 2. DROP promotion_targets (never wired to any app code; would have bypassed
--    the product_promotions-only overlap check if it had been used)
-- ════════════════════════════════════════════════════════════════════════════

-- Rewrite the one function that referenced it, dropping the category/brand/"all"
-- target branches (dead code paths — no row was ever inserted into promotion_targets)
-- and keeping only the direct product_promotions link.
CREATE OR REPLACE FUNCTION "public"."get_active_promotions_for_product"("p_product_id" "uuid") RETURNS TABLE("promotion_id" "uuid", "code" "text", "discount_percentage" numeric, "combo_price" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  return query
  select distinct
    p.id as promotion_id,
    p.code,
    p.discount_percentage,
    p.combo_price
  from public.promotions p
  join public.product_promotions pp on pp.promotion_id = p.id
  where p.status = 'published'
    and p.deleted_at is null
    and (p.start_at is null or p.start_at <= now())
    and (p.end_at is null or p.end_at >= now())
    and pp.product_id = p_product_id;
end;
$$;

DROP TABLE IF EXISTS "public"."promotion_targets" CASCADE;

-- ════════════════════════════════════════════════════════════════════════════
-- 3. BLOG POSTS STAY PUBLIC WHEN THE AUTHOR'S ACCOUNT IS DEACTIVATED
-- ════════════════════════════════════════════════════════════════════════════
-- Posts are editorial assets, not the author's personal content — deactivating a
-- staff account (e.g. they left the company) must not silently pull their published
-- work off the site. Only a soft-deleted profile still removes attribution safety
-- (deleted_at IS NULL keeps; is_active is no longer part of the filter).
CREATE OR REPLACE FUNCTION "public"."public_blog_posts"("p_locale" "public"."locale_code" DEFAULT 'vi'::"public"."locale_code", "p_category_slug" "text" DEFAULT NULL::"text", "p_q" "text" DEFAULT NULL::"text", "p_featured" boolean DEFAULT NULL::boolean, "p_limit" integer DEFAULT 12, "p_offset" integer DEFAULT 0) RETURNS TABLE("id" "uuid", "slug" "text", "title" "text", "excerpt" "text", "body_json" "jsonb", "seo_title" "text", "seo_description" "text", "category_id" "uuid", "category_slug" "text", "category_name" "text", "author_id" "uuid", "author_name" "text", "featured" boolean, "published_at" timestamp with time zone, "cover_media" "jsonb")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'pg_temp'
    AS $$
  with params as (
    select
      public.compact_text(p_category_slug) as category_slug,
      public.compact_text(p_q) as q
  )
  select
    bp.id,
    bpt.slug,
    bpt.title,
    bpt.excerpt,
    bpt.body_json,
    bpt.seo_title,
    bpt.seo_description,
    bc.id as category_id,
    bct.slug as category_slug,
    bct.name as category_name,
    bp.author_id,
    prof.full_name as author_name,
    bp.featured,
    bp.published_at,
    case
      when ma.id is null then null
      else jsonb_build_object(
        'id', ma.id,
        'url', ma.public_url,
        'resourceType', ma.resource_type,
        'mimeType', ma.mime_type,
        'width', ma.width,
        'height', ma.height,
        'altText', mat.alt_text,
        'caption', mat.caption
      )
    end as cover_media
  from public.blog_posts bp
  join lateral (
    select t.*
    from public.blog_post_translations t
    where t.post_id = bp.id
    order by (t.locale = p_locale) desc, (t.locale = 'vi'::public.locale_code) desc, t.created_at
    limit 1
  ) bpt on true
  join public.blog_categories bc
    on bc.id = bp.category_id
    and bc.status = 'published'::public.publish_status
    and bc.deleted_at is null
  join lateral (
    select t.*
    from public.blog_category_translations t
    where t.category_id = bc.id
    order by (t.locale = p_locale) desc, (t.locale = 'vi'::public.locale_code) desc, t.created_at
    limit 1
  ) bct on true
  join public.profiles prof
    on prof.id = bp.author_id
    and prof.deleted_at is null
  left join public.media_assets ma
    on ma.id = bp.cover_media_id
    and ma.status = 'active'::public.media_status
    and ma.deleted_at is null
  left join public.media_asset_translations mat
    on mat.media_id = ma.id
    and mat.locale = p_locale
  cross join params params
  where bp.status = 'published'::public.publish_status
    and bp.deleted_at is null
    and (params.category_slug is null or bct.slug = params.category_slug)
    and (p_featured is null or bp.featured = p_featured)
    and (
      params.q is null
      or bpt.search_text @@ plainto_tsquery('simple', public.immutable_unaccent(lower(params.q)))
      or public.immutable_unaccent(lower(concat_ws(' ', bpt.title, bpt.excerpt, bct.name, prof.full_name)))
        like '%' || public.immutable_unaccent(lower(params.q)) || '%'
    )
  order by bp.featured desc, bp.published_at desc, bp.id
  limit least(greatest(coalesce(p_limit, 12), 1), 50)
  offset greatest(coalesce(p_offset, 0), 0);
$$;

-- ════════════════════════════════════════════════════════════════════════════
-- 4.1 / 4.2 BLOG PUBLISH REQUIREMENTS: COVER IMAGE + FEATURED CAP (max 8)
-- ════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION "public"."check_blog_post_publish_requirements"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_featured_count int;
BEGIN
  IF NEW.status = 'published'::public.publish_status THEN
    IF NEW.cover_media_id IS NULL THEN
      RAISE EXCEPTION 'Cannot publish a blog post without a cover image' USING ERRCODE = '23514';
    END IF;

    IF NEW.featured THEN
      SELECT count(*) INTO v_featured_count
      FROM public.blog_posts
      WHERE featured
        AND status = 'published'::public.publish_status
        AND deleted_at IS NULL
        AND id <> NEW.id;
      IF v_featured_count >= 8 THEN
        RAISE EXCEPTION 'At most 8 blog posts can be featured at once' USING ERRCODE = '23514';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION "public"."check_blog_post_publish_requirements"() IS 'Publish-time guards for blog_posts: requires a cover image, and caps published+featured posts at 8.';

DROP TRIGGER IF EXISTS "trg_blog_posts_publish_requirements" ON "public"."blog_posts";
CREATE TRIGGER "trg_blog_posts_publish_requirements"
  BEFORE INSERT OR UPDATE OF "status", "featured", "cover_media_id" ON "public"."blog_posts"
  FOR EACH ROW EXECUTE FUNCTION "public"."check_blog_post_publish_requirements"();

-- ════════════════════════════════════════════════════════════════════════════
-- 4.3 PROMOTIONS REQUIRE A START DATE TO PUBLISH
-- ════════════════════════════════════════════════════════════════════════════
-- A NULL start_at ("always on") made it too easy to publish an incomplete campaign
-- by accident. Enforced at publish time only, so existing drafts are unaffected.
CREATE OR REPLACE FUNCTION "public"."check_promotion_publish_requirements"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.status = 'published'::public.publish_status AND NEW.start_at IS NULL THEN
    RAISE EXCEPTION 'Cannot publish a promotion without a start date' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "trg_promotions_publish_requirements" ON "public"."promotions";
CREATE TRIGGER "trg_promotions_publish_requirements"
  BEFORE INSERT OR UPDATE OF "status", "start_at" ON "public"."promotions"
  FOR EACH ROW EXECUTE FUNCTION "public"."check_promotion_publish_requirements"();

-- ════════════════════════════════════════════════════════════════════════════
-- 4.4 QUOTE REOPEN GUARD: SPAM CANNOT JUMP STRAIGHT TO CLOSED/QUALIFIED
-- ════════════════════════════════════════════════════════════════════════════
-- Same signature/behavior as 0003's update_quote_status, plus one extra guard:
-- a lead flagged as spam must be re-triaged (reopened to new/contacted) before it
-- can be marked closed or qualified — it must not skip straight to a "won" outcome.
CREATE OR REPLACE FUNCTION "public"."update_quote_status"("p_quote_id" "uuid", "p_new_status" "text", "p_note" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_old_status text;
  v_user_id    uuid;
  v_deleted_at timestamptz;
  v_note       text := p_note;
  v_is_reopen  boolean;
  v_terminal   text[] := ARRAY['closed', 'cancelled', 'spam'];
  v_open       text[] := ARRAY['new', 'contacted', 'qualified'];
  v_allowed_statuses text[] := ARRAY['new', 'contacted', 'qualified', 'closed', 'cancelled', 'spam'];
BEGIN
  SELECT id INTO v_user_id FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active AND deleted_at IS NULL;
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: admin only');
  END IF;

  IF NOT (p_new_status = ANY(v_allowed_statuses)) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid status: ' || p_new_status);
  END IF;

  SELECT status::text, deleted_at INTO v_old_status, v_deleted_at
  FROM public.quote_requests WHERE id = p_quote_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Quote not found');
  END IF;

  IF v_deleted_at IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Quote is archived and cannot change status');
  END IF;

  -- Reopen guard (item 4.4): spam must be re-triaged before it can be closed/qualified.
  IF v_old_status = 'spam' AND p_new_status = ANY(ARRAY['closed', 'qualified']) THEN
    RETURN jsonb_build_object('success', false, 'error', 'A lead marked as spam must be reopened to "new" or "contacted" before it can be closed or qualified');
  END IF;

  v_is_reopen := (v_old_status = ANY(v_terminal)) AND (p_new_status = ANY(v_open));
  IF v_is_reopen AND public.compact_text(v_note) IS NULL THEN
    v_note := 'Mở lại yêu cầu (reopen)';
  END IF;

  UPDATE public.quote_requests
    SET status = p_new_status::public.quote_status, updated_at = now()
  WHERE id = p_quote_id;

  INSERT INTO public.quote_request_events (quote_request_id, actor_id, old_status, new_status, note)
  VALUES (p_quote_id, v_user_id, v_old_status::public.quote_status, p_new_status::public.quote_status, v_note);

  RETURN jsonb_build_object('success', true, 'quote_id', p_quote_id, 'from_status', v_old_status, 'to_status', p_new_status, 'reopened', v_is_reopen);
END;
$$;

-- ════════════════════════════════════════════════════════════════════════════
-- 4.6 PUBLISH REQUIRES MEANINGFUL TRANSLATION CONTENT, NOT JUST NON-NULL JSON
-- ════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION "public"."jsonb_has_meaningful_content"("v" "jsonb") RETURNS boolean
    LANGUAGE "sql" IMMUTABLE PARALLEL SAFE
    AS $$
  SELECT CASE
    WHEN v IS NULL THEN false
    WHEN jsonb_typeof(v) = 'object' AND v ? 'content' AND jsonb_typeof(v -> 'content') = 'array'
      THEN jsonb_array_length(v -> 'content') > 0
    WHEN jsonb_typeof(v) = 'array' THEN jsonb_array_length(v) > 0
    WHEN jsonb_typeof(v) = 'object' THEN (SELECT count(*) FROM jsonb_object_keys(v)) > 0
    WHEN jsonb_typeof(v) = 'string' THEN length(btrim(v #>> '{}')) > 0
    ELSE true
  END;
$$;

COMMENT ON FUNCTION "public"."jsonb_has_meaningful_content"("jsonb") IS 'True unless the JSON value is null, {}, [], a doc-shape object ({type, content:[]}) with an empty content array, or a blank string. Mirrors the client-side isBodyEmpty() check so publish is blocked consistently client- and server-side.';

CREATE OR REPLACE FUNCTION "public"."require_publish_translations"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  translation_count int;
begin
  if new.status <> 'published'::public.publish_status then
    return new;
  end if;

  case tg_table_name
    when 'content_pages' then
      select count(distinct locale)
      into translation_count
      from public.content_page_translations
      where page_id = new.id
        and locale in ('vi'::public.locale_code, 'en'::public.locale_code)
        and public.compact_text(slug) is not null
        and public.compact_text(title) is not null;

    when 'product_categories' then
      select count(distinct locale)
      into translation_count
      from public.product_category_translations
      where category_id = new.id
        and locale in ('vi'::public.locale_code, 'en'::public.locale_code)
        and public.compact_text(slug) is not null
        and public.compact_text(name) is not null;

    when 'products' then
      select count(distinct locale)
      into translation_count
      from public.product_translations
      where product_id = new.id
        and locale in ('vi'::public.locale_code, 'en'::public.locale_code)
        and public.compact_text(slug) is not null
        and public.compact_text(name) is not null
        and public.compact_text(summary) is not null
        and description_json is not null
        and public.jsonb_has_meaningful_content(description_json);

    when 'product_attribute_definitions' then
      select count(distinct locale)
      into translation_count
      from public.product_attribute_definition_translations
      where definition_id = new.id
        and locale in ('vi'::public.locale_code, 'en'::public.locale_code)
        and public.compact_text(label) is not null;

    when 'product_attribute_options' then
      select count(distinct locale)
      into translation_count
      from public.product_attribute_option_translations
      where option_id = new.id
        and locale in ('vi'::public.locale_code, 'en'::public.locale_code)
        and public.compact_text(label) is not null;

    when 'blog_categories' then
      select count(distinct locale)
      into translation_count
      from public.blog_category_translations
      where category_id = new.id
        and locale in ('vi'::public.locale_code, 'en'::public.locale_code)
        and public.compact_text(slug) is not null
        and public.compact_text(name) is not null;

    when 'blog_posts' then
      select count(distinct locale)
      into translation_count
      from public.blog_post_translations
      where post_id = new.id
        and locale in ('vi'::public.locale_code, 'en'::public.locale_code)
        and public.compact_text(slug) is not null
        and public.compact_text(title) is not null
        and public.compact_text(excerpt) is not null
        and body_json is not null
        and public.jsonb_has_meaningful_content(body_json);

    when 'showrooms' then
      select count(distinct locale)
      into translation_count
      from public.showroom_translations
      where showroom_id = new.id
        and locale in ('vi'::public.locale_code, 'en'::public.locale_code)
        and public.compact_text(name) is not null
        and public.compact_text(address) is not null;

    else
      translation_count := 2;
  end case;

  if translation_count < 2 then
    raise exception 'Cannot publish %.% without required vi and en translations', tg_table_schema, tg_table_name
      using errcode = '23514';
  end if;

  return new;
end;
$$;
