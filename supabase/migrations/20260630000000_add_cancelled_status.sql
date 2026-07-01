-- Migration: Add cancelled status to quote requests enum and RPC
ALTER TYPE public.quote_status ADD VALUE IF NOT EXISTS 'cancelled';

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
  v_allowed_statuses text[] := ARRAY['new', 'contacted', 'qualified', 'closed', 'cancelled', 'spam'];
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
