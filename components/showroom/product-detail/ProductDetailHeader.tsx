"use client";

import type { Locale } from "@/i18n/routing";
import type { Product } from "@/lib/showroom-data";
import { localized } from "@/lib/showroom-data";

export function ProductDetailHeader({
  product,
  locale,
}: {
  product: Product;
  locale: Locale;
}) {
  return (
    <div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
        {localized(product.category, locale)}
      </span>
      <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-800 mt-2 tracking-tight leading-tight">
        {localized(product.name, locale)}
      </h1>
      <p className="mt-1.5 text-xs text-slate-400 font-mono">
        Ref: {product.referenceCode || product.slug.toUpperCase()}
      </p>
      
      {/* Price section with context */}
      <div className="mt-5 border-y border-slate-100 py-4 flex flex-col gap-0.5">
        <div className="flex items-baseline gap-2.5">
          <strong className="text-xl sm:text-2xl font-bold text-slate-800">
            {localized(product.price, locale)}
          </strong>
          {"oldPrice" in product && product.oldPrice ? (
            <span className="text-sm text-slate-400 line-through">
              {localized(product.oldPrice, locale)}
            </span>
          ) : null}
        </div>
        <span className="text-[10px] text-slate-400">
          {locale === "vi" ? "* Giá tham khảo sản phẩm tiêu chuẩn (Chưa bao gồm VAT)" : "* Price for standard model (Excluding VAT)"}
        </span>
      </div>
    </div>
  );
}
