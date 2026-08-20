import { renderBaseEmailLayout, escapeHtml } from "./base-layout";

export function renderCustomerQuoteConfirmationEmail(data: {
  fullName: string;
  phone: string;
  email?: string;
  service?: string;
  message?: string;
  locale: "vi" | "en";
}): string {
  const isVi = data.locale === "vi";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://showroomnoithatphuongdong.com.vn";

  const alertBarHtml = `
    <div style="background-color: #ecfdf5; border-radius: 8px; padding: 10px 16px; border: 1px solid #d1fae5;">
      <p style="margin: 0; color: #065f46; font-size: 13px; font-weight: 600;">
        ✨ ${isVi ? "Yêu cầu tư vấn báo giá của Quý khách đã được tiếp nhận thành công." : "Your quote request has been successfully received."}
      </p>
    </div>
  `;

  const contentHtml = `
    <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; border-left: 4px solid #d97706; padding-left: 12px;">
      ${isVi ? "Kính gửi Quý khách " + escapeHtml(data.fullName) + "," : "Dear " + escapeHtml(data.fullName) + ","}
    </h2>

    <p style="font-size: 14px; line-height: 1.7; color: #475569; margin: 0 0 14px 0;">
      ${
        isVi
          ? "Showroom Nội Thất Phương Đông xin trân trọng cảm ơn Quý khách đã quan tâm và gửi yêu cầu tư vấn báo giá sản phẩm & dịch vụ qua hệ thống trực tuyến của chúng tôi."
          : "Thank you for your interest and for submitting a quotation request to Phuong Dong Interior Showroom."
      }
    </p>

    <p style="font-size: 14px; line-height: 1.7; color: #475569; margin: 0 0 24px 0;">
      ${
        isVi
          ? "Hệ thống đã ghi nhận thông tin của Quý khách. Chuyên viên tư vấn của Showroom sẽ liên hệ trực tiếp qua số điện thoại <strong style=\"color: #0284c7;\">" +
            escapeHtml(data.phone) +
            "</strong> trong thời gian sớm nhất (thường từ 15 – 30 phút trong giờ làm việc) để lắng nghe nhu cầu và gửi bảng dự toán tối ưu nhất."
          : "Our showroom specialist will review your request and contact you directly via phone <strong style=\"color: #0284c7;\">" +
            escapeHtml(data.phone) +
            "</strong> shortly."
      }
    </p>

    <!-- Request Summary Box -->
    <div style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 14px 0; font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
        ${isVi ? "Tóm tắt thông tin đã gửi" : "Summary of Your Request"}
      </h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 140px; font-weight: 600;">${isVi ? "Họ tên:" : "Full Name:"}</td>
          <td style="padding: 6px 0; color: #1e293b; font-weight: 700;">${escapeHtml(data.fullName)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">${isVi ? "Số điện thoại:" : "Phone:"}</td>
          <td style="padding: 6px 0; color: #0284c7; font-weight: 700;">${escapeHtml(data.phone)}</td>
        </tr>
        ${
          data.service
            ? `<tr>
          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">${isVi ? "Hạng mục quan tâm:" : "Service:"}</td>
          <td style="padding: 6px 0; color: #92400e; font-weight: 600;">${escapeHtml(data.service)}</td>
        </tr>`
            : ""
        }
        ${
          data.message
            ? `<tr>
          <td style="padding: 6px 0; color: #64748b; font-weight: 600; vertical-align: top;">${isVi ? "Nội dung ghi chú:" : "Notes:"}</td>
          <td style="padding: 6px 0; color: #334155; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(data.message)}</td>
        </tr>`
            : ""
        }
      </table>
    </div>

    <!-- Need Immediate Support Callout -->
    <div style="background-color: #fffbeb; border-radius: 12px; border: 1px solid #fef3c7; padding: 20px; text-align: center; margin-bottom: 28px;">
      <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #92400e;">
        ${isVi ? "Cần hỗ trợ tư vấn gấp hoặc đặt lịch tham quan showroom?" : "Need urgent assistance?"}
      </p>
      <p style="margin: 0 0 14px 0; font-size: 12px; color: #78350f;">
        ${isVi ? "Quý khách có thể liên hệ trực tiếp tổng đài hotline 24/7 của chúng tôi:" : "Feel free to call our hotline:"}
      </p>
      <a href="tel:0912345678" style="display: inline-block; background-color: #92400e; color: #ffffff; text-decoration: none; padding: 10px 24px; font-size: 13px; font-weight: 700; border-radius: 8px; box-shadow: 0 2px 6px rgba(146, 64, 14, 0.2);">
        📞 Hotline: 0912 345 678
      </a>
    </div>

    <p style="font-size: 13px; color: #64748b; margin: 0 0 8px 0; line-height: 1.6;">
      ${
        isVi
          ? "Trân trọng kính chúc Quý khách nhiều sức khỏe và có trải nghiệm tuyệt vời cùng Showroom Phương Đông!"
          : "We wish you a wonderful day and look forward to serving you!"
      }
    </p>
    <p style="font-size: 13px; font-weight: 700; color: #1e293b; margin: 0;">
      ${isVi ? "Đội ngũ Showroom Nội Thất & Thiết Bị Vệ Sinh Phương Đông" : "Phuong Dong Showroom Team"}
    </p>
  `;

  return renderBaseEmailLayout({
    badgeText: isVi ? "✨ Xác Nhận Tiếp Nhận" : "✨ Confirmation",
    badgeBg: "rgba(5, 150, 105, 0.15)",
    badgeColor: "#059669",
    alertBarHtml,
    contentHtml,
    locale: data.locale,
  });
}
