import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { type Locale, isLocale } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { localized, withLocale, imageAssets } from "@/lib/showroom-constants";
import { RemoteImage } from "@/components/showroom/remote-image";
import { createPublicClient } from "@/lib/supabase/server";
import { getBlogPosts } from "@/lib/supabase/queries";

function formatBlogDate(date: string, locale: Locale) {
  try {
    return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "blog" });
  return {
    title: t("title"),
    description: t("lead"),
  };
}

interface DisplayPost {
  slug: string;
  image: string;
  category: { vi: string; en: string; slug: string };
  date: string;
  readTime: { vi: string; en: string };
  title: { vi: string; en: string };
  excerpt: { vi: string; en: string };
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams?: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const common = await getTranslations("common");

  const { category } = (await searchParams) || {};
  const selectedCategory = category || "";

  const supabase = createPublicClient();
  const dbPosts = await getBlogPosts(supabase, { locale, limit: 12 }).catch(() => []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const displayPosts: DisplayPost[] = dbPosts.map((post: any) => ({
    slug: post.slug || "",
    image: post.cover_media?.url || imageAssets.blog1,
    category: { 
      vi: post.category_name || "", 
      en: post.category_name || "", 
      slug: post.category_slug || "" 
    },
    date: post.published_at ? post.published_at.split("T")[0] : new Date().toISOString().split("T")[0],
    readTime: { vi: "5 phút đọc", en: "5 min read" },
    title: { vi: post.title || "", en: post.title || "" },
    excerpt: { vi: post.excerpt || "", en: post.excerpt || "" },
  }));

  // Unique topics with names and slugs
  const uniqueTopicsMap = new Map<string, { name: string; slug: string }>();
  displayPosts.forEach((post) => {
    const name = locale === "vi" ? post.category.vi : post.category.en;
    const slug = post.category.slug;
    if (name && slug && !uniqueTopicsMap.has(slug)) {
      uniqueTopicsMap.set(slug, { name, slug });
    }
  });
  const topics = Array.from(uniqueTopicsMap.values());

  const filteredPosts = selectedCategory
    ? displayPosts.filter((post) => post.category.slug === selectedCategory)
    : displayPosts;

  if (displayPosts.length === 0) {
    return (
      <main>
        <section className="container-pd public-page-header text-center">
          <h1 className="type-page-title mt-4 text-primary">{t("title")}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-secondary">{t("lead")}</p>
        </section>
        <section className="container-pd pb-20 text-center">
          <div className="card-pd state-card grid min-h-80 place-items-center p-8">
            <div>
              <h2 className="type-section-title text-primary">{common("emptyTitle")}</h2>
              <p className="mx-auto mt-3 max-w-md text-secondary">{common("emptyDescription")}</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const [featured, ...rest] = filteredPosts;

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
              {topics.map((topic) => {
                const isActive = selectedCategory === topic.slug;
                return (
                  <Link
                    key={topic.slug}
                    href={withLocale(locale, `/blog${isActive ? "" : `?category=${topic.slug}`}`)}
                    className={`filter-chip cursor-pointer select-none transition ${
                      isActive 
                        ? "bg-primary text-white hover:bg-primary/90" 
                        : "text-primary"
                    }`}
                  >
                    {topic.name}
                  </Link>
                );
              })}
            </div>
          </aside>
        </div>
      </section>

      <section className="container-pd pb-20">
        {!featured ? (
          <div className="card-pd state-card grid min-h-80 place-items-center p-8 text-center">
            <div>
              <h2 className="type-section-title text-primary">{common("emptyTitle")}</h2>
              <p className="mx-auto mt-3 max-w-md text-secondary">
                {locale === "vi" 
                  ? "Không tìm thấy bài viết nào trong danh mục này." 
                  : "No blog posts found in this category."}
              </p>
            </div>
          </div>
        ) : (
          <>
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
                      <ArrowRight className="size-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </article>

            {rest.length > 0 && (
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
                            <ArrowRight className="size-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
