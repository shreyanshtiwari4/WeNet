import CryptoJS from "crypto-js";
import dotenv from "dotenv";
dotenv.config();


 // ✅ Convert to WordArray

// Encrypt
export const encryptData = (data) => {
  try{
  const keyHex = process.env.CRYPTO_KEY;
if (!keyHex) {
  console.error("CRYPTO_KEY environment variable is not set");
}
const key = CryptoJS.enc.Hex.parse(keyHex);
      // console.log("CRYPTO_KEY:", process.env.CRYPTO_KEY);
  if (!data) return "";

  if (!keyHex) throw new Error("Encryption key is required");

  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(data, key, { iv });

  // Combine IV + ciphertext
  const combined = iv.concat(encrypted.ciphertext);
  return CryptoJS.enc.Base64.stringify(combined);
 }catch(err){
    console.error("Encryption error:", err.message);
 } // ✅ Always returns string
};

// Decrypt
export const decryptData = (encryptedData) => {
  const keyHex = process.env.CRYPTO_KEY;
  if (!encryptedData) return "";

  if (!keyHex) throw new Error("Decryption key is required");

  try {
    const combined = CryptoJS.enc.Base64.parse(encryptedData);

    // Extract IV (first 16 bytes)
    const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4), 16);

    // Extract ciphertext (rest of data)
    const ciphertext = CryptoJS.lib.WordArray.create(
      combined.words.slice(4),
      combined.sigBytes - 16
    );

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext },
      key,
      { iv }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.error("Decryption error:", err.message);
    return "";
  }
};

export const encryptField = encryptData;
export const decryptField = decryptData;
