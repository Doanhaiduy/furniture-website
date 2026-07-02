-- =============================================================================
-- Migration: Grant Public SELECT Permissions and Create RLS Policy for social_links
-- Date: 2026-07-01
-- Purpose:
--   - Allow anonymous ('anon') and authenticated public visitors to read public social links directly.
--   - This resolves the database permission error on the footer/header for social links.
-- =============================================================================

GRANT SELECT ON public.social_links TO anon, authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'social_links' AND policyname = 'social_links_public_select'
  ) THEN
    CREATE POLICY social_links_public_select ON public.social_links FOR SELECT TO anon, authenticated 
    USING (is_enabled = true);
  END IF;
END $$;
