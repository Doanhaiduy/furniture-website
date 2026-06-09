import { notFound } from "next/navigation";
import {
  AdminSectionPage,
} from "@/components/showroom/admin-pages";
import { AdminShell } from "@/components/showroom/admin-shell";
import { getCurrentUser } from "@/lib/supabase/auth";
import {
  getAdminQuotesList,
  getAdminProducts,
  getAdminCategories,
  getAdminBlogPosts,
  getAdminShowrooms,
  type AdminQuote,
  type AdminProduct,
  type AdminCategory,
  type AdminBlogPost,
  type AdminShowroom,
} from "@/lib/supabase/admin-queries";

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

  const user = await getCurrentUser();
  const role = user?.role ?? "admin";

  let products: AdminProduct[] = [];
  let categories: AdminCategory[] = [];
  let blogPosts: AdminBlogPost[] = [];
  let showrooms: AdminShowroom[] = [];
  let quotes: AdminQuote[] = [];

  if (section === "quotes" && role === "admin") {
    quotes = await getAdminQuotesList({ limit: 50, offset: 0 });
  } else if (section === "blog") {
    blogPosts = await getAdminBlogPosts({ limit: 50, offset: 0 });
  } else if (section === "showrooms") {
    showrooms = await getAdminShowrooms();
  } else if (section === "categories") {
    categories = await getAdminCategories();
  } else if (section === "products") {
    products = await getAdminProducts({ limit: 50, offset: 0 });
  }

  return (
    <AdminShell active={section} role={role}>
      <AdminSectionPage
        section={section}
        role={role}
        createMode={query.create === "1" || query.new === "1"}
        uploadMode={query.upload === "1"}
        products={products}
        categories={categories}
        blogPosts={blogPosts}
        showrooms={showrooms}
        quotes={quotes}
      />
    </AdminShell>
  );
}
