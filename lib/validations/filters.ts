/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";

export const productFiltersSchema = z.object({
  category: z.string().trim().optional().or(z.literal("")),
  brand: z.string().trim().optional().or(z.literal("")),
  q: z.string().trim().optional().or(z.literal("")),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  sort: z.enum(["newest", "featured", "price-asc", "price-desc"]).default("featured"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

export type ProductFiltersInput = z.infer<typeof productFiltersSchema>;

/**
 * Parses query params safely into typed filter values.
 */
export function parseProductFilters(
  params: Record<string, string | string[] | undefined>
): ProductFiltersInput {
  const raw: Record<string, any> = {};
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== "") {
      raw[key] = Array.isArray(val) ? val[0] : val;
    }
  }

  const parsed = productFiltersSchema.safeParse(raw);
  if (parsed.success) {
    return parsed.data;
  }

  return {
    sort: "featured",
    page: 1,
    limit: 12,
  };
}
