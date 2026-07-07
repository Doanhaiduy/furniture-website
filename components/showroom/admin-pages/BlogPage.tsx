"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/providers/toast-provider";
import Link from "next/link";
import {
  Pencil,
  NewspaperIcon,
  Trash2,
  ExternalLink,
  Check,
  Calendar,
  Star,
} from "lucide-react";


import {
  type AdminBlogPost,
} from "@/lib/supabase/admin-queries";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  deleteAdminBlogPost,
  updateBlogPostFeatured,
  updateBlogPostStatus,
} from "@/lib/supabase/mutations";
import {
  StatusPill,
} from "../admin-interactions";
import {
  AdminRouteDialog,
  ContentEditorForm,
} from "../admin-workflows";
import { RemoteImage } from "../remote-image";
import { DataView } from "@/components/admin/DataView";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { type FilterConfig } from "@/components/admin/FilterBar";



export interface Brand {
  id: string;
  name: { vi: string; en: string };
  origin?: string;
  logo_url?: string;
  status: "draft" | "published" | "archived";
  sort_order: number;
  slug?: string;
}

import { useSearchParams, useRouter } from "next/navigation";
import {
  AdminPageHeader
} from "./SharedComponents";

export function BlogPage({ createMode, posts = [], total = 0 }: { createMode?: boolean; posts?: AdminBlogPost[]; total?: number }) {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");
  const { toast } = useToast();
  const router = useRouter();

  const [blogCategoryOptions, setBlogCategoryOptions] = useState<{ value: string; label: string }[]>([]);
  const [blogToDelete, setBlogToDelete] = useState<AdminBlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/filter-options?type=blog-categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.options) setBlogCategoryOptions(data.options);
      })
      .catch((err) => console.error("Error loading blog categories:", err));
  }, []);

  const STATUS_OPTIONS = [
    { value: "draft", label: "Bản nháp" },
    { value: "published", label: "Đã xuất bản" },
    { value: "archived", label: "Lưu trữ" },
  ];

  const filterConfigs: FilterConfig[] = [
    { type: "select", key: "status", label: "Trạng thái", options: STATUS_OPTIONS, placeholder: "Tất cả" },
    { type: "select", key: "categoryId", label: "Danh mục", options: blogCategoryOptions, placeholder: "Tất cả danh mục" },
    { type: "boolean", key: "featured", label: "Nổi bật" },
    { type: "date", key: "dateFrom", label: "Từ ngày" },
    { type: "date", key: "dateTo", label: "Đến ngày" },
  ];

  function BlogStatusPopover({ post, onStatusChange }: { post: AdminBlogPost; onStatusChange: (status: string) => void }) {
    const [open, setOpen] = useState(false);
    
    const statusOptions = [
      { value: "draft", label: "Bản nháp", description: "Không hiển thị trên site", color: "bg-slate-400" },
      { value: "published", label: "Đã xuất bản", description: "Hiển thị công khai", color: "bg-emerald-500" },
      { value: "archived", label: "Lưu trữ", description: "Ẩn nhưng bảo toàn dữ liệu", color: "bg-amber-500" }
    ];

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="cursor-pointer focus:outline-none select-none hover:opacity-80 active:scale-95 transition-all">
            <StatusBadge status={post.status} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-1.5 bg-white border border-slate-200 shadow-lg rounded-xl z-[200] animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="flex flex-col gap-1">
            <span className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
              Chuyển trạng thái
            </span>
            {statusOptions.map((opt) => {
              const isActive = post.status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-all ${
                    isActive 
                      ? "bg-slate-50 text-slate-900" 
                      : "hover:bg-slate-50/80 text-slate-600 hover:text-slate-900"
                  }`}
                  onClick={async () => {
                    if (!isActive) {
                      onStatusChange(opt.value);
                    }
                    setOpen(false);
                  }}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      <span className={`size-1.5 rounded-full ${opt.color}`} />
                      {opt.label}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">
                      {opt.description}
                    </span>
                  </div>
                  {isActive && (
                    <Check className="size-3.5 text-emerald-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Quy trình bài viết"
        description="Vận hành biên tập bài viết song ngữ, danh mục, thẻ, ảnh bìa, tác giả, trạng thái xuất bản và SEO."
        actionHref="/admin/blog?create=1"
        actionLabel="Thêm bài viết"
      />

      <DataView
        data={posts}
        totalCount={total}
        filterConfigs={filterConfigs}
        searchPlaceholder="Tiêu đề bài viết, trích dẫn..."
        defaultSort="published_at"
        defaultDir="desc"
        defaultLimit={20}
        columns={[
          { key: "title", label: "Bài viết", width: "1fr", sortable: false },
          { key: "category", label: "Danh mục", width: "120px", sortable: false },
          { key: "author", label: "Tác giả", width: "120px", sortable: false },
          { key: "status", label: "Trạng thái", width: "100px", sortable: true },
          { key: "featured", label: "Nổi bật", width: "80px", sortable: true },
          { key: "published_at", label: "Ngày xuất bản", width: "110px", sortable: true },
          { key: "actions", label: "Thao tác", width: "110px", sortable: false },
        ]}
        renderListRow={(item) => {
          const post = item as AdminBlogPost;
          return (
            <div key={post.id} className="grid items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-50" style={{ gridTemplateColumns: "1fr 120px 120px 100px 80px 110px 110px" }}>
              <div className="flex gap-3 min-w-0">
                {(post.cover_media as any)?.url ? (
                  <RemoteImage src={(post.cover_media as any).url} alt={post.title} className="size-10 rounded-lg bg-slate-100 shrink-0 relative" />
                ) : (
                  <div className="size-10 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center"><NewspaperIcon className="size-4 text-slate-300" /></div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{post.title}</p>
                  <p className="text-xs text-slate-400 truncate">{post.excerpt}</p>
                </div>
              </div>
              <span className="text-xs text-slate-500 truncate">{post.category_name}</span>
              <span className="text-xs text-slate-500 truncate">{post.author_name || "—"}</span>
              <BlogStatusPopover
                post={post}
                onStatusChange={async (newStatus) => {
                  const res = await updateBlogPostStatus(post.id, newStatus);
                  if (res.success) {
                    toast.success("Cập nhật trạng thái thành công!");
                    router.refresh();
                  } else {
                    toast.error("Cập nhật thất bại: " + (res.error ?? "Không rõ"));
                  }
                }}
              />
              <div className="flex items-center">
                <Switch
                  checked={post.featured}
                  onCheckedChange={async (checked) => {
                    const res = await updateBlogPostFeatured(post.id, checked);
                    if (res.success) {
                      toast.success("Cập nhật nổi bật thành công!");
                      router.refresh();
                    } else {
                      toast.error("Cập nhật thất bại: " + (res.error ?? "Không rõ"));
                    }
                  }}
                />
              </div>
              <span className="text-xs text-slate-400" suppressHydrationWarning>{post.published_at ? new Date(post.published_at).toLocaleDateString("vi-VN") : "Chưa xuất bản"}</span>
              <div className="flex items-center gap-1.5">
                {post.status === "published" ? (
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Xem trên website"
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                ) : (
                  <span className="p-1.5 opacity-30 cursor-not-allowed text-slate-300">
                    <ExternalLink className="size-4" />
                  </span>
                )}
                <Link
                  href={`/admin/blog?edit=${post.slug}`}
                  title="Chỉnh sửa"
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
                >
                  <Pencil className="size-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setBlogToDelete(post)}
                  title="Xóa"
                  className="p-1.5 hover:bg-slate-100 rounded text-destructive hover:bg-red-50 transition"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          );
        }}
        renderGridCard={(item) => {
          const post = item as AdminBlogPost;
          return (
            <article key={post.id} className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full">
              {/* Card Cover Image */}
              <div className="relative aspect-video w-full bg-slate-50 overflow-hidden border-b border-slate-100">
                {(post.cover_media as any)?.url ? (
                  <RemoteImage src={(post.cover_media as any).url} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50">
                    <NewspaperIcon className="size-10 text-slate-300" />
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <StatusBadge status={post.status} />
                </div>

                {/* Featured Badge */}
                {post.featured && (
                  <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shadow-sm">
                    <Star className="size-3 fill-white" />
                    <span>Nổi bật</span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider w-fit block">
                    {post.category_name}
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {post.title}
                  </h4>
                </div>

                {/* Meta description / date */}
                <div className="pt-2 border-t border-slate-50 flex items-center gap-1 text-[11px] text-slate-400 font-semibold" suppressHydrationWarning>
                  <Calendar className="size-3.5 text-slate-400" />
                  <span>{post.published_at ? new Date(post.published_at).toLocaleDateString("vi-VN") : "Chưa xuất bản"}</span>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="p-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-1.5">
                <Link
                  href={`/admin/blog?edit=${post.slug}`}
                  title="Chỉnh sửa bài viết"
                  className="flex-1 min-h-8 rounded-lg bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold text-xs flex items-center justify-center gap-1 transition"
                >
                  <Pencil className="size-3.5" />
                  Sửa
                </Link>
                {post.status === "published" && (
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Xem trên website"
                    className="size-8 rounded-lg bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center transition shrink-0"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setBlogToDelete(post)}
                  title="Xóa bài viết"
                  className="size-8 rounded-lg bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center transition shrink-0"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </article>
          );
        }}
        emptyMessage="Chưa có bài viết nào được tạo."
        emptyIcon={<NewspaperIcon className="size-10 text-slate-200" />}
      />

      {/* Add dialog */}
      <AdminRouteDialog
        open={Boolean(createMode)}
        returnHref="/admin/blog"
        title="Thêm bài viết"
        description="Tạo bài viết ưu tiên tiếng Việt và chỉ bật tiếng Anh khi cần lưu bản dịch."
        size="full"
      >
        <ContentEditorForm kind="blog" mode="create" />
      </AdminRouteDialog>

      {/* Edit dialog */}
      <AdminRouteDialog
        open={Boolean(editSlug)}
        returnHref="/admin/blog"
        title="Hiệu chỉnh bài viết"
        description="Chỉnh sửa nội dung chi tiết bài viết, cấu hình song ngữ, SEO và trạng thái xuất bản."
        size="full"
      >
        <ContentEditorForm kind="blog" mode="edit" idOrSlug={editSlug || undefined} />
      </AdminRouteDialog>

      <AlertDialog open={blogToDelete !== null} onOpenChange={(open) => { if (!open) setBlogToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bài viết</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa bài viết <strong>{blogToDelete?.title}</strong>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (!blogToDelete) return;
              setIsDeleting(true);
              try {
                const res = await deleteAdminBlogPost(blogToDelete.id);
                if (res.success) {
                  toast.success("Xóa bài viết thành công!");
                  router.refresh();
                } else {
                  toast.error("Xóa thất bại: " + (res.error ?? "Không xác định"));
                }
              } catch (err) {
                toast.error("Đã xảy ra lỗi khi xóa: " + String(err));
              } finally {
                setIsDeleting(false);
                setBlogToDelete(null);
              }
            }} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BlogQueue({ posts = [] }: { posts?: AdminBlogPost[] }) {
  return (
    <section className="surface-soft p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start border-b pb-3 mb-4">
        <div>
          <p className="label-pd">Hàng đợi biên tập</p>
          <h2 className="admin-section-title-pd mt-2 text-lg">Bài viết cần kiểm duyệt</h2>
        </div>
      </div>
      {posts.length === 0 ? (
        <p className="p-8 text-center text-sm text-slate-400">Chưa có bài viết nào.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <article key={post.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">{post.category_name}</span>
                  <StatusPill status={post.status} />
                </div>
                <div className="flex gap-4">
                  {(post.cover_media as any)?.url ? (
                    <RemoteImage
                      src={(post.cover_media as any).url}
                      alt={post.title}
                      className="size-16 rounded-lg bg-slate-100 shrink-0 relative"
                    />
                  ) : (
                    <div className="size-16 rounded-lg bg-slate-100 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-800 text-sm line-clamp-2">{post.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-1" suppressHydrationWarning>{post.published_at ? new Date(post.published_at).toLocaleDateString("vi-VN") : "Chưa xuất bản"}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-500 line-clamp-2">{post.excerpt}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Link
                  href={`/admin/blog?edit=${post.slug}`}
                  className="admin-edit-action"
                >
                  <Pencil className="size-3" />
                  Chỉnh sửa
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

