import { AdminDashboard } from "@/components/showroom/admin-pages";
import { AdminShell } from "@/components/showroom/admin-shell";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getAdminDashboardStats, getAdminQuotesList } from "@/lib/supabase/admin-queries";

export default async function AdminHomePage() {
  const user = await getCurrentUser();
  const role = user?.role ?? "admin";
  const stats = await getAdminDashboardStats(role);
  const quotes = role === "admin" ? await getAdminQuotesList({ limit: 5, offset: 0 }) : [];

  return (
    <AdminShell active="dashboard" role={user?.role}>
      <AdminDashboard stats={stats} role={user?.role} quotes={quotes} />
    </AdminShell>
  );
}
