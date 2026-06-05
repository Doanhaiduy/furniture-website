"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { RefreshCcw } from "lucide-react";
import type { Locale } from "@/i18n/routing";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams<{ locale: Locale }>();
  const states = useTranslations("states");
  const common = useTranslations("common");
  const locale = params.locale || "vi";

  return (
    <main className="container-pd grid min-h-[60vh] place-items-center py-16 text-center">
      <div className="card-pd state-card max-w-xl p-8">
        <p className="label-pd">Error</p>
        <h1 className="mt-4 font-heading text-5xl font-bold text-primary">
          {states("errorTitle")}
        </h1>
        <p className="mt-5 text-lg leading-8 text-secondary">
          {states("errorLead")}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button className="button-pd" type="button" onClick={reset}>
            <RefreshCcw className="size-4" />
            {states("tryAgain")}
          </button>
          <Link href={`/${locale}`} className="button-pd-outline">
            {common("backHome")}
          </Link>
        </div>
      </div>
    </main>
  );
}
