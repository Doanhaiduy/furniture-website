/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient, createAdminClient } from "../server";
import { requireEditorOrAdmin } from "../auth";

export type AdminQuote = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  company: string | null;
  service: string | null;
  message: string;
  preferred_locale: string;
  product_id: string | null;
  category_id: string | null;
  source_path: string;
  source_url: string | null;
  status: string;
  assigned_to: string | null;
  admin_notes: string | null;
  sales_notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  assignee?: { id: string; full_name: string; email: string } | null;
};

export type QuoteStatusLog = {
  id: string;
  quote_id: string;
  from_status: string | null;
  to_status: string;
  changed_by_name: string;
  note: string | null;
  created_at: string;
};

export async function getAdminQuotesList(params: {
  status?: string;
  keyword?: string;
  dateFrom?: string;
  dateTo?: string;
  assignedTo?: string;
  limit?: number;
  offset?: number;
  withTotal?: boolean;
  sort?: string;
  dir?: "asc" | "desc";
}): Promise<AdminQuote[] | { data: AdminQuote[]; total: number }> {
    try {
      const supabase = await createAdminClient();
      let query = supabase
        .from("quote_requests")
        .select(`
          id,
          full_name,
          phone,
          email,
          company,
          service,
          message,
          preferred_locale,
          product_id,
          category_id,
          source_path,
          source_url,
          status,
          assigned_to,
          admin_notes,
          sales_notes,
          created_at,
          updated_at,
          deleted_at,
          assignee:profiles!assigned_to (
            id,
            full_name,
            email
          )
        `)
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
      if (params.assignedTo && params.assignedTo !== "all") {
        if (params.assignedTo === "null" || params.assignedTo === "unassigned") {
          query = query.is("assigned_to", null);
        } else {
          query = query.eq("assigned_to", params.assignedTo);
        }
      }
      if (params.keyword) {
        query = query.or(`full_name.ilike.%${params.keyword}%,phone.ilike.%${params.keyword}%,email.ilike.%${params.keyword}%,service.ilike.%${params.keyword}%,company.ilike.%${params.keyword}%,message.ilike.%${params.keyword}%,admin_notes.ilike.%${params.keyword}%,sales_notes.ilike.%${params.keyword}%`);
      }

      // Sort
      const sortField = params.sort || "created_at";
      const ascending = (params.dir ?? "desc") === "asc";
      query = query
        .order(sortField, { ascending })
        .range(params.offset ?? 0, (params.offset ?? 0) + (params.limit ?? 20) - 1);

      const { data, error } = await query;
      const quotes = (!error && data) ? (data as unknown as AdminQuote[]) : [];

      if (params.withTotal) {
        let countQ = supabase
          .from("quote_requests")
          .select("id", { count: "exact", head: true })
          .is("deleted_at", null);
        if (params.status && params.status !== "all") {
          countQ = countQ.eq("status", params.status);
        }
        if (params.dateFrom) {
          countQ = countQ.gte("created_at", params.dateFrom);
        }
        if (params.dateTo) {
          countQ = countQ.lte("created_at", params.dateTo + "T23:59:59.999Z");
        }
        if (params.assignedTo && params.assignedTo !== "all") {
          if (params.assignedTo === "null" || params.assignedTo === "unassigned") {
            countQ = countQ.is("assigned_to", null);
          } else {
            countQ = countQ.eq("assigned_to", params.assignedTo);
          }
        }
        if (params.keyword) {
          countQ = countQ.or(`full_name.ilike.%${params.keyword}%,phone.ilike.%${params.keyword}%,email.ilike.%${params.keyword}%,service.ilike.%${params.keyword}%,company.ilike.%${params.keyword}%,message.ilike.%${params.keyword}%,admin_notes.ilike.%${params.keyword}%,sales_notes.ilike.%${params.keyword}%`);
        }
        const { count } = await countQ;
        return { data: quotes, total: count ?? 0 };
      }

      return quotes;
    } catch (e) {
      console.warn("Exception fetching admin quotes list, falling back to mock:", e);
      if (params.withTotal) return { data: [], total: 0 };
      return [];
    }
}

export async function updateQuoteStatus(
  quoteId: string,
  newStatus: string,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireEditorOrAdmin();
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("update_quote_status", {
      p_quote_id: quoteId,
      p_new_status: newStatus,
      p_note: note ?? null,
    });

    if (error) {
      console.error("Error updating quote status:", error);
      return { success: false, error: error.message };
    }

    const result = data as { success: boolean; error?: string };
    return result;
  } catch (err) {
    console.error("Exception updating quote status:", err);
    return { success: false, error: String(err) };
  }
}

export async function getQuoteStatusLogs(quoteId: string): Promise<QuoteStatusLog[]> {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase.rpc("get_quote_status_logs", {
      p_quote_id: quoteId,
    });

    if (error) {
      console.error("Error fetching quote status logs:", error);
      return [];
    }

    return (data || []) as QuoteStatusLog[];
  } catch (err) {
    console.error("Exception fetching quote status logs:", err);
    return [];
  }
}
