/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from "@supabase/supabase-js";

const publicBlogLookupPageSize = 50;
const maxPublicBlogLookupRows = 500;

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
