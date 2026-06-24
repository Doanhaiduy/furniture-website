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
import type { AdminQuote } from "@/lib/supabase/admin-queries";

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
    
    const daySeed = d.getDate();
    result.push({
      day: dayName,
      date: dateStr,
      iso: isoStr,
      dayNumber: d.getDate(),
      quotes: (daySeed % 7) + 2,
      seo: 80 + (daySeed % 11),
      drafts: daySeed % 5,
      href: "/admin/quotes" as string,
    });
  }
  return result;
};

const weekData = generateDynamicWeekData();

const metricOptions = [
  { key: "quotes", label: "Yêu cầu báo giá" },
  { key: "seo", label: "SEO" },
  { key: "drafts", label: "Bản nháp" },
] as const;

type Metric = (typeof metricOptions)[number]["key"];
type WeekIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type AdminRole = "admin" | "editor";

function isAdminOnlyHref(href: string) {
  return ["/admin/quotes", "/admin/users", "/admin/settings"].some((prefix) =>
    href.startsWith(prefix),
  );
}

function safeAdminHref(href: string, role?: AdminRole) {
  return role === "editor" && isAdminOnlyHref(href) ? "/admin/access-denied" : href;
}

const todayIndex: WeekIndex = 6;
const calendarWeekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"] as const;

const generateMonthCells = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  const totalDays = new Date(year, month + 1, 0).getDate();
  let firstDay = new Date(year, month, 1).getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1;
  
  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    cells.push(i);
  }
  return cells;
};

const june2026Cells = generateMonthCells();

const currentMonthYearTitle = () => {
  const today = new Date();
  return `Tháng ${today.getMonth() + 1}/${today.getFullYear()}`;
};

type AdminDateSelection = {
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

function useAdminDateSelection() {
  const context = useContext(AdminDateSelectionContext);
  if (!context) {
    throw new Error("useAdminDateSelection phải được dùng trong AdminDateProvider");
  }

  return context;
}

function AdminDatePicker({
  selectedIndex,
  onSelectIndex,
  variant,
  role,
}: {
  selectedIndex: number;
  onSelectIndex: (index: WeekIndex) => void;
  variant: "chart" | "rail-date" | "rail-icon";
  role?: AdminRole;
}) {
  const [open, setOpen] = useState(false);
  const selected = weekData[selectedIndex] ?? weekData[todayIndex];
  const summaryMetric: "quotes" | "drafts" = role === "editor" ? "drafts" : "quotes";
  const calendarTitleId = `admin-calendar-${variant}-title`;
  const scheduledByDay = new Map<number, { item: (typeof weekData)[number]; index: WeekIndex }>(
    weekData.map((item, index) => [item.dayNumber, { item, index: index as WeekIndex }])
  );
  const triggerLabel = variant === "rail-icon" ? "Mở lịch" : `Mở lịch cho ngày ${selected.date}`;
  const triggerClassName =
    variant === "chart"
      ? `inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/25 ${
          open
            ? "border-[#8b5cf6]/55 bg-[#f5f2ff] text-[#8b5cf6] shadow-[0_12px_24px_rgba(139,92,246,0.12)]"
            : "border-[#dbe2ec] bg-white text-[#686d82] hover:border-[#8b5cf6]/35 hover:text-[#15172b]"
        }`
      : variant === "rail-date"
        ? `mt-2 inline-flex items-center gap-2 rounded-lg text-left font-heading text-lg font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/25 ${
            open ? "text-[#8b5cf6]" : "text-[#15172b] hover:text-[#8b5cf6]"
          }`
        : `grid size-9 place-items-center rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/25 ${
            open ? "bg-[#8b5cf6] text-white shadow-[0_14px_30px_rgba(139,92,246,0.24)]" : "bg-[#eef0ff] text-[#8b5cf6] hover:bg-[#e3ddff]"
          }`;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label={triggerLabel}
          aria-haspopup="dialog"
          aria-expanded={open}
          data-admin-calendar-trigger={variant}
          data-state={open ? "open" : "closed"}
          className={triggerClassName}
        >
          {variant === "rail-icon" ? (
            <CalendarDays className="size-5" />
          ) : (
            <>
              <CalendarDays className={variant === "chart" ? "size-4" : "size-[18px]"} />
              {selected.date}
              <ChevronDown className={`size-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </>
          )}
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          role="dialog"
          aria-labelledby={calendarTitleId}
          align="end"
          sideOffset={10}
          collisionPadding={16}
          className="z-[90] w-[min(21rem,calc(100vw-2rem))] rounded-2xl border border-[#e0e6ef] bg-white p-4 text-[#15172b] shadow-[0_22px_58px_rgba(21,23,43,0.16)] outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 motion-reduce:transition-none"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a8ea3]">Lịch</p>
              <h3 id={calendarTitleId} className="mt-1 font-heading text-lg font-semibold">{currentMonthYearTitle()}</h3>
            </div>
            <p className="rounded-full bg-[#f5f2ff] px-3 py-1 text-xs font-bold text-[#8b5cf6]">{selected.date}</p>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#8a8ea3]" role="grid" aria-label="Lịch xử lý quản trị tháng 6/2026">
            {calendarWeekdays.map((weekday, index) => (
              <span key={`${weekday}-${index}`} role="columnheader" className="py-1">
                {weekday}
              </span>
            ))}
            {june2026Cells.map((dayNumber, index) => {
              if (!dayNumber) return <span key={`empty-${index}`} aria-hidden className="size-9" />;
              const scheduled = scheduledByDay.get(dayNumber);
              const isSelected = selected.dayNumber === dayNumber;

              return scheduled ? (
                <button
                  key={dayNumber}
                  type="button"
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-label={`${scheduled.item.date}, ${scheduled.item.quotes} yêu cầu báo giá`}
                  data-selected={isSelected ? "true" : "false"}
                  className={`grid size-9 place-items-center rounded-lg text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/25 ${
                    isSelected
                      ? "bg-[#090a23] text-white shadow-[0_12px_24px_rgba(9,10,35,0.18),0_0_0_3px_rgba(139,92,246,0.14)]"
                      : "bg-[#f1f4f9] text-[#686d82] hover:bg-[#eef0ff] hover:text-[#15172b]"
                  }`}
                  onClick={() => {
                    onSelectIndex(scheduled.index);
                    setOpen(false);
                  }}
                >
                  {dayNumber}
                </button>
              ) : (
                <button
                  key={dayNumber}
                  type="button"
                  role="gridcell"
                  disabled
                  aria-disabled="true"
                  className="grid size-9 cursor-not-allowed place-items-center rounded-lg text-xs font-bold text-[#c0c5d2]"
                >
                  {dayNumber}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-2 rounded-xl bg-[#f4f6fb] p-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-[#686d82]">Yêu cầu báo giá</span>
              <strong>{selected[summaryMetric]}</strong>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-[#686d82]">Mức độ sẵn sàng SEO</span>
              <strong>{selected.seo}%</strong>
            </div>
          </div>

          <div className="mt-4 flex justify-between gap-2">
            <button
              type="button"
              aria-pressed={selectedIndex === todayIndex}
              className={`rounded-lg px-3 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/25 ${
                selectedIndex === todayIndex ? "bg-[#090a23] text-white" : "bg-white text-[#686d82] hover:bg-[#f4f6fb] hover:text-[#15172b]"
              }`}
              onClick={() => {
                onSelectIndex(todayIndex);
                setOpen(false);
              }}
            >
              Hôm nay
            </button>
            <Link
              href={safeAdminHref(selected.href, role)}
              className="rounded-lg bg-[#8b5cf6] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#7d4df0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/25"
              onClick={() => setOpen(false)}
            >
              Mở việc
            </Link>
          </div>
          <PopoverPrimitive.Arrow className="fill-white" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
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

export function DashboardInsightChart({ role, quotes = [] }: { role?: AdminRole; quotes?: AdminQuote[] }) {
  const [metric, setMetric] = useState<Metric>(role === "editor" ? "seo" : "quotes");
  const { selectedIndex: activeIndex, setSelectedIndex: setActiveIndex } = useAdminDateSelection();
  const visibleMetricOptions = useMemo(
    () => (role === "editor" ? metricOptions.filter((option) => option.key !== "quotes") : metricOptions),
    [role],
  );

  const chartWeekData = useMemo(() => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const today = new Date();
    const result = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
      const isoStr = d.toISOString().split("T")[0];
      const dayName = days[d.getDay()];
      
      const countOnDay = quotes.filter((q) => {
        const qDate = new Date(q.created_at);
        return qDate.getFullYear() === d.getFullYear() &&
               qDate.getMonth() === d.getMonth() &&
               qDate.getDate() === d.getDate();
      }).length;
      
      const daySeed = d.getDate();
      result.push({
        day: dayName,
        date: dateStr,
        iso: isoStr,
        dayNumber: d.getDate(),
        quotes: countOnDay,
        seo: 80 + (daySeed % 11),
        drafts: daySeed % 5,
        href: "/admin/quotes"
      });
    }
    return result;
  }, [quotes]);

  const values = chartWeekData.map((item) => item[metric]);
  const max = Math.max(1, ...values);
  const active = chartWeekData[activeIndex] ?? chartWeekData[todayIndex] ?? chartWeekData[0];
  const metricLabel = metricOptions.find((option) => option.key === metric)?.label ?? "chỉ số";

  const bars = useMemo(
    () =>
      chartWeekData.map((item, index) => {
        const value = item[metric];
        const height = Math.max(16, (value / max) * 140);
        return { item, index, value, height, x: 22 + index * 54, y: 164 - height };
      }),
    [chartWeekData, max, metric]
  );

  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_210px]">
      <div className="rounded-2xl border border-[#e0e6ef] bg-[#f4f6fb] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {visibleMetricOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                aria-pressed={metric === option.key}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/25 ${
                  metric === option.key ? "bg-[#8b5cf6] text-white" : "bg-white text-[#686d82] hover:text-[#15172b]"
                }`}
                onClick={() => setMetric(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <AdminDatePicker selectedIndex={activeIndex} onSelectIndex={setActiveIndex} variant="chart" role={role} />
        </div>

        <svg className="mt-4 h-52 w-full" viewBox="0 0 404 190" role="img" aria-label={`Biểu đồ tuần: ${metricLabel}`}>
          <line x1="12" y1="166" x2="392" y2="166" stroke="#dfe5ef" strokeWidth="2" />
          {bars.map((bar) => (
            <g key={`${metric}-${bar.item.date}`}>
              <rect
                x={bar.x}
                y={bar.y}
                width="28"
                height={bar.height}
                rx="14"
                fill={activeIndex === bar.index ? "#8b5cf6" : "#d8dff0"}
              />
              <text x={bar.x + 14} y="184" textAnchor="middle" className="fill-[#8a8ea3] text-[10px] font-bold">
                {bar.item.day}
              </text>
            </g>
          ))}
        </svg>

        <div className="grid grid-cols-7 gap-1">
          {chartWeekData.map((item, index) => (
            <button
              key={item.date}
              type="button"
              aria-pressed={activeIndex === index}
              aria-label={`${item.date}: ${item[metric]} ${metricLabel}`}
              data-selected={activeIndex === index ? "true" : "false"}
              className={`rounded-lg py-2 text-[10px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/25 ${
                activeIndex === index ? "bg-[#090a23] text-white" : "bg-white text-[#8a8ea3] hover:text-[#15172b]"
              }`}
              onClick={() => setActiveIndex(index as WeekIndex)}
            >
              {item.day}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {[
          ["Ngày đang chọn", active.date],
          ["Yêu cầu báo giá", String(active.quotes)],
          ["SEO sẵn sàng", `${active.seo}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-[#e0e6ef] bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8a8ea3]">{label}</p>
            <p className="mt-2 font-heading text-xl font-semibold text-[#15172b]">{value}</p>
          </div>
        ))}
      </div>
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
