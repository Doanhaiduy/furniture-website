"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition, useRef, useEffect } from "react";

export type SortDir = "asc" | "desc";

export interface FilterValues {
  q?: string;
  status?: string;
  categoryId?: string;
  brandId?: string;
  groupKey?: string;
  role?: string;
  isActive?: string;
  dateFrom?: string;
  dateTo?: string;
  featured?: string;
  sort?: string;
  dir?: SortDir;
  page?: string;
  limit?: string;
  [key: string]: string | undefined;
}

export function useAdminFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildUrl = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(overrides)) {
        if (value === null || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams]
  );

  const navigate = useCallback(
    (url: string) => {
      startTransition(() => {
        router.push(url);
      });
    },
    [router]
  );

  const setFilter = useCallback(
    (key: string, value: string) => {
      navigate(buildUrl({ [key]: value, page: null }));
    },
    [buildUrl, navigate]
  );

  const setSearch = useCallback(
    (q: string) => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => {
        navigate(buildUrl({ q: q || null, page: null }));
      }, 300);
    },
    [buildUrl, navigate]
  );

  const setPage = useCallback(
    (page: number) => {
      navigate(buildUrl({ page: page > 1 ? String(page) : null }));
    },
    [buildUrl, navigate]
  );

  const setSort = useCallback(
    (sort: string, dir: SortDir) => {
      navigate(buildUrl({ sort, dir, page: null }));
    },
    [buildUrl, navigate]
  );

  const setLimit = useCallback(
    (limit: number) => {
      navigate(buildUrl({ limit: String(limit), page: null }));
    },
    [buildUrl, navigate]
  );

  const getFilter = useCallback(
    (key: string, fallback = "") => searchParams.get(key) ?? fallback,
    [searchParams]
  );

  const getPage = useCallback(
    () => Math.max(1, parseInt(searchParams.get("page") ?? "1", 10)),
    [searchParams]
  );

  const getLimit = useCallback(
    () => Math.min(100, Math.max(10, parseInt(searchParams.get("limit") ?? "20", 10))),
    [searchParams]
  );

  const getSort = useCallback(
    (defaultSort = "") => searchParams.get("sort") ?? defaultSort,
    [searchParams]
  );

  const getDir = useCallback(
    (defaultDir: SortDir = "asc") =>
      (searchParams.get("dir") as SortDir | null) ?? defaultDir,
    [searchParams]
  );

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  return {
    isPending,
    setFilter,
    setSearch,
    setPage,
    setSort,
    setLimit,
    getFilter,
    getPage,
    getLimit,
    getSort,
    getDir,
    searchParams,
  };
}
