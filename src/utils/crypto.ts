import CryptoJS from "crypto-js";

const secretKey =
  import.meta.env.VITE_APP_CRYPTO_SECRET_KEY ||
  "Qyr60bQTzEUaLnpGtGDdVwgJp9VkWAYc"; // Secure key for AES-256 encryption
const fixedIV = CryptoJS.enc.Hex.parse("00000000000000000000000000000000"); // Fixed IV

/**
 * Encrypts a given plain text using AES-256-CBC with a fixed IV.
 * @param {string} plainText - The text to encrypt.
 * @returns {string} - The URL-encoded encrypted string.
 */
export function encrypt(plainText: string): string {
  if (!plainText || plainText.trim() === "") {
    throw new Error("Invalid input: Text to encrypt cannot be empty.");
  }

  // Encrypt the text
  const encrypted = CryptoJS.AES.encrypt(
    plainText,
    CryptoJS.enc.Utf8.parse(secretKey),
    {
      iv: fixedIV,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  ).toString();

  // URL encode the encrypted string
  return encodeURIComponent(encrypted);
}

/**
 * Decrypts a given encrypted text using AES-256-CBC with a fixed IV.
 * @param {string} encryptedText - The URL-encoded encrypted string to decrypt.
 * @returns {string} - The decrypted plain text.
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText || encryptedText.trim() === "") {
    throw new Error("Invalid input: Encrypted text cannot be empty.");
  }

  try {
    // URL decode the encrypted string
    const decodedEncryptedText = decodeURIComponent(encryptedText);

    // Decrypt the text
    const decrypted = CryptoJS.AES.decrypt(
      decodedEncryptedText,
      CryptoJS.enc.Utf8.parse(secretKey),
      {
        iv: fixedIV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    // Convert decrypted text to UTF-8
    const originalText = decrypted.toString(CryptoJS.enc.Utf8);

    if (originalText === "") {
      throw new Error("Decryption failed or invalid data.");
    }

    return originalText;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt the text. Please verify the input.");
  }
}
