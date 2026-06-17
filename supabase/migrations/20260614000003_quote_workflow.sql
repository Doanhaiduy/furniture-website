-- Migration: Quote Status Workflow Enhancement
-- Date: 20260614
-- Purpose: Add quote_status_logs table and update quote_requests status enum

-- 1. Add quote_status_logs table to track status change history
CREATE TABLE IF NOT EXISTS quote_status_logs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id    uuid        NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  from_status text,
  to_status   text        NOT NULL,
  changed_by  uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 2. Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_quote_status_logs_quote_id ON quote_status_logs(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_status_logs_created_at ON quote_status_logs(created_at DESC);

-- 3. Add assigned_to and admin_notes columns to quote_requests if not already present
ALTER TABLE quote_requests
  ADD COLUMN IF NOT EXISTS assigned_to  text,
  ADD COLUMN IF NOT EXISTS admin_notes  text;

-- 4. RLS policies for quote_status_logs — admin only
ALTER TABLE quote_status_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read all quote status logs"
  ON quote_status_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can insert quote status logs"
  ON quote_status_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- 5. RPC function: update_quote_status — atomically updates status + logs the change
CREATE OR REPLACE FUNCTION update_quote_status(
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
  v_allowed_statuses text[] := ARRAY['new', 'processing', 'contacted', 'qualified', 'closed', 'cancelled', 'spam'];
BEGIN
  -- Verify caller is admin
  SELECT id INTO v_user_id FROM profiles WHERE id = auth.uid() AND role = 'admin';
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: admin only');
  END IF;

  -- Validate new status
  IF NOT (p_new_status = ANY(v_allowed_statuses)) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid status: ' || p_new_status);
  END IF;

  -- Get current status
  SELECT status INTO v_old_status FROM quote_requests WHERE id = p_quote_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Quote not found');
  END IF;

  -- Update quote status
  UPDATE quote_requests
    SET status     = p_new_status,
        updated_at = now()
  WHERE id = p_quote_id;

  -- Log the status change
  INSERT INTO quote_status_logs (quote_id, from_status, to_status, changed_by, note)
  VALUES (p_quote_id, v_old_status, p_new_status, v_user_id, p_note);

  RETURN jsonb_build_object(
    'success',      true,
    'quote_id',     p_quote_id,
    'from_status',  v_old_status,
    'to_status',    p_new_status
  );
END;
$$;

-- 6. Grant execute to authenticated users (will be checked inside function)
GRANT EXECUTE ON FUNCTION update_quote_status(uuid, text, text) TO authenticated;

-- 7. Helper: get quote status logs for a specific quote
CREATE OR REPLACE FUNCTION get_quote_status_logs(p_quote_id uuid)
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
    qsl.id,
    qsl.quote_id,
    qsl.from_status,
    qsl.to_status,
    COALESCE(p.full_name, p.email::text, 'Hệ thống') AS changed_by_name,
    qsl.note,
    qsl.created_at
  FROM quote_status_logs qsl
  LEFT JOIN profiles p ON p.id = qsl.changed_by
  WHERE qsl.quote_id = p_quote_id
  ORDER BY qsl.created_at ASC;
$$;

GRANT EXECUTE ON FUNCTION get_quote_status_logs(uuid) TO authenticated;
