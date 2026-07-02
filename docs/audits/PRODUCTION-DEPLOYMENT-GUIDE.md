# HƯỚNG DẪN TRIỂN KHAI PRODUCTION LÊN VPS (TỐI ƯU HÓA 30GB & DÙNG IP TRỰC TIẾP)

Tài liệu này hướng dẫn chi tiết từ một VPS Ubuntu trắng tinh (dung lượng nhỏ 30GB) đến một hệ thống Showroom Nội Thất Phương Đông chạy thực tế qua IP trực tiếp (không cần gõ cổng :3000), tự host Supabase, chạy migration dữ liệu, cập nhật code và quản trị từ xa an toàn.

---

## MỤC LỤC
1. [Đánh giá trạng thái Source Code & Rủi ro](#1-đánh-giá-trạng-thái-source-code--rủi-ro)
2. [Tối ưu hóa Supabase cho VPS 30GB (Tiết kiệm RAM & Disk)](#2-tối-ưu-hóa-supabase-cho-vps-30gb-tiết-kiệm-ram--disk)
3. [Hướng dẫn triển khai từ VPS Ubuntu trắng tinh (Dùng IP làm Web URL)](#3-hướng-dẫn-triển-khai-từ-vps-ubuntu-trắng-tinh-dùng-ip-làm-web-url)
4. [Khởi tạo Database, Chạy Migrations và Seed Dữ liệu](#4-khởi-tạo-database-chạy-migrations-và-seed-dữ-liệu)
5. [Quy trình cập nhật khi có thay đổi Code hoặc Database](#5-quy-trình-cập-nhật-khi-có-thay-đổi-code-hoặc-database)
6. [Hướng dẫn kết nối DB & truy cập Supabase Studio an toàn](#6-hướng-dẫn-kết-nối-db--truy-cập-supabase-studio-an-toàn)

---

## 1. ĐÁNH GIÁ TRẠNG THÁI SOURCE CODE & RỦI RO

Trước khi deploy lên Production, mã nguồn của bạn đã được rà soát và xử lý các rủi ro bảo mật chính:

*   **Bảo mật trang Admin (Đã xử lý)**: Next.js chỉ nhận diện file Route Guard nếu nó tên là `middleware.ts` ở thư mục gốc. Tôi đã tạo file `middleware.ts` để re-export từ `proxy.ts`. Điều này đảm bảo khi bạn tắt dữ liệu giả lập, các trang quản trị `/admin/*` sẽ được bảo vệ tuyệt đối.
*   **Chế độ Mock Data**: Hãy chắc chắn rằng trong file `.env.production` trên VPS, bạn thiết lập `NEXT_PUBLIC_USE_MOCK_DATA=false`.
*   **Khóa mã hóa API Key (AI_SECRET_ENCRYPTION_KEY)**: Khóa này dùng để mã hóa API Key trong Database. Bạn cần chuẩn bị một chuỗi ngẫu nhiên dài **đúng 32 ký tự** trên VPS.

---

## 2. TỐI ƯU HÓA SUPABASE CHO VPS 30GB (TIẾT KIỆM RAM & DISK)

Mặc định, Supabase Docker Stack cài đặt rất nhiều dịch vụ (Realtime, Storage, Edge Functions, Vector Analytics...) tiêu tốn khoảng **3 - 4GB RAM** và nhiều dung lượng đĩa. 
Vì dự án của bạn sử dụng **Cloudinary** để quản lý hình ảnh/video và không dùng tính năng Realtime hay Edge Functions, ta có thể tắt các dịch vụ này để giảm lượng RAM tiêu thụ xuống còn **~1GB** và tiết kiệm đĩa.

### Cách thực hiện (trên VPS):
Khi cấu hình Supabase tại Bước 3, hãy mở file `/var/www/supabase/docker/docker-compose.yml` bằng `nano` hoặc `vi`.

1.  **Comment out hoặc xóa** các block dịch vụ sau trong file `docker-compose.yml`:
    *   `realtime` (Xử lý realtime)
    *   `storage` (Lưu trữ file local - dự án đã dùng Cloudinary)
    *   `imgproxy` (Resize ảnh của storage)
    *   `functions` (Edge functions)
    *   `analytics` (Logflare / Vector analytics)
    *   `supavisor` (Nếu không cần database connection pooler, nhưng khuyến nghị giữ lại nếu kết nối DB ngoài trực tiếp qua cổng 6543)
    
    *Lưu ý: Đối với phiên bản Supabase self-hosted mới nhất, các biến môi trường như `ENABLE_REALTIME` và `ENABLE_STORAGE` không còn được định nghĩa mặc định trong file `.env` nữa. Cách tốt nhất và triệt để nhất để tiết kiệm RAM & Disk là comment out các service trên trong file `docker-compose.yml` để Docker không tải image và khởi chạy các container này.*

---

## 3. HƯỚNG DẪN TRIỂN KHAI TỪ VPS UBUNTU TRẮNG TINH (DÙNG IP LÀM WEB URL)

*Ví dụ IP VPS của bạn là: **`103.228.74.240`***

### Bước 3.1: Kết nối & Cài đặt Môi trường
1.  **SSH vào VPS**:
    ```bash
    ssh root@<IP_VPS>
    ```
2.  **Cập nhật hệ thống & cài các công cụ phụ trợ**:
    ```bash
    apt update && apt upgrade -y
    apt install -y curl wget git ufw fail2ban
    ```
3.  **Cài đặt Docker và Docker Compose**:
    ```bash
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    ```
4.  **Cấu hình tường lửa (UFW) bảo vệ hệ thống**:
    ```bash
    # Mở SSH, HTTP (Caddy), HTTPS (Caddy) và 8000 (Supabase API cho Browser)
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 8000/tcp
    ufw --force enable
    ufw status
    ```

### Bước 3.2: Cài đặt Supabase (Database & Auth)
1.  **Tải Supabase stack**:
    ```bash
    cd /var/www
    git clone --depth 1 https://github.com/supabase/supabase
    cd supabase/docker
    cp .env.example .env
    ```
2.  **Tự động tạo các khóa bảo mật và JWT (Dùng script chính thức)**:
    Thay vì chạy lệnh docker thủ công dễ gặp lỗi thiếu tag version, hãy chạy hai script tiện ích có sẵn mà Supabase đã cung cấp trong thư mục `supabase/docker`:
    ```bash
    # Chạy script tự động tạo JWT_SECRET, ANON_KEY, SERVICE_ROLE_KEY và cập nhật vào file .env
    sh utils/generate-keys.sh
    
    # Chạy tiếp script sinh các khóa bất đối xứng và cập nhật JWT_JWKS vào file .env
    sh utils/add-new-auth-keys.sh
    ```
3.  **Cấu hình các thông số khác trong file `.env`**:
    Mở file `.env` vừa được cập nhật tự động bằng trình soạn thảo:
    ```bash
    nano .env
    ```
    Tìm và chỉnh sửa các dòng sau (thay bằng IP VPS của bạn):
    *   `POSTGRES_PASSWORD=Mật_Khẩu_Cơ_Sở_Dữ_Liệu_Của_Bạn` (Thay thế mật khẩu mặc định thành một mật khẩu mạnh của bạn)
    *   `SITE_URL=http://103.228.74.240` (Thay bằng IP VPS của bạn)
    *   `API_EXTERNAL_URL=http://103.228.74.240:8000` (Thay bằng IP VPS và cổng 8000)
    
    *Sau khi lưu file `.env`, hãy dùng lệnh `cat .env | grep -E "ANON_KEY|SERVICE_ROLE_KEY"` để lấy hai khóa JWT vừa được tự động sinh ra và copy chúng điền vào file `.env.production` của Next.js App ở bước sau.*
4.  **Tối ưu hóa file Compose (Bắt buộc để tiết kiệm RAM & Disk)**:
    ```bash
    nano docker-compose.yml
    ```
    Comment out (`#` ở đầu dòng) toàn bộ định nghĩa các service `realtime`, `storage`, `imgproxy`, `functions`, `analytics` như hướng dẫn tại **Mục 2**.
5.  **Khởi động Supabase**:
    ```bash
    docker compose up -d
    ```
    *Dữ liệu sẽ khởi động trên một Docker network tên là: `supabase_default`*

### Bước 3.3: Deploy Next.js App
1.  **Clone Source Code**:
    ```bash
    mkdir -p /var/www/furniture-website
    cd /var/www/furniture-website
    git clone <URL_REPO_CUA_BAN> .
    ```
2.  **Tạo file cấu hình môi trường `.env.production`**:
    ```bash
    nano .env.production
    ```
    Điền nội dung dưới đây (Thay thế IP `103.228.74.240` và các thông tin bí mật thật của bạn):
    ```env
    NODE_ENV=production
    NEXT_PUBLIC_SITE_URL=http://103.228.74.240
    NEXT_PUBLIC_USE_MOCK_DATA=false

    # Supabase (Điền ANON_KEY và SERVICE_ROLE_KEY vừa lấy ở bước 3.2)
    NEXT_PUBLIC_SUPABASE_URL=http://103.228.74.240:8000
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_from_step_3_2
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_from_step_3_2

    # Cloudinary (Quản lý hình ảnh sản phẩm/blog)
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tên_cloud_cloudinary
    CLOUDINARY_API_KEY=key_cloudinary
    CLOUDINARY_API_SECRET=secret_cloudinary
    CLOUDINARY_UPLOAD_FOLDER=showroom_production

    # Resend (Gửi mail báo giá)
    RESEND_API_KEY=re_your_resend_api_key
    QUOTE_NOTIFICATION_RECIPIENTS=sales@phuongdong.vn

    # Gemini AI
    GEMINI_API_KEY=khóa_api_gemini_thật
    # Khóa đối xứng mã hóa (Bắt buộc dài đúng 32 ký tự)
    AI_SECRET_ENCRYPTION_KEY=chuỗi_32_ký_tự_ngẫu_nhiên_ví_dụ_123

    # Google Maps Iframe Protection
    GOOGLE_MAPS_EMBED_ALLOWED_ORIGIN=http://103.228.74.240
    ```
3.  **Cấu hình Mạng Docker dùng chung**:
    Mở file `docker-compose.production.yml` ở gốc dự án Next.js:
    ```bash
    nano docker-compose.production.yml
    ```
    Cuộn xuống dưới cùng và đảm bảo trường `name` của mạng Supabase được đặt chính xác là **`supabase_default`**:
    ```yaml
    networks:
      app-network:
        name: furniture-app-network
      supabase-network:
        external: true
        name: supabase_default
    ```
4.  **Build & Chạy ứng dụng Next.js**:
    > [!IMPORTANT]
    > Vì Next.js biên dịch và nhúng các biến `NEXT_PUBLIC_` lúc build, Docker Compose cần đọc các biến này từ file `.env` mặc định để truyền vào quá trình build (Build Arguments). Bạn cần copy cấu hình qua `.env` trước khi build.
    > 
    > **ĐẶC BIỆT LƯU Ý**: Nếu trong session terminal hiện tại trên VPS có lưu các biến môi trường trùng tên (như `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`...), Docker Compose sẽ ưu tiên lấy biến của hệ điều hành và ghi đè làm sai lệch Key khi build. Do đó, cần chạy lệnh `unset` trước khi build.
    
    ```bash
    # 1. Sao chép cấu hình sang file .env để Docker Compose đọc khi build
    cp .env.production .env
    
    # 2. Xoá các biến môi trường cũ trong session terminal để tránh xung đột
    unset NEXT_PUBLIC_SUPABASE_URL
    unset NEXT_PUBLIC_SUPABASE_ANON_KEY
    unset DATABASE_URL
    
    # 3. Build ứng dụng với các tham số mới (không dùng cache để tránh lấy key cũ)
    docker compose -f docker-compose.production.yml build --no-cache
    
    # 4. Khởi chạy Next.js container
    docker compose -f docker-compose.production.yml up -d
    ```

### Bước 3.4: Cấu hình Caddy (Reverse Proxy không cần cổng :3000)
1.  **Cài đặt Caddy Web Server**:
    ```bash
    apt install -y debian-keyring debian-archive-keyring apt-transport-https
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
    apt update && apt install caddy -y
    ```
2.  **Cấu hình Caddyfile**:
    ```bash
    nano /etc/caddy/Caddyfile
    ```
    Xóa hết nội dung cũ và thay bằng cấu hình định tuyến (Dùng IP trực tiếp chạy HTTP cổng 80):
    ```caddyfile
    http://103.228.74.240 {
        reverse_proxy localhost:3000
    }
    ```
3.  **Khởi động lại Caddy**:
    ```bash
    systemctl restart caddy
    ```
    *Lúc này bạn sẽ truy cập website bằng giao thức HTTP qua `http://103.228.74.240` trực tiếp (không cần thêm cổng `:3000` ở cuối).*

---

## 4. KHỞI TẠO DATABASE, CHẠY MIGRATIONS VÀ SEED DỮ LIỆU

Dự án Showroom Nội thất đã cấu hình sẵn toàn bộ cấu trúc bảng, RLS Policies, các RPC, và dữ liệu Seed thực tế ngay trong thư mục `supabase/migrations`. Bạn chỉ cần4.  **Tạo tài khoản quản trị (Admin) đầu tiên**:
    Do có thể xảy ra trường hợp lệch khóa JWT bí mật (`GOTRUE_JWT_SECRET`) giữa container Auth (GoTrue) và các dịch vụ khác (đặc biệt khi tái khởi động hoặc sinh khóa tự động), bạn có 2 cách để xử lý:

    *   **CÁCH 1: Tạo trực tiếp qua SQL Database (Khuyên dùng - Nhanh nhất & Tránh lỗi JWT)**:
        Chạy 2 lệnh này trực tiếp trên terminal của VPS để chèn thông tin tài khoản và profile mà không cần đi qua lớp API xác thực của GoTrue:
        ```bash
        # 1. Chèn tài khoản vào bảng auth.users (Mật khẩu mặc định: admin123)
        docker exec -i supabase-db psql -U postgres -d postgres -c "
        INSERT INTO auth.users (
          id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_super_admin, confirmed_at
        ) VALUES (
          'f25e5021-4322-4a31-9f3d-72ba8879aee1',
          '00000000-0000-0000-0000-000000000000',
          'authenticated',
          'authenticated',
          'admin@phuongdong.vn',
          extensions.crypt('admin123', extensions.gen_salt('bf')),
          now(),
          '{\"provider\":\"email\",\"providers\":[\"email\"]}'::jsonb,
          '{}'::jsonb,
          now(),
          now(),
          false,
          now()
        ) ON CONFLICT (id) DO NOTHING;
        "

        # 2. Chèn profile admin tương ứng vào bảng public.profiles
        docker exec -i supabase-db psql -U postgres -d postgres -c "
        INSERT INTO public.profiles (id, email, full_name, role, is_active, created_at, updated_at)
        VALUES ('f25e5021-4322-4a31-9f3d-72ba8879aee1', 'admin@phuongdong.vn', 'Admin Phương Đông', 'admin', true, now(), now())
        ON CONFLICT (id) DO NOTHING;
        "
        ```

    *   **CÁCH 2: Tạo bằng API curl (Nếu muốn kiểm tra GoTrue API)**:
        Do container `supabase-auth` trên VPS sử dụng khóa JWT bí mật riêng biệt (`zN74+...`), ta cần ký token trong header `Authorization` bằng chính khóa đó, trong khi `apikey` vẫn dùng theo khóa gốc của Kong:
        ```bash
        # 1. Gọi API tạo User Auth
        curl -s -X POST "http://localhost:8000/auth/v1/admin/users" \
          -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3ODIzMTE0NzksImV4cCI6MTkzOTk5MTQ3OX0.Bi42zhEI1tSfFXWtydTEcOTDxKeZmieS5SMdosoMP7I" \
          -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3ODIzMTU2NTcsImV4cCI6MjA5NzY3NTcxN30.irdrD-RGXlwknGcIVFY8ePb51UueJELNaUULNp6TFLM" \
          -H "Content-Type: application/json" \
          -d '{
            "email": "admin@phuongdong.vn",
            "password": "admin123",
            "email_confirm": true
          }'
        
        # 2. Gọi API tạo profile tương ứng (Sử dụng ID f25e5021-4322-4a31-9f3d-72ba8879aee1 vừa sinh ra ở trên)
        curl -s -X POST "http://localhost:8000/rest/v1/profiles" \
          -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3ODIzMTE0NzksImV4cCI6MTkzOTk5MTQ3OX0.Bi42zhEI1tSfFXWtydTEcOTDxKeZmieS5SMdosoMP7I" \
          -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3ODIzMTE0NzksImV4cCI6MTkzOTk5MTQ3OX0.Bi42zhEI1tSfFXWtydTEcOTDxKeZmieS5SMdosoMP7I" \
          -H "Content-Type: application/json" \
          -H "Prefer: return=representation" \
          -d '{
            "id": "f25e5021-4322-4a31-9f3d-72ba8879aee1",
            "email": "admin@phuongdong.vn",
            "full_name": "Admin Phương Đông",
            "role": "admin",
            "is_active": true
          }'
        ```

---

## 5. QUY TRÌNH CẬP NHẬT KHI CÓ THAY ĐỔI CODE HOẶC DATABASE

Khi bạn phát triển tính năng mới ở máy Local và muốn đồng bộ lên VPS Production:

### Quy trình 5.1: Chỉ thay đổi mã nguồn Next.js (Không thay đổi Database)
1.  Ở máy Local: Commit và push code lên Git.
2.  SSH vào VPS và cập nhật code:
    ```bash
    cd /var/www/furniture-website
    git pull origin main
    ```
3.  Rebuild và khởi động lại container:
    ```bash
    docker compose -f docker-compose.production.yml build
    docker compose -f docker-compose.production.yml up -d
    ```

### Quy trình 5.2: Thay đổi cấu trúc Database (Schema / RLS / Seed mới)
1.  Ở máy Local, tạo file migration mới thông qua CLI:
    ```bash
    supabase migration new tên_thay_đổi
    ```
    *Viết SQL sửa đổi vào file mới sinh ra trong thư mục `supabase/migrations`.*
2.  Commit và push file SQL mới này lên Git.
3.  SSH vào VPS, kéo code mới về:
    ```bash
    cd /var/www/furniture-website
    git pull origin main
    ```
4.  Chạy cập nhật database trên VPS:
    ```bash
    supabase db push
    ```
    *Supabase CLI sẽ tự động so sánh các migration đã chạy và chỉ áp dụng file SQL mới của bạn vào Database VPS.*

---

## 6. HƯỚNG DẪN KẾT NỐI DB & TRUY CẬP SUPABASE STUDIO AN TOÀN

Để đảm bảo an toàn tuyệt đối chống tấn công dò mật khẩu database và hack bảng điều khiển Supabase Studio, chúng ta **không nên mở công khai các port quản trị ra ngoài Internet**.
Thay vào đó, hãy sử dụng cơ chế **SSH Tunneling (Đường hầm bảo mật)**.

### Hướng dẫn 6.1: Truy cập Supabase Studio Dashboard (Web GUI)
Bảng điều khiển Studio của Supabase self-hosted chạy mặc định trên port `54323` của VPS.

1.  Từ máy **Local của bạn** (mở Terminal/PowerShell mới tinh trên Windows), chạy lệnh tạo đường hầm:
    ```bash
    ssh -L 54323:localhost:54323 duydoan@103.228.74.240
    ```
    *Lưu ý: Bạn phải giữ nguyên cửa sổ terminal này chạy ngầm để giữ đường hầm mở.*
2.  Mở trình duyệt Web trên máy local của bạn và truy cập địa chỉ:
    👉 **[http://127.0.0.1:54323](http://127.0.0.1:54323)**
    
    > [!IMPORTANT]
    > **DÙNG IP `127.0.0.1` THAY VÌ `localhost`**: Trên Windows, trình duyệt sẽ tự động phân giải `localhost` thành địa chỉ IPv6 (`::1`). Vì SSH Tunnel chỉ lắng nghe trên giao thức IPv4 (`127.0.0.1`), việc truy cập qua `localhost` sẽ bị lỗi `ERR_CONNECTION_REFUSED`. Bạn bắt buộc phải gõ đúng IP `127.0.0.1:54323`.

### Hướng dẫn 6.2: Kết nối trực tiếp vào Database Postgres bằng các công cụ ngoài (DBeaver, pgAdmin)
Postgres chạy trên port `5432` bên trong Docker VPS (cổng mặc định đã được map ra ngoài).

*   **Cách 1: Sử dụng SSH Tunnel trực tiếp qua lệnh**:
    1.  Mở terminal ở máy local chạy lệnh:
        ```bash
        ssh -L 5432:localhost:5432 duydoan@103.228.74.240
        ```
    2.  Kết nối DBeaver / pgAdmin vào Host: `127.0.0.1`, Port: `5432`, User: `postgres`, Password: `Mật_khẩu_database_VPS_bạn_đặt`.
*   **Cách 2: Cấu hình SSH Tunnel trực tiếp trong GUI của DBeaver / pgAdmin**:
    Hầu hết các phần mềm quản trị database đều có tab cấu hình **SSH Tunnel**:
    1.  Trong cấu hình Connection, điền thông tin chính (Main):
        *   **Host**: `localhost` (không điền IP VPS ở đây!)
        *   **Port**: `5432`
        *   **Database / User / Password**: Thông tin DB của bạn trên VPS.
    2.  Chuyển sang tab **SSH** hoặc **Network -> SSH Tunnel**:
        *   Bật **Use SSH Tunnel**.
        *   **SSH Host**: `103.228.74.240`
        *   **SSH Port**: `22`
        *   **Username**: `duydoan`
        *   **Authentication**: Chọn mật khẩu VPS hoặc SSH Key của bạn.
    3.  Nhấn Connect. DBeaver sẽ tự động tạo đường truyền SSH kết nối an toàn vào database.
