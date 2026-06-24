import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  redirect(`/admin/categories?edit=${id}`);
}

