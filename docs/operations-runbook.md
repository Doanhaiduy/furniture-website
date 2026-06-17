# Sổ tay vận hành hệ thống (Operations Runbook)
## Showroom Nội Thất Phương Đông

Tài liệu này cung cấp hướng dẫn vận hành, bảo trì, triển khai, sao lưu và khôi phục hệ thống website của Showroom Nội Thất Phương Đông.

---

## 1. Kiến trúc Hệ thống (System Architecture)

Hệ thống được xây dựng trên mô hình hybrid, kết hợp Next.js App Router và các dịch vụ đám mây (cloud services) có độ tin cậy cao:
- **Frontend & Server Actions**: Next.js 16.2.6 (chế độ Standalone để tối ưu hóa Docker).
- **Backend & Database**: Supabase (PostgreSQL, Row Level Security - RLS, Stored Procedures - RPC).
- **Media CDN**: Cloudinary (lưu trữ hình ảnh sản phẩm, bài viết và các tệp tĩnh, tối ưu định dạng qua tham số URL).
- **Gửi Email**: Resend (email thông báo yêu cầu báo giá cho admin).
- **AI Assistant**: Google Gemini API (sinh bản nháp thông tin sản phẩm/bài viết từ nội dung thô).

---

## 2. Triển khai Hệ thống (Deployment)

### 2.1 Triển khai trên VPS (Self-hosted Docker)

Để chạy hệ thống trên một máy chủ VPS riêng biệt, hãy làm theo các bước sau:

1. **Chuẩn bị môi trường VPS**:
   - Yêu cầu cài đặt sẵn Docker và Docker Compose.
   - Cấu hình Nginx hoặc Traefik làm Reverse Proxy để xử lý SSL (HTTPS).

2. **Cấu hình biến môi trường**:
   Sao chép `.env.example` thành `.env.production` trên VPS và điền đầy đủ thông tin:
   ```bash
   NEXT_PUBLIC_SITE_URL=https://noithatphuongdong.vn
   NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   DATABASE_URL=postgresql://postgres:password@db-host:5432/postgres
   CLOUDINARY_API_KEY=your-cloudinary-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret
   RESEND_API_KEY=your-resend-key
   GEMINI_API_KEY=your-gemini-key
   AI_SECRET_ENCRYPTION_KEY=your-aes-key
   NEXT_PUBLIC_USE_MOCK_DATA=false
   ```

3. **Khởi chạy bằng Docker Compose**:
   Sử dụng cấu hình Docker Compose trong thư mục gốc để build bản dựng production tối ưu:
   ```bash
   # Build image production
   docker compose build app
   
   # Khởi chạy ở chế độ chạy ngầm
   docker compose up app -d
   ```

4. **Kiểm tra Uptime & Health Check**:
   Gửi yêu cầu kiểm tra endpoint sức khỏe hệ thống:
   ```bash
   curl -i https://noithatphuongdong.vn/api/health
   # Kết quả mong muốn: HTTP 200 OK {"status":"ok","database":"connected"}
   ```

### 2.2 Triển khai trên Vercel (Frontend) & Supabase Cloud (Database)

1. Kết nối kho lưu trữ Github với dự án Vercel.
2. Thêm toàn bộ các biến môi trường vào phần cấu hình Environment Variables trên Vercel dashboard.
3. Vercel sẽ tự động build và deploy dự án mỗi khi có lệnh push lên nhánh chính (`main` / `master`).

---

## 3. Quy trình Sao lưu & Khôi phục dữ liệu (Backup & Restore)

Để tự động hóa việc sao lưu cơ sở dữ liệu Supabase, chúng tôi cung cấp kịch bản chạy bằng script `scripts/backup.ts`.

### 3.1 Quy trình Backup

Chạy script backup trên môi trường VPS hoặc local (có kết nối CSDL thực tế):
```bash
npx tsx scripts/backup.ts backup
```

**Cách thức hoạt động**:
- Script sẽ cố gắng kết nối với Docker local để dump CSDL qua Supabase CLI.
- Nếu không có Supabase CLI, nó sẽ tự động fallback sang lệnh `pg_dump` sử dụng `DATABASE_URL` trong file cấu hình `.env`.
- File kết quả backup sẽ được lưu trữ tại thư mục `backups/backup-<ISO_TIMESTAMP>.sql`.

*Khuyến nghị: Thiết lập Cron Job trên VPS định kỳ 1 ngày/lần để sao lưu dữ liệu:*
```bash
0 2 * * * cd /path/to/project && npx tsx scripts/backup.ts backup >> /var/log/db-backup.log 2>&1
```

### 3.2 Quy trình Restore (Khôi phục sự cố)

Khi cần khôi phục lại dữ liệu từ một bản sao lưu cụ thể:
```bash
npx tsx scripts/backup.ts restore backups/backup-xxxx-xx-xx.sql
```

**Quy trình khôi phục thủ công nếu script gặp sự cố**:
1. Chuẩn bị tệp tin SQL backup.
2. Chạy lệnh khôi phục qua psql client:
   ```bash
   psql -h <DB_HOST> -p <DB_PORT> -U postgres -d postgres -f <path_to_backup_file.sql>
   ```

---

## 4. Giám sát & Quản lý Lỗi (Monitoring & Error Tracking)

### 4.1 Cấu hình Giám sát Lỗi sản xuất
Để bắt lỗi runtime và crash logs phía người dùng cũng như Server-side:
- **Tích hợp Sentry**:
  1. Cài đặt thư viện: `pnpm add @sentry/nextjs`
  2. Chạy cấu hình tự động: `npx sentry-wizard -i nextjs`
  3. Cấu hình các biến môi trường `SENTRY_DSN` trong cài đặt deployment để logs tự động đồng bộ lên Dashboard Sentry.

### 4.2 Cảnh báo tự động về Slack/Discord khi gửi báo giá lỗi
Trong API route xử lý gửi báo giá `/api/contact/route.ts`, hãy thêm khối catch-error ghi log và bắn notification webhook sang Slack/Discord khi có lỗi truyền gửi thông báo qua Resend, để đội kỹ thuật có thể xử lý thủ công kịp thời mà không làm mất thông tin báo giá của khách hàng (dữ liệu báo giá vẫn được lưu trong bảng `quote_requests` của Supabase).

---

## 5. Kịch bản Rollback (Quay lui phiên bản)

Nếu bản cập nhật mới gặp lỗi nghiêm trọng sau khi triển khai:

- **Nếu chạy qua Docker VPS**:
  ```bash
  # Quay về commit cũ an toàn
  git checkout <last_working_commit_hash>
  
  # Rebuild và tái khởi động container
  docker compose down
  docker compose up --build -d app
  ```
- **Nếu chạy qua Vercel**:
  1. Truy cập Vercel Dashboard của dự án.
  2. Chọn tab `Deployments`.
  3. Tìm phiên bản chạy ổn định trước đó, click nút `...` và chọn `Redeploy` -> `Promote to Production`.
