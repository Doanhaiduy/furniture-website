"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarClock, ChevronLeft, ChevronRight, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MONTHS_VI = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

// Parse a datetime-local ("YYYY-MM-DDTHH:mm") or ISO string, timezone-safe (local).
function parse(s?: string): { date: Date | null; hh: number; mm: number } {
  if (!s) return { date: null, hh: 0, mm: 0 };
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(s);
  if (!m) return { date: null, hh: 0, mm: 0 };
  return {
    date: new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])),
    hh: m[4] ? Number(m[4]) : 0,
    mm: m[5] ? Number(m[5]) : 0,
  };
}
// Emit the native datetime-local format so this is a drop-in for <input type="datetime-local">.
function toValue(d: Date, hh: number, mm: number): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
function formatDisplay(d: Date, hh: number, mm: number): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Unified date + time picker (Radix Popover + month grid + HH:mm inputs).
 * Value/onChange use the native "YYYY-MM-DDTHH:mm" format so it is a drop-in
 * replacement for <input type="datetime-local"> across every admin form.
 * Times are interpreted in the browser's local timezone.
 */
export function DateTimePickerField({
  value,
  onChange,
  placeholder = "Chọn ngày & giờ",
  className,
  ariaLabel,
  error,
}: {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  error?: boolean;
}) {
  const { date: selected, hh, mm } = parse(value);
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(() => selected ?? new Date());
  const today = new Date();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDayOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const goMonth = (delta: number) => setViewDate(new Date(year, month + delta, 1));

  // Emit using the given date (falls back to the currently-selected day or today).
  const emit = (d: Date | null, nh: number, nm: number) => {
    const base = d ?? selected ?? new Date();
    onChange(toValue(base, nh, nm));
  };
  const clampHH = (n: number) => Math.max(0, Math.min(23, Number.isFinite(n) ? n : 0));
  const clampMM = (n: number) => Math.max(0, Math.min(59, Number.isFinite(n) ? n : 0));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel || placeholder}
          className={cn(
            "relative flex h-9 w-full items-center gap-2 rounded-lg border bg-white pl-8 pr-2 text-xs font-medium text-slate-600 outline-none transition hover:border-primary/40 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary",
            error ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500" : "border-slate-200",
            className,
          )}
        >
          <CalendarClock className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <span className={cn("truncate", !selected && "text-slate-400")}>
            {selected ? formatDisplay(selected, hh, mm) : placeholder}
          </span>
          {selected && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Xóa ngày giờ"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="ml-auto rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="size-3.5" />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto rounded-xl border-[var(--admin-border)] bg-white p-3 shadow-xl">
        <div className="mb-2 flex items-center justify-between">
          <button type="button" onClick={() => goMonth(-1)} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800" aria-label="Tháng trước">
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm font-bold text-slate-800">{MONTHS_VI[month]} {year}</span>
          <button type="button" onClick={() => goMonth(1)} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800" aria-label="Tháng sau">
            <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {WEEKDAYS.map((w) => (
            <span key={w} className="py-1 text-[10px] font-bold uppercase text-slate-400">{w}</span>
          ))}
          {cells.map((day, idx) => {
            if (day === null) return <span key={`b-${idx}`} />;
            const cellDate = new Date(year, month, day);
            const isSelected = selected && sameDay(cellDate, selected);
            const isToday = sameDay(cellDate, today);
            return (
              <button
                key={day}
                type="button"
                onClick={() => emit(cellDate, hh, mm)}
                className={cn(
                  "grid size-8 place-items-center rounded-lg text-xs font-medium transition",
                  isSelected ? "bg-primary text-white" : isToday ? "border border-primary/40 text-primary hover:bg-primary/10" : "text-slate-700 hover:bg-slate-100",
                )}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Time row */}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="size-4 text-slate-400" />
            <input
              type="number" min={0} max={23} aria-label="Giờ"
              value={String(hh).padStart(2, "0")}
              onChange={(e) => emit(null, clampHH(parseInt(e.target.value, 10)), mm)}
              className="h-8 w-12 rounded-lg border border-slate-200 bg-white text-center text-sm font-semibold text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <span className="font-bold text-slate-400">:</span>
            <input
              type="number" min={0} max={59} aria-label="Phút"
              value={String(mm).padStart(2, "0")}
              onChange={(e) => emit(null, hh, clampMM(parseInt(e.target.value, 10)))}
              className="h-8 w-12 rounded-lg border border-slate-200 bg-white text-center text-sm font-semibold text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => { const n = new Date(); emit(n, n.getHours(), n.getMinutes()); }}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-primary transition hover:bg-primary/10"
            >
              Bây giờ
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white transition hover:bg-primary/90"
            >
              Xong
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
