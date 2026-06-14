-- migration file: supabase/migrations/20260613_update_public_promotions_rpc.sql
begin;

-- Create or replace public promotions RPC to include combo fields
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
  description text,
  combo_price numeric,
  original_price numeric,
  cover_image_url text,
  metadata_jsonb jsonb
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
    pt.description,
    p.combo_price,
    p.original_price,
    m.public_url as cover_image_url,
    p.metadata_jsonb
  from public.promotions p
  join public.promotion_translations pt
    on pt.promotion_id = p.id
    and pt.locale = p_locale
  left join public.media_assets m
    on m.id = p.cover_media_id
  where p.status = 'published'::public.publish_status
    and p.deleted_at is null
    and (p.start_at is null or p.start_at <= now())
    and (p.end_at is null or p.end_at >= now())
  order by p.created_at desc;
$$;

-- Seed enhancement data for initial 3 campaigns
update public.promotions
set 
  original_price = 79500000,
  combo_price = 68000000,
  metadata_jsonb = '{
    "tag_vi": "Combo Độc Quyền",
    "tag_en": "Exclusive Package",
    "color": "from-amber-500/20 to-orange-500/5",
    "badgeColor": "bg-amber-500 text-black",
    "items_vi": [
      "Sofa Curve Velour bọc vải cao cấp",
      "Bàn Trà Marble Round Calacatta cao cấp",
      "Kệ Tivi Minimalist Wood gỗ veneer óc chó trầm ấm"
    ],
    "items_en": [
      "Premium Velour upholstered Sofa Curve",
      "Luxurious Marble Round Calacatta Coffee Table",
      "Warm Minimalist Wood TV Cabinet in walnut veneer"
    ]
  }'::jsonb
where id = '11111111-1111-1111-1111-111111111111';

update public.promotions
set 
  original_price = 42000000,
  combo_price = 34500000,
  metadata_jsonb = '{
    "tag_vi": "Gói Sức Khỏe",
    "tag_en": "Wellness Package",
    "color": "from-emerald-500/20 to-teal-500/5",
    "badgeColor": "bg-emerald-500 text-white",
    "items_vi": [
      "Sen Tắm Mạ Vàng 24K với van điều nhiệt cao cấp",
      "Bồn tắm American phong cách khách sạn 5 sao",
      "Lavabo Kohler tối giản chống bám bẩn vượt trội"
    ],
    "items_en": [
      "24K Gold Plated Shower Set with thermostatic valve",
      "5-star hotel style American Freestanding Bathtub",
      "Minimalist Kohler Basin with anti-scale finish"
    ]
  }'::jsonb
where id = '22222222-2222-2222-2222-222222222222';

update public.promotions
set 
  original_price = 1500000,
  combo_price = 1200000,
  metadata_jsonb = '{
    "tag_vi": "Ưu Đãi Hoàn Thiện",
    "tag_en": "Finishing Deal",
    "color": "from-blue-500/20 to-indigo-500/5",
    "badgeColor": "bg-blue-600 text-white",
    "items_vi": [
      "Gạch Calacatta Marble khổ lớn 1200x2400 mm",
      "Gạch Porcelain chịu lực, chống trầy xước",
      "Tư vấn phối ghép vật liệu miễn phí từ KTS"
    ],
    "items_en": [
      "Large format Calacatta Marble look tiles 1200x2400 mm",
      "Heavy duty, scratch-resistant Porcelain tiles",
      "Free material coordination consultancy by architects"
    ]
  }'::jsonb
where id = '33333333-3333-3333-3333-333333333333';

commit;
