import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ExternalLink, MapPin, Phone } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { localized, showrooms } from "@/lib/showroom-data";
import { RemoteImage } from "@/components/showroom/remote-image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "showrooms" });
  return {
    title: t("title"),
    description: t("lead"),
  };
}

export default async function ShowroomsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("showrooms");

  return (
    <main>
      <section className="container-pd public-page-header text-center">
        <p className="label-pd">Phương Đông</p>
        <h1 className="type-page-title mt-4 text-primary">{t("title")}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-secondary">{t("lead")}</p>
      </section>

      <section className="container-pd motion-stagger grid gap-6 pb-20">
        {showrooms.map((showroom, index) => (
          <article key={showroom.code} className="card-pd interactive-card group grid overflow-hidden lg:grid-cols-[0.9fr_1.1fr]">
            <RemoteImage src={showroom.image} alt={localized(showroom.name, locale)} className="image-lift h-80 w-full object-cover lg:h-full" />
            <div className="p-6 md:p-8">
              <p className="label-pd">{index === 0 ? t("title") : showroom.code}</p>
              <h2 className="type-section-title mt-3 text-primary">{localized(showroom.name, locale)}</h2>
              <p className="mt-4 flex gap-3 text-secondary">
                <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
                {localized(showroom.address, locale)}
              </p>
              <p className="mt-3 flex gap-3 font-bold">
                <Phone className="size-5 text-primary" />
                {showroom.hotline}
              </p>
              <p className="mt-3 text-sm text-secondary">
                {t("hours")}: {localized(showroom.hours, locale)}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a className="button-pd" href={`tel:${showroom.hotline.replaceAll(" ", "")}`}>
                  <Phone className="size-4" />
                  {t("call")}
                </a>
                <a className="button-pd-outline" href={showroom.mapUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  {t("directions")}
                </a>
              </div>
              <div className="public-image-panel mt-6 aspect-[16/8]">
                <iframe
                  title={localized(showroom.name, locale)}
                  className="h-full w-full border-0"
                  loading="lazy"
                  src="https://www.google.com/maps?q=Hanoi&output=embed"
                />
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
