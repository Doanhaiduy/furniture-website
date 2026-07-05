"use client";

import { useState } from "react";
import {
  Bot,
  Save,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { PremiumSelect } from "../premium-select";








import {
  WorkflowIntro,
  ReadinessPanel,
} from "../admin-workflows";

export function AiAssistantWorkspace() {
  const [task, setTask] = useState("translate");
  const [state, setState] = useState<"idle" | "loading" | "result" | "error">("idle");
  const [inserted, setInserted] = useState(false);
  const [inputText, setInputText] = useState("Sofa go oc cho boc ni, phu hop phong khach can ho cao cap, can noi bat vat lieu, kich thuoc va loi moi nhan bao gia.");
  const [resultText, setResultText] = useState("");
  const [errorText, setErrorText] = useState("");

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setState("loading");
    setInserted(false);
    setErrorText("");
    try {
      const res = await fetch("/api/admin/ai/generate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task,
          inputText,
          targetLocale: task === "translate" ? "en" : "vi",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResultText(data.text);
        setState("result");
      } else {
        setErrorText(data.error || "Có lỗi xảy ra từ API dịch vụ AI.");
        setState("error");
      }
    } catch (err) {
      setErrorText("Không thể kết nối đến máy chủ.");
      setState("error");
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="surface-soft p-4">
        <WorkflowIntro
          icon={Bot}
          title="Trợ lý AI chỉ tạo bản nháp"
          description="Dùng AI để tạo nháp bản dịch, SEO và dàn ý trong nội dung phù hợp. Trợ lý không xuất bản, không đổi trạng thái và không đọc dữ liệu báo giá riêng tư."
        />
        <div className="mt-5 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="label-pd">Tác vụ vận hành</span>
              <PremiumSelect
                value={task}
                onValueChange={setTask}
                ariaLabel="Tác vụ vận hành"
                placeholder="Tác vụ vận hành"
                tone="admin"
                options={[
                  { value: "translate", label: "Dịch trường tiếng Việt sang tiếng Anh" },
                  { value: "seo", label: "Tạo nháp tiêu đề SEO và mô tả meta song ngữ" },
                  { value: "outline", label: "Tạo dàn ý bài viết từ tóm tắt sản phẩm" },
                ]}
              />
            </label>
            <label className="grid gap-2">
              <span className="label-pd">Loại nội dung đích</span>
              <PremiumSelect
                defaultValue="product"
                ariaLabel="Loại nội dung đích"
                placeholder="Loại nội dung đích"
                tone="admin"
                options={[
                  { value: "product", label: "Hồ sơ sản phẩm" },
                  { value: "blog", label: "Bài viết" },
                  { value: "homepage", label: "Khu vực trang chủ" },
                ]}
              />
            </label>
          </div>
          <label className="grid gap-2">
            <span className="label-pd">Nội dung gốc tiếng Việt</span>
            <textarea
              className="input-pd min-h-32"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <span className="text-xs text-[var(--admin-text-muted)]">
              Trợ lý này cố ý không sử dụng dữ liệu yêu cầu báo giá riêng tư.
            </span>
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              className="button-pd"
              type="button"
              onClick={handleGenerate}
              disabled={state === "loading"}
            >
              <WandSparkles className="size-4" />
              {state === "loading" ? "Đang tạo nháp..." : "Tạo bản nháp"}
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-[var(--radius-panel)] border border-[var(--admin-border)] bg-white p-4">
          {state === "idle" ? (
            <p className="text-sm text-[var(--admin-text-muted)]">
              Chọn tác vụ và tạo bản nháp. Kết quả giữ ở trạng thái chờ kiểm duyệt cho đến khi biên tập viên chấp nhận.
            </p>
          ) : null}
          {state === "loading" ? (
            <p className="field-feedback text-sm font-semibold text-[var(--admin-text)]">
              Đang tạo đề xuất bản nháp...
            </p>
          ) : null}
          {state === "result" ? (
            <div className="field-feedback">
              <p className="label-pd">Kết quả bản nháp</p>
              <p className="mt-2 rounded-[var(--radius-card)] bg-[var(--admin-bg-soft)] p-3 text-sm leading-6 text-[var(--admin-text)] whitespace-pre-wrap">
                {resultText}
              </p>
              <button
                className="button-pd mt-4"
                type="button"
                onClick={() => setInserted(true)}
              >
                <Save className="size-4" />
                {inserted ? "Đã chèn bản nháp để kiểm duyệt" : "Chèn vào bản nháp của trình soạn thảo"}
              </button>
            </div>
          ) : null}
          {state === "error" ? (
            <p className="field-feedback rounded-[var(--radius-card)] border border-error/25 bg-error-container p-3 text-sm text-on-error-container">
              {errorText || "Nhà cung cấp AI tạm thời không khả dụng. Nội dung hiện có không bị thay đổi."}
            </p>
          ) : null}
        </div>
      </section>

      <div className="space-y-5">
        <ReadinessPanel
          items={[
            { label: "Kết quả AI chỉ là bản nháp", state: "ready" },
            { label: "Bắt buộc kiểm duyệt thủ công trước khi xuất bản", state: "ready" },
            { label: "Không dùng ngữ cảnh yêu cầu báo giá riêng tư", state: "ready" },
            { label: "Chưa chốt mô hình AI cuối cùng và giới hạn chi phí", state: "warning" },
          ]}
        />
        <section className="surface-soft p-4">
          <h3 className="admin-section-title-pd">Vị trí chèn gợi ý trong CMS</h3>
          <div className="mt-4 grid gap-2">
            {["Tiêu đề và mô tả tóm tắt tiếng Anh của sản phẩm", "Tiêu đề SEO và mô tả meta của bài viết", "Bản nội dung thay thế cho hero trang chủ"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-[var(--radius-card)] bg-white px-3 py-2 text-sm font-semibold text-[var(--admin-text-muted)]">
                <Sparkles className="size-4 text-[var(--admin-accent)]" />
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
