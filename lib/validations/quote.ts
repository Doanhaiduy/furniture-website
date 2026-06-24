import { z } from "zod";

export function getQuoteRequestSchema(locale: "vi" | "en") {
  const isVi = locale === "vi";
  return z.object({
    locale: z.enum(["vi", "en"]),
    fullName: z.string()
      .trim()
      .min(2, isVi ? "Họ tên phải có ít nhất 2 ký tự" : "Full name must be at least 2 characters")
      .max(160, isVi ? "Họ tên không được vượt quá 160 ký tự" : "Full name cannot exceed 160 characters"),
    phone: z.string()
      .trim()
      .min(7, isVi ? "Số điện thoại phải có ít nhất 7 số" : "Phone number must be at least 7 digits")
      .max(32, isVi ? "Số điện thoại không được quá 32 ký tự" : "Phone number cannot exceed 32 characters")
      .regex(/^[0-9+().\-\s]{7,32}$/, isVi ? "Số điện thoại không đúng định dạng" : "Invalid phone format"),
    email: z.string()
      .trim()
      .email(isVi ? "Địa chỉ email không hợp lệ" : "Invalid email address")
      .optional()
      .or(z.literal("")),
    company: z.string().trim().max(180, isVi ? "Tên công ty không được quá 180 ký tự" : "Company name cannot exceed 180 characters").optional().or(z.literal("")),
    service: z.string().trim().max(120).optional().or(z.literal("")),
    message: z.string()
      .trim()
      .min(10, isVi ? "Nội dung yêu cầu phải có ít nhất 10 ký tự" : "Message must be at least 10 characters")
      .max(5000, isVi ? "Nội dung yêu cầu không được quá 5000 ký tự" : "Message cannot exceed 5000 characters"),
    productId: z.string().trim().max(120).optional().or(z.literal("")),
    categoryId: z.string().trim().max(120).optional().or(z.literal("")),
    sourcePath: z.string()
      .trim()
      .min(1)
      .max(2048)
      .regex(/^\//, isVi ? "Đường dẫn nguồn không hợp lệ" : "Invalid source path"),
    sourceUrl: z.string().trim().url(isVi ? "URL không hợp lệ" : "Invalid URL").optional().or(z.literal("")),
    honeypot: z.string().max(0, isVi ? "Phát hiện spam" : "Spam detected").optional().or(z.literal("")),
  });
}

// Default export schema for compatibility with existing tests
export const quoteRequestSchema = getQuoteRequestSchema("vi");

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;
