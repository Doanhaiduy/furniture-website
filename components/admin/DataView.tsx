"use client";

import { useState, useEffect, type ReactNode } from "react";
import { LayoutGrid, List, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterBar, type FilterConfig } from "./FilterBar";
import { useAdminFilters, type SortDir } from "@/lib/hooks/useAdminFilters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationBar } from "./PaginationBar";

export { PaginationBar };

const STORAGE_KEY = "pd-admin-view-mode";

export type ViewMode = "list" | "grid";

export interface ColumnDef {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
}

interface DataViewProps {
  data: unknown[];
  totalCount: number;
  isLoading?: boolean;
  error?: string;
  filterConfigs: FilterConfig[];
  searchPlaceholder?: string;
  defaultSort?: string;
  defaultDir?: SortDir;
  defaultLimit?: number;
  columns?: ColumnDef[];
  renderListRow: (item: unknown, index: number) => ReactNode;
  renderGridCard: (item: unknown, index: number) => ReactNode;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  // Optional: disable grid mode for special pages
  disableGrid?: boolean;
}

export function DataView({
  data,
  totalCount,
  isLoading = false,
  error,
  filterConfigs,
  searchPlaceholder,
  defaultSort = "",
  defaultDir = "asc",
  defaultLimit = 20,
  columns = [],
  renderListRow,
  renderGridCard,
  emptyMessage = "Không tìm thấy kết quả nào.",
  emptyIcon,
  disableGrid = false,
}: DataViewProps) {
  const filters = useAdminFilters();

  const [viewMode, setViewMode] = useState<ViewMode>("list");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "grid" || saved === "list") setViewMode(saved as ViewMode);
  }, []);

  const handleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  };

  const currentPage = filters.getPage();
  const currentLimit = filters.getLimit();
  const currentSort = filters.getSort(defaultSort);
  const currentDir = filters.getDir(defaultDir);
  const q = filters.getFilter("q");

  const totalPages = Math.max(1, Math.ceil(totalCount / currentLimit));

  const filterValues: Record<string, string> = {};
  filterConfigs.forEach((f) => {
    const v = filters.getFilter(f.key);
    if (v) filterValues[f.key] = v;
  });
  if (q) filterValues.q = q;

  const handleSort = (key: string) => {
    const nextDir: SortDir =
      currentSort === key && currentDir === "asc" ? "desc" : "asc";
    filters.setSort(key, nextDir);
  };

  return (
    <div className="space-y-4">
      <FilterBar
        filters={filterConfigs}
        values={filterValues}
        onFilterChange={filters.setFilter}
        onSearch={filters.setSearch}
        searchValue={q}
        searchPlaceholder={searchPlaceholder}
        totalCount={totalCount}
        currentCount={data.length}
        currentSort={currentSort}
        currentDir={currentDir}
        onSortChange={(sort, dir) => filters.setSort(sort, dir)}
        sortableColumns={columns.filter((c) => c.sortable)}
      />

      {/* Toolbar: view toggle */}
      {!disableGrid && (
        <div className="flex items-center justify-end gap-4">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Xem dạng danh sách"
              title="Danh sách"
              className={cn(
                "flex items-center justify-center rounded-lg border p-1.5 transition",
                viewMode === "list"
                  ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]/8 text-[var(--admin-accent)]"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              )}
              onClick={() => handleViewMode("list")}
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Xem dạng lưới"
              title="Lưới"
              className={cn(
                "flex items-center justify-center rounded-lg border p-1.5 transition",
                viewMode === "grid"
                  ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]/8 text-[var(--admin-accent)]"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              )}
              onClick={() => handleViewMode("grid")}
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-7 animate-spin text-[var(--admin-accent)]" />
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-sm font-semibold text-red-700">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && data.length === 0 && (
        <div className="rounded-xl border border-dashed bg-slate-50 p-12 text-center text-slate-400">
          {emptyIcon && <div className="mb-3 flex justify-center">{emptyIcon}</div>}
          <p className="text-sm">{emptyMessage}</p>
        </div>
      )}

      {/* Content: list or grid */}
      {!isLoading && !error && data.length > 0 && (
        <>
          {/* List view */}
          {(viewMode === "list" || disableGrid) && (
            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
              {/* Column headers */}
              {columns.length > 0 && (
                <div
                  className="grid items-center gap-4 bg-slate-50 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500"
                  style={{
                    gridTemplateColumns: columns
                      .map((c) => c.width ?? "1fr")
                      .join(" "),
                  }}
                >
                  {columns.map((col) => (
                    <span key={col.key}>{col.label}</span>
                  ))}
                </div>
              )}
              <div className="divide-y divide-slate-100">
                {data.map((item, i) => renderListRow(item, i))}
              </div>
            </div>
          )}

          {/* Grid view */}
          {viewMode === "grid" && !disableGrid && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.map((item, i) => renderGridCard(item, i))}
            </div>
          )}
        </>
      )}

      {/* Skeleton when loading */}
      {isLoading && (
        <div className="overflow-hidden rounded-xl border bg-white">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-slate-100 px-4 py-3.5">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                <div className="h-2 w-1/2 animate-pulse rounded bg-slate-100" />
              </div>
              <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {/* Pagination & Limit Section */}
      {!isLoading && !error && data.length > 0 && (
        <div className="mt-8 flex flex-col items-center justify-center gap-4 border-t border-slate-100 pt-6">
          {totalPages > 1 && (
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={filters.setPage}
            />
          )}

          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-slate-500">
            <span suppressHydrationWarning>
              Hiển thị <span className="font-semibold">{Math.min((currentPage - 1) * currentLimit + 1, totalCount)}–{Math.min(currentPage * currentLimit, totalCount)}</span> trong{" "}
              <span className="font-semibold">{totalCount}</span> kết quả
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <span>Hiển thị:</span>
              <Select
                value={String(currentLimit)}
                onValueChange={(val) => {
                  filters.setLimit(parseInt(val, 10));
                }}
              >
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200 min-w-[100px] rounded-lg">
                  <SelectValue placeholder={`${currentLimit} / trang`} />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} / trang
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

