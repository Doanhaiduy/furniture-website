"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useToast } from "@/components/providers/toast-provider";
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
  EyeOff,
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
import { PremiumSelect } from "../premium-select";
import {
  MediaUploadPanel,
  PublishWorkflow,
  RichTextEditorMock,
  MediaPicker,
} from "../admin-interactions";
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


import {
  type ContentKind,
  type EntityKind,
  type SettingsTab,
  slugify,
  formatVnNumber,
  readVnNumber,
  productReadiness,
  blogReadiness,
  settingsHomepageDefaults,
  settingsPreviewProducts,
  getPreviewLimit,
  formatBytes,
  getAssetName,
  getFocusableElements,
  WorkflowIntro,
  ReadinessPanel,
  BilingualPair,
  AdminField,
} from "../admin-workflows";

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
  const params = useParams();
  const locale = (params?.locale as string) || "vi";
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const isOpen = open;
  const [mounted, setMounted] = useState(false);

  const [isDirty, setIsDirty] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

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
    if (isDirty) {
      setShowExitConfirm(true);
    } else {
      router.push(returnHref);
    }
  }, [isDirty, returnHref, router]);

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

  const handleDialogClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const buttonText = target.innerText || "";
    if (
      buttonText.includes("Lưu") ||
      buttonText.includes("Xuất bản") ||
      buttonText.includes("Tạo tài khoản") ||
      buttonText.includes("Lưu nháp") ||
      target.closest('button[type="submit"]') ||
      target.closest('.publish-workflow-btn')
    ) {
      setIsDirty(false);
    }
  };

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
        onInput={() => setIsDirty(true)}
        onChange={() => setIsDirty(true)}
        onClick={handleDialogClick}
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

      {showExitConfirm && (
        <div className="fixed inset-0 z-[calc(var(--z-modal)+20)] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="w-[90vw] max-w-[420px] rounded-2xl border border-[var(--admin-border)] bg-white p-6 shadow-2xl text-center animate-scale-up">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-500 mb-4 border border-amber-200">
              <AlertTriangle className="size-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {locale === "vi" ? "Bạn có thay đổi chưa lưu" : "Unsaved Changes"}
            </h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              {locale === "vi"
                ? "Dữ liệu đang chỉnh sửa sẽ bị mất nếu bạn thoát ra ngoài. Bạn có chắc chắn muốn thoát?"
                : "Your unsaved changes will be lost if you exit. Are you sure you want to discard?"}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition duration-200 cursor-pointer"
              >
                {locale === "vi" ? "Tiếp tục chỉnh sửa" : "Keep Editing"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDirty(false);
                  setShowExitConfirm(false);
                  router.push(returnHref);
                }}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition duration-200 cursor-pointer shadow-sm shadow-rose-200"
              >
                {locale === "vi" ? "Thoát & Hủy thay đổi" : "Exit & Discard"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
