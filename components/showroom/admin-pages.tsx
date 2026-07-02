"use client";

export { AdminLoginPage, AccessDeniedPage } from "./admin-login";

export const adminSections = [
  "products",
  "categories",
  "brands",
  "promotions",
  "blog",
  "showrooms",
  "media",
  "quotes",
  "users",
  "settings",
] as const;

export type AdminSection = (typeof adminSections)[number];

// Re-export shared components for backward compatibility
export { Pagination, AdminPageHeader, getRelativeTimeString, type Brand } from "./admin-pages/SharedComponents";

// Re-export pages
export { AdminDashboard } from "./admin-pages/AdminDashboard";
export { ProductsPage } from "./admin-pages/ProductsPage";
export { BlogPage } from "./admin-pages/BlogPage";
export { CategoryPage } from "./admin-pages/CategoryPage";
export { BrandsPage } from "./admin-pages/BrandsPage";
export { ShowroomPage } from "./admin-pages/ShowroomPage";
export { QuotesPage } from "./admin-pages/QuotesPage";
export { MediaPage } from "./admin-pages/MediaPage";
export { SettingsPage } from "./admin-pages/SettingsPage";
export { UsersPage } from "./admin-pages/UsersPage";
export { PromotionsPage } from "./admin-pages/PromotionsPage";

import { AdminDashboard } from "./admin-pages/AdminDashboard";
import { ProductsPage } from "./admin-pages/ProductsPage";
import { BlogPage } from "./admin-pages/BlogPage";
import { CategoryPage } from "./admin-pages/CategoryPage";
import { BrandsPage } from "./admin-pages/BrandsPage";
import { ShowroomPage } from "./admin-pages/ShowroomPage";
import { QuotesPage } from "./admin-pages/QuotesPage";
import { MediaPage } from "./admin-pages/MediaPage";
import { SettingsPage } from "./admin-pages/SettingsPage";
import { UsersPage } from "./admin-pages/UsersPage";
import { PromotionsPage } from "./admin-pages/PromotionsPage";
import type { Brand } from "./admin-pages/SharedComponents";
import type {
  AdminQuote,
  AdminProduct,
  AdminCategory,
  AdminBlogPost,
  AdminShowroom,
  AdminPromotion,
  AdminUser,
} from "@/lib/supabase/admin-queries";

export function AdminSectionPage({
  section,
  role,
  createMode,
  uploadMode,
  products,
  productTotal = 0,
  categories,
  categoryTotal = 0,
  promotions,
  promotionTotal = 0,
  blogPosts,
  blogTotal = 0,
  showrooms,
  showroomTotal = 0,
  quotes,
  quoteTotal = 0,
  brands,
  brandTotal = 0,
  profiles,
  profileTotal = 0,
  searchParams = {},
}: {
  section: AdminSection;
  role?: string;
  createMode?: boolean;
  uploadMode?: boolean;
  products?: AdminProduct[];
  productTotal?: number;
  categories?: AdminCategory[];
  categoryTotal?: number;
  promotions?: AdminPromotion[];
  promotionTotal?: number;
  blogPosts?: AdminBlogPost[];
  blogTotal?: number;
  showrooms?: AdminShowroom[];
  showroomTotal?: number;
  quotes?: AdminQuote[];
  quoteTotal?: number;
  brands?: Brand[];
  brandTotal?: number;
  profiles?: AdminUser[];
  profileTotal?: number;
  searchParams?: Record<string, string | undefined>;
}) {
  if (section === "quotes") return <QuotesPage quotes={quotes ?? []} role={role} total={quoteTotal} />;
  if (section === "media") return <MediaPage uploadMode={uploadMode} />;
  if (section === "settings") return <SettingsPage />;
  if (section === "users") return <UsersPage createMode={createMode} profiles={profiles ?? []} total={profileTotal} />;
  if (section === "brands") return <BrandsPage createMode={createMode} brands={brands ?? []} total={brandTotal} />;
  if (section === "blog") return <BlogPage createMode={createMode} posts={blogPosts ?? []} total={blogTotal} />;
  if (section === "showrooms") return <ShowroomPage createMode={createMode} showrooms={showrooms ?? []} total={showroomTotal} />;
  if (section === "categories") return <CategoryPage createMode={createMode} categories={categories ?? []} total={categoryTotal} />;
  if (section === "promotions") return <PromotionsPage createMode={createMode} promotions={promotions ?? []} total={promotionTotal} />;
  return (
    <ProductsPage
      createMode={createMode}
      products={products ?? []}
      total={productTotal}
      categories={categories ?? []}
      brands={brands ?? []}
    />
  );
}
