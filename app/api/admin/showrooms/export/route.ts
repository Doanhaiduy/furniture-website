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

    // Query all showrooms from database
    const { data: dbShowrooms, error } = await supabase
      .from("showrooms")
      .select(`
        *,
        showroom_translations (*)
      `)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Showrooms Export");

    const headers = [
      "Tên Showroom (Tiếng Việt)*", "Tên Showroom (Tiếng Anh)",
      "Địa chỉ (Tiếng Việt)*", "Địa chỉ (Tiếng Anh)", 
      "Tỉnh/Thành phố*", "Giờ mở cửa (Tiếng Việt)", "Giờ mở cửa (Tiếng Anh)", 
      "Hotline*", "Email", "URL bản đồ nhúng Google Maps*", "URL bản đồ dự phòng Google Maps*", 
      "Ảnh chính (URL)", "Latitude", "Longitude", "Thứ tự hiển thị", "Trạng thái (draft/published/archived)",
      "ID showroom (để trống nếu tạo mới)"
    ];

    const C = {
      navyReq:  "FF1E3A5F",
      blueOpt:  "FF2D6A9F",
      white:    "FFFFFFFF",
      borderCol: "FFCBD5E0"
    };

    const borderStyle = {
      top: { style: 'thin' as const, color: { argb: C.borderCol } },
      left: { style: 'thin' as const, color: { argb: C.borderCol } },
      bottom: { style: 'thin' as const, color: { argb: C.borderCol } },
      right: { style: 'thin' as const, color: { argb: C.borderCol } }
    };

    // Header Row
    const hdrRow = ws.addRow(headers);
    hdrRow.height = 30;
    hdrRow.eachCell((cell, colIdx) => {
      const h = headers[colIdx - 1];
      const isRequired = h.endsWith("*");
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isRequired ? C.navyReq : C.blueOpt }
      };
      cell.font = { bold: true, color: { argb: C.white }, size: 10, name: "Calibri" };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = borderStyle;
    });

    // Populate rows
    (dbShowrooms ?? []).forEach((s) => {
      const trans = Array.isArray(s.showroom_translations) ? s.showroom_translations : [];
      const viTrans = trans.find((t: any) => t.locale === "vi");
      const enTrans = trans.find((t: any) => t.locale === "en");

      // Extract province from address_vi or fallback
      let detectedProvince = "";
      const address = viTrans?.address || "";
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
      for (const p of provinces) {
        if (address.toLowerCase().includes(p.toLowerCase())) {
          detectedProvince = p;
          break;
        }
      }
      if (!detectedProvince) detectedProvince = "Hồ Chí Minh"; // Fallback default

      const rowValues = [
        viTrans?.name || "",
        enTrans?.name || "",
        viTrans?.address || "",
        enTrans?.address || "",
        detectedProvince,
        viTrans?.opening_hours || "",
        enTrans?.opening_hours || "",
        s.hotline || "",
        s.email || "",
        s.google_maps_embed_url || "",
        s.google_maps_fallback_url || "",
        s.cover_image || "",
        s.latitude !== null ? Number(s.latitude) : "",
        s.longitude !== null ? Number(s.longitude) : "",
        s.sort_order !== null ? Number(s.sort_order) : 0,
        s.status || "draft",
        s.id
      ];

      const r = ws.addRow(rowValues);
      r.height = 20;
      r.eachCell((cell) => {
        cell.font = { size: 10, name: "Calibri" };
        cell.alignment = { horizontal: "left", vertical: "middle" };
        cell.border = borderStyle;
      });
    });

    // Formatting column widths and hiding ID
    headers.forEach((h, idx) => {
      const col = ws.getColumn(idx + 1);
      if (h.includes("ID showroom")) {
        col.hidden = true;
      } else if (h.includes("URL") || h.includes("Địa chỉ") || h.includes("Mô tả")) {
        col.width = 46;
      } else if (h.includes("Tên") || h.includes("Giờ mở cửa")) {
        col.width = 33;
      } else if (h.includes("Slug")) {
        col.width = 28;
      } else {
        col.width = Math.max(h.length + 4, 15);
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="Export_Danh_Sach_Showroom.xlsx"'
      }
    });

  } catch (err: any) {
    console.error("Error exporting showrooms:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
