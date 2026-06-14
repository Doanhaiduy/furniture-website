-- migration file: supabase/migrations/20260610_promotions.sql
-- Database DDL for promotions and product promotion settings.

begin;

-- Create promotions table
create table if not exists public.promotions (
  id uuid primary key default extensions.gen_random_uuid(),
  code text unique not null,
  discount_percentage numeric(5,2),
  status public.publish_status not null default 'draft',
  start_at timestamptz,
  end_at timestamptz,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table public.promotions is
  'Promotion campaigns or discount events. Manageable by editors and admins.';

-- Create promotion translations table
create table if not exists public.promotion_translations (
  id uuid primary key default extensions.gen_random_uuid(),
  promotion_id uuid not null references public.promotions(id) on delete cascade,
  locale public.locale_code not null,
  title text not null,
  description text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(promotion_id, locale)
);

comment on table public.promotion_translations is
  'Localized translation fields for promotions.';

-- Add columns to products table for direct promotion association
alter table public.products
add column if not exists promotion_id uuid references public.promotions(id) on delete set null,
add column if not exists promo_price_min numeric(12,2),
add column if not exists promo_price_max numeric(12,2);

-- Enable RLS
alter table public.promotions enable row level security;
alter table public.promotion_translations enable row level security;

-- Baseline grants
revoke all on table
  public.promotions,
  public.promotion_translations
from anon, authenticated;

grant all on table
  public.promotions,
  public.promotion_translations
to service_role;

grant select, insert, update on table public.promotions to authenticated;
grant select, insert, update, delete on table public.promotion_translations to authenticated;

-- Service role policies
create policy service_role_all on public.promotions for all to service_role using (true) with check (true);
create policy service_role_all on public.promotion_translations for all to service_role using (true) with check (true);

-- Editor/Admin RLS Policies (can CRUD publishable promotions)
create policy promotions_editor_select on public.promotions for select to authenticated using (public.is_editor());
create policy promotions_editor_insert on public.promotions for insert to authenticated with check (public.is_editor());
create policy promotions_editor_update on public.promotions for update to authenticated using (public.is_editor()) with check (public.is_editor());

create policy promotion_translations_editor_all on public.promotion_translations for all to authenticated using (public.is_editor()) with check (public.is_editor());

-- Public reader RPC for promotions
create or replace function public.public_promotions(
  p_locale public.locale_code default 'vi'
)
returns table (
  id uuid,
  code text,
  discount_percentage numeric,
  start_at timestamptz,
  end_at timestamptz,
  title text,
  description text
)
language sql
stable
security definer
set search_path = public, extensions, pg_temp
as $$
  select
    p.id,
    p.code,
    p.discount_percentage,
    p.start_at,
    p.end_at,
    pt.title,
    pt.description
  from public.promotions p
  join public.promotion_translations pt
    on pt.promotion_id = p.id
    and pt.locale = p_locale
  where p.status = 'published'::public.publish_status
    and p.deleted_at is null
    and (p.start_at is null or p.start_at <= now())
    and (p.end_at is null or p.end_at >= now())
  order by p.created_at desc;
$$;

comment on function public.public_promotions(public.locale_code) is
  'Public promotions reader. Returns active published promotions with localized title/description.';

grant execute on function public.public_promotions(public.locale_code) to anon, authenticated, service_role;

-- Seed default promotions
insert into public.promotions (id, code, discount_percentage, status)
values 
  ('11111111-1111-1111-1111-111111111111', 'heritage-walnut-combo', 15.00, 'published'),
  ('22222222-2222-2222-2222-222222222222', 'wellness-bath-set', 18.00, 'published'),
  ('33333333-3333-3333-3333-333333333333', 'porcelain-surface-pack', 20.00, 'published')
on conflict (code) do nothing;

insert into public.promotion_translations (promotion_id, locale, title, description)
values
  ('11111111-1111-1111-1111-111111111111', 'vi', 'Không Gian Phòng Khách Walnut Heritage', 'Tinh tuyển gỗ óc chó tự nhiên cho căn hộ cao cấp'),
  ('11111111-1111-1111-1111-111111111111', 'en', 'Heritage Walnut Living Room Package', 'Curated natural walnut for premium apartments'),
  ('22222222-2222-2222-2222-222222222222', 'vi', 'Trọn Bộ Thiết Bị Phòng Tắm Wellness', 'Không gian spa thư giãn nhập khẩu chính hãng tiêu chuẩn Châu Âu'),
  ('22222222-2222-2222-2222-222222222222', 'en', 'Wellness Master Bathroom Suite', 'Relaxing spa suite with European standards'),
  ('33333333-3333-3333-3333-333333333333', 'vi', 'Gói Gạch Ốp Lát Toàn Diện Grand Surface', 'Vật liệu cao cấp hoàn thiện bề mặt sang trọng, bền vững'),
  ('33333333-3333-3333-3333-333333333333', 'en', 'Grand Surface Porcelain Tile Package', 'Premium materials for luxury and durable surfaces')
on conflict (promotion_id, locale) do nothing;

commit;
