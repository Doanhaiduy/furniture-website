import { notFound } from "next/navigation";
import {
  AdminSectionPage,
  adminSections,
  type AdminSection,
} from "@/components/showroom/admin-pages";
import { AdminShell } from "@/components/showroom/admin-shell";

function isAdminSection(section: string): section is AdminSection {
  return adminSections.includes(section as AdminSection);
}

export default async function AdminDynamicPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const { section: rawSection } = await params;
  const query = await searchParams;
  const section = rawSection.trim();
  if (!isAdminSection(section)) notFound();

  return (
    <AdminShell active={section}>
      <AdminSectionPage section={section} createMode={query.new === "1"} />
    </AdminShell>
  );
}
