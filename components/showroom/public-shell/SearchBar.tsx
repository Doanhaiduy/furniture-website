"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { Locale } from "@/i18n/routing";

export function SearchBar({
  locale,
  placeholder = "Search...",
  onSearch,
}: {
  locale: Locale;
  placeholder?: string;
  onSearch?: (query: string) => void;
}) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center w-full max-w-xs">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-1.5 pl-9 text-xs rounded-full border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all bg-slate-50/50"
      />
      <Search className="absolute left-3 size-3.5 text-slate-400 pointer-events-none" />
    </form>
  );
}
