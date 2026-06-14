"use client";

import { useState } from "react";
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
  Sparkle,
} from "lucide-react";
import {
  imageAssets,
  type PublishStatus,
} from "@/lib/showroom-data";
import {
  type AdminQuote,
  type AdminProduct,
  type AdminCategory,
  type AdminBlogPost,
  type AdminShowroom,
  type AdminPromotion,
  type AdminUser,
  deleteAdminPromotion,
} from "@/lib/supabase/admin-queries";
import {
  PublishWorkflow,
  StatusPill,
} from "./admin-interactions";
import {
  AdminRouteDialog,
  ContentEditorForm,
  EntityCreateForm,
  SettingsOperationsPanel,
} from "./admin-workflows";
import { RemoteImage } from "./remote-image";
import { PremiumSelect } from "./premium-select";
import { DashboardInsightChart } from "./admin-dashboard-widgets";
import { DataTable } from "@/components/admin/DataTable";
import { BrandsAdmin, type Brand } from "@/components/admin/brands-admin";
export { AdminLoginPage, AccessDeniedPage } from "./admin-login";

export const adminSections = [
  "products",
  "categories",
  "brands",
  "promotions",
  "blog",
  "showrooms",
  "media",
  "quotes",
  "users",
  "settings",
] as const;

export type AdminSection = (typeof adminSections)[number];

export function AdminDashboard({
  stats,
  role,
  quotes = [],
}: {
  stats: {
    productCount: number;
    categoryCount: number;
    blogCount: number;
    showroomCount: number;
    quoteCount: number;
    userCount: number;
  };
  role?: string;
  quotes?: AdminQuote[];
}) {
  const isAdmin = role === "admin";
  const kpis = [
    { label: "Sản phẩm", value: stats.productCount, delta: "Tổng danh mục", visible: true },
    { label: "Danh mục", value: stats.categoryCount, delta: "Nhóm sản phẩm", visible: true },
    { label: "Bài viết", value: stats.blogCount, delta: "Đã xuất bản", visible: true },
    { label: "Showroom", value: stats.showroomCount, delta: "Đang hoạt động", visible: true },
    { label: "Yêu cầu báo giá", value: stats.quoteCount, delta: "Chờ xử lý", visible: isAdmin },
    { label: "Người dùng", value: stats.userCount, delta: "Tài khoản", visible: isAdmin },
  ].filter((item) => item.visible);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Tổng quan vận hành"
        description="Theo dõi mức độ sẵn sàng nội dung song ngữ, yêu cầu báo giá, quản trị tệp, bản nháp AI và cấu hình hệ thống trước khi kết nối Payload."
        actionHref="/admin/products?create=1"
        actionLabel="Thêm sản phẩm"
      />

      <div className="motion-stagger grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
        {kpis.map((stat) => (
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
        <DashboardInsightChart />
        <div className="space-y-5">
          <WarningPanel />
          <QuickActions />
        </div>
      </div>
      {isAdmin && <QuoteTable compact quotes={quotes} />}
    </div>
  );
}

export function AdminSectionPage({
  section,
  role,
  createMode,
  uploadMode,
  products,
  categories,
  promotions,
  blogPosts,
  showrooms,
  quotes,
  brands,
  profiles,
}: {
  section: AdminSection;
  role?: string;
  createMode?: boolean;
  uploadMode?: boolean;
  products?: AdminProduct[];
  categories?: AdminCategory[];
  promotions?: AdminPromotion[];
  blogPosts?: AdminBlogPost[];
  showrooms?: AdminShowroom[];
  quotes?: AdminQuote[];
  brands?: Brand[];
  profiles?: AdminUser[];
}) {
  if (section === "quotes") return <QuotesPage quotes={quotes ?? []} role={role} />;
  if (section === "media") return <MediaPage uploadMode={uploadMode} />;
  if (section === "settings") return <SettingsPage />;
  if (section === "users") return <UsersPage createMode={createMode} profiles={profiles ?? []} />;
  if (section === "brands") return <BrandsAdmin initialBrands={brands ?? []} />;
  if (section === "blog") return <BlogPage createMode={createMode} posts={blogPosts ?? []} />;
  if (section === "showrooms") return <ShowroomPage createMode={createMode} showrooms={showrooms ?? []} />;
  if (section === "categories") return <CategoryPage createMode={createMode} categories={categories ?? []} />;
  if (section === "promotions") return <PromotionsPage createMode={createMode} promotions={promotions ?? []} />;
  return <ProductsPage createMode={createMode} products={products ?? []} />;
}


function ProductsPage({ createMode, products = [] }: { createMode?: boolean; products?: AdminProduct[] }) {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");
  const [filterState, setFilterState] = useState<ProductFilterState>({ category: "all", status: "all", search: "" });

  const filtered = products.filter((p) => {
    const matchCat = filterState.category === "all" || (p.category_name?.toLowerCase().includes(filterState.category) ?? false);
    const matchStatus = filterState.status === "all" || (filterState.status === "published" ? p.featured : !p.featured);
    const matchSearch = filterState.search === "" ||
      p.name.toLowerCase().includes(filterState.search.toLowerCase()) ||
      (p.slug ?? "").toLowerCase().includes(filterState.search.toLowerCase()) ||
      (p.reference_code ?? "").toLowerCase().includes(filterState.search.toLowerCase());
    return matchCat && matchStatus && matchSearch;
  });

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Quản lý sản phẩm"
        description="Vận hành danh mục ưu tiên báo giá: trường song ngữ, ánh xạ danh mục, tệp, thông số, trạng thái giá và mức độ sẵn sàng xuất bản."
        actionHref="/admin/products/new"
        actionLabel="Thêm sản phẩm"
      />
      <ProductFilterCard value={filterState} onChange={setFilterState} />
      <ProductOperationsTable products={filtered} />

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

import { useSearchParams, useRouter } from "next/navigation";

function BlogPage({ createMode, posts = [] }: { createMode?: boolean; posts?: AdminBlogPost[] }) {
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
        <BlogQueue posts={posts} />
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

function CategoryPage({ createMode, categories = [] }: { createMode?: boolean; categories?: AdminCategory[] }) {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Quản trị danh mục"
        description="Hai nhóm sản phẩm chính được giữ cố định theo nghiệp vụ. Biên tập viên quản lý danh mục con, tên song ngữ, đường dẫn, thứ tự và SEO."
        actionHref="/admin/categories/new"
        actionLabel="Thêm danh mục"
      />
      <div className="grid gap-4 md:grid-cols-3">
        {categories.length === 0 ? (
          <p className="col-span-full p-8 text-center text-sm text-slate-400">Chưa có danh mục nào.</p>
        ) : (
          categories.map((category, index) => (
            <div key={category.id} className="card-pd interactive-card p-4 flex flex-col justify-between">
              <div>
                <p className="label-pd">Nhóm {index + 1}</p>
                <div className="space-y-2.5 mt-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 mr-1.5">Tên:</span>
                    <span className="font-heading font-semibold text-primary">{category.name}</span>
                    <p className="mt-1 text-xs text-secondary leading-relaxed">{category.description ?? "—"}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <StatusPill status={category.status as PublishStatus} />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <Link href={`/admin/categories/${category.id || category.slug}/edit`} className="admin-edit-action inline-flex items-center gap-1">
                  <Pencil className="size-3" />
                  Chỉnh sửa
                </Link>
              </div>
            </div>
          ))
        )}
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
        <EntityCreateForm kind="category" idOrSlug={editSlug || undefined} />
      </AdminRouteDialog>
    </div>
  );
}

function ShowroomPage({ createMode, showrooms = [] }: { createMode?: boolean; showrooms?: AdminShowroom[] }) {
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
        {showrooms.length === 0 ? (
          <p className="col-span-full p-8 text-center text-sm text-slate-400">Chưa có showroom nào.</p>
        ) : (
          showrooms.map((showroom) => (
            <article key={showroom.id} className="card-pd interactive-card group overflow-hidden flex flex-col justify-between">
              <div>
                <div className="h-44 w-full rounded bg-slate-100" />
                <div className="p-4 space-y-3.5">
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 mr-1.5">Tên:</span>
                      <span className="font-heading font-semibold text-primary">{showroom.name}</span>
                      <p className="text-xs text-secondary pl-5 mt-0.5">{showroom.address}</p>
                    </div>
                  </div>
                  <div className="text-xs space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <p><span className="font-bold text-slate-500">Hotline:</span> {showroom.hotline}</p>
                    <p><span className="font-bold text-slate-500">Giờ mở cửa:</span> {showroom.opening_hours ?? "—"}</p>
                  </div>
                  <StatusPill status={showroom.status as PublishStatus} />
                </div>
              </div>
              <div className="p-4 pt-0 flex justify-end">
                <Link href={`/admin/showrooms?edit=${showroom.code ?? showroom.id}`} className="admin-edit-action">
                  <Pencil className="size-3" />
                  Chỉnh sửa
                </Link>
              </div>
            </article>
          ))
        )}
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
        <EntityCreateForm kind="showroom" idOrSlug={editSlug || undefined} />
      </AdminRouteDialog>
    </div>
  );
}



function QuotesPage({ quotes = [], role }: { quotes?: AdminQuote[]; role?: string }) {
  const router = useRouter();
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>(quotes[0]?.id ?? "");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmailDraft, setShowEmailDraft] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusNote, setStatusNote] = useState("");
  const [localQuotes, setLocalQuotes] = useState<AdminQuote[]>(quotes);

  if (role !== "admin") {
    return (
      <div className="rounded-xl border border-dashed bg-slate-50 min-h-[320px] flex flex-col justify-center items-center p-8 text-center text-slate-400">
        <Lock className="size-10 mb-3" />
        <p className="font-semibold text-sm">Bạn không có quyền truy cập mục yêu cầu báo giá.</p>
      </div>
    );
  }

  const filteredQuotes = localQuotes.filter((q) => {
    const matchesStatus = filterStatus === "all" || q.status === filterStatus;
    const keyword = searchQuery.trim().toLowerCase();
    const matchesQuery =
      keyword === "" ||
      q.full_name.toLowerCase().includes(keyword) ||
      q.phone.includes(searchQuery) ||
      (q.service ?? "").toLowerCase().includes(keyword) ||
      q.source_path.toLowerCase().includes(keyword);
    return matchesStatus && matchesQuery;
  });

  const selectedQuote = filteredQuotes.find((q) => q.id === selectedQuoteId) ?? filteredQuotes[0] ?? null;

  // Quote workflow: trạng thái → actions có thể thực hiện tiếp theo
  const workflowTransitions: Record<string, { label: string; status: string; variant: string }[]> = {
    new:        [{ label: "Bắt đầu xử lý", status: "processing", variant: "primary" }],
    processing: [{ label: "Đã liên hệ", status: "contacted", variant: "primary" }, { label: "Đánh dấu spam", status: "spam", variant: "danger" }],
    contacted:  [{ label: "Đủ điều kiện", status: "qualified", variant: "primary" }, { label: "Hủy", status: "cancelled", variant: "danger" }],
    qualified:  [{ label: "Hoàn tất", status: "closed", variant: "success" }, { label: "Hủy", status: "cancelled", variant: "danger" }],
    closed:     [],
    cancelled:  [{ label: "Mở lại xử lý", status: "new", variant: "primary" }],
    spam:       [{ label: "Khôi phục", status: "new", variant: "primary" }],
  };

  const statusLabels: Record<string, string> = {
    new:        "Chờ xử lý",
    processing: "Đang xử lý",
    contacted:  "Đã liên hệ",
    qualified:  "Đủ điều kiện",
    closed:     "Đã hoàn tất",
    cancelled:  "Đã hủy",
    spam:       "Thư rác",
  };

  const statusColors: Record<string, string> = {
    new:        "status-warning",
    processing: "status-muted",
    contacted:  "bg-blue-100 text-blue-700 border-blue-200",
    qualified:  "bg-purple-100 text-purple-700 border-purple-200",
    closed:     "status-success",
    cancelled:  "status-error",
    spam:       "status-error",
  };

  async function handleStatusTransition(quoteId: string, newStatus: string) {
    if (isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      const { updateQuoteStatus } = await import("@/lib/supabase/admin-queries");
      const result = await updateQuoteStatus(quoteId, newStatus, statusNote || undefined);
      if (result.success) {
        // Update local state optimistically
        setLocalQuotes((prev) => prev.map((q) => q.id === quoteId ? { ...q, status: newStatus } : q));
        setStatusNote("");
        router.refresh();
      } else {
        alert("Lỗi cập nhật trạng thái: " + (result.error ?? "Không xác định"));
      }
    } catch (err) {
      alert("Đã xảy ra lỗi: " + String(err));
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  const statusCount = (status: string) => localQuotes.filter((q) => q.status === status).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý yêu cầu báo giá"
        description="Kiểm duyệt và xử lý các yêu cầu từ khách hàng. Theo dõi tiến trình qua workflow trạng thái rõ ràng."
      />

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {[
          { id: "all", label: "Tất cả" },
          { id: "new", label: "Chờ xử lý" },
          { id: "processing", label: "Đang xử lý" },
          { id: "contacted", label: "Đã liên hệ" },
          { id: "qualified", label: "Đủ điều kiện" },
          { id: "closed", label: "Hoàn tất" },
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
            {tab.id !== "all" && statusCount(tab.id) > 0 ? (
              <span className="ml-1.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-slate-200 px-1 text-[9px] font-bold text-slate-700">
                {statusCount(tab.id)}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
            <input
              className="input-pd pl-9 bg-white"
              placeholder="Tìm theo tên khách, số điện thoại, hoặc nguồn yêu cầu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="surface-soft overflow-hidden rounded-xl border bg-white">
            <div className="grid grid-cols-[1fr_1.2fr_100px_130px] bg-slate-50 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <span>Khách hàng</span>
              <span>Nội dung quan tâm</span>
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
                  className={`w-full text-left grid grid-cols-[1fr_1.2fr_100px_130px] items-center border-t border-slate-100 px-4 py-3.5 transition-colors hover:bg-slate-50/50 ${
                    selectedQuote?.id === quote.id ? "bg-indigo-50/30" : ""
                  }`}
                  onClick={() => setSelectedQuoteId(quote.id)}
                >
                  <div>
                    <p className="font-semibold text-slate-800">{quote.full_name}</p>
                    <p className="text-xs text-slate-500 font-mono">{quote.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{quote.service ?? "Yêu cầu tư vấn"}</p>
                    <p className="text-[10px] text-slate-400 truncate">{quote.source_path}</p>
                  </div>
                  <span className="text-xs text-slate-500">{new Date(quote.created_at).toLocaleDateString("vi-VN")}</span>
                  <span className={`status-pill w-fit text-[11px] leading-none ${statusColors[quote.status] ?? "status-muted"}`}>
                    {statusLabels[quote.status] ?? quote.status}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          {selectedQuote ? (
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block">{selectedQuote.id}</span>
                  <h4 className="font-heading font-bold text-sm">Chi tiết yêu cầu báo giá</h4>
                </div>
                <span className={`status-pill text-[11px] leading-none ${statusColors[selectedQuote.status] ?? "status-muted"}`}>
                  {statusLabels[selectedQuote.status] ?? selectedQuote.status}
                </span>
              </div>

              <div className="p-4 flex-1 space-y-4 text-xs">
                {/* Missing email warning */}
                {!selectedQuote.email && (
                  <div className="rounded-lg bg-orange-50 border border-orange-200 p-3 text-orange-700 flex items-start gap-2">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Thiếu địa chỉ email khách hàng</strong>
                      <span className="text-[11px] block mt-0.5">Cần bổ sung email nếu muốn gửi báo giá chi tiết qua thư.</span>
                    </div>
                  </div>
                )}

                {/* Contact info */}
                <div className="bg-slate-50 p-3 rounded-lg border space-y-2">
                  <h5 className="font-bold text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <User className="size-3.5 text-slate-400" /> Thông tin liên hệ
                  </h5>
                  <div className="grid gap-2 pl-5">
                    <div><span className="text-slate-400 block">Khách hàng</span><strong className="text-sm text-slate-800">{selectedQuote.full_name}</strong></div>
                    <div><span className="text-slate-400 block">Số điện thoại</span><strong className="text-slate-700">{selectedQuote.phone}</strong></div>
                    <div><span className="text-slate-400 block">Email</span><span className="text-slate-700 font-semibold">{selectedQuote.email || "Chưa thiết lập"}</span></div>
                    <div><span className="text-slate-400 block">Người phụ trách</span><strong className="text-slate-700">{selectedQuote.assigned_to || "Chưa phân công"}</strong></div>
                  </div>
                </div>

                {/* Request info */}
                <div className="bg-slate-50 p-3 rounded-lg border space-y-2">
                  <h5 className="font-bold text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FileText className="size-3.5 text-slate-400" /> Nội dung yêu cầu
                  </h5>
                  <div className="grid gap-2 pl-5">
                    <div><span className="text-slate-400 block">Dịch vụ</span><strong className="text-slate-800">{selectedQuote.service ?? "Yêu cầu tư vấn"}</strong></div>
                    <div><span className="text-slate-400 block">Đường dẫn nguồn</span><span className="text-slate-500 font-mono break-all">{selectedQuote.source_path}</span></div>
                    <div><span className="text-slate-400 block">Ghi chú khách hàng</span><p className="text-slate-700 leading-relaxed whitespace-pre-line">{selectedQuote.message}</p></div>
                    {selectedQuote.admin_notes && (
                      <div><span className="text-slate-400 block">Ghi chú nội bộ</span><p className="text-slate-700 leading-relaxed whitespace-pre-line">{selectedQuote.admin_notes}</p></div>
                    )}
                  </div>
                </div>

                {/* Workflow Actions */}
                {(workflowTransitions[selectedQuote.status] ?? []).length > 0 && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 space-y-3">
                    <h5 className="font-bold text-[10px] uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                      <Activity className="size-3.5" /> Hành động tiếp theo
                    </h5>
                    <div>
                      <input
                        className="input-pd text-xs mb-2"
                        placeholder="Ghi chú nội bộ (tùy chọn)..."
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(workflowTransitions[selectedQuote.status] ?? []).map((action) => (
                        <button
                          key={action.status}
                          type="button"
                          disabled={isUpdatingStatus}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition disabled:opacity-60 ${
                            action.variant === "success" ? "bg-green-600 text-white border-green-600 hover:bg-green-700" :
                            action.variant === "danger" ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" :
                            "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
                          }`}
                          onClick={() => handleStatusTransition(selectedQuote.id, action.status)}
                        >
                          {isUpdatingStatus ? "Đang xử lý..." : action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="border-t pt-3 flex flex-wrap gap-2 justify-end">
                  <button
                    type="button"
                    className="button-pd-outline py-1 px-2.5 text-xs flex items-center gap-1 bg-indigo-50 border-indigo-200 text-indigo-700 hover:text-indigo-900"
                    onClick={() => setShowEmailDraft(true)}
                  >
                    <Mail className="size-3.5" />
                    Xem mẫu email tư vấn
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
              <div><span className="text-slate-400 font-bold block">Gửi tới:</span><span className="text-slate-800 font-semibold">{selectedQuote.email || "Khách hàng (chưa có email)"}</span></div>
              <div><span className="text-slate-400 font-bold block">Tiêu đề:</span><span className="text-slate-800 font-semibold">Phương Đông Showroom - Phản hồi yêu cầu tư vấn báo giá</span></div>
              <div className="bg-slate-50 p-3 rounded border font-serif text-slate-700 leading-relaxed select-all whitespace-pre-line">
                {`Chào anh/chị ${selectedQuote.full_name},

Cảm ơn anh/chị đã gửi yêu cầu tư vấn đến Showroom Phương Đông.

Chúng tôi đã ghi nhận yêu cầu của anh/chị cho nội dung ${selectedQuote.service ?? "tư vấn sản phẩm"} vào ngày ${new Date(selectedQuote.created_at).toLocaleDateString("vi-VN")}.

Đội ngũ tư vấn sẽ chủ động liên hệ trong thời gian sớm nhất để gửi thông tin phù hợp.

Trân trọng,
Đội ngũ CSKH Phương Đông.`}
              </div>
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

function UsersPage({ createMode, profiles = [] }: { createMode?: boolean; profiles?: AdminUser[] }) {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý người dùng và vai trò"
        description="Tạo tài khoản chỉ dành cho quản trị viên. Biên tập viên chỉ quản lý nội dung có thể xuất bản theo mô hình vai trò A."
        actionHref="/admin/users?create=1"
        actionLabel="Thêm người dùng"
      />
      <div className="surface-soft overflow-hidden rounded-xl border bg-white divide-y">
        {profiles.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-400">Không có tài khoản quản trị nào.</p>
        ) : (
          profiles.map((profile) => {
            const roleLabel = profile.role === "admin" ? "Quản trị viên" : "Biên tập viên";
            const scope = profile.role === "admin"
              ? "Người dùng, cài đặt, báo giá, tích hợp và toàn bộ nội dung"
              : "Sản phẩm, bài viết, trang chủ, giới thiệu, showroom và tệp có thể xuất bản";
            return (
              <div key={profile.id || profile.email} className="flex flex-col justify-between gap-3 p-4 transition-colors hover:bg-slate-50 md:flex-row md:items-center">
                <div>
                  <h2 className="font-semibold text-primary">{profile.email}</h2>
                  {profile.full_name && <p className="text-xs font-medium text-slate-500">{profile.full_name}</p>}
                  <p className="text-xs text-secondary mt-0.5">{roleLabel} — {scope}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">
                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString("vi-VN") : ""}
                  </span>
                  <StatusPill status={profile.is_active ? "published" : "draft"} />
                </div>
              </div>
            );
          })
        )}
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

function PromotionsPage({ createMode, promotions = [] }: { createMode?: boolean; promotions?: AdminPromotion[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("edit");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa chương trình khuyến mãi này?")) return;
    setIsDeleting(true);
    try {
      const res = await deleteAdminPromotion(id);
      if (res.success) {
        alert("Xóa khuyến mãi thành công!");
        router.refresh();
      } else {
        alert("Lỗi khi xóa khuyến mãi: " + res.error);
      }
    } catch (err) {
      alert("Đã xảy ra lỗi: " + (err instanceof Error ? err.message : err));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: "code",
      header: "Mã",
      width: "15%",
      render: (row: AdminPromotion) => <span className="font-semibold">{row.code}</span>,
    },
    {
      key: "title",
      header: "Tiêu đề",
      width: "35%",
      render: (row: AdminPromotion) => (
        <div>
          <p className="font-medium text-primary">{row.title_vi || ""}</p>
          {row.title_en && <p className="text-xs text-slate-400">{row.title_en}</p>}
        </div>
      ),
    },
    {
      key: "discount_percentage",
      header: "Giảm giá",
      width: "15%",
      render: (row: AdminPromotion) => (
        <span className="font-bold text-red-600">-{row.discount_percentage}%</span>
      ),
    },
    {
      key: "duration",
      header: "Thời hạn",
      width: "20%",
      render: (row: AdminPromotion) => {
        const start = row.start_at ? new Date(row.start_at).toLocaleDateString("vi-VN") : "—";
        const end = row.end_at ? new Date(row.end_at).toLocaleDateString("vi-VN") : "—";
        return <span className="text-xs text-secondary">{start} - {end}</span>;
      },
    },
    {
      key: "status",
      header: "Trạng thái",
      width: "15%",
      render: (row: AdminPromotion) => <StatusPill status={row.status as PublishStatus} />,
    },
    {
      key: "actions",
      header: "Thao tác",
      width: "10%",
      render: (row: AdminPromotion) => (
        <div className="flex items-center gap-2">
          <Link href={`/admin/promotions?edit=${row.id}`} className="admin-edit-action">
            <Pencil className="size-3" />
          </Link>
          <button
            onClick={() => handleDelete(row.id)}
            disabled={isDeleting}
            className="text-slate-400 hover:text-red-600 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý khuyến mãi"
        description="Vận hành các chương trình khuyến mãi, combo giảm giá, chiết khấu và thiết lập thời hạn hiệu lực."
        actionHref="/admin/promotions?create=1"
        actionLabel="Thêm khuyến mãi"
      />
      
      <div className="surface-soft p-4 rounded-xl border bg-white">
        <DataTable
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          data={promotions as any}
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          columns={columns as any}
          pageSize={10}
          emptyMessage="Chưa có chương trình khuyến mãi nào được tạo."
        />
      </div>

      {/* Create Dialog */}
      <AdminRouteDialog
        open={Boolean(createMode)}
        returnHref="/admin/promotions"
        title="Thêm khuyến mãi mới"
        description="Thiết lập mã code, chiết khấu phần trăm, tiêu đề song ngữ và thời hạn khuyến mãi."
        size="full"
      >
        <EntityCreateForm kind="promotion" />
      </AdminRouteDialog>

      {/* Edit Dialog */}
      <AdminRouteDialog
        open={Boolean(editId)}
        returnHref="/admin/promotions"
        title="Hiệu chỉnh khuyến mãi"
        description="Cập nhật thông tin chi tiết chương trình khuyến mãi và thời hạn hiệu lực."
        size="full"
      >
        <EntityCreateForm kind="promotion" idOrSlug={editId || undefined} />
      </AdminRouteDialog>
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

function ProductOperationsTable({ products = [] }: { products?: AdminProduct[] }) {
  return (
    <div className="surface-soft overflow-hidden">
      <div className="grid grid-cols-[1fr_160px_120px_120px_100px] bg-surface-container/80 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-primary max-lg:hidden">
        <span>Sản phẩm</span>
        <span>Danh mục</span>
        <span>Trạng thái</span>
        <span>Sẵn sàng</span>
        <span className="text-right">Thao tác</span>
      </div>
      {products.length === 0 ? (
        <p className="p-8 text-center text-sm text-slate-400">Chưa có sản phẩm nào.</p>
      ) : (
        products.map((product, index) => (
          <div
            key={product.id}
            className="grid gap-4 border-t border-outline-variant/25 px-5 py-4 transition-colors hover:bg-surface-container-lowest/70 lg:grid-cols-[1fr_160px_120px_120px_100px] lg:items-center"
          >
            <div className="flex gap-4">
              <div className="size-16 rounded bg-slate-100 shrink-0" />
              <div>
                <h3 className="font-heading text-lg font-semibold">{product.name}</h3>
                <p className="text-sm italic text-secondary">{product.summary}</p>
                <p className="mt-1 text-xs text-outline">{product.reference_code ?? product.slug}</p>
              </div>
            </div>
            <span>{product.category_name}</span>
            <StatusPill status={product.featured ? "published" : "draft"} />
            <span className={`status-pill w-fit text-[11px] ${index < 2 ? "status-success" : "status-warning"}`}>
              {index < 2 ? "Sẵn sàng" : "Thiếu tiếng Anh/SEO"}
            </span>
            <div className="lg:text-right">
              <Link href={`/admin/products/${product.id || product.slug}/edit`} className="admin-edit-action">
                <Pencil className="size-3" />
                Chỉnh sửa
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function BlogQueue({ posts = [] }: { posts?: AdminBlogPost[] }) {
  return (
    <section className="surface-soft p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start border-b pb-3 mb-4">
        <div>
          <p className="label-pd">Hàng đợi biên tập</p>
          <h2 className="admin-section-title-pd mt-2 text-lg">Bài viết cần kiểm duyệt</h2>
        </div>
      </div>
      {posts.length === 0 ? (
        <p className="p-8 text-center text-sm text-slate-400">Chưa có bài viết nào.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <article key={post.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">{post.category_name}</span>
                  <StatusPill status={post.featured ? "published" : "draft"} />
                </div>
                <div className="flex gap-4">
                  <div className="size-16 rounded-lg bg-slate-100 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-800 text-sm line-clamp-2">{post.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">{post.published_at ? new Date(post.published_at).toLocaleDateString("vi-VN") : "Chưa xuất bản"}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-500 line-clamp-2">{post.excerpt}</p>
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
      )}
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

interface ProductFilterState {
  category: string;
  status: string;
  search: string;
}

function ProductFilterCard({
  value,
  onChange,
  categories,
}: {
  value: ProductFilterState;
  onChange: (val: ProductFilterState) => void;
  categories?: { value: string; label: string }[];
}) {
  const hasActive = value.category !== "all" || value.status !== "all" || value.search !== "";

  const categoryOptions = [
    { value: "all", label: "Tất cả danh mục" },
    ...(categories ?? [
      { value: "wood", label: "Nội thất gỗ" },
      { value: "sanitary", label: "Thiết bị vệ sinh" },
    ]),
  ];

  return (
    <div className="surface-panel grid gap-4 p-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
      <label className="grid gap-2">
        <span className="label-pd">Danh mục</span>
        <PremiumSelect
          name="category"
          value={value.category}
          ariaLabel="Danh mục"
          placeholder="Danh mục"
          tone="admin"
          options={categoryOptions}
          onValueChange={(v) => onChange({ ...value, category: v })}
        />
      </label>
      <label className="grid gap-2">
        <span className="label-pd">Trạng thái</span>
        <PremiumSelect
          name="status"
          value={value.status}
          ariaLabel="Trạng thái"
          placeholder="Trạng thái"
          tone="admin"
          options={[
            { value: "all", label: "Tất cả trạng thái" },
            { value: "draft", label: "Bản nháp" },
            { value: "published", label: "Đã xuất bản" },
            { value: "archived", label: "Đã lưu trữ" },
          ]}
          onValueChange={(v) => onChange({ ...value, status: v })}
        />
      </label>
      <label className="grid gap-2">
        <span className="label-pd">Tìm kiếm</span>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
          <input
            className="input-pd pl-9"
            placeholder="Tên, mã, đường dẫn..."
            value={value.search}
            onChange={(e) => onChange({ ...value, search: e.target.value })}
          />
        </div>
      </label>
      {hasActive ? (
        <button
          type="button"
          className="button-pd-outline self-end"
          onClick={() => onChange({ category: "all", status: "all", search: "" })}
        >
          <X className="size-4" /> Xóa lọc
        </button>
      ) : (
        <div className="self-end h-10" />
      )}
    </div>
  );
}


function QuoteTable({ compact, quotes = [] }: { compact?: boolean; quotes?: AdminQuote[] }) {
  return (
    <div className="surface-soft overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <h2 className="admin-section-title-pd">Yêu cầu báo giá mới nhất</h2>
        {compact ? <Link className="font-bold text-primary" href="/admin/quotes">Xem tất cả</Link> : null}
      </div>
      {quotes.length === 0 ? (
        <p className="p-8 text-center text-sm text-slate-400">Chưa có yêu cầu báo giá nào.</p>
      ) : (
        quotes.map((quote) => (
          <div key={quote.id} className="grid gap-3 border-t border-outline-variant/25 px-4 py-3.5 transition-colors hover:bg-surface-container-lowest/70 md:grid-cols-[1fr_1fr_120px_120px]">
            <div>
              <p className="font-semibold">{quote.full_name}</p>
              <p className="text-sm text-secondary">{quote.phone}</p>
            </div>
            <p>{quote.service ?? quote.source_path}</p>
            <p className="text-sm text-secondary">{new Date(quote.created_at).toLocaleDateString("vi-VN")}</p>
            <QuoteStatusPill status={quote.status} />
          </div>
        ))
      )}
    </div>
  );
}

function QuoteStatusPill({ status }: { status: string }) {
  const statusLabels: Record<string, string> = {
    new: "Chờ xử lý",
    processing: "Đang xử lý",
    contacted: "Đã liên hệ",
    qualified: "Đủ điều kiện",
    closed: "Đã hoàn tất",
    cancelled: "Đã hủy",
    spam: "Thư rác",
  };
  const className =
    status === "new"
      ? "status-warning"
      : status === "contacted" || status === "processing"
        ? "status-muted"
        : status === "closed" ? "status-success" : "status-muted";

  return (
    <span className={`status-pill w-fit text-[11px] leading-none ${className}`}>
      {statusLabels[status] ?? status}
    </span>
  );
}

function WarningPanel() {
  const warnings = [
    "Kiểm tra lại nội dung thiếu metadata hoặc bản dịch ở các mục chưa sẵn sàng.",
    "Rà soát các yêu cầu báo giá mới để tránh tồn đọng quá lâu.",
    "Xác nhận dữ liệu showroom và blog đã đồng bộ đúng từ Supabase.",
  ];

  return (
    <div className="status-warning rounded-[var(--radius-panel)] border p-4 shadow-[0_10px_26px_rgba(120,83,15,0.05)]">
      <div className="flex items-center gap-2">
        <FileWarning className="size-5" />
        <h2 className="font-heading text-base font-semibold">Trạng thái CMS cần xử lý</h2>
      </div>
      <ul className="mt-4 space-y-3 text-sm">
        {warnings.map((warning) => (
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
