import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createAdminProduct, updateAdminProduct } from "@/lib/supabase/mutations";
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

async function translateProductFields(
  apiKey: string,
  model: string,
  fields: {
    name_vi: string;
    summary_vi: string;
    material_vi?: string | null;
    dimension_display_text_vi?: string | null;
    spec_material_vi?: string | null;
    spec_finish_vi?: string | null;
    spec_care_vi?: string | null;
  }
) {
  const prompt = `You are a professional translator. Translate the following Vietnamese product attributes to English.
Ensure the vocabulary matches a luxury furniture and sanitary equipment showroom.
Preserve tone, formatting and do not summarize.
Output MUST be a single, valid JSON object containing exactly the translated fields with keys matching the input JSON keys.
Do NOT wrap the response in markdown code blocks or add any text other than the JSON string.

Input JSON:
${JSON.stringify({
  name_en: fields.name_vi,
  summary_en: fields.summary_vi,
  material_en: fields.material_vi || "",
  dimension_display_text_en: fields.dimension_display_text_vi || "",
  spec_material_en: fields.spec_material_vi || "",
  spec_finish_en: fields.spec_finish_vi || "",
  spec_care_en: fields.spec_care_vi || ""
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
        summary_en: parsed.summary_en || null,
        material_en: parsed.material_en || null,
        dimension_display_text_en: parsed.dimension_display_text_en || null,
        spec_material_en: parsed.spec_material_en || null,
        spec_finish_en: parsed.spec_finish_en || null,
        spec_care_en: parsed.spec_care_en || null
      };
    } else {
      const errTxt = await apiRes.text();
      console.error("Gemini API error during translation:", errTxt);
    }
  } catch (err) {
    console.error("Gemini translation error for product:", err);
  }

  // Fallback
  return {
    name_en: fields.name_vi,
    summary_en: fields.summary_vi,
    material_en: fields.material_vi || null,
    dimension_display_text_en: fields.dimension_display_text_vi || null,
    spec_material_en: fields.spec_material_vi || null,
    spec_finish_en: fields.spec_finish_vi || null,
    spec_care_en: fields.spec_care_vi || null
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

    // Read headers from row 1
    const headers: string[] = [];
    const headerRow = ws.getRow(1);
    headerRow.eachCell((cell, colIdx) => {
      headers[colIdx] = cell.text.trim();
    });

    // Validate headers
    const requiredHeaders = [
      "Tên sản phẩm (Tiếng Việt)*",
      "Mô tả ngắn (Tiếng Việt)*",
      "Slug danh mục*",
      "Ảnh chính (URL)*"
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

    // Fetch reference data mapping
    const { data: dbCats } = await supabase
      .from("product_categories")
      .select("id, product_category_translations(locale, slug)")
      .is("deleted_at", null);

    const categoriesMap: Record<string, string> = {}; // slug -> id
    (dbCats ?? []).forEach(c => {
      const trans = Array.isArray(c.product_category_translations) ? c.product_category_translations : [];
      trans.forEach((t: any) => {
        if (t.slug) categoriesMap[t.slug.trim().toLowerCase()] = c.id;
      });
    });

    const { data: dbBrands } = await supabase
      .from("brands")
      .select("id, slug")
      .is("deleted_at", null);

    const brandsMap: Record<string, string> = {}; // slug -> id
    (dbBrands ?? []).forEach(b => {
      if (b.slug) brandsMap[b.slug.trim().toLowerCase()] = b.id;
    });

    const { data: dbShowrooms } = await supabase
      .from("showrooms")
      .select("id, code")
      .is("deleted_at", null);

    const showroomsSet = new Set((dbShowrooms ?? []).map(s => (s.code || "").trim().toLowerCase()));

    // Fetch existing product slugs to check duplicates
    const { data: dbProducts } = await supabase
      .from("products")
      .select("id, product_translations(locale, slug)")
      .is("deleted_at", null);

    const productSlugsMap: Record<string, string> = {}; // slug -> product_id
    (dbProducts ?? []).forEach(p => {
      const trans = Array.isArray(p.product_translations) ? p.product_translations : [];
      trans.forEach((t: any) => {
        if (t.slug) productSlugsMap[t.slug.trim().toLowerCase()] = p.id;
      });
    });

    const parsedRows: any[] = [];
    const errors: any[] = [];
    let successCount = 0;
    let errorCount = 0;

    const createdIds: string[] = [];
    const updatedIds: string[] = [];

    // Limit number of rows
    const rowCount = ws.rowCount;
    const actualDataRowsCount = rowCount - 2; // Subtract header and sample row
    if (actualDataRowsCount > 1000) {
      return NextResponse.json({ error: "Số dòng import tối đa vượt quá giới hạn 1000 dòng." }, { status: 400 });
    }

    // Row indices: row 1 is header, row 2 is sample, data starts at row 3
    for (let r = 3; r <= rowCount; r++) {
      const row = ws.getRow(r);
      
      // Check if row is empty
      let hasData = false;
      row.eachCell((cell) => {
        if (cell.text && cell.text.trim()) hasData = true;
      });
      if (!hasData) continue; // Skip empty rows

      const rowData: Record<string, any> = {};
      headers.forEach((header, colIdx) => {
        if (header) {
          const val = row.getCell(colIdx).text;
          rowData[header] = val ? val.trim() : "";
        }
      });

      const rowNum = r;
      const nameVi = rowData["Tên sản phẩm (Tiếng Việt)*"];
      const summaryVi = rowData["Mô tả ngắn (Tiếng Việt)*"];
      let categorySlug = rowData["Slug danh mục*"];
      let brandSlug = rowData["Slug thương hiệu"];
      let showroomCode = rowData["Mã Showroom (Showroom Code)"] || "";
      const priceUnit = rowData["Đơn vị tính (Unit)"] || "";

      if (categorySlug) {
        const match = categorySlug.trim().match(/\(([^)]+)\)$/);
        if (match) categorySlug = match[1].trim();
      }
      if (brandSlug) {
        const match = brandSlug.trim().match(/\(([^)]+)\)$/);
        if (match) brandSlug = match[1].trim();
      }
      if (showroomCode) {
        const match = showroomCode.trim().match(/\(([^)]+)\)$/);
        if (match) showroomCode = match[1].trim();
      }
      const coverImageUrl = rowData["Ảnh chính (URL)*"];
      const status = rowData["Trạng thái (draft/published/archived)"] || "draft";
      const featured = String(rowData["Nổi bật (TRUE/FALSE)"]).toUpperCase();
      const idVal = rowData["ID sản phẩm (để trống nếu tạo mới)"];

      const priceMin = rowData["Giá tối thiểu (VND)"];
      const priceMax = rowData["Giá tối đa (VND)"];
      const width = rowData["Chiều rộng (mm)"];
      const depth = rowData["Chiều sâu (mm)"];
      const height = rowData["Chiều cao (mm)"];

      const rowErrors: string[] = [];

      // Validate required fields
      if (!nameVi) rowErrors.push("Thiếu Tên sản phẩm (Tiếng Việt)");
      if (!summaryVi) rowErrors.push("Thiếu Mô tả ngắn (Tiếng Việt)");
      if (!coverImageUrl) rowErrors.push("Thiếu Ảnh chính (URL)");
      if (!categorySlug) rowErrors.push("Thiếu Slug danh mục");

      // Validate URL format for cover image
      if (coverImageUrl && !/^https?:\/\/.+/i.test(coverImageUrl)) {
        rowErrors.push("Đường dẫn Ảnh chính (URL) không hợp lệ (phải bắt đầu bằng http:// hoặc https://)");
      }

      // Check category existence
      let categoryId = "";
      if (categorySlug) {
        categoryId = categoriesMap[categorySlug.toLowerCase()];
        if (!categoryId) {
          rowErrors.push(`Danh mục có slug '${categorySlug}' không tồn tại trong hệ thống`);
        }
      }

      // Check brand existence
      let brandId = null;
      if (brandSlug) {
        brandId = brandsMap[brandSlug.toLowerCase()];
        if (!brandId) {
          rowErrors.push(`Thương hiệu có slug '${brandSlug}' không tồn tại trong hệ thống`);
        }
      }

      // Check showroom existence
      if (showroomCode && !showroomsSet.has(showroomCode.toLowerCase())) {
        rowErrors.push(`Showroom có mã '${showroomCode}' không tồn tại trong hệ thống`);
      }

      // Validate pricing
      let priceMinNum: number | null = null;
      let priceMaxNum: number | null = null;
      if (priceMin) {
        priceMinNum = Number(priceMin);
        if (isNaN(priceMinNum) || priceMinNum < 0) {
          rowErrors.push("Giá tối thiểu phải là số dương");
        }
      }
      if (priceMax) {
        priceMaxNum = Number(priceMax);
        if (isNaN(priceMaxNum) || priceMaxNum < 0) {
          rowErrors.push("Giá tối đa phải là số dương");
        }
      }
      if (priceMinNum !== null && priceMaxNum !== null && priceMinNum > priceMaxNum) {
        rowErrors.push("Giá tối thiểu không được lớn hơn giá tối đa");
      }

      // Validate dimensions
      let widthNum: number | null = null;
      let depthNum: number | null = null;
      let heightNum: number | null = null;
      if (width) {
        widthNum = Number(width);
        if (isNaN(widthNum) || widthNum < 0) rowErrors.push("Chiều rộng phải là số dương");
      }
      if (depth) {
        depthNum = Number(depth);
        if (isNaN(depthNum) || depthNum < 0) rowErrors.push("Chiều sâu phải là số dương");
      }
      if (height) {
        heightNum = Number(height);
        if (isNaN(heightNum) || heightNum < 0) rowErrors.push("Chiều cao phải là số dương");
      }

      // Validate enum fields
      if (!["draft", "published", "archived"].includes(status.toLowerCase())) {
        rowErrors.push("Trạng thái phải là draft, published hoặc archived");
      }
      if (featured && !["TRUE", "FALSE"].includes(featured)) {
        rowErrors.push("Nổi bật phải là TRUE hoặc FALSE");
      }

      // Generate slug and check duplicates
      const generatedSlug = nameVi ? slugify(nameVi) : "";
      if (generatedSlug) {
        const existingProductId = productSlugsMap[generatedSlug];
        if (existingProductId) {
          // If creating new (no ID provided) or updating a different product ID, it's a duplicate
          if (!idVal || idVal !== existingProductId) {
            rowErrors.push(`Tên sản phẩm trùng lặp, slug '${generatedSlug}' đã được sử dụng bởi sản phẩm khác`);
          }
        }
      }

      // Check ID existence if update mode
      let isUpdate = false;
      if (idVal) {
        // Simple uuid regex validation
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idVal)) {
          rowErrors.push("ID sản phẩm không đúng định dạng UUID");
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
        // If mode === "commit", write to database
        if (mode === "commit") {
          try {
            const galleryRaw = rowData["Thư viện ảnh (các URL cách nhau bởi dấu phẩy)"] || "";
            const galleryImages = galleryRaw ? galleryRaw.split(",").map((url: string) => url.trim()).filter(Boolean) : [];

            // Call Gemini translation if API key is present
            let translated = {
              name_en: null as string | null,
              summary_en: null as string | null,
              material_en: null as string | null,
              dimension_display_text_en: null as string | null,
              spec_material_en: null as string | null,
              spec_finish_en: null as string | null,
              spec_care_en: null as string | null
            };

            if (apiKey) {
              const model = env.GEMINI_DEFAULT_MODEL || "gemini-1.5-flash";
              translated = await translateProductFields(apiKey, model, {
                name_vi: nameVi,
                summary_vi: summaryVi,
                material_vi: rowData["Vật liệu hiển thị (Tiếng Việt)"] || null,
                dimension_display_text_vi: rowData["Mô tả kích thước (Tiếng Việt)"] || null,
                spec_material_vi: rowData["Vật liệu chi tiết (Tiếng Việt)"] || null,
                spec_finish_vi: rowData["Hoàn thiện bề mặt (Tiếng Việt)"] || null,
                spec_care_vi: rowData["Hướng dẫn bảo quản (Tiếng Việt)"] || null
              });
            }

            const payload = {
              reference_code: rowData["Mã sản phẩm (Reference Code)"] || null,
              slug: generatedSlug,
              name_vi: nameVi,
              name_en: translated.name_en || nameVi,
              summary_vi: summaryVi,
              summary_en: translated.summary_en || summaryVi,
              description_json_vi: null,
              description_json_en: null,
              material_vi: rowData["Vật liệu hiển thị (Tiếng Việt)"] || null,
              material_en: translated.material_en || rowData["Vật liệu hiển thị (Tiếng Việt)"] || null,
              price_display_text_vi: priceMinNum !== null
                ? (() => {
                    const formattedMin = priceMinNum.toLocaleString("vi-VN");
                    const formattedMax = priceMaxNum !== null ? priceMaxNum.toLocaleString("vi-VN") : null;
                    const range = formattedMax ? `${formattedMin} - ${formattedMax}` : formattedMin;
                    return `${range} VND${priceUnit ? "/" + priceUnit : ""}`;
                  })()
                : "Liên hệ",
              price_display_text_en: priceMinNum !== null
                ? (() => {
                    const formattedMin = priceMinNum.toLocaleString("en-US");
                    const formattedMax = priceMaxNum !== null ? priceMaxNum.toLocaleString("en-US") : null;
                    const range = formattedMax ? `${formattedMin} - ${formattedMax}` : formattedMin;
                    return `${range} VND${priceUnit ? "/" + priceUnit : ""}`;
                  })()
                : "Contact",
              dimension_display_text_vi: rowData["Mô tả kích thước (Tiếng Việt)"] || null,
              dimension_display_text_en: translated.dimension_display_text_en || rowData["Mô tả kích thước (Tiếng Việt)"] || null,
              price_min: priceMinNum,
              price_max: priceMaxNum,
              currency: "VND",
              width: widthNum,
              depth: depthNum,
              height: heightNum,
              dimension_unit: "mm",
              category_id: categoryId,
              brand_id: brandId,
              brand_series: rowData["Dòng sản phẩm/Series"] || null,
              showroom_code: showroomCode || null,
              price_unit: priceUnit || null,
              featured: featured === "TRUE",
              status: status.toLowerCase() as any,
              cover_image: coverImageUrl,
              gallery_images: galleryImages,
              promotion_id: null,
              promo_price_min: null,
              promo_price_max: null,
              specifications: {
                material_vi: rowData["Vật liệu chi tiết (Tiếng Việt)"] || null,
                material_en: translated.spec_material_en || rowData["Vật liệu chi tiết (Tiếng Việt)"] || null,
                finish_vi: rowData["Hoàn thiện bề mặt (Tiếng Việt)"] || null,
                finish_en: translated.spec_finish_en || rowData["Hoàn thiện bề mặt (Tiếng Việt)"] || null,
                care_vi: rowData["Hướng dẫn bảo quản (Tiếng Việt)"] || null,
                care_en: translated.spec_care_en || rowData["Hướng dẫn bảo quản (Tiếng Việt)"] || null,
              },
              custom_attributes: [],
              seo_title_vi: null,
              seo_title_en: null,
              seo_description_vi: null,
              seo_description_en: null,
            };

            let res;
            if (isUpdate) {
              res = await updateAdminProduct(idVal, payload);
              if (res.success) {
                successCount++;
                updatedIds.push(idVal);
              } else {
                errorCount++;
                errors.push({
                  row: rowNum,
                  field: "database",
                  value: nameVi,
                  message: res.error || "Lỗi cập nhật sản phẩm vào database"
                });
              }
            } else {
              res = await createAdminProduct(payload);
              if (res.success && res.id) {
                successCount++;
                createdIds.push(res.id);
              } else {
                errorCount++;
                errors.push({
                  row: rowNum,
                  field: "database",
                  value: nameVi,
                  message: res.error || "Lỗi thêm sản phẩm vào database"
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
          // Just validation mode count as success validation
          successCount++;
        }
      }

      parsedRows.push({
        row: rowNum,
        name: nameVi || "",
        reference_code: rowData["Mã sản phẩm (Reference Code)"] || "",
        isValid,
        errors: rowErrors
      });
    }

    // Write audit log if mode === commit
    if (mode === "commit" && (createdIds.length > 0 || updatedIds.length > 0)) {
      try {
        await writeAuditLog(supabase, {
          actorId: user.id,
          action: "create",
          entityType: "import_batch",
          entityId: "00000000-0000-0000-0000-000000000000",
          metadata: {
            module: "products",
            success_count: successCount,
            error_count: errorCount,
            created_count: createdIds.length,
            updated_count: updatedIds.length
          }
        });
      } catch (auditErr) {
        console.error("Audit log failed for product import batch:", auditErr);
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
    console.error("Error importing products:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
