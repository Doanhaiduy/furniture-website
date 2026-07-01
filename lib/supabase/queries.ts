/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from "@supabase/supabase-js";

const publicProductLookupPageSize = 100;
const maxPublicProductLookupRows = 1000;
const publicBlogLookupPageSize = 50;
const maxPublicBlogLookupRows = 500;

export function mapDBProductGroupKeyToUI(groupKey?: string | null) {
  if (groupKey === "wooden_furniture") return "wood";
  if (groupKey === "sanitary_equipment") return "sanitary";
  return groupKey || "";
}

import { imageAssets } from "../showroom-constants";

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
 * Fetch localized blog posts list using the public RPC function, with automatic mock fallback.
 */
export async function getBlogPosts(
  supabase: SupabaseClient,
  params: {
    locale?: "vi" | "en";
    categorySlug?: string;
    q?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }
) {
  const locale = params.locale || "vi";
  
  
    try {
      const { data, error } = await supabase.rpc("public_blog_posts", {
        p_locale: locale,
        p_category_slug: params.categorySlug || null,
        p_q: params.q || null,
        p_featured: params.featured !== undefined ? params.featured : null,
        p_limit: params.limit || 12,
        p_offset: params.offset || 0,
      });

      if (!error && data && data.length > 0) {
        return data;
      }
      if (error) {
        console.warn("Error fetching blog posts via RPC, falling back to mock:", error);
      }
    } catch (e) {
      console.warn("Exception fetching blog posts, falling back to mock:", e);
    }
  

  return [];
}

/**
 * Fetch localized showrooms list using the public RPC function, with automatic mock fallback.
 */
export async function getShowrooms(
  supabase: SupabaseClient,
  locale: "vi" | "en" = "vi"
) {
  
  
    try {
      const { data, error } = await supabase.rpc("public_showrooms", {
        p_locale: locale,
      });

      if (!error && data && data.length > 0) {
        return data;
      }
      if (error) {
        console.warn("Error fetching showrooms via RPC, falling back to mock:", error);
      }
    } catch (e) {
      console.warn("Exception fetching showrooms, falling back to mock:", e);
    }
  

  return [];
}

/**
 * Fetch product categories with localized names and descriptions, with automatic mock fallback.
 */
export async function getCategories(
  supabase: SupabaseClient,
  locale: "vi" | "en" = "vi"
) {
  
  
    try {
      const { data, error } = await supabase
        .from("product_categories")
        .select(`
          id,
          parent_id,
          group_key,
          sort_order,
          image_media:media_assets!fk_product_categories_image_media(public_url),
          product_category_translations!inner (
            slug,
            name,
            description,
            locale
          )
        `)
        .eq("status", "published")
        .is("deleted_at", null)
        .eq("product_category_translations.locale", locale)
        .order("sort_order");

      if (!error && data && data.length > 0) {
        return data.map((cat: any) => {
          const translation = cat.product_category_translations[0];
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

/**
 * Fetch a content page (e.g. home, about) by key and locale, with automatic mock fallback.
 */
export async function getContentPage(
  supabase: SupabaseClient,
  key: string,
  locale: "vi" | "en" = "vi"
) {
  
  
    try {
      const { data, error } = await supabase
        .from("content_pages")
        .select(`
          id,
          key,
          status,
          published_at,
          content_page_translations!inner (
            slug,
            title,
            lead,
            body_json,
            seo_title,
            seo_description,
            locale
          )
        `)
        .eq("key", key)
        .eq("status", "published")
        .is("deleted_at", null)
        .eq("content_page_translations.locale", locale)
        .maybeSingle();

      if (!error && data) {
        const translation = data.content_page_translations[0];
        return {
          id: data.id,
          key: data.key,
          title: translation?.title || "",
          lead: translation?.lead || "",
          bodyJson: translation?.body_json || {},
          seoTitle: translation?.seo_title || "",
          seoDescription: translation?.seo_description || "",
        };
      }
      if (error) {
        console.warn("Error fetching content page, falling back to mock:", error);
      }
    } catch (e) {
      console.warn("Exception fetching content page, falling back to mock:", e);
    }
  

  return null;
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

    return {
      id: row.id,
      referenceCode: row.reference_code,
      slug: currentTranslation?.slug || slug,
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
 * Fetch a single blog post by slug and locale.
 */
export async function getBlogBySlug(
  supabase: SupabaseClient,
  slug: string,
  locale: "vi" | "en" = "vi"
) {
  let offset = 0;
  let post: any = null;

  while (offset < maxPublicBlogLookupRows) {
    const rows = await getBlogPosts(supabase, {
      locale,
      limit: publicBlogLookupPageSize,
      offset,
    });

    post = rows.find((row: any) => row.slug === slug) || null;
    if (post || rows.length < publicBlogLookupPageSize) break;

    offset += publicBlogLookupPageSize;
  }

  if (!post) {
    const { data: transList } = await supabase
      .from("blog_post_translations")
      .select("post_id")
      .eq("slug", slug)
      .limit(1);

    const transData = transList && transList.length > 0 ? transList[0] : null;

    if (transData?.post_id) {
      offset = 0;
      while (offset < maxPublicBlogLookupRows) {
        const rows = await getBlogPosts(supabase, {
          locale,
          limit: publicBlogLookupPageSize,
          offset,
        });

        post = rows.find((row: any) => row.id === transData.post_id) || null;
        if (post || rows.length < publicBlogLookupPageSize) break;

        offset += publicBlogLookupPageSize;
      }
    }
  }

  if (!post) return null;

  return {
    id: post.id,
    slug: post.slug || "",
    title: post.title || "",
    excerpt: post.excerpt || "",
    bodyJson: post.body_json || {},
    seoTitle: post.seo_title || "",
    seoDescription: post.seo_description || "",
    category: {
      id: post.category_id,
      slug: post.category_slug || "",
      name: post.category_name || "",
    },
    authorName: post.author_name || "",
    featured: post.featured,
    publishedAt: post.published_at,
    coverMedia: post.cover_media || null,
  };
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
    slug: dbProduct.slug,
    referenceCode,
    categoryKey,
    materialKey: dbProduct.material_key || dbProduct.materialKey || findAttrValue("material") || (typeof dbProduct.material === "object" ? dbProduct.material.en : dbProduct.material || ""),
    roomKey: dbProduct.room_key || dbProduct.roomKey || findAttrValue("room") || "",
    styleKey: dbProduct.style_key || dbProduct.styleKey || findAttrValue("style") || "",
    collectionKey: dbProduct.collection_key || dbProduct.collectionKey || findAttrValue("collection") || "",
    toneKey: dbProduct.tone_key || dbProduct.toneKey || findAttrValue("tone") || "",
    availabilityKey: dbProduct.availability_key || dbProduct.availabilityKey || findAttrValue("availability") || "",
    brand_id: dbProduct.brand_id || dbProduct.brandId || null,
    brand_name: dbProduct.brand_name || dbProduct.brandName || null,
    status: "published" as const,
    featured: dbProduct.featured || false,
    image: primaryMedia?.url || media[0]?.url || "/placeholder.jpg",
    gallery: media.map((item: any) => item.url).filter(Boolean),
    price: displayPrice,
    oldPrice,
    discountPercentage,
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

export interface PublicSiteSettings {
  brandName: string;
  logoUrl: string;
  faviconUrl: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  seoDefaultTitle: string;
  seoDefaultDescription: string;
}

/**
 * Fetches dynamic site settings from site_settings and site_setting_translations,
 * with fallback to mock defaults if not found.
 */
export async function getPublicSiteSettings(
  supabase: SupabaseClient,
  locale: "vi" | "en" = "vi"
): Promise<PublicSiteSettings> {
  
  const defaults: PublicSiteSettings = {
    brandName: locale === "vi" ? "SHOWROOM NỘI THẤT PHƯƠNG ĐÔNG" : "PHUONG DONG INTERIOR SHOWROOM",
    logoUrl: "/logo-final.svg",
    faviconUrl: "/favicon.ico",
    contactPhone: "08172 357 587",
    contactEmail: "contact@phuongdong.vn",
    contactAddress: locale === "vi"
      ? "124 Nguyễn Thị Thập, Quận 7, TP. Hồ Chí Minh"
      : "124 Nguyen Thi Thap, District 7, Ho Chi Minh City",
    seoDefaultTitle: locale === "vi"
      ? "Đồ Gỗ Nội Thất & Thiết Bị Vệ Sinh Phương Đông"
      : "Phuong Dong - Premium Furniture & Sanitary Ware",
    seoDefaultDescription: locale === "vi"
      ? "Showroom Phương Đông chuyên cung cấp đồ gỗ nội thất tự nhiên cao cấp và thiết bị vệ sinh nhập khẩu chính hãng."
      : "Phuong Dong Showroom specializes in premium solid natural wood furniture and genuine imported sanitary ware.",
  };

  

  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select(`
        id,
        contact_phone,
        contact_email,
        logo_media:media_assets!logo_media_id(public_url),
        favicon_media:media_assets!favicon_media_id(public_url),
        site_setting_translations!inner (
          locale,
          brand_name,
          contact_address,
          seo_default_title,
          seo_default_description
        )
      `)
      .eq("singleton_key", "default")
      .eq("site_setting_translations.locale", locale)
      .maybeSingle();

    if (error || !data) {
      if (error) {
        console.warn("Error fetching site settings from DB, using defaults:", error);
      }
      return defaults;
    }

    const translation = data.site_setting_translations?.[0] || {};
    return {
      brandName: translation.brand_name || defaults.brandName,
      logoUrl: (data.logo_media as any)?.public_url || defaults.logoUrl,
      faviconUrl: (data.favicon_media as any)?.public_url || defaults.faviconUrl,
      contactPhone: data.contact_phone || defaults.contactPhone,
      contactEmail: data.contact_email || defaults.contactEmail,
      contactAddress: translation.contact_address || defaults.contactAddress,
      seoDefaultTitle: translation.seo_default_title || defaults.seoDefaultTitle,
      seoDefaultDescription: translation.seo_default_description || defaults.seoDefaultDescription,
    };
  } catch (e) {
    console.warn("Exception fetching site settings, using defaults:", e);
    return defaults;
  }
}

export interface PublicSocialLink {
  platform: string;
  label: string;
  url: string;
  isEnabled: boolean;
}

/**
 * Fetches enabled social links from DB, with fallback to defaults.
 */
export async function getPublicSocialLinks(
  supabase: SupabaseClient
): Promise<PublicSocialLink[]> {
  
  const defaults: PublicSocialLink[] = [
    { platform: "facebook", label: "Facebook", url: "https://facebook.com", isEnabled: true },
    { platform: "instagram", label: "Instagram", url: "https://instagram.com", isEnabled: true },
    { platform: "zalo", label: "Zalo", url: "https://zalo.me", isEnabled: true },
  ];

  

  try {
    const { data, error } = await supabase
      .from("social_links")
      .select("platform, label, url, is_enabled, sort_order")
      .eq("is_enabled", true)
      .order("sort_order");

    if (error || !data) {
      if (error) {
        console.warn("Error fetching social links from DB, using defaults:", error);
      }
      return defaults;
    }

    return data.map((d: any) => ({
      platform: d.platform,
      label: d.label || d.platform,
      url: d.url,
      isEnabled: d.is_enabled,
    }));
  } catch (e) {
    console.warn("Exception fetching social links, using defaults:", e);
    return defaults;
  }
}


