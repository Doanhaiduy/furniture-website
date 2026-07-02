"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ExcelJS from "exceljs";
import { FileSpreadsheet, X, ChevronRight, FileX, Play, RefreshCw } from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";
import { StepUpload } from "./admin-excel/StepUpload";
import { StepPreview } from "./admin-excel/StepPreview";
import { StepResult } from "./admin-excel/StepResult";

type EntityType = "showroom" | "category" | "product";

interface ExcelImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: EntityType;
  onSuccess?: () => void;
}

export function ExcelImportExportModal({
  isOpen,
  onClose,
  type,
  onSuccess,
}: ExcelImportExportModalProps) {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [validationResults, setValidationResults] = useState<{
    total_rows: number;
    success_count: number;
    error_count: number;
    errors: Array<{ row: number; field: string; value: string; message: string }>;
    preview: Array<{ row: number; name: string; isValid: boolean; errors: string[] }>;
  } | null>(null);

  const [importResults, setImportResults] = useState<{
    total_rows: number;
    success_count: number;
    error_count: number;
    errors: Array<{ row: number; field: string; value: string; message: string }>;
    created_ids: string[];
    updated_ids: string[];
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Reset modal state on open/close
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFile(null);
      setLoading(false);
      setValidationResults(null);
      setImportResults(null);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const modulePath = type === "product" ? "products" : type === "category" ? "categories" : "showrooms";
  const entityName = type === "product" ? "sản phẩm" : type === "category" ? "danh mục" : "showroom";

  // DOWNLOAD TEMPLATE & EXPORT
  const handleDownloadTemplate = () => {
    window.open(`/api/admin/${modulePath}/import-template`, "_blank");
    toast.success(`Đang tải tệp mẫu của ${entityName}...`);
  };

  const handleExportData = () => {
    window.open(`/api/admin/${modulePath}/export`, "_blank");
    toast.success(`Đang xuất dữ liệu danh sách ${entityName}...`);
  };

  // HANDLERS FOR FILE UPLOAD & VALIDATION (STEP 1 -> STEP 2)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".xlsx") && !selectedFile.name.endsWith(".xls")) {
      toast.error("Vui lòng chọn tệp Excel (.xlsx hoặc .xls)!");
      return;
    }

    setFile(selectedFile);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch(`/api/admin/${modulePath}/import?mode=validate`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Lỗi kiểm tra tệp Excel.");
      }

      setValidationResults(data);
      setStep(2);
      toast.success("Kiểm tra tệp Excel hoàn tất!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Lỗi đọc tệp Excel. Vui lòng kiểm tra lại cấu trúc.");
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  // HANDLERS FOR IMPORT EXECUTION (STEP 2 -> STEP 3)
  const handleExecuteImport = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/admin/${modulePath}/import?mode=commit`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Lỗi thực thi import.");
      }

      setImportResults(data);
      setStep(3);
      toast.success(`Đã import thành công ${data.success_count} dòng!`);
      if (onSuccess && data.success_count > 0) {
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Import thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // DOWNLOAD ERROR REPORT (STEP 3)
  const handleDownloadErrorReport = () => {
    const activeErrors = importResults?.errors || validationResults?.errors;
    if (!activeErrors || activeErrors.length === 0) {
      toast.error("Không có lỗi nào để xuất báo cáo!");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Báo cáo lỗi Import");

    ws.addRow(["Dòng", "Cột/Trường", "Giá trị bị lỗi", "Nội dung thông báo lỗi"]);

    // Header styling
    ws.getRow(1).eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFC0392B" } };
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    });

    activeErrors.forEach((e) => {
      ws.addRow([e.row, e.field, e.value || "", e.message]);
    });

    ws.columns.forEach((col, idx) => {
      if (idx === 3) col.width = 60;
      else col.width = 20;
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Bao_Cao_Loi_Import_${type}_${Date.now()}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 shrink-0">
              <FileSpreadsheet className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Nhập & Xuất Excel: {type === "product" ? "Sản phẩm" : type === "category" ? "Danh mục" : "Showroom"}
              </h3>
              <p className="text-xs text-slate-400 font-medium">Quy trình 3 bước nhập liệu hàng loạt chuẩn hóa dữ liệu tối đa</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Wizard Steps indicator */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex items-center gap-6 justify-center sm:justify-start">
          <div className={`flex items-center gap-2 text-xs font-bold ${step >= 1 ? "text-indigo-600" : "text-slate-400"}`}>
            <span className={`size-5 rounded-full flex items-center justify-center text-[10px] ${step > 1 ? "bg-indigo-600 text-white" : "border-2 border-indigo-600 text-indigo-600"}`}>1</span>
            <span>Tải lên file dữ liệu</span>
          </div>
          <ChevronRight className="size-4 text-slate-300" />
          <div className={`flex items-center gap-2 text-xs font-bold ${step >= 2 ? "text-indigo-600" : "text-slate-400"}`}>
            <span className={`size-5 rounded-full flex items-center justify-center text-[10px] ${step > 2 ? "bg-indigo-600 text-white" : step === 2 ? "border-2 border-indigo-600 text-indigo-600" : "border border-slate-300 text-slate-400"}`}>2</span>
            <span>Xem trước & Kiểm tra</span>
          </div>
          <ChevronRight className="size-4 text-slate-300" />
          <div className={`flex items-center gap-2 text-xs font-bold ${step === 3 ? "text-indigo-600" : "text-slate-400"}`}>
            <span className={`size-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? "border-2 border-indigo-600 text-indigo-600" : "border border-slate-300 text-slate-400"}`}>3</span>
            <span>Kết quả hoàn tất</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/20">
          {step === 1 && (
            <StepUpload
              loading={loading}
              file={file}
              entityName={entityName}
              handleDownloadTemplate={handleDownloadTemplate}
              handleExportData={handleExportData}
              handleFileChange={handleFileChange}
            />
          )}

          {step === 2 && validationResults && (
            <StepPreview validationResults={validationResults} />
          )}

          {step === 3 && importResults && (
            <StepResult
              importResults={importResults}
              handleDownloadErrorReport={handleDownloadErrorReport}
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 font-medium">
            {step === 1 && "* Hỗ trợ file Excel .xlsx. Giới hạn tối đa 1,000 dòng dữ liệu."}
            {step === 2 && `* Dữ liệu hợp lệ: ${validationResults?.success_count}/${validationResults?.total_rows} dòng. Chỉ import các dòng hợp lệ.`}
            {step === 3 && "* Hãy kiểm tra lại danh sách ở màn hình quản trị để xem dữ liệu mới."}
          </div>
          <div className="flex gap-2.5">
            {step === 2 && (
              <>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                  disabled={loading}
                >
                  Quay lại bước 1
                </button>
                {validationResults && validationResults.error_count > 0 && (
                  <button
                    type="button"
                    onClick={handleDownloadErrorReport}
                    className="px-4 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-1.5 transition"
                    disabled={loading}
                  >
                    <FileX className="size-4" />
                    Tải báo cáo lỗi (.xlsx)
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 transition disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                  disabled={loading || !validationResults || validationResults.success_count === 0}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Play className="size-4" />
                      Import {validationResults?.success_count ?? 0} dòng hợp lệ
                    </>
                  )}
                </button>
              </>
            )}

            {step === 1 && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                disabled={loading}
              >
                Hủy bỏ
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-700 rounded-lg transition"
              >
                Hoàn tất & Đóng
              </button>
            )}
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
