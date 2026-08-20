"use server";

import { createAdminClient } from "../server";

export type AdminDashboardStats = {
  productCount: number;
  featuredProductCount: number;
  draftProductCount: number;
  categoryCount: number;
  blogCount: number;
  publishedBlogCount: number;
  showroomCount: number;
  quoteCount: number;
  pendingQuoteCount: number;
  contactedQuoteCount: number;
  completedQuoteCount: number;
  userCount: number;
};

export type CategoryDistributionItem = {
  id: string;
  name: string;
  count: number;
  percentage: number;
};

export type DashboardFeaturedProduct = {
  id: string;
  reference_code: string | null;
  name: string;
  category_name: string;
  price_text: string;
  image_url: string | null;
  status: string;
  updated_at: string;
};

export type DashboardActivityEvent = {
  id: string;
  title: string;
  description: string;
  type: "product" | "quote" | "blog" | "user" | "system";
  created_at: string;
  actor_name?: string;
};

export async function getAdminDashboardStats(role: string): Promise<AdminDashboardStats> {
  try {
    const supabase = createAdminClient();
    const [
      { count: productCount },
      { count: featuredProductCount },
      { count: draftProductCount },
      { count: categoryCount },
      { count: blogCount },
      { count: publishedBlogCount },
      { count: showroomCount },
    ] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("products").select("*", { count: "exact", head: true }).is("deleted_at", null).eq("featured", true),
      supabase.from("products").select("*", { count: "exact", head: true }).is("deleted_at", null).eq("status", "draft"),
      supabase.from("product_categories").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("blog_posts").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("blog_posts").select("*", { count: "exact", head: true }).is("deleted_at", null).eq("status", "published"),
      supabase.from("showrooms").select("*", { count: "exact", head: true }).is("deleted_at", null),
    ]);

    const isAdmin = role === "admin";
    const [
      { count: quoteCount },
      { count: pendingQuoteCount },
      { count: contactedQuoteCount },
      { count: completedQuoteCount },
      { count: userCount },
    ] = isAdmin
      ? await Promise.all([
          supabase.from("quote_requests").select("*", { count: "exact", head: true }).is("deleted_at", null),
          supabase.from("quote_requests").select("*", { count: "exact", head: true }).is("deleted_at", null).eq("status", "pending"),
          supabase.from("quote_requests").select("*", { count: "exact", head: true }).is("deleted_at", null).in("status", ["in_progress", "contacted", "quoted"]),
          supabase.from("quote_requests").select("*", { count: "exact", head: true }).is("deleted_at", null).eq("status", "completed"),
          supabase.from("profiles").select("*", { count: "exact", head: true }).is("deleted_at", null),
        ])
      : [
          { count: 0 } as const,
          { count: 0 } as const,
          { count: 0 } as const,
          { count: 0 } as const,
          { count: 0 } as const,
        ];

    return {
      productCount: productCount ?? 0,
      featuredProductCount: featuredProductCount ?? 0,
      draftProductCount: draftProductCount ?? 0,
      categoryCount: categoryCount ?? 0,
      blogCount: blogCount ?? 0,
      publishedBlogCount: publishedBlogCount ?? 0,
      showroomCount: showroomCount ?? 0,
      quoteCount: quoteCount ?? 0,
      pendingQuoteCount: pendingQuoteCount ?? 0,
      contactedQuoteCount: contactedQuoteCount ?? 0,
      completedQuoteCount: completedQuoteCount ?? 0,
      userCount: userCount ?? 0,
    };
  } catch (e) {
    console.warn("Exception fetching admin dashboard stats:", e);
  }

  return {
    productCount: 0,
    featuredProductCount: 0,
    draftProductCount: 0,
    categoryCount: 0,
    blogCount: 0,
    publishedBlogCount: 0,
    showroomCount: 0,
    quoteCount: 0,
    pendingQuoteCount: 0,
    contactedQuoteCount: 0,
    completedQuoteCount: 0,
    userCount: 0,
  };
}

export async function getAdminCategoryDistribution(): Promise<CategoryDistributionItem[]> {
  try {
    const supabase = createAdminClient();
    const { data: categories, error } = await supabase
      .from("product_categories")
      .select(`
        id,
        group_key,
        product_category_translations (locale, name),
        products!fk_products_category (id, deleted_at)
      `)
      .is("deleted_at", null)
      .limit(10);

    if (error || !categories) return [];

    let totalProducts = 0;
    const items = categories.map((cat: any) => {
      const activeProducts = (cat.products || []).filter((p: any) => !p.deleted_at).length;
      totalProducts += activeProducts;
      const tList = Array.isArray(cat.product_category_translations)
        ? cat.product_category_translations
        : cat.product_category_translations ? [cat.product_category_translations] : [];
      const vi = tList.find((t: any) => t.locale === "vi") || tList[0];
      return {
        id: cat.id,
        name: vi?.name || cat.group_key || "Danh mục",
        count: activeProducts,
        percentage: 0,
      };
    });

    const sorted = items
      .map((item) => ({
        ...item,
        percentage: totalProducts > 0 ? Math.round((item.count / totalProducts) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return sorted.slice(0, 5);
  } catch (e) {
    console.warn("Exception in getAdminCategoryDistribution:", e);
    return [];
  }
}

export async function getAdminFeaturedProducts(limit = 4): Promise<DashboardFeaturedProduct[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        reference_code,
        price_min,
        price_max,
        price_display_text,
        status,
        updated_at,
        product_translations (locale, name, price_display_text),
        product_categories (
          id,
          product_category_translations (locale, name)
        ),
        product_media (
          is_primary,
          media_assets (public_url)
        )
      `)
      .is("deleted_at", null)
      .eq("featured", true)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((p: any) => {
      const tList = Array.isArray(p.product_translations) ? p.product_translations : [];
      const vi = tList.find((t: any) => t.locale === "vi") || tList[0];

      const catTranslations = Array.isArray(p.product_categories?.product_category_translations)
        ? p.product_categories.product_category_translations
        : [];
      const catVi = catTranslations.find((t: any) => t.locale === "vi") || catTranslations[0];

      const mediaList = Array.isArray(p.product_media) ? p.product_media : [];
      const primaryMedia = mediaList.find((m: any) => m.is_primary) || mediaList[0];
      const imageUrl = primaryMedia?.media_assets?.public_url || null;

      let priceText = vi?.price_display_text || p.price_display_text || null;
      if (!priceText) {
        if (p.price_min) {
          priceText = p.price_min.toLocaleString("vi-VN") + " ₫";
          if (p.price_max && p.price_max !== p.price_min) {
            priceText += ` – ${p.price_max.toLocaleString("vi-VN")} ₫`;
          }
        } else {
          priceText = "Liên hệ";
        }
      }

      return {
        id: p.id,
        reference_code: p.reference_code,
        name: vi?.name || "Sản phẩm",
        category_name: catVi?.name || "Danh mục",
        price_text: priceText,
        image_url: imageUrl,
        status: p.status,
        updated_at: p.updated_at,
      };
    });
  } catch (e) {
    console.warn("Exception in getAdminFeaturedProducts:", e);
    return [];
  }
}

export async function getAdminRecentActivities(limit = 6): Promise<DashboardActivityEvent[]> {
  try {
    const supabase = createAdminClient();
    const events: DashboardActivityEvent[] = [];

    // 1. Fetch recent quote requests
    const { data: quotes } = await supabase
      .from("quote_requests")
      .select("id, full_name, phone, service, status, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (quotes) {
      for (const q of quotes) {
        const statusMap: Record<string, string> = {
          pending: "Yêu cầu báo giá mới",
          in_progress: "Đang tư vấn",
          contacted: "Đã liên hệ",
          quoted: "Đã gửi bảng giá",
          completed: "Chốt báo giá thành công",
          archived: "Đã lưu trữ",
        };
        events.push({
          id: `quote-${q.id}`,
          title: `${statusMap[q.status] || "Báo giá"}: ${q.full_name}`,
          description: `SĐT: ${q.phone} ${q.service ? `• ${q.service}` : ""}`,
          type: "quote",
          created_at: q.created_at,
        });
      }
    }

    // 2. Fetch recent product updates
    const { data: products } = await supabase
      .from("products")
      .select("id, reference_code, status, updated_at, product_translations(locale, name)")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (products) {
      for (const p of products) {
        const tList = Array.isArray(p.product_translations) ? p.product_translations : [];
        const vi = tList.find((t: any) => t.locale === "vi") || tList[0];
        events.push({
          id: `prod-${p.id}`,
          title: `Sản phẩm: ${vi?.name || p.reference_code || "Sản phẩm"}`,
          description: `Mã: ${p.reference_code || "—"} • ${p.status === "published" ? "Đã xuất bản" : "Bản nháp"}`,
          type: "product",
          created_at: p.updated_at,
        });
      }
    }

    // 3. Fetch recent blog posts
    const { data: blogs } = await supabase
      .from("blog_posts")
      .select("id, status, updated_at, blog_post_translations(locale, title)")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (blogs) {
      for (const b of blogs) {
        const tList = Array.isArray(b.blog_post_translations) ? b.blog_post_translations : [];
        const vi = tList.find((t: any) => t.locale === "vi") || tList[0];
        events.push({
          id: `blog-${b.id}`,
          title: `Tin tức: ${vi?.title || "Bài viết"}`,
          description: `${b.status === "published" ? "Đã xuất bản" : "Bản nháp"}`,
          type: "blog",
          created_at: b.updated_at,
        });
      }
    }

    events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return events.slice(0, limit);
  } catch (e) {
    console.warn("Exception in getAdminRecentActivities:", e);
    return [];
  }
}
