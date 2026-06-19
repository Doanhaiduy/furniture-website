/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
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
import { getProducts, getBlogPosts, getShowrooms, mapDBProductToMock, getCategories } from "@/lib/supabase/queries";
import { getPublicBrands } from "@/lib/supabase/brands-mutations";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
  };
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
  const dbProducts = await getProducts(supabase, { locale, featured: true, limit: 5 });
  const featured = dbProducts.length > 0 
    ? dbProducts.map((p: any) => mapDBProductToMock(p, locale))
    : mockProducts.filter((p) => p.featured).slice(0, 5); // Fallback to 5 featured mock products

  const dbBlogPosts = await getBlogPosts(supabase, { locale, limit: 3 });
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

  const dbShowrooms = await getShowrooms(supabase, locale);
  const displayShowrooms = dbShowrooms.length > 0
    ? dbShowrooms.slice(0, 2).map((s: any) => ({
        code: s.code,
        name: s.name,
        address: s.address,
        hotline: s.hotline,
        mapUrl: s.map_url,
      }))
    : showrooms.slice(0, 2);

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
  const dbCategories = await getCategories(supabase, locale);
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
  const heroSlides = [
    {
      eyebrow: home("heroEyebrow"),
      title: home("heroTitle"),
      lead: home("heroLead"),
      image: imageAssets.aboutHero,
      meta: common("tagline"),
    },
    {
      eyebrow: localized(productGroups[0].title, locale),
      title: home("heroSlide2Title"),
      lead: home("heroSlide2Lead"),
      image: imageAssets.showroom,
      meta: home("groupsTitle"),
    },
    {
      eyebrow: localized(productGroups[3].title, locale),
      title: home("heroSlide3Title"),
      lead: home("heroSlide3Lead"),
      image: imageAssets.room,
      meta: home("storyTitle"),
    },
  ];

  return (
    <main>
      <HeroShowcase
        slides={heroSlides}
        groups={heroGroups}
        pauseLabel={home("heroPause")}
        playLabel={home("heroPlay")}
      />

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

          {/* Static Thiết kế khác card */}
          <Link
            href={withLocale(locale, "/contact")}
            className="interactive-card public-image-panel group relative min-h-72"
          >
            <RemoteImage src={imageAssets.showroom} alt={locale === "vi" ? "Thiết kế khác" : "Project solutions"} className="image-lift h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <div className="absolute bottom-0 p-5 text-white">
              <h3 className="type-card-title text-2xl text-white">
                {locale === "vi" ? "Thiết kế khác" : "Project solutions"}
              </h3>
              <p className="mt-2 text-sm text-white/80">
                {locale === "vi" 
                  ? "Giải pháp tổng thể cho nhà ở và công trình." 
                  : "Complete solutions for homes and projects."}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold">
                {common("explore")}
                <ArrowRight className="size-4" />
              </span>
            </div>
          </Link>
        </div>
      </section>

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
          <div className="motion-stagger grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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

      <section className="container-pd grid gap-10 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div>
          <p className="label-pd">{home("editorialTitle")}</p>
          <h2 className="type-section-title mt-3 max-w-2xl text-primary md:text-4xl">
            {home("editorialLead")}
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

        <div className="surface-soft p-6 md:p-8">
          <p className="label-pd">{home("trustTitle")}</p>
          <h2 className="type-section-title mt-3 text-primary">
            {home("trustLead")}
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {trustBadges.map((badge) => (
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
      </section>

      <section className="sticky-reveal-section relative isolate overflow-hidden bg-surface-inverse text-white lg:min-h-[120vh]">
        <div className="sticky-reveal-bg absolute inset-0 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)]">
          <RemoteImage src={imageAssets.showroom} alt="" className="h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-inverse/92 via-surface-inverse/64 to-surface-inverse/24" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-surface-inverse to-transparent" />
        </div>
        <div className="sticky-reveal-content container-pd relative z-10 grid gap-10 py-20 lg:-mt-[calc(100vh-5rem)] lg:min-h-[120vh] lg:grid-cols-[1fr_1.1fr] lg:items-center lg:py-28">
          <div>
            <p className="label-pd text-white/65">{common("tagline")}</p>
            <h2 className="type-section-title mt-3 text-white">{home("showroomTitle")}</h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-white/75">{home("showroomLead")}</p>
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
              {home("showroomCta")}
            </Link>
          </div>
          <div className="grid gap-5">
            <div className="public-glass-panel p-6">
              <p className="label-pd text-white/60">{home("showroomCta")}</p>
              <p className="type-section-title mt-4 text-white">{displayShowrooms[0]?.name || ""}</p>
              <p className="mt-3 flex gap-2 text-sm leading-6 text-white/72">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                {displayShowrooms[0]?.address || ""}
              </p>
            </div>
            <div className="surface-card p-5 text-primary">
              <p className="type-card-title text-2xl text-primary">{home("quoteTitle")}</p>
              <p className="mt-2 text-sm leading-6 text-secondary">{home("quoteLead")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-pd grid gap-10 py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="surface-inverse relative min-h-[520px] overflow-hidden text-white">
          <RemoteImage src={imageAssets.texture} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/72 to-primary/20" />
          <div className="absolute bottom-0 p-8 md:p-10">
            <p className="label-pd text-white/65">{home("storyTitle")}</p>
            <h2 className="type-section-title mt-4 max-w-lg text-white">
              {home("heroSlide3Title")}
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/76">{home("storyLead")}</p>
          </div>
        </div>
        <div>
          <p className="label-pd">{home("storyTitle")}</p>
          <h2 className="type-section-title mt-4 text-primary">
            {home("heroSlide3Title")}
          </h2>
          <p className="mt-5 text-lg leading-8 text-secondary">{home("storyLead")}</p>
          <Link href={withLocale(locale, "/about")} className="button-pd-outline mt-8">
            {common("readMore")}
            <ArrowRight className="size-5" />
          </Link>
        </div>
      </section>

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

      <section className="container-pd py-20">
        <div className="mx-auto max-w-4xl">
          <QuoteForm
            locale={locale}
            sourcePath={`/${locale}`}
            labels={{
              formTitle: home("quoteTitle"),
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
    </main>
  );
}
