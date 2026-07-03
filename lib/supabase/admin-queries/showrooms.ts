/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "../server";
import { resolveTranslationMatchIds } from "../search-helpers";

interface RawMediaAsset {
  public_url: string;
}

export type AdminShowroom = {
  id: string;
  code: string | null;
  name: string;
  address: string;
  opening_hours: string | null;
  hotline: string;
  google_maps_embed_url: string;
  google_maps_fallback_url: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
  sort_order: number;
  primary_media: unknown;
};

export async function getAdminShowrooms(params: {
  q?: string;
  status?: string;
  sort?: string;
  dir?: "asc" | "desc";
  limit?: number;
  offset?: number;
  dateFrom?: string;
  dateTo?: string;
  withTotal?: boolean;
} = {}): Promise<AdminShowroom[] | { data: AdminShowroom[]; total: number }> {
  try {
    const supabase = await createClient();
    let selectStr = `
      id,
      code,
      hotline,
      google_maps_embed_url,
      google_maps_fallback_url,
      latitude,
      longitude,
      status,
      sort_order,
      showroom_media (media_id, is_primary, media:media_assets (public_url))
    `;
    selectStr += `, showroom_translations (locale, name, address, opening_hours)`;

    // Free-text search: both searched columns live on the translation table, so resolve
    // matching showroom ids there, then filter parents by id. (Dotted embedded refs
    // inside .or() do not parse in PostgREST — see lib/supabase/search-helpers.ts.)
    let searchIds: string[] | null = null;
    if (params.q) {
      searchIds = await resolveTranslationMatchIds(
        supabase, "showroom_translations", "showroom_id", ["name", "address"], params.q,
      );
    }

    let query = supabase
      .from("showrooms")
      .select(selectStr)
      .is("deleted_at", null);

    if (params.status && params.status !== "all") {
      query = query.eq("status", params.status);
    }
    if (params.dateFrom) {
      query = query.gte("created_at", params.dateFrom);
    }
    if (params.dateTo) {
      query = query.lte("created_at", params.dateTo + "T23:59:59.999Z");
    }
    if (searchIds) {
      query = query.in("id", searchIds);
    }

    let srTotal = 0;
    if (params.withTotal) {
      let countQ = supabase
        .from("showrooms")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null);
      if (params.status && params.status !== "all") countQ = countQ.eq("status", params.status);
      if (params.dateFrom) countQ = countQ.gte("created_at", params.dateFrom);
      if (params.dateTo) countQ = countQ.lte("created_at", params.dateTo + "T23:59:59.999Z");
      if (searchIds) {
        countQ = countQ.in("id", searchIds);
      }
      const { count } = await countQ;
      srTotal = count ?? 0;
    }

    const srSort = params.sort || "sort_order";
    const srAsc = (params.dir ?? "asc") === "asc";
    if (params.limit) {
      query = query.order(srSort, { ascending: srAsc }).limit(params.limit).range(params.offset ?? 0, (params.offset ?? 0) + params.limit - 1);
    } else {
      query = query.order(srSort, { ascending: srAsc });
    }

    const { data, error } = await query as { data: any[] | null, error: any };
    if (!error && data) {
      const mapped = data.map((row) => {
        const translations = Array.isArray(row.showroom_translations)
          ? row.showroom_translations
          : row.showroom_translations
          ? [row.showroom_translations]
          : [];
        const translation = translations.find((t: any) => t?.locale === "vi") || translations[0];
        const primaryMedia = Array.isArray(row.showroom_media)
          ? row.showroom_media.find((m: { is_primary: boolean }) => m.is_primary)
          : null;
        const mediaAsset = primaryMedia?.media as unknown as RawMediaAsset;
        return {
          id: row.id,
          code: row.code ?? null,
          name: translation?.name ?? "",
          address: translation?.address ?? "",
          opening_hours: translation?.opening_hours ?? null,
          hotline: row.hotline,
          google_maps_embed_url: row.google_maps_embed_url,
          google_maps_fallback_url: row.google_maps_fallback_url,
          latitude: row.latitude,
          longitude: row.longitude,
          status: row.status as string,
          sort_order: row.sort_order,
          primary_media: mediaAsset?.public_url ?? null,
        } as AdminShowroom;
      });

      if (params.withTotal) return { data: mapped, total: srTotal };
      return mapped;
    }
  } catch (e) {
    console.warn("Exception fetching admin showrooms, falling back to mock:", e);
  }

  if (params.withTotal) return { data: [], total: 0 };
  return [];
}
