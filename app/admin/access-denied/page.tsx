import { AccessDeniedPage } from "@/components/showroom/admin-pages";
import { AdminShell } from "@/components/showroom/admin-shell";
import { getCurrentUser } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";

export default async function AdminAccessDeniedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return (
    <AdminShell active="quotes" role={user.role}>
      <AccessDeniedPage />
    </AdminShell>
  );
}

export const dynamic = "force-dynamic";
