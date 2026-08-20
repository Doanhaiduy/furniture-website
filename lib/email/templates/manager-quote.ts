export function renderManagerQuoteEmail(data: {
  fullName: string;
  phone: string;
  email: string;
  company?: string;
  service?: string;
  message: string;
  sourcePath: string;
  locale: "vi" | "en";
}) {
  const isVi = data.locale === "vi";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://showroomnoithatphuongdong.com.vn";

  return `
<!DOCTYPE html>
<html lang="${data.locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isVi ? "Yêu cầu báo giá mới" : "New Quote Request"}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
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
                  <td align="right">
                    <span style="display: inline-block; background-color: rgba(245, 158, 11, 0.2); border: 1px solid rgba(245, 158, 11, 0.4); color: #fef3c7; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                      ⚡ ${isVi ? "Khách Hàng Mới" : "New Lead"}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Notification Alert Bar -->
          <tr>
            <td style="background-color: #fffbeb; border-bottom: 1px solid #fef3c7; padding: 14px 36px;">
              <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 600;">
                🔔 ${isVi ? "Hệ thống vừa tiếp nhận yêu cầu tư vấn báo giá trực tuyến từ khách hàng." : "A new quotation request has been submitted online."}
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 36px;">
              
              <h2 style="margin: 0 0 20px 0; color: #0f172a; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-left: 4px solid #d97706; padding-left: 12px;">
                ${isVi ? "Thông Tin Khách Hàng" : "Customer Details"}
              </h2>

              <!-- Details Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; width: 140px; color: #64748b; font-size: 13px; font-weight: 600;">
                    ${isVi ? "Họ và tên" : "Full Name"}
                  </td>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 700;">
                    ${escapeHtml(data.fullName)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 600;">
                    ${isVi ? "Số điện thoại" : "Phone"}
                  </td>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #0284c7; font-size: 15px; font-weight: 700;">
                    <a href="tel:${escapeHtml(data.phone)}" style="color: #0284c7; text-decoration: none;">
                      📞 ${escapeHtml(data.phone)}
                    </a>
                  </td>
                </tr>
                ${data.email ? `
                <tr>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 600;">
                    Email
                  </td>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 13px; font-weight: 500;">
                    <a href="mailto:${escapeHtml(data.email)}" style="color: #475569; text-decoration: underline;">
                      ${escapeHtml(data.email)}
                    </a>
                  </td>
                </tr>` : ""}
                ${data.company ? `
                <tr>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 600;">
                    ${isVi ? "Đơn vị / Công ty" : "Company"}
                  </td>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 13px; font-weight: 600;">
                    ${escapeHtml(data.company)}
                  </td>
                </tr>` : ""}
                ${data.service ? `
                <tr>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 600;">
                    ${isVi ? "Dịch vụ quan tâm" : "Service"}
                  </td>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #7c2d12; font-size: 13px; font-weight: 600;">
                    ${escapeHtml(data.service)}
                  </td>
                </tr>` : ""}
                <tr>
                  <td style="padding: 12px 18px; color: #64748b; font-size: 13px; font-weight: 600; vertical-align: top;">
                    ${isVi ? "Nội dung yêu cầu" : "Message"}
                  </td>
                  <td style="padding: 12px 18px; color: #1e293b; font-size: 13px; font-weight: 500; line-height: 1.6; white-space: pre-wrap;">
                    ${escapeHtml(data.message || (isVi ? "Khách hàng mong muốn nhận báo giá và tư vấn danh mục sản phẩm." : "Requested quotation."))}
                  </td>
                </tr>
              </table>

              <!-- Action Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                <tr>
                  <td align="center">
                    <a href="tel:${escapeHtml(data.phone)}" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 12px 28px; font-size: 14px; font-weight: 700; border-radius: 10px; margin-right: 12px; box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.2);">
                      📞 ${isVi ? "Gọi Cho Khách Ngay" : "Call Customer"}
                    </a>
                    <a href="${siteUrl}/admin/quotes" style="display: inline-block; background-color: #1e293b; color: #ffffff; text-decoration: none; padding: 12px 28px; font-size: 14px; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(30, 41, 59, 0.2);">
                      💻 ${isVi ? "Mở Bảng Quản Trị CMS" : "Open Admin CRM"}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 28px 0 0 0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
                ${isVi ? "Nguồn gửi yêu cầu:" : "Submitted from:"} <code style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #64748b;">${escapeHtml(data.sourcePath)}</code>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 36px; text-align: center;">
              <p style="margin: 0; font-size: 12px; font-weight: 600; color: #64748b;">
                SHOWROOM NỘI THẤT & THIẾT BỊ VỆ SINH PHƯƠNG ĐÔNG
              </p>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8;">
                Website: <a href="${siteUrl}" style="color: #b45309; text-decoration: none;">${siteUrl.replace(/^https?:\/\//, '')}</a> • Hotline: 0912 345 678
              </p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #cbd5e1;">
                © ${new Date().getFullYear()} Showroom Phương Đông. All rights reserved.
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

function escapeHtml(str: string) {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

