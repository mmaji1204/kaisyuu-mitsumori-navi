import { NextRequest, NextResponse } from "next/server";
import {
  BUSINESS_AUTH_COOKIE,
  createBusinessSessionValue,
  getBusinessLoginEmail,
  getBusinessLoginPassword,
  isBusinessFallbackAuthConfigured,
} from "@/lib/business-auth";
import { hashPassword } from "@/lib/password";
import {
  createSupabaseAdminClient,
  hasSupabaseServerEnv,
} from "@/lib/supabase/server";

type PartnerLoginRow = {
  id: string;
  email: string;
  password_hash: string | null;
  status: "active" | "paused";
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = formData.get("email")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  let partnerId = "";

  if (hasSupabaseServerEnv()) {
    const supabase = createSupabaseAdminClient();
    const { data: partner, error } = await supabase
      .from("partners")
      .select("id, email, password_hash, status")
      .eq("email", email)
      .single();

    const loginPartner = partner as PartnerLoginRow | null;

    if (
      error ||
      !loginPartner ||
      loginPartner.status !== "active" ||
      loginPartner.password_hash !== hashPassword(password)
    ) {
      return NextResponse.redirect(
        new URL("/business/login?error=1", request.url),
        { status: 303 },
      );
    }

    partnerId = loginPartner.id;
  } else {
    if (!isBusinessFallbackAuthConfigured()) {
      return NextResponse.redirect(
        new URL("/business/login?setup=1", request.url),
        { status: 303 },
      );
    }

    if (
      email !== getBusinessLoginEmail() ||
      password !== getBusinessLoginPassword()
    ) {
      return NextResponse.redirect(
        new URL("/business/login?error=1", request.url),
        { status: 303 },
      );
    }

    partnerId = "local-partner";
  }

  const response = NextResponse.redirect(new URL("/business/users", request.url), {
    status: 303,
  });

  response.cookies.set(BUSINESS_AUTH_COOKIE, createBusinessSessionValue(partnerId), {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
