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

    // Query all categories from database
    const { data: dbCategories, error } = await supabase
      .from("product_categories")
      .select(`
        *,
        product_category_translations (*)
      `)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const categoriesMap: Record<string, string> = {}; // id -> slug
    (dbCategories ?? []).forEach(c => {
      const trans = Array.isArray(c.product_category_translations) ? c.product_category_translations : [];
      const viSlug = trans.find((t: any) => t.locale === "vi")?.slug || "";
      if (viSlug) categoriesMap[c.id] = viSlug;
    });

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Categories Export");

    const headers = [
      "Tên danh mục (Tiếng Việt)*", "Tên danh mục (Tiếng Anh)",
      "Mô tả (Tiếng Việt)", "Mô tả (Tiếng Anh)", "Mã nhóm hàng (wood/sanitary/tiles/other)*",
      "Slug danh mục cha (để trống nếu là nhóm gốc)", "Ảnh chính (URL)", "Thứ tự hiển thị", "Trạng thái (draft/published/archived)",
      "ID danh mục (để trống nếu tạo mới)"
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
    (dbCategories ?? []).forEach((c) => {
      const trans = Array.isArray(c.product_category_translations) ? c.product_category_translations : [];
      const viTrans = trans.find((t: any) => t.locale === "vi");
      const enTrans = trans.find((t: any) => t.locale === "en");

      const parentSlug = c.parent_id ? (categoriesMap[c.parent_id] || "") : "";

      const rawGroupKey = c.group_key || "";
      const groupKeyMapped = rawGroupKey === "wooden_furniture" ? "wood"
        : rawGroupKey === "sanitary_equipment" ? "sanitary"
        : rawGroupKey === "tiles" ? "tiles"
        : "other";

      const rowValues = [
        viTrans?.name || "",
        enTrans?.name || "",
        viTrans?.description || "",
        enTrans?.description || "",
        groupKeyMapped,
        parentSlug,
        c.cover_image || "",
        c.sort_order !== null ? Number(c.sort_order) : 0,
        c.status || "draft",
        c.id
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

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="Export_Danh_Sach_Danh_Muc.xlsx"'
      }
    });

  } catch (err: any) {
    console.error("Error exporting categories:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
