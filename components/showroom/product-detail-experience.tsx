"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Heart, Maximize2, ShieldCheck, Truck, Wrench } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import type { Product } from "@/lib/showroom-data";
import { localized } from "@/lib/showroom-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RemoteImage } from "./remote-image";

type ProductDetailLabels = {
  galleryLabel: string;
  enlargeImage: string;
  galleryHelp: string;
  tabsOverview: string;
  tabsSpecifications: string;
  tabsMaterials: string;
  tabsDimensionsCare: string;
  tabsDeliveryWarranty: string;
  overviewTitle: string;
  specificationsTitle: string;
  materialsTitle: string;
  dimensionsCareTitle: string;
  deliveryWarrantyTitle: string;
  materialsLead: string;
  dimensionsCareLead: string;
  deliveryWarrantyLead: string;
  craftsmanshipNote: string;
  careNote: string;
  deliveryNote: string;
  warrantyNote: string;
};

export function ProductGallery({
  product,
  locale,
  labels,
}: {
  product: Product;
  locale: Locale;
  labels: Pick<ProductDetailLabels, "galleryLabel" | "enlargeImage" | "galleryHelp">;
}) {
  const images = useMemo(() => Array.from(new Set([product.image, ...product.gallery])), [product]);
  const [activeImage, setActiveImage] = useState(images[0]);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="grid gap-4">
      <div className="public-image-panel group relative">
        <button
          type="button"
          className="block w-full cursor-zoom-in text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/35"
          onClick={() => setDialogOpen(true)}
          aria-label={labels.enlargeImage}
        >
          <RemoteImage
            src={activeImage}
            alt={localized(product.name, locale)}
            className="h-[520px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
            priority
          />
        </button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="public-inverse-button absolute right-4 top-4 min-h-9 px-3 py-2 text-xs"
            >
              <Maximize2 className="size-4" />
              {labels.enlargeImage}
            </button>
          </DialogTrigger>
          <DialogContent className="surface-elevated max-w-5xl gap-3 p-3 sm:max-w-5xl">
            <DialogTitle className="sr-only">{localized(product.name, locale)}</DialogTitle>
            <DialogDescription className="sr-only">{labels.galleryHelp}</DialogDescription>
            <RemoteImage
              src={activeImage}
              alt={localized(product.name, locale)}
              className="max-h-[78vh] w-full rounded-xl object-contain"
              sizes="90vw"
            />
          </DialogContent>
        </Dialog>
      </div>

      <div aria-label={labels.galleryLabel} className="grid grid-cols-4 gap-3">
        {images.map((image, index) => {
          const selected = image === activeImage;
          return (
            <button
              key={image}
              type="button"
              aria-label={`${labels.galleryLabel} ${index + 1}`}
              aria-pressed={selected}
                className={`surface-card group overflow-hidden p-1 transition ${
                  selected
                  ? "border-primary shadow-[var(--shadow-card)]"
                  : "border-outline-variant/35 hover:border-primary/35"
              }`}
              onClick={() => setActiveImage(image)}
            >
              <RemoteImage
                src={image}
                alt={`${localized(product.name, locale)} ${index + 1}`}
                className="public-media-thumb h-24 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                sizes="160px"
              />
              <span
                className={`mt-1 block h-0.5 rounded-full transition ${
                  selected ? "bg-primary" : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SaveSelectionButton({ label, savedLabel }: { label: string; savedLabel: string }) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      className="button-pd-outline"
      type="button"
      aria-pressed={saved}
      onClick={() => setSaved((value) => !value)}
    >
      <Heart className={`size-4 ${saved ? "fill-current" : ""}`} />
      {saved ? savedLabel : label}
    </button>
  );
}

export function ProductInformationTabs({
  product,
  locale,
  labels,
}: {
  product: Product;
  locale: Locale;
  labels: ProductDetailLabels;
}) {
  return (
    <Tabs defaultValue="overview" className="surface-soft overflow-hidden p-2">
      <TabsList className="surface-panel grid h-auto w-full grid-cols-2 gap-2 p-2 md:grid-cols-5">
        {[
          ["overview", labels.tabsOverview],
          ["specifications", labels.tabsSpecifications],
          ["materials", labels.tabsMaterials],
          ["care", labels.tabsDimensionsCare],
          ["delivery", labels.tabsDeliveryWarranty],
        ].map(([value, label]) => (
          <TabsTrigger
            key={value}
            value={value}
            className="public-tab-pd"
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview" className="p-5 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="label-pd">{labels.tabsOverview}</p>
            <h2 className="mt-3 font-heading text-3xl font-semibold text-primary">
              {labels.overviewTitle}
            </h2>
            <p className="mt-5 text-lg leading-8 text-secondary">
              {localized(product.description, locale)}
            </p>
          </div>
          <div className="grid gap-3">
            {product.tags.map((tag) => (
              <div
                key={tag}
                className="surface-card p-4"
              >
                <CheckCircle2 className="size-5 text-primary" />
                <p className="mt-2 font-semibold">{tag}</p>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="specifications" className="p-5 md:p-8">
        <p className="label-pd">{labels.tabsSpecifications}</p>
        <h2 className="mt-3 font-heading text-3xl font-semibold text-primary">
          {labels.specificationsTitle}
        </h2>
        <div className="surface-card mt-6 overflow-hidden">
          {product.specs.map((spec) => (
            <div
              key={localized(spec.label, locale)}
              className="grid gap-2 border-b border-outline-variant/25 px-5 py-4 last:border-b-0 md:grid-cols-[0.8fr_1fr]"
            >
              <p className="font-semibold text-primary">{localized(spec.label, locale)}</p>
              <p className="text-secondary">{localized(spec.value, locale)}</p>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="materials" className="p-5 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1fr] lg:items-start">
          <div>
            <p className="label-pd">{labels.tabsMaterials}</p>
            <h2 className="mt-3 font-heading text-3xl font-semibold text-primary">
              {labels.materialsTitle}
            </h2>
            <p className="mt-5 text-base leading-8 text-secondary">{labels.materialsLead}</p>
          </div>
          <div className="surface-inverse p-6">
            <Wrench className="size-8 text-white/82" />
            <p className="mt-5 text-lg leading-8 text-white/78">{labels.craftsmanshipNote}</p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="care" className="p-5 md:p-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="label-pd">{labels.tabsDimensionsCare}</p>
            <h2 className="mt-3 font-heading text-3xl font-semibold text-primary">
              {labels.dimensionsCareTitle}
            </h2>
            <p className="mt-5 text-base leading-8 text-secondary">{labels.dimensionsCareLead}</p>
          </div>
          <div className="surface-card p-6">
            <ShieldCheck className="size-8 text-primary" />
            <p className="mt-5 text-base leading-8 text-secondary">{labels.careNote}</p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="delivery" className="p-5 md:p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="surface-card p-6">
            <Truck className="size-8 text-primary" />
            <h3 className="mt-5 font-heading text-2xl font-semibold text-primary">
              {labels.deliveryWarrantyTitle}
            </h3>
            <p className="mt-4 text-base leading-8 text-secondary">{labels.deliveryWarrantyLead}</p>
          </div>
          <div className="surface-card p-6">
            <ShieldCheck className="size-8 text-primary" />
            <p className="mt-5 text-base leading-8 text-secondary">{labels.warrantyNote}</p>
            <p className="mt-4 text-sm leading-6 text-outline">{labels.deliveryNote}</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
