"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Popover as PopoverPrimitive } from "radix-ui";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Info,
  Sparkles,
} from "lucide-react";

// Generate past 7 days dynamically
const generateDynamicWeekData = () => {
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const result = [];
  const today = new Date();
  
  // Start from 6 days ago up to today
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    const isoStr = d.toISOString().split("T")[0];
    const dayName = days[d.getDay()];
    
    result.push({
      day: dayName,
      date: dateStr,
      iso: isoStr,
      dayNumber: d.getDate(),
      // TODO(handover): these per-day counts were fabricated from the day-of-month and
      // shown in the dashboard calendar popover as if live. Zeroed out until backed by
      // real data rather than displaying invented figures.
      quotes: 0,
      seo: 0,
      drafts: 0,
      href: "/admin/quotes" as string,
    });
  }
  return result;
};

export const weekData = generateDynamicWeekData();

export const metricOptions = [
  { key: "quotes", label: "Yêu cầu báo giá" },
  { key: "seo", label: "SEO" },
  { key: "drafts", label: "Bản nháp" },
] as const;

export type Metric = (typeof metricOptions)[number]["key"];
export type WeekIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type AdminRole = "admin" | "editor";

function isAdminOnlyHref(href: string) {
  return ["/admin/quotes", "/admin/users", "/admin/settings"].some((prefix) =>
    href.startsWith(prefix),
  );
}

export function safeAdminHref(href: string, role?: AdminRole) {
  return role === "editor" && isAdminOnlyHref(href) ? "/admin/access-denied" : href;
}

export const todayIndex: WeekIndex = 6;

export type AdminDateSelection = {
  selectedIndex: WeekIndex;
  setSelectedIndex: (index: WeekIndex) => void;
};

const AdminDateSelectionContext = createContext<AdminDateSelection | null>(null);

export function AdminDateProvider({ children }: { children: ReactNode }) {
  const [selectedIndex, setSelectedIndex] = useState<WeekIndex>(todayIndex);

  return (
    <AdminDateSelectionContext.Provider value={{ selectedIndex, setSelectedIndex }}>
      {children}
    </AdminDateSelectionContext.Provider>
  );
}

export function useAdminDateSelection() {
  const context = useContext(AdminDateSelectionContext);
  if (!context) {
    throw new Error("useAdminDateSelection phải được dùng trong AdminDateProvider");
  }

  return context;
}


export function NotificationButton({ role }: { role?: AdminRole }) {
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(false);
  const [stats, setStats] = useState({ unreadQuotesCount: 0, missingTranslationsCount: 0 });

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/admin/notifications");
        if (res.ok) {
          const data = await res.json();
          setStats({
            unreadQuotesCount: data.unreadQuotesCount ?? 0,
            missingTranslationsCount: data.missingTranslationsCount ?? 0,
          });
        }
      } catch {
        // noop
      }
    }
    fetchNotifications();
  }, []);

  const totalNotifications = stats.unreadQuotesCount + stats.missingTranslationsCount;
  const showUnreadDot = totalNotifications > 0 && !read;

  return (
    <div className="relative hidden md:block">
      <PopoverPrimitive.Root
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (value) setRead(true);
        }}
      >
        <PopoverPrimitive.Trigger asChild>
          <button
            type="button"
            aria-label="Thông báo"
            aria-haspopup="menu"
            aria-expanded={open}
            className={`admin-icon-button-pd relative ${open ? "text-[var(--admin-accent)]" : ""}`}
          >
            <Bell className="size-[17px]" />
            {showUnreadDot ? <span className="absolute right-2 top-2 size-2 rounded-full bg-[var(--state-warning)]" /> : null}
          </button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="end"
            sideOffset={10}
            collisionPadding={16}
            className="surface-elevated z-[90] w-72 p-3 text-[var(--admin-text)] outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 motion-reduce:transition-none"
          >
            <p className="type-label text-[var(--admin-text-subtle)]">Thông báo</p>
            <div className="mt-3 grid gap-2 text-sm">
              {stats.unreadQuotesCount > 0 && (
                <Link href={safeAdminHref("/admin/quotes", role)} className="admin-nav-link-pd min-h-11 bg-[var(--admin-bg-soft)] p-3 text-[var(--admin-text)]" onClick={() => setOpen(false)}>
                  {stats.unreadQuotesCount} yêu cầu báo giá cần kiểm duyệt
                </Link>
              )}
              {stats.missingTranslationsCount > 0 && (
                <Link href="/admin/products" className="admin-nav-link-pd min-h-11 bg-[var(--admin-bg-soft)] p-3 text-[var(--admin-text)]" onClick={() => setOpen(false)}>
                  {stats.missingTranslationsCount} sản phẩm thiếu thông tin tiếng Anh
                </Link>
              )}
              {totalNotifications === 0 && (
                <p className="p-3 text-center text-xs text-slate-400">Không có thông báo mới.</p>
              )}
            </div>
            <PopoverPrimitive.Arrow className="fill-white" />
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
}


export function AdminUtilityRail({ active, role }: { active: string; role?: AdminRole }) {
  const { selectedIndex, setSelectedIndex } = useAdminDateSelection();
  const selected = weekData[selectedIndex];
  const [showCalendar, setShowCalendar] = useState(true);

  // We calculate dynamic progress and issues based on the active route
  const pageData = useMemo(() => {
    switch (active) {
      case "products":
        return {
          title: "Độ sẵn sàng sản phẩm",
          score: 82,
          metricLabel: "Sản phẩm",
          description: "Các sản phẩm đã đạt chuẩn nội dung tiếng Việt và cấu hình giá.",
          issues: [
            { id: "i1", text: "Sofa Curve Velour: Thiếu mô tả tiếng Anh", type: "warning", href: "/admin/products?edit=sofa-curve-velour" },
            { id: "i2", text: "Gạch Calacatta: Chưa tối ưu SEO", type: "info", href: "/admin/products?edit=gach-calacatta" },
          ]
        };
      case "blog":
        return {
          title: "Độ sẵn sàng bài viết",
          score: 75,
          metricLabel: "Bài viết",
          description: "Các tin tức và cẩm nang sẵn sàng hiển thị trên trang chủ.",
          issues: [
            { id: "i3", text: "Cẩm nang chọn sofa: Thiếu trích dẫn bài viết", type: "warning", href: "/admin/blog?edit=cam-nang-chon-sofa" },
          ]
        };
      case "quotes":
        return {
          title: "Hiệu suất CRM",
          score: 90,
          metricLabel: "Báo giá",
          description: "Tỷ lệ phản hồi yêu cầu báo giá của khách hàng trong 24h.",
          issues: [
            { id: "i4", text: "QR-2406-001 (Lê Minh Tuấn) chưa phân công", type: "error", href: "/admin/quotes?id=QR-2406-001" },
          ]
        };
      default:
        return {
          title: "Độ sẵn sàng hệ thống",
          score: 85,
          metricLabel: "Tổng quát",
          description: "Điểm chất lượng dữ liệu và tốc độ phản hồi chung.",
          issues: [
            { id: "i1", text: "Sofa Curve Velour: Thiếu mô tả tiếng Anh", type: "warning", href: "/admin/products?edit=sofa-curve-velour" },
            { id: "i3", text: "Cẩm nang chọn sofa: Thiếu trích dẫn bài viết", type: "warning", href: "/admin/blog?edit=cam-nang-chon-sofa" },
            { id: "i4", text: "QR-2406-001 (Lê Minh Tuấn) chưa phân công", type: "error", href: "/admin/quotes?id=QR-2406-001" },
          ]
        };
    }
  }, [active]);
  const isEditor = role === "editor";
  const visibleIssues = pageData.issues.filter((issue) => !isEditor || !isAdminOnlyHref(issue.href));

  return (
    <aside className="hidden w-[286px] shrink-0 border-l border-[#e3e8f0] bg-white/55 p-4 xl:block">
      <div className="sticky top-[84px] space-y-4">
        {!isEditor ? (
          <section className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 shrink-0 text-rose-600 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-semibold text-xs text-rose-900">Yêu cầu báo giá mới</h4>
                <p className="text-xs text-rose-700">Có <strong>1 yêu cầu báo giá chưa phân công</strong> cần xử lý ngay.</p>
                <Link href="/admin/quotes?id=QR-2406-001" className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 hover:text-rose-950 underline mt-1 transition">
                  Phân công xử lý <ArrowUpRight className="size-3" />
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        {/* Readiness progress wheel */}
        <section className="rounded-2xl border border-[#e0e6ef] bg-white p-4 shadow-[0_14px_34px_rgba(21,23,43,0.06)]">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a8ea3]">{pageData.title}</p>
            <Sparkles className="size-4 text-[#ff8a00]" />
          </div>
          <div className="mx-auto mt-5 grid size-30 place-items-center rounded-full" style={{
            background: `conic-gradient(#8b5cf6 0% ${pageData.score}%, #edf0f7 ${pageData.score}% 100%)`
          }}>
            <div className="grid size-22 place-items-center rounded-full bg-white text-center">
              <strong className="font-heading text-lg text-[#15172b]">{pageData.score}%</strong>
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a8ea3]">{pageData.metricLabel}</span>
            </div>
          </div>
          <p className="mt-4 rounded-xl bg-[#f4f6fb] p-3 text-xs font-semibold leading-5 text-[#686d82]">
            {pageData.description}
          </p>
        </section>

        {/* Operations Checklist widget */}
        <section className="rounded-2xl border border-[#e0e6ef] bg-white p-4 shadow-[0_14px_34px_rgba(21,23,43,0.06)]">
          <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a8ea3]">Checklist vận hành</p>
            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
              {visibleIssues.length} việc cần làm
            </span>
          </div>
          <div className="mt-3.5 space-y-3">
            {visibleIssues.map((issue) => (
              <div key={issue.id} className="group flex items-start gap-2.5 rounded-xl border border-slate-50 bg-slate-50/50 p-2.5 transition hover:border-[#8b5cf6]/20 hover:bg-violet-50/10">
                {issue.type === "error" ? (
                  <AlertCircle className="size-4 shrink-0 text-rose-500 mt-0.5" />
                ) : issue.type === "warning" ? (
                  <AlertTriangle className="size-4 shrink-0 text-amber-500 mt-0.5" />
                ) : (
                  <Info className="size-4 shrink-0 text-blue-400 mt-0.5" />
                )}
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-[11px] font-semibold text-slate-700 leading-relaxed group-hover:text-slate-900 transition break-words">{issue.text}</p>
                  <Link href={safeAdminHref(issue.href, role)} className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8b5cf6] hover:text-[#7c3aed] transition">
                    Sửa ngay <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Scheduler Compact & Collapsible Toggle */}
        <section className="rounded-2xl border border-[#e0e6ef] bg-white p-3 shadow-[0_14px_34px_rgba(21,23,43,0.06)]">
          <button 
            type="button"
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex w-full items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a8ea3] hover:text-[#8b5cf6] transition focus:outline-none"
          >
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              Lịch làm việc ({selected.date})
            </span>
            <ChevronDown className={`size-3.5 transition-transform duration-200 ${showCalendar ? "rotate-180" : ""}`} />
          </button>
          
          {showCalendar && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] font-bold text-[#8a8ea3]">Chọn ngày xử lý:</span>
                <button 
                  type="button"
                  onClick={() => setSelectedIndex(todayIndex)}
                  className="text-[9px] font-bold text-[#8b5cf6] hover:underline focus:outline-none"
                >
                  Hôm nay
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold">
                {weekData.map((day, index) => (
                  <button
                    key={`${day.day}-${index}`}
                    type="button"
                    aria-pressed={selectedIndex === index}
                    aria-label={`${day.date} ${day.quotes} yêu cầu báo giá`}
                    data-selected={selectedIndex === index ? "true" : "false"}
                    className={`rounded-lg py-1.5 transition ${
                      selectedIndex === index ? "bg-[#090a23] text-white" : "bg-[#f1f4f9] text-[#8a8ea3] hover:bg-[#eef0ff] hover:text-[#15172b]"
                    }`}
                    onClick={() => setSelectedIndex(index as WeekIndex)}
                  >
                    <span>{day.day}</span>
                    <span className="mt-0.5 block text-[8px] opacity-70">{day.dayNumber}</span>
                  </button>
                ))}
              </div>
              <div className="rounded-lg bg-slate-50 p-2 text-[10px] font-semibold text-slate-500 leading-normal">
                Ngày {selected.date} có <strong>{selected.quotes} yêu cầu</strong> & <strong>{selected.drafts} bản nháp</strong>.
              </div>
              <Link href={safeAdminHref(selected.href, role)} className="flex items-center gap-2 rounded-xl border border-[#e0e6ef] bg-white p-3 text-sm font-bold text-[#15172b] shadow-[0_12px_28px_rgba(21,23,43,0.05)] transition hover:border-[#8b5cf6]/35 hover:text-[#8b5cf6]">
                <CheckCircle2 className="size-4 text-emerald-600" />
                Mở việc ngày {selected.date}
              </Link>
            </div>
          )}
        </section>
      </div>
    </aside>
  );
}

