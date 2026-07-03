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

    // Query all products from database with translations, categories, brands, media
    const { data: dbProducts, error } = await supabase
      .from("products")
      .select(`
        *,
        product_translations (*),
        brands (id, slug, brand_translations(locale, name)),
        product_categories (id, product_category_translations(locale, slug, name)),
        product_media (is_primary, media_id, media:media_assets(public_url))
      `)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Products Export");

    const headers = [
      "Mã sản phẩm (Reference Code)", "Tên sản phẩm (Tiếng Việt)*", "Tên sản phẩm (Tiếng Anh)",
      "Mô tả ngắn (Tiếng Việt)*", "Mô tả ngắn (Tiếng Anh)", "Vật liệu hiển thị (Tiếng Việt)",
      "Vật liệu hiển thị (Tiếng Anh)", "Mô tả kích thước (Tiếng Việt)", "Mô tả kích thước (Tiếng Anh)",
      "Giá tối thiểu (VND)", "Giá tối đa (VND)", "Đơn vị tính (Unit)", "Mã Showroom (Showroom Code)",
      "Chiều rộng (mm)", "Chiều sâu (mm)", "Chiều cao (mm)",
      "Slug danh mục*", "Slug thương hiệu", "Dòng sản phẩm/Series",
      "Ảnh chính (URL)*", "Thư viện ảnh (các URL cách nhau bởi dấu phẩy)",
      "Nổi bật (TRUE/FALSE)", "Trạng thái (draft/published/archived)",
      "Vật liệu chi tiết (Tiếng Việt)", "Vật liệu chi tiết (Tiếng Anh)",
      "Hoàn thiện bề mặt (Tiếng Việt)", "Hoàn thiện bề mặt (Tiếng Anh)",
      "Hướng dẫn bảo quản (Tiếng Việt)", "Hướng dẫn bảo quản (Tiếng Anh)",
      "ID sản phẩm (để trống nếu tạo mới)"
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

    // Sample/example row at row 2 so the exported file matches the import template layout:
    // the importer skips row 2 and reads data from row 3. Without it, re-importing an export
    // silently dropped the first record (off-by-one).
    const sampleRow = ws.addRow(headers.map((h) => (h.endsWith("*") ? "(ví dụ)" : "")));
    sampleRow.height = 18;
    sampleRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEBF3FB" } };
      cell.font = { italic: true, color: { argb: "FF6B7280" }, size: 9, name: "Calibri" };
      cell.border = borderStyle;
    });

    // Populate rows
    (dbProducts ?? []).forEach((p) => {
      const trans = Array.isArray(p.product_translations) ? p.product_translations : [];
      const viTrans = trans.find((t: any) => t.locale === "vi");
      const enTrans = trans.find((t: any) => t.locale === "en");

      const cat = p.product_categories as any;
      const catTrans = Array.isArray(cat?.product_category_translations) ? cat.product_category_translations : [];
      const catSlug = catTrans.find((t: any) => t.locale === "vi")?.slug || "";

      const brand = p.brands as any;
      const brandSlug = brand?.slug || "";

      // Media parsing
      const mediaList = Array.isArray(p.product_media) ? p.product_media : [];
      const primaryMedia = mediaList.find((m: any) => m.is_primary)?.media?.public_url || p.cover_image || "";
      const otherMedia = mediaList
        .filter((m: any) => !m.is_primary && m.media?.public_url)
        .map((m: any) => m.media.public_url)
        .join(",");

      const specs = p.specifications || {};

      const rowValues = [
        p.reference_code || "",
        viTrans?.name || "",
        enTrans?.name || "",
        viTrans?.summary || "",
        enTrans?.summary || "",
        viTrans?.material || "",
        enTrans?.material || "",
        viTrans?.dimension_display_text || "",
        enTrans?.dimension_display_text || "",
        p.price_min !== null ? Number(p.price_min) : "",
        p.price_max !== null ? Number(p.price_max) : "",
        p.price_unit || "",
        p.showroom_code || "",
        p.width !== null ? Number(p.width) : "",
        p.depth !== null ? Number(p.depth) : "",
        p.height !== null ? Number(p.height) : "",
        catSlug,
        brandSlug,
        p.brand_series || "",
        primaryMedia,
        otherMedia,
        p.featured ? "TRUE" : "FALSE",
        p.status || "draft",
        specs.material_vi || "",
        specs.material_en || "",
        specs.finish_vi || "",
        specs.finish_en || "",
        specs.care_vi || "",
        specs.care_en || "",
        p.id
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
      if (h.includes("ID sản phẩm")) {
        col.hidden = true;
      } else if (h.includes("URL") || h.includes("Địa chỉ") || h.includes("Mô tả")) {
        col.width = 46;
      } else if (h.includes("Tên") || h.includes("Vật liệu") || h.includes("Hoàn thiện")) {
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
        "Content-Disposition": 'attachment; filename="Export_Danh_Sach_San_Pham.xlsx"'
      }
    });

  } catch (err: any) {
    console.error("Error exporting products:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
