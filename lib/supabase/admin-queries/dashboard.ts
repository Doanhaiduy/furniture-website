"use server";

import { createAdminClient } from "../server";

export type AdminDashboardStats = {
  productCount: number;
  categoryCount: number;
  blogCount: number;
  showroomCount: number;
  quoteCount: number;
  userCount: number;
};

export async function getAdminDashboardStats(role: string): Promise<AdminDashboardStats> {
  try {
    const supabase = createAdminClient();
    const [
      { count: productCount },
      { count: categoryCount },
      { count: blogCount },
      { count: showroomCount }
    ] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("product_categories").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("blog_posts").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("showrooms").select("*", { count: "exact", head: true }).is("deleted_at", null),
    ]);

    const isAdmin = role === "admin";
    const [{ count: quoteCount }, { count: userCount }] = isAdmin
      ? await Promise.all([
          supabase.from("quote_requests").select("*", { count: "exact", head: true }).is("deleted_at", null),
          supabase.from("profiles").select("*", { count: "exact", head: true }).is("deleted_at", null),
        ])
      : [{ count: 0 } as const, { count: 0 } as const];

    return {
      productCount: productCount ?? 0,
      categoryCount: categoryCount ?? 0,
      blogCount: blogCount ?? 0,
      showroomCount: showroomCount ?? 0,
      quoteCount: quoteCount ?? 0,
      userCount: userCount ?? 0,
    };
  } catch (e) {
    console.warn("Exception fetching admin dashboard stats:", e);
  }

  return {
    productCount: 0,
    categoryCount: 0,
    blogCount: 0,
    showroomCount: 0,
    quoteCount: 0,
    userCount: 0,
  };
}
