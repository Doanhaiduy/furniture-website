export type MockCategory = {
  id: string;
  slug: string;
  name: { vi: string; en: string };
  description: { vi: string; en: string } | null;
  group_key: "wood" | "sanitary" | "tiles";
  status: "published" | "draft";
  sort_order: number;
  parent_id: string | null;
};

export const mockCategories: MockCategory[] = [
  // Wood Furniture categories
  {
    id: "cat-sofa",
    slug: "sofa",
    name: { vi: "Sofa cao cấp", en: "Premium Sofas" },
    description: { vi: "Các dòng sofa da bò Ý, sofa nỉ cao cấp với khung gỗ tự nhiên.", en: "Italian leather and premium fabric sofas with natural wood frames." },
    group_key: "wood",
    status: "published",
    sort_order: 1,
    parent_id: null,
  },
  {
    id: "cat-coffee-table",
    slug: "coffee-table",
    name: { vi: "Bàn trà nghệ thuật", en: "Artistic Coffee Tables" },
    description: { vi: "Bàn trà mặt đá marble Calacatta, mặt kính cường lực, chân gỗ óc chó.", en: "Coffee tables with Calacatta marble or glass tops, walnut legs." },
    group_key: "wood",
    status: "published",
    sort_order: 2,
    parent_id: null,
  },
  {
    id: "cat-tv-cabinet",
    slug: "tv-cabinet",
    name: { vi: "Kệ tivi & Tủ trang trí", en: "TV Cabinets & Sideboards" },
    description: { vi: "Kệ tivi gỗ óc chó, gỗ sồi thiết kế tối giản, ngăn kéo giảm chấn.", en: "Minimalist walnut and oak TV stands with soft-close drawers." },
    group_key: "wood",
    status: "published",
    sort_order: 3,
    parent_id: null,
  },
  {
    id: "cat-dining-table",
    slug: "dining-table",
    name: { vi: "Bàn ăn gia đình", en: "Dining Tables" },
    description: { vi: "Bàn ăn gỗ tự nhiên nguyên tấm sang trọng cho không gian ấm cúng.", en: "Luxury solid wood dining tables for warm dining rooms." },
    group_key: "wood",
    status: "published",
    sort_order: 4,
    parent_id: null,
  },
  {
    id: "cat-chair",
    slug: "chair",
    name: { vi: "Ghế ăn & Ghế thư giãn", en: "Chairs & Armchairs" },
    description: { vi: "Ghế gỗ tự nhiên bọc da bò Ý, armchair phong cách cổ điển.", en: "Natural wood chairs with Italian leather, classic armchairs." },
    group_key: "wood",
    status: "published",
    sort_order: 5,
    parent_id: null,
  },
  {
    id: "cat-bed",
    slug: "bed",
    name: { vi: "Giường ngủ sang trọng", en: "Luxury Beds" },
    description: { vi: "Giường ngủ gỗ tự nhiên bọc nỉ mút êm ái, nâng niu giấc ngủ của bạn.", en: "Solid wood beds with soft fabric upholstery for restful sleep." },
    group_key: "wood",
    status: "published",
    sort_order: 6,
    parent_id: null,
  },
  {
    id: "cat-wardrobe",
    slug: "wardrobe",
    name: { vi: "Tủ quần áo thông minh", en: "Smart Wardrobes" },
    description: { vi: "Tủ áo gỗ óc chó kịch trần, thiết kế âm tường sang trọng.", en: "Floor-to-ceiling walnut wardrobes, luxury built-in designs." },
    group_key: "wood",
    status: "published",
    sort_order: 7,
    parent_id: null,
  },

  // Sanitary Ware categories
  {
    id: "cat-bathtub",
    slug: "bathtub",
    name: { vi: "Bồn tắm độc lập", en: "Freestanding Bathtubs" },
    description: { vi: "Bồn tắm acrylic cao cấp, thiết kế công thái học sang trọng.", en: "Premium acrylic bathtubs, ergonomic luxury designs." },
    group_key: "sanitary",
    status: "published",
    sort_order: 8,
    parent_id: null,
  },
  {
    id: "cat-toilet",
    slug: "toilet",
    name: { vi: "Bồn cầu thông minh", en: "Smart Toilets" },
    description: { vi: "Bồn cầu điện tử tích hợp sấy sưởi, xịt rửa tự động thông minh.", en: "Electronic toilets with heated seats and smart auto wash." },
    group_key: "sanitary",
    status: "published",
    sort_order: 9,
    parent_id: null,
  },
  {
    id: "cat-basin",
    slug: "basin",
    name: { vi: "Lavabo & Chậu rửa mặt", en: "Basins & Sinks" },
    description: { vi: "Lavabo đá tự nhiên mài tay, lavabo sứ tráng men nano chống bám bẩn.", en: "Hand-polished natural stone basins, nano-glazed ceramic sinks." },
    group_key: "sanitary",
    status: "published",
    sort_order: 10,
    parent_id: null,
  },
  {
    id: "cat-shower",
    slug: "shower",
    name: { vi: "Sen tắm nhiệt độ", en: "Thermostatic Showers" },
    description: { vi: "Sen tắm âm tường mạ vàng 24K, khóa nhiệt độ an toàn chống bỏng.", en: "24K gold-plated built-in showers, anti-scald safety locks." },
    group_key: "sanitary",
    status: "published",
    sort_order: 11,
    parent_id: null,
  },
  {
    id: "cat-faucet",
    slug: "faucet",
    name: { vi: "Vòi chậu lavabo", en: "Basin Faucets" },
    description: { vi: "Vòi lavabo đồng thau mạ chrome, đen mờ phong cách châu Âu.", en: "Brass faucets with chrome or matte black European styling." },
    group_key: "sanitary",
    status: "published",
    sort_order: 12,
    parent_id: null,
  },

  // Tiles categories
  {
    id: "cat-floor",
    slug: "floor",
    name: { vi: "Gạch lát nền", en: "Floor Tiles" },
    description: { vi: "Gạch porcelain vân đá marble khổ lớn nhập khẩu Tây Ban Nha.", en: "Large format stone-look porcelain tiles imported from Spain." },
    group_key: "tiles",
    status: "published",
    sort_order: 13,
    parent_id: null,
  },
  {
    id: "cat-wall",
    slug: "wall",
    name: { vi: "Gạch ốp tường", en: "Wall Tiles" },
    description: { vi: "Gạch mosaic trang trí nghệ thuật, gạch giả cổ ấm áp.", en: "Decorative mosaic tiles, warm rustic vintage-style wall tiles." },
    group_key: "tiles",
    status: "published",
    sort_order: 14,
    parent_id: null,
  },
];
