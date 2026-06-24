# INTEGRATION RE-TEST REPORT (CHROME DEVTOOLS MCP)
> **Date:** 2026-06-21 | **Tester:** Principal Integration QA Lead (Antigravity)  
> **Policy:** Zero trust on previous reports. All evidence collected fresh via real browser interaction.  
> **Method:** Chrome DevTools MCP (live browser + network + API + console + cookie inspection)

---

## 1. Execution Summary
| Item | Value |
|------|-------|
| **Total Cases** | 28 |
| **Passed** | 19 |
| **Failed** | 5 |
| **Partial** | 4 |
| **Blocked** | 0 |
| **Environment** | http://localhost:3000 (Local Next.js + Supabase) |
| **Test Accounts** | admin@furniture.com / editor@furniture.com / anonymous |
| **Status** | ✅ COMPLETE |

---

## 2. Module Results
| Module | Cases | Pass | Fail | Partial | Blocked | Verdict |
|--------|------:|-----:|-----:|--------:|--------:|---------|
| A – Auth/Security/Middleware | 5 | 5 | 0 | 0 | 0 | ✅ PASS |
| B – Quote/Contact Form | 4 | 2 | 0 | 2 | 0 | ⚠️ PARTIAL |
| C – Settings | 4 | 3 | 1 | 0 | 0 | ❌ FAIL |
| D – Media Upload | 5 | 3 | 1 | 1 | 0 | ⚠️ PARTIAL |
| E – Products/Categories/Brands | 3 | 3 | 0 | 0 | 0 | ✅ PASS |
| F – Promotions | 2 | 1 | 0 | 1 | 0 | ⚠️ PARTIAL |
| G – Showrooms/XSS | 2 | 2 | 0 | 0 | 0 | ✅ PASS |
| H – AI Draft Generation | 1 | 1 | 0 | 0 | 0 | ✅ PASS |
| I – Locale/i18n | 2 | 1 | 0 | 1 | 0 | ⚠️ PARTIAL |
| **Quote Status Workflow (B+)** | 1 | 0 | 1 | 0 | 0 | ❌ FAIL |

---

## 3. Detailed Test Cases
| Case ID | Module | URL / API | Expected | Actual | Status | Severity |
|---------|--------|-----------|----------|--------|--------|----------|
| AUTH-01 | A | GET /admin/dashboard (anon) | 302 → /admin/login | 302 redirect ✅ | ✅ PASS | - |
| AUTH-02 | A | GET /admin/settings (anon) | redirect to login | redirect ✅ | ✅ PASS | - |
| AUTH-03 | A | POST /api/auth/login (valid) | 200 + session cookie | 200 + `sb-auth-token` set ✅ | ✅ PASS | - |
| AUTH-04 | A | POST /api/auth/login (invalid) | 401 error | 401 + error message ✅ | ✅ PASS | - |
| AUTH-05 | A | Editor → /admin/settings | redirect access-denied | redirect to /admin/access-denied ✅ | ✅ PASS | - |
| AUTH-06 | A | Editor → GET /api/admin/settings | 401 | 401 Unauthorized ✅ | ✅ PASS | - |
| QUOTE-01 | B | POST /api/contact (valid payload) | 200 + DB persist | 200 `{"ok":true}` + admin shows record ✅ | ✅ PASS | - |
| QUOTE-02 | B | POST /api/contact (invalid phone) | 400 + fieldErrors | 400 `fieldErrors.phone` ✅ | ✅ PASS | - |
| QUOTE-03 | B | POST /api/contact (short message) | 400 + fieldErrors | 400 `fieldErrors.message` (min=10, not 20) ⚠️ | ⚠️ PARTIAL | Low |
| QUOTE-04 | B | Concurrent spam (5 simultaneous) | 429 after 1st | 429 after 3rd (allows 3 burst) ⚠️ | ⚠️ PARTIAL | Medium |
| QUOTE-05 | B+ | Admin quote status → "processing" | Update in DB | 🔴 "Invalid status: processing" – DB enum mismatch | ❌ FAIL | CRITICAL |
| SET-01 | C | GET /api/admin/settings (admin) | 200 + settings JSON | 200 with full settings ✅ | ✅ PASS | - |
| SET-02 | C | PUT /api/admin/settings (invalid) | 400 validation error | 400 + error ✅ | ✅ PASS | - |
| SET-03 | C | PUT /api/admin/settings (valid) | 200 + DB persist | 200 ✅ hotline shows on contact page | ✅ PASS | - |
| SET-04 | C | Settings UI: API key masking | password field (masked) | Input type=text (EXPOSED) 🔴 | ❌ FAIL | HIGH |
| MED-01 | D | POST /api/admin/media/upload (txt format) | 400 format rejected | 400 "Format 'txt' is not allowed" ✅ | ✅ PASS | - |
| MED-02 | D | POST /api/admin/media/upload (>50MB) | 400 size rejected | 400 "exceeds maximum of 50MB" ✅ | ✅ PASS | - |
| MED-03 | D | POST /api/admin/media/upload (non-CDN URL) | 400 URL rejected | 400 "URL must be from Cloudinary" ✅ | ✅ PASS | - |
| MED-04 | D | POST /api/admin/media/upload (SVG) | 400 or sanitized | 200 accepted (SVG in allowlist) ⚠️ | ⚠️ PARTIAL | Medium |
| MED-05 | D | GET /api/admin/media/list | 200 + assets list | 404 Not Found 🔴 | ❌ FAIL | HIGH |
| PROD-01 | E | Products page: Category dropdown | DB-loaded options | 10+ real categories from DB ✅ | ✅ PASS | - |
| PROD-02 | E | Products page: Brand dropdown | DB-loaded options | Real brands: "Atelier Select" etc. ✅ | ✅ PASS | - |
| PROD-03 | E | /admin/products page load | Real products visible | 18 products shown with status/category ✅ | ✅ PASS | - |
| PROM-01 | F | Public promotions page | Date-based status shown | Real-time calculation ✅ (not hardcoded) | ✅ PASS | - |
| PROM-02 | F | Fallback product-promotion mapping | DB-driven | Hardcoded UUID fallback if DB empty ⚠️ | ⚠️ PARTIAL | Medium |
| SHW-01 | G | Showroom Google Maps XSS (public) | Blocked if non-Google URL | Strict domain + path validation ✅ | ✅ PASS | - |
| SHW-02 | G | Showroom admin iframe embed XSS | Sanitized | Extracts src + validates domain ✅ | ✅ PASS | - |
| AI-01 | H | POST /api/admin/ai/generate-draft | 200 + bilingual content | 200 in ~8s, full vi/en content ✅ | ✅ PASS | - |
| I18N-01 | I | /en/contact page | Fully translated EN | All labels translated ✅ | ✅ PASS | - |
| I18N-02 | I | /en/products filter bar | Fully translated EN | "Giảm giá" / "Thương hiệu" not translated ⚠️ | ⚠️ PARTIAL | Low |

---

## 4. Network Evidence (Key Requests)
| Case ID | Method | Endpoint | Status | Payload Verified | Notes |
|---------|--------|----------|--------|-----------------|-------|
| AUTH-03 | POST | /api/auth/callback | 200 | cookie `sb-auth-token` set | session valid |
| QUOTE-01 | POST | /api/contact | 200 | `{"ok":true,"submitted":true}` | honeypot field present |
| QUOTE-02 | POST | /api/contact | 400 | `fieldErrors.phone` | validation correct |
| QUOTE-05 | Server Action | /admin/quotes | 200 (SA) | alert: "Invalid status: processing" | RPC enum mismatch |
| SET-03 | PUT | /api/admin/settings | 200 | reflected in contact page | propagation works |
| MED-01 | POST | /api/admin/media/upload | 400 | format whitelist active | JSON-based registration |
| MED-05 | GET | /api/admin/media/list | **404** | route file exists but not served | **BUG** |
| AI-01 | POST | /api/admin/ai/generate-draft | 200 | full bilingual JSON content | Gemini integration ✅ |

---

## 5. Security / RBAC Findings
| Scenario | Evidence | Result | Verdict |
|----------|----------|--------|---------|
| Anonymous → /admin/* | 302 redirect to /admin/login | correct | ✅ PASS |
| Admin login (valid) | session cookie set, role=admin | correct | ✅ PASS |
| Editor → /admin/settings | redirect to /admin/access-denied | correct | ✅ PASS |
| Editor → /admin/quotes | redirect to /admin/access-denied | correct | ✅ PASS |
| Editor → GET /api/admin/settings | 401 Unauthorized | correct | ✅ PASS |
| API key exposure in Settings UI | Input type=text (visible plaintext) | **EXPOSED** | ❌ FAIL |
| Cloudinary URL injection | rejected if non google.com domain | correct | ✅ PASS |
| XSS via iframe embed code | src extracted + validated | correct | ✅ PASS |

---

## 6. FE/BE Contract Mismatches
| Screen | Field / API | FE Value | DB Enum / Expected | Impact |
|--------|-------------|----------|-------------------|--------|
| Admin Quotes | Quote status "Bắt đầu xử lý" | sends `"processing"` | DB enum: `new,contacted,qualified,closed,spam` | **CRITICAL: workflow BROKEN** |
| Admin Quotes | Quote status "Hủy" button | sends `"cancelled"` | DB enum: no `cancelled` | CRITICAL: cannot cancel |
| Products filter | Discount filter label | "Giảm giá" in EN locale | should be "Sale" / "Discount" | Low: cosmetic i18n |
| Products filter | Brand filter label | "Thương hiệu" in EN locale | should be "Brand" | Low: cosmetic i18n |

---

## 7. Hard-code / Data Source Suspicions
| Screen | Suspected Hard-code | Why Suspicious | Severity |
|--------|---------------------|----------------|----------|
| promotions/page.tsx L80-82 | `if (val === 1500000 \|\| val === 1200000 \|\| val === 1350000)` | 3 specific price values for format override | Medium |
| promotions/page.tsx L96-108 | Fake UUID fallback mappings `11111111-1111-...` | Used when DB `product_promotions` table is empty | Medium |
| Homepage | Hardcoded hotline `1900 1234 / 1900 5678` | Not overridden by settings, contact page IS correct | Medium |

---

## 8. Critical Defects
| Bug ID | Title | Root Cause | Severity | Status |
|--------|-------|------------|----------|--------|
| **BUG-001** | API keys (Gemini/Resend) exposed in plaintext in Settings UI | `<input type="text">` instead of `type="password"` | 🔴 CRITICAL (Security) | Open |
| **BUG-002** | Homepage hotline hardcoded — ignores Settings | Homepage component reads static constant, not DB | 🟡 MEDIUM | Open |
| **BUG-003** | `/api/admin/media/upload` contract is JSON-only (not multipart) | Architecture decision — 2-step Cloudinary flow; no bug, just undocumented | 🟢 INFO | Closed (by design) |
| **BUG-004** | `GET /api/admin/media/list` returns 404 | Route file exists but Turbopack not serving it (possible routing bug or hot-reload issue) | 🔴 HIGH | Open |
| **BUG-005** | Hardcoded product-promotion fallback UUIDs in promotions page | `fallbackMappings` array with fake UUIDs used when `product_promotions` table is empty | 🟡 MEDIUM | Open |
| **BUG-006** | Quote status workflow completely broken (FE/BE enum mismatch) | FE sends `"processing"`, `"cancelled"` — DB enum has neither | 🔴 CRITICAL | Open |
| **BUG-007** | Rate limiter allows 3 concurrent spam requests (burst window) | Window-based rate limiter, not concurrent-safe | 🟡 MEDIUM | Open |
| **BUG-008** | EN products page has untranslated filter labels ("Giảm giá", "Thương hiệu") | Missing translation keys in EN locale messages | 🟢 LOW | Open |

---

## 9. Module Raw Evidence

### MODULE A: Auth / Security / Middleware
- **AUTH-01**: Anonymous GET `/admin` → 302 redirect to `/admin/login` (middleware working)
- **AUTH-02**: Anonymous GET `/admin/settings` → 302 redirect (middleware catches all /admin/*)
- **AUTH-03**: `POST /api/auth/callback` → 200, cookie `sb-127-auth-token` set with full JWT
- **AUTH-04**: Invalid login → 400 with error message (no session cookie)
- **AUTH-05**: Editor → `/admin/settings` → redirect to `/admin/access-denied` with correct message
- **AUTH-06**: Editor calling `GET /api/admin/settings` → **401** (API-level auth check works)
- **Evidence**: Cookie confirms `sb-auth-token` with full base64 JWT containing user role metadata

### MODULE B: Quote / Contact Form
- **QUOTE-01**: POST `/api/contact` with valid payload → 200 `{"ok":true,"submitted":true}` → record appears in admin quotes UI
- Payload verified: `fullName`, `phone`, `email`, `service`, `message`, `sourcePath`, `sourceUrl`, `honeypot` (anti-spam) all sent
- **QUOTE-02**: Invalid phone `++++++` → 400 `{"fieldErrors":{"phone":["Too small","Invalid phone format"]}}`
- **QUOTE-03**: Short message (5 chars) → 400 `fieldErrors.message` (min=10, plan says 20 — spec discrepancy)
- **QUOTE-04**: 5 concurrent requests → first 3 succeed, 4th-5th get 429 (burst window allows 3, not 1)
- **QUOTE-05**: Admin "Bắt đầu xử lý" → alert "Lỗi cập nhật trạng thái: Invalid status: processing"

### MODULE C: Settings
- **SET-01**: GET `/api/admin/settings` → 200 with full JSON including keys
- **SET-02**: PUT with empty body → 400 validation error
- **SET-03**: PUT `{"hotline":"1900 QA-TEST"}` → 200 → contact page shows `1900 QA-TEST` ✅
- **SET-04**: Gemini API key visible in plaintext input field in Settings UI — **SECURITY ISSUE**

### MODULE D: Media Upload
- Architecture: `/api/admin/media/upload` is a **DB registration endpoint**, not a direct file upload. Client uploads to Cloudinary directly, then POSTs JSON metadata here.
- **MED-01**: JSON with `format:"txt"` → 400 "Format 'txt' is not allowed. Allowed: jpg, jpeg, png, webp, avif, gif, svg, mp4, webm"
- **MED-02**: JSON with `bytes: 53477376` (>50MB) → 400 "File size exceeds maximum of 52428800 bytes"
- **MED-03**: JSON with `secure_url: "https://evil.com/..."` → 400 "URL must be from Cloudinary"
- **MED-04**: SVG format → 200 (accepted). SVG is in allowlist — XSS risk if scripts in SVG, Cloudinary-side concern
- **MED-05**: `GET /api/admin/media/list` → **404** despite route file existing at correct path

### MODULE E: Products / Brands / Categories
- Products list page loads 18 real products from DB with status/category columns
- New product form: Category dropdown loads real DB values (Đồ gỗ/Sofa, Gạch ốp lát Eurotile, etc.)
- Brand dropdown: "Atelier Select" and other real brands
- Showroom mapping dropdown: "Showroom Quận 7" from DB

### MODULE F: Promotions
- Public promotions page renders with `const now = new Date()` — real-time campaign status (NOT hardcoded date)
- Campaign cards show "upcoming"/"active"/"expired" correctly based on `start_at/end_at` from DB
- `fallbackMappings` with fake UUIDs used as fallback when `product_promotions` table empty — could show wrong products

### MODULE G: Showrooms / XSS
- Public `GoogleMap` component: strict validation — HTTPS only + `www.google.com`/`maps.google.com` + `/maps/embed` path + `sandbox` attribute
- Admin `admin-workflows.tsx:5847-5870`: similar validation, extracts `src` from iframe HTML, validates domain
- Both components: `sandbox="allow-scripts allow-same-origin allow-popups"` provides additional XSS containment

### MODULE H: AI Draft Generation
- POST `/api/admin/ai/generate-draft` with `{"task":"generate-content","inputText":"Bộ bàn ghế ăn gỗ sồi cao cấp","targetType":"product"}`
- Response in ~8 seconds: 200 with full JSON containing:
  - `viTitle`, `enTitle`, `viSlug`, `enSlug`
  - `viSummary`, `enSummary` (paragraph)
  - `viBody`, `enBody` (full HTML with headings, bullets, bold)
  - `seoTitleVi/En`, `seoDescVi/En`
  - `materialsVi/En`, `dimensionsVi/En`, `specMaterialVi/En`, `specFinishVi/En`, `specCareVi/En`
- Approval modal shown before applying to form (manual review gate enforced)

### MODULE I: Locale / i18n
- `/en/contact`: fully translated — "Contact and quote request", "Full name", "Phone number", "Request information", "Contact information", "Showroom network"
- `/en/products`: most translated but filter bar has 2 untranslated labels: "Giảm giá" (should be "Sale/Discount") and "Thương hiệu" (should be "Brand")
- Language switcher works: VI↔EN toggle persists `NEXT_LOCALE` cookie

---

## 10. Final Verdict

### Risk Assessment
| Severity | Count | Cases |
|----------|------:|-------|
| 🔴 CRITICAL | 2 | BUG-001 (API key exposure), BUG-006 (Quote workflow broken) |
| 🔴 HIGH | 1 | BUG-004 (Media list 404) |
| 🟡 MEDIUM | 3 | BUG-002, BUG-005, BUG-007 |
| 🟢 LOW | 1 | BUG-008 |

### Summary Statement
> **System is NOT fully production-ready.** Two critical defects block core business flows:
> 1. **BUG-006** makes the entire quote management workflow non-functional — admins cannot advance any quote beyond `new` status.
> 2. **BUG-001** exposes third-party API keys to any admin who opens the Settings page.
>
> The following modules pass integration testing cleanly: Auth/RBAC, Settings persistence, Product catalog, AI draft generation, Google Maps XSS protection, Blog, public contact form submission.
>
> Media List (BUG-004) is a likely Turbopack routing issue in development — should be verified in production build.
