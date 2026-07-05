"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";















export interface Brand {
  id: string;
  name: { vi: string; en: string };
  origin?: string;
  logo_url?: string;
  status: "draft" | "published" | "archived";
  sort_order: number;
  slug?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-outline-variant/30 bg-surface px-4 py-3 sm:px-6 mt-4">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-outline bg-surface-container px-4 py-2 text-sm font-medium text-primary hover:bg-surface-container-high disabled:opacity-50 transition"
        >
          Trước
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-outline bg-surface-container px-4 py-2 text-sm font-medium text-primary hover:bg-surface-container-high disabled:opacity-50 transition"
        >
          Sau
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-secondary">
            Hiển thị trang <span className="font-semibold text-primary">{currentPage}</span> / <span className="font-semibold text-primary">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-secondary ring-1 ring-inset ring-outline-variant/50 hover:bg-surface-container-high focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition"
            >
              <span className="sr-only">Trước</span>
              <ChevronLeft className="size-4" />
            </button>
            
            {Array.from({ length: totalPages }).map((_, idx) => {
              const p = idx + 1;
              if (totalPages > 7 && Math.abs(p - currentPage) > 2 && p !== 1 && p !== totalPages) {
                if (p === 2 || p === totalPages - 1) {
                  return <span key={p} className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-secondary ring-1 ring-inset ring-outline-variant/50">...</span>;
                }
                return null;
              }
              const active = p === currentPage;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 transition ${
                    active
                      ? "z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      : "text-secondary ring-1 ring-inset ring-outline-variant/50 hover:bg-surface-container-high"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-secondary ring-1 ring-inset ring-outline-variant/50 hover:bg-surface-container-high focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition"
            >
              <span className="sr-only">Sau</span>
              <ChevronRight className="size-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

export function getRelativeTimeString(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return "Hôm qua";
  return `${diffDays} ngày trước`;
}

export function AdminPageHeader({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div>
        <span className="admin-chip-pd">
          <Sparkles className="size-3.5" />
          Không gian quản trị
        </span>
        <h1 className="admin-title-pd mt-3 md:text-2xl">{title}</h1>
        <p className="type-caption mt-2 max-w-3xl text-[13px] text-[var(--admin-text-muted)]">{description}</p>
      </div>
      {actionHref && actionLabel ? (
        <Link className="button-pd shrink-0" href={actionHref}>
          {actionLabel.toLowerCase().startsWith("back") ? <ArrowLeft className="size-4" /> : <Plus className="size-4" />}
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
