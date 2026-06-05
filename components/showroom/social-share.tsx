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
        className="inline-flex size-9 items-center justify-center rounded-md border border-outline-variant/50 bg-surface-container-lowest text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition hover:-translate-y-0.5 hover:border-primary/45 hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/25"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
        rel="noreferrer"
        target="_blank"
        aria-label="Facebook"
      >
        <Globe2 className="size-4" />
      </a>
      <a
        className="inline-flex size-9 items-center justify-center rounded-md border border-outline-variant/50 bg-surface-container-lowest text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition hover:-translate-y-0.5 hover:border-primary/45 hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/25"
        href={`https://zalo.me/share?u=${encoded}`}
        rel="noreferrer"
        target="_blank"
        aria-label="Zalo"
      >
        <Send className="size-4" />
      </a>
      <button
        type="button"
        className="inline-flex size-9 items-center justify-center rounded-md border border-outline-variant/50 bg-surface-container-lowest text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition hover:-translate-y-0.5 hover:border-primary/45 hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/25"
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
