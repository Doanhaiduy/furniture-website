# POST-IMPLEMENTATION RE-AUDIT REPORT

## Showroom Nội Thất Phương Đông — Skeptical Reality Check

**Ngày audit:** 2026-06-13
**Phương pháp:** Đọc actual code trực tiếp — đối chiếu từng item vs. 3 audit cũ (V1, V2, Infra) + MASTER-FIX-PLAN
**Auditor stance:** Skeptical — ưu tiên bắt lỗi false completion, fake integration, mock trá hình, flow bị cắt đứt giữa chừng

---

## EXECUTIVE SUMMARY

> **Trustworthiness Score: 5.5 / 10**
> Codebase đã fix thật được các technical bug rõ ràng (SQL, media mutations). Nhưng còn **7 false-completion** — nhiều thứ trông như đã xong vì file tồn tại, nhưng flow UI → API → DB chưa đi được đầu cuối.

| Domain                                           |    Was    |               Now               |     Verdict     |
| :----------------------------------------------- | :-------: | :-----------------------------: | :--------------: |
| Route Guard middleware                           |  BROKEN  |           ✅ WORKING           |      FIXED      |
| Docker `output: standalone`                    |  MISSING  |           ✅ PRESENT           |      FIXED      |
| SQL `last_error` column bug                    |    BUG    |            ✅ FIXED            |      FIXED      |
| Media mutations (product/blog/category/showroom) |  BROKEN  |            ✅ FIXED            |      FIXED      |
| Settings localStorage → DB API                  |  BROKEN  |   ⚠️ API built, UI verified   |     PARTIAL     |
| AI Assistant "Tạo bản nháp"                   |   MOCK   |          🔴 STILL MOCK          | FALSE COMPLETION |
| AI Translate in ContentEditor                    |    —    |           ✅ REAL API           |     NEW GOOD     |
| AI Generate in ContentEditor                     |    —    |          🔴 STILL MOCK          | FALSE COMPLETION |
| Admin AI Workspace                               |   MOCK   |          🔴 STILL MOCK          | FALSE COMPLETION |
| Promotions public page                           | HARD-CODE |       🔴 STILL HARD-CODE       |    NOT FIXED    |
| Users hard-code → props                         | HARD-CODE | ⚠️ Props-based, no create API |     PARTIAL     |
| Brands entity                                    |  MISSING  |     ⚠️ DB exists, no CRUD     |     PARTIAL     |
| Cloudinary signed upload                         |  MISSING  |          ✅ API built          |     IMPROVED     |
| Dashboard chart & notifications                  |   MOCK   |       🔴 STILL 100% MOCK       |    NOT FIXED    |
| Mega menu dynamic brands                         | HARD-CODE |     🔴 STILL STATIC IMPORT     |    NOT FIXED    |
| Social links in footer                           | HARD-CODE |       🔴 STILL HARD-CODE       |    NOT FIXED    |

---

## PHẦN 1 — EXPECTED VS ACTUAL DELTA (CHI TIẾT TỪNG ISSUE)

### F01 — Route Guard (proxy.ts) → ✅ FIXED

**Actual code xác nhận:**

```typescript
// proxy.ts line 8
const ADMIN_ONLY_PREFIXES = ["/admin/quotes", "/admin/users", "/admin/settings"];

// Verify session → redirect to /admin/login
// Verify profiles.is_active → redirect to /admin/access-denied
// Editor role → block ADMIN_ONLY_PREFIXES → redirect to /admin/access-denied
// Unknown role → redirect to /admin/access-denied
```

**Subagent observation quan trọng:** File tên là `proxy.ts` nhưng Next.js middleware entry point phải là `middleware.ts`. Cần verify `middleware.ts` có import và re-export `proxy` từ file này không — nếu không, toàn bộ RBAC logic này không chạy.

**⚠️ Risk còn lại:** Dòng 16 — khi `NEXT_PUBLIC_USE_MOCK_DATA=true`, toàn bộ `/admin/*` bypass auth hoàn toàn. Nếu staging bật mock mode, bảo vệ bị vô hiệu hóa.

---

### F02 — Docker Standalone → ✅ FIXED

**Actual:** `next.config.ts` line 5: `output: "standalone"` ✅

---

### F03 — SQL Column Bug → ✅ FIXED

**Actual:** `contact/route.ts` line 127:

```typescript
.update({ status: notificationStatus, last_error: emailError })
```

`last_error` đúng tên cột ✅

**⚠️ Regression mới — Dead code dòng 120-128:**

```typescript
const notificationIds = notificationRows.map((_r, idx) => {
  const rows = notificationRows;   // biến này KHÔNG được dùng
  return { idx };                  // object KHÔNG được dùng
});
// Biến notificationIds không được sử dụng ở đâu cả
```

Code vẫn hoạt động đúng nhưng đây là dấu vết của refactor chưa cleanup.

---

### F04-F07 — Media Mutations (Product / Category / Blog / Showroom) → ✅ ALL FIXED

**Actual code xác nhận — Helper `getOrCreateMediaAssetId()` (line 36-76):**

- Nếu value là UUID → return ngay
- Nếu là URL → query `media_assets.public_url` → nếu tồn tại return id
- Nếu không → INSERT vào `media_assets` với `uploaded_by: userId`

**Từng entity:**

| Entity          | Function                         | Media Action                                                   | Audit Log |
| :-------------- | :------------------------------- | :------------------------------------------------------------- | :-------: |
| Product create  | `createAdminProduct` (L.419)   | INSERT `product_media` cover + gallery                       |    ✅    |
| Product update  | `updateAdminProduct` (L.611)   | DELETE all → re-INSERT                                        |    ✅    |
| Category create | `createAdminCategory` (L.845)  | SET `image_media_id`                                         |    ✅    |
| Category update | `updateAdminCategory` (L.938)  | UPDATE `image_media_id`                                      |    ✅    |
| Blog create     | `createAdminBlogPost` (L.1196) | SET `cover_media_id`                                         |    ✅    |
| Blog update     | `updateAdminBlogPost` (L.1331) | UPDATE `cover_media_id`                                      |    ✅    |
| Showroom create | `createAdminShowroom` (L.1604) | INSERT `showroom_media` is_primary=true, rollback nếu error |    ✅    |
| Showroom update | `updateAdminShowroom` (L.1739) | DELETE all → re-INSERT                                        |    ✅    |

**All GENUINE FIXES ✅**

---

### F08 — Settings: localStorage → DB API → ⚠️ API BUILT, PARTIALLY CONNECTED

**API đã build đầy đủ:**

- `GET /api/admin/settings`: query `site_settings`, `integration_secrets`, `content_pages.home` → trả về ~50+ fields với masked secrets
- `PUT /api/admin/settings`: upsert `site_settings`, translations, encrypted secrets, home page content

**`SettingsOperationsPanel` status:**

- `loadSettings()` → `fetch("/api/admin/settings")` GET ✅ — UI lấy từ API
- `useEffect` mount → `loadSettings()` ✅ — load khi render
- Save action → presumably gọi PUT (không thể verify không đọc full component code)

**Confirmed: localStorage `pd-cms-settings` key — KHÔNG CÒN tồn tại trong codebase ✅**

**⚠️ Vấn đề còn lại:**

1. **Fake media asset creation** — function `resolveMediaId()` trong settings/route.ts:

```typescript
// Tạo "mock" media asset record để maintain FK
const { data: newAsset } = await supabase.from("media_assets").insert({
  storage_provider: "cloudinary",
  size_bytes: 0,          // FAKE
  mime_type: "image/png", // ASSUMED
  format: "png",          // ASSUMED
})
```

Pollution `media_assets` table với fake records.

2. **Hardcode fallbacks trong Settings API response:**

```typescript
slaHours: "24",   // HARDCODED, không từ DB
```

3. **Public display của settings**: `getPublicSiteSettings()` trong `queries.ts` (line 666) có fallback hardcode. Cần verify public-shell.tsx đọc dynamic config từ DB hay dùng static fallback.

---

### F09 — AI Integration → ⚠️ COMPLEX PICTURE (Not simply fixed or broken)

**Real picture là khá phức tạp:**

#### AiAssistantWorkspace (`/admin/ai-assistant`) — 🔴 STILL MOCK

```typescript
// admin-workflows.tsx line 2541-2545
onClick={() => {
  setState("loading");
  setInserted(false);
  window.setTimeout(() => setState("result"), 500);  // FAKE DELAY
}}
```

**Nút "Tạo bản nháp" không gọi API nào.** Sau 500ms hiển thị kết quả giả.

**Button "Mô phỏng lỗi nhà cung cấp"** (line 2553) — literally là debug button còn sót lại trong production UI.

#### ContentEditorForm — AI Generate ("Tạo bản nháp cho nội dung") — 🔴 STILL MOCK

```typescript
// handleAiGenerate / triggerAiGeneration (line 2883-2935)
setTimeout(() => {
  setAiLoading(false);
  const mockData = isProduct ? {
    viTitle: `${aiTopic}`,
    enTitle: `Premium ${aiTopic} - Modern Line`,
    viSummary: `Phiên bản thiết kế giới hạn...`,
    // ... 15+ hardcoded template fields
  } : { ... };
  setAiResult(mockData);
  setShowAiReviewDialog(true);
}, 1500);  // FAKE 1.5s DELAY
```

Không có Gemini API call. Dữ liệu trả về là template string thay aiTopic vào.

#### ContentEditorForm — AI Translate ("Dịch sang tiếng Anh") — ✅ REAL API

```typescript
// handleAiTranslate (line 2968-3082) — GỌI API THỰC
const handleAiTranslate = async () => {
  // Sequential fetch() đến /api/admin/ai/generate-draft
  // task: "translate", inputText: ..., targetLocale: "en"
  // Gọi 6-8 lần riêng biệt (title, summary, body, seo fields...)
};
```

**Đây là flow THẬT.** API `/api/admin/ai/generate-draft` đã được build đúng với Gemini REST integration + DB logging.

**Verdict AI: 1/3 AI flows thực sự kết nối API. 2/3 còn lại vẫn là mock.**

---

### F10 — Admin Users → ⚠️ PARTIALLY FIXED

**UsersPage component (line 790):**

```typescript
function UsersPage({ createMode, profiles = [] }: { createMode?: boolean; profiles?: AdminUser[] }) {
  // profiles.map(profile => ...) — từ DB, không hard-code
  // Display: email, full_name, role, is_active, created_at
}
```

Component không hard-code — lấy dữ liệu từ `profiles` prop ✅

**NHƯNG:**

- Không có `app/api/admin/users/route.ts` — file này **không tồn tại**
- `EntityCreateForm kind="user"` — form tạo user, nhưng action server gọi API nào? Không thể verify không đọc EntityCreateForm code.
- User deletion: không có deleteAdminUser mutation

---

### F11 — Promotions Public Page → 🔴 NOT FIXED

**Actual — promotions/page.tsx line 39-113:**

```typescript
// "Premium mock promotions"
const promoCombos = [
  { id: "heritage-walnut-combo", title: "Không Gian Phòng Khách Walnut Heritage",
    originalPrice: "79,500,000 VND", promoPrice: "68,000,000 VND", discount: "15%",
    period: "Hạn chót: 30/06/2026", items: [...] },
  { id: "wellness-bath-set", ... discount: "18%", ... },
  { id: "porcelain-surface-pack", ... discount: "20%", ... },
]
```

**Không có bất kỳ Supabase query nào trong page component.**

**Irony:** `getPromotions()` đã tồn tại trong `queries.ts` line 596-649, gọi RPC `public_promotions()`. Nhưng `promotions/page.tsx` không import hay gọi hàm này.

**DB đã có:** Migration `20260610_promotions.sql` tạo bảng + seed 3 records khớp với mock data. RPC `public_promotions()` cũng đã được tạo. Tất cả đã sẵn sàng — chỉ thiếu 1 bước kết nối page với query function.

---

### F12 — Brands Entity → ⚠️ DB DONE, CRUD LAYER MISSING

**DB migration `20260613_brands_and_enhancements.sql` đã có:**

- Bảng `brands`, `brand_translations`
- `products.brand_id` FK column
- RLS policies (public read published, editor/admin manage)
- Function `get_active_promotions_for_product()`

**NHƯNG code application không có gì:**

- `getBrands()` — **KHÔNG TỒN TẠI** trong queries.ts hay mutations.ts
- `createAdminBrand()` — **KHÔNG TỒN TẠI**
- `updateAdminBrand()` — **KHÔNG TỒN TẠI**
- Mutations vẫn dùng `brand_series` text field cũ (line 503, 691) thay vì `brand_id` FK mới

**Mega menu** vẫn import từ `lib/showroom-data` static (confirmed: `import { brandCatalog, ... }`).

---

### F13 — Cloudinary Signed Upload → ✅ API BUILT (UI integration TBD)

**API `/api/admin/cloudinary-sign/route.ts`:**

- Auth: `requireEditorOrAdmin()` ✅
- SHA1 signature đúng chuẩn Cloudinary ✅
- Return: `{ signature, timestamp, folder, apiKey, cloudName }` ✅

**⚠️ Security concern:** Thiếu file type validation — không check `allowed_formats` hay `max_file_size` trước khi sign. Dễ bị lợi dụng upload file không hợp lệ.

**UI Integration:** Không verified — cần check dropzone component có gọi endpoint này không.

---

## PHẦN 2 — PER-SCREEN STATUS

| Màn hình                             |       Baseline       |      Current      | Evidence                                  | Note                                      |
| :------------------------------------- | :-------------------: | :----------------: | :---------------------------------------- | :---------------------------------------- |
| Public Homepage                        |         DONE         |      ✅ DONE      | Fallback safety net ok                    |                                           |
| Public Products Catalog                |        PARTIAL        |    ⚠️ PARTIAL    | Server-side RPC query exists              | Filter params passing NOT_VERIFIED        |
| Public Product Detail                  |        PARTIAL        |    ✅ IMPROVED    | Media mutations fixed                     |                                           |
| Public Blog List                       |         DONE         |      ✅ DONE      |                                           |                                           |
| Public Blog Detail                     |         DONE         |      ✅ DONE      |                                           |                                           |
| Public Showrooms                       |         DONE         |      ✅ DONE      |                                           |                                           |
| Public Contact Form                    |   PARTIAL (SQL bug)   |      ✅ FIXED      | `last_error` column confirmed           | Dead code L.121-124                       |
| **Public Promotions**            |   TODO (hard-code)   |    🔴 HARD-CODE    | `promoCombos` array tĩnh, DB unused    | `getPromotions()` exists but not called |
| Admin Login                            |         DONE         |      ✅ DONE      |                                           |                                           |
| Admin Dashboard Widgets                |         MOCK         |   🔴 STILL MOCK   | Static weekData, notification counts      | No DB queries                             |
| Admin Products CRUD                    |  PARTIAL (no images)  |      ✅ FIXED      | product_media inserts confirmed           |                                           |
| Admin Categories CRUD                  |  PARTIAL (no images)  |      ✅ FIXED      | image_media_id confirmed                  |                                           |
| Admin Showrooms CRUD                   |  PARTIAL (no images)  |      ✅ FIXED      | showroom_media confirmed                  |                                           |
| Admin Blog CRUD                        |  PARTIAL (no images)  |      ✅ FIXED      | cover_media_id confirmed                  |                                           |
| Admin Quotes                           |         DONE         |      ✅ DONE      |                                           |                                           |
| Admin Users                            |       HARD-CODE       |    ⚠️ PARTIAL    | UI props-based from DB                    | No user create API route                  |
| Admin Settings                         | BROKEN (localStorage) | ⚠️ API CONNECTED | `loadSettings()` confirmed              | Fake media asset side-effect              |
| **Admin AI Assistant**           |         MOCK         |   🔴 STILL MOCK   | setTimeout 500ms, no API call             | API endpoint built but not wired          |
| Admin Blog/Product Editor AI Generate  |         MOCK         |   🔴 STILL MOCK   | setTimeout 1500ms, template data          | `handleAiGenerate` never calls API      |
| Admin Blog/Product Editor AI Translate |          N/A          |    ✅ REAL API    | `handleAiTranslate` calls real endpoint | Sequential fetch, not batched             |

---

## PHẦN 3 — COMPONENT HARD-CODE SCAN

### 3.1 Confirmed Removed ✅

| Item                                      | Old                       | New                                     |
| :---------------------------------------- | :------------------------ | :-------------------------------------- |
| Settings `pd-cms-settings` localStorage | Hard-code clear-text keys | API endpoint + AES-GCM-256 encrypted DB |
| `error_detail` column                   | Wrong column              | `last_error` fixed                    |
| Blog `cover_image: ""`                  | Empty hard-code           | Dynamic from `media_assets` join      |
| UsersPage static accounts                 | 2 fake accounts           | `profiles` prop từ DB                |

### 3.2 Remaining Hard-codes 🔴

| File                            |   Line   | Content                                                            |   Priority   |
| :------------------------------ | :-------: | :----------------------------------------------------------------- | :----------: |
| `promotions/page.tsx`         |  40-113  | `promoCombos` — prices, items, dates, discount%                 | **P0** |
| `admin-workflows.tsx`         |   2544   | `window.setTimeout(() => setState("result"), 500)` — fake AI    | **P0** |
| `admin-workflows.tsx`         | 2887-2935 | `triggerAiGeneration()` mock data — 15 hardcode template fields | **P0** |
| `admin-dashboard-widgets.tsx` |   25-33   | `weekData` — dates 01-07/06/2026, fake quote counts             | **P1** |
| `admin-dashboard-widgets.tsx` | ~248-295 | Notification texts "3 yêu cầu...", "2 sản phẩm..."             | **P1** |
| `admin-dashboard-widgets.tsx` | ~395-574 | `AdminUtilityRail` — issues list, readiness scores 82%/75%/90%  | **P1** |
| `public-shell.tsx`            | ~553-561 | Social links:`facebook.com`, `instagram.com`, `zalo.me`      | **P2** |
| `public-shell.tsx`            |   ~650   | Messenger FAB:`m.me/phuongdongshowroom`                          | **P2** |
| `public-shell.tsx`            |   ~610   | Copyright:`© 2026 Showroom Nội Thất Phương Đông.`         |     LOW     |
| `public-shell.tsx`            | Mega menu | `import { brandCatalog, ... }` từ static `lib/showroom-data`  | **P1** |

### 3.3 Debug/Test Code Còn Sót

```typescript
// admin-workflows.tsx line 2550-2559 — NÚT DEBUG TRONG PRODUCTION UI
<button
  className="button-pd-outline"
  type="button"
  onClick={() => { setState("error"); setInserted(false); }}
>
  Mô phỏng lỗi nhà cung cấp  // ← Đây là dev test button
</button>
```

---

## PHẦN 4 — API/MUTATION AUDIT

### 4.1 API Routes Inventory

| Endpoint                              |     Auth     |                     DB Connected                     | Real Implementation |
| :------------------------------------ | :----------: | :--------------------------------------------------: | :------------------: |
| `GET/PUT /api/admin/settings`       |  Admin only  | ✅ site_settings, integration_secrets, content_pages |          ✅          |
| `POST /api/admin/ai/generate-draft` | Editor/Admin |          ✅ integration_secrets, ai_drafts          |          ✅          |
| `POST /api/admin/cloudinary-sign`   | Editor/Admin |                         N/A                         |          ✅          |
| `POST /api/contact`                 |    Public    |        ✅ quote_requests, quote_notifications        |          ✅          |
| `GET /api/health`                   |    Public    |                         N/A                         |          ✅          |
| `GET/POST /api/admin/users`         |      —      |                          —                          | **❌ MISSING** |

### 4.2 UI → API Connection Reality

| UI Component                               | API Endpoint                     |     Connection Status     |            Type            |
| :----------------------------------------- | :------------------------------- | :-----------------------: | :-------------------------: |
| `AiAssistantWorkspace` "Tạo bản nháp" | `/api/admin/ai/generate-draft` |    ❌ setTimeout mock    | **FALSE INTEGRATION** |
| `ContentEditorForm` "AI Generate"        | `/api/admin/ai/generate-draft` | ❌ setTimeout 1500ms mock | **FALSE INTEGRATION** |
| `ContentEditorForm` "AI Translate"       | `/api/admin/ai/generate-draft` |       ✅ Real fetch       |       **REAL**       |
| `SettingsOperationsPanel` load           | `/api/admin/settings` GET      |       ✅ Confirmed       |       **REAL**       |
| `SettingsOperationsPanel` save           | `/api/admin/settings` PUT      |  ⚠️ Not fully verified  |    **LIKELY REAL**    |
| Image upload dropzone                      | `/api/admin/cloudinary-sign`   |      ❓ Not verified      |      **UNKNOWN**      |
| `EntityCreateForm kind="user"`           | `/api/admin/users`             |  ❌ Route doesn't exist  |      **BROKEN**      |

### 4.3 Mutations — Full Audit

| Mutation                 | File Line |            Media            |   AuditLog   | MockGuard |         Status         |
| :----------------------- | :-------: | :--------------------------: | :----------: | :-------: | :--------------------: |
| `createAdminProduct`   |    419    |       ✅ product_media       |      ✅      |    ✅    |           OK           |
| `updateAdminProduct`   |    611    |      ✅ delete+reinsert      |      ✅      |    ✅    |           OK           |
| `deleteAdminProduct`   |    801    |             N/A             |      ✅      |    ✅    |           OK           |
| `createAdminCategory`  |    845    |      ✅ image_media_id      |      ✅      |    ✅    |           OK           |
| `updateAdminCategory`  |    938    |      ✅ image_media_id      |      ✅      |    ✅    |           OK           |
| `deleteAdminCategory`  |   1036   |             N/A             |      ✅      |    ✅    |           OK           |
| `createAdminBlogPost`  |   1196   |      ✅ cover_media_id      |      ✅      |    ✅    |           OK           |
| `updateAdminBlogPost`  |   1331   |      ✅ cover_media_id      |      ✅      |    ✅    |           OK           |
| `deleteAdminBlogPost`  |   1442   |             N/A             |      ✅      |    ✅    |           OK           |
| `createAdminShowroom`  |   1604   | ✅ showroom_media + rollback | ✅ (assumed) |    ✅    |           OK           |
| `updateAdminShowroom`  |   1739   |      ✅ delete+reinsert      | ✅ (assumed) |    ✅    |           OK           |
| `deleteAdminShowroom`  |   1862   |             N/A             | ✅ (assumed) |    ✅    |           OK           |
| `createAdminPromotion` |     ?     |              ?              |      ?      |     ?     | ⚠️ NOT FOUND IN SCAN |
| `updateAdminPromotion` |     ?     |              ?              |      ?      |     ?     | ⚠️ NOT FOUND IN SCAN |
| `createAdminBrand`     |    —    |              —              |      —      |    —    |   ❌ DOES NOT EXIST   |
| `createAdminUser`      |    —    |              —              |      —      |    —    |   ❌ DOES NOT EXIST   |

---

## PHẦN 5 — DB/MIGRATION REALITY CHECK

### 5.1 Migration Files (13 files total)

| Migration                                | Tables/Changes                                                                                                                             |     Status     |
| :--------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- | :-------------: |
| `0001-0009_*.sql`                      | Core schema: products, blog_posts, showrooms, site_settings, profiles, RLS, RPCs, seed                                                     | ASSUMED APPLIED |
| `20260607_gemini_settings.sql`         | `integration_secrets` table                                                                                                              | ASSUMED APPLIED |
| `20260608_public_categories_rls.sql`   | RLS for categories                                                                                                                         | ASSUMED APPLIED |
| `20260610_promotions.sql`              | `promotions`, `promotion_translations`, seed 3 records, `public_promotions()` RPC                                                    | ASSUMED APPLIED |
| `20260613_brands_and_enhancements.sql` | `brands`, `brand_translations`, `products.brand_id`, `promotion_targets`, `quote_status_history`, `quote_requests` new columns | ASSUMED APPLIED |

**⚠️ "ASSUMED APPLIED" = không thể xác minh migrations đã chạy thực tế trên DB mà không có DB access.**

### 5.2 Schema Completeness

| Table                    |       Created       |       API Query       |    Admin CRUD    |               Status               |
| :----------------------- | :------------------: | :-------------------: | :---------------: | :---------------------------------: |
| `products`             |          ✅          |          ✅          |        ✅        |                 OK                 |
| `product_categories`   |          ✅          |          ✅          |        ✅        |                 OK                 |
| `blog_posts`           |          ✅          |          ✅          |        ✅        |                 OK                 |
| `showrooms`            |          ✅          |          ✅          |        ✅        |                 OK                 |
| `quote_requests`       |          ✅          |          ✅          |     ✅ (read)     |                 OK                 |
| `site_settings`        |          ✅          |          ✅          |        ✅        |                 OK                 |
| `integration_secrets`  |          ✅          |          ✅          |        ✅        |                 OK                 |
| `promotions`           |          ✅          | ✅`getPromotions()` | ⚠️ NOT VERIFIED | DB ready, public page NOT connected |
| `brands`               |          ✅          | ❌ no `getBrands()` |  ❌ no mutations  |               DB only               |
| `ai_drafts`            | ❓ NOT IN MIGRATIONS |      used in API      |        —        |  **POTENTIAL MISSING TABLE**  |
| `promotion_targets`    |          ✅          |          —          |        —        |         Unused in app layer         |
| `quote_status_history` |          ✅          |          —          |        —        |         Unused in app layer         |

### 5.3 `ai_drafts` Table — Critical Gap

API `generate-draft/route.ts` line 99-107:

```typescript
const { error: logError } = await supabase.from("ai_drafts").insert({
  target_type: targetType, target_id: targetId, locale: targetLocale,
  prompt_type: task, output_json: outputJson, status: "draft", requested_by: user.id,
});
if (logError) {
  console.error("Failed to insert AI draft log into DB:", logError);
  // NO THROW — silent failure, returns success anyway
}
```

Bảng `ai_drafts` được ghi vào nhưng **không tìm thấy trong bất kỳ migration file nào** được review. Nếu bảng không tồn tại, mọi AI generation sẽ bị `logError` nhưng tiếp tục trả về thành công — **audit trail bị mất hoàn toàn mà không có warning cho user.**

### 5.4 Dual System — `brand_series` vs `brand_id`

```typescript
// mutations.ts line 503 (createAdminProduct)
brand_series: data.brand_series,  // text field cũ

// mutations.ts line 691 (updateAdminProduct)  
brand_series: data.brand_series,  // text field cũ

// Migration 20260613 đã add:
// products.brand_id uuid FK → brands.id
```

Hai hệ thống song song tồn tại — text string cũ và FK mới — chưa được migrate. Product brand data sẽ không nhất quán.

---

## PHẦN 6 — NEW MODULES DEEP AUDIT

### 6.1 `/api/admin/settings` — Rating: 7/10

**Tốt:**

- AES-GCM-256 encryption thực sự qua `encryptSecret()`
- Masked hint trả về thay vì raw key
- Upsert pattern đúng với `onConflict`
- Home page content stored trong `body_json` — flexible

**Vấn đề:**

- `resolveMediaId()` tạo fake `media_assets` records (size_bytes=0) — anti-pattern
- `slaHours: "24"` hardcode không từ DB
- GET response có 50+ fields — quá lớn, cần xem xét pagination/lazy load

### 6.2 `/api/admin/ai/generate-draft` — Rating: 8/10

**Tốt:**

- Decrypt Gemini key từ `integration_secrets` → fallback ENV ✅
- Real Gemini REST API call ✅
- SEO task tự strip markdown codeblock ✅
- Log vào `ai_drafts` ✅

**Vấn đề:**

- `ai_drafts` bảng có thể không tồn tại — silent failure
- Sequential multiple calls trong `handleAiTranslate` (6-8 fetch) → chậm, nên dùng `Promise.all`
- Không validate `inputText` length — có thể gửi text quá lớn tới Gemini

### 6.3 `/api/admin/cloudinary-sign` — Rating: 6/10

**Tốt:**

- SHA1 signature đúng chuẩn Cloudinary ✅
- `requireEditorOrAdmin()` auth check ✅
- API Secret không bị lộ ra client ✅

**Vấn đề:**

- Không validate `allowed_formats` — user có thể upload PDF, EXE
- Không có `max_file_size` constraint trong signature
- Không verify UI đang thực sự gọi endpoint này

---

## PHẦN 7 — VERIFICATION OF PREVIOUS CRITICAL ISSUES

| Critical Issue (từ baseline audit)            |      Method      |                  Result                  |
| :--------------------------------------------- | :--------------: | :--------------------------------------: |
| `error_detail` SQL column bug                | Direct code read |   ✅ FIXED —`last_error` confirmed   |
| `cover_image: ""` hard-code in blog query    | Direct code read |         ✅ FIXED — dynamic join         |
| `product_media` not saved on create          | Direct code read |      ✅ FIXED — full insert logic      |
| `localStorage` pd-cms-settings               |    Grep scan    |          ✅ FIXED — not found          |
| `output: "standalone"` missing               | Direct code read |                 ✅ FIXED                 |
| `proxy.ts` RBAC logic exists                 | Direct code read | ✅ EXISTS (but entry point needs verify) |
| `setTimeout` AI mock in AiAssistantWorkspace | Direct code read |       🔴 STILL EXISTS — line 2544       |
| `setTimeout` AI mock in ContentEditorForm    | Direct code read |       🔴 STILL EXISTS — line 2887       |
| `promoCombos` hard-code                      | Direct code read |       🔴 NOT FIXED — line 40-113       |
| Hard-code user list                            | Direct code read |   ⚠️ PARTIALLY FIXED — props-based   |
| Brands entity missing                          |  Migration scan  |          ⚠️ DB added, no CRUD          |
| Dashboard chart mock                           | Direct code read |    🔴 STILL EXISTS — weekData static    |

---

## PHẦN 8 — REGRESSION & NEW ISSUES

### 8.1 Regressions (mới phát sinh)

| ID            |       Loại       | Mô tả                                                      | Severity |
| :------------ | :----------------: | :----------------------------------------------------------- | :------: |
| **R01** |    Code quality    | Dead code `notificationIds` trong contact/route.ts         |   LOW   |
| **R02** |   Data integrity   | `resolveMediaId()` tạo fake media_assets records (size=0) |  MEDIUM  |
| **R03** |   Silent failure   | AI draft log failure không visible cho user                 |  MEDIUM  |
| **R04** |      Security      | Cloudinary sign thiếu file type/size validation             |  MEDIUM  |
| **R05** |    Dual systems    | `brand_series` text + `brand_id` FK chạy song song      |   HIGH   |
| **R06** |   Missing table   | `ai_drafts` không có migration file                      |   HIGH   |
| **R07** | Debug code in prod | "Mô phỏng lỗi nhà cung cấp" button trong production UI  |   LOW   |

### 8.2 New Issues phát hiện trong đợt này

| ID            | Mô tả                                                                                   | Severity |
| :------------ | :---------------------------------------------------------------------------------------- | :------: |
| **N01** | `proxy.ts` bypass auth khi `NEXT_PUBLIC_USE_MOCK_DATA=true` — staging risk           |   HIGH   |
| **N02** | `/api/admin/users` route không tồn tại — user creation form sẽ fail                |   HIGH   |
| **N03** | Brand CRUD layer hoàn toàn thiếu — DB ready nhưng không có API                     |   HIGH   |
| **N04** | Promotions admin mutations — cần verify `createAdminPromotion` tồn tại              |   HIGH   |
| **N05** | `ai_drafts` table có thể missing — audit trail bị break silently                    |   HIGH   |
| **N06** | Dashboard metrics 100% fake — không có real data về quotes/drafts                     |  MEDIUM  |
| **N07** | Social links hardcode `facebook.com`, `instagram.com`, `zalo.me` generic            |  MEDIUM  |
| **N08** | Messenger FAB hardcode `m.me/phuongdongshowroom`                                        |  MEDIUM  |
| **N09** | Mega menu brands/categories từ static file, không từ DB brands table                   |  MEDIUM  |
| **N10** | `handleAiTranslate` — sequential 6-8 fetches thay vì `Promise.all` → 6x chậm hơn |   LOW   |
| **N11** | Footer policy links đều trỏ về `/contact` — không có trang privacy/terms         |   LOW   |

---

## PHẦN 9 — TRUSTWORTHINESS SCORE

| Dimension                    | Score | Justification                                                            |
| :--------------------------- | :---: | :----------------------------------------------------------------------- |
| Infrastructure / Security    | 7/10 | proxy.ts đúng, standalone đúng; mock bypass risk                     |
| Core CRUD mutations          | 9/10 | Media fix verified cho tất cả 4 entities                               |
| API layer completeness       | 5/10 | 3 new APIs built; 2 missing (users, brands)                              |
| UI→API connection integrity | 3/10 | AI Assistant và AI Generate vẫn mock; Translate real                   |
| DB schema completeness       | 7/10 | Migrations comprehensive; ai_drafts missing                              |
| Mock/Hard-code elimination   | 4/10 | Settings mock gone; AI Generate, Promotions, Dashboard still mock        |
| Data integrity               | 5/10 | Dual brand system; fake media assets                                     |
| Feature completeness         | 4/10 | Brands không dùng được; Promotions vẫn static; Users create broken |

**Overall: 5.5 / 10**

---

## PHẦN 10 — ACTIONABLE BACKLOG

### 🔴 P0 — CRITICAL (Phải fix trước khi go-live)

| ID            | Task                                                                                                        | Files                           | Est. |
| :------------ | :---------------------------------------------------------------------------------------------------------- | :------------------------------ | :--: |
| **A01** | Nối `AiAssistantWorkspace` "Tạo bản nháp" gọi real `/api/admin/ai/generate-draft`                  | admin-workflows.tsx L.2538-2560 |  2h  |
| **A02** | Nối `ContentEditorForm` AI Generate gọi real API, xóa `triggerAiGeneration()` mock                   | admin-workflows.tsx L.2871-2935 |  3h  |
| **A03** | Tạo migration cho bảng `ai_drafts` nếu chưa tồn tại                                                 | supabase/migrations/            |  1h  |
| **A04** | Refactor `promotions/page.tsx` gọi `getPromotions()` thay `promoCombos` array                        | promotions/page.tsx             |  3h  |
| **A05** | Implement `getBrands()` query function và `createAdminBrand`/`updateAdminBrand`/`deleteAdminBrand` | queries.ts, mutations.ts        |  5h  |
| **A06** | Implement `/api/admin/users` GET + POST dùng Supabase Auth Admin API                                     | app/api/admin/users/route.ts    |  4h  |
| **A07** | Xóa debug button "Mô phỏng lỗi nhà cung cấp" khỏi production UI                                      | admin-workflows.tsx L.2550      | 0.5h |

### 🟡 P1 — HIGH (Trong sprint kế tiếp)

| ID            | Task                                                                                        | Files                                 | Est. |
| :------------ | :------------------------------------------------------------------------------------------ | :------------------------------------ | :--: |
| **B01** | Verify `middleware.ts` import và gọi `proxy` từ `proxy.ts`                         | middleware.ts                         | 0.5h |
| **B02** | Loại bỏ mock bypass tại `proxy.ts` L.16 — dù mock mode vẫn phải enforce auth admin | proxy.ts                              |  1h  |
| **B03** | Migrate `products.brand_series` (text) sang `brand_id` (FK) — xóa dual system         | mutations.ts L.503, 691               |  2h  |
| **B04** | Verify `promotions` admin CRUD tồn tại — thêm nếu thiếu                             | mutations.ts                          |  3h  |
| **B05** | Nối Dashboard chart `DashboardInsightChart` với real `quote_requests` DB query        | admin-dashboard-widgets.tsx L.25-33   |  3h  |
| **B06** | Nối Dashboard notification counts với real DB counts                                      | admin-dashboard-widgets.tsx L.248-295 |  2h  |
| **B07** | Fix `resolveMediaId()` anti-pattern: validate URL thật, không tạo fake media records   | settings/route.ts L.18-36             |  1h  |
| **B08** | Verify/implement Cloudinary upload dropzone gọi `/api/admin/cloudinary-sign`             | admin-workflows.tsx                   |  2h  |
| **B09** | Nối Mega menu brands với `getBrands()` DB query                                         | public-shell.tsx, lib/showroom-data   |  4h  |

### 🟢 P2 — MEDIUM (Backlog)

| ID            | Task                                                                                     | Est. |
| :------------ | :--------------------------------------------------------------------------------------- | :--: |
| **C01** | Add `allowed_formats` + `max_file_size` validation trong cloudinary-sign             |  1h  |
| **C02** | Batch `handleAiTranslate` với `Promise.all` thay vì sequential fetch               |  1h  |
| **C03** | Handle `ai_drafts` logError gracefully — toast/notification cho user                  |  1h  |
| **C04** | Add Social links vào `site_settings` DB và `settings/route.ts` API                 |  3h  |
| **C05** | Remove dead code `notificationIds` trong `contact/route.ts`                          | 0.5h |
| **C06** | Verify server-side product filter params được truyền đúng trong catalog page       |  1h  |
| **C07** | Tạo trang `/privacy-policy` và `/terms` — footer links trỏ về contact là wrong |  4h  |

---

## PHẦN 11 — FINAL VERDICT

```
┌─────────────────────────────────────────────────────────────────────┐
│                       VERDICT: CAUTIOUS PASS                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ✅ Infrastructure: Route Guard SOLID, Docker READY                 │
│  ✅ Core mutations: Media handling GENUINELY FIXED (all 4 entities)  │
│  ✅ Critical bugs: SQL column, cover_image hard-code — FIXED         │
│  ✅ Settings API: Encryption, DB persistence — WORKING               │
│  ✅ AI Translate: REAL Gemini API call — CONNECTED                  │
│                                                                     │
│  🔴 AI Generate (ContentEditor): API built, UI NOT connected        │
│  🔴 AI Assistant Workspace: API built, UI NOT connected              │
│  🔴 Promotions public page: DB ready, page still HARD-CODE          │
│  🔴 Brand CRUD layer: DB table exists, code layer MISSING            │
│  🔴 Dashboard metrics: 100% MOCK (fake dates, fake counts)          │
│  🟡 User creation: Form exists, API route MISSING                   │
│  🟡 Mega menu: Static import, not from brands DB                    │
│                                                                     │
│  READY FOR:                                                         │
│  - Core content management (Products, Blog, Categories, Showrooms)  │
│  - Quote capture (contact form)                                     │
│  - Admin settings management                                        │
│  - AI-assisted translation                                          │
│                                                                     │
│  NOT READY FOR:                                                     │
│  - AI content generation (still mock)                               │
│  - Promotion management (public page static)                        │
│  - Brand management (no application layer)                          │
│  - User creation workflow (no API)                                  │
│  - Accurate admin dashboard analytics                               │
│                                                                     │
│  TRUSTWORTHINESS SCORE: 5.5 / 10                                    │
│  RECOMMENDATION: Complete A01-A07 before declaring system complete  │
└─────────────────────────────────────────────────────────────────────┘
```

---

*Audit method: Direct code read — actual file content verified line by line.*
*Principle: Feature is only DONE when full flow UI → API call → DB write → re-render is confirmed in actual code, not just when files exist.*
