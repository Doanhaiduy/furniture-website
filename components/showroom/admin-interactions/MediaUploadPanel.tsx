"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/components/providers/toast-provider";

// Tiptap WYSIWYG
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

import {
  Archive,
  Bot,
  Bold,
  CheckCircle2,
  ImageUp,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  RefreshCcw,
  Rocket,
  Save,
  Strikethrough,
  UnderlineIcon,
  UploadCloud,
  WandSparkles,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading2,
  Heading3,
  Quote,
  Undo2,
  Redo2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PremiumSelect } from "../premium-select";
import { Pagination } from "../admin-pages";


export function MediaUploadPanel() {
  const { toast, confirm } = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ url: string; id: string } | null>(null);
  const [library, setLibrary] = useState<Array<{ id: string; public_url: string; format?: string; original_filename?: string }>>([]);
  const [libLoading, setLibLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;
  const inputRef = useRef<HTMLInputElement>(null);

  async function loadLibrary() {
    setLibLoading(true);
    try {
      const res = await fetch("/api/admin/media/list");
      if (res.ok) {
        const data = await res.json();
        setLibrary(data.assets ?? []);
      }
    } catch {
      // noop
    } finally {
      setLibLoading(false);
    }
  }

  // Load library on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLibrary();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredLibrary = library.filter((asset) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      (asset.original_filename ?? "").toLowerCase().includes(term) ||
      (asset.public_url ?? "").toLowerCase().includes(term) ||
      (asset.format ?? "").toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredLibrary.length / pageSize);
  const paginatedLibrary = filteredLibrary.slice((currentPage - 1) * pageSize, currentPage * pageSize);


  async function handleUpload(file: File) {
    if (!file) return;

    const allowedTypes = [
      "image/jpeg", "image/png", "image/webp", "image/avif",
      "image/gif", "image/svg+xml", "video/mp4", "video/webm",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError(`Định dạng không hỗ trợ: ${file.type}. Chỉ nhận JPEG, PNG, WebP, AVIF, GIF, SVG, MP4, WebM.`);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("File quá lớn. Tối đa 50MB.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError("");
    setSuccess(null);

    try {
      // 1. Get signed upload params
      const signRes = await fetch("/api/admin/cloudinary-sign", { method: "POST" });
      if (!signRes.ok) {
        const errData = await signRes.json().catch(() => ({}));
        throw new Error(errData.error || "Không thể lấy chữ ký upload");
      }
      const { signature, timestamp, folder, apiKey, cloudName } = await signRes.json();

      // 2. Upload to Cloudinary via XHR for progress tracking
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

      const cloudinaryResult = await new Promise<{
        public_id: string;
        secure_url: string;
        format: string;
        bytes: number;
        width?: number;
        height?: number;
        original_filename?: string;
        resource_type?: string;
      }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 80));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            try {
              const errData = JSON.parse(xhr.responseText);
              reject(new Error(errData.error?.message || "Upload thất bại"));
            } catch {
              reject(new Error("Upload thất bại"));
            }
          }
        };
        xhr.onerror = () => reject(new Error("Lỗi mạng khi upload"));
        xhr.send(formData);
      });

      setProgress(85);

      // 3. Persist media_assets row
      const persistRes = await fetch("/api/admin/media/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_id: cloudinaryResult.public_id,
          secure_url: cloudinaryResult.secure_url,
          format: cloudinaryResult.format,
          bytes: cloudinaryResult.bytes,
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
          original_filename: cloudinaryResult.original_filename,
          resource_type: cloudinaryResult.resource_type,
        }),
      });

      if (!persistRes.ok) {
        const errData = await persistRes.json().catch(() => ({}));
        throw new Error(errData.error || "Không thể lưu vào cơ sở dữ liệu");
      }

      const persistedAsset = await persistRes.json();
      setProgress(100);
      setSuccess({ url: persistedAsset.public_url, id: persistedAsset.id });
      loadLibrary(); // Refresh library
    } catch (err) {
      setError(String(err instanceof Error ? err.message : err));
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    // Reset input
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }

  return (
    <div className="space-y-5">
      {/* Upload Zone */}
      <div
        className={`surface-soft flex min-h-60 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? "border-primary bg-primary/5" : "border-slate-300 hover:border-primary/50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <UploadCloud className={`size-12 ${dragging ? "text-primary" : "text-slate-400"}`} />
        <div>
          <h3 className="font-heading text-lg font-semibold text-primary">
            {dragging ? "Thả file vào đây" : "Kéo thả ảnh/video hoặc chọn file"}
          </h3>
          <p className="mt-1.5 text-sm text-secondary">
            JPEG, PNG, WebP, AVIF, GIF, SVG • MP4, WebM • Tối đa 50MB
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          id="media-upload-input"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml,video/mp4,video/webm"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <label
          htmlFor="media-upload-input"
          className="button-pd cursor-pointer"
        >
          {uploading ? (
            <><Loader2 className="size-4 animate-spin" />Đang upload...</>
          ) : (
            "Chọn file"
          )}
        </label>

        {/* Progress bar */}
        {uploading && (
          <div className="w-full max-w-xs">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-center text-xs text-secondary">{progress}%</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm font-semibold text-error">{error}</p>
        )}

        {/* Success */}
        {success && (
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={success.url} alt="Uploaded" className="h-12 w-12 rounded object-cover" />
            <div className="text-left">
              <p className="text-xs font-bold text-green-700">Upload thành công!</p>
              <p className="text-[10px] text-green-600 break-all">{success.url}</p>
            </div>
          </div>
        )}
      </div>

      {/* Library */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-3">
          <h3 className="text-sm font-bold text-slate-700">
            Thư viện media ({filteredLibrary.length} / {library.length})
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Tìm theo tên file, định dạng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 max-w-xs"
            />
            <button
              type="button"
              className="text-xs text-slate-400 hover:text-primary whitespace-nowrap"
              onClick={loadLibrary}
              disabled={libLoading}
            >
              {libLoading ? "Đang tải..." : "Làm mới"}
            </button>
          </div>
        </div>
        {filteredLibrary.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            {libLoading ? "Đang tải thư viện..." : "Không tìm thấy file nào khớp."}
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
              {paginatedLibrary.map((asset) => (
                <div
                  key={asset.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100 cursor-pointer hover:border-primary transition"
                  onClick={() => {
                    navigator.clipboard?.writeText(asset.public_url).catch(() => null);
                  }}
                  title={`Nhấn để copy URL: ${asset.public_url}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.public_url}
                    alt=""
                    className="h-full w-full object-cover transition group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent copying URL
                      confirm(
                        "Xác nhận xóa",
                        "Bạn có chắc chắn muốn xóa tệp này vĩnh viễn?",
                        async () => {
                          try {
                            const res = await fetch(`/api/admin/media/${asset.id}`, {
                              method: "DELETE",
                            });
                            if (res.ok) {
                              toast.success("Xóa tệp thành công!");
                              loadLibrary();
                            } else {
                              const err = await res.json().catch(() => ({}));
                              toast.error("Lỗi khi xóa: " + (err.error || "Không xác định"));
                            }
                          } catch (err) {
                            toast.error("Lỗi kết nối khi xóa tệp: " + String(err));
                          }
                        }
                      );
                    }}
                    className="absolute right-1 top-1 z-10 hidden rounded bg-red-600 p-1 text-white hover:bg-red-700 group-hover:block transition shadow-sm"
                    title="Xóa tệp"
                  >
                    <Trash2 className="size-3" />
                  </button>

                  <div className="absolute inset-0 flex items-end bg-black/0 opacity-0 transition group-hover:opacity-100 group-hover:bg-black/30">
                    <span className="w-full bg-black/60 px-1 py-0.5 text-center text-[9px] font-bold text-white">Copy URL</span>
                  </div>
                </div>
              ))}
            </div>
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

