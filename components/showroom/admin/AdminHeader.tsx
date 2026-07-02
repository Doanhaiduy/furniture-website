"use client";

import Link from "next/link";
import { Search, ChevronsDown, ChevronsUp } from "lucide-react";
import { NotificationButton } from "../admin-dashboard-widgets";
import { adminNav } from "../admin-shell";

export interface AdminHeaderProps {
  active: string;
  role?: "admin" | "editor";
  headerCollapsed: boolean;
  setHeaderCollapsed: (value: boolean | ((val: boolean) => boolean)) => void;
  setIsSearchOpen: (value: boolean | ((val: boolean) => boolean)) => void;
}

export function AdminHeader({
  active,
  role,
  headerCollapsed,
  setHeaderCollapsed,
  setIsSearchOpen,
}: AdminHeaderProps) {
  const activeItem = adminNav.find((item) => item.key === active) ?? adminNav[0];

  return (
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
                  <NotificationButton role={role as "admin" | "editor"} />
                  <Link href="/admin/users" className="admin-icon-button-pd bg-[var(--state-warning-soft)] font-bold text-[var(--admin-sidebar-bg)]">A</Link>
                </div>
              </header>
  );
}
