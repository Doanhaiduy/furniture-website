/**
* Maps raw save/mutation errors (often raw Postgres messages) to friendly
* Vietnamese messages for the admin UI. Known human-friendly messages returned
* by the server actions are passed through unchanged; raw SQL-looking errors are
* mapped to a known message or hidden behind a generic one so we never surface
* things like `duplicate key value violates unique constraint "uq_..."`.
*/
export function friendlySaveError(raw?: string | null): string {
  const original = raw || "";
  const msg = original.toLowerCase();
  if (!msg.trim()) return "Không thể lưu. Vui lòng thử lại.";

  // Product reference code
  if (
    msg.includes("uq_products_reference_code") ||
    (msg.includes("reference_code") && (msg.includes("duplicate") || msg.includes("unique")))
  ) {
    return "Mã sản phẩm đã tồn tại. Vui lòng dùng mã khác (hoặc để trống để hệ thống tự sinh mã).";
  }

  // Generic duplicate / unique violations
  if (msg.includes("duplicate key") || msg.includes("unique constraint") || msg.includes("already exists")) {
    if (msg.includes("slug")) {
      return "Đường dẫn (slug) đã tồn tại. Hãy đổi tên hoặc đường dẫn cho khác đi.";
    }
    if (msg.includes("_code") || msg.includes("code_active") || /\bcode\b/.test(msg)) {
      return "Mã đã tồn tại. Vui lòng dùng mã khác.";
    }
    if (msg.includes("email")) {
      return "Email này đã được sử dụng.";
    }
    return "Dữ liệu bị trùng lặp với một mục đã có. Vui lòng kiểm tra lại.";
  }

  // Invalid enum value (e.g. an unmapped group_key / status)
  if (msg.includes("invalid input value for enum") || msg.includes("22p02")) {
    return "Giá trị lựa chọn không hợp lệ. Vui lòng chọn lại.";
  }

  // Showroom map URL / coordinate CHECK constraints
  if (msg.includes("map_urls") || (msg.includes("google") && msg.includes("https"))) {
    return "Đường dẫn Google Maps phải bắt đầu bằng https://.";
  }
  if (msg.includes("coordinates")) {
    return "Toạ độ (vĩ độ/kinh độ) không hợp lệ.";
  }

  // Publish trigger: requires both vi + en translations
  if (msg.includes("without required") && msg.includes("translations")) {
    return "Cần đủ nội dung tiếng Việt và tiếng Anh trước khi xuất bản.";
  }

  // Cover image requirement
  if ((msg.includes("cover") || msg.includes("ảnh bìa")) && (msg.includes("required") || msg.includes("publish") || msg.includes("xuất bản"))) {
    return "Cần có ảnh bìa trước khi xuất bản.";
  }

  // Foreign key violations (bad category / brand / showroom reference)
  if (msg.includes("foreign key")) {
    return "Dữ liệu liên kết không hợp lệ (danh mục/thương hiệu/showroom). Vui lòng kiểm tra lại.";
  }

  // Missing required column
  if (msg.includes("null value in column") || msg.includes("not-null") || msg.includes("violates not-null")) {
    return "Thiếu thông tin bắt buộc. Vui lòng điền đầy đủ các trường bắt buộc.";
  }

  // Permission / RLS
  if (msg.includes("permission") || msg.includes("not authorized") || msg.includes("row-level security") || msg.includes("unauthorized")) {
    return "Bạn không có quyền thực hiện thao tác này.";
  }

  // Still looks like a raw DB/system error → hide it behind a generic message.
  if (/constraint|violates|relation |column |pgrst|postgres|sqlstate|syntax error|null value|check_/i.test(original)) {
    return "Không thể lưu. Vui lòng kiểm tra lại thông tin và thử lại.";
  }

  // Otherwise it's already a human-friendly message from the server action.
  return original;
}
 