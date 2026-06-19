import type { Locale } from "@/i18n/routing";

export type LocalizedText = Record<Locale, string>;
export type PublishStatus = "draft" | "published" | "archived";

export interface Product {
  slug: string;
  referenceCode: string | null;
  categoryKey: string;
  materialKey: string | null;
  roomKey: string | null;
  styleKey: string | null;
  collectionKey: string | null;
  toneKey: string | null;
  availabilityKey: string | null;
  brand_id?: string | null;
  brand_name?: string | null;
  status: PublishStatus;
  featured: boolean;
  image: string;
  gallery: string[];
  price: LocalizedText;
  oldPrice?: LocalizedText | null;
  discountPercentage?: number | null;
  name: LocalizedText;
  category: LocalizedText;
  summary: LocalizedText;
  description: LocalizedText;
  specs: Array<{ label: LocalizedText; value: LocalizedText }>;
  tags: string[];
  promotionId?: string | null;
  promoPriceMin?: number | null;
  promoPriceMax?: number | null;
}

export type ProductSort = "newest" | "featured";

export const productTaxonomy = {
  rooms: [
    { value: "living", label: { vi: "Phòng khách", en: "Living room" } },
    { value: "bath", label: { vi: "Phòng tắm", en: "Bathroom" } },
    { value: "lounge", label: { vi: "Góc thư giãn", en: "Lounge" } },
    { value: "surface", label: { vi: "Bề mặt hoàn thiện", en: "Finishing surfaces" } },
  ],
  materials: [
    { value: "walnut", label: { vi: "Gỗ óc chó", en: "Walnut" } },
    { value: "oak", label: { vi: "Gỗ sồi", en: "Oak" } },
    { value: "marble", label: { vi: "Đá Marble", en: "Marble" } },
    { value: "brass", label: { vi: "Đồng thau", en: "Brass" } },
    { value: "stone", label: { vi: "Gạch porcelain", en: "Porcelain" } },
  ],
  styles: [
    { value: "heritage", label: { vi: "Heritage Modernism", en: "Heritage Modernism" } },
    { value: "minimal", label: { vi: "Tối giản ấm", en: "Warm minimal" } },
    { value: "resort", label: { vi: "Resort living", en: "Resort living" } },
  ],
  collections: [
    { value: "atelier", label: { vi: "Atelier Select", en: "Atelier Select" } },
    { value: "heritage", label: { vi: "Heritage Collection", en: "Heritage Collection" } },
    { value: "wellness", label: { vi: "Wellness Bath", en: "Wellness Bath" } },
  ],
  tones: [
    { value: "warm", label: { vi: "Ấm tự nhiên", en: "Natural warm" } },
    { value: "dark", label: { vi: "Trầm sâu", en: "Deep dark" } },
    { value: "light", label: { vi: "Sáng thanh lịch", en: "Light refined" } },
  ],
  availability: [
    { value: "showroom", label: { vi: "Có tại showroom", en: "In showroom" } },
    { value: "made-to-order", label: { vi: "Đặt theo dự án", en: "Made to order" } },
    { value: "limited", label: { vi: "Số lượng giới hạn", en: "Limited" } },
  ],
} as const;

export const publicNav = [
  { key: "home", href: "/" },
  { key: "products", href: "/products" },
  { key: "showrooms", href: "/showrooms" },
  { key: "blog", href: "/blog" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
] as const;

export const productGroups = [
  {
    key: "wood",
    href: "/products?category=wood",
    image: "https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424088/showroom/woodWall.png",
    title: { vi: "Nội thất & đồ gỗ", en: "Wood furniture" },
    summary: {
      vi: "Gỗ tự nhiên cao cấp, thiết kế tinh xảo.",
      en: "Premium natural wood and refined detailing.",
    },
  },
  {
    key: "sanitary",
    href: "/products?category=sanitary",
    image: "https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424091/showroom/room.jpg",
    title: { vi: "Thiết bị vệ sinh", en: "Sanitary ware" },
    summary: {
      vi: "Hiện đại, tiện nghi và sang trọng.",
      en: "Modern, comfortable and refined.",
    },
  },
  {
    key: "tiles",
    href: "/products?category=tiles",
    image: "https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424090/showroom/texture.jpg",
    title: { vi: "Gạch ốp lát", en: "Tiles" },
    summary: {
      vi: "Vật liệu bền vững cho bề mặt hoàn thiện.",
      en: "Durable surfaces for complete interiors.",
    },
  },
  {
    key: "solutions",
    href: "/products?category=other",
    image: "https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424086/showroom/showroom.jpg",
    title: { vi: "Thiết kế khác", en: "Project solutions" },
    summary: {
      vi: "Giải pháp tổng thể cho nhà ở và công trình.",
      en: "Complete solutions for homes and projects.",
    },
  },
] as const;

export const brandCatalog = [
  {
    key: "american",
    href: "/products?brand=american",
    image: "https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424091/showroom/room.jpg",
    groupKey: "sanitary",
    title: { vi: "American", en: "American" },
    summary: {
      vi: "Thiết bị vệ sinh phong cách khách sạn, phù hợp phòng tắm master và căn hộ cao cấp.",
      en: "Hotel-inspired sanitary ware for master bathrooms and premium apartments.",
    },
    productSlugs: ["sen-tam-ma-vang-24k"],
    items: [
      { href: "/products?brand=american&type=bathtub", label: { vi: "Bồn tắm American", en: "American bathtubs" } },
      { href: "/products?brand=american&type=toilet", label: { vi: "Bồn cầu American", en: "American toilets" } },
      { href: "/products?brand=american&type=shower", label: { vi: "Sen tắm American", en: "American shower sets" } },
    ],
  },
  {
    key: "bancoot",
    href: "/products?brand=bancoot",
    image: "https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424086/showroom/showroom.jpg",
    groupKey: "sanitary",
    title: { vi: "Bancoot", en: "Bancoot" },
    summary: {
      vi: "Dòng thiết bị phòng tắm hiện đại, dễ phối với gạch sáng và phụ kiện kim loại ấm.",
      en: "Modern bathroom lines that pair well with light tiles and warm metal accents.",
    },
    productSlugs: ["sen-tam-ma-vang-24k"],
    items: [
      { href: "/products?brand=bancoot&type=lavabo", label: { vi: "Lavabo Bancoot", en: "Bancoot basins" } },
      { href: "/products?brand=bancoot&type=faucet", label: { vi: "Vòi chậu Bancoot", en: "Bancoot faucets" } },
      { href: "/products?brand=bancoot&type=accessory", label: { vi: "Phụ kiện Bancoot", en: "Bancoot accessories" } },
    ],
  },
  {
    key: "bravat",
    href: "/products?brand=bravat",
    image: "https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424090/showroom/texture.jpg",
    groupKey: "sanitary",
    title: { vi: "Bravat", en: "Bravat" },
    summary: {
      vi: "Thiết bị vệ sinh có form tối giản, phù hợp không gian phòng tắm resort tại nhà.",
      en: "Minimal sanitary fixtures for resort-style bathrooms at home.",
    },
    productSlugs: ["sen-tam-ma-vang-24k"],
    items: [
      { href: "/products?brand=bravat&type=shower", label: { vi: "Sen tắm Bravat", en: "Bravat shower sets" } },
      { href: "/products?brand=bravat&type=toilet", label: { vi: "Bồn cầu Bravat", en: "Bravat toilets" } },
      { href: "/products?brand=bravat&type=faucet", label: { vi: "Vòi chậu Bravat", en: "Bravat faucets" } },
    ],
  },
  {
    key: "kohler",
    href: "/products?brand=kohler",
    image: "https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424091/showroom/room.jpg",
    groupKey: "sanitary",
    title: { vi: "Kohler", en: "Kohler" },
    summary: {
      vi: "Gợi ý cho phòng tắm cao cấp cần đồng bộ bồn cầu, lavabo, sen vòi và phụ kiện.",
      en: "Recommendations for premium bathrooms needing coordinated toilets, basins, showers and accessories.",
    },
    productSlugs: ["sen-tam-ma-vang-24k"],
    items: [
      { href: "/products?brand=kohler&type=toilet", label: { vi: "Bồn cầu Kohler", en: "Kohler toilets" } },
      { href: "/products?brand=kohler&type=basin", label: { vi: "Lavabo Kohler", en: "Kohler basins" } },
      { href: "/products?brand=kohler&type=bathtub", label: { vi: "Bồn tắm Kohler", en: "Kohler bathtubs" } },
    ],
  },
  {
    key: "grohe",
    href: "/products?brand=grohe",
    image: "https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424101/showroom/showroom2.jpg",
    groupKey: "sanitary",
    title: { vi: "Grohe", en: "Grohe" },
    summary: {
      vi: "Tập trung vào sen vòi, phụ kiện và trải nghiệm nước ổn định cho phòng tắm hiện đại.",
      en: "Focused on showers, faucets, accessories and stable water experience for modern bathrooms.",
    },
    productSlugs: ["sen-tam-ma-vang-24k"],
    items: [
      { href: "/products?brand=grohe&type=shower", label: { vi: "Sen tắm Grohe", en: "Grohe showers" } },
      { href: "/products?brand=grohe&type=faucet", label: { vi: "Vòi lavabo Grohe", en: "Grohe basin faucets" } },
      { href: "/products?brand=grohe&type=accessory", label: { vi: "Phụ kiện Grohe", en: "Grohe accessories" } },
    ],
  },
  {
    key: "hafele",
    href: "/products?brand=hafele",
    image: "https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424095/showroom/cabinet.png",
    groupKey: "solutions",
    title: { vi: "Hafele", en: "Hafele" },
    summary: {
      vi: "Phụ kiện, giải pháp bếp và phần cứng hoàn thiện cho nội thất gỗ đặt theo dự án.",
      en: "Accessories, kitchen solutions and finishing hardware for made-to-order wooden interiors.",
    },
    productSlugs: ["ke-tivi-minimalist-wood", "ban-tra-marble-round"],
    items: [
      { href: "/products?brand=hafele&type=kitchen", label: { vi: "Phụ kiện bếp Hafele", en: "Hafele kitchen fittings" } },
      { href: "/products?brand=hafele&type=hardware", label: { vi: "Ray trượt & bản lề", en: "Runners and hinges" } },
      { href: "/products?brand=hafele&type=wardrobe", label: { vi: "Phụ kiện tủ áo", en: "Wardrobe accessories" } },
    ],
  },
] as const;

export const typeCatalogSections = [
  {
    key: "wood",
    productSlugs: ["sofa-curve-velour", "ban-tra-marble-round", "ke-tivi-minimalist-wood"],
    columns: [
      {
        title: { vi: "Nhóm nội thất", en: "Furniture groups" },
        items: [
          { href: "/products?category=wood&type=sofa", label: { vi: "Sofa", en: "Sofas" } },
          { href: "/products?category=wood&type=coffee-table", label: { vi: "Bàn trà", en: "Coffee tables" } },
          { href: "/products?category=wood&type=tv-cabinet", label: { vi: "Kệ tivi", en: "TV cabinets" } },
          { href: "/products?category=wood&type=wardrobe", label: { vi: "Tủ gỗ", en: "Wood cabinets" } },
        ],
      },
      {
        title: { vi: "Không gian", en: "Spaces" },
        items: [
          { href: "/products?category=wood&room=living", label: { vi: "Phòng khách", en: "Living room" } },
          { href: "/products?category=wood&room=lounge", label: { vi: "Góc thư giãn", en: "Lounge" } },
          { href: "/products?category=wood&collection=heritage", label: { vi: "Bộ Heritage", en: "Heritage collection" } },
        ],
      },
    ],
  },
  {
    key: "sanitary",
    productSlugs: ["sen-tam-ma-vang-24k"],
    columns: [
      {
        title: { vi: "Thiết bị chính", en: "Core fixtures" },
        items: [
          { href: "/products?category=sanitary&type=bathtub", label: { vi: "Bồn tắm", en: "Bathtubs" } },
          { href: "/products?category=sanitary&type=toilet", label: { vi: "Bồn cầu", en: "Toilets" } },
          { href: "/products?category=sanitary&type=basin", label: { vi: "Lavabo", en: "Basins" } },
          { href: "/products?category=sanitary&type=shower", label: { vi: "Sen tắm", en: "Shower sets" } },
        ],
      },
      {
        title: { vi: "Phụ kiện", en: "Accessories" },
        items: [
          { href: "/products?category=sanitary&type=faucet", label: { vi: "Vòi chậu", en: "Basin faucets" } },
          { href: "/products?category=sanitary&type=thermostat", label: { vi: "Sen nhiệt", en: "Thermostatic showers" } },
          { href: "/products?category=sanitary&type=bath-accessory", label: { vi: "Phụ kiện phòng tắm", en: "Bathroom accessories" } },
        ],
      },
    ],
  },
  {
    key: "tiles",
    productSlugs: ["gach-marble-calacatta"],
    columns: [
      {
        title: { vi: "Ứng dụng", en: "Applications" },
        items: [
          { href: "/products?category=tiles&type=floor", label: { vi: "Gạch lát nền", en: "Floor tiles" } },
          { href: "/products?category=tiles&type=wall", label: { vi: "Gạch ốp tường", en: "Wall tiles" } },
          { href: "/products?category=tiles&type=bath", label: { vi: "Gạch phòng tắm", en: "Bathroom tiles" } },
          { href: "/products?category=tiles&type=large-format", label: { vi: "Gạch khổ lớn", en: "Large-format tiles" } },
        ],
      },
      {
        title: { vi: "Bề mặt", en: "Surfaces" },
        items: [
          { href: "/products?category=tiles&material=stone", label: { vi: "Porcelain", en: "Porcelain" } },
          { href: "/products?category=tiles&material=marble", label: { vi: "Vân đá marble", en: "Marble look" } },
          { href: "/products?category=tiles&tone=light", label: { vi: "Tông sáng", en: "Light tone" } },
        ],
      },
    ],
  },
  {
    key: "solutions",
    productSlugs: ["sofa-curve-velour", "sen-tam-ma-vang-24k"],
    columns: [
      {
        title: { vi: "Dịch vụ", en: "Services" },
        items: [
          { href: "/contact?service=consultation", label: { vi: "Tư vấn phối vật liệu", en: "Material coordination" } },
          { href: "/contact?service=showroom-design", label: { vi: "Thiết kế showroom", en: "Showroom design" } },
          { href: "/contact?service=project-quote", label: { vi: "Báo giá dự án", en: "Project quotation" } },
        ],
      },
      {
        title: { vi: "Điểm chạm", en: "Touchpoints" },
        items: [
          { href: "/showrooms", label: { vi: "Trải nghiệm showroom", en: "Showroom experience" } },
          { href: "/blog", label: { vi: "Góc tư vấn", en: "Advisory journal" } },
          { href: "/about", label: { vi: "Năng lực thi công", en: "Execution capability" } },
        ],
      },
    ],
  },
] as const;

export const trustBadges = [
  { value: "20+", label: { vi: "năm kinh nghiệm", en: "years of experience" } },
  { value: "500+", label: { vi: "mẫu sản phẩm", en: "curated products" } },
  { value: "2.000m2", label: { vi: "nhà máy và kho", en: "factory and warehouse" } },
] as const;

export const cmsWarnings = [
  "Thiếu bản dịch tiếng Anh cho mô tả ngắn",
  "Mô tả meta dài hơn 160 ký tự",
  "Đường dẫn đã tồn tại: sofa-curve-velour",
  "Ảnh hero chưa có văn bản thay thế tiếng Việt hoặc tiếng Anh",
] as const;

export function localized<T>(value: Record<Locale, T>, locale: Locale): T {
  return value[locale] ?? value.vi;
}

export function withLocale(locale: Locale, href: string): string {
  if (href === "/") return `/${locale}`;
  return `/${locale}${href}`;
}

export function paginateItems<T>(items: readonly T[], page: number, pageSize: number) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    items: items.slice(start, start + pageSize),
  };
}
