# DATABASE AUDIT REPORT
**Auditor role**: Principal Database Architect + Senior Postgres/Supabase Auditor + Staff Data Model Reviewer  
**Audit date**: 2026-06-19  
**Scope**: Toàn bộ 22 migration files, schema, RPCs, triggers, constraints, indexes  
**Tone**: Thẳng, skeptical, có evidence từ migration files.

---

## MỤC LỤC
1. [Executive Summary](#1-executive-summary)
2. [Table-by-Table Audit](#2-table-by-table-audit)
3. [Relation / FK Audit](#3-relation--fk-audit)
4. [Migration Audit](#4-migration-audit)
5. [RPC / Function / View Audit](#5-rpc--function--view-audit)
6. [Missing Schema / Columns / Constraints](#6-missing-schema--columns--constraints)
7. [Index / Performance Audit](#7-index--performance-audit)
8. [Top Critical DB Issues](#8-top-critical-db-issues)
9. [Priority Remediation Roadmap](#9-priority-remediation-roadmap)
10. [Final Verdict](#10-final-verdict)

---

## 1. Executive Summary

| Trục | Điểm | Nhận xét |
|---|---|---|
| Core table definitions | 75/100 | Cơ bản đúng, translation pattern rõ ràng. Một số bảng thiếu columns |
| FK & constraints | 80/100 | Tốt, có cascade logic. Nhưng có 2 FK conflict giữa migrations |
| Migration hygiene | 45/100 | **7 patch migrations sau initial** — nhiều drift, schema bị piecemeal |
| RPC correctness | 40/100 | **3 ghost table refs** trong active RPC; **2 competing signatures** cùng function name |
| Index coverage | 80/100 | Tốt cho phần lớn queries. Thiếu 1 số compound index |
| Business completeness | 65/100 | Đủ cho MVP. Thiếu integration_secrets FK, brands.slug không trong FK, promotions missing constraints |

**Verdict tổng thể: PARTIAL — có 3 BROKEN RPCs đang active, 1 DRIFTED schema, cần fix trước khi production.**

---

## 2. Table-by-Table Audit

### 2.1 `profiles`

| Cột | Schema | Vấn đề |
|---|---|---|
| `id` | uuid PK, FK → `auth.users(id)` CASCADE | ✅ |
| `email` | text NOT NULL | ✅ có check constraint email shape |
| `role` | `cms_role` enum (admin/editor) | ✅ |
| `is_active` | boolean NOT NULL default true | ✅ |
| `last_login_at` | timestamptz | ✅ |
| `deleted_at` | timestamptz | ✅ soft delete |
| **Thiếu** | `avatar_url` | Không có avatar. Admin UI không hiển thị được avatar |
| **Thiếu** | `phone` / `bio` | Admin profile info rất minimal |

**Verdict: PARTIAL** — hoạt động cho auth/RBAC, thiếu profile fields nếu admin UI muốn rich profile.

---

### 2.2 `products`

| Cột | Schema | Vấn đề |
|---|---|---|
| `category_id` | uuid NOT NULL FK → categories | ✅ |
| `brand_id` | uuid nullable FK → brands | ✅ Thêm trong migration 20260613 |
| `price_min` / `price_max` | numeric(12,2) nullable | ✅ có check price_max >= price_min |
| `promo_price_min` / `promo_price_max` | numeric(12,2) nullable | ⚠️ Thêm trong `20260610_promotions.sql` |
| `promotion_id` | uuid FK → promotions | ⚠️ Thêm rồi DROP trong `20260614000001_product_promotions.sql` |
| `brand_series` | text | ✅ legacy field, vẫn còn |
| `specs` | **KHÔNG TỒN TẠI** | ❌ **BROKEN** — RPC `20260614000002` và `20260617` reference `p.specs` nhưng cột này không được define trong bất kỳ migration nào |
| `group_key` | **KHÔNG TỒN TẠI** trên products | ❌ Migration `20260617` comment: "Fix: use pc.group_key instead of p.group_key" — nhưng migrations trước đó reference p.group_key |
| `dimension_unit` | text default 'mm' | ✅ |

**Verdict: PARTIAL/BROKEN** — `p.specs` column được reference trong 2 RPCs nhưng không exist. `products.promotion_id` tồn tại từ 20260610 → drop trong 20260614 (đúng).

---

### 2.3 `product_categories`

| Cột | Schema | Vấn đề |
|---|---|---|
| `parent_id` | uuid FK → self (set null) | ✅ |
| `group_key` | `product_group_key` enum | ✅ |
| `image_media_id` | uuid FK → media_assets | ✅ |
| Max depth | Không có constraint | ❌ Unlimited parent/child nesting có thể gây query recursive vô hạn |
| Self-ref circular | Không có constraint | ❌ Category có thể là parent của chính nó |

**Verdict: PARTIAL** — hoạt động nhưng thiếu depth constraint và circular ref check.

---

### 2.4 `brands`

| Cột | Schema | Vấn đề |
|---|---|---|
| `logo_media_id` | uuid FK → media_assets | ✅ |
| `slug` | text, UNIQUE | ⚠️ **Thêm trong migration 20260616 (patch)**, không phải initial schema |
| `origin` | text | ✅ |
| `status` | publish_status | ✅ |
| `slug` NOT NULL? | Nullable | ❌ `slug` được dùng cho filtering (`b.slug = p_brand_slug`) nhưng nullable → brand không có slug sẽ không filter được |
| `brand_id` FK từ `brand_translations` | ✅ cascade | ✅ |
| Publish guard | Không có `require_publish_translations` trigger cho brands | ❌ Có thể publish brand không có translation |

**Verdict: PARTIAL** — slug nullable là design gap, không có publish translation guard.

---

### 2.5 `promotions`

| Cột | Schema | Vấn đề |
|---|---|---|
| `code` | text UNIQUE NOT NULL | ✅ |
| `discount_percentage` | numeric(5,2) | ✅ |
| `start_at` / `end_at` | timestamptz nullable | ✅ |
| `cover_media_id` | uuid FK → media_assets | ✅ Thêm trong 20260613 |
| `combo_price` / `original_price` | numeric(12,2) nullable | ✅ Thêm trong 20260613 |
| `metadata_jsonb` | jsonb | ✅ |
| Check: combo_price < original_price | ❌ KHÔNG CÓ | ❌ Không có DB-level constraint |
| Check: start_at < end_at | ❌ KHÔNG CÓ | ❌ Không có DB-level constraint |
| Publish guard | Không có `require_publish_translations` trigger | ❌ Có thể publish promotion không có translation |
| `updated_at` trigger | Không có trigger | ❌ `updated_at` không tự update |

**Verdict: PARTIAL** — thiếu date range constraint, combo price constraint, publish guard, updated_at trigger.

---

### 2.6 `product_promotions` (junction table)

| Aspect | Status | Vấn đề |
|---|---|---|
| Composite PK (product_id, promotion_id) | ✅ | ✅ |
| FK → products CASCADE | ✅ | ✅ |
| FK → promotions CASCADE | ✅ | ✅ |
| RLS policies | ✅ có editor + service_role | ✅ |
| `updated_at` | ❌ KHÔNG CÓ updated_at cột | Bảng junction, acceptable |

**Verdict: READY** — junction table đơn giản, đúng thiết kế.

---

### 2.7 `promotion_targets`

| Aspect | Status | Vấn đề |
|---|---|---|
| `target_type` | text CHECK (product/category/brand/all) | ✅ |
| `target_id` | uuid nullable | ✅ |
| FK `target_id` | ❌ KHÔNG CÓ FK | ❌ `target_id` polymorphic — không enforce referential integrity |
| Unique (promotion_id, target_type, target_id) | ❌ KHÔNG CÓ | ❌ Có thể insert duplicate targets |

**Verdict: PARTIAL** — polymorphic FK là acceptable pattern, nhưng missing unique constraint là bug.

---

### 2.8 `showrooms`

| Cột | Schema | Vấn đề |
|---|---|---|
| `hotline` | text NOT NULL | ✅ |
| `google_maps_embed_url` | text NOT NULL, check https:// | ✅ |
| `google_maps_fallback_url` | text NOT NULL, check https:// | ✅ |
| `latitude` / `longitude` | numeric(10,7), check range | ✅ |
| `code` | text nullable, unique (partial) | ✅ |
| `cover_image_media_id` | ❌ KHÔNG TỒN TẠI | ❌ Showrooms dùng `showroom_media` junction để link ảnh — nhưng `is_primary` trên đó. Admin form expect single `cover_image`. |
| Publish guard | ✅ có trigger | ✅ |

**Verdict: PARTIAL** — không có `cover_media_id` trực tiếp nhưng dùng junction table — acceptable nếu FE xử lý đúng.

---

### 2.9 `blog_posts`

| Cột | Schema | Vấn đề |
|---|---|---|
| `category_id` | uuid NOT NULL FK → blog_categories RESTRICT | ✅ |
| `author_id` | uuid NOT NULL FK → profiles RESTRICT | ✅ |
| `cover_media_id` | uuid FK → media_assets set null | ✅ |
| Publish guard | ✅ trigger require vi+en translation | ✅ |
| `deleted_at` | ✅ | ✅ |

**Verdict: READY** — đầy đủ nhất trong các content tables.

---

### 2.10 `media_assets`

| Aspect | Status | Vấn đề |
|---|---|---|
| Provider identity check | ✅ Cloudinary XOR Supabase Storage | ✅ |
| size_bytes > 0 | ✅ | ✅ |
| public_url https check | ✅ | ✅ |
| `original_filename` | ❌ KHÔNG TỒN TẠI trong schema | ❌ API route `/api/admin/media/upload` gửi `original_filename` nhưng DB không có column này |
| RLS | ✅ active status check | ✅ |
| `deleted_at` | ✅ soft delete | ✅ |

**Verdict: PARTIAL** — `original_filename` field mismatch với API route.

---

### 2.11 `site_settings`

| Cột | Schema | Vấn đề |
|---|---|---|
| `singleton_key` | text UNIQUE default 'default', check = 'default' | ✅ |
| `logo_media_id` | FK → media_assets | ✅ |
| `contact_phone` | text nullable | ⚠️ Không có format check (settings route API không validate) |
| `contact_email` | text nullable, check email | ✅ |
| `quote_sender_email` | text nullable, check email | ✅ |
| `resend_api_key` | ❌ KHÔNG TỒN TẠI | ❌ API key được lưu trong `integration_secrets`, không phải `site_settings` — nhưng admin form tưởng lưu vào settings |
| `hero_*` / SEO section fields | ❌ KHÔNG TỒN TẠI | ❌ Settings form có rất nhiều homepage fields nhưng không có columns — lưu vào `content_pages` |

**Verdict: PARTIAL** — `site_settings` chỉ lưu meta/contact/media. Homepage content phải vào `content_pages`. FE admin form mapping sai.

---

### 2.12 `integration_secrets`

| Cột | Schema | Source |
|---|---|---|
| `id` | uuid PK | ✅ |
| `key_name` | text NOT NULL | ✅ |
| `encrypted_value` | text NOT NULL | ✅ |
| `updated_by` | uuid FK → profiles | ✅ |
| `site_settings_id` | ❌ KHÔNG TỒN TẠI | ❌ Không có FK liên kết về site_settings — standalone orphan table |
| RLS | Admin only | ✅ |

**Verdict: PARTIAL** — isolated table, không FK về settings gây khó join khi cần.

---

### 2.13 `quote_requests`

| Cột | Schema | Vấn đề |
|---|---|---|
| `assigned_to` | uuid FK → profiles | ⚠️ **DUPLICATE FK CONFLICT** — định nghĩa trong `0003_core_tables.sql` (không có column), FK trong `0004` → cột không tồn tại. Sau đó `20260613` và `20260614000003` đều ADD COLUMN lại với type `uuid` và `text` khác nhau |
| `admin_notes` | text | ✅ |
| `sales_notes` | text | Thêm trong 20260613 — có thể conflict với `admin_notes` |
| `snapshot_price` / `snapshot_promo_price` | numeric | Thêm trong 20260613 — ✅ |
| `status` | `quote_status` enum | ✅ |
| `deleted_at` | ✅ | ✅ |

**Verdict: DRIFTED** — `assigned_to` column được thêm với type `uuid` (20260613) VÀ type `text` (20260614000003:22) trong cùng project. Đây là type mismatch drift nghiêm trọng.

---

### 2.14 `quote_status_logs` vs `quote_request_events` vs `quote_status_history`

**Ba bảng cho cùng mục đích audit trail của quote status:**

| Bảng | Migration | Type |
|---|---|---|
| `quote_request_events` | `0003_core_tables.sql` | old_status/new_status `quote_status` enum |
| `quote_status_history` | `20260613000001` | old_status/new_status `quote_status` enum |
| `quote_status_logs` | `20260614000003` | from_status/to_status **text** (không phải enum) |

**Ba bảng tương tự nhau tạo ra:**
- Không rõ bảng nào là "chính thức"
- `quote_request_events` có `prevent_update_delete` trigger (append-only) — production-safe nhất
- `quote_status_logs` dùng `text` thay vì `quote_status` enum — type drift
- `quote_status_history` không có append-only trigger

**Verdict: DRIFTED** — 3 bảng trùng mục đích. Cần consolidate về `quote_request_events`.

---

### 2.15 `content_pages` / `content_page_translations`

| Aspect | Status | Vấn đề |
|---|---|---|
| `key` text UNIQUE | ✅ | ✅ |
| Translation pattern | ✅ | ✅ |
| `body_json` | jsonb | ✅ |
| Homepage content | Lưu vào đây? | ❌ Admin form settings gửi homepage data đến `/api/admin/settings` không phải `/api/admin/content-pages` |

**Verdict: PARTIAL** — schema đúng, nhưng mapping API không nhất quán.

---

## 3. Relation / FK Audit

### 3.1 FK Matrix (Key relationships)

| Parent | Child | FK | Cascade | Verdict |
|---|---|---|---|---|
| `auth.users` | `profiles` | id → id | CASCADE | ✅ |
| `profiles` | `products` | created_by, updated_by | SET NULL | ✅ |
| `product_categories` | `products` | category_id | RESTRICT | ✅ |
| `brands` | `products` | brand_id | SET NULL | ✅ |
| `products` | `product_media` | product_id | CASCADE | ✅ |
| `products` | `product_translations` | product_id | CASCADE | ✅ |
| `promotions` | `product_promotions` | promotion_id | CASCADE | ✅ |
| `products` | `product_promotions` | product_id | CASCADE | ✅ |
| `promotions` | `promotion_targets` | promotion_id | CASCADE | ✅ |
| `promotion_targets` | `target_id` (product/category/brand) | ❌ KHÔNG CÓ | N/A | ❌ MISSING |
| `blog_categories` | `blog_posts` | category_id | RESTRICT | ✅ |
| `profiles` | `blog_posts` | author_id | RESTRICT | ✅ |
| `site_settings` | `integration_secrets` | ❌ KHÔNG CÓ | N/A | ❌ MISSING |
| `quote_requests` | `assigned_to` | uuid FK profiles | SET NULL | ⚠️ DUPLICATE CONFLICT |

### 3.2 Cascade behavior analysis

| Scenario | Behavior | Risk |
|---|---|---|
| Xóa profile admin | Products/blog created_by → NULL | ✅ acceptable |
| Xóa category có products | RESTRICT — block delete | ✅ tốt |
| Xóa product | product_media, product_translations, product_attribute_values CASCADE | ✅ |
| Xóa brand | products.brand_id → NULL | ✅ safe |
| Xóa promotion | product_promotions CASCADE, promotion_targets CASCADE | ✅ |
| Xóa media_asset | product_media CASCADE, showroom_media CASCADE | ⚠️ Media xóa → tất cả product/showroom mất ảnh |
| Xóa auth.user | profile CASCADE | ✅ |
| Xóa blog_category có posts | RESTRICT | ✅ |

**Media cascade warning**: Xóa 1 `media_assets` row sẽ cascade delete tất cả `product_media`, `showroom_media`, `page_media` liên kết. Không có orphan check trước khi delete. Production risk nếu admin xóa nhầm media.

---

## 4. Migration Audit

### 4.1 Migration timeline và pattern

```
0001–0009: Initial sequential migrations (foundation)
20260607: Patch — integration_secrets
20260608: Patch — public categories RLS fix
20260610: Patch — promotions table
20260613: Patch — brands + quote enhancements
20260613000002: Patch — public_products RPC v2 (drops v1)
20260613000003: Patch — public_promotions RPC
20260614000001: Patch — product_promotions junction
20260614000002: Patch — public_products v3 (brand/discount filter) ← BROKEN refs
20260614000003: Patch — quote_status_logs + update_quote_status RPC
20260616000001: Hotfix — drop overloaded RPC, add RLS
20260617000001: Hotfix — fix group_key bug ← BROKEN refs still present
20260618000001: Hotfix — fix RPC media join + add promo_price ← latest, CLEANEST
```

**13 patch/hotfix migrations sau initial 9** = dấu hiệu schema chưa được design đầy đủ từ đầu.

### 4.2 Các vấn đề migration hygiene

**DRIFT #1: `assigned_to` column type conflict**
- `0004_foreign_keys_indexes_triggers.sql`: FK `fk_quote_requests_assigned_to` → nhưng column `assigned_to` chưa exist ở thời điểm đó → FK sẽ fail
- `20260613000001`: `ALTER TABLE public.quote_requests ADD COLUMN IF NOT EXISTS assigned_to uuid`
- `20260614000003`: `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS assigned_to text` ← **type `text` thay vì `uuid`**

Nếu cả hai migrations chạy theo thứ tự: 20260613 thêm `uuid`, 20260614 có `IF NOT EXISTS` nên skip → OK. Nhưng nếu chỉ chạy 20260614 mà không có 20260613: column sẽ là `text`. **Type drift phụ thuộc thứ tự execution.**

**DRIFT #2: `public_products` RPC có 3+ competing active definitions**
- `0008`: typed params (`public.locale_code`, `public.product_group_key`) — 10 params
- `20260613000002`: typed params — 10 params (drops v1 explicitly)
- `20260614000002`: `text` params — 12 params (`p_brand_slug`, `p_has_discount`) ← BROKEN: refs `product_attributes`, `p.specs`
- `20260616000001`: drops 10-param signature
- `20260617000001`: `text` params — 12 params ← BROKEN: refs `product_attributes`, `p.specs`
- `20260618000001`: `text` params — 12 params + `promo_price_min`, `promo_price_max` ← CLEANEST (fixed refs)

Sau khi chạy tất cả: `0008` version (typed locale_code) vẫn còn active vì không bị drop trong `20260618`. → **Hai overloads active** → PostgREST sẽ trả PGRST203 error.

**DRIFT #3: Promotions missing `updated_at` trigger**
- `promotions` table tạo trong `20260610` không attach `trg_promotions_set_updated_at` trigger
- `promotion_translations` cũng không có
- `brands` và `brand_translations` cũng không có `updated_at` trigger
- `product_promotions`, `promotion_targets`, `quote_status_history` không có updated_at trigger (acceptable cho junction)

**DRIFT #4: Seed data trong migration**
- `20260610_promotions.sql` chứa INSERT seed data
- `20260618000002_real_production_seed.sql` là file seed data 66KB trong migrations folder
- Seed data trong migration files là anti-pattern — không thể rollback data riêng với schema

### 4.3 Missing rollback strategy

Không có down-migrations. Supabase CLI hỗ trợ, nhưng không có file nào. Mọi rollback phải manual.

---

## 5. RPC / Function / View Audit

### 5.1 `public_products` — TRẠNG THÁI NGHIÊM TRỌNG

**Vấn đề 1: Ghost table `product_attributes`**

Migrations `20260614000002` và `20260617000001` reference:
```sql
FROM product_attributes pa
WHERE pa.product_id = p.id
  AND pa.attribute_key = kv.key   -- column không tồn tại
  AND pa.attribute_value = kv.value
```

Bảng `product_attributes` **không tồn tại**. Schema thực tế dùng:
- `product_attribute_values` (bảng thực)
- `product_attribute_definitions` (key)  
- `product_attribute_options` (option key)

Migration `20260618000001` đã fix — dùng đúng bảng. **Nhưng các migrations trước (20260614, 20260617) đang tạo overloaded functions vẫn còn tồn tại trong DB.**

**Vấn đề 2: Ghost column `p.specs`**

```sql
COALESCE(p.specs, '{}'::jsonb) AS specs,  -- column không tồn tại trong products
```

`products` table không có column `specs`. Chỉ có `description_json` trong `product_translations`. Migration `20260618` fix bằng cách map `specs` → `pt.description_json`, nhưng các overloads trước vẫn còn broken.

**Vấn đề 3: `COALESCE(bt.name, b.slug)` khi `b.slug` nullable**

`brands.slug` được thêm trong `20260616` và là NULLABLE. RPC fallback `COALESCE(bt.name, b.slug)` sẽ trả NULL nếu cả `bt.name` và `b.slug` đều null.

**Vấn đề 4: Signature overload conflict**

Trong `0008` tồn tại `public.public_products(public.locale_code, ..., public.product_group_key, ...)` — typed enum params.  
Trong `20260618` tồn tại `public_products(text, ..., text, ...)` — text params.  
`20260616` chỉ drop 10-param typed version.  
`20260618` drop nhiều nhưng không chắc drop hết — cần verify trực tiếp trên DB.

### 5.2 `public_promotions` — PARTIAL

```sql
-- 20260613000003 / 20260610
select p.id, p.code, p.discount_percentage, p.start_at, p.end_at,
  pt.title, pt.description
```

Thiếu trả về:
- `cover_media_id` / cover image URL — FE cần cho promo cards
- `combo_price`, `original_price` — thêm trong 20260613 nhưng không update RPC này
- `metadata_jsonb` — items list

**Verdict: BROKEN cho promotions page** — RPC `public_promotions` trả thiếu fields.

### 5.3 `submit_quote_request` — READY (nhất)

✅ Validate đầy đủ, honeypot, insert quote + event + notifications atomically. Tốt nhất trong codebase.

Một vấn đề nhỏ:
- `ip_hash` chỉ trust `service_role` → API route `/api/contact` dùng `service_role` client → OK
- Không validate `v_phone` min length sau compact_text → có thể lọt qua nếu phone là "       " (spaces)

### 5.4 `admin_quote_search` — PARTIAL

Trả về `assigned_to` (uuid) nhưng không JOIN về `profiles` để trả `assigned_to_name`. Admin UI phải fetch thêm round-trip.

### 5.5 `update_quote_status` — BROKEN

```sql
v_allowed_statuses text[] := ARRAY['new', 'processing', 'contacted', 'qualified', 'closed', 'cancelled', 'spam'];
```

`quote_status` enum thực tế: `('new', 'contacted', 'qualified', 'closed', 'spam')`.  
RPC cho phép `'processing'` và `'cancelled'` — **2 values không tồn tại trong enum**.  
Khi UPDATE `quote_requests.status = 'processing'` → PostgreSQL sẽ throw type cast error vì column type là `quote_status` enum.

**Verdict: BROKEN** — RPC sẽ fail runtime khi admin cố set status `processing` hoặc `cancelled`.

### 5.6 `get_quote_status_logs` — PARTIAL

```sql
COALESCE(p.full_name, p.email::text, 'Hệ thống') AS changed_by_name
```

`profiles` không có `email` column exposed qua RLS — `profiles.email` là readable nhưng `p.email::text` cast không cần thiết. Minor issue.

### 5.7 `get_active_promotions_for_product` — PARTIAL

Defined twice:
1. `20260613000001`: chỉ join `promotion_targets`
2. `20260614000001`: override — join cả `promotion_targets` và `product_promotions`

Version 2 là đúng. Không có DROP trước CREATE → PostgreSQL `CREATE OR REPLACE` function nên OK.

### 5.8 `require_publish_translations` trigger function — PARTIAL

Trigger attach trên: `content_pages`, `product_categories`, `products`, `blog_categories`, `blog_posts`, `showrooms`.

**Missing:**
- `brands` — không có trigger, có thể publish brand không có translation
- `promotions` — không có trigger, có thể publish promotion không có translation

### 5.9 Summary RPC verdicts

| Function | Verdict | Issue |
|---|---|---|
| `submit_quote_request` | READY | Minor phone validation |
| `public_products` (0008 typed) | BROKEN | Ghost refs, overloaded |
| `public_products` (20260618 text) | PARTIAL | Cleanest version but overload conflict |
| `public_blog_posts` | READY | ✅ |
| `public_showrooms` | READY | ✅ |
| `public_promotions` | BROKEN | Thiếu cover_media, combo_price |
| `admin_quote_search` | PARTIAL | Missing joined assigned_to name |
| `update_quote_status` | BROKEN | Invalid enum values in allowed list |
| `get_active_promotions_for_product` | PARTIAL | Correct version, nhưng 2 definitions |
| `get_quote_status_logs` | PARTIAL | Reads from `quote_status_logs` not canonical `quote_request_events` |

---

## 6. Missing Schema / Columns / Constraints

### 6.1 Missing tables

| Table | Cần thiết cho | Priority |
|---|---|---|
| ~~`product_attributes`~~ | RPC đang reference — nhưng đây là ghost, cần xóa refs | 🔴 Critical |
| `brands_slug` index | Filter performance | 🟠 High |

### 6.2 Missing columns

| Table | Missing column | Impact |
|---|---|---|
| `products` | `specs` (jsonb) | 🔴 RPC broken nếu 20260614/20260617 still active |
| `media_assets` | `original_filename` text | 🟠 API lưu field này nhưng DB drop silently |
| `promotions` | `updated_at` trigger | 🟡 Medium — `updated_at` không auto-update |
| `brands` | `slug` NOT NULL constraint | 🟠 High — slug nullable gây filter bug |
| `integration_secrets` | `site_settings_id` FK | 🟡 Medium — không linked to settings |
| `quote_status_logs` | FK → profiles for `changed_by` ON DELETE SET NULL | 🟡 Missing, orphan risk |

### 6.3 Missing check constraints

| Table | Missing constraint | Business rule |
|---|---|---|
| `promotions` | `check (start_at is null or end_at is null or start_at < end_at)` | Start phải trước end |
| `promotions` | `check (combo_price is null or original_price is null or combo_price < original_price)` | Combo rẻ hơn giá gốc |
| `brands` | `check (status <> 'published' or slug is not null)` | Brand publish cần có slug |
| `product_categories` | Circular reference check | Không thể là parent của chính mình |
| `quote_status_logs` | Status value check | `from_status`, `to_status` nên enum-constrained |

### 6.4 Missing unique constraints

| Table | Missing unique | Impact |
|---|---|---|
| `promotion_targets` | `unique (promotion_id, target_type, target_id)` | Duplicate promotion targets |
| `quote_status_history` | Duplicate status history rows | Data integrity |

---

## 7. Index / Performance Audit

### 7.1 Indexes hiện có — tốt

| Category | Verdict |
|---|---|
| Products: category+status, featured+status, public_sort partial index | ✅ Tốt |
| Product translations: product+locale, locale+slug, gin search_text | ✅ Tốt |
| Blog posts: category+status+published, featured, public partial index | ✅ Tốt |
| Showrooms: status+sort, public partial index | ✅ Tốt |
| Quote requests: status+created, keyword GIN trigram | ✅ Tốt |
| Profiles: role, is_active, email trigram | ✅ Tốt |

### 7.2 Missing indexes

| Table | Missing index | Impact |
|---|---|---|
| `brands` | `idx_brands_slug` — hiện có `uq_brands_slug` UNIQUE nhưng case-insensitive slug? | Filter `WHERE b.slug = $1` dùng được UNIQUE index |
| `product_promotions` | `idx_product_promotions_promotion_id` | Lookup tất cả sản phẩm của 1 promotion |
| `promotions` | `idx_promotions_active` partial: `WHERE status='published' AND deleted_at IS NULL AND (end_at IS NULL OR end_at >= NOW())` | Active promotions lookup |
| `quote_status_logs` | `idx_quote_status_logs_created_at DESC` | ✅ Đã có |
| `promotion_targets` | `idx_promotion_targets_target_type_id` | ✅ Đã có |
| `site_setting_translations` | Compound `(site_settings_id, locale)` | Settings translation lookup |

### 7.3 Over-indexing risks

- `idx_product_attribute_values_value_number` — ít dùng, có thể remove
- `idx_products_brand_series_trgm` — `brand_series` text là legacy field, ít query. GIN index tốn space

### 7.4 N+1 query risks trong RPCs

Tất cả public_products, public_blog_posts, public_showrooms dùng **correlated subqueries** cho media:

```sql
(SELECT jsonb_build_object(...) FROM product_media pm ... WHERE pm.product_id = base.id LIMIT 1) AS primary_media
```

Với list 24–100 products, đây là N correlated subqueries = potential N+1. PostgreSQL optimizer thường xử lý tốt với proper indexes, nhưng nên chuyển sang lateral join hoặc window function nếu performance issues.

---

## 8. Top Critical DB Issues

### 🔴 CRITICAL — Must fix trước production

**#1 — `update_quote_status` RPC: invalid enum values**
- Evidence: `v_allowed_statuses` chứa `'processing'`, `'cancelled'` không tồn tại trong `quote_status` enum
- Risk: Admin cố set 2 status này → runtime error. Nếu FE dropdowns show các values này → admin workflow broken
- Fix: `ARRAY['new', 'contacted', 'qualified', 'closed', 'spam']`

**#2 — Ghost table `product_attributes` trong 2 active RPCs**
- Evidence: `20260614000002_products_rpc_brand_discount.sql:97,159` và `20260617000001:97,159`
- Risk: Nếu DB đang chạy version này (chưa upgrade lên 20260618) → attribute filter hoàn toàn broken
- Fix: Đảm bảo `20260618` được apply và drop old signatures

**#3 — Ghost column `p.specs` trong 2 active RPCs**
- Same migrations as #2
- Risk: `p.specs` không tồn tại → SQL error

**#4 — `public_products` overload conflict (PGRST203 risk)**
- Evidence: `0008` định nghĩa typed params (locale_code, product_group_key). `20260618` định nghĩa text params. Không có DROP đầy đủ.
- Risk: PostgREST không biết gọi overload nào → return PGRST203 → toàn bộ product listing broken
- Fix: Drop tất cả signatures cũ, chỉ giữ 20260618 version

**#5 — `quote_requests.assigned_to` type drift**
- Evidence: Có thể là `uuid` (từ 20260613) hoặc `text` (từ 20260614000003) tùy thứ tự migration
- Risk: FK constraint `fk_quote_requests_assigned_to` → `profiles(id)` sẽ fail nếu column là `text`
- Fix: Verify actual column type trong production DB, chuẩn hóa thành `uuid`

### 🟠 HIGH

**#6 — Ba bảng audit trail trùng mục đích** (`quote_request_events`, `quote_status_history`, `quote_status_logs`)
- Fix: Deprecate `quote_status_history` và `quote_status_logs`, canonical = `quote_request_events`

**#7 — `public_promotions` RPC thiếu `cover_media`, `combo_price`, `original_price`**
- Promotions page FE không có data đủ để render promo cards đúng

**#8 — `brands.slug` nullable — filter broken cho brands không có slug**

**#9 — Không có `updated_at` trigger cho `promotions`, `brands`, `brand_translations`, `promotion_translations`**

**#10 — Seed data trong migrations** (`20260610`, `20260618000002`)
- 66KB seed file trong migrations folder — production anti-pattern

---

## 9. Priority Remediation Roadmap

### 🔴 CRITICAL (1–2 ngày — trước production)

| # | Fix | Migration |
|---|---|---|
| 1 | Fix `update_quote_status` enum values — remove 'processing', 'cancelled' | New patch migration |
| 2 | Verify + DROP `public_products` overloaded signatures từ 0008 và 20260614/20260617 | Hotfix migration |
| 3 | Verify `quote_requests.assigned_to` actual column type trên prod DB — nếu `text`, ALTER to uuid | Hotfix migration |
| 4 | Ensure `20260618000001` đã được apply (clean attrs + specs + promo_price) | Deploy check |

### 🟠 HIGH (3–5 ngày)

| # | Fix | Migration |
|---|---|---|
| 5 | Update `public_promotions` RPC — add cover_media, combo_price, original_price to return | New migration |
| 6 | Add NOT NULL constraint cho `brands.slug` + backfill existing | Migration |
| 7 | Add updated_at triggers cho: promotions, brands, brand_translations, promotion_translations | Migration |
| 8 | Add promotion constraints: start_at < end_at, combo_price < original_price | Migration |
| 9 | Add unique constraint cho `promotion_targets (promotion_id, target_type, target_id)` | Migration |
| 10 | Deprecate `quote_status_history` + `quote_status_logs` → migrate data về `quote_request_events` | Migration |
| 11 | Add `require_publish_translations` trigger cho `brands` và `promotions` | Migration |

### 🟡 MEDIUM (1–2 tuần)

| # | Fix | Note |
|---|---|---|
| 12 | Add `original_filename` column to `media_assets` | |
| 13 | Add `integration_secrets.site_settings_id` FK | |
| 14 | Move `admin_quote_search` to return joined `assigned_to_name` | |
| 15 | Add partial index `idx_promotions_active` | |
| 16 | Add compound index on `site_setting_translations(site_settings_id, locale)` | |
| 17 | Cân nhắc LATERAL join thay correlated subquery cho media trong RPCs | Performance |
| 18 | Circular reference guard cho `product_categories.parent_id` | |
| 19 | Separate seed files khỏi migration files | |

### 🟢 LOW (Future sprint)

| # | Fix |
|---|---|
| 20 | Thêm `avatar_url` cho profiles |
| 21 | Down-migration files cho khả năng rollback |
| 22 | Phân tích remove over-indexed `idx_products_brand_series_trgm` nếu không dùng |
| 23 | Constraint `quote_status_logs.from_status/to_status` phải match enum values |

---

## 10. Final Verdict

### Bảng tổng hợp theo table

| Table | Verdict | Lý do chính |
|---|---|---|
| `profiles` | PARTIAL | Thiếu avatar_url, minimal fields |
| `products` | PARTIAL | `p.specs` ghost (trong old RPCs), promo_price_min/max tồn tại |
| `product_categories` | PARTIAL | Thiếu circular ref guard, depth limit |
| `product_translations` | READY | ✅ |
| `product_media` | READY | ✅ |
| `brands` | PARTIAL | slug nullable, không có publish translation guard |
| `brand_translations` | PARTIAL | Thiếu updated_at trigger |
| `promotions` | PARTIAL | Thiếu date/price constraints, triggers, publish guard |
| `product_promotions` | READY | ✅ |
| `promotion_targets` | PARTIAL | Thiếu unique constraint, no FK on target_id |
| `showrooms` | PARTIAL | No direct cover_media_id (acceptable design) |
| `blog_posts` | READY | ✅ Best-designed content table |
| `media_assets` | PARTIAL | Thiếu original_filename column |
| `site_settings` | PARTIAL | Không lưu API keys, homepage fields mapping sai |
| `integration_secrets` | PARTIAL | Thiếu FK về site_settings |
| `content_pages` | PARTIAL | Schema đúng nhưng FE mapping sai |
| `quote_requests` | DRIFTED | assigned_to type drift (uuid vs text) |
| `quote_request_events` | READY | ✅ Append-only, best audit trail |
| `quote_status_logs` | DRIFTED | Trùng với quote_request_events, dùng text thay enum |
| `quote_status_history` | DRIFTED | Trùng với quote_request_events |

### Bảng tổng hợp theo RPC/function

| Function | Verdict | |
|---|---|---|
| `submit_quote_request` | READY | ✅ |
| `public_products` (0008 typed) | BROKEN | Overload, ghost refs |
| `public_products` (20260618 text) | PARTIAL | Cleanest but overload risk |
| `public_blog_posts` | READY | ✅ |
| `public_showrooms` | READY | ✅ |
| `public_promotions` | BROKEN | Thiếu fields |
| `admin_quote_search` | PARTIAL | Missing joined name |
| `update_quote_status` | BROKEN | Invalid enum values |
| `get_active_promotions_for_product` | PARTIAL | 2 definitions, correct latest |
| `get_quote_status_logs` | PARTIAL | Wrong source table |

### Câu trả lời cho 5 câu hỏi production-readiness

**1. Schema có đủ support business admin/client không?**  
PARTIAL — Core tables đầy đủ. Nhưng brands/promotions thiếu constraints, audit trail bị split 3 bảng, settings mapping sai.

**2. Có chỗ nào FE/BE đòi field nhưng DB chưa support không?**  
YES:
- `media_assets.original_filename` — API lưu, DB không có column
- `products.specs` — RPC reference, DB không có column (fixed in 20260618 only)
- Homepage settings fields — FE tưởng lưu vào site_settings nhưng phải vào content_pages

**3. Migration có drift không?**  
YES — DRIFTED: `assigned_to` type, 3 audit trail tables, 7+ patch migrations thay vì thiết kế đúng từ đầu.

**4. RPC có broken không?**  
YES — BROKEN: `update_quote_status` invalid enum, `public_promotions` thiếu fields, ghost table refs trong overloaded versions.

**5. Production safe chưa?**  
KHÔNG — phải fix Critical #1–4 trước khi deploy production.

---

*Báo cáo được tạo 2026-06-19 · Evidence trực tiếp từ 22 migration files*  
*Xem thêm: [admin_audit_report.md](file:///C:/Users/DELL/.gemini/antigravity/brain/7e03c2c5-5cd9-4683-8255-77f09e27b9ca/admin_audit_report.md) | [validation_audit_report.md](file:///C:/Users/DELL/.gemini/antigravity/brain/7e03c2c5-5cd9-4683-8255-77f09e27b9ca/validation_audit_report.md)*
