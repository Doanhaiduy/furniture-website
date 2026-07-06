import { NextResponse } from "next/server";
import { requireEditorOrAdmin } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  let user;
  try {
    user = await requireEditorOrAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  let unreadQuotesCount = 0;
  let missingTranslationsCount = 0;

  // Only admin can access quotes
  if (user.role === "admin") {
    try {
      const { count, error: quoteError } = await supabase
        .from("quote_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "new");

      if (!quoteError && count !== null) {
        unreadQuotesCount = count;
      }
    } catch (e) {
      console.error("Failed to fetch unread quotes count:", e);
    }
  }

  // Both editor and admin can check products for translations.
  // Localized text lives in product_translations (one row per locale), not on the
  // products table, so "missing translations" = active products without an `en` row.
  try {
    const { count: totalProducts, error: totalError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);

    const { count: translatedProducts, error: translatedError } = await supabase
      .from("products")
      .select("product_translations!inner(product_id)", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("product_translations.locale", "en");

    if (
      !totalError &&
      !translatedError &&
      totalProducts !== null &&
      translatedProducts !== null
    ) {
      missingTranslationsCount = Math.max(0, totalProducts - translatedProducts);
    }
  } catch (e) {
    console.error("Failed to fetch missing translations count:", e);
  }

  return NextResponse.json({
    unreadQuotesCount,
    missingTranslationsCount,
  });
}
 