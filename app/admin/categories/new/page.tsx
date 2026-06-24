import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  redirect("/admin/categories?create=1");
}

