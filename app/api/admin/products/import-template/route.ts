import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "editor")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const supabase = createAdminClient();

    // 1. Fetch categories
    const { data: dbCategories } = await supabase
      .from("product_categories")
      .select("id, parent_id, group_key, product_category_translations(locale, slug, name)")
      .is("deleted_at", null);

    // 2. Fetch brands
    const { data: dbBrands } = await supabase
      .from("brands")
      .select("id, slug, brand_translations(locale, name)")
      .is("deleted_at", null);

    const categoriesList = (dbCategories ?? []).map(row => {
      const trans = Array.isArray(row.product_category_translations) ? row.product_category_translations : [];
      const viTrans = trans.find((t: any) => t.locale === "vi") || trans[0];
      return {
        id: row.id,
        parent_id: row.parent_id,
        group_key: row.group_key,
        slug: viTrans?.slug || "",
        name: viTrans?.name || ""
      };
    });

    const brandsList = (dbBrands ?? []).map(row => {
      const trans = Array.isArray(row.brand_translations) ? row.brand_translations : [];
      const viTrans = trans.find((t: any) => t.locale === "vi") || trans[0];
      return {
        id: row.id,
        slug: row.slug || "",
        name: viTrans?.name || ""
      };
    });

    const workbook = new ExcelJS.Workbook();

    const C = {
      navyReq:  "FF1E3A5F",   // Required header – dark navy
      blueOpt:  "FF2D6A9F",   // Optional header – mid blue
      white:    "FFFFFFFF",
      sampleBg: "FFEBF3FB",   // Light blue sample row
      sampleFg: "FF1A2B3C",
      borderCol: "FFCBD5E0",
      refHdr:   "FF145A32",
      instrHdr: "FF784212",
      instrBg:  "FFFEF9E7"
    };

    const borderStyle = {
      top: { style: 'thin' as const, color: { argb: C.borderCol } },
      left: { style: 'thin' as const, color: { argb: C.borderCol } },
      bottom: { style: 'thin' as const, color: { argb: C.borderCol } },
      right: { style: 'thin' as const, color: { argb: C.borderCol } }
    };

    const borderStrong = {
      top: { style: 'medium' as const, color: { argb: 'FF2D6A9F' } },
      bottom: { style: 'medium' as const, color: { argb: 'FF2D6A9F' } },
      left: { style: 'medium' as const, color: { argb: 'FF2D6A9F' } },
      right: { style: 'medium' as const, color: { argb: 'FF2D6A9F' } }
    };

    const headers = [
      "Mã sản phẩm (Reference Code)",
      "Tên sản phẩm (Tiếng Việt)*",
      "Mô tả ngắn (Tiếng Việt)*",
      "Vật liệu hiển thị (Tiếng Việt)",
      "Mô tả kích thước (Tiếng Việt)",
      "Giá tối thiểu (VND)",
      "Giá tối đa (VND)",
      "Chiều rộng (mm)",
      "Chiều sâu (mm)",
      "Chiều cao (mm)",
      "Slug danh mục*",
      "Slug thương hiệu",
      "Dòng sản phẩm/Series",
      "Ảnh chính (URL)*",
      "Thư viện ảnh (các URL cách nhau bởi dấu phẩy)",
      "Nổi bật (TRUE/FALSE)",
      "Trạng thái (draft/published/archived)",
      "Vật liệu chi tiết (Tiếng Việt)",
      "Hoàn thiện bề mặt (Tiếng Việt)",
      "Hướng dẫn bảo quản (Tiếng Việt)",
      "ID sản phẩm (để trống nếu tạo mới)"
    ];

    const sampleRow = {
      "Mã sản phẩm (Reference Code)": "SF-001",
      "Tên sản phẩm (Tiếng Việt)*": "Sofa Da Ý Premium",
      "Mô tả ngắn (Tiếng Việt)*": "Sofa bọc da bò Ý cao cấp, khung sồi tự nhiên.",
      "Vật liệu hiển thị (Tiếng Việt)": "Da bò Ý, Gỗ sồi",
      "Mô tả kích thước (Tiếng Việt)": "W2200 x D900 x H850 mm",
      "Giá tối thiểu (VND)": 45000000,
      "Giá tối đa (VND)": 50000000,
      "Chiều rộng (mm)": 2200,
      "Chiều sâu (mm)": 900,
      "Chiều cao (mm)": 850,
      "Slug danh mục*": "sofa-phong-khach",
      "Slug thương hiệu": "bentley-home",
      "Dòng sản phẩm/Series": "Classic Collection",
      "Ảnh chính (URL)*": "https://res.cloudinary.com/demo/image/upload/v1/cover.jpg",
      "Thư viện ảnh (các URL cách nhau bởi dấu phẩy)": "https://res.cloudinary.com/demo/image/upload/v1/img1.jpg,https://res.cloudinary.com/demo/image/upload/v1/img2.jpg",
      "Nổi bật (TRUE/FALSE)": "TRUE",
      "Trạng thái (draft/published/archived)": "published",
      "Vật liệu chi tiết (Tiếng Việt)": "Khung gỗ sồi nhập khẩu sấy khô.",
      "Hoàn thiện bề mặt (Tiếng Việt)": "Bọc da bò nguyên tấm 100% nhập Ý.",
      "Hướng dẫn bảo quản (Tiếng Việt)": "Tránh ánh nắng, lau bằng khăn ẩm.",
      "ID sản phẩm (để trống nếu tạo mới)": ""
    };

    const groupColors: Record<string, string> = {
      "Mã sản phẩm (Reference Code)": "FFE8F8F5", // Soft Green
      "Tên sản phẩm (Tiếng Việt)*": "FFE8F8F5",
      "Mô tả ngắn (Tiếng Việt)*": "FFE8F8F5",
      "Vật liệu hiển thị (Tiếng Việt)": "FFEAF2F8", // Soft Blue
      "Mô tả kích thước (Tiếng Việt)": "FFEAF2F8",
      "Giá tối thiểu (VND)": "FFFDEBD0", // Soft Gold
      "Giá tối đa (VND)": "FFFDEBD0",
      "Chiều rộng (mm)": "FFFDF2E9", // Soft Peach
      "Chiều sâu (mm)": "FFFDF2E9",
      "Chiều cao (mm)": "FFFDF2E9",
      "Slug danh mục*": "FFF5EEF8", // Soft Purple
      "Slug thương hiệu": "FFF5EEF8",
      "Dòng sản phẩm/Series": "FFF5EEF8",
      "Ảnh chính (URL)*": "FFE8F6F3", // Soft Cyan
      "Thư viện ảnh (các URL cách nhau bởi dấu phẩy)": "FFE8F6F3",
      "Nổi bật (TRUE/FALSE)": "FFFDED", // Soft Salmon
      "Trạng thái (draft/published/archived)": "FFFDED",
      "Vật liệu chi tiết (Tiếng Việt)": "FFF2F3F4", // Soft Gray
      "Hoàn thiện bề mặt (Tiếng Việt)": "FFF2F3F4",
      "Hướng dẫn bảo quản (Tiếng Việt)": "FFF2F3F4",
      "ID sản phẩm (để trống nếu tạo mới)": "FFFDED",
    };

    const promptMessages: Record<string, { title: string; prompt: string }> = {
      "Mã sản phẩm (Reference Code)": {
        title: "Mã sản phẩm",
        prompt: "Mã sản phẩm quản lý nội bộ (ví dụ: SF-001, VC-KV-24). Viết liền không dấu."
      },
      "Tên sản phẩm (Tiếng Việt)*": {
        title: "Tên sản phẩm*",
        prompt: "Tên đầy đủ hiển thị tiếng Việt (ví dụ: Bàn ăn gỗ óc chó tự nhiên). Bắt buộc."
      },
      "Mô tả ngắn (Tiếng Việt)*": {
        title: "Mô tả ngắn*",
        prompt: "Tóm tắt ngắn gọn đặc tính sản phẩm (1-2 câu). Bắt buộc."
      },
      "Vật liệu hiển thị (Tiếng Việt)": {
        title: "Vật liệu hiển thị",
        prompt: "Tóm tắt nhanh vật liệu ngoài danh sách (ví dụ: Gỗ tự nhiên, Da bò Ý)."
      },
      "Mô tả kích thước (Tiếng Việt)": {
        title: "Mô tả kích thước",
        prompt: "Chuỗi hiển thị nhanh kích thước sản phẩm (ví dụ: W2200 x D900 x H750 mm)."
      },
      "Giá tối thiểu (VND)": {
        title: "Giá tối thiểu",
        prompt: "Chỉ nhập số nguyên dương không chứa dấu phẩy/chấm phân cách (ví dụ: 45000000)."
      },
      "Giá tối đa (VND)": {
        title: "Giá tối đa",
        prompt: "Chỉ nhập số nguyên dương không chứa dấu phẩy/chấm phân cách (ví dụ: 50000000)."
      },
      "Chiều rộng (mm)": {
        title: "Chiều rộng (mm)",
        prompt: "Nhập số nguyên kích thước chiều rộng (ví dụ: 2200)."
      },
      "Chiều sâu (mm)": {
        title: "Chiều sâu (mm)",
        prompt: "Nhập số nguyên kích thước chiều sâu (ví dụ: 900)."
      },
      "Chiều cao (mm)": {
        title: "Chiều cao (mm)",
        prompt: "Nhập số nguyên kích thước chiều cao (ví dụ: 750)."
      },
      "Slug danh mục*": {
        title: "Slug danh mục*",
        prompt: "Bắt buộc. Chọn từ danh sách xổ xuống của cột (phải dùng danh mục CON)."
      },
      "Slug thương hiệu": {
        title: "Slug thương hiệu",
        prompt: "Chọn slug thương hiệu từ danh sách xổ xuống (ví dụ: hafele)."
      },
      "Dòng sản phẩm/Series": {
        title: "Dòng sản phẩm/Series",
        prompt: "Tên dòng sản phẩm hoặc bộ sưu tập (ví dụ: Heritage Collection)."
      },
      "Ảnh chính (URL)*": {
        title: "Ảnh chính*",
        prompt: "Bắt buộc. Link ảnh bắt đầu bằng http:// hoặc https:// (ví dụ từ Cloudinary)."
      },
      "Thư viện ảnh (các URL cách nhau bởi dấu phẩy)": {
        title: "Thư viện ảnh",
        prompt: "Các đường dẫn link ảnh chi tiết cách nhau bởi dấu phẩy."
      },
      "Nổi bật (TRUE/FALSE)": {
        title: "Nổi bật",
        prompt: "Chọn TRUE để đưa sản phẩm lên vị trí nổi bật, ngược lại chọn FALSE."
      },
      "Trạng thái (draft/published/archived)": {
        title: "Trạng thái",
        prompt: "Chọn: draft (nháp), published (xuất bản), hoặc archived (lưu trữ)."
      },
      "Vật liệu chi tiết (Tiếng Việt)": {
        title: "Vật liệu chi tiết",
        prompt: "Mô tả chi tiết cấu tạo vật liệu sản phẩm."
      },
      "Hoàn thiện bề mặt (Tiếng Việt)": {
        title: "Hoàn thiện bề mặt",
        prompt: "Mô tả chất liệu hoàn thiện bề mặt (ví dụ: Sơn mờ PU, Mạ titan vàng)."
      },
      "Hướng dẫn bảo quản (Tiếng Việt)": {
        title: "Hướng dẫn bảo quản",
        prompt: "Các lưu ý khi bảo quản và lau chùi sản phẩm."
      },
      "ID sản phẩm (để trống nếu tạo mới)": {
        title: "ID sản phẩm (Ẩn)",
        prompt: "Mã UUID sản phẩm. Chỉ điền khi cần cập nhật sản phẩm đang tồn tại."
      }
    };

    // ─── Main Import Sheet ───
    const wsMain = workbook.addWorksheet("📥 Dữ liệu Import", {
      views: [{ state: 'frozen', ySplit: 1 }]
    });

    // Row 1: Header
    const hdrRow = wsMain.addRow(headers);
    hdrRow.height = 36;
    hdrRow.eachCell((cell, colIdx) => {
      const h = headers[colIdx - 1];
      const bgColor = groupColors[h] || "FFFFFFFF";
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgColor }
      };
      cell.font = { bold: true, color: { argb: "FF1A2530" }, size: 11, name: "Calibri" };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = borderStrong;
    });

    // Row 2: Sample Row
    const sampleVals = headers.map(h => (sampleRow as any)[h]);
    const smpRow = wsMain.addRow(sampleVals);
    smpRow.height = 22;
    smpRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.sampleBg } };
      cell.font = { color: { argb: C.sampleFg }, size: 10, name: "Calibri" };
      cell.alignment = { horizontal: "left", vertical: "middle" };
      cell.border = borderStyle;
    });

    // Row 3 to 502: Empty data rows with formatting and dropdown validation
    for (let r = 0; r < 500; r++) {
      const empRow = wsMain.addRow(headers.map(() => ""));
      empRow.height = 20;
      empRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: "FFFFFFFF" } };
        cell.font = { size: 10, name: "Calibri" };
        cell.alignment = { horizontal: "left", vertical: "middle" };
        cell.border = borderStyle;
      });

      const rowIdx = r + 3; // Row indices start at 3 since row 1 is header, row 2 is sample

      // Data validation for Category Slug (Col 11 / K) pointing to child categories
      wsMain.getCell(`K${rowIdx}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ["='📂 Danh mục'!$F$2:$F$500"]
      };

      // Data validation for Brand Slug (Col 12 / L)
      wsMain.getCell(`L${rowIdx}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ["='🏷️ Thương hiệu'!$C$2:$C$500"]
      };

      // Data validation for Featured (Col 16 / P)
      wsMain.getCell(`P${rowIdx}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ['"TRUE,FALSE"']
      };

      // Data validation for Status (Col 17 / Q)
      wsMain.getCell(`Q${rowIdx}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ['"draft,published,archived"']
      };

      // Add validation with prompts for all columns in this row
      headers.forEach((h, colIdx) => {
        const colLetter = String.fromCharCode(65 + colIdx); // A, B, C...
        const cell = wsMain.getCell(`${colLetter}${rowIdx}`);
        const promptInfo = promptMessages[h];
        if (promptInfo) {
          if (cell.dataValidation) {
            cell.dataValidation = {
              ...cell.dataValidation,
              showInputMessage: true,
              promptTitle: promptInfo.title,
              prompt: promptInfo.prompt
            };
          } else {
            cell.dataValidation = {
              type: "custom",
              allowBlank: true,
              formulae: ["=TRUE"],
              showInputMessage: true,
              promptTitle: promptInfo.title,
              prompt: promptInfo.prompt
            };
          }
        }
      });
    }

    // Set widths and hide ID column
    headers.forEach((h, idx) => {
      const col = wsMain.getColumn(idx + 1);
      if (h.includes("ID sản phẩm")) {
        col.hidden = true;
      } else if (h.includes("URL") || h.includes("Địa chỉ") || h.includes("Mô tả")) {
        col.width = 46;
      } else if (h.includes("Tên") || h.includes("Hướng dẫn") || h.includes("Vật liệu") || h.includes("Hoàn thiện")) {
        col.width = 33;
      } else if (h.includes("Slug")) {
        col.width = 28;
      } else {
        col.width = Math.max(h.length + 4, 15);
      }
    });

    // ─── Instruction Sheet ───
    const wsInstr = workbook.addWorksheet("📋 Gợi ý sử dụng");
    const wsInstrTitle = wsInstr.addRow(["📋 HƯỚNG DẪN SỬ DỤNG FILE IMPORT", ""]);
    wsInstrTitle.height = 40;
    wsInstr.mergeCells("A1:B1");
    const tCell = wsInstrTitle.getCell(1);
    tCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.instrHdr } };
    tCell.font = { bold: true, color: { argb: C.white }, size: 14, name: "Calibri" };
    tCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };

    wsInstr.addRow(["", ""]).height = 10;

    const instrLines = [
      ["🔵 Cột bắt buộc (*)", "Các cột đánh dấu * là bắt buộc. Bỏ trống sẽ báo lỗi."],
      ["🔵 Slug sản phẩm", "Tự động sinh từ Tên (Tiếng Việt) dưới dạng viết thường không dấu nối gạch ngang."],
      ["🔵 Slug danh mục*", "Chọn từ dropdown list hoặc xem sheet '📂 Danh mục'. Phải dùng danh mục CON (không phải nhóm cha)."],
      ["🔵 Slug thương hiệu", "Chọn từ dropdown hoặc xem sheet '🏷️ Thương hiệu'."],
      ["🔵 Ảnh chính (URL)*", "Đường dẫn URL ảnh đại diện của sản phẩm (ảnh bìa Cloudinary hoặc nguồn khác)."],
      ["🔵 Thư viện ảnh", "Các đường dẫn ảnh chi tiết cách nhau bởi dấu phẩy (,)."],
      ["🔵 Giá tiền (VND)", "Nhập số nguyên dương, không có dấu phẩy hay đơn vị. Giá tối thiểu <= Giá tối đa."],
      ["🔵 ID sản phẩm (ẩn)", "Dành cho chế độ cập nhật sản phẩm. Nếu tạo mới sản phẩm thì bỏ trống."]
    ];

    instrLines.forEach(([label, desc], idx) => {
      const bg = idx % 2 === 0 ? C.instrBg : "FFFFFFFF";
      const row = wsInstr.addRow([label, desc]);
      row.height = 28;

      const cellA = row.getCell(1);
      cellA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      cellA.font = { bold: true, color: { argb: C.instrHdr }, size: 11, name: "Calibri" };
      cellA.alignment = { horizontal: "left", vertical: "middle" };
      cellA.border = borderStyle;

      const cellB = row.getCell(2);
      cellB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      cellB.font = { size: 11, name: "Calibri" };
      cellB.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
      cellB.border = borderStyle;
    });
    wsInstr.getColumn(1).width = 30;
    wsInstr.getColumn(2).width = 80;

    // ─── Reference sheet: Categories ───
    const wsCats = workbook.addWorksheet("📂 Danh mục", {
      views: [{ state: 'frozen', ySplit: 1 }]
    });
    const catHeaders = ["STT", "Nhóm danh mục", "Tên danh mục (Tiếng Việt)", "Slug ← COPY CỘT NÀY", "Loại", "Chỉ danh mục con (để dropdown)"];
    const catHdr = wsCats.addRow(catHeaders);
    catHdr.height = 32;
    catHdr.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.refHdr } };
      cell.font = { bold: true, color: { argb: C.white }, size: 11, name: "Calibri" };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = borderStyle;
    });

    const sortedCats = [...categoriesList].sort((a: any, b: any) => {
      const gOrd = ["wooden_furniture", "sanitary_equipment", "tiles", "other"];
      return (gOrd.indexOf(a.group_key) - gOrd.indexOf(b.group_key)) || ((a.sort_order ?? 0) - (b.sort_order ?? 0));
    });

    if (sortedCats.length === 0) {
      const r = wsCats.addRow(["—", "—", "Chưa có danh mục", "—", "—", "—"]);
      r.height = 22;
      r.eachCell(c => { c.alignment = { horizontal: "center", vertical: "middle" }; c.border = borderStyle; });
    } else {
      sortedCats.forEach((c: any, idx) => {
        const grp = c.group_key === "wooden_furniture" ? "🪵 Đồ gỗ nội thất"
          : c.group_key === "sanitary_equipment" ? "🚿 Thiết bị vệ sinh"
          : c.group_key === "tiles" ? "🧱 Gạch ốp lát" : "📦 Thiết bị khác";
        const isGrp = !c.parent_id;
        const bg = idx % 2 === 0 ? "FFEAFAF1" : "FFFFFFFF";

        const childSlugVal = !isGrp ? `${c.name} (${c.slug})` : "";

        const r = wsCats.addRow([
          String(idx + 1),
          grp,
          c.name,
          c.slug,
          isGrp ? "🗂️ Nhóm (không dùng)" : "✅ Danh mục con",
          childSlugVal
        ]);
        r.height = 22;
        r.eachCell((cell, colIdx) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
          cell.border = borderStyle;
          cell.alignment = { horizontal: "left", vertical: "middle" };
          if (colIdx === 4 || colIdx === 6) {
            cell.font = { bold: true, color: { argb: "FFC0392B" }, size: 10, name: "Calibri" };
          } else if (colIdx === 5) {
            cell.font = { bold: !isGrp, color: { argb: isGrp ? "FF7F8C8D" : "FF27AE60" }, size: 10, name: "Calibri" };
          } else {
            cell.font = { size: 10, name: "Calibri", color: { argb: "FF333333" } };
          }
        });
      });
    }
    wsCats.getColumn(1).width = 6;
    wsCats.getColumn(2).width = 24;
    wsCats.getColumn(3).width = 30;
    wsCats.getColumn(4).width = 32;
    wsCats.getColumn(5).width = 22;
    wsCats.getColumn(6).width = 32;

    // ─── Reference sheet: Brands ───
    const wsBrands = workbook.addWorksheet("🏷️ Thương hiệu", {
      views: [{ state: 'frozen', ySplit: 1 }]
    });
    const brandHeaders = ["STT", "Tên thương hiệu", "Slug ← COPY CỘT NÀY"];
    const bHdr = wsBrands.addRow(brandHeaders);
    bHdr.height = 32;
    bHdr.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.refHdr } };
      cell.font = { bold: true, color: { argb: C.white }, size: 11, name: "Calibri" };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = borderStyle;
    });

    if (brandsList.length === 0) {
      const r = wsBrands.addRow(["—", "Chưa có thương hiệu", "—"]);
      r.height = 22;
      r.eachCell(c => { c.alignment = { horizontal: "center", vertical: "middle" }; c.border = borderStyle; });
    } else {
      brandsList.forEach((b: any, idx) => {
        const bg = idx % 2 === 0 ? "FFEAFAF1" : "FFFFFFFF";
        const r = wsBrands.addRow([
          String(idx + 1),
          b.name,
          b.slug ? `${b.name} (${b.slug})` : ""
        ]);
        r.height = 22;
        r.eachCell((cell, colIdx) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
          cell.border = borderStyle;
          cell.alignment = { horizontal: "left", vertical: "middle" };
          if (colIdx === 3) {
            cell.font = { bold: true, color: { argb: "FFC0392B" }, size: 10, name: "Calibri" };
          } else {
            cell.font = { size: 10, name: "Calibri", color: { argb: "FF333333" } };
          }
        });
      });
    }
    wsBrands.getColumn(1).width = 6;
    wsBrands.getColumn(2).width = 30;
    wsBrands.getColumn(3).width = 34;

    // ─── Sheet: Lỗi thường gặp ───
    const wsErrors = workbook.addWorksheet("❌ Lỗi thường gặp");
    const errHdr = wsErrors.addRow(["Mã lỗi", "Lỗi thường gặp", "Mô tả nguyên nhân", "Cách khắc phục"]);
    errHdr.height = 32;
    errHdr.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: "FFC0392B" } };
      cell.font = { bold: true, color: { argb: C.white }, size: 11, name: "Calibri" };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = borderStyle;
    });

    const errorDefs = [
      ["ERR_REQUIRED", "Bỏ trống trường bắt buộc", "Các cột đánh dấu * như Tên sản phẩm, Mô tả ngắn, Ảnh chính bị bỏ trống.", "Điền đầy đủ thông tin trước khi import."],
      ["ERR_CAT_NOT_FOUND", "Không tìm thấy slug danh mục", "Slug danh mục không khớp với danh mục con nào trong hệ thống.", "Kiểm tra sheet '📂 Danh mục' để copy chính xác slug danh mục con."],
      ["ERR_BRAND_NOT_FOUND", "Không tìm thấy slug thương hiệu", "Slug thương hiệu không khớp với thương hiệu nào.", "Xem sheet '🏷️ Thương hiệu' để copy chính xác slug thương hiệu."],
      ["ERR_PRICE_INVALID", "Giá tiền không hợp lệ", "Giá chứa chữ cái, dấu chấm/phẩy phân cách hoặc giá tối thiểu lớn hơn giá tối đa.", "Chỉ nhập số nguyên dương, đảm bảo giá tối thiểu <= giá tối đa."],
      ["ERR_ENUM_INVALID", "Giá trị Dropdown sai", "Cột Trạng thái hoặc Nổi bật nhập sai ký tự (VD: 'active' thay vì 'published').", "Sử dụng dropdown tích hợp sẵn trong ô để chọn giá trị hợp lệ."],
      ["ERR_DIMENSION_NEG", "Kích thước âm", "Chiều rộng, sâu hoặc cao có giá trị nhỏ hơn 0.", "Nhập số nguyên dương lớn hơn 0."],
      ["ERR_DUP_SLUG", "Trùng slug hệ thống", "Tên sản phẩm tạo ra slug trùng lặp với sản phẩm đã có.", "Đổi tên sản phẩm hoặc điền ID sản phẩm ở cột ẩn để cập nhật."],
      ["ERR_IMAGE_INVALID", "Đường dẫn ảnh sai", "Ảnh chính bỏ trống hoặc link ảnh không đúng định dạng URL.", "Nhập đường dẫn URL ảnh hợp lệ bắt đầu bằng http:// hoặc https://."]
    ];

    errorDefs.forEach(([code, title, desc, solution], idx) => {
      const bg = idx % 2 === 0 ? "FFFADBD8" : "FFFFFFFF";
      const r = wsErrors.addRow([code, title, desc, solution]);
      r.height = 24;
      r.eachCell((cell, colIdx) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
        cell.border = borderStyle;
        cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
        if (colIdx === 1) {
          cell.font = { bold: true, color: { argb: "FFC0392B" }, size: 10, name: "Calibri" };
        } else {
          cell.font = { size: 10, name: "Calibri" };
        }
      });
    });
    wsErrors.getColumn(1).width = 18;
    wsErrors.getColumn(2).width = 24;
    wsErrors.getColumn(3).width = 46;
    wsErrors.getColumn(4).width = 46;

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="Template_Import_San_Pham.xlsx"'
      }
    });

  } catch (err: any) {
    console.error("Error generating product template:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
