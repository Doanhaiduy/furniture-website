import { z } from "zod";

const slugRegex = /^[a-z0-9-]+$/;

// Common text validation helper
const requiredText = (msg: string) => z.string().trim().min(1, msg);
const optionalText = z.string().trim().nullish().transform(val => val || null);
const slugSchema = z.string().trim().min(1, "Slug không được để trống").regex(slugRegex, "Slug chỉ được chứa ký tự thường, số và dấu gạch ngang (e.g. sofa-curve)");

export const productSchema = z.object({
  reference_code: optionalText,
  slug: slugSchema,
  name_vi: requiredText("Tên sản phẩm tiếng Việt là bắt buộc"),
  name_en: optionalText,
  summary_vi: requiredText("Mô tả ngắn tiếng Việt là bắt buộc"),
  summary_en: optionalText,
  description_json_vi: z.any().optional(), // Can be string or JSON
  description_json_en: z.any().optional(),
  material_vi: optionalText,
  material_en: optionalText,
  price_display_text_vi: optionalText,
  price_display_text_en: optionalText,
  dimension_display_text_vi: optionalText,
  dimension_display_text_en: optionalText,
  category_id: requiredText("Danh mục sản phẩm là bắt buộc"),
  price_min: z.number().nullable().optional(),
  price_max: z.number().nullable().optional(),
  currency: z.string().length(3).default("VND"),
  width: z.number().nullable().optional(),
  depth: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  dimension_unit: z.string().default("mm"),
  brand_id: z.string().uuid().nullable().optional(),
  brand_series: optionalText,
  showroom_code: optionalText,
  price_unit: optionalText,
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  promotion_id: z.string().uuid().nullable().optional(),
  promo_price_min: z.number().nullable().optional(),
  promo_price_max: z.number().nullable().optional(),
  cover_image: optionalText,
  gallery_images: z.array(z.string()).optional().default([]),
  specifications: z.object({
    material_vi: optionalText,
    material_en: optionalText,
    finish_vi: optionalText,
    finish_en: optionalText,
    care_vi: optionalText,
    care_en: optionalText,
  }).optional(),
  custom_attributes: z.array(z.object({
    name_vi: requiredText("Tên thuộc tính (VI) bắt buộc"),
    name_en: optionalText,
    value_vi: requiredText("Giá trị thuộc tính (VI) bắt buộc"),
    value_en: optionalText,
  })).optional().default([]),
  seo_title_vi: optionalText,
  seo_title_en: optionalText,
  seo_description_vi: optionalText,
  seo_description_en: optionalText,
}).refine(
  (data) => {
    if (data.price_min !== null && data.price_min !== undefined && data.price_max !== null && data.price_max !== undefined) {
      return data.price_min <= data.price_max;
    }
    return true;
  },
  {
    message: "Giá tối thiểu phải nhỏ hơn hoặc bằng giá tối đa",
    path: ["price_min"],
  }
).refine(
  (data) => {
    if (data.promo_price_min !== null && data.promo_price_min !== undefined && data.price_min !== null && data.price_min !== undefined) {
      return data.promo_price_min < data.price_min;
    }
    return true;
  },
  {
    message: "Giá khuyến mãi phải nhỏ hơn giá gốc",
    path: ["promo_price_min"],
  }
);

export const categorySchema = z.object({
  slug: slugSchema,
  name_vi: requiredText("Tên danh mục tiếng Việt là bắt buộc"),
  name_en: optionalText,
  description_vi: optionalText,
  description_en: optionalText,
  parent_id: z.string().uuid().nullable().optional(),
  // Accept both the DB group_key enum values (what the category form actually submits,
  // read from the selected parent) and the legacy short aliases that mapGroupKeyToDb()
  // still normalises. Previously only the short aliases were allowed, so creating a
  // category under any non-"tiles" group silently failed client-side validation.
  group_key: z
    .enum([
      "wooden_furniture",
      "sanitary_equipment",
      "tiles",
      "project_solutions",
      "wood",
      "sanitary",
    ])
    .nullable()
    .optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  sort_order: z.number().int().default(0),
  cover_image: optionalText,
  seo_title_vi: optionalText,
  seo_title_en: optionalText,
  seo_description_vi: optionalText,
  seo_description_en: optionalText,
});

export const blogPostSchema = z.object({
  slug: slugSchema,
  title_vi: requiredText("Tiêu đề tiếng Việt là bắt buộc"),
  title_en: optionalText,
  excerpt_vi: requiredText("Trích dẫn tiếng Việt là bắt buộc"),
  excerpt_en: optionalText,
  body_json_vi: z.any().optional(),
  body_json_en: z.any().optional(),
  category_id: requiredText("Danh mục bài viết là bắt buộc"),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  featured: z.boolean().default(false),
  cover_image: optionalText,
  seo_title_vi: optionalText,
  seo_title_en: optionalText,
  seo_description_vi: optionalText,
  seo_description_en: optionalText,
});

export const showroomSchema = z.object({
  code: slugSchema, // Internal unique code (slug-like)
  name_vi: requiredText("Tên showroom tiếng Việt là bắt buộc"),
  name_en: optionalText,
  address_vi: requiredText("Địa chỉ tiếng Việt là bắt buộc"),
  address_en: optionalText,
  opening_hours_vi: optionalText,
  opening_hours_en: optionalText,
  hotline: requiredText("Số hotline là bắt buộc"),
  google_maps_embed_url: requiredText("URL bản đồ nhúng bắt buộc"),
  google_maps_fallback_url: requiredText("URL bản đồ dự phòng bắt buộc"),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  sort_order: z.number().int().default(0),
  cover_image: optionalText,
  seo_title_vi: optionalText,
  seo_title_en: optionalText,
  seo_description_vi: optionalText,
  seo_description_en: optionalText,
});

export const brandSchema = z.object({
  name_vi: requiredText("Tên thương hiệu tiếng Việt là bắt buộc"),
  name_en: optionalText,
  description_vi: optionalText,
  description_en: optionalText,
  origin: optionalText,
  logo_url: optionalText,
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  sort_order: z.number().int().default(0),
  seo_title_vi: optionalText,
  seo_title_en: optionalText,
  seo_description_vi: optionalText,
  seo_description_en: optionalText,
  slug: optionalText,
});

export const promotionSchema = z.object({
  code: requiredText("Mã khuyến mãi là bắt buộc"),
  discount_percentage: z.number().min(0).max(100, "Phần trăm giảm giá từ 0-100"),
  title_vi: requiredText("Tiêu đề tiếng Việt là bắt buộc"),
  title_en: optionalText,
  description_vi: optionalText,
  description_en: optionalText,
  start_at: z.string().nullable().optional(),
  end_at: z.string().nullable().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  cover_image: optionalText,
  combo_price: z.number().nullable().optional(),
  original_price: z.number().nullable().optional(),
  items: z.array(z.string()).optional().default([]),
  badge_color: optionalText,
  tag_vi: optionalText,
  tag_en: optionalText,
}).refine(
  (data) => {
    if (data.start_at && data.end_at) {
      return new Date(data.start_at) < new Date(data.end_at);
    }
    return true;
  },
  {
    message: "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc",
    path: ["end_at"],
  }
).refine(
  (data) => {
    if (data.combo_price !== null && data.combo_price !== undefined && data.original_price !== null && data.original_price !== undefined) {
      return data.combo_price < data.original_price;
    }
    return true;
  },
  {
    message: "Giá combo phải nhỏ hơn giá gốc",
    path: ["combo_price"],
  }
);

export const settingsSchema = z.object({
  brandNameVi: requiredText("Tên thương hiệu tiếng Việt là bắt buộc"),
  brandNameEn: optionalText,
  logoUrl: optionalText,
  faviconUrl: optionalText,
  contactPhone: requiredText("Số điện thoại liên hệ là bắt buộc"),
  contactEmail: z.string().trim().email("Email liên hệ không hợp lệ").min(1, "Email liên hệ là bắt buộc"),
  quoteSenderEmail: z.string().trim().email("Email gửi báo giá không hợp lệ").optional().or(z.string().max(0)),
  addressVi: requiredText("Địa chỉ tiếng Việt là bắt buộc"),
  addressEn: optionalText,
  defaultLocale: z.string().optional().default("vi"),
  seoTitleVi: optionalText,
  seoTitleEn: optionalText,
  seoDescVi: optionalText,
  seoDescEn: optionalText,
  resendKey: optionalText,
  cloudinaryPreset: optionalText,
  geminiKey: optionalText,
  slaHours: z.union([z.string(), z.number()]).optional(),
  heroHeadlineVi: optionalText,
  heroHeadlineEn: optionalText,
  heroSubtitleVi: optionalText,
  heroSubtitleEn: optionalText,
  heroCtaLabel: optionalText,
  heroCtaLink: optionalText,
  heroVisible: z.boolean().optional().default(true),
  heroImage1: optionalText,
  aboutVisible: z.boolean().optional().default(true),
  slide2TitleVi: optionalText,
  slide2TitleEn: optionalText,
  slide2LeadVi: optionalText,
  slide2LeadEn: optionalText,
  slide2Image: optionalText,
  slide3TitleVi: optionalText,
  slide3TitleEn: optionalText,
  slide3LeadVi: optionalText,
  slide3LeadEn: optionalText,
  slide3Image: optionalText,
  aboutHeadingVi: optionalText,
  aboutHeadingEn: optionalText,
  aboutLeadVi: optionalText,
  aboutLeadEn: optionalText,
  aboutImage: optionalText,
  featuredVisible: z.boolean().optional().default(true),
  featuredMaxItems: z.union([z.string(), z.number()]).optional(),
  blogSectionVisible: z.boolean().optional().default(true),
  blogMaxPosts: z.union([z.string(), z.number()]).optional(),
  blogHeadingVi: optionalText,
  blogHeadingEn: optionalText,
  trustBadgesVisible: z.boolean().optional().default(true),
  badge1ValueVi: optionalText,
  badge1ValueEn: optionalText,
  badge1DescVi: optionalText,
  badge1DescEn: optionalText,
  badge2ValueVi: optionalText,
  badge2ValueEn: optionalText,
  badge2DescVi: optionalText,
  badge2DescEn: optionalText,
  showroomVisible: z.boolean().optional().default(true),
  showroomHeadingVi: optionalText,
  showroomHeadingEn: optionalText,
  showroomLeadVi: optionalText,
  showroomLeadEn: optionalText,
  showroomCtaVi: optionalText,
  showroomCtaEn: optionalText,
  showroomBgImage: optionalText,
  quoteVisible: z.boolean().optional().default(true),
  quoteHeadingVi: optionalText,
  quoteHeadingEn: optionalText,
  quoteLeadVi: optionalText,
  quoteLeadEn: optionalText,
});

export type ProductInput = z.input<typeof productSchema>;
export type CategoryInput = z.input<typeof categorySchema>;
export type BlogPostInput = z.input<typeof blogPostSchema>;
export type ShowroomInput = z.input<typeof showroomSchema>;
export type BrandInput = z.input<typeof brandSchema>;
export type PromotionInput = z.input<typeof promotionSchema>;
export type SettingsInput = z.input<typeof settingsSchema>;
