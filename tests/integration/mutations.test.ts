import { describe, it, expect, vi } from "vitest";

// Mock server-only
vi.mock("server-only", () => ({}));

// Mock env from schema
vi.mock("@/lib/env/schema", () => {
  const fs = require("fs");
  const path = require("path");
  const localEnv: Record<string, string> = {};
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line: string) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        localEnv[key] = value.trim();
        process.env[key] = value.trim();
      }
    });
  }
  return {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: localEnv.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: localEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: localEnv.SUPABASE_SERVICE_ROLE_KEY,
    },
    validateEnv: () => ({}),
  };
});

import { createAdminClient } from "@/lib/supabase/server";
import {
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  createAdminBlogPost,
  updateAdminBlogPost,
  deleteAdminBlogPost
} from "@/lib/supabase/mutations";

// Mock requireEditorOrAdmin to bypass API-level auth
vi.mock("@/lib/supabase/auth", () => ({
  requireEditorOrAdmin: vi.fn().mockResolvedValue({ id: "00000000-0000-0000-0000-000000000001", email: "test-editor@furniture.com" }),
}));

// Mock createClient to return the admin client (which bypasses RLS in local testing)
vi.mock("@/lib/supabase/server", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/supabase/server")>();
  return {
    ...original,
    createClient: () => original.createAdminClient(),
  };
});

import { beforeEach, afterAll } from "vitest";

async function cleanDb() {
  const supabase = createAdminClient();
  
  // Delete test products
  const { data: prods } = await supabase
    .from("products")
    .select("id")
    .or("reference_code.eq.INT-TEST-001,reference_code.like.INT-TEST-%");
  if (prods && prods.length > 0) {
    const prodIds = prods.map(p => p.id);
    await supabase.from("product_media").delete().in("product_id", prodIds);
    await supabase.from("product_translations").delete().in("product_id", prodIds);
    await supabase.from("product_promotions").delete().in("product_id", prodIds);
    await supabase.from("products").delete().in("id", prodIds);
  }

  // Delete test categories
  const { data: cats } = await supabase
    .from("product_category_translations")
    .select("category_id")
    .or("slug.eq.test-integration-cat,slug.eq.temp-product-link-cat");
  if (cats && cats.length > 0) {
    const catIds = cats.map(c => c.category_id);
    await supabase.from("product_category_translations").delete().in("category_id", catIds);
    await supabase.from("product_categories").delete().in("id", catIds);
  }

  // Delete test blog posts
  const { data: posts } = await supabase
    .from("blog_post_translations")
    .select("post_id")
    .eq("slug", "test-blog-post-lifecycle");
  if (posts && posts.length > 0) {
    const postIds = posts.map(p => p.post_id);
    await supabase.from("blog_post_translations").delete().in("post_id", postIds);
    await supabase.from("blog_posts").delete().in("id", postIds);
  }
}

describe("Admin Content Mutations Integration Tests", () => {
  beforeEach(async () => {
    await cleanDb();
  });

  afterAll(async () => {
    await cleanDb();
  });
  it("should successfully execute CRUD lifecycle for Categories", async () => {
    const catInput = {
      slug: "test-integration-cat",
      name_vi: "Danh mục liên kết",
      name_en: "Integration Category",
      description_vi: "Danh mục dùng cho kiểm thử liên kết",
      description_en: "Category used for integration tests",
      parent_id: null,
      group_key: "wood" as const,
      status: "published" as const,
      sort_order: 1,
      cover_image: null,
      seo_title_vi: "SEO Danh mục",
      seo_title_en: "SEO Category",
      seo_description_vi: "SEO Mô tả",
      seo_description_en: "SEO Description",
    };

    // 1. Create
    const createResult = await createAdminCategory(catInput);
    if (!createResult.success) {
      console.error("CREATE CATEGORY ERROR:", createResult.error);
    }
    expect(createResult.success).toBe(true);
    expect(createResult.id).toBeDefined();
    const catId = createResult.id!;

    // Verify DB state
    const supabase = createAdminClient();
    const { data: catRow, error: fetchErr } = await supabase
      .from("product_categories")
      .select("*")
      .eq("id", catId)
      .single();
    
    expect(fetchErr).toBeNull();
    expect(catRow).toBeDefined();
    expect(catRow.group_key).toBe("wooden_furniture");
    expect(catRow.status).toBe("published");

    // 2. Update
    const updateInput = {
      ...catInput,
      name_vi: "Danh mục liên kết cập nhật",
      sort_order: 5,
    };
    const updateResult = await updateAdminCategory(catId, updateInput);
    expect(updateResult.success).toBe(true);

    const { data: updatedCatRow } = await supabase
      .from("product_categories")
      .select("sort_order")
      .eq("id", catId)
      .single();
    if (!updatedCatRow) throw new Error("updatedCatRow is null");
    expect(updatedCatRow.sort_order).toBe(5);

    // 3. Delete
    const deleteResult = await deleteAdminCategory(catId);
    expect(deleteResult.success).toBe(true);

    const { data: deletedRow } = await supabase
      .from("product_categories")
      .select("deleted_at")
      .eq("id", catId)
      .single();
    if (!deletedRow) throw new Error("deletedRow is null");
    expect(deletedRow.deleted_at).not.toBeNull();
  });

  it("should successfully execute CRUD lifecycle for Products", async () => {
    const supabase = createAdminClient();

    // 1. Create a category to link the product to
    const createCatResult = await createAdminCategory({
      slug: "temp-product-link-cat",
      name_vi: "Danh mục tạm thời",
      name_en: "Temporary Category",
      status: "published",
      sort_order: 1,
    });
    if (!createCatResult.success) {
      console.error("CREATE PRODUCT CAT ERROR:", createCatResult.error);
    }
    expect(createCatResult.success).toBe(true);
    const catId = createCatResult.id!;

    // 2. Create Product
    const productInput = {
      reference_code: "INT-TEST-001",
      slug: "temp-product-integration-test",
      name_vi: "Sản phẩm kiểm thử liên kết",
      name_en: "Integration Test Product",
      summary_vi: "Tóm tắt sản phẩm kiểm thử",
      summary_en: "Test product summary",
      category_id: catId,
      currency: "VND",
      price_min: 500000,
      price_max: 1000000,
      status: "published" as const,
      featured: true,
      cover_image: null,
      gallery_images: [],
    };

    const createProdResult = await createAdminProduct(productInput);
    if (!createProdResult.success) {
      console.error("CREATE PRODUCT ERROR:", createProdResult.error);
    }
    expect(createProdResult.success).toBe(true);
    expect(createProdResult.id).toBeDefined();
    const prodId = createProdResult.id!;

    // Verify DB
    const { data: prodRow } = await supabase
      .from("products")
      .select("*")
      .eq("id", prodId)
      .single();
    expect(prodRow).toBeDefined();
    expect(prodRow.reference_code).toBe("INT-TEST-001");

    // 3. Update Product
    const updateInput = {
      ...productInput,
      price_max: 1200000,
      featured: false,
    };
    const updateResult = await updateAdminProduct(prodId, updateInput);
    expect(updateResult.success).toBe(true);

    const { data: updatedProdRow } = await supabase
      .from("products")
      .select("price_max, featured")
      .eq("id", prodId)
      .single();
    if (!updatedProdRow) throw new Error("updatedProdRow is null");
    expect(updatedProdRow.price_max).toBe(1200000);
    expect(updatedProdRow.featured).toBe(false);

    // 4. Delete Product
    const deleteResult = await deleteAdminProduct(prodId);
    expect(deleteResult.success).toBe(true);

    const { data: deletedProd } = await supabase
      .from("products")
      .select("deleted_at")
      .eq("id", prodId)
      .single();
    if (!deletedProd) throw new Error("deletedProd is null");
    expect(deletedProd.deleted_at).not.toBeNull();

    // 5. Clean up Category
    await deleteAdminCategory(catId);
  });

  it("should successfully execute CRUD lifecycle for Blog Posts", async () => {
    const supabase = createAdminClient();

    // Check / ensure blog category exists
    let blogCatId: string;
    const { data: existingBlogCat } = await supabase
      .from("blog_category_translations")
      .select("category_id")
      .eq("slug", "wood-knowledge")
      .limit(1)
      .maybeSingle();

    if (existingBlogCat?.category_id) {
      blogCatId = existingBlogCat.category_id;
    } else {
      // Insert one
      const { data: newCat } = await supabase
        .from("blog_categories")
        .insert({ status: "draft", sort_order: 1 })
        .select("id")
        .single();
      blogCatId = newCat!.id;

      await supabase
        .from("blog_category_translations")
        .insert([
          { category_id: blogCatId, locale: "vi", slug: "wood-knowledge", name: "Kiến thức đồ gỗ" },
          { category_id: blogCatId, locale: "en", slug: "wood-knowledge", name: "Wood knowledge" }
        ]);

      await supabase
        .from("blog_categories")
        .update({ status: "published" })
        .eq("id", blogCatId);
    }

    // 2. Create Blog Post
    const blogPostInput = {
      slug: "test-blog-post-lifecycle",
      title_vi: "Bài viết kiểm thử liên kết",
      title_en: "Integration Test Blog Post",
      excerpt_vi: "Trích dẫn kiểm thử liên kết",
      excerpt_en: "Test blog post excerpt description",
      category_id: "wood-knowledge", // The slug
      status: "published" as const,
      featured: true,
      cover_image: null,
    };

    const createBlogResult = await createAdminBlogPost(blogPostInput);
    expect(createBlogResult.success).toBe(true);
    expect(createBlogResult.id).toBeDefined();
    const blogPostId = createBlogResult.id!;

    // Verify DB
    const { data: postRow } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", blogPostId)
      .single();
    expect(postRow).toBeDefined();
    expect(postRow.featured).toBe(true);

    // 3. Update Blog Post
    const updateInput = {
      ...blogPostInput,
      featured: false,
      title_vi: "Bài viết kiểm thử liên kết cập nhật",
    };
    const updateResult = await updateAdminBlogPost(blogPostId, updateInput);
    expect(updateResult.success).toBe(true);

    const { data: updatedPostRow } = await supabase
      .from("blog_posts")
      .select("featured")
      .eq("id", blogPostId)
      .single();
    if (!updatedPostRow) throw new Error("updatedPostRow is null");
    expect(updatedPostRow.featured).toBe(false);

    // 4. Delete Blog Post
    const deleteResult = await deleteAdminBlogPost(blogPostId);
    expect(deleteResult.success).toBe(true);

    // Soft delete check
    const { data: deletedPostRow } = await supabase
      .from("blog_posts")
      .select("deleted_at")
      .eq("id", blogPostId)
      .single();
    if (!deletedPostRow) throw new Error("deletedPostRow is null");
    expect(deletedPostRow.deleted_at).not.toBeNull();

    // Clean up completely
    await supabase.from("blog_post_translations").delete().eq("post_id", blogPostId);
    await supabase.from("blog_posts").delete().eq("id", blogPostId);
  });
});
