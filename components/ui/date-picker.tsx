"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MONTHS_VI = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

// Local (timezone-safe) conversions between Date and "YYYY-MM-DD".
function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function parseISO(s?: string): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}
function formatDisplay(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * A lightweight, dependency-free date picker (Radix Popover + a month grid).
 * Value/onChange use the "YYYY-MM-DD" string format, matching native <input type="date">.
 */
export function DatePickerField({
  value,
  onChange,
  placeholder = "Chọn ngày",
  className,
  ariaLabel,
}: {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const selected = parseISO(value);
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel || placeholder}
          className={cn(
            "relative flex h-9 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white pl-8 pr-2 text-xs font-medium text-slate-600 outline-none transition hover:border-primary/40 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary",
            className
          )}
        >
          <CalendarIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <span className={cn("truncate", !selected && "text-slate-400")}>
            {selected ? formatDisplay(selected) : placeholder}
          </span>
          {selected && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Xóa ngày"
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
          <button
            type="button"
            onClick={() => goMonth(-1)}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Tháng trước"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm font-bold text-slate-800">
            {MONTHS_VI[month]} {year}
          </span>
          <button
            type="button"
            onClick={() => goMonth(1)}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Tháng sau"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {WEEKDAYS.map((w) => (
            <span key={w} className="py-1 text-[10px] font-bold uppercase text-slate-400">
              {w}
            </span>
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
                onClick={() => {
                  onChange(toISO(cellDate));
                  setOpen(false);
                }}
                className={cn(
                  "grid size-8 place-items-center rounded-lg text-xs font-medium transition",
                  isSelected
                    ? "bg-primary text-white"
                    : isToday
                      ? "border border-primary/40 text-primary hover:bg-primary/10"
                      : "text-slate-700 hover:bg-slate-100"
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
