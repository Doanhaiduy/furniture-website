import { z } from "zod";

export const quoteRequestSchema = z.object({
  locale: z.enum(["vi", "en"]),
  fullName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .min(8)
    .max(20)
    .regex(/^[0-9+\-\s().]+$/),
  email: z.string().trim().email().optional().or(z.literal("")),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  service: z.string().trim().max(160).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(2000),
  productId: z.string().trim().max(120).optional().or(z.literal("")),
  categoryId: z.string().trim().max(120).optional().or(z.literal("")),
  sourcePath: z.string().trim().min(1).max(300),
  honeypot: z.string().max(0).optional().or(z.literal("")),
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;
