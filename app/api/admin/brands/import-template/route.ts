/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "editor")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const workbook = new ExcelJS.Workbook();

    const C = {
      white: "FFFFFFFF",
      sampleBg: "FFEBF3FB",
      sampleFg: "FF1A2B3C",
      borderCol: "FFCBD5E0",
      refHdr: "FF145A32",
      instrHdr: "FF784212",
      instrBg: "FFFEF9E7",
    };

    const borderStyle = {
      top: { style: "thin" as const, color: { argb: C.borderCol } },
      left: { style: "thin" as const, color: { argb: C.borderCol } },
      bottom: { style: "thin" as const, color: { argb: C.borderCol } },
      right: { style: "thin" as const, color: { argb: C.borderCol } },
    };

    const borderStrong = {
      top: { style: "medium" as const, color: { argb: "FF2D6A9F" } },
      bottom: { style: "medium" as const, color: { argb: "FF2D6A9F" } },
      left: { style: "medium" as const, color: { argb: "FF2D6A9F" } },
      right: { style: "medium" as const, color: { argb: "FF2D6A9F" } },
    };

    const headers = [
      "Tên thương hiệu (Tiếng Việt)*",
      "Tên thương hiệu (Tiếng Anh)",
      "Mô tả (Tiếng Việt)",
      "Mô tả (Tiếng Anh)",
      "Xuất xứ (Origin)",
      "Logo (URL)",
      "Thứ tự hiển thị",
      "Trạng thái (draft/published/archived)",
      "ID thương hiệu (để trống nếu tạo mới)",
    ];

    const sampleRow: Record<string, any> = {
      "Tên thương hiệu (Tiếng Việt)*": "Kohler",
      "Tên thương hiệu (Tiếng Anh)": "Kohler",
      "Mô tả (Tiếng Việt)": "Thương hiệu thiết bị vệ sinh cao cấp đến từ Mỹ.",
      "Mô tả (Tiếng Anh)": "Premium sanitary ware brand from the USA.",
      "Xuất xứ (Origin)": "Hoa Kỳ",
      "Logo (URL)": "https://res.cloudinary.com/demo/image/upload/v1/kohler.png",
      "Thứ tự hiển thị": 1,
      "Trạng thái (draft/published/archived)": "published",
      "ID thương hiệu (để trống nếu tạo mới)": "",
    };

    const groupColors: Record<string, string> = {
      "Tên thương hiệu (Tiếng Việt)*": "FFE8F8F5",
      "Tên thương hiệu (Tiếng Anh)": "FFEAF2F8",
      "Mô tả (Tiếng Việt)": "FFF2F3F4",
      "Mô tả (Tiếng Anh)": "FFF2F3F4",
      "Xuất xứ (Origin)": "FFFDF2E9",
      "Logo (URL)": "FFE8F6F3",
      "Thứ tự hiển thị": "FFFDEBD0",
      "Trạng thái (draft/published/archived)": "FFFDEDED",
      "ID thương hiệu (để trống nếu tạo mới)": "FFFDEDED",
    };

    const promptMessages: Record<string, { title: string; prompt: string }> = {
      "Tên thương hiệu (Tiếng Việt)*": {
        title: "Tên thương hiệu*",
        prompt: "Tên hiển thị của thương hiệu (ví dụ: Kohler, TOTO, Grohe). Bắt buộc. Slug tự sinh từ tên này.",
      },
      "Tên thương hiệu (Tiếng Anh)": {
        title: "Tên thương hiệu (EN)",
        prompt: "Tên tiếng Anh. Bỏ trống sẽ được tự động dịch từ tiếng Việt (nếu đã cấu hình khóa Gemini).",
      },
      "Mô tả (Tiếng Việt)": {
        title: "Mô tả (VI)",
        prompt: "Mô tả ngắn về thương hiệu bằng tiếng Việt.",
      },
      "Mô tả (Tiếng Anh)": {
        title: "Mô tả (EN)",
        prompt: "Mô tả tiếng Anh. Bỏ trống sẽ được tự động dịch từ tiếng Việt.",
      },
      "Xuất xứ (Origin)": {
        title: "Xuất xứ",
        prompt: "Quốc gia/xuất xứ của thương hiệu (ví dụ: Hoa Kỳ, Nhật Bản, Đức).",
      },
      "Logo (URL)": {
        title: "Logo (URL)",
        prompt: "Đường dẫn URL logo thương hiệu (http:// hoặc https://). Tùy chọn.",
      },
      "Thứ tự hiển thị": {
        title: "Thứ tự hiển thị",
        prompt: "Số nguyên quyết định thứ tự sắp xếp (nhỏ hiển thị trước). Mặc định 0.",
      },
      "Trạng thái (draft/published/archived)": {
        title: "Trạng thái",
        prompt: "Chọn: draft (nháp), published (xuất bản), hoặc archived (lưu trữ).",
      },
      "ID thương hiệu (để trống nếu tạo mới)": {
        title: "ID thương hiệu (Ẩn)",
        prompt: "Mã UUID thương hiệu. Chỉ điền khi cần cập nhật thương hiệu đang tồn tại.",
      },
    };

    // ─── Main Import Sheet ───
    const wsMain = workbook.addWorksheet("📥 Dữ liệu Import", {
      views: [{ state: "frozen", ySplit: 1 }],
    });

    const hdrRow = wsMain.addRow(headers);
    hdrRow.height = 36;
    hdrRow.eachCell((cell, colIdx) => {
      const h = headers[colIdx - 1];
      const bgColor = groupColors[h] || "FFFFFFFF";
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
      cell.font = { bold: true, color: { argb: "FF1A2530" }, size: 11, name: "Calibri" };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = borderStrong;
    });

    const smpRow = wsMain.addRow(headers.map((h) => sampleRow[h]));
    smpRow.height = 22;
    smpRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.sampleBg } };
      cell.font = { color: { argb: C.sampleFg }, size: 10, name: "Calibri" };
      cell.alignment = { horizontal: "left", vertical: "middle" };
      cell.border = borderStyle;
    });

    for (let r = 0; r < 500; r++) {
      const empRow = wsMain.addRow(headers.map(() => ""));
      empRow.height = 20;
      empRow.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } };
        cell.font = { size: 10, name: "Calibri" };
        cell.alignment = { horizontal: "left", vertical: "middle" };
        cell.border = borderStyle;
      });

      const rowIdx = r + 3;

      // Status dropdown (col 8 / H)
      wsMain.getCell(`H${rowIdx}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ['"draft,published,archived"'],
      };

      headers.forEach((h, colIdx) => {
        const colLetter = String.fromCharCode(65 + colIdx);
        const cell = wsMain.getCell(`${colLetter}${rowIdx}`);
        const promptInfo = promptMessages[h];
        if (promptInfo) {
          if (cell.dataValidation) {
            cell.dataValidation = {
              ...cell.dataValidation,
              showInputMessage: true,
              promptTitle: promptInfo.title,
              prompt: promptInfo.prompt,
            };
          } else {
            cell.dataValidation = {
              type: "custom",
              allowBlank: true,
              formulae: ["=TRUE"],
              showInputMessage: true,
              promptTitle: promptInfo.title,
              prompt: promptInfo.prompt,
            };
          }
        }
      });
    }

    headers.forEach((h, idx) => {
      const col = wsMain.getColumn(idx + 1);
      if (h.includes("ID thương hiệu")) {
        col.hidden = true;
      } else if (h.includes("URL") || h.includes("Mô tả")) {
        col.width = 46;
      } else if (h.includes("Tên")) {
        col.width = 33;
      } else {
        col.width = Math.max(h.length + 4, 15);
      }
    });

    // ─── Instruction Sheet ───
    const wsInstr = workbook.addWorksheet("📋 Gợi ý sử dụng");
    const wsInstrTitle = wsInstr.addRow(["📋 HƯỚNG DẪN NHẬP THƯƠNG HIỆU", ""]);
    wsInstrTitle.height = 40;
    wsInstr.mergeCells("A1:B1");
    const tCell = wsInstrTitle.getCell(1);
    tCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.instrHdr } };
    tCell.font = { bold: true, color: { argb: C.white }, size: 14, name: "Calibri" };
    tCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
    wsInstr.addRow(["", ""]).height = 10;

    const instrLines = [
      ["▲ Cột bắt buộc (*)", "Tên thương hiệu (Tiếng Việt) là bắt buộc. Bỏ trống sẽ báo lỗi."],
      ["🔵 Slug thương hiệu", "Tự động sinh từ Tên (Tiếng Việt): viết thường, không dấu, nối bằng dấu gạch ngang."],
      ["🔵 Bản dịch tiếng Anh", "Nếu bỏ trống Tên/Mô tả tiếng Anh, hệ thống tự dịch từ tiếng Việt qua Gemini (nếu có khóa API)."],
      ["🔵 Logo (URL)", "Đường dẫn ảnh logo bắt đầu bằng http:// hoặc https://."],
      ["🔵 Trạng thái", "Chọn draft, published hoặc archived từ danh sách xổ xuống."],
      ["🔵 ID thương hiệu (ẩn)", "Dùng cho chế độ cập nhật. Tạo mới thì bỏ trống."],
    ];

    instrLines.forEach(([label, desc], idx) => {
      const bg = idx % 2 === 0 ? C.instrBg : "FFFFFFFF";
      const row = wsInstr.addRow([label, desc]);
      row.height = 28;
      const cellA = row.getCell(1);
      cellA.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
      cellA.font = { bold: true, color: { argb: C.instrHdr }, size: 11, name: "Calibri" };
      cellA.alignment = { horizontal: "left", vertical: "middle" };
      cellA.border = borderStyle;
      const cellB = row.getCell(2);
      cellB.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
      cellB.font = { size: 11, name: "Calibri" };
      cellB.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
      cellB.border = borderStyle;
    });
    wsInstr.getColumn(1).width = 30;
    wsInstr.getColumn(2).width = 80;

    // ─── Common errors sheet ───
    const wsErrors = workbook.addWorksheet("❌ Lỗi thường gặp");
    const errHdr = wsErrors.addRow(["Mã lỗi", "Lỗi thường gặp", "Mô tả nguyên nhân", "Cách khắc phục"]);
    errHdr.height = 32;
    errHdr.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFC0392B" } };
      cell.font = { bold: true, color: { argb: C.white }, size: 11, name: "Calibri" };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = borderStyle;
    });

    const errorDefs = [
      ["ERR_REQUIRED", "Bỏ trống trường bắt buộc", "Cột Tên thương hiệu (Tiếng Việt) bị bỏ trống.", "Điền tên thương hiệu trước khi import."],
      ["ERR_DUP_SLUG", "Trùng slug hệ thống", "Tên thương hiệu tạo ra slug trùng với thương hiệu đã có.", "Đổi tên hoặc điền ID thương hiệu ở cột ẩn để cập nhật."],
      ["ERR_ENUM_INVALID", "Trạng thái sai", "Cột Trạng thái nhập sai (ví dụ 'active').", "Dùng dropdown để chọn draft/published/archived."],
      ["ERR_IMAGE_INVALID", "Đường dẫn logo sai", "Logo (URL) không đúng định dạng URL.", "Nhập đường dẫn hợp lệ bắt đầu bằng http:// hoặc https://."],
    ];
    errorDefs.forEach(([code, title, desc, solution], idx) => {
      const bg = idx % 2 === 0 ? "FFFADBD8" : "FFFFFFFF";
      const r = wsErrors.addRow([code, title, desc, solution]);
      r.height = 24;
      r.eachCell((cell, colIdx) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
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
        "Content-Disposition": 'attachment; filename="Template_Import_Thuong_Hieu.xlsx"',
      },
    });
  } catch (err: any) {
    console.error("Error generating brand template:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
