"use client";

import { useMemo, useState, useEffect } from "react";
import { Maximize2, Download, ExternalLink, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import type { Product } from "@/lib/showroom-data";
import { localized } from "@/lib/showroom-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { RemoteImage } from "../remote-image";

export function ProductGallery({
  product,
  locale,
  labels,
}: {
  product: Product;
  locale: Locale;
  labels: {
    galleryLabel: string;
    enlargeImage: string;
    galleryHelp: string;
  };
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

  const handleDownload = async () => {
    try {
      const response = await fetch(activeImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const filename = activeImage.split("/").pop()?.split("?")[0] || "product-image.jpg";
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(activeImage, "_blank");
    }
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
          <DialogContent 
            showCloseButton={false}
            className="fixed inset-0 top-0 left-0 translate-x-0 translate-y-0 w-screen h-screen max-w-none sm:max-w-none md:max-w-none max-h-none rounded-none border-none bg-slate-950 text-white p-0 m-0 z-[var(--z-modal)] flex flex-col justify-between overflow-hidden gap-0"
          >
            <DialogTitle className="sr-only">{localized(product.name, locale)}</DialogTitle>
            <DialogDescription className="sr-only">{labels.galleryHelp}</DialogDescription>
            
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-950/40 backdrop-blur-md">
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-heading text-sm md:text-base font-bold text-white/90 truncate max-w-[50vw]">
                  {localized(product.name, locale)}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-white/60 shrink-0">
                  {activeIndex + 1} / {images.length}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="p-2 rounded-full hover:bg-white/10 transition text-white/80 hover:text-white cursor-pointer"
                  title={locale === "vi" ? "Tải ảnh về" : "Download image"}
                >
                  <Download className="size-4" />
                </button>
                <a
                  href={activeImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full hover:bg-white/10 transition text-white/80 hover:text-white cursor-pointer"
                  title={locale === "vi" ? "Mở trong tab mới" : "Open in new tab"}
                >
                  <ExternalLink className="size-4" />
                </a>
                <DialogClose asChild>
                  <button className="p-2 rounded-full hover:bg-white/10 transition text-white/80 hover:text-white cursor-pointer">
                    <X className="size-4" />
                  </button>
                </DialogClose>
              </div>
            </div>

            {/* Main Viewport */}
            <div className="relative w-full flex-1 flex items-center justify-center p-4 overflow-hidden">
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-6 z-20 p-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition flex items-center justify-center cursor-pointer border border-white/10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-5" />
                </button>
              )}

              <div className="relative max-h-full max-w-full flex items-center justify-center">
                <img
                  src={activeImage.startsWith("http://local-assets") ? activeImage.replace("http://local-assets", "") : activeImage}
                  alt={localized(product.name, locale)}
                  className="max-h-[82vh] md:max-h-[88vh] max-w-[90vw] md:max-w-[85vw] rounded-lg object-contain select-none shadow-2xl border border-white/5"
                />
              </div>

              {images.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-6 z-20 p-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition flex items-center justify-center cursor-pointer border border-white/10"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-5" />
                </button>
              )}
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
