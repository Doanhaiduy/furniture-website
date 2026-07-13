"use client";

import Link from "next/link";
import {
  ArrowRight,
  Package,
  Tag,
  Newspaper,
  MapPin,
  MessageSquare,
  Users,
  Settings,
  Activity,
  Database,
  Globe2,
  Sparkles,
  Cpu,
} from "lucide-react";


import {
  type AdminQuote,
} from "@/lib/supabase/admin-queries";








import { DashboardInsightChart } from "../admin-dashboard-widgets";
import { StatusBadge } from "@/components/admin/StatusBadge";



export interface Brand {
  id: string;
  name: { vi: string; en: string };
  origin?: string;
  logo_url?: string;
  status: "draft" | "published" | "archived";
  sort_order: number;
  slug?: string;
}

import {
  AdminPageHeader
} from "./SharedComponents";

export function AdminDashboard({
  stats,
  role,
  quotes = [],
}: {
  stats: {
    productCount: number;
    categoryCount: number;
    blogCount: number;
    showroomCount: number;
    quoteCount: number;
    userCount: number;
  };
  role?: string;
  quotes?: AdminQuote[];
}) {
  const isAdmin = role === "admin";
  const kpis = [
    { label: "Sản phẩm", value: stats.productCount, delta: "Tổng danh mục", visible: true, Icon: Package, href: "/admin/products" },
    { label: "Danh mục", value: stats.categoryCount, delta: "Nhóm sản phẩm", visible: true, Icon: Tag, href: "/admin/categories" },
    { label: "Bài viết", value: stats.blogCount, delta: "Đã xuất bản", visible: true, Icon: Newspaper, href: "/admin/blog" },
    { label: "Showroom", value: stats.showroomCount, delta: "Đang hoạt động", visible: true, Icon: MapPin, href: "/admin/showrooms" },
    { label: "Yêu cầu báo giá", value: stats.quoteCount, delta: "Chờ xử lý", visible: isAdmin, Icon: MessageSquare, href: "/admin/quotes" },
    { label: "Người dùng", value: stats.userCount, delta: "Tài khoản", visible: isAdmin, Icon: Users, href: "/admin/users" },
  ].filter((item) => item.visible);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Tổng quan vận hành"
        description="Chào mừng quay trở lại trang quản trị. Hãy theo dõi biểu đồ báo giá, hoạt động gần đây và sức khỏe của hệ thống bên dưới."
        actionHref="/admin/products?create=1"
        actionLabel="Thêm sản phẩm"
      />

      {/* KPI Cards */}
      <div className="motion-stagger grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group relative bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between cursor-pointer">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider group-hover:text-indigo-500 transition-colors">{stat.label}</span>
              <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-600 transition-colors">
                <stat.Icon className="size-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <strong className="text-2xl font-extrabold text-slate-800 tracking-tight group-hover:text-indigo-700 transition-colors">{stat.value}</strong>
              <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">{stat.delta}</span>
            </div>
            <ArrowRight className="absolute bottom-3 right-3 size-3 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-indigo-400 transition-all duration-200" />
          </Link>
        ))}
      </div>

      {/* Insight Section */}
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr] items-start">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="space-y-1">
            <h3 className="font-heading text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="size-4.5 text-indigo-500" />
              <span>Biểu đồ phân tích tuần này</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">Báo cáo số lượng yêu cầu báo giá và tiến trình công việc trong tuần qua.</p>
          </div>
          <DashboardInsightChart quotes={quotes} role={role as "admin" | "editor"} />
        </div>
        <div className="space-y-6">
          <SystemStatusPanel />
          <QuickActions />
        </div>
      </div>

      {/* Quote Table */}
      {isAdmin && <QuoteTable compact quotes={quotes} />}
    </div>
  );
}

function QuoteTable({ compact, quotes = [] }: { compact?: boolean; quotes?: AdminQuote[] }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4.5 text-indigo-500" />
          <h3 className="font-heading text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            Yêu cầu báo giá mới nhất
          </h3>
        </div>
        {compact && (
          <Link
            className="text-xs font-bold text-indigo-650 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
            href="/admin/quotes"
          >
            Xem tất cả
          </Link>
        )}
      </div>
      {quotes.length === 0 ? (
        <p className="p-8 text-center text-xs text-slate-450 font-medium">Chưa có yêu cầu báo giá nào.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {quotes.slice(0, 5).map((quote) => (
            <div
              key={quote.id}
              className="grid gap-3 items-center px-5 py-3.5 transition-colors hover:bg-slate-50 md:grid-cols-[1fr_1.2fr_120px_120px]"
            >
              <div className="min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">{quote.full_name}</p>
                <p className="text-xs text-slate-400 font-semibold">{quote.phone}</p>
              </div>
              <p className="text-xs text-slate-650 font-semibold truncate">
                {quote.service ?? quote.source_path ?? "—"}
              </p>
              <p className="text-xs text-slate-450 font-semibold" suppressHydrationWarning>
                {new Date(quote.created_at).toLocaleDateString("vi-VN")}
              </p>
              <div className="justify-self-start md:justify-self-end">
                <StatusBadge status={quote.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SystemStatusPanel() {
  const items = [
    { label: "Cơ sở dữ liệu", value: "Supabase Postgres", desc: "Đã kết nối", Icon: Database, color: "text-emerald-500 bg-emerald-50" },
    { label: "Lưu trữ hình ảnh", value: "Cloudinary CDN", desc: "Đã đồng bộ", Icon: Globe2, color: "text-blue-500 bg-blue-50" },
    { label: "Trình trợ lý AI", value: "Gemini 1.5 Flash", desc: "Sẵn sàng", Icon: Sparkles, color: "text-violet-500 bg-violet-50" },
    { label: "Cấu hình ngôn ngữ", value: "Bản dịch VI/EN", desc: "Hoạt động", Icon: Cpu, color: "text-amber-500 bg-amber-50" },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="size-5 text-indigo-500" />
        <h3 className="font-heading text-sm font-extrabold text-slate-800 uppercase tracking-wider">Trạng thái hệ thống</h3>
      </div>
      <div className="grid gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${item.color}`}>
                <item.Icon className="size-4" />
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">{item.label}</p>
                <p className="text-xs font-bold text-slate-700">{item.value}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              {item.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { label: "Quản lý danh mục", href: "/admin/categories", desc: "Thiết lập nhóm & cây danh mục" },
    { label: "Rà soát bài viết song ngữ", href: "/admin/blog", desc: "Duyệt bài nháp & bản dịch tin tức" },
    { label: "Cập nhật báo giá", href: "/admin/quotes", desc: "Xử lý yêu cầu báo giá của khách" },
    { label: "Cấu hình SEO mặc định", href: "/admin/settings", desc: "Thiết lập thẻ meta & MXH" },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-white shadow-md space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="size-5 text-indigo-400" />
        <h3 className="font-heading text-sm font-extrabold uppercase tracking-wider text-slate-200">Thao tác nhanh</h3>
      </div>
      <div className="grid gap-3">
        {actions.map((act) => (
          <Link
            key={act.label}
            href={act.href}
            className="group flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition duration-200"
          >
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{act.label}</p>
              <p className="text-[10px] text-slate-400 font-medium">{act.desc}</p>
            </div>
            <ArrowRight className="size-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition" />
          </Link>
        ))}
      </div>
    </div>
  );
}
