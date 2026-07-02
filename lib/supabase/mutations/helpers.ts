import { type SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string) {
  return uuidRegex.test(value);
}

export function triggerRevalidation() {
  try {
    revalidatePath("/", "layout");
  } catch (e) {
    console.warn("[REVALIDATION WARNING] Failed to revalidate public routes:", e);
  }
}

export async function getOrCreateMediaAssetId(
  supabase: SupabaseClient,
  urlOrUuid: string | null | undefined,
  userId: string
): Promise<string | null> {
  if (!urlOrUuid) return null;
  const value = urlOrUuid.trim();
  if (!value) return null;
  if (isUuid(value)) return value;

  // Check if asset already exists with the same public URL
  const { data: existing } = await supabase
    .from("media_assets")
    .select("id")
    .eq("public_url", value)
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing.id;

  // Otherwise create a new media asset
  const { data: inserted, error } = await supabase
    .from("media_assets")
    .insert({
      public_url: value,
      storage_provider: value.includes("cloudinary") ? "cloudinary" : "supabase_storage",
      resource_type: "image",
      mime_type: "image/jpeg",
      format: "jpg",
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

export function validationMessages(issues: Array<{ message: string }>) {
  return issues.map((issue) => issue.message).join(". ");
}

export function localizedText(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}
