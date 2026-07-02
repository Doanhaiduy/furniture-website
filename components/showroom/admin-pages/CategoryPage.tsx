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

export function CategoryPage({ createMode, categories = [], total = 0 }: { createMode?: boolean; categories?: AdminCategory[]; total?: number }) {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");
  const { toast } = useToast();
  const router = useRouter();
  const [excelModalOpen, setExcelModalOpen] = useState(false);

  const [categoryToDelete, setCategoryToDelete] = useState<AdminCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const STATUS_OPTIONS = [
    { value: "draft", label: "Bản nháp" },
    { value: "published", label: "Đã xuất bản" },
    { value: "archived", label: "Lưu trữ" },
  ];
  const GROUP_OPTIONS = [
    { value: "wooden_furniture", label: "Đồ gỗ nội thất" },
    { value: "sanitary_equipment", label: "Thiết bị vệ sinh" },
    { value: "tiles", label: "Gạch ốp lát" },
    { value: "project_solutions", label: "Thiết bị khác" },
  ];

  const filterConfigs: FilterConfig[] = [
    { type: "select", key: "status", label: "Trạng thái", options: STATUS_OPTIONS, placeholder: "Tất cả" },
    { type: "select", key: "groupKey", label: "Nhóm hàng", options: GROUP_OPTIONS, placeholder: "Tất cả nhóm" },
    {
      type: "select",
      key: "level",
      label: "Cấp danh mục",
      options: [
        { value: "parent", label: "Nhóm danh mục" },
        { value: "child", label: "Danh mục" }
      ],
      placeholder: "Tất cả các cấp"
    },
    { type: "date", key: "dateFrom", label: "Từ ngày" },
    { type: "date", key: "dateTo", label: "Đến ngày" },
  ];

  const organizeCategoriesHierarchically = (cats: AdminCategory[]) => {
    const parents = cats.filter(c => c.parent_id === null);
    const children = cats.filter(c => c.parent_id !== null);
    const groupOrder = ["wooden_furniture", "sanitary_equipment", "tiles", "project_solutions", "other", "furniture", "sanitary"];

    parents.sort((a, b) => {
      const aGrp = a.group_key || "";
      const bGrp = b.group_key || "";
      const gDiff = groupOrder.indexOf(aGrp) - groupOrder.indexOf(bGrp);
      if (gDiff !== 0) return gDiff;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });

    const result: AdminCategory[] = [];
    parents.forEach(parent => {
      result.push(parent);
      const parentChildren = children.filter(c => c.parent_id === parent.id);
      parentChildren.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      result.push(...parentChildren);
    });

    const addedIds = new Set(result.map(c => c.id));
    const orphans = cats.filter(c => !addedIds.has(c.id));
    result.push(...orphans);

    return result;
  };

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const isExpanded = (id: string) => expandedGroups[id] === true;

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [id]: !isExpanded(id)
    }));
  };

  const parentIds = categories.filter(c => c.parent_id === null).map(c => c.id);
  const allExpanded = parentIds.length > 0 && parentIds.every(id => expandedGroups[id] === true);

  const toggleAllGroups = () => {
    if (allExpanded) {
      setExpandedGroups({});
    } else {
      const nextState: Record<string, boolean> = {};
      parentIds.forEach(id => {
        nextState[id] = true;
      });
      setExpandedGroups(nextState);
    }
  };

  const sort = searchParams.get("sort") || "sort_order";
  const isDefaultSort = sort === "sort_order";
  const hasSearch = Boolean(searchParams.get("q"));

  const sortedCategories = isDefaultSort ? organizeCategoriesHierarchically(categories) : categories;

  const visibleCategories = (isDefaultSort && !hasSearch)
    ? sortedCategories.filter(cat => {
        if (cat.parent_id !== null) {
          return isExpanded(cat.parent_id);
        }
        return true;
      })
    : sortedCategories;

  const hasChildren = categoryToDelete ? categories.some(c => c.parent_id === categoryToDelete.id) : false;
  const canDeleteCategory = categoryToDelete?.product_count === 0 && !hasChildren;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Quản trị danh mục"
        description="Hai nhóm sản phẩm chính được giữ cố định theo nghiệp vụ. Biên tập viên quản lý danh mục, tên song ngữ, đường dẫn, thứ tự và SEO."
        actionHref="/admin/categories?create=1"
        actionLabel="Thêm danh mục"
      />

      {/* Excel & View Actions Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-slate-550 flex items-center gap-1.5 font-mono uppercase tracking-wider select-none">
            <FileSpreadsheet className="size-4 text-indigo-500" />
            Excel:
          </span>
          <button
            type="button"
            onClick={() => setExcelModalOpen(true)}
            className="button-pd-outline py-1 px-3 text-xs flex items-center gap-1.5 hover:bg-indigo-50 hover:text-indigo-750 hover:border-indigo-200 transition cursor-pointer"
          >
            <Upload className="size-3.5" />
            Nhập & Xuất Excel
          </button>
        </div>

        {isDefaultSort && !hasSearch && parentIds.length > 0 && (
          <button
            type="button"
            onClick={toggleAllGroups}
            className="button-pd-outline py-2 px-4 text-xs flex items-center gap-1.5 hover:bg-slate-100 transition cursor-pointer shadow-sm rounded-2xl font-semibold text-slate-750 border-slate-200 bg-white"
          >
            {allExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
            {allExpanded ? "Thu gọn tất cả nhóm" : "Mở rộng tất cả nhóm"}
          </button>
        )}
      </div>

      <DataView
        data={visibleCategories}
        totalCount={total}
        filterConfigs={filterConfigs}
        searchPlaceholder="Tên danh mục, slug..."
        defaultSort="sort_order"
        defaultDir="asc"
        defaultLimit={20}
        columns={[
          { key: "name", label: "Danh mục", width: "1fr", sortable: true },
          { key: "group_key", label: "Nhóm hàng", width: "150px", sortable: true },
          { key: "product_count", label: "Sản phẩm", width: "130px", sortable: true },
          { key: "status", label: "Trạng thái", width: "120px", sortable: true },
          { key: "actions", label: "Thao tác", width: "100px", sortable: false },
        ]}
        renderListRow={(item) => {
          const category = item as AdminCategory & { group_key?: string | null; parent_name?: string | null };
          const groupLabel = category.group_key === "wooden_furniture" ? "Đồ gỗ" : category.group_key === "sanitary_equipment" ? "Thiết bị vệ sinh" : category.group_key === "tiles" ? "Gạch ốp lát" : category.group_key === "project_solutions" ? "Thiết bị khác" : "Khác";
          const isChild = category.parent_id !== null;
          const isGrp = category.parent_id === null;
          const isGrpExpanded = isExpanded(category.id);
          const hasSubCategories = categories.some(c => c.parent_id === category.id);

          return (
            <div
              key={category.id}
              className={cn(
                "grid items-center gap-4 px-4 py-3 transition-colors",
                isGrp 
                  ? "bg-slate-50/70 border-l-4 border-indigo-500/70 hover:bg-slate-100/60 font-semibold" 
                  : "bg-white border-l-4 border-transparent hover:bg-slate-50/40"
              )}
              style={{ gridTemplateColumns: "1fr 150px 130px 120px 100px" }}
            >
              <div className="min-w-0 flex items-center">
                {isChild && (
                  <span className="text-slate-300 font-mono mr-2 select-none pl-4">└─</span>
                )}
                {isGrp && isDefaultSort && !hasSearch && hasSubCategories ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(category.id)}
                    className="mr-2 p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  >
                    {isGrpExpanded ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                  </button>
                ) : isGrp && (
                  <span className="w-8" />
                )}
                <div 
                  className={cn("min-w-0", isGrp && isDefaultSort && !hasSearch && hasSubCategories && "cursor-pointer select-none")}
                  onClick={() => isGrp && isDefaultSort && !hasSearch && hasSubCategories && toggleGroup(category.id)}
                >
                  <p className={cn("text-sm truncate flex items-center gap-2", isGrp ? "text-slate-900 font-bold" : "text-slate-700 font-medium")}>
                    {category.name}
                    {category.parent_id === null ? (
                      <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] font-bold px-1.5 py-0.5 rounded-full">Nhóm danh mục</span>
                    ) : (
                      <span className="bg-slate-50 text-slate-500 border border-slate-200 text-[9px] font-bold px-1.5 py-0.5 rounded-full">Danh mục</span>
                    )}
                  </p>
                  <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-500">{category.slug}</code>
                </div>
              </div>
              <span className="text-sm text-slate-600 font-semibold">{groupLabel}</span>
              <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 w-fit">
                {category.product_count} sản phẩm
              </span>
              <StatusBadge status={category.status} />
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/admin/categories?edit=${category.slug || category.id}`}
                  title="Chỉnh sửa"
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
                >
                  <Pencil className="size-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setCategoryToDelete(category)}
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
          const category = item as AdminCategory;
          return (
            <div key={category.id} className="card-pd interactive-card p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <p className="label-pd">#{category.sort_order ?? "—"}</p>
                  <StatusBadge status={category.status} />
                </div>
                <div className="space-y-2.5 mt-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 mr-1.5">Tên:</span>
                    <span className="font-heading font-semibold text-primary">{category.name}</span>
                    <p className="mt-1 text-xs text-secondary leading-relaxed">{category.description ?? "—"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 mr-1.5">Đường dẫn:</span>
                    <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-600">{category.slug}</code>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <Link href={`/admin/categories?edit=${category.slug || category.id}`} className="admin-edit-action inline-flex items-center gap-1">
                  <Pencil className="size-3" />Chỉnh sửa
                </Link>
              </div>
            </div>
          );
        }}
        emptyMessage="Chưa có danh mục nào."
        emptyIcon={<Tag className="size-10 text-slate-200" />}
      />

      {/* Create Dialog */}
      <AdminRouteDialog
        open={Boolean(createMode)}
        returnHref="/admin/categories"
        title="Thêm danh mục"
        description="Tạo danh mục con song ngữ trong một nhóm sản phẩm đã được phê duyệt."
        size="full"
      >
        <EntityCreateForm kind="category" />
      </AdminRouteDialog>

      {/* Edit Dialog */}
      <AdminRouteDialog
        open={Boolean(editSlug)}
        returnHref="/admin/categories"
        title="Hiệu chỉnh danh mục"
        description="Chỉnh sửa thông tin chi tiết danh mục, cấu hình song ngữ, mô tả và SEO."
        size="full"
      >
        <EntityCreateForm kind="category" idOrSlug={editSlug || undefined} />
      </AdminRouteDialog>

      <AlertDialog open={categoryToDelete !== null} onOpenChange={(open) => { if (!open) setCategoryToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa danh mục</AlertDialogTitle>
            <AlertDialogDescription>
              {hasChildren ? (
                <span>
                  Nhóm danh mục <strong>{categoryToDelete?.name}</strong> vẫn còn các danh mục bên trong. Bạn cần xóa hoặc chuyển các danh mục con sang nhóm khác trước khi xóa nhóm danh mục này.
                </span>
              ) : !canDeleteCategory ? (
                <span>
                  Danh mục <strong>{categoryToDelete?.name}</strong> đang chứa <strong>{categoryToDelete?.product_count}</strong> sản phẩm. Bạn cần chuyển hoặc xóa các sản phẩm trước khi xóa danh mục.
                </span>
              ) : (
                <span>
                  Bạn có chắc muốn xóa danh mục <strong>{categoryToDelete?.name}</strong>? Hành động này không thể hoàn tác.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{!canDeleteCategory ? "Đóng" : "Hủy"}</AlertDialogCancel>
            {canDeleteCategory && (
              <AlertDialogAction onClick={async () => {
                if (!categoryToDelete) return;
                setIsDeleting(true);
                try {
                  const res = await deleteAdminCategory(categoryToDelete.id);
                  if (res.success) {
                    toast.success("Xóa danh mục thành công!");
                    router.refresh();
                  } else {
                    toast.error("Xóa thất bại: " + (res.error ?? "Không xác định"));
                  }
                } catch (err) {
                  toast.error("Đã xảy ra lỗi khi xóa: " + String(err));
                } finally {
                  setIsDeleting(false);
                  setCategoryToDelete(null);
                }
              }} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ExcelImportExportModal
        isOpen={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        type="category"
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
