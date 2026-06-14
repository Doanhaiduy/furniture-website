-- 20260613_brands_and_enhancements.sql
-- Add Brands entity and enhance Promotions, Quote Requests for business operations

begin;

-- ============================================================================
-- 1. CREATE BRANDS TABLE (Thương hiệu)
-- ============================================================================

create table if not exists public.brands (
  id uuid primary key default extensions.gen_random_uuid(),
  logo_media_id uuid,
  origin text,
  status public.publish_status not null default 'draft',
  sort_order int not null default 0,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  deleted_at timestamptz
);

comment on table public.brands is
  'Brand partners (Kohler, Grohe, TOTO, etc.). Used for product filtering and mega menu display.';

create table if not exists public.brand_translations (
  id uuid primary key default extensions.gen_random_uuid(),
  brand_id uuid not null,
  locale public.locale_code not null,
  name text not null,
  description text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.brand_translations is
  'Bilingual translations for brand names and descriptions.';

-- ============================================================================
-- 2. ADD BRAND_ID TO PRODUCTS
-- ============================================================================

-- Add brand_id column to products table
alter table public.products 
  add column if not exists brand_id uuid;

comment on column public.products.brand_id is
  'Foreign key to brands table. Replaces free-text brand_series field.';

-- ============================================================================
-- 3. ENHANCE PROMOTIONS FOR COMBO SUPPORT
-- ============================================================================

-- Add columns for combo display
alter table public.promotions
  add column if not exists cover_media_id uuid,
  add column if not exists combo_price numeric(12,2),
  add column if not exists original_price numeric(12,2),
  add column if not exists metadata_jsonb jsonb default '{}'::jsonb;

comment on column public.promotions.cover_media_id is
  'Cover image for combo promotion display.';

comment on column public.promotions.combo_price is
  'Special combo package price.';

comment on column public.promotions.original_price is
  'Original total price before discount for combo.';

comment on column public.promotions.metadata_jsonb is
  'Flexible JSON storage for combo product lists and other display configurations.';

-- Create promotion targets table for flexible assignment
create table if not exists public.promotion_targets (
  id uuid primary key default extensions.gen_random_uuid(),
  promotion_id uuid not null,
  target_type text not null check (target_type in ('product', 'category', 'brand', 'all')),
  target_id uuid,
  created_at timestamptz not null default now()
);

comment on table public.promotion_targets is
  'Many-to-many relationship: promotions can apply to specific products, categories, brands, or all items.';

-- ============================================================================
-- 4. ENHANCE QUOTE_REQUESTS FOR SALES WORKFLOW
-- ============================================================================

-- Add columns for lead management
alter table public.quote_requests
  add column if not exists assigned_to uuid,
  add column if not exists sales_notes text,
  add column if not exists snapshot_price numeric(12,2),
  add column if not exists snapshot_promo_price numeric(12,2);

comment on column public.quote_requests.assigned_to is
  'Sales staff assigned to handle this lead (references profiles.id).';

comment on column public.quote_requests.sales_notes is
  'Internal notes from sales team about consultation progress.';

comment on column public.quote_requests.snapshot_price is
  'Product price snapshot at the time customer submitted quote request.';

comment on column public.quote_requests.snapshot_promo_price is
  'Promotional price snapshot at the time customer submitted quote request.';

-- Create quote status history table for audit trail
create table if not exists public.quote_status_history (
  id uuid primary key default extensions.gen_random_uuid(),
  quote_request_id uuid not null,
  old_status public.quote_status,
  new_status public.quote_status not null,
  changed_by uuid,
  changed_at timestamptz not null default now(),
  notes text
);

comment on table public.quote_status_history is
  'Audit trail for quote request status changes (new -> contacted -> quoted -> won/lost).';

-- ============================================================================
-- 5. ADD FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Brands foreign keys
alter table public.brands
  add constraint fk_brands_logo_media
    foreign key (logo_media_id) references public.media_assets(id) on delete set null,
  add constraint fk_brands_created_by
    foreign key (created_by) references public.profiles(id) on delete set null,
  add constraint fk_brands_updated_by
    foreign key (updated_by) references public.profiles(id) on delete set null;

alter table public.brand_translations
  add constraint fk_brand_translations_brand
    foreign key (brand_id) references public.brands(id) on delete cascade,
  add constraint uq_brand_translations_brand_locale
    unique (brand_id, locale);

-- Products brand_id foreign key
alter table public.products
  add constraint fk_products_brand
    foreign key (brand_id) references public.brands(id) on delete set null;

-- Promotions foreign keys
alter table public.promotions
  add constraint fk_promotions_cover_media
    foreign key (cover_media_id) references public.media_assets(id) on delete set null;

alter table public.promotion_targets
  add constraint fk_promotion_targets_promotion
    foreign key (promotion_id) references public.promotions(id) on delete cascade;

-- Quote requests foreign keys
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'fk_quote_requests_assigned_to'
  ) then
    alter table public.quote_requests
      add constraint fk_quote_requests_assigned_to
        foreign key (assigned_to) references public.profiles(id) on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'fk_quote_status_history_quote'
  ) then
    alter table public.quote_status_history
      add constraint fk_quote_status_history_quote
        foreign key (quote_request_id) references public.quote_requests(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'fk_quote_status_history_changed_by'
  ) then
    alter table public.quote_status_history
      add constraint fk_quote_status_history_changed_by
        foreign key (changed_by) references public.profiles(id) on delete set null;
  end if;
end $$;

-- ============================================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

create index if not exists idx_brands_status on public.brands(status) where deleted_at is null;
create index if not exists idx_brands_sort_order on public.brands(sort_order);
create index if not exists idx_brand_translations_brand_id on public.brand_translations(brand_id);
create index if not exists idx_brand_translations_locale on public.brand_translations(locale);

create index if not exists idx_products_brand_id on public.products(brand_id) where deleted_at is null;

create index if not exists idx_promotion_targets_promotion on public.promotion_targets(promotion_id);
create index if not exists idx_promotion_targets_type_id on public.promotion_targets(target_type, target_id);

create index if not exists idx_quote_requests_assigned_to on public.quote_requests(assigned_to);
create index if not exists idx_quote_status_history_quote on public.quote_status_history(quote_request_id);

-- ============================================================================
-- 7. ADD RLS POLICIES FOR BRANDS
-- ============================================================================

alter table public.brands enable row level security;
alter table public.brand_translations enable row level security;

-- Public read access for published brands
create policy "Public read published brands"
  on public.brands for select
  using (status = 'published' and deleted_at is null);

create policy "Public read brand translations"
  on public.brand_translations for select
  using (
    exists (
      select 1 from public.brands b
      where b.id = brand_translations.brand_id
        and b.status = 'published'
        and b.deleted_at is null
    )
  );

-- Admin/Editor full access
create policy "Editors can manage brands"
  on public.brands for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.is_active = true
        and p.role in ('admin', 'editor')
    )
  );

create policy "Editors can manage brand translations"
  on public.brand_translations for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.is_active = true
        and p.role in ('admin', 'editor')
    )
  );

-- ============================================================================
-- 8. ADD RLS POLICIES FOR PROMOTION TARGETS
-- ============================================================================

alter table public.promotion_targets enable row level security;

-- Public read for active promotions
create policy "Public read promotion targets"
  on public.promotion_targets for select
  using (
    exists (
      select 1 from public.promotions p
      where p.id = promotion_targets.promotion_id
        and p.status = 'published'
        and (p.start_at is null or p.start_at <= now())
        and (p.end_at is null or p.end_at >= now())
    )
  );

-- Admin manage promotion targets
create policy "Admins manage promotion targets"
  on public.promotion_targets for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.is_active = true
        and p.role = 'admin'
    )
  );

-- ============================================================================
-- 9. ADD RLS POLICIES FOR QUOTE STATUS HISTORY
-- ============================================================================

alter table public.quote_status_history enable row level security;

-- Only admins can view history
create policy "Admins read quote status history"
  on public.quote_status_history for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.is_active = true
        and p.role = 'admin'
    )
  );

create policy "Admins manage quote status history"
  on public.quote_status_history for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.is_active = true
        and p.role = 'admin'
    )
  );

-- ============================================================================
-- 10. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to get active promotions for a product
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
  select 
    p.id,
    p.code,
    p.discount_percentage,
    p.combo_price
  from public.promotions p
  inner join public.promotion_targets pt on pt.promotion_id = p.id
  where p.status = 'published'
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
    );
end;
$$;

commit;
