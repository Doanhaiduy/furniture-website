import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/supabase/audit";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await getCurrentUser();
    if (!actor || actor.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Do not allow deleting self
    if (id === actor.id) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

        

    const supabase = createAdminClient();

    // Fetch user profile email for audit logs
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", id)
      .maybeSingle();

    // 1. Delete user from profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (profileError) {
      console.error("Profile delete error:", profileError);
      return NextResponse.json({ error: profileError.message || "Failed to delete user profile" }, { status: 400 });
    }

    // 2. Delete user from Supabase Auth via Admin API
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    if (authError) {
      console.error("Auth deleteUser error:", authError);
      // We will log the error but still succeed since the profile record was deleted successfully.
    }

    // 3. Write audit log
    try {
      await writeAuditLog(supabase, {
        actorId: actor.id,
        action: "delete",
        entityType: "profile",
        entityId: id,
        metadata: { email: profile?.email || "unknown" },
      });
    } catch (auditErr) {
      console.warn("Audit log failed for user deletion, continuing anyway:", auditErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE user error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}
