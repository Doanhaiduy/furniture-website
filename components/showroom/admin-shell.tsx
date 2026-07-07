"use client";

import { useState, useEffect, useRef, useMemo, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { createBrowserClient } from "@/lib/supabase/client";

interface SearchResult {
  id: string;
  title: string;
  type: "product" | "blog" | "category" | "showroom" | "quote";
  subtitle?: string;
  href: string;
}
import Link from "next/link";
import {
  FileText,
  FolderTree,
  Gauge,
  LayoutDashboard,
  Package,
  Search,
  Settings,
  Store,
  Tag,
  Users,
  Percent,
} from "lucide-react";
import {
  AdminDateProvider,
} from "./admin-dashboard-widgets";
import { AdminSidebar } from "./admin/AdminSidebar";
import { AdminHeader } from "./admin/AdminHeader";


export const adminNav = [
  { key: "dashboard", label: "Tổng quan", href: "/admin", icon: LayoutDashboard },
  { key: "products", label: "Sản phẩm", href: "/admin/products", icon: Package },
  { key: "categories", label: "Danh mục", href: "/admin/categories", icon: FolderTree },
  { key: "brands", label: "Thương hiệu", href: "/admin/brands", icon: Tag },
  { key: "promotions", label: "Khuyến mãi", href: "/admin/promotions", icon: Percent },
  { key: "blog", label: "Bài viết", href: "/admin/blog", icon: FileText },
  { key: "showrooms", label: "Showroom", href: "/admin/showrooms", icon: Store },
  { key: "quotes", label: "Yêu cầu báo giá", href: "/admin/quotes", icon: Gauge },
  { key: "users", label: "Người dùng", href: "/admin/users", icon: Users },
  { key: "settings", label: "Cài đặt", href: "/admin/settings", icon: Settings },
] as const;

/** Map a pathname to the active admin nav key (used when rendered from the persistent layout). */
function deriveActiveKey(pathname: string): string {
  const match = adminNav.find((item) => item.href !== "/admin" && pathname.startsWith(item.href));
  return match?.key ?? "dashboard";
}

export function AdminShell({
  active,
  children,
  role,
  user,
}: {
  /** Optional — when omitted (persistent layout), derived from the current pathname. */
  active?: string;
  children: ReactNode;
  role?: "admin" | "editor";
  user?: { id: string; email: string; role: "admin" | "editor"; fullName?: string | null };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createBrowserClient();
  const resolvedActive = active ?? deriveActiveKey(pathname);
  const activeItem = adminNav.find((item) => item.key === resolvedActive) ?? adminNav[0];
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  async function handleLogout(e: React.MouseEvent) {
    e.preventDefault();
    
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("SignOut error:", err);
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  const resolvedRole = user?.role ?? role;

  const visibleNav = resolvedRole === "editor"
    ? adminNav.filter((item) => !["quotes", "users", "settings", "ai-assistant"].includes(item.key))
    : adminNav;

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AdminDateProvider>
      <div className="admin-app min-h-screen text-[var(--admin-text)]">
        <div className="flex min-h-screen w-full items-stretch bg-transparent">
          <AdminSidebar
            active={resolvedActive}
            role={resolvedRole}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            handleLogout={handleLogout}
          />

          <div className="min-w-0 flex-1">
            <div className="sticky top-0 z-40">
              <AdminHeader
                active={resolvedActive}
                role={resolvedRole}
                user={user}
                headerCollapsed={headerCollapsed}
                setHeaderCollapsed={setHeaderCollapsed}
                setIsSearchOpen={setIsSearchOpen}
              />

              <nav className="flex gap-2 overflow-x-auto border-b border-[var(--admin-border)] bg-white/92 px-4 py-2.5 backdrop-blur-xl lg:hidden" aria-label="Điều hướng quản trị di động">
                {visibleNav.map((item) => {
                  const Icon = item.icon;
                  const selected = resolvedActive === item.key;
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      aria-current={selected ? "page" : undefined}
                      className={`admin-nav-link-pd inline-flex shrink-0 gap-2 px-3 py-2 text-xs ${
                        selected ? "" : "bg-white text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
                      }`}
                    >
                      <Icon className="size-4" /> {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex min-h-0 flex-1">
              <main className="min-w-0 flex-1 px-4 py-4 text-sm md:px-5 xl:px-6">
                <div className="reveal-soft">{children}</div>
              </main>
            </div>
          </div>
        </div>
        <AdminSearchPalette open={isSearchOpen} onOpenChange={setIsSearchOpen} />
      </div>
    </AdminDateProvider>
  );
}

function AdminSearchPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedScope, setSelectedScope] = useState<"all" | "product" | "blog" | "category" | "showroom" | "quote">("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pd-recent-searches");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return [];
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when open
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Scroll active item into view on keyboard nav
  useEffect(() => {
    if (!open) return;
    const container = resultsRef.current;
    if (!container) return;
    const items = container.querySelectorAll('[data-search-item]');
    items[activeIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeIndex, open]);

  // Debounced DB search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchResults([]);
       
      setIsLoading(false);
      return;
    }
     
    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results ?? []);
        } else {
          setSearchResults([]);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const cleanTerm = term.trim();
    const updated = [cleanTerm, ...recentSearches.filter((s) => s !== cleanTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("pd-recent-searches", JSON.stringify(updated));
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setQuery("");
      setActiveIndex(0);
      setSearchResults([]);
    }
    onOpenChange(newOpen);
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setActiveIndex(0);
  };

  const handleScopeChange = (scope: "all" | "product" | "blog" | "category" | "showroom" | "quote") => {
    setSelectedScope(scope);
    setActiveIndex(0);
  };

  // Filter results by selected scope (client-side, since DB returned all)
  const filteredItems = useMemo(() => {
    const items = searchResults.filter((item) =>
      selectedScope === "all" || item.type === selectedScope
    );
    return items;
  }, [searchResults, selectedScope]);

  const handleSelect = (item: SearchResult) => {
    saveRecentSearch(query || item.title);
    onOpenChange(false);
    router.push(item.href);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredItems.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
      setActiveIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Enter" && filteredItems[activeIndex]) {
      e.preventDefault();
      e.stopPropagation();
      handleSelect(filteredItems[activeIndex]);
    }
  };

  // Helper icons
  const getIcon = (type: string) => {
    switch (type) {
      case "product":
        return <Package className="size-4 text-violet-500" />;
      case "blog":
        return <FileText className="size-4 text-blue-500" />;
      case "category":
        return <FolderTree className="size-4 text-amber-500" />;
      case "showroom":
        return <Store className="size-4 text-emerald-500" />;
      case "quote":
        return <Gauge className="size-4 text-rose-500" />;
      default:
        return <Search className="size-4" />;
    }
  };

  // Type labels (Vietnamese)
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "product":
        return "Sản phẩm";
      case "blog":
        return "Bài viết";
      case "category":
        return "Danh mục";
      case "showroom":
        return "Showroom";
      case "quote":
        return "Báo giá";
      default:
        return type;
    }
  };

  const scopeOptions: { key: typeof selectedScope; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "product", label: "Sản phẩm" },
    { key: "blog", label: "Bài viết" },
    { key: "category", label: "Danh mục" },
    { key: "showroom", label: "Showroom" },
    { key: "quote", label: "Báo giá" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-6xl w-[96vw] max-h-[90vh] overflow-hidden rounded-xl border border-[var(--admin-border-strong)] bg-white p-0 shadow-2xl focus:outline-none"
        onKeyDown={handleKeyDown}
      >
        {/* Search header */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
          <Search className="size-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
            placeholder="Tìm kiếm sản phẩm, bài viết, báo giá, showroom..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button
              onClick={() => handleQueryChange("")}
              className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 hover:bg-slate-200"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Filter scopes */}
        <div className="flex gap-1.5 border-b border-slate-50 bg-slate-50/50 px-4 py-2 text-xs">
          {scopeOptions.map((scope) => (
            <button
              key={scope.key}
              onClick={() => handleScopeChange(scope.key)}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                selectedScope === scope.key
                  ? "bg-[#090a23] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {scope.label}
            </button>
          ))}
        </div>

        {/* Search body */}
        <div ref={resultsRef} className="max-h-[600px] overflow-y-auto p-2">
          {/* Recent searches when query is empty */}
          {!query && recentSearches.length > 0 && (
            <div className="mb-2 px-3 py-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tìm kiếm gần đây</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      handleQueryChange(term);
                      inputRef.current?.focus();
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-white px-2.5 py-1 text-xs text-slate-600 transition hover:border-[#8b5cf6]/30 hover:bg-violet-50/20"
                  >
                    <Search className="size-3 text-slate-400" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="py-8 text-center">
              <div className="mx-auto size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="mt-2 text-sm text-slate-400">Đang tìm kiếm...</p>
            </div>
          )}

          {/* Results list */}
          {!isLoading && filteredItems.length > 0 ? (
            <div className="space-y-0.5">
              {(() => {
                // Group results by type when scope is 'all'
                const groupedByType = selectedScope === 'all' && query
                  ? Object.entries(
                      filteredItems.reduce((acc, item) => {
                        (acc[item.type] = acc[item.type] || []).push(item);
                        return acc;
                      }, {} as Record<string, SearchResult[]>)
                    )
                  : null;

                if (groupedByType) {
                  let flatIndex = 0;
                  return groupedByType.map(([type, items]) => (
                    <div key={type}>
                      <div className="admin-search-group-header px-3 pb-1 pt-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {getTypeLabel(type)}
                      </div>
                      {(items as SearchResult[]).map((item) => {
                        const currentIndex = flatIndex++;
                        const isSelected = currentIndex === activeIndex;
                        return (
                          <button
                            key={item.id}
                            data-search-item
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setActiveIndex(currentIndex)}
                            className={`flex w-full items-start justify-between rounded-lg px-3 py-2.5 text-left transition ${
                              isSelected
                                ? "bg-slate-100/90 text-slate-900"
                                : "text-slate-700 hover:bg-slate-50/70"
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className={`mt-0.5 rounded-md p-1.5 ${isSelected ? "bg-white shadow-sm" : "bg-slate-100/70"}`}>
                                {getIcon(item.type)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm truncate">{item.title}</span>
                                </div>
                                {item.subtitle && (
                                  <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                                )}
                              </div>
                            </div>
                            <span className="ml-3 shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              {getTypeLabel(item.type)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ));
                }

                // Flat list (no grouping)
                return filteredItems.map((item, index) => {
                  const isSelected = index === activeIndex;
                  return (
                    <button
                      key={item.id}
                      data-search-item
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`flex w-full items-start justify-between rounded-lg px-3 py-2.5 text-left transition ${
                        isSelected
                          ? "bg-slate-100/90 text-slate-900"
                          : "text-slate-700 hover:bg-slate-50/70"
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`mt-0.5 rounded-md p-1.5 ${isSelected ? "bg-white shadow-sm" : "bg-slate-100/70"}`}>
                          {getIcon(item.type)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm truncate">{item.title}</span>
                          </div>
                          {item.subtitle && (
                            <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                          )}
                        </div>
                      </div>
                      <span className="ml-3 shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {getTypeLabel(item.type)}
                      </span>
                    </button>
                  );
                });
              })()}
            </div>
          ) : (
            !isLoading && query.trim().length >= 2 ? (
              <div className="py-12 text-center">
                <Search className="mx-auto size-8 text-slate-300" />
                <p className="mt-2 text-sm font-semibold text-slate-500">Không tìm thấy kết quả phù hợp</p>
                <p className="text-xs text-slate-400 mt-1">Thử tìm kiếm với từ khóa khác</p>
              </div>
            ) : !query && (
              <div className="py-10 text-center">
                <Search className="mx-auto size-8 text-slate-200" />
                <p className="mt-2 text-sm text-slate-400">Nhập ít nhất 2 ký tự để tìm kiếm</p>
              </div>
            )
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-[11px] font-medium text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white px-1 shadow-[0_1px_1px_rgba(0,0,0,0.1)] font-mono text-[9px]">↑↓</kbd> để di chuyển
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white px-1 shadow-[0_1px_1px_rgba(0,0,0,0.1)] font-mono text-[9px]">Enter</kbd> để chọn
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white px-1 shadow-[0_1px_1px_rgba(0,0,0,0.1)] font-mono text-[9px]">esc</kbd> để đóng
            </span>
          </div>
          <span className="text-slate-400">{filteredItems.length} kết quả</span>
          <span className="text-slate-400 font-bold uppercase tracking-wider">Showroom Phương Đông</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

