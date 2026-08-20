import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/supabase/audit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !token || !password) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp đầy đủ thông tin yêu cầu." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải có tối thiểu 8 ký tự." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Look up token in database
    const { data: tokenRecord, error: tokenError } = await supabase
      .from("password_reset_tokens")
      .select("id, user_id, email, expires_at, used_at")
      .eq("email", email)
      .eq("token_hash", tokenHash)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tokenError || !tokenRecord) {
      return NextResponse.json(
        { error: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn (chỉ có hiệu lực trong 15 phút)." },
        { status: 400 }
      );
    }

    // Update password in Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      tokenRecord.user_id,
      { password }
    );

    if (updateError) {
      console.error("[Reset Password] Failed to update user password in Auth:", updateError);
      return NextResponse.json(
        { error: "Không thể cập nhật mật khẩu. Vui lòng thử lại sau." },
        { status: 500 }
      );
    }

    // Mark token as used
    await supabase
      .from("password_reset_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", tokenRecord.id);

    // Audit log
    try {
      await writeAuditLog(supabase, {
        actorId: tokenRecord.user_id,
        action: "update",
        entityType: "profile",
        entityId: tokenRecord.user_id,
        metadata: { action: "password_reset_via_email", email },
      });
    } catch (auditErr) {
      console.warn("Audit log failed for password reset, continuing:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.",
    });
  } catch (err) {
    console.error("Reset password API error:", err);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
