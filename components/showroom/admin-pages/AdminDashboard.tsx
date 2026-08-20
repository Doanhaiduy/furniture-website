"use client";

import { useState } from "react";
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
  Phone,
  Copy,
  Check,
  TrendingUp,
  Layers,
  Clock,
  ExternalLink,
  History,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import {
  type AdminQuote,
  type CategoryDistributionItem,
  type DashboardFeaturedProduct,
  type DashboardActivityEvent,
  updateQuoteStatus,
} from "@/lib/supabase/admin-queries";

import { DashboardInsightChart } from "../admin-dashboard-widgets";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/components/providers/toast-provider";
import { AdminPageHeader } from "./SharedComponents";

export interface Brand {
  id: string;
  name: { vi: string; en: string };
  origin?: string;
  logo_url?: string;
  status: "draft" | "published" | "archived";
  sort_order: number;
  slug?: string;
}

export function AdminDashboard({
  stats,
  role,
  quotes = [],
  categoryDistribution = [],
  featuredProducts = [],
  recentActivities = [],
}: {
  stats: {
    productCount: number;
    featuredProductCount?: number;
    draftProductCount?: number;
    categoryCount: number;
    blogCount: number;
    publishedBlogCount?: number;
    showroomCount: number;
    quoteCount: number;
    pendingQuoteCount?: number;
    contactedQuoteCount?: number;
    completedQuoteCount?: number;
    userCount: number;
  };
  role?: string;
  quotes?: AdminQuote[];
  categoryDistribution?: CategoryDistributionItem[];
  featuredProducts?: DashboardFeaturedProduct[];
  recentActivities?: DashboardActivityEvent[];
}) {
  const isAdmin = role === "admin";
  const pendingCount = stats.pendingQuoteCount ?? 0;
  const contactedCount = stats.contactedQuoteCount ?? 0;
  const completedCount = stats.completedQuoteCount ?? 0;

  const kpis = [
    {
      label: "Sản phẩm",
      value: stats.productCount,
      delta: `${stats.featuredProductCount ?? 0} nổi bật • ${stats.draftProductCount ?? 0} nháp`,
      visible: true,
      Icon: Package,
      href: "/admin/products",
      color: "text-amber-700 bg-amber-50 group-hover:bg-amber-100",
    },
    {
      label: "Danh mục",
      value: stats.categoryCount,
      delta: "Nhóm ngành hàng",
      visible: true,
      Icon: Tag,
      href: "/admin/categories",
      color: "text-blue-700 bg-blue-50 group-hover:bg-blue-100",
    },
    {
      label: "Bài viết",
      value: stats.blogCount,
      delta: `${stats.publishedBlogCount ?? 0} đã xuất bản`,
      visible: true,
      Icon: Newspaper,
      href: "/admin/blog",
      color: "text-emerald-700 bg-emerald-50 group-hover:bg-emerald-100",
    },
    {
      label: "Showroom",
      value: stats.showroomCount,
      delta: "Cửa hàng hoạt động",
      visible: true,
      Icon: MapPin,
      href: "/admin/showrooms",
      color: "text-purple-700 bg-purple-50 group-hover:bg-purple-100",
    },
    {
      label: "Yêu cầu báo giá",
      value: stats.quoteCount,
      delta: `${pendingCount} mới • ${contactedCount} đang tư vấn`,
      visible: isAdmin,
      Icon: MessageSquare,
      href: "/admin/quotes",
      color: "text-rose-700 bg-rose-50 group-hover:bg-rose-100",
    },
    {
      label: "Người dùng",
      value: stats.userCount,
      delta: "Tài khoản quản trị",
      visible: isAdmin,
      Icon: Users,
      href: "/admin/users",
      color: "text-slate-700 bg-slate-100 group-hover:bg-slate-200",
    },
  ].filter((item) => item.visible);

  return (
    <div className="space-y-6">
      {/* Alert Header if pending quotes exist */}
      {isAdmin && pendingCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <AlertCircle className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold">
                Có <span className="text-amber-700 underline">{pendingCount} yêu cầu báo giá mới</span> đang chờ liên hệ!
              </p>
              <p className="text-xs text-amber-700/90 font-medium">
                Khách hàng đang mong đợi phản hồi sớm từ Showroom Nội Thất Phương Đông.
              </p>
            </div>
          </div>
          <Link
            href="/admin/quotes?status=pending"
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition"
          >
            <span>Xử lý ngay</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      <AdminPageHeader
        title="Tổng quan điều hành"
        description="Bảng điều khiển quản trị Showroom Nội Thất & Thiết Bị Vệ Sinh Phương Đông. Theo dõi hiệu suất kinh doanh, yêu cầu báo giá và trạng thái hệ thống theo thời gian thực."
        actionHref="/admin/products?create=1"
        actionLabel="Thêm sản phẩm mới"
      />

      {/* KPI Cards */}
      <div className="motion-stagger grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group relative bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider group-hover:text-primary transition-colors">
                {stat.label}
              </span>
              <div className={`p-2 rounded-xl transition-colors ${stat.color}`}>
                <stat.Icon className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <strong className="text-2xl font-extrabold text-slate-800 tracking-tight group-hover:text-primary transition-colors">
                {stat.value}
              </strong>
              <p className="mt-1 text-[10px] font-medium text-slate-500 truncate">
                {stat.delta}
              </p>
            </div>
            <ArrowRight className="absolute bottom-3 right-3 size-3 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all duration-200" />
          </Link>
        ))}
      </div>

      {/* Insight & Quote Pipeline Section */}
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr] items-start">
        {/* Left: Chart & Funnel */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <h3 className="font-heading text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Activity className="size-4 text-primary" />
                <span>Biểu đồ hoạt động 7 ngày qua</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Thống kê số lượng khách hàng gửi yêu cầu tư vấn và báo giá theo từng ngày.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
              <TrendingUp className="size-3.5" />
              <span>Thời gian thực</span>
            </span>
          </div>

          <DashboardInsightChart quotes={quotes} role={role as "admin" | "editor"} />

          {/* Quote Pipeline Funnel */}
          {isAdmin && (
            <div className="border-t border-slate-100 pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="size-3.5 text-primary" />
                  <span>Tiến trình xử lý báo giá (Pipeline)</span>
                </h4>
                <Link
                  href="/admin/quotes"
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  Xem chi tiết ({quotes.length})
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Chờ tiếp nhận</p>
                  <p className="mt-1 text-lg font-black text-rose-900">{pendingCount}</p>
                  <p className="text-[9px] text-rose-700 font-medium">Cần gọi điện</p>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Đang tư vấn</p>
                  <p className="mt-1 text-lg font-black text-amber-900">{contactedCount}</p>
                  <p className="text-[9px] text-amber-700 font-medium">Đang trao đổi</p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Đã hoàn tất</p>
                  <p className="mt-1 text-lg font-black text-emerald-900">{completedCount}</p>
                  <p className="text-[9px] text-emerald-700 font-medium">Chốt hợp đồng</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tổng tiếp nhận</p>
                  <p className="mt-1 text-lg font-black text-slate-800">{stats.quoteCount}</p>
                  <p className="text-[9px] text-slate-500 font-medium">Toàn bộ khách</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Quick Actions & System Status */}
        <div className="space-y-6">
          <QuickActions />
          <SystemStatusPanel />
        </div>
      </div>

      {/* Middle Grid: Category Breakdown & Featured Showcase */}
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {/* Category Breakdown */}
        <CategoryBreakdown categories={categoryDistribution} />

        {/* Featured Products Showcase */}
        <FeaturedProductsShowcase products={featuredProducts} />
      </div>

      {/* Bottom Grid: Interactive Quote Table & Activity Feed */}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr] items-start">
        {/* Interactive Quote Table */}
        {isAdmin && <InteractiveQuoteTable quotes={quotes} />}

        {/* Live Activity Timeline */}
        <ActivityTimeline activities={recentActivities} />
      </div>
    </div>
  );
}

function CategoryBreakdown({ categories = [] }: { categories?: CategoryDistributionItem[] }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Tag className="size-4 text-primary" />
          <h3 className="font-heading text-sm font-bold text-slate-800 uppercase tracking-wider">
            Cơ cấu danh mục ngành hàng
          </h3>
        </div>
        <Link
          href="/admin/categories"
          className="text-xs font-semibold text-primary hover:underline"
        >
          Quản lý ({categories.length})
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400">Chưa có dữ liệu danh mục.</div>
      ) : (
        <div className="space-y-3.5">
          {categories.map((cat, idx) => {
            const colors = [
              "bg-amber-600",
              "bg-blue-600",
              "bg-emerald-600",
              "bg-purple-600",
              "bg-rose-600",
            ];
            const barColor = colors[idx % colors.length];
            return (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{cat.name}</span>
                  <span className="font-bold text-slate-500">
                    {cat.count} sản phẩm ({cat.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor} transition-all duration-500`}
                    style={{ width: `${Math.max(5, cat.percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FeaturedProductsShowcase({ products = [] }: { products?: DashboardFeaturedProduct[] }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-amber-600" />
          <h3 className="font-heading text-sm font-bold text-slate-800 uppercase tracking-wider">
            Sản phẩm nổi bật (Featured)
          </h3>
        </div>
        <Link
          href="/admin/products?featured=true"
          className="text-xs font-semibold text-primary hover:underline"
        >
          Xem tất cả ({products.length})
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400">
          Chưa có sản phẩm nào được đánh dấu nổi bật.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2.5 group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60 flex items-center justify-center">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="size-full object-cover" />
                  ) : (
                    <Package className="size-4 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate group-hover:text-primary transition-colors">
                    {p.name}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium truncate">
                    {p.category_name} {p.reference_code ? `• ${p.reference_code}` : ""}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 pl-3">
                <p className="text-xs font-extrabold text-amber-700">{p.price_text}</p>
                <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                  {p.status === "published" ? "Đã xuất bản" : "Nháp"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InteractiveQuoteTable({ quotes = [] }: { quotes?: AdminQuote[] }) {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPhone = (e: React.MouseEvent, id: string, phone: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    toast.success("Đã sao chép số điện thoại");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4 text-primary" />
          <h3 className="font-heading text-sm font-bold text-slate-800 uppercase tracking-wider">
            Yêu cầu báo giá mới nhất
          </h3>
        </div>
        <Link
          className="text-xs font-semibold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/15 px-3 py-1.5 rounded-lg transition"
          href="/admin/quotes"
        >
          Xem tất cả ({quotes.length})
        </Link>
      </div>

      {quotes.length === 0 ? (
        <div className="p-8 text-center">
          <MessageSquare className="size-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">Chưa có yêu cầu báo giá nào gần đây.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-x-auto">
          {quotes.slice(0, 6).map((quote) => (
            <Link
              key={quote.id}
              href={`/admin/quotes?id=${quote.id}`}
              className="group grid gap-3 items-center px-5 py-3.5 transition-colors hover:bg-slate-50/80 md:grid-cols-[1.2fr_1fr_110px_130px] cursor-pointer"
            >
              {/* Customer Info */}
              <div className="min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate group-hover:text-primary transition-colors">
                  {quote.full_name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-semibold">
                    <Phone className="size-3 text-slate-400" />
                    <span>{quote.phone}</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleCopyPhone(e, quote.id, quote.phone)}
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition"
                    title="Sao chép SĐT"
                  >
                    {copiedId === quote.id ? (
                      <Check className="size-3 text-emerald-600" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Service & Path */}
              <div className="min-w-0">
                <p className="text-xs text-slate-700 font-semibold truncate">
                  {quote.service || "Tư vấn báo giá sản phẩm"}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  Nguồn: {quote.source_path || "Website"}
                </p>
              </div>

              {/* Date */}
              <p className="text-xs text-slate-400 font-medium" suppressHydrationWarning>
                {new Date(quote.created_at).toLocaleDateString("vi-VN")}
              </p>

              {/* Status Badge & Open Arrow */}
              <div className="flex items-center justify-between md:justify-end gap-2">
                <StatusBadge status={quote.status} />
                <ArrowRight className="size-4 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ActivityTimeline({ activities = [] }: { activities?: DashboardActivityEvent[] }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <History className="size-4 text-primary" />
          <h3 className="font-heading text-sm font-bold text-slate-800 uppercase tracking-wider">
            Nhật ký hoạt động gần đây
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">Tự động</span>
      </div>

      {activities.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400">Chưa có sự kiện nào gần đây.</div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
          {activities.map((act) => {
            const iconMap = {
              product: { Icon: Package, color: "text-amber-600 bg-amber-50" },
              quote: { Icon: MessageSquare, color: "text-rose-600 bg-rose-50" },
              blog: { Icon: FileText, color: "text-emerald-600 bg-emerald-50" },
              user: { Icon: Users, color: "text-blue-600 bg-blue-50" },
              system: { Icon: Settings, color: "text-slate-600 bg-slate-50" },
            };
            const item = iconMap[act.type] || iconMap.system;

            return (
              <div key={act.id} className="relative space-y-0.5">
                <div
                  className={`absolute -left-6 top-0.5 flex size-5 items-center justify-center rounded-full border border-white shadow-2xs ${item.color}`}
                >
                  <item.Icon className="size-2.5" />
                </div>
                <p className="text-xs font-bold text-slate-800">{act.title}</p>
                <p className="text-[11px] text-slate-400 font-medium">{act.description}</p>
                <p className="text-[10px] text-slate-400 font-semibold" suppressHydrationWarning>
                  {new Date(act.created_at).toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </p>
              </div>
            );
          })}
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
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-4 text-emerald-600" />
        <h3 className="font-heading text-sm font-bold text-slate-800 uppercase tracking-wider">
          Trạng thái dịch vụ
        </h3>
      </div>
      <div className="grid gap-2.5">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg border ${item.color}`}>
                <item.Icon className="size-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {item.label}
                </p>
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
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
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

