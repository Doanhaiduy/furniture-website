import * as XLSX from 'xlsx';
import { join } from 'path';

const BASE_URL = 'https://furniture-website-d4vmgiskj-doanhaiduys-projects.vercel.app';
const LOCALE = 'vi';

interface RouteInfo {
  name: string;
  url: string;
  description: string;
  category: string;
}

// Danh sách tất cả các routes trong hệ thống
const routes: RouteInfo[] = [
  // === PUBLIC ROUTES - STATIC PAGES ===
  {
    name: 'Trang chủ',
    url: `${BASE_URL}/${LOCALE}`,
    description: 'Trang chủ website giới thiệu tổng quan về showroom, sản phẩm nổi bật, bài viết mới nhất, và form liên hệ báo giá',
    category: 'Public - Trang tĩnh'
  },
  {
    name: 'Giới thiệu',
    url: `${BASE_URL}/${LOCALE}/about`,
    description: 'Trang giới thiệu về showroom Phương Đông, lịch sử hình thành, giá trị cốt lõi, tầm nhìn và sứ mệnh',
    category: 'Public - Trang tĩnh'
  },
  {
    name: 'Danh sách sản phẩm',
    url: `${BASE_URL}/${LOCALE}/products`,
    description: 'Trang catalog hiển thị danh sách tất cả sản phẩm với bộ lọc theo category, material, room, style, collection, tone và availability. Hỗ trợ tìm kiếm, phân trang và sắp xếp',
    category: 'Public - Trang tĩnh'
  },
  {
    name: 'Danh sách bài viết',
    url: `${BASE_URL}/${LOCALE}/blog`,
    description: 'Trang blog liệt kê các bài viết về thiết kế nội thất, xu hướng trang trí, hướng dẫn chăm sóc và tips không gian sống',
    category: 'Public - Trang tĩnh'
  },
  {
    name: 'Hệ thống showroom',
    url: `${BASE_URL}/${LOCALE}/showrooms`,
    description: 'Trang liệt kê các showroom trên toàn quốc với địa chỉ, hotline, giờ mở cửa và Google Maps embed',
    category: 'Public - Trang tĩnh'
  },
  {
    name: 'Liên hệ',
    url: `${BASE_URL}/${LOCALE}/contact`,
    description: 'Trang liên hệ với form gửi yêu cầu báo giá, thông tin showroom và các kênh liên lạc (hotline, email)',
    category: 'Public - Trang tĩnh'
  },
  {
    name: 'Liên hệ thành công',
    url: `${BASE_URL}/${LOCALE}/contact/success`,
    description: 'Trang xác nhận sau khi gửi form liên hệ thành công, hiển thị thông báo cảm ơn và hướng dẫn tiếp theo',
    category: 'Public - Trạng thái'
  },
  {
    name: 'Liên hệ lỗi',
    url: `${BASE_URL}/${LOCALE}/contact/error`,
    description: 'Trang thông báo lỗi khi gửi form liên hệ thất bại do rate limit hoặc lỗi server, kèm nút thử lại',
    category: 'Public - Trạng thái'
  },
  
  // === PUBLIC ROUTES - DYNAMIC PRODUCT PAGES ===
  {
    name: 'Chi tiết sản phẩm - Chậu rửa Basin Minimalist',
    url: `${BASE_URL}/${LOCALE}/products/basin-minimalist-pd-55`,
    description: 'Trang chi tiết sản phẩm chậu rửa lavabo thiết kế tối giản với gallery ảnh, thông số kỹ thuật chi tiết, mô tả chất liệu, kích thước, bảo hành và form báo giá trực tiếp',
    category: 'Public - Sản phẩm động'
  },
  {
    name: 'Chi tiết sản phẩm - Bàn ăn gỗ óc chó',
    url: `${BASE_URL}/${LOCALE}/products/dining-table-walnut-dt-100`,
    description: 'Trang chi tiết bàn ăn gỗ óc chó nguyên khối với gallery đa góc độ, specs kỹ thuật (kích thước, chất liệu, màu sắc), hướng dẫn bảo quản và sản phẩm liên quan',
    category: 'Public - Sản phẩm động'
  },
  {
    name: 'Chi tiết sản phẩm - Tủ bếp hiện đại',
    url: `${BASE_URL}/${LOCALE}/products/kitchen-cabinet-modern-kc-200`,
    description: 'Trang chi tiết tủ bếp hiện đại với thông tin về chất liệu, phụ kiện, hệ ray trượt, bảo hành và dịch vụ đo đạc lắp đặt tại nhà',
    category: 'Public - Sản phẩm động'
  },
  {
    name: 'Chi tiết sản phẩm - Bồn cầu TOTO',
    url: `${BASE_URL}/${LOCALE}/products/toilet-toto-tc-300`,
    description: 'Trang chi tiết thiết bị vệ sinh bồn cầu TOTO với công nghệ tiết kiệm nước, chế độ xả kép, thông số kỹ thuật lắp đặt và chính sách bảo hành',
    category: 'Public - Sản phẩm động'
  },
  {
    name: 'Chi tiết sản phẩm - Giường ngủ Master',
    url: `${BASE_URL}/${LOCALE}/products/bed-master-bm-400`,
    description: 'Trang chi tiết giường ngủ Master với khung gỗ óc chó, đầu giường bọc da cao cấp, kích thước King/Queen, màu sắc tùy chỉnh và hướng dẫn lắp ráp',
    category: 'Public - Sản phẩm động'
  },
  
  // === PUBLIC ROUTES - DYNAMIC BLOG PAGES ===
  {
    name: 'Bài viết - Thiết kế phòng khách Master',
    url: `${BASE_URL}/${LOCALE}/blog/thiet-ke-phong-khach-master`,
    description: 'Bài viết chi tiết về cách thiết kế phòng khách Master với đồ gỗ óc chó, bố trí không gian, phối hợp màu sắc và ánh sáng để tạo không gian sang trọng',
    category: 'Public - Blog động'
  },
  {
    name: 'Bài viết - 10 xu hướng nội thất 2026',
    url: `${BASE_URL}/${LOCALE}/blog/xu-huong-noi-that-2026`,
    description: 'Bài viết tổng hợp 10 xu hướng nội thất hot nhất năm 2026: màu sắc Pantone, chất liệu tự nhiên, thiết kế tối giản và công nghệ smart home',
    category: 'Public - Blog động'
  },
  {
    name: 'Bài viết - Hướng dẫn chọn chậu rửa phù hợp',
    url: `${BASE_URL}/${LOCALE}/blog/huong-dan-chon-chau-rua`,
    description: 'Bài viết hướng dẫn cách lựa chọn chậu rửa lavabo phù hợp với phòng tắm: kích thước, chất liệu (sứ/đá/kính), kiểu dáng (âm bàn/đặt bàn/treo tường)',
    category: 'Public - Blog động'
  },
  {
    name: 'Bài viết - Bảo quản đồ gỗ óc chó',
    url: `${BASE_URL}/${LOCALE}/blog/bao-quan-do-go-oc-cho`,
    description: 'Bài viết chia sẻ tips bảo quản và vệ sinh đồ gỗ óc chó: tránh ẩm mốc, lau chùi đúng cách, dưỡng dầu định kỳ và sửa chữa vết xước nhỏ',
    category: 'Public - Blog động'
  },
  {
    name: 'Bài viết - Thiết kế phòng bếp hiện đại',
    url: `${BASE_URL}/${LOCALE}/blog/thiet-ke-phong-bep-hien-dai`,
    description: 'Bài viết về thiết kế phòng bếp hiện đại: bố trí tam giác vàng, lựa chọn tủ bếp, thiết bị nhà bếp và giải pháp lưu trữ thông minh',
    category: 'Public - Blog động'
  },
  
  // === ADMIN ROUTES ===
  {
    name: 'Admin - Đăng nhập',
    url: `${BASE_URL}/admin/login`,
    description: 'Trang đăng nhập vào Admin CMS bằng email/password, xác thực qua Supabase Auth với RLS policies. Chỉ admin và editor được truy cập',
    category: 'Admin - Authentication'
  },
  {
    name: 'Admin - Dashboard',
    url: `${BASE_URL}/admin`,
    description: 'Trang tổng quan Admin hiển thị thống kê tổng số products, blog posts, quotes (chỉ admin), danh sách yêu cầu báo giá mới nhất và quick actions',
    category: 'Admin - Tổng quan'
  },
  {
    name: 'Admin - Quản lý sản phẩm',
    url: `${BASE_URL}/admin/products`,
    description: 'Trang quản lý danh sách sản phẩm với CRUD operations: tạo mới, chỉnh sửa, unpublish/publish, xóa. Bao gồm upload media qua Cloudinary và quản lý specs/attributes',
    category: 'Admin - Content Management'
  },
  {
    name: 'Admin - Tạo sản phẩm mới',
    url: `${BASE_URL}/admin/products?create=1`,
    description: 'Trang form tạo sản phẩm mới với các trường: reference code, tên (vi/en), category, giá, kích thước, chất liệu, mô tả, specs và media gallery',
    category: 'Admin - Content Management'
  },
  {
    name: 'Admin - Quản lý danh mục',
    url: `${BASE_URL}/admin/categories`,
    description: 'Trang quản lý product categories với taxonomy tree (parent/child), group key (wood/sanitary), sort order và localized names/descriptions',
    category: 'Admin - Content Management'
  },
  {
    name: 'Admin - Quản lý blog',
    url: `${BASE_URL}/admin/blog`,
    description: 'Trang quản lý bài viết blog với CRUD operations: tạo mới, chỉnh sửa, publish/unpublish, xóa. Bao gồm rich text editor và cover image upload',
    category: 'Admin - Content Management'
  },
  {
    name: 'Admin - Tạo bài viết mới',
    url: `${BASE_URL}/admin/blog?create=1`,
    description: 'Trang form tạo bài viết mới với các trường: tiêu đề (vi/en), excerpt, body (JSON sections), category, author, featured flag và cover media',
    category: 'Admin - Content Management'
  },
  {
    name: 'Admin - Quản lý showroom',
    url: `${BASE_URL}/admin/showrooms`,
    description: 'Trang quản lý hệ thống showroom với thông tin: code, tên, địa chỉ (vi/en), hotline, giờ mở cửa, Google Maps URLs và primary media',
    category: 'Admin - Content Management'
  },
  {
    name: 'Admin - Quản lý media',
    url: `${BASE_URL}/admin/media`,
    description: 'Trang quản lý media library với upload/delete files qua Cloudinary, hiển thị thumbnail grid, copy URL và metadata (alt text, file size, dimensions)',
    category: 'Admin - Content Management'
  },
  {
    name: 'Admin - Upload media',
    url: `${BASE_URL}/admin/media?upload=1`,
    description: 'Trang upload media files với drag & drop hoặc file picker, signed upload qua Cloudinary API, progress bar và preview thumbnails',
    category: 'Admin - Content Management'
  },
  {
    name: 'Admin - Quản lý quotes (Admin only)',
    url: `${BASE_URL}/admin/quotes`,
    description: 'Trang quản lý yêu cầu báo giá từ khách hàng với thông tin: tên, email, phone, company, service, message, source path và timestamp. CHỈ ADMIN mới xem được (Editor bị chặn)',
    category: 'Admin - Lead Management (Admin Only)'
  },
  {
    name: 'Admin - Quản lý users (Admin only)',
    url: `${BASE_URL}/admin/users`,
    description: 'Trang quản lý tài khoản CMS users với role assignment (admin/editor), enable/disable accounts và audit trail. CHỈ ADMIN mới truy cập được (Editor bị chặn)',
    category: 'Admin - User Management (Admin Only)'
  },
  {
    name: 'Admin - Settings (Admin only)',
    url: `${BASE_URL}/admin/settings`,
    description: 'Trang cài đặt hệ thống với site config, email templates, API keys management (Cloudinary, Resend, Gemini encrypted keys). CHỈ ADMIN mới truy cập được',
    category: 'Admin - System Config (Admin Only)'
  },
  {
    name: 'Admin - AI Assistant',
    url: `${BASE_URL}/admin/ai-assistant`,
    description: 'Trang trợ lý AI sử dụng Google Gemini để generate nội dung draft (product descriptions, blog posts, SEO metadata, translations). Chỉ generate draft, không tự động publish',
    category: 'Admin - AI Tools'
  },
  {
    name: 'Admin - Access Denied',
    url: `${BASE_URL}/admin/access-denied`,
    description: 'Trang thông báo từ chối truy cập khi user không có quyền (ví dụ: Editor cố truy cập /admin/quotes hoặc /admin/users)',
    category: 'Admin - Error Pages'
  },
  
  // === API ROUTES (Not for direct browser access but useful for reference) ===
  {
    name: 'API - Contact Form',
    url: `${BASE_URL}/api/contact`,
    description: 'POST endpoint để gửi form liên hệ/báo giá. Bao gồm honeypot validation, rate limiting (in-memory sliding window), Supabase insert và Resend email notification',
    category: 'API - Public'
  },
  {
    name: 'API - Health Check',
    url: `${BASE_URL}/api/health`,
    description: 'GET endpoint kiểm tra trạng thái server, Supabase connection và Docker container health. Trả về JSON status và timestamp',
    category: 'API - System'
  }
];

// Tạo workbook và worksheet
const wb = XLSX.utils.book_new();

// Prepare data cho worksheet
const wsData = [
  ['STT', 'TÊN TRANG', 'ĐƯỜNG DẪN (URL)', 'MÔ TẢ CHI TIẾT', 'DANH MỤC'],
  ...routes.map((route, index) => [
    index + 1,
    route.name,
    route.url,
    route.description,
    route.category
  ])
];

const ws = XLSX.utils.aoa_to_sheet(wsData);

// Cấu hình độ rộng cột
ws['!cols'] = [
  { wch: 5 },   // STT
  { wch: 35 },  // TÊN TRANG
  { wch: 70 },  // URL
  { wch: 120 }, // MÔ TẢ
  { wch: 35 }   // DANH MỤC
];

// Apply styles cho header row
const range = XLSX.utils.decode_range(ws['!ref']!);
for (let C = range.s.c; C <= range.e.c; ++C) {
  const address = XLSX.utils.encode_col(C) + '1';
  if (!ws[address]) continue;
  
  // Bold header
  ws[address].s = {
    font: { bold: true, sz: 12 },
    fill: { fgColor: { rgb: 'D9EAD3' } },
    alignment: { vertical: 'center', horizontal: 'center', wrapText: true }
  };
}

// Enable text wrap cho cột mô tả
for (let R = range.s.r + 1; R <= range.e.r; ++R) {
  const descAddress = XLSX.utils.encode_col(3) + (R + 1); // Cột D (Mô tả)
  if (!ws[descAddress]) continue;
  ws[descAddress].s = {
    alignment: { wrapText: true, vertical: 'top' }
  };
}

// Thêm worksheet vào workbook
XLSX.utils.book_append_sheet(wb, ws, 'Danh sách trang web');

// Tạo summary sheet
const summaryData = [
  ['THÔNG TIN DỰ ÁN'],
  ['Tên dự án:', 'Showroom Nội Thất Phương Đông'],
  ['Domain:', BASE_URL],
  ['Ngôn ngữ:', 'Tiếng Việt (vi)'],
  ['Tổng số trang:', routes.length.toString()],
  [''],
  ['PHÂN LOẠI TRANG'],
  ['Public - Trang tĩnh:', routes.filter(r => r.category.includes('Trang tĩnh')).length.toString()],
  ['Public - Trạng thái:', routes.filter(r => r.category.includes('Trạng thái')).length.toString()],
  ['Public - Sản phẩm động:', routes.filter(r => r.category.includes('Sản phẩm động')).length.toString()],
  ['Public - Blog động:', routes.filter(r => r.category.includes('Blog động')).length.toString()],
  ['Admin - Dashboard & Auth:', routes.filter(r => r.category.includes('Admin') && (r.category.includes('Authentication') || r.category.includes('Tổng quan'))).length.toString()],
  ['Admin - Content Management:', routes.filter(r => r.category.includes('Content Management')).length.toString()],
  ['Admin - Restricted (Admin Only):', routes.filter(r => r.category.includes('Admin Only')).length.toString()],
  ['API Endpoints:', routes.filter(r => r.category.includes('API')).length.toString()],
  [''],
  ['LƯU Ý'],
  ['1. Tất cả URL đều sử dụng locale "vi" (Tiếng Việt)'],
  ['2. Các trang Admin yêu cầu đăng nhập (Supabase Auth + RLS)'],
  ['3. Một số trang Admin chỉ dành cho role Admin (quotes, users, settings)'],
  ['4. API endpoints không dành cho truy cập trực tiếp qua browser'],
  ['5. Dynamic routes (products/[slug], blog/[slug]) có nhiều variations tùy data thực tế']
];

const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
wsSummary['!cols'] = [
  { wch: 40 },
  { wch: 60 }
];

XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng quan');

// Export file
const outputPath = join(process.cwd(), 'furniture-website-sitemap.xlsx');
XLSX.writeFile(wb, outputPath);

console.log(`✅ File Excel đã được tạo thành công: ${outputPath}`);
console.log(`📊 Tổng số trang: ${routes.length}`);
console.log(`🔗 Base URL: ${BASE_URL}`);
console.log(`🌐 Locale: ${LOCALE}`);
