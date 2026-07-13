import { NextResponse } from "next/server";
import { rateLimitCheck } from "@/lib/quotes/rate-limit";
import { getQuoteRequestSchema } from "@/lib/validations/quote";
import { createAdminClient } from "@/lib/supabase/server";
import { getQuoteRecipients } from "@/lib/quotes/recipients";
import { getBrevoTransporter } from "@/lib/brevo/client";
import { decryptSecret } from "@/lib/security/encryption";
import { env } from "@/lib/env/schema";
import { renderManagerQuoteEmail } from "@/lib/email/templates/manager-quote";

const RATE_LIMIT_KEY_PREFIX = "quote:ip:";

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateKey = `${RATE_LIMIT_KEY_PREFIX}${ip}`;
  const rateResult = rateLimitCheck(rateKey);

  if (!rateResult.allowed) {
    return NextResponse.json(
      { ok: false, code: "RATE_LIMIT", message: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rateResult.retryAfterMs / 1000)) } },
    );
  }

  const body = await request.json().catch(() => null);
  const locale = body?.locale === "en" ? "en" : "vi";
  const parsed = getQuoteRequestSchema(locale).safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "Invalid quote request.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const data = parsed.data;

  if (data.honeypot && data.honeypot.trim().length > 0) {
    return NextResponse.json({ ok: true, submitted: true });
  }

  const supabase = createAdminClient();

  // Resolve product UUID from slug if it is not a valid UUID format
  let resolvedProductId: string | null = null;
  if (data.productId) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.productId);
    if (isUuid) {
      resolvedProductId = data.productId;
    } else {
      const { data: prod } = await supabase
        .from("product_translations")
        .select("product_id")
        .eq("slug", data.productId)
        .limit(1)
        .maybeSingle();
      if (prod) {
        resolvedProductId = prod.product_id;
      }
    }
  }

  // Resolve category UUID from slug if it is not a valid UUID format
  let resolvedCategoryId: string | null = null;
  if (data.categoryId) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.categoryId);
    if (isUuid) {
      resolvedCategoryId = data.categoryId;
    } else {
      const { data: cat } = await supabase
        .from("product_category_translations")
        .select("category_id")
        .eq("slug", data.categoryId)
        .limit(1)
        .maybeSingle();
      if (cat) {
        resolvedCategoryId = cat.category_id;
      }
    }
  }

  const { data: quote, error: insertError } = await supabase
    .from("quote_requests")
    .insert({
      full_name: data.fullName,
      phone: data.phone,
      email: data.email || null,
      company: data.company || null,
      service: data.service || null,
      message: data.message,
      preferred_locale: data.locale,
      product_id: resolvedProductId,
      category_id: resolvedCategoryId,
      source_path: data.sourcePath,
      source_url: data.sourceUrl || null,
      status: "new",
    })
    .select("id")
    .single();

  if (insertError || !quote) {
    console.error("Failed to persist quote request:", insertError);
    return NextResponse.json(
      { ok: false, code: "PERSIST_ERROR", message: "Unable to submit request." },
      { status: 500 },
    );
  }

  // Insert initial event into quote_request_events for audit trail
  await supabase
    .from("quote_request_events")
    .insert({
      quote_request_id: quote.id,
      actor_id: null,
      old_status: null,
      new_status: "new",
      note: "Yêu cầu báo giá mới được gửi từ trang liên hệ.",
    });

  const recipients = await getQuoteRecipients();
  const notificationRows = recipients.map((r) => ({
    quote_request_id: quote.id,
    recipient_email: r.email,
    provider: "brevo",
    status: "pending" as const,
  }));

  if (notificationRows.length > 0) {
    const { error: notifError } = await supabase.from("quote_notifications").insert(notificationRows);
    if (notifError) {
      console.error("Failed to queue quote notifications:", notifError);
    }
  }

  // Resolve Brevo SMTP credentials — the admin-configured secrets (integration_secrets,
  // AES-GCM encrypted) take precedence over the BREVO_SMTP_LOGIN/BREVO_SMTP_KEY env vars —
  // and the sender address from site_settings.quote_sender_email (env BREVO_SENDER_EMAIL as
  // fallback), so the values configured through the admin panel are actually used when sending.
  let smtpLogin: string | null = env.BREVO_SMTP_LOGIN || process.env.BREVO_SMTP_LOGIN || null;
  let smtpKey: string | null = env.BREVO_SMTP_KEY || process.env.BREVO_SMTP_KEY || null;
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
        console.error(`Failed to decrypt ${secret.key_name}, falling back to env:`, err);
      }
    }
  }

  const { data: senderSettings } = await supabase
    .from("site_settings")
    .select("quote_sender_email")
    .limit(1)
    .maybeSingle();
  // No hardcoded domain fallback: the sender address must be a mailbox verified in Brevo
  // (Single Sender Verification, since there's no company domain yet) — a made-up fallback
  // address would just fail the send the same way an unverified one would.
  const fromAddress = senderSettings?.quote_sender_email?.trim() || env.BREVO_SENDER_EMAIL || process.env.BREVO_SENDER_EMAIL || null;
  if (!fromAddress) {
    console.warn(
      "[quote] No verified sender configured (site_settings.quote_sender_email / BREVO_SENDER_EMAIL). " +
        "Set one to a mailbox verified in Brevo (Single Sender Verification) or the send will be skipped.",
    );
  }

  // Send the internal sales notification inline, tracking the real outcome so the
  // queued rows reflect it (sent / failed / skipped) instead of always "sent".
  let emailError: string | null = null;
  let providerMessageId: string | null = null;
  let sendAttempted = false;
  if (recipients.length > 0 && smtpLogin && smtpKey && fromAddress) {
    sendAttempted = true;
    try {
      const transporter = getBrevoTransporter(smtpLogin, smtpKey);
      const sendResult = await transporter.sendMail({
        from: fromAddress,
        to: recipients.map((r) => r.email),
        subject: `Yêu cầu báo giá mới từ ${data.fullName}`,
        html: renderManagerQuoteEmail({
          fullName: data.fullName,
          phone: data.phone,
          email: data.email || "",
          company: data.company || undefined,
          service: data.service || undefined,
          message: data.message,
          sourcePath: data.sourcePath,
          locale: data.locale,
        }),
      });
      providerMessageId = sendResult.messageId ?? null;
    } catch (err) {
      emailError = err instanceof Error ? err.message : "Unknown email error";
    }
  }

  // Reflect the true outcome on the queued notification rows. When no send was
  // attempted (no recipients or no API key configured) the rows are 'skipped',
  // never 'sent'.
  if (notificationRows.length > 0) {
    const notificationStatus = !sendAttempted
      ? "skipped"
      : emailError
        ? "failed"
        : "sent";
    const { error: updateError } = await supabase
      .from("quote_notifications")
      .update({
        status: notificationStatus,
        last_error: emailError,
        provider_message_id: providerMessageId,
        sent_at: notificationStatus === "sent" ? new Date().toISOString() : null,
        attempt_count: sendAttempted ? 1 : 0,
      })
      .eq("quote_request_id", quote.id);
    if (updateError) {
      console.error("Failed to update quote notification status:", updateError);
    }
  }

  return NextResponse.json({ ok: true, submitted: true });
}

 