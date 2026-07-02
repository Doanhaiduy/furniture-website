import { describe, it, expect } from "vitest";
import { quoteRequestSchema } from "@/lib/validations/quote";

describe("quoteRequestSchema validation tests", () => {
  it("should accept valid quote request payload", () => {
    const validPayload = {
      locale: "vi" as const,
      fullName: "Nguyen Van A",
      phone: "+84901234567",
      email: "test@example.com",
      message: "Tôi muốn nhận báo giá sản phẩm này ngay",
      sourcePath: "/products/bon-cau-toto",
    };

    const result = quoteRequestSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("should reject short full name", () => {
    const invalidPayload = {
      locale: "vi" as const,
      fullName: "A",
      phone: "0901234567",
      message: "Tôi muốn nhận báo giá sản phẩm này ngay",
      sourcePath: "/products/bon-cau-toto",
    };

    const result = quoteRequestSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("fullName");
    }
  });

  it("should reject invalid phone format (e.g. letters)", () => {
    const invalidPayload = {
      locale: "vi" as const,
      fullName: "Nguyen Van A",
      phone: "abc1234567",
      message: "Tôi muốn nhận báo giá sản phẩm này ngay",
      sourcePath: "/products/bon-cau-toto",
    };

    const result = quoteRequestSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("phone");
    }
  });

  it("should reject invalid phone format (e.g. too short)", () => {
    const invalidPayload = {
      locale: "vi" as const,
      fullName: "Nguyen Van A",
      phone: "123456",
      message: "Tôi muốn nhận báo giá sản phẩm này ngay",
      sourcePath: "/products/bon-cau-toto",
    };

    const result = quoteRequestSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it("should reject message shorter than 10 characters", () => {
    const invalidPayload = {
      locale: "vi" as const,
      fullName: "Nguyen Van A",
      phone: "0901234567",
      message: "Nhận giá",
      sourcePath: "/products/bon-cau-toto",
    };

    const result = quoteRequestSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("message");
    }
  });

  it("should reject invalid sourcePath (e.g. not starting with /)", () => {
    const invalidPayload = {
      locale: "vi" as const,
      fullName: "Nguyen Van A",
      phone: "0901234567",
      message: "Tôi muốn nhận báo giá sản phẩm này ngay",
      sourcePath: "products/bon-cau-toto",
    };

    const result = quoteRequestSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("sourcePath");
    }
  });

  it("should accept empty email or company or service", () => {
    const validPayload = {
      locale: "en" as const,
      fullName: "John Doe",
      phone: "0901234567",
      email: "",
      company: "",
      service: "",
      message: "Hello, I would like to get a quote for this product.",
      sourcePath: "/products/bath-tub",
    };

    const result = quoteRequestSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });
});
