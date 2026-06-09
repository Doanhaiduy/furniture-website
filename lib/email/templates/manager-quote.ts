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
  return `
<!DOCTYPE html>
<html lang="${data.locale}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:system-ui,-apple-system,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
          <tr><td style="background:#1c1917;padding:24px 32px"><h1 style="margin:0;color:#fff;font-size:20px">Phương Đông — Yêu cầu báo giá mới</h1></td></tr>
          <tr><td style="padding:32px">
            <p style="margin:0 0 16px;color:#57534e;font-size:14px">Khách hàng vừa gửi yêu cầu từ <strong>${escapeHtml(data.sourcePath)}</strong></p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
              <tr><td style="padding:8px 0;border-bottom:1px solid #e7e5e4;color:#1c1917;font-weight:600;width:140px">Họ tên</td><td style="padding:8px 0;border-bottom:1px solid #e7e5e4;color:#44403c">${escapeHtml(data.fullName)}</td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #e7e5e4;color:#1c1917;font-weight:600">Điện thoại</td><td style="padding:8px 0;border-bottom:1px solid #e7e5e4;color:#44403c">${escapeHtml(data.phone)}</td></tr>
              ${data.email ? `<tr><td style="padding:8px 0;border-bottom:1px solid #e7e5e4;color:#1c1917;font-weight:600">Email</td><td style="padding:8px 0;border-bottom:1px solid #e7e5e4;color:#44403c">${escapeHtml(data.email)}</td></tr>` : ""}
              ${data.company ? `<tr><td style="padding:8px 0;border-bottom:1px solid #e7e5e4;color:#1c1917;font-weight:600">Công ty</td><td style="padding:8px 0;border-bottom:1px solid #e7e5e4;color:#44403c">${escapeHtml(data.company)}</td></tr>` : ""}
              ${data.service ? `<tr><td style="padding:8px 0;border-bottom:1px solid #e7e5e4;color:#1c1917;font-weight:600">Dịch vụ</td><td style="padding:8px 0;border-bottom:1px solid #e7e5e4;color:#44403c">${escapeHtml(data.service)}</td></tr>` : ""}
              <tr><td style="padding:8px 0;color:#1c1917;font-weight:600;vertical-align:top">Lời nhắn</td><td style="padding:8px 0;color:#44403c;white-space:pre-wrap">${escapeHtml(data.message)}</td></tr>
            </table>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
