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
  const sanitizedSrc = src?.startsWith("http://local-assets") 
    ? src.replace("http://local-assets", "") 
    : src;

  return (
    <img
      src={sanitizedSrc}
      alt={alt}
      className={className}
      loading={loading ?? (priority ? "eager" : "lazy")}
    />
  );
}
