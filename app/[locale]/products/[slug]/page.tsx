/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, MapPin, Ruler } from "lucide-react";
import { type Locale, isLocale } from "@/i18n/routing";
import { getProductBySlug as getMockProductBySlug, products } from "@/lib/showroom-mock-fallback";
import { localized, withLocale } from "@/lib/showroom-constants";
import { QuoteForm } from "@/components/showroom/quote-form";
import { SocialShare } from "@/components/showroom/social-share";
import { ProductCard } from "@/components/showroom/product-card";
import {
  ProductGallery,
  ProductInformationTabs,
  SaveSelectionButton,
  SaveSelectionButton as SavedSelectionButtonProps,
  SaveSelectionButton as SavedSelectionButtonPropsTwo,
  ProductInformationTabs as ProductInfoTabsProps,
} from "@/components/showroom/product-detail-experience";
import { createClient } from "@/lib/supabase/server";
import { getProductBySlug as getDBProductBySlug, getProducts, mapDBProductToPublicProduct } from "@/lib/supabase/queries";
import { generatePageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const supabase = await createClient();
  const dbProduct = await getDBProductBySlug(supabase, slug, locale).catch(() => null);
  let product: any = dbProduct ? mapDBProductToPublicProduct(dbProduct, locale) : null;
  if (!product) {
    product = getMockProductBySlug(slug) || null;
  }
  if (!product) return {};
  return generatePageMetadata({
    title: localized(product.name, locale),
    description: localized(product.summary, locale),
    path: `/${locale}/products/${slug}`,
    imageUrl: product.image,
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const supabase = await createClient();
  const dbProduct = await getDBProductBySlug(supabase, slug, locale).catch(() => null);
  let product: any = dbProduct ? mapDBProductToPublicProduct(dbProduct, locale) : null;
  if (!product) {
    product = getMockProductBySlug(slug) || null;
  }
  if (!product) notFound();
  
  const t = await getTranslations("products");
  const contact = await getTranslations("contact");
  const common = await getTranslations("common");
  
  let related: any[] = [];
  if (dbProduct?.category?.slug) {
    const dbRelated = await getProducts(supabase, {
      locale,
      categorySlug: dbProduct.category.slug,
      limit: 10,
    }).catch(() => []);
    
    related = dbRelated
      .map((p: any) => mapDBProductToPublicProduct(p, locale))
      .filter((item: any) => item.slug !== product.slug)
      .slice(0, 3);
  }
  if (related.length === 0) {
    related = products.filter((item) => item.slug !== product.slug).slice(0, 3);
  }

  return (
    <main>
      <section className="container-pd public-page-header grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <ProductGallery
          product={product}
          locale={locale}
          labels={{
            galleryLabel: t("galleryLabel"),
            enlargeImage: t("enlargeImage"),
            galleryHelp: t("galleryHelp"),
          }}
        />
        <div className="surface-panel reveal-soft p-5 md:p-6 lg:p-8">
          <p className="label-pd">{t("collectionLabel")}</p>
          <h1 className="type-page-title mt-3 text-primary">
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
            {product.specs.slice(0, 4).map((spec: any) => (
              <div key={localized(spec.label, locale)} className="surface-card p-3">
                <div className="flex gap-3">
                  <Ruler className="size-5 text-primary" />
                  <div>
                    <p className="type-label text-outline">
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
              <SaveSelectionButton label={t("saveSelection") as any} savedLabel={t("savedSelection") as any} />
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
        <div className="surface-inverse p-8">
          <h2 className="type-section-title text-white">{contact("formTitle")}</h2>
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
        submitError: contact("submitError"),
          }}
        />
      </section>

      <section className="container-pd pb-20">
        <h2 className="type-section-title text-primary">{t("related")}</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {related.map((item) => (
            <ProductCard key={item.slug} product={item} locale={locale} detailsLabel={common("explore")} compact />
          ))}
        </div>
      </section>
    </main>
  );
}
