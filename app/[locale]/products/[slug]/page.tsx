import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, MapPin, Ruler } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { getProductBySlug, localized, products, withLocale } from "@/lib/showroom-data";
import { QuoteForm } from "@/components/showroom/quote-form";
import { SocialShare } from "@/components/showroom/social-share";
import { ProductCard } from "@/components/showroom/product-card";
import {
  ProductGallery,
  ProductInformationTabs,
  SaveSelectionButton,
} from "@/components/showroom/product-detail-experience";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: localized(product.name, locale),
    description: localized(product.summary, locale),
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const t = await getTranslations("products");
  const contact = await getTranslations("contact");
  const common = await getTranslations("common");
  const related = products.filter((item) => item.slug !== product.slug).slice(0, 3);

  return (
    <main>
      <section className="container-pd grid gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <ProductGallery
          product={product}
          locale={locale}
          labels={{
            galleryLabel: t("galleryLabel"),
            enlargeImage: t("enlargeImage"),
            galleryHelp: t("galleryHelp"),
          }}
        />
        <div className="reveal-soft lg:pt-8">
          <p className="label-pd">{t("collectionLabel")}</p>
          <h1 className="mt-3 font-heading text-5xl font-bold text-primary">
            {localized(product.name, locale)}
          </h1>
          <p className="mt-2 text-sm text-secondary">
            {product.referenceCode} · {localized(product.category, locale)}
          </p>
          <div className="mt-6 flex items-baseline gap-3 border-y border-outline-variant/30 py-5">
            <strong className="text-2xl text-primary">{localized(product.price, locale)}</strong>
            {"oldPrice" in product && product.oldPrice ? (
              <span className="text-sm text-outline line-through">{localized(product.oldPrice, locale)}</span>
            ) : null}
          </div>
          <p className="mt-5 text-lg leading-8 text-secondary">{localized(product.summary, locale)}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {product.specs.slice(0, 4).map((spec) => (
              <div key={localized(spec.label, locale)} className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                <div className="flex gap-3">
                  <Ruler className="size-5 text-primary" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-outline">
                      {localized(spec.label, locale)}
                    </p>
                    <p className="font-semibold">{localized(spec.value, locale)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-3">
            <Link href={withLocale(locale, `/contact?product=${product.slug}`)} className="button-pd min-h-12">
              {t("quoteNow")}
              <ArrowRight className="size-4" />
            </Link>
            <div className="grid gap-3 sm:grid-cols-2">
              <SaveSelectionButton label={t("saveSelection")} savedLabel={t("savedSelection")} />
              <Link href={withLocale(locale, "/showrooms")} className="button-pd-outline">
                <MapPin className="size-4" />
                {t("viewInShowroom")}
              </Link>
            </div>
          </div>
          <div className="mt-6">
            <SocialShare label={common("share")} copyLabel={common("copyLink")} url={`/${locale}/products/${product.slug}`} />
          </div>
        </div>
      </section>

      <section className="container-pd border-t border-outline-variant/30 py-16">
        <ProductInformationTabs
          product={product}
          locale={locale}
          labels={{
            galleryLabel: t("galleryLabel"),
            enlargeImage: t("enlargeImage"),
            galleryHelp: t("galleryHelp"),
            tabsOverview: t("tabsOverview"),
            tabsSpecifications: t("tabsSpecifications"),
            tabsMaterials: t("tabsMaterials"),
            tabsDimensionsCare: t("tabsDimensionsCare"),
            tabsDeliveryWarranty: t("tabsDeliveryWarranty"),
            overviewTitle: t("overviewTitle"),
            specificationsTitle: t("specificationsTitle"),
            materialsTitle: t("materialsTitle"),
            dimensionsCareTitle: t("dimensionsCareTitle"),
            deliveryWarrantyTitle: t("deliveryWarrantyTitle"),
            materialsLead: t("materialsLead"),
            dimensionsCareLead: t("dimensionsCareLead"),
            deliveryWarrantyLead: t("deliveryWarrantyLead"),
            craftsmanshipNote: t("craftsmanshipNote"),
            careNote: t("careNote"),
            deliveryNote: t("deliveryNote"),
            warrantyNote: t("warrantyNote"),
          }}
        />
      </section>

      <section className="container-pd grid gap-8 py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl bg-primary p-8 text-white shadow-[0_22px_54px_rgba(68,42,34,0.16)]">
          <h2 className="font-heading text-3xl font-semibold">{contact("formTitle")}</h2>
          <p className="mt-4 text-white/75">{contact("lead")}</p>
        </div>
        <QuoteForm
          locale={locale}
          sourcePath={`/${locale}/products/${product.slug}`}
          productId={product.slug}
          labels={{
            formTitle: contact("formTitle"),
            name: contact("name"),
            phone: contact("phone"),
            email: contact("email"),
            company: contact("company"),
            service: contact("service"),
            message: contact("message"),
            submit: contact("submit"),
            sending: contact("sending"),
            responseTime: contact("responseTime"),
            honeypot: contact("honeypot"),
          }}
        />
      </section>

      <section className="container-pd pb-20">
        <h2 className="font-heading text-3xl font-semibold text-primary">{t("related")}</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {related.map((item) => (
            <ProductCard key={item.slug} product={item} locale={locale} detailsLabel={common("explore")} compact />
          ))}
        </div>
      </section>
    </main>
  );
}
