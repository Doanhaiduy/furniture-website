/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { requireEditorOrAdmin } from "./auth";
import { createAdminClient, createClient } from "./server";
import { writeAuditLog } from "./audit";
import { revalidatePath } from "next/cache";
import { type SupabaseClient } from "@supabase/supabase-js";

// Types
export interface BrandInput {
  name_vi: string;
  name_en?: string;
  description_vi?: string;
  description_en?: string;
  origin?: string;
  logo_url?: string;
  status: "draft" | "published" | "archived";
  sort_order: number;
  seo_title_vi?: string;
  seo_title_en?: string;
  seo_description_vi?: string;
  seo_description_en?: string;
}

// Helpers
function triggerRevalidation() {
  try {
    revalidatePath("/", "layout");
  } catch (e) {
    console.warn("[REVALIDATION WARNING] Failed to revalidate public routes:", e);
  }
}

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
  return uuidRegex.test(value);
}

async function getOrCreateMediaAssetId(
  supabase: SupabaseClient,
  urlOrUuid: string | null | undefined,
  userId: string
): Promise<string | null> {
  if (!urlOrUuid) return null;
  const value = urlOrUuid.trim();
  if (!value) return null;
  if (isUuid(value)) return value;

  const { data: existing } = await supabase
    .from("media_assets")
    .select("id")
    .eq("public_url", value)
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data: inserted, error } = await supabase
    .from("media_assets")
    .insert({
      public_url: value,
      storage_provider: value.includes("cloudinary") ? "cloudinary" : "supabase_storage",
      resource_type: "image",
      mime_type: "image/png",
      format: "png",
      size_bytes: 1,
      uploaded_by: userId,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("Failed to auto-create media asset for URL:", urlOrUuid, error);
    return null;
  }
  return inserted.id;
}

interface MockBrand {
  id: string;
  name: { vi: string; en: string };
  origin: string;
  logo_url: string;
  status: "draft" | "published" | "archived";
  sort_order: number;
  description?: { vi: string; en: string };
}

// Mock data for development
const mockBrands: MockBrand[] = [
  {
    id: "brand-1",
    name: { vi: "Kohler", en: "Kohler" },
    origin: "USA",
    logo_url: "/logos/kohler.png",
    status: "published",
    sort_order: 1,
  },
  {
    id: "brand-2",
    name: { vi: "Grohe", en: "Grohe" },
    origin: "Germany",
    logo_url: "/logos/grohe.png",
    status: "published",
    sort_order: 2,
  },
  {
    id: "brand-3",
    name: { vi: "TOTO", en: "TOTO" },
    origin: "Japan",
    logo_url: "/logos/toto.png",
    status: "published",
    sort_order: 3,
  },
];

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export async function getAdminBrandById(id: string): Promise<{
  success: boolean;
  data?: {
    id: string;
    name_vi: string;
    name_en: string;
    description_vi: string;
    description_en: string;
    origin: string;
    logo_url: string;
    status: "draft" | "published" | "archived";
    sort_order: number;
    seo_title_vi?: string;
    seo_title_en?: string;
    seo_description_vi?: string;
    seo_description_en?: string;
  };
  error?: string;
}> {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  
  if (useMock) {
    const brand = mockBrands.find(b => b.id === id);
    if (brand) {
      return {
        success: true,
        data: {
          id: brand.id,
          name_vi: brand.name.vi,
          name_en: brand.name.en,
          description_vi: brand.description?.vi || "",
          description_en: brand.description?.en || "",
          origin: brand.origin,
          logo_url: brand.logo_url,
          status: brand.status,
          sort_order: brand.sort_order,
        }
      };
    }
    return { success: false, error: "Brand not found" };
  }

  try {
    const supabase = await createClient();
    const { data: brand, error } = await supabase
      .from("brands")
      .select(`
        *,
        brand_translations (*),
        logo_media:media_assets!brands_logo_media_id_fkey(public_url)
      `)
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !brand) {
      return { success: false, error: error?.message || "Brand not found" };
    }

    const viTrans = brand.brand_translations?.find((t: { locale: string; name: string; description?: string; seo_title?: string; seo_description?: string }) => t.locale === "vi");
    const enTrans = brand.brand_translations?.find((t: { locale: string; name: string; description?: string; seo_title?: string; seo_description?: string }) => t.locale === "en");
    const logoMediaRecord = brand.logo_media as Record<string, any> | null | undefined;

    return {
      success: true,
      data: {
        id: brand.id,
        name_vi: viTrans?.name || "",
        name_en: enTrans?.name || "",
        description_vi: viTrans?.description || "",
        description_en: enTrans?.description || "",
        origin: brand.origin || "",
        logo_url: logoMediaRecord?.public_url || "",
        status: brand.status,
        sort_order: brand.sort_order,
        seo_title_vi: viTrans?.seo_title || "",
        seo_title_en: enTrans?.seo_title || "",
        seo_description_vi: viTrans?.seo_description || "",
        seo_description_en: enTrans?.seo_description || "",
      }
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Database error" };
  }
}

export async function createAdminBrand(data: BrandInput): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> {
  const user = await requireEditorOrAdmin();
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (useMock) {
    const mockId = `brand-${Date.now()}`;
    mockBrands.push({
      id: mockId,
      name: { vi: data.name_vi, en: data.name_en || data.name_vi },
      description: { vi: data.description_vi || "", en: data.description_en || "" },
      origin: data.origin || "",
      logo_url: data.logo_url || "",
      status: data.status,
      sort_order: data.sort_order,
    });
    triggerRevalidation();
    return { success: true, id: mockId };
  }

  try {
    const supabase = await createClient();
    const logoMediaId = await getOrCreateMediaAssetId(supabase, data.logo_url, user.id);

    // Insert brand
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .insert({
        logo_media_id: logoMediaId,
        origin: data.origin,
        status: data.status,
        sort_order: data.sort_order,
        created_by: user.id,
        updated_by: user.id,
        published_at: data.status === "published" ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (brandError || !brand) {
      return { success: false, error: brandError?.message || "Failed to create brand" };
    }

    // Insert translations
    const translations = [
      {
        brand_id: brand.id,
        locale: "vi",
        name: data.name_vi,
        description: data.description_vi,
        seo_title: data.seo_title_vi,
        seo_description: data.seo_description_vi,
      },
      {
        brand_id: brand.id,
        locale: "en",
        name: data.name_en || data.name_vi,
        description: data.description_en || data.description_vi,
        seo_title: data.seo_title_en,
        seo_description: data.seo_description_en,
      },
    ];

    const { error: transError } = await supabase
      .from("brand_translations")
      .insert(translations);

    if (transError) {
      await supabase.from("brands").delete().eq("id", brand.id);
      return { success: false, error: transError.message };
    }

    // Write audit log
    await writeAuditLog(supabase, {
      actorId: user.id,
      action: "create",
      entityType: "brand",
      entityId: brand.id,
      metadata: { name: data.name_vi },
    });

    triggerRevalidation();
    return { success: true, id: brand.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function updateAdminBrand(id: string, data: BrandInput): Promise<{
  success: boolean;
  error?: string;
}> {
  const user = await requireEditorOrAdmin();
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (useMock) {
    const idx = mockBrands.findIndex(b => b.id === id);
    if (idx !== -1) {
      mockBrands[idx] = {
        ...mockBrands[idx],
        name: { vi: data.name_vi, en: data.name_en || data.name_vi },
        description: { vi: data.description_vi || "", en: data.description_en || "" },
        origin: data.origin || "",
        logo_url: data.logo_url || mockBrands[idx].logo_url,
        status: data.status,
        sort_order: data.sort_order,
      };
      triggerRevalidation();
      return { success: true };
    }
    return { success: false, error: "Brand not found" };
  }

  try {
    const supabase = await createClient();
    const logoMediaId = await getOrCreateMediaAssetId(supabase, data.logo_url, user.id);

    // Update brand
    const { error: brandError } = await supabase
      .from("brands")
      .update({
        logo_media_id: logoMediaId,
        origin: data.origin,
        status: data.status,
        sort_order: data.sort_order,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
        published_at: data.status === "published" ? new Date().toISOString() : null,
      })
      .eq("id", id);

    if (brandError) {
      return { success: false, error: brandError.message };
    }

    // Upsert translations
    const { error: viError } = await supabase
      .from("brand_translations")
      .upsert({
        brand_id: id,
        locale: "vi",
        name: data.name_vi,
        description: data.description_vi,
        seo_title: data.seo_title_vi,
        seo_description: data.seo_description_vi,
        updated_at: new Date().toISOString(),
      }, { onConflict: "brand_id,locale" });

    if (viError) return { success: false, error: viError.message };

    const { error: enError } = await supabase
      .from("brand_translations")
      .upsert({
        brand_id: id,
        locale: "en",
        name: data.name_en || data.name_vi,
        description: data.description_en || data.description_vi,
        seo_title: data.seo_title_en,
        seo_description: data.seo_description_en,
        updated_at: new Date().toISOString(),
      }, { onConflict: "brand_id,locale" });

    if (enError) return { success: false, error: enError.message };

    // Write audit log
    await writeAuditLog(supabase, {
      actorId: user.id,
      action: "update",
      entityType: "brand",
      entityId: id,
      metadata: { name: data.name_vi },
    });

    triggerRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function deleteAdminBrand(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const user = await requireEditorOrAdmin();
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (useMock) {
    const idx = mockBrands.findIndex(b => b.id === id);
    if (idx !== -1) {
      mockBrands[idx].status = "archived";
      triggerRevalidation();
      return { success: true };
    }
    return { success: false, error: "Brand not found" };
  }

  try {
    const supabase = createAdminClient();

    // Check if any products use this brand
    const { data: products, error: checkError } = await supabase
      .from("products")
      .select("id")
      .eq("brand_id", id)
      .is("deleted_at", null)
      .limit(1);

    if (checkError) {
      return { success: false, error: checkError.message };
    }

    if (products && products.length > 0) {
      return {
        success: false,
        error: "Cannot delete brand that is used by products. Please remove products first or change their brand."
      };
    }

    // Soft delete
    const { error } = await supabase
      .from("brands")
      .update({
        deleted_at: new Date().toISOString(),
        status: "archived",
        updated_by: user.id,
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    // Write audit log
    await writeAuditLog(supabase, {
      actorId: user.id,
      action: "archive",
      entityType: "brand",
      entityId: id,
    });

    triggerRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function getPublicBrands(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (useMock) {
    return {
      success: true,
      data: mockBrands
        .filter(b => b.status === "published")
        .map(b => ({
          id: b.id,
          name: b.name,
          origin: b.origin,
          logo_url: b.logo_url,
          sort_order: b.sort_order,
        }))
    };
  }

  try {
    const supabase = createAdminClient();
    const { data: brands, error } = await supabase
      .from("brands")
      .select(`
        id,
        origin,
        sort_order,
        logo_media:media_assets!fk_brands_logo_media(public_url),
        brand_translations (locale, name, description)
      `)
      .eq("status", "published")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    const formatted = brands?.map((b: any) => {
      const viTrans = b.brand_translations?.find((t: any) => t.locale === "vi");
      const enTrans = b.brand_translations?.find((t: any) => t.locale === "en");
      const logoMediaRecord = b.logo_media as Record<string, any> | null | undefined;

      return {
        id: b.id,
        name: {
          vi: viTrans?.name || "",
          en: enTrans?.name || viTrans?.name || "",
        },
        description: {
          vi: viTrans?.description || "",
          en: enTrans?.description || "",
        },
        origin: b.origin,
        logo_url: logoMediaRecord?.public_url || "",
        sort_order: b.sort_order,
      };
    });

    return { success: true, data: formatted || [] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Database error" };
  }
}

export async function getAdminBrands(): Promise<any[]> {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (useMock) {
    return [
      {
        id: "brand-1",
        name: { vi: "Kohler", en: "Kohler" },
        origin: "USA",
        logo_url: "/logos/kohler.png",
        status: "published",
        sort_order: 1,
      },
      {
        id: "brand-2",
        name: { vi: "Grohe", en: "Grohe" },
        origin: "Germany",
        logo_url: "/logos/grohe.png",
        status: "published",
        sort_order: 2,
      },
      {
        id: "brand-3",
        name: { vi: "TOTO", en: "TOTO" },
        origin: "Japan",
        logo_url: "/logos/toto.png",
        status: "published",
        sort_order: 3,
      },
    ];
  }

  try {
    const supabase = await createClient();
    const { data: brands, error } = await supabase
      .from("brands")
      .select(`
        id,
        origin,
        sort_order,
        status,
        logo_media:media_assets!fk_brands_logo_media(public_url),
        brand_translations (locale, name)
      `)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching brands for admin:", error);
      return [];
    }

    const formatted = brands?.map((b) => {
      const viTrans = b.brand_translations?.find((t) => t.locale === "vi");
      const enTrans = b.brand_translations?.find((t) => t.locale === "en");
      const logoMedia = Array.isArray(b.logo_media) ? b.logo_media[0] : b.logo_media;
      const logoUrl = logoMedia && typeof logoMedia === 'object' && 'public_url' in logoMedia 
        ? (logoMedia as { public_url: string }).public_url 
        : "";

      return {
        id: b.id,
        name: {
          vi: viTrans?.name || "",
          en: enTrans?.name || viTrans?.name || "",
        },
        origin: b.origin,
        logo_url: logoUrl,
        status: b.status,
        sort_order: b.sort_order,
      };
    });

    return formatted || [];
  } catch (err) {
    console.error("Exception fetching brands for admin:", err);
    return [];
  }
}

