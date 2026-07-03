-- 20260702000001_seed_test_editor_account.sql
-- Reproducible seed for the E2E editor test account (editor@furniture.com / password123).
--
-- Rationale: the admin E2E suite logs in as `editor@furniture.com` to verify RBAC
-- (editor is blocked from quotes/users/settings). That account previously existed only
-- because it had been inserted by hand into a developer's local database, so a fresh
-- `supabase db reset` made every editor RBAC test fail. This migration makes the account
-- part of the schema history so the test environment is reproducible.
--
-- Robust on both a fresh reset and an already-dirty local DB:
--   * If the account does not exist yet -> insert with a deterministic id.
--   * If it already exists (possibly hand-created with another id) -> reuse that id and
--     just reset the password + profile role, so we never DELETE a row that audit_logs
--     may reference (audit_logs is immutable via prevent_update_delete()).

begin;

do $$
declare
  v_editor_id uuid;
begin
  select id into v_editor_id
  from auth.users
  where lower(email) = 'editor@furniture.com'
  limit 1;

  if v_editor_id is null then
    v_editor_id := '00000000-0000-0000-0000-000000000003';
    insert into auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, aud, role,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, phone_change, phone_change_token,
      email_change_token_current, reauthentication_token, email_change_confirm_status,
      created_at, updated_at
    )
    values (
      v_editor_id,
      '00000000-0000-0000-0000-000000000000',
      'editor@furniture.com',
      extensions.crypt('password123', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Editor E2E"}'::jsonb,
      'authenticated',
      'authenticated',
      '', '', '',
      '', '', '',
      '', '', 0,
      now(), now()
    );
  else
    update auth.users
    set encrypted_password = extensions.crypt('password123', extensions.gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        updated_at = now()
    where id = v_editor_id;
  end if;

  insert into public.profiles (id, email, full_name, role, is_active)
  values (v_editor_id, 'editor@furniture.com', 'Editor E2E', 'editor', true)
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    role = 'editor',
    is_active = true;
end
$$;

commit;
