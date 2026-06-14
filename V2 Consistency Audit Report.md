# Báo Cáo Kiểm Tra Tính Nhất Quán Vòng 2 (V2 Consistency Audit Report)
## Kiến Trúc Thành Phần, Quy Tắc Nghiệp Vụ và Vận Hành Quản Trị
### Dự án: Showroom Nội Thất Phương Đông (Bilingual Corporate Showroom CMS)

Báo cáo này được thực hiện nhằm tiếp nối và mở rộng báo cáo kiểm tra tính nhất quán vòng 1. Tài liệu này đi sâu phân tích ở cấp độ thành phần giao diện (Component-level), các quy tắc nghiệp vụ cốt lõi (Business-rule), khả năng vận hành thực tế của trang quản trị (Admin-operational), sự phù hợp của mô hình dữ liệu (Data-model fit), và ma trận truy vết luồng dữ liệu đầu cuối (End-to-end traceability).

---

## 1. EXECUTIVE DELTA FROM PREVIOUS AUDIT

Báo cáo audit vòng 1 đã xác định được các lỗi đồng bộ cơ bản ở mức độ trang (Page-level) và một số lỗi SQL nghiêm trọng (như lỗi cột `error_detail` trong API contact, lỗi bỏ qua media trong mutations). Tuy nhiên, để hệ thống có thể vận hành thực tế một cách trơn tru, vòng audit này tập trung vào các điểm khác biệt và nâng cấp chuyên sâu sau:

*   **Component-level Audit:** Quét sâu các component con cấu thành trang, phát hiện việc sử dụng dữ liệu tĩnh từ `lib/showroom-data.ts` làm nghẽn luồng cập nhật động của Mega-menu và các bộ lọc thuộc tính.
*   **Business-rule Audit:** Phân tích logic nghiệp vụ của 9 domains chính. Chỉ ra sự thiếu hụt nghiêm trọng về cấu trúc của module Khuyến mãi (Combo, giá trị combo, thời hạn, sản phẩm đi kèm) và sự vắng bóng hoàn toàn của thực thể Thương hiệu (Brand) ở tầng Database.
*   **Admin-operational Audit:** Đánh giá hệ thống dưới góc nhìn của người vận hành quản trị hàng ngày. Đề xuất các cột thông tin, bộ lọc, tính năng tìm kiếm, phân trang và hành động hàng loạt (bulk actions/export) cho từng màn hình danh sách trong admin.
*   **Data-model Fit Audit:** Đánh giá cấu trúc DB hiện tại có đáp ứng được nhu cầu scale nghiệp vụ hay không, thiết kế sơ đồ bảng nâng cấp hỗ trợ quan hệ nhiều-nhiều cho khuyến mãi và thực thể thương hiệu chuẩn hóa.
*   **Traceability & Completeness Matrix:** Thiết lập bản đồ truy vết từ yêu cầu nghiệp vụ qua component giao diện đến API và bảng DB, đồng thời đánh giá mức độ hoàn thiện các thao tác CRUD và dịch thuật đa ngôn ngữ.

---

## 2. COMPONENT-LEVEL AUDIT

Bảng dưới đây phân tích chi tiết các component/subcomponent trên toàn hệ thống public và admin:

| Page | Component | File path | Data source hiện tại | Business purpose | API/DB mapping | Hard-code risk | Mức độ hoàn thiện | Ghi chú |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Public Layout** | Header / Navbar | [public-shell.tsx](file:///d:/THCode/AI/furniture-website/components/showroom/public-shell.tsx) | `navItems` tĩnh và props `labels` | Điều hướng chính toàn trang public | Không kết nối DB | **Thấp** (Menu điều hướng ít khi thay đổi, nhưng logo đang viết cứng) | **PARTIAL** | Logo `/logo-final.svg` đang hard-code, nên lấy từ cấu hình `logo_media_id` trong `site_settings`. |
| **Public Layout** | Mega Menu | [public-shell.tsx](file:///d:/THCode/AI/furniture-website/components/showroom/public-shell.tsx) | `brandCatalog`, `productGroups`, `products`, `typeCatalogSections` từ `lib/showroom-data.ts` | Hiển thị danh mục sản phẩm và thương hiệu đối tác trên menu thả xuống | Không kết nối DB | **Rất cao** (Khi admin thêm sản phẩm hoặc danh mục mới, Mega Menu sẽ không cập nhật) | **PARTIAL** | Cần refactor để Mega Menu gọi dữ liệu động từ DB thông qua các API/RSC reads của `product_categories` và bảng `brands` mới. |
| **Public Catalog** | Filter Panel | [product-filter-panel.tsx](file:///d:/THCode/AI/furniture-website/components/showroom/product-filter-panel.tsx) | Props `categories` động, các bộ lọc khác lấy từ `productTaxonomy` tĩnh trong `lib/showroom-data.ts` | Hỗ trợ bộ lọc đa chiều (danh mục, chất liệu, phòng, style, tông màu...) | Lọc phía client sau khi fetch tối đa 1000 sản phẩm | **Cao** (Các tùy chọn chất liệu, phong cách, bộ sưu tập bị cố định trong mã nguồn) | **PARTIAL** | Cần chuyển đổi sang lọc phía server qua SQL/RPC, đọc các tùy chọn lọc động từ bảng cấu hình hoặc bảng thuộc tính sản phẩm. |
| **Public Catalog** | ProductCard | [product-card.tsx](file:///d:/THCode/AI/furniture-website/components/showroom/product-card.tsx) | Props `product` truyền vào | Hiển thị thông tin tóm tắt sản phẩm trong danh sách | Map với các trường của `Product` trong data mẫu | **Trung bình** (Kiểu dữ liệu DB trả về chưa được mapping đồng nhất với props của card) | **DONE** (Về mặt UI) | Thiếu hiển thị giá khuyến mãi/giá combo và nhãn chương trình ưu đãi đang áp dụng. |
| **Public Detail** | Product Gallery | [product-detail-experience.tsx](file:///d:/THCode/AI/furniture-website/components/showroom/product-detail-experience.tsx) | `product.gallery` | Trình diễn ảnh chính và ảnh chi tiết sản phẩm | Map với bảng `product_media` join `media_assets` | **Thấp** (Nhưng bị hiển thị ảnh rỗng do mutations admin lỗi không chèn ảnh) | **PARTIAL** | Cần sửa mutations ghi media ở admin để ảnh hiển thị đúng trên trang chi tiết. |
| **Public Detail** | Product Information Tabs | [product-detail-experience.tsx](file:///d:/THCode/AI/furniture-website/components/showroom/product-detail-experience.tsx) | `product.specs` và description | Hiển thị chi tiết thông số kỹ thuật, bảo quản, giao hàng | `product_translations.description_json` | **Cao** (Các tab như Giao hàng & Bảo quản đang dùng chung text tĩnh thay vì cấu hình riêng cho từng sản phẩm) | **PARTIAL** | Cần bổ sung các trường thông tin chi tiết vào bảng dịch thuật hoặc lưu trữ có cấu trúc trong `description_json`. |
| **Public Layout** | Footer & Newsletter Form | [public-shell.tsx](file:///d:/THCode/AI/furniture-website/components/showroom/public-shell.tsx) | State cục bộ `newsletterSent` | Hiển thị chân trang và thu thập email đăng ký nhận tin của khách hàng | Không kết nối DB | **Cao** (Form newsletter chỉ mock UI, gửi xong không lưu trữ) | **PARTIAL** | Cần tạo bảng `newsletter_subscribers` trong DB và viết API/Action lưu email gửi lên. |
| **Public Layout** | Float Action Button (FAB) | [public-shell.tsx](file:///d:/THCode/AI/furniture-website/components/showroom/public-shell.tsx) | Tĩnh trong component | Cung cấp liên hệ nhanh (Zalo, Messenger, Hotline) | Không kết nối DB | **Trung bình** (Thông tin liên hệ nhúng cứng thay vì đọc từ cấu hình) | **DONE** (Về mặt UI) | Cần kết nối với cấu hình liên hệ của `site_settings`. |
| **Admin Layout** | Admin Shell / Sidebar | [admin-shell.tsx](file:///d:/THCode/AI/furniture-website/components/showroom/admin-shell.tsx) | `navigation` list | Điều hướng menu quản trị CMS | Phân quyền vai trò dựa trên profiles | **Thấp** | **DONE** | Đã loại bỏ tab Media theo yêu cầu của khách hàng, phân quyền ẩn hiện menu theo Editor/Admin hoạt động tốt. |
| **Admin Pages** | DataTable | [admin-pages.tsx](file:///d:/THCode/AI/furniture-website/components/showroom/admin-pages.tsx) | Props truyền vào | Component hiển thị danh sách dạng bảng cho toàn bộ admin | Gọi các API/RSC reads tương ứng | **Thấp** | **PARTIAL** | Thiếu các tính năng vận hành quan trọng: chọn nhiều hàng (bulk actions), bộ lọc nâng cao, xuất báo cáo. |
| **Admin Pages** | ContentEditorForm | [admin-workflows.tsx](file:///d:/THCode/AI/furniture-website/components/showroom/admin-workflows.tsx) | Form state | Form dùng chung để tạo/sửa Product, Blog, Showroom, Category | Gửi dữ liệu qua Server Actions | **Thấp** | **PARTIAL** | Bị lỗi nghiêm trọng ở mutations: bỏ qua việc liên kết ảnh bìa và gallery vào các bảng media tương ứng. |
| **Admin Pages** | AI Assistant Panel | [admin-workflows.tsx](file:///d:/THCode/AI/furniture-website/components/showroom/admin-workflows.tsx) | State cục bộ giả lập | Hỗ trợ admin dịch thuật và viết nháp nội dung/SEO bằng AI | Mock `setTimeout` | **Rất cao** (Chưa kết nối Gemini API thực tế) | **PARTIAL** | Cần viết API kết nối SDK Gemini, giải mã API key từ `integration_secrets` để thực hiện tác vụ thật. |
| **Admin Pages** | SettingsOperationsPanel | [admin-workflows.tsx](file:///d:/THCode/AI/furniture-website/components/showroom/admin-workflows.tsx) | LocalStorage (`pd-cms-settings`) | Cấu hình cài đặt toàn hệ thống và lưu API keys | Không kết nối DB | **Rất cao** (Lưu API keys ở client-side localStorage gây rò rỉ bảo mật nghiêm trọng) | **PARTIAL** | Cần xây dựng API `/api/admin/settings` (GET/PUT) để đọc/ghi DB bảo mật và mã hóa API Keys trên server. |

---

## 3. BUSINESS-RULE AUDIT BY DOMAIN

### Domain: Product
*   **Business Goal:** Quản lý thông tin chi tiết các sản phẩm nội thất cao cấp, thiết bị vệ sinh tinh xảo và gạch ốp lát khổ lớn. Đảm bảo hiển thị đầy đủ thông số kỹ thuật đặc thù, khoảng giá hoặc giá liên hệ, và khả năng trưng bày tại showroom.
*   **Current Implementation:** Sử dụng bảng `products` chứa thông tin kỹ thuật cơ bản và `product_translations` cho nội dung song ngữ.
*   **What is good:** Hỗ trợ slug song ngữ, mã tham chiếu sản phẩm (`reference_code`), phân biệt trạng thái nháp/xuất bản/lưu trữ rõ ràng.
*   **What is missing:** Thiếu các thuộc tính động theo ngành hàng (nội thất cần loại gỗ, da/nỉ, màu sơn; gạch cần bề mặt mờ/bóng, độ mài mòn, xuất xứ; thiết bị vệ sinh cần chế độ xả, áp lực nước...). Hiện tại các thông tin này đang được dồn chung vào một trường văn bản dịch tự do, khiến việc phân loại và lọc sản phẩm ở trang catalog gặp khó khăn.
*   **What is risky:** Cho phép lưu khoảng giá bất hợp lý (ví dụ: `price_min` > `price_max`). Thiếu cơ chế theo dõi lịch sử thay đổi giá gốc/giá khuyến mãi.
*   **Recommended Business Model:** Bổ sung thực thể thuộc tính sản phẩm (`product_attributes`) để lưu trữ các cặp key-value thuộc tính động theo danh mục sản phẩm, giúp chuẩn hóa bộ lọc catalog.
*   **Required DB Changes:** Thêm cột `brand_id` (khóa ngoại) liên kết bảng thương hiệu; thêm điều kiện ràng buộc check constraint (`price_max >= price_min` hoặc `price_min >= 0`).
*   **Required API Changes:** Cập nhật các hàm truy vấn sản phẩm công cộng và admin để trả về thông tin thương hiệu và danh sách thuộc tính động.
*   **Required Admin UI Changes:** Tại form thêm/sửa sản phẩm, thiết kế khu vực chọn thuộc tính kỹ thuật động tùy chọn theo Category đã chọn, thay vì bảng thuộc tính tự gõ thủ công dễ sai sót.
*   **Priority:** **HIGH**

---

### Domain: Category
*   **Business Goal:** Phân loại sản phẩm theo cấu trúc cây đa cấp (Danh mục cha -> danh mục con -> danh mục cháu) để khách hàng dễ dàng điều hướng và tìm kiếm sản phẩm tại showroom nội thất quy mô lớn.
*   **Current Implementation:** Bảng `product_categories` hỗ trợ liên kết đệ quy thông qua cột `parent_id`.
*   **What is good:** DB schema đã sẵn sàng cho cấu trúc danh mục phân cấp.
*   **What is missing:** Giao diện quản lý danh mục trong admin (`admin-workflows.tsx`) chỉ hiển thị danh sách phẳng, hoàn toàn thiếu luồng quản trị dạng cây (Tree view). Khi thêm/sửa danh mục, admin chỉ có thể chọn danh mục cha bằng dropdown phẳng không phân cấp, rất khó quản lý khi số lượng danh mục lớn.
*   **What is risky:** Nguy cơ tạo vòng lặp vô hạn khi gán danh mục cha-con chéo nhau (ví dụ: A là cha của B, B lại được sửa thành cha của A) làm sập ứng dụng ở tầng dựng cây đệ quy.
*   **Recommended Business Model:** Áp dụng ràng buộc nghiệp vụ ngăn chặn vòng lặp đệ quy ở tầng database hoặc middleware/proxy.ts trước khi lưu.
*   **Required DB Changes:** Thêm RPC function kiểm tra vòng lặp danh mục trước khi thực hiện UPDATE/INSERT `parent_id`.
*   **Required API Changes:** Cập nhật API lấy danh mục trả về cấu hình cây phân cấp hoàn chỉnh thay vì danh sách phẳng.
*   **Required Admin UI Changes:** Thay thế DataTable phẳng của danh mục bằng giao diện cây thư mục (Tree View DataTable) hỗ trợ kéo thả hoặc hiển thị thụt đầu dòng rõ ràng.
*   **Priority:** **MEDIUM**

---

### Domain: Brand
*   **Business Goal:** Quản lý danh sách các thương hiệu đối tác cao cấp (như Kohler, Grohe, American Standard, Hafele...). Sử dụng làm tiêu chí lọc chính trên trang catalog sản phẩm và hiển thị thông tin chi tiết của hãng.
*   **Current Implementation:** **THIẾU HOÀN TOÀN TẦNG DATABASE**. Thương hiệu hiện tại chỉ là một trường text tĩnh lưu trong cột `brand_series` của bảng `products` và mảng tĩnh trong `lib/showroom-data.ts`.
*   **What is good:** FE có giao diện brand marquee hiển thị logo đối tác khá đẹp nhưng hoàn toàn là tĩnh.
*   **What is missing:** Thiếu bảng `brands` trong database để lưu tên hãng, logo (khóa ngoại liên kết `media_assets`), mô tả xuất xứ, trạng thái hoạt động. Thiếu màn hình quản lý thương hiệu trong Admin.
*   **What is risky:** Việc nhập thương hiệu dưới dạng text tự do ở form sản phẩm dễ dẫn đến sai lệch dữ liệu do gõ sai chính tả (ví dụ: "Kohler" vs "Kohller"), làm hỏng hoàn toàn độ chính xác của bộ lọc thương hiệu ở trang Catalog.
*   **Recommended Business Model:** Tạo thực thể `brands` độc lập, chuẩn hóa quan hệ một-nhiều (`products.brand_id` -> `brands.id`).
*   **Required DB Changes:** Tạo bảng `brands` và bảng dịch thuật `brand_translations`. Cập nhật bảng `products` thêm cột khóa ngoại `brand_id`.
*   **Required API Changes:** Xây dựng bộ API/Server Actions CRUD cho thương hiệu.
*   **Required Admin UI Changes:** Xây dựng màn hình danh sách thương hiệu và form thêm/sửa thương hiệu trong Admin. Thay thế input text nhập hãng ở form sản phẩm bằng dropdown chọn thương hiệu từ DB.
*   **Priority:** **HIGH (Business-critical gap)**

---

### Domain: Promotion
*   **Business Goal:** Quản lý các chương trình khuyến mãi, chiết khấu, và các gói combo sản phẩm đồng bộ (như combo phòng tắm Wellness Bath, combo phòng khách Heritage Walnut). Khuyến mãi có thể áp dụng linh hoạt theo sản phẩm cụ thể, theo danh mục (Category) hoặc theo hãng (Brand), và có thời hạn hiệu lực rõ ràng.
*   **Current Implementation:** Bảng `promotions` cơ bản chỉ lưu mã code và % giảm giá. **Màn hình quản trị admin chưa được xây dựng**. Trang khuyến mãi public hoàn toàn là dữ liệu hard-code tĩnh.
*   **What is good:** DB schema cơ bản có các cột thời gian bắt đầu (`start_at`) và kết thúc (`end_at`) hỗ trợ đặt lịch.
*   **What is missing:**
    1.  Thiếu bảng liên kết nhiều-nhiều hoặc bảng đích áp dụng (`promotion_targets`) để chỉ định chương trình khuyến mãi áp dụng cho những sản phẩm/danh mục/hãng nào.
    2.  Thiếu các cột thông tin phục vụ hiển thị Combo phức tạp (như ảnh combo, giá combo tổng thể, giá gốc combo, danh sách sản phẩm đi kèm).
    3.  Thiếu màn hình quản lý chương trình khuyến mãi trong admin.
*   **What is risky:**
    1.  Xung đột khuyến mãi: Khi một sản phẩm cùng lúc thuộc nhiều chương trình khuyến mãi (ví dụ: vừa có khuyến mãi theo hãng 10%, vừa có khuyến mãi combo 15%), thiếu quy tắc ưu tiên (Priority) hoặc chặn cộng dồn khuyến mãi.
    2.  Mất dấu giá lịch sử: Khi gửi yêu cầu báo giá cho sản phẩm đang khuyến mãi, hệ thống không lưu lại giá trị khuyến mãi tại thời điểm báo giá. Nếu sau này khuyến mãi hết hạn, lead ghi nhận trong admin sẽ hiển thị sai giá trị mà khách hàng đã đồng ý gửi.
*   **Recommended Business Model:** Khuyến mãi cần được tách biệt thành hai loại: Giảm giá trực tiếp (áp dụng lên sản phẩm/category/brand) và Combo ưu đãi (gói sản phẩm bán chung với giá đặc biệt). Thêm cơ chế chụp ảnh giá trị khuyến mãi (Price Snapshot) lưu thẳng vào lead.
*   **Required DB Changes:**
    *   Thêm cột `cover_media_id` (ảnh combo), `combo_price`, `original_price`, và `metadata_jsonb` (lưu danh sách sản phẩm đi kèm dạng text hoặc JSON) vào bảng `promotions`.
    *   Tạo bảng `promotion_targets` để cấu hình đối tượng áp dụng khuyến mãi.
*   **Required API Changes:** Xây dựng API đọc/ghi khuyến mãi động thay vì mock.
*   **Required Admin UI Changes:** Xây dựng màn hình quản trị Promotions đầy đủ (danh sách, form tạo/sửa khuyến mãi, chọn sản phẩm/danh mục áp dụng).
*   **Priority:** **HIGH (Business-critical gap)**

---

### Domain: Showroom
*   **Business Goal:** Giới thiệu mạng lưới showroom thực tế của thương hiệu, cung cấp thông tin liên hệ trực tiếp, giờ mở cửa, bản đồ nhúng chỉ đường và hình ảnh không gian trưng bày để thu hút khách hàng đến trải nghiệm trực tiếp.
*   **Current Implementation:** Bảng `showrooms` lưu trữ hotline, vị trí (lat/long), link Google Maps và bảng dịch thuật địa chỉ.
*   **What is good:** Đã có RPC hỗ trợ lấy danh sách showroom công cộng động.
*   **What is missing:** Thiếu trường liên kết tồn kho/trưng bày (sản phẩm X có trưng bày thực tế tại showroom Y hay không). Hiện tại trường `availability` trong sản phẩm chỉ ghi chung chung "Có tại showroom" dưới dạng text dịch, khách hàng không thể biết cụ thể showroom nào đang có sẵn mẫu để đến xem.
*   **What is risky:** Link nhúng Google Maps (`google_maps_embed_url`) nếu không được kiểm soát an toàn có thể bị lợi dụng để chèn mã độc iframe. Cần validate định dạng URL trước khi lưu.
*   **Recommended Business Model:** Thêm mối quan hệ nhiều-nhiều giữa sản phẩm và showroom để cấu hình vị trí trưng bày sản phẩm (`product_showroom_display`).
*   **Required DB Changes:** Tạo bảng trung gian `product_showroom_display` (join `products` và `showrooms`).
*   **Required API Changes:** Cập nhật API chi tiết sản phẩm để trả về danh sách các địa chỉ showroom đang trưng bày sản phẩm này.
*   **Required Admin UI Changes:** Thêm phần chọn danh sách showroom trưng bày sản phẩm trong form chỉnh sửa sản phẩm.
*   **Priority:** **MEDIUM**

---

### Domain: Quote / Lead
*   **Business Goal:** Tiếp nhận các yêu cầu báo giá từ khách hàng thông qua các form liên hệ toàn trang, lưu trữ bảo mật thông tin lead, phân công nhân viên kinh doanh xử lý, và theo dõi tiến độ chuyển đổi cơ hội bán hàng.
*   **Current Implementation:** Form public gửi dữ liệu qua API `/api/contact`, lưu vào bảng `quote_requests`, queue gửi email Resend qua bảng `quote_notifications`. Admin xem chi tiết qua QuoteDetailDialog.
*   **What is good:** Đã có persistence lưu trữ lead vào DB, có honeypot chống spam và sliding-window rate limit bảo vệ API. Phân quyền chỉ Admin mới được xem lead rất an toàn.
*   **What is missing:** Thiếu cơ chế phân công sales phụ trách (`assigned_to`); thiếu trường ghi chú tiến độ tư vấn (`sales_notes`); thiếu lịch sử chuyển trạng thái xử lý (Status audit trail: New -> Contacted -> Quoted -> Won/Lost). Thiếu tính năng xuất danh sách lead ra file Excel/CSV phục vụ xử lý offline.
*   **What is risky:** SQL error tại API contact dòng 127 khi ghi nhận lỗi gửi email (gọi sai tên cột `error_detail` thay vì `last_error` trong bảng `quote_notifications`) làm sập API và mất lead nếu Resend gặp sự cố.
*   **Recommended Business Model:** Lead cần có vòng đời xử lý rõ ràng. Bổ sung cơ chế chụp ảnh giá sản phẩm/khuyến mãi (Price Snapshot) tại thời điểm khách hàng gửi yêu cầu để lưu giữ bằng chứng giao dịch.
*   **Required DB Changes:**
    *   Sửa cột `error_detail` thành `last_error` trong code.
    *   Thêm cột `assigned_to` (UUID references `profiles`), `sales_notes` (text), `snapshot_price` (numeric), `snapshot_promo_price` (numeric) vào bảng `quote_requests`.
    *   Tạo bảng `quote_status_history` để ghi nhận nhật ký chuyển trạng thái xử lý.
*   **Required API Changes:** Cập nhật API gửi contact để tự động chụp ảnh giá sản phẩm tại thời điểm đó và lưu vào DB. Tạo API cập nhật ghi chú tư vấn và phân công nhân viên phụ trách.
*   **Required Admin UI Changes:**
    *   Thêm nút "Xuất Excel" trên trang danh sách Quotes.
    *   Trong dialog xem chi tiết Quote, bổ sung dropdown chọn nhân viên xử lý và khung nhập ghi chú tiến độ tư vấn của sales.
*   **Priority:** **HIGH**

---

### Domain: Blog / Content
*   **Business Goal:** Biên soạn và xuất bản các bài viết chia sẻ kiến thức thiết kế nội thất, tư vấn lựa chọn thiết bị vệ sinh song ngữ để tăng trưởng SEO tự nhiên và xây dựng uy tín thương hiệu.
*   **Current Implementation:** Bảng `blog_posts` và `blog_post_translations` lưu thông tin bài viết và nội dung chi tiết dạng JSONB.
*   **What is good:** Dựng tự động mục lục bài viết (TOC) phía client, có takeaways tóm tắt và ghi chú thực địa thiết kế đẹp mắt.
*   **What is missing:** Hiện tại cấu trúc outline phục vụ mục lục (TOC) đang được client tự phân tích từ thẻ heading trong HTML bằng JS. Điều này không tối ưu cho SEO và có thể gây lệch layout nếu admin viết thẻ heading không chuẩn. Nên lưu cấu trúc TOC có tổ chức trong DB. Thiếu bảng quản lý Tags bài viết.
*   **What is risky:** Chưa có cơ chế tự động lưu bản nháp (Autosave) ở form viết bài, admin dễ mất dữ liệu khi kết nối mạng không ổn định. Lỗi mutations làm mất ảnh cover của bài viết.
*   **Recommended Business Model:** Bổ sung thực thể bài viết liên quan (Related posts) do admin tự cấu hình thay vì chỉ lấy ngẫu nhiên cùng category.
*   **Required DB Changes:** Thêm bảng trung gian `blog_post_tags` và `blog_related_posts`.
*   **Required API Changes:** Sửa mutation `createAdminBlogPost` và `updateAdminBlogPost` để gán đúng ID ảnh bìa vào cột `cover_media_id` trong bảng `blog_posts`. Cập nhật query chi tiết bài viết để trả về đầy đủ ảnh bìa thật thay vì chuỗi rỗng.
*   **Required Admin UI Changes:** Thêm dropzone tải ảnh bìa hoạt động tốt, tích hợp công cụ soạn thảo trực quan (Rich Text Editor) tạo tiêu chuẩn heading rõ ràng để sinh TOC chính xác.
*   **Priority:** **HIGH**

---

### Domain: Admin Users / Roles / Permissions
*   **Business Goal:** Bảo vệ dữ liệu doanh nghiệp thông qua phân quyền vai trò (Role Model A). Đảm bảo chỉ Admin mới có quyền quản lý nhân viên, xem thông tin báo giá khách hàng và cấu hình hệ thống. Editor chỉ được phép quản lý nội dung sản phẩm, danh mục, bài viết và showroom.
*   **Current Implementation:** Vai trò được lưu trong bảng `profiles.role` ('admin' hoặc 'editor').
*   **What is good:** Layout admin và Next.js Route Guard (chạy qua `proxy.ts` trên Next.js 16.2.6) đã bảo vệ chặn truy cập cấp routing rất tốt. RPC database cũng phân biệt quyền.
*   **What is missing:** Màn hình quản lý người dùng `/admin/users` đang hiển thị dữ liệu tĩnh mẫu. Thiếu API kết nối với Supabase Auth để quản trị viên có thể trực tiếp tạo tài khoản nhân viên mới (Editor) từ CMS admin mà không cần vào Supabase Console.
*   **What is risky:** Nếu một tài khoản nhân viên bị vô hiệu hóa (`is_active = false`), token JWT hiện tại của Supabase Auth của họ vẫn có thể hoạt động cho đến khi hết hạn (thường là 1 giờ). Cần cơ chế kiểm tra trạng thái hoạt động thực tế trên mỗi yêu cầu Server Action hoặc API call.
*   **Recommended Business Model:** Tích hợp quy trình vô hiệu hóa tài khoản ngay lập tức (instant revocation) bằng cách kiểm tra cột `is_active` của bảng `profiles` tại Route Guard (`proxy.ts`).
*   **Required DB Changes:** Không cần thay đổi lớn. Bảng `profiles` đã có cột `is_active`.
*   **Required API Changes:** Viết API quản lý tài khoản nhân viên gọi Supabase Admin Auth API để CRUD users một cách an toàn từ phía server.
*   **Required Admin UI Changes:** Kết nối màn hình quản lý users với DB thực tế. Bổ sung form tạo tài khoản nhân viên mới và checkbox bật/tắt trạng thái hoạt động của nhân viên.
*   **Priority:** **HIGH**

---

### Domain: Site Settings / SEO / AI Assistant
*   **Business Goal:** Cho phép quản trị viên cấu hình linh hoạt thông tin nhận diện thương hiệu, thông tin liên hệ chân trang, các thông số SEO mặc định, cấu hình các cổng dịch vụ bên thứ ba (Resend, Cloudinary, Gemini) và sử dụng trợ lý AI tạo nháp nội dung song ngữ tại chỗ.
*   **Current Implementation:** Dữ liệu đang được lưu cục bộ ở `localStorage` của trình duyệt. AI Assistant giả lập.
*   **What is good:** Form cấu hình đã thiết kế giao diện rất đầy đủ các tab chức năng.
*   **What is missing:** API `/api/admin/settings` và `/api/admin/ai/generate-draft` thực tế kết nối DB và Gemini SDK. Cơ chế mã hóa và giải mã API keys an toàn trên server.
*   **What is risky:** Việc lưu trữ API keys (Resend, Gemini) dưới dạng clear-text trong localStorage phía client cực kỳ nguy hiểm, dễ bị đánh cắp thông qua các cuộc tấn công XSS hoặc truy cập trái phép. Phải chuyển ngay việc lưu trữ này xuống bảng `integration_secrets` bảo mật ở server.
*   **Recommended Business Model:** Singleton Site Settings: Chỉ cho phép duy nhất một bản ghi cấu hình hoạt động trong hệ thống. Quản lý khóa API bằng AES-GCM-256 mã hóa đối xứng, sử dụng một khóa môi trường bí mật (`AI_SECRET_ENCRYPTION_KEY`) chỉ nằm trên server.
*   **Required DB Changes:** Đã có bảng `site_settings`, `site_setting_translations` và `integration_secrets`.
*   **Required API Changes:** Xây dựng API GET/PUT `/api/admin/settings` thực hiện đọc/ghi database và mã hóa các trường API keys nhạy cảm trước khi chèn vào `integration_secrets`. Tạo API POST `/api/admin/ai/generate-draft` gọi trực tiếp SDK Gemini.
*   **Required Admin UI Changes:** Liên kết form cấu hình với API mới. Loại bỏ hoàn toàn mã nguồn tương tác với `localStorage`. Thay thế các giá trị mock ở AI Assistant bằng luồng gọi API Gemini thực tế.
*   **Priority:** **HIGH (Security & Functional Priority)**

---

## 4. ADMIN-OPERATIONAL AUDIT

Đánh giá chi tiết khả năng vận hành thực tế của các màn hình quản trị trong CMS Admin:

| Page | Entity | Columns đang có | Columns nên có thêm | Search | Filter | Sort | Pagination | Bulk actions | Export | Operational verdict |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Products List** | `products` | Reference Code, Name, Category, Price Range, Status, Featured, Updated At | Thumbnail (Ảnh bìa thu nhỏ), Brand (Thương hiệu), Stock Availability (Tính sẵn sàng), Translation Status (Tình trạng dịch vi/en) | Có (theo tên, mã code) | Theo Category, Brand, Trạng thái, Nổi bật | Theo tên, ngày cập nhật, thứ tự sắp xếp | Có | Đổi trạng thái hàng loạt, Xóa tạm | Không | **PARTIAL:** Giao diện DataTable cơ bản tốt nhưng thiếu ảnh thumbnail khiến admin khó nhận diện sản phẩm nhanh. Thiếu cột Brand do thiếu thực thể Brand trong DB. |
| **Categories List** | `product_categories` | Name, Group Key, Sort Order, Status | Parent Category (Danh mục cha), Product Count (Số sản phẩm trực thuộc) | Có (theo tên danh mục) | Theo Group Key, Trạng thái | Theo sort_order, tên danh mục | Có | Đổi trạng thái, Xóa | Không | **PARTIAL:** Thiếu thông tin phân cấp cha-con trực quan và số lượng sản phẩm trực thuộc khiến admin khó dọn dẹp các danh mục trống hoặc sắp xếp lại cấu trúc. |
| **Showrooms List** | `showrooms` | Name, Code, Hotline, Address, Opening Hours, Status | Google Maps Embed Status (Trạng thái nhúng map), Cover Image Status (Trạng thái ảnh bìa) | Có (theo tên, địa chỉ) | Theo Trạng thái | Theo mã showroom, tên | Có | Không | Không | **DONE:** Đáp ứng đầy đủ thông tin vận hành, cần sửa lỗi mutations để lưu được ảnh chính showroom vào DB. |
| **Blog List** | `blog_posts` | Title, Category, Author, Published At, Status | Cover Thumbnail (Ảnh bìa thu nhỏ), View Count (Lượt xem), Translation Status (Độ hoàn thiện bản dịch) | Có (theo tiêu đề) | Theo Danh mục bài viết, Trạng thái, Tác giả | Theo ngày xuất bản, ngày cập nhật | Có | Xuất bản hàng loạt, Lưu trữ hàng loạt | Không | **PARTIAL:** Thiếu ảnh thumbnail và chỉ số lượt xem để đánh giá hiệu quả bài viết. |
| **Quotes List** | `quote_requests` | Customer Name, Phone, Email, Interested Product/Service, Created At, Status | Source Page (Trang gửi yêu cầu), Assigned Staff (Nhân viên phụ trách), Sales Notes (Ghi chú tiến độ) | Có (theo tên khách hàng, SĐT, email) | Theo Trạng thái xử lý, Nhân viên phụ trách, Dịch vụ/Sản phẩm quan tâm | Theo ngày tạo (mới nhất trước), Trạng thái | Có | Giao việc cho sales hàng loạt, Đổi trạng thái hàng loạt | **Cần có** (Xuất CSV/Excel leads) | **PARTIAL:** Rất thiếu các công cụ xử lý nghiệp vụ bán hàng như phân công sales, cập nhật ghi chú tư vấn và xuất leads ra file Excel để giao việc offline cho sales. |
| **Users List** | `profiles` | Email, Role, Scope, Status | Full Name (Họ tên), Last Login (Đăng nhập cuối), Created At (Ngày tạo) | Có (theo tên, email) | Theo Vai trò, Trạng thái hoạt động | Theo ngày tạo, lần đăng nhập cuối | Có | Khóa tài khoản hàng loạt | Không | **MISSING:** Trang đang dùng danh sách mock cứng hoàn toàn, chưa thể tạo mới tài khoản nhân viên thật kết nối Auth Supabase. |
| **Promotions List** | `promotions` | **THIẾU HOÀN TOÀN** | ID, Code, Title, Discount %, Duration (Thời hạn), Status | Cần có | Theo Trạng thái hiệu lực (Đang diễn ra/Đã kết thúc), Loại ưu đãi | Theo ngày bắt đầu, ngày kết thúc, mức giảm giá | Có | Tạm dừng chương trình hàng loạt | Cần có (Báo cáo doanh số/click) | **MISSING CRITICAL:** Thiếu hẳn màn hình danh sách và form tạo mới khuyến mãi khiến admin không thể chủ động vận hành các chương trình marketing ưu đãi. |
| **Brands Management** | `brands` | **THIẾU HOÀN TOÀN** | ID, Brand Name, Logo, Origin, Product Count, Status | Cần có | Theo Xuất xứ, Trạng thái | Theo tên, số sản phẩm | Có | Thay đổi trạng thái | Không | **MISSING CRITICAL:** Thiếu module quản lý thương hiệu khiến Mega menu và bộ lọc catalog bị bó cứng trong file dữ liệu tĩnh. |

---

## 5. DATA MODEL FIT AUDIT

Đánh giá mức độ phù hợp của mô hình cơ sở dữ liệu Supabase PostgreSQL hiện tại đối với các yêu cầu nghiệp vụ thực tế và khả năng mở rộng:

1.  **Thiếu thực thể Thương hiệu (Brand):** DB hiện tại không có bảng `brands`. Việc lưu thương hiệu dưới dạng chuỗi văn bản (`products.brand_series`) vi phạm nguyên tắc chuẩn hóa dữ liệu (1NF/2NF) và làm hỏng tính toàn vẹn dữ liệu khi nhập liệu sai.
2.  **Khuyến mãi bị giới hạn ở 1-1 hoặc 1-nhiều tĩnh:** Trường `products.promotion_id` hiện tại chỉ cho phép một sản phẩm liên kết với một chương trình khuyến mãi duy nhất tại một thời điểm. Nó không hỗ trợ việc áp dụng khuyến mãi linh hoạt cho toàn bộ một danh mục sản phẩm (Category) hoặc một thương hiệu (Brand) mà không phải cập nhật từng dòng sản phẩm.
3.  **Thiếu Audit Columns toàn diện:** Một số bảng cốt lõi (như `product_categories`, `showrooms`) thiếu các trường theo dõi người tạo/người cập nhật (`created_by`, `updated_by`) và thời gian cập nhật (`updated_at`), gây khó khăn cho việc truy vết nhật ký hành động trong Audit Logs của admin.
4.  **Thiếu cơ chế lưu vết giá (Price Snapshot):** Bảng `quote_requests` không lưu trữ giá gốc và giá khuyến mãi của sản phẩm tại thời điểm khách hàng gửi yêu cầu báo giá. Nếu sau này sản phẩm thay đổi giá bán hoặc chương trình khuyến mãi kết thúc, thông tin báo giá cũ trong hệ thống sẽ bị sai lệch giá trị lịch sử.

### Đề xuất schema nâng cấp chi tiết:

| Table | Thay đổi đề xuất | Lý do business | Mức độ ảnh hưởng | Ưu tiên |
| :--- | :--- | :--- | :--- | :--- |
| **[NEW] brands** | Tạo bảng `brands` (`id`, `logo_media_id`, `origin`, `status`, `sort_order`, `created_at`, `updated_at`) | Quản lý danh sách thương hiệu đối tác chuẩn hóa, làm nguồn dữ liệu cho Mega menu và bộ lọc. | Trung bình (Chỉ ảnh hưởng gián tiếp đến sản phẩm) | **HIGH** |
| **[NEW] brand_translations** | Tạo bảng dịch thuật song ngữ cho thương hiệu (`brand_id`, `locale`, `name`, `description`). | Đảm bảo tính song ngữ (VI/EN) cho thông tin thương hiệu. | Thấp | **HIGH** |
| **products** | Thêm cột `brand_id` (khóa ngoại references `brands.id`), loại bỏ trường text `brand_series`. | Liên kết sản phẩm với thương hiệu đã được chuẩn hóa. | Cao (Ảnh hưởng đến các truy vấn sản phẩm hiện tại) | **HIGH** |
| **promotions** | Thêm cột `cover_media_id` (ảnh combo), `combo_price` (giá combo), `original_price` (giá gốc combo), và `metadata_jsonb` (lưu sản phẩm đi kèm). Loại bỏ `promotion_id` khỏi bảng `products`. | Hỗ trợ cấu hình combo khuyến mãi động và các thông số hiển thị phụ trên giao diện. | Cao (Thay đổi cấu trúc khuyến mãi sản phẩm) | **HIGH** |
| **[NEW] promotion_targets** | Tạo bảng trung gian `promotion_targets` (`id`, `promotion_id`, `target_type` ['product'/'category'/'brand'/'all'], `target_id`) | Cho phép áp dụng một khuyến mãi cho nhiều sản phẩm, danh mục hoặc thương hiệu khác nhau. | Cao (Chuyển đổi quan hệ khuyến mãi từ 1-N sang N-N) | **HIGH** |
| **quote_requests** | Thêm cột `assigned_to` (references `profiles`), `sales_notes` (text), `snapshot_price` (numeric), `snapshot_promo_price` (numeric). | Phục vụ quy trình phân công xử lý lead của sales và lưu vết giá trị báo giá tại thời điểm gửi. | Trung bình (Không ảnh hưởng đến public FE) | **HIGH** |
| **[NEW] quote_status_history** | Tạo bảng lưu nhật ký chuyển trạng thái Quote (`quote_request_id`, `old_status`, `new_status`, `changed_by`, `changed_at`, `notes`). | Lưu audit trail quá trình xử lý yêu cầu báo giá của khách hàng. | Thấp | **MEDIUM** |
| **product_categories** | Thêm các trường audit `created_by`, `updated_by` (references `profiles.id`), `updated_at`. | Truy vết đầy đủ hoạt động tạo/sửa danh mục sản phẩm trong Audit Logs. | Thấp | **MEDIUM** |

---

## 6. END-TO-END TRACEABILITY MATRIX

Bản đồ truy vết từ tính năng nghiệp vụ qua các thành phần kỹ thuật nhằm phát hiện khoảng hở (Gaps):

| Feature | Business goal | FE pages/components | API/actions | DB tables | Gaps | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Xem danh sách sản phẩm** | Khách hàng tìm hiểu catalog sản phẩm để chọn lựa mẫu mã. | `/[locale]/products/page.tsx`, `ProductCard` | RSC Query `getProducts` | `products`, `product_translations`, `product_media`, `media_assets` | Mega menu vẫn đọc từ file mock tĩnh thay vì DB; chưa hiển thị nhãn khuyến mãi trên thẻ sản phẩm. | **MEDIUM** |
| **Lọc sản phẩm nâng cao** | Khách hàng lọc sản phẩm nhanh chóng theo chất liệu, phong cách, màu sắc. | `/[locale]/products/page.tsx`, `ProductFilterPanel` | Lọc Javascript chạy ở phía client | `product_categories` (chỉ lấy danh mục) | Bộ lọc nâng cao chạy 100% ở client sau khi tải 1000 sản phẩm, gây lag khi dữ liệu lớn; lọc thương hiệu bị hard-code do thiếu bảng `brands`. | **HIGH** |
| **Xem chi tiết sản phẩm** | Khách hàng xem thông số kỹ thuật, hình ảnh lớn và gửi yêu cầu báo giá cụ thể. | `/[locale]/products/[slug]/page.tsx`, `ProductGallery`, `ProductInformationTabs` | RSC Query `getProductBySlug` | `products`, `product_translations`, `product_media`, `media_assets` | Lỗi mutations admin làm mất hình ảnh của sản phẩm mới tạo; các tab như Giao hàng/Bảo quản dùng text tĩnh chung. | **HIGH** |
| **Gửi yêu cầu báo giá** | Thu thập thông tin lead chất lượng cao của khách hàng phục vụ kinh doanh. | `QuoteForm` (được nhúng ở nhiều trang) | POST `/api/contact` | `quote_requests`, `quote_notifications` | Lỗi SQL ở trường `error_detail` (đúng ra là `last_error`) làm hỏng API khi email Resend bị lỗi; thiếu lưu vết giá và phân công sales. | **HIGH** |
| **Xem chương trình khuyến mãi** | Thu hút khách hàng đăng ký mua hàng bằng các gói combo chiết khấu lớn. | `/[locale]/promotions/page.tsx` | Không có (Đang dùng dữ liệu tĩnh cứng) | `promotions`, `promotion_translations` | Trang khuyến mãi hoàn toàn không kết nối với database; DB thiếu các cột thông số hiển thị combo. | **HIGH** |
| **Tạo/sửa sản phẩm admin** | Biên tập viên cập nhật danh mục sản phẩm của showroom lên website. | `/admin/products/new`, `/[id]/edit`, `ContentEditorForm` | Server Actions `createAdminProduct`, `updateAdminProduct` | `products`, `product_translations`, `product_media` | Mutations bỏ qua hoàn toàn việc lưu ảnh bìa và gallery sản phẩm vào cơ sở dữ liệu. | **HIGH** |
| **Tạo/sửa showroom admin** | Cập nhật địa chỉ, hotline và giờ mở cửa các showroom thực tế. | `/admin/showrooms`, `admin-workflows.tsx` | Server Actions `createAdminShowroom`, `updateAdminShowroom` | `showrooms`, `showroom_translations`, `showroom_media` | Mutations bỏ qua việc lưu ảnh bìa showroom vào bảng `showroom_media`. | **HIGH** |
| **Tạo/sửa bài viết Blog admin** | Biên soạn và xuất bản tin tức tư vấn song ngữ chuẩn SEO. | `/admin/blog`, `admin-workflows.tsx` | Server Actions `createAdminBlogPost`, `updateAdminBlogPost` | `blog_posts`, `blog_post_translations` | Mutations bỏ qua việc lưu ảnh bìa bài viết vào cột `cover_media_id`. Query lấy bài viết trả về ảnh bìa rỗng. | **HIGH** |
| **Quản trị người dùng CMS** | Phân quyền vai trò và quản lý tài khoản nhân viên vận hành hệ thống CMS. | `/admin/users`, `admin-pages.tsx` | Không có (FE dùng danh sách tĩnh) | `profiles` | Chưa kết nối DB thực tế; thiếu API tạo tài khoản nhân viên liên kết Supabase Auth. | **HIGH** |
| **Cấu hình cài đặt settings** | Cấu hình thông tin liên hệ toàn trang, cài đặt SEO và quản lý API keys bảo mật. | `/admin/settings`, `SettingsOperationsPanel` | Không có (Đọc/ghi qua localStorage client) | `site_settings`, `site_setting_translations`, `integration_secrets` | Chưa kết nối DB; lưu API keys ở localStorage client rủi ro bảo mật XSS rất cao. | **HIGH (Security)** |

---

## 7. UX + CRUD COMPLETENESS MATRIX

Ma trận đánh giá mức độ hoàn thiện giao diện người dùng (UX) và các thao tác quản trị dữ liệu (CRUD):

| Module | Create | Read | Update | Delete/Archive | Publish Workflow | Form Validation | Permissions Guard | Localization | Verdict |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Products** | PARTIAL | DONE | PARTIAL | DONE | DONE | DONE | DONE | DONE | **PARTIAL** (Lỗi lưu hình ảnh trong mutations) |
| **Categories** | PARTIAL | DONE | PARTIAL | DONE | MISSING | DONE | DONE | DONE | **PARTIAL** (Không lưu được ảnh danh mục `image_media_id`) |
| **Brands** | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | **MISSING CRITICAL** (Thiếu hoàn toàn module quản lý) |
| **Promotions** | MISSING | PARTIAL | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | **MISSING CRITICAL** (Chỉ có trang public tĩnh, thiếu admin) |
| **Showrooms** | PARTIAL | DONE | PARTIAL | DONE | DONE | DONE | DONE | DONE | **PARTIAL** (Không lưu được ảnh showroom đại diện) |
| **Blog** | PARTIAL | DONE | PARTIAL | DONE | DONE | DONE | DONE | DONE | **PARTIAL** (Không lưu được ảnh bìa bài viết) |
| **Quotes** | DONE | DONE | PARTIAL | MISSING | N/A | DONE | DONE | DONE | **PARTIAL** (Thiếu ghi chú tư vấn, phân công sales và xuất file) |
| **Users** | MISSING | MISSING | MISSING | MISSING | N/A | MISSING | MISSING | N/A | **MISSING (Mocked)** (Chưa kết nối DB profiles thực tế) |
| **Settings** | N/A | PARTIAL | PARTIAL | N/A | N/A | PARTIAL | RISKY | DONE | **RISKY & PARTIAL** (Lưu API keys ở localStorage client) |

---

## 8. EXPANDED HARD-CODE AUDIT

Danh sách bổ sung các vị trí dữ liệu tĩnh (hard-code) hoặc cấu hình chưa đồng bộ cần được xử lý:

| File | Component / Dòng | Hard-code type | Current value | Nên chuyển sang đâu | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [public-shell.tsx](file:///d:/THCode/AI/furniture-website/components/showroom/public-shell.tsx) | `navItems` (dòng 59-66) | Danh sách menu điều hướng chính | Mảng tĩnh `home`, `products`, `promotions`... | Nên đọc từ file cấu hình hệ thống hoặc DB để dễ dàng tùy biến menu. | **LOW** |
| [public-shell.tsx](file:///d:/THCode/AI/furniture-website/components/showroom/public-shell.tsx) | Logo image (dòng 205-206) | Đường dẫn logo nhận diện thương hiệu | `src="/logo-final.svg"` | Chuyển sang đọc động từ cấu hình `logo_media_id` trong bảng `site_settings` join với `media_assets`. | **MEDIUM** |
| [public-shell.tsx](file:///d:/THCode/AI/furniture-website/components/showroom/public-shell.tsx) | Social links (Footer) | Các đường link mạng xã hội, hotline, zalo | Zalo, Messenger, Hotline nhúng cứng trong code | Đồng bộ trực tiếp từ cấu hình liên hệ của `site_settings` trong DB. | **MEDIUM** |
| [about/page.tsx](file:///d:/THCode/AI/furniture-website/app/%5Blocale%5D/about/page.tsx) | Capacity sections | Chỉ số năng lực showroom (20+ năm, 500+ sản phẩm...) | Chuỗi dịch tĩnh viết cứng trong code | Nên lưu vào bảng cấu hình nội dung tĩnh `content_pages` hoặc `page_sections` để admin chỉnh sửa động. | **MEDIUM** |
| [admin-dashboard-widgets.tsx](file:///d:/THCode/AI/furniture-website/components/showroom/admin-dashboard-widgets.tsx) | `DashboardInsightChart` | Biểu đồ trực quan nhu cầu báo giá | Mảng dữ liệu tĩnh mock ở phía client | Thực hiện câu truy vấn SQL gom nhóm theo ngày/tháng từ bảng `quote_requests` thực tế của DB. | **MEDIUM** |
| [admin-workflows.tsx](file:///d:/THCode/AI/furniture-website/components/showroom/admin-workflows.tsx) | AI Assistant Workspace | Trợ lý soạn thảo và dịch thuật AI | Mảng kết quả tĩnh trả về qua `setTimeout` | Viết API route `/api/admin/ai/generate-draft` gọi SDK Gemini. | **HIGH** |
| [admin-workflows.tsx](file:///d:/THCode/AI/furniture-website/components/showroom/admin-workflows.tsx) | Settings Panel | Form cài đặt hệ thống | Đọc và ghi khóa `"pd-cms-settings"` trong `localStorage` | Chuyển sang gọi API `/api/admin/settings` (GET/PUT) kết nối bảng `site_settings` và `integration_secrets`. | **HIGH (Security)** |

---

## 9. BUSINESS DECISIONS REQUIRED

Để hoàn thiện hệ thống đúng định hướng kinh doanh của Showroom Nội Thất Phương Đông, team phát triển cần làm rõ và chốt các quyết định nghiệp vụ sau với Product Owner:

| Business question | Tình trạng hiện tại | Các option lựa chọn | Recommendation (Đề xuất) | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **1. Cơ chế khuyến mãi áp dụng** | Chỉ lưu % giảm giá cơ bản trong DB, FE đang hard-code combo tĩnh. | * **Option A:** Chỉ giảm giá đơn lẻ theo % trên từng sản phẩm.  <br>* **Option B:** Hỗ trợ cả giảm giá sản phẩm, giảm giá theo Category, giảm giá theo Hãng, và tạo gói Combo ưu đãi (gồm nhiều sản phẩm đi kèm với giá bán trọn gói đặc biệt). | **Chọn Option B.** Đây là nghiệp vụ rất cần thiết đối với ngành hàng nội thất/thiết bị vệ sinh để kích thích khách hàng gửi quote yêu cầu combo. | **HIGH** |
| **2. Quản lý thương hiệu (Brand)** | Không có bảng `brands` trong DB, brand chỉ là trường text gõ tay ở sản phẩm. | * **Option A:** Giữ nguyên dạng text tự do (dễ gõ sai chính tả, khó làm bộ lọc chuẩn).  <br>* **Option B:** Chuẩn hóa tạo thực thể `brands` độc lập, liên kết khóa ngoại với sản phẩm. | **Chọn Option B.** Thiết lập module quản lý Thương hiệu trong Admin để đồng bộ hiển thị lên Mega menu và bộ lọc chính xác. | **HIGH** |
| **3. Lưu vết giá tại Quote (Price Snapshot)** | Lead gửi đi chỉ lưu ID sản phẩm, không lưu giá bán tại thời điểm gửi. | * **Option A:** Luôn đọc giá hiện tại của sản phẩm từ bảng `products`.  <br>* **Option B:** Chụp ảnh (Snapshot) lưu lại giá gốc và giá khuyến mãi của sản phẩm trực tiếp trên bản ghi quote tại thời điểm gửi. | **Chọn Option B.** Đảm bảo tính minh bạch khi nhân viên kinh doanh đối chiếu báo giá cũ của khách hàng trong trường hợp giá sản phẩm đã thay đổi. | **MEDIUM** |
| **4. Cây danh mục sản phẩm (Category Tree)** | DB hỗ trợ `parent_id` nhưng Admin UI chỉ hiển thị phẳng, không quản lý được cấp danh mục. | * **Option A:** Chỉ sử dụng danh mục phẳng một cấp.  <br>* **Option B:** Quản lý danh mục đa cấp (Cha -> Con) và hiển thị dạng cây (Tree view) trong admin. | **Chọn Option B.** Hỗ trợ tốt cho việc phân loại sâu các nhóm sản phẩm (ví dụ: Thiết bị vệ sinh -> Sen tắm -> Sen tắm van nhiệt). | **MEDIUM** |
| **5. Phân công và ghi chú Lead (Lead Workflow)** | Leads hiển thị chung cho tất cả admin, không có phân công xử lý và không lưu ghi chú tiến độ. | * **Option A:** Giữ nguyên (chỉ xem danh sách).  <br>* **Option B:** Thêm các trường nhân viên phụ trách (`assigned_to`), ghi chú tư vấn của sales (`sales_notes`) và nhật ký trạng thái xử lý. | **Chọn Option B.** Giúp admin kiểm soát được tiến độ chăm sóc khách hàng và hiệu quả của đội ngũ bán hàng. | **HIGH** |

---

## 10. PRIORITIZED IMPLEMENTATION ROADMAP

Lộ trình triển khai refactor hệ thống được chia làm 4 giai đoạn ưu tiên rõ ràng:

### Giai đoạn 1: Khắc phục lỗi nghiêm trọng (Critical Bug Fixes & DB Schema Upgrades)
*   **Thời gian dự kiến:** 3 - 5 ngày làm việc.
*   **Mục tiêu:** Sửa các lỗi SQL gây sập API và hoàn thiện tầng lưu trữ hình ảnh của mutations.
*   **Chi tiết công việc:**
    1.  Đổi trường `error_detail` thành `last_error` trong file [route.ts](file:///d:/THCode/AI/furniture-website/app/api/contact/route.ts) (dòng 127) để tránh lỗi SQL làm sập luồng gửi quote khi Resend gặp lỗi.
    2.  Nâng cấp Database Schema: Tạo bảng `brands`, `brand_translations`, thêm cột `brand_id` (FK) vào `products`. Thêm các cột snapshot giá (`snapshot_price`, `snapshot_promo_price`) và cột phân công (`assigned_to`, `sales_notes`) vào `quote_requests`. Cập nhật bảng `promotions` với các trường phụ phục vụ combo (`cover_media_id`, `combo_price`, `original_price`, `metadata_jsonb`).
    3.  Khắc phục các hàm mutations trong [mutations.ts](file:///d:/THCode/AI/furniture-website/lib/supabase/mutations.ts): Viết các câu lệnh SQL/Supabase Client để chèn và đồng bộ hóa ảnh chính (`cover_image`) và ảnh gallery (`gallery_images`) vào các bảng trung gian/cột liên kết tương ứng cho **Products, Categories, Showrooms, và Blogs**.
    4.  Cập nhật hàm truy vấn bài viết Blog để trả về ảnh bìa thật thay vì chuỗi rỗng.

### Giai đoạn 2: Phát triển API bảo mật cấu hình và Đồng bộ giao diện (Secure Settings & Dynamic Public Layout)
*   **Thời gian dự kiến:** 4 - 6 ngày làm việc.
*   **Mục tiêu:** Chuyển đổi cơ chế lưu trữ Settings từ localStorage client xuống database bảo mật ở server.
*   **Chi tiết công việc:**
    1.  Xây dựng API GET/PUT `/api/admin/settings` kết nối với bảng `site_settings` và `integration_secrets`.
    2.  Tích hợp dịch vụ mã hóa đối xứng AES-GCM-256 trên server, sử dụng khóa môi trường `AI_SECRET_ENCRYPTION_KEY` để mã hóa API keys của Resend và Gemini trước khi lưu vào `integration_secrets`. Trả về client bản thô được ẩn ký tự (ví dụ: `****5678`).
    3.  Liên kết form Settings ở admin với API mới, loại bỏ hoàn toàn mã nguồn localStorage.
    4.  Đồng bộ hóa các thành phần public (Header, Footer, Logo, Hotline, Zalo, Messenger, Email...) để đọc dữ liệu động từ bảng `site_settings` của DB thay vì mock constants.

### Giai đoạn 3: Phát triển Module Khuyến mãi, Thương hiệu và Trợ lý AI (Dynamic Promotions, Brands & Gemini AI)
*   **Thời gian dự kiến:** 5 - 7 ngày làm việc.
*   **Mục tiêu:** Loại bỏ các phần dữ liệu cứng của khuyến mãi, thương hiệu và kích hoạt trí tuệ nhân tạo Gemini thật.
*   **Chi tiết công việc:**
    1.  Xây dựng API route `/api/admin/ai/generate-draft` tích hợp SDK `@google/generative-ai`. Giải mã API key Gemini từ `integration_secrets` để thực hiện dịch bài viết song ngữ và tạo nháp SEO thực tế. Kết nối trợ lý AI ở admin với API này.
    2.  Xây dựng màn hình quản trị Thương hiệu (Brands) trong Admin. Đồng bộ Mega menu và bộ lọc Catalog để đọc động từ bảng `brands` mới.
    3.  Xây dựng màn hình quản trị Khuyến mãi (Promotions) trong Admin, hỗ trợ cấu hình gói combo. Đồng bộ trang `/[locale]/promotions` công cộng để lấy dữ liệu động từ DB.

### Giai đoạn 4: Quản lý người dùng thực tế và Tối ưu hóa hiệu năng (User Management & Performance Optimization)
*   **Thời gian dự kiến:** 4 - 5 ngày làm việc.
*   **Mục tiêu:** Đồng bộ tài khoản nhân viên CMS thật và chuyển bộ lọc sản phẩm sang thực thi ở phía server.
*   **Chi tiết công việc:**
    1.  Kết nối trang danh sách nhân viên CMS `/admin/users` với API đọc/ghi bảng `profiles` của DB. Tích hợp Supabase Admin API để admin có quyền tạo mới tài khoản nhân viên.
    2.  Bổ sung tính năng xuất danh sách leads (Quotes) ra Excel/CSV cho admin và bộ lọc phân công xử lý lead của sales.
    3.  Chuyển đổi logic bộ lọc sản phẩm tại trang `/[locale]/products/page.tsx` từ lọc Javascript client-side sang Server-side SQL/RPC trực tiếp qua hàm `public_products` của Postgres, giúp tối ưu hóa tốc độ tải trang và băng thông khi quy mô sản phẩm tăng lên hàng chục ngàn bản ghi.
    4.  Tối ưu hóa các trạng thái trống (empty state), trạng thái đang tải (loading) và hiển thị thông báo lỗi thân thiện cho người dùng trên toàn bộ hệ thống.
