import { NextResponse } from "next/server";
import { rateLimitCheck } from "@/lib/quotes/rate-limit";
import { quoteRequestSchema } from "@/lib/validations/quote";
import { createAdminClient } from "@/lib/supabase/server";
import { getQuoteRecipients } from "@/lib/quotes/recipients";
import { resend } from "@/lib/resend/client";
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
  const parsed = quoteRequestSchema.safeParse(body);

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

  let emailError: string | null = null;
  if (recipients.length > 0 && process.env.RESEND_API_KEY) {
    try {
      const { error: sendError } = await resend.emails.send({
        from: process.env.RESEND_FROM || "noreply@phuongdong.com",
        to: recipients.map((r) => r.email),
        subject: `New quote request from ${data.fullName}`,
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
      }
    } catch (err) {
      emailError = err instanceof Error ? err.message : "Unknown email error";
    }
  }

  const notificationStatus = emailError ? "failed" : "sent";
  if (notificationRows.length > 0) {
    const notificationIds = notificationRows.map((_r, idx) => {
      const rows = notificationRows;
      return { idx };
    });
    await supabase
      .from("quote_notifications")
      .update({ status: notificationStatus, last_error: emailError })
      .eq("quote_request_id", quote.id);
  }

  return NextResponse.json({ ok: true, submitted: true });
}

