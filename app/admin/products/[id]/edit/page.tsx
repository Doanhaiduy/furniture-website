import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/showroom/admin-shell";
import { ContentEditorForm } from "@/components/showroom/admin-workflows";
import { getCurrentUser } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
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
    <AdminShell active="products" role={role}>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold font-heading text-primary">Hiệu chỉnh sản phẩm</h1>
        <ContentEditorForm kind="product" mode="edit" idOrSlug={id} />
      </div>
    </AdminShell>
  );
}
