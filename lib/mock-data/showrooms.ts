export type MockShowroom = {
  id: string;
  code: string;
  name: { vi: string; en: string };
  address: { vi: string; en: string };
  hotline: string;
  opening_hours: { vi: string; en: string };
  google_maps_embed_url: string;
  google_maps_fallback_url: string;
  latitude: number;
  longitude: number;
  status: "published" | "draft";
  sort_order: number;
  primary_media: { url: string };
};

export const mockShowrooms: MockShowroom[] = [
  {
    id: "sr-hn",
    code: "HN",
    name: { vi: "Hà Nội - Flagship Store", en: "Hanoi - Flagship Store" },
    address: {
      vi: "123 Trần Duy Hưng, Cầu Giấy, Hà Nội",
      en: "123 Tran Duy Hung, Cau Giay, Hanoi"
    },
    hotline: "1900 1234",
    opening_hours: { vi: "08:00 - 21:00 hằng ngày", en: "08:00 - 21:00 daily" },
    google_maps_embed_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.4856950293417!2d105.7958925!3d21.0132338!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab5947a1ffb1%3A0xc3b83ef282c0b2b8!2zVHLhuqduIER1eSBIxrhu4NuZywgQ-G6p3UgR2nhuqV5LCBIw6AgTuG7mWksIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1717830000000!5m2!1svi!2s",
    google_maps_fallback_url: "https://maps.app.goo.gl/wJ5J4K92F25muBX4",
    latitude: 21.0132338,
    longitude: 105.7958925,
    status: "published",
    sort_order: 1,
    primary_media: { url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmds4EmMLtCwrgVwda-oQKgqGCMniYwQ0P1gjB-VyrDhZtHJheZgB8tXL3d6MliF8cixUIZv2k7hLYfTFz34PR6S0LZzOYIhCN2TeDaBrejZUjymBFTAAXKiDTsAmqS5IXnaE69dKasSlPASKc7APJEHKCZHRu-9KuJqHnlW4Fp03VESztwq5tgmbhuNG8iyLnMqfqINhFDrBzon4GqbepwDfLRA8GK_jBeuQ3hFvELIT82JhcI1_RfrWlxyvUC2cFFACxTbOZRmA" }
  },
  {
    id: "sr-hcm",
    code: "HCM",
    name: { vi: "TP. Hồ Chí Minh - Premium Studio", en: "HCMC - Premium Studio" },
    address: {
      vi: "456 Nguyễn Thị Minh Khai, Quận 1, TP. HCM",
      en: "456 Nguyen Thi Minh Khai, District 1, HCMC"
    },
    hotline: "1900 5678",
    opening_hours: { vi: "08:30 - 21:30 hằng ngày", en: "08:30 - 21:30 daily" },
    google_maps_embed_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.497576579309!2d106.6874415!3d10.7731238!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3919497576579309%3A0x8e8eb4968c35e88c!2zTmd1eeG7hW4gVGjhu4sgTWluaCBLaGFpLCBRdeG6rW4gMSwgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5oLCBWaeG7buildCBOYW0!5e0!3m2!1svi!2s!4v1717830000001!5m2!1svi!2s",
    google_maps_fallback_url: "https://maps.app.goo.gl/AB6AXuAGAhI1CAiX95",
    latitude: 10.7731238,
    longitude: 106.6874415,
    status: "published",
    sort_order: 2,
    primary_media: { url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGAhI1CAiX95UHBqLh0tZtdI-dfrQIHKISIE0IuRwkFA7njjsMNj0Qb2k-uy9rLB__VSHEurjbbpo-jaXKzmYqEWYViLOngpLUBGYdY0wHYiAsWz6Z5onVyCfGfxMqUIMiDIwsZZ9RdoovaqVSR4nqL4CsS9fe9p2GwNqpvGfWK-M9BHs-7aqKV5DbCTJY1_Z1MXn1WXRWOnZyinevxlaOn6R04B3zVU9GcgjL183V7yVNe7dJMvJv0SUi4vBR5inp06MVVAhrhy8" }
  },
  {
    id: "sr-dn",
    code: "DN",
    name: { vi: "Đà Nẵng - Experience Studio", en: "Da Nang - Experience Studio" },
    address: {
      vi: "88 Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
      en: "88 Nguyen Van Linh, Hai Chau, Da Nang"
    },
    hotline: "1900 8888",
    opening_hours: { vi: "09:00 - 20:30 hằng ngày", en: "09:00 - 20:30 daily" },
    google_maps_embed_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.024564887965!2d108.2173491!3d16.0642398!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31421833116df74f%3A0xea88be4f13c2c54!2zTmd1eeG7hW4gVsSDbiBMaW5oLCBI4bqjaSBDaMOidSwgxJDDoCBO4bq5bmcsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1717830000002!5m2!1svi!2s",
    google_maps_fallback_url: "https://maps.app.goo.gl/room",
    latitude: 16.0642398,
    longitude: 108.2173491,
    status: "published",
    sort_order: 3,
    primary_media: { url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCS7rYc18dpXUFnhvwBuKvVucavZ1sAsE7DxMtRl_98ETvYOUVz44VpAURmwOHZ7J9HuYsw8sBH_O4uP1U_8G2qw0JOtoCI_dTrmqpw2kEsALwRtiBzM2XQx8aKxpcPVlMn34cMjlBmADgZhbyHjyZjYC20RChapDYZk1VETdbY4ce1PYH6BxZ9ILJakNNyTsFOL82tJQs_U_JfvrNJvYA0cgVpj1VZZOzglO4g_SsMvrcrb7dLAz4YUJlC3-e3y-ZwFnQg8bCrdFs" }
  }
];
