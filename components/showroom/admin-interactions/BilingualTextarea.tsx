"use client";

import React from "react";

interface BilingualTextareaProps {
  label: string;
  viValue: string;
  enValue: string;
  onViChange: (value: string) => void;
  onEnChange: (value: string) => void;
  placeholderVi?: string;
  placeholderEn?: string;
  required?: boolean;
  rows?: number;
}

export function BilingualTextarea({
  label,
  viValue,
  enValue,
  onViChange,
  onEnChange,
  placeholderVi,
  placeholderEn,
  required,
  rows = 3,
}: BilingualTextareaProps) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold text-slate-705">{label}</span>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Tiếng Việt</span>
          <textarea
            className="w-full rounded border border-slate-200 p-2 text-xs focus:ring-1 focus:ring-indigo-505 focus:border-indigo-505 bg-white"
            value={viValue}
            onChange={(e) => onViChange(e.target.value)}
            placeholder={placeholderVi}
            required={required}
            rows={rows}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Tiếng Anh</span>
          <textarea
            className="w-full rounded border border-slate-200 p-2 text-xs focus:ring-1 focus:ring-indigo-505 focus:border-indigo-505 bg-white"
            value={enValue}
            onChange={(e) => onEnChange(e.target.value)}
            placeholder={placeholderEn}
            rows={rows}
          />
        </label>
      </div>
    </div>
  );
}
