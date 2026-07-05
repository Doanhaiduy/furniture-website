"use client";

"use client";

import { useState } from "react";

// Tiptap WYSIWYG

import {
  Bot,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  WandSparkles,
} from "lucide-react";


import { PremiumSelect } from "./premium-select";


export { MediaUploadPanel } from "./admin-interactions/MediaUploadPanel";
export { PublishWorkflow } from "./admin-interactions/PublishWorkflow";
export { RichTextEditorMock } from "./admin-interactions/RichTextEditorMock";
export { MediaPicker } from "./admin-interactions/MediaPicker";
export { StatusPill } from "./admin-interactions/StatusPill";
export { BilingualInput } from "./admin-interactions/BilingualInput";
export { BilingualTextarea } from "./admin-interactions/BilingualTextarea";
export { AdminSectionList } from "./admin-interactions/AdminSectionList";

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
            { value: "cancelled", label: "Đã hủy" },
            { value: "spam", label: "Thư rác" },
          ]}
        />
      </label>
      <p className="field-feedback mt-3 text-sm text-secondary">
        Trạng thái hiện tại: <strong>{status === "new" ? "Chưa xử lý" : status === "contacted" ? "Đang tư vấn" : status === "qualified" ? "Đủ điều kiện" : status === "closed" ? "Hoàn thành" : status === "cancelled" ? "Đã hủy" : "Thư rác"}</strong>
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

