import type { MetadataRoute } from "next";
import { blogPosts, products } from "@/lib/showroom-data";
import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://phuongdong.example";
  const staticRoutes = ["", "/about", "/products", "/blog", "/showrooms", "/contact"];
  const now = new Date();

  return routing.locales.flatMap((locale) => {
    const baseRoutes = staticRoutes.map((path) => ({
      url: `${siteUrl}/${locale}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    }));

    const productRoutes = products
      .filter((product) => product.status === "published")
      .map((product) => ({
        url: `${siteUrl}/${locale}/products/${product.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));

    const blogRoutes = blogPosts.map((post) => ({
      url: `${siteUrl}/${locale}/blog/${post.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    return [...baseRoutes, ...productRoutes, ...blogRoutes];
  });
}
