/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from "@supabase/supabase-js";

export const publicProductLookupPageSize = 100;
export const maxPublicProductLookupRows = 1000;

export function mapDBProductGroupKeyToUI(groupKey?: string | null) {
  if (groupKey === "wooden_furniture") return "wood";
  if (groupKey === "sanitary_equipment") return "sanitary";
  return groupKey || "";
}

/**
 * Fetch localized products list using the public RPC function, with automatic mock fallback.
 */
export async function getProducts(
  supabase: SupabaseClient,
  params: {
    locale?: "vi" | "en";
    categorySlug?: string;
    groupKey?: string;
    q?: string;
    priceMin?: number;
    priceMax?: number;
    attributeFilters?: Record<string, string | string[]>;
    featured?: boolean;
    limit?: number;
    offset?: number;
    brandId?: string;
    brandSlug?: string;
    hasDiscount?: boolean;
  }
) {
  const locale = params.locale || "vi";
  
  try {
    let resolvedBrandSlug = params.brandSlug || null;
    if (params.brandId && params.brandId !== "all" && !resolvedBrandSlug) {
      const { data: brandData } = await supabase
        .from("brands")
        .select("slug")
        .eq("id", params.brandId)
        .maybeSingle();
      if (brandData?.slug) {
        resolvedBrandSlug = brandData.slug;
      }
    }

    const { data, error } = await supabase.rpc("public_products", {
      p_locale: locale,
      p_category_slug: params.categorySlug || null,
      p_group_key: params.groupKey || null,
      p_q: params.q || null,
      p_price_min: params.priceMin || null,
      p_price_max: params.priceMax || null,
      p_attribute_filters: params.attributeFilters || {},
      p_featured: params.featured !== undefined ? params.featured : null,
      p_limit: params.limit || 24,
      p_offset: params.offset || 0,
      p_brand_slug: resolvedBrandSlug,
      p_has_discount: params.hasDiscount !== undefined ? params.hasDiscount : null,
    });

    if (!error && data && data.length > 0) {
      let results = data;
      if (resolvedBrandSlug) {
        results = results.filter((p: any) => p.brand_slug === resolvedBrandSlug || p.brandSlug === resolvedBrandSlug);
      }
      return results;
    }
    if (error) {
      console.error("[ERROR getProducts RPC]", error);
    }
  } catch (e) {
    console.error("[ERROR getProducts Exception]", e);
  }

  return [];
}

/**
 * Fetch a single product by slug and locale with complete media and attributes.
 */
export async function getProductBySlug(
  supabase: SupabaseClient,
  slug: string,
  locale: "vi" | "en" = "vi"
) {
  try {
    // 1. Tìm product_id bằng slug từ bảng product_translations
    const { data: transList, error: transError } = await supabase
      .from("product_translations")
      .select("product_id")
      .eq("slug", slug)
      .limit(1);

    if (transError) {
      console.error("Error finding product by slug translation:", transError);
    }
    
    let productId = transList && transList.length > 0 ? transList[0].product_id : null;

    // Nếu không tìm thấy, thử tìm theo id trực tiếp (đề phòng slug chính là UUID)
    if (!productId && slug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      productId = slug;
    }

    if (!productId) return null;

    // 2. Query trực tiếp bảng products để có dữ liệu đầy đủ nhất
    const { data: row, error: rowError } = await supabase
      .from("products")
      .select(`
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
        tags,
        specifications,
        custom_attributes,
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
          status,
          deleted_at,
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
        ),
        product_translations (
          locale,
          slug,
          name,
          summary,
          description_json,
          material,
          price_display_text,
          dimension_display_text
        )
      `)
      .eq("id", productId)
      .is("deleted_at", null)
      .maybeSingle();

    if (rowError || !row) {
      console.error("Error fetching product details directly:", rowError);
      return null;
    }

    // 3. Chuẩn hóa dữ liệu sang dạng phẳng tương thích với mapDBProductToPublicProduct
    const category = (Array.isArray(row.product_categories) ? row.product_categories[0] : row.product_categories) || {};

    // S3: hide the product detail page when its category is archived/unpublished or
    // deleted, consistent with the public list/search/filter (public_products RPC).
    if ((category as any).deleted_at || (category as any).status !== "published") {
      return null;
    }
    const categoryTranslation = (category as any).product_category_translations?.find((t: any) => t.locale === locale) || (category as any).product_category_translations?.[0];
    
    const brand = (Array.isArray(row.brands) ? row.brands[0] : row.brands) || {};
    const brandTranslation = (brand as any).brand_translations?.find((t: any) => t.locale === locale) || (brand as any).brand_translations?.[0];

    const currentTranslation = row.product_translations?.find((t: any) => t.locale === locale) || row.product_translations?.[0];
    const viTranslation = row.product_translations?.find((t: any) => t.locale === "vi");
    const enTranslation = row.product_translations?.find((t: any) => t.locale === "en");

    const getMediaUrl = (mediaField: any) => {
      if (!mediaField) return "";
      const singleMedia = Array.isArray(mediaField) ? mediaField[0] : mediaField;
      return (singleMedia as any)?.public_url || "";
    };

    const primaryMediaObj = row.product_media?.find((m: any) => m.is_primary);
    const primaryMedia = primaryMediaObj 
      ? { url: getMediaUrl(primaryMediaObj.media) } 
      : (row.product_media?.[0] ? { url: getMediaUrl(row.product_media[0].media) } : null);

    const media = Array.isArray(row.product_media)
      ? row.product_media.map((m: any) => ({
          url: getMediaUrl(m.media),
          isPrimary: m.is_primary || false,
        }))
      : [];

    // Canonical slug: prefer vi translation slug (unified slug strategy), fallback to current locale, then raw param
    const viSlug = viTranslation?.slug || "";
    const canonicalSlug = viSlug || currentTranslation?.slug || slug;

    return {
      id: row.id,
      referenceCode: row.reference_code,
      slug: canonicalSlug,
      name: { vi: viTranslation?.name || "", en: enTranslation?.name || "" },
      summary: { vi: viTranslation?.summary || "", en: enTranslation?.summary || "" },
      descriptionJson: currentTranslation?.description_json || {},
      material: {
        vi: viTranslation?.material || "",
        en: enTranslation?.material || "",
      },
      priceDisplayText: {
        vi: viTranslation?.price_display_text || "",
        en: enTranslation?.price_display_text || "",
      },
      dimensionDisplayText: {
        vi: viTranslation?.dimension_display_text || "",
        en: enTranslation?.dimension_display_text || "",
      },
      category: {
        id: category.id || "",
        groupKey: category.group_key || "",
        slug: categoryTranslation?.slug || "",
        name: categoryTranslation?.name || "",
      },
      priceMin: row.price_min,
      priceMax: row.price_max,
      currency: row.currency,
      width: row.width,
      depth: row.depth,
      height: row.height,
      dimensionUnit: row.dimension_unit,
      brandId: row.brand_id,
      brandName: brandTranslation?.name || (brand as any).name || "",
      brandSeries: row.brand_series,
      featured: row.featured,
      publishedAt: row.published_at,
      primaryMedia: primaryMedia,
      media,
      attributes: [],
      specs: [],
      specifications: row.specifications || {},
      custom_attributes: row.custom_attributes || [],
      tags: Array.isArray(row.tags) ? row.tags : [],
      promo_price_min: null as number | null,
      promo_price_max: null as number | null,
    };
  } catch (e) {
    console.error("Exception in getProductBySlug directly:", e);
  }
  return null;
}

/**
 * Maps a database product object to the mock Product shape used by the UI (ProductCard).
 */
export function mapDBProductToMock(dbProduct: any, locale: "vi" | "en") {
  return mapDBProductToPublicProduct(dbProduct, locale);
}

export function mapDBProductToPublicProduct(dbProduct: any, locale: "vi" | "en") {
  const referenceCode = dbProduct.reference_code || dbProduct.referenceCode || "";
  const category = dbProduct.category || {};
  const categoryName = dbProduct.category_name || category.name || "";
  const categoryKey = dbProduct.category_slug || category.slug || mapDBProductGroupKeyToUI(dbProduct.group_key || category.group_key || dbProduct.groupKey || category.groupKey) || "";
  const priceDisplayText = dbProduct.price_display_text || dbProduct.priceDisplayText || "";
  const dimensionDisplayText = dbProduct.dimension_display_text || dbProduct.dimensionDisplayText || "";
  const primaryMedia = dbProduct.primary_media || dbProduct.primaryMedia || null;
  const media = Array.isArray(dbProduct.media) ? dbProduct.media : [];
  const attributes = Array.isArray(dbProduct.attributes) ? dbProduct.attributes : [];
  const specs: any[] = [];

  const matVi = typeof dbProduct.material === "object" && dbProduct.material 
    ? dbProduct.material.vi 
    : dbProduct.material_vi || dbProduct.material || "";
  const matEn = typeof dbProduct.material === "object" && dbProduct.material 
    ? dbProduct.material.en 
    : dbProduct.material_en || dbProduct.material || "";

  if (matVi || matEn) {
    specs.push({
      label: { vi: "Chất liệu", en: "Material" },
      value: { vi: matVi, en: matEn },
    });
  }

  if (dimensionDisplayText) {
    const dimVi = typeof dimensionDisplayText === "object" ? (dimensionDisplayText as any).vi : dimensionDisplayText;
    const dimEn = typeof dimensionDisplayText === "object" ? (dimensionDisplayText as any).en : dimensionDisplayText;
    specs.push({
      label: { vi: "Kích thước", en: "Dimensions" },
      value: { vi: dimVi, en: dimEn },
    });
  }

  const specifications = dbProduct.specifications || {};
  if (specifications.finish_vi || specifications.finish_en) {
    specs.push({
      label: { vi: "Hoàn thiện", en: "Finish" },
      value: { vi: specifications.finish_vi || "", en: specifications.finish_en || "" },
    });
  }
  if (specifications.care_vi || specifications.care_en) {
    specs.push({
      label: { vi: "Bảo quản", en: "Care" },
      value: { vi: specifications.care_vi || "", en: specifications.care_en || "" },
    });
  }

  const customAttrs = dbProduct.custom_attributes || [];
  if (Array.isArray(customAttrs) && customAttrs.length > 0) {
    customAttrs.forEach((attr: any) => {
      if (attr.name_vi || attr.name_en) {
        specs.push({
          label: { vi: attr.name_vi || attr.name_en || "", en: attr.name_en || attr.name_vi || "" },
          value: { vi: attr.value_vi || attr.value_en || "", en: attr.value_en || attr.value_vi || "" },
        });
      } else if (attr.name || attr.label) {
        specs.push({
          label: { vi: attr.name || attr.label || "", en: attr.name || attr.label || "" },
          value: { vi: attr.value || "", en: attr.value || "" },
        });
      }
    });
  } else if (Array.isArray(dbProduct.specs)) {
    dbProduct.specs.forEach((spec: any) => {
      specs.push({
        label: { vi: spec.label?.vi || spec.label, en: spec.label?.en || spec.label },
        value: { vi: spec.value?.vi || spec.value, en: spec.value?.en || spec.value },
      });
    });
  } else {
    attributes.forEach((attr: any) => {
      const value =
        attr.valueText ||
        attr.value_text ||
        attr.optionLabel ||
        attr.option_label ||
        attr.valueNumber?.toString() ||
        attr.value_number?.toString() ||
        (attr.valueBoolean || attr.value_boolean ? "Yes" : "");

      if (!value) return;

      specs.push({
        label: { vi: attr.label || attr.key || "", en: attr.label || attr.key || "" },
        value: { vi: value, en: value },
      });
    });
  }

  const nameVi = typeof dbProduct.name === "object" && dbProduct.name ? dbProduct.name.vi : dbProduct.name || "";
  const nameEn = typeof dbProduct.name === "object" && dbProduct.name ? dbProduct.name.en : dbProduct.name || "";
  const categoryNameVi = typeof categoryName === "object" && categoryName ? (categoryName as any).vi : categoryName || "";
  const categoryNameEn = typeof categoryName === "object" && categoryName ? (categoryName as any).en : categoryName || "";
  const summaryVi = typeof dbProduct.summary === "object" && dbProduct.summary ? dbProduct.summary.vi : dbProduct.summary || "";
  const summaryEn = typeof dbProduct.summary === "object" && dbProduct.summary ? dbProduct.summary.en : dbProduct.summary || "";

  let descVi = "";
  if (dbProduct.description && typeof dbProduct.description === "object" && dbProduct.description.vi) {
    descVi = dbProduct.description.vi;
  } else {
    const rawDesc = dbProduct.description_json || dbProduct.descriptionJson || {};
    descVi = typeof rawDesc === "object" ? (rawDesc.vi || rawDesc.en || "") : (typeof rawDesc === "string" ? rawDesc : "");
    if (!descVi) descVi = summaryVi || "";
  }

  let descEn = "";
  if (dbProduct.description && typeof dbProduct.description === "object" && dbProduct.description.en) {
    descEn = dbProduct.description.en;
  } else {
    const rawDesc = dbProduct.description_json || dbProduct.descriptionJson || {};
    descEn = typeof rawDesc === "object" ? (rawDesc.en || rawDesc.vi || "") : (typeof rawDesc === "string" ? rawDesc : "");
    if (!descEn) descEn = summaryEn || "";
  }

  const priceVi = typeof priceDisplayText === "object" ? (priceDisplayText as any).vi : priceDisplayText || "Liên hệ báo giá";
  const priceEn = typeof priceDisplayText === "object" ? (priceDisplayText as any).en : priceDisplayText || "Contact for quote";

  const findAttrValue = (key: string) => {
    return attributes.find((a: any) => a.key === key)?.value || "";
  };

  // ---- Discount / promo pricing ----
  const priceMin = dbProduct.price_min ?? dbProduct.priceMin ?? null;
  const promoPriceMin = dbProduct.promo_price_min ?? dbProduct.promoPriceMin ?? null;
  const promoPriceMax = dbProduct.promo_price_max ?? dbProduct.promoPriceMax ?? null;

  let discountPercentage: number | null = null;
  let displayPrice = { vi: priceVi, en: priceEn };
  let oldPrice: { vi: string; en: string } | null = null;

  if (promoPriceMin !== null && priceMin !== null && Number(promoPriceMin) < Number(priceMin)) {
    discountPercentage = Math.round((1 - Number(promoPriceMin) / Number(priceMin)) * 100);
    const formattedPromo = Number(promoPriceMin).toLocaleString("vi-VN") + " VND";
    displayPrice = { vi: formattedPromo, en: formattedPromo };
    oldPrice = { vi: priceVi, en: priceEn };
  }

  return {
    slug: dbProduct.slug || dbProduct.slug_vi || dbProduct.slug_en || "",
    referenceCode,
    categoryKey,
    materialKey: dbProduct.material_key || dbProduct.materialKey || findAttrValue("material") || (typeof dbProduct.material === "object" ? dbProduct.material.en : dbProduct.material || ""),
    roomKey: dbProduct.room_key || dbProduct.roomKey || findAttrValue("room") || "",
    styleKey: dbProduct.style_key || dbProduct.styleKey || findAttrValue("style") || "",
    collectionKey: dbProduct.collection_key || dbProduct.collectionKey || findAttrValue("collection") || "",
    toneKey: dbProduct.tone_key || dbProduct.toneKey || findAttrValue("tone") || "",
    availabilityKey: dbProduct.availability_key || dbProduct.availabilityKey || findAttrValue("availability") || "",
    showroomCode: dbProduct.showroom_code || dbProduct.showroomCode || null,
    priceUnit: dbProduct.price_unit || dbProduct.priceUnit || null,
    brand_id: dbProduct.brand_id || dbProduct.brandId || null,
    brand_name: dbProduct.brand_name || dbProduct.brandName || null,
    status: "published" as const,
    featured: dbProduct.featured || false,
    image: primaryMedia?.url || media[0]?.url || "/placeholder.jpg",
    gallery: media.map((item: any) => item.url).filter(Boolean),
    price: displayPrice,
    oldPrice,
    discountPercentage,
    // Numeric fields used for sorting (price / newest); not rendered directly.
    priceValue: promoPriceMin !== null ? Number(promoPriceMin) : priceMin !== null ? Number(priceMin) : null,
    publishedAt: dbProduct.published_at || dbProduct.publishedAt || null,
    name: { vi: nameVi, en: nameEn },
    category: { vi: categoryNameVi, en: categoryNameEn },
    summary: { vi: summaryVi, en: summaryEn },
    description: { vi: descVi, en: descEn },
    specs,
    tags: Array.isArray(dbProduct.tags) ? dbProduct.tags : [],
    promotionId: dbProduct.promotion_id || dbProduct.promotionId || null,
    promoPriceMin,
    promoPriceMax,
    material: { vi: matVi, en: matEn },
    specifications,
    custom_attributes: customAttrs,
  };
}
