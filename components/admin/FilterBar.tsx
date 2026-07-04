"use client";

import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DatePickerField } from "@/components/ui/date-picker";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  type: "select" | "date" | "date-range" | "boolean";
  key: string;
  label: string;
  options?: SelectOption[];
  placeholder?: string;
}

interface FilterBarProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onSearch: (q: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
  totalCount?: number;
  currentCount?: number;
  className?: string;
  currentSort?: string;
  currentDir?: "asc" | "desc";
  onSortChange?: (sort: string, dir: "asc" | "desc") => void;
  sortableColumns?: { key: string; label: string }[];
}

function getSortLabel(key: string, dir: "asc" | "desc", columnLabel: string): string {
  if (key === "updated_at" || key === "published_at" || key === "created_at" || key === "last_login_at") {
    return dir === "desc" ? `${columnLabel} (Mới nhất)` : `${columnLabel} (Cũ nhất)`;
  }
  if (key === "price") {
    return dir === "desc" ? `${columnLabel} (Cao đến thấp)` : `${columnLabel} (Thấp đến cao)`;
  }
  if (key === "sort_order") {
    return dir === "asc" ? "Thứ tự tăng" : "Thứ tự giảm";
  }
  return dir === "asc" ? `${columnLabel} (A-Z)` : `${columnLabel} (Z-A)`;
}

export function FilterBar({
  filters,
  values,
  onFilterChange,
  onSearch,
  searchValue = "",
  searchPlaceholder = "Tìm kiếm...",
  totalCount,
  currentCount,
  className,
  currentSort,
  currentDir,
  onSortChange,
  sortableColumns,
}: FilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [expanded, setExpanded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(value);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const activeFiltersCount = Object.entries(values).filter(
    ([k, v]) => k !== "q" && k !== "page" && k !== "limit" && k !== "sort" && k !== "dir" && v
  ).length;

  return (
    <div className={cn("card-pd p-5 space-y-4 shadow-sm border border-slate-100", className)}>
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <span className="text-sm font-semibold text-slate-700">Bộ lọc tìm kiếm</span>
        {totalCount !== undefined && (
          <span className="text-xs text-slate-500 font-medium">
            Hiển thị {currentCount ?? 0} trên {totalCount} kết quả
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-end">
        {/* Search */}
        <div className="flex flex-col gap-1.5 sm:col-span-2 w-full">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tìm kiếm</span>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              className="input-pd w-full bg-white pl-9 pr-8 text-sm h-9 border border-slate-200 rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {localSearch && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => handleSearchChange("")}
                aria-label="Xóa tìm kiếm"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter controls */}
        {filters
          .filter((f) => f.key !== "dateFrom" && f.key !== "dateTo")
          .map((filter) => (
            <FilterControl
              key={filter.key}
              filter={filter}
              value={values[filter.key] ?? ""}
              onChange={(value) => onFilterChange(filter.key, value)}
            />
          ))}

        {/* Date From & Date To pair */}
        {filters.some((f) => f.key === "dateFrom") && filters.some((f) => f.key === "dateTo") && (
          <div className="flex flex-col gap-1.5 sm:col-span-2 w-full">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Khoảng thời gian</span>
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 min-w-[120px]">
                <DatePickerField
                  value={values.dateFrom ?? ""}
                  onChange={(v) => onFilterChange("dateFrom", v)}
                  placeholder="Từ ngày"
                  ariaLabel="Từ ngày"
                />
              </div>
              <span className="text-slate-400 text-xs shrink-0">—</span>
              <div className="flex-1 min-w-[120px]">
                <DatePickerField
                  value={values.dateTo ?? ""}
                  onChange={(v) => onFilterChange("dateTo", v)}
                  placeholder="Đến ngày"
                  ariaLabel="Đến ngày"
                />
              </div>
            </div>
          </div>
        )}

        {/* Sort Select */}
        {sortableColumns && sortableColumns.length > 0 && onSortChange && (
          <div className="flex flex-col gap-1.5 w-full">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sắp xếp theo</span>
            <Select
              value={currentSort && currentDir && sortableColumns.some((c) => c.key === currentSort) ? `${currentSort}-${currentDir}` : "default"}
              onValueChange={(val) => {
                if (val === "default") {
                  onSortChange("", "asc");
                } else {
                  const [sortKey, sortDir] = val.split("-");
                  onSortChange(sortKey, sortDir as "asc" | "desc");
                }
              }}
            >
              <SelectTrigger className="h-9 text-xs bg-white border-slate-200 w-full">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Mặc định</SelectItem>
                {sortableColumns.flatMap((col) => [
                  <SelectItem key={`${col.key}-asc`} value={`${col.key}-asc`}>
                    {getSortLabel(col.key, "asc", col.label)}
                  </SelectItem>,
                  <SelectItem key={`${col.key}-desc`} value={`${col.key}-desc`}>
                    {getSortLabel(col.key, "desc", col.label)}
                  </SelectItem>
                ])}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Clear Filters Button */}
        {activeFiltersCount > 0 && (
          <div className="flex items-end h-9 w-full">
            <button
              type="button"
              className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg border border-red-200 bg-red-50 text-xs font-semibold text-red-600 hover:bg-red-100 transition w-full"
              onClick={() => {
                filters.forEach((f) => {
                  if (values[f.key]) onFilterChange(f.key, "");
                });
              }}
            >
              <X className="size-4" />
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function FilterControl({
  filter,
  value,
  onChange,
}: {
  filter: FilterConfig;
  value: string;
  onChange: (value: string) => void;
}) {
  if (filter.type === "select" && filter.options) {
    return (
      <div className="flex flex-col gap-1 w-full">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {filter.label}
        </label>
        <Select
          value={value || "all"}
          onValueChange={(val) => onChange(val === "all" ? "" : val)}
        >
          <SelectTrigger className="w-full h-9 text-xs bg-white border-slate-200">
            <SelectValue placeholder={filter.placeholder ?? `Tất cả ${filter.label}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {filter.placeholder ?? `Tất cả ${filter.label}`}
            </SelectItem>
            {filter.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (filter.type === "boolean") {
    return (
      <div className="flex flex-col gap-1 w-full">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {filter.label}
        </label>
        <Select
          value={value || "all"}
          onValueChange={(val) => onChange(val === "all" ? "" : val)}
        >
          <SelectTrigger className="w-full h-9 text-xs bg-white border-slate-200">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="true">Có</SelectItem>
            <SelectItem value="false">Không</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (filter.type === "date") {
    return (
      <div className="flex flex-col gap-1 w-full">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {filter.label}
        </label>
        <DatePickerField value={value} onChange={onChange} placeholder={filter.label} ariaLabel={filter.label} />
      </div>
    );
  }

  return null;
}
