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

    // Fetch user profile email and role
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, role, is_active, deleted_at")
      .eq("id", id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: "Người dùng không tồn tại." }, { status: 404 });
    }

    // Last-admin guard
    if (profile.role === "admin" && profile.is_active && !profile.deleted_at) {
      const { count } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin")
        .eq("is_active", true)
        .is("deleted_at", null)
        .neq("id", id);

      if ((count ?? 0) === 0) {
        return NextResponse.json(
          { error: "Không thể xóa quản trị viên cuối cùng của hệ thống." },
          { status: 400 }
        );
      }
    }

    // Reassign foreign key restricted records to actor before deletion so deletion never fails
    // 1. Reassign blog posts author_id to the acting admin
    await supabase
      .from("blog_posts")
      .update({ author_id: actor.id })
      .eq("author_id", id);

    // 2. Reassign ai_drafts requested_by to the acting admin
    await supabase
      .from("ai_drafts")
      .update({ requested_by: actor.id })
      .eq("requested_by", id);

    // 3. Delete user from profiles table
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
