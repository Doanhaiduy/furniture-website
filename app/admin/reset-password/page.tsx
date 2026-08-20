"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Lock, ShieldCheck } from "lucide-react";
import { RemoteImage } from "@/components/showroom/remote-image";
import { imageAssets } from "@/tests/fixtures/showroom-data-fixture";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const MIN_LENGTH = 8;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!token || !email) {
      setError("Liên kết đặt lại mật khẩu không hợp lệ hoặc thiếu thông tin token.");
      return;
    }

    if (password.length < MIN_LENGTH) {
      setError(`Mật khẩu mới phải có tối thiểu ${MIN_LENGTH} ký tự.`);
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp. Vui lòng nhập lại.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "Không thể đặt lại mật khẩu. Vui lòng thử lại.");
      }
    } catch {
      setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="state-card w-full max-w-md rounded-3xl border border-white/80 bg-white/88 p-8 shadow-[0_28px_80px_rgba(0,0,0,0.18)]">
      <Link
        href="/admin/login"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Về trang đăng nhập
      </Link>

      <p className="label-pd">Khôi phục mật khẩu</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold text-primary">
        Tạo mật khẩu mới
      </h1>
      <p className="mt-2 text-sm leading-6 text-secondary">
        {email ? (
          <>
            Đang đặt lại mật khẩu cho tài khoản <strong className="text-slate-800">{email}</strong>.
          </>
        ) : (
          "Thiết lập mật khẩu mới cho tài khoản quản trị viên của bạn."
        )}
      </p>

      {error ? (
        <p className="mt-4 rounded-md border border-error/30 bg-error-container px-3 py-2 text-sm text-on-error-container">
          {error}
        </p>
      ) : null}

      {success ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-6 text-emerald-950 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 text-emerald-600 rounded-full mb-3">
            <CheckCircle2 className="size-8" />
          </div>
          <h3 className="font-bold text-base text-emerald-900">Mật khẩu đã được cập nhật!</h3>
          <p className="mt-2 text-xs leading-relaxed text-emerald-800">
            Bạn đã thiết lập mật khẩu mới thành công. Hãy đăng nhập lại để tiếp tục công việc quản trị.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/login"
              className="button-pd w-full justify-center"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      ) : (
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          {!token && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
              ⚠️ Không tìm thấy token trong URL. Hãy mở đúng liên kết được gửi trong email.
            </div>
          )}

          <label className="grid gap-2">
            <span className="text-sm font-semibold">Mật khẩu mới</span>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                className="input-pd pl-10"
                type="password"
                placeholder={`Tối thiểu ${MIN_LENGTH} ký tự`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                autoFocus
              />
            </div>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold">Xác nhận mật khẩu</span>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                className="input-pd pl-10"
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </label>

          <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
            <ShieldCheck className="size-4 text-slate-400" />
            <span>Mật khẩu được mã hóa an toàn với chuẩn bcrypt/Supabase Auth.</span>
          </div>

          <button
            className="button-pd mt-2"
            type="submit"
            disabled={loading || !token}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <KeyRound className="size-4" />
            )}
            {loading ? "Đang lưu..." : "Xác nhận đặt lại mật khẩu"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="grid min-h-screen bg-[#211816] p-4 lg:grid-cols-[1fr_520px]">
      <section className="relative hidden overflow-hidden rounded-[2rem] bg-primary text-white lg:block">
        <RemoteImage
          src={imageAssets.showroom}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#211816] via-[#211816]/58 to-transparent" />
        <div className="absolute bottom-0 p-12">
          <p className="label-pd text-white/65">CMS quản trị</p>
          <h1 className="mt-4 max-w-xl font-heading text-5xl font-bold leading-tight">
            Thiết lập mật khẩu an toàn và tiếp tục vận hành.
          </h1>
        </div>
      </section>

      <section className="grid place-items-center rounded-[2rem] bg-[#eef6fa] p-6">
        <Suspense fallback={<div className="p-8 text-center text-slate-500">Đang tải biểu mẫu...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </section>
    </main>
  );
}
