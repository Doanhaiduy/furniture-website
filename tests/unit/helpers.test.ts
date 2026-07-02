import { describe, it, expect } from "vitest";
import { encryptSecret, decryptSecret, generateMaskedHint } from "@/lib/security/encryption";
import { generatePageMetadata } from "@/lib/seo";

describe("Security Encryption Helpers", () => {
  const secretKey32 = "12345678901234567890123456789012"; // 32 characters
  const secretKey64Hex = "1234567890123456789012345678901212345678901234567890123456789012"; // 64 hex characters

  it("should encrypt and decrypt a plaintext string correctly with 32-char key", () => {
    const plaintext = "my-super-secret-api-key";
    const encrypted = encryptSecret(plaintext, secretKey32);
    
    expect(encrypted).toContain(":");
    expect(encrypted.split(":").length).toBe(3);

    const decrypted = decryptSecret(encrypted, secretKey32);
    expect(decrypted).toBe(plaintext);
  });

  it("should encrypt and decrypt correctly with 64-hex key", () => {
    const plaintext = "another-secret";
    const encrypted = encryptSecret(plaintext, secretKey64Hex);
    const decrypted = decryptSecret(encrypted, secretKey64Hex);
    expect(decrypted).toBe(plaintext);
  });

  it("should fail decryption if key is incorrect", () => {
    const plaintext = "my-super-secret-api-key";
    const encrypted = encryptSecret(plaintext, secretKey32);
    const wrongKey = "wrongkeywrongkeywrongkeywrongkey";

    expect(() => decryptSecret(encrypted, wrongKey)).toThrow();
  });

  it("should throw errors on missing inputs or invalid keys", () => {
    expect(() => encryptSecret("plain", "")).toThrow("Encryption key is required");
    expect(() => encryptSecret("plain", "short")).toThrow("exactly 32 bytes");
    expect(() => decryptSecret("payload", "")).toThrow("Decryption key is required");
    expect(() => decryptSecret("", secretKey32)).toThrow("Encrypted payload is required");
    expect(() => decryptSecret("iv:tag:cipher", "short")).toThrow("exactly 32 bytes");
    expect(() => decryptSecret("invalid-payload-format", secretKey32)).toThrow("Invalid encrypted payload format");
  });

  it("should generate a masked hint correctly", () => {
    expect(generateMaskedHint("re_75JQ4aQ6_6Z69r1pgvbFzJj3Vw4dbdEib")).toBe("****dEib");
    expect(generateMaskedHint("short")).toBe("****hort");
    expect(generateMaskedHint("123")).toBe("****");
    expect(generateMaskedHint("")).toBe("");
  });
});

describe("SEO Metadata Helper", () => {
  it("should generate proper page metadata structure", () => {
    const metadata = generatePageMetadata({
      title: "Test Page",
      description: "This is a test description",
      path: "/test-route",
      imageUrl: "https://example.com/image.jpg",
    });

    expect(metadata.title).toBe("Test Page");
    expect(metadata.description).toBe("This is a test description");
    expect(metadata.alternates?.canonical).toContain("/test-route");
    expect(metadata.openGraph?.title).toBe("Test Page");
    expect(metadata.twitter?.title).toBe("Test Page");
  });

  it("should handle publishedAt option in metadata", () => {
    const metadata = generatePageMetadata({
      title: "Blog Post",
      description: "My blog post",
      path: "/blog/post-1",
      publishedAt: "2026-06-21T08:00:00Z",
    });

    expect((metadata.openGraph as any)?.type).toBe("article");
    expect((metadata.openGraph as any).publishedTime).toBe("2026-06-21T08:00:00Z");
  });
});
