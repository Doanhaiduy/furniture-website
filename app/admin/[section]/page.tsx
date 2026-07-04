console.log("=== ADMIN DYNAMIC PAGE MODULE LOADED ===");
import { notFound, redirect } from "next/navigation";
import {
  AdminSectionPage,
} from "@/components/showroom/admin-pages";
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

/** Parse a positive integer from a URL param, fallback to defaultVal */
function parseIntParam(val: string | undefined, defaultVal: number): number {
  const n = parseInt(val ?? "", 10);
  return isNaN(n) || n < 1 ? defaultVal : n;
}

export default async function AdminDynamicPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
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

  // --- Parse common URL filter/pagination params ---
  const limit = parseIntParam(query.limit, 20);
  const page  = parseIntParam(query.page, 1);
  const offset = (page - 1) * limit;
  const q      = query.q ?? undefined;
  const status = query.status ?? undefined;
  const sort   = query.sort ?? undefined;
  const dir    = (query.dir as "asc" | "desc" | undefined) ?? undefined;
  const dateFrom = query.dateFrom ?? undefined;
  const dateTo   = query.dateTo ?? undefined;

  let products: AdminProduct[]  = [];
  let productTotal = 0;
  let categories: AdminCategory[] = [];
  let categoryTotal = 0;
  let blogPosts: AdminBlogPost[] = [];
  let blogTotal = 0;
  let showrooms: AdminShowroom[] = [];
  let showroomTotal = 0;
  let quotes: AdminQuote[]      = [];
  let quoteTotal = 0;
  let promotions: AdminPromotion[] = [];
  let promotionTotal = 0;
  let brands: Brand[]            = [];
  let brandTotal = 0;
  let profiles: AdminUser[]      = [];
  let profileTotal = 0;

  if (section === "quotes" && role === "admin") {
    const res = await getAdminQuotesList({
      status,
      keyword: q,
      dateFrom,
      dateTo,
      assignedTo: query.assignedTo,
      limit,
      offset,
      withTotal: true,
    });
    if (res && "data" in res) {
      quotes = res.data;
      quoteTotal = res.total;
    } else {
      quotes = res;
      quoteTotal = res.length;
    }
  } else if (section === "blog") {
    const res = await getAdminBlogPosts({
      q,
      status,
      categoryId: query.categoryId,
      featured: query.featured,
      sort,
      dir,
      limit,
      offset,
      dateFrom,
      dateTo,
      withTotal: true,
    });
    if ("data" in res) {
      blogPosts = res.data;
      blogTotal = res.total;
    } else {
      blogPosts = res;
      blogTotal = res.length;
    }
  } else if (section === "showrooms") {
    const res = await getAdminShowrooms({ q, status, sort, dir, limit, offset, dateFrom, dateTo, withTotal: true });
    if ("data" in res) {
      showrooms = res.data;
      showroomTotal = res.total;
    } else {
      showrooms = res;
      showroomTotal = res.length;
    }
  } else if (section === "categories") {
    const res = await getAdminCategories({
      q,
      status,
      groupKey: query.groupKey,
      sort,
      dir,
      limit,
      offset,
      dateFrom,
      dateTo,
      withTotal: true,
    });
    if ("data" in res) {
      categories = res.data;
      categoryTotal = res.total;
    } else {
      categories = res;
      categoryTotal = res.length;
    }
  } else if (section === "products") {
    const res = await getAdminProducts({
      q,
      status,
      categoryId: query.categoryId,
      brandId: query.brandId,
      featured: query.featured,
      sort,
      dir,
      limit,
      offset,
      dateFrom,
      dateTo,
      withTotal: true,
    });
    if ("data" in res) {
      products = res.data;
      productTotal = res.total;
    } else {
      products = res as AdminProduct[];
      productTotal = products.length;
    }
    // Fetch all categories and brands for the Excel template reference sheets
    const catsRes = await getAdminCategories({ limit: 1000 }).catch(() => ({ data: [] }));
    categories = "data" in catsRes ? catsRes.data : catsRes;
    const brandsRes = await getAdminBrands().catch(() => ({ data: [] }));
    brands = Array.isArray(brandsRes) ? brandsRes : brandsRes?.data || [];
  } else if (section === "promotions") {
    const res = await getAdminPromotions({ q, status, sort, dir, limit, offset, dateFrom, dateTo, withTotal: true });
    if ("data" in res) {
      promotions = res.data;
      promotionTotal = res.total;
    } else {
      promotions = res;
      promotionTotal = res.length;
    }
  } else if (section === "brands") {
    const res = await getAdminBrands({
      q,
      status,
      sort,
      dir,
      limit,
      offset,
      dateFrom,
      dateTo,
      withTotal: true,
    });
    if (res && !Array.isArray(res)) {
      brands = res.data;
      brandTotal = res.total;
    } else {
      brands = res || [];
      brandTotal = (res || []).length;
    }
  } else if (section === "users" && role === "admin") {
    const res = await getAdminUsers({
      q,
      role: query.role,
      isActive: query.isActive,
      sort,
      dir,
      limit,
      offset,
      dateFrom,
      dateTo,
      withTotal: true,
    });
    if ("data" in res) {
      profiles = res.data;
      profileTotal = res.total;
    } else {
      profiles = res;
      profileTotal = res.length;
    }
  }

  return (
      <AdminSectionPage
        section={section}
        role={role}
        createMode={query.create === "1" || query.new === "1"}
        uploadMode={query.upload === "1"}
        products={products}
        productTotal={productTotal}
        categories={categories}
        categoryTotal={categoryTotal}
        blogPosts={blogPosts}
        blogTotal={blogTotal}
        showrooms={showrooms}
        showroomTotal={showroomTotal}
        quotes={quotes}
        quoteTotal={quoteTotal}
        promotions={promotions}
        promotionTotal={promotionTotal}
        brands={brands}
        brandTotal={brandTotal}
        profiles={profiles}
        profileTotal={profileTotal}
        searchParams={query}
      />
  );
}
