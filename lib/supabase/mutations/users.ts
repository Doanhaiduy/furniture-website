"use server";

import { getCurrentUser } from "../auth";
import { createAdminClient } from "../server";

/**
 * Records the current user's last login timestamp.
 *
 * This runs server-side with the service-role client on purpose: the profiles UPDATE RLS
 * policy (`profiles_update_admin`) only allows admins to write profiles, so the previous
 * client-side `profiles.update({ last_login_at })` in the login page silently failed for
 * EDITORS (0 rows, no error) and their last_login_at was never recorded. The user is
 * identified from their authenticated session — a caller can only stamp their own row.
 */
export async function recordLoginTimestamp(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const supabase = createAdminClient();
  await supabase
    .from("profiles")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", user.id);
}
