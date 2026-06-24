import { createAdminClient } from "./server";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Inserts a log entry into the audit_logs table.
 * If this insert fails, it throws an error to ensure calling database transactions
 * can be rolled back.
 */
export async function writeAuditLog(
  supabase: SupabaseClient,
  params: {
    actorId: string | null;
    action: "create" | "update" | "delete" | "archive" | "unarchive";
    entityType: string;
    entityId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: Record<string, any> | null;
  }
) {
  const { actorId, action, entityType, entityId, metadata } = params;
  
  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("audit_logs")
    .insert({
      actor_id: actorId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata: metadata || {},
    });

  if (error) {
    console.error(`[AUDIT ERROR] Failed to write audit log for ${entityType} ${entityId}:`, error);
    throw new Error(`Audit logging failed: ${error.message}. Transaction aborted.`);
  }
}
export type { SupabaseClient };
