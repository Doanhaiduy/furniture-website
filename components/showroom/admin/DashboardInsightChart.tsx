"use client";

import { useState, useMemo } from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { CalendarDays, ChevronDown } from "lucide-react";
import Link from "next/link";
import type { AdminQuote } from "@/lib/supabase/admin-queries";
import {
  useAdminDateSelection,
  weekData,
  todayIndex,
  metricOptions,
  safeAdminHref,
  type Metric,
  type WeekIndex,
  type AdminRole,
} from "./DashboardWidgets";

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
      
      result.push({
        day: dayName,
        date: dateStr,
        iso: isoStr,
        dayNumber: d.getDate(),
        quotes: countOnDay,
        // TODO(handover): 'seo' and 'drafts' are NOT backed by real per-day data yet.
        // They previously rendered fabricated random values (80 + daySeed%11, daySeed%5)
        // that looked live on the dashboard. Zeroed out until wired to real metrics via
        // getAdminDashboardStats rather than shipping fake analytics.
        seo: 0,
        drafts: 0,
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

