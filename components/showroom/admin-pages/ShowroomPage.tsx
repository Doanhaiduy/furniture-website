"use client";

import { useState } from "react";
import { ExcelImportExportModal } from "../admin-excel";
import { useToast } from "@/components/providers/toast-provider";
import Link from "next/link";
import {
  Pencil,
  MapPin,
  Trash2,
  FileSpreadsheet,
  Phone,
  Clock,
  ExternalLink,
} from "lucide-react";


import {
  type AdminShowroom,
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
import {
  deleteAdminShowroom,
} from "@/lib/supabase/mutations";


import {
  AdminRouteDialog,
  EntityCreateForm,
} from "../admin-workflows";
import { RemoteImage } from "../remote-image";
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
            <article key={showroom.id} className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-full">
              {/* Card Image Header */}
              <div className="relative aspect-[16/10] w-full bg-slate-50 overflow-hidden border-b border-slate-100">
                {showroom.primary_media ? (
                  <RemoteImage src={showroom.primary_media as string} alt={showroom.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50">
                    <MapPin className="size-10 text-slate-300" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <StatusBadge status={showroom.status} />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-primary transition-colors flex items-start gap-1.5">
                    <MapPin className="size-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span>{showroom.name}</span>
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed pl-5.5">{showroom.address}</p>
                </div>

                {/* Showroom Details Block */}
                <div className="text-[11px] space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="size-3.5 text-slate-400" />
                    <p><span className="text-slate-450 font-semibold">Hotline:</span> {showroom.hotline}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-3.5 text-slate-400" />
                    <p><span className="text-slate-450 font-semibold">Giờ mở cửa:</span> {showroom.opening_hours ?? "—"}</p>
                  </div>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="p-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-1.5">
                <Link
                  href={`/admin/showrooms?edit=${showroom.code ?? showroom.id}`}
                  title="Chỉnh sửa showroom"
                  className="flex-1 min-h-8 rounded-lg bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold text-xs flex items-center justify-center gap-1 transition"
                >
                  <Pencil className="size-3.5" />
                  Sửa
                </Link>
                {showroom.status === "published" && (
                  <a
                    href={`/showrooms`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Xem trên website"
                    className="size-8 rounded-lg bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center transition shrink-0"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setShowroomToDelete(showroom)}
                  title="Xóa showroom"
                  className="size-8 rounded-lg bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center transition shrink-0"
                >
                  <Trash2 className="size-3.5" />
                </button>
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
