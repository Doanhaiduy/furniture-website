# HƯỚNG DẪN TRIỂN KHAI DỰ ÁN LÊN VPS

**Dự án**: Showroom Nội Thất & Thiết Bị Vệ Sinh Phương Đông  
**Ngày tạo**: 16 tháng 06, 2026  
**Môi trường**: VPS Ubuntu với Docker đã cài sẵn

---

## 📋 MỤC LỤC

1. [Yêu cầu hệ thống](#1-yêu-cầu-hệ-thống)
2. [Chuẩn bị trước khi triển khai](#2-chuẩn-bị-trước-khi-triển-khai)
3. [Bước 1: Cấu hình VPS ban đầu](#3-bước-1-cấu-hình-vps-ban-đầu)
4. [Bước 2: Sửa đổi codebase để hỗ trợ Production](#4-bước-2-sửa-đổi-codebase-để-hỗ-trợ-production)
5. [Bước 3: Cài đặt Supabase Self-hosted](#5-bước-3-cài-đặt-supabase-self-hosted)
6. [Bước 4: Build và Deploy ứng dụng Next.js](#6-bước-4-build-và-deploy-ứng-dụng-nextjs)
7. [Bước 5: Cấu hình Reverse Proxy (Caddy)](#7-bước-5-cấu-hình-reverse-proxy-caddy)
8. [Bước 6: Chạy migrations và seed dữ liệu](#8-bước-6-chạy-migrations-và-seed-dữ-liệu)
9. [Bước 7: Kiểm tra và monitoring](#9-bước-7-kiểm-tra-và-monitoring)
10. [Bước 8: Backup tự động](#10-bước-8-backup-tự-động)
11. [Xử lý sự cố thường gặp](#11-xử-lý-sự-cố-thường-gặp)

---

## 1. YÊU CẦU HỆ THỐNG

### VPS Tối thiểu:
- **RAM**: 4GB (khuyến nghị 8GB)
- **CPU**: 2 cores (khuyến nghị 4 cores)
- **Ổ cứng**: 40GB SSD
- **OS**: Ubuntu 22.04 LTS hoặc mới hơn
- **Docker**: v24.0+ đã cài đặt
- **Docker Compose**: v2.20+ đã cài đặt

### Công cụ cần thiết trên máy local:
- Git
- SSH client
- Node.js 22.x (để build local nếu cần)

---

## 2. CHUẨN BỊ TRƯỚC KHI TRIỂN KHAI

### 2.1. Thông tin cần thu thập:

#### A. Thông tin VPS:
- [ ] Địa chỉ IP public của VPS
- [ ] Username & password hoặc SSH key
- [ ] Tên miền đã trỏ về IP VPS (ví dụ: `phuongdong.vn`)

#### B. API Keys & Credentials (QUAN TRỌNG):

**Supabase** (tự generate sau):
- Sẽ tự tạo trong quá trình cài đặt

**Cloudinary** (đăng ký tại https://cloudinary.com):
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_FOLDER=showroom_production
```

**Resend** (đăng ký tại https://resend.com):
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
QUOTE_NOTIFICATION_RECIPIENTS=sales@phuongdong.vn,manager@phuongdong.vn
```

**Google Gemini AI** (đăng ký tại https://ai.google.dev):
```env
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
```

**Khóa mã hóa AI** (tạo ngẫu nhiên 32 ký tự):
```bash
# Chạy lệnh này để tạo key ngẫu nhiên:
openssl rand -base64 24 | head -c 32
```


---

## 3. BƯỚC 1: CẤU HÌNH VPS BAN ĐẦU

### 3.1. Kết nối SSH vào VPS:

```bash
ssh root@<IP_VPS>
# Hoặc nếu dùng SSH key:
ssh -i ~/.ssh/id_rsa root@<IP_VPS>
```

### 3.2. Cập nhật hệ thống:

```bash
apt update && apt upgrade -y
```

### 3.3. Cài đặt các công cụ bổ sung:

```bash
apt install -y curl wget git ufw fail2ban
```

### 3.4. Cấu hình tường lửa (UFW):

```bash
# Cho phép SSH trước khi bật firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Bật firewall
ufw --force enable

# Kiểm tra trạng thái
ufw status
```

### 3.5. Kiểm tra Docker:

```bash
docker --version
docker compose version

# Nếu chưa có Docker, cài đặt:
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### 3.6. Tạo thư mục làm việc:

```bash
mkdir -p /var/www/furniture-website
cd /var/www/furniture-website
```


---

## 4. BƯỚC 2: SỬA ĐỔI CODEBASE ĐỂ HỖ TRỢ PRODUCTION

⚠️ **QUAN TRỌNG**: Thực hiện các bước này trên máy local của bạn trước khi deploy.

### 4.1. Sửa file `next.config.ts`:

Thêm dòng `output: "standalone"` vào config:

```typescript
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  output: "standalone", // ← THÊM DÒNG NÀY
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
```

### 4.2. Tạo file `.env.production`:

```env
# Site URL
NEXT_PUBLIC_SITE_URL=https://phuongdong.vn

# Supabase (sẽ cập nhật sau khi cài Supabase)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# QUAN TRỌNG: Tắt mock data
NEXT_PUBLIC_USE_MOCK_DATA=false

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_FOLDER=showroom_production

# Resend
RESEND_API_KEY=re_your_resend_key
QUOTE_NOTIFICATION_RECIPIENTS=sales@phuongdong.vn

# Gemini AI
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere

# AI Encryption (32 ký tự)
AI_SECRET_ENCRYPTION_KEY=your_32_character_encryption_key
```

### 4.3. Commit và push code:

```bash
git add next.config.ts .env.production
git commit -m "feat: add standalone output for production deployment"
git push origin main
```


---

## 5. BƯỚC 3: CÀI ĐẶT SUPABASE SELF-HOSTED

### 5.1. Clone Supabase Docker stack:

```bash
cd /var/www
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
```

### 5.2. Copy file cấu hình:

```bash
cp .env.example .env
```

### 5.3. Generate JWT secrets và API keys:

```bash
# Generate JWT Secret
JWT_SECRET=$(openssl rand -base64 32)

# Generate Anon Key
ANON_KEY=$(docker run --rm supabase/gotrue gotrue generate jwt --secret="$JWT_SECRET" --exp=8765h)

# Generate Service Role Key
SERVICE_ROLE_KEY=$(docker run --rm supabase/gotrue gotrue generate jwt --secret="$JWT_SECRET" --exp=8765h --role=service_role)

echo "JWT_SECRET=$JWT_SECRET"
echo "ANON_KEY=$ANON_KEY"
echo "SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY"
```

**LƯU Ý**: Lưu lại 3 giá trị này, bạn sẽ cần dùng sau!

### 5.4. Cấu hình file `.env`:

Chỉnh sửa file `/var/www/supabase/docker/.env`:

```bash
nano .env
```

Tìm và thay đổi các dòng sau:

```env
# Postgres password (đổi sang mật khẩu mạnh)
POSTGRES_PASSWORD=your_secure_postgres_password_here

# JWT Secret (từ bước 5.3)
JWT_SECRET=your_jwt_secret_from_above

# API Keys (từ bước 5.3)
ANON_KEY=your_anon_key_from_above
SERVICE_ROLE_KEY=your_service_role_key_from_above

# Public URL (tạm thời để localhost, sẽ đổi sau)
SITE_URL=http://localhost:8000
API_EXTERNAL_URL=http://localhost:8000

# Studio settings (giữ nguyên cho dev, production có thể tắt)
STUDIO_DEFAULT_ORGANIZATION=Furniture Website
STUDIO_DEFAULT_PROJECT=Production

# Tắt các service không cần
ENABLE_REALTIME=false
ENABLE_STORAGE=false
```


### 5.5. Khởi động Supabase stack:

```bash
cd /var/www/supabase/docker
docker compose up -d

# Kiểm tra trạng thái containers
docker compose ps

# Xem logs nếu có lỗi
docker compose logs -f
```

### 5.6. Kiểm tra kết nối:

```bash
# Test Kong Gateway
curl http://localhost:8000/

# Test Studio (nếu bật)
curl http://localhost:54323/
```

### 5.7. Lưu lại thông tin Supabase:

Tạo file ghi chú để dễ reference sau:

```bash
cat > /var/www/supabase-credentials.txt << EOF
SUPABASE CREDENTIALS (PRODUCTION)
================================
POSTGRES_HOST: localhost
POSTGRES_PORT: 5432
POSTGRES_DB: postgres
POSTGRES_USER: postgres
POSTGRES_PASSWORD: your_secure_postgres_password_here

SUPABASE_URL: http://localhost:8000
ANON_KEY: your_anon_key_from_above
SERVICE_ROLE_KEY: your_service_role_key_from_above

Studio URL: http://localhost:54323
Studio Access: Only via SSH tunnel or local access
EOF

# Bảo mật file này
chmod 600 /var/www/supabase-credentials.txt
```


---

## 6. BƯỚC 4: BUILD VÀ DEPLOY ỨNG DỤNG NEXT.JS

### 6.1. Clone source code về VPS:

```bash
cd /var/www/furniture-website
git clone <URL_REPO_CUA_BAN> .

# Hoặc nếu đã có repo:
git pull origin main
```

### 6.2. Tạo file `.env.production` trên VPS:

```bash
cd /var/www/furniture-website
nano .env.production
```

Điền các thông tin đã chuẩn bị ở Bước 2.2:

```env
NODE_ENV=production

# Site URL (thay bằng domain thật của bạn)
NEXT_PUBLIC_SITE_URL=https://phuongdong.vn

# Supabase (dùng thông tin từ Bước 5.7)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_from_supabase
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_supabase

# QUAN TRỌNG: Tắt mock data
NEXT_PUBLIC_USE_MOCK_DATA=false

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_FOLDER=showroom_production

# Resend
RESEND_API_KEY=re_your_resend_key
QUOTE_NOTIFICATION_RECIPIENTS=sales@phuongdong.vn,manager@phuongdong.vn

# Gemini AI
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere

# AI Encryption (32 ký tự - dùng lệnh: openssl rand -base64 24 | head -c 32)
AI_SECRET_ENCRYPTION_KEY=your_32_character_encryption_key

# Google Maps
GOOGLE_MAPS_EMBED_ALLOWED_ORIGIN=https://phuongdong.vn
```


### 6.3. Tạo `docker-compose.production.yml`:

```bash
cd /var/www/furniture-website
nano docker-compose.production.yml
```

Nội dung file:

```yaml
version: '3.8'

services:
  app:
    container_name: furniture-website-app
    build:
      context: .
      dockerfile: Dockerfile
      target: runner
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HOSTNAME=0.0.0.0
      # Kết nối nội bộ tới Supabase (nếu cùng mạng Docker)
      - SUPABASE_URL_INTERNAL=http://supabase-kong:8000
    networks:
      - app-network
      - supabase-network
    restart: unless-stopped
    depends_on:
      - supabase-kong
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  app-network:
    name: furniture-app-network
  supabase-network:
    external: true
    name: supabase_network_furniture-website
```

### 6.4. Build Docker image:

```bash
cd /var/www/furniture-website
docker compose -f docker-compose.production.yml build

# Xem quá trình build
docker compose -f docker-compose.production.yml build --progress=plain
```

### 6.5. Khởi động ứng dụng:

```bash
docker compose -f docker-compose.production.yml up -d

# Kiểm tra logs
docker compose -f docker-compose.production.yml logs -f app
```

### 6.6. Test kết nối:

```bash
# Kiểm tra ứng dụng
curl http://localhost:3000

# Kiểm tra health endpoint
curl http://localhost:3000/api/health
```


---

## 7. BƯỚC 5: CẤU HÌNH REVERSE PROXY (CADDY)

### 7.1. Cài đặt Caddy:

```bash
# Cài Caddy từ repository chính thức
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install caddy
```

### 7.2. Cấu hình Caddyfile:

```bash
nano /etc/caddy/Caddyfile
```

Nội dung (thay `phuongdong.vn` bằng domain của bạn):

```caddyfile
# Tên miền chính
phuongdong.vn, www.phuongdong.vn {
    # Tự động SSL từ Let's Encrypt
    
    # Reverse proxy đến Next.js
    reverse_proxy localhost:3000 {
        # Health check
        health_uri /api/health
        health_interval 30s
        health_timeout 5s
    }
    
    # Headers bảo mật
    header {
        # Bảo mật cơ bản
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
        
        # HSTS (chỉ bật sau khi test SSL ổn định)
        # Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    }
    
    # Logging
    log {
        output file /var/log/caddy/access.log
        format json
    }
}

# Subdomain cho Supabase Studio (TÙY CHỌN - bảo mật bằng Basic Auth)
studio.phuongdong.vn {
    # Basic Authentication
    basicauth {
        admin $2a$14$your_bcrypt_hashed_password
    }
    
    reverse_proxy localhost:54323
    
    log {
        output file /var/log/caddy/studio-access.log
    }
}
```

### 7.3. Tạo log directory:

```bash
mkdir -p /var/log/caddy
chown caddy:caddy /var/log/caddy
```

### 7.4. Generate password cho Studio (nếu dùng):

```bash
# Cài đặt caddy hash-password
caddy hash-password --plaintext "your_secure_password"

# Copy bcrypt hash và dán vào Caddyfile ở dòng basicauth
```


### 7.5. Kiểm tra cấu hình và khởi động Caddy:

```bash
# Kiểm tra syntax
caddy validate --config /etc/caddy/Caddyfile

# Khởi động lại Caddy
systemctl restart caddy

# Kiểm tra trạng thái
systemctl status caddy

# Xem logs nếu có lỗi
journalctl -u caddy -f
```

### 7.6. Kiểm tra SSL:

```bash
# Đợi 1-2 phút để Caddy lấy SSL certificate
# Sau đó test:
curl -I https://phuongdong.vn

# Hoặc mở trình duyệt và kiểm tra khóa SSL
```

### 7.7. Cập nhật SITE_URL trong Supabase:

Sau khi có SSL, cập nhật lại Supabase config:

```bash
cd /var/www/supabase/docker
nano .env
```

Tìm và đổi:

```env
SITE_URL=https://phuongdong.vn
API_EXTERNAL_URL=https://phuongdong.vn
```

Restart Supabase:

```bash
docker compose restart
```


---

## 8. BƯỚC 6: CHẠY MIGRATIONS VÀ SEED DỮ LIỆU

### 8.1. Cài đặt Supabase CLI trên VPS:

```bash
# Cài đặt Supabase CLI
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
mv supabase /usr/local/bin/

# Kiểm tra
supabase --version
```

### 8.2. Link project với database:

```bash
cd /var/www/furniture-website

# Khởi tạo config Supabase
supabase init

# Link với database local
supabase link --project-ref local \
  --db-url postgresql://postgres:your_secure_postgres_password@localhost:5432/postgres
```

### 8.3. Chạy migrations:

```bash
cd /var/www/furniture-website

# Kiểm tra các migration files
ls -la supabase/migrations/

# Chạy migrations
supabase db push

# Hoặc nếu có lỗi, thử:
supabase db reset
```

### 8.4. Seed dữ liệu mẫu (nếu có):

```bash
# Nếu có file seed trong supabase/seed.sql
psql postgresql://postgres:your_secure_postgres_password@localhost:5432/postgres < supabase/seed.sql

# Hoặc chạy từ Supabase Studio
# Mở http://localhost:54323 và dùng SQL Editor
```

### 8.5. Tạo user admin đầu tiên:

**Cách 1: Qua Studio**
1. Truy cập Studio: `http://localhost:54323` (qua SSH tunnel nếu cần)
2. Vào Authentication > Users
3. Tạo user mới với email và password
4. Copy user ID

**Cách 2: Qua SQL**
```sql
-- Chạy trong Supabase Studio SQL Editor hoặc psql
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@phuongdong.vn',
  crypt('your_admin_password', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- Gán role admin
INSERT INTO public.user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@phuongdong.vn'),
  'admin'
);
```


---

## 9. BƯỚC 7: KIỂM TRA VÀ MONITORING

### 9.1. Checklist kiểm tra hệ thống:

```bash
# 1. Kiểm tra tất cả containers
docker ps -a

# 2. Kiểm tra Supabase
curl http://localhost:8000/

# 3. Kiểm tra Next.js app
curl http://localhost:3000/

# 4. Kiểm tra domain với SSL
curl -I https://phuongdong.vn

# 5. Kiểm tra logs
docker compose -f /var/www/furniture-website/docker-compose.production.yml logs -f
journalctl -u caddy -f

# 6. Kiểm tra disk space
df -h

# 7. Kiểm tra memory
free -m

# 8. Kiểm tra database
docker exec supabase-db-furniture-website psql -U postgres -c "SELECT version();"
```

### 9.2. Test các chức năng chính:

#### A. Test trang public:
- Mở `https://phuongdong.vn`
- Kiểm tra hiển thị sản phẩm
- Kiểm tra blog posts
- Kiểm tra showroom locations
- Test chuyển đổi ngôn ngữ (vi/en)

#### B. Test form liên hệ:
- Điền form báo giá
- Kiểm tra email notification đến đúng địa chỉ
- Kiểm tra dữ liệu lưu vào database

#### C. Test đăng nhập Admin:
- Truy cập `https://phuongdong.vn/admin/login`
- Đăng nhập bằng admin account
- Kiểm tra dashboard
- Test CRUD một sản phẩm
- Test phân quyền Editor (nếu có)

### 9.3. Cài đặt monitoring tool (Tùy chọn):

#### Sử dụng Uptime Kuma:

```bash
cd /var/www
mkdir uptime-kuma
cd uptime-kuma

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  uptime-kuma:
    image: louislam/uptime-kuma:1
    container_name: uptime-kuma
    volumes:
      - ./data:/app/data
    ports:
      - "3001:3001"
    restart: unless-stopped
EOF

docker compose up -d
```

Truy cập qua Caddy (thêm vào Caddyfile):

```caddyfile
monitor.phuongdong.vn {
    basicauth {
        admin $2a$14$your_bcrypt_hashed_password
    }
    reverse_proxy localhost:3001
}
```


---

## 10. BƯỚC 8: BACKUP TỰ ĐỘNG

### 10.1. Tạo script backup database:

```bash
mkdir -p /var/backups/furniture-website
nano /usr/local/bin/backup-furniture-db.sh
```

Nội dung script:

```bash
#!/bin/bash

# Cấu hình
BACKUP_DIR="/var/backups/furniture-website"
DB_CONTAINER="supabase-db-furniture-website"
DB_NAME="postgres"
DB_USER="postgres"
DB_PASSWORD="your_secure_postgres_password"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql.gz"
RETENTION_DAYS=7

# Tạo thư mục backup nếu chưa có
mkdir -p $BACKUP_DIR

# Backup database
echo "Starting backup at $(date)"
docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_FILE

# Kiểm tra backup thành công
if [ $? -eq 0 ]; then
    echo "Backup successful: $BACKUP_FILE"
    echo "File size: $(du -h $BACKUP_FILE | cut -f1)"
else
    echo "Backup failed!"
    exit 1
fi

# Xóa backup cũ hơn RETENTION_DAYS
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "Old backups cleaned up (kept last $RETENTION_DAYS days)"

# Backup các file .env và docker-compose
cp /var/www/furniture-website/.env.production "$BACKUP_DIR/env_backup_$DATE"
cp /var/www/furniture-website/docker-compose.production.yml "$BACKUP_DIR/docker-compose_backup_$DATE.yml"

echo "Backup completed at $(date)"
```

Phân quyền:

```bash
chmod +x /usr/local/bin/backup-furniture-db.sh
```

### 10.2. Cấu hình Cron job chạy hàng ngày:

```bash
crontab -e
```

Thêm dòng (chạy lúc 2h sáng mỗi ngày):

```cron
0 2 * * * /usr/local/bin/backup-furniture-db.sh >> /var/log/furniture-backup.log 2>&1
```

### 10.3. Test backup ngay:

```bash
/usr/local/bin/backup-furniture-db.sh

# Kiểm tra file backup
ls -lh /var/backups/furniture-website/
```


### 10.4. Backup lên Cloud Storage (Tùy chọn):

#### Sử dụng rclone để upload lên Google Drive:

```bash
# Cài đặt rclone
apt install rclone

# Cấu hình Google Drive
rclone config

# Tạo script sync backup
nano /usr/local/bin/sync-backup-to-cloud.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/furniture-website"
REMOTE_NAME="gdrive"  # Tên remote đã config trong rclone
REMOTE_PATH="Backups/FurnitureWebsite"

# Sync backups to cloud
rclone sync $BACKUP_DIR $REMOTE_NAME:$REMOTE_PATH \
  --transfers 4 \
  --checkers 8 \
  --log-file=/var/log/rclone-backup.log \
  --log-level INFO

echo "Cloud backup sync completed at $(date)"
```

```bash
chmod +x /usr/local/bin/sync-backup-to-cloud.sh
```

Thêm vào cron (chạy sau backup 30 phút):

```cron
30 2 * * * /usr/local/bin/sync-backup-to-cloud.sh
```

### 10.5. Khôi phục từ backup:

```bash
# Liệt kê các backup có sẵn
ls -lh /var/backups/furniture-website/

# Khôi phục database từ file backup
gunzip -c /var/backups/furniture-website/db_backup_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i supabase-db-furniture-website psql -U postgres postgres

# Restart application
cd /var/www/furniture-website
docker compose -f docker-compose.production.yml restart
```


---

## 11. XỬ LÝ SỰ CỐ THƯỜNG GẶP

### Lỗi 1: Build Docker thất bại với "standalone not found"

**Nguyên nhân**: Chưa thêm `output: "standalone"` vào `next.config.ts`

**Giải pháp**:
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: "standalone", // Thêm dòng này
  // ... các config khác
};
```

### Lỗi 2: Cannot connect to database

**Nguyên nhân**: Sai thông tin kết nối hoặc Supabase chưa chạy

**Giải pháp**:
```bash
# Kiểm tra Supabase containers
docker ps | grep supabase

# Restart Supabase nếu cần
cd /var/www/supabase/docker
docker compose restart

# Kiểm tra logs
docker compose logs -f supabase-db
```

### Lỗi 3: 502 Bad Gateway từ Caddy

**Nguyên nhân**: Next.js app chưa chạy hoặc chạy sai port

**Giải pháp**:
```bash
# Kiểm tra app container
docker ps | grep furniture-website-app

# Kiểm tra logs
docker logs furniture-website-app

# Test kết nối trực tiếp
curl http://localhost:3000

# Restart app nếu cần
cd /var/www/furniture-website
docker compose -f docker-compose.production.yml restart
```

### Lỗi 4: SSL certificate không được issue

**Nguyên nhân**: DNS chưa trỏ đúng hoặc port 80/443 bị chặn

**Giải pháp**:
```bash
# Kiểm tra DNS
nslookup phuongdong.vn

# Kiểm tra firewall
ufw status

# Kiểm tra Caddy logs
journalctl -u caddy -f

# Test port từ bên ngoài
curl -I http://your_vps_ip
```

### Lỗi 5: Migrations thất bại

**Nguyên nhân**: Schema conflicts hoặc database chưa sẵn sàng

**Giải pháp**:
```bash
# Reset database (CẨN THẬN: Xóa toàn bộ data)
cd /var/www/furniture-website
supabase db reset

# Hoặc chạy từng migration thủ công
psql postgresql://postgres:password@localhost:5432/postgres < supabase/migrations/00000000000000_init.sql
```


### Lỗi 6: Out of memory

**Nguyên nhân**: VPS không đủ RAM

**Giải pháp**:
```bash
# Kiểm tra memory
free -m

# Tạo swap file (nếu chưa có)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Làm swap permanent
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab

# Tối ưu Docker memory limits
# Thêm vào docker-compose.production.yml:
# services:
#   app:
#     mem_limit: 1g
#     memswap_limit: 2g
```

### Lỗi 7: Permission denied trên volumes

**Nguyên nhân**: User trong container không có quyền ghi

**Giải pháp**:
```bash
# Đổi owner của thư mục
chown -R 1001:1001 /var/www/furniture-website/.next

# Hoặc set quyền rộng hơn (không khuyến khích)
chmod -R 777 /var/www/furniture-website/.next
```

### Lỗi 8: Image upload failed (Cloudinary)

**Nguyên nhân**: API keys sai hoặc chưa configure đúng

**Giải pháp**:
```bash
# Kiểm tra env variables
docker exec furniture-website-app env | grep CLOUDINARY

# Test Cloudinary từ container
docker exec -it furniture-website-app sh
curl -X POST "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload" \
  -F "upload_preset=YOUR_PRESET" \
  -F "file=@/path/to/test.jpg"
```

### Lỗi 9: Email không gửi được (Resend)

**Nguyên nhân**: API key sai hoặc domain chưa verify

**Giải pháp**:
```bash
# Test Resend API
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer YOUR_RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "test@example.com",
    "subject": "Test",
    "text": "Test email"
  }'

# Kiểm tra logs app
docker logs furniture-website-app | grep -i resend
```


---

## 12. BẢO TRÌ VÀ CẬP NHẬT

### 12.1. Cập nhật code mới:

```bash
cd /var/www/furniture-website

# Backup trước khi update
/usr/local/bin/backup-furniture-db.sh

# Pull code mới
git pull origin main

# Rebuild và restart
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml up -d

# Kiểm tra logs
docker compose -f docker-compose.production.yml logs -f
```

### 12.2. Cập nhật dependencies:

```bash
# Nếu có thay đổi package.json
cd /var/www/furniture-website
git pull

# Rebuild từ đầu (không dùng cache)
docker compose -f docker-compose.production.yml build --no-cache

# Restart
docker compose -f docker-compose.production.yml up -d
```

### 12.3. Chạy migrations mới:

```bash
cd /var/www/furniture-website

# Pull code mới có migrations
git pull

# Chạy migrations
supabase db push

# Hoặc
psql postgresql://postgres:password@localhost:5432/postgres < supabase/migrations/new_migration.sql
```

### 12.4. Theo dõi logs thường xuyên:

```bash
# App logs
docker logs -f --tail 100 furniture-website-app

# Caddy logs
journalctl -u caddy -f

# Supabase logs
cd /var/www/supabase/docker
docker compose logs -f

# System logs
tail -f /var/log/syslog
```

### 12.5. Tối ưu hóa disk space:

```bash
# Dọn dẹp Docker images và volumes không dùng
docker system prune -a --volumes

# Dọn dẹp logs cũ
find /var/log -name "*.log" -mtime +30 -delete

# Kiểm tra disk usage
du -sh /var/www/*
du -sh /var/lib/docker/*
```


---

## 13. CHECKLIST HOÀN THÀNH DEPLOYMENT

### Trước khi Go-Live:

- [ ] DNS đã trỏ đúng về IP VPS
- [ ] Firewall chỉ mở port 22, 80, 443
- [ ] Docker và Docker Compose đã cài đặt
- [ ] Supabase stack đã chạy và migrations thành công
- [ ] Next.js app đã build và chạy ổn định
- [ ] Caddy đã issue SSL certificate thành công
- [ ] Test tất cả chức năng chính (public pages, form, admin)
- [ ] Tạo admin user đầu tiên
- [ ] Cấu hình backup tự động và test restore
- [ ] Set up monitoring (optional nhưng khuyến khích)
- [ ] Đổi tất cả password mặc định
- [ ] Kiểm tra logs không có lỗi nghiêm trọng

### Sau khi Go-Live:

- [ ] Theo dõi uptime và response time
- [ ] Kiểm tra backup chạy đúng hẹn
- [ ] Monitor disk space và memory usage
- [ ] Test email notifications
- [ ] Test upload ảnh với Cloudinary
- [ ] Test AI assistant với Gemini (nếu đã config)
- [ ] Cập nhật documentation với thông tin production
- [ ] Setup alerts cho downtime (email/Telegram/Slack)

---

## 14. THÔNG TIN HỖ TRỢ

### Logs quan trọng:

```bash
# Application logs
/var/log/docker/furniture-website-app.log
docker logs furniture-website-app

# Web server logs
/var/log/caddy/access.log
journalctl -u caddy

# Backup logs
/var/log/furniture-backup.log

# System logs
/var/log/syslog
```

### Ports đang sử dụng:

- **22**: SSH
- **80**: HTTP (Caddy)
- **443**: HTTPS (Caddy)
- **3000**: Next.js (internal)
- **5432**: PostgreSQL (internal)
- **8000**: Supabase Kong (internal)
- **54323**: Supabase Studio (internal, optional)

### Files cấu hình quan trọng:

- `/var/www/furniture-website/.env.production`
- `/var/www/furniture-website/docker-compose.production.yml`
- `/var/www/supabase/docker/.env`
- `/etc/caddy/Caddyfile`
- `/var/www/supabase-credentials.txt`

### Lệnh khởi động lại toàn bộ hệ thống:

```bash
# Restart tất cả services
systemctl restart caddy
cd /var/www/supabase/docker && docker compose restart
cd /var/www/furniture-website && docker compose -f docker-compose.production.yml restart
```

---

## 🎉 HOÀN TẤT!

Bạn đã hoàn thành việc triển khai dự án Furniture Website lên VPS!

Nếu gặp vấn đề, hãy kiểm tra:
1. Logs của từng service
2. Checklist ở phần 13
3. Phần xử lý sự cố ở phần 11

**Chúc bạn vận hành thành công!** 🚀
