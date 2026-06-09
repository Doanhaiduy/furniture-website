import { z } from "zod";

export const quoteRequestSchema = z.object({
  locale: z.enum(["vi", "en"]),
  fullName: z.string().trim().min(2).max(160),
  phone: z
    .string()
    .trim()
    .min(7)
    .max(32)
    .regex(/^[0-9+().\-\s]{7,32}$/, "Invalid phone format"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  company: z.string().trim().max(180).optional().or(z.literal("")),
  service: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(5000),
  productId: z.string().trim().max(120).optional().or(z.literal("")),
  categoryId: z.string().trim().max(120).optional().or(z.literal("")),
  sourcePath: z.string().trim().min(1).max(2048).regex(/^\//, "Invalid source path"),
  sourceUrl: z.string().trim().url().optional().or(z.literal("")),
  honeypot: z.string().max(0).optional().or(z.literal("")),
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;
