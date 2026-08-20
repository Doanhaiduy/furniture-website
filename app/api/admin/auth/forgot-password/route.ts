import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { sendPasswordResetEmail } from "@/lib/email/password-reset";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Vui lòng nhập địa chỉ email hợp lệ." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Find profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name, is_active, role")
      .eq("email", email)
      .maybeSingle();

    if (profileError) {
      console.error("[Forgot Password] DB error looking up profile:", profileError);
      return NextResponse.json(
        { error: "Lỗi kết nối cơ sở dữ liệu khi kiểm tra tài khoản." },
        { status: 500 }
      );
    }

    // Require email to exist in system and be active
    if (!profile) {
      return NextResponse.json(
        { error: `Địa chỉ email "${email}" không tồn tại trong danh sách tài khoản quản trị viên.` },
        { status: 400 }
      );
    }

    if (!profile.is_active) {
      return NextResponse.json(
        { error: `Tài khoản gắn với email "${email}" hiện đang bị tạm khóa hoặc vô hiệu hóa. Vui lòng liên hệ quản trị viên cấp cao.` },
        { status: 403 }
      );
    }

    // Clean up old unused tokens for this user
    await supabase
      .from("password_reset_tokens")
      .delete()
      .eq("user_id", profile.id);

    // Generate secure token (32 bytes hex)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    // Insert token into database
    const { error: insertError } = await supabase
      .from("password_reset_tokens")
      .insert({
        user_id: profile.id,
        email: profile.email,
        token_hash: tokenHash,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error("[Forgot Password] Failed to record reset token:", insertError);
      return NextResponse.json(
        { error: "Không thể tạo mã xác thực đặt lại mật khẩu. Vui lòng thử lại sau." },
        { status: 500 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://showroomnoithatphuongdong.com.vn";
    const resetUrl = `${siteUrl}/admin/reset-password?token=${rawToken}&email=${encodeURIComponent(profile.email)}`;

    const sendResult = await sendPasswordResetEmail({
      toEmail: profile.email,
      recipientName: profile.full_name || profile.email,
      resetUrl,
    });

    if (!sendResult.success) {
      return NextResponse.json(
        { error: sendResult.error || "Không thể gửi email qua dịch vụ Brevo SMTP. Vui lòng kiểm tra lại cấu hình gửi mail." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Liên kết đặt lại mật khẩu đã được gửi thành công đến hòm thư ${profile.email}.`,
    });
  } catch (err) {
    console.error("Forgot password API error:", err);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
