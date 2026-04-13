import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error("ENCRYPTION_KEY não definida no .env");
  // Pad or truncate to exactly 32 bytes
  return Buffer.from(key.padEnd(KEY_LENGTH, "0").slice(0, KEY_LENGTH), "utf-8");
}

/**
 * Encrypts a plaintext string using AES-256-CBC.
 * Returns a base64 string in format: IV_HEX:ENCRYPTED_HEX
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts a base64 string (IV_HEX:ENCRYPTED_HEX) using AES-256-CBC.
 * Returns the original plaintext.
 */
export function decrypt(ciphertext: string): string {
  const key = getKey();
  const [ivHex, encryptedHex] = ciphertext.split(":");
  if (!ivHex || !encryptedHex)
    throw new Error("Formato inválido de ciphertext");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * Masks a value for display (shows only last 4 chars).
 */
export function maskValue(value: string): string {
  if (value.length <= 4) return "****";
  return "****" + value.slice(-4);
}
