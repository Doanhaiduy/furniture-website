# API CONTRACT AUDIT REPORT
**Auditor role**: Principal API Architect + Senior Contract Auditor + Full-stack Integration Reviewer  
**Audit date**: 2026-06-19  
**Scope**: Toàn bộ Next.js API routes, server actions, RPC calls, FE↔BE↔DB data contracts  
**Tone**: Thẳng, skeptical, có evidence từ source code.

---

## MỤC LỤC
1. [Endpoint Inventory](#1-endpoint-inventory)
2. [Request Validation Audit](#2-request-validation-audit)
3. [Response Shape Audit](#3-response-shape-audit)
4. [FE ↔ BE Mapping Audit](#4-fe--be-mapping-audit)
5. [DB Persistence Audit](#5-db-persistence-audit)
6. [Error Handling Audit](#6-error-handling-audit)
7. [Auth / Permission per Endpoint](#7-auth--permission-per-endpoint)
8. [Upload / Media APIs](#8-upload--media-apis)
9. [Public vs Admin Data Contracts](#9-public-vs-admin-data-contracts)
10. [Top 10 Contract Bugs](#10-top-10-contract-bugs)
11. [Remediation Roadmap](#11-remediation-roadmap)
12. [Final Verdict](#12-final-verdict)

---

## 1. Endpoint Inventory

### 1.1 REST API Routes (Next.js `app/api/`)

| Method | Endpoint | Auth | Purpose | Verdict |
|---|---|---|---|---|
| `GET` | `/api/health` | None | Health check | ✅ READY |
| `POST` | `/api/contact` | None (public) | Submit quote request | ⚠️ PARTIAL |
| `GET` | `/api/quote-options` | None (public) | Fetch products+categories for quote form | ⚠️ PARTIAL |
| `GET` | `/api/admin/settings` | Admin only | Read site settings + secrets + home content | ⚠️ PARTIAL |
| `PUT` | `/api/admin/settings` | Admin only | Save settings + secrets + home content | ⚠️ PARTIAL |
| `GET` | `/api/admin/users` | Admin only | List CMS users | ✅ READY |
| `POST` | `/api/admin/users` | Admin only | Create CMS user | ✅ READY |
| `PUT` | `/api/admin/users` | Admin only | Update user role/active | ⚠️ PARTIAL |
| `DELETE` | `/api/admin/users` | ❌ KHÔNG TỒN TẠI | Delete/deactivate user | ❌ MISSING |
| `POST` | `/api/admin/cloudinary-sign` | Editor+ | Get Cloudinary upload signature | ✅ READY |
| `POST` | `/api/admin/media/upload` | Editor+ | Register Cloudinary upload to DB | ⚠️ PARTIAL |
| `GET` | `/api/admin/media/list` | Editor+ | List media assets | ⚠️ PARTIAL |
| `DELETE` | `/api/admin/media/:id` | ❌ KHÔNG TỒN TẠI | Soft-delete media asset | ❌ MISSING |
| `GET` | `/api/admin/search` | Editor+ | Global admin search | ✅ READY |
| `POST` | `/api/admin/ai/generate-draft` | Editor+ | AI content generation via Gemini | ✅ READY |

### 1.2 Supabase RPC Calls (via `supabase.rpc()`)

| RPC | Caller | Auth | Purpose | Verdict |
|---|---|---|---|---|
| `public_products` | `lib/supabase/queries.ts:45` | Anon | Public product list+filter | ⚠️ PARTIAL |
| `public_blog_posts` | `lib/supabase/queries.ts:158` | Anon | Public blog list+filter | ✅ READY |
| `public_showrooms` | `lib/supabase/queries.ts:227` | Anon | Public showrooms list | ✅ READY |
| `public_promotions` | `lib/supabase/queries.ts:663` | Anon | Public promotions list | ❌ BROKEN |
| `admin_quote_search` | `lib/supabase/admin-queries.ts:259` | Admin | Admin quote search | ⚠️ PARTIAL |
| `update_quote_status` | `lib/supabase/admin-queries.ts:1310` | Admin | Change quote status | ❌ BROKEN |
| `get_quote_status_logs` | `lib/supabase/admin-queries.ts:1347` | Admin | Quote status history | ⚠️ PARTIAL |
| `submit_quote_request` | ❌ KHÔNG DÙNG từ FE | — | Duplicate of `/api/contact` | ⚠️ PARTIAL |

### 1.3 Direct Supabase Table Queries (Server Actions in admin-queries.ts)

| Entity | Operations | Auth Guard | Verdict |
|---|---|---|---|
| `products` (CRUD) | GET list, GET detail, CREATE, UPDATE, DELETE | `requireEditorOrAdmin()` | ⚠️ PARTIAL |
| `product_categories` (CRUD) | GET list, GET detail, CREATE, UPDATE, DELETE | `requireEditorOrAdmin()` | ⚠️ PARTIAL |
| `brands` (CRUD) | GET list, CREATE, UPDATE, DELETE | `requireEditorOrAdmin()` | ⚠️ PARTIAL |
| `promotions` (CRUD) | GET list, CREATE, UPDATE, DELETE | `requireEditorOrAdmin()` | ⚠️ PARTIAL |
| `blog_posts` (CRUD) | GET list, GET detail, CREATE, UPDATE, DELETE | `requireEditorOrAdmin()` | ⚠️ PARTIAL |
| `showrooms` (CRUD) | GET list, CREATE, UPDATE, DELETE | `requireEditorOrAdmin()` | ⚠️ PARTIAL |
| `quote_requests` | GET list (RPC), UPDATE status (RPC) | Admin role | ⚠️ PARTIAL |
| `profiles` | GET list, CREATE, UPDATE | Admin role | ✅ READY |
| `site_settings` | GET+PUT via `/api/admin/settings` | Admin role | ⚠️ PARTIAL |
| `media_assets` | Upload, List | `requireEditorOrAdmin()` | ⚠️ PARTIAL |

### 1.4 Missing REST Endpoints (UI cần nhưng không có)

| Endpoint cần có | Mục đích | Priority |
|---|---|---|
| `DELETE /api/admin/users/:id` | Soft-delete / deactivate user | 🔴 Critical |
| `DELETE /api/admin/media/:id` | Soft-delete media asset | 🟠 High |
| `GET /api/admin/quotes/:id` | Quote detail view | 🟠 High |
| `PUT /api/admin/quotes/:id/assign` | Assign quote to staff | 🟠 High |
| `GET /api/admin/brands` | Brand list for admin | 🟡 Medium |
| `GET /api/admin/promotions` | Promotion list for admin | 🟡 Medium |
| `POST /api/admin/media/delete-cloudinary` | Delete from Cloudinary + DB atomically | 🟠 High |
| `GET /api/admin/audit-logs` | Audit log viewer | 🟡 Medium |
| `POST /api/admin/quotes/:id/notes` | Update admin notes on quote | 🟠 High |

---

## 2. Request Validation Audit

### 2.1 `POST /api/contact` — Validation: **GOOD với 1 gap**

```typescript
const parsed = quoteRequestSchema.safeParse(body);  // ✅ Zod validation
```

✅ Dùng `quoteRequestSchema` — Zod safeParse đúng pattern.  
✅ Rate limiting implemented.  
✅ Honeypot check.

**Gap**: `locale` field được dùng từ `data.locale` nhưng Zod schema có thể map sang `preferred_locale`. Nếu field name không khớp → `preferred_locale` sẽ là default `'vi'` không phải locale thực tế của user.

### 2.2 `PUT /api/admin/settings` — Validation: **BROKEN**

```typescript
const body = await request.json();
// ... dùng body.brandNameVi, body.logoUrl, v.v. trực tiếp
// KHÔNG CÓ Zod validation, KHÔNG CÓ input sanitization
```

❌ Zero schema validation — bất kỳ field nào cũng được accept.  
❌ `body.quoteSenderEmail` fallback về `"quotes@example.test"` — hardcoded demo email trong production code.  
❌ `body.contactPhone` không được validate format.  
❌ API keys như `resendKey`, `geminiKey` được nhận raw — chỉ skip nếu starts with `"****"`.

### 2.3 `POST /api/admin/users` — Validation: **WEAK**

```typescript
if (!email || !password || !fullName || !role) {
  return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
}
```

❌ Chỉ truthy check, không validate:
- Email format
- Password strength (min length, complexity)
- Role phải là `admin` hoặc `editor`
- fullName min/max length

### 2.4 `PUT /api/admin/users` — Validation: **WEAK**

```typescript
const { id, role, isActive } = body;
if (!id || !role) { ... }
```

❌ `role` không validate phải là enum value — có thể set bất kỳ string nào làm role.  
❌ Không check user không thể tự deactivate chính mình.  
❌ Không check admin không thể downgrade role của admin cuối cùng.

### 2.5 `POST /api/admin/media/upload` — Validation: **GOOD**

✅ Validate format whitelist (jpg/png/webp/mp4/...)  
✅ Validate max size 50MB  
✅ Validate URL phải từ `res.cloudinary.com`  
✅ Auth check `requireEditorOrAdmin()`

**Gap nhỏ**: `bytes` validation dùng `&&` — nếu `bytes = 0` thì skip validation → có thể insert asset với size 0.

### 2.6 `POST /api/admin/ai/generate-draft` — Validation: **ACCEPTABLE**

✅ Check `inputText` not empty  
✅ Validate `task` type  

**Gap**: `targetType` không validate enum. Bất kỳ string nào vào `ai_drafts.target_type` — nhưng DB có enum check sẽ reject.

---

## 3. Response Shape Audit

### 3.1 `GET /api/admin/settings` — Response: **MONOLITHIC ANTI-PATTERN**

Response shape trộn lẫn 4 concerns vào 1 flat object:
```json
{
  "brandNameVi": "...",        // site_settings_translations
  "logoUrl": "...",            // site_settings + media_assets
  "resendKey": "***",          // integration_secrets (MASKED)
  "heroHeadlineVi": "...",     // content_page_translations.body_json (nested keys!)
  "slaHours": "24"             // HARDCODED — không từ DB
}
```

❌ `slaHours: "24"` — hardcoded string trong response, không lưu DB.  
❌ `openaiKey` = `secretsMap.get("gemini_api_key")` — alias sai: `openaiKey` lấy giá trị Gemini key, gây nhầm lẫn.  
❌ `defaultLocale: "vi"` — hardcoded, không từ DB.  
❌ Homepage section fields đọc từ `content_page_translations.body_json` dưới dạng flat keys → schema coupling giữa API response và DB jsonb structure rất fragile.

### 3.2 `public_products` RPC response — **SCHEMA MISMATCH với FE**

FE call trong `queries.ts:45` truyền **không có** `p_brand_slug`, `p_has_discount` params:
```typescript
await supabase.rpc("public_products", {
  p_locale: locale,
  p_category_slug: params.categorySlug || null,
  p_group_key: params.groupKey || null,
  // ... 8 params
  // MISSING: p_brand_slug, p_has_discount
});
```

Nhưng DB có 2 overloaded versions:
- **0008**: 10 params (typed `locale_code`, `product_group_key`)
- **20260618**: 12 params (text) + returns `promo_price_min`, `promo_price_max`

FE call 8 params → PostgREST sẽ match **0008 signature** (10 params, all with defaults) → returns response **thiếu** `brand_id`, `brand_name`, `promo_price_min`, `promo_price_max`.

Sau đó FE xử lý `brandId` filter **client-side**:
```typescript
if (params.brandId && params.brandId !== "all") {
  results = results.filter((p: any) => p.brand_id === params.brandId || p.brandId === params.brandId);
}
```
→ Client-side filter trên dữ liệu không có `brand_id` field = luôn empty kết quả khi filter brand.

### 3.3 `admin_quote_search` RPC response — **PARTIAL**

Returns `assigned_to` (uuid) nhưng FE cần tên staff. FE phải join thêm bằng cách nào đó — không có field `assigned_to_name`.

### 3.4 `GET /api/admin/media/list` response — **PARTIAL**

```typescript
.select("id, public_url, format, size_bytes, width, height, original_filename, created_at")
```

Includes `original_filename` — nhưng cột này **không tồn tại trong DB** (audit DB đã xác nhận). Query sẽ trả `null` cho mọi row → silently fail.

### 3.5 Admin CRUD operations response shapes — **INCONSISTENT**

- `getAdminProducts`: trả `AdminProduct` type với `group_key: null` (hardcoded null), `width: null`, `depth: null`, `height: null` — dù DB có data.
- `getAdminProducts` select không bao gồm `brand_id`, `brand_name` → admin product list không biết brand của product.
- Admin product type `AdminProduct` không có `brand_id` field.

---

## 4. FE ↔ BE Mapping Audit

### 4.1 Brand filter — **BROKEN end-to-end**

```
FE (products page) → brandId filter param
→ queries.ts:getProducts() → RPC call (no p_brand_slug param)
→ DB returns data WITHOUT brand_id (0008 RPC signature)
→ FE client-side filter: p.brand_id === params.brandId → always false
→ Brand filter ALWAYS returns empty
```

**Root cause**: 3-layer mismatch: FE passes `brandId` (uuid), RPC expects `p_brand_slug` (text), FE filter compares `brand_id` with uuid.

### 4.2 `p_has_discount` filter — **NEVER SENT**

FE `getProducts()` signature nhận không có `hasDiscount` param. `p_has_discount` không bao giờ được gửi → filter "có khuyến mãi" trên client không hoạt động server-side.

### 4.3 Settings form FE → `/api/admin/settings` PUT — **FRAGILE**

Admin settings form gửi 50+ flat fields. Route nhận và upsert vào 3 tables + jsonb. Bất kỳ field nào bị rename ở FE mà không update route → silently lưu `undefined` vào DB.

Không có TypeScript contract chia sẻ giữa form state và API body — chỉ là `any`.

### 4.4 Quote form FE → `/api/contact` — **MOSTLY GOOD**

```typescript
// quote-form.tsx:91
fetch(`/api/quote-options?locale=${locale}`)  // ✅
```

`/api/contact` dùng Zod schema → ✅ typed.

**Gap**: `/api/contact` route insert trực tiếp vào `quote_requests` thay vì gọi `submit_quote_request` RPC. Hai con đường song song tồn tại:
1. `/api/contact` → Direct DB insert (không có honeypot check ở DB level)
2. `submit_quote_request` RPC → Không được gọi từ đâu trong FE

Duplicate logic, khác nhau:
- `/api/contact` không insert `quote_request_events` sau khi tạo quote
- RPC `submit_quote_request` có insert events → audit trail đúng hơn
- `/api/contact` có rate limit → RPC không có

### 4.5 Admin product CRUD — `getAdminProducts` **MISSES** media, brand, dimensions

```typescript
// admin-queries.ts:333
let query = supabase.from("products").select(`
  id, reference_code, status, price_min, price_max, currency, featured, published_at,
  product_translations (slug, name, summary, description_json, material, price_display_text, dimension_display_text),
  product_categories (id, slug, name, product_category_translations(name))
`)
```

**Missing từ query**:
- `brand_id`, `brand_name` → admin list không biết brand
- `width`, `depth`, `height`, `dimension_unit` → hardcoded null
- `product_media` → `primary_media: null` hardcoded
- `group_key` → `group_key: null` hardcoded

Admin product list bị incomplete — UI hiển thị thiếu thông tin brand và media thumbnail.

### 4.6 Admin promotions CRUD — **COMBO PRICE không được lưu**

`AdminPromotion` type trong `admin-queries.ts`:
```typescript
export type AdminPromotion = {
  id, code, discount_percentage, status, start_at, end_at,
  title_vi, title_en, description_vi, description_en,
  created_at, updated_at
  // MISSING: cover_media_id, combo_price, original_price, metadata_jsonb
}
```

Khi admin tạo promotion với combo price → field không có trong type → không được gửi/lưu đúng cách.

### 4.7 `/api/quote-options` — **Over-engineered cho mục đích đơn giản**

```typescript
// Fetches up to 200 published products
const rawProducts = await getProducts(supabase, { locale, limit: 200 })
```

Gọi `getProducts()` (có mock fallback logic) chỉ để lấy slug+name cho dropdown. Không cần RPC full — một query đơn giản hơn trực tiếp từ `product_translations` là đủ. 200 products là số lớn cho dropdown UI.

---

## 5. DB Persistence Audit

### 5.1 `/api/admin/settings` PUT — **Mock media asset injection**

```typescript
// Nếu URL không có trong media_assets → insert media_assets với size_bytes: 0
const { data: newAsset } = await supabase.from("media_assets").insert({
  public_url: url,
  storage_provider: "cloudinary",
  resource_type: "image",
  mime_type: "image/png",
  format: "png",
  size_bytes: 0,   // ❌ 0 bytes, không phải real asset
})
```

❌ Tạo fake `media_assets` rows vi phạm `chk_media_assets_positive_size` constraint (`size_bytes > 0`) → sẽ FAIL ở production.  
❌ Không set `cloudinary_public_id` → vi phạm `chk_media_assets_provider_identity` constraint.  
❌ Cùng pattern xuất hiện ở `admin-queries.ts:40` (`getOrCreateMediaAssetId`).

### 5.2 `/api/contact` — **Missing `quote_request_events` insert**

Route insert `quote_requests` thành công nhưng KHÔNG insert vào `quote_request_events`. Audit trail bị mất với mọi quote được submit từ FE public form.

So sánh với RPC `submit_quote_request` (không được dùng):
```sql
-- RPC: insert quote_request_events AFTER inserting quote
INSERT INTO public.quote_request_events (quote_request_id, actor_id, old_status, new_status, note)
VALUES (v_quote_id, null, null, 'new', 'Created by public quote submission RPC');
```

### 5.3 `updateAdminPromotion` — **Hardcode `start_at: null`, `end_at: null`**

Từ audit validation trước (validation_audit_report.md), `createAdminPromotion` hardcode:
```typescript
start_at: null,  // ❌ date picker không được lưu
end_at: null,    // ❌ date range không được lưu
```

Mọi promotion được tạo sẽ không có ngày hết hạn → hiển thị không đúng trên FE client.

### 5.4 `getAdminProducts` — **Không persist đúng brand khi update**

Admin update product form → nếu brand thay đổi → `updateAdminProduct` cần update `products.brand_id`. Nhưng `AdminProduct` type không có `brand_id` → form không có field → brand không được save.

### 5.5 Notification update sau quote — **Logic broken**

```typescript
// /api/contact:160
const notificationIds = notificationRows.map((_r, idx) => {
  const rows = notificationRows;
  return { idx };  // ❌ Unused variable, broken map logic
});
await supabase.from("quote_notifications")
  .update({ status: notificationStatus, last_error: emailError })
  .eq("quote_request_id", quote.id);  // Updates ALL notifications for this quote
```

Không update theo `id`, update theo `quote_request_id` → nếu có nhiều recipient thì đúng. Nhưng `notificationIds` variable là dead code (chỉ tạo `{idx}` objects, không dùng).

---

## 6. Error Handling Audit

### 6.1 Error response format — **INCONSISTENT across routes**

| Route | Error format |
|---|---|
| `/api/contact` | `{ ok: false, code: "...", message: "...", fieldErrors: {} }` |
| `/api/admin/settings` | `{ error: "..." }` |
| `/api/admin/users` | `{ error: "..." }` / `{ success: true }` |
| `/api/admin/media/upload` | `{ error: "...", detail: "..." }` |
| `/api/admin/search` | `{ error: "..." }` |
| `admin-queries.ts` RPCs | Throw exception / return null / return mock |

Không có chuẩn error contract. FE phải handle nhiều format khác nhau → bug prone.

### 6.2 Silent failures — **NGHIÊM TRỌNG**

```typescript
// admin-queries.ts
} catch (e) {
  console.warn("Exception fetching admin quotes list, falling back to mock:", e);
}
// → FE nhận mock data, không biết DB đang bị lỗi
```

Khi DB fail → fallback về mock data → admin thấy data "ổn" nhưng thực ra không phải DB data. Production admin không biết khi nào đang xem mock vs real.

```typescript
// admin-search:54
} catch {
  // Skip on error — silently returns empty for that entity type
}
```

Search failures là silent → user thấy incomplete results.

### 6.3 AI generate draft — **502 exposure**

```typescript
return NextResponse.json({ error: "Gemini API responded with an error" }, { status: 502 });
```

502 Bad Gateway là đúng khi upstream fail, nhưng không include `retryable: true` hint để FE có thể retry automatically.

### 6.4 Audit log failure — **Non-blocking (acceptable)**

```typescript
try {
  await writeAuditLog(...)
} catch (auditErr) {
  console.warn("Audit log failed for user creation, continuing anyway:", auditErr);
}
```

✅ Đúng pattern — audit log failure không block main operation.

---

## 7. Auth / Permission per Endpoint

### 7.1 Permission matrix

| Endpoint | Check Method | Granularity | Issues |
|---|---|---|---|
| `GET /api/admin/settings` | `getCurrentUser()` + role check | Admin only | ✅ |
| `PUT /api/admin/settings` | `getCurrentUser()` + role check | Admin only | ✅ |
| `GET /api/admin/users` | `getCurrentUser()` + role check | Admin only | ✅ |
| `POST /api/admin/users` | `getCurrentUser()` + role check | Admin only | ✅ |
| `PUT /api/admin/users` | `getCurrentUser()` + role check | Admin only | ✅ |
| `POST /api/admin/cloudinary-sign` | `requireEditorOrAdmin()` | Editor+ | ✅ |
| `POST /api/admin/media/upload` | `requireEditorOrAdmin()` | Editor+ | ✅ |
| `GET /api/admin/media/list` | `requireEditorOrAdmin()` | Editor+ | ✅ |
| `GET /api/admin/search` | `requireEditorOrAdmin()` | Editor+ | ✅ |
| `POST /api/admin/ai/generate-draft` | `getCurrentUser()` + role check | Editor+ | ✅ |
| `POST /api/contact` | None | Public | ✅ (rate limited) |
| `GET /api/quote-options` | None | Public | ⚠️ No rate limit |

### 7.2 Permission gaps

**Gap 1**: `GET /api/quote-options` — không auth, không rate limit. Endpoint gọi đến DB để lấy 200 products. Có thể bị abuse để enumerate sản phẩm.

**Gap 2**: Admin server actions trong `admin-queries.ts` dùng `requireEditorOrAdmin()` tốt, nhưng một số mutations không check role cụ thể. Ví dụ editor có thể publish/unpublish nội dung → đúng về mặt business? Cần confirm.

**Gap 3**: `admin_quote_search` RPC — check `can_manage_private_admin_data()` ở DB level → tốt. Nhưng FE gọi qua `createAdminClient()` (service role) → bypass RLS → **RLS check vô nghĩa**.

```typescript
// admin-queries.ts
const supabase = await createAdminClient();  // service_role client
const { data } = await supabase.rpc("admin_quote_search", {...});
// Service role BYPASSES RLS → bất kỳ ai gọi được server action này đều có access
```

**Gap 4**: `update_quote_status` RPC check `auth.uid()` ở DB level. Nhưng `createAdminClient()` dùng service role → `auth.uid()` sẽ là `null` trong service role context → function sẽ return `{success: false, error: "Unauthorized"}` cho mọi lần gọi từ server action!

---

## 8. Upload / Media APIs

### 8.1 Upload flow — **2-step, đúng nhưng có gaps**

```
FE → POST /api/admin/cloudinary-sign → {signature, timestamp, folder, apiKey, cloudName}
FE → Upload trực tiếp lên Cloudinary
FE → POST /api/admin/media/upload {public_id, secure_url, format, bytes, ...}
DB → Insert media_assets row
```

✅ Pattern 2-step signed upload đúng.

**Gap 1**: `cloudinary-sign` chỉ sign `{folder, timestamp}`. Không sign `allowed_formats`, `max_file_size` → Cloudinary preset phải enforce các constraints này. Nếu preset không configured đúng → bypass server-side limits.

**Gap 2**: `POST /api/admin/media/upload` insert `original_filename` vào DB nhưng column không tồn tại → Supabase sẽ error hoặc silently ignore → DB insert thất bại với unknown column.

**Gap 3**: Không có endpoint DELETE media. Admin không thể xóa uploaded assets. Media library chỉ append-only từ UI.

**Gap 4**: `GET /api/admin/media/list` select `original_filename` — column không có → trả `null` cho field này.

**Gap 5**: Không có pagination trên media list — cố định `limit(60)`. Media library sẽ bị thiếu assets khi có >60 items.

### 8.2 Cloudinary deletion — **KHÔNG CÓ**

Không có endpoint nào gọi Cloudinary API để xóa asset. Khi admin "xóa" (nếu có UI), chỉ soft-delete DB row — asset vẫn tồn tại trên Cloudinary → storage cost tích lũy.

---

## 9. Public vs Admin Data Contracts

### 9.1 Public endpoints (no auth)

| Data | Access | Contract |
|---|---|---|
| Products list | Anon via `public_products` RPC | ✅ Filtered: only published, not deleted |
| Blog posts | Anon via `public_blog_posts` RPC | ✅ Filtered: only published |
| Showrooms | Anon via `public_showrooms` RPC | ✅ Filtered: only published |
| Promotions | Anon via `public_promotions` RPC | ❌ Missing fields |
| Categories | Anon via direct `.from("product_categories")` | ✅ |
| Quote submission | Anon via `/api/contact` | ✅ |
| Site settings | Anon via direct `.from("site_settings")` | ⚠️ Exposed all settings including quote_sender_email |
| Integration secrets | Service role only | ✅ Never exposed publicly |

### 9.2 Data leakage risks

**Risk 1**: `GET /api/quote-options` không cần auth, returns product list with `slug`, `name`, `summary`, `category_slug`. Minimal risk, nhưng nên add basic rate limiting.

**Risk 2**: `site_settings` có RLS policy `site_settings_public_read ON public.site_settings FOR SELECT TO anon USING (true)` — toàn bộ settings row exposed cho anon, bao gồm `contact_email`, `quote_sender_email`. Không phải secret nhưng cần aware.

**Risk 3**: `/api/admin/settings` GET response include masked secret hints (`"****abc123"`). OK vì admin-only, nhưng mask hints reveal secret length/pattern.

### 9.3 Admin data never exposed to public

✅ `quote_requests` — RLS blocks public access, RPC `submit_quote_request` returns only `{submitted: true}`.  
✅ `profiles` — RLS blocks anon access.  
✅ `integration_secrets` — Admin/service only.  
✅ `audit_logs` — Service role only.

---

## 10. Top 10 Contract Bugs

### 🔴 BUG #1 — Brand filter completely broken (FE↔RPC mismatch)

**Evidence**: `queries.ts:60` client-side `p.brand_id` filter on data from `0008` RPC signature that returns no `brand_id` field.  
**Impact**: Brand filter on product listing page always returns 0 results.  
**Fix**: Call RPC `20260618` signature with `p_brand_slug` param, OR pass `brandId` as server-side filter.

### 🔴 BUG #2 — `media/upload` fails silently due to missing `original_filename` column

**Evidence**: `media/upload/route.ts:103` inserts `original_filename` → DB has no such column.  
**Impact**: Every media upload will fail DB insert → media not registered in `media_assets` → products/showrooms can't link media.  
**Fix**: Remove `original_filename` from insert, OR add column to DB first.

### 🔴 BUG #3 — `update_quote_status` RPC always returns Unauthorized from server

**Evidence**: `admin-queries.ts:1310` calls RPC via `createAdminClient()` (service_role) → `auth.uid()` = null in service role → RPC check `profiles WHERE id = auth.uid()` returns nothing → returns `{success: false, error: "Unauthorized"}`.  
**Impact**: Admin can never change quote status from UI.  
**Fix**: Either use `createClient()` (session-based) for this call, or rework RPC to accept actor_id as param.

### 🔴 BUG #4 — Settings PUT: fake media_assets violate DB constraints

**Evidence**: `settings/route.ts:19` creates `media_assets` with `size_bytes: 0` → violates `chk_media_assets_positive_size`.  
**Impact**: Settings save will fail when logo/favicon URL is new → 500 error.  
**Fix**: Require logo/favicon to be uploaded via media upload flow first, not URL strings.

### 🔴 BUG #5 — `/api/contact` bypasses audit trail

**Evidence**: Contact route inserts `quote_requests` but never inserts `quote_request_events`.  
**Impact**: No audit trail for public quote submissions. Append-only audit table empty.  
**Fix**: Add `quote_request_events` insert after successful `quote_requests` insert.

### 🟠 BUG #6 — `openaiKey` aliased to `gemini_api_key` in settings

**Evidence**: `settings/route.ts:119` — `openaiKey: secretsMap.get("gemini_api_key")`.  
**Impact**: If admin sets `openaiKey` expecting OpenAI → actually overwrites Gemini key.  
**Fix**: Remove `openaiKey` alias or store as separate `openai_api_key` secret.

### 🟠 BUG #7 — `admin_quote_search` mock fallback masks DB errors

**Evidence**: `admin-queries.ts:273` — catch → fallback to `mockQuotes`.  
**Impact**: Admin thinks they see real quotes when DB is down → misleads staff.  
**Fix**: In production mode, propagate error instead of silently serving mock.

### 🟠 BUG #8 — `public_promotions` RPC missing cover_media, combo_price

**Evidence**: RPC in `20260610_promotions.sql` returns only `id, code, discount_percentage, start_at, end_at, title, description`. Missing `cover_media_id`, `combo_price`, `original_price` added in `20260613`.  
**Impact**: Promotions page cannot display promo cards with images or combo pricing.  
**Fix**: Update `public_promotions` RPC to join `media_assets` and include new columns.

### 🟠 BUG #9 — `getAdminProducts` returns hardcoded nulls for key fields

**Evidence**: `admin-queries.ts:387-401` — `group_key: null`, `width: null`, `depth: null`, `height: null`, `primary_media: null`.  
**Impact**: Admin product list missing brand, media thumbnail, dimensions.  
**Fix**: Expand SELECT query to include these fields.

### 🟡 BUG #10 — `settings/route.ts:121` hardcodes `"slaHours": "24"`

**Evidence**: Response includes `slaHours: "24"` not from DB.  
**Impact**: Admin cannot configure SLA hours. Settings form shows "24" always.  
**Fix**: Add `sla_hours` to `site_settings` table and persist properly.

---

## 11. Remediation Roadmap

### 🔴 CRITICAL (Fix trước go-live — 2–3 ngày)

| # | Fix | Effort |
|---|---|---|
| 1 | **Fix `media/upload/route.ts`**: Remove `original_filename` from DB insert (or add column to DB) | 30 min |
| 2 | **Fix `update_quote_status` caller**: Use session client instead of admin client, hoặc redesign RPC | 2h |
| 3 | **Fix `/api/contact`**: Add `quote_request_events` insert after quote creation | 30 min |
| 4 | **Fix brand filter**: Pass `p_brand_slug` to RPC, fix FE filter param name | 2h |
| 5 | **Fix settings PUT media**: Validate logo/favicon must be existing `media_assets.id`, not URL | 3h |

### 🟠 HIGH (Sprint 1 — 1 tuần)

| # | Fix | Effort |
|---|---|---|
| 6 | **Add validation to `/api/admin/settings` PUT**: Zod schema for 50+ fields | 4h |
| 7 | **Add validation to user endpoints**: Email format, password strength, role enum | 2h |
| 8 | **Add `DELETE /api/admin/users/:id`**: Soft-delete / deactivate with audit log | 3h |
| 9 | **Add `DELETE /api/admin/media/:id`**: Soft-delete DB + optional Cloudinary delete | 3h |
| 10 | **Fix `public_promotions` RPC**: Add cover_media, combo_price, original_price | 2h |
| 11 | **Remove mock fallback in production**: Guard `NEXT_PUBLIC_USE_MOCK_DATA` with env check | 2h |
| 12 | **Remove `openaiKey` alias**: Separate OpenAI and Gemini key storage | 1h |
| 13 | **Fix `getAdminProducts` query**: Include brand_id, dimensions, media in SELECT | 3h |

### 🟡 MEDIUM (Sprint 2 — 1–2 tuần)

| # | Fix |
|---|---|
| 14 | Standardize error response format across all routes: `{ok, code, message, data}` |
| 15 | Add TypeScript shared types between FE form state and API body (remove `any`) |
| 16 | Add `GET /api/admin/quotes/:id` detail endpoint |
| 17 | Add `PUT /api/admin/quotes/:id/assign` endpoint |
| 18 | Add pagination to `GET /api/admin/media/list` |
| 19 | Add rate limiting to `GET /api/quote-options` |
| 20 | Fix `AdminPromotion` type to include `combo_price`, `original_price`, `cover_media_id` |
| 21 | Add Cloudinary deletion when media soft-deleted |
| 22 | Fix hardcoded `slaHours`, `defaultLocale` in settings response |

### 🟢 LOW (Future)

| # | Fix |
|---|---|
| 23 | Unify quote submission: use `submit_quote_request` RPC instead of direct insert |
| 24 | Add `retryable` hint on 502 AI responses |
| 25 | Add `GET /api/admin/audit-logs` for audit log viewer |
| 26 | Review editor vs admin permissions for publish operations |

---

## 12. Final Verdict

### Verdict per endpoint

| Endpoint / Layer | Verdict | Key Issue |
|---|---|---|
| `POST /api/contact` | PARTIAL | Missing audit event insert |
| `GET /api/quote-options` | PARTIAL | Over-fetching, no rate limit |
| `GET /api/admin/settings` | PARTIAL | Monolithic flat response, hardcoded fields |
| `PUT /api/admin/settings` | PARTIAL | Zero validation, fake media asset injection |
| `GET /api/admin/users` | READY | ✅ |
| `POST /api/admin/users` | PARTIAL | Weak validation (no email/password check) |
| `PUT /api/admin/users` | PARTIAL | No role enum check, no self-deactivate guard |
| `POST /api/admin/cloudinary-sign` | READY | ✅ |
| `POST /api/admin/media/upload` | BROKEN | `original_filename` column missing → DB insert fails |
| `GET /api/admin/media/list` | PARTIAL | `original_filename` returns null, no pagination |
| `GET /api/admin/search` | READY | ✅ |
| `POST /api/admin/ai/generate-draft` | READY | ✅ |
| `public_products` RPC | PARTIAL | Brand filter broken, overload conflict |
| `public_blog_posts` RPC | READY | ✅ |
| `public_showrooms` RPC | READY | ✅ |
| `public_promotions` RPC | BROKEN | Missing cover_media, combo_price |
| `admin_quote_search` RPC | PARTIAL | Missing assigned_to_name join |
| `update_quote_status` RPC | BROKEN | Always returns Unauthorized via service role |
| `get_quote_status_logs` RPC | PARTIAL | Wrong source table |
| Admin CRUD (products) | PARTIAL | Missing brand, media, dimensions |
| Admin CRUD (promotions) | PARTIAL | Missing combo_price, dates not saved |
| Admin CRUD (brands) | PARTIAL | |
| Admin CRUD (showrooms) | PARTIAL | |
| Admin CRUD (blog) | PARTIAL | |

### Tổng quan

| Dimension | Score | Comment |
|---|---|---|
| Endpoint coverage | 55/100 | Missing 5+ critical endpoints |
| Request validation | 40/100 | Most routes lack Zod validation |
| Response consistency | 35/100 | No standard error format, many shape mismatches |
| FE-BE mapping | 45/100 | Brand filter broken, promo fields missing |
| DB persistence | 50/100 | Media upload broken, no audit events |
| Error handling | 40/100 | Silent mock fallbacks mask failures |
| Auth/permission | 70/100 | Good structure but service role misuse |
| Upload/media | 35/100 | Core upload broken, no delete |

**Verdict tổng thể: DEMO_LIKE**  
Codebase có đủ shape để trông như production, nhưng có ít nhất **3 BROKEN** endpoints và **5 PARTIAL** endpoints sẽ thất bại khi real data đến. Không đủ điều kiện production deploy.

---

*Báo cáo được tạo 2026-06-19 · Evidence từ source code trực tiếp*  
*Xem thêm: [database_audit_report.md](file:///C:/Users/DELL/.gemini/antigravity/brain/7e03c2c5-5cd9-4683-8255-77f09e27b9ca/database_audit_report.md) | [validation_audit_report.md](file:///C:/Users/DELL/.gemini/antigravity/brain/7e03c2c5-5cd9-4683-8255-77f09e27b9ca/validation_audit_report.md)*
