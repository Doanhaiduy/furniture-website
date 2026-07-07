"use server";

import { createAdminClient } from "../server";
import { requireAdmin } from "../auth";

export type AdminUser = {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  full_name: string | null;
  created_at: string;
  last_login_at?: string | null;
};

export async function getAdminUsers(params: {
  q?: string;
  role?: string;
  isActive?: string;
  sort?: string;
  dir?: "asc" | "desc";
  limit?: number;
  offset?: number;
  dateFrom?: string;
  dateTo?: string;
  withTotal?: boolean;
} = {}): Promise<AdminUser[] | { data: AdminUser[]; total: number }> {
  // SECURITY: this is a "use server" action reachable as a public endpoint and it
  // reads all user PII via the service-role client (bypasses RLS). It MUST enforce
  // admin access itself — the page-level gate is not sufficient on its own.
  await requireAdmin();
  try {
    const supabase = await createAdminClient();
    let query = supabase
      .from("profiles")
      .select("id, email, role, is_active, full_name, created_at, last_login_at")
      .is("deleted_at", null);

    if (params.role && params.role !== "all") {
      query = query.eq("role", params.role);
    }
    if (params.isActive === "true") {
      query = query.eq("is_active", true);
    } else if (params.isActive === "false") {
      query = query.eq("is_active", false);
    }
    if (params.dateFrom) {
      query = query.gte("created_at", params.dateFrom);
    }
    if (params.dateTo) {
      query = query.lte("created_at", params.dateTo + "T23:59:59.999Z");
    }
    if (params.q) {
      query = query.or(`email.ilike.%${params.q}%,full_name.ilike.%${params.q}%`);
    }

    let total = 0;
    if (params.withTotal) {
      let countQ = supabase.from("profiles").select("*", { count: "exact", head: true }).is("deleted_at", null);
      if (params.role && params.role !== "all") countQ = countQ.eq("role", params.role);
      if (params.isActive === "true") countQ = countQ.eq("is_active", true);
      else if (params.isActive === "false") countQ = countQ.eq("is_active", false);
      if (params.dateFrom) countQ = countQ.gte("created_at", params.dateFrom);
      if (params.dateTo) countQ = countQ.lte("created_at", params.dateTo + "T23:59:59.999Z");
      if (params.q) {
        countQ = countQ.or(`email.ilike.%${params.q}%,full_name.ilike.%${params.q}%`);
      }
      const { count } = await countQ;
      total = count ?? 0;
    }

    const userSort = params.sort || "created_at";
    const userAsc = (params.dir ?? "desc") === "asc";
    if (params.limit) {
      query = query.order(userSort, { ascending: userAsc }).limit(params.limit).range(params.offset ?? 0, (params.offset ?? 0) + params.limit - 1);
    } else {
      query = query.order(userSort, { ascending: userAsc });
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching admin users from profiles table:", error);
      if (params.withTotal) return { data: [], total: 0 };
      return [];
    }

    const users = (data || []) as AdminUser[];

    if (params.withTotal) return { data: users, total };
    return users;
  } catch (err) {
    console.error("Exception fetching admin users:", err);
    if (params.withTotal) return { data: [], total: 0 };
    return [];
  }
}
