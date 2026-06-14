# Quote Form Enhancement Demo

## Khi mở từ trang sản phẩm (Product Detail Page)

### Trước khi cải tiến:
- ❌ Dropdown "Sản phẩm quan tâm" hiển thị trống
- ❌ Người dùng phải tự chọn lại sản phẩm
- ❌ Không có thông tin về sản phẩm đã chọn

### Sau khi cải tiến:
- ✅ Hiển thị banner thông tin sản phẩm đã chọn ở đầu form
- ✅ Dropdown "Sản phẩm quan tâm" tự động chọn sẵn sản phẩm hiện tại
- ✅ Service type tự động chọn đúng loại (Đồ gỗ, Thiết bị vệ sinh, v.v.)
- ✅ Category ID tự động điền vào form
- ✅ Người dùng vẫn có thể thay đổi sản phẩm nếu muốn

---

## Layout Form mới

```
┌─────────────────────────────────────────────────────────────┐
│  📋 Thông tin yêu cầu báo giá                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ ✓  Sản phẩm đã chọn                                │     │
│  │    Sofa Curve Velour                               │     │
│  │    Danh mục: Sofa                                  │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ Họ và tên *         │  │ Số điện thoại *     │          │
│  │ [____________]      │  │ [____________]      │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                              │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ Email (tùy chọn)    │  │ Công ty (tùy chọn)  │          │
│  │ [____________]      │  │ [____________]      │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                              │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ Loại dịch vụ        │  │ Sản phẩm quan tâm   │          │
│  │ [Đồ gỗ nội thất ▼]  │  │ [Sofa Curve... ▼]   │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                              │
│  ┌─────────────────────────────────────────────────┐        │
│  │ Nội dung yêu cầu *                              │        │
│  │ [                                               ]        │
│  │ [                                               ]        │
│  │ [                                               ]        │
│  └─────────────────────────────────────────────────┘        │
│                                                              │
│  ┌──────────────────────┐                                   │
│  │  → Gửi yêu cầu       │  ⏱ Phản hồi trong 24h            │
│  └──────────────────────┘                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Luồng hoạt động

### 1. Người dùng ở trang sản phẩm "Sofa Curve Velour"
- Nhấn nút **"Nhận báo giá ngay"**
- Modal/Dialog hiển thị form

### 2. Form tự động điền:
- **Banner thông tin**: "Sản phẩm đã chọn: Sofa Curve Velour | Danh mục: Sofa"
- **Dropdown sản phẩm**: Tự động chọn "Sofa Curve Velour"
- **Loại dịch vụ**: Tự động chọn "Đồ gỗ nội thất" (vì categoryKey = "wood")
- **categoryId** (hidden field): Tự động điền "wood"

### 3. Người dùng có thể:
- Giữ nguyên sản phẩm đã chọn
- Hoặc thay đổi sang sản phẩm khác trong dropdown
- Khi thay đổi sản phẩm → Service và categoryId tự động cập nhật theo

### 4. Khi submit:
- Database lưu cả `product_id` và `category_id`
- Admin có thể thống kê theo danh mục sản phẩm

---

## Mock Data Structure

```javascript
// Mock product example
{
  slug: "sofa-curve-velour",
  name: { 
    vi: "Sofa Curve Velour", 
    en: "Sofa Curve Velour" 
  },
  category: { 
    vi: "Sofa", 
    en: "Sofa" 
  },
  categoryKey: "wood",  // ← Dùng làm categoryId trong mock
  // ... other fields
}
```

---

## Code Changes Summary

### 1. `QuoteForm` component
- Added `categoryId` prop
- Calculate `initialProduct`, `initialService`, `initialCategoryId` from `productId`
- Display product info banner when `productId` is present
- Auto-update service and categoryId when product selection changes

### 2. `ProductActionGroup` component
- Extract `categoryId` from product object
- Pass both `productId` and `categoryId` to QuoteForm

### 3. Product detail page
- Pass `categoryId` to both modal and inline QuoteForm instances

---

## Testing Checklist

- [ ] Open product page: `/vi/products/sofa-curve-velour`
- [ ] Click "Nhận báo giá ngay" button
- [ ] Verify modal shows banner: "Sản phẩm đã chọn: Sofa Curve Velour"
- [ ] Verify dropdown shows selected product
- [ ] Verify service type is "Đồ gỗ nội thất"
- [ ] Change product to "Sen Tắm Mạ Vàng 24K"
- [ ] Verify service auto-changes to "Thiết bị vệ sinh"
- [ ] Fill form and submit
- [ ] Check database for correct `product_id` and `category_id`
