-- =============================================================================
-- Migration: Grant Public SELECT Permissions and Create RLS Policies for Public Tables
-- Date: 2026-07-01
-- Purpose:
--   - Allow anonymous ('anon') and authenticated public visitors to read public tables directly.
--   - This is necessary because client-side and server-side JS client queries (createPublicClient)
--     bypass the security definer RPC functions and query tables directly (e.g. getProductBySlug).
--   - Tables covered: products, translations, brands, showrooms, blog posts, content pages, attributes.
-- =============================================================================

-- 1. GRANT SELECT permissions to anon and authenticated roles
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.product_translations TO anon, authenticated;
GRANT SELECT ON public.product_media TO anon, authenticated;

GRANT SELECT ON public.brands TO anon, authenticated;
GRANT SELECT ON public.brand_translations TO anon, authenticated;

GRANT SELECT ON public.content_pages TO anon, authenticated;
GRANT SELECT ON public.content_page_translations TO anon, authenticated;
GRANT SELECT ON public.page_sections TO anon, authenticated;
GRANT SELECT ON public.page_section_translations TO anon, authenticated;
GRANT SELECT ON public.page_media TO anon, authenticated;

GRANT SELECT ON public.showrooms TO anon, authenticated;
GRANT SELECT ON public.showroom_translations TO anon, authenticated;
GRANT SELECT ON public.showroom_media TO anon, authenticated;

GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT SELECT ON public.blog_post_translations TO anon, authenticated;

GRANT SELECT ON public.product_attribute_definitions TO anon, authenticated;
GRANT SELECT ON public.product_attribute_definition_translations TO anon, authenticated;
GRANT SELECT ON public.product_attribute_options TO anon, authenticated;
GRANT SELECT ON public.product_attribute_option_translations TO anon, authenticated;
GRANT SELECT ON public.product_attribute_values TO anon, authenticated;


-- 2. CREATE SELECT RLS POLICIES FOR anon, authenticated
DO $$
BEGIN
  -- PRODUCTS select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'products_public_select'
  ) THEN
    CREATE POLICY products_public_select ON public.products FOR SELECT TO anon, authenticated 
    USING (status = 'published' AND deleted_at IS NULL);
  END IF;

  -- PRODUCT TRANSLATIONS select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'product_translations' AND policyname = 'product_translations_public_select'
  ) THEN
    CREATE POLICY product_translations_public_select ON public.product_translations FOR SELECT TO anon, authenticated 
    USING (EXISTS (
      SELECT 1 FROM public.products p 
      WHERE p.id = product_translations.product_id AND p.status = 'published' AND p.deleted_at IS NULL
    ));
  END IF;

  -- PRODUCT MEDIA select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'product_media' AND policyname = 'product_media_public_select'
  ) THEN
    CREATE POLICY product_media_public_select ON public.product_media FOR SELECT TO anon, authenticated 
    USING (EXISTS (
      SELECT 1 FROM public.products p 
      WHERE p.id = product_media.product_id AND p.status = 'published' AND p.deleted_at IS NULL
    ));
  END IF;

  -- CONTENT PAGES select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'content_pages' AND policyname = 'content_pages_public_select'
  ) THEN
    CREATE POLICY content_pages_public_select ON public.content_pages FOR SELECT TO anon, authenticated 
    USING (status = 'published' AND deleted_at IS NULL);
  END IF;

  -- CONTENT PAGE TRANSLATIONS select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'content_page_translations' AND policyname = 'content_page_translations_public_select'
  ) THEN
    CREATE POLICY content_page_translations_public_select ON public.content_page_translations FOR SELECT TO anon, authenticated 
    USING (EXISTS (
      SELECT 1 FROM public.content_pages cp 
      WHERE cp.id = content_page_translations.page_id AND cp.status = 'published' AND cp.deleted_at IS NULL
    ));
  END IF;

  -- PAGE SECTIONS select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'page_sections' AND policyname = 'page_sections_public_select'
  ) THEN
    CREATE POLICY page_sections_public_select ON public.page_sections FOR SELECT TO anon, authenticated 
    USING (EXISTS (
      SELECT 1 FROM public.content_pages cp 
      WHERE cp.id = page_sections.page_id AND cp.status = 'published' AND cp.deleted_at IS NULL
    ));
  END IF;

  -- PAGE SECTION TRANSLATIONS select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'page_section_translations' AND policyname = 'page_section_translations_public_select'
  ) THEN
    CREATE POLICY page_section_translations_public_select ON public.page_section_translations FOR SELECT TO anon, authenticated 
    USING (EXISTS (
      SELECT 1 FROM public.page_sections ps 
      JOIN public.content_pages cp ON cp.id = ps.page_id 
      WHERE ps.id = page_section_translations.section_id AND cp.status = 'published' AND cp.deleted_at IS NULL
    ));
  END IF;

  -- PAGE MEDIA select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'page_media' AND policyname = 'page_media_public_select'
  ) THEN
    CREATE POLICY page_media_public_select ON public.page_media FOR SELECT TO anon, authenticated 
    USING (true);
  END IF;

  -- SHOWROOMS select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'showrooms' AND policyname = 'showrooms_public_select'
  ) THEN
    CREATE POLICY showrooms_public_select ON public.showrooms FOR SELECT TO anon, authenticated 
    USING (status = 'published' AND deleted_at IS NULL);
  END IF;

  -- SHOWROOM TRANSLATIONS select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'showroom_translations' AND policyname = 'showroom_translations_public_select'
  ) THEN
    CREATE POLICY showroom_translations_public_select ON public.showroom_translations FOR SELECT TO anon, authenticated 
    USING (EXISTS (
      SELECT 1 FROM public.showrooms s 
      WHERE s.id = showroom_translations.showroom_id AND s.status = 'published' AND s.deleted_at IS NULL
    ));
  END IF;

  -- SHOWROOM MEDIA select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'showroom_media' AND policyname = 'showroom_media_public_select'
  ) THEN
    CREATE POLICY showroom_media_public_select ON public.showroom_media FOR SELECT TO anon, authenticated 
    USING (EXISTS (
      SELECT 1 FROM public.showrooms s 
      WHERE s.id = showroom_media.showroom_id AND s.status = 'published' AND s.deleted_at IS NULL
    ));
  END IF;

  -- BLOG POSTS select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'blog_posts' AND policyname = 'blog_posts_public_select'
  ) THEN
    CREATE POLICY blog_posts_public_select ON public.blog_posts FOR SELECT TO anon, authenticated 
    USING (status = 'published' AND deleted_at IS NULL);
  END IF;

  -- BLOG POST TRANSLATIONS select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'blog_post_translations' AND policyname = 'blog_post_translations_public_select'
  ) THEN
    CREATE POLICY blog_post_translations_public_select ON public.blog_post_translations FOR SELECT TO anon, authenticated 
    USING (EXISTS (
      SELECT 1 FROM public.blog_posts bp 
      WHERE bp.id = blog_post_translations.post_id AND bp.status = 'published' AND bp.deleted_at IS NULL
    ));
  END IF;

  -- PRODUCT ATTRIBUTE DEFINITIONS select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'product_attribute_definitions' AND policyname = 'attribute_defs_public_select'
  ) THEN
    CREATE POLICY attribute_defs_public_select ON public.product_attribute_definitions FOR SELECT TO anon, authenticated 
    USING (true);
  END IF;

  -- PRODUCT ATTRIBUTE DEFINITION TRANSLATIONS select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'product_attribute_definition_translations' AND policyname = 'attribute_def_trans_public_select'
  ) THEN
    CREATE POLICY attribute_def_trans_public_select ON public.product_attribute_definition_translations FOR SELECT TO anon, authenticated 
    USING (true);
  END IF;

  -- PRODUCT ATTRIBUTE OPTIONS select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'product_attribute_options' AND policyname = 'attribute_opts_public_select'
  ) THEN
    CREATE POLICY attribute_opts_public_select ON public.product_attribute_options FOR SELECT TO anon, authenticated 
    USING (true);
  END IF;

  -- PRODUCT ATTRIBUTE OPTION TRANSLATIONS select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'product_attribute_option_translations' AND policyname = 'attribute_opt_trans_public_select'
  ) THEN
    CREATE POLICY attribute_opt_trans_public_select ON public.product_attribute_option_translations FOR SELECT TO anon, authenticated 
    USING (true);
  END IF;

  -- PRODUCT ATTRIBUTE VALUES select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'product_attribute_values' AND policyname = 'attribute_vals_public_select'
  ) THEN
    CREATE POLICY attribute_vals_public_select ON public.product_attribute_values FOR SELECT TO anon, authenticated 
    USING (true);
  END IF;
END $$;
