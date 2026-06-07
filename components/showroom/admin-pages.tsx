"use client";

import { useState, useEffect } from "react";
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
  Phone,
  Calendar,
  Activity,
  FileText,
  CheckCircle2,
  X,
  Send,
  Sparkle,
} from "lucide-react";
import {
  adminStats,
  blogPosts,
  cmsWarnings,
  imageAssets,
  products,
  quoteRequests,
  showrooms,
  type PublishStatus,
} from "@/lib/showroom-data";
import {
  PublishWorkflow,
  QuoteStatusUpdater,
  StatusPill,
  UnsavedChangesBar,
} from "./admin-interactions";
import {
  AdminRouteDialog,
  AiAssistantWorkspace,
  ContentEditorForm,
  EntityCreateForm,
  SettingsOperationsPanel,
} from "./admin-workflows";
import { RemoteImage } from "./remote-image";
import { PremiumSelect } from "./premium-select";
import { DashboardInsightChart } from "./admin-dashboard-widgets";

export const adminSections = [
  "products",
  "categories",
  "blog",
  "showrooms",
  "media",
  "quotes",
  "users",
  "settings",
  "ai-assistant",
] as const;

export type AdminSection = (typeof adminSections)[number];

export function AdminDashboard() {
  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Tổng quan vận hành"
        description="Theo dõi mức độ sẵn sàng nội dung song ngữ, yêu cầu báo giá, quản trị tệp, bản nháp AI và cấu hình hệ thống trước khi kết nối Payload."
        actionHref="/admin/products?create=1"
        actionLabel="Thêm sản phẩm"
      />

      <div className="motion-stagger grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
        {adminStats.map((stat) => (
          <div key={stat.label} className="admin-kpi-card interactive-card p-3.5">
            <div className="flex items-center justify-between gap-3">
              <p className="label-pd">{stat.label}</p>
              <MoreHorizontal className="size-4 text-outline" />
            </div>
            <div className="mt-4 flex items-end justify-between">
              <strong className="font-heading text-2xl text-primary">{stat.value}</strong>
              <span className="status-pill text-xs">{stat.delta}</span>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--admin-bg-muted)]">
              <div className="h-full w-2/3 rounded-[var(--radius-pill)] bg-[var(--admin-accent)]" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 2xl:grid-cols-[1.35fr_0.85fr]">
        <DashboardInsight />
        <div className="space-y-5">
          <WarningPanel />
          <QuickActions />
        </div>
      </div>
      <QuoteTable compact />
    </div>
  );
}

export function AdminSectionPage({
  section,
  createMode,
  uploadMode,
}: {
  section: AdminSection;
  createMode?: boolean;
  uploadMode?: boolean;
}) {
  if (section === "quotes") return <QuotesPage />;
  if (section === "ai-assistant") return <AiAssistantPage />;
  if (section === "media") return <MediaPage uploadMode={uploadMode} />;
  if (section === "settings") return <SettingsPage />;
  if (section === "users") return <UsersPage createMode={createMode} />;
  if (section === "blog") return <BlogPage createMode={createMode} />;
  if (section === "showrooms") return <ShowroomPage createMode={createMode} />;
  if (section === "categories") return <CategoryPage createMode={createMode} />;
  return <ProductsPage createMode={createMode} />;
}

export function AdminLoginPage() {
  return (
    <main className="grid min-h-screen bg-[#211816] p-4 lg:grid-cols-[1fr_520px]">
      <section className="relative hidden overflow-hidden rounded-[2rem] bg-primary text-white lg:block">
        <RemoteImage src={imageAssets.showroom} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#211816] via-[#211816]/58 to-transparent" />
        <div className="absolute bottom-0 p-12">
          <p className="label-pd text-white/65">Vận hành CMS</p>
          <h1 className="mt-4 max-w-xl font-heading text-5xl font-bold leading-tight">
            Quản lý nội dung showroom như một phòng điều phối vận hành.
          </h1>
        </div>
      </section>
      <section className="grid place-items-center rounded-[2rem] bg-[#eef6fa] p-6">
        <div className="state-card w-full max-w-md rounded-3xl border border-white/80 bg-white/88 p-8 shadow-[0_28px_80px_rgba(0,0,0,0.18)]">
          <p className="label-pd">CMS quản trị</p>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-primary">Đăng nhập</h1>
          <p className="mt-3 text-sm leading-6 text-secondary">
            Truy cập nội dung, yêu cầu báo giá, quản trị tệp, cài đặt và quy trình bản nháp AI.
          </p>
          <form className="mt-8 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-semibold">Email đăng nhập</span>
              <input className="input-pd" defaultValue="admin@phuongdong.vn" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold">Mật khẩu</span>
              <input className="input-pd" type="password" defaultValue="password" />
            </label>
            <Link className="button-pd mt-2" href="/admin">
              Mở không gian quản trị mẫu
              <ArrowRight className="size-4" />
            </Link>
          </form>
        </div>
      </section>
    </main>
  );
}

export function AccessDeniedPage() {
  return (
    <div className="state-card mx-auto max-w-2xl rounded-xl border border-error/25 bg-error-container p-8 text-on-error-container shadow-[0_18px_44px_rgba(147,0,10,0.08)]">
      <Lock className="size-10" />
      <h1 className="mt-4 font-heading text-3xl font-semibold">Không có quyền truy cập</h1>
      <p className="mt-3 text-sm leading-6">
        Biên tập viên không được truy cập yêu cầu báo giá, người dùng, cài đặt đặc quyền hoặc bí mật tích hợp theo mô hình vai trò A.
      </p>
      <Link className="button-pd mt-6" href="/admin">
        Quay lại tổng quan
      </Link>
    </div>
  );
}

function ProductsPage({ createMode }: { createMode?: boolean }) {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Quản lý sản phẩm"
        description="Vận hành danh mục ưu tiên báo giá: trường song ngữ, ánh xạ danh mục, tệp, thông số, trạng thái giá và mức độ sẵn sàng xuất bản."
        actionHref="/admin/products?create=1"
        actionLabel="Thêm sản phẩm"
      />
      <FilterCard />
      <ProductOperationsTable />
      
      <AdminRouteDialog
        open={Boolean(createMode)}
        returnHref="/admin/products"
        title="Thêm sản phẩm"
        description="Tạo sản phẩm ưu tiên báo giá với nội dung gốc tiếng Việt, bản dịch tiếng Anh tùy chọn, thư viện ảnh, thông số, giá và SEO."
        size="full"
      >
        <ContentEditorForm kind="product" mode="create" />
      </AdminRouteDialog>

      {/* Edit Dialog */}
      <AdminRouteDialog
        open={Boolean(editSlug)}
        returnHref="/admin/products"
        title="Hiệu chỉnh sản phẩm"
        description="Chỉnh sửa thông tin chi tiết sản phẩm, cấu hình song ngữ, giá và SEO."
        size="full"
      >
        <ContentEditorForm kind="product" mode="edit" />
      </AdminRouteDialog>
    </div>
  );
}

import { useSearchParams } from "next/navigation";

function BlogPage({ createMode }: { createMode?: boolean }) {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Quy trình bài viết"
        description="Vận hành biên tập bài viết song ngữ, danh mục, thẻ, ảnh bìa, tác giả, trạng thái xuất bản và SEO."
        actionHref="/admin/blog?create=1"
        actionLabel="Thêm bài viết"
      />
      
      {/* Full-width queue of posts */}
      <div className="grid gap-5">
        <BlogQueue />
      </div>

      {/* Add dialog */}
      <AdminRouteDialog
        open={Boolean(createMode)}
        returnHref="/admin/blog"
        title="Thêm bài viết"
        description="Tạo bài viết ưu tiên tiếng Việt và chỉ bật tiếng Anh khi cần lưu bản dịch."
        size="full"
      >
        <ContentEditorForm kind="blog" mode="create" />
      </AdminRouteDialog>

      {/* Edit dialog */}
      <AdminRouteDialog
        open={Boolean(editSlug)}
        returnHref="/admin/blog"
        title="Hiệu chỉnh bài viết"
        description="Chỉnh sửa nội dung chi tiết bài viết, cấu hình song ngữ, SEO và trạng thái xuất bản."
        size="full"
      >
        <ContentEditorForm kind="blog" mode="edit" />
      </AdminRouteDialog>
    </div>
  );
}

function CategoryPage({ createMode }: { createMode?: boolean }) {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Quản trị danh mục"
        description="Hai nhóm sản phẩm chính được giữ cố định theo nghiệp vụ. Biên tập viên quản lý danh mục con, tên song ngữ, đường dẫn, thứ tự và SEO."
        actionHref="/admin/categories?create=1"
        actionLabel="Thêm danh mục"
      />
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            slug: "wood",
            name: { vi: "Nội thất gỗ & Sofa", en: "Wood furniture & Sofa" },
            description: {
              vi: "Nhóm sản phẩm đồ gỗ nội thất, bàn ghế, sofa cho không gian phòng khách, phòng ngủ.",
              en: "Fixed top-level group for FR-01 and catalog filtering.",
            },
            status: "published",
          },
          {
            slug: "sanitary",
            name: { vi: "Thiết bị vệ sinh", en: "Sanitary ware" },
            description: {
              vi: "Thiết bị phòng tắm cao cấp, sen tắm, lavabo, bồn tắm nhập khẩu.",
              en: "Fixed top-level group for FR-01 and showroom sales paths.",
            },
            status: "published",
          },
          {
            slug: "tiles",
            name: { vi: "Gạch ốp lát & Bề mặt", en: "Tiles & Finishing surfaces" },
            description: {
              vi: "Gạch ceramic, gạch porcelain khổ lớn, đá cẩm thạch cho hoàn thiện bề mặt.",
              en: "Editable supporting group for finishing-material browsing.",
            },
            status: "draft",
          },
        ].map(({ slug, name, description, status }, index) => (
          <div key={slug} className="card-pd interactive-card p-4 flex flex-col justify-between">
            <div>
              <p className="label-pd">Nhóm {index + 1}</p>
              <div className="space-y-2.5 mt-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 mr-1.5">Tiếng Việt:</span>
                  <span className="font-heading font-semibold text-primary">{name.vi}</span>
                  <p className="mt-1 text-xs text-secondary leading-relaxed">{description.vi}</p>
                </div>
                <div className="border-t border-slate-100/50 pt-2 mt-2">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 mr-1.5">Tiếng Anh:</span>
                  <span className="font-heading font-semibold text-indigo-900">{name.en}</span>
                  <p className="mt-1 text-xs text-indigo-700/80 leading-relaxed">{description.en}</p>
                </div>
              </div>
              <div className="mt-4">
                <StatusPill status={status as PublishStatus} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <Link href={`/admin/categories?edit=${slug}`} className="admin-edit-action">
                <Pencil className="size-3" />
                Chỉnh sửa
              </Link>
            </div>
          </div>
        ))}
      </div>
      <PublishWorkflow />
      
      {/* Create Dialog */}
      <AdminRouteDialog
        open={Boolean(createMode)}
        returnHref="/admin/categories"
        title="Thêm danh mục"
        description="Tạo danh mục con song ngữ trong một nhóm sản phẩm đã được phê duyệt."
        size="full"
      >
        <EntityCreateForm kind="category" />
      </AdminRouteDialog>

      {/* Edit Dialog */}
      <AdminRouteDialog
        open={Boolean(editSlug)}
        returnHref="/admin/categories"
        title="Hiệu chỉnh danh mục"
        description="Chỉnh sửa thông tin chi tiết danh mục, cấu hình song ngữ, mô tả và SEO."
        size="full"
      >
        <EntityCreateForm kind="category" />
      </AdminRouteDialog>
    </div>
  );
}

function ShowroomPage({ createMode }: { createMode?: boolean }) {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý showroom"
        description="Quản lý tên và địa chỉ song ngữ của showroom, hotline, giờ mở cửa, nhúng bản đồ, đường dẫn dự phòng, tệp và trạng thái xuất bản."
        actionHref="/admin/showrooms?create=1"
        actionLabel="Thêm showroom"
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {showrooms.map((showroom) => (
          <article key={showroom.code} className="card-pd interactive-card group overflow-hidden flex flex-col justify-between">
            <div>
              <RemoteImage src={showroom.image} alt={showroom.name.vi} className="image-lift h-44 w-full object-cover" />
              <div className="p-4 space-y-3.5">
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 mr-1.5">Tiếng Việt:</span>
                    <span className="font-heading font-semibold text-primary">{showroom.name.vi}</span>
                    <p className="text-xs text-secondary pl-5 mt-0.5">{showroom.address.vi}</p>
                  </div>
                  <div className="border-t border-slate-100/50 pt-2 mt-2">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 mr-1.5">Tiếng Anh:</span>
                    <span className="font-heading font-semibold text-indigo-900">{showroom.name.en}</span>
                    <p className="text-xs text-indigo-700/80 pl-5 mt-0.5">{showroom.address.en}</p>
                  </div>
                </div>
                
                <div className="text-xs space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p><span className="font-bold text-slate-500">Giờ mở cửa (Tiếng Việt):</span> {showroom.hours.vi}</p>
                  <p><span className="font-bold text-indigo-500">Giờ mở cửa (Tiếng Anh):</span> {showroom.hours.en}</p>
                  <p className="mt-1"><span className="font-bold text-slate-500">Đường dây nóng:</span> {showroom.hotline}</p>
                </div>
                <StatusPill status="published" />
              </div>
            </div>
            <div className="p-4 pt-0 flex justify-end">
              <Link href={`/admin/showrooms?edit=${showroom.code}`} className="admin-edit-action">
                <Pencil className="size-3" />
                Chỉnh sửa
              </Link>
            </div>
          </article>
        ))}
      </div>
      <PublishWorkflow />
      
      {/* Create Dialog */}
      <AdminRouteDialog
        open={Boolean(createMode)}
        returnHref="/admin/showrooms"
        title="Thêm showroom"
        description="Tạo hồ sơ showroom với địa chỉ song ngữ, hotline và đường dẫn Google Maps."
        size="full"
      >
        <EntityCreateForm kind="showroom" />
      </AdminRouteDialog>

      {/* Edit Dialog */}
      <AdminRouteDialog
        open={Boolean(editSlug)}
        returnHref="/admin/showrooms"
        title="Hiệu chỉnh showroom"
        description="Chỉnh sửa thông tin địa chỉ song ngữ, hotline, bản đồ và giờ mở cửa."
        size="full"
      >
        <EntityCreateForm kind="showroom" />
      </AdminRouteDialog>
    </div>
  );
}

interface QuoteRequest {
  id: string;
  customer: string;
  phone: string;
  email?: string;
  product: string;
  date: string;
  status: "new" | "contacted" | "qualified" | "closed" | "spam" | "archived" | string;
  showroom?: string;
  assignedTo?: string;
  notes?: { date: string; author: string; content: string }[];
  source?: string;
}

const initialQuotes: QuoteRequest[] = [
  {
    id: "QR-2406-001",
    customer: "Lê Minh Tuấn",
    phone: "0812 357 587",
    email: "tuan.le@gmail.com",
    product: "Sofa Curve Velour",
    date: "2026-06-01",
    status: "new",
    showroom: "Quận 7 Showroom",
    assignedTo: "Chưa phân công",
    notes: [
      { date: "2026-06-01 10:30", author: "Hệ thống", content: "Yêu cầu báo giá nhận từ trang chi tiết sản phẩm." }
    ],
    source: "/products/sofa-curve-velour"
  },
  {
    id: "QR-2406-002",
    customer: "Nguyễn Thu Hà",
    phone: "0901 223 456",
    email: "ha.nguyen@gmail.com",
    product: "Bàn Trà Marble Round",
    date: "2026-05-31",
    status: "contacted",
    showroom: "Quận 7 Showroom",
    assignedTo: "Minh Quân",
    notes: [
      { date: "2026-05-31 15:45", author: "Hệ thống", content: "Yêu cầu báo giá từ form liên hệ nhanh." },
      { date: "2026-06-01 09:00", author: "Minh Quân", content: "Đã liên hệ qua điện thoại, khách hàng hẹn cuối tuần ghé showroom Quận 7." }
    ],
    source: "/products/ban-tra-marble-round"
  },
  {
    id: "QR-2406-003",
    customer: "Trần Đại Quang",
    phone: "0988 776 655",
    email: "", // Test warning
    product: "Thiết bị vệ sinh trọn bộ",
    date: "2026-05-30",
    status: "qualified",
    showroom: "Hà Nội Flagship Store",
    assignedTo: "Hồng Hạnh",
    notes: [
      { date: "2026-05-30 11:20", author: "Hệ thống", content: "Khách hàng muốn nhận bảng giá thiết bị vệ sinh Bravat và Kohler." }
    ],
    source: "/contact"
  }
];

const quoteStatusLabels: Record<string, string> = {
  new: "Chưa xử lý",
  contacted: "Đang tư vấn",
  qualified: "Đủ điều kiện",
  closed: "Hoàn thành",
  spam: "Thư rác",
  archived: "Lưu trữ",
};

function getQuoteStatusLabel(status: string) {
  return quoteStatusLabels[status] ?? status;
}

function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>(initialQuotes);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>("QR-2406-001");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newNote, setNewNote] = useState("");
  const [showEmailDraft, setShowEmailDraft] = useState(false);
  const [tempEmail, setTempEmail] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const selectedQuote = quotes.find(q => q.id === selectedQuoteId);

  // Filters quotes
  const filteredQuotes = quotes.filter(q => {
    const matchesStatus = filterStatus === "all" || q.status === filterStatus;
    const matchesQuery = searchQuery.trim() === "" || 
      q.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.phone.includes(searchQuery) ||
      q.product.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    setQuotes(prev => prev.map(q => {
      if (q.id === id) {
        const timestamp = new Date().toISOString().slice(0, 16).replace("T", " ");
        const note = {
          date: timestamp,
          author: "Hồ sơ quản trị",
          content: `Trạng thái thay đổi từ "${getQuoteStatusLabel(q.status)}" sang "${getQuoteStatusLabel(newStatus)}".`
        };
        return { 
          ...q, 
          status: newStatus,
          notes: [...(q.notes || []), note]
        };
      }
      return q;
    }));
  };

  const handleOwnerChange = (id: string, owner: string) => {
    setQuotes(prev => prev.map(q => {
      if (q.id === id) {
        const timestamp = new Date().toISOString().slice(0, 16).replace("T", " ");
        const note = {
          date: timestamp,
          author: "Hồ sơ quản trị",
          content: `Đã phân công xử lý cho: ${owner}.`
        };
        return { 
          ...q, 
          assignedTo: owner,
          notes: [...(q.notes || []), note]
        };
      }
      return q;
    }));
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedQuoteId) return;
    setQuotes(prev => prev.map(q => {
      if (q.id === selectedQuoteId) {
        const timestamp = new Date().toISOString().slice(0, 16).replace("T", " ");
        const note = {
          date: timestamp,
          author: "Hồ sơ quản trị",
          content: newNote.trim()
        };
        return {
          ...q,
          notes: [...(q.notes || []), note]
        };
      }
      return q;
    }));
    setNewNote("");
  };

  const handleSaveEmail = () => {
    setQuotes(prev => prev.map(q => {
      if (q.id === selectedQuoteId) {
        return { ...q, email: tempEmail };
      }
      return q;
    }));
    setIsEditingEmail(false);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý yêu cầu báo giá"
        description="Kiểm duyệt khách hàng tiềm năng dành cho quản trị viên. Biên tập viên phải bị chặn bằng phân quyền Payload, không chỉ ẩn điều hướng."
      />

      {/* --- WORKFLOW STATUS FILTER TABS --- */}
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {[
          { id: "all", label: "Tất cả" },
          { id: "new", label: "Chưa xử lý" },
          { id: "contacted", label: "Đang tư vấn" },
          { id: "qualified", label: "Đủ điều kiện" },
          { id: "closed", label: "Hoàn thành" },
          { id: "spam", label: "Thư rác" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
              filterStatus === tab.id
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
            onClick={() => setFilterStatus(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        
        {/* --- LEFT SIDE: QUOTES LIST --- */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
            <input 
              className="input-pd pl-9 bg-white" 
              placeholder="Tìm theo tên khách, số điện thoại, hoặc sản phẩm..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="surface-soft overflow-hidden rounded-xl border bg-white">
            <div className="grid grid-cols-[1fr_1.2fr_100px_110px] bg-slate-50 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <span>Khách hàng</span>
              <span>Sản phẩm quan tâm</span>
              <span>Ngày yêu cầu</span>
              <span>Trạng thái</span>
            </div>
            {filteredQuotes.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-400">Không tìm thấy yêu cầu báo giá nào khớp điều kiện.</p>
            ) : (
              filteredQuotes.map((quote) => (
                <button
                  key={quote.id}
                  type="button"
                  className={`w-full text-left grid grid-cols-[1fr_1.2fr_100px_110px] items-center border-t border-slate-100 px-4 py-3.5 transition-colors hover:bg-slate-50/50 ${
                    selectedQuoteId === quote.id ? "bg-indigo-50/30" : ""
                  }`}
                  onClick={() => {
                    setSelectedQuoteId(quote.id);
                    setTempEmail(quote.email || "");
                    setIsEditingEmail(false);
                  }}
                >
                  <div>
                    <p className="font-semibold text-slate-800">{quote.customer}</p>
                    <p className="text-xs text-slate-500 font-mono">{quote.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{quote.product}</p>
                    <p className="text-[10px] text-slate-400 truncate">{quote.source}</p>
                  </div>
                  <span className="text-xs text-slate-500">{quote.date}</span>
                  <QuoteStatusPill status={quote.status} />
                </button>
              ))
            )}
          </div>
        </div>

        {/* --- RIGHT SIDE: DETAILED VIEW PANEL --- */}
        <div className="space-y-4">
          {selectedQuote ? (
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col min-h-[480px]">
              {/* Detail Header */}
              <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block">{selectedQuote.id}</span>
                  <h4 className="font-heading font-bold text-sm">Chi tiết yêu cầu báo giá</h4>
                </div>
                <QuoteStatusPill status={selectedQuote.status} />
              </div>

              {/* Detail Body */}
              <div className="p-4 flex-1 space-y-4 text-xs">
                
                {/* Warnings for missing info */}
                {!selectedQuote.email && (
                  <div className="rounded-lg bg-orange-50 border border-orange-200 p-3 text-orange-700 flex items-start gap-2">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Thiếu địa chỉ email khách hàng</strong>
                      <span className="text-[11px] block mt-0.5">Chúng tôi khuyên bổ sung email của khách để gửi báo giá chính xác.</span>
                    </div>
                  </div>
                )}

                {/* Lead Contacts */}
                <div className="bg-slate-50 p-3 rounded-lg border space-y-2">
                  <h5 className="font-bold text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <User className="size-3.5 text-slate-400" />
                    Thông tin liên hệ
                  </h5>
                  <div className="grid gap-2 pl-5">
                    <div>
                      <span className="text-slate-400 block">Khách hàng</span>
                      <strong className="text-sm text-slate-800">{selectedQuote.customer}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Số điện thoại</span>
                      <strong className="text-slate-700">{selectedQuote.phone}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Email</span>
                      {isEditingEmail ? (
                        <div className="flex gap-2 mt-1">
                          <input 
                            className="input-pd text-xs py-0.5 bg-white" 
                            value={tempEmail}
                            onChange={(e) => setTempEmail(e.target.value)} 
                          />
                          <button type="button" className="button-pd py-1 text-[10px] text-white" onClick={handleSaveEmail}>Lưu</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-700 font-semibold">{selectedQuote.email || "Chưa thiết lập"}</span>
                          <button 
                            type="button" 
                            className="text-[10px] text-indigo-600 font-semibold hover:underline"
                            onClick={() => { setTempEmail(selectedQuote.email || ""); setIsEditingEmail(true); }}
                          >
                            Hiệu chỉnh
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-400 block">Showroom đăng ký</span>
                      <strong className="text-slate-700">{selectedQuote.showroom || "Quận 7 Showroom"}</strong>
                    </div>
                  </div>
                </div>

                {/* Product context & Referral */}
                <div className="bg-slate-50 p-3 rounded-lg border space-y-2">
                  <h5 className="font-bold text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FileText className="size-3.5 text-slate-400" />
                    Nội dung yêu cầu
                  </h5>
                  <div className="grid gap-2 pl-5">
                    <div>
                      <span className="text-slate-400 block">Sản phẩm quan tâm</span>
                      <strong className="text-slate-800">{selectedQuote.product}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Đường dẫn nguồn yêu cầu</span>
                      <span className="text-slate-500 font-mono break-all">{selectedQuote.source}</span>
                    </div>
                  </div>
                </div>

                {/* Owner and Status selectors */}
                <div className="grid grid-cols-2 gap-3">
                  <label className="grid gap-1">
                    <span className="text-slate-500 block font-semibold">Nhân viên phụ trách</span>
                    <select
                      className="input-pd bg-white py-1.5"
                      value={selectedQuote.assignedTo}
                      onChange={(e) => handleOwnerChange(selectedQuote.id, e.target.value)}
                    >
                      <option value="Chưa phân công">Chưa phân công</option>
                      <option value="Minh Quân">Minh Quân</option>
                      <option value="Hồng Hạnh">Hồng Hạnh</option>
                      <option value="Quốc Anh">Quốc Anh</option>
                    </select>
                  </label>
                  <label className="grid gap-1">
                    <span className="text-slate-500 block font-semibold">Trạng thái hiện thời</span>
                    <select
                      className="input-pd bg-white py-1.5"
                      value={selectedQuote.status}
                      onChange={(e) => handleStatusChange(selectedQuote.id, e.target.value)}
                    >
                      <option value="new">Chưa xử lý</option>
                      <option value="contacted">Đang tư vấn</option>
                      <option value="qualified">Đủ điều kiện</option>
                      <option value="closed">Hoàn thành</option>
                      <option value="spam">Thư rác</option>
                      <option value="archived">Lưu trữ</option>
                    </select>
                  </label>
                </div>

                {/* Operations Checklist / Timeline Notes */}
                <div className="border-t pt-3 space-y-2">
                  <h5 className="font-bold text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Activity className="size-3.5 text-slate-400" />
                    Lịch sử xử lý & Ghi chú nội bộ
                  </h5>
                  <div className="space-y-2 max-h-32 overflow-y-auto pl-1 pr-1 bg-slate-55 rounded border p-2">
                    {selectedQuote.notes && selectedQuote.notes.map((note, index) => (
                      <div key={index} className="bg-slate-50 p-2 rounded border border-slate-100 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-700">{note.author}</span>
                          <span className="text-[9px] text-slate-400">{note.date}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{note.content}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <textarea 
                      className="input-pd flex-1 min-h-10 text-xs py-1 px-2 bg-white" 
                      placeholder="Viết ghi chú xử lý mới..." 
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                    <button 
                      type="button" 
                      className="button-pd px-3 flex items-center justify-center shrink-0 self-end py-1.5 text-xs text-white"
                      onClick={handleAddNote}
                    >
                      <Send className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick actions bar */}
                <div className="border-t pt-3 flex flex-wrap gap-2 justify-end">
                  <button 
                    type="button" 
                    className="button-pd-outline py-1 px-2.5 text-xs flex items-center gap-1 bg-indigo-50 border-indigo-200 text-indigo-700 hover:text-indigo-900"
                    onClick={() => setShowEmailDraft(true)}
                  >
                    <Mail className="size-3.5" />
                    Gửi email tư vấn
                  </button>
                  <button 
                    type="button" 
                    className="button-pd-outline py-1 px-2.5 text-xs border-red-200 text-red-700 hover:bg-red-50 hover:text-red-900"
                    onClick={() => handleStatusChange(selectedQuote.id, "spam")}
                  >
                    Đánh dấu thư rác
                  </button>
                  <button 
                    type="button" 
                    className="button-pd py-1 px-3 text-xs"
                    onClick={() => handleStatusChange(selectedQuote.id, "closed")}
                  >
                    Hoàn thành
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed bg-slate-50 min-h-[480px] flex flex-col justify-center items-center p-8 text-center text-slate-400">
              <FileText className="size-10 mb-3" />
              <p className="font-semibold text-sm">Vui lòng chọn một yêu cầu báo giá từ danh sách bên trái để kiểm duyệt.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- EMAIL DRAFT DIALOG --- */}
      {showEmailDraft && selectedQuote && (
        <div className="fixed inset-0 z-[calc(var(--z-modal)+1)] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-5 max-w-lg w-full border shadow-xl flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-heading font-bold text-slate-800 flex items-center gap-2">
                <Sparkle className="size-4 text-indigo-600" />
                Mẫu Email báo giá gợi ý
              </h4>
              <button type="button" className="text-slate-400 hover:text-slate-600" onClick={() => setShowEmailDraft(false)}>
                <X className="size-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-bold block">Gửi tới:</span>
                <span className="text-slate-800 font-semibold">{selectedQuote.email || "Khách hàng (chưa có email)"}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Tiêu đề:</span>
                <span className="text-slate-800 font-semibold">Phương Đông Showroom - Phản hồi yêu cầu tư vấn báo giá sản phẩm {selectedQuote.product}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded border font-serif text-slate-700 leading-relaxed select-all whitespace-pre-line">
                {`Chào anh/chị ${selectedQuote.customer},

Cảm ơn anh/chị đã gửi yêu cầu báo giá cho sản phẩm ${selectedQuote.product} tại Showroom Phương Đông.

Chúng tôi đã nhận được thông tin liên hệ và nguyện vọng tư vấn của anh/chị vào ngày ${selectedQuote.date} qua cổng showroom trực tuyến.

Hiện tại, chuyên viên tư vấn Minh Quân đã được phân công hỗ trợ đơn hàng của anh/chị. Chuyên viên của chúng tôi sẽ chuẩn bị bảng báo giá chi tiết bao gồm vật liệu, hoàn thiện và các chương trình khuyến mãi hiện hành tại showroom Quận Kiệt/Quận 7, sau đó chủ động liên hệ trực tiếp cho anh/chị trong thời gian sớm nhất.

Nếu anh/chị cần thay đổi thông tin hoặc bổ sung bản vẽ thiết kế, xin vui lòng phản hồi lại email này.

Chúc anh/chị một ngày tốt lành!
Đội ngũ CSKH Phương Đông.`}
              </div>
            </div>
            
            <div className="border-t pt-3 flex justify-end gap-2">
              <span className="text-[10px] text-slate-400 mr-auto self-center">
                * Click vào khối thư để chọn tất cả và sao chép.
              </span>
              <button 
                type="button" 
                className="button-pd py-1 px-4 text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(`Chào anh/chị ${selectedQuote.customer},...`);
                  alert("Đã sao chép vào bộ nhớ tạm!");
                  setShowEmailDraft(false);
                }}
              >
                Sao chép & Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MediaPage({ uploadMode }: { uploadMode?: boolean }) {
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

function SettingsPage() {
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

function UsersPage({ createMode }: { createMode?: boolean }) {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý người dùng và vai trò"
        description="Tạo tài khoản chỉ dành cho quản trị viên. Biên tập viên chỉ quản lý nội dung có thể xuất bản theo mô hình vai trò A."
        actionHref="/admin/users?create=1"
        actionLabel="Thêm người dùng"
      />
      <div className="surface-soft overflow-hidden">
        {[
          ["admin@phuongdong.vn", "Quản trị viên", "Người dùng, cài đặt, báo giá, tích hợp và toàn bộ nội dung"],
          ["editor@phuongdong.vn", "Biên tập viên", "Sản phẩm, bài viết, trang chủ, giới thiệu, showroom và tệp có thể xuất bản"],
        ].map(([email, role, scope], index) => (
          <div key={email} className="flex flex-col justify-between gap-3 border-t border-outline-variant/25 p-4 transition-colors first:border-t-0 hover:bg-surface-container-lowest/70 md:flex-row md:items-center">
            <div>
              <h2 className="font-semibold">{email}</h2>
              <p className="text-sm text-secondary">{role} - {scope}</p>
            </div>
            <StatusPill status={index === 0 ? "published" : "draft"} />
          </div>
        ))}
      </div>
      <AdminRouteDialog
        open={Boolean(createMode)}
        returnHref="/admin/users"
        title="Thêm người dùng CMS"
        description="Gán vai trò quản trị viên hoặc biên tập viên mà không để lộ cài đặt đặc quyền cho tài khoản biên tập viên."
        size="wide"
      >
        <EntityCreateForm kind="user" />
      </AdminRouteDialog>
    </div>
  );
}

function AiAssistantPage() {
  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Trợ lý AI"
        description="Hỗ trợ bản nháp cho dịch nội dung, SEO và dàn ý trong CMS. Con người vẫn phải kiểm duyệt trước khi dùng."
      />
      <AiAssistantWorkspace />
    </div>
  );
}

function DashboardInsight() {
  return (
    <section className="admin-panel p-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <p className="label-pd inline-flex items-center gap-2">
            <BarChart3 className="size-4" />
            Hiệu quả nội dung
          </p>
          <h2 className="mt-3 font-heading text-xl font-semibold leading-snug text-primary md:text-2xl">
            Nhu cầu báo giá tuần này tập trung ở các sản phẩm nổi bật
          </h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-secondary">
            Dùng khu vực này để rà soát mức độ sẵn sàng xuất bản, thiếu sót bản dịch và chất lượng SEO trước khi kết nối phân tích Payload.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="chip-pd text-primary">+14%</span>
          <span className="chip-pd text-secondary">7 ngày</span>
        </div>
      </div>
      <DashboardInsightChart />
    </section>
  );
}

function ProductOperationsTable() {
  return (
    <div className="surface-soft overflow-hidden">
      <div className="grid grid-cols-[1fr_160px_120px_120px_100px] bg-surface-container/80 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-primary max-lg:hidden">
        <span>Sản phẩm</span>
        <span>Danh mục</span>
        <span>Trạng thái</span>
        <span>Sẵn sàng</span>
        <span className="text-right">Thao tác</span>
      </div>
      {products.slice(0, 5).map((product, index) => (
        <div
          key={product.slug}
          className="grid gap-4 border-t border-outline-variant/25 px-5 py-4 transition-colors hover:bg-surface-container-lowest/70 lg:grid-cols-[1fr_160px_120px_120px_100px] lg:items-center"
        >
          <div className="flex gap-4">
            <RemoteImage className="size-16 rounded object-cover" src={product.image} alt={product.name.vi} sizes="64px" />
            <div>
              <h3 className="font-heading text-lg font-semibold">{product.name.vi}</h3>
              <p className="text-sm italic text-secondary">{product.name.en}</p>
              <p className="mt-1 text-xs text-outline">{product.referenceCode}</p>
            </div>
          </div>
          <span>{product.category.vi}</span>
          <StatusPill status={product.status} />
          <span className={`status-pill w-fit text-[11px] ${index < 2 ? "status-success" : "status-warning"}`}>
            {index < 2 ? "Sẵn sàng" : "Thiếu tiếng Anh/SEO"}
          </span>
          <div className="lg:text-right">
            <Link href={`/admin/products?edit=${product.slug}`} className="admin-edit-action">
              <Pencil className="size-3" />
              Chỉnh sửa
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function BlogQueue() {
  return (
    <section className="surface-soft p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start border-b pb-3 mb-4">
        <div>
          <p className="label-pd">Hàng đợi biên tập</p>
          <h2 className="admin-section-title-pd mt-2 text-lg">Bài viết cần kiểm duyệt</h2>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post, index) => (
          <article key={post.slug} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex justify-between items-start gap-2 mb-3">
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">{post.category.vi}</span>
                <StatusPill status={index === 0 ? "draft" : "published"} />
              </div>
              <div className="flex gap-4">
                <RemoteImage src={post.image} alt={post.title.vi} className="size-16 rounded-lg object-cover shrink-0" sizes="64px" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-800 text-sm line-clamp-2">{post.title.vi}</h3>
                  <p className="text-[11px] text-slate-400 mt-1">{post.date} • {post.readTime.vi}</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-500 line-clamp-2">{post.excerpt.vi}</p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Link 
                href={`/admin/blog?edit=${post.slug}`} 
                className="admin-edit-action"
              >
                <Pencil className="size-3" />
                Chỉnh sửa
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AdminPageHeader({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div>
        <span className="admin-chip-pd">
          <Sparkles className="size-3.5" />
          Không gian quản trị
        </span>
        <h1 className="admin-title-pd mt-3 md:text-2xl">{title}</h1>
        <p className="type-caption mt-2 max-w-3xl text-[13px] text-[var(--admin-text-muted)]">{description}</p>
      </div>
      {actionHref && actionLabel ? (
        <Link className="button-pd shrink-0" href={actionHref}>
          {actionLabel.toLowerCase().startsWith("back") ? <ArrowLeft className="size-4" /> : <Plus className="size-4" />}
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

function FilterCard() {
  return (
    <form method="get" className="surface-panel grid gap-4 p-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
      <label className="grid gap-2">
        <span className="label-pd">Danh mục</span>
        <PremiumSelect
          name="category"
          defaultValue="all"
          ariaLabel="Danh mục"
          placeholder="Danh mục"
          tone="admin"
          options={[
            { value: "all", label: "Tất cả danh mục" },
            { value: "wood", label: "Nội thất gỗ" },
            { value: "sanitary", label: "Thiết bị vệ sinh" },
          ]}
        />
      </label>
      <label className="grid gap-2">
        <span className="label-pd">Trạng thái</span>
        <PremiumSelect
          name="status"
          defaultValue="all"
          ariaLabel="Trạng thái"
          placeholder="Trạng thái"
          tone="admin"
          options={[
            { value: "all", label: "Tất cả trạng thái" },
            { value: "draft", label: "Bản nháp" },
            { value: "published", label: "Đã xuất bản" },
            { value: "archived", label: "Đã lưu trữ" },
          ]}
        />
      </label>
      <label className="grid gap-2">
        <span className="label-pd">Tìm kiếm</span>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
          <input className="input-pd pl-9" name="q" placeholder="Tên, mã, đường dẫn..." />
        </div>
      </label>
      <button className="button-pd self-end" type="submit">
        Áp dụng bộ lọc
      </button>
    </form>
  );
}

function QuoteTable({ compact }: { compact?: boolean }) {
  return (
    <div className="surface-soft overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <h2 className="admin-section-title-pd">Yêu cầu báo giá mới nhất</h2>
        {compact ? <Link className="font-bold text-primary" href="/admin/quotes">Xem tất cả</Link> : null}
      </div>
      {quoteRequests.map((quote) => (
        <div key={quote.id} className="grid gap-3 border-t border-outline-variant/25 px-4 py-3.5 transition-colors hover:bg-surface-container-lowest/70 md:grid-cols-[1fr_1fr_120px_120px]">
          <div>
            <p className="font-semibold">{quote.customer}</p>
            <p className="text-sm text-secondary">{quote.phone}</p>
          </div>
          <p>{quote.product}</p>
          <p className="text-sm text-secondary">{quote.date}</p>
          <QuoteStatusPill status={quote.status} />
        </div>
      ))}
    </div>
  );
}

function QuoteStatusPill({ status }: { status: string }) {
  const className =
    status === "new"
      ? "status-warning"
      : status === "contacted"
        ? "status-muted"
        : "status-success";

  return (
    <span className={`status-pill w-fit text-[11px] leading-none ${className}`}>
      {getQuoteStatusLabel(status)}
    </span>
  );
}

function WarningPanel() {
  return (
    <div className="status-warning rounded-[var(--radius-panel)] border p-4 shadow-[0_10px_26px_rgba(120,83,15,0.05)]">
      <div className="flex items-center gap-2">
        <FileWarning className="size-5" />
        <h2 className="font-heading text-base font-semibold">Trạng thái CMS cần xử lý</h2>
      </div>
      <ul className="mt-4 space-y-3 text-sm">
        {cmsWarnings.map((warning) => (
          <li key={warning} className="flex gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            {warning}
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuickActions() {
  const actions = [
    ["Quản lý danh mục", "/admin/categories"],
    ["Rà soát bài viết song ngữ", "/admin/blog"],
    ["Cập nhật báo giá", "/admin/quotes"],
    ["Cấu hình SEO mặc định", "/admin/settings"],
  ] as const;

  return (
    <div className="rounded-2xl border border-[#202448] bg-[linear-gradient(145deg,#0f122c,#15183a)] p-4 text-white shadow-[0_16px_40px_rgba(9,10,35,0.16)]">
      <h2 className="font-heading text-lg font-semibold">Thao tác nhanh</h2>
      <div className="mt-4 grid gap-2.5">
        {actions.map(([label, href]) => (
          <Link key={label} href={href} className="flex min-h-10 items-center justify-between rounded-xl bg-white/10 px-3 py-2.5 text-sm font-bold transition hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30">
            {label}
            <ArrowRight className="size-4" />
          </Link>
        ))}
      </div>
    </div>
  );
}
