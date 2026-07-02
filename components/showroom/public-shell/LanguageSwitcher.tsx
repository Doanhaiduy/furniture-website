"use client";

import Link from "next/link";
import type { Locale } from "@/i18n/routing";

export function LanguageSwitcher({
  locale,
  localeHref,
}: {
  locale: Locale;
  localeHref: (targetLocale: Locale) => string;
}) {
  return (
    <div className="chip-pd flex">
      <Link
        href={localeHref("vi")}
        className={`transition-colors ${
          locale === "vi" ? "text-primary" : "text-outline hover:text-primary"
        }`}
      >
        VI
      </Link>
      <span className="mx-2 text-outline-variant">|</span>
      <Link
        href={localeHref("en")}
        className={`transition-colors ${
          locale === "en" ? "text-primary" : "text-outline hover:text-primary"
        }`}
      >
        EN
      </Link>
    </div>
  );
}
