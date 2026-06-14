export type MockBlogSection = {
  id: string;
  title: { vi: string; en: string };
  body: { vi: string; en: string };
  image?: string;
};

export type MockBlogPost = {
  id: string;
  slug: string;
  title: { vi: string; en: string };
  excerpt: { vi: string; en: string };
  category_name: { vi: string; en: string };
  category_slug: string;
  author_name: string;
  status: "published" | "draft";
  featured: boolean;
  published_at: string;
  cover_media: { url: string };
  readTime: { vi: string; en: string };
  takeaways: { vi: string; en: string }[];
  quote: { vi: string; en: string };
  sections: MockBlogSection[];
};

export const mockBlogs: MockBlogPost[] = [
  {
    id: "blog-1",
    slug: "bi-quyet-chon-go-oc-cho",
    category_slug: "wood-knowledge",
    category_name: { vi: "Kiến thức đồ gỗ", en: "Wood Knowledge" },
    author_name: "KTS. Hoàng Minh Quân",
    status: "published",
    featured: true,
    published_at: "2026-05-20T09:00:00Z",
    readTime: { vi: "6 phút đọc", en: "6 min read" },
    cover_media: { url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDS37ogl_A-pJSG7Rs7CG2CVV3nR6iVnbjUPlrSgc4sy5tGrxHiVxN63GtuhWlqm_2jrnZ8b5lh6GEfl1EnGAxmtb-RfRAGhurKL3au-oZrdjJefVAZhO1XeX6BirruL8uMMRrk0w_qOm_38DR6zkFogxTQxlsAksF_pqVb8c0j7-eRqx_N6X3PVI3GT3l5o9RNR0ub9ZJPgeUV0T48yrnB5U-F921QZ6YQwlxCQ5SV3KP16eS8qbsncJc0bOQPiBnLxbhbsYiEKkA" },
    title: {
      vi: "Bí quyết chọn gỗ óc chó cho nội thất bền vững",
      en: "How to choose walnut wood for lasting interiors"
    },
    excerpt: {
      vi: "Nhận biết vân gỗ, độ ẩm và quy trình xử lý bề mặt trước khi đầu tư cho nội thất gỗ cao cấp.",
      en: "Understand grain patterns, moisture levels, and finishing processes before investing in premium walnut furniture."
    },
    takeaways: [
      {
        vi: "Ưu tiên nguồn gỗ rõ ràng (nhập khẩu FAS Bắc Mỹ) có độ ổn định cao và màu nâu sậm tự nhiên.",
        en: "Prioritize certified FAS North American walnut for structural stability and deep natural brown tones."
      },
      {
        vi: "Quan sát vân gỗ mộc (vân núi, vân sóng) tinh xảo, tránh các thớ gỗ bị vá mộng nhiều.",
        en: "Inspect clean wood grains (cathedral and wavy patterns) and avoid heavily patched joints."
      },
      {
        vi: "Kiểm tra kỹ lớp hoàn thiện (sơn PU mờ hoặc lau dầu) để giữ cảm giác sờ mộc tự nhiên nhất.",
        en: "Verify the protective coating (matte PU or botanical oil) to preserve the tactile feel of real wood."
      }
    ],
    quote: {
      vi: "Một món đồ gỗ tốt không chỉ đẹp ở ngày bàn giao; nó phải giữ được nhịp sống của gia đình trong nhiều năm.",
      en: "A good wooden piece is not only beautiful on handover day; it should keep pace with family life for years."
    },
    sections: [
      {
        id: "nguon-goc",
        title: { vi: "Bắt đầu từ nguồn gốc và độ ổn định", en: "Start with sourcing and stability" },
        body: {
          vi: "Gỗ óc chó cao cấp cần có hồ sơ nguồn gốc, thông tin sấy và kiểm soát độ ẩm rõ ràng. Khi khí hậu thay đổi theo mùa, vật liệu chưa ổn định dễ cong vênh, nứt chân chim hoặc lệch màu sau một thời gian sử dụng.",
          en: "Premium walnut should come with clear sourcing, drying, and moisture control information. When seasonal humidity changes, unstable material can warp, crack, or shift color after use."
        }
      },
      {
        id: "van-go",
        title: { vi: "Đọc vân gỗ như một lớp thiết kế", en: "Read the grain as a design layer" },
        body: {
          vi: "Vân gỗ đẹp phải có nhịp điệu tự nhiên, không bị ghép vá thiếu chủ đích. Với các bề mặt lớn như bàn, tủ hoặc vách, cách đảo vân và nối tấm quyết định cảm giác cao cấp của toàn bộ không gian.",
          en: "Beautiful grain has a natural rhythm, not a patched look. On large tables, cabinets, or wall panels, grain matching and board joining define the premium feel of the entire space."
        },
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAforj3VX-FTBvzBL9xk8xZsyRFeSrCTCZroaw5xiKiW94p97bHwS5p8v7NPz1CEkw5kcZcO8Qhg50HbSL08FWNepcJQvILK7uoRkp-yXAMFVWrODBkXn_ljL5x1r892Y4CCJK6PiLLH_ZVLw-_yvANxLy70jQTG3SyAkhvnKSHdiDphu2VvxBxS50kNU30Klji9hXESZM6sKB-BJixTEwUya_W-dPDnizTqnuvjBX-hpj088KerYWV3pBNhSzQ-mp6IaevUWw-Xg4"
      }
    ]
  },
  {
    id: "blog-2",
    slug: "xu-huong-phong-tam-2026",
    category_slug: "sanitary-trends",
    category_name: { vi: "Thiết bị vệ sinh", en: "Sanitary Ware" },
    author_name: "KTS. Lê Hồng Hạnh",
    status: "published",
    featured: false,
    published_at: "2026-05-14T10:30:00Z",
    readTime: { vi: "5 phút đọc", en: "5 min read" },
    cover_media: { url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDpdlBG3oOmLlm4MxeICx-_posDDjBMKRxVkEGLpIYvctU2Y1CSdKWx7Sb02kTksn-tiqDCcpkts05NxdtILMpa4u8kp2hV34kIUHrxROPXtzFGsKZdVLBfPkfMpjpONpj8xtGReXYY2I287ShXtoKYRv6s7j6ytsm36AJM4eVXVdkW1pJ4DEvEEY426EScKm-QFmniPeMwspEOqrHf_iySdko9_rhYgkUi_7jzvgzKoR31tsWhuu1yj41rrLORwU6QDlFK8qQE1eU" },
    title: {
      vi: "Xu hướng phòng tắm khách sạn trong nhà ở hiện đại",
      en: "Hotel-inspired bathroom trends for modern homes"
    },
    excerpt: {
      vi: "Các lớp vật liệu, ánh sáng và thiết bị thông minh giúp phòng tắm trở thành không gian nghỉ dưỡng thực thụ.",
      en: "Material layers, lighting, and smart fixtures that turn bathrooms into true wellness retreats."
    },
    takeaways: [
      {
        vi: "Phòng tắm hiện đại đang chuyển dịch từ công năng thuần túy sang trải nghiệm thư giãn tinh thần.",
        en: "Modern bathrooms are shifting from functional utilities to cognitive relaxation zones."
      },
      {
        vi: "Ứng dụng các thiết bị treo tường như bồn cầu âm tường để tạo khoảng thoáng chân sàn tối đa.",
        en: "Utilize wall-hung fixtures like concealed toilets to maximize floor space and clean aesthetics."
      }
    ],
    quote: {
      vi: "Phòng tắm tốt giống một suite nhỏ: yên tĩnh, dễ chăm sóc và tạo cảm giác nghỉ ngơi mỗi ngày.",
      en: "A good bathroom feels like a small suite: quiet, easy to maintain, and restorative every day."
    },
    sections: [
      {
        id: "wellness",
        title: { vi: "Wellness trở thành tiêu chuẩn bắt buộc", en: "Wellness becomes a standard" },
        body: {
          vi: "Sen tắm nhiệt độ ổn định, bồn tắm độc lập, bề mặt sứ tráng men nano chống bám cặn và ánh sáng dịu đang giúp phòng tắm trở thành không gian hồi phục năng lượng sau ngày dài.",
          en: "Thermostatic showers, freestanding tubs, nano-glazed ceramic basins, and diffused warm lighting are turning home bathrooms into recovery chambers after long days."
        }
      }
    ]
  },
  {
    id: "blog-3",
    slug: "phoi-gach-go-va-da",
    category_slug: "materials-matching",
    category_name: { vi: "Vật liệu hoàn thiện", en: "Finishing Materials" },
    author_name: "KTS. Phạm Minh Quân",
    status: "published",
    featured: false,
    published_at: "2026-05-02T14:15:00Z",
    readTime: { vi: "4 phút đọc", en: "4 min read" },
    cover_media: { url: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2q3Ks_6pKPj_ztm3What2dEyztzDtNSvlZcUiPwDiHA_VOusUyXVgYS06-2m4NL9GmKNk3B-7rH9t1GULDEHPvcNX8oCCYUzEeQqXMpXWy4XEp2xsGc_sLEQkb0ZzpymPtbZIE4H8dBJCKulL4NFlX36FFSERPocr8VlgluZIYKCTL_3y35ErKcKsb6O845GEgb3D4JiGYGR4yVoCcOP5UqjQX6ecZiCoYMtFCPAqwW2qx1--TLUZKgOAER2eASmfDpbCWv09h0Q" },
    title: {
      vi: "Phối gạch, gỗ và đá để không gian có chiều sâu",
      en: "Combining tile, wood, and stone for visual depth"
    },
    excerpt: {
      vi: "Cách cân bằng bề mặt lạnh của đá và ấm của gỗ để không gian sống sang trọng nhưng gần gũi.",
      en: "Balance cool stone surfaces with warm wood textures to keep spaces premium yet welcoming."
    },
    takeaways: [
      {
        vi: "Một bảng vật liệu hoàn hảo cần có điểm nhấn nóng (gỗ), lạnh (đá/gạch) và trung tính để dẫn dắt thị giác.",
        en: "An ideal palette contains warm (wood), cold (stone/tile), and neutral layers to guide the eyes."
      }
    ],
    quote: {
      vi: "Sang trọng không đến từ vật liệu đắt nhất, mà từ cách các bề mặt lắng nghe nhau.",
      en: "Luxury does not come from the most expensive material, but from surfaces that listen to each other."
    },
    sections: [
      {
        id: "bi-quyet",
        title: { vi: "Xây dựng bảng màu vật liệu theo tỷ lệ", en: "Building material palette by proportions" },
        body: {
          vi: "Nguyên tắc vàng là 60% tông màu trung tính từ gạch lát sàn, 30% tông màu ấm từ gỗ ốp hoặc đồ rời, và 10% điểm nhấn quý phái từ đá tự nhiên hoặc kim loại đồng màu.",
          en: "The golden rule is 60% neutral tones from floor tiles, 30% warm tones from wooden cabinetry, and 10% rich accents from natural stone or brass."
        }
      }
    ]
  },
  {
    id: "blog-4",
    slug: "thiet-ke-phong-khach-master",
    category_slug: "interior-design",
    category_name: { vi: "Thiết kế nội thất", en: "Interior Design" },
    author_name: "KTS. Trần Văn Toàn",
    status: "published",
    featured: false,
    published_at: "2026-06-01T08:00:00Z",
    readTime: { vi: "7 phút đọc", en: "7 min read" },
    cover_media: { url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80" },
    title: {
      vi: "Bố trí ánh sáng cho phòng khách biệt thự sang trọng",
      en: "Lighting layout for luxury villa living rooms"
    },
    excerpt: {
      vi: "Nghệ thuật xếp lớp ánh sáng (ambient, task, accent) giúp tôn vinh đường nét vân gỗ óc chó trong không gian chính.",
      en: "The art of layering light (ambient, task, accent) to accentuate walnut grains in the main space."
    },
    takeaways: [
      {
        vi: "Không dùng một nguồn sáng trắng duy nhất; hãy dùng ánh sáng ấm (3000K) để tăng vẻ ấm cúng của gỗ.",
        en: "Avoid a single white light source; use warm light (3000K) to enhance the cozy atmosphere of natural wood."
      }
    ],
    quote: {
      vi: "Ánh sáng là chất xúc tác vô hình biến những khối gỗ vô hồn thành những tác phẩm nghệ thuật sống động.",
      en: "Light is the invisible catalyst that transforms cold wooden blocks into vibrant works of art."
    },
    sections: [
      {
        id: "light-layering",
        title: { vi: "Xếp lớp ánh sáng trong nội thất cao cấp", en: "Light layering in premium interiors" },
        body: {
          vi: "Kết hợp đèn hắt trần (ambient light) để tạo độ sáng nền dịu nhẹ, đèn spotlight tập trung (accent light) rọi thẳng vào các vân núi gỗ óc chó của kệ tivi hay bàn ăn, và đèn thả nghệ thuật (task light) cho bàn trà.",
          en: "Combine indirect cove lighting (ambient light) for background softness, focused spotlights (accent light) pointing directly to walnut grains, and pendant lights (task light) above tables."
        }
      }
    ]
  },
  {
    id: "blog-5",
    slug: "bao-quan-sofa-da-bo-y",
    category_slug: "maintenance",
    category_name: { vi: "Bảo quản sản phẩm", en: "Maintenance" },
    author_name: "Chuyên viên Lê Minh Tuấn",
    status: "published",
    featured: false,
    published_at: "2026-05-28T11:00:00Z",
    readTime: { vi: "4 phút đọc", en: "4 min read" },
    cover_media: { url: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80" },
    title: {
      vi: "Hướng dẫn bảo dưỡng định kỳ sofa da bò Ý tại nhà",
      en: "Periodic Italian leather sofa maintenance at home"
    },
    excerpt: {
      vi: "Giữ chất da bò Tuscany luôn mềm mịn, không bị rạn nứt hay xỉn màu trong mùa nồm ẩm miền Bắc.",
      en: "Keep your Tuscany leather soft and supple, preventing cracks and discoloration in humid seasons."
    },
    takeaways: [
      {
        vi: "Hạn chế tối đa việc sử dụng hóa chất tẩy rửa mạnh; dùng dung dịch chuyên dụng hoặc khăn ẩm vắt kiệt nước.",
        en: "Strictly avoid harsh detergents; use specialized leather conditioners or well-wrung damp cloths."
      }
    ],
    quote: {
      vi: "Da thật giống như làn da con người, cần được cấp ẩm và thở để duy trì vẻ đẹp bóng bẩy tự nhiên.",
      en: "Authentic leather is like human skin; it needs hydration and ventilation to maintain its natural luster."
    },
    sections: [
      {
        id: "ve-sinh",
        title: { vi: "Quy trình vệ sinh da bò thật chuẩn spa", en: "Standard leather cleaning procedure" },
        body: {
          vi: "Hàng tuần dùng chổi lông gà hoặc máy hút bụi đầu mềm dọn sạch bụi trong các khe sofa. 6 tháng một lần lau dung dịch sáp chuyên dụng để tái tạo độ đàn hồi và tạo lớp màng bảo vệ chống thấm mồ hôi.",
          en: "Weekly use a soft brush or vacuum to clear dust from crevices. Every 6 months, apply specialized leather wax to restore elasticity and create a protective moisture barrier."
        }
      }
    ]
  },
  {
    id: "blog-6",
    slug: "gach-kho-lon-trong-kien-truc",
    category_slug: "tiles-knowledge",
    category_name: { vi: "Gạch ốp lát", en: "Tiles" },
    author_name: "KTS. Nguyễn Thu Hà",
    status: "published",
    featured: false,
    published_at: "2026-05-18T15:00:00Z",
    readTime: { vi: "5 phút đọc", en: "5 min read" },
    cover_media: { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" },
    title: {
      vi: "Gạch khổ lớn Slab Porcelain - Cách mạng bề mặt kiến trúc",
      en: "Large format Slab Porcelain - Architectural surface revolution"
    },
    excerpt: {
      vi: "Vì sao các đại lý, biệt thự hiện nay ưa chuộng các mẫu gạch kích thước 80x160cm hay 120x240cm thay vì gạch vuông truyền thống.",
      en: "Why modern villas and premium agents prefer 80x160cm or 120x240cm slabs instead of traditional square tiles."
    },
    takeaways: [
      {
        vi: "Gạch khổ lớn hạn chế tối đa số lượng đường ron (mạch gạch), kiến tạo bề mặt vô cực thông suốt cực kỳ sang trọng.",
        en: "Large slabs minimize grout lines, creating a luxurious seamless infinite surface feel."
      }
    ],
    quote: {
      vi: "Một không gian rộng lớn cần những bề mặt tương xứng để phô diễn sự vĩ đại của nó.",
      en: "A spacious room needs matching surfaces to showcase its true grandeur."
    },
    sections: [
      {
        id: "ung-dung",
        title: { vi: "Ứng dụng đa dạng từ lát sàn đến ốp vách tivi", en: "Versatile applications from floors to TV backdrops" },
        body: {
          vi: "Không chỉ dừng lại ở lát sàn sảnh lớn, gạch porcelain khổ lớn 80x160cm hiện được ứng dụng để ốp vách sau tivi, ốp cabin tắm hay làm mặt bàn bếp nhờ đặc tính chống thấm ố và độ phẳng hoàn hảo.",
          en: "Beyond lobby flooring, 80x160cm porcelain slabs are widely used for TV background walls, shower enclosures, and countertops due to their flat profile and anti-staining qualities."
        }
      }
    ]
  },
  {
    id: "blog-7",
    slug: "thiet-bi-ve-sinh-thong-minh",
    category_slug: "sanitary-tech",
    category_name: { vi: "Thiết bị vệ sinh", en: "Sanitary Ware" },
    author_name: "KTS. Lê Hồng Hạnh",
    status: "draft", // This is a draft post to test admin views
    featured: false,
    published_at: "2026-06-05T09:00:00Z",
    readTime: { vi: "6 phút đọc", en: "6 min read" },
    cover_media: { url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80" },
    title: {
      vi: "Kỷ nguyên phòng tắm thông minh - Bồn cầu tự động",
      en: "Smart bathroom era - Automatic intelligent toilets"
    },
    excerpt: {
      vi: "Những công nghệ cảm biến và xả rửa tự động tiên tiến nhất thay đổi trải nghiệm chăm sóc sức khỏe gia đình.",
      en: "The latest sensor and automatic flushing technologies changing family wellness hygiene."
    },
    takeaways: [
      {
        vi: "Bồn cầu thông minh giúp tiết kiệm nước và tối ưu hóa quy trình vệ sinh rảnh tay.",
        en: "Smart toilets save water and optimize hands-free hygiene routines."
      }
    ],
    quote: {
      vi: "Công nghệ tốt nhất là công nghệ phục vụ con người một cách thầm lặng và tự nhiên nhất.",
      en: "The best technology is the one that serves humans in the most quiet and natural way."
    },
    sections: [
      {
        id: "sensor",
        title: { vi: "Công nghệ cảm biến radar", en: "Radar sensor technology" },
        body: {
          vi: "Bồn cầu tự mở nắp khi có người bước đến và đóng lại xả nước khi rời đi, hạn chế lây nhiễm chéo vi khuẩn.",
          en: "Toilets auto-open when approached and close-flush when leaving, minimizing bacterial cross-contamination."
        }
      }
    ]
  }
];
