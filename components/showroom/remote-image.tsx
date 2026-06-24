import Image from "next/image";

export function RemoteImage({
  src,
  alt,
  className,
  priority,
  loading,
  sizes,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
  sizes?: string;
}) {
  if (!src) return null;
  const sanitizedSrc = src.startsWith("http://local-assets") 
    ? src.replace("http://local-assets", "") 
    : src;

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
      />
    </div>
  );
}
