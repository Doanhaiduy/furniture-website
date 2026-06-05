import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail, MapPin, Phone } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { imageAssets, localized, showrooms } from "@/lib/showroom-data";
import { QuoteForm } from "@/components/showroom/quote-form";
import { RemoteImage } from "@/components/showroom/remote-image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("title"),
    description: t("lead"),
  };
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ product?: string }>;
}) {
  const { locale } = await params;
  const { product } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <main>
      <section className="container-pd py-16 text-center">
        <h1 className="font-heading text-5xl font-bold text-primary md:text-6xl">{t("title")}</h1>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-secondary">{t("lead")}</p>
      </section>

      <section className="container-pd grid gap-8 pb-20 lg:grid-cols-[1.15fr_0.85fr]">
        <QuoteForm
          locale={locale}
          sourcePath={`/${locale}/contact`}
          productId={product}
          labels={{
            formTitle: t("formTitle"),
            name: t("name"),
            phone: t("phone"),
            email: t("email"),
            company: t("company"),
            service: t("service"),
            message: t("message"),
            submit: t("submit"),
            sending: t("sending"),
            responseTime: t("responseTime"),
            honeypot: t("honeypot"),
          }}
        />
        <aside className="space-y-6">
          <div className="surface-soft p-6">
            <h2 className="font-heading text-3xl font-semibold text-primary">
              {locale === "vi" ? "Thông tin liên hệ" : "Contact information"}
            </h2>
            <div className="mt-6 space-y-5">
              <p className="flex gap-3">
                <Phone className="size-5 text-primary" />
                <span><strong>Hotline</strong><br />08172 357 587</span>
              </p>
              <p className="flex gap-3">
                <Mail className="size-5 text-primary" />
                <span><strong>Email</strong><br />contact@phuongdong.com</span>
              </p>
              <div className="flex gap-3">
                <MapPin className="size-5 text-primary" />
                <div>
                  <strong>{locale === "vi" ? "Hệ thống showroom" : "Showroom network"}</strong>
                  {showrooms.slice(0, 2).map((showroom) => (
                    <p key={showroom.code} className="mt-2 text-sm text-secondary">
                      {localized(showroom.address, locale)}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <Link href={`/${locale}/showrooms`} className="interactive-card group relative block overflow-hidden rounded-xl">
            <RemoteImage src={imageAssets.showroom} alt="" className="image-lift h-72 w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 p-6 text-white">
              <p className="label-pd text-white/75">{locale === "vi" ? "Ghé thăm chúng tôi" : "Visit us"}</p>
              <h3 className="font-heading text-3xl font-semibold">{locale === "vi" ? "Trải nghiệm thực tế" : "Real showroom experience"}</h3>
            </div>
          </Link>
        </aside>
      </section>
    </main>
  );
}
