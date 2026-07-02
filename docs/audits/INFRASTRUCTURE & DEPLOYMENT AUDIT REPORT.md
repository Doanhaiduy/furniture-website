# BÁO CÁO AUDIT HẠ TẦNG & TRIỂN KHAI (INFRASTRUCTURE & DEPLOYMENT AUDIT REPORT)

**Dự án**: Showroom Nội Thất & Thiết Bị Vệ Sinh Phương Đông  
**Vai trò thực hiện**: Principal DevOps Engineer + Solution Architect + Platform Auditor  
**Ngày thực hiện**: 13 tháng 06, 2026  
**Trạng thái hệ thống**: Giai đoạn chuyển giao từ Demo UI sang Triển khai Production  

---

## 1. EXECUTIVE SUMMARY (TÓM TẮT ĐÁNH GIÁ CHUNG)

Hệ thống hiện tại đang ở trạng thái **Dev-ready** và được tối ưu hóa cho việc giả lập giao diện (**Vercel Demo**) thông qua việc sử dụng cơ chế dữ liệu giả lập (`NEXT_PUBLIC_USE_MOCK_DATA=true`). 

Qua quá trình quét toàn bộ codebase và các cấu hình triển khai, chúng tôi phát hiện **02 lỗ hổng cấu hình nghiêm trọng (Critical Blockers)** trực tiếp ngăn cản hệ thống chạy trên môi trường Docker Production và VPS Self-host:

1. **Xác minh Route Guard trong proxy.ts**: Đảm bảo file bảo vệ định tuyến quản trị [proxy.ts](file:///d:/THCode/AI/furniture-website/proxy.ts) hoạt động ổn định (phiên bản Next.js 16.2.6 sử dụng Turbopack đã chuyển đổi cơ chế Route Guard sang `proxy.ts`, xuất hàm `proxy` và loại bỏ `middleware.ts`). Cần xác minh tệp này để tránh lộ các route quản trị `/admin/*` khi tắt dữ liệu giả lập.
2. **Crash Build Docker Production**: File [next.config.ts](file:///d:/THCode/AI/furniture-website/next.config.ts) thiếu cấu hình `output: "standalone"`, khiến lệnh `pnpm build` không sinh ra thư mục `.next/standalone`. Dockerfile Production (dòng 45) sẽ bị lỗi biên dịch (Crash) ngay lập tức khi cố copy thư mục này.

Để chuyển đổi thành công sang mô hình **VPS Self-host** với **Supabase Local Stack**, chúng ta cần khắc phục các lỗi cấu hình trên, hoàn thiện API thật cho Gemini AI và Cloudinary, đồng thời triển khai một Reverse Proxy (khuyên dùng Caddy) trước khi cấu hình chạy chính thức.

---

## 2. CURRENT DEPLOYMENT STATE (HIỆN TRẠNG TRIỂN KHAI)

### 2.1. Đánh giá chế độ hoạt động hiện tại
Ứng dụng đang được cấu hình theo chế độ **Hybrid (Lai)** nhưng thiên hướng **Vercel Demo** nhiều hơn.
*   **Local Dev**: Sử dụng Supabase CLI chạy local qua cổng `54321` và `54322`, kết hợp hot-reload Next.js.
*   **Vercel Demo**: Triển khai bản preview UI cho khách hàng xem tại URL `https://furniture-website-sable-phi.vercel.app` sử dụng dữ liệu tĩnh cứng được mock hoàn toàn.

### 2.2. Bảng đánh giá chi tiết hiện trạng hạ tầng

| Hạng mục | Hiện trạng | Bằng chứng trong code/config | Đánh giá |
| :--- | :--- | :--- | :--- |
| **Next.js App Build** | Chưa hỗ trợ build Docker Standalone | [next.config.ts](file:///d:/THCode/AI/furniture-website/next.config.ts) thiếu `output: "standalone"`. | 🔴 **CRITICAL**: Dockerfile production sẽ crash khi build vì không tìm thấy thư mục standalone. |
| **Route Guard & Security** | Cần xác minh ở runtime | Cấu hình Route Guard chạy qua [proxy.ts](file:///d:/THCode/AI/furniture-website/proxy.ts) (Next 16). | 🔴 **CRITICAL**: Đảm bảo các bộ lọc bảo vệ hoạt động chính xác trong file `proxy.ts` để các trang quản trị không bị truy cập tự do nếu tắt mock data. |
| **Dữ liệu ứng dụng** | Phụ thuộc hoàn toàn vào Mock Data | Biến `NEXT_PUBLIC_USE_MOCK_DATA=true` bật ở cả `.env` và `.env.production`. | 🟡 **HIGH**: Mọi truy vấn database đều bị bypass qua các hàm mock trong [showroom-data.ts](file:///d:/THCode/AI/furniture-website/lib/showroom-data.ts). |
| **AI Assistant** | Chỉ là giả lập UI (Mock) | Hàm `handleAiTranslate` trong [admin-workflows.tsx](file:///d:/THCode/AI/furniture-website/components/showroom/admin-workflows.tsx#L3602) dùng `setTimeout` giả lập. | 🟡 **HIGH**: Chưa có API route `/api/admin/ai/generate-draft` kết nối Gemini SDK thực tế. |
| **Media Upload** | Chỉ hỗ trợ link ảnh tĩnh hoặc mock | Cấu hình Cloudinary trong `.env` sử dụng dummy key. Chưa có API ký số (signed upload). | 🟡 **HIGH**: Cần triển khai luồng upload thật và lưu dữ liệu vào Supabase thông qua Cloudinary CDN. |
| **Email Notification** | Đã viết API thật nhưng chưa kiểm thử | API [route.ts](file:///d:/THCode/AI/furniture-website/app/api/contact/route.ts) có gọi tới thư viện `resend` nhưng đang dùng dummy API key. | 🟢 **MEDIUM**: Cần cấu hình API key thật để test luồng gửi email báo giá. |
| **Mức độ sẵn sàng** | **Dev-ready** (Cho chạy mock và phát triển tính năng cục bộ) | Thiếu cấu hình VPS, SSL, Reverse Proxy, và cấu hình chạy database local thật. | 🔴 **CHƯA ĐỦ ĐỂ CHẠY PRODUCTION** |

---

## 3. TARGET VPS ARCHITECTURE (KIẾN TRÚC MỤC TIÊU TRÊN VPS)

### 3.1. Sơ đồ luồng logic (Text-based Diagram)

```
                       [ HTTPS (443) / HTTP (80) ]
                                    │
                                    ▼
                     ┌─────────────────────────────┐
                     │    Caddy / Nginx Proxy      │  (SSL Termination & Domain Routing)
                     └──────────────┬──────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │ (Mạng nội bộ Docker)  │                       │
            ▼                       ▼                       ▼
   ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
   │   Next.js App   │     │  Supabase Kong  │     │ Supabase Studio │ (Chỉ cho phép IP Admin
   │   (Port 3000)   │     │  (Port 8000)    │     │   (Port 54323)  │  hoặc chặn Basic Auth)
   └────────┬────────┘     └────────┬────────┘     └─────────────────┘
            │                       │
            │                       ├───────────────────────┐
            │                       ▼                       ▼
            │              ┌─────────────────┐     ┌─────────────────┐
            │              │  Supabase GoTrue│     │ Supabase PostgREST│
            │              │     (Auth)      │     │      (API)      │
            │              └────────┬────────┘     └────────┬────────┘
            │                       │                       │
            └───────────────────────┼───────────────────────┘
                                    ▼
                           ┌─────────────────┐
                           │   PostgreSQL 17 │ (Volume: pgdata - Không expose port ra ngoài)
                           └─────────────────┘
                                    │
            ┌───────────────────────┴───────────────────────┐
            ▼ (External Cloud API)                          ▼ (External Cloud API)
     ┌──────────────┐                                ┌──────────────┐
     │  Cloudinary  │                                │  Resend /    │
     │  (Media CDN) │                                │  Gemini AI   │
     └──────────────┘                                └──────────────┘
```

### 3.2. Danh mục các Container/Service trong Stack triển khai

Khi triển khai trên VPS bằng Docker, hệ thống sẽ bao gồm các container sau:

| Container / Service | Vai trò | Bắt buộc? | Dữ liệu Persist? | Phạm vi (Public/Internal) | Ghi chú |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **caddy** | Reverse Proxy, SSL tự động, định tuyến domain. | **Bắt buộc** | Có (SSL certs) | Public (80, 443) | Thay thế Nginx để quản lý SSL cực kỳ đơn giản và an toàn. |
| **furniture-app** | Next.js Standalone Node server chạy mã nguồn. | **Bắt buộc** | Không | Internal (3000) | Nhận request từ Caddy. Không expose port ra ngoài. |
| **supabase-db** | PostgreSQL 17 chứa toàn bộ schema và dữ liệu. | **Bắt buộc** | **Có (pgdata)** | Internal (5432) | Bất kỳ thay đổi schema nào đều được quản lý qua CLI migrations. |
| **supabase-auth** | GoTrue handle JWT, session, signup/login. | **Bắt buộc** | Không | Internal (9999) | Được route qua Kong gateway. |
| **supabase-rest** | PostgREST ánh xạ database sang REST API. | **Bắt buộc** | Không | Internal (3000) | Dùng để giao tiếp trực tiếp từ Client qua Supabase JS. |
| **supabase-kong** | API Gateway định tuyến tất cả các API của Supabase. | **Bắt buộc** | Không | Public/Internal (8000) | Điểm đầu cuối kết nối duy nhất của Supabase client. |
| **supabase-studio** | Web GUI quản trị cơ sở dữ liệu Supabase. | *Tùy chọn* | Không | Internal (54323) | Nên tắt ở production, hoặc đặt sau lớp bảo vệ Basic Auth của Caddy. |
| **supabase-realtime** | Xử lý lắng nghe sự kiện thời gian thực. | Không | Không | Tắt | Dự án không có tính năng realtime (Out of scope). |
| **supabase-storage** | Quản lý lưu trữ file cục bộ của Supabase. | Không | Không | Tắt | Đã sử dụng Cloudinary làm dịch vụ lưu trữ media chính. |
| **supabase-functions** | Supabase Edge Functions. | Không | Không | Tắt | Toàn bộ logic chạy bằng Next.js Server Actions & API. |

---

## 4. THIRD-PARTY PROVIDERS AUDIT (ĐÁNH GIÁ DỊCH VỤ BÊN THỨ BA)

| Provider | Mục đích | Trạng thái tích hợp | Bắt buộc cho prod? | Có self-host được không? | Env liên quan | Ghi chú |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **Supabase** | DB, Auth, RLS, RPC | Mới chỉ chạy với Supabase CLI local dev. | **Bắt buộc** | **Có** (Self-host bằng Docker Stack chính thức) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | VPS production sẽ trỏ đến Supabase local stack chạy chung mạng Docker. |
| **Cloudinary** | Lưu trữ, tối ưu hóa hình ảnh/video | Đang dùng mock. Chưa viết signed upload handler. | **Bắt buộc** | Không | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cần triển khai api upload thật ở Phase 07 để editor tải ảnh sản phẩm/blog. |
| **Resend** | Gửi email báo giá cho quản trị viên | API [route.ts](file:///d:/THCode/AI/furniture-website/app/api/contact/route.ts) đã code xong nhưng chưa test key thật. | **Bắt buộc** | Có thể (nhưng nên dùng Resend cloud) | `RESEND_API_KEY`, `QUOTE_NOTIFICATION_RECIPIENTS` | Có thể thay bằng dịch vụ SMTP tự host, nhưng thư viện `resend` đã được cài cứng. |
| **Google Gemini** | Dịch thuật tự động và tạo nháp nội dung song ngữ | Chưa viết API route thật, hoàn toàn là mock UI client. | **Bắt buộc** | Không | `GEMINI_API_KEY`, `AI_SECRET_ENCRYPTION_KEY` | Cần tạo API kết nối SDK thật và mã hóa AES-GCM-256 khóa API trong DB. |
| **Vercel** | Hosting demo UI | Đã deploy và liên kết tên miền demo. | Không | Không | Không | Không dùng cho production chính của dự án. |
| **Google Maps** | Nhúng bản đồ vị trí showroom | Đã cấu hình thẻ Iframe tĩnh. | **Bắt buộc** | Không | `GOOGLE_MAPS_EMBED_ALLOWED_ORIGIN` | Cần cấu hình biến môi trường để chống việc lạm dụng Iframe ngoài domain đăng ký. |

---

## 5. ENVIRONMENT VARIABLES AUDIT (ĐÁNH GIÁ BIẾN MÔI TRƯỜNG)

### 5.1. Bảng phân tích toàn bộ biến môi trường tham chiếu trong Code

Chúng tôi đã quét toàn bộ các tệp định nghĩa và kiểm tra schema của biến môi trường tại [schema.ts](file:///d:/THCode/AI/furniture-website/lib/env/schema.ts):

| Tên biến môi trường | Được dùng ở file nào | Mục đích | Required/Optional | Dev | Vercel Demo | VPS Prod | Ghi chú |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `NEXT_PUBLIC_SITE_URL` | `schema.ts`, sitemap, robots | URL trang chủ public phục vụ sinh SEO sitemap. | Required | `http://localhost:3000` | URL Vercel | Domain chính thức (ví dụ: `https://phuongdong.vn`) | |
| `NEXT_PUBLIC_SUPABASE_URL` | `client.ts`, `server.ts`, `proxy.ts` | URL kết nối cổng Kong API Gateway của Supabase. | **Required** | `http://127.0.0.1:54321` | URL Supabase Cloud | `http://127.0.0.1:8000` (hoặc domain con) | Client dùng qua Kong public, server có thể dùng nội bộ. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `client.ts`, `server.ts`, `proxy.ts` | Khóa công khai của Supabase API. | **Required** | Key mặc định CLI | Key Cloud | Key tự sinh ở Production | |
| `SUPABASE_SERVICE_ROLE_KEY` | `server.ts`, `schema.ts` | Khóa đặc quyền bypass RLS dùng ở server. | **Required** | Key mặc định CLI | Key Cloud | Key tự sinh ở Production | **Cấm lộ ra client!** |
| `SUPABASE_URL_INTERNAL` | `server.ts` (không khai báo ở schema) | URL gọi Supabase trong mạng nội bộ Docker. | Optional | Không dùng | Không dùng | `http://supabase-kong:8000` | Giúp tối ưu hóa tốc độ kết nối nội bộ Next.js -> Supabase. |
| `NEXT_PUBLIC_USE_MOCK_DATA` | `schema.ts`, auth, mutations, queries | Bật tắt dữ liệu giả lập. | Optional | `true` (mặc định) | `true` | **`false`** | **Bắt buộc phải set false ở VPS Production.** |
| `DATABASE_URL` | `schema.ts`, `docker-compose.yml` | Connection string PostgreSQL dùng cho migration. | Optional | Port `54322` | Không dùng | Port `5432` nội bộ | Dùng cho Supabase CLI migrate database. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `schema.ts`, upload | Định danh Cloud Name trên Cloudinary. | Optional | dummy | dummy | Tên thật | Phục vụ hiển thị ảnh qua thẻ `<Image>`. |
| `CLOUDINARY_API_KEY` | `schema.ts` | Khóa API Cloudinary. | Optional | dummy | dummy | Key thật | Dùng để ký số yêu cầu upload. |
| `CLOUDINARY_API_SECRET` | `schema.ts` | Khóa bí mật Cloudinary. | Optional | dummy | dummy | Key thật | **Tuyệt đối không được prefix NEXT_PUBLIC_**. |
| `CLOUDINARY_UPLOAD_FOLDER` | `schema.ts` | Thư mục phân loại ảnh trên Cloudinary. | Optional | showroom | showroom | Tên folder thật | Thường đặt là `phuongdong_showroom`. |
| `RESEND_API_KEY` | `schema.ts`, contact API | Khóa API của dịch vụ Resend. | Optional | dummy | dummy | Key thật | Dùng để gửi mail thật. |
| `QUOTE_NOTIFICATION_RECIPIENTS` | `schema.ts`, `recipients.ts` | Danh sách email admin nhận thông báo báo giá. | Optional | admin@example.com | dummy | Email thật | Phân tách bằng dấu phẩy `,`. |
| `GEMINI_API_KEY` | `schema.ts` | Khóa API Google Gemini. | Optional | dummy | dummy | Key thật | Dùng làm key mặc định nếu chưa lưu key trong DB. |
| `AI_SECRET_ENCRYPTION_KEY` | `schema.ts`, `server.ts` | Khóa đối xứng mã hóa API keys trong DB. | **Required** (khi dùng AI/Settings) | 32 ký tự | 32 ký tự | 32 ký tự bảo mật | **Bắt buộc có độ dài đúng 32 bytes/ký tự.** |
| `GOOGLE_MAPS_EMBED_ALLOWED_ORIGIN` | `schema.ts` | Origin được phép nhúng maps iframe. | Optional | localhost:3000 | URL Vercel | Domain chính thức | Bảo mật Iframe. |

### 5.2. Bộ Environment Variables Tối thiểu cần chuẩn bị cho Production

Chủ dự án (Owner) bắt buộc phải chuẩn bị các biến môi trường này trước khi deploy chính thức:

#### A. Nhóm Bắt buộc để Ứng dụng Boot được (App Boot & Database Connection)
```ini
NEXT_PUBLIC_SITE_URL=https://phuongdong.vn
NEXT_PUBLIC_SUPABASE_URL=https://supabase-api.phuongdong.vn
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
# Bắt buộc tắt chế độ mock dữ liệu để hệ thống ghi nhận vào Database thật
NEXT_PUBLIC_USE_MOCK_DATA=false
```

#### B. Nhóm Bắt buộc cho tính năng Đăng nhập & Mã hóa API Key
```ini
# Khóa mã hóa đối xứng AES-GCM-256 (Phải dài đúng 32 ký tự)
AI_SECRET_ENCRYPTION_KEY=a_very_secure_32_character_string_!!!
```

#### C. Nhóm Bắt buộc cho tính năng Tải ảnh lên (Upload & Media Gallery)
```ini
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_UPLOAD_FOLDER=showroom_production
```

#### D. Nhóm Bắt buộc cho tính năng gửi Email báo giá (Quote Flow)
```ini
RESEND_API_KEY=re_your_resend_api_key
QUOTE_NOTIFICATION_RECIPIENTS=sales@phuongdong.vn,manager@phuongdong.vn
```

#### E. Nhóm Bắt buộc cho Trợ lý AI (Gemini Assistant)
```ini
# Có thể cấu hình trực tiếp qua biến môi trường hoặc cấu hình trong trang Settings Admin sau khi đăng nhập
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
GEMINI_DEFAULT_MODEL=gemini-1.5-flash
```

---

## 6. FEATURE READINESS VS CONFIG MATRIX (MA TRẬN TÍNH NĂNG VÀ HẠ TẦNG)

| Tính năng | Cần Container/Service | Cần Env Variables | Trạng thái hiện tại | Thiết sót hạ tầng & Config | Mức độ |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Trang Public (Sản phẩm, Blog, Showroom)** | `furniture-app`, `supabase-db`, `supabase-kong` | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_USE_MOCK_DATA=false` | Sẵn sàng (Real reads đã code xong trong [queries.ts](file:///d:/THCode/AI/furniture-website/lib/supabase/queries.ts)). | Chỉ cần chuyển đổi dữ liệu mock sang `false` là hoạt động. | 🟢 Low |
| **Đăng nhập & Quản trị Admin (Auth)** | `furniture-app`, `supabase-auth`, `supabase-db` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Cần xác minh ở môi trường thật** | **Cần xác minh `proxy.ts`** chạy Route Guard chính xác (Next.js 16.2.6 sử dụng `proxy.ts` thay cho `middleware.ts`). | 🔴 **Critical** |
| **Gửi liên hệ / Yêu cầu báo giá** | `furniture-app`, `supabase-db`, `supabase-kong` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sẵn sàng (Đã code xong luồng insert Postgres qua RPC). | Cần tắt mock data và chạy Supabase Stack thật để lưu trữ. | 🟢 Low |
| **Gửi email thông báo** | `furniture-app`, `resend` (external) | `RESEND_API_KEY`, `QUOTE_NOTIFICATION_RECIPIENTS` | Chưa sẵn sàng | Đang cấu hình dummy key. Cần cung cấp API key Resend hoạt động thật. | 🟡 High |
| **Quản lý phân quyền Editor (RBAC)** | `furniture-app`, `supabase-db` | `NEXT_PUBLIC_USE_MOCK_DATA=false` | **Cần xác minh ở môi trường thật** | Đảm bảo Route Guard trong `proxy.ts` (Next 16) chặn phân quyền Editor ở tầng routing Next.js chính xác. | 🔴 **Critical** |
| **Upload ảnh bìa (Sản phẩm, Blog, Showroom)** | `furniture-app`, `cloudinary` (external) | `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Chưa sẵn sàng (Chưa tích hợp thật) | Thiếu API Route ký số Next.js và giao diện kết nối SDK Cloudinary (Phase 07). | 🟡 High |
| **Trợ lý AI dịch thuật & SEO** | `furniture-app`, `gemini` (external) | `GEMINI_API_KEY`, `AI_SECRET_ENCRYPTION_KEY` | Chưa sẵn sàng (Hoàn toàn là Mock) | Thiếu API route `/api/admin/ai/generate-draft` và logic giải mã API key từ bảng `integration_secrets`. | 🟡 High |

---

## 7. DOCKER AUDIT (ĐÁNH GIÁ CẤU HÌNH DOCKER)

### 7.1. Phân tích Dockerfile và docker-compose.yml hiện trạng

Chúng tôi tiến hành phân tích chi tiết cấu hình file Dockerfile tại gốc dự án:

```dockerfile
# 1. Base stage
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@11.5.0 --activate
WORKDIR /app

# 2. Deps stage
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* .npmrc* ./
RUN pnpm install --frozen-lockfile

# 3. Builder stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build # <-- LỖI PHÁT SINH Ở ĐÂY NẾU KHÔNG CÓ STANDALONE CONFIG TRONG next.config.ts

# 4. Runner stage
FROM base AS runner
ENV NODE_ENV=production
...
COPY --from=builder /app/.next/standalone ./ # <-- SẼ BỊ CRASH VÌ THƯ MỤC NÀY KHÔNG TỒN TẠI
COPY --from=builder /app/.next/static ./.next/static
```

### 7.2. Bảng đánh giá chi tiết Docker Audit

| File | Hiện trạng | Vấn đề | Mức độ | Khuyến nghị |
| :--- | :--- | :--- | :---: | :--- |
| **next.config.ts** | Thiếu cấu hình standalone output | Lệnh `pnpm build` không sinh ra thư mục `.next/standalone`. | 🔴 **Critical** | Thêm cấu hình `output: "standalone"` vào đối tượng `nextConfig`. |
| **Dockerfile** | Cấu hình Multi-stage tốt, chạy dưới user `nextjs` (non-root) an toàn. | Lỗi copy standalone như phân tích ở trên. | 🔴 **Critical** | Sẽ tự động sửa đổi khi khắc phục file `next.config.ts`. |
| **docker-compose.yml** | Cấu hình mạng ngoài `supabase_network_furniture-website` và liên kết với các container Supabase CLI. | 1. Cấu hình mạng external phụ thuộc vào việc phải cài Supabase CLI local trước.<br>2. Thiếu cấu hình Reverse Proxy.<br>3. Thiếu healthcheck cho container `app`. | 🟡 High | 1. Tách cấu hình compose local dev và compose production.<br>2. Định nghĩa một mạng nội bộ bridge duy nhất cho Next.js App, Postgres, Kong Gateway.<br>3. Bổ sung restart policy (`unless-stopped`). |

---

## 8. SELF-HOST SUPABASE AUDIT (ĐÁNH GIÁ TỰ HOST SUPABASE)

Để chạy sản xuất trên VPS, chúng ta sẽ tự host Supabase (Self-hosted Supabase) thay vì sử dụng gói đám mây Supabase Cloud.

### 8.1. Đánh giá mức độ phụ thuộc tính năng của Supabase

| Supabase capability | App có dùng không | Mức độ phụ thuộc | Thành phần self-host cần có | Ghi chú |
| :--- | :---: | :--- | :--- | :--- |
| **PostgreSQL** | **Có** | Cực kỳ cao | PostgreSQL 17 + pgvector | Lưu trữ toàn bộ dữ liệu thực thể, audit logs, secrets. |
| **Auth (GoTrue)** | **Có** | Cao | GoTrue container | Dùng cho phân quyền đăng nhập Dashboard Admin. |
| **PostgREST (API)** | **Có** | Cao | PostgREST container | Ánh xạ trực tiếp Database sang Restful API cho Client. |
| **Row Level Security (RLS)** | **Có** | Cao | Tích hợp trong Postgres | Đã viết migrations cấu hình các chính sách phân quyền cho các bảng. |
| **Edge Functions** | Không | Không | Deno Edge Runtime | Có thể **TẮT** để giảm tải dung lượng RAM VPS. |
| **Storage** | Không | Không | Supabase Storage container | Có thể **TẮT** (Chúng ta dùng Cloudinary cho media). |
| **Realtime** | Không | Không | Realtime container | Có thể **TẮT** (Out of scope). |

### 8.2. Các lưu ý quan trọng khi self-host Supabase trên VPS:
1. **Kong API Gateway (Port 8000)**: Phải đặt sau tường lửa hoặc cấu hình reverse proxy, chỉ cho phép cổng HTTPS công khai, cổng HTTP nội bộ.
2. **Supabase Studio (Port 54323)**: Không được công khai ra internet. Chỉ truy cập qua Localhost hoặc bảo mật bằng mật khẩu (Basic Auth).
3. **Thay đổi mật khẩu Database**: Mật khẩu mặc định trong config.toml/docker-compose của Supabase CLI là `postgres`. **Bắt buộc phải đổi sang chuỗi mật khẩu phức tạp** ở môi trường sản xuất.
4. **Tạo mới các Key bảo mật**: Phải tự sinh các khóa JWT Secret, Anon Key, và Service Role Key bằng thuật toán an toàn (HS256) tương thích với Supabase. Không sử dụng các khóa dummy có sẵn trong mã nguồn.

---

## 9. PERSISTENCE / BACKUP / OPERATIONS AUDIT (VẬN HÀNH & SAO LƯU)

Khi tự vận hành một máy chủ VPS riêng, chúng ta không có cơ chế tự sao lưu của các nhà cung cấp PaaS (như Supabase Cloud hay Vercel). Toàn bộ trách nhiệm thuộc về quy trình DevOps của dự án.

### 9.1. Ma trận Vận hành & Sao lưu dữ liệu

| Tài nguyên | Persist ở đâu | Cần backup? | Cách backup đề xuất | Priority |
| :--- | :--- | :---: | :--- | :---: |
| **Cơ sở dữ liệu (PostgreSQL)** | Docker Volume `/var/lib/postgresql/data` | **Bắt buộc** | Viết script chạy Cron job hàng ngày dump DB (`pg_dump`) nén ZIP gửi lên Google Drive/S3 AWS. | 🔴 **Critical** |
| **Ảnh / Video (Media Assets)** | Cloudinary Cloud Storage | Không | Cloudinary tự động quản lý và sao lưu trên hạ tầng CDN của họ. | 🟢 Low |
| **SSL Certificates** | Caddy Volume (chứa các cặp key/cert mã hóa Let's Encrypt) | Có | Backup thư mục lưu trữ của Caddy để tránh việc bị rate limit khi đăng ký lại chứng chỉ nhiều lần. | 🟡 High |
| **Audit Logs / System Logs** | Bảng `audit_logs` trong DB + stdout Docker | Có | Xuất nhật ký log Docker ra file và cấu hình Logrotate để tránh đầy ổ cứng VPS. | 🟡 High |

### 9.2. Quy trình Khôi phục sự cố (Restore Checklist)
1. Cài đặt lại Docker & Docker Compose trên VPS mới.
2. Sao chép thư mục cấu hình và các tệp `.env` bí mật.
3. Chạy `docker compose up -d` để khởi động lại toàn bộ stack dịch vụ.
4. Sử dụng lệnh `pg_restore` để nạp lại bản sao lưu database gần nhất vào container `supabase-db`.
5. Kiểm tra tính toàn vẹn của dữ liệu bằng trang quản trị `/admin`.

---

## 10. SECURITY & PRODUCTION READINESS AUDIT (ĐÁNH GIÁ BẢO MẬT)

Chúng tôi đã thực hiện rà soát bảo mật toàn diện trên toàn bộ codebase và cấu hình triển khai:

### 10.1. Điểm danh các lỗ hổng bảo mật hiện tại

| Hạng mục bảo mật | Hiện trạng | Rủi ro | Khuyến nghị | Severity |
| :--- | :--- | :--- | :--- | :---: |
| **Định tuyến admin** | Cần xác minh Route Guard | Editor hoặc người dùng chưa đăng nhập có thể truy cập thẳng vào các trang quản trị `/admin/*` nếu tắt chế độ mock và Route Guard không chạy đúng. | **Xác minh và củng cố** Route Guard chạy qua `proxy.ts` (Next 16) ở gốc dự án. | 🔴 **Critical** |
| **Expose Database** | Cổng DB mặc định là `54322` đang mở public | Tin tặc có thể quét cổng và tấn công Brute-force mật khẩu Postgres. | Cấu hình tường lửa VPS (UFW) chỉ mở cổng `80` và `443`. **Chặn hoàn toàn** cổng `54322` và `54321` từ internet. | 🔴 **Critical** |
| **Expose Supabase Studio** | Cổng Studio `54323` không có lớp bảo mật | Bất kỳ ai biết IP VPS đều có thể truy cập Studio để sửa đổi cấu trúc dữ liệu. | Chặn cổng này hoặc đặt sau lớp bảo vệ Basic Auth của Caddy Server. | 🔴 **Critical** |
| **Khóa bí mật API AI** | Gemini API keys lưu trong DB | Nếu khóa mã hóa `AI_SECRET_ENCRYPTION_KEY` bị rò rỉ hoặc quá yếu, tin tặc sẽ giải mã được toàn bộ API key. | 1. Sử dụng khóa đối xứng AES-GCM-256 dài đúng 32 ký tự ngẫu nhiên.<br>2. Cấm ghi đè khóa mã hóa này lên client bundle. | 🟡 High |
| **Rate Limiter Memory** | Chạy in-memory cục bộ trên Next.js process | Nếu Next.js bị crash hoặc restart, cache IP bị xóa, dễ bị spam liên tục trở lại. | Hiện tại chạy trên 1 VPS đơn lẻ thì cơ chế này chấp nhận được. Nếu scale ngang sau này cần chuyển sang Redis. | 🟢 Low |
| **Cấu hình CORS / CSP** | Chưa được định nghĩa chặt chẽ | Thiếu các HTTP Header bảo mật chống XSS và Clickjacking. | Bổ sung cấu hình headers bảo mật vào `next.config.ts` hoặc Caddyfile. | 🟡 High |

---

## 11. CÁC BIẾN MÔI TRƯỜNG & CẤU HÌNH CẦN OWNER CUNG CẤP NGAY

Để hỗ trợ đội ngũ lập trình cấu hình triển khai thật, Chủ dự án (Owner) cần chuẩn bị và cung cấp các thông tin sau:

1. **Thông tin Tên miền (Domain)**: Tên miền chính thức của website (Ví dụ: `phuongdong.vn`) và các sub-domain nếu muốn tách biệt hệ thống (ví dụ: `supabase.phuongdong.vn` cho API gateway).
2. **Khóa mã hóa AI (32 ký tự)**: Một chuỗi ký tự ngẫu nhiên dài đúng 32 chữ số để tạo khóa `AI_SECRET_ENCRYPTION_KEY`.
3. **Tài khoản Cloudinary**: Đăng ký tài khoản Cloudinary Cloud và cung cấp:
   *   Cloud Name
   *   API Key
   *   API Secret
4. **Tài khoản Resend**: Đăng ký Resend và cung cấp API Key thật.
5. **Khóa API Google Gemini**: Đăng ký trên Google AI Studio và lấy API key thật.
6. **Địa chỉ email nhận thông báo**: Địa chỉ mail của bộ phận bán hàng nhận quote request.

---

## 12. LỘ TRÌNH TRIỂN KHAI VPS SELF-HOST ĐỀ XUẤT (4 PHASES)

Chúng tôi đề xuất một lộ trình triển khai hạ tầng gồm 4 giai đoạn cụ thể để đảm bảo hệ thống vận hành trơn tru và an toàn:

### Giai đoạn 1: Sửa đổi cấu hình Codebase để tương thích Docker Production (Phát triển nội bộ)
*   **Mục tiêu**: Khắc phục các lỗi cấu hình nghiêm trọng để build Docker thành công.
*   **Hành động cụ thể**:
    1. Thêm `output: "standalone"` vào file `next.config.ts`.
    2. Xác minh và tối ưu hóa file `proxy.ts` (Next 16) ở thư mục gốc của dự án Next.js để kích hoạt Route Guard.
    3. Đóng gói thử nghiệm Docker image sản xuất local:
       ```bash
       docker build -t furniture-website-prod .
       ```

### Giai đoạn 2: Cài đặt và Staging trên VPS (Chế độ thật - Tắt Mock Data)
*   **Mục tiêu**: Deploy ứng dụng Next.js và Supabase Stack lên VPS môi trường Staging.
*   **Hành động cụ thể**:
    1. Thiết lập VPS Ubuntu, cài đặt Docker và Docker Compose.
    2. Cài đặt Supabase Docker Stack chính thức trên VPS. Thiết lập các biến môi trường và chạy thử nghiệm migrations dữ liệu.
    3. Cấu hình Caddy Server trỏ tên miền phụ thử nghiệm (ví dụ: `staging.phuongdong.vn`) về container Next.js App.
    4. Thiết lập biến `NEXT_PUBLIC_USE_MOCK_DATA=false` ở môi trường staging để kiểm tra tính đúng đắn khi đọc/ghi trực tiếp vào database.

### Giai đoạn 3: Triển khai Production chính thức
*   **Mục tiêu**: Khai hỏa hệ thống chạy thật trên VPS cho khách hàng truy cập.
*   **Hành động cụ thể**:
    1. Cấu hình tên miền chính `phuongdong.vn` trỏ về IP của VPS.
    2. Cập nhật các biến môi trường thật (Cloudinary, Resend, Gemini API Key thật) vào file `.env.production`.
    3. Kích hoạt Caddy tự động lấy chứng chỉ SSL miễn phí Let's Encrypt cho tên miền chính thức.
    4. Thực hiện chuyển giao dữ liệu mẫu (Seeding) ban đầu vào Database.

### Giai đoạn 4: Thiết lập Giám sát, Sao lưu và Tối ưu hóa bảo mật (Hardening)
*   **Mục tiêu**: Đảm bảo hệ thống hoạt động liên tục (Uptime > 99.9%) và có khả năng phục hồi dữ liệu khi gặp sự cố.
*   **Hành động cụ thể**:
    1. Thiết lập script Cron Job chạy định kỳ hàng ngày dump database Postgres gửi lên cloud storage.
    2. Cấu hình Docker Logrotate giới hạn kích thước file log tối đa 50MB để tránh phân mảnh ổ cứng VPS.
    3. Thiết lập tường lửa UFW đóng tất cả các cổng kết nối ngoại trừ cổng `80` và `443`.
    4. Cài đặt các công cụ giám sát Uptime (như Uptime Kuma hoặc dịch vụ bên thứ ba) gửi cảnh báo về Telegram/Slack nếu website gặp sự cố dừng hoạt động.
