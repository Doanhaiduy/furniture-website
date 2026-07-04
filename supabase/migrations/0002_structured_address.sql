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
