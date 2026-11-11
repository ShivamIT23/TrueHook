import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const AUTH_COOKIE_NAME = "truehook_token";
export const SELECTED_APP_COOKIE_NAME = "truehook_selected_app";
export const SELECTED_APP_ID_COOKIE_NAME = "truehook_selected_app_id";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const hasToken = request.cookies.has(AUTH_COOKIE_NAME);
  const hasApp =
    request.cookies.has(SELECTED_APP_COOKIE_NAME) ||
    request.cookies.has(SELECTED_APP_ID_COOKIE_NAME);

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isRootRoute = pathname === "/";
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/event-type");

  // 1. Truly protect (protected-route): require active auth token
  if (isProtectedRoute && !hasToken) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Truly protect (protected-route): require selected application context
  if (isProtectedRoute && !hasApp) {
    const rootUrl = new URL("/", request.url);
    return NextResponse.redirect(rootUrl);
  }

  // 3. Prevent authenticated users from accessing login/register
  if (isAuthRoute && hasToken) {
    if (hasApp) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 4. Handle root route (/)
  // After selecting application, all visits to / redirect to /dashboard
  if (isRootRoute) {
    if (!hasToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (hasApp && searchParams.get("switch") !== "true") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
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
     * - public asset extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
