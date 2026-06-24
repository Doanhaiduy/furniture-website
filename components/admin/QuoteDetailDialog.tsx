"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Mail,
  Phone,
  User,
  Building,
  FileText,
  Calendar,
  Sparkle,
  X,
} from "lucide-react";
import { type AdminQuote } from "@/lib/supabase/admin-queries";

type QuoteDetailDialogProps = {
  quote: AdminQuote | null;
  isOpen: boolean;
  onClose: () => void;
};

const quoteStatusLabels: Record<string, string> = {
  new: "Chưa xử lý",
  contacted: "Đang tư vấn",
  qualified: "Đủ điều kiện",
  closed: "Hoàn thành",
  spam: "Thư rác",
};

const quoteStatusColors: Record<string, string> = {
  new: "bg-amber-100 text-amber-800 border-amber-200",
  contacted: "bg-blue-100 text-blue-800 border-blue-200",
  qualified: "bg-emerald-100 text-emerald-800 border-emerald-200",
  closed: "bg-slate-100 text-slate-800 border-slate-200",
  spam: "bg-red-100 text-red-800 border-red-200",
};

export function QuoteDetailDialog({ quote, isOpen, onClose }: QuoteDetailDialogProps) {
  const [showEmailDraft, setShowEmailDraft] = React.useState(false);

  if (!quote) return null;

  const statusLabel = quoteStatusLabels[quote.status] ?? quote.status;
  const statusColor = quoteStatusColors[quote.status] ?? "bg-slate-100 text-slate-800";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl sm:max-w-2xl bg-white p-6 rounded-xl border shadow-xl">
        <DialogHeader className="border-b pb-4 flex flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
              Yêu cầu báo giá • {quote.id}
            </span>
            <DialogTitle className="font-heading font-bold text-lg text-slate-800">
              Chi tiết yêu cầu từ {quote.full_name}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Kiểm duyệt và phản hồi yêu cầu báo giá của khách hàng.
            </DialogDescription>
          </div>
          <Badge className={`px-2.5 py-1 text-xs border ${statusColor} shrink-0`}>
            {statusLabel}
          </Badge>
        </DialogHeader>

        <div className="py-4 space-y-4 text-xs">
          {!quote.email && (
            <div className="rounded-lg bg-orange-50 border border-orange-200 p-3 text-orange-700 flex items-start gap-2">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Thiếu địa chỉ email khách hàng</strong>
                <span className="text-[11px] block mt-0.5">
                  Cần liên hệ qua số điện thoại hoặc bổ sung email để gửi báo giá chi tiết.
                </span>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Contact Info */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
              <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b pb-1">
                <User className="size-3.5 text-slate-400" />
                Thông tin khách hàng
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">Họ tên</span>
                  <strong className="text-sm text-slate-800">{quote.full_name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Số điện thoại</span>
                  <strong className="text-slate-700 font-mono flex items-center gap-1">
                    <Phone className="size-3 text-slate-400" /> {quote.phone}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Email</span>
                  <span className="text-slate-700 font-semibold flex items-center gap-1 break-all">
                    <Mail className="size-3 text-slate-400" /> {quote.email || "Chưa cung cấp"}
                  </span>
                </div>
                {quote.company && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">Công ty</span>
                    <span className="text-slate-700 font-medium flex items-center gap-1">
                      <Building className="size-3 text-slate-400" /> {quote.company}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Request Source Info */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
              <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b pb-1">
                <FileText className="size-3.5 text-slate-400" />
                Thông tin yêu cầu
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">Dịch vụ / Sản phẩm quan tâm</span>
                  <strong className="text-slate-800 text-sm block line-clamp-2">{quote.service ?? "Yêu cầu tư vấn"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Đường dẫn nguồn</span>
                  <span className="text-slate-500 font-mono break-all text-[11px] block">{quote.source_path}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Ngày yêu cầu</span>
                  <span className="text-slate-700 font-semibold flex items-center gap-1">
                    <Calendar className="size-3 text-slate-400" /> {new Date(quote.created_at).toLocaleString("vi-VN")}
                  </span>
                </div>
                {quote.assigned_to && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">Người xử lý</span>
                    <strong className="text-slate-700">{quote.assigned_to}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Message */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2">
            <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b pb-1">
              Lời nhắn từ khách hàng
            </h4>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm bg-white p-3 rounded border border-slate-200">
              {quote.message}
            </p>
          </div>

          {/* Admin Notes */}
          {quote.admin_notes && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2">
              <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b pb-1">
                Ghi chú nội bộ
              </h4>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line bg-amber-50/50 p-3 rounded border border-amber-100">
                {quote.admin_notes}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button
            type="button"
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
            onClick={() => setShowEmailDraft(true)}
          >
            <Mail className="size-4" />
            Mẫu Email báo giá gợi ý
          </Button>
        </DialogFooter>

        {showEmailDraft && (
          <div className="fixed inset-0 z-[calc(var(--z-modal)+2)] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-5 max-w-lg w-full border shadow-2xl flex flex-col max-h-[85vh]">
              <div className="flex justify-between items-center border-b pb-3">
                <h4 className="font-heading font-bold text-slate-800 flex items-center gap-2 text-sm sm:text-base">
                  <Sparkle className="size-4 text-indigo-600" />
                  Mẫu Email phản hồi gợi ý
                </h4>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600 transition"
                  onClick={() => setShowEmailDraft(false)}
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block">Gửi tới:</span>
                  <span className="text-slate-800 font-semibold">{quote.email || "Khách hàng (chưa có email)"}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Tiêu đề:</span>
                  <span className="text-slate-800 font-semibold">
                    Phương Đông Showroom - Phản hồi yêu cầu tư vấn báo giá
                  </span>
                </div>
                <div className="bg-slate-50 p-4 rounded border font-serif text-slate-700 leading-relaxed select-all whitespace-pre-line text-xs sm:text-sm border-slate-200">
                  {`Chào anh/chị ${quote.full_name},

Cảm ơn anh/chị đã gửi yêu cầu tư vấn đến Showroom Phương Đông.

Chúng tôi đã ghi nhận yêu cầu của anh/chị cho dịch vụ/sản phẩm: "${quote.service ?? "Tư vấn sản phẩm"}" vào ngày ${new Date(quote.created_at).toLocaleDateString("vi-VN")}.

Đội ngũ tư vấn sẽ chủ động liên hệ qua số điện thoại ${quote.phone} hoặc email này để hỗ trợ báo giá và thông tin chi tiết nhất đến anh/chị.

Trân trọng,
Đội ngũ CSKH Phương Đông.`}
                </div>
              </div>

              <div className="border-t pt-3 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowEmailDraft(false)}>
                  Đóng mẫu email
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
