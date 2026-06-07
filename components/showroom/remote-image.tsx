import Image from "next/image";

export function RemoteImage({
  src,
  alt,
  className,
  priority,
  loading,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
  sizes?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={1400}
      height={900}
      className={className}
      priority={priority}
      loading={loading ?? (priority ? "eager" : undefined)}
      fetchPriority={priority ? "high" : undefined}
      sizes={sizes}
      unoptimized
    />
  );
}
