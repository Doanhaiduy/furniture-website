"use client";

import { useEffect, useState } from "react";

export type ArticleTocItem = {
  id: string;
  title: string;
};

export function ArticleToc({
  items,
  title,
  className = "",
}: {
  items: ArticleTocItem[];
  title: string;
  className?: string;
}) {
  const [activeId, setActiveId] = useState(items[0]?.id);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      {
        rootMargin: "-18% 0px -62% 0px",
        threshold: [0.1, 0.35, 0.7],
      }
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label={title} className={className}>
      <p className="label-pd">{title}</p>
      <ol className="mt-4 grid gap-1.5">
        {items.map((item, index) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`grid grid-cols-[2rem_1fr] rounded-xl border px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/25 ${
                  active
                    ? "border-outline-variant/35 bg-surface-container-low text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]"
                    : "border-transparent text-secondary hover:border-outline-variant/35 hover:bg-white/70 hover:text-primary"
                }`}
              >
                <span className="text-xs text-outline">0{index + 1}</span>
                <span>{item.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
