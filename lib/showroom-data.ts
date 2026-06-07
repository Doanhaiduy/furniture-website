import type { Locale } from "@/i18n/routing";

export type LocalizedText = Record<Locale, string>;
export type PublishStatus = "draft" | "published" | "archived";

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

export const imageAssets = {
  hero:
    "https://lh3.googleusercontent.com/aida/ADBb0ugo4YIXLtjoKUjhdcOlsywn3MCCxokAJWXJiQGHxYZmRLk0xHG1Vp1lwI47STNFDAm_WCluRxQw4qfZXRL4JlePoLus9T6MurssaLIjMroZne1BBCg0_rnrYMrC3C_gShW5nUzPjlmxwKS70WqZ09Zhx4v3wxRia998zFvtuq5i5e3Kozk0C3sWubZqnKZFKCAu5VR-drySRv2N6tg6XA92F25muBX4_kpW-dFNtjtHBVvnnhbp5TWeyWY",
  showroom:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBmds4EmMLtCwrgVwda-oQKgqGCMniYwQ0P1gjB-VyrDhZtHJheZgB8tXL3d6MliF8cixUIZv2k7hLYfTFz34PR6S0LZzOYIhCN2TeDaBrejZUjymBFTAAXKiDTsAmqS5IXnaE69dKasSlPASKc7APJEHKCZHRu-9KuJqHnlW4Fp03VESztwq5tgmbhuNG8iyLnMqfqINhFDrBzon4GqbepwDfLRA8GK_jBeuQ3hFvELIT82JhcI1_RfrWlxyvUC2cFFACxTbOZRmA",
  woodWall:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAforj3VX-FTBvzBL9xk8xZsyRFeSrCTCZroaw5xiKiW94p97bHwS5p8v7NPz1CEkw5kcZcO8Qhg50HbSL08FWNepcJQvILK7uoRkp-yXAMFVWrODBkXn_ljL5x1r892Y4CCJK6PiLLH_ZVLw-_yvANxLy70jQTG3SyAkhvnKSHdiDphu2VvxBxS50kNU30Klji9hXESZM6sKB-BJixTEwUya_W-dPDnizTqnuvjBX-hpj088KerYWV3pBNhSzQ-mp6IaevUWw-Xg4",
  sofa:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDeNaFa3JY47GArzSxORvjQWIf13YpBq5rZYV_Vlg0WKN8i1K-riacPvEpxjgArG70R9OkqHw41H7xEEnVaMamTzu2j8lUK-wN10A784d1QoZHM4fi9vE9NsHXu1EneflVADtw0KiL5VYdZ-5MVbfL4kn3BaILk6D4iORdO7N2m089CpKpF2esGBi_yIxBC9B7XXStL7PKNX97Nil49w0dOvCjJzkSw6MopELonyTGhnooSPrfWnl3mqEpWOdLeuH6JKV3e8hIF1D4",
  texture:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB2q3Ks_6pKPj_ztm3What2dEyztzDtNSvlZcUiPwDiHA_VOusUyXVgYS06-2m4NL9GmKNk3B-7rH9t1GULDEHPvcNX8oCCYUzEeQqXMpXWy4XEp2xsGc_sLEQkb0ZzpymPtbZIE4H8dBJCKulL4NFlX36FFSERPocr8VlgluZIYKCTL_3y35ErKcKsb6O845GEgb3D4JiGYGR4yVoCcOP5UqjQX6ecZiCoYMtFCPAqwW2qx1--TLUZKgOAER2eASmfDpbCWv09h0Q",
  room:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCS7rYc18dpXUFnhvwBuKvVucavZ1sAsE7DxMtRl_98ETvYOUVz44VpAURmwOHZ7J9HuYsw8sBH_O4uP1U_8G2qw0JOtoCI_dTrmqpw2kEsALwRtiBzM2XQx8aKxpcPVlMn34cMjlBmADgZhbyHjyZjYC20RChapDYZk1VETdbY4ce1PYH6BxZ9ILJakNNyTsFOL82tJQs_U_JfvrNJvYA0cgVpj1VZZOzglO4g_SsMvrcrb7dLAz4YUJlC3-e3y-ZwFnQg8bCrdFs",
  table:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB9AqZgkazhLr1T0iK0v_7bDSJHoCTj3l7Bj1kVA10E3JGafT3Ac50zasCKjmT768HKPkLHAuydGJZJhcPgRtnx7_lmH_wPPkCksh-mWEU67Ei-yO7Ft71A-StpTV931Nc2YeU5FBCPPxTlj4Pl8A_0LKVIcc7hTjZMR4zKfqic1n1uqjBz3PkdQMMaP8FSpmyCTaPMjANwfzExqwt7upT3zcL8vw6xmL52Dy822UQXYQregnQUtL615QO5pxLjUKsEDFJonheQBL8",
  chair:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCnx1hfaFuH9dONC9n1Zeb923X8H4PwlrC4W7qicSbstnJIprYGc-yR7OTxREuWnOcwx19UvIXMDCvg9zXcMwJF-lDkEUS5m5lJkPVNqZseRCrKR7FfBIudzCxH5fjqusPoXCUYY2EwjcEoZ-Aeb-a-8r1Kqki-uU5nhQRcUm8iN0km-hkRpo48wZyVz7iqNL2zdpArLdYJSfPSXbk_Pnc2lRac6tU7pZnY-tUD6pPAZoUnlna3OGi-8Jt2s2a6cX6mZdXUfzEpjiw",
  cabinet:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB3B2R2wqvqxZ5Z9F5wnvqW9iRiZf4UcURAsxvhA7NMniGvGLWXgDtDGLt-f1tT1UrYVQSKbDBAnKku_suIAR7FmvTGXgr-wDcKxlM0rl_GiDaftq21U2qDqUVysviWH23buFJLYDENtMlm4tp5olOEmBsnb1WmqyFav5ZpKhQr1dYjTofBDoZbsqZ8cG9o9zWde__bE0H5Evrl0HXZYyi7UbVvKUTiGy4nNbDn6OqX_XVbFUdiK-BNiKxXWha12pDBQ7ptcVyLGMg",
  aboutHero:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC2Pe1R0tdQejufPca-v8RZNnJrmfBROnC2Rli3Ap-j5XbDWDxfrqJnCwUIJFaPPnGNeS8zxX-J_eaWHPML-l2xOtmtnqbLpoMeiTdEKD4UCez2bHauAz1NzGRcd0AXQYCwah9GdEG3kjTGylOnLp5-PAcmObCbVD0iE4w4j6wUrs38E0GAahZAtoPYfoctPPWRQTJ4sRuqQ_T2zmWNktH8HF6UuiMIX5fPf8Y46zClHj0MCrw4xbhKolasMZa-Y3jfY-veo6EzICM",
  factory:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAHgmvTjl-N6rQdQXM9ZKG9VA2j6kVB7kIL-ktEggsK3p0r_l29whxxw90CSBDSHdME7KUsmGOsY2uyBHVt25-7I5bZK27g9luU3tqL_uqgJmAY6ojKpMGEfxBAKEeiuJZw5Cw4oxe9znmzvLoyH-NRKp7cvFnVYeHOfsHTD3Uc7Idy-JHaxVaASjoo0sFvQOl5kNblkEMQtceC2OzVGwhVT0pZp9r00eZOeFL_iw36yLkB-umowwmwjchYmw7xjKFBTCNc2WNeK3s",
  blog1:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDS37ogl_A-pJSG7Rs7CG2CVV3nR6iVnbjUPlrSgc4sy5tGrxHiVxN63GtuhWlqm_2jrnZ8b5lh6GEfl1EnGAxmtb-RfRAGhurKL3au-oZrdjJefVAZhO1XeX6BirruL8uMMRrk0w_qOm_38DR6zkFogxTQxlsAksF_pqVb8c0j7-eRqx_N6X3PVI3GT3l5o9RNR0ub9ZJPgeUV0T48yrnB5U-F921QZ6YQwlxCQ5SV3KP16eS8qbsncJc0bOQPiBnLxbhbsYiEKkA",
  blog2:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDpdlBG3oOmLlm4MxeICx-_posDDjBMKRxVkEGLpIYvctU2Y1CSdKWx7Sb02kTksn-tiqDCcpkts05NxdtILMpa4u8kp2hV34kIUHrxROPXtzFGsKZdVLBfPkfMpjpONpj8xtGReXYY2I287ShXtoKYRv6s7j6ytsm36AJM4eVXVdkW1pJ4DEvEEY426EScKm-QFmniPeMwspEOqrHf_iySdko9_rhYgkUi_7jzvgzKoR31tsWhuu1yj41rrLORwU6QDlFK8qQE1eU",
  showroom2:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAGAhI1CAiX95UHBqLh0tZtdI-dfrQIHKISIE0IuRwkFA7njjsMNj0Qb2k-uy9rLB__VSHEurjbbpo-jaXKzmYqEWYViLOngpLUBGYdY0wHYiAsWz6Z5onVyCfGfxMqUIMiDIwsZZ9RdoovaqVSR4nqL4CsS9fe9p2GwNqpvGfWK-M9BHs-7aqKV5DbCTJY1_Z1MXn1WXRWOnZyinevxlaOn6R04B3zVU9GcgjL183V7yVNe7dJMvJv0SUi4vBR5inp06MVVAhrhy8",
};

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
    image: imageAssets.woodWall,
    title: { vi: "Nội thất & đồ gỗ", en: "Wood furniture" },
    summary: {
      vi: "Gỗ tự nhiên cao cấp, thiết kế tinh xảo.",
      en: "Premium natural wood and refined detailing.",
    },
  },
  {
    key: "sanitary",
    href: "/products?category=sanitary",
    image: imageAssets.room,
    title: { vi: "Thiết bị vệ sinh", en: "Sanitary ware" },
    summary: {
      vi: "Hiện đại, tiện nghi và sang trọng.",
      en: "Modern, comfortable and refined.",
    },
  },
  {
    key: "tiles",
    href: "/products?category=tiles",
    image: imageAssets.texture,
    title: { vi: "Gạch ốp lát", en: "Tiles" },
    summary: {
      vi: "Vật liệu bền vững cho bề mặt hoàn thiện.",
      en: "Durable surfaces for complete interiors.",
    },
  },
  {
    key: "solutions",
    href: "/contact",
    image: imageAssets.showroom,
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
    image: imageAssets.room,
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
    image: imageAssets.showroom,
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
    image: imageAssets.texture,
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
    image: imageAssets.room,
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
    image: imageAssets.showroom2,
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
    image: imageAssets.cabinet,
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
    status: "published" as PublishStatus,
    featured: true,
    image: imageAssets.sofa,
    gallery: [imageAssets.sofa, imageAssets.texture, imageAssets.room],
    price: { vi: "45.000.000đ", en: "VND 45,000,000" },
    oldPrice: { vi: "52.000.000đ", en: "VND 52,000,000" },
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
    status: "published" as PublishStatus,
    featured: true,
    image: imageAssets.table,
    gallery: [imageAssets.table, imageAssets.room],
    price: { vi: "12.500.000đ", en: "VND 12,500,000" },
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
    slug: "ghe-armchair-heritage",
    referenceCode: "PD-C2403",
    categoryKey: "wood",
    materialKey: "oak",
    roomKey: "lounge",
    styleKey: "heritage",
    collectionKey: "heritage",
    toneKey: "warm",
    availabilityKey: "made-to-order",
    status: "draft" as PublishStatus,
    featured: false,
    image: imageAssets.chair,
    gallery: [imageAssets.chair],
    price: { vi: "Liên hệ", en: "Contact" },
    name: { vi: "Ghế Armchair Heritage", en: "Heritage Armchair" },
    category: { vi: "Ghế thư giãn", en: "Armchair" },
    summary: {
      vi: "Ghế thư giãn da thật với khung gỗ sồi, phù hợp góc đọc sách.",
      en: "Genuine leather lounge chair with oak frame for reading corners.",
    },
    description: {
      vi: "Thiết kế tôn trọng tỉ lệ cơ thể, đệm êm và tay vịn thấp cho trải nghiệm thư giãn lâu dài.",
      en: "Human-scaled proportions, soft cushions and low arms support extended comfort.",
    },
    specs: [
      { label: { vi: "Da", en: "Leather" }, value: { vi: "Da bò Ý", en: "Italian leather" } },
    ],
    tags: ["Da bò Ý", "Gỗ sồi"],
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
    status: "published" as PublishStatus,
    featured: false,
    image: imageAssets.cabinet,
    gallery: [imageAssets.cabinet],
    price: { vi: "22.000.000đ", en: "VND 22,000,000" },
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
    ],
    tags: ["Veneer", "Minimal"],
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
    status: "published" as PublishStatus,
    featured: true,
    image: imageAssets.room,
    gallery: [imageAssets.room],
    price: { vi: "12.500.000đ", en: "VND 12,500,000" },
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
    ],
    tags: ["Brass", "24K"],
  },
  {
    slug: "gach-marble-calacatta",
    referenceCode: "PD-G2406",
    categoryKey: "tiles",
    materialKey: "stone",
    roomKey: "surface",
    styleKey: "minimal",
    collectionKey: "atelier",
    toneKey: "light",
    availabilityKey: "showroom",
    status: "archived" as PublishStatus,
    featured: true,
    image: imageAssets.woodWall,
    gallery: [imageAssets.woodWall],
    price: { vi: "850.000đ/m2", en: "VND 850,000/m2" },
    name: { vi: "Gạch Marble Calacatta", en: "Calacatta Marble Tile" },
    category: { vi: "Gạch ốp lát", en: "Tiles" },
    summary: {
      vi: "Gạch vân đá khổ lớn cho sảnh, phòng khách và phòng tắm.",
      en: "Large format stone-look tile for halls, living rooms and bathrooms.",
    },
    description: {
      vi: "Bề mặt bóng nhẹ, vân đá tự nhiên và khả năng chống thấm tốt cho khu vực ẩm.",
      en: "A soft glossy surface, natural veining and water resistance for wet areas.",
    },
    specs: [
      { label: { vi: "Khổ gạch", en: "Size" }, value: { vi: "800 x 1600 mm", en: "800 x 1600 mm" } },
    ],
    tags: ["Calacatta", "Porcelain"],
  },
] as const;

export type Product = (typeof products)[number];
export type ProductSort = "newest" | "featured";

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
] as const;

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
} as const;

export function getBlogArticleContent(slug: string) {
  return blogArticleContent[slug as keyof typeof blogArticleContent] ?? blogArticleContent["bi-quyet-chon-go-oc-cho"];
}

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
] as const;

export const trustBadges = [
  { value: "20+", label: { vi: "năm kinh nghiệm", en: "years of experience" } },
  { value: "500+", label: { vi: "mẫu sản phẩm", en: "curated products" } },
  { value: "2.000m2", label: { vi: "nhà máy và kho", en: "factory and warehouse" } },
] as const;

export const adminStats = [
  { label: "Tổng sản phẩm", value: "248", delta: "+12" },
  { label: "Danh mục", value: "12", delta: "+2" },
  { label: "Bài viết", value: "45", delta: "+6" },
  { label: "Showroom", value: "03", delta: "đang hoạt động" },
  { label: "Song ngữ", value: "95%", delta: "+4%" },
] as const;

export const quoteRequests = [
  {
    id: "QR-2406-001",
    customer: "Lê Minh Tuấn",
    product: "Sofa Curve Velour",
    date: "2026-06-01",
    status: "new",
    phone: "0812 357 587",
  },
  {
    id: "QR-2406-002",
    customer: "Nguyễn Thu Hà",
    product: "Bàn Trà Marble Round",
    date: "2026-05-31",
    status: "contacted",
    phone: "0901 223 456",
  },
  {
    id: "QR-2406-003",
    customer: "Trần Đại Quang",
    product: "Thiết bị vệ sinh trọn bộ",
    date: "2026-05-30",
    status: "qualified",
    phone: "0988 776 655",
  },
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

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function filterProducts(query: {
  category?: string;
  material?: string;
  room?: string;
  style?: string;
  collection?: string;
  tone?: string;
  availability?: string;
  featured?: string;
  q?: string;
}) {
  const normalizedQuery = query.q?.trim().toLowerCase();
  const isActive = (value?: string) => Boolean(value && value !== "all");

  return products.filter((product) => {
    if (product.status === "archived") return false;
    if (isActive(query.category) && product.categoryKey !== query.category) return false;
    if (isActive(query.material) && product.materialKey !== query.material) return false;
    if (isActive(query.room) && product.roomKey !== query.room) return false;
    if (isActive(query.style) && product.styleKey !== query.style) return false;
    if (isActive(query.collection) && product.collectionKey !== query.collection) return false;
    if (isActive(query.tone) && product.toneKey !== query.tone) return false;
    if (isActive(query.availability) && product.availabilityKey !== query.availability) return false;
    if (query.featured === "true" && !product.featured) return false;
    if (normalizedQuery) {
      const haystack = [
        product.name.vi,
        product.name.en,
        product.summary.vi,
        product.summary.en,
        product.referenceCode,
        product.category.vi,
        product.category.en,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    }
    return true;
  });
}

export function sortProducts(items: readonly Product[], sort: ProductSort = "newest") {
  const byCatalogOrder = (product: Product) => products.findIndex((item) => item.slug === product.slug);

  return [...items].sort((a, b) => {
    if (sort === "featured") {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
    }

    return byCatalogOrder(a) - byCatalogOrder(b);
  });
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
