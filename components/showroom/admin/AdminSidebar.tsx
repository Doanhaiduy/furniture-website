"use client";

import Link from "next/link";
import { ChevronsRight, ChevronsLeft, LogOut, ChevronRight } from "lucide-react";
import { adminNav } from "../admin-shell";

export interface AdminSidebarProps {
  active: string;
  role?: "admin" | "editor";
  user?: { id: string; email: string; role: "admin" | "editor"; fullName?: string | null };
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean | ((val: boolean) => boolean)) => void;
  handleLogout: (e: React.MouseEvent) => void;
}

export function AdminSidebar({
  active,
  role,
  user,
  sidebarCollapsed,
  setSidebarCollapsed,
  handleLogout,
}: AdminSidebarProps) {
  const resolvedRole = user?.role ?? role;
  const visibleNav = resolvedRole === "editor"
    ? adminNav.filter((item) => !["quotes", "users", "settings", "ai-assistant"].includes(item.key))
    : adminNav;

  const displayName = user?.fullName || user?.email?.split("@")[0] || "Quản trị viên";
  const userInitial = user?.fullName
    ? user.fullName.trim().charAt(0).toUpperCase()
    : user?.email
    ? user.email.trim().charAt(0).toUpperCase()
    : "A";
  const roleLabel = resolvedRole === "admin" ? "Quản trị viên" : "Biên tập viên";

  return (
    <aside
      className={`admin-sidebar-pd sticky left-0 top-0 hidden h-dvh shrink-0 flex-col overflow-y-auto py-4 transition-[width,padding] duration-300 motion-reduce:transition-none lg:flex ${
        sidebarCollapsed ? "w-[76px] px-2" : "w-[240px] px-3"
      }`}
    >
      {/* Brand Header */}
      <div className={`mb-5 flex items-center gap-2 ${sidebarCollapsed ? "justify-center" : "justify-between px-2"}`}>
        <Link href="/admin" className={`group flex min-w-0 items-center gap-2.5 ${sidebarCollapsed ? "justify-center" : ""}`}>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 p-1.5 ring-1 ring-white/15 transition group-hover:bg-white/20">
            <img src="/logo-final.svg" alt="Phương Đông" className="size-full object-contain brightness-0 invert" />
          </div>
          {!sidebarCollapsed ? (
            <div className="min-w-0">
              <p className="font-heading text-sm font-extrabold tracking-wide text-white truncate">PHƯƠNG ĐÔNG</p>
              <p className="text-[10px] font-medium text-white/50 uppercase tracking-wider">Hệ thống CMS</p>
            </div>
          ) : null}
        </Link>
        <button
          type="button"
          aria-label={sidebarCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
          title={sidebarCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
          aria-pressed={sidebarCollapsed}
          className="grid size-8 place-items-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 cursor-pointer"
          onClick={() => setSidebarCollapsed((value) => !value)}
        >
          {sidebarCollapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
        </button>
      </div>

      {/* Navigation Links */}
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
                selected ? "" : "text-white/65 hover:text-white hover:bg-white/5"
              } ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"}`}
            >
              <Icon className="size-[18px] shrink-0" />
              {!sidebarCollapsed ? <span className="min-w-0 flex-1 truncate text-xs font-semibold">{item.label}</span> : null}
              {selected && !sidebarCollapsed ? <ChevronRight className="size-4 text-white/80 shrink-0" /> : null}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className={`mt-5 rounded-2xl border border-white/10 bg-white/5 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${sidebarCollapsed ? "grid place-items-center" : ""}`}>
        <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-600 font-extrabold text-white text-sm shadow-xs">
            {userInitial}
          </div>
          {!sidebarCollapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white" title={user?.email}>
                {displayName}
              </p>
              <p className="text-[11px] text-amber-200/80 font-medium truncate">
                {roleLabel}
              </p>
            </div>
          ) : null}
        </div>
        {!sidebarCollapsed ? (
          <div className="mt-2.5 border-t border-white/8 pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-rose-300 hover:text-rose-200 transition hover:bg-rose-500/10 cursor-pointer"
            >
              <LogOut className="size-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
