import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AlertTriangle } from "lucide-react";
import type { Locale } from "@/i18n/routing";

export default async function ContactErrorPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <main className="container-pd grid min-h-[60vh] place-items-center py-16 text-center">
      <div className="card-pd state-card max-w-xl p-8">
        <AlertTriangle className="mx-auto size-12 text-error" />
        <h1 className="mt-5 font-heading text-4xl font-bold text-primary">{t("errorTitle")}</h1>
        <p className="mt-4 text-secondary">{t("errorLead")}</p>
        <Link href={`/${locale}/contact`} className="button-pd mt-8">{t("submit")}</Link>
      </div>
    </main>
  );
}
