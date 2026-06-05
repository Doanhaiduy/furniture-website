import { AdminDashboard } from "@/components/showroom/admin-pages";
import { AdminShell } from "@/components/showroom/admin-shell";

export default function AdminHomePage() {
  return (
    <AdminShell active="dashboard">
      <AdminDashboard />
    </AdminShell>
  );
}
