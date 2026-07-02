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

export function MediaPage({ uploadMode }: { uploadMode?: boolean }) {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Thư viện tệp"
        description="Quản trị tệp trên Cloudinary: ngữ cảnh sở hữu, loại tệp, dung lượng, kích thước, chú thích và văn bản thay thế song ngữ."
        actionHref="/admin/media?upload=1"
        actionLabel="Tải tệp lên"
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="surface-soft p-4">
          <h2 className="admin-section-title-pd">Hàng đợi kiểm tra tệp</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {["Thư viện ảnh sản phẩm", "Ảnh bìa bài viết", "Ảnh showroom"].map((item, index) => (
              <div key={item} className="rounded-[var(--radius-card)] border border-[var(--admin-border)] bg-white p-3">
                <RemoteImage src={[imageAssets.sofa, imageAssets.blog1, imageAssets.showroom][index]} alt={item} className="h-28 w-full rounded-[var(--radius-control)] object-cover" sizes="220px" />
                <p className="mt-3 font-semibold text-[var(--admin-text)]">{item}</p>
                <p className="mt-1 text-xs text-[var(--admin-text-muted)]">Cần kiểm tra alt_vi, alt_en và ngữ cảnh sở hữu.</p>
              </div>
            ))}
          </div>
        </section>
        <div className="state-card rounded-xl border border-error/25 bg-error-container p-4 text-on-error-container shadow-[0_18px_44px_rgba(147,0,10,0.08)]">
          <AlertTriangle className="size-6" />
          <h3 className="mt-3 font-heading text-lg font-semibold">Quy tắc tải tệp</h3>
          <p className="mt-2 text-sm leading-6">
            Không nhận tài liệu cho các trường media công khai. Giai đoạn nền tảng chỉ chấp nhận hình ảnh và video đúng phạm vi trường.
          </p>
        </div>
      </div>
      <AdminRouteDialog
        open={Boolean(uploadMode)}
        returnHref="/admin/media"
        title="Tải tệp lên"
        description="Chọn tệp và chuẩn bị siêu dữ liệu kiểm tra trước khi kết nối quy trình tải lên Cloudinary."
        size="standard"
      >
        <EntityCreateForm kind="media" />
      </AdminRouteDialog>
    </div>
  );
}
