
# 📦 BỘ TÀI LIỆU BÀN GIAO WEBSITE

### Website Nội thất & Thiết bị vệ sinh — Phương Đông

Chào mừng bạn! Đây là bộ tài liệu bàn giao đầy đủ giúp bạn **vận hành website** và **chuẩn bị hạ tầng + dữ liệu** để đưa website lên mạng.

> ⭐ **Bộ tài liệu chính thức gồm 3 quyển PDF** (có bìa, mục lục, ảnh chụp màn hình thật và ví dụ nhập liệu). Bắt đầu từ **Quyển 1**.

---

## 🗂️ Nội dung bộ tài liệu

| # | Tài liệu                                                                              | Dành cho việc                                                                                                                                              | Đọc khi nào         |
| :-: | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| 📕 | **[1-HUONG-DAN-SU-DUNG-WEBSITE.pdf](1-HUONG-DAN-SU-DUNG-WEBSITE.pdf)**             | **Quyển 1** — hướng dẫn dùng trang Quản trị (sản phẩm, danh mục, thương hiệu, khuyến mãi, bài viết, showroom, báo giá, cài đặt) | Vận hành hằng ngày |
| 🌐 | **[2-HUONG-DAN-THUE-TEN-MIEN-VA-VPS.pdf](2-HUONG-DAN-THUE-TEN-MIEN-VA-VPS.pdf)**   | **Quyển 2** — thuê tên miền (Nhân Hòa) & VPS (Cloud-Cheap)                                                                                      | Trước khi lên sóng |
| 📝 | **[3-HUONG-DAN-DIEN-DU-LIEU-KHOI-TAO.pdf](3-HUONG-DAN-DIEN-DU-LIEU-KHOI-TAO.pdf)** | **Quyển 3** — điền bộ file Excel dữ liệu ban đầu                                                                                              | Trước khi lên sóng |
| 📊 | **[file-dien-du-lieu/](file-dien-du-lieu/)**                                       | 5 file Excel để bạn điền dữ liệu (danh mục, thương hiệu, showroom, sản phẩm, thông tin cửa hàng)                                             | Điền cùng Quyển 3  |

> 💡 **Ghi chú kỹ thuật — tạo lại / nạp bộ tài liệu (dành cho đội kỹ thuật):**
>
> - **Tạo lại 5 file Excel mẫu:** `npx tsx scripts/generate-handover-templates.ts`
> - **Render 3 PDF** từ `tai-lieu-*.html` + `_doc-style.css` + `screenshots/`: `npx tsx scripts/build-handbook-pdf.mjs` (chạy `npm install` + `npx playwright install chromium` một lần trước đó). Ảnh chụp màn hình admin đã có sẵn trong `screenshots/`.
> - **Nạp dữ liệu khách đã điền vào DB:** kiểm tra trước bằng `npx tsx scripts/import-initial-data.ts --dry-run --data ban-giao-khach-hang/file-dien-du-lieu --images <thư-mục-ảnh>`, rồi bỏ `--dry-run` để nạp thật (xem hướng dẫn đầy đủ ở đầu file script).

---

## 🚀 Nên bắt đầu từ đâu?

### Giai đoạn 1 — Đưa website lên mạng (làm 1 lần)

1. **Thuê tên miền + VPS** → làm theo **Quyển 2**.
2. **Điền dữ liệu cửa hàng** vào các file Excel → làm theo **Quyển 3**.
3. **Gửi thông tin VPS + file Excel + ảnh** cho bên kỹ thuật.
4. Chúng tôi cài đặt, kết nối tên miền, nạp dữ liệu, bật bảo mật HTTPS và bàn giao **tài khoản Quản trị**.

### Giai đoạn 2 — Tự vận hành (hằng ngày)

- Đăng nhập `https://tên-miền-của-bạn.vn/admin` và quản lý nội dung theo **Quyển 1**.

---

## 📌 Ghi nhớ nhanh

- **Trang khách:** `https://tên-miền-của-bạn.vn`
- **Trang quản trị:** `https://tên-miền-của-bạn.vn/admin`
- **Website song ngữ:** Tiếng Việt 🇻🇳 / Tiếng Anh 🇬🇧
- **Cấu hình VPS tối thiểu:** 4GB RAM · 2 CPU · 40GB SSD · Ubuntu
- **Bảo mật:** giữ kín tài khoản, đổi mật khẩu sau khi nhận bàn giao, gia hạn tên miền/VPS đúng hạn.

---

## ❓ Cần hỗ trợ?

- Vướng ở **thuê domain/VPS** → xem phần Câu hỏi thường gặp trong Quyển 2, hoặc gửi ảnh chụp màn hình cho đội kỹ thuật.
- Vướng ở **điền Excel** → xem sheet "📋 Hướng dẫn" trong mỗi file, hoặc Quyển 3.
- Vướng ở **dùng Admin** → xem Quyển 1, phần "Câu hỏi thường gặp".
- Vấn đề kỹ thuật, đổi giao diện, thêm tính năng → liên hệ đội ngũ phát triển.

> 📞 Thông tin liên hệ hỗ trợ kỹ thuật: *(điền theo biên bản bàn giao)*
