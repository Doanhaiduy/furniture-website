export interface BaseEmailLayoutOptions {
  topUtilityLeft?: string;
  topUtilityRight?: string;
  headerSubTitle?: string;
  preheaderDisclaimer?: string;
  contentHtml: string;
  locale?: "vi" | "en";
}

export function renderBaseEmailLayout({
  topUtilityLeft,
  topUtilityRight,
  headerSubTitle,
  preheaderDisclaimer,
  contentHtml,
  locale = "vi",
}: BaseEmailLayoutOptions): string {
  const isVi = locale === "vi";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://showroomnoithatphuongdong.com.vn";
  const hotline = "0912 345 678";
  const supportEmail = process.env.BREVO_SENDER_EMAIL || "cskh@showroomnoithatphuongdong.com.vn";
  const logoUrl = `${siteUrl}/logo-final.jpg`;

  // Format current date e.g. "Thứ Sáu, Ngày 21/08/2026"
  const now = new Date();
  const daysVi = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const daysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = isVi ? daysVi[now.getDay()] : daysEn[now.getDay()];
  const formattedDate = isVi
    ? `${dayName}, Ngày ${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`
    : `${dayName}, ${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;

  const defaultTopLeft = topUtilityLeft || formattedDate;
  const defaultTopRight = topUtilityRight || (isVi ? `Hotline: ${hotline}` : `Hotline: ${hotline}`);
  const defaultPreheader =
    preheaderDisclaimer ||
    (isVi
      ? "Đây là email tự động. Quý khách vui lòng không trả lời (reply) trực tiếp vào email này."
      : "This is an automated email. Please do not reply directly to this email.");
  const defaultSubTitle =
    headerSubTitle ||
    (isVi
      ? "Nội thất cao cấp • Thiết bị vệ sinh chính hãng • Tư vấn trọn gói"
      : "Luxury Furniture • Sanitary Ware • Turnkey Solutions");

  return `<!DOCTYPE html>
<html lang="${locale}" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Showroom Nội Thất Phương Đông</title>
</head>
<body style="margin: 0; padding: 0; background-color: #e5e7eb; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased; color: #1f2937;">
  
  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #e5e7eb; padding: 20px 0;">
    <tr>
      <td align="center">
        
        <!-- Preheader Disclaimer Bar -->
        <table width="650" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 650px; width: 100%;">
          <tr>
            <td align="center" style="padding: 0 0 6px 0; font-size: 11px; color: #4b5563; font-style: italic;">
              ${defaultPreheader}
            </td>
          </tr>
        </table>

        <!-- Main Container -->
        <table width="650" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 650px; width: 100%; background-color: #ffffff; border: 1px solid #d1d5db; box-shadow: 0 2px 4px rgba(0,0,0,0.06);">
          
          <!-- Top Utility Bar (Brand Amber/Brown #8B5E3C) -->
          <tr>
            <td style="background-color: #8B5E3C; padding: 8px 24px;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="font-size: 12px; color: #ffffff; font-weight: bold;">
                    ${defaultTopLeft}
                  </td>
                  <td align="right" style="font-size: 12px; color: #ffffff; font-weight: bold;">
                    ${defaultTopRight}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Header with Official Logo -->
          <tr>
            <td style="padding: 20px 28px; border-bottom: 2px solid #e5e7eb;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td width="160" style="vertical-align: middle;">
                    <a href="${siteUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="${logoUrl}" alt="Showroom Phương Đông" height="48" style="display: block; height: 48px; max-width: 140px; object-fit: contain; border: 0;" />
                    </a>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <p style="margin: 0; font-size: 13px; font-weight: bold; color: #8B5E3C; text-transform: uppercase; letter-spacing: 0.5px;">
                      CÔNG TY TNHH NỘI THẤT &amp; THIẾT BỊ VỆ SINH PHƯƠNG ĐÔNG
                    </p>
                    <p style="margin: 3px 0 0 0; font-size: 11px; color: #6b7280; text-transform: uppercase;">
                      ${defaultSubTitle}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 24px 28px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Company Info Footer -->
          <tr>
            <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 28px;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td width="160" style="vertical-align: top;">
                    <img src="${logoUrl}" alt="Phương Đông" height="38" style="display: block; height: 38px; max-width: 130px; object-fit: contain; border: 0;" />
                    <p style="margin: 4px 0 0 0; font-size: 11px; color: #9ca3af;">Showroom &amp; Thiết bị</p>
                  </td>
                  <td style="vertical-align: top; font-size: 12px; color: #4b5563; line-height: 1.6;">
                    <strong>Trụ sở chính &amp; Showroom:</strong> Hà Nội, Việt Nam<br>
                    <strong>Hotline:</strong> ${hotline} • <strong>Email hỗ trợ:</strong> ${supportEmail}<br>
                    <strong>Website chính thức:</strong> <a href="${siteUrl}" style="color: #8B5E3C; text-decoration: none; font-weight: bold;">${siteUrl.replace(/^https?:\/\//, "")}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Bottom Copyright Bar -->
          <tr>
            <td align="center" style="background-color: #8B5E3C; padding: 10px 24px; font-size: 11px; color: #ffffff;">
              Copyright &copy; 2004 - ${new Date().getFullYear()} Showroom Nội Thất Phương Đông. All Rights Reserved.
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
