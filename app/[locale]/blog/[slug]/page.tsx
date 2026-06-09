/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { type Locale, isLocale } from "@/i18n/routing";
import {
  blogPosts,
  getBlogArticleContent,
  getBlogPostBySlug,
} from "@/lib/showroom-mock-fallback";
import {
  localized,
  withLocale,
} from "@/lib/showroom-constants";
import { SocialShare } from "@/components/showroom/social-share";
import { RemoteImage } from "@/components/showroom/remote-image";
import { ArticleToc } from "@/components/showroom/article-toc";
import { createClient } from "@/lib/supabase/server";
import { getBlogBySlug as getDBBlogBySlug, getBlogPosts } from "@/lib/supabase/queries";
import { generatePageMetadata } from "@/lib/seo";

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
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const supabase = await createClient();
  const dbPost = await getDBBlogBySlug(supabase, slug, locale).catch(() => null);
  
  let title = "";
  let excerpt = "";
  let imageUrl = "";
  let publishedAt = "";

  if (dbPost) {
    title = dbPost.title;
    excerpt = dbPost.excerpt;
    imageUrl = dbPost.coverMedia?.url || "";
    publishedAt = dbPost.publishedAt || "";
  } else {
    const mockPost = getBlogPostBySlug(slug);
    if (mockPost) {
      title = localized(mockPost.title, locale);
      excerpt = localized(mockPost.excerpt, locale);
      imageUrl = mockPost.image || "";
    }
  }
  
  if (!title) return {};
  return generatePageMetadata({
    title,
    description: excerpt,
    path: `/${locale}/blog/${slug}`,
    imageUrl,
    publishedAt,
  });
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  
  const supabase = await createClient();
  const dbPost = await getDBBlogBySlug(supabase, slug, locale).catch(() => null);
  
  let post: any = null;
  let article: any = null;
  
  if (dbPost) {
    post = {
      slug: dbPost.slug,
      image: dbPost.coverMedia?.url || "/globe.svg",
      category: { vi: dbPost.category.name, en: dbPost.category.name },
      date: dbPost.publishedAt || new Date().toISOString(),
      readTime: { vi: "5 phút đọc", en: "5 min read" },
      title: { vi: dbPost.title, en: dbPost.title },
      excerpt: { vi: dbPost.excerpt, en: dbPost.excerpt },
    };
    
    const body = dbPost.bodyJson || {};
    article = {
      takeaways: (body.takeaways || []).map((item: any) => ({
        vi: typeof item === "object" ? (item.vi || item.en || "") : item,
        en: typeof item === "object" ? (item.en || item.vi || "") : item,
      })),
      quote: {
        vi: typeof body.quote === "object" ? (body.quote.vi || body.quote.en || "") : (body.quote || ""),
        en: typeof body.quote === "object" ? (body.quote.en || body.quote.vi || "") : (body.quote || ""),
      },
      sections: (body.sections || []).map((section: any) => ({
        id: section.id,
        title: {
          vi: typeof section.title === "object" ? (section.title.vi || section.title.en || "") : (section.title || ""),
          en: typeof section.title === "object" ? (section.title.en || section.title.vi || "") : (section.title || ""),
        },
        body: {
          vi: typeof section.body === "object" ? (section.body.vi || section.body.en || "") : (section.body || ""),
          en: typeof section.body === "object" ? (section.body.en || section.body.vi || "") : (section.body || ""),
        },
        image: section.image,
      })),
    };
  } else {
    const mockPost = getBlogPostBySlug(slug);
    if (mockPost) {
      post = mockPost;
      article = getBlogArticleContent(slug);
    }
  }
  
  if (!post || !article) notFound();
  
  const t = await getTranslations("blog");
  const common = await getTranslations("common");
  
  let related: any[] = [];
  if (dbPost?.category?.slug) {
    const dbRelated = await getBlogPosts(supabase, {
      locale,
      categorySlug: dbPost.category.slug,
      limit: 5,
    }).catch(() => []);
    
    related = dbRelated
      .filter((item: any) => item.slug !== post.slug)
      .slice(0, 2)
      .map((item: any) => ({
        slug: item.slug,
        image: item.cover_media?.url || "/globe.svg",
        category: { vi: item.category_name, en: item.category_name },
        date: item.published_at || new Date().toISOString(),
        readTime: { vi: "5 phút đọc", en: "5 min read" },
        title: { vi: item.title, en: item.title },
        excerpt: { vi: item.excerpt, en: item.excerpt },
      }));
  }
  
  if (related.length === 0) {
    related = blogPosts
      .filter((item) => item.slug !== post.slug)
      .slice(0, 2);
  }
  
  const tocItems = article.sections.map((section: any) => ({
    id: section.id,
    title: localized(section.title, locale),
  }));

  return (
    <main>
      <article>
        <header className="container-pd public-page-header reveal-soft">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,760px)_minmax(280px,420px)] lg:items-end lg:justify-between">
            <div>
              <p className="label-pd">
                {localized(post.category, locale)} / {localized(post.readTime, locale)} /{" "}
                {formatBlogDate(post.date, locale)}
              </p>
              <h1 className="type-page-title mt-5 max-w-4xl text-primary">
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
          <figure className="public-image-panel">
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
                {article.takeaways.map((item: any, index: number) => (
                  <p
                    key={localized(item, locale)}
                    className="public-content-card grid gap-3 p-4 text-[0.95rem] leading-7 text-secondary sm:grid-cols-[2rem_1fr]"
                  >
                    <span className="font-heading text-lg font-semibold text-primary/36">0{index + 1}</span>
                    <span>{localized(item, locale)}</span>
                  </p>
                ))}
              </div>
            </section>

            <aside className="surface-inverse mt-8 p-6 md:p-7">
              <p className="label-pd text-white/65">{t("fieldNote")}</p>
              <blockquote className="type-card-title mt-4 text-xl text-white md:text-2xl">
                {localized(article.quote, locale)}
              </blockquote>
            </aside>

            <div className="mt-12 space-y-12">
              {article.sections.map((section: any, index: number) => (
                <section key={section.id} aria-labelledby={section.id} className="scroll-mt-28">
                  <div className="flex items-center gap-4">
                    <span className="font-heading text-2xl font-semibold text-primary/28">
                      0{index + 1}
                    </span>
                    <div className="h-px flex-1 bg-outline-variant/45" />
                  </div>
                  <h2
                    id={section.id}
                    className="type-section-title mt-5 text-primary md:text-3xl"
                  >
                    {localized(section.title, locale)}
                  </h2>
                  <p className="mt-4 text-base leading-8 text-secondary md:text-[1.05rem]">
                    {localized(section.body, locale)}
                  </p>
                  {"image" in section && section.image ? (
                    <figure className="public-image-panel mt-7">
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
              <div className="public-content-card p-5">
                <ArticleToc items={tocItems} title={t("toc")} />
              </div>
              <div className="public-content-card p-5">
                <p className="label-pd">{t("related")}</p>
                <div className="mt-4 grid gap-4">
                  {related.map((item) => (
                    <Link
                      key={item.slug}
                      href={withLocale(locale, `/blog/${item.slug}`)}
                      className="public-related-link group"
                    >
                      <RemoteImage
                        src={item.image}
                        alt={localized(item.title, locale)}
                        className="public-media-thumb h-28 w-full object-cover"
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
