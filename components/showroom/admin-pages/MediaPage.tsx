"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, ImageOff } from "lucide-react";

import { AdminRouteDialog, EntityCreateForm } from "../admin-workflows";
import { RemoteImage } from "../remote-image";
import { AdminPageHeader } from "./SharedComponents";

interface MediaAsset {
  id: string;
  public_url: string;
  format: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  original_filename: string | null;
  created_at: string | null;
}

function formatSize(bytes: number | null): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaPage({ uploadMode }: { uploadMode?: boolean }) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/media/list");
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (!cancelled) setAssets(Array.isArray(data.assets) ? data.assets : []);
      } catch {
        if (!cancelled) setError("Không thể tải danh sách tệp. Vui lòng thử lại.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Thư viện tệp"
        description="Quản trị tệp trên Cloudinary: ngữ cảnh sở hữu, loại tệp, dung lượng, kích thước, chú thích và văn bản thay thế song ngữ."
        actionHref="/admin/media?upload=1"
        actionLabel="Tải tệp lên"
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="surface-soft p-4">
          <h2 className="admin-section-title-pd">
            Tệp đã tải lên{!loading && !error ? ` (${assets.length})` : ""}
          </h2>

          {loading ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-[var(--admin-text-muted)]">
              <Loader2 className="size-4 animate-spin" /> Đang tải danh sách tệp...
            </div>
          ) : error ? (
            <p className="mt-4 rounded-md border border-error/30 bg-error-container px-3 py-2 text-sm text-on-error-container">
              {error}
            </p>
          ) : assets.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-2 py-8 text-center text-sm text-[var(--admin-text-muted)]">
              <ImageOff className="size-8 opacity-60" />
              <p>Chưa có tệp nào. Nhấn “Tải tệp lên” để thêm hình ảnh đầu tiên.</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="rounded-[var(--radius-card)] border border-[var(--admin-border)] bg-white p-3"
                >
                  <RemoteImage
                    src={asset.public_url}
                    alt={asset.original_filename || "media"}
                    className="h-28 w-full rounded-[var(--radius-control)] object-cover"
                    sizes="220px"
                  />
                  <p className="mt-3 truncate font-semibold text-[var(--admin-text)]" title={asset.original_filename || asset.public_url}>
                    {asset.original_filename || asset.public_url.split("/").pop()}
                  </p>
                  <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
                    {(asset.format || "?").toUpperCase()} · {formatSize(asset.size_bytes)}
                    {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
        <div className="state-card rounded-xl border border-error/25 bg-error-container p-4 text-on-error-container shadow-[0_18px_44px_rgba(147,0,10,0.08)]">
          <AlertTriangle className="size-6" />
          <h3 className="mt-3 font-heading text-lg font-semibold">Quy tắc tải tệp</h3>
          <p className="mt-2 text-sm leading-6">
            Không nhận tài liệu cho các trường media công khai. Giai đoạn nền tảng chỉ chấp nhận hình ảnh và video đúng phạm vi trường.
          </p>
        </div>
      </div>
      <AdminRouteDialog
        open={Boolean(uploadMode)}
        returnHref="/admin/media"
        title="Tải tệp lên"
        description="Chọn tệp và chuẩn bị siêu dữ liệu kiểm tra trước khi kết nối quy trình tải lên Cloudinary."
        size="standard"
      >
        <EntityCreateForm kind="media" />
      </AdminRouteDialog>
    </div>
  );
}
