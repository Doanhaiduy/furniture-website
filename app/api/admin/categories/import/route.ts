import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createAdminCategory, updateAdminCategory } from "@/lib/supabase/mutations";
import { writeAuditLog } from "@/lib/supabase/audit";
import { decryptSecret } from "@/lib/security/encryption";
import { env } from "@/lib/env/schema";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function translateCategoryFields(
  apiKey: string,
  model: string,
  fields: {
    name_vi: string;
    description_vi?: string | null;
  }
) {
  const prompt = `You are a professional translator. Translate the following Vietnamese category attributes to English.
Ensure the vocabulary matches a luxury furniture and sanitary equipment showroom.
Preserve tone, formatting and do not summarize.
Output MUST be a single, valid JSON object containing exactly the translated fields with keys matching the input JSON keys.
Do NOT wrap the response in markdown code blocks or add any text other than the JSON string.

Input JSON:
${JSON.stringify({
  name_en: fields.name_vi,
  description_en: fields.description_vi || ""
}, null, 2)}
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const apiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (apiRes.ok) {
      const apiData = await apiRes.json();
      const outputText = apiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const cleanedText = outputText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedText);
      return {
        name_en: parsed.name_en || null,
        description_en: parsed.description_en || null
      };
    } else {
      const errTxt = await apiRes.text();
      console.error("Gemini API error during translation:", errTxt);
    }
  } catch (err) {
    console.error("Gemini translation error for category:", err);
  }

  return {
    name_en: fields.name_vi,
    description_en: fields.description_vi || null
  };
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "editor")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "validate"; // validate | commit

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Buffer.from(buffer) as any);

    const ws = workbook.worksheets[0];
    if (!ws) {
      return NextResponse.json({ error: "Worksheet is empty" }, { status: 400 });
    }

    const headers: string[] = [];
    const headerRow = ws.getRow(1);
    headerRow.eachCell((cell, colIdx) => {
      headers[colIdx] = cell.text.trim();
    });

    // Validate headers
    const requiredHeaders = [
      "Tên danh mục (Tiếng Việt)*",
      "Mã nhóm hàng (wood/sanitary/tiles/other)*"
    ];
    for (const reqH of requiredHeaders) {
      if (!headers.includes(reqH)) {
        return NextResponse.json({
          error: `File không đúng định dạng template. Thiếu cột bắt buộc: "${reqH}". Vui lòng tải template mới nhất.`
        }, { status: 400 });
      }
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

    // Fetch existing categories to validate parent relationships and slug uniqueness
    const { data: dbCategories } = await supabase
      .from("product_categories")
      .select("id, parent_id, product_category_translations(locale, slug, name)")
      .is("deleted_at", null);

    const categoriesMap: Record<string, string> = {}; // slug -> id
    const categoriesList: any[] = [];
    const activeCategoryIds = new Set((dbCategories ?? []).map(c => c.id));
    (dbCategories ?? []).forEach(c => {
      const trans = Array.isArray(c.product_category_translations) ? c.product_category_translations : [];
      trans.forEach((t: any) => {
        if (t.slug) {
          const slugKey = t.slug.trim().toLowerCase();
          categoriesMap[slugKey] = c.id;
          categoriesList.push({ id: c.id, slug: slugKey, name: t.name || "" });
        }
      });
    });

    const parsedRows: any[] = [];
    const errors: any[] = [];
    let successCount = 0;
    let errorCount = 0;

    const createdIds: string[] = [];
    const updatedIds: string[] = [];

    // Track slugs seen within this file to catch in-file duplicates
    const seenSlugs = new Set<string>();

    const rowCount = ws.rowCount;
    const actualDataRowsCount = rowCount - 2;
    if (actualDataRowsCount > 1000) {
      return NextResponse.json({ error: "Số dòng import tối đa vượt quá giới hạn 1000 dòng." }, { status: 400 });
    }

    for (let r = 3; r <= rowCount; r++) {
      const row = ws.getRow(r);
      let hasData = false;
      row.eachCell((cell) => {
        if (cell.text && cell.text.trim()) hasData = true;
      });
      if (!hasData) continue;

      const rowData: Record<string, any> = {};
      headers.forEach((header, colIdx) => {
        if (header) {
          const val = row.getCell(colIdx).text;
          rowData[header] = val ? val.trim() : "";
        }
      });

      const rowNum = r;
      const nameVi = rowData["Tên danh mục (Tiếng Việt)*"];
      const rawGroupKey = rowData["Mã nhóm hàng (wood/sanitary/tiles/other)*"];
      let parentSlug = rowData["Slug danh mục cha (để trống nếu là nhóm gốc)"];
      if (parentSlug) {
        const match = parentSlug.trim().match(/\(([^)]+)\)$/);
        if (match) parentSlug = match[1].trim();
      }
      const coverImageUrl = rowData["Ảnh chính (URL)"];
      const status = rowData["Trạng thái (draft/published/archived)"] || "draft";
      const idVal = rowData["ID danh mục (để trống nếu tạo mới)"];

      const rowErrors: string[] = [];

      if (!nameVi) rowErrors.push("Thiếu Tên danh mục (Tiếng Việt)");
      if (!rawGroupKey) rowErrors.push("Thiếu Mã nhóm hàng");

      // Validate group key
      if (rawGroupKey && !["wood", "sanitary", "tiles", "other"].includes(rawGroupKey.toLowerCase())) {
        rowErrors.push("Mã nhóm hàng phải là wood, sanitary, tiles hoặc other");
      }

      // Check parent category existence
      let parentId: string | null = null;
      if (parentSlug) {
        parentId = categoriesMap[parentSlug.toLowerCase()] || null;
        if (!parentId) {
          rowErrors.push(`Danh mục cha có slug '${parentSlug}' không tồn tại trong hệ thống`);
        }
      }

      // Validate URL format for cover image
      if (coverImageUrl && !/^https?:\/\/.+/i.test(coverImageUrl)) {
        rowErrors.push("Đường dẫn Ảnh chính (URL) không hợp lệ (phải bắt đầu bằng http:// hoặc https://)");
      }

      // Validate enum fields
      if (!["draft", "published", "archived"].includes(status.toLowerCase())) {
        rowErrors.push("Trạng thái phải là draft, published hoặc archived");
      }

      // Generate slug and check duplicates
      const generatedSlug = nameVi ? slugify(nameVi) : "";
      if (generatedSlug) {
        const existingCatId = categoriesMap[generatedSlug];
        if (existingCatId) {
          if (!idVal || idVal !== existingCatId) {
            rowErrors.push(`Tên danh mục trùng lặp, slug '${generatedSlug}' đã được sử dụng bởi danh mục khác`);
          }
        }
        if (seenSlugs.has(generatedSlug)) {
          rowErrors.push(`Slug '${generatedSlug}' bị trùng lặp ngay trong file import`);
        }
        seenSlugs.add(generatedSlug);
      }

      // Check ID existence if update mode
      let isUpdate = false;
      if (idVal) {
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idVal)) {
          rowErrors.push("ID danh mục không đúng định dạng UUID");
        } else if (!activeCategoryIds.has(idVal)) {
          rowErrors.push("ID danh mục không tồn tại hoặc đã bị xóa");
        } else {
          isUpdate = true;
        }
      }

      const isValid = rowErrors.length === 0;

      if (!isValid) {
        errorCount++;
        rowErrors.forEach(msg => {
          errors.push({
            row: rowNum,
            field: "row",
            value: nameVi || "",
            message: msg
          });
        });
      } else {
        if (mode === "commit") {
          try {
            const groupKeyMapped = rawGroupKey.toLowerCase() === "wood" ? "wooden_furniture"
              : rawGroupKey.toLowerCase() === "sanitary" ? "sanitary_equipment"
              : rawGroupKey.toLowerCase() === "tiles" ? "tiles"
              : "project_solutions";

            // Call Gemini translation if API key is present
            let translated = {
              name_en: null as string | null,
              description_en: null as string | null
            };

            if (apiKey) {
              const model = env.GEMINI_DEFAULT_MODEL || "gemini-1.5-flash";
              translated = await translateCategoryFields(apiKey, model, {
                name_vi: nameVi,
                description_vi: rowData["Mô tả (Tiếng Việt)"] || null
              });
            }

            const payload = {
              slug: generatedSlug,
              name_vi: nameVi,
              name_en: translated.name_en || nameVi,
              description_vi: rowData["Mô tả (Tiếng Việt)"] || null,
              description_en: translated.description_en || rowData["Mô tả (Tiếng Việt)"] || null,
              group_key: groupKeyMapped as any,
              parent_id: parentId,
              sort_order: rowData["Thứ tự hiển thị"] ? Number(rowData["Thứ tự hiển thị"]) : 0,
              status: status.toLowerCase() as any,
              cover_image: coverImageUrl || null,
              seo_title_vi: null,
              seo_title_en: null,
              seo_description_vi: null,
              seo_description_en: null,
            };

            let res;
            if (isUpdate) {
              res = await updateAdminCategory(idVal, payload);
              if (res.success) {
                successCount++;
                updatedIds.push(idVal);
              } else {
                errorCount++;
                errors.push({
                  row: rowNum,
                  field: "database",
                  value: nameVi,
                  message: res.error || "Lỗi cập nhật danh mục vào database"
                });
              }
            } else {
              res = await createAdminCategory(payload);
              if (res.success && res.id) {
                successCount++;
                createdIds.push(res.id);
              } else {
                errorCount++;
                errors.push({
                  row: rowNum,
                  field: "database",
                  value: nameVi,
                  message: res.error || "Lỗi thêm danh mục vào database"
                });
              }
            }
          } catch (dbErr: any) {
            errorCount++;
            errors.push({
              row: rowNum,
              field: "database",
              value: nameVi,
              message: dbErr.message || "Database connection error"
            });
          }
        } else {
          successCount++;
        }
      }

      parsedRows.push({
        row: rowNum,
        name: nameVi || "",
        isValid,
        errors: rowErrors
      });
    }

    if (mode === "commit" && (createdIds.length > 0 || updatedIds.length > 0)) {
      try {
        await writeAuditLog(supabase, {
          actorId: user.id,
          action: "create",
          entityType: "import_batch",
          entityId: "00000000-0000-0000-0000-000000000000",
          metadata: {
            module: "categories",
            success_count: successCount,
            error_count: errorCount,
            created_count: createdIds.length,
            updated_count: updatedIds.length
          }
        });
      } catch (auditErr) {
        console.error("Audit log failed for category import batch:", auditErr);
      }
    }

    return NextResponse.json({
      total_rows: parsedRows.length,
      success_count: successCount,
      error_count: errorCount,
      errors,
      created_ids: createdIds,
      updated_ids: updatedIds,
      preview: parsedRows
    });

  } catch (err: any) {
    console.error("Error importing categories:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
