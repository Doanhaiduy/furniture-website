console.log("=== ADMIN DYNAMIC PAGE MODULE LOADED ===");
import { notFound, redirect } from "next/navigation";
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
  getAdminPromotions,
  getAdminUsers,
  type AdminQuote,
  type AdminProduct,
  type AdminCategory,
  type AdminBlogPost,
  type AdminShowroom,
  type AdminPromotion,
  type AdminUser,
} from "@/lib/supabase/admin-queries";
import { getAdminBrands } from "@/lib/supabase/brands-mutations";
import { type Brand } from "@/components/showroom/admin-pages";

const adminSections = [
  "products",
  "categories",
  "brands",
  "promotions",
  "blog",
  "showrooms",
  "quotes",
  "users",
  "settings",
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
  console.log("ADMIN DYNAMIC PAGE COMPILING: section =", section, "isAdmin =", isAdminSection(section));
  if (!isAdminSection(section)) {
    console.log("ADMIN DYNAMIC PAGE 404: Not a valid admin section:", section);
    notFound();
  }

  const user = await getCurrentUser();
  console.log("ADMIN DYNAMIC PAGE USER:", user?.email, "role =", user?.role);
  if (!user) {
    console.log("ADMIN DYNAMIC PAGE REDIRECT to login: User is null");
    redirect("/admin/login");
  }

  if (user.role !== "admin" && user.role !== "editor") {
    redirect("/admin/access-denied");
  }

  if (user.role === "editor") {
    const isAdminOnly = ["quotes", "users", "settings"].includes(section);
    if (isAdminOnly) {
      redirect("/admin/access-denied");
    }
  }

  const role = user.role;

  let products: AdminProduct[] = [];
  let categories: AdminCategory[] = [];
  let blogPosts: AdminBlogPost[] = [];
  let showrooms: AdminShowroom[] = [];
  let quotes: AdminQuote[] = [];
  let promotions: AdminPromotion[] = [];
  let brands: Brand[] = [];
  let profiles: AdminUser[] = [];

  if (section === "quotes" && role === "admin") {
    quotes = await getAdminQuotesList({ limit: 1000, offset: 0 });
  } else if (section === "blog") {
    blogPosts = await getAdminBlogPosts({ limit: 1000, offset: 0 });
  } else if (section === "showrooms") {
    showrooms = await getAdminShowrooms();
  } else if (section === "categories") {
    categories = await getAdminCategories();
  } else if (section === "products") {
    products = await getAdminProducts({ limit: 1000, offset: 0 });
  } else if (section === "promotions") {
    promotions = await getAdminPromotions();
  } else if (section === "brands") {
    brands = await getAdminBrands();
  } else if (section === "users" && role === "admin") {
    profiles = await getAdminUsers();
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
        promotions={promotions}
        brands={brands}
        profiles={profiles}
      />
    </AdminShell>
  );
}

