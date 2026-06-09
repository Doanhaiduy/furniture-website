import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ExternalLink, MapPin, Phone } from "lucide-react";
import { type Locale, isLocale } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { imageAssets } from "@/lib/showroom-constants";
import { RemoteImage } from "@/components/showroom/remote-image";
import { createClient } from "@/lib/supabase/server";
import { getShowrooms } from "@/lib/supabase/queries";

type PublicShowroomRecord = {
  code?: string | null;
  name?: string | null;
  address?: string | null;
  opening_hours?: string | null;
  hotline?: string | null;
  google_maps_embed_url?: string | null;
  google_maps_fallback_url?: string | null;
  primary_media?: {
    url?: string | null;
    altText?: string | null;
  } | null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
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
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("showrooms");
  const common = await getTranslations("common");
  const supabase = await createClient();
  const dbShowrooms = await getShowrooms(supabase, locale).catch(() => []);
  const showroomFallbackImages = [imageAssets.showroom, imageAssets.showroom2, imageAssets.room];
  const displayShowrooms = (dbShowrooms as PublicShowroomRecord[]).map((showroom, index) => ({
    code: showroom.code || `SHOWROOM-${index + 1}`,
    image: showroom.primary_media?.url || showroomFallbackImages[index % showroomFallbackImages.length],
    imageAlt: showroom.primary_media?.altText || showroom.name || "",
    name: showroom.name || "",
    address: showroom.address || "",
    hotline: showroom.hotline || "",
    hours: showroom.opening_hours || "",
    mapUrl: showroom.google_maps_fallback_url || "https://www.google.com/maps",
    embedUrl: showroom.google_maps_embed_url || "",
  }));

  return (
    <main>
      <section className="container-pd public-page-header text-center">
        <p className="label-pd">Phương Đông</p>
        <h1 className="type-page-title mt-4 text-primary">{t("title")}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-secondary">{t("lead")}</p>
      </section>

      <section className="container-pd motion-stagger grid gap-6 pb-20">
        {displayShowrooms.length > 0 ? displayShowrooms.map((showroom, index) => (
          <article key={showroom.code} className="card-pd interactive-card group grid overflow-hidden lg:grid-cols-[0.9fr_1.1fr]">
            <RemoteImage src={showroom.image} alt={showroom.imageAlt || showroom.name} className="image-lift h-80 w-full object-cover lg:h-full" />
            <div className="p-6 md:p-8">
              <p className="label-pd">{index === 0 ? t("title") : showroom.code}</p>
              <h2 className="type-section-title mt-3 text-primary">{showroom.name}</h2>
              <p className="mt-4 flex gap-3 text-secondary">
                <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
                {showroom.address}
              </p>
              <p className="mt-3 flex gap-3 font-bold">
                <Phone className="size-5 text-primary" />
                {showroom.hotline}
              </p>
              <p className="mt-3 text-sm text-secondary">
                {t("hours")}: {showroom.hours}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a className="button-pd" href={`tel:${showroom.hotline.replace(/[^\d+]/g, "")}`}>
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
                  title={showroom.name}
                  className="h-full w-full border-0"
                  loading="lazy"
                  src={showroom.embedUrl}
                />
              </div>
            </div>
          </article>
        )) : (
          <div className="card-pd state-card grid min-h-80 place-items-center p-8 text-center">
            <div>
              <h2 className="type-section-title text-primary">{common("emptyTitle")}</h2>
              <p className="mx-auto mt-3 max-w-md text-secondary">{common("emptyDescription")}</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
