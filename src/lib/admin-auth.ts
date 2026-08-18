import { cookies } from "next/headers";

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
    process.env.ADMIN_SESSION_TOKEN ||
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
  return Boolean(value && value === getAdminSessionToken());
}

export async function isAdminLoggedIn() {
  const cookieStore = await cookies();

  return isValidAdminSession(cookieStore.get(ADMIN_AUTH_COOKIE)?.value);
}
