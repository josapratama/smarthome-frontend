import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token");
  const userRole = request.cookies.get("user_role")?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication - CHECK THIS FIRST
  const publicRoutes = ["/public", "/invites"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // If it's a public route, allow access immediately
  if (isPublicRoute) {
    console.log("[Middleware] Allowing public route:", pathname);
    return NextResponse.next();
  }

  // Auth pages (login, register, etc.)
  const authPages = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];
  const isAuthPage = authPages.some((route) => pathname.startsWith(route));

  // Landing page
  const isLandingPage = pathname === "/";

  // Admin routes (from route group (admin))
  const isAdminRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/devices") ||
    pathname.startsWith("/firmware") ||
    pathname.startsWith("/ota") ||
    pathname.startsWith("/monitoring") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/commands") ||
    pathname.startsWith("/homes") ||
    pathname.startsWith("/rooms") ||
    pathname.startsWith("/alarms") ||
    pathname.startsWith("/ai") ||
    pathname.startsWith("/energy") ||
    pathname.startsWith("/messages") ||
    pathname.startsWith("/help") ||
    pathname.startsWith("/device-config") ||
    pathname.startsWith("/location-management") ||
    pathname.startsWith("/device-management") ||
    pathname.startsWith("/communications") ||
    pathname.startsWith("/room-access") ||
    pathname.startsWith("/security") ||
    pathname.startsWith("/settings-help") ||
    pathname.startsWith("/system-tools") ||
    pathname.startsWith("/profile");

  // User routes
  const isUserRoute = pathname.startsWith("/user");

  // If user is authenticated and trying to access landing page or auth pages, redirect to their dashboard
  if (token && (isLandingPage || isAuthPage)) {
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }
  }

  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!token && !isLandingPage && !isAuthPage) {
    console.log("[Middleware] No token, redirecting to login:", pathname);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based access control
  if (token && userRole) {
    // ADMIN trying to access USER routes
    if (userRole === "ADMIN" && isUserRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // USER trying to access ADMIN routes
    if (userRole === "USER" && isAdminRoute) {
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)"],
};
