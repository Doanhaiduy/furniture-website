/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient, createAdminClient } from "../server";
import { requireEditorOrAdmin } from "../auth";
import { writeAuditLog } from "../audit";
import { type CategoryInput } from "../../validations/admin";
import { triggerRevalidation, getOrCreateMediaAssetId } from "./helpers";

function mapGroupKeyToDb(groupKey: string | null | undefined): any {
  if (groupKey === "wood") return "wooden_furniture";
  if (groupKey === "sanitary") return "sanitary_equipment";
  return groupKey || null;
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

    // Check if there are active subcategories
    const { data: subcats } = await supabase
      .from("product_categories")
      .select("id")
      .eq("parent_id", id)
      .is("deleted_at", null);
      
    if (subcats && subcats.length > 0) {
      return { success: false, error: "Không thể xóa nhóm danh mục đang chứa danh mục bên trong." };
    }

    // Check if there are active products
    const { data: prods } = await supabase
      .from("products")
      .select("id")
      .eq("category_id", id)
      .is("deleted_at", null);
      
    if (prods && prods.length > 0) {
      return { success: false, error: "Không thể xóa danh mục đang chứa sản phẩm." };
    }
    
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
