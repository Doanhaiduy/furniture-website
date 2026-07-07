import { NextResponse } from "next/server";
import { rateLimitCheck } from "@/lib/quotes/rate-limit";
import { getQuoteRequestSchema } from "@/lib/validations/quote";
import { createAdminClient } from "@/lib/supabase/server";
import { getQuoteRecipients } from "@/lib/quotes/recipients";
import { getResendClient } from "@/lib/resend/client";
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
    provider: "resend",
    status: "pending" as const,
  }));

  if (notificationRows.length > 0) {
    const { error: notifError } = await supabase.from("quote_notifications").insert(notificationRows);
    if (notifError) {
      console.error("Failed to queue quote notifications:", notifError);
    }
  }

  // Resolve the Resend API key — the admin-configured secret (integration_secrets,
  // AES-GCM encrypted) takes precedence over the RESEND_API_KEY env var — and the
  // sender address from site_settings.quote_sender_email (env RESEND_FROM as fallback),
  // so the values configured through the admin panel are actually used when sending.
  let resendApiKey: string | null = env.RESEND_API_KEY || process.env.RESEND_API_KEY || null;
  const encryptionKey = env.AI_SECRET_ENCRYPTION_KEY || process.env.AI_SECRET_ENCRYPTION_KEY;
  const { data: keySecret } = await supabase
    .from("integration_secrets")
    .select("encrypted_value")
    .eq("key_name", "resend_api_key")
    .maybeSingle();
  if (keySecret?.encrypted_value && encryptionKey) {
    try {
      resendApiKey = decryptSecret(keySecret.encrypted_value, encryptionKey);
    } catch (err) {
      console.error("Failed to decrypt resend_api_key, falling back to env:", err);
    }
  }

  const { data: senderSettings } = await supabase
    .from("site_settings")
    .select("quote_sender_email")
    .limit(1)
    .maybeSingle();
  const configuredFrom = senderSettings?.quote_sender_email?.trim() || process.env.RESEND_FROM || null;
  // The default domain MUST match the site's real domain (phuongdong.vn) — the previous
  // fallback used .com, an almost-certainly-unverified domain, so Resend rejected the send
  // (403) and the sales team silently never received the lead notification.
  const fromAddress = configuredFrom || "noreply@phuongdong.vn";
  if (!configuredFrom) {
    console.warn(
      "[quote] No verified sender configured (site_settings.quote_sender_email / RESEND_FROM). " +
        "Falling back to noreply@phuongdong.vn — the domain must be verified in Resend or the send will fail with 403.",
    );
  }

  // Send the internal sales notification inline, tracking the real outcome so the
  // queued rows reflect it (sent / failed / skipped) instead of always "sent".
  let emailError: string | null = null;
  let providerMessageId: string | null = null;
  let sendAttempted = false;
  if (recipients.length > 0 && resendApiKey) {
    sendAttempted = true;
    try {
      const client = getResendClient(resendApiKey);
      const { data: sendResult, error: sendError } = await client.emails.send({
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
      if (sendError) {
        emailError = sendError.message;
      } else {
        providerMessageId = sendResult?.id ?? null;
      }
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

 