import { AdminDashboard } from "@/components/showroom/admin-pages";
import { getCurrentUser } from "@/lib/supabase/auth";
import {
  getAdminDashboardStats,
  getAdminQuotesList,
  getAdminCategoryDistribution,
  getAdminFeaturedProducts,
  getAdminRecentActivities,
} from "@/lib/supabase/admin-queries";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const role = user.role;
  const [stats, quotesResult, categoryDistribution, featuredProducts, recentActivities] =
    await Promise.all([
      getAdminDashboardStats(role),
      role === "admin" ? getAdminQuotesList({ limit: 10, offset: 0 }) : [],
      getAdminCategoryDistribution(),
      getAdminFeaturedProducts(5),
      getAdminRecentActivities(6),
    ]);

  const quotes = Array.isArray(quotesResult) ? quotesResult : quotesResult?.data || [];

  return (
    <AdminDashboard
      stats={stats}
      role={role}
      quotes={quotes}
      categoryDistribution={categoryDistribution}
      featuredProducts={featuredProducts}
      recentActivities={recentActivities}
    />
  );
}

