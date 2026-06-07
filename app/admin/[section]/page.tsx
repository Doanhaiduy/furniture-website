import { notFound } from "next/navigation";
import {
  AdminSectionPage,
} from "@/components/showroom/admin-pages";
import { AdminShell } from "@/components/showroom/admin-shell";

const adminSections = [
  "products",
  "categories",
  "blog",
  "showrooms",
  "media",
  "quotes",
  "users",
  "settings",
  "ai-assistant",
] as const;

type AdminSection = typeof adminSections[number];

function isAdminSection(section: string): section is AdminSection {
  return (adminSections as readonly string[]).includes(section);
}

export default async function AdminDynamicPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ create?: string; new?: string; upload?: string }>;
}) {
  const { section: rawSection } = await params;
  const query = await searchParams;
  const section = rawSection.trim();
  if (!isAdminSection(section)) notFound();

  return (
    <AdminShell active={section}>
      <AdminSectionPage section={section} createMode={query.create === "1" || query.new === "1"} uploadMode={query.upload === "1"} />
    </AdminShell>
  );
}
