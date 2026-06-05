import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import {
  blogPosts,
  getBlogArticleContent,
  getBlogPostBySlug,
  localized,
  withLocale,
} from "@/lib/showroom-data";
import { SocialShare } from "@/components/showroom/social-share";
import { RemoteImage } from "@/components/showroom/remote-image";
import { ArticleToc } from "@/components/showroom/article-toc";

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
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: localized(post.title, locale),
    description: localized(post.excerpt, locale),
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();
  const t = await getTranslations("blog");
  const common = await getTranslations("common");
  const related = blogPosts.filter((item) => item.slug !== post.slug).slice(0, 2);
  const article = getBlogArticleContent(post.slug);
  const tocItems = article.sections.map((section) => ({
    id: section.id,
    title: localized(section.title, locale),
  }));

  return (
    <main>
      <article>
        <header className="container-pd reveal-soft py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,760px)_minmax(280px,420px)] lg:items-end lg:justify-between">
            <div>
              <p className="label-pd">
                {localized(post.category, locale)} / {localized(post.readTime, locale)} /{" "}
                {formatBlogDate(post.date, locale)}
              </p>
              <h1 className="mt-5 max-w-4xl font-heading text-4xl font-bold leading-[1.08] text-primary sm:text-5xl lg:text-[3.35rem]">
                {localized(post.title, locale)}
              </h1>
            </div>
            <div>
              <p className="text-base leading-8 text-secondary md:text-lg">{localized(post.excerpt, locale)}</p>
              <div className="mt-6">
                <SocialShare
                  label={common("share")}
                  copyLabel={common("copyLink")}
                  url={`/${locale}/blog/${post.slug}`}
                />
              </div>
            </div>
          </div>
        </header>

        <div className="container-pd">
          <figure className="overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-low shadow-[0_18px_54px_rgba(68,42,34,0.09)]">
            <RemoteImage
              src={post.image}
              alt={localized(post.title, locale)}
              className="h-[300px] w-full object-cover sm:h-[420px] lg:h-[500px]"
              priority
            />
          </figure>
        </div>

        <div className="container-pd grid gap-10 py-12 lg:grid-cols-[minmax(0,760px)_320px] lg:items-start lg:justify-center">
          <div className="min-w-0">
            <details className="surface-soft mb-8 p-5 lg:hidden">
              <summary className="cursor-pointer font-heading text-lg font-semibold text-primary">
                {t("toc")}
              </summary>
              <ArticleToc items={tocItems} title={t("toc")} className="mt-5" />
            </details>

            <section className="surface-soft p-5 md:p-6">
              <p className="label-pd">{t("keyTakeaways")}</p>
              <div className="mt-5 grid gap-3">
                {article.takeaways.map((item, index) => (
                  <p
                    key={localized(item, locale)}
                    className="grid gap-3 rounded-xl border border-outline-variant/25 bg-white/78 p-4 text-[0.95rem] leading-7 text-secondary shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] sm:grid-cols-[2rem_1fr]"
                  >
                    <span className="font-heading text-lg font-semibold text-primary/36">0{index + 1}</span>
                    <span>{localized(item, locale)}</span>
                  </p>
                ))}
              </div>
            </section>

            <aside className="mt-8 rounded-2xl bg-primary p-6 text-white shadow-[0_18px_54px_rgba(68,42,34,0.14)] md:p-7">
              <p className="label-pd text-white/65">{t("fieldNote")}</p>
              <blockquote className="mt-4 font-heading text-xl leading-snug text-white md:text-2xl">
                {localized(article.quote, locale)}
              </blockquote>
            </aside>

            <div className="mt-12 space-y-12">
              {article.sections.map((section, index) => (
                <section key={section.id} aria-labelledby={section.id} className="scroll-mt-28">
                  <div className="flex items-center gap-4">
                    <span className="font-heading text-2xl font-semibold text-primary/28">
                      0{index + 1}
                    </span>
                    <div className="h-px flex-1 bg-outline-variant/45" />
                  </div>
                  <h2
                    id={section.id}
                    className="mt-5 font-heading text-2xl font-semibold leading-tight text-primary md:text-3xl"
                  >
                    {localized(section.title, locale)}
                  </h2>
                  <p className="mt-4 text-base leading-8 text-secondary md:text-[1.05rem]">
                    {localized(section.body, locale)}
                  </p>
                  {"image" in section && section.image ? (
                    <figure className="mt-7 overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-low shadow-[0_16px_38px_rgba(68,42,34,0.07)]">
                      <RemoteImage
                        src={section.image}
                        alt={localized(section.title, locale)}
                        className="h-[280px] w-full object-cover md:h-[340px]"
                        sizes="(min-width: 1024px) 760px, 100vw"
                      />
                    </figure>
                  ) : null}
                </section>
              ))}
            </div>
          </div>

          <aside className="hidden self-start lg:block">
            <div className="sticky top-28 space-y-5">
              <div className="card-pd p-5">
                <ArticleToc items={tocItems} title={t("toc")} />
              </div>
              <div className="card-pd p-5">
                <p className="label-pd">{t("related")}</p>
                <div className="mt-4 grid gap-4">
                  {related.map((item) => (
                    <Link
                      key={item.slug}
                      href={withLocale(locale, `/blog/${item.slug}`)}
                      className="group grid gap-3 rounded-xl border border-transparent p-2 transition hover:border-outline-variant/35 hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/25"
                    >
                      <RemoteImage
                        src={item.image}
                        alt={localized(item.title, locale)}
                        className="h-28 w-full rounded-lg object-cover"
                        sizes="320px"
                      />
                      <div>
                        <h3 className="font-semibold leading-snug text-primary">{localized(item.title, locale)}</h3>
                        <p className="mt-2 text-sm text-secondary">{localized(item.readTime, locale)}</p>
                        <span className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-primary">
                          {t("continueReading")}
                          <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}
