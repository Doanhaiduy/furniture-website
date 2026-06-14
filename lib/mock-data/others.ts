export type MockSettings = {
  companyName: string;
  hotline: string;
  email: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
  zaloUrl: string;
  metaTitleDefault: string;
  metaDescriptionDefault: string;
  geminiModel: string;
  geminiApiKeyMasked: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
};

export type MockUser = {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "editor";
  status: "active" | "inactive";
  created_at: string;
};

export type MockCoupon = {
  code: string;
  discountType: "percent" | "fixed";
  value: number;
  minOrderValue: number;
  expiryDate: string;
  status: "active" | "expired";
  description: string;
};

export const mockSettings: MockSettings = {
  companyName: "Showroom Nội Thất Phương Đông",
  hotline: "1900 1234",
  email: "contact@phuongdong.vn",
  address: "123 Trần Duy Hưng, Cầu Giấy, Hà Nội",
  facebookUrl: "https://facebook.com/phuongdongfurniture",
  instagramUrl: "https://instagram.com/phuongdongfurniture",
  zaloUrl: "https://zalo.me/0912345678",
  metaTitleDefault: "Nội Thất Phương Đông - Thiết bị vệ sinh & Đồ gỗ cao cấp",
  metaDescriptionDefault: "Showroom Nội Thất Phương Đông chuyên cung cấp đồ gỗ óc chó, gỗ sồi cao cấp, thiết bị phòng tắm Kohler, Grohe, Bravat và gạch ốp lát Tây Ban Nha nhập khẩu.",
  geminiModel: "gemini-1.5-pro",
  geminiApiKeyMasked: "**********5678",
  rateLimitWindowMs: 60000,
  rateLimitMaxRequests: 5
};

export const mockUsers: MockUser[] = [
  {
    id: "user-1",
    email: "admin@phuongdong.vn",
    full_name: "KTS. Hoàng Minh Quân (CEO)",
    role: "admin",
    status: "active",
    created_at: "2026-01-10T08:00:00Z"
  },
  {
    id: "user-2",
    email: "editor@phuongdong.vn",
    full_name: "Lê Hồng Hạnh (Content Creator)",
    role: "editor",
    status: "active",
    created_at: "2026-02-15T09:30:00Z"
  },
  {
    id: "user-3",
    email: "tuan.sales@phuongdong.vn",
    full_name: "Lê Minh Tuấn (Sales Manager)",
    role: "editor",
    status: "active",
    created_at: "2026-03-01T10:00:00Z"
  }
];

export const mockCoupons: MockCoupon[] = [
  {
    code: "PHUONGDONG10",
    discountType: "percent",
    value: 10,
    minOrderValue: 20000000,
    expiryDate: "2026-12-31",
    status: "active",
    description: "Giảm 10% cho đơn hàng mua đồ gỗ từ 20 triệu đồng trở lên."
  },
  {
    code: "WELLNESS20",
    discountType: "percent",
    value: 20,
    minOrderValue: 50000000,
    expiryDate: "2026-08-30",
    status: "active",
    description: "Giảm 20% cho trọn bộ thiết bị vệ sinh Bravat/Kohler."
  },
  {
    code: "WELCOME500",
    discountType: "fixed",
    value: 500000,
    minOrderValue: 5000000,
    expiryDate: "2026-07-31",
    status: "active",
    description: "Giảm 500,000đ cho khách hàng đăng ký nhận tư vấn đầu tiên."
  },
  {
    code: "EXPIRED5",
    discountType: "percent",
    value: 5,
    minOrderValue: 0,
    expiryDate: "2026-05-01",
    status: "expired",
    description: "Mã giảm giá khai xuân đã hết hạn sử dụng."
  }
];

// Admin Dashboard stats & charts data
export const mockAdminStats = {
  productCount: 77,
  categoryCount: 14,
  blogCount: 7,
  showroomCount: 3,
  quoteCount: 6,
  userCount: 3,
  monthlySales: [
    { name: "T1", value: 120 },
    { name: "T2", value: 95 },
    { name: "T3", value: 150 },
    { name: "T4", value: 180 },
    { name: "T5", value: 210 },
    { name: "T6", value: 290 } // Doanh số tăng vọt vào mùa hè
  ],
  leadsBySource: [
    { name: "Trang chủ", value: 2 },
    { name: "Sản phẩm Sofa", value: 2 },
    { name: "Bồn tắm Wellness", value: 1 },
    { name: "Liên hệ trực tiếp", value: 1 }
  ]
};
export const adminStats = mockAdminStats;
