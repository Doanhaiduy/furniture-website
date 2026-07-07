import { type SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string) {
  return uuidRegex.test(value);
}

/**
 * Derives the provider-identity columns required by chk_media_assets_provider_identity
 * (migration 0001) from a media URL. A media_assets row is only valid when it has EITHER
 * (storage_provider='cloudinary' AND cloudinary_public_id) OR
 * (storage_provider='supabase_storage' AND bucket AND object_path).
 *
 * Previously getOrCreateMediaAssetId inserted a cloudinary/supabase row WITHOUT these
 * identity columns, so the insert always failed the CHECK and the image was silently
 * dropped (the entity still saved "successfully" with a missing image). Returns null when
 * the URL is neither a recognisable Cloudinary nor Supabase Storage URL — in that case we
 * cannot represent it as a valid media asset and skip creation rather than crash.
 */
export function deriveMediaProviderIdentity(url: string):
  | { storage_provider: "cloudinary"; cloudinary_public_id: string }
  | { storage_provider: "supabase_storage"; bucket: string; object_path: string }
  | null {
  // Supabase Storage public/sign URL: /storage/v1/object/public/<bucket>/<object_path>
  const sb = url.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+?)(?:\?.*)?$/);
  if (sb) {
    return {
      storage_provider: "supabase_storage",
      bucket: decodeURIComponent(sb[1]),
      object_path: decodeURIComponent(sb[2]),
    };
  }
  // Cloudinary delivery URL: .../upload/[transformations/][v123/]<public_id>.<ext>
  const uploadIdx = url.indexOf("/upload/");
  if (url.includes("res.cloudinary.com") && uploadIdx !== -1) {
    const rest = url.slice(uploadIdx + "/upload/".length).split("?")[0].split("#")[0];
    const publicId = rest
      .split("/")
      .filter((seg, i) => {
        if (/^v\d+$/.test(seg)) return false; // version segment
        if (i === 0 && /[,=]/.test(seg)) return false; // transformation segment (e.g. w_500,h_500)
        return true;
      })
      .join("/")
      .replace(/\.[^/.]+$/, ""); // strip file extension
    if (publicId) return { storage_provider: "cloudinary", cloudinary_public_id: publicId };
  }
  return null;
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

  // A UUID must resolve to a LIVE media asset. Returning it blindly (BL-MEDIA-02) could
  // relink an asset that was soft-deleted (and whose Cloudinary file may be gone),
  // producing a broken image on the public site.
  if (isUuid(value)) {
    const { data: liveById } = await supabase
      .from("media_assets")
      .select("id")
      .eq("id", value)
      .is("deleted_at", null)
      .maybeSingle();
    return liveById?.id ?? null;
  }

  // Check if a LIVE asset already exists with the same public URL
  const { data: existing } = await supabase
    .from("media_assets")
    .select("id")
    .eq("public_url", value)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing.id;

  // Otherwise create a new media asset. Populate the provider-identity columns the
  // chk_media_assets_provider_identity CHECK requires, otherwise the insert fails and the
  // image is silently lost.
  const identity = deriveMediaProviderIdentity(value);
  if (!identity) {
    console.warn(
      "Cannot derive a Cloudinary/Supabase storage identity for URL; skipping media asset creation:",
      value,
    );
    return null;
  }

  const { data: inserted, error } = await supabase
    .from("media_assets")
    .insert({
      public_url: value,
      resource_type: "image",
      mime_type: "image/jpeg",
      format: "jpg",
      size_bytes: 1,
      uploaded_by: userId,
      ...identity,
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
