"use client";

import { useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import Link from "next/link";
import {
  Pencil,
  Trash2,
  Check,
  Calendar,
  Ticket,
  ExternalLink,
} from "lucide-react";


import {
  type AdminPromotion,
  deleteAdminPromotion,
  updatePromotionStatus,
} from "@/lib/supabase/admin-queries";
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

export function PromotionsPage({
  createMode,
  promotions = [],
  total = 0,
}: {
  createMode?: boolean;
  promotions?: AdminPromotion[];
  total?: number;
}) {
  const { toast, showLoading, hideLoading, showAlert } = useToast();
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
            <article key={promo.id} className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-full">
              {/* Card Body */}
              <div className="p-4 flex-1 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 bg-indigo-50 px-2 py-0.5 rounded-md text-indigo-700 font-semibold text-xs">
                    <Ticket className="size-3.5" />
                    <code className="font-mono">{promo.code}</code>
                  </div>
                  <StatusBadge status={promo.status} />
                </div>
                
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {promo.title_vi}
                  </h4>
                  <p className="text-xs font-bold text-rose-600">
                    {promo.discount_percentage ? `Giảm ${promo.discount_percentage}%` : promo.combo_price ? `${promo.combo_price.toLocaleString("vi-VN")} ₫` : "Combo độc quyền"}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-50 flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold" suppressHydrationWarning>
                  <Calendar className="size-3.5 text-slate-400" />
                  <span>{start} – {end}</span>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="p-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-1.5">
                <Link
                  href={`/admin/promotions?edit=${promo.code || promo.id}`}
                  title="Chỉnh sửa chương trình"
                  className="flex-1 min-h-8 rounded-lg bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold text-xs flex items-center justify-center gap-1 transition"
                >
                  <Pencil className="size-3.5" />
                  Sửa
                </Link>
                {promo.status === "published" && (
                  <a
                    href={`/promotions`}
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
                  onClick={() => setPromoToDelete(promo)}
                  title="Xóa chương trình"
                  className="size-8 rounded-lg bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center transition shrink-0"
                >
                  <Trash2 className="size-3.5" />
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
        size="standard"
      >
        <EntityCreateForm kind="promotion" />
      </AdminRouteDialog>

      {/* Edit Dialog */}
      <AdminRouteDialog
        open={Boolean(editId)}
        returnHref="/admin/promotions"
        title="Hiệu chỉnh khuyến mãi"
        description="Cập nhật thông tin chi tiết chương trình khuyến mãi và thời hạn hiệu lực."
        size="standard"
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
              showLoading("Đang xóa khuyến mãi...");
              try {
                const res = await deleteAdminPromotion(promoToDelete.id);
                hideLoading();
                if (res.success) {
                  showAlert("Thành công", `Đã xóa khuyến mãi "${promoToDelete.title_vi}" thành công!`, "success", () => {
                    router.refresh();
                  });
                } else {
                  showAlert("Thất bại", "Xóa thất bại: " + (res.error ?? "Không xác định"), "error");
                }
              } catch (err) {
                hideLoading();
                showAlert("Lỗi hệ thống", "Đã xảy ra lỗi khi xóa: " + String(err), "error");
              } finally {
                setPromoToDelete(null);
              }
            }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
