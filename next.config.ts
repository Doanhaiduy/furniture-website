import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  output: "standalone",
  // App chạy sau reverse proxy trên IP thuần. Next kiểm tra origin của Server Action
  // so với host; sau proxy dễ lệch → trả 400. Khai báo origin hợp lệ để cho phép.
  // Thêm domain thật vào đây khi chuyển sang domain + HTTPS.
  experimental: {
    serverActions: {
      allowedOrigins: [
        "103.228.74.240",
        "103.211.206.66",
        "showroomnoithatphuongdong.com",
        "www.showroomnoithatphuongdong.com",
      ],
    },
  },
  devIndicators: {
    // @ts-expect-error - appIsrStatus is supported in Next.js 15 runtime but types definition is outdated
    appIsrStatus: false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
    ],
  },
  // Baseline security headers applied to every response. NOTE: a Content-Security-Policy
  // is intentionally NOT set here — it must be authored and tested against the app's real
  // dependencies (Next inline scripts, Cloudinary, Supabase, Google Maps embed) before
  // enabling, or it will break rendering. Add it as a follow-up once verified.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
