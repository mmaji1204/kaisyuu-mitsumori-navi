import { NextResponse, type NextRequest } from "next/server";
import {
  BUSINESS_AUTH_COOKIE,
  isValidBusinessSession,
} from "@/lib/business-auth";
import { ADMIN_AUTH_COOKIE, isValidAdminSession } from "@/lib/admin-auth";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/business/login")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/business")) {
    const isLoggedIn = isValidBusinessSession(
      request.cookies.get(BUSINESS_AUTH_COOKIE)?.value,
    );

    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/business/login", request.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    const isLoggedIn = isValidAdminSession(
      request.cookies.get(ADMIN_AUTH_COOKIE)?.value,
    );

    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/business/:path*", "/admin/:path*"],
};
