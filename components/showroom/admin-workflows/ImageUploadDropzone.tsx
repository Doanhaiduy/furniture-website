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


export function ImageUploadDropzone({
  value,
  onChange,
  label = "Tải ảnh lên (Upload Image)",
}: {
  value?: string;
  onChange: (url: string, mediaId?: string) => void;
  label?: string;
}) {
  return (
    <MediaPicker
      value={value}
      onChange={(url, id) => onChange(url, id)}
      label={label}
    />
  );
}

