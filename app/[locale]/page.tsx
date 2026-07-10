/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";

export const revalidate = 300; // 5-minute ISR — no searchParams used on this page
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, BadgeCheck, BookOpen, MapPin, Phone } from "lucide-react";
import { type Locale, isLocale } from "@/i18n/routing";
import { notFound } from "next/navigation";
import {
  imageAssets,
  localized,
  productGroups,
  trustBadges,
  withLocale,
} from "@/lib/showroom-constants";
import { showrooms, products as mockProducts } from "@/lib/showroom-mock-fallback";
import { QuoteForm } from "@/components/showroom/quote-form";
import { RemoteImage } from "@/components/showroom/remote-image";
import { HeroShowcase } from "@/components/showroom/hero-showcase";
import { ProductCard } from "@/components/showroom/product-card";
import { createPublicClient } from "@/lib/supabase/server";
import { getProducts, getBlogPosts, getShowrooms, mapDBProductToMock, getCategories, getContentPage } from "@/lib/supabase/queries";
import { getPublicBrands } from "@/lib/supabase/brands-mutations";
import { generatePageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "meta" });
  return generatePageMetadata({
    title: t("homeTitle"),
    description: t("homeDescription"),
    path: `/${locale}`,
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const home = await getTranslations("home");
  const common = await getTranslations("common");
  const contact = await getTranslations("contact");

  // Fetch dynamic data from local database
  const supabase = createPublicClient();
  const homePageContent = await getContentPage(supabase, "home", locale).catch(() => null);
  const bodyJson = homePageContent?.bodyJson || {};

  const featuredLimit = parseInt(bodyJson.featuredMaxItems || "4", 10) || 4;
  const blogLimit = parseInt(bodyJson.blogMaxPosts || "3", 10) || 3;

  const featuredVisible = bodyJson.featuredVisible !== undefined ? bodyJson.featuredVisible : true;
  const blogSectionVisible = bodyJson.blogSectionVisible !== undefined ? bodyJson.blogSectionVisible : true;
  const trustBadgesVisible = bodyJson.trustBadgesVisible !== undefined ? bodyJson.trustBadgesVisible : true;
  const showroomVisible = bodyJson.showroomVisible !== undefined ? bodyJson.showroomVisible : true;
  const aboutVisible = bodyJson.aboutVisible !== undefined ? bodyJson.aboutVisible : true;
  const quoteVisible = bodyJson.quoteVisible !== undefined ? bodyJson.quoteVisible : true;
  const heroVisible = bodyJson.heroVisible !== undefined ? bodyJson.heroVisible : true;

  const dbProducts = await getProducts(supabase, { locale, featured: true, limit: featuredLimit }).catch(() => []);
  const featured = (dbProducts.length > 0 
    ? dbProducts.map((p: any) => mapDBProductToMock(p, locale))
    : mockProducts.filter((p) => p.featured)).slice(0, featuredLimit);

  const dbBlogPosts = await getBlogPosts(supabase, { locale, limit: blogLimit }).catch(() => []);
  const editorialPosts = dbBlogPosts.length > 0
    ? dbBlogPosts.map((post: any) => ({
        slug: post.slug,
        image: post.cover_media?.url || imageAssets.blog1,
        category: { vi: post.category_name, en: post.category_name },
        date: post.published_at?.split("T")[0] || "",
        readTime: { vi: "6 phút đọc", en: "6 min read" },
        title: { vi: post.title, en: post.title },
        excerpt: { vi: post.excerpt, en: post.excerpt },
      }))
    : [];

  const dbShowrooms = await getShowrooms(supabase, locale).catch(() => []);
  const displayShowrooms = dbShowrooms.length > 0
    ? dbShowrooms.slice(0, 2).map((s: any) => ({
        code: s.code,
        name: s.name,
        address: s.address,
        hotline: s.hotline,
        mapUrl: s.map_url,
      }))
    : showrooms.slice(0, 2).map((s) => ({
        code: s.code,
        name: localized(s.name, locale),
        address: localized(s.address, locale),
        hotline: s.hotline,
        mapUrl: s.mapUrl,
      }));

  const staticBrands = [
    { name: "KOHLER", desc: locale === "vi" ? "Hoa Kỳ" : "USA" },
    { name: "GROHE", desc: locale === "vi" ? "Đức" : "Germany" },
    { name: "TOTO", desc: locale === "vi" ? "Nhật Bản" : "Japan" },
    { name: "INAX", desc: locale === "vi" ? "Nhật Bản" : "Japan" },
    { name: "AMERICAN STANDARD", desc: locale === "vi" ? "Hoa Kỳ" : "USA" },
    { name: "BRAVAT", desc: locale === "vi" ? "Đức" : "Germany" },
    { name: "HAFELE", desc: locale === "vi" ? "Đức" : "Germany" },
    { name: "BANCOOT", desc: locale === "vi" ? "Ý" : "Italy" },
    { name: "EUROTILE", desc: locale === "vi" ? "Gạch Cao Cấp" : "Premium Tiles" },
    { name: "TAICERA", desc: locale === "vi" ? "Đài Loan" : "Taiwan" }
  ];

  const { data: dbBrands } = await getPublicBrands().catch(() => ({ data: [] }));

  // Fetch dynamic categories for Lĩnh vực chủ chốt (Key sectors)
  const dbCategories = await getCategories(supabase, locale).catch(() => []);
  const rootCategories = dbCategories.filter((cat: any) => !cat.parentId);
  const displayCategories = rootCategories.slice(0, 4);
  const categoryCount = displayCategories.length;

  let gridClass = "motion-stagger grid gap-5";
  if (categoryCount === 1) {
    gridClass += " grid-cols-1 md:grid-cols-2";
  } else if (categoryCount === 2) {
    gridClass += " grid-cols-1 md:grid-cols-3";
  } else if (categoryCount === 3) {
    gridClass += " grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr]";
  } else {
    gridClass += " grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  }

  const activeBrands = dbBrands && dbBrands.length > 0
    ? dbBrands
    : staticBrands;
  const displayBrands = activeBrands.slice(0, 7);

  const getBrandDisplayName = (b: any) => {
    if (!b) return "";
    if (typeof b.name === "object" && b.name !== null) {
      return locale === "vi" ? b.name.vi : (b.name.en || b.name.vi);
    }
    return b.name || "";
  };

  const getBrandDisplayOrigin = (b: any) => {
    if (!b) return "";
    if (b.desc) return b.desc;
    const origin = b.origin || "";
    if (locale === "vi") {
      if (origin.toUpperCase() === "GERMANY") return "Đức";
      if (origin.toUpperCase() === "JAPAN") return "Nhật Bản";
      if (origin.toUpperCase() === "USA") return "Hoa Kỳ";
      if (origin.toUpperCase() === "ITALY") return "Ý";
      if (origin.toUpperCase() === "TAIWAN") return "Đài Loan";
    }
    return origin;
  };

  // activeBrands and displayBrands defined above

  const heroGroups = productGroups.slice(0, 2).map((group) => ({
    href: withLocale(locale, group.href),
    image: group.image,
    title: localized(group.title, locale),
    summary: localized(group.summary, locale),
    ctaLabel: common("explore"),
  }));
  const displayTrustBadges = [
    {
      value: locale === "vi" ? (bodyJson.badge1ValueVi || "20+") : (bodyJson.badge1ValueEn || "20+"),
      label: {
        vi: bodyJson.badge1DescVi || "Năm kinh nghiệm",
        en: bodyJson.badge1DescEn || "Years of experience"
      }
    },
    {
      value: locale === "vi" ? (bodyJson.badge2ValueVi || "5000+") : (bodyJson.badge2ValueEn || "5000+"),
      label: {
        vi: bodyJson.badge2DescVi || "Khách hàng hài lòng",
        en: bodyJson.badge2DescEn || "Happy clients"
      }
    }
  ];

  const heroSlides = [
    {
      eyebrow: home("heroEyebrow"),
      title: locale === "vi" ? (bodyJson.heroHeadlineVi || home("heroTitle")) : (bodyJson.heroHeadlineEn || home("heroTitle")),
      lead: locale === "vi" ? (bodyJson.heroSubtitleVi || home("heroLead")) : (bodyJson.heroSubtitleEn || home("heroLead")),
      image: bodyJson.heroImage1 || imageAssets.aboutHero,
      meta: common("tagline"),
    },
    {
      eyebrow: localized(productGroups[0].title, locale),
      title: locale === "vi" ? (bodyJson.slide2TitleVi || home("heroSlide2Title")) : (bodyJson.slide2TitleEn || home("heroSlide2Title")),
      lead: locale === "vi" ? (bodyJson.slide2LeadVi || home("heroSlide2Lead")) : (bodyJson.slide2LeadEn || home("heroSlide2Lead")),
      image: bodyJson.slide2Image || imageAssets.showroom,
      meta: home("groupsTitle"),
    },
    {
      eyebrow: localized(productGroups[3].title, locale),
      title: locale === "vi" ? (bodyJson.slide3TitleVi || home("heroSlide3Title")) : (bodyJson.slide3TitleEn || home("heroSlide3Title")),
      lead: locale === "vi" ? (bodyJson.slide3LeadVi || home("heroSlide3Lead")) : (bodyJson.slide3LeadEn || home("heroSlide3Lead")),
      image: bodyJson.slide3Image || imageAssets.room,
      meta: home("storyTitle"),
    },
  ];

  return (
    <main>
      {heroVisible && (
        <HeroShowcase
          slides={heroSlides}
          groups={heroGroups}
          pauseLabel={home("heroPause")}
          playLabel={home("heroPlay")}
        />
      )}

      {/* Brands marquee relocated below */}

      <section className="container-pd py-20 md:py-24">
        <div className="mb-12 grid gap-6 md:grid-cols-[0.8fr_1fr] md:items-end">
          <div>
            <p className="label-pd">{common("tagline")}</p>
            <h2 className="type-section-title mt-3 text-primary md:text-5xl">
              {home("groupsTitle")}
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-secondary md:justify-self-end">
            {home("groupsLead")}
          </p>
        </div>
        <div className={gridClass}>
          {displayCategories.map((cat: any, index: number) => {
            const cardClass = 
              categoryCount === 3 && index === 0 
                ? "interactive-card public-image-panel group relative min-h-72 lg:row-span-2 lg:min-h-[560px]"
                : categoryCount === 4 && index === 0
                  ? "interactive-card public-image-panel group relative min-h-72 lg:col-span-2 lg:row-span-2 lg:min-h-[560px]"
                  : "interactive-card public-image-panel group relative min-h-72";

            return (
              <Link
                key={cat.id}
                href={withLocale(locale, `/products?category=${cat.slug}`)}
                className={cardClass}
              >
                <RemoteImage src={cat.image} alt={cat.name} className="image-lift h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute bottom-0 p-5 text-white">
                  <h3 className="type-card-title text-2xl text-white">{cat.name}</h3>
                  <p className="mt-2 text-sm text-white/80">{cat.description}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold">
                    {common("explore")}
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {featuredVisible && (
        <section className="bg-surface-container-low py-24">
          <div className="container-pd">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="label-pd">{common("tagline")}</p>
                <h2 className="type-section-title mt-3 text-primary md:text-4xl">
                  {home("featuredTitle")}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-secondary">
                  {home("featuredLead")}
                </p>
              </div>
              <Link href={withLocale(locale, "/products")} className="hidden font-bold text-primary md:inline-flex">
                {common("viewAll")}
              </Link>
            </div>
            <div className="motion-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product: any) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  locale={locale}
                  detailsLabel={common("explore")}
                  compact={true}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {(blogSectionVisible || trustBadgesVisible) && (
        <section className={`container-pd grid gap-10 py-24 ${
          blogSectionVisible && trustBadgesVisible 
            ? "lg:grid-cols-[1.05fr_0.95fr] lg:items-start" 
            : "grid-cols-1"
        }`}>
          {blogSectionVisible && (
            <div>
              <p className="label-pd">
                {locale === "vi" ? (bodyJson.blogHeadingVi || home("editorialTitle")) : (bodyJson.blogHeadingEn || home("editorialTitle"))}
              </p>
              <h2 className="type-section-title mt-3 max-w-2xl text-primary md:text-4xl">
                {locale === "vi" ? (bodyJson.blogHeadingVi || home("editorialLead")) : (bodyJson.blogHeadingEn || home("editorialLead"))}
              </h2>
              <div className="mt-8 grid gap-4">
                {editorialPosts.map((post: any) => (
                  <Link
                    key={post.slug}
                    href={withLocale(locale, `/blog/${post.slug}`)}
                    className="card-pd interactive-card group grid gap-4 overflow-hidden p-3 sm:grid-cols-[180px_1fr]"
                  >
                    <RemoteImage
                      src={post.image}
                      alt={localized(post.title, locale)}
                      className="h-44 w-full rounded-lg object-cover sm:h-full"
                      sizes="(min-width: 768px) 180px, 100vw"
                    />
                    <span className="p-2">
                      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-outline">
                        <BookOpen className="size-4" />
                        {localized(post.readTime, locale)}
                      </span>
                      <span className="type-card-title mt-3 block text-2xl text-primary">
                        {localized(post.title, locale)}
                      </span>
                      <span className="mt-3 line-clamp-2 block text-sm leading-6 text-secondary">
                        {localized(post.excerpt, locale)}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {trustBadgesVisible && (
            <div className="surface-soft p-6 md:p-8">
              <p className="label-pd">{home("trustTitle")}</p>
              <h2 className="type-section-title mt-3 text-primary">
                {home("trustLead")}
              </h2>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {displayTrustBadges.map((badge) => (
                  <div
                    key={badge.value}
                    className="surface-card p-6"
                  >
                    <BadgeCheck className="size-8 text-primary" />
                    <strong className="type-section-title mt-5 block text-primary">{badge.value}</strong>
                    <p className="mt-2 text-sm text-secondary">{localized(badge.label, locale)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {showroomVisible && (
        <section className="sticky-reveal-section relative isolate overflow-hidden bg-surface-inverse text-white lg:min-h-[120vh]">
          <div className="sticky-reveal-bg absolute inset-0 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)]">
            <RemoteImage src={bodyJson.showroomBgImage || imageAssets.showroom} alt="" className="h-full w-full object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-r from-surface-inverse/92 via-surface-inverse/64 to-surface-inverse/24" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-surface-inverse to-transparent" />
          </div>
          <div className="sticky-reveal-content container-pd relative z-10 grid gap-10 py-20 lg:-mt-[calc(100vh-5rem)] lg:min-h-[120vh] lg:grid-cols-[1fr_1.1fr] lg:items-center lg:py-28">
            <div>
              <p className="label-pd text-white/65">{common("tagline")}</p>
              <h2 className="type-section-title mt-3 text-white">
                {locale === "vi" ? (bodyJson.showroomHeadingVi || home("showroomTitle")) : (bodyJson.showroomHeadingEn || home("showroomTitle"))}
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-8 text-white/75">
                {locale === "vi" ? (bodyJson.showroomLeadVi || home("showroomLead")) : (bodyJson.showroomLeadEn || home("showroomLead"))}
              </p>
              <div className="mt-8 space-y-6">
                {displayShowrooms.map((showroom: any) => (
                  <div key={showroom.code} className="border-l border-white/25 pl-5">
                    <h3 className="type-card-title text-xl text-white">{showroom.name}</h3>
                    <p className="mt-2 flex gap-2 text-sm text-white/75">
                      <MapPin className="mt-0.5 size-4 shrink-0" />
                      {showroom.address}
                    </p>
                    <p className="mt-2 flex gap-2 text-sm text-white/75">
                      <Phone className="mt-0.5 size-4 shrink-0" />
                      {home("hotlineLabel")}: {showroom.hotline}
                    </p>
                  </div>
                ))}
              </div>
              <Link href={withLocale(locale, "/showrooms")} className="public-inverse-button mt-8">
                {locale === "vi" ? (bodyJson.showroomCtaVi || home("showroomCta")) : (bodyJson.showroomCtaEn || home("showroomCta"))}
              </Link>
            </div>
            <div className="grid gap-5">
              <div className="public-glass-panel p-6">
                <p className="label-pd text-white/60">
                  {locale === "vi" ? (bodyJson.showroomCtaVi || home("showroomCta")) : (bodyJson.showroomCtaEn || home("showroomCta"))}
                </p>
                <p className="type-section-title mt-4 text-white">{displayShowrooms[0]?.name || ""}</p>
                <p className="mt-3 flex gap-2 text-sm leading-6 text-white/72">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  {displayShowrooms[0]?.address || ""}
                </p>
              </div>
              <div className="surface-card p-5 text-primary">
                <p className="type-card-title text-2xl text-primary">
                  {locale === "vi" ? (bodyJson.quoteHeadingVi || home("quoteTitle")) : (bodyJson.quoteHeadingEn || home("quoteTitle"))}
                </p>
                <p className="mt-2 text-sm leading-6 text-secondary">
                  {locale === "vi" ? (bodyJson.quoteLeadVi || home("quoteLead")) : (bodyJson.quoteLeadEn || home("quoteLead"))}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {aboutVisible && (
        <section className="container-pd grid gap-10 py-24 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          {/* Company image with a floating trust badge */}
          <div className="surface-inverse relative min-h-[420px] overflow-hidden text-white lg:min-h-[520px]">
            <RemoteImage
              src={bodyJson.aboutImage || imageAssets.factory}
              alt={locale === "vi" ? "Xưởng sản xuất và showroom Phương Đông" : "Phuong Dong workshop and showroom"}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/35 to-transparent" />
            <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full bg-white/92 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary shadow-lg backdrop-blur">
              <BadgeCheck className="size-4" />
              {locale === "vi" ? "Xưởng sản xuất trực tiếp" : "In-house manufacturing"}
            </div>
            <div className="absolute bottom-0 p-8 md:p-10">
              <p className="type-card-title max-w-sm text-2xl font-semibold text-white">
                {locale === "vi" ? "Chế tác thủ công, kiểm soát chất lượng tận xưởng" : "Handcrafted with full in-house quality control"}
              </p>
            </div>
          </div>
          {/* Story + key stats */}
          <div>
            <p className="label-pd">{locale === "vi" ? "Về Phương Đông" : "About Phuong Dong"}</p>
            <h2 className="type-section-title mt-4 text-primary">
              {locale === "vi" ? (bodyJson.aboutHeadingVi || home("storyTitle")) : (bodyJson.aboutHeadingEn || home("storyTitle"))}
            </h2>
            <p className="mt-5 text-lg leading-8 text-secondary">
              {locale === "vi" ? (bodyJson.aboutLeadVi || home("storyLead")) : (bodyJson.aboutLeadEn || home("storyLead"))}
            </p>
            <dl className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
              {trustBadges.map((badge) => (
                <div key={badge.value} className="surface-card rounded-[var(--radius-control)] p-4 text-center">
                  <dt className="font-heading text-2xl font-extrabold text-primary md:text-3xl">{badge.value}</dt>
                  <dd className="mt-1 text-xs font-medium leading-4 text-secondary">{localized(badge.label, locale)}</dd>
                </div>
              ))}
            </dl>
            <Link href={withLocale(locale, "/about")} className="button-pd-outline mt-8">
              {common("readMore")}
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </section>
      )}

      {/* Relocated Brand Logo Marquee Section */}
      <section className="border-y border-outline-variant/30 py-8 overflow-hidden bg-surface-container/20">
        <div className="container-pd mb-4 flex items-center justify-between">
          <div>
            <p className="label-pd text-xs uppercase tracking-wider text-primary">
              {locale === "vi" ? "Thương hiệu đối tác" : "Partner Brands"}
            </p>
            <h3 className="font-heading text-lg font-bold text-primary mt-1">
              {locale === "vi" ? "Gạch & Thiết bị vệ sinh nhập khẩu" : "Imported Tiles & Sanitary Ware"}
            </h3>
          </div>
        </div>
        <div className="relative w-full overflow-hidden py-2">
          {/* Ambient fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-surface-page-top via-surface-page-top/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-surface-page-top via-surface-page-top/80 to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee-pd flex items-center gap-6">
            {/* Loop 1 */}
            {displayBrands.map((brand, i) => (
              <div
                key={`marquee-1-${i}`}
                className="surface-card interactive-card flex h-16 w-44 shrink-0 flex-col items-center justify-center rounded-xl border border-outline-variant/40 bg-white/70 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-container/40 hover:shadow-md hover:bg-white p-2 group"
              >
                {brand.logo_url ? (
                  <div className="relative h-10 w-32 flex items-center justify-center">
                    <img
                      src={brand.logo_url.startsWith("http://local-assets") ? brand.logo_url.replace("http://local-assets", "") : brand.logo_url}
                      alt={getBrandDisplayName(brand)}
                      className="max-h-full max-w-full object-contain filter grayscale opacity-75 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
                    />
                  </div>
                ) : (
                  <>
                    <span className="font-heading text-sm font-extrabold tracking-widest text-primary-container text-center px-2">
                      {getBrandDisplayName(brand)}
                    </span>
                    <span className="mt-1 text-[8px] font-bold uppercase tracking-wider text-outline">
                      {getBrandDisplayOrigin(brand)}
                    </span>
                  </>
                )}
              </div>
            ))}
            {/* Loop 2 */}
            {displayBrands.map((brand, i) => (
              <div
                key={`marquee-2-${i}`}
                className="surface-card interactive-card flex h-16 w-44 shrink-0 flex-col items-center justify-center rounded-xl border border-outline-variant/40 bg-white/70 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-container/40 hover:shadow-md hover:bg-white p-2 group"
              >
                {brand.logo_url ? (
                  <div className="relative h-10 w-32 flex items-center justify-center">
                    <img
                      src={brand.logo_url.startsWith("http://local-assets") ? brand.logo_url.replace("http://local-assets", "") : brand.logo_url}
                      alt={getBrandDisplayName(brand)}
                      className="max-h-full max-w-full object-contain filter grayscale opacity-75 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
                    />
                  </div>
                ) : (
                  <>
                    <span className="font-heading text-sm font-extrabold tracking-widest text-primary-container text-center px-2">
                      {getBrandDisplayName(brand)}
                    </span>
                    <span className="mt-1 text-[8px] font-bold uppercase tracking-wider text-outline">
                      {getBrandDisplayOrigin(brand)}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {quoteVisible && (
        <section className="container-pd py-20">
          <div className="mx-auto max-w-4xl">
            <QuoteForm
              locale={locale}
              sourcePath={`/${locale}`}
              labels={{
                formTitle: locale === "vi" ? (bodyJson.quoteHeadingVi || home("quoteTitle")) : (bodyJson.quoteHeadingEn || home("quoteTitle")),
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
      )}
    </main>
  );
}
 