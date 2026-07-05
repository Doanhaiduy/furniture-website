"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Globe2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  X,
} from "lucide-react";
import type { Locale } from "@/i18n/routing";
import type { PublicSiteSettings } from "@/lib/supabase/queries";
import {
  brandCatalog,
  productGroups,
  withLocale,
} from "@/lib/showroom-data";
import { products as fixtureProducts } from "@/tests/fixtures/showroom-data-fixture";
import { imageAssets } from "@/lib/showroom-constants";

import { NavigationBar } from "./public-shell/NavigationBar";
import { Footer } from "./public-shell/Footer";
import { MobileMenu } from "./public-shell/MobileMenu";
import Link from "next/link";

type PublicShellLabels = {
  common: {
    brand: string;
    tagline: string;
    newsletterSent: string;
  };
  nav: {
    home: string;
    products: string;
    promotions: string;
    showrooms: string;
    blog: string;
    about: string;
    contact: string;
    quote: string;
    menu: string;
    close: string;
    catalog: string;
    catalogAll: string;
    catalogHint: string;
    catalogPopular: string;
    catalogViewGroup: string;
    zalo: string;
    messenger: string;
    hotline: string;
  };
};

const navItems = [
  { key: "home", href: "" },
  { key: "products", href: "/products" },
  { key: "promotions", href: "/promotions" },
  { key: "showrooms", href: "/showrooms" },
  { key: "blog", href: "/blog" },
  { key: "about", href: "/about" },
] as const;

type CatalogLink = { href: string; label: string };
type BrandSection = {
  key: string;
  href: string;
  image: string;
  title: string;
  summary: string;
  groupTitle: string;
  items: CatalogLink[];
};

export function PublicShell({
  children,
  locale,
  labels,
  siteSettings,
  brands = [],
  categories = [],
  products = [],
  socialLinks = [],
}: {
  children: React.ReactNode;
  locale: Locale;
  labels: PublicShellLabels;
  siteSettings?: PublicSiteSettings;
  brands?: any[];
  categories?: any[];
  products?: any[];
  socialLinks?: any[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  // Expanded by default so contact options are visible without a tap; still collapsible.
  const [fabOpen, setFabOpen] = useState(true);

  useEffect(() => {
    const hideDevBadge = () => {
      const portal = document.querySelector("nextjs-portal");
      if (portal && portal.shadowRoot) {
        if (!portal.shadowRoot.querySelector("#custom-hide-badge-style")) {
          const style = document.createElement("style");
          style.id = "custom-hide-badge-style";
          style.textContent = "#devtools-indicator { display: none !important; }";
          portal.shadowRoot.appendChild(style);
        }
      }
    };
    hideDevBadge();
    const interval = setInterval(hideDevBadge, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const getLocalizedValue = (val: any, currentLocale: Locale): string => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object") {
      return val[currentLocale] || val.vi || val.en || "";
    }
    return String(val);
  };

  const finalProducts = products && products.length > 0 ? products : fixtureProducts;

  const localeHref = (targetLocale: Locale) => {
    const parts = pathname.split("/");
    let path = "";
    if (parts[1] === "vi" || parts[1] === "en") {
      parts[1] = targetLocale;
      path = parts.join("/") || `/${targetLocale}`;
    } else {
      path = `/${targetLocale}`;
    }
    const params = searchParams.toString();
    return params ? `${path}?${params}` : path;
  };

  const linkHref = (href: string) => `/${locale}${href}`;

  const finalBrandCatalog = brands && brands.length > 0
    ? brands.map((b: any) => {
        const staticMatch = brandCatalog.find(
          (item) => item.key.toLowerCase() === b.name.en?.toLowerCase() || item.key.toLowerCase() === b.id
        );
        const brandSlug = b.name.en?.toLowerCase().replace(/\s+/g, "-") || b.id;
        return {
          key: b.id,
          href: `/products?brand=${brandSlug}`,
          image: b.logo_url || staticMatch?.image || imageAssets.room,
          groupKey: staticMatch?.groupKey || "sanitary",
          title: b.name,
          summary: b.description || staticMatch?.summary || { vi: "", en: "" },
          productSlugs: staticMatch?.productSlugs || [],
          items: staticMatch?.items || [],
        };
      })
    : brandCatalog;

  const brandSections: BrandSection[] = finalBrandCatalog.map((brand) => {
    const group = productGroups.find((item) => item.key === brand.groupKey);
    const brandProducts = finalProducts.filter(
      (p) => p.brand_id === brand.key || p.brandId === brand.key
    );

    const productLinks = brandProducts.map((p) => ({
      href: withLocale(locale, `/products/${p.slug}`),
      label: getLocalizedValue(p.name, locale),
    }));

    return {
      key: brand.key,
      href: withLocale(locale, brand.href),
      image: brand.image,
      title: getLocalizedValue(brand.title, locale),
      summary: getLocalizedValue(brand.summary, locale),
      groupTitle: group ? getLocalizedValue(group.title, locale) : labels.nav.products,
      items: productLinks.slice(0, 6),
    };
  });

  const rootCats = categories.filter((cat) => !cat.parentId);
  const rootCatsWithProducts = rootCats.map((root) => {
    const children = categories.filter((cat) => cat.parentId === root.id);
    const allCatIds = [root.id, ...children.map((c) => c.id)];
    const associatedProducts = finalProducts.filter(
      (p) => allCatIds.includes(p.category_id) || allCatIds.includes(p.categoryId)
    );
    return {
      root,
      children,
      associatedProducts,
      count: associatedProducts.length,
    };
  });

  const sortedRoots = [...rootCatsWithProducts].sort((a, b) => b.count - a.count);
  const top3Roots = sortedRoots.slice(0, 3);
  const otherRoots = sortedRoots.slice(3);

  const dynamicTypeSections = top3Roots.map((item) => {
    const root = item.root;
    const children = item.children;

    const columns = children.map((child) => {
      const childProducts = finalProducts.filter(
        (p) => p.category_id === child.id || p.categoryId === child.id
      );
      return {
        title: child.name,
        items: childProducts.length > 0
          ? childProducts.slice(0, 5).map((p) => ({
              href: withLocale(locale, `/products/${p.slug}`),
              label: getLocalizedValue(p.name, locale),
            }))
          : [{
              href: withLocale(locale, `/products?category=${child.slug}`),
              label: locale === "vi" ? "Xem tất cả" : "View all",
            }],
      };
    });

    const finalColumns = columns.length > 0
      ? columns
      : [{
          title: root.name,
          items: item.associatedProducts.slice(0, 6).map((p) => ({
            href: withLocale(locale, `/products/${p.slug}`),
            label: getLocalizedValue(p.name, locale),
          })),
        }];

    const groupProducts = item.associatedProducts.slice(0, 3).map((p) => ({
      href: withLocale(locale, `/products/${p.slug}`),
      label: getLocalizedValue(p.name, locale),
    }));

    return {
      key: root.id,
      href: withLocale(locale, `/products?category=${root.slug}`),
      image: root.image || imageAssets.showroom,
      title: root.name,
      summary: root.description || (locale === "vi" ? "Sản phẩm chất lượng cao." : "High quality products."),
      columns: finalColumns,
      products: groupProducts,
    };
  });

  if (otherRoots.length > 0) {
    const otherProducts = otherRoots.flatMap((item) => item.associatedProducts);
    const columns = otherRoots.map((item) => {
      const root = item.root;
      const children = item.children;
      return {
        title: root.name,
        items: children.length > 0
          ? children.map((child) => ({
              href: withLocale(locale, `/products?category=${child.slug}`),
              label: child.name,
            }))
          : [{
              href: withLocale(locale, `/products?category=${root.slug}`),
              label: locale === "vi" ? "Xem tất cả" : "View all",
            }],
      };
    });

    const groupProducts = otherProducts.slice(0, 3).map((p) => ({
      href: withLocale(locale, `/products/${p.slug}`),
      label: getLocalizedValue(p.name, locale),
    }));

    dynamicTypeSections.push({
      key: "solutions",
      href: withLocale(locale, "/products?category=other"),
      image: imageAssets.showroom,
      title: locale === "vi" ? "Thiết kế khác" : "Other designs",
      summary: locale === "vi"
        ? "Các giải pháp và thiết kế độc đáo khác cho không gian của bạn."
        : "Other unique solutions and designs for your space.",
      columns,
      products: groupProducts,
    });
  }

  return (
    <div className="public-app min-h-screen text-on-surface">
      <NavigationBar
        locale={locale}
        pathname={pathname}
        siteSettings={siteSettings}
        labels={labels}
        navItems={navItems}
        brandSections={brandSections}
        typeSections={dynamicTypeSections}
        linkHref={linkHref}
        localeHref={localeHref}
        open={open}
        setOpen={setOpen}
      />

      <MobileMenu
        open={open}
        setOpen={setOpen}
        locale={locale}
        linkHref={linkHref}
        labels={labels}
        navItems={navItems}
        brandSections={brandSections}
        typeSections={dynamicTypeSections}
      />

      {children}

      <Footer
        locale={locale}
        siteSettings={siteSettings}
        labels={labels}
        socialLinks={socialLinks}
        navItems={navItems}
        linkHref={linkHref}
      />

      {/* Floating Quick Contact FAB Menu */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 flex flex-col items-end gap-3 font-sans">
        {fabOpen && (
          <div className="flex flex-col items-end gap-3 mb-1 animate-in fade-in slide-in-from-bottom-5 duration-200">
            <a
              href={`tel:${(siteSettings?.contactPhone || "08172357587").replace(/\s+/g, "")}`}
              className="group flex items-center gap-3 mr-[2px] md:mr-[6px]"
              aria-label={labels.nav.hotline}
            >
              <span className="rounded bg-black/75 px-2.5 py-1 text-xs font-semibold text-white shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                {labels.nav.hotline}: {siteSettings?.contactPhone || "08172 357 587"}
              </span>
              <div className="flex size-11 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-transform hover:scale-110 active:scale-95">
                <Phone className="size-5" />
              </div>
            </a>

            <a
              href={`https://zalo.me/${(siteSettings?.contactPhone || "08172357587").replace(/\s+/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 mr-[2px] md:mr-[6px]"
              aria-label={labels.nav.zalo}
            >
              <span className="rounded bg-black/75 px-2.5 py-1 text-xs font-semibold text-white shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                {labels.nav.zalo}
              </span>
              <div className="flex size-11 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg transition-transform hover:scale-110 active:scale-95">
                <img src="/icon_zalo.webp" alt="Zalo" className="size-full object-cover" />
              </div>
            </a>

            <a
              href="https://m.me/phuongdongshowroom"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 mr-[2px] md:mr-[6px]"
              aria-label={labels.nav.messenger}
            >
              <span className="rounded bg-black/75 px-2.5 py-1 text-xs font-semibold text-white shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                {labels.nav.messenger}
              </span>
              <div className="flex size-11 items-center justify-center rounded-full bg-gradient-to-tr from-[#006AFF] via-[#A75FFF] to-[#FF5A5F] text-white shadow-lg transition-transform hover:scale-110 active:scale-95">
                <MessengerIcon className="size-5" />
              </div>
            </a>

            <Link
              href={`/${locale}/showrooms`}
              className="group flex items-center gap-3 mr-[2px] md:mr-[6px]"
              onClick={() => setFabOpen(false)}
              aria-label={locale === "vi" ? "Vị trí showroom" : "Showroom location"}
            >
              <span className="rounded bg-black/75 px-2.5 py-1 text-xs font-semibold text-white shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                {locale === "vi" ? "Vị trí" : "Location"}
              </span>
              <div className="flex size-11 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg transition-transform hover:scale-110 active:scale-95">
                <MapPin className="size-5" />
              </div>
            </Link>

            <Link
              href={`/${locale}/contact`}
              className="group flex items-center gap-3 mr-[2px] md:mr-[6px]"
              onClick={() => setFabOpen(false)}
              aria-label={labels.nav.contact}
            >
              <span className="rounded bg-black/75 px-2.5 py-1 text-xs font-semibold text-white shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                {labels.nav.contact}
              </span>
              <div className="flex size-11 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-110 active:scale-95">
                <Mail className="size-5" />
              </div>
            </Link>
          </div>
        )}

        <button
          type="button"
          onClick={() => setFabOpen(!fabOpen)}
          className={`flex size-12 md:size-14 items-center justify-center rounded-full shadow-xl transition-all duration-300 ${
            fabOpen
              ? "bg-surface-container text-primary rotate-90"
              : "bg-primary hover:bg-primary/90 text-white hover:scale-105 active:scale-95"
          }`}
          aria-expanded={fabOpen}
          aria-label="Contact actions"
        >
          {fabOpen ? (
            <X className="size-6 animate-in spin-in duration-300" />
          ) : (
            <MessageCircle className="size-6 animate-in zoom-in duration-300" />
          )}
        </button>
      </div>
    </div>
  );
}

function MessengerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.9 1.15 5.5 3.03 7.37.15.15.25.37.22.58l-.33 2.1c-.05.37.28.7.65.65l2.1-.33c.2-.03.42.07.57.22C10.15 22.8 11.1 23 12 23c5.64 0 10-4.13 10-9.7C22 7.13 17.64 2 12 2zm1 13.5l-2.5-2.7-4.8 2.7 5.3-5.6 2.5 2.7 4.8-2.7-5.3 5.6z" />
    </svg>
  );
}

export { NavigationBar } from "./public-shell/NavigationBar";
export { Footer } from "./public-shell/Footer";
export { MobileMenu } from "./public-shell/MobileMenu";
export { SearchBar } from "./public-shell/SearchBar";
export { LanguageSwitcher } from "./public-shell/LanguageSwitcher";
