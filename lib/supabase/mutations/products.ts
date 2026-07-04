/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient, createAdminClient } from "../server";
import { requireEditorOrAdmin } from "../auth";
import { writeAuditLog } from "../audit";
import { productSchema, type ProductInput } from "../../validations/admin";
import { triggerRevalidation, getOrCreateMediaAssetId, validationMessages } from "./helpers";

export async function getAdminProductByIdOrSlug(idOrSlug: string): Promise<{
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const viTrans = product.product_translations.find((t: any) => t.locale === "vi");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        promo_price_min: product.promo_price_min ? Number(product.promo_price_min) : null,
        promo_price_max: product.promo_price_max ? Number(product.promo_price_max) : null,
        cover_image: coverImage,
        gallery_images: galleryImages,
        name_vi: viTrans?.name || "",
        name_en: enTrans?.name || "",
        summary_vi: viTrans?.summary || "",
        summary_en: enTrans?.summary || "",
        description_json_vi: viTrans?.description_json || {},
        description_json_en: enTrans?.description_json || {},
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
    const supabase = await createClient();
    
    const requestedStatus = data.status;
    const isPublishing = requestedStatus === "published";

    // Insert products row as draft first to avoid require_publish_translations trigger abort
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        category_id: data.category_id,
        reference_code: data.reference_code,
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
        promo_price_min: data.promo_price_min,
        promo_price_max: data.promo_price_max,
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

    // Insert translations
    const translations = [];
    translations.push({
      product_id: product.id,
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
    });

    if (data.name_en || data.summary_en) {
      translations.push({
        product_id: product.id,
        locale: "en",
        slug: data.slug,
        name: data.name_en || data.name_vi,
        summary: data.summary_en || data.summary_vi,
        description_json: data.description_json_en || {},
        material: data.material_en,
        price_display_text: data.price_display_text_en,
        dimension_display_text: data.dimension_display_text_en,
        seo_title: data.seo_title_en,
        seo_description: data.seo_description_en,
      });
    }

    const { error: transError } = await supabase
      .from("product_translations")
      .insert(translations);

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
        metadata: { name: data.name_vi, slug: data.slug },
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
    const supabase = await createClient();
    
    // Update products row
    const { data: product, error: productError } = await supabase
      .from("products")
      .update({
        category_id: data.category_id,
        reference_code: data.reference_code,
        status: data.status,
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
        promo_price_min: data.promo_price_min,
        promo_price_max: data.promo_price_max,
        specifications: data.specifications || {},
        custom_attributes: data.custom_attributes || [],
        updated_by: user.id,
        updated_at: new Date().toISOString(),
        published_at: data.status === "published" ? new Date().toISOString() : null,
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

    if (data.name_en || data.summary_en) {
      const { error: enError } = await supabase
        .from("product_translations")
        .upsert({
          product_id: id,
          locale: "en",
          slug: data.slug,
          name: data.name_en || data.name_vi,
          summary: data.summary_en || data.summary_vi,
          description_json: data.description_json_en || {},
          material: data.material_en,
          price_display_text: data.price_display_text_en,
          dimension_display_text: data.dimension_display_text_en,
          seo_title: data.seo_title_en,
          seo_description: data.seo_description_en,
          updated_at: new Date().toISOString(),
        }, { onConflict: "product_id,locale" });

      if (enError) return { success: false, error: enError.message };
    }

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
    const updateObj: any = {
      status,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };
    if (status === "published") {
      updateObj.published_at = new Date().toISOString();
    }
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
