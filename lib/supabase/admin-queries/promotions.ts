/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient, createAdminClient } from "../server";
import { requireEditorOrAdmin } from "../auth";
import { resolveTranslationMatchIds, buildTranslationSearchOr } from "../search-helpers";

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

async function createAuditLog(
  supabase: any,
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
      selectStr += `, promotion_translations (locale, title, description)`;

      // Free-text search: resolve translation matches to promotion ids first, then OR
      // with the parent code. (A dotted embedded ref inside .or() does not parse in
      // PostgREST — see lib/supabase/search-helpers.ts.)
      let searchOr: string | null = null;
      if (params.q) {
        const ids = await resolveTranslationMatchIds(
          supabase, "promotion_translations", "promotion_id", ["title"], params.q,
        );
        searchOr = buildTranslationSearchOr("code", params.q, ids);
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
      if (searchOr) {
        query = query.or(searchOr);
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
          .select("id", { count: "exact", head: true })
          .is("deleted_at", null);
        if (params.status && params.status !== "all") countQ = countQ.eq("status", params.status);
        if (params.dateFrom) countQ = countQ.gte("created_at", params.dateFrom);
        if (params.dateTo) countQ = countQ.lte("created_at", params.dateTo + "T23:59:59.999Z");
        if (searchOr) {
          countQ = countQ.or(searchOr);
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

    // The edit link passes promo.code (a non-UUID) as `id`, so resolve it to the real
    // UUID before keying writes on it — otherwise `.eq("id", <code>)` matches no row and
    // the update silently fails. (Same class of bug as brand/showroom edit.)
    let promotionId = id;
    if (!isUuid(id)) {
      const { data: existing } = await supabase
        .from("promotions")
        .select("id")
        .eq("code", id)
        .is("deleted_at", null)
        .maybeSingle();
      if (!existing) {
        return { success: false, error: `Promotion not found: ${id}` };
      }
      promotionId = existing.id;
    }

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
      .eq("id", promotionId)
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
    await supabase.from("product_promotions").delete().eq("promotion_id", promotionId);
    if (data.productIds && data.productIds.length > 0) {
      const inserts = data.productIds.map((pid: string) => ({
        product_id: pid,
        promotion_id: promotionId,
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

    // Query associated products (key on the resolved UUID, not the code/slug passed in).
    const { data: pLinks } = await supabase
      .from("product_promotions")
      .select("product_id")
      .eq("promotion_id", promo.id);
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
