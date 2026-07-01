# Báo cáo Tổng hợp Toàn bộ Lỗi Hệ thống & Cơ sở Dữ liệu (Bugs & Issues Audit Report)
*Dự án: Furniture & Sanitary Equipment E-commerce Website (Phương Đông)*

Tài liệu này tổng hợp toàn bộ các lỗi (Bugs), lỗ hổng bảo mật, lỗi thiết kế cơ sở dữ liệu và bất nhất logic được phát hiện trong quá trình thiết lập và chạy bộ kiểm thử hồi quy (E2E & IT) từ trước tới nay.

---

## 1. Lỗi Nghiệp vụ & Logic Cơ sở Dữ liệu (Database & Core Logic)

### 🔴 BLK-06: Thiếu Trạng thái "Cancelled" của Báo giá (Quote Status Enum Mismatch)
*   **Module ảnh hưởng**: Báo giá (Quotes - Module 9)
*   **Mức độ nghiêm trọng**: Cao (Critical Block)
*   **Mô tả**: Trường `status` của bảng `quote_requests` sử dụng kiểu dữ liệu `public.quote_status` (enum). Tuy nhiên, trong cơ sở dữ liệu Postgres, enum này chỉ định nghĩa `['new', 'contacted', 'qualified', 'closed', 'spam']` mà hoàn toàn **không có giá trị `cancelled`**. Khi frontend hoặc hệ thống cố gắng chuyển trạng thái báo giá sang "Đã hủy" (cancelled), DB sẽ từ chối và quăng lỗi Server Error.
*   **Trạng thái**: Đã xác nhận (Confirmed Bug).
*   **Khắc phục đề xuất**: Chạy migration bổ sung enum label:
    ```sql
    ALTER TYPE public.quote_status ADD VALUE 'cancelled';
    ```

### 🔴 ADM-USR-23: Cột `last_login_at` của Người dùng Không Tự Cập nhật
*   **Module ảnh hưởng**: Thành viên (Users - Module 10)
*   **Mức độ nghiêm trọng**: Trung bình (Medium)
*   **Mô tả**: Bảng `public.profiles` có cột `last_login_at` để theo dõi thời điểm đăng nhập gần nhất. Tuy nhiên, codebase Next.js hoàn toàn không có dòng code nào thực hiện cập nhật trường này khi người dùng đăng nhập thành công.
*   **Trạng thái**: **Đã sửa**.
*   **Khắc phục**: Cập nhật hàm login trong tệp [admin-login.tsx](file:///d:/THCode/AI/furniture-website/components/showroom/admin-login.tsx) để gọi `.update({ last_login_at: new Date().toISOString() })` ngay sau khi đăng nhập thành công.

### 🔴 BLK-08 & ADM-SET-36: Tạo Bản ghi Rác khi Resolve Media (Ghost Assets)
*   **Module ảnh hưởng**: Thư viện Media (Media - Module 12) & Cấu hình (Settings - Module 11)
*   **Mức độ nghiêm trọng**: Trung bình (Medium)
*   **Mô tả**: Hàm `resolveMediaId` tự động tạo ra bản ghi "ma" (ghost asset) trong bảng `public.media_assets` với kích thước mặc định `size_bytes = 1` khi cố gắng xử lý các tệp chưa được tải lên hoàn chỉnh hoặc ID không tồn tại.
*   **Trạng thái**: Đã xác nhận (Confirmed Bug).

### 🔴 ADM-PRD-42: Trùng lặp `reference_code` mặc định khi Tạo sản phẩm
*   **Module ảnh hưởng**: Sản phẩm (Products - Module 3)
*   **Mức độ nghiêm trọng**: Trung bình (Medium)
*   **Mô tả**: Form UI tạo sản phẩm điền sẵn mã mặc định `PD-SF-184`. Khi chạy test tạo sản phẩm nhiều lần, DB sẽ báo lỗi trùng lặp khóa duy nhất (Unique Constraint) trên cột `reference_code`.
*   **Trạng thái**: **Đã sửa**.
*   **Khắc phục**: Cấu hình tệp E2E tự động điền mã ngẫu nhiên dạng `REF-[Timestamp]` khi kiểm thử.

### 🟡 ADM-PRD-88: Lỗi map sai ngôn ngữ kích thước sản phẩm (Dimension Display Text)
*   **Module ảnh hưởng**: Sản phẩm (Products - Module 3)
*   **Mức độ nghiêm trọng**: Thấp (Low)
*   **Mô tả**: Khi cập nhật thông tin sản phẩm, biến `dimension_display_text` bị map sai ngôn ngữ: Giá trị tiếng Anh lưu vào cột tiếng Việt và ngược lại.
*   **Trạng thái**: Đã xác nhận.

---

## 2. Lỗi Bảo mật & Rò rỉ Dữ liệu (Security & Data Leakage)

### 🔴 BLK-03: Rò rỉ Secrets trong Docker Image Layer
*   **Module ảnh hưởng**: Triển khai & Vận hành (DevOps / Infrastructure)
*   **Mức độ nghiêm trọng**: Nghiêm trọng (High Vulnerability)
*   **Mô tả**: File `Dockerfile` hoặc cấu hình Docker build truyền các thông tin nhạy cảm của Supabase (như `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`) thông qua tham số build trực tiếp. Điều này khiến các khóa bảo mật tối cao bị ghi lại vĩnh viễn trong Docker Layer History và có thể bị đọc dễ dàng bằng lệnh `docker history [image_name] --no-trunc`.
*   **Trạng thái**: Đã phát hiện (Confirmed Risk).
*   **Khắc phục đề xuất**: Chuyển sang sử dụng cơ chế **Docker BuildKit Secrets** (`--secret id=...`) hoặc nạp biến môi trường động lúc run-time thay vì compile-time.

### 🔴 ADM-CROSS-02: Rò rỉ Thông tin Cá nhân qua Console Log (PII Leak)
*   **Module ảnh hưởng**: Chung (Cross-Module)
*   **Mức độ nghiêm trọng**: Trung bình (Medium Security Risk)
*   **Mô tả**: Tại dòng 372 của tệp `lib/supabase/admin-queries.ts`, hệ thống gọi lệnh `console.log` in ra toàn bộ thông tin cá nhân chưa mã hóa của khách hàng gửi yêu cầu báo giá (bao gồm Họ tên, Số điện thoại, Email, Nội dung tin nhắn). Các thông tin này sẽ hiển thị trực tiếp trên stdout/logs của production server, vi phạm chính sách bảo mật thông tin cá nhân.
*   **Trạng thái**: Đã phát hiện.
*   **Khắc phục đề xuất**: Loại bỏ dòng `console.log` này trong tệp `admin-queries.ts`.

### 🟡 ADM-CROSS-01: Rò rỉ Cấu hình Mock Data trong Production
*   **Module ảnh hưởng**: Cấu hình (Settings)
*   **Mức độ nghiêm trọng**: Trung bình (Medium)
*   **Mô tả**: File `.env.production` vẫn chứa cờ `NEXT_PUBLIC_USE_MOCK_DATA=true`. Nếu deploy bản build này lên môi trường live, người dùng sẽ thấy dữ liệu giả lập thay vì dữ liệu thật từ database.
*   **Trạng thái**: Đã phát hiện.
*   **Khắc phục đề xuất**: Đảm bảo `.env.production` cấu hình biến này thành `false`.

---

## 3. Lỗi Ràng buộc & Toàn vẹn Dữ liệu (Constraints & Integrity)

### 🔴 ADM-CROSS-12: Asset Mồ côi khi Xóa sản phẩm (Orphan Assets)
*   **Module ảnh hưởng**: Thư viện Media & Sản phẩm
*   **Mức độ nghiêm trọng**: Trung bình (Medium)
*   **Mô tả**: Khi thực hiện xóa sản phẩm (Soft Delete bằng cách set `deleted_at`), sản phẩm bị ẩn đi. Tuy nhiên, các hàng liên kết hình ảnh tương ứng trong bảng junction `public.product_media` **không hề bị xóa hoặc cập nhật**, dẫn đến việc tồn tại hàng loạt liên kết mồ côi chiếm tài nguyên DB.
*   **Trạng thái**: Đã xác nhận.

### 🟡 ADM-CROSS-15: Bất nhất Xử lý Lỗi Audit Log (Audit Fail Inconsistency)
*   **Module ảnh hưởng**: Nhật ký hoạt động (Audit Logs)
*   **Mức độ nghiêm trọng**: Thấp (Low)
*   **Mô tả**: Khi ghi nhật ký hoạt động (Write Audit Log) bị lỗi (ví dụ do DB quá tải):
    *   Hành vi của Product/Category: Vẫn cho phép tạo sản phẩm thành công (bỏ qua lỗi audit).
    *   Hành vi của Blog/Showroom: Quay lui giao dịch (Rollback), hủy bỏ việc tạo bài viết/showroom.
    *   Sự bất nhất này gây khó khăn cho việc đồng bộ và quản lý nhật ký hệ thống.
*   **Trạng thái**: Đã xác nhận.

### 🟡 BLK-01: Cột `media_asset_id` Lưu Sai Định dạng
*   **Module ảnh hưởng**: Thư viện Media
*   **Mức độ nghiêm trọng**: Trung bình (Medium)
*   **Mô tả**: Cột `product_media.media_asset_id` thỉnh thoảng lưu trữ chuỗi URL hình ảnh đầy đủ thay vì chỉ lưu UUID của asset trong bảng `media_assets`. Điều này làm hỏng mối quan hệ khóa ngoại (Foreign Key) giữa hai bảng.
*   **Trạng thái**: Đã xác nhận.

---

## 4. Các Lỗi Check Constraints trong Database (Chặn Dữ liệu Xấu)
*Các lỗi này đã được hệ thống DB chặn thành công bằng Check Constraints, giúp dữ liệu luôn sạch sẽ:*
1.  **Chặn URL Google Maps nhúng không bảo mật (ADM-SHW-11)**: DB có constraint `chk_showrooms_map_urls_https` chặn các URL nhúng dùng giao thức `http://`.
2.  **Chặn tọa độ Showroom không hợp lệ (ADM-SHW-15 & 16)**: DB có constraint `chk_showrooms_coordinates` chặn các giá trị Latitude nằm ngoài khoảng `[-90, 90]` hoặc Longitude ngoài khoảng `[-180, 180]`.
3.  **Chặn số điện thoại rác trong Báo giá (ADM-QTE-24)**: DB có constraint `chk_quote_requests_phone_shape` (`CHECK (phone ~ '^[0-9+().\-\s]{7,32}$')`) chặn các số điện thoại chứa ký tự lạ (như chữ cái).
4.  **Chặn Email sai định dạng (ADM-QTE-25)**: DB có constraint `chk_quote_requests_email_shape` chặn email thiếu ký tự `@` hoặc tên miền.
5.  **Chặn Họ tên trống trong Profile (ADM-USR-09)**: DB có constraint `chk_profiles_full_name_not_blank` chặn tên rỗng hoặc chỉ chứa khoảng trắng.
