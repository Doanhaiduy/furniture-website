const fs = require('fs');

const filePath = 'components/showroom/admin-workflows.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

// Helper to escape regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 1. Add useParams to next/navigation import
content = content.replace(
  "import { useRouter, useSearchParams } from \"next/navigation\";",
  "import { useRouter, useSearchParams, useParams } from \"next/navigation\";"
);

// 2. Update AdminRouteDialog declaration & state
const dialogTarget = `export function AdminRouteDialog({
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
  }, [returnHref, router]);`;

const dialogReplacement = `export function AdminRouteDialog({
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
  }, [isDirty, returnHref, router]);`;

if (content.includes(dialogTarget)) {
  content = content.replace(dialogTarget, dialogReplacement);
  console.log("Replaced AdminRouteDialog header.");
} else {
  console.log("WARNING: AdminRouteDialog header not found!");
}

// 3. Update AdminRouteDialog Portal Return (with event listeners and warning dialog)
const portalTarget = `  return createPortal(
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
        className={\`admin-dialog-content fixed left-1/2 top-1/2 flex flex-col -translate-x-1/2 -translate-y-1/2 overflow-hidden p-0 outline-none \${width} \${height}\`}
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
  );`;

const portalReplacement = `  const handleDialogClick = (e: React.MouseEvent) => {
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
        className={\`admin-dialog-content fixed left-1/2 top-1/2 flex flex-col -translate-x-1/2 -translate-y-1/2 overflow-hidden p-0 outline-none \${width} \${height}\`}
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
  );`;

if (content.includes(portalTarget)) {
  content = content.replace(portalTarget, portalReplacement);
  console.log("Replaced AdminRouteDialog portal.");
} else {
  console.log("WARNING: AdminRouteDialog portal not found!");
}

// 4. Update CategoryEntityForm: add auto-slugify and readOnly={true}
const categoryFormIdx = content.indexOf('function CategoryEntityForm');
if (categoryFormIdx !== -1) {
  const catTarget1 = `  /* eslint-enable react-hooks/set-state-in-effect */

  const handleAiFill = async () => {`;

  const catReplacement1 = `  /* eslint-enable react-hooks/set-state-in-effect */

  // Auto-slugify category nameVi
  useEffect(() => {
    if (!isEdit && nameVi) {
      setSlug(slugify(nameVi));
    }
  }, [nameVi, isEdit]);

  const handleAiFill = async () => {`;

  const targetIdx = content.indexOf(catTarget1, categoryFormIdx);
  if (targetIdx !== -1) {
    content = content.substring(0, targetIdx) + catReplacement1 + content.substring(targetIdx + catTarget1.length);
  }

  const fieldTarget = `              <AdminField label="Đường dẫn" name="category-slug" value={slug} onChange={setSlug} />`;
  const fieldReplacement = `              <AdminField label="Đường dẫn" name="category-slug" value={slug} onChange={setSlug} readOnly={true} />`;
  const fieldIdx = content.indexOf(fieldTarget, categoryFormIdx);
  if (fieldIdx !== -1) {
    content = content.substring(0, fieldIdx) + fieldReplacement + content.substring(fieldIdx + fieldTarget.length);
  }
}
console.log("Replaced Category auto-slug.");

// 5. Update ShowroomEntityForm: add auto-slugify and readOnly={true}
const showroomFormIdx = content.indexOf('function ShowroomEntityForm');
if (showroomFormIdx !== -1) {
  const showTarget1 = `  /* eslint-enable react-hooks/set-state-in-effect */

  const handleAiFill = async () => {
    if (!nameVi.trim() && !addressVi.trim()) return;`;

  const showReplacement1 = `  /* eslint-enable react-hooks/set-state-in-effect */

  // Auto-generate showroom code from nameVi
  useEffect(() => {
    if (!isEdit && nameVi) {
      setCode(slugify(nameVi));
    }
  }, [nameVi, isEdit]);

  const handleAiFill = async () => {
    if (!nameVi.trim() && !addressVi.trim()) return;`;

  const targetIdx = content.indexOf(showTarget1, showroomFormIdx);
  if (targetIdx !== -1) {
    content = content.substring(0, targetIdx) + showReplacement1 + content.substring(targetIdx + showTarget1.length);
  }

  const fieldTarget = `              <AdminField label="Mã nội bộ" name="showroom-code" value={code} onChange={setCode} />`;
  const fieldReplacement = `              <AdminField label="Mã nội bộ (Đường dẫn)" name="showroom-code" value={code} onChange={setCode} readOnly={true} />`;
  const fieldIdx = content.indexOf(fieldTarget, showroomFormIdx);
  if (fieldIdx !== -1) {
    content = content.substring(0, fieldIdx) + fieldReplacement + content.substring(fieldIdx + fieldTarget.length);
  }
}
console.log("Replaced Showroom auto-slug.");

// 6. Replace UserCreateEntityForm entirely
const userTargetFunc = `function UserCreateEntityForm() {
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
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
        toast.success("Tạo tài khoản quản trị thành công!");
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
}`;

const userReplacementFunc = `function UserCreateEntityForm() {
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
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
        toast.success("Tạo tài khoản quản trị thành công!");
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
        </div>
      </section>
      <aside className="space-y-5">
        <ReadinessPanel
          items={[
            { label: "Vai trò khớp ma trận quyền của phương án A", state: "ready" },
            { label: "Tài khoản quản trị đầu tiên vẫn do vận hành backend thiết lập", state: "warning" },
            { label: "Mật khẩu sẽ có hiệu lực ngay lập tức", state: "ready" },
          ]}
        />
        <section className="surface-soft p-4 space-y-4">
          <h3 className="admin-section-title-pd">Thao tác</h3>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-bold hover:from-sky-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            disabled={formLoading}
          >
            {formLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Plus className="size-4" />
                Tạo tài khoản
              </>
            )}
          </button>
        </section>
      </aside>
    </form>
  );
}`;

if (content.includes(userTargetFunc)) {
  content = content.replace(userTargetFunc, userReplacementFunc);
  console.log("Replaced UserCreateEntityForm.");
} else {
  console.log("WARNING: UserCreateEntityForm not found!");
}

// 7. Replace BrandEntityForm entirely
const brandTargetFunc = `function BrandEntityForm({ idOrSlug }: { idOrSlug?: string }) {
  const { toast } = useToast();
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
    setFieldErrors({});

    try {
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

      const { brandSchema } = await import("@/lib/validations/admin");
      const validation = brandSchema.safeParse(brandData);
      if (!validation.success) {
        const errors: Record<string, string> = {};
        validation.error.issues.forEach((issue) => {
          const path = issue.path[0];
          if (typeof path === "string") {
            errors[path] = issue.message;
          }
        });
        setFieldErrors(errors);
        setFormError("Vui lòng sửa các lỗi nhập liệu bên dưới.");
        setFormLoading(false);
        return;
      }

      const { createAdminBrand, updateAdminBrand } = await import("@/lib/supabase/brands-mutations");

      let res;
      if (isEdit) {
        res = await updateAdminBrand(editId, brandData);
      } else {
        res = await createAdminBrand(brandData);
      }

      if (res.success) {
        toast.success(isEdit ? "Cập nhật thương hiệu thành công!" : "Tạo thương hiệu thành công!");
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
          <AdminField
            label="Tên thương hiệu (VI) *"
            name="name_vi"
            value={nameVi}
            onChange={setNameVi}
            error={fieldErrors.name_vi}
          />
          <AdminField
            label="Tên thương hiệu (EN)"
            name="name_en"
            value={nameEn}
            onChange={setNameEn}
            error={fieldErrors.name_en}
          />
          <AdminField
            label="Mô tả tiếng Việt"
            name="description_vi"
            value={descriptionVi}
            onChange={setDescriptionVi}
            multiline
            error={fieldErrors.description_vi}
          />
          <AdminField
            label="Mô tả tiếng Anh"
            name="description_en"
            value={descriptionEn}
            onChange={setDescriptionEn}
            multiline
            error={fieldErrors.description_en}
          />
          <AdminField
            label="Xuất xứ"
            name="origin"
            value={origin}
            onChange={setOrigin}
            placeholder="Ví dụ: Đức, Mỹ, Nhật Bản"
            error={fieldErrors.origin}
          />
          <div className="grid gap-2">
            <span className="label-pd">Logo thương hiệu</span>
            <ImageUploadDropzone
              value={logoUrl}
              onChange={(url) => setLogoUrl(url)}
              label="Tải logo thương hiệu lên"
            />
            {fieldErrors.logo_url && <span className="text-red-600 text-xs font-medium">{fieldErrors.logo_url}</span>}
          </div>
        </div>
      </section>
      <div className="space-y-5">
        <section className="surface-soft p-4">
          <AdminField
            label="Thứ tự hiển thị"
            name="sort_order"
            inputType="number"
            value={String(sortOrder)}
            onChange={(val) => setSortOrder(Number(val))}
            error={fieldErrors.sort_order}
          />
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
}`;

const brandReplacementFunc = `function BrandEntityForm({ idOrSlug }: { idOrSlug?: string }) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const editId = idOrSlug || searchParams.get("edit") || "";
  const isEdit = Boolean(editId);

  const [nameVi, setNameVi] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  const [descriptionVi, setDescriptionVi] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [origin, setOrigin] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Auto-slugify brand nameVi
  useEffect(() => {
    if (!isEdit && nameVi) {
      setSlug(slugify(nameVi));
    }
  }, [nameVi, isEdit]);

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
            setSlug(b.slug || "");
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

  const handleSave = async (targetStatus: "draft" | "published" | "archived") => {
    setFormLoading(true);
    setFormError("");
    setFieldErrors({});

    try {
      const brandData = {
        name_vi: nameVi,
        name_en: nameEn,
        description_vi: descriptionVi,
        description_en: descriptionEn,
        origin,
        logo_url: logoUrl,
        sort_order: Number(sortOrder),
        status: targetStatus,
        slug,
      };

      const { brandSchema } = await import("@/lib/validations/admin");
      const validation = brandSchema.safeParse(brandData);
      if (!validation.success) {
        const errors: Record<string, string> = {};
        validation.error.issues.forEach((issue) => {
          const path = issue.path[0];
          if (typeof path === "string") {
            errors[path] = issue.message;
          }
        });
        setFieldErrors(errors);
        setFormError("Vui lòng sửa các lỗi nhập liệu bên dưới.");
        setFormLoading(false);
        return;
      }

      const { createAdminBrand, updateAdminBrand } = await import("@/lib/supabase/brands-mutations");

      let res;
      if (isEdit) {
        res = await updateAdminBrand(editId, brandData);
      } else {
        res = await createAdminBrand(brandData);
      }

      if (res.success) {
        toast.success(isEdit ? "Cập nhật thương hiệu thành công!" : "Tạo thương hiệu thành công!");
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
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="surface-soft p-4">
        <WorkflowIntro
          icon={Award}
          title={isEdit ? "Hiệu chỉnh thương hiệu" : "Thêm thương hiệu mới"}
          description="Thiết lập logo, xuất xứ và mô tả song ngữ cho thương hiệu đối tác."
        />
        {formError && <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{formError}</div>}
        <div className="mt-5 grid gap-4">
          <AdminField
            label="Tên thương hiệu (VI) *"
            name="name_vi"
            value={nameVi}
            onChange={setNameVi}
            error={fieldErrors.name_vi}
          />
          <AdminField
            label="Đường dẫn"
            name="brand-slug"
            value={slug}
            onChange={setSlug}
            readOnly={true}
          />
          <AdminField
            label="Tên thương hiệu (EN)"
            name="name_en"
            value={nameEn}
            onChange={setNameEn}
            error={fieldErrors.name_en}
          />
          <AdminField
            label="Mô tả tiếng Việt"
            name="description_vi"
            value={descriptionVi}
            onChange={setDescriptionVi}
            multiline
            error={fieldErrors.description_vi}
          />
          <AdminField
            label="Mô tả tiếng Anh"
            name="description_en"
            value={descriptionEn}
            onChange={setDescriptionEn}
            multiline
            error={fieldErrors.description_en}
          />
          <AdminField
            label="Xuất xứ"
            name="origin"
            value={origin}
            onChange={setOrigin}
            placeholder="Ví dụ: Đức, Mỹ, Nhật Bản"
            error={fieldErrors.origin}
          />
          <div className="grid gap-2">
            <span className="label-pd">Logo thương hiệu</span>
            <ImageUploadDropzone
              value={logoUrl}
              onChange={(url) => setLogoUrl(url)}
              label="Tải logo thương hiệu lên"
            />
            {fieldErrors.logo_url && <span className="text-red-600 text-xs font-medium">{fieldErrors.logo_url}</span>}
          </div>
        </div>
      </section>
      <aside className="space-y-5">
        <section className="surface-soft p-4">
          <AdminField
            label="Thứ tự hiển thị"
            name="sort_order"
            inputType="number"
            value={String(sortOrder)}
            onChange={(val) => setSortOrder(Number(val))}
            error={fieldErrors.sort_order}
          />
        </section>
        <PublishWorkflow 
          status={status}
          onStatusChange={setStatus}
          errors={[]} 
          onSaveDraft={() => handleSave("draft")}
          onPublish={() => handleSave("published")}
          onArchive={() => handleSave("archived")}
        />
      </aside>
    </div>
  );
}`;

if (content.includes(brandTargetFunc)) {
  content = content.replace(brandTargetFunc, brandReplacementFunc);
  console.log("Replaced BrandEntityForm.");
} else {
  console.log("WARNING: BrandEntityForm not found!");
}

// 8. Replace PromotionEntityForm entirely
const promoTargetFunc = `function PromotionEntityForm({ idOrSlug }: { idOrSlug?: string }) {
  const { toast } = useToast();
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
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [itemsList, setItemsList] = useState<string[]>([""]);
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
            setStartAt(p.start_at ? p.start_at.substring(0, 16) : "");
            setEndAt(p.end_at ? p.end_at.substring(0, 16) : "");
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
    setFieldErrors({});
    try {
      const promotionData = {
        code,
        discount_percentage: Number(discountPercentage),
        title_vi: titleVi,
        title_en: titleEn,
        description_vi: descriptionVi,
        description_en: descriptionEn,
        cover_image: coverImage,
        combo_price: comboPrice ? Number(comboPrice) : null,
        start_at: startAt ? new Date(startAt).toISOString() : null,
        end_at: endAt ? new Date(endAt).toISOString() : null,
        original_price: originalPrice ? Number(originalPrice) : null,
        items: itemsList.filter(i => i.trim() !== ""),
        status,
        productIds: selectedProductIds,
      };

      const { promotionSchema } = await import("@/lib/validations/admin");
      const validation = promotionSchema.safeParse(promotionData);
      if (!validation.success) {
        const errors: Record<string, string> = {};
        validation.error.issues.forEach((issue) => {
          const path = issue.path[0];
          if (typeof path === "string") {
            errors[path] = issue.message;
          }
        });
        setFieldErrors(errors);
        setFormError("Vui lòng sửa các lỗi nhập liệu bên dưới.");
        setFormLoading(false);
        return;
      }

      const { createAdminPromotion, updateAdminPromotion } = await import("@/lib/supabase/admin-queries");

      let res;
      if (isEdit) {
        res = await updateAdminPromotion(editId, promotionData);
      } else {
        res = await createAdminPromotion(promotionData);
      }

      if (res.success) {
        toast.success(isEdit ? "Cập nhật khuyến mãi thành công!" : "Tạo khuyến mãi thành công!");
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
            <AdminField
              label="Mã khuyến mãi *"
              name="code"
              value={code}
              onChange={setCode}
              error={fieldErrors.code}
              placeholder="Ví dụ: VALENTINE-COMBO"
            />
            <AdminField
              label="Phần trăm chiết khấu (%) *"
              name="discount_percentage"
              inputType="number"
              value={String(discountPercentage)}
              onChange={(val) => setDiscountPercentage(Number(val))}
              error={fieldErrors.discount_percentage}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField
              label="Tiêu đề khuyến mãi (VI) *"
              name="title_vi"
              value={titleVi}
              onChange={setTitleVi}
              error={fieldErrors.title_vi}
            />
            <AdminField
              label="Tiêu đề khuyến mãi (EN)"
              name="title_en"
              value={titleEn}
              onChange={setTitleEn}
              error={fieldErrors.title_en}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField
              label="Mô tả - Tiếng Việt"
              name="promo-desc-vi"
              value={descriptionVi}
              onChange={setDescriptionVi}
              multiline
              error={fieldErrors.description_vi}
            />
            <AdminField
              label="Mô tả - Tiếng Anh"
              name="promo-desc-en"
              value={descriptionEn}
              onChange={setDescriptionEn}
              multiline
              error={fieldErrors.description_en}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField
              label="Giá Combo sản phẩm"
              name="combo_price"
              inputType="number"
              value={comboPrice}
              onChange={setComboPrice}
              placeholder="Ví dụ: 12000000"
              error={fieldErrors.combo_price}
            />
            <AdminField
              label="Giá trị ban đầu (gốc)"
              name="original_price"
              inputType="number"
              value={originalPrice}
              onChange={setOriginalPrice}
              placeholder="Ví dụ: 18000000"
              error={fieldErrors.original_price}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="label-pd">Thời gian bắt đầu</span>
              <input
                className={\`input-pd bg-white \${fieldErrors.start_at ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}\`}
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
              {fieldErrors.start_at && <span className="text-red-600 text-xs font-medium -mt-1">{fieldErrors.start_at}</span>}
            </label>
            <label className="grid gap-2">
              <span className="label-pd">Thời gian kết thúc</span>
              <input
                className={\`input-pd bg-white \${fieldErrors.end_at ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}\`}
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
              {fieldErrors.end_at && <span className="text-red-600 text-xs font-medium -mt-1">{fieldErrors.end_at}</span>}
            </label>
          </div>

          <div className="grid gap-2">
            <span className="label-pd">Ảnh bìa Combo</span>
            <ImageUploadDropzone
              value={coverImage}
              onChange={(url) => setCoverImage(url)}
              label="Tải ảnh combo khuyến mãi lên"
            />
            {fieldErrors.cover_image && <span className="text-red-600 text-xs font-medium">{fieldErrors.cover_image}</span>}
          </div>

          <div className="grid gap-2">
            <span className="label-pd">Các sản phẩm đi kèm trong Combo</span>
            <div className="space-y-2">
              {itemsList.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <input className="input-pd bg-white flex-1" type="text" value={item} onChange={(e) => handleItemChange(idx, e.target.value)} placeholder={\`Sản phẩm #\${idx + 1}\`} />
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
                        className={\`px-3 py-1 rounded text-xs font-semibold \${
                          isChecked ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                        }\`}
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
}`;

const promoReplacementFunc = `function PromotionEntityForm({ idOrSlug }: { idOrSlug?: string }) {
  const { toast } = useToast();
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
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [itemsList, setItemsList] = useState<string[]>([""]);
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // N-N products states
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [searchVal, setSearchVal] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Auto-generate promotion code from titleVi
  useEffect(() => {
    if (!isEdit && titleVi) {
      setCode(slugify(titleVi).toUpperCase().replaceAll("-", "_"));
    }
  }, [titleVi, isEdit]);

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
            setStartAt(p.start_at ? p.start_at.substring(0, 16) : "");
            setEndAt(p.end_at ? p.end_at.substring(0, 16) : "");
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

  const handleSave = async (targetStatus: "draft" | "published" | "archived") => {
    setFormLoading(true);
    setFormError("");
    setFieldErrors({});
    try {
      const promotionData = {
        code,
        discount_percentage: Number(discountPercentage),
        title_vi: titleVi,
        title_en: titleEn,
        description_vi: descriptionVi,
        description_en: descriptionEn,
        cover_image: coverImage,
        combo_price: comboPrice ? Number(comboPrice) : null,
        start_at: startAt ? new Date(startAt).toISOString() : null,
        end_at: endAt ? new Date(endAt).toISOString() : null,
        original_price: originalPrice ? Number(originalPrice) : null,
        items: itemsList.filter(i => i.trim() !== ""),
        status: targetStatus,
        productIds: selectedProductIds,
      };

      const { promotionSchema } = await import("@/lib/validations/admin");
      const validation = promotionSchema.safeParse(promotionData);
      if (!validation.success) {
        const errors: Record<string, string> = {};
        validation.error.issues.forEach((issue) => {
          const path = issue.path[0];
          if (typeof path === "string") {
            errors[path] = issue.message;
          }
        });
        setFieldErrors(errors);
        setFormError("Vui lòng sửa các lỗi nhập liệu bên dưới.");
        setFormLoading(false);
        return;
      }

      const { createAdminPromotion, updateAdminPromotion } = await import("@/lib/supabase/admin-queries");

      let res;
      if (isEdit) {
        res = await updateAdminPromotion(editId, promotionData);
      } else {
        res = await createAdminPromotion(promotionData);
      }

      if (res.success) {
        toast.success(isEdit ? "Cập nhật khuyến mãi thành công!" : "Tạo khuyến mãi thành công!");
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
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="surface-soft p-4">
        <WorkflowIntro
          icon={BadgePercent}
          title={isEdit ? "Hiệu chỉnh chương trình khuyến mãi" : "Thêm chương trình khuyến mãi mới"}
          description="Thiết lập thông tin khuyến mãi combo, chiết khấu và sản phẩm đi kèm."
        />
        {formError && <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{formError}</div>}
        <div className="mt-5 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField
              label="Mã khuyến mãi (Đường dẫn) *"
              name="code"
              value={code}
              onChange={setCode}
              error={fieldErrors.code}
              placeholder="Ví dụ: VALENTINE-COMBO"
              readOnly={true}
            />
            <AdminField
              label="Phần trăm chiết khấu (%) *"
              name="discount_percentage"
              inputType="number"
              value={String(discountPercentage)}
              onChange={(val) => setDiscountPercentage(Number(val))}
              error={fieldErrors.discount_percentage}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField
              label="Tiêu đề khuyến mãi (VI) *"
              name="title_vi"
              value={titleVi}
              onChange={setTitleVi}
              error={fieldErrors.title_vi}
            />
            <AdminField
              label="Tiêu đề khuyến mãi (EN)"
              name="title_en"
              value={titleEn}
              onChange={setTitleEn}
              error={fieldErrors.title_en}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField
              label="Mô tả - Tiếng Việt"
              name="promo-desc-vi"
              value={descriptionVi}
              onChange={setDescriptionVi}
              multiline
              error={fieldErrors.description_vi}
            />
            <AdminField
              label="Mô tả - Tiếng Anh"
              name="promo-desc-en"
              value={descriptionEn}
              onChange={setDescriptionEn}
              multiline
              error={fieldErrors.description_en}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField
              label="Giá Combo sản phẩm"
              name="combo_price"
              inputType="number"
              value={comboPrice}
              onChange={setComboPrice}
              placeholder="Ví dụ: 12000000"
              error={fieldErrors.combo_price}
            />
            <AdminField
              label="Giá trị ban đầu (gốc)"
              name="original_price"
              inputType="number"
              value={originalPrice}
              onChange={setOriginalPrice}
              placeholder="Ví dụ: 18000000"
              error={fieldErrors.original_price}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="label-pd">Thời gian bắt đầu</span>
              <input
                className={\`input-pd bg-white \${fieldErrors.start_at ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}\`}
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
              {fieldErrors.start_at && <span className="text-red-600 text-xs font-medium -mt-1">{fieldErrors.start_at}</span>}
            </label>
            <label className="grid gap-2">
              <span className="label-pd">Thời gian kết thúc</span>
              <input
                className={\`input-pd bg-white \${fieldErrors.end_at ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}\`}
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
              {fieldErrors.end_at && <span className="text-red-600 text-xs font-medium -mt-1">{fieldErrors.end_at}</span>}
            </label>
          </div>

          <div className="grid gap-2">
            <span className="label-pd">Ảnh bìa Combo</span>
            <ImageUploadDropzone
              value={coverImage}
              onChange={(url) => setCoverImage(url)}
              label="Tải ảnh combo khuyến mãi lên"
            />
            {fieldErrors.cover_image && <span className="text-red-600 text-xs font-medium">{fieldErrors.cover_image}</span>}
          </div>

          <div className="grid gap-2">
            <span className="label-pd">Các sản phẩm đi kèm trong Combo</span>
            <div className="space-y-2">
              {itemsList.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <input className="input-pd bg-white flex-1" type="text" value={item} onChange={(e) => handleItemChange(idx, e.target.value)} placeholder={\`Sản phẩm #\${idx + 1}\`} />
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
                        className={\`px-3 py-1 rounded text-xs font-semibold \${
                          isChecked ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                        }\`}
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
      <aside className="space-y-5">
        <PublishWorkflow 
          status={status}
          onStatusChange={setStatus}
          errors={[]} 
          onSaveDraft={() => handleSave("draft")}
          onPublish={() => handleSave("published")}
          onArchive={() => handleSave("archived")}
        />
      </aside>
    </div>
  );
}`;

if (content.includes(promoTargetFunc)) {
  content = content.replace(promoTargetFunc, promoReplacementFunc);
  console.log("Replaced PromotionEntityForm.");
} else {
  console.log("WARNING: PromotionEntityForm not found!");
}

fs.writeFileSync(filePath, content, 'utf8');
