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
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, full_name, is_active, role")
      .eq("email", email)
      .maybeSingle();

    // If profile exists and is active
    if (profile && profile.is_active) {
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

      if (!insertError) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://showroomnoithatphuongdong.com.vn";
        const resetUrl = `${siteUrl}/admin/reset-password?token=${rawToken}&email=${encodeURIComponent(profile.email)}`;

        try {
          await sendPasswordResetEmail({
            toEmail: profile.email,
            recipientName: profile.full_name || profile.email,
            resetUrl,
          });
        } catch (emailErr) {
          console.error("[Forgot Password] Failed to send email via Brevo:", emailErr);
        }
      } else {
        console.error("[Forgot Password] Failed to record reset token:", insertError);
      }
    }

    // Standard response to avoid user enumeration
    return NextResponse.json({
      success: true,
      message: "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi tới hộp thư của bạn.",
    });
  } catch (err) {
    console.error("Forgot password API error:", err);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
