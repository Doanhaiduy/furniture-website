import crypto from "crypto";

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * The encryption key must be 32 bytes (either 32-character utf-8 or 64-character hex).
 * Returns the format: `iv_hex:auth_tag_hex:ciphertext_hex`
 */
export function encryptSecret(plaintext: string, keyString: string): string {
  if (!keyString) {
    throw new Error("Encryption key is required");
  }

  // Parse the key. Support 64-character hex or 32-character utf-8.
  let key: Buffer;
  if (keyString.length === 64) {
    key = Buffer.from(keyString, "hex");
  } else if (keyString.length === 32) {
    key = Buffer.from(keyString, "utf8");
  } else {
    throw new Error("AI_SECRET_ENCRYPTION_KEY must be exactly 32 bytes (32 characters or 64 hex characters)");
  }

  // Generate a random 12-byte initialization vector
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let ciphertext = cipher.update(plaintext, "utf8", "hex");
  ciphertext += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");
  const ivHex = iv.toString("hex");

  return `${ivHex}:${authTag}:${ciphertext}`;
}

/**
 * Decrypts an AES-256-GCM encrypted payload of format `iv_hex:auth_tag_hex:ciphertext_hex`.
 * The decryption key must be 32 bytes (either 32-character utf-8 or 64-character hex).
 */
export function decryptSecret(encryptedPayload: string, keyString: string): string {
  if (!keyString) {
    throw new Error("Decryption key is required");
  }
  if (!encryptedPayload) {
    throw new Error("Encrypted payload is required");
  }

  // Parse key
  let key: Buffer;
  if (keyString.length === 64) {
    key = Buffer.from(keyString, "hex");
  } else if (keyString.length === 32) {
    key = Buffer.from(keyString, "utf8");
  } else {
    throw new Error("AI_SECRET_ENCRYPTION_KEY must be exactly 32 bytes (32 characters or 64 hex characters)");
  }

  const parts = encryptedPayload.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted payload format. Expected iv:tag:ciphertext");
  }

  const [ivHex, authTagHex, ciphertextHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  try {
    let plaintext = decipher.update(ciphertext, undefined, "utf8");
    plaintext += decipher.final("utf8");
    return plaintext;
  } catch (error) {
    throw new Error("Failed to decrypt secret. The payload may be corrupted or the key is incorrect.");
  }
}

/**
 * Generates a masked hint from a raw key string.
 * It keeps the last 4 characters and masks the rest, e.g. `****abcd`.
 */
export function generateMaskedHint(rawKey: string): string {
  if (!rawKey) return "";
  if (rawKey.length <= 4) {
    return "****";
  }
  const suffix = rawKey.slice(-4);
  return `****${suffix}`;
}
