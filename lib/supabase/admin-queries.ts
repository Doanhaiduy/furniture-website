import { createAdminClient, createClient } from "./server";

export type AdminDashboardStats = {
  productCount: number;
  categoryCount: number;
  blogCount: number;
  showroomCount: number;
  quoteCount: number;
  userCount: number;
};

export type AdminQuote = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  company: string | null;
  service: string | null;
  message: string;
  preferred_locale: string;
  product_id: string | null;
  category_id: string | null;
  source_path: string;
  source_url: string | null;
  status: string;
  assigned_to: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type AdminProduct = {
  id: string;
  reference_code: string | null;
  slug: string;
  name: string;
  summary: string;
  description_json: unknown;
  material: string | null;
  price_display_text: string | null;
  dimension_display_text: string | null;
  category_id: string;
  category_slug: string;
  category_name: string;
  group_key: string | null;
  price_min: number | null;
  price_max: number | null;
  currency: string;
  width: number | null;
  depth: number | null;
  height: number | null;
  dimension_unit: string;
  brand_series: string | null;
  featured: boolean;
  published_at: string | null;
  primary_media: unknown;
  media: unknown;
  attributes: unknown;
};

export type AdminCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  status: string;
  sort_order: number;
  parent_id: string | null;
  product_count: number;
};

export type AdminBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body_json: unknown;
  seo_title: string | null;
  seo_description: string | null;
  category_id: string;
  category_name: string;
  category_slug: string;
  author_name: string;
  status: string;
  featured: boolean;
  published_at: string | null;
  cover_media: unknown;
};

export type AdminShowroom = {
  id: string;
  code: string | null;
  name: string;
  address: string;
  opening_hours: string | null;
  hotline: string;
  google_maps_embed_url: string;
  google_maps_fallback_url: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
  sort_order: number;
  primary_media: unknown;
};

export async function getAdminDashboardStats(role: string): Promise<AdminDashboardStats> {
  const supabase = await createClient();

  const [{ count: productCount }, { count: categoryCount }, { count: blogCount }, { count: showroomCount }] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("product_categories").select("*", { count: "exact", head: true }),
      supabase.from("blog_posts").select("*", { count: "exact", head: true }),
      supabase.from("showrooms").select("*", { count: "exact", head: true }),
    ]);

  const isAdmin = role === "admin";
  const [{ count: quoteCount }, { count: userCount }] = isAdmin
    ? await Promise.all([
        supabase.from("quote_requests").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ])
    : [{ count: 0 } as const, { count: 0 } as const];

  return {
    productCount: productCount ?? 0,
    categoryCount: categoryCount ?? 0,
    blogCount: blogCount ?? 0,
    showroomCount: showroomCount ?? 0,
    quoteCount: quoteCount ?? 0,
    userCount: userCount ?? 0,
  };
}

export async function getAdminQuotesList(params: {
  status?: string;
  keyword?: string;
  limit?: number;
  offset?: number;
}): Promise<AdminQuote[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase.rpc("admin_quote_search", {
    p_status: params.status ?? null,
    p_keyword: params.keyword ?? null,
    p_date_from: null,
    p_date_to: null,
    p_source_path: null,
    p_assigned_to: null,
    p_limit: params.limit ?? 50,
    p_offset: params.offset ?? 0,
  });

  if (error) {
    console.error("admin_quote_search failed", error);
    return [];
  }

  return (data ?? []) as AdminQuote[];
}

export async function getAdminProducts(params: {
  limit?: number;
  offset?: number;
  q?: string;
  status?: string;
}): Promise<AdminProduct[]> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      `
      id,
      reference_code,
      status,
      price_min,
      price_max,
      currency,
      featured,
      published_at,
      product_translations (
        slug,
        name,
        summary,
        description_json,
        material,
        price_display_text,
        dimension_display_text
      ),
      product_categories (
        id,
        slug,
        name,
        product_category_translations (name)
      )
    `,
    )
    .order("sort_order", { ascending: true })
    .limit(params.limit ?? 50)
    .range(params.offset ?? 0, (params.limit ?? 50) - 1);

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error("getAdminProducts failed", error);
    return [];
  }

  return data.map((row) => {
    const translation = Array.isArray(row.product_translations)
      ? row.product_translations[0]
      : row.product_translations;
    const category = row.product_categories as { id: string; slug: string; name: string; product_category_translations?: { name: string }[] } | null;
    const categoryTranslation = category?.product_category_translations?.[0];
    return {
      id: row.id as string,
      reference_code: row.reference_code ?? null,
      slug: translation?.slug ?? "",
      name: translation?.name ?? "",
      summary: translation?.summary ?? "",
      description_json: translation?.description_json ?? {},
      material: translation?.material ?? null,
      price_display_text: translation?.price_display_text ?? null,
      dimension_display_text: translation?.dimension_display_text ?? null,
      category_id: category?.id ?? "",
      category_slug: category?.slug ?? "",
      category_name: categoryTranslation?.name ?? category?.name ?? "",
      group_key: null,
      price_min: row.price_min,
      price_max: row.price_max,
      currency: row.currency,
      width: null,
      depth: null,
      height: null,
      dimension_unit: "mm",
      brand_series: null,
      featured: row.featured,
      published_at: row.published_at ?? null,
      primary_media: null,
      media: [],
      attributes: [],
    } satisfies AdminProduct;
  });
}

export async function getAdminCategories(): Promise<AdminCategory[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("product_categories")
    .select(
      `
      id,
      slug,
      status,
      sort_order,
      parent_id,
      product_category_translations (name, description)
    `,
    )
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.error("getAdminCategories failed", error);
    return [];
  }

  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);

  const productCount = count ?? 0;

  return data.map((row) => {
    const translation = Array.isArray(row.product_category_translations)
      ? row.product_category_translations[0]
      : row.product_category_translations;
    return {
      id: row.id as string,
      slug: row.slug as string,
      name: translation?.name ?? row.slug,
      description: translation?.description ?? null,
      status: row.status as string,
      sort_order: row.sort_order,
      parent_id: row.parent_id ?? null,
      product_count: productCount,
    } satisfies AdminCategory;
  });
}

export async function getAdminBlogPosts(params: { limit?: number; offset?: number } = {}): Promise<AdminBlogPost[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      `
      id,
      status,
      featured,
      published_at,
      created_by,
      blog_post_translations (
        slug,
        title,
        excerpt,
        seo_title,
        seo_description
      ),
      blog_categories (
        id,
        blog_category_translations (name, slug)
      ),
      profiles!blog_posts_author_id_fkey (full_name)
    `,
    )
    .is("deleted_at", null)
    .order("published_at", { ascending: false })
    .limit(params.limit ?? 50)
    .range(params.offset ?? 0, (params.limit ?? 50) - 1);

  if (error || !data) {
    console.error("getAdminBlogPosts failed", error);
    return [];
  }

  return data.map((row) => {
    const translation = Array.isArray(row.blog_post_translations)
      ? row.blog_post_translations[0]
      : row.blog_post_translations;
    const category = row.blog_categories as { id: string; blog_category_translations?: { name: string; slug: string }[] } | null;
    const categoryTranslation = category?.blog_category_translations?.[0];
    const author = row.profiles as { full_name: string } | null;
    return {
      id: row.id as string,
      slug: translation?.slug ?? "",
      title: translation?.title ?? "",
      excerpt: translation?.excerpt ?? "",
      body_json: {},
      seo_title: translation?.seo_title ?? null,
      seo_description: translation?.seo_description ?? null,
      category_id: category?.id ?? "",
      category_name: categoryTranslation?.name ?? "",
      category_slug: categoryTranslation?.slug ?? "",
      author_name: author?.full_name ?? "",
      status: row.status as string,
      featured: row.featured,
      published_at: row.published_at ?? null,
      cover_media: null,
    } satisfies AdminBlogPost;
  });
}

export async function getAdminShowrooms(): Promise<AdminShowroom[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("showrooms")
    .select(
      `
      id,
      code,
      hotline,
      google_maps_embed_url,
      google_maps_fallback_url,
      latitude,
      longitude,
      status,
      sort_order,
      showroom_translations (name, address, opening_hours),
      showroom_media (media_id, is_primary, media:media_assets (public_url))
    `,
    )
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.error("getAdminShowrooms failed", error);
    return [];
  }

  return data.map((row) => {
    const translation = Array.isArray(row.showroom_translations)
      ? row.showroom_translations[0]
      : row.showroom_translations;
    const primaryMedia = Array.isArray(row.showroom_media)
      ? row.showroom_media.find((m: { is_primary: boolean }) => m.is_primary)
      : null;
    const mediaAsset = primaryMedia?.media as { public_url: string } | null;
    return {
      id: row.id as string,
      code: row.code ?? null,
      name: translation?.name ?? "",
      address: translation?.address ?? "",
      opening_hours: translation?.opening_hours ?? null,
      hotline: row.hotline,
      google_maps_embed_url: row.google_maps_embed_url,
      google_maps_fallback_url: row.google_maps_fallback_url,
      latitude: row.latitude,
      longitude: row.longitude,
      status: row.status as string,
      sort_order: row.sort_order,
      primary_media: mediaAsset?.public_url ?? null,
    } satisfies AdminShowroom;
  });
}
