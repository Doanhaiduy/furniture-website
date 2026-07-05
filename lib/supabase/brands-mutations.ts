/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { requireEditorOrAdmin } from "./auth";
import { createAdminClient, createClient } from "./server";
import { writeAuditLog } from "./audit";
import { brandSchema } from "../validations/admin";
import { revalidatePath } from "next/cache";
import { type SupabaseClient } from "@supabase/supabase-js";
import { resolveTranslationMatchIds, buildTranslationSearchOr } from "./search-helpers";

// Types
export interface BrandInput {
  name_vi: string;
  name_en?: string;
  description_vi?: string;
  description_en?: string;
  origin?: string;
  logo_url?: string;
  status: "draft" | "published" | "archived";
  sort_order: number;
  seo_title_vi?: string;
  seo_title_en?: string;
  seo_description_vi?: string;
  seo_description_en?: string;
  slug?: string;
}

// Helpers
function triggerRevalidation() {
  try {
    revalidatePath("/", "layout");
  } catch (e) {
    console.warn("[REVALIDATION WARNING] Failed to revalidate public routes:", e);
  }
}

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
  return uuidRegex.test(value);
}

async function getOrCreateMediaAssetId(
  supabase: SupabaseClient,
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
      public_url: value,
      storage_provider: value.includes("cloudinary") ? "cloudinary" : "supabase_storage",
      resource_type: "image",
      mime_type: "image/png",
      format: "png",
      size_bytes: 1,
      uploaded_by: userId,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("Failed to auto-create media asset for URL:", urlOrUuid, error);
    return null;
  }
  return inserted.id;
}



// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export async function getAdminBrandById(id: string): Promise<{
  success: boolean;
  data?: {
    id: string;
    name_vi: string;
    name_en: string;
    description_vi: string;
    description_en: string;
    origin: string;
    logo_url: string;
    status: "draft" | "published" | "archived";
    sort_order: number;
    seo_title_vi?: string;
    seo_title_en?: string;
    seo_description_vi?: string;
    seo_description_en?: string;
    slug?: string;
  };
  error?: string;
}> {




  try {
    const supabase = await createClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    let query = supabase
      .from("brands")
      .select(`
        *,
        brand_translations (*),
        logo_media:media_assets!fk_brands_logo_media(public_url)
      `);

    if (isUuid) {
      query = query.eq("id", id);
    } else {
      query = query.eq("slug", id);
    }

    const { data: brand, error } = await query
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !brand) {
      return { success: false, error: error?.message || "Brand not found" };
    }

    const viTrans = brand.brand_translations?.find((t: { locale: string; name: string; description?: string; seo_title?: string; seo_description?: string }) => t.locale === "vi");
    const enTrans = brand.brand_translations?.find((t: { locale: string; name: string; description?: string; seo_title?: string; seo_description?: string }) => t.locale === "en");
    const logoMediaRecord = brand.logo_media as Record<string, any> | null | undefined;

    return {
      success: true,
      data: {
        id: brand.id,
        name_vi: viTrans?.name || "",
        name_en: enTrans?.name || "",
        description_vi: viTrans?.description || "",
        description_en: enTrans?.description || "",
        origin: brand.origin || "",
        logo_url: logoMediaRecord?.public_url || "",
        status: brand.status,
        sort_order: brand.sort_order,
        seo_title_vi: viTrans?.seo_title || "",
        seo_title_en: enTrans?.seo_title || "",
        seo_description_vi: viTrans?.seo_description || "",
        seo_description_en: enTrans?.seo_description || "",
        slug: brand.slug || "",
      }
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Database error" };
  }
}

export async function createAdminBrand(data: BrandInput): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> {
  const user = await requireEditorOrAdmin();

  // Server-side validation (defense-in-depth; the form validates too).
  const validation = brandSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.issues.map((i) => i.message).join(", ") };
  }

  try {
    // Service-role client so the rollback delete below works and we don't depend on
    // over-broad table grants (least-privilege grants are enforced separately).
    const supabase = createAdminClient();
    const logoMediaId = await getOrCreateMediaAssetId(supabase, data.logo_url, user.id);

    // Insert brand, retrying the slug on collision (uq_brands_slug). Two brands whose
    // Vietnamese names slugify the same — or a slug freed from a soft-deleted brand —
    // would otherwise hard-fail with a raw duplicate-key error.
    let slug = data.slug || null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let brand: any = null;
    let brandError: { message: string } | null = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      const res = await supabase
        .from("brands")
        .insert({
          logo_media_id: logoMediaId,
          origin: data.origin,
          status: data.status,
          sort_order: data.sort_order,
          slug,
          created_by: user.id,
          updated_by: user.id,
          published_at: data.status === "published" ? new Date().toISOString() : null,
        })
        .select()
        .single();
      brand = res.data;
      brandError = res.error;
      if (!brandError && brand) break;
      const isDuplicate = /duplicate key|unique constraint/i.test(brandError?.message || "");
      if (!isDuplicate || !data.slug || attempt === 3) break;
      slug = `${data.slug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    if (brandError || !brand) {
      return { success: false, error: brandError?.message || "Failed to create brand" };
    }

    // Insert translations
    const translations = [
      {
        brand_id: brand.id,
        locale: "vi",
        name: data.name_vi,
        description: data.description_vi,
        seo_title: data.seo_title_vi,
        seo_description: data.seo_description_vi,
      },
      {
        brand_id: brand.id,
        locale: "en",
        name: data.name_en || data.name_vi,
        description: data.description_en || data.description_vi,
        seo_title: data.seo_title_en,
        seo_description: data.seo_description_en,
      },
    ];

    const { error: transError } = await supabase
      .from("brand_translations")
      .insert(translations);

    if (transError) {
      await supabase.from("brands").delete().eq("id", brand.id);
      return { success: false, error: transError.message };
    }

    // Write audit log
    await writeAuditLog(supabase, {
      actorId: user.id,
      action: "create",
      entityType: "brand",
      entityId: brand.id,
      metadata: { name: data.name_vi },
    });

    triggerRevalidation();
    return { success: true, id: brand.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function updateAdminBrand(id: string, data: BrandInput): Promise<{
  success: boolean;
  error?: string;
}> {
  const user = await requireEditorOrAdmin();

  const validation = brandSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.issues.map((i) => i.message).join(", ") };
  }

  try {
    const supabase = createAdminClient();
    const logoMediaId = await getOrCreateMediaAssetId(supabase, data.logo_url, user.id);

    // Resolve id-or-slug to the real UUID. The admin Edit link passes the brand slug
    // (?edit=<slug>), so without this the update matched no row and the save silently
    // did nothing (edits were lost).
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    let brandId = id;
    if (!isUuid) {
      const { data: found } = await supabase
        .from("brands")
        .select("id")
        .eq("slug", id)
        .is("deleted_at", null)
        .maybeSingle();
      if (!found) {
        return { success: false, error: "Brand not found" };
      }
      brandId = found.id;
    }

    // Update brand
    const { error: brandError } = await supabase
      .from("brands")
      .update({
        logo_media_id: logoMediaId,
        origin: data.origin,
        status: data.status,
        sort_order: data.sort_order,
        slug: data.slug || null,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
        published_at: data.status === "published" ? new Date().toISOString() : null,
      })
      .eq("id", brandId);

    if (brandError) {
      return { success: false, error: brandError.message };
    }

    // Upsert translations
    const { error: viError } = await supabase
      .from("brand_translations")
      .upsert({
        brand_id: brandId,
        locale: "vi",
        name: data.name_vi,
        description: data.description_vi,
        seo_title: data.seo_title_vi,
        seo_description: data.seo_description_vi,
        updated_at: new Date().toISOString(),
      }, { onConflict: "brand_id,locale" });

    if (viError) return { success: false, error: viError.message };

    const { error: enError } = await supabase
      .from("brand_translations")
      .upsert({
        brand_id: brandId,
        locale: "en",
        name: data.name_en || data.name_vi,
        description: data.description_en || data.description_vi,
        seo_title: data.seo_title_en,
        seo_description: data.seo_description_en,
        updated_at: new Date().toISOString(),
      }, { onConflict: "brand_id,locale" });

    if (enError) return { success: false, error: enError.message };

    // Write audit log
    await writeAuditLog(supabase, {
      actorId: user.id,
      action: "update",
      entityType: "brand",
      entityId: brandId,
      metadata: { name: data.name_vi },
    });

    triggerRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function deleteAdminBrand(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const user = await requireEditorOrAdmin();

  try {
    const supabase = createAdminClient();

    // Set brand_id = null for referencing products
    const { error: clearError } = await supabase
      .from("products")
      .update({ brand_id: null })
      .eq("brand_id", id);

    if (clearError) {
      console.warn("Failed to clear brand_id reference for products:", clearError);
    }

    // Soft delete + free the slug so a future brand can reuse it (uq_brands_slug is
    // made soft-delete-aware by migration 0005, but freeing it also keeps older DBs
    // consistent and avoids reserving a human-friendly slug on an archived brand).
    const { data: existingBrand } = await supabase
      .from("brands")
      .select("slug")
      .eq("id", id)
      .maybeSingle();
    const freedSlug =
      existingBrand?.slug && !existingBrand.slug.includes("-deleted-")
        ? `${existingBrand.slug}-deleted-${id.slice(0, 8)}`
        : existingBrand?.slug ?? null;

    const { error } = await supabase
      .from("brands")
      .update({
        deleted_at: new Date().toISOString(),
        status: "archived",
        slug: freedSlug,
        updated_by: user.id,
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    // Write audit log
    await writeAuditLog(supabase, {
      actorId: user.id,
      action: "archive",
      entityType: "brand",
      entityId: id,
    });


    triggerRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function getPublicBrands(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {




  try {
    const supabase = createAdminClient();
    const { data: brands, error } = await supabase
      .from("brands")
      .select(`
        id,
        origin,
        sort_order,
        logo_media:media_assets!fk_brands_logo_media(public_url),
        brand_translations (locale, name, description)
      `)
      .eq("status", "published")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    const formatted = brands?.map((b: any) => {
      const viTrans = b.brand_translations?.find((t: any) => t.locale === "vi");
      const enTrans = b.brand_translations?.find((t: any) => t.locale === "en");
      const logoMediaRecord = b.logo_media as Record<string, any> | null | undefined;

      return {
        id: b.id,
        name: {
          vi: viTrans?.name || "",
          en: enTrans?.name || viTrans?.name || "",
        },
        description: {
          vi: viTrans?.description || "",
          en: enTrans?.description || "",
        },
        origin: b.origin,
        logo_url: logoMediaRecord?.public_url || "",
        sort_order: b.sort_order,
      };
    });

    return { success: true, data: formatted || [] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Database error" };
  }
}

export async function getAdminBrands(params: {
  q?: string;
  status?: string;
  sort?: string;
  dir?: "asc" | "desc";
  limit?: number;
  offset?: number;
  dateFrom?: string;
  dateTo?: string;
  withTotal?: boolean;
} = {}): Promise<any[] | { data: any[]; total: number }> {
  try {
    const supabase = await createClient();
    let selectStr = `
        id,
        slug,
        origin,
        sort_order,
        status,
        logo_media:media_assets!fk_brands_logo_media(public_url)
    `;

    selectStr += `, brand_translations (locale, name)`;

    // Free-text search via translation-id resolution (dotted embedded refs inside .or()
    // do not parse in PostgREST — see lib/supabase/search-helpers.ts).
    let searchOr: string | null = null;
    if (params.q) {
      const ids = await resolveTranslationMatchIds(
        supabase, "brand_translations", "brand_id", ["name"], params.q,
      );
      searchOr = buildTranslationSearchOr("origin", params.q, ids);
    }

    let query = supabase
      .from("brands")
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
    if (searchOr) {
      query = query.or(searchOr);
    }

    let total = 0;
    if (params.withTotal) {
      let countQ = supabase
        .from("brands")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null);
      if (params.status && params.status !== "all") countQ = countQ.eq("status", params.status);
      if (params.dateFrom) countQ = countQ.gte("created_at", params.dateFrom);
      if (params.dateTo) countQ = countQ.lte("created_at", params.dateTo + "T23:59:59.999Z");
      if (searchOr) {
        countQ = countQ.or(searchOr);
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

    const { data: brands, error } = await query as { data: any[] | null, error: any };
    if (error) {
      console.error("Error fetching brands for admin:", error);
      if (params.withTotal) return { data: [], total: 0 };
      return [];
    }

    const formatted = brands?.map((b) => {
      const translations = Array.isArray(b.brand_translations) ? b.brand_translations : [];
      const viTrans = translations.find((t: any) => t.locale === "vi") || translations[0];
      const enTrans = translations.find((t: any) => t.locale === "en") || translations[0];
      const logoMedia = Array.isArray(b.logo_media) ? b.logo_media[0] : b.logo_media;
      const logoUrl = logoMedia && typeof logoMedia === 'object' && 'public_url' in logoMedia 
        ? (logoMedia as { public_url: string }).public_url 
        : "";

      return {
        id: b.id,
        slug: b.slug || "",
        name: {
          vi: viTrans?.name || "",
          en: enTrans?.name || viTrans?.name || "",
        },
        origin: b.origin,
        logo_url: logoUrl,
        status: b.status,
        sort_order: b.sort_order,
      };
    });

    if (params.withTotal) {
      return { data: formatted || [], total };
    }
    return formatted || [];
  } catch (err) {
    console.error("Exception fetching brands for admin:", err);
    if (params.withTotal) return { data: [], total: 0 };
    return [];
  }
}
