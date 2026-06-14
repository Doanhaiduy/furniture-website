"use client";

import { useState, useRef } from "react";
import {
  Archive,
  Bot,
  CheckCircle2,
  ImageUp,
  Loader2,
  RefreshCcw,
  Rocket,
  Save,
  UploadCloud,
  WandSparkles,
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
}: {
  defaultValue?: string;
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
}) {
  const [activeMode, setActiveMode] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Function to insert markdown wrappers around selection or at cursor
  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end);
    const replacement = before + selectedText + after;

    const newValue = text.substring(0, start) + replacement + text.substring(end);

    if (onChange) {
      onChange(newValue);
    } else {
      textarea.value = newValue;
    }

    // Restore focus and update selection range
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Safe and lightweight offline Markdown parser
  const renderMarkdownToHtml = (markdown: string): string => {
    if (!markdown) return "<p class='text-slate-400 italic'>Chưa có nội dung xem trước...</p>";

    // Basic HTML escaping for safety
    let html = markdown
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Bold (**text**)
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Italic (*text*)
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    // Headings
    html = html.replace(/^### (.*?)$/gm, "<h4 class='text-base font-bold text-slate-800 mt-4 mb-2'>$1</h4>");
    html = html.replace(/^## (.*?)$/gm, "<h3 class='text-lg font-bold text-slate-900 mt-5 mb-2'>$1</h3>");
    html = html.replace(/^# (.*?)$/gm, "<h2 class='text-xl font-bold text-slate-950 mt-6 mb-3'>$1</h2>");
    // Blockquotes (> text)
    html = html.replace(/^&gt; (.*?)$/gm, "<blockquote class='border-l-4 border-amber-500 pl-4 py-2 italic text-slate-600 my-4 bg-amber-50/20'>$1</blockquote>");
    // Bullet lists (- text)
    html = html.replace(/^- (.*?)$/gm, "<li class='list-disc ml-6 text-slate-700 my-1'>$1</li>");
    // Links ([text](url))
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' class='text-indigo-600 underline hover:text-indigo-800' target='_blank' rel='noopener noreferrer'>$1</a>");
    
    // Parse tables (| col1 | col2 |)
    const lines = html.split("\n");
    let inTable = false;
    let tableHtml = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("|") && line.endsWith("|")) {
        if (!inTable) {
          inTable = true;
          tableHtml += "<table class='min-w-full border-collapse border border-slate-200 my-4 text-sm'>";
        }
        const cells = line.split("|").map(c => c.trim()).filter((_, index, arr) => index > 0 && index < arr.length - 1);

        // Skip separator row (e.g. |---|---|)
        if (cells.every(c => c.startsWith("-"))) {
          continue;
        }

        tableHtml += "<tr class='border-b border-slate-200 hover:bg-slate-50'>";
        cells.forEach(c => {
          tableHtml += `<td class='border border-slate-200 px-3 py-2'>${c}</td>`;
        });
        tableHtml += "</tr>";
      } else {
        if (inTable) {
          inTable = false;
          tableHtml += "</table>";
          lines[i - 1] = tableHtml;
          tableHtml = "";
        }
      }
    }
    if (inTable) {
      tableHtml += "</table>";
      lines[lines.length - 1] = tableHtml;
    }

    html = lines.join("\n");
    html = html.replace(/\n/g, "<br />");

    return html;
  };

  const currentValue = value || "";

  return (
    <div className="surface-card overflow-hidden rounded-xl border border-[var(--admin-border)] shadow-sm">
      {/* Header controls */}
      <div className="flex items-center justify-between border-b border-[var(--admin-border)] bg-[var(--admin-bg-soft)] px-3 py-2">
        <div className="flex gap-1">
          <button
            type="button"
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeMode === "write"
                ? "bg-slate-900 text-white"
                : "bg-transparent text-slate-600 hover:bg-slate-100"
            }`}
            onClick={() => setActiveMode("write")}
          >
            Soạn thảo (Markdown)
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeMode === "preview"
                ? "bg-slate-900 text-white"
                : "bg-transparent text-slate-600 hover:bg-slate-100"
            }`}
            onClick={() => setActiveMode("preview")}
          >
            Xem trước nội dung
          </button>
        </div>

        <span className="text-[11px] font-semibold text-slate-400">
          {activeMode === "write" ? "Định dạng bằng mã Markdown" : "Chế độ xem trước HTML"}
        </span>
      </div>

      {activeMode === "write" ? (
        <>
          {/* Formatting Toolbar */}
          <div className="flex flex-wrap gap-1 border-b border-[var(--admin-border)] bg-slate-50/50 p-2">
            <button
              type="button"
              title="In đậm (Bold)"
              className="px-3 py-1.5 text-xs font-extrabold hover:bg-slate-200 rounded text-slate-700 min-w-8"
              onClick={() => insertMarkdown("**", "**")}
            >
              B
            </button>
            <button
              type="button"
              title="In nghiêng (Italic)"
              className="px-3 py-1.5 text-xs font-bold italic hover:bg-slate-200 rounded text-slate-700 min-w-8"
              onClick={() => insertMarkdown("*", "*")}
            >
              I
            </button>
            <div className="w-px h-5 bg-slate-200 self-center mx-1" />
            <button
              type="button"
              title="Tiêu đề lớn 2 (H2)"
              className="px-2.5 py-1.5 text-xs font-bold hover:bg-slate-200 rounded text-slate-700"
              onClick={() => insertMarkdown("\n## ", "\n")}
            >
              H2
            </button>
            <button
              type="button"
              title="Tiêu đề phụ 3 (H3)"
              className="px-2.5 py-1.5 text-xs font-bold hover:bg-slate-200 rounded text-slate-700"
              onClick={() => insertMarkdown("\n### ", "\n")}
            >
              H3
            </button>
            <div className="w-px h-5 bg-slate-200 self-center mx-1" />
            <button
              type="button"
              title="Danh sách (Bullet list)"
              className="px-2.5 py-1.5 text-xs hover:bg-slate-200 rounded text-slate-700 font-bold"
              onClick={() => insertMarkdown("\n- ", "\n")}
            >
              • Danh sách
            </button>
            <button
              type="button"
              title="Trích dẫn (Quote)"
              className="px-2.5 py-1.5 text-xs hover:bg-slate-200 rounded text-slate-700 font-bold"
              onClick={() => insertMarkdown("\n> ", "\n")}
            >
              ” Trích dẫn
            </button>
            <div className="w-px h-5 bg-slate-200 self-center mx-1" />
            <button
              type="button"
              title="Liên kết (Link)"
              className="px-2.5 py-1.5 text-xs hover:bg-slate-200 rounded text-slate-700 font-semibold"
              onClick={() => insertMarkdown("[Tên liên kết](", ")")}
            >
              🔗 Liên kết
            </button>
            <button
              type="button"
              title="Chèn ảnh (Image)"
              className="px-2.5 py-1.5 text-xs hover:bg-slate-200 rounded text-slate-700 flex items-center gap-1 font-semibold"
              onClick={() => insertMarkdown("![Chú thích ảnh](", ")")}
            >
              🖼️ Ảnh
            </button>
            <button
              type="button"
              title="Chèn bảng (Table)"
              className="px-2.5 py-1.5 text-xs hover:bg-slate-200 rounded text-slate-700 font-semibold"
              onClick={() => insertMarkdown("\n| Cột 1 | Cột 2 |\n|---|---|\n| Giá trị 1 | Giá trị 2 |\n")}
            >
              📊 Bảng
            </button>
          </div>

          <textarea
            ref={textareaRef}
            className="min-h-64 w-full resize-y bg-white p-4 text-sm leading-7 text-[var(--admin-text)] outline-none border-0 focus:ring-0"
            defaultValue={value === undefined ? defaultValue : undefined}
            value={value}
            onChange={onChange ? (event) => onChange(event.target.value) : undefined}
            placeholder={placeholder || "Nhập chi tiết nội dung bài viết..."}
          />
        </>
      ) : (
        <div
          className="min-h-64 w-full bg-white p-6 overflow-y-auto max-h-[500px] text-sm leading-7 text-slate-800"
          dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(currentValue) }}
        />
      )}
    </div>
  );
}

export function MediaUploadPanel() {
  const [status, setStatus] = useState<"idle" | "selected">("idle");

  return (
    <div className="surface-soft grid min-h-80 place-items-center p-8 text-center">
      <div>
        <UploadCloud className="mx-auto size-12 text-primary" />
        <h2 className="mt-4 font-heading text-xl font-semibold text-primary">Kéo thả ảnh/video</h2>
        <p className="mt-2 text-sm text-secondary">JPEG, PNG, WebP, AVIF hoặc MP4/WebM theo ngữ cảnh.</p>
        <button className="button-pd mt-5" type="button" onClick={() => setStatus("selected")}>
          Chọn file
        </button>
        <p className="mt-4 text-sm font-semibold text-secondary">
          {status === "selected" ? "Đã chọn demo-image.webp. Sẵn sàng kiểm tra siêu dữ liệu." : "Chưa có file được chọn."}
        </p>
      </div>
    </div>
  );
}
