"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ExcelJS from "exceljs";
import { Download, Upload, AlertCircle, CheckCircle, RefreshCw, X, FileSpreadsheet, Play, ChevronRight, FileX } from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";

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

  // ────────────────────────────────────────────────────────
  // DOWNLOAD TEMPLATE & EXPORT
  // ────────────────────────────────────────────────────────
  const handleDownloadTemplate = () => {
    window.open(`/api/admin/${modulePath}/import-template`, "_blank");
    toast.success(`Đang tải tệp mẫu của ${entityName}...`);
  };

  const handleExportData = () => {
    window.open(`/api/admin/${modulePath}/export`, "_blank");
    toast.success(`Đang xuất dữ liệu danh sách ${entityName}...`);
  };

  // ────────────────────────────────────────────────────────
  // HANDLERS FOR FILE UPLOAD & VALIDATION (STEP 1 -> STEP 2)
  // ────────────────────────────────────────────────────────
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
        body: formData
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

  // ────────────────────────────────────────────────────────
  // HANDLERS FOR IMPORT EXECUTION (STEP 2 -> STEP 3)
  // ────────────────────────────────────────────────────────
  const handleExecuteImport = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/admin/${modulePath}/import?mode=commit`, {
        method: "POST",
        body: formData
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

  // ────────────────────────────────────────────────────────
  // DOWNLOAD ERROR REPORT (STEP 3)
  // ────────────────────────────────────────────────────────
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
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: "FFC0392B" } };
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    });

    activeErrors.forEach(e => {
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
          
          {/* STEP 1: UPLOAD ZONE */}
          {step === 1 && (
            <div className="space-y-6 max-w-4xl mx-auto py-4">
              
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Download template */}
                <div className="border border-slate-200/80 rounded-xl p-5 flex items-start gap-4 hover:bg-slate-50 transition bg-white shadow-sm">
                  <div className="size-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                    <Download className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">Tải File Excel Mẫu Mới Nhất</h4>
                    <p className="text-xs text-slate-450 leading-relaxed">Tải tệp mẫu đã được cấu hình dữ liệu liên kết động thời gian thực (realtime) từ Database hệ thống.</p>
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
                    <p className="text-xs text-slate-450 leading-relaxed">Xuất toàn bộ bản ghi dữ liệu hiện có trong hệ thống của module này ra định dạng tệp Excel.</p>
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
                    <RefreshCw className="size-7 animate-spin text-indigo-600" />
                  ) : (
                    <Upload className="size-7" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-700">
                    {loading ? "Đang đọc và kiểm tra tệp tin của bạn..." : "Kéo thả tệp tin Excel tại đây hoặc click để chọn"}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">Hỗ trợ tệp tin mẫu định dạng .xlsx tối đa 1,000 dòng</p>
                </div>

                {file && !loading && (
                  <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs px-3.5 py-1.5 rounded-full font-bold">
                    <FileSpreadsheet className="size-3.5 shrink-0" />
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW & VALIDATE */}
          {step === 2 && validationResults && (
            <div className="space-y-4 h-full flex flex-col">
              
              {/* Summary Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm shrink-0">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-800">Kết Quả Kiểm Tra Dữ Liệu Tệp Excel</h4>
                  <p className="text-xs text-slate-400 font-medium">Dữ liệu được kiểm chứng tự động với cơ sở dữ liệu hệ thống</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="text-slate-500 font-bold bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">Tổng cộng: {validationResults.total_rows} dòng</span>
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg font-bold">Hợp lệ: {validationResults.success_count}</span>
                  {validationResults.error_count > 0 && (
                    <span className="text-red-700 bg-red-50 border border-red-100 px-2.5 py-1 rounded-lg font-bold">Lỗi: {validationResults.error_count} dòng</span>
                  )}
                </div>
              </div>

              {/* Warning box if errors exist */}
              {validationResults.error_count > 0 && (
                <div className="bg-red-50 border border-red-100 text-red-800 rounded-xl p-3.5 flex items-start gap-3 text-xs leading-relaxed shrink-0">
                  <AlertCircle className="size-4.5 text-red-650 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Hệ thống phát hiện thấy {validationResults.error_count} dòng dữ liệu không hợp lệ.</p>
                    <p className="font-medium text-red-700">Bạn có thể chọn <b>"Import các dòng hợp lệ"</b> ở góc bên dưới để tiếp tục import các dòng OK, hoặc nhấn <b>"Tải báo cáo lỗi"</b> để sửa lại file.</p>
                  </div>
                </div>
              )}

              {/* Preview Table */}
              <div className="flex-1 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col min-h-0">
                <div className="overflow-auto flex-1">
                  <table className="w-full text-left border-collapse text-xs relative">
                    <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold z-10">
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
                          <td className="px-4 py-3 font-bold text-slate-700">
                            {res.name || "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-500 leading-relaxed font-medium">
                            {res.isValid ? (
                              <span className="text-emerald-700 font-semibold">Tất cả dữ liệu cột đều đạt tiêu chuẩn</span>
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
          )}

          {/* STEP 3: RESULT SUMMARY */}
          {step === 3 && importResults && (
            <div className="space-y-6 max-w-2xl mx-auto py-6">
              
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
                  <p className="text-xs text-slate-400 font-medium">100% dữ liệu hàng của bạn đã được kiểm chuẩn và nạp vào database hoàn hảo!</p>
                )}

              </div>

            </div>
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
