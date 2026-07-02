-- =============================================================================
-- Migration: Add tags column to products table
-- Date: 2026-07-01
-- Purpose:
--   - Add the missing 'tags' column to the 'products' table.
--   - This resolves the database error: "column products.tags does not exist"
--     when querying product details directly (e.g. getProductBySlug).
-- =============================================================================

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];
