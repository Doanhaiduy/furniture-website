-- 0003_password_reset_tokens.sql
-- Table to store secure, short-lived password reset tokens for admin / CMS users.

CREATE TABLE IF NOT EXISTS "public"."password_reset_tokens" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "email" TEXT NOT NULL,
  "token_hash" TEXT NOT NULL,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "used_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_password_reset_tokens_email" ON "public"."password_reset_tokens" ("email");
CREATE INDEX IF NOT EXISTS "idx_password_reset_tokens_token_hash" ON "public"."password_reset_tokens" ("token_hash");

-- Enable Row Level Security
ALTER TABLE "public"."password_reset_tokens" ENABLE ROW LEVEL SECURITY;

-- PostgREST / public access is completely blocked.
-- Only server actions / service role can manage password reset tokens.
DROP POLICY IF EXISTS "Service role full access on password_reset_tokens" ON "public"."password_reset_tokens";
CREATE POLICY "Service role full access on password_reset_tokens"
  ON "public"."password_reset_tokens"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
