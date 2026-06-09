import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

interface GenerateMetadataOptions {
  title: string;
  description: string;
  path: string;
  imageUrl?: string;
  publishedAt?: string;
}

export function generatePageMetadata({
  title,
  description,
  path,
  imageUrl,
  publishedAt,
}: GenerateMetadataOptions): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://phuongdong.example";
  // Clean path to prevent double slashes
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const canonicalUrl = `${siteUrl}${cleanPath}`;
  
  // Construct language alternates
  const alternatesLanguages: Record<string, string> = {};
  routing.locales.forEach((locale) => {
    // If the path already contains a locale prefix, e.g. /vi/products/slug, strip it to resolve standard path
    const normalizedPath = cleanPath.replace(/^\/(vi|en)(\/|$)/, "/");
    const cleanNormalizedPath = normalizedPath === "/" ? "" : normalizedPath;
    alternatesLanguages[locale] = `${siteUrl}/${locale}${cleanNormalizedPath}`;
  });

  const baseMetadata: Metadata = {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: alternatesLanguages,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Showroom Nội Thất Phương Đông",
      type: publishedAt ? "article" : "website",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };

  if (publishedAt && baseMetadata.openGraph) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (baseMetadata.openGraph as any).publishedTime = publishedAt;
  }

  return baseMetadata;
}
