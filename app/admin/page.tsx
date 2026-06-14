import { AdminDashboard } from "@/components/showroom/admin-pages";
import { AdminShell } from "@/components/showroom/admin-shell";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getAdminDashboardStats, getAdminQuotesList } from "@/lib/supabase/admin-queries";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const role = user.role;
  const stats = await getAdminDashboardStats(role);
  const quotes = role === "admin" ? await getAdminQuotesList({ limit: 5, offset: 0 }) : [];

  return (
    <AdminShell active="dashboard" role={role}>
      <AdminDashboard stats={stats} role={role} quotes={quotes} />
    </AdminShell>
  );
}
