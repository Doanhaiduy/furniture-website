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

