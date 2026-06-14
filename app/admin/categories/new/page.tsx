import { AdminShell } from "@/components/showroom/admin-shell";
import { EntityCreateForm } from "@/components/showroom/admin-workflows";
import { getCurrentUser } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const role = user.role;

  return (
    <AdminShell active="categories" role={role}>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold font-heading text-primary">Thêm danh mục mới</h1>
        <EntityCreateForm kind="category" />
      </div>
    </AdminShell>
  );
}
