// Server-only configuration. Opening intake requires an explicit deployment
// after the database, recipient and operator checks in docs/deploy-vercel.md.
export function getOperatorDetails() {
  return {
    name: process.env.OPERATOR_LEGAL_NAME?.trim() || "",
    address: process.env.OPERATOR_ADDRESS?.trim() || "",
    email: process.env.OPERATOR_CONTACT_EMAIL?.trim() || "",
  };
}

export function isQuoteIntakeOpen() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY",
    "ADMIN_LOGIN_EMAIL", "ADMIN_LOGIN_PASSWORD", "ADMIN_SESSION_SIGNING_SECRET",
    "BUSINESS_SESSION_SIGNING_SECRET", "RESEND_API_KEY",
    "NOTIFICATION_FROM_EMAIL", "ADMIN_NOTIFY_EMAIL",
    "OPERATOR_LEGAL_NAME", "OPERATOR_ADDRESS", "OPERATOR_CONTACT_EMAIL",
  ];
  return process.env.QUOTE_INTAKE_ENABLED === "true" &&
    required.every(key => Boolean(process.env[key]?.trim()));
}
