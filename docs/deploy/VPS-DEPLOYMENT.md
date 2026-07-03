# 🚀 Hướng dẫn triển khai Production lên VPS (bản chuẩn, khớp codebase)

> Bản này viết cho **trạng thái code hiện tại** sau khi đã squash migration (còn 1 file baseline),
> đổi `middleware.ts → proxy.ts`, và chốt chiến lược **nhập nội dung qua admin CMS (không seed data lên prod)**.
> Nó thay thế cho `HUONG-DAN-TRIEN-KHAI-VPS.md` ở những điểm khác biệt (xem [Phụ lục A](#phụ-lục-a--khác-biệt-so-với-guide-cũ)).

## Kiến trúc triển khai

```
Internet ──HTTPS──> Caddy (auto SSL, reverse proxy)
                      │
                      ├── your-domain.com        → app:3000        (Next.js standalone)
                      └── api.your-domain.com     → supabase-kong:8000 (Supabase self-hosted)

Docker network "supabase_default" (chung):
   [app] ──server-side──> http://supabase-kong:8000   (SUPABASE_URL_INTERNAL)
   [app] ──browser gọi──> https://api.your-domain.com (NEXT_PUBLIC_SUPABASE_URL, bake lúc build)
   [supabase-db] Postgres 5432 (chỉ nội bộ + localhost)
```

- **DB**: Supabase self-hosted (Docker) — Auth (GoTrue), PostgREST, Kong gateway, Postgres.
- **App**: Next.js 16 `output: standalone`, chạy `node server.js` trong container `runner`.
- **Media**: Cloudinary (không dùng Supabase Storage → `ENABLE_STORAGE=false` được).
- **Email báo giá**: Resend. **AI dịch**: Gemini (tùy chọn).

---

## 0. Trước khi động vào VPS — kiểm tra ở máy local

Chạy 3 lệnh này, **cả 3 phải xanh** thì mới deploy:

```bash
pnpm install --frozen-lockfile
pnpm typecheck   # 0 lỗi
pnpm test        # 93/93 pass
pnpm build       # ✓ Compiled, tạo .next/standalone
```

Đảm bảo code mới nhất đã ở trên remote:

```bash
git status                       # working tree sạch
git log --oneline -3             # có commit squash + cleanup
git push origin 001-showroom-site-cms
```

> ⚠️ `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` bị **bake vào bundle client lúc build**.
> Nghĩa là bạn phải build image **trên VPS sau khi đã có URL/anon key thật** (mục 6). Không build sẵn ở local rồi mang lên.

---

## 1. Yêu cầu VPS

| Hạng mục | Tối thiểu | Khuyến nghị |
|---|---|---|
| RAM | 2 GB | **4 GB** (build Next + Supabase khá nặng) |
| CPU | 2 vCPU | 2–4 vCPU |
| Disk | 20 GB | 40 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04/24.04 |

Cần: 1 **domain** đã trỏ A record về IP VPS cho cả `your-domain.com` và `api.your-domain.com`.

---

## 2. Thu thập thông tin trước (điền vào một chỗ an toàn)

Sinh sẵn các bí mật:

```bash
# Khóa mã hóa AI settings — PHẢI đúng 32 ký tự
openssl rand -base64 24 | head -c 32 ; echo
# Secret cho revalidate on-demand
openssl rand -base64 32
# Mật khẩu Postgres mạnh
openssl rand -base64 24
```

Chuẩn bị các key dịch vụ ngoài: **Cloudinary** (cloud name, api key, api secret), **Resend** (api key + email gửi đã verify domain), **Gemini** (tùy chọn).

---

## 3. Cấu hình VPS ban đầu

```bash
ssh root@YOUR_VPS_IP

# Cập nhật + công cụ
apt update && apt upgrade -y
apt install -y curl git ufw

# Docker (nếu chưa có)
curl -fsSL https://get.docker.com | sh
docker --version && docker compose version

# Tường lửa: cho SSH + HTTP/HTTPS, chặn phần còn lại
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status

# Thư mục làm việc
mkdir -p /var/www && cd /var/www
```

> 🔒 **Không** mở port 5432 (Postgres), 8000 (Kong), 3000 (app) ra ngoài. Chỉ Caddy (80/443) là public.

---

## 4. Cài Supabase self-hosted

```bash
cd /var/www
git clone --depth 1 https://github.com/supabase/supabase
mkdir -p /var/www/supabase-stack
cp -r supabase/docker/* /var/www/supabase-stack/
cp supabase/docker/.env.example /var/www/supabase-stack/.env
cd /var/www/supabase-stack
```

### 4.1. Sinh JWT secret + anon/service key

```bash
JWT_SECRET=$(openssl rand -base64 32)
ANON_KEY=$(docker run --rm supabase/gotrue gotrue generate jwt --secret="$JWT_SECRET" --exp=8765h)
SERVICE_ROLE_KEY=$(docker run --rm supabase/gotrue gotrue generate jwt --secret="$JWT_SECRET" --exp=8765h --role=service_role)
echo "JWT_SECRET=$JWT_SECRET"; echo "ANON_KEY=$ANON_KEY"; echo "SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY"
```

**Lưu lại 3 giá trị này.**

### 4.2. Sửa `/var/www/supabase-stack/.env`

```env
POSTGRES_PASSWORD=<mật_khẩu_postgres_mạnh>
JWT_SECRET=<JWT_SECRET ở trên>
ANON_KEY=<ANON_KEY ở trên>
SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY ở trên>

# URL public của Supabase (qua Caddy). Nếu chưa có SSL, tạm để http, đổi lại sau mục 7.
SITE_URL=https://your-domain.com
API_EXTERNAL_URL=https://api.your-domain.com
SUPABASE_PUBLIC_URL=https://api.your-domain.com

# App dùng Cloudinary, không cần Storage/Realtime
ENABLE_STORAGE=false
ENABLE_REALTIME=false

# Email confirm tắt để login admin bằng mật khẩu ngay (giống config local)
ENABLE_EMAIL_AUTOCONFIRM=true
```

### 4.3. Khởi động — **bắt buộc dùng project name `supabase`**

```bash
cd /var/www/supabase-stack
docker compose -p supabase up -d
docker compose -p supabase ps
```

> ⚠️ **Điểm chí mạng:** dùng `-p supabase` để Docker network là `supabase_default` và container tên `supabase-kong`, `supabase-db`.
> `docker-compose.production.yml` của app **hardcode** đúng 2 tên này. Chạy sai project name → app không nối được DB.

Kiểm tra:

```bash
curl -s http://localhost:8000/ | head         # Kong phản hồi
docker exec supabase-db psql -U postgres -c "select version();"
```

> Nếu container DB tên khác (vd `supabase-db-...`), ghi lại tên thật để dùng ở các lệnh sau.

---

## 5. Áp schema database (KHÔNG seed dữ liệu)

Sau squash, toàn bộ schema nằm ở **một file** `supabase/migrations/0001_baseline_schema.sql`.
Ta clone code rồi áp bằng `scripts/run-migrations.sh` (chạy psql theo `DATABASE_URL`).

```bash
cd /var/www
git clone https://github.com/Doanhaiduy/furniture-website
cd /var/www/furniture-website
git checkout 001-showroom-site-cms
```

**Cách 1 — qua `docker exec` (khuyến nghị, không cần cài gì thêm):**

```bash
docker exec -i supabase-db psql -U postgres -d postgres \
  < supabase/migrations/0001_baseline_schema.sql
```

Chạy sạch (không in ERROR) là thành công.

**Cách 2 — dùng `scripts/run-migrations.sh`** (tiện khi về sau có nhiều file, nhưng **cần psql client trên host**):

```bash
apt install -y postgresql-client   # nếu chưa có psql
export DATABASE_URL="postgresql://postgres:<mật_khẩu_postgres>@localhost:5432/postgres"
bash scripts/run-migrations.sh     # → Found 1 migration files → ✅ Success
```

> ❌ **KHÔNG chạy `psql ... < supabase/seed.sql` trên prod.** `seed.sql` chỉ dành cho `db reset` ở local:
> nó chứa dữ liệu demo + 6 tài khoản test (kèm password hash). Prod bắt đầu **rỗng**; nội dung thật sẽ nhập qua admin CMS.

Kiểm tra schema đã lên:

```bash
docker exec supabase-db psql -U postgres -c "\dt public.*" | head
docker exec supabase-db psql -U postgres -c "select count(*) from public.products;"   # = 0, đúng
```

---

## 6. Build & chạy app Next.js

### 6.1. Tạo `/var/www/furniture-website/.env.production`

Dùng template có sẵn trong repo:

```bash
cd /var/www/furniture-website
cp .env.production.example .env.production
nano .env.production
```

Điền giá trị thật (xem mô tả từng biến trong `.env.production.example`). Tối thiểu:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://api.your-domain.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY từ mục 4.1>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY từ mục 4.1>
SUPABASE_URL_INTERNAL=http://supabase-kong:8000
DATABASE_URL=postgresql://postgres:<mật_khẩu>@supabase-db:5432/postgres
AI_SECRET_ENCRYPTION_KEY=<32 ký tự>
REVALIDATION_SECRET=<chuỗi ngẫu nhiên>
NEXT_PUBLIC_USE_MOCK_DATA=false

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<...>
CLOUDINARY_API_KEY=<...>
CLOUDINARY_API_SECRET=<...>
CLOUDINARY_UPLOAD_FOLDER=furniture-prod

RESEND_API_KEY=<...>
RESEND_FROM=no-reply@your-domain.com
QUOTE_NOTIFICATION_RECIPIENTS=sales@your-domain.com
GOOGLE_MAPS_EMBED_ALLOWED_ORIGIN=https://your-domain.com

GEMINI_API_KEY=<... hoặc bỏ trống>
GEMINI_DEFAULT_MODEL=gemini-1.5-pro
```

> `DATABASE_URL` trong `.env.production` dùng host **`supabase-db`** (tên container, app gọi qua network nội bộ),
> khác với `DATABASE_URL` bạn `export` ở mục 5 (dùng `localhost` vì chạy từ host).

### 6.2. Build & khởi động bằng compose production

`docker-compose.production.yml` đã cấu hình sẵn: target `runner`, `env_file: .env.production`,
`SUPABASE_URL_INTERNAL=http://supabase-kong:8000`, join network `supabase_default`, healthcheck `/api/health`.

Vì `NEXT_PUBLIC_*` bake lúc build, truyền chúng qua biến môi trường khi build (compose đọc làm secret):

```bash
cd /var/www/furniture-website

export NEXT_PUBLIC_SUPABASE_URL="https://api.your-domain.com"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="<ANON_KEY>"

docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml up -d
docker compose -f docker-compose.production.yml ps
```

Kiểm tra app (chưa qua domain):

```bash
curl -s http://localhost:3000/api/health
# Mong đợi: {"status":"ok","database":"connected"}
```

> Nếu `database":"disconnected"` → app chưa nối được Supabase. Xem [Troubleshooting](#9-troubleshooting).

---

## 7. Reverse proxy + SSL (Caddy)

Caddy tự xin Let's Encrypt SSL cho cả 2 domain.

```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy
```

Sửa `/etc/caddy/Caddyfile` (thay `your-domain.com`):

```caddy
your-domain.com {
	encode gzip zstd
	reverse_proxy localhost:3000
}

api.your-domain.com {
	encode gzip zstd
	reverse_proxy localhost:8000
}
```

```bash
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy
systemctl status caddy --no-pager
```

Đợi 1–2 phút cho SSL, rồi test:

```bash
curl -I https://your-domain.com
curl -s https://api.your-domain.com/rest/v1/ -H "apikey: <ANON_KEY>" | head
```

Nếu lúc mục 4.2 bạn để `http`, giờ đổi `SITE_URL`/`API_EXTERNAL_URL`/`SUPABASE_PUBLIC_URL` sang `https://...` rồi:

```bash
cd /var/www/supabase-stack && docker compose -p supabase up -d
```

---

## 8. Tạo tài khoản admin thật (thay cho seed)

Prod đang rỗng và **không có tài khoản nào**. Cách chắc chắn nhất (không cần Node/deps) là tạo thẳng bằng SQL —
tạo cả `auth.users` và `public.profiles` trong một lệnh. **Đổi email + mật khẩu** trước khi chạy:

```bash
docker exec -i supabase-db psql -U postgres <<'SQL'
WITH new_user AS (
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, phone_change, phone_change_token,
    email_change_token_current, reauthentication_token, email_change_confirm_status,
    created_at, updated_at
  ) VALUES (
    gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
    'admin@your-domain.com',                                        -- ⬅ đổi email
    extensions.crypt('DOI_MAT_KHAU_MANH_O_DAY', extensions.gen_salt('bf')),  -- ⬅ đổi mật khẩu
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Administrator"}'::jsonb,
    'authenticated','authenticated',
    '','','','','','','','',0, now(), now()
  ) RETURNING id, email
)
INSERT INTO public.profiles (id, email, full_name, role, is_active)
SELECT id, email, 'Administrator', 'admin', true FROM new_user;
SQL
```

Sau khi có admin đầu tiên, các user tiếp theo tạo qua trang `/admin/users`.

> 🔐 Đổi mật khẩu bất cứ lúc nào:
> ```bash
> docker exec supabase-db psql -U postgres -c \
>  "update auth.users set encrypted_password = extensions.crypt('<MẬT_KHẨU_MỚI>', extensions.gen_salt('bf')) where email='admin@your-domain.com';"
> ```
>
> **Lưu ý về `scripts/create-admin.ts`:** script này tồn tại nhưng hardcode `admin@phuongdong.vn/admin123` và `import "dotenv"`
> (dotenv **không** nằm trong dependencies) → trên VPS mới clone sẽ lỗi import nếu chưa `pnpm install`. Ưu tiên dùng cách SQL ở trên.

---

## 9. Smoke test go-live

Lần lượt xác nhận trên domain thật:

- [ ] `https://your-domain.com` — trang public load, đổi ngôn ngữ VI/EN OK
- [ ] `https://your-domain.com/sitemap.xml` và `/robots.txt` trả đúng domain
- [ ] `https://your-domain.com/admin/login` — login bằng admin vừa tạo
- [ ] Tạo thử 1 **sản phẩm** trong admin → hiện ở trang public
- [ ] Upload 1 ảnh (Cloudinary) trong admin OK
- [ ] Gửi 1 **yêu cầu báo giá** từ public → có bản ghi trong `/admin/quotes` + email về `QUOTE_NOTIFICATION_RECIPIENTS`
- [ ] `curl https://your-domain.com/api/health` → `status: ok`

> Nội dung thật (sản phẩm, danh mục, showroom, blog...) nhập dần qua admin CMS.

---

## 10. Backup tự động (khuyến nghị)

```bash
mkdir -p /var/backups/furniture
cat > /usr/local/bin/backup-db.sh <<'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
OUT=/var/backups/furniture/db_$DATE.sql.gz
docker exec supabase-db pg_dump -U postgres postgres | gzip > "$OUT"
# giữ 14 ngày
find /var/backups/furniture -name 'db_*.sql.gz' -mtime +14 -delete
EOF
chmod +x /usr/local/bin/backup-db.sh
/usr/local/bin/backup-db.sh           # test ngay

# Cron 2h sáng mỗi ngày
( crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-db.sh" ) | crontab -
```

Khôi phục:

```bash
gunzip -c /var/backups/furniture/db_YYYYMMDD_HHMMSS.sql.gz | docker exec -i supabase-db psql -U postgres postgres
```

---

## 11. Cập nhật code / migration về sau

**Deploy code mới:**

```bash
cd /var/www/furniture-website
git pull origin 001-showroom-site-cms
export NEXT_PUBLIC_SUPABASE_URL="https://api.your-domain.com"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="<ANON_KEY>"
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml up -d
```

**Có migration mới** (file `.sql` mới trong `supabase/migrations/`):

```bash
export DATABASE_URL="postgresql://postgres:<mật_khẩu>@localhost:5432/postgres"
bash scripts/run-migrations.sh
```

> `run-migrations.sh` chạy **mọi** file trong thư mục. Nếu về sau có nhiều file, cân nhắc chỉ chạy file mới bằng psql thủ công
> để tránh chạy lại baseline: `psql "$DATABASE_URL" < supabase/migrations/<file_mới>.sql`.

---

## 12. Troubleshooting

| Triệu chứng | Nguyên nhân & cách xử lý |
|---|---|
| `build: standalone not found` | `next.config.ts` phải có `output: "standalone"` (đã có sẵn). Build lại. |
| `/api/health` → `database: disconnected` | App không tới được Supabase. Kiểm tra: app đã join network `supabase_default` chưa (`docker network inspect supabase_default`); Supabase chạy đúng `-p supabase` chưa; `SUPABASE_URL_INTERNAL=http://supabase-kong:8000`. |
| App log `Invalid environment variables` | Thiếu biến bắt buộc trong `.env.production` (`NEXT_PUBLIC_SUPABASE_URL/ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`). Xem `lib/env/schema.ts`. |
| Login admin không vào được | Chưa chạy `create-admin.ts`; hoặc `ENABLE_EMAIL_AUTOCONFIRM` chưa bật ở Supabase `.env`. |
| Trang public trắng / gọi sai Supabase URL | `NEXT_PUBLIC_SUPABASE_URL` sai lúc **build** (bị bake). Sửa rồi **build lại** image, không chỉ restart. |
| 502 từ Caddy | App container chưa `up` hoặc chưa healthy: `docker compose -f docker-compose.production.yml logs -f app`. |
| SSL không cấp | DNS A record của cả 2 domain phải trỏ đúng IP; port 80/443 mở trong UFW; xem `journalctl -u caddy -f`. |
| Upload ảnh lỗi | Sai `CLOUDINARY_*` hoặc chưa cấu hình upload folder. |
| Email báo giá không gửi | `RESEND_API_KEY` sai hoặc `RESEND_FROM` chưa verify domain ở Resend. |

**Log quan trọng:**

```bash
docker compose -f docker-compose.production.yml logs -f app     # app
docker compose -p supabase logs -f                              # supabase stack
journalctl -u caddy -f                                          # caddy/SSL
```

---

## Phụ lục A — Khác biệt so với guide cũ (`HUONG-DAN-TRIEN-KHAI-VPS.md`)

Guide cũ vẫn đúng phần lớn về hạ tầng. Các điểm **đã sửa** trong bản này để khớp code hiện tại:

1. **Migration**: cũ dùng `supabase db push` (thiên về Supabase Cloud). Bản này dùng `scripts/run-migrations.sh` với `DATABASE_URL` — đúng cho self-hosted, và giờ chỉ còn **1 file baseline** sau squash.
2. **Seed prod**: cũ có bước `psql ... < supabase/seed.sql`. Bản này **bỏ hẳn** — `seed.sql` là dev-only; prod nhập nội dung qua admin CMS.
3. **Tạo admin**: nhấn mạnh phải **đổi mật khẩu mặc định** `admin123` ngay.
4. **`middleware.ts`**: đã đổi tên thành `proxy.ts` (Next 16). Không cần chỉnh gì thêm.
5. **`next.config.ts`**: đã có `output: "standalone"` sẵn — bỏ bước "sửa next.config" của guide cũ.
6. **`.env.production`**: đã có `.env.production.example` trong repo làm mẫu.
7. **Docker network**: nêu rõ phải chạy Supabase với `-p supabase` để khớp `supabase_default` / `supabase-kong` mà `docker-compose.production.yml` hardcode.

Guide cũ vẫn tham khảo tốt cho: giám sát nâng cao, backup lên cloud, và các mẹo hardening.
