-- migration file: supabase/migrations/20260614_product_promotions.sql
begin;

create table if not exists public.product_promotions (
  product_id uuid not null references public.products(id) on delete cascade,
  promotion_id uuid not null references public.promotions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, promotion_id)
);

comment on table public.product_promotions is
  'Many-to-many association between products and promotions.';

-- Enable RLS
alter table public.product_promotions enable row level security;

-- Baseline grants
revoke all on table public.product_promotions from anon, authenticated;
grant all on table public.product_promotions to service_role;
grant select on table public.product_promotions to anon, authenticated;
grant insert, update, delete on table public.product_promotions to authenticated;

-- Policies
create policy product_promotions_select on public.product_promotions for select to anon, authenticated using (true);
create policy product_promotions_editor_all on public.product_promotions for all to authenticated using (public.is_editor()) with check (public.is_editor());

-- Migrate existing data from products.promotion_id if any
do $$
begin
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
      and table_name = 'products' 
      and column_name = 'promotion_id'
  ) then
    insert into public.product_promotions (product_id, promotion_id)
    select id, promotion_id from public.products
    where promotion_id is not null
    on conflict do nothing;
    
    -- Drop the old column
    alter table public.products drop column promotion_id;
  end if;
end;
$$;

-- Update helper function to fetch active promotions for a product, including N-N relations from product_promotions
create or replace function public.get_active_promotions_for_product(p_product_id uuid)
returns table (
  promotion_id uuid,
  code text,
  discount_percentage numeric,
  combo_price numeric
)
language plpgsql
security definer
as $$
begin
  return query
  select distinct
    p.id as promotion_id,
    p.code,
    p.discount_percentage,
    p.combo_price
  from public.promotions p
  left join public.promotion_targets pt on pt.promotion_id = p.id
  left join public.product_promotions pp on pp.promotion_id = p.id
  where p.status = 'published'
    and p.deleted_at is null
    and (p.start_at is null or p.start_at <= now())
    and (p.end_at is null or p.end_at >= now())
    and (
      pt.target_type = 'all'
      or (pt.target_type = 'product' and pt.target_id = p_product_id)
      or (pt.target_type = 'category' and pt.target_id in (
        select category_id from public.products where id = p_product_id
      ))
      or (pt.target_type = 'brand' and pt.target_id in (
        select brand_id from public.products where id = p_product_id
      ))
      or pp.product_id = p_product_id
    );
end;
$$;

commit;
