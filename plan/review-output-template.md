# Template: REVIEW Mode Proposal

The orchestrator agent must structure its response exactly as shown below when ending its Mode 1 (REVIEW) scan. 

The response must be written in **Vietnamese**. Replace all `<...>` with the corresponding details. Do not execute any code changes yet.

---

### Tình trạng hiện tại
- **Phase hiện tại**: `<Tên phase và số hiệu phase>`
- **Checklist hoàn thành**: `<X>` / `<Y>` nhiệm vụ (`<Tỉ lệ phần trăm>`%)
- **Trạng thái**: `<in-progress / blocked / not-started>`
- **Blockers đang hoạt động**:
  - `<Mô tả blocker 1 từ blockers.md hoặc "Không có" nếu không có>`

---

### Phase đề xuất tiếp theo
- **Mục tiêu đề xuất**: `<Tên phase tiếp theo hoặc phase hiện tại cần tiếp tục>`
- **Lý do lựa chọn**: `<Lý do đề xuất (ví dụ: phase hiện tại đã hoàn thành hoặc cần hoàn thành nốt các task còn lại)>`
- **Mối quan hệ phụ thuộc**: `<Các điều kiện phụ thuộc (dependencies) đã được đáp ứng>`

---

### Việc sẽ triển khai
Các nhiệm vụ cụ thể sẽ thực hiện trong phiên làm việc này (trích xuất trực tiếp từ file checklist của phase tương ứng):
1. `<Task 1: Mô tả chi tiết>`
   - **Mục tiêu**: `<Mục tiêu của Task 1>`
   - **File ảnh hưởng**: `<Liệt kê đường dẫn file dự kiến tạo mới/chỉnh sửa/xóa>`
2. `<Task 2: Mô tả chi tiết>`
   - **Mục tiêu**: `<Mục tiêu của Task 2>`
   - **File ảnh hưởng**: `<Liệt kê đường dẫn file dự kiến tạo mới/chỉnh sửa/xóa>`

---

### Kiểm tra / test dự kiến
Các lệnh kiểm tra và phương pháp xác thực sẽ chạy sau khi triển khai để chứng minh tính đúng đắn:
1. **Lệnh kiểm tra hệ thống**:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```
2. **Kiểm tra nghiệp vụ cụ thể**:
   - `<Ví dụ: Gọi thử endpoint /api/health bằng curl hoặc test RLS policies>`

---

### Lựa chọn
*Vui lòng phản hồi bằng một trong hai lựa chọn dưới đây:*
- `confirm` — để bắt đầu triển khai
- `kết thúc` — để dừng tại bước review
