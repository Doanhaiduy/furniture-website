"use client";

import React from "react";
import { Download, Upload, RefreshCw, FileSpreadsheet } from "lucide-react";

interface StepUploadProps {
  loading: boolean;
  file: File | null;
  entityName: string;
  handleDownloadTemplate: () => void;
  handleExportData: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export function StepUpload({
  loading,
  file,
  entityName,
  handleDownloadTemplate,
  handleExportData,
  handleFileChange,
}: StepUploadProps) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4 animate-in fade-in duration-200">
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Download template */}
        <div className="border border-slate-200/80 rounded-xl p-5 flex items-start gap-4 hover:bg-slate-50 transition bg-white shadow-sm">
          <div className="size-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 shrink-0 mt-0.5">
            <Download className="size-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">Tải File Excel Mẫu Mới Nhất</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tải tệp mẫu đã được cấu hình dữ liệu liên kết động thời gian thực (realtime) từ Database hệ thống.
            </p>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition pt-2"
            >
              Tải mẫu template trống (.xlsx)
            </button>
          </div>
        </div>

        {/* Export current data */}
        <div className="border border-slate-200/80 rounded-xl p-5 flex items-start gap-4 hover:bg-slate-50 transition bg-white shadow-sm">
          <div className="size-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
            <FileSpreadsheet className="size-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">Xuất Dữ Liệu Hiện Tại</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Xuất toàn bộ bản ghi dữ liệu hiện có trong hệ thống của module này ra định dạng tệp Excel.
            </p>
            <button
              type="button"
              onClick={handleExportData}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-850 transition pt-2"
            >
              Tải file export (.xlsx)
            </button>
          </div>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-400 transition bg-white p-10 text-center relative group shadow-sm flex flex-col items-center justify-center gap-4 h-64">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={loading}
        />
        <div className="size-14 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:border-indigo-100 transition duration-300">
          {loading ? (
            <RefreshCw className="size-7 animate-spin text-indigo-650" />
          ) : (
            <Upload className="size-7" />
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-700">
            {loading ? "Đang đọc và kiểm tra tệp tin của bạn..." : "Kéo thả tệp tin Excel tại đây hoặc click để chọn"}
          </p>
          <p className="text-xs text-slate-450 font-medium">Hỗ trợ tệp tin mẫu định dạng .xlsx tối đa 1,000 dòng</p>
        </div>

        {file && !loading && (
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs px-3.5 py-1.5 rounded-full font-bold">
            <FileSpreadsheet className="size-3.5 shrink-0" />
            {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </div>
        )}
      </div>
    </div>
  );
}
