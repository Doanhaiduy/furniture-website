import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { isLocale, routing, type Locale } from "@/i18n/routing";

// force-dynamic is intentional: the PublicShell client component tree calls
// useSearchParams() without a Suspense boundary. Removing this causes a build
// failure ("useSearchParams() should be wrapped in a suspense boundary").
// Child pages declare their own revalidate but it is overridden by this layout;
// see docs/seo-notes.md for the ISR upgrade path (requires adding Suspense boundaries).
export const revalidate = 300;

import { PublicShell } from "@/components/showroom/public-shell";
import { createPublicClient } from "@/lib/supabase/server";
import { getPublicSiteSettings, getPublicSocialLinks } from "@/lib/supabase/queries";
import { getPublicBrands } from "@/lib/supabase/brands-mutations";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationSchema, webSiteSchema } from "@/lib/structured-data";

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

  // NOTE: canonical/alternates are intentionally NOT set here. Metadata from a
  // layout cascades to every child page; a canonical of `/${locale}` would make
  // every listing page (products, blog, ...) canonicalize to the homepage. Each
  // page sets its own canonical via generatePageMetadata instead.
  return {
    title: siteSettings.seoDefaultTitle || t("homeTitle"),
    description: siteSettings.seoDefaultDescription || t("homeDescription"),
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
  const { getCategories, getProducts, maxPublicProductLookupRows } = await import("@/lib/supabase/queries");

  // Fetch all layout data in parallel — these are independent queries and
  // running them sequentially added a request waterfall to every public page (TTFB).
  const [siteSettings, socialLinks, brandsRes, publicCategories, publicProducts] =
    await Promise.all([
      getPublicSiteSettings(supabase, locale as "vi" | "en"),
      getPublicSocialLinks(supabase),
      getPublicBrands(),
      getCategories(supabase, locale as "vi" | "en").catch(() => []),
      // The header's brand mega-menu derives each brand's product list by
      // client-filtering this single shared product list (see public-shell.tsx).
      // A small limit (was 100) meant any brand whose products fell outside the
      // global featured/newest top-100 showed "no products" even though it had
      // some. Load the full catalog window so every brand is represented.
      getProducts(supabase, { locale: locale as "vi" | "en", limit: maxPublicProductLookupRows }).catch(() => []),
    ]);
  const publicBrands = brandsRes.success ? brandsRes.data : [];

  // Social profile URLs feed Organization.sameAs for entity disambiguation.
  const sameAs = (socialLinks || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((s: any) => s?.url && s?.isEnabled !== false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((s: any) => s.url as string);

  return (
    <NextIntlClientProvider messages={messages}>
      {/* The root <html lang> is fixed to "vi" (it lives above the [locale]
          segment). Correct it for non-default locales so assistive tech and
          crawlers see the right language. hreflang alternates remain the
          primary signal and are emitted per page. */}
      {locale !== routing.defaultLocale && (
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.lang=${JSON.stringify(locale)}`,
          }}
        />
      )}
      <JsonLd
        data={[
          organizationSchema({ telephone: siteSettings.contactPhone, sameAs }),
          webSiteSchema(locale),
        ]}
      />
      <PublicShell
        locale={locale as Locale}
        siteSettings={siteSettings}
        brands={publicBrands}
        categories={publicCategories}
        products={publicProducts}
        socialLinks={socialLinks}
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
