"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TableSkeletonProps = {
  rows?: number;
  columns?: number;
  className?: string;
};

export function TableSkeleton({ rows = 6, columns = 4, className }: TableSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-100" />
      <div className="surface-soft overflow-hidden rounded-xl border bg-white">
        <div className="border-b border-border-subtle bg-slate-50">
          <div className="flex gap-3 px-3 py-3">
            {Array.from({ length: columns }).map((_, index) => (
              <div key={index} className="h-3 w-full animate-pulse rounded bg-slate-200" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-border-subtle">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-3 px-3 py-3.5">
              {Array.from({ length: columns }).map((_, columnIndex) => (
                <div
                  key={columnIndex}
                  className="h-3 w-full animate-pulse rounded bg-slate-100"
                  style={{ animationDelay: `${rowIndex * 40 + columnIndex * 20}ms` }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type ErrorFallbackProps = {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorFallback({
  title = "Không thể tải dữ liệu",
  description = "Vui lòng thử lại sau giây lát.",
  retryLabel = "Thử lại",
  onRetry,
  className,
}: ErrorFallbackProps) {
  return (
    <div className={cn("rounded-xl border border-red-200 bg-red-50 p-8 text-center", className)}>
      <p className="font-semibold text-red-700">{title}</p>
      <p className="mt-2 text-sm text-red-600">{description}</p>
      {onRetry ? (
        <button type="button" className="button-pd mt-4 text-xs text-white" onClick={onRetry}>
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
