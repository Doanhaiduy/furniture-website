"use client";


// Tiptap WYSIWYG







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

