import { NextRequest, NextResponse } from "next/server";
import { BUSINESS_AUTH_COOKIE } from "@/lib/business-auth";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/business/login", request.url), {
    status: 303,
  });

  response.cookies.delete(BUSINESS_AUTH_COOKIE);

  return response;
}
