import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const ADMIN_AUTH_COOKIE_NAME = "truehook_admin_token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasToken = request.cookies.has(ADMIN_AUTH_COOKIE_NAME);
  const isAuthRoute = pathname.startsWith("/signin");
  const isRootRoute = pathname === "/";
  const isProtectedRoute =
    pathname.startsWith("/overview") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/system");

  // 1. Unauthenticated operator attempting to access protected console route
  if (isProtectedRoute && !hasToken) {
    const signinUrl = new URL("/signin", request.url);
    return NextResponse.redirect(signinUrl);
  }

  // 2. Authenticated operator attempting to access signin
  if (isAuthRoute && hasToken) {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  // 3. Root route handling
  if (isRootRoute) {
    if (hasToken) {
      return NextResponse.redirect(new URL("/overview", request.url));
    }
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public asset extensions (.svg, .png, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
