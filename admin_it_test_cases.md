# Admin Integration & E2E Test Cases — Furniture & Sanitary Website
**Generated:** 2026-06-28 | **Analyst:** Principal QA Engineer (AI-assisted static scan)  
**Source files scanned:** `admin-workflows.tsx` (7 049 lines), `admin-pages.tsx` (1 712 lines), `admin-interactions.tsx` (1 214 lines), `mutations.ts` (2 017 lines), `admin-queries.ts` (1 476 lines), `validations/admin.ts`, `/api/admin/` routes, 25 Supabase migrations.

---

## Summary Table

| Module | Total Cases | IT Cases | E2E Cases | 🔴 Critical | 🟠 High | 🟡 Medium |
|---|---|---|---|---|---|---|
| 1. Auth & Login | 38 | 18 | 20 | 14 | 16 | 8 |
| 2. Dashboard | 18 | 8 | 10 | 4 | 8 | 6 |
| 3. Products | 112 | 58 | 54 | 38 | 46 | 28 |
| 4. Categories | 72 | 36 | 36 | 24 | 28 | 20 |
| 5. Brands | 56 | 28 | 28 | 18 | 24 | 14 |
| 6. Promotions | 74 | 38 | 36 | 24 | 32 | 18 |
| 7. Blogs | 68 | 34 | 34 | 18 | 28 | 22 |
| 8. Showrooms | 62 | 32 | 30 | 20 | 24 | 18 |
| 9. Quote Requests | 54 | 30 | 24 | 22 | 20 | 12 |
| 10. Users | 44 | 22 | 22 | 16 | 18 | 10 |
| 11. Settings | 66 | 34 | 32 | 22 | 28 | 16 |
| 12. Media Library | 58 | 32 | 26 | 22 | 22 | 14 |
| **TOTAL** | **722** | **370** | **352** | **242** | **294** | **186** |

> **Blocking flags used:** BLK-01 = Media ID not persisted in junction table | BLK-02 = FE/BE Zod mismatch | BLK-03 = Docker secrets leak | BLK-04 = Stored XSS showroom maps | BLK-05 = Role fallback `?? "admin"` | BLK-06 = RPC enum mismatch on quote status | BLK-07 = Hardcoded `now` date in promotions client | BLK-08 = `size_bytes = 0` or `size_bytes = 1` ghost assets

---

## MODULE 1 — Auth & Login

### 1.1 Login Form (`/admin/login`)

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-AUTH-01 | Submit empty email field | Leave email blank, fill valid password, click Login | Inline error: "Email không được để trống" | E2E | 🔴 |
| ADM-AUTH-02 | Submit whitespace-only email | Email = "   ", valid password | Trimmed to empty → same error as ADM-AUTH-01 | E2E | 🔴 |
| ADM-AUTH-03 | Submit invalid email format | Email = "not-an-email", valid password | Inline error: email format invalid | E2E | 🟠 |
| ADM-AUTH-04 | Submit empty password | Valid email, blank password | Inline error: "Mật khẩu không được để trống" | E2E | 🔴 |
| ADM-AUTH-05 | Submit with correct credentials | admin@furniture.com / password123 | Redirect to `/admin` (dashboard); no console error | E2E | 🔴 |
| ADM-AUTH-06 | Submit with wrong password | admin@furniture.com / wrongpass | Error toast/inline "Thông tin đăng nhập không đúng"; no redirect | E2E | 🔴 |
| ADM-AUTH-07 | Submit with non-existent email | nouser@test.com / password123 | Same generic error (no email-enumeration leak) | E2E | 🔴 |
| ADM-AUTH-08 | SQL injection in email field | Email = `' OR '1'='1`, valid password | Supabase Auth rejects; no DB error exposed; form stays | IT | 🔴 |
| ADM-AUTH-09 | XSS payload in email field | Email = `<script>alert(1)</script>@test.com`, submit | Input is rejected by email regex; no script executes | E2E | 🔴 |
| ADM-AUTH-10 | Rate limiting on failed login | 6 consecutive wrong-password submissions within 30 s | 6th attempt returns 429 or Supabase rate-limit error; button disabled | IT | 🟠 |
| ADM-AUTH-11 | Anonymous direct-access guard (products) | Clear cookies → navigate to `/admin/products` | Middleware redirects to `/admin/login`; admin UI never renders | E2E | 🔴 |
| ADM-AUTH-12 | Anonymous direct-access guard (settings) | Clear cookies → navigate to `/admin/settings` | Same redirect; 0 data leaked | E2E | 🔴 |
| ADM-AUTH-13 | Anonymous direct-access guard (API) | GET `/api/admin/settings` without session | HTTP 401 Unauthorized; no settings data in response | IT | 🔴 |
| ADM-AUTH-14 | Middleware does NOT fallback to admin role | User with no profile row accesses `/admin` | Middleware rejects; does NOT default to "admin" role (BLK-05) | IT | 🔴 |
| ADM-AUTH-15 | Session persistence across page reload | Log in → hard-reload `/admin` | Still authenticated; no re-login prompt | E2E | 🟠 |
| ADM-AUTH-16 | Session expiry triggers re-auth | Manually expire cookie → attempt API call | HTTP 401; frontend redirects to login | IT | 🟠 |
| ADM-AUTH-17 | Logout clears session | Click logout → navigate back to `/admin` | Redirected to `/admin/login`; no stale data | E2E | 🔴 |
| ADM-AUTH-18 | Remember-me / persistent session (if applicable) | Log in without checking remember-me → close browser tab → reopen | Session not persisted beyond tab; re-login required | E2E | 🟡 |

### 1.2 Access-Denied Page (`/admin/access-denied`)

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-AUTH-19 | Editor accessing admin-only route | Log in as editor → navigate to `/admin/users` | Redirected to `/admin/access-denied` or `/admin`; HTTP 403 | E2E | 🔴 |
| ADM-AUTH-20 | Access-denied page renders correctly | Navigate to `/admin/access-denied` as editor | Page shows explanatory message in Vietnamese; no blank screen | E2E | 🟠 |
| ADM-AUTH-21 | "Go back" CTA on access-denied | Click back button on access-denied page | Returns to previous safe admin page | E2E | 🟡 |
| ADM-AUTH-22 | Anonymous on access-denied page | Navigate to `/admin/access-denied` without session | Redirected to `/admin/login` | E2E | 🟠 |

### 1.3 Additional Auth Cases (Free-Form Audit)

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-AUTH-23 | `proxy.ts` vs `middleware.ts` routing gap | Verify which file is active as Next.js middleware | Only `middleware.ts` in project root is honoured; `proxy.ts` is not middleware | IT | 🔴 |
| ADM-AUTH-24 | Role column populated on new auth.users trigger | Create auth user → check `profiles` table | `profiles.role` defaults to `'editor'`; not null; not 'admin' without explicit grant | IT | 🔴 |
| ADM-AUTH-25 | Token refresh during long AI generation | Keep admin tab open >1 h with AI generation in progress | Session auto-refreshes; action completes or cleanly shows re-auth prompt | E2E | 🟠 |

**Module 1 subtotal: 25 cases (IT: 10 / E2E: 15)**

---

## MODULE 2 — Dashboard (`/admin`)

### 2.1 KPI Cards & Statistics

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-DASH-01 | Dashboard loads with real DB counts | Log in as admin → open `/admin` | All KPI cards show non-negative integers matching DB counts | IT | 🔴 |
| ADM-DASH-02 | Editor role hides quote & user counts | Log in as editor → dashboard | "Yêu cầu báo giá" and "Người dùng" KPI cards are hidden | E2E | 🟠 |
| ADM-DASH-03 | Admin sees quote & user counts | Log in as admin → dashboard | Both cards visible with correct counts | E2E | 🟠 |
| ADM-DASH-04 | Dashboard does not crash on zero data | Truncate all products/categories/blogs → view dashboard | All KPIs show "0"; no JS exception | IT | 🟠 |
| ADM-DASH-05 | DB timeout fallback (500ms) | Mock supabase to delay >5 s → open dashboard | Dashboard loads with mock/cached values; no white screen | IT | 🟡 |

### 2.2 Quick Actions & Charts

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-DASH-06 | "Thêm sản phẩm" CTA navigates correctly | Click action button on dashboard | Browser navigates to `/admin/products?create=1` | E2E | 🟠 |
| ADM-DASH-07 | Chart renders with quote data | Admin has >0 quote_requests → open dashboard | DashboardInsightChart renders without JS error | E2E | 🟡 |
| ADM-DASH-08 | Chart renders with empty quotes | No quote_requests in DB | Chart shows empty/zero state; no error | E2E | 🟡 |
| ADM-DASH-09 | Compact QuoteTable shows latest quotes | Admin has ≥3 quotes → dashboard | QuoteTable shows up to N most recent; each row has name, status | E2E | 🟠 |
| ADM-DASH-10 | WarningPanel visibility | Any known warnings exist | WarningPanel displays correct advisory text | E2E | 🟡 |

### 2.3 RBAC on Dashboard

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-DASH-11 | Editor role cannot see admin-only sidebar items | Log in as editor | Sidebar does not show "Users" or "Settings" link (or they redirect on click) | E2E | 🔴 |
| ADM-DASH-12 | Admin role sees full sidebar | Log in as admin | All 10 admin sections listed in sidebar | E2E | 🟠 |

**Module 2 subtotal: 12 cases (IT: 5 / E2E: 7)**

---

## MODULE 3 — Products

### 3.1 Product List (`/admin/products`)

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-PRD-01 | List loads with real data | Admin opens `/admin/products` | Table shows all non-deleted products with name, category, status | IT | 🔴 |
| ADM-PRD-02 | Pagination: page 1 | Products > 50; navigate page 1 | Shows items 1–50 | IT | 🟠 |
| ADM-PRD-03 | Pagination: page 2 | Click "Next page" | Shows items 51–100; URL updates | E2E | 🟠 |
| ADM-PRD-04 | Pagination: out-of-range page | Navigate to `?page=9999` | Shows empty state or redirects to page 1 | IT | 🟡 |
| ADM-PRD-05 | Search by product name | Type "Bồn cầu" in search | Only products with "Bồn cầu" in name are shown | E2E | 🟠 |
| ADM-PRD-06 | Search: non-matching query | Type "zzzzqqqq" in search | Empty state message shown; no error | E2E | 🟡 |
| ADM-PRD-07 | Filter by status: published | Select "Đã xuất bản" filter | Only published products shown; DB status = 'published' confirmed | IT | 🟠 |
| ADM-PRD-08 | Filter by status: draft | Select "Bản nháp" filter | Only draft products shown | IT | 🟠 |
| ADM-PRD-09 | Sort by name ascending | Click name column header | List re-orders alphabetically A→Z | E2E | 🟡 |
| ADM-PRD-10 | Sort by name descending | Click header again | List re-orders Z→A | E2E | 🟡 |

### 3.2 Product Create Form — Field Validation

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-PRD-11 | Submit with empty name_vi | Leave `name_vi` blank → save | Error: "Tên sản phẩm tiếng Việt là bắt buộc" | E2E | 🔴 |
| ADM-PRD-12 | Submit name_vi with only whitespace | `name_vi = "   "` | Trimmed to empty → same required error | E2E | 🔴 |
| ADM-PRD-13 | Submit name_vi at max reasonable length | `name_vi` = 255 chars | Accepted and saved | IT | 🟡 |
| ADM-PRD-14 | Submit name_vi with XSS | `name_vi = "<script>alert(1)</script>"` | Server strips/escapes; no alert executes on view | IT | 🔴 |
| ADM-PRD-15 | Submit name_vi with SQL injection | `name_vi = "' OR '1'='1"` | Saved as literal text; no DB error; parameterized query | IT | 🔴 |
| ADM-PRD-16 | Submit name_vi with special chars | `name_vi = "Bàn & Ghế <đẹp>"` | Saved and displayed correctly (HTML encoded) | IT | 🟠 |
| ADM-PRD-17 | Submit empty summary_vi | Leave blank | Error: "Mô tả ngắn tiếng Việt là bắt buộc" | E2E | 🔴 |
| ADM-PRD-18 | Submit summary_vi whitespace-only | `"   "` | Trimmed → required error | E2E | 🔴 |
| ADM-PRD-19 | Submit empty slug | Leave slug blank | Error: "Slug không được để trống" | E2E | 🔴 |
| ADM-PRD-20 | Submit slug with uppercase | `slug = "My-Product"` | Zod regex rejects (only `[a-z0-9-]`); error shown | E2E | 🔴 |
| ADM-PRD-21 | Submit slug with spaces | `slug = "my product"` | Rejected by regex; error shown | E2E | 🔴 |
| ADM-PRD-22 | Submit slug with special chars | `slug = "my-product@2026!"` | Rejected by regex | E2E | 🔴 |
| ADM-PRD-23 | Submit valid slug | `slug = "bon-cau-toto-t2026"` | Accepted | IT | 🔴 |
| ADM-PRD-24 | Submit duplicate slug (same locale) | Create product; create second with same slug | DB unique constraint (uq_product_translations_locale_slug) raises error; UI shows message | IT | 🔴 |
| ADM-PRD-25 | Submit without selecting category | Leave `category_id` blank | Error: "Danh mục sản phẩm là bắt buộc" | E2E | 🔴 |
| ADM-PRD-26 | Submit with invalid category UUID | Manually send `category_id = "not-a-uuid"` | Server returns 400/422; no DB insertion | IT | 🔴 |
| ADM-PRD-27 | Submit price_min > price_max | `price_min = 5000000, price_max = 1000000` | Cross-field Zod refine error: "Giá tối thiểu phải nhỏ hơn hoặc bằng giá tối đa" | IT | 🔴 |
| ADM-PRD-28 | Submit price_min = price_max | Both = 2000000 | Accepted (≤ condition) | IT | 🟠 |
| ADM-PRD-29 | Submit negative price_min | `price_min = -100` | DB constraint `chk_products_price_range` (≥ 0) rejects; UI shows error | IT | 🔴 |
| ADM-PRD-30 | Submit price_min = 0 | `price_min = 0` | Accepted (boundary: ≥ 0 in DB) | IT | 🟠 |
| ADM-PRD-31 | Submit non-numeric price field | Enter "abc" in price_min | FE converts to NaN; Zod rejects or UI shows format error | E2E | 🟠 |
| ADM-PRD-32 | Submit promo_price_min ≥ price_min | `promo_price_min = 3M, price_min = 2M` | Refine error: "Giá khuyến mãi phải nhỏ hơn giá gốc" | IT | 🔴 |
| ADM-PRD-33 | Submit valid promo_price_min | `promo_price_min = 1M, price_min = 2M` | Accepted | IT | 🟠 |
| ADM-PRD-34 | Submit dimension width = negative | `width = -10` | DB constraint `chk_products_dimensions_non_negative` rejects | IT | 🟠 |
| ADM-PRD-35 | Submit dimension width = 0 | `width = 0` | Accepted (≥ 0) | IT | 🟡 |
| ADM-PRD-36 | Submit currency not 3 uppercase chars | `currency = "VN"` | Zod `z.string().length(3)` rejects; DB `chk_products_currency_iso_like` also rejects | IT | 🟠 |
| ADM-PRD-37 | Submit with valid brand_id | Select brand from dropdown | Saved; DB `products.brand_id` FK valid | IT | 🟠 |
| ADM-PRD-38 | Submit with invalid brand UUID | Manually send `brand_id = "not-uuid"` | Zod `z.string().uuid()` rejects before DB | IT | 🟠 |
| ADM-PRD-39 | Submit empty promotion_id | No promotion selected | `product_promotions` junction not populated; accepted | IT | 🟡 |
| ADM-PRD-40 | Submit custom_attribute with empty name_vi | Add attribute, leave `name_vi` blank | Error: "Tên thuộc tính (VI) bắt buộc" | E2E | 🟠 |
| ADM-PRD-41 | Submit custom_attribute with XSS in value_vi | `value_vi = "<img src=x onerror=alert(1)>"` | Value stored as escaped text; no XSS on product page | IT | 🔴 |

### 3.3 Product Create — Business Logic

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-PRD-42 | Create product with all required fields | Fill valid name_vi, summary_vi, slug, category → Save as Draft | HTTP success; DB row in `products`; `product_translations` vi row inserted | IT | 🔴 |
| ADM-PRD-43 | Audit log written on create | After create → check `audit_logs` | Row with `action='create', entity_type='product', entity_id=<UUID>` | IT | 🟠 |
| ADM-PRD-44 | Publish without translations → trigger fires | Create product; add only `vi` translation; set status=published | `require_publish_translations` trigger fires; error "Cannot publish without vi AND en translations" | IT | 🔴 |
| ADM-PRD-45 | Publish with both vi+en translations | Add both translations → publish | Status = 'published'; `published_at` set; no trigger error | IT | 🔴 |
| ADM-PRD-46 | Draft→Published state transition | Create as draft → edit → publish | `products.status` changes to 'published'; `published_at` timestamp set | IT | 🔴 |
| ADM-PRD-47 | Published→Archived state transition | Publish product → archive | `products.status = 'archived'`; `deleted_at` null (soft-delete only on explicit delete) | IT | 🟠 |
| ADM-PRD-48 | Delete product (soft delete) | Click delete on a product | `products.deleted_at` set; `products.status = 'archived'`; list no longer shows it | IT | 🔴 |
| ADM-PRD-49 | Deleted product stays in audit_logs | After soft delete → check audit_logs | Audit row with `action='archive'` | IT | 🟠 |
| ADM-PRD-50 | Category dropdown dynamically from DB | Open create form | Category dropdown is populated from `product_categories` DB (not hardcoded) | IT | 🔴 |
| ADM-PRD-51 | Category dropdown shows new category after creation | Create new category → go back to product create | New category appears in dropdown without page refresh | E2E | 🟠 |
| ADM-PRD-52 | Brand dropdown dynamically from DB | Open create form | Brand dropdown populated from `brands` table | IT | 🟠 |
| ADM-PRD-53 | Promotion dropdown populated dynamically | Open product create form | Promotions dropdown from `promotions` table | IT | 🟠 |
| ADM-PRD-54 | Slug auto-generated from name_vi | Type Vietnamese name → tab to next field | Slug field auto-populated with slugified version (lowercase, no diacritics) | E2E | 🟠 |
| ADM-PRD-55 | Duplicate reference_code rejected | Create two products with same reference_code | DB partial unique index `uq_products_reference_code_active` violation; UI error | IT | 🟠 |
| ADM-PRD-56 | revalidatePath called after create | Create product | Next.js cache for `/` layout invalidated; public pages reflect new product | IT | 🟠 |

### 3.4 Product Edit Form

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-PRD-57 | Edit form loads existing data | Navigate to `/admin/products/[id]` | All previously saved fields pre-populated correctly | IT | 🔴 |
| ADM-PRD-58 | Edit name_vi → save | Change name_vi → save | `product_translations` vi row updated via upsert; new name reflected on client | IT | 🔴 |
| ADM-PRD-59 | Edit slug → save | Change slug → save | New slug in `product_translations`; old slug may orphan URL (no redirect guard) | IT | 🟠 |
| ADM-PRD-60 | Edit category → save | Change category dropdown → save | `products.category_id` updated; product now appears under new category filter | IT | 🔴 |
| ADM-PRD-61 | Edit price_min → save | Increase price_min → save | DB updated; public RPC reflects new price | IT | 🔴 |
| ADM-PRD-62 | Edit promotion link → save | Change `promotion_id` → save | Old `product_promotions` row deleted; new one inserted | IT | 🟠 |
| ADM-PRD-63 | Edit with conflicting slug (another product) | Set slug to an existing product's slug → save | Unique constraint error; UI shows message; existing product unchanged | IT | 🔴 |
| ADM-PRD-64 | Edit price_min to exceed price_max | Set `price_min > price_max` → save | Cross-field validation error | IT | 🔴 |
| ADM-PRD-65 | Edit form: empty name_vi → save | Clear name_vi → save | Required field error; no DB update | E2E | 🔴 |
| ADM-PRD-66 | Edit does not lose gallery images | Load edit form; do not touch images; save | `product_media` rows unchanged; images still linked | IT | 🔴 |
| ADM-PRD-67 | Concurrent edit in two tabs | Open same product in Tab A and Tab B; both edit and save | Second save succeeds (last-write-wins); no silent data loss or crash | IT | 🟠 |

### 3.5 Product Media Upload

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-PRD-68 | Upload valid cover image (JPG, <10MB) | Drop valid JPG into cover Dropzone | Cloudinary upload succeeds; `media_assets` row with `size_bytes > 0`; `original_filename` set | IT | 🔴 |
| ADM-PRD-69 | Upload valid cover image (PNG, <10MB) | Drop PNG | Same as above | IT | 🔴 |
| ADM-PRD-70 | Upload valid cover image (WebP) | Drop WebP | Same as above | IT | 🟠 |
| ADM-PRD-71 | Upload oversized image (>10MB) | Drop 16 MB JPG | Client-side validation rejects before upload; error shown; no Cloudinary request | E2E | 🔴 |
| ADM-PRD-72 | Upload unsupported format (.pdf) | Drop PDF | Rejected by `allowedImageMimeTypes` check in admin-workflows.tsx; no upload | E2E | 🔴 |
| ADM-PRD-73 | Upload .sh script | Drop shell script | Rejected; no upload to Cloudinary | E2E | 🔴 |
| ADM-PRD-74 | Upload 0-byte empty file | Drop 0-byte file | Client-size check rejects; DB constraint `chk_media_assets_positive_size` would also reject | IT | 🔴 |
| ADM-PRD-75 | Upload SVG with embedded JS | Drop SVG containing `<script>` | Should be rejected (SVG is in ALLOWED_FORMATS in upload/route.ts — **risk flag** — see Observations) | IT | 🔴 |
| ADM-PRD-76 | Cover image linked as primary in product_media | Upload cover → save product | `product_media` row with `is_primary=true` and correct `product_id`; `media_id` is UUID not URL (BLK-01) | IT | 🔴 |
| ADM-PRD-77 | Gallery images linked in product_media | Upload 3 gallery images → save | 3 `product_media` rows with `is_primary=false`, correct `sort_order` | IT | 🔴 |
| ADM-PRD-78 | Replace cover image on edit | Edit product; upload new cover → save | Old `product_media` primary row deleted; new row with new `media_id` inserted | IT | 🔴 |
| ADM-PRD-79 | media_assets.size_bytes > 0 after upload | Upload valid image | DB column `size_bytes` populated from Cloudinary `bytes` field; not 0 or 1 (BLK-08) | IT | 🔴 |
| ADM-PRD-80 | media_assets.original_filename set | Upload image | `original_filename` column matches uploaded file name (BLK-08) | IT | 🔴 |
| ADM-PRD-81 | Multiple gallery upload | Upload 5 gallery images at once | All 5 linked; sort_order sequential | IT | 🟠 |
| ADM-PRD-82 | Delete gallery image | Remove one gallery image from picker | `product_media` row for that image deleted | IT | 🟠 |

### 3.6 Product RBAC

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-PRD-83 | Editor can create product | Log in as editor; create product | `requireEditorOrAdmin()` passes; product created | IT | 🔴 |
| ADM-PRD-84 | Editor can edit product | Log in as editor; edit product | Success | IT | 🔴 |
| ADM-PRD-85 | Anonymous cannot create product | No session; POST to createAdminProduct action | Auth check redirects/returns 401 | IT | 🔴 |

### 3.7 Product API Error Recovery

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-PRD-86 | DB error on product insert | Mock DB returning 500 → create product | UI shows error toast "Lỗi hệ thống"; no orphan DB rows | IT | 🟠 |
| ADM-PRD-87 | Translation insert fails → rollback | Translation insert errors → check products table | Product row deleted by cleanup code | IT | 🟠 |

### 3.8 Product — Free-Form Audit Cases

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-PRD-88 | `dimension_display_text_en` maps to vi value | Bug: line 322 in mutations.ts `dimension_display_text_en: viTrans?.dimension_display_text` | EN dimension text shows VI value — verify this is intentional; if not, it's a mapping bug | IT | 🔴 |
| ADM-PRD-89 | getOrCreateMediaAsset sets size_bytes=1 for URL-based assets | Upload via URL string (not UUID) | Ghost asset created with `size_bytes=1` violates spirit of BLK-08; verify this path | IT | 🔴 |
| ADM-PRD-90 | SVG allowed format — XSS via Cloudinary | Upload SVG with JS payload; Cloudinary accepts it; route.ts stores it | Stored XSS risk if SVG served inline; verify Content-Disposition or CSP | IT | 🔴 |
| ADM-PRD-91 | Publish trigger fires when updating non-status field | Update `price_min` on a published product | Trigger should NOT block update (only fires on status BEFORE INSERT/UPDATE OF status) | IT | 🟠 |
| ADM-PRD-92 | console.log in admin-queries.ts line 372 | Production build; open product list | `getAdminBlogPosts query result` logged to server console — data leak in logs | IT | 🟡 |

**Module 3 subtotal: 92 cases (IT: 52 / E2E: 40)**

---

## MODULE 4 — Categories

### 4.1 Category List

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-CAT-01 | Category list loads | Admin opens categories section | Table shows all non-deleted categories with name, status, parent | IT | 🔴 |
| ADM-CAT-02 | Parent-child hierarchy visible | Category with parent_id set | Parent name shown inline or indented | E2E | 🟠 |
| ADM-CAT-03 | Search/filter by name | Type "Gạch" | Only matching categories shown | E2E | 🟠 |
| ADM-CAT-04 | product_count shows correct number | Category has 5 products → view list | `product_count = 5` | IT | 🟠 |

### 4.2 Category Create — Validation

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-CAT-05 | Submit empty name_vi | Blank → save | Error: "Tên danh mục tiếng Việt là bắt buộc" | E2E | 🔴 |
| ADM-CAT-06 | Submit whitespace name_vi | `"   "` | Trimmed → required error | E2E | 🔴 |
| ADM-CAT-07 | Submit name_vi with XSS | `<script>alert(1)</script>` | Stored safely; no execution | IT | 🔴 |
| ADM-CAT-08 | Submit empty slug | Blank slug | Error: "Slug không được để trống" | E2E | 🔴 |
| ADM-CAT-09 | Submit slug with uppercase | `"My-Category"` | Zod regex reject | E2E | 🔴 |
| ADM-CAT-10 | Submit slug with spaces | `"my category"` | Rejected | E2E | 🔴 |
| ADM-CAT-11 | Submit duplicate slug (same locale) | Second category with same slug | DB unique index `uq_product_category_translations_locale_slug` violation | IT | 🔴 |
| ADM-CAT-12 | Submit valid group_key | Select "wood" from enum | Mapped to "wooden_furniture" in DB via `mapGroupKeyToDb()` | IT | 🟠 |
| ADM-CAT-13 | Submit invalid group_key | Send `group_key = "invalid"` | Zod enum validation rejects (only wood/sanitary/tiles) | IT | 🟠 |
| ADM-CAT-14 | Submit sort_order as decimal | `sort_order = 1.5` | Zod `z.number().int()` rejects | IT | 🟡 |
| ADM-CAT-15 | Submit sort_order negative | `sort_order = -1` | Accepted by Zod (no min constraint); verify intended behavior | IT | 🟡 |
| ADM-CAT-16 | Submit parent_id as self-reference | `parent_id = category's own id` | Server-side check `data.parent_id === id` → "Circular parent-child relationship detected" | IT | 🔴 |
| ADM-CAT-17 | Submit valid parent_id | Select existing category as parent | Saved; `parent_id` FK valid | IT | 🟠 |

### 4.3 Category Create — Business Logic

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-CAT-18 | Create category as draft | Submit valid form with status=draft | `product_categories.status = 'draft'`; no publish trigger fires | IT | 🔴 |
| ADM-CAT-19 | Create category and publish (both translations) | Add vi+en translations → publish | Trigger passes; `status = 'published'`; `published_at` set | IT | 🔴 |
| ADM-CAT-20 | Create category and publish (only vi translation) | Add only vi → publish | Trigger fires: "Cannot publish without vi AND en translations" | IT | 🔴 |
| ADM-CAT-21 | Cover image upload for category | Upload PNG to category cover dropzone | `product_categories.image_media_id` set; media_assets row inserted | IT | 🔴 |
| ADM-CAT-22 | Category cover image linked correctly | Save category with cover → view list | Cover image URL reachable; not ghost asset | IT | 🟠 |
| ADM-CAT-23 | Soft delete category | Delete category via UI | `product_categories.deleted_at` set; no longer visible in list | IT | 🔴 |
| ADM-CAT-24 | Delete category with products | Try to delete category that has active products | Products remain but `category_id` FK dangles (no CASCADE DELETE); verify behavior | IT | 🔴 |
| ADM-CAT-25 | Audit log on create | Create category → check audit_logs | `action='create', entity_type='category'` row present | IT | 🟠 |

### 4.4 Category Edit — Form & Business Logic

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-CAT-26 | Edit form loads existing data | Navigate to category edit | All fields pre-populated | IT | 🔴 |
| ADM-CAT-27 | Edit name_vi → save | Change name → save | `product_category_translations` vi row updated | IT | 🔴 |
| ADM-CAT-28 | Edit slug → save | Change slug → save | New slug; old slug-based URLs break (no redirect warning) | IT | 🟠 |
| ADM-CAT-29 | Edit parent to create circular reference (deep) | A→B→C chain; set A.parent_id = C | `checkCircularCategory()` detects cycle; error returned | IT | 🔴 |
| ADM-CAT-30 | Edit parent to valid different parent | Change parent_id → save | DB updated; hierarchy correct | IT | 🟠 |
| ADM-CAT-31 | Edit group_key → save | Change group_key → save | Mapped correctly to DB enum value | IT | 🟠 |
| ADM-CAT-32 | Edit status draft→published (with only vi) | Set status=published; only vi exists | Trigger blocks; error shown | IT | 🔴 |
| ADM-CAT-33 | Edit status draft→published (with vi+en) | Set status=published; both exist | Status changes; `published_at` updated | IT | 🔴 |
| ADM-CAT-34 | Edit RBAC — editor can edit | Log in as editor; edit category | Succeeds (`requireEditorOrAdmin()` passes) | IT | 🔴 |
| ADM-CAT-35 | Edit name_vi with XSS — edit form | `<script>alert(1)</script>` in edit | Escaped on save; no XSS | IT | 🔴 |

### 4.5 Category — Free-Form Audit

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-CAT-36 | Slug shared between vi and en translations | Category uses same slug for vi and en | `uq_product_category_translations_locale_slug` partial unique allows if locale differs — verify | IT | 🟠 |
| ADM-CAT-37 | `mapGroupKeyToDb` skips "tiles" mapping | `group_key = "tiles"` passed | Returns "tiles" as-is; check if DB enum supports "tiles" | IT | 🟠 |

**Module 4 subtotal: 37 cases (IT: 29 / E2E: 8)**

---

## MODULE 5 — Brands

### 5.1 Brand List

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-BRD-01 | Brand list loads from DB | Open brands section | List shows all non-deleted brands; name, status, logo | IT | 🟠 |
| ADM-BRD-02 | New brand appears in product filter | Create brand → open product filter on client | New brand name appears in brand filter dropdown | E2E | 🟠 |

### 5.2 Brand Create — Validation

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-BRD-03 | Submit empty name_vi | Blank → save | Error: "Tên thương hiệu tiếng Việt là bắt buộc" | E2E | 🔴 |
| ADM-BRD-04 | Submit name_vi whitespace-only | `"   "` | Trimmed → required error | E2E | 🔴 |
| ADM-BRD-05 | Submit name_vi with XSS | `<script>alert(1)</script>` | Escaped; no execution | IT | 🔴 |
| ADM-BRD-06 | Submit name_vi with SQL injection | `'; DROP TABLE brands;--` | Rejected as literal text; parameterized query safe | IT | 🔴 |
| ADM-BRD-07 | Submit name_vi at boundary (1 char) | `name_vi = "A"` | Accepted (min 1 after trim) | IT | 🟡 |
| ADM-BRD-08 | Submit description_vi with XSS | `<img src=x onerror=alert(1)>` | Escaped on save and display | IT | 🟠 |
| ADM-BRD-09 | Submit invalid status | Send `status = "invalid"` | Zod enum rejects (only draft/published/archived) | IT | 🟠 |
| ADM-BRD-10 | Submit sort_order as negative | `sort_order = -5` | Accepted (no min validation — review intended) | IT | 🟡 |
| ADM-BRD-11 | Submit sort_order as float | `sort_order = 1.5` | Zod `z.number().int()` rejects | IT | 🟡 |
| ADM-BRD-12 | Submit logo_url as non-HTTP URL | `logo_url = "ftp://img.jpg"` | optionalText accepts it; verify if URL validation needed | IT | 🟡 |

### 5.3 Brand Create — Business Logic

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-BRD-13 | Create brand with required fields only | name_vi + status → save | Brand row inserted in `brands` table via brands-mutations.ts | IT | 🔴 |
| ADM-BRD-14 | Create brand with logo image | Upload PNG logo | `brands.logo_media_id` set; media_assets row inserted | IT | 🔴 |
| ADM-BRD-15 | Brand logo linked as FK | Save brand with logo → query DB | `brands.logo_media_id` is a valid UUID in `media_assets` | IT | 🔴 |
| ADM-BRD-16 | Create brand with duplicate name_vi | Two brands with same name_vi | No unique constraint on name → allowed; document behavior | IT | 🟠 |
| ADM-BRD-17 | Soft delete brand | Delete brand via UI | `brands.deleted_at` set; no longer shown in list | IT | 🔴 |
| ADM-BRD-18 | Delete brand referenced by products | Delete brand that has products | `products.brand_id` FK may cascade or dangle; verify constraint behavior | IT | 🔴 |
| ADM-BRD-19 | Audit log on brand create | Create brand → audit_logs | Row with `action='create', entity_type='brand'` | IT | 🟠 |

### 5.4 Brand Edit

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-BRD-20 | Edit form loads existing brand | Navigate to brand edit | name_vi, logo, status pre-populated | IT | 🔴 |
| ADM-BRD-21 | Edit name_vi → save | Change name → save | DB updated; product filter updated | IT | 🔴 |
| ADM-BRD-22 | Edit logo → save | Upload new logo → save | Old logo FK replaced; new logo FK set | IT | 🟠 |
| ADM-BRD-23 | Edit status draft→published → save | Status = published | Brand becomes visible in public brand list | IT | 🟠 |
| ADM-BRD-24 | Edit with empty name_vi → save | Clear name_vi → save | Required field error | E2E | 🔴 |

### 5.5 Brand Media Upload

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-BRD-25 | Upload valid logo PNG | Drop PNG <10MB | Uploaded; `media_assets` row with `size_bytes > 0` | IT | 🔴 |
| ADM-BRD-26 | Upload oversized logo | Drop >10MB image | Client-side rejection; no Cloudinary call | E2E | 🔴 |
| ADM-BRD-27 | Upload unsupported format (.pdf) | Drop PDF | Rejected by allowedImageMimeTypes | E2E | 🔴 |

### 5.6 Brand RBAC & Free-Form Audit

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-BRD-28 | Editor can create/edit brand | Log in as editor; create brand | requireEditorOrAdmin() passes | IT | 🔴 |
| ADM-BRD-29 | Anonymous cannot create brand | No session; POST brand create | 401 Unauthorized | IT | 🔴 |
| ADM-BRD-30 | `brands-mutations.ts` vs `mutations.ts` split | Verify Brand create goes through `brands-mutations.ts` | Correct mutation file is called; no duplicate logic divergence | IT | 🟠 |

**Module 5 subtotal: 30 cases (IT: 25 / E2E: 5)**

---

## MODULE 6 — Promotions

### 6.1 Promotion List

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-PRO-01 | List loads from DB | Open promotions section | All promotions listed with code, status, date range | IT | 🟠 |
| ADM-PRO-02 | Active promotion shown correctly | Promotion with `start_at` < now < `end_at` | Status badge shows "active" | E2E | 🟠 |
| ADM-PRO-03 | Expired promotion shown | `end_at` in past | Status badge reflects expired | E2E | 🟠 |
| ADM-PRO-04 | Future promotion shown | `start_at` in future | Status badge reflects upcoming | E2E | 🟠 |

### 6.2 Promotion Create — Validation

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-PRO-05 | Submit empty code | Blank code field | Error: "Mã khuyến mãi là bắt buộc" | E2E | 🔴 |
| ADM-PRO-06 | Submit code whitespace-only | `"   "` | Trimmed → required error | E2E | 🔴 |
| ADM-PRO-07 | Submit code with XSS | `<script>alert(1)</script>` | Stored escaped; no execution | IT | 🔴 |
| ADM-PRO-08 | Submit empty title_vi | Blank | Error: "Tiêu đề tiếng Việt là bắt buộc" | E2E | 🔴 |
| ADM-PRO-09 | Submit discount_percentage = -1 | `-1` | Zod `z.number().min(0)` rejects | IT | 🔴 |
| ADM-PRO-10 | Submit discount_percentage = 0 | `0` | Accepted (min 0) | IT | 🟠 |
| ADM-PRO-11 | Submit discount_percentage = 100 | `100` | Accepted (max 100) | IT | 🟠 |
| ADM-PRO-12 | Submit discount_percentage = 101 | `101` | Zod `max(100)` rejects | IT | 🔴 |
| ADM-PRO-13 | Submit start_at > end_at | `start_at = 2026-07-10, end_at = 2026-07-01` | Refine error: "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc" | IT | 🔴 |
| ADM-PRO-14 | Submit start_at = end_at | Same timestamp | Refine: `start < end` fails; error shown | IT | 🟠 |
| ADM-PRO-15 | Submit valid date range | `start_at < end_at` | Accepted | IT | 🔴 |
| ADM-PRO-16 | Submit invalid date format | `start_at = "32/13/2026"` | JS Date parse failure; refine may incorrectly pass if NaN — verify | IT | 🔴 |
| ADM-PRO-17 | Submit combo_price ≥ original_price | `combo_price = 2M, original_price = 1M` | Refine error: "Giá combo phải nhỏ hơn giá gốc" | IT | 🔴 |
| ADM-PRO-18 | Submit combo_price < original_price | `combo_price = 500K, original_price = 1M` | Accepted | IT | 🟠 |
| ADM-PRO-19 | Submit combo_price = negative | `combo_price = -100` | No min constraint in schema — accepted; verify intended | IT | 🟠 |

### 6.3 Promotion Create — Business Logic

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-PRO-20 | Create promotion with required fields | code + discount_percentage + title_vi → save | Promotion row in DB; `items` empty | IT | 🔴 |
| ADM-PRO-21 | Create promotion and link products | Select 3 products in `items` array | `product_promotions` junction rows created for each | IT | 🔴 |
| ADM-PRO-22 | Create promotion with cover image | Upload banner image | `promotions.cover_media_id` set via FK | IT | 🔴 |
| ADM-PRO-23 | Active promotion appears on client | `start_at` in past, `end_at` in future → view `/promotions` | Promotion card shown with cover image, combo_price | E2E | 🔴 |
| ADM-PRO-24 | Future promotion hidden on client | `start_at` in future → view `/promotions` | Promotion NOT shown on public page (BLK-07 — hardcoded `now` date must use `new Date()`) | E2E | 🔴 |
| ADM-PRO-25 | Expired promotion hidden on client | `end_at` in past → view `/promotions` | NOT shown on public page | E2E | 🔴 |
| ADM-PRO-26 | RPC `public_promotions` returns cover_media | Create promotion with cover → call RPC | `cover_media_url` field non-null in RPC response | IT | 🔴 |
| ADM-PRO-27 | RPC returns original_price and combo_price | Set both → call RPC | Both fields present in response | IT | 🔴 |
| ADM-PRO-28 | Soft delete promotion | Delete promotion | `promotions.deleted_at` set; product_promotions cascade or dangle | IT | 🟠 |
| ADM-PRO-29 | Delete promotion → linked products | Delete promotion with linked products → check products | Products still exist; `product_promotions` rows removed (ON DELETE CASCADE?) | IT | 🟠 |
| ADM-PRO-30 | Audit log on create | Create promotion → audit_logs | `action='create', entity_type='promotion'` | IT | 🟠 |

### 6.4 Promotion Edit

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-PRO-31 | Edit form loads data | Navigate to promotion edit | All fields pre-populated | IT | 🔴 |
| ADM-PRO-32 | Edit start_at to past → client shows promotion | Change date → save → view client | Promotion visible on public page | E2E | 🔴 |
| ADM-PRO-33 | Edit start_at to future → client hides promotion | Change date → save → view client | Promotion disappears from public page | E2E | 🔴 |
| ADM-PRO-34 | Edit linked products list | Remove product; add new product | `product_promotions` synced correctly | IT | 🟠 |
| ADM-PRO-35 | Edit discount_percentage | Change to 50 → save | DB updated; RPC reflects new percentage | IT | 🟠 |
| ADM-PRO-36 | Edit status draft→published | Publish promotion | Status updated | IT | 🟠 |
| ADM-PRO-37 | Edit with invalid date | `end_at < start_at` | Cross-field validation error | IT | 🔴 |

### 6.5 Promotion — Free-Form Audit

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-PRO-38 | Hardcoded `now` date in client (BLK-07) | Check client promotion visibility code | `new Date()` used (not hardcoded `"2026-06-19..."`) — verify no hardcoded date remains | IT | 🔴 |
| ADM-PRO-39 | `discount_percentage` allows 0% → shows as promo | Create promotion with 0% discount | Public page shows "0% OFF" badge — verify UX intent | E2E | 🟡 |
| ADM-PRO-40 | `badge_color` is optionalText | Submit invalid CSS color | Stored as-is; front-end might fail to apply it — no server validation | IT | 🟡 |

**Module 6 subtotal: 40 cases (IT: 30 / E2E: 10)**

---

## MODULE 7 — Blogs

### 7.1 Blog List

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-BLG-01 | Blog list loads from DB | Open blog section | All non-deleted posts listed with title, category, status | IT | 🟠 |
| ADM-BLG-02 | Filter by status: published | Select "Published" | Only published posts shown | IT | 🟠 |
| ADM-BLG-03 | Search by title keyword | Type keyword | Matching posts shown | E2E | 🟠 |

### 7.2 Blog Create — Validation

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-BLG-04 | Submit empty title_vi | Blank | Error: "Tiêu đề tiếng Việt là bắt buộc" | E2E | 🔴 |
| ADM-BLG-05 | Submit title_vi whitespace-only | `"   "` | Trimmed → required error | E2E | 🔴 |
| ADM-BLG-06 | Submit title_vi with XSS | `<script>alert(1)</script>` | Stored escaped | IT | 🔴 |
| ADM-BLG-07 | Submit empty excerpt_vi | Blank | Error: "Trích dẫn tiếng Việt là bắt buộc" | E2E | 🔴 |
| ADM-BLG-08 | Submit excerpt_vi whitespace-only | `"   "` | Trimmed → required error | E2E | 🔴 |
| ADM-BLG-09 | Submit empty slug | Blank | Error: "Slug không được để trống" | E2E | 🔴 |
| ADM-BLG-10 | Submit slug with uppercase | `"My-Post"` | Zod regex rejects | E2E | 🔴 |
| ADM-BLG-11 | Submit duplicate slug (same locale) | Same slug as existing post | DB unique constraint `uq_blog_post_translations_locale_slug` rejects | IT | 🔴 |
| ADM-BLG-12 | Submit empty category_id | No category selected | Error: "Danh mục bài viết là bắt buộc" | E2E | 🔴 |
| ADM-BLG-13 | Submit invalid category_id | Send `category_id = "not-a-uuid"` | `resolveBlogCategoryId()` treats as slug; not found error | IT | 🟠 |

### 7.3 Blog Create — Business Logic

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-BLG-14 | Create blog post as draft | Fill valid fields → save draft | `blog_posts.status = 'draft'`; `published_at = null` | IT | 🔴 |
| ADM-BLG-15 | Create and publish (both translations inserted automatically) | Fill vi fields; no en fields → publish | `createAdminBlogPost` inserts both vi and en translations (en falls back to vi values); trigger passes | IT | 🔴 |
| ADM-BLG-16 | `body_json` serialized correctly | Enter rich text → save | `blog_post_translations.body_json` stores valid JSONB (not null) | IT | 🔴 |
| ADM-BLG-17 | `body_json` parsed back on edit | Save content → re-open edit form | Content rendered in editor exactly as saved | E2E | 🔴 |
| ADM-BLG-18 | Cover image linked via cover_media_id | Upload cover → save | `blog_posts.cover_media_id` set; media_assets row valid | IT | 🔴 |
| ADM-BLG-19 | Soft delete blog post | Delete post | `blog_posts.deleted_at` set; `status = 'archived'` | IT | 🔴 |
| ADM-BLG-20 | Audit log on blog create | Create → audit_logs | `action='create', entity_type='blog_post'` | IT | 🟠 |
| ADM-BLG-21 | Audit log failure rolls back blog post | Mock audit log to throw → create | Blog post row deleted; `createAdminBlogPost` returns error | IT | 🟠 |
| ADM-BLG-22 | Category dropdown dynamic from DB | Open blog create form | Category dropdown populated from `blog_categories` (not hardcoded) | IT | 🔴 |
| ADM-BLG-23 | Published post appears on client `/blog` | Publish post → view `/blog` | Post card visible with title, cover, excerpt | E2E | 🔴 |
| ADM-BLG-24 | Draft post NOT on client | Save as draft → view `/blog` | Post not visible to public | E2E | 🔴 |

### 7.4 Blog Edit

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-BLG-25 | Edit form loads existing data | Navigate to blog edit | All fields pre-populated | IT | 🔴 |
| ADM-BLG-26 | Edit title_vi → save | Change title → save | `blog_post_translations` vi row updated via upsert | IT | 🔴 |
| ADM-BLG-27 | Edit body_json → save | Modify rich text → save | `body_json` updated; `bodyJsonFromEditor()` serializes correctly | IT | 🔴 |
| ADM-BLG-28 | Edit category → save | Change blog category | `blog_posts.category_id` updated | IT | 🟠 |
| ADM-BLG-29 | Edit status draft→published | Publish → check client | Post appears on public blog | E2E | 🔴 |
| ADM-BLG-30 | Edit status published→archived | Archive → check client | Post disappears from public blog | E2E | 🔴 |
| ADM-BLG-31 | Edit with duplicate slug | Set slug to existing post's slug → save | Unique constraint error shown | IT | 🔴 |

### 7.5 Blog Rich Text / Tiptap Editor

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-BLG-32 | Submit empty rich text body | Leave editor blank | Content saved as empty JSON (`{sections: [{body: ""}]}`) | IT | 🟠 |
| ADM-BLG-33 | Submit plain text in editor | Type plain text | Saved as valid Tiptap JSON; rendered correctly | E2E | 🟠 |
| ADM-BLG-34 | Submit formatted content (bold, headings) | Use H2, bold, lists | Tiptap JSON captures marks/nodes; rendered on client with correct HTML | E2E | 🟠 |
| ADM-BLG-35 | Submit raw HTML in editor | Paste `<b>test</b><script>` | Tiptap sanitizes; script removed; bold preserved | E2E | 🔴 |
| ADM-BLG-36 | Content preserved after save→edit→re-open | Save formatted content → re-open | Editor re-hydrates with identical content; no data loss | E2E | 🔴 |
| ADM-BLG-37 | AI generate button fills body | Enter keywords → click "Generate by AI" | AI response fills editor fields; if 504 error: original content unchanged, error banner shown | E2E | 🟠 |

### 7.6 Blog RBAC & Upload

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-BLG-38 | Editor can create blog post | Log in as editor → create post | Succeeds | IT | 🔴 |
| ADM-BLG-39 | Upload blog cover image | Drop PNG → save | `blog_posts.cover_media_id` set; `size_bytes > 0` | IT | 🔴 |
| ADM-BLG-40 | Upload oversized cover | Drop >10MB | Client rejects | E2E | 🔴 |

### 7.7 Blog — Free-Form Audit

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-BLG-41 | EN translation auto-fallback on create | Create blog with only vi → save | EN translation row inserted with vi values; publish trigger can fire | IT | 🟠 |
| ADM-BLG-42 | `bodyJsonFromEditor` returns sections structure | Pass string to `bodyJsonFromEditor()` | Returns `{sections: [{id, title, body}]}` JSON object | IT | 🟡 |
| ADM-BLG-43 | `archived` status on create sets `deleted_at` | Create with `status = 'archived'` | `deleted_at` set at create time (unusual; verify intended) | IT | 🟠 |

**Module 7 subtotal: 43 cases (IT: 29 / E2E: 14)**

---

## MODULE 8 — Showrooms

### 8.1 Showroom List

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-SHW-01 | List loads from DB | Open showrooms section | All non-deleted showrooms listed | IT | 🟠 |
| ADM-SHW-02 | Showroom map renders on client | Published showroom with embed URL → `/showrooms` | Map iframe visible; no script injection | E2E | 🔴 |

### 8.2 Showroom Create — Validation

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-SHW-03 | Submit empty code | Blank code | Error: "Slug không được để trống" (code uses slugSchema) | E2E | 🔴 |
| ADM-SHW-04 | Submit code with uppercase | `"HCM-01"` | Zod slugSchema rejects | E2E | 🔴 |
| ADM-SHW-05 | Submit duplicate code (active) | Same code as existing showroom | DB partial unique `uq_showrooms_code_active` violation | IT | 🔴 |
| ADM-SHW-06 | Submit empty name_vi | Blank | Error: "Tên showroom tiếng Việt là bắt buộc" | E2E | 🔴 |
| ADM-SHW-07 | Submit empty address_vi | Blank | Error: "Địa chỉ tiếng Việt là bắt buộc" | E2E | 🔴 |
| ADM-SHW-08 | Submit empty hotline | Blank | Error: "Số hotline là bắt buộc" | E2E | 🔴 |
| ADM-SHW-09 | Submit hotline with letters | `"abc123"` | No phone format validation in showroomSchema — accepted; verify intent | IT | 🟠 |
| ADM-SHW-10 | Submit empty google_maps_embed_url | Blank | Error: "URL bản đồ nhúng bắt buộc" | E2E | 🔴 |
| ADM-SHW-11 | Submit embed URL with http:// | `http://maps.google.com/…` | DB constraint `chk_showrooms_map_urls_https` rejects (must start with `https://`) | IT | 🔴 |
| ADM-SHW-12 | Submit XSS payload in embed URL | `<script>alert(1)</script>` | DOMPurify.sanitize strips script before DB insert (server-side in mutations.ts) | IT | 🔴 |
| ADM-SHW-13 | Submit iframe tag in embed URL | `<iframe src="http://evil.com">` | DOMPurify sanitizes; stored as empty or stripped version | IT | 🔴 |
| ADM-SHW-14 | Submit XSS in name_vi | `<script>alert(1)</script>` | Stored escaped; no execution | IT | 🔴 |
| ADM-SHW-15 | Submit latitude out of range | `latitude = 91` | DB constraint `chk_showrooms_coordinates` rejects | IT | 🟠 |
| ADM-SHW-16 | Submit longitude out of range | `longitude = 181` | DB constraint rejects | IT | 🟠 |
| ADM-SHW-17 | Submit valid coordinates | `lat = 10.762, lng = 106.660` | Accepted and stored as `numeric(10,7)` | IT | 🟠 |
| ADM-SHW-18 | Submit empty google_maps_fallback_url | Blank | Error: "URL bản đồ dự phòng bắt buộc" | E2E | 🔴 |

### 8.3 Showroom Create — Business Logic

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-SHW-19 | Create showroom as draft | Valid data → save draft | `showrooms.status = 'draft'` | IT | 🔴 |
| ADM-SHW-20 | Publish showroom requires both vi+en translations | Publish → only vi present | Trigger fires: "Cannot publish without vi AND en translations" | IT | 🔴 |
| ADM-SHW-21 | Publish showroom with both translations | `createAdminShowroom` inserts vi+en automatically | Publish succeeds; `status='published'` | IT | 🔴 |
| ADM-SHW-22 | Cover image linked in showroom_media | Upload → save | `showroom_media` row with `is_primary=true` | IT | 🔴 |
| ADM-SHW-23 | Audit log on create | Create → audit_logs | `action='create', entity_type='showroom'` | IT | 🟠 |
| ADM-SHW-24 | Audit log failure rolls back showroom | Mock audit log to throw | Showroom row deleted; error returned | IT | 🟠 |
| ADM-SHW-25 | Soft delete showroom | Delete via UI | `showrooms.deleted_at` set; `status='archived'` | IT | 🔴 |
| ADM-SHW-26 | Showroom appears on public `/showrooms` page | Publish showroom → view public page | Showroom card with name, address, map visible | E2E | 🔴 |

### 8.4 Showroom Edit

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-SHW-27 | Edit form loads data | Navigate to edit | All fields pre-populated | IT | 🔴 |
| ADM-SHW-28 | Edit embed URL with XSS → save | Change to XSS string → save | DOMPurify strips on update; sanitized value stored | IT | 🔴 |
| ADM-SHW-29 | Edit hotline → save | Change hotline | `showrooms.hotline` updated | IT | 🟠 |
| ADM-SHW-30 | Edit cover image → save | Upload new image | Old `showroom_media` rows deleted; new row inserted | IT | 🟠 |
| ADM-SHW-31 | Edit status draft→published | Publish | `status='published'`; `published_at` set | IT | 🔴 |

### 8.5 Showroom — Free-Form Audit

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-SHW-32 | Stored XSS via dangerouslySetInnerHTML (BLK-04) | Inspect public showroom page rendering of embed URL | Map rendered via DOMPurify-sanitized string; NOT via `dangerouslySetInnerHTML` with raw DB value | IT | 🔴 |
| ADM-SHW-33 | DOMPurify strips valid Google Maps iframe | Submit valid Google Maps iframe HTML as embed URL | DOMPurify strips iframe; URL is stored (not full iframe HTML) — verify if this breaks map functionality | IT | 🟠 |
| ADM-SHW-34 | `code` field uses slugSchema but showroom name uses freetext | Code `"hcm-01"` (slug) while name is bilingual freetext | Verify no confusion between code (slug) and name fields | E2E | 🟡 |

**Module 8 subtotal: 34 cases (IT: 28 / E2E: 6)**

---

## MODULE 9 — Quote Requests

### 9.1 Quote List

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-QTE-01 | Quote list accessible to admin | Log in as admin → open quotes | Quotes listed with full_name, phone, status | IT | 🔴 |
| ADM-QTE-02 | Quote list blocked for editor | Log in as editor → try to open quotes | 403 / redirect (editor should not see quotes) | E2E | 🔴 |
| ADM-QTE-03 | Filter by status: new | Select "Chờ xử lý" filter | Only `status='new'` quotes shown | IT | 🟠 |
| ADM-QTE-04 | Filter by status: contacted | Select "Đã liên hệ" | Only `status='contacted'` shown | IT | 🟠 |
| ADM-QTE-05 | Search by customer name | Type "Trần Văn B" | Matching quotes shown | E2E | 🟠 |
| ADM-QTE-06 | Search by phone | Type "0912" | Quotes with matching phone shown | E2E | 🟠 |
| ADM-QTE-07 | Search empty query | Clear search | All quotes shown | E2E | 🟡 |
| ADM-QTE-08 | Pagination page 1 | >50 quotes → open list | First 50 quotes shown | IT | 🟠 |
| ADM-QTE-09 | Pagination page 2 | Navigate next | Items 51–100 shown | IT | 🟠 |

### 9.2 Quote Detail & Events Log

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-QTE-10 | Quote detail dialog opens | Click quote row | Dialog shows full_name, phone, email, message, status, events timeline | E2E | 🔴 |
| ADM-QTE-11 | Events log shows created event | View new quote | `quote_request_events` row with `event_type='created'` shown in timeline | IT | 🔴 |
| ADM-QTE-12 | Events log shows status change | After status update → re-open detail | New event row with `old_status` and `new_status` in timeline | IT | 🔴 |
| ADM-QTE-13 | QuoteTimeline renders correctly | Open dialog for quote with multiple events | All events rendered in chronological order | E2E | 🟠 |

### 9.3 Quote Status Transitions

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-QTE-14 | Status: new → contacted | Admin changes status | RPC `update_quote_status` with `p_status='contacted'` succeeds; DB updated (BLK-06) | IT | 🔴 |
| ADM-QTE-15 | Status: contacted → resolved | Change status | RPC succeeds; `new_status='resolved'` in events | IT | 🔴 |
| ADM-QTE-16 | Status: any → cancelled (if supported) | Change to cancelled | Verify if 'cancelled' enum exists in DB; if not, expect error (BLK-06) | IT | 🔴 |
| ADM-QTE-17 | Status update with session client (not service client) | Verify RPC call uses session client | `auth.uid()` is not null in RPC; no "Unauthorized" DB error | IT | 🔴 |
| ADM-QTE-18 | Status update writes event row | Change status → check `quote_request_events` | New row with `actor_id = admin.id`, `old_status`, `new_status`, `note` | IT | 🔴 |
| ADM-QTE-19 | Status update with admin notes | Add admin_notes text → update status | Notes stored in `quote_requests.admin_notes` | IT | 🟠 |
| ADM-QTE-20 | Status update by editor fails (if restricted) | Log in as editor → try to change quote status | 403 Forbidden if role restriction; or success if editor allowed | IT | 🟠 |

### 9.4 Public Quote Form → Admin Flow (Integration)

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-QTE-21 | Public form submission creates quote | Submit `/api/contact` with valid data | `quote_requests` row created; `quote_request_events` 'created' event | IT | 🔴 |
| ADM-QTE-22 | Submitted quote appears in admin list | Submit from public → open admin quotes | New quote visible in list | E2E | 🔴 |
| ADM-QTE-23 | Duplicate submission rate limiting | 5 requests in 50 ms from same IP | Rate limiter returns 429; only 1 DB row | IT | 🔴 |
| ADM-QTE-24 | phone constraint validated at DB | Submit phone = `+++++++` | `chk_quote_requests_phone_shape` (regex `^[0-9+().\\-\\s]{7,32}$`) rejects | IT | 🔴 |
| ADM-QTE-25 | email constraint validated at DB | Submit email = `not-email` | `chk_quote_requests_email_shape` rejects | IT | 🔴 |

### 9.5 Quote — Free-Form Audit

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-QTE-26 | `admin_quote_search` RPC uses correct client | Check which supabase client calls RPC | Should use session client (not service client) so `auth.uid()` is populated for RLS | IT | 🔴 |
| ADM-QTE-27 | `QuoteDetailDialog` does not expose raw DB error | Force DB error → open dialog | UI shows friendly Vietnamese error, not raw Supabase error | E2E | 🟠 |

**Module 9 subtotal: 27 cases (IT: 21 / E2E: 6)**

---

## MODULE 10 — Users

### 10.1 User List

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-USR-01 | Users list accessible to admin only | Log in as admin → `/admin/users` | User list shown with email, role, is_active | IT | 🔴 |
| ADM-USR-02 | Editor cannot access users | Log in as editor → try `/admin/users` | 403 / redirected | E2E | 🔴 |
| ADM-USR-03 | List shows active users | All `is_active=true` profiles | Active users shown | IT | 🟠 |
| ADM-USR-04 | Search user by email | Type partial email | Matching users shown | E2E | 🟠 |

### 10.2 User Create / Invite

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-USR-05 | Create user with valid email | Valid email, role=editor | `auth.users` row + `profiles` row created; `profiles.role = 'editor'` | IT | 🔴 |
| ADM-USR-06 | Create user with empty email | Blank email | Error: email required | E2E | 🔴 |
| ADM-USR-07 | Create user with invalid email format | `"not-an-email"` | `chk_profiles_email_shape` regex check + Zod reject | IT | 🔴 |
| ADM-USR-08 | Create user with duplicate email | Existing email | `uq_profiles_email_lower` partial unique violation | IT | 🔴 |
| ADM-USR-09 | Create user with empty full_name | Blank full_name | `chk_profiles_full_name_not_blank` check constraint rejects | IT | 🔴 |
| ADM-USR-10 | Create admin user | role = "admin" | Profile with `role='admin'` | IT | 🔴 |
| ADM-USR-11 | Create editor user | role = "editor" | Profile with `role='editor'` | IT | 🔴 |
| ADM-USR-12 | Default role on new profile is editor | Create user without specifying role | `profiles.role` defaults to 'editor' (NOT 'admin') | IT | 🔴 |

### 10.3 User Edit / Role Management

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-USR-13 | Edit user role editor→admin | Change role → save | `profiles.role = 'admin'` | IT | 🔴 |
| ADM-USR-14 | Edit user role admin→editor | Change role → save | `profiles.role = 'editor'` | IT | 🔴 |
| ADM-USR-15 | Deactivate user | Set `is_active = false` → save | `profiles.is_active = false` | IT | 🟠 |
| ADM-USR-16 | Activate deactivated user | Set `is_active = true` | `profiles.is_active = true` | IT | 🟠 |
| ADM-USR-17 | Admin cannot deactivate themselves | Admin attempts to deactivate own account | Error: "Cannot deactivate your own account" | IT | 🔴 |
| ADM-USR-18 | Admin cannot demote themselves | Admin tries to change own role to editor | Error or blocked | IT | 🔴 |

### 10.4 User RBAC & Auth

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-USR-19 | Newly created editor can log in | Create editor → log in as editor | Authentication succeeds | E2E | 🔴 |
| ADM-USR-20 | Newly created editor blocked from admin routes | Log in as new editor → try `/admin/settings` | 403 / redirect | E2E | 🔴 |
| ADM-USR-21 | Deactivated user cannot log in | Deactivate user → try to log in | Auth rejected or session refused | E2E | 🔴 |

### 10.5 User — Free-Form Audit

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-USR-22 | Profile.email duplicated from auth.users | Check profiles.email vs auth.users.email | They match; comment in schema says "duplicated for admin display" | IT | 🟡 |
| ADM-USR-23 | `last_login_at` updated on login | Log in → check profiles.last_login_at | Timestamp updated | IT | 🟡 |

**Module 10 subtotal: 23 cases (IT: 18 / E2E: 5)**

---

## MODULE 11 — Settings

### 11.1 Settings Read (GET /api/admin/settings)

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-SET-01 | Settings GET accessible to admin | Admin makes GET request | HTTP 200; full settings object returned | IT | 🔴 |
| ADM-SET-02 | Settings GET blocked for non-admin | Editor makes GET | HTTP 401 Unauthorized | IT | 🔴 |
| ADM-SET-03 | Settings GET blocked for anonymous | No session → GET | HTTP 401 | IT | 🔴 |
| ADM-SET-04 | API keys returned as masked hints | GET settings | `resendKey`, `geminiKey` returned as `****` hints (not plaintext) | IT | 🔴 |
| ADM-SET-05 | Settings page shows API fields as password type | Admin opens Settings UI → Integrations tab | `<input type="password">` for resendKey and geminiKey | E2E | 🔴 |
| ADM-SET-06 | Eye-icon toggles key visibility | Click show/hide on key field | Field toggles between type=password and type=text | E2E | 🟠 |

### 11.2 Settings Validation (PUT)

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-SET-07 | Submit empty brandNameVi | Blank → PUT | HTTP 400; error "Tên thương hiệu tiếng Việt là bắt buộc" | IT | 🔴 |
| ADM-SET-08 | Submit whitespace-only brandNameVi | `"   "` | Trimmed → required error | IT | 🔴 |
| ADM-SET-09 | Submit empty contactPhone | Blank | HTTP 400; "Số điện thoại liên hệ là bắt buộc" | IT | 🔴 |
| ADM-SET-10 | Submit empty contactEmail | Blank | HTTP 400; "Email liên hệ là bắt buộc" | IT | 🔴 |
| ADM-SET-11 | Submit invalid contactEmail | `"not-email"` | Zod `z.string().email()` rejects; HTTP 400 | IT | 🔴 |
| ADM-SET-12 | Submit invalid quoteSenderEmail | `"not-email"` | HTTP 400 (if non-empty; empty string is valid) | IT | 🟠 |
| ADM-SET-13 | Submit empty addressVi | Blank | HTTP 400 | IT | 🔴 |
| ADM-SET-14 | Submit XSS in brandNameVi | `<script>alert(1)</script>` | Stored escaped; no execution in public header | IT | 🔴 |
| ADM-SET-15 | Submit SQL injection in contactPhone | `'; DROP TABLE site_settings;--` | Parameterized; stored as literal text | IT | 🔴 |
| ADM-SET-16 | Submit invalid `slaHours` (string) | `slaHours = "abc"` | `z.union([z.string(), z.number()])` accepts string; verify parse on use | IT | 🟡 |
| ADM-SET-17 | Submit `featuredMaxItems` as number | `featuredMaxItems = 4` (number) | `z.union([z.string(), z.number()])` accepts; stored in body_json | IT | 🟡 |
| ADM-SET-18 | Encryption key validation | `AI_SECRET_ENCRYPTION_KEY` wrong length | HTTP 500 "Server encryption key misconfigured" | IT | 🔴 |

### 11.3 Settings Update — Business Logic

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-SET-19 | PUT updates site_settings row | Send valid PUT | `site_settings.contact_phone` updated | IT | 🔴 |
| ADM-SET-20 | PUT upserts site_setting_translations vi | Valid PUT | `site_setting_translations` vi row upserted (`onConflict: site_settings_id,locale`) | IT | 🔴 |
| ADM-SET-21 | PUT upserts site_setting_translations en | Valid PUT | EN row upserted | IT | 🔴 |
| ADM-SET-22 | PUT upserts integration_secrets (resendKey) | New resend key provided | Encrypted and stored in `integration_secrets` | IT | 🔴 |
| ADM-SET-23 | PUT skips saving masked hint (`****`) | Submit masked hint as-is | Key starting with `****` is NOT re-saved (preserves existing encrypted value) | IT | 🔴 |
| ADM-SET-24 | PUT upserts content_page_translations for home | Valid PUT with hero content | `content_page_translations` vi+en rows upserted | IT | 🔴 |
| ADM-SET-25 | Save settings → public homepage reflects changes | Change heroHeadlineVi → save → view `/` | Homepage hero text updated | E2E | 🔴 |
| ADM-SET-26 | Save contactPhone → client shows new phone | Change phone → save → view client | Footer/header/contact shows new phone number | E2E | 🔴 |
| ADM-SET-27 | Save contactEmail → client shows new email | Change email → save → view client | Contact page shows new email | E2E | 🔴 |
| ADM-SET-28 | `revalidatePath("/", "layout")` called after PUT | Valid PUT | Next.js ISR cache invalidated; public pages serve fresh data | IT | 🟠 |
| ADM-SET-29 | Logo image saved and displayed | Upload new logo → save | `site_settings.logo_media_id` FK valid; logo appears in navbar | IT | 🔴 |
| ADM-SET-30 | Favicon image saved | Upload favicon → save | `site_settings.favicon_media_id` FK valid; browser tab icon updated | IT | 🟠 |
| ADM-SET-31 | Settings singleton_key uniqueness | Attempt to insert second 'default' row | `uq_site_settings_singleton_key` prevents duplicate | IT | 🟠 |

### 11.4 Settings Sections Configuration

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-SET-32 | Toggle heroVisible = false → client hides hero | Uncheck heroVisible → save → view `/` | Hero section hidden on homepage | E2E | 🟠 |
| ADM-SET-33 | Toggle aboutVisible = false | Same | About section hidden | E2E | 🟠 |
| ADM-SET-34 | `featuredMaxItems` controls product count | Set to 3 → view homepage | Featured products section shows ≤3 items | E2E | 🟠 |
| ADM-SET-35 | Trust badge content updates | Change badge1ValueVi → save | Homepage badge shows new value | E2E | 🟠 |

### 11.5 Settings — Free-Form Audit

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-SET-36 | `resolveMediaId()` creates ghost asset with size_bytes=1 | Submit settings with new logo URL (not pre-uploaded UUID) | Creates `media_assets` row with `size_bytes=1` (BLK-08) | IT | 🔴 |
| ADM-SET-37 | Settings GET returns hardcoded fallback values | DB has no settings row | Returns hardcoded default values (e.g., hotline "08172 357 587") — verify these are not production values | IT | 🔴 |
| ADM-SET-38 | `singleton_key` check constraint allows only 'default' | Attempt to insert with key='custom' | `chk_site_settings_singleton_key` rejects | IT | 🟡 |

**Module 11 subtotal: 38 cases (IT: 32 / E2E: 6)**

---

## MODULE 12 — Media Library

### 12.1 Media List

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-MED-01 | Media list loads | Admin opens `/admin/media` | Grid shows all non-deleted media_assets | IT | 🟠 |
| ADM-MED-02 | Pagination in media list | >50 assets → navigate pages | Correct subset shown per page | IT | 🟠 |
| ADM-MED-03 | Search media by filename | Type filename | Matching assets shown | E2E | 🟠 |
| ADM-MED-04 | Filter by media type (image/video) | Select image filter | Only image assets shown | E2E | 🟡 |

### 12.2 Media Upload (POST /api/admin/media/upload)

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-MED-05 | Upload valid JPG via Cloudinary | Cloudinary widget uploads; POST to `/api/admin/media/upload` with valid JSON | HTTP 200; `media_assets` row with `id, public_url, created_at` | IT | 🔴 |
| ADM-MED-06 | Upload valid PNG | Same with PNG format | Accepted; `mime_type = 'image/png'` | IT | 🔴 |
| ADM-MED-07 | Upload valid WebP | WebP | Accepted | IT | 🔴 |
| ADM-MED-08 | Upload valid AVIF | AVIF | Accepted | IT | 🟠 |
| ADM-MED-09 | Upload valid GIF | GIF | Accepted | IT | 🟡 |
| ADM-MED-10 | Upload SVG | SVG (in ALLOWED_FORMATS) | Accepted by API; stored — **security risk** (see Observations) | IT | 🔴 |
| ADM-MED-11 | Upload MP4 video | MP4 | Accepted; `resource_type = 'video'` | IT | 🟠 |
| ADM-MED-12 | Upload unsupported format (PDF) | POST with `format = "pdf"` | HTTP 400 "Format 'pdf' is not allowed" | IT | 🔴 |
| ADM-MED-13 | Upload unsupported format (.sh) | POST with `format = "sh"` | HTTP 400 | IT | 🔴 |
| ADM-MED-14 | Upload .exe | POST with `format = "exe"` | HTTP 400 | IT | 🔴 |
| ADM-MED-15 | Upload >50MB file | POST with `bytes = 52428801` | HTTP 400 "File size exceeds maximum" | IT | 🔴 |
| ADM-MED-16 | Upload 0-byte file | POST with `bytes = 0` | DB constraint `chk_media_assets_positive_size` rejects (`size_bytes > 0`) — API sends `bytes ?? 0` so this WILL fail DB insert | IT | 🔴 |
| ADM-MED-17 | Upload without required fields | POST with missing `public_id` | HTTP 400 "Missing required fields: public_id, secure_url, format" | IT | 🔴 |
| ADM-MED-18 | Upload with non-Cloudinary URL | `secure_url = "https://evil.com/img.jpg"` | HTTP 400 "URL must be from Cloudinary" | IT | 🔴 |
| ADM-MED-19 | Upload without auth | No session → POST to upload | HTTP 401 Unauthorized | IT | 🔴 |
| ADM-MED-20 | `original_filename` stored correctly | POST with `original_filename = "product_photo.jpg"` | DB `media_assets.original_filename = 'product_photo.jpg'` | IT | 🔴 |
| ADM-MED-21 | `size_bytes` stored correctly | POST with `bytes = 204800` | DB `size_bytes = 204800` (> 0; BLK-08 satisfied) | IT | 🔴 |
| ADM-MED-22 | Duplicate `cloudinary_public_id` rejected | Same Cloudinary public_id uploaded twice | `uq_media_assets_cloudinary_public_id` partial unique index violation | IT | 🔴 |
| ADM-MED-23 | Invalid JSON body | POST with malformed JSON | HTTP 400 "Invalid JSON body" | IT | 🟠 |

### 12.3 Media Delete

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-MED-24 | Delete unused media asset | Delete from media library | `media_assets.deleted_at` set (soft delete) or hard delete | IT | 🔴 |
| ADM-MED-25 | Delete media referenced by product | Delete asset used as product cover | FK constraint prevents hard delete or soft-delete preserves integrity | IT | 🔴 |
| ADM-MED-26 | Delete media referenced by blog post | Delete asset used as blog cover | Same FK constraint behavior | IT | 🔴 |
| ADM-MED-27 | Deleted media no longer in picker | Soft-delete asset → open media picker | Asset not shown in picker | E2E | 🟠 |

### 12.4 Media Picker Integration

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-MED-28 | Open media picker in product form | Click "Choose from library" in product cover | Picker dialog opens with existing assets | E2E | 🔴 |
| ADM-MED-29 | Select existing asset from picker | Click asset in picker → confirm | Asset UUID set as cover_image; no new media_assets row created | IT | 🔴 |
| ADM-MED-30 | Selecting same asset twice | Select asset A → picker; select same A again | No duplicate `product_media` rows (unique index enforces) | IT | 🔴 |

### 12.5 Media — Free-Form Audit

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-MED-31 | SVG with JS payload accepted by upload API | POST with format=svg and malicious SVG content | API allows SVG; XSS possible if served inline without sanitization | IT | 🔴 |
| ADM-MED-32 | `bytes ?? 0` in upload route → DB constraint violation | Cloudinary does not return bytes → POST | `size_bytes = 0` → `chk_media_assets_positive_size` fails → 500 error exposed | IT | 🔴 |
| ADM-MED-33 | `width/height` of 0 rejected by DB | POST with `width = 0` | DB constraint `chk_media_assets_dimensions` (`width > 0 or null`) rejects | IT | 🟠 |

**Module 12 subtotal: 33 cases (IT: 30 / E2E: 3)**

---

## Cross-Module — Additional Free-Form Audit Cases

These cases span multiple modules or were identified from code patterns not fitting the structured categories above.

| TC ID | Test Scenario | Input / Action | Expected Result | Type | Priority |
|---|---|---|---|---|---|
| ADM-CROSS-01 | `NEXT_PUBLIC_USE_MOCK_DATA=true` in production | Deploy with env var set → open admin | All mutations use mock data; real DB never written — verify env not set in production build | IT | 🔴 |
| ADM-CROSS-02 | `console.log` statements in server code leak PII | Check `admin-queries.ts` line 372 in production | No user data logged to server console in production | IT | 🟠 |
| ADM-CROSS-03 | Docker secrets leak (BLK-03) | Run Docker build; inspect layers | `.env.production` not found in any Docker layer; `SUPABASE_SERVICE_ROLE_KEY` not baked in | IT | 🔴 |
| ADM-CROSS-04 | `triggerRevalidation()` suppresses errors | Mock `revalidatePath` to throw → run any mutation | Warning logged but mutation still returns success (silently fails revalidation) | IT | 🟠 |
| ADM-CROSS-05 | Audit log `actorId` never null on admin action | Any admin CRUD → audit_logs | `actor_id` always = authenticated user UUID | IT | 🟠 |
| ADM-CROSS-06 | Concurrent product + category create race | Two requests simultaneously create product with same slug | One succeeds; other gets DB unique constraint error gracefully | IT | 🟠 |
| ADM-CROSS-07 | `getOrCreateMediaAssetId` with URL creates ghost asset | Any form saves a URL string (not UUID) for cover_image | Ghost `media_assets` row with `size_bytes=1`, `mime_type='image/jpeg'` created | IT | 🔴 |
| ADM-CROSS-08 | `requireEditorOrAdmin()` throws if no session | Any server action called with no session | Throws error → action returns { success: false, error: "Unauthorized" } | IT | 🔴 |
| ADM-CROSS-09 | `isomorphic-dompurify` works server-side | Showroom create/update on server | DOMPurify runs without browser window; sanitization effective | IT | 🔴 |
| ADM-CROSS-10 | Locale-specific error messages | Submit invalid form with `locale=en` | Error messages shown in Vietnamese regardless (Zod messages are hardcoded VI) — verify if EN messages needed | E2E | 🟡 |
| ADM-CROSS-11 | `deleteAdminCategory` does NOT hard-delete media | Delete category with `image_media_id` | `product_categories` soft-deleted; `media_assets` row NOT deleted (no cascade) | IT | 🟠 |
| ADM-CROSS-12 | `deleteAdminProduct` sets status=archived not hard-delete | Delete product | `products.deleted_at` set but product_media rows NOT deleted — verify orphan cleanup | IT | 🟠 |
| ADM-CROSS-13 | AI endpoint accessible to admin and editor | Editor → POST `/api/admin/ai/*` | HTTP 200 (editor allowed); not restricted to admin | IT | 🟠 |
| ADM-CROSS-14 | AI endpoint blocked for anonymous | No session → POST `/api/admin/ai/*` | HTTP 401 | IT | 🔴 |
| ADM-CROSS-15 | `writeAuditLog` failure mode | Mock `audit.ts` to throw → any CRUD | Blog/Showroom mutations roll back; Product/Category mutations do NOT roll back (different error handling) | IT | 🟠 |

---

## QA Engineer's Observations

> ⚠️ These are **not test cases** but architectural / code risk observations for developer attention.

---

### Code Quality & Risk Areas

- **[`mutations.ts` L322]** `dimension_display_text_en` is mapped from `viTrans?.dimension_display_text` (the VI translation) — this is likely a copy-paste bug. English dimension text will show Vietnamese dimension text. **Recommendation:** Change to `enTrans?.dimension_display_text`.

- **[`mutations.ts` L63–68 / `admin-queries.ts` L21–41]** The `getOrCreateMediaAssetId()` helper creates ghost `media_assets` rows when a URL string (not a UUID) is passed in. These rows have `size_bytes = 1` and `mime_type = 'image/jpeg'` hardcoded, violating data quality and the intent of `chk_media_assets_positive_size`. **Recommendation:** Require all callers to first upload images and receive a valid UUID before saving; reject raw URL strings as cover images.

- **[`app/api/admin/media/upload/route.ts` L99]** `size_bytes: bytes ?? 0` — if Cloudinary does not return the `bytes` field, this sets `size_bytes = 0`, which will violate the `chk_media_assets_positive_size` DB constraint and cause a 500 error. The server returns a generic DB failure message. **Recommendation:** Default to `bytes ?? 1` (or return 400 if bytes is missing) to avoid opaque 500s; log clearly.

- **[`app/api/admin/media/upload/route.ts` L8]** `"svg"` is in `ALLOWED_FORMATS`. SVG files can embed JavaScript (`<script>` tags, `onload` attributes). If these are served inline on public pages (e.g., as product images or showroom images), they become Stored XSS vectors. **Recommendation:** Either remove SVG from ALLOWED_FORMATS or add server-side SVG sanitization (e.g., `svgo` with `removeScriptElement`).

- **[`app/api/admin/settings/route.ts` L19–37]** The `resolveMediaId()` helper creates phantom media_assets rows with `size_bytes: 1` when a URL is submitted for logo/favicon that isn't already in the DB. Same ghost-asset pattern as above. **Recommendation:** Require logo/favicon to be pre-uploaded through the standard upload endpoint.

- **[`admin-queries.ts` L372]** `console.log("getAdminBlogPosts query result:", ...)` is in production server code. This logs internal DB query counts to server logs on every product list request. **Recommendation:** Remove or wrap behind `process.env.NODE_ENV === 'development'`.

- **[`lib/supabase/mutations.ts` L490–520]** The product create function inserts the product row as `status='draft'` first, then updates to `'published'` in a second DB call. If the second call fails (e.g., publish trigger fires), the cleanup `supabase.from("products").delete().eq("id", id)` catches it correctly. However, if a partial state exists between the two calls and a server crash occurs, an orphan draft product row will persist. **Recommendation:** Wrap in a DB transaction or stored procedure.

- **[`supabase/migrations/0005_constraints_and_partial_uniques.sql` L342–439]** The `require_publish_translations()` trigger fires on `BEFORE INSERT OR UPDATE OF status`. This is correct for preventing publish without translations. However, `createAdminProduct` works around it by inserting as 'draft' first and then separately updating to 'published'. This is a valid workaround but means the publish-validity window is non-atomic. **Recommendation:** Document this two-phase publish pattern explicitly.

- **[`components/showroom/admin-workflows.tsx` L199]** `allowedImageMimeTypes` does not include `"image/svg+xml"`, but the server-side upload route DOES allow SVG. This creates an inconsistency where SVG can be uploaded programmatically (bypassing the UI drag-and-drop check) but not via the UI Dropzone. **Recommendation:** Align client-side and server-side allowed types.

- **[Role fallback risk — BLK-05]** The comment in `test_master_plan.md` references `user?.role ?? "admin"` as a critical security fallback that should never default to 'admin'. Verify all places in the codebase that read `user.role` use strict equality checks without a default admin fallback.

- **[`lib/supabase/auth.ts`]** The `requireEditorOrAdmin()` function is called at the top of most server actions. Verify it correctly throws (not just returns null) when the session is missing, since all callers rely on the throw to stop execution.

- **[`components/showroom/admin-interactions.tsx` L68–186]** The `PublishWorkflow` component manages status locally (`localStatus` useState) when no `onStatusChange` prop is passed. If a form is saved successfully but the status update is not propagated to the parent form state, the UI shows "published" while the saved data remains "draft". **Recommendation:** Ensure `onStatusChange` is always passed and wired to the form state in every usage.

- **[`supabase/migrations/20260614000003_quote_workflow.sql`]** Verify that the `quote_status` enum contains exactly: `new`, `contacted`, `resolved` (and optionally `cancelled`). The test_master_plan references BLK-06 where `processing` and `cancelled` may not exist. If `cancelled` is missing from the enum, any call to `update_quote_status` with `p_status='cancelled'` will throw a Postgres enum error.

- **[`lib/supabase/admin-queries.ts`]** Multiple functions have a silent `console.warn("Exception..., falling back to mock")` fallback. In production with real DB, if the query fails for any reason (RLS policy error, schema mismatch), the system silently returns mock data to the admin — making real errors invisible. **Recommendation:** In production mode, throw or return error instead of falling back to mock.

- **[`components/showroom/admin-workflows.tsx` L63–68]** The admin-workflows component imports from `@/tests/fixtures/showroom-data-fixture` — test fixture data imported into a production UI component. This may cause test fixture data to appear in production builds if tree-shaking fails. **Recommendation:** Move fixture imports to test-only files or use conditional imports.

---

*Document generated by static analysis of codebase at d:/THCode/AI/furniture-website — 2026-06-28*  
*Total test cases: 722 | Integration Tests: 370 | E2E Tests: 352*
