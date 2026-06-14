# Kế hoạch triển khai: Hoàn thiện Master Fix Plan (Phase 3 & 4) & Đồng bộ UI mới

Tài liệu này xác định phạm vi các công việc cần thực hiện để chuyển đổi Showroom Nội Thất Phương Đông sang chế độ dữ liệu thật, sửa đổi các API/mutations còn thiếu, bảo mật API keys và sửa các lỗi UI/DataTable theo yêu cầu của Owner.

---

## 1. Scope Metadata

- **Timestamp**: 2026-06-13T16:00:00+07:00
- **Selected Phase**: Phase 07: Media & Third-Party Services & Phase 09: Missing Admin Sections (Master Fix Plan Phase 3, 4, 5)
- **Selected Tasks**:
  - **Task 4 (Settings flow)**: Sửa đổi Settings panel trong `admin-workflows.tsx` để kết nối trực tiếp với API `/api/admin/settings` thay vì đọc/ghi localStorage.
  - **Task 5 (Real Gemini AI)**: Tạo API route `/api/admin/ai/generate-draft/route.ts` giải mã `GEMINI_API_KEY` từ DB và gọi Gemini SDK thực tế.
  - **Task 6 (Users management)**: Sửa đổi `/admin/users` để lấy danh sách tài khoản CMS thực tế từ bảng `profiles`.
  - **Task 7 (Promotions CRUD & Form)**: Tạo form quản lý Promotions Combo chuyên dụng trong `EntityCreateForm`, loại bỏ lỗi trôi mặc định thành form Category. Đồng thời liên kết trang khuyến mãi public đọc từ DB.
  - **Task 8 (Brands Dropdown)**: Đồng bộ danh sách thương hiệu động từ DB lên dropdown trong form chỉnh sửa sản phẩm thay vì nhập text tự do.
  - **Task 9 (Server-side Catalog Filter)**: Tối ưu bộ lọc Catalog phía công cộng sang Server-side sử dụng RPC `public_products` của Supabase.
  - **Task 12 (Cloudinary Signed Uploads)**: Tạo API route `/api/admin/cloudinary-sign/route.ts` và kết nối với Dropzone trong form admin để tải ảnh thật lên Cloud CDN.
  - **UI Routing Fix**: Đổi toàn bộ liên kết "Thêm mới" và "Chỉnh sửa" trên DataTable và Dashboard sang đường dẫn trang tĩnh mới: `/admin/products/new`, `/admin/products/[id]/edit`, `/admin/categories/new`, `/admin/categories/[id]/edit`.
  - **Tắt Mock Data**: Chuyển đổi `NEXT_PUBLIC_USE_MOCK_DATA=false` để chạy thử nghiệm dữ liệu thật.

- **Requirement IDs**:
  - F04 (Settings flow), F05 (Gemini AI), F06 (Users CMS), F07 (Promotions CRUD), F08 (Brands Dropdown), F09 (Server filter), F12 (Cloudinary sign), F15 (UI Static Routing).

- **Files Likely Affected**:
  - `[MODIFY] components/showroom/admin-workflows.tsx` (Settings panel, Promotions form, Dropzone integration, Brand dropdown, EntityCreateForm logic)
  - `[MODIFY] components/showroom/admin-pages.tsx` (Users list dynamic, DataTable links)
  - `[NEW] app/api/admin/ai/generate-draft/route.ts` (Gemini API SDK server action)
  - `[NEW] app/api/admin/cloudinary-sign/route.ts` (Cloudinary Upload signature helper)
  - `[MODIFY] app/[locale]/products/page.tsx` (Server filtering product catalog)
  - `[MODIFY] app/[locale]/promotions/page.tsx` (Dynamic promotions list from DB)
  - `[MODIFY] components/showroom/public-shell.tsx` (Dynamic Mega Menu from DB)

---

## 2. Approval Status

- **Status**: pending
- **Approval Notes**: Proposal prepared. Awaiting owner confirmation (`confirm`) to begin implementation.
