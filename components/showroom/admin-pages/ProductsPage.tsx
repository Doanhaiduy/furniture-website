"use client";

import { useState, useEffect } from "react";
import { ExcelImportExportModal } from "../admin-excel";
import { useToast } from "@/components/providers/toast-provider";
import Link from "next/link";
import {
  Pencil,
  Search,
  X,
  Package,
  Star,
  Trash2,
  ExternalLink,
  Check,
  FileSpreadsheet,
} from "lucide-react";


import {
  type AdminProduct,
  type AdminCategory,
} from "@/lib/supabase/admin-queries";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  AlertDialog,
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
  updateProductFeatured,
  updateProductStatus,
} from "@/lib/supabase/mutations";
import {
  StatusPill,
} from "../admin-interactions";
import {
  AdminRouteDialog,
  ContentEditorForm,
} from "../admin-workflows";
import { RemoteImage } from "../remote-image";
import { PremiumSelect } from "../premium-select";
import { DataView } from "@/components/admin/DataView";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { type FilterConfig } from "@/components/admin/FilterBar";
import { useAdminFilters } from "@/lib/hooks/useAdminFilters";



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
  AdminPageHeader,
  getRelativeTimeString
} from "./SharedComponents";

export function ProductsPage({ 
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


