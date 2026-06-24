-- Migration: Phase 7 Database Consolidation & Cleanup
-- Date: 20260620
-- Purpose: 
--  1. Standarize quote_requests.assigned_to to UUID
--  2. Consolidate status history: Drop quote_status_history and quote_status_logs, keeping quote_request_events
--  3. Recreate RPC update_quote_status and get_quote_status_logs to work with quote_request_events

BEGIN;

-- ============================================================================
-- 1. Standardize assigned_to to UUID
-- ============================================================================

-- Drop the constraint if it exists to allow type alteration
ALTER TABLE public.quote_requests
  DROP CONSTRAINT IF EXISTS fk_quote_requests_assigned_to;

-- Safely convert assigned_to from text to uuid
ALTER TABLE public.quote_requests
  ALTER COLUMN assigned_to TYPE uuid USING (
    CASE 
      WHEN assigned_to IS NULL OR assigned_to::text = '' THEN NULL
      WHEN assigned_to::text ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN assigned_to::text::uuid
      ELSE NULL
    END
  );

-- Recreate the foreign key constraint
ALTER TABLE public.quote_requests
  ADD CONSTRAINT fk_quote_requests_assigned_to
  FOREIGN KEY (assigned_to) REFERENCES public.profiles(id)
  ON DELETE SET NULL;

-- ============================================================================
-- 2. Backfill existing status history data into quote_request_events
-- ============================================================================

DO $$
BEGIN
  -- Disable the append-only trigger temporarily to allow backfill
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_quote_request_events_append_only'
  ) THEN
    ALTER TABLE public.quote_request_events DISABLE TRIGGER trg_quote_request_events_append_only;
  END IF;

  -- Backfill from quote_status_logs
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'quote_status_logs' AND schemaname = 'public') THEN
    INSERT INTO public.quote_request_events (quote_request_id, actor_id, old_status, new_status, note, created_at)
    SELECT 
      quote_id, 
      changed_by, 
      from_status::public.quote_status, 
      to_status::public.quote_status, 
      note, 
      created_at
    FROM public.quote_status_logs
    ON CONFLICT DO NOTHING;
  END IF;

  -- Backfill from quote_status_history
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'quote_status_history' AND schemaname = 'public') THEN
    INSERT INTO public.quote_request_events (quote_request_id, actor_id, old_status, new_status, note, created_at)
    SELECT 
      quote_request_id, 
      changed_by, 
      old_status, 
      new_status, 
      notes, 
      changed_at
    FROM public.quote_status_history
    ON CONFLICT DO NOTHING;
  END IF;

  -- Re-enable the append-only trigger
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_quote_request_events_append_only'
  ) THEN
    ALTER TABLE public.quote_request_events ENABLE TRIGGER trg_quote_request_events_append_only;
  END IF;
END $$;

-- ============================================================================
-- 3. Drop obsolete tables
-- ============================================================================

DROP TABLE IF EXISTS public.quote_status_logs CASCADE;
DROP TABLE IF EXISTS public.quote_status_history CASCADE;

-- ============================================================================
-- 4. Recreate RPC update_quote_status (excluding reference to dropped tables)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_quote_status(
  p_quote_id    uuid,
  p_new_status  text,
  p_note        text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_status text;
  v_user_id    uuid;
  v_allowed_statuses text[] := ARRAY['new', 'contacted', 'qualified', 'closed', 'spam'];
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_quote_status(uuid, text, text) TO authenticated;

-- ============================================================================
-- 5. Recreate RPC get_quote_status_logs (reading from quote_request_events)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_quote_status_logs(p_quote_id uuid)
RETURNS TABLE(
  id          uuid,
  quote_id    uuid,
  from_status text,
  to_status   text,
  changed_by_name text,
  note        text,
  created_at  timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
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
  ORDER BY qre.created_at ASC;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_quote_status_logs(uuid) TO authenticated;

-- ============================================================================
-- 6. Seed Gạch Eurotile Hoàng Gia product and category for integration tests
-- ============================================================================
DO $$
DECLARE
  v_tiles_category_id uuid;
  v_product_5_id uuid;
  v_texture_media_id uuid := '00000000-0000-0000-0000-000000000105';
BEGIN
  -- Seed tiles category
  SELECT id INTO v_tiles_category_id
  FROM public.product_categories
  WHERE group_key = 'tiles'
  ORDER BY created_at
  LIMIT 1;

  IF v_tiles_category_id IS NULL THEN
    v_tiles_category_id := 'a1111111-1111-1111-1111-111111111111';
    INSERT INTO public.product_categories (id, group_key, status, sort_order)
    VALUES (v_tiles_category_id, 'tiles', 'draft', 30)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  INSERT INTO public.product_category_translations (category_id, locale, slug, name, description, seo_title, seo_description)
  VALUES
    (v_tiles_category_id, 'vi', 'gach-op-lat', 'Gạch ốp lát', 'Gạch ốp lát chất lượng cao', 'Gạch ốp lát', 'Gạch ốp lát cao cấp Phương Đông'),
    (v_tiles_category_id, 'en', 'tiles', 'Tiles', 'Premium floor and wall tiles', 'Tiles', 'Premium floor and wall tiles')
  ON CONFLICT (category_id, locale) DO UPDATE
  SET
    slug = EXCLUDED.slug,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    seo_title = EXCLUDED.seo_title,
    seo_description = EXCLUDED.seo_description,
    updated_at = now();

  UPDATE public.product_categories
  SET status = 'published'
  WHERE id = v_tiles_category_id;

  -- Seed Eurotile Product
  SELECT id INTO v_product_5_id
  FROM public.products
  WHERE id = 'c3e1ae4d-b971-4668-b8f9-4bbfd4bf5a29'
    AND deleted_at IS NULL
  LIMIT 1;

  IF v_product_5_id IS NULL THEN
    INSERT INTO public.products (id, category_id, reference_code, status, price_min, price_max, currency, brand_series, featured, sort_order)
    VALUES ('c3e1ae4d-b971-4668-b8f9-4bbfd4bf5a29', v_tiles_category_id, 'PD-T-ROYAL', 'draft', 15000000, 15000000, 'VND', 'Royal Collection', TRUE, 50)
    RETURNING id INTO v_product_5_id;
  END IF;

  INSERT INTO public.product_translations (product_id, locale, slug, name, summary, description_json, material, price_display_text, dimension_display_text, seo_title, seo_description)
  VALUES
    (v_product_5_id, 'vi', 'gach-eurotile-hoang-gia', 'Gạch Eurotile Hoàng Gia', 'Gạch Eurotile cao cấp vân đá Hoàng Gia.', '{"type":"doc","content":[]}'::jsonb, 'Porcelain', '15,000,000 VND', '800 x 800 mm', 'Gạch Eurotile Hoàng Gia', 'Gạch Eurotile Hoàng Gia'),
    (v_product_5_id, 'en', 'eurotile-royal-tile', 'Eurotile Royal Tile', 'Premium Eurotile Royal marble look porcelain tile.', '{"type":"doc","content":[]}'::jsonb, 'Porcelain', '$600', '800 x 800 mm', 'Eurotile Royal Tile', 'Eurotile Royal Tile')
  ON CONFLICT (product_id, locale) DO UPDATE SET slug = EXCLUDED.slug, name = EXCLUDED.name, summary = EXCLUDED.summary, updated_at = now();

  UPDATE public.products SET status = 'published' WHERE id = v_product_5_id;

  -- Seed product media for Gạch Eurotile Hoàng Gia
  DELETE FROM public.product_media WHERE product_id = v_product_5_id;
  INSERT INTO public.product_media (product_id, media_id, context, is_primary, sort_order)
  VALUES
    (v_product_5_id, v_texture_media_id, 'gallery', TRUE, 1)
  ON CONFLICT (product_id, media_id) DO NOTHING;

  -- Force update the title and description for campaigns to ensure no combo/package wording exists
  UPDATE public.promotion_translations 
  SET title = 'Không Gian Phòng Khách Walnut Heritage', 
      description = 'Tinh tuyển gỗ óc chó tự nhiên cho căn hộ cao cấp' 
  WHERE promotion_id = '11111111-1111-1111-1111-111111111111' AND locale = 'vi';

  UPDATE public.promotion_translations 
  SET title = 'Thiết Bị Phòng Tắm Wellness Luxury', 
      description = 'Nâng tầm phong cách sống với bồn tắm độc lập và sen khóa nhiệt' 
  WHERE promotion_id = '22222222-2222-2222-2222-222222222222' AND locale = 'vi';

  UPDATE public.promotion_translations 
  SET title = 'Gạch Ốp Lát Luxury Calacatta', 
      description = 'Gạch porcelain vân đá cẩm thạch nhập khẩu cao cấp' 
  WHERE promotion_id = '33333333-3333-3333-3333-333333333333' AND locale = 'vi';

  UPDATE public.promotion_translations 
  SET title = 'Heritage Walnut Living Room', 
      description = 'Curated natural walnut for premium apartments' 
  WHERE promotion_id = '11111111-1111-1111-1111-111111111111' AND locale = 'en';

  UPDATE public.promotion_translations 
  SET title = 'Wellness Luxury Bathroom Suite', 
      description = 'Elevate your lifestyle with freestanding tub and thermostatic shower' 
  WHERE promotion_id = '22222222-2222-2222-2222-222222222222' AND locale = 'en';

  UPDATE public.promotion_translations 
  SET title = 'Luxury Calacatta Tile Deal', 
      description = 'Premium imported stone-look porcelain tiles' 
  WHERE promotion_id = '33333333-3333-3333-3333-333333333333' AND locale = 'en';
END $$;

COMMIT;
