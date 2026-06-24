# -*- coding: utf-8 -*-

# ==============================================================================
# CLIENT SCREENS DATA
# ==============================================================================
client_screens_data = [
    {
        'code': 'SCR_CLI_001', 'slug_name': 'Trang_Chu', 'name': 'Trang chủ',
        'url': '/vi', 'screenshot': 'vi-desktop.png',
        'system_type': 'Client Website', 'date': '2026-06-22',
        'component': 'app/[locale]/page.tsx',
        'ui_elements': [
            (1, "Hero Banner chính (HeroSection)", "Banner Block",
             "Chiều cao tối thiểu: 100vh. Ảnh nền bộ sưu tập gỗ cao cấp phủ overlay gradient tối. Chứa slogan thương hiệu cỡ chữ lớn màu trắng, tagline ngắn về thiết kế nội thất, nút CTA 'Khám phá bộ sưu tập' và link 'Tư vấn miễn phí'.",
             "Nút CTA chính điều hướng đến /vi/products. Nút tư vấn chuyển đến /vi/contact. Hiệu ứng scroll-fade khi người dùng kéo màn hình xuống."),
            (2, "Thanh điều hướng (Navbar)", "Navigation Header",
             "Nền trắng/transparent khi ở đầu trang. Chứa logo Phương Đông ở bên trái, menu điều hướng chính giữa (Trang chủ, Sản phẩm, Blog, Giới thiệu, Liên hệ), và bộ chuyển ngôn ngữ VI/EN ở bên phải.",
             "Click logo về trang chủ. Click menu mục điều hướng đến trang tương ứng. Nút chuyển ngôn ngữ cập nhật locale trong URL."),
            (3, "Phần Sản phẩm nổi bật (FeaturedProducts)", "Product Grid Section",
             "Lưới 4 cột (desktop), 2 cột (tablet), 1 cột (mobile). Hiển thị tối đa 8 sản phẩm is_featured=true. Mỗi card: ảnh sản phẩm, nhãn danh mục, tên sản phẩm, giá, nút Khám phá.",
             "Dữ liệu từ Supabase bảng products lọc is_featured=true. Click card đến /vi/products/[slug]. Hover có hiệu ứng scale(1.02)."),
            (4, "Phần Danh mục sản phẩm (CategorySection)", "Category Grid Links",
             "Hiển thị 3 card danh mục lớn: Đồ gỗ nội thất, Thiết bị vệ sinh, Gạch ốp lát. Mỗi card có ảnh bìa đại diện, tên danh mục lớn, mô tả ngắn và mũi tên điều hướng.",
             "Click vào card danh mục điều hướng đến /vi/products?category=[slug] để lọc sản phẩm."),
            (5, "Phần Khuyến mãi nổi bật (PromotionBanner)", "Promotion Banner Block",
             "Thiết kế nền tối sang trọng với gradient ấm. Hiển thị thẻ tóm tắt chiến dịch đang chạy, phần trăm giảm giá lớn và thời hạn còn lại.",
             "Dữ liệu chiến dịch từ bảng promotions lọc trạng thái đang_dien_ra. Click nút 'Xem ưu đãi' điều hướng đến /vi/promotions."),
            (6, "Phần Bài viết mới nhất (LatestBlog)", "Blog Article Grid",
             "Hiển thị 3 bài viết blog mới nhất theo lưới. Mỗi bài gồm: ảnh bìa thumbnail, danh mục, tiêu đề, tóm tắt ngắn, ngày đăng và tên tác giả.",
             "Dữ liệu từ bảng blog_posts lọc published, sắp xếp created_at DESC. Click bài viết đến /vi/blog/[slug]."),
            (7, "Phần Hệ thống Showroom (ShowroomSection)", "Showroom Preview Cards",
             "Giới thiệu sơ bộ 2 showroom chính tại Hà Nội và TP. HCM với ảnh thực tế, địa chỉ và hotline liên hệ.",
             "Dữ liệu từ bảng showrooms. Click 'Xem tất cả showroom' dẫn đến /vi/showrooms."),
            (8, "Chân trang (Footer)", "Footer Layout",
             "Nền tối xám đậm. Chia 4 cột: Logo và tagline thương hiệu, Điều hướng nhanh, Thông tin liên hệ (hotline/email/địa chỉ), Mạng xã hội. Dưới cùng có dòng bản quyền.",
             "Hotline liên kết tel:. Email liên kết mailto:. Mạng xã hội mở tab mới."),
        ],
        'workflows': [
            ("Duyệt bộ sưu tập và khám phá sản phẩm",
             "Bước 1: Người dùng mở URL /vi.\nBước 2: Hệ thống render SSR trang chủ, fetch sản phẩm nổi bật và bài viết từ Supabase.\nBước 3: Người dùng xem hero banner và click 'Khám phá bộ sưu tập'.\nBước 4: Hệ thống điều hướng sang trang danh mục /vi/products."),
            ("Chuyển đổi ngôn ngữ Việt - Anh",
             "Bước 1: Người dùng click vào nút chuyển ngôn ngữ 'EN' trên thanh Navbar.\nBước 2: next-intl cập nhật locale trong URL (vi -> en).\nBước 3: Trang tải lại với toàn bộ nội dung hiển thị bằng tiếng Anh.")
        ],
        'user_guide': "1. Truy cập http://localhost:3000/vi.\n2. Kéo màn hình xuống để xem sản phẩm nổi bật và khuyến mãi đang diễn ra.\n3. Click 'Khám phá bộ sưu tập' để xem toàn bộ sản phẩm theo danh mục.\n4. Click vào thẻ sản phẩm nổi bật để xem chi tiết và gửi yêu cầu báo giá.\n5. Sử dụng nút EN/VI ở góc trên bên phải để đổi ngôn ngữ giao diện."
    },
    {
        'code': 'SCR_CLI_002', 'slug_name': 'Gioi_Thieu', 'name': 'Giới thiệu',
        'url': '/vi/about', 'screenshot': 'vi-about-desktop.png',
        'system_type': 'Client Website', 'date': '2026-06-22',
        'component': 'app/[locale]/about/page.tsx',
        'ui_elements': [
            (1, "Hero Banner Giới thiệu", "Banner Block",
             "Chiều cao tối thiểu 520px. Ảnh phủ đen mờ (Overlay 62% đến 18%). Tiêu đề chính cỡ lớn màu trắng, mô tả dẫn dắt và nhãn thời gian '20 năm / since 2004'.",
             "Hiển thị ảnh nền aboutHero đại diện cho bộ sưu tập gỗ cao cấp. Tải nội dung giới thiệu động từ CSDL."),
            (2, "Khối Câu chuyện thương hiệu", "Content Section",
             "Bố cục 2 cột: Cột trái là nội dung text kể câu chuyện từ xưởng gỗ gia đình kèm ô nổi bật '20+ năm'. Cột phải là ảnh showroom/nhà máy factory.",
             "Hiển thị văn bản câu chuyện thương hiệu theo locale hiện hành. Hover vào ảnh có hiệu ứng nâng ảnh nhẹ."),
            (3, "Khối Giá trị cốt lõi", "Grid Cards Container",
             "Màu nền Slate đậm (#1E293B). Lưới 3 cột chứa 3 thẻ: Tầm nhìn (Vision), Sứ mệnh (Mission), Giá trị (Values). Có bo viền kính glassmorphism.",
             "Icon động tương ứng (Eye, Diamond, Shield). Khi hover viền thẻ chuyển sang màu sáng nhẹ."),
            (4, "Khối Năng lực và Quy mô", "Content Section",
             "Màu nền xám nhạt. Cột trái chứa hình ảnh quy mô showroom thiết bị vệ sinh. Cột phải hiển thị 2 thẻ chỉ số lớn: '20+' năm kinh nghiệm, '5000+' khách hàng hài lòng.",
             "Dữ liệu lấy động từ thuộc tính badge1 và badge2 trong bảng site_settings của Supabase."),
            (5, "Banner Đội ngũ nhân viên", "Media Block",
             "Hiển thị hình ảnh rộng toàn khung chụp showroom và đội ngũ nhân sự tư vấn chuyên nghiệp của Phương Đông.",
             "Chỉ hiển thị hình ảnh tĩnh phục vụ nhận diện thương hiệu chuyên nghiệp."),
            (6, "Nút CTA Tư vấn nhanh", "Button Link",
             "Nút nổi bật trên nền Slate tối. Hover đổi màu nền sáng và dịch chuyển nhẹ icon mũi tên sang phải. Text: 'Liên hệ tư vấn'.",
             "Khi click, điều hướng người dùng sang trang liên hệ chính /vi/contact."),
        ],
        'workflows': [
            ("Xem thông tin năng lực doanh nghiệp",
             "Bước 1: Người dùng truy cập /vi/about.\nBước 2: Hệ thống truy vấn Supabase lấy nội dung trang giới thiệu theo locale.\nBước 3: Hiển thị các phần lịch sử, tầm nhìn, sứ mệnh và chỉ số năng lực.\nBước 4: Người dùng cuộn trang để duyệt xem hình ảnh showroom và xưởng sản xuất."),
            ("Điều hướng gửi yêu cầu tư vấn",
             "Bước 1: Người dùng cuộn đến phần chân trang và thấy banner CTA.\nBước 2: Người dùng click vào nút 'Liên hệ tư vấn'.\nBước 3: Hệ thống chuyển hướng người dùng sang trang /vi/contact.")
        ],
        'user_guide': "1. Mở trình duyệt và truy cập http://localhost:3000/vi/about.\n2. Cuộn màn hình để xem tuần tự: Lời mở đầu -> Câu chuyện thương hiệu -> Tầm nhìn và Sứ mệnh -> Chỉ số năng lực showroom -> Ảnh đội ngũ.\n3. Nhấn vào nút 'Liên hệ tư vấn' ở cuối trang để mở form liên hệ gửi yêu cầu tư vấn thiết kế."
    },
    {
        'code': 'SCR_CLI_003', 'slug_name': 'Danh_Muc_San_Pham', 'name': 'Danh mục Sản phẩm',
        'url': '/vi/products', 'screenshot': 'vi-products-desktop.png',
        'system_type': 'Client Website', 'date': '2026-06-22',
        'component': 'app/[locale]/products/page.tsx',
        'ui_elements': [
            (1, "Breadcrumb", "Navigation Link",
             "Cỡ chữ nhỏ 14px, màu xám nhạt. Đường dẫn: Trang chủ > Sản phẩm.",
             "Giúp người dùng xác định vị trí trang hiện tại và quay lại trang chủ nhanh chóng."),
            (2, "Nhóm danh mục nổi bật", "Grid Links Container",
             "Hiển thị 3 card danh mục chính: Đồ gỗ nội thất, Thiết bị vệ sinh, Gạch ốp lát. Ảnh minh họa và text mô tả ngắn bên cạnh.",
             "Click vào card để URL cập nhật tham số lọc ?category=[slug] lọc sản phẩm tương ứng."),
            (3, "Bộ lọc tìm kiếm (ProductFilterPanel)", "Filter Panel Container",
             "Bao gồm: Trường nhập từ khóa, Dropdown chọn Danh mục, Thương hiệu, Chất liệu, Không gian, Phong cách, Bộ sưu tập, Tông màu, Trạng thái và Checkbox xem sản phẩm nổi bật.",
             "Hỗ trợ lọc sản phẩm real-time. Khi thay đổi lọc, URL cập nhật query string và gọi API lọc của Supabase không tải lại trang."),
            (4, "Dropdown Sắp xếp (ProductSortSelect)", "Select Dropdown",
             "Nằm ở góc phải trên danh sách. Gồm các tùy chọn: 'Mới nhất' và 'Nổi bật nhất'.",
             "Thay đổi thứ tự hiển thị của danh sách sản phẩm dựa trên ngày tạo hoặc thuộc tính nổi bật."),
            (5, "Grid Danh sách sản phẩm", "Product Grid Layout",
             "Bố cục lưới: 1 cột mobile, 2 cột tablet, 4 cột desktop. Mỗi thẻ Card: ảnh sản phẩm, danh mục, tên sản phẩm, giá bán (hoặc 'Liên hệ') và nút Khám phá.",
             "Hover card có hiệu ứng scale phóng to nhẹ. Click card dẫn đến chi tiết /vi/products/[slug]."),
            (6, "Thanh phân trang (Pagination)", "Pagination Control",
             "Chứa thông tin trang hiện tại (Trang 1/3), nút 'Trước' và 'Sau', danh sách số trang.",
             "Khi click số trang, URL cập nhật tham số ?page=X, hệ thống gọi API và tải danh sách trang tương ứng."),
        ],
        'workflows': [
            ("Lọc tìm kiếm sản phẩm đa tiêu chí",
             "Bước 1: Người dùng truy cập /vi/products.\nBước 2: Người dùng chọn danh mục 'Đồ gỗ nội thất' và chất liệu 'Gỗ óc chó'.\nBước 3: Giao diện cập nhật URL thành /vi/products?category=wood&material=walnut.\nBước 4: Hệ thống gửi yêu cầu truy vấn đến Supabase theo các điều kiện lọc.\nBước 5: Trả về danh sách sản phẩm khớp tiêu chuẩn lọc và hiển thị lên Grid."),
            ("Phân trang danh mục",
             "Bước 1: Người dùng cuộn xuống chân trang danh sách sản phẩm.\nBước 2: Người dùng click vào nút trang số '2' hoặc nút 'Sau'.\nBước 3: URL đổi thành /vi/products?page=2.\nBước 4: Component bắt sự kiện thay đổi page, cắt danh sách sản phẩm từ index 8 đến 15 và hiển thị lên giao diện.")
        ],
        'user_guide': "1. Truy cập http://localhost:3000/vi/products.\n2. Chọn nhanh một trong ba nhóm sản phẩm trên cùng để lọc nhanh, hoặc mở rộng bộ lọc chi tiết.\n3. Gõ tên sản phẩm vào ô tìm kiếm hoặc chọn lọc chất liệu gỗ, phong cách thiết kế.\n4. Chọn sắp xếp 'Mới nhất' để xem các thiết kế vừa được showroom đăng tải.\n5. Click chọn xem các trang tiếp theo ở cuối trang để xem thêm sản phẩm."
    },
    {
        'code': 'SCR_CLI_004', 'slug_name': 'Chi_Tiet_San_Pham', 'name': 'Chi tiết Sản phẩm',
        'url': '/vi/products/[slug]', 'screenshot': 'vi-products-sofa-curve-velour-desktop.png',
        'system_type': 'Client Website', 'date': '2026-06-22',
        'component': 'app/[locale]/products/[slug]/page.tsx',
        'ui_elements': [
            (1, "Thư viện ảnh sản phẩm (ProductGallery)", "Image Gallery",
             "Cột bên trái. Ảnh chính kích thước lớn, nút mũi tên chuyển ảnh. Bên dưới là danh sách ảnh thu nhỏ thumbnails. Có hiệu ứng zoom khi di chuột lên ảnh chính.",
             "Hiển thị đầy đủ hình ảnh chi tiết sản phẩm. Người dùng click ảnh thu nhỏ để đổi ảnh hiển thị trên khung lớn."),
            (2, "Thông tin tóm tắt và Mã sản phẩm", "Text Box",
             "Cột bên phải. Chứa nhãn danh mục viết hoa nhỏ, tiêu đề sản phẩm h1 cỡ chữ lớn đậm (30px), mã sản phẩm dạng 'Ref: SOFA-CURVE' và đoạn mô tả ngắn.",
             "Cung cấp cái nhìn nhanh về nguồn gốc danh mục và phong cách thiết kế của sản phẩm."),
            (3, "Giá bán tham khảo", "Price Label",
             "Hiển thị giá bán tiêu chuẩn in đậm cỡ chữ lớn, có giá cũ gạch ngang nếu có khuyến mãi. Có dòng ghi chú nhỏ: * Giá tham khảo sản phẩm tiêu chuẩn (Chưa bao gồm VAT).",
             "Giá bán lấy từ thuộc tính price_min của CSDL Supabase. Nếu chỉ nhận báo giá, hiển thị chữ 'Liên hệ'."),
            (4, "Khối nút hành động (ProductActionGroup)", "Button Group",
             "Gồm 2 nút chính:\n- Nút 'Yêu cầu báo giá': Màu nền đỏ đậm, bo góc tròn 8px.\n- Nút 'Lưu lựa chọn': Nút outline, hover đổi màu.",
             "Khi click 'Yêu cầu báo giá', hệ thống cuộn trang xuống Form tư vấn và tự chọn sản phẩm này. Click 'Lưu lựa chọn' lưu slug vào localStorage."),
            (5, "Tab thông tin chi tiết (Tabs)", "Tab Panel Group",
             "Gồm các tab: 'Mô tả chi tiết', 'Thông số kỹ thuật', 'Hướng dẫn bảo quản'. Nội dung hiển thị phong phú dạng văn bản được định dạng.",
             "Click từng tab để hiển thị thông tin tương ứng. Mặc định mở tab Mô tả chi tiết."),
            (6, "Form gửi yêu cầu tư vấn & báo giá (QuoteForm)", "Form Container",
             "Biểu mẫu gồm các trường: Họ và tên, Số điện thoại, Email, Địa chỉ công trình, Ghi chú yêu cầu và trường ẩn chứa ID sản phẩm đang xem.",
             "Người dùng nhập đầy đủ thông tin để gửi yêu cầu báo giá. Thực hiện validate số điện thoại và email chuẩn xác."),
        ],
        'workflows': [
            ("Gửi yêu cầu báo giá sản phẩm chi tiết",
             "Bước 1: Người dùng xem chi tiết sản phẩm, click 'Yêu cầu báo giá'.\nBước 2: Hệ thống cuộn màn hình xuống Form báo giá ở chân trang và tự điền tên sản phẩm vào ghi chú.\nBước 3: Người dùng điền Họ tên, Số điện thoại và Email rồi nhấn 'Gửi yêu cầu'.\nBước 4: Hệ thống gửi request API lưu vào bảng quotes trên Supabase và gọi Resend gửi email thông báo cho Admin.\nBước 5: Hiển thị thông báo thành công dạng popup toast và tự động xóa dữ liệu form cũ."),
            ("Lưu sản phẩm yêu thích cục bộ",
             "Bước 1: Người dùng nhấn vào nút 'Lưu lựa chọn'.\nBước 2: Hệ thống thêm slug sản phẩm vào danh sách trong localStorage.\nBước 3: Hiển thị toast thông báo 'Đã lưu sản phẩm vào danh sách yêu thích'.")
        ],
        'user_guide': "1. Truy cập trang chi tiết sản phẩm (ví dụ Sofa Curve Velour).\n2. Click vào các ảnh nhỏ bên trái để xem chi tiết các góc cạnh sản phẩm.\n3. Click sang tab 'Thông số kỹ thuật' để kiểm tra kích thước gỗ và lớp hoàn thiện.\n4. Click nút 'Yêu cầu báo giá' để điền form liên hệ gửi đến showroom.\n5. Điền đầy đủ Họ tên, Số điện thoại và nhấn 'Gửi yêu cầu' để nhận tư vấn trong 15 phút."
    },
    {
        'code': 'SCR_CLI_005', 'slug_name': 'Lien_He', 'name': 'Liên hệ',
        'url': '/vi/contact', 'screenshot': 'vi-contact-desktop.png',
        'system_type': 'Client Website', 'date': '2026-06-22',
        'component': 'app/[locale]/contact/page.tsx',
        'ui_elements': [
            (1, "Thông tin Hotline & Hỗ trợ", "Contact Info Grid",
             "Cột bên trái. Hiển thị số Hotline lớn màu đỏ đậm, Email hỗ trợ, Địa chỉ văn phòng chính, Giờ mở cửa hoạt động.",
             "Cung cấp thông tin liên lạc nhanh cho khách hàng cần hỗ trợ khẩn cấp."),
            (2, "Form liên hệ tổng quát (ContactForm)", "Form Container",
             "Cột bên phải. Chứa các trường: Họ tên, Số điện thoại (validate 10 số), Email, Nội dung tin nhắn và nút 'Gửi thông tin'.",
             "Cho phép khách hàng gửi tin nhắn tư vấn thiết kế tổng quát hoặc phản hồi dịch vụ. Gọi API Supabase lưu vào bảng quotes."),
            (3, "Bản đồ hệ thống Showroom", "Showroom Cards",
             "Phần dưới form liên hệ. Hiển thị thông tin địa chỉ chi tiết kèm hotline riêng của 2 Showroom lớn tại Hà Nội và TP. HCM.",
             "Giúp khách hàng lựa chọn địa điểm showroom gần nhất để đến tham quan trải nghiệm thực tế."),
        ],
        'workflows': [
            ("Gửi tin nhắn liên hệ tổng quát",
             "Bước 1: Người dùng điền đầy đủ Họ tên, SĐT, Email và nhập nội dung cần tư vấn vào Form liên hệ.\nBước 2: Người dùng nhấn nút 'Gửi thông tin'.\nBước 3: Frontend thực hiện validate dữ liệu. SĐT phải bắt đầu bằng số 0, dài 10 ký tự.\nBước 4: Gọi API chèn bản ghi vào bảng quotes với loại yêu cầu là 'Tư vấn chung'.\nBước 5: Hệ thống chuyển hướng người dùng sang trang thông báo thành công /vi/contact/success.")
        ],
        'user_guide': "1. Truy cập trang Liên hệ.\n2. Điền đầy đủ thông tin cá nhân vào form bên phải.\n3. Nhập câu hỏi cụ thể (ví dụ: 'Tôi muốn tư vấn thiết kế trọn gói phòng tắm master').\n4. Nhấn 'Gửi thông tin' và chờ hệ thống xác nhận chuyển hướng thành công."
    },
    {
        'code': 'SCR_CLI_006', 'slug_name': 'Lien_He_Thanh_Cong', 'name': 'Liên hệ thành công',
        'url': '/vi/contact/success', 'screenshot': 'vi-contact-success-desktop.png',
        'system_type': 'Client Website', 'date': '2026-06-22',
        'component': 'app/[locale]/contact/success/page.tsx',
        'ui_elements': [
            (1, "Icon thành công", "Visual Decor",
             "Biểu tượng dấu tích xanh lục lớn kèm hiệu ứng vòng tròn lan tỏa.",
             "Thông báo trực quan trạng thái gửi dữ liệu đã hoàn tất thành công."),
            (2, "Thông điệp cảm ơn và cam kết", "Text Block",
             "Tiêu đề lớn 'Gửi yêu cầu thành công!'. Đoạn văn bản cam kết liên hệ lại trong vòng 15-30 phút hằng ngày.",
             "Tạo sự an tâm và phản hồi xác nhận rõ ràng cho khách hàng."),
            (3, "Nút điều hướng quay lại", "Button Link",
             "Gồm 2 nút chính:\n- Nút 'Quay lại Trang chủ' (màu xanh chủ đạo)\n- Nút 'Xem thêm sản phẩm' (outline button)",
             "Click 'Quay lại Trang chủ' chuyển hướng về /vi. Click 'Xem thêm sản phẩm' chuyển hướng về trang /vi/products."),
        ],
        'workflows': [
            ("Quay lại duyệt sản phẩm từ trang thành công",
             "Bước 1: Khách hàng nhấn vào nút 'Xem thêm sản phẩm'.\nBước 2: Hệ thống thực hiện chuyển hướng sang URL /vi/products để người dùng tiếp tục duyệt danh mục sản phẩm gỗ.")
        ],
        'user_guide': "1. Sau khi gửi thành công form liên hệ hoặc form báo giá, hệ thống sẽ tự động chuyển hướng đến trang này.\n2. Đọc thông tin xác nhận và kiểm tra điện thoại/email trong khoảng 15 phút.\n3. Click nút 'Quay lại Trang chủ' để quay lại trang chủ tiếp tục duyệt bài viết blog."
    },
    {
        'code': 'SCR_CLI_007', 'slug_name': 'Khuyen_Mai', 'name': 'Khuyến mãi',
        'url': '/vi/promotions', 'screenshot': 'vi-promotions-desktop.png',
        'system_type': 'Client Website', 'date': '2026-06-22',
        'component': 'app/[locale]/promotions/page.tsx',
        'ui_elements': [
            (1, "Banner chương trình Khuyến mãi lớn", "Promotion Banner Block",
             "Ảnh bìa lớn thiết kế sang trọng, tiêu đề chiến dịch lớn, mô tả nội dung chương trình và đồng hồ đếm ước lượng thời gian còn lại.",
             "Thu hút sự chú ý của khách hàng về các chương trình ưu đãi lớn đang hoạt động."),
            (2, "Danh sách mã giảm giá (Coupon List)", "Grid Coupon Cards",
             "Hiển thị danh sách các thẻ mã giảm giá khả dụng. Mỗi thẻ gồm: Tên mã (PHUONGDONG10), phần trăm/số tiền giảm, đơn áp dụng tối thiểu, thời hạn và nút 'Sao chép mã'.",
             "Click nút 'Sao chép mã' sao chép mã coupon vào bộ nhớ đệm (Clipboard) và hiển thị thông báo toast thành công."),
            (3, "Grid sản phẩm khuyến mãi liên kết", "Product Grid Layout",
             "Hiển thị danh sách các sản phẩm đang được áp dụng mức giá ưu đãi đặc biệt của chiến dịch hiện hành.",
             "Click vào từng card sản phẩm để đi tới trang chi tiết xem thông số và gửi yêu cầu báo giá ưu đãi."),
        ],
        'workflows': [
            ("Sao chép mã coupon khuyến mãi nhanh",
             "Bước 1: Người dùng duyệt danh sách mã giảm giá, tìm mã phù hợp.\nBước 2: Người dùng nhấn vào nút 'Sao chép mã'.\nBước 3: Hệ thống sử dụng Clipboard API của trình duyệt lưu mã giảm giá.\nBước 4: Hiển thị toast thông báo xanh lục 'Đã sao chép mã PHUONGDONG10 thành công!'.")
        ],
        'user_guide': "1. Truy cập mục 'Ưu đãi' trên thanh điều hướng chính.\n2. Xem chương trình khuyến mãi chủ đạo đang diễn ra ở banner trên cùng.\n3. Nhấn nút 'Sao chép mã' trên các thẻ coupon để lưu mã giảm giá.\n4. Kéo xuống dưới để xem danh sách sản phẩm đang được giảm giá sâu và nhấn vào sản phẩm để gửi yêu cầu mua hàng."
    },
    {
        'code': 'SCR_CLI_008', 'slug_name': 'He_Thong_Showroom', 'name': 'Hệ thống Showroom',
        'url': '/vi/showrooms', 'screenshot': 'vi-showrooms-desktop.png',
        'system_type': 'Client Website', 'date': '2026-06-22',
        'component': 'app/[locale]/showrooms/page.tsx',
        'ui_elements': [
            (1, "Danh sách Showroom", "Showroom Cards Stack",
             "Cột bên trái. Hiển thị danh sách showroom. Mỗi showroom gồm: Tên chi nhánh, Địa chỉ đầy đủ, Hotline, Giờ mở cửa và nút 'Xem bản đồ nhúng'.",
             "Cung cấp thông tin địa lý và liên lạc trực tiếp cho khách hàng. Click showroom cập nhật bản đồ bên phải."),
            (2, "Bản đồ nhúng Google Maps", "Google Maps Embed",
             "Cột bên phải. Khung iframe lớn hiển thị bản đồ Google Maps của showroom đang chọn. Có nút mở rộng dẫn tới ứng dụng Google Maps ngoài.",
             "Hiển thị vị trí thực tế trực quan giúp khách hàng tìm đường đi dễ dàng."),
        ],
        'workflows': [
            ("Chuyển xem bản đồ showroom tương ứng",
             "Bước 1: Người dùng nhấn chọn Showroom thứ 2 'TP. Hồ Chí Minh' trên danh sách bên trái.\nBước 2: Hệ thống cập nhật URL iframe Google Maps tương ứng của chi nhánh TP. HCM.\nBước 3: Khung bản đồ bên phải tải lại và hiển thị ghim vị trí của showroom quận 1.")
        ],
        'user_guide': "1. Mở trang Hệ thống Showroom.\n2. Xem chi tiết thông tin địa chỉ và giờ làm việc của từng showroom ở danh sách bên trái.\n3. Click vào showroom bất kỳ để bản đồ bên phải chuyển sang định vị showroom đó.\n4. Click nút 'Đường đi' trên bản đồ để mở ứng dụng Google Maps ngoài dẫn đường."
    },
    {
        'code': 'SCR_CLI_009', 'slug_name': 'Danh_Sach_Blog', 'name': 'Danh sách Blog',
        'url': '/vi/blog', 'screenshot': 'vi-blog-desktop.png',
        'system_type': 'Client Website', 'date': '2026-06-22',
        'component': 'app/[locale]/blog/page.tsx',
        'ui_elements': [
            (1, "Thẻ bài viết nổi bật (Featured Post)", "Hero Article Card",
             "Nằm trên cùng. Thẻ kích thước lớn hiển thị ảnh bìa rộng, danh mục bài viết, tiêu đề lớn, mô tả tóm tắt, ngày đăng, tên tác giả và nút 'Đọc tiếp'.",
             "Lôi cuốn người đọc vào bài viết tiêu điểm nổi bật nhất gần đây."),
            (2, "Lưới danh sách bài viết thường", "Grid Article Cards",
             "Lưới 3 cột hiển thị các bài viết còn lại. Mỗi card chứa: Ảnh đại diện, nhãn danh mục, tiêu đề bài viết, mô tả ngắn và ngày xuất bản.",
             "Click card bài viết điều hướng sang trang chi tiết nội dung tương ứng /vi/blog/[slug]."),
            (3, "Danh mục lọc bài viết (Blog Categories)", "Links Row",
             "Hàng nút chọn các danh mục bài viết: 'Tất cả', 'Kiến thức đồ gỗ', 'Thiết bị vệ sinh', 'Vật liệu hoàn thiện'.",
             "Click chọn danh mục để lọc danh sách bài viết trên lưới theo chủ đề quan tâm."),
        ],
        'workflows': [
            ("Lọc bài viết theo chuyên mục",
             "Bước 1: Người dùng click vào danh mục 'Kiến thức đồ gỗ'.\nBước 2: URL cập nhật tham số lọc ?category=wood-knowledge.\nBước 3: Hệ thống truy vấn Supabase lấy bài viết thuộc chuyên mục này và render lại danh sách.")
        ],
        'user_guide': "1. Truy cập mục 'Blog' trên thanh điều hướng chính.\n2. Xem bài viết tiêu điểm lớn nhất ở trên cùng.\n3. Sử dụng hàng danh mục bên dưới banner để lọc bài viết theo chủ đề yêu thích.\n4. Click vào tiêu đề bài viết hoặc ảnh bìa để mở xem chi tiết bài viết."
    },
    {
        'code': 'SCR_CLI_010', 'slug_name': 'Chi_Tiet_Blog', 'name': 'Chi tiết Blog',
        'url': '/vi/blog/[slug]', 'screenshot': 'vi-blog-bi-quyet-chon-go-oc-cho-desktop.png',
        'system_type': 'Client Website', 'date': '2026-06-22',
        'component': 'app/[locale]/blog/[slug]/page.tsx',
        'ui_elements': [
            (1, "Tiêu đề bài viết & Tác giả", "Blog Header",
             "Hiển thị tiêu đề bài viết cỡ chữ h1 lớn đậm, bên dưới có thông tin tên tác giả, ngày đăng bài và danh mục liên kết.",
             "Cung cấp thông tin nguồn gốc và độ tin cậy của bài viết cho người đọc."),
            (2, "Khung nội dung bài viết chính (BlogContent)", "Rich Text Content Container",
             "Vùng hiển thị nội dung chính của bài viết, hỗ trợ định dạng rich text: tiêu đề phụ h2/h3, ảnh minh họa có chú thích, chữ in đậm và trích dẫn nổi bật.",
             "Hiển thị toàn bộ nội dung kiến thức chuyên môn đã được biên tập viên biên soạn."),
            (3, "Bảng mục lục tự động (ArticleTOC)", "Floating Sidebar Table of Contents",
             "Nằm bên cạnh nội dung (màn hình desktop). Tự động phân tích các thẻ h2/h3 trong bài viết để hiển thị danh sách mục lục liên kết nhảy nhanh.",
             "Click vào mục lục để cuộn màn hình nhanh đến phần tương ứng. Mục lục đang đọc được đánh dấu màu nổi bật."),
            (4, "Khối bài viết liên quan", "Grid Cards Container",
             "Hiển thị 3 card bài viết liên quan cùng chuyên mục ở cuối bài viết.",
             "Gợi ý các nội dung tiếp theo cho người dùng khám phá, tăng thời gian ở lại trang."),
        ],
        'workflows': [
            ("Mục lục tự động cuộn màn hình",
             "Bước 1: Người dùng click vào mục '3. Độ bền và khả năng chống ẩm' trên thanh mục lục.\nBước 2: Hệ thống bắt sự kiện click, tính toán vị trí của thẻ h2 tương ứng trên trang.\nBước 3: Thực hiện hiệu ứng cuộn màn hình mượt mà (Smooth scroll) đưa tiêu đề đó lên đầu trang."),
            ("Đánh dấu mục lục hoạt động khi cuộn trang (Active Section Highlighter)",
             "Bước 1: Người dùng cuộn trang đọc nội dung bài viết.\nBước 2: IntersectionObserver API phát hiện phần tiêu đề h2 đang nằm trong khung nhìn.\nBước 3: Cập nhật highlight màu đỏ trên liên kết mục lục tương ứng ở thanh sidebar.")
        ],
        'user_guide': "1. Truy cập bài viết từ trang danh sách blog hoặc từ trang chủ phần bài viết mới nhất.\n2. Cuộn xuống để đọc nội dung đầy đủ bao gồm ảnh minh họa và thông số kỹ thuật chi tiết.\n3. Click vào các mục ở thanh mục lục bên cạnh để chuyển nhanh đến các phần nội dung cần xem.\n4. Đọc các bài viết liên quan ở cuối trang để khám phá thêm kiến thức thiết kế nội thất."
    },
]

# ==============================================================================
# CLIENT INDEX ENTRIES
# ==============================================================================
client_index_entries = [
    {'stt': 1, 'code': 'SCR_CLI_001', 'name': 'Trang chủ', 'url': '/vi', 'component': 'app/[locale]/page.tsx'},
    {'stt': 2, 'code': 'SCR_CLI_002', 'name': 'Giới thiệu', 'url': '/vi/about', 'component': 'app/[locale]/about/page.tsx'},
    {'stt': 3, 'code': 'SCR_CLI_003', 'name': 'Danh mục Sản phẩm', 'url': '/vi/products', 'component': 'app/[locale]/products/page.tsx'},
    {'stt': 4, 'code': 'SCR_CLI_004', 'name': 'Chi tiết Sản phẩm', 'url': '/vi/products/[slug]', 'component': 'app/[locale]/products/[slug]/page.tsx'},
    {'stt': 5, 'code': 'SCR_CLI_005', 'name': 'Liên hệ', 'url': '/vi/contact', 'component': 'app/[locale]/contact/page.tsx'},
    {'stt': 6, 'code': 'SCR_CLI_006', 'name': 'Liên hệ thành công', 'url': '/vi/contact/success', 'component': 'app/[locale]/contact/success/page.tsx'},
    {'stt': 7, 'code': 'SCR_CLI_007', 'name': 'Khuyến mãi', 'url': '/vi/promotions', 'component': 'app/[locale]/promotions/page.tsx'},
    {'stt': 8, 'code': 'SCR_CLI_008', 'name': 'Hệ thống Showroom', 'url': '/vi/showrooms', 'component': 'app/[locale]/showrooms/page.tsx'},
    {'stt': 9, 'code': 'SCR_CLI_009', 'name': 'Danh sách Blog', 'url': '/vi/blog', 'component': 'app/[locale]/blog/page.tsx'},
    {'stt': 10, 'code': 'SCR_CLI_010', 'name': 'Chi tiết Blog', 'url': '/vi/blog/[slug]', 'component': 'app/[locale]/blog/[slug]/page.tsx'},
]


# ==============================================================================
# ADMIN SCREENS DATA
# ==============================================================================
admin_screens_data = [
    {
        'code': 'SCR_ADM_001', 'slug_name': 'Dang_Nhap', 'name': 'Đăng nhập Admin',
        'url': '/admin/login', 'screenshot': 'admin-login-desktop.png',
        'system_type': 'Admin CMS Portal', 'date': '2026-06-22',
        'component': 'app/admin/login/page.tsx',
        'ui_elements': [
            (1, "Logo và Tên hệ thống", "Brand Header",
             "Logo Phương Đông và tên 'CMS quản trị' đặt trên đỉnh form đăng nhập.",
             "Nhận diện thương hiệu quản trị viên trước khi truy cập."),
            (2, "Trường nhập Email", "Input Text",
             "Input text validate định dạng email, bắt buộc điền.",
             "Xác định tài khoản đăng nhập của nhân sự."),
            (3, "Trường nhập Mật khẩu", "Input Password",
             "Trường nhập mật khẩu ẩn ký tự, bắt buộc điền.",
             "Bảo mật quyền truy cập của quản trị viên."),
            (4, "Nút đăng nhập", "Button Control",
             "Nút submit màu xanh đậm, hiển thị trạng thái xoay tròn khi đang gửi yêu cầu.",
             "Thực hiện xác thực thông tin đăng nhập với Supabase Auth."),
        ],
        'workflows': [
            ("Xác thực đăng nhập admin",
             "Bước 1: Quản trị viên nhập tài khoản email và mật khẩu rồi nhấn 'Đăng nhập'.\nBước 2: Hệ thống gửi thông tin đến Supabase Auth xác thực.\nBước 3: Xác thực thành công, Supabase trả về access token lưu cookie sb-auth-token.\nBước 4: Hệ thống điều hướng sang trang tổng quan /admin.")
        ],
        'user_guide': "1. Truy cập http://localhost:3000/admin/login.\n2. Nhập Email quản trị (ví dụ: admin@phuongdong.vn) và mật khẩu.\n3. Nhấn nút 'Đăng nhập' để truy cập Dashboard quản trị."
    },
    {
        'code': 'SCR_ADM_002', 'slug_name': 'Dashboard', 'name': 'Dashboard Tổng quan',
        'url': '/admin', 'screenshot': 'admin-desktop.png',
        'system_type': 'Admin CMS Portal', 'date': '2026-06-22',
        'component': 'app/admin/page.tsx',
        'ui_elements': [
            (1, "Thanh chỉ mục KPI (KPI Cards)", "KPI Container",
             "Gồm 4 thẻ thống kê: Tổng sản phẩm, Tổng danh mục, Bài viết blog, Yêu cầu báo giá. Mỗi thẻ có màu sắc riêng và icon minh họa.",
             "Xem nhanh quy mô dữ liệu và các yêu cầu báo giá mới chưa xử lý."),
            (2, "Biểu đồ hoạt động kinh doanh (DashboardInsightChart)", "Chart Container",
             "Biểu đồ cột biểu thị doanh số hàng tháng và số lượng khách hàng tiềm năng theo nguồn trang.",
             "Phân tích hiệu quả kinh doanh của website showroom nội thất Phương Đông."),
            (3, "Hộp cảnh báo trạng thái (WarningPanel)", "Notification Alert Panel",
             "Hiển thị danh sách các cảnh báo về thiếu bản dịch hoặc sản phẩm chưa hoàn thiện mô tả.",
             "Nhắc nhở biên tập viên hoàn thành các nội dung chưa tối ưu SEO."),
            (4, "Danh sách yêu cầu báo giá mới (Recent Quotes Table)", "Table Grid",
             "Bảng liệt kê 5 yêu cầu báo giá vừa gửi gần đây nhất kèm Họ tên khách hàng, Số điện thoại và trạng thái xử lý.",
             "Click vào từng dòng để mở trang xử lý báo giá chi tiết."),
        ],
        'workflows': [
            ("Xem nhanh báo giá từ trang tổng quan",
             "Bước 1: Quản trị viên quan sát danh sách báo giá mới ở chân trang Dashboard.\nBước 2: Click vào hàng yêu cầu báo giá của khách hàng cần tư vấn.\nBước 3: Hệ thống điều hướng sang trang chi tiết báo giá tương ứng để xử lý.")
        ],
        'user_guide': "1. Đăng nhập thành công, hệ thống tự động tải trang Dashboard này.\n2. Xem các chỉ số KPI hoạt động của showroom trên đầu trang.\n3. Theo dõi các biểu đồ phân tích để đưa ra quyết định marketing.\n4. Xem bảng yêu cầu báo giá mới để liên hệ ngay với khách hàng."
    },
    {
        'code': 'SCR_ADM_003', 'slug_name': 'QL_San_Pham', 'name': 'Quản lý Sản phẩm',
        'url': '/admin/products', 'screenshot': 'admin-products-desktop.png',
        'system_type': 'Admin CMS Portal', 'date': '2026-06-22',
        'component': 'app/admin/products/page.tsx',
        'ui_elements': [
            (1, "Bộ lọc sản phẩm & Tìm kiếm", "Search Filter Panel",
             "Gồm input tìm theo tên/RefCode, dropdown chọn Danh mục, Thương hiệu, Showroom và Trạng thái xuất bản.",
             "Tìm kiếm nhanh và lọc sản phẩm cần chỉnh sửa real-time trên bảng."),
            (2, "Nút thêm sản phẩm mới", "Button Control",
             "Nút màu xanh 'Thêm sản phẩm' ở góc phải trên cùng.",
             "Mở biểu mẫu dialog tạo mới sản phẩm."),
            (3, "Bảng danh sách sản phẩm (Products Table)", "Table Layout",
             "Bao gồm các cột: Ảnh thu nhỏ, RefCode, Tên sản phẩm, Danh mục, Thương hiệu, Trạng thái, check Nổi bật, và Cột Thao tác (Chỉnh sửa, Xóa).",
             "Hiển thị toàn bộ danh sách sản phẩm trong CSDL. Hỗ trợ hiển thị nhãn màu sắc cho trạng thái xuất bản."),
        ],
        'workflows': [
            ("Tìm kiếm sản phẩm theo mã và danh mục",
             "Bước 1: Quản trị viên nhập RefCode 'PD-S2401' vào ô tìm kiếm.\nBước 2: Chọn danh mục là 'Đồ gỗ nội thất'.\nBước 3: Hệ thống tự động lọc danh sách sản phẩm khớp điều kiện và hiển thị lên bảng.")
        ],
        'user_guide': "1. Chọn 'Sản phẩm' trên menu thanh sidebar bên trái.\n2. Sử dụng thanh tìm kiếm để tìm sản phẩm theo tên hoặc RefCode.\n3. Click nút 'Chỉnh sửa' trên dòng sản phẩm tương ứng để sửa thông tin.\n4. Click nút 'Thêm sản phẩm' để tạo mới thiết kế showroom."
    },
    {
        'code': 'SCR_ADM_004', 'slug_name': 'Tao_Moi_San_Pham', 'name': 'Tạo mới Sản phẩm',
        'url': '/admin/products?new=1', 'screenshot': 'admin-products-new-1-desktop.png',
        'system_type': 'Admin CMS Portal', 'date': '2026-06-22',
        'component': 'app/admin/[section]/page.tsx',
        'ui_elements': [
            (1, "Nút chuyển ngôn ngữ tiếng Anh", "Switch Control",
             "Switch 'Bật dịch thuật tiếng Anh' đặt trên đầu biểu mẫu.",
             "Khi bật, mở thêm cột nhập tiếng Anh song song với tiếng Việt cho Tên, Mô tả, Thông số kỹ thuật."),
            (2, "Trường tiêu đề & mô tả song ngữ", "Bilingual Form Inputs",
             "Các input nhập Tên sản phẩm tiếng Việt/Anh, mô tả ngắn, và trình soạn thảo Tiptap nhập mô tả chi tiết.",
             "Nhập thông tin hiển thị chính của sản phẩm. Slug được tự động sinh."),
            (3, "Khối thuộc tính hệ thống", "Form Controls Group",
             "Chứa trường nhập Giá bán, mã RefCode, dropdown danh mục, thương hiệu, showroom liên kết.",
             "Cấu hình các phân loại liên kết trong CSDL cho sản phẩm."),
            (4, "Khối quản lý hình ảnh", "Media Picker Grid",
             "Nhập URL ảnh bìa chính và các URL ảnh thư viện kèm nút thêm dòng và xóa.",
             "Cấu hình đường dẫn ảnh thực tế hiển thị trên gallery."),
            (5, "Panel Trợ lý AI (AI Assistant Panel)", "AI Panel Container",
             "Cột bên phải. Chứa input nhập chủ đề gợi ý, nút 'AI Tạo nháp sản phẩm' và 'AI Dịch tự động'.",
             "Gọi Gemini API để tự động sinh văn bản mô tả và dịch thuật ngôn ngữ."),
        ],
        'workflows': [
            ("Tự động tạo mô tả sản phẩm bằng AI",
             "Bước 1: Quản trị viên nhập tên sản phẩm tiếng Việt (ví dụ: Sofa gỗ óc chó).\nBước 2: Nhấn nút 'AI Tạo nháp sản phẩm'.\nBước 3: Hệ thống gửi API yêu cầu AI sinh văn bản mô tả.\nBước 4: Nhận kết quả và điền tự động nội dung vào trình soạn thảo Tiptap."),
            ("Dịch tự động sang tiếng Anh bằng AI",
             "Bước 1: Quản trị viên điền đầy đủ các thông tin tiếng Việt.\nBước 2: Nhấp vào nút 'AI Dịch tự động'.\nBước 3: Hệ thống gọi AI thực hiện dịch toàn bộ biểu mẫu và điền vào các trường tiếng Anh.")
        ],
        'user_guide': "1. Khi dialog mở ra, điền tên sản phẩm tiếng Việt.\n2. Chọn danh mục, thương hiệu, dán URL hình ảnh.\n3. Sử dụng 'AI Tạo nháp' và 'AI Dịch tự động' bên cột phải để viết nhanh nội dung.\n4. Đặt trạng thái xuất bản là 'Published' rồi nhấn 'Lưu sản phẩm' để hoàn tất."
    },
    {
        'code': 'SCR_ADM_005', 'slug_name': 'Sua_San_Pham', 'name': 'Chỉnh sửa Sản phẩm',
        'url': '/admin/products?edit=sofa-curve-velour', 'screenshot': 'admin-products-edit-sofa-curve-velour-desktop.png',
        'system_type': 'Admin CMS Portal', 'date': '2026-06-22',
        'component': 'app/admin/[section]/page.tsx',
        'ui_elements': [
            (1, "Form nạp dữ liệu sản phẩm cũ", "Pre-loaded Form Container",
             "Tải toàn bộ thông tin sản phẩm Sofa Curve Velour từ CSDL hiển thị lên các ô nhập liệu tương ứng.",
             "Cho phép quản trị viên xem lại và hiệu chỉnh thông tin chi tiết hiện tại."),
            (2, "Bảng Trợ lý AI & Dịch thuật", "AI Tools Panel",
             "Giữ nguyên công cụ trợ lý AI hỗ trợ sửa đổi hoặc dịch bổ sung các trường còn thiếu.",
             "Hỗ trợ dịch nhanh hoặc tái cấu trúc nội dung mô tả sản phẩm."),
            (3, "Nút Lưu cập nhật", "Submit Button",
             "Nút 'Lưu sản phẩm' màu xanh lá thực hiện lệnh UPDATE trong CSDL.",
             "Cập nhật thông tin sửa đổi lên Supabase và đồng bộ trực tiếp ra ngoài website client."),
        ],
        'workflows': [
            ("Lưu thông tin cập nhật sản phẩm",
             "Bước 1: Quản trị viên chỉnh sửa giá bán từ 45 triệu lên 48 triệu.\nBước 2: Nhấn nút 'Lưu sản phẩm'.\nBước 3: Hệ thống gọi API gửi câu lệnh UPDATE kèm ID sản phẩm tương ứng lên bảng products của Supabase.\nBước 4: Nhận phản hồi thành công, đóng dialog và làm mới danh sách sản phẩm hiển thị.")
        ],
        'user_guide': "1. Nhấn nút 'Chỉnh sửa' trên một sản phẩm tại bảng danh sách.\n2. Đợi biểu mẫu load toàn bộ thông tin cũ của sản phẩm.\n3. Tiến hành sửa đổi thông tin cần thiết (ví dụ: cập nhật lại hình ảnh mới).\n4. Nhấn nút 'Lưu sản phẩm' để lưu thông tin sửa đổi vào CSDL."
    },
    {
        'code': 'SCR_ADM_006', 'slug_name': 'QL_Danh_Muc', 'name': 'Quản lý Danh mục',
        'url': '/admin/categories', 'screenshot': 'admin-categories-desktop.png',
        'system_type': 'Admin CMS Portal', 'date': '2026-06-22',
        'component': 'app/admin/categories/page.tsx',
        'ui_elements': [
            (1, "Lưới danh sách danh mục (Categories Cards)", "Grid Layout",
             "Hiển thị danh sách danh mục dưới dạng card lớn. Mỗi card gồm: Tên danh mục song ngữ, mô tả ngắn, slug, trạng thái, thứ tự hiển thị và số lượng sản phẩm liên kết.",
             "Xem nhanh phân loại sản phẩm và hoạt động của từng danh mục."),
            (2, "Nút tạo danh mục mới", "Button Control",
             "Nút 'Thêm danh mục' ở góc phải trên cùng.",
             "Mở dialog tạo danh mục sản phẩm mới."),
        ],
        'workflows': [
            ("Tải danh sách danh mục từ CSDL",
             "Bước 1: Quản trị viên truy cập trang quản lý danh mục.\nBước 2: Hệ thống truy vấn Supabase bảng product_categories.\nBước 3: Nhận kết quả và tính toán số lượng sản phẩm thuộc từng danh mục.\nBước 4: Hiển thị danh sách danh mục hoàn chỉnh lên lưới giao diện.")
        ],
        'user_guide': "1. Chọn 'Danh mục' trên menu sidebar.\n2. Xem các nhóm danh mục hiện có trên lưới thẻ.\n3. Nhấn 'Thêm danh mục' để tạo nhóm mới hoặc nhấn 'Chỉnh sửa' để sửa thông tin danh mục cũ."
    },
    {
        'code': 'SCR_ADM_007', 'slug_name': 'Tao_Moi_Danh_Muc', 'name': 'Tạo mới Danh mục',
        'url': '/admin/categories?new=1', 'screenshot': 'admin-categories-new-1-desktop.png',
        'system_type': 'Admin CMS Portal', 'date': '2026-06-22',
        'component': 'app/admin/[section]/page.tsx',
        'ui_elements': [
            (1, "Form nhập tên và mô tả song ngữ", "Bilingual Form Inputs",
             "Các input nhập tên danh mục tiếng Việt, tiếng Anh, mô tả tiếng Việt và tiếng Anh.",
             "Thiết lập thông tin hiển thị song ngữ chuyên nghiệp cho danh mục ngoài client."),
            (2, "Trường thứ tự hiển thị & Trạng thái", "Form Controls Group",
             "Nhập số thứ tự sắp xếp (#sort_order) và dropdown chọn trạng thái xuất bản (Draft/Published).",
             "Xác định thứ tự ưu tiên của danh mục trên menu website client."),
            (3, "Nút Lưu", "Submit Button",
             "Nút 'Lưu danh mục' thực hiện chèn dữ liệu mới vào CSDL.",
             "Lưu bản ghi danh mục mới lên bảng product_categories trên Supabase."),
        ],
        'workflows': [
            ("Tạo mới danh mục sản phẩm",
             "Bước 1: Điền Tên tiếng Việt: 'Nội thất gỗ óc chó', Tên tiếng Anh: 'Walnut Furniture'.\nBước 2: Nhấn nút 'Lưu danh mục'.\nBước 3: Hệ thống gọi API chèn bản ghi mới vào bảng product_categories.\nBước 4: Thành công, thông báo hiển thị và reload trang danh mục.")
        ],
        'user_guide': "1. Mở biểu mẫu 'Thêm danh mục' bằng cách nhấn nút tương ứng.\n2. Điền tên song ngữ và nhập mô tả tóm tắt cho danh mục.\n3. Nhập số thứ tự hiển thị trên menu ngoài client (ví dụ: 1, 2, 3).\n4. Nhấn 'Lưu danh mục' để hoàn tất."
    },
    {
        'code': 'SCR_ADM_008', 'slug_name': 'Sua_Danh_Muc', 'name': 'Chỉnh sửa Danh mục',
        'url': '/admin/categories?edit=cat-sofa', 'screenshot': 'admin-categories-edit-cat-sofa-desktop.png',
        'system_type': 'Admin CMS Portal', 'date': '2026-06-22',
        'component': 'app/admin/[section]/page.tsx',
        'ui_elements': [
            (1, "Form nạp thông tin danh mục cũ", "Form Container",
             "Tải dữ liệu danh mục Ghế Sofa da từ Supabase hiển thị lên form chỉnh sửa.",
             "Cho phép hiệu chỉnh tên song ngữ, mô tả, thứ tự sắp xếp và trạng thái của danh mục."),
            (2, "Nút Lưu cập nhật", "Submit Button",
             "Nút màu xanh thực hiện câu lệnh UPDATE trong CSDL.",
             "Cập nhật thông tin sửa đổi của danh mục lên Supabase và đồng bộ ra website."),
        ],
        'workflows': [
            ("Cập nhật thông tin danh mục",
             "Bước 1: Chỉnh sửa lại thứ tự sắp xếp của danh mục từ 1 thành 2.\nBước 2: Nhấn nút 'Lưu'.\nBước 3: Hệ thống gọi API cập nhật bản ghi trong bảng product_categories.\nBước 4: Đóng dialog và cập nhật lại giao diện lưới danh mục.")
        ],
        'user_guide': "1. Nhấn nút 'Chỉnh sửa' trên thẻ danh mục cần sửa đổi.\n2. Tiến hành cập nhật các thông tin cần thiết.\n3. Nhấn 'Lưu' để cập nhật thay đổi vào hệ thống."
    },
    {
        'code': 'SCR_ADM_009', 'slug_name': 'QL_Thuong_Hieu', 'name': 'Quản lý Thương hiệu',
        'url': '/admin/brands', 'screenshot': 'admin-brands-desktop.png',
        'system_type': 'Admin CMS Portal', 'date': '2026-06-22',
        'component': 'app/admin/brands/page.tsx',
        'ui_elements': [
            (1, "Lưới danh sách thương hiệu (Brands Cards)", "Grid Layout",
             "Hiển thị các thương hiệu đối tác liên kết dưới dạng lưới. Mỗi thẻ chứa: Logo thương hiệu, Tên song ngữ, Xuất xứ, Trạng thái, và nút Chỉnh sửa.",
             "Quản lý thông tin nhận diện thương hiệu đối tác trên trang sản phẩm."),
            (2, "Thanh tìm kiếm nhanh", "Search Bar",
             "Input nhập tên thương hiệu để lọc danh sách thẻ phía dưới.",
             "Hỗ trợ tìm kiếm nhanh đối tác trong danh sách."),
            (3, "Nút tạo thương hiệu mới", "Button Control",
             "Nút 'Thêm thương hiệu' ở góc phải trên cùng.",
             "Mở dialog tạo thương hiệu đối tác mới."),
        ],
        'workflows': [
            ("Tải danh sách thương hiệu",
             "Bước 1: Truy cập trang quản lý thương hiệu.\nBước 2: Hệ thống truy vấn Supabase bảng brands.\nBước 3: Hiển thị danh sách logo và thông tin thương hiệu lên lưới.")
        ],
        'user_guide': "1. Chọn 'Thương hiệu' trên menu sidebar.\n2. Xem các đối tác thương hiệu liên kết hiện có.\n3. Sử dụng thanh tìm kiếm để lọc nhanh thương hiệu cần tìm.\n4. Click 'Thêm thương hiệu' để đăng ký đối tác mới."
    },
    {
        'code': 'SCR_ADM_010', 'slug_name': 'Tao_Moi_Thuong_Hieu', 'name': 'Tạo mới Thương hiệu',
        'url': '/admin/brands?new=1', 'screenshot': 'admin-brands-new-1-desktop.png',
        'system_type': 'Admin CMS Portal', 'date': '2026-06-22',
        'component': 'app/admin/[section]/page.tsx',
        'ui_elements': [
            (1, "Form nhập thông tin thương hiệu", "Bilingual Form Inputs",
             "Các trường nhập tên thương hiệu VI/EN, URL ảnh logo, xuất xứ thương hiệu và thứ tự hiển thị.",
             "Thiết lập các thuộc tính cấu hình đối tác thương hiệu."),
            (2, "Dropdown chọn Nhóm danh mục lớn", "Select Dropdown",
             "Chọn nhóm danh mục lớn liên kết chính (ví dụ: Thiết bị vệ sinh - sanitary).",
             "Xác định thương hiệu này sẽ được liệt kê ưu tiên cho nhóm sản phẩm nào."),
            (3, "Nút Lưu", "Submit Button",
             "Nút gửi dữ liệu lưu thương hiệu mới lên bảng brands của Supabase.",
             "Thực hiện lưu dữ liệu vào hệ thống và đóng dialog."),
        ],
        'workflows': [
            ("Đăng ký thương hiệu đối tác mới",
             "Bước 1: Điền Tên: 'Kohler', Xuất xứ: 'Mỹ', dán URL ảnh logo.\nBước 2: Nhấn nút 'Lưu thương hiệu'.\nBước 3: Hệ thống gọi API chèn bản ghi mới vào bảng brands.\nBước 4: Thành công, thông báo hiển thị và reload lưới danh sách thương hiệu.")
        ],
        'user_guide': "1. Mở biểu mẫu 'Thêm thương hiệu'.\n2. Điền tên thương hiệu và dán link ảnh logo của hãng.\n3. Nhập xuất xứ (ví dụ: Đức, Mỹ, Tây Ban Nha) và chọn nhóm ngành hàng liên kết.\n4. Nhấn 'Lưu thương hiệu' để hoàn tất."
    },
    {
        'code': 'SCR_ADM_011', 'slug_name': 'Sua_Thuong_Hieu', 'name': 'Chỉnh sửa Thương hiệu',
        'url': '/admin/brands?edit=american', 'screenshot': 'admin-brands-edit-american-desktop.png',
        'system_type': 'Admin CMS Portal', 'date': '2026-06-22',
        'component': 'app/admin/[section]/page.tsx',
        'ui_elements': [
            (1, "Form nạp thông tin thương hiệu cũ", "Form Container",
             "Tải dữ liệu cũ của thương hiệu American từ Supabase lên các ô nhập liệu tương ứng.",
             "Cho phép hiệu chỉnh tên, logo, xuất xứ và thứ tự hiển thị của thương hiệu."),
            (2, "Nút Lưu cập nhật", "Submit Button",
             "Nút màu xanh gửi câu lệnh UPDATE cập nhật thông tin thương hiệu lên bảng brands.",
             "Đồng bộ thông tin sửa đổi lên CSDL và đóng dialog chỉnh sửa."),
        ],
        'workflows': [
            ("Cập nhật thông tin thương hiệu",
             "Bước 1: Chỉnh sửa lại logo URL của thương hiệu American.\nBước 2: Nhấn nút 'Lưu'.\nBước 3: Hệ thống gọi API cập nhật bản ghi thương hiệu tương ứng trên Supabase.\nBước 4: Đóng dialog và cập nhật lại lưới thương hiệu hiển thị.")
        ],
        'user_guide': "1. Nhấn nút 'Chỉnh sửa' trên thẻ thương hiệu American.\n2. Cập nhật lại thông tin cần thiết trên biểu mẫu.\n3. Nhấn 'Lưu' để cập nhật thay đổi vào CSDL."
    },
    {
        'code': 'SCR_ADM_012', 'slug_name': 'QL_Khuyen_Mai', 'name': 'Quản lý Khuyến mãi',
        'url': '/admin/promotions', 'screenshot': 'admin-promotions-desktop.png',
        'system_type': 'Admin CMS Portal', 'date': '2026-06-22',
        'component': 'app/admin/[section]/page.tsx',
        'ui_elements': [
            (1, "Lưới danh sách chương trình & Mã giảm giá (Promotion Cards)", "Grid Layout",
             "Hiển thị danh sách các chương trình khuyến mãi và coupon mã giảm giá hiện có. Mỗi thẻ gồm: Mã code, loại giảm giá, giá trị giảm, thời hạn, mô tả và trạng thái hoạt động.",
             "Theo dõi và quản lý các chiến dịch khuyến mãi, mã giảm giá của cửa hàng."),
            (2, "Nút tạo khuyến mãi mới", "Button Control",
             "Nút 'Thêm khuyến mãi' ở góc phải trên cùng.",
             "Mở dialog tạo chiến dịch/mã giảm giá mới."),
        ],
        'workflows': [
            ("Tải danh sách khuyến mãi",
             "Bước 1: Truy cập trang quản lý khuyến mãi.\nBước 2: Hệ thống truy vấn Supabase lấy danh sách từ bảng promotions/coupons.\nBước 3: Hiển thị danh sách chiến dịch khuyến mãi lên lưới thẻ.")
        ],
        'user_guide': "1. Chọn 'Khuyến mãi' trên menu sidebar.\n2. Xem các mã giảm giá hiện tại cùng hạn sử dụng tương ứng.\n3. Click 'Chỉnh sửa' để sửa đổi thông tin coupon hoặc click 'Thêm khuyến mãi' để tạo mã mới."
    },
    {
        'code': 'SCR_ADM_013', 'slug_name': 'Tao_Moi_Khuyen_Mai', 'name': 'Tạo mới Khuyến mãi',
        'url': '/admin/promotions?new=1', 'screenshot': 'admin-promotions-new-1-desktop.png',
        'system_type': 'Admin CMS Portal', 'date': '2026-06-22',
        'component': 'app/admin/[section]/page.tsx',
        'ui_elements': [
            (1, "Form cấu hình mã giảm giá (Coupon Config)", "Form Inputs",
             "Chứa các trường: Mã coupon (PHUONGDONG10), Loại giảm giá (Dropdown), Giá trị giảm (Input số), Giá trị đơn áp dụng tối thiểu, Ngày hết hạn.",
             "Cấu hình các điều kiện áp dụng và giá trị chiết khấu của mã giảm giá."),
            (2, "Trường mô tả chi tiết & Trạng thái", "Form Controls Group",
             "Nhập mô tả điều kiện áp dụng bằng tiếng Việt và chọn trạng thái hoạt động (Active/Expired).",
             "Cung cấp thông tin hiển thị giải thích cho khách hàng ngoài trang khuyến mãi."),
            (3, "Nút Lưu", "Submit Button",
             "Nút màu xanh gửi dữ liệu tạo mới mã giảm giá lên bảng coupons của Supabase.",
             "Lưu dữ liệu và làm mới trang quản lý khuyến mãi."),
        ],
        'workflows': [
            ("Tạo mới mã giảm giá",
             "Bước 1: Nhập mã coupon: 'WELLNESS25', loại: percent, giá trị: 25, giá trị tối thiểu: 30,000,000.\nBước 2: Nhấn nút 'Lưu khuyến mãi'.\nBước 3: Hệ thống gọi API chèn bản ghi mới vào bảng coupons.\nBước 4: Thành công, thông báo hiển thị và reload trang danh sách.")
        ],
        'user_guide': "1. Mở biểu mẫu 'Thêm khuyến mãi'.\n2. Nhập mã code giảm giá (viết hoa không dấu), chọn hình thức giảm (phần trăm hoặc số tiền cố định).\n3. Nhập giá trị giảm và ngưỡng đơn hàng tối thiểu cần thiết để áp dụng mã.\n4. Chọn ngày hết hạn và nhấn 'Lưu khuyến mãi' để kích hoạt mã."
    },
    {
        'code': 'SCR_ADM_014', 'slug_name': 'Sua_Khuyen_Mai', 'name': 'Chỉnh sửa Khuyến mãi',
        'url': '/admin/promotions?edit=PHUONGDONG10', 'screenshot': 'admin-promotions-edit-PHUONGDONG10-desktop.png',
        'system_type': 'Admin CMS Portal', 'date': '2026-06-22',
        'component': 'app/admin/[section]/page.tsx',
        'ui_elements': [
            (1, "Form nạp thông tin mã giảm giá cũ", "Form Container",
             "Tải toàn bộ cấu hình cũ của mã PHUONGDONG10 hiển thị lên form chỉnh sửa.",
             "Cho phép hiệu chỉnh giá trị giảm, hạn sử dụng và mô tả điều kiện áp dụng."),
            (2, "Nút Lưu cập nhật", "Submit Button",
             "Nút màu xanh gửi câu lệnh UPDATE cập nhật thông tin mã giảm giá lên bảng coupons.",
             "Cập nhật thông tin và làm mới lưới danh sách khuyến mãi hiển thị."),
        ],
        'workflows': [
            ("Cập nhật thông tin mã giảm giá",
             "Bước 1: Chỉnh sửa lại ngày hết hạn của mã PHUONGDONG10 sang cuối năm 2026.\nBước 2: Nhấn nút 'Lưu'.\nBước 3: Hệ thống gọi API cập nhật bản ghi tương ứng trên Supabase.\nBước 4: Đóng dialog và tải lại lưới khuyến mãi.")
        ],
        'user_guide': "1. Nhấn nút 'Chỉnh sửa' trên thẻ mã giảm giá PHUONGDONG10.\n2. Thay đổi hạn sử dụng hoặc giá trị tối thiểu của mã.\n3. Nhấn 'Lưu' để hoàn tất quá trình cập nhật thông tin mã."
    },
    {
        'code': 'SCR_ADM_015', 'slug_name': 'QL_Blog', 'name': 'Quản lý Bài viết',
        'url': '/admin/blog', 'screenshot': 'admin-blog-desktop.png',
        'system_type': 'Admin CMS Portal', 'date': '2026-06-22',
        'component': 'app/admin/blog/page.tsx',
        'ui_elements': [
            (1, "Bảng danh sách bài viết blog (Articles Table)", "Table Layout",
             "Liệt kê các bài viết trong hệ thống gồm các cột: Ảnh bìa đại diện, Tiêu đề bài viết (Song ngữ), Chuyên mục, Trạng thái (Draft/Published pill), Ngày viết, và Cột Thao tác.",
             "Hiển thị danh sách tất cả các bài viết cẩm nang nội thất và cẩm nang thiết kế."),
            (2, "Thanh bộ lọc bài viết", "Filter Panel",
             "Input tìm theo tiêu đề bài viết và dropdown lọc bài viết theo chuyên mục liên kết.",
             "Giúp quản trị viên dễ dàng quản lý và định vị bài viết cần sửa đổi."),
            (3, "Nút viết bài mới", "Button Control",
             "Nút 'Viết bài mới' màu xanh ở góc phải trên cùng trang.",
             "Mở dialog tạo bài viết cẩm nang mới."),
        ],
        'workflows': [
            ("Tải danh sách bài viết từ CSDL",
             "Bước 1: Truy cập trang quản lý bài viết.\nBước 2: Hệ thống truy vấn Supabase lấy danh sách bài viết từ bảng blog_posts.\nBước 3: Render danh sách bài viết kèm chuyên mục và hình ảnh lên bảng.")
        ],
        'user_guide': "1. Chọn 'Bài viết' trên menu sidebar.\n2. Quan sát danh sách bài viết và chuyên mục tương ứng trên bảng.\n3. Click 'Chỉnh sửa' ở dòng bài viết để hiệu chỉnh nội dung hoặc click 'Viết bài mới' để tạo nội dung cẩm nang mới."
    },
    {
        'code': 'SCR_ADM_016', 'slug_name': 'Tao_Moi_Blog', 'name': 'Tạo mới Bài viết',
        'url': '/admin/blog?new=1', 'screenshot': 'admin-blog-new-1-desktop.png',
        'system_type': 'Admin CMS Portal', 'date': '2026-06-22',
        'component': 'app/admin/[section]/page.tsx',
        'ui_elements': [
            (1, "Form tiêu đề & mô tả ngắn song ngữ", "Bilingual Form Inputs",
             "Các input nhập tiêu đề bài viết tiếng Việt/Anh, mô tả ngắn tiếng Việt/Anh và đường dẫn slug tự động sinh.",
             "Nhập thông tin nhận diện cốt lõi của bài viết cẩm nang."),
            (2, "Trình soạn thảo nội dung Rich Text (Tiptap Editor)", "Rich Text Editor",
             "Trình soạn thảo Tiptap nhập nội dung chi tiết bài viết song ngữ VI/EN. Hỗ trợ chèn tiêu đề h2/h3 (để sinh mục lục tự động ngoài client), định dạng chữ, chèn link và ảnh minh họa.",
             "Biên tập nội dung kiến thức thiết kế nội thất phong phú."),
            (3, "Khối cấu hình bài viết", "Form Controls Group",
             "Chứa dropdown chọn Chuyên mục bài viết, ô nhập link ảnh bìa chính (Cover Image URL) và dropdown trạng thái xuất bản.",
             "Cấu hình các phân loại và đường dẫn ảnh hiển thị của bài viết."),
            (4, "Nút Lưu", "Submit Button",
             "Nút gửi dữ liệu bài viết mới lưu lên bảng blog_posts của Supabase.",
             "Lưu dữ liệu và làm mới trang quản lý bài viết."),
        ],
        'workflows': [
            ("Viết bài viết mới và xuất bản",
             "Bước 1: Điền Tiêu đề: 'Bí quyết phối màu phòng ngủ', chọn chuyên mục 'Kiến thức thiết kế'.\nBước 2: Sử dụng editor Tiptap soạn thảo nội dung có chia tiêu đề h2/h3.\nBước 3: Click 'Lưu bài viết' gửi request chèn bản ghi mới vào CSDL.\nBước 4: Thành công, đóng dialog và hiển thị bài viết ngoài trang danh sách blog.")
        ],
        'user_guide': "1. Mở biểu mẫu 'Viết bài mới'.\n2. Nhập tiêu đề bài viết và mô tả tóm tắt.\n3. Soạn thảo nội dung chi tiết bài viết trong khung soạn thảo Tiptap. Sử dụng định dạng Heading 2 cho các tiêu đề chính trong bài.\n4. Chọn ảnh đại diện và nhấn 'Lưu bài viết' để xuất bản lên website."
    },
    {
        'code': 'SCR_ADM_017', 'slug_name': 'Sua_Blog', 'name': 'Chỉnh sửa Bài viết',
        'url': '/admin/blog?edit=bi-quyet-chon-go-oc-cho', 'screenshot': 'admin-blog-edit-bi-quyet-chon-go-oc-cho-desktop.png',
        'system_type': 'Admin CMS Portal', 'date': '2026-06-22',
        'component': 'app/admin/[section]/page.tsx',
        'ui_elements': [
            (1, "Form nạp nội dung bài viết cũ", "Pre-loaded Form Container",
             "Tải toàn bộ nội dung bài viết 'Bí quyết chọn gỗ óc chó' hiển thị lên form soạn thảo.",
             "Cho phép biên tập viên xem lại và hiệu chỉnh nội dung chi tiết bài viết đã đăng."),
            (2, "Nút Lưu cập nhật", "Submit Button",
             "Nút màu xanh gửi câu lệnh UPDATE cập nhật nội dung bài viết lên bảng blog_posts.",
             "Lưu thông tin sửa đổi và đồng bộ thay đổi ra trang chi tiết blog ngoài client."),
        ],
        'workflows': [
            ("Cập nhật nội dung bài viết",
             "Bước 1: Chỉnh sửa lại một đoạn văn bản trong nội dung bài viết.\nBước 2: Nhấn nút 'Lưu bài viết'.\nBước 3: Hệ thống gọi API gửi UPDATE lên bảng blog_posts của Supabase.\nBước 4: Đóng dialog và tải lại danh sách bài viết.")
        ],
        'user_guide': "1. Nhấn nút 'Chỉnh sửa' trên bài viết 'Bí quyết chọn gỗ óc chó' tại danh sách bài viết.\n2. Thực hiện sửa đổi nội dung văn bản hoặc thay ảnh minh họa trong Tiptap.\n3. Nhấn 'Lưu bài viết' để cập nhật thay đổi trực tiếp lên hệ thống."
    },
    {
        'code': 'SCR_ADM_018', 'slug_name': 'QL_Showroom', 'name': 'Quản lý Showroom',
        'url': '/admin/showrooms', 'screenshot': 'admin-showrooms-desktop.png',
        'system_type': 'Admin CMS Portal', 'date': '2026-06-22',
        'component': 'app/admin/showrooms/page.tsx',
        'ui_elements': [
            (1, "Lưới danh sách showroom (Showrooms Grid)", "Grid Layout",
             "Hiển thị các showroom hiện có dưới dạng lưới. Mỗi thẻ chứa: Tên chi nhánh song ngữ, Địa chỉ, Hotline liên hệ, Giờ mở cửa, Ảnh đại diện, và nút Chỉnh sửa.",
             "Quản lý thông tin hiển thị các địa điểm showroom Phương Đông trên trang liên hệ."),
            (2, "Nút tạo showroom mới", "Button Control",
             "Nút 'Thêm showroom' ở góc phải trên cùng trang.",
             "Mở dialog tạo địa điểm showroom mới."),
        ],
        'workflows': [
            ("Tải danh sách showroom",
             "Bước 1: Quản trị viên truy cập trang quản lý showroom.\nBước 2: Hệ thống truy vấn Supabase bảng showrooms.\nBước 3: Hiển thị danh sách địa chỉ showroom lên lưới.")
        ],
        'user_guide': "1. Chọn 'Showroom' trên menu sidebar.\n2. Quan sát các chi nhánh showroom hiện tại trên hệ thống.\n3. Click 'Chỉnh sửa' để đổi địa chỉ, hotline hoặc click 'Thêm showroom' để tạo chi nhánh mới."
    },
    {
        'code': 'SCR_ADM_019', 'slug_name': 'Tao_Moi_Showroom', 'name': 'Tạo mới Showroom',
        'url': '/admin/showrooms?new=1', 'screenshot': 'admin-showrooms-new-1-desktop.png',
        'system_type': 'Admin CMS Portal', 'date': '2026-06-22',
        'component': 'app/admin/[section]/page.tsx',
        'ui_elements': [
            (1, "Form nhập thông tin showroom song ngữ", "Bilingual Form Inputs",
             "Các trường nhập Tên showroom VI/EN, Địa chỉ chi tiết VI/EN, Hotline, Giờ mở cửa VI/EN, và mã code showroom.",
             "Cấu hình thông tin liên lạc và định danh của chi nhánh showroom."),
            (2, "Trường bản đồ nhúng Google Maps", "Map Config Inputs",
             "Các input nhập URL nhúng bản đồ (iframe src) và URL bản đồ dự phòng (Google Maps link).",
             "Cấu hình bản đồ định vị giúp khách hàng tìm đường đi trực quan ngoài client."),
            (3, "Nút Lưu", "Submit Button",
             "Nút màu xanh gửi dữ liệu tạo showroom mới lên bảng showrooms của Supabase.",
             "Thực hiện lưu dữ liệu và làm mới trang quản lý showroom."),
        ],
        'workflows': [
            ("Đăng ký chi nhánh showroom mới",
             "Bước 1: Điền Tên: 'Showroom Cầu Giấy', Hotline: '1900 1234', dán URL iframe Google Maps.\nBước 2: Nhấn nút 'Lưu showroom'.\nBước 3: Hệ thống gọi API chèn bản ghi mới vào bảng showrooms.\nBước 4: Thành công, thông báo hiển thị và reload trang danh sách showroom.")
        ],
        'user_guide': "1. Mở biểu mẫu 'Thêm showroom'.\n2. Nhập tên showroom, hotline và giờ mở cửa.\n3. Dán liên kết nhúng Google Maps iframe (lấy từ tính năng Chia sẻ bản đồ của Google Maps).\n4. Dán link ảnh đại diện showroom và nhấn 'Lưu showroom' để xuất bản."
    },
    {
        'code': 'SCR_ADM_020', 'slug_name': 'Sua_Showroom', 'name': 'Chỉnh sửa Showroom',
        'url': '/admin/showrooms?edit=HN', 'screenshot': 'admin-showrooms-edit-HN-desktop.png',
        'system_type': 'Admin CMS Portal', 'date': '2026-06-22',
        'component': 'app/admin/[section]/page.tsx',
        'ui_elements': [
            (1, "Form nạp thông tin showroom cũ", "Form Container",
             "Tải toàn bộ cấu hình cũ của showroom Hà Nội (HN) hiển thị lên form chỉnh sửa.",
             "Cho phép hiệu chỉnh tên song ngữ, địa chỉ, hotline, giờ mở cửa và URL bản đồ nhúng."),
            (2, "Nút Lưu cập nhật", "Submit Button",
             "Nút màu xanh gửi câu lệnh UPDATE cập nhật thông tin showroom lên bảng showrooms.",
             "Đồng bộ thông tin sửa đổi lên CSDL và đóng dialog chỉnh sửa."),
        ],
        'workflows': [
            ("Cập nhật thông tin showroom",
             "Bước 1: Chỉnh sửa lại số điện thoại hotline của showroom Hà Nội.\nBước 2: Nhấn nút 'Lưu'.\nBước 3: Hệ thống gọi API cập nhật bản ghi tương ứng trên Supabase.\nBước 4: Đóng dialog và tải lại danh sách showroom.")
        ],
        'user_guide': "1. Nhấn nút 'Chỉnh sửa' trên thẻ showroom Hà Nội (HN).\n2. Tiến hành cập nhật lại hotline hoặc đổi ảnh đại diện mới cho showroom.\n3. Nhấn 'Lưu' để cập nhật thay đổi."
    },
    {
        'code': 'SCR_ADM_021', 'slug_name': 'QL_Bao_Gia', 'name': 'Quản lý Báo giá',
        'url': '/admin/quotes', 'screenshot': 'admin-quotes-desktop.png',
        'system_type': 'Admin CMS Portal', 'date': '2026-06-22',
        'component': 'app/admin/[section]/page.tsx',
        'ui_elements': [
            (1, "Bảng danh sách yêu cầu báo giá (Quotes Table)", "Table Layout",
             "Liệt kê các yêu cầu gửi từ khách hàng gồm các cột: Họ tên, Số điện thoại, Email, Sản phẩm quan tâm, Địa chỉ công trình, Trạng thái xử lý (Chưa liên hệ/Đã liên hệ/Đã báo giá), và Nút xử lý.",
             "Hiển thị thông tin khách hàng tiềm năng gửi từ website client."),
            (2, "Hộp thoại xử lý báo giá (Status Update Dialog)", "Modal Overlay",
             "Dialog hiện lên khi click xử lý. Cho phép đổi trạng thái xử lý và nhập ghi chú trao đổi với khách hàng (ví dụ: khách muốn đổi gỗ sồi sang gỗ óc chó).",
             "Ghi nhận nhật ký tương tác của nhân viên kinh doanh đối với khách hàng."),
        ],
        'workflows': [
            ("Cập nhật trạng thái xử lý yêu cầu báo giá",
             "Bước 1: Nhân viên kinh doanh click chọn xử lý trên dòng yêu cầu báo giá của khách hàng.\nBước 2: Liên hệ điện thoại tư vấn trực tiếp cho khách hàng theo số điện thoại ghi trên bảng.\nBước 3: Chọn trạng thái xử lý mới là 'Đã báo giá' và nhập ghi chú tư vấn vào form.\nBước 4: Click 'Lưu' để gửi API cập nhật trạng thái bản ghi trong bảng quotes.\nBước 5: Hệ thống reload bảng danh sách báo giá cập nhật trạng thái mới nhất.")
        ],
        'user_guide': "1. Chọn 'Yêu cầu báo giá' trên menu sidebar.\n2. Quan sát các yêu cầu báo giá mới nhất của khách hàng được liệt kê trên bảng.\n3. Click vào nút xử lý trên dòng tương ứng để mở hộp thoại cập nhật trạng thái sau khi đã liên hệ tư vấn thành công với khách hàng."
    },
    {
        'code': 'SCR_ADM_022', 'slug_name': 'QL_Nguoi_Dung', 'name': 'Quản lý Người dùng',
        'url': '/admin/users', 'screenshot': 'admin-users-desktop.png',
        'system_type': 'Admin CMS Portal', 'date': '2026-06-22',
        'component': 'app/admin/users/page.tsx',
        'ui_elements': [
            (1, "Bảng danh sách nhân sự (Users Table)", "Table Layout",
             "Liệt kê tài khoản nhân viên vận hành gồm các cột: Tên hiển thị, Email tài khoản, Vai trò (Admin/Editor), Ngày tạo, Trạng thái kích hoạt (Active/Inactive), và Nút Phân quyền.",
             "Quản trị tài khoản nhân sự có quyền truy cập hệ thống quản trị."),
            (2, "Nút Thêm người dùng mới", "Button Control",
             "Nút màu xanh 'Thêm người dùng' ở góc phải trên cùng.",
             "Mở biểu mẫu dialog đăng ký tài khoản nhân viên mới."),
        ],
        'workflows': [
            ("Tải danh sách tài khoản nhân sự",
             "Bước 1: Admin truy cập trang người dùng.\nBước 2: Hệ thống truy vấn Supabase lấy thông tin các tài khoản trong bảng profiles.\nBước 3: Hiển thị danh sách nhân sự kèm trạng thái phân quyền lên bảng.")
        ],
        'user_guide': "1. Chọn 'Người dùng' trên menu sidebar (chỉ khả dụng với tài khoản vai trò Admin).\n2. Quan sát danh sách nhân sự vận hành trên bảng.\n3. Click nút chỉnh sửa ở cột thao tác để thay đổi vai trò hoặc khóa tài khoản nhân sự."
    },
    {
        'code': 'SCR_ADM_023', 'slug_name': 'Tao_Sua_Nguoi_Dung', 'name': 'Tạo/Sửa Người dùng',
        'url': '/admin/users?new=1', 'screenshot': 'admin-users-new-1-desktop.png',
        'system_type': 'Admin CMS Portal', 'date': '2026-06-22',
        'component': 'app/admin/[section]/page.tsx',
        'ui_elements': [
            (1, "Form đăng ký tài khoản nhân sự mới", "Form Inputs",
             "Chứa các trường: Tên hiển thị, Email đăng nhập, Mật khẩu khởi tạo, Dropdown chọn Vai trò (Admin/Editor).",
             "Cấu hình thông tin tài khoản đăng nhập cho nhân viên."),
            (2, "Hộp thoại Phân quyền & Khóa tài khoản (Edit User Modal)", "Modal Overlay",
             "Mở ra khi chỉnh sửa nhân sự. Chứa dropdown chọn vai trò quản trị (Admin hoặc Editor) và switch bật/tắt kích hoạt hoạt động tài khoản (Active/Inactive).",
             "Cho phép Admin nhanh chóng thay đổi vai trò hoặc đình chỉ quyền truy cập của nhân viên."),
            (3, "Nút Lưu", "Submit Button",
             "Nút gửi yêu cầu API cập nhật/tạo mới tài khoản lên Supabase.",
             "Thực hiện lưu dữ liệu và reload danh sách nhân viên."),
        ],
        'workflows': [
            ("Thay đổi vai trò và khóa tài khoản nhân viên",
             "Bước 1: Admin click chỉnh sửa tài khoản nhân sự 'Lê Hồng Hạnh'.\nBước 2: Chuyển vai trò sang 'Editor' và gạt switch trạng thái sang 'Inactive'.\nBước 3: Click 'Lưu thay đổi'.\nBước 4: Hệ thống gọi API cập nhật trạng thái trong bảng profiles của Supabase.\nBước 5: Reload bảng danh sách người dùng hiển thị thông tin cập nhật.")
        ],
        'user_guide': "1. Nhấn nút chỉnh sửa trên một nhân sự tại bảng danh sách người dùng.\n2. Chọn lại vai trò (Admin hoặc Biên tập viên) cho nhân viên.\n3. Tắt switch kích hoạt nếu muốn khóa quyền truy cập của tài khoản đó.\n4. Nhấn 'Lưu thay đổi' để hoàn tất cập nhật phân quyền."
    },
    {
        'code': 'SCR_ADM_024', 'slug_name': 'Cau_Hinh_He_Thong', 'name': 'Cấu hình Hệ thống',
        'url': '/admin/settings', 'screenshot': 'admin-settings-desktop.png',
        'system_type': 'Admin CMS Portal', 'date': '2026-06-22',
        'component': 'app/admin/settings/page.tsx',
        'ui_elements': [
            (1, "Khối cấu hình Thông tin liên hệ", "Form Container",
             "Các trường nhập Tên công ty showroom, Số hotline chính, Email liên hệ, Địa chỉ văn phòng chính, các liên kết mạng xã hội (Facebook, Instagram, Zalo URL).",
             "Quản trị các thông tin liên hệ tĩnh đồng bộ hiển thị ở Header/Footer và trang liên hệ của khách hàng."),
            (2, "Khối cấu hình Metadata SEO mặc định", "Form Container",
             "Các trường nhập Tiêu đề SEO mặc định (metaTitleDefault) và mô tả SEO mặc định (metaDescriptionDefault) cho toàn trang.",
             "Quản trị thẻ meta tiêu đề và mô tả mặc định phục vụ cho bot tìm kiếm Google/Bing tối ưu SEO."),
            (3, "Khối cấu hình Trí tuệ nhân tạo (AI Settings)", "Form Container",
             "Chứa dropdown chọn mô hình AI (gemini-1.5-pro, gemini-2.5-flash) và ô nhập khóa bảo mật API Key (được mã hóa hiển thị dạng dấu *).",
             "Cấu hình kết nối API của trợ lý AI phục vụ cho việc sinh mô tả sản phẩm tự động và dịch thuật."),
            (4, "Nút Lưu cấu hình", "Submit Button",
             "Nút màu xanh lục lưu toàn bộ thông tin cấu hình vào bảng site_settings của Supabase.",
             "Đồng bộ toàn bộ các thiết lập hệ thống và áp dụng ngay lập tức ngoài website client."),
        ],
        'workflows': [
            ("Cập nhật cấu hình hotline và email hệ thống",
             "Bước 1: Quản trị viên nhập số hotline mới: '1900 9999' và email hỗ trợ mới.\nBước 2: Nhấn nút 'Lưu cấu hình'.\nBước 3: Hệ thống gọi API cập nhật các giá trị cấu hình tương ứng trong bảng site_settings của Supabase.\nBước 4: Hệ thống xác nhận lưu thành công, các thông tin hotline trên Header và Footer ngoài client được cập nhật hiển thị ngay lập tức.")
        ],
        'user_guide': "1. Chọn 'Cài đặt' trên menu sidebar.\n2. Cập nhật lại số hotline, địa chỉ hoặc email hỗ trợ của showroom khi có thay đổi.\n3. Nhập mô tả SEO mới cho website của công ty giúp tối ưu từ khóa Google.\n4. Nhấn nút 'Lưu cấu hình' để hoàn tất quá trình cài đặt hệ thống."
    },
]

# ==============================================================================
# ADMIN INDEX ENTRIES
# ==============================================================================
admin_index_entries = [
    {'stt': 1, 'code': 'SCR_ADM_001', 'name': 'Đăng nhập Admin', 'url': '/admin/login', 'component': 'app/admin/login/page.tsx'},
    {'stt': 2, 'code': 'SCR_ADM_002', 'name': 'Dashboard Tổng quan', 'url': '/admin', 'component': 'app/admin/page.tsx'},
    {'stt': 3, 'code': 'SCR_ADM_003', 'name': 'Quản lý Sản phẩm', 'url': '/admin/products', 'component': 'app/admin/products/page.tsx'},
    {'stt': 4, 'code': 'SCR_ADM_004', 'name': 'Tạo mới Sản phẩm', 'url': '/admin/products?new=1', 'component': 'app/admin/[section]/page.tsx'},
    {'stt': 5, 'code': 'SCR_ADM_005', 'name': 'Chỉnh sửa Sản phẩm', 'url': '/admin/products?edit=sofa-curve-velour', 'component': 'app/admin/[section]/page.tsx'},
    {'stt': 6, 'code': 'SCR_ADM_006', 'name': 'Quản lý Danh mục', 'url': '/admin/categories', 'component': 'app/admin/categories/page.tsx'},
    {'stt': 7, 'code': 'SCR_ADM_007', 'name': 'Tạo mới Danh mục', 'url': '/admin/categories?new=1', 'component': 'app/admin/[section]/page.tsx'},
    {'stt': 8, 'code': 'SCR_ADM_008', 'name': 'Chỉnh sửa Danh mục', 'url': '/admin/categories?edit=cat-sofa', 'component': 'app/admin/[section]/page.tsx'},
    {'stt': 9, 'code': 'SCR_ADM_009', 'name': 'Quản lý Thương hiệu', 'url': '/admin/brands', 'component': 'app/admin/brands/page.tsx'},
    {'stt': 10, 'code': 'SCR_ADM_010', 'name': 'Tạo mới Thương hiệu', 'url': '/admin/brands?new=1', 'component': 'app/admin/[section]/page.tsx'},
    {'stt': 11, 'code': 'SCR_ADM_011', 'name': 'Chỉnh sửa Thương hiệu', 'url': '/admin/brands?edit=american', 'component': 'app/admin/[section]/page.tsx'},
    {'stt': 12, 'code': 'SCR_ADM_012', 'name': 'Quản lý Khuyến mãi', 'url': '/admin/promotions', 'component': 'app/admin/[section]/page.tsx'},
    {'stt': 13, 'code': 'SCR_ADM_013', 'name': 'Tạo mới Khuyến mãi', 'url': '/admin/promotions?new=1', 'component': 'app/admin/[section]/page.tsx'},
    {'stt': 14, 'code': 'SCR_ADM_014', 'name': 'Chỉnh sửa Khuyến mãi', 'url': '/admin/promotions?edit=PHUONGDONG10', 'component': 'app/admin/[section]/page.tsx'},
    {'stt': 15, 'code': 'SCR_ADM_015', 'name': 'Quản lý Bài viết', 'url': '/admin/blog', 'component': 'app/admin/blog/page.tsx'},
    {'stt': 16, 'code': 'SCR_ADM_016', 'name': 'Tạo mới Bài viết', 'url': '/admin/blog?new=1', 'component': 'app/admin/[section]/page.tsx'},
    {'stt': 17, 'code': 'SCR_ADM_017', 'name': 'Chỉnh sửa Bài viết', 'url': '/admin/blog?edit=bi-quyet-chon-go-oc-cho', 'component': 'app/admin/[section]/page.tsx'},
    {'stt': 18, 'code': 'SCR_ADM_018', 'name': 'Quản lý Showroom', 'url': '/admin/showrooms', 'component': 'app/admin/showrooms/page.tsx'},
    {'stt': 19, 'code': 'SCR_ADM_019', 'name': 'Tạo mới Showroom', 'url': '/admin/showrooms?new=1', 'component': 'app/admin/[section]/page.tsx'},
    {'stt': 20, 'code': 'SCR_ADM_020', 'name': 'Chỉnh sửa Showroom', 'url': '/admin/showrooms?edit=HN', 'component': 'app/admin/[section]/page.tsx'},
    {'stt': 21, 'code': 'SCR_ADM_021', 'name': 'Quản lý Yêu cầu Báo giá', 'url': '/admin/quotes', 'component': 'app/admin/[section]/page.tsx'},
    {'stt': 22, 'code': 'SCR_ADM_022', 'name': 'Quản lý Người dùng', 'url': '/admin/users', 'component': 'app/admin/users/page.tsx'},
    {'stt': 23, 'code': 'SCR_ADM_023', 'name': 'Tạo/Sửa Người dùng', 'url': '/admin/users?new=1', 'component': 'app/admin/[section]/page.tsx'},
    {'stt': 24, 'code': 'SCR_ADM_024', 'name': 'Cấu hình Hệ thống', 'url': '/admin/settings', 'component': 'app/admin/settings/page.tsx'},
]
