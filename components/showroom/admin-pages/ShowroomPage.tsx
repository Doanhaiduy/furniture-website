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

export function ShowroomPage({ createMode, showrooms = [], total = 0 }: { createMode?: boolean; showrooms?: AdminShowroom[]; total?: number }) {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");
  const { toast, showLoading, hideLoading, showAlert } = useToast();
  const router = useRouter();
  const [excelModalOpen, setExcelModalOpen] = useState(false);

  const [showroomToDelete, setShowroomToDelete] = useState<AdminShowroom | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const STATUS_OPTIONS = [
    { value: "draft", label: "Bản nháp" },
    { value: "published", label: "Đã xuất bản" },
    { value: "archived", label: "Lưu trữ" },
  ];

  const filterConfigs: FilterConfig[] = [
    { type: "select", key: "status", label: "Trạng thái", options: STATUS_OPTIONS, placeholder: "Tất cả" },
    { type: "date", key: "dateFrom", label: "Từ ngày" },
    { type: "date", key: "dateTo", label: "Đến ngày" },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý showroom"
        description="Quản lý tên và địa chỉ song ngữ của showroom, hotline, giờ mở cửa, nhúng bản đồ, đường dẫn dự phòng, tệp và trạng thái xuất bản."
        actionHref="/admin/showrooms?create=1"
        actionLabel="Thêm showroom"
      />

      {/* Excel Actions Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setExcelModalOpen(true)}
          className="button-pd-outline flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-semibold transition hover:bg-indigo-50 hover:text-indigo-750"
        >
          <FileSpreadsheet className="size-3.5 text-indigo-500" />
          Nhập & Xuất Excel
        </button>
      </div>

      <DataView
        data={showrooms}
        totalCount={total || showrooms.length}
        filterConfigs={filterConfigs}
        searchPlaceholder="Tên, địa chỉ showroom..."
        defaultSort="sort_order"
        defaultDir="asc"
        defaultLimit={20}
        columns={[
          { key: "image", label: "Hình ảnh", width: "80px", sortable: false },
          { key: "name", label: "Showroom", width: "1.5fr", sortable: false },
          { key: "hotline", label: "Hotline", width: "140px", sortable: false },
          { key: "status", label: "Trạng thái", width: "120px", sortable: true },
          { key: "sort_order", label: "Thứ tự", width: "90px", sortable: true },
          { key: "actions", label: "Thao tác", width: "100px", sortable: false },
        ]}
        renderListRow={(item) => {
          const showroom = item as AdminShowroom;
          return (
            <div key={showroom.id} className="grid items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-50" style={{ gridTemplateColumns: "80px 1.5fr 140px 120px 90px 100px" }}>
              {showroom.primary_media ? (
                <RemoteImage src={showroom.primary_media as string} alt={showroom.name} className="size-10 rounded-lg bg-slate-100 shrink-0 relative" />
              ) : (
                <div className="size-10 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center"><MapPin className="size-4 text-slate-300" /></div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{showroom.name}</p>
                <p className="text-xs text-slate-400 truncate">{showroom.address}</p>
              </div>
              <span className="text-xs text-slate-600 font-mono">{showroom.hotline}</span>
              <StatusBadge status={showroom.status} />
              <span className="text-xs text-slate-500 font-mono">#{showroom.sort_order ?? 0}</span>
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/admin/showrooms?edit=${showroom.code ?? showroom.id}`}
                  title="Chỉnh sửa"
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
                >
                  <Pencil className="size-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setShowroomToDelete(showroom)}
                  title="Xóa"
                  className="p-1.5 hover:bg-slate-100 rounded text-destructive hover:bg-red-50 transition"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          );
        }}
        renderGridCard={(item) => {
          const showroom = item as AdminShowroom;
          return (
            <article key={showroom.id} className="card-pd interactive-card group overflow-hidden flex flex-col justify-between">
              {showroom.primary_media ? (
                <RemoteImage src={showroom.primary_media as string} alt={showroom.name} className="h-44 w-full rounded bg-slate-100 relative" />
              ) : (
                <div className="h-44 w-full rounded bg-slate-100 flex items-center justify-center"><MapPin className="size-10 text-slate-200" /></div>
              )}
              <div className="p-4 space-y-3.5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 mr-1.5">Tên:</span>
                  <span className="font-heading font-semibold text-primary">{showroom.name}</span>
                  <p className="text-xs text-secondary pl-5 mt-0.5">{showroom.address}</p>
                </div>
                <div className="text-xs space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p><span className="font-bold text-slate-500">Hotline:</span> {showroom.hotline}</p>
                  <p><span className="font-bold text-slate-500">Giờ mở cửa:</span> {showroom.opening_hours ?? "—"}</p>
                </div>
                <StatusBadge status={showroom.status} />
              </div>
              <div className="px-4 pb-4 flex justify-end">
                <Link href={`/admin/showrooms?edit=${showroom.code ?? showroom.id}`} className="admin-edit-action">
                  <Pencil className="size-3" />Chỉnh sửa
                </Link>
              </div>
            </article>
          );
        }}
        emptyMessage="Chưa có showroom nào."
        emptyIcon={<MapPin className="size-10 text-slate-200" />}
      />

      <AdminRouteDialog
        open={Boolean(createMode)}
        returnHref="/admin/showrooms"
        title="Thêm showroom"
        description="Tạo hồ sơ showroom với địa chỉ song ngữ, hotline và đường dẫn Google Maps."
        size="full"
      >
        <EntityCreateForm kind="showroom" />
      </AdminRouteDialog>

      <AdminRouteDialog
        open={Boolean(editSlug)}
        returnHref="/admin/showrooms"
        title="Hiệu chỉnh showroom"
        description="Chỉnh sửa thông tin địa chỉ song ngữ, hotline, bản đồ và giờ mở cửa."
        size="full"
      >
        <EntityCreateForm kind="showroom" idOrSlug={editSlug || undefined} />
      </AdminRouteDialog>

      <AlertDialog open={showroomToDelete !== null} onOpenChange={(open) => { if (!open) setShowroomToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa showroom</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa showroom <strong>{showroomToDelete?.name}</strong>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (!showroomToDelete) return;
              showLoading("Đang xóa showroom...");
              try {
                const res = await deleteAdminShowroom(showroomToDelete.id);
                hideLoading();
                if (res.success) {
                  showAlert("Thành công", `Đã xóa showroom "${showroomToDelete.name}" thành công!`, "success", () => {
                    router.refresh();
                  });
                } else {
                  showAlert("Thất bại", "Xóa thất bại: " + (res.error ?? "Không xác định"), "error");
                }
              } catch (err) {
                hideLoading();
                showAlert("Lỗi hệ thống", "Đã xảy ra lỗi khi xóa: " + String(err), "error");
              } finally {
                setShowroomToDelete(null);
              }
            }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ExcelImportExportModal
        isOpen={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        type="showroom"
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
