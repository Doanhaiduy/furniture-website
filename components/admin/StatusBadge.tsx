import { cn } from "@/lib/utils";

type StatusType =
  | "draft"
  | "published"
  | "archived"
  | "new"
  | "contacted"
  | "qualified"
  | "closed"
  | "spam"
  | "cancelled"
  | "active"
  | "inactive"
  | string;

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  // publish_status
  published: {
    label: "Đã xuất bản",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  draft: {
    label: "Bản nháp",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  archived: {
    label: "Đã lưu trữ",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
  // quote_status
  new: {
    label: "Chờ xử lý",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  contacted: {
    label: "Đã liên hệ",
    className: "bg-teal-50 text-teal-700 border-teal-200",
  },
  qualified: {
    label: "Đủ điều kiện",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  closed: {
    label: "Đã hoàn tất",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  spam: {
    label: "Thư rác",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-red-50/50 text-red-600 border-red-100",
  },
  // boolean active/inactive
  active: {
    label: "Hoạt động",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  inactive: {
    label: "Không hoạt động",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: StatusType;
  className?: string;
}) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export function getStatusLabel(status: string): string {
  return STATUS_CONFIG[status]?.label ?? status;
}

export function getStatusClass(status: string): string {
  return STATUS_CONFIG[status]?.className ?? "bg-slate-100 text-slate-600 border-slate-200";
}
