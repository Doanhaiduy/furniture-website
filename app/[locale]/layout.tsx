import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { isLocale, routing, type Locale } from "@/i18n/routing";
import { PublicShell } from "@/components/showroom/public-shell";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        vi: "/vi",
        en: "/en",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const nav = await getTranslations("nav");
  const common = await getTranslations("common");

  return (
    <NextIntlClientProvider messages={messages}>
      <PublicShell
        locale={locale as Locale}
        labels={{
          common: {
            brand: common("brand"),
            tagline: common("tagline"),
            newsletterSent: common("newsletterSent"),
          },
          nav: {
            home: nav("home"),
            products: nav("products"),
            showrooms: nav("showrooms"),
            blog: nav("blog"),
            about: nav("about"),
            contact: nav("contact"),
            quote: nav("quote"),
            menu: nav("menu"),
            close: nav("close"),
            catalog: nav("catalog"),
            catalogAll: nav("catalogAll"),
            catalogHint: nav("catalogHint"),
            catalogPopular: nav("catalogPopular"),
            catalogViewGroup: nav("catalogViewGroup"),
          },
        }}
      >
        {children}
      </PublicShell>
    </NextIntlClientProvider>
  );
}
