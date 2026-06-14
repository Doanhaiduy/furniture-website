export type MockQuote = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  company: string | null;
  service: string | null;
  message: string;
  preferred_locale: string;
  product_id: string | null;
  category_id: string | null;
  source_path: string;
  source_url: string | null;
  status: "new" | "contacted" | "qualified" | "closed" | "spam" | "archived";
  assigned_to: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export const mockQuotes: MockQuote[] = [
  {
    id: "QR-202606-001",
    full_name: "Nguyễn Văn Hùng",
    phone: "0912345678",
    email: "hung.nguyen@gmail.com",
    company: "Công ty Thiết kế T&T",
    service: "Báo giá dự án biệt thự",
    message: "Tôi cần nhận báo giá chi tiết và hồ sơ năng lực của các sản phẩm sofa gỗ óc chó Heritage và bàn ăn nguyên tấm Atelier cho dự án biệt thự tại Vinhomes Ocean Park.",
    preferred_locale: "vi",
    product_id: "sofa-walnut-heritage-pd-1",
    category_id: "cat-sofa",
    source_path: "/vi/products/sofa-walnut-heritage-pd-1",
    source_url: "http://localhost:3000/vi/products/sofa-walnut-heritage-pd-1",
    status: "new",
    assigned_to: "Chưa phân công",
    admin_notes: null,
    created_at: "2026-06-09T08:30:00Z",
    updated_at: "2026-06-09T08:30:00Z",
    deleted_at: null
  },
  {
    id: "QR-202606-002",
    full_name: "Trần Thị Lan Anh",
    phone: "0987654321",
    email: "lananh.tran@yahoo.com",
    company: null,
    service: "Tư vấn phối vật liệu",
    message: "Xin chào showroom, tôi muốn được tư vấn chọn gạch lát nền vân đá Calacatta phối cùng tủ bếp gỗ sồi cho căn hộ chung cư 95m2 tại Landmark 81.",
    preferred_locale: "vi",
    product_id: null,
    category_id: "cat-floor",
    source_path: "/vi/contact",
    source_url: "http://localhost:3000/vi/contact",
    status: "contacted",
    assigned_to: "Lê Hồng Hạnh",
    admin_notes: "Đã liên hệ lần 1 qua Zalo, gửi mẫu gạch vân đá Calacatta Gold và gỗ sồi trắng. Khách hàng đang bàn bạc lại với gia đình.",
    created_at: "2026-06-08T14:20:00Z",
    updated_at: "2026-06-08T16:00:00Z",
    deleted_at: null
  },
  {
    id: "QR-202606-003",
    full_name: "David Beckham",
    phone: "0909998887",
    email: "david.beck@outlook.com",
    company: "Weston Capital",
    service: "Project solutions",
    message: "Interested in bulk purchasing Kohler Veil intelligent toilets and Grohe gold-plated showers for a boutique hotel renovation project in Danang. Need quotation and shipping info.",
    preferred_locale: "en",
    product_id: "toilet-intelligent-pd-6",
    category_id: "cat-toilet",
    source_path: "/en/products/toilet-intelligent-pd-6",
    source_url: "http://localhost:3000/en/products/toilet-intelligent-pd-6",
    status: "qualified",
    assigned_to: "KTS. Hoàng Minh Quân",
    admin_notes: "Qualified lead. Large volume potential (24 units). Sent initial quotation with 15% discount for bulk orders. Awaiting technical layout from client.",
    created_at: "2026-06-07T10:15:00Z",
    updated_at: "2026-06-07T11:45:00Z",
    deleted_at: null
  },
  {
    id: "QR-202606-004",
    full_name: "Phạm Minh Trí",
    phone: "0933445566",
    email: "mitri.pham@gmail.com",
    company: null,
    service: "Báo giá bồn tắm",
    message: "Tôi muốn mua bồn tắm độc lập Bravat Wellness. Có sẵn hàng tại showroom quận 1 để trải nghiệm không?",
    preferred_locale: "vi",
    product_id: "bathtub-freestanding-pd-5",
    category_id: "cat-bathtub",
    source_path: "/vi/products/bathtub-freestanding-pd-5",
    source_url: "http://localhost:3000/vi/products/bathtub-freestanding-pd-5",
    status: "closed",
    assigned_to: "Chuyên viên Lê Minh Tuấn",
    admin_notes: "Khách hàng đã ghé showroom quận 1 xem thực tế ngày 08/06. Đã chốt đơn hàng và thanh toán đặt cọc 50%. Giao hàng dự kiến ngày 12/06.",
    created_at: "2026-06-06T09:00:00Z",
    updated_at: "2026-06-08T18:00:00Z",
    deleted_at: null
  },
  {
    id: "QR-202606-005",
    full_name: "Nguyễn Thu Thủy",
    phone: "0977889900",
    email: "thuy.nguyen@outlook.com",
    company: null,
    service: "Tư vấn thiết kế nhanh",
    message: "Mua sofa nỉ tại showroom có được miễn phí vận chuyển trong nội thành Hà Nội không? Bảo hành đệm xẹp lún như thế nào?",
    preferred_locale: "vi",
    product_id: null,
    category_id: "cat-sofa",
    source_path: "/vi/contact",
    source_url: "http://localhost:3000/vi/contact",
    status: "new",
    assigned_to: "Chưa phân công",
    admin_notes: null,
    created_at: "2026-06-09T15:45:00Z",
    updated_at: "2026-06-09T15:45:00Z",
    deleted_at: null
  },
  {
    id: "QR-202606-006",
    full_name: "Spam Bot",
    phone: "0000000000",
    email: "spam@bot.com",
    company: "SEO Specialist LLC",
    service: "Sell backlinks",
    message: "Get cheap SEO backlinks to rank page 1 google immediately! Contact us at telegram @spambacklinks",
    preferred_locale: "en",
    product_id: null,
    category_id: null,
    source_path: "/en/contact",
    source_url: "http://localhost:3000/en/contact",
    status: "spam",
    assigned_to: "Hệ thống",
    admin_notes: "Tự động đánh dấu thư rác do vi phạm honeypot hoặc tần suất gửi.",
    created_at: "2026-06-09T16:00:00Z",
    updated_at: "2026-06-09T16:00:00Z",
    deleted_at: null
  }
];
export const mockQuoteRequests = mockQuotes;
