/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createAdminBrand, updateAdminBrand } from "@/lib/supabase/brands-mutations";
import { writeAuditLog } from "@/lib/supabase/audit";
import { decryptSecret } from "@/lib/security/encryption";
import { env } from "@/lib/env/schema";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function translateBrandFields(
  apiKey: string,
  model: string,
  fields: { name_vi: string; description_vi?: string | null }
) {
  const prompt = `You are a professional translator. Translate the following Vietnamese brand attributes to English.
Ensure the vocabulary matches a luxury furniture and sanitary equipment showroom.
Preserve tone and do not summarize. Brand proper names usually stay unchanged.
Output MUST be a single, valid JSON object with keys name_en and description_en.
Do NOT wrap the response in markdown code blocks or add any other text.

Input JSON:
${JSON.stringify({ name_en: fields.name_vi, description_en: fields.description_vi || "" }, null, 2)}
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const apiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    if (apiRes.ok) {
      const apiData = await apiRes.json();
      const outputText = apiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const cleaned = outputText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return {
        name_en: parsed.name_en || null,
        description_en: parsed.description_en || null,
      };
    }
    console.error("Gemini API error during brand translation:", await apiRes.text());
  } catch (err) {
    console.error("Gemini translation error for brand:", err);
  }
  return { name_en: null as string | null, description_en: null as string | null };
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "editor")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "validate";

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // DoS/OOM guard: bound upload size before loading the whole workbook into memory.
    const MAX_IMPORT_BYTES = 5 * 1024 * 1024; // 5 MB
    if (typeof file.size === "number" && file.size > MAX_IMPORT_BYTES) {
      return NextResponse.json(
        { error: "Tệp quá lớn (giới hạn 5MB). Vui lòng chia nhỏ dữ liệu import." },
        { status: 413 },
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Buffer.from(buffer) as any);

    const ws = workbook.worksheets[0];
    if (!ws) {
      return NextResponse.json({ error: "Worksheet is empty" }, { status: 400 });
    }

    const headers: string[] = [];
    ws.getRow(1).eachCell((cell, colIdx) => {
      headers[colIdx] = cell.text.trim();
    });

    const requiredHeaders = ["Tên thương hiệu (Tiếng Việt)*"];
    for (const reqH of requiredHeaders) {
      if (!headers.includes(reqH)) {
        return NextResponse.json(
          {
            error: `File không đúng định dạng template. Thiếu cột bắt buộc: "${reqH}". Vui lòng tải template mới nhất.`,
          },
          { status: 400 }
        );
      }
    }

    const supabase = createAdminClient();

    // Gemini key (optional, for auto-translation of EN fields)
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

    // Existing brand slugs for uniqueness checks
    const { data: dbBrands } = await supabase
      .from("brands")
      .select("id, slug")
      .is("deleted_at", null);
    const slugMap: Record<string, string> = {}; // slug -> id
    (dbBrands ?? []).forEach((b) => {
      if (b.slug) slugMap[b.slug.trim().toLowerCase()] = b.id;
    });
    const activeBrandIds = new Set((dbBrands ?? []).map((b) => b.id));

    const parsedRows: any[] = [];
    const errors: any[] = [];
    let successCount = 0;
    let errorCount = 0;
    const createdIds: string[] = [];
    const updatedIds: string[] = [];

    const rowCount = ws.rowCount;
    if (rowCount - 2 > 1000) {
      return NextResponse.json({ error: "Số dòng import tối đa vượt quá giới hạn 1000 dòng." }, { status: 400 });
    }

    // Track slugs seen within this file to catch in-file duplicates
    const seenSlugs = new Set<string>();

    for (let r = 3; r <= rowCount; r++) {
      const row = ws.getRow(r);
      let hasData = false;
      row.eachCell((cell) => {
        if (cell.text && cell.text.trim()) hasData = true;
      });
      if (!hasData) continue;

      const rowData: Record<string, string> = {};
      headers.forEach((header, colIdx) => {
        if (header) {
          const val = row.getCell(colIdx).text;
          rowData[header] = val ? val.trim() : "";
        }
      });

      const rowNum = r;
      const nameVi = rowData["Tên thương hiệu (Tiếng Việt)*"];
      const nameEn = rowData["Tên thương hiệu (Tiếng Anh)"];
      const descVi = rowData["Mô tả (Tiếng Việt)"];
      const descEn = rowData["Mô tả (Tiếng Anh)"];
      const origin = rowData["Xuất xứ (Origin)"];
      const logoUrl = rowData["Logo (URL)"];
      const sortOrderRaw = rowData["Thứ tự hiển thị"];
      const status = (rowData["Trạng thái (draft/published/archived)"] || "draft").toLowerCase();
      const idVal = rowData["ID thương hiệu (để trống nếu tạo mới)"];

      const rowErrors: string[] = [];

      if (!nameVi) rowErrors.push("Thiếu Tên thương hiệu (Tiếng Việt)");

      if (logoUrl && !/^https?:\/\/.+/i.test(logoUrl)) {
        rowErrors.push("Đường dẫn Logo (URL) không hợp lệ (phải bắt đầu bằng http:// hoặc https://)");
      }

      if (!["draft", "published", "archived"].includes(status)) {
        rowErrors.push("Trạng thái phải là draft, published hoặc archived");
      }

      if (sortOrderRaw && isNaN(Number(sortOrderRaw))) {
        rowErrors.push("Thứ tự hiển thị phải là số");
      }

      let isUpdate = false;
      if (idVal) {
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idVal)) {
          rowErrors.push("ID thương hiệu không đúng định dạng UUID");
        } else if (!activeBrandIds.has(idVal)) {
          rowErrors.push("ID thương hiệu không tồn tại hoặc đã bị xóa");
        } else {
          isUpdate = true;
        }
      }

      const generatedSlug = nameVi ? slugify(nameVi) : "";
      if (generatedSlug) {
        const existingId = slugMap[generatedSlug];
        if (existingId && (!idVal || idVal !== existingId)) {
          rowErrors.push(`Tên thương hiệu trùng lặp, slug '${generatedSlug}' đã được sử dụng bởi thương hiệu khác`);
        }
        if (seenSlugs.has(generatedSlug)) {
          rowErrors.push(`Slug '${generatedSlug}' bị trùng lặp ngay trong file import`);
        }
        seenSlugs.add(generatedSlug);
      }

      const isValid = rowErrors.length === 0;

      if (!isValid) {
        errorCount++;
        rowErrors.forEach((msg) => {
          errors.push({ row: rowNum, field: "row", value: nameVi || "", message: msg });
        });
      } else if (mode === "commit") {
        try {
          let finalNameEn = nameEn || null;
          let finalDescEn = descEn || null;

          if (apiKey && (!finalNameEn || (descVi && !finalDescEn))) {
            const model = env.GEMINI_DEFAULT_MODEL || "gemini-1.5-flash";
            const translated = await translateBrandFields(apiKey, model, {
              name_vi: nameVi,
              description_vi: descVi || null,
            });
            finalNameEn = finalNameEn || translated.name_en;
            finalDescEn = finalDescEn || translated.description_en;
          }

          const payload = {
            name_vi: nameVi,
            name_en: finalNameEn || nameVi,
            description_vi: descVi || undefined,
            description_en: finalDescEn || descVi || undefined,
            origin: origin || undefined,
            logo_url: logoUrl || undefined,
            status: status as "draft" | "published" | "archived",
            sort_order: sortOrderRaw ? Number(sortOrderRaw) : 0,
            slug: generatedSlug,
          };

          if (isUpdate) {
            const res = await updateAdminBrand(idVal, payload);
            if (res.success) {
              successCount++;
              updatedIds.push(idVal);
            } else {
              errorCount++;
              errors.push({ row: rowNum, field: "database", value: nameVi, message: res.error || "Lỗi cập nhật thương hiệu" });
            }
          } else {
            const res = await createAdminBrand(payload);
            if (res.success && res.id) {
              successCount++;
              createdIds.push(res.id);
              // Reserve slug so later rows can't collide with the just-created brand
              if (generatedSlug) slugMap[generatedSlug] = res.id;
            } else {
              errorCount++;
              errors.push({ row: rowNum, field: "database", value: nameVi, message: res.error || "Lỗi thêm thương hiệu" });
            }
          }
        } catch (dbErr: any) {
          errorCount++;
          errors.push({ row: rowNum, field: "database", value: nameVi, message: dbErr.message || "Database connection error" });
        }
      } else {
        successCount++;
      }

      parsedRows.push({ row: rowNum, name: nameVi || "", isValid, errors: rowErrors });
    }

    if (mode === "commit" && (createdIds.length > 0 || updatedIds.length > 0)) {
      try {
        await writeAuditLog(supabase, {
          actorId: user.id,
          action: "create",
          entityType: "import_batch",
          entityId: "00000000-0000-0000-0000-000000000000",
          metadata: {
            module: "brands",
            success_count: successCount,
            error_count: errorCount,
            created_count: createdIds.length,
            updated_count: updatedIds.length,
          },
        });
      } catch (auditErr) {
        console.error("Audit log failed for brand import batch:", auditErr);
      }
    }

    return NextResponse.json({
      total_rows: parsedRows.length,
      success_count: successCount,
      error_count: errorCount,
      errors,
      created_ids: createdIds,
      updated_ids: updatedIds,
      preview: parsedRows,
    });
  } catch (err: any) {
    console.error("Error importing brands:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
