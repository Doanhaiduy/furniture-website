import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { isLocale, routing, type Locale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

import { PublicShell } from "@/components/showroom/public-shell";
import { createPublicClient } from "@/lib/supabase/server";
import { getPublicSiteSettings } from "@/lib/supabase/queries";
import { getPublicBrands } from "@/lib/supabase/brands-mutations";

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

  const supabase = createPublicClient();
  const siteSettings = await getPublicSiteSettings(supabase, locale as "vi" | "en");

  return {
    title: siteSettings.seoDefaultTitle || t("homeTitle"),
    description: siteSettings.seoDefaultDescription || t("homeDescription"),
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

  const supabase = createPublicClient();
  const siteSettings = await getPublicSiteSettings(supabase, locale as "vi" | "en");
  const brandsRes = await getPublicBrands();
  const publicBrands = brandsRes.success ? brandsRes.data : [];

  const { getCategories, getProducts } = await import("@/lib/supabase/queries");
  const publicCategories = await getCategories(supabase, locale as "vi" | "en");
  const publicProducts = await getProducts(supabase, {
    locale: locale as "vi" | "en",
    limit: 1000,
  });

  return (
    <NextIntlClientProvider messages={messages}>
      <PublicShell
        locale={locale as Locale}
        siteSettings={siteSettings}
        brands={publicBrands}
        categories={publicCategories}
        products={publicProducts}
        labels={{
          common: {
            brand: common("brand"),
            tagline: common("tagline"),
            newsletterSent: common("newsletterSent"),
          },
          nav: {
            home: nav("home"),
            products: nav("products"),
            promotions: nav("promotions"),
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
            zalo: nav("zalo"),
            messenger: nav("messenger"),
            hotline: nav("hotline"),
          },
        }}
      >
        {children}
      </PublicShell>
    </NextIntlClientProvider>
  );
}
