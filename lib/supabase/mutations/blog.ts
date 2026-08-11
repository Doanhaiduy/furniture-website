/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createAdminClient } from "../server";
import { requireEditorOrAdmin } from "../auth";
import { writeAuditLog } from "../audit";
import { blogPostSchema, type BlogPostInput } from "../../validations/admin";
import { triggerRevalidation, getOrCreateMediaAssetId, isUuid, validationMessages, localizedText } from "./helpers";

function bodyJsonFromEditor(value: unknown, fallbackTitle: string) {
  if (value && typeof value === "object") {
    return value;
  }

  const body = typeof value === "string" ? value.trim() : "";
  
  // Try to parse H2 and H3 headings to split into sections
  const headingRegex = /<h([23])[^>]*>(.*?)<\/h\1>/gi;
  const sections: any[] = [];

  let match;
  let lastIndex = 0;
  let sectionIndex = 1;
  let currentTitle = fallbackTitle;
  let currentId = "noi-dung";

  const matches: Array<{ title: string; index: number; length: number }> = [];
  while ((match = headingRegex.exec(body)) !== null) {
    matches.push({
      title: match[2].replace(/<[^>]*>/g, "").trim(), // Strip any nested HTML tags inside the heading
      index: match.index,
      length: match[0].length,
    });
  }

  if (matches.length > 0) {
    for (let i = 0; i < matches.length; i++) {
      const currentMatch = matches[i];
      const previousBody = body.substring(lastIndex, currentMatch.index).trim();

      // Only add the section if it is the first section or if it has non-empty body text
      if (previousBody || sections.length === 0) {
        sections.push({
          id: currentId,
          title: currentTitle,
          body: previousBody,
        });
      }

      currentTitle = currentMatch.title;
      // Convert Vietnamese title to a clean slug/id
      currentId = slugifyVi(currentTitle) || `phan-${sectionIndex}`;
      lastIndex = currentMatch.index + currentMatch.length;
      sectionIndex++;
    }

    // Add the final section after the last heading
    const finalBody = body.substring(lastIndex).trim();
    sections.push({
      id: currentId,
      title: currentTitle,
      body: finalBody,
    });
  } else {
    // Fallback to a single section if no H2/H3 tags are found
    sections.push({
      id: "noi-dung",
      title: fallbackTitle,
      body,
    });
  }

  return {
    sections,
  };
}

function bodyJsonToEditorText(value: unknown) {
  if (!value) return "";
  if (typeof value === "string" ? true : false) return value as string; // safe casting/typecheck
  if (typeof value !== "object") return String(value);

  const record = value as Record<string, unknown>;
  if (typeof record.html === "string") return record.html;

  if (Array.isArray(record.sections)) {
    return record.sections
      .map((section) => {
        if (!section || typeof section !== "object") return "";
        const sectionRecord = section as Record<string, unknown>;
        const body = sectionRecord.body;
        if (typeof body === "string") return body;
        if (body && typeof body === "object") {
          const localizedBody = body as Record<string, unknown>;
          return String(localizedBody.vi ?? localizedBody.en ?? "");
        }
        return "";
      })
      .filter(Boolean)
      .join("\n\n");
  }

  return JSON.stringify(value);
}

// Vietnamese-aware slug generator for inline blog-category creation.
function slugifyVi(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "danh-muc";
}

/**
* Create a blog category inline (from the blog editor). Handles the publish trigger
* that requires both vi + en translations: insert draft → translations → publish.
* Returns the new category id + slug + name so the editor can select it immediately.
*/
export async function createBlogCategory(
  name: string,
): Promise<{ success: boolean; id?: string; slug?: string; name?: string; error?: string }> {
  const user = await requireEditorOrAdmin();
  const trimmed = (name || "").trim();
  if (!trimmed) return { success: false, error: "Tên danh mục là bắt buộc" };
  const supabase = createAdminClient();
  const baseSlug = slugifyVi(trimmed);

  try {
    const { data: cat, error: catErr } = await supabase
      .from("blog_categories")
      .insert({ status: "draft", created_by: user.id, updated_by: user.id })
      .select("id")
      .single();
    if (catErr || !cat) return { success: false, error: catErr?.message || "Không tạo được danh mục" };

    // Ensure the slug is unique (unique per locale). Append a short suffix on collision.
    let slug = baseSlug;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { error: transErr } = await supabase.from("blog_category_translations").insert([
        { category_id: cat.id, locale: "vi", slug, name: trimmed },
        { category_id: cat.id, locale: "en", slug, name: trimmed },
      ]);
      if (!transErr) break;
      if (attempt === 2) {
        await supabase.from("blog_categories").delete().eq("id", cat.id);
        return { success: false, error: transErr.message };
      }
      slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const { error: pubErr } = await supabase
      .from("blog_categories")
      .update({ status: "published", published_at: new Date().toISOString(), updated_by: user.id })
      .eq("id", cat.id);
    if (pubErr) return { success: false, error: pubErr.message };

    triggerRevalidation();
    return { success: true, id: cat.id, slug, name: trimmed };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

/**
* Soft-delete a blog category (from the blog editor). Blocked when the category
* still has active posts so we don't strand published content.
*/
export async function deleteBlogCategory(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();
  if (!id) return { success: false, error: "Thiếu mã danh mục" };
  const supabase = createAdminClient();

  try {
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("category_id", id)
      .is("deleted_at", null)
      .limit(1);
    if (posts && posts.length > 0) {
      return {
        success: false,
        error: "Không thể xóa danh mục đang có bài viết. Hãy chuyển hoặc xóa các bài viết trước.",
      };
    }

    const { error } = await supabase
      .from("blog_categories")
      .update({ deleted_at: new Date().toISOString(), status: "draft", updated_by: user.id })
      .eq("id", id);
    if (error) return { success: false, error: error.message };

    try {
      await writeAuditLog(supabase, {
        actorId: user.id,
        action: "archive",
        entityType: "blog_category",
        entityId: id,
      });
    } catch {
      /* audit failure should not block the delete */
    }

    triggerRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

// Resolve a datetime-local ("YYYY-MM-DDTHH:mm") or ISO string to an ISO timestamp.
function toIsoOrNull(value?: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

const FEATURED_POST_CAP = 8;

// Item 4.2: at most FEATURED_POST_CAP posts can be featured + published at once.
// Friendly pre-check mirroring the DB trigger check_blog_post_publish_requirements,
// which remains the hard guarantee against direct-API bypass.
async function wouldExceedFeaturedCap(
  supabase: ReturnType<typeof createAdminClient>,
  excludePostId?: string
): Promise<boolean> {
  let query = supabase
    .from("blog_posts")
    .select("id", { count: "exact", head: true })
    .eq("featured", true)
    .eq("status", "published")
    .is("deleted_at", null);
  if (excludePostId) query = query.neq("id", excludePostId);
  const { count } = await query;
  return (count ?? 0) >= FEATURED_POST_CAP;
}

async function resolveBlogCategoryId(
  supabase: ReturnType<typeof createAdminClient>,
  categoryIdOrSlug: string
): Promise<{ id?: string; error?: string }> {
  const value = categoryIdOrSlug.trim();
  if (!value) return { error: "Danh mục bài viết là bắt buộc" };
  if (isUuid(value)) return { id: value };

  const { data, error } = await supabase
    .from("blog_category_translations")
    .select("category_id")
    .eq("slug", value)
    .limit(1)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data?.category_id) return { error: `Không tìm thấy danh mục bài viết: ${value}` };
  return { id: data.category_id };
}

async function findBlogPostId(
  supabase: ReturnType<typeof createAdminClient>,
  idOrSlug: string
): Promise<{ id?: string; error?: string }> {
  const value = idOrSlug.trim();
  if (isUuid(value)) return { id: value };

  const { data, error } = await supabase
    .from("blog_post_translations")
    .select("post_id")
    .eq("slug", value)
    .limit(1)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data?.post_id) return { error: "Blog post not found by slug" };
  return { id: data.post_id };
}

export async function getAdminBlogPostByIdOrSlug(idOrSlug: string): Promise<{
  success: boolean;
  data?: {
    id: string;
    slug: string;
    title_vi: string;
    title_en: string;
    excerpt_vi: string;
    excerpt_en: string;
    body_json_vi: string;
    body_json_en: string;
    category_id: string;
    status: "draft" | "published" | "archived";
    featured: boolean;
    published_at: string | null;
    seo_title_vi: string;
    seo_title_en: string;
    seo_description_vi: string;
    seo_description_en: string;
    cover_image: string;
  };
  error?: string;
}> {
  try {
    await requireEditorOrAdmin();
    const supabase = createAdminClient();
    const found = await findBlogPostId(supabase, idOrSlug);
    if (!found.id) return { success: false, error: found.error || "Blog post not found" };

    const { data: post, error } = await supabase
      .from("blog_posts")
      .select(`
        id,
        category_id,
        status,
        featured,
        published_at,
        cover_media_id,
        cover_media:media_assets!cover_media_id(public_url),
        blog_post_translations (
          locale,
          slug,
          title,
          excerpt,
          body_json,
          seo_title,
          seo_description
        )
      `)
      .eq("id", found.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !post) return { success: false, error: error?.message || "Blog post not found" };

    const translations = Array.isArray(post.blog_post_translations)
      ? post.blog_post_translations
      : [];
    const viTrans = translations.find((translation) => translation.locale === "vi");
    const enTrans = translations.find((translation) => translation.locale === "en");

    const coverMediaRecord = post.cover_media as Record<string, any> | null | undefined;

    return {
      success: true,
      data: {
        id: post.id,
        slug: localizedText(viTrans?.slug, localizedText(enTrans?.slug)),
        title_vi: localizedText(viTrans?.title),
        title_en: localizedText(enTrans?.title),
        excerpt_vi: localizedText(viTrans?.excerpt),
        excerpt_en: localizedText(enTrans?.excerpt),
        body_json_vi: bodyJsonToEditorText(viTrans?.body_json),
        body_json_en: bodyJsonToEditorText(enTrans?.body_json),
        category_id: post.category_id,
        status: post.status as "draft" | "published" | "archived",
        featured: Boolean(post.featured),
        published_at: (post as any).published_at || null,
        seo_title_vi: localizedText(viTrans?.seo_title),
        seo_title_en: localizedText(enTrans?.seo_title),
        seo_description_vi: localizedText(viTrans?.seo_description),
        seo_description_en: localizedText(enTrans?.seo_description),
        cover_image: coverMediaRecord?.public_url || "",
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Database error" };
  }
}

export async function createAdminBlogPost(data: BlogPostInput): Promise<{ success: boolean; id?: string; error?: string }> {
  const user = await requireEditorOrAdmin();
  const validation = blogPostSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validationMessages(validation.error.issues) };
  }

  const values = validation.data;

  const supabase = createAdminClient();
  const category = await resolveBlogCategoryId(supabase, values.category_id);
  if (!category.id) return { success: false, error: category.error };

  if (values.status === "published" && values.featured && (await wouldExceedFeaturedCap(supabase))) {
    return { success: false, error: `Đã đạt giới hạn ${FEATURED_POST_CAP} bài viết nổi bật. Hãy bỏ nổi bật một bài khác trước.` };
  }

  try {
    const coverMediaId = await getOrCreateMediaAssetId(supabase, values.cover_image, user.id);
    const initialStatus = values.status === "published" ? "draft" : values.status;
    const { data: post, error: postError } = await supabase
      .from("blog_posts")
      .insert({
        category_id: category.id,
        author_id: user.id,
        cover_media_id: coverMediaId,
        status: initialStatus,
        featured: values.featured,
        created_by: user.id,
        updated_by: user.id,
        published_at: null,
        deleted_at: initialStatus === "archived" ? new Date().toISOString() : null,
      })
      .select("id")
      .single();

    if (postError || !post) {
      return { success: false, error: postError?.message || "Failed to create blog post" };
    }

    const buildTranslations = (slug: string) => [
      {
        post_id: post.id,
        locale: "vi",
        slug,
        title: values.title_vi,
        excerpt: values.excerpt_vi,
        body_json: bodyJsonFromEditor(values.body_json_vi, values.title_vi),
        seo_title: values.seo_title_vi,
        seo_description: values.seo_description_vi,
      },
      {
        post_id: post.id,
        locale: "en",
        slug,
        title: values.title_en || values.title_vi,
        excerpt: values.excerpt_en || values.excerpt_vi,
        body_json: bodyJsonFromEditor(values.body_json_en || values.body_json_vi, values.title_en || values.title_vi),
        seo_title: values.seo_title_en || values.seo_title_vi,
        seo_description: values.seo_description_en || values.seo_description_vi,
      },
    ];

    // The (locale, slug) unique index is global with no soft-delete predicate, so a
    // duplicate title — or a slug left by a soft-deleted post — would collide. Retry
    // with a short suffix instead of hard-failing on a duplicate-key error.
    let slug = values.slug;
    let transError: { message: string } | null = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      const { error } = await supabase.from("blog_post_translations").insert(buildTranslations(slug));
      transError = error;
      if (!error) break;
      const isDuplicate = /duplicate key|unique constraint/i.test(error.message || "");
      if (!isDuplicate || attempt === 3) break;
      slug = `${values.slug}-${Math.random().toString(36).slice(2, 6)}`;
    }
    if (transError) {
      await supabase.from("blog_posts").delete().eq("id", post.id);
      return { success: false, error: transError.message };
    }

    if (values.status === "published") {
      const { error: publishError } = await supabase
        .from("blog_posts")
        .update({
          status: "published",
          published_at: toIsoOrNull(values.published_at) || new Date().toISOString(),
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", post.id);

      if (publishError) {
        await supabase.from("blog_posts").delete().eq("id", post.id);
        return { success: false, error: publishError.message };
      }
    }

    try {
      await writeAuditLog(supabase, {
        actorId: user.id,
        action: "create",
        entityType: "blog_post",
        entityId: post.id,
        metadata: { title: values.title_vi, slug },
      });
    } catch (auditError) {
      await supabase.from("blog_posts").delete().eq("id", post.id);
      return { success: false, error: auditError instanceof Error ? auditError.message : "Audit logging failed" };
    }

    triggerRevalidation();
    return { success: true, id: post.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function updateAdminBlogPost(id: string, data: BlogPostInput): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();
  const validation = blogPostSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validationMessages(validation.error.issues) };
  }

  const values = validation.data;

  const supabase = createAdminClient();
  const category = await resolveBlogCategoryId(supabase, values.category_id);
  if (!category.id) return { success: false, error: category.error };

  if (values.status === "published" && values.featured && (await wouldExceedFeaturedCap(supabase, id))) {
    return { success: false, error: `Đã đạt giới hạn ${FEATURED_POST_CAP} bài viết nổi bật. Hãy bỏ nổi bật một bài khác trước.` };
  }

  try {
    const translations = [
      {
        post_id: id,
        locale: "vi",
        slug: values.slug,
        title: values.title_vi,
        excerpt: values.excerpt_vi,
        body_json: bodyJsonFromEditor(values.body_json_vi, values.title_vi),
        seo_title: values.seo_title_vi,
        seo_description: values.seo_description_vi,
        updated_at: new Date().toISOString(),
      },
      {
        post_id: id,
        locale: "en",
        slug: values.slug,
        title: values.title_en || values.title_vi,
        excerpt: values.excerpt_en || values.excerpt_vi,
        body_json: bodyJsonFromEditor(values.body_json_en || values.body_json_vi, values.title_en || values.title_vi),
        seo_title: values.seo_title_en || values.seo_title_vi,
        seo_description: values.seo_description_en || values.seo_description_vi,
        updated_at: new Date().toISOString(),
      },
    ];

    const { error: transError } = await supabase
      .from("blog_post_translations")
      .upsert(translations, { onConflict: "post_id,locale" });

    if (transError) return { success: false, error: transError.message };

    const coverMediaId = await getOrCreateMediaAssetId(supabase, values.cover_image, user.id);
    const { error: postError } = await supabase
      .from("blog_posts")
      .update({
        category_id: category.id,
        cover_media_id: coverMediaId,
        status: values.status,
        featured: values.featured,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
        published_at: values.status === "published"
          ? (toIsoOrNull(values.published_at) || new Date().toISOString())
          : null,
        deleted_at: values.status === "archived" ? new Date().toISOString() : null,
      })
      .eq("id", id);

    if (postError) return { success: false, error: postError.message };

    await writeAuditLog(supabase, {
      actorId: user.id,
      action: values.status === "archived" ? "archive" : "update",
      entityType: "blog_post",
      entityId: id,
      metadata: { title: values.title_vi, slug: values.slug },
    });

    triggerRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function deleteAdminBlogPost(id: string): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("blog_posts")
      .update({
        status: "archived",
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    // Free the (locale, slug) namespace so a future post can reuse this slug
    // (blog_post_translations unique index has no soft-delete predicate).
    const { data: archivedTrans } = await supabase
      .from("blog_post_translations")
      .select("locale, slug")
      .eq("post_id", id);
    if (archivedTrans) {
      for (const t of archivedTrans as { locale: string; slug: string }[]) {
        if (t.slug && !t.slug.includes("-deleted-")) {
          await supabase
            .from("blog_post_translations")
            .update({ slug: `${t.slug}-deleted-${id.slice(0, 8)}` })
            .eq("post_id", id)
            .eq("locale", t.locale);
        }
      }
    }

    await writeAuditLog(supabase, {
      actorId: user.id,
      action: "archive",
      entityType: "blog_post",
      entityId: id,
    });

    triggerRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function updateBlogPostFeatured(id: string, featured: boolean): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();
  try {
    const supabase = createAdminClient();

    if (featured) {
      const { data: post } = await supabase.from("blog_posts").select("status").eq("id", id).maybeSingle();
      if (post?.status === "published" && (await wouldExceedFeaturedCap(supabase, id))) {
        return { success: false, error: `Đã đạt giới hạn ${FEATURED_POST_CAP} bài viết nổi bật. Hãy bỏ nổi bật một bài khác trước.` };
      }
    }

    const { error } = await supabase
      .from("blog_posts")
      .update({
        featured,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    await writeAuditLog(supabase, {
      actorId: user.id,
      action: "update",
      entityType: "blog_post",
      entityId: id,
      metadata: { featured },
    });
    triggerRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function updateBlogPostStatus(id: string, status: string): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();
  try {
    const supabase = createAdminClient();

    if (status === "published") {
      const { data: post } = await supabase.from("blog_posts").select("featured, cover_media_id").eq("id", id).maybeSingle();
      if (!post?.cover_media_id) {
        return { success: false, error: "Cần có ảnh bìa trước khi xuất bản bài viết." };
      }
      if (post.featured && (await wouldExceedFeaturedCap(supabase, id))) {
        return { success: false, error: `Đã đạt giới hạn ${FEATURED_POST_CAP} bài viết nổi bật. Hãy bỏ nổi bật một bài khác trước.` };
      }
    }

    const updateObj: any = {
      status,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };
    if (status === "published") {
      updateObj.published_at = new Date().toISOString();
    }
    const { error } = await supabase
      .from("blog_posts")
      .update(updateObj)
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    await writeAuditLog(supabase, {
      actorId: user.id,
      action: "update",
      entityType: "blog_post",
      entityId: id,
      metadata: { status },
    });
    triggerRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}