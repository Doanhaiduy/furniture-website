"use client";

import Link from "next/link";
import { Search, ChevronsDown, ChevronsUp, LogOut, User, Settings, Shield } from "lucide-react";
import { NotificationButton } from "../admin-dashboard-widgets";
import { adminNav } from "../admin-shell";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { createBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export interface AdminHeaderProps {
  active: string;
  role?: "admin" | "editor";
  user?: { id: string; email: string; role: "admin" | "editor"; fullName?: string | null };
  headerCollapsed: boolean;
  setHeaderCollapsed: (value: boolean | ((val: boolean) => boolean)) => void;
  setIsSearchOpen: (value: boolean | ((val: boolean) => boolean)) => void;
}

export function AdminHeader({
  active,
  role,
  user,
  headerCollapsed,
  setHeaderCollapsed,
  setIsSearchOpen,
}: AdminHeaderProps) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const activeItem = adminNav.find((item) => item.key === active) ?? adminNav[0];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("SignOut error:", err);
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  };

  const resolvedRole = user?.role ?? role;
  const email = user?.email || "";
  const name = user?.fullName || "";
  const displayName = name || email.split("@")[0] || "User";
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : email.slice(0, 2).toUpperCase() || "A";

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
                  <NotificationButton role={resolvedRole as "admin" | "editor"} />
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="admin-icon-button-pd bg-[var(--state-warning-soft)] hover:bg-amber-100 font-bold text-[var(--admin-sidebar-bg)] cursor-pointer select-none transition focus:outline-none flex items-center justify-center rounded-full size-9 text-xs"
                      >
                        {initials}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl bg-white border border-[var(--admin-border-strong)] shadow-xl mt-1">
                      <div className="px-2 py-1.5 flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-800 text-sm truncate">{displayName}</span>
                        <span className="text-[10px] text-slate-400 truncate">{email}</span>
                        <div className="mt-1 flex items-center gap-1">
                          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                            <Shield className="size-2.5" />
                            {resolvedRole === "admin" ? "Quản trị viên" : "Biên tập viên"}
                          </span>
                        </div>
                      </div>
                      <DropdownMenuSeparator className="my-1.5 bg-slate-100" />
                      {resolvedRole === "admin" && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/admin/users" className="flex w-full items-center gap-2 cursor-pointer rounded-lg px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition">
                              <User className="size-3.5" />
                              Quản lý nhân sự
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/admin/settings" className="flex w-full items-center gap-2 cursor-pointer rounded-lg px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition">
                              <Settings className="size-3.5" />
                              Cài đặt hệ thống
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1.5 bg-slate-100" />
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 cursor-pointer rounded-lg px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition focus:bg-rose-50 focus:text-rose-700"
                      >
                        <LogOut className="size-3.5" />
                        Đăng xuất
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </header>
  );
}
