import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { env } from "@/lib/env/schema";
import { getBrevoTransporter } from "@/lib/brevo/client";
import { decryptSecret } from "@/lib/security/encryption";
import { renderBaseEmailLayout, escapeHtml } from "./templates/base-layout";
import { SITE_URL } from "@/lib/seo";

export interface BroadcastPayload {
  type: "product" | "blog" | "promotion";
  title: string;
  summary?: string;
  imageUrl?: string;
  slugUrl: string; // e.g. "/vi/products/sofa-elegance" or "/vi/blog/xu-huong-noi-that"
  locale?: "vi" | "en";
}

/**
 * Automatically broadcast new published items (Products, Blog Posts, Promotions)
 * to all active newsletter subscribers.
 * Executed asynchronously to never block Admin CMS workflows.
 */
export async function broadcastToSubscribers(payload: BroadcastPayload): Promise<{
  success: boolean;
  sentCount?: number;
  error?: string;
}> {
  try {
    const supabase = createAdminClient();

    // 1. Fetch all distinct active newsletter subscribers
    const { data: subscribers, error: subError } = await supabase
      .from("quote_requests")
      .select("email")
      .eq("service", "newsletter")
      .is("deleted_at", null)
      .neq("email", "");

    if (subError || !subscribers || subscribers.length === 0) {
      console.log("[Broadcast] No newsletter subscribers found to notify.");
      return { success: true, sentCount: 0 };
    }

    // Deduplicate emails
    const uniqueEmails = Array.from(
      new Set(
        subscribers
          .map((s) => s.email?.trim().toLowerCase())
          .filter((e): e is string => Boolean(e && e.includes("@")))
      )
    );

    if (uniqueEmails.length === 0) {
      return { success: true, sentCount: 0 };
    }

    // 2. Resolve Brevo SMTP credentials
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
          console.error(`[Broadcast] Failed to decrypt ${secret.key_name}:`, err);
        }
      }
    }

    if (!smtpLogin || !smtpKey) {
      console.warn("[Broadcast] Brevo SMTP credentials not configured. Skipping broadcast.");
      return { success: false, error: "SMTP not configured" };
    }

    // 3. Resolve Showroom Site Settings
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

    const locale = payload.locale || "vi";
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

    const transporter = getBrevoTransporter(smtpLogin, smtpKey);

    // 4. Construct Email Content based on Type
    const fullLink = payload.slugUrl.startsWith("http")
      ? payload.slugUrl
      : `${SITE_URL}${payload.slugUrl.startsWith("/") ? "" : "/"}${payload.slugUrl}`;

    let badgeText = "BẢN TIN PHƯƠNG ĐÔNG";
    let ctaText = "Khám phá ngay";
    let subjectPrefix = "Bản tin mới";

    if (payload.type === "product") {
      badgeText = "BỘ SƯU TẬP MỚI";
      ctaText = "Xem chi tiết sản phẩm";
      subjectPrefix = "[Sản phẩm mới]";
    } else if (payload.type === "blog") {
      badgeText = "BÀI VIẾT NỔI BẬT";
      ctaText = "Đọc bài viết ngay";
      subjectPrefix = "[Góc kiến thức]";
    } else if (payload.type === "promotion") {
      badgeText = "ƯU ĐÃI ĐẶC BIỆT";
      ctaText = "Xem chương trình ưu đãi";
      subjectPrefix = "[Khuyến mãi]";
    }

    const contentHtml = `
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #1f2937;">
        Kính chào Quý khách,
      </p>
      <p style="margin: 0 0 16px 0; font-size: 13px; color: #374151; line-height: 1.6;">
        Showroom Nội Thất Phương Đông trân trọng gửi tới Quý khách thông tin cập nhật mới nhất từ bộ sưu tập của chúng tôi:
      </p>

      <!-- Featured Item Card -->
      <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
        ${
          payload.imageUrl
            ? `
          <tr>
            <td align="center" style="background-color: #f3f4f6; padding: 0;">
              <a href="${fullLink}" target="_blank" style="display: block;">
                <img src="${payload.imageUrl}" alt="${escapeHtml(payload.title)}" style="display: block; width: 100%; max-height: 320px; object-fit: cover; border: 0;" />
              </a>
            </td>
          </tr>
        `
            : ""
        }
        <tr>
          <td style="padding: 20px 24px;">
            <span style="display: inline-block; background-color: #8B5E3C; color: #ffffff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; margin-bottom: 10px;">
              ${badgeText}
            </span>
            <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold; color: #111827; line-height: 1.4;">
              <a href="${fullLink}" target="_blank" style="color: #111827; text-decoration: none;">
                ${escapeHtml(payload.title)}
              </a>
            </h3>
            ${
              payload.summary
                ? `
              <p style="margin: 0 0 18px 0; font-size: 13px; color: #4b5563; line-height: 1.6;">
                ${escapeHtml(payload.summary)}
              </p>
            `
                : ""
            }
            <div>
              <a href="${fullLink}" target="_blank" style="display: inline-block; background-color: #8B5E3C; color: #ffffff; text-decoration: none; padding: 10px 24px; font-size: 13px; font-weight: bold; border-radius: 4px;">
                ${ctaText} &rarr;
              </a>
            </div>
          </td>
        </tr>
      </table>

      <p style="margin: 0; font-size: 12px; color: #6b7280; line-height: 1.5; text-align: center;">
        Quý khách nhận được email này vì đã đăng ký nhận bản tin tại website của Showroom Nội Thất Phương Đông.
      </p>
    `;

    const html = renderBaseEmailLayout({
      topUtilityRight: badgeText,
      headerSubTitle: "NỘI THẤT CAO CẤP • THIẾT BỊ VỆ SINH • TƯ VẤN TRỌN GÓI",
      preheaderDisclaimer: `${subjectPrefix} ${payload.title} — Showroom Nội Thất Phương Đông.`,
      contentHtml,
      locale,
      brandName: dbBrandName,
      contactAddress: dbContactAddress,
      contactPhone: dbContactPhone,
      contactEmail: dbContactEmail,
    });

    // 5. Send to all subscribers via SMTP in small batches
    let sentCount = 0;
    const batchSize = 10;
    for (let i = 0; i < uniqueEmails.length; i += batchSize) {
      const batch = uniqueEmails.slice(i, i + batchSize);
      await Promise.allSettled(
        batch.map((recipientEmail) =>
          transporter.sendMail({
            from: `"Showroom Nội Thất Phương Đông" <${fromAddress}>`,
            to: recipientEmail,
            replyTo: dbContactEmail || "info@showroomnoithatphuongdong.com.vn",
            headers: {
              "X-Mailin-Track-Clicks": "0",
            },
            subject: `${subjectPrefix} ${payload.title} — Showroom Nội Thất Phương Đông`,
            html,
          })
        )
      );
      sentCount += batch.length;
    }

    console.log(`[Broadcast] Successfully sent ${sentCount} newsletter emails.`);
    return { success: true, sentCount };
  } catch (err) {
    console.error("[Broadcast] Error broadcasting to subscribers:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown broadcast error",
    };
  }
}
