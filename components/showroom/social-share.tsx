"use client";

import { useState } from "react";
import { Globe2, Link2, Send, Share2 } from "lucide-react";

export function SocialShare({
  label,
  copyLabel,
  url,
}: {
  label: string;
  copyLabel: string;
  url: string;
}) {
  const [copied, setCopied] = useState(false);
  const encoded = encodeURIComponent(url);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="label-pd">{label}</span>
      <a
        className="btn-pd-icon size-9"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
        rel="noreferrer"
        target="_blank"
        aria-label="Facebook"
      >
        <Globe2 className="size-4" />
      </a>
      <a
        className="btn-pd-icon size-9"
        href={`https://zalo.me/share?u=${encoded}`}
        rel="noreferrer"
        target="_blank"
        aria-label="Zalo"
      >
        <Send className="size-4" />
      </a>
      <button
        type="button"
        className="btn-pd-icon size-9"
        aria-label={copyLabel}
        aria-pressed={copied}
        onClick={async () => {
          const absoluteUrl = new URL(url, window.location.origin).toString();
          try {
            await navigator.clipboard.writeText(absoluteUrl);
            setCopied(true);
          } catch {
            setCopied(false);
          }
        }}
      >
        <Link2 className="size-4" />
      </button>
      <Share2 className="size-4 text-outline" aria-hidden />
    </div>
  );
}
