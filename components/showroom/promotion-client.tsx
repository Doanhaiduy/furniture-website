"use client";

import { useState } from "react";
import { Check, Copy, Tag, ArrowRight } from "lucide-react";
import { copyTextToClipboard } from "@/lib/clipboard";

export function PromotionCouponButton({
  code,
  copiedLabel = "Đã sao chép!",
  copyLabel = "Sao chép mã",
}: {
  code: string;
  copiedLabel?: string;
  copyLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(code);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary hover:text-white transition-all duration-200 shadow-sm"
    >
      <Tag className="size-3.5" />
      <span className="font-mono">{code}</span>
      <span className="h-4 w-px bg-primary/20" />
      {copied ? (
        <span className="flex items-center gap-1 text-emerald-600 font-sans normal-case">
          <Check className="size-3.5" />
          {copiedLabel}
        </span>
      ) : (
        <span className="flex items-center gap-1 font-sans normal-case font-medium">
          <Copy className="size-3.5" />
          {copyLabel}
        </span>
      )}
    </button>
  );
}

export function PromotionQuickJump({
  campaigns,
  title = "Chương trình đang diễn ra",
  locale = "vi",
}: {
  campaigns: Array<{
    id: string;
    title: string;
    tag: string;
    discount: string;
    statusLabel: string;
    status: string;
    badgeColor: string;
    startAtStr: string;
    endAtStr: string;
  }>;
  title?: string;
  locale?: string;
}) {
  const handleScroll = (id: string) => {
    const el = document.getElementById(`campaign-${id}`);
    if (el) {
      const offset = 90; // account for sticky header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full border-y border-outline-variant/20 bg-surface-container-lowest py-3 shadow-sm select-none">
      <div className="container-pd flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-secondary">
            {title}
          </span>
        </div>

        <div className="flex flex-nowrap overflow-x-auto gap-2.5 pb-1 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
          {campaigns.map((c) => (
            <button
              key={c.id}
              onClick={() => handleScroll(c.id)}
              className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-4 py-1.5 text-xs font-medium text-slate-700 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 shrink-0"
            >
              <span className={`inline-block size-1.5 rounded-full ${c.status === "active" ? "bg-emerald-500" : "bg-blue-500"}`} />
              <span className="font-semibold text-primary">{c.discount}</span>
              <span className="h-3 w-px bg-outline-variant" />
              <span className="max-w-[120px] sm:max-w-[200px] truncate">{c.title}</span>
              <ArrowRight className="size-3 text-outline" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
