"use server";

import { createClient } from "../server";

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
    const supabase = await createClient();
    const [{ count: productCount }, { count: categoryCount }, { count: blogCount }, { count: showroomCount }] =
      await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("product_categories").select("*", { count: "exact", head: true }),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }),
        supabase.from("showrooms").select("*", { count: "exact", head: true }),
      ]);

    const isAdmin = role === "admin";
    const [{ count: quoteCount }, { count: userCount }] = isAdmin
      ? await Promise.all([
          supabase.from("quote_requests").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
        ])
      : [{ count: 0 } as const, { count: 0 } as const];

    if (productCount !== null) {
      return {
        productCount: productCount ?? 0,
        categoryCount: categoryCount ?? 0,
        blogCount: blogCount ?? 0,
        showroomCount: showroomCount ?? 0,
        quoteCount: quoteCount ?? 0,
        userCount: userCount ?? 0,
      };
    }
  } catch (e) {
    console.warn("Exception fetching admin dashboard stats, falling back to mock:", e);
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
