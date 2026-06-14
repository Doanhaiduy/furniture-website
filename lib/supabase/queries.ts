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

import { mockCategories } from "../mock-data/categories";
import { mockProducts } from "../mock-data/products";
import { mockBlogs } from "../mock-data/blogs";
import { mockShowrooms } from "../mock-data/showrooms";
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
    featured?: boolean;
    limit?: number;
    offset?: number;
  }
) {
  const locale = params.locale || "vi";
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (!useMock) {
    try {
      const { data, error } = await supabase.rpc("public_products", {
        p_locale: locale,
        p_category_slug: params.categorySlug || null,
        p_group_key: params.groupKey || null,
        p_q: params.q || null,
        p_price_min: params.priceMin || null,
        p_price_max: params.priceMax || null,
        p_featured: params.featured !== undefined ? params.featured : null,
        p_limit: params.limit || 24,
        p_offset: params.offset || 0,
      });

      if (!error && data && data.length > 0) {
        return data;
      }
      if (error) {
        console.warn("Error fetching products via RPC, falling back to mock data:", error);
      }
    } catch (e) {
      console.warn("Exception fetching products, falling back to mock data:", e);
    }
  }

  // Fallback to local mock products
  let filtered = mockProducts
    .filter((p) => p.status === "published")
    .map((p) => ({
      id: p.id,
      reference_code: p.reference_code,
      slug: p.slug,
      name: p.name,
      summary: p.summary,
      description_json: p.description,
      material: p.material,
      price_display_text: p.price_display_text,
      dimension_display_text: p.dimension_display_text,
      category_id: p.category_id,
      group_key: p.group_key,
      category_slug: p.category_slug,
      category_name: p.category_name,
      price_min: p.price_min,
      price_max: p.price_max,
      currency: p.currency,
      brand_id: (p as any).brand_id || null,
      brand_name: (p as any).brand_name || null,
      brand_series: (p as any).brand_series || (p as any).brandSeries || null,
      featured: p.featured,
      published_at: p.published_at,
      primary_media: p.primary_media,
      media: p.media,
      specs: p.specs,
      attributes: p.attributes,
    }));

  if (params.categorySlug && params.categorySlug !== "all") {
    filtered = filtered.filter((p) => p.category_slug === params.categorySlug);
  }
  if (params.groupKey && params.groupKey !== "all") {
    filtered = filtered.filter((p) => p.group_key === params.groupKey);
  }
  if (params.featured !== undefined && params.featured !== null) {
    filtered = filtered.filter((p) => p.featured === params.featured);
  }
  const priceMin = params.priceMin;
  if (priceMin !== undefined && priceMin !== null) {
    filtered = filtered.filter((p) => (p.price_min ?? 0) >= priceMin);
  }
  const priceMax = params.priceMax;
  if (priceMax !== undefined && priceMax !== null) {
    filtered = filtered.filter((p) => (p.price_min ?? 0) <= priceMax);
  }
  if (params.q) {
    const qNorm = params.q.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        (typeof p.name === "object" ? p.name[locale] : p.name).toLowerCase().includes(qNorm) ||
        (typeof p.summary === "object" ? p.summary[locale] : p.summary).toLowerCase().includes(qNorm) ||
        p.reference_code.toLowerCase().includes(qNorm)
    );
  }

  const offset = params.offset || 0;
  const limit = params.limit || 24;
  return filtered.slice(offset, offset + limit);
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
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (!useMock) {
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
  }

  // Fallback to local mock blogs
  let filtered = mockBlogs
    .filter((post) => post.status === "published")
    .map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title[locale],
      excerpt: post.excerpt[locale],
      category_name: post.category_name[locale],
      category_slug: post.category_slug,
      author_name: post.author_name,
      featured: post.featured,
      published_at: post.published_at,
      cover_media: post.cover_media,
      readTime: post.readTime,
      body_json: post.sections,
    }));

  if (params.categorySlug && params.categorySlug !== "all") {
    filtered = filtered.filter((post) => post.category_slug === params.categorySlug);
  }
  if (params.featured !== undefined && params.featured !== null) {
    filtered = filtered.filter((post) => post.featured === params.featured);
  }
  if (params.q) {
    const qNorm = params.q.trim().toLowerCase();
    filtered = filtered.filter(
      (post) =>
        post.title.toLowerCase().includes(qNorm) ||
        post.excerpt.toLowerCase().includes(qNorm)
    );
  }

  const offset = params.offset || 0;
  const limit = params.limit || 12;
  return filtered.slice(offset, offset + limit);
}

/**
 * Fetch localized showrooms list using the public RPC function, with automatic mock fallback.
 */
export async function getShowrooms(
  supabase: SupabaseClient,
  locale: "vi" | "en" = "vi"
) {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (!useMock) {
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
  }

  // Fallback to local mock showrooms
  return mockShowrooms
    .filter((s) => s.status === "published")
    .map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name[locale],
      address: s.address[locale],
      hotline: s.hotline,
      opening_hours: s.opening_hours[locale],
      google_maps_embed_url: s.google_maps_embed_url,
      google_maps_fallback_url: s.google_maps_fallback_url,
      latitude: s.latitude,
      longitude: s.longitude,
      status: s.status,
      primary_media: s.primary_media,
    }));
}

/**
 * Fetch product categories with localized names and descriptions, with automatic mock fallback.
 */
export async function getCategories(
  supabase: SupabaseClient,
  locale: "vi" | "en" = "vi"
) {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (!useMock) {
    try {
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

      if (!error && data && data.length > 0) {
        return data.map((cat: any) => {
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
        });
      }
    } catch (e) {
      console.warn("Exception fetching categories, falling back to mock:", e);
    }
  }

  // Fallback to local mock categories
  return mockCategories
    .filter((cat) => cat.status === "published")
    .map((cat) => ({
      id: cat.id,
      parentId: cat.parent_id,
      groupKey: cat.group_key,
      sortOrder: cat.sort_order,
      slug: cat.slug,
      name: cat.name[locale],
      description: cat.description?.[locale] || "",
    }));
}

/**
 * Fetch a content page (e.g. home, about) by key and locale, with automatic mock fallback.
 */
export async function getContentPage(
  supabase: SupabaseClient,
  key: string,
  locale: "vi" | "en" = "vi"
) {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (!useMock) {
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
    } catch (e) {
      console.warn("Exception fetching content page, falling back to mock:", e);
    }
  }

  // Fallback static page contents
  const homeTitle = locale === "vi" ? "Không gian tinh hoa nâng tầm sống" : "Exquisite spaces elevating your life";
  const homeLead = locale === "vi" 
    ? "Showroom Phương Đông mang đến các giải pháp đồ gỗ óc chó cao cấp và thiết bị vệ sinh nhập khẩu tiêu chuẩn châu Âu cho ngôi nhà bạn."
    : "Phuong Dong Showroom delivers high-end walnut furniture and European-standard sanitary fixtures to your home.";

  const aboutTitle = locale === "vi" ? "Về chúng tôi - Showroom Phương Đông" : "About Us - Phuong Dong Showroom";
  const aboutLead = locale === "vi"
    ? "Hơn 20 năm đồng hành kiến tạo không gian sống tiện nghi, sang trọng cho gia đình Việt."
    : "Over 20 years of creating comfortable and luxurious living spaces for Vietnamese families.";

  return {
    id: `page-${key}`,
    key,
    title: key === "about" ? aboutTitle : homeTitle,
    lead: key === "about" ? aboutLead : homeLead,
    bodyJson: {},
    seoTitle: key === "about" ? aboutTitle : homeTitle,
    seoDescription: key === "about" ? aboutLead : homeLead,
  };
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
    brandId: product.brand_id || null,
    brandName: product.brand_name || null,
    brandSeries: product.brand_series,
    featured: product.featured,
    publishedAt: product.published_at,
    primaryMedia: product.primary_media || null,
    media: Array.isArray(product.media) ? product.media : [],
    attributes: Array.isArray(product.attributes) ? product.attributes : [],
    specs: product.specs,
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

  if (dbProduct.material) {
    const matVi = typeof dbProduct.material === "object" ? dbProduct.material.vi : dbProduct.material;
    const matEn = typeof dbProduct.material === "object" ? dbProduct.material.en : dbProduct.material;
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

  if (Array.isArray(dbProduct.specs)) {
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
  const descVi = typeof dbProduct.description === "object" && dbProduct.description ? dbProduct.description.vi : dbProduct.description_json?.vi || dbProduct.descriptionJson?.vi || summaryVi || "";
  const descEn = typeof dbProduct.description === "object" && dbProduct.description ? dbProduct.description.en : dbProduct.description_json?.en || dbProduct.descriptionJson?.en || summaryEn || "";

  const priceVi = typeof priceDisplayText === "object" ? (priceDisplayText as any).vi : priceDisplayText || "Liên hệ báo giá";
  const priceEn = typeof priceDisplayText === "object" ? (priceDisplayText as any).en : priceDisplayText || "Contact for quote";

  return {
    slug: dbProduct.slug,
    referenceCode,
    categoryKey,
    materialKey: dbProduct.material_key || dbProduct.materialKey || (typeof dbProduct.material === "object" ? dbProduct.material.en : dbProduct.material || ""),
    roomKey: dbProduct.room_key || dbProduct.roomKey || "",
    styleKey: dbProduct.style_key || dbProduct.styleKey || "",
    collectionKey: dbProduct.collection_key || dbProduct.collectionKey || "",
    toneKey: dbProduct.tone_key || dbProduct.toneKey || "",
    availabilityKey: dbProduct.availability_key || dbProduct.availabilityKey || "",
    status: "published" as const,
    featured: dbProduct.featured || false,
    image: primaryMedia?.url || media[0]?.url || "/placeholder.jpg",
    gallery: media.map((item: any) => item.url).filter(Boolean),
    price: { vi: priceVi, en: priceEn },
    name: { vi: nameVi, en: nameEn },
    category: { vi: categoryNameVi, en: categoryNameEn },
    summary: { vi: summaryVi, en: summaryEn },
    description: { vi: descVi, en: descEn },
    specs,
    tags: Array.isArray(dbProduct.tags) ? dbProduct.tags : [],
    promotionId: dbProduct.promotion_id || dbProduct.promotionId || null,
    promoPriceMin: dbProduct.promo_price_min || dbProduct.promoPriceMin || null,
    promoPriceMax: dbProduct.promo_price_max || dbProduct.promoPriceMax || null,
  };
}

/**
 * Fetch localized promotions list using public promotions RPC, with automatic mock fallback.
 */
export async function getPromotions(
  supabase: SupabaseClient,
  locale: "vi" | "en" = "vi"
) {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (!useMock) {
    try {
      const { data, error } = await supabase.rpc("public_promotions", {
        p_locale: locale,
      });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => {
          const meta = d.metadata_jsonb || {};
          return {
            id: d.id,
            code: d.code,
            discount_percentage: d.discount_percentage || d.discountPercentage || 0,
            title: d.title,
            description: d.description,
            comboPrice: d.combo_price,
            originalPrice: d.original_price,
            coverImageUrl: d.cover_image_url,
            tag: locale === "vi" ? meta.tag_vi : meta.tag_en,
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
  }

  // Fallback to static mock promotions
  return [
    {
      id: "11111111-1111-1111-1111-111111111111",
      code: "heritage-walnut-combo",
      discount_percentage: 15.00,
      title: locale === "vi" ? "Không Gian Phòng Khách Walnut Heritage" : "Heritage Walnut Living Room Package",
      description: locale === "vi" ? "Tinh tuyển gỗ óc chó tự nhiên cho căn hộ cao cấp" : "Curated natural walnut for premium apartments",
      comboPrice: 68000000,
      originalPrice: 79500000,
      coverImageUrl: imageAssets.sofa,
      tag: locale === "vi" ? "Combo Độc Quyền" : "Exclusive Package",
      items: locale === "vi" 
        ? [
            "Sofa Curve Velour bọc vải cao cấp",
            "Bàn Trà Marble Round Calacatta cao cấp",
            "Kệ Tivi Minimalist Wood gỗ veneer óc chó trầm ấm"
          ]
        : [
            "Premium Velour upholstered Sofa Curve",
            "Luxurious Marble Round Calacatta Coffee Table",
            "Warm Minimalist Wood TV Cabinet in walnut veneer"
          ],
      color: "from-amber-500/20 to-orange-500/5",
      badgeColor: "bg-amber-500 text-black",
      period: locale === "vi" ? "Hạn chót: 30/06/2026" : "Until June 30, 2026"
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      code: "wellness-bath-set",
      discount_percentage: 18.00,
      title: locale === "vi" ? "Trọn Bộ Thiết Bị Phòng Tắm Wellness" : "Wellness Master Bathroom Suite",
      description: locale === "vi" ? "Không gian spa thư giãn nhập khẩu chính hãng tiêu chuẩn Châu Âu" : "Relaxing spa suite with European standards",
      comboPrice: 34500000,
      originalPrice: 42000000,
      coverImageUrl: imageAssets.room,
      tag: locale === "vi" ? "Gói Sức Khỏe" : "Wellness Package",
      items: locale === "vi" 
        ? [
            "Sen Tắm Mạ Vàng 24K với van điều nhiệt cao cấp",
            "Bồn tắm American phong cách khách sạn 5 sao",
            "Lavabo Kohler tối giản chống bám bẩn vượt trội"
          ]
        : [
            "24K Gold Plated Shower Set with thermostatic valve",
            "5-star hotel style American Freestanding Bathtub",
            "Minimalist Kohler Basin with anti-scale finish"
          ],
      color: "from-emerald-500/20 to-teal-500/5",
      badgeColor: "bg-emerald-500 text-white",
      period: locale === "vi" ? "Hạn chót: 30/06/2026" : "Until June 30, 2026"
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      code: "porcelain-surface-pack",
      discount_percentage: 20.00,
      title: locale === "vi" ? "Gói Gạch Ốp Lát Toàn Diện Grand Surface" : "Grand Surface Porcelain Tile Package",
      description: locale === "vi" ? "Vật liệu cao cấp hoàn thiện bề mặt sang trọng, bền vững" : "Premium materials for luxury and durable surfaces",
      comboPrice: 1200000,
      originalPrice: 1500000,
      coverImageUrl: imageAssets.texture,
      tag: locale === "vi" ? "Ưu Đãi Hoàn Thiện" : "Finishing Deal",
      items: locale === "vi" 
        ? [
            "Gạch Calacatta Marble khổ lớn 1200x2400 mm",
            "Gạch Porcelain chịu lực, chống trầy xước",
            "Tư vấn phối ghép vật liệu miễn phí từ KTS"
          ]
        : [
            "Large format Calacatta Marble look tiles 1200x2400 mm",
            "Heavy duty, scratch-resistant Porcelain tiles",
            "Free material coordination consultancy by architects"
          ],
      color: "from-blue-500/20 to-indigo-500/5",
      badgeColor: "bg-blue-600 text-white",
      period: locale === "vi" ? "Áp dụng theo công trình" : "Applied per project scope"
    }
  ];
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
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

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

  if (useMock) {
    return defaults;
  }

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

