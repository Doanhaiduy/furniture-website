/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import DOMPurify from "isomorphic-dompurify";
import { type SupabaseClient } from "@supabase/supabase-js";
import { requireEditorOrAdmin } from "./auth";
import { createAdminClient, createClient } from "./server";
import { writeAuditLog } from "./audit";
import {
  blogPostSchema,
  showroomSchema,
  type BlogPostInput,
  type CategoryInput,
  type ProductInput,
  type ShowroomInput,
} from "../validations/admin";
import { revalidatePath } from "next/cache";

// Private helper to trigger Next.js cache revalidation for all locales
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

  // Check if asset already exists with the same public URL
  const { data: existing } = await supabase
    .from("media_assets")
    .select("id")
    .eq("public_url", value)
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing.id;

  // Otherwise create a new media asset
  const { data: inserted, error } = await supabase
    .from("media_assets")
    .insert({
      public_url: value,
      storage_provider: value.includes("cloudinary") ? "cloudinary" : "supabase_storage",
      resource_type: "image",
      mime_type: "image/jpeg",
      format: "jpg",
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

function validationMessages(issues: Array<{ message: string }>) {
  return issues.map((issue) => issue.message).join(". ");
}

function bodyJsonFromEditor(value: unknown, fallbackTitle: string) {
  if (value && typeof value === "object") {
    return value;
  }

  const body = typeof value === "string" ? value.trim() : "";
  return {
    sections: [
      {
        id: "noi-dung",
        title: fallbackTitle,
        body,
      },
    ],
  };
}

function bodyJsonToEditorText(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value !== "object") return String(value);

  const record = value as Record<string, unknown>;
  if (typeof record.html === "string") return record.html;

  if (Array.isArray(record.sections)) {
    return record.sections
      .map((section) => {
        if (!section || typeof section !== "object") return "";
        const sectionRecord = section as Record<string, unknown>;
        const body = sectionRecord.body;
        if (typeof body === "string") return body;
        if (body && typeof body === "object") {
          const localizedBody = body as Record<string, unknown>;
          return String(localizedBody.vi ?? localizedBody.en ?? "");
        }
        return "";
      })
      .filter(Boolean)
      .join("\n\n");
  }

  return JSON.stringify(value);
}

function localizedText(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

async function resolveBlogCategoryId(
  supabase: ReturnType<typeof createAdminClient>,
  categoryIdOrSlug: string
): Promise<{ id?: string; error?: string }> {
  const value = categoryIdOrSlug.trim();
  if (!value) return { error: "Danh mục bài viết là bắt buộc" };
  if (isUuid(value)) return { id: value };

  const { data, error } = await supabase
    .from("blog_category_translations")
    .select("category_id")
    .eq("slug", value)
    .limit(1)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data?.category_id) return { error: `Không tìm thấy danh mục bài viết: ${value}` };
  return { id: data.category_id };
}

async function findBlogPostId(
  supabase: ReturnType<typeof createAdminClient>,
  idOrSlug: string
): Promise<{ id?: string; error?: string }> {
  const value = idOrSlug.trim();
  if (isUuid(value)) return { id: value };

  const { data, error } = await supabase
    .from("blog_post_translations")
    .select("post_id")
    .eq("slug", value)
    .limit(1)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data?.post_id) return { error: "Blog post not found by slug" };
  return { id: data.post_id };
}

async function findShowroomId(
  supabase: ReturnType<typeof createAdminClient>,
  idOrCode: string
): Promise<{ id?: string; error?: string }> {
  const value = idOrCode.trim();
  if (isUuid(value)) return { id: value };

  const { data, error } = await supabase
    .from("showrooms")
    .select("id")
    .ilike("code", value)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data?.id) return { error: "Showroom not found by code" };
  return { id: data.id };
}

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

export async function getAdminCategoryByIdOrSlug(idOrSlug: string): Promise<{
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  error?: string;
}> {
    

  try {
    const supabase = await createClient();
    let query = supabase.from("product_categories").select(`
      *,
      product_category_translations (*),
      image_media:media_assets!fk_product_categories_image_media(public_url)
    `);

    if (idOrSlug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      query = query.eq("id", idOrSlug);
    } else {
      const { data: trans } = await supabase
        .from("product_category_translations")
        .select("category_id")
        .eq("slug", idOrSlug)
        .limit(1);
      
      if (trans && trans.length > 0) {
        query = query.eq("id", trans[0].category_id);
      } else {
        return { success: false, error: "Category not found by slug" };
      }
    }

    const { data: cat, error } = await query.maybeSingle();
    if (error || !cat) return { success: false, error: error?.message || "Category not found" };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const viTrans = cat.product_category_translations.find((t: any) => t.locale === "vi");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enTrans = cat.product_category_translations.find((t: any) => t.locale === "en");

    const imageMediaRecord = cat.image_media as Record<string, any> | null | undefined;

    return {
      success: true,
      data: {
        id: cat.id,
        slug: viTrans?.slug || cat.slug,
        parent_id: cat.parent_id,
        group_key: cat.group_key,
        status: cat.status,
        sort_order: cat.sort_order,
        name_vi: viTrans?.name || "",
        name_en: enTrans?.name || "",
        description_vi: viTrans?.description || "",
        description_en: enTrans?.description || "",
        seo_title_vi: viTrans?.seo_title || "",
        seo_title_en: enTrans?.seo_title || "",
        seo_description_vi: viTrans?.seo_description || "",
        seo_description_en: enTrans?.seo_description || "",
        cover_image: imageMediaRecord?.public_url || "",
      }
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Database error" };
  }
}

export async function createAdminProduct(data: ProductInput): Promise<{ success: boolean; id?: string; error?: string }> {
  const user = await requireEditorOrAdmin();  

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

    // Sync media: delete existing associations and insert new ones
    await supabase.from("product_media").delete().eq("product_id", id);

    const coverMediaId = await getOrCreateMediaAssetId(supabase, data.cover_image, user.id);
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

    if (data.gallery_images && data.gallery_images.length > 0) {
      const galleryInserts = [];
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
      if (galleryInserts.length > 0) {
        await supabase.from("product_media").insert(galleryInserts);
      }
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

function mapGroupKeyToDb(groupKey: string | null | undefined): any {
  if (groupKey === "wood") return "wooden_furniture";
  if (groupKey === "sanitary") return "sanitary_equipment";
  return groupKey || null;
}

export async function createAdminCategory(data: CategoryInput): Promise<{ success: boolean; id?: string; error?: string }> {
  const user = await requireEditorOrAdmin();
  
  

  try {
    const supabase = await createClient();
    
    const coverMediaId = await getOrCreateMediaAssetId(supabase, data.cover_image, user.id);

    const requestedStatus = data.status;
    const isPublishing = requestedStatus === "published";

    // Insert product_categories as draft first to avoid require_publish_translations trigger abort
    const { data: cat, error: catError } = await supabase
      .from("product_categories")
      .insert({
        parent_id: data.parent_id || null,
        group_key: mapGroupKeyToDb(data.group_key),
        image_media_id: coverMediaId,
        status: "draft",
        sort_order: data.sort_order,
        created_by: user.id,
        updated_by: user.id,
        published_at: null,
      })
      .select()
      .single();

    if (catError || !cat) {
      return { success: false, error: catError?.message || "Failed to create category" };
    }

    const translations = [];
    translations.push({
      category_id: cat.id,
      locale: "vi",
      slug: data.slug,
      name: data.name_vi,
      description: data.description_vi,
      seo_title: data.seo_title_vi,
      seo_description: data.seo_description_vi,
    });

    if (data.name_en) {
      translations.push({
        category_id: cat.id,
        locale: "en",
        slug: data.slug,
        name: data.name_en,
        description: data.description_en,
        seo_title: data.seo_title_en,
        seo_description: data.seo_description_en,
      });
    }

    const { error: transError } = await supabase
      .from("product_category_translations")
      .insert(translations);

    if (transError) {
      await supabase.from("product_categories").delete().eq("id", cat.id);
      return { success: false, error: transError.message };
    }

    // Now update status to published if requested
    if (isPublishing) {
      const { error: publishError } = await supabase
        .from("product_categories")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
        })
        .eq("id", cat.id);

      if (publishError) {
        await supabase.from("product_categories").delete().eq("id", cat.id);
        return { success: false, error: publishError.message };
      }
    }

    try {
      await writeAuditLog(supabase, {
        actorId: user.id,
        action: "create",
        entityType: "category",
        entityId: cat.id,
        metadata: { name: data.name_vi, slug: data.slug },
      });
    } catch (auditError) {
      await supabase.from("product_categories").delete().eq("id", cat.id);
      return { success: false, error: auditError instanceof Error ? auditError.message : "Audit logging failed" };
    }

    triggerRevalidation();
    return { success: true, id: cat.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

function checkCircularCategory(
  id: string,
  parentId: string,
  categories: { id: string; parent_id: string | null }[]
): boolean {
  let currentParentId: string | null = parentId;
  const visited = new Set<string>();
  visited.add(id);

  while (currentParentId) {
    if (currentParentId === id) {
      return true;
    }
    if (visited.has(currentParentId)) {
      break;
    }
    visited.add(currentParentId);
    const parent = categories.find((c) => c.id === currentParentId);
    currentParentId = parent?.parent_id || null;
  }
  return false;
}

export async function updateAdminCategory(id: string, data: CategoryInput): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();
  
  if (data.parent_id && data.parent_id === id) {
    return { success: false, error: "Circular parent-child relationship detected" };
  }

  

  try {
    const supabase = await createClient();
    
    if (data.parent_id) {
      const { data: allCategories, error: fetchError } = await supabase
        .from("product_categories")
        .select("id, parent_id")
        .is("deleted_at", null);

      if (!fetchError && allCategories) {
        if (checkCircularCategory(id, data.parent_id, allCategories)) {
          return { success: false, error: "Circular parent-child relationship detected" };
        }
      }
    }

    const coverMediaId = await getOrCreateMediaAssetId(supabase, data.cover_image, user.id);
    
    // Update product_categories
    const { data: cat, error: catError } = await supabase
      .from("product_categories")
      .update({
        parent_id: data.parent_id || null,
        group_key: mapGroupKeyToDb(data.group_key),
        image_media_id: coverMediaId,
        status: data.status,
        sort_order: data.sort_order,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
        published_at: data.status === "published" ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .select()
      .single();

    if (catError || !cat) {
      return { success: false, error: catError?.message || "Failed to update category" };
    }

    // Upsert translations
    const { error: viError } = await supabase
      .from("product_category_translations")
      .upsert({
        category_id: id,
        locale: "vi",
        slug: data.slug,
        name: data.name_vi,
        description: data.description_vi,
        seo_title: data.seo_title_vi,
        seo_description: data.seo_description_vi,
        updated_at: new Date().toISOString(),
      }, { onConflict: "category_id,locale" });

    if (viError) return { success: false, error: viError.message };

    if (data.name_en) {
      const { error: enError } = await supabase
        .from("product_category_translations")
        .upsert({
          category_id: id,
          locale: "en",
          slug: data.slug,
          name: data.name_en,
          description: data.description_en,
          seo_title: data.seo_title_en,
          seo_description: data.seo_description_en,
          updated_at: new Date().toISOString(),
        }, { onConflict: "category_id,locale" });

      if (enError) return { success: false, error: enError.message };
    }

    // Write audit log
    await writeAuditLog(supabase, {
      actorId: user.id,
      action: "update",
      entityType: "category",
      entityId: id,
      metadata: { name: data.name_vi, slug: data.slug },
    });

    triggerRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function deleteAdminCategory(id: string): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();
  
  

  try {
    const supabase = createAdminClient();
    
    // Soft delete
    const { error } = await supabase
      .from("product_categories")
      .update({
        deleted_at: new Date().toISOString(),
        status: "draft",
        updated_by: user.id,
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    // Write audit log
    await writeAuditLog(supabase, {
      actorId: user.id,
      action: "archive",
      entityType: "category",
      entityId: id,
    });

    triggerRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function getAdminBlogPostByIdOrSlug(idOrSlug: string): Promise<{
  success: boolean;
  data?: {
    id: string;
    slug: string;
    title_vi: string;
    title_en: string;
    excerpt_vi: string;
    excerpt_en: string;
    body_json_vi: string;
    body_json_en: string;
    category_id: string;
    status: "draft" | "published" | "archived";
    featured: boolean;
    seo_title_vi: string;
    seo_title_en: string;
    seo_description_vi: string;
    seo_description_en: string;
    cover_image: string;
  };
  error?: string;
}> {
  
  

  try {
    await requireEditorOrAdmin();
    const supabase = createAdminClient();
    const found = await findBlogPostId(supabase, idOrSlug);
    if (!found.id) return { success: false, error: found.error || "Blog post not found" };

    const { data: post, error } = await supabase
      .from("blog_posts")
      .select(`
        id,
        category_id,
        status,
        featured,
        cover_media_id,
        cover_media:media_assets!cover_media_id(public_url),
        blog_post_translations (
          locale,
          slug,
          title,
          excerpt,
          body_json,
          seo_title,
          seo_description
        )
      `)
      .eq("id", found.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !post) return { success: false, error: error?.message || "Blog post not found" };

    const translations = Array.isArray(post.blog_post_translations)
      ? post.blog_post_translations
      : [];
    const viTrans = translations.find((translation) => translation.locale === "vi");
    const enTrans = translations.find((translation) => translation.locale === "en");

    const coverMediaRecord = post.cover_media as Record<string, any> | null | undefined;

    return {
      success: true,
      data: {
        id: post.id,
        slug: localizedText(viTrans?.slug, localizedText(enTrans?.slug)),
        title_vi: localizedText(viTrans?.title),
        title_en: localizedText(enTrans?.title),
        excerpt_vi: localizedText(viTrans?.excerpt),
        excerpt_en: localizedText(enTrans?.excerpt),
        body_json_vi: bodyJsonToEditorText(viTrans?.body_json),
        body_json_en: bodyJsonToEditorText(enTrans?.body_json),
        category_id: post.category_id,
        status: post.status as "draft" | "published" | "archived",
        featured: Boolean(post.featured),
        seo_title_vi: localizedText(viTrans?.seo_title),
        seo_title_en: localizedText(enTrans?.seo_title),
        seo_description_vi: localizedText(viTrans?.seo_description),
        seo_description_en: localizedText(enTrans?.seo_description),
        cover_image: coverMediaRecord?.public_url || "",
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Database error" };
  }
}

export async function createAdminBlogPost(data: BlogPostInput): Promise<{ success: boolean; id?: string; error?: string }> {
  const user = await requireEditorOrAdmin();
  const validation = blogPostSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validationMessages(validation.error.issues) };
  }

  const values = validation.data;
  
  

  const supabase = createAdminClient();
  const category = await resolveBlogCategoryId(supabase, values.category_id);
  if (!category.id) return { success: false, error: category.error };

  try {
    const coverMediaId = await getOrCreateMediaAssetId(supabase, values.cover_image, user.id);
    const initialStatus = values.status === "published" ? "draft" : values.status;
    const { data: post, error: postError } = await supabase
      .from("blog_posts")
      .insert({
        category_id: category.id,
        author_id: user.id,
        cover_media_id: coverMediaId,
        status: initialStatus,
        featured: values.featured,
        created_by: user.id,
        updated_by: user.id,
        published_at: null,
        deleted_at: initialStatus === "archived" ? new Date().toISOString() : null,
      })
      .select("id")
      .single();

    if (postError || !post) {
      return { success: false, error: postError?.message || "Failed to create blog post" };
    }

    const translations = [
      {
        post_id: post.id,
        locale: "vi",
        slug: values.slug,
        title: values.title_vi,
        excerpt: values.excerpt_vi,
        body_json: bodyJsonFromEditor(values.body_json_vi, values.title_vi),
        seo_title: values.seo_title_vi,
        seo_description: values.seo_description_vi,
      },
      {
        post_id: post.id,
        locale: "en",
        slug: values.slug,
        title: values.title_en || values.title_vi,
        excerpt: values.excerpt_en || values.excerpt_vi,
        body_json: bodyJsonFromEditor(values.body_json_en || values.body_json_vi, values.title_en || values.title_vi),
        seo_title: values.seo_title_en || values.seo_title_vi,
        seo_description: values.seo_description_en || values.seo_description_vi,
      },
    ];

    const { error: transError } = await supabase.from("blog_post_translations").insert(translations);
    if (transError) {
      await supabase.from("blog_posts").delete().eq("id", post.id);
      return { success: false, error: transError.message };
    }

    if (values.status === "published") {
      const { error: publishError } = await supabase
        .from("blog_posts")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", post.id);

      if (publishError) {
        await supabase.from("blog_posts").delete().eq("id", post.id);
        return { success: false, error: publishError.message };
      }
    }

    try {
      await writeAuditLog(supabase, {
        actorId: user.id,
        action: "create",
        entityType: "blog_post",
        entityId: post.id,
        metadata: { title: values.title_vi, slug: values.slug },
      });
    } catch (auditError) {
      await supabase.from("blog_posts").delete().eq("id", post.id);
      return { success: false, error: auditError instanceof Error ? auditError.message : "Audit logging failed" };
    }

    triggerRevalidation();
    return { success: true, id: post.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function updateAdminBlogPost(id: string, data: BlogPostInput): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();
  const validation = blogPostSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validationMessages(validation.error.issues) };
  }

  const values = validation.data;
  
  

  const supabase = createAdminClient();
  const category = await resolveBlogCategoryId(supabase, values.category_id);
  if (!category.id) return { success: false, error: category.error };

  try {
    const translations = [
      {
        post_id: id,
        locale: "vi",
        slug: values.slug,
        title: values.title_vi,
        excerpt: values.excerpt_vi,
        body_json: bodyJsonFromEditor(values.body_json_vi, values.title_vi),
        seo_title: values.seo_title_vi,
        seo_description: values.seo_description_vi,
        updated_at: new Date().toISOString(),
      },
      {
        post_id: id,
        locale: "en",
        slug: values.slug,
        title: values.title_en || values.title_vi,
        excerpt: values.excerpt_en || values.excerpt_vi,
        body_json: bodyJsonFromEditor(values.body_json_en || values.body_json_vi, values.title_en || values.title_vi),
        seo_title: values.seo_title_en || values.seo_title_vi,
        seo_description: values.seo_description_en || values.seo_description_vi,
        updated_at: new Date().toISOString(),
      },
    ];

    const { error: transError } = await supabase
      .from("blog_post_translations")
      .upsert(translations, { onConflict: "post_id,locale" });

    if (transError) return { success: false, error: transError.message };

    const coverMediaId = await getOrCreateMediaAssetId(supabase, values.cover_image, user.id);
    const { error: postError } = await supabase
      .from("blog_posts")
      .update({
        category_id: category.id,
        cover_media_id: coverMediaId,
        status: values.status,
        featured: values.featured,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
        published_at: values.status === "published" ? new Date().toISOString() : null,
        deleted_at: values.status === "archived" ? new Date().toISOString() : null,
      })
      .eq("id", id);

    if (postError) return { success: false, error: postError.message };

    await writeAuditLog(supabase, {
      actorId: user.id,
      action: values.status === "archived" ? "archive" : "update",
      entityType: "blog_post",
      entityId: id,
      metadata: { title: values.title_vi, slug: values.slug },
    });

    triggerRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function deleteAdminBlogPost(id: string): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();
  
  

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("blog_posts")
      .update({
        status: "archived",
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    await writeAuditLog(supabase, {
      actorId: user.id,
      action: "archive",
      entityType: "blog_post",
      entityId: id,
    });

    triggerRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function getAdminShowroomByIdOrCode(idOrCode: string): Promise<{
  success: boolean;
  data?: {
    id: string;
    code: string;
    name_vi: string;
    name_en: string;
    address_vi: string;
    address_en: string;
    opening_hours_vi: string;
    opening_hours_en: string;
    hotline: string;
    google_maps_embed_url: string;
    google_maps_fallback_url: string;
    latitude: number | null;
    longitude: number | null;
    status: "draft" | "published" | "archived";
    sort_order: number;
    cover_image: string;
  };
  error?: string;
}> {
  
  

  try {
    await requireEditorOrAdmin();
    const supabase = createAdminClient();
    const found = await findShowroomId(supabase, idOrCode);
    if (!found.id) return { success: false, error: found.error || "Showroom not found" };

    const { data: showroom, error } = await supabase
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
        showroom_translations (
          locale,
          name,
          address,
          opening_hours
        ),
        showroom_media (
          is_primary,
          media:media_assets (public_url)
        )
      `)
      .eq("id", found.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !showroom) return { success: false, error: error?.message || "Showroom not found" };

    const translations = Array.isArray(showroom.showroom_translations)
      ? showroom.showroom_translations
      : [];
    const viTrans = translations.find((translation) => translation.locale === "vi");
    const enTrans = translations.find((translation) => translation.locale === "en");
    const primaryMedia = Array.isArray(showroom.showroom_media)
      ? showroom.showroom_media.find((media) => media.is_primary)
      : null;
    const mediaRecord = primaryMedia?.media as Record<string, unknown> | null | undefined;

    return {
      success: true,
      data: {
        id: showroom.id,
        code: localizedText(showroom.code).toLowerCase(),
        name_vi: localizedText(viTrans?.name),
        name_en: localizedText(enTrans?.name),
        address_vi: localizedText(viTrans?.address),
        address_en: localizedText(enTrans?.address),
        opening_hours_vi: localizedText(viTrans?.opening_hours),
        opening_hours_en: localizedText(enTrans?.opening_hours),
        hotline: localizedText(showroom.hotline),
        google_maps_embed_url: localizedText(showroom.google_maps_embed_url),
        google_maps_fallback_url: localizedText(showroom.google_maps_fallback_url),
        latitude: showroom.latitude === null ? null : Number(showroom.latitude),
        longitude: showroom.longitude === null ? null : Number(showroom.longitude),
        status: showroom.status as "draft" | "published" | "archived",
        sort_order: Number(showroom.sort_order ?? 0),
        cover_image: localizedText(mediaRecord?.public_url),
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Database error" };
  }
}

export async function createAdminShowroom(data: ShowroomInput): Promise<{ success: boolean; id?: string; error?: string }> {
  const user = await requireEditorOrAdmin();
  const validation = showroomSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validationMessages(validation.error.issues) };
  }

  const values = {
    ...validation.data,
    google_maps_embed_url: DOMPurify.sanitize(validation.data.google_maps_embed_url),
  };
  
  

  const supabase = createAdminClient();

  try {
    const initialStatus = values.status === "published" ? "draft" : values.status;
    const { data: showroom, error: showroomError } = await supabase
      .from("showrooms")
      .insert({
        code: values.code,
        hotline: values.hotline,
        google_maps_embed_url: values.google_maps_embed_url,
        google_maps_fallback_url: values.google_maps_fallback_url,
        latitude: values.latitude,
        longitude: values.longitude,
        status: initialStatus,
        sort_order: values.sort_order,
        created_by: user.id,
        updated_by: user.id,
        published_at: null,
        deleted_at: initialStatus === "archived" ? new Date().toISOString() : null,
      })
      .select("id")
      .single();

    if (showroomError || !showroom) {
      return { success: false, error: showroomError?.message || "Failed to create showroom" };
    }

    // Insert cover image into showroom_media
    const coverMediaId = await getOrCreateMediaAssetId(supabase, values.cover_image, user.id);
    if (coverMediaId) {
      const { error: mediaError } = await supabase
        .from("showroom_media")
        .insert({
          showroom_id: showroom.id,
          media_id: coverMediaId,
          is_primary: true,
          sort_order: 0,
        });
      if (mediaError) {
        await supabase.from("showrooms").delete().eq("id", showroom.id);
        return { success: false, error: mediaError.message };
      }
    }

    const translations = [
      {
        showroom_id: showroom.id,
        locale: "vi",
        name: values.name_vi,
        address: values.address_vi,
        opening_hours: values.opening_hours_vi,
      },
      {
        showroom_id: showroom.id,
        locale: "en",
        name: values.name_en || values.name_vi,
        address: values.address_en || values.address_vi,
        opening_hours: values.opening_hours_en || values.opening_hours_vi,
      },
    ];

    const { error: transError } = await supabase.from("showroom_translations").insert(translations);
    if (transError) {
      await supabase.from("showrooms").delete().eq("id", showroom.id);
      return { success: false, error: transError.message };
    }

    if (values.status === "published") {
      const { error: publishError } = await supabase
        .from("showrooms")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", showroom.id);

      if (publishError) {
        await supabase.from("showrooms").delete().eq("id", showroom.id);
        return { success: false, error: publishError.message };
      }
    }

    try {
      await writeAuditLog(supabase, {
        actorId: user.id,
        action: "create",
        entityType: "showroom",
        entityId: showroom.id,
        metadata: { name: values.name_vi, code: values.code },
      });
    } catch (auditError) {
      await supabase.from("showrooms").delete().eq("id", showroom.id);
      return { success: false, error: auditError instanceof Error ? auditError.message : "Audit logging failed" };
    }

    triggerRevalidation();
    return { success: true, id: showroom.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function updateAdminShowroom(id: string, data: ShowroomInput): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();
  const validation = showroomSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validationMessages(validation.error.issues) };
  }

  const values = {
    ...validation.data,
    google_maps_embed_url: DOMPurify.sanitize(validation.data.google_maps_embed_url),
  };
  
  

  try {
    const supabase = createAdminClient();
    const translations = [
      {
        showroom_id: id,
        locale: "vi",
        name: values.name_vi,
        address: values.address_vi,
        opening_hours: values.opening_hours_vi,
        updated_at: new Date().toISOString(),
      },
      {
        showroom_id: id,
        locale: "en",
        name: values.name_en || values.name_vi,
        address: values.address_en || values.address_vi,
        opening_hours: values.opening_hours_en || values.opening_hours_vi,
        updated_at: new Date().toISOString(),
      },
    ];

    const { error: transError } = await supabase
      .from("showroom_translations")
      .upsert(translations, { onConflict: "showroom_id,locale" });

    if (transError) return { success: false, error: transError.message };

    // Sync cover image for showroom_media
    const coverMediaId = await getOrCreateMediaAssetId(supabase, values.cover_image, user.id);
    if (coverMediaId) {
      await supabase
        .from("showroom_media")
        .delete()
        .eq("showroom_id", id);

      const { error: insertMediaError } = await supabase
        .from("showroom_media")
        .insert({
          showroom_id: id,
          media_id: coverMediaId,
          is_primary: true,
          sort_order: 0,
        });
      if (insertMediaError) return { success: false, error: insertMediaError.message };
    } else {
      await supabase
        .from("showroom_media")
        .delete()
        .eq("showroom_id", id);
    }

    const { error: showroomError } = await supabase
      .from("showrooms")
      .update({
        code: values.code,
        hotline: values.hotline,
        google_maps_embed_url: values.google_maps_embed_url,
        google_maps_fallback_url: values.google_maps_fallback_url,
        latitude: values.latitude,
        longitude: values.longitude,
        status: values.status,
        sort_order: values.sort_order,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
        published_at: values.status === "published" ? new Date().toISOString() : null,
        deleted_at: values.status === "archived" ? new Date().toISOString() : null,
      })
      .eq("id", id);

    if (showroomError) return { success: false, error: showroomError.message };

    await writeAuditLog(supabase, {
      actorId: user.id,
      action: values.status === "archived" ? "archive" : "update",
      entityType: "showroom",
      entityId: id,
      metadata: { name: values.name_vi, code: values.code },
    });

    triggerRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function deleteAdminShowroom(id: string): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();
  
  

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("showrooms")
      .update({
        status: "archived",
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    await writeAuditLog(supabase, {
      actorId: user.id,
      action: "archive",
      entityType: "showroom",
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

export async function updateBlogPostFeatured(id: string, featured: boolean): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("blog_posts")
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
      entityType: "blog_post",
      entityId: id,
      metadata: { featured },
    });
    triggerRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function updateBlogPostStatus(id: string, status: string): Promise<{ success: boolean; error?: string }> {
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
      .from("blog_posts")
      .update(updateObj)
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    await writeAuditLog(supabase, {
      actorId: user.id,
      action: "update",
      entityType: "blog_post",
      entityId: id,
      metadata: { status },
    });
    triggerRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function updateQuoteAssignee(id: string, assignedTo: string | null): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("quote_requests")
      .update({
        assigned_to: assignedTo || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    await writeAuditLog(supabase, {
      actorId: user.id,
      action: "update",
      entityType: "quote",
      entityId: id,
      metadata: { assignedTo },
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function updateQuoteSalesNotes(id: string, salesNotes: string | null): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("quote_requests")
      .update({
        sales_notes: salesNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function updateQuoteAdminNotes(id: string, adminNotes: string | null): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("quote_requests")
      .update({
        admin_notes: adminNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

