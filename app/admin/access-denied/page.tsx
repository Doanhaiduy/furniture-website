import { AccessDeniedPage } from "@/components/showroom/admin-pages";
import { getCurrentUser } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";

export default async function AdminAccessDeniedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return <AccessDeniedPage />;
}

export const dynamic = "force-dynamic";
