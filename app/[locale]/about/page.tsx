import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Diamond, Eye, Shield, Sparkles } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { imageAssets, localized, trustBadges, withLocale } from "@/lib/showroom-data";
import { RemoteImage } from "@/components/showroom/remote-image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("title"),
    description: t("lead"),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  const values = [
    { icon: Eye, label: t("vision"), text: locale === "vi" ? "Trở thành biểu tượng uy tín về nội thất và thiết bị vệ sinh cao cấp tại Việt Nam." : "Become a trusted symbol for premium interiors and sanitary ware in Vietnam." },
    { icon: Diamond, label: t("mission"), text: locale === "vi" ? "Mang đến giải pháp đồng bộ, bền vững và thẩm mỹ cho từng công trình." : "Deliver cohesive, durable and aesthetic solutions for every project." },
    { icon: Shield, label: t("values"), text: locale === "vi" ? "Uy tín, tận tâm, chính xác và phát triển bền vững." : "Trust, care, precision and sustainable growth." },
  ];

  return (
    <main>
      <section className="relative isolate min-h-[520px] overflow-hidden">
        <RemoteImage src={imageAssets.aboutHero} alt="" className="absolute inset-0 h-full w-full object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-black/62 via-black/42 to-black/18" />
        <div className="container-pd relative z-10 flex min-h-[520px] items-center py-16 text-white">
          <div className="reveal-soft max-w-4xl">
            <p className="label-pd text-white/75">20 năm / since 2004</p>
            <h1 className="mt-5 font-heading text-5xl font-bold leading-tight md:text-7xl">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">{t("lead")}</p>
          </div>
        </div>
      </section>

      <section className="container-pd grid gap-10 py-20 lg:grid-cols-[0.9fr_1fr] lg:items-center">
        <div>
          <p className="label-pd">{t("brandStory")}</p>
          <h2 className="mt-4 font-heading text-4xl font-semibold text-primary">
            {locale === "vi" ? "Khởi nguồn từ mặt mộc của gỗ đến giải pháp hoàn thiện." : "From raw timber to complete living solutions."}
          </h2>
          <p className="mt-5 text-lg leading-8 text-secondary">
            {locale === "vi"
              ? "Phương Đông phát triển từ xưởng đồ gỗ gia đình thành showroom tư vấn giải pháp nội thất, thiết bị vệ sinh và vật liệu hoàn thiện. Mỗi lựa chọn đều được cân nhắc về công năng, thẩm mỹ và độ bền."
              : "Phuong Dong grew from a family woodworking workshop into a showroom for furniture, sanitary ware and finishing materials. Every selection balances function, aesthetics and durability."}
          </p>
        </div>
        <div className="relative">
          <RemoteImage src={imageAssets.factory} alt="" className="h-[420px] w-full rounded-xl object-cover shadow-2xl shadow-primary/10" />
          <div className="absolute -bottom-8 left-8 rounded-xl bg-primary p-5 text-white shadow-xl">
            <strong className="font-heading text-4xl">20+</strong>
            <p className="text-xs font-bold uppercase tracking-[0.16em]">{locale === "vi" ? "năm kinh nghiệm" : "years experience"}</p>
          </div>
        </div>
      </section>

      <section className="bg-[#26312d] py-20 text-white">
        <div className="container-pd text-center">
          <h2 className="font-heading text-4xl font-semibold">{t("values")}</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.label} className="rounded-xl border border-white/15 p-6 text-left transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/5">
                  <Icon className="size-6" />
                  <h3 className="mt-5 font-heading text-2xl font-semibold">{value.label}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/70">{value.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low py-20">
        <div className="container-pd grid gap-10 lg:grid-cols-[0.9fr_1fr] lg:items-center">
          <RemoteImage src={imageAssets.showroom2} alt="" className="h-[420px] w-full rounded-xl object-cover shadow-[0_18px_44px_rgba(68,42,34,0.08)]" />
          <div>
            <p className="label-pd">{t("capacity")}</p>
            <h2 className="mt-4 font-heading text-4xl font-semibold text-primary">
              {locale === "vi" ? "Quy mô đủ sâu cho tiêu chuẩn công trình." : "Scale and depth for project standards."}
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {trustBadges.map((badge) => (
                <div key={badge.value}>
                  <strong className="font-heading text-3xl text-primary">{badge.value}</strong>
                  <p className="mt-1 text-sm text-secondary">{localized(badge.label, locale)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-pd py-20">
        <p className="label-pd">{t("team")}</p>
        <div className="mt-6 overflow-hidden rounded-xl shadow-[0_18px_44px_rgba(68,42,34,0.08)]">
          <RemoteImage src={imageAssets.room} alt="" className="h-[420px] w-full object-cover" />
        </div>
      </section>

      <section className="container-pd pb-20">
        <div className="rounded-xl bg-primary p-8 text-center text-white shadow-[0_22px_54px_rgba(68,42,34,0.16)] md:p-12">
          <Sparkles className="mx-auto size-8" />
          <h2 className="mt-4 font-heading text-4xl font-semibold">{t("cta")}</h2>
          <Link href={withLocale(locale, "/contact")} className="mt-8 inline-flex rounded-md bg-white px-5 py-3 text-sm font-bold text-primary shadow-[0_16px_32px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5 hover:bg-white/90">
            {locale === "vi" ? "Liên hệ tư vấn" : "Contact us"}
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
