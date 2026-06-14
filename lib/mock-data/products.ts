import { mockCategories } from "./categories";

export type MockProductSpec = {
  label: { vi: string; en: string };
  value: { vi: string; en: string };
};

export type MockProduct = {
  id: string;
  reference_code: string;
  slug: string;
  category_id: string; // references mockCategories id
  group_key: "wood" | "sanitary" | "tiles";
  category_slug: string;
  category_name: { vi: string; en: string };
  featured: boolean;
  published_at: string;
  status: "published" | "draft" | "archived";
  primary_media: { url: string };
  media: { url: string }[];
  price_min: number;
  price_max: number;
  currency: string;
  price_display_text: { vi: string; en: string };
  dimension_display_text: { vi: string; en: string };
  name: { vi: string; en: string };
  summary: { vi: string; en: string };
  description: { vi: string; en: string };
  material: { vi: string; en: string };
  specs: MockProductSpec[];
  tags: string[];
  attributes: { label: string; valueText: string }[];
  room_key?: string;
  material_key?: string;
  style_key?: string;
  collection_key?: string;
  tone_key?: string;
  availability_key?: string;
};

// Base products represent core models
const baseProducts = [
  // 1. Sofa
  {
    name: { vi: "Sofa Gỗ Óc Chó Heritage", en: "Heritage Walnut Sofa" },
    summary: {
      vi: "Sofa gỗ óc chó cao cấp bọc da bò Ý với thiết kế bo cong nghệ thuật, nâng tầm không gian phòng khách biệt thự.",
      en: "Premium walnut sofa upholstered in Italian leather, featuring artistic curves for luxury villa living rooms."
    },
    description: {
      vi: "Sofa gỗ óc chó Heritage được chế tác hoàn toàn từ gỗ óc chó tự nhiên nhập khẩu từ Bắc Mỹ, đã qua quy trình tẩm sấy công nghiệp nghiêm ngặt đạt tiêu chuẩn độ ẩm quốc tế (8-12%) để chống cong vênh, co ngót dưới khí hậu nhiệt đới ẩm. Khung gỗ được tạo tác tinh xảo với các đường vát bo góc bằng tay tỉ mỉ. Đệm ngồi sử dụng mút latex nguyên khối bọc da bò thật nhập khẩu trực tiếp từ vùng Tuscany nước Ý, mang lại cảm giác nâng đỡ êm ái vượt trội và độ bền hàng chục năm sử dụng.",
      en: "The Heritage Sofa is crafted entirely from premium North American natural walnut, industrially kiln-dried to strict moisture standards (8-12%) to prevent warping and shrinkage in tropical climates. The wooden frame is exquisitely hand-carved with soft rounded profiles. Cushions are made of organic latex foam wrapped in authentic Italian leather from Tuscany, providing exceptional support and decades of durability."
    },
    material: { vi: "Gỗ óc chó Bắc Mỹ, Da bò Ý", en: "North American Walnut, Italian Leather" },
    price_display_text: { vi: "78,000,000 VND", en: "78,000,000 VND" },
    price_min: 78000000,
    price_max: 78000000,
    dimension_display_text: { vi: "2600 x 950 x 820 mm", en: "2600 x 950 x 820 mm" },
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"
    ],
    specs: [
      { label: { vi: "Chất liệu khung", en: "Frame Material" }, value: { vi: "Gỗ óc chó FAS tự nhiên", en: "FAS Natural Walnut" } },
      { label: { vi: "Chất liệu đệm", en: "Cushion Material" }, value: { vi: "Mút Latex cao cấp, Da bò Ý", en: "Premium Latex, Italian Leather" } },
      { label: { vi: "Màu sắc", en: "Color" }, value: { vi: "Nâu óc chó tự nhiên, Đen huyền bí", en: "Natural Walnut Brown, Onyx Black" } },
      { label: { vi: "Bảo hành", en: "Warranty" }, value: { vi: "36 tháng", en: "36 months" } }
    ],
    tags: ["sofa", "gỗ óc chó", "da bò", "phòng khách", "heritage"],
    category_slug: "sofa"
  },
  // 2. Coffee Table
  {
    name: { vi: "Bàn Trà Đá Marble Calacatta", en: "Calacatta Marble Coffee Table" },
    summary: {
      vi: "Bàn trà nghệ thuật với mặt đá Marble Calacatta tự nhiên, kết hợp chân đồng thau mạ màu champagne sang trọng.",
      en: "Artistic coffee table with a natural Calacatta Marble top and champagne brass plated legs."
    },
    description: {
      vi: "Được thiết kế làm điểm nhấn cho các không gian sống thượng lưu, bàn trà Marble Calacatta sở hữu mặt đá tự nhiên nhập khẩu trực tiếp từ Ý với các đường vân mây xám nổi bật độc bản. Bề mặt đá được xử lý phủ bóng chống thấm chuyên dụng, chịu nhiệt và chống trầy xước. Chân bàn làm bằng hợp kim đồng thau đúc nguyên khối, mạ màu champagne mờ hiện đại, tạo nên thế đứng vững chãi nâng đỡ tấm đá cẩm thạch quý hiếm.",
      en: "Designed as a statement piece for luxury living spaces, the Calacatta Marble Table features natural Italian marble with unique grey veining. The stone surface is coated with a specialized sealant for water, heat, and scratch resistance. The base is constructed from solid cast brass, finished in elegant matte champagne, ensuring structural stability and aesthetic harmony."
    },
    material: { vi: "Đá Marble Ý, Đồng thau", en: "Italian Marble, Cast Brass" },
    price_display_text: { vi: "24,500,000 VND", en: "24,500,000 VND" },
    price_min: 24500000,
    price_max: 24500000,
    dimension_display_text: { vi: "1000 x 1000 x 420 mm", en: "1000 x 1000 x 420 mm" },
    image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=800&q=80"
    ],
    specs: [
      { label: { vi: "Mặt bàn", en: "Tabletop" }, value: { vi: "Đá cẩm thạch Calacatta dày 20mm", en: "20mm Calacatta Marble" } },
      { label: { vi: "Chân bàn", en: "Legs" }, value: { vi: "Đồng thau mạ vàng champagne", en: "Champagne gold-plated brass" } },
      { label: { vi: "Xử lý bề mặt", en: "Finishing" }, value: { vi: "Phủ bóng nano chống thấm nước", en: "Waterproof nano sealant" } },
      { label: { vi: "Bảo hành", en: "Warranty" }, value: { vi: "12 tháng", en: "12 months" } }
    ],
    tags: ["bàn trà", "đá cẩm thạch", "calacatta", "đồng thau", "phòng khách"],
    category_slug: "coffee-table"
  },
  // 3. TV Cabinet
  {
    name: { vi: "Kệ Tivi Gỗ Sồi Tự Nhiên Nordic", en: "Nordic Natural Oak TV Console" },
    summary: {
      vi: "Kệ tivi phong cách Bắc Âu tối giản làm từ gỗ sồi trắng Mỹ, ngăn kéo nhấn chạm thông minh.",
      en: "Scandinavian minimalist TV console crafted from American white oak with push-to-open cabinets."
    },
    description: {
      vi: "Sở hữu những đường nét thanh mảnh, góc cạnh được làm tròn tinh tế, kệ tivi Nordic mang đến cảm giác thanh lịch và gọn gàng cho phòng khách hiện đại. Được làm từ 100% gỗ sồi trắng Mỹ nhập khẩu, sản phẩm được sơn bóng mờ hệ nước an toàn tuyệt đối với trẻ nhỏ và làm nổi bật vân gỗ sồi tự nhiên. Kệ tích hợp 2 hộc tủ cánh lật và 2 ngăn kéo giảm chấn Hafele bền bỉ, giúp che giấu dây cáp và lưu trữ thiết bị điện tử gọn gàng.",
      en: "Featuring clean lines and softly rounded edges, the Nordic TV Console brings Scandinavian elegance to modern living rooms. Built from 100% American white oak, it is coated with non-toxic water-based matte finish. The console integrates 2 drop-front cabinets and 2 drawers equipped with premium Hafele runners for seamless media storage."
    },
    material: { vi: "Gỗ sồi trắng Mỹ", en: "American White Oak" },
    price_display_text: { vi: "18,200,000 VND", en: "18,200,000 VND" },
    price_min: 18200000,
    price_max: 18200000,
    dimension_display_text: { vi: "2000 x 450 x 500 mm", en: "2000 x 450 x 500 mm" },
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80"
    ],
    specs: [
      { label: { vi: "Vật liệu chính", en: "Core Material" }, value: { vi: "Gỗ sồi trắng tự nhiên nhập khẩu", en: "Natural American white oak" } },
      { label: { vi: "Ray ngăn kéo", en: "Drawer Runners" }, value: { vi: "Ray âm giảm chấn Hafele", en: "Concealed soft-close Hafele" } },
      { label: { vi: "Màu sắc", en: "Color" }, value: { vi: "Màu sồi tự nhiên (Natural Oak)", en: "Natural Oak" } },
      { label: { vi: "Bảo hành", en: "Warranty" }, value: { vi: "24 tháng", en: "24 months" } }
    ],
    tags: ["kệ tivi", "gỗ sồi", "bắc âu", "nordic", "phòng khách"],
    category_slug: "tv-cabinet"
  },
  // 4. Dining Table
  {
    name: { vi: "Bàn Ăn Nguyên Tấm Walnut Atelier", en: "Atelier Solid Walnut Dining Table" },
    summary: {
      vi: "Bàn ăn dài sang trọng mặt gỗ óc chó tự nhiên nguyên tấm dày 50mm, thích hợp không gian phòng ăn biệt thự.",
      en: "Luxury dining table featuring a 50mm thick solid walnut slab, perfect for villa dining rooms."
    },
    description: {
      vi: "Bàn ăn Atelier là sự tôn vinh vẻ đẹp thô mộc của gỗ tự nhiên. Mặt bàn là một tấm gỗ óc chó nguyên khối được tuyển lựa gắt gao với các đường bìa gỗ (live edge) uốn lượn tự nhiên không trùng lặp. Độ dày tấm gỗ lên tới 50mm tạo nên sự bề thế. Bề mặt gỗ được lau dầu thực vật Rubio Monocoat của Bỉ giúp giữ trọn vẹn cảm giác ấm áp và thớ gỗ mộc khi chạm tay vào, đồng thời có khả năng kháng ẩm tốt. Chân bàn thiết kế dạng chữ X bằng thép sơn tĩnh điện màu đen mờ hiện đại.",
      en: "The Atelier Dining Table celebrates the organic beauty of solid wood. The tabletop is selected from a single solid walnut slab with natural live edges. The 50mm thickness gives it an imposing presence. The wood is protected with premium Belgian Rubio Monocoat botanical oil, keeping the warm natural wood texture tactile while protecting it from spills. The table stands on modern X-shaped powder-coated black steel legs."
    },
    material: { vi: "Gỗ óc chó nguyên khối, Thép", en: "Solid Walnut, Steel" },
    price_display_text: { vi: "54,000,000 VND", en: "54,000,000 VND" },
    price_min: 54000000,
    price_max: 54000000,
    dimension_display_text: { vi: "2400 x 950 x 750 mm", en: "2400 x 950 x 750 mm" },
    image: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=800&q=80"
    ],
    specs: [
      { label: { vi: "Độ dày mặt bàn", en: "Tabletop Thickness" }, value: { vi: "50 mm gỗ óc chó nguyên khối", en: "50 mm solid walnut slab" } },
      { label: { vi: "Bề mặt hoàn thiện", en: "Surface finish" }, value: { vi: "Lau dầu Rubio Monocoat", en: "Rubio Monocoat plant oil" } },
      { label: { vi: "Sức chứa", en: "Seating Capacity" }, value: { vi: "8 - 10 người", en: "8 - 10 people" } },
      { label: { vi: "Bảo hành", en: "Warranty" }, value: { vi: "60 tháng", en: "60 months" } }
    ],
    tags: ["bàn ăn", "gỗ óc chó", "nguyên khối", "live edge", "phòng ăn"],
    category_slug: "dining-table"
  },
  // 5. Bathtub
  {
    name: { vi: "Bồn Tắm Độc Lập Bravat Wellness", en: "Bravat Wellness Freestanding Tub" },
    summary: {
      vi: "Bồn tắm đá nhân tạo Solid Surface từ Đức, giữ nhiệt vượt trội cho không gian phòng tắm master spa.",
      en: "Solid Surface freestanding bathtub from Germany, with superior heat retention for spa-like master baths."
    },
    description: {
      vi: "Bồn tắm độc lập Bravat Wellness mang thiết kế công thái học hoàn hảo nâng đỡ cơ thể thư giãn tuyệt đối. Được chế tạo từ đá acrylic nhân tạo cao cấp (Solid Surface) của Bravat (Đức), sản phẩm có bề mặt mịn mờ như lụa, không mối nối giúp ngăn ngừa bụi bẩn và vi khuẩn bám trú. Đặc tính dẫn nhiệt cực thấp của đá Solid Surface giúp nước tắm giữ được hơi ấm lâu gấp 3 lần bồn tắm acrylic thông thường, đem đến trải nghiệm trị liệu nước đỉnh cao tại gia.",
      en: "The Bravat Wellness bathtub features an ergonomic design to support the body for ultimate relaxation. Crafted from premium Solid Surface stone by Bravat (Germany), the tub presents a seamless silky matte finish that prevents mold and bacteria build-up. The low thermal conductivity of the material keeps bathwater warm 3 times longer than standard acrylic tubs, offering a premium home spa experience."
    },
    material: { vi: "Đá Solid Surface (Bravat)", en: "Solid Surface composite (Bravat)" },
    price_display_text: { vi: "65,000,000 VND", en: "65,000,000 VND" },
    price_min: 65000000,
    price_max: 65000000,
    dimension_display_text: { vi: "1700 x 800 x 580 mm", en: "1700 x 800 x 580 mm" },
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80"
    ],
    specs: [
      { label: { vi: "Nhà sản xuất", en: "Manufacturer" }, value: { vi: "Bravat (Đức)", en: "Bravat (Germany)" } },
      { label: { vi: "Chất liệu", en: "Material" }, value: { vi: "Đá khoáng acrylic Solid Surface", en: "Acrylic Solid Surface composite" } },
      { label: { vi: "Trọng lượng khô", en: "Dry weight" }, value: { vi: "135 kg", en: "135 kg" } },
      { label: { vi: "Bảo hành", en: "Warranty" }, value: { vi: "60 tháng", en: "60 months" } }
    ],
    tags: ["bồn tắm", "bravat", "wellness", "đá nhân tạo", "phòng tắm"],
    category_slug: "bathtub"
  },
  // 6. Smart Toilet
  {
    name: { vi: "Bồn Cầu Thông Minh Kohler Veil", en: "Kohler Veil Intelligent Toilet" },
    summary: {
      vi: "Bồn cầu điện tử Kohler Veil thiết kế treo tường sang trọng, điều khiển từ xa, xịt rửa ấm và tự sấy.",
      en: "Kohler Veil wall-hung smart toilet featuring remote control, warm wash, and dry functions."
    },
    description: {
      vi: "Bồn cầu thông minh Kohler Veil thể hiện đỉnh cao của thiết bị phòng tắm hiện đại với kiểu dáng thân kín treo tường gọn gàng, tiết kiệm diện tích và dễ vệ sinh. Thiết bị tích hợp hệ thống xịt rửa điện tử đa chức năng với vòi phun bằng thép không gỉ được tiệt trùng bằng ánh sáng UV sau mỗi lần dùng. Người dùng có thể điều khiển nhiệt độ nước, hướng xịt, sưởi ấm bệ ngồi và gió sấy khô thông qua điều khiển từ xa cầm tay tiện lợi. Hệ thống xả xoáy kép cực mạnh nhưng êm ái, thân thiện môi trường.",
      en: "The Kohler Veil intelligent toilet represents the peak of modern bathroom fixtures. Its wall-hung profile saves space and makes cleaning effortless. It integrates a multi-functional cleaning system with a stainless steel wand sterilized by UV light after each use. A wireless remote regulates water temp, pressure, heated seat, and air dryer. Dual-flush cyclone technology delivers quiet yet powerful flush efficiency."
    },
    material: { vi: "Sứ cao cấp tráng men kháng khuẩn", en: "Premium Anti-bacterial Glazed Ceramic" },
    price_display_text: { vi: "92,000,000 VND", en: "92,000,000 VND" },
    price_min: 92000000,
    price_max: 92000000,
    dimension_display_text: { vi: "675 x 438 x 533 mm", en: "675 x 438 x 533 mm" },
    image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80"
    ],
    specs: [
      { label: { vi: "Thương hiệu", en: "Brand" }, value: { vi: "Kohler (Mỹ)", en: "Kohler (USA)" } },
      { label: { vi: "Chức năng thông minh", en: "Smart Features" }, value: { vi: "Tự mở nắp, vòi phun UV, sưởi ấm, sấy khô", en: "Auto-open lid, UV wand, seat heater, dryer" } },
      { label: { vi: "Hệ thống xả", en: "Flushing system" }, value: { vi: "Xả xoáy áp lực kép", en: "Dual-flush pressure cyclone" } },
      { label: { vi: "Bảo hành", en: "Warranty" }, value: { vi: "36 tháng", en: "36 months" } }
    ],
    tags: ["bồn cầu", "thông minh", "kohler", "sứ", "phòng tắm"],
    category_slug: "toilet"
  },
  // 7. Shower
  {
    name: { vi: "Sen Tắm Âm Tường Mạ Vàng 24K Grohe", en: "Grohe 24K Gold Plated Built-in Shower" },
    summary: {
      vi: "Hệ thống sen tắm mưa khóa nhiệt độ mạ vàng 24K sang trọng, trải nghiệm phun nước êm dịu.",
      en: "Luxury thermostatic rain shower system plated in 24K gold, featuring a soothing water experience."
    },
    description: {
      vi: "Bộ sen tắm âm tường Grohe mạ vàng 24K là kiệt tác nghệ thuật kim hoàn trong phòng tắm của bạn. Đầu sen kích thước lớn 310mm được trang bị công nghệ trộn khí vào nước Grohe DreamSpray, mang lại cảm giác mưa rào êm dịu bao bọc toàn bộ cơ thể. Bộ trộn nhiệt Grohe TurboStat phản ứng tức thì với sự thay đổi áp lực nước, giữ nhiệt độ nước luôn ổn định tuyệt đối ở 38 độ C để tránh nguy cơ bị bỏng. Lớp mạ vàng thật 24K cao cấp được phủ bảo vệ chống ăn mòn hóa chất vượt trội.",
      en: "The Grohe built-in shower system plated in 24K gold is a jewelry masterpiece for your shower enclosure. The massive 310mm head shower distributes water evenly with Grohe DreamSpray technology, simulating a gentle rain bath. The Grohe TurboStat cartridge maintains a safe 38°C temperature, eliminating water temp fluctuations. The real 24K gold plating offers superior anti-corrosion protection."
    },
    material: { vi: "Đồng thau mạ vàng 24K", en: "24K Gold Plated Brass" },
    price_display_text: { vi: "48,500,000 VND", en: "48,500,000 VND" },
    price_min: 48500000,
    price_max: 48500000,
    dimension_display_text: { vi: "Đầu sen Ø310mm, tay sen 120mm", en: "Head shower Ø310mm, hand shower 120mm" },
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80"
    ],
    specs: [
      { label: { vi: "Hãng sản xuất", en: "Manufacturer" }, value: { vi: "Grohe (Đức)", en: "Grohe (Germany)" } },
      { label: { vi: "Chất liệu lõi", en: "Body material" }, value: { vi: "Đồng thau FAS", en: "FAS Brass" } },
      { label: { vi: "Công nghệ khóa nhiệt", en: "Thermal safety" }, value: { vi: "Grohe TurboStat ở 38°C", en: "Grohe TurboStat at 38°C" } },
      { label: { vi: "Bảo hành", en: "Warranty" }, value: { vi: "60 tháng", en: "60 months" } }
    ],
    tags: ["sen tắm", "grohe", "mạ vàng 24k", "âm tường", "phòng tắm"],
    category_slug: "shower"
  },
  // 8. Floor Tile
  {
    name: { vi: "Gạch Vân Đá Calacatta Gold 80x160cm", en: "Calacatta Gold Porcelain Tile 80x160cm" },
    summary: {
      vi: "Gạch porcelain khổ lớn vân đá cẩm thạch Calacatta với các vệt vân vàng sang trọng nhập khẩu Tây Ban Nha.",
      en: "Large format porcelain tiles with Calacatta Gold marble veins, imported from Spain."
    },
    description: {
      vi: "Gạch Calacatta Gold cao cấp tái hiện hoàn hảo vẻ đẹp kiêu sa của đá cẩm thạch tự nhiên Calacatta của Ý với các đường vân xám điểm xuyết sắc vàng đồng tinh tế trên nền men trắng sứ. Xương gạch làm bằng đất sét porcelain tinh khiết và bột đá thạch anh, ép dưới lực ép cực cao và nung ở 1200 độ C mang lại độ chịu lực vượt trội (chống nứt vỡ) và độ hút nước gần như bằng 0 (kháng thấm nước tuyệt đối). Bề mặt phủ men vi tinh đánh bóng kim cương lấp lánh.",
      en: "Calacatta Gold tiles replicate the exquisite beauty of natural Calacatta marble, showcasing deep grey veins touched with golden accents on a pure white background. The dense porcelain body is pressed and fired at 1200°C for high break strength and extremely low water absorption (<0.1%). The surface is finished with diamond-polished micro-crystal glaze for a mirror-like shine."
    },
    material: { vi: "Gạch Porcelain (Bột đá thạch anh)", en: "Porcelain Quartz" },
    price_display_text: { vi: "1,150,000 VND/m²", en: "1,150,000 VND/m²" },
    price_min: 1150000,
    price_max: 1150000,
    dimension_display_text: { vi: "800 x 1600 x 9 mm", en: "800 x 1600 x 9 mm" },
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
    ],
    specs: [
      { label: { vi: "Xuất xứ", en: "Origin" }, value: { vi: "Tây Ban Nha", en: "Spain" } },
      { label: { vi: "Bề mặt", en: "Surface finish" }, value: { vi: "Men bóng kính (Polished)", en: "High Gloss Polished" } },
      { label: { vi: "Độ hút nước", en: "Water absorption" }, value: { vi: "< 0.1% (kháng ẩm tuyệt đối)", en: "< 0.1% (high resistance)" } },
      { label: { vi: "Quy cách đóng gói", en: "Packaging" }, value: { vi: "Hộp 2 viên (2.56 m²)", en: "2 pcs per box (2.56 m²)" } }
    ],
    tags: ["gạch", "porcelain", "calacatta gold", "lát nền", "vân đá"],
    category_slug: "floor"
  }
];

// Helper to generate a large list of 75 products based on the base models
export const mockProducts: MockProduct[] = [];

// Let's generate 75 products (around 5-6 products per category)
const adjectiveVi = ["Hiện đại", "Cổ điển", "Tối giản", "Luxury", "Hoàng gia", "Eco-friendly", "Cao cấp", "Bản giới hạn"];
const adjectiveEn = ["Modern", "Classic", "Minimalist", "Luxury", "Royal", "Eco-friendly", "Premium", "Limited Edition"];

const materialVariations = [
  { vi: "Gỗ óc chó FAS tự nhiên", en: "Natural FAS Walnut" },
  { vi: "Gỗ sồi trắng Mỹ", en: "American White Oak" },
  { vi: "Đồng thau đúc màu Champagne", en: "Champagne Cast Brass" },
  { vi: "Sứ men Nano kháng khuẩn", en: "Nano-glazed Ceramic" },
  { vi: "Đá Solid Surface nhân tạo", en: "Solid Surface Stone" },
  { vi: "Gạch xương bán sứ nhập khẩu", en: "Imported Porcelain Quartz" }
];

let idCounter = 1;

mockCategories.forEach((cat) => {
  // Find a base product to clone properties or use default values
  const base = baseProducts.find((b) => b.category_slug === cat.slug) || baseProducts[0];
  const countForCategory = cat.group_key === "wood" ? 6 : 5; // 7*6 + 5*5 + 2*5 = 77 products total

  for (let i = 1; i <= countForCategory; i++) {
    const adjIdx = (idCounter + i) % adjectiveVi.length;
    const nameVi = `${cat.name.vi} ${adjectiveVi[adjIdx]} PD-${idCounter.toString().padStart(3, "0")}`;
    const nameEn = `${adjectiveEn[adjIdx]} ${cat.name.en} PD-${idCounter.toString().padStart(3, "0")}`;
    
    const matVar = materialVariations[idCounter % materialVariations.length];
    
    const multiplier = 0.5 + (idCounter % 5) * 0.3; // values vary from 0.5x to 1.7x base price
    const pMin = Math.round((base.price_min * multiplier) / 50000) * 50000;
    const pMax = pMin;
    const formattedPrice = `${pMin.toLocaleString("en-US")} VND`;
    const priceTextVi = cat.group_key === "tiles" ? `${formattedPrice}/m²` : formattedPrice;
    const priceTextEn = cat.group_key === "tiles" ? `${formattedPrice}/m²` : formattedPrice;

    const prKey = cat.group_key;
    const refCode = `PD-${prKey.substring(0, 2).toUpperCase()}-${idCounter.toString().padStart(4, "0")}`;
    const slug = `${cat.slug}-${adjectiveEn[adjIdx].toLowerCase()}-pd-${idCounter}`;

    const isFeatured = i === 1 && idCounter % 3 === 0;

    // Custom images for visual variety
    let imgUrl = base.image;
    if (cat.slug === "sofa") {
      imgUrl = i % 2 === 0 ? "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=800&q=80" : "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80";
    } else if (cat.slug === "coffee-table") {
      imgUrl = i % 2 === 0 ? "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=800&q=80" : "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80";
    } else if (cat.slug === "dining-table") {
      imgUrl = "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80";
    } else if (cat.slug === "chair") {
      imgUrl = "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=800&q=80";
    } else if (cat.slug === "bed") {
      imgUrl = "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80";
    } else if (cat.slug === "wardrobe") {
      imgUrl = "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80";
    } else if (cat.slug === "bathtub") {
      imgUrl = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80";
    } else if (cat.slug === "toilet") {
      imgUrl = "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80";
    } else if (cat.slug === "shower") {
      imgUrl = "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80";
    } else if (cat.group_key === "tiles") {
      imgUrl = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
    }

    const getMaterialKey = (matStr: string) => {
      const s = matStr.toLowerCase();
      if (s.includes("walnut") || s.includes("óc chó")) return "walnut";
      if (s.includes("oak") || s.includes("sồi")) return "oak";
      if (s.includes("marble") || s.includes("cẩm thạch")) return "marble";
      if (s.includes("brass") || s.includes("đồng thau")) return "brass";
      if (s.includes("porcelain") || s.includes("sứ") || s.includes("gạch")) return "stone";
      return "walnut";
    };
    const matKey = getMaterialKey(matVar.en);
    const styleKey = (adjIdx % 3 === 0) ? "heritage" : (adjIdx % 3 === 1) ? "minimal" : "resort";
    const colKey = (adjIdx % 3 === 0) ? "heritage" : (adjIdx % 3 === 1) ? "atelier" : "wellness";
    const toneKey = (adjIdx % 3 === 0) ? "warm" : (adjIdx % 3 === 1) ? "dark" : "light";
    const availKey = (idCounter % 3 === 0) ? "showroom" : (idCounter % 3 === 1) ? "made-to-order" : "limited";
    
    let roomKey = "living";
    if (prKey === "sanitary") roomKey = "bath";
    else if (prKey === "tiles") roomKey = "surface";
    else if (idCounter % 2 !== 0) roomKey = "lounge";

    mockProducts.push({
      id: `prod-${idCounter}`,
      reference_code: refCode,
      slug: slug,
      category_id: cat.id,
      group_key: prKey,
      category_slug: cat.slug,
      category_name: cat.name,
      featured: isFeatured,
      published_at: new Date(2026, 4, 10 + (idCounter % 20)).toISOString(),
      status: i === countForCategory && idCounter % 5 === 0 ? "draft" : "published", // Make some drafts
      primary_media: { url: imgUrl },
      media: base.gallery.map((g, idx) => ({ url: idx === 0 ? imgUrl : g })),
      price_min: pMin,
      price_max: pMax,
      currency: "VND",
      price_display_text: { vi: priceTextVi, en: priceTextEn },
      dimension_display_text: base.dimension_display_text,
      name: { vi: nameVi, en: nameEn },
      summary: {
        vi: `${base.summary.vi} Model ${refCode} mang phong cách tinh tế.`,
        en: `${base.summary.en} Model ${refCode} with a sophisticated touch.`
      },
      description: base.description,
      material: matVar,
      room_key: roomKey,
      material_key: matKey,
      style_key: styleKey,
      collection_key: colKey,
      tone_key: toneKey,
      availability_key: availKey,
      specs: base.specs.map((spec) => ({
        label: spec.label,
        value: (spec.label.en === "Material" || spec.label.en === "Core Material" || spec.label.vi === "Chất liệu")
          ? matVar
          : spec.value
      })),
      tags: base.tags.concat([cat.slug, adjectiveEn[adjIdx].toLowerCase()]),
      attributes: base.specs.map((spec) => ({
        label: spec.label.vi,
        valueText: spec.value.vi
      }))
    });

    idCounter++;
  }
});
