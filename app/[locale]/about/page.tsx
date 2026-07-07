import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRight,
  Award,
  Compass,
  Factory,
  HeartHandshake,
  Leaf,
  Ruler,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { type Locale, isLocale } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { imageAssets, withLocale } from "@/lib/showroom-constants";
import { RemoteImage } from "@/components/showroom/remote-image";
import { createPublicClient } from "@/lib/supabase/server";
import { getContentPage } from "@/lib/supabase/queries";
import { generatePageMetadata } from "@/lib/seo";

// ISR: 5-min revalidation. No searchParams — safe to cache.
export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "about" });
  return generatePageMetadata({
    title: t("title"),
    description: t("lead"),
    path: `/${locale}/about`,
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const isVi = locale === "vi";

  const supabase = createPublicClient();
  const pageData = await getContentPage(supabase, "about", locale).catch(() => null);
  const homePageContent = await getContentPage(supabase, "home", locale).catch(() => null);
  const homeBodyJson = homePageContent?.bodyJson || {};

  const pageTitle = pageData?.title || t("title");
  const pageLead = pageData?.lead || t("lead");

  const heroStats = [
    { value: isVi ? (homeBodyJson.badge1ValueVi || "20+") : (homeBodyJson.badge1ValueEn || "20+"), label: isVi ? "năm kinh nghiệm" : "years of experience" },
    { value: isVi ? (homeBodyJson.badge2ValueVi || "5.000+") : (homeBodyJson.badge2ValueEn || "5,000+"), label: isVi ? "khách hàng hài lòng" : "happy clients" },
    { value: "2.000m²", label: isVi ? "nhà máy & kho" : "factory & warehouse" },
  ];

  const values = [
    { icon: HeartHandshake, label: isVi ? "Uy tín" : "Integrity", text: isVi ? "Cam kết đúng chất lượng, đúng tiến độ và minh bạch trong từng báo giá." : "Committed to real quality, on-time delivery and transparent quotes." },
    { icon: Award, label: isVi ? "Tận tâm" : "Dedication", text: isVi ? "Đồng hành từ khâu tư vấn đến khi bàn giao và bảo trì sau sử dụng." : "By your side from consultation to handover and after-sales care." },
    { icon: Ruler, label: isVi ? "Chính xác" : "Precision", text: isVi ? "Đo đạc thực tế, kiểm soát kích thước và hoàn thiện đến từng chi tiết." : "On-site measurement and detail control down to the last finish." },
    { icon: Leaf, label: isVi ? "Bền vững" : "Sustainability", text: isVi ? "Ưu tiên vật liệu bền, quy trình chuẩn và giá trị sử dụng lâu dài." : "Durable materials, standard processes and long-term value." },
  ];

  const milestones = [
    { year: "2004", title: isVi ? "Khởi nguồn" : "Founded", text: isVi ? "Bắt đầu từ xưởng đồ gỗ gia đình với nghề mộc truyền thống." : "Started as a family woodworking workshop rooted in traditional craft." },
    { year: "2010", title: isVi ? "Showroom đầu tiên" : "First showroom", text: isVi ? "Mở showroom tư vấn, đưa sản phẩm đến gần hơn với khách hàng." : "Opened a consulting showroom to bring products closer to clients." },
    { year: "2016", title: isVi ? "Mở rộng danh mục" : "Category expansion", text: isVi ? "Bổ sung thiết bị vệ sinh và gạch ốp lát nhập khẩu chính hãng." : "Added genuine imported sanitary ware and tiles." },
    { year: "2020", title: isVi ? "Nhà máy 2.000m²" : "2,000m² factory", text: isVi ? "Đầu tư nhà máy và kho, chủ động sản xuất và kiểm soát chất lượng." : "Invested in factory and warehouse for in-house production and QC." },
    { year: isVi ? "Hôm nay" : "Today", title: isVi ? "Giải pháp trọn gói" : "Complete solutions", text: isVi ? "Tư vấn đồng bộ nội thất, thiết bị và vật liệu hoàn thiện cho mọi công trình." : "End-to-end furniture, fixtures and finishing solutions for every project." },
  ];

  const team = [
    { icon: Compass, role: isVi ? "Ban lãnh đạo" : "Leadership", text: isVi ? "Định hướng chiến lược và cam kết chất lượng dài hạn." : "Strategic direction and long-term quality commitment." },
    { icon: Sparkles, role: isVi ? "Đội thiết kế" : "Design team", text: isVi ? "Phối hợp vật liệu, màu sắc và công năng cho từng không gian." : "Materials, color and function tailored to each space." },
    { icon: Factory, role: isVi ? "Xưởng chế tác" : "Workshop", text: isVi ? "Nghệ nhân giàu kinh nghiệm, kiểm soát hoàn thiện tận xưởng." : "Experienced artisans controlling finishing in-house." },
    { icon: Users, role: isVi ? "Tư vấn & CSKH" : "Consulting & care", text: isVi ? "Đồng hành từ khảo sát đến bảo trì sau bàn giao." : "From survey to post-handover maintenance." },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="relative isolate min-h-[560px] overflow-hidden">
        <RemoteImage src={imageAssets.aboutHero} alt={pageTitle} className="absolute inset-0 h-full w-full object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />
        <div className="container-pd relative z-10 flex min-h-[560px] flex-col justify-center py-16 text-white">
          <div className="reveal-soft max-w-4xl">
            <p className="label-pd text-white/75">{isVi ? "Về Phương Đông · từ 2004" : "About Phuong Dong · since 2004"}</p>
            <h1 className="type-page-title mt-5 text-white">{pageTitle}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">{pageLead}</p>
            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-4">
              {heroStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <strong className="font-heading text-2xl font-extrabold text-white md:text-3xl">{stat.value}</strong>
                  <p className="mt-1 text-xs leading-4 text-white/75">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Brand story */}
      <section className="container-pd grid gap-10 py-20 lg:grid-cols-[0.9fr_1fr] lg:items-center">
        <div>
          <p className="label-pd">{t("brandStory")}</p>
          <h2 className="type-section-title mt-4 text-primary">
            {isVi ? "Khởi nguồn từ mặt mộc của gỗ đến giải pháp hoàn thiện." : "From raw timber to complete living solutions."}
          </h2>
          <p className="mt-5 text-lg leading-8 text-secondary">
            {isVi
              ? "Phương Đông phát triển từ xưởng đồ gỗ gia đình thành showroom tư vấn giải pháp nội thất, thiết bị vệ sinh và vật liệu hoàn thiện. Mỗi lựa chọn đều được cân nhắc về công năng, thẩm mỹ và độ bền."
              : "Phuong Dong grew from a family woodworking workshop into a showroom for furniture, sanitary ware and finishing materials. Every selection balances function, aesthetics and durability."}
          </p>
          <Link href={withLocale(locale, "/products")} className="button-pd-outline mt-8">
            {isVi ? "Khám phá sản phẩm" : "Explore products"}
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="relative">
          <RemoteImage src={imageAssets.factory} alt={t("brandStory")} className="public-image-panel h-[420px] w-full object-cover" />
          <div className="surface-inverse absolute -bottom-8 left-8 p-5">
            <strong className="type-section-title text-white">20+</strong>
            <p className="type-label text-white/80">{isVi ? "năm kinh nghiệm" : "years experience"}</p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-surface-container-low py-20">
        <div className="container-pd grid gap-6 md:grid-cols-2">
          <div className="surface-card flex flex-col gap-4 p-8">
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Target className="size-6" />
            </span>
            <h2 className="type-card-title text-2xl text-primary">{t("mission")}</h2>
            <p className="text-base leading-7 text-secondary">
              {isVi
                ? "Mang đến giải pháp nội thất và thiết bị vệ sinh đồng bộ, bền vững và thẩm mỹ cho từng công trình — từ căn hộ đến biệt thự và dự án thương mại."
                : "Deliver cohesive, durable and aesthetic furniture and sanitary solutions for every project — from apartments to villas and commercial spaces."}
            </p>
          </div>
          <div className="surface-card flex flex-col gap-4 p-8">
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Compass className="size-6" />
            </span>
            <h2 className="type-card-title text-2xl text-primary">{t("vision")}</h2>
            <p className="text-base leading-7 text-secondary">
              {isVi
                ? "Trở thành biểu tượng uy tín về nội thất và thiết bị vệ sinh cao cấp tại Việt Nam, được tin chọn bởi chất lượng và sự tận tâm."
                : "Become a trusted symbol for premium interiors and sanitary ware in Vietnam, chosen for quality and dedication."}
            </p>
          </div>
        </div>
      </section>

      {/* Core values */}
      <section className="bg-surface-inverse py-20 text-white">
        <div className="container-pd">
          <div className="mx-auto max-w-2xl text-center">
            <p className="label-pd text-white/60">{isVi ? "Giá trị cốt lõi" : "Core values"}</p>
            <h2 className="type-section-title mt-3 text-white">{t("values")}</h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.label} className="public-glass-panel p-6 text-left transition hover:border-white/30 hover:bg-white/5">
                  <Icon className="size-6 text-white" />
                  <h3 className="type-card-title mt-5 text-xl text-white">{value.label}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/70">{value.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="container-pd py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="label-pd">{isVi ? "Hành trình phát triển" : "Our journey"}</p>
          <h2 className="type-section-title mt-3 text-primary">
            {isVi ? "Chặng đường hơn 20 năm" : "Over two decades of growth"}
          </h2>
        </div>
        <ol className="relative mt-14 grid gap-10 md:grid-cols-5">
          <span className="absolute left-0 right-0 top-5 hidden h-px bg-outline-variant/40 md:block" aria-hidden />
          {milestones.map((m) => (
            <li key={m.year} className="relative">
              <span className="relative z-10 inline-flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-md">
                <span className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-[6px]" />
                ●
              </span>
              <p className="mt-4 font-heading text-lg font-extrabold text-primary">{m.year}</p>
              <p className="mt-1 text-sm font-bold text-on-surface">{m.title}</p>
              <p className="mt-2 text-sm leading-6 text-secondary">{m.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Team */}
      <section className="bg-surface-container-low py-20">
        <div className="container-pd">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div className="public-image-panel">
              <RemoteImage src={imageAssets.room} alt={t("team")} className="h-[440px] w-full object-cover" />
            </div>
            <div>
              <p className="label-pd">{t("team")}</p>
              <h2 className="type-section-title mt-3 text-primary">
                {isVi ? "Đội ngũ đứng sau từng công trình" : "The team behind every project"}
              </h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {team.map((member) => {
                  const Icon = member.icon;
                  return (
                    <div key={member.role} className="surface-card flex gap-4 p-5">
                      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-on-surface">{member.role}</h3>
                        <p className="mt-1 text-xs leading-5 text-secondary">{member.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capacity band */}
      <section className="bg-surface-inverse py-16 text-white">
        <div className="container-pd grid gap-8 sm:grid-cols-3">
          {heroStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <strong className="font-heading text-4xl font-extrabold text-white">{stat.value}</strong>
              <p className="mt-2 text-sm text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-pd py-20">
        <div className="surface-inverse p-8 text-center md:p-14">
          <Sparkles className="mx-auto size-8" />
          <h2 className="type-section-title mt-4 text-white">{t("cta")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/75">
            {isVi
              ? "Đặt lịch tư vấn để nhận giải pháp nội thất và thiết bị phù hợp nhất cho không gian của bạn."
              : "Book a consultation for the furniture and fixtures solution that fits your space best."}
          </p>
          <Link href={withLocale(locale, "/contact")} className="public-inverse-button mt-8">
            {isVi ? "Liên hệ tư vấn" : "Contact us"}
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
