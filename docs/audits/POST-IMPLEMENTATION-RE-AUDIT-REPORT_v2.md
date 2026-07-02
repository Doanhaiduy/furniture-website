Bạn là Principal Full-stack Engineer + Staff Product Designer + Senior QA Fix Owner.

Dự án: Website Showroom Nội Thất Phương Đông
Ngữ cảnh:
- Hệ thống đã được AI triển khai phần lớn.
- Tuy nhiên hiện vẫn còn nhiều bug, nhiều phần business chưa rõ, một số UI/admin page chưa đồng bộ, và còn hiện tượng hard-code dữ liệu thay vì lấy từ DB.
- Tôi muốn bạn tiếp tục FIX THẬT toàn bộ các vấn đề dưới đây.
- Không dừng ở mức audit hay đề xuất.
- Hãy sửa code trực tiếp, refactor nếu cần, thêm migration/API/query/mutation nếu cần, đảm bảo feature chạy được thực tế.
- Cần đảm bảo đồng bộ từ Database, API, business logic, FE admin/public, và UI/UX.

==================================================
## NGUYÊN TẮC BẮT BUỘC
==================================================

1. Không được fix nửa vời.
2. Không được chỉ sửa UI mà bỏ business/API/DB.
3. Không được hard-code dữ liệu ở các select, filter, mapping, mega menu, contact options, showroom mapping, brand options, promotion options...
4. Không được giữ nút/flow dư thừa nếu business không cần.
5. Chỉ coi là DONE khi full flow hoạt động:
   UI -> state -> query/API -> DB -> render lại đúng.
6. Toàn bộ các list/filter/search nên theo kiểu realtime:
   - chọn là apply ngay
   - không cần nút Apply Filter riêng
   - có nút Clear để reset mà không refresh F5 page
7. Toàn bộ layout modal trong admin cho create/edit phải quay về kiểu full-screen modal overlay như trước, không phải page rời.
8. Tất cả phần song ngữ phải được giữ đồng bộ.
9. Các UI mới như brands/promotions phải bám style của admin/products hiện tại.
10. Bỏ toàn bộ thứ không cần thiết trong admin nếu tôi yêu cầu bỏ.

==================================================
## MỤC TIÊU CHUNG
==================================================

Hãy fix đầy đủ các nội dung sau, bao gồm:
- database schema nếu thiếu
- API / queries / mutations
- business rules
- admin pages
- public pages
- modal / form / filter / search
- UI consistency
- bilingual fields
- upload image flow
- account management
- quote workflow actions

==================================================
## NHÓM A — FILTER / SEARCH / REALTIME QUERY
==================================================

### A1. Bỏ nút Apply Filter
Hiện tại các nút “Áp dụng bộ lọc” đang gây bug:
- khi apply thì refresh page
- mất trạng thái lọc
- UX không tốt

Yêu cầu fix:
- bỏ nút “Áp dụng bộ lọc” ở các page đang dùng kiểu này
- khi user select / nhập giá trị filter thì phải query/filter luôn
- không được refresh toàn trang
- phải giữ state filter ổn định
- thêm nút “Clear” để reset filter mà không F5 page
- giữ URL/query state hợp lý nếu project đang dùng search params
- phải áp dụng đồng bộ cho cả public và admin ở các page có filter/search

Cần audit toàn bộ project để tìm các page đang dùng pattern filter lỗi này và sửa hết.

### A2. Filter tối giản cho trang products public
Tại:
`/vi/products`

Chỉ giữ lại các filter:
- search
- danh mục
- chất liệu
- giảm giá
- brand

Các filter còn lại bỏ đi.

Yêu cầu:
- khi select là filter/query luôn
- bỏ nút filter
- giữ nút clear
- không refresh page
- nếu dùng DB query/server params thì đảm bảo state đồng bộ

### A3. Admin list pages cần filter/search rõ ràng
Audit toàn bộ admin list pages để đảm bảo:
- có cụm search/filter hợp lý
- filter/search realtime
- không cần bấm nút filter
- UI rõ ràng, dễ dùng
- không dư các filter vô nghĩa

Đặc biệt kiểm tra:
- categories list
- products list
- blog list
- promotions list
- brands list
- quotes list
- users/accounts list

==================================================
## NHÓM B — MODAL / LAYOUT ADMIN
==================================================

### B1. Create/Edit admin phải là full-screen modal
Các page thêm/sửa như:
- product create/edit
- category create/edit
- brand create/edit
- promotion create/edit
- blog create/edit
- showroom create/edit
- các entity tương tự

Yêu cầu:
- hiển thị dạng modal full-screen overlay như kiểu cũ
- không tách thành page cứng rời gây lệch trải nghiệm
- modal phải bao phủ full màn
- có header rõ ràng
- có close/back logic hợp lý
- body scroll riêng
- sticky action bar nếu cần
- responsive tốt
- đồng bộ với pattern của admin/products

### B2. Skeleton loading trong admin
Hiện tại khi chuyển section admin, sidebar + header cũng bị skeleton.

Yêu cầu:
- chỉ skeleton phần content container ở giữa
- header và sidebar phải giữ nguyên
- tránh cảm giác app bị reload toàn khối
- rà soát layout loading boundary / suspense boundary / route segment loading để sửa đúng kiến trúc

==================================================
## NHÓM C — XÓA HARD-CODE, LẤY DATA TỪ DB
==================================================

### C1. Audit toàn bộ select/input/options
Cần audit toàn bộ dự án cả client và admin để tìm mọi chỗ:
- select option hard-code
- mapping hard-code
- search option hard-code
- showroom mapping hard-code
- brands hard-code
- promotion option hard-code
- contact option hard-code
- mega menu text hard-code
- partner brands hard-code

Yêu cầu:
- nếu dữ liệu thuộc domain quản trị được thì phải lấy từ DB/API thật
- chỉ giữ static constants với thứ thật sự bất biến
- sửa hết các select/input để lấy data chính xác từ DB

Ví dụ cần fix:
- Ánh xạ showroom trong create product
- các select option ở search/filter
- contact select options
- mega menu product text
- thương hiệu đối tác ở client

### C2. Header mega menu lấy data từ product/category/brand thật
Phần header / mega menu:
- danh mục hãng
- text trong các nhóm:
  - Nội thất & đồ gỗ
  - Thiết bị vệ sinh
  - Gạch ốp lát
  - Thiết kế khác

Yêu cầu:
- phải lấy data từ product/category/brand thật trong DB
- không hard-code
- cấu trúc menu phải phản ánh dữ liệu thật
- vẫn giữ UI gọn, premium, dễ quét

### C3. Client contact options lấy từ DB
Tại:
`/vi/contact`

Các ô select không được hard-code.
Phải lấy từ dữ liệu quản trị / DB phù hợp.

==================================================
## NHÓM D — ADMIN PRODUCT / CATEGORY / BRAND / PROMOTION BUSINESS
==================================================

### D1. Bỏ tính năng “lưu trữ” ở create pages
Ở các page create:
- bỏ tính năng lưu trữ không cần thiết
- chỉ giữ 2 nút:
  - Tạo
  - Lưu bản nháp

Áp dụng đồng bộ cho các entity create phù hợp.

### D2. Category parent/child business cần rõ ràng
Tại:
`/admin/categories/new`

Hiện có phần “Nhóm cha” nhưng business chưa rõ.

Yêu cầu:
- tổ chức lại business categories theo mô hình cha/con rõ ràng
- việc tạo nhóm cha nên nằm trong chính module categories
- có thể chia bố cục thành:
  - khu tạo category cha
  - khu tạo category con
- hoặc tree-based manager hợp lý hơn
- UI phải dễ quản lý, dễ hiểu
- hiển thị rõ quan hệ cha/con
- category list cũng phải phản ánh được cấu trúc này
- bỏ phần “Trạng thái xuất bản” dư thừa ở dưới nếu không còn cần trong page categories

### D3. Brands admin cần làm lại cho đồng bộ
Tại:
`/admin/brands`

Yêu cầu:
- UI hiện chưa đúng, chưa đồng nhất với các page khác
- phải refactor để bám pattern của admin/products
- hỗ trợ song ngữ đầy đủ
- hỗ trợ upload ảnh/logo
- create/edit phải theo full-screen modal
- list page phải có search/filter hợp lý
- toàn bộ data lấy từ DB thật
- đảm bảo business brand usable thực tế

### D4. Promotions admin cần làm lại đúng business
Tại:
`/admin/promotions`

Hiện business chưa rõ.

Business mới mong muốn:
- promotions chỉ là các đợt giảm giá nhỏ cho sản phẩm
- admin có ô tìm kiếm sản phẩm
- search ra sản phẩm
- bấm chọn từng sản phẩm để apply promotion đó
- promotion phải liên kết rõ với product
- khi tạo hoặc edit product cũng phải có mục chọn giảm giá / loại giảm giá
- business phải đồng bộ hai chiều:
  - từ promotions quản lý được products áp dụng
  - từ product thấy được promotion đang áp dụng

Yêu cầu triển khai:
- refactor data model nếu cần
- tạo/điều chỉnh DB tables, join tables, API, mutations nếu cần
- UI admin/promotions phải rõ ràng, dễ dùng
- create/edit promotions phải full-screen modal
- hỗ trợ upload ảnh nếu business cho phép hiển thị campaign image
- song ngữ đầy đủ
- bám style admin/products
- loại bỏ business promotion cồng kềnh, giữ nhỏ gọn, đúng nhu cầu thực tế

### D5. Product form phải đồng bộ với promotions
Trong create/edit product:
- phải có mục chọn giảm giá / promotion
- dữ liệu promotion phải lấy thật từ DB
- không hard-code
- hiển thị rõ đang áp dụng promotion nào
- cho phép thay đổi hợp lý
- đảm bảo render đúng ở public side nếu product đang có giảm giá

==================================================
## NHÓM E — BLOG / EDITOR / MEDIA
==================================================

### E1. Blog editor phải đầy đủ hơn
Tại:
`/admin/blog?create=1`

Phần “Nội dung chi tiết” hiện còn quá sơ sài.

Yêu cầu:
- áp dụng editor đầy đủ để nhân viên văn phòng có thể soạn thảo bài viết thật
- hỗ trợ format nội dung tốt hơn
- hỗ trợ upload/chèn ảnh trong bài
- hỗ trợ heading, paragraph, list, quote, link, image, có thể cả table nếu phù hợp
- đảm bảo song ngữ nếu business hiện yêu cầu song ngữ bài viết
- UI editor phải dễ dùng, sạch, không quá kỹ thuật
- dữ liệu lưu trữ phải phù hợp với render phía public blog detail

### E2. Blog detail sidebar sticky
Tại:
`/vi/blog/xu-huong-phong-tam-2026`

Phần:
- Mục lục
- Bài viết liên quan

Yêu cầu:
- sticky lại sidebar này
- khi lướt xuống vẫn thấy
- responsive hợp lý
- không đè layout

==================================================
## NHÓM F — QUOTES / WORKFLOW / ADMIN ACTIONS
==================================================

### F1. Quotes business phải rõ ràng hơn
Tại:
`/admin/quotes`

Hiện chưa rõ admin action theo trạng thái là gì.

Yêu cầu:
- làm rõ workflow trạng thái báo giá
- mỗi trạng thái phải có action cụ thể cho admin
- ví dụ:
  - mới nhận
  - đang xử lý
  - đã liên hệ
  - đã chốt
  - đã hủy
  - ... (tự tổ chức hợp lý nếu cần)
- admin phải thao tác được chứ không chỉ nhìn trạng thái
- nếu cần, thêm timeline/history/status log
- UI phải thể hiện rõ next actions
- đồng bộ DB + API + admin action buttons + status transitions

==================================================
## NHÓM G — SETTINGS / ADMIN CLEANUP
==================================================

### G1. Settings cần Việt hóa hoàn chỉnh
Tại:
`/admin/settings`

Phần “Mức độ sẵn sàng xuất bản” chưa được Việt hóa hết.

Yêu cầu:
- rà soát lại toàn bộ UI/settings
- chuyển hết phần còn sót sang tiếng Việt đúng ngữ cảnh
- tránh lẫn Việt/Anh nửa chừng

### G2. Bỏ AI Assistant
- bỏ hoàn toàn phần `ai-assistant` khỏi admin
- bỏ route/menu/entry liên quan nếu không cần
- dọn các tham chiếu liên quan trong admin navigation

### G3. Bỏ “Kiểm tra phân quyền”
- bỏ phần “Kiểm tra phân quyền” ở trên chỗ logout
- dọn UI cho sạch hơn

### G4. Thêm quản lý account trong admin
Hiện vẫn chưa có phần quản lý account rõ ràng.

Yêu cầu:
- triển khai phần quản lý account hiện tại ở admin
- list account
- create account
- edit role/trạng thái nếu business cần
- search/filter cơ bản
- bám pattern admin nhất quán
- không hard-code dữ liệu

==================================================
## NHÓM H — CLIENT UI / PUBLIC PAGES
==================================================

### H1. Thương hiệu đối tác
Ở client, phần “Thương hiệu đối tác” đang hard-code.

Yêu cầu:
- lấy từ DB
- sửa lại UI cho hợp lý hơn, đẹp hơn
- vẫn đồng bộ tone chung dự án

### H2. Promotions public page
Tại:
`/vi/promotions`

Hiện:
- tone màu lệch dự án
- màu sắc không phù hợp
- data chưa map đúng từ product/business admin

Yêu cầu:
- map đúng data từ business promotions admin
- UI phải đúng tone màu dự án hiện tại
- bố cục phải hợp lý, premium, đồng bộ
- phản ánh đúng promotion business đã refactor ở admin

### H3. Hero arrows + fixed contact tooltip
Ở section hero:
- 2 arrow slide cần có con trỏ pointer

Phần fixed tooltip contact:
- danh sách liên hệ zalo / messenger / số điện thoại phải cấu hình được trong admin settings
- UI tooltip hiện đang lệch khi mở ra, cần fix cho thẳng hàng
- đồng bộ spacing, alignment, hover, click state

==================================================
## NHÓM I — QA TOÀN DỰ ÁN
==================================================

Sau khi fix các phần trên, hãy audit lại toàn bộ project để đảm bảo:
- không còn hard-code sai chỗ
- select/filter/search dùng data thật
- create/edit dùng modal full-screen đúng pattern
- admin list pages có filter/search realtime
- public header/mega menu/contact/promotions/partner brands lấy data đúng
- quotes workflow rõ ràng
- account management usable
- brands/promotions/blog editor usable
- UI đồng bộ giữa các page

==================================================
## THỨ TỰ TRIỂN KHAI KHUYÊN DÙNG
==================================================

Hãy tự triển khai theo thứ tự hợp lý sau:
1. Data model / DB / API cho categories, brands, promotions, accounts, quotes workflow
2. Refactor admin create/edit modal pattern
3. Refactor realtime filter/search pattern toàn dự án
4. Loại bỏ hard-code toàn dự án
5. Hoàn thiện blog editor
6. Hoàn thiện public pages: products, promotions, contact, header, partner brands, sticky blog sidebar
7. UI consistency pass cuối

==================================================
## TIÊU CHUẨN HOÀN THÀNH
==================================================

Chỉ coi là hoàn thành khi:
- không còn nút Apply Filter ở các page cần realtime filter
- có nút Clear reset filter không F5
- admin create/edit dùng full-screen modal
- select/options không hard-code sai chỗ
- categories parent/child rõ business và usable
- brands/promotions/account management usable thật
- promotions đồng bộ hai chiều với products
- blog editor usable thật cho người văn phòng
- quotes có action workflow rõ
- settings Việt hóa hoàn chỉnh
- ai-assistant bị loại bỏ
- quyền kiểm tra dư thừa bị loại bỏ
- admin layout skeleton chỉ reload phần content
- client partner brands / mega menu / contact options đều lấy từ DB
- UI promotions và brands đồng bộ với toàn dự án

==================================================
## DELIVERABLE CUỐI
==================================================

Sau khi triển khai xong, xuất:
1. Danh sách file đã sửa/tạo
2. Migration mới
3. Các API/query/mutation đã thêm/chỉnh
4. Các business rules đã thay đổi
5. Checklist từng mục 1-21:
   - DONE
   - PARTIAL
   - BLOCKED
6. Các điểm còn cần runtime QA nếu có

Bắt đầu fix ngay bây giờ, không audit lại, không hỏi lại kế hoạch.

Hãy tự nhóm các việc trên thành các phase thực thi hợp lý, nhưng phải đảm bảo cuối cùng cover đủ cả 21 mục, không bỏ sót mục nào.