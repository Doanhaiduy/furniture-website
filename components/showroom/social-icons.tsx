import { Globe2 } from "lucide-react";
import type { SVGProps } from "react";

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H17V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.6V13h2.7v8h3.2z" />
    </svg>
  );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.7-1.7C19.4 5.2 12 5.2 12 5.2s-7.4 0-8.9.4A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.7 1.7c1.5.4 8.9.4 8.9.4s7.4 0 8.9-.4a2.5 2.5 0 0 0 1.7-1.7C23 15.2 23 12 23 12zM9.8 15.1V8.9l5.3 3.1-5.3 3.1z" />
    </svg>
  );
}

function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.5 3c.3 2.1 1.6 3.7 3.7 4v2.4c-1.3 0-2.5-.3-3.7-1v5.9c0 3.2-2.4 5.7-5.6 5.7A5.6 5.6 0 0 1 5.3 14a5.6 5.6 0 0 1 6.6-5.5v2.5a3.1 3.1 0 0 0-1-.2 3 3 0 0 0 0 6c1.7 0 2.9-1.3 2.9-3V3h2.7z" />
    </svg>
  );
}

/**
 * Renders the right brand mark for a configured social platform.
 * Zalo uses its official webp badge; other brands use inline SVGs since this
 * lucide-react version no longer ships brand glyphs.
 */
export function SocialIcon({ platform, className = "size-4" }: { platform?: string; className?: string }) {
  const key = (platform || "").toLowerCase();
  if (key === "zalo") {
    return <img src="/icon_zalo.webp" alt="Zalo" className="size-5 rounded-[4px] object-cover" />;
  }
  if (key === "facebook") return <FacebookIcon className={className} />;
  if (key === "instagram") return <InstagramIcon className={className} />;
  if (key === "youtube") return <YoutubeIcon className={className} />;
  if (key === "tiktok") return <TikTokIcon className={className} />;
  return <Globe2 className={className} />;
}
