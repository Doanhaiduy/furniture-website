/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "editor")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const supabase = createAdminClient();

    const { data: dbBrands, error } = await supabase
      .from("brands")
      .select(`*, brand_translations (*)`)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Resolve logo public URLs from media_assets (brands.logo_media_id).
    const logoIds = Array.from(
      new Set((dbBrands ?? []).map((b) => b.logo_media_id).filter(Boolean))
    ) as string[];
    const logoMap: Record<string, string> = {};
    if (logoIds.length > 0) {
      const { data: media } = await supabase
        .from("media_assets")
        .select("id, public_url")
        .in("id", logoIds);
      (media ?? []).forEach((m) => {
        if (m.public_url) logoMap[m.id] = m.public_url;
      });
    }

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Brands Export");

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

    const C = { navyReq: "FF1E3A5F", blueOpt: "FF2D6A9F", white: "FFFFFFFF", borderCol: "FFCBD5E0" };
    const borderStyle = {
      top: { style: "thin" as const, color: { argb: C.borderCol } },
      left: { style: "thin" as const, color: { argb: C.borderCol } },
      bottom: { style: "thin" as const, color: { argb: C.borderCol } },
      right: { style: "thin" as const, color: { argb: C.borderCol } },
    };

    const hdrRow = ws.addRow(headers);
    hdrRow.height = 30;
    hdrRow.eachCell((cell, colIdx) => {
      const h = headers[colIdx - 1];
      const isRequired = h.endsWith("*");
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: isRequired ? C.navyReq : C.blueOpt } };
      cell.font = { bold: true, color: { argb: C.white }, size: 10, name: "Calibri" };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = borderStyle;
    });

    // Sample/example row at row 2 to match the import template layout (importer reads from row 3).
    const sampleRow = ws.addRow(headers.map((h) => (h.endsWith("*") ? "(ví dụ)" : "")));
    sampleRow.height = 18;
    sampleRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEBF3FB" } };
      cell.font = { italic: true, color: { argb: "FF6B7280" }, size: 9, name: "Calibri" };
      cell.border = borderStyle;
    });

    (dbBrands ?? []).forEach((b) => {
      const trans = Array.isArray(b.brand_translations) ? b.brand_translations : [];
      const viTrans = trans.find((t: any) => t.locale === "vi");
      const enTrans = trans.find((t: any) => t.locale === "en");

      const rowValues = [
        viTrans?.name || "",
        enTrans?.name || "",
        viTrans?.description || "",
        enTrans?.description || "",
        b.origin || "",
        b.logo_media_id ? logoMap[b.logo_media_id] || "" : "",
        b.sort_order !== null ? Number(b.sort_order) : 0,
        b.status || "draft",
        b.id,
      ];

      const r = ws.addRow(rowValues);
      r.height = 20;
      r.eachCell((cell) => {
        cell.font = { size: 10, name: "Calibri" };
        cell.alignment = { horizontal: "left", vertical: "middle" };
        cell.border = borderStyle;
      });
    });

    headers.forEach((h, idx) => {
      const col = ws.getColumn(idx + 1);
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

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="Export_Danh_Sach_Thuong_Hieu.xlsx"',
      },
    });
  } catch (err: any) {
    console.error("Error exporting brands:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
