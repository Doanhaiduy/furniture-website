import { z } from "zod";

const slugRegex = /^[a-z0-9-]+$/;
// Vietnamese-friendly phone/hotline: only digits and + - ( ) . and spaces, with
// 8–15 actual digits (covers mobiles, landlines and 1900/1800 hotlines).
const phoneAllowed = /^[0-9+().\-\s]+$/;
const digitCount = (v: string) => v.replace(/\D/g, "").length;

// Common text validation helper
const requiredText = (msg: string) => z.string().trim().min(1, msg);
const optionalText = z.string().trim().nullish().transform(val => val || null);
const optionalUrl = z
  .string()
  .trim()
  .nullish()
  .transform((val) => val || null)
  .refine(
    (val) => {
      if (!val) return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Đường dẫn không hợp lệ. Phải bắt đầu bằng http:// hoặc https://" }
  );
// Optional UUID coming from a form <select>. An unselected dropdown often submits "" (or
// "none") instead of null/undefined. Also: Zod v4's z.string().uuid() enforces strict
// RFC 9562 (version digit 1-8, variant 89ab). The DB seed data uses custom UUIDs like
// b0000000-0000-0000-0000-000000000001 (version 0, variant 0) which are valid 8-4-4-4-12
// hex strings but fail the strict RFC check. Use the permissive GUID regex (any hex UUID
// format) so all real DB IDs are accepted regardless of version/variant byte.
const GUID_REGEX = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
const optionalUuid = z
  .preprocess(
    (v) => {
      if (typeof v !== "string") return v;
      const t = v.trim();
      if (!t || t.toLowerCase() === "none") return null;
      // Coerce non-UUID-like strings to null (defence-in-depth).
      if (!GUID_REGEX.test(t)) return null;
      return t;
    },
    z.string().regex(GUID_REGEX, "ID tham chiếu không hợp lệ").nullable(),
  )
  .optional();

// Mirrors the client-side isBodyEmpty() check (ContentEditorForm.tsx) so a rich-text
// body/description that is null, {}, [], or an empty TipTap doc is rejected the same
// way server-side as it already visually blocks the Publish button client-side.
const hasMeaningfulJson = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "object") {
    const v = value as Record<string, unknown>;
    if (Array.isArray(v)) return v.length > 0;
    if (v.type === "doc" && Array.isArray(v.content)) return (v.content as unknown[]).length > 0;
    return Object.keys(v).length > 0;
  }
  return false;
};
const slugSchema = z.string().trim().min(1, "Slug không được để trống").regex(slugRegex, "Slug chỉ được chứa ký tự thường, số và dấu gạch ngang (e.g. sofa-curve)");
// Shared phone validator used for hotlines / contact numbers.
export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Số điện thoại là bắt buộc")
  .refine(
    (v) => phoneAllowed.test(v) && digitCount(v) >= 8 && digitCount(v) <= 15,
    "Số điện thoại không hợp lệ (chỉ gồm chữ số, có thể kèm + - ( ) và khoảng trắng; 8–15 chữ số)",
  );

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
  brand_id: optionalUuid,
  brand_series: optionalText,
  showroom_code: optionalText,
  price_unit: optionalText,
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  promotion_id: optionalUuid,
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
    if (data.status !== "published") return true;
    return hasMeaningfulJson(data.description_json_vi);
  },
  {
    message: "Nội dung mô tả tiếng Việt không được để trống khi xuất bản",
    path: ["description_json_vi"],
  }
).refine(
  (data) => {
    if (data.status !== "published" || !data.name_en) return true;
    return hasMeaningfulJson(data.description_json_en);
  },
  {
    message: "Nội dung mô tả tiếng Anh không được để trống khi đã nhập tên tiếng Anh và xuất bản",
    path: ["description_json_en"],
  }
);

export const categorySchema = z.object({
  slug: slugSchema,
  name_vi: requiredText("Tên danh mục tiếng Việt là bắt buộc"),
  name_en: optionalText,
  description_vi: optionalText,
  description_en: optionalText,
  parent_id: optionalUuid,
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
  // Optional scheduled/actual publish datetime (datetime-local "YYYY-MM-DDTHH:mm" or ISO).
  published_at: z.string().trim().nullish().transform((v) => v || null),
  cover_image: optionalText,
  seo_title_vi: optionalText,
  seo_title_en: optionalText,
  seo_description_vi: optionalText,
  seo_description_en: optionalText,
}).refine(
  (data) => data.status !== "published" || Boolean(data.cover_image),
  {
    message: "Cần có ảnh bìa trước khi xuất bản bài viết",
    path: ["cover_image"],
  }
).refine(
  (data) => data.status !== "published" || hasMeaningfulJson(data.body_json_vi),
  {
    message: "Nội dung bài viết tiếng Việt không được để trống khi xuất bản",
    path: ["body_json_vi"],
  }
).refine(
  (data) => data.status !== "published" || !data.title_en || hasMeaningfulJson(data.body_json_en),
  {
    message: "Nội dung bài viết tiếng Anh không được để trống khi đã nhập tiêu đề tiếng Anh và xuất bản",
    path: ["body_json_en"],
  }
);

export const showroomSchema = z.object({
  code: slugSchema, // Internal unique code (slug-like)
  name_vi: requiredText("Tên showroom tiếng Việt là bắt buộc"),
  name_en: optionalText,
  address_vi: requiredText("Địa chỉ tiếng Việt là bắt buộc"),
  address_en: optionalText,
  // Structured Vietnam address (2-tier: Tỉnh/TP -> Phường/Xã). Optional/backward-compatible.
  province_code: optionalText,
  province_name: optionalText,
  ward_code: optionalText,
  ward_name: optionalText,
  street_address: optionalText,
  opening_hours_vi: optionalText,
  opening_hours_en: optionalText,
  hotline: phoneSchema,
  // DB CHECK chk_showrooms_map_urls_https requires both to start with https://.
  google_maps_embed_url: requiredText("URL bản đồ nhúng bắt buộc").regex(
    /^https:\/\//,
    "URL bản đồ nhúng phải bắt đầu bằng https:// (dán liên kết, không dán mã <iframe>)",
  ),
  google_maps_fallback_url: requiredText("URL bản đồ dự phòng bắt buộc").regex(
    /^https:\/\//,
    "URL bản đồ dự phòng phải bắt đầu bằng https://",
  ),
  // DB CHECK chk_showrooms_coordinates: lat ∈ [-90,90], lng ∈ [-180,180].
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
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
  // Required (item 4.3): a blank start date made it too easy to publish a campaign
  // that goes live immediately by accident. end_at stays optional (open-ended promos
  // remain valid).
  start_at: requiredText("Ngày bắt đầu là bắt buộc"),
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
  contactPhone: phoneSchema,
  contactEmail: z.string().trim().email("Email liên hệ không hợp lệ").min(1, "Email liên hệ là bắt buộc"),
  quoteSenderEmail: z.string().trim().email("Email gửi báo giá không hợp lệ").optional().or(z.string().max(0)),
  addressVi: requiredText("Địa chỉ tiếng Việt là bắt buộc"),
  addressEn: optionalText,
  // Structured Vietnam contact address (2-tier: Tỉnh/TP -> Phường/Xã). Optional.
  contactProvinceCode: optionalText,
  contactProvinceName: optionalText,
  contactWardCode: optionalText,
  contactWardName: optionalText,
  contactStreet: optionalText,
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
  aboutEyebrowVi: optionalText,
  aboutEyebrowEn: optionalText,
  aboutJourneyEyebrowVi: optionalText,
  aboutJourneyEyebrowEn: optionalText,
  aboutJourneyHeadingVi: optionalText,
  aboutJourneyHeadingEn: optionalText,
  // About page timeline milestones (dynamic list, bilingual per item)
  aboutMilestones: z
    .array(
      z.object({
        yearVi: optionalText,
        yearEn: optionalText,
        titleVi: optionalText,
        titleEn: optionalText,
        textVi: optionalText,
        textEn: optionalText,
      })
    )
    .max(30)
    .optional(),
  // About/home stats (value + label, bilingual per item)
  aboutStats: z
    .array(
      z.object({
        valueVi: optionalText,
        valueEn: optionalText,
        labelVi: optionalText,
        labelEn: optionalText,
      })
    )
    .max(12)
    .optional(),
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
  // Public social / contact links. URLs are optional here; the API only persists
  // rows that have a URL and normalises them to an https:// prefix.
  socialLinks: z
    .array(
      z.object({
        platform: z.enum(["facebook", "zalo", "youtube", "tiktok", "instagram", "other"]),
        label: optionalText,
        url: optionalUrl,
        isEnabled: z.boolean().optional().default(true),
      })
    )
    .optional(),
});

export type ProductInput = z.input<typeof productSchema>;
export type CategoryInput = z.input<typeof categorySchema>;
export type BlogPostInput = z.input<typeof blogPostSchema>;
export type ShowroomInput = z.input<typeof showroomSchema>;
export type BrandInput = z.input<typeof brandSchema>;
export type PromotionInput = z.input<typeof promotionSchema>;
export type SettingsInput = z.input<typeof settingsSchema>;