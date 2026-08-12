"use client";

import { useEffect, useState } from "react";

export type ArticleTocItem = {
  id: string;
  title: string;
  level?: number;
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
    setActiveId(items[0]?.id);
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

  let h2Number = 0;
  const displayItems = items.map((item) => ({
    ...item,
    number: item.level === 3 ? null : ++h2Number,
  }));

  if (displayItems.length === 0) return null;

  return (
    <nav aria-label={title} className={className}>
      <p className="label-pd">{title}</p>
      <ol className="mt-4 grid gap-1.5">
        {displayItems.map((item) => {
          const active = item.id === activeId;
          const isH3 = item.level === 3;
          return (
            <li key={item.id} className={isH3 ? "pl-5" : ""}>
              <a
                href={`#${item.id}`}
                aria-current={active ? "location" : undefined}
                className="public-toc-link"
              >
                {isH3 ? (
                  <span className="text-xs text-outline mr-1.5">—</span>
                ) : (
                  <span className="text-xs text-outline">{String(item.number).padStart(2, "0")}</span>
                )}
                <span>{item.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
