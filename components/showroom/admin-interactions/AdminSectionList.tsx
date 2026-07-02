"use client";

import React from "react";
import Link from "next/link";
import { adminSections, type AdminSection } from "../admin-pages";

interface AdminSectionListProps {
  activeSection?: AdminSection;
}

export function AdminSectionList({ activeSection }: AdminSectionListProps) {
  return (
    <div className="flex flex-col gap-1.5 p-2 bg-slate-50 rounded-xl border">
      <span className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        Phân mục quản trị
      </span>
      {adminSections.map((sec) => {
        const isActive = activeSection === sec;
        return (
          <Link
            key={sec}
            href={`/admin/${sec}`}
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs font-medium transition-all ${
              isActive
                ? "bg-slate-900 text-white"
                : "hover:bg-slate-100 text-slate-650 hover:text-slate-900"
            }`}
          >
            <span className="capitalize">{sec}</span>
          </Link>
        );
      })}
    </div>
  );
}
