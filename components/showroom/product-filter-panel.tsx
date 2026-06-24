"use client";

import { useId, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { PremiumSelect, type PremiumSelectOption } from "./premium-select";

type ProductFilterLabels = {
  filters: string;
  showing: string;
  search: string;
  category: string;
  material: string;
  room: string;
  style: string;
  collection: string;
  tone: string;
  availability: string;
  featuredOnly: string;
  apply: string;
  reset: string;
  expand: string;
  collapse: string;
  brand: string;
  discount: string;
  discountAll: string;
  discountActive: string;
  brandAll: string;
};

export type ProductFilterPanelProps = {
  labels: ProductFilterLabels;
  query: {
    q?: string;
    category?: string;
    material?: string;
    room?: string;
    style?: string;
    collection?: string;
    tone?: string;
    availability?: string;
    featured?: string;
    discount?: string;
    brand?: string;
  };
  options: {
    category: PremiumSelectOption[];
    material: PremiumSelectOption[];
    room: PremiumSelectOption[];
    style: PremiumSelectOption[];
    collection: PremiumSelectOption[];
    tone: PremiumSelectOption[];
    availability: PremiumSelectOption[];
    featured: PremiumSelectOption[];
    brand?: PremiumSelectOption[];
  };
  resetHref: string;
  defaultExpanded?: boolean;
};

export function ProductFilterPanel({
  labels,
  query,
  options,
  resetHref,
}: ProductFilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const searchRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if any filter is active
  const hasActive =
    (query.q && query.q !== "") ||
    (query.category && query.category !== "all") ||
    (query.material && query.material !== "all") ||
    (query.featured && query.featured !== "all") ||
    (query.brand && query.brand !== "all");

  function navigate(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page"); // Reset to page 1 on filter change

    Object.entries(overrides).forEach(([key, value]) => {
      if (!value || value === "all" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      navigate({ q: value });
    }, 400);
  }

  function handleClear() {
    if (searchRef.current) searchRef.current.value = "";
    router.push(resetHref, { scroll: false });
  }

  const discountOptions: PremiumSelectOption[] = [
    { value: "all", label: labels.discountAll },
    { value: "true", label: labels.discountActive },
  ];

  const brandOptions: PremiumSelectOption[] = options.brand && options.brand.length > 1
    ? options.brand
    : [{ value: "all", label: labels.brandAll }];

  return (
    <div className="surface-panel mb-8 p-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] lg:items-end">
        {/* Search */}
        <label className="grid gap-2">
          <span className="field-label-pd">{labels.search}</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
            <input
              ref={searchRef}
              className="input-pd pl-9"
              name="q"
              defaultValue={query.q}
              onChange={handleSearchChange}
              placeholder={labels.search}
            />
          </div>
        </label>

        {/* Category */}
        <label className="grid gap-2">
          <span className="field-label-pd">{labels.category}</span>
          <PremiumSelect
            name="category"
            value={query.category || "all"}
            options={options.category}
            placeholder={labels.category}
            ariaLabel={labels.category}
            onValueChange={(v) => navigate({ category: v })}
          />
        </label>

        {/* Material */}
        <label className="grid gap-2">
          <span className="field-label-pd">{labels.material}</span>
          <PremiumSelect
            name="material"
            value={query.material || "all"}
            options={options.material}
            placeholder={labels.material}
            ariaLabel={labels.material}
            onValueChange={(v) => navigate({ material: v })}
          />
        </label>

        {/* Discount / Giảm giá */}
        <label className="grid gap-2">
          <span className="field-label-pd">{labels.discount}</span>
          <PremiumSelect
            name="featured"
            value={query.featured || "all"}
            options={discountOptions}
            placeholder={labels.discount}
            ariaLabel={labels.discount}
            onValueChange={(v) => navigate({ featured: v })}
          />
        </label>

        {/* Brand / Thương hiệu */}
        <label className="grid gap-2">
          <span className="field-label-pd">{labels.brand}</span>
          <PremiumSelect
            name="brand"
            value={query.brand || "all"}
            options={brandOptions}
            placeholder={labels.brand}
            ariaLabel={labels.brand}
            onValueChange={(v) => navigate({ brand: v })}
          />
        </label>

        {/* Clear button — only show when filter is active */}
        <div className="self-end">
          {hasActive ? (
            <button
              type="button"
              onClick={handleClear}
              className="button-pd-outline flex h-11 w-full items-center justify-center gap-2 lg:w-auto"
              aria-label={labels.reset}
            >
              <X className="size-4" />
              {labels.reset}
            </button>
          ) : (
            <div className="h-11" />
          )}
        </div>
      </div>
    </div>
  );
}
