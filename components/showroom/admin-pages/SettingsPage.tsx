"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ExcelImportExportModal } from "../admin-excel";
import { useToast } from "@/components/providers/toast-provider";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  FileWarning,
  Lock,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Sparkles,
  User,
  Mail,
  Activity,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Package,
  Tag,
  Globe,
  NewspaperIcon,
  MapPin,
  Star,
  Eye,
  Trash2,
  ExternalLink,
  Check,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import {
  type PublishStatus,
} from "@/lib/showroom-data";
import { imageAssets } from "@/tests/fixtures/showroom-data-fixture";
import {
  type AdminQuote,
  type AdminProduct,
  type AdminCategory,
  type AdminBlogPost,
  type AdminShowroom,
  type AdminPromotion,
  type AdminUser,
  deleteAdminPromotion,
  getBrandProductCount,
  updatePromotionStatus,
} from "@/lib/supabase/admin-queries";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  deleteAdminProduct,
  deleteAdminCategory,
  deleteAdminBlogPost,
  deleteAdminShowroom,
  updateProductFeatured,
  updateProductStatus,
  updateBlogPostFeatured,
  updateBlogPostStatus,
  updateQuoteAssignee,
  updateQuoteSalesNotes,
  updateQuoteAdminNotes,
} from "@/lib/supabase/mutations";
import { deleteAdminBrand } from "@/lib/supabase/brands-mutations";
import {
  PublishWorkflow,
  StatusPill,
} from "../admin-interactions";
import {
  AdminRouteDialog,
  ContentEditorForm,
  EntityCreateForm,
  SettingsOperationsPanel,
} from "../admin-workflows";
import { RemoteImage } from "../remote-image";
import { PremiumSelect } from "../premium-select";
import { DashboardInsightChart } from "../admin-dashboard-widgets";
import { QuoteTimeline } from "../../admin/QuoteTimeline";
import { DataTable } from "@/components/admin/DataTable";
import { DataView, PaginationBar } from "@/components/admin/DataView";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { FilterBar, type FilterConfig } from "@/components/admin/FilterBar";
import { useAdminFilters } from "@/lib/hooks/useAdminFilters";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export interface Brand {
  id: string;
  name: { vi: string; en: string };
  origin?: string;
  logo_url?: string;
  status: "draft" | "published" | "archived";
  sort_order: number;
  slug?: string;
}

import { useSearchParams, useRouter } from "next/navigation";
import {
  Pagination,
  AdminPageHeader,
  getRelativeTimeString
} from "./SharedComponents";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Cài đặt doanh nghiệp"
        description="Cấu hình vận hành cho nhận diện thương hiệu, liên hệ, liên kết mạng xã hội, mặc định SEO, tích hợp và trạng thái bảo mật bí mật."
      />
      <SettingsOperationsPanel />
    </div>
  );
}
