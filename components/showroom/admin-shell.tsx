"use client";

import { useState, type ReactNode } from "react";
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
  AdminLocaleToggle,
  AdminUtilityRail,
  NotificationButton,
} from "./admin-dashboard-widgets";

const adminNav = [
  { key: "dashboard", label: "Tổng quan", href: "/admin", icon: LayoutDashboard },
  { key: "products", label: "Sản phẩm", href: "/admin/products", icon: Package },
  { key: "categories", label: "Danh mục", href: "/admin/categories", icon: FolderTree },
  { key: "blog", label: "Bài viết", href: "/admin/blog", icon: FileText },
  { key: "showrooms", label: "Showroom", href: "/admin/showrooms", icon: Store },
  { key: "media", label: "Media", href: "/admin/media", icon: ImageIcon },
  { key: "quotes", label: "Yêu cầu báo giá", href: "/admin/quotes", icon: Gauge },
  { key: "users", label: "Người dùng", href: "/admin/users", icon: Users },
  { key: "settings", label: "Cài đặt", href: "/admin/settings", icon: Settings },
  { key: "ai-assistant", label: "AI Assistant", href: "/admin/ai-assistant", icon: Bot },
] as const;

export function AdminShell({
  active,
  children,
}: {
  active: string;
  children: ReactNode;
}) {
  const activeItem = adminNav.find((item) => item.key === active) ?? adminNav[0];
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  return (
    <AdminDateProvider>
      <div className="admin-app min-h-screen text-[#15172b]">
      <div className="flex min-h-screen w-full items-stretch bg-transparent">
        <aside
          className={`sticky left-0 top-0 hidden h-screen shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-[linear-gradient(180deg,#0c0d27_0%,#080922_58%,#070819_100%)] py-4 text-white transition-[width,padding] duration-300 motion-reduce:transition-none lg:flex ${
            sidebarCollapsed ? "w-[76px] px-2" : "w-[240px] px-3"
          }`}
        >
          <div className={`mb-5 flex items-center gap-2 ${sidebarCollapsed ? "justify-center" : "justify-between px-2"}`}>
            <Link href="/admin" className={`group flex min-w-0 items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
              <div className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/10 transition group-hover:bg-white/16">
                <Store className="size-5" />
              </div>
              {!sidebarCollapsed ? (
                <div className="min-w-0">
                  <p className="font-heading text-[15px] font-semibold leading-none text-white">Phương Đông</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white/42">
                    Admin Suite
                  </p>
                </div>
              ) : null}
            </Link>
            <button
              type="button"
              aria-label={sidebarCollapsed ? "Mo rong sidebar" : "Thu gon sidebar"}
              title={sidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
              aria-pressed={sidebarCollapsed}
              className="grid size-8 place-items-center rounded-lg text-white/58 transition hover:bg-white/9 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
              onClick={() => setSidebarCollapsed((value) => !value)}
            >
              {sidebarCollapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
            </button>
          </div>

          <nav className="flex-1 space-y-1" aria-label="Admin">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const selected = active === item.key;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`group flex items-center rounded-xl text-[12px] font-semibold transition-all duration-200 ${
                    selected
                      ? "bg-[#8b5cf6] text-white shadow-[0_12px_28px_rgba(139,92,246,0.30)]"
                      : "text-white/60 hover:bg-white/8 hover:text-white"
                  } ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"}`}
                >
                  <Icon className="size-[18px]" />
                  {!sidebarCollapsed ? <span className="min-w-0 flex-1 truncate">{item.label}</span> : null}
                  {selected && !sidebarCollapsed ? <ChevronRight className="size-4 text-white/75" /> : null}
                </Link>
              );
            })}
          </nav>

          <div className={`mt-5 rounded-2xl border border-white/10 bg-white/7 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${sidebarCollapsed ? "grid place-items-center" : ""}`}>
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
              <div className="grid size-9 place-items-center rounded-xl bg-[#ff8a00] font-bold text-white">A</div>
              {!sidebarCollapsed ? (
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">Admin Profile</p>
                  <p className="text-xs text-white/45">Role Model A</p>
                </div>
              ) : null}
            </div>
            {!sidebarCollapsed ? (
              <div className="mt-3 grid gap-1">
                <Link
                  href="/admin/access-denied"
                  className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-white/58 transition hover:bg-white/9 hover:text-white"
                >
                  <ShieldAlert className="size-4" />
                  Access denied
                </Link>
                <Link
                  href="/admin/login"
                  className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-[#ffd7b0] transition hover:bg-white/9"
                >
                  <LogOut className="size-4" />
                  Đăng xuất
                </Link>
              </div>
            ) : null}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="sticky top-0 z-40">
            <header
              className={`flex items-center justify-between gap-4 border-b border-[#dfe6f1] bg-white/88 px-4 shadow-[0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl transition-[min-height,padding] duration-300 motion-reduce:transition-none md:px-6 ${
                headerCollapsed ? "min-h-[52px]" : "min-h-[68px]"
              }`}
            >
              <div className="min-w-0">
                {!headerCollapsed ? (
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8b5cf6]">
                    CMS workspace
                  </p>
                ) : null}
                <h1 className={`truncate font-heading font-semibold text-[#15172b] ${headerCollapsed ? "text-base" : "mt-1 text-lg"}`}>
                  {activeItem.label}
                </h1>
              </div>

              {!headerCollapsed ? (
                <div className="hidden h-10 min-w-[240px] max-w-xl flex-1 items-center gap-3 rounded-xl border border-[#dbe2ec] bg-white/92 px-3 shadow-[0_8px_20px_rgba(21,23,43,0.04)] md:flex">
                  <Search className="size-[17px] text-[#8a8ea3]" />
                  <input
                    className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#9aa0b5]"
                    placeholder="Tìm kiếm hệ thống..."
                  />
                </div>
              ) : (
                <div className="hidden flex-1 md:block" />
              )}

              <div className="flex shrink-0 items-center gap-2.5">
                <button
                  type="button"
                  aria-label={headerCollapsed ? "Mo rong header" : "Thu gon header"}
                  title={headerCollapsed ? "Mở rộng header" : "Thu gọn header"}
                  aria-pressed={headerCollapsed}
                  className="grid size-10 place-items-center rounded-xl border border-[#dbe2ec] bg-white/94 text-[#686d82] shadow-[0_8px_18px_rgba(21,23,43,0.04)] transition hover:border-[#8b5cf6]/35 hover:bg-[#f7f5ff] hover:text-[#8b5cf6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/25 active:scale-[0.98]"
                  onClick={() => setHeaderCollapsed((value) => !value)}
                >
                  {headerCollapsed ? <ChevronsDown className="size-4" /> : <ChevronsUp className="size-4" />}
                </button>
                <NotificationButton />
                <AdminLocaleToggle />
                <Link href="/admin/users" className="grid size-10 place-items-center rounded-xl bg-[#ffe45e] font-bold text-[#090a23] shadow-[0_8px_18px_rgba(255,138,0,0.16)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff8a00]/25">
                  A
                </Link>
              </div>
            </header>

            <nav className="flex gap-2 overflow-x-auto border-b border-[#dfe6f1] bg-white/92 px-4 py-2.5 backdrop-blur-xl lg:hidden" aria-label="Admin mobile">
              {adminNav.map((item) => {
                const Icon = item.icon;
                const selected = active === item.key;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      selected ? "bg-[#8b5cf6] text-white" : "bg-white text-[#686d82] hover:text-[#15172b]"
                    }`}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex min-h-0 flex-1">
            <main className="min-w-0 flex-1 px-4 py-4 text-[0.93rem] md:px-5 xl:px-6">
              <div className="reveal-soft">{children}</div>
            </main>
            <AdminUtilityRail active={active} />
          </div>
        </div>
      </div>
    </div>
    </AdminDateProvider>
  );
}
