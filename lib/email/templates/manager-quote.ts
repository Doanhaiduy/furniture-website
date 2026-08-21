import { renderBaseEmailLayout, escapeHtml, formatVietnamDateTime } from "./base-layout";

export function renderManagerQuoteEmail(data: {
  fullName: string;
  phone: string;
  email: string;
  company?: string;
  service?: string;
  message: string;
  sourcePath: string;
  locale: "vi" | "en";
  brandName?: string;
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
}): string {
  const isVi = data.locale === "vi";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://showroomnoithatphuongdong.com.vn";
  const now = new Date();
  const { fullDateTimeString } = formatVietnamDateTime(now, data.locale);

  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 13px; color: #374151; line-height: 1.6;">
      ${
        isVi
          ? "Hệ thống website vừa tiếp nhận <strong>01 yêu cầu tư vấn báo giá trực tuyến mới</strong> từ khách hàng. Đề nghị bộ phận kinh doanh kiểm tra và liên hệ ngay:"
          : "A new quotation inquiry has been submitted online. Please review and contact the lead:"
      }
    </p>

    <!-- Table 1: Customer Information -->
    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 20px; border: 1px solid #d1d5db; border-collapse: collapse;">
      <tr>
        <td colspan="4" style="background-color: #292524; color: #ffffff; font-size: 13px; font-weight: bold; padding: 8px 14px; text-transform: uppercase;">
          ${isVi ? "Thông tin khách hàng:" : "Customer Details:"}
        </td>
      </tr>
      <tr>
        <td width="20%" style="padding: 8px 14px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-size: 13px; color: #4b5563;">${isVi ? "Khách hàng" : "Full Name"}</td>
        <td width="30%" style="padding: 8px 14px; border: 1px solid #e5e7eb; font-size: 13px; font-weight: bold; color: #111827;">${escapeHtml(data.fullName)}</td>
        <td width="20%" style="padding: 8px 14px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-size: 13px; color: #4b5563;">${isVi ? "Điện thoại" : "Phone"}</td>
        <td width="30%" style="padding: 8px 14px; border: 1px solid #e5e7eb; font-size: 14px; font-weight: bold; color: #0284c7;">
          <a href="tel:${escapeHtml(data.phone)}" style="color: #0284c7; text-decoration: none;">${escapeHtml(data.phone)}</a>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 14px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-size: 13px; color: #4b5563;">Email</td>
        <td style="padding: 8px 14px; border: 1px solid #e5e7eb; font-size: 13px; color: #374151;">${escapeHtml(data.email || "Không cung cấp")}</td>
        <td style="padding: 8px 14px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-size: 13px; color: #4b5563;">${isVi ? "Thời gian gửi" : "Time"}</td>
        <td style="padding: 8px 14px; border: 1px solid #e5e7eb; font-size: 13px; color: #111827;">${fullDateTimeString}</td>
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

    <!-- Table 2: Request Details -->
    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 24px; border: 1px solid #d1d5db; border-collapse: collapse;">
      <tr>
        <td colspan="4" style="background-color: #292524; color: #ffffff; font-size: 13px; font-weight: bold; padding: 8px 14px; text-transform: uppercase;">
          ${isVi ? "Chi tiết yêu cầu tư vấn:" : "Inquiry Details:"}
        </td>
      </tr>
      <tr>
        <td width="20%" style="padding: 8px 14px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-size: 13px; color: #4b5563;">${isVi ? "Hạng mục quan tâm" : "Category"}</td>
        <td colspan="3" style="padding: 8px 14px; border: 1px solid #e5e7eb; font-size: 13px; font-weight: bold; color: #8B5E3C;">
          ${escapeHtml(data.service || (isVi ? "Tư vấn & Báo giá Nội thất / Thiết bị vệ sinh" : "General Consultation"))}
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 14px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-size: 13px; color: #4b5563;">${isVi ? "Nguồn trang gửi" : "Source Path"}</td>
        <td colspan="3" style="padding: 8px 14px; border: 1px solid #e5e7eb; font-size: 13px; color: #4b5563; font-family: monospace;">
          ${escapeHtml(data.sourcePath)}
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 14px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-size: 13px; color: #4b5563; vertical-align: top;">${isVi ? "Lời nhắn của khách" : "Message"}</td>
        <td colspan="3" style="padding: 8px 14px; border: 1px solid #e5e7eb; font-size: 13px; color: #111827; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(data.message || (isVi ? "Khách hàng mong muốn nhận báo giá và tư vấn danh mục sản phẩm." : "Requested quotation."))}</td>
      </tr>
    </table>

    <!-- Action Buttons -->
    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 20px;">
      <tr>
        <td align="center">
          <a href="tel:${escapeHtml(data.phone)}" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 10px 22px; font-size: 13px; font-weight: bold; border-radius: 4px; margin-right: 10px;">
            ${isVi ? "Gọi điện thoại cho khách" : "Call Customer"}
          </a>
          <a href="${siteUrl}/admin/quotes" style="display: inline-block; background-color: #292524; color: #ffffff; text-decoration: none; padding: 10px 22px; font-size: 13px; font-weight: bold; border-radius: 4px;">
            ${isVi ? "Mở quản trị CMS" : "Open Admin CRM"}
          </a>
        </td>
      </tr>
    </table>
  `;

  return renderBaseEmailLayout({
    topUtilityRight: isVi ? "Trạng thái: KHÁCH HÀNG MỚI" : "Status: NEW LEAD",
    headerSubTitle: isVi
      ? "HỆ THỐNG QUẢN TRỊ NỘI BỘ (CMS CRM) • TIẾP NHẬN BÁO GIÁ"
      : "INTERNAL CMS CRM • QUOTE INQUIRY ALERT",
    preheaderDisclaimer: isVi
      ? "Hệ thống thông báo nội bộ tự động dành cho Ban Quản trị & Kinh doanh Showroom Phương Đông."
      : "Automated internal notification for Phuong Dong Showroom management.",
    locale: data.locale,
    contentHtml,
    brandName: data.brandName,
    contactAddress: data.contactAddress,
    contactPhone: data.contactPhone,
    contactEmail: data.contactEmail,
  });
}
