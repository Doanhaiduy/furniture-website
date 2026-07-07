import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail, MapPin, Phone } from "lucide-react";
import { type Locale, isLocale } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { imageAssets } from "@/lib/showroom-constants";
import { QuoteForm, type ProductForQuote } from "@/components/showroom/quote-form";
import { RemoteImage } from "@/components/showroom/remote-image";
import { SocialIcon } from "@/components/showroom/social-icons";
import { createPublicClient } from "@/lib/supabase/server";
import { getShowrooms, getProducts, getCategories, getPublicSiteSettings, getPublicSocialLinks } from "@/lib/supabase/queries";
import { generatePageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "contact" });
  return generatePageMetadata({
    title: t("title"),
    description: t("lead"),
    path: `/${locale}/contact`,
  });
}

interface DisplayShowroom {
  code: string;
  name: string;
  address: string;
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ product?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { product } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  const supabase = createPublicClient();
  const settings = await getPublicSiteSettings(supabase, locale);
  const socialLinks = (await getPublicSocialLinks(supabase).catch(() => [])).filter((s) => s.url && s.isEnabled !== false);

  // Fetch products from DB for the product selector in QuoteForm
   
  const rawProducts = await getProducts(supabase, { locale, limit: 200 }).catch(() => []);
  const productsForQuote: ProductForQuote[] = rawProducts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((p: any) => p.slug)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((p: any) => ({
      slug: p.slug as string,
      name: (typeof p.name === "object" && p.name ? (p.name[locale] || p.name.vi || p.name.en) : (p.name as string)) || p.slug,
      summary: (typeof p.summary === "object" && p.summary ? (p.summary[locale] || p.summary.vi) : p.summary) as string | undefined,
      category_slug: p.category_slug as string | null | undefined,
      category_name: (typeof p.category_name === "object" && p.category_name ? (p.category_name[locale] || p.category_name.vi) : p.category_name) as string | null | undefined,
    }));

  const dbCategories = await getCategories(supabase, locale).catch(() => []);
   
  const categoriesForQuote = dbCategories
    .filter((c: any) => c.parentId !== null)
    .map((c: any) => ({
      slug: c.slug,
      name: c.name,
    }));

  const dbShowrooms = await getShowrooms(supabase, locale).catch(() => []);
  const displayShowrooms: DisplayShowroom[] = dbShowrooms.length > 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? dbShowrooms.map((s: any) => ({
        code: s.code || "",
        name: s.name || "",
        address: s.address || "",
      }))
    : [
        {
          code: "HN",
          name: locale === "vi" ? "Hà Nội - Flagship Store" : "Hanoi Flagship Store",
          address: locale === "vi" ? "123 Trần Duy Hưng, Cầu Giấy, Hà Nội" : "123 Tran Duy Hung, Cau Giay, Hanoi",
        },
        {
          code: "HCM",
          name: locale === "vi" ? "TP. Hồ Chí Minh" : "Ho Chi Minh City",
          address: locale === "vi" ? "456 Nguyễn Thị Minh Khai, Quận 1, TP. HCM" : "456 Nguyen Thi Minh Khai, District 1, HCMC",
        },
      ];

  return (
    <main>
      <section className="container-pd public-page-header text-center">
        <h1 className="type-page-title text-primary">{t("title")}</h1>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-secondary">{t("lead")}</p>
      </section>

      <section className="container-pd grid gap-8 pb-20 lg:grid-cols-[1.15fr_0.85fr]">
        <QuoteForm
          locale={locale}
          sourcePath={`/${locale}/contact`}
          productId={product}
          productsForQuote={productsForQuote}
          categoriesForQuote={categoriesForQuote}
          labels={{
            formTitle: t("formTitle"),
            name: t("name"),
            phone: t("phone"),
            email: t("email"),
            company: t("company"),
            service: t("service"),
            message: t("message"),
            submit: t("submit"),
            sending: t("sending"),
            responseTime: t("responseTime"),
            honeypot: t("honeypot"),
            submitError: t("submitError"),
          }}
        />
        <aside className="space-y-6">
          <div className="surface-soft p-6">
            <h2 className="type-section-title text-primary">
              {locale === "vi" ? "Thông tin liên hệ" : "Contact information"}
            </h2>
            <div className="mt-6 space-y-5">
              <p className="flex gap-3">
                <Phone className="size-5 text-primary" />
                <span><strong>Hotline</strong><br />{settings.contactPhone}</span>
              </p>
              <p className="flex gap-3">
                <Mail className="size-5 text-primary" />
                <span><strong>Email</strong><br />{settings.contactEmail}</span>
              </p>
              {settings.contactAddress ? (
                <p className="flex gap-3">
                  <MapPin className="size-5 text-primary" />
                  <span><strong>{locale === "vi" ? "Địa chỉ" : "Address"}</strong><br />{settings.contactAddress}</span>
                </p>
              ) : null}
              <div className="flex gap-3">
                <MapPin className="size-5 text-primary" />
                <div>
                  <strong>{locale === "vi" ? "Hệ thống showroom" : "Showroom network"}</strong>
                  {displayShowrooms.slice(0, 2).map((showroom) => (
                    <p key={showroom.code} className="mt-2 text-sm text-secondary">
                      {showroom.address}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {socialLinks.length > 0 ? (
              <div className="mt-6 border-t border-[var(--border-subtle,rgba(0,0,0,0.08))] pt-5">
                <strong className="text-sm">{locale === "vi" ? "Kết nối với chúng tôi" : "Connect with us"}</strong>
                <div className="mt-3 flex flex-wrap gap-3">
                  {socialLinks.map((link, idx) => (
                    <a
                      key={`${link.platform}-${idx}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label || link.platform}
                      title={link.label || link.platform}
                      className="inline-flex size-10 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary transition hover:bg-primary hover:text-white"
                    >
                      <SocialIcon platform={link.platform} />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <Link href={`/${locale}/showrooms`} className="interactive-card public-image-panel group relative block">
            <RemoteImage src={imageAssets.showroom} alt={displayShowrooms[0]?.name || ""} className="image-lift h-72 w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 p-6 text-white">
              <p className="label-pd text-white/75">{locale === "vi" ? "Ghé thăm chúng tôi" : "Visit us"}</p>
              <h3 className="type-section-title text-white">{locale === "vi" ? "Trải nghiệm thực tế" : "Real showroom experience"}</h3>
            </div>
          </Link>
        </aside>
      </section>
    </main>
  );
}
