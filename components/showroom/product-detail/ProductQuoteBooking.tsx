"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ArrowRight, MapPin } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import type { Product } from "@/lib/showroom-data";
import { localized } from "@/lib/showroom-data";
import { withLocale } from "@/lib/showroom-constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QuoteForm } from "@/components/showroom/quote-form";

export function SaveSelectionButton({ label, savedLabel }: { label: string; savedLabel: string }) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      className={`button-pd-outline flex items-center justify-center gap-2 cursor-pointer py-2.5 text-xs font-bold transition-all border ${
        saved
          ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
      }`}
      type="button"
      aria-pressed={saved}
      onClick={() => setSaved((value) => !value)}
    >
      <Heart className={`size-3.5 transition-all ${saved ? "fill-red-600 text-red-600 scale-[1.1]" : "text-slate-500"}`} />
      {saved ? savedLabel : label}
    </button>
  );
}

export function ProductActionGroup({
  product,
  locale,
  labels,
}: {
  product: Product;
  locale: Locale;
  labels: {
    quoteNow: string;
    saveSelection: string;
    savedSelection: string;
    viewInShowroom: string;
    formTitle: string;
    name: string;
    phone: string;
    email: string;
    company: string;
    service: string;
    message: string;
    submit: string;
    sending: string;
    responseTime: string;
    honeypot: string;
    submitError: string;
  };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isVi = locale === "vi";

  return (
    <div className="mt-8 space-y-3">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] w-full text-center cursor-pointer border border-transparent"
          >
            {labels.quoteNow}
            <ArrowRight className="size-4" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-xl sm:max-w-2xl bg-white p-0 overflow-y-auto max-h-[90vh] rounded-2xl border shadow-2xl">
          <DialogTitle className="sr-only">{labels.formTitle}</DialogTitle>
          <DialogDescription className="sr-only">
            {isVi ? "Vui lòng nhập thông tin liên hệ để nhận báo giá chi tiết sản phẩm." : "Please fill out contact information to receive detailed product quote."}
          </DialogDescription>
          
          <div className="p-1">
            <QuoteForm
              locale={locale}
              productId={product.slug}
              categoryId={product.categoryKey}
              sourcePath={`/${locale}/products/${product.slug}`}
              productsForQuote={[
                {
                  slug: product.slug,
                  name: localized(product.name, locale),
                  category_slug: product.categoryKey,
                  category_name: localized(product.category, locale),
                }
              ]}
              categoriesForQuote={
                product.categoryKey
                  ? [{ slug: product.categoryKey, name: localized(product.category, locale) }]
                  : []
              }
              labels={{
                formTitle: labels.formTitle,
                name: labels.name,
                phone: labels.phone,
                email: labels.email,
                company: labels.company,
                service: labels.service,
                message: labels.message,
                submit: labels.submit,
                sending: labels.sending,
                responseTime: labels.responseTime,
                honeypot: labels.honeypot,
                submitError: labels.submitError,
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="grid gap-3 sm:grid-cols-2">
        <SaveSelectionButton label={labels.saveSelection} savedLabel={labels.savedSelection} />
        <Link
          href={withLocale(locale, "/showrooms")}
          className="button-pd-outline flex items-center justify-center gap-2 cursor-pointer py-2.5 text-xs font-bold transition-all border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
        >
          <MapPin className="size-3.5 text-slate-500" />
          {labels.viewInShowroom}
        </Link>
      </div>
    </div>
  );
}
