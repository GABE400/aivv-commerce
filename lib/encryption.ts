import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
// Ensure ENCRYPTION_KEY is exactly 32 bytes (64 hex characters)
// For development, we fallback to a hardcoded string if env var is missing, but in prod it must be set.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY 
  ? Buffer.from(process.env.ENCRYPTION_KEY, "hex")
  : crypto.scryptSync("aivv-commerce-fallback-secret", "salt", 32);

export function encrypt(text: string) {
  if (!text) return { encrypted: "", iv: "" };
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  
  // We append the auth tag to the encrypted string
  return {
    encrypted: `${encrypted}:${authTag}`,
    iv: iv.toString("hex"),
  };
}

export function decrypt(encryptedText: string, ivHex: string) {
  if (!encryptedText || !ivHex) return "";
  
  try {
    const [encrypted, authTag] = encryptedText.split(":");
    const iv = Buffer.from(ivHex, "hex");
    
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(Buffer.from(authTag, "hex"));
    
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return "";
  }
}
