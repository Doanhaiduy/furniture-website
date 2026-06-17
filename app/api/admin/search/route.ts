import { NextResponse, type NextRequest } from "next/server";
import { requireEditorOrAdmin } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface SearchResult {
  type: "product" | "blog" | "category" | "showroom" | "quote";
  id: string;
  title: string;
  subtitle?: string;
  href: string;
}

export async function GET(request: NextRequest) {
  try {
    await requireEditorOrAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const supabase = await createClient();
  const pattern = `%${q}%`;
  const results: SearchResult[] = [];

  // Search products via translations
  try {
    const { data: products } = await supabase
      .from("product_translations")
      .select("slug, name, products!inner(id, status)")
      .ilike("name", pattern)
      .eq("products.status", "published")
      .limit(5);

    if (products) {
      results.push(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...products.map((p: any) => ({
          type: "product" as const,
          id: p.slug,
          title: p.name,
          subtitle: "Sản phẩm",
          href: `/admin/products?edit=${p.slug}`,
        }))
      );
    }
  } catch {
    // Skip on error
  }

  // Search blog posts via translations
  try {
    const { data: blogs } = await supabase
      .from("blog_post_translations")
      .select("slug, title, blog_posts!inner(id, status)")
      .ilike("title", pattern)
      .limit(5);

    if (blogs) {
      results.push(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...blogs.map((b: any) => ({
          type: "blog" as const,
          id: b.slug,
          title: b.title,
          subtitle: "Bài viết",
          href: `/admin/blog?edit=${b.slug}`,
        }))
      );
    }
  } catch {
    // Skip on error
  }

  // Search categories via translations
  try {
    const { data: categories } = await supabase
      .from("product_category_translations")
      .select("name, product_categories!inner(id, slug, status)")
      .ilike("name", pattern)
      .limit(5);

    if (categories) {
      results.push(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...categories.map((c: any) => ({
          type: "category" as const,
          id: c.product_categories.slug,
          title: c.name,
          subtitle: "Danh mục",
          href: `/admin/categories?edit=${c.product_categories.slug}`,
        }))
      );
    }
  } catch {
    // Skip on error
  }

  // Search showrooms via translations
  try {
    const { data: showrooms } = await supabase
      .from("showroom_translations")
      .select("name, address, showrooms!inner(id, code)")
      .ilike("name", pattern)
      .limit(3);

    if (showrooms) {
      results.push(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...showrooms.map((s: any) => ({
          type: "showroom" as const,
          id: s.showrooms.code || s.showrooms.id,
          title: s.name,
          subtitle: s.address,
          href: `/admin/showrooms?edit=${s.showrooms.id}`,
        }))
      );
    }
  } catch {
    // Skip on error
  }

  // Search quotes (admin only - try, skip silently if not admin)
  try {
    const { data: quotes } = await supabase
      .from("quote_requests")
      .select("id, full_name, phone, service, status")
      .or(`full_name.ilike.${pattern},phone.ilike.${pattern}`)
      .is("deleted_at", null)
      .limit(5);

    if (quotes) {
      results.push(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...quotes.map((q: any) => ({
          type: "quote" as const,
          id: q.id,
          title: q.full_name,
          subtitle: `SĐT: ${q.phone} — ${q.service ?? "Tư vấn"}`,
          href: `/admin/quotes?id=${q.id}`,
        }))
      );
    }
  } catch {
    // Skip on error (editor role has no access)
  }

  return NextResponse.json({ results: results.slice(0, 20) });
}
