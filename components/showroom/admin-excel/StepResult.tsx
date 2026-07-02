"use client";

import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

interface ImportResult {
  total_rows: number;
  success_count: number;
  error_count: number;
  errors: Array<{ row: number; field: string; value: string; message: string }>;
  created_ids: string[];
  updated_ids: string[];
}

interface StepResultProps {
  importResults: ImportResult;
  handleDownloadErrorReport: () => void;
}

export function StepResult({ importResults, handleDownloadErrorReport }: StepResultProps) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto py-6 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center space-y-4">
        <div className="size-16 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="size-9" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-800">Quy Trình Nhập Dữ Liệu Hoàn Tất!</h3>
          <p className="text-xs text-slate-400 font-medium">Audit logs đã được ghi lại phục vụ tra soát dữ liệu</p>
        </div>

        <div className="grid grid-cols-3 gap-4 border-y border-slate-100 py-4 my-2">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Đã Xử Lý</span>
            <p className="text-xl font-extrabold text-slate-700">{importResults.total_rows}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-emerald-650 uppercase tracking-wider">Thành Công</span>
            <p className="text-xl font-extrabold text-emerald-600">{importResults.success_count}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-red-600 uppercase tracking-wider">Bị Bỏ Qua</span>
            <p className="text-xl font-extrabold text-red-650">{importResults.error_count}</p>
          </div>
        </div>

        {importResults.error_count > 0 ? (
          <div className="bg-amber-50 border border-amber-100 text-amber-900 rounded-xl p-4 text-xs text-left leading-relaxed space-y-2">
            <p className="font-bold flex items-center gap-1.5">
              <AlertCircle className="size-4 text-amber-600" />
              Lưu ý về một số dòng bị bỏ qua
            </p>
            <p className="font-medium text-amber-850">
              Có <b>{importResults.error_count}</b> dòng gặp lỗi không thể thêm vào cơ sở dữ liệu. Nhấn nút dưới đây để tải báo cáo lỗi Excel chi tiết, sửa lỗi rồi import lại riêng các dòng đó.
            </p>
            <button
              type="button"
              onClick={handleDownloadErrorReport}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 transition pt-1"
            >
              📥 Tải báo cáo chi tiết các lỗi (.xlsx)
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-400 font-medium">
            100% dữ liệu hàng của bạn đã được kiểm chuẩn và nạp vào database hoàn hảo!
          </p>
        )}
      </div>
    </div>
  );
}
