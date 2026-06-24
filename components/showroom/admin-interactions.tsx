"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// Tiptap WYSIWYG
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

import {
  Archive,
  Bot,
  Bold,
  CheckCircle2,
  ImageUp,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  RefreshCcw,
  Rocket,
  Save,
  Strikethrough,
  UnderlineIcon,
  UploadCloud,
  WandSparkles,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading2,
  Heading3,
  Quote,
  Undo2,
  Redo2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PremiumSelect } from "./premium-select";
import { Pagination } from "./admin-pages";

export function PublishWorkflow({
  status: propStatus,
  onStatusChange,
  errors = [],
  onSaveDraft,
  onPublish,
  onArchive,
}: {
  status?: "draft" | "published" | "archived";
  onStatusChange?: (status: "draft" | "published" | "archived") => void;
  errors?: string[];
  onSaveDraft?: () => void;
  onPublish?: () => void;
  onArchive?: () => void;
} = {}) {
  const [localStatus, setLocalStatus] = useState<"draft" | "published" | "archived">("draft");
  const status = propStatus !== undefined ? propStatus : localStatus;
  const setStatus = onStatusChange !== undefined ? onStatusChange : setLocalStatus;

  const [confirm, setConfirm] = useState<"publish" | "archive" | null>(null);
  const [feedback, setFeedback] = useState("Bản nháp đang chờ lưu.");

  const hasErrors = errors.length > 0;

  const handlePublishClick = () => {
    if (hasErrors) {
      setFeedback(`Chưa thể xuất bản: vui lòng xử lý ${errors.length} vấn đề trước.`);
    } else {
      setConfirm("publish");
    }
  };

  const confirmCopy =
    confirm === "publish"
      ? {
          title: "Xác nhận xuất bản",
          description: "Nội dung chỉ hiển thị công khai sau khi kiểm tra song ngữ, tệp và SEO trong Payload đạt yêu cầu.",
          action: "Xuất bản",
        }
      : {
          title: "Xác nhận lưu trữ",
          description: "Nội dung lưu trữ sẽ bị loại khỏi danh sách công khai và đầu ra sitemap.",
          action: "Lưu trữ",
        };
  const dialogTitle = confirm === "publish" ? "Xác nhận xuất bản" : confirmCopy.title;

  return (
    <div className="card-pd interactive-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="label-pd">Trạng thái xuất bản</p>
          <p className="mt-2 font-heading text-xl font-semibold text-primary">
            {status === "published" ? "Đã xuất bản" : status === "archived" ? "Đã lưu trữ" : "Bản nháp"}
          </p>
        </div>
        <StatusPill status={status} />
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button 
          data-testid="publish-workflow-publish"
          className={`button-pd ${hasErrors ? "opacity-65 cursor-not-allowed bg-slate-500 hover:bg-slate-500" : ""}`} 
          type="button" 
          onClick={handlePublishClick}
        >
          <Rocket className="size-4" />
          Xuất bản
        </button>
        <button data-testid="publish-workflow-archive" className="button-pd-outline" type="button" onClick={() => setConfirm("archive")}>
          <Archive className="size-4" />
          Lưu trữ
        </button>
        <button
          data-testid="publish-workflow-save-draft"
          className="button-pd-outline"
          type="button"
          onClick={() => {
            if (onSaveDraft) {
              onSaveDraft();
            } else {
              setStatus("draft");
              setFeedback("Đã lưu bản nháp trong phiên giao diện này.");
            }
          }}
        >
          <Save className="size-4" />
          Lưu nháp
        </button>
      </div>
      
      {hasErrors && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
          <strong className="block font-semibold mb-1">Vấn đề đang chặn xuất bản:</strong>
          <ul className="list-disc pl-4 space-y-1">
            {errors.slice(0, 3).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
            {errors.length > 3 && <li>...và {errors.length - 3} vấn đề khác.</li>}
          </ul>
        </div>
      )}

      <p aria-live="polite" className="mt-4 rounded-lg bg-surface-container-low px-3 py-2 text-sm font-semibold text-secondary">
        {feedback}
      </p>

      <Dialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)}>
        <DialogContent data-testid="publish-workflow-confirm-dialog" className="admin-dialog-content sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{confirmCopy.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <button className="button-pd-outline" type="button" onClick={() => setConfirm(null)}>
              Hủy
            </button>
            <button
              className="button-pd"
              type="button"
              onClick={() => {
                if (!confirm) return;
                setStatus(confirm === "publish" ? "published" : "archived");
                setFeedback(confirm === "publish" ? "Đã chuyển sang trạng thái xuất bản." : "Đã chuyển sang trạng thái lưu trữ.");
                if (confirm === "publish" && onPublish) onPublish();
                if (confirm === "archive" && onArchive) onArchive();
                setConfirm(null);
              }}
            >
              {confirmCopy.action}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function QuoteStatusUpdater() {
  const [status, setStatus] = useState("new");

  return (
    <div className="surface-soft p-4">
      <label className="grid gap-2">
        <span className="label-pd">Cập nhật trạng thái báo giá</span>
        <PremiumSelect
          value={status}
          onValueChange={setStatus}
          ariaLabel="Cập nhật trạng thái báo giá"
          placeholder="Trạng thái báo giá"
          tone="admin"
          options={[
            { value: "new", label: "Chưa xử lý" },
            { value: "contacted", label: "Đang tư vấn" },
            { value: "qualified", label: "Đủ điều kiện" },
            { value: "closed", label: "Hoàn thành" },
            { value: "spam", label: "Thư rác" },
          ]}
        />
      </label>
      <p className="field-feedback mt-3 text-sm text-secondary">
        Trạng thái hiện tại: <strong>{status === "new" ? "Chưa xử lý" : status === "contacted" ? "Đang tư vấn" : status === "qualified" ? "Đủ điều kiện" : status === "closed" ? "Hoàn thành" : "Thư rác"}</strong>
      </p>
    </div>
  );
}

export function AiDraftWorkflow() {
  const [state, setState] = useState<"idle" | "loading" | "result" | "error">("idle");
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#282d52] bg-[linear-gradient(145deg,#11142d,#15183a_58%,#2b2450)] p-5 text-white shadow-[0_18px_44px_rgba(9,10,35,0.18)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/30" />
      <div className="flex items-center gap-3">
        <Bot className="size-6" />
        <h3 className="font-heading text-lg font-semibold">AI hỗ trợ nội dung và SEO</h3>
      </div>
      <label className="mt-5 grid gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">
          Tóm tắt / chủ đề
        </span>
        <input
          className="min-h-10 rounded-xl border border-white/16 bg-white/10 px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/45 focus:border-white/40 focus:bg-white/14 focus:ring-2 focus:ring-white/15"
          defaultValue="Cách chọn sofa cho phòng khách nhỏ"
        />
      </label>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          className="min-h-10 rounded-xl bg-white/14 px-3 py-2 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-white/22 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          type="button"
          onClick={() => {
            setState("loading");
            setAccepted(false);
            window.setTimeout(() => setState("result"), 700);
          }}
        >
          <WandSparkles className="mr-1 inline size-4" />
          Viết nháp
        </button>
        <button
          className="min-h-10 rounded-xl bg-white/14 px-3 py-2 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-white/22 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          type="button"
          onClick={() => setState("error")}
        >
          <RefreshCcw className="mr-1 inline size-4" />
          Mô phỏng lỗi
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/18 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        {state === "idle" ? (
          <p className="text-sm text-white/70">
            AI chỉ tạo nội dung nháp. Biên tập viên phải kiểm duyệt trước khi xuất bản.
          </p>
        ) : null}
        {state === "loading" ? (
          <p className="field-feedback flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Đang tạo đề xuất...
          </p>
        ) : null}
        {state === "result" ? (
          <div className="field-feedback">
            <p className="text-sm font-semibold">Đề xuất mô tả meta</p>
            <p className="mt-2 text-sm italic text-white/80">
              Khám phá cách chọn sofa cân đối kích thước, chất liệu và màu sắc cho phòng khách nhỏ.
            </p>
            <button
              className="mt-4 min-h-10 rounded-xl bg-white px-3 py-2 text-sm font-bold text-[#15172b] transition hover:-translate-y-0.5 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              type="button"
              onClick={() => setAccepted(true)}
            >
              <CheckCircle2 className="mr-1 inline size-4" />
              {accepted ? "Đã chèn" : "Chèn vào trình soạn thảo"}
            </button>
          </div>
        ) : null}
        {state === "error" ? (
          <p className="field-feedback text-sm text-[#ffdad6]">
            AI tạm thời không phản hồi. Nội dung hiện tại chưa bị thay đổi.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function UnsavedChangesBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="field-feedback mb-5 flex flex-col justify-between gap-3 rounded-2xl border border-[#f2d38c] bg-[#fff8e6] p-4 text-[#7a4a00] shadow-[0_10px_26px_rgba(120,83,15,0.05),inset_0_1px_0_rgba(255,255,255,0.78)] md:flex-row md:items-center">
      <p className="font-semibold">Bạn có thay đổi chưa lưu trong bản tiếng Việt.</p>
      <div className="flex gap-2">
        <button className="button-pd-outline" type="button" onClick={() => setVisible(false)}>
          Bỏ thay đổi
        </button>
        <button className="button-pd" type="button" onClick={() => setVisible(false)}>
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}

export function StatusPill({ status }: { status: "draft" | "published" | "archived" | string }) {
  const className =
    status === "published"
      ? "status-success"
      : status === "archived"
        ? "status-muted"
        : "status-warning";

  const label =
    status === "published" ? "Đã đăng" : status === "archived" ? "Lưu trữ" : "Nháp";

  return (
    <span className={`status-pill w-fit text-[11px] ${className}`}>
      <span className="size-2 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function EditorLocaleTabs() {
  const [locale, setLocale] = useState<"VI" | "EN">("VI");

  return (
    <div className="mb-5">
      <div className="flex gap-2 border-b border-outline-variant/30 pb-3" role="tablist" aria-label="Ngôn ngữ nội dung">
        {([
          { key: "VI", label: "Tiếng Việt" },
          { key: "EN", label: "Tiếng Anh" },
        ] as const).map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={locale === item.key}
            className="admin-tab-pd"
            onClick={() => setLocale(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs font-semibold text-secondary">Đang chỉnh bản {locale === "VI" ? "Tiếng Việt" : "Tiếng Anh"}.</p>
    </div>
  );
}

export function RichTextEditorMock({
  defaultValue,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  defaultValue?: string;
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const initialContent = value !== undefined ? value : (defaultValue ?? "");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: {},
        orderedList: {},
        blockquote: {},
        code: false,
        codeBlock: false,
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-indigo-600 underline cursor-pointer" },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Nhập chi tiết nội dung ở đây. Hỗ trợ Ctrl+B (đậm), Ctrl+I (nghiêng), Ctrl+U (gạch chân)...",
      }),
    ],
    content: initialContent,
    editable: !disabled,
    onUpdate({ editor }) {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  // Sync external value changes into editor (e.g. AI fill)
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const newVal = value ?? "";
    // Only update if meaningfully different to avoid cursor jumps
    if (newVal !== currentHtml && newVal !== "<p></p>") {
      editor.commands.setContent(newVal, { emitUpdate: false } as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  function ToolbarBtn({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <button
        type="button"
        title={title}
        onClick={onClick}
        className={`flex items-center justify-center rounded p-1.5 text-slate-600 transition-all hover:bg-slate-200 ${
          active ? "bg-slate-900 text-white hover:bg-slate-800" : ""
        }`}
      >
        {children}
      </button>
    );
  }


  const handleLinkInsert = () => {
    if (!editor) return;
    const url = window.prompt("Nhập URL liên kết:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!editor) return null;

  return (
    <div className={`tiptap-editor-wrapper overflow-hidden rounded-xl border border-[var(--admin-border)] shadow-sm bg-white ${disabled ? "opacity-60 pointer-events-none" : ""}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--admin-border)] bg-slate-50/80 p-2">
        {/* History */}
        <ToolbarBtn title="Hoàn tác (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="size-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Làm lại (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="size-3.5" />
        </ToolbarBtn>

        <div className="w-px h-5 bg-slate-200 mx-1 self-center" />

        {/* Text format */}
        <ToolbarBtn
          title="In đậm (Ctrl+B)"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          title="In nghiêng (Ctrl+I)"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Gạch chân (Ctrl+U)"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="size-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Gạch ngang"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="size-3.5" />
        </ToolbarBtn>

        <div className="w-px h-5 bg-slate-200 mx-1 self-center" />

        {/* Headings */}
        <ToolbarBtn
          title="Tiêu đề H2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="size-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Tiêu đề H3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="size-3.5" />
        </ToolbarBtn>

        <div className="w-px h-5 bg-slate-200 mx-1 self-center" />

        {/* Lists */}
        <ToolbarBtn
          title="Danh sách chấm"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Danh sách số"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Trích dẫn"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-3.5" />
        </ToolbarBtn>

        <div className="w-px h-5 bg-slate-200 mx-1 self-center" />

        {/* Alignment */}
        <ToolbarBtn
          title="Căn trái"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="size-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Căn giữa"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="size-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Căn phải"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="size-3.5" />
        </ToolbarBtn>

        <div className="w-px h-5 bg-slate-200 mx-1 self-center" />

        {/* Link */}
        <ToolbarBtn
          title="Chèn liên kết"
          active={editor.isActive("link")}
          onClick={handleLinkInsert}
        >
          <Link2 className="size-3.5" />
        </ToolbarBtn>

        <div className="ml-auto flex items-center">
          <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded">
            WYSIWYG Editor
          </span>
        </div>
      </div>

      {/* Editor content area */}
      <EditorContent
        editor={editor}
        className="min-h-64 max-h-[600px] overflow-y-auto bg-white"
      />
    </div>
  );
}

export function MediaUploadPanel() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ url: string; id: string } | null>(null);
  const [library, setLibrary] = useState<Array<{ id: string; public_url: string; format?: string; original_filename?: string }>>([]);
  const [libLoading, setLibLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;
  const inputRef = useRef<HTMLInputElement>(null);

  async function loadLibrary() {
    setLibLoading(true);
    try {
      const res = await fetch("/api/admin/media/list");
      if (res.ok) {
        const data = await res.json();
        setLibrary(data.assets ?? []);
      }
    } catch {
      // noop
    } finally {
      setLibLoading(false);
    }
  }

  // Load library on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLibrary();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredLibrary = library.filter((asset) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      (asset.original_filename ?? "").toLowerCase().includes(term) ||
      (asset.public_url ?? "").toLowerCase().includes(term) ||
      (asset.format ?? "").toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredLibrary.length / pageSize);
  const paginatedLibrary = filteredLibrary.slice((currentPage - 1) * pageSize, currentPage * pageSize);


  async function handleUpload(file: File) {
    if (!file) return;

    const allowedTypes = [
      "image/jpeg", "image/png", "image/webp", "image/avif",
      "image/gif", "image/svg+xml", "video/mp4", "video/webm",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError(`Định dạng không hỗ trợ: ${file.type}. Chỉ nhận JPEG, PNG, WebP, AVIF, GIF, SVG, MP4, WebM.`);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("File quá lớn. Tối đa 50MB.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError("");
    setSuccess(null);

    try {
      // 1. Get signed upload params
      const signRes = await fetch("/api/admin/cloudinary-sign", { method: "POST" });
      if (!signRes.ok) {
        const errData = await signRes.json().catch(() => ({}));
        throw new Error(errData.error || "Không thể lấy chữ ký upload");
      }
      const { signature, timestamp, folder, apiKey, cloudName } = await signRes.json();

      // 2. Upload to Cloudinary via XHR for progress tracking
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

      const cloudinaryResult = await new Promise<{
        public_id: string;
        secure_url: string;
        format: string;
        bytes: number;
        width?: number;
        height?: number;
        original_filename?: string;
        resource_type?: string;
      }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 80));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            try {
              const errData = JSON.parse(xhr.responseText);
              reject(new Error(errData.error?.message || "Upload thất bại"));
            } catch {
              reject(new Error("Upload thất bại"));
            }
          }
        };
        xhr.onerror = () => reject(new Error("Lỗi mạng khi upload"));
        xhr.send(formData);
      });

      setProgress(85);

      // 3. Persist media_assets row
      const persistRes = await fetch("/api/admin/media/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_id: cloudinaryResult.public_id,
          secure_url: cloudinaryResult.secure_url,
          format: cloudinaryResult.format,
          bytes: cloudinaryResult.bytes,
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
          original_filename: cloudinaryResult.original_filename,
          resource_type: cloudinaryResult.resource_type,
        }),
      });

      if (!persistRes.ok) {
        const errData = await persistRes.json().catch(() => ({}));
        throw new Error(errData.error || "Không thể lưu vào cơ sở dữ liệu");
      }

      const persistedAsset = await persistRes.json();
      setProgress(100);
      setSuccess({ url: persistedAsset.public_url, id: persistedAsset.id });
      loadLibrary(); // Refresh library
    } catch (err) {
      setError(String(err instanceof Error ? err.message : err));
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    // Reset input
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }

  return (
    <div className="space-y-5">
      {/* Upload Zone */}
      <div
        className={`surface-soft flex min-h-60 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? "border-primary bg-primary/5" : "border-slate-300 hover:border-primary/50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <UploadCloud className={`size-12 ${dragging ? "text-primary" : "text-slate-400"}`} />
        <div>
          <h3 className="font-heading text-lg font-semibold text-primary">
            {dragging ? "Thả file vào đây" : "Kéo thả ảnh/video hoặc chọn file"}
          </h3>
          <p className="mt-1.5 text-sm text-secondary">
            JPEG, PNG, WebP, AVIF, GIF, SVG • MP4, WebM • Tối đa 50MB
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          id="media-upload-input"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml,video/mp4,video/webm"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <label
          htmlFor="media-upload-input"
          className="button-pd cursor-pointer"
        >
          {uploading ? (
            <><Loader2 className="size-4 animate-spin" />Đang upload...</>
          ) : (
            "Chọn file"
          )}
        </label>

        {/* Progress bar */}
        {uploading && (
          <div className="w-full max-w-xs">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-center text-xs text-secondary">{progress}%</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm font-semibold text-error">{error}</p>
        )}

        {/* Success */}
        {success && (
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={success.url} alt="Uploaded" className="h-12 w-12 rounded object-cover" />
            <div className="text-left">
              <p className="text-xs font-bold text-green-700">Upload thành công!</p>
              <p className="text-[10px] text-green-600 break-all">{success.url}</p>
            </div>
          </div>
        )}
      </div>

      {/* Library */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-3">
          <h3 className="text-sm font-bold text-slate-700">
            Thư viện media ({filteredLibrary.length} / {library.length})
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Tìm theo tên file, định dạng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 max-w-xs"
            />
            <button
              type="button"
              className="text-xs text-slate-400 hover:text-primary whitespace-nowrap"
              onClick={loadLibrary}
              disabled={libLoading}
            >
              {libLoading ? "Đang tải..." : "Làm mới"}
            </button>
          </div>
        </div>
        {filteredLibrary.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            {libLoading ? "Đang tải thư viện..." : "Không tìm thấy file nào khớp."}
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
              {paginatedLibrary.map((asset) => (
                <div
                  key={asset.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100 cursor-pointer hover:border-primary transition"
                  onClick={() => {
                    navigator.clipboard?.writeText(asset.public_url).catch(() => null);
                  }}
                  title={`Nhấn để copy URL: ${asset.public_url}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.public_url}
                    alt=""
                    className="h-full w-full object-cover transition group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation(); // prevent copying URL
                      if (confirm("Bạn có chắc chắn muốn xóa tệp này vĩnh viễn?")) {
                        try {
                          const res = await fetch(`/api/admin/media/${asset.id}`, {
                            method: "DELETE",
                          });
                          if (res.ok) {
                            loadLibrary();
                          } else {
                            const err = await res.json().catch(() => ({}));
                            alert("Lỗi khi xóa: " + (err.error || "Không xác định"));
                          }
                        } catch (err) {
                          alert("Lỗi kết nối khi xóa tệp: " + String(err));
                        }
                      }
                    }}
                    className="absolute right-1 top-1 z-10 hidden rounded bg-red-600 p-1 text-white hover:bg-red-700 group-hover:block transition shadow-sm"
                    title="Xóa tệp"
                  >
                    <Trash2 className="size-3" />
                  </button>

                  <div className="absolute inset-0 flex items-end bg-black/0 opacity-0 transition group-hover:opacity-100 group-hover:bg-black/30">
                    <span className="w-full bg-black/60 px-1 py-0.5 text-center text-[9px] font-bold text-white">Copy URL</span>
                  </div>
                </div>
              ))}
            </div>
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/** MediaPicker — inline image picker/uploader for use in admin forms. */
export function MediaPicker({
  value,
  onChange,
  label = "Chọn ảnh",
}: {
  value?: string;
  onChange: (url: string, mediaId?: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [library, setLibrary] = useState<Array<{ id: string; public_url: string }>>([]);
  const [libLoaded, setLibLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function loadLibrary(force = false) {
    if (libLoaded && !force) return;
    const res = await fetch("/api/admin/media/list").catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      setLibrary(data.assets ?? []);
      setLibLoaded(true);
    }
  }

  async function handleUpload(file: File) {
    if (!file) return;
    const allowedTypes = [
      "image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      setUploadError(`Định dạng không hỗ trợ: ${file.type}`);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError("File quá lớn. Tối đa 50MB.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setUploadError("");

    try {
      const signRes = await fetch("/api/admin/cloudinary-sign", { method: "POST" });
      if (!signRes.ok) throw new Error("Không thể lấy chữ ký upload");
      const { signature, timestamp, folder, apiKey, cloudName } = await signRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
      const cloudRes = await new Promise<{
        public_id: string; secure_url: string; format: string;
        bytes: number; width?: number; height?: number; original_filename?: string; resource_type?: string;
      }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 80));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
          else reject(new Error("Upload thất bại"));
        };
        xhr.onerror = () => reject(new Error("Lỗi mạng"));
        xhr.send(formData);
      });

      setProgress(85);
      const persistRes = await fetch("/api/admin/media/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_id: cloudRes.public_id,
          secure_url: cloudRes.secure_url,
          format: cloudRes.format,
          bytes: cloudRes.bytes,
          width: cloudRes.width,
          height: cloudRes.height,
          original_filename: cloudRes.original_filename,
          resource_type: cloudRes.resource_type,
        }),
      });
      if (!persistRes.ok) throw new Error("Không thể lưu vào cơ sở dữ liệu");
      const asset = await persistRes.json();
      setProgress(100);
      onChange(asset.public_url, asset.id);
      setLibLoaded(false); // invalidate library cache
      setOpen(false);
    } catch (err) {
      setUploadError(String(err instanceof Error ? err.message : err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      {/* Trigger */}
      <div className="space-y-2">
        {value && (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Ảnh đã chọn"
              className="h-32 w-full rounded-lg border border-slate-200 object-cover"
            />
          </div>
        )}
        <button
          type="button"
          className="button-pd-outline flex w-full items-center justify-center gap-2 text-sm"
          onClick={() => { setOpen(true); loadLibrary(); }}
        >
          <ImageUp className="size-4" />
          {value ? "Đổi ảnh" : label}
        </button>
        {value && (
          <button
            type="button"
            className="w-full text-center text-xs text-slate-400 hover:text-error transition"
            onClick={() => onChange("", undefined)}
          >
            Xóa ảnh
          </button>
        )}
      </div>

      {/* Dialog */}
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
              <h2 className="font-heading text-lg font-semibold">Chọn ảnh</h2>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-700"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Upload new */}
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Upload ảnh mới</p>
                <input
                  ref={inputRef}
                  type="file"
                  className="sr-only"
                  id="media-picker-input"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                  disabled={uploading}
                />
                <label
                  htmlFor="media-picker-input"
                  className="button-pd-outline cursor-pointer inline-flex items-center gap-2"
                >
                  <UploadCloud className="size-4" />
                  {uploading ? "Đang upload..." : "Chọn file từ máy tính"}
                </label>
                {uploading && (
                  <div className="mt-2 h-2 rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
                {uploadError && <p className="mt-2 text-xs text-error font-semibold">{uploadError}</p>}
              </div>

              {/* Library */}
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Thư viện ({library.length})</p>
                {library.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-400">Chưa có file nào trong thư viện.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                    {library.map((asset) => (
                      <div
                        key={asset.id}
                        role="button"
                        tabIndex={0}
                        className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition cursor-pointer ${
                          value === asset.public_url
                            ? "border-primary"
                            : "border-slate-200 hover:border-primary"
                        }`}
                        onClick={() => {
                          onChange(asset.public_url, asset.id);
                          setOpen(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            onChange(asset.public_url, asset.id);
                            setOpen(false);
                          }
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={asset.public_url}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation(); // prevent selecting the image
                            if (confirm("Bạn có chắc chắn muốn xóa tệp này vĩnh viễn?")) {
                              try {
                                const res = await fetch(`/api/admin/media/${asset.id}`, {
                                  method: "DELETE",
                                });
                                if (res.ok) {
                                  loadLibrary(true);
                                } else {
                                  const err = await res.json().catch(() => ({}));
                                  alert("Lỗi khi xóa: " + (err.error || "Không xác định"));
                                }
                              } catch (err) {
                                alert("Lỗi kết nối khi xóa tệp: " + String(err));
                              }
                            }
                          }}
                          className="absolute right-1 top-1 z-10 hidden rounded bg-red-600 p-1 text-white hover:bg-red-700 group-hover:block transition shadow-sm"
                          title="Xóa tệp"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

