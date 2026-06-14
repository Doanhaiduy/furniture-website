/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Globe2,
  Home,
  Layers3,
  Mail,
  Menu,
  MessageCircle,
  Phone,
  Share2,
  X,
} from "lucide-react";
import type { Locale } from "@/i18n/routing";
import type { PublicSiteSettings } from "@/lib/supabase/queries";
import {
  brandCatalog,
  localized,
  productGroups,
  products,
  typeCatalogSections,
  withLocale,
} from "@/lib/showroom-data";
import { RemoteImage } from "./remote-image";
import { imageAssets } from "@/lib/showroom-constants";

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

type CatalogMode = "brands" | "types";
type CatalogLink = { href: string; label: string };
type CatalogColumn = { title: string; items: CatalogLink[] };
type BrandSection = {
  key: string;
  href: string;
  image: string;
  title: string;
  summary: string;
  groupTitle: string;
  items: CatalogLink[];
};
type TypeSection = {
  key: string;
  href: string;
  image: string;
  title: string;
  summary: string;
  columns: CatalogColumn[];
  products: CatalogLink[];
};

export function PublicShell({
  children,
  locale,
  labels,
  siteSettings,
  brands = [],
  categories = [],
}: {
  children: React.ReactNode;
  locale: Locale;
  labels: PublicShellLabels;
  siteSettings?: PublicSiteSettings;
  brands?: any[];
  categories?: any[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [activeCatalog, setActiveCatalog] = useState<{ mode: CatalogMode; key: string }>({
    mode: "brands",
    key: brands && brands.length > 0 ? brands[0].id : (brandCatalog[0]?.key ?? "all"),
  });
  const [newsletterSent, setNewsletterSent] = useState(false);
  const catalogCloseTimer = useRef<number | null>(null);

  const localeHref = (targetLocale: Locale) => {
    const parts = pathname.split("/");
    if (parts[1] === "vi" || parts[1] === "en") {
      parts[1] = targetLocale;
      return parts.join("/") || `/${targetLocale}`;
    }
    return `/${targetLocale}`;
  };

  const linkHref = (href: string) => `/${locale}${href}`;
  const cancelCatalogClose = () => {
    if (catalogCloseTimer.current) {
      window.clearTimeout(catalogCloseTimer.current);
      catalogCloseTimer.current = null;
    }
  };
  const openCatalog = (mode: CatalogMode, key: string) => {
    cancelCatalogClose();
    setActiveCatalog({ mode, key });
    setCatalogOpen(true);
  };
  const closeCatalog = () => {
    cancelCatalogClose();
    setCatalogOpen(false);
  };
  const scheduleCatalogClose = () => {
    cancelCatalogClose();
    catalogCloseTimer.current = window.setTimeout(() => setCatalogOpen(false), 150);
  };

  const productLinkFromSlug = (slug: string): CatalogLink | null => {
    const product = products.find((item) => item.slug === slug && item.status !== "archived");
    if (!product) return null;
    return {
      href: withLocale(locale, `/products/${product.slug}`),
      label: localized(product.name, locale),
    };
  };

  const finalBrandCatalog = brands && brands.length > 0
    ? brands.map((b: any) => {
        const staticMatch = brandCatalog.find(
          (item) => item.key.toLowerCase() === b.name.en?.toLowerCase() || item.key.toLowerCase() === b.id
        );
        return {
          key: b.id,
          href: `/products?brand=${b.id}`,
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
    const productLinks = brand.productSlugs
      .map((slug) => productLinkFromSlug(slug))
      .filter((item): item is CatalogLink => Boolean(item));
    const categoryLinks = brand.items.map((item) => ({
      href: withLocale(locale, item.href),
      label: localized(item.label, locale),
    }));

    return {
      key: brand.key,
      href: withLocale(locale, brand.href),
      image: brand.image,
      title: localized(brand.title, locale),
      summary: localized(brand.summary, locale),
      groupTitle: group ? localized(group.title, locale) : labels.nav.products,
      items: [...productLinks, ...categoryLinks].slice(0, 6),
    };
  });

  const typeSections: TypeSection[] = categories && categories.length > 0
    ? productGroups.map((group) => {
        // Map UI group key to DB groupKey
        let dbGroupKey = "";
        if (group.key === "wood") dbGroupKey = "wooden_furniture";
        else if (group.key === "sanitary") dbGroupKey = "sanitary_equipment";
        else if (group.key === "tiles") dbGroupKey = "tiles";
        else if (group.key === "solutions") dbGroupKey = "project_solutions";

        const groupCats = categories.filter((cat) => cat.groupKey === dbGroupKey);
        
        // Find parent categories (parentId is null/empty)
        const parentCats = groupCats.filter((cat) => !cat.parentId);
        
        const columns = parentCats.map((parent) => {
          const children = groupCats.filter((cat) => cat.parentId === parent.id);
          return {
            title: parent.name,
            items: children.map((child) => ({
              href: withLocale(locale, `/products?category=${child.slug}`),
              label: child.name,
            })),
          };
        });

        // Handle flat categories
        if (columns.length === 0 && groupCats.length > 0) {
          columns.push({
            title: locale === "vi" ? "Danh mục chính" : "Main Categories",
            items: groupCats.map((cat) => ({
              href: withLocale(locale, `/products?category=${cat.slug}`),
              label: cat.name,
            })),
          });
        }

        // Get 3 representative products for this group
        const groupProducts = products
          .filter((p) => (p as any).categoryKey === group.key && p.status === "published")
          .slice(0, 3)
          .map((p) => ({
            href: withLocale(locale, `/products/${p.slug}`),
            label: localized(p.name, locale),
          }));

        return {
          key: group.key,
          href: withLocale(locale, group.href),
          image: group.image,
          title: localized(group.title, locale),
          summary: localized(group.summary, locale),
          columns,
          products: groupProducts,
        };
      })
    : typeCatalogSections.map((section) => {
        const group = productGroups.find((item) => item.key === section.key) ?? productGroups[0];
        return {
          key: section.key,
          href: withLocale(locale, group.href),
          image: group.image,
          title: localized(group.title, locale),
          summary: localized(group.summary, locale),
          columns: section.columns.map((column) => ({
            title: localized(column.title, locale),
            items: column.items.map((item) => ({
              href: withLocale(locale, item.href),
              label: localized(item.label, locale),
            })),
          })),
          products: section.productSlugs
            .map((slug) => productLinkFromSlug(slug))
            .filter((item): item is CatalogLink => Boolean(item)),
        };
      });

  const activeBrand = brandSections.find((section) => section.key === activeCatalog.key) ?? brandSections[0];
  const activeType = typeSections.find((section) => section.key === activeCatalog.key) ?? typeSections[0];

  return (
    <div className="public-app min-h-screen text-on-surface">
      <header
        className="public-header sticky top-0 z-50"
        onKeyDown={(event) => {
          if (event.key === "Escape") closeCatalog();
        }}
      >
        <div className="container-pd flex h-20 items-center justify-between gap-6">
          <Link href={`/${locale}`} className="group flex shrink-0 items-center gap-3">
            <div className="logo-wrapper-shine rounded-lg">
              <img
                src={siteSettings?.logoUrl || "/logo-final.svg"}
                alt={siteSettings?.brandName || labels.common.brand}
                className="h-14 w-14 object-contain transition-transform group-hover:scale-[1.03]"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-sm sm:text-base md:text-lg font-bold leading-tight text-primary transition-colors group-hover:text-primary-container max-w-[180px] md:max-w-none">
                {siteSettings?.brandName || labels.common.brand}
              </span>
              <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                {labels.common.tagline}
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
            {navItems.map((item) => {
              const href = linkHref(item.href);
              const active =
                item.href === ""
                  ? pathname === `/${locale}`
                  : pathname.startsWith(href);

              return (
                <Link
                  key={item.key}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`nav-link-pd group relative bg-transparent px-2 uppercase tracking-wider text-[13px] ${
                    active ? "text-primary" : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  <span>{labels.nav[item.key]}</span>
                  <span
                    className={`absolute inset-x-0 bottom-0 h-px origin-left bg-primary transition-all duration-300 ${
                      active ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-70"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="chip-pd hidden md:flex">
              <Link href={localeHref("vi")} className={`transition-colors ${locale === "vi" ? "text-primary" : "text-outline hover:text-primary"}`}>
                VI
              </Link>
              <span className="mx-2 text-outline-variant">|</span>
              <Link href={localeHref("en")} className={`transition-colors ${locale === "en" ? "text-primary" : "text-outline hover:text-primary"}`}>
                EN
              </Link>
            </div>
            {/* Contact button removed from header to move to FAB */}
            <button
              type="button"
              aria-label={open ? labels.nav.close : labels.nav.menu}
              className="btn-pd-icon lg:hidden"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        <div
          className="public-catalog-bar relative hidden lg:block"
          onMouseEnter={cancelCatalogClose}
          onMouseLeave={scheduleCatalogClose}
          onBlur={(event) => {
            const relatedTarget = event.relatedTarget as Node | null;
            if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) scheduleCatalogClose();
          }}
        >
          <div className="container-pd flex h-14 items-center gap-4">
            <button
              type="button"
              aria-expanded={catalogOpen && activeCatalog.mode === "brands"}
              aria-controls="catalog-mega-menu"
              className={`inline-flex h-full min-w-[228px] items-center gap-3 px-4 text-sm font-bold uppercase tracking-wider transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 ${
                catalogOpen && activeCatalog.mode === "brands" ? "bg-primary-container text-white" : "bg-primary-container/90 text-white hover:bg-primary-container"
              }`}
              onMouseEnter={() => openCatalog("brands", activeCatalog.mode === "brands" ? activeCatalog.key : brandSections[0]?.key ?? "all")}
              onFocus={() => openCatalog("brands", activeCatalog.mode === "brands" ? activeCatalog.key : brandSections[0]?.key ?? "all")}
              onClick={() => {
                if (catalogOpen && activeCatalog.mode === "brands") {
                  closeCatalog();
                  return;
                }
                openCatalog("brands", activeCatalog.mode === "brands" ? activeCatalog.key : brandSections[0]?.key ?? "all");
              }}
            >
              <Menu className="size-5" />
              {labels.nav.catalog}
              <ChevronDown className={`ml-auto size-4 transition-transform ${catalogOpen && activeCatalog.mode === "brands" ? "rotate-180" : ""}`} />
            </button>

            <Link
              href={`/${locale}`}
              className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-control)] text-white/86 transition hover:bg-white/12 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              aria-label={labels.nav.home}
            >
              <Home className="size-5" />
            </Link>

            <nav className="ml-auto flex min-w-0 items-center justify-end gap-1" aria-label="Catalog">
              {typeSections.map((section) => (
                <Link
                  key={section.key}
                  href={section.href}
                  aria-expanded={catalogOpen && activeCatalog.mode === "types" && activeCatalog.key === section.key}
                  aria-controls="catalog-mega-menu"
                  className={`whitespace-nowrap rounded-[var(--radius-control)] px-3 py-2 text-sm font-bold uppercase tracking-wider transition hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 xl:px-4 ${
                    catalogOpen && activeCatalog.mode === "types" && activeCatalog.key === section.key ? "bg-white/14 text-white" : "text-white/86"
                  }`}
                  onMouseEnter={() => openCatalog("types", section.key)}
                  onFocus={() => openCatalog("types", section.key)}
                  onClick={closeCatalog}
                >
                  {section.title}
                </Link>
              ))}
            </nav>
          </div>

          {catalogOpen ? (
            <div
              id="catalog-mega-menu"
              className="public-mega-menu animate-in fade-in slide-in-from-top-2 absolute inset-x-0 top-full z-50 text-on-surface duration-200 motion-reduce:animate-none"
              onMouseEnter={cancelCatalogClose}
            >
              {activeCatalog.mode === "brands" ? (
                <div className="container-pd grid min-h-[318px] gap-0 py-0 lg:grid-cols-[300px_1fr]">
                  <aside className="border-r border-outline-variant/25 py-4 pr-4">
                    <Link
                      href={withLocale(locale, "/products")}
                      className="mb-2 flex w-full items-center justify-between rounded-[var(--radius-control)] px-4 py-3 text-left text-sm font-bold text-primary transition hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                      onMouseEnter={() => openCatalog("brands", "all")}
                      onFocus={() => openCatalog("brands", "all")}
                      onClick={closeCatalog}
                    >
                      {labels.nav.catalogAll}
                      <Layers3 className="size-4" />
                    </Link>
                    <div className="grid gap-1">
                      {brandSections.map((section) => (
                        <button
                          key={section.key}
                          type="button"
                          className={`flex items-center justify-between rounded-[var(--radius-control)] px-4 py-3 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 ${
                            activeCatalog.key === section.key ? "bg-surface-container text-primary" : "text-secondary hover:bg-surface-container-low hover:text-primary"
                          }`}
                          onMouseEnter={() => openCatalog("brands", section.key)}
                          onFocus={() => openCatalog("brands", section.key)}
                          onClick={() => openCatalog("brands", section.key)}
                        >
                          {section.title}
                          <ChevronRight className="size-4" />
                        </button>
                      ))}
                    </div>
                  </aside>

                  <div className="py-5 pl-6">
                    {activeCatalog.key === "all" ? (
                      <>
                        <div className="mb-5 flex items-end justify-between gap-6">
                          <div>
                            <p className="label-pd">{labels.nav.catalogAll}</p>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">{labels.nav.catalogHint}</p>
                          </div>
                          <Link href={withLocale(locale, "/products")} className="button-pd-outline shrink-0" onClick={closeCatalog}>
                            {labels.nav.products}
                            <ArrowRight className="size-4" />
                          </Link>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          {brandSections.map((section) => (
                            <Link
                              key={section.key}
                              href={section.href}
                              className="surface-card interactive-card group grid grid-cols-[88px_1fr] overflow-hidden"
                              onMouseEnter={() => openCatalog("brands", section.key)}
                              onFocus={() => openCatalog("brands", section.key)}
                              onClick={closeCatalog}
                            >
                              <RemoteImage src={section.image} alt={section.title} className="image-lift h-full min-h-24 w-full object-cover" sizes="8vw" />
                              <span className="block p-3">
                                <span className="font-heading text-lg font-semibold text-primary">{section.title}</span>
                                <span className="mt-1 block text-xs font-bold uppercase tracking-[0.12em] text-outline">{section.groupTitle}</span>
                                <span className="mt-1 line-clamp-2 block text-xs leading-5 text-secondary">{section.summary}</span>
                              </span>
                            </Link>
                          ))}
                        </div>
                      </>
                    ) : (
                      <BrandMegaContent
                        section={activeBrand}
                        labels={labels}
                        closeCatalog={closeCatalog}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="container-pd grid min-h-[292px] gap-6 py-5 lg:grid-cols-[0.78fr_1.22fr]">
                  <div className="public-image-panel relative min-h-[250px] bg-primary text-white">
                    <RemoteImage src={activeType.image} alt={activeType.title} className="absolute inset-0 h-full w-full object-cover opacity-78" sizes="36vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/38 to-transparent" />
                    <div className="absolute bottom-0 p-5">
                      <p className="label-pd text-white/65">{labels.nav.catalogPopular}</p>
                      <h2 className="mt-3 font-heading text-3xl font-semibold">{activeType.title}</h2>
                      <p className="mt-2 max-w-sm text-sm leading-6 text-white/76">{activeType.summary}</p>
                      <Link href={activeType.href} className="public-inverse-button mt-5 min-h-9 px-4 py-2" onClick={closeCatalog}>
                        {labels.nav.catalogViewGroup}
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
                    <div className="grid gap-4 md:grid-cols-2">
                      {activeType.columns.map((column) => (
                        <div key={column.title}>
                          <p className="label-pd">{column.title}</p>
                          <div className="mt-3 grid gap-2">
                            {column.items.map((item) => (
                              <Link
                                key={`${activeType.key}-${item.href}`}
                                href={item.href}
                                className="nav-link-pd surface-card group flex min-h-11 items-center gap-3 px-4 py-3 text-on-surface"
                                onClick={closeCatalog}
                              >
                                <ChevronRight className="size-4 text-primary transition group-hover:translate-x-0.5" />
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {activeType.products.length > 0 ? (
                      <div>
                        <p className="label-pd">{labels.nav.catalogPopular}</p>
                        <div className="mt-3 grid gap-2">
                          {activeType.products.map((item) => (
                            <Link
                              key={`${activeType.key}-${item.href}`}
                              href={item.href}
                              className="nav-link-pd surface-card group flex min-h-11 items-center justify-between px-4 py-3 text-primary"
                              onClick={closeCatalog}
                            >
                              {item.label}
                              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {open ? (
          <div className="public-mega-menu animate-in fade-in slide-in-from-top-2 border-t duration-200 motion-reduce:animate-none lg:hidden">
            <nav className="container-pd grid gap-2 py-4" aria-label="Mobile">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={linkHref(item.href)}
                  className="nav-link-pd flex min-h-11 w-full uppercase tracking-wider"
                  onClick={() => setOpen(false)}
                >
                  {labels.nav[item.key]}
                </Link>
              ))}
              <div className="surface-panel p-3">
                <p className="label-pd">{labels.nav.catalog}</p>
                <div className="mt-3 grid gap-1 sm:grid-cols-2">
                  {brandSections.slice(0, 6).map((section) => (
                    <Link
                      key={section.key}
                      href={section.href}
                      className="nav-link-pd min-h-9 px-3 py-2 text-secondary"
                      onClick={() => setOpen(false)}
                    >
                      {section.title}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="surface-panel p-3">
                <p className="label-pd">{labels.nav.catalogPopular}</p>
                <div className="mt-3 grid gap-1">
                  {typeSections.map((section) => (
                    <Link
                      key={section.key}
                      href={section.href}
                      className="nav-link-pd min-h-9 px-3 py-2 text-secondary"
                      onClick={() => setOpen(false)}
                    >
                      {section.title}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="chip-pd flex min-h-11 justify-between px-3 py-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-outline">
                  <Globe2 className="size-4" />
                  VI / EN
                </span>
                <div className="flex gap-2 text-sm font-bold">
                  <Link href={localeHref("vi")}>VI</Link>
                  <Link href={localeHref("en")}>EN</Link>
                </div>
              </div>
              {/* Mobile contact CTA removed to move to FAB */}
            </nav>
          </div>
        ) : null}
      </header>

      {children}

      <footer className="public-footer py-16">
        <div className="container-pd grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-3">
              <img
                src={siteSettings?.logoUrl || "/logo-final.svg"}
                alt={siteSettings?.brandName || labels.common.brand}
                className="h-10 w-10 rounded-md object-contain bg-[#fdebbf] p-0.5"
              />
              <h2 className="font-heading text-xl font-bold">{siteSettings?.brandName || labels.common.brand}</h2>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/70">
              {locale === "vi"
                ? "Nội thất, thiết bị vệ sinh và gạch ốp lát cao cấp. Không gian chuẩn mực cho mọi ngôi nhà Việt."
                : "Premium furniture, sanitary ware and tiles for refined living spaces."}
            </p>
            <div className="mt-5 flex gap-3">
              <a className="public-social-link" href="https://facebook.com" aria-label="Facebook">
                <Globe2 className="size-4" />
              </a>
              <a className="public-social-link" href="https://instagram.com" aria-label="Instagram">
                <Share2 className="size-4" />
              </a>
              <a className="public-social-link" href="https://zalo.me" aria-label="Zalo">
                <Share2 className="size-4" />
              </a>
            </div>
          </div>
          <FooterColumn
            title={locale === "vi" ? "Liên kết nhanh" : "Quick links"}
            links={navItems.slice(0, 4).map((item) => ({
              href: linkHref(item.href),
              label: labels.nav[item.key],
            }))}
          />
          <FooterColumn
            title={locale === "vi" ? "Chính sách" : "Policies"}
            links={[
              { href: `/${locale}/contact`, label: locale === "vi" ? "Chính sách bảo mật" : "Privacy policy" },
              { href: `/${locale}/contact`, label: locale === "vi" ? "Điều khoản sử dụng" : "Terms of service" },
              { href: `/${locale}/showrooms`, label: locale === "vi" ? "Hỗ trợ khách hàng" : "Customer support" },
            ]}
          />
          <div>
            <h3 className="label-pd text-white">{locale === "vi" ? "Đăng ký bản tin" : "Newsletter"}</h3>
            <p className="mt-4 text-sm leading-6 text-white/70">
              {locale === "vi"
                ? "Nhận cập nhật mới nhất về bộ sưu tập và ưu đãi."
                : "Receive the latest collection updates and offers."}
            </p>
            <form
              className="mt-4 flex"
              onSubmit={(event) => {
                event.preventDefault();
                setNewsletterSent(true);
              }}
            >
              <input
                aria-label="Email"
                className="public-footer-field"
                placeholder="Email"
              />
              <button className="public-footer-button" type="submit">
                {locale === "vi" ? "Gửi" : "Send"}
              </button>
            </form>
            {newsletterSent ? (
              <p className="mt-3 text-xs font-semibold text-white/70">
                {labels.common.newsletterSent}
              </p>
            ) : null}
          </div>
        </div>
        <div className="container-pd mt-10 border-t border-white/10 pt-6 text-xs text-white/50">
          © 2026 Showroom Nội Thất Phương Đông.
        </div>
      </footer>
      {/* Floating Quick Contact FAB Menu */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
        {/* Contact list options */}
        {fabOpen && (
          <div className="flex flex-col items-end gap-3 mb-1 animate-in fade-in slide-in-from-bottom-5 duration-200">
            {/* Hotline Option */}
            <a
              href={`tel:${(siteSettings?.contactPhone || "08172357587").replace(/\s+/g, "")}`}
              className="group flex items-center gap-3 mr-[6px]"
              aria-label={labels.nav.hotline}
            >
              <span className="rounded bg-black/75 px-2.5 py-1 text-xs font-semibold text-white shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                {labels.nav.hotline}: {siteSettings?.contactPhone || "08172 357 587"}
              </span>
              <div className="flex size-11 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-transform hover:scale-110 active:scale-95">
                <Phone className="size-5" />
              </div>
            </a>

            {/* Zalo Option */}
            <a
              href={`https://zalo.me/${(siteSettings?.contactPhone || "08172357587").replace(/\s+/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 mr-[6px]"
              aria-label={labels.nav.zalo}
            >
              <span className="rounded bg-black/75 px-2.5 py-1 text-xs font-semibold text-white shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                {labels.nav.zalo}
              </span>
              <div className="flex size-11 items-center justify-center rounded-full bg-[#0068FF] text-white shadow-lg transition-transform hover:scale-110 active:scale-95">
                <ZaloIcon className="size-5" />
              </div>
            </a>

            {/* Messenger Option */}
            <a
              href="https://m.me/phuongdongshowroom"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 mr-[6px]"
              aria-label={labels.nav.messenger}
            >
              <span className="rounded bg-black/75 px-2.5 py-1 text-xs font-semibold text-white shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                {labels.nav.messenger}
              </span>
              <div className="flex size-11 items-center justify-center rounded-full bg-gradient-to-tr from-[#006AFF] via-[#A75FFF] to-[#FF5A5F] text-white shadow-lg transition-transform hover:scale-110 active:scale-95">
                <MessengerIcon className="size-5" />
              </div>
            </a>

            {/* Contact Form Option */}
            <Link
              href={`/${locale}/contact`}
              className="group flex items-center gap-3 mr-[6px]"
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

        {/* Main FAB Trigger Button */}
        <button
          type="button"
          onClick={() => setFabOpen((open) => !open)}
          className={`flex size-14 items-center justify-center rounded-full shadow-xl transition-all duration-300 ${
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

// Stylized social icon components
function ZaloIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.477 2 2 5.86 2 10.62c0 2.68 1.42 5.08 3.65 6.64-.17.76-.7 2.46-.77 2.68-.1.33.1.66.45.62.33-.04 2.24-.86 3.6-1.58C10.02 19.14 11.02 19.24 12 19.24c5.523 0 10-3.86 10-8.62C22 5.86 17.523 2 12 2zm.2 11.66h-2.3v-1.63l1.37-1.74h-1.37v-1.12h2.24v1.54l-1.34 1.83h1.4v1.12z" />
    </svg>
  );
}

function MessengerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.9 1.15 5.5 3.03 7.37.15.15.25.37.22.58l-.33 2.1c-.05.37.28.7.65.65l2.1-.33c.2-.03.42.07.57.22C10.15 22.8 11.1 23 12 23c5.64 0 10-4.13 10-9.7C22 7.13 17.64 2 12 2zm1 13.5l-2.5-2.7-4.8 2.7 5.3-5.6 2.5 2.7 4.8-2.7-5.3 5.6z" />
    </svg>
  );
}

function BrandMegaContent({
  section,
  labels,
  closeCatalog,
}: {
  section?: BrandSection;
  labels: PublicShellLabels;
  closeCatalog: () => void;
}) {
  if (!section) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1fr]">
      <div className="public-image-panel relative min-h-[260px] bg-primary text-white">
        <RemoteImage src={section.image} alt={section.title} className="absolute inset-0 h-full w-full object-cover opacity-75" sizes="38vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
        <div className="absolute bottom-0 p-5">
          <p className="label-pd text-white/65">{section.groupTitle}</p>
          <h2 className="mt-3 font-heading text-3xl font-semibold">{section.title}</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-white/76">{section.summary}</p>
          <Link href={section.href} className="public-inverse-button mt-5 min-h-9 px-4 py-2" onClick={closeCatalog}>
            {labels.nav.catalogViewGroup}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
      <div>
        <p className="label-pd">{labels.nav.catalogPopular}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {section.items.map((item) => (
            <Link
              key={`${section.key}-${item.href}-${item.label}`}
              href={item.href}
              className="nav-link-pd surface-card group flex min-h-11 items-center gap-3 px-4 py-3 text-on-surface"
              onClick={closeCatalog}
            >
              <ChevronRight className="size-4 text-primary transition group-hover:translate-x-0.5" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <h3 className="label-pd text-white">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm text-white/70">
        {links.map((link) => (
          <li key={link.label}>
            <Link className="transition hover:text-white" href={link.href}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
