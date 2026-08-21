import "server-only";
import { getBrevoTransporter } from "@/lib/brevo/client";
import { createAdminClient } from "@/lib/supabase/server";
import { decryptSecret } from "@/lib/security/encryption";
import { env } from "@/lib/env/schema";
import { renderBaseEmailLayout, escapeHtml } from "./templates/base-layout";

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
  let sender = env.BREVO_SENDER_EMAIL || process.env.BREVO_SENDER_EMAIL || "no-reply@showroomnoithatphuongdong.com.vn";

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

    const configuredSender = senderSettings?.quote_sender_email?.trim();
    if (configuredSender && !configuredSender.endsWith("@gmail.com")) {
      sender = configuredSender;
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

  const alertBarHtml = `
    <div style="background-color: #fef2f2; border-radius: 8px; padding: 10px 16px; border: 1px solid #fee2e2;">
      <p style="margin: 0; color: #991b1b; font-size: 13px; font-weight: 600;">
        🔒 Yêu cầu bảo mật: Đặt lại mật khẩu tài khoản quản trị CMS.
      </p>
    </div>
  `;

  const contentHtml = `
    <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; border-left: 4px solid #d97706; padding-left: 12px;">
      Yêu cầu đặt lại mật khẩu quản trị
    </h2>
    
    <p style="font-size: 14px; line-height: 1.7; color: #475569; margin: 0 0 12px 0;">
      Xin chào <strong>${escapeHtml(recipientName || toEmail)}</strong>,
    </p>
    <p style="font-size: 14px; line-height: 1.7; color: #475569; margin: 0 0 16px 0;">
      Hệ thống vừa tiếp nhận yêu cầu đặt lại mật khẩu cho tài khoản quản trị CMS của bạn tại <strong>Showroom Nội Thất Phương Đông</strong>.
    </p>
    <p style="font-size: 14px; line-height: 1.7; color: #475569; margin: 0 0 24px 0;">
      Vui lòng nhấn vào nút bên dưới để tạo mật khẩu mới. Liên kết bảo mật này có hiệu lực trong <strong>15 phút</strong>:
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" style="display: inline-block; background-color: #92400e; color: #ffffff; text-decoration: none; padding: 14px 36px; font-size: 14px; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 10px -2px rgba(146, 64, 14, 0.3);">
        🔑 Đặt Lại Mật Khẩu Ngay
      </a>
    </div>
    
    <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; padding: 14px 18px; margin-top: 28px;">
      <p style="font-size: 12px; color: #92400e; margin: 0; line-height: 1.5;">
        ⚠️ <strong>Lưu ý bảo mật:</strong> Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email. Mật khẩu hiện tại của bạn vẫn được bảo vệ an toàn.
      </p>
    </div>

    <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; line-height: 1.5; word-break: break-all;">
      Nếu nút bấm không hoạt động, bạn có thể copy liên kết sau dán vào trình duyệt:<br>
      <a href="${resetUrl}" style="color: #b45309;">${resetUrl}</a>
    </p>
  `;

  const html = renderBaseEmailLayout({
    badgeText: "🔒 Bảo Mật CMS",
    badgeBg: "rgba(220, 38, 38, 0.15)",
    badgeColor: "#dc2626",
    alertBarHtml,
    contentHtml,
    locale: "vi",
  });

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
