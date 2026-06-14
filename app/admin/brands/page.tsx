import { AdminShell } from "@/components/showroom/admin-shell";
import { BrandsAdmin } from "@/components/admin/brands-admin";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getAdminBrands } from "@/lib/supabase/brands-mutations";

interface Brand {
  id: string;
  name: { vi: string; en: string };
  origin?: string;
  logo_url?: string;
  status: "draft" | "published" | "archived";
  sort_order: number;
}

export default async function BrandsPage() {
  const user = await getCurrentUser();
  const role = user?.role ?? "admin";
  const brands = await getAdminBrands();

  return (
    <AdminShell active="brands" role={role}>
      <BrandsAdmin initialBrands={brands} />
    </AdminShell>
  );
}
