# CLIENT / PUBLIC WEBSITE — AUDIT REPORT
**Auditor role**: Principal Product Designer + Senior Public-Site UX Auditor + Staff Full-stack Frontend Reviewer  
**Audit date**: 2026-06-19  
**Scope**: `/app/[locale]/*` — tất cả route public. **Không** bao gồm admin.  
**Verdict approach**: Skeptical, không nể nang, đánh giá theo production-readiness thực tế.

---

## MỤC LỤC
1. [Executive Summary](#1-executive-summary)
2. [UI Audit — Thiết kế & Hệ thống giao diện](#2-ui-audit)
3. [UX Audit — Trải nghiệm người dùng cuối](#3-ux-audit)
4. [Business Completeness — Mức độ hoàn thiện nghiệp vụ](#4-business-completeness)
5. [Data Mapping Gaps — Đứt gãy dữ liệu Admin ↔ Client](#5-data-mapping-gaps)
6. [Responsive & Mobile Audit](#6-responsive--mobile-audit)
7. [Design System Audit](#7-design-system-audit)
8. [SEO & Performance Audit](#8-seo--performance-audit)
9. [Top 10 Critical Issues](#9-top-10-critical-issues)
10. [Roadmap Fix ưu tiên](#10-roadmap-fix-ưu-tiên)
11. [Final Verdict](#11-final-verdict)

---

## 1. Executive Summary

Client site có **nền tảng kỹ thuật khá tốt**: codebase Next.js App Router rõ ràng, Supabase RPC với fallback mock, next-intl bilingual hoạt động, design system token nhất quán, QuoteForm Zod-validated. Nhìn từ xa, trông "xong".

Nhưng sau khi audit sâu code, có **3 nhóm vấn đề nghiêm trọng** chặn production thực sự:

1. **Data disconnects**: Cài đặt admin không tác động đến một số vùng client quan trọng (trang chủ hero/text, contact hardcode, trust badges cứng).
2. **Content integrity**: Nhiều nội dung vẫn hardcode hoặc dùng mock fallback khi DB trống — nguy cơ phát live với số điện thoại/email sai, brand list ảo.
3. **UX conversion gaps**: Không có wishlist/so sánh, blog thiếu CTA chuyển đổi, promotions page phức tạp và khó hiểu với người dùng thông thường.

**Điểm tổng**: `65 / 100` — **Chưa production-ready**. Phù hợp demo/staging, không phù hợp live thật với khách hàng thực.

---

## 2. UI Audit

### 2.1 Trang chủ (Homepage) — `/`

| Hạng mục | Đánh giá | Chi tiết |
|---|---|---|
| Hero section | ✅ Tốt | HeroShowcase component với 3 slides, animation mượt, eyebrow/title/lead rõ |
| Category grid | ✅ Tốt | Dynamic từ DB, 4 layout variant theo số lượng category |
| Featured products | ✅ Tốt | Grid responsive 2→3→4→5 cột |
| Blog editorial | ⚠️ Trung bình | Layout đẹp nhưng readTime cứng "6 phút đọc" — không lấy từ DB |
| Trust badges | ❌ Vấn đề | `20+`, `500+`, `2.000m2` — **hardcode trong `showroom-constants.ts`**, Admin không thể cập nhật |
| Brand marquee | ⚠️ Trung bình | Chỉ hiện 7 brands (`.slice(0,7)`). Nếu DB có 20 brand chỉ marquee 7. Logic hợp lý nhưng nên dùng tất cả |
| Showroom preview | ✅ Tốt | Dynamic từ DB, fallback mock sạch |
| Quote form | ✅ Tốt | Form đầy đủ, validate Zod, accessible |
| Story section | ❌ Vấn đề | Reuse cùng title/text từ `heroSlide3Title` — **bản thân section Story không có heading độc lập** |

### 2.2 Products — `/products`

| Hạng mục | Đánh giá | Chi tiết |
|---|---|---|
| Page header | ✅ Tốt | Hero image + breadcrumb + tiêu đề |
| Group shortcuts | ⚠️ Vấn đề | 3 group cards dùng `productGroups` **static** từ `showroom-constants.ts`, không đọc từ DB category |
| Filter panel | ✅ Tốt | Category dynamic, brand dynamic, taxonomy filters rõ |
| Product grid | ✅ Tốt | `sm:2 lg:3 xl:4`, ProductCard component rõ |
| Pagination | ✅ Tốt | Server-side pagination chuẩn |
| Empty state | ✅ Tốt | Có CTA /contact |
| "Other categories" section | ⚠️ Vấn đề | `secondaryGroups` từ static `productGroups`, không từ dynamic DB categories |

### 2.3 Product Detail — `/products/[slug]`

| Hạng mục | Đánh giá | Chi tiết |
|---|---|---|
| Gallery | ✅ Tốt | ProductGallery với lightbox/zoom |
| Info sidebar | ✅ Tốt | Price với cũ/mới, reference code, specs top 4 |
| **Hotline cứng** | ❌ Critical | Dòng 232: `1800 6089` — **hardcode trong JSX** thay vì từ siteSettings |
| Quote form | ✅ Tốt | Pre-filled sản phẩm, dynamic product options |
| Related products | ✅ Tốt | Fetch từ cùng category, fallback mock |
| Tabs (specs/material/delivery) | ⚠️ Vấn đề | Tab content là text **generic hardcode** (care note, delivery note, warranty note) trong `messages/*.json` — không per-product |
| Social share | ✅ Tốt | Với copy-to-clipboard |

### 2.4 Promotions — `/promotions`

| Hạng mục | Đánh giá | Chi tiết |
|---|---|---|
| Hero | ✅ Tốt | Dark background, badge, headline ấn tượng |
| Quick jump nav | ✅ Tốt | Client-side PromotionQuickJump tốt |
| Campaign cards | ⚠️ Phức tạp | Card quá dài, quá nhiều thông tin — user scan khó |
| **`now` hardcode** | ❌ Critical | Dòng 129: `const now = new Date("2026-06-19T10:08:08+07:00")` — **date tĩnh**! Campaign status sẽ sai hoàn toàn sau ngày này |
| Individual purchase clarification | ✅ Tốt | Banner đỏ nhỏ giải thích mua lẻ từng món |
| Products mapping | ⚠️ Vấn đề | Fallback mappings UUIDs hardcode → nếu DB ID khác sẽ không match |
| Price formatting | ⚠️ Vấn đề | `formatPrice` có logic kỳ lạ: nếu val === 1500000 thì treat như m² — brittle |
| Campaign perks | ⚠️ Vấn đề | Code-based `if p.code === "SUMMER-SALE-2026"` — admin không thể thay đổi campaign code |

### 2.5 Showrooms — `/showrooms`

| Hạng mục | Đánh giá | Chi tiết |
|---|---|---|
| Layout | ✅ Tốt | Article grid với image + info |
| Map embed | ✅ Tốt | `ShowroomMap` có URL validation an toàn |
| Fallback | ✅ Tốt | Empty state rõ |
| **Duplicate component** | ⚠️ | `ShowroomMap` định nghĩa lại trong file thay vì dùng `components/public/GoogleMap.tsx` có sẵn |

### 2.6 Blog — `/blog` và `/blog/[slug]`

| Hạng mục | Đánh giá | Chi tiết |
|---|---|---|
| Listing | ✅ Tốt | Featured post + grid layout đẹp |
| Categories filter | ⚠️ Vấn đề | Category tags hiển thị nhưng **không filterable** — không thể click tag để lọc |
| readTime | ❌ Vấn đề | Hardcode "5 phút đọc" / "5 min read" cho tất cả posts — không tính từ nội dung |
| Blog detail | ✅ Tốt | TOC, body JSON renderer |
| CTA conversion | ❌ Vấn đề | Cuối bài blog **không có CTA** nào dẫn sang products hoặc quote form |

### 2.7 Contact — `/contact`

| Hạng mục | Đánh giá | Chi tiết |
|---|---|---|
| Form | ✅ Tốt | Dynamic products/categories, QuoteForm |
| **Hotline hardcode** | ❌ Critical | Dòng 128: `08172 357 587` — hardcode trong JSX, không đọc từ siteSettings |
| **Email hardcode** | ❌ Critical | Dòng 132: `contact@phuongdong.com` — hardcode, sai domain (`.com` vs `.vn` trong siteSettings defaults) |
| Showroom addresses | ✅ Tốt | Dynamic từ DB, fallback mock rõ |
| Showroom card | ✅ Tốt | Link sang `/showrooms` với preview image |

### 2.8 About — `/about`

| Hạng mục | Đánh giá | Chi tiết |
|---|---|---|
| Hero | ✅ Tốt | Full-bleed image, dynamic title/lead từ `content_pages` DB |
| Brand story | ⚠️ | Text hardcode trong JSX (không qua i18n key, không qua DB) |
| Values grid | ✅ Tốt | Dynamic icon + text từ i18n |
| Trust metrics | ⚠️ | `trustBadges` static từ constants — Admin không cập nhật được `20+`, `500+`, `2.000m2` |
| Team section | ❌ Vấn đề | Chỉ có 1 ảnh generic — không có team members thật, không có dynamic data |
| CTA | ✅ Tốt | Link sang /contact |

---

## 3. UX Audit

### 3.1 Navigation & Discovery

**Mega Menu** (Desktop):
- ✅ Brand catalog mega menu hoạt động tốt — hover delay 150ms phù hợp
- ✅ Type sections (category-based) dynamic từ DB products
- ⚠️ Brand tab: nếu brand không có product nào trong DB, hiện "Chưa có sản phẩm" — **ổn UX nhưng trông trống**
- ✅ Keyboard nav (Escape đóng catalog)
- ❌ Không có search trong mega menu hoặc header — user muốn tìm "bồn tắm kohler" phải biết vào Products page

**Mobile Menu**:
- ✅ Slide-in với lock body scroll
- ⚠️ Brand list và category list trên mobile **chỉ tên, không có mô tả hay ảnh** — khác trải nghiệm desktop nhiều
- ❌ Không có quick contact số (chỉ FAB) — user mobile muốn gọi ngay phải mở FAB trước

**FAB Contact**:
- ✅ Thiết kế tốt — Hotline, Zalo, Messenger, Contact form
- ✅ Phone dynamic từ siteSettings
- ⚠️ Messenger URL `https://m.me/phuongdongshowroom` — **hardcode slug** chưa chắc đúng page thật

### 3.2 Product Discovery Flow

```
Homepage → Products listing → Product detail → Quote form
```

- ✅ Flow cơ bản hoạt động
- ❌ **Không có wishlist/saved items** — user phải nhớ sản phẩm muốn mua khi quay lại
- ❌ **Không có product comparison** — đây là tính năng critical với nội thất cao cấp (khách thường so sánh 2-3 options)
- ⚠️ Filters taxonomy (`material`, `room`, `style`, `collection`, `tone`) không có dữ liệu thật map vào products từ DB → lọc thường ra kết quả 0
- ❌ Sort chỉ có 2 options: `newest` và `featured` — không có sort by price, không có sort by name
- ⚠️ Sau khi apply filter, URL cập nhật nhưng **không có feedback rõ ràng** (số kết quả nhỏ, khó nhận ra)

### 3.3 Quote Form UX

- ✅ Form có pre-fill từ product/category context
- ✅ Zod validation + error messages
- ✅ Auto-fetch quote options từ `/api/quote-options` nếu server không pass đủ
- ⚠️ `sourceUrl: typeof window === "undefined" ? "" : window.location.href` — chỉ chạy client-side, SSR sẽ trống
- ❌ Success page route `/contact/success` — **cần kiểm tra route này tồn tại không** (không thấy trong directory listing)
- ⚠️ Form ở trang chủ không có product/category pre-fill — field "Sản phẩm quan tâm" sẽ trống và user phải scroll qua list dài

### 3.4 Content Consumption (Blog)

- ✅ Blog listing layout đẹp — featured post hero card nổi bật
- ❌ Category tags không filterable — **visual affordance bị broken** (trông như button nhưng không click được)
- ❌ Sau khi đọc bài blog, không có CTA rõ ràng: "Xem sản phẩm liên quan" hoặc "Yêu cầu tư vấn"
- ❌ readTime hardcode → giảm trust

### 3.5 Promotions UX — Đặc biệt đáng lo ngại

- ❌ **Trang quá dài và phức tạp** với user lần đầu ghé thăm. Mỗi campaign card chiếm rất nhiều screen space
- ❌ Logic "mua lẻ từng món" mâu thuẫn với tên section "Campaign Bundles Details" — **confusing copy**
- ❌ `const now = new Date("2026-06-19T10:08:08+07:00")` — date tĩnh sẽ cho tất cả campaigns status "đã hết hạn" hoặc sai sau ngày audit
- ⚠️ Promotion products dùng fallback mapping UUIDs cứng — nếu DB không match, section "Sản phẩm ưu đãi" sẽ trống
- ❌ Coupon code copy (PromotionCouponButton) — **copy xong làm gì?** Không có ô nhập coupon ở bất kỳ đâu trên site (không có giỏ hàng)

### 3.6 Conversion Funnel Assessment

| Touchpoint | CTA | Conversion Path | Đánh giá |
|---|---|---|---|
| Homepage | "Khám phá" → products | ✅ Rõ | |
| Homepage | Quote form | ✅ Tốt | |
| Product listing | "Khám phá" → detail | ✅ | |
| Product detail | "Báo giá ngay" | ✅ | |
| Blog listing | Không có quote CTA | ❌ | |
| Blog detail | Không có quote CTA | ❌ | |
| About | "Liên hệ tư vấn" | ✅ | |
| Promotions | "Đăng ký nhận ưu đãi" | ⚠️ Confusion | |
| Showrooms | "Gọi ngay" | ✅ | |

---

## 4. Business Completeness

### 4.1 Core Business Flows

| Flow | Status | Vấn đề |
|---|---|---|
| Khách xem sản phẩm | ✅ Hoạt động | |
| Khách yêu cầu báo giá | ✅ Hoạt động | Form submit → DB |
| Khách tìm showroom | ✅ Hoạt động | |
| Khách đọc blog | ✅ Hoạt động | |
| Khách xem khuyến mãi | ⚠️ Broken | `now` hardcode, promo mapping có thể fail |
| Khách so sánh sản phẩm | ❌ Thiếu | Tính năng không tồn tại |
| Khách lưu sản phẩm | ❌ Thiếu | Wishlist không có |
| Khách lọc theo giá | ❌ Thiếu | Không có price range filter |

### 4.2 Product Catalog Completeness

- ✅ Products có hình ảnh, giá, specs, category, brand
- ❌ **Không có filter theo giá** — đây là basic filter nhất của e-commerce nội thất
- ❌ Taxonomy filters (`room`, `style`, `collection`, `tone`) **không có data thật từ DB** — các sản phẩm không có `roomKey`, `styleKey`, v.v. mapped → lọc luôn ra 0 kết quả
- ⚠️ Brand filter: resolve brand slug → UUID không đáng tin cậy (search case-insensitive match)

### 4.3 Promotions Business Logic

- ❌ **Coupon code không có giá trị thực tế**: client không có cart, không có checkout → coupon code không apply được đâu cả
- ❌ `p.code` hardcode check (`if p.code === "SUMMER-SALE-2026"`) → campaign perks sẽ **trống** nếu admin tạo campaign với code khác
- ❌ `now` date tĩnh → tất cả promotions sẽ hiển thị sai status sau ngày 2026-06-19
- ⚠️ Price formatting `formatPrice` có magic number `if (val === 1500000 || val === 1200000 || val === 1350000)` → chỉ đúng với mock data cứng

### 4.4 Contact & Lead Capture

- ✅ QuoteForm submit qua `/api/contact` → DB
- ❌ Contact page hotline `08172 357 587` và email `contact@phuongdong.com` hardcode
- ⚠️ `siteSettings.contactPhone` được dùng đúng trong FAB và header, nhưng **không được đọc trong trang contact/page.tsx**
- ❌ Không có live chat widget (chỉ có FAB redirect)
- ⚠️ Messenger URL `https://m.me/phuongdongshowroom` hardcode slug

---

## 5. Data Mapping Gaps

> **Đây là phần nghiêm trọng nhất trong audit này.** Codebase có admin và client song song nhưng nhiều luồng dữ liệu bị đứt gãy.

### 5.1 Map hoàn chỉnh Admin → Client

| Data | Admin Quản lý | Client Consume | Trạng thái |
|---|---|---|---|
| Products | ✅ `products` table | ✅ via `public_products` RPC | ✅ Connected |
| Categories | ✅ `product_categories` | ✅ via query | ✅ Connected |
| Brands | ✅ `brands` table | ✅ via `getPublicBrands()` | ✅ Connected |
| Blog posts | ✅ `blog_posts` | ✅ via `public_blog_posts` RPC | ✅ Connected |
| Showrooms | ✅ `showrooms` | ✅ via `public_showrooms` RPC | ✅ Connected |
| Promotions | ✅ `promotions` | ✅ via `public_promotions` RPC | ⚠️ Logic bugs |
| Site Settings | ✅ `site_settings` | ⚠️ **Chỉ header/FAB dùng** | ❌ Contact page không dùng |
| Content Pages | ✅ `content_pages` (key: home, about) | ❌ **Homepage không consume key `home`** | ❌ Broken |
| Trust Badges | ✅ Nên có trong settings | ❌ **Hardcode trong `showroom-constants.ts`** | ❌ Broken |
| Hero Slides text | ❌ Không có trong admin | ❌ Hardcode trong i18n JSON | ❌ No admin control |
| Product Group cards | ❌ Không có trong admin | ❌ Hardcode `productGroups` | ❌ No admin control |
| Footer tagline | ❌ Không có trong admin | ❌ Hardcode JSX | ❌ No admin control |
| Social links | ❌ Không có trong admin | ❌ Hardcode `facebook.com`, `instagram.com` | ❌ Broken |
| Blog readTime | ❌ Không có trong admin | ❌ Hardcode "5 phút đọc" | ❌ Broken |

### 5.2 Critical Gap: Homepage không đọc `content_pages` key `home`

```typescript
// app/[locale]/page.tsx — HIỆN TẠI (sai)
const home = await getTranslations("home");  // → messages/vi.json
// → Admin thay đổi content_pages key "home" KHÔNG có tác dụng gì

// Đúng ra phải làm:
const homePageContent = await getContentPage(supabase, "home", locale);
const heroTitle = homePageContent?.title || home("heroTitle");
```

`getContentPage()` đã có sẵn và hoạt động (được dùng trong `/about/page.tsx`), nhưng `/page.tsx` hoàn toàn không gọi nó.

### 5.3 Critical Gap: Contact page hardcode thông tin liên hệ

```tsx
// app/[locale]/contact/page.tsx dòng 128-132 — sai
<span><strong>Hotline</strong><br />08172 357 587</span>
<span><strong>Email</strong><br />contact@phuongdong.com</span>

// Đúng ra phải làm:
const siteSettings = await getPublicSiteSettings(supabase, locale);
// Rồi dùng siteSettings.contactPhone, siteSettings.contactEmail
```

### 5.4 Critical Gap: Product detail page hotline hardcode

```tsx
// app/[locale]/products/[slug]/page.tsx dòng 232 — sai
<p className="text-base font-bold text-white">1800 6089</p>

// Không lấy từ siteSettings — đây là số ảo không tồn tại
```

### 5.5 Gap: Hero/homepage không consume DB

Homepage text (hero eyebrow, title, lead, trust badges) đến **100% từ `messages/vi.json`** và `showroom-constants.ts`. Admin Settings trong CMS hoàn toàn không có tác động vào trang chủ — đây là sự đứt gãy nghiêm trọng nhất giữa admin và client.

---

## 6. Responsive & Mobile Audit

### 6.1 Breakpoints & Layout

| Component | Mobile (< 640px) | Tablet (640-1024px) | Desktop (>1024px) | Đánh giá |
|---|---|---|---|---|
| Header | Hamburger menu | Hamburger | Full nav + catalog bar | ✅ |
| Hero slides | Full width, stacked | Full width | Split 2-col | ✅ |
| Category grid | 1 col | 2 col | 3-4 col | ✅ |
| Product grid | 2 col | 3 col | 4-5 col | ✅ |
| Filter panel | Collapse/expand | Collapse/expand | Side by side | ✅ |
| Product detail | Stacked | Stacked | 2 col (60/40) | ✅ |
| Promotions cards | Stacked | Stacked | 2 col | ✅ |
| Contact form | Full width | Full width | 2 col | ✅ |

### 6.2 Mobile-specific Issues

- ⚠️ **Mobile mega menu**: Chỉ list tên brand và category dạng text link — không có ảnh preview (desktop có). Trải nghiệm khác nhau nhiều
- ⚠️ **FAB overlap**: FAB button góc dưới phải (48×48px) có thể overlap với pagination buttons hoặc CTA buttons trên mobile
- ⚠️ **Brand marquee**: Marquee animation có thể bị lag trên low-end Android do CSS `animation: marquee` liên tục
- ⚠️ **Promotions page**: Rất dài trên mobile — user phải scroll qua rất nhiều content trước khi thấy quote form
- ❌ **Blog category tags**: Trên mobile `flex flex-wrap` nhưng tags không clickable → lãng phí screen estate

### 6.3 Touch Targets

- ✅ Buttons ≥ 44px (button-pd min-h-11)
- ✅ Nav links min-h-11
- ⚠️ Brand marquee card hover-only effects không accessible trên touch

---

## 7. Design System Audit

### 7.1 Token Consistency

- ✅ Color tokens (`text-primary`, `text-secondary`, `bg-surface-*`) dùng nhất quán
- ✅ Typography scale (`type-page-title`, `type-section-title`, `type-card-title`, `label-pd`) nhất quán
- ✅ Spacing `container-pd`, `py-20`, `py-24` pattern nhất quán
- ✅ Border radius `var(--radius-control)` nhất quán

### 7.2 Component Inconsistencies

| Vấn đề | File | Dòng |
|---|---|---|
| Product detail sidebar dùng `border-slate-100` hardcode | `products/[slug]/page.tsx` | 98, 175, 182 |
| Product detail dùng `text-slate-800`, `text-slate-400`, `text-slate-500` | `products/[slug]/page.tsx` | nhiều dòng |
| About page brand story: text hardcode trong JSX không qua i18n | `about/page.tsx` | 67-73 |
| Promotions `bg-[#211816]` magic color không có token | `promotions/page.tsx` | 324, 570 |
| Promotions `bg-red-650` không phải Tailwind standard (650 không tồn tại) | `promotions/page.tsx` | 387, 547 |
| Contact page heading dùng ternary trong JSX thay vì i18n key | `contact/page.tsx` | 123 |

> **Product detail page vi phạm design system nhiều nhất** — dùng hardcode Tailwind Slate colors thay vì design tokens, tạo visual inconsistency với phần còn lại của site.

### 7.3 Icon Consistency

- ✅ Lucide React dùng nhất quán
- ⚠️ Footer social icons dùng `Globe2` cho Facebook (không đúng icon) và `Share2` cho Instagram và Zalo — **không nhận ra được**
- ⚠️ FAB dùng SVG inline cho Zalo và Messenger — pattern không nhất quán

---

## 8. SEO & Performance Audit

### 8.1 SEO

| Hạng mục | Đánh giá | Chi tiết |
|---|---|---|
| Page titles | ✅ Tốt | Dynamic từ i18n + DB siteSettings |
| Meta descriptions | ✅ Tốt | |
| Canonical URLs | ✅ Tốt | `/{locale}` trong layout metadata |
| hreflang | ✅ Tốt | `alternates.languages` đúng |
| Sitemap | ✅ Tốt | `/sitemap.ts` có |
| Robots | ✅ Tốt | `/robots.ts` có |
| Structured data | ❌ Thiếu | Không có JSON-LD schema cho Product, LocalBusiness, Article |
| OG image | ⚠️ | `generatePageMetadata` có `imageUrl` nhưng không set dynamic OG image |
| Product slug | ✅ Tốt | Clean slug từ DB |
| H1 structure | ✅ Tốt | Mỗi trang có 1 H1 |

### 8.2 Performance Concerns

| Vấn đề | Mức độ | Chi tiết |
|---|---|---|
| `getProducts(limit: 1000)` trong layout | 🔴 Critical | `app/[locale]/layout.tsx` dòng 64 fetch **1000 products** cho mọi page request để populate mega menu |
| `getProducts(limit: 1000)` trong contact/page | 🔴 High | Fetch 200 products cho form — limit 200 nhưng không cache |
| Remote images không có `width`/`height` | 🟡 Medium | RemoteImage component là `<img>` thông thường, không dùng Next.js `<Image>` |
| `force-dynamic` trên layout | 🟡 Medium | `export const dynamic = "force-dynamic"` → **tắt toàn bộ SSG/ISR** cho tất cả routes |
| Marquee animation CSS | 🟡 Medium | `animate-marquee-pd` liên tục — không pause khi out-of-viewport |

### 8.3 Image Handling

```tsx
// components/showroom/remote-image.tsx — vấn đề
export function RemoteImage({ src, alt, className, sizes, priority }: ...) {
  return <img src={src} alt={alt} className={className} ... />;
  // → Không dùng next/image → mất optimization LCP, lazy loading built-in
}
```

**Tất cả hình ảnh trong site dùng `<img>` thông thường** thay vì `next/image`. Với site ảnh nhiều như showroom nội thất, đây là major performance issue cho Core Web Vitals (LCP, CLS).

---

## 9. Top 10 Critical Issues

### 🔴 CRITICAL (Blocker cho production)

**#1 — `now` Date hardcode trong Promotions**
- File: [`app/[locale]/promotions/page.tsx`](file:///d:/THCode/AI/furniture-website/app/[locale]/promotions/page.tsx), dòng 129
- Vấn đề: `const now = new Date("2026-06-19T10:08:08+07:00")` — Sau ngày này, tất cả campaigns sẽ hiển thị sai status (đều là "expired" hoặc "100% elapsed")
- Fix: `const now = new Date()` — 1 dòng fix, 0 excuse

**#2 — Contact page hardcode hotline & email**
- File: [`app/[locale]/contact/page.tsx`](file:///d:/THCode/AI/furniture-website/app/[locale]/contact/page.tsx), dòng 128-132
- Vấn đề: `08172 357 587` và `contact@phuongdong.com` cứng trong JSX — khác domain với `siteSettings` defaults (`.vn`)
- Fix: Gọi `getPublicSiteSettings()` trong trang contact và dùng `siteSettings.contactPhone`, `siteSettings.contactEmail`

**#3 — Product detail hotline hardcode sai số**
- File: [`app/[locale]/products/[slug]/page.tsx`](file:///d:/THCode/AI/furniture-website/app/[locale]/products/[slug]/page.tsx), dòng 232
- Vấn đề: `1800 6089` — số điện thoại ảo, không có trong siteSettings
- Fix: Gọi `getPublicSiteSettings()` và dùng `siteSettings.contactPhone`

**#4 — Homepage không consume Admin `content_pages`**
- File: [`app/[locale]/page.tsx`](file:///d:/THCode/AI/furniture-website/app/[locale]/page.tsx)
- Vấn đề: Admin có thể edit homepage content trong CMS nhưng không có tác dụng gì — client đọc i18n JSON hoàn toàn
- Fix: Gọi `getContentPage(supabase, "home", locale)` và merge với i18n fallbacks

**#5 — Performance: fetch 1000 products trên mọi page request**
- File: [`app/[locale]/layout.tsx`](file:///d:/THCode/AI/furniture-website/app/[locale]/layout.tsx), dòng 64
- Vấn đề: `getProducts(supabase, { locale, limit: 1000 })` chạy với mọi page navigate — mega menu không cần full product list, chỉ cần products theo category/brand
- Fix: Limit xuống 50-100 hoặc dùng separate API endpoint với cache

### 🟠 HIGH (Nghiêm trọng, ảnh hưởng UX/Business)

**#6 — Blog categories không filterable**
- File: [`app/[locale]/blog/page.tsx`](file:///d:/THCode/AI/furniture-website/app/[locale]/blog/page.tsx), dòng 107-118
- Vấn đề: Category tags render như clickable chips nhưng không làm gì — visual lie
- Fix: Thêm query param `?category=slug` và filter posts server-side

**#7 — Taxonomy filters (room/style/collection/tone) out of sync với DB data**
- File: [`app/[locale]/products/page.tsx`](file:///d:/THCode/AI/furniture-website/app/[locale]/products/page.tsx), dòng 213-221
- Vấn đề: Filter options tồn tại nhưng DB products không có `roomKey`, `styleKey`, etc. được populate → lọc luôn ra 0 kết quả
- Fix: Hoặc populate data attributes trên products, hoặc ẩn filters này cho đến khi có data

**#8 — Social links footer hardcode domain ảo**
- File: [`components/showroom/public-shell.tsx`](file:///d:/THCode/AI/furniture-website/components/showroom/public-shell.tsx), dòng 743-751
- Vấn đề: `https://facebook.com`, `https://instagram.com`, `https://zalo.me` là domain ảo không phải page thật
- Fix: Thêm social links vào `site_settings` DB và consume vào footer

**#9 — `RemoteImage` không dùng `next/image`**
- File: [`components/showroom/remote-image.tsx`](file:///d:/THCode/AI/furniture-website/components/showroom/remote-image.tsx)
- Vấn đề: `<img>` thông thường → mất optimization LCP, lazy loading built-in, format WebP
- Fix: Chuyển sang `next/image` với `domains`/`remotePatterns` config cho Google CDN URLs

**#10 — Promotions coupon code không có use-case**
- File: [`app/[locale]/promotions/page.tsx`](file:///d:/THCode/AI/furniture-website/app/[locale]/promotions/page.tsx), dòng 483-487
- Vấn đề: User copy coupon code nhưng không có ô nào trên site để nhập code — không có cart, không có checkout
- Fix: Hoặc (a) bỏ coupon code widget và thay bằng CTA quote form, hoặc (b) giải thích rõ "Đọc code cho nhân viên khi liên hệ"

---

## 10. Roadmap Fix ưu tiên

### Sprint 1 — Emergency Fixes (1-2 ngày) 🔴

| # | Task | File | Effort |
|---|---|---|---|
| 1 | Fix `now` hardcode → `new Date()` | `promotions/page.tsx:129` | 5 phút |
| 2 | Contact page: gọi `getPublicSiteSettings()`, bỏ hardcode hotline/email | `contact/page.tsx` | 30 phút |
| 3 | Product detail: gọi `getPublicSiteSettings()`, bỏ hardcode "1800 6089" | `products/[slug]/page.tsx:232` | 30 phút |
| 4 | Homepage: gọi `getContentPage(supabase, "home", locale)` merge với i18n | `page.tsx` | 2 giờ |

### Sprint 2 — Data Integrity Fixes (3-5 ngày) 🟠

| # | Task | File | Effort |
|---|---|---|---|
| 5 | Footer social links: thêm vào `site_settings` DB, consume trong public-shell | `public-shell.tsx` | 4 giờ |
| 6 | Blog categories: thêm `?category=` filter server-side | `blog/page.tsx` | 4 giờ |
| 7 | Blog detail: thêm CTA "Xem sản phẩm liên quan" / "Báo giá ngay" cuối bài | `blog/[slug]/page.tsx` | 2 giờ |
| 8 | `trustBadges`: move từ constants → `site_settings` hoặc `content_pages` | DB + constants.ts | 3 giờ |
| 9 | Promotions page `p.code` hardcheck → dùng `p.tag` hoặc `p.metadata_jsonb` | `promotions/page.tsx` | 3 giờ |
| 10 | Reduce layout `getProducts` limit từ 1000 → 100 hoặc lazy load per-brand | `layout.tsx` | 3 giờ |

### Sprint 3 — UX Enhancements (1-2 tuần) 🟡

| # | Task | Effort |
|---|---|---|
| 11 | Thêm price range filter vào products page | 1 ngày |
| 12 | Wishlist/saved items (localStorage hoặc Supabase session) | 2 ngày |
| 13 | Chuyển `RemoteImage` → `next/image` với remotePatterns config | 0.5 ngày |
| 14 | JSON-LD structured data: Product, LocalBusiness, Article schemas | 1 ngày |
| 15 | Mobile menu: thêm thumbnail/preview như desktop | 1 ngày |
| 16 | Promotions: rút gọn campaign card, giải thích coupon workflow rõ | 1 ngày |
| 17 | Product taxonomy filters: populate data hoặc ẩn filters trống | 0.5 ngày |
| 18 | Social share icons footer đúng (Facebook icon → Globe2 không đúng) | 1 giờ |

### Sprint 4 — Advanced (2-4 tuần) 🟢

| # | Task |
|---|---|
| 19 | Product comparison (max 3 sản phẩm) |
| 20 | Blog full-text search |
| 21 | Promotions: countdown timer real-time |
| 22 | ISR/cache strategy cho product pages |
| 23 | Header search bar |
| 24 | Team members section (About) |

---

## 11. Final Verdict

### Scoring Breakdown

| Trục | Điểm | Max | Lý do |
|---|---|---|---|
| UI / Visual Quality | 16 | 20 | Đẹp, consistent về phần lớn. Lỗi: product detail slate colors, promotions magic colors |
| UX / User Flow | 12 | 20 | Flow cơ bản ổn. Thiếu wishlist, so sánh, blog filter, filter taxonomy broken |
| Business Completeness | 12 | 20 | Core flow có nhưng promotions broken (date hardcode), coupon vô nghĩa, nhiều features thiếu |
| Data Mapping Admin ↔ Client | 8 | 20 | Multiple critical disconnects: homepage, contact, product detail |
| Performance / SEO | 9 | 20 | `force-dynamic`, `limit:1000` per request, RemoteImage không optimize |

**Tổng: 57 / 100**

> Sau khi tính thêm effort kỹ thuật đã bỏ vào (codebase rõ ràng, RPC đúng chỗ, quote form hoàn chỉnh): **điều chỉnh lên 65/100**.

### Production Readiness Assessment

```
❌ KHÔNG sẵn sàng production hiện tại

Lý do blockers:
  1. now = hardcode date → promotions page sẽ hiển thị sai status
  2. Hotline/email sai trên contact page → mất lead thực tế
  3. Hotline ảo "1800 6089" trên product detail → mất trust
  4. 1000 products fetch per page request → performance degradation under load
  5. Homepage admin edits có 0 tác động → admin bỏ công vô ích

Ước tính sprint 1 (emergency fixes) có thể đẩy lên: 75/100
Ước tính sau sprint 2: 82/100 — production-ready cơ bản
```

### So sánh Admin vs Client

| Tiêu chí | Admin | Client | Nhận xét |
|---|---|---|---|
| Production-ready | 60/100 | 65/100 | Cả hai chưa sẵn sàng |
| Data integrity | 70/100 | 60/100 | Client có nhiều gaps hơn |
| UI quality | 55/100 | 75/100 | Client đẹp hơn đáng kể |
| Critical bugs | 4 blockers | 5 blockers | Tương đương |

### Câu kết

> Client site có **bộ khung tốt** — kỹ thuật đúng hướng, design token nhất quán, data layer hoạt động cho phần lớn features. Nhưng còn **5 blockers nghiêm trọng** mà nếu phát live ngay hôm nay sẽ làm mất trust với khách hàng thật: hotline sai, date cứng trong promotions, admin edits không phản ánh ra ngoài, và hiệu suất chưa tối ưu dưới load thật. Sprint 1 (4 fixes, khoảng 3-4 giờ công dev) sẽ giải quyết được phần lớn blockers này và đưa site lên ngưỡng có thể soft-launch được.

---

*Báo cáo được tạo ngày 2026-06-19 bởi Principal Product Designer + Senior UX Auditor (AI-assisted)*  
*Xem thêm: [admin_audit_report.md](file:///C:/Users/DELL/.gemini/antigravity/brain/7e03c2c5-5cd9-4683-8255-77f09e27b9ca/admin_audit_report.md)*
