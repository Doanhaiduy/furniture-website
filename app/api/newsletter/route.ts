import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { env } from "@/lib/env/schema";
import { getBrevoTransporter } from "@/lib/brevo/client";
import { decryptSecret } from "@/lib/security/encryption";
import { renderBaseEmailLayout, escapeHtml } from "@/lib/email/templates/base-layout";

const newsletterSchema = z.object({
  email: z.string().trim().email("Địa chỉ email không hợp lệ"),
  locale: z.enum(["vi", "en"]).default("vi"),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = newsletterSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Email không hợp lệ" },
        { status: 400 }
      );
    }

    const { email, locale } = parsed.data;
    const supabase = createAdminClient();

    // 1. Save subscriber lead to quote_requests table in database
    const { error: dbError } = await supabase.from("quote_requests").insert({
      full_name: "Khách hàng đăng ký nhận bản tin",
      email: email,
      phone: "",
      service: "newsletter",
      message: `Khách hàng đăng ký nhận bản tin ưu đãi & bộ sưu tập mới từ Footer Website (${locale.toUpperCase()}).`,
      source_path: "/newsletter",
      preferred_locale: locale,
      status: "new",
    });

    if (dbError) {
      console.error("[Newsletter API] DB insert error:", dbError);
    }

    // 2. Send an automated thank-you confirmation email to the subscriber if Brevo SMTP is configured
    try {
      let smtpLogin = env.BREVO_SMTP_LOGIN || process.env.BREVO_SMTP_LOGIN || null;
      let smtpKey = env.BREVO_SMTP_KEY || process.env.BREVO_SMTP_KEY || null;
      const encryptionKey = env.AI_SECRET_ENCRYPTION_KEY || process.env.AI_SECRET_ENCRYPTION_KEY;

      const { data: smtpSecrets } = await supabase
        .from("integration_secrets")
        .select("key_name, encrypted_value")
        .in("key_name", ["brevo_smtp_login", "brevo_smtp_key"]);

      if (smtpSecrets && encryptionKey) {
        for (const secret of smtpSecrets) {
          try {
            const decrypted = decryptSecret(secret.encrypted_value, encryptionKey);
            if (secret.key_name === "brevo_smtp_login") smtpLogin = decrypted;
            if (secret.key_name === "brevo_smtp_key") smtpKey = decrypted;
          } catch (err) {
            console.error(`[Newsletter API] Failed to decrypt ${secret.key_name}:`, err);
          }
        }
      }

      const { data: dbSettings } = await supabase
        .from("site_settings")
        .select(`
          contact_phone,
          contact_email,
          quote_sender_email,
          site_setting_translations (
            locale,
            brand_name,
            contact_address
          )
        `)
        .eq("singleton_key", "default")
        .maybeSingle();

      const translations = Array.isArray(dbSettings?.site_setting_translations)
        ? dbSettings.site_setting_translations
        : [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const trans = (translations as any[]).find((t: any) => t.locale === locale) || translations[0];

      const dbBrandName = trans?.brand_name || undefined;
      const dbContactAddress = trans?.contact_address || undefined;
      const dbContactPhone = dbSettings?.contact_phone || undefined;
      const dbContactEmail = dbSettings?.contact_email || undefined;

      const configuredSender = dbSettings?.quote_sender_email?.trim();
      const fromAddress =
        env.BREVO_SENDER_EMAIL ||
        process.env.BREVO_SENDER_EMAIL ||
        (configuredSender && !configuredSender.endsWith("@gmail.com")
          ? configuredSender
          : "no-reply@showroomnoithatphuongdong.com.vn");

      if (smtpLogin && smtpKey && fromAddress) {
        const transporter = getBrevoTransporter(smtpLogin, smtpKey);

        const isVi = locale === "vi";
        const contentHtml = `
          <p style="margin: 0 0 12px 0; font-size: 14px; color: #1f2937;">
            ${isVi ? "Kính chào Quý khách," : "Dear Customer,"}
          </p>
          <p style="margin: 0 0 16px 0; font-size: 13px; color: #374151; line-height: 1.6;">
            ${
              isVi
                ? `Cảm ơn Quý khách đã đăng ký nhận bản tin định kỳ tại <strong>Showroom Nội Thất Phương Đông</strong>. Email <strong>${escapeHtml(
                    email
                  )}</strong> của Quý khách đã được lưu vào danh sách ưu tiên.`
                : `Thank you for subscribing to our newsletter at <strong>Phuong Dong Furniture Showroom</strong>. Your email <strong>${escapeHtml(
                    email
                  )}</strong> is now on our priority list.`
            }
          </p>
          <div style="background-color: #f9fafb; border-left: 4px solid #8B5E3C; padding: 14px 18px; margin: 16px 0 20px 0; font-size: 13px; color: #4b5563;">
            ${
              isVi
                ? "Quý khách sẽ là một trong những người đầu tiên nhận được thông tin về các bộ sưu tập nội thất mới nhất, xu hướng thiết kế và các chương trình ưu đãi độc quyền dành cho khách hàng thân thiết."
                : "You will be among the first to receive updates on our latest furniture collections, design trends, and exclusive member discounts."
            }
          </div>
          <p style="margin: 0; font-size: 13px; color: #4b5563;">
            ${
              isVi
                ? "Nếu cần hỗ trợ tư vấn khẩn cấp, Quý khách vui lòng liên hệ Tổng đài Hotline của chúng tôi."
                : "If you need immediate assistance, please feel free to reach out via our Hotline."
            }
          </p>
        `;

        const html = renderBaseEmailLayout({
          topUtilityRight: isVi ? "ĐĂNG KÝ BẢN TIN THÀNH CÔNG" : "NEWSLETTER SUBSCRIPTION",
          headerSubTitle: isVi
            ? "NỘI THẤT CAO CẤP • THIẾT BỊ VỆ SINH • GẠCH ỐP LÁT"
            : "PREMIUM FURNITURE & SANITARY WARE",
          preheaderDisclaimer: isVi
            ? "Xác nhận đăng ký nhận bản tin ưu đãi từ Showroom Phương Đông."
            : "Newsletter subscription confirmation from Phuong Dong Showroom.",
          contentHtml,
          locale,
          brandName: dbBrandName,
          contactAddress: dbContactAddress,
          contactPhone: dbContactPhone,
          contactEmail: dbContactEmail,
        });

        await transporter.sendMail({
          from: `"Showroom Nội Thất Phương Đông" <${fromAddress}>`,
          to: email,
          replyTo: dbContactEmail || "info@showroomnoithatphuongdong.com.vn",
          headers: {
            "X-Mailin-Track-Clicks": "0",
          },
          subject: isVi
            ? "[Xác nhận] Đăng ký nhận bản tin ưu đãi thành công — Showroom Nội Thất Phương Đông"
            : "[Confirmation] Newsletter Subscription Successful — Phuong Dong Showroom",
          html,
        });
      }
    } catch (emailErr) {
      console.error("[Newsletter API] Error sending subscriber email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message:
        locale === "vi"
          ? "Đăng ký nhận bản tin thành công! Cảm ơn bạn đã quan tâm."
          : "Subscribed to newsletter successfully! Thank you.",
    });
  } catch (err) {
    console.error("[Newsletter API] Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
