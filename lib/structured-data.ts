/**
 * schema.org JSON-LD builders. Each function returns a plain object that is
 * serialized by the <JsonLd> component. Keep values defensive — public data
 * comes from the CMS and may be partially filled.
 */
import { SITE_URL, SITE_NAME, SITE_LOGO, toAbsoluteUrl } from "@/lib/seo";

type Json = Record<string, unknown>;

const CONTEXT = "https://schema.org";

/** Site-wide publisher identity. `sameAs` accepts social profile URLs. */
export function organizationSchema(opts?: {
  telephone?: string | null;
  sameAs?: string[];
}): Json {
  const sameAs = (opts?.sameAs || []).filter(Boolean);
  return {
    "@context": CONTEXT,
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_LOGO,
    ...(opts?.telephone ? { telephone: opts.telephone } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function webSiteSchema(locale: string): Json {
  return {
    "@context": CONTEXT,
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}/${locale}`,
    inLanguage: locale === "en" ? "en" : "vi",
  };
}

/** items: ordered crumbs from root to current page. `url` is locale-prefixed path or absolute. */
export function breadcrumbSchema(items: { name: string; url: string }[]): Json {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.url),
    })),
  };
}

export function productSchema(opts: {
  name: string;
  description?: string;
  images?: (string | null | undefined)[];
  sku?: string | null;
  brand?: string | null;
  category?: string | null;
  /** Numeric price (already promo-adjusted). Omit offers when null/0. */
  price?: number | null;
  priceCurrency?: string;
  url: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
}): Json {
  const images = (opts.images || [])
    .map((u) => toAbsoluteUrl(u))
    .filter((u): u is string => Boolean(u));

  const schema: Json = {
    "@context": CONTEXT,
    "@type": "Product",
    name: opts.name,
    url: toAbsoluteUrl(opts.url),
    ...(opts.description ? { description: opts.description } : {}),
    ...(images.length ? { image: images } : {}),
    ...(opts.sku ? { sku: opts.sku } : {}),
    ...(opts.brand ? { brand: { "@type": "Brand", name: opts.brand } } : {}),
    ...(opts.category ? { category: opts.category } : {}),
  };

  if (typeof opts.price === "number" && opts.price > 0) {
    schema.offers = {
      "@type": "Offer",
      price: opts.price,
      priceCurrency: opts.priceCurrency || "VND",
      availability: `https://schema.org/${opts.availability || "InStock"}`,
      url: toAbsoluteUrl(opts.url),
    };
  }

  return schema;
}

export function blogPostingSchema(opts: {
  headline: string;
  description?: string;
  image?: string | null;
  datePublished?: string | null;
  dateModified?: string | null;
  url: string;
  authorName?: string;
}): Json {
  const image = toAbsoluteUrl(opts.image);
  return {
    "@context": CONTEXT,
    "@type": "BlogPosting",
    headline: opts.headline,
    ...(opts.description ? { description: opts.description } : {}),
    ...(image ? { image: [image] } : {}),
    ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
    dateModified: opts.dateModified || opts.datePublished || undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": toAbsoluteUrl(opts.url) },
    author: { "@type": "Organization", name: opts.authorName || SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: SITE_LOGO },
    },
  };
}

/**
 * FurnitureStore is a valid LocalBusiness subtype — ideal for showroom local SEO.
 */
export function localBusinessSchema(opts: {
  name: string;
  image?: string | null;
  address?: string | null;
  telephone?: string | null;
  openingHours?: string | null;
  url: string;
  mapUrl?: string | null;
}): Json {
  const image = toAbsoluteUrl(opts.image);
  return {
    "@context": CONTEXT,
    "@type": "FurnitureStore",
    name: opts.name,
    url: toAbsoluteUrl(opts.url),
    ...(image ? { image } : {}),
    ...(opts.telephone ? { telephone: opts.telephone } : {}),
    ...(opts.openingHours ? { openingHoursSpecification: opts.openingHours } : {}),
    ...(opts.mapUrl ? { hasMap: opts.mapUrl } : {}),
    ...(opts.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: opts.address,
            addressCountry: "VN",
          },
        }
      : {}),
  };
}
