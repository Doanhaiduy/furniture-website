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
});

export const categorySchema = z.object({
  slug: slugSchema,
  name_vi: requiredText("Tên danh mục tiếng Việt là bắt buộc"),
  name_en: optionalText,
  description_vi: optionalText,
  description_en: optionalText,
  parent_id: z.string().uuid().nullable().optional(),
  group_key: z.enum(["wood", "sanitary", "tiles"]).nullable().optional(),
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
});

export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type ShowroomInput = z.infer<typeof showroomSchema>;
export type BrandInput = z.infer<typeof brandSchema>;
export type PromotionInput = z.infer<typeof promotionSchema>;
