# POST-IMPLEMENTATION VERIFICATION AUDIT v3

Date: 2026-06-14  
Scope baseline: `POST-IMPLEMENTATION-RE-AUDIT-REPORT_v2.md` and the v3 re-audit instruction file.  
Method: static code/schema trace only. Browser MCP/runtime UI evidence was not available in this tool session, so visual behavior that could not be proven from code is marked `NOT_VERIFIED` or `PARTIAL`, not assumed done.

## 1. Executive summary

- **Actual completion estimate**: ~58-64%. The codebase is materially better than the original prototype, but several "done" claims are still not usable end-to-end.
- **Confidence**: Medium-high for DB/API/static wiring findings; medium for UX/layout verdicts because Browser MCP runtime inspection was unavailable.
- **False completion count**: 10 material false completions or overclaimed completions.
- **Top blockers remaining**:
  - Media/Cloudinary upload is not usable. There is a sign route, but no real upload route with file validation, no persisted upload flow in `media_assets`, and the admin media panel only toggles demo text.
  - Category create/edit is still backed by local mock category data in the form, so parent/child business is not truly DB-wired.
  - Public contact product/service options still come from `showroom-mock-fallback`, not DB.
  - Admin global search uses a hard-coded `SEARCH_ITEMS` array with fake products/blogs/showrooms/quotes.
  - Google Maps embed is rendered directly from DB string without the validator/safe renderer required by Phase 07.
  - Product catalog server-side filtering is only partial: server RPC is called, but results are still passed through `filterProducts()` client-side and brand/discount are not sent to the DB query.
  - Product/category static `/new` and `/edit` admin pages still exist as full pages, not full-screen modal overlays, creating two UX patterns.
  - AI generation calls Gemini, but prompt safety filters and safe `AI_UNAVAILABLE` response shape are incomplete.
  - Settings API still creates "mock asset" media rows from arbitrary URLs and returns many static defaults.
  - Several "upload" fields in brand/promotion/product/blog forms are URL text inputs, not actual upload/persist controls.

## 2. Baseline vs actual verification

| ID | Item in v2 | Expected | Actual | Verdict | Evidence |
| -- | ---------- | -------- | ------ | ------- | -------- |
| A1 | Remove apply filter and make filters realtime | No separate apply button, state preserved, clear reset without F5 | Public products uses `router.push` on change and clear button; admin pages mostly local state filters; no Browser MCP proof | PARTIAL | `components/showroom/product-filter-panel.tsx:77-105`, `components/showroom/admin-pages.tsx:185-206`, `components/showroom/admin-pages.tsx:570-685` |
| A2 | Public products minimal filters | Search, category, material, discount, brand only | UI renders these five, but page still builds room/style/collection/tone/availability filters and active chips; brand option is not actually populated/passed in page props | PARTIAL | `app/[locale]/products/page.tsx:73-159`, `app/[locale]/products/page.tsx:232-241`, `components/showroom/product-filter-panel.tsx:113-185` |
| A3 | Admin list search/filter clear/realtime | Search/filter on categories/products/blog/promotions/brands/quotes/users | Products/brands/quotes have local search/filter; categories/blog/users lack comparable search/filter; promotions rely on generic DataTable search | PARTIAL | `components/showroom/admin-pages.tsx:182-206`, `components/showroom/admin-pages.tsx:277-330`, `components/showroom/admin-pages.tsx:357-399`, `components/showroom/admin-pages.tsx:1087-1191` |
| B1 | Admin create/edit full-screen modal | All create/edit flows use full-screen overlay | Dynamic section pages use `AdminRouteDialog`; static `/admin/products/new`, `/admin/products/[id]/edit`, `/admin/categories/new`, `/admin/categories/[id]/edit` still render as standalone pages | PARTIAL | `components/showroom/admin-workflows.tsx:173-307`, `app/admin/products/new/page.tsx:14-20`, `app/admin/products/[id]/edit/page.tsx:21-27` |
| B2 | Admin skeleton only content area | Sidebar/header remain stable | `app/admin/loading.tsx` only renders content skeleton, not shell. Runtime not verified | VERIFIED_DONE | `app/admin/loading.tsx:1-24` |
| C1 | Remove hard-code/options/mock/fake fallbacks | Domain-managed options from DB | Multiple hard-coded/mocked paths remain: quote form products/services, admin global search, home partner static fallback, settings defaults, category form mock data | FALSE_COMPLETION | `components/showroom/quote-form.tsx:15-57`, `components/showroom/admin-shell.tsx:18-41`, `app/[locale]/page.tsx:83-120`, `components/showroom/admin-workflows.tsx:752-824` |
| C2 | Header mega menu DB data | Categories/brands/products from DB, organized and usable | Layout passes DB categories/brands, but product group mapping still uses static `productGroups`; representative products filter against UI group keys and can fail/mismatch | PARTIAL | `components/showroom/public-shell.tsx:197-270` |
| C3 | Contact options from DB | `/vi/contact` select/options use DB | Showroom sidebar reads DB; quote form product options and service choices remain mock/static | FALSE_COMPLETION | `app/[locale]/contact/page.tsx:46-66`, `components/showroom/quote-form.tsx:50-57`, `components/showroom/quote-form.tsx:200-241` |
| D1 | Remove archive/save-extra create buttons | Only create and save draft | Forms still include `archived` as status option in brand/promotion; product/blog draft logic still uses localStorage restore/discard | PARTIAL | `components/showroom/admin-workflows.tsx:2686-2690`, `components/showroom/admin-workflows.tsx:2985-2989`, `components/showroom/admin-workflows.tsx:3112-3186` |
| D2 | Categories parent/child business | Clear parent/child tree, DB-backed management | DB schema supports parent_id, but current UI is card grid and the form loads local `mockCategories` for edit/defaults | FALSE_COMPLETION | `components/showroom/admin-pages.tsx:277-330`, `components/showroom/admin-workflows.tsx:730-824` |
| D3 | Brands admin | DB CRUD, bilingual fields, upload logo, full-screen modal, list search | DB CRUD exists and bilingual fields exist; logo is URL text/manual media-row creation, not real upload | PARTIAL | `components/showroom/admin-pages.tsx:357-472`, `components/showroom/admin-workflows.tsx:2558-2700`, `lib/supabase/brands-mutations.ts:209-390` |
| D4 | Promotions admin business | Small product discounts, searchable product selection, N-N product links, DB persistence | N-N table and product search exist; form still includes combo/items/free text and cover URL; list lacks business-friendly selected product visibility | PARTIAL | `supabase/migrations/20260614_product_promotions.sql:4-25`, `components/showroom/admin-workflows.tsx:2704-2999`, `lib/supabase/admin-queries.ts:1155-1224` |
| D5 | Product form sync promotions | Product create/edit can select promotion from DB and persist N-N | Product mutation syncs a single `promotion_id`; UI evidence of product-side promotion picker not fully verified from available snippets | PARTIAL | `lib/supabase/mutations.ts:521-527`, `lib/supabase/mutations.ts:717-724` |
| E1 | Blog editor full enough | Usable editor with formatting, image insertion, public render compatibility | Markdown toolbar/preview exists; still textarea-based; no real image upload/insert persistence; public detail maps sections, not full rich body fidelity | PARTIAL | `components/showroom/admin-interactions.tsx:561-578`, `components/showroom/admin-workflows.tsx:3002-3293`, `app/[locale]/blog/[slug]/page.tsx:217-267` |
| E2 | Blog sticky TOC/related | Sticky desktop sidebar and responsive mobile | Sticky aside exists in code; runtime not inspected | VERIFIED_DONE | `app/[locale]/blog/[slug]/page.tsx:272-295` |
| F1 | Quotes workflow | Status transitions, admin actions, DB/RPC history | UI actions and RPC exist; timeline/history is not rendered in quote page; email draft is static suggestion only | PARTIAL | `components/showroom/admin-pages.tsx:584-625`, `components/showroom/admin-pages.tsx:779-823`, `supabase/migrations/20260614_quote_workflow.sql:49-130` |
| G1 | Settings Vietnamese cleanup | Fully Vietnamese, no mixed labels | Not fully verified; code still has older/default wording and hard-coded defaults; some strings are mojibake in source | NOT_VERIFIED | `app/api/admin/settings/route.ts:102-176`, `components/showroom/admin-workflows.tsx:1024-1755` |
| G2 | Remove AI assistant | Route/menu/entry removed | `adminNav` no longer contains `ai-assistant`; dynamic section list excludes it; generate API remains because in-form AI uses it | VERIFIED_DONE | `components/showroom/admin-shell.tsx:68-79`, `app/admin/[section]/page.tsx:26-36` |
| G3 | Remove permission checker near logout | Cleanup admin shell | No explicit "Kiểm tra phân quyền" entry found; however admin shell has hard-coded "A" user link near header | PARTIAL | `components/showroom/admin-shell.tsx:253` |
| G4 | Account management | List/create/edit role/status, API, admin-only | API and UI exist; no delete/disable auth session invalidation; role options static by design | PARTIAL | `app/api/admin/users/route.ts:7-170`, `components/showroom/admin-pages.tsx:964-1083` |
| H1 | Partner brands DB | Client brand section from DB, UI acceptable | Uses `getPublicBrands()` but falls back to a static brand array, so not strict DB-only | PARTIAL | `app/[locale]/page.tsx:81-120` |
| H2 | Promotions public | Maps real admin promotions, project tone | Reads public promotions RPC and maps DB fields; still frames UI as combo campaign and falls back image | PARTIAL | `app/[locale]/promotions/page.tsx:41-83`, `app/[locale]/promotions/page.tsx:126-214` |
| H3 | Hero arrows/contact tooltip | Cursor pointer, settings-driven contact tooltip | Hero cursor not rechecked; floating/contact config not fully traced from DB. Public contact page still hard-codes phone/email | PARTIAL | `app/[locale]/contact/page.tsx:101-108`, `components/showroom/public-shell.tsx:675-694` |
| I | Whole-project QA | No hard-code, real data, full modal, upload, workflow | Multiple hard-code/mock/upload/service gaps remain | FALSE_COMPLETION | See sections 4-8 |

## 3. Screen-by-screen audit

| Route | Current state | Data source | Missing pieces | Verdict |
| ----- | ------------- | ----------- | -------------- | ------- |
| `/vi/products` | Product listing calls Supabase RPC, realtime URL filter UI exists | `getProducts()` via `public_products`, plus `filterProducts()` post-filter | Brand/discount not clearly server-side; hidden advanced filters still parsed; DB categories fallback to static groups | PARTIAL |
| `/vi/contact` | Contact page shows DB showrooms when available and renders quote form | `getShowrooms()` for sidebar; `QuoteForm` local mock products | Service/product select not DB-backed; contact phone/email hard-coded | FALSE_COMPLETION |
| `/vi/promotions` | Public promo cards read DB promotions | `getPromotions()`/public RPC | Business still combo-heavy; image fallback; no verified mapping of selected products | PARTIAL |
| `/vi/blog/[slug]` | Detail page has sticky TOC and DB related posts | `getBlogPostBySlug`, `getBlogPosts`, mock fallback | Full rich editor body fidelity not proven; fallback still used | PARTIAL |
| `/vi/showrooms` | DB showrooms render with iframe and fallback link | `getShowrooms()` | No safe `GoogleMap` component/URL validator; iframe can render empty `src` | PARTIAL |
| `/admin/products` | DB list fetched; local filter UI; full-screen modal query route exists | `getAdminProducts()` | Static `/new` and `/edit` pages still exist; filter is local page state, not URL/server state | PARTIAL |
| `/admin/categories` | DB list fetched; create/edit overlay exists | `getAdminCategories()` | No tree manager/search; form edit uses local mock category definitions | FALSE_COMPLETION |
| `/admin/brands` | DB list/search and create/edit overlay | `getAdminBrands`, `brands-mutations` | Logo upload is URL field; media row can be auto-created from arbitrary URL with size 0 | PARTIAL |
| `/admin/promotions` | DB CRUD list and N-N product association UI exists | `getAdminPromotions`, `product_promotions` | Still combo/free-text business, upload is URL field, list hides associated products | PARTIAL |
| `/admin/blog` | DB list, full-screen editor overlay | `getAdminBlogPosts`, content form | Editor still textarea/markdown; image upload not wired to media upload | PARTIAL |
| `/admin/showrooms` | DB list/edit overlay exists | `getAdminShowrooms` | Google Maps URL validation not evident; no map component reuse | PARTIAL |
| `/admin/media` | Admin section exists | `MediaUploadPanel` | Panel is demo-only, no file input, no upload API, no persistence | FALSE_COMPLETION |
| `/admin/quotes` | Admin-only quote workflow UI exists | `getAdminQuotesList`, `update_quote_status` RPC | Timeline/history RPC not rendered; email draft is static suggestion | PARTIAL |
| `/admin/users` | Admin-only list/create/edit role/status | Supabase Admin Auth + `profiles` | No delete/reset password/audit UI details; runtime not verified | PARTIAL |
| `/admin/settings` | API reads/writes settings and masked secrets | `site_settings`, `integration_secrets`, `content_pages` | Many default fallbacks; media URL resolver inserts placeholder assets; no secret-specific validation | PARTIAL |

## 4. Hard-code / stale fallback scan

- `components/showroom/admin-shell.tsx:18-41`: global admin search is a hard-coded array of products/categories/blog/showrooms/quotes.
- `components/showroom/quote-form.tsx:15-57`: product options come from `showroom-mock-fallback`.
- `components/showroom/quote-form.tsx:210-218`: service options are static strings.
- `app/[locale]/contact/page.tsx:55-66`: hard-coded showroom fallback records.
- `app/[locale]/contact/page.tsx:101-108`: hard-coded phone/email.
- `app/[locale]/page.tsx:83-120`: partner brands fallback array remains.
- `app/[locale]/page.tsx:53-55`, `70-79`: home falls back to mock products/showrooms.
- `lib/supabase/queries.ts`: public readers intentionally fall back to local mocks on RPC errors.
- `components/showroom/admin-workflows.tsx:752-824`: category form edit state uses local `mockCategories`.
- `components/showroom/admin-workflows.tsx:827-842`: category AI translate still uses `setTimeout`/generated placeholder text.
- `components/showroom/admin-workflows.tsx:3112-3186`: localStorage draft persistence remains for create forms.
- `components/showroom/admin-interactions.tsx:584-601`: media upload panel only shows selected demo file text.
- `app/api/admin/settings/route.ts:18-28`: settings media resolver creates a "mock asset" DB row for arbitrary URL with `size_bytes: 0`.
- `app/api/admin/settings/route.ts:102-176`: settings API returns many static default values.
- `lib/supabase/brands-mutations.ts:91-117`: mock brand data remains for mock mode.
- `lib/supabase/admin-queries.ts:1240-1262`: mock admin users remain for mock mode.

## 5. Filter / modal / upload verification

- **Realtime filter**: Public product filters use `router.push()` on input/select change with 400ms debounce for search. This is acceptable as URL-state realtime navigation, but not "no route transition"; Browser MCP was not available to verify perceived refresh.
- **Clear button**: Public products and brands search include clear. Categories/blog/users do not have equivalent clear/search behavior.
- **No refresh**: Public filter uses client navigation; quotes update calls `router.refresh()` after status mutation. That is acceptable for persistence refresh, but contradicts a strict "no refresh" UX if applied globally.
- **Full-screen modal**: `AdminRouteDialog` is genuinely full-screen-capable. However static `/admin/products/new`, `/admin/products/[id]/edit`, `/admin/categories/new`, `/admin/categories/[id]/edit` still render full pages.
- **Brands upload**: Not done. Brand form has a plain "Cloudinary URL" input, then mutations auto-create media records from that URL. No file picker, no signed upload, no size/type validation.
- **Promotions upload**: Not done. Promotion form has a plain "Cloudinary URL" input.
- **Blog image upload**: Not done. Editor toolbar can insert markdown/image markup, but there is no upload/persist path wired to Cloudinary/media library.
- **Contact option source**: Not done. Product/service selects are mock/static.
- **Mega menu source/layout**: Partially DB-backed. Categories/brands are loaded, but UI grouping still depends on static `productGroups` and static group-key mapping.

## 6. Business acceptance audit

- **Categories**: BUSINESS_NOT_ACCEPTABLE. The DB has `parent_id`, but the admin list is a flat card grid, and the form uses local mock top-level category definitions. This is not a usable parent/child category manager.
- **Brands**: PARTIAL. CRUD, bilingual fields and list search exist. Logo upload is not a real upload flow, and logo persistence is URL-to-media-row approximation.
- **Promotions**: PARTIAL. N-N product association exists, but UI still mixes "combo" products/free text with actual promotion-product association, which keeps the business ambiguous.
- **Blog editor**: PARTIAL. Markdown toolbar/preview is better than a raw textarea, but office-user rich editing, image upload, and exact public render compatibility are not complete.
- **Quotes**: PARTIAL. Status transitions and DB RPC exist; history/timeline is not rendered, and suggested email is static rather than a real send/reply workflow.
- **Settings**: PARTIAL. Admin-only read/write exists and secrets are masked/encrypted, but defaults and URL media resolver are too loose.
- **Account management**: PARTIAL. Admin-only list/create/edit role/status exists, but operational controls are still basic and not fully runtime-verified.

## 7. Regression & newly introduced issues

- Product catalog server-side filtering can be undermined by the additional `filterProducts(query, dbProductsMapped)` pass after the DB query. If the mapper or client taxonomy diverges from RPC results, valid DB rows can disappear.
- Public product page parses advanced filters that are no longer visible in the panel. Stale URLs with `room/style/collection/tone/availability` still affect results.
- Static admin create/edit pages reintroduced page-based CRUD even though section query routes use full-screen overlays.
- Category form edit mode is detached from `getAdminCategories()` and can edit/populate mock values unrelated to the selected DB record.
- Settings media resolver can pollute `media_assets` with arbitrary URLs and placeholder metadata, which weakens future media library integrity.
- Cloudinary sign endpoint can return signature, but no file metadata validation or DB persistence is enforced after client upload.
- Gemini route falls back to ENV key if DB decryption fails, which may be acceptable locally but weakens the "DB secure settings are authoritative" story.
- Source files contain mojibake text in many UI strings, which is a content-quality regression risk even if runtime encoding happens to render acceptably.

## 8. Final actionable gap list

### Critical

1. Implement real media upload: `lib/cloudinary/client.ts`, `/api/admin/media/upload`, server-side MIME/size validation, Cloudinary upload/delete, and `media_assets` persistence.
2. Replace `MediaUploadPanel` demo behavior with real file input/dropzone and DB-backed media list.
3. Rebuild category manager as DB-backed parent/child tree/list and remove local `mockCategories` from `CategoryEntityForm`.
4. Make contact `QuoteForm` product/service options DB-backed and remove `showroom-mock-fallback` product dependency.
5. Replace admin global `SEARCH_ITEMS` with DB/API-backed search or remove it until real.

### High

6. Add `components/public/GoogleMap.tsx` plus safe Google Maps embed/fallback URL validator before rendering iframe.
7. Finish product catalog DB filtering: remove hidden advanced filter influence, send brand/discount filters to RPC, and avoid redundant client post-filter where possible.
8. Unify admin create/edit routing: either remove static `/new` and `/edit` pages or make them open the same full-screen modal pattern.
9. Wire brand/promotion/blog image fields to the media uploader instead of URL text inputs.
10. Render quote status history/timeline from `get_quote_status_logs()` in `/admin/quotes`.

### Medium

11. Tighten Gemini route with explicit prompt-size limit, quote/private-data filter, and stable `AI_UNAVAILABLE` response.
12. Remove or clearly label localStorage draft restore if owner wants only "Tạo" and "Lưu bản nháp".
13. Replace partner brands fallback with safe empty state or admin-managed default seed.
14. Add search/filter controls for categories/blog/users with consistent clear behavior.
15. Add unit tests for Cloudinary upload validator, Maps URL validator, Gemini fallback, and media asset persistence.

### Low

16. Clean mojibake Vietnamese strings across source files.
17. Replace `alert()` flows in admin CRUD with consistent toast/state UI.
18. Remove stale comments that describe mock behavior as production behavior.

## 9. Final verdict

1. **How many AI-reported done items are not actually done?** At least 10 material items are still false/partial completions.
2. **Heaviest fake-done items**:
   - Media upload/Cloudinary integration.
   - Category parent/child business.
   - Contact form DB options.
   - Admin global search.
   - Google Maps validation/component.
3. **Is the system more trustworthy now?** Yes, but not launch-grade. Core Supabase reads/writes, RBAC, quotes persistence, brands/promotions baseline, and some Gemini wiring exist. The biggest remaining risk is that several UI affordances look complete while still using mock/static/manual URL behavior.
4. **Top 10 next fixes**:
   - Real Cloudinary upload + `media_assets` persistence.
   - Replace admin media demo panel.
   - DB-backed category tree manager.
   - DB-backed contact product/service options.
   - DB-backed admin global search.
   - Safe Google Maps component/validator.
   - Finish server-side product filters including brand/discount and remove stale advanced filter effects.
   - Normalize full-screen modal routing.
   - Wire image upload into brand/promotion/blog/product forms.
   - Render quote workflow timeline/history.

