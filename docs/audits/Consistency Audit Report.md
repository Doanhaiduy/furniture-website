# Báo Cáo Kiểm Tra Tính Nhất Quán (Consistency Audit Report)
## Showroom Nội Thất Phương Đông (Furniture & Sanitary Ware Showroom)

Báo cáo này được thực hiện bởi Senior Full-stack Engineer nhằm kiểm tra tính nhất quán giữa giao diện người dùng (Frontend), API/Server-side Queries/Mutations (Backend) và Cơ sở dữ liệu Supabase (Database Schema).

---

## PHẦN 1 — TỔNG QUAN CÁC MÀN HÌNH

Dưới đây là danh sách tất cả các màn hình và trang trong ứng dụng Next.js (được quét từ thư mục `app/`):

| Màn hình | Route/Path | Mô tả | Trạng thái tổng thể |
|----------|-----------|-------|---------------------|
| **Public Homepage** | `/[locale]/page.tsx` | Trang chủ giới thiệu, thương hiệu đối tác, sản phẩm nổi bật, tin tức nổi bật, showroom mẫu, và form yêu cầu báo giá. | **DONE** (Đã đồng bộ DB, có cơ chế mock fallback an toàn) |
| **Public About** | `/[locale]/about/page.tsx` | Giới thiệu lịch sử thương hiệu, tầm nhìn, sứ mệnh, giá trị cốt lõi và năng lực thi công. | **DONE** (Đã đồng bộ với bảng `content_pages`, có mock fallback) |
| **Public Products Catalog** | `/[locale]/products/page.tsx` | Danh sách sản phẩm, tích hợp bộ lọc đa chiều (category, chất liệu, phòng, style, bộ sưu tập, tông màu, tính sẵn sàng) và phân trang. | **PARTIAL** (Đồng bộ danh mục/sản phẩm từ DB, nhưng bộ lọc nâng cao được xử lý ở phía Javascript client sau khi tải 1000 sản phẩm) |
| **Public Product Detail** | `/[locale]/products/[slug]/page.tsx` | Chi tiết sản phẩm: Thư viện ảnh, thông số kỹ thuật cơ bản, tabs thông tin chi tiết, form liên hệ cá nhân hóa và sản phẩm liên quan. | **PARTIAL** (Đồng bộ với DB nhưng hình ảnh bị trống đối với các sản phẩm tạo mới từ Admin do mutation lỗi) |
| **Public Blog List** | `/[locale]/blog/page.tsx` | Danh sách bài viết tin tức, góc tư vấn, kiến thức nội thất. | **DONE** (Đồng bộ với DB và có mock fallback) |
| **Public Blog Detail** | `/[locale]/blog/[slug]/page.tsx` | Chi tiết bài viết: Mục lục bài viết (TOC) tự động, takeaways chính, ghi chú thực địa, các section nội dung và bài viết liên quan. | **DONE** (Đồng bộ DB bóc tách nội dung chi tiết) |
| **Public Showrooms** | `/[locale]/showrooms/page.tsx` | Danh sách showroom, thông tin giờ mở cửa, hotline, địa chỉ, bản đồ Google Maps và iframe nhúng. | **DONE** (Đồng bộ DB qua RPC) |
| **Public Contact** | `/[locale]/contact/page.tsx` | Trang liên hệ chính, chứa form gửi yêu cầu báo giá và thông tin showroom liên hệ. | **DONE** (Đồng bộ persistence và gửi Resend) |
| **Public Promotions** | `/[locale]/promotions/page.tsx` | Trang khuyến mãi, hiển thị các gói combo sản phẩm, chiết khấu và đăng ký nhận ưu đãi. | **TODO/MISSING** (FE đang **hard-code** tĩnh hoàn toàn các gói combo, không gọi API `getPromotions` và DB `promotions`) |
| **Admin Login** | `/admin/login/page.tsx` | Trang đăng nhập hệ thống Admin CMS dành cho quản trị viên. | **DONE** (Sử dụng Supabase Auth) |
| **Admin Access Denied** | `/admin/access-denied/page.tsx` | Trang hiển thị từ chối truy cập khi Editor cố tình vào khu vực quản trị đặc quyền. | **DONE** (Bảo vệ ở Route Guard proxy.ts và layouts) |
| **Admin Dashboard** | `/admin/page.tsx` | Bảng điều khiển quản trị: Hiển thị KPIs thống kê số lượng bản ghi, biểu đồ Insight nhu cầu báo giá, danh sách yêu cầu mới (chỉ Admin). | **DONE** (Tích hợp thực tế từ DB) |
| **Admin Products List** | `/admin/products` | Danh sách sản phẩm của showroom dưới dạng bảng DataTable (gồm mã, giá, trạng thái, phân loại). | **DONE** (Thông qua route động `/admin/[section]`) |
| **Admin Products New** | `/admin/products/new` | Form thêm mới sản phẩm song ngữ. | **PARTIAL** (Form gửi dữ liệu thành công nhưng backend mutation **bỏ qua trường ảnh bìa và gallery**) |
| **Admin Products Edit** | `/admin/products/[id]/edit` | Form hiệu chỉnh chi tiết sản phẩm song ngữ. | **PARTIAL** (Backend mutation **bỏ qua trường cập nhật ảnh chính và gallery**) |
| **Admin Categories List** | `/admin/categories` | Danh sách danh mục sản phẩm song ngữ. | **DONE** (Thông qua route động `/admin/[section]`) |
| **Admin Categories New/Edit** | `/admin/categories/new` hoặc `/[id]/edit` | Form thêm/sửa danh mục sản phẩm song ngữ. | **PARTIAL** (Không lưu được ảnh đại diện danh mục `image_media_id` vào DB) |
| **Admin Showrooms List** | `/admin/showrooms` | Danh sách showroom cửa hàng phục vụ quản trị. | **DONE** (Thông qua route động `/admin/[section]`) |
| **Admin Showrooms New/Edit** | `/admin/showrooms?create=1` hoặc `?edit=[code]` | Form tạo/sửa showroom song ngữ. | **PARTIAL** (Không lưu được ảnh đại diện showroom `cover_image` vào bảng `showroom_media`) |
| **Admin Blog List/New/Edit** | `/admin/blog` | Danh sách bài viết và form tạo/sửa bài viết blog. | **PARTIAL** (Không lưu được ảnh bìa `cover_image` vào cột `blog_posts.cover_media_id`) |
| **Admin Quotes** | `/admin/quotes` | Danh sách và chi tiết yêu cầu báo giá của khách hàng (chỉ Admin, Editor bị chặn). | **DONE** (Thông qua route động `/admin/[section]`) |
| **Admin Users** | `/admin/users` | Quản trị tài khoản và vai trò của nhân viên CMS. | **TODO/MISSING** (FE đang **hard-code** tĩnh danh sách user, chưa kết nối thực sự tới DB `profiles`) |
| **Admin Settings** | `/admin/settings` | Cấu hình cài đặt hệ thống (SEO, email, api keys). | **TODO/MISSING** (FE đang đọc/ghi qua **localStorage** thay vì lưu trữ bảo mật trong DB `site_settings` và `integration_secrets`) |
| **Admin AI Assistant** | `/admin/ai-assistant` | Trợ lý AI Gemini hỗ trợ soạn thảo, dịch thuật và dàn ý nội dung. | **TODO/MISSING** (FE đang **mock** tĩnh giả lập bằng `setTimeout` và kết quả định sẵn, chưa tích hợp Google Gemini API) |

---

## PHẦN 2 — CHI TIẾT TỪNG MÀN HÌNH

### 2.1. Public Homepage — `/[locale]/page.tsx`
* **UI Fields hiện tại (FE):**
  * Slider Hero: `eyebrow`, `title`, `lead`, `image`, `meta` (3 slide).
  * Brand Marquee: Tên thương hiệu đối tác (`KOHLER`, `GROHE`, `TOTO`, v.v.) và xuất xứ.
  * Product Groups Bento: 4 nhóm phân loại (`Nội thất & đồ gỗ`, `Thiết bị vệ sinh`, `Gạch ốp lát`, `Thiết kế khác`).
  * Featured Products: Grid 6 sản phẩm nổi bật (gọi component [ProductCard](file:///d:/THCode/AI/furniture-website/components/showroom/product-card.tsx)).
  * Editorial Blog Posts: Danh sách 3 bài viết mới nhất (gồm ảnh, danh mục, thời gian đọc, tiêu đề, mô tả ngắn).
  * Trust Metrics: 3 thẻ chỉ số uy tín thương hiệu.
  * Sticky Reveal Showroom: Danh sách showroom (name, address, hotline), nút khám phá, ảnh showroom đại diện.
  * Form liên hệ: [QuoteForm](file:///d:/THCode/AI/furniture-website/components/showroom/quote-form.tsx) (Họ tên, SĐT, Email, Công ty, Nội dung dịch vụ, Lời nhắn, Honeypot).
* **API cần thiết:**
  | Method | Endpoint | Mục đích | Trạng thái |
  |--------|----------|----------|------------|
  | GET | RSC Query `getProducts` | Lấy danh sách sản phẩm nổi bật từ DB | **EXISTS** (Có mock fallback) |
  | GET | RSC Query `getBlogPosts` | Lấy danh sách bài viết mới nhất từ DB | **EXISTS** (Có mock fallback) |
  | GET | RSC Query `getShowrooms` | Lấy danh sách showroom hiển thị từ DB | **EXISTS** (Có mock fallback) |
  | POST | `/api/contact` | Gửi yêu cầu báo giá từ form liên hệ | **EXISTS** |
* **DB Tables liên quan:**
  | Table | Columns cần dùng | Columns đang thiếu | Ghi chú |
  |-------|-------------------|-------------------|---------|
  | `products` | `id`, `featured`, `status`, `deleted_at` | Không | Lọc sản phẩm nổi bật |
  | `product_translations` | `product_id`, `locale`, `name`, `summary`, `price_display_text` | Không | |
  | `blog_posts` | `id`, `status`, `published_at`, `deleted_at` | Không | |
  | `blog_post_translations` | `post_id`, `locale`, `title`, `excerpt` | Không | |
  | `showrooms` | `id`, `code`, `hotline`, `status`, `deleted_at` | Không | |
  | `showroom_translations` | `showroom_id`, `locale`, `name`, `address` | Không | |
* **Vấn đề phát hiện:**
  * Không có vấn đề nghiêm trọng. Trang chủ tích hợp dữ liệu DB rất tốt và có mock data dự phòng đầy đủ nếu DB trống.

### 2.2. Public About — `/[locale]/about/page.tsx`
* **UI Fields hiện tại (FE):**
  * Banner Hero: Tiêu đề trang (`title`), mô tả ngắn (`lead`), ảnh nền.
  * Brand Story: Đoạn giới thiệu lịch sử, ảnh nhà máy sản xuất, nhãn đếm năm kinh nghiệm (`20+ years`).
  * Core Values: 3 hộp hiển thị Tầm nhìn, Sứ mệnh, Giá trị cốt lõi.
  * Capacity: 3 chỉ số chứng minh năng lực (20+ năm, 500+ sản phẩm, 2.000m2 nhà máy).
  * Team: Hình ảnh tập thể nhân viên.
  * CTA Button: Nút chuyển hướng sang trang liên hệ tư vấn.
* **API cần thiết:**
  | Method | Endpoint | Mục đích | Trạng thái |
  |--------|----------|----------|------------|
  | GET | RSC Query `getContentPage` | Lấy tiêu đề và mô tả ngắn của trang giới thiệu | **EXISTS** (Có mock fallback) |
* **DB Tables liên quan:**
  | Table | Columns cần dùng | Columns đang thiếu | Ghi chú |
  |-------|-------------------|-------------------|---------|
  | `content_pages` | `id`, `key`, `status` | Không | Lấy trang có key = 'about' |
  | `content_page_translations` | `page_id`, `locale`, `title`, `lead` | Không | |
* **Vấn đề phát hiện:**
  * Phần Core Values và Capacity hiện đang dùng hằng số dịch đa ngôn ngữ tĩnh trong code. Mặc dù DB có hỗ trợ cấu trúc `page_sections` và `page_section_translations` rất linh hoạt nhưng trang giới thiệu chưa kết nối các khối bento này vào DB để admin có thể sửa đổi động.

### 2.3. Public Products Catalog — `/[locale]/products/page.tsx`
* **UI Fields hiện tại (FE):**
  * Header: Tiêu đề, mô tả ngắn, ảnh banner gỗ.
  * Top Categories: 3 thẻ nhóm sản phẩm chính (Nội thất gỗ, Thiết bị vệ sinh, Gạch ốp lát).
  * Filter Panel: Thanh tìm kiếm theo từ khoá (`q`), các select box lọc theo Danh mục, Chất liệu, Phòng, Style, Bộ sưu tập, Tông màu, Tính sẵn sàng và Sản phẩm nổi bật.
  * Active Chips: Các chip hiển thị bộ lọc đang được kích hoạt kèm nút xoá bộ lọc.
  * Sort Select: Dropdown sắp xếp sản phẩm (Mới nhất, Nổi bật trước).
  * Products Grid: Hiển thị danh sách thẻ [ProductCard](file:///d:/THCode/AI/furniture-website/components/showroom/product-card.tsx).
  * Pagination: Bộ điều hướng phân trang (Trang trước, Trang sau, số trang cụ thể).
  * Bottom Secondary Groups: Các danh mục phụ khác và số lượng sản phẩm tương ứng.
* **API cần thiết:**
  | Method | Endpoint | Mục đích | Trạng thái |
  |--------|----------|----------|------------|
  | GET | RSC Query `getProducts` | Fetch toàn bộ sản phẩm hoạt động | **EXISTS** (Có mock fallback) |
  | GET | RSC Query `getCategories` | Tải danh mục sản phẩm phục vụ filter | **EXISTS** (Có mock fallback) |
* **DB Tables liên quan:**
  | Table | Columns cần dùng | Columns đang thiếu | Ghi chú |
  |-------|-------------------|-------------------|---------|
  | `products` | `id`, `category_id`, `status`, `price_min`, `price_max`, `featured` | Không | |
  | `product_translations` | `product_id`, `locale`, `slug`, `name`, `summary` | Không | |
  | `product_categories` | `id`, `group_key`, `sort_order` | Không | |
  | `product_category_translations` | `category_id`, `locale`, `slug`, `name` | Không | |
* **Vấn đề phát hiện:**
  * **Hiệu năng & Phân trang:** Trang đang fetch tối đa 1000 sản phẩm từ DB (`limit: 1000`) qua Server Component, sau đó chạy toàn bộ thuật toán lọc (`filterProducts`) và phân trang (`paginateItems`) bằng Javascript ở phía Client. Khi số lượng sản phẩm lớn, điều này sẽ làm giảm tốc độ phản hồi và tăng băng thông truyền tải dữ liệu. RPC `public_products` của Supabase đã được viết để lọc trực tiếp trong SQL, cần tận dụng ở phía server.

### 2.4. Public Product Detail — `/[locale]/products/[slug]/page.tsx`
* **UI Fields hiện tại (FE):**
  * Thư viện ảnh ([ProductGallery](file:///d:/THCode/AI/furniture-website/components/showroom/product-detail-experience.tsx)): Carousel ảnh lớn, danh sách thu nhỏ (thumbnail).
  * Sidebar thông tin: Danh mục, Tên sản phẩm, Mã Ref, Giá tham khảo (hoặc Liên hệ báo giá), Mô tả tóm tắt, specs rút gọn (Chất liệu, Kích thước).
  * CTA Group: Nút "Nhận báo giá ngay" (mở modal QuoteForm), "Lưu lựa chọn" và "Xem tại showroom".
  * Tabs thông tin ([ProductInformationTabs](file:///d:/THCode/AI/furniture-website/components/showroom/product-detail-experience.tsx)): Tabs Tổng quan, Thông số kỹ thuật, Chất liệu & Hoàn thiện, Kích thước & Bảo quản, Giao hàng & Bảo hành.
  * Form cá nhân hóa: [QuoteForm](file:///d:/THCode/AI/furniture-website/components/showroom/quote-form.tsx) truyền sẵn `productId` và `categoryId` ẩn.
  * Related Products: Grid 3 sản phẩm liên quan trong cùng danh mục.
* **API cần thiết:**
  | Method | Endpoint | Mục đích | Trạng thái |
  |--------|----------|----------|------------|
  | GET | RSC Query `getProductBySlug` | Lấy chi tiết 1 sản phẩm theo slug | **EXISTS** |
  | GET | RSC Query `getProducts` | Lấy danh sách sản phẩm liên quan | **EXISTS** |
* **DB Tables liên quan:**
  | Table | Columns cần dùng | Columns đang thiếu | Ghi chú |
  |-------|-------------------|-------------------|---------|
  | `products` | Toàn bộ thông tin cấu hình sản phẩm | Không | |
  | `product_translations` | Cấu hình dịch thuật, specs, mô tả chi tiết | Không | |
  | `product_media` | `product_id`, `media_id`, `is_primary` | Không | Bản ghi join ảnh |
  | `media_assets` | `id`, `public_url` | Không | |
* **Vấn đề phát hiện:**
  * **Mất ảnh sản phẩm mới:** Khi tạo mới sản phẩm trong CMS Admin, ảnh chính và gallery không được ghi nhận vào bảng `product_media` (do lỗi mutation). Do đó, khi xem chi tiết sản phẩm mới trên giao diện public, sản phẩm sẽ luôn hiển thị ảnh placeholder (`/placeholder.jpg`) và không có ảnh gallery đi kèm.

### 2.5. Public Promotions — `/[locale]/promotions/page.tsx`
* **UI Fields hiện tại (FE):**
  * Hero banner: Khuyến mãi đặc quyền.
  * Danh sách combo: 3 hộp combo khuyến mãi lớn (Heritage Walnut, Wellness Bath, Grand Surface Tile). Gồm: Tag chiến dịch, chiết khấu %, Tiêu đề combo, Mô tả ngắn, Ảnh bìa, Giá gốc, Giá khuyến mãi, Ngày hết hạn, Các sản phẩm đi kèm, Nút đăng ký nhận ưu đãi.
  * Form đăng ký: Form [QuoteForm](file:///d:/THCode/AI/furniture-website/components/showroom/quote-form.tsx) để gửi yêu cầu khuyến mãi.
* **API cần thiết:**
  | Method | Endpoint | Mục đích | Trạng thái |
  |--------|----------|----------|------------|
  | GET | RSC Query `getPromotions` | Lấy danh sách chiến dịch khuyến mãi từ DB | **MISSING** (Không được import hay sử dụng ở trang này) |
* **DB Tables liên quan:**
  | Table | Columns cần dùng | Columns đang thiếu | Ghi chú |
  |-------|-------------------|-------------------|---------|
  | `promotions` | `id`, `code`, `discount_percentage` | Không | |
  | `promotion_translations` | `promotion_id`, `locale`, `title`, `description` | Không | |
* **Vấn đề phát hiện:**
  * **Hard-code dữ liệu chiến dịch:** Toàn bộ danh sách combo (`promoCombos`) bao gồm ảnh, giá cũ/mới, danh sách sản phẩm cấu thành đều được **hard-code tĩnh bằng Tiếng Việt và Tiếng Anh** ngay trong component giao diện. API `getPromotions` từ queries đã được viết sẵn nhưng trang này hoàn toàn không dùng đến.
  * **Database schema thiếu hụt so với UI mockup:** Bảng `promotions` và `promotion_translations` hiện tại trong cơ sở dữ liệu chỉ hỗ trợ lưu trữ `title`, `description`, `discount_percentage` cơ bản. Bản thiết kế UI của FE lại yêu cầu hiển thị: ảnh bìa, giá gốc, giá KM, thời hạn, danh sách gạch đầu dòng các sản phẩm đi kèm. Để đồng bộ thật từ DB, cấu trúc bảng `promotions` cần lưu thêm cột JSONB (ví dụ: `metadata_jsonb`) chứa các cấu hình hiển thị phụ này.

---

### 2.6. Admin Dashboard & Login — `/admin/page.tsx` & `/admin/login/page.tsx`
* **UI Fields hiện tại (FE):**
  * Login Form: Input Email, Password, Nút Đăng nhập.
  * KPIs Widget: 6 thẻ đếm số lượng (Sản phẩm, Danh mục, Bài viết, Showroom, Yêu cầu báo giá, Người dùng). Chế độ bảo mật vai trò: Editor không thấy thẻ Báo giá và Người dùng.
  * Insight Chart: Biểu đồ thống kê lượt quan tâm/báo giá.
  * Quotes Table: Danh sách 5 yêu cầu báo giá mới nhất kèm nút xem chi tiết.
* **API cần thiết:**
  | Method | Endpoint | Mục đích | Trạng thái |
  |--------|----------|----------|------------|
  | POST | Supabase Client `signInWithPassword` | Xác thực đăng nhập | **EXISTS** |
  | GET | RSC Query `getAdminDashboardStats` | Thống kê số lượng KPIs cho Dashboard | **EXISTS** |
  | GET | RSC Query `getAdminQuotesList` | Lấy 5 báo giá mới nhất | **EXISTS** |
* **DB Tables liên quan:**
  | Table | Columns cần dùng | Columns đang thiếu | Ghi chú |
  |-------|-------------------|-------------------|---------|
  | `profiles` | `id`, `email`, `role`, `is_active` | Không | Kiểm tra quyền |
  | `quote_requests` | `id`, `full_name`, `created_at`, `status` | Không | |
* **Vấn đề phát hiện:**
  * Biểu đồ `DashboardInsightChart` hiển thị dữ liệu lượng báo giá/quan tâm hiện tại là dữ liệu giả lập (mock UI) ở phía client, chưa truy vấn thực tế dữ liệu theo thời gian từ DB.

### 2.7. Admin Products New/Edit — `/admin/products/new` & `/admin/products/[id]/edit`
* **UI Fields hiện tại (FE):**
  * Form `ContentEditorForm`:
    * Thông tin chung: Tên tiếng Việt/tiếng Anh, Mã Ref, Slug, Danh mục, Nhãn hiệu, Thứ tự sắp xếp, checkbox Nổi bật.
    * Giá cả: Giá tối thiểu, Giá tối đa, Trạng thái giá (Chỉ liên hệ / Hiển thị khoảng giá).
    * Mô tả: Mô tả ngắn vi/en, Soạn thảo nội dung vi/en.
    * Thuộc tính nâng cao: Chất liệu vi/en, Kích thước vi/en, và bảng thêm thuộc tính tuỳ chỉnh (Tên VI/EN, Giá trị VI/EN).
    * SEO Song ngữ: Tiêu đề SEO vi/en, Mô tả SEO vi/en.
    * Media: Dropzone tải ảnh chính (cover) và danh sách tải lên gallery.
* **API cần thiết:**
  | Method | Endpoint | Mục đích | Trạng thái |
  |--------|----------|----------|------------|
  | GET | RSC Query `getAdminProductByIdOrSlug` | Lấy chi tiết sản phẩm cần sửa | **EXISTS** |
  | POST | Server Action `createAdminProduct` | Tạo mới sản phẩm | **PARTIAL** (Bỏ qua lưu media) |
  | PUT | Server Action `updateAdminProduct` | Cập nhật sản phẩm | **PARTIAL** (Bỏ qua lưu media) |
* **DB Tables liên quan:**
  | Table | Columns cần dùng | Columns đang thiếu | Ghi chú |
  |-------|-------------------|-------------------|---------|
  | `products` | Toàn bộ cấu trúc bảng | Không | |
  | `product_translations` | Toàn bộ cấu trúc bảng | Không | |
  | `product_media` | `product_id`, `media_id` | Không | Bảng liên kết trung gian |
* **Vấn đề phát hiện:**
  * 🔴 **LỖI NGHIÊM TRỌNG (HIGH):** Mặc dù form ở FE truyền đầy đủ `cover_image` (ảnh chính) và `gallery_images` (mảng link ảnh), nhưng các hàm `createAdminProduct` và `updateAdminProduct` trong `lib/supabase/mutations.ts` **hoàn toàn bỏ qua hai trường này**. Không hề có câu lệnh INSERT/UPDATE nào tương tác với bảng `product_media` hoặc cập nhật mối quan hệ media của sản phẩm. Kết quả là ảnh tải lên bị mất liên kết hoàn toàn khi ghi xuống DB thực tế.

### 2.8. Admin Showrooms New/Edit — `/admin/showrooms?create=1` hoặc `?edit=[code]`
* **UI Fields hiện tại (FE):**
  * Bản dịch tiếng Anh: Checkbox bật bản dịch tiếng Anh, Nút AI tự động dịch.
  * Form details: Tên showroom vi/en, Hotline, Mã nội bộ, Địa chỉ vi/en, Giờ mở cửa vi/en, Maps embed URL, Maps fallback URL, Vĩ độ, Kinh độ, Thứ tự hiển thị, Trạng thái (Nháp, Xuất bản, Lưu trữ).
  * SEO: Tiêu đề/Mô tả SEO vi/en.
  * Media: Dropzone tải ảnh chính.
* **API cần thiết:**
  | Method | Endpoint | Mục đích | Trạng thái |
  |--------|----------|----------|------------|
  | GET | RSC Query `getAdminShowroomByIdOrCode` | Lấy showroom cần sửa | **EXISTS** |
  | POST | Server Action `createAdminShowroom` | Tạo mới showroom | **PARTIAL** (Bỏ qua lưu media) |
  | PUT | Server Action `updateAdminShowroom` | Cập nhật showroom | **PARTIAL** (Bỏ qua lưu media) |
* **DB Tables liên quan:**
  | Table | Columns cần dùng | Columns đang thiếu | Ghi chú |
  |-------|-------------------|-------------------|---------|
  | `showrooms` | Toàn bộ cấu trúc bảng | Không | |
  | `showroom_translations` | Toàn bộ cấu trúc bảng | Không | |
  | `showroom_media` | `showroom_id`, `media_id` | Không | Bảng liên kết trung gian |
* **Vấn đề phát hiện:**
  * 🔴 **LỖI NGHIÊM TRỌNG (HIGH):** Hàm `createAdminShowroom` và `updateAdminShowroom` trong backend mutations **hoàn toàn bỏ qua trường `cover_image`** gửi lên từ form. Không có thao tác ghi dữ liệu vào bảng liên kết `showroom_media`. Do đó, hình ảnh đại diện showroom không bao giờ lưu trữ được vào DB thực tế.

### 2.9. Admin Blog New/Edit — `/admin/blog`
* **UI Fields hiện tại (FE):**
  * Form `ContentEditorForm`:
    * Tiêu đề vi/en, Slug bài viết, Trích dẫn vi/en, Danh mục bài viết, Trạng thái (Nháp/Xuất bản), Checkbox Nổi bật.
    * Soạn thảo nội dung vi/en.
    * SEO: Tiêu đề/Mô tả SEO vi/en.
    * Media: Dropzone tải ảnh chính (cover).
* **API cần thiết:**
  | Method | Endpoint | Mục đích | Trạng thái |
  |--------|----------|----------|------------|
  | GET | RSC Query `getAdminBlogPostByIdOrSlug` | Lấy chi tiết bài viết blog | **EXISTS** |
  | POST | Server Action `createAdminBlogPost` | Tạo bài viết mới | **PARTIAL** (Bỏ qua lưu media) |
  | PUT | Server Action `updateAdminBlogPost` | Cập nhật bài viết | **PARTIAL** (Bỏ qua lưu media) |
* **DB Tables liên quan:**
  | Table | Columns cần dùng | Columns đang thiếu | Ghi chú |
  |-------|-------------------|-------------------|---------|
  | `blog_posts` | `category_id`, `status`, `featured`, `cover_media_id` | Không | Bảng chính bài viết |
  | `blog_post_translations` | `title`, `excerpt`, `body_json`, `seo...` | Không | |
* **Vấn đề phát hiện:**
  * 🔴 **LỖI NGHIÊM TRỌNG (HIGH):** Tương tự như sản phẩm và showroom, hàm mutation `createAdminBlogPost` và `updateAdminBlogPost` **bỏ qua trường `cover_image`**. Nó không hề gán giá trị ID ảnh vào cột `cover_media_id` trong bảng `blog_posts`. Ngoài ra, hàm truy vấn `getAdminBlogPostByIdOrSlug` đang hard-code trả về `cover_image: ""` (chuỗi rỗng), khiến ảnh bài viết biến mất mỗi khi người dùng mở form chỉnh sửa.

### 2.10. Admin Users — `/admin/users`
* **UI Fields hiện tại (FE):**
  * Danh sách: Bảng hiển thị Email, Vai trò (Quản trị viên / Biên tập viên), Mô tả phạm vi quyền hạn và trạng thái hoạt động.
  * Form tạo user: Họ tên, Email, Vai trò (editor/admin), Trạng thái checkbox Hoạt động.
* **API cần thiết:**
  | Method | Endpoint | Mục đích | Trạng thái |
  |--------|----------|----------|------------|
  | GET | `/api/admin/users` (hoặc Server Action) | Tải danh sách tài khoản profiles | **MISSING** (FE đang hard-code) |
* **DB Tables liên quan:**
  | Table | Columns cần dùng | Columns đang thiếu | Ghi chú |
  |-------|-------------------|-------------------|---------|
  | `profiles` | `email`, `role`, `is_active` | Không | Bảng profiles liên kết auth.users |
* **Vấn đề phát hiện:**
  * 🟡 **Lỗi đồng bộ (MEDIUM):** Giao diện danh sách user quản trị CMS tại `/admin/users` hiện đang **hard-code cứng hai tài khoản tĩnh** (`admin@phuongdong.vn` và `editor@phuongdong.vn`) trực tiếp trên code giao diện. Trang này hoàn toàn chưa kết nối và gọi dữ liệu thực tế từ bảng `profiles` của Supabase DB.

### 2.11. Admin Settings — `/admin/settings`
* **UI Fields hiện tại (FE):**
  * Form `SettingsOperationsPanel`:
    * Tab Nhận diện: Tên thương hiệu vi/en, Logo URL, Favicon URL.
    * Tab Liên hệ: Điện thoại, Email, Địa chỉ vi/en, Locale mặc định.
    * Tab SEO: Tiêu đề/Mô tả SEO vi/en mặc định.
    * Tab Tích hợp: API key Resend, Preset Cloudinary, API key OpenAI (đang đại diện cho Gemini), SLA phản hồi.
    * Tab Section: Bật/tắt các section trang chủ (Hero, Giới thiệu, Nổi bật, Blog, Showroom, Quote) và cấu hình chi tiết nội dung của từng section.
* **API cần thiết:**
  | Method | Endpoint | Mục đích | Trạng thái |
  |--------|----------|----------|------------|
  | GET | `/api/admin/settings` | Lấy thông tin cài đặt site & masked API keys | **MISSING** (FE đang dùng localStorage) |
  | PUT | `/api/admin/settings` | Cập nhật cấu hình site, mã hoá API keys | **MISSING** (FE đang dùng localStorage) |
* **DB Tables liên quan:**
  | Table | Columns cần dùng | Columns đang thiếu | Ghi chú |
  |-------|-------------------|-------------------|---------|
  | `site_settings` | Cấu hình phone, email, logo, favicon | Không | Bảng cấu hình singleton |
  | `site_setting_translations` | Cấu hình dịch brand_name, address, seo | Không | |
  | `integration_secrets` | Lưu trữ API keys được mã hóa (Resend, Gemini) | Không | |
* **Vấn đề phát hiện:**
  * 🔴 **LỖI NGHIÊM TRỌNG (HIGH):** Toàn bộ chức năng cài đặt hệ thống đang **đọc và ghi trực tiếp vào `localStorage` của trình duyệt** (trong tệp lưu trữ cục bộ khóa `"pd-cms-settings"`). Hệ thống hoàn toàn không gọi API backend và không lưu dữ liệu vào các bảng cấu hình thực tế của DB. Điều này dẫn đến việc thay đổi cấu hình thương hiệu/API keys không thể áp dụng cho người dùng public và không được lưu trữ tập trung trên server.

### 2.12. Admin AI Assistant — `/admin/ai-assistant`
* **UI Fields hiện tại (FE):**
  * Form: Chọn tác vụ AI (Dịch thuật, Tạo nháp SEO, Tạo dàn ý), Loại nội dung đích, Ô nhập nội dung gốc tiếng Việt, Nút tạo nháp, Nút mô phỏng lỗi.
  * Preview: Khung hiển thị kết quả đề xuất bản nháp, Nút chèn vào bản soạn thảo.
* **API cần thiết:**
  | Method | Endpoint | Mục đích | Trạng thái |
  |--------|----------|----------|------------|
  | POST | `/api/admin/ai/generate-draft` | Gọi Google Gemini API tạo nháp nội dung | **MISSING** (FE đang giả lập client-side) |
* **DB Tables liên quan:**
  | Table | Columns cần dùng | Columns đang thiếu | Ghi chú |
  |-------|-------------------|-------------------|---------|
  | `ai_drafts` | Lưu lịch sử nháp AI để audit | Không | |
  | `integration_secrets` | Lấy API Key Gemini để gọi OpenAI/Gemini SDK | Không | |
* **Vấn đề phát hiện:**
  * 🔴 **LỖI ĐỒNG BỘ & CHƯA HOÀN THÀNH (HIGH):** Giao diện AI Assistant hoàn toàn là **mock giả lập bằng `setTimeout` 500ms** và trả về các chuỗi văn bản dịch/SEO tĩnh định sẵn trong code client. API route để tương tác với Gemini SDK thực tế chưa được thiết lập.

---

### 2.13. Yêu cầu Báo Giá & Gửi Liên Hệ — `POST /api/contact`
* **API Route:** `app/api/contact/route.ts`
* **DB Tables liên quan:** `quote_requests`, `quote_notifications`.
* **Vấn đề phát hiện:**
  * 🔴 **LỖI TÊN CỘT SQL (HIGH):** Ở dòng 127 của `app/api/contact/route.ts`, khi API cập nhật nhật ký gửi email thông báo thất bại:
    ```typescript
    await supabase
      .from("quote_notifications")
      .update({ status: notificationStatus, error_detail: emailError })
      .eq("quote_request_id", quote.id);
    ```
    Trường `.update()` cố gắng ghi vào cột `error_detail`. Tuy nhiên, trong cấu trúc bảng `quote_notifications` của DB, cột này có tên chính xác là `last_error`. Lỗi sai lệch tên cột này sẽ dẫn đến lỗi truy vấn SQL của Supabase và làm sập API gửi liên hệ khi có lỗi gửi thư.

---

## PHẦN 3 — DATABASE AUDIT

Bảng dữ liệu thực tế hiện tại trong cơ sở dữ liệu Supabase PostgreSQL (kiểm tra qua migrations):

| Table | Columns hiện có | Columns cần thêm | Quan hệ (FK) | Ghi chú |
|-------|----------------|-----------------|--------------|---------|
| `profiles` | `id`, `email`, `full_name`, `role`, `is_active`, `last_login_at` | Không | `profiles.id` -> `auth.users.id` | Quản trị tài khoản CMS (Role Model A) |
| `media_assets` | `id`, `storage_provider`, `bucket`, `object_path`, `public_url`, `size_bytes`, `width`, `height`, `mime_type` | Không | Không | Quản trị tệp tin đa phương tiện |
| `media_asset_translations` | `id`, `media_id`, `locale`, `alt_text`, `caption` | Không | `media_id` -> `media_assets.id` | |
| `site_settings` | `id`, `singleton_key`, `logo_media_id`, `favicon_media_id`, `contact_phone`, `contact_email` | Không | `logo_media_id` -> `media_assets.id` | Singleton cấu hình hệ thống |
| `site_settings_translations` | `id`, `site_settings_id`, `locale`, `brand_name`, `contact_address`, `seo_default_title`, `seo_default_description` | Không | `site_settings_id` -> `site_settings.id` | |
| `quote_recipients` | `id`, `site_settings_id`, `email`, `label`, `is_active` | Không | `site_settings_id` -> `site_settings.id` | Danh sách nhận email thông báo quote |
| `content_pages` | `id`, `key`, `status`, `published_at` | Không | Không | Các trang nội dung tĩnh |
| `content_page_translations` | `id`, `page_id`, `locale`, `slug`, `title`, `lead`, `body_json` | Không | `page_id` -> `content_pages.id` | |
| `product_categories` | `id`, `parent_id`, `group_key`, `image_media_id`, `status`, `sort_order` | Không | `parent_id` -> `product_categories.id` | Danh mục sản phẩm showroom |
| `product_category_translations` | `id`, `category_id`, `locale`, `slug`, `name`, `description` | Không | `category_id` -> `product_categories.id` | |
| `products` | `id`, `category_id`, `reference_code`, `status`, `price_min`, `price_max`, `currency`, `width`, `depth`, `height`, `featured`, `promotion_id`, `promo_price_min`, `promo_price_max` | Không | `category_id` -> `product_categories.id` | Bảng sản phẩm chính |
| `product_translations` | `id`, `product_id`, `locale`, `slug`, `name`, `summary`, `description_json`, `material`, `price_display_text`, `dimension_display_text` | Không | `product_id` -> `products.id` | |
| `product_media` | `id`, `product_id`, `media_id`, `context`, `is_primary`, `sort_order` | Không | `product_id` -> `products.id`, `media_id` -> `media_assets.id` | |
| `blog_posts` | `id`, `category_id`, `author_id`, `cover_media_id`, `status`, `featured`, `published_at` | Không | `cover_media_id` -> `media_assets.id` | Bảng chính bài viết blog |
| `blog_post_translations` | `id`, `post_id`, `locale`, `slug`, `title`, `excerpt`, `body_json` | Không | `post_id` -> `blog_posts.id` | |
| `showrooms` | `id`, `code`, `hotline`, `google_maps_embed_url`, `google_maps_fallback_url`, `latitude`, `longitude`, `status` | Không | Không | |
| `showroom_translations` | `id`, `showroom_id`, `locale`, `name`, `address`, `opening_hours` | Không | `showroom_id` -> `showrooms.id` | |
| `showroom_media` | `id`, `showroom_id`, `media_id`, `is_primary` | Không | `showroom_id` -> `showrooms.id` | |
| `quote_requests` | `id`, `full_name`, `phone`, `email`, `company`, `service`, `message`, `preferred_locale`, `product_id`, `status` | Không | `product_id` -> `products.id` | Leads khách hàng |
| `quote_notifications` | `id`, `quote_request_id`, `recipient_email`, `status`, `last_error` | Không | `quote_request_id` -> `quote_requests.id` | Theo dõi email thông báo |
| `promotions` | `id`, `code`, `discount_percentage`, `status`, `start_at`, `end_at` | `metadata_jsonb` (Đề xuất thêm trường cấu hình hiển thị phụ) | Không | Các combo khuyến mãi |
| `promotion_translations` | `id`, `promotion_id`, `locale`, `title`, `description` | Không | `promotion_id` -> `promotions.id` | Localized promotion |
| `integration_secrets` | `id`, `secret_key`, `encrypted_value`, `masked_hint`, `created_at` | Không | Không | Lưu API keys mã hoá AES-GCM-256 |

### Các vấn đề DB & Migration:
* **Thiếu table/column:** DB schema được thiết kế rất tối ưu và đầy đủ. Không thiếu bảng cốt lõi nào. Tuy nhiên để đồng bộ hoá trang Khuyến mãi từ DB (tránh hard-code), bảng `promotions` cần hỗ trợ lưu thêm các trường phụ phục vụ UI như: *ảnh đại diện*, *giá gốc của combo*, *giá khuyến mãi cụ thể*, *danh sách gạch đầu dòng các sản phẩm đi kèm*.
  * **Giải pháp:** Có thể thêm cột `metadata_jsonb` vào bảng `promotions` để lưu trữ linh hoạt các thông tin phụ này mà không làm xáo trộn cấu trúc bảng hiện tại.
* **Seed/Migration hard-code:** Dữ liệu mẫu ban đầu trong `0009_optional_local_seed.sql` là hợp lý để chạy môi trường phát triển local, không có dữ liệu nhạy cảm hoặc sai lệch.

---

## PHẦN 4 — API AUDIT

### 4.1. Danh sách các API Endpoint hiện có:

| Method | Endpoint | Controller/Handler (File) | Request Body / Params | Response Shape | Được dùng ở màn hình | Trạng thái |
|--------|----------|--------------------|-------------|----------|----------------------|------------|
| POST | `/api/contact` | `app/api/contact/route.ts` | JSON `fullName`, `phone`, `email`, `company`, `service`, `message`, `locale`, `productId`, `categoryId`, `sourcePath`, `honeypot` | `{ ok: boolean, submitted: boolean }` | Public Homepage, Product Detail, Contact, Promotions | **PARTIAL** (Có lỗi tên cột SQL `error_detail` khi update lỗi) |
| GET | `/api/health` | `app/api/health/route.ts` | Không | `{ status: "ok", timestamp: string }` | Kiểm tra hệ thống (Docker/CI) | **DONE** |

### 4.2. Danh sách các API/Server-side Actions còn thiếu hoặc cần sửa đổi:

| Method | Endpoint / Action gợi ý | Màn hình cần | Mức độ ưu tiên | Mô tả công việc |
|--------|---------------|-------------|----------------|-----------------|
| GET/PUT | `/api/admin/settings` | Admin Settings | **🔴 HIGH** | Viết API đọc/ghi cấu hình site từ `site_settings`, `site_setting_translations` và mã hoá/giải mã API Keys trong `integration_secrets`. Xoá bỏ `localStorage`. |
| POST | `/api/admin/ai/generate-draft` | Admin AI Assistant, Admin Showrooms | **🔴 HIGH** | Tạo route gọi trực tiếp Google Gemini API SDK bằng API Key giải mã từ DB để cung cấp tính năng dịch tự động và tạo nháp nội dung song ngữ thực tế. |
| GET | Server Action / API users | Admin Users | **🟡 MED** | Tải danh sách profiles và vai trò của người quản trị thực tế từ bảng `profiles` lên DataTable thay vì danh sách hard-code. |
| PATCH | Sửa các mutations media | Admin Products/Blogs/Showrooms/Categories | **🔴 HIGH** | Sửa các hàm `createAdminProduct`, `updateAdminProduct`, `createAdminShowroom`, `updateAdminShowroom`... để chèn liên kết ảnh (`cover_image`, `gallery_images`) vào bảng trung gian hoặc cột liên kết media tương ứng. |

---

## PHẦN 5 — HARD-CODE AUDIT

Tìm thấy các vị trí dữ liệu đang bị hard-code thay vì lấy động từ DB/API:

| File | Dòng | Nội dung hard-code | Nên thay bằng API nào | Mức độ ưu tiên |
|------|------|-------------------|-----------------------|----------------|
| [promotions/page.tsx](file:///d:/THCode/AI/furniture-website/app/[locale]/promotions/page.tsx) | 40-113 | Mảng tĩnh `promoCombos` chứa thông tin combo ưu đãi | Gọi hàm `getPromotions` kết nối DB bảng `promotions` | **🟡 MEDIUM** |
| [admin-pages.tsx](file:///d:/THCode/AI/furniture-website/components/showroom/admin-pages.tsx) | 844-855 | Mảng tĩnh danh sách accounts quản trị CMS | API tải tài khoản CMS lấy từ bảng `profiles` | **🟡 MEDIUM** |
| [admin-workflows.tsx](file:///d:/THCode/AI/furniture-website/components/showroom/admin-workflows.tsx) | 1434-1500, 1533-1616, 1619-1707 | Cấu hình cài đặt singleton mặc định và lưu trữ qua `localStorage` | API `/api/admin/settings` kết nối bảng `site_settings` và `integration_secrets` | **🔴 HIGH** |
| [admin-workflows.tsx](file:///d:/THCode/AI/furniture-website/components/showroom/admin-workflows.tsx) | 2832-2950 | Mock `setTimeout` 500ms giả lập dịch thuật và SEO của AI | API `/api/admin/ai/generate-draft` tích hợp Gemini SDK | **🔴 HIGH** |
| [mutations.ts](file:///d:/THCode/AI/furniture-website/lib/supabase/mutations.ts) | 1045 | Hard-code `cover_image: ""` khi lấy chi tiết bài viết Blog | Đọc liên kết ảnh từ bảng `media_assets` join với `blog_posts` | **🔴 HIGH** |

---

## PHẦN 6 — TÍNH NĂNG CHƯA HOÀN THÀNH

🔴 **HIGH — Chặn chức năng chính (Cần xử lý gấp):**
- [ ] **Sửa lỗi SQL API Contact:** Đổi trường `error_detail` thành `last_error` trong `app/api/contact/route.ts` dòng 127 để tránh lỗi câu lệnh SQL update.
- [ ] **Khắc phục mutations mất ảnh sản phẩm:** Cập nhật `createAdminProduct` và `updateAdminProduct` trong `lib/supabase/mutations.ts` để thực hiện chèn và đồng bộ hoá ảnh chính, ảnh gallery vào bảng `product_media`.
- [ ] **Khắc phục mutations mất ảnh showroom:** Sửa `createAdminShowroom` và `updateAdminShowroom` trong `lib/supabase/mutations.ts` để lưu `cover_image` vào bảng `showroom_media`.
- [ ] **Khắc phục mutations mất ảnh bài viết:** Sửa `createAdminBlogPost` và `updateAdminBlogPost` trong `lib/supabase/mutations.ts` để lưu `cover_image` vào cột `blog_posts.cover_media_id`. Đồng thời sửa `getAdminBlogPostByIdOrSlug` để trả về URL ảnh bìa thật thay vì trả về chuỗi rỗng.
- [ ] **Khắc phục mutations mất ảnh danh mục:** Sửa `createAdminCategory` và `updateAdminCategory` để lưu ảnh đại diện danh mục vào cột `product_categories.image_media_id`.
- [ ] **Thay thế localStorage ở Settings:** Xây dựng API `/api/admin/settings` hỗ trợ phương thức GET/PUT để đọc/ghi cấu hình site vào DB (`site_settings`, `site_setting_translations`) và lưu khóa bảo mật được mã hóa AES-GCM-256 vào `integration_secrets`. Đồng bộ hoá public pages để đọc các giá trị cấu hình này thay vì đọc mock constants.

🟡 **MEDIUM — Tính năng còn thiếu:**
- [ ] **Tích hợp Gemini API thực tế:** Triển khai API route `/api/admin/ai/generate-draft` gọi Google Gemini API SDK. Kết nối workspace Trợ lý AI ở admin để xoá bỏ mock UI.
- [ ] **Đồng bộ trang Khuyến mại:** Thêm cột `metadata_jsonb` vào bảng `promotions` để lưu trữ ảnh, giá và danh sách sản phẩm đi kèm. Chuyển đổi trang `/[locale]/promotions` sang gọi hàm `getPromotions` động.
- [ ] **Đồng bộ quản trị users:** Kết nối trang `UsersPage` trong admin với API đọc danh sách tài khoản từ bảng `profiles`.

🟢 **LOW — Cải thiện/tối ưu:**
- [ ] **Tối ưu hóa bộ lọc sản phẩm:** Chuyển đổi lọc sản phẩm từ client-side Javascript sang server-side SQL/RPC trực tiếp qua hàm `public_products` của Postgres để tối ưu hoá tốc độ khi số lượng sản phẩm lớn.

---

## PHẦN 7 — ĐỀ XUẤT THỨ TỰ FIX (IMPLEMENTATION ROADMAP)

1. **Sprint 1 (Sửa lỗi SQL & Đồng bộ ảnh chính trong Mutations):**
   * Đổi `error_detail` thành `last_error` trong `app/api/contact/route.ts`.
   * Cập nhật các hàm mutations của Sản phẩm, Danh mục, Showroom, Bài viết để chèn liên kết hình ảnh vào các bảng tương ứng trong cơ sở dữ liệu thực tế.
2. **Sprint 2 (Xây dựng API Cấu hình cài đặt):**
   * Thiết lập API `/api/admin/settings` (GET và PUT) mã hoá AES-GCM-256 API keys.
   * Kết nối Form cấu hình Admin Settings với API này, loại bỏ hoàn toàn `localStorage`.
   * Cập nhật trang chủ và thông tin liên hệ public lấy cấu hình thương hiệu, hotline động từ DB.
3. **Sprint 3 (Tích hợp Trợ lý AI và Đồng bộ Khuyến mãi):**
   * Tích hợp SDK Google Gemini vào route `/api/admin/ai/generate-draft`.
   * Thêm trường `metadata_jsonb` vào bảng `promotions`. Kết nối trang khuyến mãi và admin promotions với DB động.
4. **Sprint 4 (Đồng bộ người dùng & Tối ưu hoá Catalog):**
   * Kết nối trang quản trị user với profiles DB.
   * Chuyển bộ lọc sản phẩm sang thực thi server-side qua RPC `public_products`.
