import { cookies } from "next/headers";

export const BUSINESS_AUTH_COOKIE = "business-auth-token";

const defaultEmail = "partner@example.com";
const defaultPassword = "password123";
const defaultToken = "local-business-session";
const defaultPartnerName = "クリーンリンク";

export function getBusinessLoginEmail() {
  return process.env.BUSINESS_LOGIN_EMAIL || defaultEmail;
}

export function getBusinessPartnerEmail() {
  return process.env.BUSINESS_PARTNER_EMAIL || getBusinessLoginEmail();
}

export function getBusinessPartnerName() {
  return process.env.BUSINESS_PARTNER_NAME || defaultPartnerName;
}

export function getBusinessLoginPassword() {
  return process.env.BUSINESS_LOGIN_PASSWORD || defaultPassword;
}

export function getBusinessSessionToken() {
  return process.env.BUSINESS_SESSION_TOKEN || defaultToken;
}

export function createBusinessSessionValue(partnerId: string) {
  return `${partnerId}:${getBusinessSessionToken()}`;
}

export function getBusinessPartnerIdFromSession(value?: string) {
  if (!value) {
    return null;
  }

  const [partnerId, token] = value.split(":");

  if (!partnerId || token !== getBusinessSessionToken()) {
    return null;
  }

  return partnerId;
}

export function isValidBusinessSession(value?: string) {
  return Boolean(
    value === getBusinessSessionToken() || getBusinessPartnerIdFromSession(value),
  );
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
