"use client";

import { useState, useEffect, useRef, useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface SearchItem {
  id: string;
  titleVi: string;
  titleEn: string;
  type: "product" | "blog" | "category" | "showroom" | "quote";
  slug?: string;
  subtitle?: string;
  href: string;
}

const SEARCH_ITEMS: SearchItem[] = [
  // Products
  { id: "p1", titleVi: "Sofa Curve Velour", titleEn: "Sofa Curve Velour", type: "product", slug: "sofa-curve-velour", subtitle: "Sofa nhung cong cao cấp", href: "/admin/products?edit=sofa-curve-velour" },
  { id: "p2", titleVi: "Bàn Trà Marble Round", titleEn: "Marble Round Coffee Table", type: "product", slug: "ban-tra-marble-round", subtitle: "Bàn trà mặt đá cẩm thạch", href: "/admin/products?edit=ban-tra-marble-round" },
  { id: "p3", titleVi: "Gạch Calacatta", titleEn: "Calacatta Tile", type: "product", slug: "gach-calacatta", subtitle: "Gạch ốp lát vân đá Calacatta", href: "/admin/products?edit=gach-calacatta" },
  { id: "p4", titleVi: "Chậu Rửa Bravat", titleEn: "Bravat Basin", type: "product", slug: "chau-rua-bravat", subtitle: "Chậu rửa mặt Bravat cao cấp", href: "/admin/products?edit=chau-rua-bravat" },
  
  // Categories
  { id: "c1", titleVi: "Đồ gỗ nội thất", titleEn: "Wooden Furniture", type: "category", slug: "do-go-noi-that", subtitle: "Danh mục đồ gỗ, bàn ghế, giường tủ", href: "/admin/categories?edit=do-go-noi-that" },
  { id: "c2", titleVi: "Thiết bị vệ sinh", titleEn: "Sanitary Equipment", type: "category", slug: "thiet-bi-ve-sinh", subtitle: "Bồn cầu, chậu rửa, vòi sen, bồn tắm", href: "/admin/categories?edit=thiet-bi-ve-sinh" },

  // Blog Posts
  { id: "b1", titleVi: "Xu hướng thiết kế 2026", titleEn: "2026 Design Trends", type: "blog", slug: "xu-huong-thiet-ke-2026", subtitle: "Xu hướng thiết kế nội thất tối giản hiện đại", href: "/admin/blog?edit=xu-huong-thiet-ke-2026" },
  { id: "b2", titleVi: "Cẩm nang chọn sofa", titleEn: "Sofa Buying Guide", type: "blog", slug: "cam-nang-chon-sofa", subtitle: "Cách chọn sofa phù hợp diện tích phòng khách", href: "/admin/blog?edit=cam-nang-chon-sofa" },

  // Showrooms
  { id: "s1", titleVi: "Quận 7 Showroom", titleEn: "District 7 Showroom", type: "showroom", slug: "quan-7-showroom", subtitle: "Số 12 Nguyễn Văn Linh, Quận 7, TP. HCM", href: "/admin/showrooms?edit=quan-7-showroom" },
  { id: "s2", titleVi: "Hà Nội Flagship Store", titleEn: "Hanoi Flagship Store", type: "showroom", slug: "ha-noi-flagship-store", subtitle: "Số 45 Cát Linh, Đống Đa, Hà Nội", href: "/admin/showrooms?edit=ha-noi-flagship-store" },

  // Quotes
  { id: "QR-2406-001", titleVi: "QR-2406-001 - Lê Minh Tuấn", titleEn: "QR-2406-001 - Le Minh Tuan", type: "quote", subtitle: "Sản phẩm: Sofa Curve Velour - SĐT: 0812 357 587", href: "/admin/quotes?id=QR-2406-001" },
  { id: "QR-2406-002", titleVi: "QR-2406-002 - Nguyễn Thu Hà", titleEn: "QR-2406-002 - Nguyen Thu Ha", type: "quote", subtitle: "Sản phẩm: Bàn Trà Marble Round - SĐT: 0901 223 456", href: "/admin/quotes?id=QR-2406-002" },
  { id: "QR-2406-003", titleVi: "QR-2406-003 - Trần Đại Quang", titleEn: "QR-2406-003 - Tran Dai Quang", type: "quote", subtitle: "Sản phẩm: Thiết bị vệ sinh trọn bộ - SĐT: 0988 776 655", href: "/admin/quotes?id=QR-2406-003" }
];
import Link from "next/link";
import {
  Bot,
  ChevronRight,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUp,
  FileText,
  FolderTree,
  Gauge,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Package,
  Search,
  Settings,
  ShieldAlert,
  Store,
  Users,
} from "lucide-react";
import {
  AdminDateProvider,
  AdminUtilityRail,
  NotificationButton,
} from "./admin-dashboard-widgets";

const adminNav = [
  { key: "dashboard", label: "Tổng quan", href: "/admin", icon: LayoutDashboard },
  { key: "products", label: "Sản phẩm", href: "/admin/products", icon: Package },
  { key: "categories", label: "Danh mục", href: "/admin/categories", icon: FolderTree },
  { key: "blog", label: "Bài viết", href: "/admin/blog", icon: FileText },
  { key: "showrooms", label: "Showroom", href: "/admin/showrooms", icon: Store },
  { key: "media", label: "Thư viện tệp", href: "/admin/media", icon: ImageIcon },
  { key: "quotes", label: "Yêu cầu báo giá", href: "/admin/quotes", icon: Gauge },
  { key: "users", label: "Người dùng", href: "/admin/users", icon: Users },
  { key: "settings", label: "Cài đặt", href: "/admin/settings", icon: Settings },
  { key: "ai-assistant", label: "Trợ lý AI", href: "/admin/ai-assistant", icon: Bot },
] as const;

export function AdminShell({
  active,
  children,
  role,
}: {
  active: string;
  children: ReactNode;
  role?: "admin" | "editor";
}) {
  const activeItem = adminNav.find((item) => item.key === active) ?? adminNav[0];
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const visibleNav = role === "editor"
    ? adminNav.filter((item) => !["quotes", "users", "settings"].includes(item.key))
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
          <aside
            className={`admin-sidebar-pd sticky left-0 top-0 hidden h-dvh shrink-0 flex-col overflow-y-auto py-4 transition-[width,padding] duration-300 motion-reduce:transition-none lg:flex ${
              sidebarCollapsed ? "w-[76px] px-2" : "w-[240px] px-3"
            }`}
          >
            <div className={`mb-5 flex items-center gap-2 ${sidebarCollapsed ? "justify-center" : "justify-between px-2"}`}>
              <Link href="/admin" className={`group flex min-w-0 items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
                <div className="flex size-9 items-center justify-center rounded-[var(--radius-panel)] bg-white/10 text-white ring-1 ring-white/10 transition group-hover:bg-white/16">
                  <Store className="size-5" />
                </div>
                {!sidebarCollapsed ? (
                  <div className="min-w-0">
                    <p className="admin-section-title-pd text-[15px] text-white">Phương Đông</p>
                    <p className="type-label mt-1 text-[9px] text-white/42">Bộ quản trị</p>
                  </div>
                ) : null}
              </Link>
              <button
                type="button"
                aria-label={sidebarCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
                title={sidebarCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
                aria-pressed={sidebarCollapsed}
                className="grid size-8 place-items-center rounded-lg text-white/58 transition hover:bg-white/9 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
                onClick={() => setSidebarCollapsed((value) => !value)}
              >
                {sidebarCollapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
              </button>
            </div>

            <nav className="flex-1 space-y-1" aria-label="Điều hướng quản trị">
              {visibleNav.map((item) => {
                const Icon = item.icon;
                const selected = active === item.key;

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    title={sidebarCollapsed ? item.label : undefined}
                    aria-current={selected ? "page" : undefined}
                    className={`admin-nav-link-pd group ${
                      selected ? "" : "text-white/60"
                    } ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"}`}
                  >
                    <Icon className="size-[18px]" />
                    {!sidebarCollapsed ? <span className="min-w-0 flex-1 truncate">{item.label}</span> : null}
                    {selected && !sidebarCollapsed ? <ChevronRight className="size-4 text-white/75" /> : null}
                  </Link>
                );
              })}
            </nav>

            <div className={`mt-5 rounded-[var(--radius-panel)] border border-white/10 bg-white/7 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${sidebarCollapsed ? "grid place-items-center" : ""}`}>
              <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
                <div className="grid size-9 place-items-center rounded-[var(--radius-panel)] bg-[var(--state-warning)] font-bold text-white">A</div>
                {!sidebarCollapsed ? (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">Hồ sơ quản trị</p>
                    <p className="text-xs text-white/45">Mô hình vai trò A</p>
                  </div>
                ) : null}
              </div>
              {!sidebarCollapsed ? (
                <div className="mt-3 grid gap-1">
                  <Link
                    href="/admin/access-denied"
                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-white/58 transition hover:bg-white/9 hover:text-white"
                  >
                    <ShieldAlert className="size-4" /> Kiểm tra phân quyền
                  </Link>
                  <Link
                    href="/admin/login"
                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-[#ffd7b0] transition hover:bg-white/9"
                  >
                    <LogOut className="size-4" /> Đăng xuất
                  </Link>
                </div>
              ) : null}
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="sticky top-0 z-40">
              <header
                className={`admin-topbar-pd flex items-center justify-between gap-4 px-4 transition-[min-height,padding] duration-300 motion-reduce:transition-none md:px-6 ${
                  headerCollapsed ? "min-h-[52px]" : "min-h-[68px]"
                }`}
              >
                <div className="min-w-0">
                  {!headerCollapsed ? (
                    <p className="type-label text-[10px] text-[var(--admin-accent)]">Không gian quản trị</p>
                  ) : null}
                  <h1 className={`admin-title-pd truncate ${headerCollapsed ? "text-base" : "mt-1 text-lg"}`}>
                    {activeItem.label}
                  </h1>
                </div>

                {!headerCollapsed ? (
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="hidden h-10 min-w-[240px] max-w-xl flex-1 items-center justify-between rounded-[var(--radius-panel)] border border-[var(--admin-border-strong)] bg-white/92 px-3 shadow-[0_8px_20px_rgba(21,23,43,0.04)] text-left text-[13px] text-[var(--admin-text-subtle)] hover:border-[#8b5cf6]/50 transition md:flex focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/25"
                  >
                    <div className="flex items-center gap-3">
                      <Search className="size-[17px]" />
                      <span>Tìm kiếm hệ thống...</span>
                    </div>
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      <span className="text-xs">Ctrl </span>K
                    </kbd>
                  </button>
                ) : (
                  <div className="hidden flex-1 md:block" />
                )}

                <div className="flex shrink-0 items-center gap-2.5">
                  <button
                    type="button"
                    aria-label={headerCollapsed ? "Mở rộng thanh trên" : "Thu gọn thanh trên"}
                    title={headerCollapsed ? "Mở rộng thanh trên" : "Thu gọn thanh trên"}
                    aria-pressed={headerCollapsed}
                    className="admin-icon-button-pd"
                    onClick={() => setHeaderCollapsed((value) => !value)}
                  >
                    {headerCollapsed ? <ChevronsDown className="size-4" /> : <ChevronsUp className="size-4" />}
                  </button>
                  <NotificationButton />
                  <Link href="/admin/users" className="admin-icon-button-pd bg-[var(--state-warning-soft)] font-bold text-[var(--admin-sidebar-bg)]">A</Link>
                </div>
              </header>

              <nav className="flex gap-2 overflow-x-auto border-b border-[var(--admin-border)] bg-white/92 px-4 py-2.5 backdrop-blur-xl lg:hidden" aria-label="Điều hướng quản trị di động">
                {visibleNav.map((item) => {
                  const Icon = item.icon;
                  const selected = active === item.key;
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
              <AdminUtilityRail active={active} />
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
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pd-recent-searches");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // ignore
        }
      }
      return ["Sofa", "Bravat", "Lê Minh Tuấn"];
    }
    return [];
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

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

  // Filter items
  const rawFilteredItems = useMemo(() => {
    return SEARCH_ITEMS.filter((item) => {
      const matchesScope = selectedScope === "all" || item.type === selectedScope;
      const searchString = `${item.titleVi} ${item.titleEn} ${item.slug || ""} ${item.subtitle || ""}`.toLowerCase();
      const matchesQuery = searchString.includes(query.toLowerCase());
      return matchesScope && matchesQuery;
    });
  }, [selectedScope, query]);

  const filteredItems = useMemo(() => {
    if (selectedScope === "all" && query) {
      const groups: Record<string, SearchItem[]> = {};
      rawFilteredItems.forEach((item) => {
        groups[item.type] = groups[item.type] || [];
        groups[item.type].push(item);
      });
      const order: ("product" | "blog" | "category" | "showroom" | "quote")[] = ["product", "blog", "category", "showroom", "quote"];
      const flattened: SearchItem[] = [];
      order.forEach((type) => {
        if (groups[type]) {
          flattened.push(...groups[type]);
        }
      });
      return flattened;
    }
    return rawFilteredItems;
  }, [rawFilteredItems, selectedScope, query]);

  const handleSelect = (item: SearchItem) => {
    saveRecentSearch(query || item.titleVi);
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
    } else if (e.key === "Enter") {
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

          {/* Results list */}
          {filteredItems.length > 0 ? (
            <div className="space-y-0.5">
              {(() => {
                // Group results by type when scope is 'all' and there's a query
                const groupedByType = selectedScope === 'all' && query
                  ? Object.entries(
                      filteredItems.reduce((acc, item) => {
                        (acc[item.type] = acc[item.type] || []).push(item);
                        return acc;
                      }, {} as Record<string, SearchItem[]>)
                    )
                  : null;

                if (groupedByType) {
                  let flatIndex = 0;
                  return groupedByType.map(([type, items]) => (
                    <div key={type}>
                      <div className="admin-search-group-header px-3 pb-1 pt-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {getTypeLabel(type)}
                      </div>
                      {items.map((item) => {
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
                                  <span className="font-semibold text-sm truncate">{item.titleVi}</span>
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
                            <span className="font-semibold text-sm truncate">{item.titleVi}</span>
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
            <div className="py-12 text-center">
              <Search className="mx-auto size-8 text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-slate-500">Không tìm thấy kết quả phù hợp</p>
              <p className="text-xs text-slate-400 mt-1">Thử tìm kiếm với từ khóa khác</p>
            </div>
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
