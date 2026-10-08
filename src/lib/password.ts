import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const derive = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = await derive(password, salt, 64) as Buffer;
  return `scrypt$${salt}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string | null) {
  if (!stored || !password || password.length > 256) return false;
  // Legacy hashes are accepted once and upgraded after a successful login.
  if (/^[a-f0-9]{64}$/.test(stored)) {
    return timingSafeEqual(Buffer.from(stored, "hex"), createHash("sha256").update(password).digest());
  }
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt" || !/^[a-f0-9]{32}$/.test(parts[1]) || !/^[a-f0-9]{128}$/.test(parts[2])) return false;
  const key = await derive(password, parts[1], 64) as Buffer;
  return timingSafeEqual(key, Buffer.from(parts[2], "hex"));
}
