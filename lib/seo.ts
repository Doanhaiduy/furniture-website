import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

/**
 * Canonical site origin (no trailing slash). MUST be set via NEXT_PUBLIC_SITE_URL
 * in production, otherwise canonical/OG URLs fall back to a placeholder domain.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://phuongdong.example"
).replace(/\/$/, "");

export const SITE_NAME = "Showroom Nội Thất Phương Đông";

/** Absolute URL of the brand logo, reused for Organization schema + default OG image. */
export const SITE_LOGO = `${SITE_URL}/logo-final.jpg`;

/** Fallback social-share image used when a page has no specific image. */
export const DEFAULT_OG_IMAGE = SITE_LOGO;

/** Resolve a possibly-relative asset path to an absolute URL. */
export function toAbsoluteUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

const OG_LOCALE: Record<string, string> = { vi: "vi_VN", en: "en_US" };

interface GenerateMetadataOptions {
  title: string;
  description: string;
  /** Locale-prefixed path, e.g. "/vi/products/slug". */
  path: string;
  imageUrl?: string;
  publishedAt?: string;
  /** Override the Open Graph type. Defaults to "article" when publishedAt is set, else "website". */
  type?: "website" | "article";
  /** When true, emit robots noindex/nofollow (e.g. thin or utility pages). */
  noIndex?: boolean;
}

export function generatePageMetadata({
  title,
  description,
  path,
  imageUrl,
  publishedAt,
  type,
  noIndex,
}: GenerateMetadataOptions): Metadata {
  // Clean path to prevent double slashes
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const canonicalUrl = `${SITE_URL}${cleanPath}`;

  // Detect the current locale from the path so we can emit the correct og:locale.
  const localeMatch = cleanPath.match(/^\/(vi|en)(\/|$)/);
  const currentLocale = localeMatch ? localeMatch[1] : routing.defaultLocale;

  // Construct language alternates by swapping the locale prefix.
  const alternatesLanguages: Record<string, string> = {};
  routing.locales.forEach((locale) => {
    const normalizedPath = cleanPath.replace(/^\/(vi|en)(\/|$)/, "/");
    const cleanNormalizedPath = normalizedPath === "/" ? "" : normalizedPath;
    alternatesLanguages[locale] = `${SITE_URL}/${locale}${cleanNormalizedPath}`;
  });
  // x-default helps search engines pick a fallback for unlisted locales.
  alternatesLanguages["x-default"] = `${SITE_URL}/${routing.defaultLocale}${
    cleanPath.replace(/^\/(vi|en)(\/|$)/, "/") === "/"
      ? ""
      : cleanPath.replace(/^\/(vi|en)(\/|$)/, "/")
  }`;

  const resolvedImage = toAbsoluteUrl(imageUrl) || DEFAULT_OG_IMAGE;

  const baseMetadata: Metadata = {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: alternatesLanguages,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: OG_LOCALE[currentLocale] || "vi_VN",
      type: type || (publishedAt ? "article" : "website"),
      images: [
        {
          url: resolvedImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [resolvedImage],
    },
  };

  if (publishedAt && baseMetadata.openGraph) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (baseMetadata.openGraph as any).publishedTime = publishedAt;
  }

  return baseMetadata;
}
