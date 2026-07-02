"use client";

import Link from "next/link";
import { Store, ChevronsRight, ChevronsLeft, LogOut, ChevronRight } from "lucide-react";
import { adminNav } from "../admin-shell";

export interface AdminSidebarProps {
  active: string;
  role?: "admin" | "editor";
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean | ((val: boolean) => boolean)) => void;
  handleLogout: (e: React.MouseEvent) => void;
}

export function AdminSidebar({
  active,
  role,
  sidebarCollapsed,
  setSidebarCollapsed,
  handleLogout,
}: AdminSidebarProps) {
  const visibleNav = role === "editor"
    ? adminNav.filter((item) => !["quotes", "users", "settings", "ai-assistant"].includes(item.key))
    : adminNav;

  return (
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
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-[#ffd7b0] transition hover:bg-white/9 cursor-pointer"
                  >
                    <LogOut className="size-4" /> Đăng xuất
                  </button>
                </div>
              ) : null}
            </div>
          </aside>
  );
}
