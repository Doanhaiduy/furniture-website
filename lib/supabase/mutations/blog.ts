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
  return {
    sections: [
      {
        id: "noi-dung",
        title: fallbackTitle,
        body,
      },
    ],
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

    const translations = [
      {
        post_id: post.id,
        locale: "vi",
        slug: values.slug,
        title: values.title_vi,
        excerpt: values.excerpt_vi,
        body_json: bodyJsonFromEditor(values.body_json_vi, values.title_vi),
        seo_title: values.seo_title_vi,
        seo_description: values.seo_description_vi,
      },
      {
        post_id: post.id,
        locale: "en",
        slug: values.slug,
        title: values.title_en || values.title_vi,
        excerpt: values.excerpt_en || values.excerpt_vi,
        body_json: bodyJsonFromEditor(values.body_json_en || values.body_json_vi, values.title_en || values.title_vi),
        seo_title: values.seo_title_en || values.seo_title_vi,
        seo_description: values.seo_description_en || values.seo_description_vi,
      },
    ];

    const { error: transError } = await supabase.from("blog_post_translations").insert(translations);
    if (transError) {
      await supabase.from("blog_posts").delete().eq("id", post.id);
      return { success: false, error: transError.message };
    }

    if (values.status === "published") {
      const { error: publishError } = await supabase
        .from("blog_posts")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
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
        metadata: { title: values.title_vi, slug: values.slug },
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
        published_at: values.status === "published" ? new Date().toISOString() : null,
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
