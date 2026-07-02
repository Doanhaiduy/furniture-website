"use server";

import { createAdminClient } from "../server";
import { requireEditorOrAdmin } from "../auth";
import { writeAuditLog } from "../audit";

export async function updateQuoteAssignee(id: string, assignedTo: string | null): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("quote_requests")
      .update({
        assigned_to: assignedTo || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    await writeAuditLog(supabase, {
      actorId: user.id,
      action: "update",
      entityType: "quote",
      entityId: id,
      metadata: { assignedTo },
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function updateQuoteSalesNotes(id: string, salesNotes: string | null): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("quote_requests")
      .update({
        sales_notes: salesNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function updateQuoteAdminNotes(id: string, adminNotes: string | null): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("quote_requests")
      .update({
        admin_notes: adminNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}
