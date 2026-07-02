-- =============================================================================
-- Migration: Fix RLS Policies referencing profiles table directly
-- Date: 2026-07-01
-- Purpose:
--   - Recreate RLS policies on public.brands, public.brand_translations, and public.promotion_targets
--     to use security-definer helper functions (public.is_editor(), public.is_admin())
--     instead of selecting from public.profiles directly.
--   - This resolves the "permission denied for table profiles" error for public/anon visitors,
--     because a policy with a direct subquery on profiles requires all querying roles (including anon)
--     to have SELECT privilege on profiles, which leaks user metadata and is blocked for security.
--   - Note: quote_status_history table was dropped by phase7 consolidation, so it is excluded.
-- =============================================================================

-- 1. Brands table policies
DROP POLICY IF EXISTS "Editors can manage brands" ON public.brands;
CREATE POLICY "Editors can manage brands"
  ON public.brands FOR ALL TO authenticated
  USING (public.is_editor());

-- 2. Brand translations table policies
DROP POLICY IF EXISTS "Editors can manage brand translations" ON public.brand_translations;
CREATE POLICY "Editors can manage brand translations"
  ON public.brand_translations FOR ALL TO authenticated
  USING (public.is_editor());

-- 3. Promotion targets table policies
DROP POLICY IF EXISTS "Admins manage promotion targets" ON public.promotion_targets;
CREATE POLICY "Admins manage promotion targets"
  ON public.promotion_targets FOR ALL TO authenticated
  USING (public.is_admin());
