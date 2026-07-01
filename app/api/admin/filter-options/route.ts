import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const supabase = createAdminClient();

    switch (type) {
      case "categories": {
        const { data, error } = await supabase
          .from("product_categories")
          .select("id, product_category_translations(locale, name)")
          .is("deleted_at", null)
          .eq("product_category_translations.locale", "vi")
          .order("sort_order", { ascending: true });

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        const options = (data ?? []).map((row) => {
          const trans = Array.isArray(row.product_category_translations)
            ? row.product_category_translations[0]
            : row.product_category_translations;
          return {
            value: row.id,
            label: (trans as { name?: string })?.name ?? row.id,
          };
        });

        return NextResponse.json({ options });
      }

      case "brands": {
        const { data, error } = await supabase
          .from("brands")
          .select("id, brand_translations(locale, name)")
          .is("deleted_at", null)
          .eq("brand_translations.locale", "vi")
          .order("sort_order", { ascending: true });

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        const options = (data ?? []).map((row) => {
          const trans = Array.isArray(row.brand_translations)
            ? row.brand_translations[0]
            : row.brand_translations;
          return {
            value: row.id,
            label: (trans as { name?: string })?.name ?? row.id,
          };
        });

        return NextResponse.json({ options });
      }

      case "blog-categories": {
        const { data, error } = await supabase
          .from("blog_categories")
          .select("id, blog_category_translations(locale, name)")
          .is("deleted_at", null)
          .eq("blog_category_translations.locale", "vi")
          .order("sort_order", { ascending: true });

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        const options = (data ?? []).map((row) => {
          const trans = Array.isArray(row.blog_category_translations)
            ? row.blog_category_translations[0]
            : row.blog_category_translations;
          return {
            value: row.id,
            label: (trans as { name?: string })?.name ?? row.id,
          };
        });

        return NextResponse.json({ options });
      }

      case "admin-users": {
        if (user.role !== "admin") {
          return NextResponse.json({ options: [] });
        }
        const { data, error } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .is("deleted_at", null)
          .eq("is_active", true)
          .order("full_name", { ascending: true });

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        const options = (data ?? []).map((row) => ({
          value: row.id,
          label: row.full_name ?? row.email,
        }));

        return NextResponse.json({ options });
      }

      default:
        return NextResponse.json({ error: "Unknown type" }, { status: 400 });
    }
  } catch (err) {
    console.error("filter-options error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
