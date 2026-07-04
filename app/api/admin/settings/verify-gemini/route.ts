import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { decryptSecret } from "@/lib/security/encryption";
import { env } from "@/lib/env/schema";

export const dynamic = "force-dynamic";

const GEMINI_MODELS_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Verifies that a Google Gemini API key actually works by making a real,
 * lightweight call to the models list endpoint (does not consume generation
 * quota). Admin-only — validity of an integration secret must not leak to editors.
 *
 * Body: { apiKey?: string }
 *  - If a real (non-masked) key is supplied it is tested directly.
 *  - Otherwise the currently stored/encrypted key (or env fallback) is tested.
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const candidate =
      typeof body?.apiKey === "string" ? (body.apiKey as string).trim() : "";

    let apiKey: string | undefined;
    let source: "input" | "stored" | "env" = "stored";

    // Only treat the supplied value as testable when it is a real key, not the
    // masked placeholder the UI shows (e.g. "AIzaSy••••••••").
    if (candidate && !candidate.includes("•") && !candidate.includes("*")) {
      apiKey = candidate;
      source = "input";
    } else {
      const encryptionKey =
        env.AI_SECRET_ENCRYPTION_KEY || process.env.AI_SECRET_ENCRYPTION_KEY;
      const supabase = createAdminClient();
      const { data: secret } = await supabase
        .from("integration_secrets")
        .select("encrypted_value")
        .eq("key_name", "gemini_api_key")
        .maybeSingle();

      if (secret?.encrypted_value && encryptionKey) {
        try {
          apiKey = decryptSecret(secret.encrypted_value, encryptionKey);
          source = "stored";
        } catch (err) {
          console.error("verify-gemini: failed to decrypt stored key:", err);
        }
      }
      if (!apiKey) {
        apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (apiKey) source = "env";
      }
    }

    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "Chưa cấu hình khóa API Gemini." },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    let res: Response;
    try {
      res = await fetch(
        `${GEMINI_MODELS_ENDPOINT}?key=${encodeURIComponent(apiKey)}&pageSize=1`,
        { method: "GET", signal: controller.signal }
      );
    } catch {
      clearTimeout(timeout);
      return NextResponse.json(
        {
          ok: false,
          error: "Không kết nối được tới Google Gemini. Kiểm tra mạng hoặc máy chủ.",
        },
        { status: 502 }
      );
    }
    clearTimeout(timeout);

    if (res.ok) {
      const data = (await res.json().catch(() => ({}))) as { models?: unknown[] };
      const hasModels = Array.isArray(data?.models) && data.models.length > 0;
      return NextResponse.json({
        ok: true,
        source,
        message: hasModels
          ? "Khóa hợp lệ — đã kết nối Google Gemini thành công."
          : "Khóa hợp lệ nhưng chưa thấy model khả dụng cho tài khoản này.",
      });
    }

    const errBody = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    const reason = errBody?.error?.message || `HTTP ${res.status}`;
    const friendly =
      res.status === 400 || res.status === 403
        ? "Khóa API không hợp lệ hoặc không có quyền truy cập Gemini."
        : res.status === 429
          ? "Khóa hợp lệ nhưng đã vượt hạn mức sử dụng (rate limit)."
          : `Xác thực thất bại: ${reason}`;

    return NextResponse.json({ ok: false, error: friendly, status: res.status });
  } catch (err) {
    console.error("verify-gemini error:", err);
    return NextResponse.json(
      { ok: false, error: "Lỗi máy chủ khi kiểm tra khóa." },
      { status: 500 }
    );
  }
}
