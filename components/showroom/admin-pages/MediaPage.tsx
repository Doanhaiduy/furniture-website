"use client";

import {
  AlertTriangle,
} from "lucide-react";


import { imageAssets } from "@/tests/fixtures/showroom-data-fixture";








import {
  AdminRouteDialog,
  EntityCreateForm,
} from "../admin-workflows";
import { RemoteImage } from "../remote-image";



export interface Brand {
  id: string;
  name: { vi: string; en: string };
  origin?: string;
  logo_url?: string;
  status: "draft" | "published" | "archived";
  sort_order: number;
  slug?: string;
}

import {
  AdminPageHeader
} from "./SharedComponents";

export function MediaPage({ uploadMode }: { uploadMode?: boolean }) {
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
          <h2 className="admin-section-title-pd">Hàng đợi kiểm tra tệp</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {["Thư viện ảnh sản phẩm", "Ảnh bìa bài viết", "Ảnh showroom"].map((item, index) => (
              <div key={item} className="rounded-[var(--radius-card)] border border-[var(--admin-border)] bg-white p-3">
                <RemoteImage src={[imageAssets.sofa, imageAssets.blog1, imageAssets.showroom][index]} alt={item} className="h-28 w-full rounded-[var(--radius-control)] object-cover" sizes="220px" />
                <p className="mt-3 font-semibold text-[var(--admin-text)]">{item}</p>
                <p className="mt-1 text-xs text-[var(--admin-text-muted)]">Cần kiểm tra alt_vi, alt_en và ngữ cảnh sở hữu.</p>
              </div>
            ))}
          </div>
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
