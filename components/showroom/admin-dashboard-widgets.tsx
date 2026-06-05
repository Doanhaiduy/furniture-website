"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Popover as PopoverPrimitive } from "radix-ui";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Sparkles,
} from "lucide-react";

const weekData = [
  { day: "M", date: "01 Jun", iso: "2026-06-01", dayNumber: 1, quotes: 4, seo: 82, drafts: 3, href: "/admin/quotes" },
  { day: "T", date: "02 Jun", iso: "2026-06-02", dayNumber: 2, quotes: 7, seo: 84, drafts: 4, href: "/admin/blog" },
  { day: "W", date: "03 Jun", iso: "2026-06-03", dayNumber: 3, quotes: 5, seo: 80, drafts: 2, href: "/admin/products" },
  { day: "T", date: "04 Jun", iso: "2026-06-04", dayNumber: 4, quotes: 9, seo: 87, drafts: 5, href: "/admin/quotes" },
  { day: "F", date: "05 Jun", iso: "2026-06-05", dayNumber: 5, quotes: 6, seo: 85, drafts: 3, href: "/admin/media" },
  { day: "S", date: "06 Jun", iso: "2026-06-06", dayNumber: 6, quotes: 10, seo: 88, drafts: 6, href: "/admin/blog" },
  { day: "S", date: "07 Jun", iso: "2026-06-07", dayNumber: 7, quotes: 5, seo: 83, drafts: 2, href: "/admin/settings" },
] as const;

const metricOptions = [
  { key: "quotes", label: "Quotes" },
  { key: "seo", label: "SEO" },
  { key: "drafts", label: "Drafts" },
] as const;

type Metric = (typeof metricOptions)[number]["key"];
type WeekIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const todayIndex: WeekIndex = 1;
const calendarWeekdays = ["M", "T", "W", "T", "F", "S", "S"] as const;
const june2026Cells = Array.from({ length: 35 }, (_, index) => {
  const dayNumber = index + 1;
  return dayNumber <= 30 ? dayNumber : null;
});

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
    throw new Error("useAdminDateSelection must be used inside AdminDateProvider");
  }

  return context;
}

function AdminDatePicker({
  selectedIndex,
  onSelectIndex,
  variant,
}: {
  selectedIndex: number;
  onSelectIndex: (index: WeekIndex) => void;
  variant: "chart" | "rail-date" | "rail-icon";
}) {
  const [open, setOpen] = useState(false);
  const selected = weekData[selectedIndex] ?? weekData[todayIndex];
  const calendarTitleId = `admin-calendar-${variant}-title`;
  const scheduledByDay = new Map<number, { item: (typeof weekData)[number]; index: WeekIndex }>(
    weekData.map((item, index) => [item.dayNumber, { item, index: index as WeekIndex }])
  );
  const triggerLabel = variant === "rail-icon" ? "Open calendar" : `Open calendar for ${selected.date}`;
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
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a8ea3]">Calendar</p>
              <h3 id={calendarTitleId} className="mt-1 font-heading text-lg font-semibold">June 2026</h3>
            </div>
            <p className="rounded-full bg-[#f5f2ff] px-3 py-1 text-xs font-bold text-[#8b5cf6]">{selected.date}</p>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#8a8ea3]" role="grid" aria-label="June 2026 admin schedule calendar">
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
                  aria-label={`${scheduled.item.date}, ${scheduled.item.quotes} quote leads`}
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
              <span className="font-semibold text-[#686d82]">Quote leads</span>
              <strong>{selected.quotes}</strong>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-[#686d82]">SEO readiness</span>
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
              Today
            </button>
            <Link
              href={selected.href}
              className="rounded-lg bg-[#8b5cf6] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#7d4df0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/25"
              onClick={() => setOpen(false)}
            >
              Open work
            </Link>
          </div>
          <PopoverPrimitive.Arrow className="fill-white" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export function NotificationButton() {
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(false);

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
            aria-label="Notifications"
            aria-haspopup="menu"
            aria-expanded={open}
            className={`grid size-10 place-items-center rounded-xl border bg-white shadow-[0_10px_22px_rgba(21,23,43,0.05)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/25 active:scale-[0.98] ${
              open ? "border-[#8b5cf6]/45 text-[#8b5cf6]" : "border-[#dbe2ec] text-[#6b7086] hover:border-[#8b5cf6]/35 hover:text-[#8b5cf6]"
            }`}
          >
            <Bell className="size-[17px]" />
            {!read ? <span className="absolute right-2 top-2 size-2 rounded-full bg-[#ff8a00]" /> : null}
          </button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="end"
            sideOffset={10}
            collisionPadding={16}
            className="z-[90] w-72 rounded-xl border border-[#e0e6ef] bg-white p-3 text-[#15172b] shadow-[0_20px_60px_rgba(21,23,43,0.16)] outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 motion-reduce:transition-none"
          >
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a8ea3]">Notifications</p>
          <div className="mt-3 grid gap-2 text-sm">
            <Link href="/admin/quotes" className="rounded-lg bg-[#f4f6fb] p-3 font-semibold text-[#15172b] transition hover:bg-[#eef0ff]">
              3 quote requests need review
            </Link>
            <Link href="/admin/products" className="rounded-lg bg-[#f4f6fb] p-3 font-semibold text-[#15172b] transition hover:bg-[#eef0ff]">
              2 products are missing EN metadata
            </Link>
          </div>
            <PopoverPrimitive.Arrow className="fill-white" />
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
}

export function AdminLocaleToggle() {
  const [locale, setLocale] = useState<"VI" | "EN">("VI");

  return (
    <div className="hidden rounded-full border border-[#dbe2ec] bg-white p-1 text-xs font-bold text-[#15172b] shadow-[0_10px_22px_rgba(21,23,43,0.05)] sm:inline-flex">
      {(["VI", "EN"] as const).map((item) => (
        <button
          key={item}
          type="button"
          aria-pressed={locale === item}
          className={`rounded-full px-2.5 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/25 ${
            locale === item ? "bg-[#090a23] text-white" : "text-[#686d82] hover:bg-[#f4f6fb] hover:text-[#15172b]"
          }`}
          onClick={() => setLocale(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export function DashboardInsightChart() {
  const [metric, setMetric] = useState<Metric>("quotes");
  const { selectedIndex: activeIndex, setSelectedIndex: setActiveIndex } = useAdminDateSelection();
  const values = weekData.map((item) => item[metric]);
  const max = Math.max(...values);
  const active = weekData[activeIndex];

  const bars = useMemo(
    () =>
      weekData.map((item, index) => {
        const value = item[metric];
        const height = Math.max(16, (value / max) * 140);
        return { item, index, value, height, x: 22 + index * 54, y: 164 - height };
      }),
    [max, metric]
  );

  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_210px]">
      <div className="rounded-2xl border border-[#e0e6ef] bg-[#f4f6fb] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {metricOptions.map((option) => (
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
          <AdminDatePicker selectedIndex={activeIndex} onSelectIndex={setActiveIndex} variant="chart" />
        </div>

        <svg className="mt-4 h-52 w-full" viewBox="0 0 404 190" role="img" aria-label={`Weekly ${metric} chart`}>
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
          {weekData.map((item, index) => (
            <button
              key={item.date}
              type="button"
              aria-pressed={activeIndex === index}
              aria-label={`${item.date}: ${item[metric]} ${metric}`}
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
          ["Selected day", active.date],
          ["Quote leads", String(active.quotes)],
          ["SEO ready", `${active.seo}%`],
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

export function AdminUtilityRail({ active }: { active: string }) {
  const { selectedIndex, setSelectedIndex } = useAdminDateSelection();
  const selected = weekData[selectedIndex];
  const context =
    active === "ai-assistant"
      ? "AI drafts require human review"
      : active === "quotes"
        ? "Admin-only lead workflow"
        : "Publishing readiness";

  return (
    <aside className="hidden w-[286px] shrink-0 border-l border-[#e3e8f0] bg-white/55 p-4 xl:block">
      <div className="sticky top-[84px] space-y-4">
        <section className="rounded-2xl border border-[#e0e6ef] bg-white p-4 shadow-[0_14px_34px_rgba(21,23,43,0.06)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <button
                type="button"
                aria-pressed={selectedIndex === todayIndex}
                data-selected={selectedIndex === todayIndex ? "true" : "false"}
                className={`rounded-md text-left text-[11px] font-bold uppercase tracking-[0.16em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/25 ${
                  selectedIndex === todayIndex ? "text-[#8b5cf6]" : "text-[#8a8ea3] hover:text-[#8b5cf6]"
                }`}
                onClick={() => setSelectedIndex(todayIndex)}
              >
                Today
              </button>
              <AdminDatePicker selectedIndex={selectedIndex} onSelectIndex={setSelectedIndex} variant="rail-date" />
            </div>
            <AdminDatePicker selectedIndex={selectedIndex} onSelectIndex={setSelectedIndex} variant="rail-icon" />
          </div>
          <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[10px] font-bold">
            {weekData.map((day, index) => (
              <button
                key={`${day.day}-${index}`}
                type="button"
                aria-pressed={selectedIndex === index}
                aria-label={`${day.date} ${day.quotes} quote leads`}
                data-selected={selectedIndex === index ? "true" : "false"}
                className={`rounded-lg py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/25 ${
                  selectedIndex === index ? "bg-[#090a23] text-white" : "bg-[#f1f4f9] text-[#8a8ea3] hover:bg-[#eef0ff] hover:text-[#15172b]"
                }`}
                onClick={() => setSelectedIndex(index as WeekIndex)}
              >
                <span>{day.day}</span>
                <span className="mt-0.5 block text-[9px] opacity-70">{day.dayNumber.toString().padStart(2, "0")}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#e0e6ef] bg-white p-4 shadow-[0_14px_34px_rgba(21,23,43,0.06)]">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a8ea3]">Readiness</p>
            <Sparkles className="size-4 text-[#ff8a00]" />
          </div>
          <div className="mx-auto mt-5 grid size-30 place-items-center rounded-full bg-[conic-gradient(#8b5cf6_0_82%,#edf0f7_82%_100%)]">
            <div className="grid size-22 place-items-center rounded-full bg-white text-center">
              <strong className="font-heading text-lg text-[#15172b]">82%</strong>
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a8ea3]">SEO</span>
            </div>
          </div>
          <p className="mt-4 rounded-xl bg-[#f4f6fb] p-3 text-sm font-semibold leading-6 text-[#686d82]">
            {context}
          </p>
        </section>

        <section className="rounded-2xl bg-[#090a23] p-4 text-white shadow-[0_18px_44px_rgba(9,10,35,0.16)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">Queue</p>
          <div className="mt-4 space-y-3">
            {[
              ["09:00", "Review quote requests", "/admin/quotes"],
              ["10:30", "Approve EN metadata", "/admin/blog"],
              ["14:00", "Media alt audit", "/admin/media"],
            ].map(([time, label, href]) => (
              <Link key={label} href={href} className="block rounded-xl bg-white/8 p-3 transition hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30">
                <p className="text-xs font-bold text-[#ffe45e]">{time}</p>
                <p className="mt-1 text-sm font-semibold text-white/82">{label}</p>
              </Link>
            ))}
          </div>
        </section>

        <Link href={selected.href} className="flex items-center gap-2 rounded-xl border border-[#e0e6ef] bg-white p-3 text-sm font-bold text-[#15172b] shadow-[0_12px_28px_rgba(21,23,43,0.05)] transition hover:border-[#8b5cf6]/35 hover:text-[#8b5cf6]">
          <CheckCircle2 className="size-4 text-emerald-600" />
          Open {selected.date} work
        </Link>
      </div>
    </aside>
  );
}
