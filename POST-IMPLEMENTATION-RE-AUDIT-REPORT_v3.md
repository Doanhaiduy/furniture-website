
Bạn là Principal Full-stack Auditor + Staff QA Architect + Skeptical Product Reviewer.

Tài liệu baseline/scope:

- `POST-IMPLEMENTATION-RE-AUDIT-REPORT_v2.md`

Bối cảnh:

- AI/dev đã tiếp tục triển khai fix theo file trên.
- Nhưng tôi KHÔNG tin các trạng thái DONE mà AI tự báo.
- Tôi muốn bạn audit lại toàn diện codebase hiện tại để xác minh THỰC TẾ:
  1. Đã làm được gì thật
  2. Chưa làm xong gì
  3. Chỗ nào báo DONE nhưng thực ra chưa usable
  4. Chỗ nào mới chỉ có code/file nhưng chưa wiring
  5. Chỗ nào business/UI vẫn chưa rõ, chưa đẹp, chưa đúng
  6. Chỗ nào còn hard-code/mock/fallback trá hình
  7. Chỗ nào FE/BE/DB vẫn lệch nhau

Đây là:
**POST-FIX VERIFICATION AUDIT / SKEPTICAL REALITY CHECK V2**

==================================================

## MỤC TIÊU AUDIT

==================================================

Bạn phải kiểm tra codebase hiện tại và trả lời thật rõ:

- Mỗi mục trong `POST-IMPLEMENTATION-RE-AUDIT-REPORT_v2.md` đã được đáp ứng chưa
- Nếu chưa, thiếu ở đâu: DB, API, business logic, wiring, UI, modal, upload, filter, i18n, layout, state handling?
- Feature có usable thật không hay chỉ “trông như có”
- Phần nào vẫn báo DONE sai sự thật
- Phần nào cần trả về trạng thái PARTIAL hoặc NOT DONE
- Phần nào mới phát sinh regression sau đợt fix

==================================================

## NGUYÊN TẮC KIỂM TRA BẮT BUỘC

==================================================

1. Không được tin vào commit message, file name, route name, hoặc lời mô tả của AI/dev.
2. Không được coi feature là done chỉ vì:
   - có file
   - có page
   - có API route
   - có migration
   - có component
3. Chỉ coi là done khi truy vết được full flow:
   DB/schema -> query/API -> UI state -> render/interaction -> update lại dữ liệu
4. Chỗ nào chưa verify được đến cuối flow phải đánh dấu:
   - NOT VERIFIED
   - PARTIAL
   - FALSE COMPLETION
5. Nếu UI lấy data từ DB nhưng hiển thị xấu, lộn xộn, khó dùng, không đúng business thì KHÔNG được gọi là DONE.
6. Nếu upload có UI nhưng không persistence đúng hoặc không gắn vào entity đúng thì KHÔNG được gọi là DONE.
7. Nếu filter có vẻ hoạt động nhưng vẫn refresh page, mất state, thiếu clear, hoặc query state không ổn định thì KHÔNG được gọi là DONE.
8. Nếu mega menu lấy được data từ DB nhưng sắp xếp/xuất hiện xấu, vô tổ chức, khó dùng thì phải đánh dấu PARTIAL hoặc BUSINESS/UI NOT ACCEPTABLE.
9. Nếu modal create/edit không theo đúng full-screen pattern đã yêu cầu thì phải đánh dấu NOT DONE/PARTIAL.
10. Audit phải thẳng tay, ưu tiên bắt lỗi false completion.

==================================================

## PHẠM VI AUDIT

==================================================

Audit toàn bộ các lớp sau:

- DB schema / migrations
- queries / mutations / API routes / server actions
- admin pages
- public pages
- modals / forms / filters / upload
- header / mega menu / sticky/fixed UI
- bilingual fields
- hard-code / static fallback / fake options
- business flows
- layout loading / skeleton boundaries

==================================================

## CÁC NHÓM VIỆC PHẢI VERIFY THEO FILE V2

==================================================

### A. FILTER / SEARCH / CLEAR / NO REFRESH

Phải kiểm tra toàn dự án:

- các nút “Áp dụng bộ lọc” đã bị bỏ chưa
- filter đã thành realtime chưa
- còn refresh page không
- có giữ state không
- có nút Clear chưa
- nút Clear có reset đúng mà không F5 không
- URL/query state có ổn định không

Đặc biệt kiểm tra:

- `/vi/products`
- các admin list pages
- categories list
- brands list
- promotions list
- blog list
- products list
- quotes list
- users/accounts list

### B. ADMIN CREATE/EDIT FULL-SCREEN MODAL

Phải kiểm tra create/edit của:

- products
- categories
- brands
- promotions
- blog
- showrooms
- accounts/users nếu có

Xác minh:

- có thực sự là full-screen modal overlay không
- có đúng pattern cũ không
- có header/body/actions hợp lý không
- có close/back logic đúng không
- hay chỉ đổi route nhưng vẫn là page giả modal

### C. TOÀN BỘ SELECT / OPTION / MAPPING HARD-CODE

Audit toàn project client + admin:

- showroom mapping
- select options
- filter options
- search options
- brand options
- promotion options
- contact options
- mega menu text/items
- partner brands

Với mỗi nơi:

- dữ liệu lấy từ đâu
- còn hard-code không
- có stale/static fallback trá hình không
- có map đúng DB không

### D. CREATE PAGES BUTTONS

Kiểm tra các page create:

- đã bỏ nút lưu trữ chưa
- chỉ còn 2 nút “Tạo” và “Lưu bản nháp” chưa
- có page nào vẫn còn logic/action thừa không

### E. CATEGORIES BUSINESS PARENT/CHILD

Audit kỹ module categories:

- “Nhóm cha” được define rõ chưa
- business cha/con có rõ không
- create category cha và con có nằm cùng module categories chưa
- bố cục UI có dễ quản lý không
- list/categories page có phản ánh tree/parent-child hợp lý không
- có còn phần “Trạng thái xuất bản” dư thừa không
- categories list có search/filter realtime rõ ràng chưa

### F. BRANDS ADMIN

Audit kỹ `/admin/brands`:

- UI có còn lệch style so với admin/products không
- create/edit có full-screen modal không
- có song ngữ đủ chưa
- có upload ảnh/logo thật chưa
- ảnh upload có được persist/gắn đúng entity không
- list/search/filter có usable không
- có hard-code option nào không

### G. PROMOTIONS ADMIN + BUSINESS

Audit kỹ `/admin/promotions`:

- business có đúng như yêu cầu mới không:
  - promotion là đợt giảm giá nhỏ cho sản phẩm
  - có search sản phẩm
  - có chọn từng sản phẩm để apply
  - product create/edit có thấy được promotion
  - đồng bộ hai chiều product <-> promotion
- create/edit promotion có full-screen modal không
- có upload ảnh thật chưa
- có persist đúng DB không
- có song ngữ đủ chưa
- UI có bám admin/products không
- business có rõ ràng, dễ dùng không hay vẫn mơ hồ

### H. BLOG EDITOR

Audit `/admin/blog?create=1`:

- phần nội dung chi tiết đã là editor đầy đủ chưa
- có usable thật cho nhân viên văn phòng không
- có upload/chèn ảnh trong bài chưa
- có lưu dữ liệu đúng format để public render không
- có phải chỉ là textarea nâng cấp giả không

### I. QUOTES WORKFLOW

Audit `/admin/quotes`:

- trạng thái quote có rõ ràng không
- admin có action thật theo từng trạng thái không
- có timeline/history/status log không
- có DB support không
- có button/action usable hay chỉ hiển thị label

### J. SETTINGS / ADMIN CLEANUP

Kiểm tra:

- “Mức độ sẵn sàng xuất bản” đã Việt hóa hết chưa
- `ai-assistant` đã bị bỏ khỏi admin hoàn toàn chưa
- “Kiểm tra phân quyền” gần logout đã bỏ chưa
- skeleton loading ở admin đã chỉ còn phần content giữa chưa

### K. PUBLIC CLIENT

Audit kỹ:

1. Partner brands:

   - còn hard-code không
   - lấy từ DB chưa
   - UI có đẹp/chấp nhận được không
2. Header mega menu:

   - lấy từ DB thật chưa
   - nhóm theo product/category/brand hợp lý chưa
   - thứ tự sắp xếp ra sao
   - UI có khó coi không
   - có bị quá dài, lệch cột, lộn xộn không
3. `/vi/products`

   - chỉ còn search, danh mục, chất liệu, giảm giá, brand chưa
   - filter realtime chưa
   - clear button có chưa
   - bỏ nút filter chưa
4. `/vi/promotions`

   - đã map đúng data từ business promotions admin chưa
   - tone màu có đồng bộ dự án chưa
   - UI có chấp nhận được chưa
   - upload ảnh promotion đã hiển thị đúng chưa
5. `/vi/blog/[slug]`

   - Mục lục và Bài viết liên quan đã sticky chưa
6. Hero arrows + fixed contact tooltip

   - arrow có cursor pointer chưa
   - tooltip contact có lấy data từ admin settings chưa
   - alignment đã thẳng chưa
   - UI mở ra có còn lệch không
7. `/vi/contact`

   - các select có lấy từ DB chưa
   - có còn hard-code không

### L. ACCOUNT MANAGEMENT

Kiểm tra:

- admin đã có phần quản lý account thật chưa
- list/create/edit role/status có usable không
- có API thật không
- có hard-code không

==================================================

## CÁCH KIỂM TRA BẮT BUỘC

==================================================

Khi audit mỗi mục, phải cố gắng kiểm tra theo mẫu sau:

### 1. DB / Schema

- bảng/cột/join relation cần thiết có tồn tại không
- migration có thật không
- schema có support business không

### 2. API / Query / Mutation

- route/query/mutation có tồn tại không
- request/response có hợp lý không
- có gọi DB thật không
- có validate/auth không

### 3. UI Wiring

- UI có gọi đúng API/query không
- state handling có đúng không
- submit/filter/select/upload có nối thật không
- có reload sai không
- có clear/reset đúng không

### 4. UX / Business Acceptance

- có đúng business yêu cầu không
- có usable không
- có rõ ràng không
- có đẹp/đồng bộ enough không
- nếu xấu/lệch/khó dùng thì không được coi là DONE

==================================================

## OUTPUT BẮT BUỘC

==================================================

Xuất ra báo cáo tên:
`POST-IMPLEMENTATION-VERIFICATION-AUDIT-v3.md`

Báo cáo bắt buộc có cấu trúc sau:

# 1. Executive summary

- Đánh giá thật thẳng:
  - mức độ hoàn thành thực tế %
  - mức độ tin cậy
  - số lượng false completion
  - top blocker còn lại

# 2. Baseline vs actual verification

Bảng:

| ID | Hạng mục trong file v2 | Expected | Actual | Verdict | Evidence |
| -- | ------------------------ | -------- | ------ | ------- | -------- |

Verdict chỉ được dùng:

- VERIFIED_DONE
- PARTIAL
- NOT_DONE
- FALSE_COMPLETION
- NOT_VERIFIED
- BUSINESS_NOT_ACCEPTABLE
- UI_NOT_ACCEPTABLE

# 3. Screen-by-screen audit

Quét lại từng màn hình public/admin và đánh giá:

- route
- current state
- data source
- missing pieces
- verdict

# 4. Hard-code / stale fallback scan

Liệt kê tất cả chỗ:

- hard-code
- static option
- fake fallback
- stale constant
- hidden mock
- upload fake
- placeholder data

# 5. Filter / modal / upload verification

Section riêng, vì đây là nhóm hay bị AI báo done sai:

- realtime filter
- clear button
- no refresh
- full-screen modal
- brands upload
- promotions upload
- blog image upload
- contact option source
- mega menu source + layout quality

# 6. Business acceptance audit

Đánh giá xem các module sau có THỰC SỰ usable theo business chưa:

- categories
- brands
- promotions
- blog editor
- quotes
- settings
- account management

# 7. Regression & newly introduced issues

Chỉ ra bug mới phát sinh sau đợt fix

# 8. Final actionable gap list

Chỉ giữ các việc còn thiếu THỰC SỰ

- Critical
- High
- Medium
- Low

# 9. Final verdict

Trả lời thẳng:

1. Có bao nhiêu mục AI báo done nhưng thực ra chưa done?
2. Những mục nào là “done giả” nặng nhất?
3. Hệ thống đã đáng tin hơn chưa?
4. Nếu phải fix tiếp, 10 việc ưu tiên nhất là gì?

==================================================

## YÊU CẦU GIỌNG ĐIỆU

==================================================

- Skeptical
- Không nể nang
- Không optimistic giả
- Không gọi done nếu UI/business chưa chấp nhận được
- Ưu tiên bắt false completion
- Ghi rõ evidence cụ thể

Bắt đầu audit toàn diện ngay bây giờ.

Nếu một tính năng technically đã nối DB nhưng UI xấu, business mơ hồ, upload chưa usable, layout khó quản lý, hoặc flow thiếu bước quan trọng cho admin/user, thì không được đánh dấu VERIFIED_DONE.
