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
      <div className="flex items-center gap-3 mb-6">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-900/10 p-2 border border-amber-900/15">
          <img src="/logo-final.svg" alt="Phương Đông" className="size-full object-contain" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-900/70">Showroom Nội Thất</p>
          <h2 className="font-heading text-lg font-black text-amber-950 tracking-wide">PHƯƠNG ĐÔNG</h2>
        </div>
      </div>

      <Link
        href="/admin/login"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors mb-4"
      >
        <ArrowLeft className="size-3.5" />
        Về trang đăng nhập
      </Link>

      <h1 className="font-heading text-2xl font-bold text-slate-900">
        Tạo mật khẩu mới
      </h1>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">
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
            Mật khẩu cho tài khoản <strong>{email}</strong> đã được thay đổi thành công. Bạn có thể sử dụng mật khẩu mới để đăng nhập.
          </p>
          <Link
            href="/admin/login"
            className="mt-6 inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </div>
      ) : (
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">Mật khẩu mới (tối thiểu 8 ký tự)</span>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                className="input-pd pl-10"
                type="password"
                placeholder="Nhập mật khẩu mới..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
            </div>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold">Xác nhận mật khẩu mới</span>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                className="input-pd pl-10"
                type="password"
                placeholder="Nhập lại mật khẩu..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </label>

          <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
            <ShieldCheck className="size-4 text-slate-400 shrink-0" />
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
          <p className="label-pd text-white/65">Showroom Phương Đông</p>
          <h1 className="mt-4 max-w-xl font-heading text-4xl xl:text-5xl font-bold leading-tight">
            Thiết lập mật khẩu an toàn và tiếp tục vận hành hệ thống.
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
