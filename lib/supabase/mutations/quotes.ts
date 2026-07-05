"use server";

import { createAdminClient } from "../server";
import { requireAdmin } from "../auth";
import { writeAuditLog } from "../audit";

export async function updateQuoteAssignee(id: string, assignedTo: string | null): Promise<{ success: boolean; error?: string }> {
  // Quote leads are private admin-only data (RLS is_admin, UI gates to admin), and
  // these run on the service-role client which bypasses RLS — so the guard must be
  // admin-only, otherwise an editor could read/modify/delete customer lead PII.
  const user = await requireAdmin();
  try {
    const supabase = createAdminClient();

    // Guard (BL-QUOTE-01): a lead may only be assigned to a staff member who can still
    // act on it. Reject assignment to an inactive or soft-deleted profile so leads are
    // never routed into a black hole.
    if (assignedTo) {
      const { data: assignee } = await supabase
        .from("profiles")
        .select("id, is_active, deleted_at")
        .eq("id", assignedTo)
        .maybeSingle();
      if (!assignee || !assignee.is_active || assignee.deleted_at) {
        return { success: false, error: "Không thể phân công cho nhân sự đã bị khóa hoặc không còn hoạt động." };
      }
    }

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
  // Quote leads are private admin-only data (RLS is_admin, UI gates to admin), and
  // these run on the service-role client which bypasses RLS — so the guard must be
  // admin-only, otherwise an editor could read/modify/delete customer lead PII.
  const user = await requireAdmin();
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
  // Quote leads are private admin-only data (RLS is_admin, UI gates to admin), and
  // these run on the service-role client which bypasses RLS — so the guard must be
  // admin-only, otherwise an editor could read/modify/delete customer lead PII.
  const user = await requireAdmin();
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

// Item 4.5: soft-delete/archive a quote request so admins can clean up spam/test
// leads. quote_requests.deleted_at already exists and admin_quote_search already
// filters deleted_at IS NULL — this was previously the only entity with no delete
// path from the CMS.
export async function deleteAdminQuote(id: string): Promise<{ success: boolean; error?: string }> {
  // Quote leads are private admin-only data (RLS is_admin, UI gates to admin), and
  // these run on the service-role client which bypasses RLS — so the guard must be
  // admin-only, otherwise an editor could read/modify/delete customer lead PII.
  const user = await requireAdmin();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("quote_requests")
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    await writeAuditLog(supabase, {
      actorId: user.id,
      action: "archive",
      entityType: "quote",
      entityId: id,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}