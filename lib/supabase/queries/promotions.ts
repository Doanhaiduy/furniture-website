/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Fetch localized promotions list using public promotions RPC, with automatic mock fallback.
 */
export async function getPromotions(
  supabase: SupabaseClient,
  locale: "vi" | "en" = "vi"
) {
  try {
    const { data, error } = await supabase.rpc("public_promotions", {
      p_locale: locale,
    });

    if (!error && data && data.length > 0) {
      return data.map((d: any) => {
        const meta = d.metadata_jsonb || {};
        const rawTagVi = meta.tag_vi || "";
        const rawTagEn = meta.tag_en || "";
        // Override legacy "Combo" or "Package" tags to individual-purchase friendly labels
        const tagVi = rawTagVi.toLowerCase().includes("combo") || rawTagVi.toLowerCase().includes("package")
          ? "Chương Trình Ưu Đãi"
          : rawTagVi || "Khuyến mãi";
        const tagEn = rawTagEn.toLowerCase().includes("combo") || rawTagEn.toLowerCase().includes("package")
          ? "Special Offer"
          : rawTagEn || "Promotion";
        return {
          id: d.id,
          code: d.code,
          discount_percentage: d.discount_percentage || d.discountPercentage || 0,
          startAt: d.start_at,
          endAt: d.end_at,
          title: d.title,
          description: d.description,
          comboPrice: d.combo_price,
          originalPrice: d.original_price,
          coverImageUrl: d.cover_image_url,
          tag: locale === "vi" ? tagVi : tagEn,
          items: locale === "vi" ? (meta.items_vi || []) : (meta.items_en || []),
          color: meta.color || "from-amber-500/20 to-orange-500/5",
          badgeColor: meta.badgeColor || "bg-amber-500 text-black",
          period: locale === "vi" ? (meta.period_vi || "Hạn chót: 30/06/2026") : (meta.period_en || "Until June 30, 2026")
        };
      });
    }
    if (error) {
      console.warn("Error fetching promotions via RPC, falling back to mock:", error);
    }
  } catch (e) {
    console.warn("Exception fetching promotions, falling back to mock:", e);
  }

  return [];
}
