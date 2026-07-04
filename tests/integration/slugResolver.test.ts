import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { Client } from "pg";

// Mock server-only
vi.mock("server-only", () => ({}));

// Mock env from schema
vi.mock("@/lib/env/schema", () => {
  const fs = require("fs");
  const path = require("path");
  const localEnv: Record<string, string> = {};
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line: string) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        localEnv[key] = value.trim();
        process.env[key] = value.trim();
      }
    });
  }
  return {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: localEnv.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: localEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: localEnv.SUPABASE_SERVICE_ROLE_KEY,
    },
    validateEnv: () => ({}),
  };
});

import { createAdminClient } from "@/lib/supabase/server";
import { getProductBySlug } from "@/lib/supabase/queries";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

describe("Cross-Locale Slug Resolver Integration Tests", () => {
  let dbClient: Client;
  const testProductId = "c3e1ae4d-b971-4668-b8f9-4bbfd4bf5a29";
  const testCategoryId = "c1000000-0000-0000-0000-0000000000c1";

  beforeAll(async () => {
    dbClient = new Client({ connectionString });
    await dbClient.connect();
    
    // Cleanup trước khi seed
    await dbClient.query("SET session_replication_role = 'replica'");
    await dbClient.query("DELETE FROM public.product_translations WHERE product_id = $1", [testProductId]);
    await dbClient.query("DELETE FROM public.products WHERE id = $1", [testProductId]);
    await dbClient.query("DELETE FROM public.product_category_translations WHERE category_id = $1", [testCategoryId]);
    await dbClient.query("DELETE FROM public.product_categories WHERE id = $1", [testCategoryId]);
    
    // Seed Category (published — a public product's category must be published; S3
    // now hides products under draft/archived categories).
    await dbClient.query("INSERT INTO public.product_categories (id, sort_order, status, published_at) VALUES ($1, 0, 'published', now())", [testCategoryId]);
    await dbClient.query("INSERT INTO public.product_category_translations (category_id, locale, name, slug) VALUES ($1, 'vi', 'Gạch', 'gach')", [testCategoryId]);
    
    // Seed Product
    await dbClient.query(`
      INSERT INTO public.products (id, category_id, reference_code, status, published_at) 
      VALUES ($1, $2, 'REF-RESOLVER-TEST', 'published', now())
    `, [testProductId, testCategoryId]);
    
    // Seed Translations (VI & EN)
    await dbClient.query(`
      INSERT INTO public.product_translations (product_id, locale, name, slug, summary, description_json, material, dimension_display_text)
      VALUES ($1, 'vi', 'Gạch Eurotile Hoàng Gia', 'gach-eurotile-hoang-gia', 'Tóm tắt', '{}'::jsonb, 'Gỗ', '100x100')
    `, [testProductId]);
    await dbClient.query(`
      INSERT INTO public.product_translations (product_id, locale, name, slug, summary, description_json, material, dimension_display_text)
      VALUES ($1, 'en', 'Eurotile Royal Tile', 'eurotile-royal-tile', 'Summary', '{}'::jsonb, 'Wood', '100x100')
    `, [testProductId]);
    await dbClient.query("SET session_replication_role = 'origin'");
  });

  afterAll(async () => {
    await dbClient.query("SET session_replication_role = 'replica'");
    await dbClient.query("DELETE FROM public.product_translations WHERE product_id = $1", [testProductId]);
    await dbClient.query("DELETE FROM public.products WHERE id = $1", [testProductId]);
    await dbClient.query("DELETE FROM public.product_category_translations WHERE category_id = $1", [testCategoryId]);
    await dbClient.query("DELETE FROM public.product_categories WHERE id = $1", [testCategoryId]);
    await dbClient.query("SET session_replication_role = 'origin'");
    await dbClient.end();
  });

  it("should successfully resolve product details even with wrong locale slug", async () => {
    process.env.NEXT_PUBLIC_USE_MOCK_DATA = "false";
    const supabase = createAdminClient();

    // 1. Resolve Vietnamese slug in English locale
    const productEn = await getProductBySlug(supabase, "gach-eurotile-hoang-gia", "en");
    expect(productEn).not.toBeNull();
    expect(productEn!.id).toBe(testProductId);
    expect(productEn!.name.en).toBe("Eurotile Royal Tile"); // English name mapping

    // 2. Resolve English slug in Vietnamese locale
    const productVi = await getProductBySlug(supabase, "eurotile-royal-tile", "vi");
    expect(productVi).not.toBeNull();
    expect(productVi!.id).toBe(testProductId);
    expect(productVi!.name.vi).toBe("Gạch Eurotile Hoàng Gia"); // Vietnamese name mapping
  });

  it("should return null for non-existent slug", async () => {
    process.env.NEXT_PUBLIC_USE_MOCK_DATA = "false";
    const supabase = createAdminClient();

    const product = await getProductBySlug(supabase, "non-existent-slug-xyz", "vi");
    expect(product).toBeNull();
  });
});
