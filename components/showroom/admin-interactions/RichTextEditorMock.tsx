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

