import { describe, expect, it } from "vitest";
import { quoteRequestSchema } from "../../lib/validations/quote";

const validQuote = {
  locale: "vi",
  fullName: "Nguyen Van A",
  phone: "090 123 4567",
  email: "customer@example.com",
  company: "",
  service: "wood-furniture",
  message: "Toi can tu van sofa phong khach va bao gia chi tiet.",
  productId: "sofa-curve-velour",
  categoryId: "",
  sourcePath: "/vi/products/sofa-curve-velour",
  honeypot: "",
};

describe("quoteRequestSchema", () => {
  it("accepts a valid quote request", () => {
    const parsed = quoteRequestSchema.safeParse(validQuote);
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid phone input", () => {
    const parsed = quoteRequestSchema.safeParse({
      ...validQuote,
      phone: "<script>alert(1)</script>",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects honeypot submissions", () => {
    const parsed = quoteRequestSchema.safeParse({
      ...validQuote,
      honeypot: "bot",
    });
    expect(parsed.success).toBe(false);
  });
});
