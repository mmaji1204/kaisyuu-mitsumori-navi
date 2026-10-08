import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_AUTH_COOKIE = "admin-auth-token";

const defaultEmail = "admin@example.com";
const defaultPassword = "admin123";
const defaultToken = "local-admin-session";

export function isDevelopmentAuthFallbackEnabled() {
  return process.env.NODE_ENV !== "production";
}

export function getAdminLoginEmail() {
  return (
    process.env.ADMIN_LOGIN_EMAIL ||
    (isDevelopmentAuthFallbackEnabled() ? defaultEmail : "")
  );
}

export function getAdminLoginPassword() {
  return (
    process.env.ADMIN_LOGIN_PASSWORD ||
    (isDevelopmentAuthFallbackEnabled() ? defaultPassword : "")
  );
}

export function getAdminSessionToken() {
  return (
    process.env.ADMIN_SESSION_SIGNING_SECRET ||
    (isDevelopmentAuthFallbackEnabled() ? defaultToken : "")
  );
}

export function isAdminAuthConfigured() {
  return Boolean(
    getAdminLoginEmail() &&
      getAdminLoginPassword() &&
      getAdminSessionToken(),
  );
}

export function isValidAdminSession(value?: string) {
  const secret = getAdminSessionToken();
  if (!value || !secret) return false;
  const parts = value.split(".");
  if (parts.length !== 2 || !/^[\w-]+$/.test(parts[1])) return false;
  const [payload, signature] = parts;
  const expected = createHmac("sha256", secret).update(payload).digest();
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return session.role === "admin" && Number.isFinite(session.expiresAt) && session.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export function createAdminSessionValue() {
  const secret = getAdminSessionToken();
  if (!secret) throw new Error("Admin session signing is not configured.");
  const payload = Buffer.from(JSON.stringify({ role: "admin", expiresAt: Date.now() + 8 * 60 * 60 * 1000 })).toString("base64url");
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("base64url")}`;
}

export async function isAdminLoggedIn() {
  const cookieStore = await cookies();

  return isValidAdminSession(cookieStore.get(ADMIN_AUTH_COOKIE)?.value);
}
