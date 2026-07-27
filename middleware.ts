import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionToken,
} from "@/lib/admin/session-token";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

export async function middleware(request: NextRequest) {
  if (process.env.ENABLE_ADMIN !== "true") {
    if (request.nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (
    PUBLIC_ADMIN_PATHS.some((path) => request.nextUrl.pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isAuthenticated = await isValidAdminSessionToken(token);

  if (!isAuthenticated) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (request.nextUrl.pathname === "/admin") {
    return NextResponse.redirect(new URL("/admin/orders", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
