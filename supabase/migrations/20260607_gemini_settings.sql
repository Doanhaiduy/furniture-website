-- 20260607_gemini_settings.sql
-- Create integration_secrets table with RLS and admin-only policies.

begin;

create table if not exists public.integration_secrets (
  id uuid primary key default extensions.gen_random_uuid(),
  key_name text unique not null,
  encrypted_value text not null,
  masked_hint text not null,
  is_active boolean not null default true,
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.integration_secrets is
  'Integration secrets stored securely with AES-256-GCM encryption at the application level.';

-- Attach the updated_at trigger
create trigger set_updated_at
  before update on public.integration_secrets
  for each row
  execute function public.set_updated_at();

-- Enable RLS
alter table public.integration_secrets enable row level security;

-- Deny default permissions to public roles
revoke all on table public.integration_secrets from anon, authenticated;

-- Grant all permissions to service_role
grant all on table public.integration_secrets to service_role;

-- Allow select for Admins only
create policy "Admin select secrets" on public.integration_secrets
  for select to authenticated using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'::public.cms_role
    )
  );

-- Allow modify for Admins only
create policy "Admin write secrets" on public.integration_secrets
  for all to authenticated using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'::public.cms_role
    )
  ) with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'::public.cms_role
    )
  );

commit;
