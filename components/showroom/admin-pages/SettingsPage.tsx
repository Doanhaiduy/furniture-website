"use client";













import {
  SettingsOperationsPanel,
} from "../admin-workflows";



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

export function SettingsPage({ role }: { role?: string } = {}) {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Cài đặt doanh nghiệp"
        description="Cấu hình vận hành cho nhận diện thương hiệu, liên hệ, liên kết mạng xã hội, mặc định SEO, tích hợp và trạng thái bảo mật bí mật."
      />
      <SettingsOperationsPanel role={role} />
    </div>
  );
}
