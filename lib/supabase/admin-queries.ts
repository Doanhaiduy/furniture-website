/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createAdminClient, createClient } from "./server";
import { requireEditorOrAdmin } from "./auth";
import type { SupabaseClient } from "@supabase/supabase-js";



const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(value: string) {
  return uuidRegex.test(value);
}

async function getOrCreateMediaAssetId(
  supabase: any,
  urlOrUuid: string | null | undefined,
  _userId: string
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

  console.warn("Media asset not found in DB for URL:", value);
  return null;
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
  sales_notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  assignee?: { id: string; full_name: string; email: string } | null;
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
  brand_id?: string | null;
  brand_name?: string | null;
  brand_series: string | null;
  featured: boolean;
  published_at: string | null;
  status: string;
  primary_media: unknown;
  media: unknown;
  attributes: unknown;
  sort_order?: number;
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
  parent_name?: string | null;
  group_key?: string | null;
};

export type AdminPromotion = {
  id: string;
  code: string;
  discount_percentage: number | null;
  combo_price: number | null;
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
  

  return {
    productCount: 0,
    categoryCount: 0,
    blogCount: 0,
    showroomCount: 0,
    quoteCount: 0,
    userCount: 0,
  };
}

export async function getAdminQuotesList(params: {
  status?: string;
  keyword?: string;
  dateFrom?: string;
  dateTo?: string;
  assignedTo?: string;
  limit?: number;
  offset?: number;
  withTotal?: boolean;
  sort?: string;
  dir?: "asc" | "desc";
}): Promise<AdminQuote[] | { data: AdminQuote[]; total: number }> {
    try {
      const supabase = await createAdminClient();
      let query = supabase
        .from("quote_requests")
        .select(`
          id,
          full_name,
          phone,
          email,
          company,
          service,
          message,
          preferred_locale,
          product_id,
          category_id,
          source_path,
          source_url,
          status,
          assigned_to,
          admin_notes,
          sales_notes,
          created_at,
          updated_at,
          deleted_at,
          assignee:profiles!assigned_to (
            id,
            full_name,
            email
          )
        `)
        .is("deleted_at", null);

      if (params.status && params.status !== "all") {
        query = query.eq("status", params.status);
      }
      if (params.dateFrom) {
        query = query.gte("created_at", params.dateFrom);
      }
      if (params.dateTo) {
        query = query.lte("created_at", params.dateTo + "T23:59:59.999Z");
      }
      if (params.assignedTo && params.assignedTo !== "all") {
        if (params.assignedTo === "null" || params.assignedTo === "unassigned") {
          query = query.is("assigned_to", null);
        } else {
          query = query.eq("assigned_to", params.assignedTo);
        }
      }
      if (params.keyword) {
        query = query.or(`full_name.ilike.%${params.keyword}%,phone.ilike.%${params.keyword}%,email.ilike.%${params.keyword}%,service.ilike.%${params.keyword}%,company.ilike.%${params.keyword}%,message.ilike.%${params.keyword}%,admin_notes.ilike.%${params.keyword}%,sales_notes.ilike.%${params.keyword}%`);
      }

      // Sort
      const sortField = params.sort || "created_at";
      const ascending = (params.dir ?? "desc") === "asc";
      query = query
        .order(sortField, { ascending })
        .range(params.offset ?? 0, (params.offset ?? 0) + (params.limit ?? 20) - 1);

      const { data, error } = await query;
      const quotes = (!error && data) ? (data as unknown as AdminQuote[]) : [];

      if (params.withTotal) {
        let countQ = supabase
          .from("quote_requests")
          .select("id", { count: "exact", head: true })
          .is("deleted_at", null);
        if (params.status && params.status !== "all") {
          countQ = countQ.eq("status", params.status);
        }
        if (params.dateFrom) {
          countQ = countQ.gte("created_at", params.dateFrom);
        }
        if (params.dateTo) {
          countQ = countQ.lte("created_at", params.dateTo + "T23:59:59.999Z");
        }
        if (params.assignedTo && params.assignedTo !== "all") {
          if (params.assignedTo === "null" || params.assignedTo === "unassigned") {
            countQ = countQ.is("assigned_to", null);
          } else {
            countQ = countQ.eq("assigned_to", params.assignedTo);
          }
        }
        if (params.keyword) {
          countQ = countQ.or(`full_name.ilike.%${params.keyword}%,phone.ilike.%${params.keyword}%,email.ilike.%${params.keyword}%,service.ilike.%${params.keyword}%,company.ilike.%${params.keyword}%,message.ilike.%${params.keyword}%,admin_notes.ilike.%${params.keyword}%,sales_notes.ilike.%${params.keyword}%`);
        }
        const { count } = await countQ;
        return { data: quotes, total: count ?? 0 };
      }

      return quotes;
    } catch (e) {
      console.warn("Exception fetching admin quotes list, falling back to mock:", e);
      if (params.withTotal) return { data: [], total: 0 };
      return [];
    }
}

export async function getAdminProducts(params: {
  limit?: number;
  offset?: number;
  q?: string;
  status?: string;
  categoryId?: string;
  brandId?: string;
  featured?: string;
  sort?: string;
  dir?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
  withTotal?: boolean;
}): Promise<AdminProduct[] | { data: AdminProduct[]; total: number }> {
    try {
      const supabase = createAdminClient();
      let selectStr = `
          id,
          reference_code,
          status,
          price_min,
          price_max,
          currency,
          featured,
          published_at,
          width,
          depth,
          height,
          dimension_unit,
          brand_id,
          brand_series,
          created_at,
          updated_at,
          brands (
            id,
            brand_translations (
              locale,
              name
            )
          ),
          product_categories (
            id,
            group_key,
            product_category_translations (
              name,
              slug
            )
          ),
          product_media (
            media_id,
            is_primary,
            sort_order,
            media:media_assets (
              id,
              public_url,
              format,
              size_bytes,
              mime_type
            )
          )
      `;

      if (params.q) {
        selectStr += `, product_translations!inner(slug, name, summary, description_json, material, price_display_text, dimension_display_text)`;
      } else {
        selectStr += `, product_translations(slug, name, summary, description_json, material, price_display_text, dimension_display_text)`;
      }

      let query = supabase
        .from("products")
        .select(selectStr)
        .is("deleted_at", null);

      if (params.status && params.status !== "all") {
        query = query.eq("status", params.status);
      }
      if (params.categoryId) {
        query = query.eq("category_id", params.categoryId);
      }
      if (params.brandId) {
        query = query.eq("brand_id", params.brandId);
      }
      if (params.featured === "true") {
        query = query.eq("featured", true);
      } else if (params.featured === "false") {
        query = query.eq("featured", false);
      }
      if (params.dateFrom) {
        query = query.gte("created_at", params.dateFrom);
      }
      if (params.dateTo) {
        query = query.lte("created_at", params.dateTo + "T23:59:59.999Z");
      }
      if (params.q) {
        query = query.or(`reference_code.ilike.%${params.q}%,product_translations.name.ilike.%${params.q}%`);
      }

      // Get total count for pagination
      let total = 0;
      if (params.withTotal) {
        let countQuery = supabase
          .from("products")
          .select("id" + (params.q ? ", product_translations!inner(name)" : ""), { count: "exact", head: true })
          .is("deleted_at", null);
        if (params.status && params.status !== "all") countQuery = countQuery.eq("status", params.status);
        if (params.categoryId) countQuery = countQuery.eq("category_id", params.categoryId);
        if (params.brandId) countQuery = countQuery.eq("brand_id", params.brandId);
        if (params.featured === "true") countQuery = countQuery.eq("featured", true);
        else if (params.featured === "false") countQuery = countQuery.eq("featured", false);
        if (params.dateFrom) countQuery = countQuery.gte("created_at", params.dateFrom);
        if (params.dateTo) countQuery = countQuery.lte("created_at", params.dateTo + "T23:59:59.999Z");
        if (params.q) {
          countQuery = countQuery.or(`reference_code.ilike.%${params.q}%,product_translations.name.ilike.%${params.q}%`);
        }
        const { count } = await countQuery;
        total = count ?? 0;
      }

      // Sort
      const sortField = params.sort || "sort_order";
      const ascending = (params.dir ?? "asc") === "asc";
      query = query
        .order(sortField, { ascending })
        .limit(params.limit ?? 20)
        .range(params.offset ?? 0, (params.offset ?? 0) + (params.limit ?? 20) - 1);

      const { data, error } = await query as { data: any[] | null, error: any };
      if (!error && data) {
        const mapped = data.map((row) => {
          const translation = Array.isArray(row.product_translations)
            ? row.product_translations[0]
            : row.product_translations;
          const category = row.product_categories as any;
          const categoryTranslation = category?.product_category_translations?.[0];
          
          const brand = row.brands as any;
          const brandTranslations = Array.isArray(brand?.brand_translations) ? brand.brand_translations : [];
          const brandTranslation = brandTranslations.find((t: any) => t.locale === "vi") || brandTranslations[0];
          const brandName = brandTranslation?.name ?? brand?.name ?? null;

          // Parse product_media associations
          const rawMedia = (row as any).product_media || [];
          const mediaList = Array.isArray(rawMedia)
            ? rawMedia.map((m: any) => ({
                id: m.media?.id || m.media_id,
                url: m.media?.public_url || "",
                is_primary: m.is_primary,
                sort_order: m.sort_order
              })).filter((m: any) => m.url)
            : [];

          const primaryMediaItem = mediaList.find((m: any) => m.is_primary) || mediaList[0] || null;
          const primaryMedia = primaryMediaItem ? { url: primaryMediaItem.url, id: primaryMediaItem.id } : null;
          const media = mediaList.map((m: any) => ({ url: m.url, id: m.id }));

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
            group_key: category?.group_key || null,
            price_min: row.price_min,
            price_max: row.price_max,
            currency: row.currency,
            width: row.width,
            depth: row.depth,
            height: row.height,
            dimension_unit: row.dimension_unit || "mm",
            brand_id: row.brand_id || null,
            brand_name: brandName,
            brand_series: row.brand_series || null,
            featured: row.featured,
            published_at: row.published_at ?? null,
            status: row.status,
            primary_media: primaryMedia,
            media: media,
            attributes: [],
            sort_order: row.sort_order,
            updated_at: row.updated_at,
          } as any;
        });
        if (params.withTotal) return { data: mapped, total };
        return mapped;
      }
    } catch (e) {
      console.warn("Exception fetching admin products, falling back to mock:", e);
    }

  if (params.withTotal) return { data: [], total: 0 };
  return [];
}

export async function getAdminCategories(params: {
  q?: string;
  status?: string;
  groupKey?: string;
  sort?: string;
  dir?: "asc" | "desc";
  limit?: number;
  offset?: number;
  dateFrom?: string;
  dateTo?: string;
  withTotal?: boolean;
  level?: string;
} = {}): Promise<AdminCategory[] | { data: AdminCategory[]; total: number }> {
    try {
      const supabase = createAdminClient();
      let selectStr = `
        id,
        status,
        sort_order,
        parent_id,
        group_key
      `;
      if (params.q) {
        selectStr += `, product_category_translations!inner (locale, slug, name, description)`;
      } else {
        selectStr += `, product_category_translations (locale, slug, name, description)`;
      }

      let query = supabase
        .from("product_categories")
        .select(selectStr)
        .is("deleted_at", null);

      if (params.status && params.status !== "all") {
        query = query.eq("status", params.status);
      }
      if (params.groupKey && params.groupKey !== "all") {
        query = query.eq("group_key", params.groupKey);
      }
      if (params.dateFrom) {
        query = query.gte("created_at", params.dateFrom);
      }
      if (params.dateTo) {
        query = query.lte("created_at", params.dateTo + "T23:59:59.999Z");
      }
      if (params.q) {
        query = query.or("slug.ilike.%" + params.q + "%,product_category_translations.name.ilike.%" + params.q + "%");
      }
      if (params.level === "parent") {
        query = query.is("parent_id", null);
      } else if (params.level === "child") {
        query = query.not("parent_id", "is", null);
      }

      let total = 0;
      if (params.withTotal) {
        let countQ = supabase
          .from("product_categories")
          .select("id" + (params.q ? ", product_category_translations!inner(name)" : ""), { count: "exact", head: true })
          .is("deleted_at", null);
        if (params.status && params.status !== "all") countQ = countQ.eq("status", params.status);
        if (params.groupKey && params.groupKey !== "all") countQ = countQ.eq("group_key", params.groupKey);
        if (params.dateFrom) countQ = countQ.gte("created_at", params.dateFrom);
        if (params.dateTo) countQ = countQ.lte("created_at", params.dateTo + "T23:59:59.999Z");
        if (params.q) {
          countQ = countQ.or("slug.ilike.%" + params.q + "%,product_category_translations.name.ilike.%" + params.q + "%");
        }
        if (params.level === "parent") {
          countQ = countQ.is("parent_id", null);
        } else if (params.level === "child") {
          countQ = countQ.not("parent_id", "is", null);
        }
        const { count } = await countQ;
        total = count ?? 0;
      }

      const sortField = params.sort || "sort_order";
      const ascending = (params.dir ?? "asc") === "asc";
      if (params.limit) {
        query = query
          .order(sortField, { ascending })
          .limit(params.limit)
          .range(params.offset ?? 0, (params.offset ?? 0) + params.limit - 1);
      } else {
        query = query.order(sortField, { ascending });
      }

      const { data, error } = await query as { data: any[] | null, error: any };

      if (!error && data) {
        // Fetch product counts per category in one query
        const { data: countData } = await supabase
          .from("products")
          .select("category_id")
          .is("deleted_at", null);
        const productCountMap: Record<string, number> = {};
        if (countData) {
          countData.forEach((p: any) => {
            if (p.category_id) {
              productCountMap[p.category_id] = (productCountMap[p.category_id] || 0) + 1;
            }
          });
        }

        // Fetch parent names
        const categoryMap: Record<string, string> = {};
        // First map current items
        data.forEach((row) => {
          const translations = Array.isArray(row.product_category_translations)
            ? row.product_category_translations
            : row.product_category_translations
            ? [row.product_category_translations]
            : [];
          const translation = translations.find((t: any) => t?.locale === "vi") || translations[0];
          categoryMap[row.id] = translation?.name ?? "";
        });

        // Query missing parents if any
        const parentIds = data.map(r => r.parent_id).filter((pid): pid is string => Boolean(pid) && !categoryMap[pid]);
        if (parentIds.length > 0) {
          const { data: parentData } = await supabase
            .from("product_categories")
            .select("id, product_category_translations(locale, name)")
            .in("id", parentIds);
          if (parentData) {
            parentData.forEach((pRow: any) => {
              const trans = Array.isArray(pRow.product_category_translations) ? pRow.product_category_translations : [];
              const viTrans = trans.find((t: any) => t.locale === "vi") || trans[0];
              categoryMap[pRow.id] = viTrans?.name ?? "";
            });
          }
        }

        const mapped = data.map((row) => {
          const translations = Array.isArray(row.product_category_translations)
            ? row.product_category_translations
            : row.product_category_translations
            ? [row.product_category_translations]
            : [];
          const translation = translations.find((t: any) => t?.locale === "vi") || translations[0];
          const slugVal = translation?.slug ?? "";
          return {
            id: row.id as string,
            slug: slugVal,
            name: translation?.name ?? slugVal,
            description: translation?.description ?? null,
            status: row.status as string,
            sort_order: row.sort_order,
            parent_id: row.parent_id ?? null,
            group_key: (row as any).group_key ?? null,
            product_count: productCountMap[row.id] || 0,
            parent_name: row.parent_id ? (categoryMap[row.parent_id] || null) : null,
          } as any;
        });

        if (params.withTotal) return { data: mapped, total };
        return mapped;
      }
    } catch (e) {
      console.warn("Exception fetching admin categories, falling back to mock:", e);
    }

  if (params.withTotal) return { data: [], total: 0 };
  return [];
}

export async function getAdminBlogPosts(params: {
  limit?: number;
  offset?: number;
  q?: string;
  status?: string;
  categoryId?: string;
  featured?: string;
  sort?: string;
  dir?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
  withTotal?: boolean;
} = {}): Promise<AdminBlogPost[] | { data: AdminBlogPost[]; total: number }> {
    try {
      const supabase = createAdminClient();
      let selectStr = `
        id,
        status,
        featured,
        published_at,
        created_by,
        cover_media:media_assets!cover_media_id (
          id,
          public_url
        ),
        blog_categories (
          id,
          blog_category_translations (name, slug)
        ),
        profiles!fk_blog_posts_author (full_name)
      `;
      if (params.q) {
        selectStr += `, blog_post_translations!inner (slug, title, excerpt, seo_title, seo_description)`;
      } else {
        selectStr += `, blog_post_translations (slug, title, excerpt, seo_title, seo_description)`;
      }

      let blogQuery = supabase
        .from("blog_posts")
        .select(selectStr)
        .is("deleted_at", null);

      if (params.status && params.status !== "all") {
        blogQuery = blogQuery.eq("status", params.status);
      }
      if (params.categoryId) {
        blogQuery = blogQuery.eq("category_id", params.categoryId);
      }
      if (params.featured === "true") {
        blogQuery = blogQuery.eq("featured", true);
      } else if (params.featured === "false") {
        blogQuery = blogQuery.eq("featured", false);
      }
      if (params.dateFrom) {
        blogQuery = blogQuery.gte("created_at", params.dateFrom);
      }
      if (params.dateTo) {
        blogQuery = blogQuery.lte("created_at", params.dateTo + "T23:59:59.999Z");
      }
      if (params.q) {
        blogQuery = blogQuery.or(`blog_post_translations.title.ilike.%${params.q}%,blog_post_translations.excerpt.ilike.%${params.q}%`);
      }

      let total = 0;
      if (params.withTotal) {
        let countQ = supabase
          .from("blog_posts")
          .select("id" + (params.q ? ", blog_post_translations!inner(title)" : ""), { count: "exact", head: true })
          .is("deleted_at", null);
        if (params.status && params.status !== "all") countQ = countQ.eq("status", params.status);
        if (params.categoryId) countQ = countQ.eq("category_id", params.categoryId);
        if (params.featured === "true") countQ = countQ.eq("featured", true);
        else if (params.featured === "false") countQ = countQ.eq("featured", false);
        if (params.dateFrom) countQ = countQ.gte("created_at", params.dateFrom);
        if (params.dateTo) countQ = countQ.lte("created_at", params.dateTo + "T23:59:59.999Z");
        if (params.q) {
          countQ = countQ.or(`blog_post_translations.title.ilike.%${params.q}%,blog_post_translations.excerpt.ilike.%${params.q}%`);
        }
        const { count } = await countQ;
        total = count ?? 0;
      }

      const sortField = params.sort || "published_at";
      const ascending = (params.dir ?? "desc") === "asc";
      blogQuery = blogQuery
        .order(sortField, { ascending })
        .limit(params.limit ?? 20)
        .range(params.offset ?? 0, (params.offset ?? 0) + (params.limit ?? 20) - 1);

      const { data: blogData, error: blogError } = await blogQuery as { data: any[] | null, error: any };
      if (!blogError && blogData) {
        const mapped = blogData.map((row) => {
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
            cover_media: row.cover_media
              ? { url: Array.isArray(row.cover_media) ? (row.cover_media[0] as any)?.public_url : (row.cover_media as any).public_url }
              : null,
          } as AdminBlogPost;
        });

        if (params.withTotal) return { data: mapped, total };
        return mapped;
      }
    } catch (e) {
      console.warn("Exception fetching admin blog posts, falling back to mock:", e);
    }

  if (params.withTotal) return { data: [], total: 0 };
  return [];
}

export async function getAdminShowrooms(params: {
  q?: string;
  status?: string;
  sort?: string;
  dir?: "asc" | "desc";
  limit?: number;
  offset?: number;
  dateFrom?: string;
  dateTo?: string;
  withTotal?: boolean;
} = {}): Promise<AdminShowroom[] | { data: AdminShowroom[]; total: number }> {
  try {
    const supabase = await createClient();
    let selectStr = `
      id,
      code,
      hotline,
      google_maps_embed_url,
      google_maps_fallback_url,
      latitude,
      longitude,
      status,
      sort_order,
      showroom_media (media_id, is_primary, media:media_assets (public_url))
    `;
    if (params.q) {
      selectStr += `, showroom_translations!inner (locale, name, address, opening_hours)`;
    } else {
      selectStr += `, showroom_translations (locale, name, address, opening_hours)`;
    }

    let query = supabase
      .from("showrooms")
      .select(selectStr)
      .is("deleted_at", null);

    if (params.status && params.status !== "all") {
      query = query.eq("status", params.status);
    }
    if (params.dateFrom) {
      query = query.gte("created_at", params.dateFrom);
    }
    if (params.dateTo) {
      query = query.lte("created_at", params.dateTo + "T23:59:59.999Z");
    }
    if (params.q) {
      query = query.or(`showroom_translations.name.ilike.%${params.q}%,showroom_translations.address.ilike.%${params.q}%`);
    }

    let srTotal = 0;
    if (params.withTotal) {
      let countQ = supabase
        .from("showrooms")
        .select("id" + (params.q ? ", showroom_translations!inner(name)" : ""), { count: "exact", head: true })
        .is("deleted_at", null);
      if (params.status && params.status !== "all") countQ = countQ.eq("status", params.status);
      if (params.dateFrom) countQ = countQ.gte("created_at", params.dateFrom);
      if (params.dateTo) countQ = countQ.lte("created_at", params.dateTo + "T23:59:59.999Z");
      if (params.q) {
        countQ = countQ.or(`showroom_translations.name.ilike.%${params.q}%,showroom_translations.address.ilike.%${params.q}%`);
      }
      const { count } = await countQ;
      srTotal = count ?? 0;
    }

    const srSort = params.sort || "sort_order";
    const srAsc = (params.dir ?? "asc") === "asc";
    if (params.limit) {
      query = query.order(srSort, { ascending: srAsc }).limit(params.limit).range(params.offset ?? 0, (params.offset ?? 0) + params.limit - 1);
    } else {
      query = query.order(srSort, { ascending: srAsc });
    }

    const { data, error } = await query as { data: any[] | null, error: any };
    if (!error && data) {
      const mapped = data.map((row) => {
        const translations = Array.isArray(row.showroom_translations)
          ? row.showroom_translations
          : row.showroom_translations
          ? [row.showroom_translations]
          : [];
        const translation = translations.find((t: any) => t?.locale === "vi") || translations[0];
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
        } as AdminShowroom;
      });

      if (params.withTotal) return { data: mapped, total: srTotal };
      return mapped;
    }
  } catch (e) {
    console.warn("Exception fetching admin showrooms, falling back to mock:", e);
  }

  if (params.withTotal) return { data: [], total: 0 };
  return [];
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
export async function getAdminPromotions(params: {
  q?: string;
  status?: string;
  sort?: string;
  dir?: "asc" | "desc";
  limit?: number;
  offset?: number;
  dateFrom?: string;
  dateTo?: string;
  withTotal?: boolean;
  isActive?: string;
  discountType?: string;
} = {}): Promise<AdminPromotion[] | { data: AdminPromotion[]; total: number }> {
    try {
      const supabase = createAdminClient();
      let selectStr = `
        id,
        code,
        discount_percentage,
        combo_price,
        status,
        start_at,
        end_at,
        created_at,
        updated_at
      `;
      if (params.q) {
        selectStr += `, promotion_translations!inner (locale, title, description)`;
      } else {
        selectStr += `, promotion_translations (locale, title, description)`;
      }

      let query = supabase
        .from("promotions")
        .select(selectStr)
        .is("deleted_at", null);

      if (params.status && params.status !== "all") {
        query = query.eq("status", params.status);
      }
      if (params.dateFrom) {
        query = query.gte("created_at", params.dateFrom);
      }
      if (params.dateTo) {
        query = query.lte("created_at", params.dateTo + "T23:59:59.999Z");
      }
      if (params.q) {
        query = query.or(`code.ilike.%${params.q}%,promotion_translations.title.ilike.%${params.q}%`);
      }
      if (params.discountType === "percentage") {
        query = query.not("discount_percentage", "is", null);
      } else if (params.discountType === "fixed") {
        query = query.not("combo_price", "is", null);
      }
      if (params.isActive === "true") {
        const nowStr = new Date().toISOString();
        query = query.eq("status", "published").lte("start_at", nowStr).or(`end_at.is.null,end_at.gte.${nowStr}`);
      } else if (params.isActive === "false") {
        const nowStr = new Date().toISOString();
        query = query.or(`status.neq.published,start_at.gt.${nowStr},end_at.lt.${nowStr}`);
      }

      let promoTotal = 0;
      if (params.withTotal) {
        let countQ = supabase
          .from("promotions")
          .select("id" + (params.q ? ", promotion_translations!inner(title)" : ""), { count: "exact", head: true })
          .is("deleted_at", null);
        if (params.status && params.status !== "all") countQ = countQ.eq("status", params.status);
        if (params.dateFrom) countQ = countQ.gte("created_at", params.dateFrom);
        if (params.dateTo) countQ = countQ.lte("created_at", params.dateTo + "T23:59:59.999Z");
        if (params.q) {
          countQ = countQ.or(`code.ilike.%${params.q}%,promotion_translations.title.ilike.%${params.q}%`);
        }
        if (params.discountType === "percentage") {
          countQ = countQ.not("discount_percentage", "is", null);
        } else if (params.discountType === "fixed") {
          countQ = countQ.not("combo_price", "is", null);
        }
        if (params.isActive === "true") {
          const nowStr = new Date().toISOString();
          countQ = countQ.eq("status", "published").lte("start_at", nowStr).or(`end_at.is.null,end_at.gte.${nowStr}`);
        } else if (params.isActive === "false") {
          const nowStr = new Date().toISOString();
          countQ = countQ.or(`status.neq.published,start_at.gt.${nowStr},end_at.lt.${nowStr}`);
        }
        const { count } = await countQ;
        promoTotal = count ?? 0;
      }

      const promoSort = params.sort || "created_at";
      const promoAsc = (params.dir ?? "desc") === "asc";
      if (params.limit) {
        query = query.order(promoSort, { ascending: promoAsc }).limit(params.limit).range(params.offset ?? 0, (params.offset ?? 0) + params.limit - 1);
      } else {
        query = query.order(promoSort, { ascending: promoAsc });
      }

      const { data, error } = await query as { data: any[] | null, error: any };

      if (!error && data) {
        const mapped = data.map((row) => {
          const translations = Array.isArray(row.promotion_translations) ? (row.promotion_translations as { locale: string; title: string; description: string | null }[]) : [];
          const viTrans = translations.find((t: any) => t.locale === "vi");
          const enTrans = translations.find((t: any) => t.locale === "en");
          return {
            id: row.id,
            code: row.code,
            discount_percentage: row.discount_percentage ? Number(row.discount_percentage) : null,
            combo_price: row.combo_price ? Number(row.combo_price) : null,
            status: row.status,
            start_at: row.start_at,
            end_at: row.end_at,
            title_vi: viTrans?.title ?? "",
            title_en: enTrans?.title ?? "",
            description_vi: viTrans?.description ?? null,
            description_en: enTrans?.description ?? null,
            created_at: row.created_at,
            updated_at: row.updated_at,
          } as AdminPromotion;
        });

        if (params.withTotal) return { data: mapped, total: promoTotal };
        return mapped;
      }
      if (error) {
        console.warn("Error fetching admin promotions:", error);
      }
    } catch (e) {
      console.warn("Exception fetching admin promotions:", e);
    }

  if (params.withTotal) return { data: [], total: 0 };
  return [];
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
        combo_price: promo.combo_price ? Number(promo.combo_price) : null,
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
        combo_price: promo.combo_price ? Number(promo.combo_price) : null,
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
  try {
    const supabase = await createClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    let query = supabase
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
      `);
    
    if (isUuid) {
      query = query.eq("id", id);
    } else {
      query = query.eq("code", id);
    }

    const { data: promo, error } = await query.single();

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
  last_login_at?: string | null;
};

export async function getAdminUsers(params: {
  q?: string;
  role?: string;
  isActive?: string;
  sort?: string;
  dir?: "asc" | "desc";
  limit?: number;
  offset?: number;
  dateFrom?: string;
  dateTo?: string;
  withTotal?: boolean;
} = {}): Promise<AdminUser[] | { data: AdminUser[]; total: number }> {
  try {
    const supabase = await createAdminClient();
    let query = supabase
      .from("profiles")
      .select("id, email, role, is_active, full_name, created_at, last_login_at")
      .is("deleted_at", null);

    if (params.role && params.role !== "all") {
      query = query.eq("role", params.role);
    }
    if (params.isActive === "true") {
      query = query.eq("is_active", true);
    } else if (params.isActive === "false") {
      query = query.eq("is_active", false);
    }
    if (params.dateFrom) {
      query = query.gte("created_at", params.dateFrom);
    }
    if (params.dateTo) {
      query = query.lte("created_at", params.dateTo + "T23:59:59.999Z");
    }
    if (params.q) {
      query = query.or(`email.ilike.%${params.q}%,full_name.ilike.%${params.q}%`);
    }

    let total = 0;
    if (params.withTotal) {
      let countQ = supabase.from("profiles").select("*", { count: "exact", head: true }).is("deleted_at", null);
      if (params.role && params.role !== "all") countQ = countQ.eq("role", params.role);
      if (params.isActive === "true") countQ = countQ.eq("is_active", true);
      else if (params.isActive === "false") countQ = countQ.eq("is_active", false);
      if (params.dateFrom) countQ = countQ.gte("created_at", params.dateFrom);
      if (params.dateTo) countQ = countQ.lte("created_at", params.dateTo + "T23:59:59.999Z");
      if (params.q) {
        countQ = countQ.or(`email.ilike.%${params.q}%,full_name.ilike.%${params.q}%`);
      }
      const { count } = await countQ;
      total = count ?? 0;
    }

    const userSort = params.sort || "created_at";
    const userAsc = (params.dir ?? "desc") === "asc";
    if (params.limit) {
      query = query.order(userSort, { ascending: userAsc }).limit(params.limit).range(params.offset ?? 0, (params.offset ?? 0) + params.limit - 1);
    } else {
      query = query.order(userSort, { ascending: userAsc });
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching admin users from profiles table:", error);
      if (params.withTotal) return { data: [], total: 0 };
      return [];
    }

    const users = (data || []) as AdminUser[];

    if (params.withTotal) return { data: users, total };
    return users;
  } catch (err) {
    console.error("Exception fetching admin users:", err);
    if (params.withTotal) return { data: [], total: 0 };
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
    

  try {
    await requireEditorOrAdmin();
    const supabase = await createClient();
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

export async function getBrandProductCount(brandId: string): Promise<number> {
  try {
    const supabase = createAdminClient();
    const { count, error } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("brand_id", brandId)
      .is("deleted_at", null);
    if (error) {
      console.error("Failed to count products for brand:", error);
      return 0;
    }
    return count ?? 0;
  } catch (err) {
    console.error("Exception counting products for brand:", err);
    return 0;
  }
}

export async function updatePromotionStatus(
  id: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("promotions")
      .update({
        status,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Database error" };
  }
}

