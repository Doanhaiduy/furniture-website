# MASTER FIX INDEX — Re-audit Độc Lập & Fix Priority

**Role**: Chief Audit Validator + Systems Reconciliation Lead + Release Prioritization Architect  
**Date**: 2026-06-19  
**Input**: 7 audit reports (api, admin, client, media, database, security, validation)  
**Method**: Cross-file skeptical reconciliation — root cause priority, deduplication, domino mapping

---

## A. Re-audit Verdict by File

| File | Confidence | Major truths (HIGH evidence) | Suspect claims | Final verdict |
|---|---|---|---|---|
| **api_audit_report** | HIGH | BUG#1 brand filter broken (3-layer mismatch); BUG#2 `original_filename` missing; BUG#3 `update_quote_status` always Unauthorized; BUG#4 ghost media_assets; BUG#5 no quote_request_events insert. All line-referenced. | BUG#6 openaiKey alias — LOW impact, naming only; BUG#10 hardcode slaHours — cosmetic | **VALID. Root causes xác định tốt. Không overstate.** |
| **admin_audit_report** | MEDIUM-HIGH | Dropdown hardcode product form; Brand text-input thay vì FK select; Settings ghost media asset (corroborated api+media). | Media verdict "READY" mâu thuẫn với api+media audit: media upload là BROKEN. "UI 75%" — số ước tính, không metric. | **UI/UX correct. Media bị understate severity — nên là BROKEN.** |
| **client_audit_report** | HIGH | `now = new Date("2026-06-19...")` hardcode; hotline 1800 6089 hardcode; contact page hardcode; homepage không consume content_pages; fetch limit:1000 per page. | Blog CTA missing, wishlist/comparison — FEATURE GAPS không phải BUGS. Taxonomy filter "always 0" — needs data verification. | **VALID. 5 blockers real. Feature gaps đúng nhưng thấp priority.** |
| **database_audit_report** | HIGH | `update_quote_status` invalid enum values; ghost table `product_attributes` trong old RPCs; overloaded `public_products` signatures; `assigned_to` type drift (migration-order dependent). | 3 audit trail tables — DESIGN DRIFT không BROKEN nếu FE chỉ dùng 1. Seed trong migration — anti-pattern không blocking. | **VALID. Critical #1-4 production blockers. Migration hygiene đúng nhưng không actionable ngay.** |
| **media_audit_report** | HIGH | `product_media` zero inserts (grep evidence); `original_filename` insert fails (corroborated api+db); `getOrCreateMediaAssetId` violates size_bytes>0 constraint; `ImageUploadDropzone` drops mediaId. | Blog inline images "MISSING" — verify if block editor hidden. Brand logo "UNKNOWN" — honest assessment. | **VALID. Báo cáo chi tiết nhất về root causes. Severity đúng.** |
| **security_audit_report** | HIGH for B01+B02, MEDIUM for B03 | B01: middleware.ts missing; B02: `user?.role ?? "admin"` fallback — trivially provable; B03: .env.production not in .dockerignore. | XSS R01 — MEDIUM: cần admin bị compromise trước. Rate limiting — LOW for showroom scale. | **VALID. B01+B02 là CRITICAL blockers đúng. B03 important nhưng không runtime breaking.** |
| **validation_audit_report** | HIGH overall | Settings form: zero validation + alert(); Brand/Promotion: zero FE+BE validation; Promotions start_at/end_at hardcode null (corroborated client audit); AdminField no error slot. | Score "45/100" — unverifiable number. Taxonomy filter "always 0" — MEDIUM, data-dependent. | **VALID. Key insight: promotions no date → client NOW hardcode = same root cause chain.** |

### Cross-file contradictions resolved

| Contradiction | File A | File B | Resolution |
|---|---|---|---|
| Media verdict | admin: Media = READY | media: Media Library = BROKEN | **media_audit đúng** — admin không audit DB persistence layer |
| Quote audit trail | api: /api/contact không insert events | db: quote_request_events bảng tốt nhất | **Cả hai đúng** — /api/contact là BUG, submit_quote_request RPC là UNUSED |
| Brand FK | admin: Brand là text tự do | validation: brandSchema có uuid() nhưng không được gọi | **Cùng root cause** — form không bind về brands table |
| Promotions date | validation: start_at hardcode null | client: now hardcode 2026-06-19 | **Root cause chain** — admin không set date → client hardcode để compensate |

---

## B. Canonical Issue List

> 35 issues sau deduplication. Issues trùng root cause được gộp thành 1 canonical issue.

| # | Canonical issue | Root cause | Affected files | Priority | Confidence |
|---|---|---|---|---|---|
| **C01** | `POST /api/admin/media/upload` fail do `original_filename` column không tồn tại trong `media_assets` | DB schema/API contract mismatch | api, media, database | CRITICAL | HIGH |
| **C02** | Product images không hiển thị trên client — không có INSERT vào `product_media` junction table | Admin save function bỏ qua junction table | media, api, admin | CRITICAL | HIGH |
| **C03** | `getOrCreateMediaAssetId` tạo ghost `media_assets` row với `size_bytes:0` vi phạm DB constraint | Anti-pattern: resolve URL→ID qua fake insert | api, media, admin, validation | CRITICAL | HIGH |
| **C04** | `ImageUploadDropzone` wrapper drops `mediaId` — entity forms chỉ nhận URL string, không có UUID | Component API design flaw | media, validation | CRITICAL | HIGH |
| **C05** | Next.js middleware không chạy — `proxy.ts` không được import như `middleware.ts` | Naming/wiring error | security | CRITICAL | HIGH |
| **C06** | Dynamic admin route `user?.role ?? "admin"` — anonymous user được treat như admin | Default value bug | security | CRITICAL | HIGH |
| **C07** | `update_quote_status` RPC luôn fail — service_role client → `auth.uid()=null` → RPC trả Unauthorized | Service role vs session client misuse | api, database | CRITICAL | HIGH |
| **C08** | `update_quote_status` RPC chứa enum values không tồn tại (`processing`, `cancelled`) | RPC enum mismatch với DB enum type | database | CRITICAL | HIGH |
| **C09** | Brand filter product listing luôn trả 0 — 3-layer mismatch: FE brandId (uuid) → RPC no p_brand_slug → data no brand_id → client filter fail | API contract + FE filter mismatch | api, client | CRITICAL | HIGH |
| **C10** | `now = new Date("2026-06-19T10:08:08+07:00")` hardcode — campaign status sai sau ngày này | Copy-paste bug | client | CRITICAL | HIGH |
| **C11** | Contact page + product detail hardcode hotline/email sai (khác siteSettings) | FE không đọc siteSettings | client | CRITICAL | HIGH |
| **C12** | Homepage không consume `content_pages` key "home" từ DB — admin CMS edits vô hiệu | Missing getContentPage() call | client, admin | HIGH | HIGH |
| **C13** | `public_products` RPC overload conflict — 0008 typed signature vẫn active cùng 20260618 text signature → PGRST203 risk | Migration không drop đủ old signatures | database, api | HIGH | HIGH |
| **C14** | `public_promotions` RPC thiếu `cover_media`, `combo_price`, `original_price` | RPC không update sau schema thêm columns | database, api, media, client | HIGH | HIGH |
| **C15** | Admin product form: category dropdown hardcode 3 static values, brand là text tự do | Hardcode instead of dynamic fetch | admin, validation | HIGH | HIGH |
| **C16** | `PUT /api/admin/settings` không có Zod validation — 50+ fields raw | Missing validation layer | api, validation | HIGH | HIGH |
| **C17** | `/api/contact` không insert `quote_request_events` — audit trail trống | Missing DB write | api, database | HIGH | HIGH |
| **C18** | `.env.production` không trong `.dockerignore` — production secrets vào Docker image | Missing exclusion rule | security | HIGH | HIGH |
| **C19** | Promotion form: `start_at`/`end_at` hardcode `null` — admin không set được ngày campaign | Form state không bind date picker | validation, admin, client | HIGH | HIGH |
| **C20** | `getAdminProducts` query thiếu brand_id, dimensions, primary_media → hardcoded null | Incomplete SELECT query | api, admin, media | HIGH | HIGH |
| **C21** | XSS trong admin showroom maps embed — `dangerouslySetInnerHTML` từ DB field không sanitize | Missing DOMPurify or component replacement | security, admin | MEDIUM | HIGH |
| **C22** | Settings response trả `openaiKey` = giá trị `gemini_api_key` — alias naming bug | String key collision | api | MEDIUM | HIGH |
| **C23** | Admin mock fallback masking DB errors — catch → fallback mock, admin không biết | Silent failure anti-pattern | api | MEDIUM | HIGH |
| **C24** | Brand/Promotion forms: zero FE + zero BE validation | Schema tồn tại nhưng không được gọi | validation, admin | MEDIUM | HIGH |
| **C25** | Fetch `limit:1000` products trong layout.tsx cho mọi page request | Over-fetching | client | MEDIUM | HIGH |
| **C26** | `quote_requests.assigned_to` type drift — uuid vs text depends on migration order | Migration run order dependency | database | MEDIUM | MEDIUM |
| **C27** | 3 bảng audit trail trùng mục đích: `quote_request_events`, `quote_status_history`, `quote_status_logs` | Schema drift | database | MEDIUM | HIGH |
| **C28** | Media library: không có delete, pagination, search | Feature gaps | media, admin, api | MEDIUM | HIGH |
| **C29** | `RemoteImage` component dùng `<img>` thay vì Next.js `<Image>` — mất LCP optimization | Performance gap | client | MEDIUM | HIGH |
| **C30** | Blog category tags không filterable — visual affordance broken | Missing filter logic | client, validation | MEDIUM | HIGH |
| **C31** | Social links footer hardcode | Missing siteSettings field | client | MEDIUM | MEDIUM |
| **C32** | Admin form `AdminField` không có error slot — inline errors không thể hiện | Component design gap | validation | MEDIUM | HIGH |
| **C33** | Trust badges hardcode trong constants | Missing siteSettings field | client, admin | LOW | HIGH |
| **C34** | `DELETE /api/admin/users/:id` và `DELETE /api/admin/media/:id` không tồn tại | Missing endpoints | api, admin | MEDIUM | HIGH |
| **C35** | User create form điền sẵn thông tin demo (name/email defaults) | UX defect | admin, validation | MEDIUM | HIGH |

---

## C. Fix Index

| Order | Fix item | Solves issues | Dependency | Merges/removes |
|---|---|---|---|---|
| **1** | Add `original_filename` column to `media_assets` OR remove from upload route | C01 | None | Unblocks C02, C28 |
| **2** | Fix `ImageUploadDropzone` to propagate `mediaId` through onChange | C04 | C01 deployed | Unblocks C02, C03 |
| **3** | Remove `getOrCreateMediaAssetId` anti-pattern — require proper upload flow | C03 | C01, C02 done | C03 closes |
| **4** | Add INSERT into `product_media` in product create/update | C02 | C01, C04 fixed | C02, C20 partial |
| **5** | Create `middleware.ts` that imports proxy function | C05 | None | Deploy with C06 |
| **6** | Fix `user?.role ?? "admin"` → redirect unauthenticated users | C06 | C05 deployed | C06 |
| **7** | Fix `update_quote_status` caller: use session client OR actor_id param | C07 | None | C07 |
| **8** | Fix `update_quote_status` RPC enum: remove 'processing','cancelled' | C08 | C07 in progress | C08 |
| **9** | Fix `now = new Date("...")` → `new Date()` in promotions page | C10 | None | C10 — 1-line fix |
| **10** | Contact page + product detail: call `getPublicSiteSettings()` | C11 | None | C11 |
| **11** | Add `.env.production` to `.dockerignore` | C18 | None | C18 — 1-line fix |
| **12** | Fix `public_promotions` RPC: add cover_media, combo_price, original_price | C14 | None | C14 |
| **13** | Drop old `public_products` RPC signatures — keep only 20260618 version | C13 | DB migration | C13, enables C09 |
| **14** | Fix brand filter: use `p_brand_slug` param in RPC call | C09 | C13 resolved | C09 |
| **15** | Fix admin product form: dynamic fetch categories+brands from DB | C15 | None | C15, reduces C20 scope |
| **16** | Add `quote_request_events` insert in `/api/contact` | C17 | None | C17 |
| **17** | Fix promotion form: add DatePicker for start_at/end_at | C19 | None | C19 |
| **18** | Add Zod validation to `PUT /api/admin/settings` | C16 | None | C16, C24 partial |
| **19** | Add Zod validation to Brand/Promotion form handleSubmit | C24 | None | C24 |
| **20** | Fix `getAdminProducts` SELECT: include brand_id, dimensions, media | C20 | C04 done | C20 |
| **21** | Replace `dangerouslySetInnerHTML` with GoogleMap component in admin showroom | C21 | None | C21 |
| **22** | Rename `openaiKey` alias → correct `gemini_api_key` | C22 | None | C22 |
| **23** | Guard mock fallback with `NODE_ENV !== 'production'` | C23 | None | C23 |
| **24** | Add `AdminField` error prop + inline error slot | C32 | None | C32, improves C24 UX |
| **25** | Homepage: call `getContentPage(supabase, "home", locale)` | C12 | None | C12 |
| **26** | Reduce layout `getProducts` limit from 1000 to 100, add ISR cache | C25 | None | C25 |
| **27** | Blog category tags: add `?category=slug` filter server-side | C30 | None | C30 |
| **28** | `RemoteImage` → `next/image` with remotePatterns config | C29 | None | C29 |
| **29** | Add `DELETE /api/admin/media/:id` + soft-delete DB | C28, C34 | C01 done | C28 partial, C34 partial |
| **30** | Add social links to `site_settings` DB + consume in footer | C31 | None | C31 |
| **31** | Consolidate 3 audit trail tables → canonical `quote_request_events` | C27 | DB migration | C27, C26 related |
| **32** | Fix `quote_requests.assigned_to` to uuid, backfill migration | C26 | C31 migration | C26 |
| **33** | Clear demo defaults in UserCreateEntityForm | C35 | None | C35 — 2-min fix |

---

## D. What to Fix First

### Top 5 fixes phải làm TRƯỚC (production blockers)

| # | Fix | Why first | Files |
|---|---|---|---|
| **D1** | `middleware.ts` + admin route auth guard (C05+C06) | **Security**: Admin UI accessible without login. Hardest attack vector. | `middleware.ts` (new), `app/admin/[section]/page.tsx` |
| **D2** | Remove `original_filename` from upload + fix `ImageUploadDropzone` mediaId (C01+C04) | **Data**: Mọi upload fail ở DB step. Cloudinary untracked orphans accumulate. | `app/api/admin/media/upload/route.ts`, `admin-workflows.tsx` |
| **D3** | Add INSERT into `product_media` + remove `getOrCreateMediaAssetId` (C02+C03) | **Data**: Không sản phẩm nào có ảnh trên client. Showroom nội thất không có ảnh = useless. | `lib/supabase/admin-queries.ts` |
| **D4** | Fix `now = new Date()` trong promotions + `.env.production` vào dockerignore (C10+C18) | **1-line fixes với high impact**: promotions completely broken, Docker secrets leak. Effort: 10 phút. | `promotions/page.tsx`, `.dockerignore` |
| **D5** | Fix `update_quote_status` (service role + enum values) (C07+C08) | **Core workflow**: Admin không thể đổi status quote → quote management broken hoàn toàn. | `lib/supabase/admin-queries.ts`, DB migration |

### Top 5 fixes có thể hoãn

| # | Fix | Why defer |
|---|---|---|
| **H1** | Blog WYSIWYG editor / inline images | Heavy feature, không blocking core flow |
| **H2** | Product comparison / wishlist | Nice-to-have UX, không blocking lead capture |
| **H3** | Cloudinary cleanup khi replace/delete media | Orphan cost tích lũy chậm, không immediate risk |
| **H4** | Audit log viewer endpoint | Internal tooling, không blocking customer-facing |
| **H5** | Multi-file upload queue | UX improvement, not blocking |

### Top 5 issues nên merge vì trùng gốc rễ

| Merge group | Issues | Common root cause |
|---|---|---|
| **M1** | C01 + C04 + C02 + C03 | **Ghost asset chain**: missing column → drop mediaId → fake insert → product no image. Fix in 1 PR. |
| **M2** | C07 + C08 | **Quote status RPC**: service role misuse + invalid enum. Fix RPC + caller in same PR. |
| **M3** | C05 + C06 | **Auth guard**: middleware missing + default admin role. Fix together — outer + inner defense. |
| **M4** | C09 + C13 | **Brand filter**: RPC overload conflict, then fix FE filter. C13 must fix before C09. |
| **M5** | C19 + C10 | **Promotions chain**: admin no date set (C19) → client hardcode date (C10). Fix C10 first (trivial), then C19 properly. |

---

## E. Clean Backlog

### Issues nên xóa khỏi backlog

| Issue | Lý do loại |
|---|---|
| api_audit BUG#6 openaiKey alias separately listed | Symptom của C22 — đã có canonical issue |
| admin_audit "Media = READY" verdict | FALSE ASSESSMENT — overwritten by media_audit. Không phải issue cần fix |
| client_audit "no wishlist/compare" | FEATURE GAP không phải bug. Chuyển sang product roadmap |
| validation_audit "SVG upload sanitization" | LOW immediate risk. Chỉ risk nếu attacker đã có editor access |
| client_audit "showroom duplicate component" | Code quality, không blocking |
| database_audit "over-indexed brand_series trigram" | Performance micro-optimization. Defer |
| database_audit "no down-migration files" | Process improvement, không runtime blocking |
| client_audit "Blog readTime hardcode" | LOW — không ảnh hưởng conversion |
| admin_audit "KPI chart là static data" | Feature gap, defer to product roadmap |
| validation_audit "autocomplete attributes missing" | UX improvement. Important nhưng không blocking launch. Medium sprint |
| api_audit "retryable hint on 502 AI responses" | Nice-to-have |
| media_audit "no image reorder / is_primary toggle" | UX enhancement, not blocking |
| client_audit "team members section About" | Content gap, not a code bug |

### Issues nên giữ nhưng hạ priority

| Issue | Current | Suggested | Reason |
|---|---|---|---|
| C27: 3 audit trail tables | MEDIUM | LOW-MEDIUM | Works fine với quote_request_events. Technical debt cleanup. |
| C31: Social links hardcode | MEDIUM | MEDIUM-LOW | Không ảnh hưởng lead capture. UX cosmetic. |
| C33: Trust badges hardcode | LOW | LOW | Không ảnh hưởng conversions ngắn hạn. |
| C29: RemoteImage vs next/image | MEDIUM | MEDIUM | Real perf impact nhưng không blocking launch. Sprint 2. |
| C25: Limit 1000 products | MEDIUM | MEDIUM | Chỉ matters ở scale >200 products. Sprint 2 before real traffic. |

---

## F. Final Recommendation

### Trình tự triển khai tối ưu nhất (7 phases)

```
PHASE 0 — Security Foundation (0.5 ngày) — TRƯỚC MỌI THỨ KHÁC
  1. middleware.ts + admin route redirect        [C05+C06]  30 phút
  2. .env.production vào .dockerignore           [C18]       5 phút
  3. Clear demo defaults UserCreateEntityForm    [C35]      10 phút

PHASE 1 — DB Contract Fixes (1 ngày) — BLOCKER CHAIN
  4. Add original_filename column to media_assets  [C01]    30 phút migration
  5. Drop old public_products RPC signatures       [C13]    30 phút migration
  6. Fix update_quote_status RPC enum values       [C08]    30 phút migration
  7. Fix public_promotions RPC: add cover_media    [C14]    1h migration

PHASE 2 — Media Pipeline Fix (1 ngày) — HIGHEST IMPACT
  8. Fix ImageUploadDropzone: propagate mediaId    [C04]    30 phút
  9. Remove getOrCreateMediaAssetId anti-pattern   [C03]    2h
  10. Add product_media INSERT in product save     [C02]    3h

PHASE 3 — Critical Client Fixes (0.5 ngày) — TRIVIAL + HIGH IMPACT
  11. promotions page: now = new Date()            [C10]    5 phút
  12. contact page: getPublicSiteSettings()        [C11a]   30 phút
  13. product detail: getPublicSiteSettings()      [C11b]   30 phút
  14. Add quote_request_events in /api/contact     [C17]    30 phút

PHASE 4 — Auth + API Contract (1 ngày)
  15. Fix update_quote_status caller (session)     [C07]    2h
  16. Fix brand filter + RPC param p_brand_slug    [C09]    2h
  17. Fix admin product form: dynamic category+brand [C15]  3h
  18. Fix getAdminProducts SELECT query            [C20]    2h

PHASE 5 — Settings + Validation (1 ngày)
  19. Add Zod to PUT /api/admin/settings           [C16]    4h
  20. Add Zod to Brand/Promotion form handleSubmit [C24]    2h
  21. Fix promotion form: add DatePicker start/end [C19]    4h
  22. AdminField: add error prop + inline slot     [C32]    2h
  23. Homepage: call getContentPage()              [C12]    2h

PHASE 6 — Security + Media Cleanup (1 ngày)
  24. Admin showroom: replace dangerouslySetInnerHTML [C21] 1h
  25. Remove mock fallback in production           [C23]    1h
  26. Fix openaiKey alias                          [C22]    1h
  27. Add DELETE media endpoint                    [C28+C34] 3h

PHASE 7 — Performance + UX Polish (Sprint 2)
  28. RemoteImage → next/image                    [C29]
  29. Layout limit 1000 → 50-100 + cache          [C25]
  30. Blog category filter                         [C30]
  31. Social links to siteSettings                 [C31]
  32. Media library: pagination + search           [C28]
  33. Trust badges from siteSettings               [C33]
```

---

### Nếu nguồn lực hạn chế — Minimum viable để go-live an toàn

> **Phase 0 + Phase 1 + Phase 2 + Phase 3 = 4-5 ngày dev**

Sau phases này hệ thống có thể:
- Không bị security bypass (C05, C06)
- Media upload hoạt động đúng end-to-end (C01, C04, C02, C03)
- Products hiển thị ảnh trên client
- Promotions page không broken
- Contact page hiển thị thông tin đúng
- Quote audit trail hoạt động

---

### Fixes tạo hiệu ứng domino — giải quyết nhiều report nhất

| Fix | Domino effect | Reports covered |
|---|---|---|
| **C01: Add original_filename column** | Unblocks toàn bộ media pipeline (C02, C03, C04) | api, media, database, admin |
| **C04: Fix ImageUploadDropzone mediaId** | Ghost asset problem (C03) removable. Entity forms nhận đúng UUID. | media, validation, admin, api |
| **C05+C06: Auth guard** | Nếu không fix, mọi fix khác vô nghĩa về security | security, api, admin |
| **C14: Fix public_promotions RPC** | Fixes promotions page + media promo cards cùng lúc | api, database, media, client |
| **C02: product_media insert** | Toàn bộ product catalog hiển thị ảnh — core business value | media, api, admin, client |

---

### Impact Matrix — Top fixes

| Fix | User-visible impact | Data integrity | Security | Effort |
|---|---|---|---|---|
| C05+C06 middleware | None visible | None | CRITICAL | 30m |
| C01 original_filename | None visible | CRITICAL | None | 15m |
| C02 product_media insert | Products show images | CRITICAL | None | 3h |
| C04 mediaId propagation | Indirect | CRITICAL | None | 30m |
| C10 promotions date | Promotions work | None | None | 5m |
| C11 hotline/email | Correct contact info | None | None | 1h |
| C09 brand filter | Brand filter works | HIGH | None | 2h |
| C14 public_promotions RPC | Promo images show | HIGH | None | 2h |
| C07+C08 quote status | Admin can change status | HIGH | None | 2h |
| C18 dockerignore | None visible | None | HIGH | 5m |

---

*Re-audit & Master Fix Index — 2026-06-19*  
*Cross-referenced từ 7 audit files: api, admin, client, media, database, security, validation*
