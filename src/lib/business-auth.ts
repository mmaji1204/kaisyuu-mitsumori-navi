import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

export const BUSINESS_AUTH_COOKIE = "business-auth-token";

const defaultEmail = "partner@example.com";
const defaultPassword = "password123";
const defaultToken = "local-business-session";
const defaultPartnerName = "クリーンリンク";

export function isDevelopmentBusinessAuthFallbackEnabled() {
  return process.env.NODE_ENV !== "production";
}

export function getBusinessLoginEmail() {
  return (
    process.env.BUSINESS_LOGIN_EMAIL ||
    (isDevelopmentBusinessAuthFallbackEnabled() ? defaultEmail : "")
  );
}

export function getBusinessPartnerEmail() {
  return process.env.BUSINESS_PARTNER_EMAIL || getBusinessLoginEmail();
}

export function getBusinessPartnerName() {
  return process.env.BUSINESS_PARTNER_NAME || defaultPartnerName;
}

export function getBusinessLoginPassword() {
  return (
    process.env.BUSINESS_LOGIN_PASSWORD ||
    (isDevelopmentBusinessAuthFallbackEnabled() ? defaultPassword : "")
  );
}

export function getBusinessSessionToken() {
  return (
    // The legacy BUSINESS_SESSION_TOKEN was exposed in cookies and must not sign new sessions.
    process.env.BUSINESS_SESSION_SIGNING_SECRET ||
    (isDevelopmentBusinessAuthFallbackEnabled() ? defaultToken : "")
  );
}

export function isBusinessFallbackAuthConfigured() {
  return Boolean(
    getBusinessLoginEmail() &&
      getBusinessLoginPassword() &&
      getBusinessSessionToken(),
  );
}

export function createBusinessSessionValue(partnerId: string) {
  const secret = getBusinessSessionToken();
  if (!secret || !partnerId) {
    throw new Error("Business session signing is not configured.");
  }
  const payload = Buffer.from(JSON.stringify({
    partnerId,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
  })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function getBusinessPartnerIdFromSession(value?: string) {
  const secret = getBusinessSessionToken();
  if (!value || !secret) {
    return null;
  }

  const parts = value.split(".");
  if (parts.length !== 2 || !/^[\w-]+$/.test(parts[1])) {
    return null;
  }
  const [payload, signature] = parts;
  const expected = createHmac("sha256", secret).update(payload).digest();
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return null;
  }
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof session.partnerId !== "string" || !session.partnerId ||
        !Number.isFinite(session.expiresAt) || session.expiresAt <= Date.now()) {
      return null;
    }
    return session.partnerId as string;
  } catch {
    return null;
  }
}

export function isValidBusinessSession(value?: string) {
  return Boolean(getBusinessPartnerIdFromSession(value));
}

export async function isBusinessLoggedIn() {
  const cookieStore = await cookies();

  return isValidBusinessSession(cookieStore.get(BUSINESS_AUTH_COOKIE)?.value);
}

export async function getCurrentBusinessPartnerId() {
  const cookieStore = await cookies();

  return getBusinessPartnerIdFromSession(
    cookieStore.get(BUSINESS_AUTH_COOKIE)?.value,
  );
}
