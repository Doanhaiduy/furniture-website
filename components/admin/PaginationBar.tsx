"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

export function PaginationBar({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalCount?: number;
  limit?: number;
  onPageChange: (page: number) => void;
}) {
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Phân trang">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="button-pd-outline public-pagination-control min-w-11 px-3"
      >
        <ArrowLeft className="size-4" />
      </button>

      {pages.map((page, i) =>
        page === "..." ? (
          <span
            key={`dot-${i}`}
            className="inline-flex size-10 items-center justify-center text-sm font-bold text-slate-400"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page as number)}
            aria-current={page === currentPage ? "page" : undefined}
            className="public-pagination-link"
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="button-pd-outline public-pagination-control min-w-11 px-3"
      >
        <ArrowRight className="size-4" />
      </button>
    </nav>
  );
}
