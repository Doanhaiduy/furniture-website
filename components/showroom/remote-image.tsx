"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const FALLBACK_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><rect width='800' height='600' fill='%23f1f5f9'/><path d='M360 250a40 40 0 1 1 80 0 40 40 0 0 1 -80 0zm-80 170l150-150 150 150H280z' fill='%23cbd5e1'/></svg>";

export function RemoteImage({
  src,
  alt,
  className,
  priority,
  loading,
  sizes,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
  sizes?: string;
}) {
  const [imgSrc, setImgSrc] = useState<string>(src || FALLBACK_IMAGE);

  useEffect(() => {
    setImgSrc(src || FALLBACK_IMAGE);
  }, [src]);

  const sanitizedSrc = imgSrc.startsWith("http://local-assets") 
    ? imgSrc.replace("http://local-assets", "") 
    : imgSrc;

  return (
    <div className={`relative overflow-hidden ${className || ""}`}>
      <Image
        src={sanitizedSrc}
        alt={alt || ""}
        fill
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        priority={priority}
        loading={priority ? undefined : (loading ?? "lazy")}
        style={{ objectFit: "cover" }}
        onError={() => {
          setImgSrc(FALLBACK_IMAGE);
        }}
      />
    </div>
  );
}

