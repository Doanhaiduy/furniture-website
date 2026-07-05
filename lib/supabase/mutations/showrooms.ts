/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import DOMPurify from "isomorphic-dompurify";
import { createAdminClient } from "../server";
import { requireEditorOrAdmin } from "../auth";
import { writeAuditLog } from "../audit";
import { showroomSchema, type ShowroomInput } from "../../validations/admin";
import { triggerRevalidation, getOrCreateMediaAssetId, isUuid, validationMessages, localizedText } from "./helpers";

async function findShowroomId(
  supabase: ReturnType<typeof createAdminClient>,
  idOrCode: string
): Promise<{ id?: string; error?: string }> {
  const value = idOrCode.trim();
  if (isUuid(value)) return { id: value };

  const { data, error } = await supabase
    .from("showrooms")
    .select("id")
    .ilike("code", value)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data?.id) return { error: "Showroom not found by code" };
  return { id: data.id };
}

export async function getAdminShowroomByIdOrCode(idOrCode: string): Promise<{
  success: boolean;
  data?: {
    id: string;
    code: string;
    name_vi: string;
    name_en: string;
    address_vi: string;
    address_en: string;
    opening_hours_vi: string;
    opening_hours_en: string;
    hotline: string;
    google_maps_embed_url: string;
    google_maps_fallback_url: string;
    latitude: number | null;
    longitude: number | null;
    status: "draft" | "published" | "archived";
    sort_order: number;
    province_code: string;
    province_name: string;
    ward_code: string;
    ward_name: string;
    street_address: string;
    cover_image: string;
  };
  error?: string;
}> {
  try {
    await requireEditorOrAdmin();
    const supabase = createAdminClient();
    const found = await findShowroomId(supabase, idOrCode);
    if (!found.id) return { success: false, error: found.error || "Showroom not found" };

    const { data: showroom, error } = await supabase
      .from("showrooms")
      .select(`
        id,
        code,
        hotline,
        google_maps_embed_url,
        google_maps_fallback_url,
        latitude,
        longitude,
        status,
        sort_order,
        province_code,
        province_name,
        ward_code,
        ward_name,
        street_address,
        showroom_translations (
          locale,
          name,
          address,
          opening_hours
        ),
        showroom_media (
          is_primary,
          media:media_assets (public_url)
        )
      `)
      .eq("id", found.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !showroom) return { success: false, error: error?.message || "Showroom not found" };

    const translations = Array.isArray(showroom.showroom_translations)
      ? showroom.showroom_translations
      : [];
    const viTrans = translations.find((translation) => translation.locale === "vi");
    const enTrans = translations.find((translation) => translation.locale === "en");
    const primaryMedia = Array.isArray(showroom.showroom_media)
      ? showroom.showroom_media.find((media) => media.is_primary)
      : null;
    const mediaRecord = primaryMedia?.media as Record<string, unknown> | null | undefined;

    return {
      success: true,
      data: {
        id: showroom.id,
        code: localizedText(showroom.code).toLowerCase(),
        name_vi: localizedText(viTrans?.name),
        name_en: localizedText(enTrans?.name),
        address_vi: localizedText(viTrans?.address),
        address_en: localizedText(enTrans?.address),
        opening_hours_vi: localizedText(viTrans?.opening_hours),
        opening_hours_en: localizedText(enTrans?.opening_hours),
        hotline: localizedText(showroom.hotline),
        google_maps_embed_url: localizedText(showroom.google_maps_embed_url),
        google_maps_fallback_url: localizedText(showroom.google_maps_fallback_url),
        latitude: showroom.latitude === null ? null : Number(showroom.latitude),
        longitude: showroom.longitude === null ? null : Number(showroom.longitude),
        status: showroom.status as "draft" | "published" | "archived",
        sort_order: Number(showroom.sort_order ?? 0),
        province_code: localizedText((showroom as any).province_code),
        province_name: localizedText((showroom as any).province_name),
        ward_code: localizedText((showroom as any).ward_code),
        ward_name: localizedText((showroom as any).ward_name),
        street_address: localizedText((showroom as any).street_address),
        cover_image: localizedText(mediaRecord?.public_url),
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Database error" };
  }
}

export async function createAdminShowroom(data: ShowroomInput): Promise<{ success: boolean; id?: string; error?: string }> {
  const user = await requireEditorOrAdmin();
  const validation = showroomSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validationMessages(validation.error.issues) };
  }

  const values = {
    ...validation.data,
    google_maps_embed_url: DOMPurify.sanitize(validation.data.google_maps_embed_url),
  };

  const supabase = createAdminClient();

  try {
    const initialStatus = values.status === "published" ? "draft" : values.status;
    const { data: showroom, error: showroomError } = await supabase
      .from("showrooms")
      .insert({
        code: values.code,
        hotline: values.hotline,
        google_maps_embed_url: values.google_maps_embed_url,
        google_maps_fallback_url: values.google_maps_fallback_url,
        latitude: values.latitude,
        longitude: values.longitude,
        status: initialStatus,
        sort_order: values.sort_order,
        province_code: values.province_code || null,
        province_name: values.province_name || null,
        ward_code: values.ward_code || null,
        ward_name: values.ward_name || null,
        street_address: values.street_address || null,
        created_by: user.id,
        updated_by: user.id,
        published_at: null,
        deleted_at: initialStatus === "archived" ? new Date().toISOString() : null,
      })
      .select("id")
      .single();

    if (showroomError || !showroom) {
      return { success: false, error: showroomError?.message || "Failed to create showroom" };
    }

    // Insert cover image into showroom_media
    const coverMediaId = await getOrCreateMediaAssetId(supabase, values.cover_image, user.id);
    if (coverMediaId) {
      const { error: mediaError } = await supabase
        .from("showroom_media")
        .insert({
          showroom_id: showroom.id,
          media_id: coverMediaId,
          is_primary: true,
          sort_order: 0,
        });
      if (mediaError) {
        await supabase.from("showrooms").delete().eq("id", showroom.id);
        return { success: false, error: mediaError.message };
      }
    }

    const translations = [
      {
        showroom_id: showroom.id,
        locale: "vi",
        name: values.name_vi,
        address: values.address_vi,
        opening_hours: values.opening_hours_vi,
      },
      {
        showroom_id: showroom.id,
        locale: "en",
        name: values.name_en || values.name_vi,
        address: values.address_en || values.address_vi,
        opening_hours: values.opening_hours_en || values.opening_hours_vi,
      },
    ];

    const { error: transError } = await supabase.from("showroom_translations").insert(translations);
    if (transError) {
      await supabase.from("showrooms").delete().eq("id", showroom.id);
      return { success: false, error: transError.message };
    }

    if (values.status === "published") {
      const { error: publishError } = await supabase
        .from("showrooms")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", showroom.id);

      if (publishError) {
        await supabase.from("showrooms").delete().eq("id", showroom.id);
        return { success: false, error: publishError.message };
      }
    }

    try {
      await writeAuditLog(supabase, {
        actorId: user.id,
        action: "create",
        entityType: "showroom",
        entityId: showroom.id,
        metadata: { name: values.name_vi, code: values.code },
      });
    } catch (auditError) {
      await supabase.from("showrooms").delete().eq("id", showroom.id);
      return { success: false, error: auditError instanceof Error ? auditError.message : "Audit logging failed" };
    }

    triggerRevalidation();
    return { success: true, id: showroom.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function updateAdminShowroom(id: string, data: ShowroomInput): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();
  const validation = showroomSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validationMessages(validation.error.issues) };
  }

  const values = {
    ...validation.data,
    google_maps_embed_url: DOMPurify.sanitize(validation.data.google_maps_embed_url),
  };

  try {
    const supabase = createAdminClient();

    // The admin Edit link passes the showroom code (?edit=<code>), but every write below
    // keys on the showroom UUID. Resolve code -> id so edits actually persist instead of
    // silently matching no row.
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      const { data: found } = await supabase
        .from("showrooms")
        .select("id")
        .eq("code", id)
        .maybeSingle();
      if (!found) {
        return { success: false, error: "Showroom not found" };
      }
      id = found.id;
    }

    const translations = [
      {
        showroom_id: id,
        locale: "vi",
        name: values.name_vi,
        address: values.address_vi,
        opening_hours: values.opening_hours_vi,
        updated_at: new Date().toISOString(),
      },
      {
        showroom_id: id,
        locale: "en",
        name: values.name_en || values.name_vi,
        address: values.address_en || values.address_vi,
        opening_hours: values.opening_hours_en || values.opening_hours_vi,
        updated_at: new Date().toISOString(),
      },
    ];

    const { error: transError } = await supabase
      .from("showroom_translations")
      .upsert(translations, { onConflict: "showroom_id,locale" });

    if (transError) return { success: false, error: transError.message };

    // Sync cover image for showroom_media
    const coverMediaId = await getOrCreateMediaAssetId(supabase, values.cover_image, user.id);
    if (coverMediaId) {
      await supabase
        .from("showroom_media")
        .delete()
        .eq("showroom_id", id);

      const { error: insertMediaError } = await supabase
        .from("showroom_media")
        .insert({
          showroom_id: id,
          media_id: coverMediaId,
          is_primary: true,
          sort_order: 0,
        });
      if (insertMediaError) return { success: false, error: insertMediaError.message };
    } else {
      await supabase
        .from("showroom_media")
        .delete()
        .eq("showroom_id", id);
    }

    const { error: showroomError } = await supabase
      .from("showrooms")
      .update({
        code: values.code,
        hotline: values.hotline,
        google_maps_embed_url: values.google_maps_embed_url,
        google_maps_fallback_url: values.google_maps_fallback_url,
        latitude: values.latitude,
        longitude: values.longitude,
        status: values.status,
        sort_order: values.sort_order,
        province_code: values.province_code || null,
        province_name: values.province_name || null,
        ward_code: values.ward_code || null,
        ward_name: values.ward_name || null,
        street_address: values.street_address || null,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
        // published_at is owned by the set_publish_timestamps trigger — don't re-stamp on edit.
        deleted_at: values.status === "archived" ? new Date().toISOString() : null,
      })
      .eq("id", id);

    if (showroomError) return { success: false, error: showroomError.message };

    await writeAuditLog(supabase, {
      actorId: user.id,
      action: values.status === "archived" ? "archive" : "update",
      entityType: "showroom",
      entityId: id,
      metadata: { name: values.name_vi, code: values.code },
    });

    triggerRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}

export async function deleteAdminShowroom(id: string): Promise<{ success: boolean; error?: string }> {
  const user = await requireEditorOrAdmin();

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("showrooms")
      .update({
        status: "archived",
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    await writeAuditLog(supabase, {
      actorId: user.id,
      action: "archive",
      entityType: "showroom",
      entityId: id,
    });

    triggerRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Internal server error" };
  }
}