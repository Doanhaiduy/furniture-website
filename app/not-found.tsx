import Link from "next/link";
import { Home } from "lucide-react";

export default function GlobalNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6 text-center">
      <div className="card-pd state-card max-w-xl p-8">
        <p className="label-pd">404</p>
        <h1 className="mt-4 font-heading text-5xl font-bold text-primary">
          Không tìm thấy trang
        </h1>
        <p className="mt-5 text-lg leading-8 text-secondary">
          Đường dẫn không tồn tại hoặc nội dung chưa được xuất bản.
        </p>
        <Link href="/vi" className="button-pd mt-8">
          <Home className="size-4" />
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}
