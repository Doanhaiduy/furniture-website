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
  Menu,
  Phone,
  Share2,
  X,
} from "lucide-react";
import type { Locale } from "@/i18n/routing";
import {
  brandCatalog,
  localized,
  productGroups,
  products,
  typeCatalogSections,
  withLocale,
} from "@/lib/showroom-data";
import { RemoteImage } from "./remote-image";

type PublicShellLabels = {
  common: {
    brand: string;
    tagline: string;
    newsletterSent: string;
  };
  nav: {
    home: string;
    products: string;
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
  };
};

const navItems = [
  { key: "home", href: "" },
  { key: "products", href: "/products" },
  { key: "showrooms", href: "/showrooms" },
  { key: "blog", href: "/blog" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
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
}: {
  children: React.ReactNode;
  locale: Locale;
  labels: PublicShellLabels;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [activeCatalog, setActiveCatalog] = useState<{ mode: CatalogMode; key: string }>({
    mode: "brands",
    key: brandCatalog[0]?.key ?? "all",
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

  const brandSections: BrandSection[] = brandCatalog.map((brand) => {
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

  const typeSections: TypeSection[] = typeCatalogSections.map((section) => {
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
          <Link href={`/${locale}`} className="group flex shrink-0 flex-col">
            <span className="font-heading text-2xl font-bold leading-none text-primary transition-colors group-hover:text-primary-container">
              {labels.common.brand}
            </span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
              {labels.common.tagline}
            </span>
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
                  className={`nav-link-pd group relative bg-transparent px-2 ${
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
            <Link href={`/${locale}/contact`} className="button-pd hidden md:inline-flex">
              <Phone className="size-4" />
              {labels.nav.quote}
            </Link>
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
              className={`inline-flex h-full min-w-[228px] items-center gap-3 px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 ${
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
                  className={`whitespace-nowrap rounded-[var(--radius-control)] px-3 py-2 text-sm font-bold transition hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 xl:px-4 ${
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
                  className="nav-link-pd flex min-h-11 w-full"
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
              <Link href={`/${locale}/contact`} className="button-pd mt-2" onClick={() => setOpen(false)}>
                {labels.nav.quote}
                <ArrowRight className="size-4" />
              </Link>
            </nav>
          </div>
        ) : null}
      </header>

      {children}

      <footer className="public-footer py-16">
        <div className="container-pd grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <h2 className="font-heading text-2xl font-bold">{labels.common.brand}</h2>
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
    </div>
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
