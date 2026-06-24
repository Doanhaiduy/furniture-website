# COMPREHENSIVE QA AUDIT REPORT (BÁO CÁO KIỂM THỬ VÀ ĐÁNH GIÁ UX/UI TOÀN DIỆN)

> **Date:** 2026-06-21  
> **Auditor:** Principal QA Architect & UX/UI Reviewer (Antigravity)  
> **Project Workspace:** Doanhaiduy/furniture-website

---

## 1. Coverage Gap Summary

Bảng tổng hợp hiện trạng bao phủ kiểm thử trên các tầng của hệ thống:

| Layer | Đã cover | Chưa cover | Độ tin cậy |
| :--- | :--- | :--- | :--- |
| **Unit Test (UT)** | Schemas validation (`admin.ts`, `quote.ts`, `filters.ts`, `env/schema.ts`), helpers core (`encryption.ts`, `recipients.ts`, `rate-limit.ts`) | Nhánh fallback `seo.ts`, logic `rate-limit.ts` (kịch bản pruning), logic mapping và query repository sâu hơn. | **CAO** (100% line coverage trên schemas và core helpers, cô lập mock sạch) |
| **Integration Test (IT)** | Auth/Security middleware, API `/api/admin/settings` (PUT), `/api/admin/media/upload`, `/api/contact` (valid/invalid payload) | API `GET /api/quote-options`, `GET /api/admin/media/list` (bị 404), `DELETE /api/admin/media/:id`, `GET/POST/PUT/DELETE /api/admin/users`, blog tag filtering, quote logs, dynamic settings propagation. | **TRUNG BÌNH** (Đã test các endpoint chính nhưng chưa cover hết các kịch bản biên hoặc phân quyền Editor hạn chế) |
| **E2E / Browser MCP** | Login flow, basic routing, page load smoke | Toàn bộ các flow nghiệp vụ liên màn hình (BF-01 -> BF-11), form validation nâng cao, image gallery, showroom maps XSS, mobile viewports, bilingual consistency. | **THẤP** (Chưa được tự động hóa hoàn chỉnh theo Test Master Plan, hầu hết mới chỉ chạy smoke check thủ công) |
| **UX/UI Review** | Rà soát sơ bộ | Layout vỡ trên mobile, hardcode dữ liệu (hotline, email, date), broken images/empty states, keys nhạy cảm bị lộ plaintext. | **THẤP** (Rất nhiều lỗi thẩm mỹ và logic giao diện chưa sẵn sàng cho Go-Live) |

---

## 2. Missing Test Cases Backlog

### Level 1 — Smallest Cases (UT bổ sung)

| Case ID | File/Module | Case cần thêm | Why missing | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **UT-GAP-01** | `lib/seo.ts` | Path không bắt đầu bằng `/` (để test tự động chèn `/`) | Chưa có test case cho nhánh `path.startsWith("/")` trả về false. | **Medium** |
| **UT-GAP-02** | `lib/seo.ts` | Fallback URL khi `NEXT_PUBLIC_SITE_URL` trống | Chưa assert giá trị mặc định `"https://phuongdong.example"`. | **Low** |
| **UT-GAP-03** | `lib/seo.ts` | Normalized path khớp chuẩn `/` | Chưa test nhánh trả về rỗng `normalizedPath === "/"`. | **Low** |
| **UT-GAP-04** | `lib/quotes/rate-limit.ts` | Pruning entries khi danh sách trống hoặc block hết hạn | Test cũ mới chạy tiến trình fast-forward chứ chưa rà soát kỹ cleanup map. | **Medium** |
| **UT-GAP-05** | `lib/supabase/queries.ts` | Mapping dynamic products/categories error boundary | Repository logic chứa nhiều null/undefined fallbacks chưa được unit test độc lập. | **High** |

### Level 2 — Module/API Integration Cases

| Case ID | API/Module | Preconditions | Steps | Expected | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **IT-GAP-01** | `GET /api/quote-options` | Database có sẵn dữ liệu sản phẩm & danh mục | Gọi endpoint, truyền `locale=vi` và `locale=en` | Trả về JSON chứa đúng mảng sản phẩm/danh mục tương ứng ngôn ngữ. | **High** |
| **IT-GAP-02** | `GET /api/admin/media/list` | Có token Admin/Editor hợp lệ | Gọi endpoint kèm query param page/limit | Khắc phục lỗi 404, trả về mảng assets và thông tin phân trang. | **Critical** |
| **IT-GAP-03** | `DELETE /api/admin/media/[id]` | Asset ID tồn tại trong DB, được upload lên Cloudinary | Gọi DELETE với ID asset hợp lệ | Soft-delete thành công trong DB, gọi Cloudinary destroy API để xóa ảnh thật. | **High** |
| **IT-GAP-04** | `GET/POST/PUT /api/admin/users` | Token Admin hợp lệ | Gọi các method để xem, tạo mới và cập nhật role user | Thực hiện đúng nghiệp vụ, admin mới tạo đăng nhập được, Editor gọi API này bị 401. | **High** |
| **IT-GAP-05** | `DELETE /api/admin/users/[id]` | Có user phụ tồn tại, token Admin hợp lệ | Gọi DELETE với ID user khác | Profile và Auth user bị xóa sạch. Không cho phép tự xóa chính mình (trả về 400). | **High** |
| **IT-GAP-06** | Blog list/tags API | DB có nhiều tag blog | Query posts theo tag slug | Trả về đúng danh sách bài viết chứa tag tương ứng. | **Medium** |
| **IT-GAP-07** | RBAC Editor restriction | Token Editor | Gửi request đến `/api/admin/settings` hoặc `/api/admin/users` | Trả về 401 Unauthorized (Chặn từ tầng API thay vì chỉ ở middleware). | **High** |

### Level 3 — Screen-level Interaction Cases

| Screen | Missing interaction case | What to verify | Priority |
| :--- | :--- | :--- | :--- |
| **Quote Form** | Autofill & Required field indicators | Trình duyệt hỗ trợ `autocomplete` hợp lệ cho các trường họ tên, SĐT. | **Medium** |
| **Admin Product Form** | Dynamic selectors (Categories / Brands) | Chọn Category từ DB, Brand dạng dropdown chọn thay vì ô text gõ tay. | **Critical** |
| **Admin Product Form** | Unsaved Changes warning | Bấm đóng modal hoặc click ra ngoài khi đang viết -> Hiện popup cảnh báo mất dữ liệu. | **High** |
| **Admin Settings** | Masking & Visibility Toggle | API keys (Gemini, Resend) mặc định ẩn. Bấm icon con mắt để hiện/ẩn. | **Critical** |
| **Admin Promotions** | Date-Time Picker range validation | Chọn start_at lớn hơn end_at -> Báo lỗi inline ngay lập tức, disabled button Lưu. | **High** |
| **Admin Blog** | Inline Markdown Image Upload | Chèn ảnh vào bài viết -> Mở media library picker, chọn ảnh và tự chèn code markdown. | **Medium** |

### Level 4 — End-to-End Business Flows

| Flow ID | Flow name | Missing step | Expected evidence | Priority | Current Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BF-01** | Product Catalog Lifecycle | Tạo brand -> Tạo category -> Tạo sản phẩm liên kết -> Upload ảnh đại diện/gallery -> Mở trang detail public kiểm tra | Brand/Category xuất hiện động. Dữ liệu bảng `media_assets` sinh row size > 0. Trang chi tiết render mượt, đúng ảnh. | **Critical** | **Partially Covered** |
| **BF-02** | Promotion Validity | Tạo Promotion -> Set date ở tương lai (ẩn) -> Đổi sang quá khứ (kích hoạt) -> Kiểm tra client | Client tự động hiển thị/ẩn thẻ khuyến mãi dựa trên so sánh thời gian thực với `now = new Date()`. | **High** | **Partially Covered** |
| **BF-03** | Quote Request Trail | Client gửi báo giá -> DB ghi nhận -> Lưu event logs -> Admin nhận & cập nhật status | Trạng thái chuyển dịch mượt mà `new -> contacted -> qualified -> closed`. Không bị lỗi enum mismatch. | **Critical** | **Not Covered (Broken)** |
| **BF-04** | Site Identity Prop | Admin Settings đổi hotline -> Kiểm tra Homepage, Footer, Contact public | Hotline mới thay đổi đồng bộ trên toàn bộ UI, không còn text hardcode. | **High** | **Partially Covered** |
| **BF-05** | AI Assistant filler | Mô tả thô -> Bấm AI Generate -> Hiện popup phê duyệt -> Autofill | Form mô tả điền đúng HTML sinh từ Gemini. Nếu API lỗi 502/504, giữ nguyên mô tả thô cũ. | **Medium** | **Partially Covered** |

### Level 5 — Visual/UI/UX / Visual QA Cases

| Screen | UI/UX case | What to inspect | Severity if broken |
| :--- | :--- | :--- | :--- |
| **All Admin Forms** | keyboard navigation (Tab order) | Nhấn Tab liên tục trên bàn phím xem con trỏ có nhảy tuần tự qua các input trường học một cách tự nhiên. | **Medium** |
| **Admin Shell** | Navigation bar trên tablet/mobile | Thanh menu cuộn ngang khó dùng -> Cần đổi thành Sidebar toggle/Hamburger menu. | **High** |
| **Products List** | Table horizontal overflow | Cuộn table trên mobile có mượt không, có bị tràn layout che mất nút action không. | **High** |
| **Promotions** | Card layout overflow | Các text mô tả khuyến mãi quá dài có bị tràn hoặc vỡ khung card không. | **Medium** |
| **All Public Pages** | Broken image fallback | Đổi link ảnh trong DB sang URL sai -> Đảm bảo component hiện ảnh fallback hoặc logo mặc định thay vì icon lỗi. | **High** |

---

## 3. Visual Review by Screen

Dưới đây là đánh giá chi tiết từng giao diện trong hệ thống (gồm 32 màn hình):

### 3.1 Nhóm Giao diện Public (10 Màn hình)

#### 1. Trang chủ (Homepage) — `/`
*   **UI Status:** **FAIR**
*   **Layout Review:** Cấu trúc HeroShowcase đẹp, animation mượt. Grid danh mục và sản phẩm nổi bật chia cột chuẩn. Tuy nhiên section Story thiếu heading độc lập (bị lặp text từ slide 3).
*   **Form Review:** Quote form đầy đủ, validation Zod tốt.
*   **Image / Media Review:** Ảnh render tốt nhưng LCP cần được tối ưu bằng blur placeholder.
*   **Data Binding Review:** 
    *   **Lỗi cứng hotline/email** ở header/footer (`1900 1234`), không kéo động từ Settings.
    *   **Trust badges bị hardcode** trong constants (`20+`, `500+`, `2.000m2`).
    *   **Brand marquee** bị giới hạn cứng chỉ hiện tối đa 7 thương hiệu (`.slice(0,7)`).
*   **Responsive Notes:** Tốt trên Mobile (chuyển sang grid 2 cột) và Desktop.
*   **Issues:** [Medium] Hardcoded hotline/email. [Low] Story heading trùng lặp.
*   **Recommended Fixes:** Kết nối Header/Footer/Story/Trust badges với API settings.

#### 2. Giới thiệu (About) — `/about`
*   **UI Status:** **FAIR**
*   **Layout Review:** Layout sạch sẽ, values grid sử dụng icon đồng nhất.
*   **Form Review:** Không có form, chỉ có CTA link sang liên hệ.
*   **Image / Media Review:** Ảnh hero tĩnh, alt text khá sơ sài.
*   **Data Binding Review:** 
    *   **Brand story bị hardcoded** tiếng Việt trong JSX, không dịch sang tiếng Anh và không lấy từ DB.
    *   **Team section** dùng 1 ảnh demo tĩnh, không có thông tin nhân sự động.
*   **Responsive Notes:** Co dãn tốt trên các thiết bị.
*   **Issues:** [High] Story text không hỗ trợ đa ngôn ngữ và bị hardcode. [Low] Team placeholder.
*   **Recommended Fixes:** Đưa nội dung giới thiệu vào tệp `messages/*.json` đa ngôn ngữ hoặc lưu trong table `content_pages`.

#### 3. Danh sách sản phẩm — `/products`
*   **UI Status:** **FAIR**
*   **Layout Review:** Header lớn đẹp. Panel bộ lọc trượt mượt trên mobile.
*   **Form Review:** Các bộ lọc checkbox hoạt động tốt.
*   **Image / Media Review:** Tỷ lệ ảnh sản phẩm (aspect ratio) đồng đều.
*   **Data Binding Review:** 
    *   **Group shortcuts** ở đầu trang dùng hằng số tĩnh (`productGroups`), không lấy động từ DB Categories.
    *   **i18n:** Giao diện tiếng Anh vẫn hiện nhãn tiếng Việt ("Giảm giá", "Thương hiệu") ở bộ lọc.
*   **Responsive Notes:** Drawer bộ lọc trên mobile hoạt động tốt.
*   **Issues:** [High] Lỗi dịch bộ lọc (tiếng Anh lẫn tiếng Việt). [Medium] Phân nhóm tĩnh.
*   **Recommended Fixes:** Bổ sung các bản dịch thiếu trong `en.json`. Đọc danh mục động từ DB để làm group shortcuts.

#### 4. Chi tiết sản phẩm — `/products/[slug]`
*   **UI Status:** **FAIR**
*   **Layout Review:** Sidebar thông tin rõ ràng. Tab specs hiển thị khoa học.
*   **Form Review:** Quote form tự động điền sẵn tên sản phẩm, rất tiện lợi.
*   **Image / Media Review:** Gallery hỗ trợ zoom hoạt động tốt.
*   **Data Binding Review:** 
    *   **Hotline cứng** `1800 6089` ghi trực tiếp trong JSX.
    *   **Specs tabs content** (hướng dẫn bảo quản, vận chuyển) là text tĩnh dùng chung cho mọi sản phẩm, không có thông số riêng.
*   **Responsive Notes:** Gallery tự động chuyển slide vuốt trên mobile.
*   **Issues:** [High] Hotline hardcode. [Medium] Thiếu thông số chi tiết động theo từng sản phẩm.
*   **Recommended Fixes:** Đọc hotline từ Settings. Thêm cột specs động trong DB cho từng sản phẩm.

#### 5. Khuyến mãi — `/promotions`
*   **UI Status:** **POOR**
*   **Layout Review:** Banner khuyến mãi lớn, danh sách sản phẩm giảm giá trình bày ổn.
*   **Form Review:** Không có form.
*   **Image / Media Review:** Banner khuyến mãi load đúng từ DB.
*   **Data Binding Review:** 
    *   **`now` hardcoded:** Dòng `const now = new Date("2026-06-19T...")` là ngày tĩnh! Toàn bộ logic kiểm tra campaign active/expired sẽ bị hỏng sau ngày này.
    *   **Fallback UUIDs** dùng giá trị giả `11111111-...` trong code để map sản phẩm.
    *   **Format giá cứng:** Format đặc biệt cho 3 mức giá cụ thể (`1.5M`, `1.2M`, `1.35M`) viết cứng trong code.
*   **Responsive Notes:** Layout card hơi dài, chiếm nhiều không gian trên màn hình nhỏ.
*   **Issues:** [Critical] Hotline/ngày giờ khuyến mãi bị hardcode tĩnh. [Medium] Mismatch UUID mappings.
*   **Recommended Fixes:** Đổi `now` thành `new Date()` động. Sử dụng bảng liên kết `product_promotions` thay vì map UUID cứng.

#### 6. Hệ thống Showrooms — `/showrooms`
*   **UI Status:** **GOOD**
*   **Layout Review:** Bản đồ nhúng iframe responsive tốt. Trình bày danh sách showroom khoa học.
*   **Form Review:** Không có.
*   **Image / Media Review:** Ảnh đại diện showroom hiển thị rõ nét.
*   **Data Binding Review:** Dữ liệu tải động chuẩn xác từ DB.
*   **Responsive Notes:** Tự động ẩn bớt thông tin phụ trên màn hình nhỏ.
*   **Issues:** [Low] Định nghĩa trùng lặp component nhúng bản đồ.
*   **Recommended Fixes:** Sử dụng chung component `GoogleMap.tsx` để tối ưu mã nguồn.

#### 7. Danh sách bài viết — `/blog`
*   **UI Status:** **FAIR**
*   **Layout Review:** Trình bày dạng tạp chí đẹp mắt.
*   **Form Review:** Ô tìm kiếm hoạt động ổn.
*   **Image / Media Review:** Thumbnail ảnh bài viết tối ưu tốt.
*   **Data Binding Review:**
    *   **Bộ lọc danh mục tĩnh:** Các tag danh mục hiển thị nhưng không thể bấm để lọc bài viết.
    *   **readTime bị cứng:** Tất cả bài viết đều hiện "5 phút đọc" giống nhau.
*   **Responsive Notes:** Layout tự động co về 1 cột trên mobile.
*   **Issues:** [Medium] Bộ lọc tag không hoạt động. [Low] Hardcoded readTime.
*   **Recommended Fixes:** Viết API filter bài viết theo category tag. Tính toán dynamic readTime dựa trên số lượng từ trong nội dung bài viết.

#### 8. Chi tiết bài viết — `/blog/[slug]`
*   **UI Status:** **FAIR**
*   **Layout Review:** Sidebar TOC di chuyển theo màn hình cuộn rất tốt.
*   **Form Review:** Không có.
*   **Image / Media Review:** Hỗ trợ chèn ảnh responsive trong nội dung.
*   **Data Binding Review:** TOC tự động parse các thẻ `<h2>`, `<h3>` chuẩn xác. Tuy nhiên cuối bài viết thiếu CTA dẫn dụ khách hàng mua sản phẩm hoặc gửi quote.
*   **Issues:** [Low] Thiếu CTA chuyển đổi ở footer bài viết.
*   **Recommended Fixes:** Thêm banner "Xem các sản phẩm liên quan" hoặc form quote ngắn ở cuối bài.

#### 9. Liên hệ — `/contact`
*   **UI Status:** **FAIR**
*   **Layout Review:** Cột thông tin liên hệ bên trái, form liên hệ bên phải cân đối.
*   **Form Review:** Form QuoteForm hoạt động tốt.
*   **Image / Media Review:** Bản đồ showroom preview rõ.
*   **Data Binding Review:**
    *   **Hotline cứng** `08172 357 587` và **Email cứng** `contact@phuongdong.com` (sai tên miền hệ thống `.vn` trong Settings).
*   **Issues:** [High] Hotline và email liên hệ bị hardcode trong code.
*   **Recommended Fixes:** Đọc thông tin liên hệ từ siteSettings trong DB.

#### 10. Gửi liên hệ thành công — `/contact/success`
*   **UI Status:** **GOOD**
*   **Layout Review:** Nút quay lại trang chủ nổi bật, căn giữa chuẩn.
*   **Issues:** Không có vấn đề lớn.

---

### 3.2 Nhóm Giao diện Admin (22 Màn hình)

#### 11. Đăng nhập Admin — `/admin/login`
*   **UI Status:** **FAIR**
*   **Layout Review:** Thiết kế tối giản, chuyên nghiệp.
*   **Form Review:** Kiểm tra trống và định dạng email đầy đủ.
*   **Data Binding Review:** 
    *   **i18n:** Khi đăng nhập sai, câu thông báo lỗi trả về bằng tiếng Anh ("Invalid login credentials") thay vì tiếng Việt đồng bộ.
*   **Issues:** [Low] Lỗi thông báo tiếng Anh.
*   **Recommended Fixes:** Bổ sung xử lý lỗi trả về từ Supabase Auth sang thông báo tiếng Việt thân thiện.

#### 12. Truy cập bị từ chối — `/admin/access-denied`
*   **UI Status:** **GOOD**
*   **Layout Review:** Thể hiện rõ mã lỗi 403, nút quay về dashboard hoạt động chuẩn.

#### 13. Bảng điều khiển (Dashboard) — `/admin/dashboard`
*   **UI Status:** **GOOD**
*   **Layout Review:** Các thẻ thống kê sản phẩm, danh mục, quote hiển thị rõ ràng, grid cân đối.

#### 14. Quản lý sản phẩm — `/admin/products`
*   **UI Status:** **FAIR**
*   **Layout Review:** Bảng DataTable hiển thị đầy đủ thông tin.
*   **Responsive Notes:** 
    *   Trên mobile/tablet, bảng bị tràn khung ngang, các cột đè lên nhau gây khó bấm nút Action (Edit/Delete).
*   **Issues:** [Medium] Giao diện bảng dữ liệu chưa responsive tốt trên mobile.
*   **Recommended Fixes:** Ẩn bớt cột phụ (Status, Created At) trên màn hình mobile và thêm thanh cuộn ngang mượt.

#### 15. Tạo sản phẩm mới — `/admin/products/new`
*   **UI Status:** **POOR**
*   **Form Review:** Form quá dài, chia thành các tab nhưng:
    *   **Dropdown Category bị cứng:** Chỉ cho chọn 3 danh mục tĩnh (`wood`, `sanitary`, `tiles`). Biên tập viên tạo danh mục mới trong DB không chọn được.
    *   **Trường Brand là text tự do:** Cho gõ tay tự do tên thương hiệu thay vì chọn dropdown khóa ngoại từ DB, rất dễ gõ sai chính tả.
    *   **Dropdown Showroom bị cứng:** Chỉ hiện 3 showroom tĩnh.
*   **UX Review:** Thiếu cảnh báo "Unsaved changes" khi lỡ click ra ngoài modal đóng form làm mất nội dung đang soạn thảo.
*   **Issues:** [Critical] Dropdowns bị hardcode, brand là trường text tự do. [High] Thiếu cảnh báo đóng form.
*   **Recommended Fixes:** Thay đổi các trường category_id, brand_id, showroom_id thành dynamic dropdowns lấy dữ liệu từ DB. Thêm xử lý cảnh báo trước khi close modal.

#### 16. Chỉnh sửa sản phẩm — `/admin/products/[id]/edit`
*   **UI Status:** **POOR**
*   **Form Review:** Thừa hưởng toàn bộ vấn đề của form tạo mới ở trên (dropdowns hardcode, text brand tự do).

#### 17. Quản lý danh mục — `/admin/categories`
*   **UI Status:** **FAIR**
*   **Layout Review:** Bảng DataTable phẳng.
*   **Data Binding Review:** 
    *   Thiếu biểu diễn phân cấp (Tree View) khiến admin khó hình dung danh mục nào là cha, danh mục nào là con.
*   **Issues:** [Medium] Quản lý danh mục thiếu Tree View.
*   **Recommended Fixes:** Thêm cột thụt lề (indentation) hoặc hiển thị dạng cây danh mục.

#### 18. Tạo danh mục mới — `/admin/categories/new`
*   **UI Status:** **FAIR**
*   **Form Review:** Tự sinh slug từ tên category hoạt động tốt. Zod check lặp vòng tròn danh mục hoạt động chuẩn.

#### 19. Chỉnh sửa danh mục — `/admin/categories/[id]/edit`
*   **UI Status:** **FAIR**
*   **Form Review:** Load đầy đủ thông tin cũ, cho phép sửa danh mục cha.

#### 20. Quản lý thương hiệu — `/admin/brands`
*   **UI Status:** **FAIR**
*   **Layout Review:** Danh sách thương hiệu trình bày sạch sẽ.

#### 21. Tạo thương hiệu mới — `/admin/brands/new`
*   **UI Status:** **POOR**
*   **Form Review:** 
    *   **Không có bất kỳ validation nào:** Không check tên trống, không check slug trùng lặp ở cả FE và BE. Nhấn lưu payload rỗng vẫn gửi đi và lỗi DB.
    *   Tính năng upload logo thương hiệu thiếu giới hạn tỷ lệ ảnh (crop ratio).
*   **Issues:** [Critical] Brand form hoàn toàn thiếu validation.
*   **Recommended Fixes:** Tích hợp `brandSchema` Zod validation vào hàm onSubmit.

#### 22. Quản lý khuyến mãi — `/admin/promotions`
*   **UI Status:** **FAIR**
*   **Layout Review:** DataTable liệt kê mã khuyến mãi rõ ràng.

#### 23. Tạo khuyến mãi mới — `/admin/promotions/new`
*   **UI Status:** **POOR**
*   **Form Review:** 
    *   **Hoàn toàn thiếu validation** ở FE và BE.
    *   **datepicker bị thiếu:** Không có UI chọn ngày, trong code gửi đi bị gán cứng `start_at: null`, `end_at: null`.
*   **Issues:** [Critical] Khuyến mãi form thiếu validation và date picker.
*   **Recommended Fixes:** Tích hợp `promotionSchema` Zod validator. Thêm UI DatePicker để admin chọn khoảng ngày chạy chương trình.

#### 24. Quản lý bài viết — `/admin/blog`
*   **UI Status:** **FAIR**
*   **Layout Review:** DataTable rõ ràng, tìm kiếm theo tiêu đề tốt.

#### 25. Tạo bài viết mới — `/admin/blog/new`
*   **UI Status:** **POOR**
*   **Form Review:**
    *   **Editor thô sơ:** Ô nhập nội dung chi tiết bài viết chỉ là một `textarea` thô gõ Markdown, không có thanh công cụ định dạng (bold, italic, list) và không cho upload ảnh trực tiếp chèn vào bài.
*   **Issues:** [High] Markdown editor quá thô sơ, thiếu image uploader.
*   **Recommended Fixes:** Thay thế `textarea` bằng thư viện Markdown Editor trực quan (như SimpleMDE hoặc MDX Editor) có tích hợp Media Picker.

#### 26. Quản lý Showrooms — `/admin/showrooms`
*   **UI Status:** **FAIR**
*   **Layout Review:** Danh sách showroom đầy đủ.

#### 27. Tạo showroom mới — `/admin/showrooms/new`
*   **UI Status:** **POOR**
*   **Form Review:**
    *   **Lỗ hổng Stored XSS:** Ô nhúng iframe bản đồ (`mapsEmbed`) nhúng trực tiếp chuỗi HTML từ DB lên trang quản trị bằng `dangerouslySetInnerHTML` mà không qua bất kỳ lớp sanitize nào. Kẻ xấu có thể chèn mã script độc hại.
*   **Issues:** [Critical] Stored XSS thông qua trường nhúng bản đồ.
*   **Recommended Fixes:** Sử dụng DOMPurify ở cả Client và Admin trước khi nhúng chuỗi HTML thô.

#### 28. Quản lý yêu cầu báo giá — `/admin/quotes`
*   **UI Status:** **POOR**
*   **Form Review:**
    *   **Workflow bị hỏng hoàn toàn:** Khi admin bấm "Bắt đầu xử lý", FE gửi trạng thái `"processing"` và khi bấm "Hủy" gửi `"cancelled"`. Tuy nhiên DB enum chỉ chấp nhận `('new', 'contacted', 'qualified', 'closed', 'spam')`. Hàm RPC `update_quote_status` ném ra lỗi `Invalid status` khiến admin không thể cập nhật bất kỳ quote nào!
*   **Issues:** [Critical] Quy trình cập nhật trạng thái báo giá bị hỏng do lệch enum giữa FE và BE.
*   **Recommended Fixes:** Cập nhật lại sơ đồ trạng thái trên FE khớp chính xác với DB enum (ví dụ chuyển từ `new` trực tiếp sang `contacted`).

#### 29. Quản lý Users — `/admin/users`
*   **UI Status:** **FAIR**
*   **Layout Review:** DataTable hiển thị danh sách tài khoản biên tập viên.

#### 30. Tạo User mới — `/admin/users/new`
*   **UI Status:** **FAIR**
*   **Form Review:**
    *   **Điền sẵn dữ liệu rác:** Form mở ra điền sẵn email demo `editor@furniture.com` và tên demo, rất dễ gây lỗi bấm nhầm nút tạo tài khoản trùng lặp.
*   **Issues:** [Low] Dữ liệu điền sẵn không hợp lý.
*   **Recommended Fixes:** Để trống các ô input khi tạo mới.

#### 31. Cấu hình hệ thống — `/admin/settings`
*   **UI Status:** **POOR**
*   **Form Review:**
    *   **Thiếu validation hoàn toàn:** Ô nhập email, hotline không validate định dạng, bấm Lưu lỗi ném alert thô.
    *   **Lộ API key plaintext:** Các ô nhập Resend API key và Gemini API key sử dụng `<input type="text">` thay vì `type="password"`, khiến các key nhạy cảm hiển thị dạng chữ rõ ràng trên màn hình.
    *   **Rác DB:** Nếu admin điền chay link ảnh logo vào ô input, Settings Media Resolver tự động insert dòng media mới có size = 0 vào DB.
*   **Issues:** [Critical] Lộ API key plaintext. [Critical] Settings form thiếu validation.
*   **Recommended Fixes:** Đặt `inputType="password"` cho các ô chứa API keys. Áp dụng Zod schema `settingsSchema` để validate trước khi submit.

#### 32. Thư viện Media — `/admin/media`
*   **UI Status:** **POOR**
*   **Layout Review:**
    *   **Lỗi 404 API:** API `GET /api/admin/media/list` trả về 404 khiến thư viện media không thể load ảnh đã có lên UI.
    *   **Delete button bị cô lập:** Nút xóa ảnh có trên UI nhưng chưa được kết nối với API `/api/admin/media/[id]`.
    *   **Thiếu phân trang:** Chỉ hiển thị tối đa 60 ảnh, không có nút chuyển trang hay tìm kiếm ảnh cũ.
*   **Issues:** [High] Thư viện media lỗi 404, thiếu nút xóa vật lý và phân trang.
*   **Recommended Fixes:** Fix route API list. Gắn sự kiện gọi DELETE API vào nút xóa ảnh. Bổ sung cursor-based pagination.

---

## 4. Test Script Generation

Dưới đây là các kịch bản kiểm thử viết chi tiết bằng mã giả/script để dev/QA có thể implement ngay lập tức:

### 4.1 Unit test scripts to add

#### Test 1: Bổ sung nhánh path không có dấu gạch chéo `/` trong SEO helper
*   **File target:** `tests/unit/helpers.test.ts`
*   **Test name:** `"SEO Metadata Helper -> should auto prepend slash to paths without one"`
*   **Scenario:** Gọi hàm `generatePageMetadata` với tham số `path: "about"` (thiếu `/` ở đầu).
*   **Expected assertion:** 
    ```typescript
    const metadata = generatePageMetadata({
      title: "Test",
      description: "Test",
      path: "about"
    });
    expect(metadata.alternates?.canonical).toBe("https://phuongdong.example/about");
    ```

#### Test 2: Bổ sung test fallback URL mặc định khi `NEXT_PUBLIC_SITE_URL` bị trống
*   **File target:** `tests/unit/helpers.test.ts`
*   **Test name:** `"SEO Metadata Helper -> should fallback to default phuongdong.example domain when env is empty"`
*   **Mocking needed:** Mock `process.env.NEXT_PUBLIC_SITE_URL` thành `undefined`.
*   **Expected assertion:**
    ```typescript
    const metadata = generatePageMetadata({ title: "T", description: "D", path: "/" });
    expect(metadata.alternates?.canonical).toBe("https://phuongdong.example/");
    ```

#### Test 3: Bổ sung test validation cross-field `start_at` / `end_at` trong Promotion Schema
*   **File target:** `tests/unit/adminSchemas.test.ts`
*   **Test name:** `"adminSchemas -> promotionSchema should reject end_at date before start_at"`
*   **Scenario:** Khởi tạo dữ liệu promotion với `start_at = "2026-06-25"` và `end_at = "2026-06-20"`.
*   **Expected assertion:**
    ```typescript
    const result = promotionSchema.safeParse({
      code: "FAIL-DATE",
      discount_percentage: 10,
      start_at: "2026-06-25T00:00:00.000Z",
      end_at: "2026-06-20T00:00:00.000Z",
      title_vi: "Khuyến mãi lỗi",
      title_en: "Error Promo"
    });
    expect(result.success).toBe(false);
    // Error message contains date range conflict
    ```

---

### 4.2 Integration test scripts to add

#### Test 1: Gọi API `GET /api/quote-options` kiểm tra phân tách ngôn ngữ
*   **File target:** `tests/integration/apiQuoteOptions.test.ts`
*   **Endpoint:** `GET /api/quote-options`
*   **Steps:**
    1. Seed 1 product có tên `{"vi": "Bàn trà gỗ sồi", "en": "Oak coffee table"}`.
    2. Gửi request `GET /api/quote-options?locale=en`.
    3. Gửi request `GET /api/quote-options?locale=vi`.
*   **Assertions:**
    *   Ở request `locale=en`, trường `name` của product trả về phải là `"Oak coffee table"`.
    *   Ở request `locale=vi`, trường `name` trả về phải là `"Bàn trà gỗ sồi"`.

#### Test 2: Gọi API `DELETE /api/admin/media/[id]` thực thi soft-delete
*   **File target:** `tests/integration/apiMediaDelete.test.ts`
*   **Endpoint:** `DELETE /api/admin/media/[id]`
*   **Setup data:** Seed 1 media asset ảo có `storage_provider = "local"` (tránh gọi Cloudinary thật).
*   **Steps:**
    1. Đăng nhập Client Admin, lấy session cookie.
    2. Gửi `DELETE /api/admin/media/[id]` với ID vừa seed.
    3. Query trực tiếp database tìm record đó.
*   **Assertions:**
    *   Response trả về status code 200.
    *   Cột `deleted_at` trong DB không còn null.
    *   Cột `status` chuyển thành `"archived"`.

---

### 4.3 Browser/UI regression scripts to add

#### Test 1: Kiểm thử an toàn iframe nhúng bản đồ Showroom (Stored XSS)
*   **Route:** `/admin/showrooms/new`
*   **Viewport:** `1280x800` (Desktop)
*   **Interactions:**
    1. Điền tên showroom, địa chỉ.
    2. Nhập chuỗi `<iframe src="javascript:alert('XSS_ATTACK')"></iframe>` vào ô `mapsEmbed`.
    3. Click nút "Lưu showroom".
    4. Mở trang quản lý danh sách showroom `/admin/showrooms`.
*   **Console/Network Check:** Lắng nghe event `dialog` (nếu alert kích hoạt là fail).
*   **Visual assertion:** Iframe render phải bị escape hoặc stripping thuộc tính `src` nguy hiểm, không kích hoạt alert của trình duyệt.

#### Test 2: Kiểm thử Responsive và Touch Target của Mobile Sidebar Menu
*   **Route:** `/admin/dashboard`
*   **Viewport:** `375x812` (iPhone X)
*   **Interactions:**
    1. Click biểu tượng Hamburger ở góc trên bên trái.
    2. Đợi Drawer menu trượt ra.
    3. Bấm vào liên kết "Quản lý Báo giá".
*   **Visual assertions:**
    *   Menu drawer chiếm đúng tỷ lệ màn hình (thường là 80% width).
    *   Các item liên kết có chiều cao touch target tối thiểu `44px` để dễ bấm.
    *   Layout trang Quote quản trị tự động chuyển sang cấu trúc card dọc thay vì table tràn ngang.

---

## 5. Priority Fix Matrix

Dưới đây là ma trận các lỗi và vùng thiếu hụt coverage cần được khắc phục theo mức độ ưu tiên từ cao xuống thấp:

| Priority | Missing case / issue | Layer | Why important | Suggested owner |
| :--- | :--- | :--- | :--- | :--- |
| 🔴 **Critical** | **API keys lộ diện dạng plaintext ở Settings UI** | UI / Security | Rò rỉ các key Resend/Gemini khi admin share màn hình hoặc quay video. | Frontend Dev |
| 🔴 **Critical** | **Workflow quote status bị hỏng (enum mismatch)** | Integration / DB | Admin không thể nâng bước xử lý quote request, làm đứt gãy luồng kinh doanh. | Backend Dev + FE |
| 🔴 **Critical** | **Brand/Promo Form hoàn toàn thiếu validation** | Validation | Cho phép submit dữ liệu trống hoặc rác gây crash hệ thống DB/Client. | FE / Schema Owner |
| 🔴 **Critical** | **Categories dropdown bị hardcode trong Product Form** | UI / Data Binding | Biên tập viên không thể liên kết sản phẩm mới tạo với danh mục động từ DB. | Frontend Dev |
| 🔴 **Critical** | **Stored XSS trong trường nhúng bản đồ showroom** | Security / Admin UI | Nguy cơ chiếm quyền admin thông qua chèn mã iframe độc hại vào DB. | Security Lead |
| 🔴 **Critical** | **`now` date bị hardcode tĩnh ở trang Promotions** | Client UI / Logic | Toàn bộ trạng thái hiển thị khuyến mãi (active/expired) bị sai lệch theo thời gian. | Frontend Dev |
| 🟠 **High** | **API list media `/api/admin/media/list` trả 404** | API / Routing | Thư viện media admin không thể tải danh sách ảnh cũ đã upload. | Next.js Route Owner |
| 🟠 **High** | **Hotline/Email hardcode trên các trang Homepage/Detail/Contact** | Client UI | Khách hàng liên hệ qua số cũ, mất khách do thông tin không đồng bộ Settings DB. | Frontend Dev |
| 🟠 **High** | **Thanh menu di động cuộn ngang trong Admin Shell** | UI / Responsive | Trải nghiệm quản trị trên mobile rất tệ, các item bị khuất khó định vị. | UX/UI Designer |
| 🟡 **Medium** | **Thiếu API xóa vật lý ảnh `DELETE /api/admin/media/:id`** | API / Clean-up | Tích tụ rác dung lượng lớn trên Cloudinary không thể dọn dẹp. | Backend Dev |
| 🟡 **Medium** | **Bộ lọc danh mục trên trang Blog không hoạt động** | UX / Feature | Người đọc không thể lọc bài viết theo chủ đề quan tâm. | Frontend Dev |
| 🟢 **Low** | **Thiếu test branches bổ sung cho SEO helper** | Unit Test | Để đảm bảo code coverage tiệm cận 100% cho các core helpers. | QA Automation SDET |
