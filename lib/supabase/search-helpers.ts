/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Admin free-text search helper.
 *
 * Root cause this works around (reproduced, PGRST100):
 *   PostgREST cannot reference an embedded resource's column with dotted notation
 *   inside a top-level `.or()` logic tree. A filter like
 *     .or("reference_code.ilike.%q%,product_translations.name.ilike.%q%")
 *   fails to parse ("failed to parse logic tree ...") — so the query errors and the
 *   admin list silently falls back to empty results. This is independent of the
 *   search term (an ASCII token fails identically), i.e. it is a query-shape bug.
 *
 * Fix: resolve the matching foreign-key ids from the *translation* table first
 * (where the searched columns are real, top-level columns), then OR those ids into
 * the parent query by primary key. See buildTranslationSearchOr().
 */
import type { SupabaseClient } from "@supabase/supabase-js";

/** Escape PostgREST reserved characters in an ilike value so a stray comma or
 *  parenthesis in the user's query can't corrupt the logic tree. */
function escapeIlike(value: string): string {
  // Wrap in double quotes and escape embedded quotes/backslashes — PostgREST treats
  // a double-quoted value as a literal, so commas/parens inside are safe.
  return `"${value.replace(/["\\]/g, (m) => "\\" + m)}"`;
}

/**
 * Return the distinct foreign-key ids of translation rows whose searched columns
 * match the query. Uses `.ilike` for a single column (no logic tree needed) and a
 * value-escaped `.or` for multiple columns.
 */
export async function resolveTranslationMatchIds(
  supabase: SupabaseClient,
  table: string,
  fkColumn: string,
  columns: string[],
  q: string,
): Promise<string[]> {
  let sub: any = supabase.from(table).select(fkColumn);
  if (columns.length === 1) {
    sub = sub.ilike(columns[0], `%${q}%`);
  } else {
    sub = sub.or(columns.map((c) => `${c}.ilike.${escapeIlike(`%${q}%`)}`).join(","));
  }
  const { data, error } = await sub;
  if (error || !data) return [];
  return [...new Set((data as any[]).map((r) => r[fkColumn]).filter(Boolean))];
}

/**
 * Build the `.or(...)` argument for a parent query that searches an optional parent
 * column plus a set of pre-resolved translation ids. Returns null when there is
 * nothing to match (no parent column and no ids) so the caller can force an empty
 * result set deterministically.
 */
export function buildTranslationSearchOr(
  parentColumn: string | null,
  q: string,
  matchIds: string[],
): string | null {
  const parts: string[] = [];
  if (parentColumn) parts.push(`${parentColumn}.ilike.${escapeIlike(`%${q}%`)}`);
  if (matchIds.length) parts.push(`id.in.(${matchIds.join(",")})`);
  if (parts.length === 0) return null;
  return parts.join(",");
}
