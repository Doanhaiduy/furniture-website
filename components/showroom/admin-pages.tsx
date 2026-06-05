import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  FileWarning,
  Lock,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";
import {
  adminStats,
  cmsWarnings,
  imageAssets,
  products,
  quoteRequests,
  showrooms,
} from "@/lib/showroom-data";
import {
  AiDraftWorkflow,
  EditorLocaleTabs,
  MediaUploadPanel,
  PublishWorkflow,
  QuoteStatusUpdater,
  RichTextEditorMock,
  StatusPill,
  UnsavedChangesBar,
} from "./admin-interactions";
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
        description="Theo dõi nội dung song ngữ, quote mới và các cảnh báo sẵn sàng xuất bản."
        actionHref="/admin/products?new=1"
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
              <span className="rounded-full border border-outline-variant/25 bg-surface-container px-2.5 py-1 text-xs font-bold text-secondary shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                {stat.delta}
              </span>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#edf0f7]">
              <div className="h-full w-2/3 rounded-full bg-[#8b5cf6]" />
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

function DashboardInsight() {
  return (
    <section className="admin-panel p-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <p className="label-pd inline-flex items-center gap-2">
            <BarChart3 className="size-4" />
            Content performance
          </p>
          <h2 className="mt-3 font-heading text-xl font-semibold leading-snug text-primary md:text-2xl">
            Tuần này có 18 quote mới từ sản phẩm nổi bật
          </h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-secondary">
            Theo dõi tốc độ xuất bản, trạng thái song ngữ và chất lượng SEO trước khi nối Payload analytics.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container px-3 py-1.5 text-xs font-bold text-primary">
            +14%
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container px-3 py-1.5 text-xs font-bold text-secondary">
            7 ngày
          </span>
        </div>
      </div>
      <DashboardInsightChart />
    </section>
  );
}

export function AdminSectionPage({
  section,
  createMode,
}: {
  section: AdminSection;
  createMode?: boolean;
}) {
  if (section === "quotes") return <QuotesPage />;
  if (section === "ai-assistant") return <AiAssistantPage />;
  if (section === "media") return <MediaPage />;
  if (section === "settings") return <SettingsPage />;
  if (section === "users") return <UsersPage />;
  if (section === "blog") return <EditorPage title="Biên tập bài viết song ngữ" kind="blog" />;
  if (section === "showrooms") return <ShowroomPage />;
  if (section === "categories") return createMode ? <CategoryCreatePage /> : <CategoryPage />;
  if (section === "products" && createMode) return <ProductCreatePage />;
  return <ProductsPage />;
}

export function AdminLoginPage() {
  return (
    <main className="grid min-h-screen bg-[#211816] p-4 lg:grid-cols-[1fr_520px]">
      <section className="relative hidden overflow-hidden rounded-[2rem] bg-primary text-white lg:block">
        <RemoteImage src={imageAssets.showroom} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#211816] via-[#211816]/58 to-transparent" />
        <div className="absolute bottom-0 p-12">
          <p className="label-pd text-white/65">CMS Operations</p>
          <h1 className="mt-4 max-w-xl font-heading text-5xl font-bold leading-tight">
            Quản trị nội dung showroom như một phòng điều hành.
          </h1>
        </div>
      </section>
      <section className="grid place-items-center rounded-[2rem] bg-[#eef6fa] p-6">
        <div className="state-card w-full max-w-md rounded-3xl border border-white/80 bg-white/88 p-8 shadow-[0_28px_80px_rgba(0,0,0,0.18)]">
          <p className="label-pd">Admin CMS</p>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-primary">Đăng nhập</h1>
          <p className="mt-3 text-sm leading-6 text-secondary">
            Truy cập dashboard nội dung, quote requests, media governance và AI draft workflow.
          </p>
          <form className="mt-8 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-semibold">Email</span>
              <input className="input-pd" defaultValue="admin@phuongdong.vn" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold">Mật khẩu</span>
              <input className="input-pd" type="password" defaultValue="password" />
            </label>
            <Link className="button-pd mt-2" href="/admin">
              Đăng nhập demo
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
        Editor không được xem quote requests, users, privileged settings hoặc integration secrets theo Role Model Option A.
      </p>
      <Link className="button-pd mt-6" href="/admin">
        Về dashboard
      </Link>
    </div>
  );
}

function ProductsPage() {
  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Quản lý sản phẩm"
        description="Danh sách sản phẩm quote-first, trạng thái xuất bản và cảnh báo song ngữ."
        actionHref="/admin/products?new=1"
        actionLabel="Thêm sản phẩm mới"
      />
      <FilterCard />
      <div className="surface-soft overflow-hidden">
        <div className="grid grid-cols-[1fr_160px_140px_140px] bg-surface-container/80 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-primary max-lg:hidden">
          <span>Sản phẩm</span>
          <span>Danh mục</span>
          <span>Trạng thái</span>
          <span>Cập nhật</span>
        </div>
        {products.slice(0, 5).map((product) => (
          <div
            key={product.slug}
            className="grid gap-4 border-t border-outline-variant/25 px-5 py-4 transition-colors hover:bg-surface-container-lowest/70 lg:grid-cols-[1fr_160px_140px_140px] lg:items-center"
          >
            <div className="flex gap-4">
              <RemoteImage className="size-16 rounded object-cover" src={product.image} alt="" sizes="64px" />
              <div>
                <h3 className="font-heading text-lg font-semibold">{product.name.vi}</h3>
                <p className="text-sm italic text-secondary">{product.name.en}</p>
                <p className="mt-1 text-xs text-outline">{product.referenceCode}</p>
              </div>
            </div>
            <span>{product.category.vi}</span>
            <StatusPill status={product.status} />
            <span className="text-sm text-secondary">01/06/2026</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductCreatePage() {
  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Thêm sản phẩm mới"
        description="Tạo bản ghi sản phẩm quote-first với trường song ngữ, danh mục, slug và cảnh báo SEO."
        actionHref="/admin/products"
        actionLabel="Về danh sách"
      />
      <EditorPage title="Thêm / cập nhật sản phẩm song ngữ" kind="product" compact />
    </div>
  );
}

function CategoryPage() {
  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Quản lý danh mục"
        description="Hai nhóm top-level cố định và danh mục con có thể chỉnh sửa theo từng locale."
        actionHref="/admin/categories?new=1"
        actionLabel="Thêm danh mục"
      />
      <div className="grid gap-4 md:grid-cols-3">
        {["Đồ gỗ", "Thiết bị vệ sinh", "Gạch ốp lát"].map((name, index) => (
          <div key={name} className="card-pd interactive-card p-4">
            <p className="label-pd">Nhóm {index + 1}</p>
            <h2 className="mt-3 font-heading text-xl font-semibold text-primary">{name}</h2>
            <p className="mt-2 text-sm text-secondary">Slug VI/EN, SEO warning và trạng thái publish.</p>
            <StatusPill status={index === 1 ? "draft" : "published"} />
          </div>
        ))}
      </div>
      <PublishWorkflow />
    </div>
  );
}

function CategoryCreatePage() {
  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Thêm danh mục"
        description="Tạo danh mục con song ngữ, gắn nhóm top-level, slug và trạng thái xuất bản."
        actionHref="/admin/categories"
        actionLabel="Về danh mục"
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <section className="surface-soft p-4">
          <EditorLocaleTabs />
          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="label-pd">Tên danh mục</span>
              <input className="input-pd text-base font-semibold" defaultValue="Bàn trà cao cấp" />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="label-pd">Nhóm cha</span>
                <PremiumSelect
                  defaultValue="wood"
                  ariaLabel="Nhóm cha"
                  placeholder="Nhóm cha"
                  tone="admin"
                  options={[
                    { value: "wood", label: "Nội thất & đồ gỗ" },
                    { value: "sanitary", label: "Thiết bị vệ sinh" },
                    { value: "tiles", label: "Gạch ốp lát" },
                  ]}
                />
              </label>
              <label className="grid gap-2">
                <span className="label-pd">Slug</span>
                <input className="input-pd" defaultValue="ban-tra-cao-cap" />
              </label>
            </div>
            <label className="grid gap-2">
              <span className="label-pd">Mô tả</span>
              <textarea className="input-pd min-h-28" defaultValue="Danh mục dùng cho các mẫu bàn trà, bàn phụ và bề mặt hoàn thiện phòng khách." />
            </label>
          </div>
        </section>
        <aside className="space-y-5">
          <WarningPanel />
          <PublishWorkflow />
        </aside>
      </div>
    </div>
  );
}

function EditorPage({
  title,
  kind,
  compact,
}: {
  title: string;
  kind: "product" | "blog";
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-5" : "space-y-6"}>
      {!compact ? (
        <AdminPageHeader
          title={title}
          description="Editor song ngữ, cảnh báo thiếu locale, slug conflict, SEO score và AI draft workflow."
        />
      ) : null}
      <UnsavedChangesBar />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="surface-soft p-5">
          <EditorLocaleTabs />
          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="label-pd">{kind === "product" ? "Tên sản phẩm" : "Tiêu đề bài viết"}</span>
              <input className="input-pd text-lg font-semibold" defaultValue={kind === "product" ? "Sofa Curve Velour" : "Bí quyết chọn gỗ óc chó cho nội thất cao cấp"} />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="label-pd">Danh mục</span>
                <PremiumSelect
                  defaultValue="wood"
                  ariaLabel="Danh mục"
                  placeholder="Danh mục"
                  tone="admin"
                  options={[
                    { value: "wood", label: "Đồ gỗ" },
                    { value: "sanitary", label: "Thiết bị vệ sinh" },
                  ]}
                />
              </label>
              <label className="grid gap-2">
                <span className="label-pd">Slug</span>
                <input className="input-pd border-error" defaultValue="sofa-curve-velour" />
                <span className="text-xs text-error">Slug đã tồn tại ở bản nháp khác.</span>
              </label>
            </div>
            <label className="grid gap-2">
              <span className="label-pd">Mô tả ngắn</span>
              <textarea className="input-pd min-h-24" defaultValue="Tóm tắt nội dung hiển thị trên danh sách và metadata fallback." />
            </label>
            <RichTextEditorMock defaultValue="Nội dung chi tiết có thể nối Payload rich text sau này. AI draft không được tự xuất bản." />
          </div>
        </section>
        <aside className="space-y-5">
          <AiDraftWorkflow />
          <WarningPanel />
          <PublishWorkflow />
        </aside>
      </div>
    </div>
  );
}

function ShowroomPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý showroom"
        description="Tên, địa chỉ song ngữ, hotline, map embed và fallback URL."
        actionHref="/admin/showrooms?new=1"
        actionLabel="Thêm showroom"
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {showrooms.map((showroom) => (
          <article key={showroom.code} className="card-pd interactive-card group overflow-hidden">
            <RemoteImage src={showroom.image} alt="" className="image-lift h-44 w-full object-cover" />
            <div className="p-4">
              <h2 className="font-heading text-lg font-semibold text-primary">{showroom.name.vi}</h2>
              <p className="mt-2 text-sm leading-6 text-secondary">{showroom.address.vi}</p>
              <p className="mt-3 font-bold">{showroom.hotline}</p>
              <StatusPill status="published" />
            </div>
          </article>
        ))}
      </div>
      <PublishWorkflow />
    </div>
  );
}

function QuotesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý yêu cầu báo giá"
        description="Admin-only lead records. Editor phải bị chặn ở server-side access control khi nối Payload."
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <QuoteTable />
        <QuoteStatusUpdater />
      </div>
    </div>
  );
}

function MediaPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Media library"
        description="Cloudinary-backed upload UI với trạng thái upload lỗi, thiếu alt text và owner context."
        actionHref="/admin/media?upload=1"
        actionLabel="Upload media"
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <MediaUploadPanel />
        <div className="state-card rounded-xl border border-error/25 bg-error-container p-4 text-on-error-container shadow-[0_18px_44px_rgba(147,0,10,0.08)]">
          <AlertTriangle className="size-6" />
          <h3 className="mt-3 font-heading text-lg font-semibold">Upload error</h3>
          <p className="mt-2 text-sm leading-6">
            File `catalog.pdf` bị từ chối vì media baseline chỉ cho ảnh và video theo field context.
          </p>
        </div>
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Cài đặt hệ thống"
        description="Brand, social links, SEO defaults và integrations. Secret fields phải server-only."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <SettingsCard title="Brand & Contact" />
        <SettingsCard title="SEO defaults" warning />
        <SettingsCard title="Social links" />
        <SettingsCard title="Integrations" locked />
      </div>
    </div>
  );
}

function UsersPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý người dùng"
        description="Admin-only. Editor không được quản lý users hoặc role permissions."
        actionHref="/admin/users?new=1"
        actionLabel="Thêm user"
      />
      <div className="surface-soft overflow-hidden">
        {["admin@phuongdong.vn", "editor@phuongdong.vn"].map((email, index) => (
          <div key={email} className="flex items-center justify-between border-t border-outline-variant/25 p-4 transition-colors first:border-t-0 hover:bg-surface-container-lowest/70">
            <div>
              <h2 className="font-semibold">{email}</h2>
              <p className="text-sm text-secondary">{index === 0 ? "Admin" : "Editor"}</p>
            </div>
            <StatusPill status="published" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AiAssistantPage() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <div>
        <AdminPageHeader
          title="AI draft workflow"
          description="AI tạo draft-only cho content/SEO. Không dùng quote data, không tự publish."
        />
        <div className="card-pd interactive-card mt-5 p-5">
          <h2 className="font-heading text-xl font-semibold text-primary">Human review queue</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">
            Kết quả AI phải được chèn vào editor, chỉnh sửa, rồi đi qua validation song ngữ/SEO trước khi xuất bản.
          </p>
        </div>
      </div>
      <AiDraftWorkflow />
    </div>
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
        <span className="inline-flex items-center gap-2 rounded-full border border-[#e0e6ef] bg-white px-2.5 py-1 text-[11px] font-bold text-[#8b5cf6] shadow-[0_10px_24px_rgba(21,23,43,0.04)]">
          <Sparkles className="size-3.5" />
          CMS workspace
        </span>
        <h1 className="mt-3 font-heading text-xl font-semibold text-[#15172b] md:text-2xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-[13px] leading-6 text-[#686d82]">{description}</p>
      </div>
      {actionHref && actionLabel ? (
        <Link className="button-pd shrink-0" href={actionHref}>
          {actionLabel.startsWith("Về") ? <ArrowLeft className="size-4" /> : <Plus className="size-4" />}
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

function FilterCard() {
  return (
    <form method="get" className="surface-soft grid gap-4 p-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
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
            { value: "wood", label: "Đồ gỗ" },
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
            { value: "draft", label: "Draft" },
            { value: "published", label: "Published" },
            { value: "archived", label: "Archived" },
          ]}
        />
      </label>
      <label className="grid gap-2">
        <span className="label-pd">Tìm kiếm</span>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
          <input className="input-pd pl-9" name="q" placeholder="Tên, mã, slug..." />
        </div>
      </label>
      <button className="button-pd self-end" type="submit">
        Áp dụng lọc
      </button>
    </form>
  );
}

function QuoteTable({ compact }: { compact?: boolean }) {
  return (
    <div className="surface-soft overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <h2 className="font-heading text-lg font-semibold text-primary">Yêu cầu báo giá mới nhất</h2>
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
      ? "border-violet-200 bg-violet-50 text-violet-700"
      : status === "contacted"
        ? "border-sky-200 bg-sky-50 text-sky-700"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize leading-none ${className}`}>
      {status}
    </span>
  );
}

function WarningPanel() {
  return (
    <div className="rounded-2xl border border-[#f2d38c] bg-[#fff8e6] p-4 text-[#7a4a00] shadow-[0_10px_26px_rgba(120,83,15,0.05)]">
      <div className="flex items-center gap-2">
        <FileWarning className="size-5" />
        <h2 className="font-heading text-base font-semibold">CMS states cần xử lý</h2>
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
    ["Duyệt nội dung song ngữ", "/admin/blog"],
    ["Cập nhật quote", "/admin/quotes"],
    ["Cấu hình SEO", "/admin/settings"],
  ] as const;

  return (
    <div className="rounded-2xl border border-[#202448] bg-[linear-gradient(145deg,#0f122c,#15183a)] p-4 text-white shadow-[0_16px_40px_rgba(9,10,35,0.16)]">
      <h2 className="font-heading text-lg font-semibold">Lối tắt nhanh</h2>
      <div className="mt-4 grid gap-2.5">
        {actions.map(([label, href]) => (
          <Link key={label} href={href} className="flex min-h-10 items-center justify-between rounded-xl bg-white/10 px-3 py-2.5 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30">
            {label}
            <ArrowRight className="size-4" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function SettingsCard({
  title,
  warning,
  locked,
}: {
  title: string;
  warning?: boolean;
  locked?: boolean;
}) {
  return (
    <div className="card-pd interactive-card p-4">
      <div className="flex items-center gap-3">
        {locked ? <Lock className="size-5 text-primary" /> : <Settings className="size-5 text-primary" />}
        <h2 className="font-heading text-lg font-semibold text-primary">{title}</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-secondary">
        {locked
          ? "Không render secret ra client; chỉ hiển thị trạng thái cấu hình."
          : "Form state sẵn sàng nối Payload global sau này."}
      </p>
      {warning ? (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <AlertTriangle className="mr-1 inline size-4" />
          OG image mặc định chưa có alt EN.
        </p>
      ) : (
        <p className="mt-4 text-sm font-semibold text-emerald-700">
          <BadgeCheck className="mr-1 inline size-4" />
          Sẵn sàng
        </p>
      )}
    </div>
  );
}
