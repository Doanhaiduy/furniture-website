/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createAdminClient, createClient } from "./server";
import { requireEditorOrAdmin } from "./auth";
import type { SupabaseClient } from "@supabase/supabase-js";
import { mockCategories } from "../mock-data/categories";
import { mockProducts } from "../mock-data/products";
import { mockBlogs } from "../mock-data/blogs";
import { mockShowrooms } from "../mock-data/showrooms";
import { mockQuotes } from "../mock-data/quotes";
import { mockUsers } from "../mock-data/others";



const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(value: string) {
  return uuidRegex.test(value);
}

async function getOrCreateMediaAssetId(
  supabase: any,
  urlOrUuid: string | null | undefined,
  userId: string
): Promise<string | null> {
  if (!urlOrUuid) return null;
  const value = urlOrUuid.trim();
  if (!value) return null;
  if (isUuid(value)) return value;

  const { data: existing } = await supabase
    .from("media_assets")
    .select("id")
    .eq("public_url", value)
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data: inserted, error } = await supabase
    .from("media_assets")
    .insert({
      storage_provider: "cloudinary",
      public_url: value,
      size_bytes: 0,
      mime_type: "image/png",
      format: "png",
      uploaded_by: userId,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("Failed to create media asset:", error);
    return null;
  }
  return inserted.id;
}

interface RawProductCategory {
  id: string;
  slug: string;
  name: string;
  product_category_translations?: Array<{ name: string; description?: string }>;
}

interface RawBlogCategory {
  id: string;
  blog_category_translations?: Array<{ name: string; slug: string }>;
}

interface RawProfile {
  full_name: string;
}

interface RawMediaAsset {
  public_url: string;
}

export type AdminDashboardStats = {
  productCount: number;
  categoryCount: number;
  blogCount: number;
  showroomCount: number;
  quoteCount: number;
  userCount: number;
};

export type AdminQuote = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  company: string | null;
  service: string | null;
  message: string;
  preferred_locale: string;
  product_id: string | null;
  category_id: string | null;
  source_path: string;
  source_url: string | null;
  status: string;
  assigned_to: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type AdminProduct = {
  id: string;
  reference_code: string | null;
  slug: string;
  name: string;
  summary: string;
  description_json: unknown;
  material: string | null;
  price_display_text: string | null;
  dimension_display_text: string | null;
  category_id: string;
  category_slug: string;
  category_name: string;
  group_key: string | null;
  price_min: number | null;
  price_max: number | null;
  currency: string;
  width: number | null;
  depth: number | null;
  height: number | null;
  dimension_unit: string;
  brand_series: string | null;
  featured: boolean;
  published_at: string | null;
  primary_media: unknown;
  media: unknown;
  attributes: unknown;
};

export type AdminCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  status: string;
  sort_order: number;
  parent_id: string | null;
  product_count: number;
};

export type AdminPromotion = {
  id: string;
  code: string;
  discount_percentage: number | null;
  status: string;
  start_at: string | null;
  end_at: string | null;
  title_vi: string;
  title_en: string;
  description_vi: string | null;
  description_en: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body_json: unknown;
  seo_title: string | null;
  seo_description: string | null;
  category_id: string;
  category_name: string;
  category_slug: string;
  author_name: string;
  status: string;
  featured: boolean;
  published_at: string | null;
  cover_media: unknown;
};

export type AdminShowroom = {
  id: string;
  code: string | null;
  name: string;
  address: string;
  opening_hours: string | null;
  hotline: string;
  google_maps_embed_url: string;
  google_maps_fallback_url: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
  sort_order: number;
  primary_media: unknown;
};

export async function getAdminDashboardStats(role: string): Promise<AdminDashboardStats> {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (!useMock) {
    try {
      const supabase = await createClient();
      const [{ count: productCount }, { count: categoryCount }, { count: blogCount }, { count: showroomCount }] =
        await Promise.all([
          supabase.from("products").select("*", { count: "exact", head: true }),
          supabase.from("product_categories").select("*", { count: "exact", head: true }),
          supabase.from("blog_posts").select("*", { count: "exact", head: true }),
          supabase.from("showrooms").select("*", { count: "exact", head: true }),
        ]);

      const isAdmin = role === "admin";
      const [{ count: quoteCount }, { count: userCount }] = isAdmin
        ? await Promise.all([
            supabase.from("quote_requests").select("*", { count: "exact", head: true }),
            supabase.from("profiles").select("*", { count: "exact", head: true }),
          ])
        : [{ count: 0 } as const, { count: 0 } as const];

      if (productCount !== null) {
        return {
          productCount: productCount ?? 0,
          categoryCount: categoryCount ?? 0,
          blogCount: blogCount ?? 0,
          showroomCount: showroomCount ?? 0,
          quoteCount: quoteCount ?? 0,
          userCount: userCount ?? 0,
        };
      }
    } catch (e) {
      console.warn("Exception fetching admin dashboard stats, falling back to mock:", e);
    }
  }

  // Fallback to mock counters
  const isAdmin = role === "admin";
  return {
    productCount: mockProducts.length,
    categoryCount: mockCategories.length,
    blogCount: mockBlogs.length,
    showroomCount: mockShowrooms.length,
    quoteCount: isAdmin ? mockQuotes.length : 0,
    userCount: isAdmin ? mockUsers.length : 0,
  };
}

export async function getAdminQuotesList(params: {
  status?: string;
  keyword?: string;
  limit?: number;
  offset?: number;
}): Promise<AdminQuote[]> {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (!useMock) {
    try {
      const supabase = await createAdminClient();
      const { data, error } = await supabase.rpc("admin_quote_search", {
        p_status: params.status ?? null,
        p_keyword: params.keyword ?? null,
        p_date_from: null,
        p_date_to: null,
        p_source_path: null,
        p_assigned_to: null,
        p_limit: params.limit ?? 50,
        p_offset: params.offset ?? 0,
      });

      if (!error && data && data.length > 0) {
        return data as AdminQuote[];
      }
    } catch (e) {
      console.warn("Exception fetching admin quotes list, falling back to mock:", e);
    }
  }

  // Fallback to mock quotes
  let filtered = mockQuotes.map((q) => ({
    id: q.id,
    full_name: q.full_name,
    phone: q.phone,
    email: q.email,
    company: q.company,
    service: q.service,
    message: q.message,
    preferred_locale: q.preferred_locale,
    product_id: q.product_id,
    category_id: q.category_id,
    source_path: q.source_path,
    source_url: q.source_url,
    status: q.status,
    assigned_to: q.assigned_to,
    admin_notes: q.admin_notes,
    created_at: q.created_at,
    updated_at: q.updated_at,
    deleted_at: q.deleted_at,
  }));

  if (params.status && params.status !== "all") {
    filtered = filtered.filter((q) => q.status === params.status);
  }

  if (params.keyword) {
    const kw = params.keyword.trim().toLowerCase();
    filtered = filtered.filter(
      (q) =>
        q.full_name.toLowerCase().includes(kw) ||
        q.phone.includes(kw) ||
        (q.email && q.email.toLowerCase().includes(kw)) ||
        (q.service && q.service.toLowerCase().includes(kw))
    );
  }

  const offset = params.offset || 0;
  const limit = params.limit || 50;
  return filtered.slice(offset, offset + limit);
}

export async function getAdminProducts(params: {
  limit?: number;
  offset?: number;
  q?: string;
  status?: string;
}): Promise<AdminProduct[]> {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (!useMock) {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("products")
        .select(`
          id,
          reference_code,
          status,
          price_min,
          price_max,
          currency,
          featured,
          published_at,
          product_translations (
            slug,
            name,
            summary,
            description_json,
            material,
            price_display_text,
            dimension_display_text
          ),
          product_categories (
            id,
            slug,
            name,
            product_category_translations (name)
          )
        `)
        .order("sort_order", { ascending: true })
        .limit(params.limit ?? 50)
        .range(params.offset ?? 0, (params.limit ?? 50) - 1);

      if (params.status && params.status !== "all") {
        query = query.eq("status", params.status);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((row) => {
          const translation = Array.isArray(row.product_translations)
            ? row.product_translations[0]
            : row.product_translations;
          const category = row.product_categories as unknown as RawProductCategory;
          const categoryTranslation = category?.product_category_translations?.[0];
          return {
            id: row.id,
            reference_code: row.reference_code ?? null,
            slug: translation?.slug ?? "",
            name: translation?.name ?? "",
            summary: translation?.summary ?? "",
            description_json: translation?.description_json ?? {},
            material: translation?.material ?? null,
            price_display_text: translation?.price_display_text ?? null,
            dimension_display_text: translation?.dimension_display_text ?? null,
            category_id: category?.id ?? "",
            category_slug: category?.slug ?? "",
            category_name: categoryTranslation?.name ?? category?.name ?? "",
            group_key: null,
            price_min: row.price_min,
            price_max: row.price_max,
            currency: row.currency,
            width: null,
            depth: null,
            height: null,
            dimension_unit: "mm",
            brand_series: null,
            featured: row.featured,
            published_at: row.published_at ?? null,
            primary_media: null,
            media: [],
            attributes: [],
          };
        });
      }
    } catch (e) {
      console.warn("Exception fetching admin products, falling back to mock:", e);
    }
  }

  // Fallback to mock products mapping
  let filtered = mockProducts.map((p) => ({
    id: p.id,
    reference_code: p.reference_code,
    slug: p.slug,
    name: p.name.vi,
    summary: p.summary.vi,
    description_json: p.description.vi,
    material: p.material.vi,
    price_display_text: p.price_display_text.vi,
    dimension_display_text: p.dimension_display_text.vi,
    category_id: p.category_id,
    category_slug: p.category_slug,
    category_name: p.category_name.vi,
    group_key: p.group_key,
    price_min: p.price_min,
    price_max: p.price_max,
    currency: p.currency,
    width: null,
    depth: null,
    height: null,
    dimension_unit: "mm",
    brand_series: null,
    featured: p.featured,
    published_at: p.published_at,
    primary_media: p.primary_media,
    media: p.media,
    attributes: p.attributes,
    status: p.status
  }));

  if (params.status && params.status !== "all") {
    filtered = filtered.filter((p) => p.status === params.status);
  }

  if (params.q) {
    const qNorm = params.q.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(qNorm) ||
        p.summary.toLowerCase().includes(qNorm) ||
        p.reference_code.toLowerCase().includes(qNorm)
    );
  }

  const offset = params.offset || 0;
  const limit = params.limit || 50;
  return filtered.slice(offset, offset + limit) as AdminProduct[];
}

export async function getAdminCategories(): Promise<AdminCategory[]> {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (!useMock) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("product_categories")
        .select(`
          id,
          slug,
          status,
          sort_order,
          parent_id,
          product_category_translations (name, description)
        `)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        const { count } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .is("deleted_at", null);

        const productCount = count ?? 0;

        return data.map((row) => {
          const translation = Array.isArray(row.product_category_translations)
            ? row.product_category_translations[0]
            : row.product_category_translations;
          return {
            id: row.id as string,
            slug: row.slug as string,
            name: translation?.name ?? row.slug,
            description: translation?.description ?? null,
            status: row.status as string,
            sort_order: row.sort_order,
            parent_id: row.parent_id ?? null,
            product_count: productCount,
          };
        });
      }
    } catch (e) {
      console.warn("Exception fetching admin categories, falling back to mock:", e);
    }
  }

  // Fallback to mock categories mapping
  return mockCategories.map((cat) => {
    // Count products in this category slug
    const prodCount = mockProducts.filter((p) => p.category_slug === cat.slug).length;

    return {
      id: cat.id,
      slug: cat.slug,
      name: cat.name.vi,
      description: cat.description ? cat.description.vi : null,
      status: cat.status,
      sort_order: cat.sort_order,
      parent_id: cat.parent_id,
      product_count: prodCount,
    };
  });
}

export async function getAdminBlogPosts(params: { limit?: number; offset?: number } = {}): Promise<AdminBlogPost[]> {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (!useMock) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          id,
          status,
          featured,
          published_at,
          created_by,
          blog_post_translations (
            slug,
            title,
            excerpt,
            seo_title,
            seo_description
          ),
          blog_categories (
            id,
            blog_category_translations (name, slug)
          ),
          profiles!blog_posts_author_id_fkey (full_name)
        `)
        .is("deleted_at", null)
        .order("published_at", { ascending: false })
        .limit(params.limit ?? 50)
        .range(params.offset ?? 0, (params.limit ?? 50) - 1);

      if (!error && data && data.length > 0) {
        return data.map((row) => {
          const translation = Array.isArray(row.blog_post_translations)
            ? row.blog_post_translations[0]
            : row.blog_post_translations;
          const category = row.blog_categories as unknown as RawBlogCategory;
          const categoryTranslation = category?.blog_category_translations?.[0];
          const author = row.profiles as unknown as RawProfile;
          return {
            id: row.id,
            slug: translation?.slug ?? "",
            title: translation?.title ?? "",
            excerpt: translation?.excerpt ?? "",
            body_json: {},
            seo_title: translation?.seo_title ?? null,
            seo_description: translation?.seo_description ?? null,
            category_id: category?.id ?? "",
            category_name: categoryTranslation?.name ?? "",
            category_slug: categoryTranslation?.slug ?? "",
            author_name: author?.full_name ?? "",
            status: row.status as string,
            featured: row.featured,
            published_at: row.published_at ?? null,
            cover_media: null,
          };
        });
      }
    } catch (e) {
      console.warn("Exception fetching admin blog posts, falling back to mock:", e);
    }
  }

  // Fallback to mock blogs mapping
  const offset = params.offset || 0;
  const limit = params.limit || 50;
  return mockBlogs.slice(offset, offset + limit).map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title.vi,
    excerpt: post.excerpt.vi,
    body_json: post.sections,
    seo_title: post.title.vi,
    seo_description: post.excerpt.vi,
    category_id: post.category_slug,
    category_name: post.category_name.vi,
    category_slug: post.category_slug,
    author_name: post.author_name,
    status: post.status,
    featured: post.featured,
    published_at: post.published_at,
    cover_media: post.cover_media,
  }));
}

export async function getAdminShowrooms(): Promise<AdminShowroom[]> {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (!useMock) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("showrooms")
        .select(`
          id,
          code,
          hotline,
          google_maps_embed_url,
          google_maps_fallback_url,
          latitude,
          longitude,
          status,
          sort_order,
          showroom_translations (name, address, opening_hours),
          showroom_media (media_id, is_primary, media:media_assets (public_url))
        `)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((row) => {
          const translation = Array.isArray(row.showroom_translations)
            ? row.showroom_translations[0]
            : row.showroom_translations;
          const primaryMedia = Array.isArray(row.showroom_media)
            ? row.showroom_media.find((m: { is_primary: boolean }) => m.is_primary)
            : null;
          const mediaAsset = primaryMedia?.media as unknown as RawMediaAsset;
          return {
            id: row.id,
            code: row.code ?? null,
            name: translation?.name ?? "",
            address: translation?.address ?? "",
            opening_hours: translation?.opening_hours ?? null,
            hotline: row.hotline,
            google_maps_embed_url: row.google_maps_embed_url,
            google_maps_fallback_url: row.google_maps_fallback_url,
            latitude: row.latitude,
            longitude: row.longitude,
            status: row.status as string,
            sort_order: row.sort_order,
            primary_media: mediaAsset?.public_url ?? null,
          };
        });
      }
    } catch (e) {
      console.warn("Exception fetching admin showrooms, falling back to mock:", e);
    }
  }

  // Fallback to mock showrooms mapping
  return mockShowrooms.map((sr) => ({
    id: sr.id,
    code: sr.code,
    name: sr.name.vi,
    address: sr.address.vi,
    opening_hours: sr.opening_hours.vi,
    hotline: sr.hotline,
    google_maps_embed_url: sr.google_maps_embed_url,
    google_maps_fallback_url: sr.google_maps_fallback_url,
    latitude: sr.latitude,
    longitude: sr.longitude,
    status: sr.status,
    sort_order: sr.sort_order,
    primary_media: sr.primary_media.url,
  }));
}

// Private helper to create audit logs
async function createAuditLog(
  supabase: SupabaseClient,
  actorId: string | null,
  action: string,
  entityType: string,
  entityId: string,
  metadata: unknown
) {
  try {
    await supabase.from("audit_logs").insert({
      actor_id: actorId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

// Local in-memory mock promotions for administration tasks in mock mode
let mockPromotions: AdminPromotion[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    code: "heritage-walnut-combo",
    discount_percentage: 15,
    status: "published",
    start_at: null,
    end_at: null,
    title_vi: "Không Gian Phòng Khách Walnut Heritage",
    title_en: "Heritage Walnut Living Room Package",
    description_vi: "Tinh tuyển gỗ óc chó tự nhiên cho căn hộ cao cấp",
    description_en: "Curated natural walnut for premium apartments",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    code: "wellness-bath-set",
    discount_percentage: 18,
    status: "published",
    start_at: null,
    end_at: null,
    title_vi: "Trọn Bộ Thiết Bị Phòng Tắm Wellness",
    title_en: "Wellness Master Bathroom Suite",
    description_vi: "Không gian spa thư giãn nhập khẩu chính hãng tiêu chuẩn Châu Âu",
    description_en: "Relaxing spa suite with European standards",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    code: "porcelain-surface-pack",
    discount_percentage: 20,
    status: "published",
    start_at: null,
    end_at: null,
    title_vi: "Gói Gạch Ốp Lát Toàn Diện Grand Surface",
    title_en: "Grand Surface Porcelain Tile Package",
    description_vi: "Vật liệu cao cấp hoàn thiện bề mặt sang trọng, bền vững",
    description_en: "Premium materials for luxury and durable surfaces",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export async function getAdminPromotions(): Promise<AdminPromotion[]> {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  if (!useMock) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("promotions")
        .select(`
          id,
          code,
          discount_percentage,
          status,
          start_at,
          end_at,
          created_at,
          updated_at,
          promotion_translations (
            locale,
            title,
            description
          )
        `)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data.map((row) => {
          const translations = Array.isArray(row.promotion_translations) ? (row.promotion_translations as { locale: string; title: string; description: string | null }[]) : [];
          const viTrans = translations.find((t) => t.locale === "vi");
          const enTrans = translations.find((t) => t.locale === "en");
          return {
            id: row.id,
            code: row.code,
            discount_percentage: row.discount_percentage ? Number(row.discount_percentage) : null,
            status: row.status,
            start_at: row.start_at,
            end_at: row.end_at,
            title_vi: viTrans?.title ?? "",
            title_en: enTrans?.title ?? "",
            description_vi: viTrans?.description ?? null,
            description_en: enTrans?.description ?? null,
            created_at: row.created_at,
            updated_at: row.updated_at,
          };
        });
      }
      if (error) {
        console.warn("Error fetching admin promotions, falling back to mock:", error);
      }
    } catch (e) {
      console.warn("Exception fetching admin promotions, falling back to mock:", e);
    }
  }
  return mockPromotions;
}

export async function createAdminPromotion(data: {
  code: string;
  discount_percentage: number | null;
  status: string;
  start_at: string | null;
  end_at: string | null;
  title_vi: string;
  title_en: string;
  description_vi: string | null;
  description_en: string | null;
  cover_image?: string | null;
  combo_price?: number | null;
  original_price?: number | null;
  items?: string[];
  productIds?: string[];
}): Promise<{ success: boolean; data?: AdminPromotion; error?: string }> {
  const user = await requireEditorOrAdmin();
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (useMock) {
    const newPromo: AdminPromotion = {
      id: crypto.randomUUID(),
      code: data.code,
      discount_percentage: data.discount_percentage,
      status: data.status,
      start_at: data.start_at,
      end_at: data.end_at,
      title_vi: data.title_vi,
      title_en: data.title_en,
      description_vi: data.description_vi,
      description_en: data.description_en,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      combo_price: data.combo_price || null,
      original_price: data.original_price || null,
      cover_image_url: data.cover_image || null,
      items: data.items || [],
    } as any;
    mockPromotions.unshift(newPromo);
    return { success: true, data: newPromo };
  }
  try {
    const supabase = await createClient();
    
    const coverMediaId = await getOrCreateMediaAssetId(supabase, data.cover_image, user.id);
    const meta = {
      tag_vi: data.discount_percentage ? `Combo Giảm ${data.discount_percentage}%` : "Combo Độc Quyền",
      tag_en: data.discount_percentage ? `${data.discount_percentage}% Off` : "Exclusive Combo",
      items_vi: data.items || [],
      items_en: data.items || [],
      period_vi: "Hạn chót: 30/06/2026",
      period_en: "Until June 30, 2026",
      color: "from-amber-500/20 to-orange-500/5",
      badgeColor: "bg-amber-500 text-black"
    };

    // Insert promotions row
    const { data: promo, error: promoError } = await supabase
      .from("promotions")
      .insert({
        code: data.code,
        discount_percentage: data.discount_percentage,
        status: data.status,
        start_at: data.start_at || null,
        end_at: data.end_at || null,
        cover_media_id: coverMediaId,
        combo_price: data.combo_price || null,
        original_price: data.original_price || null,
        metadata_jsonb: meta,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();

    if (promoError || !promo) {
      return { success: false, error: promoError?.message || "Failed to insert promotion" };
    }

    // Insert translations
    const translations = [];
    if (data.title_vi) {
      translations.push({
        promotion_id: promo.id,
        locale: "vi",
        title: data.title_vi,
        description: data.description_vi,
      });
    }
    if (data.title_en) {
      translations.push({
        promotion_id: promo.id,
        locale: "en",
        title: data.title_en,
        description: data.description_en,
      });
    }

    if (translations.length > 0) {
      const { error: transError } = await supabase
        .from("promotion_translations")
        .insert(translations);

      if (transError) {
        console.error("Failed to insert promotion translations:", transError);
      }
    }

    // Create Audit Log
    await createAuditLog(
      supabase,
      user.id,
      "create",
      "promotion",
      promo.id,
      { code: data.code, title_vi: data.title_vi }
    );

    // Sync product links (N-N)
    if (data.productIds && data.productIds.length > 0) {
      const inserts = data.productIds.map((pid: string) => ({
        product_id: pid,
        promotion_id: promo.id,
      }));
      await supabase.from("product_promotions").insert(inserts);
    }

    return {
      success: true,
      data: {
        id: promo.id,
        code: promo.code,
        discount_percentage: promo.discount_percentage ? Number(promo.discount_percentage) : null,
        status: promo.status,
        start_at: promo.start_at,
        end_at: promo.end_at,
        title_vi: data.title_vi,
        title_en: data.title_en,
        description_vi: data.description_vi,
        description_en: data.description_en,
        created_at: promo.created_at,
        updated_at: promo.updated_at,
      }
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return { success: false, error: errorMsg };
  }
}

export async function updateAdminPromotion(
  id: string,
  data: {
    code: string;
    discount_percentage: number | null;
    status: string;
    start_at: string | null;
    end_at: string | null;
    title_vi: string;
    title_en: string;
    description_vi: string | null;
    description_en: string | null;
    cover_image?: string | null;
    combo_price?: number | null;
    original_price?: number | null;
    items?: string[];
    productIds?: string[];
  }
): Promise<{ success: boolean; data?: AdminPromotion; error?: string }> {
  const user = await requireEditorOrAdmin();
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (useMock) {
    mockPromotions = mockPromotions.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          code: data.code,
          discount_percentage: data.discount_percentage,
          status: data.status,
          start_at: data.start_at,
          end_at: data.end_at,
          title_vi: data.title_vi,
          title_en: data.title_en,
          description_vi: data.description_vi,
          description_en: data.description_en,
          updated_at: new Date().toISOString(),
          combo_price: data.combo_price || null,
          original_price: data.original_price || null,
          cover_image_url: data.cover_image || null,
          items: data.items || [],
        } as any;
      }
      return p;
    });
    const updated = mockPromotions.find((p) => p.id === id);
    return { success: true, data: updated };
  }
  try {
    const supabase = await createClient();

    const coverMediaId = await getOrCreateMediaAssetId(supabase, data.cover_image, user.id);
    const meta = {
      tag_vi: data.discount_percentage ? `Combo Giảm ${data.discount_percentage}%` : "Combo Độc Quyền",
      tag_en: data.discount_percentage ? `${data.discount_percentage}% Off` : "Exclusive Combo",
      items_vi: data.items || [],
      items_en: data.items || [],
      period_vi: "Hạn chót: 30/06/2026",
      period_en: "Until June 30, 2026",
      color: "from-amber-500/20 to-orange-500/5",
      badgeColor: "bg-amber-500 text-black"
    };

    // Update promotions row
    const { data: promo, error: promoError } = await supabase
      .from("promotions")
      .update({
        code: data.code,
        discount_percentage: data.discount_percentage,
        status: data.status,
        start_at: data.start_at || null,
        end_at: data.end_at || null,
        cover_media_id: coverMediaId,
        combo_price: data.combo_price || null,
        original_price: data.original_price || null,
        metadata_jsonb: meta,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (promoError || !promo) {
      return { success: false, error: promoError?.message || "Failed to update promotion" };
    }

    // Upsert translations
    if (data.title_vi) {
      await supabase
        .from("promotion_translations")
        .upsert({
          promotion_id: promo.id,
          locale: "vi",
          title: data.title_vi,
          description: data.description_vi,
          updated_at: new Date().toISOString(),
        }, { onConflict: "promotion_id,locale" });
    }
    if (data.title_en) {
      await supabase
        .from("promotion_translations")
        .upsert({
          promotion_id: promo.id,
          locale: "en",
          title: data.title_en,
          description: data.description_en,
          updated_at: new Date().toISOString(),
        }, { onConflict: "promotion_id,locale" });
    }

    // Create Audit Log
    await createAuditLog(
      supabase,
      user.id,
      "update",
      "promotion",
      promo.id,
      { code: data.code, title_vi: data.title_vi }
    );

    // Sync product links (N-N)
    await supabase.from("product_promotions").delete().eq("promotion_id", id);
    if (data.productIds && data.productIds.length > 0) {
      const inserts = data.productIds.map((pid: string) => ({
        product_id: pid,
        promotion_id: id,
      }));
      await supabase.from("product_promotions").insert(inserts);
    }

    return {
      success: true,
      data: {
        id: promo.id,
        code: promo.code,
        discount_percentage: promo.discount_percentage ? Number(promo.discount_percentage) : null,
        status: promo.status,
        start_at: promo.start_at,
        end_at: promo.end_at,
        title_vi: data.title_vi,
        title_en: data.title_en,
        description_vi: data.description_vi,
        description_en: data.description_en,
        created_at: promo.created_at,
        updated_at: promo.updated_at,
      }
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return { success: false, error: errorMsg };
  }
}

export async function deleteAdminPromotion(id: string): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (useMock) {
    mockPromotions = mockPromotions.filter((p) => p.id !== id);
    return { success: true };
  }

  try {
    const supabase = await createClient();

    // Soft delete
    const { error } = await supabase
      .from("promotions")
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    // Create Audit Log
    await createAuditLog(
      supabase,
      user.id,
      "delete",
      "promotion",
      id,
      { note: "Soft deleted promotion" }
    );

    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return { success: false, error: errorMsg };
  }
}


export async function getAdminPromotionById(id: string): Promise<{ success: boolean; data?: any; error?: string }> {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  if (useMock) {
    const match = mockPromotions.find(p => p.id === id);
    return { success: true, data: match };
  }

  try {
    const supabase = await createClient();
    const { data: promo, error } = await supabase
      .from("promotions")
      .select(`
        id,
        code,
        discount_percentage,
        status,
        start_at,
        end_at,
        cover_media_id,
        combo_price,
        original_price,
        metadata_jsonb,
        logo_media:media_assets!cover_media_id(public_url),
        promotion_translations (
          locale,
          title,
          description
        )
      `)
      .eq("id", id)
      .single();

    if (error || !promo) {
      return { success: false, error: error?.message || "Promotion not found" };
    }

    // Query associated products
    const { data: pLinks } = await supabase
      .from("product_promotions")
      .select("product_id")
      .eq("promotion_id", id);
    const productIds = pLinks ? pLinks.map((l: any) => l.product_id) : [];

    const translations = Array.isArray(promo.promotion_translations) ? promo.promotion_translations : [];
    const viTrans = translations.find((t: any) => t.locale === "vi");
    const enTrans = translations.find((t: any) => t.locale === "en");
    const logoMedia = Array.isArray(promo.logo_media) ? promo.logo_media[0] : promo.logo_media;
    const coverUrl = logoMedia && typeof logoMedia === 'object' && 'public_url' in logoMedia 
      ? (logoMedia as { public_url: string }).public_url 
      : "";

    return {
      success: true,
      data: {
        id: promo.id,
        code: promo.code,
        discount_percentage: promo.discount_percentage ? Number(promo.discount_percentage) : null,
        status: promo.status,
        start_at: promo.start_at,
        end_at: promo.end_at,
        cover_image_url: coverUrl || "",
        combo_price: promo.combo_price,
        original_price: promo.original_price,
        items: promo.metadata_jsonb?.items_vi || promo.metadata_jsonb?.items || [],
        title_vi: viTrans?.title || "",
        title_en: enTrans?.title || "",
        description_vi: viTrans?.description || "",
        description_en: enTrans?.description || "",
        productIds,
      }
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal error" };
  }
}

export type AdminUser = {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  full_name: string | null;
  created_at: string;
};

export async function getAdminUsers(): Promise<AdminUser[]> {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (useMock) {
    return [
      {
        id: "mock-admin-id",
        email: "admin@phuongdong.vn",
        role: "admin",
        is_active: true,
        full_name: "Quản trị viên",
        created_at: new Date().toISOString(),
      },
      {
        id: "mock-editor-id",
        email: "editor@phuongdong.vn",
        role: "editor",
        is_active: true,
        full_name: "Biên tập viên",
        created_at: new Date().toISOString(),
      },
    ];
  }

  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, role, is_active, full_name, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching admin users from profiles table:", error);
      return [];
    }

    return (data || []) as AdminUser[];
  } catch (err) {
    console.error("Exception fetching admin users:", err);
    return [];
  }
}

// ─── Quote Workflow Actions ──────────────────────────────────────────────────

export type QuoteStatusLog = {
  id: string;
  quote_id: string;
  from_status: string | null;
  to_status: string;
  changed_by_name: string;
  note: string | null;
  created_at: string;
};

export async function updateQuoteStatus(
  quoteId: string,
  newStatus: string,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  if (useMock) {
    // Mock: just return success
    return { success: true };
  }

  try {
    await requireEditorOrAdmin();
    const supabase = await createAdminClient();
    const { data, error } = await supabase.rpc("update_quote_status", {
      p_quote_id: quoteId,
      p_new_status: newStatus,
      p_note: note ?? null,
    });

    if (error) {
      console.error("Error updating quote status:", error);
      return { success: false, error: error.message };
    }

    const result = data as { success: boolean; error?: string };
    return result;
  } catch (err) {
    console.error("Exception updating quote status:", err);
    return { success: false, error: String(err) };
  }
}

export async function getQuoteStatusLogs(quoteId: string): Promise<QuoteStatusLog[]> {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  if (useMock) {
    return [
      {
        id: "mock-log-1",
        quote_id: quoteId,
        from_status: null,
        to_status: "new",
        changed_by_name: "Hệ thống",
        note: "Yêu cầu báo giá nhận từ trang web.",
        created_at: new Date().toISOString(),
      },
    ];
  }

  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase.rpc("get_quote_status_logs", {
      p_quote_id: quoteId,
    });

    if (error) {
      console.error("Error fetching quote status logs:", error);
      return [];
    }

    return (data || []) as QuoteStatusLog[];
  } catch (err) {
    console.error("Exception fetching quote status logs:", err);
    return [];
  }
}

export async function searchAdminProducts(q: string): Promise<any[]> {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  if (useMock) {
    const matched = mockProducts.filter(p => 
      p.name.vi.toLowerCase().includes(q.toLowerCase()) ||
      p.reference_code.toLowerCase().includes(q.toLowerCase())
    );
    return matched.map(p => ({
      id: p.id,
      reference_code: p.reference_code,
      name: p.name.vi
    }));
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        reference_code,
        product_translations!inner (name, locale)
      `)
      .eq("product_translations.locale", "vi")
      .or(`reference_code.ilike.%${q}%,product_translations.name.ilike.%${q}%`)
      .limit(10);
    
    if (error) return [];
    return data.map(p => ({
      id: p.id,
      reference_code: p.reference_code,
      name: p.product_translations[0]?.name || ""
    }));
  } catch (e) {
    console.error("Failed to search products:", e);
    return [];
  }
}

export async function getProductsByIds(ids: string[]): Promise<any[]> {
  if (!ids || ids.length === 0) return [];
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  if (useMock) {
    const matched = mockProducts.filter(p => ids.includes(p.id));
    return matched.map(p => ({
      id: p.id,
      reference_code: p.reference_code,
      name: p.name.vi
    }));
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        reference_code,
        product_translations!inner (name, locale)
      `)
      .eq("product_translations.locale", "vi")
      .in("id", ids);
    
    if (error) return [];
    return data.map(p => ({
      id: p.id,
      reference_code: p.reference_code,
      name: p.product_translations[0]?.name || ""
    }));
  } catch (e) {
    console.error("Failed to get products by ids:", e);
    return [];
  }
}

