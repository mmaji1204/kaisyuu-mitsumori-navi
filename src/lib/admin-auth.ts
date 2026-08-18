import { cookies } from "next/headers";

export const ADMIN_AUTH_COOKIE = "admin-auth-token";

const defaultEmail = "admin@example.com";
const defaultPassword = "admin123";
const defaultToken = "local-admin-session";

export function getAdminLoginEmail() {
  return process.env.ADMIN_LOGIN_EMAIL || defaultEmail;
}

export function getAdminLoginPassword() {
  return process.env.ADMIN_LOGIN_PASSWORD || defaultPassword;
}

export function getAdminSessionToken() {
  return process.env.ADMIN_SESSION_TOKEN || defaultToken;
}

export function isValidAdminSession(value?: string) {
  return Boolean(value && value === getAdminSessionToken());
}

export async function isAdminLoggedIn() {
  const cookieStore = await cookies();

  return isValidAdminSession(cookieStore.get(ADMIN_AUTH_COOKIE)?.value);
}
