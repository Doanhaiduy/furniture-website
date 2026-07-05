"use client";

import {
  Maximize2,
  Trash2,
} from "lucide-react";
import {
  MediaPicker,
} from "../admin-interactions";




import { ZoomableImage } from "@/components/ui/zoomable-image";
import { assetUrl } from "@/lib/asset-url";


// --- MULTI-IMAGE GALLERY UPLOAD ---
export function MultiImageGalleryUpload({
  value = [],
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const handleRemoveImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {value.map((url, index) => (
        <div key={index} className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm group">
          <div className="relative h-full w-full overflow-hidden rounded-lg bg-slate-100">
            <ZoomableImage src={url} alt={`Ảnh thư viện ${index + 1}`} className="block h-full w-full" hint={false}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={assetUrl(url)} alt={`Ảnh thư viện ${index + 1}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
            </ZoomableImage>
            {/* Visual-only hover hint; clicks pass through to open the lightbox. */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Maximize2 className="size-5 text-white/90" />
            </div>
            <button
              type="button"
              className="absolute right-1.5 top-1.5 z-10 hidden rounded-full bg-red-600 p-1.5 text-white shadow-sm transition hover:bg-red-700 group-hover:block"
              onClick={() => handleRemoveImage(index)}
              title="Xóa ảnh"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
      ))}

      <div className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white hover:border-indigo-500 hover:bg-indigo-50/10 transition text-center">
        <MediaPicker
          value=""
          onChange={(url) => {
            if (url) onChange([...value, url]);
          }}
          label="Thêm ảnh"
        />
      </div>
    </div>
  );
}

