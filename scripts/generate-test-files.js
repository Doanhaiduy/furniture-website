const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../test-excel-files');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Border Styles
const C = {
  borderCol: 'FFCBD5E0',
  navyReq: 'FF1E3A5F',
  blueOpt: 'FF2D6A9F',
  sampleBg: 'FFEBF3FB',
  sampleFg: 'FF1A2B3C'
};

const borderStyle = {
  top: { style: 'thin', color: { argb: C.borderCol } },
  left: { style: 'thin', color: { argb: C.borderCol } },
  bottom: { style: 'thin', color: { argb: C.borderCol } },
  right: { style: 'thin', color: { argb: C.borderCol } }
};

const borderStrong = {
  top: { style: 'medium', color: { argb: 'FF2D6A9F' } },
  bottom: { style: 'medium', color: { argb: 'FF2D6A9F' } },
  left: { style: 'medium', color: { argb: 'FF2D6A9F' } },
  right: { style: 'medium', color: { argb: 'FF2D6A9F' } }
};

// Styling function for worksheets
function styleWorksheet(ws, headers, sampleRow, dataRows) {
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  // Row 1: Headers
  const hdrRow = ws.addRow(headers);
  hdrRow.height = 36;
  hdrRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A5F' } // Dark navy for all test headers
    };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Calibri' };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = borderStrong;
  });

  // Row 2: Sample Row (skipped by importer, used for instruction/visual matching)
  const sampleVals = headers.map(h => sampleRow[h] !== undefined ? sampleRow[h] : '');
  const smpRow = ws.addRow(sampleVals);
  smpRow.height = 22;
  smpRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.sampleBg } };
    cell.font = { color: { argb: C.sampleFg }, size: 10, name: 'Calibri', italic: true };
    cell.alignment = { horizontal: 'left', vertical: 'middle' };
    cell.border = borderStyle;
  });

  // Row 3+: Data Rows
  dataRows.forEach(rowData => {
    const rowVals = headers.map(h => rowData[h] !== undefined ? rowData[h] : '');
    const row = ws.addRow(rowVals);
    row.height = 20;
    row.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
      cell.font = { size: 10, name: 'Calibri' };
      cell.alignment = { horizontal: 'left', vertical: 'middle' };
      cell.border = borderStyle;
    });
  });

  // Auto-fit column widths
  ws.columns.forEach((column, i) => {
    let maxLength = headers[i].length;
    ws.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      const cellValue = row.getCell(i + 1).value;
      if (cellValue) {
        maxLength = Math.max(maxLength, cellValue.toString().length);
      }
    });
    column.width = Math.min(Math.max(maxLength + 3, 12), 40);
  });
}

// ==========================================
// MODULE 1: CATEGORIES
// ==========================================
const categoryHeaders = [
  "Tên danh mục (Tiếng Việt)*",
  "Mô tả (Tiếng Việt)",
  "Mã nhóm hàng (wood/sanitary/tiles/other)*",
  "Slug danh mục cha (để trống nếu là nhóm gốc)",
  "Ảnh chính (URL)",
  "Thứ tự hiển thị",
  "Trạng thái (draft/published/archived)",
  "ID danh mục (để trống nếu tạo mới)"
];

const categorySampleRow = {
  "Tên danh mục (Tiếng Việt)*": "Sofa Phòng Khách",
  "Mô tả (Tiếng Việt)": "Danh mục sofa phòng khách cao cấp",
  "Mã nhóm hàng (wood/sanitary/tiles/other)*": "wood",
  "Slug danh mục cha (để trống nếu là nhóm gốc)": "do-go-noi-that",
  "Ảnh chính (URL)": "https://res.cloudinary.com/demo/image/upload/v1/category.jpg",
  "Thứ tự hiển thị": "10",
  "Trạng thái (draft/published/archived)": "published",
  "ID danh mục (để trống nếu tạo mới)": ""
};

// 1.1 Categories - Success
const categoriesSuccessData = [
  {
    "Tên danh mục (Tiếng Việt)*": "Bàn Trà Gỗ Óc Chó",
    "Mô tả (Tiếng Việt)": "Các mẫu bàn trà cao cấp bằng chất liệu gỗ óc chó tự nhiên Mỹ.",
    "Mã nhóm hàng (wood/sanitary/tiles/other)*": "wood",
    "Slug danh mục cha (để trống nếu là nhóm gốc)": "do-go-noi-that", // Matches seeded root category
    "Ảnh chính (URL)": "https://res.cloudinary.com/demo/image/upload/v1/ban-tra-oc-cho.jpg",
    "Thứ tự hiển thị": "1",
    "Trạng thái (draft/published/archived)": "published",
    "ID danh mục (để trống nếu tạo mới)": ""
  },
  {
    "Tên danh mục (Tiếng Việt)*": "Sen Tắm Nhiệt Độ",
    "Mô tả (Tiếng Việt)": "Sen tắm giữ nhiệt thông minh an toàn cho trẻ em.",
    "Mã nhóm hàng (wood/sanitary/tiles/other)*": "sanitary",
    "Slug danh mục cha (để trống nếu là nhóm gốc)": "thiet-bi-ve-sinh", // Matches seeded root category
    "Ảnh chính (URL)": "https://res.cloudinary.com/demo/image/upload/v1/sen-tam-nhiet-do.jpg",
    "Thứ tự hiển thị": "2",
    "Trạng thái (draft/published/archived)": "published",
    "ID danh mục (để trống nếu tạo mới)": ""
  },
  {
    "Tên danh mục (Tiếng Việt)*": "Gạch Men Matt",
    "Mô tả (Tiếng Việt)": "Gạch men mờ chống trơn trượt nhập khẩu Tây Ban Nha.",
    "Mã nhóm hàng (wood/sanitary/tiles/other)*": "tiles",
    "Slug danh mục cha (để trống nếu là nhóm gốc)": "",
    "Ảnh chính (URL)": "",
    "Thứ tự hiển thị": "5",
    "Trạng thái (draft/published/archived)": "draft",
    "ID danh mục (để trống nếu tạo mới)": ""
  }
];

// 1.2 Categories - Errors
const categoriesErrorsData = [
  {
    "Tên danh mục (Tiếng Việt)*": "", // Error: Missing required name
    "Mô tả (Tiếng Việt)": "Dòng này bị lỗi vì thiếu tên danh mục.",
    "Mã nhóm hàng (wood/sanitary/tiles/other)*": "wood",
    "Slug danh mục cha (để trống nếu là nhóm gốc)": "",
    "Ảnh chính (URL)": "",
    "Thứ tự hiển thị": "1",
    "Trạng thái (draft/published/archived)": "published",
    "ID danh mục (để trống nếu tạo mới)": ""
  },
  {
    "Tên danh mục (Tiếng Việt)*": "Bồn Tắm Massage Cao Cấp",
    "Mô tả (Tiếng Việt)": "Lỗi mã nhóm hàng không hợp lệ.",
    "Mã nhóm hàng (wood/sanitary/tiles/other)*": "bath", // Error: Invalid group key
    "Slug danh mục cha (để trống nếu là nhóm gốc)": "",
    "Ảnh chính (URL)": "",
    "Thứ tự hiển thị": "2",
    "Trạng thái (draft/published/archived)": "published",
    "ID danh mục (để trống nếu tạo mới)": ""
  },
  {
    "Tên danh mục (Tiếng Việt)*": "Tủ Lavabo Hợp Kim",
    "Mô tả (Tiếng Việt)": "Lỗi slug cha không tồn tại và lỗi định dạng URL ảnh.",
    "Mã nhóm hàng (wood/sanitary/tiles/other)*": "sanitary",
    "Slug danh mục cha (để trống nếu là nhóm gốc)": "slug-khong-ton-tai-12345", // Error: Parent category doesn't exist
    "Ảnh chính (URL)": "cloudinary.com/logo.png", // Error: URL must start with http/https
    "Thứ tự hiển thị": "3",
    "Trạng thái (draft/published/archived)": "invalid_status", // Error: Invalid status enum
    "ID danh mục (để trống nếu tạo mới)": "invalid-uuid-format" // Error: Invalid UUID format
  }
];

// 1.3 Categories - Updates
const categoriesUpdatesData = [
  {
    "Tên danh mục (Tiếng Việt)*": "Đồ gỗ nội thất (Updated Name)", // Will overwrite the name
    "Mô tả (Tiếng Việt)": "Mô tả mới được cập nhật qua file excel.",
    "Mã nhóm hàng (wood/sanitary/tiles/other)*": "wood",
    "Slug danh mục cha (để trống nếu là nhóm gốc)": "",
    "Ảnh chính (URL)": "https://res.cloudinary.com/demo/image/upload/v1/new-wood-banner.jpg",
    "Thứ tự hiển thị": "100",
    "Trạng thái (draft/published/archived)": "published",
    "ID danh mục (để trống nếu tạo mới)": "a4fa9181-2c31-4f76-bd60-fb5a195075bf" // Actual ID of "Đồ gỗ nội thất" in DB
  }
];


// ==========================================
// MODULE 2: PRODUCTS
// ==========================================
const productHeaders = [
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

const productSampleRow = {
  "Mã sản phẩm (Reference Code)": "SF-001",
  "Tên sản phẩm (Tiếng Việt)*": "Sofa Da Ý Premium",
  "Mô tả ngắn (Tiếng Việt)*": "Sofa bọc da bò Ý cao cấp, khung sồi tự nhiên.",
  "Vật liệu hiển thị (Tiếng Việt)": "Da bò Ý, Gỗ sồi",
  "Mô tả kích thước (Tiếng Việt)": "W2200 x D900 x H850 mm",
  "Giá tối thiểu (VND)": "45000000",
  "Giá tối đa (VND)": "50000000",
  "Chiều rộng (mm)": "2200",
  "Chiều sâu (mm)": "900",
  "Chiều cao (mm)": "850",
  "Slug danh mục*": "sofa-phong-khach",
  "Slug thương hiệu": "bentley-home",
  "Dòng sản phẩm/Series": "Classic Collection",
  "Ảnh chính (URL)*": "https://res.cloudinary.com/demo/image/upload/v1/cover.jpg",
  "Thư viện ảnh (các URL cách nhau bởi dấu phẩy)": "https://res.cloudinary.com/demo/image/upload/v1/img1.jpg,https://res.cloudinary.com/demo/image/upload/v1/img2.jpg",
  "Nổi bật (TRUE/FALSE)": "TRUE",
  "Trạng thái (draft/published/archived)": "published",
  "Vật liệu chi tiết (Tiếng Việt)": "Khung gỗ sồi nhập khẩu sấy khô.",
  "Hoàn thiện bề mặt (Tiếng Việt)": "Bọc da bò nguyên tấm 100% nhập Ý.",
  "Hướng dẫn bảo quản (Tiếng Việt)": "Tránh ánh nắng trực tiếp, lau bằng khăn mềm ẩm.",
  "ID sản phẩm (để trống nếu tạo mới)": ""
};

// 2.1 Products - Success
const productsSuccessData = [
  {
    "Mã sản phẩm (Reference Code)": "SF-H02",
    "Tên sản phẩm (Tiếng Việt)*": "Sofa Văng Bentley Heritage",
    "Mô tả ngắn (Tiếng Việt)*": "Sofa văng phong cách tân cổ điển sang trọng cho phòng khách biệt thự.",
    "Vật liệu hiển thị (Tiếng Việt)": "Khung sồi, Vải nỉ nhung cao cấp",
    "Mô tả kích thước (Tiếng Việt)": "W2400 x D950 x H820 mm",
    "Giá tối thiểu (VND)": "68000000",
    "Giá tối đa (VND)": "72000000",
    "Chiều rộng (mm)": "2400",
    "Chiều sâu (mm)": "950",
    "Chiều cao (mm)": "820",
    "Slug danh mục*": "sofa", // Matches specific 'sofa' category in DB
    "Slug thương hiệu": "hafele", // Matches 'hafele' brand in DB
    "Dòng sản phẩm/Series": "Heritage Collection",
    "Ảnh chính (URL)*": "https://res.cloudinary.com/demo/image/upload/v1/bentley-sofa.jpg",
    "Thư viện ảnh (các URL cách nhau bởi dấu phẩy)": "https://res.cloudinary.com/demo/image/upload/v1/bentley-sofa-detail1.jpg,https://res.cloudinary.com/demo/image/upload/v1/bentley-sofa-detail2.jpg",
    "Nổi bật (TRUE/FALSE)": "TRUE",
    "Trạng thái (draft/published/archived)": "published",
    "Vật liệu chi tiết (Tiếng Việt)": "Khung gỗ sồi Nga tự nhiên sấy tẩm, lò xo túi độ đàn hồi cao.",
    "Hoàn thiện bề mặt (Tiếng Việt)": "Bọc vải nỉ nhung cao cấp chống bám bụi bẩn.",
    "Hướng dẫn bảo quản (Tiếng Việt)": "Lau dọn định kỳ bằng máy hút bụi cầm tay, giặt khô khi vết bẩn lớn.",
    "ID sản phẩm (để trống nếu tạo mới)": ""
  },
  {
    "Mã sản phẩm (Reference Code)": "TOTO-MS887",
    "Tên sản phẩm (Tiếng Việt)*": "Bàn Cầu Một Khối TOTO MS887",
    "Mô tả ngắn (Tiếng Việt)*": "Bàn cầu một khối kèm nắp đóng êm, công nghệ xả Tornado siêu êm và sạch.",
    "Vật liệu hiển thị (Tiếng Việt)": "Sứ cao cấp men CeFiONtect",
    "Mô tả kích thước (Tiếng Việt)": "W727 x D428 x H657 mm",
    "Giá tối thiểu (VND)": "12500000",
    "Giá tối đa (VND)": "14000000",
    "Chiều rộng (mm)": "428",
    "Chiều sâu (mm)": "727",
    "Chiều cao (mm)": "657",
    "Slug danh mục*": "toilet", // Matches specific 'toilet' category in DB (Bồn cầu thông minh)
    "Slug thương hiệu": "toto", // Matches 'toto' brand in DB
    "Dòng sản phẩm/Series": "MS Series",
    "Ảnh chính (URL)*": "https://res.cloudinary.com/demo/image/upload/v1/toto-ms887.jpg",
    "Thư viện ảnh (các URL cách nhau bởi dấu phẩy)": "",
    "Nổi bật (TRUE/FALSE)": "FALSE",
    "Trạng thái (draft/published/archived)": "published",
    "Vật liệu chi tiết (Tiếng Việt)": "Sứ nung nhiệt độ 1200 độ C.",
    "Hoàn thiện bề mặt (Tiếng Việt)": "Tráng men tuyết CeFiONtect chống bám bẩn tuyệt đối.",
    "Hướng dẫn bảo quản (Tiếng Việt)": "Tránh dùng các chất tẩy rửa mạnh có chứa axit clohydric.",
    "ID sản phẩm (để trống nếu tạo mới)": ""
  }
];

// 2.2 Products - Errors
const productsErrorsData = [
  {
    "Mã sản phẩm (Reference Code)": "ERR-01",
    "Tên sản phẩm (Tiếng Việt)*": "", // Error: Missing required name
    "Mô tả ngắn (Tiếng Việt)*": "Lỗi thiếu tên sản phẩm.",
    "Vật liệu hiển thị (Tiếng Việt)": "Gỗ sồi",
    "Mô tả kích thước (Tiếng Việt)": "",
    "Giá tối thiểu (VND)": "10000000",
    "Giá tối đa (VND)": "9000000", // Error: Max price must be >= Min price
    "Chiều rộng (mm)": "-500", // Error: Dimensions must be positive
    "Chiều sâu (mm)": "abc", // Error: Dimensions must be valid numbers
    "Chiều cao (mm)": "",
    "Slug danh mục*": "thiet-bi-ve-sinh",
    "Slug thương hiệu": "",
    "Dòng sản phẩm/Series": "",
    "Ảnh chính (URL)*": "https://res.cloudinary.com/demo/image/upload/v1/err1.jpg",
    "Thư viện ảnh (các URL cách nhau bởi dấu phẩy)": "",
    "Nổi bật (TRUE/FALSE)": "OKAY", // Error: Must be TRUE or FALSE
    "Trạng thái (draft/published/archived)": "published",
    "ID sản phẩm (để trống nếu tạo mới)": ""
  },
  {
    "Mã sản phẩm (Reference Code)": "ERR-02",
    "Tên sản phẩm (Tiếng Việt)*": "Bàn Ăn Mặt Đá Cẩm Thạch",
    "Mô tả ngắn (Tiếng Việt)*": "", // Error: Missing required summary
    "Vật liệu hiển thị (Tiếng Việt)": "Đá cẩm thạch",
    "Mô tả kích thước (Tiếng Việt)": "",
    "Giá tối thiểu (VND)": "-2000000", // Error: Price must be positive
    "Giá tối đa (VND)": "",
    "Chiều rộng (mm)": "",
    "Chiều sâu (mm)": "",
    "Chiều cao (mm)": "",
    "Slug danh mục*": "slug-khong-ton-tai", // Error: Category slug doesn't exist
    "Slug thương hiệu": "brand-khong-ton-tai", // Error: Brand slug doesn't exist
    "Ảnh chính (URL)*": "res.cloudinary.com/demo/image.jpg", // Error: Image URL must start with http/https
    "Thư viện ảnh (các URL cách nhau bởi dấu phẩy)": "",
    "Nổi bật (TRUE/FALSE)": "",
    "Trạng thái (draft/published/archived)": "invalid_status", // Error: Invalid status
    "ID sản phẩm (để trống nếu tạo mới)": "123-uuid" // Error: Invalid UUID format
  }
];

// 2.3 Products - Updates
const productsUpdatesData = [
  {
    "Mã sản phẩm (Reference Code)": "SF-H02-Updated",
    "Tên sản phẩm (Tiếng Việt)*": "Sofa Văng Bentley Heritage (Updated)",
    "Mô tả ngắn (Tiếng Việt)*": "Mô tả ngắn của sản phẩm đã được thay đổi qua Excel.",
    "Vật liệu hiển thị (Tiếng Việt)": "Khung sồi, Vải nỉ nhung cao cấp",
    "Mô tả kích thước (Tiếng Việt)": "W2400 x D950 x H820 mm",
    "Giá tối thiểu (VND)": "70000000", // Updated price
    "Giá tối đa (VND)": "75000000",
    "Chiều rộng (mm)": "2400",
    "Chiều sâu (mm)": "950",
    "Chiều cao (mm)": "820",
    "Slug danh mục*": "sofa", // Matches specific 'sofa' category in DB
    "Slug thương hiệu": "hafele", // Matches 'hafele' brand in DB
    "Dòng sản phẩm/Series": "Heritage Collection V2",
    "Ảnh chính (URL)*": "https://res.cloudinary.com/demo/image/upload/v1/bentley-sofa-updated.jpg",
    "Thư viện ảnh (các URL cách nhau bởi dấu phẩy)": "",
    "Nổi bật (TRUE/FALSE)": "FALSE",
    "Trạng thái (draft/published/archived)": "published",
    "Vật liệu chi tiết (Tiếng Việt)": "Khung gỗ sồi Nga tự nhiên sấy tẩm.",
    "Hoàn thiện bề mặt (Tiếng Việt)": "Bọc vải nỉ nhung cao cấp.",
    "Hướng dẫn bảo quản (Tiếng Việt)": "Lau dọn định kỳ bằng máy hút bụi cầm tay.",
    "ID sản phẩm (để trống nếu tạo mới)": "00000001-0000-0000-0000-000000000011" // Actual ID of "Sofa Curve Velour Heritage" in DB
  }
];


// ==========================================
// MODULE 3: SHOWROOMS
// ==========================================
const showroomHeaders = [
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

const showroomSampleRow = {
  "Tên Showroom (Tiếng Việt)*": "Showroom Quận 7",
  "Địa chỉ (Tiếng Việt)*": "124 Nguyễn Thị Thập, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh",
  "Tỉnh/Thành phố*": "Hồ Chí Minh",
  "Giờ mở cửa (Tiếng Việt)": "8:00 - 21:00",
  "Hotline*": "0901234567",
  "Email": "showroomq7@furniture.vn",
  "URL bản đồ nhúng Google Maps*": "https://www.google.com/maps/embed?pb=...",
  "URL bản đồ dự phòng Google Maps*": "https://maps.google.com/?q=Showroom+Quan+7",
  "Latitude": "10.7769",
  "Longitude": "106.7009",
  "Ảnh chính (URL)": "https://res.cloudinary.com/demo/image/upload/v1/showroom.jpg",
  "Thứ tự hiển thị": "1",
  "Trạng thái (draft/published/archived)": "published",
  "ID showroom (để trống nếu tạo mới)": ""
};

// 3.1 Showrooms - Success
const showroomsSuccessData = [
  {
    "Tên Showroom (Tiếng Việt)*": "Showroom Hoàn Kiếm",
    "Địa chỉ (Tiếng Việt)*": "45 Lý Thường Kiệt, Phường Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội",
    "Tỉnh/Thành phố*": "Hà Nội", // Valid province
    "Giờ mở cửa (Tiếng Việt)": "8:30 - 21:30",
    "Hotline*": "0912345678",
    "Email": "hoankiem@furniture.vn",
    "URL bản đồ nhúng Google Maps*": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.1234!2d105.8456!3d21.0234",
    "URL bản đồ dự phòng Google Maps*": "https://maps.google.com/?q=45+Ly+Thuong+Kiet",
    "Latitude": "21.0234",
    "Longitude": "105.8456",
    "Ảnh chính (URL)": "https://res.cloudinary.com/demo/image/upload/v1/hoankiem-showroom.jpg",
    "Thứ tự hiển thị": "3",
    "Trạng thái (draft/published/archived)": "published",
    "ID showroom (để trống nếu tạo mới)": ""
  },
  {
    "Tên Showroom (Tiếng Việt)*": "Showroom Hải Châu Đà Nẵng",
    "Địa chỉ (Tiếng Việt)*": "102 Nguyễn Văn Linh, Phường Nam Dương, Quận Hải Châu, Đà Nẵng",
    "Tỉnh/Thành phố*": "Đà Nẵng", // Valid province
    "Giờ mở cửa (Tiếng Việt)": "8:00 - 21:00",
    "Hotline*": "0987654321",
    "Email": "danang@furniture.vn",
    "URL bản đồ nhúng Google Maps*": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.9123!2d108.2189!3d16.0612",
    "URL bản đồ dự phòng Google Maps*": "https://maps.google.com/?q=102+Nguyen+Van+Linh",
    "Latitude": "16.0612",
    "Longitude": "108.2189",
    "Ảnh chính (URL)": "https://res.cloudinary.com/demo/image/upload/v1/danang-showroom.jpg",
    "Thứ tự hiển thị": "4",
    "Trạng thái (draft/published/archived)": "draft",
    "ID showroom (để trống nếu tạo mới)": ""
  }
];

// 3.2 Showrooms - Errors
const showroomsErrorsData = [
  {
    "Tên Showroom (Tiếng Việt)*": "", // Error: Missing required name
    "Địa chỉ (Tiếng Việt)*": "Lỗi thiếu tên showroom.",
    "Tỉnh/Thành phố*": "Hồ Chí Minh",
    "Giờ mở cửa (Tiếng Việt)": "",
    "Hotline*": "0911222333",
    "Email": "",
    "URL bản đồ nhúng Google Maps*": "https://maps.google.com/...",
    "URL bản đồ dự phòng Google Maps*": "",
    "Latitude": "",
    "Longitude": "",
    "Ảnh chính (URL)": "",
    "Thứ tự hiển thị": "1",
    "Trạng thái (draft/published/archived)": "published",
    "ID showroom (để trống nếu tạo mới)" : ""
  },
  {
    "Tên Showroom (Tiếng Việt)*": "Showroom Lỗi Tỉnh và Tọa độ",
    "Địa chỉ (Tiếng Việt)*": "123 Đường Lớn, Biên Hòa, Đồng Nai",
    "Tỉnh/Thành phố*": "Sài Gòn", // Error: Sài Gòn is not in the list of 63 valid provinces (must be "Hồ Chí Minh")
    "Giờ mở cửa (Tiếng Việt)": "",
    "Hotline*": "", // Error: Missing Hotline
    "Email": "wrong-email-format",
    "URL bản đồ nhúng Google Maps*": "map-embed-link", // Error: Must start with http/https
    "URL bản đồ dự phòng Google Maps*": "",
    "Latitude": "abc", // Error: Must be a number
    "Longitude": "xyz", // Error: Must be a number
    "Ảnh chính (URL)": "showroom.jpg", // Error: Image URL must start with http/https
    "Thứ tự hiển thị": "",
    "Trạng thái (draft/published/archived)": "archived",
    "ID showroom (để trống nếu tạo mới)": "invalid-uuid-format" // Error: Invalid UUID
  }
];

// 3.3 Showrooms - Updates
const showroomsUpdatesData = [
  {
    "Tên Showroom (Tiếng Việt)*": "Hà Nội - Flagship Store (Updated Name)", // Updates name of existing Hanoi showroom
    "Địa chỉ (Tiếng Việt)*": "Cát Linh, 15 Nguyễn Văn Huyên, Cầu Giấy, Hà Nội (Updated Address)",
    "Tỉnh/Thành phố*": "Hà Nội",
    "Giờ mở cửa (Tiếng Việt)": "7:30 - 22:00", // Updated hours
    "Hotline*": "0901234567",
    "Email": "hanoi-flagship@furniture.vn",
    "URL bản đồ nhúng Google Maps*": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.8638!2d105.8012!3d21.0362",
    "URL bản đồ dự phòng Google Maps*": "https://maps.google.com/?q=Showroom+Hanoi+Flagship",
    "Latitude": "21.0362",
    "Longitude": "105.8012",
    "Ảnh chính (URL)": "https://res.cloudinary.com/demo/image/upload/v1/hanoi-new-cover.jpg",
    "Thứ tự hiển thị": "1",
    "Trạng thái (draft/published/archived)": "published",
    "ID showroom (để trống nếu tạo mới)": "72d2e8a2-851d-4c58-add6-483b131a754f" // Actual ID of Hanoi showroom in DB
  }
];

// Generate Excel file helper
async function generateExcelFile(filename, headers, sampleRow, dataRows) {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("📥 Dữ liệu Import");
  styleWorksheet(ws, headers, sampleRow, dataRows);
  const filePath = path.join(OUTPUT_DIR, filename);
  await workbook.xlsx.writeFile(filePath);
  console.log(`Generated: ${filename} -> ${filePath}`);
}

// Main execution
async function main() {
  try {
    // 1. Categories
    await generateExcelFile('categories-import-success.xlsx', categoryHeaders, categorySampleRow, categoriesSuccessData);
    await generateExcelFile('categories-import-errors.xlsx', categoryHeaders, categorySampleRow, categoriesErrorsData);
    await generateExcelFile('categories-import-update.xlsx', categoryHeaders, categorySampleRow, categoriesUpdatesData);

    // 2. Products
    await generateExcelFile('products-import-success.xlsx', productHeaders, productSampleRow, productsSuccessData);
    await generateExcelFile('products-import-errors.xlsx', productHeaders, productSampleRow, productsErrorsData);
    await generateExcelFile('products-import-update.xlsx', productHeaders, productSampleRow, productsUpdatesData);

    // 3. Showrooms
    await generateExcelFile('showrooms-import-success.xlsx', showroomHeaders, showroomSampleRow, showroomsSuccessData);
    await generateExcelFile('showrooms-import-errors.xlsx', showroomHeaders, showroomSampleRow, showroomsErrorsData);
    await generateExcelFile('showrooms-import-update.xlsx', showroomHeaders, showroomSampleRow, showroomsUpdatesData);

    console.log('All test Excel files generated successfully!');
  } catch (error) {
    console.error('Error generating Excel files:', error);
    process.exit(1);
  }
}

main();
