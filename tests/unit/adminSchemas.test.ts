import { describe, it, expect } from "vitest";
import {
  productSchema,
  categorySchema,
  brandSchema,
  promotionSchema,
  settingsSchema,
} from "@/lib/validations/admin";

describe("Admin Schemas Unit Tests", () => {
  describe("productSchema validation", () => {
    it("should accept valid product payload", () => {
      const valid = {
        slug: "bon-cau-toto-x1",
        name_vi: "Bồn cầu Toto X1",
        summary_vi: "Bồn cầu cao cấp",
        category_id: "777e7bc6-0c1a-46d6-a8a3-c15c91606041",
        price_min: 15000000,
        price_max: 18000000,
        status: "draft" as const,
      };
      const result = productSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject product with invalid slug format", () => {
      const invalid = {
        slug: "bon_cau_invalid!",
        name_vi: "Bồn cầu",
        summary_vi: "Mô tả",
        category_id: "7a2e7bc6-0c1a-46d6-a8a3-c15c91606042",
      };
      const result = productSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("slug");
      }
    });

    it("should reject product if name_vi is missing", () => {
      const invalid = {
        slug: "bon-cau",
        summary_vi: "Mô tả",
        category_id: "7a2e7bc6-0c1a-46d6-a8a3-c15c91606042",
      };
      const result = productSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject product where price_min > price_max", () => {
      const invalid = {
        slug: "bon-cau-toto-x1",
        name_vi: "Bồn cầu Toto X1",
        summary_vi: "Bồn cầu cao cấp",
        category_id: "777e7bc6-0c1a-46d6-a8a3-c15c91606041",
        price_min: 20000000,
        price_max: 15000000,
        status: "draft" as const,
      };
      const result = productSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Giá tối thiểu");
      }
    });

    it("should reject product where promo_price_min >= price_min", () => {
      const invalid = {
        slug: "bon-cau-toto-x1",
        name_vi: "Bồn cầu Toto X1",
        summary_vi: "Bồn cầu cao cấp",
        category_id: "777e7bc6-0c1a-46d6-a8a3-c15c91606041",
        price_min: 15000000,
        price_max: 18000000,
        promo_price_min: 16000000,
        status: "draft" as const,
      };
      const result = productSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Giá khuyến mãi");
      }
    });
  });

  describe("categorySchema validation", () => {
    it("should accept valid category payload", () => {
      const valid = {
        slug: "thiet-bi-ve-sinh",
        name_vi: "Thiết bị vệ sinh",
        group_key: "sanitary" as const,
        status: "published" as const,
      };
      const result = categorySchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject invalid group_key", () => {
      const invalid = {
        slug: "invalid-group",
        name_vi: "Group sai",
        group_key: "electronic" as any, // invalid enum value
      };
      const result = categorySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("brandSchema validation", () => {
    it("should accept valid brand", () => {
      const valid = {
        name_vi: "Toto",
        status: "published" as const,
        origin: "Japan",
      };
      const result = brandSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject brand without name_vi", () => {
      const invalid = {
        origin: "Japan",
      };
      const result = brandSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("promotionSchema validation", () => {
    it("should accept valid promotion", () => {
      const valid = {
        code: "SUMMER2026",
        discount_percentage: 15,
        title_vi: "Khuyến mãi mùa hè",
      };
      const result = promotionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject discount percentage out of range", () => {
      const invalid = {
        code: "SALE150",
        discount_percentage: 150, // invalid: max 100
        title_vi: "Gia re bat ngo",
      };
      const result = promotionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject promotion where start_at >= end_at", () => {
      const invalid = {
        code: "SUMMER2026",
        discount_percentage: 15,
        title_vi: "Khuyến mãi mùa hè",
        start_at: "2026-06-25T00:00:00Z",
        end_at: "2026-06-20T00:00:00Z",
      };
      const result = promotionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Thời gian bắt đầu");
      }
    });

    it("should reject promotion where combo_price >= original_price", () => {
      const invalid = {
        code: "SUMMER2026",
        discount_percentage: 15,
        title_vi: "Khuyến mãi mùa hè",
        combo_price: 20000000,
        original_price: 15000000,
      };
      const result = promotionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Giá combo");
      }
    });
  });

  describe("settingsSchema validation", () => {
    it("should accept valid settings payload", () => {
      const valid = {
        brandNameVi: "Showroom Phương Đông",
        contactPhone: "0817235758",
        contactEmail: "contact@phuongdong.vn",
        addressVi: "124 Nguyễn Thị Thập",
      };
      const result = settingsSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email format", () => {
      const invalid = {
        brandNameVi: "Showroom",
        contactPhone: "09090909",
        contactEmail: "sai-email-format",
        addressVi: "124 NTT",
      };
      const result = settingsSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("contactEmail");
      }
    });
  });
});
