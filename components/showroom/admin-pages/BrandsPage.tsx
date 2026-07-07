"use client";

import { useState } from "react";
import { ExcelImportExportModal } from "../admin-excel";
import { useToast } from "@/components/providers/toast-provider";
import Link from "next/link";
import {
  Pencil,
  Globe,
  Trash2,
  FileSpreadsheet,
  ExternalLink,
} from "lucide-react";


import {
  getBrandProductCount,
} from "@/lib/supabase/admin-queries";
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


import { deleteAdminBrand } from "@/lib/supabase/brands-mutations";


import {
  AdminRouteDialog,
  EntityCreateForm,
} from "../admin-workflows";
import { DataView } from "@/components/admin/DataView";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { type FilterConfig } from "@/components/admin/FilterBar";



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
  AdminPageHeader
} from "./SharedComponents";

function BrandLogo({ url, alt, className }: { url?: string | null; alt: string; className?: string }) {
  const [error, setError] = useState(false);
  if (url && !error) {
    const src = url.startsWith("http://local-assets") ? url.replace("http://local-assets", "") : url;
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setError(true)}
        className={className}
      />
    );
  }
  const isSize12 = className?.includes("size-12") || className?.includes("h-12");
  const sizeClass = isSize12 ? "size-12" : "size-10";
  return (
    <div className={`${sizeClass} rounded border bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-semibold shrink-0`}>
      Logo
    </div>
  );
}

export function BrandsPage({ createMode, brands = [], total = 0 }: { createMode?: boolean; brands?: Brand[]; total?: number }) {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");
  const { toast, showLoading, hideLoading, showAlert } = useToast();
  const router = useRouter();

  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [brandProductCount, setBrandProductCount] = useState(0);
  const [brandStep, setBrandStep] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [excelModalOpen, setExcelModalOpen] = useState(false);

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

      {/* Excel Import/Export Toolbar */}
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
              <BrandLogo url={brand.logo_url} alt={brand.name?.vi || "Logo"} className="size-10 rounded border object-contain bg-slate-50 shrink-0" />
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
            <div key={brand.id} className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-full">
              {/* Card Header & Logo */}
              <div className="p-4 flex-1">
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Thứ tự: {brand.sort_order ?? "—"}
                  </span>
                  <StatusBadge status={brand.status} />
                </div>
                
                <div className="flex gap-3.5 items-start">
                  <div className="size-14 rounded-xl border border-slate-200/60 bg-slate-50 flex items-center justify-center p-1.5 shrink-0 shadow-inner">
                    <BrandLogo url={brand.logo_url} alt={brand.name?.vi || "Logo"} className="size-full object-contain bg-slate-50 rounded-lg" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="font-bold text-slate-800 text-sm leading-snug truncate group-hover:text-primary transition-colors">
                      {brand.name?.vi || "—"}
                    </h4>
                    {brand.name?.en && brand.name?.en !== brand.name?.vi && (
                      <p className="text-xs text-slate-400 truncate">{brand.name.en}</p>
                    )}
                    {brand.origin && (
                      <span className="inline-block text-[9px] uppercase tracking-wider text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                        {brand.origin}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="p-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-1.5">
                <Link
                  href={`/admin/brands?edit=${brand.slug || brand.id}`}
                  title="Chỉnh sửa thương hiệu"
                  className="flex-1 min-h-8 rounded-lg bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold text-xs flex items-center justify-center gap-1 transition"
                >
                  <Pencil className="size-3.5" />
                  Sửa
                </Link>
                {brand.status === "published" && (
                  <a
                    href={`/products?brand=${brand.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Xem sản phẩm trên website"
                    className="size-8 rounded-lg bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center transition shrink-0"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
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
                  title="Xóa thương hiệu"
                  className="size-8 rounded-lg bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center transition shrink-0"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          );
        }}
        emptyMessage="Chưa có thương hiệu nào."
        emptyIcon={<Globe className="size-10 text-slate-200" />}
      />

      <ExcelImportExportModal
        isOpen={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        type="brand"
        onSuccess={() => router.refresh()}
      />

      {/* Create Dialog */}
      <AdminRouteDialog
        open={Boolean(createMode)}
        returnHref="/admin/brands"
        title="Thêm thương hiệu"
        description="Tạo thương hiệu đối tác mới kèm logo, nguồn gốc xuất xứ và thông tin mô tả."
        size="standard"
      >
        <EntityCreateForm kind="brand" />
      </AdminRouteDialog>

      {/* Edit Dialog */}
      <AdminRouteDialog
        open={Boolean(editSlug)}
        returnHref="/admin/brands"
        title="Hiệu chỉnh thương hiệu"
        description="Chỉnh sửa chi tiết thương hiệu đối tác, thay đổi logo và cấu hình hiển thị."
        size="standard"
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
                  showLoading("Đang xóa thương hiệu...");
                  try {
                    const res = await deleteAdminBrand(brandToDelete.id);
                    hideLoading();
                    if (res.success) {
                      showAlert("Thành công", `Đã xóa thương hiệu "${brandToDelete.name?.vi}" thành công!`, "success", () => {
                        router.refresh();
                      });
                    } else {
                      showAlert("Thất bại", "Xóa thất bại: " + (res.error ?? "Không xác định"), "error");
                    }
                  } catch (err) {
                    hideLoading();
                    showAlert("Lỗi hệ thống", "Đã xảy ra lỗi khi xóa: " + String(err), "error");
                  } finally {
                    setBrandToDelete(null);
                    setBrandStep(1);
                  }
                }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Xóa
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

