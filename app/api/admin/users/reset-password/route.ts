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

    // 1. Fetch profile to know email and details
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("id", id)
      .maybeSingle();

    // 2. Try direct update by id
    const { error: directUpdateError } = await supabase.auth.admin.updateUserById(id, { password });

    if (directUpdateError) {
      console.warn("Direct updateUserById failed, attempting email-based sync:", directUpdateError.message);
      
      if (profile?.email) {
        const { data: userList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
        const authUser = userList?.users?.find(
          (u) => u.email?.toLowerCase() === profile.email.toLowerCase()
        );

        if (authUser) {
          const { error: authUpdateError } = await supabase.auth.admin.updateUserById(authUser.id, {
            password,
          });
          if (authUpdateError) {
            console.error("Auth updateUserById by email error:", authUpdateError);
            return NextResponse.json({ error: authUpdateError.message || "Không thể đặt lại mật khẩu" }, { status: 400 });
          }
        } else {
          // User exists in profiles but not yet in auth.users (seed user) -> create in auth.users
          const { error: createError } = await supabase.auth.admin.createUser({
            id: profile.id,
            email: profile.email,
            password,
            email_confirm: true,
            user_metadata: { full_name: profile.full_name || profile.email },
          });
          if (createError) {
            console.error("Auth createUser fallback error:", createError);
            return NextResponse.json({ error: createError.message || "Không thể tạo tài khoản xác thực mới" }, { status: 400 });
          }
        }
      } else {
        console.error("Reset password error:", directUpdateError);
        return NextResponse.json({ error: directUpdateError.message || "Không thể đặt lại mật khẩu" }, { status: 400 });
      }
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
