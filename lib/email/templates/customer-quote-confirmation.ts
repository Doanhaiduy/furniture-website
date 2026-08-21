import { renderBaseEmailLayout, escapeHtml } from "./base-layout";

export function renderCustomerQuoteConfirmationEmail(data: {
  fullName: string;
  phone: string;
  email?: string;
  company?: string;
  service?: string;
  message?: string;
  locale: "vi" | "en";
}): string {
  const isVi = data.locale === "vi";
  const now = new Date();
  const timeString = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const quoteRefCode = `PD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

  const contentHtml = `
    <p style="margin: 0 0 8px 0; font-size: 14px; color: #1f2937;">
      ${isVi ? `Kính chào Quý khách <strong>${escapeHtml(data.fullName)}</strong>,` : `Dear <strong>${escapeHtml(data.fullName)}</strong>,`}
    </p>
    <p style="margin: 0 0 20px 0; font-size: 13px; color: #374151; line-height: 1.6;">
      ${
        isVi
          ? "Cảm ơn Quý khách đã quan tâm và gửi yêu cầu tư vấn báo giá tại <strong>Showroom Nội Thất Phương Đông</strong>."
          : "Thank you for contacting and submitting your quotation request to <strong>Phuong Dong Showroom</strong>."
      }
    </p>

    <!-- Table 1: Customer Information -->
    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 20px; border: 1px solid #d1d5db; border-collapse: collapse;">
      <tr>
        <td colspan="4" style="background-color: #292524; color: #ffffff; font-size: 13px; font-weight: bold; padding: 8px 14px; text-transform: uppercase;">
          ${isVi ? "Thông tin khách hàng:" : "Customer Information:"}
        </td>
      </tr>
      <tr>
        <td width="20%" style="padding: 8px 14px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-size: 13px; color: #4b5563;">${isVi ? "Khách hàng" : "Full Name"}</td>
        <td width="30%" style="padding: 8px 14px; border: 1px solid #e5e7eb; font-size: 13px; font-weight: bold; color: #111827;">${escapeHtml(data.fullName)}</td>
        <td width="20%" style="padding: 8px 14px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-size: 13px; color: #4b5563;">${isVi ? "Điện thoại" : "Phone"}</td>
        <td width="30%" style="padding: 8px 14px; border: 1px solid #e5e7eb; font-size: 13px; font-weight: bold; color: #111827;">${escapeHtml(data.phone)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 14px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-size: 13px; color: #4b5563;">Email</td>
        <td style="padding: 8px 14px; border: 1px solid #e5e7eb; font-size: 13px; color: #0284c7; font-weight: 500;">${escapeHtml(data.email || "Không cung cấp")}</td>
        <td style="padding: 8px 14px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-size: 13px; color: #4b5563;">${isVi ? "Thời gian gửi" : "Submitted At"}</td>
        <td style="padding: 8px 14px; border: 1px solid #e5e7eb; font-size: 13px; color: #111827;">${timeString}</td>
      </tr>
      ${
        data.company
          ? `<tr>
        <td style="padding: 8px 14px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-size: 13px; color: #4b5563;">${isVi ? "Công ty / Đơn vị" : "Company"}</td>
        <td colspan="3" style="padding: 8px 14px; border: 1px solid #e5e7eb; font-size: 13px; font-weight: bold; color: #111827;">${escapeHtml(data.company)}</td>
      </tr>`
          : ""
      }
    </table>

    <!-- Table 2: Quote Request Details -->
    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 24px; border: 1px solid #d1d5db; border-collapse: collapse;">
      <tr>
        <td colspan="4" style="background-color: #292524; color: #ffffff; font-size: 13px; font-weight: bold; padding: 8px 14px; text-transform: uppercase;">
          ${isVi ? "Thông tin yêu cầu báo giá:" : "Quotation Request Details:"}
        </td>
      </tr>
      <tr>
        <td width="20%" style="padding: 8px 14px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-size: 13px; color: #4b5563;">${isVi ? "Mã tiếp nhận" : "Reference Code"}</td>
        <td width="30%" style="padding: 8px 14px; border: 1px solid #e5e7eb; font-size: 13px; font-weight: bold; color: #8B5E3C; font-family: monospace;">${quoteRefCode}</td>
        <td width="20%" style="padding: 8px 14px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-size: 13px; color: #4b5563;">${isVi ? "Tình trạng" : "Status"}</td>
        <td width="30%" style="padding: 8px 14px; border: 1px solid #e5e7eb; font-size: 13px; font-weight: bold; color: #059669;">${isVi ? "Đã tiếp nhận" : "Received"}</td>
      </tr>
      <tr>
        <td style="padding: 8px 14px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-size: 13px; color: #4b5563;">${isVi ? "Hạng mục quan tâm" : "Service Category"}</td>
        <td colspan="3" style="padding: 8px 14px; border: 1px solid #e5e7eb; font-size: 13px; font-weight: bold; color: #111827;">
          ${escapeHtml(data.service || (isVi ? "Tư vấn & Báo giá Nội thất / Thiết bị vệ sinh" : "Consultation & Quotation"))}
        </td>
      </tr>
      ${
        data.message
          ? `<tr>
        <td style="padding: 8px 14px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-size: 13px; color: #4b5563; vertical-align: top;">${isVi ? "Ghi chú / Nhu cầu" : "Notes"}</td>
        <td colspan="3" style="padding: 8px 14px; border: 1px solid #e5e7eb; font-size: 13px; color: #374151; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(data.message)}</td>
      </tr>`
          : ""
      }
    </table>

    <!-- Notice & Next Steps -->
    <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: bold; color: #111827;">
      * ${isVi ? "Lưu ý:" : "Important Notes:"}
    </p>
    <ul style="margin: 0 0 20px 0; padding-left: 20px; font-size: 12px; color: #4b5563; line-height: 1.7;">
      ${
        isVi
          ? `
        <li>Thông tin yêu cầu của Quý khách đã được chuyển trực tiếp tới chuyên viên tư vấn của Showroom Phương Đông.</li>
        <li>Chuyên viên phụ trách sẽ liên hệ lại trực tiếp qua số điện thoại <strong>${escapeHtml(data.phone)}</strong> trong vòng <strong>15 - 30 phút</strong> (trong giờ làm việc: 8h00 - 21h00 hàng ngày) để giải đáp chi tiết và gửi bảng dự toán tối ưu.</li>
        <li>Nếu cần hỗ trợ tư vấn khẩn cấp hoặc khảo sát trực tiếp tại công trình, Quý khách vui lòng liên hệ Tổng đài Hotline: <strong style="color: #8B5E3C;">0912 345 678</strong>.</li>
        <li>Quý khách có thể xem thêm các bộ sưu tập mẫu mã mới nhất tại website: <a href="https://showroomnoithatphuongdong.com.vn" style="color: #0284c7; text-decoration: none;">showroomnoithatphuongdong.com.vn</a>.</li>
      `
          : `
        <li>Your request has been routed to our showroom specialist team.</li>
        <li>Our specialist will contact you directly at <strong>${escapeHtml(data.phone)}</strong> within <strong>15 - 30 minutes</strong> during business hours (8:00 AM - 9:00 PM).</li>
        <li>For urgent assistance, please call our 24/7 Hotline: <strong style="color: #8B5E3C;">0912 345 678</strong>.</li>
      `
      }
    </ul>

    <p style="margin: 0; font-size: 13px; font-weight: bold; color: #111827;">
      ${isVi ? "Trân trọng cảm ơn!" : "Sincerely,"}
    </p>
  `;

  return renderBaseEmailLayout({
    locale: data.locale,
    contentHtml,
  });
}
