import { AdminShell } from "@/components/showroom/admin-shell";
import { AdminSectionPage } from "@/components/showroom/admin-pages";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getAdminBrands } from "@/lib/supabase/brands-mutations";
import { redirect } from "next/navigation";

export default async function BrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string; new?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }
  const role = user.role;
  const brandsResult = await getAdminBrands();
  const brands = Array.isArray(brandsResult) ? brandsResult : brandsResult?.data || [];
  const query = await searchParams;

  return (
    <AdminShell active="brands" role={role}>
      <AdminSectionPage
        section="brands"
        role={role}
        brands={brands}
        createMode={query.create === "1" || query.new === "1"}
      />
    </AdminShell>
  );
}
