"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { RemoteImage } from "./remote-image";
import { imageAssets } from "@/tests/fixtures/showroom-data-fixture";

export function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);



  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);


    try {
      const supabase = createBrowserClient();

      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setLoading(false);
        setError("Thông tin đăng nhập không hợp lệ.");
        return;
      }

      // Cập nhật last_login_at vào public.profiles cho ADM-USR-23
      if (authData?.user) {
        await supabase
          .from("profiles")
          .update({ last_login_at: new Date().toISOString() })
          .eq("id", authData.user.id);
      }

      setLoading(false);
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      console.error("Login error:", err);
      setLoading(false);
      setError("Lỗi kết nối đến máy chủ xác thực. Vui lòng kiểm tra lại cấu hình Supabase.");
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
          <p className="label-pd text-white/65">CMS quản trị</p>
          <h1 className="mt-4 max-w-xl font-heading text-5xl font-bold leading-tight">
            Quản lý nội dung showroom như một phòng điều phối vận hành.
          </h1>
        </div>
      </section>
      <section className="grid place-items-center rounded-[2rem] bg-[#eef6fa] p-6">
        <div className="state-card w-full max-w-md rounded-3xl border border-white/80 bg-white/88 p-8 shadow-[0_28px_80px_rgba(0,0,0,0.18)]">
          <p className="label-pd">CMS quản trị</p>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-primary">
            Đăng nhập
          </h1>
          <p className="mt-3 text-sm leading-6 text-secondary">
            Truy cập nội dung, yêu cầu báo giá, quản trị tệp, cài đặt và quy
            trình bản nháp AI.
          </p>

          {error ? (
            <p className="mt-4 rounded-md border border-error/30 bg-error-container px-3 py-2 text-sm text-on-error-container">
              {error}
            </p>
          ) : null}

          <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2">
              <span className="text-sm font-semibold">Email đăng nhập</span>
              <input
                className="input-pd"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold">Mật khẩu</span>
              <input
                className="input-pd"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button
              className="button-pd mt-2"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export function AccessDeniedPage() {
  return (
    <div className="state-card mx-auto max-w-2xl rounded-xl border border-error/25 bg-error-container p-8 text-on-error-container shadow-[0_18px_44px_rgba(147,0,10,0.08)]">
      <h1 className="mt-4 font-heading text-3xl font-semibold">Không có quyền truy cập</h1>
      <p className="mt-3 text-sm leading-6">
        Biên tập viên không được truy cập yêu cầu báo giá, người dùng, cài đặt đặc quyền hoặc bí mật tích hợp theo mô hình vai trò A.
      </p>
      <Link className="button-pd mt-6" href="/admin">
        Quay lại tổng quan
      </Link>
    </div>
  );
}
