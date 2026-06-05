import Link from "next/link";
import { ArrowRight, Layers3, Ruler } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import type { Product } from "@/lib/showroom-data";
import { localized, withLocale } from "@/lib/showroom-data";
import { RemoteImage } from "./remote-image";

type ProductCardDensity = "default" | "catalog";

export function ProductCard({
  product,
  locale,
  detailsLabel,
  compact = false,
  density = "default",
}: {
  product: Product;
  locale: Locale;
  detailsLabel: string;
  compact?: boolean;
  density?: ProductCardDensity;
}) {
  const primarySpec = product.specs[0];
  const secondarySpec = product.specs[1];
  const isCatalog = density === "catalog";
  const imageClass = compact
    ? "relative h-48 overflow-hidden sm:h-52"
    : isCatalog
      ? "relative h-40 overflow-hidden sm:h-44 lg:h-48"
      : "relative aspect-[4/5] overflow-hidden";
  const bodyClass = compact || isCatalog ? "grid gap-3 p-4" : "grid gap-4 p-5";
  const titleClass = compact || isCatalog
    ? "mt-1.5 line-clamp-2 font-heading text-lg font-semibold leading-tight text-on-surface transition group-hover:text-primary"
    : "mt-2 font-heading text-2xl font-semibold leading-tight text-on-surface transition group-hover:text-primary";
  const summaryClass = isCatalog
    ? "mt-2 line-clamp-2 text-xs leading-5 text-secondary"
    : "mt-3 line-clamp-2 text-sm leading-6 text-secondary";
  const specClass = isCatalog ? "grid gap-1.5 text-xs text-secondary" : "grid gap-2 text-xs text-secondary";
  const iconClass = isCatalog ? "size-3.5 shrink-0 text-primary" : "size-4 shrink-0 text-primary";

  return (
    <Link
      href={withLocale(locale, `/products/${product.slug}`)}
      data-testid="product-card"
      className="card-pd interactive-card group grid h-full overflow-hidden"
    >
      <div className={imageClass}>
        <RemoteImage
          src={product.image}
          alt=""
          className="image-lift h-full w-full object-cover"
          sizes={isCatalog ? "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" : undefined}
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent opacity-80" />
        <div className={isCatalog ? "absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[0.68rem] font-bold text-primary shadow-[0_10px_24px_rgba(0,0,0,0.12)] backdrop-blur" : "absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-primary shadow-[0_10px_24px_rgba(0,0,0,0.12)] backdrop-blur"}>
          {product.referenceCode}
        </div>
        {product.featured ? <div className={isCatalog ? "absolute bottom-3 left-3 h-1 w-10 rounded-full bg-white/85" : "absolute bottom-4 left-4 h-1 w-14 rounded-full bg-white/85"} /> : null}
      </div>
      <div className={bodyClass}>
        <div>
          <p className="label-pd">{localized(product.category, locale)}</p>
          <h3 className={titleClass}>
            {localized(product.name, locale)}
          </h3>
          {!compact ? (
            <p className={summaryClass}>
              {localized(product.summary, locale)}
            </p>
          ) : null}
        </div>
        {!compact ? (
          <div className={specClass}>
            {primarySpec ? (
              <span className="inline-flex min-w-0 items-center gap-2">
                <Layers3 className={iconClass} />
                <span className="truncate">{localized(primarySpec.value, locale)}</span>
              </span>
            ) : null}
            {secondarySpec ? (
              <span className="inline-flex min-w-0 items-center gap-2">
                <Ruler className={iconClass} />
                <span className="truncate">{localized(secondarySpec.value, locale)}</span>
              </span>
            ) : null}
          </div>
        ) : null}
        <div className={compact || isCatalog ? "flex items-center justify-between gap-3 border-t border-outline-variant/25 pt-3" : "flex items-center justify-between gap-3 border-t border-outline-variant/25 pt-4"}>
          <p className={isCatalog ? "min-w-0 truncate text-sm font-bold text-primary" : "min-w-0 truncate font-bold text-primary"}>{localized(product.price, locale)}</p>
          <span className={isCatalog ? "inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-primary" : "inline-flex shrink-0 items-center gap-2 text-sm font-bold text-primary"}>
            {detailsLabel}
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
