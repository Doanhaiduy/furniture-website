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

  // Both editor and admin can check products for translations
  try {
    const { count: prodCount, error: prodError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .or("name_en.is.null,description_en.is.null");
    
    if (!prodError && prodCount !== null) {
      missingTranslationsCount = prodCount;
    }
  } catch (e) {
    console.error("Failed to fetch missing translations count:", e);
  }

  return NextResponse.json({
    unreadQuotesCount,
    missingTranslationsCount,
  });
}
