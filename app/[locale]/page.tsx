import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, BadgeCheck, BookOpen, MapPin, Phone } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import {
  blogPosts,
  imageAssets,
  localized,
  productGroups,
  products,
  showrooms,
  trustBadges,
  withLocale,
} from "@/lib/showroom-data";
import { QuoteForm } from "@/components/showroom/quote-form";
import { RemoteImage } from "@/components/showroom/remote-image";
import { HeroShowcase } from "@/components/showroom/hero-showcase";
import { ProductCard } from "@/components/showroom/product-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
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
  setRequestLocale(locale);
  const home = await getTranslations("home");
  const common = await getTranslations("common");
  const contact = await getTranslations("contact");

  const featured = products.filter((product) => product.featured).slice(0, 4);
  const editorialPosts = blogPosts.slice(0, 3);
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
        pauseLabel={home("heroPause")}
        playLabel={home("heroPlay")}
      />

      <section className="container-pd py-24">
        <div className="mb-12 grid gap-6 md:grid-cols-[0.8fr_1fr] md:items-end">
          <div>
            <p className="label-pd">{common("tagline")}</p>
            <h2 className="mt-3 font-heading text-3xl font-semibold text-primary md:text-5xl">
              {home("groupsTitle")}
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-secondary md:justify-self-end">
            {home("groupsLead")}
          </p>
        </div>
        <div className="motion-stagger grid gap-5 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          {productGroups.map((group) => (
            <Link
              key={group.key}
              href={withLocale(locale, group.href)}
              className={`interactive-card group relative min-h-72 overflow-hidden rounded-2xl ${
                group.key === "wood" ? "lg:row-span-2 lg:min-h-[560px]" : ""
              }`}
            >
              <RemoteImage src={group.image} alt="" className="image-lift h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute bottom-0 p-5 text-white">
                <h3 className="font-heading text-2xl font-semibold">{localized(group.title, locale)}</h3>
                <p className="mt-2 text-sm text-white/80">{localized(group.summary, locale)}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold">
                  {common("explore")}
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-surface-container-low py-24">
        <div className="container-pd">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="label-pd">{common("tagline")}</p>
              <h2 className="mt-3 font-heading text-3xl font-semibold text-primary md:text-4xl">
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
          <div className="motion-stagger grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featured.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
                locale={locale}
                detailsLabel={common("explore")}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="container-pd grid gap-10 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div>
          <p className="label-pd">{home("editorialTitle")}</p>
          <h2 className="mt-3 max-w-2xl font-heading text-3xl font-semibold text-primary md:text-4xl">
            {home("editorialLead")}
          </h2>
          <div className="mt-8 grid gap-4">
            {editorialPosts.map((post) => (
              <Link
                key={post.slug}
                href={withLocale(locale, `/blog/${post.slug}`)}
                className="card-pd interactive-card group grid gap-4 overflow-hidden p-3 sm:grid-cols-[180px_1fr]"
              >
                <RemoteImage
                  src={post.image}
                  alt=""
                  className="h-44 w-full rounded-lg object-cover sm:h-full"
                  sizes="(min-width: 768px) 180px, 100vw"
                />
                <span className="p-2">
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-outline">
                    <BookOpen className="size-4" />
                    {localized(post.readTime, locale)}
                  </span>
                  <span className="mt-3 block font-heading text-2xl font-semibold leading-tight text-primary">
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
          <h2 className="mt-3 font-heading text-3xl font-semibold text-primary">
            {home("trustLead")}
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {trustBadges.map((badge) => (
              <div
                key={badge.value}
                className="rounded-2xl border border-outline-variant/25 bg-white/75 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]"
              >
                <BadgeCheck className="size-8 text-primary" />
                <strong className="mt-5 block font-heading text-4xl text-primary">{badge.value}</strong>
                <p className="mt-2 text-sm text-secondary">{localized(badge.label, locale)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sticky-reveal-section relative isolate overflow-hidden bg-[#26312d] text-white lg:min-h-[120vh]">
        <div className="sticky-reveal-bg absolute inset-0 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)]">
          <RemoteImage src={imageAssets.showroom} alt="" className="h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#26312d]/92 via-[#26312d]/64 to-[#26312d]/24" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#26312d] to-transparent" />
        </div>
        <div className="sticky-reveal-content container-pd relative z-10 grid gap-10 py-20 lg:-mt-[calc(100vh-5rem)] lg:min-h-[120vh] lg:grid-cols-[1fr_1.1fr] lg:items-center lg:py-28">
          <div>
            <p className="label-pd text-white/65">{common("tagline")}</p>
            <h2 className="mt-3 font-heading text-4xl font-semibold">{home("showroomTitle")}</h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-white/75">{home("showroomLead")}</p>
            <div className="mt-8 space-y-6">
              {showrooms.slice(0, 2).map((showroom) => (
                <div key={showroom.code} className="border-l border-white/25 pl-5">
                  <h3 className="font-heading text-xl font-semibold">{localized(showroom.name, locale)}</h3>
                  <p className="mt-2 flex gap-2 text-sm text-white/75">
                    <MapPin className="mt-0.5 size-4 shrink-0" />
                    {localized(showroom.address, locale)}
                  </p>
                  <p className="mt-2 flex gap-2 text-sm text-white/75">
                    <Phone className="mt-0.5 size-4 shrink-0" />
                    {home("hotlineLabel")}: {showroom.hotline}
                  </p>
                </div>
              ))}
            </div>
            <Link href={withLocale(locale, "/showrooms")} className="mt-8 inline-flex rounded-md bg-white px-5 py-3 text-sm font-bold text-primary shadow-[0_16px_32px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5 hover:bg-white/90">
              {home("showroomCta")}
            </Link>
          </div>
          <div className="grid gap-5">
            <div className="rounded-2xl border border-white/15 bg-white/12 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-md">
              <p className="label-pd text-white/60">{home("showroomCta")}</p>
              <p className="mt-4 font-heading text-3xl font-semibold">{localized(showrooms[0].name, locale)}</p>
              <p className="mt-3 flex gap-2 text-sm leading-6 text-white/72">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                {localized(showrooms[0].address, locale)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/90 p-5 text-primary shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur">
              <p className="font-heading text-2xl font-semibold">{home("quoteTitle")}</p>
              <p className="mt-2 text-sm leading-6 text-secondary">{home("quoteLead")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-pd grid gap-10 py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="relative min-h-[520px] overflow-hidden rounded-2xl bg-primary text-white shadow-[0_24px_70px_rgba(68,42,34,0.16)]">
          <RemoteImage src={imageAssets.texture} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/72 to-primary/20" />
          <div className="absolute bottom-0 p-8 md:p-10">
            <p className="label-pd text-white/65">{home("storyTitle")}</p>
            <h2 className="mt-4 max-w-lg font-heading text-4xl font-semibold leading-tight">
              {home("heroSlide3Title")}
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/76">{home("storyLead")}</p>
          </div>
        </div>
        <div>
          <p className="label-pd">{home("storyTitle")}</p>
          <h2 className="mt-4 font-heading text-4xl font-semibold leading-tight text-primary">
            {home("heroSlide3Title")}
          </h2>
          <p className="mt-5 text-lg leading-8 text-secondary">{home("storyLead")}</p>
          <Link href={withLocale(locale, "/about")} className="button-pd-outline mt-8">
            {common("readMore")}
            <ArrowRight className="size-5" />
          </Link>
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
            }}
          />
        </div>
      </section>
    </main>
  );
}
