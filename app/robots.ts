import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://phuongdong.example";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/vi", "/en"],
        disallow: ["/admin/*", "/api/*", "/preview/*", "/*?draft=true"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
