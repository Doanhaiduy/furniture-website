"use client";

import viMessages from "@/messages/vi.json";
import enMessages from "@/messages/en.json";
import { localized, trustBadges } from "@/lib/showroom-data";
import { imageAssets, products, blogPosts, showrooms } from "@/tests/fixtures/showroom-data-fixture";
import { useId, useState } from "react";
import {
  AlertTriangle,
  Info,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Package,
  BadgeCheck,
  Award,
  Heart,
  MapPin,
  Phone,
  Trash2,
} from "lucide-react";
import { PremiumSelect } from "./premium-select";

// Re-export components
export { AdminRouteDialog } from "./admin-workflows/AdminRouteDialog";
export { EntityCreateForm } from "./admin-workflows/EntityCreateForm";
export { SettingsOperationsPanel } from "./admin-workflows/SettingsOperationsPanel";
export { AiAssistantWorkspace } from "./admin-workflows/AiAssistantWorkspace";
export { ContentEditorForm, SeoFieldset, SettingsSection, SectionVisibilityCard, type PreviewData } from "./admin-workflows/ContentEditorForm";
export { DetailPreviewModal, HomepageLivePreview } from "./admin-workflows/DetailPreviewModal";
export { ImageUploadDropzone } from "./admin-workflows/ImageUploadDropzone";
export { MultiImageGalleryUpload } from "./admin-workflows/MultiImageGalleryUpload";

export type ContentKind = "product" | "blog" | "category" | "showroom";
export type EntityKind = "category" | "showroom" | "user" | "media" | "promotion" | "brand";
export type SettingsTab = "identity" | "contact" | "seo" | "integrations" | "sections";

// --- Utilities ---

/** Slugify function that handles Vietnamese diacritics */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Format number with Vietnamese thousand separators */
export function formatVnNumber(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("vi-VN");
}

/** Read Vietnamese number as words (supports up to hundreds of billions) */
export function readVnNumber(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";
  const n = parseInt(digits, 10);
  if (isNaN(n) || n <= 0) return "";
  const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  const readGroup = (num: number): string => {
    const h = Math.floor(num / 100);
    const t = Math.floor((num % 100) / 10);
    const u = num % 10;
    let result = "";
    if (h > 0) result += units[h] + " trăm ";
    if (t === 0 && u > 0 && h > 0) result += "linh " + units[u];
    else if (t === 1) result += "mười " + (u > 0 ? units[u] : "");
    else if (t > 1) result += units[t] + " mươi " + (u > 0 ? units[u] : "");
    else result += units[u] ?? "";
    return result.trim();
  };
  const ty = Math.floor(n / 1_000_000_000);
  const trieu = Math.floor((n % 1_000_000_000) / 1_000_000);
  const ngan = Math.floor((n % 1_000_000) / 1_000);
  const don = n % 1_000;
  const parts: string[] = [];
  if (ty > 0) parts.push(readGroup(ty) + " tỷ");
  if (trieu > 0) parts.push(readGroup(trieu) + " triệu");
  if (ngan > 0) parts.push(readGroup(ngan) + " nghìn");
  if (don > 0) parts.push(readGroup(don));
  if (parts.length === 0) return "";
  const reading = parts.join(" ").trim();
  return reading.charAt(0).toUpperCase() + reading.slice(1) + " đồng";
}

export const productReadiness = [
  { label: "Đã hoàn tất trường nội dung gốc tiếng Việt", state: "ready" },
  { label: "Đã bật bản dịch tiếng Anh hoặc xác nhận không cần dịch", state: "warning" },
  { label: "Đã chọn trạng thái giá chỉ nhận báo giá", state: "ready" },
  { label: "Thư viện ảnh, ảnh bìa và văn bản thay thế đang chờ Cloudinary", state: "warning" },
  { label: "Đã rà soát tiêu đề SEO, mô tả meta và đường dẫn song ngữ", state: "warning" },
] as const;

export const blogReadiness = [
  { label: "Đã có nháp tiêu đề, trích đoạn và nội dung tiếng Việt", state: "ready" },
  { label: "Chỉ bật trường tiếng Anh khi cần lưu bản dịch", state: "warning" },
  { label: "Đã thiết lập ảnh bìa, danh mục, thẻ và tác giả", state: "ready" },
  { label: "Đã xác nhận ngày xuất bản và kiểm duyệt thủ công", state: "warning" },
  { label: "Trường SEO đã sẵn sàng cho từng ngôn ngữ được bật", state: "warning" },
] as const;

export const settingsHomepageDefaults = {
  brandNameVi: viMessages.common.brand,
  brandNameEn: enMessages.common.brand,
  heroHeadlineVi: viMessages.home.heroTitle,
  heroHeadlineEn: enMessages.home.heroTitle,
  heroSubtitleVi: viMessages.home.heroLead,
  heroSubtitleEn: enMessages.home.heroLead,
  heroCtaLabel: viMessages.common.explore,
  heroCtaLink: "/products",
  heroImage1: imageAssets.aboutHero,
  slide2TitleVi: viMessages.home.heroSlide2Title,
  slide2TitleEn: enMessages.home.heroSlide2Title,
  slide2LeadVi: viMessages.home.heroSlide2Lead,
  slide2LeadEn: enMessages.home.heroSlide2Lead,
  slide2Image: imageAssets.showroom,
  slide3TitleVi: viMessages.home.heroSlide3Title,
  slide3TitleEn: enMessages.home.heroSlide3Title,
  slide3LeadVi: viMessages.home.heroSlide3Lead,
  slide3LeadEn: enMessages.home.heroSlide3Lead,
  slide3Image: imageAssets.room,
  aboutHeadingVi: viMessages.home.heroSlide3Title,
  aboutHeadingEn: enMessages.home.heroSlide3Title,
  aboutLeadVi: viMessages.home.storyLead,
  aboutLeadEn: enMessages.home.storyLead,
  aboutImage: imageAssets.texture,
  featuredMaxItems: "4",
  blogMaxPosts: "3",
  blogHeadingVi: viMessages.home.editorialTitle,
  blogHeadingEn: enMessages.home.editorialTitle,
  badge1ValueVi: trustBadges[0].value,
  badge1ValueEn: trustBadges[0].value,
  badge1DescVi: localized(trustBadges[0].label, "vi"),
  badge1DescEn: localized(trustBadges[0].label, "en"),
  badge2ValueVi: trustBadges[1].value,
  badge2ValueEn: trustBadges[1].value,
  badge2DescVi: localized(trustBadges[1].label, "vi"),
  badge2DescEn: localized(trustBadges[1].label, "en"),
  showroomHeadingVi: viMessages.home.showroomTitle,
  showroomHeadingEn: enMessages.home.showroomTitle,
  showroomLeadVi: viMessages.home.showroomLead,
  showroomLeadEn: enMessages.home.showroomLead,
  showroomCtaVi: viMessages.home.showroomCta,
  showroomCtaEn: enMessages.home.showroomCta,
  showroomBgImage: imageAssets.showroom,
  quoteHeadingVi: viMessages.home.quoteTitle,
  quoteHeadingEn: enMessages.home.quoteTitle,
  quoteLeadVi: viMessages.home.quoteLead,
  quoteLeadEn: enMessages.home.quoteLead,
};

export const allowedImageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const maxImageUploadBytes = 10 * 1024 * 1024;

export const settingsPreviewProducts = products
  .filter((product) => product.status !== "archived")
  .sort((a, b) => Number(b.featured) - Number(a.featured));

export function getPreviewLimit(value: string, fallback: number, available: number) {
  const limit = Number.parseInt(value, 10);

  if (!Number.isFinite(limit)) {
    return Math.min(fallback, available);
  }

  return Math.max(0, Math.min(limit, available));
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getAssetName(value?: string) {
  if (!value) return "Chưa chọn ảnh";
  if (value.startsWith("data:")) return "Ảnh đã tải lên";

  try {
    const url = new URL(value);
    const name = url.pathname.split("/").filter(Boolean).pop();
    return name || "Tệp media CMS";
  } catch {
    return value.split("/").filter(Boolean).pop() || "Tệp media CMS";
  }
}


export function WorkflowIntro({
  icon: Icon,
  title,
  description,
  compact,
}: {
  icon: typeof Package;
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "flex items-start gap-3" : "rounded-[var(--radius-card)] border border-[var(--admin-border)] bg-white p-4"}>
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-panel)] bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]">
          <Icon className="size-5" />
        </div>
        <div>
          <h3 className="admin-section-title-pd">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--admin-text-muted)]">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function ReadinessPanel({
  items,
}: {
  items: readonly { label: string; state: "ready" | "warning" }[];
}) {
  return (
    <section className="surface-soft p-4">
      <div className="flex items-center gap-2">
        <Info className="size-5 text-[var(--admin-accent)]" />
        <h3 className="admin-section-title-pd">Mức độ sẵn sàng xuất bản</h3>
      </div>
      <div className="mt-4 grid gap-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-2 rounded-[var(--radius-card)] bg-white px-3 py-2 text-sm">
            {item.state === "ready" ? (
              <BadgeCheck className="mt-0.5 size-4 shrink-0 text-[var(--state-success)]" />
            ) : (
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--state-warning)]" />
            )}
            <span className={item.state === "ready" ? "text-[var(--admin-text)]" : "text-[var(--admin-text-muted)]"}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function BilingualPair({
  viLabel,
  enLabel,
  viDefault,
  enDefault,
  multiline,
}: {
  viLabel: string;
  enLabel: string;
  viDefault: string;
  enDefault: string;
  multiline?: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <AdminField label={viLabel} name={viLabel.toLowerCase().replaceAll(" ", "-")} defaultValue={viDefault} multiline={multiline} />
      <AdminField label={enLabel} name={enLabel.toLowerCase().replaceAll(" ", "-")} defaultValue={enDefault} multiline={multiline} />
    </div>
  );
}

export function AdminField({
  label,
  name,
  defaultValue,
  value,
  onChange,
  placeholder,
  inputType = "text",
  min,
  max,
  multiline,
  disabled,
  error,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  inputType?: "email" | "number" | "password" | "text" | "url";
  min?: number;
  max?: number;
  multiline?: boolean;
  disabled?: boolean;
  error?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = inputType === "password";
  const currentType = isPassword ? (showPassword ? "text" : "password") : inputType;

  return (
    <label className={`grid gap-1.5 ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}>
      <span className="flex items-center gap-1.5 label-pd">
        {label}
        {disabled && (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
            <Lock className="size-2.5" />
            Khóa
          </span>
        )}
      </span>
      {multiline ? (
        <textarea
          className={`input-pd min-h-24 ${disabled ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed select-none pointer-events-none" : "bg-white"} ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
          name={name}
          defaultValue={value === undefined ? defaultValue : undefined}
          value={value}
          placeholder={disabled ? "— Không khả dụng —" : placeholder}
          disabled={disabled}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          onInput={onChange ? (event) => onChange(event.currentTarget.value) : undefined}
        />
      ) : (
        <div className="relative flex items-center">
          <input
            className={`input-pd w-full pr-10 ${disabled ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" : "bg-white"} ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
            type={currentType}
            name={name}
            defaultValue={value === undefined ? defaultValue : undefined}
            value={value}
            placeholder={disabled ? "— Không khả dụng —" : placeholder}
            min={min}
            max={max}
            disabled={disabled}
            onChange={onChange ? (event) => onChange(event.target.value) : undefined}
            onInput={onChange ? (event) => onChange(event.currentTarget.value) : undefined}
          />
          {isPassword && !disabled && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-slate-500 hover:text-slate-700 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          )}
          {disabled && (
            <span className="absolute right-3 text-slate-300 pointer-events-none">
              <Lock className="size-3.5" />
            </span>
          )}
        </div>
      )}
      {error && <span className="text-red-600 text-xs font-medium -mt-1">{error}</span>}
    </label>
  );
}

function SectionVisibilityCard({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-800">{title}</p>
          <p className="mt-1 text-[11px] font-medium leading-5 text-slate-500">{description}</p>
        </div>
        <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 text-xs font-bold text-slate-700">
          <input
            type="checkbox"
            className="sr-only peer"
            aria-label={`${title} hiển thị`}
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
          />
          <span className="relative inline-flex h-5 w-9 shrink-0 rounded-full border border-[var(--admin-border)] bg-slate-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:border-emerald-500 peer-checked:bg-emerald-500 peer-checked:after:translate-x-4" />
          <span>{checked ? "Hiển thị" : "Ẩn"}</span>
        </label>
      </div>
    </div>
  );
}

// --- DETAIL PREVIEW MODAL ---
interface PreviewData {
  nameVi?: string;
  nameEn?: string;
  coverImage?: string;
  galleryImages?: string[];
  descriptionVi?: string;
  descriptionEn?: string;
  viTitle?: string;
  enTitle?: string;
  viSummary?: string;
  enSummary?: string;
  viBody?: string;
  enBody?: string;
  price?: string;
  quoteOnly?: boolean;
  refCode?: string;
  brand?: string;
  materialsVi?: string;
  materialsEn?: string;
  dimensionsVi?: string;
  dimensionsEn?: string;
  specMaterialVi?: string;
  specMaterialEn?: string;
  specFinishVi?: string;
  specFinishEn?: string;
  specCareVi?: string;
  specCareEn?: string;
  customAttributes?: { id: string; nameVi: string; nameEn: string; valueVi: string; valueEn: string; }[];
  addressVi?: string;
  addressEn?: string;
  hotline?: string;
  hoursVi?: string;
  hoursEn?: string;
  mapsEmbed?: string;
  slug?: string;
  category?: string;
  [key: string]: unknown;
}


export function getFocusableElements(container: HTMLElement | null) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true");
}
