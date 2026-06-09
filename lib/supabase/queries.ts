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

/**
 * Fetch localized products list using the public RPC function.
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
    featured?: boolean;
    limit?: number;
    offset?: number;
  }
) {
  const { data, error } = await supabase.rpc("public_products", {
    p_locale: params.locale || "vi",
    p_category_slug: params.categorySlug || null,
    p_group_key: params.groupKey || null,
    p_q: params.q || null,
    p_price_min: params.priceMin || null,
    p_price_max: params.priceMax || null,
    p_featured: params.featured !== undefined ? params.featured : null,
    p_limit: params.limit || 24,
    p_offset: params.offset || 0,
  });

  if (error) {
    console.error("Error fetching products via RPC:", error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch localized blog posts list using the public RPC function.
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
  const { data, error } = await supabase.rpc("public_blog_posts", {
    p_locale: params.locale || "vi",
    p_category_slug: params.categorySlug || null,
    p_q: params.q || null,
    p_featured: params.featured !== undefined ? params.featured : null,
    p_limit: params.limit || 12,
    p_offset: params.offset || 0,
  });

  if (error) {
    console.error("Error fetching blog posts via RPC:", error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch localized showrooms list using the public RPC function.
 */
export async function getShowrooms(
  supabase: SupabaseClient,
  locale: "vi" | "en" = "vi"
) {
  const { data, error } = await supabase.rpc("public_showrooms", {
    p_locale: locale,
  });

  if (error) {
    console.error("Error fetching showrooms via RPC:", error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch product categories with localized names and descriptions.
 */
export async function getCategories(
  supabase: SupabaseClient,
  locale: "vi" | "en" = "vi"
) {
  const { data, error } = await supabase
    .from("product_categories")
    .select(`
      id,
      parent_id,
      group_key,
      sort_order,
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

  if (error) {
    console.error("Error fetching product categories:", error);
    throw error;
  }

  return (
    data?.map((cat: any) => {
      const translation = cat.product_category_translations[0];
      return {
        id: cat.id,
        parentId: cat.parent_id,
        groupKey: cat.group_key,
        sortOrder: cat.sort_order,
        slug: translation?.slug || "",
        name: translation?.name || "",
        description: translation?.description || "",
      };
    }) || []
  );
}

/**
 * Fetch a single product by slug and locale with complete media and attributes.
 */
export async function getProductBySlug(
  supabase: SupabaseClient,
  slug: string,
  locale: "vi" | "en" = "vi"
) {
  let offset = 0;
  let product: any = null;

  while (offset < maxPublicProductLookupRows) {
    const rows = await getProducts(supabase, {
      locale,
      limit: publicProductLookupPageSize,
      offset,
    });

    product = rows.find((row: any) => row.slug === slug) || null;
    if (product || rows.length < publicProductLookupPageSize) break;

    offset += publicProductLookupPageSize;
  }

  if (!product) return null;

  return {
    id: product.id,
    referenceCode: product.reference_code,
    slug: product.slug || "",
    name: product.name || "",
    summary: product.summary || "",
    descriptionJson: product.description_json || {},
    material: product.material || "",
    priceDisplayText: product.price_display_text || "",
    dimensionDisplayText: product.dimension_display_text || "",
    category: {
      id: product.category_id,
      groupKey: product.group_key,
      slug: product.category_slug || "",
      name: product.category_name || "",
    },
    priceMin: product.price_min,
    priceMax: product.price_max,
    currency: product.currency,
    width: product.width,
    depth: product.depth,
    height: product.height,
    dimensionUnit: product.dimension_unit,
    brandSeries: product.brand_series,
    featured: product.featured,
    publishedAt: product.published_at,
    primaryMedia: product.primary_media || null,
    media: Array.isArray(product.media) ? product.media : [],
    attributes: Array.isArray(product.attributes) ? product.attributes : [],
  };
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
 * Fetch a content page (e.g. home, about) by key and locale.
 */
export async function getContentPage(
  supabase: SupabaseClient,
  key: string,
  locale: "vi" | "en" = "vi"
) {
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

  if (error) {
    console.error("Error fetching content page:", error);
    throw error;
  }

  if (!data) return null;

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

/**
 * Maps a database product object to the mock Product shape used by the UI (ProductCard).
 */
export function mapDBProductToMock(dbProduct: any, locale: "vi" | "en") {
  const specs: any[] = [];
  if (dbProduct.material) {
    specs.push({
      label: { vi: "Chất liệu", en: "Material" },
      value: { vi: dbProduct.material, en: dbProduct.material },
    });
  }
  if (dbProduct.dimension_display_text) {
    specs.push({
      label: { vi: "Kích thước", en: "Dimensions" },
      value: { vi: dbProduct.dimension_display_text, en: dbProduct.dimension_display_text },
    });
  }
  
  if (Array.isArray(dbProduct.attributes)) {
    dbProduct.attributes.forEach((attr: any) => {
      const val = attr.valueText || attr.valueNumber?.toString() || (attr.valueBoolean ? "Yes" : "No");
      specs.push({
        label: { vi: attr.label, en: attr.label },
        value: { vi: val, en: val },
      });
    });
  }

  return {
    slug: dbProduct.slug,
    referenceCode: dbProduct.reference_code || "",
    categoryKey: dbProduct.group_key || "",
    materialKey: dbProduct.material || "",
    roomKey: "",
    styleKey: "",
    collectionKey: "",
    toneKey: "",
    availabilityKey: "",
    status: "published" as const,
    featured: dbProduct.featured || false,
    image: dbProduct.primary_media?.url || dbProduct.media?.[0]?.url || "/placeholder.jpg",
    gallery: dbProduct.media?.map((m: any) => m.url) || [],
    price: { 
      vi: dbProduct.price_display_text || "Liên hệ báo giá", 
      en: dbProduct.price_display_text || "Contact for quote" 
    },
    name: { vi: dbProduct.name || "", en: dbProduct.name || "" },
    category: { vi: dbProduct.category_name || "", en: dbProduct.category_name || "" },
    summary: { vi: dbProduct.summary || "", en: dbProduct.summary || "" },
    description: { vi: dbProduct.summary || "", en: dbProduct.summary || "" },
    specs: specs,
    tags: [],
  };
}

export function mapDBProductToPublicProduct(dbProduct: any, locale: "vi" | "en") {
  const referenceCode = dbProduct.reference_code || dbProduct.referenceCode || "";
  const category = dbProduct.category || {};
  const categoryName = dbProduct.category_name || category.name || "";
  const categoryKey = mapDBProductGroupKeyToUI(dbProduct.group_key || category.groupKey);
  const priceDisplayText = dbProduct.price_display_text || dbProduct.priceDisplayText || "";
  const dimensionDisplayText = dbProduct.dimension_display_text || dbProduct.dimensionDisplayText || "";
  const primaryMedia = dbProduct.primary_media || dbProduct.primaryMedia || null;
  const media = Array.isArray(dbProduct.media) ? dbProduct.media : [];
  const attributes = Array.isArray(dbProduct.attributes) ? dbProduct.attributes : [];
  const specs: any[] = [];

  if (dbProduct.material) {
    specs.push({
      label: { vi: "Chat lieu", en: "Material" },
      value: { vi: dbProduct.material, en: dbProduct.material },
    });
  }

  if (dimensionDisplayText) {
    specs.push({
      label: { vi: "Kich thuoc", en: "Dimensions" },
      value: { vi: dimensionDisplayText, en: dimensionDisplayText },
    });
  }

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

  return {
    slug: dbProduct.slug,
    referenceCode,
    categoryKey,
    materialKey: dbProduct.material || "",
    roomKey: "",
    styleKey: "",
    collectionKey: "",
    toneKey: "",
    availabilityKey: "",
    status: "published" as const,
    featured: dbProduct.featured || false,
    image: primaryMedia?.url || media[0]?.url || "/globe.svg",
    gallery: media.map((item: any) => item.url).filter(Boolean),
    price: {
      vi: priceDisplayText || "Lien he bao gia",
      en: priceDisplayText || "Contact for quote",
    },
    name: { vi: dbProduct.name || "", en: dbProduct.name || "" },
    category: { vi: categoryName, en: categoryName },
    summary: { vi: dbProduct.summary || "", en: dbProduct.summary || "" },
    description: { vi: dbProduct.summary || "", en: dbProduct.summary || "" },
    specs,
    tags: [],
  };
}
