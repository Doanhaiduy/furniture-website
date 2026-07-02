"use client";

import React from "react";

interface BilingualInputProps {
  label: string;
  viValue: string;
  enValue: string;
  onViChange: (value: string) => void;
  onEnChange: (value: string) => void;
  placeholderVi?: string;
  placeholderEn?: string;
  required?: boolean;
}

export function BilingualInput({
  label,
  viValue,
  enValue,
  onViChange,
  onEnChange,
  placeholderVi,
  placeholderEn,
  required,
}: BilingualInputProps) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold text-slate-705">{label}</span>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Tiếng Việt</span>
          <input
            className="input-pd bg-white"
            type="text"
            value={viValue}
            onChange={(e) => onViChange(e.target.value)}
            placeholder={placeholderVi}
            required={required}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Tiếng Anh</span>
          <input
            className="input-pd bg-white"
            type="text"
            value={enValue}
            onChange={(e) => onEnChange(e.target.value)}
            placeholder={placeholderEn}
          />
        </label>
      </div>
    </div>
  );
}
