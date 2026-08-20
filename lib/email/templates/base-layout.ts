export interface EmailLayoutOptions {
  badgeText?: string;
  badgeBg?: string;
  badgeColor?: string;
  alertBarHtml?: string;
  contentHtml: string;
  locale?: "vi" | "en";
}

export function renderBaseEmailLayout({
  badgeText,
  badgeBg = "rgba(245, 158, 11, 0.2)",
  badgeColor = "#fef3c7",
  alertBarHtml,
  contentHtml,
  locale = "vi",
}: EmailLayoutOptions): string {
  const isVi = locale === "vi";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://showroomnoithatphuongdong.com.vn";
  const hotline = "0912 345 678";
  const supportEmail = process.env.BREVO_SENDER_EMAIL || "cskh@showroomnoithatphuongdong.com.vn";

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Showroom Phương Đông</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          
          <!-- Unified Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #2b1810 0%, #4a2818 100%); padding: 32px 36px; text-align: left;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin: 0; color: #f59e0b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                      ${isVi ? "SHOWROOM NỘI THẤT & THIẾT BỊ VỆ SINH" : "LUXURY FURNITURE & SANITARY"}
                    </p>
                    <h1 style="margin: 6px 0 0 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">
                      PHƯƠNG ĐÔNG
                    </h1>
                  </td>
                  ${
                    badgeText
                      ? `<td align="right">
                    <span style="display: inline-block; background-color: ${badgeBg}; border: 1px solid rgba(245, 158, 11, 0.4); color: ${badgeColor}; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${badgeText}
                    </span>
                  </td>`
                      : ""
                  }
                </tr>
              </table>
            </td>
          </tr>

          <!-- Optional Alert / Context Bar -->
          ${
            alertBarHtml
              ? `<tr>
            <td style="border-bottom: 1px solid #fef3c7; padding: 14px 36px;">
              ${alertBarHtml}
            </td>
          </tr>`
              : ""
          }

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 36px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Unified Professional Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 36px; text-align: center;">
              <p style="margin: 0; font-size: 12px; font-weight: 700; color: #475569; letter-spacing: 0.5px;">
                SHOWROOM NỘI THẤT & THIẾT BỊ VỆ SINH PHƯƠNG ĐÔNG
              </p>
              <p style="margin: 6px 0 0 0; font-size: 12px; color: #64748b;">
                Hotline tư vấn: <strong style="color: #0f172a;">${hotline}</strong> • Email: <a href="mailto:${supportEmail}" style="color: #b45309; text-decoration: none;">${supportEmail}</a>
              </p>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8;">
                Website: <a href="${siteUrl}" style="color: #b45309; text-decoration: none;">${siteUrl.replace(/^https?:\/\//, "")}</a>
              </p>
              <p style="margin: 12px 0 0 0; font-size: 11px; color: #cbd5e1;">
                © ${new Date().getFullYear()} Showroom Nội Thất Phương Đông. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function escapeHtml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
