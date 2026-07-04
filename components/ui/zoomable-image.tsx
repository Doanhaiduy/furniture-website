"use client";

import { useState, type ReactNode } from "react";
import { Maximize2, X, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

function normalize(src: string) {
  return src?.startsWith("http://local-assets") ? src.replace("http://local-assets", "") : src;
}

/**
 * A drop-in clickable image that opens a full-screen lightbox on click.
 *
 * Usage patterns:
 *  - Plain preview (admin):  <ZoomableImage src={url} alt="Logo" imgClassName="h-16 w-16 object-contain" />
 *  - Wrap existing markup:   <ZoomableImage src={url} alt={name}><RemoteImage .../></ZoomableImage>
 *
 * Shared by public product detail (item 5) and every admin image preview (item 12)
 * so the enlarge behavior is consistent across the app.
 */
export function ZoomableImage({
  src,
  alt = "",
  imgClassName = "",
  className = "",
  hint = true,
  children,
}: {
  src?: string | null;
  alt?: string;
  /** classes for the built-in <img> when `children` is not provided */
  imgClassName?: string;
  /** classes for the clickable wrapper button */
  className?: string;
  /** show the hover "enlarge" affordance */
  hint?: boolean;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  // Nothing to show and nothing wrapped → render nothing.
  if (!src && !children) return null;
  // Wrapped content but no resolvable src → just render the content, non-interactive.
  if (!src) return <>{children}</>;

  const full = normalize(src);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group/zoom relative block cursor-zoom-in overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${className}`}
        aria-label={alt ? `Phóng to ảnh: ${alt}` : "Phóng to ảnh"}
        title={alt || "Phóng to ảnh"}
      >
        {children ?? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={full} alt={alt} className={imgClassName} loading="lazy" />
        )}
        {hint && (
          <span className="pointer-events-none absolute right-1.5 top-1.5 z-10 flex size-6 items-center justify-center rounded-md bg-slate-900/55 text-white opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-200 group-hover/zoom:opacity-100">
            <Maximize2 className="size-3.5" />
          </span>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="fixed inset-0 top-0 left-0 z-[var(--z-modal)] m-0 flex h-screen w-screen max-h-none max-w-none translate-x-0 translate-y-0 flex-col justify-between gap-0 overflow-hidden rounded-none border-none bg-slate-950 p-0 text-white sm:max-w-none md:max-w-none"
        >
          <DialogTitle className="sr-only">{alt || "Ảnh"}</DialogTitle>
          <DialogDescription className="sr-only">
            Nhấn Esc hoặc nút đóng để thoát chế độ xem toàn màn hình.
          </DialogDescription>

          {/* Top bar */}
          <div className="flex w-full items-center justify-between border-b border-white/5 bg-slate-950/40 px-6 py-4 backdrop-blur-md">
            <span className="min-w-0 truncate pr-3 font-heading text-sm font-bold text-white/90 md:text-base">
              {alt || "Xem ảnh"}
            </span>
            <div className="flex shrink-0 items-center gap-2">
              <a
                href={full}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                title="Mở trong tab mới"
              >
                <ExternalLink className="size-4" />
              </a>
              <DialogClose asChild>
                <button className="cursor-pointer rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white" title="Đóng">
                  <X className="size-4" />
                </button>
              </DialogClose>
            </div>
          </div>

          {/* Image viewport */}
          <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={full}
              alt={alt}
              className="max-h-[85vh] max-w-[92vw] select-none rounded-lg border border-white/5 object-contain shadow-2xl md:max-h-[88vh] md:max-w-[88vw]"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
