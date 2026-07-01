# Admin Integration & E2E Test Cases — Step-by-Step Detail
## Part 2 of 2: Brands · Promotions · Blogs · Showrooms · Quotes · Users · Settings · Media

**Version:** 2.0 | **Date:** 2026-06-28  
**Continuation of Part 1** — Module numbering continues from Module 4.

---

## 🏷️ MODULE 5 — Brands

### Prereqs for Brand tests
- Logged in as admin (unless stated)
- `NEXT_PUBLIC_USE_MOCK_DATA=false`

---

### ADM-BRD-01 — Brand list loads from DB

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Navigate to `/admin` → "Thương hiệu" (Brands) in sidebar
2. Wait for list to load

**Pass criteria:**
- Table rows visible
- Count matches: `SELECT count(*) FROM brands WHERE deleted_at IS NULL`
- Each row shows: name (VI), status, sort_order

**Fail criteria:**
- Empty table when brands exist
- Mock data shown (verify via Network tab — should call real DB)

---

### ADM-BRD-02 — New brand appears in product creation dropdown

**Type:** E2E | **Priority:** 🟠 High

**Preconditions:** A brand does NOT yet exist for "Kohler Vietnam".

**Steps:**
1. Create brand "Kohler Vietnam" with status = Published (see ADM-BRD-13)
2. Navigate to product create form
3. Open the **Thương hiệu** (Brand) dropdown

**Pass criteria:**
- "Kohler Vietnam" appears in the dropdown
- If caching is involved: reload product create page first

---

### ADM-BRD-03 — Create: empty name_vi shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Open brand create form
2. Leave **Tên thương hiệu (VI)** empty
3. Fill status = draft
4. Click Save

**Pass criteria:**
- Error: "Tên thương hiệu tiếng Việt là bắt buộc"
- No brand inserted in DB

---

### ADM-BRD-04 — Create: whitespace-only name_vi shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. name_vi = `   ` (spaces)
2. Save

**Pass criteria:**
- Zod `.trim().min(1)` → empty → error as ADM-BRD-03

---

### ADM-BRD-05 — Create: name_vi with XSS stored safely

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. name_vi = `<script>alert('brand-xss')</script>`
2. Save (other fields valid: status=draft)
3. View brand in public-facing brand page or product filter

**Pass criteria:**
- Stored as escaped text in DB
- No `alert()` executes on any page

---

### ADM-BRD-06 — Create: SQL injection in name_vi stored as literal text

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. name_vi = `'; DROP TABLE brands;--`
2. Save

**Pass criteria:**
- Saved as literal string
- `brands` table still exists with all data intact
- No 500 error

---

### ADM-BRD-07 — Create: name_vi = single character accepted

**Type:** IT | **Priority:** 🟡 Medium

**Steps:**
1. name_vi = `A`
2. Save

**Pass criteria:**
- Accepted (min 1 character after trim)

---

### ADM-BRD-08 — Create: description_vi with XSS stored safely

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Fill valid name_vi
2. description_vi = `<img src=x onerror=alert('desc-xss')>`
3. Save
4. View brand description on any public-facing page

**Pass criteria:**
- `onerror` attribute stored as escaped text
- No alert fires

---

### ADM-BRD-09 — Create: invalid status value rejected

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Intercept brand create form submit
2. Modify `status = "invalid_status"`
3. Resend

**Pass criteria:**
- Zod `z.enum(["draft", "published", "archived"])` rejects
- HTTP 400

---

### ADM-BRD-10 — Create: negative sort_order accepted (document behavior)

**Type:** IT | **Priority:** 🟡 Medium

**Steps:**
1. sort_order = `-5`
2. Save

**Pass criteria:**
- Accepted (no min constraint in Zod or DB for sort_order on brands)
- Document: negative sort_order is allowed — may affect ordering in public brand list

---

### ADM-BRD-11 — Create: float sort_order rejected

**Type:** IT | **Priority:** 🟡 Medium

**Steps:**
1. sort_order = `1.5`
2. Save

**Pass criteria:**
- Zod `z.number().int()` rejects

---

### ADM-BRD-12 — Create: logo_url with FTP scheme accepted but flags risk

**Type:** IT | **Priority:** 🟡 Medium

**Steps:**
1. logo_url = `ftp://cdn.example.com/logo.png`
2. Save

**Pass criteria:**
- `optionalText` Zod type accepts any non-empty string
- Saved in DB as `ftp://cdn.example.com/logo.png`
- **Document:** No URL protocol validation on brand logo_url — potential for invalid image URLs

---

### ADM-BRD-13 — Create brand with required fields saves correctly

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Open brand create form
2. Fill: name_vi = `Kohler Vietnam`, status = `draft`
3. Click Save

**Pass criteria:**
- Success toast shown
- `SELECT * FROM brands WHERE name_vi = 'Kohler Vietnam'` → 1 row
- Row has `deleted_at IS NULL`, `status = 'draft'`

---

### ADM-BRD-14 — Create brand with logo image links media

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Open brand create form
2. Upload a PNG logo file via the logo image upload zone
3. Fill name_vi = `Logo Brand Test`
4. Save

**Pass criteria:**
- `SELECT logo_media_id FROM brands WHERE name_vi = 'Logo Brand Test'`
- `logo_media_id` is a non-null UUID in `media_assets` table

---

### ADM-BRD-15 — Brand logo linked as FK in media_assets

**Type:** IT | **Priority:** 🔴 Critical

**Steps:** (Following ADM-BRD-14)

1. Get `logo_media_id` from created brand
2. Query: `SELECT size_bytes, mime_type FROM media_assets WHERE id = '<logo_media_id>'`

**Pass criteria:**
- Row exists
- `size_bytes > 0`
- `mime_type = 'image/png'`

---

### ADM-BRD-16 — Create two brands with same name_vi: both accepted (no uniqueness)

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Create brand "TOTO Vietnam" (status=draft)
2. Create another brand "TOTO Vietnam" (status=draft)

**Pass criteria:**
- Both saved successfully (no unique constraint on `brands.name_vi`)
- 2 rows exist with same name
- **Document:** Admin must manually ensure uniqueness of brand names

---

### ADM-BRD-17 — Soft delete brand

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. On brand list, click delete on a brand
2. Confirm deletion
3. Query: `SELECT deleted_at, status FROM brands WHERE id = '<id>'`

**Pass criteria:**
- `deleted_at IS NOT NULL`
- Brand no longer in admin list

---

### ADM-BRD-18 — Delete brand referenced by products: FK behavior

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Brand "TOTO" is referenced by 2 products (`products.brand_id = TOTO.id`).

**Steps:**
1. Soft-delete "TOTO" brand
2. Query: `SELECT count(*) FROM products WHERE brand_id = '<toto_id>' AND deleted_at IS NULL`

**Pass criteria:**
- Products still exist (FK not cascaded)
- `brands` soft-deleted but not hard-deleted
- **Verify:** Is there a FK constraint protecting brand deletion? If so, document the constraint name

---

### ADM-BRD-19 — Audit log on brand create

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Create brand
2. Query: `SELECT * FROM audit_logs WHERE entity_type = 'brand' AND action = 'create' ORDER BY created_at DESC LIMIT 1`

**Pass criteria:**
- Row with correct `actor_id`, `entity_id`, `action='create'`

---

### ADM-BRD-20 — Brand edit form loads existing data

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Click edit on brand "Kohler Vietnam"
2. Observe form

**Pass criteria:**
- name_vi = `Kohler Vietnam`
- status = `draft`
- sort_order pre-populated

---

### ADM-BRD-21 — Edit name_vi and save updates DB

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Edit brand; change name_vi to `Kohler Vietnam (Updated)`
2. Save
3. Query: `SELECT name_vi FROM brands WHERE id = '<id>'`

**Pass criteria:**
- = `Kohler Vietnam (Updated)`

---

### ADM-BRD-22 — Edit logo replaces old logo FK

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Edit brand that has a logo (logo_media_id = UUID-A)
2. Upload a new logo
3. Save
4. Query: `SELECT logo_media_id FROM brands WHERE id = '<id>'`

**Pass criteria:**
- `logo_media_id` = new UUID (not UUID-A)

---

### ADM-BRD-23 — Edit status draft→published makes brand visible publicly

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Edit brand; change status from draft to published
2. Save
3. Navigate to public brand listing page

**Pass criteria:**
- Brand appears in public-facing brand list/filter

---

### ADM-BRD-24 — Edit: clear name_vi shows required error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Edit brand; clear name_vi entirely
2. Save

**Pass criteria:**
- Error: "Tên thương hiệu tiếng Việt là bắt buộc"
- No DB update

---

### ADM-BRD-25 — Upload valid PNG logo

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Open brand form; drag-drop a PNG logo ≤1MB
2. Wait for upload confirmation

**Pass criteria:**
- Preview visible
- After save: `media_assets` row with `size_bytes > 0`, `format='png'`

---

### ADM-BRD-26 — Upload oversized logo (>10MB) rejected client-side

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Drag-drop a 12MB file onto logo upload zone

**Pass criteria:**
- Error shown immediately: file too large
- No Cloudinary request made

---

### ADM-BRD-27 — Upload PDF rejected for brand logo

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Drag-drop a `.pdf` file

**Pass criteria:**
- Client-side `allowedImageMimeTypes` rejects immediately

---

### ADM-BRD-28 — Editor can create/edit a brand

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Logged in as editor.

**Steps:**
1. Navigate to `/admin` → Brands
2. Create a new brand with valid data

**Pass criteria:**
- `requireEditorOrAdmin()` passes for editor
- Brand created successfully

---

### ADM-BRD-29 — Anonymous cannot create brand (auth guard)

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Clear cookies (no session)
2. POST to brand create endpoint directly

**Pass criteria:**
- HTTP 401 / redirect to login

---

### ADM-BRD-30 — Brand mutations use correct file (brands-mutations.ts not mutations.ts)

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Open browser DevTools → Sources (or check server logs)
2. Create a brand and observe which server action is called

**Pass criteria:**
- Brand create calls `createAdminBrand` from `brands-mutations.ts`
- Does NOT call `createAdminProduct` from `mutations.ts`
- No cross-module mutation calls

---

## 🏷️ MODULE 6 — Promotions

### Prereqs for Promotion tests
- Logged in as admin
- At least 2 products exist (for linking to promotion items)

---

### ADM-PRO-01 — Promotion list loads from DB

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Navigate to `/admin` → "Khuyến mãi" (Promotions)

**Pass criteria:**
- Table shows all promotions: code, title (VI), discount_percentage, date range, status

---

### ADM-PRO-02 — Active promotion shows "active" status badge

**Type:** E2E | **Priority:** 🟠 High

**Preconditions:** Promotion with `start_at = yesterday`, `end_at = tomorrow`, `status='published'` exists.

**Steps:**
1. View promotion list

**Pass criteria:**
- That promotion row shows a green "Đang chạy" or "Active" badge

---

### ADM-PRO-03 — Expired promotion shows "expired" badge

**Type:** E2E | **Priority:** 🟠 High

**Preconditions:** Promotion with `end_at = 2 days ago`.

**Steps:**
1. View promotion list

**Pass criteria:**
- Shows "Đã hết hạn" or "Expired" badge

---

### ADM-PRO-04 — Future promotion shows "upcoming" badge

**Type:** E2E | **Priority:** 🟠 High

**Preconditions:** Promotion with `start_at = tomorrow`.

**Steps:**
1. View promotion list

**Pass criteria:**
- Shows "Sắp diễn ra" or "Upcoming" badge

---

### ADM-PRO-05 — Create: empty code shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Open promotion create form
2. Leave **Mã khuyến mãi** (code) empty
3. Fill title_vi, discount_percentage
4. Save

**Pass criteria:**
- Error: "Mã khuyến mãi là bắt buộc"

---

### ADM-PRO-06 — Create: whitespace-only code shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. code = `   ` → Save

**Pass criteria:**
- Trimmed → required error

---

### ADM-PRO-07 — Create: code with XSS stored safely

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. code = `<script>alert('promo-xss')</script>`
2. Other fields valid; Save

**Pass criteria:**
- Stored escaped; no script executes on any admin or public page

---

### ADM-PRO-08 — Create: empty title_vi shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Fill code; leave title_vi empty; Save

**Pass criteria:**
- Error: "Tiêu đề tiếng Việt là bắt buộc"

---

### ADM-PRO-09 — Create: discount_percentage = -1 rejected

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. discount_percentage = `-1`
2. Save

**Pass criteria:**
- Zod `z.number().min(0)` rejects
- Error shown

---

### ADM-PRO-10 — Create: discount_percentage = 0 accepted

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. discount_percentage = `0`
2. Save

**Pass criteria:**
- Accepted (min 0 passes)

---

### ADM-PRO-11 — Create: discount_percentage = 100 accepted

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. discount_percentage = `100`
2. Save

**Pass criteria:**
- Accepted (max 100 passes)

---

### ADM-PRO-12 — Create: discount_percentage = 101 rejected

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. discount_percentage = `101`
2. Save

**Pass criteria:**
- Zod `max(100)` rejects
- Error: "Phần trăm giảm giá từ 0-100"

---

### ADM-PRO-13 — Create: start_at > end_at shows cross-field error

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. start_at = `2026-07-10T00:00:00`
2. end_at = `2026-07-01T00:00:00` (earlier than start)
3. Save

**Pass criteria:**
- Zod refine: `new Date(start_at) < new Date(end_at)` fails
- Error: "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc"
- Error appears near `end_at` field

---

### ADM-PRO-14 — Create: start_at = end_at rejected

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. start_at = end_at = `2026-07-15T12:00:00`
2. Save

**Pass criteria:**
- `new Date(start_at) < new Date(end_at)` → false (they are equal, not less-than) → error

---

### ADM-PRO-15 — Create: valid date range accepted

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. start_at = `2026-07-01T00:00:00`
2. end_at = `2026-07-31T23:59:59`
3. Save

**Pass criteria:**
- Refine passes; promotion saved

---

### ADM-PRO-16 — Create: invalid date format (NaN boundary)

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Intercept form; set start_at = `"32/13/2026"` (invalid date string)
2. Resend

**Pass criteria:**
- `new Date("32/13/2026")` returns `Invalid Date` (NaN) — refine `start_at && end_at` both truthy = true → refine skipped → promotion may be saved with invalid dates
- **Document this boundary:** if refine is bypassed, DB may receive null or invalid timestamps
- Preferred: Zod `z.string().datetime()` should be used instead of `z.string()`

---

### ADM-PRO-17 — Create: combo_price ≥ original_price shows error

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. combo_price = `2000000`
2. original_price = `1000000` (combo > original)
3. Save

**Pass criteria:**
- Zod refine: `combo_price < original_price` fails
- Error: "Giá combo phải nhỏ hơn giá gốc"

---

### ADM-PRO-18 — Create: combo_price < original_price accepted

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. combo_price = `500000`, original_price = `1000000`
2. Save

**Pass criteria:**
- Refine passes; promotion saved

---

### ADM-PRO-19 — Create: negative combo_price accepted (boundary document)

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. combo_price = `-100` (negative)
2. original_price = `1000000`
3. Save

**Pass criteria:**
- `-100 < 1000000` passes refine → accepted
- **Document:** no min(0) validation on combo_price; negative prices can be saved

---

### ADM-PRO-20 — Create promotion with required fields saves correctly

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Fill:
   - code: `SUMMER2026`
   - discount_percentage: `20`
   - title_vi: `Khuyến mãi Mùa Hè 2026`
   - status: `draft`
2. Save

**Pass criteria:**
- Row in `promotions` table
- `items` = empty array
- `status = 'draft'`

---

### ADM-PRO-21 — Create promotion and link products creates product_promotions rows

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Products "Product A" (UUID-A) and "Product B" (UUID-B) exist.

**Steps:**
1. Create promotion `SUMMER2026`
2. In the **Sản phẩm áp dụng** (items) multi-select: select Product A and Product B
3. Save

**Pass criteria:**
- `SELECT * FROM product_promotions WHERE promotion_id = '<summer_id>'` → 2 rows
- Row 1: `product_id = UUID-A`
- Row 2: `product_id = UUID-B`

---

### ADM-PRO-22 — Create promotion with cover image links cover_media_id

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Upload a banner JPG in the promotion cover image zone
2. Fill required fields
3. Save

**Pass criteria:**
- `SELECT cover_media_id FROM promotions WHERE id = '<id>'` is a non-null UUID
- Corresponding `media_assets` row has `size_bytes > 0`

---

### ADM-PRO-23 — Active promotion appears on public /vi/promotions page

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Create promotion with:
   - start_at: yesterday's date
   - end_at: tomorrow's date
   - status: `published`
   - title_vi: `Khuyến mãi Live Test`
2. Navigate to `http://localhost:3000/vi/promotions`

**Pass criteria:**
- Promotion card visible with title "Khuyến mãi Live Test"
- Cover image shown (if uploaded)
- combo_price shown

---

### ADM-PRO-24 — Future promotion NOT shown on public page

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Create promotion with start_at = `2027-01-01`, status = `published`
2. Navigate to `/vi/promotions`

**Pass criteria:**
- Promotion NOT visible on the public page (start date in future)
- Verify: public page uses `new Date()` not a hardcoded date (BLK-07 check)

**Fail criteria:**
- Promotion shows despite future start date (hardcoded date bug)

---

### ADM-PRO-25 — Expired promotion NOT shown on public page

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Create promotion with end_at = `2024-01-01` (past), status = `published`
2. Navigate to `/vi/promotions`

**Pass criteria:**
- Promotion NOT visible

---

### ADM-PRO-26 — RPC public_promotions returns cover_media_url

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Active published promotion with cover image exists.

**Steps:**
1. Using Supabase MCP or psql: call `SELECT * FROM public_promotions()` (or however the RPC is named)

**Pass criteria:**
- Response includes `cover_media_url` field with a valid Cloudinary URL

---

### ADM-PRO-27 — RPC returns original_price and combo_price fields

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Call the promotions RPC

**Pass criteria:**
- `original_price` and `combo_price` fields present and non-null (if set)

---

### ADM-PRO-28 — Soft delete promotion sets deleted_at

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Delete a promotion
2. Query: `SELECT deleted_at FROM promotions WHERE id = '<id>'`

**Pass criteria:**
- `deleted_at IS NOT NULL`

---

### ADM-PRO-29 — Delete promotion with linked products: product_promotions rows

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Promotion "SUMMER2026" has 2 linked products
2. Delete promotion
3. Query: `SELECT * FROM product_promotions WHERE promotion_id = '<summer_id>'`

**Pass criteria:**
- Verify ON DELETE behavior: either rows remain (FK no cascade) or are deleted (ON DELETE CASCADE)
- **Document the actual behavior** — `product_promotions` likely has ON DELETE CASCADE from `promotions(id)`

---

### ADM-PRO-30 — Audit log on promotion create

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Create promotion
2. Query audit_logs for `entity_type = 'promotion'`, `action = 'create'`

**Pass criteria:**
- Row exists with correct actor and entity

---

### ADM-PRO-31 — Edit form loads existing promotion data

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Click edit on promotion "SUMMER2026"

**Pass criteria:**
- code = `SUMMER2026`
- discount_percentage = `20`
- title_vi = `Khuyến mãi Mùa Hè 2026`
- Date fields pre-populated

---

### ADM-PRO-32 — Edit start_at to past → promotion appears on client

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. A future promotion exists (not visible yet on client)
2. Edit: change start_at to `2026-01-01` (past date)
3. Save
4. Navigate to `/vi/promotions`

**Pass criteria:**
- Promotion now visible on public page

---

### ADM-PRO-33 — Edit start_at to future → promotion disappears from client

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. An active promotion is visible on client
2. Edit: change start_at to `2030-01-01`
3. Save
4. Navigate to `/vi/promotions`

**Pass criteria:**
- Promotion no longer visible

---

### ADM-PRO-34 — Edit: remove and add products in items list

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Promotion "SUMMER2026" has Product A and Product B linked
2. Edit: deselect Product A, add Product C
3. Save
4. Query: `SELECT product_id FROM product_promotions WHERE promotion_id = '<id>'`

**Pass criteria:**
- Product A gone (row deleted)
- Product B still present
- Product C added

---

### ADM-PRO-35 — Edit discount_percentage updates DB

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Edit promotion; change discount_percentage from 20 to 50
2. Save
3. Query: `SELECT discount_percentage FROM promotions WHERE id = '<id>'`

**Pass criteria:**
- = `50`

---

### ADM-PRO-36 — Edit status from draft to published

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Edit draft promotion; change status to published
2. Save

**Pass criteria:**
- `status = 'published'` in DB

---

### ADM-PRO-37 — Edit: start_at > end_at shows error

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Edit promotion; set end_at before start_at
2. Save

**Pass criteria:**
- Zod refine error

---

### ADM-PRO-38 — Hardcoded date check (BLK-07) in public page code

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Search the codebase for any hardcoded date strings used in promotion visibility logic:
   - `grep -r "2026-06-" app/`
   - `grep -r "new Date(\"" app/ components/`
2. Identify if any file contains something like `new Date("2026-06-19")` instead of `new Date()`

**Pass criteria:**
- No hardcoded dates found in promotion visibility/filtering logic
- All date comparisons use `new Date()` (current time)

**Fail criteria:**
- A hardcoded date found → promotions will show/hide incorrectly after that date passes

---

### ADM-PRO-39 — 0% discount promotion shows "0% OFF" badge

**Type:** E2E | **Priority:** 🟡 Medium

**Steps:**
1. Create published promotion with discount_percentage = 0, active date range
2. Navigate to `/vi/promotions`

**Pass criteria:**
- Promotion visible
- Badge shows "0% OFF" or equivalent
- **Document:** Is 0% discount a valid UX scenario? Should it be hidden?

---

### ADM-PRO-40 — badge_color with invalid CSS color stored without validation

**Type:** IT | **Priority:** 🟡 Medium

**Steps:**
1. Set badge_color = `not-a-color`
2. Save

**Pass criteria:**
- Stored as-is (no server validation on badge_color format)
- Public page attempts to use it as CSS color → renders incorrectly
- **Document this as a known validation gap**

---

## 📝 MODULE 7 — Blogs

### Prereqs
- Logged in as admin
- At least 1 blog category exists in DB

---

### ADM-BLG-01 — Blog list loads from DB

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Navigate to `/admin` → "Bài viết" (Blogs)

**Pass criteria:**
- Table shows all non-deleted blog posts with title (VI), category, status, author

---

### ADM-BLG-02 — Filter by status: published

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Select "Đã xuất bản" from status filter

**Pass criteria:**
- Only `blog_posts.status = 'published'` rows shown

---

### ADM-BLG-03 — Search by title keyword

**Type:** E2E | **Priority:** 🟠 High

**Steps:**
1. Type `Nội thất` in search input

**Pass criteria:**
- Only posts with "Nội thất" in title shown

---

### ADM-BLG-04 — Create: empty title_vi shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Open blog create form
2. Leave title_vi empty
3. Fill slug, excerpt_vi, category_id
4. Save

**Pass criteria:**
- Error: "Tiêu đề tiếng Việt là bắt buộc"

---

### ADM-BLG-05 — Create: whitespace-only title_vi shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. title_vi = `   ` → Save

**Pass criteria:**
- Same error as ADM-BLG-04

---

### ADM-BLG-06 — Create: title_vi with XSS stored safely

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. title_vi = `<script>alert('blog-xss')</script>`
2. Other fields valid; Save
3. View on `/vi/blog`

**Pass criteria:**
- Escaped; no alert

---

### ADM-BLG-07 — Create: empty excerpt_vi shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Fill title_vi, slug; leave excerpt_vi blank; Save

**Pass criteria:**
- Error: "Trích dẫn tiếng Việt là bắt buộc"

---

### ADM-BLG-08 — Create: whitespace-only excerpt_vi shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. excerpt_vi = `   ` → Save

**Pass criteria:**
- Same error as ADM-BLG-07

---

### ADM-BLG-09 — Create: empty slug shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Fill title_vi, excerpt_vi, category; leave slug empty; Save

**Pass criteria:**
- Error: "Slug không được để trống"

---

### ADM-BLG-10 — Create: slug with uppercase rejected

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. slug = `My-Blog-Post` → Save

**Pass criteria:**
- Regex rejects; error shown

---

### ADM-BLG-11 — Create: duplicate slug (same locale) rejected

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Blog post with slug `existing-blog-slug` exists for locale `vi`.

**Steps:**
1. Create new blog post with slug `existing-blog-slug`
2. Save

**Pass criteria:**
- DB unique index `uq_blog_post_translations_locale_slug` rejects
- Error shown

---

### ADM-BLG-12 — Create: empty category_id shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Fill all fields; leave category dropdown unselected; Save

**Pass criteria:**
- Error: "Danh mục bài viết là bắt buộc"

---

### ADM-BLG-13 — Create: non-existent category_id handled gracefully

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Intercept form submit; set category_id = `00000000-0000-0000-0000-000000000001` (valid UUID format, but not in DB)

**Pass criteria:**
- `resolveBlogCategoryId()` cannot find it → returns error "Blog category not found"
- No blog post created

---

### ADM-BLG-14 — Create blog post as draft succeeds

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Fill: title_vi = `Bài Viết Test`, slug = `bai-viet-test`, excerpt_vi = `Tóm tắt bài viết test`, category = (select any), status = `draft`
2. Save

**Pass criteria:**
- `blog_posts.status = 'draft'`
- `blog_posts.published_at IS NULL`
- `blog_post_translations` vi row exists

---

### ADM-BLG-15 — Create blog post and publish: both vi+en translations created automatically

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Fill only VI fields (title_vi, excerpt_vi, body_json_vi)
2. Status = `published`
3. Save

**Pass criteria:**
- `createAdminBlogPost` automatically inserts EN translation row (fallback to VI values)
- Trigger `trg_blog_posts_require_publish_translations` passes
- `blog_posts.status = 'published'`
- `published_at IS NOT NULL`
- Query: `SELECT locale FROM blog_post_translations WHERE post_id='<id>'` → 2 rows: 'vi' and 'en'

---

### ADM-BLG-16 — body_json serialized as valid JSONB in DB

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. In Tiptap editor: type a few paragraphs of text
2. Save blog post
3. Query: `SELECT body_json FROM blog_post_translations WHERE post_id='<id>' AND locale='vi'`

**Pass criteria:**
- `body_json` is not null
- Valid JSON structure (e.g., `{"sections": [{"id": "noi-dung", "title": "...", "body": "..."}]}`)
- Not an empty object `{}`

---

### ADM-BLG-17 — body_json round-trips correctly through editor

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Create blog post with rich text: heading "Tiêu đề H2", bold text "Văn bản đậm", bulleted list ["Item 1", "Item 2"]
2. Save
3. Re-open the blog post edit form
4. Inspect the Tiptap editor content

**Pass criteria:**
- H2 heading rendered as heading node
- Bold text rendered as bold
- Bulleted list rendered as list
- Content identical to what was saved (no data loss)

---

### ADM-BLG-18 — Cover image linked via cover_media_id

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Upload cover image in blog create form
2. Save
3. Query: `SELECT cover_media_id FROM blog_posts WHERE id='<id>'`

**Pass criteria:**
- `cover_media_id` is non-null UUID in `media_assets`

---

### ADM-BLG-19 — Soft delete blog post sets deleted_at

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Delete a blog post
2. Query: `SELECT deleted_at, status FROM blog_posts WHERE id='<id>'`

**Pass criteria:**
- `deleted_at IS NOT NULL`
- `status = 'archived'`
- Post not visible in admin list or public blog

---

### ADM-BLG-20 — Audit log on blog create

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. After creating a blog post
2. Query: `SELECT * FROM audit_logs WHERE entity_type='blog_post' AND action='create' ORDER BY created_at DESC LIMIT 1`

**Pass criteria:**
- Row exists with `entity_id`, `actor_id`

---

### ADM-BLG-21 — Audit log failure rolls back blog post

**Type:** IT | **Priority:** 🟠 High

**Preconditions:** Mock `writeAuditLog` to throw (e.g., by temporarily making `audit_logs` unwritable via RLS).

**Steps:**
1. Attempt blog post create
2. Observe

**Pass criteria:**
- `createAdminBlogPost`: in catch block after `writeAuditLog` fails → `await supabase.from("blog_posts").delete().eq("id", post.id)`
- Blog post NOT in DB
- Error returned to client

---

### ADM-BLG-22 — Blog category dropdown from real DB

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Open blog create form; click category dropdown

**Pass criteria:**
- Options match `SELECT name FROM blog_category_translations WHERE locale='vi'`

---

### ADM-BLG-23 — Published blog post appears on /vi/blog

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Publish a blog post
2. Navigate to `http://localhost:3000/vi/blog`

**Pass criteria:**
- Blog post card visible with correct title, cover, excerpt
- Excerpt matches excerpt_vi

---

### ADM-BLG-24 — Draft blog post NOT on /vi/blog

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Save blog post as draft
2. Navigate to `/vi/blog`

**Pass criteria:**
- Draft post NOT visible to public

---

### ADM-BLG-25 — Blog edit form loads existing data

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Click edit on blog post "Bài Viết Test"

**Pass criteria:**
- title_vi, excerpt_vi, slug, category, status pre-populated

---

### ADM-BLG-26 — Edit title_vi and save updates translation

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Change title_vi to `Bài Viết Test UPDATED`
2. Save
3. Query: `SELECT title FROM blog_post_translations WHERE post_id='<id>' AND locale='vi'`

**Pass criteria:**
- = `Bài Viết Test UPDATED`

---

### ADM-BLG-27 — Edit body_json and save updates DB

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Open blog edit
2. Clear editor content; type new text `Nội dung mới được cập nhật`
3. Save
4. Query: `SELECT body_json FROM blog_post_translations WHERE post_id='<id>' AND locale='vi'`

**Pass criteria:**
- `body_json` contains the new text
- `bodyJsonFromEditor()` serialized correctly

---

### ADM-BLG-28 — Edit category and save

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Change blog category to a different one
2. Save
3. Query: `SELECT category_id FROM blog_posts WHERE id='<id>'`

**Pass criteria:**
- New category_id saved

---

### ADM-BLG-29 — Edit status draft→published: post appears on /vi/blog

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Open draft blog post edit
2. Change status to published
3. Save
4. Navigate to `/vi/blog`

**Pass criteria:**
- Post now visible on public blog

---

### ADM-BLG-30 — Edit status published→archived: post disappears from /vi/blog

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Open published post edit
2. Change status to archived
3. Save
4. Navigate to `/vi/blog`

**Pass criteria:**
- Post no longer visible
- `deleted_at IS NOT NULL` in DB

---

### ADM-BLG-31 — Edit: duplicate slug rejected

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Edit blog post; change slug to an existing slug of another post
2. Save

**Pass criteria:**
- Unique constraint error

---

### ADM-BLG-32 — Empty Tiptap editor saves as empty JSON

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Blog create form; leave Tiptap body editor completely empty
2. Save

**Pass criteria:**
- `body_json` saved as `{"sections": [{"id":"noi-dung","title":"...","body":""}]}` or similar empty structure
- No crash

---

### ADM-BLG-33 — Plain text in Tiptap editor saves and renders

**Type:** E2E | **Priority:** 🟠 High

**Steps:**
1. Type plain text in editor: `Đây là nội dung bài viết đơn giản`
2. Save
3. Navigate to the blog post detail page

**Pass criteria:**
- Text visible on page
- Correct Vietnamese characters rendered

---

### ADM-BLG-34 — Formatted content (H2, bold, list) saves correctly

**Type:** E2E | **Priority:** 🟠 High

**Steps:**
1. In editor: add H2 heading "Tiêu đề Section 1"
2. Add bold paragraph "Nội dung **đậm**"
3. Add bulleted list: ["Item A", "Item B"]
4. Save
5. View on public blog detail page

**Pass criteria:**
- H2 rendered as `<h2>`
- Bold rendered as `<strong>` or `<b>`
- List rendered as `<ul><li>`

---

### ADM-BLG-35 — Paste HTML with script tag in editor: script removed

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Open Tiptap editor
2. Press Ctrl+Shift+V or use "Paste as text" to paste: `<b>Bold Text</b><script>alert('blog-body-xss')</script>`
3. Save
4. View blog post on public page

**Pass criteria:**
- `<script>` removed by Tiptap DOMParser
- `<b>Bold Text</b>` kept (or converted to Tiptap bold mark)
- No alert fires

---

### ADM-BLG-36 — Content preserved after save→edit→reopen

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Create blog post with rich formatted content (H2, bold, list)
2. Save
3. Close edit form; re-open the same post for editing
4. Compare editor content with what was originally typed

**Pass criteria:**
- 100% identical content
- No data loss or corruption

---

### ADM-BLG-37 — AI generate fills editor content

**Type:** E2E | **Priority:** 🟠 High

**Preconditions:** Gemini API key configured in settings. Logged in as admin.

**Steps:**
1. Open blog create form
2. Locate "Tạo nội dung bằng AI" (Generate by AI) button
3. Enter keywords/prompt: `nội thất gỗ óc chó cao cấp`
4. Click the button
5. Wait for AI response (up to 30s)

**Pass criteria:**
- Tiptap editor fills with AI-generated Vietnamese content
- No crash
- If API fails (504): error banner shown, original editor content unchanged

---

### ADM-BLG-38 — Editor can create blog post

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Logged in as editor.

**Steps:**
1. Create blog post as editor

**Pass criteria:**
- Succeeds; `requireEditorOrAdmin()` passes for editor

---

### ADM-BLG-39 — Upload blog cover image links cover_media_id

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Upload PNG as blog cover
2. Save
3. Query: `SELECT cover_media_id, size_bytes FROM blog_posts bp JOIN media_assets ma ON bp.cover_media_id = ma.id WHERE bp.id='<id>'`

**Pass criteria:**
- `cover_media_id` is non-null UUID; `size_bytes > 0`

---

### ADM-BLG-40 — Upload oversized blog cover rejected

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Drop file >10MB on blog cover upload zone

**Pass criteria:**
- Client-side rejection; no Cloudinary upload

---

### ADM-BLG-41 — EN translation auto-fallback on create (only VI filled)

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Create blog post with only VI fields; status = draft
2. Query: `SELECT locale, title, excerpt FROM blog_post_translations WHERE post_id='<id>'`

**Pass criteria:**
- 2 rows: vi and en
- EN row has: `title = vi_title`, `excerpt = vi_excerpt` (fallback values)

---

### ADM-BLG-42 — bodyJsonFromEditor returns correct structure

**Type:** IT | **Priority:** 🟡 Medium

**Steps:**
1. Create blog post with title_vi = "My Title" and body text "Some content"
2. Query: `SELECT body_json FROM blog_post_translations WHERE post_id='<id>' AND locale='vi'`

**Pass criteria:**
- JSON has structure: `{"sections": [{"id": "noi-dung", "title": "My Title", "body": "Some content"}]}`
- NOT a raw Tiptap prosemirror JSON (different format)

---

### ADM-BLG-43 — Creating with status=archived sets deleted_at at creation

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Intercept blog create; set status = `"archived"`
2. Save
3. Query: `SELECT deleted_at, status FROM blog_posts WHERE id='<id>'`

**Pass criteria:**
- `deleted_at IS NOT NULL` (set immediately on creation per mutations.ts code)
- `status = 'archived'`
- **Document:** Creating an archived post is unusual; verify this is the intended behavior

---

## 🏪 MODULE 8 — Showrooms

### Prereqs
- Logged in as admin
- Cloudinary configured for image upload

---

### ADM-SHW-01 — Showroom list loads from DB

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Navigate to `/admin` → "Showroom" in sidebar

**Pass criteria:**
- List of non-deleted showrooms with: code, name (VI), hotline, status

---

### ADM-SHW-02 — Published showroom map renders on public page

**Type:** E2E | **Priority:** 🔴 Critical

**Preconditions:** A published showroom with a valid Google Maps `https://` embed URL exists.

**Steps:**
1. Navigate to `/vi/showrooms`
2. Find the showroom card and click "Xem bản đồ"

**Pass criteria:**
- Map iframe visible and loading
- No XSS alert fires (embed URL was sanitized by DOMPurify on the server)
- `<iframe>` src attribute starts with `https://www.google.com/maps/embed`

---

### ADM-SHW-03 — Create: empty code shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Open showroom create form
2. Leave **Mã showroom** (code) empty
3. Fill name_vi, address_vi, hotline, google_maps URLs
4. Save

**Pass criteria:**
- Error: "Slug không được để trống" (code uses slugSchema)

---

### ADM-SHW-04 — Create: code with uppercase rejected

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. code = `HCM-01` (uppercase H, C, M) → Save

**Pass criteria:**
- slugSchema regex `/^[a-z0-9-]+$/` rejects
- Error: "Slug chỉ được chứa ký tự thường..."

---

### ADM-SHW-05 — Create: duplicate code (active) rejected

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Showroom with code `hcm-01` already exists (not deleted).

**Steps:**
1. Create showroom with code `hcm-01` → Save

**Pass criteria:**
- DB partial unique index `uq_showrooms_code_active` on `lower(code)` where `deleted_at IS NULL` → violation
- Error shown

---

### ADM-SHW-06 — Create: empty name_vi shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Fill code, address_vi, hotline, URLs; leave name_vi empty → Save

**Pass criteria:**
- Error: "Tên showroom tiếng Việt là bắt buộc"

---

### ADM-SHW-07 — Create: empty address_vi shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Fill code, name_vi, hotline, URLs; leave address_vi empty → Save

**Pass criteria:**
- Error: "Địa chỉ tiếng Việt là bắt buộc"

---

### ADM-SHW-08 — Create: empty hotline shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Fill code, name_vi, address_vi, URLs; leave hotline empty → Save

**Pass criteria:**
- Error: "Số hotline là bắt buộc"

---

### ADM-SHW-09 — Create: hotline with letters accepted (no phone format validation)

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. hotline = `abc-123` → Save (other fields valid)

**Pass criteria:**
- Saved (no phone format constraint in showroomSchema)
- **Document:** hotline field accepts any string — may want to add phone regex validation

---

### ADM-SHW-10 — Create: empty google_maps_embed_url shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Leave google_maps_embed_url empty → Save

**Pass criteria:**
- Error: "URL bản đồ nhúng bắt buộc"

---

### ADM-SHW-11 — Create: embed URL with http:// rejected by DB constraint

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. google_maps_embed_url = `http://maps.google.com/embed/v1/place?key=test` (http, not https)
2. Save

**Pass criteria:**
- DB constraint `chk_showrooms_map_urls_https` (`google_maps_embed_url ~* '^https://'`) rejects
- Error returned to UI

---

### ADM-SHW-12 — Create: XSS payload in embed URL sanitized by DOMPurify

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. google_maps_embed_url = `https://maps.google.com/"><script>alert('embed-xss')</script>`
2. Save

**Pass criteria:**
- Server: `DOMPurify.sanitize(validation.data.google_maps_embed_url)` removes `<script>`
- Stored URL is clean (DOMPurify output)
- No `alert()` on public showroom page

---

### ADM-SHW-13 — Create: iframe tag in embed URL sanitized

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. google_maps_embed_url = `<iframe src="https://evil.com">Inject</iframe>`
2. Save

**Pass criteria:**
- DOMPurify strips the iframe tag
- Stored value may be empty or stripped text
- **Document:** If the stored value is empty, the showroom map won't render

---

### ADM-SHW-14 — Create: XSS in name_vi stored safely

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. name_vi = `<script>alert('showroom-xss')</script>`
2. Save
3. View on `/vi/showrooms`

**Pass criteria:**
- Escaped; no alert

---

### ADM-SHW-15 — Create: latitude > 90 rejected by DB

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. latitude = `91`
2. Save

**Pass criteria:**
- DB constraint `chk_showrooms_coordinates` (`latitude BETWEEN -90 AND 90`) rejects
- Error shown

---

### ADM-SHW-16 — Create: longitude > 180 rejected by DB

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. longitude = `181` → Save

**Pass criteria:**
- DB constraint rejects

---

### ADM-SHW-17 — Create: valid coordinates accepted

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. latitude = `10.762622`, longitude = `106.660172`
2. Save

**Pass criteria:**
- Saved as `NUMERIC(10,7)` in DB

---

### ADM-SHW-18 — Create: empty fallback URL shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Fill embed URL; leave fallback URL empty → Save

**Pass criteria:**
- Error: "URL bản đồ dự phòng bắt buộc"

---

### ADM-SHW-19 — Create showroom as draft

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Fill all required fields, status = draft
2. Save
3. Query: `SELECT status FROM showrooms WHERE id='<id>'`

**Pass criteria:**
- `status = 'draft'`

---

### ADM-SHW-20 — Publish showroom requires vi+en translations (trigger)

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Intercept showroom create; only send VI translation data; set status=published
2. Save

**Pass criteria:**
- `trg_showrooms_require_publish_translations` fires
- Error: "Cannot publish showrooms without required vi and en translations"

---

### ADM-SHW-21 — Publish showroom with both translations succeeds

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Create showroom with name_vi AND name_en, address_vi AND address_en; status = published
2. Save (note: mutations.ts auto-inserts both vi and en when creating)
3. Query: `SELECT status, published_at FROM showrooms WHERE id='<id>'`

**Pass criteria:**
- `status = 'published'`, `published_at IS NOT NULL`

---

### ADM-SHW-22 — Cover image linked in showroom_media

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Upload cover image
2. Save
3. Query: `SELECT is_primary, media_id FROM showroom_media WHERE showroom_id='<id>'`

**Pass criteria:**
- 1 row with `is_primary = true`, valid `media_id`

---

### ADM-SHW-23 — Audit log on showroom create

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Create showroom
2. Query audit_logs for `entity_type='showroom'`, `action='create'`

**Pass criteria:**
- Row exists

---

### ADM-SHW-24 — Audit log failure rolls back showroom

**Type:** IT | **Priority:** 🟠 High

**Preconditions:** Mock `writeAuditLog` to fail (e.g., block `audit_logs` INSERT via RLS).

**Steps:**
1. Attempt showroom create

**Pass criteria:**
- Catch block runs: `await supabase.from("showrooms").delete().eq("id", showroom.id)`
- Showroom NOT in DB
- Error returned to client

---

### ADM-SHW-25 — Soft delete showroom

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Delete showroom
2. Query: `SELECT deleted_at, status FROM showrooms WHERE id='<id>'`

**Pass criteria:**
- `deleted_at IS NOT NULL`, `status='archived'`

---

### ADM-SHW-26 — Published showroom appears on /vi/showrooms

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Publish a showroom with name_vi = `Showroom Test QA`
2. Navigate to `/vi/showrooms`

**Pass criteria:**
- Card with "Showroom Test QA" visible
- Address, hotline, map button present

---

### ADM-SHW-27 — Edit form loads existing showroom data

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Click edit on showroom

**Pass criteria:**
- All fields pre-populated: code, name_vi, address_vi, hotline, embed URL, fallback URL, lat/lng, status, sort_order

---

### ADM-SHW-28 — Edit embed URL with XSS sanitized on update

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Edit showroom
2. Change embed URL to `https://maps.google.com/"><script>alert('edit-xss')</script>`
3. Save

**Pass criteria:**
- DOMPurify.sanitize called in `updateAdminShowroom`
- Stored clean URL
- No alert on public page

---

### ADM-SHW-29 — Edit hotline and save

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Change hotline to `0987654321`
2. Save
3. Query: `SELECT hotline FROM showrooms WHERE id='<id>'`

**Pass criteria:**
- = `0987654321`

---

### ADM-SHW-30 — Edit cover image replaces showroom_media rows

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Edit showroom (has existing cover image)
2. Upload new cover image
3. Save
4. Query: `SELECT count(*) FROM showroom_media WHERE showroom_id='<id>'`

**Pass criteria:**
- Old rows deleted (mutations.ts: `await supabase.from("showroom_media").delete().eq("showroom_id", id)`)
- 1 new row with `is_primary=true`

---

### ADM-SHW-31 — Edit status draft→published

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Edit draft showroom; change status to published
2. Save
3. Query: `SELECT status, published_at FROM showrooms WHERE id='<id>'`

**Pass criteria:**
- `status='published'`, `published_at IS NOT NULL`

---

### ADM-SHW-32 — Stored XSS via embed URL on public page (BLK-04)

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Inspect the public showroom page source at `/vi/showrooms/<code>`
2. Find where the Google Maps embed URL is rendered
3. Check if it uses `dangerouslySetInnerHTML` with the raw DB value

**Pass criteria:**
- Embed URL is used as `src` attribute of `<iframe>` (safe)
- OR it passes through DOMPurify before being set
- `dangerouslySetInnerHTML` NOT used with the raw `google_maps_embed_url` DB value

**Fail criteria (current known risk):**
- `dangerouslySetInnerHTML={{ __html: showroom.google_maps_embed_url }}` found in code → XSS vector

---

### ADM-SHW-33 — DOMPurify behavior with valid Google Maps iframe HTML

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Submit a full Google Maps iframe HTML string as the embed URL:
   `<iframe src="https://www.google.com/maps/embed?pb=..." width="600" height="450" allowfullscreen></iframe>`
2. DOMPurify processes it server-side

**Pass criteria:**
- **Document the result:** DOMPurify may strip the `<iframe>` tag, leaving empty string or just the `src` URL
- If stripped: map functionality broken (expected behavior given how DOMPurify works by default)
- **Recommendation documented:** Map embed URL field should store only the URL, not full iframe HTML

---

### ADM-SHW-34 — code field is slug-format while name is freetext (no confusion)

**Type:** E2E | **Priority:** 🟡 Medium

**Steps:**
1. Create showroom with code `hcm-01` and name_vi `Showroom Quận 7 Hồ Chí Minh`
2. Verify the UI distinguishes these two fields clearly with labels

**Pass criteria:**
- Field labeled "Mã showroom" accepts only slug format
- Field labeled "Tên showroom" accepts freetext Vietnamese
- No confusion between the two in the UI

---

## 📩 MODULE 9 — Quote Requests

### Prereqs
- Logged in as admin (quotes are admin-only)
- At least 3 quote_requests in DB

---

### ADM-QTE-01 — Quote list accessible to admin

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Navigate to `/admin` → "Báo giá" (Quotes)

**Pass criteria:**
- Table with quotes: full_name, phone, status badge, created_at
- Count matches: `SELECT count(*) FROM quote_requests WHERE deleted_at IS NULL`

---

### ADM-QTE-02 — Quote list blocked for editor role

**Type:** E2E | **Priority:** 🔴 Critical

**Preconditions:** Logged in as editor.

**Steps:**
1. Try to navigate to `/admin/quotes`

**Pass criteria:**
- `proxy.ts`: `/admin/quotes` is in `ADMIN_ONLY_PREFIXES` → redirect to `/admin/access-denied`
- Quote data NOT visible

---

### ADM-QTE-03 — Filter by status: new

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Open quotes list
2. Click status filter → select "Chờ xử lý" (new)

**Pass criteria:**
- Only quotes with `status='new'` shown

---

### ADM-QTE-04 — Filter by status: contacted

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Select "Đã liên hệ" (contacted) filter

**Pass criteria:**
- Only `status='contacted'` quotes shown

---

### ADM-QTE-05 — Search by customer name

**Type:** E2E | **Priority:** 🟠 High

**Preconditions:** Quote from "Trần Văn B" exists.

**Steps:**
1. In search box: type `Trần Văn B`

**Pass criteria:**
- Only quotes where full_name matches shown

---

### ADM-QTE-06 — Search by phone number

**Type:** E2E | **Priority:** 🟠 High

**Steps:**
1. Type `0912` in search

**Pass criteria:**
- Quotes with phone containing `0912` shown

---

### ADM-QTE-07 — Clear search shows all quotes

**Type:** E2E | **Priority:** 🟡 Medium

**Steps:**
1. Type `0912` in search → clear the field

**Pass criteria:**
- All quotes shown again

---

### ADM-QTE-08 — Pagination: page 1 shows max 50 quotes

**Type:** IT | **Priority:** 🟠 High

**Preconditions:** >50 quotes in DB.

**Steps:**
1. Open quote list

**Pass criteria:**
- 50 rows shown; pagination visible

---

### ADM-QTE-09 — Pagination: navigate to page 2

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Click next page

**Pass criteria:**
- Next 50 quotes shown

---

### ADM-QTE-10 — Quote detail dialog opens with full data

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Click on any quote row in the list

**Pass criteria:**
- Modal/dialog opens
- Shows: full_name, phone, email (if set), company, message, source_path, status, created_at
- Events timeline visible

---

### ADM-QTE-11 — Events log shows 'created' event

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Open quote detail for a newly submitted quote

**Pass criteria:**
- Timeline shows 1 event: `event_type = 'created'`
- `created_at` timestamp shown

---

### ADM-QTE-12 — Events log shows status-change events

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Quote has been updated from 'new' to 'contacted'.

**Steps:**
1. Open quote detail

**Pass criteria:**
- Timeline shows 2 events: 'created' and a status change event
- Status change event shows `old_status = 'new'`, `new_status = 'contacted'`

---

### ADM-QTE-13 — QuoteTimeline renders events in chronological order

**Type:** E2E | **Priority:** 🟠 High

**Steps:**
1. Open a quote with 3+ events

**Pass criteria:**
- Events displayed oldest first (or newest first if that's the design) — consistently ordered

---

### ADM-QTE-14 — Status change: new → contacted via RPC

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Open a quote with status 'new'
2. Click "Cập nhật trạng thái" → select "Đã liên hệ"
3. Confirm

**Pass criteria:**
- `update_quote_status` RPC called with `p_status = 'contacted'`
- `quote_requests.status = 'contacted'` in DB
- New event row in `quote_request_events`

---

### ADM-QTE-15 — Status change: contacted → resolved

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Open a quote with status 'contacted'
2. Change to "Đã giải quyết" (resolved)
3. Save

**Pass criteria:**
- `status = 'resolved'` in DB
- New event row

---

### ADM-QTE-16 — Status change to invalid value blocked

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Intercept RPC call
2. Change `p_status = 'cancelled'`
3. Execute

**Pass criteria:**
- If 'cancelled' is not in `quote_status` enum: Postgres raises error
- UI handles gracefully (error toast, not crash)
- **Document:** What enum values exist? Query: `SELECT enum_range(NULL::quote_status)`

---

### ADM-QTE-17 — RPC uses session client (not service client)

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Check code: `admin-queries.ts` - `getAdminQuotesList` and `updateQuoteStatus`
2. Verify which supabase client is used

**Pass criteria:**
- Session client used: `auth.uid()` is populated → RLS policies on `quote_requests` and `quote_request_events` apply
- Service-role client NOT used (would bypass RLS for user context)

---

### ADM-QTE-18 — Status update writes event row

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Change quote status from 'new' to 'contacted'
2. Query: `SELECT * FROM quote_request_events WHERE quote_id='<id>' ORDER BY created_at DESC LIMIT 1`

**Pass criteria:**
- Row with: `actor_id = admin.id`, `old_status = 'new'`, `new_status = 'contacted'`, `created_at` timestamp

---

### ADM-QTE-19 — Admin notes saved on status update

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Change status; in notes field: type `Đã gọi điện, khách hài lòng`
2. Save
3. Query: `SELECT admin_notes FROM quote_requests WHERE id='<id>'`

**Pass criteria:**
- = `Đã gọi điện, khách hài lòng`

---

### ADM-QTE-20 — Editor cannot update quote status (if restricted)

**Type:** IT | **Priority:** 🟠 High

**Preconditions:** Logged in as editor.

**Steps:**
1. Note: `/admin/quotes` is in ADMIN_ONLY_PREFIXES → editor cannot even reach this page
2. Verify: try to reach `/admin/quotes` as editor

**Pass criteria:**
- Redirected to access-denied
- Cannot update status at all (route blocked at proxy level)

---

### ADM-QTE-21 — Public form submission creates quote_request row

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Navigate to `http://localhost:3000/vi` (homepage)
2. Fill and submit the contact/quote form:
   - full_name: `Nguyễn Thị C`
   - phone: `0901234567`
   - message: `Tôi muốn tư vấn về sofa góc`
3. After submit, query: `SELECT * FROM quote_requests WHERE full_name='Nguyễn Thị C' ORDER BY created_at DESC LIMIT 1`

**Pass criteria:**
- Row inserted with correct full_name, phone, message
- `status = 'new'`
- `quote_request_events` row with `event_type='created'`
- `source_path` = `/vi` or the page path where form was submitted

---

### ADM-QTE-22 — Submitted quote appears in admin list

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Submit public quote form (ADM-QTE-21)
2. Log in as admin → navigate to quotes list

**Pass criteria:**
- New quote "Nguyễn Thị C" visible at top of list (ordered by created_at DESC)

---

### ADM-QTE-23 — Rate limiting: 5 rapid submissions from same IP

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Using curl or DevTools, send 6 rapid POST requests to `/api/contact` within 30 seconds
2. Observe responses

**Pass criteria:**
- First 1-3 succeed (or only 1 succeeds)
- Subsequent requests return HTTP 429 with rate-limit error
- Only 1 DB row created (or however many the rate limiter allows)

---

### ADM-QTE-24 — Phone constraint validated at DB level

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. POST to `/api/contact` with phone = `+++++++` (invalid format)
2. Observe response

**Pass criteria:**
- DB constraint `chk_quote_requests_phone_shape` (`phone ~ '^[0-9+().\\-\\s]{7,32}$'`) rejects
- HTTP 400 or 422 returned; user-friendly error shown

---

### ADM-QTE-25 — Email constraint validated at DB level

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. POST to `/api/contact` with email = `not-valid-email`
2. Observe response

**Pass criteria:**
- DB constraint `chk_quote_requests_email_shape` rejects
- Error returned

---

### ADM-QTE-26 — admin_quote_search RPC uses session client

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Check `admin-queries.ts` source code: `getAdminQuotesList` function
2. Verify: uses `createAdminClient()` which should be the authenticated session client

**Pass criteria:**
- `createAdminClient()` in `admin-queries.ts` is the service role client BUT the RPC itself has security policy
- The RPC function `admin_quote_search` requires `role='admin'` check internally
- **Document the auth mechanism: is it RLS, or is it server-side check before RPC call?**

---

### ADM-QTE-27 — QuoteDetailDialog shows friendly error on DB failure

**Type:** E2E | **Priority:** 🟠 High

**Steps:**
1. Temporarily break the quotes DB connection (e.g., wrong table name via mocking)
2. Open a quote detail dialog

**Pass criteria:**
- Dialog shows a friendly Vietnamese error: "Không thể tải thông tin. Vui lòng thử lại"
- Raw Supabase error NOT shown to user

---

## 👤 MODULE 10 — Users

### Prereqs
- Logged in as admin (user management is admin-only)

---

### ADM-USR-01 — User list accessible to admin

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Navigate to `/admin/users`

**Pass criteria:**
- Table shows: email, full_name, role badge, is_active status, created_at

---

### ADM-USR-02 — Editor cannot access /admin/users

**Type:** E2E | **Priority:** 🔴 Critical

**Preconditions:** Logged in as editor.

**Steps:**
1. Navigate to `/admin/users`

**Pass criteria:**
- `proxy.ts`: `/admin/users` in `ADMIN_ONLY_PREFIXES` → redirect to `/admin/access-denied`

---

### ADM-USR-03 — List shows only active users by default

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Open user list

**Pass criteria:**
- All displayed rows have `is_active = true` (unless a filter shows inactive)
- Count matches `SELECT count(*) FROM profiles WHERE is_active = true`

---

### ADM-USR-04 — Search user by email

**Type:** E2E | **Priority:** 🟠 High

**Steps:**
1. Type `editor@furniture.com` in search

**Pass criteria:**
- Only editor user shown

---

### ADM-USR-05 — Create user with editor role

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Click "Thêm người dùng" (Add User)
2. Fill: email = `neweditor@furniture.com`, full_name = `Editor Test`, role = `editor`, password = `Test@123456`
3. Save

**Pass criteria:**
- Row in `auth.users` with email `neweditor@furniture.com`
- Row in `profiles`: `role = 'editor'`, `is_active = true`

---

### ADM-USR-06 — Create user with empty email shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Open user create form; leave email blank; Save

**Pass criteria:**
- Error: email is required

---

### ADM-USR-07 — Create user with invalid email format shows error

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. email = `notanemail`; Save

**Pass criteria:**
- Zod / validation rejects
- DB constraint `chk_profiles_email_shape` would also reject
- Error shown

---

### ADM-USR-08 — Create user with duplicate email rejected

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** `admin@furniture.com` exists.

**Steps:**
1. Try to create user with email `admin@furniture.com`

**Pass criteria:**
- Supabase Auth: duplicate email error
- OR DB: `uq_profiles_email_lower` (case-insensitive unique) violation
- Error shown to admin

---

### ADM-USR-09 — Create user with empty full_name rejected

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. email valid; full_name = `   ` (spaces or blank); Save

**Pass criteria:**
- `chk_profiles_full_name_not_blank` (`compact_text(full_name) IS NOT NULL`) rejects
- Error shown

---

### ADM-USR-10 — Create admin user with role=admin

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Create user: email = `newadmin@furniture.com`, role = `admin`
2. Query: `SELECT role FROM profiles WHERE email = 'newadmin@furniture.com'`

**Pass criteria:**
- `role = 'admin'`

---

### ADM-USR-11 — Create editor user with role=editor

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Create user with role = `editor`
2. Query profiles table

**Pass criteria:**
- `role = 'editor'`

---

### ADM-USR-12 — Default role for new profile is editor (NOT admin)

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Create auth user without specifying role (e.g., via Supabase Auth directly)
2. Check `profiles.role`

**Pass criteria:**
- `role = 'editor'` (default via DB trigger)
- NOT 'admin', NOT null

---

### ADM-USR-13 — Edit user role: editor → admin

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Find editor user; click edit
2. Change role from 'editor' to 'admin'
3. Save
4. Query: `SELECT role FROM profiles WHERE id = '<id>'`

**Pass criteria:**
- `role = 'admin'`
- Editor can now access admin-only routes

---

### ADM-USR-14 — Edit user role: admin → editor

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Find an admin user (not the currently logged-in one)
2. Change role to editor
3. Save

**Pass criteria:**
- `role = 'editor'`
- That user loses access to admin-only routes on next navigation

---

### ADM-USR-15 — Deactivate a user

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Find an active user
2. Toggle `is_active` to false
3. Save
4. Query: `SELECT is_active FROM profiles WHERE id='<id>'`

**Pass criteria:**
- `is_active = false`

---

### ADM-USR-16 — Reactivate a deactivated user

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Find deactivated user
2. Toggle `is_active` to true
3. Save

**Pass criteria:**
- `is_active = true`

---

### ADM-USR-17 — Admin cannot deactivate themselves

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Admin user tries to deactivate their own account (is_active → false)
2. Save

**Pass criteria:**
- Error: "Không thể vô hiệu hóa tài khoản của chính bạn" or similar
- Own account remains `is_active = true`

---

### ADM-USR-18 — Admin cannot demote themselves

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Admin tries to change their own role from 'admin' to 'editor'
2. Save

**Pass criteria:**
- Error or block: "Cannot change your own role"
- Role remains 'admin'

---

### ADM-USR-19 — Newly created editor can log in

**Type:** E2E | **Priority:** 🔴 Critical

**Preconditions:** Editor `neweditor@furniture.com` created in ADM-USR-05.

**Steps:**
1. Log out
2. Log in as `neweditor@furniture.com` / `Test@123456`

**Pass criteria:**
- Login succeeds
- Lands on `/admin`
- Editor UI visible (limited sidebar)

---

### ADM-USR-20 — Newly created editor blocked from /admin/settings

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Logged in as `neweditor@furniture.com`
2. Navigate to `/admin/settings`

**Pass criteria:**
- Redirected to `/admin/access-denied`

---

### ADM-USR-21 — Deactivated user cannot log in

**Type:** E2E | **Priority:** 🔴 Critical

**Preconditions:** User `deactivated@furniture.com` has `is_active = false`.

**Steps:**
1. Log out
2. Attempt login as `deactivated@furniture.com`

**Pass criteria:**
- Either: `proxy.ts` line 72 checks `!profile.is_active` → redirect to `/admin/access-denied`
- OR: Supabase Auth itself denies deactivated users
- User cannot access any admin functionality

---

### ADM-USR-22 — profiles.email matches auth.users.email

**Type:** IT | **Priority:** 🟡 Medium

**Steps:**
1. Create new user via admin
2. Query: `SELECT p.email, au.email FROM profiles p JOIN auth.users au ON p.id = au.id WHERE p.email = 'neweditor@furniture.com'`

**Pass criteria:**
- Both columns return the same email

---

### ADM-USR-23 — last_login_at updated on login

**Type:** IT | **Priority:** 🟡 Medium

**Steps:**
1. Note current `last_login_at` for a user
2. Log out; log back in as that user
3. Query: `SELECT last_login_at FROM profiles WHERE email = 'admin@furniture.com'`

**Pass criteria:**
- `last_login_at` updated to current timestamp (within last 60 seconds)

---

## ⚙️ MODULE 11 — Settings

### Prereqs
- Logged in as admin (settings are admin-only)
- `NEXT_PUBLIC_USE_MOCK_DATA=false`

---

### ADM-SET-01 — Settings GET returns 200 for admin

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. As admin: `GET http://localhost:3000/api/admin/settings`
   (or navigate to `/admin/settings` and open Network tab to see the GET call)

**Pass criteria:**
- HTTP 200
- Response contains: `brandNameVi`, `contactPhone`, `contactEmail`, `heroHeadlineVi`, etc.

---

### ADM-SET-02 — Settings GET blocked for editor

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Logged in as editor.

**Steps:**
1. GET `http://localhost:3000/api/admin/settings` (use DevTools)

**Pass criteria:**
- HTTP 401; `{ "error": "Unauthorized" }`

---

### ADM-SET-03 — Settings GET blocked for anonymous

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** No session cookies.

**Steps:**
1. GET `/api/admin/settings`

**Pass criteria:**
- HTTP 401

---

### ADM-SET-04 — API keys returned as masked hints

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Admin GET `/api/admin/settings`
2. Inspect `resendKey` and `geminiKey` fields in response

**Pass criteria:**
- Both fields = masked hint (e.g., `"re_****...xyz"` NOT the full key)
- Full key NOT in response

---

### ADM-SET-05 — Settings page shows API key fields as password type

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Navigate to `/admin/settings` → "Tích hợp" (Integrations) tab
2. Inspect Resend API Key and Gemini API Key input fields in DOM

**Pass criteria:**
- `<input type="password">` for both fields
- Characters shown as dots/asterisks

---

### ADM-SET-06 — Eye icon toggles API key field visibility

**Type:** E2E | **Priority:** 🟠 High

**Steps:**
1. On settings integrations tab
2. Click the eye icon next to the Resend API key field

**Pass criteria:**
- Field type changes from `password` to `text`
- Masked hint (e.g., `re_****...xyz`) becomes visible as text
- Click eye again → back to `password` type

---

### ADM-SET-07 — PUT: empty brandNameVi returns 400

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. PUT `/api/admin/settings` with body: `{ brandNameVi: "", contactPhone: "0901234567", contactEmail: "contact@test.com", addressVi: "Test Address" }`

**Pass criteria:**
- HTTP 400
- Body: `{ "error": "Dữ liệu cấu hình không hợp lệ", "details": { "brandNameVi": ... } }`

---

### ADM-SET-08 — PUT: whitespace-only brandNameVi returns 400

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. PUT with `brandNameVi = "   "`

**Pass criteria:**
- Zod `.trim().min(1)` → empty → 400

---

### ADM-SET-09 — PUT: empty contactPhone returns 400

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. PUT with `contactPhone = ""`

**Pass criteria:**
- 400 with phone required error

---

### ADM-SET-10 — PUT: empty contactEmail returns 400

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. PUT with `contactEmail = ""`

**Pass criteria:**
- 400 with email required error

---

### ADM-SET-11 — PUT: invalid contactEmail format returns 400

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. PUT with `contactEmail = "not-valid-email"`

**Pass criteria:**
- Zod `z.string().trim().email()` rejects → 400

---

### ADM-SET-12 — PUT: invalid quoteSenderEmail handled

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. PUT with `quoteSenderEmail = "not-email"` (non-empty, non-valid)

**Pass criteria:**
- Zod: `z.string().trim().email().optional().or(z.string().max(0))` — "not-email" is non-empty and fails email format → 400

---

### ADM-SET-13 — PUT: empty addressVi returns 400

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. PUT with `addressVi = ""`

**Pass criteria:**
- 400

---

### ADM-SET-14 — PUT: XSS in brandNameVi stored safely

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. PUT with `brandNameVi = "<script>alert('settings-xss')</script>"`
2. View public homepage

**Pass criteria:**
- Stored as escaped text
- No script executes in site header/title

---

### ADM-SET-15 — PUT: SQL injection in contactPhone stored as literal

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. PUT with `contactPhone = "'; DROP TABLE site_settings;--"`

**Pass criteria:**
- Stored as literal string
- Table not dropped
- No 500 error

---

### ADM-SET-16 — slaHours as string accepted

**Type:** IT | **Priority:** 🟡 Medium

**Steps:**
1. PUT with `slaHours = "24"` (string)

**Pass criteria:**
- Accepted by `z.union([z.string(), z.number()])` → 200

---

### ADM-SET-17 — featuredMaxItems as number accepted

**Type:** IT | **Priority:** 🟡 Medium

**Steps:**
1. PUT with `featuredMaxItems = 4` (number)

**Pass criteria:**
- Accepted → saved in `content_page_translations.body_json`

---

### ADM-SET-18 — AI_SECRET_ENCRYPTION_KEY wrong length returns 500

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Set `AI_SECRET_ENCRYPTION_KEY` to a 10-char string in env.

**Steps:**
1. PUT with new `resendKey = "re_test_key_123"`

**Pass criteria:**
- Server: key length check (`!== 32 && !== 64`) → 500: "Server encryption key misconfigured"

---

### ADM-SET-19 — PUT updates site_settings row

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. PUT with `contactPhone = "0999888777"`
2. Query: `SELECT contact_phone FROM site_settings WHERE singleton_key='default'`

**Pass criteria:**
- = `0999888777`

---

### ADM-SET-20 — PUT upserts site_setting_translations vi row

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. PUT with `brandNameVi = "Showroom Test Updated"`
2. Query: `SELECT brand_name FROM site_setting_translations WHERE site_settings_id='<id>' AND locale='vi'`

**Pass criteria:**
- = `Showroom Test Updated`

---

### ADM-SET-21 — PUT upserts site_setting_translations en row

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. PUT with `brandNameEn = "Test Showroom Updated EN"`
2. Query for locale='en'

**Pass criteria:**
- = `Test Showroom Updated EN`

---

### ADM-SET-22 — PUT encrypts and stores resend API key

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. PUT with `resendKey = "re_live_test_123abc456def789ghi"`
2. Query: `SELECT encrypted_value, masked_hint FROM integration_secrets WHERE key_name='resend_api_key'`

**Pass criteria:**
- `encrypted_value` is non-null and NOT equal to the plain key (it's encrypted)
- `masked_hint` matches pattern like `re_****...ghi`

---

### ADM-SET-23 — PUT skips saving masked hint as new value

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. First PUT: save `resendKey = "re_live_test_real"` → note `encrypted_value = VALUE_A`
2. Second PUT: send `resendKey = "****...eal"` (the masked hint from the GET response)
3. Query: `encrypted_value` in `integration_secrets`

**Pass criteria:**
- `encrypted_value` remains `VALUE_A` (unchanged) — the masked hint starting with `"****"` was skipped per mutations logic: `if (item.value && !item.value.startsWith("****"))`

---

### ADM-SET-24 — PUT upserts content_page_translations for home (vi)

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. PUT with `heroHeadlineVi = "Tiêu đề Hero Test"`
2. Query: `SELECT body_json FROM content_page_translations WHERE page_id IN (SELECT id FROM content_pages WHERE key='home') AND locale='vi'`

**Pass criteria:**
- `body_json->>'heroHeadlineVi' = 'Tiêu đề Hero Test'`

---

### ADM-SET-25 — Save settings → public homepage hero updates

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. PUT settings with `heroHeadlineVi = "Không gian sống hoàn hảo TEST"`
2. Navigate to `http://localhost:3000/vi`
3. Observe hero section

**Pass criteria:**
- Hero headline reads "Không gian sống hoàn hảo TEST"

---

### ADM-SET-26 — Save contactPhone → client shows new phone

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. PUT with `contactPhone = "0912 345 678"`
2. Navigate to `/vi` or `/vi/contact`

**Pass criteria:**
- New phone number visible in page footer/contact section

---

### ADM-SET-27 — Save contactEmail → client shows new email

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. PUT with `contactEmail = "newcontact@furniture.vn"`
2. View contact page

**Pass criteria:**
- New email visible

---

### ADM-SET-28 — revalidatePath called after PUT

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. PUT settings
2. Immediately navigate to `/vi` in another tab (no hard reload needed)

**Pass criteria:**
- Updated content shows within 1 navigation
- `triggerRevalidation()` invalidated Next.js cache for `/` layout

---

### ADM-SET-29 — Logo upload saves and appears in navbar

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Upload new logo via settings logo upload zone
2. Save settings
3. Navigate to `/vi`

**Pass criteria:**
- New logo appears in site navbar
- `site_settings.logo_media_id` = valid UUID in `media_assets` with `size_bytes > 0`

---

### ADM-SET-30 — Favicon saved correctly

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Upload favicon.ico
2. Save settings
3. Check browser tab icon on next load

**Pass criteria:**
- Favicon updated in browser tab

---

### ADM-SET-31 — Singleton_key uniqueness enforced

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Directly attempt: `INSERT INTO site_settings (singleton_key, ...) VALUES ('custom', ...)`

**Pass criteria:**
- `chk_site_settings_singleton_default` constraint rejects (only 'default' allowed)
- DB error returned

---

### ADM-SET-32 — Toggle heroVisible=false hides hero on homepage

**Type:** E2E | **Priority:** 🟠 High

**Steps:**
1. PUT with `heroVisible = false`
2. Navigate to `/vi`

**Pass criteria:**
- Hero section not rendered (or has `display:none` class)

---

### ADM-SET-33 — Toggle aboutVisible=false hides about section

**Type:** E2E | **Priority:** 🟠 High

**Steps:**
1. PUT with `aboutVisible = false`
2. Navigate to `/vi`

**Pass criteria:**
- About section not rendered

---

### ADM-SET-34 — featuredMaxItems controls product count on homepage

**Type:** E2E | **Priority:** 🟠 High

**Steps:**
1. PUT with `featuredMaxItems = 3`
2. Navigate to `/vi`

**Pass criteria:**
- Featured products section shows ≤3 items

---

### ADM-SET-35 — Trust badge content updates on homepage

**Type:** E2E | **Priority:** 🟠 High

**Steps:**
1. PUT with `badge1ValueVi = "30+"`, `badge1DescVi = "Năm kinh nghiệm"`
2. Navigate to `/vi`

**Pass criteria:**
- Badge shows "30+" and "Năm kinh nghiệm"

---

### ADM-SET-36 — resolveMediaId creates ghost asset with size_bytes=1 (known issue)

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Submit settings with `logoUrl = "https://res.cloudinary.com/test/logo.png"` (a direct URL, not a UUID that exists in media_assets)
2. Query: `SELECT size_bytes, mime_type FROM media_assets ORDER BY created_at DESC LIMIT 1`

**Pass criteria (expected failure — document the issue):**
- New `media_assets` row created with `size_bytes = 1`, `mime_type = 'image/png'` (ghost asset)
- **Document:** This is a known data quality issue. Logo should be uploaded via the upload endpoint first, returning a UUID

---

### ADM-SET-37 — Settings GET returns hardcoded defaults when DB empty

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. On a fresh DB with no `site_settings` row
2. GET `/api/admin/settings`

**Pass criteria:**
- Returns 200 with hardcoded fallback values:
  - `contactPhone: "08172 357 587"` (verify this is not a real phone number)
  - `contactEmail: "contact@phuongdong.vn"`
- **Document:** If these are real production contact details hardcoded in source code, they should be moved to environment variables

---

### ADM-SET-38 — singleton_key check constraint allows only 'default'

**Type:** IT | **Priority:** 🟡 Medium

**Steps:**
1. Via psql: `INSERT INTO site_settings (singleton_key, ...) VALUES ('custom', ...)`

**Pass criteria:**
- `chk_site_settings_singleton_default` fires: "check constraint violation"

---

## 🖼️ MODULE 12 — Media Library

### Prereqs
- Logged in as admin
- Cloudinary credentials configured

---

### ADM-MED-01 — Media list loads from DB

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Navigate to `/admin/media` (or media section in sidebar)

**Pass criteria:**
- Grid/list of non-deleted media_assets
- Count matches: `SELECT count(*) FROM media_assets WHERE deleted_at IS NULL`

---

### ADM-MED-02 — Pagination in media list

**Type:** IT | **Priority:** 🟠 High

**Preconditions:** >50 media assets.

**Steps:**
1. View media list; navigate to next page

**Pass criteria:**
- Different set of assets shown; pagination works

---

### ADM-MED-03 — Search media by filename

**Type:** E2E | **Priority:** 🟠 High

**Steps:**
1. Type filename keyword in search

**Pass criteria:**
- Only matching assets shown

---

### ADM-MED-04 — Filter by media type (image/video)

**Type:** E2E | **Priority:** 🟡 Medium

**Steps:**
1. Select "Image" filter

**Pass criteria:**
- Only `resource_type = 'image'` assets shown

---

### ADM-MED-05 — Upload valid JPG via /api/admin/media/upload

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. As admin, POST to `/api/admin/media/upload` with:
   ```json
   {
     "public_id": "test/product_image_001",
     "secure_url": "https://res.cloudinary.com/yourcloud/image/upload/test/product_image_001.jpg",
     "format": "jpg",
     "bytes": 204800,
     "width": 1920,
     "height": 1080,
     "original_filename": "product_image_001",
     "resource_type": "image"
   }
   ```
2. Check response

**Pass criteria:**
- HTTP 200
- Response: `{ "id": "<uuid>", "public_url": "https://res.cloudinary.com/...", "created_at": "..." }`
- DB row: `SELECT * FROM media_assets WHERE id='<uuid>'`
  - `size_bytes = 204800`
  - `mime_type = 'image/jpeg'`
  - `format = 'jpg'`
  - `original_filename = 'product_image_001'`
  - `cloudinary_public_id = 'test/product_image_001'`

---

### ADM-MED-06 — Upload valid PNG

**Type:** IT | **Priority:** 🔴 Critical

**Steps:** Same as ADM-MED-05 with `format: "png"`, `secure_url` ending in `.png`

**Pass criteria:**
- `mime_type = 'image/png'`, `format = 'png'`

---

### ADM-MED-07 — Upload valid WebP

**Type:** IT | **Priority:** 🔴 Critical

**Steps:** Same with `format: "webp"`

**Pass criteria:**
- `mime_type = 'image/webp'`

---

### ADM-MED-08 — Upload valid AVIF

**Type:** IT | **Priority:** 🟠 High

**Steps:** Same with `format: "avif"`

**Pass criteria:**
- `mime_type = 'image/avif'`

---

### ADM-MED-09 — Upload valid GIF

**Type:** IT | **Priority:** 🟡 Medium

**Steps:** Same with `format: "gif"`

**Pass criteria:**
- `mime_type = 'image/gif'`

---

### ADM-MED-10 — Upload SVG: accepted but flagged as security risk

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. POST with `format: "svg"`, `resource_type: "image"`, valid Cloudinary SVG URL
2. Record result

**Pass criteria (document actual behavior):**
- API accepts SVG (in `ALLOWED_FORMATS`)
- DB row created
- **Action required: Verify SVG files are NOT served inline via `<img src>` with script execution possible, and CSP blocks inline scripts**

---

### ADM-MED-11 — Upload MP4 video accepted

**Type:** IT | **Priority:** 🟠 High

**Steps:** POST with `format: "mp4"`, `resource_type: "video"`

**Pass criteria:**
- HTTP 200; `resource_type = 'video'` in DB

---

### ADM-MED-12 — Upload unsupported PDF returns 400

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. POST to `/api/admin/media/upload` with `format: "pdf"`

**Pass criteria:**
- HTTP 400
- Body: `{ "error": "Format 'pdf' is not allowed. Allowed formats: jpg, jpeg, png, webp, avif, gif, svg, mp4, webm" }`

---

### ADM-MED-13 — Upload .sh extension returns 400

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. POST with `format: "sh"`

**Pass criteria:**
- HTTP 400; format not allowed

---

### ADM-MED-14 — Upload .exe returns 400

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. POST with `format: "exe"`

**Pass criteria:**
- HTTP 400

---

### ADM-MED-15 — Upload >50MB returns 400

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. POST with `bytes: 52428801` (50MB + 1 byte)

**Pass criteria:**
- HTTP 400: `{ "error": "File size 52428801 bytes exceeds maximum of 52428800 bytes (50MB)" }`

---

### ADM-MED-16 — Upload with bytes=0 fails DB constraint (known issue)

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. POST with `bytes: 0`

**Pass criteria (expected failure — document):**
- API code: `size_bytes: bytes ?? 0` → 0 passed to DB
- DB constraint `chk_media_assets_positive_size` (`size_bytes > 0`) → constraint violation
- API returns 500 "Failed to save media asset to database"
- **Action required: Change `bytes ?? 0` to return 400 if bytes is missing, or default to `bytes ?? 1` as minimum**

---

### ADM-MED-17 — Upload missing required fields returns 400

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. POST with only `{ "format": "jpg" }` (missing public_id and secure_url)

**Pass criteria:**
- HTTP 400: `{ "error": "Missing required fields: public_id, secure_url, format" }`

---

### ADM-MED-18 — Upload with non-Cloudinary URL returns 400

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. POST with `secure_url: "https://evil.com/malicious.jpg"`

**Pass criteria:**
- HTTP 400: `{ "error": "URL must be from Cloudinary" }`

---

### ADM-MED-19 — Upload without authentication returns 401

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** No session cookies.

**Steps:**
1. POST to `/api/admin/media/upload` without auth

**Pass criteria:**
- HTTP 401: `{ "error": "Unauthorized" }`

---

### ADM-MED-20 — original_filename stored correctly in DB

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. POST with `original_filename: "gheso_product_photo"`
2. Query: `SELECT original_filename FROM media_assets WHERE id='<returned_id>'`

**Pass criteria:**
- = `gheso_product_photo`

---

### ADM-MED-21 — size_bytes stored correctly from upload

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. POST with `bytes: 1048576` (1MB)
2. Query: `SELECT size_bytes FROM media_assets WHERE id='<returned_id>'`

**Pass criteria:**
- = `1048576` (exactly what was sent)
- NOT 0 or 1

---

### ADM-MED-22 — Duplicate cloudinary_public_id rejected

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. POST with `public_id: "test/duplicate_image"` → success
2. POST same `public_id: "test/duplicate_image"` again

**Pass criteria:**
- Second POST: DB partial unique index `uq_media_assets_cloudinary_public_id` violation
- API returns 500 "Failed to save media asset to database"
- Response includes the constraint violation message

---

### ADM-MED-23 — Malformed JSON body returns 400

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. POST to `/api/admin/media/upload` with body: `{ invalid json }`

**Pass criteria:**
- HTTP 400: `{ "error": "Invalid JSON body" }`

---

### ADM-MED-24 — Soft delete unused media asset

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. In media library, find an asset not linked to any entity
2. Click delete
3. Query: `SELECT deleted_at FROM media_assets WHERE id='<id>'`

**Pass criteria:**
- `deleted_at IS NOT NULL` (soft delete)
- Asset no longer shown in media library

---

### ADM-MED-25 — Delete media referenced by product: FK behavior

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** `media_asset A` is referenced by `product_media.media_id`.

**Steps:**
1. Try to delete media asset A

**Pass criteria:**
- Either: FK constraint prevents deletion → error "Asset is in use"
- Or: soft-delete proceeds but `product_media.media_id` still references it (product image broken)
- **Document the actual behavior**

---

### ADM-MED-26 — Delete media referenced by blog post

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Media used as `blog_posts.cover_media_id`.

**Steps:**
1. Try to delete that media asset

**Pass criteria:**
- Same FK behavior as ADM-MED-25
- **Document**

---

### ADM-MED-27 — Deleted media not shown in picker

**Type:** E2E | **Priority:** 🟠 High

**Steps:**
1. Soft-delete an asset
2. Open product create form → open media picker dialog

**Pass criteria:**
- Deleted asset NOT shown in picker

---

### ADM-MED-28 — Media picker opens in product form

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Open product create/edit form
2. Click "Chọn từ thư viện" (Choose from library) for cover image

**Pass criteria:**
- Dialog/modal opens with existing media assets grid
- Pagination and search work in the picker

---

### ADM-MED-29 — Selecting existing asset from picker sets it as cover

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Open media picker for product cover
2. Click on an existing asset → click "Chọn" (Select)
3. Save product

**Pass criteria:**
- Product form preview shows the selected image
- After save: `product_media` row with the asset's UUID as `media_id`
- NO new `media_assets` row created

---

### ADM-MED-30 — Selecting same asset twice doesn't create duplicate product_media row

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Select asset A as product cover → save (creates `product_media` with `media_id=A`)
2. Edit product; select same asset A again from picker → save

**Pass criteria:**
- Unique index `uq_product_media_one_primary_per_product` (`product_id` where `is_primary=true`) allows only 1 primary
- Or: old row deleted and new row inserted
- No duplicate rows in `product_media` for same product+media combo

---

### ADM-MED-31 — SVG with embedded JS accepted by upload API (known risk)

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. POST SVG with `public_id: "test/evil_svg"`, `format: "svg"`, `bytes: 200`
2. Note if accepted
3. Access the SVG URL in a browser
4. Check if inline script executes

**Pass criteria (current risk — document):**
- SVG accepted by API (by design — in ALLOWED_FORMATS)
- **If served inline:** browser executes embedded scripts → XSS
- **Verify:** Content-Security-Policy headers must block `script-src` for Cloudinary-hosted SVGs
- **Recommendation:** Remove SVG from ALLOWED_FORMATS or add SVG sanitization

---

### ADM-MED-32 — Missing bytes field causes 500 (known bug)

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. POST to upload without the `bytes` field: `{ "public_id": "test/nobytes", "secure_url": "https://res.cloudinary.com/test/nobytes.jpg", "format": "jpg" }`

**Pass criteria (expected failure — document bug):**
- Server code: `size_bytes: bytes ?? 0` → `bytes` is undefined → `size_bytes = 0`
- DB constraint `chk_media_assets_positive_size` rejects
- API returns 500 (should be 400)
- **Bug: should validate that `bytes` is present and > 0 before calling DB**

---

### ADM-MED-33 — Width/height = 0 rejected by DB

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. POST with `width: 0, height: 0, bytes: 204800`

**Pass criteria:**
- DB constraint `chk_media_assets_dimensions` (`width > 0 or null`) rejects width=0
- 500 returned with DB constraint message
- **Note:** constraint allows null but not 0

---

## 🔀 CROSS-MODULE AUDIT CASES

---

### ADM-CROSS-01 — NEXT_PUBLIC_USE_MOCK_DATA not set in production

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Run production build: `npm run build`
2. Check build output or `.env.production` for `NEXT_PUBLIC_USE_MOCK_DATA`
3. Start production server: `npm start`
4. Perform any admin CRUD operation

**Pass criteria:**
- `NEXT_PUBLIC_USE_MOCK_DATA` is NOT set or is `"false"` in production
- All mutations hit the real Supabase DB

**Fail criteria:**
- `NEXT_PUBLIC_USE_MOCK_DATA=true` in production → all admin actions write to mock in-memory data → data loss on restart

---

### ADM-CROSS-02 — console.log in admin-queries.ts line 372 present in production

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Run production server
2. Open admin product list
3. Check server console/terminal output

**Pass criteria (expected failure — document):**
- Terminal shows: `getAdminBlogPosts query result: { dataCount: N, error: null }`
- **Action: Remove or wrap in `process.env.NODE_ENV === 'development'` guard**

---

### ADM-CROSS-03 — Docker secrets not baked into image layers

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Build Docker image: `docker build -t furniture-web .`
2. Inspect layers: `docker history furniture-web --no-trunc`
3. Run: `docker run --rm furniture-web sh -c "cat .env.production 2>/dev/null || echo NOT_FOUND"`
4. Check for any layer containing `SUPABASE_SERVICE_ROLE_KEY`

**Pass criteria:**
- `.env.production` NOT found in image
- No `SUPABASE_SERVICE_ROLE_KEY` or `AI_SECRET_ENCRYPTION_KEY` in any layer

---

### ADM-CROSS-04 — triggerRevalidation() failure silently logged

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Temporarily mock `revalidatePath` to throw
2. Create any product via admin

**Pass criteria:**
- Mutation returns `{ success: true }` (revalidation failure does not block mutation)
- Server log shows warning about revalidation failure
- No 500 returned to client

---

### ADM-CROSS-05 — audit_logs.actor_id is never null on CRUD actions

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Perform create/update/delete for product, category, blog, showroom as admin
2. Query: `SELECT count(*) FROM audit_logs WHERE actor_id IS NULL`

**Pass criteria:**
- Count = 0 (all audit log rows have actor_id)

---

### ADM-CROSS-06 — Concurrent product create with same slug: one succeeds, one errors

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Open two browser tabs simultaneously; both on product create form
2. In both tabs, set same slug `concurrent-slug-test` with different names
3. Click Save in both tabs within 1 second of each other

**Pass criteria:**
- First request: product created
- Second request: DB unique constraint error → UI shows error
- Only 1 product in DB with that slug

---

### ADM-CROSS-07 — getOrCreateMediaAssetId creates ghost asset when URL passed (known issue)

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Create product with `cover_image = "https://res.cloudinary.com/existing/image.jpg"` (a URL, not UUID)
2. Save
3. Query: `SELECT * FROM media_assets WHERE public_url = 'https://res.cloudinary.com/existing/image.jpg' ORDER BY created_at DESC LIMIT 1`

**Pass criteria (expected failure — document):**
- A ghost media_assets row created with `size_bytes = 1`
- **Known issue:** should validate that cover_image is a pre-uploaded UUID, not a raw URL

---

### ADM-CROSS-08 — requireEditorOrAdmin throws on missing session

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Clear cookies
2. Attempt any server action: `createAdminProduct`, `createAdminBlogPost`, etc.

**Pass criteria:**
- `requireEditorOrAdmin()` throws
- Server action returns `{ success: false, error: "Unauthorized" }` or redirects
- No DB operations performed

---

### ADM-CROSS-09 — DOMPurify works correctly on server-side (Node.js)

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Create a showroom with embed URL containing an iframe
2. Check server logs for any DOMPurify-related errors

**Pass criteria:**
- `isomorphic-dompurify` runs without errors in Node.js environment
- Sanitization result is a string (not undefined)

---

### ADM-CROSS-10 — Zod error messages are always in Vietnamese

**Type:** E2E | **Priority:** 🟡 Medium

**Steps:**
1. With browser language set to English
2. Submit invalid product form (empty name_vi)

**Pass criteria:**
- Error message: "Tên sản phẩm tiếng Việt là bắt buộc" (Vietnamese)
- NOT in English (Zod messages are hardcoded in VI in admin.ts)
- **Document:** If the app has English admin users, Zod messages should be internationalized

---

### ADM-CROSS-11 — deleteAdminCategory does NOT delete media_assets

**Type:** IT | **Priority:** 🟠 High

**Preconditions:** Category has `image_media_id = UUID-A`.

**Steps:**
1. Delete (soft-delete) the category
2. Query: `SELECT * FROM media_assets WHERE id='UUID-A'`

**Pass criteria:**
- Media asset still exists (no cascade delete to media_assets)
- `deleted_at IS NULL` on the media asset (unaffected)

---

### ADM-CROSS-12 — deleteAdminProduct does NOT delete product_media rows

**Type:** IT | **Priority:** 🟠 High

**Preconditions:** Product has 3 `product_media` rows.

**Steps:**
1. Soft-delete the product (`deleted_at` set on `products`)
2. Query: `SELECT count(*) FROM product_media WHERE product_id='<id>'`

**Pass criteria:**
- 3 rows still exist (no cascade on product soft-delete)
- **Document:** orphan `product_media` rows exist for soft-deleted products; cleanup needed

---

### ADM-CROSS-13 — AI endpoints accessible to both admin and editor

**Type:** IT | **Priority:** 🟠 High

**Preconditions:** Logged in as editor.

**Steps:**
1. POST to `/api/admin/ai/generate` (or similar AI endpoint) as editor

**Pass criteria:**
- HTTP 200 (editor is allowed — `requireEditorOrAdmin()` passes)
- AI generation works for editor role

---

### ADM-CROSS-14 — AI endpoint blocked for anonymous

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. No session; POST to `/api/admin/ai/generate`

**Pass criteria:**
- HTTP 401 Unauthorized

---

### ADM-CROSS-15 — writeAuditLog failure mode differs by module

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Mock `audit_logs` INSERT to fail (RLS policy block)
2. Test create in:
   a. Blog post: `createAdminBlogPost`
   b. Showroom: `createAdminShowroom`
   c. Product: `createAdminProduct`
   d. Category: `createAdminCategory`

**Pass criteria:**
- Blog post: `catch(auditError)` → blog_post deleted → error returned ✓ (rollback)
- Showroom: same pattern → showroom deleted ✓ (rollback)
- Product: audit log written AFTER save with `await writeAuditLog(...)` but NOT in a try/catch that deletes product → **product may remain** (no rollback)
- Category: same as product
- **Document the inconsistency:** blog/showroom rollback on audit failure; product/category do NOT

---

*End of Part 2 — Total Part 2 test cases: 283*  
*Grand total: Part 1 (164) + Part 2 (283) = 447 test cases with full step-by-step detail*

---

## 📋 Test Execution Checklist

### Environment Setup (Do first)
- [ ] App running: `npm run dev` at `http://localhost:3000`
- [ ] Supabase local: `supabase start` or remote project configured
- [ ] `NEXT_PUBLIC_USE_MOCK_DATA=false` in `.env.local`
- [ ] Admin user seeded: `admin@furniture.com` / `Admin@123456`
- [ ] Editor user seeded: `editor@furniture.com` / `Editor@123456`
- [ ] Cloudinary configured (for upload tests)
- [ ] AI_SECRET_ENCRYPTION_KEY = 64-char string in env (for settings encryption tests)

### Execution Order (recommended)
1. ADM-AUTH (authentication gates — must pass before anything else)
2. ADM-DASH (quick sanity check)
3. ADM-MED (upload foundation — needed by all other modules)
4. ADM-CAT (category creation — needed by products)
5. ADM-PRD (products — most comprehensive)
6. ADM-BRD → ADM-PRO → ADM-BLG → ADM-SHW → ADM-QTE → ADM-USR → ADM-SET
7. ADM-CROSS (cross-cutting audit — run after all modules)

### Quick Smoke Test (8 cases for CI gate)
- ADM-AUTH-05 (login works)
- ADM-AUTH-11 (anonymous blocked)
- ADM-PRD-42 (create product)
- ADM-PRD-45 (publish product)
- ADM-PRD-68 (upload image)
- ADM-BLG-14 (create blog)
- ADM-SET-25 (settings update reflected publicly)
- ADM-QTE-21 (public quote form creates DB row)
