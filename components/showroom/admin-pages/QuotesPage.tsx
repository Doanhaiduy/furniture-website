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

export function QuotesPage({
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
                // Row is a div (not a button): it contains the AssigneePopover trigger, which is
                // itself a <button>, and a <button> inside a <button> is invalid HTML — it caused a
                // hydration error and made the browser reparent the pagination + detail column out
                // to <body> (duplicate detail panel). role/tabIndex/keydown keep it keyboard-usable.
                <div
                  key={quote.id}
                  role="button"
                  tabIndex={0}
                  className={`w-full cursor-pointer text-left grid grid-cols-[1.2fr_1fr_1fr_100px_130px] items-center border-t border-slate-100 px-4 py-3.5 transition-colors hover:bg-slate-50/50 ${
                    selectedQuote?.id === quote.id ? "bg-indigo-50/30" : ""
                  }`}
                  onClick={() => setSelectedQuoteId(quote.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedQuoteId(quote.id);
                    }
                  }}
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
                </div>
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
