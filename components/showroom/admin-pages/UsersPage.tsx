"use client";

import { useState } from "react";
import { ModalPortal } from "@/components/ui/modal-portal";
import { useToast } from "@/components/providers/toast-provider";
import {
  AlertTriangle,
  Lock,
  Pencil,
  Trash2,
  UserX,
  X,
} from "lucide-react";

import {
  type AdminUser,
} from "@/lib/supabase/admin-queries";

import {
  AdminRouteDialog,
  EntityCreateForm,
} from "../admin-workflows";
import { DataView } from "@/components/admin/DataView";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { type FilterConfig } from "@/components/admin/FilterBar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export interface Brand {
  id: string;
  name: { vi: string; en: string };
  origin?: string;
  logo_url?: string;
  status: "draft" | "published" | "archived";
  sort_order: number;
  slug?: string;
}

import { useRouter } from "next/navigation";
import {
  AdminPageHeader,
  getRelativeTimeString
} from "./SharedComponents";

export function UsersPage({
  createMode,
  profiles = [],
  total = 0,
}: {
  createMode?: boolean;
  profiles?: AdminUser[];
  total?: number;
}) {
  const { toast, showLoading, hideLoading, showAlert } = useToast();
  const router = useRouter();
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState("editor");
  const [editActive, setEditActive] = useState(true);
  const [editEmail, setEditEmail] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete user state
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset-password modal state
  const MIN_PASSWORD_LENGTH = 8;
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const startEdit = (user: AdminUser) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditActive(user.is_active);
    setEditEmail(user.email);
    setEditFullName(user.full_name || "");
  };

  const openResetPassword = (user: AdminUser) => {
    setResetUser(user);
    setNewPassword("");
    setConfirmPassword("");
    setResetError("");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUser) return;
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setResetError(`Mật khẩu phải có tối thiểu ${MIN_PASSWORD_LENGTH} ký tự.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setResetError("");
    setIsResetting(true);
    try {
      const res = await fetch("/api/admin/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resetUser.id, password: newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Đã đặt lại mật khẩu cho ${resetUser.email}.`);
        setResetUser(null);
      } else {
        setResetError(data.error || "Không thể đặt lại mật khẩu.");
      }
    } catch {
      setResetError("Lỗi kết nối tới máy chủ.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || isUpdating) return;
    setIsUpdating(true);
    showLoading("Đang cập nhật quyền thành viên...");
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id,
          email: editEmail,
          fullName: editFullName,
          role: editRole,
          isActive: editActive,
        }),
      });
      const data = await res.json();
      hideLoading();
      if (data.success) {
        showAlert("Thành công", "Cập nhật tài khoản thành công!", "success", () => {
          setEditingUser(null);
          router.refresh();
        });
      } else {
        showAlert("Thất bại", data.error || "Lỗi khi cập nhật tài khoản.", "error");
      }
    } catch {
      hideLoading();
      showAlert("Lỗi hệ thống", "Lỗi kết nối tới máy chủ.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser || isDeleting) return;
    setIsDeleting(true);
    showLoading("Đang xóa tài khoản...");
    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      hideLoading();
      if (data.success) {
        showAlert("Thành công", `Đã xóa tài khoản ${deletingUser.email} thành công!`, "success", () => {
          setDeletingUser(null);
          if (editingUser?.id === deletingUser.id) setEditingUser(null);
          router.refresh();
        });
      } else {
        showAlert("Không thể xóa", data.error || "Lỗi khi xóa tài khoản.", "error");
      }
    } catch {
      hideLoading();
      showAlert("Lỗi hệ thống", "Lỗi kết nối tới máy chủ.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const ROLE_OPTIONS = [
    { value: "admin", label: "Quản trị viên" },
    { value: "editor", label: "Biên tập viên" },
  ];

  const filterConfigs: FilterConfig[] = [
    { type: "select", key: "role", label: "Vai trò", options: ROLE_OPTIONS, placeholder: "Tất cả vai trò" },
    { type: "boolean", key: "isActive", label: "Hoạt động" },
    { type: "date", key: "dateFrom", label: "Từ ngày" },
    { type: "date", key: "dateTo", label: "Đến ngày" },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý người dùng và vai trò"
        description="Tạo tài khoản chỉ dành cho quản trị viên. Biên tập viên chỉ quản lý nội dung có thể xuất bản theo mô hình vai trò A."
        actionHref="/admin/users?create=1"
        actionLabel="Thêm người dùng"
      />

      <DataView
        data={profiles}
        totalCount={total}
        filterConfigs={filterConfigs}
        searchPlaceholder="Tên, email người dùng..."
        defaultSort="created_at"
        defaultDir="desc"
        defaultLimit={20}
        disableGrid={true}
        columns={[
          { key: "email", label: "Người dùng", width: "1.5fr", sortable: true },
          { key: "role", label: "Vai trò", width: "1.2fr", sortable: true },
          { key: "created_at", label: "Ngày tham gia", width: "1fr", sortable: true },
          { key: "last_login_at", label: "Đăng nhập cuối", width: "1.2fr", sortable: true },
          { key: "is_active", label: "Trạng thái", width: "100px", sortable: true },
          { key: "actions", label: "Thao tác", width: "110px", sortable: false },
        ]}
        renderListRow={(item) => {
          const profile = item as AdminUser;
          const roleLabel = profile.role === "admin" ? "Quản trị viên" : "Biên tập viên";
          const scope = profile.role === "admin"
            ? "Toàn quyền quản trị"
            : "Chỉ quản lý nội dung xuất bản";
          return (
            <div key={profile.id || profile.email} className="grid items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-50" style={{ gridTemplateColumns: "1.5fr 1.2fr 1fr 1.2fr 100px 110px" }}>
              <div>
                <p className="font-semibold text-slate-800 text-sm truncate">{profile.email}</p>
                {profile.full_name && <p className="text-xs text-slate-400 truncate">{profile.full_name}</p>}
              </div>
              <div>
                <span className="text-xs text-slate-600 font-semibold">{roleLabel}</span>
                <p className="text-[10px] text-slate-400">{scope}</p>
              </div>
              <span className="text-xs text-slate-500" suppressHydrationWarning>
                {profile.created_at ? new Date(profile.created_at).toLocaleDateString("vi-VN") : ""}
              </span>
              <span className="text-xs text-slate-500" suppressHydrationWarning>
                {getRelativeTimeString(profile.last_login_at)}
              </span>
              <StatusBadge status={profile.is_active ? "active" : "inactive"} />
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => startEdit(profile)}
                  className="admin-edit-action flex h-8 w-fit px-2 items-center justify-center gap-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-primary transition-colors text-xs"
                  title="Chỉnh sửa thông tin"
                >
                  <Pencil className="size-3.5" />Sửa
                </button>
                <button 
                  onClick={() => setDeletingUser(profile)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition-colors text-xs"
                  title="Xóa tài khoản"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          );
        }}
        renderGridCard={() => null}
      />

      <AdminRouteDialog
        open={Boolean(createMode)}
        returnHref="/admin/users"
        title="Thêm người dùng CMS"
        description="Gán vai trò quản trị viên hoặc biên tập viên mà không để lộ cài đặt đặc quyền cho tài khoản biên tập viên."
        size="wide"
      >
        <EntityCreateForm kind="user" />
      </AdminRouteDialog>

      {/* Edit User Modal Overlay */}
      {editingUser && (
        <ModalPortal>
        <div className="fixed inset-0 z-[calc(var(--z-modal)+1)] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="w-full max-w-[520px] bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl animate-in zoom-in duration-200 text-slate-900">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Hiệu chỉnh tài khoản thành viên</h3>
                <p className="text-xs text-slate-500 mt-1">Cập nhật thông tin, email, vai trò và trạng thái của tài khoản</p>
              </div>
              <button 
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors p-1"
              >
                <X className="size-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid gap-2">
                <span className="label-pd">Họ và tên</span>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="input-pd"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div className="grid gap-2">
                <span className="label-pd">Email đăng nhập & nhận tin</span>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="input-pd"
                  placeholder="admin@showroomnoithatphuongdong.com.vn"
                  required
                />
                <span className="text-[11px] text-slate-400">Đổi email sẽ cập nhật cả thông tin đăng nhập và thông báo hệ thống.</span>
              </div>

              <div className="grid gap-2">
                <span className="label-pd">Vai trò</span>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Biên tập viên - quản lý nội dung xuất bản</SelectItem>
                    <SelectItem value="admin">Quản trị viên - toàn quyền quản trị</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <label className="flex items-start gap-3 rounded-[var(--radius-card)] border border-slate-200 bg-white p-3 text-sm">
                <input 
                  className="mt-1 cursor-pointer" 
                  type="checkbox" 
                  checked={editActive} 
                  onChange={(e) => setEditActive(e.target.checked)} 
                />
                <span>
                  <strong className="block text-slate-900 font-semibold">Tài khoản đang hoạt động</strong>
                  <span className="text-slate-500 text-xs mt-0.5 block">Tài khoản bị tắt sẽ không thể đăng nhập vào hệ thống CMS.</span>
                </span>
              </label>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { const u = editingUser; setEditingUser(null); if (u) openResetPassword(u); }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer text-slate-700 bg-white"
                    disabled={isUpdating}
                  >
                    <Lock className="size-3.5" />
                    Đổi mật khẩu
                  </button>
                  <button
                    type="button"
                    onClick={() => { const u = editingUser; setEditingUser(null); if (u) setDeletingUser(u); }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-rose-200 rounded-lg hover:bg-rose-50 transition cursor-pointer text-rose-600 bg-white"
                    disabled={isUpdating}
                  >
                    <Trash2 className="size-3.5" />
                    Xóa
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer text-slate-700 bg-white"
                    disabled={isUpdating}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-medium bg-primary text-white hover:bg-primary/90 rounded-lg transition cursor-pointer"
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Delete User Confirmation Modal */}
      {deletingUser && (
        <ModalPortal>
        <div className="fixed inset-0 z-[calc(var(--z-modal)+2)] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-[440px] bg-white rounded-2xl border border-rose-200 p-6 shadow-2xl animate-in zoom-in duration-200 text-slate-900">
            <div className="flex items-start gap-3.5 mb-4">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-full shrink-0">
                <UserX className="size-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xác nhận xóa người dùng?</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Bạn có chắc chắn muốn xóa tài khoản <strong className="text-slate-800 font-semibold">{deletingUser.email}</strong>?
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-rose-50/80 border border-rose-200/80 p-3.5 mb-5 text-xs text-rose-800 leading-relaxed space-y-1">
              <p>⚠️ <strong>Lưu ý:</strong></p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-700">
                <li>Tài khoản này sẽ bị xóa vĩnh viễn khỏi danh sách quản trị và hệ thống xác thực.</li>
                <li>Không thể xóa quản trị viên cuối cùng của hệ thống.</li>
                <li>Không thể tự xóa tài khoản đang đăng nhập của chính bạn.</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer text-slate-700 bg-white"
                disabled={isDeleting}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 rounded-lg transition cursor-pointer disabled:opacity-60"
                disabled={isDeleting}
              >
                {isDeleting ? "Đang xóa..." : "Xác nhận xóa tài khoản"}
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Reset Password Modal */}
      {resetUser && (
        <ModalPortal>
        <div className="fixed inset-0 z-[calc(var(--z-modal)+1)] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="w-full max-w-[440px] bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl animate-in zoom-in duration-200 text-slate-900">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="size-4 text-primary" />
                  Đặt lại mật khẩu
                </h3>
                <p className="text-xs text-slate-500 mt-1">Đặt mật khẩu mới cho {resetUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setResetUser(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors p-1"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="grid gap-2">
                <span className="label-pd">Mật khẩu mới</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setResetError(""); }}
                  className="input-pd"
                  placeholder={`Tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`}
                  autoComplete="new-password"
                />
              </div>
              <div className="grid gap-2">
                <span className="label-pd">Xác nhận mật khẩu</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setResetError(""); }}
                  className="input-pd"
                  placeholder="Nhập lại mật khẩu mới"
                  autoComplete="new-password"
                />
              </div>
              {resetError && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  {resetError}
                </p>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetUser(null)}
                  className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer text-slate-700 bg-white"
                  disabled={isResetting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-primary text-white hover:bg-primary/90 rounded-lg transition cursor-pointer disabled:opacity-60"
                  disabled={isResetting}
                >
                  {isResetting ? "Đang lưu..." : "Đặt lại mật khẩu"}
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  );
}
