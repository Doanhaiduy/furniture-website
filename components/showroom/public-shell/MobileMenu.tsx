"use client";

import Link from "next/link";
import type { Locale } from "@/i18n/routing";

type MobileMenuProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  locale: Locale;
  linkHref: (href: string) => string;
  labels: {
    nav: Record<string, string>;
  };
  navItems: readonly { key: string; href: string }[];
  brandSections: any[];
  typeSections: any[];
};

export function MobileMenu({
  open,
  setOpen,
  locale,
  linkHref,
  labels,
  navItems,
  brandSections,
  typeSections,
}: MobileMenuProps) {
  if (!open) return null;

  return (
    <div className="public-mega-menu animate-in fade-in slide-in-from-top-2 border-t duration-200 motion-reduce:animate-none lg:hidden fixed top-20 left-0 right-0 bottom-0 overflow-y-auto z-50 text-on-surface bg-surface">
      <nav className="container-pd grid gap-2 py-4" aria-label="Mobile">
        {navItems.map((item) => (
          <Link
            key={item.key}
            href={linkHref(item.href)}
            className="nav-link-pd flex min-h-11 w-full uppercase tracking-wider items-center"
            onClick={() => setOpen(false)}
          >
            {labels.nav[item.key]}
          </Link>
        ))}
        <div className="surface-panel p-3 rounded-lg border border-outline-variant/10">
          <p className="label-pd font-bold text-xs uppercase tracking-wider">{labels.nav.catalog}</p>
          <div className="mt-3 grid gap-1 sm:grid-cols-2">
            {brandSections.slice(0, 6).map((section) => (
              <Link
                key={section.key}
                href={section.href}
                className="nav-link-pd min-h-9 px-3 py-2 text-secondary block"
                onClick={() => setOpen(false)}
              >
                {section.title}
              </Link>
            ))}
          </div>
        </div>
        <div className="surface-panel p-3 rounded-lg border border-outline-variant/10 mt-2">
          <p className="label-pd font-bold text-xs uppercase tracking-wider">{labels.nav.catalogPopular}</p>
          <div className="mt-3 grid gap-1">
            {typeSections.map((section) => (
              <Link
                key={section.key}
                href={section.href}
                className="nav-link-pd min-h-9 px-3 py-2 text-secondary block"
                onClick={() => setOpen(false)}
              >
                {section.title}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
