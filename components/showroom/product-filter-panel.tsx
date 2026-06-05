"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ChevronDown, Filter, Search } from "lucide-react";
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
  };
  resetHref: string;
  defaultExpanded?: boolean;
};

export function ProductFilterPanel({
  labels,
  query,
  options,
  resetHref,
  defaultExpanded = false,
}: ProductFilterPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const advancedId = useId();

  return (
    <form method="get" className="surface-soft mb-8 p-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr_0.9fr_0.9fr] lg:items-end">
        <div className="lg:self-center">
          <p className="label-pd">{labels.filters}</p>
          <p className="mt-2 text-sm text-secondary">{labels.showing}</p>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-semibold">{labels.search}</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
            <input className="input-pd pl-9" name="q" defaultValue={query.q} />
          </div>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold">{labels.category}</span>
          <PremiumSelect
            name="category"
            defaultValue={query.category || "all"}
            options={options.category}
            placeholder={labels.category}
            ariaLabel={labels.category}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold">{labels.material}</span>
          <PremiumSelect
            name="material"
            defaultValue={query.material || "all"}
            options={options.material}
            placeholder={labels.material}
            ariaLabel={labels.material}
          />
        </label>
      </div>

      {expanded ? (
        <div
          id={advancedId}
          className="animate-in fade-in slide-in-from-top-2 mt-5 grid gap-5 duration-300 motion-reduce:animate-none lg:grid-cols-4"
        >
          <label className="grid gap-2">
            <span className="text-sm font-semibold">{labels.room}</span>
            <PremiumSelect
              name="room"
              defaultValue={query.room || "all"}
              options={options.room}
              placeholder={labels.room}
              ariaLabel={labels.room}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">{labels.style}</span>
            <PremiumSelect
              name="style"
              defaultValue={query.style || "all"}
              options={options.style}
              placeholder={labels.style}
              ariaLabel={labels.style}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">{labels.collection}</span>
            <PremiumSelect
              name="collection"
              defaultValue={query.collection || "all"}
              options={options.collection}
              placeholder={labels.collection}
              ariaLabel={labels.collection}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">{labels.tone}</span>
            <PremiumSelect
              name="tone"
              defaultValue={query.tone || "all"}
              options={options.tone}
              placeholder={labels.tone}
              ariaLabel={labels.tone}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">{labels.availability}</span>
            <PremiumSelect
              name="availability"
              defaultValue={query.availability || "all"}
              options={options.availability}
              placeholder={labels.availability}
              ariaLabel={labels.availability}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">{labels.featuredOnly}</span>
            <PremiumSelect
              name="featured"
              defaultValue={query.featured || "all"}
              options={options.featured}
              placeholder={labels.featuredOnly}
              ariaLabel={labels.featuredOnly}
            />
          </label>
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          aria-controls={advancedId}
          aria-expanded={expanded}
          className="button-pd-outline justify-center sm:justify-start"
          onClick={() => setExpanded((value) => !value)}
        >
          <ChevronDown className={`size-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
          {expanded ? labels.collapse : labels.expand}
        </button>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button className="button-pd" type="submit">
            <Filter className="size-4" />
            {labels.apply}
          </button>
          <Link href={resetHref} className="button-pd-outline justify-center">
            {labels.reset}
          </Link>
        </div>
      </div>
    </form>
  );
}
