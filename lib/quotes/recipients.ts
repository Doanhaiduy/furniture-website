import "server-only";

import { createAdminClient } from "@/lib/supabase/server";

export async function getQuoteRecipients() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("quote_recipients")
    .select("email, label")
    .eq("is_active", true)
    .limit(20);

  if (error || !data || data.length === 0) {
    const fallback = process.env.QUOTE_NOTIFICATION_RECIPIENTS;
    if (!fallback) return [];
    return fallback
      .split(",")
      .map((email) => ({ email: email.trim(), label: email.trim() }))
      .filter((r) => r.email.length > 0);
  }

  return data;
}
