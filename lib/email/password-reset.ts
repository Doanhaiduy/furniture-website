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

  const contentHtml = `
    <p style="margin: 0 0 8px 0; font-size: 14px; color: #1f2937;">
      Kính chào <strong>${escapeHtml(recipientName || toEmail)}</strong>,
    </p>
    <p style="margin: 0 0 20px 0; font-size: 13px; color: #374151; line-height: 1.6;">
      Hệ thống bảo mật vừa tiếp nhận yêu cầu đặt lại mật khẩu cho tài khoản quản trị CMS của bạn tại <strong>Showroom Nội Thất Phương Đông</strong>.
    </p>

    <!-- Table: Security Request Info -->
    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 24px; border: 1px solid #d1d5db; border-collapse: collapse;">
      <tr>
        <td colspan="2" style="background-color: #292524; color: #ffffff; font-size: 13px; font-weight: bold; padding: 8px 14px; text-transform: uppercase;">
          Thông tin yêu cầu bảo mật:
        </td>
      </tr>
      <tr>
        <td width="30%" style="padding: 8px 14px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-size: 13px; color: #4b5563;">Tài khoản yêu cầu</td>
        <td width="70%" style="padding: 8px 14px; border: 1px solid #e5e7eb; font-size: 13px; font-weight: bold; color: #111827;">${escapeHtml(toEmail)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 14px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-size: 13px; color: #4b5563;">Thời hạn liên kết</td>
        <td style="padding: 8px 14px; border: 1px solid #e5e7eb; font-size: 13px; font-weight: bold; color: #dc2626;">15 phút (Tính từ lúc nhận thư)</td>
      </tr>
      <tr>
        <td style="padding: 8px 14px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-size: 13px; color: #4b5563;">Hành động</td>
        <td style="padding: 12px 14px; border: 1px solid #e5e7eb;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #8B5E3C; color: #ffffff; text-decoration: none; padding: 8px 20px; font-size: 13px; font-weight: bold; border-radius: 4px;">
            Đặt lại mật khẩu ngay
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: bold; color: #111827;">
      * Lưu ý bảo mật:
    </p>
    <ul style="margin: 0 0 20px 0; padding-left: 20px; font-size: 12px; color: #4b5563; line-height: 1.7;">
      <li>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua thư. Mật khẩu hiện tại của bạn vẫn được bảo vệ an toàn.</li>
      <li>Không chia sẻ liên kết này cho bất kỳ ai để đảm bảo an toàn tuyệt đối cho hệ thống dữ liệu showroom.</li>
    </ul>

    <p style="margin: 0; font-size: 11px; color: #9ca3af; word-break: break-all;">
      Liên kết trực tiếp: <a href="${resetUrl}" style="color: #8B5E3C;">${resetUrl}</a>
    </p>
  `;

  const html = renderBaseEmailLayout({
    topUtilityRight: "BẢO MẬT HỆ THỐNG CMS",
    headerSubTitle: "HỆ THỐNG QUẢN TRỊ NỘI BỘ • ĐẶT LẠI MẬT KHẨU",
    preheaderDisclaimer: "Thư xác thực bảo mật tài khoản quản trị viên Showroom Phương Đông.",
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
