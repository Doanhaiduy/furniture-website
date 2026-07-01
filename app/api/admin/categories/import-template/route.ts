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

    // 1. Fetch parent categories (parent_id is null)
    const { data: dbParentCategories } = await supabase
      .from("product_categories")
      .select("id, product_category_translations(locale, slug, name)")
      .is("parent_id", null)
      .is("deleted_at", null);

    const parentCategoriesList = (dbParentCategories ?? []).map(row => {
      const trans = Array.isArray(row.product_category_translations) ? row.product_category_translations : [];
      const viTrans = trans.find((t: any) => t.locale === "vi") || trans[0];
      return {
        id: row.id,
        slug: viTrans?.slug || "",
        name: viTrans?.name || ""
      };
    });

    const workbook = new ExcelJS.Workbook();

    const C = {
      navyReq:  "FF1E3A5F",
      blueOpt:  "FF2D6A9F",
      white:    "FFFFFFFF",
      sampleBg: "FFEBF3FB",
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
      "Tên danh mục (Tiếng Việt)*",
      "Mô tả (Tiếng Việt)",
      "Mã nhóm hàng (wood/sanitary/tiles/other)*",
      "Slug danh mục cha (để trống nếu là nhóm gốc)",
      "Ảnh chính (URL)",
      "Thứ tự hiển thị",
      "Trạng thái (draft/published/archived)",
      "ID danh mục (để trống nếu tạo mới)"
    ];

    const sampleRow = {
      "Tên danh mục (Tiếng Việt)*": "Sofa Phòng Khách",
      "Mô tả (Tiếng Việt)": "Danh mục sofa phòng khách cao cấp",
      "Mã nhóm hàng (wood/sanitary/tiles/other)*": "wood",
      "Slug danh mục cha (để trống nếu là nhóm gốc)": "do-go-noi-that",
      "Ảnh chính (URL)": "https://res.cloudinary.com/demo/image/upload/v1/category.jpg",
      "Thứ tự hiển thị": 10,
      "Trạng thái (draft/published/archived)": "published",
      "ID danh mục (để trống nếu tạo mới)": ""
    };

    const groupColors: Record<string, string> = {
      "Tên danh mục (Tiếng Việt)*": "FFE8F8F5", // Basic Info, Soft Green
      "Mô tả (Tiếng Việt)": "FFE8F8F5",
      "Mã nhóm hàng (wood/sanitary/tiles/other)*": "FFF5EEF8", // Classification, Soft Purple
      "Slug danh mục cha (để trống nếu là nhóm gốc)": "FFF5EEF8",
      "Ảnh chính (URL)": "FFE8F6F3", // Media, Soft Cyan
      "Thứ tự hiển thị": "FFFDED", // System, Soft Salmon
      "Trạng thái (draft/published/archived)": "FFFDED",
      "ID danh mục (để trống nếu tạo mới)": "FFFDED"
    };

    const promptMessages: Record<string, { title: string; prompt: string }> = {
      "Tên danh mục (Tiếng Việt)*": {
        title: "Tên danh mục*",
        prompt: "Tên danh mục hiển thị (ví dụ: Sofa cao cấp, Bồn cầu thông minh). Bắt buộc."
      },
      "Mô tả (Tiếng Việt)": {
        title: "Mô tả",
        prompt: "Mô tả ngắn gọn về danh mục sản phẩm này."
      },
      "Mã nhóm hàng (wood/sanitary/tiles/other)*": {
        title: "Nhóm hàng*",
        prompt: "Bắt buộc. Chọn: wood (Đồ gỗ), sanitary (Vệ sinh), tiles (Gạch), other (Khác)."
      },
      "Slug danh mục cha (để trống nếu là nhóm gốc)": {
        title: "Slug danh mục cha",
        prompt: "Chọn slug của danh mục cha từ dropdown, hoặc xem sheet '📂 Danh mục cha'. Bỏ trống nếu là danh mục gốc."
      },
      "Ảnh chính (URL)": {
        title: "Ảnh đại diện",
        prompt: "Đường dẫn URL ảnh đại diện danh mục (bắt đầu bằng http:// hoặc https://)."
      },
      "Thứ tự hiển thị": {
        title: "Thứ tự hiển thị",
        prompt: "Số nguyên dùng để sắp xếp thứ tự hiển thị của danh mục (ví dụ: 10)."
      },
      "Trạng thái (draft/published/archived)": {
        title: "Trạng thái",
        prompt: "Chọn: draft (nháp), published (xuất bản), hoặc archived (lưu trữ) từ dropdown."
      },
      "ID danh mục (để trống nếu tạo mới)": {
        title: "ID danh mục (Ẩn)",
        prompt: "Mã UUID danh mục. Chỉ điền khi cần cập nhật danh mục đang có sẵn."
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

    // Row 3 to 502: Empty rows with dropdown validation
    for (let r = 0; r < 500; r++) {
      const empRow = wsMain.addRow(headers.map(() => ""));
      empRow.height = 20;
      empRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: "FFFFFFFF" } };
        cell.font = { size: 10, name: "Calibri" };
        cell.alignment = { horizontal: "left", vertical: "middle" };
        cell.border = borderStyle;
      });

      const rowIdx = r + 3;

      // Col 3: group_key (wood/sanitary/tiles/other) (Col C)
      wsMain.getCell(`C${rowIdx}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ['"wood,sanitary,tiles,other"']
      };

      // Col 4: parent_category_slug pointing to the dynamic parent category reference sheet (Col D)
      wsMain.getCell(`D${rowIdx}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ["='📂 Danh mục cha'!$C$2:$C$500"]
      };

      // Col 7: Status (draft/published/archived) (Col G)
      wsMain.getCell(`G${rowIdx}`).dataValidation = {
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
      if (h.includes("ID danh mục")) {
        col.hidden = true;
      } else if (h.includes("URL") || h.includes("Địa chỉ") || h.includes("Mô tả")) {
        col.width = 46;
      } else if (h.includes("Tên") || h.includes("Hướng dẫn")) {
        col.width = 33;
      } else if (h.includes("Slug")) {
        col.width = 28;
      } else {
        col.width = Math.max(h.length + 4, 15);
      }
    });

    // ─── Instruction Sheet ───
    const wsInstr = workbook.addWorksheet("📋 Gợi ý sử dụng");
    const wsInstrTitle = wsInstr.addRow(["📋 HƯỚNG DẪN SỬ DỤNG FILE IMPORT DANH MỤC", ""]);
    wsInstrTitle.height = 40;
    wsInstr.mergeCells("A1:B1");
    const tCell = wsInstrTitle.getCell(1);
    tCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.instrHdr } };
    tCell.font = { bold: true, color: { argb: C.white }, size: 14, name: "Calibri" };
    tCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };

    wsInstr.addRow(["", ""]).height = 10;

    const instrLines = [
      ["🔵 Cột bắt buộc (*)", "Các cột đánh dấu * là bắt buộc. Bỏ trống sẽ báo lỗi khi import."],
      ["🔵 Tên danh mục (Tiếng Việt)*", "Tên chính hiển thị của danh mục. Hệ thống tự động tạo slug từ tên này."],
      ["🔵 Mã nhóm hàng*", "Chọn từ dropdown: wood (Đồ gỗ), sanitary (Vệ sinh), tiles (Gạch), other (Khác)."],
      ["🔵 Slug danh mục cha", "Nếu là danh mục con, hãy chọn slug danh mục cha từ dropdown hoặc xem sheet '📂 Danh mục cha'. Bỏ trống nếu là danh mục gốc."],
      ["🔵 Ảnh chính (URL)", "Đường dẫn URL ảnh đại diện cho danh mục này."],
      ["🔵 Trạng thái", "Chỉ nhập: draft | published | archived."],
      ["🔵 ID danh mục (ẩn)", "Dành cho chế độ cập nhật danh mục đã có. Nếu tạo mới danh mục thì bỏ trống."]
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

    // ─── Reference sheet: Parent Categories ───
    const wsParentCats = workbook.addWorksheet("📂 Danh mục cha", {
      views: [{ state: 'frozen', ySplit: 1 }]
    });
    const parentCatHeaders = ["STT", "Tên danh mục cha", "Slug ← COPY CỘT NÀY"];
    const parentHdr = wsParentCats.addRow(parentCatHeaders);
    parentHdr.height = 32;
    parentHdr.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.refHdr } };
      cell.font = { bold: true, color: { argb: C.white }, size: 11, name: "Calibri" };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = borderStyle;
    });

    if (parentCategoriesList.length === 0) {
      const r = wsParentCats.addRow(["—", "Chưa có danh mục cha trong hệ thống", "—"]);
      r.height = 22;
      r.eachCell(c => { c.alignment = { horizontal: "center", vertical: "middle" }; c.border = borderStyle; });
    } else {
      parentCategoriesList.forEach((c: any, idx) => {
        const bg = idx % 2 === 0 ? "FFEAFAF1" : "FFFFFFFF";
        const r = wsParentCats.addRow([
          String(idx + 1),
          c.name,
          c.slug ? `${c.name} (${c.slug})` : ""
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
    wsParentCats.getColumn(1).width = 6;
    wsParentCats.getColumn(2).width = 30;
    wsParentCats.getColumn(3).width = 34;

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
      ["ERR_REQUIRED", "Bỏ trống trường bắt buộc", "Các cột có dấu * như Tên danh mục, Mã nhóm hàng bị bỏ trống.", "Điền đầy đủ thông tin trước khi import."],
      ["ERR_PARENT_NOT_FOUND", "Không tìm thấy danh mục cha", "Slug danh mục cha điền trong file import không khớp với bất kỳ danh mục gốc nào trong hệ thống.", "Kiểm tra sheet '📂 Danh mục cha' để copy chính xác slug danh mục cha hợp lệ."],
      ["ERR_ENUM_INVALID", "Mã nhóm hàng / Trạng thái sai", "Giá trị nhóm hàng không phải wood/sanitary/tiles/other hoặc trạng thái khác draft/published/archived.", "Sử dụng dropdown tích hợp sẵn trong ô để chọn."],
      ["ERR_DUP_SLUG", "Trùng slug hệ thống", "Tên danh mục tạo ra slug trùng lặp với danh mục đã tồn tại.", "Đổi tên danh mục hoặc điền ID danh mục ở cột ẩn để cập nhật."]
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
        "Content-Disposition": 'attachment; filename="Template_Import_Danh_Muc.xlsx"'
      }
    });

  } catch (err: any) {
    console.error("Error generating category template:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
