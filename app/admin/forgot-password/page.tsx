"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Mail, Send } from "lucide-react";
import { RemoteImage } from "@/components/showroom/remote-image";
import { imageAssets } from "@/tests/fixtures/showroom-data-fixture";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || "Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } catch {
      setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.");
    } finally {
      setLoading(false);
    }
  }

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
            Bảo mật & phục hồi quyền truy cập hệ thống quản trị Showroom Phương Đông.
          </h1>
        </div>
      </section>

      <section className="grid place-items-center rounded-[2rem] bg-[#eef6fa] p-6">
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
            Quay lại trang đăng nhập
          </Link>

          <h1 className="font-heading text-2xl font-bold text-slate-900">
            Quên mật khẩu?
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Nhập địa chỉ email tài khoản quản trị của bạn. Hệ thống sẽ kiểm tra và gửi liên kết đặt lại mật khẩu mới.
          </p>

          {error ? (
            <p className="mt-4 rounded-md border border-error/30 bg-error-container px-3 py-2 text-sm text-on-error-container">
              {error}
            </p>
          ) : null}

          {submitted ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-5 text-emerald-950 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-6 text-emerald-600 shrink-0" />
                <h3 className="font-bold text-sm text-emerald-900">Email đã được gửi đi!</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-emerald-800">
                Một thư chứa liên kết đặt lại mật khẩu đã được gửi thành công đến hòm thư <strong>{email}</strong>.
              </p>
              <p className="mt-2 text-[11px] text-emerald-700">
                ⏱️ Lưu ý: Liên kết đặt lại chỉ có hiệu lực trong <strong>15 phút</strong>. Hãy kiểm tra cả mục Thư rác (Spam) nếu không thấy trong Hộp thư đến.
              </p>
              <div className="mt-5 pt-4 border-t border-emerald-200/60 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-semibold text-emerald-800 hover:underline cursor-pointer"
                >
                  Gửi lại email khác
                </button>
                <Link
                  href="/admin/login"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Về đăng nhập
                </Link>
              </div>
            </div>
          ) : (
            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <label className="grid gap-2">
                <span className="text-sm font-semibold">Email tài khoản</span>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    className="input-pd pl-10"
                    type="email"
                    placeholder="admin@showroomnoithatphuongdong.com.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </label>

              <button
                className="button-pd mt-2"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                {loading ? "Đang xử lý..." : "Gửi liên kết khôi phục"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
