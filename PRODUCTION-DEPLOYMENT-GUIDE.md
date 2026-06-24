# HƯỚNG DẪN TRIỂN KHAI PRODUCTION LÊN VPS (TỐI ƯU HÓA 30GB)

Tài liệu này hướng dẫn chi tiết từ một VPS Ubuntu trắng tinh (dung lượng nhỏ 30GB) đến một hệ thống Showroom Nội Thất Phương Đông chạy thực tế với chứng chỉ SSL, tự host Supabase, chạy migration dữ liệu, cập nhật code và quản trị từ xa an toàn.

---

## MỤC LỤC
1. [Đánh giá trạng thái Source Code & Rủi ro](#1-đánh-giá-trạng-thái-source-code--rủi-ro)
2. [Tối ưu hóa Supabase cho VPS 30GB (Tiết kiệm RAM & Disk)](#2-tối-ưu-hóa-supabase-cho-vps-30gb-tiết-kiệm-ram--disk)
3. [Hướng dẫn triển khai từ VPS Ubuntu trắng tinh](#3-hướng-dẫn-triển-khai-từ-vps-ubuntu-trắng-tinh)
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
2.  Trong file `/var/www/supabase/docker/.env`, tìm và đặt các cấu hình sau về `false` để tránh sinh logs thừa:
    ```env
    ENABLE_REALTIME=false
    ENABLE_STORAGE=false
    ```

---

## 3. HƯỚNG DẪN TRIỂN KHAI TỪ VPS UBUNTU TRẮNG TINH

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
    # Chỉ mở SSH, HTTP, HTTPS ra Internet công cộng
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
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
2.  **Tạo các khóa JWT bí mật**:
    ```bash
    # Chạy các lệnh này để sinh chuỗi ngẫu nhiên
    JWT_SECRET=$(openssl rand -base64 32)
    ANON_KEY=$(docker run --rm supabase/gotrue gotrue generate jwt --secret="$JWT_SECRET" --exp=8765h)
    SERVICE_ROLE_KEY=$(docker run --rm supabase/gotrue gotrue generate jwt --secret="$JWT_SECRET" --exp=8765h --role=service_role)
    
    # In ra màn hình để copy lưu lại dùng cho cấu hình sau
    echo "JWT_SECRET: $JWT_SECRET"
    echo "ANON_KEY: $ANON_KEY"
    echo "SERVICE_ROLE_KEY: $SERVICE_ROLE_KEY"
    ```
3.  **Cấu hình biến môi trường cho Supabase**:
    ```bash
    nano .env
    ```
    Thay đổi các giá trị sau:
    *   `POSTGRES_PASSWORD=Mật_Khẩu_Cơ_Sở_Dữ_Liệu_Của_Bạn` (Đặt mật khẩu cực kỳ phức tạp)
    *   `JWT_SECRET=Giá_Trị_Vừa_Tạo`
    *   `ANON_KEY=Giá_Trị_Vừa_Tạo`
    *   `SERVICE_ROLE_KEY=Giá_Trị_Vừa_Tạo`
    *   `SITE_URL=https://phuongdong.vn` (Thay bằng domain thật của bạn)
    *   `API_EXTERNAL_URL=https://phuongdong.vn`
4.  **Tối ưu hóa file Compose**:
    ```bash
    nano docker-compose.yml
    ```
    Comment out (`#`) các service `realtime`, `storage`, `imgproxy`, `functions`, `analytics` như hướng dẫn tại **Mục 2**.
5.  **Khởi động Supabase**:
    ```bash
    docker compose up -d
    ```

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
    Điền nội dung dưới đây (thay thế các thông tin thật):
    ```env
    NODE_ENV=production
    NEXT_PUBLIC_SITE_URL=https://phuongdong.vn
    NEXT_PUBLIC_USE_MOCK_DATA=false

    # Supabase (Lấy từ bước cài đặt Supabase ở trên)
    NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

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
    GOOGLE_MAPS_EMBED_ALLOWED_ORIGIN=https://phuongdong.vn
    ```
3.  **Build & Chạy ứng dụng Next.js**:
    ```bash
    docker compose -f docker-compose.production.yml build
    docker compose -f docker-compose.production.yml up -d
    ```

### Bước 3.4: Cấu hình Caddy (Reverse Proxy & SSL)
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
    Xóa hết nội dung cũ và thay bằng cấu hình định tuyến domain của bạn tới container Next.js (port 3000):
    ```caddyfile
    phuongdong.vn, www.phuongdong.vn {
        reverse_proxy localhost:3000
    }
    ```
3.  **Khởi động lại Caddy**:
    ```bash
    systemctl restart caddy
    ```
    *Caddy sẽ tự động đăng ký và cài đặt chứng chỉ SSL Let's Encrypt cho tên miền của bạn.*

---

## 4. KHỞI TẠO DATABASE, CHẠY MIGRATIONS VÀ SEED DỮ LIỆU

Dự án Showroom Nội thất đã cấu hình sẵn toàn bộ cấu trúc bảng, RLS Policies, các RPC, và dữ liệu Seed thực tế ngay trong thư mục `supabase/migrations` (bao gồm file `20260618000002_real_production_seed.sql`). Do đó, bạn chỉ cần thực hiện đẩy migrations là database sẽ tự động có đầy đủ dữ liệu chạy thực tế.

### Các bước thực hiện:
1.  **Cài đặt Supabase CLI trên VPS**:
    ```bash
    curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
    mv supabase /usr/local/bin/
    ```
2.  **Liên kết mã nguồn với Database VPS**:
    ```bash
    cd /var/www/furniture-website
    supabase init
    # Liên kết với database Postgres đang chạy trong container của Supabase
    supabase link --project-ref local --db-url postgresql://postgres:Mật_Khẩu_Cơ_Sở_Dữ_Liệu_Của_Bạn@localhost:5432/postgres
    ```
3.  **Chạy toàn bộ file migration và seed dữ liệu**:
    ```bash
    supabase db push
    ```
    *Lệnh này sẽ thực thi tuần tự 25 file SQL có sẵn trong thư mục `supabase/migrations/` từ thiết lập cấu trúc đến nạp toàn bộ sản phẩm, danh mục thực tế.*

4.  **Tạo tài khoản quản trị (Admin) đầu tiên**:
    Do Supabase chạy độc lập, ta sẽ dùng API dịch vụ của Supabase để tạo User và lưu vào profile:
    *   **Tạo User Auth**:
        ```bash
        curl -s -X POST "http://localhost:8000/auth/v1/admin/users" \
          -H "apikey: <SERVICE_ROLE_KEY_CỦA_BẠN>" \
          -H "Authorization: Bearer <SERVICE_ROLE_KEY_CỦA_BẠN>" \
          -H "Content-Type: application/json" \
          -d '{
            "email": "admin@phuongdong.vn",
            "password": "Mật_Khẩu_Đăng_Nhập_Admin",
            "email_confirm": true
          }'
        ```
        *Lưu lại chuỗi `id` (UUID) trong kết quả trả về.*
    *   **Tạo profile Admin**:
        ```bash
        curl -s -X POST "http://localhost:8000/rest/v1/profiles" \
          -H "apikey: <SERVICE_ROLE_KEY_CỦA_BẠN>" \
          -H "Authorization: Bearer <SERVICE_ROLE_KEY_CỦA_BẠN>" \
          -H "Content-Type: application/json" \
          -d '{
            "id": "UUID_BẠN_VỪA_LẤY_Ở_TRÊN",
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

1.  Từ máy **Local của bạn** (mở Terminal/PowerShell), chạy lệnh tạo đường hầm:
    ```bash
    ssh -L 54323:localhost:54323 root@<IP_VPS>
    ```
2.  Giữ nguyên cửa sổ terminal đó. Mở trình duyệt Web trên máy local của bạn và truy cập địa chỉ:
    [http://localhost:54323](http://localhost:54323)
    *Bạn sẽ truy cập được giao diện quản trị database giống hệt như đang chạy Supabase local!*

### Hướng dẫn 6.2: Kết nối trực tiếp vào Database Postgres bằng các công cụ ngoài (DBeaver, pgAdmin)
Postgres chạy trên port `5432` bên trong Docker VPS.

*   **Cách 1: Sử dụng SSH Tunnel trực tiếp qua lệnh**:
    1.  Mở terminal ở máy local chạy lệnh:
        ```bash
        ssh -L 5432:localhost:5432 root@<IP_VPS>
        ```
    2.  Kết nối DBeaver / pgAdmin vào Host: `localhost`, Port: `5432`, User: `postgres`, Password: `Mật_khẩu_database_VPS_bạn_đặt`.
*   **Cách 2: Cấu hình SSH Tunnel trực tiếp trong GUI của DBeaver / pgAdmin**:
    Hầu hết các phần mềm quản trị database đều có tab cấu hình **SSH Tunnel**:
    1.  Trong cấu hình Connection, điền thông tin chính (Main):
        *   **Host**: `localhost` (không điền IP VPS ở đây!)
        *   **Port**: `5432`
        *   **Database / User / Password**: Thông tin DB của bạn trên VPS.
    2.  Chuyển sang tab **SSH** hoặc **Network -> SSH Tunnel**:
        *   Bật **Use SSH Tunnel**.
        *   **SSH Host**: `<IP_VPS>`
        *   **SSH Port**: `22`
        *   **Username**: `root`
        *   **Authentication**: Chọn mật khẩu VPS hoặc SSH Key của bạn.
    3.  Nhấn Connect. DBeaver sẽ tự động tạo đường truyền SSH mã hóa và kết nối an toàn vào database.
