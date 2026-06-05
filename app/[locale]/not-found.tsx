import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Home } from "lucide-react";
import type { Locale } from "@/i18n/routing";

export default async function NotFound() {
  const locale = (await getLocale()) as Locale;
  const states = await getTranslations({ locale, namespace: "states" });
  const common = await getTranslations({ locale, namespace: "common" });

  return (
    <main className="container-pd grid min-h-[60vh] place-items-center py-16 text-center">
      <div className="card-pd state-card max-w-xl p-8">
        <p className="label-pd">404</p>
        <h1 className="mt-4 font-heading text-5xl font-bold text-primary">
          {states("notFoundTitle")}
        </h1>
        <p className="mt-5 text-lg leading-8 text-secondary">{states("notFoundLead")}</p>
        <Link href={`/${locale}`} className="button-pd mt-8">
          <Home className="size-4" />
          {common("backHome")}
        </Link>
      </div>
    </main>
  );
}
