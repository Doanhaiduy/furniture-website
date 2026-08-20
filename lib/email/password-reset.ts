import "server-only";
import { getBrevoTransporter } from "@/lib/brevo/client";

export async function sendPasswordResetEmail({
  toEmail,
  recipientName,
  resetUrl,
}: {
  toEmail: string;
  recipientName: string;
  resetUrl: string;
}) {
  const login = process.env.BREVO_SMTP_LOGIN;
  const key = process.env.BREVO_SMTP_KEY;
  const sender = process.env.BREVO_SENDER_EMAIL || "showroomnoithatphuongdong@gmail.com";

  if (!login || !key) {
    console.warn("[Password Reset] Brevo SMTP credentials not configured. Reset URL:", resetUrl);
    return { success: false, error: "SMTP not configured" };
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
    <body style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background-color: #795548; padding: 24px 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px;">SHOWROOM NỘI THẤT PHƯƠNG ĐÔNG</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0 0; font-size: 13px;">Hệ thống Quản trị CMS</p>
        </div>
        
        <div style="padding: 32px;">
          <h2 style="font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 0;">Yêu cầu đặt lại mật khẩu</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            Xin chào <strong>${recipientName || toEmail}</strong>,
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            Hệ thống vừa nhận được yêu cầu đặt lại mật khẩu cho tài khoản quản trị của bạn tại Showroom Nội Thất Phương Đông.
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            Vui lòng nhấn vào nút bên dưới để tiến hành tạo mật khẩu mới. Liên kết này chỉ có hiệu lực trong <strong>15 phút</strong>:
          </p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #795548; color: #ffffff; text-decoration: none; padding: 12px 32px; font-size: 14px; font-weight: 600; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              Đặt lại mật khẩu ngay
            </a>
          </div>
          
          <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 12px 16px; margin-top: 24px;">
            <p style="font-size: 12px; color: #991b1b; margin: 0; line-height: 1.5;">
              ⚠️ <strong>Lưu ý bảo mật:</strong> Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email. Mật khẩu hiện tại của bạn vẫn được an toàn.
            </p>
          </div>

          <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; line-height: 1.5; word-break: break-all;">
            Nếu nút bấm không hoạt động, bạn có thể copy liên kết sau dán vào trình duyệt:<br>
            <a href="${resetUrl}" style="color: #795548;">${resetUrl}</a>
          </p>
        </div>

        <div style="background-color: #f1f5f9; padding: 16px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #64748b; margin: 0;">
            © ${new Date().getFullYear()} Showroom Nội Thất Phương Đông. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Showroom Nội Thất Phương Đông" <${sender}>`,
    to: toEmail,
    subject: "Yêu cầu đặt lại mật khẩu quản trị — Showroom Nội Thất Phương Đông",
    html,
  });

  return { success: true };
}
