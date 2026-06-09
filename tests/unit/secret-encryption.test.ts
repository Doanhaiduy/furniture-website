import { describe, expect, it } from "vitest";
import { encryptSecret, decryptSecret, generateMaskedHint } from "../../lib/security/encryption";

const mockKey = "12345678901234567890123456789012"; // Exactly 32 characters
const differentKey = "abcdefghijabcdefghijabcdefghijab"; // Distinct 32 characters
const invalidLengthKey = "shortkey";

describe("Secret Encryption & Decryption", () => {
  const secret = "test-gemini-api-key-value-12345";

  it("successfully encrypts and decrypts a plaintext secret", () => {
    const encrypted = encryptSecret(secret, mockKey);
    expect(encrypted).toContain(":");
    expect(encrypted.split(":")).toHaveLength(3);

    const decrypted = decryptSecret(encrypted, mockKey);
    expect(decrypted).toBe(secret);
  });

  it("throws an error when decrypting with a different key", () => {
    const encrypted = encryptSecret(secret, mockKey);
    expect(() => decryptSecret(encrypted, differentKey)).toThrow(
      "Failed to decrypt secret. The payload may be corrupted or the key is incorrect."
    );
  });

  it("throws an error when key lengths are invalid", () => {
    expect(() => encryptSecret(secret, invalidLengthKey)).toThrow(
      "AI_SECRET_ENCRYPTION_KEY must be exactly 32 bytes (32 characters or 64 hex characters)"
    );
    expect(() => decryptSecret("iv:tag:cipher", invalidLengthKey)).toThrow(
      "AI_SECRET_ENCRYPTION_KEY must be exactly 32 bytes (32 characters or 64 hex characters)"
    );
  });

  it("throws an error when payload format is invalid", () => {
    expect(() => decryptSecret("invalidpayload", mockKey)).toThrow(
      "Invalid encrypted payload format. Expected iv:tag:ciphertext"
    );
  });

  it("correctly generates masked hints", () => {
    expect(generateMaskedHint("")).toBe("");
    expect(generateMaskedHint("123")).toBe("****");
    expect(generateMaskedHint("my-secret-key-1234")).toBe("****1234");
  });
});
