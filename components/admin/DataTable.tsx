"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Column<T> = {
  key: string;
  header: string;
  width?: string;
  render: (row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  pageSize = 10,
  className,
  emptyMessage = "Không có dữ liệu.",
  loading,
  error,
  onRetry,
}: DataTableProps<T>) {
  const [page, setPage] = React.useState(0);
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = React.useState("");

  const sorted = React.useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      const comparison = String(aValue).localeCompare(String(bValue), "vi");
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  const filtered = React.useMemo(() => {
    if (!searchQuery.trim()) return sorted;
    const query = searchQuery.trim().toLowerCase();
    return sorted.filter((row) =>
      columns.some((column) => {
        const value = row[column.key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      })
    );
  }, [sorted, searchQuery, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageData = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const handleSort = (key: string) => {
    setSortKey((current) => {
      if (current !== key) {
        setSortDirection("asc");
        return key;
      }
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
      return key;
    });
  };

  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-100" />
        <div className="surface-soft overflow-hidden rounded-xl border bg-white">
          <div className="border-b border-border-subtle bg-slate-50">
            <div className="flex gap-3 px-3 py-3">
              {Array.from({ length: columns.length }).map((_, index) => (
                <div key={index} className="h-3 w-full animate-pulse rounded bg-slate-200" />
              ))}
            </div>
          </div>
          <div className="divide-y divide-border-subtle">
            {Array.from({ length: pageSize }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex gap-3 px-3 py-3.5">
                {Array.from({ length: columns.length }).map((_, columnIndex) => (
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

  if (error) {
    return (
      <div className={cn("rounded-xl border border-red-200 bg-red-50 p-8 text-center", className)}>
        <p className="font-semibold text-red-700">{error}</p>
        {onRetry ? (
          <button type="button" className="button-pd mt-4 text-xs text-white" onClick={onRetry}>
            Thử lại
          </button>
        ) : null}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className={cn("rounded-xl border border-dashed bg-slate-50 p-8 text-center text-slate-400", className)}>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <input
          className="input-pd bg-white pl-9"
          placeholder="Tìm kiếm..."
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            setPage(0);
          }}
        />
      </div>
      <div className="surface-soft overflow-hidden rounded-xl border bg-white">
        <div className="grid bg-slate-50 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500"
          style={{ gridTemplateColumns: columns.map((column) => column.width || `1fr`).join(" ") }}>
          {columns.map((column) => (
            <button
              key={column.key}
              type="button"
              className="text-left"
              onClick={() => handleSort(column.key)}
            >
              <span className="flex items-center gap-1">
                {column.header}
                {sortKey === column.key ? (
                  <span aria-hidden className="text-[9px]">{sortDirection === "asc" ? "▲" : "▼"}</span>
                ) : null}
              </span>
            </button>
          ))}
        </div>
        <div className="divide-y divide-border-subtle">
          {pageData.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="grid items-center px-4 py-3.5 text-sm"
              style={{ gridTemplateColumns: columns.map((column) => column.width || `1fr`).join(" ") }}
            >
              {columns.map((column) => (
                <div key={column.key}>{column.render(row)}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {filtered.length === 0
            ? "0 kết quả"
            : `${safePage * pageSize + 1}–${Math.min((safePage + 1) * pageSize, filtered.length)} / ${filtered.length}`}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className="button-pd-secondary px-3 py-1.5 text-xs disabled:opacity-40"
            disabled={safePage === 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
          >
            Trước
          </button>
          <button
            type="button"
            className="button-pd-secondary px-3 py-1.5 text-xs disabled:opacity-40"
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
