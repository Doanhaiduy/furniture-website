import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { decryptSecret } from "@/lib/security/encryption";
import { env } from "@/lib/env/schema";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "editor")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { task, inputText, targetLocale = "en", targetType = "product", targetId = null } = body;

    if (!inputText || !inputText.trim()) {
      return NextResponse.json({ error: "Input text is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Get Gemini API key
    let apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    const encryptionKey = env.AI_SECRET_ENCRYPTION_KEY || process.env.AI_SECRET_ENCRYPTION_KEY;

    const { data: secret } = await supabase
      .from("integration_secrets")
      .select("encrypted_value")
      .eq("key_name", "gemini_api_key")
      .maybeSingle();

    if (secret?.encrypted_value && encryptionKey) {
      try {
        apiKey = decryptSecret(secret.encrypted_value, encryptionKey);
      } catch (err) {
        console.error("Failed to decrypt gemini_api_key from DB, falling back to ENV:", err);
      }
    }

    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
    }

    // 2. Build AI prompt based on task
    let prompt = "";
    if (task === "translate") {
      prompt = `Translate the following Vietnamese text to English. Return only the translated text, preserving the tone, structure and format. Output should be natural and clean:\n\n${inputText}`;
      if (targetLocale === "vi") {
        prompt = `Dịch đoạn văn bản tiếng Anh sau sang tiếng Việt. Chỉ trả về văn bản đã dịch, giữ nguyên định dạng:\n\n${inputText}`;
      }
    } else if (task === "seo") {
      prompt = `Generate optimized SEO meta tags for a furniture/sanitary product in ${targetLocale === "en" ? "English" : "Vietnamese"}. Input product info:\n${inputText}\n\nReturn a JSON object with keys "title" (around 50-60 chars) and "description" (around 150-160 chars). Return ONLY the raw JSON string, do not wrap in markdown codeblocks.`;
    } else if (task === "outline") {
      prompt = `Create a structured article outline in ${targetLocale === "en" ? "English" : "Vietnamese"} for a blog post based on this topic:\n${inputText}`;
    } else if (task === "generate-content") {
      if (targetType === "product") {
        prompt = `You are a professional copywriting assistant for a luxury furniture and sanitary showroom named "Showroom Nội Thất Phương Đông".
Based on the following topic or product name: "${inputText}", generate comprehensive draft details for a product profile.
You MUST respond with a single, raw, valid JSON object containing exactly these keys. Ensure the content feels high-end, premium, and professional. Translate/generate both Vietnamese and English versions.
Do NOT wrap the response in markdown code blocks or add any markdown formatting. Output ONLY the JSON string.
IMPORTANT — HTML rules: ONLY "viBody" and "enBody" may contain HTML tags. EVERY other field (titles, slugs, summaries, SEO fields, materials, dimensions, and ALL spec* fields) MUST be plain text — NO HTML tags (no <p>, <ul>, <li>, <strong>, etc.), NO markdown, NO bullet/numbered lists, NO line breaks. Each spec* field must be a single short readable phrase (roughly 3-12 words).

JSON Schema:
{
  "viTitle": "tên sản phẩm tiếng Việt",
  "enTitle": "product name in English",
  "viSlug": "url-slug-tieng-viet",
  "enSlug": "url-slug-english",
  "viSummary": "tóm tắt ngắn gọn tiếng Việt (1-2 câu)",
  "enSummary": "short English summary (1-2 sentences)",
  "viBody": "mô tả chi tiết bằng HTML tiếng Việt (sử dụng p, strong, ul, li)",
  "enBody": "detailed description in HTML English (using p, strong, ul, li)",
  "seoTitleVi": "tiêu đề SEO tiếng Việt (< 60 ký tự)",
  "seoTitleEn": "SEO title English (< 60 characters)",
  "seoDescVi": "mô tả SEO tiếng Việt (< 160 ký tự)",
  "seoDescEn": "SEO description English (< 160 characters)",
  "materialsVi": "chất liệu tiếng Việt (văn bản thuần, KHÔNG HTML)",
  "materialsEn": "materials in English (plain text, NO HTML)",
  "dimensionsVi": "kích thước (ví dụ: 2000 x 900 x 750 mm)",
  "dimensionsEn": "dimensions (same or English format)",
  "specMaterialVi": "thông số chất liệu tiếng Việt (1 câu ngắn, văn bản thuần, KHÔNG HTML, KHÔNG danh sách)",
  "specMaterialEn": "spec materials in English (one short phrase, plain text, NO HTML, NO lists)",
  "specFinishVi": "hoàn thiện bề mặt tiếng Việt (1 câu ngắn, văn bản thuần, KHÔNG HTML, KHÔNG danh sách)",
  "specFinishEn": "finish description in English (one short phrase, plain text, NO HTML, NO lists)",
  "specCareVi": "hướng dẫn bảo quản tiếng Việt (1 câu ngắn, văn bản thuần, KHÔNG HTML, KHÔNG danh sách)",
  "specCareEn": "care instructions in English (one short phrase, plain text, NO HTML, NO lists)"
}`;
      } else {
        prompt = `You are a professional copywriting assistant for a luxury furniture and sanitary showroom named "Showroom Nội Thất Phương Đông".
Based on the following topic or blog post title: "${inputText}", generate comprehensive draft details for a blog article.
You MUST respond with a single, raw, valid JSON object containing exactly these keys. Ensure the content feels high-end, premium, and professional. Translate/generate both Vietnamese and English versions.
Do NOT wrap the response in markdown code blocks or add any markdown formatting. Output ONLY the JSON string.

JSON Schema:
{
  "viTitle": "tiêu đề bài viết tiếng Việt",
  "enTitle": "blog title in English",
  "viSlug": "url-slug-tieng-viet",
  "enSlug": "url-slug-english",
  "viSummary": "tóm tắt ngắn gọn bài viết tiếng Việt",
  "enSummary": "short English summary of the post",
  "viBody": "nội dung chi tiết bằng HTML tiếng Việt. BẮT BUỘC phải chia bài viết thành 3-4 phần lớn sử dụng tiêu đề thẻ h2 (ví dụ: <h2>Tiêu đề phần</h2> - NGHIÊM CẤM tự đánh số thứ tự như 1, 2, 3...) và các mục nhỏ bằng thẻ h3 (ví dụ: <h3>Tiêu đề mục con</h3> - NGHIÊM CẤM tự đánh số thứ tự như 2.1, 2.2...) xen kẽ các thẻ p, strong, ul, li để hệ thống tự động nhận diện sinh mục lục.",
  "enBody": "detailed post content in HTML English. MUST split the content into 3-4 main sections using h2 tags (e.g. <h2>Section Title</h2> - DO NOT include numerical prefixes like 1, 2, 3...) and sub-sections using h3 tags (e.g. <h3>Subsection Title</h3> - DO NOT include numerical prefixes like 2.1, 2.2...) mixed with p, strong, ul, li tags so the system can auto-generate the table of contents.",
  "seoTitleVi": "tiêu đề SEO tiếng Việt (< 60 ký tự)",
  "seoTitleEn": "SEO title English (< 60 characters)",
  "seoDescVi": "mô tả SEO tiếng Việt (< 160 ký tự)",
  "seoDescEn": "SEO description English (< 160 characters)"
}`;
      }
    } else {
      return NextResponse.json({ error: "Invalid task type" }, { status: 400 });
    }

    // 3. Call Gemini REST API
    const model = env.GEMINI_DEFAULT_MODEL || process.env.GEMINI_DEFAULT_MODEL || "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const apiRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      console.error("Gemini API error:", errorText);
      return NextResponse.json({ error: "Gemini API responded with an error" }, { status: 502 });
    }

    const apiData = await apiRes.json();
    const outputText = apiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // 4. Try parsing JSON if task is SEO or generate-content
    let outputJson: Record<string, unknown> = { text: outputText };
    if (task === "seo" || task === "generate-content") {
      try {
        const cleanedText = outputText.replace(/```json/g, "").replace(/```/g, "").trim();
        outputJson = JSON.parse(cleanedText);
      } catch {
        if (task === "seo") {
          outputJson = { title: "", description: "", raw: outputText };
        } else {
          outputJson = { error: "Failed to parse JSON", raw: outputText };
        }
      }
    }

    // 5. Log activity into ai_drafts
    const { error: logError } = await supabase.from("ai_drafts").insert({
      target_type: targetType,
      target_id: targetId,
      locale: targetLocale,
      prompt_type: task,
      output_json: outputJson,
      status: "draft",
      requested_by: user.id,
    });

    if (logError) {
      console.error("Failed to insert AI draft log into DB:", logError);
    }

    return NextResponse.json({
      success: true,
      text: outputText,
      data: outputJson,
    });
  } catch (err) {
    console.error("Exception in generate-draft route:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}