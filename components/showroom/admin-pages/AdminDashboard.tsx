"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ExcelImportExportModal } from "../admin-excel";
import { useToast } from "@/components/providers/toast-provider";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  FileWarning,
  Lock,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Sparkles,
  User,
  Mail,
  Activity,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Package,
  Tag,
  Globe,
  NewspaperIcon,
  MapPin,
  Star,
  Eye,
  Trash2,
  ExternalLink,
  Check,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import {
  type PublishStatus,
} from "@/lib/showroom-data";
import { imageAssets } from "@/tests/fixtures/showroom-data-fixture";
import {
  type AdminQuote,
  type AdminProduct,
  type AdminCategory,
  type AdminBlogPost,
  type AdminShowroom,
  type AdminPromotion,
  type AdminUser,
  deleteAdminPromotion,
  getBrandProductCount,
  updatePromotionStatus,
} from "@/lib/supabase/admin-queries";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  deleteAdminProduct,
  deleteAdminCategory,
  deleteAdminBlogPost,
  deleteAdminShowroom,
  updateProductFeatured,
  updateProductStatus,
  updateBlogPostFeatured,
  updateBlogPostStatus,
  updateQuoteAssignee,
  updateQuoteSalesNotes,
  updateQuoteAdminNotes,
} from "@/lib/supabase/mutations";
import { deleteAdminBrand } from "@/lib/supabase/brands-mutations";
import {
  PublishWorkflow,
  StatusPill,
} from "../admin-interactions";
import {
  AdminRouteDialog,
  ContentEditorForm,
  EntityCreateForm,
  SettingsOperationsPanel,
} from "../admin-workflows";
import { RemoteImage } from "../remote-image";
import { PremiumSelect } from "../premium-select";
import { DashboardInsightChart } from "../admin-dashboard-widgets";
import { QuoteTimeline } from "../../admin/QuoteTimeline";
import { DataTable } from "@/components/admin/DataTable";
import { DataView, PaginationBar } from "@/components/admin/DataView";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { FilterBar, type FilterConfig } from "@/components/admin/FilterBar";
import { useAdminFilters } from "@/lib/hooks/useAdminFilters";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export interface Brand {
  id: string;
  name: { vi: string; en: string };
  origin?: string;
  logo_url?: string;
  status: "draft" | "published" | "archived";
  sort_order: number;
  slug?: string;
}

import { useSearchParams, useRouter } from "next/navigation";
import {
  Pagination,
  AdminPageHeader,
  getRelativeTimeString
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
    { label: "Sản phẩm", value: stats.productCount, delta: "Tổng danh mục", visible: true },
    { label: "Danh mục", value: stats.categoryCount, delta: "Nhóm sản phẩm", visible: true },
    { label: "Bài viết", value: stats.blogCount, delta: "Đã xuất bản", visible: true },
    { label: "Showroom", value: stats.showroomCount, delta: "Đang hoạt động", visible: true },
    { label: "Yêu cầu báo giá", value: stats.quoteCount, delta: "Chờ xử lý", visible: isAdmin },
    { label: "Người dùng", value: stats.userCount, delta: "Tài khoản", visible: isAdmin },
  ].filter((item) => item.visible);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Tổng quan vận hành"
        description="Theo dõi mức độ sẵn sàng nội dung song ngữ, yêu cầu báo giá, quản trị tệp, bản nháp AI và cấu hình hệ thống trước khi kết nối Payload."
        actionHref="/admin/products?create=1"
        actionLabel="Thêm sản phẩm"
      />

      <div className="motion-stagger grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
        {kpis.map((stat) => (
          <div key={stat.label} className="admin-kpi-card interactive-card p-3.5">
            <div className="flex items-center justify-between gap-3">
              <p className="label-pd">{stat.label}</p>
              <MoreHorizontal className="size-4 text-outline" />
            </div>
            <div className="mt-4 flex items-end justify-between">
              <strong className="font-heading text-2xl text-primary">{stat.value}</strong>
              <span className="status-pill text-xs">{stat.delta}</span>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--admin-bg-muted)]">
              <div className="h-full w-2/3 rounded-[var(--radius-pill)] bg-[var(--admin-accent)]" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 2xl:grid-cols-[1.35fr_0.85fr]">
        <DashboardInsightChart quotes={quotes} role={role as "admin" | "editor"} />
        <div className="space-y-5">
          <WarningPanel />
          <QuickActions />
        </div>
      </div>
      {isAdmin && <QuoteTable compact quotes={quotes} />}
    </div>
  );
}


function DashboardInsight() {
  return (
    <section className="admin-panel p-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <p className="label-pd inline-flex items-center gap-2">
            <BarChart3 className="size-4" />
            Hiệu quả nội dung
          </p>
          <h2 className="mt-3 font-heading text-xl font-semibold leading-snug text-primary md:text-2xl">
            Nhu cầu báo giá tuần này tập trung ở các sản phẩm nổi bật
          </h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-secondary">
            Dùng khu vực này để rà soát mức độ sẵn sàng xuất bản, thiếu sót bản dịch và chất lượng SEO trước khi kết nối phân tích Payload.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="chip-pd text-primary">+14%</span>
          <span className="chip-pd text-secondary">7 ngày</span>
        </div>
      </div>
      <DashboardInsightChart />
    </section>
  );
}

function QuoteTable({ compact, quotes = [] }: { compact?: boolean; quotes?: AdminQuote[] }) {
  return (
    <div className="surface-soft overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <h2 className="admin-section-title-pd">Yêu cầu báo giá mới nhất</h2>
        {compact ? <Link className="font-bold text-primary" href="/admin/quotes">Xem tất cả</Link> : null}
      </div>
      {quotes.length === 0 ? (
        <p className="p-8 text-center text-sm text-slate-400">Chưa có yêu cầu báo giá nào.</p>
      ) : (
        quotes.map((quote) => (
          <div key={quote.id} className="grid gap-3 border-t border-outline-variant/25 px-4 py-3.5 transition-colors hover:bg-surface-container-lowest/70 md:grid-cols-[1fr_1fr_120px_120px]">
            <div>
              <p className="font-semibold">{quote.full_name}</p>
              <p className="text-sm text-secondary">{quote.phone}</p>
            </div>
            <p>{quote.service ?? quote.source_path}</p>
            <p className="text-sm text-secondary" suppressHydrationWarning>{new Date(quote.created_at).toLocaleDateString("vi-VN")}</p>
            <StatusBadge status={quote.status} />
          </div>
        ))
      )}
    </div>
  );
}

function WarningPanel() {
  const warnings = [
    "Kiểm tra lại nội dung thiếu metadata hoặc bản dịch ở các mục chưa sẵn sàng.",
    "Rà soát các yêu cầu báo giá mới để tránh tồn đọng quá lâu.",
    "Xác nhận dữ liệu showroom và blog đã đồng bộ đúng từ Supabase.",
  ];

  return (
    <div className="status-warning rounded-[var(--radius-panel)] border p-4 shadow-[0_10px_26px_rgba(120,83,15,0.05)]">
      <div className="flex items-center gap-2">
        <FileWarning className="size-5" />
        <h2 className="font-heading text-base font-semibold">Trạng thái CMS cần xử lý</h2>
      </div>
      <ul className="mt-4 space-y-3 text-sm">
        {warnings.map((warning) => (
          <li key={warning} className="flex gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            {warning}
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuickActions() {
  const actions = [
    ["Quản lý danh mục", "/admin/categories"],
    ["Rà soát bài viết song ngữ", "/admin/blog"],
    ["Cập nhật báo giá", "/admin/quotes"],
    ["Cấu hình SEO mặc định", "/admin/settings"],
  ] as const;

  return (
    <div className="rounded-2xl border border-[#202448] bg-[linear-gradient(145deg,#0f122c,#15183a)] p-4 text-white shadow-[0_16px_40px_rgba(9,10,35,0.16)]">
      <h2 className="font-heading text-lg font-semibold">Thao tác nhanh</h2>
      <div className="mt-4 grid gap-2.5">
        {actions.map(([label, href]) => (
          <Link key={label} href={href} className="flex min-h-10 items-center justify-between rounded-xl bg-white/10 px-3 py-2.5 text-sm font-bold transition hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30">
            {label}
            <ArrowRight className="size-4" />
          </Link>
        ))}
      </div>
    </div>
  );
}
