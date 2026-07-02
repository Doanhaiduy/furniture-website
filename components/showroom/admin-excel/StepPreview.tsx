"use client";

import React from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

interface ValidationResult {
  total_rows: number;
  success_count: number;
  error_count: number;
  errors: Array<{ row: number; field: string; value: string; message: string }>;
  preview: Array<{ row: number; name: string; isValid: boolean; errors: string[] }>;
}

interface StepPreviewProps {
  validationResults: ValidationResult;
}

export function StepPreview({ validationResults }: StepPreviewProps) {
  return (
    <div className="space-y-4 h-full flex flex-col animate-in fade-in duration-200">
      {/* Summary Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm shrink-0">
        <div className="space-y-0.5">
          <h4 className="text-sm font-bold text-slate-800">Kết Quả Kiểm Tra Dữ Liệu Tệp Excel</h4>
          <p className="text-xs text-slate-400 font-medium">Dữ liệu được kiểm chứng tự động với cơ sở dữ liệu hệ thống</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-slate-500 font-bold bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
            Tổng cộng: {validationResults.total_rows} dòng
          </span>
          <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg font-bold">
            Hợp lệ: {validationResults.success_count}
          </span>
          {validationResults.error_count > 0 && (
            <span className="text-red-700 bg-red-50 border border-red-100 px-2.5 py-1 rounded-lg font-bold">
              Lỗi: {validationResults.error_count} dòng
            </span>
          )}
        </div>
      </div>

      {/* Warning box if errors exist */}
      {validationResults.error_count > 0 && (
        <div className="bg-red-50 border border-red-100 text-red-800 rounded-xl p-3.5 flex items-start gap-3 text-xs leading-relaxed shrink-0">
          <AlertCircle className="size-4.5 text-red-650 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Hệ thống phát hiện thấy {validationResults.error_count} dòng dữ liệu không hợp lệ.</p>
            <p className="font-medium text-red-700">
              Bạn có thể chọn <b>"Import các dòng hợp lệ"</b> ở góc bên dưới để tiếp tục import các dòng OK, hoặc nhấn <b>"Tải báo cáo lỗi"</b> để sửa lại file.
            </p>
          </div>
        </div>
      )}

      {/* Preview Table */}
      <div className="flex-1 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col min-h-0">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse text-xs relative">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-555 font-semibold z-10">
              <tr>
                <th className="px-4 py-3 w-16 text-center">Dòng</th>
                <th className="px-4 py-3 w-28 text-center">Kiểm tra</th>
                <th className="px-4 py-3 w-1/4">Tên thực tế</th>
                <th className="px-4 py-3">Chi tiết kiểm tra lỗi dữ liệu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {validationResults.preview.map((res) => (
                <tr
                  key={res.row}
                  className={`hover:bg-slate-50/50 transition-colors ${!res.isValid ? "bg-red-50/10" : "bg-emerald-50/5"}`}
                >
                  <td className="px-4 py-3 font-bold text-slate-500 text-center">{res.row}</td>
                  <td className="px-4 py-3 text-center">
                    {res.isValid ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle className="size-3 shrink-0" /> Hợp lệ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded-full">
                        <AlertCircle className="size-3 shrink-0" /> Không hợp lệ
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-700">{res.name || "—"}</td>
                  <td className="px-4 py-3 text-slate-500 leading-relaxed font-medium">
                    {res.isValid ? (
                      <span className="text-emerald-750 font-semibold">Tất cả dữ liệu cột đều đạt tiêu chuẩn</span>
                    ) : (
                      <ul className="list-disc pl-4 text-red-650 space-y-0.5">
                        {res.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
