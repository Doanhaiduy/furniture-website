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
  const [search, setSearch] = useState("");

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

      <CategoryTree
        categories={categories}
        search={search}
        setSearch={setSearch}
        expandedGroups={expandedGroups}
        setExpandedGroups={setExpandedGroups}
        onExcel={() => setExcelModalOpen(true)}
        onDelete={setCategoryToDelete}
        groupOptions={GROUP_OPTIONS}
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

const fmtCatDate = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso));
  } catch {
    return "—";
  }
};

function CategoryThumb({ url, size = "size-9", grp }: { url?: string | null; size?: string; grp?: boolean }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className={cn(size, "shrink-0 rounded-lg border border-slate-200 object-cover")} />;
  }
  return (
    <span className={cn(size, "grid shrink-0 place-items-center rounded-lg border", grp ? "border-indigo-100 bg-indigo-50 text-indigo-400" : "border-slate-200 bg-slate-100 text-slate-300")}>
      {grp ? <Package className="size-4" /> : <Tag className="size-4" />}
    </span>
  );
}

function CategoryTree({
  categories,
  search,
  setSearch,
  expandedGroups,
  setExpandedGroups,
  onExcel,
  onDelete,
  groupOptions,
}: {
  categories: AdminCategory[];
  search: string;
  setSearch: (v: string) => void;
  expandedGroups: Record<string, boolean>;
  setExpandedGroups: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
  onExcel: () => void;
  onDelete: (c: AdminCategory) => void;
  groupOptions: { value: string; label: string }[];
}) {
  const groupLabelMap: Record<string, string> = Object.fromEntries(groupOptions.map((g) => [g.value, g.label]));
  const groupOrder = ["wooden_furniture", "sanitary_equipment", "tiles", "project_solutions", "other", "furniture", "sanitary"];
  const q = search.trim().toLowerCase();
  const matches = (c: AdminCategory) => !q || c.name.toLowerCase().includes(q) || (c.slug || "").toLowerCase().includes(q);

  const parents = categories
    .filter((c) => c.parent_id === null)
    .sort((a, b) => {
      const g = groupOrder.indexOf(a.group_key || "") - groupOrder.indexOf(b.group_key || "");
      if (g !== 0) return g;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });
  const childrenOf = (pid: string) => categories.filter((c) => c.parent_id === pid).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const toggle = (id: string) => setExpandedGroups((prev) => ({ ...prev, [id]: !(prev[id] === true) }));
  const allExpanded = parents.length > 0 && parents.every((p) => expandedGroups[p.id] === true);
  const toggleAll = () => setExpandedGroups(() => (allExpanded ? {} : Object.fromEntries(parents.map((p) => [p.id, true]))));

  const visibleParents = parents
    .map((p) => {
      const kids = childrenOf(p.id);
      const visibleKids = q ? kids.filter(matches) : kids;
      return { p, kids, visibleKids, groupMatches: matches(p) || visibleKids.length > 0 };
    })
    .filter((g) => !q || g.groupMatches);

  const parentIdSet = new Set(parents.map((p) => p.id));
  const orphans = categories.filter((c) => c.parent_id !== null && !parentIdSet.has(c.parent_id)).filter(matches);

  const ChildRow = ({ c }: { c: AdminCategory }) => (
    <div className="flex items-center gap-3 border-t border-slate-100 px-4 py-2.5 pl-10 transition-colors hover:bg-slate-50/70">
      <CategoryThumb url={c.image_url} size="size-8" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-slate-700">{c.name}</p>
          <code className="hidden rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 sm:inline">{c.slug}</code>
        </div>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400">
          <span>Cập nhật {fmtCatDate(c.updated_at)}</span>
          <span className="hidden sm:inline">Tạo {fmtCatDate(c.created_at)}</span>
        </p>
      </div>
      <span className="hidden shrink-0 items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 sm:inline-flex">
        {c.product_count} SP
      </span>
      <StatusBadge status={c.status} />
      <div className="flex shrink-0 items-center gap-1">
        <Link href={`/admin/categories?edit=${c.slug || c.id}`} title="Chỉnh sửa" className="rounded p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
          <Pencil className="size-4" />
        </Link>
        <button type="button" onClick={() => onDelete(c)} title="Xóa" className="rounded p-1.5 text-destructive transition hover:bg-red-50">
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc slug…"
            className="input-pd h-10 w-full bg-white pl-9 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={onExcel}
          className="button-pd-outline flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-semibold transition hover:bg-indigo-50 hover:text-indigo-750"
        >
          <FileSpreadsheet className="size-3.5 text-indigo-500" />
          Nhập & Xuất Excel
        </button>
        {parents.length > 0 && (
          <button
            type="button"
            onClick={toggleAll}
            className="button-pd-outline flex items-center gap-1.5 rounded-2xl bg-white px-4 py-2 text-xs font-semibold text-slate-750 transition hover:bg-slate-100"
          >
            {allExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
            {allExpanded ? "Thu gọn tất cả" : "Mở rộng tất cả"}
          </button>
        )}
      </div>

      {/* Tree */}
      {visibleParents.length === 0 && orphans.length === 0 ? (
        <div className="grid min-h-60 place-items-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <div>
            <Tag className="mx-auto size-10 text-slate-200" />
            <p className="mt-3 text-sm text-slate-400">{q ? "Không tìm thấy danh mục phù hợp." : "Chưa có danh mục nào."}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleParents.map(({ p, kids, visibleKids }) => {
            const open = expandedGroups[p.id] === true || Boolean(q);
            const totalProducts = p.product_count + kids.reduce((s, c) => s + c.product_count, 0);
            return (
              <div key={p.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                {/* Group header */}
                <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-50/60 to-white p-3.5">
                  <button
                    type="button"
                    onClick={() => toggle(p.id)}
                    aria-expanded={open}
                    className="grid size-7 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-indigo-100/60 hover:text-indigo-700"
                    title={open ? "Thu gọn" : "Mở rộng"}
                  >
                    <ChevronRight className={cn("size-4 transition-transform duration-300", open && "rotate-90")} />
                  </button>
                  <CategoryThumb url={p.image_url} grp />
                  <button type="button" onClick={() => toggle(p.id)} className="min-w-0 flex-1 cursor-pointer select-none text-left">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-slate-900">{p.name}</p>
                      <span className="shrink-0 rounded-full border border-indigo-100 bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700">Nhóm danh mục</span>
                      <code className="hidden shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 md:inline">{p.slug}</code>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-600">{groupLabelMap[p.group_key || ""] || "Khác"}</span>
                      <span className="inline-flex items-center gap-1"><Package className="size-3" />{kids.length} danh mục con</span>
                      <span>{totalProducts} sản phẩm</span>
                      <span className="hidden lg:inline">Cập nhật {fmtCatDate(p.updated_at)}</span>
                    </p>
                  </button>
                  <StatusBadge status={p.status} />
                  <div className="flex shrink-0 items-center gap-1">
                    <Link href={`/admin/categories?edit=${p.slug || p.id}`} title="Chỉnh sửa" className="rounded p-1.5 text-slate-500 transition hover:bg-white hover:text-slate-800">
                      <Pencil className="size-4" />
                    </Link>
                    <button type="button" onClick={() => onDelete(p)} title="Xóa" className="rounded p-1.5 text-destructive transition hover:bg-red-50">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                {/* Children (animated expand/collapse) */}
                <div className={cn("grid transition-all duration-300 ease-in-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <div className="overflow-hidden">
                    {visibleKids.length === 0 ? (
                      <p className="border-t border-slate-100 px-4 py-3 pl-10 text-xs italic text-slate-400">Chưa có danh mục con trong nhóm này.</p>
                    ) : (
                      visibleKids.map((c) => <ChildRow key={c.id} c={c} />)
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {orphans.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
              <div className="bg-amber-50/60 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-amber-700">Danh mục chưa gán nhóm</div>
              {orphans.map((c) => <ChildRow key={c.id} c={c} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
