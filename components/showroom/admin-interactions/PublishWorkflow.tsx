"use client";

import { useState } from "react";

// Tiptap WYSIWYG

import {
  Archive,
  Rocket,
  Save,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


import { StatusPill } from "./StatusPill";
export function PublishWorkflow({
  status: propStatus,
  onStatusChange,
  errors = [],
  onSaveDraft,
  onPublish,
  onArchive,
  canArchive = true,
}: {
  status?: "draft" | "published" | "archived";
  onStatusChange?: (status: "draft" | "published" | "archived") => void;
  errors?: string[];
  onSaveDraft?: () => void;
  onPublish?: () => void;
  onArchive?: () => void;
  canArchive?: boolean;
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
          description: "Nội dung chỉ hiển thị công khai sau khi hoàn tất kiểm tra nội dung song ngữ, hình ảnh và SEO.",
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
        {canArchive && (
          <button data-testid="publish-workflow-archive" className="button-pd-outline" type="button" onClick={() => setConfirm("archive")}>
            <Archive className="size-4" />
            Lưu trữ
          </button>
        )}
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
                // Do NOT flip the status optimistically — the status pill must
                // reflect the ACTUAL saved result. handleSave updates the status
                // only after the server confirms success; on failure it stays put.
                setFeedback("Đang lưu…");
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
