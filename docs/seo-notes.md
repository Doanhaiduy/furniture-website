# SEO Technical Notes — ISR & Render Mode

## Tại sao force-dynamic còn ở layout?

`app/[locale]/layout.tsx` buộc phải giữ `export const dynamic = "force-dynamic"` vì:

1. `PublicShell` là client component, nội bộ gọi `useSearchParams()` (để quản lý
   trạng thái catalog/filter bar).
2. Khi bỏ `force-dynamic`, Next.js cố static-prerender các trang public trong lúc
   build. Lúc đó `useSearchParams()` phải nằm trong `<Suspense>` — hiện chưa có.
3. Kết quả: build fail với lỗi
   `useSearchParams() should be wrapped in a suspense boundary at page "/[locale]/showrooms"`.

## Path nâng cấp sang ISR (khi cần TTFB tốt hơn)

Để kích hoạt ISR (revalidate=300 đã đánh dấu trên home, product detail, blog detail,
about, showrooms):

**Bước 1**: Tìm tất cả client component gọi `useSearchParams()` trong `PublicShell`
(và các sub-component). Bọc mỗi chỗ vào `<Suspense fallback={...}>`.

**Bước 2**: Xóa `export const dynamic = "force-dynamic"` khỏi `[locale]/layout.tsx`.

**Bước 3**: Giữ `export const revalidate = 300` trên các trang ISR (đã có từ v2.x).

**Bước 4**: `pnpm build` — xác nhận các trang ISR xuất hiện với ký hiệu `◐` thay vì `ƒ`.

**Bước 5**: Với admin mutations thêm `revalidatePath`/`revalidateTag` để flush cache
ngay khi CMS thay đổi content.

## Tại sao không ISR ngay?

- Local Supabase không chạy khi build → nếu ISR cần static prerender, các trang DB
  sẽ fail lúc build (không có `.catch` fallback ở mọi component).
- `force-dynamic` bỏ qua static prerender → build pass với mock fallback.
- Thêm Suspense boundaries là thay đổi xâm lấn, cần test kỹ UX.

## Canonical & OG — lưu ý môi trường

| Môi trường | NEXT_PUBLIC_SITE_URL | Canonical mong đợi |
|-----------|---------------------|-------------------|
| Dev local | `http://localhost:3000` | `http://localhost:3000/...` |
| Production Docker | `https://noithatphuongdong.vn` | `https://noithatphuongdong.vn/...` |

**Xác nhận production sau deploy:**
```bash
curl -s https://noithatphuongdong.vn/vi/products | grep canonical
curl -s https://noithatphuongdong.vn/robots.txt
```

## Structured Data inventory

| Trang | JSON-LD schemas |
|-------|----------------|
| Mọi public page | Organization + WebSite (từ `[locale]/layout.tsx`) |
| `/[locale]/products/[slug]` | Product + BreadcrumbList |
| `/[locale]/blog/[slug]` | BlogPosting + BreadcrumbList |
| `/[locale]/showrooms` | BreadcrumbList + FurnitureStore×N |
