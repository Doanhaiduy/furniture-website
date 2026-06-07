-- 0006_rls_helper_functions.sql
-- Supabase RLS helper functions. Keep these small and auditable.

begin;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

comment on function public.current_profile_id() is
  'Returns the authenticated Supabase user/profile id from auth.uid().';

create or replace function public.is_service_role()
returns boolean
language sql
stable
as $$
  select coalesce(auth.role(), '') = 'service_role';
$$;

comment on function public.is_service_role() is
  'True when the current JWT role is Supabase service_role. Service role also bypasses RLS by default.';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'::public.cms_role
      and p.is_active
      and p.deleted_at is null
  );
$$;

comment on function public.is_admin() is
  'True when the authenticated user has an active admin profile. SECURITY DEFINER avoids recursive profile RLS checks.';

create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin'::public.cms_role, 'editor'::public.cms_role)
      and p.is_active
      and p.deleted_at is null
  );
$$;

comment on function public.is_editor() is
  'True when the authenticated user has an active admin or editor profile.';

create or replace function public.is_own_profile(profile_id uuid)
returns boolean
language sql
stable
as $$
  select auth.uid() is not null and auth.uid() = profile_id;
$$;

comment on function public.is_own_profile(uuid) is
  'True when a row belongs to the authenticated user.';

create or replace function public.can_manage_publishable_content()
returns boolean
language sql
stable
as $$
  select public.is_editor() or public.is_service_role();
$$;

comment on function public.can_manage_publishable_content() is
  'Role Model Option A helper: editor/admin/service can manage publishable content.';

create or replace function public.can_manage_private_admin_data()
returns boolean
language sql
stable
as $$
  select public.is_admin() or public.is_service_role();
$$;

comment on function public.can_manage_private_admin_data() is
  'Role Model Option A helper: admin/service can manage private leads, users, settings and audit data.';

revoke all on function public.current_profile_id() from public;
revoke all on function public.is_service_role() from public;
revoke all on function public.is_admin() from public;
revoke all on function public.is_editor() from public;
revoke all on function public.is_own_profile(uuid) from public;
revoke all on function public.can_manage_publishable_content() from public;
revoke all on function public.can_manage_private_admin_data() from public;

grant execute on function public.current_profile_id() to anon, authenticated, service_role;
grant execute on function public.is_service_role() to anon, authenticated, service_role;
grant execute on function public.is_admin() to anon, authenticated, service_role;
grant execute on function public.is_editor() to anon, authenticated, service_role;
grant execute on function public.is_own_profile(uuid) to anon, authenticated, service_role;
grant execute on function public.can_manage_publishable_content() to anon, authenticated, service_role;
grant execute on function public.can_manage_private_admin_data() to anon, authenticated, service_role;

commit;
