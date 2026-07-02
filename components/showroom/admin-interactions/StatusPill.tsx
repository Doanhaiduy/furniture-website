"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/components/providers/toast-provider";

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
import { PremiumSelect } from "../premium-select";
import { Pagination } from "../admin-pages";


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

