import "server-only";
import { getBrevoTransporter } from "@/lib/brevo/client";
import { createAdminClient } from "@/lib/supabase/server";
import { decryptSecret } from "@/lib/security/encryption";
import { env } from "@/lib/env/schema";

export async function sendPasswordResetEmail({
  toEmail,
  recipientName,
  resetUrl,
}: {
  toEmail: string;
  recipientName: string;
  resetUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  let login = env.BREVO_SMTP_LOGIN || process.env.BREVO_SMTP_LOGIN || null;
  let key = env.BREVO_SMTP_KEY || process.env.BREVO_SMTP_KEY || null;
  let sender = env.BREVO_SENDER_EMAIL || process.env.BREVO_SENDER_EMAIL || "showroomnoithatphuongdong@gmail.com";

  // Check integration_secrets in database (AES-GCM encrypted)
  try {
    const supabase = createAdminClient();
    const encryptionKey = env.AI_SECRET_ENCRYPTION_KEY || process.env.AI_SECRET_ENCRYPTION_KEY;
    const { data: smtpSecrets } = await supabase
      .from("integration_secrets")
      .select("key_name, encrypted_value")
      .in("key_name", ["brevo_smtp_login", "brevo_smtp_key"]);

    if (smtpSecrets && encryptionKey) {
      for (const secret of smtpSecrets) {
        try {
          const decrypted = decryptSecret(secret.encrypted_value, encryptionKey);
          if (secret.key_name === "brevo_smtp_login" && decrypted) login = decrypted;
          if (secret.key_name === "brevo_smtp_key" && decrypted) key = decrypted;
        } catch (err) {
          console.error(`[Password Reset] Failed to decrypt ${secret.key_name}:`, err);
        }
      }
    }

    const { data: senderSettings } = await supabase
      .from("site_settings")
      .select("quote_sender_email")
      .limit(1)
      .maybeSingle();

    if (senderSettings?.quote_sender_email?.trim()) {
      sender = senderSettings.quote_sender_email.trim();
    }
  } catch (err) {
    console.error("[Password Reset] Error resolving DB settings:", err);
  }

  if (!login || !key) {
    console.warn("[Password Reset] Brevo SMTP credentials not configured. Reset URL:", resetUrl);
    return {
      success: false,
      error: "Hệ thống chưa được cấu hình thông tin Brevo SMTP (BREVO_SMTP_LOGIN / BREVO_SMTP_KEY). Vui lòng cấu hình trong phần Cài đặt hệ thống.",
    };
  }

  const transporter = getBrevoTransporter(login, key);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Đặt lại mật khẩu CMS</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #1e293b;">
      <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
        
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #2b1810 0%, #4a2818 100%); padding: 32px 36px; text-align: left;">
          <p style="margin: 0; color: #f59e0b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
            SHOWROOM NỘI THẤT & THIẾT BỊ VỆ SINH
          </p>
          <h1 style="margin: 6px 0 0 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">
            PHƯƠNG ĐÔNG
          </h1>
        </div>
        
        <!-- Body Content -->
        <div style="padding: 36px;">
          <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; border-left: 4px solid #d97706; padding-left: 12px;">
            Yêu cầu đặt lại mật khẩu quản trị
          </h2>
          
          <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 12px 0;">
            Xin chào <strong>${recipientName || toEmail}</strong>,
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
            Hệ thống vừa tiếp nhận yêu cầu đặt lại mật khẩu cho tài khoản quản trị CMS của bạn tại <strong>Showroom Nội Thất Phương Đông</strong>.
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
            Vui lòng nhấn vào nút bên dưới để tạo mật khẩu mới. Liên kết bảo mật này có hiệu lực trong <strong>15 phút</strong>:
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #92400e; color: #ffffff; text-decoration: none; padding: 14px 36px; font-size: 14px; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 10px -2px rgba(146, 64, 14, 0.3);">
              🔑 Đặt Lại Mật Khẩu Ngay
            </a>
          </div>
          
          <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; padding: 14px 18px; margin-top: 28px;">
            <p style="font-size: 12px; color: #92400e; margin: 0; line-height: 1.5;">
              ⚠️ <strong>Lưu ý bảo mật:</strong> Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email. Mật khẩu hiện tại của bạn vẫn được bảo vệ tuyệt đối.
            </p>
          </div>

          <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; line-height: 1.5; word-break: break-all;">
            Nếu nút bấm không hoạt động, bạn có thể copy liên kết sau dán vào trình duyệt:<br>
            <a href="${resetUrl}" style="color: #b45309;">${resetUrl}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px 36px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; font-weight: 600; color: #64748b; margin: 0;">
            SHOWROOM NỘI THẤT & THIẾT BỊ VỆ SINH PHƯƠNG ĐÔNG
          </p>
          <p style="font-size: 11px; color: #94a3b8; margin: 4px 0 0 0;">
            Hệ thống Quản trị CMS • Bảo mật đa lớp
          </p>
          <p style="font-size: 11px; color: #cbd5e1; margin: 8px 0 0 0;">
            © ${new Date().getFullYear()} Showroom Phương Đông. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Showroom Nội Thất Phương Đông" <${sender}>`,
      to: toEmail,
      subject: "Yêu cầu đặt lại mật khẩu quản trị — Showroom Nội Thất Phương Đông",
      html,
    });
    return { success: true };
  } catch (err: any) {
    console.error("[Password Reset] Error sending email via transporter:", err);
    return {
      success: false,
      error: `Lỗi gửi mail qua SMTP (${err?.message || "Không thể kết nối máy chủ gửi mail"}). Vui lòng kiểm tra lại cấu hình Brevo.`,
    };
  }
}
