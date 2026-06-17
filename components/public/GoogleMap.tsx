/**
 * GoogleMap — safe Google Maps embed component with URL validation.
 * Only renders the iframe if the embedUrl passes strict validation.
 * Falls back to a safe link-out if invalid/empty.
 */

import { ExternalLink, MapPin } from "lucide-react";

/**
 * Validates a Google Maps embed URL.
 * Only allow the official embed domain/path pattern.
 */
function isValidGoogleMapsEmbedUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  try {
    const parsed = new URL(trimmed);
    // Must be HTTPS
    if (parsed.protocol !== "https:") return false;
    // Must be google.com or maps.google.com (no subdomains like evil.google.com.attacker.com)
    if (
      parsed.hostname !== "www.google.com" &&
      parsed.hostname !== "google.com" &&
      parsed.hostname !== "maps.google.com"
    ) {
      return false;
    }
    // Must be the embed path
    if (!parsed.pathname.startsWith("/maps/embed")) return false;
    return true;
  } catch {
    return false;
  }
}

interface GoogleMapProps {
  embedUrl: string | null | undefined;
  fallbackUrl: string;
  name: string;
  className?: string;
}

export function GoogleMap({ embedUrl, fallbackUrl, name, className = "h-full w-full border-0" }: GoogleMapProps) {
  const valid = isValidGoogleMapsEmbedUrl(embedUrl);

  if (!valid) {
    // Safe fallback: show a placeholder with link to Google Maps
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
        <MapPin className="size-8 text-slate-400" />
        <p className="text-sm font-medium">{name}</p>
        <a
          href={fallbackUrl || "https://www.google.com/maps"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <ExternalLink className="size-3.5" />
          Xem trên Google Maps
        </a>
      </div>
    );
  }

  return (
    <iframe
      title={name}
      className={className}
      loading="lazy"
      src={embedUrl!}
      sandbox="allow-scripts allow-same-origin allow-popups"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
