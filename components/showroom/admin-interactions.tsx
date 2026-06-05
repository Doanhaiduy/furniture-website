"use client";

import { useState } from "react";
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
  X,
} from "lucide-react";
import { PremiumSelect } from "./premium-select";

export function PublishWorkflow() {
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [confirm, setConfirm] = useState<"publish" | "archive" | null>(null);
  const [feedback, setFeedback] = useState("Bản nháp đang chờ lưu.");

  return (
    <div className="card-pd interactive-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="label-pd">Trạng thái xuất bản</p>
          <p className="mt-2 font-heading text-xl font-semibold text-primary">
            {status === "published" ? "Đã đăng" : status === "archived" ? "Đã lưu trữ" : "Bản nháp"}
          </p>
        </div>
        <StatusPill status={status} />
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button className="button-pd" type="button" onClick={() => setConfirm("publish")}>
          <Rocket className="size-4" />
          Xuất bản
        </button>
        <button className="button-pd-outline" type="button" onClick={() => setConfirm("archive")}>
          <Archive className="size-4" />
          Lưu trữ
        </button>
        <button
          className="button-pd-outline"
          type="button"
          onClick={() => {
            setStatus("draft");
            setFeedback("Đã lưu nháp trong phiên demo.");
          }}
        >
          <Save className="size-4" />
          Lưu nháp
        </button>
      </div>
      <p aria-live="polite" className="mt-4 rounded-lg bg-surface-container-low px-3 py-2 text-sm font-semibold text-secondary">
        {feedback}
      </p>

      {confirm ? (
        <div className="animate-in fade-in fixed inset-0 z-50 grid place-items-center bg-black/35 p-4 backdrop-blur-sm duration-200 motion-reduce:animate-none">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="publish-confirm-title"
            className="animate-in fade-in zoom-in-95 slide-in-from-bottom-2 w-full max-w-md rounded-xl bg-white p-5 shadow-[0_28px_80px_rgba(7,30,39,0.24)] duration-300 motion-reduce:animate-none"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="publish-confirm-title" className="font-heading text-xl font-semibold text-primary">
                  {confirm === "publish" ? "Xác nhận xuất bản" : "Xác nhận lưu trữ"}
                </h3>
                <p className="mt-2 text-sm leading-6 text-secondary">
                  {confirm === "publish"
                    ? "Nội dung sẽ hiển thị công khai nếu đủ dữ liệu song ngữ và SEO."
                    : "Nội dung sẽ biến mất khỏi public list và sitemap."}
                </p>
              </div>
              <button
                aria-label="Dong hop thoai xac nhan"
                className="rounded-md border border-outline-variant/50 p-2 transition hover:border-primary/35 hover:bg-surface-container"
                type="button"
                onClick={() => setConfirm(null)}
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="button-pd-outline" type="button" onClick={() => setConfirm(null)}>
                Hủy
              </button>
              <button
                className="button-pd"
                type="button"
                onClick={() => {
                  setStatus(confirm === "publish" ? "published" : "archived");
                  setFeedback(confirm === "publish" ? "Đã chuyển sang trạng thái xuất bản." : "Đã chuyển sang trạng thái lưu trữ.");
                  setConfirm(null);
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function QuoteStatusUpdater() {
  const [status, setStatus] = useState("new");

  return (
    <div className="surface-soft p-4">
      <label className="grid gap-2">
        <span className="label-pd">Cập nhật trạng thái quote</span>
        <PremiumSelect
          value={status}
          onValueChange={setStatus}
          ariaLabel="Cập nhật trạng thái quote"
          placeholder="Trạng thái quote"
          tone="admin"
          options={[
            { value: "new", label: "Chưa xử lý" },
            { value: "contacted", label: "Đang tư vấn" },
            { value: "qualified", label: "Đủ điều kiện" },
            { value: "closed", label: "Hoàn thành" },
            { value: "spam", label: "Spam" },
          ]}
        />
      </label>
      <p className="field-feedback mt-3 text-sm text-secondary">
        Trạng thái hiện tại: <strong>{status}</strong>
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
        <h3 className="font-heading text-lg font-semibold">AI hỗ trợ Content & SEO</h3>
      </div>
      <label className="mt-5 grid gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">
          Brief / chủ đề
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
            <p className="text-sm font-semibold">Đề xuất Meta Description</p>
            <p className="mt-2 text-sm italic text-white/80">
              Khám phá cách chọn sofa cân đối kích thước, chất liệu và màu sắc cho phòng khách nhỏ.
            </p>
            <button
              className="mt-4 min-h-10 rounded-xl bg-white px-3 py-2 text-sm font-bold text-[#15172b] transition hover:-translate-y-0.5 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              type="button"
              onClick={() => setAccepted(true)}
            >
              <CheckCircle2 className="mr-1 inline size-4" />
              {accepted ? "Đã chèn" : "Chèn vào editor"}
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
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "archived"
        ? "bg-slate-100 text-slate-600 border-slate-200"
        : "bg-amber-50 text-amber-700 border-amber-200";

  const label =
    status === "published" ? "Đã đăng" : status === "archived" ? "Lưu trữ" : "Nháp";

  return (
    <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition-colors ${className}`}>
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
        {(["VI", "EN"] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={locale === item}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/25 ${
              locale === item
                ? "bg-[#8b5cf6] text-white shadow-[0_10px_22px_rgba(139,92,246,0.16)]"
                : "text-outline hover:bg-[#f4f6fb] hover:text-[#15172b]"
            }`}
            onClick={() => setLocale(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs font-semibold text-secondary">Đang chỉnh bản {locale}.</p>
    </div>
  );
}

export function RichTextEditorMock({ defaultValue }: { defaultValue: string }) {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [imageInserted, setImageInserted] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#dfe6f1] bg-white shadow-[0_10px_24px_rgba(21,23,43,0.035),inset_0_1px_0_rgba(255,255,255,0.86)]">
      <div className="flex gap-2 border-b border-[#e4e9f2] bg-[#f6f8fb] px-3 py-2">
        <button
          type="button"
          aria-label="Bold"
          aria-pressed={bold}
          className={`rounded-lg p-2 font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/25 ${bold ? "bg-[#8b5cf6] text-white shadow-[0_8px_18px_rgba(139,92,246,0.16)]" : "text-[#686d82] hover:bg-white hover:text-[#15172b]"}`}
          onClick={() => setBold((value) => !value)}
        >
          B
        </button>
        <button
          type="button"
          aria-label="Italic"
          aria-pressed={italic}
          className={`rounded-lg p-2 italic transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/25 ${italic ? "bg-[#8b5cf6] text-white shadow-[0_8px_18px_rgba(139,92,246,0.16)]" : "text-[#686d82] hover:bg-white hover:text-[#15172b]"}`}
          onClick={() => setItalic((value) => !value)}
        >
          I
        </button>
        <button
          type="button"
          aria-pressed={imageInserted}
          aria-label="Chèn ảnh"
          className={`rounded-lg p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/25 ${imageInserted ? "bg-[#8b5cf6] text-white shadow-[0_8px_18px_rgba(139,92,246,0.16)]" : "text-[#686d82] hover:bg-white hover:text-[#15172b]"}`}
          onClick={() => setImageInserted((value) => !value)}
        >
          <ImageUp className="size-4" />
        </button>
      </div>
      {imageInserted ? (
        <p className="border-b border-[#e4e9f2] bg-[#f8fafc] px-4 py-2 text-xs font-semibold text-secondary">
          Đã thêm placeholder ảnh vào nội dung nháp.
        </p>
      ) : null}
      <textarea
        className={`min-h-48 w-full resize-y bg-white p-4 text-sm leading-7 text-[#15172b] outline-none ${bold ? "font-semibold" : ""} ${italic ? "italic" : ""}`}
        defaultValue={defaultValue}
      />
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
        <p className="mt-2 text-sm text-secondary">JPEG, PNG, WebP, AVIF hoặc MP4/WebM theo context.</p>
        <button className="button-pd mt-5" type="button" onClick={() => setStatus("selected")}>
          Chọn file
        </button>
        <p className="mt-4 text-sm font-semibold text-secondary">
          {status === "selected" ? "Đã chọn demo-image.webp. Sẵn sàng kiểm tra metadata." : "Chưa có file được chọn."}
        </p>
      </div>
    </div>
  );
}
