"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Menu, X, Home, ChevronDown, ChevronRight, Layers3, ArrowRight } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import type { PublicSiteSettings } from "@/lib/supabase/queries";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { RemoteImage } from "../remote-image";

type NavigationBarProps = {
  locale: Locale;
  pathname: string;
  siteSettings?: PublicSiteSettings;
  labels: {
    common: {
      brand: string;
    };
    nav: Record<string, string>;
  };
  navItems: readonly { key: string; href: string }[];
  brandSections: any[];
  typeSections: any[];
  linkHref: (href: string) => string;
  localeHref: (targetLocale: Locale) => string;
  open: boolean;
  setOpen: (open: boolean) => void;
};

type CatalogMode = "brands" | "types";

export function NavigationBar({
  locale,
  pathname,
  siteSettings,
  labels,
  navItems,
  brandSections,
  typeSections,
  linkHref,
  localeHref,
  open,
  setOpen,
}: NavigationBarProps) {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [activeCatalog, setActiveCatalog] = useState<{ mode: CatalogMode; key: string }>({
    mode: "brands",
    key: brandSections && brandSections.length > 0 ? brandSections[0].key : "all",
  });

  const catalogCloseTimer = useRef<number | null>(null);
  const catalogSwitchTimer = useRef<number | null>(null);

  const cancelCatalogClose = () => {
    if (catalogCloseTimer.current) {
      window.clearTimeout(catalogCloseTimer.current);
      catalogCloseTimer.current = null;
    }
  };

  const cancelCatalogSwitch = () => {
    if (catalogSwitchTimer.current) {
      window.clearTimeout(catalogSwitchTimer.current);
      catalogSwitchTimer.current = null;
    }
  };

  const openCatalog = (mode: CatalogMode, key: string, immediate = false) => {
    cancelCatalogClose();
    cancelCatalogSwitch();

    if (immediate || !catalogOpen || activeCatalog.mode !== mode) {
      setActiveCatalog({ mode, key });
      setCatalogOpen(true);
    } else {
      catalogSwitchTimer.current = window.setTimeout(() => {
        setActiveCatalog({ mode, key });
      }, 120);
    }
  };

  const closeCatalog = () => {
    cancelCatalogClose();
    cancelCatalogSwitch();
    setCatalogOpen(false);
  };

  const scheduleCatalogClose = () => {
    cancelCatalogClose();
    catalogCloseTimer.current = window.setTimeout(() => {
      cancelCatalogSwitch();
      setCatalogOpen(false);
    }, 150);
  };

  const activeBrand = brandSections.find((section) => section.key === activeCatalog.key) ?? brandSections[0];
  const activeType = typeSections.find((section) => section.key === activeCatalog.key) ?? typeSections[0];

  return (
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
              src={siteSettings?.logoUrl ? (siteSettings.logoUrl.startsWith("http://local-assets") ? siteSettings.logoUrl.replace("http://local-assets", "") : siteSettings.logoUrl) : "/logo-final.svg"}
              alt={siteSettings?.brandName || labels.common.brand}
              className="h-14 w-14 object-contain transition-transform group-hover:scale-[1.03]"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/80">
              {locale === "vi" ? "Showroom Nội Thất" : "Interior Showroom"}
            </span>
            <span className="font-heading text-base sm:text-lg md:text-xl font-extrabold leading-none text-primary transition-colors group-hover:text-primary-container tracking-wider">
              {locale === "vi" ? "PHƯƠNG ĐÔNG" : "PHUONG DONG"}
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
          <LanguageSwitcher locale={locale} localeHref={localeHref} />
          <button
            type="button"
            aria-label={open ? labels.nav.close : labels.nav.menu}
            className="btn-pd-icon lg:hidden"
            onClick={() => setOpen(!open)}
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
                    href={linkHref("/products")}
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

                <div className="py-5 pl-6" onMouseEnter={cancelCatalogSwitch}>
                  {activeCatalog.key === "all" ? (
                    <>
                      <div className="mb-5 flex items-end justify-between gap-6">
                        <div>
                          <p className="label-pd">{labels.nav.catalogAll}</p>
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">{labels.nav.catalogHint}</p>
                        </div>
                        <Link href={linkHref("/products")} className="button-pd-outline shrink-0" onClick={closeCatalog}>
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
              <div className="container-pd grid min-h-[292px] gap-6 py-5 lg:grid-cols-[260px_1fr]" onMouseEnter={cancelCatalogSwitch}>
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
                <div className="w-full">
                  {activeType.columns.length === 0 && activeType.products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[200px] p-6 text-center bg-surface-container-low rounded-[var(--radius-control)] border border-outline-variant/15">
                      <Layers3 className="size-10 text-outline/40 mb-3" />
                      <p className="text-sm font-semibold text-secondary">
                        {locale === "vi" ? "Chưa có sản phẩm nào cho danh mục này" : "No products available in this category"}
                      </p>
                      <p className="text-xs text-outline mt-1">
                        {locale === "vi" ? "Vui lòng quay lại sau." : "Please check back later."}
                      </p>
                    </div>
                  ) : (
                    <div className={`grid gap-5 ${activeType.products.length > 0 ? "xl:grid-cols-[1.45fr_0.55fr]" : "xl:grid-cols-1"}`}>
                      {activeType.columns.length > 0 ? (
                        <div className={`grid gap-4 ${activeType.columns.length > 1 ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                          {activeType.columns.map((column: any) => (
                            <div key={column.title}>
                              <p className="label-pd">{column.title}</p>
                              <div className={`mt-3 grid gap-2 ${activeType.columns.length === 1 && column.items.length > 3 ? "sm:grid-cols-2" : ""}`}>
                                {column.items.map((item: any) => (
                                  <Link
                                    key={`${activeType.key}-${item.href}-${item.label}`}
                                    href={item.href}
                                    className="nav-link-pd surface-card group flex min-h-11 items-center gap-1.5 px-3 py-2 text-[13px] text-on-surface hover:text-primary transition-colors leading-snug"
                                    onClick={closeCatalog}
                                  >
                                    <ChevronRight className="size-3.5 shrink-0 text-primary transition group-hover:translate-x-0.5" />
                                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                                    {typeof item.count === "number" ? (
                                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                                        {item.count}
                                      </span>
                                    ) : null}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {activeType.products.length > 0 ? (
                        <div>
                          <p className="label-pd">{labels.nav.catalogPopular}</p>
                          <div className="mt-3 grid gap-2">
                            {activeType.products.map((item: any) => (
                              <Link
                                key={`${activeType.key}-${item.href}`}
                                href={item.href}
                                className="nav-link-pd surface-card group flex min-h-11 items-center justify-between px-3 py-2 text-primary hover:text-primary-container transition-colors text-[13px]"
                                onClick={closeCatalog}
                              >
                                <span className="line-clamp-2 pr-2 font-medium">{item.label}</span>
                                <ArrowRight className="size-4 shrink-0 transition group-hover:translate-x-0.5" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}

function BrandMegaContent({
  section,
  labels,
  closeCatalog,
}: {
  section?: any;
  labels: any;
  closeCatalog: () => void;
}) {
  if (!section) return null;
  const hasProducts = section.items && section.items.length > 0;

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
        {hasProducts ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {section.items.map((item: any) => (
              <Link
                key={`${section.key}-${item.href}-${item.label}`}
                href={item.href}
                className="nav-link-pd surface-card group flex min-h-11 items-center justify-between px-3 py-2 text-[13px] text-on-surface hover:text-primary transition-colors leading-snug"
                onClick={closeCatalog}
              >
                <span className="line-clamp-2 pr-2 font-medium">{item.label}</span>
                <ChevronRight className="size-3.5 text-primary shrink-0 transition group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[calc(100%-24px)] min-h-[200px] p-6 text-center bg-surface-container-low rounded-[var(--radius-control)] border border-outline-variant/15">
            <Layers3 className="size-10 text-outline/40 mb-3" />
            <p className="text-sm font-semibold text-secondary">
              Chưa có sản phẩm nào cho hãng này
            </p>
            <p className="text-xs text-outline mt-1">
              Vui lòng quay lại sau.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
 