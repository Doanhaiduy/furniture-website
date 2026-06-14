import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/showroom/admin-shell";
import { EntityCreateForm } from "@/components/showroom/admin-workflows";
import { getCurrentUser } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const role = user.role;

  return (
    <AdminShell active="categories" role={role}>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold font-heading text-primary">Hiệu chỉnh danh mục</h1>
        <EntityCreateForm kind="category" idOrSlug={id} />
      </div>
    </AdminShell>
  );
}
