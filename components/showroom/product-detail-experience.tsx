"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Heart,
  Maximize2,
  ShieldCheck,
  Truck,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Download,
  Info,
  MapPin,
  ArrowRight,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RemoteImage } from "./remote-image";
import { QuoteForm } from "@/components/showroom/quote-form";

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

// 1. PREMIUM GALLERY COMPONENT
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

  const activeIndex = images.indexOf(activeImage);
  const handlePrev = () => {
    const prevIndex = (activeIndex - 1 + images.length) % images.length;
    setActiveImage(images[prevIndex]);
  };
  const handleNext = () => {
    const nextIndex = (activeIndex + 1) % images.length;
    setActiveImage(images[nextIndex]);
  };

  useEffect(() => {
    if (!dialogOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialogOpen, activeIndex]);

  return (
    <div className="flex flex-col gap-4 w-full lg:sticky lg:top-24 h-fit">
      {/* Main Image Viewport */}
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-100 group shadow-sm">
        <button
          type="button"
          className="block w-full h-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10"
          onClick={() => setDialogOpen(true)}
          aria-label={labels.enlargeImage}
        >
          <RemoteImage
            src={activeImage}
            alt={localized(product.name, locale)}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
            priority
          />
        </button>

        {/* Floating Glassmorphic Zoom Button */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="absolute right-4 top-4 z-10 flex h-9 items-center gap-1.5 rounded-full border border-white/20 bg-white/60 px-3.5 py-2 text-xs font-semibold text-slate-800 backdrop-blur-md transition-all hover:bg-white/90 hover:scale-[1.02] shadow-sm cursor-pointer"
            >
              <Maximize2 className="size-3.5" />
              {labels.enlargeImage}
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl bg-white/95 backdrop-blur-lg border border-slate-200/50 p-4 shadow-2xl flex flex-col items-center justify-center min-h-[60vh] rounded-2xl">
            <DialogTitle className="sr-only">{localized(product.name, locale)}</DialogTitle>
            <DialogDescription className="sr-only">{labels.galleryHelp}</DialogDescription>
            
            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-6 z-20 p-3.5 rounded-full bg-slate-900/10 hover:bg-slate-900/20 text-slate-800 transition flex items-center justify-center cursor-pointer border border-slate-200/20"
                aria-label="Previous image"
              >
                <ChevronLeft className="size-5" />
              </button>
            )}

            <div className="relative w-full max-h-[75vh] flex items-center justify-center overflow-hidden rounded-lg">
              <RemoteImage
                src={activeImage}
                alt={localized(product.name, locale)}
                className="max-h-[72vh] max-w-full rounded-lg object-contain"
                sizes="90vw"
              />
            </div>

            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-6 z-20 p-3.5 rounded-full bg-slate-900/10 hover:bg-slate-900/20 text-slate-800 transition flex items-center justify-center cursor-pointer border border-slate-200/20"
                aria-label="Next image"
              >
                <ChevronRight className="size-5" />
              </button>
            )}
            
            <div className="text-[11px] font-mono text-slate-400 mt-2">
              {activeIndex + 1} / {images.length}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Thumbnails list */}
      {images.length > 1 && (
        <div aria-label={labels.galleryLabel} className="grid grid-cols-5 gap-3.5 mt-1">
          {images.map((image, index) => {
            const selected = image === activeImage;
            return (
              <button
                key={image}
                type="button"
                aria-label={`${labels.galleryLabel} ${index + 1}`}
                aria-pressed={selected}
                className={`relative aspect-[4/3] rounded-lg overflow-hidden border transition-all duration-300 cursor-pointer ${
                  selected
                    ? "border-primary ring-2 ring-primary/10 scale-[1.03]"
                    : "border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-400"
                }`}
                onClick={() => setActiveImage(image)}
              >
                <RemoteImage
                  src={image}
                  alt={`${localized(product.name, locale)} ${index + 1}`}
                  className="h-full w-full object-cover"
                  sizes="120px"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// 2. PREMIUM TRUST METRICS COMPONENT
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

// 3. EDITORIAL INFO TABS
export function ProductInformationTabs({
  product,
  locale,
  labels,
}: {
  product: Product;
  locale: Locale;
  labels: ProductDetailLabels;
}) {
  const isVi = locale === "vi";

  // Simulate PDF Download Action
  const handlePdfDownload = () => {
    alert(isVi ? "Bản vẽ kỹ thuật PDF đang được chuẩn bị. Quý khách vui lòng liên hệ tư vấn viên để nhận bản CAD chính xác nhất." : "Technical PDF sheet is being generated. Please contact showroom representatives for exact CAD files.");
  };

  return (
    <Tabs defaultValue="overview" className="w-full">
      {/* Clean Tab Header with simple underline active bar */}
      <div className="border-b border-slate-100 pb-px">
        <TabsList className="flex w-full gap-8 bg-transparent p-0 justify-start overflow-x-auto scrollbar-none">
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
              className="relative bg-transparent p-0 pb-4 text-sm font-semibold text-slate-400 border-b-2 border-transparent transition-all rounded-none hover:text-primary data-[state=active]:text-primary data-[state=active]:border-primary !shadow-none !h-auto cursor-pointer"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* Tab: Overview */}
      <TabsContent value="overview" className="pt-8 focus-visible:outline-none">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {labels.tabsOverview}
            </span>
            <h2 className="font-heading text-2xl font-semibold text-slate-800 leading-tight">
              {labels.overviewTitle}
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-light">
              {localized(product.description, locale)}
            </p>
          </div>
          
          {/* Key Facts list */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isVi ? "Đặc điểm nổi bật" : "Key Craftsmanship Points"}
            </h3>
            <div className="grid gap-3">
              {product.tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50"
                >
                  <CheckCircle2 className="size-4.5 text-slate-700 shrink-0" />
                  <p className="text-xs sm:text-sm font-medium text-slate-700">{tag}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Tab: Specifications */}
      <TabsContent value="specifications" className="pt-8 focus-visible:outline-none">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {labels.tabsSpecifications}
            </span>
            <h2 className="font-heading text-2xl font-semibold text-slate-800 mt-1 leading-tight">
              {labels.specificationsTitle}
            </h2>
          </div>
          {/* Spec PDF Download button */}
          <button
            type="button"
            onClick={handlePdfDownload}
            className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-400 bg-white px-3 py-1.5 rounded-lg shadow-sm font-semibold transition cursor-pointer"
          >
            <Download className="size-3.5" />
            {isVi ? "Tải tài liệu kỹ thuật (PDF)" : "Download Spec Sheet (PDF)"}
          </button>
        </div>

        <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm max-w-3xl">
          {product.specs.map((spec, index) => (
            <div
              key={localized(spec.label, locale)}
              className={`grid grid-cols-[1fr_1.5fr] gap-4 px-5 py-4 border-b border-slate-100 last:border-b-0 text-xs sm:text-sm ${
                index % 2 === 0 ? "bg-slate-50/30" : "bg-white"
              }`}
            >
              <p className="font-bold text-slate-700">{localized(spec.label, locale)}</p>
              <p className="text-slate-600 font-light">{localized(spec.value, locale)}</p>
            </div>
          ))}
        </div>
      </TabsContent>

      {/* Tab: Materials & Craftsmanship */}
      <TabsContent value="materials" className="pt-8 focus-visible:outline-none">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {labels.tabsMaterials}
            </span>
            <h2 className="font-heading text-2xl font-semibold text-slate-800 leading-tight">
              {labels.materialsTitle}
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm font-light">
              {labels.materialsLead}
            </p>
          </div>
          <div className="bg-primary text-white p-6 rounded-xl space-y-3.5 border border-primary/20 shadow-lg">
            <Wrench className="size-7 text-white/80" />
            <p className="text-xs sm:text-sm leading-relaxed text-white/90 font-light italic">
              &ldquo;{labels.craftsmanshipNote}&rdquo;
            </p>
          </div>
        </div>
      </TabsContent>

      {/* Tab: Dimensions & Care */}
      <TabsContent value="care" className="pt-8 focus-visible:outline-none">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {labels.tabsDimensionsCare}
            </span>
            <h2 className="font-heading text-2xl font-semibold text-slate-800 leading-tight">
              {labels.dimensionsCareTitle}
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm font-light">
              {labels.dimensionsCareLead}
            </p>
          </div>
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 flex gap-4">
            <Info className="size-6 text-slate-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-800">
                {isVi ? "Hướng dẫn chăm sóc gỗ & đệm" : "Maintenance Care Instruction"}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                {labels.careNote}
              </p>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Tab: Delivery & Warranty */}
      <TabsContent value="delivery" className="pt-8 focus-visible:outline-none">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="border border-slate-100 p-5 rounded-xl bg-slate-50/30 space-y-3 shadow-sm">
            <Truck className="size-7 text-slate-600" />
            <h3 className="font-heading text-base font-bold text-slate-800">
              {isVi ? "Vận chuyển lắp đặt tận nhà" : "White-glove Home Delivery"}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-light">
              {labels.deliveryWarrantyLead}
            </p>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              {labels.deliveryNote}
            </p>
          </div>
          
          <div className="border border-slate-100 p-5 rounded-xl bg-slate-50/30 space-y-3 shadow-sm">
            <ShieldCheck className="size-7 text-slate-600" />
            <h3 className="font-heading text-base font-bold text-slate-800">
              {isVi ? "Cam kết bảo hành chính hãng" : "Product Warranty Policies"}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-light">
              {labels.warrantyNote}
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

// 4. HEART / WISHLIST SAVE BUTTON
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

// 5. CLIENT-SIDE ACTION GROUP TO TRIGGER MODAL FORM
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

  // Extract category info from product
  const categoryId = typeof product.category === "object" && "id" in product.category 
    ? String(product.category.id) 
    : "";

  return (
    <div className="mt-8 space-y-3">
      {/* Dialog containing QuoteForm */}
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
              categoryId={categoryId}
              sourcePath={`/${locale}/products/${product.slug}`}
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
