

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."ai_draft_status" AS ENUM (
    'draft',
    'accepted',
    'discarded'
);


ALTER TYPE "public"."ai_draft_status" OWNER TO "postgres";


COMMENT ON TYPE "public"."ai_draft_status" IS 'Human review status for draft-only AI output.';



CREATE TYPE "public"."ai_target_type" AS ENUM (
    'product',
    'blog_post',
    'content_page',
    'seo',
    'translation'
);


ALTER TYPE "public"."ai_target_type" OWNER TO "postgres";


COMMENT ON TYPE "public"."ai_target_type" IS 'AI draft target category. target_id is polymorphic and cannot be enforced by a single FK.';



CREATE TYPE "public"."cms_role" AS ENUM (
    'admin',
    'editor'
);


ALTER TYPE "public"."cms_role" OWNER TO "postgres";


COMMENT ON TYPE "public"."cms_role" IS 'CMS roles. Role Model Option A: editor manages publishable content only; admin manages privileged data.';



CREATE TYPE "public"."locale_code" AS ENUM (
    'vi',
    'en'
);


ALTER TYPE "public"."locale_code" OWNER TO "postgres";


COMMENT ON TYPE "public"."locale_code" IS 'Supported public content locales.';



CREATE TYPE "public"."media_resource_type" AS ENUM (
    'image',
    'video'
);


ALTER TYPE "public"."media_resource_type" OWNER TO "postgres";


COMMENT ON TYPE "public"."media_resource_type" IS 'Media types allowed by the launch design.';



CREATE TYPE "public"."media_status" AS ENUM (
    'active',
    'archived'
);


ALTER TYPE "public"."media_status" OWNER TO "postgres";


COMMENT ON TYPE "public"."media_status" IS 'Reusable media lifecycle status.';



CREATE TYPE "public"."notification_status" AS ENUM (
    'pending',
    'sent',
    'failed',
    'skipped'
);


ALTER TYPE "public"."notification_status" OWNER TO "postgres";


COMMENT ON TYPE "public"."notification_status" IS 'Quote notification delivery status.';



CREATE TYPE "public"."product_group_key" AS ENUM (
    'wooden_furniture',
    'sanitary_equipment',
    'tiles',
    'project_solutions'
);


ALTER TYPE "public"."product_group_key" OWNER TO "postgres";


COMMENT ON TYPE "public"."product_group_key" IS 'Top-level public product group identifiers.';



CREATE TYPE "public"."publish_status" AS ENUM (
    'draft',
    'published',
    'archived'
);


ALTER TYPE "public"."publish_status" OWNER TO "postgres";


COMMENT ON TYPE "public"."publish_status" IS 'Publish lifecycle for public content.';



CREATE TYPE "public"."quote_status" AS ENUM (
    'new',
    'contacted',
    'qualified',
    'closed',
    'spam',
    'cancelled'
);


ALTER TYPE "public"."quote_status" OWNER TO "postgres";


COMMENT ON TYPE "public"."quote_status" IS 'Private quote lead workflow status.';



CREATE TYPE "public"."social_platform" AS ENUM (
    'facebook',
    'zalo',
    'youtube',
    'tiktok',
    'instagram',
    'other'
);


ALTER TYPE "public"."social_platform" OWNER TO "postgres";


COMMENT ON TYPE "public"."social_platform" IS 'Configured public social link platform.';



CREATE TYPE "public"."storage_provider" AS ENUM (
    'supabase_storage',
    'cloudinary'
);


ALTER TYPE "public"."storage_provider" OWNER TO "postgres";


COMMENT ON TYPE "public"."storage_provider" IS 'Media metadata provider. Supports Supabase Storage and Cloudinary.';



CREATE OR REPLACE FUNCTION "public"."admin_quote_search"("p_status" "public"."quote_status" DEFAULT NULL::"public"."quote_status", "p_keyword" "text" DEFAULT NULL::"text", "p_date_from" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_date_to" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_source_path" "text" DEFAULT NULL::"text", "p_assigned_to" "uuid" DEFAULT NULL::"uuid", "p_limit" integer DEFAULT 50, "p_offset" integer DEFAULT 0) RETURNS TABLE("id" "uuid", "full_name" "text", "phone" "text", "email" "text", "company" "text", "service" "text", "message" "text", "preferred_locale" "public"."locale_code", "product_id" "uuid", "category_id" "uuid", "source_path" "text", "source_url" "text", "status" "public"."quote_status", "assigned_to" "uuid", "admin_notes" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "deleted_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'pg_temp'
    AS $$
declare
  v_keyword text := public.compact_text(p_keyword);
  v_limit int := least(greatest(coalesce(p_limit, 50), 1), 200);
  v_offset int := greatest(coalesce(p_offset, 0), 0);
begin
  if not public.can_manage_private_admin_data() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  return query
  select
    qr.id,
    qr.full_name,
    qr.phone,
    qr.email,
    qr.company,
    qr.service,
    qr.message,
    qr.preferred_locale,
    qr.product_id,
    qr.category_id,
    qr.source_path,
    qr.source_url,
    qr.status,
    qr.assigned_to,
    qr.admin_notes,
    qr.created_at,
    qr.updated_at,
    qr.deleted_at
  from public.quote_requests qr
  where qr.deleted_at is null
    and (p_status is null or qr.status = p_status)
    and (p_date_from is null or qr.created_at >= p_date_from)
    and (p_date_to is null or qr.created_at < p_date_to)
    and (p_source_path is null or qr.source_path = p_source_path)
    and (p_assigned_to is null or qr.assigned_to = p_assigned_to)
    and (
      v_keyword is null
      or public.immutable_unaccent(lower(concat_ws(
        ' ',
        qr.full_name,
        qr.phone,
        qr.email,
        qr.company,
        qr.service,
        qr.message,
        qr.admin_notes,
        qr.source_path
      ))) like '%' || public.immutable_unaccent(lower(v_keyword)) || '%'
    )
  order by qr.created_at desc
  limit v_limit
  offset v_offset;
end;
$$;


ALTER FUNCTION "public"."admin_quote_search"("p_status" "public"."quote_status", "p_keyword" "text", "p_date_from" timestamp with time zone, "p_date_to" timestamp with time zone, "p_source_path" "text", "p_assigned_to" "uuid", "p_limit" integer, "p_offset" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."admin_quote_search"("p_status" "public"."quote_status", "p_keyword" "text", "p_date_from" timestamp with time zone, "p_date_to" timestamp with time zone, "p_source_path" "text", "p_assigned_to" "uuid", "p_limit" integer, "p_offset" integer) IS 'Admin-only quote lead search by status, keyword, date range, source path, and assignee.';



CREATE OR REPLACE FUNCTION "public"."can_manage_private_admin_data"() RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  select public.is_admin() or public.is_service_role();
$$;


ALTER FUNCTION "public"."can_manage_private_admin_data"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."can_manage_private_admin_data"() IS 'Role Model Option A helper: admin/service can manage private leads, users, settings and audit data.';



CREATE OR REPLACE FUNCTION "public"."can_manage_publishable_content"() RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  select public.is_editor() or public.is_service_role();
$$;


ALTER FUNCTION "public"."can_manage_publishable_content"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."can_manage_publishable_content"() IS 'Role Model Option A helper: editor/admin/service can manage publishable content.';



CREATE OR REPLACE FUNCTION "public"."compact_text"("input" "text") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE PARALLEL SAFE
    AS $$
  select nullif(regexp_replace(btrim(coalesce(input, '')), '\s+', ' ', 'g'), '');
$$;


ALTER FUNCTION "public"."compact_text"("input" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."compact_text"("input" "text") IS 'Trims text, collapses repeated whitespace, and returns null for blank values.';



CREATE OR REPLACE FUNCTION "public"."current_profile_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE
    AS $$
  select auth.uid();
$$;


ALTER FUNCTION "public"."current_profile_id"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."current_profile_id"() IS 'Returns the authenticated Supabase user/profile id from auth.uid().';



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
  left join public.promotion_targets pt on pt.promotion_id = p.id
  left join public.product_promotions pp on pp.promotion_id = p.id
  where p.status = 'published'
    and p.deleted_at is null
    and (p.start_at is null or p.start_at <= now())
    and (p.end_at is null or p.end_at >= now())
    and (
      pt.target_type = 'all'
      or (pt.target_type = 'product' and pt.target_id = p_product_id)
      or (pt.target_type = 'category' and pt.target_id in (
        select category_id from public.products where id = p_product_id
      ))
      or (pt.target_type = 'brand' and pt.target_id in (
        select brand_id from public.products where id = p_product_id
      ))
      or pp.product_id = p_product_id
    );
end;
$$;


ALTER FUNCTION "public"."get_active_promotions_for_product"("p_product_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_quote_status_logs"("p_quote_id" "uuid") RETURNS TABLE("id" "uuid", "quote_id" "uuid", "from_status" "text", "to_status" "text", "changed_by_name" "text", "note" "text", "created_at" timestamp with time zone)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  -- SECURITY: this SECURITY DEFINER function bypasses RLS on quote_request_events and
  -- profiles and exposes lead status history + staff PII (changed_by_name). It is admin-
  -- only; the guard below returns zero rows for any non-admin caller. EXECUTE is also
  -- revoked from anon (see GRANTs). Mirrors the gating on admin_quote_search.
  SELECT
    qre.id,
    qre.quote_request_id AS quote_id,
    qre.old_status::text AS from_status,
    qre.new_status::text AS to_status,
    COALESCE(p.full_name, p.email::text, 'Hệ thống') AS changed_by_name,
    qre.note,
    qre.created_at
  FROM public.quote_request_events qre
  LEFT JOIN public.profiles p ON p.id = qre.actor_id
  WHERE qre.quote_request_id = p_quote_id
    AND public.can_manage_private_admin_data()
  ORDER BY qre.created_at ASC;
$$;


ALTER FUNCTION "public"."get_quote_status_logs"("p_quote_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."immutable_unaccent"("input" "text") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE PARALLEL SAFE
    AS $$
  select extensions.unaccent(coalesce(input, ''));
$$;


ALTER FUNCTION "public"."immutable_unaccent"("input" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."immutable_unaccent"("input" "text") IS 'Immutable wrapper for unaccent, used by trigram/search indexes. Reindex if dictionary config changes.';



CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'::public.cms_role
      and p.is_active
      and p.deleted_at is null
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_admin"() IS 'True when the authenticated user has an active admin profile. SECURITY DEFINER avoids recursive profile RLS checks.';



CREATE OR REPLACE FUNCTION "public"."is_editor"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin'::public.cms_role, 'editor'::public.cms_role)
      and p.is_active
      and p.deleted_at is null
  );
$$;


ALTER FUNCTION "public"."is_editor"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_editor"() IS 'True when the authenticated user has an active admin or editor profile.';



CREATE OR REPLACE FUNCTION "public"."is_own_profile"("profile_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  select auth.uid() is not null and auth.uid() = profile_id;
$$;


ALTER FUNCTION "public"."is_own_profile"("profile_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_own_profile"("profile_id" "uuid") IS 'True when a row belongs to the authenticated user.';



CREATE OR REPLACE FUNCTION "public"."is_service_role"() RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  select coalesce(auth.role(), '') = 'service_role';
$$;


ALTER FUNCTION "public"."is_service_role"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_service_role"() IS 'True when the current JWT role is Supabase service_role. Service role also bypasses RLS by default.';



CREATE OR REPLACE FUNCTION "public"."prevent_update_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  raise exception '% rows are append-only', tg_table_name
    using errcode = '42501';
end;
$$;


ALTER FUNCTION "public"."prevent_update_delete"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."prevent_update_delete"() IS 'Blocks UPDATE/DELETE on append-only operational tables when attached as a trigger.';



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
  join public.blog_post_translations bpt
    on bpt.post_id = bp.id
    and bpt.locale = p_locale
  join public.blog_categories bc
    on bc.id = bp.category_id
    and bc.status = 'published'::public.publish_status
    and bc.deleted_at is null
  join public.blog_category_translations bct
    on bct.category_id = bc.id
    and bct.locale = p_locale
  join public.profiles prof
    on prof.id = bp.author_id
    and prof.is_active
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


ALTER FUNCTION "public"."public_blog_posts"("p_locale" "public"."locale_code", "p_category_slug" "text", "p_q" "text", "p_featured" boolean, "p_limit" integer, "p_offset" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."public_blog_posts"("p_locale" "public"."locale_code", "p_category_slug" "text", "p_q" "text", "p_featured" boolean, "p_limit" integer, "p_offset" integer) IS 'Public blog reader. Returns only published, non-deleted posts with localized fields and safe media metadata.';



CREATE OR REPLACE FUNCTION "public"."public_products"("p_locale" "text" DEFAULT 'vi'::"text", "p_category_slug" "text" DEFAULT NULL::"text", "p_group_key" "text" DEFAULT NULL::"text", "p_q" "text" DEFAULT NULL::"text", "p_price_min" numeric DEFAULT NULL::numeric, "p_price_max" numeric DEFAULT NULL::numeric, "p_attribute_filters" "jsonb" DEFAULT '{}'::"jsonb", "p_featured" boolean DEFAULT NULL::boolean, "p_limit" integer DEFAULT 24, "p_offset" integer DEFAULT 0, "p_brand_slug" "text" DEFAULT NULL::"text", "p_has_discount" boolean DEFAULT NULL::boolean) RETURNS TABLE("id" "uuid", "reference_code" "text", "slug" "text", "name" "text", "summary" "text", "description_json" "jsonb", "material" "text", "price_display_text" "text", "dimension_display_text" "text", "category_id" "uuid", "category_slug" "text", "category_name" "text", "group_key" "text", "price_min" numeric, "price_max" numeric, "currency" "text", "brand_id" "uuid", "brand_name" "text", "brand_series" "text", "featured" boolean, "published_at" timestamp with time zone, "primary_media" "jsonb", "media" "jsonb", "specs" "jsonb", "attributes" "jsonb", "promo_price_min" numeric, "promo_price_max" numeric, "specifications" "jsonb", "custom_attributes" "jsonb", "showroom_code" "text", "price_unit" "text", "brand_slug" "text")
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
    -- Primary media
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
    -- All media
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
    -- Specs from description_json
    COALESCE(pt.description_json, '[]'::jsonb)  AS specs,
    -- Attributes
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
    p.promo_price_min,
    p.promo_price_max,
    COALESCE(p.specifications, '{}'::jsonb)  AS specifications,
    COALESCE(p.custom_attributes, '[]'::jsonb) AS custom_attributes,
    p.showroom_code::text,
    p.price_unit::text,
    b.slug AS brand_slug
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
    -- Featured filter
    AND (p_featured IS NULL OR p.featured = p_featured)
    -- Has discount filter
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
    -- Attribute filters
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


CREATE OR REPLACE FUNCTION "public"."public_promotions"("p_locale" "text" DEFAULT 'vi'::"text") RETURNS TABLE("id" "uuid", "code" "text", "discount_percentage" numeric, "start_at" timestamp with time zone, "end_at" timestamp with time zone, "title" "text", "description" "text", "combo_price" numeric, "original_price" numeric, "cover_image_url" "text", "metadata_jsonb" "jsonb")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'pg_temp'
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


ALTER FUNCTION "public"."public_promotions"("p_locale" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."public_showrooms"("p_locale" "public"."locale_code" DEFAULT 'vi'::"public"."locale_code") RETURNS TABLE("id" "uuid", "code" "text", "name" "text", "address" "text", "opening_hours" "text", "hotline" "text", "google_maps_embed_url" "text", "google_maps_fallback_url" "text", "latitude" numeric, "longitude" numeric, "primary_media" "jsonb", "media" "jsonb")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'pg_temp'
    AS $$
  select
    s.id,
    s.code,
    st.name,
    st.address,
    st.opening_hours,
    s.hotline,
    s.google_maps_embed_url,
    s.google_maps_fallback_url,
    s.latitude,
    s.longitude,
    (
      select jsonb_build_object(
        'id', ma.id,
        'url', ma.public_url,
        'resourceType', ma.resource_type,
        'mimeType', ma.mime_type,
        'width', ma.width,
        'height', ma.height,
        'altText', mat.alt_text,
        'caption', mat.caption
      )
      from public.showroom_media sm
      join public.media_assets ma
        on ma.id = sm.media_id
        and ma.status = 'active'::public.media_status
        and ma.deleted_at is null
      left join public.media_asset_translations mat
        on mat.media_id = ma.id
        and mat.locale = p_locale
      where sm.showroom_id = s.id
      order by sm.is_primary desc, sm.sort_order, sm.created_at
      limit 1
    ) as primary_media,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', ma.id,
          'url', ma.public_url,
          'resourceType', ma.resource_type,
          'mimeType', ma.mime_type,
          'width', ma.width,
          'height', ma.height,
          'isPrimary', sm.is_primary,
          'altText', mat.alt_text,
          'caption', mat.caption
        )
        order by sm.is_primary desc, sm.sort_order, sm.created_at
      )
      from public.showroom_media sm
      join public.media_assets ma
        on ma.id = sm.media_id
        and ma.status = 'active'::public.media_status
        and ma.deleted_at is null
      left join public.media_asset_translations mat
        on mat.media_id = ma.id
        and mat.locale = p_locale
      where sm.showroom_id = s.id
    ), '[]'::jsonb) as media
  from public.showrooms s
  join public.showroom_translations st
    on st.showroom_id = s.id
    and st.locale = p_locale
  where s.status = 'published'::public.publish_status
    and s.deleted_at is null
  order by s.sort_order, s.created_at, s.id;
$$;


ALTER FUNCTION "public"."public_showrooms"("p_locale" "public"."locale_code") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."public_showrooms"("p_locale" "public"."locale_code") IS 'Public showroom reader. Returns only published, non-deleted showrooms with localized address and safe map/media fields.';



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
        and description_json is not null;

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
        and body_json is not null;

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


ALTER FUNCTION "public"."require_publish_translations"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."require_publish_translations"() IS 'Blocks publishing public content unless required vi and en translation rows exist. Also keep server-side publish validation in the CMS/API layer.';



CREATE OR REPLACE FUNCTION "public"."set_blog_post_translation_search_text"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.search_text = public.to_simple_tsvector(
    new.title,
    new.excerpt,
    new.seo_title,
    new.seo_description
  );
  return new;
end;
$$;


ALTER FUNCTION "public"."set_blog_post_translation_search_text"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."set_blog_post_translation_search_text"() IS 'Maintains blog_post_translations.search_text for localized blog search.';



CREATE OR REPLACE FUNCTION "public"."set_product_archive_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.status = 'archived'::public.publish_status
     and (tg_op = 'INSERT' or old.status is distinct from 'archived'::public.publish_status)
  then
    new.archived_at = coalesce(new.archived_at, now());
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."set_product_archive_timestamp"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."set_product_archive_timestamp"() IS 'Sets products.archived_at when a product first transitions to archived.';



CREATE OR REPLACE FUNCTION "public"."set_product_translation_search_text"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.search_text = public.to_simple_tsvector(
    new.name,
    new.summary,
    new.material,
    new.price_display_text,
    new.dimension_display_text
  );
  return new;
end;
$$;


ALTER FUNCTION "public"."set_product_translation_search_text"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."set_product_translation_search_text"() IS 'Maintains product_translations.search_text for localized product search.';



CREATE OR REPLACE FUNCTION "public"."set_publish_timestamps"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.status = 'published'::public.publish_status
     and (tg_op = 'INSERT' or old.status is distinct from 'published'::public.publish_status)
  then
    new.published_at = coalesce(new.published_at, now());
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."set_publish_timestamps"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."set_publish_timestamps"() IS 'Sets published_at when a publishable row first transitions to published.';



CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."set_updated_at"() IS 'BEFORE UPDATE trigger function that keeps updated_at current.';



CREATE OR REPLACE FUNCTION "public"."submit_quote_request"("payload" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'pg_temp'
    AS $_$
declare
  v_locale_text text;
  v_full_name text;
  v_phone text;
  v_email text;
  v_company text;
  v_service text;
  v_message text;
  v_source_path text;
  v_source_url text;
  v_product_id_text text;
  v_category_id_text text;
  v_product_id uuid;
  v_category_id uuid;
  v_quote_id uuid;
  v_headers jsonb;
  v_user_agent text;
  v_ip_hash text;
begin
  if payload is null or jsonb_typeof(payload) <> 'object' then
    raise exception 'payload must be a JSON object' using errcode = '22023';
  end if;

  -- Honeypot submissions are treated as successful but are not persisted.
  if public.compact_text(payload->>'honeypot') is not null then
    return jsonb_build_object('submitted', true);
  end if;

  v_locale_text := coalesce(
    public.compact_text(payload->>'preferred_locale'),
    public.compact_text(payload->>'preferredLocale'),
    public.compact_text(payload->>'locale'),
    'vi'
  );

  if v_locale_text not in ('vi', 'en') then
    raise exception 'preferred locale must be vi or en' using errcode = '22023';
  end if;

  v_full_name := left(public.compact_text(coalesce(payload->>'full_name', payload->>'fullName')), 160);
  v_phone := left(public.compact_text(payload->>'phone'), 32);
  v_email := lower(left(public.compact_text(payload->>'email'), 320));
  v_company := left(public.compact_text(payload->>'company'), 180);
  v_service := left(public.compact_text(payload->>'service'), 120);
  v_message := left(public.compact_text(payload->>'message'), 5000);
  v_source_path := left(public.compact_text(coalesce(payload->>'source_path', payload->>'sourcePath')), 2048);
  v_source_url := left(public.compact_text(coalesce(payload->>'source_url', payload->>'sourceUrl')), 2048);
  v_product_id_text := public.compact_text(coalesce(payload->>'product_id', payload->>'productId'));
  v_category_id_text := public.compact_text(coalesce(payload->>'category_id', payload->>'categoryId'));

  begin
    v_headers := nullif(current_setting('request.headers', true), '')::jsonb;
  exception
    when others then
      v_headers := '{}'::jsonb;
  end;

  v_user_agent := left(coalesce(
    public.compact_text(v_headers->>'user-agent'),
    public.compact_text(payload->>'user_agent'),
    public.compact_text(payload->>'userAgent')
  ), 1024);

  -- Only trusted service-role callers should pass pre-hashed IP metadata.
  if public.is_service_role() then
    v_ip_hash := left(public.compact_text(coalesce(payload->>'ip_hash', payload->>'ipHash')), 128);
  end if;

  if v_full_name is null then
    raise exception 'full_name is required' using errcode = '22023';
  end if;

  if v_phone is null or v_phone !~ '^[0-9+().\-\s]{7,32}$' then
    raise exception 'valid phone is required' using errcode = '22023';
  end if;

  if v_email is not null and v_email !~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$' then
    raise exception 'email is invalid' using errcode = '22023';
  end if;

  if v_message is null then
    raise exception 'message is required' using errcode = '22023';
  end if;

  if v_source_path is null or v_source_path not like '/%' then
    raise exception 'source_path is required and must start with /' using errcode = '22023';
  end if;

  if v_source_url is not null and v_source_url !~* '^https?://' then
    raise exception 'source_url must be http or https' using errcode = '22023';
  end if;

  if v_product_id_text is not null then
    if v_product_id_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'product_id must be a UUID' using errcode = '22023';
    end if;
    v_product_id := v_product_id_text::uuid;

    if not exists (
      select 1
      from public.products p
      where p.id = v_product_id
        and p.status = 'published'::public.publish_status
        and p.deleted_at is null
    ) then
      raise exception 'product_id is not available for public quote submission' using errcode = '22023';
    end if;
  end if;

  if v_category_id_text is not null then
    if v_category_id_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'category_id must be a UUID' using errcode = '22023';
    end if;
    v_category_id := v_category_id_text::uuid;

    if not exists (
      select 1
      from public.product_categories c
      where c.id = v_category_id
        and c.status = 'published'::public.publish_status
        and c.deleted_at is null
    ) then
      raise exception 'category_id is not available for public quote submission' using errcode = '22023';
    end if;
  end if;

  insert into public.quote_requests (
    full_name,
    phone,
    email,
    company,
    service,
    message,
    preferred_locale,
    product_id,
    category_id,
    source_path,
    source_url,
    ip_hash,
    user_agent,
    status
  )
  values (
    v_full_name,
    v_phone,
    v_email,
    v_company,
    v_service,
    v_message,
    v_locale_text::public.locale_code,
    v_product_id,
    v_category_id,
    v_source_path,
    v_source_url,
    v_ip_hash,
    v_user_agent,
    'new'::public.quote_status
  )
  returning id into v_quote_id;

  insert into public.quote_request_events (
    quote_request_id,
    actor_id,
    old_status,
    new_status,
    note
  )
  values (
    v_quote_id,
    null,
    null,
    'new'::public.quote_status,
    'Created by public quote submission RPC'
  );

  insert into public.quote_notifications (
    quote_request_id,
    recipient_email,
    provider,
    status
  )
  select
    v_quote_id,
    lower(qr.email),
    'resend',
    'pending'::public.notification_status
  from public.quote_recipients qr
  join public.site_settings ss on ss.id = qr.site_settings_id
  where qr.is_active;

  return jsonb_build_object('submitted', true);
end;
$_$;


ALTER FUNCTION "public"."submit_quote_request"("payload" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."submit_quote_request"("payload" "jsonb") IS 'Public-safe quote submission RPC. Validates/sanitizes input, inserts private quote_requests, queues pending notifications, and returns no lead id.';



CREATE OR REPLACE FUNCTION "public"."to_simple_tsvector"(VARIADIC "parts" "text"[]) RETURNS "tsvector"
    LANGUAGE "sql" IMMUTABLE PARALLEL SAFE
    AS $$
  select to_tsvector(
    'simple',
    public.immutable_unaccent(lower(coalesce(array_to_string(parts, ' '), '')))
  );
$$;


ALTER FUNCTION "public"."to_simple_tsvector"(VARIADIC "parts" "text"[]) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."to_simple_tsvector"(VARIADIC "parts" "text"[]) IS 'Builds an accent-insensitive simple-language tsvector from text fragments.';



CREATE OR REPLACE FUNCTION "public"."update_quote_status"("p_quote_id" "uuid", "p_new_status" "text", "p_note" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_old_status text;
  v_user_id    uuid;
  v_allowed_statuses text[] := ARRAY['new', 'contacted', 'qualified', 'closed', 'cancelled', 'spam'];
BEGIN
  -- Verify caller is admin
  SELECT id INTO v_user_id FROM public.profiles WHERE id = auth.uid() AND role = 'admin';
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: admin only');
  END IF;

  -- Validate new status
  IF NOT (p_new_status = ANY(v_allowed_statuses)) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid status: ' || p_new_status);
  END IF;

  -- Get current status
  SELECT status::text INTO v_old_status FROM public.quote_requests WHERE id = p_quote_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Quote not found');
  END IF;

  -- Update quote status
  UPDATE public.quote_requests
    SET status     = p_new_status::public.quote_status,
        updated_at = now()
  WHERE id = p_quote_id;

  -- Log to canonical quote_request_events
  INSERT INTO public.quote_request_events (quote_request_id, actor_id, old_status, new_status, note)
  VALUES (p_quote_id, v_user_id, v_old_status::public.quote_status, p_new_status::public.quote_status, p_note);

  RETURN jsonb_build_object(
    'success',      true,
    'quote_id',     p_quote_id,
    'from_status',  v_old_status,
    'to_status',    p_new_status
  );
END;
$$;


ALTER FUNCTION "public"."update_quote_status"("p_quote_id" "uuid", "p_new_status" "text", "p_note" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."ai_drafts" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "target_type" "public"."ai_target_type" NOT NULL,
    "target_id" "uuid",
    "locale" "public"."locale_code",
    "prompt_type" "text" NOT NULL,
    "prompt_input_hash" "text",
    "output_json" "jsonb" NOT NULL,
    "status" "public"."ai_draft_status" DEFAULT 'draft'::"public"."ai_draft_status" NOT NULL,
    "requested_by" "uuid" NOT NULL,
    "reviewed_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_ai_drafts_prompt_type_not_blank" CHECK (("public"."compact_text"("prompt_type") IS NOT NULL)),
    CONSTRAINT "chk_ai_drafts_reviewed_when_final" CHECK ((("status" = 'draft'::"public"."ai_draft_status") OR ("reviewed_by" IS NOT NULL)))
);


ALTER TABLE "public"."ai_drafts" OWNER TO "postgres";


COMMENT ON TABLE "public"."ai_drafts" IS 'Draft-only AI output. target_id is polymorphic by target_type, so PostgreSQL cannot enforce a single FK. Enforce target-specific permissions in server code/RLS-aware RPCs.';



CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "actor_id" "uuid",
    "action" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_audit_logs_required_text" CHECK ((("public"."compact_text"("action") IS NOT NULL) AND ("public"."compact_text"("entity_type") IS NOT NULL)))
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."audit_logs" IS 'Trusted mutation audit trail. Prefer service-role writes from server code; admin reads only.';



CREATE TABLE IF NOT EXISTS "public"."blog_categories" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "status" "public"."publish_status" DEFAULT 'draft'::"public"."publish_status" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid",
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "chk_blog_categories_published_at" CHECK ((("status" <> 'published'::"public"."publish_status") OR ("published_at" IS NOT NULL)))
);


ALTER TABLE "public"."blog_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blog_category_translations" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "category_id" "uuid" NOT NULL,
    "locale" "public"."locale_code" NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "seo_title" "text",
    "seo_description" "text",
    "og_image_media_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_blog_category_translations_name_not_blank" CHECK (("public"."compact_text"("name") IS NOT NULL)),
    CONSTRAINT "chk_blog_category_translations_slug_not_blank" CHECK (("public"."compact_text"("slug") IS NOT NULL))
);


ALTER TABLE "public"."blog_category_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blog_post_translations" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "locale" "public"."locale_code" NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "excerpt" "text" NOT NULL,
    "body_json" "jsonb" NOT NULL,
    "seo_title" "text",
    "seo_description" "text",
    "og_image_media_id" "uuid",
    "search_text" "tsvector",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_blog_post_translations_required_text" CHECK ((("public"."compact_text"("title") IS NOT NULL) AND ("public"."compact_text"("excerpt") IS NOT NULL))),
    CONSTRAINT "chk_blog_post_translations_slug_not_blank" CHECK (("public"."compact_text"("slug") IS NOT NULL))
);


ALTER TABLE "public"."blog_post_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blog_posts" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "category_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "cover_media_id" "uuid",
    "status" "public"."publish_status" DEFAULT 'draft'::"public"."publish_status" NOT NULL,
    "featured" boolean DEFAULT false NOT NULL,
    "published_at" timestamp with time zone,
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "chk_blog_posts_published_at" CHECK ((("status" <> 'published'::"public"."publish_status") OR ("published_at" IS NOT NULL)))
);


ALTER TABLE "public"."blog_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."brand_translations" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "brand_id" "uuid" NOT NULL,
    "locale" "public"."locale_code" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "seo_title" "text",
    "seo_description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."brand_translations" OWNER TO "postgres";


COMMENT ON TABLE "public"."brand_translations" IS 'Bilingual translations for brand names and descriptions.';



CREATE TABLE IF NOT EXISTS "public"."brands" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "logo_media_id" "uuid",
    "origin" "text",
    "status" "public"."publish_status" DEFAULT 'draft'::"public"."publish_status" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "published_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    "slug" "text"
);


ALTER TABLE "public"."brands" OWNER TO "postgres";


COMMENT ON TABLE "public"."brands" IS 'Brand partners (Kohler, Grohe, TOTO, etc.). Used for product filtering and mega menu display.';



CREATE TABLE IF NOT EXISTS "public"."content_page_translations" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "page_id" "uuid" NOT NULL,
    "locale" "public"."locale_code" NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "lead" "text",
    "body_json" "jsonb",
    "seo_title" "text",
    "seo_description" "text",
    "og_image_media_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_content_page_translations_slug_not_blank" CHECK (("public"."compact_text"("slug") IS NOT NULL)),
    CONSTRAINT "chk_content_page_translations_title_not_blank" CHECK (("public"."compact_text"("title") IS NOT NULL))
);


ALTER TABLE "public"."content_page_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."content_pages" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "status" "public"."publish_status" DEFAULT 'draft'::"public"."publish_status" NOT NULL,
    "published_at" timestamp with time zone,
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "chk_content_pages_key_not_blank" CHECK (("public"."compact_text"("key") IS NOT NULL)),
    CONSTRAINT "chk_content_pages_published_at" CHECK ((("status" <> 'published'::"public"."publish_status") OR ("published_at" IS NOT NULL)))
);


ALTER TABLE "public"."content_pages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."integration_secrets" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "key_name" "text" NOT NULL,
    "encrypted_value" "text" NOT NULL,
    "masked_hint" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."integration_secrets" OWNER TO "postgres";


COMMENT ON TABLE "public"."integration_secrets" IS 'Integration secrets stored securely with AES-256-GCM encryption at the application level.';



CREATE TABLE IF NOT EXISTS "public"."media_asset_translations" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "media_id" "uuid" NOT NULL,
    "locale" "public"."locale_code" NOT NULL,
    "alt_text" "text",
    "caption" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."media_asset_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."media_assets" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "storage_provider" "public"."storage_provider" DEFAULT 'supabase_storage'::"public"."storage_provider" NOT NULL,
    "bucket" "text",
    "object_path" "text",
    "cloudinary_public_id" "text",
    "public_url" "text" NOT NULL,
    "resource_type" "public"."media_resource_type" NOT NULL,
    "mime_type" "text" NOT NULL,
    "format" "text" NOT NULL,
    "size_bytes" bigint NOT NULL,
    "width" integer,
    "height" integer,
    "duration_seconds" numeric(10,2),
    "owner_context" "text",
    "status" "public"."media_status" DEFAULT 'active'::"public"."media_status" NOT NULL,
    "uploaded_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "original_filename" "text",
    CONSTRAINT "chk_media_assets_dimensions" CHECK (((("width" IS NULL) OR ("width" > 0)) AND (("height" IS NULL) OR ("height" > 0)) AND (("duration_seconds" IS NULL) OR ("duration_seconds" >= (0)::numeric)))),
    CONSTRAINT "chk_media_assets_positive_size" CHECK (("size_bytes" > 0)),
    CONSTRAINT "chk_media_assets_provider_identity" CHECK (((("storage_provider" = 'supabase_storage'::"public"."storage_provider") AND ("public"."compact_text"("bucket") IS NOT NULL) AND ("public"."compact_text"("object_path") IS NOT NULL)) OR (("storage_provider" = 'cloudinary'::"public"."storage_provider") AND ("public"."compact_text"("cloudinary_public_id") IS NOT NULL)))),
    CONSTRAINT "chk_media_assets_public_url_http" CHECK (("public_url" ~* '^https?://'::"text"))
);


ALTER TABLE "public"."media_assets" OWNER TO "postgres";


COMMENT ON TABLE "public"."media_assets" IS 'Reusable media metadata for Supabase Storage or Cloudinary. Upload validation for type, size, dimensions, and ownership context remains server-side.';



CREATE TABLE IF NOT EXISTS "public"."page_media" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "page_id" "uuid" NOT NULL,
    "media_id" "uuid" NOT NULL,
    "context" "text" DEFAULT 'content'::"text" NOT NULL,
    "is_primary" boolean DEFAULT false NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."page_media" OWNER TO "postgres";


COMMENT ON TABLE "public"."page_media" IS 'Page-to-media association for galleries and reusable contextual page assets. page_sections.media_id remains for a single section-level asset.';



CREATE TABLE IF NOT EXISTS "public"."page_section_translations" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "section_id" "uuid" NOT NULL,
    "locale" "public"."locale_code" NOT NULL,
    "title" "text",
    "subtitle" "text",
    "body_json" "jsonb",
    "cta_label" "text",
    "cta_href" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_page_section_translations_cta_href" CHECK ((("cta_href" IS NULL) OR ("cta_href" ~* '^(https?://|/|mailto:|tel:)'::"text")))
);


ALTER TABLE "public"."page_section_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."page_sections" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "page_id" "uuid" NOT NULL,
    "section_key" "text" NOT NULL,
    "section_type" "text" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_enabled" boolean DEFAULT true NOT NULL,
    "media_id" "uuid",
    "settings_json" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_page_sections_keys_not_blank" CHECK ((("public"."compact_text"("section_key") IS NOT NULL) AND ("public"."compact_text"("section_type") IS NOT NULL)))
);


ALTER TABLE "public"."page_sections" OWNER TO "postgres";


COMMENT ON COLUMN "public"."page_sections"."media_id" IS 'Single section hero/inline media reference. page_media stores reusable page galleries or multiple contextual assets.';



CREATE TABLE IF NOT EXISTS "public"."product_attribute_definition_translations" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "definition_id" "uuid" NOT NULL,
    "locale" "public"."locale_code" NOT NULL,
    "label" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."product_attribute_definition_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_attribute_definitions" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "data_type" "text" DEFAULT 'text'::"text" NOT NULL,
    "filterable" boolean DEFAULT true NOT NULL,
    "status" "public"."publish_status" DEFAULT 'published'::"public"."publish_status" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "chk_product_attribute_definitions_data_type" CHECK (("data_type" = ANY (ARRAY['text'::"text", 'number'::"text", 'boolean'::"text", 'option'::"text"]))),
    CONSTRAINT "chk_product_attribute_definitions_key_not_blank" CHECK (("public"."compact_text"("key") IS NOT NULL))
);


ALTER TABLE "public"."product_attribute_definitions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_attribute_option_translations" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "option_id" "uuid" NOT NULL,
    "locale" "public"."locale_code" NOT NULL,
    "label" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."product_attribute_option_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_attribute_options" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "definition_id" "uuid" NOT NULL,
    "key" "text" NOT NULL,
    "swatch_hex" "text",
    "status" "public"."publish_status" DEFAULT 'published'::"public"."publish_status" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "chk_product_attribute_options_key_not_blank" CHECK (("public"."compact_text"("key") IS NOT NULL)),
    CONSTRAINT "chk_product_attribute_options_swatch_hex" CHECK ((("swatch_hex" IS NULL) OR ("swatch_hex" ~* '^#[0-9a-f]{6}$'::"text")))
);


ALTER TABLE "public"."product_attribute_options" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_attribute_values" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "attribute_definition_id" "uuid" NOT NULL,
    "attribute_option_id" "uuid",
    "value_text_vi" "text",
    "value_text_en" "text",
    "value_number" numeric(12,2),
    "value_boolean" boolean,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_product_attribute_values_shape" CHECK (((("attribute_option_id" IS NOT NULL) AND ("value_text_vi" IS NULL) AND ("value_text_en" IS NULL) AND ("value_number" IS NULL) AND ("value_boolean" IS NULL)) OR (("attribute_option_id" IS NULL) AND (((("value_text_vi" IS NOT NULL) OR ("value_text_en" IS NOT NULL)) AND ("value_number" IS NULL) AND ("value_boolean" IS NULL)) OR (("value_number" IS NOT NULL) AND ("value_text_vi" IS NULL) AND ("value_text_en" IS NULL) AND ("value_boolean" IS NULL)) OR (("value_boolean" IS NOT NULL) AND ("value_text_vi" IS NULL) AND ("value_text_en" IS NULL) AND ("value_number" IS NULL))))))
);


ALTER TABLE "public"."product_attribute_values" OWNER TO "postgres";


COMMENT ON TABLE "public"."product_attribute_values" IS 'Product attribute value table supports either option-based values or one scalar value shape. SQL checks in 0005 reject mixed states where possible.';



CREATE TABLE IF NOT EXISTS "public"."product_categories" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "parent_id" "uuid",
    "group_key" "public"."product_group_key",
    "image_media_id" "uuid",
    "status" "public"."publish_status" DEFAULT 'draft'::"public"."publish_status" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid",
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "chk_product_categories_published_at" CHECK ((("status" <> 'published'::"public"."publish_status") OR ("published_at" IS NOT NULL)))
);


ALTER TABLE "public"."product_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_category_translations" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "category_id" "uuid" NOT NULL,
    "locale" "public"."locale_code" NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "seo_title" "text",
    "seo_description" "text",
    "og_image_media_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_product_category_translations_name_not_blank" CHECK (("public"."compact_text"("name") IS NOT NULL)),
    CONSTRAINT "chk_product_category_translations_slug_not_blank" CHECK (("public"."compact_text"("slug") IS NOT NULL))
);


ALTER TABLE "public"."product_category_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_media" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "media_id" "uuid" NOT NULL,
    "context" "text" DEFAULT 'gallery'::"text" NOT NULL,
    "is_primary" boolean DEFAULT false NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."product_media" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_promotions" (
    "product_id" "uuid" NOT NULL,
    "promotion_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."product_promotions" OWNER TO "postgres";


COMMENT ON TABLE "public"."product_promotions" IS 'Many-to-many association between products and promotions.';



CREATE TABLE IF NOT EXISTS "public"."product_translations" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "locale" "public"."locale_code" NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "summary" "text" NOT NULL,
    "description_json" "jsonb" NOT NULL,
    "material" "text",
    "price_display_text" "text",
    "dimension_display_text" "text",
    "seo_title" "text",
    "seo_description" "text",
    "og_image_media_id" "uuid",
    "search_text" "tsvector",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_product_translations_required_text" CHECK ((("public"."compact_text"("name") IS NOT NULL) AND ("public"."compact_text"("summary") IS NOT NULL))),
    CONSTRAINT "chk_product_translations_slug_not_blank" CHECK (("public"."compact_text"("slug") IS NOT NULL))
);


ALTER TABLE "public"."product_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "category_id" "uuid" NOT NULL,
    "reference_code" "text",
    "status" "public"."publish_status" DEFAULT 'draft'::"public"."publish_status" NOT NULL,
    "price_min" numeric(12,2),
    "price_max" numeric(12,2),
    "currency" character(3) DEFAULT 'VND'::"bpchar" NOT NULL,
    "width" numeric(10,2),
    "depth" numeric(10,2),
    "height" numeric(10,2),
    "dimension_unit" "text" DEFAULT 'mm'::"text",
    "brand_series" "text",
    "featured" boolean DEFAULT false NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid",
    "published_at" timestamp with time zone,
    "archived_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "promo_price_min" numeric(12,2),
    "promo_price_max" numeric(12,2),
    "brand_id" "uuid",
    "custom_attributes" "jsonb" DEFAULT '[]'::"jsonb",
    "specifications" "jsonb" DEFAULT '{}'::"jsonb",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "showroom_code" "text",
    "price_unit" "text",
    CONSTRAINT "chk_products_currency_iso_like" CHECK (("currency" ~ '^[A-Z]{3}$'::"text")),
    CONSTRAINT "chk_products_dimensions_non_negative" CHECK (((("width" IS NULL) OR ("width" >= (0)::numeric)) AND (("depth" IS NULL) OR ("depth" >= (0)::numeric)) AND (("height" IS NULL) OR ("height" >= (0)::numeric)))),
    CONSTRAINT "chk_products_price_range" CHECK (((("price_min" IS NULL) OR ("price_min" >= (0)::numeric)) AND (("price_max" IS NULL) OR ("price_max" >= (0)::numeric)) AND (("price_min" IS NULL) OR ("price_max" IS NULL) OR ("price_max" >= "price_min")))),
    CONSTRAINT "chk_products_published_at" CHECK ((("status" <> 'published'::"public"."publish_status") OR ("published_at" IS NOT NULL)))
);


ALTER TABLE "public"."products" OWNER TO "postgres";


COMMENT ON COLUMN "public"."products"."brand_id" IS 'Foreign key to brands table. Replaces free-text brand_series field.';



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text" NOT NULL,
    "role" "public"."cms_role" DEFAULT 'editor'::"public"."cms_role" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "last_login_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "chk_profiles_email_shape" CHECK (("email" ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'::"text")),
    CONSTRAINT "chk_profiles_full_name_not_blank" CHECK (("public"."compact_text"("full_name") IS NOT NULL))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles" IS 'Admin/Editor CMS profile. id references auth.users(id). profiles.email is duplicated for admin display/search; auth.users.email remains the identity source of truth.';



CREATE TABLE IF NOT EXISTS "public"."promotion_targets" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "promotion_id" "uuid" NOT NULL,
    "target_type" "text" NOT NULL,
    "target_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "promotion_targets_target_type_check" CHECK (("target_type" = ANY (ARRAY['product'::"text", 'category'::"text", 'brand'::"text", 'all'::"text"])))
);


ALTER TABLE "public"."promotion_targets" OWNER TO "postgres";


COMMENT ON TABLE "public"."promotion_targets" IS 'Many-to-many relationship: promotions can apply to specific products, categories, brands, or all items.';



CREATE TABLE IF NOT EXISTS "public"."promotion_translations" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "promotion_id" "uuid" NOT NULL,
    "locale" "public"."locale_code" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "seo_title" "text",
    "seo_description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."promotion_translations" OWNER TO "postgres";


COMMENT ON TABLE "public"."promotion_translations" IS 'Localized translation fields for promotions.';



CREATE TABLE IF NOT EXISTS "public"."promotions" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "discount_percentage" numeric(5,2),
    "status" "public"."publish_status" DEFAULT 'draft'::"public"."publish_status" NOT NULL,
    "start_at" timestamp with time zone,
    "end_at" timestamp with time zone,
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "cover_media_id" "uuid",
    "combo_price" numeric(12,2),
    "original_price" numeric(12,2),
    "metadata_jsonb" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."promotions" OWNER TO "postgres";


COMMENT ON TABLE "public"."promotions" IS 'Promotion campaigns or discount events. Manageable by editors and admins.';



COMMENT ON COLUMN "public"."promotions"."cover_media_id" IS 'Cover image for combo promotion display.';



COMMENT ON COLUMN "public"."promotions"."combo_price" IS 'Special combo package price.';



COMMENT ON COLUMN "public"."promotions"."original_price" IS 'Original total price before discount for combo.';



COMMENT ON COLUMN "public"."promotions"."metadata_jsonb" IS 'Flexible JSON storage for combo product lists and other display configurations.';



CREATE TABLE IF NOT EXISTS "public"."quote_notifications" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "quote_request_id" "uuid" NOT NULL,
    "recipient_email" "text" NOT NULL,
    "provider" "text" DEFAULT 'resend'::"text" NOT NULL,
    "provider_message_id" "text",
    "status" "public"."notification_status" DEFAULT 'pending'::"public"."notification_status" NOT NULL,
    "attempt_count" integer DEFAULT 0 NOT NULL,
    "last_error" "text",
    "sent_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_quote_notifications_attempt_count" CHECK (("attempt_count" >= 0)),
    CONSTRAINT "chk_quote_notifications_recipient_email" CHECK (("recipient_email" ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'::"text"))
);


ALTER TABLE "public"."quote_notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quote_recipients" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "site_settings_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "label" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_quote_recipients_email" CHECK (("email" ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'::"text"))
);


ALTER TABLE "public"."quote_recipients" OWNER TO "postgres";


COMMENT ON TABLE "public"."quote_recipients" IS 'Private notification recipients for quote leads. Admin/service only.';



CREATE TABLE IF NOT EXISTS "public"."quote_request_events" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "quote_request_id" "uuid" NOT NULL,
    "actor_id" "uuid",
    "old_status" "public"."quote_status",
    "new_status" "public"."quote_status",
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."quote_request_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."quote_request_events" IS 'Append-only quote lead workflow history.';



CREATE TABLE IF NOT EXISTS "public"."quote_requests" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "email" "text",
    "company" "text",
    "service" "text",
    "message" "text" NOT NULL,
    "preferred_locale" "public"."locale_code" NOT NULL,
    "product_id" "uuid",
    "category_id" "uuid",
    "source_path" "text" NOT NULL,
    "source_url" "text",
    "ip_hash" "text",
    "user_agent" "text",
    "status" "public"."quote_status" DEFAULT 'new'::"public"."quote_status" NOT NULL,
    "assigned_to" "uuid",
    "admin_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "sales_notes" "text",
    "snapshot_price" numeric(12,2),
    "snapshot_promo_price" numeric(12,2),
    CONSTRAINT "chk_quote_requests_email_shape" CHECK ((("email" IS NULL) OR ("email" ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'::"text"))),
    CONSTRAINT "chk_quote_requests_phone_shape" CHECK (("phone" ~ '^[0-9+().\-\s]{7,32}$'::"text")),
    CONSTRAINT "chk_quote_requests_required_text" CHECK ((("public"."compact_text"("full_name") IS NOT NULL) AND ("public"."compact_text"("phone") IS NOT NULL) AND ("public"."compact_text"("message") IS NOT NULL) AND ("public"."compact_text"("source_path") IS NOT NULL))),
    CONSTRAINT "chk_quote_requests_source_path_shape" CHECK (("source_path" ~~ '/%'::"text")),
    CONSTRAINT "chk_quote_requests_source_url_http" CHECK ((("source_url" IS NULL) OR ("source_url" ~* '^https?://'::"text")))
);


ALTER TABLE "public"."quote_requests" OWNER TO "postgres";


COMMENT ON TABLE "public"."quote_requests" IS 'Private lead data. Public visitors must use submit_quote_request(payload jsonb) or a service-role Edge Function, and must not select this table.';



COMMENT ON COLUMN "public"."quote_requests"."assigned_to" IS 'Sales staff assigned to handle this lead (references profiles.id).';



COMMENT ON COLUMN "public"."quote_requests"."sales_notes" IS 'Internal notes from sales team about consultation progress.';



COMMENT ON COLUMN "public"."quote_requests"."snapshot_price" IS 'Product price snapshot at the time customer submitted quote request.';



COMMENT ON COLUMN "public"."quote_requests"."snapshot_promo_price" IS 'Promotional price snapshot at the time customer submitted quote request.';



CREATE TABLE IF NOT EXISTS "public"."showroom_media" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "showroom_id" "uuid" NOT NULL,
    "media_id" "uuid" NOT NULL,
    "is_primary" boolean DEFAULT false NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."showroom_media" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."showroom_translations" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "showroom_id" "uuid" NOT NULL,
    "locale" "public"."locale_code" NOT NULL,
    "name" "text" NOT NULL,
    "address" "text" NOT NULL,
    "opening_hours" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_showroom_translations_required_text" CHECK ((("public"."compact_text"("name") IS NOT NULL) AND ("public"."compact_text"("address") IS NOT NULL)))
);


ALTER TABLE "public"."showroom_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."showrooms" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "code" "text",
    "hotline" "text" NOT NULL,
    "google_maps_embed_url" "text" NOT NULL,
    "google_maps_fallback_url" "text" NOT NULL,
    "latitude" numeric(10,7),
    "longitude" numeric(10,7),
    "status" "public"."publish_status" DEFAULT 'draft'::"public"."publish_status" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid",
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "chk_showrooms_coordinates" CHECK (((("latitude" IS NULL) OR (("latitude" >= ('-90'::integer)::numeric) AND ("latitude" <= (90)::numeric))) AND (("longitude" IS NULL) OR (("longitude" >= ('-180'::integer)::numeric) AND ("longitude" <= (180)::numeric))))),
    CONSTRAINT "chk_showrooms_map_urls_https" CHECK ((("google_maps_embed_url" ~* '^https://'::"text") AND ("google_maps_fallback_url" ~* '^https://'::"text"))),
    CONSTRAINT "chk_showrooms_published_at" CHECK ((("status" <> 'published'::"public"."publish_status") OR ("published_at" IS NOT NULL)))
);


ALTER TABLE "public"."showrooms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_setting_translations" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "site_settings_id" "uuid" NOT NULL,
    "locale" "public"."locale_code" NOT NULL,
    "brand_name" "text" NOT NULL,
    "contact_address" "text",
    "seo_default_title" "text" NOT NULL,
    "seo_default_description" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."site_setting_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_settings" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "singleton_key" "text" DEFAULT 'default'::"text" NOT NULL,
    "logo_media_id" "uuid",
    "favicon_media_id" "uuid",
    "default_og_image_media_id" "uuid",
    "contact_phone" "text",
    "contact_email" "text",
    "quote_sender_email" "text",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_site_settings_contact_email" CHECK ((("contact_email" IS NULL) OR ("contact_email" ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'::"text"))),
    CONSTRAINT "chk_site_settings_quote_sender_email" CHECK ((("quote_sender_email" IS NULL) OR ("quote_sender_email" ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'::"text"))),
    CONSTRAINT "chk_site_settings_singleton_default" CHECK (("singleton_key" = 'default'::"text"))
);


ALTER TABLE "public"."site_settings" OWNER TO "postgres";


COMMENT ON TABLE "public"."site_settings" IS 'Singleton site settings row. Privileged settings and integration secrets must remain admin/service-only and should not be stored in public client code.';



CREATE TABLE IF NOT EXISTS "public"."social_links" (
    "id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    "site_settings_id" "uuid" NOT NULL,
    "platform" "public"."social_platform" NOT NULL,
    "label" "text",
    "url" "text" NOT NULL,
    "is_enabled" boolean DEFAULT true NOT NULL,
    "share_enabled" boolean DEFAULT false NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_social_links_url_http" CHECK (("url" ~* '^https?://'::"text"))
);


ALTER TABLE "public"."social_links" OWNER TO "postgres";


ALTER TABLE ONLY "public"."ai_drafts"
    ADD CONSTRAINT "ai_drafts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_categories"
    ADD CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_category_translations"
    ADD CONSTRAINT "blog_category_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_post_translations"
    ADD CONSTRAINT "blog_post_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brand_translations"
    ADD CONSTRAINT "brand_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."content_page_translations"
    ADD CONSTRAINT "content_page_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."content_pages"
    ADD CONSTRAINT "content_pages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."integration_secrets"
    ADD CONSTRAINT "integration_secrets_key_name_key" UNIQUE ("key_name");



ALTER TABLE ONLY "public"."integration_secrets"
    ADD CONSTRAINT "integration_secrets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."media_asset_translations"
    ADD CONSTRAINT "media_asset_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."media_assets"
    ADD CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."page_media"
    ADD CONSTRAINT "page_media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."page_section_translations"
    ADD CONSTRAINT "page_section_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."page_sections"
    ADD CONSTRAINT "page_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_attribute_definition_translations"
    ADD CONSTRAINT "product_attribute_definition_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_attribute_definitions"
    ADD CONSTRAINT "product_attribute_definitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_attribute_option_translations"
    ADD CONSTRAINT "product_attribute_option_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_attribute_options"
    ADD CONSTRAINT "product_attribute_options_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_attribute_values"
    ADD CONSTRAINT "product_attribute_values_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_categories"
    ADD CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_category_translations"
    ADD CONSTRAINT "product_category_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_media"
    ADD CONSTRAINT "product_media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_promotions"
    ADD CONSTRAINT "product_promotions_pkey" PRIMARY KEY ("product_id", "promotion_id");



ALTER TABLE ONLY "public"."product_translations"
    ADD CONSTRAINT "product_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promotion_targets"
    ADD CONSTRAINT "promotion_targets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promotion_translations"
    ADD CONSTRAINT "promotion_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promotion_translations"
    ADD CONSTRAINT "promotion_translations_promotion_id_locale_key" UNIQUE ("promotion_id", "locale");



ALTER TABLE ONLY "public"."promotions"
    ADD CONSTRAINT "promotions_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."promotions"
    ADD CONSTRAINT "promotions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quote_notifications"
    ADD CONSTRAINT "quote_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quote_recipients"
    ADD CONSTRAINT "quote_recipients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quote_request_events"
    ADD CONSTRAINT "quote_request_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quote_requests"
    ADD CONSTRAINT "quote_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."showroom_media"
    ADD CONSTRAINT "showroom_media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."showroom_translations"
    ADD CONSTRAINT "showroom_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."showrooms"
    ADD CONSTRAINT "showrooms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_setting_translations"
    ADD CONSTRAINT "site_setting_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."social_links"
    ADD CONSTRAINT "social_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brand_translations"
    ADD CONSTRAINT "uq_brand_translations_brand_locale" UNIQUE ("brand_id", "locale");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "uq_brands_slug" UNIQUE ("slug");



ALTER TABLE ONLY "public"."product_attribute_options"
    ADD CONSTRAINT "uq_product_attribute_options_id_definition" UNIQUE ("id", "definition_id");



CREATE INDEX "idx_ai_drafts_requested_created" ON "public"."ai_drafts" USING "btree" ("requested_by", "created_at");



CREATE INDEX "idx_ai_drafts_status" ON "public"."ai_drafts" USING "btree" ("status");



CREATE INDEX "idx_ai_drafts_target" ON "public"."ai_drafts" USING "btree" ("target_type", "target_id");



CREATE INDEX "idx_audit_logs_action" ON "public"."audit_logs" USING "btree" ("action");



CREATE INDEX "idx_audit_logs_actor_created" ON "public"."audit_logs" USING "btree" ("actor_id", "created_at");



CREATE INDEX "idx_audit_logs_entity" ON "public"."audit_logs" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_blog_categories_deleted_at" ON "public"."blog_categories" USING "btree" ("deleted_at");



CREATE INDEX "idx_blog_categories_status_sort" ON "public"."blog_categories" USING "btree" ("status", "sort_order");



CREATE INDEX "idx_blog_category_translations_category_locale" ON "public"."blog_category_translations" USING "btree" ("category_id", "locale");



CREATE INDEX "idx_blog_category_translations_locale_slug" ON "public"."blog_category_translations" USING "btree" ("locale", "slug");



CREATE INDEX "idx_blog_category_translations_name_trgm" ON "public"."blog_category_translations" USING "gin" ("public"."immutable_unaccent"("lower"("name")) "extensions"."gin_trgm_ops");



CREATE INDEX "idx_blog_post_translations_locale_slug" ON "public"."blog_post_translations" USING "btree" ("locale", "slug");



CREATE INDEX "idx_blog_post_translations_post_locale" ON "public"."blog_post_translations" USING "btree" ("post_id", "locale");



CREATE INDEX "idx_blog_post_translations_search_text" ON "public"."blog_post_translations" USING "gin" ("search_text");



CREATE INDEX "idx_blog_post_translations_title_excerpt_trgm" ON "public"."blog_post_translations" USING "gin" ("public"."immutable_unaccent"("lower"(((COALESCE("title", ''::"text") || ' '::"text") || COALESCE("excerpt", ''::"text")))) "extensions"."gin_trgm_ops");



CREATE INDEX "idx_blog_posts_author" ON "public"."blog_posts" USING "btree" ("author_id");



CREATE INDEX "idx_blog_posts_category_status_published" ON "public"."blog_posts" USING "btree" ("category_id", "status", "published_at" DESC);



CREATE INDEX "idx_blog_posts_deleted_at" ON "public"."blog_posts" USING "btree" ("deleted_at");



CREATE INDEX "idx_blog_posts_featured_status" ON "public"."blog_posts" USING "btree" ("featured", "status");



CREATE INDEX "idx_blog_posts_public" ON "public"."blog_posts" USING "btree" ("published_at" DESC, "featured" DESC) WHERE (("status" = 'published'::"public"."publish_status") AND ("deleted_at" IS NULL));



CREATE INDEX "idx_brand_translations_brand_id" ON "public"."brand_translations" USING "btree" ("brand_id");



CREATE INDEX "idx_brand_translations_locale" ON "public"."brand_translations" USING "btree" ("locale");



CREATE INDEX "idx_brands_sort_order" ON "public"."brands" USING "btree" ("sort_order");



CREATE INDEX "idx_brands_status" ON "public"."brands" USING "btree" ("status") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_content_page_translations_locale_slug" ON "public"."content_page_translations" USING "btree" ("locale", "slug");



CREATE INDEX "idx_content_page_translations_page_locale" ON "public"."content_page_translations" USING "btree" ("page_id", "locale");



CREATE INDEX "idx_content_pages_deleted_at" ON "public"."content_pages" USING "btree" ("deleted_at");



CREATE INDEX "idx_content_pages_key_status" ON "public"."content_pages" USING "btree" ("key", "status");



CREATE INDEX "idx_content_pages_public" ON "public"."content_pages" USING "btree" ("key", "published_at" DESC) WHERE (("status" = 'published'::"public"."publish_status") AND ("deleted_at" IS NULL));



CREATE INDEX "idx_media_asset_translations_media_locale" ON "public"."media_asset_translations" USING "btree" ("media_id", "locale");



CREATE INDEX "idx_media_assets_cloudinary_public_id" ON "public"."media_assets" USING "btree" ("cloudinary_public_id");



CREATE INDEX "idx_media_assets_deleted_at" ON "public"."media_assets" USING "btree" ("deleted_at");



CREATE INDEX "idx_media_assets_owner_context" ON "public"."media_assets" USING "btree" ("owner_context");



CREATE INDEX "idx_media_assets_resource_status" ON "public"."media_assets" USING "btree" ("resource_type", "status");



CREATE INDEX "idx_media_assets_uploaded_by" ON "public"."media_assets" USING "btree" ("uploaded_by");



CREATE INDEX "idx_page_media_media" ON "public"."page_media" USING "btree" ("media_id");



CREATE INDEX "idx_page_media_page_sort" ON "public"."page_media" USING "btree" ("page_id", "sort_order");



CREATE INDEX "idx_page_section_translations_section_locale" ON "public"."page_section_translations" USING "btree" ("section_id", "locale");



CREATE INDEX "idx_page_sections_enabled" ON "public"."page_sections" USING "btree" ("is_enabled");



CREATE INDEX "idx_page_sections_page_sort" ON "public"."page_sections" USING "btree" ("page_id", "sort_order");



CREATE INDEX "idx_product_attribute_definition_translations_definition_locale" ON "public"."product_attribute_definition_translations" USING "btree" ("definition_id", "locale");



CREATE INDEX "idx_product_attribute_definitions_deleted_at" ON "public"."product_attribute_definitions" USING "btree" ("deleted_at");



CREATE INDEX "idx_product_attribute_definitions_filterable_status" ON "public"."product_attribute_definitions" USING "btree" ("filterable", "status");



CREATE INDEX "idx_product_attribute_option_translations_option_locale" ON "public"."product_attribute_option_translations" USING "btree" ("option_id", "locale");



CREATE INDEX "idx_product_attribute_options_definition_status_sort" ON "public"."product_attribute_options" USING "btree" ("definition_id", "status", "sort_order");



CREATE INDEX "idx_product_attribute_options_deleted_at" ON "public"."product_attribute_options" USING "btree" ("deleted_at");



CREATE INDEX "idx_product_attribute_values_definition_option" ON "public"."product_attribute_values" USING "btree" ("attribute_definition_id", "attribute_option_id");



CREATE INDEX "idx_product_attribute_values_product_definition" ON "public"."product_attribute_values" USING "btree" ("product_id", "attribute_definition_id");



CREATE INDEX "idx_product_attribute_values_value_number" ON "public"."product_attribute_values" USING "btree" ("value_number");



CREATE INDEX "idx_product_categories_deleted_at" ON "public"."product_categories" USING "btree" ("deleted_at");



CREATE INDEX "idx_product_categories_group_key" ON "public"."product_categories" USING "btree" ("group_key");



CREATE INDEX "idx_product_categories_parent" ON "public"."product_categories" USING "btree" ("parent_id");



CREATE INDEX "idx_product_categories_public" ON "public"."product_categories" USING "btree" ("group_key", "sort_order") WHERE (("status" = 'published'::"public"."publish_status") AND ("deleted_at" IS NULL));



CREATE INDEX "idx_product_categories_status_sort" ON "public"."product_categories" USING "btree" ("status", "sort_order");



CREATE INDEX "idx_product_category_translations_category_locale" ON "public"."product_category_translations" USING "btree" ("category_id", "locale");



CREATE INDEX "idx_product_category_translations_locale_slug" ON "public"."product_category_translations" USING "btree" ("locale", "slug");



CREATE INDEX "idx_product_category_translations_name_trgm" ON "public"."product_category_translations" USING "gin" ("public"."immutable_unaccent"("lower"("name")) "extensions"."gin_trgm_ops");



CREATE INDEX "idx_product_media_media" ON "public"."product_media" USING "btree" ("media_id");



CREATE INDEX "idx_product_media_product_sort" ON "public"."product_media" USING "btree" ("product_id", "sort_order");



CREATE INDEX "idx_product_translations_locale_slug" ON "public"."product_translations" USING "btree" ("locale", "slug");



CREATE INDEX "idx_product_translations_name_summary_trgm" ON "public"."product_translations" USING "gin" ("public"."immutable_unaccent"("lower"(((((COALESCE("name", ''::"text") || ' '::"text") || COALESCE("summary", ''::"text")) || ' '::"text") || COALESCE("material", ''::"text")))) "extensions"."gin_trgm_ops");



CREATE INDEX "idx_product_translations_product_locale" ON "public"."product_translations" USING "btree" ("product_id", "locale");



CREATE INDEX "idx_product_translations_search_text" ON "public"."product_translations" USING "gin" ("search_text");



CREATE INDEX "idx_products_brand_id" ON "public"."products" USING "btree" ("brand_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_products_brand_series_trgm" ON "public"."products" USING "gin" ("public"."immutable_unaccent"("lower"(COALESCE("brand_series", ''::"text"))) "extensions"."gin_trgm_ops");



CREATE INDEX "idx_products_category_status" ON "public"."products" USING "btree" ("category_id", "status");



CREATE INDEX "idx_products_created_at" ON "public"."products" USING "btree" ("created_at");



CREATE INDEX "idx_products_deleted_at" ON "public"."products" USING "btree" ("deleted_at");



CREATE INDEX "idx_products_featured_status" ON "public"."products" USING "btree" ("featured", "status");



CREATE INDEX "idx_products_price_range" ON "public"."products" USING "btree" ("price_min", "price_max");



CREATE INDEX "idx_products_public_sort" ON "public"."products" USING "btree" ("category_id", "featured" DESC, "sort_order", "published_at" DESC) WHERE (("status" = 'published'::"public"."publish_status") AND ("deleted_at" IS NULL));



CREATE INDEX "idx_profiles_deleted_at" ON "public"."profiles" USING "btree" ("deleted_at");



CREATE INDEX "idx_profiles_email_trgm" ON "public"."profiles" USING "gin" ("public"."immutable_unaccent"("lower"("email")) "extensions"."gin_trgm_ops");



CREATE INDEX "idx_profiles_is_active" ON "public"."profiles" USING "btree" ("is_active");



CREATE INDEX "idx_profiles_role" ON "public"."profiles" USING "btree" ("role");



CREATE INDEX "idx_promotion_targets_promotion" ON "public"."promotion_targets" USING "btree" ("promotion_id");



CREATE INDEX "idx_promotion_targets_type_id" ON "public"."promotion_targets" USING "btree" ("target_type", "target_id");



CREATE INDEX "idx_quote_notifications_provider_message_id" ON "public"."quote_notifications" USING "btree" ("provider_message_id");



CREATE INDEX "idx_quote_notifications_quote_request" ON "public"."quote_notifications" USING "btree" ("quote_request_id");



CREATE INDEX "idx_quote_notifications_status_created" ON "public"."quote_notifications" USING "btree" ("status", "created_at");



CREATE INDEX "idx_quote_recipients_active" ON "public"."quote_recipients" USING "btree" ("is_active");



CREATE INDEX "idx_quote_request_events_actor" ON "public"."quote_request_events" USING "btree" ("actor_id");



CREATE INDEX "idx_quote_request_events_quote_created" ON "public"."quote_request_events" USING "btree" ("quote_request_id", "created_at");



CREATE INDEX "idx_quote_requests_assigned_to" ON "public"."quote_requests" USING "btree" ("assigned_to");



CREATE INDEX "idx_quote_requests_category" ON "public"."quote_requests" USING "btree" ("category_id");



CREATE INDEX "idx_quote_requests_deleted_at" ON "public"."quote_requests" USING "btree" ("deleted_at");



CREATE INDEX "idx_quote_requests_keyword_trgm" ON "public"."quote_requests" USING "gin" ("public"."immutable_unaccent"("lower"(((((((((((((COALESCE("full_name", ''::"text") || ' '::"text") || COALESCE("phone", ''::"text")) || ' '::"text") || COALESCE("email", ''::"text")) || ' '::"text") || COALESCE("company", ''::"text")) || ' '::"text") || COALESCE("service", ''::"text")) || ' '::"text") || COALESCE("message", ''::"text")) || ' '::"text") || COALESCE("admin_notes", ''::"text")))) "extensions"."gin_trgm_ops");



CREATE INDEX "idx_quote_requests_product" ON "public"."quote_requests" USING "btree" ("product_id");



CREATE INDEX "idx_quote_requests_source_path" ON "public"."quote_requests" USING "btree" ("source_path");



CREATE INDEX "idx_quote_requests_status_created" ON "public"."quote_requests" USING "btree" ("status", "created_at" DESC);



CREATE INDEX "idx_showroom_media_media" ON "public"."showroom_media" USING "btree" ("media_id");



CREATE INDEX "idx_showroom_media_showroom_sort" ON "public"."showroom_media" USING "btree" ("showroom_id", "sort_order");



CREATE INDEX "idx_showroom_translations_name_address_trgm" ON "public"."showroom_translations" USING "gin" ("public"."immutable_unaccent"("lower"(((COALESCE("name", ''::"text") || ' '::"text") || COALESCE("address", ''::"text")))) "extensions"."gin_trgm_ops");



CREATE INDEX "idx_showroom_translations_showroom_locale" ON "public"."showroom_translations" USING "btree" ("showroom_id", "locale");



CREATE INDEX "idx_showrooms_deleted_at" ON "public"."showrooms" USING "btree" ("deleted_at");



CREATE INDEX "idx_showrooms_public" ON "public"."showrooms" USING "btree" ("sort_order") WHERE (("status" = 'published'::"public"."publish_status") AND ("deleted_at" IS NULL));



CREATE INDEX "idx_showrooms_status_sort" ON "public"."showrooms" USING "btree" ("status", "sort_order");



CREATE INDEX "idx_site_setting_translations_locale" ON "public"."site_setting_translations" USING "btree" ("locale");



CREATE INDEX "idx_social_links_enabled_sort" ON "public"."social_links" USING "btree" ("is_enabled", "sort_order");



CREATE UNIQUE INDEX "uq_blog_category_translations_category_locale" ON "public"."blog_category_translations" USING "btree" ("category_id", "locale");



CREATE UNIQUE INDEX "uq_blog_category_translations_locale_slug" ON "public"."blog_category_translations" USING "btree" ("locale", "slug");



CREATE UNIQUE INDEX "uq_blog_post_translations_locale_slug" ON "public"."blog_post_translations" USING "btree" ("locale", "slug");



CREATE UNIQUE INDEX "uq_blog_post_translations_post_locale" ON "public"."blog_post_translations" USING "btree" ("post_id", "locale");



CREATE UNIQUE INDEX "uq_content_page_translations_locale_slug" ON "public"."content_page_translations" USING "btree" ("locale", "slug");



CREATE UNIQUE INDEX "uq_content_page_translations_page_locale" ON "public"."content_page_translations" USING "btree" ("page_id", "locale");



CREATE UNIQUE INDEX "uq_content_pages_key" ON "public"."content_pages" USING "btree" ("key");



CREATE UNIQUE INDEX "uq_media_asset_translations_media_locale" ON "public"."media_asset_translations" USING "btree" ("media_id", "locale");



CREATE UNIQUE INDEX "uq_media_assets_cloudinary_public_id" ON "public"."media_assets" USING "btree" ("cloudinary_public_id") WHERE (("storage_provider" = 'cloudinary'::"public"."storage_provider") AND ("cloudinary_public_id" IS NOT NULL) AND ("deleted_at" IS NULL));



CREATE UNIQUE INDEX "uq_media_assets_storage_identity" ON "public"."media_assets" USING "btree" ("storage_provider", "bucket", "object_path") WHERE (("storage_provider" = 'supabase_storage'::"public"."storage_provider") AND ("bucket" IS NOT NULL) AND ("object_path" IS NOT NULL) AND ("deleted_at" IS NULL));



CREATE UNIQUE INDEX "uq_page_media_one_primary_per_page" ON "public"."page_media" USING "btree" ("page_id") WHERE "is_primary";



CREATE UNIQUE INDEX "uq_page_media_page_media" ON "public"."page_media" USING "btree" ("page_id", "media_id");



CREATE UNIQUE INDEX "uq_page_section_translations_section_locale" ON "public"."page_section_translations" USING "btree" ("section_id", "locale");



CREATE UNIQUE INDEX "uq_page_sections_page_section_key" ON "public"."page_sections" USING "btree" ("page_id", "section_key");



CREATE UNIQUE INDEX "uq_product_attribute_definition_translations_definition_locale" ON "public"."product_attribute_definition_translations" USING "btree" ("definition_id", "locale");



CREATE UNIQUE INDEX "uq_product_attribute_definitions_key_active" ON "public"."product_attribute_definitions" USING "btree" ("lower"("key")) WHERE ("deleted_at" IS NULL);



CREATE UNIQUE INDEX "uq_product_attribute_option_translations_option_locale" ON "public"."product_attribute_option_translations" USING "btree" ("option_id", "locale");



CREATE UNIQUE INDEX "uq_product_attribute_options_definition_key_active" ON "public"."product_attribute_options" USING "btree" ("definition_id", "lower"("key")) WHERE ("deleted_at" IS NULL);



CREATE UNIQUE INDEX "uq_product_attribute_values_option" ON "public"."product_attribute_values" USING "btree" ("product_id", "attribute_definition_id", "attribute_option_id") WHERE ("attribute_option_id" IS NOT NULL);



CREATE UNIQUE INDEX "uq_product_attribute_values_scalar" ON "public"."product_attribute_values" USING "btree" ("product_id", "attribute_definition_id") WHERE ("attribute_option_id" IS NULL);



CREATE UNIQUE INDEX "uq_product_category_translations_category_locale" ON "public"."product_category_translations" USING "btree" ("category_id", "locale");



CREATE UNIQUE INDEX "uq_product_category_translations_locale_slug" ON "public"."product_category_translations" USING "btree" ("locale", "slug");



CREATE UNIQUE INDEX "uq_product_media_one_primary_per_product" ON "public"."product_media" USING "btree" ("product_id") WHERE "is_primary";



CREATE UNIQUE INDEX "uq_product_media_product_media" ON "public"."product_media" USING "btree" ("product_id", "media_id");



CREATE UNIQUE INDEX "uq_product_translations_locale_slug" ON "public"."product_translations" USING "btree" ("locale", "slug");



CREATE UNIQUE INDEX "uq_product_translations_product_locale" ON "public"."product_translations" USING "btree" ("product_id", "locale");



CREATE UNIQUE INDEX "uq_products_reference_code_active" ON "public"."products" USING "btree" ("lower"("reference_code")) WHERE (("reference_code" IS NOT NULL) AND ("deleted_at" IS NULL));



CREATE UNIQUE INDEX "uq_profiles_email_lower" ON "public"."profiles" USING "btree" ("lower"("email"));



CREATE UNIQUE INDEX "uq_quote_recipients_active_email" ON "public"."quote_recipients" USING "btree" ("site_settings_id", "lower"("email")) WHERE "is_active";



CREATE UNIQUE INDEX "uq_showroom_media_one_primary_per_showroom" ON "public"."showroom_media" USING "btree" ("showroom_id") WHERE "is_primary";



CREATE UNIQUE INDEX "uq_showroom_media_showroom_media" ON "public"."showroom_media" USING "btree" ("showroom_id", "media_id");



CREATE UNIQUE INDEX "uq_showroom_translations_showroom_locale" ON "public"."showroom_translations" USING "btree" ("showroom_id", "locale");



CREATE UNIQUE INDEX "uq_showrooms_code_active" ON "public"."showrooms" USING "btree" ("lower"("code")) WHERE (("code" IS NOT NULL) AND ("deleted_at" IS NULL));



CREATE UNIQUE INDEX "uq_site_setting_translations_settings_locale" ON "public"."site_setting_translations" USING "btree" ("site_settings_id", "locale");



CREATE UNIQUE INDEX "uq_site_settings_singleton_key" ON "public"."site_settings" USING "btree" ("singleton_key");



CREATE UNIQUE INDEX "uq_social_links_settings_platform" ON "public"."social_links" USING "btree" ("site_settings_id", "platform");



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."integration_secrets" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_ai_drafts_set_updated_at" BEFORE UPDATE ON "public"."ai_drafts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_audit_logs_append_only" BEFORE DELETE OR UPDATE ON "public"."audit_logs" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_update_delete"();



CREATE OR REPLACE TRIGGER "trg_blog_categories_require_publish_translations" BEFORE INSERT OR UPDATE OF "status" ON "public"."blog_categories" FOR EACH ROW EXECUTE FUNCTION "public"."require_publish_translations"();



CREATE OR REPLACE TRIGGER "trg_blog_categories_set_publish_timestamps" BEFORE INSERT OR UPDATE ON "public"."blog_categories" FOR EACH ROW EXECUTE FUNCTION "public"."set_publish_timestamps"();



CREATE OR REPLACE TRIGGER "trg_blog_categories_set_updated_at" BEFORE UPDATE ON "public"."blog_categories" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_blog_category_translations_set_updated_at" BEFORE UPDATE ON "public"."blog_category_translations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_blog_post_translations_search_text" BEFORE INSERT OR UPDATE ON "public"."blog_post_translations" FOR EACH ROW EXECUTE FUNCTION "public"."set_blog_post_translation_search_text"();



CREATE OR REPLACE TRIGGER "trg_blog_post_translations_set_updated_at" BEFORE UPDATE ON "public"."blog_post_translations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_blog_posts_require_publish_translations" BEFORE INSERT OR UPDATE OF "status" ON "public"."blog_posts" FOR EACH ROW EXECUTE FUNCTION "public"."require_publish_translations"();



CREATE OR REPLACE TRIGGER "trg_blog_posts_set_publish_timestamps" BEFORE INSERT OR UPDATE ON "public"."blog_posts" FOR EACH ROW EXECUTE FUNCTION "public"."set_publish_timestamps"();



CREATE OR REPLACE TRIGGER "trg_blog_posts_set_updated_at" BEFORE UPDATE ON "public"."blog_posts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_content_page_translations_set_updated_at" BEFORE UPDATE ON "public"."content_page_translations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_content_pages_require_publish_translations" BEFORE INSERT OR UPDATE OF "status" ON "public"."content_pages" FOR EACH ROW EXECUTE FUNCTION "public"."require_publish_translations"();



CREATE OR REPLACE TRIGGER "trg_content_pages_set_publish_timestamps" BEFORE INSERT OR UPDATE ON "public"."content_pages" FOR EACH ROW EXECUTE FUNCTION "public"."set_publish_timestamps"();



CREATE OR REPLACE TRIGGER "trg_content_pages_set_updated_at" BEFORE UPDATE ON "public"."content_pages" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_media_asset_translations_set_updated_at" BEFORE UPDATE ON "public"."media_asset_translations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_media_assets_set_updated_at" BEFORE UPDATE ON "public"."media_assets" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_page_media_set_updated_at" BEFORE UPDATE ON "public"."page_media" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_page_section_translations_set_updated_at" BEFORE UPDATE ON "public"."page_section_translations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_page_sections_set_updated_at" BEFORE UPDATE ON "public"."page_sections" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_product_attribute_definition_translations_set_updated_at" BEFORE UPDATE ON "public"."product_attribute_definition_translations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_product_attribute_definitions_set_updated_at" BEFORE UPDATE ON "public"."product_attribute_definitions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_product_attribute_option_translations_set_updated_at" BEFORE UPDATE ON "public"."product_attribute_option_translations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_product_attribute_options_set_updated_at" BEFORE UPDATE ON "public"."product_attribute_options" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_product_attribute_values_set_updated_at" BEFORE UPDATE ON "public"."product_attribute_values" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_product_categories_require_publish_translations" BEFORE INSERT OR UPDATE OF "status" ON "public"."product_categories" FOR EACH ROW EXECUTE FUNCTION "public"."require_publish_translations"();



CREATE OR REPLACE TRIGGER "trg_product_categories_set_publish_timestamps" BEFORE INSERT OR UPDATE ON "public"."product_categories" FOR EACH ROW EXECUTE FUNCTION "public"."set_publish_timestamps"();



CREATE OR REPLACE TRIGGER "trg_product_categories_set_updated_at" BEFORE UPDATE ON "public"."product_categories" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_product_category_translations_set_updated_at" BEFORE UPDATE ON "public"."product_category_translations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_product_media_set_updated_at" BEFORE UPDATE ON "public"."product_media" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_product_translations_search_text" BEFORE INSERT OR UPDATE ON "public"."product_translations" FOR EACH ROW EXECUTE FUNCTION "public"."set_product_translation_search_text"();



CREATE OR REPLACE TRIGGER "trg_product_translations_set_updated_at" BEFORE UPDATE ON "public"."product_translations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_products_require_publish_translations" BEFORE INSERT OR UPDATE OF "status" ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."require_publish_translations"();



CREATE OR REPLACE TRIGGER "trg_products_set_archive_timestamp" BEFORE INSERT OR UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."set_product_archive_timestamp"();



CREATE OR REPLACE TRIGGER "trg_products_set_publish_timestamps" BEFORE INSERT OR UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."set_publish_timestamps"();



CREATE OR REPLACE TRIGGER "trg_products_set_updated_at" BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_profiles_set_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_quote_notifications_set_updated_at" BEFORE UPDATE ON "public"."quote_notifications" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_quote_recipients_set_updated_at" BEFORE UPDATE ON "public"."quote_recipients" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_quote_request_events_append_only" BEFORE DELETE OR UPDATE ON "public"."quote_request_events" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_update_delete"();



CREATE OR REPLACE TRIGGER "trg_quote_requests_set_updated_at" BEFORE UPDATE ON "public"."quote_requests" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_showroom_media_set_updated_at" BEFORE UPDATE ON "public"."showroom_media" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_showroom_translations_set_updated_at" BEFORE UPDATE ON "public"."showroom_translations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_showrooms_require_publish_translations" BEFORE INSERT OR UPDATE OF "status" ON "public"."showrooms" FOR EACH ROW EXECUTE FUNCTION "public"."require_publish_translations"();



CREATE OR REPLACE TRIGGER "trg_showrooms_set_publish_timestamps" BEFORE INSERT OR UPDATE ON "public"."showrooms" FOR EACH ROW EXECUTE FUNCTION "public"."set_publish_timestamps"();



CREATE OR REPLACE TRIGGER "trg_showrooms_set_updated_at" BEFORE UPDATE ON "public"."showrooms" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_site_setting_translations_set_updated_at" BEFORE UPDATE ON "public"."site_setting_translations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_site_settings_set_updated_at" BEFORE UPDATE ON "public"."site_settings" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_social_links_set_updated_at" BEFORE UPDATE ON "public"."social_links" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."ai_drafts"
    ADD CONSTRAINT "fk_ai_drafts_requested_by" FOREIGN KEY ("requested_by") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."ai_drafts"
    ADD CONSTRAINT "fk_ai_drafts_reviewed_by" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "fk_audit_logs_actor" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."blog_categories"
    ADD CONSTRAINT "fk_blog_categories_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."blog_categories"
    ADD CONSTRAINT "fk_blog_categories_updated_by" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."blog_category_translations"
    ADD CONSTRAINT "fk_blog_category_translations_category" FOREIGN KEY ("category_id") REFERENCES "public"."blog_categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."blog_category_translations"
    ADD CONSTRAINT "fk_blog_category_translations_og_media" FOREIGN KEY ("og_image_media_id") REFERENCES "public"."media_assets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."blog_post_translations"
    ADD CONSTRAINT "fk_blog_post_translations_og_media" FOREIGN KEY ("og_image_media_id") REFERENCES "public"."media_assets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."blog_post_translations"
    ADD CONSTRAINT "fk_blog_post_translations_post" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "fk_blog_posts_author" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "fk_blog_posts_category" FOREIGN KEY ("category_id") REFERENCES "public"."blog_categories"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "fk_blog_posts_cover_media" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media_assets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "fk_blog_posts_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "fk_blog_posts_updated_by" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."brand_translations"
    ADD CONSTRAINT "fk_brand_translations_brand" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "fk_brands_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "fk_brands_logo_media" FOREIGN KEY ("logo_media_id") REFERENCES "public"."media_assets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "fk_brands_updated_by" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."content_page_translations"
    ADD CONSTRAINT "fk_content_page_translations_og_media" FOREIGN KEY ("og_image_media_id") REFERENCES "public"."media_assets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."content_page_translations"
    ADD CONSTRAINT "fk_content_page_translations_page" FOREIGN KEY ("page_id") REFERENCES "public"."content_pages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."content_pages"
    ADD CONSTRAINT "fk_content_pages_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."content_pages"
    ADD CONSTRAINT "fk_content_pages_updated_by" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."media_asset_translations"
    ADD CONSTRAINT "fk_media_asset_translations_media" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."media_assets"
    ADD CONSTRAINT "fk_media_assets_uploaded_by" FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."page_media"
    ADD CONSTRAINT "fk_page_media_media" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."page_media"
    ADD CONSTRAINT "fk_page_media_page" FOREIGN KEY ("page_id") REFERENCES "public"."content_pages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."page_section_translations"
    ADD CONSTRAINT "fk_page_section_translations_section" FOREIGN KEY ("section_id") REFERENCES "public"."page_sections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."page_sections"
    ADD CONSTRAINT "fk_page_sections_media" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."page_sections"
    ADD CONSTRAINT "fk_page_sections_page" FOREIGN KEY ("page_id") REFERENCES "public"."content_pages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_attribute_definition_translations"
    ADD CONSTRAINT "fk_product_attribute_definition_translations_definition" FOREIGN KEY ("definition_id") REFERENCES "public"."product_attribute_definitions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_attribute_definitions"
    ADD CONSTRAINT "fk_product_attribute_definitions_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."product_attribute_definitions"
    ADD CONSTRAINT "fk_product_attribute_definitions_updated_by" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."product_attribute_option_translations"
    ADD CONSTRAINT "fk_product_attribute_option_translations_option" FOREIGN KEY ("option_id") REFERENCES "public"."product_attribute_options"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_attribute_options"
    ADD CONSTRAINT "fk_product_attribute_options_definition" FOREIGN KEY ("definition_id") REFERENCES "public"."product_attribute_definitions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_attribute_values"
    ADD CONSTRAINT "fk_product_attribute_values_definition" FOREIGN KEY ("attribute_definition_id") REFERENCES "public"."product_attribute_definitions"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."product_attribute_values"
    ADD CONSTRAINT "fk_product_attribute_values_option" FOREIGN KEY ("attribute_option_id") REFERENCES "public"."product_attribute_options"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."product_attribute_values"
    ADD CONSTRAINT "fk_product_attribute_values_option_matches_definition" FOREIGN KEY ("attribute_option_id", "attribute_definition_id") REFERENCES "public"."product_attribute_options"("id", "definition_id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."product_attribute_values"
    ADD CONSTRAINT "fk_product_attribute_values_product" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_categories"
    ADD CONSTRAINT "fk_product_categories_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."product_categories"
    ADD CONSTRAINT "fk_product_categories_image_media" FOREIGN KEY ("image_media_id") REFERENCES "public"."media_assets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."product_categories"
    ADD CONSTRAINT "fk_product_categories_parent" FOREIGN KEY ("parent_id") REFERENCES "public"."product_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."product_categories"
    ADD CONSTRAINT "fk_product_categories_updated_by" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."product_category_translations"
    ADD CONSTRAINT "fk_product_category_translations_category" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_category_translations"
    ADD CONSTRAINT "fk_product_category_translations_og_media" FOREIGN KEY ("og_image_media_id") REFERENCES "public"."media_assets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."product_media"
    ADD CONSTRAINT "fk_product_media_media" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_media"
    ADD CONSTRAINT "fk_product_media_product" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_translations"
    ADD CONSTRAINT "fk_product_translations_og_media" FOREIGN KEY ("og_image_media_id") REFERENCES "public"."media_assets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."product_translations"
    ADD CONSTRAINT "fk_product_translations_product" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "fk_products_brand" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "fk_products_category" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "fk_products_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "fk_products_updated_by" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "fk_profiles_auth_users" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."promotion_targets"
    ADD CONSTRAINT "fk_promotion_targets_promotion" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."promotions"
    ADD CONSTRAINT "fk_promotions_cover_media" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media_assets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."quote_notifications"
    ADD CONSTRAINT "fk_quote_notifications_quote_request" FOREIGN KEY ("quote_request_id") REFERENCES "public"."quote_requests"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quote_recipients"
    ADD CONSTRAINT "fk_quote_recipients_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."quote_recipients"
    ADD CONSTRAINT "fk_quote_recipients_settings" FOREIGN KEY ("site_settings_id") REFERENCES "public"."site_settings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quote_request_events"
    ADD CONSTRAINT "fk_quote_request_events_actor" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."quote_request_events"
    ADD CONSTRAINT "fk_quote_request_events_quote_request" FOREIGN KEY ("quote_request_id") REFERENCES "public"."quote_requests"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quote_requests"
    ADD CONSTRAINT "fk_quote_requests_assigned_to" FOREIGN KEY ("assigned_to") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."quote_requests"
    ADD CONSTRAINT "fk_quote_requests_category" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."quote_requests"
    ADD CONSTRAINT "fk_quote_requests_product" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."showroom_media"
    ADD CONSTRAINT "fk_showroom_media_media" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."showroom_media"
    ADD CONSTRAINT "fk_showroom_media_showroom" FOREIGN KEY ("showroom_id") REFERENCES "public"."showrooms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."showroom_translations"
    ADD CONSTRAINT "fk_showroom_translations_showroom" FOREIGN KEY ("showroom_id") REFERENCES "public"."showrooms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."showrooms"
    ADD CONSTRAINT "fk_showrooms_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."showrooms"
    ADD CONSTRAINT "fk_showrooms_updated_by" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."site_setting_translations"
    ADD CONSTRAINT "fk_site_setting_translations_settings" FOREIGN KEY ("site_settings_id") REFERENCES "public"."site_settings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "fk_site_settings_default_og_media" FOREIGN KEY ("default_og_image_media_id") REFERENCES "public"."media_assets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "fk_site_settings_favicon_media" FOREIGN KEY ("favicon_media_id") REFERENCES "public"."media_assets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "fk_site_settings_logo_media" FOREIGN KEY ("logo_media_id") REFERENCES "public"."media_assets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "fk_site_settings_updated_by" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."social_links"
    ADD CONSTRAINT "fk_social_links_settings" FOREIGN KEY ("site_settings_id") REFERENCES "public"."site_settings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."integration_secrets"
    ADD CONSTRAINT "integration_secrets_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."product_promotions"
    ADD CONSTRAINT "product_promotions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_promotions"
    ADD CONSTRAINT "product_promotions_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."promotion_translations"
    ADD CONSTRAINT "promotion_translations_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE CASCADE;



CREATE POLICY "Admin select secrets" ON "public"."integration_secrets" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."cms_role")))));



CREATE POLICY "Admin write secrets" ON "public"."integration_secrets" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."cms_role"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."cms_role")))));



CREATE POLICY "Admins manage promotion targets" ON "public"."promotion_targets" TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Auth users can read media assets" ON "public"."media_assets" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Editor or admin can insert media assets" ON "public"."media_assets" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."cms_role", 'editor'::"public"."cms_role"]))))));



CREATE POLICY "Editors can manage brand translations" ON "public"."brand_translations" TO "authenticated" USING ("public"."is_editor"());



CREATE POLICY "Editors can manage brands" ON "public"."brands" TO "authenticated" USING ("public"."is_editor"());



CREATE POLICY "Public read brand translations" ON "public"."brand_translations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."brands" "b"
  WHERE (("b"."id" = "brand_translations"."brand_id") AND ("b"."status" = 'published'::"public"."publish_status") AND ("b"."deleted_at" IS NULL)))));



CREATE POLICY "Public read promotion targets" ON "public"."promotion_targets" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."promotions" "p"
  WHERE (("p"."id" = "promotion_targets"."promotion_id") AND ("p"."status" = 'published'::"public"."publish_status") AND (("p"."start_at" IS NULL) OR ("p"."start_at" <= "now"())) AND (("p"."end_at" IS NULL) OR ("p"."end_at" >= "now"()))))));



CREATE POLICY "Public read published brands" ON "public"."brands" FOR SELECT USING ((("status" = 'published'::"public"."publish_status") AND ("deleted_at" IS NULL)));



ALTER TABLE "public"."ai_drafts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "ai_drafts_delete_admin" ON "public"."ai_drafts" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "ai_drafts_insert_own_editor" ON "public"."ai_drafts" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_editor"() AND ("requested_by" = "public"."current_profile_id"())));



CREATE POLICY "ai_drafts_select_admin_or_own" ON "public"."ai_drafts" FOR SELECT TO "authenticated" USING (("public"."is_admin"() OR ("requested_by" = "public"."current_profile_id"())));



CREATE POLICY "ai_drafts_update_admin_or_own" ON "public"."ai_drafts" FOR UPDATE TO "authenticated" USING (("public"."is_admin"() OR ("requested_by" = "public"."current_profile_id"()))) WITH CHECK (("public"."is_admin"() OR (("requested_by" = "public"."current_profile_id"()) AND (("reviewed_by" IS NULL) OR ("reviewed_by" = "public"."current_profile_id"())))));



CREATE POLICY "attribute_def_trans_public_select" ON "public"."product_attribute_definition_translations" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "attribute_defs_public_select" ON "public"."product_attribute_definitions" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "attribute_opt_trans_public_select" ON "public"."product_attribute_option_translations" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "attribute_opts_public_select" ON "public"."product_attribute_options" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "attribute_vals_public_select" ON "public"."product_attribute_values" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "audit_logs_admin_select" ON "public"."audit_logs" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



ALTER TABLE "public"."blog_categories" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "blog_categories_editor_insert" ON "public"."blog_categories" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_editor"());



CREATE POLICY "blog_categories_editor_select" ON "public"."blog_categories" FOR SELECT TO "authenticated" USING ("public"."is_editor"());



CREATE POLICY "blog_categories_editor_update" ON "public"."blog_categories" FOR UPDATE TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



CREATE POLICY "blog_categories_public_select" ON "public"."blog_categories" FOR SELECT TO "authenticated", "anon" USING ((("status" = 'published'::"public"."publish_status") AND ("deleted_at" IS NULL)));



ALTER TABLE "public"."blog_category_translations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "blog_category_translations_editor_all" ON "public"."blog_category_translations" TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



CREATE POLICY "blog_category_translations_public_select" ON "public"."blog_category_translations" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."blog_post_translations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "blog_post_translations_editor_all" ON "public"."blog_post_translations" TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



CREATE POLICY "blog_post_translations_public_select" ON "public"."blog_post_translations" FOR SELECT TO "authenticated", "anon" USING ((EXISTS ( SELECT 1
   FROM "public"."blog_posts" "bp"
  WHERE (("bp"."id" = "blog_post_translations"."post_id") AND ("bp"."status" = 'published'::"public"."publish_status") AND ("bp"."deleted_at" IS NULL)))));



ALTER TABLE "public"."blog_posts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "blog_posts_editor_insert" ON "public"."blog_posts" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_editor"());



CREATE POLICY "blog_posts_editor_select" ON "public"."blog_posts" FOR SELECT TO "authenticated" USING ("public"."is_editor"());



CREATE POLICY "blog_posts_editor_update" ON "public"."blog_posts" FOR UPDATE TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



CREATE POLICY "blog_posts_public_select" ON "public"."blog_posts" FOR SELECT TO "authenticated", "anon" USING ((("status" = 'published'::"public"."publish_status") AND ("deleted_at" IS NULL)));



ALTER TABLE "public"."brand_translations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."brands" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."content_page_translations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "content_page_translations_editor_all" ON "public"."content_page_translations" TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



CREATE POLICY "content_page_translations_public_select" ON "public"."content_page_translations" FOR SELECT TO "authenticated", "anon" USING ((EXISTS ( SELECT 1
   FROM "public"."content_pages" "cp"
  WHERE (("cp"."id" = "content_page_translations"."page_id") AND ("cp"."status" = 'published'::"public"."publish_status") AND ("cp"."deleted_at" IS NULL)))));



ALTER TABLE "public"."content_pages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "content_pages_editor_insert" ON "public"."content_pages" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_editor"());



CREATE POLICY "content_pages_editor_select" ON "public"."content_pages" FOR SELECT TO "authenticated" USING ("public"."is_editor"());



CREATE POLICY "content_pages_editor_update" ON "public"."content_pages" FOR UPDATE TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



CREATE POLICY "content_pages_public_select" ON "public"."content_pages" FOR SELECT TO "authenticated", "anon" USING ((("status" = 'published'::"public"."publish_status") AND ("deleted_at" IS NULL)));



ALTER TABLE "public"."integration_secrets" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "media_asset_trans_public_read" ON "public"."media_asset_translations" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."media_asset_translations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "media_asset_translations_editor_all" ON "public"."media_asset_translations" TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



ALTER TABLE "public"."media_assets" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "media_assets_editor_insert" ON "public"."media_assets" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_editor"());



CREATE POLICY "media_assets_editor_select" ON "public"."media_assets" FOR SELECT TO "authenticated" USING ("public"."is_editor"());



CREATE POLICY "media_assets_editor_update" ON "public"."media_assets" FOR UPDATE TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



CREATE POLICY "media_assets_public_read" ON "public"."media_assets" FOR SELECT TO "authenticated", "anon" USING (("status" = 'active'::"public"."media_status"));



ALTER TABLE "public"."page_media" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "page_media_editor_all" ON "public"."page_media" TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



CREATE POLICY "page_media_public_select" ON "public"."page_media" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."page_section_translations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "page_section_translations_editor_all" ON "public"."page_section_translations" TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



CREATE POLICY "page_section_translations_public_select" ON "public"."page_section_translations" FOR SELECT TO "authenticated", "anon" USING ((EXISTS ( SELECT 1
   FROM ("public"."page_sections" "ps"
     JOIN "public"."content_pages" "cp" ON (("cp"."id" = "ps"."page_id")))
  WHERE (("ps"."id" = "page_section_translations"."section_id") AND ("cp"."status" = 'published'::"public"."publish_status") AND ("cp"."deleted_at" IS NULL)))));



ALTER TABLE "public"."page_sections" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "page_sections_editor_all" ON "public"."page_sections" TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



CREATE POLICY "page_sections_public_select" ON "public"."page_sections" FOR SELECT TO "authenticated", "anon" USING ((EXISTS ( SELECT 1
   FROM "public"."content_pages" "cp"
  WHERE (("cp"."id" = "page_sections"."page_id") AND ("cp"."status" = 'published'::"public"."publish_status") AND ("cp"."deleted_at" IS NULL)))));



ALTER TABLE "public"."product_attribute_definition_translations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_attribute_definition_translations_editor_all" ON "public"."product_attribute_definition_translations" TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



ALTER TABLE "public"."product_attribute_definitions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_attribute_definitions_editor_insert" ON "public"."product_attribute_definitions" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_editor"());



CREATE POLICY "product_attribute_definitions_editor_select" ON "public"."product_attribute_definitions" FOR SELECT TO "authenticated" USING ("public"."is_editor"());



CREATE POLICY "product_attribute_definitions_editor_update" ON "public"."product_attribute_definitions" FOR UPDATE TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



ALTER TABLE "public"."product_attribute_option_translations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_attribute_option_translations_editor_all" ON "public"."product_attribute_option_translations" TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



ALTER TABLE "public"."product_attribute_options" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_attribute_options_editor_insert" ON "public"."product_attribute_options" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_editor"());



CREATE POLICY "product_attribute_options_editor_select" ON "public"."product_attribute_options" FOR SELECT TO "authenticated" USING ("public"."is_editor"());



CREATE POLICY "product_attribute_options_editor_update" ON "public"."product_attribute_options" FOR UPDATE TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



ALTER TABLE "public"."product_attribute_values" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_attribute_values_editor_all" ON "public"."product_attribute_values" TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



ALTER TABLE "public"."product_categories" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_categories_editor_insert" ON "public"."product_categories" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_editor"());



CREATE POLICY "product_categories_editor_select" ON "public"."product_categories" FOR SELECT TO "authenticated" USING ("public"."is_editor"());



CREATE POLICY "product_categories_editor_update" ON "public"."product_categories" FOR UPDATE TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



CREATE POLICY "product_categories_public_select" ON "public"."product_categories" FOR SELECT TO "authenticated", "anon" USING ((("status" = 'published'::"public"."publish_status") AND ("deleted_at" IS NULL)));



ALTER TABLE "public"."product_category_translations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_category_translations_editor_all" ON "public"."product_category_translations" TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



CREATE POLICY "product_category_translations_public_select" ON "public"."product_category_translations" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."product_media" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_media_editor_all" ON "public"."product_media" TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



CREATE POLICY "product_media_public_select" ON "public"."product_media" FOR SELECT TO "authenticated", "anon" USING ((EXISTS ( SELECT 1
   FROM "public"."products" "p"
  WHERE (("p"."id" = "product_media"."product_id") AND ("p"."status" = 'published'::"public"."publish_status") AND ("p"."deleted_at" IS NULL)))));



ALTER TABLE "public"."product_promotions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_promotions_editor_all" ON "public"."product_promotions" TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



CREATE POLICY "product_promotions_select" ON "public"."product_promotions" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."product_translations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_translations_editor_all" ON "public"."product_translations" TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



CREATE POLICY "product_translations_public_select" ON "public"."product_translations" FOR SELECT TO "authenticated", "anon" USING ((EXISTS ( SELECT 1
   FROM "public"."products" "p"
  WHERE (("p"."id" = "product_translations"."product_id") AND ("p"."status" = 'published'::"public"."publish_status") AND ("p"."deleted_at" IS NULL)))));



ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "products_editor_insert" ON "public"."products" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_editor"());



CREATE POLICY "products_editor_select" ON "public"."products" FOR SELECT TO "authenticated" USING ("public"."is_editor"());



CREATE POLICY "products_editor_update" ON "public"."products" FOR UPDATE TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



CREATE POLICY "products_public_select" ON "public"."products" FOR SELECT TO "authenticated", "anon" USING ((("status" = 'published'::"public"."publish_status") AND ("deleted_at" IS NULL)));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_insert_admin" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "profiles_select_own_or_admin" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("public"."is_own_profile"("id") OR "public"."is_admin"()));



CREATE POLICY "profiles_update_admin" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."promotion_targets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."promotion_translations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "promotion_translations_editor_all" ON "public"."promotion_translations" TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



ALTER TABLE "public"."promotions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "promotions_editor_insert" ON "public"."promotions" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_editor"());



CREATE POLICY "promotions_editor_select" ON "public"."promotions" FOR SELECT TO "authenticated" USING ("public"."is_editor"());



CREATE POLICY "promotions_editor_update" ON "public"."promotions" FOR UPDATE TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



ALTER TABLE "public"."quote_notifications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "quote_notifications_admin_insert" ON "public"."quote_notifications" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "quote_notifications_admin_select" ON "public"."quote_notifications" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "quote_notifications_admin_update" ON "public"."quote_notifications" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."quote_recipients" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "quote_recipients_admin_all" ON "public"."quote_recipients" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."quote_request_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "quote_request_events_admin_insert" ON "public"."quote_request_events" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "quote_request_events_admin_select" ON "public"."quote_request_events" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



ALTER TABLE "public"."quote_requests" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "quote_requests_admin_insert" ON "public"."quote_requests" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "quote_requests_admin_select" ON "public"."quote_requests" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "quote_requests_admin_update" ON "public"."quote_requests" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "service_role_all" ON "public"."ai_drafts" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."audit_logs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."blog_categories" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."blog_category_translations" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."blog_post_translations" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."blog_posts" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."content_page_translations" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."content_pages" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."media_asset_translations" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."media_assets" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."page_media" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."page_section_translations" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."page_sections" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."product_attribute_definition_translations" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."product_attribute_definitions" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."product_attribute_option_translations" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."product_attribute_options" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."product_attribute_values" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."product_categories" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."product_category_translations" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."product_media" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."product_translations" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."products" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."profiles" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."promotion_translations" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."promotions" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."quote_notifications" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."quote_recipients" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."quote_request_events" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."quote_requests" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."showroom_media" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."showroom_translations" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."showrooms" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."site_setting_translations" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."site_settings" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all" ON "public"."social_links" TO "service_role" USING (true) WITH CHECK (true);



ALTER TABLE "public"."showroom_media" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "showroom_media_editor_all" ON "public"."showroom_media" TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



CREATE POLICY "showroom_media_public_select" ON "public"."showroom_media" FOR SELECT TO "authenticated", "anon" USING ((EXISTS ( SELECT 1
   FROM "public"."showrooms" "s"
  WHERE (("s"."id" = "showroom_media"."showroom_id") AND ("s"."status" = 'published'::"public"."publish_status") AND ("s"."deleted_at" IS NULL)))));



ALTER TABLE "public"."showroom_translations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "showroom_translations_editor_all" ON "public"."showroom_translations" TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



CREATE POLICY "showroom_translations_public_select" ON "public"."showroom_translations" FOR SELECT TO "authenticated", "anon" USING ((EXISTS ( SELECT 1
   FROM "public"."showrooms" "s"
  WHERE (("s"."id" = "showroom_translations"."showroom_id") AND ("s"."status" = 'published'::"public"."publish_status") AND ("s"."deleted_at" IS NULL)))));



ALTER TABLE "public"."showrooms" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "showrooms_editor_insert" ON "public"."showrooms" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_editor"());



CREATE POLICY "showrooms_editor_select" ON "public"."showrooms" FOR SELECT TO "authenticated" USING ("public"."is_editor"());



CREATE POLICY "showrooms_editor_update" ON "public"."showrooms" FOR UPDATE TO "authenticated" USING ("public"."is_editor"()) WITH CHECK ("public"."is_editor"());



CREATE POLICY "showrooms_public_select" ON "public"."showrooms" FOR SELECT TO "authenticated", "anon" USING ((("status" = 'published'::"public"."publish_status") AND ("deleted_at" IS NULL)));



ALTER TABLE "public"."site_setting_translations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "site_setting_translations_admin_delete" ON "public"."site_setting_translations" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "site_setting_translations_admin_insert" ON "public"."site_setting_translations" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "site_setting_translations_admin_update" ON "public"."site_setting_translations" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "site_setting_translations_editor_read" ON "public"."site_setting_translations" FOR SELECT TO "authenticated" USING ("public"."is_editor"());



ALTER TABLE "public"."site_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "site_settings_admin_delete" ON "public"."site_settings" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "site_settings_admin_insert" ON "public"."site_settings" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "site_settings_admin_update" ON "public"."site_settings" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "site_settings_editor_read" ON "public"."site_settings" FOR SELECT TO "authenticated" USING ("public"."is_editor"());



CREATE POLICY "site_settings_public_read" ON "public"."site_settings" FOR SELECT TO "anon" USING (true);



CREATE POLICY "site_settings_trans_public_read" ON "public"."site_setting_translations" FOR SELECT TO "anon" USING (true);



ALTER TABLE "public"."social_links" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "social_links_admin_delete" ON "public"."social_links" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "social_links_admin_insert" ON "public"."social_links" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "social_links_admin_update" ON "public"."social_links" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "social_links_editor_read" ON "public"."social_links" FOR SELECT TO "authenticated" USING ("public"."is_editor"());



CREATE POLICY "social_links_public_select" ON "public"."social_links" FOR SELECT TO "authenticated", "anon" USING (("is_enabled" = true));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";





































































































































































































































































REVOKE ALL ON FUNCTION "public"."admin_quote_search"("p_status" "public"."quote_status", "p_keyword" "text", "p_date_from" timestamp with time zone, "p_date_to" timestamp with time zone, "p_source_path" "text", "p_assigned_to" "uuid", "p_limit" integer, "p_offset" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_quote_search"("p_status" "public"."quote_status", "p_keyword" "text", "p_date_from" timestamp with time zone, "p_date_to" timestamp with time zone, "p_source_path" "text", "p_assigned_to" "uuid", "p_limit" integer, "p_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."admin_quote_search"("p_status" "public"."quote_status", "p_keyword" "text", "p_date_from" timestamp with time zone, "p_date_to" timestamp with time zone, "p_source_path" "text", "p_assigned_to" "uuid", "p_limit" integer, "p_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_quote_search"("p_status" "public"."quote_status", "p_keyword" "text", "p_date_from" timestamp with time zone, "p_date_to" timestamp with time zone, "p_source_path" "text", "p_assigned_to" "uuid", "p_limit" integer, "p_offset" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."can_manage_private_admin_data"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."can_manage_private_admin_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."can_manage_private_admin_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_manage_private_admin_data"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."can_manage_publishable_content"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."can_manage_publishable_content"() TO "anon";
GRANT ALL ON FUNCTION "public"."can_manage_publishable_content"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_manage_publishable_content"() TO "service_role";



GRANT ALL ON FUNCTION "public"."compact_text"("input" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."compact_text"("input" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."compact_text"("input" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."current_profile_id"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."current_profile_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_profile_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_profile_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_active_promotions_for_product"("p_product_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_active_promotions_for_product"("p_product_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_active_promotions_for_product"("p_product_id" "uuid") TO "service_role";



-- SECURITY: anon must NOT be able to call this admin-only lead-history function.
REVOKE ALL ON FUNCTION "public"."get_quote_status_logs"("p_quote_id" "uuid") FROM "anon";
GRANT ALL ON FUNCTION "public"."get_quote_status_logs"("p_quote_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_quote_status_logs"("p_quote_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."immutable_unaccent"("input" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."immutable_unaccent"("input" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."immutable_unaccent"("input" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_admin"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_editor"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_editor"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_editor"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_editor"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_own_profile"("profile_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_own_profile"("profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_own_profile"("profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_own_profile"("profile_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_service_role"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_service_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_service_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_service_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_update_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_update_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_update_delete"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."public_blog_posts"("p_locale" "public"."locale_code", "p_category_slug" "text", "p_q" "text", "p_featured" boolean, "p_limit" integer, "p_offset" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."public_blog_posts"("p_locale" "public"."locale_code", "p_category_slug" "text", "p_q" "text", "p_featured" boolean, "p_limit" integer, "p_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."public_blog_posts"("p_locale" "public"."locale_code", "p_category_slug" "text", "p_q" "text", "p_featured" boolean, "p_limit" integer, "p_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."public_blog_posts"("p_locale" "public"."locale_code", "p_category_slug" "text", "p_q" "text", "p_featured" boolean, "p_limit" integer, "p_offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."public_products"("p_locale" "text", "p_category_slug" "text", "p_group_key" "text", "p_q" "text", "p_price_min" numeric, "p_price_max" numeric, "p_attribute_filters" "jsonb", "p_featured" boolean, "p_limit" integer, "p_offset" integer, "p_brand_slug" "text", "p_has_discount" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."public_products"("p_locale" "text", "p_category_slug" "text", "p_group_key" "text", "p_q" "text", "p_price_min" numeric, "p_price_max" numeric, "p_attribute_filters" "jsonb", "p_featured" boolean, "p_limit" integer, "p_offset" integer, "p_brand_slug" "text", "p_has_discount" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."public_products"("p_locale" "text", "p_category_slug" "text", "p_group_key" "text", "p_q" "text", "p_price_min" numeric, "p_price_max" numeric, "p_attribute_filters" "jsonb", "p_featured" boolean, "p_limit" integer, "p_offset" integer, "p_brand_slug" "text", "p_has_discount" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."public_promotions"("p_locale" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."public_promotions"("p_locale" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."public_promotions"("p_locale" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."public_showrooms"("p_locale" "public"."locale_code") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."public_showrooms"("p_locale" "public"."locale_code") TO "anon";
GRANT ALL ON FUNCTION "public"."public_showrooms"("p_locale" "public"."locale_code") TO "authenticated";
GRANT ALL ON FUNCTION "public"."public_showrooms"("p_locale" "public"."locale_code") TO "service_role";



GRANT ALL ON FUNCTION "public"."require_publish_translations"() TO "anon";
GRANT ALL ON FUNCTION "public"."require_publish_translations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."require_publish_translations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_blog_post_translation_search_text"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_blog_post_translation_search_text"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_blog_post_translation_search_text"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_product_archive_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_product_archive_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_product_archive_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_product_translation_search_text"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_product_translation_search_text"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_product_translation_search_text"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_publish_timestamps"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_publish_timestamps"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_publish_timestamps"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."submit_quote_request"("payload" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."submit_quote_request"("payload" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."submit_quote_request"("payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_quote_request"("payload" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."to_simple_tsvector"(VARIADIC "parts" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."to_simple_tsvector"(VARIADIC "parts" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."to_simple_tsvector"(VARIADIC "parts" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_quote_status"("p_quote_id" "uuid", "p_new_status" "text", "p_note" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_quote_status"("p_quote_id" "uuid", "p_new_status" "text", "p_note" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_quote_status"("p_quote_id" "uuid", "p_new_status" "text", "p_note" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."ai_drafts" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."ai_drafts" TO "authenticated";



GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";
GRANT SELECT ON TABLE "public"."audit_logs" TO "authenticated";



GRANT ALL ON TABLE "public"."blog_categories" TO "service_role";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."blog_categories" TO "authenticated";
GRANT SELECT ON TABLE "public"."blog_categories" TO "anon";



GRANT ALL ON TABLE "public"."blog_category_translations" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."blog_category_translations" TO "authenticated";
GRANT SELECT ON TABLE "public"."blog_category_translations" TO "anon";



GRANT ALL ON TABLE "public"."blog_post_translations" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."blog_post_translations" TO "authenticated";
GRANT SELECT ON TABLE "public"."blog_post_translations" TO "anon";



GRANT ALL ON TABLE "public"."blog_posts" TO "service_role";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."blog_posts" TO "authenticated";
GRANT SELECT ON TABLE "public"."blog_posts" TO "anon";



GRANT SELECT ON TABLE "public"."brand_translations" TO "anon";
GRANT ALL ON TABLE "public"."brand_translations" TO "authenticated";
GRANT ALL ON TABLE "public"."brand_translations" TO "service_role";



GRANT SELECT ON TABLE "public"."brands" TO "anon";
GRANT ALL ON TABLE "public"."brands" TO "authenticated";
GRANT ALL ON TABLE "public"."brands" TO "service_role";



GRANT ALL ON TABLE "public"."content_page_translations" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."content_page_translations" TO "authenticated";
GRANT SELECT ON TABLE "public"."content_page_translations" TO "anon";



GRANT ALL ON TABLE "public"."content_pages" TO "service_role";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."content_pages" TO "authenticated";
GRANT SELECT ON TABLE "public"."content_pages" TO "anon";



GRANT ALL ON TABLE "public"."integration_secrets" TO "service_role";



GRANT ALL ON TABLE "public"."media_asset_translations" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."media_asset_translations" TO "authenticated";
GRANT SELECT ON TABLE "public"."media_asset_translations" TO "anon";



GRANT ALL ON TABLE "public"."media_assets" TO "service_role";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."media_assets" TO "authenticated";
GRANT SELECT ON TABLE "public"."media_assets" TO "anon";



GRANT ALL ON TABLE "public"."page_media" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."page_media" TO "authenticated";
GRANT SELECT ON TABLE "public"."page_media" TO "anon";



GRANT ALL ON TABLE "public"."page_section_translations" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."page_section_translations" TO "authenticated";
GRANT SELECT ON TABLE "public"."page_section_translations" TO "anon";



GRANT ALL ON TABLE "public"."page_sections" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."page_sections" TO "authenticated";
GRANT SELECT ON TABLE "public"."page_sections" TO "anon";



GRANT ALL ON TABLE "public"."product_attribute_definition_translations" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."product_attribute_definition_translations" TO "authenticated";
GRANT SELECT ON TABLE "public"."product_attribute_definition_translations" TO "anon";



GRANT ALL ON TABLE "public"."product_attribute_definitions" TO "service_role";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."product_attribute_definitions" TO "authenticated";
GRANT SELECT ON TABLE "public"."product_attribute_definitions" TO "anon";



GRANT ALL ON TABLE "public"."product_attribute_option_translations" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."product_attribute_option_translations" TO "authenticated";
GRANT SELECT ON TABLE "public"."product_attribute_option_translations" TO "anon";



GRANT ALL ON TABLE "public"."product_attribute_options" TO "service_role";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."product_attribute_options" TO "authenticated";
GRANT SELECT ON TABLE "public"."product_attribute_options" TO "anon";



GRANT ALL ON TABLE "public"."product_attribute_values" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."product_attribute_values" TO "authenticated";
GRANT SELECT ON TABLE "public"."product_attribute_values" TO "anon";



GRANT ALL ON TABLE "public"."product_categories" TO "service_role";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."product_categories" TO "authenticated";
GRANT SELECT ON TABLE "public"."product_categories" TO "anon";



GRANT ALL ON TABLE "public"."product_category_translations" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."product_category_translations" TO "authenticated";
GRANT SELECT ON TABLE "public"."product_category_translations" TO "anon";



GRANT ALL ON TABLE "public"."product_media" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."product_media" TO "authenticated";
GRANT SELECT ON TABLE "public"."product_media" TO "anon";



GRANT ALL ON TABLE "public"."product_promotions" TO "service_role";
GRANT SELECT ON TABLE "public"."product_promotions" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."product_promotions" TO "authenticated";



GRANT ALL ON TABLE "public"."product_translations" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."product_translations" TO "authenticated";
GRANT SELECT ON TABLE "public"."product_translations" TO "anon";



GRANT ALL ON TABLE "public"."products" TO "service_role";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."products" TO "authenticated";
GRANT SELECT ON TABLE "public"."products" TO "anon";



GRANT ALL ON TABLE "public"."profiles" TO "service_role";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."profiles" TO "authenticated";



GRANT SELECT ON TABLE "public"."promotion_targets" TO "anon";
GRANT ALL ON TABLE "public"."promotion_targets" TO "authenticated";
GRANT ALL ON TABLE "public"."promotion_targets" TO "service_role";



GRANT ALL ON TABLE "public"."promotion_translations" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."promotion_translations" TO "authenticated";



GRANT ALL ON TABLE "public"."promotions" TO "service_role";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."promotions" TO "authenticated";



GRANT ALL ON TABLE "public"."quote_notifications" TO "service_role";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."quote_notifications" TO "authenticated";



GRANT ALL ON TABLE "public"."quote_recipients" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."quote_recipients" TO "authenticated";



GRANT ALL ON TABLE "public"."quote_request_events" TO "service_role";
GRANT SELECT,INSERT ON TABLE "public"."quote_request_events" TO "authenticated";



GRANT ALL ON TABLE "public"."quote_requests" TO "service_role";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."quote_requests" TO "authenticated";



GRANT ALL ON TABLE "public"."showroom_media" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."showroom_media" TO "authenticated";
GRANT SELECT ON TABLE "public"."showroom_media" TO "anon";



GRANT ALL ON TABLE "public"."showroom_translations" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."showroom_translations" TO "authenticated";
GRANT SELECT ON TABLE "public"."showroom_translations" TO "anon";



GRANT ALL ON TABLE "public"."showrooms" TO "service_role";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."showrooms" TO "authenticated";
GRANT SELECT ON TABLE "public"."showrooms" TO "anon";



GRANT ALL ON TABLE "public"."site_setting_translations" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."site_setting_translations" TO "authenticated";
GRANT SELECT ON TABLE "public"."site_setting_translations" TO "anon";



GRANT ALL ON TABLE "public"."site_settings" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."site_settings" TO "authenticated";
GRANT SELECT ON TABLE "public"."site_settings" TO "anon";



GRANT ALL ON TABLE "public"."social_links" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."social_links" TO "authenticated";
GRANT SELECT ON TABLE "public"."social_links" TO "anon";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
