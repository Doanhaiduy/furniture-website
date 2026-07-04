/**
 * Normalize a stored media URL for use in a plain <img src>.
 *
 * Seed/legacy assets are stored with a synthetic `http://local-assets` host that
 * maps to files served from /public. A raw <img> cannot load that host, so strip
 * it to a root-relative path. Real remote URLs (https, Cloudinary, Unsplash) and
 * data URIs are returned unchanged.
 */
export function assetUrl(src?: string | null): string {
  if (!src) return "";
  return src.startsWith("http://local-assets") ? src.replace("http://local-assets", "") : src;
}
