import { AccessDeniedPage } from "@/components/showroom/admin-pages";
import { AdminShell } from "@/components/showroom/admin-shell";

export default function AdminAccessDeniedPage() {
  return (
    <AdminShell active="quotes">
      <AccessDeniedPage />
    </AdminShell>
  );
}
