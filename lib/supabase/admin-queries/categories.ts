/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createAdminClient } from "../server";
import { resolveTranslationMatchIds } from "../search-helpers";

export type AdminCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  status: string;
  sort_order: number;
  parent_id: string | null;
  product_count: number;
  parent_name?: string | null;
  group_key?: string | null;
  image_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export async function getAdminCategories(params: {
  q?: string;
  status?: string;
  groupKey?: string;
  sort?: string;
  dir?: "asc" | "desc";
  limit?: number;
  offset?: number;
  dateFrom?: string;
  dateTo?: string;
  withTotal?: boolean;
  level?: string;
} = {}): Promise<AdminCategory[] | { data: AdminCategory[]; total: number }> {
    try {
      const supabase = createAdminClient();
      let selectStr = `
        id,
        status,
        sort_order,
        parent_id,
        group_key,
        created_at,
        updated_at
      `;
      selectStr += `, product_category_translations (locale, slug, name, description)`;
      selectStr += `, image_media:media_assets!fk_product_categories_image_media (public_url)`;

      // Free-text search: both name and slug live on the translation table (slug is NOT
      // a column on product_categories), so resolve matching category ids there and filter
      // parents by id. (Dotted embedded refs inside .or() do not parse in PostgREST —
      // see lib/supabase/search-helpers.ts.)
      let searchIds: string[] | null = null;
      if (params.q) {
        searchIds = await resolveTranslationMatchIds(
          supabase, "product_category_translations", "category_id", ["name", "slug"], params.q,
        );
      }

      let query = supabase
        .from("product_categories")
        .select(selectStr)
        .is("deleted_at", null);

      if (params.status && params.status !== "all") {
        query = query.eq("status", params.status);
      }
      if (params.groupKey && params.groupKey !== "all") {
        query = query.eq("group_key", params.groupKey);
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
      if (params.level === "parent") {
        query = query.is("parent_id", null);
      } else if (params.level === "child") {
        query = query.not("parent_id", "is", null);
      }

      let total = 0;
      if (params.withTotal) {
        let countQ = supabase
          .from("product_categories")
          .select("id", { count: "exact", head: true })
          .is("deleted_at", null);
        if (params.status && params.status !== "all") countQ = countQ.eq("status", params.status);
        if (params.groupKey && params.groupKey !== "all") countQ = countQ.eq("group_key", params.groupKey);
        if (params.dateFrom) countQ = countQ.gte("created_at", params.dateFrom);
        if (params.dateTo) countQ = countQ.lte("created_at", params.dateTo + "T23:59:59.999Z");
        if (searchIds) {
          countQ = countQ.in("id", searchIds);
        }
        if (params.level === "parent") {
          countQ = countQ.is("parent_id", null);
        } else if (params.level === "child") {
          countQ = countQ.not("parent_id", "is", null);
        }
        const { count } = await countQ;
        total = count ?? 0;
      }

      const sortField = params.sort || "sort_order";
      const ascending = (params.dir ?? "asc") === "asc";
      const validDbFields = ["group_key", "status", "sort_order", "created_at"];
      const dbSortField = validDbFields.includes(sortField) ? sortField : "sort_order";

      if (params.limit) {
        query = query
          .order(dbSortField, { ascending })
          .order("created_at", { ascending: true })
          .limit(params.limit)
          .range(params.offset ?? 0, (params.offset ?? 0) + params.limit - 1);
      } else {
        query = query
          .order(dbSortField, { ascending })
          .order("created_at", { ascending: true });
      }

      const { data, error } = await query as { data: any[] | null, error: any };

      if (!error && data) {
        // Fetch product counts per category in one query
        const { data: countData } = await supabase
          .from("products")
          .select("category_id")
          .is("deleted_at", null);
        const productCountMap: Record<string, number> = {};
        if (countData) {
          countData.forEach((p: any) => {
            if (p.category_id) {
              productCountMap[p.category_id] = (productCountMap[p.category_id] || 0) + 1;
            }
          });
        }

        // Fetch parent names
        const categoryMap: Record<string, string> = {};
        // First map current items
        data.forEach((row) => {
          const translations = Array.isArray(row.product_category_translations)
            ? row.product_category_translations
            : row.product_category_translations
            ? [row.product_category_translations]
            : [];
          const translation = translations.find((t: any) => t?.locale === "vi") || translations[0];
          categoryMap[row.id] = translation?.name ?? "";
        });

        // Query missing parents if any
        const parentIds = data.map(r => r.parent_id).filter((pid): pid is string => Boolean(pid) && !categoryMap[pid]);
        if (parentIds.length > 0) {
          const { data: parentData } = await supabase
            .from("product_categories")
            .select("id, product_category_translations(locale, name)")
            .in("id", parentIds);
          if (parentData) {
            parentData.forEach((pRow: any) => {
              const trans = Array.isArray(pRow.product_category_translations) ? pRow.product_category_translations : [];
              const viTrans = trans.find((t: any) => t.locale === "vi") || trans[0];
              categoryMap[pRow.id] = viTrans?.name ?? "";
            });
          }
        }

        const mapRow = (row: any) => {
          const translations = Array.isArray(row.product_category_translations)
            ? row.product_category_translations
            : row.product_category_translations
            ? [row.product_category_translations]
            : [];
          const translation = translations.find((t: any) => t?.locale === "vi") || translations[0];
          const slugVal = translation?.slug ?? "";
          return {
            id: row.id as string,
            slug: slugVal,
            name: translation?.name ?? slugVal,
            description: translation?.description ?? null,
            status: row.status as string,
            sort_order: row.sort_order,
            parent_id: row.parent_id ?? null,
            group_key: (row as any).group_key ?? null,
            product_count: productCountMap[row.id] || 0,
            parent_name: row.parent_id ? (categoryMap[row.parent_id] || null) : null,
            image_url: (row as any).image_media?.public_url ?? null,
            created_at: (row as any).created_at ?? null,
            updated_at: (row as any).updated_at ?? null,
          } as any;
        };

        const mapped = data.map(mapRow);

        // Drop rows with no usable translation at all (blank name AND slug). A real
        // category always has at least a Vietnamese translation, so these are broken
        // leftover rows from failed creates — they must not render as empty categories.
        const cleaned = mapped.filter(
          (c: any) => (c.name && String(c.name).trim()) || (c.slug && String(c.slug).trim())
        );

        // Guarantee the parent GROUP of every returned child is present. The admin
        // tree attaches children to their group purely by parent_id, so if a filter
        // (status/group), pagination, or the translation cleanup above dropped the
        // parent row, its children would wrongly fall into "Danh mục chưa gán nhóm".
        // Re-fetch and merge any missing parents (regardless of status) to prevent that.
        const presentIds = new Set<string>(cleaned.map((c: any) => c.id));
        const missingParentIds = Array.from(
          new Set(
            cleaned
              .map((c: any) => c.parent_id)
              .filter((pid: any): pid is string => Boolean(pid) && !presentIds.has(pid))
          )
        );
        if (missingParentIds.length > 0) {
          const { data: parentRows } = await supabase
            .from("product_categories")
            .select(selectStr)
            .in("id", missingParentIds)
            .is("deleted_at", null);
          if (parentRows && parentRows.length > 0) {
            parentRows.forEach((row: any) => {
              const trans = Array.isArray(row.product_category_translations) ? row.product_category_translations : [];
              const viTrans = trans.find((t: any) => t?.locale === "vi") || trans[0];
              categoryMap[row.id] = viTrans?.name ?? categoryMap[row.id] ?? "";
            });
            cleaned.unshift(...parentRows.map(mapRow));
          }
        }

        // In-memory sorting for non-DB columns
        if (!validDbFields.includes(sortField)) {
          if (sortField === "name") {
            cleaned.sort((a: any, b: any) => {
              const aVal = a.name || "";
              const bVal = b.name || "";
              return ascending ? aVal.localeCompare(bVal, "vi") : bVal.localeCompare(aVal, "vi");
            });
          } else if (sortField === "product_count") {
            cleaned.sort((a: any, b: any) => {
              return ascending ? a.product_count - b.product_count : b.product_count - a.product_count;
            });
          }
        }

        if (params.withTotal) return { data: cleaned, total };
        return cleaned;
      }
    } catch (e) {
      console.warn("Exception fetching admin categories, falling back to mock:", e);
    }

  if (params.withTotal) return { data: [], total: 0 };
  return [];
}