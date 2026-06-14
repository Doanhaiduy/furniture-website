import { AdminShell } from "@/components/showroom/admin-shell";
import { AdminSectionPage } from "@/components/showroom/admin-pages";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getAdminBrands } from "@/lib/supabase/brands-mutations";

export default async function BrandsPage() {
  const user = await getCurrentUser();
  const role = user?.role ?? "admin";
  const brands = await getAdminBrands();

  return (
    <AdminShell active="brands" role={role}>
      <AdminSectionPage section="brands" role={role} brands={brands} />
    </AdminShell>
  );
}
