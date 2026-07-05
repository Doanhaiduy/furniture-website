"use client";

import { useState, useRef } from "react";
import { useToast } from "@/components/providers/toast-provider";

// Tiptap WYSIWYG

import {
  ImageUp,
  UploadCloud,
  Trash2,
} from "lucide-react";


import { ModalPortal } from "@/components/ui/modal-portal";
import { ZoomableImage } from "@/components/ui/zoomable-image";
import { assetUrl } from "@/lib/asset-url";


export function MediaPicker({
  value,
  onChange,
  label = "Chọn ảnh",
}: {
  value?: string;
  onChange: (url: string, mediaId?: string) => void;
  label?: string;
}) {
  const { toast, confirm } = useToast();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [library, setLibrary] = useState<Array<{ id: string; public_url: string }>>([]);
  const [libLoaded, setLibLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function loadLibrary(force = false) {
    if (libLoaded && !force) return;
    const res = await fetch("/api/admin/media/list").catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      setLibrary(data.assets ?? []);
      setLibLoaded(true);
    }
  }

  async function handleUpload(file: File) {
    if (!file) return;
    const allowedTypes = [
      "image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      setUploadError(`Định dạng không hỗ trợ: ${file.type}`);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError("File quá lớn. Tối đa 50MB.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setUploadError("");

    try {
      const signRes = await fetch("/api/admin/cloudinary-sign", { method: "POST" });
      if (!signRes.ok) throw new Error("Không thể lấy chữ ký upload");
      const { signature, timestamp, folder, apiKey, cloudName } = await signRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
      const cloudRes = await new Promise<{
        public_id: string; secure_url: string; format: string;
        bytes: number; width?: number; height?: number; original_filename?: string; resource_type?: string;
      }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 80));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
          else reject(new Error("Upload thất bại"));
        };
        xhr.onerror = () => reject(new Error("Lỗi mạng"));
        xhr.send(formData);
      });

      setProgress(85);
      const persistRes = await fetch("/api/admin/media/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_id: cloudRes.public_id,
          secure_url: cloudRes.secure_url,
          format: cloudRes.format,
          bytes: cloudRes.bytes,
          width: cloudRes.width,
          height: cloudRes.height,
          original_filename: cloudRes.original_filename,
          resource_type: cloudRes.resource_type,
        }),
      });
      if (!persistRes.ok) throw new Error("Không thể lưu vào cơ sở dữ liệu");
      const asset = await persistRes.json();
      setProgress(100);
      onChange(asset.public_url, asset.id);
      setLibLoaded(false); // invalidate library cache
      setOpen(false);
    } catch (err) {
      setUploadError(String(err instanceof Error ? err.message : err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      {/* Trigger */}
      <div className="space-y-2">
        {value && (
          <ZoomableImage
            src={value}
            alt="Ảnh đã chọn"
            className="flex h-40 w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assetUrl(value)}
              alt="Ảnh đã chọn"
              className="max-h-40 max-w-full object-contain"
            />
          </ZoomableImage>
        )}
        <button
          type="button"
          className="button-pd-outline flex w-full items-center justify-center gap-2 text-sm"
          onClick={() => { setOpen(true); loadLibrary(); }}
        >
          <ImageUp className="size-4" />
          {value ? "Đổi ảnh" : label}
        </button>
        {value && (
          <button
            type="button"
            className="w-full text-center text-xs text-slate-400 hover:text-error transition"
            onClick={() => onChange("", undefined)}
          >
            Xóa ảnh
          </button>
        )}
      </div>

      {/* Dialog — portaled to <body> so it is never trapped inside a scroll/transform ancestor,
          and elevated above every editing dialog (z-modal=80) while staying below the toast confirm it triggers. */}
      {open && (
        <ModalPortal>
        <div className="fixed inset-0 z-99990 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
              <h2 className="font-heading text-lg font-semibold">Chọn ảnh</h2>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-700"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Upload new */}
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Upload ảnh mới</p>
                <input
                  ref={inputRef}
                  type="file"
                  className="sr-only"
                  id="media-picker-input"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                  disabled={uploading}
                />
                <label
                  htmlFor="media-picker-input"
                  className="button-pd-outline cursor-pointer inline-flex items-center gap-2"
                >
                  <UploadCloud className="size-4" />
                  {uploading ? "Đang upload..." : "Chọn file từ máy tính"}
                </label>
                {uploading && (
                  <div className="mt-2 h-2 rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
                {uploadError && <p className="mt-2 text-xs text-error font-semibold">{uploadError}</p>}
              </div>

              {/* Library */}
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Thư viện ({library.length})</p>
                {library.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-400">Chưa có file nào trong thư viện.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                    {library.map((asset) => (
                      <div
                        key={asset.id}
                        role="button"
                        tabIndex={0}
                        className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition cursor-pointer ${
                          value === asset.public_url
                            ? "border-primary"
                            : "border-slate-200 hover:border-primary"
                        }`}
                        onClick={() => {
                          onChange(asset.public_url, asset.id);
                          setOpen(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            onChange(asset.public_url, asset.id);
                            setOpen(false);
                          }
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={asset.public_url}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // prevent selecting the image
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
                                    loadLibrary(true);
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </>
  );
}


