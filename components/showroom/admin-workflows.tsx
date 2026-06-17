"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BadgePercent,
  BadgeCheck,
  BookOpen,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  FileText,
  Globe2,
  Heart,
  ImageUp,
  Info,
  Languages,
  LayoutDashboard,
  Link2,
  Loader2,
  Lock,
  MapPin,
  Menu,
  Monitor,
  Package,
  Phone,
  Plus,
  Ruler,
  Save,
  Search,
  Settings2,
  Share2,
  Smartphone,
  Sparkles,
  Store,
  Tag,
  Trash2,
  WandSparkles,
  X,
} from "lucide-react";
import { PremiumSelect } from "./premium-select";
import {
  MediaUploadPanel,
  PublishWorkflow,
  RichTextEditorMock,
  MediaPicker,
} from "./admin-interactions";
import {
  localized,
  productGroups,
  trustBadges,
} from "@/lib/showroom-data";
import {
  blogPosts,
  imageAssets,
  products,
  showrooms,
} from "@/tests/fixtures/showroom-data-fixture";
import enMessages from "@/messages/en.json";
import viMessages from "@/messages/vi.json";

type ContentKind = "product" | "blog" | "category" | "showroom";
type EntityKind = "category" | "showroom" | "user" | "media" | "promotion" | "brand";
type SettingsTab = "identity" | "contact" | "seo" | "integrations" | "sections";

const productReadiness = [
  { label: "Đã hoàn tất trường nội dung gốc tiếng Việt", state: "ready" },
  { label: "Đã bật bản dịch tiếng Anh hoặc xác nhận không cần dịch", state: "warning" },
  { label: "Đã chọn trạng thái giá chỉ nhận báo giá", state: "ready" },
  { label: "Thư viện ảnh, ảnh bìa và văn bản thay thế đang chờ Cloudinary", state: "warning" },
  { label: "Đã rà soát tiêu đề SEO, mô tả meta và đường dẫn song ngữ", state: "warning" },
] as const;

const blogReadiness = [
  { label: "Đã có nháp tiêu đề, trích đoạn và nội dung tiếng Việt", state: "ready" },
  { label: "Chỉ bật trường tiếng Anh khi cần lưu bản dịch", state: "warning" },
  { label: "Đã thiết lập ảnh bìa, danh mục, thẻ và tác giả", state: "ready" },
  { label: "Đã xác nhận ngày xuất bản và kiểm duyệt thủ công", state: "warning" },
  { label: "Trường SEO đã sẵn sàng cho từng ngôn ngữ được bật", state: "warning" },
] as const;

const settingsHomepageDefaults = {
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

const allowedImageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const maxImageUploadBytes = 10 * 1024 * 1024;

const settingsPreviewProducts = products
  .filter((product) => product.status !== "archived")
  .sort((a, b) => Number(b.featured) - Number(a.featured));

function getPreviewLimit(value: string, fallback: number, available: number) {
  const limit = Number.parseInt(value, 10);

  if (!Number.isFinite(limit)) {
    return Math.min(fallback, available);
  }

  return Math.max(0, Math.min(limit, available));
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getAssetName(value?: string) {
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

export function AdminRouteDialog({
  open,
  returnHref,
  title,
  description,
  children,
  size = "wide",
}: {
  open: boolean;
  returnHref: string;
  title: string;
  description: string;
  children: ReactNode;
  size?: "standard" | "wide" | "full";
}) {
  const router = useRouter();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const isOpen = open;
  const [mounted, setMounted] = useState(false);

  const width =
    size === "full"
      ? "w-[98vw] max-w-[1780px]"
      : size === "wide"
        ? "w-[96vw] max-w-[1440px]"
        : "w-[92vw] max-w-[960px]";

  const height =
    size === "full"
      ? "h-[96vh] max-h-[96vh]"
      : size === "wide"
        ? "h-[92vh] max-h-[92vh]"
        : "max-h-[85vh]";

  const closeDialog = useCallback(() => {
    router.push(returnHref);
  }, [returnHref, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      const focusable = getFocusableElements(dialogRef.current);
      (focusable[0] ?? dialogRef.current)?.focus();
    }, 0);

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeDialog, isOpen]);

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const focusable = getFocusableElements(dialogRef.current);
    if (focusable.length === 0) {
      event.preventDefault();
      dialogRef.current?.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[var(--z-modal)]">
      <button
        type="button"
        aria-label="Đóng lớp phủ hộp thoại quản trị"
        className="absolute inset-0 h-full w-full cursor-default bg-black/45 backdrop-blur-sm"
        onClick={closeDialog}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
        className={`admin-dialog-content fixed left-1/2 top-1/2 flex flex-col -translate-x-1/2 -translate-y-1/2 overflow-hidden p-0 outline-none ${width} ${height}`}
      >
        <div className="border-b border-[var(--admin-border)] bg-[var(--admin-bg-soft)] px-5 py-4 pr-14 relative shrink-0">
          <h2 id={titleId} className="admin-section-title-pd text-lg">{title}</h2>
          <p id={descriptionId} className="type-caption mt-1 text-[var(--admin-text-muted)]">
            {description}
          </p>
          <button
            type="button"
            aria-label="Đóng hộp thoại quản trị"
            className="admin-icon-button-pd absolute right-3 top-1/2 -translate-y-1/2 size-9"
            onClick={closeDialog}
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 min-h-0">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}



export function EntityCreateForm({ kind, idOrSlug }: { kind: EntityKind; idOrSlug?: string }) {
  if (kind === "media") return <MediaUploadPanel />;
  if (kind === "user") return <UserCreateEntityForm />;
  if (kind === "showroom") return <ShowroomEntityForm idOrSlug={idOrSlug} />;
  if (kind === "promotion") return <PromotionEntityForm idOrSlug={idOrSlug} />;
  if (kind === "brand") return <BrandEntityForm idOrSlug={idOrSlug} />;
  return <CategoryEntityForm idOrSlug={idOrSlug} />;
}

function UserCreateEntityForm() {
  const [fullName, setFullName] = useState("Nguyễn Minh Quân");
  const [email, setEmail] = useState("editor@phuongdong.vn");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("editor");
  const [isActive, setIsActive] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setFormError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    setFormLoading(true);
    setFormError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, role, isActive }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Tạo tài khoản quản trị thành công!");
        window.location.href = "/admin/users";
      } else {
        setFormError(data.error || "Có lỗi xảy ra khi tạo tài khoản.");
      }
    } catch (err) {
      setFormError("Lỗi kết nối tới máy chủ.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreateUser} className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="surface-soft p-4">
        <WorkflowIntro
          icon={Lock}
          title="Tạo người dùng dành cho quản trị viên"
          description="Tạo tài khoản CMS, gán quyền theo mô hình vai trò A và đồng bộ trực tiếp vào database."
        />
        {formError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {formError}
          </div>
        )}
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2">
            <span className="label-pd">Tên hiển thị</span>
            <input
              className="input-pd bg-white"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="label-pd">Email đăng nhập</span>
            <input
              className="input-pd bg-white"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="label-pd">Mật khẩu ban đầu</span>
            <input
              className="input-pd bg-white"
              type="password"
              value={password}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>
          <label className="grid gap-2">
            <span className="label-pd">Vai trò</span>
            <PremiumSelect
              value={role}
              onValueChange={setRole}
              ariaLabel="Vai trò"
              placeholder="Vai trò"
              tone="admin"
              options={[
                { value: "editor", label: "Biên tập viên - chỉ quản lý nội dung có thể xuất bản" },
                { value: "admin", label: "Quản trị viên - người dùng, cài đặt, báo giá và toàn bộ nội dung" },
              ]}
            />
          </label>
          <label className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--admin-border)] bg-white p-3 text-sm">
            <input 
              className="mt-1" 
              type="checkbox" 
              checked={isActive} 
              onChange={(e) => setIsActive(e.target.checked)} 
            />
            <span>
              <strong className="block text-[var(--admin-text)]">Tài khoản đang hoạt động</strong>
              <span className="text-[var(--admin-text-muted)]">Người dùng bị tắt không thể truy cập CMS.</span>
            </span>
          </label>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="button-pd"
              disabled={formLoading}
            >
              {formLoading ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </div>
        </div>
      </section>
      <ReadinessPanel
        items={[
          { label: "Vai trò khớp ma trận quyền của phương án A", state: "ready" },
          { label: "Tài khoản quản trị đầu tiên vẫn do vận hành backend thiết lập", state: "warning" },
          { label: "Mật khẩu sẽ có hiệu lực ngay lập tức", state: "ready" },
        ]}
      />
    </form>
  );
}

function ShowroomEntityForm({ idOrSlug }: { idOrSlug?: string }) {
  const searchParams = useSearchParams();
  const editSlug = idOrSlug || searchParams.get("edit");
  const isEdit = Boolean(editSlug);

  const [englishEnabled, setEnglishEnabled] = useState(isEdit);
  const [aiFilling, setAiFilling] = useState(false);
  const [aiFillSuccess, setAiFillSuccess] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [seoTitleVi, setSeoTitleVi] = useState("");
  const [seoDescVi, setSeoDescVi] = useState("");
  const [seoTitleEn, setSeoTitleEn] = useState("");
  const [seoDescEn, setSeoDescEn] = useState("");

  // Bind input states
  const [nameVi, setNameVi] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [hotline, setHotline] = useState("");
  const [code, setCode] = useState("");
  const [addressVi, setAddressVi] = useState("");
  const [addressEn, setAddressEn] = useState("");
  const [hoursVi, setHoursVi] = useState("");
  const [hoursEn, setHoursEn] = useState("");
  const [mapsEmbed, setMapsEmbed] = useState("https://www.google.com/maps/embed?pb=...");
  const [mapsFallback, setMapsFallback] = useState("https://maps.google.com/?q=Phuong+Dong");
  const [coverImage, setCoverImage] = useState("");

  // Sync state with edit entity
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (editSlug) {
      const match = showrooms.find(s => s.code === editSlug);
      if (match) {
        setNameVi(match.name.vi);
        setNameEn(match.name.en);
        setAddressVi(match.address.vi);
        setAddressEn(match.address.en);
        setHotline(match.hotline);
        setCode(match.code);
        setHoursVi(match.hours.vi);
        setHoursEn(match.hours.en);
        setMapsEmbed(match.mapUrl || "https://www.google.com/maps/embed?pb=...");
        setMapsFallback(match.mapUrl || "https://maps.google.com/?q=Phuong+Dong");
        setCoverImage(match.image || "");
        
        setSeoTitleVi(`${match.name.vi} | Showroom Nội Thất Phương Đông`);
        setSeoTitleEn(`${match.name.en} | Phuong Dong Premium Showroom`);
        setSeoDescVi(`Ghé thăm ${match.name.vi} tại ${match.address.vi}. Hotline: ${match.hotline}.`);
        setSeoDescEn(`Visit ${match.name.en} at ${match.address.en}. Hotline: ${match.hotline}.`);
        setEnglishEnabled(true);
      }
    } else {
      // Clear for create mode
      setNameVi("");
      setNameEn("");
      setAddressVi("");
      setAddressEn("");
      setHotline("");
      setCode("");
      setHoursVi("");
      setHoursEn("");
      setMapsEmbed("");
      setMapsFallback("");
      setCoverImage("");
      setSeoTitleVi("");
      setSeoDescVi("");
      setSeoTitleEn("");
      setSeoDescEn("");
      setEnglishEnabled(false);
    }
  }, [editSlug]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleAiFill = () => {
    if (!nameVi.trim() && !addressVi.trim()) return;
    setAiFilling(true);
    setAiFillSuccess(false);
    setTimeout(() => {
      setAiFilling(false);
      setAiFillSuccess(true);
      if (nameVi) setNameEn(`${nameVi} - Premium Showroom`);
      if (addressVi) setAddressEn(`${addressVi} (English translation)`);
      if (hoursVi) setHoursEn("8:00 AM - 8:00 PM daily");
      
      setSeoTitleVi(`${nameVi} | Showroom Nội Thất Phương Đông`);
      setSeoTitleEn(`${nameVi} | Phuong Dong Premium Showroom`);
      setSeoDescVi(`Ghé thăm ${nameVi} tại ${addressVi}. Trải nghiệm nội thất cao cấp.`);
      setSeoDescEn(`Visit ${nameVi} at ${addressVi}. Experience premium furniture collections.`);
    }, 800);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        {/* --- Bật tiếng Anh và điền bằng AI --- */}
        <section className="surface-soft p-4">
          <div className="flex flex-col justify-between gap-3 border-b border-[var(--admin-border)] pb-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <Languages className="size-5 text-[var(--admin-accent)]" />
              <h3 className="admin-section-title-pd">Bản dịch tiếng Anh</h3>
            </div>
            {englishEnabled && (
              <button
                type="button"
                className="button-pd-outline py-1 px-3 text-xs flex items-center gap-1.5"
                onClick={handleAiFill}
                disabled={aiFilling}
                aria-label="Dịch từ tiếng Việt bằng AI"
              >
                {aiFilling ? (
                  <><Loader2 className="size-3.5 animate-spin" />Đang dịch...</>
                ) : (
                  <><Languages className="size-3.5" />Dịch bằng AI</>
                )}
              </button>
            )}
          </div>
          <div className="mt-4">
            <div className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all duration-300 w-full ${
              englishEnabled 
                ? "border-indigo-200 bg-gradient-to-r from-indigo-50/30 to-violet-50/30 shadow-[0_4px_20px_rgba(99,102,241,0.06)]" 
                : "border-slate-200 bg-slate-50/40"
            }`}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 rounded-lg p-2 ${englishEnabled ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"}`}>
                  <Languages className="size-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Dịch nội dung sang tiếng Anh
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                    Kích hoạt dịch tiếng Anh cho tên showroom, địa chỉ, giờ mở cửa và các thẻ SEO.
                  </span>
                </div>
              </div>
              
              <label className="inline-flex items-center gap-3 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={englishEnabled}
                  aria-label="Bật trường tiếng Anh"
                  onChange={(e) => setEnglishEnabled(e.target.checked)}
                />
                <span className="relative inline-flex h-5 w-9 shrink-0 rounded-full border border-slate-300 bg-slate-200 transition-colors duration-200 after:absolute after:left-[2px] after:top-[2px] after:size-4 after:rounded-full after:bg-white after:shadow-[0_2px_4px_rgba(0,0,0,0.1)] after:transition-transform peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:after:translate-x-4" />
              </label>
            </div>
          </div>
          {aiFillSuccess && (
            <p className="mt-3 text-emerald-700 text-xs bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              AI đã điền các trường tiếng Anh. Vui lòng rà soát và chỉnh sửa khi cần.
            </p>
          )}
        </section>

        <section className="surface-soft p-4">
          <WorkflowIntro
            icon={Store}
            title="Hồ sơ showroom"
            description="Lưu tên và địa chỉ song ngữ, hotline công khai, mã nhúng Google Maps, đường dẫn dự phòng và trạng thái xuất bản."
          />
          <div className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField 
                label="Tên showroom - Tiếng Việt" 
                name="showroom-name-vi" 
                value={nameVi} 
                onChange={setNameVi} 
              />
              <AdminField 
                label="Tên showroom - Tiếng Anh" 
                name="showroom-name-en" 
                value={nameEn} 
                onChange={setNameEn}
                disabled={!englishEnabled}
                placeholder={!englishEnabled ? "Bật bản dịch tiếng Anh để chỉnh sửa" : ""}
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="Đường dây nóng" name="showroom-hotline" value={hotline} onChange={setHotline} />
              <AdminField label="Mã nội bộ" name="showroom-code" value={code} onChange={setCode} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <AdminField 
                label="Địa chỉ - Tiếng Việt" 
                name="showroom-address-vi" 
                value={addressVi} 
                onChange={setAddressVi} 
                multiline
              />
              <AdminField 
                label="Địa chỉ - Tiếng Anh" 
                name="showroom-address-en" 
                value={addressEn} 
                onChange={setAddressEn}
                disabled={!englishEnabled}
                placeholder={!englishEnabled ? "Bật bản dịch tiếng Anh để chỉnh sửa" : ""}
                multiline
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <AdminField 
                label="Giờ mở cửa - Tiếng Việt" 
                name="showroom-hours-vi" 
                value={hoursVi} 
                onChange={setHoursVi} 
              />
              <AdminField 
                label="Giờ mở cửa - Tiếng Anh" 
                name="showroom-hours-en" 
                value={hoursEn} 
                onChange={setHoursEn}
                disabled={!englishEnabled}
                placeholder={!englishEnabled ? "Bật bản dịch tiếng Anh để chỉnh sửa" : ""}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <AdminField label="URL nhúng Google Maps" name="maps-embed" value={mapsEmbed} onChange={setMapsEmbed} />
              <AdminField label="URL bản đồ dự phòng" name="maps-fallback" value={mapsFallback} onChange={setMapsFallback} />
            </div>
          </div>
        </section>

        {/* --- SEO Fields --- */}
        <SeoFieldset
          kind="showroom"
          seoTitleVi={seoTitleVi}
          setSeoTitleVi={setSeoTitleVi}
          seoTitleEn={seoTitleEn}
          setSeoTitleEn={setSeoTitleEn}
          seoDescVi={seoDescVi}
          setSeoDescVi={setSeoDescVi}
          seoDescEn={seoDescEn}
          setSeoDescEn={setSeoDescEn}
          englishEnabled={englishEnabled}
          viTitle={nameVi}
          enTitle={nameEn}
        />
      </div>
      <aside className="space-y-5">
        <section className="surface-soft p-4 space-y-4">
          <h3 className="admin-section-title-pd">Ảnh bìa showroom</h3>
          <ImageUploadDropzone value={coverImage} onChange={setCoverImage} label="Tải ảnh showroom lên" />
        </section>
        <section className="surface-soft p-4">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-bold hover:from-sky-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="size-4" />
            Xem trước
          </button>
        </section>
        <PublishWorkflow />
      </aside>
      {previewOpen && (
        <DetailPreviewModal
          kind="showroom"
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          data={{
            nameVi, nameEn, coverImage,
            addressVi, addressEn,
            hotline, hoursVi, hoursEn,
            mapsEmbed,
          }}
        />
      )}
    </div>
  );
}

function CategoryEntityForm({ idOrSlug }: { idOrSlug?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = idOrSlug || searchParams.get("edit");
  const isEdit = Boolean(editSlug);

  const [englishEnabled, setEnglishEnabled] = useState(isEdit);
  const [aiFilling, setAiFilling] = useState(false);
  const [aiFillSuccess, setAiFillSuccess] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [seoTitleVi, setSeoTitleVi] = useState("");
  const [seoDescVi, setSeoDescVi] = useState("");
  const [seoTitleEn, setSeoTitleEn] = useState("");
  const [seoDescEn, setSeoDescEn] = useState("");
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [nameVi, setNameVi] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descriptionVi, setDescriptionVi] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [parentGroup, setParentGroup] = useState("wood");
  const [parentId, setParentId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");

  // Load all categories for parent selector
  useEffect(() => {
    import("@/lib/supabase/admin-queries").then(async ({ getAdminCategories }) => {
      try {
        const res = await getAdminCategories();
        setCategoriesList(res || []);
      } catch (err) {
        console.error("Failed to load categories list:", err);
      }
    });
  }, []);

  // Sync state with edit entity from DB
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (editSlug) {
      setIsLoadingEdit(true);
      setLoadError("");
      import("@/lib/supabase/admin-queries")
        .then(async ({ getAdminCategories }) => {
          const cats = await getAdminCategories();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const match = (cats as any[]).find((c: any) => c.slug === editSlug || c.id === editSlug);
          if (match) {
            setCategoryId(match.id);
            setNameVi(match.name || "");
            setNameEn(match.name_en || "");
            setDescriptionVi(match.description || "");
            setDescriptionEn(match.description_en || "");
            setParentGroup(match.group_key || match.parent_group || "wood");
            setParentId(match.parent_id || null);
            setSlug(match.slug || "");
            setCoverImage(match.cover_image_url || match.image || "");
            setSeoTitleVi(match.seo_title_vi || `${match.name || ""} | Đồ Gỗ Phương Đông`);
            setSeoTitleEn(match.seo_title_en || `${match.name_en || match.name || ""} | Phuong Dong`);
            setSeoDescVi(match.seo_description_vi || match.description || "");
            setSeoDescEn(match.seo_description_en || match.description_en || "");
            setEnglishEnabled(Boolean(match.name_en));
            setStatus(match.status || "draft");
          } else {
            setLoadError(`Không tìm thấy danh mục: ${editSlug}`);
          }
        })
        .catch((err) => {
          console.error("Failed to load category for edit:", err);
          setLoadError("Không thể tải dữ liệu danh mục từ máy chủ.");
        })
        .finally(() => setIsLoadingEdit(false));
    } else {
      // Clear for create mode
      setCategoryId(null);
      setNameVi("");
      setNameEn("");
      setDescriptionVi("");
      setDescriptionEn("");
      setParentGroup("wood");
      setParentId(null);
      setSlug("");
      setCoverImage("");
      setSeoTitleVi("");
      setSeoDescVi("");
      setSeoTitleEn("");
      setSeoDescEn("");
      setEnglishEnabled(false);
      setStatus("draft");
    }
  }, [editSlug]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleAiFill = async () => {
    if (!nameVi.trim()) return;
    setAiFilling(true);
    setAiFillSuccess(false);
    try {
      const res = await fetch("/api/admin/ai/generate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "generate-content",
          targetType: "category",
          inputText: nameVi,
          targetLocale: englishEnabled ? "en" : "vi",
        }),
      });
      if (res.ok) {
        const result = await res.json();
        const data = result.data || {};
        if (data.enTitle) setNameEn(data.enTitle);
        if (data.enSummary || data.enBody) setDescriptionEn(data.enSummary || data.enBody);
        if (data.seoTitleVi) setSeoTitleVi(data.seoTitleVi);
        if (data.seoTitleEn) setSeoTitleEn(data.seoTitleEn);
        if (data.seoDescVi) setSeoDescVi(data.seoDescVi);
        if (data.seoDescEn) setSeoDescEn(data.seoDescEn);
      } else {
        // Graceful fallback for AI errors — use basic pattern
        setNameEn(`${nameVi} Collection`);
        if (descriptionVi) setDescriptionEn(`English: ${descriptionVi}`);
        setSeoTitleVi(`${nameVi} | Đồ Gỗ Phương Đông`);
        setSeoTitleEn(`${nameVi} | Phuong Dong Premium Furniture`);
        setSeoDescVi(`Mua ngay ${nameVi} chính hãng tại Phương Đông.`);
        setSeoDescEn(`Shop premium ${nameVi} at Phuong Dong.`);
      }
      setAiFillSuccess(true);
    } catch {
      // Graceful fallback
      setNameEn(`${nameVi} Collection`);
      setSeoTitleVi(`${nameVi} | Đồ Gỗ Phương Đông`);
      setSeoTitleEn(`${nameVi} | Phuong Dong`);
      setAiFillSuccess(true);
    } finally {
      setAiFilling(false);
    }
  };

  const handleSave = async (targetStatus?: "draft" | "published" | "archived") => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    const statusToSave = targetStatus || status;

    const payload = {
      slug: slug.trim(),
      name_vi: nameVi.trim(),
      name_en: englishEnabled ? nameEn.trim() : "",
      description_vi: descriptionVi.trim() || null,
      description_en: englishEnabled && descriptionEn.trim() ? descriptionEn.trim() : null,
      parent_id: parentId || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      group_key: parentGroup as any,
      status: statusToSave,
      sort_order: 0,
      cover_image: coverImage || null,
      seo_title_vi: seoTitleVi.trim() || null,
      seo_title_en: englishEnabled && seoTitleEn.trim() ? seoTitleEn.trim() : null,
      seo_description_vi: seoDescVi.trim() || null,
      seo_description_en: englishEnabled && seoDescEn.trim() ? seoDescEn.trim() : null,
    };

    try {
      const { categorySchema } = await import("@/lib/validations/admin");
      const validation = categorySchema.safeParse(payload);
      if (!validation.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const msgs = validation.error.issues.map((e: any) => e.message).join(". ");
        setSaveError(msgs);
        setIsSaving(false);
        return;
      }

      const { createAdminCategory, updateAdminCategory } = await import("@/lib/supabase/mutations");
      let res;
      if (isEdit && categoryId) {
        res = await updateAdminCategory(categoryId, payload);
      } else {
        res = await createAdminCategory(payload);
      }

      if (res.success) {
        setSaveSuccess(true);
        router.push("/admin/categories");
        router.refresh();
      } else {
        setSaveError(res.error || "Không thể lưu danh mục.");
      }
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setIsSaving(false);
    }
  };

  const validationErrors: string[] = [];
  if (!nameVi.trim()) validationErrors.push("Cần nhập tên danh mục tiếng Việt.");
  if (!slug.trim()) validationErrors.push("Cần nhập đường dẫn (slug).");
  if (englishEnabled && !nameEn.trim()) validationErrors.push("Cần nhập tên danh mục tiếng Anh khi đã bật tiếng Anh.");

  if (isLoadingEdit) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-slate-500 font-medium">Đang tải dữ liệu danh mục...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center text-red-700">
        <p className="font-semibold">{loadError}</p>
        <button
          type="button"
          className="button-pd mt-4"
          onClick={() => router.push("/admin/categories")}
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        {/* --- Bật tiếng Anh và điền bằng AI --- */}
        <section className="surface-soft p-4">
          <div className="flex flex-col justify-between gap-3 border-b border-[var(--admin-border)] pb-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <Languages className="size-5 text-[var(--admin-accent)]" />
              <h3 className="admin-section-title-pd">Bản dịch tiếng Anh</h3>
            </div>
            {englishEnabled && (
              <button
                type="button"
                className="button-pd-outline py-1 px-3 text-xs flex items-center gap-1.5"
                onClick={handleAiFill}
                disabled={aiFilling}
                aria-label="Dịch từ tiếng Việt bằng AI"
              >
                {aiFilling ? (
                  <><Loader2 className="size-3.5 animate-spin" />Đang dịch...</>
                ) : (
                  <><Languages className="size-3.5" />Dịch bằng AI</>
                )}
              </button>
            )}
          </div>
          <div className="mt-4">
            <div className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all duration-300 w-full ${
              englishEnabled 
                ? "border-indigo-200 bg-gradient-to-r from-indigo-50/30 to-violet-50/30 shadow-[0_4px_20px_rgba(99,102,241,0.06)]" 
                : "border-slate-200 bg-slate-50/40"
            }`}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 rounded-lg p-2 ${englishEnabled ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"}`}>
                  <Languages className="size-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Dịch nội dung sang tiếng Anh
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                    Kích hoạt dịch tiếng Anh cho tên danh mục, mô tả và các thẻ SEO.
                  </span>
                </div>
              </div>
              
              <label className="inline-flex items-center gap-3 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={englishEnabled}
                  aria-label="Bật trường tiếng Anh"
                  onChange={(e) => setEnglishEnabled(e.target.checked)}
                />
                <span className="relative inline-flex h-5 w-9 shrink-0 rounded-full border border-slate-300 bg-slate-200 transition-colors duration-200 after:absolute after:left-[2px] after:top-[2px] after:size-4 after:rounded-full after:bg-white after:shadow-[0_2px_4px_rgba(0,0,0,0.1)] after:transition-transform peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:after:translate-x-4" />
              </label>
            </div>
          </div>
          {aiFillSuccess && (
            <p className="mt-3 text-emerald-700 text-xs bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              AI đã điền các trường tiếng Anh. Vui lòng rà soát và chỉnh sửa khi cần.
            </p>
          )}
        </section>

        <section className="surface-soft p-4">
          <WorkflowIntro
            icon={Tag}
            title="Hồ sơ danh mục"
            description="Nhóm sản phẩm cấp cao được giữ cố định; biên tập viên tạo danh mục con với trường song ngữ và SEO sẵn sàng."
          />
          <div className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <AdminField 
                label="Tên danh mục - Tiếng Việt" 
                name="category-name-vi" 
                value={nameVi} 
                onChange={setNameVi} 
              />
              <AdminField 
                label="Tên danh mục - Tiếng Anh" 
                name="category-name-en" 
                value={nameEn} 
                onChange={setNameEn}
                disabled={!englishEnabled}
                placeholder={!englishEnabled ? "Bật bản dịch tiếng Anh để chỉnh sửa" : ""}
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <label className="grid gap-2">
                <span className="label-pd">Nhóm cha</span>
                <PremiumSelect
                  value={parentGroup}
                  onValueChange={setParentGroup}
                  ariaLabel="Nhóm cha"
                  placeholder="Nhóm cha"
                  tone="admin"
                  options={[
                    { value: "wood", label: "Nội thất gỗ" },
                    { value: "sanitary", label: "Thiết bị vệ sinh" },
                    { value: "tiles", label: "Gạch ốp lát" },
                  ]}
                />
              </label>
              <label className="grid gap-2">
                <span className="label-pd">Danh mục cha</span>
                <PremiumSelect
                  value={parentId || ""}
                  onValueChange={(val) => setParentId(val || null)}
                  ariaLabel="Danh mục cha"
                  placeholder="Danh mục cha (Tùy chọn)"
                  tone="admin"
                  options={[
                    { value: "", label: "Không có (Danh mục cấp 1)" },
                    ...categoriesList
                      .filter((c) => c.id !== categoryId) // Không chọn chính nó
                      .map((c) => ({
                        value: c.id,
                        label: c.name || c.slug,
                      })),
                  ]}
                />
              </label>
              <AdminField label="Đường dẫn" name="category-slug" value={slug} onChange={setSlug} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <AdminField 
                label="Mô tả danh mục - Tiếng Việt" 
                name="category-description-vi" 
                value={descriptionVi} 
                onChange={setDescriptionVi} 
                multiline
              />
              <AdminField 
                label="Mô tả danh mục - Tiếng Anh" 
                name="category-description-en" 
                value={descriptionEn} 
                onChange={setDescriptionEn}
                disabled={!englishEnabled}
                placeholder={!englishEnabled ? "Bật bản dịch tiếng Anh để chỉnh sửa" : ""}
                multiline
              />
            </div>
          </div>
        </section>

        {/* --- SEO Fields --- */}
        <SeoFieldset
          kind="category"
          seoTitleVi={seoTitleVi}
          setSeoTitleVi={setSeoTitleVi}
          seoTitleEn={seoTitleEn}
          setSeoTitleEn={setSeoTitleEn}
          seoDescVi={seoDescVi}
          setSeoDescVi={setSeoDescVi}
          seoDescEn={seoDescEn}
          setSeoDescEn={setSeoDescEn}
          englishEnabled={englishEnabled}
          viTitle={nameVi}
          enTitle={nameEn}
        />
      </div>
      <aside className="space-y-5">
        <section className="surface-soft p-4 space-y-4">
          <h3 className="admin-section-title-pd">Ảnh bìa danh mục</h3>
          <ImageUploadDropzone value={coverImage} onChange={setCoverImage} label="Tải ảnh danh mục lên" />
        </section>
        <section className="surface-soft p-4">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-bold hover:from-sky-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="size-4" />
            Xem trước
          </button>
        </section>
        
        {saveError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
            <strong className="block font-semibold">Lỗi lưu trữ:</strong>
            <p className="mt-1">{saveError}</p>
          </div>
        )}
        {saveSuccess && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700">
            <strong className="block font-semibold">Thành công!</strong>
            <p className="mt-1">Dữ liệu danh mục đã được lưu trữ vào cơ sở dữ liệu.</p>
          </div>
        )}

        <PublishWorkflow 
          status={status}
          onStatusChange={setStatus}
          errors={validationErrors} 
          onSaveDraft={() => handleSave("draft")}
          onPublish={() => handleSave("published")}
          onArchive={() => handleSave("archived")}
        />
      </aside>
      {previewOpen && (
        <DetailPreviewModal
          kind="category"
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          data={{
            nameVi, nameEn, coverImage,
            descriptionVi, descriptionEn,
            slug,
          }}
        />
      )}
    </div>
  );
}

export function SettingsOperationsPanel() {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTab: SettingsTab = requestedTab === "contact" || requestedTab === "seo" || requestedTab === "integrations" || requestedTab === "sections"
    ? requestedTab
    : "identity";
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const desktopPreviewId = useId();
  const mobilePreviewId = useId();
  
  // Settings States
  const [brandNameVi, setBrandNameVi] = useState(settingsHomepageDefaults.brandNameVi);
  const [brandNameEn, setBrandNameEn] = useState(settingsHomepageDefaults.brandNameEn);
  const [logoUrl, setLogoUrl] = useState("https://phuongdong.vn/logo.png");
  const [faviconUrl, setFaviconUrl] = useState("https://phuongdong.vn/favicon.ico");
  
  const [contactPhone, setContactPhone] = useState("0908 247 688");
  const [contactEmail, setContactEmail] = useState("contact@phuongdong.vn");
  const [addressVi, setAddressVi] = useState("124 Nguyễn Thị Thập, Quận 7, TP. Hồ Chí Minh");
  const [addressEn, setAddressEn] = useState("124 Nguyen Thi Thap, District 7, Ho Chi Minh City");
  const [defaultLocale, setDefaultLocale] = useState("vi");

  const [seoTitleVi, setSeoTitleVi] = useState("Đồ Gỗ Nội Thất & Thiết Bị Vệ Sinh Phương Đông");
  const [seoTitleEn, setSeoTitleEn] = useState("Phuong Dong - Premium Furniture & Sanitary Ware");
  const [seoDescVi, setSeoDescVi] = useState("Showroom Phương Đông chuyên cung cấp đồ gỗ nội thất tự nhiên cao cấp và thiết bị vệ sinh nhập khẩu chính hãng.");
  const [seoDescEn, setSeoDescEn] = useState("Phuong Dong Showroom specializes in premium solid natural wood furniture and genuine imported sanitary ware.");

  const [resendKey, setResendKey] = useState("re_123456789abcdef");
  const [cloudinaryPreset, setCloudinaryPreset] = useState("phuongdong_unsigned_preset");
  const [openaiKey, setOpenaiKey] = useState("sk-proj-••••••••••••••••");
  const [slaHours, setSlaHours] = useState("24");

  // Site Sections State
  const [heroHeadlineVi, setHeroHeadlineVi] = useState(settingsHomepageDefaults.heroHeadlineVi);
  const [heroHeadlineEn, setHeroHeadlineEn] = useState(settingsHomepageDefaults.heroHeadlineEn);
  const [heroSubtitleVi, setHeroSubtitleVi] = useState(settingsHomepageDefaults.heroSubtitleVi);
  const [heroSubtitleEn, setHeroSubtitleEn] = useState(settingsHomepageDefaults.heroSubtitleEn);
  const [heroCtaLabel, setHeroCtaLabel] = useState(settingsHomepageDefaults.heroCtaLabel);
  const [heroCtaLink, setHeroCtaLink] = useState(settingsHomepageDefaults.heroCtaLink);
  const [heroVisible, setHeroVisible] = useState(true);
  const [heroImage1, setHeroImage1] = useState(settingsHomepageDefaults.heroImage1);
  const [aboutVisible, setAboutVisible] = useState(true);
  const [featuredVisible, setFeaturedVisible] = useState(true);
  const [featuredMaxItems, setFeaturedMaxItems] = useState(settingsHomepageDefaults.featuredMaxItems);
  const [blogSectionVisible, setBlogSectionVisible] = useState(true);
  const [blogMaxPosts, setBlogMaxPosts] = useState(settingsHomepageDefaults.blogMaxPosts);
  const [blogHeadingVi, setBlogHeadingVi] = useState(settingsHomepageDefaults.blogHeadingVi);
  const [blogHeadingEn, setBlogHeadingEn] = useState(settingsHomepageDefaults.blogHeadingEn);
  const [trustBadgesVisible, setTrustBadgesVisible] = useState(true);

  // Additional Homepage Section States (Issue 7)
  const [slide2TitleVi, setSlide2TitleVi] = useState(settingsHomepageDefaults.slide2TitleVi);
  const [slide2TitleEn, setSlide2TitleEn] = useState(settingsHomepageDefaults.slide2TitleEn);
  const [slide2LeadVi, setSlide2LeadVi] = useState(settingsHomepageDefaults.slide2LeadVi);
  const [slide2LeadEn, setSlide2LeadEn] = useState(settingsHomepageDefaults.slide2LeadEn);
  const [slide2Image, setSlide2Image] = useState(settingsHomepageDefaults.slide2Image);

  const [slide3TitleVi, setSlide3TitleVi] = useState(settingsHomepageDefaults.slide3TitleVi);
  const [slide3TitleEn, setSlide3TitleEn] = useState(settingsHomepageDefaults.slide3TitleEn);
  const [slide3LeadVi, setSlide3LeadVi] = useState(settingsHomepageDefaults.slide3LeadVi);
  const [slide3LeadEn, setSlide3LeadEn] = useState(settingsHomepageDefaults.slide3LeadEn);
  const [slide3Image, setSlide3Image] = useState(settingsHomepageDefaults.slide3Image);

  const [aboutHeadingVi, setAboutHeadingVi] = useState(settingsHomepageDefaults.aboutHeadingVi);
  const [aboutHeadingEn, setAboutHeadingEn] = useState(settingsHomepageDefaults.aboutHeadingEn);
  const [aboutLeadVi, setAboutLeadVi] = useState(settingsHomepageDefaults.aboutLeadVi);
  const [aboutLeadEn, setAboutLeadEn] = useState(settingsHomepageDefaults.aboutLeadEn);
  const [aboutImage, setAboutImage] = useState(settingsHomepageDefaults.aboutImage);

  const [badge1ValueVi, setBadge1ValueVi] = useState<string>(settingsHomepageDefaults.badge1ValueVi);
  const [badge1ValueEn, setBadge1ValueEn] = useState<string>(settingsHomepageDefaults.badge1ValueEn);
  const [badge1DescVi, setBadge1DescVi] = useState<string>(settingsHomepageDefaults.badge1DescVi);
  const [badge1DescEn, setBadge1DescEn] = useState<string>(settingsHomepageDefaults.badge1DescEn);

  const [badge2ValueVi, setBadge2ValueVi] = useState<string>(settingsHomepageDefaults.badge2ValueVi);
  const [badge2ValueEn, setBadge2ValueEn] = useState<string>(settingsHomepageDefaults.badge2ValueEn);
  const [badge2DescVi, setBadge2DescVi] = useState<string>(settingsHomepageDefaults.badge2DescVi);
  const [badge2DescEn, setBadge2DescEn] = useState<string>(settingsHomepageDefaults.badge2DescEn);

  // Showroom & Quote Section States
  const [showroomVisible, setShowroomVisible] = useState(true);
  const [showroomHeadingVi, setShowroomHeadingVi] = useState(settingsHomepageDefaults.showroomHeadingVi);
  const [showroomHeadingEn, setShowroomHeadingEn] = useState(settingsHomepageDefaults.showroomHeadingEn);
  const [showroomLeadVi, setShowroomLeadVi] = useState(settingsHomepageDefaults.showroomLeadVi);
  const [showroomLeadEn, setShowroomLeadEn] = useState(settingsHomepageDefaults.showroomLeadEn);
  const [showroomCtaVi, setShowroomCtaVi] = useState(settingsHomepageDefaults.showroomCtaVi);
  const [showroomCtaEn, setShowroomCtaEn] = useState(settingsHomepageDefaults.showroomCtaEn);
  const [showroomBgImage, setShowroomBgImage] = useState(settingsHomepageDefaults.showroomBgImage);

  const [quoteVisible, setQuoteVisible] = useState(true);
  const [quoteHeadingVi, setQuoteHeadingVi] = useState(settingsHomepageDefaults.quoteHeadingVi);
  const [quoteHeadingEn, setQuoteHeadingEn] = useState(settingsHomepageDefaults.quoteHeadingEn);
  const [quoteLeadVi, setQuoteLeadVi] = useState(settingsHomepageDefaults.quoteLeadVi);
  const [quoteLeadEn, setQuoteLeadEn] = useState(settingsHomepageDefaults.quoteLeadEn);

  // Track Unsaved Changes
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [clientReady, setClientReady] = useState(false);

  const markDirty = () => {
    setIsDirty(true);
    setSaveSuccess(false);
  };

  // Load from server settings API on mount
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setClientReady(true);
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) {
          throw new Error("Không thể tải cấu hình từ server");
        }
        const data = await res.json();
        if (data.brandNameVi !== undefined) setBrandNameVi(data.brandNameVi);
        if (data.brandNameEn !== undefined) setBrandNameEn(data.brandNameEn);
        if (data.logoUrl !== undefined) setLogoUrl(data.logoUrl);
        if (data.faviconUrl !== undefined) setFaviconUrl(data.faviconUrl);
        if (data.contactPhone !== undefined) setContactPhone(data.contactPhone);
        if (data.contactEmail !== undefined) setContactEmail(data.contactEmail);
        if (data.addressVi !== undefined) setAddressVi(data.addressVi);
        if (data.addressEn !== undefined) setAddressEn(data.addressEn);
        if (data.defaultLocale !== undefined) setDefaultLocale(data.defaultLocale);
        if (data.seoTitleVi !== undefined) setSeoTitleVi(data.seoTitleVi);
        if (data.seoTitleEn !== undefined) setSeoTitleEn(data.seoTitleEn);
        if (data.seoDescVi !== undefined) setSeoDescVi(data.seoDescVi);
        if (data.seoDescEn !== undefined) setSeoDescEn(data.seoDescEn);
        if (data.resendKey !== undefined) setResendKey(data.resendKey);
        if (data.cloudinaryPreset !== undefined) setCloudinaryPreset(data.cloudinaryPreset);
        if (data.openaiKey !== undefined) setOpenaiKey(data.openaiKey);
        if (data.slaHours !== undefined) setSlaHours(data.slaHours);
        if (data.heroHeadlineVi !== undefined) setHeroHeadlineVi(data.heroHeadlineVi);
        if (data.heroHeadlineEn !== undefined) setHeroHeadlineEn(data.heroHeadlineEn);
        if (data.heroSubtitleVi !== undefined) setHeroSubtitleVi(data.heroSubtitleVi);
        if (data.heroSubtitleEn !== undefined) setHeroSubtitleEn(data.heroSubtitleEn);
        if (data.heroCtaLabel !== undefined) setHeroCtaLabel(data.heroCtaLabel);
        if (data.heroCtaLink !== undefined) setHeroCtaLink(data.heroCtaLink);
        if (data.heroVisible !== undefined) setHeroVisible(data.heroVisible);
        if (data.heroImage1 !== undefined) setHeroImage1(data.heroImage1);
        if (data.aboutVisible !== undefined) setAboutVisible(data.aboutVisible);
        if (data.slide2TitleVi !== undefined) setSlide2TitleVi(data.slide2TitleVi);
        if (data.slide2TitleEn !== undefined) setSlide2TitleEn(data.slide2TitleEn);
        if (data.slide2LeadVi !== undefined) setSlide2LeadVi(data.slide2LeadVi);
        if (data.slide2LeadEn !== undefined) setSlide2LeadEn(data.slide2LeadEn);
        if (data.slide2Image !== undefined) setSlide2Image(data.slide2Image);
        if (data.slide3TitleVi !== undefined) setSlide3TitleVi(data.slide3TitleVi);
        if (data.slide3TitleEn !== undefined) setSlide3TitleEn(data.slide3TitleEn);
        if (data.slide3LeadVi !== undefined) setSlide3LeadVi(data.slide3LeadVi);
        if (data.slide3LeadEn !== undefined) setSlide3LeadEn(data.slide3LeadEn);
        if (data.slide3Image !== undefined) setSlide3Image(data.slide3Image);
        if (data.aboutHeadingVi !== undefined) setAboutHeadingVi(data.aboutHeadingVi);
        if (data.aboutHeadingEn !== undefined) setAboutHeadingEn(data.aboutHeadingEn);
        if (data.aboutLeadVi !== undefined) setAboutLeadVi(data.aboutLeadVi);
        if (data.aboutLeadEn !== undefined) setAboutLeadEn(data.aboutLeadEn);
        if (data.aboutImage !== undefined) setAboutImage(data.aboutImage);
        if (data.featuredVisible !== undefined) setFeaturedVisible(data.featuredVisible);
        if (data.featuredMaxItems !== undefined) setFeaturedMaxItems(data.featuredMaxItems);
        if (data.blogSectionVisible !== undefined) setBlogSectionVisible(data.blogSectionVisible);
        if (data.blogMaxPosts !== undefined) setBlogMaxPosts(data.blogMaxPosts);
        if (data.blogHeadingVi !== undefined) setBlogHeadingVi(data.blogHeadingVi);
        if (data.blogHeadingEn !== undefined) setBlogHeadingEn(data.blogHeadingEn);
        if (data.trustBadgesVisible !== undefined) setTrustBadgesVisible(data.trustBadgesVisible);
        if (data.badge1ValueVi !== undefined) setBadge1ValueVi(data.badge1ValueVi);
        if (data.badge1ValueEn !== undefined) setBadge1ValueEn(data.badge1ValueEn);
        if (data.badge1DescVi !== undefined) setBadge1DescVi(data.badge1DescVi);
        if (data.badge1DescEn !== undefined) setBadge1DescEn(data.badge1DescEn);
        if (data.badge2ValueVi !== undefined) setBadge2ValueVi(data.badge2ValueVi);
        if (data.badge2ValueEn !== undefined) setBadge2ValueEn(data.badge2ValueEn);
        if (data.badge2DescVi !== undefined) setBadge2DescVi(data.badge2DescVi);
        if (data.badge2DescEn !== undefined) setBadge2DescEn(data.badge2DescEn);
        
        if (data.showroomVisible !== undefined) setShowroomVisible(data.showroomVisible);
        if (data.showroomHeadingVi !== undefined) setShowroomHeadingVi(data.showroomHeadingVi);
        if (data.showroomHeadingEn !== undefined) setShowroomHeadingEn(data.showroomHeadingEn);
        if (data.showroomLeadVi !== undefined) setShowroomLeadVi(data.showroomLeadVi);
        if (data.showroomLeadEn !== undefined) setShowroomLeadEn(data.showroomLeadEn);
        if (data.showroomCtaVi !== undefined) setShowroomCtaVi(data.showroomCtaVi);
        if (data.showroomCtaEn !== undefined) setShowroomCtaEn(data.showroomCtaEn);
        if (data.showroomBgImage !== undefined) setShowroomBgImage(data.showroomBgImage);
        
        if (data.quoteVisible !== undefined) setQuoteVisible(data.quoteVisible);
        if (data.quoteHeadingVi !== undefined) setQuoteHeadingVi(data.quoteHeadingVi);
        if (data.quoteHeadingEn !== undefined) setQuoteHeadingEn(data.quoteHeadingEn);
        if (data.quoteLeadVi !== undefined) setQuoteLeadVi(data.quoteLeadVi);
        if (data.quoteLeadEn !== undefined) setQuoteLeadEn(data.quoteLeadEn);
      } catch (e) {
        console.error("Lỗi khi tải cấu hình settings:", e);
      }
    };
    loadSettings();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSave = async () => {
    // Validate Email
    if (!contactEmail.includes("@") || !contactEmail.includes(".")) {
      setEmailError("Vui lòng nhập email liên hệ hợp lệ.");
      return;
    }
    setEmailError("");
    
    setIsSaving(true);
    try {
      const settingsData = {
        brandNameVi,
        brandNameEn,
        logoUrl,
        faviconUrl,
        contactPhone,
        contactEmail,
        addressVi,
        addressEn,
        defaultLocale,
        seoTitleVi,
        seoTitleEn,
        seoDescVi,
        seoDescEn,
        resendKey,
        cloudinaryPreset,
        openaiKey, // Sẽ được API Route giải thích là gemini_api_key
        slaHours,
        heroHeadlineVi,
        heroHeadlineEn,
        heroSubtitleVi,
        heroSubtitleEn,
        heroCtaLabel,
        heroCtaLink,
        heroVisible,
        heroImage1,
        aboutVisible,
        slide2TitleVi,
        slide2TitleEn,
        slide2LeadVi,
        slide2LeadEn,
        slide2Image,
        slide3TitleVi,
        slide3TitleEn,
        slide3LeadVi,
        slide3LeadEn,
        slide3Image,
        aboutHeadingVi,
        aboutHeadingEn,
        aboutLeadVi,
        aboutLeadEn,
        aboutImage,
        featuredVisible,
        featuredMaxItems,
        blogSectionVisible,
        blogMaxPosts,
        blogHeadingVi,
        blogHeadingEn,
        trustBadgesVisible,
        badge1ValueVi,
        badge1ValueEn,
        badge1DescVi,
        badge1DescEn,
        badge2ValueVi,
        badge2ValueEn,
        badge2DescVi,
        badge2DescEn,
        showroomVisible,
        showroomHeadingVi,
        showroomHeadingEn,
        showroomLeadVi,
        showroomLeadEn,
        showroomCtaVi,
        showroomCtaEn,
        showroomBgImage,
        quoteVisible,
        quoteHeadingVi,
        quoteHeadingEn,
        quoteLeadVi,
        quoteLeadEn,
      };

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsData),
      });

      if (!res.ok) {
        throw new Error("Lỗi mạng khi cập nhật settings");
      }

      const resData = await res.json();
      if (resData.success) {
        setIsDirty(false);
        setSaveSuccess(true);
        // Tải lại settings để cập nhật các key đã được masked (ví dụ: ****5678)
        const getRes = await fetch("/api/admin/settings");
        if (getRes.ok) {
          const freshData = await getRes.json();
          if (freshData.resendKey !== undefined) setResendKey(freshData.resendKey);
          if (freshData.openaiKey !== undefined) setOpenaiKey(freshData.openaiKey);
        }
      } else {
        alert("Lỗi lưu cấu hình: " + (resData.error || "Không rõ nguyên nhân"));
      }
    } catch (err) {
      alert("Đã xảy ra lỗi: " + (err instanceof Error ? err.message : err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) {
        throw new Error("Không thể tải cấu hình");
      }
      const data = await res.json();
      setBrandNameVi(data.brandNameVi || settingsHomepageDefaults.brandNameVi);
      setBrandNameEn(data.brandNameEn || settingsHomepageDefaults.brandNameEn);
      setLogoUrl(data.logoUrl || "https://phuongdong.vn/logo.png");
      setFaviconUrl(data.faviconUrl || "https://phuongdong.vn/favicon.ico");
      setContactPhone(data.contactPhone || "0908 247 688");
      setContactEmail(data.contactEmail || "contact@phuongdong.vn");
      setAddressVi(data.addressVi || "124 Nguyễn Thị Thập, Quận 7, TP. Hồ Chí Minh");
      setAddressEn(data.addressEn || "124 Nguyen Thi Thap, District 7, Ho Chi Minh City");
      setDefaultLocale(data.defaultLocale || "vi");
      setSeoTitleVi(data.seoTitleVi || "Đồ Gỗ Nội Thất & Thiết Bị Vệ Sinh Phương Đông");
      setSeoTitleEn(data.seoTitleEn || "Phuong Dong - Premium Furniture & Sanitary Ware");
      setSeoDescVi(data.seoDescVi || "Showroom Phương Đông chuyên cung cấp đồ gỗ nội thất tự nhiên cao cấp và thiết bị vệ sinh nhập khẩu chính hãng.");
      setSeoDescEn(data.seoDescEn || "Phuong Dong Showroom specializes in premium solid natural wood furniture and genuine imported sanitary ware.");
      setResendKey(data.resendKey || "re_123456789abcdef");
      setCloudinaryPreset(data.cloudinaryPreset || "phuongdong_unsigned_preset");
      setOpenaiKey(data.openaiKey || "sk-proj-••••••••••••••••");
      setSlaHours(data.slaHours || "24");
      
      setHeroHeadlineVi(data.heroHeadlineVi || settingsHomepageDefaults.heroHeadlineVi);
      setHeroHeadlineEn(data.heroHeadlineEn || settingsHomepageDefaults.heroHeadlineEn);
      setHeroSubtitleVi(data.heroSubtitleVi || settingsHomepageDefaults.heroSubtitleVi);
      setHeroSubtitleEn(data.heroSubtitleEn || settingsHomepageDefaults.heroSubtitleEn);
      setHeroCtaLabel(data.heroCtaLabel || settingsHomepageDefaults.heroCtaLabel);
      setHeroCtaLink(data.heroCtaLink || settingsHomepageDefaults.heroCtaLink);
      setHeroVisible(data.heroVisible !== undefined ? data.heroVisible : true);
      setHeroImage1(data.heroImage1 || settingsHomepageDefaults.heroImage1);
      
      setAboutVisible(data.aboutVisible !== undefined ? data.aboutVisible : true);
      setSlide2TitleVi(data.slide2TitleVi || settingsHomepageDefaults.slide2TitleVi);
      setSlide2TitleEn(data.slide2TitleEn || settingsHomepageDefaults.slide2TitleEn);
      setSlide2LeadVi(data.slide2LeadVi || settingsHomepageDefaults.slide2LeadVi);
      setSlide2LeadEn(data.slide2LeadEn || settingsHomepageDefaults.slide2LeadEn);
      setSlide2Image(data.slide2Image || settingsHomepageDefaults.slide2Image);
      
      setSlide3TitleVi(data.slide3TitleVi || settingsHomepageDefaults.slide3TitleVi);
      setSlide3TitleEn(data.slide3TitleEn || settingsHomepageDefaults.slide3TitleEn);
      setSlide3LeadVi(data.slide3LeadVi || settingsHomepageDefaults.slide3LeadVi);
      setSlide3LeadEn(data.slide3LeadEn || settingsHomepageDefaults.slide3LeadEn);
      setSlide3Image(data.slide3Image || settingsHomepageDefaults.slide3Image);
      
      setAboutHeadingVi(data.aboutHeadingVi || settingsHomepageDefaults.aboutHeadingVi);
      setAboutHeadingEn(data.aboutHeadingEn || settingsHomepageDefaults.aboutHeadingEn);
      setAboutLeadVi(data.aboutLeadVi || settingsHomepageDefaults.aboutLeadVi);
      setAboutLeadEn(data.aboutLeadEn || settingsHomepageDefaults.aboutLeadEn);
      setAboutImage(data.aboutImage || settingsHomepageDefaults.aboutImage);
      
      setFeaturedVisible(data.featuredVisible !== undefined ? data.featuredVisible : true);
      setFeaturedMaxItems(data.featuredMaxItems || settingsHomepageDefaults.featuredMaxItems);
      setBlogSectionVisible(data.blogSectionVisible !== undefined ? data.blogSectionVisible : true);
      setBlogMaxPosts(data.blogMaxPosts || settingsHomepageDefaults.blogMaxPosts);
      setBlogHeadingVi(data.blogHeadingVi || settingsHomepageDefaults.blogHeadingVi);
      setBlogHeadingEn(data.blogHeadingEn || settingsHomepageDefaults.blogHeadingEn);
      
      setTrustBadgesVisible(data.trustBadgesVisible !== undefined ? data.trustBadgesVisible : true);
      setBadge1ValueVi(data.badge1ValueVi || settingsHomepageDefaults.badge1ValueVi);
      setBadge1ValueEn(data.badge1ValueEn || settingsHomepageDefaults.badge1ValueEn);
      setBadge1DescVi(data.badge1DescVi || settingsHomepageDefaults.badge1DescVi);
      setBadge1DescEn(data.badge1DescEn || settingsHomepageDefaults.badge1DescEn);
      setBadge2ValueVi(data.badge2ValueVi || settingsHomepageDefaults.badge2ValueVi);
      setBadge2ValueEn(data.badge2ValueEn || settingsHomepageDefaults.badge2ValueEn);
      setBadge2DescVi(data.badge2DescVi || settingsHomepageDefaults.badge2DescVi);
      setBadge2DescEn(data.badge2DescEn || settingsHomepageDefaults.badge2DescEn);
      
      setShowroomVisible(data.showroomVisible !== undefined ? data.showroomVisible : true);
      setShowroomHeadingVi(data.showroomHeadingVi || settingsHomepageDefaults.showroomHeadingVi);
      setShowroomHeadingEn(data.showroomHeadingEn || settingsHomepageDefaults.showroomHeadingEn);
      setShowroomLeadVi(data.showroomLeadVi || settingsHomepageDefaults.showroomLeadVi);
      setShowroomLeadEn(data.showroomLeadEn || settingsHomepageDefaults.showroomLeadEn);
      setShowroomCtaVi(data.showroomCtaVi || settingsHomepageDefaults.showroomCtaVi);
      setShowroomCtaEn(data.showroomCtaEn || settingsHomepageDefaults.showroomCtaEn);
      setShowroomBgImage(data.showroomBgImage || settingsHomepageDefaults.showroomBgImage);
      
      setQuoteVisible(data.quoteVisible !== undefined ? data.quoteVisible : true);
      setQuoteHeadingVi(data.quoteHeadingVi || settingsHomepageDefaults.quoteHeadingVi);
      setQuoteHeadingEn(data.quoteHeadingEn || settingsHomepageDefaults.quoteHeadingEn);
      setQuoteLeadVi(data.quoteLeadVi || settingsHomepageDefaults.quoteLeadVi);
      setQuoteLeadEn(data.quoteLeadEn || settingsHomepageDefaults.quoteLeadEn);
      
      setIsDirty(false);
      setEmailError("");
      setSaveSuccess(false);
    } catch (err) {
      alert("Không thể hủy thay đổi: " + (err instanceof Error ? err.message : err));
    } finally {
      setIsSaving(false);
    }
  };

  const homepagePreviewProps = {
    heroVisible,
    heroHeadlineVi,
    heroSubtitleVi,
    heroCtaLabel,
    heroCtaLink,
    heroImage1,
    slide2TitleVi,
    slide2LeadVi,
    slide2Image,
    slide3TitleVi,
    slide3LeadVi,
    slide3Image,
    aboutHeadingVi,
    aboutLeadVi,
    aboutImage,
    featuredVisible,
    featuredMaxItems,
    showroomVisible,
    showroomHeadingVi,
    showroomLeadVi,
    showroomCtaVi,
    showroomBgImage,
    quoteVisible,
    quoteHeadingVi,
    quoteLeadVi,
    blogSectionVisible,
    blogHeadingVi,
    blogMaxPosts,
    trustBadgesVisible,
    badge1ValueVi,
    badge1DescVi,
    badge2ValueVi,
    badge2DescVi,
    brandNameVi,
    contactPhone,
  };
  const settingsReadinessItems = [
    { label: "Editor accounts restricted from API tab", state: "ready" },
    { label: "Valid support email routing configured", state: emailError ? "warning" : "ready" },
    { label: "Secrets stay server-only in Payload CMS runtime", state: "ready" },
    { label: "All brand fields localized in VI/EN", state: "ready" },
  ] as const;
  const renderLegacySectionDetails = false;
  const renderHomepagePreview = false;

  return (
    <div className="space-y-5">
        <span
          aria-hidden="true"
          className="sr-only"
          data-ready={clientReady ? "true" : "false"}
          data-testid="settings-client-ready"
        />
        
        {/* --- SETTINGS TABS NAV --- */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-3" role="tablist" aria-label="Các phần cài đặt">
          {([
            { id: "identity", label: "Nhận diện trang", icon: Store },
            { id: "contact", label: "Liên hệ", icon: Sparkles },
            { id: "seo", label: "SEO mặc định", icon: Sparkles },
            { id: "integrations", label: "Tích hợp", icon: Settings2 },
            { id: "sections", label: "Khu vực trang chủ", icon: LayoutDashboard },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border transition ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="size-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* --- UNSAVED CHANGES FLOATING BAR --- */}
        {isDirty && (
          <div className="flex flex-col justify-between gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-800 shadow-sm md:flex-row md:items-center">
            <div className="flex items-center gap-2 text-sm text-yellow-800 font-semibold">
              <AlertTriangle className="size-4 text-yellow-600" />
              Bạn có thay đổi chưa lưu trong Cài đặt hệ thống.
            </div>
            <div className="flex gap-2">
              <button
                className="button-pd-outline py-1.5 px-3 text-xs bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                type="button"
                onClick={handleDiscard}
                disabled={isSaving}
              >
                Bỏ qua
              </button>
              <button
                className="button-pd py-1.5 px-4 text-xs bg-slate-900 text-white hover:bg-slate-800"
                type="button"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-3 animate-spin mr-1.5 inline" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu cài đặt"
                )}
              </button>
            </div>
          </div>
        )}

        {saveSuccess && (
          <p className="text-emerald-700 text-xs font-semibold bg-emerald-50 border border-emerald-100 p-3 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600" />
            Đã cập nhật cài đặt hệ thống thành công!
          </p>
        )}

        {/* --- TAB CONTENT: SITE IDENTITY --- */}
        {activeTab === "identity" && (
          <section className="surface-soft p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-panel)] bg-slate-100 text-slate-800">
                <Store className="size-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-800">Nhận diện trang và thương hiệu</h3>
                <p className="text-xs text-secondary">Tên thương hiệu song ngữ, logo chính thức hiển thị trên header và các favicon.</p>
              </div>
            </div>
            
            <div className="mt-4 grid gap-4 bg-white p-4 rounded-xl border">
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField 
                  label="Tên thương hiệu (Tiếng Việt) *" 
                  name="brand-vi" 
                  value={brandNameVi} 
                  onChange={(val) => { setBrandNameVi(val); markDirty(); }} 
                />
                <AdminField 
                  label="Tên thương hiệu (Tiếng Anh) *" 
                  name="brand-en" 
                  value={brandNameEn} 
                  onChange={(val) => { setBrandNameEn(val); markDirty(); }} 
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <ImageUploadDropzone
                  label="Tải logo lên"
                  value={logoUrl}
                  onChange={(url) => { setLogoUrl(url); markDirty(); }}
                />
                <ImageUploadDropzone
                  label="Tải favicon lên"
                  value={faviconUrl}
                  onChange={(url) => { setFaviconUrl(url); markDirty(); }}
                />
              </div>
            </div>
          </section>
        )}

        {/* --- TAB CONTENT: CONTACT & LOCALES --- */}
        {activeTab === "contact" && (
          <section className="surface-soft p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-panel)] bg-slate-100 text-slate-800">
                <Globe2 className="size-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-800">Thông tin liên hệ và ngôn ngữ</h3>
                <p className="text-xs text-secondary">Số điện thoại liên hệ, email hỗ trợ báo giá và ngôn ngữ mặc định của trang web công cộng.</p>
              </div>
            </div>
            
            <div className="mt-4 grid gap-4 bg-white p-4 rounded-xl border">
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField 
                  label="Hotline tư vấn *" 
                  name="contact-phone" 
                  value={contactPhone} 
                  onChange={(val) => { setContactPhone(val); markDirty(); }} 
                />
                <div className="grid gap-1">
                  <AdminField 
                    label="Email nhận báo giá *" 
                    name="contact-email" 
                    value={contactEmail} 
                    onChange={(val) => { setContactEmail(val); markDirty(); }} 
                  />
                  {emailError && <p className="text-red-500 text-xs font-semibold">{emailError}</p>}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField 
                  label="Địa chỉ trụ sở chính (Tiếng Việt) *" 
                  name="addr-vi" 
                  value={addressVi} 
                  onChange={(val) => { setAddressVi(val); markDirty(); }} 
                  multiline 
                />
                <AdminField 
                  label="Địa chỉ trụ sở chính (Tiếng Anh) *" 
                  name="addr-en" 
                  value={addressEn} 
                  onChange={(val) => { setAddressEn(val); markDirty(); }} 
                  multiline 
                />
              </div>
              <label className="grid gap-2">
                <span className="label-pd">Ngôn ngữ hiển thị mặc định</span>
                <PremiumSelect
                  value={defaultLocale}
                  onValueChange={(val) => { setDefaultLocale(val); markDirty(); }}
                  ariaLabel="Ngôn ngữ mặc định của trang công khai"
                  placeholder="Mặc định"
                  tone="admin"
                  options={[
                    { value: "vi", label: "Tiếng Việt" },
                    { value: "en", label: "Tiếng Anh" },
                  ]}
                />
              </label>
            </div>
          </section>
        )}

        {/* --- TAB CONTENT: SEO DEFAULTS --- */}
        {activeTab === "seo" && (
          <section className="surface-soft p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-panel)] bg-slate-100 text-slate-800">
                <Search className="size-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-800">Mặc định SEO và chia sẻ</h3>
                <p className="text-xs text-secondary">Cấu hình thẻ meta mặc định cho các trang công cộng khi không được ghi đè riêng biệt.</p>
              </div>
            </div>
            
            <div className="mt-4 grid gap-4 bg-white p-4 rounded-xl border">
              <div className="p-3 bg-slate-50 rounded-lg border">
                <p className="text-xs font-bold text-slate-700 mb-2">Thẻ SEO Tiếng Việt</p>
                <div className="space-y-3">
                  <AdminField 
                    label="Tiêu đề SEO mặc định (Tiếng Việt) *" 
                    name="seo-title-vi" 
                    value={seoTitleVi} 
                    onChange={(val) => { setSeoTitleVi(val); markDirty(); }} 
                  />
                  <AdminField 
                    label="Mô tả meta mặc định (Tiếng Việt) *" 
                    name="seo-desc-vi" 
                    value={seoDescVi} 
                    onChange={(val) => { setSeoDescVi(val); markDirty(); }} 
                    multiline 
                  />
                </div>
              </div>
              
              <div className="p-3 bg-indigo-50/10 rounded-lg border border-indigo-100">
                <p className="text-xs font-bold text-indigo-950 mb-2">Thẻ SEO tiếng Anh</p>
                <div className="space-y-3">
                  <AdminField 
                    label="Tiêu đề SEO mặc định (Tiếng Anh) *" 
                    name="seo-title-en" 
                    value={seoTitleEn} 
                    onChange={(val) => { setSeoTitleEn(val); markDirty(); }} 
                  />
                  <AdminField 
                    label="Mô tả meta mặc định (Tiếng Anh) *" 
                    name="seo-desc-en" 
                    value={seoDescEn} 
                    onChange={(val) => { setSeoDescEn(val); markDirty(); }} 
                    multiline 
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- TAB CONTENT: WORKFLOW & INTEGRATIONS --- */}
        {activeTab === "integrations" && (
          <section className="surface-soft p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-panel)] bg-slate-100 text-slate-800">
                  <Lock className="size-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-slate-800">Quy trình và khóa hệ thống</h3>
                  <p className="text-xs text-secondary">Cấu hình khóa API cho Resend, Cloudinary, OpenAI và các chỉ số quản lý vận hành.</p>
                </div>
              </div>
              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded border border-red-200">
                Chỉ quản trị viên
              </span>
            </div>
            
            <div className="mt-4 grid gap-4 bg-white p-4 rounded-xl border">
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField 
                  label="Khóa API Resend" 
                  name="resend-key" 
                  value={resendKey} 
                  onChange={(val) => { setResendKey(val); markDirty(); }} 
                />
                <AdminField 
                  label="Preset tải lên Cloudinary" 
                  name="cloudinary-preset" 
                  value={cloudinaryPreset} 
                  onChange={(val) => { setCloudinaryPreset(val); markDirty(); }} 
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField 
                  label="Khóa API Google Gemini" 
                  name="openai-key" 
                  value={openaiKey} 
                  onChange={(val) => { setOpenaiKey(val); markDirty(); }} 
                  placeholder="AIzaSy..." 
                />
                <AdminField 
                  label="Giới hạn SLA phản hồi (giờ)" 
                  name="sla-hours" 
                  value={slaHours} 
                  onChange={(val) => { setSlaHours(val); markDirty(); }} 
                />
              </div>
              <p className="text-xs text-slate-400 font-semibold italic">
                * Toàn bộ thông số API trên chỉ được lưu trữ và truy cập an toàn trong cơ sở dữ liệu phía máy chủ.
              </p>
            </div>
          </section>
        )}

        {/* --- TAB CONTENT: SITE SECTIONS --- */}
        {activeTab === "sections" && (
          <div className="grid grid-cols-1 gap-5">
          {/* Left Column: Settings Inputs */}
          <section className="surface-soft p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-panel)] bg-slate-100 text-slate-800">
                <LayoutDashboard className="size-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-800">Khu vực trang chủ</h3>
                <p className="text-xs text-secondary">Quản lý nội dung hiển thị trên trang chủ: slide hero, câu chuyện thương hiệu, sản phẩm nổi bật, tin tức và huy hiệu tin cậy.</p>
              </div>
            </div>

            {/* Hero Configuration */}
            <div className="mt-4 bg-white p-4 rounded-xl border space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <p className="text-xs font-bold text-slate-700">Hero và slide banner</p>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={heroVisible}
                    onChange={(e) => { setHeroVisible(e.target.checked); markDirty(); }}
                  />
                  <span className="relative inline-flex h-5 w-9 shrink-0 rounded-full border border-[var(--admin-border)] bg-slate-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:border-emerald-500 peer-checked:bg-emerald-500 peer-checked:after:translate-x-4" />
                  {heroVisible ? "Hiển thị" : "Ẩn"}
                </label>
              </div>

              {heroVisible && (
                <div className="space-y-6 pt-2">
                  {/* Slide 1 */}
                  <div className="bg-slate-50/50 p-3.5 rounded-lg border border-slate-100 space-y-3.5">
                    <p className="text-xs font-bold text-slate-600 border-l-2 border-indigo-500 pl-2">Slide 1: Banner chính</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <AdminField
                        label="Tiêu đề slide 1 (Tiếng Việt) *"
                        name="hero-headline-vi"
                        value={heroHeadlineVi}
                        onChange={(val) => { setHeroHeadlineVi(val); markDirty(); }}
                      />
                      <AdminField
                        label="Tiêu đề slide 1 (Tiếng Anh) *"
                        name="hero-headline-en"
                        value={heroHeadlineEn}
                        onChange={(val) => { setHeroHeadlineEn(val); markDirty(); }}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <AdminField
                        label="Mô tả slide 1 (Tiếng Việt)"
                        name="hero-subtitle-vi"
                        value={heroSubtitleVi}
                        onChange={(val) => { setHeroSubtitleVi(val); markDirty(); }}
                      />
                      <AdminField
                        label="Mô tả slide 1 (Tiếng Anh)"
                        name="hero-subtitle-en"
                        value={heroSubtitleEn}
                        onChange={(val) => { setHeroSubtitleEn(val); markDirty(); }}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <AdminField
                        label="Nhãn nút CTA"
                        name="hero-cta-label"
                        value={heroCtaLabel}
                        onChange={(val) => { setHeroCtaLabel(val); markDirty(); }}
                      />
                      <AdminField
                        label="Liên kết CTA"
                        name="hero-cta-link"
                        value={heroCtaLink}
                        onChange={(val) => { setHeroCtaLink(val); markDirty(); }}
                      />
                    </div>
                    <ImageUploadDropzone
                      label="Tải ảnh slide 1 hero"
                      value={heroImage1}
                      onChange={(url) => { setHeroImage1(url); markDirty(); }}
                    />
                  </div>

                  {/* Slide 2 */}
                  <div className="bg-slate-50/50 p-3.5 rounded-lg border border-slate-100 space-y-3.5">
                    <p className="text-xs font-bold text-slate-600 border-l-2 border-indigo-500 pl-2">Slide 2: Phong cách di sản hiện đại</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <AdminField
                        label="Tiêu đề slide 2 (Tiếng Việt) *"
                        name="slide2-title-vi"
                        value={slide2TitleVi}
                        onChange={(val) => { setSlide2TitleVi(val); markDirty(); }}
                      />
                      <AdminField
                        label="Tiêu đề slide 2 (Tiếng Anh) *"
                        name="slide2-title-en"
                        value={slide2TitleEn}
                        onChange={(val) => { setSlide2TitleEn(val); markDirty(); }}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <AdminField
                        label="Mô tả slide 2 (Tiếng Việt)"
                        name="slide2-lead-vi"
                        value={slide2LeadVi}
                        onChange={(val) => { setSlide2LeadVi(val); markDirty(); }}
                      />
                      <AdminField
                        label="Mô tả slide 2 (Tiếng Anh)"
                        name="slide2-lead-en"
                        value={slide2LeadEn}
                        onChange={(val) => { setSlide2LeadEn(val); markDirty(); }}
                      />
                    </div>
                    <ImageUploadDropzone
                      label="Tải ảnh slide 2 hero"
                      value={slide2Image}
                      onChange={(url) => { setSlide2Image(url); markDirty(); }}
                    />
                  </div>

                  {/* Slide 3 */}
                  <div className="bg-slate-50/50 p-3.5 rounded-lg border border-slate-100 space-y-3.5">
                    <p className="text-xs font-bold text-slate-600 border-l-2 border-indigo-500 pl-2">Slide 3: Bền vững & Tối giản</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <AdminField
                        label="Tiêu đề slide 3 (Tiếng Việt) *"
                        name="slide3-title-vi"
                        value={slide3TitleVi}
                        onChange={(val) => { setSlide3TitleVi(val); markDirty(); }}
                      />
                      <AdminField
                        label="Tiêu đề slide 3 (Tiếng Anh) *"
                        name="slide3-title-en"
                        value={slide3TitleEn}
                        onChange={(val) => { setSlide3TitleEn(val); markDirty(); }}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <AdminField
                        label="Mô tả slide 3 (Tiếng Việt)"
                        name="slide3-lead-vi"
                        value={slide3LeadVi}
                        onChange={(val) => { setSlide3LeadVi(val); markDirty(); }}
                      />
                      <AdminField
                        label="Mô tả slide 3 (Tiếng Anh)"
                        name="slide3-lead-en"
                        value={slide3LeadEn}
                        onChange={(val) => { setSlide3LeadEn(val); markDirty(); }}
                      />
                    </div>
                    <ImageUploadDropzone
                      label="Tải ảnh slide 3 hero"
                      value={slide3Image}
                      onChange={(url) => { setSlide3Image(url); markDirty(); }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-4 rounded-xl border space-y-3">
              <div>
                <p className="text-xs font-bold text-slate-700">Hiển thị khu vực</p>
                <p className="mt-1 text-[11px] font-medium leading-5 text-slate-500">
                  Nội dung chi tiết của các khu vực trang chủ lấy từ dữ liệu API. Cài đặt trang chỉ điều khiển việc hiển thị hoặc ẩn từng khu vực.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <SectionVisibilityCard
                  title="Khu vực giới thiệu / câu chuyện thương hiệu"
                  description="Dùng nội dung API của trang chủ hoặc trang giới thiệu."
                  checked={aboutVisible}
                  onChange={(checked) => { setAboutVisible(checked); markDirty(); }}
                />
                <SectionVisibilityCard
                  title="Khu vực sản phẩm nổi bật"
                  description="Dùng các sản phẩm nổi bật trả về từ API danh mục."
                  checked={featuredVisible}
                  onChange={(checked) => { setFeaturedVisible(checked); markDirty(); }}
                />
                <SectionVisibilityCard
                  title="Khu vực bài viết / tin tức"
                  description="Dùng các bài viết đã xuất bản mới nhất trả về từ API bài viết."
                  checked={blogSectionVisible}
                  onChange={(checked) => { setBlogSectionVisible(checked); markDirty(); }}
                />
                <SectionVisibilityCard
                  title="Khu vực showroom"
                  description="Dùng các showroom đang hoạt động trả về từ API showroom."
                  checked={showroomVisible}
                  onChange={(checked) => { setShowroomVisible(checked); markDirty(); }}
                />
                <SectionVisibilityCard
                  title="Khu vực yêu cầu báo giá"
                  description="Dùng form báo giá công khai và cấu hình API liên hệ."
                  checked={quoteVisible}
                  onChange={(checked) => { setQuoteVisible(checked); markDirty(); }}
                />
                <SectionVisibilityCard
                  title="Khu vực huy hiệu tin cậy / đối tác"
                  description="Dùng chỉ số uy tín và dữ liệu đối tác trả về từ API trang chủ."
                  checked={trustBadgesVisible}
                  onChange={(checked) => { setTrustBadgesVisible(checked); markDirty(); }}
                />
              </div>
            </div>

            {renderLegacySectionDetails && (
              <>
            {/* Homepage About/Story Section */}
            <div className="bg-white p-4 rounded-xl border space-y-4">
              <p className="text-xs font-bold text-slate-700 border-b pb-2">📖 About / Brand Story Section</p>
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField
                  label="Story Heading (VI) *"
                  name="about-heading-vi"
                  value={aboutHeadingVi}
                  onChange={(val) => { setAboutHeadingVi(val); markDirty(); }}
                />
                <AdminField
                  label="Story Heading (EN) *"
                  name="about-heading-en"
                  value={aboutHeadingEn}
                  onChange={(val) => { setAboutHeadingEn(val); markDirty(); }}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField
                  label="Story Lead (VI)"
                  name="about-lead-vi"
                  value={aboutLeadVi}
                  onChange={(val) => { setAboutLeadVi(val); markDirty(); }}
                  multiline
                />
                <AdminField
                  label="Story Lead (EN)"
                  name="about-lead-en"
                  value={aboutLeadEn}
                  onChange={(val) => { setAboutLeadEn(val); markDirty(); }}
                  multiline
                />
              </div>
              <ImageUploadDropzone
                label="Story side image upload"
                value={aboutImage}
                onChange={(url) => { setAboutImage(url); markDirty(); }}
              />
            </div>

            {/* Featured Products */}
            <div className="bg-white p-4 rounded-xl border space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-slate-700">⭐ Featured Products Section</p>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={featuredVisible}
                    onChange={(e) => { setFeaturedVisible(e.target.checked); markDirty(); }}
                  />
                  <span className="relative inline-flex h-5 w-9 shrink-0 rounded-full border border-[var(--admin-border)] bg-slate-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:border-emerald-500 peer-checked:bg-emerald-500 peer-checked:after:translate-x-4" />
                  {featuredVisible ? "Visible" : "Hidden"}
                </label>
              </div>
              {featuredVisible && (
                <>
                  <AdminField
                    label="Max featured items"
                    name="featured-max"
                    value={featuredMaxItems}
                    inputType="number"
                    min={0}
                    max={settingsPreviewProducts.length}
                    onChange={(val) => { setFeaturedMaxItems(val); markDirty(); }}
                  />
                  <p className="text-[10px] font-semibold text-slate-500">
                    Preview uses {settingsPreviewProducts.length} CMS/BE product records, with featured products shown first.
                  </p>
                </>
              )}
            </div>

            {/* Blog Section */}
            <div className="bg-white p-4 rounded-xl border space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-slate-700">📝 Blog / News Section</p>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={blogSectionVisible}
                    onChange={(e) => { setBlogSectionVisible(e.target.checked); markDirty(); }}
                  />
                  <span className="relative inline-flex h-5 w-9 shrink-0 rounded-full border border-[var(--admin-border)] bg-slate-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:border-emerald-500 peer-checked:bg-emerald-500 peer-checked:after:translate-x-4" />
                  {blogSectionVisible ? "Visible" : "Hidden"}
                </label>
              </div>
              {blogSectionVisible && (
                <>
                  <AdminField
                    label="Max blog posts"
                    name="blog-max"
                    value={blogMaxPosts}
                    inputType="number"
                    min={0}
                    max={blogPosts.length}
                    onChange={(val) => { setBlogMaxPosts(val); markDirty(); }}
                  />
                  <p className="text-[10px] font-semibold text-slate-500">
                    Preview uses {blogPosts.length} CMS/BE article records.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <AdminField
                      label="Section Heading (VI)"
                      name="blog-heading-vi"
                      value={blogHeadingVi}
                      onChange={(val) => { setBlogHeadingVi(val); markDirty(); }}
                    />
                    <AdminField
                      label="Section Heading (EN)"
                      name="blog-heading-en"
                      value={blogHeadingEn}
                      onChange={(val) => { setBlogHeadingEn(val); markDirty(); }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Showroom Section Configuration */}
            <div className="bg-white p-4 rounded-xl border space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <p className="text-xs font-bold text-slate-700">🏢 Showroom Section Configuration</p>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={showroomVisible}
                    onChange={(e) => { setShowroomVisible(e.target.checked); markDirty(); }}
                  />
                  <span className="relative inline-flex h-5 w-9 shrink-0 rounded-full border border-[var(--admin-border)] bg-slate-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:border-emerald-500 peer-checked:bg-emerald-500 peer-checked:after:translate-x-4" />
                  {showroomVisible ? "Visible" : "Hidden"}
                </label>
              </div>

              {showroomVisible && (
                <div className="space-y-4 pt-2">
                  <div className="grid gap-4 md:grid-cols-2">
                    <AdminField
                      label="Section Heading (VI) *"
                      name="showroom-heading-vi"
                      value={showroomHeadingVi}
                      onChange={(val) => { setShowroomHeadingVi(val); markDirty(); }}
                    />
                    <AdminField
                      label="Section Heading (EN) *"
                      name="showroom-heading-en"
                      value={showroomHeadingEn}
                      onChange={(val) => { setShowroomHeadingEn(val); markDirty(); }}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <AdminField
                      label="Section Lead (VI)"
                      name="showroom-lead-vi"
                      value={showroomLeadVi}
                      onChange={(val) => { setShowroomLeadVi(val); markDirty(); }}
                      multiline
                    />
                    <AdminField
                      label="Section Lead (EN)"
                      name="showroom-lead-en"
                      value={showroomLeadEn}
                      onChange={(val) => { setShowroomLeadEn(val); markDirty(); }}
                      multiline
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <AdminField
                      label="CTA Button Label (VI)"
                      name="showroom-cta-vi"
                      value={showroomCtaVi}
                      onChange={(val) => { setShowroomCtaVi(val); markDirty(); }}
                    />
                    <AdminField
                      label="CTA Button Label (EN)"
                      name="showroom-cta-en"
                      value={showroomCtaEn}
                      onChange={(val) => { setShowroomCtaEn(val); markDirty(); }}
                    />
                  </div>
                  <ImageUploadDropzone
                    label="Showroom background image upload"
                    value={showroomBgImage}
                    onChange={(url) => { setShowroomBgImage(url); markDirty(); }}
                  />
                </div>
              )}
            </div>

            {/* Quote Section Configuration */}
            <div className="bg-white p-4 rounded-xl border space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <p className="text-xs font-bold text-slate-700">💬 Quote Request Section Configuration</p>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={quoteVisible}
                    onChange={(e) => { setQuoteVisible(e.target.checked); markDirty(); }}
                  />
                  <span className="relative inline-flex h-5 w-9 shrink-0 rounded-full border border-[var(--admin-border)] bg-slate-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:border-emerald-500 peer-checked:bg-emerald-500 peer-checked:after:translate-x-4" />
                  {quoteVisible ? "Visible" : "Hidden"}
                </label>
              </div>

              {quoteVisible && (
                <div className="space-y-4 pt-2">
                  <div className="grid gap-4 md:grid-cols-2">
                    <AdminField
                      label="Section Heading (VI) *"
                      name="quote-heading-vi"
                      value={quoteHeadingVi}
                      onChange={(val) => { setQuoteHeadingVi(val); markDirty(); }}
                    />
                    <AdminField
                      label="Section Heading (EN) *"
                      name="quote-heading-en"
                      value={quoteHeadingEn}
                      onChange={(val) => { setQuoteHeadingEn(val); markDirty(); }}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <AdminField
                      label="Section Lead (VI)"
                      name="quote-lead-vi"
                      value={quoteLeadVi}
                      onChange={(val) => { setQuoteLeadVi(val); markDirty(); }}
                      multiline
                    />
                    <AdminField
                      label="Section Lead (EN)"
                      name="quote-lead-en"
                      value={quoteLeadEn}
                      onChange={(val) => { setQuoteLeadEn(val); markDirty(); }}
                      multiline
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="bg-white p-4 rounded-xl border space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <p className="text-xs font-bold text-slate-700">🤝 Trust Badges / Partners Section</p>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={trustBadgesVisible}
                    onChange={(e) => { setTrustBadgesVisible(e.target.checked); markDirty(); }}
                  />
                  <span className="relative inline-flex h-5 w-9 shrink-0 rounded-full border border-[var(--admin-border)] bg-slate-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:border-emerald-500 peer-checked:bg-emerald-500 peer-checked:after:translate-x-4" />
                  {trustBadgesVisible ? "Visible" : "Hidden"}
                </label>
              </div>

              {trustBadgesVisible && (
                <div className="grid gap-4 md:grid-cols-2 pt-2">
                  {/* Badge 1 */}
                  <div className="bg-slate-50/50 p-3 rounded-lg border space-y-3">
                    <p className="text-xs font-bold text-slate-600">Huy hiệu 1 (Badge 1)</p>
                    <div className="grid gap-3">
                      <div className="grid gap-2 grid-cols-2">
                        <AdminField
                          label="Value (VI) *"
                          name="badge1-value-vi"
                          value={badge1ValueVi}
                          onChange={(val) => { setBadge1ValueVi(val); markDirty(); }}
                        />
                        <AdminField
                          label="Value (EN) *"
                          name="badge1-value-en"
                          value={badge1ValueEn}
                          onChange={(val) => { setBadge1ValueEn(val); markDirty(); }}
                        />
                      </div>
                      <div className="grid gap-2 grid-cols-2">
                        <AdminField
                          label="Desc (VI) *"
                          name="badge1-desc-vi"
                          value={badge1DescVi}
                          onChange={(val) => { setBadge1DescVi(val); markDirty(); }}
                        />
                        <AdminField
                          label="Desc (EN) *"
                          name="badge1-desc-en"
                          value={badge1DescEn}
                          onChange={(val) => { setBadge1DescEn(val); markDirty(); }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Badge 2 */}
                  <div className="bg-slate-50/50 p-3 rounded-lg border space-y-3">
                    <p className="text-xs font-bold text-slate-600">Huy hiệu 2 (Badge 2)</p>
                    <div className="grid gap-3">
                      <div className="grid gap-2 grid-cols-2">
                        <AdminField
                          label="Value (VI) *"
                          name="badge2-value-vi"
                          value={badge2ValueVi}
                          onChange={(val) => { setBadge2ValueVi(val); markDirty(); }}
                        />
                        <AdminField
                          label="Value (EN) *"
                          name="badge2-value-en"
                          value={badge2ValueEn}
                          onChange={(val) => { setBadge2ValueEn(val); markDirty(); }}
                        />
                      </div>
                      <div className="grid gap-2 grid-cols-2">
                        <AdminField
                          label="Desc (VI) *"
                          name="badge2-desc-vi"
                          value={badge2DescVi}
                          onChange={(val) => { setBadge2DescVi(val); markDirty(); }}
                        />
                        <AdminField
                          label="Desc (EN) *"
                          name="badge2-desc-en"
                          value={badge2DescEn}
                          onChange={(val) => { setBadge2DescEn(val); markDirty(); }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
              </>
            )}
          </section>
          {/* Right Column: Live Homepage Preview */}
          {renderHomepagePreview && (
          <aside className="space-y-3 self-start 2xl:sticky 2xl:top-4">
            <div className="homepage-preview-shell surface-soft p-3 rounded-xl">
              <input
                id={desktopPreviewId}
                className="homepage-preview-radio-desktop sr-only"
                type="radio"
                name="homepage-preview-device"
                aria-label="Xem trước trang chủ trên máy tính"
                defaultChecked
              />
              <input
                id={mobilePreviewId}
                className="homepage-preview-radio-mobile sr-only"
                type="radio"
                name="homepage-preview-device"
                aria-label="Xem trước trang chủ trên di động"
              />
              <div className="homepage-preview-header flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Eye className="size-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-700">Xem trước trực tiếp</span>
                </div>
                <div className="homepage-preview-controls flex rounded-lg overflow-hidden border border-slate-200">
                  <label
                    htmlFor={desktopPreviewId}
                    data-testid="preview-desktop-label"
                    className="homepage-preview-device-label homepage-preview-desktop-label"
                  >
                    <Monitor className="size-3" /> Máy tính
                  </label>
                  <label
                    htmlFor={mobilePreviewId}
                    data-testid="preview-mobile-label"
                    className="homepage-preview-device-label homepage-preview-mobile-label"
                  >
                    <Smartphone className="size-3" /> Di động
                  </label>
                </div>
              </div>
              <div className="homepage-preview-frames max-h-[70vh] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-1.5">
                <div className="homepage-preview-frame-desktop">
                  <HomepageLivePreview
                    {...homepagePreviewProps}
                    testId="settings-homepage-preview-desktop"
                    device="desktop"
                  />
                </div>
                <div className="homepage-preview-frame-mobile">
                  <HomepageLivePreview
                    {...homepagePreviewProps}
                    testId="settings-homepage-preview-mobile"
                    device="mobile"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium text-center mt-2 italic">
                Bản preview cập nhật theo thời gian thực khi bạn chỉnh sửa
              </p>
            </div>
          </aside>
          )}
          </div>
        )}
      <div className="max-w-3xl">
        <ReadinessPanel items={settingsReadinessItems} />
      </div>
    </div>
  );
}

export function AiAssistantWorkspace() {
  const [task, setTask] = useState("translate");
  const [state, setState] = useState<"idle" | "loading" | "result" | "error">("idle");
  const [inserted, setInserted] = useState(false);
  const [inputText, setInputText] = useState("Sofa go oc cho boc ni, phu hop phong khach can ho cao cap, can noi bat vat lieu, kich thuoc va loi moi nhan bao gia.");
  const [resultText, setResultText] = useState("");
  const [errorText, setErrorText] = useState("");

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setState("loading");
    setInserted(false);
    setErrorText("");
    try {
      const res = await fetch("/api/admin/ai/generate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task,
          inputText,
          targetLocale: task === "translate" ? "en" : "vi",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResultText(data.text);
        setState("result");
      } else {
        setErrorText(data.error || "Có lỗi xảy ra từ API dịch vụ AI.");
        setState("error");
      }
    } catch (err) {
      setErrorText("Không thể kết nối đến máy chủ.");
      setState("error");
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="surface-soft p-4">
        <WorkflowIntro
          icon={Bot}
          title="Trợ lý AI chỉ tạo bản nháp"
          description="Dùng AI để tạo nháp bản dịch, SEO và dàn ý trong nội dung phù hợp. Trợ lý không xuất bản, không đổi trạng thái và không đọc dữ liệu báo giá riêng tư."
        />
        <div className="mt-5 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="label-pd">Tác vụ vận hành</span>
              <PremiumSelect
                value={task}
                onValueChange={setTask}
                ariaLabel="Tác vụ vận hành"
                placeholder="Tác vụ vận hành"
                tone="admin"
                options={[
                  { value: "translate", label: "Dịch trường tiếng Việt sang tiếng Anh" },
                  { value: "seo", label: "Tạo nháp tiêu đề SEO và mô tả meta song ngữ" },
                  { value: "outline", label: "Tạo dàn ý bài viết từ tóm tắt sản phẩm" },
                ]}
              />
            </label>
            <label className="grid gap-2">
              <span className="label-pd">Loại nội dung đích</span>
              <PremiumSelect
                defaultValue="product"
                ariaLabel="Loại nội dung đích"
                placeholder="Loại nội dung đích"
                tone="admin"
                options={[
                  { value: "product", label: "Hồ sơ sản phẩm" },
                  { value: "blog", label: "Bài viết" },
                  { value: "homepage", label: "Khu vực trang chủ" },
                ]}
              />
            </label>
          </div>
          <label className="grid gap-2">
            <span className="label-pd">Nội dung gốc tiếng Việt</span>
            <textarea
              className="input-pd min-h-32"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <span className="text-xs text-[var(--admin-text-muted)]">
              Trợ lý này cố ý không sử dụng dữ liệu yêu cầu báo giá riêng tư.
            </span>
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              className="button-pd"
              type="button"
              onClick={handleGenerate}
              disabled={state === "loading"}
            >
              <WandSparkles className="size-4" />
              {state === "loading" ? "Đang tạo nháp..." : "Tạo bản nháp"}
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-[var(--radius-panel)] border border-[var(--admin-border)] bg-white p-4">
          {state === "idle" ? (
            <p className="text-sm text-[var(--admin-text-muted)]">
              Chọn tác vụ và tạo bản nháp. Kết quả giữ ở trạng thái chờ kiểm duyệt cho đến khi biên tập viên chấp nhận.
            </p>
          ) : null}
          {state === "loading" ? (
            <p className="field-feedback text-sm font-semibold text-[var(--admin-text)]">
              Đang tạo đề xuất bản nháp...
            </p>
          ) : null}
          {state === "result" ? (
            <div className="field-feedback">
              <p className="label-pd">Kết quả bản nháp</p>
              <p className="mt-2 rounded-[var(--radius-card)] bg-[var(--admin-bg-soft)] p-3 text-sm leading-6 text-[var(--admin-text)] whitespace-pre-wrap">
                {resultText}
              </p>
              <button
                className="button-pd mt-4"
                type="button"
                onClick={() => setInserted(true)}
              >
                <Save className="size-4" />
                {inserted ? "Đã chèn bản nháp để kiểm duyệt" : "Chèn vào bản nháp của trình soạn thảo"}
              </button>
            </div>
          ) : null}
          {state === "error" ? (
            <p className="field-feedback rounded-[var(--radius-card)] border border-error/25 bg-error-container p-3 text-sm text-on-error-container">
              {errorText || "Nhà cung cấp AI tạm thời không khả dụng. Nội dung hiện có không bị thay đổi."}
            </p>
          ) : null}
        </div>
      </section>

      <div className="space-y-5">
        <ReadinessPanel
          items={[
            { label: "Kết quả AI chỉ là bản nháp", state: "ready" },
            { label: "Bắt buộc kiểm duyệt thủ công trước khi xuất bản", state: "ready" },
            { label: "Không dùng ngữ cảnh yêu cầu báo giá riêng tư", state: "ready" },
            { label: "Chưa chốt mô hình AI cuối cùng và giới hạn chi phí", state: "warning" },
          ]}
        />
        <section className="surface-soft p-4">
          <h3 className="admin-section-title-pd">Vị trí chèn gợi ý trong CMS</h3>
          <div className="mt-4 grid gap-2">
            {["Tiêu đề và mô tả tóm tắt tiếng Anh của sản phẩm", "Tiêu đề SEO và mô tả meta của bài viết", "Bản nội dung thay thế cho hero trang chủ"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-[var(--radius-card)] bg-white px-3 py-2 text-sm font-semibold text-[var(--admin-text-muted)]">
                <Sparkles className="size-4 text-[var(--admin-accent)]" />
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}


function BrandEntityForm({ idOrSlug }: { idOrSlug?: string }) {
  const searchParams = useSearchParams();
  const editId = idOrSlug || searchParams.get("edit") || "";
  const isEdit = Boolean(editId);

  const [nameVi, setNameVi] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descriptionVi, setDescriptionVi] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [origin, setOrigin] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (isEdit) {
      const loadBrand = async () => {
        try {
          const { getAdminBrandById } = await import("@/lib/supabase/brands-mutations");
          const res = await getAdminBrandById(editId);
          if (res.success && res.data) {
            const b = res.data;
            setNameVi(b.name_vi || "");
            setNameEn(b.name_en || "");
            setDescriptionVi(b.description_vi || "");
            setDescriptionEn(b.description_en || "");
            setOrigin(b.origin || "");
            setLogoUrl(b.logo_url || "");
            setSortOrder(b.sort_order || 0);
            setStatus(b.status || "draft");
          }
        } catch (e) {
          console.error("Failed to load brand:", e);
        }
      };
      loadBrand();
    }
  }, [editId, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      const { createAdminBrand, updateAdminBrand } = await import("@/lib/supabase/brands-mutations");
      const brandData = {
        name_vi: nameVi,
        name_en: nameEn,
        description_vi: descriptionVi,
        description_en: descriptionEn,
        origin,
        logo_url: logoUrl,
        sort_order: Number(sortOrder),
        status,
      };

      let res;
      if (isEdit) {
        res = await updateAdminBrand(editId, brandData);
      } else {
        res = await createAdminBrand(brandData);
      }

      if (res.success) {
        alert(isEdit ? "Cập nhật thương hiệu thành công!" : "Tạo thương hiệu thành công!");
        window.location.href = "/admin/brands";
      } else {
        setFormError(res.error || "Có lỗi xảy ra.");
      }
    } catch (err) {
      setFormError("Lỗi kết nối.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="surface-soft p-4">
        <WorkflowIntro
          icon={Award}
          title={isEdit ? "Hiệu chỉnh thương hiệu" : "Thêm thương hiệu mới"}
          description="Thiết lập logo, xuất xứ và mô tả song ngữ cho thương hiệu đối tác."
        />
        {formError && <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{formError}</div>}
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2">
            <span className="label-pd">Tên thương hiệu (VI) *</span>
            <input className="input-pd bg-white" type="text" value={nameVi} onChange={(e) => setNameVi(e.target.value)} required />
          </label>
          <label className="grid gap-2">
            <span className="label-pd">Tên thương hiệu (EN)</span>
            <input className="input-pd bg-white" type="text" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
          </label>
          <label className="grid gap-2">
            <span className="label-pd">Mô tả tiếng Việt</span>
            <textarea className="input-pd bg-white min-h-20" value={descriptionVi} onChange={(e) => setDescriptionVi(e.target.value)} />
          </label>
          <label className="grid gap-2">
            <span className="label-pd">Mô tả tiếng Anh</span>
            <textarea className="input-pd bg-white min-h-20" value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} />
          </label>
          <label className="grid gap-2">
            <span className="label-pd">Xuất xứ</span>
            <input className="input-pd bg-white" type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Ví dụ: Đức, Mỹ, Nhật Bản" />
          </label>
          <label className="grid gap-2">
            <span className="label-pd">Đường dẫn Logo (Cloudinary URL hoặc ID)</span>
            <input className="input-pd bg-white" type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://res.cloudinary.com/..." />
          </label>
        </div>
      </section>
      <div className="space-y-5">
        <section className="surface-soft p-4">
          <label className="grid gap-2">
            <span className="label-pd">Thứ tự hiển thị</span>
            <input className="input-pd bg-white" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
          </label>
          <label className="grid gap-2 mt-4">
            <span className="label-pd">Trạng thái</span>
            <PremiumSelect
              value={status}
              onValueChange={(val) => setStatus(val as "draft" | "published" | "archived")}
              ariaLabel="Trạng thái"
              placeholder="Trạng thái"
              tone="admin"
              options={[
                { value: "draft", label: "Bản nháp" },
                { value: "published", label: "Đã xuất bản" },
                { value: "archived", label: "Đã lưu trữ" },
              ]}
            />
          </label>
          <div className="mt-6">
            <button type="submit" className="button-pd w-full" disabled={formLoading}>
              {formLoading ? "Đang lưu..." : "Lưu thương hiệu"}
            </button>
          </div>
        </section>
      </div>
    </form>
  );
}

function PromotionEntityForm({ idOrSlug }: { idOrSlug?: string }) {
  const searchParams = useSearchParams();
  const editId = idOrSlug || searchParams.get("edit") || "";
  const isEdit = Boolean(editId);

  const [code, setCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [titleVi, setTitleVi] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descriptionVi, setDescriptionVi] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [comboPrice, setComboPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [itemsList, setItemsList] = useState<string[]>([""]);
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // N-N products states
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [searchVal, setSearchVal] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const loadPromotion = async () => {
        try {
          const { getAdminPromotionById, getProductsByIds } = await import("@/lib/supabase/admin-queries");
          const res = await getAdminPromotionById(editId);
          if (res.success && res.data) {
            const p = res.data;
            setCode(p.code || "");
            setDiscountPercentage(p.discount_percentage || 0);
            setTitleVi(p.title?.vi || p.title_vi || "");
            setTitleEn(p.title?.en || p.title_en || "");
            setDescriptionVi(p.description?.vi || p.description_vi || "");
            setDescriptionEn(p.description?.en || p.description_en || "");
            setComboPrice(p.combo_price ? String(p.combo_price) : "");
            setOriginalPrice(p.original_price ? String(p.original_price) : "");
            setCoverImage(p.cover_image_url || p.cover_image || "");
            setItemsList(p.items && p.items.length > 0 ? p.items : [""]);
            setStatus(p.status || "draft");

            if (p.productIds && p.productIds.length > 0) {
              setSelectedProductIds(p.productIds);
              const prods = await getProductsByIds(p.productIds);
              setSelectedProducts(prods);
            }
          }
        } catch (e) {
          console.error("Failed to load promotion:", e);
        }
      };
      loadPromotion();
    }
  }, [editId, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      const { createAdminPromotion, updateAdminPromotion } = await import("@/lib/supabase/admin-queries");
      const promotionData = {
        code,
        discount_percentage: Number(discountPercentage),
        title_vi: titleVi,
        title_en: titleEn,
        description_vi: descriptionVi,
        description_en: descriptionEn,
        cover_image: coverImage,
        combo_price: comboPrice ? Number(comboPrice) : null,
        start_at: null,
        end_at: null,
        original_price: originalPrice ? Number(originalPrice) : null,
        items: itemsList.filter(i => i.trim() !== ""),
        status,
        productIds: selectedProductIds,
      };

      let res;
      if (isEdit) {
        res = await updateAdminPromotion(editId, promotionData);
      } else {
        res = await createAdminPromotion(promotionData);
      }

      if (res.success) {
        alert(isEdit ? "Cập nhật khuyến mãi thành công!" : "Tạo khuyến mãi thành công!");
        window.location.href = "/admin/promotions";
      } else {
        setFormError(res.error || "Có lỗi xảy ra.");
      }
    } catch (err) {
      setFormError("Lỗi kết nối.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleSearchProducts = async (val: string) => {
    setSearchVal(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const { searchAdminProducts } = await import("@/lib/supabase/admin-queries");
      const results = await searchAdminProducts(val);
      setSearchResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleToggleProduct = (prod: any) => {
    if (selectedProductIds.includes(prod.id)) {
      setSelectedProductIds(selectedProductIds.filter(id => id !== prod.id));
      setSelectedProducts(selectedProducts.filter(p => p.id !== prod.id));
    } else {
      setSelectedProductIds([...selectedProductIds, prod.id]);
      setSelectedProducts([...selectedProducts, prod]);
    }
  };

  const handleAddItem = () => setItemsList([...itemsList, ""]);
  const handleRemoveItem = (index: number) => setItemsList(itemsList.filter((_, idx) => idx !== index));
  const handleItemChange = (index: number, val: string) => {
    const updated = [...itemsList];
    updated[index] = val;
    setItemsList(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="surface-soft p-4">
        <WorkflowIntro
          icon={BadgePercent}
          title={isEdit ? "Hiệu chỉnh chương trình khuyến mãi" : "Thêm chương trình khuyến mãi mới"}
          description="Thiết lập thông tin khuyến mãi combo, chiết khấu và sản phẩm đi kèm."
        />
        {formError && <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{formError}</div>}
        <div className="mt-5 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="label-pd">Mã khuyến mãi *</span>
              <input className="input-pd bg-white" type="text" value={code} onChange={(e) => setCode(e.target.value)} required placeholder="Ví dụ: VALENTINE-COMBO" />
            </label>
            <label className="grid gap-2">
              <span className="label-pd">Phần trăm chiết khấu (%) *</span>
              <input className="input-pd bg-white" type="number" min={0} max={100} value={discountPercentage} onChange={(e) => setDiscountPercentage(Number(e.target.value))} required />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="label-pd">Tiêu đề (VI) *</span>
              <input className="input-pd bg-white" type="text" value={titleVi} onChange={(e) => setTitleVi(e.target.value)} required />
            </label>
            <label className="grid gap-2">
              <span className="label-pd">Tiêu đề (EN)</span>
              <input className="input-pd bg-white" type="text" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
            </label>
          </div>
          <label className="grid gap-2">
            <span className="label-pd">Mô tả ngắn (VI)</span>
            <textarea className="input-pd bg-white min-h-20" value={descriptionVi} onChange={(e) => setDescriptionVi(e.target.value)} />
          </label>
          <label className="grid gap-2">
            <span className="label-pd">Mô tả ngắn (EN)</span>
            <textarea className="input-pd bg-white min-h-20" value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="label-pd">Giá Combo (VND)</span>
              <input className="input-pd bg-white" type="number" value={comboPrice} onChange={(e) => setComboPrice(e.target.value)} />
            </label>
            <label className="grid gap-2">
              <span className="label-pd">Giá gốc tổng cộng (VND)</span>
              <input className="input-pd bg-white" type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} />
            </label>
          </div>
          <label className="grid gap-2">
            <span className="label-pd">Ảnh bìa Combo (Cloudinary URL)</span>
            <input className="input-pd bg-white" type="text" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://res.cloudinary.com/..." />
          </label>

          <div className="grid gap-2">
            <span className="label-pd">Các sản phẩm đi kèm trong Combo</span>
            <div className="space-y-2">
              {itemsList.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <input className="input-pd bg-white flex-1" type="text" value={item} onChange={(e) => handleItemChange(idx, e.target.value)} placeholder={`Sản phẩm #${idx + 1}`} />
                  <button type="button" onClick={() => handleRemoveItem(idx)} className="button-pd-outline py-2 px-3 text-red-500 border-red-200 hover:bg-red-50" disabled={itemsList.length <= 1}>Xóa</button>
                </div>
              ))}
              <button type="button" onClick={handleAddItem} className="button-pd-outline text-xs mt-2 py-1 px-2">
                + Thêm sản phẩm
              </button>
            </div>
          </div>

          <div className="grid gap-2 mt-4 pt-4 border-t border-slate-200">
            <span className="label-pd">Áp dụng cho các sản phẩm thật (N-N)</span>
            <div className="flex gap-2">
              <input
                className="input-pd bg-white flex-1"
                type="text"
                placeholder="Nhập tên hoặc mã sản phẩm để tìm kiếm..."
                value={searchVal}
                onChange={(e) => handleSearchProducts(e.target.value)}
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border rounded-lg bg-white divide-y max-h-48 overflow-y-auto mt-2">
                {searchResults.map((prod) => {
                  const isChecked = selectedProductIds.includes(prod.id);
                  return (
                    <div key={prod.id} className="flex items-center justify-between p-2 hover:bg-slate-50 text-xs">
                      <div>
                        <span className="font-semibold text-primary">{prod.name}</span>
                        <span className="text-slate-400 ml-2 font-mono">({prod.reference_code})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleProduct(prod)}
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          isChecked ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                        }`}
                      >
                        {isChecked ? "Bỏ chọn" : "Chọn"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Selected Products List */}
            {selectedProducts.length > 0 && (
              <div className="mt-3">
                <span className="text-xs font-bold text-slate-500 block mb-1.5 font-heading">Sản phẩm đã chọn ({selectedProducts.length}):</span>
                <div className="flex flex-wrap gap-2">
                  {selectedProducts.map((prod) => (
                    <div key={prod.id} className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs px-2.5 py-1 rounded-full">
                      <span>{prod.name} ({prod.reference_code})</span>
                      <button
                        type="button"
                        onClick={() => handleToggleProduct(prod)}
                        className="text-indigo-400 hover:text-indigo-600 font-bold ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <div className="space-y-5">
        <section className="surface-soft p-4">
          <label className="grid gap-2">
            <span className="label-pd">Trạng thái</span>
            <PremiumSelect
              value={status}
              onValueChange={(val) => setStatus(val as "draft" | "published" | "archived")}
              ariaLabel="Trạng thái"
              placeholder="Trạng thái"
              tone="admin"
              options={[
                { value: "draft", label: "Bản nháp" },
                { value: "published", label: "Đã xuất bản" },
                { value: "archived", label: "Đã lưu trữ" },
              ]}
            />
          </label>
          <div className="mt-6">
            <button type="submit" className="button-pd w-full" disabled={formLoading}>
              {formLoading ? "Đang lưu..." : "Lưu khuyến mãi"}
            </button>
          </div>
        </section>
      </div>
    </form>
  );
}
export function ContentEditorForm({
  kind,
  mode = "edit",
  idOrSlug,
}: {
  kind: ContentKind;
  mode?: "create" | "edit";
  idOrSlug?: string;
}) {
  const isProduct = kind === "product";

  // --- Form State ---
  const [viTitle, setViTitle] = useState(mode === "edit" ? (isProduct ? "Sofa Curve Velour" : "Bí quyết chọn gỗ óc chó cho nội thất bền vững") : "");
  const [enTitle, setEnTitle] = useState(mode === "edit" ? (isProduct ? "Sofa Curve Velour" : "How to choose walnut wood for lasting interiors") : "");
  
  const [viSlug, setViSlug] = useState(mode === "edit" ? (isProduct ? "sofa-curve-velour" : "bi-quyet-chon-go-oc-cho") : "");
  const [enSlug, setEnSlug] = useState(mode === "edit" ? (isProduct ? "sofa-curve-velour" : "how-to-choose-walnut-wood") : "");

  const [viSummary, setViSummary] = useState(mode === "edit" ? (isProduct ? "Sofa cao cấp bọc vải Velour với đường cong tinh tế, khung gỗ sồi tự nhiên." : "Nhận biết vân gỗ, độ ẩm và quy trình xử lý bề mặt trước khi đầu tư cho nội thất cao cấp.") : "");
  const [enSummary, setEnSummary] = useState(mode === "edit" ? (isProduct ? "Premium velour sofa with a soft curved silhouette and natural oak frame." : "Understand grain, moisture and finishing process before investing in premium interiors.") : "");

  const [viBody, setViBody] = useState(mode === "edit" ? "Nội dung chi tiết tiếng Việt. Đây là trường nguồn để biên tập viên kiểm duyệt trước khi dịch sang tiếng Anh." : "");
  const [enBody, setEnBody] = useState(mode === "edit" ? "English body draft appears here only when English authoring is enabled." : "");

  const [englishEnabled, setEnglishEnabled] = useState(mode === "edit");

  const [seoTitleVi, setSeoTitleVi] = useState(mode === "edit" ? (isProduct ? "Sofa gỗ óc chó cho phòng khách cao cấp" : "Bí quyết chọn gỗ óc chó cho nội thất cao cấp") : "");
  const [seoTitleEn, setSeoTitleEn] = useState(mode === "edit" ? (isProduct ? "Walnut sofa for refined living rooms" : "How to choose walnut wood for premium interiors") : "");
  const [seoDescVi, setSeoDescVi] = useState(mode === "edit" ? "Mô tả ngắn gọn, rõ giá trị tư vấn và lời mời nhận báo giá." : "");
  const [seoDescEn, setSeoDescEn] = useState(mode === "edit" ? "Short, specific search description with a quote request path." : "");

  // --- Product-specific fields ---
  const [priceMin, setPriceMin] = useState("18000000");
  const [priceMax, setPriceMax] = useState("42000000");
  const [quoteOnly, setQuoteOnly] = useState(true);
  const [category, setCategory] = useState("wood");
  const [brand, setBrand] = useState("Atelier Select");
  const [refCode, setRefCode] = useState("PD-SF-184");
  const [showroom, setShowroom] = useState("district-7");
  const [featured, setFeatured] = useState(true);
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");

  // Spec & Dimension states (Bilingual)
  const [materialsVi, setMaterialsVi] = useState(mode === "edit" ? "Gỗ óc chó tự nhiên, khung xương chắc chắn, lớp hoàn thiện tinh tế." : "");
  const [materialsEn, setMaterialsEn] = useState(mode === "edit" ? "Solid natural walnut wood, robust structural frame, refined natural finish." : "");
  const [dimensionsVi, setDimensionsVi] = useState(mode === "edit" ? "2200 x 920 x 780 mm" : "");
  const [dimensionsEn, setDimensionsEn] = useState(mode === "edit" ? "2200 x 920 x 780 mm" : "");
  const [specMaterialVi, setSpecMaterialVi] = useState(mode === "edit" ? "Gỗ óc chó tự nhiên nguyên khối" : "");
  const [specMaterialEn, setSpecMaterialEn] = useState(mode === "edit" ? "Premium solid natural walnut" : "");
  const [specFinishVi, setSpecFinishVi] = useState(mode === "edit" ? "Sơn lau dầu thực vật cao cấp" : "");
  const [specFinishEn, setSpecFinishEn] = useState(mode === "edit" ? "Premium organic plant-oil finish" : "");
  const [specCareVi, setSpecCareVi] = useState(mode === "edit" ? "Lau bằng vải khô mềm hằng tuần, tránh nước đọng" : "");
  const [specCareEn, setSpecCareEn] = useState(mode === "edit" ? "Wipe weekly with a dry soft cloth, avoid standing water" : "");

  const [coverImage, setCoverImage] = useState(mode === "edit" ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDeNaFa3JY47GArzSxORvjQWIf13YpBq5rZYV_Vlg0WKN8i1K-riacPvEpxjgArG70R9OkqHw41H7xEEnVaMamTzu2j8lUK-wN10A784d1QoZHM4fi9vE9NsHXu1EneflVADtw0KiL5VYdZ-5MVbfL4kn3BaILk6D4iORdO7N2m089CpKpF2esGBi_yIxBC9B7XXStL7PKNX97Nil49w0dOvCjJzkSw6MopELonyTGhnooSPrfWnl3mqEpWOdLeuH6JKV3e8hIF1D4" : "");
  const [galleryImages, setGalleryImages] = useState<string[]>(mode === "edit" ? [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCS7rYc18dpXUFnhvwBuKvVucavZ1sAsE7DxMtRl_98ETvYOUVz44VpAURmwOHZ7J9HuYsw8sBH_O4uP1U_8G2qw0JOtoCI_dTrmqpw2kEsALwRtiBzM2XQx8aKxpcPVlMn34cMjlBmADgZhbyHjyZjYC20RChapDYZk1VETdbY4ce1PYH6BxZ9ILJakNNyTsFOL82tJQs_U_JfvrNJvYA0cgVpj1VZZOzglO4g_SsMvrcrb7dLAz4YUJlC3-e3y-ZwFnQg8bCrdFs",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB9AqZgkazhLr1T0iK0v_7bDSJHoCTj3l7Bj1kVA10E3JGafT3Ac50zasCKjmT768HKPkLHAuydGJZJhcPgRtnx7_lmH_wPPkCksh-mWEU67Ei-yO7Ft71A-StpTV931Nc2YeU5FBCPPxTlj4Pl8A_0LKVIcc7hTjZMR4zKfqic1n1uqjBz3PkdQMMaP8FSpmyCTaPMjANwfzExqwt7upT3zcL8vw6xmL52Dy822UQXYQregnQUtL615QO5pxLjUKsEDFJonheQBL8"
  ] : []);

  interface CustomAttribute {
    id: string;
    nameVi: string;
    nameEn: string;
    valueVi: string;
    valueEn: string;
  }

  const [customAttributes, setCustomAttributes] = useState<CustomAttribute[]>(mode === "edit" ? [
    { id: "1", nameVi: "Bảo hành", nameEn: "Warranty", valueVi: "24 tháng", valueEn: "24 months" },
    { id: "2", nameVi: "Xuất xứ", nameEn: "Origin", valueVi: "Việt Nam", valueEn: "Vietnam" }
  ] : []);

  interface AIResultData {
    viTitle: string;
    enTitle: string;
    viSlug: string;
    enSlug: string;
    viSummary: string;
    enSummary: string;
    viBody: string;
    enBody: string;
    seoTitleVi: string;
    seoTitleEn: string;
    seoDescVi: string;
    seoDescEn: string;
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
  }

  // --- AI Assistant Generator States ---
  const [aiTopic, setAiTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIResultData | null>(null);
  const [showAiReviewDialog, setShowAiReviewDialog] = useState(false);
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // --- AI Translate States ---
  const [aiTranslating, setAiTranslating] = useState(false);
  const [aiTranslateSuccess, setAiTranslateSuccess] = useState(false);

  // --- Local Draft Auto-save & Restore ---
  const [hasLocalDraft, setHasLocalDraft] = useState(() => {
    if (typeof window !== "undefined" && mode === "create") {
      const saved = localStorage.getItem(`${kind}_post_draft`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return !!(parsed.viTitle || parsed.viSummary);
        } catch (e) {}
      }
    }
    return false;
  });
  const [draftTimestamp, setDraftTimestamp] = useState(() => {
    if (typeof window !== "undefined" && mode === "create") {
      const saved = localStorage.getItem(`${kind}_post_draft`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.timestamp || "";
        } catch (e) {}
      }
    }
    return "";
  });

  useEffect(() => {
    if (mode === "create" && (viTitle || viSummary || viBody)) {
      const draftData = {
        viTitle,
        enTitle,
        viSlug,
        enSlug,
        viSummary,
        enSummary,
        viBody,
        enBody,
        englishEnabled,
        seoTitleVi,
        seoTitleEn,
        seoDescVi,
        seoDescEn,
        timestamp: new Date().toLocaleTimeString(),
      };
      localStorage.setItem(`${kind}_post_draft`, JSON.stringify(draftData));
    }
  }, [viTitle, enTitle, viSlug, enSlug, viSummary, enSummary, viBody, enBody, englishEnabled, seoTitleVi, seoTitleEn, seoDescVi, seoDescEn, mode, kind]);

  const restoreDraft = () => {
    const saved = localStorage.getItem(`${kind}_post_draft`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setViTitle(parsed.viTitle || "");
        setEnTitle(parsed.enTitle || "");
        setViSlug(parsed.viSlug || "");
        setEnSlug(parsed.enSlug || "");
        setViSummary(parsed.viSummary || "");
        setEnSummary(parsed.enSummary || "");
        setViBody(parsed.viBody || "");
        setEnBody(parsed.enBody || "");
        setEnglishEnabled(parsed.englishEnabled || false);
        setSeoTitleVi(parsed.seoTitleVi || "");
        setSeoTitleEn(parsed.seoTitleEn || "");
        setSeoDescVi(parsed.seoDescVi || "");
        setSeoDescEn(parsed.seoDescEn || "");
      } catch (e) {}
    }
    setHasLocalDraft(false);
  };

  const discardDraft = () => {
    localStorage.removeItem(`${kind}_post_draft`);
    setHasLocalDraft(false);
  };

  // --- Validation Logic ---
  const validationErrors: string[] = [];
  if (!viTitle.trim()) validationErrors.push("Cần nhập tiêu đề tiếng Việt.");
  if (!viSummary.trim()) validationErrors.push("Cần nhập mô tả ngắn hoặc trích đoạn tiếng Việt.");
  if (!viBody.trim()) validationErrors.push("Cần nhập nội dung tiếng Việt.");
  if (!seoTitleVi.trim()) validationErrors.push("Cần nhập tiêu đề SEO tiếng Việt.");
  if (!seoDescVi.trim()) validationErrors.push("Cần nhập mô tả meta tiếng Việt.");

  if (englishEnabled) {
    if (!enTitle.trim()) validationErrors.push("Cần nhập tiêu đề tiếng Anh khi đã bật tiếng Anh.");
    if (!enSummary.trim()) validationErrors.push("Cần nhập mô tả ngắn hoặc trích đoạn tiếng Anh khi đã bật tiếng Anh.");
    if (!enBody.trim()) validationErrors.push("Cần nhập nội dung tiếng Anh khi đã bật tiếng Anh.");
    if (!seoTitleEn.trim()) validationErrors.push("Cần nhập tiêu đề SEO tiếng Anh khi đã bật tiếng Anh.");
    if (!seoDescEn.trim()) validationErrors.push("Cần nhập mô tả meta tiếng Anh khi đã bật tiếng Anh.");
  }

  // Define dynamic readiness items based on current validation errors
  const dynamicReadiness = [
    { 
      label: "Đã hoàn tất trường nội dung gốc tiếng Việt", 
      state: (!viTitle.trim() || !viSummary.trim() || !viBody.trim()) ? "warning" : "ready" 
    },
    { 
      label: englishEnabled ? "Bản dịch tiếng Anh đã hoàn tất" : "Không bật tiếng Anh (tùy chọn)", 
      state: (englishEnabled && (!enTitle.trim() || !enSummary.trim() || !enBody.trim())) ? "warning" : "ready" 
    },
    { 
      label: isProduct ? (quoteOnly ? "Đang bật trạng thái chỉ nhận báo giá" : "Đã cấu hình khoảng giá") : "Đã gán ảnh bìa và thẻ", 
      state: "ready" as const
    },
    { 
      label: "SEO mặc định và đường dẫn song ngữ đã sẵn sàng", 
      state: (!seoTitleVi.trim() || !seoDescVi.trim() || (englishEnabled && (!seoTitleEn.trim() || !seoDescEn.trim()))) ? "warning" : "ready" 
    },
  ] as const;

  // --- AI Generate Content Mock Logic ---
  const handleAiGenerate = () => {
    if (!aiTopic.trim()) return;
    
    // Check if form contains entered content to warning user about overwrite
    const isFormDirty = viTitle !== "" || viSummary !== "" || viBody !== "";
    if (isFormDirty) {
      setShowOverwriteWarning(true);
    } else {
      triggerAiGeneration();
    }
  };

    const triggerAiGeneration = async () => {
    setShowOverwriteWarning(false);
    setAiLoading(true);

    try {
      const res = await fetch("/api/admin/ai/generate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "generate-content",
          inputText: aiTopic,
          targetType: kind,
        }),
      });
      const data = await res.json();
      setAiLoading(false);
      if (data.success && data.data && !data.data.error) {
        setAiResult(data.data);
        setShowAiReviewDialog(true);
      } else {
        alert(data.error || (data.data && data.data.error) || "Không thể tạo nội dung từ AI.");
      }
    } catch (err) {
      setAiLoading(false);
      alert("Lỗi kết nối khi gọi API AI.");
    }
  };

  const applyGeneratedContent = () => {
    if (!aiResult) return;
    setViTitle(aiResult.viTitle);
    setEnTitle(aiResult.enTitle);
    setViSlug(aiResult.viSlug);
    setEnSlug(aiResult.enSlug);
    setViSummary(aiResult.viSummary);
    setEnSummary(aiResult.enSummary);
    setViBody(aiResult.viBody);
    setEnBody(aiResult.enBody);
    setSeoTitleVi(aiResult.seoTitleVi);
    setSeoTitleEn(aiResult.seoTitleEn);
    setSeoDescVi(aiResult.seoDescVi);
    setSeoDescEn(aiResult.seoDescEn);
    
    if (aiResult.materialsVi) setMaterialsVi(aiResult.materialsVi);
    if (aiResult.materialsEn) setMaterialsEn(aiResult.materialsEn);
    if (aiResult.dimensionsVi) setDimensionsVi(aiResult.dimensionsVi);
    if (aiResult.dimensionsEn) setDimensionsEn(aiResult.dimensionsEn);
    if (aiResult.specMaterialVi) setSpecMaterialVi(aiResult.specMaterialVi);
    if (aiResult.specMaterialEn) setSpecMaterialEn(aiResult.specMaterialEn);
    if (aiResult.specFinishVi) setSpecFinishVi(aiResult.specFinishVi);
    if (aiResult.specFinishEn) setSpecFinishEn(aiResult.specFinishEn);
    if (aiResult.specCareVi) setSpecCareVi(aiResult.specCareVi);
    if (aiResult.specCareEn) setSpecCareEn(aiResult.specCareEn);
    
    setEnglishEnabled(true);
    setShowAiReviewDialog(false);
  };

  // --- AI Translate Action Logic ---
  const handleAiTranslate = () => {
    if (!viTitle.trim()) return;
    setAiTranslating(true);
    setAiTranslateSuccess(false);

    setTimeout(() => {
      setAiTranslating(false);
      setAiTranslateSuccess(true);
      
      setEnTitle(`${viTitle} - English draft`);
      setEnSlug(`${viSlug}-en`);
      setEnSummary(`English translated preview of the Vietnamese text: ${viSummary}`);
      setEnBody(`<p>English translated body context:</p>${viBody}`);
      
      // SEO & Localized slug readiness
      setSeoTitleEn(seoTitleVi ? `Premium ${seoTitleVi}` : `${viTitle} - Premium Furniture | Phuong Dong`);
      setSeoDescEn(seoDescVi ? `English metadata: ${seoDescVi}` : `Discover ${viTitle} at Phuong Dong Showroom. Premium quality, modern design.`);
      
      // Price, dimensions and specifications
      if (materialsVi) setMaterialsEn(`${materialsVi} (English translation)`);
      else setMaterialsEn("Premium materials (English draft)");
      
      if (dimensionsVi) setDimensionsEn(dimensionsVi);
      else setDimensionsEn("Standard size");
      
      if (specMaterialVi) setSpecMaterialEn(`${specMaterialVi} (English translation)`);
      else setSpecMaterialEn("Premium solid wood");
      
      if (specFinishVi) setSpecFinishEn(`${specFinishVi} (English translation)`);
      else setSpecFinishEn("Refined matte coat");
      
      if (specCareVi) setSpecCareEn(`${specCareVi} (English translation)`);
      else setSpecCareEn("Wipe with dry soft cloth");
    }, 1200);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        {isProduct && (
          <p className="text-xs text-[var(--admin-text-muted)] font-medium">
            Trình soạn thảo sản phẩm ưu tiên tiếng Việt
          </p>
        )}
        
        {/* --- DRAFT RECOVERY CALLOUT --- */}
        {hasLocalDraft && (
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-indigo-900 shadow-sm md:flex-row md:items-center">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Sparkles className="size-4 text-indigo-600 animate-bounce" />
              <span>Phát hiện bản nháp chưa lưu gần nhất ({draftTimestamp}). Bạn có muốn khôi phục lại không?</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="button-pd-outline py-1 px-3 text-xs bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-semibold"
                onClick={discardDraft}
              >
                Xóa bản nháp
              </button>
              <button
                type="button"
                className="button-pd py-1 px-4 text-xs bg-indigo-600 text-white font-semibold"
                onClick={restoreDraft}
              >
                Khôi phục bản nháp
              </button>
            </div>
          </div>
        )}
        
        {/* --- AI GENERATOR WORKSPACE (Elevated Business Assistant) --- */}
        <section className="rounded-2xl border-2 border-dashed border-[var(--admin-accent)] bg-gradient-to-r from-purple-50/50 to-indigo-50/50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Bot className="size-6 text-[var(--admin-accent)] animate-pulse" />
            <div>
              <h3 className="font-heading text-lg font-bold text-primary">Trợ lý biên tập AI</h3>
              <p className="text-xs text-secondary">Nhập chủ đề thô để tự động sinh toàn bộ nội dung song ngữ, slug và cấu trúc chuẩn SEO.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            <textarea
              className="input-pd min-h-16 bg-white border-[var(--admin-border-strong)]"
              placeholder={isProduct ? "Ví dụ: Bàn ăn gỗ óc chó 6 ghế, phong cách Heritage tối giản..." : "Ví dụ: Hướng dẫn chăm sóc và làm bóng bề mặt đồ gỗ tự nhiên..."}
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                Lưu ý: Luôn có bước phê duyệt thủ công trước khi ghi đè dữ liệu.
              </span>
              <button
                type="button"
                className="button-pd px-5 flex items-center gap-2"
                onClick={handleAiGenerate}
                disabled={aiLoading || !aiTopic.trim()}
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Đang tạo nháp...
                  </>
                ) : (
                  <>
                    <WandSparkles className="size-4" />
                    Tạo bản nháp song ngữ
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* --- BILINGUAL AUTHORING TABS --- */}
        <BilingualAuthoringFields
          kind={kind}
          viTitle={viTitle}
          setViTitle={setViTitle}
          enTitle={enTitle}
          setEnTitle={setEnTitle}
          viSlug={viSlug}
          setViSlug={setViSlug}
          enSlug={enSlug}
          setEnSlug={setEnSlug}
          viSummary={viSummary}
          setViSummary={setViSummary}
          enSummary={enSummary}
          setEnSummary={setEnSummary}
          viBody={viBody}
          setViBody={setViBody}
          enBody={enBody}
          setEnBody={setEnBody}
          englishEnabled={englishEnabled}
          setEnglishEnabled={setEnglishEnabled}
          aiTranslating={aiTranslating}
          aiTranslateSuccess={aiTranslateSuccess}
          handleAiTranslate={handleAiTranslate}
        />

        {/* --- SHARED STRUCTURED DATA FIELDS (Excluded from tabs to avoid duplicates) --- */}
        {isProduct ? (
          <ProductBusinessFields
            priceMin={priceMin}
            setPriceMin={setPriceMin}
            priceMax={priceMax}
            setPriceMax={setPriceMax}
            quoteOnly={quoteOnly}
            setQuoteOnly={setQuoteOnly}
            category={category}
            setCategory={setCategory}
            brand={brand}
            setBrand={setBrand}
            refCode={refCode}
            setRefCode={setRefCode}
            showroom={showroom}
            setShowroom={setShowroom}
            featured={featured}
            setFeatured={setFeatured}
            materialsVi={materialsVi}
            setMaterialsVi={setMaterialsVi}
            materialsEn={materialsEn}
            setMaterialsEn={setMaterialsEn}
            dimensionsVi={dimensionsVi}
            setDimensionsVi={setDimensionsVi}
            dimensionsEn={dimensionsEn}
            setDimensionsEn={setDimensionsEn}
            specMaterialVi={specMaterialVi}
            setSpecMaterialVi={setSpecMaterialVi}
            specMaterialEn={specMaterialEn}
            setSpecMaterialEn={setSpecMaterialEn}
            specFinishVi={specFinishVi}
            setSpecFinishVi={setSpecFinishVi}
            specFinishEn={specFinishEn}
            setSpecFinishEn={setSpecFinishEn}
            specCareVi={specCareVi}
            setSpecCareVi={setSpecCareVi}
            specCareEn={specCareEn}
            setSpecCareEn={setSpecCareEn}
            englishEnabled={englishEnabled}
            galleryImages={galleryImages}
            setGalleryImages={setGalleryImages}
            customAttributes={customAttributes}
            setCustomAttributes={setCustomAttributes}
          />
        ) : (
          <BlogBusinessFields />
        )}

        {/* --- SEO FIELDSET --- */}
        <SeoFieldset
          kind={kind}
          seoTitleVi={seoTitleVi}
          setSeoTitleVi={setSeoTitleVi}
          seoTitleEn={seoTitleEn}
          setSeoTitleEn={setSeoTitleEn}
          seoDescVi={seoDescVi}
          setSeoDescVi={setSeoDescVi}
          seoDescEn={seoDescEn}
          setSeoDescEn={setSeoDescEn}
          englishEnabled={englishEnabled}
          viTitle={viTitle}
          enTitle={enTitle}
        />
      </div>

      <aside className="space-y-5">
        {isProduct && (
          <section className="surface-soft p-4 space-y-4">
          <h3 className="admin-section-title-pd">Ảnh bìa sản phẩm</h3>
            <ImageUploadDropzone value={coverImage} onChange={setCoverImage} label="Tải ảnh sản phẩm lên" />
          </section>
        )}
        <section className="surface-soft p-4">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-bold hover:from-sky-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="size-4" />
            Xem trước
          </button>
        </section>
        <ReadinessPanel items={dynamicReadiness} />
        <PublishWorkflow 
          status={status}
          onStatusChange={setStatus}
          errors={validationErrors} 
          onSaveDraft={() => alert("Đã lưu bản nháp thành công!")}
          onPublish={() => alert("Đã xuất bản thành công!")}
        />
      </aside>

      {/* --- OVERWRITE CONFIRMATION DIALOG --- */}
      {showOverwriteWarning && (
        <div className="fixed inset-0 z-[calc(var(--z-modal)+1)] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full border border-orange-200 shadow-xl">
            <h4 className="font-heading text-lg font-bold text-orange-700 flex items-center gap-2">
              <AlertTriangle className="size-5" />
              Ghi đè nội dung?
            </h4>
            <p className="mt-2 text-sm text-secondary">
              Bạn đang có các nội dung trong form chỉnh sửa. Việc tạo nội dung AI mới sẽ ghi đè toàn bộ dữ liệu hiện tại. Bạn có muốn tiếp tục?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                className="button-pd-outline py-1.5 text-xs"
                onClick={() => setShowOverwriteWarning(false)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="button-pd bg-orange-600 hover:bg-orange-700 py-1.5 text-xs text-white"
                onClick={triggerAiGeneration}
              >
                Tiếp tục & Ghi đè
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- AI REVIEW & APPROVAL DIALOG --- */}
      {showAiReviewDialog && aiResult && (
        <div className="fixed inset-0 z-[calc(var(--z-modal)+1)] flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border overflow-hidden">
            <div className="bg-indigo-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Sparkles className="size-5 text-yellow-300" />
                <h4 className="font-heading text-lg font-bold">Kiểm duyệt nội dung AI tạo</h4>
              </div>
              <button 
                type="button" 
                className="text-white/70 hover:text-white"
                onClick={() => setShowAiReviewDialog(false)}
              >
                <X className="size-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border">
                  <h5 className="font-semibold text-primary text-xs uppercase tracking-wider mb-3">Tiếng Việt</h5>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Tiêu đề</span>
                      <p className="text-sm font-semibold">{aiResult.viTitle}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Đường dẫn</span>
                      <p className="text-xs font-mono">{aiResult.viSlug}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Mô tả ngắn</span>
                      <p className="text-xs text-secondary leading-relaxed">{aiResult.viSummary}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Tiêu đề SEO</span>
                      <p className="text-xs text-secondary">{aiResult.seoTitleVi}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <h5 className="font-semibold text-indigo-950 text-xs uppercase tracking-wider mb-3">Tiếng Anh</h5>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Tiêu đề</span>
                      <p className="text-sm font-semibold text-indigo-900">{aiResult.enTitle}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Đường dẫn</span>
                      <p className="text-xs font-mono text-indigo-800">{aiResult.enSlug}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Mô tả ngắn</span>
                      <p className="text-xs text-secondary leading-relaxed">{aiResult.enSummary}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Tiêu đề SEO</span>
                      <p className="text-xs text-secondary">{aiResult.seoTitleEn}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t bg-slate-50 px-6 py-4 flex justify-between items-center">
              <span className="text-xs text-slate-500 font-semibold">
                Dữ liệu sẽ được tự động điền vào các trường tương ứng trên biểu mẫu chính.
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="button-pd-outline"
                  onClick={() => setShowAiReviewDialog(false)}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className="button-pd px-6"
                  onClick={applyGeneratedContent}
                >
                  <BadgeCheck className="size-4" />
                  Đồng ý và điền vào biểu mẫu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- DETAIL PREVIEW MODAL --- */}
      {previewOpen && (
        <DetailPreviewModal
          kind={kind}
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          data={{
            viTitle, enTitle, viSummary, enSummary, viBody, enBody,
            coverImage, galleryImages,
            priceMin, priceMax, quoteOnly, refCode, brand,
            materialsVi, materialsEn, dimensionsVi, dimensionsEn,
            specMaterialVi, specMaterialEn, specFinishVi, specFinishEn,
            specCareVi, specCareEn, customAttributes,
            category,
          }}
        />
      )}
    </div>
  );
}

function BilingualAuthoringFields({
  kind,
  viTitle,
  setViTitle,
  enTitle,
  setEnTitle,
  viSlug,
  setViSlug,
  enSlug,
  setEnSlug,
  viSummary,
  setViSummary,
  enSummary,
  setEnSummary,
  viBody,
  setViBody,
  enBody,
  setEnBody,
  englishEnabled,
  setEnglishEnabled,
  aiTranslating,
  aiTranslateSuccess,
  handleAiTranslate,
}: {
  kind: ContentKind;
  viTitle: string;
  setViTitle: (val: string) => void;
  enTitle: string;
  setEnTitle: (val: string) => void;
  viSlug: string;
  setViSlug: (val: string) => void;
  enSlug: string;
  setEnSlug: (val: string) => void;
  viSummary: string;
  setViSummary: (val: string) => void;
  enSummary: string;
  setEnSummary: (val: string) => void;
  viBody: string;
  setViBody: (val: string) => void;
  enBody: string;
  setEnBody: (val: string) => void;
  englishEnabled: boolean;
  setEnglishEnabled: (val: boolean) => void;
  aiTranslating: boolean;
  aiTranslateSuccess: boolean;
  handleAiTranslate: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"vi" | "en">("vi");
  const titleLabel = kind === "product" ? "Tiêu đề sản phẩm" : "Tiêu đề bài viết";
  const summaryLabel = kind === "product" ? "Mô tả ngắn / tóm tắt" : "Trích đoạn";

  // Calculate inline error counts
  const viErrorsCount = [viTitle, viSummary, viBody].filter(val => !val.trim()).length;
  const enErrorsCount = englishEnabled ? [enTitle, enSummary, enBody].filter(val => !val.trim()).length : 0;

  return (
    <section className="surface-soft p-4">
      <div className="flex flex-col justify-between gap-3 border-b border-[var(--admin-border)] pb-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Languages className="size-5 text-[var(--admin-accent)]" />
            <h3 className="admin-section-title-pd">Biên tập nội dung song ngữ</h3>
          </div>
          <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
            Tiếng Việt là nguồn biên tập chính. Bật tiếng Anh khi cần lưu bản dịch song ngữ.
          </p>
        </div>
        
        <div className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all duration-300 w-full md:max-w-2xl ${
          englishEnabled 
            ? "border-indigo-200 bg-gradient-to-r from-indigo-50/30 to-violet-50/30 shadow-[0_4px_20px_rgba(99,102,241,0.06)]" 
            : "border-slate-200 bg-slate-50/40"
        }`}>
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 rounded-lg p-2 ${englishEnabled ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"}`}>
              <Languages className="size-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Dịch nội dung sang tiếng Anh
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                Kích hoạt dịch tiếng Anh cho tên, mô tả, thông số kỹ thuật, slug và các thẻ SEO.
              </span>
            </div>
          </div>
          
          <label className="inline-flex items-center gap-3 cursor-pointer shrink-0">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={englishEnabled}
              aria-label="Bật trường tiếng Anh"
              onChange={(e) => {
                setEnglishEnabled(e.target.checked);
                if (e.target.checked) setActiveTab("en");
                else setActiveTab("vi");
              }}
            />
            <span className="relative inline-flex h-5 w-9 shrink-0 rounded-full border border-slate-300 bg-slate-200 transition-colors duration-200 after:absolute after:left-[2px] after:top-[2px] after:size-4 after:rounded-full after:bg-white after:shadow-[0_2px_4px_rgba(0,0,0,0.1)] after:transition-transform peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:after:translate-x-4" />
          </label>
        </div>
      </div>

      {/* --- TAB HEADERS --- */}
      <div className="mt-4 flex gap-2" role="tablist" aria-label="Tab nội dung song ngữ">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "vi"}
          className={`px-4 py-2 text-xs font-bold rounded-lg border transition flex items-center gap-2 ${
            activeTab === "vi" 
              ? "bg-slate-900 text-white border-slate-900" 
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
          onClick={() => setActiveTab("vi")}
        >
          Tiếng Việt
          {viErrorsCount > 0 && (
            <span className="size-2 rounded-full bg-red-500" title={`Thiếu ${viErrorsCount} trường`} />
          )}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "en"}
          className={`px-4 py-2 text-xs font-bold rounded-lg border transition flex items-center gap-2 ${
            activeTab === "en" 
              ? "bg-slate-900 text-white border-slate-900" 
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          } ${!englishEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => englishEnabled && setActiveTab("en")}
        >
          Tiếng Anh
          {englishEnabled && enErrorsCount > 0 && (
            <span className="size-2 rounded-full bg-red-500 animate-pulse" title={`Thiếu ${enErrorsCount} trường`} />
          )}
        </button>
      </div>

      {/* --- TAB CONTENT: VIETNAMESE --- */}
      {activeTab === "vi" && (
        <div className="mt-4 rounded-xl border border-[var(--admin-border)] bg-white p-4 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tab 1: Tiếng Việt (nguồn biên tập chính)</span>
            {viErrorsCount > 0 && (
              <span className="text-[11px] text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-100">
                Thiếu {viErrorsCount} trường bắt buộc
              </span>
            )}
          </div>
          
          <AdminField
            label={`${titleLabel} - Tiếng Việt *`}
            name={`${kind}-title-vi`}
            value={viTitle}
            onChange={setViTitle}
            placeholder="Nhập tiêu đề tiếng Việt..."
          />
          {!viTitle.trim() && <p className="text-red-500 text-xs mt-1">Vui lòng điền tiêu đề tiếng Việt.</p>}

          <AdminField 
            label="Đường dẫn - Tiếng Việt *" 
            name={`${kind}-slug-vi`} 
            value={viSlug}
            onChange={setViSlug}
            placeholder="sofa-curve-velour"
          />

          <AdminField
            label={`${summaryLabel} - Tiếng Việt *`}
            name={`${kind}-summary-vi`}
            value={viSummary}
            onChange={setViSummary}
            multiline
            placeholder="Nhập mô tả ngắn..."
          />
          {!viSummary.trim() && <p className="text-red-500 text-xs mt-1">Vui lòng điền mô tả ngắn.</p>}

          <div className="grid gap-2">
            <span className="label-pd">Nội dung chi tiết - Tiếng Việt *</span>
            <RichTextEditorMock 
              value={viBody}
              onChange={setViBody}
              placeholder="Nhập chi tiết nội dung tiếng Việt ở đây..."
            />
            {!viBody.trim() && <p className="text-red-500 text-xs mt-1">Vui lòng điền nội dung chi tiết.</p>}
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: ENGLISH --- */}
      {activeTab === "en" && englishEnabled && (
        <div className="mt-4 rounded-xl border border-[var(--admin-border)] bg-indigo-50/20 p-4 space-y-4">
          <div className="flex justify-between items-center border-b pb-2 border-indigo-100">
            <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Tab 2: Bản dịch tiếng Anh</span>
            
            <button
              type="button"
              className="button-pd-outline py-1 px-3 text-xs bg-white text-indigo-700 hover:text-indigo-900 border-indigo-200"
              onClick={handleAiTranslate}
              disabled={aiTranslating || !viTitle.trim()}
              aria-label="Dịch từ tiếng Việt bằng AI"
            >
              {aiTranslating ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Đang dịch bằng AI...
                </>
              ) : (
                <>
                  <Languages className="size-3.5" />
                  Dịch bằng AI
                </>
              )}
            </button>
          </div>

          {aiTranslateSuccess && (
            <p className="text-emerald-700 text-xs bg-emerald-50 border border-emerald-100 p-2 rounded">
              AI đã điền các trường tiếng Anh. Hãy xem và hiệu chỉnh thủ công nếu cần.
            </p>
          )}

          <AdminField
            label={`${titleLabel} - Tiếng Anh`}
            name={`${kind}-title-en`}
            value={enTitle}
            onChange={setEnTitle}
            placeholder="Nhập tiêu đề tiếng Anh..."
          />
          {!enTitle.trim() && <p className="text-red-500 text-xs mt-1">Cần nhập tiêu đề tiếng Anh.</p>}

          <AdminField 
            label="Đường dẫn - Tiếng Anh *" 
            name={`${kind}-slug-en`} 
            value={enSlug}
            onChange={setEnSlug}
            placeholder="sofa-curve-velour-en"
          />

          <AdminField
            label={`${summaryLabel} - Tiếng Anh *`}
            name={`${kind}-summary-en`}
            value={enSummary}
            onChange={setEnSummary}
            multiline
            placeholder="Nhập mô tả ngắn tiếng Anh..."
          />
          {!enSummary.trim() && <p className="text-red-500 text-xs mt-1">Cần nhập mô tả ngắn tiếng Anh.</p>}

          <div className="grid gap-2">
            <span className="label-pd">Nội dung chi tiết - Tiếng Anh *</span>
            <RichTextEditorMock 
              value={enBody}
              onChange={setEnBody}
              placeholder="Nhập nội dung tiếng Anh..."
            />
            {!enBody.trim() && <p className="text-red-500 text-xs mt-1">Cần nhập nội dung tiếng Anh.</p>}
          </div>
        </div>
      )}
    </section>
  );
}

function ProductBusinessFields({
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  quoteOnly,
  setQuoteOnly,
  category,
  setCategory,
  brand,
  setBrand,
  refCode,
  setRefCode,
  showroom,
  setShowroom,
  featured,
  setFeatured,
  materialsVi,
  setMaterialsVi,
  materialsEn,
  setMaterialsEn,
  dimensionsVi,
  setDimensionsVi,
  dimensionsEn,
  setDimensionsEn,
  specMaterialVi,
  setSpecMaterialVi,
  specMaterialEn,
  setSpecMaterialEn,
  specFinishVi,
  setSpecFinishVi,
  specFinishEn,
  setSpecFinishEn,
  specCareVi,
  setSpecCareVi,
  specCareEn,
  setSpecCareEn,
  englishEnabled,
  galleryImages,
  setGalleryImages,
  customAttributes,
  setCustomAttributes,
}: {
  priceMin: string;
  setPriceMin: (val: string) => void;
  priceMax: string;
  setPriceMax: (val: string) => void;
  quoteOnly: boolean;
  setQuoteOnly: (val: boolean) => void;
  category: string;
  setCategory: (val: string) => void;
  brand: string;
  setBrand: (val: string) => void;
  refCode: string;
  setRefCode: (val: string) => void;
  showroom: string;
  setShowroom: (val: string) => void;
  featured: boolean;
  setFeatured: (val: boolean) => void;
  materialsVi: string;
  setMaterialsVi: (val: string) => void;
  materialsEn: string;
  setMaterialsEn: (val: string) => void;
  dimensionsVi: string;
  setDimensionsVi: (val: string) => void;
  dimensionsEn: string;
  setDimensionsEn: (val: string) => void;
  specMaterialVi: string;
  setSpecMaterialVi: (val: string) => void;
  specMaterialEn: string;
  setSpecMaterialEn: (val: string) => void;
  specFinishVi: string;
  setSpecFinishVi: (val: string) => void;
  specFinishEn: string;
  setSpecFinishEn: (val: string) => void;
  specCareVi: string;
  setSpecCareVi: (val: string) => void;
  specCareEn: string;
  setSpecCareEn: (val: string) => void;
  englishEnabled: boolean;
  galleryImages: string[];
  setGalleryImages: (urls: string[]) => void;
  customAttributes: { id: string; nameVi: string; nameEn: string; valueVi: string; valueEn: string; }[];
  setCustomAttributes: (attrs: { id: string; nameVi: string; nameEn: string; valueVi: string; valueEn: string; }[]) => void;
}) {
  return (
    <>
      <section className="surface-soft p-4">
        <WorkflowIntro
          icon={Package}
          title="Ánh xạ danh mục, showroom và báo giá"
          description="Đây là hồ sơ sản phẩm ưu tiên báo giá, không phải SKU thương mại điện tử hoặc mặt hàng tồn kho."
          compact
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="label-pd">Danh mục sản phẩm</span>
            <PremiumSelect
              value={category}
              onValueChange={setCategory}
              ariaLabel="Danh mục sản phẩm"
              placeholder="Danh mục sản phẩm"
              tone="admin"
              options={[
                { value: "wood", label: "Đồ gỗ / Sofa" },
                { value: "sanitary", label: "Thiết bị vệ sinh / Sen tắm" },
                { value: "tiles", label: "Gạch ốp lát / Bề mặt hoàn thiện" },
              ]}
            />
          </label>
          <AdminField label="Nhãn hiệu / dòng sản phẩm" name="brand-series" value={brand} onChange={setBrand} />
          <AdminField label="Mã tham chiếu" name="reference-code" value={refCode} onChange={setRefCode} />
          <label className="grid gap-2">
            <span className="label-pd">Ánh xạ showroom</span>
            <PremiumSelect
              value={showroom}
              onValueChange={setShowroom}
              ariaLabel="Ánh xạ showroom"
              placeholder="Ánh xạ showroom"
              tone="admin"
              options={[
                { value: "district-7", label: "Showroom Quận 7" },
                { value: "hanoi", label: "Showroom đối tác Hà Nội" },
                { value: "project-only", label: "Chỉ tư vấn dự án" },
              ]}
            />
          </label>
          <label className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--admin-border)] bg-white p-3 text-sm">
            <input 
              className="mt-1" 
              type="checkbox" 
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)} 
            />
            <span>
              <strong className="block text-[var(--admin-text)]">Sản phẩm nổi bật</strong>
              <span className="text-[var(--admin-text-muted)]">Có thể hiển thị ở trang chủ và khu vực nổi bật trong danh mục.</span>
            </span>
          </label>
        </div>
      </section>

      <section className="surface-soft p-4 space-y-4">
        <WorkflowIntro
          icon={ImageUp}
          title="Thư viện ảnh sản phẩm"
          description="Tải nhiều ảnh để giới thiệu chi tiết sản phẩm và bối cảnh không gian cho khách truy cập."
          compact
        />
        <div className="mt-4">
          <MultiImageGalleryUpload value={galleryImages} onChange={setGalleryImages} />
        </div>
      </section>

      <section className="surface-soft p-4">
        <WorkflowIntro
          icon={Tag}
          title="Giá, kích thước và thông số"
          description="Hỗ trợ khoảng giá hoặc thông điệp chỉ nhận báo giá, không thêm giỏ hàng, thanh toán, tồn kho hoặc theo dõi đơn hàng."
          compact
        />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <AdminField label="Giá tối thiểu" name="price-min" value={priceMin} onChange={setPriceMin} />
          <AdminField label="Giá tối đa" name="price-max" value={priceMax} onChange={setPriceMax} />
          <label className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--admin-border)] bg-white p-3 text-sm md:col-span-1">
            <input 
              className="mt-1" 
              type="checkbox" 
              checked={quoteOnly}
              onChange={(e) => setQuoteOnly(e.target.checked)} 
            />
            <span>
              <strong className="block text-[var(--admin-text)]">Chỉ hiển thị báo giá</strong>
              <span className="text-[var(--admin-text-muted)]">Ẩn giá chính xác cho đến khi tư vấn.</span>
            </span>
          </label>
        </div>

        {/* Bilingual Materials and Dimensions */}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="bg-slate-50/50 p-4 rounded-xl border space-y-4">
            <p className="text-xs font-bold text-slate-700">Tiếng Việt: Chất liệu và kích thước</p>
            <AdminField label="Chất liệu / hoàn thiện (Tiếng Việt) *" name="materials-vi" value={materialsVi} onChange={setMaterialsVi} />
            <AdminField label="Kích thước (Tiếng Việt) *" name="dimensions-vi" value={dimensionsVi} onChange={setDimensionsVi} />
          </div>
          <div className={`p-4 rounded-xl border space-y-4 ${
            englishEnabled ? "bg-indigo-50/10 border-indigo-100" : "bg-slate-100/50 border-slate-200 opacity-60"
          }`}>
            <p className="text-xs font-bold text-indigo-900">Tiếng Anh: Chất liệu và kích thước</p>
            <AdminField 
              label="Chất liệu / hoàn thiện (Tiếng Anh) *" 
              name="materials-en" 
              value={materialsEn} 
              onChange={setMaterialsEn} 
              disabled={!englishEnabled}
              placeholder={!englishEnabled ? "Bật bản dịch tiếng Anh để chỉnh sửa" : ""}
            />
            <AdminField 
              label="Kích thước (Tiếng Anh) *" 
              name="dimensions-en" 
              value={dimensionsEn} 
              onChange={setDimensionsEn} 
              disabled={!englishEnabled}
              placeholder={!englishEnabled ? "Bật bản dịch tiếng Anh để chỉnh sửa" : ""}
            />
          </div>
        </div>

        {/* Bilingual Detailed Specifications */}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="bg-slate-50/50 p-4 rounded-xl border space-y-4">
            <p className="text-xs font-bold text-slate-700">Tiếng Việt: Thông số kỹ thuật chi tiết</p>
            <AdminField label="Thông số - Vật liệu (Tiếng Việt) *" name="spec-material-vi" value={specMaterialVi} onChange={setSpecMaterialVi} />
            <AdminField label="Thông số - Hoàn thiện (Tiếng Việt) *" name="spec-finish-vi" value={specFinishVi} onChange={setSpecFinishVi} />
            <AdminField label="Thông số - Bảo dưỡng (Tiếng Việt) *" name="spec-care-vi" value={specCareVi} onChange={setSpecCareVi} />
          </div>

          <div className={`p-4 rounded-xl border space-y-4 ${
            englishEnabled ? "bg-indigo-50/10 border-indigo-100" : "bg-slate-100/50 border-slate-200 opacity-60"
          }`}>
            <p className="text-xs font-bold text-indigo-900">Tiếng Anh: Thông số kỹ thuật chi tiết</p>
            <AdminField 
              label="Thông số - Vật liệu (Tiếng Anh) *" 
              name="spec-material-en" 
              value={specMaterialEn} 
              onChange={setSpecMaterialEn} 
              disabled={!englishEnabled}
              placeholder={!englishEnabled ? "Bật bản dịch tiếng Anh để chỉnh sửa" : ""}
            />
            <AdminField 
              label="Thông số - Hoàn thiện (Tiếng Anh) *" 
              name="spec-finish-en" 
              value={specFinishEn} 
              onChange={setSpecFinishEn} 
              disabled={!englishEnabled}
              placeholder={!englishEnabled ? "Bật bản dịch tiếng Anh để chỉnh sửa" : ""}
            />
            <AdminField 
              label="Thông số - Bảo dưỡng (Tiếng Anh) *" 
              name="spec-care-en" 
              value={specCareEn} 
              onChange={setSpecCareEn} 
              disabled={!englishEnabled}
              placeholder={!englishEnabled ? "Bật bản dịch tiếng Anh để chỉnh sửa" : ""}
            />
          </div>
        </div>
      </section>

      {/* Custom Attributes Section */}
      <section className="surface-soft p-4 space-y-4">
        <div className="flex flex-col justify-between gap-3 border-b border-[var(--admin-border)] pb-4 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <Plus className="size-5 text-[var(--admin-accent)]" />
            <h3 className="admin-section-title-pd">Thuộc tính tùy chỉnh</h3>
          </div>
          <button
            type="button"
            className="button-pd px-3 py-1.5 text-xs flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800"
            onClick={() => {
              setCustomAttributes([
                ...customAttributes,
                {
                  id: Math.random().toString(),
                  nameVi: "",
                  nameEn: "",
                  valueVi: "",
                  valueEn: ""
                }
              ]);
            }}
          >
            <Plus className="size-3.5" />
            Thêm thuộc tính
          </button>
        </div>

        {customAttributes.length === 0 ? (
          <p className="text-xs text-[var(--admin-text-muted)] py-2 text-center font-medium">
            Chưa có thuộc tính tùy chỉnh nào. Nhấn &quot;+ Thêm thuộc tính&quot; để cấu hình thêm.
          </p>
        ) : (
          <div className="space-y-4">
            {customAttributes.map((attr, index) => (
              <div
                key={attr.id}
                className="grid gap-4 items-end bg-white p-4 rounded-xl border md:grid-cols-[1fr_1fr_40px] relative group"
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <AdminField
                    label={`Tên thuộc tính (Tiếng Việt) #${index + 1}`}
                    name={`attr-${attr.id}-name-vi`}
                    value={attr.nameVi}
                    onChange={(val) => {
                      const updated = [...customAttributes];
                      updated[index].nameVi = val;
                      setCustomAttributes(updated);
                    }}
                    placeholder="Ví dụ: Xuất xứ"
                  />
                  <AdminField
                    label={`Tên thuộc tính (Tiếng Anh) #${index + 1}`}
                    name={`attr-${attr.id}-name-en`}
                    value={attr.nameEn}
                    onChange={(val) => {
                      const updated = [...customAttributes];
                      updated[index].nameEn = val;
                      setCustomAttributes(updated);
                    }}
                    placeholder={!englishEnabled ? "Bật bản dịch tiếng Anh để chỉnh sửa" : "Ví dụ: Origin"}
                    disabled={!englishEnabled}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <AdminField
                    label={`Giá trị (Tiếng Việt) #${index + 1}`}
                    name={`attr-${attr.id}-value-vi`}
                    value={attr.valueVi}
                    onChange={(val) => {
                      const updated = [...customAttributes];
                      updated[index].valueVi = val;
                      setCustomAttributes(updated);
                    }}
                    placeholder="Ví dụ: Việt Nam"
                  />
                  <AdminField
                    label={`Giá trị (Tiếng Anh) #${index + 1}`}
                    name={`attr-${attr.id}-value-en`}
                    value={attr.valueEn}
                    onChange={(val) => {
                      const updated = [...customAttributes];
                      updated[index].valueEn = val;
                      setCustomAttributes(updated);
                    }}
                    placeholder={!englishEnabled ? "Bật bản dịch tiếng Anh để chỉnh sửa" : "Ví dụ: Vietnam"}
                    disabled={!englishEnabled}
                  />
                </div>
                <div className="flex justify-center md:pb-1 pb-2">
                  <button
                    type="button"
                    className="p-2.5 bg-slate-50 text-slate-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition border"
                    onClick={() => {
                      setCustomAttributes(customAttributes.filter((_, i) => i !== index));
                    }}
                    title="Xóa thuộc tính"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function BlogBusinessFields() {
  return (
    <>
      <section className="surface-soft p-4">
        <WorkflowIntro
          icon={CalendarClock}
          title="Phân luồng biên tập và xuất bản"
          description="Làm rõ chủ đề, tác giả, lịch xuất bản và trạng thái kiểm duyệt trước khi xuất bản."
          compact
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="label-pd">Danh mục bài viết</span>
            <PremiumSelect
              defaultValue="wood-knowledge"
              ariaLabel="Danh mục bài viết"
              placeholder="Danh mục bài viết"
              tone="admin"
              options={[
                { value: "wood-knowledge", label: "Kiến thức đồ gỗ" },
                { value: "sanitary-guides", label: "Hướng dẫn mua thiết bị vệ sinh" },
                { value: "showroom-news", label: "Tin tức showroom" },
              ]}
            />
          </label>
          <AdminField label="Tác giả" name="author" defaultValue="Đội ngũ biên tập Phương Đông" />
          <AdminField label="Thẻ" name="tags" defaultValue="gỗ óc chó, phòng khách, hướng dẫn vật liệu" />
          <AdminField label="Ngày xuất bản" name="published-at" defaultValue="2026-06-10 09:00" />
          <label className="grid gap-2">
            <span className="label-pd">Trạng thái xuất bản</span>
            <PremiumSelect
              defaultValue="draft"
              ariaLabel="Trạng thái xuất bản"
              placeholder="Trạng thái xuất bản"
              tone="admin"
              options={[
                { value: "draft", label: "Bản nháp" },
                { value: "published", label: "Đã xuất bản" },
                { value: "archived", label: "Đã lưu trữ" },
              ]}
            />
          </label>
          <label className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--admin-border)] bg-white p-3 text-sm">
            <input className="mt-1" type="checkbox" />
            <span>
              <strong className="block text-[var(--admin-text)]">Bài viết nổi bật</strong>
              <span className="text-[var(--admin-text-muted)]">Hiển thị trong khu vực biên tập trên trang chủ.</span>
            </span>
          </label>
        </div>
      </section>

      <section className="surface-soft p-4">
        <WorkflowIntro
          icon={ImageUp}
          title="Ảnh bìa và tệp hỗ trợ"
          description="Cần có ảnh bìa để xuất bản. Thư viện tệp phụ là tùy chọn nhưng nên có văn bản thay thế song ngữ."
          compact
        />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {["Ảnh bìa", "Ảnh chèn trong bài", "Tệp thư viện"].map((label) => (
            <div key={label} className="rounded-[var(--radius-card)] border border-dashed border-[var(--admin-border-strong)] bg-white p-4 text-sm">
              <ImageUp className="size-5 text-[var(--admin-accent)]" />
              <p className="mt-3 font-semibold text-[var(--admin-text)]">{label}</p>
              <p className="mt-1 text-xs text-[var(--admin-text-muted)]">Chọn từ bộ sưu tập media có alt_vi và alt_en.</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function SeoFieldset({
  kind,
  seoTitleVi,
  setSeoTitleVi,
  seoTitleEn,
  setSeoTitleEn,
  seoDescVi,
  setSeoDescVi,
  seoDescEn,
  setSeoDescEn,
  englishEnabled,
  viTitle,
  enTitle,
}: {
  kind: ContentKind;
  seoTitleVi: string;
  setSeoTitleVi: (val: string) => void;
  seoTitleEn: string;
  setSeoTitleEn: (val: string) => void;
  seoDescVi: string;
  setSeoDescVi: (val: string) => void;
  seoDescEn: string;
  setSeoDescEn: (val: string) => void;
  englishEnabled: boolean;
  viTitle?: string;
  enTitle?: string;
}) {
  const [seoGenerating, setSeoGenerating] = useState(false);
  const [seoGenSuccess, setSeoGenSuccess] = useState(false);
  const [showSeoWarning, setShowSeoWarning] = useState(false);

  const hasExistingSeo = seoTitleVi.trim() || seoDescVi.trim() || seoTitleEn.trim() || seoDescEn.trim();

  const handleGenerateSeo = () => {
    if (!viTitle?.trim()) {
      setShowSeoWarning(true);
      setTimeout(() => setShowSeoWarning(false), 4000);
      return;
    }
    setShowSeoWarning(false);
    setSeoGenerating(true);
    setSeoGenSuccess(false);

    setTimeout(() => {
      setSeoGenerating(false);
      setSeoGenSuccess(true);

      const titleBase = viTitle;
      setSeoTitleVi(`${titleBase} - Showroom Phương Đông | Đồ gỗ nội thất cao cấp`);
      setSeoDescVi(`Khám phá ${titleBase.toLowerCase()} cao cấp tại Phương Đông. Chất liệu gỗ tự nhiên, thiết kế hiện đại. Nhận tư vấn và báo giá ngay.`);

      if (englishEnabled) {
        const enBase = enTitle || titleBase;
        setSeoTitleEn(`${enBase} - Phuong Dong Showroom | Premium Furniture`);
        setSeoDescEn(`Discover premium ${enBase.toLowerCase()} at Phuong Dong. Natural wood craftsmanship, modern design. Request a consultation today.`);
      }
    }, 800);
  };

  return (
    <section className="surface-soft p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <WorkflowIntro
          icon={Globe2}
          title="SEO và đường dẫn song ngữ"
          description={`Giữ siêu dữ liệu ${kind === "product" ? "sản phẩm" : kind === "blog" ? "bài viết" : kind} rõ ràng cho từng ngôn ngữ được bật trước khi xuất bản.`}
          compact
        />
        <button
          type="button"
          className="button-pd bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-none py-1.5 px-3.5 text-xs flex items-center gap-1.5 shrink-0 shadow-sm transition-all"
          onClick={handleGenerateSeo}
          disabled={seoGenerating}
        >
          {seoGenerating ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Đang tạo SEO bằng AI...
            </>
          ) : (
            <>
              <WandSparkles className="size-3.5" />
              Tạo SEO bằng AI
            </>
          )}
        </button>
      </div>

      {showSeoWarning && (
        <p className="mt-2 text-red-700 text-xs bg-red-50 border border-red-100 p-2.5 rounded-lg flex items-center gap-2 font-medium">
          <AlertTriangle className="size-4 text-red-600 shrink-0" />
          Vui lòng điền tên sản phẩm / bài viết (Tiếng Việt) trước khi dùng tính năng Tạo SEO bằng AI!
        </p>
      )}

      {hasExistingSeo && !seoGenSuccess && !seoGenerating && (
        <p className="mt-2 text-[11px] text-orange-600 font-semibold bg-orange-50 px-2 py-1 rounded border border-orange-100">
          Các trường SEO đã có nội dung. Tạo mới sẽ ghi đè giá trị hiện tại.
        </p>
      )}

      {seoGenSuccess && (
        <p className="mt-2 text-emerald-700 text-xs bg-emerald-50 border border-emerald-100 p-2 rounded flex items-center gap-2">
          <CheckCircle2 className="size-3.5 text-emerald-600" />
          Đã tạo siêu dữ liệu SEO. Vui lòng rà soát và chỉnh sửa khi cần.
        </p>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-4 bg-white space-y-3">
          <p className="text-xs font-bold text-slate-700">SEO: Tiếng Việt</p>
          <AdminField 
            label="Tiêu đề SEO - Tiếng Việt *" 
            name="seo-title-vi" 
            value={seoTitleVi} 
            onChange={setSeoTitleVi} 
          />
          {!seoTitleVi.trim() && <p className="text-red-500 text-xs">Cần nhập tiêu đề SEO tiếng Việt.</p>}
          
          <AdminField 
            label="Mô tả meta - Tiếng Việt *" 
            name="seo-description-vi" 
            value={seoDescVi} 
            onChange={setSeoDescVi} 
            multiline 
          />
          {!seoDescVi.trim() && <p className="text-red-500 text-xs">Cần nhập mô tả meta tiếng Việt.</p>}
        </div>

        {englishEnabled ? (
          <div className="rounded-xl border border-indigo-100 p-4 bg-indigo-50/10 space-y-3">
            <p className="text-xs font-bold text-indigo-900">SEO: Tiếng Anh</p>
            <AdminField 
              label="Tiêu đề SEO - Tiếng Anh *" 
              name="seo-title-en" 
              value={seoTitleEn} 
              onChange={setSeoTitleEn} 
            />
            {!seoTitleEn.trim() && <p className="text-red-500 text-xs">Cần nhập tiêu đề SEO tiếng Anh.</p>}
            
            <AdminField 
              label="Mô tả meta - Tiếng Anh *" 
              name="seo-description-en" 
              value={seoDescEn} 
              onChange={setSeoDescEn} 
              multiline 
            />
            {!seoDescEn.trim() && <p className="text-red-500 text-xs">Cần nhập mô tả meta tiếng Anh.</p>}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-4 flex items-center justify-center text-xs text-slate-400 text-center">
            Siêu dữ liệu SEO tiếng Anh đang tắt.<br />Bật trường tiếng Anh phía trên để cấu hình.
          </div>
        )}
      </div>
    </section>
  );
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  fields,
  warning,
  locked,
}: {
  icon: typeof Settings2;
  title: string;
  description: string;
  fields: string[];
  warning?: string;
  locked?: boolean;
}) {
  return (
    <section className="surface-soft p-4">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-panel)] bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]">
          <Icon className="size-5" />
        </div>
        <div>
          <h2 className="admin-section-title-pd">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--admin-text-muted)]">{description}</p>
        </div>
      </div>
      <ul className="mt-4 grid gap-2 text-sm text-[var(--admin-text-muted)]">
        {fields.map((field) => (
          <li key={field} className="flex gap-2 rounded-[var(--radius-card)] bg-white px-3 py-2">
            {locked ? <Lock className="mt-0.5 size-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--state-success)]" />}
            {field}
          </li>
        ))}
      </ul>
      {warning ? (
        <p className="mt-4 rounded-[var(--radius-card)] border border-[var(--state-warning)]/25 bg-[var(--state-warning-soft)] px-3 py-2 text-sm font-semibold text-[var(--state-warning)]">
          <AlertTriangle className="mr-1 inline size-4" />
          {warning}
        </p>
      ) : null}
    </section>
  );
}

function WorkflowIntro({
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

function ReadinessPanel({
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

function BilingualPair({
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

function AdminField({
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
}) {
  return (
    <label className="grid gap-2">
      <span className="label-pd">{label}</span>
      {multiline ? (
        <textarea
          className="input-pd min-h-24"
          name={name}
          defaultValue={value === undefined ? defaultValue : undefined}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          onInput={onChange ? (event) => onChange(event.currentTarget.value) : undefined}
        />
      ) : (
        <input
          className="input-pd"
          type={inputType}
          name={name}
          defaultValue={value === undefined ? defaultValue : undefined}
          value={value}
          placeholder={placeholder}
          min={min}
          max={max}
          disabled={disabled}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          onInput={onChange ? (event) => onChange(event.currentTarget.value) : undefined}
        />
      )}
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
  priceMin?: string;
  priceMax?: string;
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

export function DetailPreviewModal({
  kind,
  isOpen,
  onClose,
  data,
}: {
  kind: ContentKind | EntityKind;
  isOpen: boolean;
  onClose: () => void;
  data: PreviewData;
}) {
  const [locale, setLocale] = useState<"vi" | "en">("vi");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  if (!isOpen) return null;

  const t = (vi: string | undefined, en: string | undefined) => locale === "vi" ? (vi || "") : (en || vi || "");

  const tabs = [
    { id: "overview", label: locale === "vi" ? "Mô tả chi tiết" : "Overview" },
    { id: "specs", label: locale === "vi" ? "Thông số kỹ thuật" : "Specifications" },
    { id: "materials", label: locale === "vi" ? "Chất liệu & Gia công" : "Materials" },
    { id: "care", label: locale === "vi" ? "Bảo quản & Kích thước" : "Dimensions & Care" },
  ];

  const renderMockHeader = () => {
    const brandName = locale === "vi" ? "Nội Thất Phương Đông" : "Phuong Dong Furniture";
    const tagline = locale === "vi" ? "ĐỒ GỖ NỘI THẤT & THIẾT BỊ VỆ SINH" : "PREMIUM FURNITURE & SANITARY";
    const navItems = [
      { label: locale === "vi" ? "Trang chủ" : "Home", active: false },
      { label: locale === "vi" ? "Sản phẩm" : "Products", active: kind === "product" || kind === "category" },
      { label: locale === "vi" ? "Showrooms" : "Showrooms", active: kind === "showroom" },
      { label: locale === "vi" ? "Tin tức" : "Blog", active: kind === "blog" },
      { label: locale === "vi" ? "Về chúng tôi" : "About Us", active: false },
      { label: locale === "vi" ? "Liên hệ" : "Contact", active: false },
    ];
    return (
      <header className="public-header sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shrink-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 sm:h-20 items-center justify-between gap-6">
          <div className="flex shrink-0 flex-col">
            <span className="font-sans text-lg sm:text-xl font-bold leading-none text-[#1b3d35]">
              {brandName}
            </span>
            <span className="mt-1 text-[7px] sm:text-[8px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              {tagline}
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-5">
            {navItems.map((item, idx) => (
              <span
                key={idx}
                className={`text-xs sm:text-sm font-semibold cursor-default transition-colors relative py-1 ${
                  item.active ? "text-[#1b3d35] font-bold" : "text-slate-600 hover:text-[#1b3d35]"
                }`}
              >
                {item.label}
                {item.active && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#1b3d35]" />
                )}
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex rounded-md overflow-hidden border border-slate-200 p-0.5 bg-slate-100">
              <button
                type="button"
                onClick={() => setLocale("vi")}
                className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${
                  locale === "vi" ? "bg-white text-slate-800 shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                VI
              </button>
              <button
                type="button"
                onClick={() => setLocale("en")}
                className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${
                  locale === "en" ? "bg-white text-slate-800 shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                EN
              </button>
            </div>
            <span className="inline-flex items-center gap-2 bg-[#1b3d35] text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg cursor-default">
              <Phone className="size-3" />
              {locale === "vi" ? "0912.345.678" : "+84 912 345 678"}
            </span>
          </div>
        </div>
        
        {/* Catalog Subnav Bar */}
        <div className="bg-[#1b3d35] text-white select-none hidden sm:block">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-10 items-center gap-4">
            <div className="inline-flex h-full items-center gap-1.5 px-4 bg-[#234c42] text-xs font-bold cursor-default">
              <Menu className="size-3.5" />
              {locale === "vi" ? "Danh mục sản phẩm" : "Product Catalog"}
              <ChevronDown className="size-3" />
            </div>
            <div className="flex items-center gap-5 overflow-x-auto text-[10px] sm:text-xs font-semibold text-white/90">
              <span className="hover:text-white cursor-default">{locale === "vi" ? "Bàn ghế gỗ" : "Wooden Tables & Chairs"}</span>
              <span className="hover:text-white cursor-default">{locale === "vi" ? "Tủ thờ, sập thờ" : "Altars & Worship Beds"}</span>
              <span className="hover:text-white cursor-default">{locale === "vi" ? "Thiết bị vệ sinh" : "Sanitary Equipment"}</span>
              <span className="hover:text-white cursor-default">{locale === "vi" ? "Gạch ốp lát" : "Wall & Floor Tiles"}</span>
              <span className="hover:text-white cursor-default">{locale === "vi" ? "Gỗ xuất khẩu" : "Exported Woodwork"}</span>
            </div>
          </div>
        </div>
      </header>
    );
  };

  const renderMockFooter = () => {
    const brandName = locale === "vi" ? "Nội Thất Phương Đông" : "Phuong Dong Furniture";
    return (
      <footer className="bg-[#0b1614] text-slate-400 py-12 border-t border-slate-800 mt-16 shrink-0 w-full animate-fade-in">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-8 md:grid-cols-4 text-left">
          <div className="space-y-4">
            <h2 className="text-white font-bold text-base sm:text-lg">{brandName}</h2>
            <p className="text-xs leading-relaxed text-slate-400">
              {locale === "vi"
                ? "Nội thất, thiết bị vệ sinh và gạch ốp lát cao cấp. Không gian chuẩn mực cho mọi ngôi nhà Việt."
                : "Premium furniture, sanitary ware and tiles for refined living spaces."}
            </p>
            <div className="flex gap-2">
              <span className="p-1.5 rounded bg-slate-800 text-white cursor-default">
                <Globe2 className="size-4" />
              </span>
              <span className="p-1.5 rounded bg-slate-800 text-white cursor-default">
                <Share2 className="size-4" />
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">{locale === "vi" ? "Liên kết nhanh" : "Quick Links"}</h3>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white cursor-default">{locale === "vi" ? "Trang chủ" : "Home"}</span></li>
              <li><span className="hover:text-white cursor-default">{locale === "vi" ? "Sản phẩm" : "Products"}</span></li>
              <li><span className="hover:text-white cursor-default">{locale === "vi" ? "Showrooms" : "Showrooms"}</span></li>
              <li><span className="hover:text-white cursor-default">{locale === "vi" ? "Tin tức" : "News & Blog"}</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">{locale === "vi" ? "Chính sách" : "Policies"}</h3>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white cursor-default">{locale === "vi" ? "Chính sách bảo mật" : "Privacy Policy"}</span></li>
              <li><span className="hover:text-white cursor-default">{locale === "vi" ? "Điều khoản dịch vụ" : "Terms of Service"}</span></li>
              <li><span className="hover:text-white cursor-default">{locale === "vi" ? "Chính sách vận chuyển" : "Delivery Policy"}</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">{locale === "vi" ? "Đăng ký nhận tin" : "Newsletter"}</h3>
            <p className="text-xs mb-3 text-slate-400">
              {locale === "vi"
                ? "Nhận thông tin cập nhật mới nhất về sản phẩm và ưu đãi."
                : "Subscribe to get our latest news and deals."}
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Email"
                className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-l text-xs outline-none text-white w-full"
                readOnly
              />
              <button type="button" className="bg-[#1b3d35] text-white px-3 py-1.5 rounded-r text-xs font-bold">
                {locale === "vi" ? "Gửi" : "Send"}
              </button>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-slate-900 text-xs text-center text-slate-500">
          © 2026 Showroom Nội Thất Phương Đông. All rights reserved.
        </div>
      </footer>
    );
  };

  const renderProductPreview = () => {
    const allImages = [
      ...(data.coverImage ? [data.coverImage] : []),
      ...(data.galleryImages || []),
    ];

    const specsList = [
      { label: locale === "vi" ? "Kích thước" : "Dimensions", value: t(data.dimensionsVi, data.dimensionsEn) },
      { label: locale === "vi" ? "Chất liệu chính" : "Core Material", value: t(data.specMaterialVi, data.specMaterialEn) },
      { label: locale === "vi" ? "Hoàn thiện" : "Finish", value: t(data.specFinishVi, data.specFinishEn) },
      { label: locale === "vi" ? "Bảo quản" : "Care Instructions", value: t(data.specCareVi, data.specCareEn) },
      ...(data.customAttributes?.map(attr => ({
        label: locale === "vi" ? attr.nameVi : attr.nameEn,
        value: locale === "vi" ? attr.valueVi : attr.valueEn
      })) || [])
    ].filter(item => item.value);

    const relatedProducts = [
      {
        nameVi: "Bàn trà nguyên khối Gõ Đỏ",
        nameEn: "Solid Afzelia Wood Coffee Table",
        priceVi: "Liên hệ báo giá",
        priceEn: "Contact for pricing",
        code: "PD-RT01",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80"
      },
      {
        nameVi: "Ghế sofa da hoàng gia Châu Âu",
        nameEn: "Royal European Leather Sofa",
        priceVi: "18.500.000₫",
        priceEn: "18,500,000₫",
        code: "PD-SF02",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80"
      },
      {
        nameVi: "Tủ thờ gỗ Hương cao cấp",
        nameEn: "Premium Sandalwood Altar Cabinet",
        priceVi: "35.000.000₫",
        priceEn: "35,000,000₫",
        code: "PD-TH03",
        image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=400&q=80"
      }
    ];

    return (
      <div className="space-y-0 text-left">
        {/* Breadcrumbs */}
        <div className="bg-slate-50 border-b border-slate-100 py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span className="hover:text-[#1b3d35] cursor-default">{locale === "vi" ? "Trang chủ" : "Home"}</span>
            <ChevronRight className="size-3" />
            <span className="hover:text-[#1b3d35] cursor-default">{locale === "vi" ? "Sản phẩm" : "Products"}</span>
            <ChevronRight className="size-3" />
            <span className="text-slate-800 font-bold">{t(data.viTitle || data.nameVi, data.enTitle || data.nameEn) || (locale === "vi" ? "Chi tiết sản phẩm" : "Product details")}</span>
          </div>
        </div>

        {/* Section 1: Main product detail container */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left: Product Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50 shadow-inner flex items-center justify-center relative">
              {allImages[selectedImageIndex] ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={allImages[selectedImageIndex]}
                  alt="Product view"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-slate-300 flex flex-col items-center justify-center">
                  <ImageUp className="size-16 stroke-[1.5]" />
                  <p className="text-xs mt-2 font-medium">{locale === "vi" ? "Chưa có ảnh sản phẩm" : "No product image uploaded"}</p>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImageIndex(i)}
                    className={`shrink-0 size-20 rounded-lg overflow-hidden border-2 transition-all ${
                      i === selectedImageIndex ? "border-[#1b3d35] ring-2 ring-[#1b3d35]/25" : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Thumb ${i+1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info Panel */}
          <div className="surface-panel rounded-xl border border-slate-100 bg-slate-50/50 p-6 md:p-8 flex flex-col justify-between">
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#1b3d35]">
                  {locale === "vi" ? "Sản phẩm độc quyền" : "Exclusive Collection"}
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2 leading-tight">
                  {t(data.viTitle || data.nameVi, data.enTitle || data.nameEn) || (locale === "vi" ? "Tên sản phẩm" : "Product Name")}
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-medium">
                  {data.refCode || "PD-000"} · {data.category || (locale === "vi" ? "Chưa phân loại" : "Uncategorized")}
                </p>
              </div>

              {/* Price Panel */}
              <div className="bg-gradient-to-r from-amber-50/60 to-orange-50/60 border border-amber-100 rounded-xl p-4.5">
                {data.quoteOnly ? (
                  <div className="space-y-1">
                    <p className="text-xs text-amber-700 font-bold uppercase tracking-wider">{locale === "vi" ? "Liên hệ báo giá" : "Contact for Quote"}</p>
                    {data.priceMin && data.priceMax ? (
                      <p className="text-xl font-extrabold text-[#1b3d35]">
                        {Number(data.priceMin).toLocaleString("vi-VN")}₫ — {Number(data.priceMax).toLocaleString("vi-VN")}₫
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 mt-1">{locale === "vi" ? "Giá thương lượng theo kích thước và chất liệu gỗ" : "Negotiated price based on dimensions and wood types"}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-slate-400 font-medium mb-1">{locale === "vi" ? "Giá bán lẻ đề xuất" : "Suggested Retail Price"}</p>
                    <p className="text-2xl font-extrabold text-[#1b3d35]">
                      {data.priceMin ? `${Number(data.priceMin).toLocaleString("vi-VN")}₫` : (locale === "vi" ? "Chưa cập nhật giá" : "Price not updated")}
                    </p>
                  </div>
                )}
              </div>

              {/* Summary Description */}
              {(data.viSummary || data.enSummary) && (
                <p className="text-sm leading-relaxed text-slate-600 bg-white p-3 rounded-lg border border-slate-100 shadow-sm italic">
                  &quot;{t(data.viSummary, data.enSummary)}&quot;
                </p>
              )}

              {/* Quick Specs Grid */}
              {specsList.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {specsList.slice(0, 4).map((spec, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-3 rounded-lg flex gap-3 shadow-sm">
                      <Ruler className="size-5 text-[#1b3d35] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{spec.label}</p>
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">{spec.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="mt-8 space-y-3">
              <span className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#1b3d35] text-white rounded-xl font-bold text-sm shadow-md cursor-default">
                {locale === "vi" ? "Liên hệ ngay để nhận ưu đãi" : "Contact now for deals"}
                <ArrowRight className="size-4" />
              </span>
              <div className="grid gap-3 grid-cols-2">
                <span className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 cursor-default">
                  <Heart className="size-3.5 text-red-500 fill-red-500" />
                  {locale === "vi" ? "Đã lưu sản phẩm" : "Saved"}
                </span>
                <span className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 cursor-default">
                  <MapPin className="size-3.5 text-emerald-600" />
                  {locale === "vi" ? "Xem tại Showroom" : "View Showroom"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Interactive Tabs System */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 border-t border-slate-100">
          <div className="flex border-b border-slate-200 overflow-x-auto select-none">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-5 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[#1b3d35] text-[#1b3d35] font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-6 min-h-[160px]">
            {activeTab === "overview" && (
              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600">
                {t(data.viBody, data.enBody) ? (
                  <div dangerouslySetInnerHTML={{ __html: t(data.viBody, data.enBody) || "" }} />
                ) : (
                  <p className="italic text-slate-400">{locale === "vi" ? "Thông tin mô tả chi tiết sản phẩm đang được biên soạn..." : "Detailed product description is currently being compiled..."}</p>
                )}
              </div>
            )}

            {activeTab === "specs" && (
              <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-4 font-bold text-slate-600 w-1/3">{locale === "vi" ? "Thông số" : "Parameter"}</th>
                      <th className="p-4 font-bold text-slate-600">{locale === "vi" ? "Chi tiết giá trị" : "Details"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {specsList.map((spec, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 font-medium text-slate-500">{spec.label}</td>
                        <td className="p-4 font-semibold text-slate-700">{spec.value}</td>
                      </tr>
                    ))}
                    {specsList.length === 0 && (
                      <tr>
                        <td colSpan={2} className="p-8 text-center italic text-slate-400">
                          {locale === "vi" ? "Không có thông số kỹ thuật nào được nhập" : "No specifications have been entered"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "materials" && (
              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <h4 className="font-bold text-slate-800 text-base">{locale === "vi" ? "Quy chuẩn chất liệu gỗ" : "Wood Material Standards"}</h4>
                {t(data.materialsVi, data.materialsEn) ? (
                  <p>{t(data.materialsVi, data.materialsEn)}</p>
                ) : (
                  <p>
                    {locale === "vi"
                      ? "Sản phẩm được gia công từ 100% gỗ tự nhiên cao cấp đã qua quy trình tẩm sấy chống cong vênh mối mọt tiêu chuẩn xuất khẩu. Bề mặt sơn hoàn thiện phủ bóng bảo vệ vân gỗ tự nhiên sang trọng."
                      : "The product is crafted from 100% premium natural hardwood, treated through kiln-drying to prevent warping and woodworms under export standards. The finished surface is coated with protective lacquer highlighting natural luxury."}
                  </p>
                )}
              </div>
            )}

            {activeTab === "care" && (
              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 space-y-4">
                <h4 className="font-bold text-slate-800 text-base">{locale === "vi" ? "Hướng dẫn bảo quản sản phẩm" : "Care Instructions"}</h4>
                {t(data.specCareVi, data.specCareEn) ? (
                  <p>{t(data.specCareVi, data.specCareEn)}</p>
                ) : (
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>{locale === "vi" ? "Tránh đặt sản phẩm tiếp xúc trực tiếp dưới ánh nắng mặt trời." : "Avoid direct sunlight exposure on the product."}</li>
                    <li>{locale === "vi" ? "Không dùng hóa chất tẩy rửa mạnh để lau bề mặt gỗ." : "Do not use strong chemical cleansers on the wood surface."}</li>
                    <li>{locale === "vi" ? "Sử dụng khăn mềm ẩm để vệ sinh bụi bẩn định kỳ." : "Clean periodically with a soft damp cloth."}</li>
                    <li>{locale === "vi" ? "Đảm bảo độ ẩm phòng cân đối giúp giữ cấu trúc gỗ bền bỉ." : "Maintain balanced room humidity to prolong wood durability."}</li>
                  </ul>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Contact Form Layout */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-[#0b1614] text-white p-8 rounded-xl flex flex-col justify-center space-y-4">
            <span className="inline-block px-3 py-1 bg-[#1b3d35] text-xs font-bold rounded-full text-white w-fit uppercase tracking-wider">
              {locale === "vi" ? "Nhận báo giá riêng" : "Personalized Quote"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">{locale === "vi" ? "Yêu cầu báo giá đặc biệt" : "Request a Special Quote"}</h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              {locale === "vi"
                ? "Quý khách vui lòng cung cấp thông tin liên hệ. Đội ngũ chuyên viên tư vấn thiết kế của Nội Thất Phương Đông sẽ liên hệ tư vấn kích thước phong thủy và gửi bảng báo giá cụ thể trong vòng 2 giờ làm việc."
                : "Please submit your contact details. Phuong Dong design experts will consult on feng-shui measurements and provide a customized quote within 2 business hours."}
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1 text-left">
                <label className="text-[10px] text-slate-500 font-bold uppercase">{locale === "vi" ? "Họ và tên" : "Full Name"}</label>
                <input type="text" className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-xs outline-none" readOnly placeholder={locale === "vi" ? "Nguyễn Văn A" : "John Doe"} />
              </div>
              <div className="space-y-1 text-left">
                <label className="text-[10px] text-slate-500 font-bold uppercase">{locale === "vi" ? "Số điện thoại" : "Phone Number"}</label>
                <input type="text" className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-xs outline-none" readOnly placeholder="0901234567" />
              </div>
            </div>
            <div className="space-y-1 text-left">
              <label className="text-[10px] text-slate-500 font-bold uppercase">{locale === "vi" ? "Địa chỉ Email" : "Email Address"}</label>
              <input type="email" className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-xs outline-none" readOnly placeholder="name@domain.com" />
            </div>
            <div className="space-y-1 text-left">
              <label className="text-[10px] text-slate-500 font-bold uppercase">{locale === "vi" ? "Nội dung lời nhắn" : "Message details"}</label>
              <textarea rows={3} className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-xs outline-none resize-none" readOnly defaultValue={locale === "vi" ? `Tôi muốn nhận báo giá sản phẩm ${t(data.viTitle || data.nameVi, data.enTitle || data.nameEn) || "này"}.` : `I am interested in getting a quote for ${t(data.viTitle || data.nameVi, data.enTitle || data.nameEn) || "this product"}.`} />
            </div>
            <button type="button" className="w-full py-2.5 bg-[#1b3d35] text-white font-bold text-xs rounded-lg hover:bg-[#15302a] transition-all">
              {locale === "vi" ? "Gửi thông tin yêu cầu" : "Submit Quote Request"}
            </button>
          </div>
        </section>

        {/* Section 4: Related products grid */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-100">
          <h2 className="text-xl font-bold text-[#1b3d35] mb-6">{locale === "vi" ? "Sản phẩm liên quan" : "Related Products"}</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {relatedProducts.map((p, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group">
                <div className="aspect-square bg-slate-50 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.nameVi} className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
                </div>
                <div className="p-4 space-y-1.5 text-left">
                  <span className="text-[9px] text-[#1b3d35] font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">{p.code}</span>
                  <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{locale === "vi" ? p.nameVi : p.nameEn}</h3>
                  <p className="text-xs font-semibold text-amber-700">{locale === "vi" ? p.priceVi : p.priceEn}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  };

  const renderCategoryPreview = () => {
    const mockCatProducts = [
      { nameVi: "Bàn ăn tròn xoay xoan đào", nameEn: "Round Cherry Wood Dining Table", priceVi: "24.000.000₫", priceEn: "24,000,000₫", img: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=300&q=80" },
      { nameVi: "Ghế gỗ sồi bọc nệm", nameEn: "Oak Dining Chair with Cushions", priceVi: "2.100.000₫", priceEn: "2,100,000₫", img: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=300&q=80" },
      { nameVi: "Tủ rượu âm tường gỗ sồi", nameEn: "Built-in Oak Wine Cabinet", priceVi: "Liên hệ báo giá", priceEn: "Contact for pricing", img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=300&q=80" },
    ];

    return (
      <div className="space-y-0 text-left">
        {/* Breadcrumb */}
        <div className="bg-slate-50 border-b border-slate-100 py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span className="hover:text-[#1b3d35] cursor-default">{locale === "vi" ? "Trang chủ" : "Home"}</span>
            <ChevronRight className="size-3" />
            <span className="hover:text-[#1b3d35] cursor-default">{locale === "vi" ? "Danh mục" : "Categories"}</span>
            <ChevronRight className="size-3" />
            <span className="text-slate-800 font-bold">{t(data.nameVi, data.nameEn) || (locale === "vi" ? "Xem trước" : "Preview")}</span>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="relative h-64 overflow-hidden w-full">
          {data.coverImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={data.coverImage} alt="Category Banner" className="h-full w-full object-cover animate-fade-in" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#1b3d35] to-[#2d5d51]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 inset-x-0">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-white space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded">
                {locale === "vi" ? "Khám phá danh mục" : "Explore Category"}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">{t(data.nameVi, data.nameEn) || (locale === "vi" ? "Tên danh mục" : "Category Name")}</h1>
            </div>
          </div>
        </div>

        {/* Description & Grid */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {(data.descriptionVi || data.descriptionEn) && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-sm text-slate-600 leading-relaxed shadow-sm">
              {t(data.descriptionVi, data.descriptionEn)}
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800">{locale === "vi" ? "Sản phẩm trong danh mục" : "Products in this Category"}</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {mockCatProducts.map((p, idx) => (
                <div key={idx} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm group hover:shadow-md transition">
                  <div className="aspect-square bg-slate-50 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.img} alt={p.nameVi} className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                  <div className="p-4 space-y-1.5 text-left">
                    <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{locale === "vi" ? p.nameVi : p.nameEn}</h3>
                    <p className="text-xs font-semibold text-amber-700">{locale === "vi" ? p.priceVi : p.priceEn}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderShowroomPreview = () => {
    return (
      <div className="space-y-0 text-left">
        {/* Breadcrumb */}
        <div className="bg-slate-50 border-b border-slate-100 py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span className="hover:text-[#1b3d35] cursor-default">{locale === "vi" ? "Trang chủ" : "Home"}</span>
            <ChevronRight className="size-3" />
            <span className="hover:text-[#1b3d35] cursor-default">{locale === "vi" ? "Hệ thống Showroom" : "Showrooms"}</span>
            <ChevronRight className="size-3" />
            <span className="text-slate-800 font-bold">{t(data.nameVi, data.nameEn) || (locale === "vi" ? "Xem trước" : "Preview")}</span>
          </div>
        </div>

        {/* Hero banner */}
        <div className="relative h-64 overflow-hidden w-full">
          {data.coverImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={data.coverImage} alt="Showroom Cover" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#1b3d35] to-[#234c42]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 py-8 text-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-white">{locale === "vi" ? "Cửa hàng Phương Đông" : "Showroom Branch"}</span>
              <h1 className="text-3xl font-extrabold text-white">{t(data.nameVi, data.nameEn) || (locale === "vi" ? "Tên Showroom" : "Showroom Name")}</h1>
            </div>
          </div>
        </div>

        {/* Detail cards and maps */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl space-y-3 shadow-sm">
              <div className="flex items-center gap-2.5 text-sm font-bold text-slate-800">
                <Store className="size-4 text-[#1b3d35]" />
                {locale === "vi" ? "Địa chỉ cửa hàng" : "Showroom Address"}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{t(data.addressVi, data.addressEn) || (locale === "vi" ? "Chưa cập nhật địa chỉ" : "Address not updated")}</p>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl space-y-3 shadow-sm">
              <div className="flex items-center gap-2.5 text-sm font-bold text-slate-800">
                <CalendarClock className="size-4 text-emerald-600" />
                {locale === "vi" ? "Thời gian hoạt động" : "Opening Hours"}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{t(data.hoursVi, data.hoursEn) || (locale === "vi" ? "Chưa cập nhật giờ mở cửa" : "Hours not updated")}</p>
            </div>

            {data.hotline && (
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl space-y-3 shadow-sm">
                <div className="flex items-center gap-2.5 text-sm font-bold text-slate-800">
                  <Phone className="size-4 text-amber-600" />
                  {locale === "vi" ? "Đường dây nóng" : "Hotline Helpline"}
                </div>
                <p className="text-lg font-extrabold text-[#1b3d35]">{data.hotline}</p>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden p-2 shadow-sm min-h-[300px] flex flex-col">
            <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 text-xs font-bold text-slate-700 flex items-center gap-1.5 select-none">
              <Globe2 className="size-3.5 text-[#1b3d35]" />
              {locale === "vi" ? "Bản đồ vệ tinh" : "Google Maps Location"}
            </div>
            <div className="flex-1 w-full relative min-h-[260px] flex items-center justify-center bg-slate-50">
              {data.mapsEmbed && data.mapsEmbed.includes("<iframe") ? (
                <div className="absolute inset-0 w-full h-full [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:absolute [&_iframe]:inset-0 border-0" dangerouslySetInnerHTML={{ __html: data.mapsEmbed }} />
              ) : (
                <div className="text-center p-6 text-slate-400 space-y-2">
                  <MapPin className="size-10 mx-auto text-red-500 animate-bounce" />
                  <p className="text-xs font-bold">{locale === "vi" ? "Đang định vị vị trí..." : "Locating showroom..."}</p>
                  <p className="text-[10px] text-slate-400 max-w-xs">{locale === "vi" ? "Nhập mã nhúng iFrame từ Google Maps để tải bản đồ thật." : "Enter iframe embed code from Google Maps to display actual maps."}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBlogPreview = () => {
    return (
      <div className="space-y-0 text-left">
        {/* Breadcrumb */}
        <div className="bg-slate-50 border-b border-slate-100 py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span className="hover:text-[#1b3d35] cursor-default">{locale === "vi" ? "Trang chủ" : "Home"}</span>
            <ChevronRight className="size-3" />
            <span className="hover:text-[#1b3d35] cursor-default">{locale === "vi" ? "Tin tức" : "News & Blog"}</span>
            <ChevronRight className="size-3" />
            <span className="text-slate-800 font-bold">{t(data.viTitle || data.nameVi, data.enTitle || data.nameEn) || (locale === "vi" ? "Xem trước" : "Preview")}</span>
          </div>
        </div>

        {/* Cover photo */}
        <div className="relative h-72 sm:h-96 overflow-hidden w-full bg-slate-100">
          {data.coverImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={data.coverImage} alt="Blog Cover" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center text-slate-300">
              <ImageUp className="size-16 stroke-[1.5]" />
            </div>
          )}
        </div>

        {/* Article content */}
        <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <div className="flex items-center gap-3 select-none">
            <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded uppercase tracking-wider">
              {locale === "vi" ? "Cẩm nang nội thất" : "Interior Guide"}
            </span>
            <span className="text-xs text-slate-400">
              {new Date().toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-800 leading-tight">
            {t(data.viTitle || data.nameVi, data.enTitle || data.nameEn) || (locale === "vi" ? "Tiêu đề bài viết" : "Article Title")}
          </h1>

          {(data.viSummary || data.enSummary) && (
            <div className="border-l-4 border-rose-500 bg-rose-50/50 p-4 rounded-r-lg text-sm text-slate-600 font-medium italic">
              &quot;{t(data.viSummary, data.enSummary)}&quot;
            </div>
          )}

          <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-600 pt-4">
            {t(data.viBody, data.enBody) ? (
              <div dangerouslySetInnerHTML={{ __html: t(data.viBody, data.enBody) || "" }} />
            ) : (
              <p className="italic text-slate-400">{locale === "vi" ? "Nội dung bài viết đang được soạn thảo..." : "Article body content is currently being drafted..."}</p>
            )}
          </div>
        </article>
      </div>
    );
  };

  const renderContent = () => {
    switch (kind) {
      case "product": return renderProductPreview();
      case "category": return renderCategoryPreview();
      case "showroom": return renderShowroomPreview();
      case "blog": return renderBlogPreview();
      default: return <p className="p-6 text-sm text-slate-500">Chưa có chế độ xem trước cho loại nội dung này.</p>;
    }
  };

  const kindLabels: Record<string, { vi: string; en: string }> = {
    product: { vi: "Sản phẩm", en: "Sản phẩm" },
    category: { vi: "Danh mục", en: "Danh mục" },
    showroom: { vi: "Showroom", en: "Showroom" },
    blog: { vi: "Bài viết", en: "Bài viết" },
  };

  return createPortal(
    <div className="fixed inset-0 z-[calc(var(--z-modal)+2)]">
      <button
        type="button"
        aria-label="Đóng lớp phủ xem trước"
        className="absolute inset-0 h-full w-full cursor-default bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 flex flex-col -translate-x-1/2 -translate-y-1/2 w-[98vw] max-w-[1440px] h-[94vh] max-h-[94vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200/50 animate-in zoom-in-95 duration-200">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#1b3d35] text-white shrink-0 border-b border-[#234c42]">
          <div className="flex items-center gap-3">
            <Eye className="size-4 text-sky-400 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-bold tracking-wide">
              Chế độ xem trước trang công khai: {kindLabels[kind]?.[locale] || kind}
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[10px] text-emerald-300 font-bold bg-[#234c42] px-2.5 py-1 rounded border border-[#2d5d51] hidden sm:block">
              Đồng bộ CMS trực tiếp
            </p>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 transition text-white"
              aria-label="Đóng xem trước"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-white">
          {renderMockHeader()}
          {renderContent()}
          {renderMockFooter()}
        </div>
      </div>
    </div>,
    document.body
  );
}

// --- HOMEPAGE LIVE PREVIEW (for Settings) ---
function HomepageLivePreview({
  testId,
  device,
  heroVisible, heroHeadlineVi, heroSubtitleVi, heroCtaLabel, heroImage1,
  heroCtaLink,
  slide2TitleVi, slide2LeadVi, slide2Image,
  slide3TitleVi, slide3LeadVi, slide3Image,
  aboutHeadingVi, aboutLeadVi, aboutImage,
  featuredVisible, featuredMaxItems,
  showroomVisible, showroomHeadingVi, showroomLeadVi, showroomCtaVi, showroomBgImage,
  quoteVisible, quoteHeadingVi, quoteLeadVi,
  blogSectionVisible, blogHeadingVi, blogMaxPosts,
  trustBadgesVisible, badge1ValueVi, badge1DescVi, badge2ValueVi, badge2DescVi,
  brandNameVi, contactPhone,
}: {
  testId?: string;
  device: "desktop" | "mobile";
  heroVisible: boolean;
  heroHeadlineVi: string;
  heroSubtitleVi: string;
  heroCtaLabel: string;
  heroCtaLink: string;
  heroImage1: string;
  slide2TitleVi: string;
  slide2LeadVi: string;
  slide2Image: string;
  slide3TitleVi: string;
  slide3LeadVi: string;
  slide3Image: string;
  aboutHeadingVi: string;
  aboutLeadVi: string;
  aboutImage: string;
  featuredVisible: boolean;
  featuredMaxItems: string;
  showroomVisible: boolean;
  showroomHeadingVi: string;
  showroomLeadVi: string;
  showroomCtaVi: string;
  showroomBgImage: string;
  quoteVisible: boolean;
  quoteHeadingVi: string;
  quoteLeadVi: string;
  blogSectionVisible: boolean;
  blogHeadingVi: string;
  blogMaxPosts: string;
  trustBadgesVisible: boolean;
  badge1ValueVi: string;
  badge1DescVi: string;
  badge2ValueVi: string;
  badge2DescVi: string;
  brandNameVi: string;
  contactPhone: string;
}) {
  const isMobile = device === "mobile";
  const containerClass = isMobile ? "mx-auto w-[360px] min-w-[360px] max-w-[360px]" : "w-full min-w-[720px]";
  const scale = isMobile ? "text-[11px]" : "text-xs";
  const featuredItems = settingsPreviewProducts.slice(
    0,
    getPreviewLimit(featuredMaxItems, Number(settingsHomepageDefaults.featuredMaxItems), settingsPreviewProducts.length)
  );
  const editorialPosts = blogPosts.slice(
    0,
    getPreviewLimit(blogMaxPosts, Number(settingsHomepageDefaults.blogMaxPosts), blogPosts.length)
  );
  const featuredGridClass = isMobile ? "grid-cols-2" : featuredItems.length >= 5 ? "grid-cols-5" : "grid-cols-4";
  const previewTrustBadges = [
    { value: badge1ValueVi || trustBadges[0].value, label: badge1DescVi || localized(trustBadges[0].label, "vi") },
    { value: badge2ValueVi || trustBadges[1].value, label: badge2DescVi || localized(trustBadges[1].label, "vi") },
    { value: trustBadges[2].value, label: localized(trustBadges[2].label, "vi") },
  ];
  const heroSlides = [
    { title: heroHeadlineVi || viMessages.home.heroTitle, lead: heroSubtitleVi || viMessages.home.heroLead, image: heroImage1 || imageAssets.aboutHero },
    { title: slide2TitleVi || viMessages.home.heroSlide2Title, lead: slide2LeadVi || viMessages.home.heroSlide2Lead, image: slide2Image || imageAssets.showroom },
    { title: slide3TitleVi || viMessages.home.heroSlide3Title, lead: slide3LeadVi || viMessages.home.heroSlide3Lead, image: slide3Image || imageAssets.room },
  ];

  // Mirrors the public shell in a compact frame without mounting route navigation logic.
  const renderHeader = () => (
    <header className="public-header sticky top-0 z-10 w-full shrink-0">
      <div className={`flex items-center justify-between gap-3 ${isMobile ? "h-14 px-4" : "h-16 px-5"}`}>
        <div className="flex min-w-0 flex-col">
          <span className={`${isMobile ? "max-w-[150px] text-sm" : "text-lg"} truncate font-heading font-bold leading-none text-primary`}>
            {brandNameVi || viMessages.common.brand}
          </span>
          <span className="mt-1 text-[7px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
            {viMessages.common.tagline}
          </span>
        </div>
        {isMobile ? (
          <button type="button" className="btn-pd-icon size-9" aria-label={viMessages.nav.menu}>
            <Menu className="size-4" />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 text-[10px] font-semibold text-secondary">
              <span>{viMessages.nav.products}</span>
              <span>{viMessages.nav.showrooms}</span>
              <span>{viMessages.nav.blog}</span>
            </div>
            <span className="button-pd min-h-8 px-3 py-1 text-[10px]">
              <Phone className="size-3" />
              {viMessages.nav.quote}
            </span>
          </div>
        )}
      </div>
      {!isMobile ? (
        <div className="public-catalog-bar">
          <div className="flex h-11 items-center gap-3 px-5">
            <span className="inline-flex h-full min-w-[170px] items-center gap-2 bg-primary-container/90 px-3 text-[10px] font-bold text-white">
              <Menu className="size-4" />
              {viMessages.nav.catalog}
            </span>
            {productGroups.map((group) => (
              <span key={group.key} className="rounded-[var(--radius-control)] px-2.5 py-1 text-[10px] font-bold text-white/86">
                {localized(group.title, "vi")}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );

  const renderFooter = () => (
    <footer className="public-footer w-full shrink-0 border-t border-white/10 p-4 text-[9px] text-white/62">
      <div className={`grid gap-4 text-left ${isMobile ? "grid-cols-1" : "grid-cols-[1.2fr_1fr_1fr]"}`}>
        <div className="space-y-1">
          <p className="font-heading text-sm font-bold text-white">{brandNameVi || viMessages.common.brand}</p>
          <p className="text-[8px] leading-normal text-white/58">{viMessages.meta.homeDescription}</p>
        </div>
        <div className="space-y-1">
          <p className="font-bold text-white">{viMessages.nav.products}</p>
          <p>{localized(productGroups[0].title, "vi")}</p>
          <p>{localized(productGroups[1].title, "vi")}</p>
        </div>
        {!isMobile ? (
          <div className="space-y-1">
            <p className="font-bold text-white">{viMessages.nav.showrooms}</p>
            <p>{localized(showrooms[0].name, "vi")}</p>
            <p>{contactPhone || showrooms[0].hotline}</p>
          </div>
        ) : null}
      </div>
      <div className="mt-3 border-t border-white/10 pt-2 text-center text-[7px] text-white/40">
        © 2026 {brandNameVi || viMessages.common.brand}. All rights reserved.
      </div>
    </footer>
  );

  return (
    <div
      data-testid={testId}
      data-preview-device={device}
      className={`${containerClass} ${scale} bg-white rounded-xl border border-slate-200 shadow-inner overflow-hidden flex flex-col max-h-[85vh]`}
    >
      {renderHeader()}

      {/* Main Homepage content scroll viewport */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* 1. Hero Showcase */}
        {heroVisible && (
          <section
            data-preview-section="hero"
            data-primary-cta={heroCtaLabel}
            data-primary-cta-href={heroCtaLink}
            className="public-hero relative isolate overflow-hidden text-white"
          >
            <div className={`relative mx-auto overflow-hidden ${isMobile ? "h-[360px]" : "h-[440px]"}`}>
              {!isMobile && heroSlides.slice(1).map((slide, index) => (
                <div
                  key={slide.title}
                  className={`absolute top-1/2 hidden h-[72%] w-[28%] -translate-y-1/2 overflow-hidden rounded-[var(--radius-section)] opacity-55 md:block ${
                    index === 0 ? "-left-14" : "-right-14"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={slide.image} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/45" />
                </div>
              ))}
              <div className={`absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[var(--radius-section)] shadow-[0_24px_70px_rgba(38,49,45,0.2)] ${
                isMobile ? "h-[calc(100%-1.5rem)] w-[calc(100%-1rem)]" : "h-[calc(100%-2rem)] w-[min(88%,640px)]"
              }`}>
                {heroSlides[0].image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
                  <img data-preview-image="hero-primary" src={heroSlides[0].image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary text-white/20">
                    <Store className="size-16 stroke-[1]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/62 via-black/20 to-black/24" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/16" />
              </div>
              <div className="absolute inset-0 z-20 flex items-center justify-center px-5 pb-10 pt-12 text-center">
                <div className="mx-auto max-w-xl">
                  <p className="label-pd text-white/74">{viMessages.home.heroEyebrow}</p>
                  <h1 className={`mx-auto mt-3 max-w-[12ch] font-heading font-bold leading-none text-white ${isMobile ? "text-4xl" : "text-5xl"}`}>
                    {heroSlides[0].title}
                  </h1>
                  <p className={`mx-auto mt-4 max-w-md text-white/82 ${isMobile ? "text-[11px] leading-5" : "text-sm leading-6"}`}>
                    {heroSlides[0].lead}
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {productGroups.slice(0, 2).map((group) => (
                      <span key={group.key} data-preview-hero-group className="public-hero-group-link min-h-8 px-3 py-1.5 text-[10px]">
                        {localized(group.title, "vi")}
                        <ChevronRight className="size-3" />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 2. Bento Product Groups */}
        <section data-preview-section="product-groups" className="px-4 py-8">
          <div className={`mb-5 grid gap-3 text-left ${isMobile ? "" : "grid-cols-[0.8fr_1fr] items-end"}`}>
            <div>
              <p className="label-pd">{viMessages.common.tagline}</p>
              <h2 className="mt-2 font-heading text-2xl font-bold leading-tight text-primary">{viMessages.home.groupsTitle}</h2>
            </div>
            {!isMobile ? (
              <p className="text-[11px] leading-5 text-secondary">{viMessages.home.groupsLead}</p>
            ) : null}
          </div>
          <div className={`grid gap-2.5 ${isMobile ? "grid-cols-1" : "grid-cols-[1.2fr_0.8fr_0.8fr]"}`}>
            {productGroups.map((group) => (
              <div
                key={group.key}
                data-preview-card="product-group"
                className={`interactive-card public-image-panel relative min-h-36 ${!isMobile && group.key === "wood" ? "row-span-2 min-h-[300px]" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={group.image} alt={localized(group.title, "vi")} className="image-lift h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute bottom-0 p-4 text-left text-white">
                  <h3 className="font-heading text-lg font-bold leading-tight text-white">{localized(group.title, "vi")}</h3>
                  <p className="mt-1 text-[10px] leading-4 text-white/80">{localized(group.summary, "vi")}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Featured Products */}
        {featuredVisible && (
          <section
            data-preview-section="featured-products"
            data-preview-available-products={settingsPreviewProducts.length}
            className="bg-surface-container-low px-4 py-8"
          >
            <div className="mb-4 flex justify-between gap-3">
              <div className="text-left">
                <p className="label-pd">{viMessages.common.tagline}</p>
                <h2 className="mt-2 font-heading text-xl font-bold leading-tight text-primary">{viMessages.home.featuredTitle}</h2>
                {!isMobile ? <p className="mt-2 max-w-md text-[11px] leading-5 text-secondary">{viMessages.home.featuredLead}</p> : null}
              </div>
              {!isMobile ? <span className="text-[10px] font-bold text-primary">{viMessages.common.viewAll}</span> : null}
            </div>
            <div className={`grid gap-3 ${featuredGridClass}`}>
              {featuredItems.map((product) => (
                <div key={product.slug} data-preview-card="featured-product" className="card-pd interactive-card overflow-hidden text-left">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.image} alt={localized(product.name, "vi")} className="image-lift h-full w-full object-cover" />
                    <div className="reference-chip-pd absolute left-2 top-2 px-2 py-0.5 text-[7px]">{product.referenceCode}</div>
                  </div>
                  <div className="p-2.5">
                    <p className="label-pd text-[7px]">{localized(product.category, "vi")}</p>
                    <h3 className="mt-1 line-clamp-2 font-heading text-[11px] font-bold leading-tight text-primary">{localized(product.name, "vi")}</h3>
                    {!isMobile ? <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-secondary">{localized(product.summary, "vi")}</p> : null}
                    <p className="mt-2 truncate text-[10px] font-bold text-primary">{localized(product.price, "vi")}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Blog & Trust Badges Section */}
        <section data-preview-section="editorial-trust" className={`grid gap-5 px-4 py-8 ${isMobile ? "grid-cols-1" : "grid-cols-[1.05fr_0.95fr]"}`}>
          {blogSectionVisible && (
            <div className="space-y-2 text-left">
              <p className="label-pd">{blogHeadingVi || viMessages.home.editorialTitle}</p>
              <h2 className="mb-4 font-heading text-xl font-bold leading-tight text-primary">{viMessages.home.editorialLead}</h2>
              <div className="space-y-2">
                {editorialPosts.map((post) => (
                  <div key={post.slug} data-preview-card="blog-post" className="card-pd interactive-card grid grid-cols-[86px_1fr] gap-3 overflow-hidden p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.image} alt={localized(post.title, "vi")} className="h-full min-h-20 rounded-lg object-cover" />
                    <div className="min-w-0 py-1">
                      <p className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.12em] text-outline">
                        <BookOpen className="size-3" />
                        {localized(post.readTime, "vi")}
                      </p>
                      <h3 className="mt-2 line-clamp-2 font-heading text-[12px] font-bold leading-tight text-primary">{localized(post.title, "vi")}</h3>
                      <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-secondary">{localized(post.excerpt, "vi")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust Badges */}
          {trustBadgesVisible && (
            <div className="surface-soft p-4 text-left">
              <p className="label-pd">{viMessages.home.trustTitle}</p>
              <h2 className="mt-2 font-heading text-xl font-bold leading-tight text-primary">{viMessages.home.trustLead}</h2>
              <div className={`mt-5 grid gap-3 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}>
                {previewTrustBadges.map((badge) => (
                  <div key={`${badge.value}-${badge.label}`} data-preview-card="trust-badge" className="surface-card p-4">
                    <BadgeCheck className="size-5 text-primary" />
                    <strong className="mt-3 block font-heading text-xl font-bold text-primary">{badge.value}</strong>
                    <p className="mt-1 text-[10px] leading-4 text-secondary">{badge.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 5. Showroom Section */}
        {showroomVisible && (
          <section data-preview-section="showroom" className={`relative isolate overflow-hidden bg-surface-inverse text-white ${isMobile ? "p-5" : "min-h-[360px] p-7"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img data-preview-image="showroom-background" src={showroomBgImage || imageAssets.showroom} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-r from-surface-inverse/92 via-surface-inverse/64 to-surface-inverse/24" />
            <div className={`relative z-10 grid gap-5 ${isMobile ? "grid-cols-1" : "grid-cols-[1fr_0.9fr] items-center"}`}>
              <div className="text-left">
                <p className="label-pd text-white/65">{viMessages.common.tagline}</p>
                <h2 className="mt-2 font-heading text-2xl font-bold leading-tight text-white">{showroomHeadingVi || viMessages.home.showroomTitle}</h2>
                <p className="mt-3 max-w-md text-[11px] leading-5 text-white/75">{showroomLeadVi || viMessages.home.showroomLead}</p>
                <div className="mt-5 space-y-4">
                  {showrooms.slice(0, 2).map((showroom) => (
                    <div key={showroom.code} className="border-l border-white/25 pl-4">
                      <h3 className="font-heading text-sm font-bold text-white">{localized(showroom.name, "vi")}</h3>
                      <p className="mt-1 flex gap-1.5 text-[10px] leading-4 text-white/75">
                        <MapPin className="mt-0.5 size-3 shrink-0" />
                        {localized(showroom.address, "vi")}
                      </p>
                      <p className="mt-1 flex gap-1.5 text-[10px] leading-4 text-white/75">
                        <Phone className="mt-0.5 size-3 shrink-0" />
                        {viMessages.home.hotlineLabel}: {showroom.hotline}
                      </p>
                    </div>
                  ))}
                </div>
                <span className="public-inverse-button mt-5 min-h-8 px-3 py-2 text-[10px]">{showroomCtaVi || viMessages.home.showroomCta}</span>
              </div>
              {!isMobile ? (
                <div className="public-glass-panel p-4 text-left">
                  <p className="label-pd text-white/60">{showroomCtaVi || viMessages.home.showroomCta}</p>
                  <p className="mt-3 font-heading text-2xl font-bold text-white">{localized(showrooms[0].name, "vi")}</p>
                  <p className="mt-2 flex gap-2 text-[11px] leading-5 text-white/72">
                    <MapPin className="mt-0.5 size-3 shrink-0" />
                    {localized(showrooms[0].address, "vi")}
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        )}

        {/* 6. Story Section */}
        <section data-preview-section="story" className={`grid gap-5 px-4 py-8 ${isMobile ? "grid-cols-1" : "grid-cols-[0.9fr_1.1fr] items-center"}`}>
                  <div className="surface-inverse relative min-h-64 overflow-hidden text-white">
            {aboutImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img data-preview-image="story" src={aboutImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-primary text-white/20">
                <Store className="size-10" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/72 to-primary/20" />
            <div className="absolute bottom-0 p-5 text-left">
              <p className="label-pd text-white/65">{viMessages.home.storyTitle}</p>
              <h2 className="mt-3 font-heading text-2xl font-bold leading-tight text-white">{slide3TitleVi || viMessages.home.heroSlide3Title}</h2>
            </div>
          </div>
          <div className="text-left">
            <p className="label-pd">{viMessages.home.storyTitle}</p>
            <h2 className="mt-2 font-heading text-2xl font-bold leading-tight text-primary">{aboutHeadingVi || viMessages.home.heroSlide3Title}</h2>
            <p className="mt-3 text-[11px] leading-5 text-secondary">{aboutLeadVi || viMessages.home.storyLead}</p>
          </div>
        </section>

        {/* 7. Quote Banner / Form */}
        {quoteVisible && (
          <section data-preview-section="quote" className="px-4 py-8">
            <div className="surface-soft mx-auto max-w-lg p-4 text-left">
              <p className="label-pd">{viMessages.nav.quote}</p>
              <h2 className="mt-2 font-heading text-xl font-bold leading-tight text-primary">{quoteHeadingVi || viMessages.home.quoteTitle}</h2>
              <p className="mt-2 text-[11px] leading-5 text-secondary">{quoteLeadVi || viMessages.home.quoteLead}</p>
              <div className="mt-4 grid gap-2">
                <div className="input-pd h-9 text-[10px] text-outline">{viMessages.contact.name}</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="input-pd h-9 text-[10px] text-outline">{viMessages.contact.phone}</div>
                  <div className="input-pd h-9 text-[10px] text-outline">{viMessages.contact.email}</div>
                </div>
                <div className="input-pd h-16 text-[10px] text-outline">{viMessages.contact.message}</div>
                <span className="button-pd min-h-9 justify-center text-[10px]">{viMessages.contact.submit}</span>
              </div>
            </div>
          </section>
        )}
      </div>

      {renderFooter()}
    </div>
  );
}

function getFocusableElements(container: HTMLElement | null) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true");
}

// --- IMAGE UPLOAD DROPZONE ---
export function ImageUploadDropzone({
  value,
  onChange,
  label = "Tải ảnh lên (Upload Image)",
}: {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  return (
    <MediaPicker
      value={value}
      onChange={(url) => onChange(url)}
      label={label}
    />
  );
}

// --- MULTI-IMAGE GALLERY UPLOAD ---
export function MultiImageGalleryUpload({
  value = [],
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const handleRemoveImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {value.map((url, index) => (
        <div key={index} className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm group">
          <div className="relative h-full w-full overflow-hidden rounded-lg bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Ảnh thư viện ${index + 1}`} className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                onClick={() => handleRemoveImage(index)}
                title="Xóa ảnh"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white hover:border-indigo-500 hover:bg-indigo-50/10 transition text-center">
        <MediaPicker
          value=""
          onChange={(url) => {
            if (url) onChange([...value, url]);
          }}
          label="Thêm ảnh"
        />
      </div>
    </div>
  );
}
