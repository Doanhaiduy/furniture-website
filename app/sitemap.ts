import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { getProducts, getBlogPosts } from "@/lib/supabase/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://phuongdong.example";
  const staticRoutes = ["", "/about", "/products", "/blog", "/showrooms", "/contact"];
  const now = new Date();

  // Fetch published products and blog posts from DB for sitemap
  const supabase = await createClient();
  const dbProducts = await getProducts(supabase, { limit: 1000 }).catch(() => []);
  const dbBlogPosts = await getBlogPosts(supabase, { limit: 1000 }).catch(() => []);

  const locales = routing.locales;

  const baseRoutes = locales.flatMap((locale) =>
    staticRoutes.map((path) => ({
      url: `${siteUrl}/${locale}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    }))
  );

  const productRoutes = locales.flatMap((locale) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dbProducts.map((product: any) => ({
      url: `${siteUrl}/${locale}/products/${product.slug}`,
      lastModified: product.published_at ? new Date(product.published_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  );

  const blogRoutes = locales.flatMap((locale) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dbBlogPosts.map((post: any) => ({
      url: `${siteUrl}/${locale}/blog/${post.slug}`,
      lastModified: post.published_at ? new Date(post.published_at) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  );

  return [...baseRoutes, ...productRoutes, ...blogRoutes];
}
