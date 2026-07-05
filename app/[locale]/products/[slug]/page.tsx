/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { type Locale, isLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

import { getProductBySlug as getMockProductBySlug, products } from "@/lib/showroom-mock-fallback";
import { localized } from "@/lib/showroom-constants";
import { QuoteForm } from "@/components/showroom/quote-form";
import { SocialShare } from "@/components/showroom/social-share";
import { ProductCard } from "@/components/showroom/product-card";
import {
  ProductGallery,
  ProductInformationTabs,
  ProductActionGroup,
  ProductTrustMetrics,
} from "@/components/showroom/product-detail-experience";
import { createPublicClient } from "@/lib/supabase/server";
import { getProductBySlug as getDBProductBySlug, getProducts, mapDBProductToPublicProduct, getPublicSiteSettings, getShowrooms } from "@/lib/supabase/queries";
import { generatePageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const supabase = createPublicClient();
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
  const supabase = createPublicClient();
  const settings = await getPublicSiteSettings(supabase, locale);
  const dbProduct = await getDBProductBySlug(supabase, slug, locale).catch(() => null);
  const dbShowrooms = await getShowrooms(supabase, locale).catch(() => []);
  let product: any = null;
  if (dbProduct) {
    // Promo pricing (item 1): getDBProductBySlug already derives promo_price_min/max
    // from the product's active Promotion via the same DB function the list page uses
    // (get_active_discount_percentage), so list and detail can never disagree.
    product = mapDBProductToPublicProduct(dbProduct, locale);
  }
  if (!product) {
    product = getMockProductBySlug(slug) || null;
  }
  if (!product) notFound();

  let showroomName = "";
  if (product.showroomCode) {
    const matchedShowroom = dbShowrooms.find((s: any) => s.code === product.showroomCode);
    if (matchedShowroom) {
      showroomName = matchedShowroom.name || "";
    }
  }

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
    <main className="bg-white min-h-screen">
      {/* 1. HERO SECTION (GALLERY & BRIEF SUMMARY) */}
      <section className="container-pd py-10 grid gap-10 lg:grid-cols-[1.35fr_0.65fr] items-start">
        <ProductGallery
          product={product}
          locale={locale}
          labels={{
            galleryLabel: t("galleryLabel"),
            enlargeImage: t("enlargeImage"),
            galleryHelp: t("galleryHelp"),
          }}
        />

        {/* Right Info Sidebar */}
        <div className="surface-panel p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
              {localized(product.category, locale)}
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-800 mt-2 tracking-tight leading-tight">
              {localized(product.name, locale)}
            </h1>
            <p className="mt-1.5 text-xs text-slate-400 font-mono">
              Ref: {product.referenceCode || product.slug.toUpperCase()}
            </p>

            {/* Price section with context */}
            <div className="mt-5 border-y border-slate-100 py-4 flex flex-col gap-0.5">
              <div className="flex items-baseline gap-2.5">
                <strong className="text-xl sm:text-2xl font-bold text-slate-800">
                  {localized(product.price, locale)}
                </strong>
                {"oldPrice" in product && product.oldPrice ? (
                  <span className="text-sm text-slate-400 line-through">
                    {localized(product.oldPrice, locale)}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] text-slate-400">
                {locale === "vi" ? "* Giá tham khảo sản phẩm tiêu chuẩn (Chưa bao gồm VAT)" : "* Price for standard model (Excluding VAT)"}
              </span>
            </div>

            <p className="mt-5 text-xs sm:text-sm leading-relaxed text-slate-500 font-light">
              {localized(product.summary, locale)}
            </p>

            {/* Minimal Specs List */}
            <div className="mt-6 border-t border-slate-100 pt-5 space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {locale === "vi" ? "Thông số cơ bản" : "Key Specifications"}
              </h3>
              <div className="grid gap-y-2.5 text-xs sm:text-sm">
                {product.specs.slice(0, 4).map((spec: any) => (
                  <div key={localized(spec.label, locale)} className="flex items-start justify-between gap-x-6 border-b border-dashed border-slate-100 pb-2">
                    <span className="shrink-0 text-slate-500 font-light">{localized(spec.label, locale)}</span>
                    <span className="min-w-0 text-right font-semibold text-slate-800 line-clamp-3">{String(localized(spec.value, locale) ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Group with high contrast hierarchy */}
          <ProductActionGroup
            product={product}
            locale={locale}
            labels={{
              quoteNow: t("quoteNow"),
              saveSelection: t("saveSelection"),
              savedSelection: t("savedSelection"),
              viewInShowroom: t("viewInShowroom"),
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

          {/* Trust badges and showroom availability */}
          <ProductTrustMetrics locale={locale} showroomName={showroomName} />

          {/* Social share */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <SocialShare label={common("share")} copyLabel={common("copyLink")} copiedLabel={common("copied")} url={`/${locale}/products/${product.slug}`} title={localized(product.name, locale)} />
          </div>
        </div>
      </section>

      {/* 2. SPECIFICATION & CRAFTSMANSHIP TABS */}
      <section className="container-pd border-t border-slate-100 py-16">
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

      {/* 3. PERSONAL CONSULTATION LOUNGE (REDESIGNED INQUIRY BLOCK) */}
      <section className="container-pd grid gap-8 py-20 lg:grid-cols-[0.8fr_1.2fr] items-stretch border-t border-slate-100 bg-slate-50/20">
        <div className="bg-primary text-white p-8 md:p-10 rounded-2xl flex flex-col justify-between border border-primary/20 shadow-xl">
          <div className="space-y-4">
            <span className="text-[10px] font-mono tracking-widest text-brand-wood-soft uppercase">
              {locale === "vi" ? "TƯ VẤN CÁ NHÂN HÓA" : "PERSONAL CONSULTATION"}
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-white">
              {contact("formTitle")}
            </h2>
            <p className="text-brand-wood-soft font-light text-xs sm:text-sm leading-relaxed">
              {locale === "vi"
                ? "Đặt lịch hẹn tư vấn thiết kế chuyên sâu hoặc yêu cầu báo giá vật liệu tùy chỉnh riêng biệt cho dự án của bạn."
                : "Schedule a customized design consultation or request specific material options tailored to your luxury project."}
            </p>
          </div>

          <div className="pt-8 border-t border-brand-wood-strong space-y-2 text-xs">
            <p className="text-brand-wood-soft uppercase tracking-widest font-mono text-[9px]">
              {locale === "vi" ? "ĐƯỜNG DÂY NÓNG HỖ TRỢ" : "HOTLINE SUPPORT"}
            </p>
            <p className="text-base font-bold text-white">{settings.contactPhone}</p>
            <p className="text-brand-wood-soft/80 font-light">
              {locale === "vi" ? "Tất cả các ngày từ 8:00 - 21:00" : "Open daily from 8:00 AM to 9:00 PM"}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-lg flex flex-col justify-center">
          <QuoteForm
            locale={locale}
            sourcePath={`/${locale}/products/${product.slug}`}
            productId={product.slug}
            categoryId={product.categoryKey}
            hideTitle={true}
            productsForQuote={[
              {
                slug: product.slug,
                name: localized(product.name, locale),
                category_slug: product.categoryKey,
                category_name: localized(product.category, locale),
              }
            ]}
            categoriesForQuote={
              product.categoryKey
                ? [{ slug: product.categoryKey, name: localized(product.category, locale) }]
                : []
            }
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
        </div>
      </section>

      {/* 4. RELATED PIECES SECTION */}
      <section className="container-pd pb-24 border-t border-slate-100 pt-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline border-b border-slate-100 pb-4 mb-8">
          <h2 className="font-heading text-xl sm:text-2xl font-semibold tracking-tight text-slate-800">
            {t("related")}
          </h2>
          <span className="text-xs text-slate-400 font-mono mt-1 sm:mt-0">
            {locale === "vi" ? "Các thiết kế đồng bộ khuyên dùng" : "Coordinating pieces recommended by curators"}
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {related.map((item) => (
            <ProductCard key={item.slug} product={item} locale={locale} detailsLabel={common("explore")} compact />
          ))}
        </div>
      </section>
    </main>
  );
}
 