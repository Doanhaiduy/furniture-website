"use client";

import { ShieldCheck, Truck, MapPin } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import type { Product } from "@/lib/showroom-data";
import { localized } from "@/lib/showroom-data";

export function ProductTrustMetrics({ locale }: { locale: Locale }) {
  const isVi = locale === "vi";
  return (
    <div className="grid gap-3 sm:grid-cols-3 border-t border-slate-100 pt-5 mt-5">
      <div className="flex items-start gap-2.5">
        <MapPin className="size-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-slate-800">
            {isVi ? "Trưng bày tại showroom" : "Showroom Availability"}
          </h4>
          <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
            {isVi ? "Sẵn hàng tại Q7, TP.HCM" : "Available in District 7, HCMC"}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2.5">
        <ShieldCheck className="size-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-slate-800">
            {isVi ? "Bảo hành cam kết" : "Authentic Warranty"}
          </h4>
          <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
            {isVi ? "5 năm kết cấu bền vững" : "5-year structural warranty"}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2.5">
        <Truck className="size-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-slate-800">
            {isVi ? "Giao hàng & Lắp đặt" : "Delivery & Install"}
          </h4>
          <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
            {isVi ? "Miễn phí nội thành" : "Free in-metro shipping & setup"}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ProductInfo({
  product,
  locale,
}: {
  product: Product;
  locale: Locale;
}) {
  return (
    <div className="mt-5">
      <p className="text-xs sm:text-sm leading-relaxed text-slate-500 font-light">
        {localized(product.summary, locale)}
      </p>
      
      {/* Minimal Specs List */}
      <div className="mt-6 border-t border-slate-100 pt-5 space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {locale === "vi" ? "Thông số cơ bản" : "Key Specifications"}
        </h3>
        <div className="grid gap-y-2.5 text-xs sm:text-sm">
          {product.specs.slice(0, 4).map((spec: any) => (
            <div key={localized(spec.label, locale)} className="flex justify-between border-b border-dashed border-slate-100 pb-2">
              <span className="text-slate-500 font-light">{localized(spec.label, locale)}</span>
              <span className="font-semibold text-slate-800">{localized(spec.value, locale)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
