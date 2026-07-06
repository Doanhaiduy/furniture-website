-- 0002_business_logic.sql
-- Consolidated migration so a fresh DB builds from just 0001 + 0002.
-- Merged in order from: 0002_structured_address, 0003_business_logic_fixes,
-- 0004_business_logic_v2, 0005_audit_fixes (audit hardening).

-- ==================== structured address (was 0002) ====================
-- 0002_structured_address.sql
-- Structured Vietnam administrative address using the 2-tier model
-- (Tỉnh/Thành phố -> Phường/Xã) introduced by the 1 July 2025 reform that
-- abolished districts. Codes/names come from provinces.open-api.vn v2.
--
-- Design: additive & nullable so existing rows keep working. The human-readable
-- composed address stays in the *_translations tables (showroom_translations.address,
-- site_setting_translations.contact_address) for display, while these columns hold the
-- machine-usable structure produced by the address picker (enables consistent formatting
-- and future "showrooms in this province" filtering).
--
-- Backfill note: existing free-text addresses are NOT auto-parsed into codes (unreliable);
-- structured columns stay NULL until each showroom / the site contact is re-saved via the picker.

-- ── Showrooms ───────────────────────────────────────────────────────────────
ALTER TABLE "public"."showrooms"
  ADD COLUMN IF NOT EXISTS "province_code" "text",
  ADD COLUMN IF NOT EXISTS "province_name" "text",
  ADD COLUMN IF NOT EXISTS "ward_code" "text",
  ADD COLUMN IF NOT EXISTS "ward_name" "text",
  ADD COLUMN IF NOT EXISTS "street_address" "text";

COMMENT ON COLUMN "public"."showrooms"."province_code" IS 'Vietnam province/city code (provinces.open-api.vn v2, 2-tier model).';
COMMENT ON COLUMN "public"."showrooms"."ward_code" IS 'Vietnam ward/commune code — direct child of province after the 1/7/2025 reform.';
COMMENT ON COLUMN "public"."showrooms"."street_address" IS 'Street / house number portion of the address (locale-neutral).';

CREATE INDEX IF NOT EXISTS "idx_showrooms_province_code"
  ON "public"."showrooms" ("province_code")
  WHERE "deleted_at" IS NULL;

-- ── Site settings (singleton contact address) ───────────────────────────────
ALTER TABLE "public"."site_settings"
  ADD COLUMN IF NOT EXISTS "contact_province_code" "text",
  ADD COLUMN IF NOT EXISTS "contact_province_name" "text",
  ADD COLUMN IF NOT EXISTS "contact_ward_code" "text",
  ADD COLUMN IF NOT EXISTS "contact_ward_name" "text",
  ADD COLUMN IF NOT EXISTS "contact_street" "text";

COMMENT ON COLUMN "public"."site_settings"."contact_province_code" IS 'Vietnam province/city code for the head-office contact address (2-tier model).';
COMMENT ON COLUMN "public"."site_settings"."contact_ward_code" IS 'Vietnam ward/commune code for the head-office contact address.';

-- ==================== business logic fixes (was 0003) ====================
-- 0003_business_logic_fixes.sql
-- Business-logic audit fixes. Three independent concerns, all enforced server/DB-side:
--
--   1. i18n locale fallback (BUG 2) — the public_* readers INNER JOIN the *_translations
--      table on locale = requested. A row that only has a Vietnamese translation therefore
--      DISAPPEARS when the site is viewed in English (and vice-versa). Fixed by replacing the
--      hard locale join with a LATERAL "best translation" pick that prefers the requested
--      locale, then falls back to 'vi', then to whatever translation exists. A row with zero
--      translations is still (correctly) hidden.
--
--   2. Overlapping promotions on one product (BUG 1) — nothing stopped two PUBLISHED
--      promotions whose date ranges overlap from both being attached to the same product,
--      so a product could be "in" two conflicting discount campaigns at once. Enforced with
--      a trigger on product_promotions (new link) and on promotions (date/status change).
--      Business rule chosen: OPTION A — hard block. See check_promotion_product_overlap().
--
--   3. Last-admin lockout (self-discovered, CRITICAL) — nothing stopped the final active
--      admin from being demoted, deactivated, soft-deleted or hard-deleted, which would
--      leave the CMS with nobody able to manage users/settings/leads. Enforced with a trigger
--      on profiles.
--
--   4. Promotion code reuse after soft-delete (self-discovered, MEDIUM) — promotions_code_key
--      is a plain UNIQUE(code) not filtered by deleted_at, so a soft-deleted promo permanently
--      "burns" its code. Replaced with a partial unique index over live rows, matching how
--      products/showrooms already scope their code uniqueness.

-- ════════════════════════════════════════════════════════════════════════════
-- 1. i18n LOCALE FALLBACK (BUG 2)
-- ════════════════════════════════════════════════════════════════════════════

-- Note: The duplicate public_products definition was removed here. The final definition is located further down in the file.


-- ── public_blog_posts ───────────────────────────────────────────────────────
-- Both blog_post_translations AND blog_category_translations were hard locale joins.
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
  -- BUG 2 FIX: locale fallback for the post body.
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
  -- BUG 2 FIX: locale fallback for the category label (was hard locale join,
  -- so a VN-only category hid every post under it in EN).
  join lateral (
    select t.*
    from public.blog_category_translations t
    where t.category_id = bc.id
    order by (t.locale = p_locale) desc, (t.locale = 'vi'::public.locale_code) desc, t.created_at
    limit 1
  ) bct on true
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

-- ── public_promotions ───────────────────────────────────────────────────────
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
  -- BUG 2 FIX: locale fallback for promotion title/description.
  JOIN LATERAL (
    SELECT t.*
    FROM public.promotion_translations t
    WHERE t.promotion_id = p.id
    ORDER BY (t.locale = p_locale::public.locale_code) DESC,
             (t.locale = 'vi'::public.locale_code) DESC,
             t.created_at
    LIMIT 1
  ) pt ON TRUE
  LEFT JOIN public.media_assets m
    ON m.id = p.cover_media_id
  WHERE p.status = 'published'::public.publish_status
    AND p.deleted_at IS NULL
    AND (p.start_at IS NULL OR p.start_at <= now())
    AND (p.end_at IS NULL OR p.end_at >= now())
  ORDER BY p.created_at DESC;
END;
$$;

-- ── public_showrooms ────────────────────────────────────────────────────────
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
  -- BUG 2 FIX: locale fallback for showroom name/address.
  join lateral (
    select t.*
    from public.showroom_translations t
    where t.showroom_id = s.id
    order by (t.locale = p_locale) desc, (t.locale = 'vi'::public.locale_code) desc, t.created_at
    limit 1
  ) st on true
  where s.status = 'published'::public.publish_status
    and s.deleted_at is null
  order by s.sort_order, s.created_at, s.id;
$$;

-- ════════════════════════════════════════════════════════════════════════════
-- 2. OVERLAPPING PROMOTIONS ON ONE PRODUCT (BUG 1) — OPTION A: hard block
-- ════════════════════════════════════════════════════════════════════════════
-- Two promotions "conflict" on a product when they are both PUBLISHED, both live
-- (not soft-deleted), both directly linked to the product via product_promotions,
-- and their [start_at, end_at] ranges overlap. NULL start = -infinity, NULL end =
-- +infinity (open-ended campaign). Draft/archived promotions never conflict, so an
-- admin can freely prepare a future promo as a draft and only trip the rule when
-- they publish it into an overlapping window.

-- The candidate promotion's status/start/end are passed EXPLICITLY rather than
-- read from the table: on a BEFORE UPDATE of promotions the table row still holds
-- the OLD values, so re-reading would miss a draft->published transition into an
-- overlapping window. Callers pass NEW (or the committed row) as appropriate.
DROP FUNCTION IF EXISTS "public"."check_promotion_product_overlap"("uuid", "uuid");
CREATE OR REPLACE FUNCTION "public"."check_promotion_product_overlap"("p_product_id" "uuid", "p_promotion_id" "uuid", "p_status" "text", "p_start" timestamp with time zone, "p_end" timestamp with time zone) RETURNS "uuid"
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_conflict uuid;
BEGIN
  -- Only a published candidate can conflict.
  IF p_status IS DISTINCT FROM 'published' THEN
    RETURN NULL;
  END IF;

  SELECT other.id
    INTO v_conflict
  FROM public.product_promotions pp
  JOIN public.promotions other
    ON other.id = pp.promotion_id
   AND other.id <> p_promotion_id
   AND other.deleted_at IS NULL
   AND other.status = 'published'
  WHERE pp.product_id = p_product_id
    -- interval overlap with open (NULL) bounds
    AND (p_start IS NULL OR other.end_at IS NULL OR other.end_at >= p_start)
    AND (p_end IS NULL OR other.start_at IS NULL OR other.start_at <= p_end)
  LIMIT 1;

  RETURN v_conflict;
END;
$$;

ALTER FUNCTION "public"."check_promotion_product_overlap"("uuid", "uuid", "text", timestamp with time zone, timestamp with time zone) OWNER TO "postgres";
COMMENT ON FUNCTION "public"."check_promotion_product_overlap"("uuid", "uuid", "text", timestamp with time zone, timestamp with time zone) IS 'Returns the id of an existing published promotion that overlaps the candidate (status/start/end passed in) on the given product, or NULL. Used by the overlap-prevention triggers and by the CMS to pre-warn admins.';

-- Trigger fired when a product is linked to a promotion.
CREATE OR REPLACE FUNCTION "public"."trg_product_promotions_no_overlap"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_conflict uuid;
  v_code text;
  v_status text;
  v_start timestamptz;
  v_end timestamptz;
BEGIN
  SELECT status::text, start_at, end_at INTO v_status, v_start, v_end
  FROM public.promotions WHERE id = NEW.promotion_id AND deleted_at IS NULL;

  v_conflict := public.check_promotion_product_overlap(NEW.product_id, NEW.promotion_id, v_status, v_start, v_end);
  IF v_conflict IS NOT NULL THEN
    SELECT code INTO v_code FROM public.promotions WHERE id = v_conflict;
    RAISE EXCEPTION 'Product % already has an overlapping published promotion (%).', NEW.product_id, v_code
      USING errcode = '23514',
            hint = 'End or reschedule the conflicting promotion, or remove the product from it, before adding it here.';
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."trg_product_promotions_no_overlap"() OWNER TO "postgres";

DROP TRIGGER IF EXISTS "product_promotions_no_overlap" ON "public"."product_promotions";
CREATE TRIGGER "product_promotions_no_overlap"
  BEFORE INSERT OR UPDATE ON "public"."product_promotions"
  FOR EACH ROW EXECUTE FUNCTION "public"."trg_product_promotions_no_overlap"();

-- Trigger fired when a promotion's schedule/status changes; re-validates every
-- product currently attached so you cannot "publish into" or "extend into" an
-- overlapping window after the links already exist.
CREATE OR REPLACE FUNCTION "public"."trg_promotions_no_overlap"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_row record;
  v_conflict uuid;
  v_code text;
BEGIN
  IF NEW.status <> 'published' OR NEW.deleted_at IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Only re-check when something that affects the overlap window changed.
  IF TG_OP = 'UPDATE'
     AND NEW.status IS NOT DISTINCT FROM OLD.status
     AND NEW.start_at IS NOT DISTINCT FROM OLD.start_at
     AND NEW.end_at IS NOT DISTINCT FROM OLD.end_at THEN
    RETURN NEW;
  END IF;

  FOR v_row IN
    SELECT product_id FROM public.product_promotions WHERE promotion_id = NEW.id
  LOOP
    v_conflict := public.check_promotion_product_overlap(v_row.product_id, NEW.id, NEW.status::text, NEW.start_at, NEW.end_at);
    IF v_conflict IS NOT NULL THEN
      SELECT code INTO v_code FROM public.promotions WHERE id = v_conflict;
      RAISE EXCEPTION 'Publishing/scheduling this promotion overlaps promotion % on product %.', v_code, v_row.product_id
        USING errcode = '23514',
              hint = 'Adjust the dates or detach the shared product before publishing.';
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."trg_promotions_no_overlap"() OWNER TO "postgres";

DROP TRIGGER IF EXISTS "promotions_no_overlap" ON "public"."promotions";
CREATE TRIGGER "promotions_no_overlap"
  BEFORE INSERT OR UPDATE ON "public"."promotions"
  FOR EACH ROW EXECUTE FUNCTION "public"."trg_promotions_no_overlap"();

-- ════════════════════════════════════════════════════════════════════════════
-- 3. LAST-ADMIN LOCKOUT PREVENTION (self-discovered, CRITICAL)
-- ════════════════════════════════════════════════════════════════════════════
-- Guarantees at least one active, non-deleted admin always remains. Fires on any
-- UPDATE that would strip the last admin (role change, deactivate, soft-delete)
-- and on any DELETE of the last admin, regardless of caller (app or service role).

CREATE OR REPLACE FUNCTION "public"."trg_prevent_last_admin_lockout"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_was_active_admin boolean;
  v_still_active_admin boolean;
  v_remaining int;
BEGIN
  v_was_active_admin := (OLD.role = 'admin'::public.cms_role AND OLD.is_active AND OLD.deleted_at IS NULL);
  IF NOT v_was_active_admin THEN
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    v_still_active_admin := (NEW.role = 'admin'::public.cms_role AND NEW.is_active AND NEW.deleted_at IS NULL);
    IF v_still_active_admin THEN
      RETURN NEW; -- still an admin, nothing to guard
    END IF;
  END IF;

  SELECT count(*)
    INTO v_remaining
  FROM public.profiles
  WHERE role = 'admin'::public.cms_role
    AND is_active
    AND deleted_at IS NULL
    AND id <> OLD.id;

  IF v_remaining = 0 THEN
    RAISE EXCEPTION 'Cannot remove the last active admin. Promote another admin first.'
      USING errcode = '23514';
  END IF;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

ALTER FUNCTION "public"."trg_prevent_last_admin_lockout"() OWNER TO "postgres";

DROP TRIGGER IF EXISTS "prevent_last_admin_lockout" ON "public"."profiles";
CREATE TRIGGER "prevent_last_admin_lockout"
  BEFORE UPDATE OR DELETE ON "public"."profiles"
  FOR EACH ROW EXECUTE FUNCTION "public"."trg_prevent_last_admin_lockout"();

-- ════════════════════════════════════════════════════════════════════════════
-- 4. PROMOTION CODE REUSE AFTER SOFT-DELETE (self-discovered, MEDIUM)
-- ════════════════════════════════════════════════════════════════════════════
-- Scope code uniqueness to live rows, matching products/showrooms. A soft-deleted
-- promotion no longer blocks reusing its code. (Case-insensitive to prevent
-- "SUMMER" vs "summer" duplicates.)
ALTER TABLE "public"."promotions" DROP CONSTRAINT IF EXISTS "promotions_code_key";
DROP INDEX IF EXISTS "public"."uq_promotions_code_active";
CREATE UNIQUE INDEX "uq_promotions_code_active"
  ON "public"."promotions" ("lower"("code"))
  WHERE ("deleted_at" IS NULL);

-- ════════════════════════════════════════════════════════════════════════════
-- 6. NO STATUS CHANGES ON A SOFT-DELETED QUOTE (self-discovered S4-guard, MEDIUM)
-- ════════════════════════════════════════════════════════════════════════════
-- Independent of the (still-open) reopen-policy question: a lead that has been
-- soft-deleted must not have its workflow status mutated. Only adds a deleted_at
-- guard; all live-status transitions remain exactly as before.
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
  -- Quote workflow is admin-only (leads are private admin data by RLS), so reopening
  -- a terminal lead is inherently restricted to admins. S4: reopening is allowed but
  -- always audited to quote_request_events with actor + timestamp + reason.
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

  -- S4 guard: refuse to mutate a soft-deleted lead.
  IF v_deleted_at IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Quote is archived and cannot change status');
  END IF;

  -- S4: a reopen is a transition from a terminal state back to an open state.
  -- Guarantee an audit reason is recorded even when the caller omits one.
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
-- 7. DETACH product_promotions WHEN A PRODUCT IS SOFT-DELETED (S6-cleanup, LOW)
-- ════════════════════════════════════════════════════════════════════════════
-- A soft-deleted product still holds its promotion "slot" (product_promotions is
-- only cascaded on HARD delete). It then keeps blocking overlapping promos and is
-- counted by campaigns even though it is hidden from the site. Drop the links when
-- a product transitions to soft-deleted.
CREATE OR REPLACE FUNCTION "public"."trg_detach_promotions_on_product_soft_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    DELETE FROM public.product_promotions WHERE product_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."trg_detach_promotions_on_product_soft_delete"() OWNER TO "postgres";

DROP TRIGGER IF EXISTS "detach_promotions_on_product_soft_delete" ON "public"."products";
CREATE TRIGGER "detach_promotions_on_product_soft_delete"
  AFTER UPDATE OF "deleted_at" ON "public"."products"
  FOR EACH ROW EXECUTE FUNCTION "public"."trg_detach_promotions_on_product_soft_delete"();

-- ════════════════════════════════════════════════════════════════════════════
-- 8. BLOCK DELETING MEDIA THAT IS STILL REFERENCED (S6, MEDIUM)
-- ════════════════════════════════════════════════════════════════════════════
-- Media "delete" in the CMS is a soft update (status='archived'), so the FK
-- ON DELETE SET NULL/CASCADE rules never fire — the reference stays while the
-- physical Cloudinary file is destroyed, leaving broken images (product media is
-- not status-filtered on the public product reader). This function enumerates every
-- LIVE entity still pointing at a media asset so the CMS can refuse the delete and
-- tell the admin exactly what is using it. Only references from non-deleted owners
-- count. SECURITY DEFINER so the editor/admin CMS session can call it.
CREATE OR REPLACE FUNCTION "public"."get_media_references"("p_media_id" "uuid")
    RETURNS TABLE("entity_type" "text", "entity_id" "uuid", "label" "text", "field" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  -- Product gallery/primary images
  SELECT 'product', p.id, coalesce(pt.name, p.reference_code, p.id::text), 'product_media'
  FROM public.product_media pm
  JOIN public.products p ON p.id = pm.product_id AND p.deleted_at IS NULL
  LEFT JOIN public.product_translations pt ON pt.product_id = p.id AND pt.locale = 'vi'
  WHERE pm.media_id = p_media_id
  UNION
  -- Product / category / blog OG + category image (all *_media_id columns)
  SELECT 'product', p.id, coalesce(pt.name, p.reference_code, p.id::text), 'product_translations.og_image'
  FROM public.product_translations pt
  JOIN public.products p ON p.id = pt.product_id AND p.deleted_at IS NULL
  WHERE pt.og_image_media_id = p_media_id
  UNION
  SELECT 'product_category', c.id, coalesce(ct.name, c.id::text), 'image_or_og'
  FROM public.product_categories c
  LEFT JOIN public.product_category_translations ct ON ct.category_id = c.id AND ct.locale = 'vi'
  WHERE c.deleted_at IS NULL
    AND (c.image_media_id = p_media_id
         OR EXISTS (SELECT 1 FROM public.product_category_translations x WHERE x.category_id = c.id AND x.og_image_media_id = p_media_id))
  UNION
  -- Blog post cover / OG
  SELECT 'blog_post', bp.id, coalesce(bpt.title, bp.id::text), 'cover_or_og'
  FROM public.blog_posts bp
  LEFT JOIN public.blog_post_translations bpt ON bpt.post_id = bp.id AND bpt.locale = 'vi'
  WHERE bp.deleted_at IS NULL
    AND (bp.cover_media_id = p_media_id
         OR EXISTS (SELECT 1 FROM public.blog_post_translations x WHERE x.post_id = bp.id AND x.og_image_media_id = p_media_id))
  UNION
  SELECT 'blog_category', bc.id, coalesce(bct.name, bc.id::text), 'og_image'
  FROM public.blog_categories bc
  LEFT JOIN public.blog_category_translations bct ON bct.category_id = bc.id AND bct.locale = 'vi'
  WHERE bc.deleted_at IS NULL
    AND EXISTS (SELECT 1 FROM public.blog_category_translations x WHERE x.category_id = bc.id AND x.og_image_media_id = p_media_id)
  UNION
  -- Brand logo
  SELECT 'brand', b.id, coalesce(b.slug, b.id::text), 'logo_media'
  FROM public.brands b
  WHERE b.deleted_at IS NULL AND b.logo_media_id = p_media_id
  UNION
  -- Promotion cover
  SELECT 'promotion', pr.id, coalesce(pr.code, pr.id::text), 'cover_media'
  FROM public.promotions pr
  WHERE pr.deleted_at IS NULL AND pr.cover_media_id = p_media_id
  UNION
  -- Showroom gallery
  SELECT 'showroom', s.id, coalesce(s.code, s.id::text), 'showroom_media'
  FROM public.showroom_media sm
  JOIN public.showrooms s ON s.id = sm.showroom_id AND s.deleted_at IS NULL
  WHERE sm.media_id = p_media_id
  UNION
  -- Content pages: page media, section media, translation OG
  SELECT 'content_page', cp.id, coalesce(cp.key, cp.id::text), 'page_media_or_section_or_og'
  FROM public.content_pages cp
  WHERE cp.deleted_at IS NULL
    AND (EXISTS (SELECT 1 FROM public.page_media pmx WHERE pmx.page_id = cp.id AND pmx.media_id = p_media_id)
         OR EXISTS (SELECT 1 FROM public.page_sections psx WHERE psx.page_id = cp.id AND psx.media_id = p_media_id)
         OR EXISTS (SELECT 1 FROM public.content_page_translations cptx WHERE cptx.page_id = cp.id AND cptx.og_image_media_id = p_media_id))
  UNION
  -- Site settings (logo / favicon / default OG)
  SELECT 'site_settings', ss.id, 'Cấu hình website', 'logo_favicon_or_og'
  FROM public.site_settings ss
  WHERE ss.logo_media_id = p_media_id
     OR ss.favicon_media_id = p_media_id
     OR ss.default_og_image_media_id = p_media_id;
$$;

ALTER FUNCTION "public"."get_media_references"("uuid") OWNER TO "postgres";
COMMENT ON FUNCTION "public"."get_media_references"("uuid") IS 'Lists every live entity still referencing a media asset. The CMS uses this to block deleting media that is in use and report exactly what uses it (S6).';
GRANT ALL ON FUNCTION "public"."get_media_references"("uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_media_references"("uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_media_references"("uuid") TO "service_role";

-- ════════════════════════════════════════════════════════════════════════════
-- 9. ATOMIC PROMOTION UPDATE (remaining-risk #4)
-- ════════════════════════════════════════════════════════════════════════════
-- The CMS previously updated the promotion row, upserted translations, then
-- delete+re-inserted product_promotions as separate round-trips. If any middle
-- step failed (e.g. the overlap trigger), earlier writes had already committed,
-- leaving a half-applied promotion. A plpgsql function runs in a single implicit
-- transaction, so bundling the writes here makes the whole update all-or-nothing.
CREATE OR REPLACE FUNCTION "public"."admin_update_promotion"(
  "p_id" "uuid",
  "p_code" "text",
  "p_discount" numeric,
  "p_status" "text",
  "p_start" timestamp with time zone,
  "p_end" timestamp with time zone,
  "p_cover_media_id" "uuid",
  "p_combo_price" numeric,
  "p_original_price" numeric,
  "p_metadata" "jsonb",
  "p_title_vi" "text",
  "p_desc_vi" "text",
  "p_title_en" "text",
  "p_desc_en" "text",
  "p_product_ids" "uuid"[],
  "p_actor" "uuid"
) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_promo public.promotions%rowtype;
BEGIN
  IF NOT public.can_manage_publishable_content() THEN
    RAISE EXCEPTION 'editor or admin access required' USING errcode = '42501';
  END IF;

  UPDATE public.promotions SET
    code = p_code,
    discount_percentage = p_discount,
    status = p_status::public.publish_status,
    start_at = p_start,
    end_at = p_end,
    cover_media_id = p_cover_media_id,
    combo_price = p_combo_price,
    original_price = p_original_price,
    metadata_jsonb = coalesce(p_metadata, '{}'::jsonb),
    updated_by = p_actor,
    updated_at = now()
  WHERE id = p_id AND deleted_at IS NULL
  RETURNING * INTO v_promo;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Promotion not found: %', p_id USING errcode = 'P0002';
  END IF;

  IF public.compact_text(p_title_vi) IS NOT NULL THEN
    INSERT INTO public.promotion_translations (promotion_id, locale, title, description, updated_at)
    VALUES (p_id, 'vi', p_title_vi, p_desc_vi, now())
    ON CONFLICT (promotion_id, locale) DO UPDATE
      SET title = excluded.title, description = excluded.description, updated_at = now();
  END IF;

  IF public.compact_text(p_title_en) IS NOT NULL THEN
    INSERT INTO public.promotion_translations (promotion_id, locale, title, description, updated_at)
    VALUES (p_id, 'en', p_title_en, p_desc_en, now())
    ON CONFLICT (promotion_id, locale) DO UPDATE
      SET title = excluded.title, description = excluded.description, updated_at = now();
  END IF;

  -- Replace product links. The overlap trigger validates each insert; if it raises,
  -- the whole function (including the promotion update above) rolls back.
  DELETE FROM public.product_promotions WHERE promotion_id = p_id;
  IF p_product_ids IS NOT NULL AND array_length(p_product_ids, 1) IS NOT NULL THEN
    INSERT INTO public.product_promotions (product_id, promotion_id)
    SELECT unnest(p_product_ids), p_id;
  END IF;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (p_actor, 'update', 'promotion', p_id, jsonb_build_object('code', p_code, 'title_vi', p_title_vi));

  RETURN jsonb_build_object(
    'id', v_promo.id,
    'code', v_promo.code,
    'discount_percentage', v_promo.discount_percentage,
    'combo_price', v_promo.combo_price,
    'status', v_promo.status,
    'start_at', v_promo.start_at,
    'end_at', v_promo.end_at,
    'created_at', v_promo.created_at,
    'updated_at', v_promo.updated_at
  );
END;
$$;

ALTER FUNCTION "public"."admin_update_promotion"("uuid","text",numeric,"text",timestamp with time zone,timestamp with time zone,"uuid",numeric,numeric,"jsonb","text","text","text","text","uuid"[],"uuid") OWNER TO "postgres";
GRANT ALL ON FUNCTION "public"."admin_update_promotion"("uuid","text",numeric,"text",timestamp with time zone,timestamp with time zone,"uuid",numeric,numeric,"jsonb","text","text","text","text","uuid"[],"uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_update_promotion"("uuid","text",numeric,"text",timestamp with time zone,timestamp with time zone,"uuid",numeric,numeric,"jsonb","text","text","text","text","uuid"[],"uuid") TO "service_role";

-- ==================== business logic v2 (was 0004) ====================
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
    p.price_unit::text,
    b.slug AS brand_slug
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

-- ==================== audit hardening (was 0005) ====================
-- 0005_audit_fixes.sql
-- Post-audit hardening (DB layer). Application/seed fixes live in code + seed.sql.
--
-- Covers:
--   L3  Least-privilege grants: brands / brand_translations / promotion_targets were
--       GRANT ALL to anon + authenticated (incl. DELETE to anon). Reduce to match the
--       other content tables (anon = SELECT only; authenticated = SELECT/INSERT/UPDATE,
--       plus DELETE only where the app legitimately needs it).
--   M4  Brand slug uniqueness was a plain global UNIQUE(slug) — not soft-delete-aware,
--       so a soft-deleted brand permanently reserved its slug. Make it a partial,
--       case-insensitive unique index scoped to live rows, matching products/showrooms/
--       promotions.


-- ---------------------------------------------------------------------------
-- L3 — least-privilege grants
-- ---------------------------------------------------------------------------
REVOKE ALL ON TABLE "public"."brands" FROM "anon";
REVOKE ALL ON TABLE "public"."brands" FROM "authenticated";
GRANT SELECT ON TABLE "public"."brands" TO "anon";
GRANT SELECT, INSERT, UPDATE ON TABLE "public"."brands" TO "authenticated";

REVOKE ALL ON TABLE "public"."brand_translations" FROM "anon";
REVOKE ALL ON TABLE "public"."brand_translations" FROM "authenticated";
GRANT SELECT ON TABLE "public"."brand_translations" TO "anon";
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."brand_translations" TO "authenticated";

-- ---------------------------------------------------------------------------
-- M4 — soft-delete-aware, case-insensitive brand slug uniqueness
-- ---------------------------------------------------------------------------
ALTER TABLE "public"."brands" DROP CONSTRAINT IF EXISTS "uq_brands_slug";
DROP INDEX IF EXISTS "public"."uq_brands_slug";
CREATE UNIQUE INDEX IF NOT EXISTS "uq_brands_slug_active"
  ON "public"."brands" (("lower"("slug")))
  WHERE (("slug" IS NOT NULL) AND ("deleted_at" IS NULL));