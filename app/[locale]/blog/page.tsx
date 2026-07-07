import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ArrowRight, CalendarDays, Clock } from "lucide-react";
import { type Locale, isLocale } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { localized, withLocale, imageAssets, paginateItems } from "@/lib/showroom-constants";
import { RemoteImage } from "@/components/showroom/remote-image";
import { createPublicClient } from "@/lib/supabase/server";
import { getBlogPosts } from "@/lib/supabase/queries";
import { generatePageMetadata } from "@/lib/seo";

const blogPageSize = 9;

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

// Rough reading-time estimate from the available title + excerpt text.
function estimateReadMinutes(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.min(12, Math.max(3, Math.round(words / 40)));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "blog" });
  return generatePageMetadata({
    title: t("title"),
    description: t("lead"),
    path: `/${locale}/blog`,
  });
}

interface DisplayPost {
  slug: string;
  image: string;
  categoryName: string;
  categorySlug: string;
  date: string;
  readMinutes: number;
  title: { vi: string; en: string };
  excerpt: { vi: string; en: string };
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams?: Promise<{ category?: string; page?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const common = await getTranslations("common");

  const { category, page: pageParam } = (await searchParams) || {};
  const selectedCategory = category || "";

  const supabase = createPublicClient();
  const dbPosts = await getBlogPosts(supabase, { locale, limit: 60 }).catch(() => []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const displayPosts: DisplayPost[] = dbPosts.map((post: any) => {
    const title = post.title || "";
    const excerpt = post.excerpt || "";
    return {
      slug: post.slug || "",
      image: post.cover_media?.url || imageAssets.blog1,
      categoryName: post.category_name || "",
      categorySlug: post.category_slug || "",
      date: post.published_at ? post.published_at.split("T")[0] : new Date().toISOString().split("T")[0],
      readMinutes: estimateReadMinutes(`${title} ${excerpt}`),
      title: { vi: title, en: title },
      excerpt: { vi: excerpt, en: excerpt },
    };
  });

  // Topic chips built from every post (independent of the current filter).
  const uniqueTopicsMap = new Map<string, string>();
  displayPosts.forEach((post) => {
    if (post.categoryName && post.categorySlug && !uniqueTopicsMap.has(post.categorySlug)) {
      uniqueTopicsMap.set(post.categorySlug, post.categoryName);
    }
  });
  const topics = Array.from(uniqueTopicsMap.entries()).map(([slug, name]) => ({ slug, name }));

  const filteredPosts = selectedCategory
    ? displayPosts.filter((post) => post.categorySlug === selectedCategory)
    : displayPosts;

  // Feature the newest post only on the unfiltered first page.
  const requestedPage = Number.parseInt(pageParam ?? "1", 10);
  const currentPageReq = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const showFeatured = !selectedCategory && currentPageReq === 1 && filteredPosts.length > 0;
  const featured = showFeatured ? filteredPosts[0] : null;
  const gridPool = showFeatured ? filteredPosts.slice(1) : filteredPosts;
  const page = paginateItems(gridPool, currentPageReq, blogPageSize);

  const makeBlogHref = (overrides: { category?: string; page?: number }) => {
    const params = new URLSearchParams();
    const cat = overrides.category !== undefined ? overrides.category : selectedCategory;
    if (cat) params.set("category", cat);
    if (overrides.page && overrides.page > 1) params.set("page", String(overrides.page));
    const qs = params.toString();
    return withLocale(locale, `/blog${qs ? `?${qs}` : ""}`);
  };

  const isEmpty = displayPosts.length === 0;

  return (
    <main>
      <section className="container-pd public-page-header">
        <div className="max-w-3xl">
          <p className="label-pd">{t("latest")}</p>
          <h1 className="type-page-title mt-4 text-primary">{t("title")}</h1>
          <p className="mt-5 text-base leading-8 text-secondary md:text-lg">{t("lead")}</p>
        </div>

        {/* Category filter bar */}
        {topics.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2 border-t border-outline-variant/25 pt-6">
            <Link
              href={makeBlogHref({ category: "", page: 1 })}
              className={`filter-chip cursor-pointer select-none transition ${!selectedCategory ? "bg-primary text-white hover:bg-primary/90" : "text-primary"}`}
            >
              {t("allTopics")}
            </Link>
            {topics.map((topic) => {
              const isActive = selectedCategory === topic.slug;
              return (
                <Link
                  key={topic.slug}
                  href={makeBlogHref({ category: isActive ? "" : topic.slug, page: 1 })}
                  className={`filter-chip cursor-pointer select-none transition ${isActive ? "bg-primary text-white hover:bg-primary/90" : "text-primary"}`}
                >
                  {topic.name}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="container-pd pb-20">
        {isEmpty || (page.items.length === 0 && !featured) ? (
          <div className="card-pd state-card grid min-h-80 place-items-center p-8 text-center">
            <div>
              <h2 className="type-section-title text-primary">{common("emptyTitle")}</h2>
              <p className="mx-auto mt-3 max-w-md text-secondary">
                {isEmpty
                  ? common("emptyDescription")
                  : locale === "vi"
                    ? "Không tìm thấy bài viết nào trong chủ đề này."
                    : "No blog posts found in this topic."}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Featured hero */}
            {featured && (
              <article className="mb-10">
                <Link
                  href={withLocale(locale, `/blog/${featured.slug}`)}
                  className="interactive-card public-content-card group grid overflow-hidden lg:grid-cols-[1.08fr_0.92fr]"
                >
                  <RemoteImage
                    src={featured.image}
                    alt={localized(featured.title, locale)}
                    className="image-lift h-[19rem] w-full object-cover sm:h-[24rem] lg:h-full lg:min-h-[28rem]"
                    priority
                  />
                  <div className="flex flex-col justify-between p-5 md:p-8 lg:p-10">
                    <div>
                      {featured.categoryName ? (
                        <span className="filter-chip text-primary">{featured.categoryName}</span>
                      ) : null}
                      <h2 className="type-section-title mt-4 max-w-2xl text-primary md:text-4xl">
                        {localized(featured.title, locale)}
                      </h2>
                      <p className="mt-4 max-w-xl text-base leading-7 text-secondary">
                        {localized(featured.excerpt, locale)}
                      </p>
                    </div>
                    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant/25 pt-5">
                      <span className="flex items-center gap-4 text-sm font-semibold text-secondary">
                        <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" />{formatBlogDate(featured.date, locale)}</span>
                        <span className="inline-flex items-center gap-1.5"><Clock className="size-4" />{t("readTime", { minutes: featured.readMinutes })}</span>
                      </span>
                      <span className="inline-flex items-center gap-2 font-bold text-primary">
                        {common("readMore")}
                        <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            )}

            {/* Card grid */}
            {page.items.length > 0 && (
              <div className="motion-stagger grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {page.items.map((post) => (
                  <article key={post.slug} className="h-full">
                    <Link
                      href={withLocale(locale, `/blog/${post.slug}`)}
                      className="public-content-card interactive-card group flex h-full flex-col overflow-hidden"
                    >
                      <div className="relative overflow-hidden">
                        <RemoteImage
                          src={post.image}
                          alt={localized(post.title, locale)}
                          className="image-lift h-52 w-full object-cover"
                          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                        />
                        {post.categoryName ? (
                          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary shadow-sm backdrop-blur">
                            {post.categoryName}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h2 className="type-card-title text-lg text-primary">{localized(post.title, locale)}</h2>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-secondary">{localized(post.excerpt, locale)}</p>
                        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs font-semibold text-outline">
                          <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" />{formatBlogDate(post.date, locale)}</span>
                          <span className="inline-flex items-center gap-1.5"><Clock className="size-3.5" />{t("readTime", { minutes: post.readMinutes })}</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {page.totalPages > 1 && (
              <nav className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-outline-variant/35 pt-6 md:flex-row" aria-label={t("categories")}>
                <p className="text-sm font-semibold text-secondary">
                  {locale === "vi" ? `Trang ${page.currentPage}/${page.totalPages}` : `Page ${page.currentPage} of ${page.totalPages}`}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Link
                    aria-disabled={page.currentPage === 1}
                    tabIndex={page.currentPage === 1 ? -1 : undefined}
                    href={makeBlogHref({ page: Math.max(1, page.currentPage - 1) })}
                    className="button-pd-outline public-pagination-control min-w-11 px-3"
                  >
                    <ArrowLeft className="size-4" />
                    {locale === "vi" ? "Trước" : "Prev"}
                  </Link>
                  {Array.from({ length: page.totalPages }, (_, index) => index + 1).map((pageNumber) => (
                    <Link
                      key={pageNumber}
                      href={makeBlogHref({ page: pageNumber })}
                      aria-current={page.currentPage === pageNumber ? "page" : undefined}
                      className="public-pagination-link"
                    >
                      {pageNumber}
                    </Link>
                  ))}
                  <Link
                    aria-disabled={page.currentPage === page.totalPages}
                    tabIndex={page.currentPage === page.totalPages ? -1 : undefined}
                    href={makeBlogHref({ page: Math.min(page.totalPages, page.currentPage + 1) })}
                    className="button-pd-outline public-pagination-control min-w-11 px-3"
                  >
                    {locale === "vi" ? "Sau" : "Next"}
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </nav>
            )}
          </>
        )}
      </section>
    </main>
  );
}
