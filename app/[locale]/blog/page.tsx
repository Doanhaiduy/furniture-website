import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { blogPosts, localized, withLocale } from "@/lib/showroom-data";
import { RemoteImage } from "@/components/showroom/remote-image";

function formatBlogDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return {
    title: t("title"),
    description: t("lead"),
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const common = await getTranslations("common");
  const [featured, ...rest] = blogPosts;
  const topics = Array.from(new Set(blogPosts.map((post) => localized(post.category, locale))));

  return (
    <main>
      <section className="container-pd public-page-header">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_360px] lg:items-end">
          <div>
            <p className="label-pd">{t("latest")}</p>
            <h1 className="type-page-title mt-4 max-w-4xl text-primary">
              {t("title")}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-secondary md:text-lg">{t("lead")}</p>
          </div>
          <aside className="surface-soft p-5">
            <p className="label-pd">{t("categories")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {topics.map((topic) => (
                <span
                  key={topic}
                  className="filter-chip text-primary"
                >
                  {topic}
                </span>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="container-pd pb-20">
        <article>
          <Link
            href={withLocale(locale, `/blog/${featured.slug}`)}
            className="interactive-card public-content-card group grid overflow-hidden lg:grid-cols-[1.08fr_0.92fr]"
          >
            <RemoteImage
              src={featured.image}
              alt={localized(featured.title, locale)}
              className="image-lift h-[19rem] w-full object-cover sm:h-[24rem] lg:h-full lg:min-h-[30rem]"
              priority
            />
            <div className="flex flex-col justify-between p-5 md:p-8 lg:p-10">
              <div>
                <p className="label-pd">
                  {localized(featured.category, locale)} / {localized(featured.readTime, locale)}
                </p>
                <h2 className="type-section-title mt-4 max-w-2xl text-primary md:text-4xl">
                  {localized(featured.title, locale)}
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-secondary">
                  {localized(featured.excerpt, locale)}
                </p>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant/25 pt-5">
                <span className="text-sm font-semibold text-secondary">
                  {formatBlogDate(featured.date, locale)}
                </span>
                <span className="inline-flex items-center gap-2 font-bold text-primary">
                  {common("readMore")}
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>
        </article>

        <div className="motion-stagger mt-8 grid gap-5 lg:grid-cols-2">
          {rest.map((post) => (
            <article key={post.slug}>
              <Link
                href={withLocale(locale, `/blog/${post.slug}`)}
                className="public-content-card interactive-card group grid h-full overflow-hidden md:grid-cols-[0.82fr_1fr]"
              >
                <RemoteImage
                  src={post.image}
                  alt={localized(post.title, locale)}
                  className="image-lift h-56 w-full object-cover md:h-full"
                />
                <div className="flex min-h-64 flex-col justify-between p-5">
                  <div>
                    <p className="label-pd">
                      {localized(post.category, locale)} / {localized(post.readTime, locale)}
                    </p>
                    <h2 className="type-card-title mt-3 text-xl text-primary">
                      {localized(post.title, locale)}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-secondary">{localized(post.excerpt, locale)}</p>
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold text-outline">{formatBlogDate(post.date, locale)}</span>
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-primary">
                      {t("continueReading")}
                      <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
