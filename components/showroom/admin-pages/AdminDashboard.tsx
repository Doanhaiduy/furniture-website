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
  Globe2,
  Sparkles,
  ShieldCheck,
  Mail,
  PlusCircle,
  FileText,
  Sliders,
  Store,
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
    { label: "Sản phẩm", value: stats.productCount, delta: "Đang kinh doanh", visible: true, Icon: Package, href: "/admin/products", color: "text-amber-700 bg-amber-50 group-hover:bg-amber-100" },
    { label: "Danh mục", value: stats.categoryCount, delta: "Ngành hàng", visible: true, Icon: Tag, href: "/admin/categories", color: "text-blue-700 bg-blue-50 group-hover:bg-blue-100" },
    { label: "Bài viết", value: stats.blogCount, delta: "Tin tức & Cẩm nang", visible: true, Icon: Newspaper, href: "/admin/blog", color: "text-emerald-700 bg-emerald-50 group-hover:bg-emerald-100" },
    { label: "Showroom", value: stats.showroomCount, delta: "Cửa hàng hoạt động", visible: true, Icon: MapPin, href: "/admin/showrooms", color: "text-purple-700 bg-purple-50 group-hover:bg-purple-100" },
    { label: "Yêu cầu báo giá", value: stats.quoteCount, delta: "Khách hàng liên hệ", visible: isAdmin, Icon: MessageSquare, href: "/admin/quotes", color: "text-rose-700 bg-rose-50 group-hover:bg-rose-100" },
    { label: "Người dùng", value: stats.userCount, delta: "Tài khoản quản trị", visible: isAdmin, Icon: Users, href: "/admin/users", color: "text-slate-700 bg-slate-100 group-hover:bg-slate-200" },
  ].filter((item) => item.visible);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Tổng quan vận hành"
        description="Bảng điều khiển quản trị Showroom Nội Thất Phương Đông. Theo dõi dữ liệu, yêu cầu báo giá và trạng thái hệ thống theo thời gian thực."
        actionHref="/admin/products?create=1"
        actionLabel="Thêm sản phẩm mới"
      />

      {/* KPI Cards */}
      <div className="motion-stagger grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group relative bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40 transition-all duration-200 flex flex-col justify-between cursor-pointer">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider group-hover:text-primary transition-colors">{stat.label}</span>
              <div className={`p-2 rounded-xl transition-colors ${stat.color}`}>
                <stat.Icon className="size-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <strong className="text-2xl font-extrabold text-slate-800 tracking-tight group-hover:text-primary transition-colors">{stat.value}</strong>
              <span className="text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">{stat.delta}</span>
            </div>
            <ArrowRight className="absolute bottom-3 right-3 size-3 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all duration-200" />
          </Link>
        ))}
      </div>

      {/* Insight Section */}
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr] items-start">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="space-y-1">
            <h3 className="font-heading text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Activity className="size-4 text-primary" />
              <span>Biểu đồ hoạt động tuần này</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">Thống kê số lượng yêu cầu tư vấn báo giá từ khách hàng trong tuần qua.</p>
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
          <MessageSquare className="size-4 text-primary" />
          <h3 className="font-heading text-sm font-bold text-slate-800 uppercase tracking-wider">
            Yêu cầu báo giá mới nhất
          </h3>
        </div>
        {compact && (
          <Link
            className="text-xs font-semibold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/15 px-3 py-1.5 rounded-lg transition"
            href="/admin/quotes"
          >
            Xem tất cả ({quotes.length})
          </Link>
        )}
      </div>
      {quotes.length === 0 ? (
        <div className="p-8 text-center">
          <MessageSquare className="size-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">Chưa có yêu cầu báo giá mới nào.</p>
        </div>
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
              <p className="text-xs text-slate-600 font-medium truncate">
                {quote.service ?? quote.source_path ?? "—"}
              </p>
              <p className="text-xs text-slate-400" suppressHydrationWarning>
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
    {
      label: "Hạ tầng & Dữ liệu",
      value: "Máy chủ Cloud & Postgres",
      desc: "Bảo mật HTTPS / SSL",
      Icon: ShieldCheck,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      label: "Lưu trữ hình ảnh & CDN",
      value: "Cloudinary CDN",
      desc: "Tải ảnh tốc độ cao",
      Icon: Globe2,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      label: "Hệ thống gửi Email",
      value: "Brevo SMTP Relay",
      desc: "Sẵn sàng gửi báo giá",
      Icon: Mail,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      label: "Trợ lý AI viết bài",
      value: "Google Gemini AI",
      desc: "Sẵn sàng hỗ trợ",
      Icon: Sparkles,
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-4 text-emerald-600" />
        <h3 className="font-heading text-sm font-bold text-slate-800 uppercase tracking-wider">
          Trạng thái dịch vụ
        </h3>
      </div>
      <div className="grid gap-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg border ${item.color}`}>
                <item.Icon className="size-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.label}</p>
                <p className="text-xs font-semibold text-slate-800">{item.value}</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
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
    {
      label: "Thêm sản phẩm mới",
      href: "/admin/products?create=1",
      desc: "Tạo sản phẩm, tải ảnh & báo giá",
      Icon: PlusCircle,
      badge: "Sản phẩm",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      label: "Đăng bài viết mới",
      href: "/admin/blog?create=1",
      desc: "Soạn tin tức, cẩm nang với trợ lý AI",
      Icon: FileText,
      badge: "Tin tức",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Quản lý hệ thống Showroom",
      href: "/admin/showrooms",
      desc: "Địa chỉ, hotline & bản đồ Google Maps",
      Icon: Store,
      badge: "Cửa hàng",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      label: "Cấu hình Website & SEO",
      href: "/admin/settings",
      desc: "Thông tin liên hệ, hotline, SEO & MXH",
      Icon: Sliders,
      badge: "Cài đặt",
      badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="size-4 text-primary" />
        <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-800">
          Thao tác nhanh
        </h3>
      </div>
      <div className="grid gap-2.5">
        {actions.map((act) => (
          <Link
            key={act.label}
            href={act.href}
            className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/80 hover:border-primary/30 transition-all duration-200 shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <act.Icon className="size-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-800 group-hover:text-primary transition-colors">
                    {act.label}
                  </p>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${act.badgeColor}`}>
                    {act.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">{act.desc}</p>
              </div>
            </div>
            <ArrowRight className="size-4 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}
