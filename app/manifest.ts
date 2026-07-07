import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Showroom Nội Thất Phương Đông",
    short_name: "Phương Đông",
    description:
      "Đồ gỗ nội thất, thiết bị vệ sinh và gạch cao cấp — song ngữ Việt/Anh.",
    start_url: "/vi",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/logo-final.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}
