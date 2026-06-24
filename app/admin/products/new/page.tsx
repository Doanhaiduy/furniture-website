import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  redirect("/admin/products?create=1");
}

