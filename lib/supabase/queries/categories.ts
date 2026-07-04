/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from "@supabase/supabase-js";
import { imageAssets } from "../../showroom-constants";

/**
 * Fetch product categories with localized names and descriptions, with automatic mock fallback.
 */
export async function getCategories(
  supabase: SupabaseClient,
  locale: "vi" | "en" = "vi"
) {
  try {
    // BUG 2 — locale fallback: fetch ALL translations (no `!inner` + locale filter)
    // so a category with only a Vietnamese translation is not dropped when browsing
    // in English. The requested locale is then preferred in JS, falling back to vi,
    // then to any available translation.
    const { data, error } = await supabase
      .from("product_categories")
      .select(`
        id,
        parent_id,
        group_key,
        sort_order,
        image_media:media_assets!fk_product_categories_image_media(public_url),
        product_category_translations (
          slug,
          name,
          description,
          locale
        )
      `)
      .eq("status", "published")
      .is("deleted_at", null)
      .order("sort_order");

    if (!error && data && data.length > 0) {
      return data
        // Drop malformed categories that have no translation row at all.
        .filter((cat: any) => Array.isArray(cat.product_category_translations) && cat.product_category_translations.length > 0)
        .map((cat: any) => {
        const translations = cat.product_category_translations;
        const translation =
          translations.find((t: any) => t.locale === locale) ||
          translations.find((t: any) => t.locale === "vi") ||
          translations[0];
        const groupKey = cat.group_key;
        let fallbackImage = imageAssets.showroom;
        if (groupKey === "wooden_furniture" || groupKey === "wood") fallbackImage = imageAssets.woodWall;
        else if (groupKey === "sanitary_equipment" || groupKey === "sanitary") fallbackImage = imageAssets.room;
        else if (groupKey === "tiles") fallbackImage = imageAssets.texture;

        return {
          id: cat.id,
          parentId: cat.parent_id,
          groupKey: cat.group_key,
          sortOrder: cat.sort_order,
          slug: translation?.slug || "",
          name: translation?.name || "",
          description: translation?.description || "",
          image: cat.image_media?.public_url || fallbackImage,
        };
      });
    }
    if (error) {
      console.warn("Error fetching categories from DB, falling back to mock:", error);
    }
  } catch (e) {
    console.warn("Exception fetching categories, falling back to mock:", e);
  }

  return [];
}
