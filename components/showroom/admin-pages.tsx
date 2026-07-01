"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ExcelImportExportModal } from "./admin-excel";
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
} from "./admin-interactions";
import {
  AdminRouteDialog,
  ContentEditorForm,
  EntityCreateForm,
  SettingsOperationsPanel,
} from "./admin-workflows";
import { RemoteImage } from "./remote-image";
import { PremiumSelect } from "./premium-select";
import { DashboardInsightChart } from "./admin-dashboard-widgets";
import { QuoteTimeline } from "../admin/QuoteTimeline";
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
export { AdminLoginPage, AccessDeniedPage } from "./admin-login";

export const adminSections = [
  "products",
  "categories",
  "brands",
  "promotions",
  "blog",
  "showrooms",
  "media",
  "quotes",
  "users",
  "settings",
] as const;

export type AdminSection = (typeof adminSections)[number];

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

export function AdminSectionPage({
  section,
  role,
  createMode,
  uploadMode,
  products,
  productTotal = 0,
  categories,
  categoryTotal = 0,
  promotions,
  promotionTotal = 0,
  blogPosts,
  blogTotal = 0,
  showrooms,
  showroomTotal = 0,
  quotes,
  quoteTotal = 0,
  brands,
  brandTotal = 0,
  profiles,
  profileTotal = 0,
  searchParams = {},
}: {
  section: AdminSection;
  role?: string;
  createMode?: boolean;
  uploadMode?: boolean;
  products?: AdminProduct[];
  productTotal?: number;
  categories?: AdminCategory[];
  categoryTotal?: number;
  promotions?: AdminPromotion[];
  promotionTotal?: number;
  blogPosts?: AdminBlogPost[];
  blogTotal?: number;
  showrooms?: AdminShowroom[];
  showroomTotal?: number;
  quotes?: AdminQuote[];
  quoteTotal?: number;
  brands?: Brand[];
  brandTotal?: number;
  profiles?: AdminUser[];
  profileTotal?: number;
  searchParams?: Record<string, string | undefined>;
}) {
  if (section === "quotes") return <QuotesPage quotes={quotes ?? []} role={role} total={quoteTotal} />;
  if (section === "media") return <MediaPage uploadMode={uploadMode} />;
  if (section === "settings") return <SettingsPage />;
  if (section === "users") return <UsersPage createMode={createMode} profiles={profiles ?? []} total={profileTotal} />;
  if (section === "brands") return <BrandsPage createMode={createMode} brands={brands ?? []} total={brandTotal} />;
  if (section === "blog") return <BlogPage createMode={createMode} posts={blogPosts ?? []} total={blogTotal} />;
  if (section === "showrooms") return <ShowroomPage createMode={createMode} showrooms={showrooms ?? []} total={showroomTotal} />;
  if (section === "categories") return <CategoryPage createMode={createMode} categories={categories ?? []} total={categoryTotal} />;
  if (section === "promotions") return <PromotionsPage createMode={createMode} promotions={promotions ?? []} total={promotionTotal} />;
  return (
    <ProductsPage
      createMode={createMode}
      products={products ?? []}
      total={productTotal}
      categories={categories ?? []}
      brands={brands ?? []}
    />
  );
}


export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-outline-variant/30 bg-surface px-4 py-3 sm:px-6 mt-4">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-outline bg-surface-container px-4 py-2 text-sm font-medium text-primary hover:bg-surface-container-high disabled:opacity-50 transition"
        >
          Trước
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-outline bg-surface-container px-4 py-2 text-sm font-medium text-primary hover:bg-surface-container-high disabled:opacity-50 transition"
        >
          Sau
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-secondary">
            Hiển thị trang <span className="font-semibold text-primary">{currentPage}</span> / <span className="font-semibold text-primary">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-secondary ring-1 ring-inset ring-outline-variant/50 hover:bg-surface-container-high focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition"
            >
              <span className="sr-only">Trước</span>
              <ChevronLeft className="size-4" />
            </button>
            
            {Array.from({ length: totalPages }).map((_, idx) => {
              const p = idx + 1;
              if (totalPages > 7 && Math.abs(p - currentPage) > 2 && p !== 1 && p !== totalPages) {
                if (p === 2 || p === totalPages - 1) {
                  return <span key={p} className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-secondary ring-1 ring-inset ring-outline-variant/50">...</span>;
                }
                return null;
              }
              const active = p === currentPage;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 transition ${
                    active
                      ? "z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      : "text-secondary ring-1 ring-inset ring-outline-variant/50 hover:bg-surface-container-high"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-secondary ring-1 ring-inset ring-outline-variant/50 hover:bg-surface-container-high focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition"
            >
              <span className="sr-only">Sau</span>
              <ChevronRight className="size-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

function getRelativeTimeString(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return "Hôm qua";
  return `${diffDays} ngày trước`;
}

function ProductsPage({ 
  createMode, 
  products = [], 
  total = 0,
  categories = [],
  brands = []
}: { 
  createMode?: boolean; 
  products?: AdminProduct[]; 
  total?: number;
  categories?: AdminCategory[];
  brands?: any[];
}) {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");
  const adminFilters = useAdminFilters();
  const { toast } = useToast();
  const router = useRouter();
  const [excelModalOpen, setExcelModalOpen] = useState(false);

  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);
  const [brandOptions, setBrandOptions] = useState<{ value: string; label: string }[]>([]);
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/filter-options?type=categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.options) setCategoryOptions(data.options);
      })
      .catch((err) => console.error("Error loading categories:", err));

    fetch("/api/admin/filter-options?type=brands")
      .then((res) => res.json())
      .then((data) => {
        if (data.options) setBrandOptions(data.options);
      })
      .catch((err) => console.error("Error loading brands:", err));
  }, []);

  const PRODUCT_STATUS_OPTIONS = [
    { value: "draft", label: "Bản nháp" },
    { value: "published", label: "Đã xuất bản" },
    { value: "archived", label: "Lưu trữ" },
  ];

  const filterConfigs: FilterConfig[] = [
    { type: "select", key: "status", label: "Trạng thái", options: PRODUCT_STATUS_OPTIONS, placeholder: "Tất cả trạng thái" },
    { type: "select", key: "categoryId", label: "Danh mục", options: categoryOptions, placeholder: "Tất cả danh mục" },
    { type: "select", key: "brandId", label: "Thương hiệu", options: brandOptions, placeholder: "Tất cả thương hiệu" },
    { type: "boolean", key: "featured", label: "Nổi bật" },
    { type: "date", key: "dateFrom", label: "Từ ngày" },
    { type: "date", key: "dateTo", label: "Đến ngày" },
  ];

  function formatPrice(product: AdminProduct) {
    if (product.price_display_text) return product.price_display_text;
    if (product.price_min !== null && product.price_min !== undefined) {
      const min = product.price_min.toLocaleString("vi-VN") + " ₫";
      if (product.price_max !== null && product.price_max !== undefined && product.price_max !== product.price_min) {
        return `${min} – ${product.price_max.toLocaleString("vi-VN")} ₫`;
      }
      return min;
    }
    return "Liên hệ";
  }

  function StatusPopover({ product, onStatusChange }: { product: AdminProduct; onStatusChange: (status: string) => void }) {
    const [open, setOpen] = useState(false);
    
    const statusOptions = [
      { value: "draft", label: "Bản nháp", description: "Không hiển thị trên site", color: "bg-slate-400" },
      { value: "published", label: "Đã xuất bản", description: "Hiển thị công khai", color: "bg-emerald-500" },
      { value: "archived", label: "Lưu trữ", description: "Ẩn nhưng bảo toàn dữ liệu", color: "bg-amber-500" }
    ];

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="cursor-pointer focus:outline-none select-none hover:opacity-80 active:scale-95 transition-all">
            <StatusBadge status={product.status} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-1.5 bg-white border border-slate-200 shadow-lg rounded-xl z-[200] animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="flex flex-col gap-1">
            <span className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
              Chuyển trạng thái
            </span>
            {statusOptions.map((opt) => {
              const isActive = product.status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-all ${
                    isActive 
                      ? "bg-slate-50 text-slate-900" 
                      : "hover:bg-slate-50/80 text-slate-600 hover:text-slate-900"
                  }`}
                  onClick={async () => {
                    if (!isActive) {
                      onStatusChange(opt.value);
                    }
                    setOpen(false);
                  }}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      <span className={`size-1.5 rounded-full ${opt.color}`} />
                      {opt.label}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">
                      {opt.description}
                    </span>
                  </div>
                  {isActive && (
                    <Check className="size-3.5 text-emerald-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Quản lý sản phẩm"
        description="Vận hành danh mục ưu tiên báo giá: trường song ngữ, ánh xạ danh mục, tệp, thông số, trạng thái giá và mức độ sẵn sàng xuất bản."
        actionHref="/admin/products?create=1"
        actionLabel="Thêm sản phẩm"
      />

      {/* Excel Actions Toolbar */}
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-sm w-fit">
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

      <DataView
        data={products}
        totalCount={total}
        filterConfigs={filterConfigs}
        searchPlaceholder="Tên sản phẩm, mã, slug..."
        defaultSort="sort_order"
        defaultDir="asc"
        defaultLimit={20}
        columns={[
          { key: "name", label: "Sản phẩm", width: "1fr", sortable: false },
          { key: "category_name", label: "Danh mục", width: "120px", sortable: false },
          { key: "brand_name", label: "Thương hiệu", width: "120px", sortable: false },
          { key: "price", label: "Giá", width: "130px", sortable: false },
          { key: "status", label: "Trạng thái", width: "100px", sortable: true },
          { key: "featured", label: "Nổi bật", width: "80px", sortable: true },
          { key: "updated_at", label: "Cập nhật", width: "100px", sortable: true },
          { key: "actions", label: "Thao tác", width: "110px", sortable: false },
        ]}
        renderListRow={(item) => {
          const product = item as AdminProduct & { updated_at?: string };
          return (
            <div key={product.id} className="grid items-center gap-4 px-4 py-3.5 transition-colors hover:bg-slate-50" style={{ gridTemplateColumns: "1fr 120px 120px 130px 100px 80px 100px 110px" }}>
              <div className="flex gap-3 min-w-0">
                {(product.primary_media as any)?.url ? (
                  <RemoteImage src={(product.primary_media as any).url} alt={product.name} className="size-12 rounded-lg bg-slate-100 shrink-0 relative" />
                ) : (
                  <div className="size-12 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center"><Package className="size-5 text-slate-300" /></div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{product.name}</p>
                  <p className="text-xs text-slate-400 truncate">{product.reference_code ?? product.slug}</p>
                </div>
              </div>
              <span className="text-sm text-slate-600 truncate">{product.category_name}</span>
              <span className="text-sm text-slate-600 truncate">{product.brand_name ?? "—"}</span>
              <span className="text-xs text-slate-600 font-semibold truncate">{formatPrice(product)}</span>
              <StatusPopover
                product={product}
                onStatusChange={async (newStatus) => {
                  const res = await updateProductStatus(product.id, newStatus);
                  if (res.success) {
                    toast.success("Cập nhật trạng thái thành công!");
                    router.refresh();
                  } else {
                    toast.error("Cập nhật thất bại: " + (res.error ?? "Không rõ"));
                  }
                }}
              />
              <div className="flex items-center">
                <Switch
                  checked={product.featured}
                  onCheckedChange={async (checked) => {
                    const res = await updateProductFeatured(product.id, checked);
                    if (res.success) {
                      toast.success("Cập nhật nổi bật thành công!");
                      router.refresh();
                    } else {
                      toast.error("Cập nhật thất bại: " + (res.error ?? "Không rõ"));
                    }
                  }}
                />
              </div>
              <span className="text-xs text-slate-400">{getRelativeTimeString(product.updated_at)}</span>
              <div className="flex items-center gap-1.5">
                {product.status === "published" ? (
                  <a
                    href={`/products/${product.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Xem trên website"
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                ) : (
                  <span className="p-1.5 opacity-30 cursor-not-allowed text-slate-300">
                    <ExternalLink className="size-4" />
                  </span>
                )}
                <Link
                  href={`/admin/products?edit=${product.slug || product.id}`}
                  title="Chỉnh sửa"
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
                >
                  <Pencil className="size-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setProductToDelete(product)}
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
          const product = item as AdminProduct;
          return (
            <div key={product.id} className="group relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition">
              {(product.primary_media as any)?.url ? (
                <RemoteImage src={(product.primary_media as any).url} alt={product.name} className="w-full aspect-[4/3] bg-slate-100 relative" />
              ) : (
                <div className="w-full aspect-[4/3] bg-slate-100 flex items-center justify-center"><Package className="size-10 text-slate-200" /></div>
              )}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-semibold text-slate-800 text-sm line-clamp-2 flex-1">{product.name}</p>
                  <StatusBadge status={product.status} className="shrink-0" />
                </div>
                <p className="text-xs text-slate-400 mb-2">{product.category_name}</p>
                {product.featured && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600"><Star className="size-3" />Nổi bật</span>}
              </div>
              <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition flex border-t bg-white p-2 gap-2">
                <Link href={`/admin/products?edit=${product.slug || product.id}`} className="admin-edit-action flex-1 justify-center">
                  <Pencil className="size-3" />Chỉnh sửa
                </Link>
              </div>
            </div>
          );
        }}
        emptyMessage="Chưa có sản phẩm nào được tạo."
        emptyIcon={<Package className="size-10 text-slate-200" />}
      />

      <AdminRouteDialog
        open={Boolean(createMode)}
        returnHref="/admin/products"
        title="Thêm sản phẩm"
        description="Tạo sản phẩm ưu tiên báo giá với nội dung gốc tiếng Việt, bản dịch tiếng Anh tùy chọn, thư viện ảnh, thông số, giá và SEO."
        size="full"
      >
        <ContentEditorForm kind="product" mode="create" />
      </AdminRouteDialog>

      {/* Edit Dialog */}
      <AdminRouteDialog
        open={Boolean(editSlug)}
        returnHref="/admin/products"
        title="Hiệu chỉnh sản phẩm"
        description="Chỉnh sửa thông tin chi tiết sản phẩm, cấu hình song ngữ, giá và SEO."
        size="full"
      >
        <ContentEditorForm kind="product" mode="edit" idOrSlug={editSlug || undefined} />
      </AdminRouteDialog>

      <AlertDialog open={productToDelete !== null} onOpenChange={(open) => { if (!open) setProductToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa <strong>{productToDelete?.name}</strong>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (!productToDelete) return;
              setIsDeleting(true);
              try {
                const res = await deleteAdminProduct(productToDelete.id);
                if (res.success) {
                  toast.success("Xóa sản phẩm thành công!");
                  router.refresh();
                } else {
                  toast.error("Xóa thất bại: " + (res.error ?? "Không xác định"));
                }
              } catch (err) {
                toast.error("Đã xảy ra lỗi khi xóa: " + String(err));
              } finally {
                setIsDeleting(false);
                setProductToDelete(null);
              }
            }} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ExcelImportExportModal
        isOpen={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        type="product"
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}

import { useSearchParams, useRouter } from "next/navigation";

function BlogPage({ createMode, posts = [], total = 0 }: { createMode?: boolean; posts?: AdminBlogPost[]; total?: number }) {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");
  const { toast } = useToast();
  const router = useRouter();

  const [blogCategoryOptions, setBlogCategoryOptions] = useState<{ value: string; label: string }[]>([]);
  const [blogToDelete, setBlogToDelete] = useState<AdminBlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/filter-options?type=blog-categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.options) setBlogCategoryOptions(data.options);
      })
      .catch((err) => console.error("Error loading blog categories:", err));
  }, []);

  const STATUS_OPTIONS = [
    { value: "draft", label: "Bản nháp" },
    { value: "published", label: "Đã xuất bản" },
    { value: "archived", label: "Lưu trữ" },
  ];

  const filterConfigs: FilterConfig[] = [
    { type: "select", key: "status", label: "Trạng thái", options: STATUS_OPTIONS, placeholder: "Tất cả" },
    { type: "select", key: "categoryId", label: "Danh mục", options: blogCategoryOptions, placeholder: "Tất cả danh mục" },
    { type: "boolean", key: "featured", label: "Nổi bật" },
    { type: "date", key: "dateFrom", label: "Từ ngày" },
    { type: "date", key: "dateTo", label: "Đến ngày" },
  ];

  function BlogStatusPopover({ post, onStatusChange }: { post: AdminBlogPost; onStatusChange: (status: string) => void }) {
    const [open, setOpen] = useState(false);
    
    const statusOptions = [
      { value: "draft", label: "Bản nháp", description: "Không hiển thị trên site", color: "bg-slate-400" },
      { value: "published", label: "Đã xuất bản", description: "Hiển thị công khai", color: "bg-emerald-500" },
      { value: "archived", label: "Lưu trữ", description: "Ẩn nhưng bảo toàn dữ liệu", color: "bg-amber-500" }
    ];

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="cursor-pointer focus:outline-none select-none hover:opacity-80 active:scale-95 transition-all">
            <StatusBadge status={post.status} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-1.5 bg-white border border-slate-200 shadow-lg rounded-xl z-[200] animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="flex flex-col gap-1">
            <span className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
              Chuyển trạng thái
            </span>
            {statusOptions.map((opt) => {
              const isActive = post.status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-all ${
                    isActive 
                      ? "bg-slate-50 text-slate-900" 
                      : "hover:bg-slate-50/80 text-slate-600 hover:text-slate-900"
                  }`}
                  onClick={async () => {
                    if (!isActive) {
                      onStatusChange(opt.value);
                    }
                    setOpen(false);
                  }}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      <span className={`size-1.5 rounded-full ${opt.color}`} />
                      {opt.label}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">
                      {opt.description}
                    </span>
                  </div>
                  {isActive && (
                    <Check className="size-3.5 text-emerald-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Quy trình bài viết"
        description="Vận hành biên tập bài viết song ngữ, danh mục, thẻ, ảnh bìa, tác giả, trạng thái xuất bản và SEO."
        actionHref="/admin/blog?create=1"
        actionLabel="Thêm bài viết"
      />

      <DataView
        data={posts}
        totalCount={total}
        filterConfigs={filterConfigs}
        searchPlaceholder="Tiêu đề bài viết, trích dẫn..."
        defaultSort="published_at"
        defaultDir="desc"
        defaultLimit={20}
        columns={[
          { key: "title", label: "Bài viết", width: "1fr", sortable: false },
          { key: "category", label: "Danh mục", width: "120px", sortable: false },
          { key: "author", label: "Tác giả", width: "120px", sortable: false },
          { key: "status", label: "Trạng thái", width: "100px", sortable: true },
          { key: "featured", label: "Nổi bật", width: "80px", sortable: true },
          { key: "published_at", label: "Ngày xuất bản", width: "110px", sortable: true },
          { key: "actions", label: "Thao tác", width: "110px", sortable: false },
        ]}
        renderListRow={(item) => {
          const post = item as AdminBlogPost;
          return (
            <div key={post.id} className="grid items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-50" style={{ gridTemplateColumns: "1fr 120px 120px 100px 80px 110px 110px" }}>
              <div className="flex gap-3 min-w-0">
                {(post.cover_media as any)?.url ? (
                  <RemoteImage src={(post.cover_media as any).url} alt={post.title} className="size-10 rounded-lg bg-slate-100 shrink-0 relative" />
                ) : (
                  <div className="size-10 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center"><NewspaperIcon className="size-4 text-slate-300" /></div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{post.title}</p>
                  <p className="text-xs text-slate-400 truncate">{post.excerpt}</p>
                </div>
              </div>
              <span className="text-xs text-slate-500 truncate">{post.category_name}</span>
              <span className="text-xs text-slate-500 truncate">{post.author_name || "—"}</span>
              <BlogStatusPopover
                post={post}
                onStatusChange={async (newStatus) => {
                  const res = await updateBlogPostStatus(post.id, newStatus);
                  if (res.success) {
                    toast.success("Cập nhật trạng thái thành công!");
                    router.refresh();
                  } else {
                    toast.error("Cập nhật thất bại: " + (res.error ?? "Không rõ"));
                  }
                }}
              />
              <div className="flex items-center">
                <Switch
                  checked={post.featured}
                  onCheckedChange={async (checked) => {
                    const res = await updateBlogPostFeatured(post.id, checked);
                    if (res.success) {
                      toast.success("Cập nhật nổi bật thành công!");
                      router.refresh();
                    } else {
                      toast.error("Cập nhật thất bại: " + (res.error ?? "Không rõ"));
                    }
                  }}
                />
              </div>
              <span className="text-xs text-slate-400" suppressHydrationWarning>{post.published_at ? new Date(post.published_at).toLocaleDateString("vi-VN") : "Chưa xuất bản"}</span>
              <div className="flex items-center gap-1.5">
                {post.status === "published" ? (
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Xem trên website"
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                ) : (
                  <span className="p-1.5 opacity-30 cursor-not-allowed text-slate-300">
                    <ExternalLink className="size-4" />
                  </span>
                )}
                <Link
                  href={`/admin/blog?edit=${post.slug}`}
                  title="Chỉnh sửa"
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
                >
                  <Pencil className="size-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setBlogToDelete(post)}
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
          const post = item as AdminBlogPost;
          return (
            <article key={post.id} className="group relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition flex flex-col">
              {(post.cover_media as any)?.url ? (
                <RemoteImage src={(post.cover_media as any).url} alt={post.title} className="w-full aspect-video bg-slate-100 relative" />
              ) : (
                <div className="w-full aspect-video bg-slate-100 flex items-center justify-center"><NewspaperIcon className="size-10 text-slate-200" /></div>
              )}
              <div className="p-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase truncate">{post.category_name}</span>
                  <StatusBadge status={post.status} />
                </div>
                <p className="font-semibold text-sm text-slate-800 line-clamp-2 flex-1">{post.title}</p>
                <p className="text-xs text-slate-400 mt-1" suppressHydrationWarning>{post.published_at ? new Date(post.published_at).toLocaleDateString("vi-VN") : "Chưa xuất bản"}</p>
              </div>
              <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition flex border-t bg-white p-2">
                <Link href={`/admin/blog?edit=${post.slug}`} className="admin-edit-action flex-1 justify-center">
                  <Pencil className="size-3" />Chỉnh sửa
                </Link>
              </div>
            </article>
          );
        }}
        emptyMessage="Chưa có bài viết nào được tạo."
        emptyIcon={<NewspaperIcon className="size-10 text-slate-200" />}
      />

      {/* Add dialog */}
      <AdminRouteDialog
        open={Boolean(createMode)}
        returnHref="/admin/blog"
        title="Thêm bài viết"
        description="Tạo bài viết ưu tiên tiếng Việt và chỉ bật tiếng Anh khi cần lưu bản dịch."
        size="full"
      >
        <ContentEditorForm kind="blog" mode="create" />
      </AdminRouteDialog>

      {/* Edit dialog */}
      <AdminRouteDialog
        open={Boolean(editSlug)}
        returnHref="/admin/blog"
        title="Hiệu chỉnh bài viết"
        description="Chỉnh sửa nội dung chi tiết bài viết, cấu hình song ngữ, SEO và trạng thái xuất bản."
        size="full"
      >
        <ContentEditorForm kind="blog" mode="edit" idOrSlug={editSlug || undefined} />
      </AdminRouteDialog>

      <AlertDialog open={blogToDelete !== null} onOpenChange={(open) => { if (!open) setBlogToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bài viết</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa bài viết <strong>{blogToDelete?.title}</strong>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (!blogToDelete) return;
              setIsDeleting(true);
              try {
                const res = await deleteAdminBlogPost(blogToDelete.id);
                if (res.success) {
                  toast.success("Xóa bài viết thành công!");
                  router.refresh();
                } else {
                  toast.error("Xóa thất bại: " + (res.error ?? "Không xác định"));
                }
              } catch (err) {
                toast.error("Đã xảy ra lỗi khi xóa: " + String(err));
              } finally {
                setIsDeleting(false);
                setBlogToDelete(null);
              }
            }} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CategoryPage({ createMode, categories = [], total = 0 }: { createMode?: boolean; categories?: AdminCategory[]; total?: number }) {
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

function BrandsPage({ createMode, brands = [], total = 0 }: { createMode?: boolean; brands?: Brand[]; total?: number }) {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");
  const { toast } = useToast();
  const router = useRouter();

  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [brandProductCount, setBrandProductCount] = useState(0);
  const [brandStep, setBrandStep] = useState(1);
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
    <div className="space-y-5">
      <AdminPageHeader
        title="Quản trị thương hiệu"
        description="Quản lý thương hiệu đối tác liên kết, logo, nguồn gốc xuất xứ và trạng thái hiển thị."
        actionHref="/admin/brands?create=1"
        actionLabel="Thêm thương hiệu"
      />

      <DataView
        data={brands}
        totalCount={total || brands.length}
        filterConfigs={filterConfigs}
        searchPlaceholder="Tên thương hiệu..."
        defaultSort="sort_order"
        defaultDir="asc"
        defaultLimit={20}
        columns={[
          { key: "logo", label: "Logo", width: "80px", sortable: false },
          { key: "name", label: "Thương hiệu", width: "1fr", sortable: false },
          { key: "origin", label: "Xuất xứ", width: "160px", sortable: true },
          { key: "status", label: "Trạng thái", width: "120px", sortable: true },
          { key: "actions", label: "Thao tác", width: "100px", sortable: false },
        ]}
        renderListRow={(item) => {
          const brand = item as Brand;
          return (
            <div key={brand.id} className="grid items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-50" style={{ gridTemplateColumns: "80px 1fr 160px 120px 100px" }}>
              {brand.logo_url ? (
                <img src={brand.logo_url.startsWith("http://local-assets") ? brand.logo_url.replace("http://local-assets", "") : brand.logo_url} alt={brand.name?.vi || "Logo"} className="size-10 rounded border object-contain bg-slate-50 shrink-0" />
              ) : (
                <div className="size-10 rounded border bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-semibold shrink-0">Logo</div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{brand.name?.vi || "—"}</p>
                {brand.name?.en && brand.name?.en !== brand.name?.vi && <p className="text-xs text-slate-400 truncate">{brand.name.en}</p>}
              </div>
              <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-bold uppercase w-fit">{brand.origin || "—"}</span>
              <StatusBadge status={brand.status} />
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/admin/brands?edit=${brand.slug || brand.id}`}
                  title="Chỉnh sửa"
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
                >
                  <Pencil className="size-4" />
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const count = await getBrandProductCount(brand.id);
                      setBrandProductCount(count);
                      setBrandStep(1);
                      setBrandToDelete(brand);
                    } catch (err) {
                      console.error("Error fetching product count:", err);
                      setBrandProductCount(0);
                      setBrandStep(1);
                      setBrandToDelete(brand);
                    }
                  }}
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
          const brand = item as Brand;
          return (
            <div key={brand.id} className="card-pd interactive-card p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <p className="label-pd">#{brand.sort_order ?? "—"}</p>
                  <StatusBadge status={brand.status} />
                </div>
                <div className="flex gap-3 items-start mt-3">
                  {brand.logo_url ? (
                    <img src={brand.logo_url.startsWith("http://local-assets") ? brand.logo_url.replace("http://local-assets", "") : brand.logo_url} alt={brand.name?.vi || "Logo"} className="size-12 rounded border object-contain bg-slate-50" />
                  ) : (
                    <div className="size-12 rounded border bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-semibold">No Logo</div>
                  )}
                  <div>
                    <span className="font-heading font-semibold text-primary block leading-tight">{brand.name?.vi || "—"}</span>
                    {brand.name?.en && brand.name?.en !== brand.name?.vi && <p className="text-xs text-secondary mt-0.5">{brand.name.en}</p>}
                    {brand.origin && <p className="text-[10px] text-slate-500 mt-1 font-semibold uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded inline-block">{brand.origin}</p>}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <Link href={`/admin/brands?edit=${brand.slug || brand.id}`} className="admin-edit-action inline-flex items-center gap-1 text-xs">
                  <Pencil className="size-3" />Chỉnh sửa
                </Link>
              </div>
            </div>
          );
        }}
        emptyMessage="Chưa có thương hiệu nào."
        emptyIcon={<Globe className="size-10 text-slate-200" />}
      />

      {/* Create Dialog */}
      <AdminRouteDialog
        open={Boolean(createMode)}
        returnHref="/admin/brands"
        title="Thêm thương hiệu"
        description="Tạo thương hiệu đối tác mới kèm logo, nguồn gốc xuất xứ và thông tin mô tả."
        size="full"
      >
        <EntityCreateForm kind="brand" />
      </AdminRouteDialog>

      {/* Edit Dialog */}
      <AdminRouteDialog
        open={Boolean(editSlug)}
        returnHref="/admin/brands"
        title="Hiệu chỉnh thương hiệu"
        description="Chỉnh sửa chi tiết thương hiệu đối tác, thay đổi logo và cấu hình hiển thị."
        size="full"
      >
        <EntityCreateForm kind="brand" idOrSlug={editSlug || undefined} />
      </AdminRouteDialog>

      <AlertDialog open={brandToDelete !== null} onOpenChange={(open) => { if (!open) setBrandToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa thương hiệu</AlertDialogTitle>
            <AlertDialogDescription>
              {brandProductCount > 0 ? (
                brandStep === 1 ? (
                  <span>
                    Thương hiệu <strong>{brandToDelete?.name?.vi}</strong> này có <strong>{brandProductCount}</strong> sản phẩm. Xóa sẽ ảnh hưởng đến các sản phẩm này. Bạn có chắc muốn tiếp tục?
                  </span>
                ) : (
                  <span>
                    Hành động này sẽ gỡ bỏ liên kết thương hiệu của các sản phẩm liên quan. Bạn có chắc muốn xóa thương hiệu này không? Hành động này không thể hoàn tác.
                  </span>
                )
              ) : (
                <span>
                  Bạn có chắc muốn xóa thương hiệu <strong>{brandToDelete?.name?.vi}</strong>? Hành động này không thể hoàn tác.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {brandProductCount > 0 && brandStep === 1 ? (
              <>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={() => setBrandStep(2)} className="bg-amber-600 text-white hover:bg-amber-700">
                  Tiếp tục
                </AlertDialogAction>
              </>
            ) : (
              <>
                <AlertDialogCancel onClick={() => setBrandStep(1)}>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={async () => {
                  if (!brandToDelete) return;
                  setIsDeleting(true);
                  try {
                    const res = await deleteAdminBrand(brandToDelete.id);
                    if (res.success) {
                      toast.success("Xóa thương hiệu thành công!");
                      router.refresh();
                    } else {
                      toast.error("Xóa thất bại: " + (res.error ?? "Không xác định"));
                    }
                  } catch (err) {
                    toast.error("Đã xảy ra lỗi khi xóa: " + String(err));
                  } finally {
                    setIsDeleting(false);
                    setBrandToDelete(null);
                    setBrandStep(1);
                  }
                }} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {isDeleting ? "Đang xóa..." : "Xóa"}
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}



function ShowroomPage({ createMode, showrooms = [], total = 0 }: { createMode?: boolean; showrooms?: AdminShowroom[]; total?: number }) {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");
  const { toast } = useToast();
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
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-sm w-fit">
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
              setIsDeleting(true);
              try {
                const res = await deleteAdminShowroom(showroomToDelete.id);
                if (res.success) {
                  toast.success("Xóa showroom thành công!");
                  router.refresh();
                } else {
                  toast.error("Xóa thất bại: " + (res.error ?? "Không xác định"));
                }
              } catch (err) {
                toast.error("Đã xảy ra lỗi khi xóa: " + String(err));
              } finally {
                setIsDeleting(false);
                setShowroomToDelete(null);
              }
            }} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Đang xóa..." : "Xóa"}
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

function QuotesPage({
  quotes = [],
  role,
  total = 0,
}: {
  quotes?: AdminQuote[];
  role?: string;
  total?: number;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const filters = useAdminFilters();

  const [selectedQuoteId, setSelectedQuoteId] = useState<string>("");
  const [showEmailDraft, setShowEmailDraft] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusNote, setStatusNote] = useState("");
  const [localQuotes, setLocalQuotes] = useState<AdminQuote[]>(quotes);
  const [staffOptions, setStaffOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    setLocalQuotes(quotes);
    if (quotes.length > 0 && !selectedQuoteId) {
      setSelectedQuoteId(quotes[0].id);
    }
  }, [quotes]);

  useEffect(() => {
    fetch("/api/admin/filter-options?type=admin-users")
      .then((res) => res.json())
      .then((data) => {
        if (data.options) setStaffOptions(data.options);
      })
      .catch((err) => console.error("Error loading admin users:", err));
  }, []);

  if (role !== "admin") {
    return (
      <div className="rounded-xl border border-dashed bg-slate-50 min-h-[320px] flex flex-col justify-center items-center p-8 text-center text-slate-400">
        <Lock className="size-10 mb-3" />
        <p className="font-semibold text-sm">Bạn không có quyền truy cập mục yêu cầu báo giá.</p>
      </div>
    );
  }

  const q = filters.getFilter("q");
  const status = filters.getFilter("status");
  const dateFrom = filters.getFilter("dateFrom");
  const dateTo = filters.getFilter("dateTo");
  const assignedTo = filters.getFilter("assignedTo");
  const currentPage = filters.getPage();
  const currentLimit = filters.getLimit();

  const totalPages = Math.max(1, Math.ceil(total / currentLimit));

  const filterValues: Record<string, string> = {};
  if (status) filterValues.status = status;
  if (dateFrom) filterValues.dateFrom = dateFrom;
  if (dateTo) filterValues.dateTo = dateTo;
  if (assignedTo) filterValues.assignedTo = assignedTo;
  if (q) filterValues.q = q;

  const selectedQuote = localQuotes.find((q) => q.id === selectedQuoteId) || localQuotes[0] || null;

  const STATUS_OPTIONS = [
    { value: "new", label: "Chờ xử lý" },
    { value: "contacted", label: "Đã liên hệ" },
    { value: "qualified", label: "Đủ điều kiện" },
    { value: "closed", label: "Hoàn tất" },
    { value: "cancelled", label: "Đã hủy" },
    { value: "spam", label: "Thư rác" },
  ];

  const filterConfigs: FilterConfig[] = [
    { type: "select", key: "status", label: "Trạng thái", options: STATUS_OPTIONS, placeholder: "Tất cả" },
    { type: "select", key: "assignedTo", label: "Người phụ trách", options: staffOptions, placeholder: "Tất cả nhân viên" },
    { type: "date", key: "dateFrom", label: "Từ ngày" },
    { type: "date", key: "dateTo", label: "Đến ngày" },
  ];

  // Quote workflow: trạng thái → actions có thể thực hiện tiếp theo
  const workflowTransitions: Record<string, { label: string; status: string; variant: string }[]> = {
    new:        [{ label: "Đã liên hệ", status: "contacted", variant: "primary" }, { label: "Hủy", status: "cancelled", variant: "secondary" }, { label: "Đánh dấu spam", status: "spam", variant: "danger" }],
    contacted:  [{ label: "Đủ điều kiện", status: "qualified", variant: "primary" }, { label: "Hủy", status: "cancelled", variant: "secondary" }, { label: "Đóng", status: "closed", variant: "danger" }],
    qualified:  [{ label: "Hoàn tất & Đóng", status: "closed", variant: "success" }, { label: "Hủy", status: "cancelled", variant: "secondary" }],
    closed:     [{ label: "Mở lại", status: "new", variant: "primary" }],
    spam:       [{ label: "Khôi phục", status: "new", variant: "primary" }],
    cancelled:  [{ label: "Mở lại", status: "new", variant: "primary" }],
  };

  const statusLabels: Record<string, string> = {
    new:        "Chờ xử lý",
    contacted:  "Đã liên hệ",
    qualified:  "Đủ điều kiện",
    closed:     "Đã hoàn tất",
    spam:       "Thư rác",
    cancelled:  "Đã hủy",
  };

  const statusColors: Record<string, string> = {
    new:        "status-warning",
    contacted:  "bg-blue-100 text-blue-700 border-blue-200",
    qualified:  "bg-purple-100 text-purple-700 border-purple-200",
    closed:     "status-success",
    spam:       "status-error",
    cancelled:  "bg-gray-100 text-gray-700 border-gray-200",
  };

  async function handleStatusTransition(quoteId: string, newStatus: string) {
    if (isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      const { updateQuoteStatus } = await import("@/lib/supabase/admin-queries");
      const result = await updateQuoteStatus(quoteId, newStatus, statusNote || undefined);
      if (result.success) {
        setLocalQuotes((prev) => prev.map((q) => q.id === quoteId ? { ...q, status: newStatus } : q));
        setStatusNote("");
        toast.success("Cập nhật trạng thái thành công!");
        router.refresh();
      } else {
        toast.error("Lỗi cập nhật trạng thái: " + (result.error ?? "Không xác định"));
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi: " + String(err));
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  function AssigneePopover({
    quote,
    staffOptions,
    onAssigneeChange
  }: {
    quote: AdminQuote;
    staffOptions: { value: string; label: string }[];
    onAssigneeChange: (assigneeId: string | null) => void;
  }) {
    const [open, setOpen] = useState(false);
    const currentAssigneeName = quote.assignee?.full_name || "Chưa phân công";

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="text-left font-semibold text-slate-700 hover:text-indigo-600 transition truncate max-w-full focus:outline-none select-none">
            {currentAssigneeName}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-1 bg-white border border-slate-200 shadow-md rounded-md z-[200]">
          <div className="flex flex-col text-xs max-h-60 overflow-y-auto">
            <span className="px-2 py-1 text-slate-400 font-semibold border-b">Phân công nhân sự</span>
            <button
              type="button"
              className="w-full text-left px-2 py-1.5 hover:bg-slate-50 text-slate-600 font-medium transition"
              onClick={() => {
                onAssigneeChange(null);
                setOpen(false);
              }}
            >
              Chưa phân công
            </button>
            {staffOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className="w-full text-left px-2 py-1.5 hover:bg-slate-50 text-slate-700 font-medium transition"
                onClick={() => {
                  onAssigneeChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý yêu cầu báo giá"
        description="Kiểm duyệt và xử lý các yêu cầu từ khách hàng. Theo dõi tiến trình qua workflow trạng thái rõ ràng."
      />

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <FilterBar
            filters={filterConfigs}
            values={filterValues}
            onFilterChange={filters.setFilter}
            onSearch={filters.setSearch}
            searchValue={q}
            searchPlaceholder="Tìm theo tên khách, số điện thoại, hoặc dịch vụ..."
            totalCount={total}
            currentCount={localQuotes.length}
            currentSort={filters.getSort("created_at")}
            currentDir={filters.getDir("desc")}
            onSortChange={(sort, dir) => filters.setSort(sort, dir as any)}
            sortableColumns={[
              { key: "created_at", label: "Ngày yêu cầu" },
              { key: "status", label: "Trạng thái" },
              { key: "full_name", label: "Tên khách" },
            ]}
          />

          <div className="surface-soft overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="grid grid-cols-[1.2fr_1fr_1fr_100px_130px] bg-slate-50 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <span>Khách hàng</span>
              <span>Doanh nghiệp / Dịch vụ</span>
              <span>Người phụ trách</span>
              <span>Ngày yêu cầu</span>
              <span>Trạng thái</span>
            </div>
            {localQuotes.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-400">Không tìm thấy yêu cầu báo giá nào khớp điều kiện.</p>
            ) : (
              localQuotes.map((quote) => (
                <button
                  key={quote.id}
                  type="button"
                  className={`w-full text-left grid grid-cols-[1.2fr_1fr_1fr_100px_130px] items-center border-t border-slate-100 px-4 py-3.5 transition-colors hover:bg-slate-50/50 ${
                    selectedQuote?.id === quote.id ? "bg-indigo-50/30" : ""
                  }`}
                  onClick={() => setSelectedQuoteId(quote.id)}
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-800 truncate">{quote.full_name}</p>
                    <p className="text-xs text-slate-500 font-mono">{quote.phone}</p>
                    {quote.email && <p className="text-[10px] text-slate-400 truncate">{quote.email}</p>}
                  </div>
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-slate-700 truncate">{quote.company || "Cá nhân"}</p>
                    <p className="text-[10px] text-slate-400 truncate">{quote.service ?? "Yêu cầu tư vấn"}</p>
                  </div>
                  <div className="min-w-0 pr-2" onClick={(e) => e.stopPropagation()}>
                    <AssigneePopover
                      quote={quote}
                      staffOptions={staffOptions}
                      onAssigneeChange={async (newAssigneeId) => {
                        const res = await updateQuoteAssignee(quote.id, newAssigneeId);
                        if (res.success) {
                          toast.success("Phân công nhân sự thành công!");
                          setLocalQuotes((prev) =>
                            prev.map((q) =>
                              q.id === quote.id
                                ? {
                                    ...q,
                                    assigned_to: newAssigneeId,
                                    assignee: newAssigneeId
                                      ? {
                                          id: newAssigneeId,
                                          full_name: staffOptions.find((opt) => opt.value === newAssigneeId)?.label || "Nhân viên",
                                          email: ""
                                        }
                                      : null
                                  }
                                : q
                            )
                          );
                          router.refresh();
                        } else {
                          toast.error("Lỗi phân công: " + (res.error ?? "Không xác định"));
                        }
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-500" suppressHydrationWarning>
                    {new Date(quote.created_at).toLocaleDateString("vi-VN")}
                  </span>
                  <span className={`status-pill w-fit text-[11px] leading-none ${statusColors[quote.status] ?? "status-muted"}`}>
                    {statusLabels[quote.status] ?? quote.status}
                  </span>
                </button>
              ))
            )}
          </div>
          <div className="flex flex-col items-center gap-4 mt-6">
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={total}
              limit={currentLimit}
              onPageChange={filters.setPage}
            />
            
            <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-slate-500">
              <span suppressHydrationWarning>
                Hiển thị <span className="font-semibold">{Math.min((currentPage - 1) * currentLimit + 1, total)}–{Math.min(currentPage * currentLimit, total)}</span> trong{" "}
                <span className="font-semibold">{total}</span> kết quả
              </span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span>Hiển thị:</span>
                <Select
                  value={String(currentLimit)}
                  onValueChange={(val) => {
                    filters.setLimit(parseInt(val, 10));
                  }}
                >
                  <SelectTrigger className="h-8 text-xs bg-white border-slate-200 min-w-[100px] rounded-lg">
                    <SelectValue placeholder={`${currentLimit} / trang`} />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} / trang
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {selectedQuote ? (
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-slate-400 block truncate">{selectedQuote.id}</span>
                  <h4 className="font-heading font-bold text-sm">Chi tiết yêu cầu báo giá</h4>
                </div>
                <span className={`status-pill text-[11px] leading-none shrink-0 ${statusColors[selectedQuote.status] ?? "status-muted"}`}>
                  {statusLabels[selectedQuote.status] ?? selectedQuote.status}
                </span>
              </div>

              <div className="p-4 flex-1 space-y-4 text-xs">
                {/* Missing email warning */}
                {!selectedQuote.email && (
                  <div className="rounded-lg bg-orange-50 border border-orange-200 p-3 text-orange-700 flex items-start gap-2">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Thiếu địa chỉ email khách hàng</strong>
                      <span className="text-[11px] block mt-0.5">Cần bổ sung email nếu muốn gửi báo giá chi tiết qua thư.</span>
                    </div>
                  </div>
                )}

                {/* Contact info */}
                <div className="bg-slate-50 p-3 rounded-lg border space-y-2">
                  <h5 className="font-bold text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <User className="size-3.5 text-slate-400" /> Thông tin liên hệ
                  </h5>
                  <div className="grid gap-2 pl-5">
                    <div><span className="text-slate-400 block">Khách hàng</span><strong className="text-sm text-slate-800">{selectedQuote.full_name}</strong></div>
                    <div><span className="text-slate-400 block">Số điện thoại</span><strong className="text-slate-700 font-mono">{selectedQuote.phone}</strong></div>
                    <div><span className="text-slate-400 block">Email</span><span className="text-slate-700 font-semibold">{selectedQuote.email || "Chưa thiết lập"}</span></div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Người phụ trách</span>
                      <div className="mt-1 flex flex-col gap-1 max-w-[200px]">
                        <span className="font-semibold text-slate-700">{selectedQuote.assignee?.full_name || "Chưa phân công"}</span>
                        <select
                          value={selectedQuote.assigned_to || ""}
                          onChange={async (e) => {
                            const newAssigneeId = e.target.value || null;
                            const res = await updateQuoteAssignee(selectedQuote.id, newAssigneeId);
                            if (res.success) {
                              toast.success("Phân công nhân sự thành công!");
                              setLocalQuotes((prev) =>
                                prev.map((q) =>
                                  q.id === selectedQuote.id
                                    ? {
                                        ...q,
                                        assigned_to: newAssigneeId,
                                        assignee: newAssigneeId
                                          ? {
                                              id: newAssigneeId,
                                              full_name: staffOptions.find((opt) => opt.value === newAssigneeId)?.label || "Nhân viên",
                                              email: ""
                                            }
                                          : null
                                      }
                                    : q
                                )
                              );
                              router.refresh();
                            } else {
                              toast.error("Lỗi phân công: " + (res.error ?? "Không xác định"));
                            }
                          }}
                          className="block w-full rounded border border-slate-200 bg-white p-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Chưa phân công</option>
                          {staffOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Request info */}
                <div className="bg-slate-50 p-3 rounded-lg border space-y-2">
                  <h5 className="font-bold text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FileText className="size-3.5 text-slate-400" /> Nội dung yêu cầu
                  </h5>
                  <div className="grid gap-2 pl-5 font-sans">
                    <div><span className="text-slate-400 block">Dịch vụ</span><strong className="text-slate-800">{selectedQuote.service ?? "Yêu cầu tư vấn"}</strong></div>
                    <div><span className="text-slate-400 block">Đường dẫn nguồn</span><span className="text-slate-500 font-mono break-all">{selectedQuote.source_path}</span></div>
                    <div><span className="text-slate-400 block">Ghi chú khách hàng</span><p className="text-slate-700 leading-relaxed whitespace-pre-line bg-white p-2 border rounded">{selectedQuote.message || "Không có ghi chú của khách hàng."}</p></div>
                    
                    {/* Admin notes & Sales notes textareas */}
                    <div className="space-y-3.5 border-t pt-3">
                      <div className="space-y-1">
                        <span className="text-slate-400 block font-semibold">Ghi chú hệ thống / Admin</span>
                        <textarea
                          key={`admin-notes-${selectedQuote.id}`}
                          className="w-full rounded border border-slate-200 p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                          rows={2}
                          defaultValue={selectedQuote.admin_notes || ""}
                          id={`admin-notes-${selectedQuote.id}`}
                          placeholder="Nhập ghi chú admin..."
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            const textarea = document.getElementById(`admin-notes-${selectedQuote.id}`) as HTMLTextAreaElement;
                            const val = textarea?.value || "";
                            const res = await updateQuoteAdminNotes(selectedQuote.id, val);
                            if (res.success) {
                              toast.success("Lưu ghi chú Admin thành công!");
                              setLocalQuotes((prev) => prev.map((q) => q.id === selectedQuote.id ? { ...q, admin_notes: val } : q));
                              router.refresh();
                            } else {
                              toast.error("Lỗi lưu ghi chú: " + (res.error ?? "Không rõ"));
                            }
                          }}
                          className="inline-flex justify-center rounded bg-slate-800 text-white px-2 py-1 text-[10px] font-semibold hover:bg-slate-700 transition"
                        >
                          Lưu ghi chú Admin
                        </button>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 block font-semibold">Ghi chú bán hàng (Sales Notes)</span>
                        <textarea
                          key={`sales-notes-${selectedQuote.id}`}
                          className="w-full rounded border border-slate-200 p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                          rows={2}
                          defaultValue={selectedQuote.sales_notes || ""}
                          id={`sales-notes-${selectedQuote.id}`}
                          placeholder="Ghi chú cuộc gọi, gửi báo giá chi tiết, tiến độ deal..."
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            const textarea = document.getElementById(`sales-notes-${selectedQuote.id}`) as HTMLTextAreaElement;
                            const val = textarea?.value || "";
                            const res = await updateQuoteSalesNotes(selectedQuote.id, val);
                            if (res.success) {
                              toast.success("Lưu ghi chú Bán hàng thành công!");
                              setLocalQuotes((prev) => prev.map((q) => q.id === selectedQuote.id ? { ...q, sales_notes: val } : q));
                              router.refresh();
                            } else {
                              toast.error("Lỗi lưu ghi chú: " + (res.error ?? "Không rõ"));
                            }
                          }}
                          className="inline-flex justify-center rounded bg-indigo-600 text-white px-2 py-1 text-[10px] font-semibold hover:bg-indigo-700 transition"
                        >
                          Lưu ghi chú Bán hàng
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workflow Actions */}
                {(workflowTransitions[selectedQuote.status] ?? []).length > 0 && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 space-y-3">
                    <h5 className="font-bold text-[10px] uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                      <Activity className="size-3.5" /> Hành động tiếp theo
                    </h5>
                    <div>
                      <input
                        className="input-pd text-xs mb-2"
                        placeholder="Ghi chú nội bộ (tùy chọn)..."
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(workflowTransitions[selectedQuote.status] ?? []).map((action) => (
                        <button
                          key={action.status}
                          type="button"
                          disabled={isUpdatingStatus}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition disabled:opacity-60 ${
                            action.variant === "success" ? "bg-green-600 text-white border-green-600 hover:bg-green-700" :
                            action.variant === "danger" ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" :
                            "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
                          }`}
                          onClick={() => handleStatusTransition(selectedQuote.id, action.status)}
                        >
                          {isUpdatingStatus ? "Đang xử lý..." : action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline lịch sử xử lý */}
                <div className="border-t pt-4">
                  <QuoteTimeline quoteId={selectedQuote.id} />
                </div>

                {/* Actions */}
                <div className="border-t pt-3 flex flex-wrap gap-2 justify-end">
                  <button
                    type="button"
                    className="button-pd-outline py-1 px-2.5 text-xs flex items-center gap-1 bg-indigo-50 border-indigo-200 text-indigo-700 hover:text-indigo-900"
                    onClick={() => setShowEmailDraft(true)}
                  >
                    <Mail className="size-3.5" />
                    Xem mẫu email tư vấn
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed bg-slate-50 min-h-[480px] flex flex-col justify-center items-center p-8 text-center text-slate-400">
              <FileText className="size-10 mb-3" />
              <p className="font-semibold text-sm">Vui lòng chọn một yêu cầu báo giá từ danh sách bên trái để kiểm duyệt.</p>
            </div>
          )}
        </div>
      </div>

      {showEmailDraft && selectedQuote && (
        <div className="fixed inset-0 z-[calc(var(--z-modal)+1)] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-5 max-w-lg w-full border shadow-xl flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-heading font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="size-4 text-indigo-600" />
                Mẫu Email báo giá gợi ý
              </h4>
              <button type="button" className="text-slate-400 hover:text-slate-600" onClick={() => setShowEmailDraft(false)}>
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3 text-xs">
              <div><span className="text-slate-400 font-bold block">Gửi tới:</span><span className="text-slate-800 font-semibold">{selectedQuote.email || "Khách hàng (chưa có email)"}</span></div>
              <div><span className="text-slate-400 font-bold block">Tiêu đề:</span><span className="text-slate-800 font-semibold">Phương Đông Showroom - Phản hồi yêu cầu tư vấn báo giá</span></div>
              <div className="bg-slate-50 p-3 rounded border font-serif text-slate-700 leading-relaxed select-all whitespace-pre-line">
                {`Chào anh/chị ${selectedQuote.full_name},

Cảm ơn anh/chị đã gửi yêu cầu tư vấn đến Showroom Phương Đông.

Chúng tôi đã ghi nhận yêu cầu của anh/chị cho nội dung ${selectedQuote.service ?? "tư vấn sản phẩm"} vào ngày ${new Date(selectedQuote.created_at).toLocaleDateString("vi-VN")}.

Đội ngũ tư vấn sẽ chủ động liên hệ trong thời gian sớm nhất để gửi thông tin phù hợp.

Trân trọng,
Đội ngũ CSKH Phương Đông.`}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MediaPage({ uploadMode }: { uploadMode?: boolean }) {
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

function SettingsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Cài đặt doanh nghiệp"
        description="Cấu hình vận hành cho nhận diện thương hiệu, liên hệ, liên kết mạng xã hội, mặc định SEO, tích hợp và trạng thái bảo mật bí mật."
      />
      <SettingsOperationsPanel />
    </div>
  );
}

function UsersPage({
  createMode,
  profiles = [],
  total = 0,
}: {
  createMode?: boolean;
  profiles?: AdminUser[];
  total?: number;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState("editor");
  const [editActive, setEditActive] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const startEdit = (user: AdminUser) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditActive(user.is_active);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingUser.id, role: editRole, isActive: editActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Cập nhật quyền thành viên thành công!");
        setEditingUser(null);
        router.refresh();
      } else {
        toast.error(data.error || "Lỗi khi cập nhật tài khoản.");
      }
    } catch (err) {
      toast.error("Lỗi kết nối tới máy chủ.");
    } finally {
      setIsUpdating(false);
    }
  };

  const ROLE_OPTIONS = [
    { value: "admin", label: "Quản trị viên" },
    { value: "editor", label: "Biên tập viên" },
  ];

  const filterConfigs: FilterConfig[] = [
    { type: "select", key: "role", label: "Vai trò", options: ROLE_OPTIONS, placeholder: "Tất cả vai trò" },
    { type: "boolean", key: "isActive", label: "Hoạt động" },
    { type: "date", key: "dateFrom", label: "Từ ngày" },
    { type: "date", key: "dateTo", label: "Đến ngày" },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý người dùng và vai trò"
        description="Tạo tài khoản chỉ dành cho quản trị viên. Biên tập viên chỉ quản lý nội dung có thể xuất bản theo mô hình vai trò A."
        actionHref="/admin/users?create=1"
        actionLabel="Thêm người dùng"
      />

      <DataView
        data={profiles}
        totalCount={total}
        filterConfigs={filterConfigs}
        searchPlaceholder="Tên, email người dùng..."
        defaultSort="created_at"
        defaultDir="desc"
        defaultLimit={20}
        disableGrid={true}
        columns={[
          { key: "email", label: "Người dùng", width: "1.5fr", sortable: true },
          { key: "role", label: "Vai trò", width: "1.2fr", sortable: true },
          { key: "created_at", label: "Ngày tham gia", width: "1fr", sortable: true },
          { key: "last_login_at", label: "Đăng nhập cuối", width: "1.2fr", sortable: true },
          { key: "is_active", label: "Trạng thái", width: "100px", sortable: true },
          { key: "actions", label: "Thao tác", width: "80px", sortable: false },
        ]}
        renderListRow={(item) => {
          const profile = item as AdminUser;
          const roleLabel = profile.role === "admin" ? "Quản trị viên" : "Biên tập viên";
          const scope = profile.role === "admin"
            ? "Toàn quyền quản trị"
            : "Chỉ quản lý nội dung xuất bản";
          return (
            <div key={profile.id || profile.email} className="grid items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-50" style={{ gridTemplateColumns: "1.5fr 1.2fr 1fr 1.2fr 100px 80px" }}>
              <div>
                <p className="font-semibold text-slate-800 text-sm truncate">{profile.email}</p>
                {profile.full_name && <p className="text-xs text-slate-400 truncate">{profile.full_name}</p>}
              </div>
              <div>
                <span className="text-xs text-slate-600 font-semibold">{roleLabel}</span>
                <p className="text-[10px] text-slate-400">{scope}</p>
              </div>
              <span className="text-xs text-slate-500" suppressHydrationWarning>
                {profile.created_at ? new Date(profile.created_at).toLocaleDateString("vi-VN") : ""}
              </span>
              <span className="text-xs text-slate-500" suppressHydrationWarning>
                {getRelativeTimeString(profile.last_login_at)}
              </span>
              <StatusBadge status={profile.is_active ? "active" : "inactive"} />
              <button 
                onClick={() => startEdit(profile)}
                className="admin-edit-action flex h-8 w-fit px-2 items-center justify-center gap-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-primary transition-colors text-xs"
              >
                <Pencil className="size-3.5" />Sửa
              </button>
            </div>
          );
        }}
        renderGridCard={() => null}
      />

      <AdminRouteDialog
        open={Boolean(createMode)}
        returnHref="/admin/users"
        title="Thêm người dùng CMS"
        description="Gán vai trò quản trị viên hoặc biên tập viên mà không để lộ cài đặt đặc quyền cho tài khoản biên tập viên."
        size="wide"
      >
        <EntityCreateForm kind="user" />
      </AdminRouteDialog>

      {/* Edit User Modal Overlay */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="w-full max-w-[480px] bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl animate-in zoom-in duration-200 text-slate-900">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Hiệu chỉnh quyền thành viên</h3>
                <p className="text-xs text-slate-500 mt-1">Thay đổi vai trò và trạng thái truy cập của {editingUser.email}</p>
              </div>
              <button 
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors p-1"
              >
                <X className="size-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid gap-2">
                <span className="label-pd">Vai trò</span>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Biên tập viên - quản lý nội dung xuất bản</SelectItem>
                    <SelectItem value="admin">Quản trị viên - toàn quyền quản trị</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-start gap-3 rounded-[var(--radius-card)] border border-slate-200 bg-white p-3 text-sm">
                <input 
                  className="mt-1 cursor-pointer" 
                  type="checkbox" 
                  checked={editActive} 
                  onChange={(e) => setEditActive(e.target.checked)} 
                />
                <span>
                  <strong className="block text-slate-900 font-semibold">Tài khoản đang hoạt động</strong>
                  <span className="text-slate-500 text-xs mt-0.5 block">Biên tập viên bị tắt không thể truy cập CMS.</span>
                </span>
              </label>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer text-slate-700 bg-white"
                  disabled={isUpdating}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm font-medium bg-primary text-white hover:bg-primary/90 rounded-lg transition cursor-pointer"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PromotionsPage({
  createMode,
  promotions = [],
  total = 0,
}: {
  createMode?: boolean;
  promotions?: AdminPromotion[];
  total?: number;
}) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("edit");
  const [isDeleting, setIsDeleting] = useState(false);

  const [promoToDelete, setPromoToDelete] = useState<AdminPromotion | null>(null);

  function PromoStatusPopover({ promo, onStatusChange }: { promo: AdminPromotion; onStatusChange: (status: string) => void }) {
    const [open, setOpen] = useState(false);
    
    const statusOptions = [
      { value: "draft", label: "Bản nháp", description: "Không hiển thị trên site", color: "bg-slate-400" },
      { value: "published", label: "Đã xuất bản", description: "Hiển thị công khai", color: "bg-emerald-500" },
      { value: "archived", label: "Lưu trữ", description: "Ẩn nhưng bảo toàn dữ liệu", color: "bg-amber-500" }
    ];

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="cursor-pointer focus:outline-none select-none hover:opacity-80 active:scale-95 transition-all">
            <StatusBadge status={promo.status} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-1.5 bg-white border border-slate-200 shadow-lg rounded-xl z-[200] animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="flex flex-col gap-1">
            <span className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
              Chuyển trạng thái
            </span>
            {statusOptions.map((opt) => {
              const isActive = promo.status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-all ${
                    isActive 
                      ? "bg-slate-50 text-slate-900" 
                      : "hover:bg-slate-50/80 text-slate-600 hover:text-slate-900"
                  }`}
                  onClick={async () => {
                    if (!isActive) {
                      onStatusChange(opt.value);
                    }
                    setOpen(false);
                  }}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      <span className={`size-1.5 rounded-full ${opt.color}`} />
                      {opt.label}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">
                      {opt.description}
                    </span>
                  </div>
                  {isActive && (
                    <Check className="size-3.5 text-emerald-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  const STATUS_OPTIONS = [
    { value: "draft", label: "Bản nháp" },
    { value: "published", label: "Đã xuất bản" },
    { value: "archived", label: "Lưu trữ" },
  ];

  const filterConfigs: FilterConfig[] = [
    { type: "select", key: "status", label: "Trạng thái", options: STATUS_OPTIONS, placeholder: "Tất cả trạng thái" },
    { type: "boolean", key: "isActive", label: "Hiệu lực" },
    {
      type: "select",
      key: "discountType",
      label: "Loại giảm giá",
      options: [
        { value: "percentage", label: "Phần trăm (%)" },
        { value: "fixed", label: "Số tiền cố định" }
      ],
      placeholder: "Tất cả loại"
    },
    { type: "date", key: "dateFrom", label: "Từ ngày" },
    { type: "date", key: "dateTo", label: "Đến ngày" },
  ];

  const isPromoActive = (promo: AdminPromotion | null) => {
    if (!promo) return false;
    if (promo.status !== "published") return false;
    const now = new Date();
    if (promo.start_at && new Date(promo.start_at) > now) return false;
    if (promo.end_at && new Date(promo.end_at) < now) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý khuyến mãi"
        description="Vận hành các chương trình khuyến mãi, combo giảm giá, chiết khấu và thiết lập thời hạn hiệu lực."
        actionHref="/admin/promotions?create=1"
        actionLabel="Thêm khuyến mãi"
      />

      <DataView
        data={promotions}
        totalCount={total}
        filterConfigs={filterConfigs}
        searchPlaceholder="Tìm theo mã code hoặc tiêu đề..."
        defaultSort="created_at"
        defaultDir="desc"
        defaultLimit={20}
        columns={[
          { key: "code", label: "Mã khuyến mãi", width: "1fr", sortable: true },
          { key: "title", label: "Tiêu đề", width: "2fr", sortable: false },
          { key: "discount_percentage", label: "Chiết khấu / Giá", width: "120px", sortable: true },
          { key: "duration", label: "Thời hạn hiệu lực", width: "1.2fr", sortable: false },
          { key: "status", label: "Trạng thái", width: "120px", sortable: true },
          { key: "actions", label: "Thao tác", width: "120px", sortable: false },
        ]}
        renderListRow={(item) => {
          const promo = item as AdminPromotion;
          const start = promo.start_at ? new Date(promo.start_at).toLocaleDateString("vi-VN") : "—";
          const end = promo.end_at ? new Date(promo.end_at).toLocaleDateString("vi-VN") : "—";
          return (
            <div key={promo.id} className="grid items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-50" style={{ gridTemplateColumns: "1fr 2fr 120px 1.2fr 120px 120px" }}>
              <span className="font-semibold text-slate-800 text-sm font-mono">{promo.code}</span>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{promo.title_vi}</p>
                {promo.title_en && <p className="text-xs text-slate-400">{promo.title_en}</p>}
              </div>
              <span className="font-bold text-red-600 text-sm">
                {promo.discount_percentage ? `-${promo.discount_percentage}%` : promo.combo_price ? `${promo.combo_price.toLocaleString("vi-VN")} ₫` : "—"}
              </span>
              <span className="text-xs text-slate-500" suppressHydrationWarning>{start} - {end}</span>
              <PromoStatusPopover
                promo={promo}
                onStatusChange={async (newStatus) => {
                  const res = await updatePromotionStatus(promo.id, newStatus);
                  if (res.success) {
                    toast.success("Cập nhật trạng thái thành công!");
                    router.refresh();
                  } else {
                    toast.error("Cập nhật thất bại: " + (res.error ?? "Không rõ"));
                  }
                }}
              />
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/admin/promotions?edit=${promo.code || promo.id}`}
                  title="Chỉnh sửa"
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
                >
                  <Pencil className="size-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setPromoToDelete(promo)}
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
          const promo = item as AdminPromotion;
          const start = promo.start_at ? new Date(promo.start_at).toLocaleDateString("vi-VN") : "—";
          const end = promo.end_at ? new Date(promo.end_at).toLocaleDateString("vi-VN") : "—";
          return (
            <article key={promo.id} className="card-pd interactive-card p-4 flex flex-col justify-between h-[180px]">
              <div>
                <div className="flex items-center justify-between">
                  <code className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-indigo-700">{promo.code}</code>
                  <StatusBadge status={promo.status} />
                </div>
                <div className="mt-3 space-y-1">
                  <h4 className="font-semibold text-sm text-slate-800 line-clamp-1">{promo.title_vi}</h4>
                  <p className="text-xs text-slate-500 font-bold text-red-600">
                    {promo.discount_percentage ? `Giảm ${promo.discount_percentage}%` : promo.combo_price ? `${promo.combo_price.toLocaleString("vi-VN")} ₫` : "Combo độc quyền"}
                  </p>
                  <p className="text-[11px] text-slate-400" suppressHydrationWarning>{start} – {end}</p>
                </div>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-100 flex justify-between items-center">
                <Link href={`/admin/promotions?edit=${promo.code || promo.id}`} className="admin-edit-action inline-flex items-center gap-1 text-xs">
                  <Pencil className="size-3" />Chỉnh sửa
                </Link>
                <button
                  onClick={() => setPromoToDelete(promo)}
                  className="text-slate-400 hover:text-red-600 transition-colors text-xs inline-flex items-center gap-0.5"
                >
                  <Trash2 className="size-3.5" />Xóa
                </button>
              </div>
            </article>
          );
        }}
      />

      {/* Create Dialog */}
      <AdminRouteDialog
        open={Boolean(createMode)}
        returnHref="/admin/promotions"
        title="Thêm khuyến mãi mới"
        description="Thiết lập mã code, chiết khấu phần trăm, tiêu đề song ngữ và thời hạn khuyến mãi."
        size="full"
      >
        <EntityCreateForm kind="promotion" />
      </AdminRouteDialog>

      {/* Edit Dialog */}
      <AdminRouteDialog
        open={Boolean(editId)}
        returnHref="/admin/promotions"
        title="Hiệu chỉnh khuyến mãi"
        description="Cập nhật thông tin chi tiết chương trình khuyến mãi và thời hạn hiệu lực."
        size="full"
      >
        <EntityCreateForm kind="promotion" idOrSlug={editId || undefined} />
      </AdminRouteDialog>

      <AlertDialog open={promoToDelete !== null} onOpenChange={(open) => { if (!open) setPromoToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa khuyến mãi</AlertDialogTitle>
            <AlertDialogDescription>
              {isPromoActive(promoToDelete) ? (
                <div className="space-y-3">
                  <p className="text-slate-700">Bạn có chắc muốn xóa chương trình khuyến mãi <strong>{promoToDelete?.title_vi}</strong>?</p>
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-800 text-xs font-semibold">
                    Cảnh báo: Chương trình khuyến mãi này đang diễn ra. Xóa sẽ chấm dứt hiệu lực áp dụng trên mọi sản phẩm ngay lập tức.
                  </div>
                </div>
              ) : (
                <span>
                  Bạn có chắc muốn xóa chương trình khuyến mãi <strong>{promoToDelete?.title_vi}</strong>? Hành động này không thể hoàn tác.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (!promoToDelete) return;
              setIsDeleting(true);
              try {
                const res = await deleteAdminPromotion(promoToDelete.id);
                if (res.success) {
                  toast.success("Xóa khuyến mãi thành công!");
                  router.refresh();
                } else {
                  toast.error("Xóa thất bại: " + (res.error ?? "Không xác định"));
                }
              } catch (err) {
                toast.error("Đã xảy ra lỗi khi xóa: " + String(err));
              } finally {
                setIsDeleting(false);
                setPromoToDelete(null);
              }
            }} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

function ProductOperationsTable({ products = [] }: { products?: AdminProduct[] }) {
  return (
    <div className="surface-soft overflow-hidden">
      <div className="grid grid-cols-[1fr_160px_120px_120px_100px] bg-surface-container/80 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-primary max-lg:hidden">
        <span>Sản phẩm</span>
        <span>Danh mục</span>
        <span>Trạng thái</span>
        <span>Sẵn sàng</span>
        <span className="text-right">Thao tác</span>
      </div>
      {products.length === 0 ? (
        <p className="p-8 text-center text-sm text-slate-400">Chưa có sản phẩm nào.</p>
      ) : (
        products.map((product, index) => (
          <div
            key={product.id}
            className="grid gap-4 border-t border-outline-variant/25 px-5 py-4 transition-colors hover:bg-surface-container-lowest/70 lg:grid-cols-[1fr_160px_120px_120px_100px] lg:items-center"
          >
            <div className="flex gap-4">
              {(product.primary_media as any)?.url ? (
                <RemoteImage
                  src={(product.primary_media as any).url}
                  alt={product.name}
                  className="size-16 rounded bg-slate-100 shrink-0 relative"
                />
              ) : (
                <div className="size-16 rounded bg-slate-100 shrink-0" />
              )}
              <div>
                <h3 className="font-heading text-lg font-semibold">{product.name}</h3>
                <p className="text-sm italic text-secondary">{product.summary}</p>
                <p className="mt-1 text-xs text-outline">{product.reference_code ?? product.slug}</p>
              </div>
            </div>
            <span>{product.category_name}</span>
            <StatusPill status={product.status} />
            <span className={`status-pill w-fit text-[11px] ${index < 2 ? "status-success" : "status-warning"}`}>
              {index < 2 ? "Sẵn sàng" : "Thiếu tiếng Anh/SEO"}
            </span>
            <div className="lg:text-right">
              <Link href={`/admin/products?edit=${product.slug || product.id}`} className="admin-edit-action">
                <Pencil className="size-3" />
                Chỉnh sửa
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function BlogQueue({ posts = [] }: { posts?: AdminBlogPost[] }) {
  return (
    <section className="surface-soft p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start border-b pb-3 mb-4">
        <div>
          <p className="label-pd">Hàng đợi biên tập</p>
          <h2 className="admin-section-title-pd mt-2 text-lg">Bài viết cần kiểm duyệt</h2>
        </div>
      </div>
      {posts.length === 0 ? (
        <p className="p-8 text-center text-sm text-slate-400">Chưa có bài viết nào.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <article key={post.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">{post.category_name}</span>
                  <StatusPill status={post.status} />
                </div>
                <div className="flex gap-4">
                  {(post.cover_media as any)?.url ? (
                    <RemoteImage
                      src={(post.cover_media as any).url}
                      alt={post.title}
                      className="size-16 rounded-lg bg-slate-100 shrink-0 relative"
                    />
                  ) : (
                    <div className="size-16 rounded-lg bg-slate-100 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-800 text-sm line-clamp-2">{post.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-1" suppressHydrationWarning>{post.published_at ? new Date(post.published_at).toLocaleDateString("vi-VN") : "Chưa xuất bản"}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-500 line-clamp-2">{post.excerpt}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Link
                  href={`/admin/blog?edit=${post.slug}`}
                  className="admin-edit-action"
                >
                  <Pencil className="size-3" />
                  Chỉnh sửa
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function AdminPageHeader({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div>
        <span className="admin-chip-pd">
          <Sparkles className="size-3.5" />
          Không gian quản trị
        </span>
        <h1 className="admin-title-pd mt-3 md:text-2xl">{title}</h1>
        <p className="type-caption mt-2 max-w-3xl text-[13px] text-[var(--admin-text-muted)]">{description}</p>
      </div>
      {actionHref && actionLabel ? (
        <Link className="button-pd shrink-0" href={actionHref}>
          {actionLabel.toLowerCase().startsWith("back") ? <ArrowLeft className="size-4" /> : <Plus className="size-4" />}
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

interface ProductFilterState {
  category: string;
  status: string;
  search: string;
}

function ProductFilterCard({
  value,
  onChange,
  categories,
}: {
  value: ProductFilterState;
  onChange: (val: ProductFilterState) => void;
  categories?: { value: string; label: string }[];
}) {
  const hasActive = value.category !== "all" || value.status !== "all" || value.search !== "";

  const categoryOptions = [
    { value: "all", label: "Tất cả danh mục" },
    ...(categories ?? [
      { value: "wood", label: "Nội thất gỗ" },
      { value: "sanitary", label: "Thiết bị vệ sinh" },
    ]),
  ];

  return (
    <div className="surface-panel grid gap-4 p-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
      <label className="grid gap-2">
        <span className="label-pd">Danh mục</span>
        <PremiumSelect
          name="category"
          value={value.category}
          ariaLabel="Danh mục"
          placeholder="Danh mục"
          tone="admin"
          options={categoryOptions}
          onValueChange={(v) => onChange({ ...value, category: v })}
        />
      </label>
      <label className="grid gap-2">
        <span className="label-pd">Trạng thái</span>
        <PremiumSelect
          name="status"
          value={value.status}
          ariaLabel="Trạng thái"
          placeholder="Trạng thái"
          tone="admin"
          options={[
            { value: "all", label: "Tất cả trạng thái" },
            { value: "draft", label: "Bản nháp" },
            { value: "published", label: "Đã xuất bản" },
            { value: "archived", label: "Đã lưu trữ" },
          ]}
          onValueChange={(v) => onChange({ ...value, status: v })}
        />
      </label>
      <label className="grid gap-2">
        <span className="label-pd">Tìm kiếm</span>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
          <input
            className="input-pd pl-9"
            placeholder="Tên, mã, đường dẫn..."
            value={value.search}
            onChange={(e) => onChange({ ...value, search: e.target.value })}
          />
        </div>
      </label>
      {hasActive ? (
        <button
          type="button"
          className="button-pd-outline self-end"
          onClick={() => onChange({ category: "all", status: "all", search: "" })}
        >
          <X className="size-4" /> Xóa lọc
        </button>
      ) : (
        <div className="self-end h-10" />
      )}
    </div>
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
