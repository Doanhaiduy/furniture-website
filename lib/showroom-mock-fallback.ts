import { imageAssets } from "./showroom-constants";

export const products = [
  {
    slug: "sofa-curve-velour",
    referenceCode: "PD-S2401",
    categoryKey: "wood",
    materialKey: "walnut",
    roomKey: "living",
    styleKey: "heritage",
    collectionKey: "heritage",
    toneKey: "warm",
    availabilityKey: "showroom",
    status: "published" as const,
    featured: true,
    image: imageAssets.sofa,
    gallery: [imageAssets.sofa, imageAssets.texture, imageAssets.room],
    price: { vi: "45,000,000 VND", en: "45,000,000 VND" },
    oldPrice: { vi: "52,000,000 VND", en: "52,000,000 VND" },
    name: { vi: "Sofa Curve Velour", en: "Sofa Curve Velour" },
    category: { vi: "Sofa", en: "Sofa" },
    summary: {
      vi: "Sofa cao cấp bọc vải Velour với đường cong tinh tế, khung gỗ sồi tự nhiên.",
      en: "Premium velour sofa with a soft curved silhouette and natural oak frame.",
    },
    description: {
      vi: "Sofa Curve Velour là một kết cấu thuộc bộ sưu tập Heritage, lấy cảm hứng từ đường cong mềm mại trong kiến trúc Phục Hưng. Sản phẩm phù hợp phòng khách cao cấp, căn hộ mẫu và không gian tiếp khách riêng tư.",
      en: "Sofa Curve Velour belongs to the Heritage collection and is inspired by graceful architectural curves. It fits refined living rooms, show apartments and private reception spaces.",
    },
    specs: [
      { label: { vi: "Loại gỗ", en: "Wood type" }, value: { vi: "Gỗ sồi tự nhiên", en: "Natural oak" } },
      { label: { vi: "Kích thước", en: "Dimensions" }, value: { vi: "2400 x 950 x 850 mm", en: "2400 x 950 x 850 mm" } },
      { label: { vi: "Bảo hành", en: "Warranty" }, value: { vi: "24 tháng", en: "24 months" } },
    ],
    tags: ["Gỗ sồi", "Velour", "Heritage"],
  },
  {
    slug: "ban-tra-marble-round",
    referenceCode: "PD-T2402",
    categoryKey: "wood",
    materialKey: "marble",
    roomKey: "living",
    styleKey: "heritage",
    collectionKey: "atelier",
    toneKey: "light",
    availabilityKey: "showroom",
    status: "published" as const,
    featured: true,
    image: imageAssets.table,
    gallery: [imageAssets.table, imageAssets.room],
    price: { vi: "12,500,000 VND", en: "12,500,000 VND" },
    name: { vi: "Bàn Trà Marble Round", en: "Marble Round Coffee Table" },
    category: { vi: "Bàn trà", en: "Coffee table" },
    summary: {
      vi: "Mặt đá marble Calacatta, chân gỗ walnut cân bằng giữa cổ điển và hiện đại.",
      en: "Calacatta marble top and walnut base balancing classic and modern cues.",
    },
    description: {
      vi: "Bàn trà Marble Round tạo điểm nhấn vật liệu cho phòng khách, sử dụng mặt đá chống thấm và chân gỗ xử lý bề mặt mờ.",
      en: "Marble Round anchors the living room with a sealed stone surface and matte-finished wooden base.",
    },
    specs: [
      { label: { vi: "Mặt bàn", en: "Top" }, value: { vi: "Đá marble", en: "Marble" } },
      { label: { vi: "Đường kính", en: "Diameter" }, value: { vi: "900 mm", en: "900 mm" } },
    ],
    tags: ["Đá Marble", "Walnut"],
  },
  {
    slug: "ke-tivi-minimalist-wood",
    referenceCode: "PD-K2404",
    categoryKey: "wood",
    materialKey: "walnut",
    roomKey: "living",
    styleKey: "minimal",
    collectionKey: "atelier",
    toneKey: "dark",
    availabilityKey: "made-to-order",
    status: "published" as const,
    featured: true,
    image: imageAssets.cabinet,
    gallery: [imageAssets.cabinet],
    price: { vi: "22,000,000 VND", en: "22,000,000 VND" },
    name: { vi: "Kệ Tivi Minimalist Wood", en: "Minimalist Wood TV Cabinet" },
    category: { vi: "Kệ tivi", en: "TV cabinet" },
    summary: {
      vi: "Kệ tivi gỗ veneer tối màu với ngăn kéo giảm chấn.",
      en: "Dark veneer TV cabinet with soft-close drawers.",
    },
    description: {
      vi: "Thiết kế thấp, đường nét gọn và tay nắm ẩn giúp phòng khách giữ được sự yên tĩnh thị giác.",
      en: "A low profile, clean lines and concealed pulls keep the living room visually calm.",
    },
    specs: [
      { label: { vi: "Dài", en: "Length" }, value: { vi: "2200 mm", en: "2200 mm" } },
      { label: { vi: "Chất liệu", en: "Material" }, value: { vi: "Gỗ veneer walnut", en: "Walnut veneer" } },
      { label: { vi: "Bảo hành", en: "Warranty" }, value: { vi: "36 tháng", en: "36 months" } },
    ],
    tags: ["Veneer", "Minimal", "Modern"],
  },
  {
    slug: "sen-tam-ma-vang-24k",
    referenceCode: "PD-B2405",
    categoryKey: "sanitary",
    materialKey: "brass",
    roomKey: "bath",
    styleKey: "resort",
    collectionKey: "wellness",
    toneKey: "warm",
    availabilityKey: "limited",
    status: "published" as const,
    featured: true,
    image: imageAssets.room,
    gallery: [imageAssets.room],
    price: { vi: "12,500,000 VND", en: "12,500,000 VND" },
    name: { vi: "Sen Tắm Mạ Vàng 24K", en: "24K Gold Plated Shower Set" },
    category: { vi: "Thiết bị vệ sinh", en: "Sanitary ware" },
    summary: {
      vi: "Bộ sen tắm mạ vàng với van điều nhiệt và bề mặt chống bám cặn.",
      en: "Gold plated shower set with thermostatic valve and anti-scale finish.",
    },
    description: {
      vi: "Phù hợp phòng tắm master và biệt thự nghỉ dưỡng, nhấn mạnh cảm giác khách sạn cao cấp.",
      en: "Designed for master bathrooms and villas with a hotel-grade finish.",
    },
    specs: [
      { label: { vi: "Chất liệu", en: "Material" }, value: { vi: "Đồng thau", en: "Brass" } },
      { label: { vi: "Lớp mạ", en: "Plating" }, value: { vi: "Vàng 24K", en: "24K Gold" } },
      { label: { vi: "Bảo hành", en: "Warranty" }, value: { vi: "60 tháng", en: "60 months" } },
    ],
    tags: ["Brass", "24K", "Luxury"],
  },
  {
    slug: "tu-ao-go-soi-classic",
    referenceCode: "PD-W2406",
    categoryKey: "wood",
    materialKey: "oak",
    roomKey: "bedroom",
    styleKey: "classic",
    collectionKey: "heritage",
    toneKey: "warm",
    availabilityKey: "showroom",
    status: "published" as const,
    featured: true,
    image: imageAssets.texture,
    gallery: [imageAssets.texture, imageAssets.room],
    price: { vi: "38,000,000 VND", en: "38,000,000 VND" },
    name: { vi: "Tủ Áo Gỗ Sồi Classic", en: "Classic Oak Wardrobe" },
    category: { vi: "Tủ áo", en: "Wardrobe" },
    summary: {
      vi: "Tủ áo 4 cánh gỗ sồi tự nhiên với hệ thống ray trượt êm ái và ngăn kéo âm tủ cao cấp.",
      en: "4-door oak wardrobe with smooth sliding system and premium built-in drawers.",
    },
    description: {
      vi: "Tủ áo Classic thuộc bộ sưu tập Heritage, thiết kế cho phòng ngủ master với không gian lưu trữ tối ưu. Bề mặt hoàn thiện tự nhiên giữ được vân gỗ và màu ấm của gỗ sồi Bắc Mỹ.",
      en: "Classic Wardrobe from Heritage collection designed for master bedrooms with optimal storage. Natural finish preserves the grain and warm tone of North American oak.",
    },
    specs: [
      { label: { vi: "Kích thước", en: "Dimensions" }, value: { vi: "2400 x 600 x 2200 mm", en: "2400 x 600 x 2200 mm" } },
      { label: { vi: "Chất liệu", en: "Material" }, value: { vi: "Gỗ sồi tự nhiên", en: "Natural oak" } },
      { label: { vi: "Số cánh", en: "Doors" }, value: { vi: "4 cánh", en: "4 doors" } },
      { label: { vi: "Bảo hành", en: "Warranty" }, value: { vi: "48 tháng", en: "48 months" } },
    ],
    tags: ["Gỗ sồi", "Classic", "Bedroom"],
  },
];

export const blogPosts = [
  {
    slug: "bi-quyet-chon-go-oc-cho",
    image: imageAssets.blog1,
    category: { vi: "Kiến thức đồ gỗ", en: "Wood knowledge" },
    date: "2026-05-20",
    readTime: { vi: "6 phút đọc", en: "6 min read" },
    title: {
      vi: "Bí quyết chọn gỗ óc chó cho nội thất bền vững",
      en: "How to choose walnut wood for lasting interiors",
    },
    excerpt: {
      vi: "Nhận biết vân gỗ, độ ẩm và quy trình xử lý bề mặt trước khi đầu tư cho nội thất cao cấp.",
      en: "Understand grain, moisture and finishing process before investing in premium interiors.",
    },
  },
  {
    slug: "xu-huong-phong-tam-2026",
    image: imageAssets.blog2,
    category: { vi: "Thiết bị vệ sinh", en: "Sanitary ware" },
    date: "2026-05-14",
    readTime: { vi: "5 phút đọc", en: "5 min read" },
    title: {
      vi: "Xu hướng phòng tắm khách sạn trong nhà ở hiện đại",
      en: "Hotel-inspired bathroom trends for modern homes",
    },
    excerpt: {
      vi: "Các lớp vật liệu, ánh sáng và phụ kiện giúp phòng tắm trở thành không gian nghỉ dưỡng.",
      en: "Material layers, lighting and accessories that turn bathrooms into wellness spaces.",
    },
  },
  {
    slug: "phoi-gach-go-va-da",
    image: imageAssets.texture,
    category: { vi: "Vật liệu hoàn thiện", en: "Finishing materials" },
    date: "2026-05-02",
    readTime: { vi: "4 phút đọc", en: "4 min read" },
    title: {
      vi: "Phối gạch, gỗ và đá để không gian có chiều sâu",
      en: "Combining tile, wood and stone for visual depth",
    },
    excerpt: {
      vi: "Cách cân bằng bề mặt lạnh và ấm để không gian sang trọng nhưng vẫn gần gũi.",
      en: "Balance cool and warm surfaces to keep spaces premium yet welcoming.",
    },
  },
];

export const showrooms = [
  {
    code: "HN",
    image: imageAssets.showroom,
    name: { vi: "Hà Nội - Flagship Store", en: "Hanoi Flagship Store" },
    address: {
      vi: "123 Trần Duy Hưng, Cầu Giấy, Hà Nội",
      en: "123 Tran Duy Hung, Cau Giay, Hanoi",
    },
    hotline: "1900 1234",
    hours: { vi: "08:00 - 20:00 hằng ngày", en: "08:00 - 20:00 daily" },
    mapUrl: "https://www.google.com/maps",
  },
  {
    code: "HCM",
    image: imageAssets.showroom2,
    name: { vi: "TP. Hồ Chí Minh", en: "Ho Chi Minh City" },
    address: {
      vi: "456 Nguyễn Thị Minh Khai, Quận 1, TP. HCM",
      en: "456 Nguyen Thi Minh Khai, District 1, HCMC",
    },
    hotline: "1900 5678",
    hours: { vi: "08:30 - 19:30 hằng ngày", en: "08:30 - 19:30 daily" },
    mapUrl: "https://www.google.com/maps",
  },
  {
    code: "DN",
    image: imageAssets.room,
    name: { vi: "Đà Nẵng Experience Studio", en: "Da Nang Experience Studio" },
    address: {
      vi: "88 Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
      en: "88 Nguyen Van Linh, Hai Chau, Da Nang",
    },
    hotline: "1900 8888",
    hours: { vi: "09:00 - 18:00", en: "09:00 - 18:00" },
    mapUrl: "https://www.google.com/maps",
  },
];

export const blogArticleContent = {
  "bi-quyet-chon-go-oc-cho": {
    takeaways: [
      {
        vi: "Ưu tiên nguồn gỗ rõ ràng, độ ẩm ổn định và quy trình sấy phù hợp khí hậu Việt Nam.",
        en: "Prioritize clear sourcing, stable moisture and drying suitable for Vietnam's climate.",
      },
      {
        vi: "Quan sát vân gỗ, màu sắc và độ hoàn thiện dưới ánh sáng tự nhiên lẫn ánh sáng showroom.",
        en: "Check grain, color and finishing under both daylight and showroom lighting.",
      },
      {
        vi: "Yêu cầu tư vấn bảo hành, chăm sóc bề mặt và điều kiện lắp đặt trước khi chốt vật liệu.",
        en: "Confirm warranty, surface care and installation conditions before finalizing materials.",
      },
    ],
    quote: {
      vi: "Một món đồ gỗ tốt không chỉ đẹp ở ngày bàn giao; nó phải giữ được nhịp sống của gia đình trong nhiều năm.",
      en: "A good wooden piece is not only beautiful on handover day; it should keep pace with family life for years.",
    },
    sections: [
      {
        id: "nguon-goc",
        title: {
          vi: "Bắt đầu từ nguồn gốc và độ ổn định",
          en: "Start with sourcing and stability",
        },
        body: {
          vi: "Gỗ óc chó cao cấp cần có hồ sơ nguồn gốc, thông tin sấy và kiểm soát độ ẩm rõ ràng. Khi khí hậu thay đổi theo mùa, vật liệu chưa ổn định dễ cong vênh, nứt chân chim hoặc lệch màu sau một thời gian sử dụng.",
          en: "Premium walnut should come with clear sourcing, drying and moisture control information. When seasonal humidity changes, unstable material can warp, crack or shift color after use.",
        },
      },
      {
        id: "van-go",
        title: {
          vi: "Đọc vân gỗ như một lớp thiết kế",
          en: "Read the grain as a design layer",
        },
        body: {
          vi: "Vân gỗ đẹp phải có nhịp điệu tự nhiên, không bị ghép vá thiếu chủ đích. Với các bề mặt lớn như bàn, tủ hoặc vách, cách đảo vân và nối tấm quyết định cảm giác cao cấp của toàn bộ không gian.",
          en: "Beautiful grain has a natural rhythm, not a patched look. On large tables, cabinets or wall panels, grain matching and board joining define the premium feel of the entire space.",
        },
        image: imageAssets.woodWall,
      },
      {
        id: "hoan-thien",
        title: {
          vi: "Bề mặt hoàn thiện phải phục vụ đời sống thật",
          en: "Finishing must serve real living",
        },
        body: {
          vi: "Một lớp hoàn thiện tốt cân bằng giữa cảm giác chạm, độ bền và khả năng bảo trì. Hãy kiểm tra cạnh, góc, mặt sau, ray trượt và những chi tiết ít thấy, vì đó là nơi thể hiện tay nghề và tiêu chuẩn sản xuất.",
          en: "A good finish balances touch, durability and maintainability. Inspect edges, corners, backs, runners and hidden details because they reveal craft and production standards.",
        },
      },
      {
        id: "showroom",
        title: {
          vi: "So sánh trực tiếp tại showroom",
          en: "Compare directly in the showroom",
        },
        body: {
          vi: "Mẫu vật liệu cần được xem cạnh đá, gạch, ánh sáng và thiết bị đi kèm. Tại showroom, đội ngũ tư vấn có thể đặt các mẫu cạnh nhau để kiểm tra tông màu, tỷ lệ và ngân sách trước khi lên phương án.",
          en: "Material samples should be viewed beside stone, tile, lighting and accompanying fixtures. In the showroom, consultants can compare samples for tone, proportion and budget before planning.",
        },
        image: imageAssets.showroom,
      },
    ],
  },
  "xu-huong-phong-tam-2026": {
    takeaways: [
      {
        vi: "Phòng tắm cao cấp đang chuyển từ chức năng thuần túy sang trải nghiệm wellness tại nhà.",
        en: "Premium bathrooms are moving from pure function toward at-home wellness experiences.",
      },
      {
        vi: "Ánh sáng, lớp vật liệu và thiết bị tiết kiệm nước quyết định cảm giác sử dụng hằng ngày.",
        en: "Lighting, material layers and water-efficient fixtures define daily comfort.",
      },
      {
        vi: "Nên chốt thiết bị chính trước khi hoàn thiện đường nước, điện và bề mặt ốp lát.",
        en: "Confirm key fixtures before finalizing plumbing, electrical and tile surfaces.",
      },
    ],
    quote: {
      vi: "Phòng tắm tốt giống một suite nhỏ: yên tĩnh, dễ chăm sóc và tạo cảm giác nghỉ ngơi mỗi ngày.",
      en: "A good bathroom feels like a small suite: quiet, easy to maintain and restorative every day.",
    },
    sections: [
      {
        id: "wellness",
        title: { vi: "Wellness trở thành tiêu chuẩn mới", en: "Wellness becomes the new standard" },
        body: {
          vi: "Sen tắm nhiệt, bồn tắm độc lập, bề mặt chống bám cặn và ánh sáng dịu đang giúp phòng tắm trở thành không gian hồi phục năng lượng sau ngày dài.",
          en: "Thermostatic showers, freestanding tubs, anti-scale surfaces and soft lighting are turning bathrooms into places to recover after long days.",
        },
      },
      {
        id: "vat-lieu",
        title: { vi: "Lớp vật liệu tạo chiều sâu", en: "Material layers create depth" },
        body: {
          vi: "Đá, gạch khổ lớn, gỗ chịu ẩm và kim loại ấm có thể phối cùng nhau nếu kiểm soát đúng tông màu và độ phản chiếu.",
          en: "Stone, large-format tile, moisture-resistant wood and warm metal can work together when tone and reflectivity are controlled.",
        },
        image: imageAssets.room,
      },
      {
        id: "lap-dat",
        title: { vi: "Thiết kế kỹ thuật phải đi trước", en: "Technical planning comes first" },
        body: {
          vi: "Vị trí thoát sàn, chiều cao vòi, áp lực nước và khe co giãn cần được kiểm tra sớm để tránh phát sinh khi lắp đặt.",
          en: "Floor drains, tap height, water pressure and expansion joints should be checked early to prevent installation issues.",
        },
      },
    ],
  },
  "phoi-gach-go-va-da": {
    takeaways: [
      {
        vi: "Một bảng vật liệu tốt cần có điểm ấm, điểm lạnh và bề mặt trung hòa để tạo chiều sâu.",
        en: "A strong material palette needs warmth, coolness and neutral surfaces for depth.",
      },
      {
        vi: "Không nên phối quá nhiều vân mạnh trong cùng một trường nhìn.",
        en: "Avoid combining too many strong grains or veins in the same sightline.",
      },
      {
        vi: "Ánh sáng quyết định cách gạch, gỗ và đá đọc màu trong không gian thật.",
        en: "Lighting determines how tile, wood and stone read in the real space.",
      },
    ],
    quote: {
      vi: "Sang trọng không đến từ vật liệu đắt nhất, mà từ cách các bề mặt lắng nghe nhau.",
      en: "Luxury does not come from the most expensive material, but from surfaces that listen to each other.",
    },
    sections: [
      {
        id: "bang-vat-lieu",
        title: { vi: "Xây bảng vật liệu theo lớp", en: "Build the palette in layers" },
        body: {
          vi: "Hãy chọn một bề mặt chính, một bề mặt nhấn và một bề mặt nền. Cách phân vai này giúp không gian có chiều sâu mà không bị rối.",
          en: "Choose one primary surface, one accent surface and one background surface. This hierarchy adds depth without visual noise.",
        },
      },
      {
        id: "ti-le",
        title: { vi: "Tỷ lệ quan trọng hơn số lượng", en: "Proportion matters more than quantity" },
        body: {
          vi: "Gỗ có thể làm ấm đá, còn gạch sáng giúp cân bằng mảng tối. Điều quan trọng là kiểm soát diện tích từng vật liệu trong trường nhìn chính.",
          en: "Wood can warm stone, while light tile balances darker planes. The key is controlling how much of each material appears in the main view.",
        },
        image: imageAssets.texture,
      },
      {
        id: "anh-sang",
        title: { vi: "Kiểm tra dưới ánh sáng thật", en: "Test under real lighting" },
        body: {
          vi: "Cùng một mẫu đá hoặc gạch có thể đổi sắc dưới ánh sáng vàng, trắng hoặc ánh sáng tự nhiên. Mẫu nên được xem tại nhiều thời điểm trước khi chốt.",
          en: "The same stone or tile can shift under warm, cool or daylight conditions. Samples should be reviewed at multiple times before approval.",
        },
      },
    ],
  },
};

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getBlogArticleContent(slug: string) {
  return blogArticleContent[slug as keyof typeof blogArticleContent] ?? blogArticleContent["bi-quyet-chon-go-oc-cho"];
}
