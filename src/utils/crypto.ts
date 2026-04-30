import CryptoJS from "crypto-js";

const secretKey =
  import.meta.env.VITE_APP_CRYPTO_SECRET_KEY ||
  "Qyr60bQTzEUaLnpGtGDdVwgJp9VkWAYc"; // Secure key for AES-256 encryption
const fixedIV = CryptoJS.enc.Hex.parse("00000000000000000000000000000000"); // Fixed IV

/**
 * Encrypts a given plain text using AES-256-CBC with a fixed IV.
 * Returns base64url encoding (uses - and _ instead of + and /) so the result
 * is safe to embed directly in a URL path without %2F slash issues.
 * The redirection-service decryptor handles both base64url and standard base64.
 * @param {string} plainText - The text to encrypt.
 * @returns {string} - The base64url-encoded encrypted string (no encodeURIComponent needed).
 */
export function encrypt(plainText: string): string {
  if (!plainText || plainText.trim() === "") {
    throw new Error("Invalid input: Text to encrypt cannot be empty.");
  }

  // Encrypt the text — output is standard base64
  const encrypted = CryptoJS.AES.encrypt(
    plainText,
    CryptoJS.enc.Utf8.parse(secretKey),
    {
      iv: fixedIV,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  ).toString();

  // Convert standard base64 → base64url:
  //   + → -   (avoids %2B in URLs)
  //   / → _   (avoids %2F slash issues with nginx and Express routing)
  //   = removed (padding not needed in URLs)
  return encrypted
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
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
