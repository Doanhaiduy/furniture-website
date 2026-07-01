import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "editor")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

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
      "Tên Showroom (Tiếng Việt)*",
      "Địa chỉ (Tiếng Việt)*",
      "Tỉnh/Thành phố*",
      "Giờ mở cửa (Tiếng Việt)",
      "Hotline*",
      "Email",
      "URL bản đồ nhúng Google Maps*",
      "URL bản đồ dự phòng Google Maps*",
      "Latitude",
      "Longitude",
      "Ảnh chính (URL)",
      "Thứ tự hiển thị",
      "Trạng thái (draft/published/archived)",
      "ID showroom (để trống nếu tạo mới)"
    ];

    const sampleRow = {
      "Tên Showroom (Tiếng Việt)*": "Showroom Quận 7",
      "Địa chỉ (Tiếng Việt)*": "124 Nguyễn Thị Thập, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh",
      "Tỉnh/Thành phố*": "Hồ Chí Minh",
      "Giờ mở cửa (Tiếng Việt)": "8:00 - 21:00",
      "Hotline*": "0901234567",
      "Email": "showroomq7@furniture.vn",
      "URL bản đồ nhúng Google Maps*": "https://www.google.com/maps/embed?pb=...",
      "URL bản đồ dự phòng Google Maps*": "https://maps.google.com/?q=Showroom+Quan+7",
      "Ảnh chính (URL)": "https://res.cloudinary.com/demo/image/upload/v1/showroom.jpg",
      "Latitude": 10.7769,
      "Longitude": 106.7009,
      "Thứ tự hiển thị": 1,
      "Trạng thái (draft/published/archived)": "published",
      "ID showroom (để trống nếu tạo mới)": ""
    };

    const groupColors: Record<string, string> = {
      "Tên Showroom (Tiếng Việt)*": "FFE8F8F5", // Basic, Green
      "Địa chỉ (Tiếng Việt)*": "FFE8F8F5",
      "Tỉnh/Thành phố*": "FFE8F8F5",
      "Giờ mở cửa (Tiếng Việt)": "FFF2F3F4", // Specs, Gray
      "Hotline*": "FFF2F3F4",
      "Email": "FFF2F3F4",
      "URL bản đồ nhúng Google Maps*": "FFEAF2F8", // Location, Blue
      "URL bản đồ dự phòng Google Maps*": "FFEAF2F8",
      "Latitude": "FFEAF2F8",
      "Longitude": "FFEAF2F8",
      "Ảnh chính (URL)": "FFE8F6F3", // Media, Cyan
      "Thứ tự hiển thị": "FFFDED", // System, Salmon
      "Trạng thái (draft/published/archived)": "FFFDED",
      "ID showroom (để trống nếu tạo mới)": "FFFDED"
    };

    const promptMessages: Record<string, { title: string; prompt: string }> = {
      "Tên Showroom (Tiếng Việt)*": {
        title: "Tên Showroom*",
        prompt: "Tên đầy đủ của showroom (ví dụ: Showroom Quận 7). Bắt buộc."
      },
      "Địa chỉ (Tiếng Việt)*": {
        title: "Địa chỉ*",
        prompt: "Địa chỉ chi tiết (ví dụ: 124 Nguyễn Thị Thập, Tân Phú, Quận 7). Bắt buộc."
      },
      "Tỉnh/Thành phố*": {
        title: "Tỉnh/Thành phố*",
        prompt: "Bắt buộc. Chọn từ danh sách xổ xuống (Hồ Chí Minh, Hà Nội, Đà Nẵng...)."
      },
      "Giờ mở cửa (Tiếng Việt)": {
        title: "Giờ mở cửa",
        prompt: "Ví dụ: 8:00 - 21:00."
      },
      "Hotline*": {
        title: "Hotline*",
        prompt: "Số điện thoại hotline liên hệ (ví dụ: 0901234567). Bắt buộc."
      },
      "Email": {
        title: "Email",
        prompt: "Nhập địa chỉ email showroom (ví dụ: showroomq7@furniture.vn)."
      },
      "URL bản đồ nhúng Google Maps*": {
        title: "URL bản đồ nhúng*",
        prompt: "Bắt buộc. Link nhúng src copy từ iframe chia sẻ của Google Maps."
      },
      "URL bản đồ dự phòng Google Maps*": {
        title: "URL bản đồ dự phòng*",
        prompt: "Bắt buộc. Link vị trí Google Maps dạng thông thường."
      },
      "Latitude": {
        title: "Latitude",
        prompt: "Tọa độ vĩ độ (ví dụ: 10.7769)."
      },
      "Longitude": {
        title: "Longitude",
        prompt: "Tọa độ kinh độ (ví dụ: 106.7009)."
      },
      "Ảnh chính (URL)": {
        title: "Ảnh chính",
        prompt: "Đường dẫn URL ảnh đại diện showroom."
      },
      "Thứ tự hiển thị": {
        title: "Thứ tự hiển thị",
        prompt: "Số nguyên sắp xếp hiển thị (ví dụ: 1)."
      },
      "Trạng thái (draft/published/archived)": {
        title: "Trạng thái",
        prompt: "Chọn draft (nháp), published (xuất bản), hoặc archived (lưu trữ) từ dropdown."
      },
      "ID showroom (để trống nếu tạo mới)": {
        title: "ID showroom (Ẩn)",
        prompt: "Mã UUID showroom. Chỉ điền khi cần cập nhật showroom đã có."
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

      // Col 3: Tỉnh/Thành phố pointing to reference sheet (Col C)
      wsMain.getCell(`C${rowIdx}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ["='📊 Tỉnh Thành'!$B$2:$B$64"]
      };

      // Col 13: Status (draft/published/archived) (Col M)
      wsMain.getCell(`M${rowIdx}`).dataValidation = {
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
      if (h.includes("ID showroom")) {
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
    const wsInstrTitle = wsInstr.addRow(["📋 HƯỚNG DẪN SỬ DỤNG FILE IMPORT SHOWROOM", ""]);
    wsInstrTitle.height = 40;
    wsInstr.mergeCells("A1:B1");
    const tCell = wsInstrTitle.getCell(1);
    tCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.instrHdr } };
    tCell.font = { bold: true, color: { argb: C.white }, size: 14, name: "Calibri" };
    tCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };

    wsInstr.addRow(["", ""]).height = 10;

    const instrLines = [
      ["🔵 Cột bắt buộc (*)", "Các cột đánh dấu * là bắt buộc. Bỏ trống sẽ báo lỗi khi import."],
      ["🔵 Tên Showroom (Tiếng Việt)*", "Tên chính của showroom. Hệ thống tự động tạo mã (slug) từ tên này."],
      ["🔵 Tỉnh/Thành phố*", "Chọn từ dropdown list hoặc xem sheet '📊 Tỉnh Thành'. Cần nhập chính xác tên tỉnh/thành."],
      ["🔵 Hotline*", "Số điện thoại liên hệ của showroom."],
      ["🔵 URL bản đồ nhúng*", "Đường dẫn URL nhúng Google Maps iframe (bắt đầu bằng https://www.google.com/maps/embed)."],
      ["🔵 Trạng thái", "Chỉ nhập: draft | published | archived."],
      ["🔵 ID showroom (ẩn)", "Dành cho chế độ cập nhật showroom đã có. Nếu tạo mới showroom thì bỏ trống."]
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

    // ─── Reference sheet: 63 Provinces ───
    const wsProvinces = workbook.addWorksheet("📊 Tỉnh Thành", {
      views: [{ state: 'frozen', ySplit: 1 }]
    });
    const provHeaders = ["STT", "Tên Tỉnh/Thành Phố"];
    const provHdr = wsProvinces.addRow(provHeaders);
    provHdr.height = 32;
    provHdr.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.refHdr } };
      cell.font = { bold: true, color: { argb: C.white }, size: 11, name: "Calibri" };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = borderStyle;
    });

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

    provinces.forEach((name, idx) => {
      const bg = idx % 2 === 0 ? "FFEAFAF1" : "FFFFFFFF";
      const r = wsProvinces.addRow([
        String(idx + 1),
        name
      ]);
      r.height = 22;
      r.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
        cell.border = borderStyle;
        cell.alignment = { horizontal: "left", vertical: "middle" };
        cell.font = { size: 10, name: "Calibri", color: { argb: "FF333333" } };
      });
    });
    wsProvinces.getColumn(1).width = 6;
    wsProvinces.getColumn(2).width = 30;

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
      ["ERR_REQUIRED", "Bỏ trống trường bắt buộc", "Các cột có dấu * như Tên Showroom, Địa chỉ, Tỉnh thành, Hotline, Bản đồ bị bỏ trống.", "Điền đầy đủ thông tin trước khi import."],
      ["ERR_PROVINCE_INVALID", "Tên Tỉnh/Thành không hợp lệ", "Tên tỉnh/thành nhập sai chính tả hoặc không khớp với dropdown.", "Sử dụng dropdown tích hợp sẵn hoặc xem sheet '📊 Tỉnh Thành' để copy."],
      ["ERR_ENUM_INVALID", "Trạng thái sai", "Trạng thái khác draft/published/archived.", "Sử dụng dropdown tích hợp sẵn trong ô để chọn."],
      ["ERR_DUP_SLUG", "Trùng slug hệ thống", "Tên showroom tạo ra slug trùng lặp với showroom đã tồn tại.", "Đổi tên showroom hoặc điền ID showroom ở cột ẩn để cập nhật."]
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
        "Content-Disposition": 'attachment; filename="Template_Import_Showroom.xlsx"'
      }
    });

  } catch (err: any) {
    console.error("Error generating showroom template:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
