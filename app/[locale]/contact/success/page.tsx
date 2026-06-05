import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";
import type { Locale } from "@/i18n/routing";

export default async function ContactSuccessPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const common = await getTranslations("common");

  return (
    <main className="container-pd grid min-h-[60vh] place-items-center py-16 text-center">
      <div className="card-pd state-card max-w-xl p-8">
        <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
        <h1 className="mt-5 font-heading text-4xl font-bold text-primary">{t("successTitle")}</h1>
        <p className="mt-4 text-secondary">{t("successLead")}</p>
        <Link href={`/${locale}`} className="button-pd mt-8">{common("backHome")}</Link>
      </div>
    </main>
  );
}
