import type { Metadata } from "next";
import "@/lib/env/schema";
import "./globals.css";
import { ToastProvider } from "@/components/providers/toast-provider";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  // Without metadataBase, relative canonical/OG URLs resolve against
  // localhost:3000 in a non-Vercel (VPS) deployment. Anchor them to the real origin.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Showroom Nội Thất Phương Đông",
    template: "%s | Showroom Nội Thất Phương Đông",
  },
  description:
    "Website doanh nghiệp đồ gỗ nội thất và thiết bị vệ sinh song ngữ Việt Anh.",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo-final.jpg",
  },
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
