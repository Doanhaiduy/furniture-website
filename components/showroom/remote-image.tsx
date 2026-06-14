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
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading ?? (priority ? "eager" : "lazy")}
    />
  );
}
