/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getProducts, getCategories } from "@/lib/supabase/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = (searchParams.get("locale") || "vi") as "vi" | "en";

  try {
    const supabase = createAdminClient();

    // Fetch up to 200 published products
    const rawProducts = await getProducts(supabase, { locale, limit: 200 }).catch(() => []);
    const products = rawProducts
      .filter((p: any) => p.slug)
      .map((p: any) => ({
        slug: p.slug as string,
        name: (typeof p.name === "object" && p.name ? (p.name[locale] || p.name.vi || p.name.en) : (p.name as string)) || p.slug,
        summary: (typeof p.summary === "object" && p.summary ? (p.summary[locale] || p.summary.vi) : p.summary) as string | undefined,
        category_slug: p.category_slug as string | null | undefined,
        category_name: (typeof p.category_name === "object" && p.category_name ? (p.category_name[locale] || p.category_name.vi) : p.category_name) as string | null | undefined,
      }));

    // Fetch categories
    const dbCategories = await getCategories(supabase, locale).catch(() => []);
    const categories = dbCategories
      .filter((c: any) => c.parentId !== null)
      .map((c: any) => ({
        slug: c.slug as string,
        name: c.name as string,
      }));

    return NextResponse.json({ products, categories });
  } catch (error) {
    console.error("Error fetching quote options:", error);
    return NextResponse.json({ products: [], categories: [] }, { status: 500 });
  }
}
