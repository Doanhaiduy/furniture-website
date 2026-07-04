import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/supabase/audit";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: Request) {
  try {
    const actor = await getCurrentUser();
    if (!actor || actor.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, password } = body as { id?: string; password?: string };

    if (!id || typeof password !== "string") {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Mật khẩu phải có tối thiểu ${MIN_PASSWORD_LENGTH} ký tự` },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase.auth.admin.updateUserById(id, { password });
    if (error) {
      console.error("Reset password error:", error);
      return NextResponse.json({ error: error.message || "Không thể đặt lại mật khẩu" }, { status: 400 });
    }

    try {
      await writeAuditLog(supabase, {
        actorId: actor.id,
        action: "update",
        entityType: "profile",
        entityId: id,
        metadata: { action: "reset_password" },
      });
    } catch (auditErr) {
      console.warn("Audit log failed for password reset, continuing anyway:", auditErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reset password route error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
