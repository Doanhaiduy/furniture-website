/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createAdminClient } from "../server";
import { resolveTranslationMatchIds } from "../search-helpers";

interface RawBlogCategory {
  id: string;
  blog_category_translations?: Array<{ name: string; slug: string }>;
}

interface RawProfile {
  full_name: string;
}

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

export async function getAdminBlogPosts(params: {
  limit?: number;
  offset?: number;
  q?: string;
  status?: string;
  categoryId?: string;
  featured?: string;
  sort?: string;
  dir?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
  withTotal?: boolean;
} = {}): Promise<AdminBlogPost[] | { data: AdminBlogPost[]; total: number }> {
    try {
      const supabase = createAdminClient();
      let selectStr = `
        id,
        status,
        featured,
        published_at,
        created_by,
        cover_media:media_assets!cover_media_id (
          id,
          public_url
        ),
        blog_categories (
          id,
          blog_category_translations (name, slug)
        ),
        profiles!fk_blog_posts_author (full_name)
      `;
      selectStr += `, blog_post_translations (slug, title, excerpt, seo_title, seo_description)`;

      // Free-text search: both searched columns live on the translation table, so
      // resolve matching post ids there, then filter parents by id. (Dotted embedded
      // refs inside .or() do not parse in PostgREST — see lib/supabase/search-helpers.ts.)
      let searchIds: string[] | null = null;
      if (params.q) {
        searchIds = await resolveTranslationMatchIds(
          supabase, "blog_post_translations", "post_id", ["title", "excerpt"], params.q,
        );
      }

      let blogQuery = supabase
        .from("blog_posts")
        .select(selectStr)
        .is("deleted_at", null);

      if (params.status && params.status !== "all") {
        blogQuery = blogQuery.eq("status", params.status);
      }
      if (params.categoryId) {
        blogQuery = blogQuery.eq("category_id", params.categoryId);
      }
      if (params.featured === "true") {
        blogQuery = blogQuery.eq("featured", true);
      } else if (params.featured === "false") {
        blogQuery = blogQuery.eq("featured", false);
      }
      if (params.dateFrom) {
        blogQuery = blogQuery.gte("created_at", params.dateFrom);
      }
      if (params.dateTo) {
        blogQuery = blogQuery.lte("created_at", params.dateTo + "T23:59:59.999Z");
      }
      if (searchIds) {
        blogQuery = blogQuery.in("id", searchIds);
      }

      let total = 0;
      if (params.withTotal) {
        let countQ = supabase
          .from("blog_posts")
          .select("id", { count: "exact", head: true })
          .is("deleted_at", null);
        if (params.status && params.status !== "all") countQ = countQ.eq("status", params.status);
        if (params.categoryId) countQ = countQ.eq("category_id", params.categoryId);
        if (params.featured === "true") countQ = countQ.eq("featured", true);
        else if (params.featured === "false") countQ = countQ.eq("featured", false);
        if (params.dateFrom) countQ = countQ.gte("created_at", params.dateFrom);
        if (params.dateTo) countQ = countQ.lte("created_at", params.dateTo + "T23:59:59.999Z");
        if (searchIds) {
          countQ = countQ.in("id", searchIds);
        }
        const { count } = await countQ;
        total = count ?? 0;
      }

      const sortField = params.sort || "published_at";
      const ascending = (params.dir ?? "desc") === "asc";
      blogQuery = blogQuery
        .order(sortField, { ascending })
        .limit(params.limit ?? 20)
        .range(params.offset ?? 0, (params.offset ?? 0) + (params.limit ?? 20) - 1);

      const { data: blogData, error: blogError } = await blogQuery as { data: any[] | null, error: any };
      if (!blogError && blogData) {
        const mapped = blogData.map((row) => {
          const translation = Array.isArray(row.blog_post_translations)
            ? row.blog_post_translations[0]
            : row.blog_post_translations;
          const category = row.blog_categories as unknown as RawBlogCategory;
          const categoryTranslation = category?.blog_category_translations?.[0];
          const author = row.profiles as unknown as RawProfile;
          return {
            id: row.id,
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
            cover_media: row.cover_media
              ? { url: Array.isArray(row.cover_media) ? (row.cover_media[0] as any)?.public_url : (row.cover_media as any).public_url }
              : null,
          } as AdminBlogPost;
        });

        if (params.withTotal) return { data: mapped, total };
        return mapped;
      }
    } catch (e) {
      console.warn("Exception fetching admin blog posts, falling back to mock:", e);
    }

  if (params.withTotal) return { data: [], total: 0 };
  return [];
}
