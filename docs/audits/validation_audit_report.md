# VALIDATION AUDIT REPORT — ADMIN + CLIENT
**Auditor role**: Principal UX Auditor + Senior Form Validation Reviewer + Staff Full-stack QA Engineer  
**Audit date**: 2026-06-19  
**Scope**: Toàn bộ form/input/select/upload trên cả Admin và Client  
**Tone**: Thẳng, không nể nang, có evidence từ code.

---

## MỤC LỤC
1. [Executive Summary](#1-executive-summary)
2. [Validation Inventory](#2-validation-inventory)
3. [Validation Logic Audit](#3-validation-logic-audit)
4. [Error Message & Microcopy Audit](#4-error-message--microcopy-audit)
5. [UI Validation State Audit](#5-ui-validation-state-audit)
6. [Error Recovery UX Audit](#6-error-recovery-ux-audit)
7. [Upload / File Validation Audit](#7-upload--file-validation-audit)
8. [Responsive + Accessibility Validation Audit](#8-responsive--accessibility-validation-audit)
9. [Business-Specific Validation Audit](#9-business-specific-validation-audit)
10. [Top 10 Critical Issues](#10-top-10-critical-issues)
11. [Priority Remediation Roadmap](#11-priority-remediation-roadmap)
12. [Final Verdict](#12-final-verdict)

---

## 1. Executive Summary

Sau khi đọc toàn bộ validation code (schemas, form components, API routes), đây là kết luận tổng thể:

| Trục | Điểm | Mô tả |
|---|---|---|
| FE validation logic | 55/100 | Zod schema ổn cho client, admin dùng mixed approach — nhiều chỗ chỉ `required` HTML attribute |
| BE validation consistency | 45/100 | API `/api/contact` enforce Zod schema; Settings/Users/Brand/Promotion **không có Zod BE** |
| Error message quality | 40/100 | Nhiều `alert()`, generic "Có lỗi xảy ra", FE và BE message không nhất quán ngôn ngữ |
| UI error state | 50/100 | Quote form có inline errors tốt; Admin forms dùng generic top-of-form div, không inline |
| Upload validation | 65/100 | MediaUploadPanel khá tốt; field-level image pickers không validate |
| Accessibility | 30/100 | `aria-invalid` chỉ có trong QuoteForm; `autocomplete`, `type="tel"` thiếu hoàn toàn |
| Mobile UX | 35/100 | Phone field dùng `type="text"` trên cả admin và client; không có `autocomplete` |

**Tổng điểm: 45/100 — FAIL trên nhiều module quan trọng.**

> **Vấn đề lớn nhất**: Admin forms (`Brand`, `Promotion`, `Users`, `Settings`, `Showroom`) KHÔNG dùng Zod schema ở FE — submit thẳng lên DB với minimal check. BE cũng không parse + validate đầu vào cho các route này → double gap.

---

## 2. Validation Inventory

### 2.1 CLIENT / Public Forms

| Route | Form | Fields | Validation FE | Validation BE | Verdict |
|---|---|---|---|---|---|
| `/[locale]/contact` | QuoteForm | fullName, phone, email*, company*, service*, productId*, message, honeypot | ✅ Zod (`quoteRequestSchema`) + RHF | ✅ Zod re-parse tại `/api/contact` | PARTIAL |
| `/[locale]/products` | FilterPanel | category, brand, q, priceMin/Max, sort, page | ✅ Zod (`productFiltersSchema`) server-side parse | N/A (URL params) | READY |
| `/[locale]/blog` | Category filter | Click tag | ❌ Không có filter logic — visual only | N/A | FAIL |
| `/[locale]/products/[slug]` | QuoteForm (embedded) | Same as contact | ✅ Same as above | ✅ Same as above | PARTIAL |
| `/[locale]/contact/success` | — | — | ❌ Route có thể không tồn tại | N/A | RISKY |

### 2.2 ADMIN Forms

| Route/Module | Form | Validation FE | Validation BE | Verdict |
|---|---|---|---|---|
| `/admin/login` | LoginForm | HTML `required` only, no format check | ❌ Supabase returns generic error | PARTIAL |
| `/admin/products/new` | ProductWorkflow | `validationErrors[]` array thủ công | ❌ Không có Zod parse tại API endpoint cho products | RISKY |
| `/admin/categories/new` | CategoryEntityForm | ✅ Zod `categorySchema.safeParse` tại handleSave | ❌ Mutations layer không re-validate | PARTIAL |
| `/admin/brands/new` | BrandEntityForm | ❌ HTML `required` only (`name_vi`) | ❌ Không có BE validation | FAIL |
| `/admin/promotions/new` | PromotionEntityForm | ❌ Không có validation rõ ràng | ❌ Không có BE validation | FAIL |
| `/admin/showrooms/new` | ShowroomEntityForm | `validationErrors[]` array thủ công | ❌ Mutations layer không re-validate | PARTIAL |
| `/admin/blog/new` | BlogWorkflow | `validationErrors[]` array tại PublishWorkflow | ❌ Không có BE validation | PARTIAL |
| `/admin/users/new` | UserCreateEntityForm | `!email \|\| !password \|\| !fullName` check only | ⚠️ BE chỉ check `Missing required fields` string | FAIL |
| `/admin/settings` | SettingsWorkflow | ❌ Không có validation — submit tất cả raw | ❌ BE không validate format các field | FAIL |
| `/admin/media` | MediaUploadPanel | ✅ file type + size client-side | ✅ type + size + URL domain check tại BE | READY |
| `/admin/quotes` | QuoteStatusUpdater | ✅ Enum select | ⚠️ UI only, không persist | DEMO_LIKE |

---

## 3. Validation Logic Audit

### 3.1 CLIENT — QuoteForm (`quoteRequestSchema`)

**Schema** (`lib/validations/quote.ts`):
```typescript
fullName: z.string().trim().min(2).max(160)
phone: z.string().trim().min(7).max(32).regex(/^[0-9+().\-\s]{7,32}$/)
email: z.string().email().optional().or(z.literal(""))
message: z.string().trim().min(10).max(5000)
```

**Vấn đề logic:**

| Field | Rule hiện tại | Vấn đề | Fix |
|---|---|---|---|
| `fullName` | min(2), max(160) | Không ngăn được input kiểu "ab" hay toàn số như "12345" | Thêm `.regex(/\p{L}/u)` — phải có ít nhất 1 ký tự chữ |
| `phone` | regex `[0-9+().\-\s]{7,32}` | Chấp nhận `+++++++` (7 dấu cộng liền nhau) | Regex chặt hơn: `^(\+?[0-9]{7,15})$` |
| `message` | min(10), max(5000) | min(10) quá thấp — "tôi muốn" là 8 ký tự, đủ pass | min(20) |
| `email` | optional().or(z.literal("")) | ✅ Pattern tốt — email không bắt buộc | — |
| `honeypot` | max(0) | ✅ Đúng | — |
| `sourcePath` | regex `/^\/` | ✅ Tốt | — |
| `service` | optional, max(120) | ❌ Không validate xem service slug có hợp lệ không — FE gửi `category-slug` bất kỳ | Validate enum hoặc check danh sách cho phép |

**Missing cross-field validation:**
- Nếu `productId` được điền mà `service` rỗng → không tự điền service từ product category
- Không có spam-text detection cơ bản (URL trong message field)

---

### 3.2 ADMIN — `productSchema` (`lib/validations/admin.ts`)

| Field | Rule hiện tại | Vấn đề |
|---|---|---|
| `slug` | slugRegex: `/^[a-z0-9-]+$/` | ✅ Đúng, message cụ thể |
| `name_vi` | min(1) | ✅ Required, có message |
| `name_en` | optional | ✅ Intentional |
| `price_min` / `price_max` | `z.number().nullable().optional()` | ❌ **Không có cross-field validation**: price_min có thể > price_max |
| `promo_price_min/max` | `z.number().nullable().optional()` | ❌ Không validate promo_price < price (giá giảm phải < giá gốc) |
| `category_id` | `requiredText(...)` | ✅ Tốt |
| `brand_id` | `z.string().uuid().nullable()` | ✅ Tốt |
| `cover_image` | `optionalText` | ❌ **Không bắt buộc khi publish** — có thể publish product không có ảnh bìa |
| `status` | enum draft/published/archived | ✅ Tốt |
| `seo_title_vi` | optional | ❌ Không validate max length (SEO title nên ≤ 60 ký tự) |
| `seo_description_vi` | optional | ❌ Không validate max length (SEO desc nên ≤ 160 ký tự) |
| `currency` | `z.string().length(3)` | ✅ Tốt |

**Nhưng quan trọng hơn**: Schema `productSchema` **không được dùng tại BE**. Không có Zod parse trong mutations hay API route của products → bypass hoàn toàn.

---

### 3.3 ADMIN — `promotionSchema`

| Field | Rule hiện tại | Vấn đề |
|---|---|---|
| `code` | requiredText | ✅ Required |
| `discount_percentage` | `z.number().min(0).max(100)` | ✅ Đúng |
| `start_at` / `end_at` | `z.string().nullable().optional()` | ❌ **Không validate date format**, không cross-validate start < end |
| `combo_price` / `original_price` | `z.number().nullable()` | ❌ Không validate combo_price < original_price |
| `cover_image` | optional | ❌ Không bắt buộc khi publish |
| `items` | `z.array(z.string())` | ❌ Không validate mỗi item là UUID hợp lệ |

**Thực tế tệ hơn**: PromotionEntityForm **không parse schema** trước khi submit:
```typescript
// admin-workflows.tsx:2930 — Promotion handleSubmit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setFormLoading(true);
  setFormError("");
  // → KHÔNG CÓ VALIDATION GÌ, gửi thẳng
  const res = await createAdminPromotion(promotionData);
```

`start_at` field còn bị hardcode `null` luôn — admin không thể đặt ngày:
```typescript
start_at: null,  // admin-workflows.tsx:2945 — hardcode
end_at: null,    // admin-workflows.tsx:2946 — hardcode
```

---

### 3.4 ADMIN — `brandSchema`

BrandEntityForm hoàn toàn dùng `required` HTML attribute và submit thủ công:
```typescript
// admin-workflows.tsx:2763 — Brand handleSubmit
const handleSubmit = async (e: React.FormEvent) => {
  // Không có Zod parse, không có validation
  const brandData = { name_vi: nameVi, ... };
  const res = await createAdminBrand(brandData);
```

Schema `brandSchema` tồn tại trong `lib/validations/admin.ts` nhưng **không được gọi**.

---

### 3.5 ADMIN — Settings Form

Settings là form nguy hiểm nhất về validation. Toàn bộ `settingsData` gửi thẳng lên BE:

```typescript
// admin-workflows.tsx:1466-1469
const res = await fetch("/api/admin/settings", {
  method: "PUT",
  body: JSON.stringify(settingsData),  // ← raw, không validate
});
```

BE (`/api/admin/settings/route.ts`) cũng không validate:
- `contactPhone` — không validate format phone VN
- `contactEmail` — không validate format email  
- `resendKey`, `geminiKey` — không validate format API key
- `logoUrl`, `faviconUrl` — không validate URL format
- SEO fields — không validate độ dài

---

### 3.6 ADMIN — Users/Login

**Login form**:
- FE: HTML `required` only — không validate email format trước khi submit
- BE error: `"Invalid login credentials."` — hardcode English, không localize
- Không có rate-limiting FE side
- Không có password strength hint
- Không có "forgot password" flow

**User create form (FE)**:
```typescript
// admin-workflows.tsx:334
if (!email || !password || !fullName) {
  setFormError("Vui lòng điền đầy đủ thông tin.");
  return;
}
```
- Không validate email format
- Không validate password min length (BE comment nói 6 ký tự nhưng FE không check)
- Không validate password complexity
- Không validate duplicate email (chỉ biết khi BE trả error)

**User create BE** (`/api/admin/users/route.ts`):
```typescript
if (!email || !password || !fullName || !role) {
  return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
}
```
- "Missing required fields" — English generic, không nói field nào thiếu
- Không validate email format
- Không validate password strength

---

### 3.7 FE vs BE Mismatch Summary

| Module | FE validation | BE validation | Mismatch |
|---|---|---|---|
| QuoteForm | ✅ Zod full | ✅ Zod full | ✅ Nhất quán |
| Products (admin) | ⚠️ Partial `validationErrors[]` | ❌ None | 🔴 Gap lớn |
| Categories (admin) | ✅ Zod at handleSave | ❌ Mutations no validate | 🟠 Partial |
| Brands | ❌ HTML required only | ❌ None | 🔴 Double gap |
| Promotions | ❌ None | ❌ None | 🔴 Double gap |
| Showrooms | ⚠️ `validationErrors[]` manual | ❌ None | 🟠 Partial |
| Blog | ⚠️ `validationErrors[]` manual | ❌ None | 🟠 Partial |
| Users | ⚠️ Truthy check only | ⚠️ Truthy check only | 🟠 Both weak |
| Settings | ❌ None | ❌ None | 🔴 Double gap |
| Media upload | ✅ type+size client | ✅ type+size+domain BE | ✅ Nhất quán |
| Login | ❌ HTML required | ❌ Generic Supabase error | 🟠 No localization |

---

## 4. Error Message & Microcopy Audit

### 4.1 Bảng chi tiết

| Route/Form | Field | Current message | Problem | Better message | Severity |
|---|---|---|---|---|---|
| Admin Login | Form | `"Invalid login credentials."` | English, generic, không nói sai email hay pass | `"Email hoặc mật khẩu không đúng. Vui lòng thử lại."` | 🔴 Critical |
| Settings save | Form | `alert("Lỗi lưu cấu hình: " + resData.error)` | `alert()` không phù hợp, lẫn với code error string | Inline error bar với message rõ ràng | 🔴 Critical |
| Settings save | Form | `alert("Đã xảy ra lỗi: " + err.message)` | Leak technical message ra UI | `"Không thể lưu cài đặt. Vui lòng thử lại hoặc kiểm tra kết nối."` | 🔴 Critical |
| Brand form | Form | `"Có lỗi xảy ra."` | Không nói lỗi gì, user không biết làm gì | `"Không thể tạo thương hiệu. Tên tiếng Việt có thể đã tồn tại."` | 🔴 Critical |
| Promotion form | Form | `"Lỗi kết nối."` | Quá ngắn, không actionable | `"Mất kết nối đến máy chủ. Dữ liệu chưa được lưu. Vui lòng thử lại."` | 🔴 Critical |
| User create | Form | `"Vui lòng điền đầy đủ thông tin."` | Không nói field nào còn trống | `"Vui lòng điền: [field list]"` hoặc highlight fields | 🟠 High |
| User create | Form (BE) | `"Missing required fields"` | English trong admin Việt | `"Thiếu thông tin bắt buộc"` | 🟠 High |
| QuoteForm | fullName | Zod default: `"String must contain at least 2 character(s)"` | English, kỹ thuật | `"Vui lòng nhập đầy đủ họ và tên (tối thiểu 2 ký tự)"` | 🟠 High |
| QuoteForm | phone | Zod default: `"Invalid phone format"` | English, không hướng dẫn format | `"Số điện thoại không hợp lệ. Ví dụ: 0912 345 678 hoặc +84 912 345 678"` | 🟠 High |
| QuoteForm | message | Zod default: `"String must contain at least 10 character(s)"` | English, kỹ thuật | `"Vui lòng mô tả yêu cầu của bạn (tối thiểu 10 ký tự)"` | 🟠 High |
| QuoteForm | server error | `submitError` i18n key (chưa rõ text) | Phụ thuộc i18n key — cần review | Đảm bảo text actionable | 🟡 Medium |
| Category form | Form | `setSaveError(res.error \|\| "Không thể lưu danh mục.")` | Generic fallback | `"Lưu danh mục thất bại. Slug có thể đã tồn tại hoặc thiếu tên tiếng Việt."` | 🟡 Medium |
| Media upload | File type | `"Định dạng không hỗ trợ: ${file.type}."` | ✅ Tốt, chỉ rõ format | Giữ nguyên | ✅ Good |
| Media upload | File size | `"File quá lớn. Tối đa 50MB."` | ✅ Rõ ràng | Giữ nguyên | ✅ Good |
| Admin general | BE errors | `String(err)` (catch block) | Leak JavaScript Error object | Luôn wrap thành user-friendly message | 🟠 High |

### 4.2 Vấn đề hệ thống về microcopy

1. **Lẫn ngôn ngữ**: Zod default messages là English (`"String must contain..."`) trong form Tiếng Việt — không nhất quán
2. **`alert()` dùng sai chỗ**: 8 chỗ dùng `alert()` trong admin-workflows.tsx — không phải UI pattern đúng
3. **Generic catches**: Nhiều `catch` block trả về `String(err)` hoặc `err.message` trực tiếp ra UI — technical noise
4. **Confirm success**: `alert("Tạo thương hiệu thành công!")` + `window.location.href` — abrupt, không có animation hay UX transition

---

## 5. UI Validation State Audit

### 5.1 QuoteForm (CLIENT) — Tốt nhất trong codebase

```
✅ Inline field-level errors (dưới mỗi field)
✅ aria-invalid trên input khi có lỗi
✅ role="alert" trên error span
✅ Server error hiển thị tại đầu submit section
✅ Loading state với Loader2 spinner
✅ Disabled submit khi isSubmitting
✅ Field label rõ, optional fields đánh dấu "(tùy chọn)"
❌ Không có error summary khi submit fail (chỉ hiện lỗi inline riêng lẻ)
❌ Focus không được đưa đến field lỗi đầu tiên sau submit
❌ Phone field dùng type="text" thay vì type="tel"
❌ Không có autocomplete="tel", autocomplete="name"
```

### 5.2 Admin Forms (GENERAL pattern)

Hầu hết admin forms dùng pattern này:
```tsx
{formError && (
  <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
    {formError}
  </div>
)}
// Sau đó: input fields với HTML required, không có inline error
```

**Vấn đề:**
- ❌ Error chỉ hiện ở đầu form (generic) — không inline tại từng field
- ❌ Khi submit fail, user phải đọc error message rồi tự tìm field sai
- ❌ Không có `aria-invalid` trên admin inputs
- ❌ Không có `role="alert"` trên error divs
- ❌ Required marker `*` chỉ có ở một số field (`Tên thương hiệu (VI) *`) — không nhất quán
- ❌ PublishWorkflow error list: hiện tối đa 3 lỗi, cắt `"...và N vấn đề khác"` — không cho biết lỗi nào

### 5.3 AdminField Component

```tsx
function AdminField({ label, name, ... }) {
  return (
    <label className="grid gap-2">
      <span className="label-pd">{label}</span>
      <input ... />
      // ← KHÔNG CÓ error slot
    </label>
  );
}
```

`AdminField` không có `error` prop → **không thể hiện inline error dưới field dù đã validate**. Tất cả error chỉ về `formError` state ở đầu form.

### 5.4 Settings Form

- ❌ `alert()` cho cả success và error — modal native browser, không accessible, không skinnable
- ❌ Không có inline validation trong bất kỳ tab nào
- ❌ Save thành công: `setSaveSuccess(true)` + green banner — ổn, nhưng banner không auto-dismiss

### 5.5 Login Form

- ❌ Không có `autocomplete="email"` và `autocomplete="current-password"`
- ❌ Error message English trong form Việt
- ❌ Error không có `role="alert"` (chỉ là `<p>`)
- ✅ Loading state có Loader2 spinner
- ✅ Submit disabled khi loading

---

## 6. Error Recovery UX Audit

### 6.1 QuoteForm (CLIENT)

| Scenario | Behavior | Verdict |
|---|---|---|
| Submit với field trống | Inline error xuất hiện ngay dưới field | ✅ Tốt |
| Submit với phone sai format | Error xuất hiện nhưng message English | ⚠️ Cần dịch |
| Network fail | `serverError` state set, form giữ data | ✅ Tốt |
| Reload page sau submit | Data mất (không có session storage) | ⚠️ Acceptable |
| Submit success | Redirect đến `/contact/success` | ⚠️ Route chưa verify tồn tại |

### 6.2 Admin Product/Category/Blog Form

| Scenario | Behavior | Verdict |
|---|---|---|
| Save với field sai | Generic error ở đầu form | ⚠️ User tự tìm field |
| Network fail | `catch(err) => setSaveError(String(err))` | ❌ Leak technical message |
| Save success | `router.push("/admin/categories")` + `router.refresh()` | ✅ Ổn |
| Reload trang giữa chừng | Tất cả input state mất | ❌ Không có auto-save/draft protection |
| Publish với lỗi validation | PublishWorkflow block publish ✅ | ✅ Tốt |

### 6.3 Admin Brand / Promotion Form

| Scenario | Behavior | Verdict |
|---|---|---|
| Submit rỗng | BE reject → FE set generic `formError` | ⚠️ Không rõ field nào |
| Submit thành công | `alert()` + `window.location.href` | ❌ Abrupt, không elegant |
| Network fail | `catch => setFormError("Lỗi kết nối.")` | ❌ Không có retry action |
| Điền 30 field rồi fail | Phải nhìn đầu form mới thấy error | ❌ Form dài, error ở đầu bị scroll off |

### 6.4 Settings Form

| Scenario | Behavior | Verdict |
|---|---|---|
| Save thành công | `setSaveSuccess(true)` + reload settings | ✅ |
| Save thất bại | `alert("Lỗi lưu cấu hình: " + error)` | ❌ Native browser alert |
| Thay đổi nhiều tab chưa save | `isDirty` state + UnsavedChangesBar | ✅ Có dirty tracking |
| Discard changes | Gọi GET lại và reset state | ✅ Tốt |
| API key paste sai | Không có validation — save thẳng | ❌ Silently invalid |

### 6.5 Pain Points lớn nhất

1. **Admin dài forms + error ở đầu**: Blog/Product form có nhiều section, khi submit fail error xuất hiện đầu form nhưng user đang scroll cuối — không thấy error
2. **`alert()` breaks flow**: 8 `alert()` calls — trên mobile/tablet native alert khác UI hoàn toàn, không dismissable bằng keyboard shortcut hợp lý
3. **Không có unsaved changes protection trên create forms**: Nếu browser navigate away giữa chừng điền form — mất sạch
4. **Không có retry explicit**: Khi submit fail với "Lỗi kết nối" — user không có nút retry rõ ràng, phải bấm Submit lại

---

## 7. Upload / File Validation Audit

### 7.1 MediaUploadPanel (Standalone Upload) — Tốt nhất

| Check | Status | Detail |
|---|---|---|
| File type client | ✅ | 8 types: JPEG/PNG/WebP/AVIF/GIF/SVG/MP4/WebM |
| File size client | ✅ | 50MB limit |
| Progress bar | ✅ | XHR onprogress → 0–80%, persist → 85%, done → 100% |
| Error display | ✅ | Inline trong upload zone |
| Success display | ✅ | URL + copy button |
| Retry | ⚠️ | Phải chọn file lại — không có explicit "retry" button |
| Drag & drop | ✅ | Hoạt động |
| BE validation | ✅ | Format whitelist + size + Cloudinary URL domain |
| Dimension validation | ❌ | Không có min/max width/height |
| Aspect ratio | ❌ | Không có |
| SVG sanitization | ❌ | SVG được upload nhưng không strip malicious scripts |

### 7.2 Image Fields trong Admin Forms (Cover Image pickers)

Các form như Product, Category, Blog, Showroom, Brand, Promotion đều có `cover_image` field. Tất cả đều dùng `MediaPicker` hoặc URL input.

**Kiểm tra `MediaPicker`:**
```tsx
// admin-interactions.tsx — MediaPicker component
// Nhận selected URL từ media library
// KHÔNG validate URL format
// KHÔNG validate URL là ảnh
// KHÔNG validate dimension/aspect ratio
// Không có preview error state nếu URL broken
```

| Module | Upload type | File type check | Size check | Dimension | Preview | Required when publish |
|---|---|---|---|---|---|---|
| Products (cover) | MediaPicker URL | ❌ | ❌ | ❌ | ✅ (if valid URL) | ❌ |
| Products (gallery) | MediaPicker multi | ❌ | ❌ | ❌ | ✅ | ❌ |
| Categories | MediaPicker URL | ❌ | ❌ | ❌ | ✅ | ❌ |
| Brands (logo) | `<input type="text">` URL manual | ❌ | ❌ | ❌ | ❌ | ❌ |
| Promotions (cover) | MediaPicker URL | ❌ | ❌ | ❌ | ✅ | ❌ |
| Blog (cover) | MediaPicker URL | ❌ | ❌ | ❌ | ✅ | ❌ |
| Showrooms (cover) | MediaPicker URL | ❌ | ❌ | ❌ | ✅ | ❌ |
| Settings (logo) | MediaPicker URL | ❌ | ❌ | ❌ | ✅ | ❌ |
| Standalone media | File input + drag | ✅ | ✅ | ❌ | ✅ | N/A |

**Brand logo field** là tệ nhất — dùng plain `<input type="text">` để nhập URL logo:
```tsx
// admin-workflows.tsx:2830
<AdminField label="URL Logo thương hiệu" name="brand-logo" value={logoUrl} onChange={setLogoUrl}
  placeholder="https://..." inputType="url" />
```
Không validate URL hợp lệ, không validate là ảnh, không preview.

### 7.3 Inline Image Fields trong Blog Body (RichTextEditorMock)

- Blog body dùng Markdown textarea → không có inline image upload
- Admin nhập URL ảnh thủ công vào Markdown `![alt](url)` — không validate URL, không preview trong editor

---

## 8. Responsive + Accessibility Validation Audit

### 8.1 Input Type Attributes

| Form | Field | Current type | Đúng type | Vấn đề |
|---|---|---|---|---|
| QuoteForm | phone | `type="text"` | `type="tel"` | Mobile không mở numpad |
| QuoteForm | email | `type="email"` | `type="email"` | ✅ |
| Admin Login | email | `type="email"` | `type="email"` | ✅ |
| Admin Login | password | `type="password"` | `type="password"` | ✅ |
| User Create | email | `type="email"` | `type="email"` | ✅ |
| User Create | password | `type="password"` | `type="password"` | ✅ |
| Showroom | hotline | `type="text"` (via AdminField) | `type="tel"` | Mobile không mở numpad |
| Settings | contactPhone | `type="text"` (via AdminField) | `type="tel"` | Mobile không mở numpad |
| Settings | contactEmail | `type="text"` (via AdminField) | `type="email"` | No mobile email keyboard |
| Settings | API keys | `type="text"` | `type="password"` | Secrets visible in plain text |
| Product | price fields | `type="text"` (via AdminField) | `type="number"` | No numeric keyboard mobile |
| Promotion | discountPercentage | `type="text"` | `type="number"` | No numeric keyboard |

### 8.2 Autocomplete Attributes

**Không có `autocomplete` attribute trên bất kỳ field nào** trong toàn bộ codebase (kết quả grep: 0 match).

Những chỗ bị thiếu:

| Form | Field | Autocomplete value cần thêm |
|---|---|---|
| Admin Login | email | `autocomplete="email"` |
| Admin Login | password | `autocomplete="current-password"` |
| User Create | email | `autocomplete="email"` |
| User Create | password | `autocomplete="new-password"` |
| QuoteForm | fullName | `autocomplete="name"` |
| QuoteForm | phone | `autocomplete="tel"` |
| QuoteForm | email | `autocomplete="email"` |
| QuoteForm | company | `autocomplete="organization"` |

### 8.3 Accessibility (ARIA)

| Check | QuoteForm | Admin Forms | Verdict |
|---|---|---|---|
| `aria-invalid` | ✅ có trên inputs | ❌ không có | Gap lớn ở admin |
| `aria-describedby` (link error to field) | ❌ thiếu | ❌ thiếu | Thiếu hoàn toàn |
| `role="alert"` trên error | ✅ server error, inline errors | ❌ chỉ div thường | Admin không accessible |
| `aria-live` | ✅ PublishWorkflow feedback | ❌ admin forms không có | Gap |
| Label association | ✅ `<label>` wrap | ✅ `<label>` wrap | ✅ |
| Focus management sau error | ❌ không có | ❌ không có | Thiếu hoàn toàn |
| Tab order | ✅ tự nhiên | ✅ tự nhiên | ✅ |
| Error visible không chỉ dựa màu | ⚠️ có text nhưng không có icon | ❌ chỉ màu đỏ | Cần icon |

### 8.4 Mobile-specific Issues

- **Settings API Key fields**: `type="text"` → API key hiện rõ trên màn hình — nên là `type="password"` với show/hide toggle
- **Phone fields**: Không có `type="tel"` → mobile keyboard là QWERTY thay vì numpad — friction lớn
- **Admin forms trên tablet**: Form 2-col layout (`lg:grid-cols-[1fr_320px]`) collapse tốt; nhưng error div ở section đầu có thể bị scroll ra khỏi view khi làm việc ở section giữa

---

## 9. Business-Specific Validation Audit

### 9.1 Products

| Business rule | Validate chưa | Risk |
|---|---|---|
| Publish cần cover image | ❌ | Product public không có ảnh |
| Publish cần category | ✅ schema | ✅ |
| price_min ≤ price_max | ❌ | Admin nhập ngược, sai giá range |
| promo_price < price_min | ❌ | Giá khuyến mãi cao hơn giá gốc |
| SEO title ≤ 60 ký tự | ❌ | Bị truncate trên Google |
| SEO desc ≤ 160 ký tự | ❌ | Bị truncate trên Google |
| Slug unique | ❌ FE, ⚠️ DB constraint | Race condition có thể qua |
| Brand tồn tại khi assign | ✅ UUID check | ✅ |

### 9.2 Categories

| Business rule | Validate chưa | Risk |
|---|---|---|
| Parent không thể là chính nó | ❌ | Category circular reference |
| Slug unique trong cùng parent | ❌ FE | DB constraint |
| Publish cần name_vi | ✅ | ✅ |
| Max depth parent/child | ❌ | Infinite nesting |

### 9.3 Brands

| Business rule | Validate chưa | Risk |
|---|---|---|
| name_vi required | ✅ HTML required | Yếu (có thể bypass) |
| Logo URL valid image | ❌ | Logo broken trên site |
| Slug/name unique | ❌ FE | DB constraint |
| Publish cần logo | ❌ | Brand hiện không có logo |

### 9.4 Promotions — Highest Risk Module

| Business rule | Validate chưa | Risk |
|---|---|---|
| start_at < end_at | ❌ | Campaign hết hạn trước khi bắt đầu |
| start_at / end_at có thể set | ❌ (hardcode null) | Admin không thể đặt ngày |
| discount_percentage 0-100 | ✅ schema | ✅ |
| combo_price < original_price | ❌ | Combo đắt hơn giá lẻ |
| items là UUID hợp lệ | ❌ | Broken product mapping |
| Publish cần cover image | ❌ | Promotion không có ảnh |
| Publish cần ít nhất 1 sản phẩm | ❌ | Promotion rỗng |
| code unique | ❌ FE | DB constraint |

### 9.5 Blog

| Business rule | Validate chưa | Risk |
|---|---|---|
| Publish cần cover image | ❌ | Blog card không có ảnh |
| Publish cần body content | ✅ validationErrors[] | ✅ |
| Publish cần excerpt | ✅ validationErrors[] | ✅ |
| Publish cần SEO title | ✅ validationErrors[] | ✅ |
| SEO title ≤ 60 ký tự | ❌ | Truncated on Google |
| slug unique | ❌ FE | DB constraint |
| category tồn tại | ✅ required select | ✅ |

### 9.6 Showrooms

| Business rule | Validate chưa | Risk |
|---|---|---|
| Google Maps URL valid embed | ❌ format | Broken iframe embed |
| Hotline format | ❌ | Số không gọi được |
| latitude/longitude range | ❌ | Invalid coords |
| Publish cần address + hotline | ✅ Zod + validationErrors[] | ✅ |
| Opening hours format | ❌ | Inconsistent display |

### 9.7 Settings

| Business rule | Validate chưa | Risk |
|---|---|---|
| contactPhone format | ❌ | Sai số → mất lead |
| contactEmail format | ❌ | Email báo giá fail |
| resendKey format (re_...) | ❌ | Silent email fail |
| logoUrl is image | ❌ | Broken logo site-wide |
| SEO default title ≤ 60 | ❌ | Truncated |
| SEO default desc ≤ 160 | ❌ | Truncated |
| Social link URLs valid | ❌ | Broken social links |

### 9.8 Quote/Contact (CLIENT)

| Business rule | Validate chưa | Risk |
|---|---|---|
| Phone VN format | ⚠️ Regex lỏng | Số ảo qua được |
| Message spam detection | ❌ | Spam submissions |
| Rate limiting | ✅ IP-based (server) | ✅ |
| Honeypot | ✅ max(0) | ✅ |
| productId tồn tại trong DB | ❌ FE | API resolve silently |

---

## 10. Top 10 Critical Issues

### 🔴 CRITICAL

**#1 — Settings form: không có validation + `alert()` error**
- File: [`admin-workflows.tsx:1488`](file:///d:/THCode/AI/furniture-website/components/showroom/admin-workflows.tsx)
- Risk: Admin lưu email/phone sai format → toàn bộ site hiện thông tin sai, email báo giá fail
- Fix: Thêm Zod schema `settingsSchema`, inline validation, bỏ `alert()` → dùng error banner

**#2 — Brand + Promotion forms: zero validation FE + zero validation BE**
- File: [`admin-workflows.tsx:2763`](file:///d:/THCode/AI/furniture-website/components/showroom/admin-workflows.tsx), [`admin-workflows.tsx:2930`](file:///d:/THCode/AI/furniture-website/components/showroom/admin-workflows.tsx)
- Risk: Dữ liệu rác vào DB không kiểm soát
- Fix: Gọi `brandSchema.safeParse()` và `promotionSchema.safeParse()` tại handleSubmit

**#3 — Promotions: `start_at`/`end_at` hardcode null — admin không thể set ngày**
- File: [`admin-workflows.tsx:2945-2946`](file:///d:/THCode/AI/furniture-website/components/showroom/admin-workflows.tsx)
- Risk: Mọi promotion không có ngày → client code broken (và `now` hardcode từ Critical #1 của client audit)
- Fix: Thêm DatePicker UI + date range cross-validation

**#4 — AdminField không có error slot → không thể hiện inline errors**
- File: [`admin-workflows.tsx:4813`](file:///d:/THCode/AI/furniture-website/components/showroom/admin-workflows.tsx)
- Risk: Tất cả admin form validation chỉ hiện ở đầu form — UX tệ cho form dài
- Fix: Thêm `error?: string` prop vào AdminField, render `<span role="alert">`

**#5 — API keys trong Settings hiện plain text (`type="text"`)**
- File: [`admin-workflows.tsx`](file:///d:/THCode/AI/furniture-website/components/showroom/admin-workflows.tsx) — Settings integrations tab
- Risk: Admin screen sharing → expose Resend/Gemini API key
- Fix: `type="password"` với show/hide toggle

### 🟠 HIGH

**#6 — Login error message English trong admin Việt ngữ**
- File: [`admin-login.tsx:56`](file:///d:/THCode/AI/furniture-website/components/showroom/admin-login.tsx)
- Fix: `"Email hoặc mật khẩu không đúng. Vui lòng thử lại."` + `role="alert"`

**#7 — QuoteForm: Zod error messages English — user Việt không hiểu**
- File: [`lib/validations/quote.ts`](file:///d:/THCode/AI/furniture-website/lib/validations/quote.ts)
- Fix: Custom Zod messages bằng tiếng Việt cho toàn bộ schema

**#8 — Phone field `type="text"` trên cả QuoteForm và Admin Showroom/Settings**
- Files: `quote-form.tsx:242`, `admin-workflows.tsx` (multiple)
- Fix: `type="tel"` + `autocomplete="tel"` + `inputMode="tel"`

**#9 — `autocomplete` thiếu hoàn toàn trên tất cả forms**
- Files: Toàn bộ form components
- Risk: Browser không autofill → friction cho admin, friction cho user public
- Fix: Thêm đúng `autocomplete` values theo spec

**#10 — Cross-field validation price_min/max, promo_price, combo/original thiếu hoàn toàn**
- File: [`lib/validations/admin.ts`](file:///d:/THCode/AI/furniture-website/lib/validations/admin.ts)
- Fix: Thêm `.refine()` checks: `price_max >= price_min`, `promo_price < price_min`

---

## 11. Priority Remediation Roadmap

### 🔴 CRITICAL (1–2 ngày)

| # | Task | File | Effort |
|---|---|---|---|
| 1 | Settings form: thêm `settingsSchema` Zod, bỏ `alert()`, dùng error banner | `admin-workflows.tsx` | 4h |
| 2 | Brand/Promotion handleSubmit: gọi `brandSchema.safeParse()` / `promotionSchema.safeParse()` | `admin-workflows.tsx` | 2h |
| 3 | Promotions: thêm DatePicker UI cho start_at/end_at + cross-validate start < end | `admin-workflows.tsx` | 4h |
| 4 | API key fields: đổi `type="text"` → `type="password"` + show/hide toggle | `admin-workflows.tsx` | 1h |
| 5 | AdminField: thêm `error?: string` prop + `role="alert"` error slot | `admin-workflows.tsx` | 2h |

### 🟠 HIGH (3–5 ngày)

| # | Task | File | Effort |
|---|---|---|---|
| 6 | Login: đổi error message sang Tiếng Việt + thêm `role="alert"` | `admin-login.tsx` | 30m |
| 7 | QuoteForm: custom Zod messages Tiếng Việt | `lib/validations/quote.ts` | 1h |
| 8 | Phone fields: `type="tel"` + `autocomplete="tel"` trên QuoteForm và admin forms | multiple | 1h |
| 9 | Thêm `autocomplete` attributes trên tất cả forms (login, user create, quote) | multiple | 2h |
| 10 | Cross-field price validation: price_min ≤ price_max, promo < price | `lib/validations/admin.ts` | 1h |
| 11 | Product publish guard: bắt buộc cover_image khi status=published | `admin-workflows.tsx` | 2h |
| 12 | Blog publish guard: bắt buộc cover_image khi status=published | `admin-workflows.tsx` | 1h |
| 13 | Settings: validate contactPhone format (VN phone), contactEmail format | `api/admin/settings/route.ts` | 2h |
| 14 | User create: validate email format + password min 8 ký tự FE | `admin-workflows.tsx` | 1h |

### 🟡 MEDIUM (1–2 tuần)

| # | Task | Effort |
|---|---|---|
| 15 | Focus management: sau submit fail, focus field error đầu tiên | 3h |
| 16 | Error summary component: liệt kê tất cả field errors khi submit | 3h |
| 17 | SEO field length validation: title ≤ 60, desc ≤ 160 + character counter | 3h |
| 18 | Category circular reference check (parent không thể là con của chính mình) | 2h |
| 19 | Promotion: validate combo_price < original_price | 1h |
| 20 | Promotion: validate ít nhất 1 product mapping khi publish | 2h |
| 21 | Brand logo URL: validate là URL hợp lệ + preview | 2h |
| 22 | `aria-invalid` + `aria-describedby` trên tất cả admin form inputs | 4h |
| 23 | QuoteForm: error summary khi có nhiều field errors | 2h |
| 24 | Replace tất cả 8 `alert()` trong admin bằng toast/inline UI | 3h |

### 🟢 LOW (Future sprint)

| # | Task |
|---|---|
| 25 | SVG upload sanitization (strip malicious scripts) |
| 26 | Image dimension/aspect ratio validation cho cover images |
| 27 | Slug uniqueness real-time check (debounce API call) |
| 28 | Auto-save draft trên create/edit forms (localStorage) |
| 29 | Unsaved changes `beforeunload` protection |
| 30 | Phone regex chặt hơn (VN phone format: 10 số, bắt đầu 0 hoặc +84) |

---

## 12. Final Verdict

### 1. Những form nào chưa production-ready?

| Form | Verdict | Lý do |
|---|---|---|
| Settings | ❌ FAIL | Zero validation + `alert()` error + API keys plain text |
| Brand create/edit | ❌ FAIL | Zero validation FE + BE |
| Promotion create/edit | ❌ FAIL | Zero validation + start/end date không set được |
| User create | ❌ FAIL | Minimal truthy check, password không validate |
| Login | ⚠️ PARTIAL | Hoạt động nhưng error English, thiếu autocomplete |
| Product create/edit | ⚠️ PARTIAL | FE validation có nhưng yếu, BE không enforce |
| QuoteForm (client) | ⚠️ PARTIAL | Logic ổn nhưng Zod messages English, thiếu tel/autocomplete |
| Category create/edit | ⚠️ PARTIAL | Zod có nhưng inline errors thiếu |
| Blog create/edit | ⚠️ PARTIAL | validationErrors[] nhưng không inline |
| Media upload | ✅ READY | Validation đầy đủ nhất trong codebase |

### 2. Module validation yếu nhất?

1. **Settings** — không có validation gì, `alert()` crude UX
2. **Promotions** — không validate, date hardcode null, không validate product mapping
3. **Brands** — dùng Zod schema nhưng không gọi

### 3. Text lỗi cần viết lại gấp?

1. `"Invalid login credentials."` → `"Email hoặc mật khẩu không đúng."`
2. `"Missing required fields"` (BE users) → `"Thiếu thông tin bắt buộc: email, mật khẩu, tên"`
3. `"String must contain at least 2 character(s)"` (Zod) → `"Vui lòng nhập họ tên (tối thiểu 2 ký tự)"`
4. `"Invalid phone format"` (Zod) → `"Số điện thoại không hợp lệ. Ví dụ: 0912 345 678"`
5. `"Lỗi kết nối."` (Brand/Promotion) → `"Mất kết nối đến máy chủ. Vui lòng thử lại."`
6. Tất cả `alert(...)` — thay bằng UI inline/toast

### 4. Upload case nào còn fail?

1. **Brand logo** — input text URL, không validate format, không preview
2. **Tất cả field cover_image** — không validate URL là ảnh thật, broken URL silently fail
3. **SVG upload** — không sanitize, XSS vector tiềm năng
4. **Blog inline images** — Markdown URL thủ công, zero validation

### 5. Nếu chỉ fix 10 việc validation trước, nên fix gì?

| Priority | Fix |
|---|---|
| 1 | Settings form: Zod schema + bỏ `alert()` + API key `type="password"` |
| 2 | Brand/Promotion: gọi Zod schema tại handleSubmit |
| 3 | Promotions: thêm DatePicker UI cho start_at/end_at + cross-validate |
| 4 | AdminField: thêm `error` prop + inline error slot |
| 5 | Login: error message Tiếng Việt + `role="alert"` |
| 6 | QuoteForm: custom Zod messages Tiếng Việt |
| 7 | Phone fields: `type="tel"` + `autocomplete="tel"` |
| 8 | `autocomplete` attributes trên login, user create, quote form |
| 9 | Price cross-validation: min ≤ max, promo < original |
| 10 | Publish guards: cover_image bắt buộc khi publish Product/Blog |

---

*Báo cáo được tạo ngày 2026-06-19 · Evidence từ code review trực tiếp*  
*Xem thêm: [client_audit_report.md](file:///C:/Users/DELL/.gemini/antigravity/brain/7e03c2c5-5cd9-4683-8255-77f09e27b9ca/client_audit_report.md) | [admin_audit_report.md](file:///C:/Users/DELL/.gemini/antigravity/brain/7e03c2c5-5cd9-4683-8255-77f09e27b9ca/admin_audit_report.md)*
