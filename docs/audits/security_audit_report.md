# SECURITY AUDIT & AUTHENTICATION REPORT

**Auditor Role**: Senior Security Auditor + Auth/RBAC Reviewer + Production Readiness Assessor  
**Audit Date**: 2026-06-19  
**Scope**: Toàn bộ security/auth/permission/secrets của hệ thống admin + client + Supabase self-hosted + Docker env  
**Verdict**: 🔴 **BLOCKING** (Hệ thống có các lỗ hổng bảo mật nghiêm trọng trực tiếp ngăn cản go-live)

---

## 1. EXECUTIVE SUMMARY

Hệ thống hiện tại có cấu trúc phân quyền tương đối rõ nét giữa các vai trò `admin`, `editor`, và `anonymous` ở mức lý thuyết (bảng `profiles`, các hàm kiểm tra phân quyền `requireEditorOrAdmin` trong mutation). Tuy nhiên, **ở tầng triển khai thực tế**, hệ thống đang chịu các lỗ hổng nghiêm trọng cho phép bypass hoàn toàn lớp bảo vệ admin, lộ key sản xuất qua Docker và lỗ hổng Stored XSS.

Dưới đây là tóm tắt nhanh trạng thái an ninh:
- **Route Guard (Next.js Middleware)**: 🔴 **BROKEN**. File định nghĩa route guard nằm ở `proxy.ts` và không có tệp `middleware.ts` ở gốc dự án Next.js. Next.js hoàn toàn bỏ qua route guard này.
- **Dynamic Admin Page Protection**: 🔴 **BROKEN**. Dynamic page `/admin/[section]` tự động gán quyền `admin` khi người dùng chưa đăng nhập thay vì chuyển hướng đến trang login.
- **Baking Secrets in Docker**: 🔴 **RISKY**. Tệp `.env.production` chứa token dịch vụ Supabase, Resend, Cloudinary, Gemini thật được copy thẳng vào Docker layers do thiếu khai báo trong `.dockerignore`.
- **Stored XSS**: ⚠️ **RISKY**. Nhúng bản đồ showroom sử dụng `dangerouslySetInnerHTML` trực tiếp từ chuỗi do người dùng nhập mà không qua bộ lọc làm sạch (sanitization).

---

## 2. ENDPOINT & ROUTE GUARD AUDIT (PERMISSION AUDIT)

### 2.1 Route Guard Analysis
Next.js chỉ nhận diện tệp `middleware.ts` (hoặc `src/middleware.ts`) tại thư mục gốc để làm cổng chặn yêu cầu (middleware). 
- Hiện tại, dự án chỉ có file [proxy.ts](file:///d:/THCode/AI/furniture-website/proxy.ts) chứa hàm `proxy(request: NextRequest)`.
- Không có bất kỳ file `middleware.ts` nào import và gọi lại hàm `proxy` này.
- **Hậu quả**: Toàn bộ logic chặn phân quyền ở router Next.js không hoạt động. Người dùng chưa đăng nhập có thể truy cập trực tiếp các URL `/admin/*`.

### 2.2 Dynamic Admin Route Bypass
Tệp [app/admin/[section]/page.tsx](file:///d:/THCode/AI/furniture-website/app/admin/[section]/page.tsx) bảo vệ các tuyến dynamic cho admin (products, categories, settings, quotes, users) bằng đoạn mã sau:

```typescript
// app/admin/[section]/page.tsx L.56-57:
const user = await getCurrentUser();
const role = user?.role ?? "admin";
```

- **Lỗ hổng**: Nếu người dùng chưa đăng nhập, `getCurrentUser()` trả về `null`. Khi đó, `role` sẽ mặc định chuyển thành `"admin"`.
- **Hậu quả**:
  - Trang không hề redirect người dùng chưa đăng nhập về `/admin/login`.
  - Thay vào đó, trang tiếp tục render `AdminShell` và `AdminSectionPage` với vai trò `"admin"`.
  - Nếu `process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"`, kẻ tấn công sẽ có toàn quyền xem, tạo, sửa, xóa dữ liệu trên UI dưới dạng mock dữ liệu của quản trị viên cao cấp nhất.
  - Nếu mock data tắt (`false`), mặc dù các API gọi tới Supabase sẽ bị chặn bởi RLS database (trả về danh sách trống), kẻ tấn công vẫn nhìn thấy toàn bộ giao diện bảng điều khiển admin, danh mục quản trị, và có thể gửi yêu cầu tấn công API.

### 2.3 Mock Bypass Risk
Trong tệp [proxy.ts](file:///d:/THCode/AI/furniture-website/proxy.ts) dòng 16-18:
```typescript
const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
if (useMock) {
  return NextResponse.next();
}
```
- **Hậu quả**: Nếu môi trường staging hoặc demo kích hoạt mock data để kiểm thử, toàn bộ các tuyến admin `/admin/*` sẽ không yêu cầu đăng nhập. Bất kỳ ai cũng có thể vào xem dữ liệu hệ thống mock.

---

## 3. SECRETS & DOCKER ENV AUDIT

### 3.1 Docker Layer Secrets Leak (Rò rỉ Key sản xuất qua Docker)
Trong tệp [.dockerignore](file:///d:/THCode/AI/furniture-website/.dockerignore), có dòng khai báo loại trừ `.env` nhưng **thiếu** loại trừ `.env.production`.
- Khi build Docker image thông qua [Dockerfile](file:///d:/THCode/AI/furniture-website/Dockerfile):
  ```dockerfile
  COPY . .
  ```
  Tệp `.env.production` sẽ được sao chép thẳng vào trong Docker image.
- **Hậu quả**: Các key cực kỳ nhạy cảm sau đây sẽ bị đóng gói vĩnh viễn trong Docker image layers:
  - `SUPABASE_SERVICE_ROLE_KEY` (Key vượt qua mọi chính sách bảo mật RLS database).
  - `CLOUDINARY_API_SECRET` (Quyền xóa và thay thế tài nguyên Cloudinary).
  - `RESEND_API_KEY` (Quyền gửi email mạo danh hệ thống).
  - `GEMINI_API_KEY` (Quyền sử dụng AI có trả phí).
  - `JWT_SECRET` (Khóa dùng để ký token đăng nhập người dùng).
- Bất kỳ ai truy cập được Docker registry hoặc lấy được image này đều có thể giải nén và đọc trọn vẹn tệp `.env.production` này, dẫn đến nguy cơ kiểm soát toàn bộ hạ tầng cơ sở dữ liệu và các bên thứ ba.

### 3.2 Key Encryption and Hints
Hệ thống sử dụng giải pháp lưu trữ API keys của bên thứ ba (Gemini, Resend, Cloudinary) trong bảng `integration_secrets` ở database.
- Cơ chế mã hóa sử dụng thuật toán **AES-256-GCM** thông qua tệp [encryption.ts](file:///d:/THCode/AI/furniture-website/lib/security/encryption.ts) là rất tốt và đạt chuẩn an toàn cao.
- Khóa mã hóa `AI_SECRET_ENCRYPTION_KEY` được truyền qua biến môi trường.
- Giao diện Admin chỉ hiển thị `masked_hint` (ví dụ: `****abcd`) của API key chứ không trả về bản rõ của API key cho trình duyệt. Đây là điểm cộng lớn về bảo mật.

---

## 4. INPUT, EMBED & UPLOAD SAFETY AUDIT

### 4.1 Stored XSS trong Showroom Maps Embed
Tệp [components/showroom/admin-workflows.tsx](file:///d:/THCode/AI/furniture-website/components/showroom/admin-workflows.tsx) dòng 5589-5590 thực hiện nhúng bản đồ từ trường dữ liệu `mapsEmbed` trong DB như sau:

```typescript
{data.mapsEmbed && data.mapsEmbed.includes("<iframe") ? (
  <div className="absolute inset-0 w-full h-full [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:absolute [&_iframe]:inset-0 border-0" dangerouslySetInnerHTML={{ __html: data.mapsEmbed }} />
```

- **Rủi ro**: Không hề có thư viện làm sạch (như DOMPurify) được sử dụng để lọc mã HTML.
- Nếu một biên tập viên (Editor) bị chiếm tài khoản hoặc kẻ tấn công thực hiện SQL Injection thành công, chúng có thể sửa giá trị của cột `mapsEmbed` thành:
  ```html
  <iframe src="javascript:alert(document.cookie)"></iframe>
  ```
  hoặc chèn trực tiếp các mã độc Javascript khác. Khi Quản trị viên (Admin) mở trang showroom trong bảng quản trị, mã độc Javascript sẽ thực thi ngay lập tức dưới quyền của Admin, dẫn đến đánh cắp session token, chiếm quyền kiểm soát hoặc thực hiện các hành vi phá hoại.
- Đối với trang public, tệp [app/[locale]/showrooms/page.tsx](file:///d:/THCode/AI/furniture-website/app/[locale]/showrooms/page.tsx) đã xử lý an toàn bằng cách kiểm tra URL bằng regex nghiêm ngặt (chỉ cho phép hostname `google.com/maps/embed`) và thêm thuộc tính `sandbox` vào iframe. Tuy nhiên, phần admin UI vẫn đang để hở XSS.

### 4.2 Safe Upload Validation
Tuyến API upload `/api/admin/media/upload` được thiết kế tương đối an toàn:
- Có kiểm tra quyền hạn `requireEditorOrAdmin()`.
- Giới hạn kích thước file ở mức `50MB`.
- Có whitelist định dạng file nghiêm ngặt (`ALLOWED_FORMATS` bao gồm ảnh và video thông dụng).
- Kiểm tra tính hợp lệ của URL (`secure_url.startsWith("https://res.cloudinary.com/")`), ngăn chặn kẻ xấu truyền các URL độc hại ngoài hệ thống Cloudinary để ghi nhận vào DB.

### 4.3 In-Memory Rate Limiting
Public quote form sử dụng cơ chế rate limit được viết trong [lib/quotes/rate-limit.ts](file:///d:/THCode/AI/furniture-website/lib/quotes/rate-limit.ts).
- Cơ chế này lưu trữ danh sách IP trong một `Map` in-memory.
- **Hạn chế**: Khi chạy trên môi trường serverless (như Vercel) hoặc các cụm container Docker load-balanced nhiều instance, bộ nhớ RAM không được chia sẻ. Kẻ xấu có thể bypass rate limit dễ dàng bằng cách phân tán request vào các instance khác nhau. Tuy nhiên, đối với một dự án showroom quy mô vừa, đây là giải pháp cơ bản tạm chấp nhận được ở mức ứng dụng.

---

## 5. TOP CRITICAL RISKS & GO-LIVE BLOCKERS

Hệ thống có **3 Go-live Blockers** bắt buộc phải xử lý trước khi deploy lên production:

| # | Rủi ro bảo mật | Mức độ | Hậu quả nếu không sửa |
|---|---|---|---|
| 🔴 **B01** | **Next.js Middleware Không Chạy** (Do đặt tên sai thành `proxy.ts`) | **Critical** | Bypass hoàn toàn cơ chế bảo vệ Route Guard. Toàn bộ khu vực admin bị lộ ra ngoài internet mà không có rào cản. |
| 🔴 **B02** | **Dynamic Route gán nhầm quyền admin** (`user?.role ?? "admin"`) | **Critical** | Bất kỳ ai cũng có thể vào xem và sửa đổi (nếu bật mock) hoặc xem giao diện Admin và thực hiện thăm dò bảo mật. |
| 🔴 **B03** | **Lộ API Keys trong Docker Layers** (Thiếu `.env.production` trong `.dockerignore`) | **High** | Lộ `SUPABASE_SERVICE_ROLE_KEY` và các API key thanh toán khác nếu Docker image được đẩy lên registry. |
| ⚠️ **R01** | **Stored XSS trong Showroom Maps Embed** | **Medium** | Tấn công đặc quyền ngang (Editor sang Admin) thông qua chèn mã độc vào iframe bản đồ showroom. |

---

## 6. REMEDIATION ROADMAP (KẾ HOẠCH KHẮC PHỤC)

### Bước 1: Khôi phục Route Guard hoạt động (Sửa B01)
Tạo file [middleware.ts](file:///d:/THCode/AI/furniture-website/middleware.ts) tại thư mục gốc của dự án để import và re-export hàm `proxy` từ `proxy.ts`:

```typescript
// middleware.ts
import { proxy } from "./proxy";
export default proxy;

export const config = {
  // Đồng bộ cấu hình matcher với proxy.ts
  matcher: ["/((?!api|_next|.*\\..*).*)", "/admin/:path*"],
};
```

### Bước 2: Sửa lỗi gán quyền mặc định trong Dynamic Router (Sửa B02)
Cập nhật tệp [app/admin/[section]/page.tsx](file:///d:/THCode/AI/furniture-website/app/admin/[section]/page.tsx) dòng 56-57:

```typescript
// Sửa đổi từ:
// const user = await getCurrentUser();
// const role = user?.role ?? "admin";

// Thành chặn và chuyển hướng an toàn:
const user = await getCurrentUser();
if (!user) {
  redirect("/admin/login");
}
const role = user.role;
```

### Bước 3: Đưa `.env.production` vào danh sách loại trừ Docker (Sửa B03)
Thêm dòng sau vào tệp [.dockerignore](file:///d:/THCode/AI/furniture-website/.dockerignore):

```text
.env.production
.env*.local
```
Đồng thời, cấu hình CI/CD hoặc môi trường chạy Docker để truyền các biến môi trường này dưới dạng **Docker Environment Variables** hoặc **Docker Secrets** thay vì lưu trữ dạng file cứng trong context build.

### Bước 4: Vô hiệu hóa Mock Mode Bypass (Khuyến nghị sản xuất)
Trong tệp [proxy.ts](file:///d:/THCode/AI/furniture-website/proxy.ts) và các API, cần cấu hình để vô hiệu hóa hoàn toàn `NEXT_PUBLIC_USE_MOCK_DATA` trên môi trường production, hoặc ít nhất là không cho phép bỏ qua cơ chế authentication của admin ngay cả khi đang chạy mock dữ liệu.

### Bước 5: Làm sạch chuỗi mapsEmbed (Sửa R01)
Thay vì sử dụng `dangerouslySetInnerHTML` với dữ liệu thô, hãy chuyển sang dùng component [GoogleMap](file:///d:/THCode/AI/furniture-website/components/public/GoogleMap.tsx) đã được viết sẵn hoặc viết một helper regex lọc kỹ chuỗi HTML chỉ chứa thẻ `iframe` với thuộc tính `src` trỏ tới `google.com/maps/embed`.
