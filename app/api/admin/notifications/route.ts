import { NextResponse } from "next/server";
import { requireEditorOrAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  let user;
  try {
    user = await requireEditorOrAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // SECURITY: Authentication is enforced above via requireEditorOrAdmin().
  // We use the service-role client here (bypasses RLS) because the regular
  // anon+session client relies on auth.uid() resolving inside the RLS policy
  // (is_admin()), which can silently return 0 rows — not an error — when the
  // session cookie is not forwarded correctly in the API route context.
  // This is consistent with how getAdminQuotesList() works in admin-queries/quotes.ts.
  const supabase = createAdminClient();

  let unreadQuotesCount = 0;
  let missingTranslationsCount = 0;
  let recentQuotes: any[] = [];
  let recentMissingTranslations: any[] = [];

  // Only admin can access quotes
  if (user.role === "admin") {
    try {
      const { count, error: quoteCountError } = await supabase
        .from("quote_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "new")
        .is("deleted_at", null);

      if (quoteCountError) {
        console.error("[notifications] quote count error:", quoteCountError.message);
      } else if (count !== null) {
        unreadQuotesCount = count;
      }

      const { data: quotesData, error: quotesError } = await supabase
        .from("quote_requests")
        .select("id, full_name, created_at, status")
        .eq("status", "new")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(5);

      if (quotesError) {
        console.error("[notifications] recent quotes error:", quotesError.message);
      } else if (quotesData) {
        recentQuotes = quotesData;
      }
    } catch (e) {
      console.error("[notifications] Failed to fetch quotes:", e);
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

    if (totalError) {
      console.error("[notifications] total products error:", totalError.message);
    } else if (translatedError) {
      console.error("[notifications] translated products error:", translatedError.message);
    } else if (totalProducts !== null && translatedProducts !== null) {
      missingTranslationsCount = Math.max(0, totalProducts - translatedProducts);
    }

    const { data: missingProductsData, error: missingError } = await supabase
      .from("products")
      .select(`
        id,
        created_at,
        product_translations (
          locale,
          name
        )
      `)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (missingError) {
      console.error("[notifications] missing translations query error:", missingError.message);
    } else if (missingProductsData) {
      recentMissingTranslations = missingProductsData
        .filter((p: any) => {
          const locales = Array.isArray(p.product_translations)
            ? p.product_translations.map((t: any) => t.locale)
            : [];
          return !locales.includes("en");
        })
        .slice(0, 5)
        .map((p: any) => {
          const translations = Array.isArray(p.product_translations) ? p.product_translations : [];
          const viTranslation = translations.find((t: any) => t.locale === "vi");
          const name = viTranslation?.name || translations[0]?.name || "Sản phẩm không tên";
          return {
            id: p.id,
            name,
            created_at: p.created_at,
          };
        });
    }
  } catch (e) {
    console.error("[notifications] Failed to fetch missing translations:", e);
  }

  return NextResponse.json({
    unreadQuotesCount,
    missingTranslationsCount,
    recentQuotes,
    recentMissingTranslations,
  });
}