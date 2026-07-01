import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createAdminShowroom, updateAdminShowroom } from "@/lib/supabase/mutations";
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

async function translateShowroomFields(
  apiKey: string,
  model: string,
  fields: {
    name_vi: string;
    address_vi: string;
    open_hours_vi?: string | null;
  }
) {
  const prompt = `You are a professional translator. Translate the following Vietnamese showroom attributes to English.
Preserve tone, formatting and do not summarize.
Output MUST be a single, valid JSON object containing exactly the translated fields with keys matching the input JSON keys.
Do NOT wrap the response in markdown code blocks or add any text other than the JSON string.

Input JSON:
${JSON.stringify({
  name_en: fields.name_vi,
  address_en: fields.address_vi,
  open_hours_en: fields.open_hours_vi || ""
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
        address_en: parsed.address_en || null,
        open_hours_en: parsed.open_hours_en || null
      };
    } else {
      const errTxt = await apiRes.text();
      console.error("Gemini API error during translation:", errTxt);
    }
  } catch (err) {
    console.error("Gemini translation error for showroom:", err);
  }

  return {
    name_en: fields.name_vi,
    address_en: fields.address_vi,
    open_hours_en: fields.open_hours_vi || null
  };
}


const provinces = [
  "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Bình Dương", "Đồng Nai", 
  "Long An", "Bà Rịa - Vũng Tàu", "Tây Ninh", "Bình Phước", "An Giang", "Bến Tre", 
  "Bạc Liêu", "Cà Mau", "Đồng Tháp", "Hậu Giang", "Kiên Giang", "Sóc Trăng", "Tiền Giang", 
  "Trà Vinh", "Vĩnh Long", "Lâm Đồng", "Đắk Lắk", "Đắk Nông", "Gia Lai", "Kon Tum", 
  "Khánh Hòa", "Bình Thuận", "Ninh Thuận", "Phú Yên", "Quảng Ngãi", "Quảng Nam", 
  "Bình Định", "Thừa Thiên Huế", "Quảng Trị", "Quảng Bình", "Hà Tĩnh", "Nghệ An", 
  "Thanh Hóa", "Ninh Bình", "Nam Định", "Hà Nam", "Thái Bình", "Hải Dương", "Hưng Yên", 
  "Bắc Ninh", "Vĩnh Phúc", "Phú Thọ", "Quảng Ninh", "Lạng Sơn", "Cao Bằng", "Hà Giang", 
  "Tuyên Quang", "Yên Bái", "Lào Cai", "Điện Biên", "Lai Châu", "Sơn La", "Hòa Bình", 
  "Thái Nguyên", "Bắc Kạn", "Bắc Giang"
];

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
      "Tên Showroom (Tiếng Việt)*",
      "Địa chỉ (Tiếng Việt)*",
      "Tỉnh/Thành phố*",
      "Hotline*",
      "URL bản đồ nhúng Google Maps*"
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

    // Fetch existing showrooms to check slug duplicates
    const { data: dbShowrooms } = await supabase
      .from("showrooms")
      .select("id, code")
      .is("deleted_at", null);

    const showroomsMap: Record<string, string> = {}; // code -> id
    (dbShowrooms ?? []).forEach(s => {
      if (s.code) showroomsMap[s.code.trim().toLowerCase()] = s.id;
    });

    const parsedRows: any[] = [];
    const errors: any[] = [];
    let successCount = 0;
    let errorCount = 0;

    const createdIds: string[] = [];
    const updatedIds: string[] = [];

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
      const nameVi = rowData["Tên Showroom (Tiếng Việt)*"];
      const addressVi = rowData["Địa chỉ (Tiếng Việt)*"];
      const province = rowData["Tỉnh/Thành phố*"];
      const hotline = rowData["Hotline*"];
      const mapUrl = rowData["URL bản đồ nhúng Google Maps*"];
      const fallbackUrl = rowData["URL bản đồ dự phòng Google Maps*"];
      const coverImageUrl = rowData["Ảnh chính (URL)"];
      const latVal = rowData["Latitude"];
      const lngVal = rowData["Longitude"];
      const status = rowData["Trạng thái (draft/published/archived)"] || "draft";
      const idVal = rowData["ID showroom (để trống nếu tạo mới)"];

      const rowErrors: string[] = [];

      if (!nameVi) rowErrors.push("Thiếu Tên Showroom (Tiếng Việt)");
      if (!addressVi) rowErrors.push("Thiếu Địa chỉ (Tiếng Việt)");
      if (!province) rowErrors.push("Thiếu Tỉnh/Thành phố");
      if (!hotline) rowErrors.push("Thiếu Hotline");
      if (!mapUrl) rowErrors.push("Thiếu URL bản đồ nhúng Google Maps");

      // Validate province exists in 63 provinces
      if (province && !provinces.includes(province)) {
        rowErrors.push(`Tỉnh/Thành phố '${province}' không hợp lệ (kiểm tra chính tả)`);
      }

      // Validate URL format for mapUrl and cover image
      if (mapUrl && !/^https?:\/\/.+/i.test(mapUrl)) {
        rowErrors.push("URL bản đồ nhúng Google Maps không hợp lệ");
      }
      if (coverImageUrl && !/^https?:\/\/.+/i.test(coverImageUrl)) {
        rowErrors.push("Đường dẫn Ảnh chính (URL) không hợp lệ (phải bắt đầu bằng http:// hoặc https://)");
      }

      // Validate latitude and longitude
      let latNum: number | null = null;
      let lngNum: number | null = null;
      if (latVal) {
        latNum = Number(latVal);
        if (isNaN(latNum)) rowErrors.push("Latitude phải là số");
      }
      if (lngVal) {
        lngNum = Number(lngVal);
        if (isNaN(lngNum)) rowErrors.push("Longitude phải là số");
      }

      // Validate enum fields
      if (!["draft", "published", "archived"].includes(status.toLowerCase())) {
        rowErrors.push("Trạng thái phải là draft, published hoặc archived");
      }

      // Generate slug code and check duplicates
      const generatedCode = nameVi ? slugify(nameVi) : "";
      if (generatedCode) {
        const existingShowroomId = showroomsMap[generatedCode];
        if (existingShowroomId) {
          if (!idVal || idVal !== existingShowroomId) {
            rowErrors.push(`Tên showroom trùng lặp, mã code/slug '${generatedCode}' đã được sử dụng bởi showroom khác`);
          }
        }
      }

      // Check ID existence if update mode
      let isUpdate = false;
      if (idVal) {
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idVal)) {
          rowErrors.push("ID showroom không đúng định dạng UUID");
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
            // Call Gemini translation if API key is present
            let translated = {
              name_en: null as string | null,
              address_en: null as string | null,
              open_hours_en: null as string | null
            };

            if (apiKey) {
              const model = env.GEMINI_DEFAULT_MODEL || "gemini-1.5-flash";
              translated = await translateShowroomFields(apiKey, model, {
                name_vi: nameVi,
                address_vi: addressVi,
                open_hours_vi: rowData["Giờ mở cửa (Tiếng Việt)"] || null
              });
            }

            const payload = {
              code: generatedCode,
              name_vi: nameVi,
              name_en: translated.name_en || nameVi,
              address_vi: addressVi,
              address_en: translated.address_en || addressVi,
              opening_hours_vi: rowData["Giờ mở cửa (Tiếng Việt)"] || null,
              opening_hours_en: translated.open_hours_en || rowData["Giờ mở cửa (Tiếng Việt)"] || null,
              hotline: hotline,
              google_maps_embed_url: mapUrl,
              google_maps_fallback_url: fallbackUrl || mapUrl,
              status: status.toLowerCase() as any,
              sort_order: rowData["Thứ tự hiển thị"] ? Number(rowData["Thứ tự hiển thị"]) : 0,
              cover_image: coverImageUrl || null,
              seo_title_vi: null,
              seo_title_en: null,
              seo_description_vi: null,
              seo_description_en: null,
              latitude: latNum,
              longitude: lngNum,
            };

            let res;
            if (isUpdate) {
              res = await updateAdminShowroom(idVal, payload);
              if (res.success) {
                successCount++;
                updatedIds.push(idVal);
              } else {
                errorCount++;
                errors.push({
                  row: rowNum,
                  field: "database",
                  value: nameVi,
                  message: res.error || "Lỗi cập nhật showroom vào database"
                });
              }
            } else {
              res = await createAdminShowroom(payload);
              if (res.success && res.id) {
                successCount++;
                createdIds.push(res.id);
              } else {
                errorCount++;
                errors.push({
                  row: rowNum,
                  field: "database",
                  value: nameVi,
                  message: res.error || "Lỗi thêm showroom vào database"
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
            module: "showrooms",
            success_count: successCount,
            error_count: errorCount,
            created_count: createdIds.length,
            updated_count: updatedIds.length
          }
        });
      } catch (auditErr) {
        console.error("Audit log failed for showroom import batch:", auditErr);
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
    console.error("Error importing showrooms:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
