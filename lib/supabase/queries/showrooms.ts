import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Fetch localized showrooms list using the public RPC function, with automatic mock fallback.
 */
export async function getShowrooms(
  supabase: SupabaseClient,
  locale: "vi" | "en" = "vi"
) {
  try {
    const { data, error } = await supabase.rpc("public_showrooms", {
      p_locale: locale,
    });

    if (!error && data && data.length > 0) {
      return data;
    }
    if (error) {
      console.warn("Error fetching showrooms via RPC, falling back to mock:", error);
    }
  } catch (e) {
    console.warn("Exception fetching showrooms, falling back to mock:", e);
  }

  return [];
}
