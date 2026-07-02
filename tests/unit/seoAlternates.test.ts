import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock server-only
vi.mock("server-only", () => ({}));

import { generatePageMetadata } from "@/lib/seo";

describe("SEO Metadata Alternates Branch Coverage", () => {
  const originalEnvSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    // Reset env
    process.env.NEXT_PUBLIC_SITE_URL = originalEnvSiteUrl;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalEnvSiteUrl;
  });

  it("should prepend slash when path does not start with one", () => {
    const metadata = generatePageMetadata({
      title: "No Lead Slash Page",
      description: "Path starts with no slash",
      path: "products/test-slug",
    });

    expect(metadata.alternates?.canonical).toBe(`${process.env.NEXT_PUBLIC_SITE_URL || "https://phuongdong.example"}/products/test-slug`);
  });

  it("should handle empty siteUrl env fallback", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;

    const metadata = generatePageMetadata({
      title: "Fallback URL Page",
      description: "No site URL env",
      path: "/about",
    });

    expect(metadata.alternates?.canonical).toBe("https://phuongdong.example/about");
  });

  it("should strip locale prefix and handle root path normalizedPath === '/'", () => {
    const metadata = generatePageMetadata({
      title: "Locale Root Page",
      description: "Root path with locale prefix",
      path: "/vi",
    });

    expect(metadata.alternates?.canonical).toBe(`${process.env.NEXT_PUBLIC_SITE_URL || "https://phuongdong.example"}/vi`);
    expect(metadata.alternates?.languages?.vi).toBe(`${process.env.NEXT_PUBLIC_SITE_URL || "https://phuongdong.example"}/vi`);
    expect(metadata.alternates?.languages?.en).toBe(`${process.env.NEXT_PUBLIC_SITE_URL || "https://phuongdong.example"}/en`);
  });
});
