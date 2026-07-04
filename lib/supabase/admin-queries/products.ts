/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient, createAdminClient } from "../server";
import { resolveTranslationMatchIds, buildTranslationSearchOr } from "../search-helpers";

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
          showroom_code,
          price_unit,
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

      selectStr += `, product_translations(slug, name, summary, description_json, material, price_display_text, dimension_display_text)`;

      let query = supabase
        .from("products")
        .select(selectStr)
        .is("deleted_at", null);

      // Free-text search: resolve translation matches to product ids first, then OR
      // them with the parent reference_code. (A dotted embedded ref inside .or() does
      // not parse in PostgREST — see lib/supabase/search-helpers.ts.)
      let searchOr: string | null = null;
      if (params.q) {
        const ids = await resolveTranslationMatchIds(
          supabase, "product_translations", "product_id", ["name"], params.q,
        );
        searchOr = buildTranslationSearchOr("reference_code", params.q, ids);
      }

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
      if (searchOr) {
        query = query.or(searchOr);
      }

      // Get total count for pagination
      let total = 0;
      if (params.withTotal) {
        let countQuery = supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .is("deleted_at", null);
        if (params.status && params.status !== "all") countQuery = countQuery.eq("status", params.status);
        if (params.categoryId) countQuery = countQuery.eq("category_id", params.categoryId);
        if (params.brandId) countQuery = countQuery.eq("brand_id", params.brandId);
        if (params.featured === "true") countQuery = countQuery.eq("featured", true);
        else if (params.featured === "false") countQuery = countQuery.eq("featured", false);
        if (params.dateFrom) countQuery = countQuery.gte("created_at", params.dateFrom);
        if (params.dateTo) countQuery = countQuery.lte("created_at", params.dateTo + "T23:59:59.999Z");
        if (searchOr) {
          countQuery = countQuery.or(searchOr);
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

export async function searchAdminProducts(q: string): Promise<any[]> {
  try {
    const supabase = await createClient();
    // Resolve product ids whose VI name matches, then OR with reference_code on the
    // parent. (A dotted embedded ref inside .or() does not parse in PostgREST.)
    const { data: matches } = await supabase
      .from("product_translations")
      .select("product_id")
      .eq("locale", "vi")
      .ilike("name", `%${q}%`);
    const ids = [...new Set((matches ?? []).map((m: any) => m.product_id).filter(Boolean))];
    const searchOr = buildTranslationSearchOr("reference_code", q, ids);
    if (!searchOr) return [];

    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        reference_code,
        product_translations (name, locale)
      `)
      .is("deleted_at", null)
      .or(searchOr)
      .limit(10);

    if (error || !data) return [];
    return data.map((p: any) => {
      const t = Array.isArray(p.product_translations) ? p.product_translations : [];
      const vi = t.find((x: any) => x.locale === "vi") || t[0];
      return { id: p.id, reference_code: p.reference_code, name: vi?.name || "" };
    });
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
        product_translations!inner (name, locale),
        product_media (is_primary, sort_order, media:media_assets (public_url))
      `)
      .eq("product_translations.locale", "vi")
      .in("id", ids);

    if (error) return [];
    return data.map((p: any) => {
      const mediaList = Array.isArray(p.product_media)
        ? p.product_media
            .map((m: any) => ({ url: m.media?.public_url || "", is_primary: m.is_primary }))
            .filter((m: any) => m.url)
        : [];
      const primary = mediaList.find((m: any) => m.is_primary) || mediaList[0] || null;
      return {
        id: p.id,
        reference_code: p.reference_code,
        name: p.product_translations[0]?.name || "",
        primary_media: primary ? { url: primary.url } : null,
      };
    });
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
