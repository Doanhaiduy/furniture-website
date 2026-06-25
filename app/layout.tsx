import type { Metadata } from "next";
import "@/lib/env/schema";
import "./globals.css";
import { ToastProvider } from "@/components/providers/toast-provider";

export const metadata: Metadata = {
  title: {
    default: "Showroom Nội Thất Phương Đông",
    template: "%s | Showroom Nội Thất Phương Đông",
  },
  description:
    "Website doanh nghiệp đồ gỗ nội thất và thiết bị vệ sinh song ngữ Việt Anh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" data-scroll-behavior="smooth" className="h-full antialiased">
      <body className="flex min-h-full flex-col overflow-x-clip">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
