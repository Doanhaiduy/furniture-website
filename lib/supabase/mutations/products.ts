/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient, createAdminClient } from "../server";
import { requireEditorOrAdmin } from "../auth";
import { writeAuditLog } from "../audit";
import { productSchema, type ProductInput } from "../../validations/admin";
import { triggerRevalidation, getOrCreateMediaAssetId, validationMessages } from "./helpers";

// The editor works with an HTML/text string. description_json may be a plain string
// (form-authored), a `{}` empty default, a `{html}` object, or a `{sections:[…]}` doc.
// Coerce to a string so the edit form never feeds a bare object to Tiptap (which
// renders blank and then silently drops the content on the next save).
function jsonToEditorText(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value !== "object") return String(value);
  const record = value as Record<string, unknown>;
  if (typeof record.html === "string") return record.html;
  if (Array.isArray(record.sections)) {
    return record.sections
      .map((s) => (s && typeof s === "object" && typeof (s as any).body === "string" ? (s as any).body : ""))
      .filter(Boolean)
      .join("\n\n");
  }
  return ""; // unknown/empty object → empty editor, not "{}"
}

async function checkFeaturedLimit(supabase: any, productId: string | null = null): Promise<{ success: boolean; error?: string }> {
  let query = supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("featured", true)
    .is("deleted_at", null);
  
  if (productId) {
    query = query.neq("id", productId);
  }

  const { count } = await query;
  
  const { data: homePage } = await supabase
    .from("content_pages")
    .select("content_page_translations ( locale, body_json )")
    .eq("key", "home")
    .maybeSingle();

  const viHomeBody = homePage?.content_page_translations?.find((t: any) => t.locale === "vi")?.body_json || {};
  const limit = parseInt(viHomeBody.featuredMaxItems || "4", 10) || 4;

  if ((count ?? 0) >= limit) {
    return {
      success: false,
      error: `Đã đạt giới hạn tối đa ${limit} sản phẩm nổi bật. Vui lòng tắt nổi bật sản phẩm khác trước.`,
    };
  }
  return { success: true };
}


export async function getAdminProductByIdOrSlug(idOrSlug: string): Promise<{
  success: boolean;
   
  data?: any;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    let query = supabase.from("products").select(`
      *,
      product_translations (*),
      product_media (media_id, is_primary, media:media_assets (public_url)),
      product_promotions (promotion_id)
    `);

    if (idOrSlug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      query = query.eq("id", idOrSlug);
    } else {
      const { data: trans } = await supabase
        .from("product_translations")
        .select("product_id")
        .eq("slug", idOrSlug)
        .limit(1);

      if (trans && trans.length > 0) {
        query = query.eq("id", trans[0].product_id);
      } else {
        return { success: false, error: "Product not found by slug" };
      }
    }

    const { data: product, error } = await query.maybeSingle();
    if (error || !product) return { success: false, error: error?.message || "Product not found" };

     
    const viTrans = product.product_translations.find((t: any) => t.locale === "vi");
     
    const enTrans = product.product_translations.find((t: any) => t.locale === "en");

    const productMedia = Array.isArray(product.product_media) ? product.product_media : [];
    const primaryMedia = productMedia.find((m: any) => m.is_primary);
    const primaryMediaRecord = primaryMedia?.media as Record<string, any> | null | undefined;
    const coverImage = primaryMediaRecord?.public_url || "";

    const galleryImages = productMedia
      .filter((m: any) => !m.is_primary)
      .map((m: any) => {
        const r = m.media as Record<string, any> | null | undefined;
        return r?.public_url || "";
      })
      .filter(Boolean);

    return {
      success: true,
      data: {
        id: product.id,
        reference_code: product.reference_code,
        slug: viTrans?.slug || product.slug,
        category_id: product.category_id,
        status: product.status,
        brand_id: product.brand_id,
        showroom_code: product.showroom_code || null,
        price_unit: product.price_unit || null,
        price_min: product.price_min ? Number(product.price_min) : null,
        price_max: product.price_max ? Number(product.price_max) : null,
        currency: product.currency,
        featured: product.featured,
        promotion_id: product.product_promotions?.[0]?.promotion_id || null,
        cover_image: coverImage,
        gallery_images: galleryImages,
        name_vi: viTrans?.name || "",
        name_en: enTrans?.name || "",
        summary_vi: viTrans?.summary || "",
        summary_en: enTrans?.summary || "",
        description_json_vi: jsonToEditorText(viTrans?.description_json),
        description_json_en: jsonToEditorText(enTrans?.description_json),
        material_vi: viTrans?.material || "",
        material_en: enTrans?.material || "",
        price_display_text_vi: viTrans?.price_display_text || "",
        price_display_text_en: enTrans?.price_display_text || "",
        dimension_display_text_vi: viTrans?.dimension_display_text || "",
        dimension_display_text_en: enTrans?.dimension_display_text || "",
        seo_title_vi: viTrans?.seo_title || "",
        seo_title_en: enTrans?.seo_title || "",
        seo_description_vi: viTrans?.seo_description || "",
        seo_description_en: enTrans?.seo_description || "",
        specifications: product.specifications || null,
        custom_attributes: product.custom_attributes || [],
      }
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Database error" };
  }
}

export async function createAdminProduct(data: ProductInput): Promise<{ success: boolean; id?: string; error?: string }> {
  const user = await requireEditorOrAdmin();

  // Server-side validation (BL-PROD-01): the product path previously bypassed Zod
  // entirely (unlike blog/showroom), letting malformed slugs / out-of-range prices
  // through to the DB. Gate on productSchema so bad input is rejected with a friendly
  // message before any write.
  const validation = productSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validationMessages(validation.error.issues) };
  }

  try {
    // Service-role client: an editor's RLS role has no DELETE grant on `products`,
    // so the rollback deletes below would silently no-op and leave zombie rows.
    const supabase = createAdminClient();

    if (data.featured) {
      const limitCheck = await checkFeaturedLimit(supabase);
      if (!limitCheck.success) {
        return { success: false, error: limitCheck.error };
      }
    }

    const requestedStatus = data.status;
    const isPublishing = requestedStatus === "published";

    // Insert products row as draft first to avoid require_publish_translations trigger abort
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        category_id: data.category_id,
        // Empty string must become NULL: uq_products_reference_code_active indexes
        // lower(reference_code) WHERE NOT NULL, and lower("")="" is non-null, so a
        // blank code would collide on the 2nd product. Coerce blanks to null.
        reference_code: data.reference_code?.trim() || null,
        status: "draft",
        price_min: data.price_min,
        price_max: data.price_max,
        currency: data.currency,
        width: data.width,
        depth: data.depth,
        height: data.height,
        dimension_unit: data.dimension_unit,
        brand_id: data.brand_id,
        brand_series: data.brand_series,
        showroom_code: data.showroom_code,
        price_unit: data.price_unit,
        featured: data.featured,
        specifications: data.specifications || {},
        custom_attributes: data.custom_attributes || [],
        created_by: user.id,
        updated_by: user.id,
        published_at: null,
      })
      .select()
      .single();

    if (productError || !product) {
      return { success: false, error: productError?.message || "Failed to create product" };
    }

    // Insert promotion link
    if (data.promotion_id) {
      await supabase.from("product_promotions").insert({
        product_id: product.id,
        promotion_id: data.promotion_id,
      });
    }

    // Insert translations. ALWAYS create BOTH vi and en rows: the publish trigger
    // require_publish_translations needs both locales (name, summary, slug, and a
    // meaningful description_json). When English is left empty we fall back to the
    // Vietnamese values, otherwise publishing a VI-only product aborts with
    // "Cannot publish products without required vi and en translations".
    const buildTranslations = (slug: string) => [
      {
        product_id: product.id,
        locale: "vi",
        slug,
        name: data.name_vi,
        summary: data.summary_vi,
        description_json: data.description_json_vi || {},
        material: data.material_vi,
        price_display_text: data.price_display_text_vi,
        dimension_display_text: data.dimension_display_text_vi,
        seo_title: data.seo_title_vi,
        seo_description: data.seo_description_vi,
      },
      {
        product_id: product.id,
        locale: "en",
        slug,
        name: data.name_en || data.name_vi,
        summary: data.summary_en || data.summary_vi,
        description_json: data.description_json_en || data.description_json_vi || {},
        material: data.material_en ?? data.material_vi,
        price_display_text: data.price_display_text_en ?? data.price_display_text_vi,
        dimension_display_text: data.dimension_display_text_en ?? data.dimension_display_text_vi,
        seo_title: data.seo_title_en ?? data.seo_title_vi,
        seo_description: data.seo_description_en ?? data.seo_description_vi,
      },
    ];

    // The (locale, slug) unique index is global and has NO soft-delete predicate,
    // so two products with the same name — or a slug left behind by a soft-deleted
    // product — would collide. Retry with a short suffix instead of hard-failing.
    let slug = data.slug;
    let transError: { message: string } | null = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      const { error } = await supabase
        .from("product_translations")
        .insert(buildTranslations(slug));
      transError = error;
      if (!error) break;
      const isDuplicate = /duplicate key|unique constraint/i.test(error.message || "");
      if (!isDuplicate || attempt === 3) break;
      slug = `${data.slug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    if (transError) {
      await supabase.from("products").delete().eq("id", product.id);
      return { success: false, error: transError.message };
    }

    // Insert cover image into product_media
    const coverMediaId = await getOrCreateMediaAssetId(supabase, data.cover_image, user.id);
    if (coverMediaId) {
      await supabase
        .from("product_media")
        .insert({
          product_id: product.id,
          media_id: coverMediaId,
          context: "gallery",
          is_primary: true,
          sort_order: 0,
        });
    }

    // Insert gallery images
    if (data.gallery_images && data.gallery_images.length > 0) {
      const galleryInserts = [];
      let sortOrder = 1;
      for (const imgUrl of data.gallery_images) {
        const mediaId = await getOrCreateMediaAssetId(supabase, imgUrl, user.id);
        if (mediaId && mediaId !== coverMediaId) {
          galleryInserts.push({
            product_id: product.id,
            media_id: mediaId,
            context: "gallery",
            is_primary: false,
            sort_order: sortOrder++,
          });
        }
      }
      if (galleryInserts.length > 0) {
        await supabase.from("product_media").insert(galleryInserts);
      }
    }

    // Now update status to published if requested
    if (isPublishing) {
      const { error: publishError } = await supabase
        .from("products")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
        })
        .eq("id", product.id);

      if (publishError) {
        await supabase.from("products").delete().eq("id", product.id);
        return { success: false, error: publishError.message };
      }
    }

    try {
      await writeAuditLog(supabase, {
        actorId: user.id,
        action: "create",
        entityType: "product",
        entityId: product.id,
        metadata: { name: data.name_vi, slug },
      });
    } catch (auditError) {
      await supabase.from("products").delete().eq("id", product.id);
      return { success: false, error: auditError instanceof Error ? auditError.message : "Audit logging failed" };
    }

    triggerRevalidation();
    return { success: true, id: product.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function updateAdminProduct(id: string, data: ProductInput): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();

  // Server-side validation (BL-PROD-01): mirror createAdminProduct.
  const validation = productSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validationMessages(validation.error.issues) };
  }

  try {
    const supabase = createAdminClient();

    if (data.featured) {
      const limitCheck = await checkFeaturedLimit(supabase, id);
      if (!limitCheck.success) {
        return { success: false, error: limitCheck.error };
      }
    }

    // Update products row
    const { data: product, error: productError } = await supabase
      .from("products")
      .update({
        category_id: data.category_id,
        // Empty string must become NULL: uq_products_reference_code_active indexes
        // lower(reference_code) WHERE NOT NULL, and lower("")="" is non-null, so a
        // blank code would collide on the 2nd product. Coerce blanks to null.
        reference_code: data.reference_code?.trim() || null,
        // status + published_at are handled in a SECOND update AFTER translations are
        // written (see below). This keeps the require_publish_translations trigger from
        // reading stale translations, and lets the set_publish_timestamps trigger own
        // published_at (stamped only on the draft→published transition, never re-stamped).
        price_min: data.price_min,
        price_max: data.price_max,
        currency: data.currency,
        width: data.width,
        depth: data.depth,
        height: data.height,
        dimension_unit: data.dimension_unit,
        brand_id: data.brand_id,
        showroom_code: data.showroom_code,
        price_unit: data.price_unit,
        featured: data.featured,
        specifications: data.specifications || {},
        custom_attributes: data.custom_attributes || [],
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (productError || !product) {
      return { success: false, error: productError?.message || "Failed to update product" };
    }

    // Sync promotion links (N-N)
    await supabase.from("product_promotions").delete().eq("product_id", id);
    if (data.promotion_id) {
      await supabase.from("product_promotions").insert({
        product_id: id,
        promotion_id: data.promotion_id,
      });
    }

    // Upsert translations
    const { error: viError } = await supabase
      .from("product_translations")
      .upsert({
        product_id: id,
        locale: "vi",
        slug: data.slug,
        name: data.name_vi,
        summary: data.summary_vi,
        description_json: data.description_json_vi || {},
        material: data.material_vi,
        price_display_text: data.price_display_text_vi,
        dimension_display_text: data.dimension_display_text_vi,
        seo_title: data.seo_title_vi,
        seo_description: data.seo_description_vi,
        updated_at: new Date().toISOString(),
      }, { onConflict: "product_id,locale" });

    if (viError) return { success: false, error: viError.message };

    // Always keep an English translation too (fall back to Vietnamese when empty)
    // so the publish trigger's "requires vi and en translations" rule is satisfied.
    const { error: enError } = await supabase
      .from("product_translations")
      .upsert({
        product_id: id,
        locale: "en",
        slug: data.slug,
        name: data.name_en || data.name_vi,
        summary: data.summary_en || data.summary_vi,
        description_json: data.description_json_en || data.description_json_vi || {},
        material: data.material_en ?? data.material_vi,
        price_display_text: data.price_display_text_en ?? data.price_display_text_vi,
        dimension_display_text: data.dimension_display_text_en ?? data.dimension_display_text_vi,
        seo_title: data.seo_title_en ?? data.seo_title_vi,
        seo_description: data.seo_description_en ?? data.seo_description_vi,
        updated_at: new Date().toISOString(),
      }, { onConflict: "product_id,locale" });

    if (enError) return { success: false, error: enError.message };

    // Two-phase publish: flip the status only AFTER both translations are written,
    // so require_publish_translations evaluates the fresh translations. published_at
    // is intentionally omitted — the set_publish_timestamps trigger stamps it on the
    // draft→published transition and never re-stamps it on later edits.
    const { error: statusError } = await supabase
      .from("products")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (statusError) return { success: false, error: statusError.message };

    // Sync media (BL-PROD-03): resolve every media id FIRST, so a failure while
    // resolving/creating assets can't leave the product with its old images already
    // wiped. Only once the full new set is known do we replace the associations.
    const coverMediaId = await getOrCreateMediaAssetId(supabase, data.cover_image, user.id);
    const galleryInserts: Array<{ product_id: string; media_id: string; context: string; is_primary: boolean; sort_order: number }> = [];
    if (data.gallery_images && data.gallery_images.length > 0) {
      let sortOrder = 1;
      for (const imgUrl of data.gallery_images) {
        const mediaId = await getOrCreateMediaAssetId(supabase, imgUrl, user.id);
        if (mediaId && mediaId !== coverMediaId) {
          galleryInserts.push({
            product_id: id,
            media_id: mediaId,
            context: "gallery",
            is_primary: false,
            sort_order: sortOrder++,
          });
        }
      }
    }

    // New set is fully resolved — now replace the associations.
    await supabase.from("product_media").delete().eq("product_id", id);

    if (coverMediaId) {
      await supabase
        .from("product_media")
        .insert({
          product_id: id,
          media_id: coverMediaId,
          context: "gallery",
          is_primary: true,
          sort_order: 0,
        });
    }

    if (galleryInserts.length > 0) {
      await supabase.from("product_media").insert(galleryInserts);
    }

    // Write audit log
    await writeAuditLog(supabase, {
      actorId: user.id,
      action: "update",
      entityType: "product",
      entityId: id,
      metadata: { name: data.name_vi, slug: data.slug },
    });

    triggerRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function deleteAdminProduct(id: string): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();

  try {
    const supabase = createAdminClient();

    // Delete product_media associations to prevent orphan records
    const { error: pmDeleteError } = await supabase
      .from("product_media")
      .delete()
      .eq("product_id", id);
    if (pmDeleteError) {
      console.error("Failed to clean up product_media for archived product:", pmDeleteError);
    }

    // Soft delete
    const { error } = await supabase
      .from("products")
      .update({
        deleted_at: new Date().toISOString(),
        status: "archived",
        updated_by: user.id,
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    // Free the (locale, slug) namespace: the product_translations unique index has
    // no soft-delete predicate, so leaving the slug intact would block a future
    // product from reusing it. Suffix the archived rows' slugs.
    const { data: archivedTrans } = await supabase
      .from("product_translations")
      .select("locale, slug")
      .eq("product_id", id);
    if (archivedTrans) {
      for (const t of archivedTrans as { locale: string; slug: string }[]) {
        if (t.slug && !t.slug.includes("-deleted-")) {
          await supabase
            .from("product_translations")
            .update({ slug: `${t.slug}-deleted-${id.slice(0, 8)}` })
            .eq("product_id", id)
            .eq("locale", t.locale);
        }
      }
    }

    // Write audit log
    await writeAuditLog(supabase, {
      actorId: user.id,
      action: "archive",
      entityType: "product",
      entityId: id,
    });

    triggerRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function updateProductFeatured(id: string, featured: boolean): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();
  try {
    const supabase = createAdminClient();
    if (featured) {
      const limitCheck = await checkFeaturedLimit(supabase, id);
      if (!limitCheck.success) {
        return { success: false, error: limitCheck.error };
      }
    }
    const { error } = await supabase
      .from("products")
      .update({
        featured,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    await writeAuditLog(supabase, {
      actorId: user.id,
      action: "update",
      entityType: "product",
      entityId: id,
      metadata: { featured },
    });
    triggerRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function updateProductStatus(id: string, status: string): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();
  try {
    const supabase = createAdminClient();

    if (status === "published") {
      // Friendly pre-check mirroring require_publish_translations, so quick-publishing
      // a draft with an empty body from the list returns a clear message instead of a
      // raw trigger error. The DB trigger remains the hard guarantee.
      const { data: trans } = await supabase
        .from("product_translations")
        .select("locale, name, summary, slug, description_json")
        .eq("product_id", id);
      const rows = Array.isArray(trans) ? trans : [];
       
      const hasMeaningful = (r: any) =>
        r && r.slug && r.name && r.summary && r.description_json &&
        !(typeof r.description_json === "object" && Object.keys(r.description_json).length === 0) &&
        !(typeof r.description_json === "string" && r.description_json.trim() === "");
       
      if (!hasMeaningful(rows.find((r: any) => r.locale === "vi")) || !hasMeaningful(rows.find((r: any) => r.locale === "en"))) {
        return { success: false, error: "Cần nhập đầy đủ nội dung mô tả (tiếng Việt và tiếng Anh) trước khi xuất bản." };
      }
    }

    // published_at is owned by the set_publish_timestamps trigger.
    const updateObj: any = {
      status,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("products")
      .update(updateObj)
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    await writeAuditLog(supabase, {
      actorId: user.id,
      action: "update",
      entityType: "product",
      entityId: id,
      metadata: { status },
    });
    triggerRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}
 