"use client";

import { useEffect, useState } from "react";
import { Check, Globe2, Link2, Send, Share2 } from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";
import { copyTextToClipboard } from "@/lib/clipboard";

export function SocialShare({
  label,
  copyLabel,
  copiedLabel,
  url,
  title,
}: {
  label: string;
  copyLabel: string;
  /** Toast/tooltip text shown after a successful copy. Falls back to copyLabel. */
  copiedLabel?: string;
  url: string;
  /** Title used by the native share sheet (e.g. article or product name). */
  title?: string;
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  // Resolved only after mount so SSR and first client render agree (no hydration mismatch).
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);

  // Absolute URL for share targets; falls back to the relative path until mounted.
  const shareUrl = origin ? new URL(url, origin).toString() : url;
  const absoluteUrl = () =>
    typeof window !== "undefined" ? new URL(url, window.location.origin).toString() : url;

  const copiedMessage = copiedLabel || copyLabel;

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(absoluteUrl());
    if (ok) {
      setCopied(true);
      toast.success(copiedMessage);
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error(copyLabel);
    }
  };

  const handleShare = async () => {
    const shareUrl = absoluteUrl();
    // Prefer the native Web Share API where available (mobile + some desktops).
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: title || document.title, url: shareUrl });
        return;
      } catch (err) {
        // User dismissed the share sheet — not an error worth surfacing.
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    // Fallback: copy the link and let the user paste it anywhere.
    await handleCopy();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="label-pd">{label}</span>

      {/* Primary share action — native share sheet with copy fallback */}
      <button
        type="button"
        className="button-pd-outline inline-flex h-9 items-center gap-2 px-3 text-xs"
        onClick={handleShare}
        aria-label={label}
      >
        <Share2 className="size-4" />
        <span>{label}</span>
      </button>

      <a
        className="btn-pd-icon size-9"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        rel="noreferrer"
        target="_blank"
        aria-label="Facebook"
      >
        <Globe2 className="size-4" />
      </a>
      <a
        className="btn-pd-icon size-9"
        href={`https://zalo.me/share?u=${encodeURIComponent(shareUrl)}`}
        rel="noreferrer"
        target="_blank"
        aria-label="Zalo"
      >
        <Send className="size-4" />
      </a>
      <button
        type="button"
        className="btn-pd-icon size-9"
        aria-label={copiedLabel && copied ? copiedLabel : copyLabel}
        aria-pressed={copied}
        onClick={handleCopy}
      >
        {copied ? <Check className="size-4 text-emerald-600" /> : <Link2 className="size-4" />}
      </button>
    </div>
  );
}
