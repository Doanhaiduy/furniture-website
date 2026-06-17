-- Migration: QA Hardening and Database Hotfixes
-- Date: 2026-06-16
-- Purpose: 
--  1. Drop the old overloaded public_products function to prevent PGRST203 PostgREST function overloading error.
--  2. Add SELECT policies for site_settings and site_setting_translations to anon (public visitor) role.
--  3. Fix auth.users null scans in GoTrue by ensuring required fields have empty default values.

-- 1. Drop old 10-parameter public_products RPC signature
DROP FUNCTION IF EXISTS public.public_products(
  public.locale_code, 
  text, 
  public.product_group_key, 
  text, 
  numeric, 
  numeric, 
  jsonb, 
  boolean, 
  integer, 
  integer
);

-- 2. Add SELECT policies for public site settings (non-sensitive)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'site_settings' 
      AND policyname = 'site_settings_public_read'
  ) THEN
    CREATE POLICY site_settings_public_read ON public.site_settings FOR SELECT TO anon USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'site_setting_translations' 
      AND policyname = 'site_settings_trans_public_read'
  ) THEN
    CREATE POLICY site_settings_trans_public_read ON public.site_setting_translations FOR SELECT TO anon USING (true);
  END IF;
END $$;

-- 3. Fix GoTrue null scan failures for newly seeded or manual auth users
-- (Removed ALTER TABLE and UPDATE statements on auth.users to avoid "must be owner of table users" error.
-- Instead, the seed script chèn directly empty strings for these columns)

-- 4. Grant SELECT permissions on site_settings tables to public roles
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT SELECT ON public.site_setting_translations TO anon, authenticated;

-- 5. Add slug column to brands table if not exists for product filtering
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS slug text;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_brands_slug'
  ) THEN
    ALTER TABLE public.brands ADD CONSTRAINT uq_brands_slug UNIQUE (slug);
  END IF;
END $$;

-- 6. Fix media_assets public read permission (allow anonymous users to see product/blog/showroom images)
GRANT SELECT ON public.media_assets TO anon, authenticated;
GRANT SELECT ON public.media_asset_translations TO anon, authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'media_assets' 
      AND policyname = 'media_assets_public_read'
  ) THEN
    CREATE POLICY media_assets_public_read ON public.media_assets FOR SELECT TO anon, authenticated USING (status = 'active');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'media_asset_translations' 
      AND policyname = 'media_asset_trans_public_read'
  ) THEN
    CREATE POLICY media_asset_trans_public_read ON public.media_asset_translations FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;
