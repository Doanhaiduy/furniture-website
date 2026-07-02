# MEDIA PIPELINE AUDIT REPORT
**Auditor role**: Senior Media Pipeline Auditor + UX Reviewer for Upload Flows + Storage Architecture Reviewer  
**Audit date**: 2026-06-19  
**Scope**: Toàn bộ upload/media flows cho admin + client consumption  
**Tone**: Thẳng, skeptical, có evidence từ source code.

---

## MỤC LỤC
1. [Infrastructure Overview](#1-infrastructure-overview)
2. [Module-by-Module Upload Audit](#2-module-by-module-upload-audit)
3. [Core Media Components Audit](#3-core-media-components-audit)
4. [DB Persistence Audit](#4-db-persistence-audit)
5. [Media Delete / Cleanup Audit](#5-media-delete--cleanup-audit)
6. [Client Rendering Audit](#6-client-rendering-audit)
7. [Orphaned / Duplicate Media Risk](#7-orphaned--duplicate-media-risk)
8. [Admin UX of Media Flows](#8-admin-ux-of-media-flows)
9. [Top 10 Media Risks](#9-top-10-media-risks)
10. [Remediation Roadmap](#10-remediation-roadmap)
11. [Final Verdict](#11-final-verdict)

---

## 1. Infrastructure Overview

### 1.1 Upload pipeline architecture

```
Admin Browser
   │
   ├─ 1. POST /api/admin/cloudinary-sign → {signature, timestamp, folder, apiKey, cloudName}
   │
   ├─ 2. XHR POST → https://api.cloudinary.com/v1_1/{cloudName}/auto/upload
   │      ├─ with progress tracking (onprogress → setProgress)
   │      └─ returns {public_id, secure_url, format, bytes, width, height, original_filename}
   │
   └─ 3. POST /api/admin/media/upload → persists to media_assets DB row
          └─ returns {id, public_url, created_at}
```

**Verdict infrastructure**: ✅ Pattern tốt — signed upload, direct-to-Cloudinary, XHR progress, separate DB persist step. Đây là đúng kiến trúc.

### 1.2 Two reusable components

| Component | Role | Used in |
|---|---|---|
| `MediaUploadPanel` | Standalone upload zone + library grid | `/admin/media` page only |
| `MediaPicker` | Inline modal: upload new OR pick from library | Wrapped by `ImageUploadDropzone` |
| `ImageUploadDropzone` | Thin wrapper around `MediaPicker` | Product, Category, Blog, Showroom, Promo, Settings forms |
| `MultiImageGalleryUpload` | Grid of images + add slot via `MediaPicker` | Product multi-image form section |

### 1.3 Storage providers

| Provider | Used for | Status |
|---|---|---|
| Cloudinary | All real uploads | ✅ via signed upload |
| Supabase Storage | Referenced in schema as option | ❌ Not implemented — only Cloudinary in practice |
| URL text input | Settings logo/favicon (legacy) | ⚠️ Still partially in use via `resolveMediaId` |

---

## 2. Module-by-Module Upload Audit

### 2.1 Product images

| Aspect | Status | Evidence |
|---|---|---|
| Single cover image upload | ✅ READY | `ImageUploadDropzone` at line 3669 |
| Multi-image gallery upload | ⚠️ PARTIAL | `MultiImageGalleryUpload` at line 2185 |
| Persist to `product_media` junction table | ❌ BROKEN | See §4.1 |
| Map primary image (`is_primary = true`) | ❌ BROKEN | No `product_media` insert in any save function |
| Product form loads existing images | ⚠️ PARTIAL | `primary_media: null` hardcoded in `getAdminProducts` |
| Alt text / caption per image | ❌ MISSING | No alt text field in MediaPicker or form |
| Reorder images | ❌ MISSING | `sort_order` exists in DB but no UI |
| Remove existing image from product | ⚠️ PARTIAL | `MultiImageGalleryUpload` remove is client-only, not synced to `product_media` |

**Detail on persistence** — `createAdminProduct` in `admin-queries.ts`: Searching reveals cover_image url is collected from form state as `coverImage` string. Then `getOrCreateMediaAssetId(supabase, coverImage, user.id)` is called. But there is NO insert into `product_media` junction table found in any admin-queries product save function. The media URL is tracked only as a string in state. 

**Verdict: BROKEN** — Product images uploaded but not inserted into `product_media`. Product will show no images on client despite upload appearing successful.

---

### 2.2 Category images

| Aspect | Status | Evidence |
|---|---|---|
| Single category image upload | ✅ PARTIAL | `ImageUploadDropzone` at line 1136 |
| `coverImage` state captured in form | ✅ | `setCoverImage(match.cover_image_url || match.image || "")` |
| Persist to `product_categories.image_media_id` | ❌ BROKEN | `getAdminCategories` SELECT does NOT include `image_media_id` or image join — so image never loaded on edit |
| Image shown when editing existing category | ❌ BROKEN | `match.cover_image_url` is undefined because query doesn't fetch it |
| Image saved on create/update | ❓ UNKNOWN | Would need to trace full `createAdminCategory` / `updateAdminCategory` — likely uses `getOrCreateMediaAssetId` same pattern as promotions |

**Verdict: PARTIAL** — Upload form exists, image captured in state, but edit-load broken (image_media_id not queried), persistence uncertain.

---

### 2.3 Brand logos / images

| Aspect | Status | Evidence |
|---|---|---|
| Brand logo upload form | ✅ Likely exists | `ImageUploadDropzone` at lines 1749, 1754 |
| `brands.logo_media_id` FK exists | ✅ | DB schema |
| Media persisted to `brands.logo_media_id` | ❓ UNKNOWN | No explicit brand save code found in grep results |
| Brand image loaded in admin brand edit | ❓ UNKNOWN | |
| Brand logo rendered client-side | ⚠️ | No client component found that explicitly renders `brand.logo` |

**Verdict: UNKNOWN/PARTIAL** — Schema supports it, upload component likely used, but end-to-end mapping not verified.

---

### 2.4 Promotion cover images

| Aspect | Status | Evidence |
|---|---|---|
| Promotion cover image upload form | ✅ Lines 2017, 2055, 2093 | `ImageUploadDropzone` used in promo form |
| Image captured as `cover_image` URL string | ✅ | `admin-queries.ts:852` |
| `getOrCreateMediaAssetId` called | ✅ | `admin-queries.ts:852` — resolves URL to DB id |
| `promotions.cover_media_id` set on insert | ✅ | `admin-queries.ts:873` — `cover_media_id: coverMediaId` |
| Image loaded on edit (`getAdminPromotionById`) | ✅ | `admin-queries.ts:1177` joins `media_assets!cover_media_id` |
| Cover media returned from `public_promotions` RPC | ❌ BROKEN | `public_promotions` RPC doesn't return `cover_media` |
| Promotion promo card renders image on client | ❌ BROKEN | Missing from RPC response |

**BUT**: `getOrCreateMediaAssetId` creates GHOST media assets (see §4.2). So even when cover_media_id is set, the underlying `media_assets` row may have `size_bytes: 0`, violating DB constraints.

**Verdict: PARTIAL** — Save/load works for admin, but client rendering broken due to RPC gap. Ghost asset creation risk.

---

### 2.5 Blog cover images

| Aspect | Status | Evidence |
|---|---|---|
| Blog cover image upload | ✅ | `ImageUploadDropzone` at line 2334 |
| `blog_posts.cover_media_id` FK in DB | ✅ | DB schema |
| Persist to `blog_posts.cover_media_id` | ❓ UNKNOWN | Need to check `createAdminBlogPost` / `updateAdminBlogPost` |
| Image loaded on blog edit | ⚠️ | `getAdminBlogPosts` SELECT does not include `cover_media_id` join in visible code |
| `cover_media` returned from `public_blog_posts` RPC | ✅ | RPC joins `media_assets` — READY |
| Blog cover rendered on client | ✅ | Uses RPC response with `cover_media.url` |

**Verdict: PARTIAL** — Client rendering works (RPC is correct), but admin edit form image load unclear.

---

### 2.6 Blog inline images (rich text editor)

| Aspect | Status | Evidence |
|---|---|---|
| Rich text editor inline image insert | ❓ | No rich text editor component found — `body_json` likely stores structured JSON |
| MediaPicker available for inline use | ⚠️ | Only used as standalone picker, no inline integration |
| Inline images stored as embedded URLs in `body_json` | ❓ UNKNOWN | |

**Verdict: UNKNOWN** — No rich text editor / inline image upload flow found. Blog body is `body_json` but no editor integration is visible. This is likely MISSING.

---

### 2.7 Showroom images

| Aspect | Status | Evidence |
|---|---|---|
| Showroom cover image upload | ✅ | `ImageUploadDropzone` at line 702 |
| Image captured as `coverImage` URL string | ✅ | `admin-workflows.tsx:798` |
| `showroom_media` junction table insert | ❓ | Need to check showroom save action |
| Image loaded on edit | ✅ | `getAdminShowrooms` joins `showroom_media → media_assets` correctly (line 630) |
| `public_showrooms` RPC returns media | ✅ | RPC joins showroom_media → media_assets |
| Showroom image rendered on client | ✅ | Uses RPC response |

**Verdict: PARTIAL** — Admin query load is correct, RPC is correct. Save path needs verification.

---

### 2.8 Settings logo / favicon / social assets

| Aspect | Status | Evidence |
|---|---|---|
| Logo image upload via `ImageUploadDropzone` | ✅ | Lines 2055, 2093 in admin-workflows |
| Logo URL captured as string | ✅ | |
| `resolveMediaId` called in settings route | ✅ | `settings/route.ts:9` |
| `resolveMediaId` creates ghost `media_assets` row | ❌ BROKEN | Creates row with `size_bytes: 0`, no public_id — violates DB constraints |
| Logo media rendered on FE header | ✅ | Site uses `logoUrl` from settings response |
| OG image / social preview image | ❌ MISSING | No social preview image field/upload in settings form |
| Favicon upload | ✅ PARTIAL | Upload component exists, same ghost asset issue |

**Verdict: PARTIAL/BROKEN** — Logo upload works in theory but persistence path creates constraint-violating ghost rows.

---

### 2.9 Media Library

| Aspect | Status | Evidence |
|---|---|---|
| Upload from media library page | ✅ | `MediaUploadPanel` — full XHR + progress + library grid |
| Library loads from `GET /api/admin/media/list` | ✅ | `admin-interactions.tsx:598` |
| Library shows all uploaded assets | ✅ | Grid of 60 most recent |
| Click to copy URL | ✅ | `navigator.clipboard.writeText(asset.public_url)` |
| Select asset from library into form | ✅ | `MediaPicker` dialog shows library and lets user pick |
| Delete asset from library | ❌ MISSING | No delete button on library grid items |
| Pagination (beyond 60 items) | ❌ MISSING | Fixed `limit(60)` — no load more |
| Search/filter library | ❌ MISSING | No search or filter in media library |
| View asset detail (filename, size, dimensions) | ❌ MISSING | Only thumbnail shown |
| `original_filename` column missing → null in list | ❌ BROKEN | DB column doesn't exist |

**Verdict: PARTIAL** — Works as basic upload + pick, but no delete, no pagination, no detail view.

---

## 3. Core Media Components Audit

### 3.1 `MediaUploadPanel` — Main upload zone

| Feature | Status |
|---|---|
| File type validation (MIME whitelist) | ✅ |
| File size validation (50MB) | ✅ |
| Drag & drop | ✅ |
| XHR upload with progress bar | ✅ |
| Error display | ✅ |
| Success display with preview | ✅ |
| Retry on error | ❌ — user must reselect file |
| Cancel in-progress upload | ❌ — no cancel button |
| Multiple file upload | ❌ — single file only |
| Upload queue | ❌ — not supported |

### 3.2 `MediaPicker` — Inline form picker

| Feature | Status |
|---|---|
| Upload new file (images only) | ✅ |
| Pick from existing library | ✅ |
| Preview selected image | ✅ |
| "Remove image" button | ✅ |
| XHR upload with progress | ✅ |
| Library cached (`libLoaded` flag) | ✅ — but stale after new upload until dialog re-opens |
| Video file support | ❌ — `MediaPicker` accept only images, `MediaUploadPanel` accepts video |
| Multiple selection | ❌ — single pick only |
| Search library | ❌ |
| `mediaId` propagated via `onChange(url, mediaId)` | ✅ — signature includes `mediaId` |
| `mediaId` actually used by callers | ❌ — `ImageUploadDropzone` discards `mediaId`: `onChange={(url) => onChange(url)}` |

**Critical gap**: `ImageUploadDropzone` wraps `MediaPicker` but **discards the `mediaId`**:
```typescript
// admin-workflows.tsx:6164
<MediaPicker
  value={value}
  onChange={(url) => onChange(url)}  // ← mediaId dropped!
  label={label}
/>
```

This means all form fields that use `ImageUploadDropzone` receive only a URL string, not the media asset UUID. When saving, the form must call `getOrCreateMediaAssetId` to convert URL back to ID — creating the ghost asset problem.

### 3.3 `MultiImageGalleryUpload`

| Feature | Status |
|---|---|
| Add new image | ✅ — via `MediaPicker` |
| Remove image (client-side) | ✅ |
| Reorder images | ❌ — no drag-to-reorder |
| Primary image designation | ❌ — no is_primary concept in component |
| Values stored as string[] of URLs | ⚠️ — URLs only, no media IDs |
| Values synced to `product_media` junction | ❌ BROKEN — no persistence |
| Alt text per image | ❌ MISSING |
| Max images limit | ❌ — no limit enforced |

---

## 4. DB Persistence Audit

### 4.1 Product media — BROKEN (No `product_media` insert)

Search of entire `admin-queries.ts` for `product_media` returns **zero results**. There is no INSERT into `product_media` anywhere in the codebase's admin save path.

The product form collects `coverImage` (URL string) but:
1. Calls `getOrCreateMediaAssetId()` which creates/finds a `media_assets` row
2. **Does NOT insert into `product_media` junction table**
3. The `media_assets` UUID is never linked to the product

The `public_products` RPC gets primary media by joining `product_media`:
```sql
FROM product_media pm_a
WHERE pm_a.product_id = p.id AND pm_a.is_primary = true
```

If `product_media` has no rows for this product → RPC returns `primary_media: null` → product shows no image on client.

**Every product saved through admin UI has no images on the client.** This is BROKEN.

### 4.2 Ghost media asset creation — BROKEN in production

`getOrCreateMediaAssetId(supabase, url, userId)` in `admin-queries.ts:40`:

```typescript
const { data: inserted } = await supabase
  .from("media_assets")
  .insert({
    storage_provider: "cloudinary",
    public_url: value,         // URL string
    size_bytes: 0,             // ❌ ZERO bytes
    mime_type: "image/png",    // ❌ Hardcoded, wrong for non-PNG
    format: "png",             // ❌ Hardcoded, wrong
    uploaded_by: userId,
    // MISSING: public_id (required for cloudinary provider FK check)
  })
```

DB constraint `chk_media_assets_positive_size`: `size_bytes > 0` → **This insert will FAIL.**

Same pattern in `settings/route.ts:19` — identical insert with `size_bytes: 0`.

**Both functions will fail silently** (the error is logged but not propagated — save continues) → `coverMediaId` returns null → `cover_media_id` is set to null → image is lost.

### 4.3 `product_media` junction — Not written by any admin action

| Junction table | Admin write | Evidence |
|---|---|---|
| `product_media` | ❌ NEVER | No INSERT found |
| `showroom_media` | ❓ UNKNOWN | No INSERT found in grep |
| `product_category.image_media_id` | ❓ UNKNOWN | No evidence |
| `brands.logo_media_id` | ❓ UNKNOWN | No evidence |
| `blog_posts.cover_media_id` | ❓ UNKNOWN | No evidence |
| `promotions.cover_media_id` | ✅ (but via ghost asset) | `admin-queries.ts:873` |

### 4.4 The only clean persistence path: `POST /api/admin/media/upload`

```typescript
await supabase.from("media_assets").insert({
  storage_provider: "cloudinary",
  public_id,           // ✅ from Cloudinary response
  public_url,          // ✅ secure_url
  size_bytes,          // ✅ bytes from Cloudinary
  mime_type,           // ✅ derived from format
  format,              // ✅ from Cloudinary response
  width, height,       // ✅
  original_filename,   // ❌ COLUMN DOESN'T EXIST → INSERT FAILS
  uploaded_by,         // ✅
})
```

Even the clean path fails because `original_filename` is included in the insert but the column doesn't exist in `media_assets`. PostgreSQL will reject the entire insert.

**The ONLY route that creates valid `media_assets` rows is broken due to one missing column.**

---

## 5. Media Delete / Cleanup Audit

### 5.1 Delete from DB

| Scenario | Status |
|---|---|
| Delete media asset from Media Library UI | ❌ MISSING — no delete button in `MediaUploadPanel` grid |
| DELETE endpoint for media | ❌ MISSING — no `DELETE /api/admin/media/:id` route |
| Soft-delete via `deleted_at` | ❌ MISSING — no mechanism |
| Hard delete | ❌ MISSING |

### 5.2 Cleanup from Cloudinary

| Scenario | Status |
|---|---|
| Delete asset from Cloudinary when DB row deleted | ❌ MISSING |
| Cleanup Cloudinary when admin replaces an image | ❌ MISSING — old asset remains in Cloudinary |
| Orphaned Cloudinary assets accumulate | ❌ RISK — every replaced image is abandoned |

### 5.3 Cleanup when entity is deleted

| Scenario | Status |
|---|---|
| Product deleted → `product_media` CASCADE deleted | ✅ — DB cascade |
| Product deleted → Cloudinary files cleaned | ❌ MISSING |
| Category deleted → `image_media_id` set null | ✅ — FK SET NULL |
| Category image on Cloudinary cleaned | ❌ MISSING |
| Blog deleted → `cover_media_id` SET NULL | ✅ |
| Blog cover on Cloudinary cleaned | ❌ MISSING |

---

## 6. Client Rendering Audit

### 6.1 How client gets images

All public pages fetch images via Supabase RPCs:
- `public_products` → `primary_media: jsonb`, `media: jsonb[]`
- `public_blog_posts` → `cover_media: jsonb`
- `public_showrooms` → `primary_media: jsonb`, `media: jsonb[]`
- `public_promotions` → ❌ no media field

### 6.2 Image rendering on client

| Entity | Image rendering | Status |
|---|---|---|
| Product cards | `product.primary_media?.url` | ⚠️ PARTIAL — correct code but data missing (no product_media rows) |
| Product detail gallery | `product.media` array | ⚠️ PARTIAL — correct rendering, data empty |
| Category image | Direct query on client | ⚠️ |
| Blog cover | `post.cover_media?.url` | ✅ RPC data correct |
| Showroom image | `showroom.primary_media?.url` | ✅ RPC data correct (if media linked) |
| Promotion cover | ❌ not in RPC | ❌ BROKEN |
| Brand logo | Not rendered on client | ❌ MISSING |
| Settings logo | From settings API, rendered in header | ✅ |

### 6.3 Next.js `Image` vs `<img>` usage

Multiple `@next/next/no-img-element` ESLint disable comments are present throughout `admin-interactions.tsx` and `admin-workflows.tsx`. The admin is using raw `<img>` tags instead of Next.js `<Image>` for:
- Library thumbnails in `MediaUploadPanel`
- Previews in `MediaPicker`
- Gallery images in `MultiImageGalleryUpload`

For **admin** only — acceptable. For **client** public pages — Next.js `<Image>` should be used for optimization. Needs verification on client components.

---

## 7. Orphaned / Duplicate Media Risk

### 7.1 Orphaned media risks

| Risk | Source | Severity |
|---|---|---|
| Upload to Cloudinary but DB persist fails (due to `original_filename` bug) | Every upload | 🔴 Critical — Cloudinary fills up with untracked assets |
| Replace image in form without deleting old asset | All entity forms | 🟠 High — old assets remain |
| Admin uploads file, doesn't use it in any entity | Media library | 🟡 Medium — accepted UX but no cleanup mechanism |
| Ghost media rows from `getOrCreateMediaAssetId` (size_bytes: 0) | Settings, promotions, categories | 🔴 Critical — violate constraints, create invalid rows |

### 7.2 Duplicate media risks

| Risk | Status |
|---|---|
| Same image uploaded twice → two `media_assets` rows with different `public_id` | ⚠️ Medium — Cloudinary deduplicates by public_id, but DB doesn't prevent same URL twice |
| Same URL resolved twice in `getOrCreateMediaAssetId` | ✅ — checks `.eq("public_url", value)` first |
| Admin picks same library asset for two products | ✅ — normal, same `media_assets.id` used in two `product_media` rows |

---

## 8. Admin UX of Media Flows

### 8.1 Upload UX — strengths

✅ Drag & drop support in `MediaUploadPanel`  
✅ Progress bar during XHR upload  
✅ Immediate thumbnail preview after upload  
✅ Error display with readable message  
✅ "Đổi ảnh" / "Xóa ảnh" toggle in `MediaPicker`  
✅ Library grid lets admin pick existing assets  
✅ Click-to-copy URL in library  

### 8.2 Upload UX — gaps

❌ **No cancel button** — if upload is stuck, admin cannot abort  
❌ **No retry button** — on failure, must re-select file  
❌ **No multi-file upload** — one at a time  
❌ **Library limited to 60 items, no pagination** — admin with 100+ assets cannot browse all  
❌ **No search/filter in library** — cannot find specific asset  
❌ **No asset metadata display** — filename, size, upload date not shown in grid  
❌ **No delete from library** — media library is append-only for admin  
❌ **Library stale after upload** — `MediaPicker` caches library (`libLoaded` flag) → new uploads don't appear until dialog is reopened  
❌ **No alt text input** — admin cannot set localized alt text for images  
❌ **No is_primary toggle** — admin cannot designate primary product image  
❌ **No image reorder** — sort_order in DB but no UI  
❌ **No Cloudinary transformation UI** — admin cannot crop/resize during upload  
❌ **"Copy URL" is only actionable in MediaUploadPanel** — not in form contexts where admin needs to use the image  

### 8.3 Upload flow clarity issues

- After upload in `MediaUploadPanel`, success shows URL as tiny text — admin must manually use it somewhere. No direct "insert into product" action.
- Media library is standalone page (`/admin/media`) but form MediaPicker opens its own inline library — two separate libraries with different limits.
- Admin can upload from MediaPicker modal but if persist fails, no feedback beyond generic error.

---

## 9. Top 10 Media Risks

### 🔴 RISK #1 — `POST /api/admin/media/upload` BROKEN: `original_filename` column doesn't exist

**Evidence**: `media/upload/route.ts:103` inserts `original_filename` → DB has no column.  
**Impact**: Every media upload attempt via admin UI → DB insert FAILS → `media_assets` row never created → entire 3-step upload pipeline fails at step 3 → file exists on Cloudinary but not tracked in DB.  
**Cloudinary side effect**: Untracked orphaned files accumulate on Cloudinary → storage cost with no DB reference.  
**Fix**: Remove `original_filename` from insert payload (1-line fix), or add column to DB.

### 🔴 RISK #2 — No `product_media` rows ever inserted → products have no images on client

**Evidence**: Search of entire `admin-queries.ts` for `product_media` returns 0 results.  
**Impact**: All products saved via admin show `primary_media: null` from `public_products` RPC → no image on product cards, product detail page → visually broken.  
**Fix**: After product save, insert into `product_media (product_id, media_id, is_primary, sort_order)`.

### 🔴 RISK #3 — `getOrCreateMediaAssetId` creates ghost rows violating `size_bytes > 0` constraint

**Evidence**: `admin-queries.ts:40` inserts `size_bytes: 0`.  
**Impact**: Save functions for promotions, categories, settings that rely on this helper will silently fail to create the media row → `coverMediaId = null` → cover image lost.  
**Fix**: Do not create ghost rows. Require admin to upload via proper upload flow first.

### 🔴 RISK #4 — `ImageUploadDropzone` discards `mediaId` — all entity forms lose media UUID

**Evidence**: `admin-workflows.tsx:6166` — `onChange={(url) => onChange(url)}` drops second arg.  
**Impact**: Every form field using `ImageUploadDropzone` only gets a URL string. Save path must resolve URL→UUID which triggers ghost asset creation (RISK #3).  
**Fix**: Pass `mediaId` through: `onChange={(url, id) => onChange(url, id)}` and update form state to store `mediaId`.

### 🟠 RISK #5 — No media delete mechanism — library grows without bound

**Evidence**: No DELETE endpoint, no delete button in UI.  
**Impact**: Replaced images accumulate in Cloudinary and DB. No cleanup possible. Storage cost grows indefinitely.  
**Fix**: Add soft-delete to `media_assets`, add DELETE endpoint, add delete button with orphan check.

### 🟠 RISK #6 — `public_promotions` RPC missing `cover_media` → promo images never shown to clients

**Evidence**: RPC returns no media-related fields.  
**Impact**: Promotions page shows promotions without images regardless of what admin uploaded.  
**Fix**: Update `public_promotions` RPC to join `media_assets` and return cover_media jsonb.

### 🟠 RISK #7 — Blog inline images not supported

**Evidence**: No rich text editor with inline media insertion found. Blog `body_json` is unstructured jsonb.  
**Impact**: Blog posts cannot have inline images in article body, only cover image.  
**Fix**: Either implement block editor (Tiptap/Lexical/Plate) with inline image support, or accept this limitation.

### 🟠 RISK #8 — Replace image → old Cloudinary asset orphaned forever

**Evidence**: No cleanup on image replace in any form.  
**Impact**: Every time admin changes product/category/blog image, old Cloudinary asset persists. Over time → substantial orphaned storage.  
**Fix**: When replacing `cover_media_id`, call Cloudinary destroy API for old asset. Or run periodic orphan cleanup job.

### 🟡 RISK #9 — Media library stale cache in `MediaPicker`

**Evidence**: `admin-interactions.tsx:877` — `if (libLoaded) return` prevents refresh.  
**Impact**: Admin uploads new image → closes picker → reopens picker → old list shown without new image.  
**Fix**: Invalidate `libLoaded` when new upload succeeds (partially done at line 953 `setLibLoaded(false)` — but only for new uploads, not for external uploads).

### 🟡 RISK #10 — No alt text for any image → SEO and accessibility gap

**Evidence**: No alt text field in `MediaPicker`, `ImageUploadDropzone`, or `MultiImageGalleryUpload`. DB has `media_asset_translations.alt_text` column.  
**Impact**: All images rendered with empty `alt=""` → poor accessibility, no SEO image alt tags.  
**Fix**: Add alt text input field to `MediaPicker`. Store in `media_asset_translations` on save.

---

## 10. Remediation Roadmap

### 🔴 CRITICAL (1–2 ngày — must fix for any real content)

| # | Fix | Effort |
|---|---|---|
| 1 | **Remove `original_filename` from media upload insert** (or add DB column) | 15 min |
| 2 | **Fix `ImageUploadDropzone`**: propagate `mediaId` from `MediaPicker.onChange` | 30 min |
| 3 | **Fix product save**: add INSERT into `product_media` after product create/update | 3h |
| 4 | **Remove `getOrCreateMediaAssetId`**: replace with "require proper upload" pattern | 2h |
| 5 | **Fix settings save**: require logo/favicon to be proper `media_assets` UUID, not URL string | 3h |

### 🟠 HIGH (Sprint 1 — 3–5 ngày)

| # | Fix | Effort |
|---|---|---|
| 6 | **Fix showroom save**: add INSERT/UPSERT into `showroom_media` junction | 2h |
| 7 | **Fix blog save**: persist `cover_media_id` from uploaded asset ID | 2h |
| 8 | **Fix category save**: persist `image_media_id` and load it on edit | 2h |
| 9 | **Update `public_promotions` RPC**: add cover_media join | 2h |
| 10 | **Add `DELETE /api/admin/media/:id`** with orphan check | 3h |
| 11 | **Add delete button to Media Library grid** | 1h |
| 12 | **Add pagination to `GET /api/admin/media/list`** (cursor or page-based) | 2h |

### 🟡 MEDIUM (Sprint 2 — 1 tuần)

| # | Fix |
|---|---|
| 13 | Add `alt_text` input to `MediaPicker` dialog, save to `media_asset_translations` |
| 14 | Add `is_primary` toggle for `MultiImageGalleryUpload` |
| 15 | Add drag-to-reorder for product image gallery |
| 16 | Add Cloudinary cleanup when replacing/deleting media |
| 17 | Add search/filter to media library |
| 18 | Add asset detail panel (filename, size, dimensions, upload date) |
| 19 | Fix stale library cache in `MediaPicker` |

### 🟢 LOW (Future sprint)

| # | Fix |
|---|---|
| 20 | Add cancel button for in-progress XHR upload |
| 21 | Add multi-file upload support |
| 22 | Add inline image support for blog body (block editor) |
| 23 | Add Cloudinary transformation options (crop, resize, quality) on upload |
| 24 | Add upload queue with batch progress |
| 25 | Add `resource_type` filter in media library (images only / videos only) |

---

## 11. Final Verdict

### Per-module verdict

| Module | Upload | Persist to DB | Load on edit | Client render | Verdict |
|---|---|---|---|---|---|
| **Product cover image** | ✅ | ❌ BROKEN (no product_media insert) | ❌ (null hardcoded) | ❌ no data | **BROKEN** |
| **Product gallery** | ✅ | ❌ BROKEN | ❌ | ❌ | **BROKEN** |
| **Category image** | ✅ | ❓ UNKNOWN | ❌ (not queried) | ⚠️ PARTIAL | **BROKEN** |
| **Brand logo** | ✅ (likely) | ❓ UNKNOWN | ❓ | ❌ not rendered | **UNKNOWN** |
| **Promotion cover** | ✅ | ⚠️ ghost risk | ✅ | ❌ RPC missing | **PARTIAL** |
| **Blog cover** | ✅ | ❓ UNKNOWN | ❓ | ✅ | **PARTIAL** |
| **Blog inline** | ❌ | ❌ | ❌ | ❌ | **MISSING** |
| **Showroom images** | ✅ | ❓ UNKNOWN | ✅ | ✅ | **PARTIAL** |
| **Settings logo** | ✅ | ❌ ghost risk | ✅ | ✅ | **PARTIAL** |
| **Media Library** | ✅ | ❌ BROKEN (original_filename) | N/A | N/A | **BROKEN** |

### Overall

**Core upload flow**: ✅ Architecture correct (signed upload, XHR progress, DB persist step).  
**DB persistence**: ❌ BROKEN across the board — one missing column breaks all uploads, junction table never written.  
**Client rendering**: ⚠️ PARTIAL — correct RPC code but no data because persistence is broken.  
**UX**: ⚠️ PARTIAL — good fundamentals (drag-drop, progress, picker), missing delete/search/reorder/alt text.

**Final verdict: PARTIAL** — The upload UI works in browser, files reach Cloudinary, but the DB persistence layer is broken enough that in production **no images will appear on the client** for products (the most critical entity). Fix critical items 1–5 before any real content loading.

---

*Báo cáo được tạo 2026-06-19 · Evidence từ source code*  
*Xem thêm: [api_audit_report.md](file:///C:/Users/DELL/.gemini/antigravity/brain/7e03c2c5-5cd9-4683-8255-77f09e27b9ca/api_audit_report.md) | [database_audit_report.md](file:///C:/Users/DELL/.gemini/antigravity/brain/7e03c2c5-5cd9-4683-8255-77f09e27b9ca/database_audit_report.md)*
