import { describe, expect, it } from "vitest";
import { quoteRequestSchema } from "../../lib/validations/quote";

const validQuote = {
  locale: "vi" as const,
  fullName: "Nguyen Van A",
  phone: "090 123 4567",
  email: "customer@example.com",
  company: "",
  service: "wood-furniture",
  message: "Toi can tu van sofa phong khach va bao gia chi tiet.",
  productId: "",
  categoryId: "",
  sourcePath: "/vi/contact",
  sourceUrl: "",
  honeypot: "",
};

describe("quoteRequestSchema", () => {
  it("accepts a valid quote request", () => {
    const parsed = quoteRequestSchema.safeParse(validQuote);
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid phone input", () => {
    const parsed = quoteRequestSchema.safeParse({ ...validQuote, phone: "<script>alert(1)</script>" });
    expect(parsed.success).toBe(false);
  });

  it("rejects honeypot submissions", () => {
    const parsed = quoteRequestSchema.safeParse({ ...validQuote, honeypot: "bot" });
    expect(parsed.success).toBe(false);
  });

  it("rejects empty message", () => {
    const parsed = quoteRequestSchema.safeParse({ ...validQuote, message: "" });
    expect(parsed.success).toBe(false);
  });

  it("rejects short phone number", () => {
    const parsed = quoteRequestSchema.safeParse({ ...validQuote, phone: "123" });
    expect(parsed.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const parsed = quoteRequestSchema.safeParse({ ...validQuote, email: "not-an-email" });
    expect(parsed.success).toBe(false);
  });

  it("accepts empty optional fields", () => {
    const parsed = quoteRequestSchema.safeParse({
      ...validQuote,
      email: "",
      company: "",
      service: "",
      productId: "",
      categoryId: "",
      sourceUrl: "",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects sourcePath that does not start with /", () => {
    const parsed = quoteRequestSchema.safeParse({ ...validQuote, sourcePath: "contact" });
    expect(parsed.success).toBe(false);
  });

  it("rejects invalid sourceUrl", () => {
    const parsed = quoteRequestSchema.safeParse({ ...validQuote, sourceUrl: "not-a-url" });
    expect(parsed.success).toBe(false);
  });
});
